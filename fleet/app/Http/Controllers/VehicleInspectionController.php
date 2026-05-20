<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\VehicleInspection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleInspectionController extends Controller
{
    /**
     * List all inspections for a vehicle.
     * GET /api/vehicles/{vehicle_id}/inspections
     */
    public function index(int $vehicleId): JsonResponse
    {
        $vehicle = Vehicle::findOrFail($vehicleId);
        $inspections = $vehicle->vehicleInspections()->orderBy('created_at', 'desc')->get();
        return response()->json($inspections);
    }

    /**
     * Store a new inspection.
     * POST /api/vehicles/{vehicle_id}/inspections
     */
    public function store(Request $request, int $vehicleId): JsonResponse
    {
        $vehicle = Vehicle::findOrFail($vehicleId);

        $validated = $request->validate([
            'booking_id'            => 'sometimes|nullable|integer',
            'inspection_type'       => 'required|in:checkout,checkin',
            'odometer_reading'      => 'required|integer|min:' . $vehicle->current_odometer,
            'fuel_level_percent'    => 'required|numeric|min:0|max:100',
            'body_damage_notes'     => 'sometimes|nullable|string',
            'interior_clean_status' => 'sometimes|string',
            'safety_check_passed'   => 'sometimes|boolean',
            'inspector_id'          => 'sometimes|nullable|integer',
        ]);

        $validated['vehicle_id'] = $vehicle->id;

        // Force safety_check_passed value to be a boolean default true if not set
        if (!isset($validated['safety_check_passed'])) {
            $validated['safety_check_passed'] = true;
        }

        $inspection = VehicleInspection::create($validated);

        // Update Vehicle state
        $vehicleUpdates = [
            'current_odometer' => $inspection->odometer_reading,
        ];

        // If safety check fails, send vehicle to maintenance
        if (!$inspection->safety_check_passed) {
            $vehicleUpdates['status'] = 'maintenance';
        } elseif ($inspection->inspection_type === 'checkin') {
            // If checked in and passed safety, it's available again
            $vehicleUpdates['status'] = 'available';
        } elseif ($inspection->inspection_type === 'checkout') {
            // If checked out, it's now rented
            $vehicleUpdates['status'] = 'rented';
        }

        $vehicle->update($vehicleUpdates);

        return response()->json([
            'message'    => 'Inspection recorded successfully.',
            'inspection' => $inspection,
            'vehicle'    => $vehicle->fresh(),
        ], 201);
    }
}
