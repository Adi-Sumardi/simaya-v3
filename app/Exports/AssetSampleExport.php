<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AssetSampleExport implements FromArray, WithHeadings
{
    protected array $data;

    public function __construct(array $data = [])
    {
        $this->data = $data;
    }

    public function array(): array
    {
        return $this->data;
    }

    public function headings(): array
    {
        return [
            'name',
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
            'aktiva_id',
        ];
    }
}
