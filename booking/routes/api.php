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

// Booking schedule events
Route::apiResource('schedules', ScheduleController::class)->except(['update']);
Route::put('schedules/{id}', [ScheduleController::class, 'update']);
