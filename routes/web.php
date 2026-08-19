<?php

use App\Http\Controllers\NextJsProxyController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetTransferController;
use App\Http\Controllers\AssetDispositionController;
use Illuminate\Support\Facades\Route;

// Legacy Guest / Public routes
Route::get('/guest-data-asset', [AssetController::class, 'asset'])->name('asset.all');
Route::get('/guest-detail-asset/{id}', [AssetController::class, 'detail'])->name('asset.detail');
Route::get('/guest-data-asset-lokasi/{id}', [AssetController::class, 'lokasi'])->name('asset.lokasi');
Route::get('/guest-data-asset-ruangan/{id}', [AssetController::class, 'ruangan'])->name('asset.ruangan');

// Asset Transfer Print & Public View
Route::get('/transfer/{transfer}/print', [AssetTransferController::class, 'print'])->name('transfer.print')->middleware('auth');
Route::get('/transfer/{transfer}/view', [AssetTransferController::class, 'view'])->name('transfer.view');

// Asset Disposition QR Code & Detail
Route::get('/disposition/{disposition}/qrcode', [AssetDispositionController::class, 'qrcode'])->name('disposition.qrcode');
Route::get('/disposition/{disposition}/detail', [AssetDispositionController::class, 'detail'])->name('disposition.detail');

// All other web routes (including /, /login, /assets, /transfers, /_next/*, etc.)
// are seamlessly bridged to Next.js on port 3000!
Route::any('/{any?}', [NextJsProxyController::class, 'proxy'])
    ->where('any', '^(?!admin|api|storage|livewire|_debugbar).*$');
