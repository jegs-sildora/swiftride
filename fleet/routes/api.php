<?php

use App\Http\Controllers\MaintenanceLogController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\VehicleInspectionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SwiftRide Fleet Service — API Routes (port 8001)
|--------------------------------------------------------------------------
|
| All routes are accessible only via the API Gateway (internal Docker DNS).
| The gateway forwards X-Auth-User-Id and X-Auth-Role headers which
| identify the caller. No JWT re-validation is performed here.
|
*/

// Vehicle CRUD & management
Route::apiResource('vehicles', VehicleController::class);
Route::patch('vehicles/{id}/status', [VehicleController::class, 'updateStatus']);

// Availability check — called internally by Booking Service
Route::get('vehicles/{id}/availability', [VehicleController::class, 'checkAvailability']);

// Maintenance logs
Route::apiResource('maintenance-logs', MaintenanceLogController::class);

// Vehicle Inspections
Route::get('vehicles/{vehicle}/inspections', [VehicleInspectionController::class, 'index']);
Route::post('vehicles/{vehicle}/inspections', [VehicleInspectionController::class, 'store']);
