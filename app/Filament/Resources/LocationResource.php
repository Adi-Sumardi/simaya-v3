<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LocationResource\Pages;
use App\Filament\Resources\LocationResource\RelationManagers;
use App\Models\Location;
use Dom\Text;
use Filament\Forms;
use Filament\Forms\Components\Tabs\Tab;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Facades\Auth;

class LocationResource extends Resource
{
    protected static ?string $model = Location::class;

    protected static ?string $navigationIcon = 'heroicon-o-map-pin';

    protected static ?string $navigationLabel = 'Lokasi';

    protected static ?string $navigationGroup = 'Master Data';

    public static ?string $pluralLabel = 'List Lokasi';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                TextInput::make('name')
                    ->required()
                    ->label('Nama Lokasi')
                    ->maxLength(255),
                TextInput::make('number')
                    ->required()
                    ->label('Nomor Lokasi')
                    ->maxLength(255),
                TextInput::make('floor')
                    ->required()
                    ->label('Lantai')
                    ->maxLength(255),
                Forms\Components\Select::make('unit_id')
                    ->label('Unit')
                    ->relationship('unit', 'name')
                    ->searchable()
                    ->required()
                    ->default(fn () => Auth::user()?->hasRole('Unit') ? Auth::user()->unit_id : null)
                    ->disabled(fn () => Auth::user()?->hasRole('Unit'))
                    ->dehydrated(),
                Forms\Components\Hidden::make('user_id')
                    ->default(Auth::user()->id)
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Nama Lokasi')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('number')
                    ->label('Nomor Lokasi')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('floor')
                    ->label('Lantai')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('unit.name')
                    ->label('Unit')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Dibuat Pada')
                    ->date('d M Y')
                    ->sortable(),
                Tables\Columns\TextColumn::make('updated_at')
                    ->label('Diubah Pada')
                    ->date('d M Y')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\Filter::make('unit_id')
                    ->form([
                        Forms\Components\Select::make('unit_id')
                            ->relationship('unit', 'name')
                            ->label('Unit'),
                    ])
                    ->hidden(fn () => Auth::user()?->hasRole('Unit'))
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['unit_id'],
                                fn (Builder $query, $unit_id): Builder => $query->whereRelation('unit', 'id', '=', $unit_id),
                            );
                    }),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\ViewAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\AssetsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListLocations::route('/'),
            'create' => Pages\CreateLocation::route('/create'),
            'edit' => Pages\EditLocation::route('/{record}/edit'),
            'view' => Pages\ViewLocation::route('/{record}/view'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery();
        $user = Auth::user();

        if ($user && $user->hasRole('Unit') && $user->unit_id) {
            $query->where('unit_id', $user->unit_id);
        }

        return $query;
    }
}
