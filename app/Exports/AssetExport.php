<?php

namespace App\Exports;

use App\Models\AppModelsAsset;
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
        return Asset::select('name',
                            'condition',
                            'portability',
                            'entries_number',
                            'description',
                            'brand',
                            'price',
                            'aquisition',
                            'aquisition_date',
                            'status',
                            'image',
                            'user_id',
                            'unit_id',
                            'tool_id',
                            'location_id',
                            'category_id',
                            'year_id',
                            'aktiva_id',)->get();
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
            'Unit ID',
            'Tool ID',
            'Location ID',
            'Category ID',
            'Year ID',
            'Aktiva ID',
        ];
    }
}
