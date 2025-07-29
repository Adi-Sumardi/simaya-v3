<?php

namespace App\Filament\Resources\AssetResource\Pages;

use App\Filament\Resources\AssetResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;

class ViewAsset extends ViewRecord
{
    protected static string $resource = AssetResource::class;

    protected static string $view = 'filament.resources.asset-resource.pages.view';

    //getHeaderActions(): array
    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('edit')
                ->label('Edit')
                ->icon('heroicon-o-pencil-square')
                ->color('primary')
                ->url(fn ($record) => $this->getResource()::getUrl('edit', ['record' => $record])),

            Actions\Action::make('qrcode')
                ->label('Asset Detail QR Code')
                ->icon('heroicon-o-qr-code')
                ->color('info')
                ->url(route('asset.detail', ['id' => $this->record->id]))
                ->openUrlInNewTab(),
        ];
    }
}
