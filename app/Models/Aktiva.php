<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Aktiva extends Model
{
    use LogsActivity;

    protected $table = 'aktivas';
    protected $guarded = [];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'code'])
            ->useLogName('Aktiva')
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Aktiva have been {$eventName}");
    }

    public function asset()
    {
        return $this->hasMany(Asset::class);
    }
}
