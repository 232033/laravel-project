# TRIXA - متجر جوال (HTML/CSS/JS)

- Mobile-first RTL shop UI similar to provided reference screenshots.
- No build tools needed. Open `index.html` in your browser.

## ملفات
- `index.html` — الصفحة الرئيسية مع السلايدر والقائمة ومنتجات مختارة.
- `cart.html` — صفحة السلة المستقلة.
- `styles.css` — تصميم بنفسجي داكن وRTL ومتجاوب.
- `products.js` — بيانات منتجات أولية (يمكنك التعديل لاحقاً).
- `app.js` — عرض المنتجات، المفضلة، السلايدر، وتحويل العملة (SAR/USD) مع شارة عدد السلة.
- `cart.js` — إدارة السلة بالكامل (زيادة/نقص/حذف) وواتساب تشيك آوت.
- `assets/logo.svg` — لوجو مبدئي.

- ## تشغيل
- افتح الملف: `index.html` مباشرة. لعرض السلة زر "السلة" أو افتح `cart.html`.
- لتعديل رقم واتساب في الدفع: افتح `cart.js` وابحث عن `phone = '966500000000'`.

## تخصيص سريع
- الألوان في `:root` داخل `styles.css`.
- المنتجات في `products.js`.
- الشعارات والصور في مجلد `assets/`.

## ملاحظات
- السلة والمفضلة تحفظ في `localStorage` على الجهاز.
- لاحقاً يمكن ترقية المشروع إلى دفع إلكتروني ونشره على دومين.
