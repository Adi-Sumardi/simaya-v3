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

        if ($request->filled('unit_id') && $request->input('unit_id') !== 'all') {
            $query->where('unit_id', $request->input('unit_id'));
        }

        if ($request->filled('ids')) {
            $ids = explode(',', $request->input('ids'));
            $query->whereIn('id', $ids);
        }

        $perPage = $request->integer('per_page', 10);
        $assets = $query->latest()->paginate($perPage);

        return response()->json($assets);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'condition' => 'required|in:bagus,rusak',
            'portability' => 'required|in:portable,non-portable',
            'entries_number' => 'required|integer',
            'description' => 'nullable|string|max:555',
            'brand' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
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

        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('assets', 'public');
            $validated['image'] = $path;
        }

        $asset = Asset::create($validated);

        return response()->json([
            'message' => 'Aset berhasil ditambahkan',
            'asset' => $asset->load(['unit', 'location', 'tool', 'category', 'year', 'aktiva'])
        ], 21);
    }

    public function show($id)
    {
        $asset = Asset::with(['unit', 'location', 'tool', 'category', 'year', 'aktiva'])->findOrFail($id);
        return response()->json($asset);
    }

    public function update(Request $request, $id)
    {
        $asset = Asset::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'condition' => 'required|in:bagus,rusak',
            'portability' => 'required|in:portable,non-portable',
            'entries_number' => 'required|integer',
            'description' => 'nullable|string|max:555',
            'brand' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
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

    public function destroy($id)
    {
        $asset = Asset::findOrFail($id);
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

        Asset::whereIn('id', $validated['ids'])->update([
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

        Asset::whereIn('id', $validated['ids'])->update([
            'image' => $path
        ]);

        return response()->json([
            'message' => 'Foto massal berhasil dipasang ke aset',
            'image_url' => asset('storage/' . $path)
        ]);
    }

    public function stats(Request $request)
    {
        $unitId = $request->input('unit_id');

        $query = Asset::query();
        if ($unitId && $unitId !== 'all') {
            $query->where('unit_id', $unitId);
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
}
