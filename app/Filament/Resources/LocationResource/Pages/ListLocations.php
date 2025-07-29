<?php

namespace App\Filament\Resources\LocationResource\Pages;

use App\Exports\LocationExport;
use App\Filament\Resources\LocationResource;
use App\Imports\LocationImport;
use Filament\Actions;
use Filament\Forms\Components\FileUpload;
use Filament\Resources\Pages\ListRecords;
use Filament\Pages\Actions\Action;
use Livewire\WithFileUploads;
use Maatwebsite\Excel\Facades\Excel;

class ListLocations extends ListRecords
{
    use WithFileUploads;
    public $importFile;

    protected static string $resource = LocationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export')
                ->label('Export Excel')
                ->color('success')
                ->icon('heroicon-o-arrow-up-tray')
                ->action(function () {
                    return Excel::download(new LocationExport, 'location.xlsx');
                }),

            \EightyNine\ExcelImport\ExcelImportAction::make()
                ->label('Import Excel')
                ->slideOver()
                ->color("gray")
                ->use(LocationImport::class),

            Actions\CreateAction::make(),
        ];
    }
}
