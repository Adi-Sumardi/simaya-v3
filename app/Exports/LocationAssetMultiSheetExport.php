<?php

namespace App\Exports;

use App\Models\Location;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\Exportable;

class LocationAssetMultiSheetExport implements WithMultipleSheets
{
    use Exportable;

    protected $unitId;

    public function __construct($unitId = null)
    {
        $this->unitId = $unitId;
    }

    public function sheets(): array
    {
        $sheets = [];

        // Sheet 1: Summary semua lokasi
        $sheets[] = new LocationSummarySheet($this->unitId);

        // Sheet per lokasi dengan detail aset
        $query = Location::with('unit');

        if ($this->unitId) {
            $query->where('unit_id', $this->unitId);
        }

        $locations = $query->orderBy('unit_id')->orderBy('name')->get();

        foreach ($locations as $location) {
            $sheets[] = new LocationDetailSheet($location);
        }

        return $sheets;
    }
}
