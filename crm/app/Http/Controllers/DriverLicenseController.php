<?php

namespace App\Http\Controllers;

use App\Models\DriverLicense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DriverLicenseController extends Controller
{
    /**
     * List all driver licenses, optionally filtered by customer.
     * GET /api/driver-licenses?customer_id=1
     */
    public function index(Request $request): JsonResponse
    {
        $query = DriverLicense::with('customer');

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->integer('customer_id'));
        }

        return response()->json($query->orderByDesc('created_at')->paginate(20));
    }

    /**
     * Record a new driver license for a customer.
     * POST /api/driver-licenses
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_id'       => 'required|integer|exists:customers,id',
            'license_number'    => 'required|string|max:50|unique:driver_licenses,license_number',
            'expiry_date'       => 'required|date|after:today',
            'issuing_authority' => 'sometimes|string|max:255',
            'license_class'     => 'sometimes|string|max:10',
        ]);

        return response()->json(
            DriverLicense::create($validated)->load('customer'),
            201
        );
    }

    /**
     * Show a single driver license.
     * GET /api/driver-licenses/{id}
     */
    public function show(int $id): JsonResponse
    {
        return response()->json(
            DriverLicense::with('customer')->findOrFail($id)
        );
    }

    /**
     * Update a driver license record.
     * PUT /api/driver-licenses/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $license = DriverLicense::findOrFail($id);

        $validated = $request->validate([
            'license_number'    => 'sometimes|string|max:50|unique:driver_licenses,license_number,' . $id,
            'expiry_date'       => 'sometimes|date',
            'issuing_authority' => 'sometimes|string|max:255',
            'license_class'     => 'sometimes|string|max:10',
        ]);

        $license->update($validated);
        return response()->json($license);
    }

    /**
     * Delete a driver license record.
     * DELETE /api/driver-licenses/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        DriverLicense::findOrFail($id)->delete();
        return response()->json(['message' => 'Driver license removed.']);
    }

    /**
     * Mark a license as verified by staff.
     * PATCH /api/driver-licenses/{id}/verify
     */
    public function verify(int $id): JsonResponse
    {
        $license = DriverLicense::findOrFail($id);
        $license->update([
            'verified'    => true,
            'verified_at' => now(),
        ]);
        return response()->json(['message' => 'License verified.', 'license' => $license]);
    }
}
