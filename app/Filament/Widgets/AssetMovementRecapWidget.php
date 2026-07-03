<?php

namespace App\Filament\Widgets;

use App\Models\Asset;
use App\Models\AssetTransferItem;
use App\Models\AssetDispositionItem;
use App\Models\Location;
use App\Models\Unit;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;

class AssetMovementRecapWidget extends Widget
{
    protected static string $view = 'filament.widgets.asset-movement-recap';

    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = 2;

    public ?int $unitId = null;

    public ?int $locationId = null;

    public bool $lockUnit = false;

    public function mount(): void
    {
        $user = Auth::user();

        if ($user->hasRole('Unit') && $user->unit_id) {
            $this->unitId = $user->unit_id;
            $this->lockUnit = true;
        }
    }

    public function updatedUnitId(): void
    {
        $this->locationId = null;
    }

    public function getUnits(): Collection
    {
        return Unit::orderBy('name')->get(['id', 'name']);
    }

    public function getLocations(): Collection
    {
        if (! $this->unitId) {
            return collect();
        }

        return Location::where('unit_id', $this->unitId)->orderBy('name')->get(['id', 'name']);
    }

    /**
     * 'location' = satu lokasi spesifik dipilih -> tampilkan rekap per nama aset.
     * 'unit-locations' = unit dipilih, lokasi belum -> breakdown per lokasi dalam unit itu.
     * 'units' = belum ada filter -> breakdown per unit.
     */
    public function getScopeLevel(): string
    {
        if ($this->locationId) {
            return 'location';
        }

        if ($this->unitId) {
            return 'unit-locations';
        }

        return 'units';
    }

    public function getRows(): array
    {
        $cacheKey = "dashboard_asset_movement_{$this->unitId}_{$this->locationId}_" . now()->format('Y-m');

        return Cache::remember($cacheKey, 300, function () {
            return match ($this->getScopeLevel()) {
                'unit-locations' => $this->buildRows(Location::where('unit_id', $this->unitId)->orderBy('name')->get(['id', 'name']), 'location_id'),
                default => $this->buildRows(Unit::orderBy('name')->get(['id', 'name']), 'unit_id'),
            };
        });
    }

    protected function buildRows(Collection $scopes, string $column): array
    {
        $start = now()->startOfMonth();
        $end = now()->endOfMonth();

        $rows = $scopes->map(function ($scope) use ($column, $start, $end) {
            return [
                'label' => $scope->name,
                'masuk' => $this->countMasukBaru($column, $scope->id, $start, $end),
                'keluar' => $this->countKeluar($column, $scope->id, $start, $end),
                'aktif' => $this->countAktifOk($column, $scope->id),
            ];
        })->values()->all();

        $total = [
            'label' => 'Total',
            'masuk' => array_sum(array_column($rows, 'masuk')),
            'keluar' => array_sum(array_column($rows, 'keluar')),
            'aktif' => array_sum(array_column($rows, 'aktif')),
        ];

        return ['rows' => $rows, 'total' => $total];
    }

    protected function countMasukBaru(string $column, int $scopeId, $start, $end): int
    {
        return Asset::where($column, $scopeId)
            ->whereBetween('created_at', [$start, $end])
            ->count();
    }

    protected function countKeluar(string $column, int $scopeId, $start, $end): int
    {
        $transferColumn = $column === 'location_id' ? 'from_location_id' : 'from_unit_id';

        $transferred = AssetTransferItem::whereHas('transfer', function ($query) use ($transferColumn, $scopeId, $start, $end) {
            $query->where($transferColumn, $scopeId)
                ->where('status', 'completed')
                ->whereBetween('completed_at', [$start, $end]);
        })->count();

        $disposed = AssetDispositionItem::whereHas('disposition', function ($query) use ($start, $end) {
            $query->where('status', 'completed')
                ->whereBetween('completed_at', [$start, $end]);
        })->whereHas('asset', function ($query) use ($column, $scopeId) {
            $query->where($column, $scopeId);
        })->count();

        return $transferred + $disposed;
    }

    protected function countAktifOk(string $column, int $scopeId): int
    {
        return Asset::where($column, $scopeId)
            ->where('status', 'active')
            ->where('condition', 'bagus')
            ->count();
    }

    public function getLocationRecap(): array
    {
        $cacheKey = "dashboard_asset_movement_location_{$this->locationId}_" . now()->format('Y-m');

        return Cache::remember($cacheKey, 300, function () {
            $start = now()->startOfMonth();
            $end = now()->endOfMonth();

            $location = Location::with('assets')->find($this->locationId);

            $assetsByName = $location->assets->groupBy('name')->map->count()->sortDesc();

            return [
                'location_name' => $location->name,
                'masuk' => $this->countMasukBaru('location_id', $this->locationId, $start, $end),
                'keluar' => $this->countKeluar('location_id', $this->locationId, $start, $end),
                'aktif' => $this->countAktifOk('location_id', $this->locationId),
                'assets' => $assetsByName,
                'total_assets' => $assetsByName->sum(),
            ];
        });
    }
}
