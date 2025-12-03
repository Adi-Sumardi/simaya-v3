<?php

namespace App\Filament\Resources\LocationResource\Pages;

use App\Exports\LocationAssetSimpleExport;
use App\Filament\Resources\LocationResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;
use Maatwebsite\Excel\Facades\Excel;

class ViewLocation extends ViewRecord
{
    protected static string $resource = LocationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('exportAset')
                ->label('Export Aset')
                ->icon('heroicon-o-document-chart-bar')
                ->color('success')
                ->action(function () {
                    $fileName = 'Aset-' . str_replace(' ', '-', $this->record->name) . '-' . date('Y-m-d') . '.xlsx';
                    return Excel::download(new LocationAssetSimpleExport($this->record), $fileName);
                }),

            Actions\Action::make('qrcodeLokasi')
                ->label('Lokasi QR Code')
                ->icon('heroicon-o-qr-code')
                ->color('info')
                ->url(route('asset.lokasi', ['id' => $this->record->id]))
                ->openUrlInNewTab(),

            Actions\Action::make('qrcodeAset')
                ->label('Assets Lokasi QR Code')
                ->icon('heroicon-o-qr-code')
                ->color('gray')
                ->url(route('asset.ruangan', ['id' => $this->record->id]))
                ->openUrlInNewTab(),
        ];
    }
}
