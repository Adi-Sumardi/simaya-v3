<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Location;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    public function asset()
    {
        $dt_assets = Asset::all();
        return view('filament.pages.assets.index', compact('dt_assets'));
    }

    public function detail($id)
    {
        $asset = Asset::findOrFail($id);
        return view('filament.pages.assets.detail', compact('asset', 'id'));
    }

    public function lokasi($id)
    {
        $lokasi = Location::findOrFail($id);
        return view('filament.pages.assets.kelas', compact('id', 'lokasi'));
    }
}
