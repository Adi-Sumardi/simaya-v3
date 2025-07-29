<?php

namespace App\Filament\Resources\AssetResource\Pages;

use App\Exports\AssetExport;
use App\Exports\AssetSampleExport;
use App\Filament\Resources\AssetResource;
use App\Filament\Resources\AssetResource\Widgets\AssetStats;
use App\Imports\AssetImport;
use App\Models\Unit;
use Faker\Core\Color;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
use Maatwebsite\Excel\Facades\Excel;
use Filament\Pages\Actions\Action;
use Livewire\WithFileUploads;
use Filament\Resources\Components\Tab;
use Illuminate\Support\Str;

class ListAssets extends ListRecords
{
    use WithFileUploads;
    public $importFile;
    protected static string $resource = AssetResource::class;

    public ?int $activeUnitId = null;
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
                ->color('success')
                ->icon('heroicon-o-arrow-up-tray')
                ->action(function () {
                    return Excel::download(new AssetExport, 'asset.xlsx');
                }),

            \EightyNine\ExcelImport\ExcelImportAction::make()
            ->sampleExcel(
                sampleData: [
                    ['name' => 'Kursi', 'condition' => 'bagus', 'portability' => 'portable', 'entries_number' => 0001, 'description' => 'Kursi kayu', 'brand' => 'Brand A', 'price' => 100000, 'aquisition' => 'YAPI', 'aquisition_date' => now(), 'status' => 'active', 'image' => null, 'user_id' => 1, 'unit_id' => 1, 'tool_id' => 1, 'location_id' => 1, 'category_id' => 1, 'year_id' => 2023, 'aktiva_id' => 1],
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
        $tabs = [
            'all' => Tab::make('Semua Unit')
                ->label('Semua Unit')
                ->modifyQueryUsing(fn ($query) => $query),
        ];

        foreach (Unit::all() as $unit) {
            $tabs['unit_' . $unit->id] = Tab::make($unit->name)
                ->label($unit->name)
                ->modifyQueryUsing(fn ($query) => $query->where('unit_id', $unit->id));
        }

        return $tabs;
    }

    public function updatedActiveTab(): void
    {
        if (Str::startsWith($this->activeTab, 'unit_')) {
            $this->activeUnitId = (int) Str::after($this->activeTab, 'unit_');
        } else {
            $this->activeUnitId = null;
        }

        $this->dispatch('refreshAssetStats', unitId: $this->activeUnitId);

        if (method_exists($this, 'resetTable')) {
            $this->resetTable();
        } else {
            $this->filterVersion++;
        }
    }

    public function mount(): void
    {
        if (Str::startsWith($this->activeTab, 'unit_')) {
            $this->activeUnitId = (int) Str::after($this->activeTab, 'unit_');
        } else {
            $this->activeUnitId = null;
        }
    }

    public function getHeaderWidgets(): array
    {
        return [
            AssetStats::make([
                'unitId' => $this->activeUnitId,
                'filterVersion' => $this->filterVersion,
            ]),
        ];
    }
}
