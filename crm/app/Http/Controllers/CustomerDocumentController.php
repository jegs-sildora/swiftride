<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CustomerDocumentController extends Controller
{
    /**
     * List all documents for a customer.
     * GET /api/customers/{customer_id}/documents
     */
    public function index(int $customerId): JsonResponse
    {
        $customer = Customer::findOrFail($customerId);
        $documents = $customer->customerDocuments()->orderBy('created_at', 'desc')->get();
        return response()->json($documents);
    }

    /**
     * Store a new document for a customer.
     * POST /api/customers/{customer_id}/documents
     */
    public function store(Request $request, int $customerId): JsonResponse
    {
        $customer = Customer::findOrFail($customerId);

        $validated = $request->validate([
            'document_type' => 'required|string|max:100',
            // Allow both physical file upload or mock path/text uploads for simplicity and testing
            'file'          => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:10240',
            'file_path'     => 'sometimes|string|max:255',
        ]);

        $filePath = '';

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('customer_documents', 'public');
        } elseif ($request->filled('file_path')) {
            $filePath = $request->input('file_path');
        } else {
            // Mock path if none is supplied
            $filePath = 'customer_documents/' . uniqid() . '_' . strtolower(str_replace(' ', '_', $validated['document_type'])) . '.jpg';
        }

        $document = CustomerDocument::create([
            'customer_id'   => $customer->id,
            'document_type' => strtoupper($validated['document_type']),
            'file_path'     => $filePath,
        ]);

        // Auto-verify government ID status if a government ID or passport is uploaded
        if (in_array(strtoupper($validated['document_type']), ['PASSPORT_SCAN', 'GOVERNMENT_ID', 'DRIVERS_LICENSE'])) {
            $customer->update(['government_id_verified' => true]);
        }

        return response()->json([
            'message'  => 'Document uploaded and registered successfully.',
            'document' => $document,
            'customer' => $customer->fresh(),
        ], 201);
    }
}
