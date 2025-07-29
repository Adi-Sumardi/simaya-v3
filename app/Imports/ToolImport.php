<?php

namespace App\Imports;

use App\Models\Tool;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ToolImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $rows
     */

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            Tool::updateOrCreate(
                [
                    'name' => $row['name'],
                ],
                [
                    'code' => $row['code'],
                    'code_name' => $row['code_name'],
                ]
            );
        }
    }
}
