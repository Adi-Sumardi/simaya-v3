<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Location;
use App\Models\Unit;
use Illuminate\Http\Request;

class YapinetSummaryController extends Controller
{
    /**
     * Ringkasan data aset untuk ditampilkan sebagai summary card + detail
     * view di portal eksternal Yapinet. Bisa difilter per unit lewat ?unit_id=.
     */
    public function summary(Request $request)
    {
        // Yapinet mengirim unit_id dari ruang UUID miliknya sendiri, yang
        // tidak berkorespondensi dengan id integer auto-increment unit lokal
        // Simaya. Sampai ada pemetaan kode unit lintas-sistem, hanya terapkan
        // filter kalau nilainya benar-benar cocok unit lokal — kalau tidak,
        // abaikan filter alih-alih diam-diam mengembalikan hasil kosong.
        $rawUnitId = $request->input('unit_id');
        $unitId = ($rawUnitId && $rawUnitId !== 'all' && Unit::where('id', $rawUnitId)->exists())
            ? $rawUnitId
            : null;

        $query = Asset::query();
        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        $totalCount = (clone $query)->count();
        $totalValue = (float) (clone $query)->sum('price');

        // Breakdown per unit nyata (dipakai frontend Yapinet supaya kartu
        // "Jumlah Aset & Nilai Aset" ikut berubah saat "Filter Unit" dipilih,
        // bukan selalu menampilkan agregat semua unit).
        // Jumlah lokasi/ruangan per unit (dari tabel `locations`, bukan dari
        // aset — ruangan tetap dihitung walau lagi kosong tanpa aset).
        $lokasiCountByUnit = Location::query()
            ->selectRaw('unit_id, COUNT(*) as lokasi_count')
            ->groupBy('unit_id')
            ->pluck('lokasi_count', 'unit_id');

        $byUnit = Asset::query()
            ->selectRaw('unit_id, COUNT(*) as jumlah_aset, SUM(price) as nilai_total_aset')
            ->groupBy('unit_id')
            ->with('unit')
            ->get()
            ->map(fn ($row) => [
                'unit' => $row->unit?->name ?? '-',
                'jumlah_aset' => (int) $row->jumlah_aset,
                'nilai_total_aset' => (float) $row->nilai_total_aset,
                'lokasi_count' => (int) ($lokasiCountByUnit[$row->unit_id] ?? 0),
            ])
            ->values();

        // Sample diambil PER UNIT (bukan limit() global) supaya setiap unit
        // tetap punya baris sendiri untuk difilter di frontend — dengan ribuan
        // aset tersebar di banyak unit, limit() global hampir pasti tidak
        // kebagian unit yang sedang dipilih user.
        $unitIdsToSample = $unitId
            ? [$unitId]
            : (clone $query)->distinct()->pluck('unit_id')->filter()->values()->all();

        $samplePerUnit = function (int $perUnit, \Closure $extraWhere) use ($unitIdsToSample, $query) {
            $rows = collect();
            foreach ($unitIdsToSample as $uid) {
                $chunk = (clone $query)->with('unit')->where('unit_id', $uid);
                $extraWhere($chunk);
                $rows = $rows->concat($chunk->limit($perUnit)->get());
            }
            return $rows;
        };

        // Cap 20/unit — cukup untuk gambaran per unit tanpa payload tak terbatas;
        // frontend menambahkan "Tampilkan lebih banyak" di atas data yang sudah
        // diambil ini (bukan server-side pagination, karena Yapinet cuma baca
        // snapshot cache berkala, tidak fetch live per klik).
        $rusakAssets = $samplePerUnit(20, function ($q) {
            $q->where(function ($w) {
                $w->where('condition', 'rusak')->orWhereIn('status', ['repaired', 'inactive']);
            });
        });

        $asetRusak = $rusakAssets->map(function (Asset $asset) {
            return [
                'nama' => $asset->name,
                'unit' => $asset->unit?->name,
                'tanggal_lapor' => optional($asset->updated_at)->format('Y-m-d'),
                'status' => $this->mapKerusakanStatus($asset),
            ];
        })->values();

        // Aset yang bisa dihitung penyusutannya = punya harga & tanggal
        // perolehan (lihat Asset::canBeDepreciated()) — TIDAK harus punya
        // depreciation_rate kustom, karena aset tanpa nilai kustom tetap
        // disusutkan pakai persentase default global (effective_depreciation_rate,
        // lihat Asset::DEFAULT_DEPRECIATION_RATE).
        $penyusutanAssets = $samplePerUnit(5, function ($q) {
            $q->whereNotNull('aquisition_date')->where('price', '>', 0);
        });

        $penyusutan = $penyusutanAssets->map(function (Asset $asset) {
            return [
                'nama' => $asset->name,
                'unit' => $asset->unit?->name,
                'nilai_awal' => (float) $asset->price,
                'nilai_sekarang' => $asset->book_value,
                'penyusutan_per_tahun' => $asset->effective_depreciation_rate,
            ];
        })->values();

        $rusakCount = $asetRusak->count();
        $rusakRatio = $totalCount > 0 ? $rusakCount / $totalCount : 0;

        if ($rusakCount === 0) {
            $status = 'ok';
            $headline = 'Semua aset dalam kondisi baik';
        } elseif ($rusakRatio > 0.2) {
            $status = 'critical';
            $headline = "{$rusakCount} aset rusak dari total {$totalCount} aset";
        } else {
            $status = 'warning';
            $headline = "{$rusakCount} aset menunggu perbaikan";
        }

        return response()->json([
            'status' => $status,
            'headline' => $headline,
            'metrics' => [
                ['label' => 'Jumlah Aset', 'value' => $totalCount],
                ['label' => 'Nilai Total Aset', 'value' => $totalValue],
                ['label' => 'Aset Rusak', 'value' => $rusakCount],
            ],
            'details' => [
                'jumlah_aset' => $totalCount,
                'nilai_total_aset' => $totalValue,
                'by_unit' => $byUnit,
                'aset_rusak' => $asetRusak,
                'penyusutan' => $penyusutan,
            ],
            'updated_at' => now()->toIso8601String(),
            'detail_path' => null,
        ]);
    }

    /**
     * Terjemahkan kondisi/status aset menjadi label kerusakan yang
     * dikonsumsi Yapinet.
     */
    private function mapKerusakanStatus(Asset $asset): string
    {
        if (in_array($asset->status, ['disposed', 'deleted'], true)) {
            return 'Dihapuskan';
        }

        if ($asset->status === 'repaired') {
            return 'Sedang Diperbaiki';
        }

        return 'Menunggu Perbaikan';
    }
}
