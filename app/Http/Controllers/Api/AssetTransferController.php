<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssetTransfer;
use App\Models\AssetTransferItem;
use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssetTransferController extends Controller
{
    public function index(Request $request)
    {
        $query = AssetTransfer::with([
            'fromUnit',
            'fromLocation',
            'toLocation.unit',
            'requestedBy',
            'approvedBy',
            'items.asset'
        ]);

        $user = $request->user();
        if ($user && ($user->hasRole('Unit') || $user->role === 'Unit' || ($user->unit_id && !$user->hasRole('super_admin')))) {
            $query->where(function($q) use ($user) {
                $q->where('from_unit_id', $user->unit_id)
                  ->orWhereHas('toLocation', fn($sq) => $sq->where('unit_id', $user->unit_id));
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('transfer_number', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%");
        }

        $perPage = $request->integer('per_page', 10);
        $transfers = $query->latest()->paginate($perPage);

        return response()->json($transfers);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'from_unit_id' => 'required|exists:units,id',
            'from_location_id' => 'required|exists:locations,id',
            'to_location_id' => 'required|exists:locations,id',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string|max:555',
            'asset_ids' => 'required|array|min:1',
            'asset_ids.*' => 'exists:assets,id',
        ]);

        if ($user && ($user->hasRole('Unit') || $user->role === 'Unit' || ($user->unit_id && !$user->hasRole('super_admin')))) {
            $validated['from_unit_id'] = $user->unit_id;
        }

        return DB::transaction(function () use ($validated, $request) {
            $transfer = AssetTransfer::create([
                'from_unit_id' => $validated['from_unit_id'],
                'from_location_id' => $validated['from_location_id'],
                'to_location_id' => $validated['to_location_id'],
                'reason' => $validated['reason'],
                'notes' => $validated['notes'] ?? null,
                'requested_by' => $request->user()->id,
                'status' => 'pending',
                'requested_at' => now(),
            ]);

            foreach ($validated['asset_ids'] as $assetId) {
                AssetTransferItem::create([
                    'asset_transfer_id' => $transfer->id,
                    'asset_id' => $assetId,
                    'condition_notes' => 'Kondisi saat transfer diajukan',
                    'is_verified' => false,
                ]);
            }

            return response()->json([
                'message' => 'Mutasi/Transfer berhasil diajukan',
                'transfer' => $transfer->load(['fromUnit', 'fromLocation', 'toLocation', 'requestedBy', 'items.asset'])
            ], 201);
        });
    }

    public function approve(Request $request, $id)
    {
        $transfer = AssetTransfer::findOrFail($id);

        if ($transfer->approve($request->user())) {
            return response()->json([
                'message' => 'Mutasi/Transfer berhasil disetujui',
                'transfer' => $transfer->load(['fromUnit', 'fromLocation', 'toLocation', 'requestedBy', 'approvedBy', 'items.asset'])
            ]);
        }

        return response()->json([
            'message' => 'Persetujuan gagal. Pastikan status mutasi pending dan memiliki item.'
        ], 400);
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:255'
        ]);

        $transfer = AssetTransfer::findOrFail($id);

        if ($transfer->reject($request->user(), $request->input('reason'))) {
            return response()->json([
                'message' => 'Mutasi/Transfer berhasil ditolak',
                'transfer' => $transfer->load(['fromUnit', 'fromLocation', 'toLocation', 'requestedBy', 'approvedBy', 'items.asset'])
            ]);
        }

        return response()->json([
            'message' => 'Penolakan gagal. Pastikan status mutasi pending.'
        ], 400);
    }

    public function complete($id)
    {
        $transfer = AssetTransfer::with(['toLocation', 'items.asset'])->findOrFail($id);

        if ($transfer->complete()) {
            // Also update the unit of the assets to match the destination location's unit_id
            $toUnitId = $transfer->toLocation->unit_id;
            foreach ($transfer->items as $item) {
                $item->asset->update([
                    'unit_id' => $toUnitId
                ]);
            }

            return response()->json([
                'message' => 'Mutasi/Transfer berhasil diselesaikan dan aset telah berpindah tempat.',
                'transfer' => $transfer->load(['fromUnit', 'fromLocation', 'toLocation', 'requestedBy', 'approvedBy', 'items.asset'])
            ]);
        }

        return response()->json([
            'message' => 'Penyelesaian gagal. Pastikan mutasi sudah disetujui.'
        ], 400);
    }

    public function printBA($id)
    {
        $transfer = AssetTransfer::with([
            'fromUnit',
            'fromLocation',
            'toLocation.unit',
            'requestedBy',
            'approvedBy',
            'items.asset'
        ])->findOrFail($id);

        return response()->json([
            'title' => 'BERITA ACARA MUTASI/TRANSFER ASET',
            'number' => $transfer->transfer_number,
            'date' => $transfer->completed_at ? $transfer->completed_at->toDateString() : now()->toDateString(),
            'from_unit' => $transfer->fromUnit->name,
            'from_location' => $transfer->fromLocation->name,
            'to_unit' => $transfer->toLocation->unit->name ?? $transfer->fromUnit->name,
            'to_location' => $transfer->toLocation->name,
            'reason' => $transfer->reason,
            'notes' => $transfer->notes,
            'requester' => $transfer->requestedBy->name,
            'approver' => $transfer->approvedBy ? $transfer->approvedBy->name : 'N/A',
            'items' => $transfer->items->map(function ($item) {
                return [
                    'asset_name' => $item->asset->name,
                    'brand' => $item->asset->brand,
                    'entries_number' => $item->asset->entries_number,
                    'condition' => $item->asset->condition,
                ];
            })
        ]);
    }

    public function publicDetail($id)
    {
        $transfer = AssetTransfer::with([
            'fromUnit',
            'fromLocation',
            'toLocation.unit',
            'requestedBy',
            'approvedBy',
            'items.asset.unit',
            'items.asset.location',
        ])->findOrFail($id);

        return response()->json($transfer);
    }
}
