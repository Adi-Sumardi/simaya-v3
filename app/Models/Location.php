<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Location extends Model
{

    use LogsActivity;

    protected $table = 'locations';
    protected $fillable = ['name', 'number', 'floor', 'unit_id', 'user_id'];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'number', 'floor', 'unit_id', 'user_id'])
            ->useLogName('Location')
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Location have been {$eventName}");
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }
}
