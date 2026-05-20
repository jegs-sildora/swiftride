<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'booking_id',
        'customer_id',
        'amount',
        'amount_paid',
        'status',
        'due_date',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'amount'      => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'due_date'    => 'date',
        'paid_at'     => 'datetime',
    ];

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class)->orderBy('paid_at');
    }

    /**
     * Recompute status based on payments received.
     */
    public function recomputeStatus(): void
    {
        $paid = (float) $this->amount_paid;
        $due  = (float) $this->amount;

        if ($paid <= 0) {
            $status = 'unpaid';
            $paidAt = null;
        } elseif ($paid < $due) {
            $status = 'partial';
            $paidAt = null;
        } else {
            $status = 'paid';
            $paidAt = $this->paid_at ?? now();
        }

        $this->update(['status' => $status, 'paid_at' => $paidAt]);
    }
}
