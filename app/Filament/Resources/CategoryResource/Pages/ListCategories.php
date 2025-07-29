<?php

namespace App\Filament\Resources\CategoryResource\Pages;

use App\Exports\CategoryExport;
use App\Filament\Resources\CategoryResource;
use App\Imports\CategoryImport;
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
                ->label('Export Excel')
                ->color('success')
                ->icon('heroicon-o-arrow-up-tray')
                ->action(function () {
                    return Excel::download(new CategoryExport, 'category.xlsx');
                }),

            \EightyNine\ExcelImport\ExcelImportAction::make()
                ->label('Import Excel')
                ->slideOver()
                ->color("gray")
                ->use(CategoryImport::class),

            Actions\CreateAction::make(),
        ];
    }
}
