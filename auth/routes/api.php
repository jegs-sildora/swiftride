<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SwiftRide Auth Service — Route Definitions
|--------------------------------------------------------------------------
|
| Public routes: /auth/register, /auth/login
| Protected routes: /auth/me, /auth/refresh, /auth/logout
|
*/

// -----------------------------------------------------------------
// Public — no token required
// -----------------------------------------------------------------
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

// -----------------------------------------------------------------
// Protected — valid JWT required
// -----------------------------------------------------------------
Route::middleware('jwt.auth')->group(function () {
    Route::get('/me',       [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::post('/logout',  [AuthController::class, 'logout']);
});
