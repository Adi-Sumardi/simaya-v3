<?php

namespace App\Filament\Resources\AssetResource\Pages;

use App\Filament\Resources\AssetResource;
use App\Models\Asset;
use Filament\Resources\Pages\Page;
use Illuminate\Support\Facades\Auth;

class Qrcode extends Page
{
    protected static string $resource = AssetResource::class;

    protected static string $view = 'filament.resources.asset-resource.pages.qrcode';

    public $assets;

    public function mount()
    {
        $user = Auth::user();

        $query = Asset::with(['unit', 'location', 'category', 'tool', 'year', 'aktiva']);

        if ($user->hasRole('super_admin')) {
            $this->assets = $query->get();
        } elseif ($user->hasRole('Unit')) {
            $this->assets = $query->where('user_id', $user->id)->get();
        } else {
            $this->assets = collect();
        }
    }
}
