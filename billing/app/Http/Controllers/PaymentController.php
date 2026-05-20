<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * List payments for an invoice.
     * GET /api/payments?invoice_id=1
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate(['invoice_id' => 'required|integer']);

        return response()->json(
            Payment::where('invoice_id', $request->integer('invoice_id'))
                ->orderByDesc('paid_at')
                ->get()
        );
    }

    /**
     * Record a payment against an invoice.
     * POST /api/payments
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invoice_id' => 'required|integer|exists:invoices,id',
            'amount'     => 'required|numeric|min:0.01',
            'method'     => 'sometimes|in:cash,card,bank_transfer,gcash,maya,other',
            'reference'  => 'sometimes|string|max:100',
            'paid_at'    => 'sometimes|date',
            'notes'      => 'sometimes|string|max:500',
        ]);

        $invoice = Invoice::findOrFail($validated['invoice_id']);

        if ($invoice->status === 'void') {
            return response()->json(['error' => 'Cannot record payment on a voided invoice.'], 422);
        }

        $payment = Payment::create($validated);

        // Update invoice amount_paid and recompute status
        $totalPaid = Payment::where('invoice_id', $invoice->id)->sum('amount');
        $invoice->update(['amount_paid' => $totalPaid]);
        $invoice->recomputeStatus();

        return response()->json($payment->load('invoice'), 201);
    }

    /**
     * Show a single payment.
     * GET /api/payments/{id}
     */
    public function show(int $id): JsonResponse
    {
        return response()->json(Payment::with('invoice')->findOrFail($id));
    }

    /**
     * Delete a payment (reversal) and recompute invoice status.
     * DELETE /api/payments/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $payment = Payment::findOrFail($id);
        $invoice = Invoice::findOrFail($payment->invoice_id);

        $payment->delete();

        // Recompute invoice after reversal
        $totalPaid = Payment::where('invoice_id', $invoice->id)->sum('amount');
        $invoice->update(['amount_paid' => $totalPaid]);
        $invoice->recomputeStatus();

        return response()->json(['message' => 'Payment reversed.']);
    }
}
