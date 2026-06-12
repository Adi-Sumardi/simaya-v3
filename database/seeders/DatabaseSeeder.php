<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Unit;
use App\Models\User;
use App\Models\Category;
use App\Models\Tool;
use App\Models\Year;
use App\Models\Aktiva;
use App\Models\Location;
use App\Models\Asset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Units
        $units = [
            ['name' => 'Unit Teknologi Informasi', 'number' => 'UNT-001'],
            ['name' => 'Unit Administrasi Umum', 'number' => 'UNT-002'],
            ['name' => 'Unit Sarana & Prasarana', 'number' => 'UNT-003'],
            ['name' => 'Unit Keuangan', 'number' => 'UNT-004'],
        ];
        foreach ($units as $u) {
            Unit::updateOrCreate(['number' => $u['number']], $u);
        }
        $allUnits = Unit::all();

        // 2. Seed Users
        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'admin@simaya.id',
                'password' => Hash::make('password'),
                'unit_id' => $allUnits->first()->id,
            ],
            [
                'name' => 'Operator Unit',
                'email' => 'operator@simaya.id',
                'password' => Hash::make('password'),
                'unit_id' => $allUnits->get(1)->id ?? $allUnits->first()->id,
            ]
        ];
        foreach ($users as $u) {
            User::updateOrCreate(['email' => $u['email']], $u);
        }
        $allUsers = User::all();

        // 3. Seed Categories
        $categories = [
            ['name' => 'Elektronik & Gadget', 'code' => 'CAT-ELK'],
            ['name' => 'Peralatan Kantor', 'code' => 'CAT-KNT'],
            ['name' => 'Kendaraan Dinas', 'code' => 'CAT-KND'],
            ['name' => 'Perpustakaan & Buku', 'code' => 'CAT-BUK'],
        ];
        foreach ($categories as $c) {
            Category::updateOrCreate(['code' => $c['code']], $c);
        }
        $allCategories = Category::all();

        // 4. Seed Tools
        $tools = [
            ['name' => 'Laptop ASUS ROG', 'code' => 'TOL-LAP', 'code_name' => 'Laptop'],
            ['name' => 'Printer Epson L3210', 'code' => 'TOL-PRN', 'code_name' => 'Printer'],
            ['name' => 'Kursi Ergonomis', 'code' => 'TOL-KRS', 'code_name' => 'Kursi'],
            ['name' => 'AC Panasonic 1 PK', 'code' => 'TOL-AC', 'code_name' => 'AC'],
        ];
        foreach ($tools as $t) {
            Tool::updateOrCreate(['code' => $t['code']], $t);
        }
        $allTools = Tool::all();

        // 5. Seed Years
        $years = [
            ['year' => '2023', 'code' => 'YR23'],
            ['year' => '2024', 'code' => 'YR24'],
            ['year' => '2025', 'code' => 'YR25'],
            ['year' => '2026', 'code' => 'YR26'],
        ];
        foreach ($years as $y) {
            Year::updateOrCreate(['code' => $y['code']], $y);
        }
        $allYears = Year::all();

        // 6. Seed Aktivas
        $aktivas = [
            ['name' => 'Aktiva Tetap Peralatan', 'code' => 'AKT-TTP'],
            ['name' => 'Aktiva Lancar Inventaris', 'code' => 'AKT-LCR'],
        ];
        foreach ($aktivas as $a) {
            Aktiva::updateOrCreate(['code' => $a['code']], $a);
        }
        $allAktivas = Aktiva::all();

        // 7. Seed Locations
        $locations = [
            ['name' => 'Ruang Server Utama', 'number' => 'LOC-001', 'floor' => 'Lantai 3', 'unit_id' => $allUnits->get(0)->id, 'user_id' => $allUsers->get(0)->id],
            ['name' => 'Ruang Staff Administrasi', 'number' => 'LOC-002', 'floor' => 'Lantai 1', 'unit_id' => $allUnits->get(1)->id, 'user_id' => $allUsers->get(1)->id],
            ['name' => 'Gudang Inventaris A', 'number' => 'LOC-003', 'floor' => 'Lantai Basement', 'unit_id' => $allUnits->get(2)->id ?? $allUnits->first()->id, 'user_id' => $allUsers->get(0)->id],
        ];
        foreach ($locations as $l) {
            Location::updateOrCreate(['number' => $l['number']], $l);
        }
        $allLocations = Location::all();

        // Ensure directories exist
        Storage::disk('public')->makeDirectory('assets');

        // 8. Seed Assets
        for ($i = 0; $i < 50; $i++) {
            Asset::create([
                'name' => 'Asset Mock ' . ($i + 1),
                'condition' => $i % 5 === 0 ? 'rusak' : 'bagus',
                'portability' => $i % 2 === 0 ? 'portable' : 'non-portable',
                'entries_number' => rand(100, 999),
                'description' => 'Deskripsi untuk Asset Mock ' . ($i + 1),
                'brand' => ['ASUS', 'Epson', 'Panasonic', 'Indofurniture'][rand(0, 3)],
                'price' => rand(1000000, 25000000),
                'aquisition' => 'Pembelian APBD ' . rand(2023, 2026),
                'aquisition_date' => now()->subDays(rand(10, 500))->toDateString(),
                'status' => 'active',
                'image' => 'assets/placeholder.jpg',
                'user_id' => $allUsers->random()->id,
                'unit_id' => $allUnits->random()->id,
                'tool_id' => $allTools->random()->id,
                'location_id' => $allLocations->random()->id,
                'category_id' => $allCategories->random()->id,
                'year_id' => $allYears->random()->id,
                'aktiva_id' => $allAktivas->random()->id,
            ]);
        }
    }
}
