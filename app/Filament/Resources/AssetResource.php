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
                Forms\Components\Section::make('Informasi Aset')
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
                        Forms\Components\TextInput::make('brand')
                            ->required()
                            ->label('Merk')
                            ->maxLength(255),
                        Forms\Components\TextInput::make('description')
                            ->label('Deskripsi')
                            ->required()
                            ->maxLength(555),
                    ])->columns(2),

                Forms\Components\Section::make('Status & Kondisi')
                    ->schema([
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
                    ])->columns(3),

                Forms\Components\Section::make('Informasi Perolehan')
                    ->schema([
                        Forms\Components\TextInput::make('price')
                            ->label('Harga')
                            ->required()
                            ->numeric()
                            ->minValue(0)
                            ->maxValue(90000000000),
                        Forms\Components\TextInput::make('aquisition')
                            ->label('Pemilik')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\DatePicker::make('aquisition_date')
                            ->required()
                            ->label('Tanggal Perolehan')
                            ->date()
                            ->placeholder('YYYY-MM-DD'),
                    ])->columns(3),

                Forms\Components\Section::make('Lokasi & Kategori')
                    ->schema([
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

                Forms\Components\Section::make('Foto Aset')
                    ->schema([
                        Forms\Components\FileUpload::make('image')
                            ->preserveFilenames()
                            ->directory('assets')
                            ->label('Upload Image')
                            ->maxSize(1024)
                            ->image(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(function (Builder $query) {
                $user = Auth::user();

                // Eager load semua relasi untuk menghindari N+1 query
                $query->with(['unit', 'location', 'aktiva', 'category', 'tool', 'year']);

                if ($user->hasRole('super_admin') || $user->hasRole(['Manajer', 'Manager', 'Kabag'])) {
                    return;
                }

                // Role Unit: hanya tampilkan aset dari unit mereka
                if ($user->hasRole('Unit') && $user->unit_id) {
                    $query->where('unit_id', $user->unit_id);
                }
            })
            ->defaultPaginationPageOption(25)
            ->deferLoading()
            ->striped()
            ->columns([
                Tables\Columns\ImageColumn::make('image')
                    ->label('Foto')
                    ->circular()
                    ->size(40)
                    ->defaultImageUrl(fn ($record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->name) . '&background=random&size=40'),

                Tables\Columns\TextColumn::make('name')
                    ->label('Nama Aset')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn ($record) => $record->brand ?? '-'),

                Tables\Columns\TextColumn::make('entries_number')
                    ->label('No. Aset')
                    ->searchable()
                    ->sortable()
                    ->badge()
                    ->color('gray'),

                Tables\Columns\TextColumn::make('unit.name')
                    ->label('Unit')
                    ->searchable()
                    ->sortable()
                    ->icon('heroicon-o-building-office')
                    ->iconColor('primary'),

                Tables\Columns\TextColumn::make('location.name')
                    ->label('Lokasi')
                    ->searchable()
                    ->sortable()
                    ->icon('heroicon-o-map-pin')
                    ->iconColor('success')
                    ->toggleable(),

                Tables\Columns\TextColumn::make('category.name')
                    ->label('Kategori')
                    ->searchable()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('price')
                    ->label('Harga')
                    ->money('IDR', locale: 'id')
                    ->sortable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('condition')
                    ->label('Kondisi')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'bagus' => 'Bagus',
                        'rusak' => 'Rusak',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'bagus' => 'success',
                        'rusak' => 'danger',
                        default => 'gray',
                    })
                    ->icon(fn (string $state): string => match ($state) {
                        'bagus' => 'heroicon-o-check-circle',
                        'rusak' => 'heroicon-o-x-circle',
                        default => 'heroicon-o-question-mark-circle',
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'active' => 'Aktif',
                        'inactive' => 'Tidak Aktif',
                        'deleted' => 'Dihapus',
                        'repaired' => 'Diperbaiki',
                        'transferred' => 'Ditransfer',
                        default => $state,
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'active' => 'success',
                        'inactive' => 'danger',
                        'deleted' => 'warning',
                        'repaired' => 'gray',
                        'transferred' => 'info',
                        default => 'gray',
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('aquisition_date')
                    ->label('Tgl Perolehan')
                    ->date('d M Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Terakhir Update')
                    ->since()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\TrashedFilter::make(),
                Tables\Filters\SelectFilter::make('unit_id')
                    ->relationship('unit', 'name')
                    ->label('Unit')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('location_id')
                    ->relationship('location', 'name')
                    ->label('Lokasi')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('category_id')
                    ->relationship('category', 'name')
                    ->label('Kategori')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('tool_id')
                    ->relationship('tool', 'name')
                    ->label('Alat')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('year_id')
                    ->relationship('year', 'year')
                    ->label('Tahun')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('aktiva_id')
                    ->relationship('aktiva', 'name')
                    ->label('Aktiva')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'active' => 'Aktif',
                        'inactive' => 'Tidak Aktif',
                        'deleted' => 'Dihapus',
                        'repaired' => 'Diperbaiki',
                        'transferred' => 'Ditransfer',
                    ])
                    ->label('Status'),
                Tables\Filters\SelectFilter::make('condition')
                    ->options([
                        'bagus' => 'Bagus',
                        'rusak' => 'Rusak',
                    ])
                    ->label('Kondisi'),
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
                \Filament\Infolists\Components\Section::make('Informasi Aset')
                    ->schema([
                        ImageEntry::make('image')
                            ->label('Foto Aset')
                            ->size(200)
                            ->defaultImageUrl(fn ($record) => 'https://ui-avatars.com/api/?name=' . urlencode($record->name) . '&background=random&size=200'),

                        \Filament\Infolists\Components\Grid::make(3)
                            ->schema([
                                TextEntry::make('name')
                                    ->label('Nama Aset')
                                    ->weight('bold')
                                    ->size('lg'),
                                TextEntry::make('entries_number')
                                    ->label('Nomor Aset')
                                    ->badge()
                                    ->color('primary'),
                                TextEntry::make('brand')
                                    ->label('Merk'),
                            ]),

                        TextEntry::make('description')
                            ->label('Deskripsi')
                            ->columnSpanFull(),
                    ]),

                \Filament\Infolists\Components\Section::make('Status & Kondisi')
                    ->schema([
                        \Filament\Infolists\Components\Grid::make(4)
                            ->schema([
                                TextEntry::make('status')
                                    ->label('Status')
                                    ->badge()
                                    ->formatStateUsing(fn (string $state): string => match ($state) {
                                        'active' => 'Aktif',
                                        'inactive' => 'Tidak Aktif',
                                        'deleted' => 'Dihapus',
                                        'repaired' => 'Diperbaiki',
                                        'transferred' => 'Ditransfer',
                                        default => $state,
                                    })
                                    ->color(fn (string $state): string => match ($state) {
                                        'active' => 'success',
                                        'inactive' => 'danger',
                                        'deleted' => 'warning',
                                        'repaired' => 'gray',
                                        'transferred' => 'info',
                                        default => 'gray',
                                    }),
                                TextEntry::make('condition')
                                    ->label('Kondisi')
                                    ->badge()
                                    ->formatStateUsing(fn (string $state): string => match ($state) {
                                        'bagus' => 'Bagus',
                                        'rusak' => 'Rusak',
                                        default => $state,
                                    })
                                    ->color(fn (string $state): string => match ($state) {
                                        'bagus' => 'success',
                                        'rusak' => 'danger',
                                        default => 'gray',
                                    }),
                                TextEntry::make('portability')
                                    ->label('Tipe')
                                    ->badge()
                                    ->color('gray'),
                                TextEntry::make('price')
                                    ->label('Harga')
                                    ->money('IDR', locale: 'id'),
                            ]),
                    ]),

                \Filament\Infolists\Components\Section::make('Lokasi & Kategori')
                    ->schema([
                        \Filament\Infolists\Components\Grid::make(3)
                            ->schema([
                                TextEntry::make('unit.name')
                                    ->label('Unit')
                                    ->icon('heroicon-o-building-office'),
                                TextEntry::make('location.name')
                                    ->label('Lokasi')
                                    ->icon('heroicon-o-map-pin'),
                                TextEntry::make('category.name')
                                    ->label('Kategori')
                                    ->icon('heroicon-o-tag'),
                                TextEntry::make('tool.name')
                                    ->label('Jenis Barang')
                                    ->icon('heroicon-o-wrench'),
                                TextEntry::make('aktiva.name')
                                    ->label('Aktiva')
                                    ->icon('heroicon-o-document-text'),
                                TextEntry::make('year.year')
                                    ->label('Tahun')
                                    ->icon('heroicon-o-calendar'),
                            ]),
                    ]),

                \Filament\Infolists\Components\Section::make('Informasi Perolehan')
                    ->schema([
                        \Filament\Infolists\Components\Grid::make(3)
                            ->schema([
                                TextEntry::make('aquisition')
                                    ->label('Pemilik/Sumber'),
                                TextEntry::make('aquisition_date')
                                    ->label('Tanggal Perolehan')
                                    ->date('d F Y'),
                                TextEntry::make('updated_at')
                                    ->label('Terakhir Diupdate')
                                    ->since(),
                            ]),
                    ]),
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
            ])
            ->notTransferred(); // Exclude aset yang sudah ditransfer
    }
}
