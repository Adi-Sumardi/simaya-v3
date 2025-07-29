<?php

namespace App\Filament\Resources\CategoryResource\Pages;

use App\Exports\CategoryExport;
use App\Exports\CategorySampleExport;
use App\Filament\Resources\CategoryResource;
use App\Imports\CategoryImport;
use App\Models\Category;
use Filament\Actions;
use Filament\Forms\Components\FileUpload;
use Filament\Resources\Pages\ListRecords;
use Filament\Pages\Actions\Action;
use Livewire\WithFileUploads;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;

class ListCategories extends ListRecords
{
    use WithFileUploads;

    protected static string $resource = CategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export')
                ->color('gray')
                ->icon('heroicon-o-arrow-up-tray')
                ->action(function () {
                    return Excel::download(new CategoryExport, 'category.xlsx');
                }),

            \EightyNine\ExcelImport\ExcelImportAction::make()
            ->sampleExcel(
                sampleData: [
                    ['name' => 'Elektronik', 'code' => '60'],
                ],
                fileName: 'sample-category.xlsx',
                exportClass: CategorySampleExport::class,
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
