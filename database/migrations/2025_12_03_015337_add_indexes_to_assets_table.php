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
        // Add indexes to assets table for better query performance
        Schema::table('assets', function (Blueprint $table) {
            $table->index('unit_id', 'assets_unit_id_index');
            $table->index('location_id', 'assets_location_id_index');
            $table->index('category_id', 'assets_category_id_index');
            $table->index('tool_id', 'assets_tool_id_index');
            $table->index('year_id', 'assets_year_id_index');
            $table->index('aktiva_id', 'assets_aktiva_id_index');
            $table->index('user_id', 'assets_user_id_index');
            $table->index('status', 'assets_status_index');
        });

        // Add indexes to locations table
        Schema::table('locations', function (Blueprint $table) {
            $table->index('unit_id', 'locations_unit_id_index');
            $table->index('user_id', 'locations_user_id_index');
        });

        // Add indexes to asset_images table
        Schema::table('asset_images', function (Blueprint $table) {
            $table->index('asset_id', 'asset_images_asset_id_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropIndex('assets_unit_id_index');
            $table->dropIndex('assets_location_id_index');
            $table->dropIndex('assets_category_id_index');
            $table->dropIndex('assets_tool_id_index');
            $table->dropIndex('assets_year_id_index');
            $table->dropIndex('assets_aktiva_id_index');
            $table->dropIndex('assets_user_id_index');
            $table->dropIndex('assets_status_index');
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->dropIndex('locations_unit_id_index');
            $table->dropIndex('locations_user_id_index');
        });

        Schema::table('asset_images', function (Blueprint $table) {
            $table->dropIndex('asset_images_asset_id_index');
        });
    }
};
