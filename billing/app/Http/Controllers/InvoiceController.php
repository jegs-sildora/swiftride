<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    /**
     * List all invoices.
     * GET /api/invoices?customer_id=1&status=unpaid
     */
    public function index(Request $request): JsonResponse
    {
        $query = Invoice::with(['payments', 'invoiceLineItems', 'refunds']);

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->integer('customer_id'));
        }
        if ($request->filled('booking_id')) {
            $query->where('booking_id', $request->integer('booking_id'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json($query->orderByDesc('created_at')->paginate(20));
    }

    /**
     * Create a new invoice (typically triggered when a booking is confirmed).
     * POST /api/invoices
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_id'              => 'required|integer',
            'customer_id'             => 'required|integer',
            'amount'                  => 'required|numeric|min:0.01',
            'due_date'                => 'required|date',
            'notes'                   => 'sometimes|string|max:1000',
            'line_items'              => 'sometimes|array',
            'line_items.*.description'=> 'required|string|max:255',
            'line_items.*.unit_price' => 'required|numeric|min:0',
            'line_items.*.quantity'   => 'required|integer|min:1',
            'line_items.*.subtotal'   => 'required|numeric|min:0',
        ]);

        $invoice = Invoice::create([
            'booking_id'  => $validated['booking_id'],
            'customer_id' => $validated['customer_id'],
            'amount'      => $validated['amount'],
            'due_date'    => $validated['due_date'],
            'notes'       => $validated['notes'] ?? null,
        ]);

        if (!empty($validated['line_items'])) {
            foreach ($validated['line_items'] as $item) {
                // Calculate VAT inclusive extraction (12% standard PH VAT)
                $subtotal = (float)$item['subtotal'];
                $net = $subtotal / 1.12;
                $vatAmount = round($subtotal - $net, 2);

                $invoice->invoiceLineItems()->create([
                    'description' => $item['description'],
                    'unit_price'  => (float)$item['unit_price'],
                    'quantity'    => (int)$item['quantity'],
                    'vat_amount'  => $vatAmount,
                    'subtotal'    => $subtotal,
                ]);
            }
        } else {
            // Default fallback line item if none is supplied
            $subtotal = (float)$validated['amount'];
            $net = $subtotal / 1.12;
            $vatAmount = round($subtotal - $net, 2);

            $invoice->invoiceLineItems()->create([
                'description' => $validated['notes'] ?? "Standard Car Rental Fee",
                'unit_price'  => $validated['amount'],
                'quantity'    => 1,
                'vat_amount'  => $vatAmount,
                'subtotal'    => $subtotal,
            ]);
        }

        return response()->json($invoice->load(['invoiceLineItems', 'refunds']), 201);
    }

    /**
     * Show a single invoice with its payments.
     * GET /api/invoices/{id}
     */
    public function show(int $id): JsonResponse
    {
        return response()->json(Invoice::with(['payments', 'invoiceLineItems', 'refunds'])->findOrFail($id));
    }

    /**
     * Update invoice notes or due date (status is computed from payments).
     * PUT /api/invoices/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $invoice = Invoice::findOrFail($id);

        $validated = $request->validate([
            'due_date' => 'sometimes|date',
            'notes'    => 'sometimes|string|max:1000',
        ]);

        $invoice->update($validated);
        return response()->json($invoice->load(['payments', 'invoiceLineItems', 'refunds']));
    }

    /**
     * Void an invoice.
     * DELETE /api/invoices/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $invoice = Invoice::findOrFail($id);
        $invoice->update(['status' => 'void']);
        $invoice->delete();
        return response()->json(['message' => 'Invoice voided.']);
    }

    /**
     * Aggregate daily/weekly/monthly revenue totals.
     * GET /api/reports/revenue?period=monthly&year=2025
     */
    public function revenue(Request $request): JsonResponse
    {
        $request->validate([
            'period' => 'sometimes|in:daily,weekly,monthly',
            'year'   => 'sometimes|integer|min:2000|max:2100',
        ]);

        $period = $request->get('period', 'monthly');
        $year   = $request->integer('year', now()->year);

        $baseQuery = Invoice::where('status', 'paid')
            ->whereYear('paid_at', $year);

        if ($period === 'daily') {
            $data = $baseQuery
                ->selectRaw('DATE(paid_at) as period, SUM(amount_paid) as revenue, COUNT(*) as invoice_count')
                ->groupByRaw('DATE(paid_at)')
                ->orderByRaw('DATE(paid_at)')
                ->get();
        } elseif ($period === 'weekly') {
            $data = $baseQuery
                ->selectRaw('EXTRACT(WEEK FROM paid_at)::int as period, SUM(amount_paid) as revenue, COUNT(*) as invoice_count')
                ->groupByRaw('EXTRACT(WEEK FROM paid_at)')
                ->orderByRaw('EXTRACT(WEEK FROM paid_at)')
                ->get();
        } else {
            $data = $baseQuery
                ->selectRaw('EXTRACT(MONTH FROM paid_at)::int as period, SUM(amount_paid) as revenue, COUNT(*) as invoice_count')
                ->groupByRaw('EXTRACT(MONTH FROM paid_at)')
                ->orderByRaw('EXTRACT(MONTH FROM paid_at)')
                ->get();
        }

        return response()->json([
            'year'   => $year,
            'period' => $period,
            'data'   => $data,
            'total'  => $data->sum('revenue'),
        ]);
    }

    /**
     * Get invoice summary for a customer.
     * GET /api/invoices/summary?customer_id=1
     */
    public function summary(Request $request): JsonResponse
    {
        $request->validate(['customer_id' => 'required|integer']);

        $invoices = Invoice::where('customer_id', $request->integer('customer_id'))->get();

        return response()->json([
            'total_invoiced' => $invoices->sum('amount'),
            'total_paid'     => $invoices->sum('amount_paid'),
            'outstanding'    => $invoices->whereIn('status', ['unpaid', 'partial'])->sum(
                fn($i) => (float) $i->amount - (float) $i->amount_paid
            ),
            'invoice_count'  => $invoices->count(),
        ]);
    }
}
