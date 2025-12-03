<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AssetDispositionResource\Pages;
use App\Models\AssetDisposition;
use App\Models\Asset;
use App\Models\Location;
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

class AssetDispositionResource extends Resource
{
    protected static ?string $model = AssetDisposition::class;

    protected static ?string $navigationIcon = 'heroicon-o-archive-box-x-mark';

    protected static ?string $navigationLabel = 'Disposisi Aset';

    protected static ?string $navigationGroup = 'Manajemen Aset';

    protected static ?int $navigationSort = 3;

    public static ?string $pluralLabel = 'Disposisi Aset';

    public static ?string $label = 'Disposisi Aset';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informasi Disposisi')
                    ->description('Penghapusan, Hibah, atau Sumbangan aset')
                    ->schema([
                        Forms\Components\TextInput::make('disposition_number')
                            ->label('Nomor Disposisi')
                            ->disabled()
                            ->dehydrated(false)
                            ->placeholder('Auto-generated'),

                        Forms\Components\Select::make('type')
                            ->label('Tipe Disposisi')
                            ->options([
                                'penghapusan' => 'Penghapusan Aset',
                                'hibah' => 'Hibah Aset',
                                'sumbangan' => 'Sumbangan Aset',
                            ])
                            ->required()
                            ->default('penghapusan')
                            ->live()
                            ->helperText(fn ($state) => match($state) {
                                'penghapusan' => 'Aset akan dihapus/dimusnahkan dari inventaris',
                                'hibah' => 'Aset akan dihibahkan ke pihak lain secara resmi',
                                'sumbangan' => 'Aset akan disumbangkan ke pihak lain',
                                default => '',
                            }),

                        Forms\Components\Textarea::make('reason')
                            ->label('Alasan Disposisi')
                            ->required()
                            ->rows(3)
                            ->placeholder('Jelaskan alasan disposisi aset...')
                            ->columnSpanFull(),

                        Forms\Components\Textarea::make('notes')
                            ->label('Catatan Tambahan')
                            ->rows(2)
                            ->placeholder('Catatan tambahan (opsional)')
                            ->columnSpanFull(),

                        Forms\Components\Hidden::make('processed_by')
                            ->default(fn () => Auth::id()),

                        Forms\Components\Hidden::make('status')
                            ->default('draft'),
                    ])->columns(2),

                // Informasi Penerima (untuk hibah/sumbangan)
                Forms\Components\Section::make('Informasi Penerima')
                    ->description('Data penerima hibah/sumbangan')
                    ->schema([
                        Forms\Components\TextInput::make('recipient_name')
                            ->label('Nama Penerima')
                            ->required()
                            ->maxLength(255),

                        Forms\Components\TextInput::make('recipient_organization')
                            ->label('Organisasi/Lembaga')
                            ->maxLength(255),

                        Forms\Components\TextInput::make('recipient_phone')
                            ->label('No. Telepon')
                            ->tel()
                            ->maxLength(20),

                        Forms\Components\Textarea::make('recipient_address')
                            ->label('Alamat')
                            ->rows(2)
                            ->columnSpanFull(),
                    ])
                    ->columns(3)
                    ->visible(fn (callable $get) => in_array($get('type'), ['hibah', 'sumbangan'])),

                // Dokumen Pendukung
                Forms\Components\Section::make('Dokumen Pendukung')
                    ->description('SK, Berita Acara, atau dokumen pendukung lainnya')
                    ->schema([
                        Forms\Components\TextInput::make('document_number')
                            ->label('Nomor Dokumen')
                            ->maxLength(100)
                            ->placeholder('Contoh: SK/001/2025'),

                        Forms\Components\DatePicker::make('document_date')
                            ->label('Tanggal Dokumen')
                            ->displayFormat('d/m/Y'),

                        Forms\Components\FileUpload::make('document_file')
                            ->label('Upload Dokumen')
                            ->directory('disposition-documents')
                            ->acceptedFileTypes(['application/pdf', 'image/*'])
                            ->maxSize(5120)
                            ->columnSpanFull(),
                    ])->columns(2),

                // Pilih Aset
                Forms\Components\Section::make('Pilih Aset untuk Disposisi')
                    ->description('Pilih aset yang sudah ditransfer ke gudang yayasan')
                    ->schema([
                        Forms\Components\Placeholder::make('asset_info')
                            ->label('')
                            ->content(function () {
                                $count = Asset::transferred()->count();
                                return "📦 Total Aset di Gudang Yayasan (status: transferred): {$count} item";
                            }),

                        Forms\Components\Actions::make([
                            Forms\Components\Actions\Action::make('select_all')
                                ->label('Pilih Semua Aset')
                                ->icon('heroicon-o-check-circle')
                                ->color('success')
                                ->size('sm')
                                ->action(function (callable $set) {
                                    $assets = Asset::transferred()->get();

                                    $items = $assets->map(fn ($asset) => [
                                        'asset_id' => $asset->id,
                                        'condition_notes' => null,
                                        'photo' => null,
                                        'estimated_value' => $asset->price,
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
                            ->label('Daftar Aset Disposisi')
                            ->schema([
                                Forms\Components\Select::make('asset_id')
                                    ->label('Pilih Aset')
                                    ->options(function () {
                                        return Asset::transferred()
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

                                Forms\Components\TextInput::make('estimated_value')
                                    ->label('Estimasi Nilai')
                                    ->numeric()
                                    ->prefix('Rp')
                                    ->default(fn (callable $get) => Asset::find($get('asset_id'))?->price)
                                    ->columnSpan(1),

                                Forms\Components\Textarea::make('condition_notes')
                                    ->label('Catatan Kondisi')
                                    ->rows(1)
                                    ->placeholder('Catatan kondisi saat disposisi')
                                    ->columnSpan(2),

                                Forms\Components\FileUpload::make('photo')
                                    ->label('Foto')
                                    ->image()
                                    ->directory('disposition-photos')
                                    ->maxSize(2048)
                                    ->columnSpan(1),
                            ])
                            ->columns(6)
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
                            ->content(function (callable $get) {
                                $items = $get('items') ?? [];
                                $totalValue = collect($items)->sum('estimated_value');
                                $formattedValue = 'Rp ' . number_format($totalValue, 0, ',', '.');
                                return "Dipilih: " . count($items) . " aset | Total Estimasi Nilai: {$formattedValue}";
                            }),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(function (Builder $query) {
                $query->with(['processedBy', 'items', 'items.asset']);
            })
            ->columns([
                Tables\Columns\TextColumn::make('disposition_number')
                    ->label('No. Disposisi')
                    ->searchable()
                    ->sortable()
                    ->copyable(),

                Tables\Columns\TextColumn::make('type')
                    ->label('Tipe')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'penghapusan' => 'Penghapusan',
                        'hibah' => 'Hibah',
                        'sumbangan' => 'Sumbangan',
                        default => $state,
                    })
                    ->colors([
                        'danger' => 'penghapusan',
                        'warning' => 'hibah',
                        'info' => 'sumbangan',
                    ]),

                Tables\Columns\TextColumn::make('items_count')
                    ->label('Jml Aset')
                    ->counts('items')
                    ->badge()
                    ->color('primary'),

                Tables\Columns\TextColumn::make('recipient_name')
                    ->label('Penerima')
                    ->placeholder('-')
                    ->searchable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->colors([
                        'warning' => 'draft',
                        'success' => 'completed',
                        'danger' => 'cancelled',
                    ])
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'draft' => 'Draft',
                        'completed' => 'Selesai',
                        'cancelled' => 'Dibatalkan',
                        default => $state,
                    }),

                Tables\Columns\TextColumn::make('processedBy.name')
                    ->label('Diproses Oleh')
                    ->searchable()
                    ->toggleable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Tanggal Dibuat')
                    ->dateTime('d M Y H:i')
                    ->sortable(),

                Tables\Columns\TextColumn::make('completed_at')
                    ->label('Tgl Selesai')
                    ->dateTime('d M Y H:i')
                    ->placeholder('-')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'completed' => 'Selesai',
                        'cancelled' => 'Dibatalkan',
                    ]),
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'penghapusan' => 'Penghapusan',
                        'hibah' => 'Hibah',
                        'sumbangan' => 'Sumbangan',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make()
                    ->visible(fn (AssetDisposition $record) => $record->isDraft()),

                // Complete Action
                Tables\Actions\Action::make('complete')
                    ->label('Selesaikan')
                    ->icon('heroicon-o-check-badge')
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Selesaikan Disposisi')
                    ->modalDescription('Semua aset akan ditandai sebagai "disposed". Proses ini tidak dapat dibatalkan.')
                    ->visible(fn (AssetDisposition $record) => $record->isDraft())
                    ->action(function (AssetDisposition $record) {
                        if ($record->complete()) {
                            Notification::make()
                                ->success()
                                ->title('Disposisi Selesai')
                                ->body('Semua aset berhasil didisposisi.')
                                ->send();
                        }
                    }),

                // Cancel Action
                Tables\Actions\Action::make('cancel')
                    ->label('Batalkan')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('Batalkan Disposisi')
                    ->modalDescription('Apakah Anda yakin ingin membatalkan disposisi ini?')
                    ->visible(fn (AssetDisposition $record) => $record->isDraft())
                    ->action(function (AssetDisposition $record) {
                        if ($record->cancel()) {
                            Notification::make()
                                ->warning()
                                ->title('Disposisi Dibatalkan')
                                ->body('Disposisi aset telah dibatalkan.')
                                ->send();
                        }
                    }),

                // Print/QR Code
                Tables\Actions\Action::make('qrcode')
                    ->label('QR Code')
                    ->icon('heroicon-o-qr-code')
                    ->color('info')
                    ->url(fn (AssetDisposition $record) => route('disposition.qrcode', $record))
                    ->openUrlInNewTab(),
            ])
            ->bulkActions([
                //
            ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                // Header dengan Status Badge
                \Filament\Infolists\Components\Grid::make(3)
                    ->schema([
                        Section::make()
                            ->schema([
                                TextEntry::make('disposition_number')
                                    ->label('Nomor Disposisi')
                                    ->size('lg')
                                    ->weight('bold')
                                    ->icon('heroicon-o-document-text')
                                    ->iconColor('primary'),
                            ])
                            ->columnSpan(1),

                        Section::make()
                            ->schema([
                                TextEntry::make('type')
                                    ->label('Tipe Disposisi')
                                    ->badge()
                                    ->size('lg')
                                    ->formatStateUsing(fn (string $state): string => match ($state) {
                                        'penghapusan' => 'Penghapusan Aset',
                                        'hibah' => 'Hibah Aset',
                                        'sumbangan' => 'Sumbangan Aset',
                                        default => $state,
                                    })
                                    ->color(fn (string $state): string => match ($state) {
                                        'penghapusan' => 'danger',
                                        'hibah' => 'warning',
                                        'sumbangan' => 'info',
                                        default => 'gray',
                                    }),
                            ])
                            ->columnSpan(1),

                        Section::make()
                            ->schema([
                                TextEntry::make('status')
                                    ->label('Status')
                                    ->badge()
                                    ->size('lg')
                                    ->formatStateUsing(fn (string $state): string => match ($state) {
                                        'draft' => 'Draft',
                                        'completed' => 'Selesai',
                                        'cancelled' => 'Dibatalkan',
                                        default => $state,
                                    })
                                    ->color(fn (string $state): string => match ($state) {
                                        'draft' => 'warning',
                                        'completed' => 'success',
                                        'cancelled' => 'danger',
                                        default => 'gray',
                                    }),
                            ])
                            ->columnSpan(1),
                    ]),

                // Detail Disposisi
                Section::make('Detail Disposisi')
                    ->icon('heroicon-o-clipboard-document-list')
                    ->schema([
                        TextEntry::make('reason')
                            ->label('Alasan Disposisi')
                            ->icon('heroicon-o-chat-bubble-left-ellipsis')
                            ->columnSpanFull(),
                        TextEntry::make('notes')
                            ->label('Catatan Tambahan')
                            ->placeholder('Tidak ada catatan')
                            ->icon('heroicon-o-pencil-square')
                            ->columnSpanFull(),
                    ])
                    ->collapsible(),

                // Informasi Penerima
                Section::make('Informasi Penerima')
                    ->icon('heroicon-o-user-group')
                    ->schema([
                        \Filament\Infolists\Components\Grid::make(2)
                            ->schema([
                                TextEntry::make('recipient_name')
                                    ->label('Nama Penerima')
                                    ->icon('heroicon-o-user'),
                                TextEntry::make('recipient_organization')
                                    ->label('Organisasi/Lembaga')
                                    ->placeholder('-')
                                    ->icon('heroicon-o-building-office'),
                                TextEntry::make('recipient_phone')
                                    ->label('No. Telepon')
                                    ->placeholder('-')
                                    ->icon('heroicon-o-phone'),
                                TextEntry::make('recipient_address')
                                    ->label('Alamat')
                                    ->placeholder('-')
                                    ->icon('heroicon-o-map-pin'),
                            ]),
                    ])
                    ->collapsible()
                    ->visible(fn ($record) => in_array($record->type, ['hibah', 'sumbangan'])),

                // Dokumen Pendukung
                Section::make('Dokumen Pendukung')
                    ->icon('heroicon-o-document')
                    ->schema([
                        \Filament\Infolists\Components\Grid::make(2)
                            ->schema([
                                TextEntry::make('document_number')
                                    ->label('Nomor Dokumen')
                                    ->placeholder('-'),
                                TextEntry::make('document_date')
                                    ->label('Tanggal Dokumen')
                                    ->date('d F Y')
                                    ->placeholder('-'),
                            ]),
                    ])
                    ->collapsible(),

                // Timeline
                Section::make('Riwayat Proses')
                    ->icon('heroicon-o-clock')
                    ->schema([
                        \Filament\Infolists\Components\Grid::make(2)
                            ->schema([
                                \Filament\Infolists\Components\Group::make([
                                    TextEntry::make('processedBy.name')
                                        ->label('Diproses Oleh')
                                        ->icon('heroicon-o-user')
                                        ->iconColor('primary'),
                                    TextEntry::make('created_at')
                                        ->label('Tanggal Dibuat')
                                        ->dateTime('d F Y, H:i')
                                        ->icon('heroicon-o-calendar'),
                                ])->columnSpan(1),

                                \Filament\Infolists\Components\Group::make([
                                    TextEntry::make('completed_at')
                                        ->label('Tanggal Selesai')
                                        ->dateTime('d F Y, H:i')
                                        ->placeholder('Belum selesai')
                                        ->icon('heroicon-o-check-badge')
                                        ->iconColor('success'),
                                ])->columnSpan(1),
                            ]),
                    ])
                    ->collapsible(),

                // Daftar Aset
                Section::make('Daftar Aset Disposisi')
                    ->icon('heroicon-o-cube')
                    ->description(fn ($record) => 'Total ' . $record->items->count() . ' aset | Estimasi Nilai: Rp ' . number_format($record->total_value, 0, ',', '.'))
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
                                        TextEntry::make('asset.condition')
                                            ->label('Kondisi')
                                            ->badge()
                                            ->formatStateUsing(fn ($state) => match($state) {
                                                'bagus' => 'Bagus',
                                                'rusak' => 'Rusak',
                                                default => $state,
                                            })
                                            ->color(fn ($state) => match($state) {
                                                'bagus' => 'success',
                                                'rusak' => 'danger',
                                                default => 'gray',
                                            })
                                            ->columnSpan(1),
                                        TextEntry::make('estimated_value')
                                            ->label('Estimasi Nilai')
                                            ->money('IDR')
                                            ->columnSpan(2),
                                    ]),
                                \Filament\Infolists\Components\Grid::make(2)
                                    ->schema([
                                        TextEntry::make('condition_notes')
                                            ->label('Catatan Kondisi')
                                            ->placeholder('Tidak ada catatan')
                                            ->columnSpan(1),
                                        ImageEntry::make('photo')
                                            ->label('Foto')
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
            'index' => Pages\ListAssetDispositions::route('/'),
            'create' => Pages\CreateAssetDisposition::route('/create'),
            'view' => Pages\ViewAssetDisposition::route('/{record}'),
            'edit' => Pages\EditAssetDisposition::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        $count = static::getModel()::where('status', 'draft')->count();
        return $count > 0 ? (string) $count : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function canAccess(): bool
    {
        $user = Auth::user();
        return $user && $user->hasRole(['super_admin', 'Manajer', 'Manager', 'Kabag']);
    }
}
