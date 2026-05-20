<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\ScheduleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SwiftRide Booking Service — API Routes (port 8003)
|--------------------------------------------------------------------------
*/

// Bookings CRUD
Route::apiResource('bookings', BookingController::class);
Route::get('bookings/{id}/addons', [BookingController::class, 'getAddons']);

// Booking schedule events
Route::apiResource('schedules', ScheduleController::class)->except(['update']);
Route::put('schedules/{id}', [ScheduleController::class, 'update']);
