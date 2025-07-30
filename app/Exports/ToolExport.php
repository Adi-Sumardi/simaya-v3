<?php

namespace App\Exports;

use App\Models\Tool;
use Maatwebsite\Excel\Concerns\FromCollection;

class ToolExport implements FromCollection
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Tool::select('id', 'name', 'code', 'code_name')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Name',
            'Code',
            'Code Name',
        ];
    }
}
