<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AssetResource\Pages;
use App\Filament\Resources\AssetResource\RelationManagers;
use App\Filament\Resources\AssetResource\Widgets\AssetStats;
use App\Models\Asset;
use Filament\Forms;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Form;
use Filament\Infolists\Components\ImageEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Infolists\Infolist;
use Filament\Tables\Columns\ImageColumn;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Filament\Notifications\Notification;
use Illuminate\Support\Facades\Storage;

class AssetResource extends Resource
{
    protected static ?string $model = Asset::class;

    protected static ?string $navigationIcon = 'heroicon-o-server-stack';

    protected static ?string $navigationLabel = 'Assets';

    public static ?string $pluralLabel = 'List Assets';

    public static ?string $label = 'Asset';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Grid::make()
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\TextInput::make('entries_number')
                            ->label('Nomor Urut')
                            ->required()
                            ->numeric()
                            ->minValue(1)
                            ->maxValue(1000),
                        ])->columns(2),
                Forms\Components\Grid::make()
                        ->schema([
                            Forms\Components\TextInput::make('brand')
                                ->required()
                                ->label('Merk')
                                ->maxLength(255),
                            Forms\Components\TextInput::make('description')
                                ->label('Deskripsi')
                                ->required()
                                ->maxLength(555),
                            ])->columns(2),
                Forms\Components\Grid::make()
                    ->schema([
                        Forms\Components\TextInput::make('price')
                            ->label('Harga')
                            ->required()
                            ->label('Harga')
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(90000000000),
                        Forms\Components\TextInput::make('aquisition')
                            ->label('Pemilik')
                            ->required()
                            ->label('Pemilik')
                            ->maxLength(255),
                        Forms\Components\DatePicker::make('aquisition_date')
                            ->required()
                            ->label('Tanggal Perolehan')
                            ->date()
                            ->placeholder('YYYY-MM-DD'),
                        Forms\Components\Select::make('status')
                            ->required()
                            ->searchable()
                            ->options([
                                'active' => 'Aktif',
                                'inactive' => 'Tidak Aktif',
                                'deleted' => 'Dihapus',
                                'repaired' => 'Diperbaiki',
                            ])
                            ->default('active'),
                        Forms\Components\Select::make('condition')
                            ->required()
                            ->label('Kondisi')
                            ->searchable()
                            ->options([
                                'bagus' => 'Bagus',
                                'rusak' => 'Rusak',
                            ])
                            ->default('bagus'),
                        Forms\Components\Select::make('portability')
                            ->required()
                            ->searchable()
                            ->options([
                                'portable' => 'Portable',
                                'fixtures' => 'Fixtures',
                            ])
                            ->default('portable'),
                        Forms\Components\Hidden::make('user_id')
                            ->default(Auth::user()->id),
                        Forms\Components\Select::make('unit_id')
                            ->relationship('unit', 'name')
                            ->searchable()
                            ->preload()
                            ->required()
                            ->reactive(),

                        Forms\Components\Select::make('location_id')
                            ->required()
                            ->label('Lokasi')
                            ->searchable()
                            ->preload()
                            ->options(function (callable $get) {
                                $unitId = $get('unit_id');
                                if (!$unitId) {
                                    return [];
                                }
                                return \App\Models\Location::where('unit_id', $unitId)->pluck('name', 'id')->toArray();
                            }),
                        Forms\Components\Select::make('tool_id')
                            ->relationship('tool', 'name')
                            ->label('Alat/Barang')
                            ->searchable()
                            ->preload()
                            ->required(),

                        Forms\Components\Select::make('category_id')
                            ->relationship('category', 'name')
                            ->label('Kategori')
                            ->searchable()
                            ->preload()
                            ->required(),

                        Forms\Components\Select::make('year_id')
                            ->relationship('year', 'year')
                            ->label('Tahun')
                            ->searchable()
                            ->preload()
                            ->required(),

                        Forms\Components\Select::make('aktiva_id')
                            ->relationship('aktiva', 'name')
                            ->label('Aktiva')
                            ->searchable()
                            ->preload()
                            ->required(),
                ])->columns(3),

                Forms\Components\Grid::make()
                    ->schema([
                        Forms\Components\FileUpload::make('image')
                            ->preserveFilenames()
                            ->directory('assets')
                            ->label('Upload Image')
                            ->maxSize(1024)
                            ->columnSpanFull()
                            ->image(),
                ])->columns(1),

            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(function (Builder $query) {
                $user = Auth::user();

                if ($user->hasRole('Super Admin')) {
                    return;
                }

                if ($user->hasRole('Unit')) {
                    $query->where('user_id', $user->id);
                }

            })
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nama Aset')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('entries_number')
                    ->label('Nomor Urut')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('brand')
                    ->label('Merk')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('unit.name')
                    ->label('Unit')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('location.name')
                    ->label('Lokasi')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('aktiva.name')
                    ->label('Aktiva')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('condition')
                    ->label('Kondisi')
                    ->searchable()
                    ->badge()
                    ->colors([
                        'success' => 'bagus',
                        'danger' => 'rusak',
                    ])
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->searchable()
                    ->badge()
                    ->colors([
                        'success' => 'active',
                        'danger' => 'inactive',
                        'warning' => 'deleted',
                        'secondary' => 'repaired',
                    ])
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\TrashedFilter::make(),
                Tables\Filters\Filter::make('unit_id')
                    ->form([
                        Forms\Components\Select::make('unit_id')
                            ->relationship('unit', 'name')
                            ->label('Unit'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['unit_id'],
                                fn (Builder $query, $unit_id): Builder => $query->whereRelation('unit', 'id', '=', $unit_id),
                            );
                    }),
                Tables\Filters\Filter::make('location_id')
                    ->form([
                        Forms\Components\Select::make('location_id')
                            ->relationship('location', 'name')
                            ->label('Lokasi'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['location_id'],
                                fn (Builder $query, $location_id): Builder => $query->whereRelation('location', 'id', '=', $location_id),
                            );
                    }),
                Tables\Filters\Filter::make('category_id')
                    ->form([
                        Forms\Components\Select::make('category_id')
                            ->relationship('category', 'name')
                            ->label('Kategori'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['category_id'],
                                fn (Builder $query, $category_id): Builder => $query->whereRelation('category', 'id', '=', $category_id),
                            );
                    }),
                Tables\Filters\Filter::make('tool_id')
                    ->form([
                        Forms\Components\Select::make('tool_id')
                            ->relationship('tool', 'name')
                            ->label('Alat'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['tool_id'],
                                fn (Builder $query, $tool_id): Builder => $query->whereRelation('tool', 'id', '=', $tool_id),
                            );
                    }),
                Tables\Filters\Filter::make('year_id')
                    ->form([
                        Forms\Components\Select::make('year_id')
                            ->relationship('year', 'year')
                            ->label('Tahun'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['year_id'],
                                fn (Builder $query, $year_id): Builder => $query->whereRelation('year', 'id', '=', $year_id),
                            );
                    }),
                Tables\Filters\Filter::make('aktiva_id')
                    ->form([
                        Forms\Components\Select::make('aktiva_id')
                            ->relationship('aktiva', 'name')
                            ->label('Aktiva'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['aktiva_id'],
                                fn (Builder $query, $aktiva_id): Builder => $query->whereRelation('aktiva', 'id', '=', $aktiva_id),
                            );
                    }),

            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\ForceDeleteBulkAction::make(),
                    Tables\Actions\RestoreBulkAction::make(),

                    Tables\Actions\BulkAction::make('updateUnitLocation')
                    ->label('Change Unit dan Location')
                    ->form([
                        Select::make('unit_id')
                            ->label('Unit')
                            ->options(\App\Models\Unit::pluck('name', 'id')->toArray())
                            ->required()
                            ->reactive(),

                        Select::make('location_id')
                            ->label('Lokasi')
                            ->required()
                            ->options(function (callable $get) {
                                $unitId = $get('unit_id');
                                if (!$unitId) {
                                    return [];
                                }
                                return \App\Models\Location::where('unit_id', $unitId)->pluck('name', 'id')->toArray();
                            }),
                    ])
                    ->action(function (Collection $records, array $data): void {
                        foreach ($records as $record) {
                            $record->update([
                                'unit_id' => $data['unit_id'],
                                'location_id' => $data['location_id'],
                            ]);
                        }
                    })
                    ->deselectRecordsAfterCompletion()
                    ->requiresConfirmation()
                    ->color('primary')
                    ->icon('heroicon-o-arrow-path-rounded-square'),

                    Tables\Actions\BulkAction::make('uploadImage')
                    ->label('Add Image')
                    ->form([
                        Forms\Components\Grid::make()
                            ->schema([
                                FileUpload::make('image')
                                    ->preserveFilenames()
                                    ->directory('assets')
                                    ->label('Upload Image')
                                    ->maxSize(1024)
                                    ->columnSpanFull()
                                    ->image(),
                            ])->columns(1),
                    ])
                    ->action(function (Collection $records, array $data) {
                        $imagePath = $data['image'];

                        try {
                            foreach ($records as $record) {
                                $record->image = $imagePath;
                                $record->save();

                                if (method_exists($record, 'images')) {
                                    $record->images()->create(['path' => $imagePath]);
                                }
                            }

                            Notification::make()
                                ->success()
                                ->title('Berhasil')
                                ->body('Gambar berhasil ditambahkan ke asset terpilih.')
                                ->send();

                        } catch (\Exception $e) {
                            Notification::make()
                                ->danger()
                                ->title('Gagal')
                                ->body('Terjadi kesalahan: ' . $e->getMessage())
                                ->send();
                        }
                    })
                    ->icon('heroicon-o-photo'),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                ImageEntry::make('image')
                    ->label('Gambar Aset')
                    ->columnSpanFull(),
                TextEntry::make('name')
                    ->label('Nama Aset'),
                TextEntry::make('brand')
                    ->label('Merk'),
                TextEntry::make('entries_number')
                    ->label('Nomor Urut'),
                TextEntry::make('description')
                    ->label('Deskripsi'),
                TextEntry::make('price')
                    ->formatStateUsing(fn ($state) => 'Rp. ' . number_format($state, 0, ',', '.'))
                    ->label('Harga'),
                TextEntry::make('aquisition')
                    ->label('Pemilik'),
                TextEntry::make('aquisition_date')
                    ->label('Tanggal Perolehan'),
                TextEntry::make('status')
                    ->label('Status'),
                TextEntry::make('condition')
                    ->label('Kondisi'),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAssets::route('/'),
            'create' => Pages\CreateAsset::route('/create'),
            'edit' => Pages\EditAsset::route('/{record}/edit'),
            'view' => Pages\ViewAsset::route('/{record}/view'),
            'qrcode' => Pages\Qrcode::route('/qrcode'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->withoutGlobalScopes([
                SoftDeletingScope::class,
            ]);
    }
}
