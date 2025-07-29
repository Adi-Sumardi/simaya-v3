<?php

namespace App\Filament\Resources\UnitResource\Pages;

use App\Exports\UnitExport;
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
                ->label('Export Excel')
                ->color('success')
                ->icon('heroicon-o-arrow-up-tray')
                ->action(function () {
                    return Excel::download(new UnitExport, 'unit.xlsx');
                }),

            \EightyNine\ExcelImport\ExcelImportAction::make()
                ->label('Import Excel')
                ->slideOver()
                ->color("gray")
                ->use(UnitImport::class),

            Actions\CreateAction::make(),
        ];
    }
}
