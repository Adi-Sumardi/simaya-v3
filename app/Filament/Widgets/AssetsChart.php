<?php

namespace App\Filament\Widgets;

use App\Models\Asset;
use App\Models\Unit;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AssetsChart extends ChartWidget
{
    protected static ?string $heading = 'Distribusi Aset per Unit';

    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = 3;

    protected static ?string $maxHeight = '300px';

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $user = Auth::user();

        // Role Unit: tampilkan per lokasi dalam unit mereka
        if ($user->hasRole('Unit') && $user->unit_id) {
            return $this->getLocationData($user->unit_id);
        }

        // Role Admin/Manager: tampilkan per unit
        return $this->getUnitData();
    }

    protected function getUnitData(): array
    {
        $dataPerUnit = Asset::query()
            ->notTransferred()
            ->select('units.name as unit_name', DB::raw('COUNT(assets.id) as total'))
            ->join('units', 'assets.unit_id', '=', 'units.id')
            ->groupBy('units.id', 'units.name')
            ->orderByDesc('total')
            ->get();

        $labels = $dataPerUnit->pluck('unit_name')->toArray();
        $values = $dataPerUnit->pluck('total')->toArray();

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Jumlah Aset',
                    'data' => $values,
                    'backgroundColor' => $this->generateColors(count($labels)),
                    'borderRadius' => 5,
                ],
            ],
        ];
    }

    protected function getLocationData(int $unitId): array
    {
        $unit = Unit::find($unitId);
        static::$heading = 'Distribusi Aset per Lokasi - ' . ($unit?->name ?? 'Unit');

        $dataPerLocation = Asset::query()
            ->where('assets.unit_id', $unitId)
            ->notTransferred()
            ->select('locations.name as location_name', DB::raw('COUNT(assets.id) as total'))
            ->join('locations', 'assets.location_id', '=', 'locations.id')
            ->groupBy('locations.id', 'locations.name')
            ->orderByDesc('total')
            ->get();

        $labels = $dataPerLocation->pluck('location_name')->toArray();
        $values = $dataPerLocation->pluck('total')->toArray();

        return [
            'labels' => $labels,
            'datasets' => [
                [
                    'label' => 'Jumlah Aset',
                    'data' => $values,
                    'backgroundColor' => $this->generateColors(count($labels)),
                    'borderRadius' => 5,
                ],
            ],
        ];
    }

    protected function generateColors(int $count): array
    {
        $colors = [];
        for ($i = 0; $i < $count; $i++) {
            $colors[] = sprintf('hsl(%d, 70%%, 50%%)', ($i * (360 / max($count, 1))) % 360);
        }
        return $colors;
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'display' => false,
                ],
            ],
            'scales' => [
                'y' => [
                    'beginAtZero' => true,
                ],
            ],
        ];
    }
}
