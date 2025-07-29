<?php

namespace App\Filament\Resources\AktivaResource\Pages;

use App\Filament\Resources\AktivaResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\AktivaExport;
use App\Exports\AktivaSampleExport;
use App\Imports\AktivaImport;
use Livewire\WithFileUploads;
use Filament\Forms\Components\FileUpload;
use Filament\Pages\Actions\Action;

class ListAktivas extends ListRecords
{
    use WithFileUploads;
    public $importFile;
    protected static string $resource = AktivaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export')
                ->color('gray')
                ->icon('heroicon-o-arrow-up-tray')
                ->action(function () {
                    return Excel::download(new AktivaExport, 'aktiva.xlsx');
                }),

            \EightyNine\ExcelImport\ExcelImportAction::make()
            ->sampleExcel(
                sampleData: [
                    ['name' => 'Inventaris', 'code' => '173'],
                ],
                fileName: 'sample-aktiva.xlsx',
                exportClass: AktivaSampleExport::class,
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
