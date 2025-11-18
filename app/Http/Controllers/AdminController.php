<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Product;
use App\Models\User;
use App\Models\Banner;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth')->except(['index', 'login']);
        $this->middleware('admin')->except(['index', 'login']);
    }

    public function index()
    {
        // إذا كان مسجل دخول كأدمن، أعد التوجيه للداشبورد
        if (Auth::check() && Auth::user()->is_admin) {
            return view('admin', ['loggedIn' => true]);
        }
        
        return view('admin', ['loggedIn' => false]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // البحث عن المستخدم بالـ username
        $user = User::where('username', $request->username)->first();

        if ($user && Hash::check($request->password, $user->password)) {
            if (!$user->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'ليس لديك صلاحيات الأدمن'
                ], 403);
            }

            // تسجيل الدخول باستخدام Laravel Auth
            Auth::login($user, $request->has('remember'));
            $request->session()->regenerate();
            
            return response()->json([
                'success' => true,
                'message' => 'تم تسجيل الدخول بنجاح'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'بيانات الدخول غير صحيحة'
        ], 401);
    }

    public function logout()
    {
        Auth::logout();
        return response()->json(['success' => true, 'message' => 'تم تسجيل الخروج']);
    }

    public function uploadImage(Request $request)
    {
        // التحقق من تسجيل الدخول
        if (!Auth::check() || !Auth::user()->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'يجب تسجيل الدخول كأدمن'
            ], 401);
        }

        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'صيغة الملف غير مدعومة أو حجمه كبير جداً'
            ], 422);
        }

        try {
            $image = $request->file('image');
            
            if (!$image || !$image->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'ملف الصورة غير صالح'
                ], 422);
            }
            
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            
            // التأكد من وجود المجلد
            if (!Storage::disk('public')->exists('images')) {
                Storage::disk('public')->makeDirectory('images');
            }
            
            // حفظ الصورة في public/storage/images
            $path = $image->storeAs('images', $filename, 'public');
            
            if (!$path) {
                return response()->json([
                    'success' => false,
                    'message' => 'فشل حفظ الصورة'
                ], 500);
            }
            
            // إرجاع رابط الصورة
            // $path يكون مثل: images/filename.jpg
            // استخدام asset() مباشرة مع مسار storage
            $fullUrl = asset('storage/' . $path);
            
            // التأكد من أن الرابط يستخدم نفس الـ domain والـ port من الطلب
            $request = request();
            $scheme = $request->getScheme();
            $host = $request->getHost();
            $port = $request->getPort();
            
            // بناء الرابط الكامل مع الـ port إذا كان موجود
            if ($port && $port != 80 && $port != 443) {
                $baseUrl = $scheme . '://' . $host . ':' . $port;
            } else {
                $baseUrl = $scheme . '://' . $host;
            }
            
            $fullUrl = $baseUrl . '/storage/' . $path;
            
            return response()->json([
                'success' => true,
                'url' => $fullUrl,
                'path' => $path
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل رفع الصورة: ' . $e->getMessage()
            ], 500);
        }
    }

    public function saveProduct(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'old_price' => 'nullable|numeric|min:0',
            'oldPrice' => 'nullable|numeric|min:0',
            'image' => 'nullable|string',
            'desc' => 'nullable|string',
            'instant' => 'boolean',
            'wa_number' => 'nullable|string',
            'waNumber' => 'nullable|string',
        ]);

        try {
            $data = [
                'title' => $request->title,
                'price' => $request->price,
                'old_price' => $request->old_price ?? $request->oldPrice,
                'image' => $request->image,
                'desc' => $request->desc,
                'instant' => $request->has('instant') ? (bool)$request->instant : false,
                'wa_number' => $request->wa_number ?? $request->waNumber,
                'available' => true,
            ];

            if ($request->has('id') && $request->id) {
                $product = Product::findOrFail($request->id);
                $product->update($data);
                $message = 'تم تحديث المنتج بنجاح';
            } else {
                $product = Product::create($data);
                $message = 'تم إضافة المنتج بنجاح';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'product' => $product
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل حفظ المنتج: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getProducts()
    {
        try {
            $products = Product::orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'products' => $products
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل جلب المنتجات: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteProduct($id)
    {
        try {
            $product = Product::findOrFail($id);
            $product->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'تم حذف المنتج بنجاح'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل حذف المنتج: ' . $e->getMessage()
            ], 500);
        }
    }

    public function saveBanner(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'text' => 'nullable|string',
            'cta_text' => 'nullable|string',
            'cta_link' => 'nullable|string',
            'bg' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        try {
            $data = [
                'title' => $request->title,
                'text' => $request->text,
                'cta_text' => $request->cta_text,
                'cta_link' => $request->cta_link ?? '#products',
                'bg' => $request->bg ?? '#3f2b82',
                'image' => $request->image,
            ];

            if ($request->has('id') && $request->id) {
                $banner = Banner::findOrFail($request->id);
                $banner->update($data);
                $message = 'تم تحديث الإعلان بنجاح';
            } else {
                $banner = Banner::create($data);
                $message = 'تم إضافة الإعلان بنجاح';
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'banner' => $banner
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل حفظ الإعلان: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getBanners()
    {
        try {
            $banners = Banner::orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'banners' => $banners
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل جلب الإعلانات: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteBanner($id)
    {
        try {
            $banner = Banner::findOrFail($id);
            $banner->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'تم حذف الإعلان بنجاح'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل حذف الإعلان: ' . $e->getMessage()
            ], 500);
        }
    }
}
