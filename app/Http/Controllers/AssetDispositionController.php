<?php

namespace App\Http\Controllers;

use App\Models\AssetDisposition;

class AssetDispositionController extends Controller
{
    public function qrcode(AssetDisposition $disposition)
    {
        $disposition->load(['items.asset', 'processedBy']);

        return view('filament.pages.disposition.qrcode', compact('disposition'));
    }

    public function detail(AssetDisposition $disposition)
    {
        $disposition->load(['items.asset', 'processedBy']);

        return view('filament.pages.disposition.detail', compact('disposition'));
    }
}
