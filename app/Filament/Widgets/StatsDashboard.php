<?php

namespace App\Filament\Widgets;

use App\Models\Asset;
use App\Models\Category;
use App\Models\Location;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsDashboard extends BaseWidget
{

    protected static ?int $navigationSort = 2;
    protected function getStats(): array
    {
        return [
            Stat::make('Total Asset', Asset::count())
                ->label('Total Asset'),
            Stat::make('Asset Bagus', Asset::where('condition', 'Bagus')->count())
                ->label('Asset Bagus'),
            Stat::make('Asset Rusak', Asset::where('condition', 'Rusak')->count())
                ->label('Asset Rusak'),
            Stat::make('Nilai Asset', function () {
                    $total = Asset::sum('price');
                    return 'Rp ' . number_format($total, 0, ',', '.');
                })->label('Nilai Asset'),
        ];
    }
}
