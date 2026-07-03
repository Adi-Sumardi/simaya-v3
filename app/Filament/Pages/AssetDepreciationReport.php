<?php

namespace App\Filament\Pages;

use App\Exports\AssetDepreciationExport;
use App\Models\Asset;
use App\Models\Category;
use App\Models\Unit;
use Filament\Pages\Actions\Action;
use Filament\Pages\Page;
use Filament\Tables;
use Filament\Tables\Concerns\InteractsWithTable;
use Filament\Tables\Contracts\HasTable;
use Filament\Tables\Table;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class AssetDepreciationReport extends Page implements HasTable
{
    use InteractsWithTable;

    protected static ?string $navigationIcon = 'heroicon-o-arrow-trending-down';

    protected static ?string $navigationLabel = 'Laporan Penyusutan';

    protected static ?string $navigationGroup = 'Manajemen Aset';

    protected static ?int $navigationSort = 20;

    protected static string $view = 'filament.pages.asset-depreciation-report';

    public static function canAccess(): bool
    {
        $user = Auth::user();

        return $user && $user->hasRole(['super_admin', 'Manajer', 'Manager', 'Kabag', 'Unit']);
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('export')
                ->label('Export Excel')
                ->icon('heroicon-o-arrow-up-tray')
                ->color('gray')
                ->action(function () {
                    return Excel::download(
                        new AssetDepreciationExport($this->tableFilters['unit_id']['value'] ?? null, $this->tableFilters['category_id']['value'] ?? null),
                        'laporan-penyusutan-aset.xlsx'
                    );
                }),
        ];
    }

    public function table(Table $table): Table
    {
        $user = Auth::user();

        return $table
            ->query(
                Asset::query()
                    ->with(['unit', 'location', 'category'])
                    ->notTransferred()
                    ->when($user->hasRole('Unit') && $user->unit_id, function (Builder $query) use ($user) {
                        $query->where('unit_id', $user->unit_id);
                    })
            )
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nama Aset')
                    ->weight('bold')
                    ->description(fn (Asset $record) => "No. Aset {$record->entries_number} · " . ($record->location?->name ?? '-'))
                    ->searchable(),

                Tables\Columns\TextColumn::make('aquisition_date')
                    ->label('Tgl Perolehan')
                    ->date('d M Y')
                    ->placeholder('— belum diisi')
                    ->sortable(),

                Tables\Columns\TextColumn::make('price')
                    ->label('Harga Beli')
                    ->money('IDR', locale: 'id')
                    ->placeholder('—')
                    ->sortable(),

                Tables\Columns\TextColumn::make('depreciation_percent')
                    ->label('Progres Susut')
                    ->formatStateUsing(fn (?float $state): string => $state === null ? 'Tidak dapat dihitung' : number_format($state, 1) . '%')
                    ->color(fn (Asset $record): string => match ($record->depreciation_status) {
                        'fully_depreciated' => 'danger',
                        'depreciating' => 'warning',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('book_value')
                    ->label('Nilai Buku')
                    ->money('IDR', locale: 'id')
                    ->placeholder('—')
                    ->weight('bold')
                    ->color('primary')
                    ->sortable(),

                Tables\Columns\TextColumn::make('depreciation_status')
                    ->label('Status')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'fully_depreciated' => 'Habis Susut',
                        'depreciating' => 'Menyusut',
                        default => 'Data Kurang',
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'fully_depreciated' => 'danger',
                        'depreciating' => 'warning',
                        default => 'gray',
                    }),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('unit_id')
                    ->label('Unit')
                    ->options(fn () => Unit::pluck('name', 'id'))
                    ->visible(fn () => ! (Auth::user()->hasRole('Unit') && Auth::user()->unit_id)),

                Tables\Filters\SelectFilter::make('category_id')
                    ->label('Kategori')
                    ->options(fn () => Category::pluck('name', 'id')),

                Tables\Filters\Filter::make('depreciation_status')
                    ->form([
                        \Filament\Forms\Components\Select::make('value')
                            ->label('Status Susut')
                            ->options([
                                'depreciating' => 'Masih Menyusut',
                                'fully_depreciated' => 'Sudah Habis',
                                'no_data' => 'Data Kurang',
                            ]),
                    ])
                    ->query(function (Builder $query, array $data) {
                        return match ($data['value'] ?? null) {
                            'fully_depreciated' => $query->whereNotNull('price')->whereNotNull('aquisition_date')
                                ->where('price', '>', 0)
                                ->whereDate('aquisition_date', '<=', now()->subYears(10)),
                            'depreciating' => $query->whereNotNull('price')->whereNotNull('aquisition_date')
                                ->where('price', '>', 0)
                                ->whereDate('aquisition_date', '>', now()->subYears(10)),
                            'no_data' => $query->where(function (Builder $q) {
                                $q->whereNull('price')->orWhere('price', '<=', 0)->orWhereNull('aquisition_date');
                            }),
                            default => $query,
                        };
                    }),
            ])
            ->defaultSort('aquisition_date', 'asc')
            ->paginated([10, 25, 50]);
    }
}
