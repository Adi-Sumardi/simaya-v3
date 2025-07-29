<?php

namespace App\Imports;

use App\Models\Tool;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ToolImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return Tool::updateOrCreate([
            'name' => $row['name'],
            'code' => $row['code'],
            'code_name' => $row['code_name'],
        ]);
    }
}
