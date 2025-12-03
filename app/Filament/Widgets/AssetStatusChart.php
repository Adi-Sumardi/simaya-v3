<?php

namespace App\Filament\Widgets;

use App\Models\Asset;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Auth;

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
        $query = Asset::query()->notTransferred();

        // Role Unit: filter by unit
        if ($user->hasRole('Unit') && $user->unit_id) {
            $query->where('unit_id', $user->unit_id);
        }

        $active = (clone $query)->where('status', 'active')->count();
        $inactive = (clone $query)->where('status', 'inactive')->count();
        $repaired = (clone $query)->where('status', 'repaired')->count();

        return [
            'labels' => ['Aktif', 'Tidak Aktif', 'Diperbaiki'],
            'datasets' => [
                [
                    'data' => [$active, $inactive, $repaired],
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
