<?php

namespace App\Http\Controllers;

use App\Models\Schedule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    /**
     * List all schedule events for a booking.
     * GET /api/schedules?booking_id=1
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'booking_id' => 'required|integer',
        ]);

        return response()->json(
            Schedule::where('booking_id', $request->integer('booking_id'))
                ->orderBy('event_time')
                ->get()
        );
    }

    /**
     * Add a schedule event to a booking.
     * POST /api/schedules
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_id'  => 'required|integer|exists:bookings,id',
            'event_type'  => 'required|in:pickup_scheduled,pickup_completed,return_scheduled,return_completed,cancellation,note',
            'event_time'  => 'required|date',
            'notes'       => 'sometimes|string|max:1000',
            'created_by'  => 'sometimes|integer',
        ]);

        return response()->json(Schedule::create($validated), 201);
    }

    /**
     * Show a single schedule event.
     * GET /api/schedules/{id}
     */
    public function show(int $id): JsonResponse
    {
        return response()->json(Schedule::with('booking')->findOrFail($id));
    }

    /**
     * Update a schedule event.
     * PUT /api/schedules/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $schedule = Schedule::findOrFail($id);

        $validated = $request->validate([
            'event_type' => 'sometimes|in:pickup_scheduled,pickup_completed,return_scheduled,return_completed,cancellation,note',
            'event_time' => 'sometimes|date',
            'notes'      => 'sometimes|string|max:1000',
        ]);

        $schedule->update($validated);
        return response()->json($schedule);
    }

    /**
     * Remove a schedule event.
     * DELETE /api/schedules/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        Schedule::findOrFail($id)->delete();
        return response()->json(['message' => 'Schedule event removed.']);
    }
}
