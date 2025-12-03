<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Unit extends Model
{
    use LogsActivity;

    protected $table = 'units';
    protected $fillable = [
        'name',
        'number',
    ];

    /**
     * Boot method untuk clear cache saat CRUD
     */
    protected static function booted(): void
    {
        static::saved(function () {
            Cache::forget('units_for_tabs');
        });

        static::deleted(function () {
            Cache::forget('units_for_tabs');
        });
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'number'])
            ->useLogName('Unit')
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Unit has been {$eventName}");
    }

    public function asset()
    {
        return $this->hasMany(Asset::class);
    }
}
