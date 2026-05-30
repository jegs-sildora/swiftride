<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * List all customers.
     * GET /api/customers?status=active&search=john
     */
    public function index(Request $request): JsonResponse
    {
        $query = Customer::query();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->where(function ($q) use ($term) {
                $q->where('first_name', 'ilike', "%{$term}%")
                  ->orWhere('last_name', 'ilike', "%{$term}%")
                  ->orWhere('email', 'ilike', "%{$term}%");
            });
        }

        return response()->json($query->orderBy('last_name')->paginate(20));
    }

    /**
     * Create a new customer.
     * POST /api/customers
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name'             => 'required|string|max:100',
            'last_name'              => 'required|string|max:100',
            'email'                  => 'required|email|unique:customers,email',
            'phone'                  => 'sometimes|nullable|string|max:30',
            'billing_address'        => 'sometimes|nullable|string|max:500',
            'city'                   => 'sometimes|nullable|string|max:100',
            'state'                  => 'sometimes|nullable|string|max:100',
            'postal_code'            => 'sometimes|nullable|string|max:20',
            'country'                => 'sometimes|nullable|string|max:100',
            'loyalty_tier'           => 'sometimes|nullable|string|in:BRONZE,SILVER,GOLD',
            'loyalty_points'         => 'sometimes|nullable|integer|min:0',
            'government_id_verified' => 'sometimes|nullable|boolean',
        ]);

        return response()->json(Customer::create($validated), 201);
    }

    /**
     * Show a customer with their driver licenses and uploaded documents.
     * GET /api/customers/{id}
     */
    public function show(int $id): JsonResponse
    {
        return response()->json(
            Customer::with(['driverLicenses', 'customerDocuments'])->findOrFail($id)
        );
    }

    /**
     * Update customer details.
     * PUT /api/customers/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        $validated = $request->validate([
            'first_name'             => 'sometimes|string|max:100',
            'last_name'              => 'sometimes|string|max:100',
            'email'                  => 'sometimes|email|unique:customers,email,' . $id,
            'phone'                  => 'sometimes|nullable|string|max:30',
            'billing_address'        => 'sometimes|nullable|string|max:500',
            'city'                   => 'sometimes|nullable|string|max:100',
            'state'                  => 'sometimes|nullable|string|max:100',
            'postal_code'            => 'sometimes|nullable|string|max:20',
            'country'                => 'sometimes|nullable|string|max:100',
            'status'                 => 'sometimes|in:active,suspended,blacklisted',
            'loyalty_tier'           => 'sometimes|nullable|string|in:BRONZE,SILVER,GOLD',
            'loyalty_points'         => 'sometimes|nullable|integer|min:0',
            'government_id_verified' => 'sometimes|nullable|boolean',
        ]);

        $customer->update($validated);
        return response()->json($customer);
    }

    /**
     * Soft-delete a customer record.
     * DELETE /api/customers/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        Customer::findOrFail($id)->delete();
        return response()->json(['message' => 'Customer removed.']);
    }

    /**
     * Eligibility check endpoint — called internally by Booking Service.
     * GET /api/customers/{id}/verify
     * Returns: { eligible: bool, reason: string|null }
     */
    public function verify(int $id): JsonResponse
    {
        $customer = Customer::with('driverLicenses')->findOrFail($id);

        if ($customer->status !== 'active') {
            return response()->json([
                'eligible' => false,
                'reason'   => "Customer account is {$customer->status}.",
            ]);
        }

        $validLicense = $customer->driverLicenses()
            ->where('verified', true)
            ->where('expiry_date', '>', now())
            ->first();

        if (! $validLicense) {
            return response()->json([
                'eligible' => false,
                'reason'   => 'No valid verified driver\'s license on record.',
            ]);
        }

        return response()->json([
            'eligible'   => true,
            'reason'     => null,
            'license_id' => $validLicense->getKey(),
        ]);
    }

    /**
     * Get the discount rate for a customer based on loyalty tier.
     * GET /api/customers/{id}/discount
     */
    public function getDiscount(int $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);
        return response()->json([
            'customer_id'         => $customer->id,
            'loyalty_tier'        => $customer->loyalty_tier,
            'discount_percentage' => $customer->getDiscountPercentage(),
        ]);
    }
}
