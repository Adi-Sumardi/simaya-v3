<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\AssetTransferController;
use App\Http\Controllers\Api\AssetDispositionController;
use App\Http\Controllers\Api\MasterController;
use App\Http\Controllers\Api\YapinetSummaryController;

// Public authentication endpoint
Route::post('/login', [AuthController::class, 'login']);

// Public QR Scan & Public Asset/Location/Transfer/Disposition Detail Endpoints
Route::get('/public/assets/{id}', [AssetController::class, 'publicDetail']);
Route::get('/public/locations/{id}', [AssetController::class, 'publicLocationDetail']);
Route::get('/public/transfers/{id}', [AssetTransferController::class, 'publicDetail']);
Route::get('/public/dispositions/{id}', [AssetDispositionController::class, 'publicDetail']);
Route::get('/public/stats', [AssetController::class, 'publicStats']);

// Yapinet integration endpoint, protected by static API key (not Sanctum)
Route::middleware('yapinet.auth')->get('integrations/yapinet/summary', [YapinetSummaryController::class, 'summary']);

// Sanctum token protected API endpoints
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth actions
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Assets CRUD & custom bulk actions
    Route::get('/assets/stats', [AssetController::class, 'stats']);
    Route::get('/assets/depreciation-stats', [AssetController::class, 'depreciationStats']);
    Route::post('/assets/bulk-update', [AssetController::class, 'bulkUpdate']);
    Route::post('/assets/bulk-add-photo', [AssetController::class, 'bulkAddPhoto']);
    Route::apiResource('/assets', AssetController::class);

    // Asset Transfer / Mutations
    Route::get('/transfers', [AssetTransferController::class, 'index']);
    Route::post('/transfers', [AssetTransferController::class, 'store']);
    Route::post('/transfers/{id}/approve', [AssetTransferController::class, 'approve']);
    Route::post('/transfers/{id}/reject', [AssetTransferController::class, 'reject']);
    Route::post('/transfers/{id}/complete', [AssetTransferController::class, 'complete']);
    Route::get('/transfers/{id}/print-ba', [AssetTransferController::class, 'printBA']);

    // Asset Disposition / Disposal
    Route::get('/dispositions', [AssetDispositionController::class, 'index']);
    Route::post('/dispositions', [AssetDispositionController::class, 'store']);
    Route::post('/dispositions/{id}/complete', [AssetDispositionController::class, 'complete']);
    Route::post('/dispositions/{id}/cancel', [AssetDispositionController::class, 'cancel']);

    // Master Tables dropdowns and CRUD
    // Locations
    Route::get('/locations', [MasterController::class, 'getLocations']);
    Route::get('/locations/all', [MasterController::class, 'allLocations']);
    Route::post('/locations', [MasterController::class, 'storeLocation']);
    Route::put('/locations/{id}', [MasterController::class, 'updateLocation']);
    Route::delete('/locations/{id}', [MasterController::class, 'destroyLocation']);

    // Units
    Route::get('/units', [MasterController::class, 'getUnits']);
    Route::get('/units/all', [MasterController::class, 'allUnits']);
    Route::post('/units', [MasterController::class, 'storeUnit']);
    Route::put('/units/{id}', [MasterController::class, 'updateUnit']);
    Route::delete('/units/{id}', [MasterController::class, 'destroyUnit']);

    // Categories
    Route::get('/categories', [MasterController::class, 'getCategories']);
    Route::get('/categories/all', [MasterController::class, 'allCategories']);
    Route::post('/categories', [MasterController::class, 'storeCategory']);
    Route::put('/categories/{id}', [MasterController::class, 'updateCategory']);
    Route::delete('/categories/{id}', [MasterController::class, 'destroyCategory']);

    // Tools
    Route::get('/tools', [MasterController::class, 'getTools']);
    Route::get('/tools/all', [MasterController::class, 'allTools']);
    Route::post('/tools', [MasterController::class, 'storeTool']);
    Route::put('/tools/{id}', [MasterController::class, 'updateTool']);
    Route::delete('/tools/{id}', [MasterController::class, 'destroyTool']);

    // Years
    Route::get('/years', [MasterController::class, 'getYears']);
    Route::get('/years/all', [MasterController::class, 'allYears']);
    Route::post('/years', [MasterController::class, 'storeYear']);
    Route::put('/years/{id}', [MasterController::class, 'updateYear']);
    Route::delete('/years/{id}', [MasterController::class, 'destroyYear']);

    // Aktivas
    Route::get('/aktivas', [MasterController::class, 'getAktivas']);
    Route::get('/aktivas/all', [MasterController::class, 'allAktivas']);
    Route::post('/aktivas', [MasterController::class, 'storeAktiva']);
    Route::put('/aktivas/{id}', [MasterController::class, 'updateAktiva']);
    Route::delete('/aktivas/{id}', [MasterController::class, 'destroyAktiva']);

    // Kelola Users
    Route::get('/users', [MasterController::class, 'getUsers']);
    Route::get('/users/all', [MasterController::class, 'allUsers']);
    Route::post('/users', [MasterController::class, 'storeUser']);
    Route::put('/users/{id}', [MasterController::class, 'updateUser']);
    Route::delete('/users/{id}', [MasterController::class, 'destroyUser']);

    // Spatie Log Aktivitas
    Route::get('/activities', [MasterController::class, 'getActivities']);
});
