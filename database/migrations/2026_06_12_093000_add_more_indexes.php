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
        Schema::table('asset_dispositions', function (Blueprint $table) {
            $table->index('status', 'asset_dispositions_status_index');
            $table->index('type', 'asset_dispositions_type_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('asset_dispositions', function (Blueprint $table) {
            $table->dropIndex('asset_dispositions_status_index');
            $table->dropIndex('asset_dispositions_type_index');
        });
    }
};
