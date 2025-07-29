<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
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

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'number'])
            ->useLogName('Unit')
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Unit have been {$eventName}");
    }

    public function asset()
    {
        return $this->hasMany(Asset::class);
    }
}
