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
    ];

    protected function casts(): array
    {
        return [
            'year'       => 'integer',
            'daily_rate' => 'decimal:2',
        ];
    }

    public function maintenanceLogs(): HasMany
    {
        return $this->hasMany(MaintenanceLog::class);
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }
}
