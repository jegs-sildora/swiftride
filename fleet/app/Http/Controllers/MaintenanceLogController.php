<?php

namespace App\Http\Controllers;

use App\Models\MaintenanceLog;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaintenanceLogController extends Controller
{
    /**
     * List all maintenance logs, optionally filtered by vehicle.
     * GET /api/maintenance-logs?vehicle_id=1
     */
    public function index(Request $request): JsonResponse
    {
        $query = MaintenanceLog::with('vehicle');

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->integer('vehicle_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->orderByDesc('created_at')->paginate(20));
    }

    /**
     * Log a new maintenance entry for a vehicle.
     * POST /api/maintenance-logs
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vehicle_id'   => 'required|integer|exists:vehicles,id',
            'description'  => 'required|string|max:2000',
            'performed_by' => 'sometimes|string|max:255',
            'status'       => 'sometimes|in:scheduled,in_progress,completed',
            'scheduled_at' => 'sometimes|date',
            'completed_at' => 'sometimes|date|after_or_equal:scheduled_at',
        ]);

        $log = MaintenanceLog::create($validated);

        // Automatically set vehicle to maintenance when a log is created
        if (($validated['status'] ?? 'scheduled') === 'in_progress') {
            Vehicle::where('id', $validated['vehicle_id'])
                ->update(['status' => 'maintenance']);
        }

        return response()->json($log->load('vehicle'), 201);
    }

    /**
     * Show a single maintenance log entry.
     * GET /api/maintenance-logs/{id}
     */
    public function show(int $id): JsonResponse
    {
        return response()->json(MaintenanceLog::with('vehicle')->findOrFail($id));
    }

    /**
     * Update a maintenance log entry.
     * PUT /api/maintenance-logs/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $log = MaintenanceLog::findOrFail($id);

        $validated = $request->validate([
            'description'  => 'sometimes|string|max:2000',
            'performed_by' => 'sometimes|string|max:255',
            'status'       => 'sometimes|in:scheduled,in_progress,completed',
            'scheduled_at' => 'sometimes|date',
            'completed_at' => 'sometimes|date',
        ]);

        $log->update($validated);

        // When maintenance is completed, restore vehicle to available
        if (($validated['status'] ?? null) === 'completed') {
            Vehicle::where('id', $log->vehicle_id)
                ->where('status', 'maintenance')
                ->update(['status' => 'available']);
        }

        return response()->json($log->load('vehicle'));
    }

    /**
     * Delete a maintenance log entry.
     * DELETE /api/maintenance-logs/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        MaintenanceLog::findOrFail($id)->delete();
        return response()->json(['message' => 'Maintenance log deleted.']);
    }
}
