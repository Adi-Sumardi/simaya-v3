<?php

namespace App\Imports;

use App\Models\Asset;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsErrors;

class AssetImport implements ToModel, WithHeadingRow, WithValidation, WithBatchInserts, WithChunkReading, SkipsOnError
{
    use SkipsErrors;

    /**
     * @param array $row
     * @return Asset|null
     */
    public function model(array $row): ?Asset
    {
        return new Asset([
            'name' => $row['name'],
            'condition' => $row['condition'] ?? 'bagus',
            'portability' => $row['portability'] ?? 'portable',
            'entries_number' => $row['entries_number'],
            'description' => $row['description'] ?? null,
            'brand' => $row['brand'] ?? null,
            'price' => $row['price'] ?? 0,
            'aquisition' => $row['aquisition'] ?? null,
            'aquisition_date' => $row['aquisition_date'] ?? null,
            'status' => $row['status'] ?? 'active',
            'image' => $row['image'] ?? null,
            'user_id' => $row['user_id'],
            'unit_id' => $row['unit_id'],
            'tool_id' => $row['tool_id'],
            'location_id' => $row['location_id'],
            'category_id' => $row['category_id'],
            'year_id' => $row['year_id'],
            'aktiva_id' => $row['aktiva_id'],
        ]);
    }

    /**
     * Validation rules untuk setiap row
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'condition' => 'nullable|in:bagus,rusak',
            'portability' => 'nullable|in:portable,non-portable',
            'entries_number' => 'required|integer|min:1',
            'description' => 'nullable|string|max:555',
            'brand' => 'nullable|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'aquisition' => 'nullable|string|max:255',
            'aquisition_date' => 'nullable|date',
            'status' => 'nullable|in:active,inactive,deleted,repaired',
            'user_id' => 'required|integer|exists:users,id',
            'unit_id' => 'required|integer|exists:units,id',
            'tool_id' => 'required|integer|exists:tools,id',
            'location_id' => 'required|integer|exists:locations,id',
            'category_id' => 'required|integer|exists:categories,id',
            'year_id' => 'required|integer|exists:years,id',
            'aktiva_id' => 'required|integer|exists:aktivas,id',
        ];
    }

    /**
     * Custom validation messages
     */
    public function customValidationMessages(): array
    {
        return [
            'name.required' => 'Nama aset wajib diisi',
            'entries_number.required' => 'Nomor entri wajib diisi',
            'user_id.exists' => 'User ID tidak ditemukan',
            'unit_id.exists' => 'Unit ID tidak ditemukan',
            'tool_id.exists' => 'Tool ID tidak ditemukan',
            'location_id.exists' => 'Location ID tidak ditemukan',
            'category_id.exists' => 'Category ID tidak ditemukan',
            'year_id.exists' => 'Year ID tidak ditemukan',
            'aktiva_id.exists' => 'Aktiva ID tidak ditemukan',
        ];
    }

    /**
     * Batch insert untuk performa
     */
    public function batchSize(): int
    {
        return 100;
    }

    /**
     * Chunk reading untuk memory efficiency
     */
    public function chunkSize(): int
    {
        return 100;
    }
}
