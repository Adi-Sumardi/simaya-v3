<?php

namespace App\Imports;

use App\Models\AppModelsAsset;
use App\Models\Asset;
use Maatwebsite\Excel\Concerns\ToCollection;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class AssetImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $rows
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            Asset::updateOrCreate(
                [
                    'name' => $row['name'],
                    'entries_number' => $row['entries_number'],
                    'location_id' => $row['location_id'],
                ],
                [
                    'condition' => $row['condition'],
                    'portability' => $row['portability'],
                    'description' => $row['description'],
                    'brand' => $row['brand'],
                    'price' => $row['price'],
                    'aquisition' => $row['aquisition'],
                    'aquisition_date' => $row['aquisition_date'],
                    'status' => $row['status'],
                    'image' => $row['image'],
                    'user_id' => $row['user_id'],
                    'unit_id' => $row['unit_id'],
                    'tool_id' => $row['tool_id'],
                    'category_id' => $row['category_id'],
                    'year_id' => $row['year_id'],
                    'aktiva_id' => $row['aktiva_id'],
                ]
            );
        }
    }
}
