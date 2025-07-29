<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Category extends Model
{
    use LogsActivity;

    protected $table = 'categories';
    protected $fillable = ['name', 'code'];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'code'])
            ->useLogName('Category')
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Category have been {$eventName}");
    }

    public function asset()
    {
        return $this->hasMany(Asset::class);
    }
}
