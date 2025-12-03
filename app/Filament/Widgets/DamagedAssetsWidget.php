<?php

namespace App\Filament\Widgets;

use App\Models\Asset;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Support\Facades\Auth;

class DamagedAssetsWidget extends BaseWidget
{
    protected static ?string $heading = 'Aset Rusak - Perlu Perhatian';

    protected int|string|array $columnSpan = 'full';

    protected static ?int $sort = 7;

    public function table(Table $table): Table
    {
        $user = Auth::user();

        return $table
            ->query(
                Asset::query()
                    ->with(['unit', 'location'])
                    ->notTransferred()
                    ->where('condition', 'rusak')
                    ->when($user->hasRole('Unit') && $user->unit_id, function ($query) use ($user) {
                        $query->where('unit_id', $user->unit_id);
                    })
                    ->latest('updated_at')
                    ->limit(10)
            )
            ->columns([
                Tables\Columns\ImageColumn::make('image')
                    ->label('')
                    ->circular()
                    ->size(35)
                    ->defaultImageUrl(fn ($record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->name) . '&background=ef4444&color=fff&size=35'),

                Tables\Columns\TextColumn::make('name')
                    ->label('Nama Aset')
                    ->searchable()
                    ->weight('bold')
                    ->description(fn ($record) => $record->brand ?? '-'),

                Tables\Columns\TextColumn::make('entries_number')
                    ->label('No. Aset')
                    ->badge()
                    ->color('gray'),

                Tables\Columns\TextColumn::make('unit.name')
                    ->label('Unit')
                    ->icon('heroicon-o-building-office')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('location.name')
                    ->label('Lokasi')
                    ->icon('heroicon-o-map-pin'),

                Tables\Columns\TextColumn::make('price')
                    ->label('Nilai')
                    ->money('IDR', locale: 'id')
                    ->sortable(),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Update')
                    ->since(),
            ])
            ->actions([
                Tables\Actions\Action::make('edit')
                    ->label('Edit')
                    ->icon('heroicon-o-pencil')
                    ->url(fn (Asset $record) => route('filament.admin.resources.assets.edit', $record))
                    ->color('warning'),
            ])
            ->paginated(false)
            ->emptyStateHeading('Tidak ada aset rusak')
            ->emptyStateDescription('Semua aset dalam kondisi baik')
            ->emptyStateIcon('heroicon-o-check-circle');
    }
}
