<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify ENUM to include 'transferred' status
        DB::statement("ALTER TABLE assets MODIFY COLUMN status ENUM('active', 'inactive', 'deleted', 'repaired', 'transferred') NOT NULL DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'transferred' from ENUM (only if no assets have this status)
        DB::statement("ALTER TABLE assets MODIFY COLUMN status ENUM('active', 'inactive', 'deleted', 'repaired') NOT NULL DEFAULT 'active'");
    }
};
