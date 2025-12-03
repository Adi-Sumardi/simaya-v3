<?php

namespace App\Filament\Resources\LocationResource\Pages;

use App\Exports\LocationExport;
use App\Exports\LocationSampleExport;
use App\Exports\LocationAssetMultiSheetExport;
use App\Filament\Resources\LocationResource;
use App\Imports\LocationImport;
use App\Models\Location;
use App\Models\Unit;
use Filament\Actions;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Resources\Pages\ListRecords;
use Filament\Pages\Actions\Action;
use Illuminate\Support\Facades\Auth;
use Livewire\WithFileUploads;
use Maatwebsite\Excel\Facades\Excel;

class ListLocations extends ListRecords
{
    use WithFileUploads;
    public $importFile;

    protected static string $resource = LocationResource::class;

    protected function getHeaderActions(): array
    {
        $user = Auth::user();
        $isAdmin = $user->hasRole(['super_admin', 'Manajer', 'Manager', 'Kabag']);

        return [
            // Export untuk Audit/Sertifikasi
            Action::make('exportAudit')
                ->label('Export Audit')
                ->color('success')
                ->icon('heroicon-o-document-chart-bar')
                ->form(function () use ($user, $isAdmin) {
                    // Role Unit: langsung export unit mereka tanpa form
                    if (!$isAdmin && $user->unit_id) {
                        return [];
                    }

                    // Admin/Manajer: bisa pilih unit
                    return [
                        Select::make('unit_id')
                            ->label('Pilih Unit')
                            ->options(Unit::pluck('name', 'id'))
                            ->placeholder('Semua Unit')
                            ->helperText('Kosongkan untuk export semua unit'),
                    ];
                })
                ->action(function (array $data) use ($user, $isAdmin) {
                    // Role Unit: export unit mereka saja
                    if (!$isAdmin && $user->unit_id) {
                        $unitId = $user->unit_id;
                        $unitName = Unit::find($unitId)?->name ?? 'Unit';
                    } else {
                        // Admin/Manajer: sesuai pilihan
                        $unitId = $data['unit_id'] ?? null;
                        $unitName = $unitId ? Unit::find($unitId)?->name : 'Semua-Unit';
                    }

                    $fileName = 'Audit-Aset-Lokasi-' . str_replace(' ', '-', $unitName) . '-' . date('Y-m-d') . '.xlsx';

                    return Excel::download(new LocationAssetMultiSheetExport($unitId), $fileName);
                })
                ->modalHeading('Export Data Aset per Lokasi')
                ->modalDescription(function () use ($user, $isAdmin) {
                    if (!$isAdmin && $user->unit_id) {
                        $unitName = Unit::find($user->unit_id)?->name ?? 'Unit Anda';
                        return "Export data aset untuk {$unitName}. File akan berisi ringkasan lokasi dan detail aset per lokasi.";
                    }
                    return 'Export data lengkap untuk keperluan audit dan sertifikasi sekolah. File akan berisi ringkasan lokasi dan detail aset per lokasi.';
                })
                ->modalSubmitActionLabel('Export Excel'),

            Action::make('export')
                ->label('Export Lokasi')
                ->color('gray')
                ->icon('heroicon-o-arrow-up-tray')
                ->action(function () {
                    return Excel::download(new LocationExport, 'location.xlsx');
                }),

            \EightyNine\ExcelImport\ExcelImportAction::make()
            ->sampleExcel(
                sampleData: [
                    ['name' => 'sekertariat', 'number' => '01', 'floor' => '1', 'unit_id' => '1', 'user_id' => '1'],
                ],
                fileName: 'sample-location.xlsx',
                exportClass: LocationSampleExport::class,
                sampleButtonLabel: 'Download Sample',
                customiseActionUsing: fn($action) => $action
                        ->color('secondary')
                        ->icon('heroicon-m-clipboard')
                        ->requiresConfirmation(),
            ),

            Actions\CreateAction::make(),
        ];
    }
}
