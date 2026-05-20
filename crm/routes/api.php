<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DriverLicenseController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SwiftRide CRM Service — API Routes (port 8002)
|--------------------------------------------------------------------------
*/

// Customer CRUD
Route::apiResource('customers', CustomerController::class);

// Eligibility check — called internally by Booking Service
Route::get('customers/{id}/verify', [CustomerController::class, 'verify']);

// Driver License CRUD
Route::apiResource('driver-licenses', DriverLicenseController::class);
Route::patch('driver-licenses/{id}/verify', [DriverLicenseController::class, 'verify']);
