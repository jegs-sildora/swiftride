<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BookingController extends Controller
{
    /**
     * Base URLs for internal inter-service calls (Docker DNS names).
     */
    private string $fleetUrl;
    private string $crmUrl;
    private string $billingUrl;

    public function __construct()
    {
        $this->fleetUrl = rtrim(config('services.fleet.url', 'http://fleet:8001'), '/');
        $this->crmUrl   = rtrim(config('services.crm.url',   'http://crm:8002'),   '/');
        $this->billingUrl = rtrim(config('services.billing.url', 'http://billing:8004'), '/');
    }

    /**
     * List bookings.
     * GET /api/bookings?customer_id=1&status=pending
     */
    public function index(Request $request): JsonResponse
    {
        $query = Booking::query();

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->integer('customer_id'));
        }
        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->integer('vehicle_id'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->orderByDesc('created_at')->paginate(20));
    }

    /**
     * Create a new booking.
     * POST /api/bookings
     *
     * Performs pre-flight checks against Fleet and CRM services:
     *   1. Fleet: vehicle is available + fetches daily_rate
     *   2. CRM:   customer is eligible (active + valid license)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id'             => 'required|integer',
            'vehicle_id'              => 'required|integer',
            'start_date'              => 'required|date|after_or_equal:today',
            'end_date'                => 'required|date|after:start_date',
            'notes'                   => 'sometimes|string|max:1000',
            'pickup_location'         => 'sometimes|string|max:255',
            'return_location'         => 'sometimes|string|max:255',
            'security_deposit_amount' => 'sometimes|numeric|min:0',
            'security_deposit_status' => 'sometimes|in:held,refunded,forfeited',
            'addons'                  => 'sometimes|array',
            'addons.*.addon_type'     => 'required|string',
            'addons.*.daily_rate'     => 'required|numeric|min:0',
        ]);

        // --- Pre-flight: check vehicle availability (Fleet service) ---
        $fleetResp = Http::timeout(5)
            ->get("{$this->fleetUrl}/api/vehicles/{$validated['vehicle_id']}/availability");

        if (! $fleetResp->successful()) {
            return response()->json(['error' => 'Unable to reach Fleet service.'], 503);
        }

        $fleetData = $fleetResp->json();
        if (! ($fleetData['available'] ?? false)) {
            return response()->json([
                'error'  => 'Vehicle is not available for booking.',
                'status' => $fleetData['status'] ?? 'unknown',
            ], 422);
        }

        // --- Pre-flight: verify customer eligibility (CRM service) ---
        $crmResp = Http::timeout(5)
            ->get("{$this->crmUrl}/api/customers/{$validated['customer_id']}/verify");

        if (! $crmResp->successful()) {
            return response()->json(['error' => 'Unable to reach CRM service.'], 503);
        }

        $crmData = $crmResp->json();
        if (! ($crmData['eligible'] ?? false)) {
            return response()->json([
                'error'  => 'Customer is not eligible to make a booking.',
                'reason' => $crmData['reason'] ?? null,
            ], 422);
        }

        // --- Fetch loyalty discount from CRM service ---
        $discountPercentage = 0.00;
        $crmDiscountResp = Http::timeout(5)
            ->get("{$this->crmUrl}/api/customers/{$validated['customer_id']}/discount");
        if ($crmDiscountResp->successful()) {
            $discountPercentage = (float) ($crmDiscountResp->json()['discount_percentage'] ?? 0.00);
        }

        // --- Compute cost ---
        $originalDailyRate = (float) $fleetData['daily_rate'];
        $dailyRate         = round($originalDailyRate * (1 - $discountPercentage), 2);
        $start             = \Carbon\Carbon::parse($validated['start_date']);
        $end               = \Carbon\Carbon::parse($validated['end_date']);
        $days              = max($start->diffInDays($end), 1);
        $baseCost          = round($dailyRate * $days, 2);

        // Calculate add-on costs
        $addonsCost = 0.00;
        $addonsData = [];
        if (!empty($validated['addons'])) {
            foreach ($validated['addons'] as $addon) {
                $addonTotal = round((float)$addon['daily_rate'] * $days, 2);
                $addonsCost += $addonTotal;
                $addonsData[] = [
                    'addon_type' => strtoupper($addon['addon_type']),
                    'daily_rate' => (float)$addon['daily_rate'],
                    'total_cost' => $addonTotal,
                ];
            }
        }

        $totalCost = $baseCost + $addonsCost;

        // --- Create booking ---
        $booking = Booking::create([
            'customer_id'             => $validated['customer_id'],
            'vehicle_id'              => $validated['vehicle_id'],
            'start_date'              => $validated['start_date'],
            'end_date'                => $validated['end_date'],
            'status'                  => 'pending',
            'daily_rate'              => $dailyRate,
            'total_cost'              => $totalCost,
            'notes'                   => $validated['notes'] ?? null,
            'pickup_location'         => $validated['pickup_location'] ?? 'MANILA HEAD OFFICE',
            'return_location'         => $validated['return_location'] ?? 'MANILA HEAD OFFICE',
            'security_deposit_amount' => $validated['security_deposit_amount'] ?? 5000.00,
            'security_deposit_status' => $validated['security_deposit_status'] ?? 'held',
        ]);

        foreach ($addonsData as $addonRow) {
            $booking->bookingAddons()->create($addonRow);
        }

        // Mark vehicle as rented in Fleet service (best-effort, non-blocking)
        Http::timeout(5)->patch("{$this->fleetUrl}/api/vehicles/{$validated['vehicle_id']}/status", [
            'status' => 'rented',
        ])->onError(function () use ($validated) {
            Log::warning("Failed to mark vehicle {$validated['vehicle_id']} as rented in Fleet service.");
        });

        return response()->json($booking->load('bookingAddons'), 201);
    }

    /**
     * Show a single booking with its schedule events.
     * GET /api/bookings/{id}
     */
    public function show(int $id): JsonResponse
    {
        return response()->json(Booking::with(['schedules', 'bookingAddons'])->findOrFail($id));
    }

    /**
     * Update booking status or notes.
     * PUT /api/bookings/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $booking = Booking::with('bookingAddons')->findOrFail($id);

        $validated = $request->validate([
            'status'                  => 'sometimes|in:pending,confirmed,active,completed,cancelled',
            'notes'                   => 'sometimes|string|max:1000',
            'confirmed_by'            => 'sometimes|integer',
            'security_deposit_status' => 'sometimes|in:held,refunded,forfeited',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'confirmed') {
            $validated['confirmed_at'] = now();
        }

        // If booking is completed, free the vehicle (best-effort) and generate invoice
        if (($validated['status'] ?? null) === 'completed') {
            Http::timeout(5)->patch("{$this->fleetUrl}/api/vehicles/{$booking->vehicle_id}/status", [
                'status' => 'available',
            ])->onError(fn() => Log::warning("Failed to release vehicle {$booking->vehicle_id} after booking completion."));

            // Compile itemized line items
            $days = max(\Carbon\Carbon::parse($booking->start_date)->diffInDays(\Carbon\Carbon::parse($booking->end_date)), 1);
            $baseCost = round((float)$booking->daily_rate * $days, 2);
            $lineItems = [];

            // 1. Base rental
            $lineItems[] = [
                'description' => "Base Vehicle Rental (₱" . number_format($booking->daily_rate, 2) . "/day for {$days} days)",
                'unit_price'  => (float)$booking->daily_rate,
                'quantity'    => $days,
                'subtotal'    => $baseCost,
            ];

            // 2. Addons
            foreach ($booking->bookingAddons as $addon) {
                $addonDesc = str_replace('_', ' ', $addon->addon_type);
                $lineItems[] = [
                    'description' => "Add-on: {$addonDesc} (₱" . number_format($addon->daily_rate, 2) . "/day)",
                    'unit_price'  => (float)$addon->daily_rate,
                    'quantity'    => $days,
                    'subtotal'    => (float)$addon->total_cost,
                ];
            }

            // Call Billing Service to generate invoice automatically
            Http::timeout(5)->post("{$this->billingUrl}/api/invoices", [
                'booking_id'  => $booking->id,
                'customer_id' => $booking->customer_id,
                'amount'      => $booking->total_cost,
                'due_date'    => now()->addDays(7)->toDateString(),
                'notes'       => "Invoice generated automatically for completed booking #{$booking->id}",
                'line_items'  => $lineItems,
            ])->onError(fn($e) => Log::warning("Failed to generate invoice for booking {$booking->id}: " . $e->getMessage()));
        }

        // If booking is cancelled, free the vehicle (best-effort)
        if (($validated['status'] ?? null) === 'cancelled') {
            Http::timeout(5)->patch("{$this->fleetUrl}/api/vehicles/{$booking->vehicle_id}/status", [
                'status' => 'available',
            ])->onError(fn() => Log::warning("Failed to release vehicle {$booking->vehicle_id} after cancellation."));
        }

        $booking->update($validated);
        return response()->json($booking->load('bookingAddons'));
    }

    /**
     * Cancel (soft-delete) a booking.
     * DELETE /api/bookings/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        $booking->update(['status' => 'cancelled']);

        Http::timeout(5)->patch("{$this->fleetUrl}/api/vehicles/{$booking->vehicle_id}/status", [
            'status' => 'available',
        ])->onError(fn() => Log::warning("Failed to release vehicle {$booking->vehicle_id} on booking delete."));

        $booking->delete();
        return response()->json(['message' => 'Booking cancelled.']);
    }

    /**
     * Get addons for a specific booking.
     * GET /api/bookings/{id}/addons
     */
    public function getAddons(int $id): JsonResponse
    {
        $booking = Booking::findOrFail($id);
        return response()->json($booking->bookingAddons);
    }
}
