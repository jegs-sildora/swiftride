<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refund extends Model
{
    protected $fillable = [
        'invoice_id',
        'payment_id',
        'refund_amount',
        'refund_method',
        'reference_code',
        'processed_at',
        'notes',
    ];

    protected $casts = [
        'refund_amount' => 'decimal:2',
        'processed_at'  => 'datetime',
    ];

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
