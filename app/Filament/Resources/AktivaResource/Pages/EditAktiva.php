<?php

namespace App\Filament\Resources\AktivaResource\Pages;

use App\Filament\Resources\AktivaResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditAktiva extends EditRecord
{
    protected static string $resource = AktivaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
