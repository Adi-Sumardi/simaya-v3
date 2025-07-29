<?php

namespace App\Imports;

use App\Models\Location;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class LocationImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $rows
     */

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            Location::updateOrCreate(
                [
                    'name' => $row['name'],
                    'number' => $row['number'],
                ],
                [
                    'floor' => $row['floor'],
                    'unit_id' => $row['unit_id'],
                    'user_id' => $row['user_id'],
                ]
            );
        }
    }
}
