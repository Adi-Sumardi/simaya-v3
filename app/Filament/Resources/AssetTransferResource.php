<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AssetTransferResource\Pages;
use App\Filament\Resources\AssetTransferResource\RelationManagers;
use App\Models\AssetTransfer;
use App\Models\Asset;
use App\Models\Location;
use App\Models\Unit;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Infolists\Infolist;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\ImageEntry;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Filament\Notifications\Notification;

class AssetTransferResource extends Resource
{
    protected static ?string $model = AssetTransfer::class;

    protected static ?string $navigationIcon = 'heroicon-o-arrow-path-rounded-square';

    protected static ?string $navigationLabel = 'Transfer Aset';

    protected static ?string $navigationGroup = 'Manajemen Aset';

    public static ?string $pluralLabel = 'Transfer Aset';

    public static ?string $label = 'Transfer Aset';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informasi Transfer')
                    ->schema([
                        Forms\Components\TextInput::make('transfer_number')
                            ->label('Nomor Transfer')
                            ->disabled()
                            ->dehydrated(false)
                            ->placeholder('Auto-generated'),

                        Forms\Components\Select::make('from_unit_id')
                            ->label('Dari Unit')
                            ->options(function () {
                                $user = Auth::user();

                                // Admin & Manajer bisa lihat semua unit
                                if ($user->hasRole(['Super Admin', 'Manajer', 'Manager'])) {
                                    return Unit::pluck('name', 'id');
                                }

                                // Role Unit hanya bisa lihat unit sendiri
                                if ($user->unit_id) {
                                    return Unit::where('id', $user->unit_id)->pluck('name', 'id');
                                }

                                return [];
                            })
                            ->default(function () {
                                $user = Auth::user();
                                // Auto-select unit untuk role Unit
                                if (!$user->hasRole(['Super Admin', 'Manajer', 'Manager']) && $user->unit_id) {
                                    return $user->unit_id;
                                }
                                return null;
                            })
                            ->required()
                            ->searchable()
                            ->preload()
                            ->live()
                            ->disabled(function () {
                                $user = Auth::user();
                                // Disable jika role Unit (sudah auto-select)
                                return !$user->hasRole(['Super Admin', 'Manajer', 'Manager']) && $user->unit_id;
                            })
                            ->dehydrated(true)
                            ->afterStateUpdated(function ($set) {
                                $set('from_location_id', null);
                                $set('selected_assets', []);
                            }),

                        Forms\Components\Select::make('from_location_id')
                            ->label('Dari Lokasi')
                            ->options(function (callable $get) {
                                $unitId = $get('from_unit_id');
                                if (!$unitId) return [];
                                return Location::where('unit_id', $unitId)->pluck('name', 'id');
                            })
                            ->required()
                            ->searchable()
                            ->live()
                            ->afterStateUpdated(fn ($set) => $set('selected_assets', [])),

                        Forms\Components\Select::make('to_location_id')
                            ->label('Ke Lokasi (Gudang Yayasan)')
                            ->relationship('toLocation', 'name')
                            ->required()
                            ->searchable()
                            ->preload()
                            ->helperText('Pilih lokasi gudang yayasan sebagai tujuan'),

                        Forms\Components\Textarea::make('reason')
                            ->label('Alasan Transfer')
                            ->required()
                            ->rows(3)
                            ->placeholder('Jelaskan alasan transfer aset...'),

                        Forms\Components\Textarea::make('notes')
                            ->label('Catatan Tambahan')
                            ->rows(2)
                            ->placeholder('Catatan tambahan (opsional)'),

                        Forms\Components\Hidden::make('requested_by')
                            ->default(fn () => Auth::id()),

                        Forms\Components\Hidden::make('status')
                            ->default('pending'),
                    ])->columns(2),

                Forms\Components\Section::make('Pilih Aset untuk Transfer')
                    ->description('Tambahkan aset yang akan ditransfer. Gunakan tombol "Pilih Semua" untuk memilih semua aset sekaligus.')
                    ->schema([
                        Forms\Components\Placeholder::make('location_info')
                            ->label('')
                            ->content(function (callable $get) {
                                $locationId = $get('from_location_id');
                                if (!$locationId) return '';

                                $location = Location::find($locationId);
                                $assetCount = Asset::where('location_id', $locationId)
                                    ->notTransferred()
                                    ->count();

                                return "📍 Lokasi: {$location?->name} | 📦 Total Aset Tersedia: {$assetCount}";
                            }),

                        Forms\Components\Actions::make([
                            Forms\Components\Actions\Action::make('select_all')
                                ->label('Pilih Semua Aset')
                                ->icon('heroicon-o-check-circle')
                                ->color('success')
                                ->size('sm')
                                ->action(function (callable $get, callable $set) {
                                    $locationId = $get('from_location_id');
                                    if (!$locationId) return;

                                    $assets = Asset::where('location_id', $locationId)
                                        ->notTransferred()
                                        ->get();

                                    $items = $assets->map(fn ($asset) => [
                                        'asset_id' => $asset->id,
                                        'condition_notes' => null,
                                        'photo_before' => null,
                                    ])->toArray();

                                    $set('items', $items);
                                }),

                            Forms\Components\Actions\Action::make('clear_all')
                                ->label('Hapus Semua')
                                ->icon('heroicon-o-x-circle')
                                ->color('danger')
                                ->size('sm')
                                ->action(fn (callable $set) => $set('items', [])),
                        ])->columnSpanFull(),

                        Forms\Components\Repeater::make('items')
                            ->relationship()
                            ->label('Daftar Aset Transfer')
                            ->schema([
                                Forms\Components\Select::make('asset_id')
                                    ->label('Pilih Aset')
                                    ->options(function (callable $get) {
                                        $locationId = $get('../../from_location_id');
                                        if (!$locationId) return [];

                                        return Asset::where('location_id', $locationId)
                                            ->notTransferred()
                                            ->get()
                                            ->mapWithKeys(fn ($asset) => [
                                                $asset->id => "{$asset->name} ({$asset->entries_number}) - {$asset->brand}"
                                            ]);
                                    })
                                    ->required()
                                    ->searchable()
                                    ->live()
                                    ->distinct()
                                    ->disableOptionsWhenSelectedInSiblingRepeaterItems()
                                    ->columnSpan(2),

                                Forms\Components\Textarea::make('condition_notes')
                                    ->label('Catatan Kondisi')
                                    ->rows(1)
                                    ->placeholder('Catatan kondisi (opsional)')
                                    ->columnSpan(1),

                                Forms\Components\FileUpload::make('photo_before')
                                    ->label('Foto')
                                    ->image()
                                    ->directory('transfer-photos')
                                    ->maxSize(2048)
                                    ->columnSpan(1),
                            ])
                            ->columns(4)
                            ->defaultItems(0)
                            ->addActionLabel('+ Tambah Aset')
                            ->reorderable(false)
                            ->itemLabel(fn (array $state): ?string =>
                                isset($state['asset_id']) ? Asset::find($state['asset_id'])?->name : 'Pilih Aset'
                            )
                            ->collapsible()
                            ->cloneable(false)
                            ->required()
                            ->minItems(1)
                            ->grid(2),

                        Forms\Components\Placeholder::make('selected_count')
                            ->label('')
                            ->content(fn (callable $get) => '✅ ' . \count($get('items') ?? []) . ' aset dipilih untuk transfer'),
                    ])
                    ->visible(fn (callable $get) => $get('from_location_id') !== null),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(function (Builder $query) {
                $user = Auth::user();

                $query->with(['fromUnit', 'fromLocation', 'toLocation', 'requestedBy', 'approvedBy', 'items']);

                // Unit hanya lihat transfer mereka sendiri
                if ($user->hasRole('Unit')) {
                    $query->where('requested_by', $user->id);
                }
            })
            ->columns([
                Tables\Columns\TextColumn::make('transfer_number')
                    ->label('No. Transfer')
                    ->searchable()
                    ->sortable()
                    ->copyable(),

                Tables\Columns\TextColumn::make('fromUnit.name')
                    ->label('Dari Unit')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('fromLocation.name')
                    ->label('Dari Lokasi')
                    ->searchable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('toLocation.name')
                    ->label('Ke Lokasi')
                    ->searchable(),

                Tables\Columns\TextColumn::make('items_count')
                    ->label('Jml Aset')
                    ->counts('items')
                    ->badge()
                    ->color('primary'),

                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->colors([
                        'warning' => 'pending',
                        'info' => 'approved',
                        'danger' => 'rejected',
                        'success' => 'completed',
                    ])
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'Menunggu Approval',
                        'approved' => 'Disetujui',
                        'rejected' => 'Ditolak',
                        'completed' => 'Selesai',
                        default => $state,
                    }),

                Tables\Columns\TextColumn::make('requestedBy.name')
                    ->label('Diajukan Oleh')
                    ->searchable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('requested_at')
                    ->label('Tgl Pengajuan')
                    ->dateTime('d M Y H:i')
                    ->sortable(),

                Tables\Columns\TextColumn::make('approvedBy.name')
                    ->label('Diproses Oleh')
                    ->placeholder('-')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Menunggu Approval',
                        'approved' => 'Disetujui',
                        'rejected' => 'Ditolak',
                        'completed' => 'Selesai',
                    ]),
                Tables\Filters\SelectFilter::make('from_unit_id')
                    ->relationship('fromUnit', 'name')
                    ->label('Unit'),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make()
                    ->visible(fn (AssetTransfer $record) => $record->isPending()),

                // Approve Action (Manager only)
                Tables\Actions\Action::make('approve')
                    ->label('Setujui')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Setujui Transfer Aset')
                    ->modalDescription('Apakah Anda yakin ingin menyetujui transfer aset ini?')
                    ->visible(fn (AssetTransfer $record) =>
                        $record->isPending() && Auth::user()->hasRole(['Super Admin', 'Manajer', 'Manager'])
                    )
                    ->action(function (AssetTransfer $record) {
                        if ($record->approve(Auth::user())) {
                            Notification::make()
                                ->success()
                                ->title('Transfer Disetujui')
                                ->body('Transfer aset berhasil disetujui.')
                                ->send();
                        }
                    }),

                // Reject Action (Manager only)
                Tables\Actions\Action::make('reject')
                    ->label('Tolak')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('Tolak Transfer Aset')
                    ->form([
                        Forms\Components\Textarea::make('rejection_reason')
                            ->label('Alasan Penolakan')
                            ->required()
                            ->rows(3),
                    ])
                    ->visible(fn (AssetTransfer $record) =>
                        $record->isPending() && Auth::user()->hasRole(['Super Admin', 'Manajer', 'Manager'])
                    )
                    ->action(function (AssetTransfer $record, array $data) {
                        if ($record->reject(Auth::user(), $data['rejection_reason'])) {
                            Notification::make()
                                ->warning()
                                ->title('Transfer Ditolak')
                                ->body('Transfer aset telah ditolak.')
                                ->send();
                        }
                    }),

                // Complete Action (Manager only)
                Tables\Actions\Action::make('complete')
                    ->label('Selesaikan')
                    ->icon('heroicon-o-check-badge')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Selesaikan Transfer')
                    ->modalDescription('Aset akan dipindahkan ke lokasi tujuan. Pastikan semua aset sudah diterima dengan benar.')
                    ->visible(fn (AssetTransfer $record) =>
                        $record->isApproved() && Auth::user()->hasRole(['Super Admin', 'Manajer', 'Manager'])
                    )
                    ->action(function (AssetTransfer $record) {
                        if ($record->complete()) {
                            Notification::make()
                                ->success()
                                ->title('Transfer Selesai')
                                ->body('Semua aset berhasil dipindahkan ke lokasi tujuan.')
                                ->send();
                        }
                    }),

                // Print Berita Acara
                Tables\Actions\Action::make('print')
                    ->label('Cetak BA')
                    ->icon('heroicon-o-printer')
                    ->color('gray')
                    ->url(fn (AssetTransfer $record) => route('transfer.print', $record))
                    ->openUrlInNewTab()
                    ->visible(fn (AssetTransfer $record) =>
                        in_array($record->status, ['approved', 'completed'])
                    ),
            ])
            ->bulkActions([
                //
            ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                // Header dengan Status Badge besar
                \Filament\Infolists\Components\Grid::make(3)
                    ->schema([
                        Section::make()
                            ->schema([
                                TextEntry::make('transfer_number')
                                    ->label('Nomor Transfer')
                                    ->size('lg')
                                    ->weight('bold')
                                    ->icon('heroicon-o-document-text')
                                    ->iconColor('primary'),
                            ])
                            ->columnSpan(1),

                        Section::make()
                            ->schema([
                                TextEntry::make('status')
                                    ->label('Status Transfer')
                                    ->badge()
                                    ->size('lg')
                                    ->formatStateUsing(fn (string $state): string => match ($state) {
                                        'pending' => '⏳ Menunggu Persetujuan',
                                        'approved' => '✅ Disetujui',
                                        'rejected' => '❌ Ditolak',
                                        'completed' => '🎉 Selesai',
                                        default => $state,
                                    })
                                    ->color(fn (string $state): string => match ($state) {
                                        'pending' => 'warning',
                                        'approved' => 'info',
                                        'rejected' => 'danger',
                                        'completed' => 'success',
                                        default => 'gray',
                                    }),
                            ])
                            ->columnSpan(1),

                        Section::make()
                            ->schema([
                                TextEntry::make('items_count')
                                    ->label('Jumlah Aset')
                                    ->state(fn ($record) => $record->items->count() . ' item')
                                    ->size('lg')
                                    ->weight('bold')
                                    ->icon('heroicon-o-cube')
                                    ->iconColor('success'),
                            ])
                            ->columnSpan(1),
                    ]),

                // Informasi Lokasi Transfer
                Section::make('Lokasi Transfer')
                    ->icon('heroicon-o-arrow-path')
                    ->description('Detail perpindahan aset')
                    ->schema([
                        \Filament\Infolists\Components\Grid::make(3)
                            ->schema([
                                \Filament\Infolists\Components\Group::make([
                                    TextEntry::make('fromUnit.name')
                                        ->label('Unit Asal')
                                        ->icon('heroicon-o-building-office')
                                        ->iconColor('primary')
                                        ->weight('medium'),
                                    TextEntry::make('fromLocation.name')
                                        ->label('Lokasi Asal')
                                        ->icon('heroicon-o-map-pin')
                                        ->iconColor('danger'),
                                ])->columnSpan(1),

                                \Filament\Infolists\Components\Group::make([
                                    TextEntry::make('arrow')
                                        ->label('')
                                        ->state('➡️')
                                        ->size('xl')
                                        ->alignCenter(),
                                ])->columnSpan(1)
                                  ->extraAttributes(['class' => 'flex items-center justify-center']),

                                \Filament\Infolists\Components\Group::make([
                                    TextEntry::make('to_unit')
                                        ->label('Unit Tujuan')
                                        ->state('Yayasan')
                                        ->icon('heroicon-o-building-library')
                                        ->iconColor('success')
                                        ->weight('medium'),
                                    TextEntry::make('toLocation.name')
                                        ->label('Lokasi Tujuan')
                                        ->icon('heroicon-o-map-pin')
                                        ->iconColor('success'),
                                ])->columnSpan(1),
                            ]),
                    ])
                    ->collapsible(),

                // Alasan dan Catatan
                Section::make('Detail Transfer')
                    ->icon('heroicon-o-clipboard-document-list')
                    ->schema([
                        TextEntry::make('reason')
                            ->label('Alasan Transfer')
                            ->icon('heroicon-o-chat-bubble-left-ellipsis')
                            ->columnSpanFull(),
                        TextEntry::make('notes')
                            ->label('Catatan Tambahan')
                            ->placeholder('Tidak ada catatan')
                            ->icon('heroicon-o-pencil-square')
                            ->columnSpanFull(),
                    ])
                    ->collapsible()
                    ->columns(1),

                // Timeline Pengajuan
                Section::make('Riwayat Pengajuan')
                    ->icon('heroicon-o-clock')
                    ->description('Timeline proses transfer')
                    ->schema([
                        \Filament\Infolists\Components\Grid::make(2)
                            ->schema([
                                \Filament\Infolists\Components\Group::make([
                                    TextEntry::make('requestedBy.name')
                                        ->label('Diajukan Oleh')
                                        ->icon('heroicon-o-user')
                                        ->iconColor('primary'),
                                    TextEntry::make('requested_at')
                                        ->label('Tanggal Pengajuan')
                                        ->dateTime('d F Y, H:i')
                                        ->icon('heroicon-o-calendar')
                                        ->iconColor('gray'),
                                ])->columnSpan(1),

                                \Filament\Infolists\Components\Group::make([
                                    TextEntry::make('approvedBy.name')
                                        ->label('Diproses Oleh')
                                        ->placeholder('Belum diproses')
                                        ->icon('heroicon-o-user-circle')
                                        ->iconColor('success'),
                                    TextEntry::make('approved_at')
                                        ->label('Tanggal Diproses')
                                        ->dateTime('d F Y, H:i')
                                        ->placeholder('Belum diproses')
                                        ->icon('heroicon-o-calendar-days')
                                        ->iconColor('gray'),
                                ])->columnSpan(1),
                            ]),

                        TextEntry::make('rejection_reason')
                            ->label('Alasan Penolakan')
                            ->icon('heroicon-o-exclamation-triangle')
                            ->iconColor('danger')
                            ->columnSpanFull()
                            ->visible(fn ($record) => $record->isRejected()),

                        TextEntry::make('completed_at')
                            ->label('Tanggal Selesai')
                            ->dateTime('d F Y, H:i')
                            ->icon('heroicon-o-check-badge')
                            ->iconColor('success')
                            ->visible(fn ($record) => $record->status === 'completed'),
                    ])
                    ->collapsible(),

                // Daftar Aset
                Section::make('Daftar Aset Transfer')
                    ->icon('heroicon-o-cube')
                    ->description(fn ($record) => 'Total ' . $record->items->count() . ' aset')
                    ->schema([
                        RepeatableEntry::make('items')
                            ->label('')
                            ->schema([
                                \Filament\Infolists\Components\Grid::make(6)
                                    ->schema([
                                        TextEntry::make('asset.name')
                                            ->label('Nama Aset')
                                            ->weight('bold')
                                            ->columnSpan(2),
                                        TextEntry::make('asset.entries_number')
                                            ->label('No. Aset')
                                            ->badge()
                                            ->color('gray')
                                            ->columnSpan(1),
                                        TextEntry::make('asset.status')
                                            ->label('Status')
                                            ->badge()
                                            ->formatStateUsing(fn ($state) => match($state) {
                                                'active' => 'Aktif',
                                                'inactive' => 'Tidak Aktif',
                                                'repaired' => 'Diperbaiki',
                                                'transferred' => 'Ditransfer',
                                                default => $state,
                                            })
                                            ->color(fn ($state) => match($state) {
                                                'active' => 'success',
                                                'inactive' => 'danger',
                                                'repaired' => 'warning',
                                                'transferred' => 'info',
                                                default => 'gray',
                                            })
                                            ->columnSpan(1),
                                        TextEntry::make('asset.condition')
                                            ->label('Kondisi')
                                            ->badge()
                                            ->formatStateUsing(fn ($state) => match($state) {
                                                'bagus' => '✅ Bagus',
                                                'rusak' => '❌ Rusak',
                                                default => $state,
                                            })
                                            ->color(fn ($state) => match($state) {
                                                'bagus' => 'success',
                                                'rusak' => 'danger',
                                                default => 'gray',
                                            })
                                            ->columnSpan(1),
                                        TextEntry::make('asset.brand')
                                            ->label('Merk')
                                            ->columnSpan(1),
                                    ]),
                                \Filament\Infolists\Components\Grid::make(2)
                                    ->schema([
                                        TextEntry::make('condition_notes')
                                            ->label('Catatan Kondisi')
                                            ->placeholder('Tidak ada catatan')
                                            ->columnSpan(1),
                                        ImageEntry::make('photo_before')
                                            ->label('Foto Aset')
                                            ->disk('public')
                                            ->size(80)
                                            ->columnSpan(1),
                                    ]),
                            ])
                            ->contained(true),
                    ])
                    ->collapsible(),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAssetTransfers::route('/'),
            'create' => Pages\CreateAssetTransfer::route('/create'),
            'view' => Pages\ViewAssetTransfer::route('/{record}'),
            'edit' => Pages\EditAssetTransfer::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        $user = Auth::user();

        if ($user && $user->hasRole(['Super Admin', 'Manajer', 'Manager'])) {
            $count = static::getModel()::where('status', 'pending')->count();
            return $count > 0 ? (string) $count : null;
        }

        return null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }
}
