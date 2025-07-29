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
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'condition' => $this->faker->randomElement(['bagus', 'rusak']),
            'portability' => $this->faker->randomElement(['portable', 'fixtures']),
            'entries_number' => $this->faker->numberBetween(1, 100),
            'description' => $this->faker->sentence(),
            'brand' => $this->faker->company(),
            'price' => $this->faker->numberBetween(1000000, 500000000),
            'aquisition' => $this->faker->word(),
            'aquisition_date' => $this->faker->date(),
            'status' => $this->faker->randomElement(['active', 'inactive', 'deleted', 'repaired']),
            'image' => 'assets/' . $this->faker->image('storage/app/public/assets', 640, 480, null, false),
            'user_id' => User::inRandomOrder()->value('id') ?? 1,
            'unit_id' => Unit::inRandomOrder()->value('id') ?? 1,
            'tool_id' => Tool::inRandomOrder()->value('id') ?? 1,
            'location_id' => Location::inRandomOrder()->value('id') ?? 1,
            'category_id' => Category::inRandomOrder()->value('id') ?? 1,
            'year_id' => Year::inRandomOrder()->value('id') ?? 1,
            'aktiva_id' => Aktiva::inRandomOrder()->value('id') ?? 1,
        ];
    }
}
