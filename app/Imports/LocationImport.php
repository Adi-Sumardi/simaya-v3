<?php

namespace App\Imports;

use App\Models\Location;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class LocationImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return Location::updateOrCreate([
            'name' => $row['name'],
            'number' => $row['number'],
            'floor' => $row['floor'],
            'unit_id' => $row['unit_id'],
            'user_id' => $row['user_id'],
        ]);
    }
}
