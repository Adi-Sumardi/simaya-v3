<?php

namespace App\Exports;

use App\Models\Asset;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AssetDepreciationExport implements FromCollection, WithHeadings
{
    public function __construct(protected ?int $unitId = null, protected ?int $categoryId = null)
    {
    }

    public function collection()
    {
        return Asset::with(['unit', 'location', 'category'])
            ->notTransferred()
            ->when($this->unitId, fn (Builder $query) => $query->where('unit_id', $this->unitId))
            ->when($this->categoryId, fn (Builder $query) => $query->where('category_id', $this->categoryId))
            ->get()
            ->map(function (Asset $asset) {
                return [
                    'name' => $asset->name,
                    'entries_number' => $asset->entries_number,
                    'unit' => $asset->unit?->name,
                    'location' => $asset->location?->name,
                    'category' => $asset->category?->name,
                    'aquisition_date' => $asset->aquisition_date?->format('d-m-Y'),
                    'price' => $asset->price,
                    'accumulated_depreciation' => $asset->accumulated_depreciation,
                    'book_value' => $asset->book_value,
                    'depreciation_percent' => $asset->depreciation_percent !== null
                        ? round($asset->depreciation_percent, 1)
                        : null,
                    'status' => match ($asset->depreciation_status) {
                        'fully_depreciated' => 'Habis Susut',
                        'depreciating' => 'Menyusut',
                        default => 'Data Kurang',
                    },
                ];
            });
    }

    public function headings(): array
    {
        return [
            'Nama Aset',
            'No. Aset',
            'Unit',
            'Lokasi',
            'Kategori',
            'Tanggal Perolehan',
            'Harga Beli',
            'Akumulasi Penyusutan',
            'Nilai Buku',
            'Persentase Susut (%)',
            'Status',
        ];
    }
}
