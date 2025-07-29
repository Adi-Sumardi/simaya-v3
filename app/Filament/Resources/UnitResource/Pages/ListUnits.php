<?php

namespace App\Filament\Resources\UnitResource\Pages;

use App\Exports\UnitExport;
use App\Exports\UnitSampleExport;
use App\Filament\Resources\UnitResource;
use App\Imports\UnitImport;
use Filament\Actions;
use Filament\Forms\Components\FileUpload;
use Filament\Resources\Pages\ListRecords;
use Filament\Pages\Actions\Action;
use Livewire\WithFileUploads;
use Maatwebsite\Excel\Facades\Excel;

class ListUnits extends ListRecords
{
    use WithFileUploads;
    public $importFile;

    protected static string $resource = UnitResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export')
                ->color('gray')
                ->icon('heroicon-o-arrow-up-tray')
                ->action(function () {
                    return Excel::download(new UnitExport, 'unit.xlsx');
                }),

            \EightyNine\ExcelImport\ExcelImportAction::make()
            ->sampleExcel(
                sampleData: [
                    ['name' => 'PG Sakinah', 'number' => '01'],
                ],
                fileName: 'sample-unit.xlsx',
                exportClass: UnitSampleExport::class,
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
