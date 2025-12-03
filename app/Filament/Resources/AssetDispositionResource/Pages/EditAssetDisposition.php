<?php

namespace App\Filament\Resources\AssetDispositionResource\Pages;

use App\Filament\Resources\AssetDispositionResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditAssetDisposition extends EditRecord
{
    protected static string $resource = AssetDispositionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\ViewAction::make(),
            Actions\DeleteAction::make()
                ->visible(fn () => $this->record->isDraft()),
        ];
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
