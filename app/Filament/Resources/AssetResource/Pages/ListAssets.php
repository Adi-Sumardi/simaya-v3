<?php

namespace App\Filament\Resources\AssetResource\Pages;

use App\Exports\AssetExport;
use App\Exports\AssetSampleExport;
use App\Filament\Resources\AssetResource;
use App\Filament\Resources\AssetResource\Widgets\AssetStats;
use App\Models\Asset;
use App\Models\Location;
use App\Models\Unit;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Maatwebsite\Excel\Facades\Excel;
use Filament\Pages\Actions\Action;
use Illuminate\Support\Facades\Auth;
use Livewire\WithFileUploads;
use Filament\Resources\Components\Tab;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class ListAssets extends ListRecords
{
    use WithFileUploads;
    public $importFile;
    protected static string $resource = AssetResource::class;

    public ?int $activeUnitId = null;
    public ?int $activeLocationId = null;
    public int $filterVersion = 0;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('qrcode')
                ->label('List QR Code')
                ->icon('heroicon-o-qr-code')
                ->color('info')
                ->url(route('asset.all'))
                ->openUrlInNewTab(),

            Action::make('export')
                ->label('Export')
                ->color('gray')
                ->icon('heroicon-o-arrow-up-tray')
                ->action(function () {
                    return Excel::download(new AssetExport, 'asset.xlsx');
                }),

            \EightyNine\ExcelImport\ExcelImportAction::make()
            ->sampleExcel(
                sampleData: [
                    ['name' => 'Kursi', 'condition' => 'bagus', 'portability' => 'portable', 'entries_number' => 0001, 'description' => 'Kursi kayu', 'brand' => 'Brand A', 'price' => 100000, 'aquisition' => 'YAPI', 'aquisition_date' => now(), 'status' => 'active', 'image' => null, 'user_id' => 1, 'unit_id' => 1, 'tool_id' => 1, 'location_id' => 1, 'category_id' => 1, 'year_id' => 1, 'aktiva_id' => 1],
                ],
                fileName: 'sample-asset.xlsx',
                exportClass: AssetSampleExport::class,
                sampleButtonLabel: 'Download Sample',
                customiseActionUsing: fn($action) => $action
                        ->color('secondary')
                        ->icon('heroicon-m-clipboard')
                        ->requiresConfirmation(),
            ),

            Actions\CreateAction::make(),
        ];
    }

    public function getTabs(): array
    {
        $user = Auth::user();

        // Role Unit: tampilkan tabs berdasarkan kondisi/status aset unit mereka
        if ($user->hasRole('Unit') && $user->unit_id) {
            return $this->getUnitConditionTabs($user->unit_id);
        }

        // Role Admin/Manajer: tampilkan tabs berdasarkan unit
        return $this->getUnitTabs();
    }

    /**
     * Helper untuk query badge yang konsisten dengan table
     * Table menggunakan withoutGlobalScopes([SoftDeletingScope]) + notTransferred()
     */
    protected function getAssetBaseQuery()
    {
        return Asset::withoutGlobalScopes([SoftDeletingScope::class])->notTransferred();
    }

    /**
     * Tabs untuk role Admin/Manajer - berdasarkan Unit
     * Badge counts cached for 60 seconds to improve performance
     */
    protected function getUnitTabs(): array
    {
        // Pre-fetch all counts in a single query for better performance
        $counts = Cache::remember('asset_unit_counts', 60, function () {
            return $this->getAssetBaseQuery()
                ->selectRaw('unit_id, COUNT(*) as count')
                ->groupBy('unit_id')
                ->pluck('count', 'unit_id')
                ->toArray();
        });

        $totalCount = array_sum($counts);

        $tabs = [
            'all' => Tab::make('Semua Unit')
                ->label('Semua Unit')
                ->badge($totalCount)
                ->badgeColor('primary'),
        ];

        $units = Unit::select(['id', 'name'])->get();

        foreach ($units as $unit) {
            $unitId = $unit->id;
            $tabs["unit_{$unitId}"] = Tab::make($unit->name)
                ->label($unit->name)
                ->badge($counts[$unitId] ?? 0)
                ->badgeColor('success')
                ->modifyQueryUsing(fn ($query) => $query->where('unit_id', $unitId));
        }

        return $tabs;
    }

    /**
     * Tabs untuk role Unit - berdasarkan Kondisi/Status dalam unit mereka
     * Menghindari pembuatan puluhan tab per ruangan yang merusak layout tabel
     * Badge counts cached for 60 seconds to improve performance
     */
    protected function getUnitConditionTabs(int $unitId): array
    {
        $counts = Cache::remember("asset_unit_condition_counts_{$unitId}", 60, function () use ($unitId) {
            return $this->getAssetBaseQuery()
                ->where('unit_id', $unitId)
                ->selectRaw('
                    COUNT(*) as total,
                    SUM(CASE WHEN `condition` = "bagus" THEN 1 ELSE 0 END) as bagus,
                    SUM(CASE WHEN `condition` = "rusak" THEN 1 ELSE 0 END) as rusak,
                    SUM(CASE WHEN status != "active" THEN 1 ELSE 0 END) as non_aktif
                ')
                ->first();
        });

        return [
            'all' => Tab::make('Semua Aset')
                ->label('Semua Aset')
                ->badge($counts->total ?? 0)
                ->badgeColor('primary')
                ->modifyQueryUsing(fn ($query) => $query->where('unit_id', $unitId)),

            'bagus' => Tab::make('Kondisi Bagus')
                ->label('Kondisi Bagus')
                ->badge($counts->bagus ?? 0)
                ->badgeColor('success')
                ->modifyQueryUsing(fn ($query) => $query->where('unit_id', $unitId)->where('condition', 'bagus')),

            'rusak' => Tab::make('Kondisi Rusak')
                ->label('Kondisi Rusak')
                ->badge($counts->rusak ?? 0)
                ->badgeColor('danger')
                ->modifyQueryUsing(fn ($query) => $query->where('unit_id', $unitId)->where('condition', 'rusak')),

            'non_aktif' => Tab::make('Perlu Perbaikan / Non-Aktif')
                ->label('Perlu Perbaikan / Non-Aktif')
                ->badge($counts->non_aktif ?? 0)
                ->badgeColor('warning')
                ->modifyQueryUsing(fn ($query) => $query->where('unit_id', $unitId)->where('status', '!=', 'active')),
        ];
    }

    public function updatedActiveTab(): void
    {
        $user = Auth::user();

        // Reset values
        $this->activeUnitId = null;
        $this->activeLocationId = null;

        if ($user->hasRole('Unit') && $user->unit_id) {
            // Role Unit: set unit_id tetap
            $this->activeUnitId = $user->unit_id;
        } else {
            // Role Admin/Manajer: track unit
            if (Str::startsWith($this->activeTab, 'unit_')) {
                $this->activeUnitId = (int) Str::after($this->activeTab, 'unit_');
            }
        }

        $this->dispatch('refreshAssetStats', unitId: $this->activeUnitId, locationId: $this->activeLocationId);

        if (method_exists($this, 'resetTable')) {
            $this->resetTable();
        } else {
            $this->filterVersion++;
        }
    }

    public function mount(): void
    {
        $user = Auth::user();

        if ($user->hasRole('Unit') && $user->unit_id) {
            // Role Unit: set unit_id tetap
            $this->activeUnitId = $user->unit_id;
        } else {
            // Role Admin/Manajer
            if (Str::startsWith($this->activeTab, 'unit_')) {
                $this->activeUnitId = (int) Str::after($this->activeTab, 'unit_');
            }
        }
    }

    public function getHeaderWidgets(): array
    {
        return [
            AssetStats::make([
                'unitId' => $this->activeUnitId,
                'locationId' => $this->activeLocationId,
                'filterVersion' => $this->filterVersion,
            ]),
        ];
    }
}
