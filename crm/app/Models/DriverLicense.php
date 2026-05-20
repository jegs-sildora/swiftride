<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverLicense extends Model
{
    protected $fillable = [
        'customer_id',
        'license_number',
        'expiry_date',
        'issuing_authority',
        'license_class',
        'verified',
        'verified_at',
    ];

    protected $casts = [
        'expiry_date'  => 'date',
        'verified'     => 'boolean',
        'verified_at'  => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function isExpired(): bool
    {
        return $this->expiry_date->isPast();
    }
}
