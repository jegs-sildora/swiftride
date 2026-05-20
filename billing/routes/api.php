<?php

use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\RefundController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| SwiftRide Billing Service — API Routes (port 8004)
|--------------------------------------------------------------------------
*/

// Invoices — explicit routes BEFORE apiResource to avoid {invoice} param swallowing them
Route::get('invoices/summary', [InvoiceController::class, 'summary']);
Route::get('reports/revenue',  [InvoiceController::class, 'revenue']);
Route::apiResource('invoices', InvoiceController::class);

// Payments
Route::get('payments',         [PaymentController::class, 'index']);
Route::post('payments',        [PaymentController::class, 'store']);
Route::get('payments/{id}',    [PaymentController::class, 'show']);
Route::delete('payments/{id}', [PaymentController::class, 'destroy']);

// Refunds
Route::apiResource('refunds', RefundController::class)->only(['index', 'store']);
