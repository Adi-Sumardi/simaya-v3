<?php

namespace App\Filament\Resources\AssetResource\Widgets;

use App\Models\Asset;
use App\Models\Unit;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AssetStats extends BaseWidget
{
    public ?int $unitId = null;
    public int $filterVersion = 0;

    protected function getListeners(): array
    {
        return [
            'refreshAssetStats' => 'updateStats',
        ];
    }

    public function updateStats($unitId): void
    {
        $this->unitId = $unitId;
        $this->filterVersion++;
    }

    protected function getStats(): array
    {
        $assetCount = Asset::query()
            ->when($this->unitId, fn($query) => $query->where('unit_id', $this->unitId))
            ->count();

        $assetActive = Asset::query()
            ->when($this->unitId, fn($query) => $query->where('unit_id', $this->unitId))
            ->where('status', 'active')
            ->count();

        $assetSum = Asset::query()
            ->when($this->unitId, fn($query) => $query->where('unit_id', $this->unitId))
            ->sum('price');

        $formattedAssetSum = 'Rp ' . number_format($assetSum, 0, ',', '.');

        $unitName = $this->unitId
            ? Unit::find($this->unitId)->name
            : null;

        return [
            Stat::make('Total Aset', $assetCount)
                ->description($this->unitId
                        ? "\n " . $unitName
                        : "Jumlah Aset terdata"),
            Stat::make('Aset Aktif', $assetActive),
            Stat::make('Nilai Aset', $formattedAssetSum),
        ];
    }
}
