<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Tabel utama transfer request
        Schema::create('asset_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('transfer_number')->unique(); // Nomor transfer: TRF-2024-0001
            $table->foreignId('from_unit_id')->constrained('units')->cascadeOnDelete();
            $table->foreignId('from_location_id')->constrained('locations')->cascadeOnDelete();
            $table->foreignId('to_location_id')->constrained('locations')->cascadeOnDelete(); // Gudang Yayasan
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete(); // User yang request (Unit)
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete(); // Manager yang approve
            $table->text('reason'); // Alasan transfer
            $table->text('notes')->nullable(); // Catatan tambahan
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed'])->default('pending');
            $table->timestamp('requested_at')->useCurrent();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('transfer_number');
        });

        // Tabel pivot untuk asset yang di-transfer
        Schema::create('asset_transfer_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_transfer_id')->constrained('asset_transfers')->cascadeOnDelete();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->text('condition_notes')->nullable(); // Catatan kondisi saat transfer
            $table->string('photo_before')->nullable(); // Photo sebelum transfer
            $table->string('photo_after')->nullable(); // Photo setelah diterima
            $table->boolean('is_verified')->default(false); // Verified oleh manager
            $table->timestamps();

            $table->index('asset_transfer_id');
            $table->index('asset_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_transfer_items');
        Schema::dropIfExists('asset_transfers');
    }
};
