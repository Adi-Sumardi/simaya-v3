<?php

namespace App\Filament\Resources\AssetDispositionResource\Pages;

use App\Filament\Resources\AssetDispositionResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListAssetDispositions extends ListRecords
{
    protected static string $resource = AssetDispositionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make()
                ->label('Buat Disposisi'),
        ];
    }
}
