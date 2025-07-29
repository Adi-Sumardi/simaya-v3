<?php

use App\Http\Controllers\AssetController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/admin/login');
});

Route::get('/guest-data-asset', [AssetController::class, 'asset'])->name('asset.all');
Route::get('/guest-detail-asset/{id}', [AssetController::class, 'detail'])->name('asset.detail');
Route::get('/guest-data-asset-lokasi/{id}', [AssetController::class, 'lokasi'])->name('asset.lokasi');
