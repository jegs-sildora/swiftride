<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    /**
     * List all vehicles with optional status filter.
     * GET /api/vehicles?status=available
     */
    public function index(Request $request): JsonResponse
    {
        $query = Vehicle::query();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        return response()->json($query->orderBy('id')->paginate(20));
    }

    /**
     * Store a new vehicle.
     * POST /api/vehicles
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'make'         => 'required|string|max:100',
            'model'        => 'required|string|max:100',
            'year'         => 'required|integer|min:1900|max:2100',
            'plate_number' => 'required|string|max:20|unique:vehicles,plate_number',
            'color'        => 'sometimes|string|max:50',
            'type'         => 'sometimes|string|in:car,van,truck,bus,motorcycle',
            'status'       => 'sometimes|in:available,rented,maintenance',
            'daily_rate'   => 'required|numeric|min:0',
            'description'  => 'sometimes|string|max:1000',
        ]);

        $vehicle = Vehicle::create($validated);

        return response()->json($vehicle, 201);
    }

    /**
     * Show a single vehicle.
     * GET /api/vehicles/{id}
     */
    public function show(int $id): JsonResponse
    {
        $vehicle = Vehicle::with('maintenanceLogs')->findOrFail($id);
        return response()->json($vehicle);
    }

    /**
     * Update vehicle details.
     * PUT /api/vehicles/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $vehicle = Vehicle::findOrFail($id);

        $validated = $request->validate([
            'make'         => 'sometimes|string|max:100',
            'model'        => 'sometimes|string|max:100',
            'year'         => 'sometimes|integer|min:1900|max:2100',
            'plate_number' => 'sometimes|string|max:20|unique:vehicles,plate_number,' . $id,
            'color'        => 'sometimes|string|max:50',
            'type'         => 'sometimes|string|in:car,van,truck,bus,motorcycle',
            'status'       => 'sometimes|in:available,rented,maintenance',
            'daily_rate'   => 'sometimes|numeric|min:0',
            'description'  => 'sometimes|string|max:1000',
        ]);

        $vehicle->update($validated);

        return response()->json($vehicle);
    }

    /**
     * Soft-delete (retire) a vehicle.
     * DELETE /api/vehicles/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        Vehicle::findOrFail($id)->delete();
        return response()->json(['message' => 'Vehicle retired successfully.']);
    }

    /**
     * Toggle the vehicle's status (software-only manual update).
     * PATCH /api/vehicles/{id}/status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $vehicle = Vehicle::findOrFail($id);

        $request->validate([
            'status' => 'required|in:available,rented,maintenance',
        ]);

        $vehicle->update(['status' => $request->input('status')]);

        return response()->json([
            'message' => 'Vehicle status updated.',
            'vehicle' => $vehicle,
        ]);
    }

    /**
     * Check availability for a specific vehicle.
     * GET /api/vehicles/{id}/availability
     * Called by the Booking Service via internal HTTP.
     */
    public function checkAvailability(int $id): JsonResponse
    {
        $vehicle = Vehicle::findOrFail($id);

        return response()->json([
            'vehicle_id'  => $vehicle->id,
            'available'   => $vehicle->isAvailable(),
            'status'      => $vehicle->status,
            'daily_rate'  => $vehicle->daily_rate,
        ]);
    }
}
