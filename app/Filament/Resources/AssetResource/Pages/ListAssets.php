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

        // Role Unit: tampilkan tabs berdasarkan lokasi unit mereka
        if ($user->hasRole('Unit') && $user->unit_id) {
            return $this->getLocationTabs($user->unit_id);
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
     */
    protected function getUnitTabs(): array
    {
        $tabs = [
            'all' => Tab::make('Semua Unit')
                ->label('Semua Unit')
                ->badge(fn () => $this->getAssetBaseQuery()->count())
                ->badgeColor('primary'),
        ];

        $units = Unit::select(['id', 'name'])->get();

        foreach ($units as $unit) {
            $unitId = $unit->id;
            $tabs["unit_{$unitId}"] = Tab::make($unit->name)
                ->label($unit->name)
                ->badge(fn () => $this->getAssetBaseQuery()->where('unit_id', $unitId)->count())
                ->badgeColor('success')
                ->modifyQueryUsing(fn ($query) => $query->where('unit_id', $unitId));
        }

        return $tabs;
    }

    /**
     * Tabs untuk role Unit - berdasarkan Lokasi dalam unit mereka
     */
    protected function getLocationTabs(int $unitId): array
    {
        $tabs = [
            'all' => Tab::make('Semua Lokasi')
                ->label('Semua Lokasi')
                ->badge(fn () => $this->getAssetBaseQuery()->where('unit_id', $unitId)->count())
                ->badgeColor('primary')
                ->modifyQueryUsing(fn ($query) => $query->where('unit_id', $unitId)),
        ];

        $locations = Location::where('unit_id', $unitId)->select(['id', 'name'])->get();

        foreach ($locations as $location) {
            $locationId = $location->id;
            $tabs["location_{$locationId}"] = Tab::make($location->name)
                ->label($location->name)
                ->badge(fn () => $this->getAssetBaseQuery()->where('location_id', $locationId)->count())
                ->badgeColor('success')
                ->modifyQueryUsing(fn ($query) => $query->where('location_id', $locationId));
        }

        return $tabs;
    }

    public function updatedActiveTab(): void
    {
        $user = Auth::user();

        // Reset values
        $this->activeUnitId = null;
        $this->activeLocationId = null;

        if ($user->hasRole('Unit') && $user->unit_id) {
            // Role Unit: set unit_id tetap, track location
            $this->activeUnitId = $user->unit_id;

            if (Str::startsWith($this->activeTab, 'location_')) {
                $this->activeLocationId = (int) Str::after($this->activeTab, 'location_');
            }
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

            if (Str::startsWith($this->activeTab, 'location_')) {
                $this->activeLocationId = (int) Str::after($this->activeTab, 'location_');
            }
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
