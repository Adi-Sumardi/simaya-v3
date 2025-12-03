<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetTransferItem extends Model
{
    protected $table = 'asset_transfer_items';

    protected $fillable = [
        'asset_transfer_id',
        'asset_id',
        'condition_notes',
        'photo_before',
        'photo_after',
        'is_verified',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
    ];

    /**
     * Relationships
     */
    public function transfer(): BelongsTo
    {
        return $this->belongsTo(AssetTransfer::class, 'asset_transfer_id');
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}
