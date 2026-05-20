<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ProxyController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SwiftRide API Gateway — Route Definitions
|--------------------------------------------------------------------------
|
| Public routes: /auth/register, /auth/login
| Protected routes: everything else (require valid Bearer JWT)
|
| Downstream service routing:
|   /api/fleet/*    → fleet service   (port 8001)
|   /api/crm/*      → crm service     (port 8002)
|   /api/booking/*  → booking service (port 8003)
|   /api/billing/*  → billing service (port 8004, admin/dispatcher only)
|
*/

// -----------------------------------------------------------------
// Public — no token required
// -----------------------------------------------------------------
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// -----------------------------------------------------------------
// Protected — valid JWT required for all routes below
// -----------------------------------------------------------------
Route::middleware('jwt.auth')->group(function () {

    // Auth utilities
    Route::prefix('auth')->group(function () {
        Route::get('/me',       [AuthController::class, 'me']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::post('/logout',  [AuthController::class, 'logout']);
    });

    // Single parameterized catch-all proxy route.
    // The ProxyController handles per-service access control (e.g., billing RBAC).
    Route::any('/{service}/{path?}', [ProxyController::class, 'proxy'])
        ->where([
            'service' => 'fleet|crm|booking|billing',
            'path'    => '.*',
        ]);
});
