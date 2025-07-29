<?php

namespace App\Filament\Resources\AktivaResource\Pages;

use App\Filament\Resources\AktivaResource;
use Filament\Actions;
use Filament\Resources\Pages\CreateRecord;

class CreateAktiva extends CreateRecord
{
    protected static string $resource = AktivaResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
