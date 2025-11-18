# TRIXA - Laravel Version

تم تحويل المشروع من HTML/JS/CSS إلى Laravel بنجاح.

## المتطلبات

- PHP >= 8.1
- Composer
- SQLite (أو MySQL/PostgreSQL)

## التثبيت

1. تثبيت التبعيات:
```bash
composer install
```

2. نسخ ملف البيئة:
```bash
cp .env.example .env
```

3. إنشاء مفتاح التطبيق:
```bash
php artisan key:generate
```

4. إنشاء قاعدة البيانات (SQLite):
```bash
touch database/database.sqlite
```

5. تشغيل الخادم:
```bash
php artisan serve
```

المشروع سيكون متاحاً على: `http://localhost:8000`

## البنية

- **Controllers**: `app/Http/Controllers/`
  - `HomeController.php` - الصفحة الرئيسية
  - `CartController.php` - صفحة السلة
  - `ProductController.php` - صفحة المنتج

- **Views**: `resources/views/`
  - `layouts/app.blade.php` - القالب الأساسي
  - `home.blade.php` - الصفحة الرئيسية
  - `cart.blade.php` - صفحة السلة
  - `product.blade.php` - صفحة المنتج

- **Assets**: `public/`
  - `css/styles.css` - ملف التنسيقات
  - `js/` - ملفات JavaScript
  - `assets/` - الصور والملفات الثابتة

- **Routes**: `routes/web.php`

## الميزات المحفوظة

✅ جميع الوظائف الأصلية محفوظة:
- عرض المنتجات
- السلة (Cart)
- البحث
- تحويل العملات
- السلايدر
- القائمة الجانبية
- واتساب للتواصل
- Firebase integration (إن كان موجوداً)

## ملاحظات

- الملفات الأصلية (HTML/JS/CSS) موجودة في الجذر ويمكنك الرجوع إليها
- جميع المسارات تم تحديثها لتعمل مع Laravel
- Firebase config يجب أن يكون في `public/js/firebase-config.js`

## التطوير المستقبلي

يمكنك إضافة:
- قاعدة بيانات للمنتجات
- نظام إدارة (Admin Panel)
- نظام دفع إلكتروني
- API endpoints

