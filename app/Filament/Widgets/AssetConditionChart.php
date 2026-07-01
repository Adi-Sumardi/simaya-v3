<?php

namespace App\Filament\Widgets;

use App\Models\Asset;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class AssetConditionChart extends ChartWidget
{
    protected static ?string $heading = 'Kondisi Aset';

    protected int|string|array $columnSpan = 1;

    protected static ?int $sort = 4;

    protected static ?string $maxHeight = '250px';

    protected function getType(): string
    {
        return 'doughnut';
    }

    protected function getData(): array
    {
        $user = Auth::user();
        $unitId = ($user->hasRole('Unit') && $user->unit_id) ? $user->unit_id : 'all';

        $cachedData = Cache::remember("dashboard_asset_condition_{$unitId}", 300, function () use ($unitId) {
            $query = Asset::query()->notTransferred();
            if ($unitId !== 'all') {
                $query->where('unit_id', $unitId);
            }
            return [
                'bagus' => (clone $query)->where('condition', 'bagus')->count(),
                'rusak' => (clone $query)->where('condition', 'rusak')->count(),
            ];
        });

        return [
            'labels' => ['Bagus', 'Rusak'],
            'datasets' => [
                [
                    'data' => [$cachedData['bagus'], $cachedData['rusak']],
                    'backgroundColor' => ['#10b981', '#ef4444'],
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
