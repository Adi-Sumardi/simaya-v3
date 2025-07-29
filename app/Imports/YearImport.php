<?php

namespace App\Imports;

use App\Models\Year;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class YearImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $rows
     */

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            Year::updateOrCreate(
                [
                    'year' => $row['year'],
                ],
                [
                    'code' => $row['code'],
                ]
            );
        }
    }
}
