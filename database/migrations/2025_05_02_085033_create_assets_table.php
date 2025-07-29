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
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('condition', ['bagus', 'rusak'])->default('bagus');
            $table->enum('portability', ['portable', 'non-portable'])->default('portable');
            $table->integer('entries_number');
            $table->string('description', 555)->nullable();
            $table->string('brand')->nullable();
            $table->decimal('price', 15, 2)->nullable();
            $table->string('aquisition')->nullable();
            $table->date('aquisition_date')->nullable();
            $table->enum('status', ['active', 'inactive', 'deleted', 'repaired'])->default('active');
            $table->string('image')->nullable();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('unit_id')->constrained('units')->cascadeOnDelete();
            $table->foreignId('tool_id')->constrained('tools')->cascadeOnDelete();
            $table->foreignId('location_id')->constrained('locations')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('categories')->cascadeOnDelete();
            $table->foreignId('year_id')->constrained('years')->cascadeOnDelete();
            $table->foreignId('aktiva_id')->constrained('aktivas')->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
        Schema::table('assets', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
