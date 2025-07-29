<?php

namespace App\Exports;

use App\Models\Aktiva;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AktivaExport implements FromCollection, WithHeadings
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Aktiva::select('name', 'code')->get();
    }

    public function headings(): array
    {
        return [
            'Name',
            'Code',
        ];
    }
}
