<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Year extends Model
{
    use LogsActivity;

    protected $table = 'years';
    protected $fillable = ['year', 'code'];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['year', 'code'])
            ->useLogName('Year')
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Year have been {$eventName}");
    }

    public function asset()
    {
        return $this->hasMany(Asset::class);
    }
}
