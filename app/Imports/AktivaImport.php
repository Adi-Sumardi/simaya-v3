<?php

namespace App\Imports;

use App\Models\Aktiva;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class AktivaImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $rows
     */

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            Aktiva::updateOrCreate(
                [
                    'name' => $row['name'],
                ],
                [
                    'code' => $row['code'],
                ]
            );
        }
    }
}
