<?php

namespace Database\Factories;

use App\Models\Aktiva;
use App\Models\Category;
use App\Models\Location;
use App\Models\Tool;
use App\Models\Unit;
use App\Models\User;
use App\Models\Year;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Asset>
 */
class AssetFactory extends Factory
{
    /**
     * Nama aset & rentang harga realistis per jenis alat, dipetakan dari
     * `Tool.code_name` (Laptop, Printer, Kursi, AC) yang sudah di-seed di
     * DatabaseSeeder — supaya nama aset cocok dengan alatnya, bukan kata
     * acak dari faker.
     *
     * @var array<string, array{names: list<string>, price: array{int, int}, depreciation: float}>
     */
    private const PROFILES = [
        'Laptop' => ['names' => ['Laptop ASUS ROG', 'Laptop Lenovo ThinkPad', 'Laptop Dell Latitude', 'Laptop Acer Aspire'], 'price' => [8000000, 25000000], 'depreciation' => 25.0],
        'Printer' => ['names' => ['Printer Epson L3210', 'Printer Canon Pixma', 'Printer HP LaserJet'], 'price' => [1500000, 6000000], 'depreciation' => 20.0],
        'Kursi' => ['names' => ['Kursi Ergonomis', 'Kursi Kantor Staff', 'Kursi Rapat'], 'price' => [500000, 3000000], 'depreciation' => 10.0],
        'AC' => ['names' => ['AC Panasonic 1 PK', 'AC Daikin 1.5 PK', 'AC Sharp 1 PK'], 'price' => [3000000, 8000000], 'depreciation' => 12.5],
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tool = Tool::inRandomOrder()->first();
        $profile = self::PROFILES[$tool?->code_name ?? 'Laptop'] ?? self::PROFILES['Laptop'];

        // ~15% aset rusak (memicu tabel "Data Aset Rusak"), sisanya kondisi bagus.
        $condition = $this->faker->boolean(15) ? 'rusak' : 'bagus';
        $status = $condition === 'rusak'
            ? $this->faker->randomElement(['active', 'repaired', 'inactive'])
            : $this->faker->randomElement(['active', 'active', 'active', 'inactive']);

        return [
            'name' => $this->faker->randomElement($profile['names']),
            'condition' => $condition,
            'portability' => $this->faker->randomElement(['portable', 'non-portable']),
            'entries_number' => $this->faker->numberBetween(1, 100),
            'description' => $this->faker->sentence(),
            'brand' => $this->faker->company(),
            'price' => $this->faker->numberBetween(...$profile['price']),
            // Sebagian besar aset punya persentase penyusutan eksplisit sesuai
            // jenisnya (dipakai tabel "Data Penyusutan Aset"); sisanya null
            // supaya juga ada aset yang jatuh ke default 10% global.
            'depreciation_rate' => $this->faker->boolean(70) ? $profile['depreciation'] : null,
            'aquisition' => $this->faker->randomElement(['Pembelian', 'Hibah', 'Bantuan Yayasan']),
            'aquisition_date' => $this->faker->dateTimeBetween('-5 years', '-1 month')->format('Y-m-d'),
            'status' => $status,
            'image' => null,
            'user_id' => User::inRandomOrder()->value('id') ?? 1,
            'unit_id' => Unit::inRandomOrder()->value('id') ?? 1,
            'tool_id' => $tool?->id ?? Tool::inRandomOrder()->value('id') ?? 1,
            'location_id' => Location::inRandomOrder()->value('id') ?? 1,
            'category_id' => Category::inRandomOrder()->value('id') ?? 1,
            'year_id' => Year::inRandomOrder()->value('id') ?? 1,
            'aktiva_id' => Aktiva::inRandomOrder()->value('id') ?? 1,
        ];
    }
}
