<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add 'disposed' status for disposed/donated assets
        DB::statement("ALTER TABLE assets MODIFY COLUMN status ENUM('active', 'inactive', 'deleted', 'repaired', 'transferred', 'disposed') NOT NULL DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove 'disposed' from ENUM (only if no assets have this status)
        DB::statement("ALTER TABLE assets MODIFY COLUMN status ENUM('active', 'inactive', 'deleted', 'repaired', 'transferred') NOT NULL DEFAULT 'active'");
    }
};
