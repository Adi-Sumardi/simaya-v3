<?php

namespace App\Filament\Resources\AssetResource\Widgets;

use App\Models\Asset;
use App\Models\Location;
use App\Models\Unit;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class AssetStats extends BaseWidget
{
    public ?int $unitId = null;
    public ?int $locationId = null;
    public int $filterVersion = 0;

    // Disable polling to improve performance - stats will refresh on page load/tab change
    protected static ?string $pollingInterval = null;

    protected function getListeners(): array
    {
        return [
            'refreshAssetStats' => 'updateStats',
        ];
    }

    public function updateStats($unitId, $locationId = null): void
    {
        $this->unitId = $unitId;
        $this->locationId = $locationId;
        $this->filterVersion++;
    }

    protected function getStats(): array
    {
        // Query konsisten dengan table (include soft deleted, exclude transferred)
        $stats = Asset::withoutGlobalScopes([SoftDeletingScope::class])
            ->notTransferred()
            ->when($this->unitId, fn($query) => $query->where('unit_id', $this->unitId))
            ->when($this->locationId, fn($query) => $query->where('location_id', $this->locationId))
            ->selectRaw('
                COUNT(*) as total_count,
                SUM(CASE WHEN status = "active" THEN 1 ELSE 0 END) as active_count,
                SUM(CASE WHEN status = "inactive" THEN 1 ELSE 0 END) as inactive_count,
                SUM(CASE WHEN status = "repaired" THEN 1 ELSE 0 END) as repaired_count,
                SUM(CASE WHEN `condition` = "bagus" THEN 1 ELSE 0 END) as good_count,
                SUM(CASE WHEN `condition` = "rusak" THEN 1 ELSE 0 END) as damaged_count,
                COALESCE(SUM(price), 0) as total_price
            ')
            ->first();

        $formattedAssetSum = 'Rp ' . number_format($stats->total_price ?? 0, 0, ',', '.');

        // Get filter description
        $filterDescription = 'Semua Unit';
        if ($this->locationId) {
            $locationName = Location::where('id', $this->locationId)->value('name');
            $filterDescription = "Lokasi: {$locationName}";
        } elseif ($this->unitId) {
            $unitName = Unit::where('id', $this->unitId)->value('name');
            $filterDescription = "Unit: {$unitName}";
        }

        $totalCount = $stats->total_count ?? 0;
        $activeCount = $stats->active_count ?? 0;
        $inactiveCount = $stats->inactive_count ?? 0;
        $repairedCount = $stats->repaired_count ?? 0;
        $goodCount = $stats->good_count ?? 0;
        $damagedCount = $stats->damaged_count ?? 0;

        // Hitung persentase
        $activePercent = $totalCount > 0 ? round($activeCount / $totalCount * 100) : 0;
        $goodPercent = $totalCount > 0 ? round($goodCount / $totalCount * 100) : 0;

        return [
            Stat::make('Total Aset', number_format($totalCount))
                ->description($filterDescription)
                ->descriptionIcon('heroicon-o-cube')
                ->color('primary'),

            Stat::make('Aset Aktif', number_format($activeCount))
                ->description("{$activePercent}% dari total | Inactive: {$inactiveCount} | Diperbaiki: {$repairedCount}")
                ->descriptionIcon('heroicon-o-check-circle')
                ->color('success'),

            Stat::make('Kondisi Bagus', number_format($goodCount))
                ->description("{$goodPercent}% bagus | Rusak: {$damagedCount}")
                ->descriptionIcon('heroicon-o-hand-thumb-up')
                ->color($damagedCount > 0 ? 'warning' : 'success'),

            Stat::make('Nilai Aset', $formattedAssetSum)
                ->description('Total nilai semua aset')
                ->descriptionIcon('heroicon-o-banknotes')
                ->color('info'),
        ];
    }
}
