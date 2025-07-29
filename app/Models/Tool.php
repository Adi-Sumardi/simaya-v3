<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Tool extends Model
{
    use LogsActivity;

    protected $table = 'tools';
    protected $fillable = ['name', 'code', 'code_name'];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'code', 'code_name'])
            ->useLogName('Tool')
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Tool have been {$eventName}");
    }

    public function asset()
    {
        return $this->hasMany(Asset::class);
    }
}
