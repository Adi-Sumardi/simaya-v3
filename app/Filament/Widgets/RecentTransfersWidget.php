<?php

namespace App\Filament\Widgets;

use App\Models\AssetTransfer;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Support\Facades\Auth;

class RecentTransfersWidget extends BaseWidget
{
    protected static ?string $heading = 'Transfer Aset Terbaru';

    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = 6;

    public function table(Table $table): Table
    {
        $user = Auth::user();

        return $table
            ->query(
                AssetTransfer::query()
                    ->with(['fromUnit', 'toLocation', 'requestedBy'])
                    ->when($user->hasRole('Unit'), function ($query) use ($user) {
                        $query->where('requested_by', $user->id);
                    })
                    ->latest()
                    ->limit(5)
            )
            ->columns([
                Tables\Columns\TextColumn::make('transfer_number')
                    ->label('No. Transfer')
                    ->searchable()
                    ->weight('bold'),

                Tables\Columns\TextColumn::make('fromUnit.name')
                    ->label('Unit')
                    ->icon('heroicon-o-building-office')
                    ->iconColor('primary'),

                Tables\Columns\TextColumn::make('toLocation.name')
                    ->label('Ke Lokasi')
                    ->icon('heroicon-o-map-pin')
                    ->iconColor('success'),

                Tables\Columns\TextColumn::make('items_count')
                    ->label('Aset')
                    ->counts('items')
                    ->badge()
                    ->color('info'),

                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'Pending',
                        'approved' => 'Disetujui',
                        'rejected' => 'Ditolak',
                        'completed' => 'Selesai',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'approved' => 'info',
                        'rejected' => 'danger',
                        'completed' => 'success',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Tanggal')
                    ->since()
                    ->sortable(),
            ])
            ->actions([
                Tables\Actions\Action::make('view')
                    ->label('Lihat')
                    ->icon('heroicon-o-eye')
                    ->url(fn (AssetTransfer $record) => route('filament.admin.resources.asset-transfers.view', $record))
                    ->color('gray'),
            ])
            ->paginated(false)
            ->defaultSort('created_at', 'desc');
    }

    public static function canView(): bool
    {
        $user = Auth::user();
        return $user && $user->hasRole(['super_admin', 'Manajer', 'Manager', 'Kabag', 'Unit']);
    }
}
