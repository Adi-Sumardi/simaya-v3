<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ActivityResource\Pages;
use App\Filament\Resources\ActivityResource\RelationManagers;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\Models\Activity;

class ActivityResource extends Resource
{
    protected static ?string $model = Activity::class;

    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';
    protected static ?string $navigationGroup = 'Logs';
    protected static ?string $label = 'Activity Log';
    protected static ?string $pluralLabel = 'Activity Logs';

    public static function table(Tables\Table $table): Tables\Table
    {
        return $table
            ->modifyQueryUsing(function (Builder $query) {
                $user = Auth::user();

                if ($user->hasRole('Super Admin')) {
                    return;
                }

                if ($user->hasRole('Unit')) {
                    $query->where('causer_id', $user->id);
                }

            })
            ->columns([
                TextColumn::make('description')
                    ->label('Deskripsi')
                    ->badge()
                    ->color('secondary')
                    ->searchable(),
                TextColumn::make('properties')
                    ->label('Properti')
                    ->formatStateUsing(function ($state) {
                        $data = json_decode($state, true);
                        if (is_array($data)) {
                            $name = $data['name'] ?? '-';
                            $code = $data['code'] ?? '-';
                            $number = $data['number'] ?? '-';
                            $entries_number = $data['entries_number'] ?? '-';
                            return "{$name} | {$code} | {$number} | {$entries_number}";
                        }
                        return $state;
                    })
                    ->searchable(),
                TextColumn::make('log_name')
                    ->label('Model')
                    ->sortable(),
                TextColumn::make('causer.name')
                    ->label('User')
                    ->searchable(),
                TextColumn::make('created_at')
                    ->label('Waktu')
                    ->badge()
                    ->color('info')
                    ->dateTime()->sortable(),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListActivities::route('/'),
        ];
    }

    public static function shouldRegisterNavigation(): bool
    {
        return true;
    }
}
