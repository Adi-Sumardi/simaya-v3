<?php

namespace App\Filament\Resources\LocationResource\Pages;

use App\Filament\Resources\LocationResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewLocation extends ViewRecord
{
    protected static string $resource = LocationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('qrcode')
                ->label('Lokasi QR Code')
                ->icon('heroicon-o-qr-code')
                ->color('info')
                ->url(route('asset.lokasi', ['id' => $this->record->id]))
                ->openUrlInNewTab(),
        ];
    }
}
