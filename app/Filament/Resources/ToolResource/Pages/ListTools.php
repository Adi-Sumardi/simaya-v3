<?php

namespace App\Filament\Resources\ToolResource\Pages;

use App\Exports\ToolExport;
use App\Exports\ToolSampleExport;
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
                ->color('gray')
                ->icon('heroicon-o-arrow-up-tray')
                ->action(function () {
                    return Excel::download(new ToolExport, 'tool.xlsx');
                }),

            \EightyNine\ExcelImport\ExcelImportAction::make()
            ->sampleExcel(
                sampleData: [
                    ['name' => 'meja', 'code' => '01', 'code_name' => 'MJ'],
                ],
                fileName: 'sample-tool.xlsx',
                exportClass: ToolSampleExport::class,
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
