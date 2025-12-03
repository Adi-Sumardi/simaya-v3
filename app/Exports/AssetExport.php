<?php

namespace App\Exports;

use App\Models\Asset;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AssetExport implements FromCollection, WithHeadings
{
    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return Asset::with(['unit', 'tool', 'location', 'category', 'year', 'aktiva'])
            ->get()
            ->map(function ($asset) {
                return [
                    'name' => $asset->name,
                    'condition' => $asset->condition,
                    'portability' => $asset->portability,
                    'entries_number' => $asset->entries_number,
                    'description' => $asset->description,
                    'brand' => $asset->brand,
                    'price' => $asset->price,
                    'aquisition' => $asset->aquisition,
                    'aquisition_date' => $asset->aquisition_date,
                    'status' => $asset->status,
                    'image' => $asset->image,
                    'user_id' => $asset->user_id,
                    'unit' => $asset->unit?->name,
                    'tool' => $asset->tool?->name,
                    'location' => $asset->location?->name,
                    'category' => $asset->category?->name,
                    'year' => $asset->year?->year,
                    'aktiva' => $asset->aktiva?->name,
                ];
            });
    }

    public function headings(): array
    {
        return [
            'Name',
            'Condition',
            'Portability',
            'Entries Number',
            'Description',
            'Brand',
            'Price',
            'Aquisition',
            'Aquisition Date',
            'Status',
            'Image',
            'User ID',
            'Unit',
            'Tool',
            'Location',
            'Category',
            'Year',
            'Aktiva',
        ];
    }
}
