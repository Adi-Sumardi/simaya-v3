<?php

namespace App\Filament\Resources\YearResource\Pages;

use App\Exports\YearExport;
use App\Exports\YearSampleExport;
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
                ->color('gray')
                ->icon('heroicon-o-arrow-down-tray')
                ->action(function () {
                    return Excel::download(new YearExport, 'year.xlsx');
                }),

            \EightyNine\ExcelImport\ExcelImportAction::make()
            ->sampleExcel(
                sampleData: [
                    ['year' => '2020', 'code' => '20'],
                    ['year' => '2025', 'code' => '25'],
                ],
                fileName: 'sample-year.xlsx',
                exportClass: YearSampleExport::class,
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
