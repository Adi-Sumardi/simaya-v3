<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetDispositionItem extends Model
{
    protected $table = 'asset_disposition_items';

    protected $fillable = [
        'asset_disposition_id',
        'asset_id',
        'condition_notes',
        'photo',
        'estimated_value',
    ];

    protected $casts = [
        'estimated_value' => 'decimal:2',
    ];

    /**
     * Relationships
     */
    public function disposition(): BelongsTo
    {
        return $this->belongsTo(AssetDisposition::class, 'asset_disposition_id');
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
