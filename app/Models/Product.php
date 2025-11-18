<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'price',
        'old_price',
        'image',
        'desc',
        'instant',
        'wa_number',
        'available',
        'stock',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'old_price' => 'decimal:2',
        'instant' => 'boolean',
        'available' => 'boolean',
        'stock' => 'integer',
    ];
}
