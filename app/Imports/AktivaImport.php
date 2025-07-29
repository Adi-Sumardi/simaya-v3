<?php

namespace App\Imports;

use App\Models\Aktiva;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class AktivaImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return Aktiva::updateOrCreate([
            'name' => $row['name'],
            'code' => $row['code'],
        ]);
    }
}
