<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\AssetConditionChart;
use App\Filament\Widgets\AssetMovementRecapWidget;
use App\Filament\Widgets\AssetStatusChart;
use App\Filament\Widgets\AssetsChart;
use App\Filament\Widgets\DamagedAssetsWidget;
use App\Filament\Widgets\RecentTransfersWidget;
use App\Filament\Widgets\StatsDashboard;
use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    protected static ?string $title = 'Dashboard';

    public function getWidgets(): array
    {
        // Base widgets for all roles
        $widgets = [
            StatsDashboard::class,
        ];

        // Recap table for all roles - above distribution chart
        $widgets[] = AssetMovementRecapWidget::class;

        // Charts for all roles
        $widgets[] = AssetsChart::class;
        $widgets[] = AssetConditionChart::class;
        $widgets[] = AssetStatusChart::class;

        // Transfer widget - visible for all roles
        $widgets[] = RecentTransfersWidget::class;

        // Damaged assets widget - visible for all roles
        $widgets[] = DamagedAssetsWidget::class;

        return $widgets;
    }

    public function getColumns(): int|string|array
    {
        return [
            'default' => 1,
            'sm' => 2,
            'lg' => 2,
            'xl' => 2,
        ];
    }
}
