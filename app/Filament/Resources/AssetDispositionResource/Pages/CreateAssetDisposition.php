<?php

namespace App\Filament\Resources\AssetDispositionResource\Pages;

use App\Filament\Resources\AssetDispositionResource;
use Filament\Resources\Pages\CreateRecord;

class CreateAssetDisposition extends CreateRecord
{
    protected static string $resource = AssetDispositionResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['status'] = 'draft';
        return $data;
    }
}
