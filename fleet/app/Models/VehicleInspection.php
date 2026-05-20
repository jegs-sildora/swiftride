<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleInspection extends Model
{
    protected $fillable = [
        'vehicle_id',
        'booking_id',
        'inspection_type',
        'odometer_reading',
        'fuel_level_percent',
        'body_damage_notes',
        'interior_clean_status',
        'safety_check_passed',
        'inspector_id',
    ];

    protected function casts(): array
    {
        return [
            'odometer_reading'    => 'integer',
            'fuel_level_percent'  => 'decimal:2',
            'safety_check_passed' => 'boolean',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
