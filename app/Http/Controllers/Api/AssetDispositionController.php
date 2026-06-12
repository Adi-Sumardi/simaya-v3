<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AssetDisposition;
use App\Models\AssetDispositionItem;
use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AssetDispositionController extends Controller
{
    public function index(Request $request)
    {
        $query = AssetDisposition::with(['processedBy', 'items.asset']);

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('type') && $request->input('type') !== 'all') {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('disposition_number', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%")
                  ->orWhere('recipient_name', 'like', "%{$search}%");
        }

        $perPage = $request->integer('per_page', 10);
        $dispositions = $query->latest()->paginate($perPage);

        return response()->json($dispositions);
    }

    public function store(Request $request)
    {
        $rules = [
            'type' => 'required|in:penghapusan,hibah,sumbangan',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string|max:555',
            'document_number' => 'required|string|max:255',
            'document_date' => 'required|date',
            'document_file' => 'nullable|file|mimes:pdf,jpg,png,doc,docx|max:5120', // 5MB max
            'items' => 'required|array|min:1',
            'items.*.asset_id' => 'required|exists:assets,id',
            'items.*.condition_notes' => 'nullable|string|max:255',
            'items.*.estimated_value' => 'required|numeric|min:0',
        ];

        // Conditional validation: recipient details are required for hibah and sumbangan
        if (in_array($request->input('type'), ['hibah', 'sumbangan'])) {
            $rules['recipient_name'] = 'required|string|max:255';
            $rules['recipient_organization'] = 'required|string|max:255';
            $rules['recipient_address'] = 'required|string|max:555';
            $rules['recipient_phone'] = 'required|string|max:50';
        }

        $validated = $request->validate($rules);

        return DB::transaction(function () use ($validated, $request) {
            $filePath = null;
            if ($request->hasFile('document_file')) {
                $filePath = $request->file('document_file')->store('disposition_docs', 'public');
            }

            $disposition = AssetDisposition::create([
                'type' => $validated['type'],
                'reason' => $validated['reason'],
                'notes' => $validated['notes'] ?? null,
                'document_number' => $validated['document_number'],
                'document_date' => $validated['document_date'],
                'document_file' => $filePath,
                'processed_by' => $request->user()->id,
                'status' => 'draft',
                'recipient_name' => $validated['recipient_name'] ?? null,
                'recipient_organization' => $validated['recipient_organization'] ?? null,
                'recipient_address' => $validated['recipient_address'] ?? null,
                'recipient_phone' => $validated['recipient_phone'] ?? null,
            ]);

            foreach ($validated['items'] as $itemData) {
                AssetDispositionItem::create([
                    'asset_disposition_id' => $disposition->id,
                    'asset_id' => $itemData['asset_id'],
                    'condition_notes' => $itemData['condition_notes'] ?? 'Kondisi saat diajukan',
                    'estimated_value' => $itemData['estimated_value'],
                ]);
            }

            return response()->json([
                'message' => 'Penghapusan/Hibah/Sumbangan berhasil diajukan sebagai draft',
                'disposition' => $disposition->load(['processedBy', 'items.asset'])
            ], 21);
        });
    }

    public function complete($id)
    {
        $disposition = AssetDisposition::findOrFail($id);

        if ($disposition->complete()) {
            return response()->json([
                'message' => 'Penghapusan/Hibah/Sumbangan berhasil diselesaikan. Aset terkait telah dinonaktifkan.',
                'disposition' => $disposition->load(['processedBy', 'items.asset'])
            ]);
        }

        return response()->json([
            'message' => 'Penyelesaian gagal. Pastikan status masih draft.'
        ], 400);
    }

    public function cancel($id)
    {
        $disposition = AssetDisposition::findOrFail($id);

        if ($disposition->cancel()) {
            return response()->json([
                'message' => 'Penghapusan/Hibah/Sumbangan berhasil dibatalkan.',
                'disposition' => $disposition->load(['processedBy', 'items.asset'])
            ]);
        }

        return response()->json([
            'message' => 'Pembatalan gagal. Pastikan status masih draft.'
        ], 400);
    }
}
