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
        // Table untuk disposisi aset (penghapusan/hibah/sumbangan)
        Schema::create('asset_dispositions', function (Blueprint $table) {
            $table->id();
            $table->string('disposition_number')->unique(); // DSP-YYYY-XXXX
            $table->enum('type', ['penghapusan', 'hibah', 'sumbangan'])->default('penghapusan');
            $table->foreignId('processed_by')->constrained('users'); // Manager yang memproses
            $table->string('recipient_name')->nullable(); // Nama penerima (untuk hibah/sumbangan)
            $table->string('recipient_organization')->nullable(); // Organisasi penerima
            $table->string('recipient_address')->nullable(); // Alamat penerima
            $table->string('recipient_phone')->nullable(); // Telepon penerima
            $table->text('reason')->nullable(); // Alasan disposisi
            $table->text('notes')->nullable(); // Catatan tambahan
            $table->string('document_number')->nullable(); // Nomor dokumen pendukung (SK, berita acara, dll)
            $table->date('document_date')->nullable(); // Tanggal dokumen
            $table->string('document_file')->nullable(); // File dokumen pendukung
            $table->enum('status', ['draft', 'completed', 'cancelled'])->default('draft');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        // Table untuk item-item aset dalam disposisi
        Schema::create('asset_disposition_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_disposition_id')->constrained()->cascadeOnDelete();
            $table->foreignId('asset_id')->constrained();
            $table->text('condition_notes')->nullable(); // Kondisi aset saat disposisi
            $table->string('photo')->nullable(); // Foto aset sebelum disposisi
            $table->decimal('estimated_value', 15, 2)->nullable(); // Estimasi nilai (untuk penghapusan)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('asset_disposition_items');
        Schema::dropIfExists('asset_dispositions');
    }
};
