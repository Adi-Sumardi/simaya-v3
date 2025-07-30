<?php

namespace App\Exports;

use App\Models\AppModelsUnit;
use App\Models\Unit;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class UnitExport implements FromCollection, WithHeadings
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Unit::select('id', 'name', 'number')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Name',
            'Number',
        ];
    }
}
