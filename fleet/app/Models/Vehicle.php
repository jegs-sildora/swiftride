<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'make',
        'model',
        'year',
        'plate_number',
        'color',
        'type',
        'status',
        'daily_rate',
        'description',
        'current_odometer',
        'fuel_tank_capacity_liters',
        'insurance_policy_number',
        'insurance_expiry_date',
    ];

    protected function casts(): array
    {
        return [
            'year'                      => 'integer',
            'daily_rate'                => 'decimal:2',
            'current_odometer'          => 'integer',
            'fuel_tank_capacity_liters' => 'decimal:2',
            'insurance_expiry_date'     => 'date',
        ];
    }

    public function maintenanceLogs(): HasMany
    {
        return $this->hasMany(MaintenanceLog::class);
    }

    public function vehicleInspections(): HasMany
    {
        return $this->hasMany(VehicleInspection::class);
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }
}
