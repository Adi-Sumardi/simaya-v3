<?php

namespace App\Exports;

use App\Models\AppModelsYear;
use App\Models\Year;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class YearExport implements FromCollection, WithHeadings
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Year::select('year', 'code')->get();
    }

    public function headings(): array
    {
        return [
            'Year',
            'Code',
        ];
    }
}
