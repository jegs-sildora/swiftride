<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'customer_id',
        'vehicle_id',
        'start_date',
        'end_date',
        'status',
        'daily_rate',
        'total_cost',
        'notes',
        'confirmed_by',
        'confirmed_at',
        'pickup_location',
        'return_location',
        'security_deposit_amount',
        'security_deposit_status',
    ];

    protected $casts = [
        'start_date'              => 'date',
        'end_date'                => 'date',
        'daily_rate'              => 'decimal:2',
        'total_cost'              => 'decimal:2',
        'confirmed_at'            => 'datetime',
        'security_deposit_amount' => 'decimal:2',
    ];

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class)->orderBy('event_time');
    }

    public function bookingAddons(): HasMany
    {
        return $this->hasMany(BookingAddon::class);
    }

    /**
     * Compute total cost from daily_rate × number of days.
     */
    public function computeTotalCost(): float
    {
        $days = $this->start_date->diffInDays($this->end_date);
        return round((float) $this->daily_rate * max($days, 1), 2);
    }
}
