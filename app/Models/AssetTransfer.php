<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class AssetTransfer extends Model
{
    use LogsActivity;

    protected $table = 'asset_transfers';

    protected $fillable = [
        'transfer_number',
        'from_unit_id',
        'from_location_id',
        'to_location_id',
        'requested_by',
        'approved_by',
        'reason',
        'notes',
        'status',
        'requested_at',
        'approved_at',
        'completed_at',
        'rejection_reason',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Boot method untuk generate transfer number
     */
    protected static function booted(): void
    {
        static::creating(function ($transfer) {
            if (empty($transfer->transfer_number)) {
                $transfer->transfer_number = self::generateTransferNumber();
            }
        });
    }

    /**
     * Generate nomor transfer unik: TRF-YYYY-XXXX
     */
    public static function generateTransferNumber(): string
    {
        $year = date('Y');
        $prefix = "TRF-{$year}-";

        $lastTransfer = self::where('transfer_number', 'like', "{$prefix}%")
            ->orderBy('transfer_number', 'desc')
            ->first();

        if ($lastTransfer) {
            $lastNumber = (int) substr($lastTransfer->transfer_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'approved_by', 'rejection_reason'])
            ->useLogName('AssetTransfer')
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Asset Transfer has been {$eventName}");
    }

    /**
     * Relationships
     */
    public function fromUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'from_unit_id');
    }

    public function fromLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'from_location_id');
    }

    public function toLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'to_location_id');
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(AssetTransferItem::class);
    }

    public function assets(): BelongsToMany
    {
        return $this->belongsToMany(Asset::class, 'asset_transfer_items')
            ->withPivot(['condition_notes', 'photo_before', 'photo_after', 'is_verified'])
            ->withTimestamps();
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Helper methods
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function canBeApproved(): bool
    {
        return $this->isPending() && $this->items()->count() > 0;
    }

    public function getTotalAssetsAttribute(): int
    {
        return $this->items()->count();
    }

    /**
     * Approve transfer
     */
    public function approve(User $manager): bool
    {
        if (!$this->canBeApproved()) {
            return false;
        }

        $this->update([
            'status' => 'approved',
            'approved_by' => $manager->id,
            'approved_at' => now(),
        ]);

        return true;
    }

    /**
     * Reject transfer
     */
    public function reject(User $manager, string $reason): bool
    {
        if (!$this->isPending()) {
            return false;
        }

        $this->update([
            'status' => 'rejected',
            'approved_by' => $manager->id,
            'approved_at' => now(),
            'rejection_reason' => $reason,
        ]);

        return true;
    }

    /**
     * Complete transfer - pindahkan asset ke lokasi tujuan
     */
    public function complete(): bool
    {
        if (!$this->isApproved()) {
            return false;
        }

        // Update semua asset ke lokasi tujuan dengan status transferred
        foreach ($this->items as $item) {
            $item->asset->update([
                'location_id' => $this->to_location_id,
                'status' => 'transferred', // Asset ditandai sudah ditransfer
            ]);

            $item->update(['is_verified' => true]);
        }

        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return true;
    }
}
