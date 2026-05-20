<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Refund;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RefundController extends Controller
{
    /**
     * List all refunds.
     * GET /api/refunds
     */
    public function index(): JsonResponse
    {
        $refunds = Refund::with('invoice')->orderBy('created_at', 'desc')->get();
        return response()->json($refunds);
    }

    /**
     * Store a new refund.
     * POST /api/refunds
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invoice_id'     => 'required|integer|exists:invoices,id',
            'refund_amount'  => 'required|numeric|min:0.01',
            'refund_method'  => 'sometimes|string|max:50',
            'reference_code' => 'sometimes|nullable|string|max:100',
            'notes'          => 'sometimes|nullable|string',
        ]);

        $invoice = Invoice::findOrFail($validated['invoice_id']);

        if ($validated['refund_amount'] > $invoice->amount_paid) {
            return response()->json([
                'error' => 'Refund amount cannot exceed the total amount paid on the invoice.',
                'amount_paid' => $invoice->amount_paid,
            ], 422);
        }

        $refund = Refund::create([
            'invoice_id'     => $invoice->id,
            'refund_amount'  => $validated['refund_amount'],
            'refund_method'  => strtoupper($validated['refund_method'] ?? 'CASH'),
            'reference_code' => $validated['reference_code'] ?? null,
            'notes'          => $validated['notes'] ?? null,
            'processed_at'   => now(),
        ]);

        // Adjust amount paid on invoice
        $invoice->amount_paid = max(0, (float)$invoice->amount_paid - (float)$validated['refund_amount']);
        $invoice->save();

        if ($invoice->amount_paid <= 0) {
            $invoice->update(['status' => 'refunded']);
        } else {
            $invoice->recomputeStatus();
        }

        return response()->json([
            'message' => 'Refund processed successfully.',
            'refund'  => $refund,
            'invoice' => $invoice->fresh(['payments', 'invoiceLineItems', 'refunds']),
        ], 201);
    }
}
