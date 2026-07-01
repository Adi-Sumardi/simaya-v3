<?php

namespace App\Filament\Widgets;

use App\Models\Asset;
use App\Models\AssetTransfer;
use App\Models\AssetDisposition;
use App\Models\Location;
use App\Models\Unit;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class StatsDashboard extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $user = Auth::user();

        // Role Unit: stats untuk unit mereka saja
        if ($user->hasRole('Unit') && $user->unit_id) {
            return $this->getUnitStats($user->unit_id);
        }

        // Role Admin/Manager: stats keseluruhan
        return $this->getAdminStats();
    }

    protected function getAdminStats(): array
    {
        $cachedData = Cache::remember('dashboard_admin_stats', 300, function () {
            $totalAssets = Asset::notTransferred()->count();
            return [
                'totalAssets' => $totalAssets,
                'totalValue' => Asset::notTransferred()->sum('price'),
                'goodAssets' => Asset::notTransferred()->where('condition', 'bagus')->count(),
                'damagedAssets' => Asset::notTransferred()->where('condition', 'rusak')->count(),
                'activeAssets' => Asset::notTransferred()->where('status', 'active')->count(),
                'pendingTransfers' => AssetTransfer::where('status', 'pending')->count(),
                'totalUnits' => Unit::count(),
                'totalLocations' => Location::count(),
            ];
        });

        $totalAssets = $cachedData['totalAssets'];
        $goodAssets = $cachedData['goodAssets'];
        $damagedAssets = $cachedData['damagedAssets'];
        $activeAssets = $cachedData['activeAssets'];
        $goodPercent = $totalAssets > 0 ? round($goodAssets / $totalAssets * 100) : 0;
        $activePercent = $totalAssets > 0 ? round($activeAssets / $totalAssets * 100) : 0;

        return [
            Stat::make('Total Aset', number_format($totalAssets))
                ->description("{$cachedData['totalUnits']} Unit | {$cachedData['totalLocations']} Lokasi")
                ->descriptionIcon('heroicon-o-cube')
                ->color('primary')
                ->chart($this->getAssetTrend()),

            Stat::make('Nilai Total Aset', 'Rp ' . number_format($cachedData['totalValue'], 0, ',', '.'))
                ->description('Total nilai semua aset aktif')
                ->descriptionIcon('heroicon-o-banknotes')
                ->color('success'),

            Stat::make('Kondisi Bagus', number_format($goodAssets))
                ->description("{$goodPercent}% dari total | Rusak: {$damagedAssets}")
                ->descriptionIcon('heroicon-o-check-circle')
                ->color($damagedAssets > 10 ? 'warning' : 'success'),

            Stat::make('Aset Aktif', number_format($activeAssets))
                ->description("{$activePercent}% dari total aset")
                ->descriptionIcon('heroicon-o-bolt')
                ->color('info'),

            Stat::make('Transfer Pending', $cachedData['pendingTransfers'])
                ->description($cachedData['pendingTransfers'] > 0 ? 'Menunggu persetujuan' : 'Tidak ada pending')
                ->descriptionIcon('heroicon-o-arrow-path-rounded-square')
                ->color($cachedData['pendingTransfers'] > 0 ? 'warning' : 'gray'),

            Stat::make('Aset Rusak', number_format($damagedAssets))
                ->description('Perlu perhatian')
                ->descriptionIcon('heroicon-o-exclamation-triangle')
                ->color($damagedAssets > 0 ? 'danger' : 'success'),
        ];
    }

    protected function getUnitStats(int $unitId): array
    {
        $unit = Unit::find($unitId);
        $unitName = $unit?->name ?? 'Unit';

        $cachedData = Cache::remember("dashboard_unit_stats_{$unitId}", 300, function () use ($unitId) {
            $totalAssets = Asset::where('unit_id', $unitId)->notTransferred()->count();
            return [
                'totalAssets' => $totalAssets,
                'totalValue' => Asset::where('unit_id', $unitId)->notTransferred()->sum('price'),
                'goodAssets' => Asset::where('unit_id', $unitId)->notTransferred()->where('condition', 'bagus')->count(),
                'damagedAssets' => Asset::where('unit_id', $unitId)->notTransferred()->where('condition', 'rusak')->count(),
                'activeAssets' => Asset::where('unit_id', $unitId)->notTransferred()->where('status', 'active')->count(),
                'totalLocations' => Location::where('unit_id', $unitId)->count(),
            ];
        });

        $totalAssets = $cachedData['totalAssets'];
        $goodAssets = $cachedData['goodAssets'];
        $damagedAssets = $cachedData['damagedAssets'];
        $activeAssets = $cachedData['activeAssets'];
        $goodPercent = $totalAssets > 0 ? round($goodAssets / $totalAssets * 100) : 0;

        return [
            Stat::make('Total Aset ' . $unitName, number_format($totalAssets))
                ->description("{$cachedData['totalLocations']} Lokasi")
                ->descriptionIcon('heroicon-o-cube')
                ->color('primary'),

            Stat::make('Nilai Aset', 'Rp ' . number_format($cachedData['totalValue'], 0, ',', '.'))
                ->description('Total nilai aset unit')
                ->descriptionIcon('heroicon-o-banknotes')
                ->color('success'),

            Stat::make('Kondisi Bagus', number_format($goodAssets))
                ->description("{$goodPercent}% | Rusak: {$damagedAssets}")
                ->descriptionIcon('heroicon-o-check-circle')
                ->color($damagedAssets > 5 ? 'warning' : 'success'),

            Stat::make('Aset Aktif', number_format($activeAssets))
                ->description('Aset yang aktif digunakan')
                ->descriptionIcon('heroicon-o-bolt')
                ->color('info'),
        ];
    }

    protected function getAssetTrend(): array
    {
        // Simple trend data (last 7 data points)
        return [7, 3, 4, 5, 6, 3, 5];
    }
}
