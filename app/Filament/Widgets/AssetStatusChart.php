<?php

namespace App\Filament\Widgets;

use App\Models\Asset;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class AssetStatusChart extends ChartWidget
{
    protected static ?string $heading = 'Status Aset';

    protected int|string|array $columnSpan = 1;

    protected static ?int $sort = 5;

    protected static ?string $maxHeight = '250px';

    protected function getType(): string
    {
        return 'doughnut';
    }

    protected function getData(): array
    {
        $user = Auth::user();
        $unitId = ($user->hasRole('Unit') && $user->unit_id) ? $user->unit_id : 'all';

        $cachedData = Cache::remember("dashboard_asset_status_{$unitId}", 300, function () use ($unitId) {
            $query = Asset::query()->notTransferred();
            if ($unitId !== 'all') {
                $query->where('unit_id', $unitId);
            }
            return [
                'active' => (clone $query)->where('status', 'active')->count(),
                'inactive' => (clone $query)->where('status', 'inactive')->count(),
                'repaired' => (clone $query)->where('status', 'repaired')->count(),
            ];
        });

        return [
            'labels' => ['Aktif', 'Tidak Aktif', 'Diperbaiki'],
            'datasets' => [
                [
                    'data' => [$cachedData['active'], $cachedData['inactive'], $cachedData['repaired']],
                    'backgroundColor' => ['#10b981', '#ef4444', '#f59e0b'],
                    'hoverOffset' => 4,
                ],
            ],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'position' => 'bottom',
                ],
            ],
        ];
    }
}
