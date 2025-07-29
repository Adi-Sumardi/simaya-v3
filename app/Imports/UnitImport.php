<?php

namespace App\Imports;

use App\Models\Unit;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class UnitImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $rows
     */

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            Unit::updateOrCreate(
                [
                    'name' => $row['name'],
                ],
                [
                    'number' => $row['number'],
                ]
            );
        }
    }
}
