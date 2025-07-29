<?php

namespace App\Filament\Resources\YearResource\Pages;

use App\Exports\YearExport;
use App\Filament\Resources\YearResource;
use App\Imports\YearImport;
use Filament\Actions;
use Filament\Forms\Components\FileUpload;
use Filament\Resources\Pages\ListRecords;
use Filament\Pages\Actions\Action;
use Livewire\WithFileUploads;
use Maatwebsite\Excel\Facades\Excel;

class ListYears extends ListRecords
{
    use WithFileUploads;
    public $importFile;

    protected static string $resource = YearResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export')
                ->label('Export Excel')
                ->color('success')
                ->icon('heroicon-o-arrow-down-tray')
                ->action(function () {
                    return Excel::download(new YearExport, 'year.xlsx');
                }),

            \EightyNine\ExcelImport\ExcelImportAction::make()
                ->label('Import Excel')
                ->slideOver()
                ->color("gray")
                ->use(YearImport::class),

            Actions\CreateAction::make(),
        ];
    }
}
