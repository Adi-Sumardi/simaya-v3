<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AssetController extends Controller
{
    public function index(Request $request)
    {
        $query = Asset::with(['unit', 'location', 'tool', 'category', 'year', 'aktiva']);

        // Scope to Unit if user has Unit role or non-super-admin with unit_id
        $user = $request->user();
        if ($user && ($user->hasRole('Unit') || $user->role === 'Unit' || ($user->unit_id && !$user->hasRole('super_admin')))) {
            $query->where('unit_id', $user->unit_id);
        } else {
            if ($request->filled('unit_id') && $request->input('unit_id') !== 'all') {
                $query->where('unit_id', $request->input('unit_id'));
            }
        }

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('entries_number', 'like', "%{$search}%");
            });
        }

        // Advanced filters
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $statuses = explode(',', $request->input('status'));
            if (count($statuses) > 1) {
                $query->whereIn('status', $statuses);
            } else {
                $query->where('status', $request->input('status'));
            }
        }

        if ($request->filled('condition') && $request->input('condition') !== 'all') {
            $query->where('condition', $request->input('condition'));
        }

        if ($request->filled('category_id') && $request->input('category_id') !== 'all') {
            $query->where('category_id', $request->input('category_id'));
        }

        if ($request->filled('location_id') && $request->input('location_id') !== 'all') {
            $query->where('location_id', $request->input('location_id'));
        }

        if ($request->filled('depreciation_status') && $request->input('depreciation_status') !== 'all') {
            $status = $request->input('depreciation_status');
            $effectiveRate = 'COALESCE(NULLIF(depreciation_rate, 0), ' . Asset::DEFAULT_DEPRECIATION_RATE . ')';
            $usefulLifeMonths = "((100 / {$effectiveRate}) * 12)";
            $monthsElapsed = 'TIMESTAMPDIFF(MONTH, aquisition_date, NOW())';
            $hasData = "price IS NOT NULL AND price > 0 AND aquisition_date IS NOT NULL";
            $rateNotZero = '(depreciation_rate IS NULL OR depreciation_rate <> 0)';

            match ($status) {
                'fully_depreciated' => $query->whereRaw("{$hasData} AND {$rateNotZero} AND {$monthsElapsed} >= {$usefulLifeMonths}"),
                'depreciating' => $query->whereRaw("{$hasData} AND {$rateNotZero} AND {$monthsElapsed} < {$usefulLifeMonths}"),
                'not_depreciating' => $query->whereRaw("{$hasData}")->where('depreciation_rate', 0),
                'no_data' => $query->where(function ($q) {
                    $q->whereNull('price')->orWhere('price', '<=', 0)->orWhereNull('aquisition_date');
                }),
                default => null,
            };
        }

        if ($request->filled('ids')) {
            $ids = explode(',', $request->input('ids'));
            $query->whereIn('id', $ids);
        }

        $perPage = min(max($request->integer('per_page', 10), 1), 100);
        $assets = $query->orderBy('id', 'desc')->paginate($perPage);

        return response()->json($assets);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'condition' => 'required|in:bagus,rusak',
            'portability' => 'required|in:portable,fixtures,non-portable',
            'entries_number' => 'required|integer',
            'description' => 'nullable|string|max:555',
            'brand' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'depreciation_rate' => 'nullable|numeric|min:0|max:100',
            'aquisition' => 'nullable|string|max:255',
            'aquisition_date' => 'nullable|date',
            'status' => 'required|in:active,inactive,deleted,repaired,transferred,disposed',
            'unit_id' => 'required|exists:units,id',
            'tool_id' => 'required|exists:tools,id',
            'location_id' => 'required|exists:locations,id',
            'category_id' => 'required|exists:categories,id',
            'year_id' => 'required|exists:years,id',
            'aktiva_id' => 'required|exists:aktivas,id',
            'image_file' => 'nullable|image|max:2048' // 2MB max
        ]);

        $user = $request->user();
        if ($user && ($user->hasRole('Unit') || $user->role === 'Unit' || ($user->unit_id && !$user->hasRole('super_admin')))) {
            $validated['unit_id'] = $user->unit_id;
        }

        $validated['user_id'] = $request->user()?->id ?? auth('sanctum')->id() ?? 1;

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('assets', 'public');
            $validated['image'] = $path;
        }

        $asset = Asset::create($validated);

        return response()->json([
            'message' => 'Aset berhasil ditambahkan',
            'asset' => $asset->load(['unit', 'location', 'tool', 'category', 'year', 'aktiva'])
        ], 201);
    }

    public function show($id)
    {
        $asset = Asset::with(['unit', 'location', 'tool', 'category', 'year', 'aktiva'])->findOrFail($id);
        return response()->json($asset);
    }

    public function update(Request $request, $id)
    {
        $asset = Asset::findOrFail($id);
        $user = $request->user();

        if ($user && ($user->hasRole('Unit') || $user->role === 'Unit' || ($user->unit_id && !$user->hasRole('super_admin')))) {
            if ($asset->unit_id !== $user->unit_id) {
                return response()->json(['message' => 'Anda tidak memiliki akses untuk mengubah aset unit lain.'], 403);
            }
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'condition' => 'required|in:bagus,rusak',
            'portability' => 'required|in:portable,fixtures,non-portable',
            'entries_number' => 'required|integer',
            'description' => 'nullable|string|max:555',
            'brand' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'depreciation_rate' => 'nullable|numeric|min:0|max:100',
            'aquisition' => 'nullable|string|max:255',
            'aquisition_date' => 'nullable|date',
            'status' => 'required|in:active,inactive,deleted,repaired,transferred,disposed',
            'unit_id' => 'required|exists:units,id',
            'tool_id' => 'required|exists:tools,id',
            'location_id' => 'required|exists:locations,id',
            'category_id' => 'required|exists:categories,id',
            'year_id' => 'required|exists:years,id',
            'aktiva_id' => 'required|exists:aktivas,id',
            'image_file' => 'nullable|image|max:2048'
        ]);

        if ($user && ($user->hasRole('Unit') || $user->role === 'Unit' || ($user->unit_id && !$user->hasRole('super_admin')))) {
            $validated['unit_id'] = $user->unit_id;
        }

        if ($request->hasFile('image_file')) {
            // Delete old image if it exists
            if ($asset->image && Storage::disk('public')->exists($asset->image)) {
                Storage::disk('public')->delete($asset->image);
            }
            $path = $request->file('image_file')->store('assets', 'public');
            $validated['image'] = $path;
        }

        $asset->update($validated);

        return response()->json([
            'message' => 'Aset berhasil diperbarui',
            'asset' => $asset->load(['unit', 'location', 'tool', 'category', 'year', 'aktiva'])
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $asset = Asset::findOrFail($id);
        $user = $request->user();

        if ($user && ($user->hasRole('Unit') || $user->role === 'Unit' || ($user->unit_id && !$user->hasRole('super_admin')))) {
            if ($asset->unit_id !== $user->unit_id) {
                return response()->json(['message' => 'Anda tidak memiliki akses untuk menghapus aset unit lain.'], 403);
            }
        }

        $asset->delete();

        return response()->json([
            'message' => 'Aset berhasil dihapus'
        ]);
    }

    public function bulkUpdate(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:assets,id',
            'unit_id' => 'required|exists:units,id',
            'location_id' => 'required|exists:locations,id',
        ]);

        $user = $request->user();
        $query = Asset::whereIn('id', $validated['ids']);

        if ($user && ($user->hasRole('Unit') || $user->role === 'Unit' || ($user->unit_id && !$user->hasRole('super_admin')))) {
            $query->where('unit_id', $user->unit_id);
            $validated['unit_id'] = $user->unit_id;
        }

        $query->update([
            'unit_id' => $validated['unit_id'],
            'location_id' => $validated['location_id']
        ]);

        return response()->json([
            'message' => 'Aset massal berhasil diperbarui'
        ]);
    }

    public function bulkAddPhoto(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:assets,id',
            'image_file' => 'required|image|max:2048'
        ]);

        $path = $request->file('image_file')->store('assets', 'public');
        $user = $request->user();
        $query = Asset::whereIn('id', $validated['ids']);

        if ($user && ($user->hasRole('Unit') || $user->role === 'Unit' || ($user->unit_id && !$user->hasRole('super_admin')))) {
            $query->where('unit_id', $user->unit_id);
        }

        $query->update([
            'image' => $path
        ]);

        return response()->json([
            'message' => 'Foto massal berhasil dipasang ke aset',
            'image_url' => asset('storage/' . $path)
        ]);
    }

    public function stats(Request $request)
    {
        $user = $request->user();
        $query = Asset::query();

        if ($user && ($user->hasRole('Unit') || $user->role === 'Unit' || ($user->unit_id && !$user->hasRole('super_admin')))) {
            $query->where('unit_id', $user->unit_id);
        } else {
            $unitId = $request->input('unit_id');
            if ($unitId && $unitId !== 'all') {
                $query->where('unit_id', $unitId);
            }
        }

        $totalCount = (clone $query)->count();
        $totalValue = (clone $query)->sum('price');

        $conditions = (clone $query)->selectRaw('`condition`, count(*) as count')
            ->groupBy('condition')
            ->pluck('count', 'condition')
            ->all();

        $statuses = (clone $query)->selectRaw('`status`, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->all();

        return response()->json([
            'total_assets' => $totalCount,
            'total_value' => (float) $totalValue,
            'conditions' => [
                'bagus' => $conditions['bagus'] ?? 0,
                'rusak' => $conditions['rusak'] ?? 0,
            ],
            'statuses' => [
                'active' => $statuses['active'] ?? 0,
                'repaired' => $statuses['repaired'] ?? 0,
                'inactive' => $statuses['inactive'] ?? 0,
                'deleted' => $statuses['deleted'] ?? 0,
            ]
        ]);
    }

    public function depreciationStats(Request $request)
    {
        $user = $request->user();
        $query = Asset::query()->notTransferred();

        if ($user && ($user->hasRole('Unit') || $user->role === 'Unit' || ($user->unit_id && !$user->hasRole('super_admin')))) {
            $query->where('unit_id', $user->unit_id);
        } else {
            $unitId = $request->input('unit_id');
            if ($unitId && $unitId !== 'all') {
                $query->where('unit_id', $unitId);
            }
        }

        $categoryId = $request->input('category_id');
        if ($categoryId && $categoryId !== 'all') {
            $query->where('category_id', $categoryId);
        }

        $assets = $query->get();

        $totalPrice = 0;
        $totalAccumulated = 0;
        $totalBookValue = 0;
        $counts = [
            'fully_depreciated' => 0,
            'depreciating' => 0,
            'not_depreciating' => 0,
            'no_data' => 0,
        ];

        foreach ($assets as $asset) {
            $totalPrice += (float) ($asset->price ?? 0);
            $totalAccumulated += (float) ($asset->accumulated_depreciation ?? 0);
            $totalBookValue += (float) ($asset->book_value ?? 0);

            $status = $asset->depreciation_status;
            if (isset($counts[$status])) {
                $counts[$status]++;
            }
        }

        return response()->json([
            'total_assets' => count($assets),
            'total_price' => $totalPrice,
            'total_accumulated_depreciation' => $totalAccumulated,
            'total_book_value' => $totalBookValue,
            'status_counts' => $counts,
        ]);
    }

    public function publicDetail($id)
    {
        $asset = Asset::with(['unit', 'location', 'tool', 'category', 'year', 'aktiva', 'images'])
            ->findOrFail($id);

        return response()->json($asset);
    }

    public function publicLocationDetail($id)
    {
        $location = \App\Models\Location::with('unit')->findOrFail($id);
        $assets = Asset::with(['unit', 'tool', 'category', 'year', 'aktiva'])
            ->where('location_id', $id)
            ->notTransferred()
            ->get();

        return response()->json([
            'location' => $location,
            'assets' => $assets,
            'total_assets' => $assets->count(),
            'good_count' => $assets->where('condition', 'bagus')->count(),
            'damaged_count' => $assets->where('condition', 'rusak')->count(),
        ]);
    }
}
