<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="X-CSRF-TOKEN" content="{{ csrf_token() }}">
    <title>@yield('title', 'TRIXA - متجر التطبيقات')</title>
    <meta name="description" content="TRIXA متجر تطبيقات وخدمات رقمية بعروض قوية وخصومات حتى 60%." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}" />
    @stack('styles')
  </head>
  <body>
    @yield('content')

    <script src="{{ asset('js/products.js') }}"></script>
    @stack('scripts')
  </body>
</html>

