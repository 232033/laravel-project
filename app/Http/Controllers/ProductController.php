<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    public function show(Request $request)
    {
        return view('product');
    }

    public function index(Request $request)
    {
        $query = Product::where('available', true);
        
        // البحث
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('desc', 'like', "%{$search}%");
            });
        }
        
        $products = $query->orderBy('created_at', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'products' => $products
        ]);
    }
}
