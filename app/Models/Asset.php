<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;
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

    protected $casts = [
        'price' => 'decimal:2',
        'aquisition_date' => 'date',
    ];

    /**
     * Clear cache saat asset di CRUD
     */
    protected static function booted(): void
    {
        $clearCache = function ($asset) {
            // Clear stats caches
            Cache::forget('asset_stats_');
            Cache::forget("asset_stats_{$asset->unit_id}");
            Cache::forget("asset_stats_{$asset->unit_id}_loc_{$asset->location_id}");
            Cache::forget('asset_count_all');
            Cache::forget("asset_count_unit_{$asset->unit_id}");
            
            // Clear tab badge count caches
            Cache::forget("asset_location_counts_{$asset->unit_id}");
            Cache::forget('asset_unit_counts');
        };

        static::saved($clearCache);
        static::deleted($clearCache);
        static::restored($clearCache);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'unit_id', 'tool_id', 'location_id', 'category_id', 'year_id', 'aktiva_id', 'entries_number'])
            ->useLogName('Asset')
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Asset has been {$eventName}");
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
        return $this->hasMany(AssetImage::class);
    }

    public function dispositionItems()
    {
        return $this->hasMany(AssetDispositionItem::class);
    }

    /**
     * Scope untuk mendapatkan aset yang belum ditransfer
     */
    public function scopeNotTransferred($query)
    {
        return $query->where('status', '!=', 'transferred');
    }

    /**
     * Scope untuk mendapatkan aset yang sudah ditransfer (siap untuk disposisi)
     */
    public function scopeTransferred($query)
    {
        return $query->where('status', 'transferred');
    }

    /**
     * Scope untuk mendapatkan aset yang belum di-dispose
     */
    public function scopeNotDisposed($query)
    {
        return $query->where('status', '!=', 'disposed');
    }

    /**
     * Scope untuk mendapatkan aset aktif (tidak ditransfer)
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Check apakah aset sudah ditransfer
     */
    public function isTransferred(): bool
    {
        return $this->status === 'transferred';
    }

    /**
     * Check apakah aset sudah di-dispose
     */
    public function isDisposed(): bool
    {
        return $this->status === 'disposed';
    }

    /**
     * Tanggal dasar perhitungan penyusutan.
     * Aset tanpa harga atau tanggal perolehan tidak bisa disusutkan.
     */
    public function canBeDepreciated(): bool
    {
        return $this->price !== null && $this->price > 0 && $this->aquisition_date !== null;
    }

    /**
     * Penyusutan garis lurus 10%/tahun, umur manfaat 10 tahun, dihitung prorata per bulan.
     */
    public function getDepreciationMonthsAttribute(): ?float
    {
        if (! $this->canBeDepreciated()) {
            return null;
        }

        return max(0, $this->aquisition_date->diffInMonths(now(), true));
    }

    public function getAccumulatedDepreciationAttribute(): ?float
    {
        if (! $this->canBeDepreciated()) {
            return null;
        }

        $monthlyRate = ($this->price * 0.10) / 12;

        return min((float) $this->price, $monthlyRate * $this->depreciation_months);
    }

    public function getBookValueAttribute(): ?float
    {
        if (! $this->canBeDepreciated()) {
            return null;
        }

        return max(0, (float) $this->price - $this->accumulated_depreciation);
    }

    public function getDepreciationPercentAttribute(): ?float
    {
        if (! $this->canBeDepreciated()) {
            return null;
        }

        return min(100, ($this->accumulated_depreciation / $this->price) * 100);
    }

    /**
     * 'no_data' = harga/tanggal perolehan belum lengkap
     * 'fully_depreciated' = sudah >= 10 tahun, nilai buku Rp 0
     * 'depreciating' = masih dalam masa penyusutan
     */
    public function getDepreciationStatusAttribute(): string
    {
        if (! $this->canBeDepreciated()) {
            return 'no_data';
        }

        return $this->depreciation_months >= 120 ? 'fully_depreciated' : 'depreciating';
    }
}
