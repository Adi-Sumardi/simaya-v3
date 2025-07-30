<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Asset extends Model
{
    use SoftDeletes, LogsActivity, HasFactory;

    protected $table = 'assets';
    protected $fillable = [
        'name',
        'condition',
        'portability',
        'entries_number',
        'description',
        'brand',
        'price',
        'aquisition',
        'aquisition_date',
        'status',
        'image',
        'user_id',
        'unit_id',
        'tool_id',
        'location_id',
        'category_id',
        'year_id',
        'aktiva_id',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'unit_id', 'tool_id', 'location_id', 'category_id', 'year_id', 'aktiva_id', 'entries_number'])
            ->useLogName('Asset')
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Asset have been {$eventName}");
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function tool()
    {
        return $this->belongsTo(Tool::class);
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function year()
    {
        return $this->belongsTo(Year::class);
    }

    public function aktiva()
    {
        return $this->belongsTo(Aktiva::class);
    }

    public function images()
    {
        return $this->hasMany(assetImages::class);
    }
}
