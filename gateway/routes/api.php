<?php

use App\Http\Controllers\ProxyController;
use Illuminate\Support\Facades\Route;


//|--------------------------------------------------------------------------
// SwiftRide API Gateway — Route Definitions
/*
|--------------------------------------------------------------------------
| SwiftRide API Gateway — Route Definitions
|--------------------------------------------------------------------------
|
| Downstream service routing:
|   /api/auth/*     → auth service    (port 8005)
|   /api/fleet/*    → fleet service   (port 8001)
|   /api/crm/*      → crm service     (port 8002)
|   /api/booking/*  → booking service (port 8003)
|   /api/billing/*  → billing service (port 8004, admin/dispatcher only)
|
*/

// -----------------------------------------------------------------
// Public — no token required
// -----------------------------------------------------------------
Route::any('/auth/{path?}', function (\Illuminate\Http\Request $request, $path = '') {
    return app(ProxyController::class)->proxy($request, 'auth', $path);
})->where(['path' => 'register|login']);

// -----------------------------------------------------------------
// Protected — valid JWT required for all routes below
// -----------------------------------------------------------------
Route::middleware('jwt.auth')->group(function () {

    // Single parameterized catch-all proxy route.
    // The ProxyController handles per-service access control (e.g., billing RBAC).
    Route::any('/{service}/{path?}', [ProxyController::class, 'proxy'])
        ->where([
            'service' => 'auth|fleet|crm|booking|billing',
            'path'    => '.*',
        ]);
});
