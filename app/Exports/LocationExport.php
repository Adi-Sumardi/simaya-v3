<?php

namespace App\Exports;

use App\Models\Location;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class LocationExport implements FromCollection, WithHeadings
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Location::select('id', 'name', 'number', 'floor', 'unit_id', 'user_id')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Name',
            'Number',
            'Floor',
            'Unit ID',
            'User ID',
        ];
    }
}
