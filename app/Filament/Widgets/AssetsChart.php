<?php

namespace App\Filament\Widgets;

use App\Models\Asset;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class AssetsChart extends ChartWidget
{

    protected static ?string $heading = 'Jumlah Assets per Unit';

    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = 2;

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $dataPerUnit = Asset::query()
            ->select('units.name as unit_name', DB::raw('COUNT(assets.id) as total'))
            ->join('units', 'assets.unit_id', '=', 'units.id')
            ->groupBy('units.name')
            ->get();

        $labels = $dataPerUnit->pluck('unit_name')->toArray();
        $values = $dataPerUnit->pluck('total')->toArray();

        $colors = $this->generateColors(count($labels));

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Jumlah Assets',
                    'data' => $values,
                    'backgroundColor' => $colors,
                ],
            ],
        ];
    }

    protected function generateColors(int $count): array
    {
        $colors = [];
        for ($i = 0; $i < $count; $i++) {
            $colors[] = sprintf('hsl(%d, 70%%, 50%%)', ($i * (360 / $count)) % 360);
        }
        return $colors;
    }
}
