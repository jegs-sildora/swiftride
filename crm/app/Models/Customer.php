<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'billing_address',
        'city',
        'state',
        'postal_code',
        'country',
        'status',
        'loyalty_tier',
        'loyalty_points',
        'government_id_verified',
    ];

    protected function casts(): array
    {
        return [
            'loyalty_points'         => 'integer',
            'government_id_verified' => 'boolean',
        ];
    }

    public function driverLicenses(): HasMany
    {
        return $this->hasMany(DriverLicense::class);
    }

    public function customerDocuments(): HasMany
    {
        return $this->hasMany(CustomerDocument::class);
    }

    /**
     * Get discount percentage based on loyalty tier.
     */
    public function getDiscountPercentage(): float
    {
        $tier = strtoupper($this->loyalty_tier);
        if ($tier === 'SILVER') {
            return 0.05;
        } elseif ($tier === 'GOLD') {
            return 0.10;
        }
        return 0.00;
    }

    /**
     * Returns true if the customer is active and has a valid (non-expired, verified) driver's license.
     * Called by the Booking Service via GET /api/customers/{id}/verify.
     */
    public function isEligible(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        return $this->driverLicenses()
            ->where('verified', true)
            ->where('expiry_date', '>', now())
            ->exists();
    }
}
