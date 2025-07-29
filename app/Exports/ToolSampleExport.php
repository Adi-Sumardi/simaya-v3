<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ToolSampleExport implements FromArray, WithHeadings
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
            'code',
            'code_name',
        ];
    }
}
