<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['success' => false, 'message' => 'يجب تسجيل الدخول'], 401);
            }
            return redirect()->route('admin')->with('error', 'يجب تسجيل الدخول');
        }

        if (!Auth::user()->is_admin) {
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json(['success' => false, 'message' => 'ليس لديك صلاحيات الأدمن'], 403);
            }
            return redirect()->route('admin')->with('error', 'ليس لديك صلاحيات الأدمن');
        }

        return $next($request);
    }
}

