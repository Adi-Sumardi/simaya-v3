<?php

namespace App\Filament\Resources\AssetDispositionResource\Pages;

use App\Filament\Resources\AssetDispositionResource;
use Filament\Actions;
use Filament\Resources\Pages\ViewRecord;
use Filament\Notifications\Notification;

class ViewAssetDisposition extends ViewRecord
{
    protected static string $resource = AssetDispositionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\EditAction::make()
                ->visible(fn () => $this->record->isDraft()),

            Actions\Action::make('complete')
                ->label('Selesaikan Disposisi')
                ->icon('heroicon-o-check-badge')
                ->color('success')
                ->requiresConfirmation()
                ->modalHeading('Selesaikan Disposisi')
                ->modalDescription('Semua aset akan ditandai sebagai "disposed". Proses ini tidak dapat dibatalkan.')
                ->visible(fn () => $this->record->isDraft())
                ->action(function () {
                    if ($this->record->complete()) {
                        Notification::make()
                            ->success()
                            ->title('Disposisi Selesai')
                            ->body('Semua aset berhasil didisposisi.')
                            ->send();

                        $this->redirect($this->getResource()::getUrl('view', ['record' => $this->record]));
                    }
                }),

            Actions\Action::make('cancel')
                ->label('Batalkan')
                ->icon('heroicon-o-x-circle')
                ->color('danger')
                ->requiresConfirmation()
                ->modalHeading('Batalkan Disposisi')
                ->modalDescription('Apakah Anda yakin ingin membatalkan disposisi ini?')
                ->visible(fn () => $this->record->isDraft())
                ->action(function () {
                    if ($this->record->cancel()) {
                        Notification::make()
                            ->warning()
                            ->title('Disposisi Dibatalkan')
                            ->body('Disposisi aset telah dibatalkan.')
                            ->send();

                        $this->redirect($this->getResource()::getUrl('view', ['record' => $this->record]));
                    }
                }),

            Actions\Action::make('qrcode')
                ->label('Lihat QR Code')
                ->icon('heroicon-o-qr-code')
                ->color('info')
                ->url(fn () => route('disposition.qrcode', $this->record))
                ->openUrlInNewTab(),
        ];
    }
}
