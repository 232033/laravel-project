<?php

use App\Http\Controllers\HomeController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AdminController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/cart', [CartController::class, 'index'])->name('cart');
Route::get('/product', [ProductController::class, 'show'])->name('product.show');

// API Routes
Route::get('/api/products', [ProductController::class, 'index'])->name('api.products');
Route::get('/api/banners', [\App\Http\Controllers\BannerController::class, 'index'])->name('api.banners');

// Admin Routes
Route::get('/admin', [AdminController::class, 'index'])->name('admin');
Route::post('/admin/login', [AdminController::class, 'login'])->name('admin.login');
Route::post('/admin/logout', [AdminController::class, 'logout'])->middleware('auth')->name('admin.logout');
Route::post('/admin/upload-image', [AdminController::class, 'uploadImage'])->middleware(['auth', 'admin'])->name('admin.upload.image');
Route::post('/admin/products', [AdminController::class, 'saveProduct'])->middleware('admin')->name('admin.products.save');
Route::get('/admin/products', [AdminController::class, 'getProducts'])->middleware('admin')->name('admin.products.get');
Route::delete('/admin/products/{id}', [AdminController::class, 'deleteProduct'])->middleware('admin')->name('admin.products.delete');
Route::post('/admin/banners', [AdminController::class, 'saveBanner'])->middleware('admin')->name('admin.banners.save');
Route::get('/admin/banners', [AdminController::class, 'getBanners'])->middleware('admin')->name('admin.banners.get');
Route::delete('/admin/banners/{id}', [AdminController::class, 'deleteBanner'])->middleware('admin')->name('admin.banners.delete');
