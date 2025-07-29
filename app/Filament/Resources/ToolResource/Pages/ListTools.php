<?php

namespace App\Filament\Resources\ToolResource\Pages;

use App\Exports\ToolExport;
use App\Filament\Resources\ToolResource;
use App\Imports\ToolImport;
use Filament\Actions;
use Filament\Forms\Components\FileUpload;
use Filament\Resources\Pages\ListRecords;
use Filament\Pages\Actions\Action;
use Livewire\WithFileUploads;
use Maatwebsite\Excel\Facades\Excel;

class ListTools extends ListRecords
{
    use WithFileUploads;
    public $importFile;

    protected static string $resource = ToolResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export')
                ->label('Export Excel')
                ->color('success')
                ->icon('heroicon-o-arrow-up-tray')
                ->action(function () {
                    return Excel::download(new ToolExport, 'tool.xlsx');
                }),

            \EightyNine\ExcelImport\ExcelImportAction::make()
                ->label('Import Excel')
                ->slideOver()
                ->color("gray")
                ->use(ToolImport::class),

            Actions\CreateAction::make(),
        ];
    }
}
