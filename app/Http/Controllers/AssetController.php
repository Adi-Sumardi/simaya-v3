<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Location;

class AssetController extends Controller
{
    /**
     * Eager load relationships untuk menghindari N+1 query
     */
    private const ASSET_RELATIONS = [
        'unit',
        'tool',
        'location',
        'category',
        'year',
        'aktiva',
        'images'
    ];

    public function asset()
    {
        $dt_assets = Asset::with(self::ASSET_RELATIONS)->get();
        return view('filament.pages.assets.index', compact('dt_assets'));
    }

    public function detail($id)
    {
        $asset = Asset::with(self::ASSET_RELATIONS)->findOrFail($id);
        return view('filament.pages.assets.detail', compact('asset', 'id'));
    }

    public function lokasi($id)
    {
        $lokasi = Location::with('unit')->findOrFail($id);
        return view('filament.pages.assets.kelas', compact('id', 'lokasi'));
    }

    public function ruangan($id)
    {
        $lokasi = Location::with('unit')->findOrFail($id);
        $dt_assets = Asset::with(self::ASSET_RELATIONS)
            ->where('location_id', $id)
            ->get();
        return view('filament.pages.assets.ruangan', compact('id', 'lokasi', 'dt_assets'));
    }
}
