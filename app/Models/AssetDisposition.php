<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class AssetDisposition extends Model
{
    use LogsActivity;

    protected $table = 'asset_dispositions';

    protected $fillable = [
        'disposition_number',
        'type',
        'processed_by',
        'recipient_name',
        'recipient_organization',
        'recipient_address',
        'recipient_phone',
        'reason',
        'notes',
        'document_number',
        'document_date',
        'document_file',
        'status',
        'completed_at',
    ];

    protected $casts = [
        'document_date' => 'date',
        'completed_at' => 'datetime',
    ];

    /**
     * Boot method untuk generate disposition number
     */
    protected static function booted(): void
    {
        static::creating(function ($disposition) {
            if (empty($disposition->disposition_number)) {
                $disposition->disposition_number = self::generateDispositionNumber();
            }
        });
    }

    /**
     * Generate nomor disposisi unik: DSP-YYYY-XXXX
     */
    public static function generateDispositionNumber(): string
    {
        $year = date('Y');
        $prefix = "DSP-{$year}-";

        $lastDisposition = self::where('disposition_number', 'like', "{$prefix}%")
            ->orderBy('disposition_number', 'desc')
            ->first();

        if ($lastDisposition) {
            $lastNumber = (int) substr($lastDisposition->disposition_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'type', 'processed_by'])
            ->useLogName('AssetDisposition')
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Asset Disposition has been {$eventName}");
    }

    /**
     * Relationships
     */
    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(AssetDispositionItem::class);
    }

    public function assets(): BelongsToMany
    {
        return $this->belongsToMany(Asset::class, 'asset_disposition_items')
            ->withPivot(['condition_notes', 'photo', 'estimated_value'])
            ->withTimestamps();
    }

    /**
     * Scopes
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeCancelled($query)
    {
        return $query->where('status', 'cancelled');
    }

    /**
     * Helper methods
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function getTotalAssetsAttribute(): int
    {
        return $this->items()->count();
    }

    public function getTotalValueAttribute(): float
    {
        return $this->items()->sum('estimated_value') ?? 0;
    }

    /**
     * Get type label in Indonesian
     */
    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'penghapusan' => 'Penghapusan',
            'hibah' => 'Hibah',
            'sumbangan' => 'Sumbangan',
            default => $this->type,
        };
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'draft' => 'warning',
            'completed' => 'success',
            'cancelled' => 'danger',
            default => 'gray',
        };
    }

    /**
     * Complete disposition - update asset status to disposed
     */
    public function complete(): bool
    {
        if (!$this->isDraft()) {
            return false;
        }

        // Update semua asset status ke disposed
        foreach ($this->items as $item) {
            $item->asset->update([
                'status' => 'disposed',
            ]);
        }

        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return true;
    }

    /**
     * Cancel disposition
     */
    public function cancel(): bool
    {
        if (!$this->isDraft()) {
            return false;
        }

        $this->update([
            'status' => 'cancelled',
        ]);

        return true;
    }
}
