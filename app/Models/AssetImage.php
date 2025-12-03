<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetImage extends Model
{
    protected $table = 'asset_images';

    protected $fillable = ['asset_id', 'path'];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
