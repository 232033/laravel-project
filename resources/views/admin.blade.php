@extends('layouts.app')

@section('title', 'لوحة التحكم - TRIXA')

@push('styles')
<style>
  body{font-family:'Cairo',system-ui,sans-serif}
  .wrap{max-width:980px;margin:0 auto;padding:16px}
  .card{background:#15122a;border:1px solid #2a2550;border-radius:16px;padding:16px}
  .field{display:flex;flex-direction:column;gap:6px;margin-bottom:10px}
  .input, .select, textarea{background:#261f47;color:#fff;border:1px solid #3a3563;border-radius:10px;padding:10px}
  textarea{min-height:90px}
  .actions{display:flex;gap:8px;flex-wrap:wrap}
  .btn{cursor:pointer}
  .btn-danger{background:#ff4d4f;color:#fff;border:0;border-radius:10px;padding:8px 12px}
  .table{width:100%;border-collapse:separate;border-spacing:0 8px}
  .table tr{background:#1b1730}
  .table td,.table th{padding:10px}
  .top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
  .muted{color:#bdb9d8}
  .hidden{display:none}
  .badge{background:#2a2550;color:#cfcaf3;border:1px solid #3a3563;border-radius:999px;padding:2px 8px;font-size:12px}
  .grid2{display:grid;grid-template-columns:1fr;gap:12px}
  @media(min-width:900px){.grid2{grid-template-columns:1fr 1fr}}
  .upload-area{border:2px dashed #3a3563;border-radius:10px;padding:20px;text-align:center;cursor:pointer;transition:all 0.3s}
  .upload-area:hover{border-color:#6c56cf;background:#1b1730}
  .upload-area.dragover{border-color:#6c56cf;background:#1b1730}
</style>
@endpush

@section('content')
<div class="wrap">
  <div class="top">
    <h1 style="margin:0">لوحة التحكم - TRIXA</h1>
    <div class="actions">
      <a href="{{ route('home') }}" class="btn btn-secondary">العودة للموقع</a>
      <button id="logout" class="btn btn-secondary {{ !$loggedIn ? 'hidden' : '' }}">تسجيل خروج</button>
    </div>
  </div>

  <section id="loginCard" class="card {{ $loggedIn ? 'hidden' : '' }}">
    <h2 style="margin-top:0">تسجيل الدخول</h2>
    <div class="grid2">
      <div class="field">
        <label>اسم المستخدم</label>
        <input id="user" class="input" placeholder="alosh" />
      </div>
      <div class="field">
        <label>كلمة المرور</label>
        <input id="pass" class="input" type="password" placeholder="********" />
      </div>
    </div>
    <div class="actions">
      <button id="loginBtn" class="btn btn-primary">دخول</button>
      <span id="loginMsg" class="muted"></span>
    </div>
  </section>

  <section id="dash" class="{{ $loggedIn ? '' : 'hidden' }}">
    <div class="card" style="margin-bottom:12px">
      <h2 style="margin:0 0 10px">إضافة/تعديل منتج</h2>
      <div class="grid2">
        <div class="field"><label>العنوان</label><input id="pTitle" class="input"/></div>
        <div class="field"><label>السعر</label><input id="pPrice" class="input" type="number" step="0.01"/></div>
        <div class="field"><label>السعر قبل الخصم</label><input id="pOld" class="input" type="number" step="0.01"/></div>
        <div class="field">
          <label>صورة المنتج</label>
          <div class="upload-area" id="uploadArea">
            <p class="muted">اسحب الصورة هنا أو اضغط للاختيار</p>
            <input id="pFile" type="file" accept="image/*" style="display:none" />
            <button type="button" id="selectImageBtn" class="btn btn-secondary" style="margin-top:10px">اختر صورة</button>
          </div>
          <div id="pUploadStatus" class="muted" style="margin-top:8px"></div>
          <img id="pPreview" alt="معاينة" style="margin-top:8px;max-width:200px;border-radius:8px;display:none" />
          <input id="pImg" class="input" style="margin-top:8px" placeholder="أو أدخل رابط الصورة مباشرة"/>
        </div>
        <div class="field"><label>رقم واتساب للمنتج (بدون +)</label><input id="pWa" class="input" placeholder="مثال: 9725XXXXXXXX"/></div>
        <div class="field">
          <label>وصف</label>
          <textarea id="pDesc" class="input"></textarea>
        </div>
        <div class="field">
          <label>تفعيل فوري؟</label>
          <select id="pInstant" class="select">
            <option value="0">لا</option>
            <option value="1">نعم</option>
          </select>
        </div>
      </div>
      <div class="actions">
        <button id="saveProduct" class="btn btn-primary">حفظ المنتج</button>
        <button id="clearForm" class="btn btn-secondary">مسح الحقول</button>
      </div>
    </div>

    <div class="card" style="margin-bottom:12px">
      <h2 style="margin:0 0 10px">إدارة السلايدر (الإعلانات)</h2>
      <div class="grid2">
        <div class="field"><label>العنوان</label><input id="bTitle" class="input"/></div>
        <div class="field"><label>نص مختصر</label><input id="bText" class="input"/></div>
        <div class="field"><label>نص الزر</label><input id="bCtaText" class="input" placeholder="تسوق الآن"/></div>
        <div class="field"><label>رابط الزر</label><input id="bCtaLink" class="input" placeholder="#products"/></div>
        <div class="field"><label>لون الخلفية</label><input id="bBg" class="input" placeholder="#3f2b82"/></div>
        <div class="field">
          <label>صورة</label>
          <div class="upload-area" id="bannerUploadArea">
            <p class="muted">اسحب الصورة هنا أو اضغط للاختيار</p>
            <input id="bFile" type="file" accept="image/*" style="display:none" />
            <button type="button" id="selectBannerBtn" class="btn btn-secondary" style="margin-top:10px">اختر صورة</button>
          </div>
          <div id="bStatus" class="muted" style="margin-top:8px"></div>
          <img id="bPreview" alt="معاينة" style="margin-top:8px;max-width:200px;border-radius:8px;display:none" />
          <input id="bImg" class="input" style="margin-top:8px" placeholder="أو أدخل رابط الصورة مباشرة"/>
        </div>
      </div>
      <div class="actions">
        <button id="addBanner" class="btn btn-primary">إضافة إعلان</button>
        <button id="updateBanner" class="btn btn-secondary hidden">تحديث الإعلان</button>
        <button id="cancelBannerEdit" class="btn btn-secondary hidden">إلغاء التعديل</button>
      </div>
      <div style="margin-top:12px">
        <h3 style="margin:0 0 8px;font-size:16px">الإعلانات الحالية</h3>
        <div id="bannersList" class="grid2"></div>
      </div>
    </div>

    <div class="card">
      <div class="top">
        <h2 style="margin:0">المنتجات</h2>
        <button id="refreshProducts" class="btn btn-secondary">تحديث القائمة</button>
      </div>
      <table class="table">
        <thead>
          <tr><th>العنوان</th><th>السعر</th><th>قبل</th><th>فوري</th><th>عمليات</th></tr>
        </thead>
        <tbody id="rows"></tbody>
      </table>
    </div>
  </section>
</div>
@endsection

@push('scripts')
<script>
const API_BASE = '{{ url("/admin") }}';
// Get CSRF token from meta tag or generate new one
let CSRF_TOKEN = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (!CSRF_TOKEN) {
  CSRF_TOKEN = '{{ csrf_token() }}';
}
let currentEditId = null;

// Function to refresh CSRF token
async function refreshCsrfToken() {
  try {
    const response = await fetch('/admin', {
      method: 'GET',
      credentials: 'same-origin'
    });
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newToken = doc.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (newToken) {
      CSRF_TOKEN = newToken;
      document.querySelector('meta[name="csrf-token"]')?.setAttribute('content', newToken);
    }
  } catch (e) {
    console.warn('Failed to refresh CSRF token:', e);
  }
}

// Login
document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const username = document.getElementById('user').value;
  const password = document.getElementById('pass').value;
  const msgEl = document.getElementById('loginMsg');
  
  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': CSRF_TOKEN
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    
    if (data.success) {
      document.getElementById('loginCard').classList.add('hidden');
      document.getElementById('dash').classList.remove('hidden');
      document.getElementById('logout').classList.remove('hidden');
      msgEl.textContent = '';
      loadProducts();
    } else {
      msgEl.textContent = data.message || 'خطأ في تسجيل الدخول';
    }
  } catch (e) {
    msgEl.textContent = 'حدث خطأ: ' + e.message;
  }
});

// Logout
document.getElementById('logout')?.addEventListener('click', async () => {
  try {
    const res = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': CSRF_TOKEN
      }
    });
    
    if (res.ok) {
      location.reload();
    }
  } catch (e) {
    console.error(e);
  }
});

// Image Upload
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('pFile');
const selectBtn = document.getElementById('selectImageBtn');
const uploadStatus = document.getElementById('pUploadStatus');
const preview = document.getElementById('pPreview');
const imgInput = document.getElementById('pImg');

selectBtn?.addEventListener('click', () => fileInput.click());
uploadArea?.addEventListener('click', () => fileInput.click());

uploadArea?.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea?.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea?.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    fileInput.files = files;
    handleFileUpload(files[0]);
  }
});

fileInput?.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFileUpload(e.target.files[0]);
  }
});

async function handleFileUpload(file) {
  if (!file.type.startsWith('image/')) {
    uploadStatus.textContent = 'الرجاء اختيار ملف صورة';
    return;
  }

  uploadStatus.textContent = 'جاري رفع الصورة...';
  
  const formData = new FormData();
  formData.append('image', file);
  formData.append('_token', CSRF_TOKEN);

  try {
    const res = await fetch(`${API_BASE}/upload-image`, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': CSRF_TOKEN,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
      },
      body: formData,
      credentials: 'same-origin'
    });

    // التحقق من حالة الاستجابة أولاً
    if (!res.ok) {
      let errorText = '';
      try {
        errorText = await res.text();
        // Check if it's a CSRF token mismatch error
        if (res.status === 419 || errorText.includes('CSRF token mismatch') || errorText.includes('419')) {
          uploadStatus.textContent = 'انتهت صلاحية الجلسة، جاري التحديث...';
          await refreshCsrfToken();
          // Retry the upload
          setTimeout(() => {
            handleFileUpload(file);
          }, 500);
          return;
        }
        const errorData = JSON.parse(errorText);
        uploadStatus.textContent = errorData.message || 'فشل رفع الصورة';
      } catch {
        if (res.status === 419) {
          uploadStatus.textContent = 'انتهت صلاحية الجلسة، جاري التحديث...';
          await refreshCsrfToken();
          setTimeout(() => {
            handleFileUpload(file);
          }, 500);
          return;
        }
        uploadStatus.textContent = 'خطأ في رفع الصورة (كود: ' + res.status + ')';
        console.error('Error response:', errorText.substring(0, 200));
      }
      return;
    }

    // التحقق من نوع الاستجابة
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error('Non-JSON response:', text.substring(0, 200));
      uploadStatus.textContent = 'خطأ: استجابة غير صحيحة من السيرفر';
      return;
    }

    const data = await res.json();

    if (data.success) {
      uploadStatus.textContent = 'تم رفع الصورة بنجاح!';
      // التأكد من أن الرابط صحيح
      const imageUrl = data.url || data.path;
      preview.src = imageUrl;
      preview.style.display = 'block';
      imgInput.value = imageUrl;
      
      // إعادة تحميل الصورة للتأكد من ظهورها
      preview.onerror = function() {
        console.error('Failed to load image:', imageUrl);
        uploadStatus.textContent = 'تم رفع الصورة ولكن لا يمكن عرضها. الرابط: ' + imageUrl;
      };
    } else {
      uploadStatus.textContent = data.message || 'فشل رفع الصورة';
    }
  } catch (e) {
    uploadStatus.textContent = 'حدث خطأ: ' + e.message;
    console.error('Upload error:', e);
  }
}


// Load Products
async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE}/products`, {
      headers: {
        'X-CSRF-TOKEN': CSRF_TOKEN
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      renderProducts(data.products || []);
    }
  } catch (e) {
    console.error('Error loading products:', e);
  }
}

function renderProducts(products) {
  const rows = document.getElementById('rows');
  if (!rows) return;
  
  if (products.length === 0) {
    rows.innerHTML = '<tr><td colspan="5" class="muted" style="text-align:center">لا توجد منتجات</td></tr>';
    return;
  }
  
  rows.innerHTML = products.map(p => `
    <tr>
      <td>${p.title || ''}</td>
      <td>${p.price || 0}</td>
      <td>${p.old_price || ''}</td>
      <td>${p.instant ? '<span class="badge">نعم</span>' : 'لا'}</td>
      <td>
        <button class="btn btn-secondary" onclick="editProduct(${p.id})">تعديل</button>
        <button class="btn btn-danger" onclick="deleteProduct(${p.id})">حذف</button>
      </td>
    </tr>
  `).join('');
}

// Edit Product
async function editProduct(id) {
  try {
    const res = await fetch(`${API_BASE}/products`, {
      headers: {
        'X-CSRF-TOKEN': CSRF_TOKEN
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      const product = data.products.find(p => p.id === id);
      if (product) {
        currentEditId = product.id;
        document.getElementById('pTitle').value = product.title || '';
        document.getElementById('pPrice').value = product.price || '';
        document.getElementById('pOld').value = product.old_price || '';
        document.getElementById('pImg').value = product.image || '';
        document.getElementById('pDesc').value = product.desc || '';
        document.getElementById('pWa').value = product.wa_number || '';
        document.getElementById('pInstant').value = product.instant ? '1' : '0';
        
        if (product.image) {
          preview.src = product.image;
          preview.style.display = 'block';
        }
      }
    }
  } catch (e) {
    alert('خطأ في تحميل المنتج: ' + e.message);
  }
}

// Delete Product
async function deleteProduct(id) {
  if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
  
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-TOKEN': CSRF_TOKEN
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      loadProducts();
      alert('تم حذف المنتج بنجاح');
    } else {
      alert('فشل حذف المنتج: ' + data.message);
    }
  } catch (e) {
    alert('حدث خطأ: ' + e.message);
  }
}

// Save Product
document.getElementById('saveProduct')?.addEventListener('click', async () => {
  const product = {
    title: document.getElementById('pTitle').value,
    price: parseFloat(document.getElementById('pPrice').value) || 0,
    old_price: parseFloat(document.getElementById('pOld').value) || null,
    image: document.getElementById('pImg').value,
    desc: document.getElementById('pDesc').value,
    instant: document.getElementById('pInstant').value === '1',
    wa_number: document.getElementById('pWa').value
  };
  
  if (currentEditId) {
    product.id = currentEditId;
  }
  
  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': CSRF_TOKEN,
        'Accept': 'application/json'
      },
      body: JSON.stringify(product)
    });
    
    const data = await res.json();
    
    if (data.success) {
      alert('تم حفظ المنتج بنجاح!');
      clearForm();
      loadProducts();
    } else {
      alert('فشل حفظ المنتج: ' + data.message);
    }
  } catch (e) {
    alert('حدث خطأ: ' + e.message);
  }
});

// Clear form
function clearForm() {
  currentEditId = null;
  document.getElementById('pTitle').value = '';
  document.getElementById('pPrice').value = '';
  document.getElementById('pOld').value = '';
  document.getElementById('pImg').value = '';
  document.getElementById('pDesc').value = '';
  document.getElementById('pWa').value = '';
  document.getElementById('pInstant').value = '0';
  preview.style.display = 'none';
  uploadStatus.textContent = '';
  fileInput.value = '';
}

document.getElementById('clearForm')?.addEventListener('click', clearForm);
document.getElementById('refreshProducts')?.addEventListener('click', loadProducts);

// Banner Management
let currentBannerEditId = null;

// Banner image upload
const bannerUploadArea = document.getElementById('bannerUploadArea');
const bannerFileInput = document.getElementById('bFile');
const selectBannerBtn = document.getElementById('selectBannerBtn');
const bannerStatus = document.getElementById('bStatus');
const bannerPreview = document.getElementById('bPreview');
const bannerImgInput = document.getElementById('bImg');

selectBannerBtn?.addEventListener('click', () => bannerFileInput.click());
bannerUploadArea?.addEventListener('click', () => bannerFileInput.click());

bannerUploadArea?.addEventListener('dragover', (e) => {
  e.preventDefault();
  bannerUploadArea.classList.add('dragover');
});

bannerUploadArea?.addEventListener('dragleave', () => {
  bannerUploadArea.classList.remove('dragover');
});

bannerUploadArea?.addEventListener('drop', (e) => {
  e.preventDefault();
  bannerUploadArea.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    bannerFileInput.files = files;
    handleBannerUpload(files[0]);
  }
});

bannerFileInput?.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleBannerUpload(e.target.files[0]);
  }
});

async function handleBannerUpload(file) {
  if (!file.type.startsWith('image/')) {
    bannerStatus.textContent = 'الرجاء اختيار ملف صورة';
    return;
  }

  bannerStatus.textContent = 'جاري رفع الصورة...';
  
  const formData = new FormData();
  formData.append('image', file);
  formData.append('_token', CSRF_TOKEN);

  try {
    const res = await fetch(`${API_BASE}/upload-image`, {
      method: 'POST',
      headers: {
        'X-CSRF-TOKEN': CSRF_TOKEN,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
      },
      body: formData,
      credentials: 'same-origin'
    });

    if (!res.ok) {
      let errorText = '';
      try {
        errorText = await res.text();
        // Check if it's a CSRF token mismatch error
        if (res.status === 419 || errorText.includes('CSRF token mismatch') || errorText.includes('419')) {
          bannerStatus.textContent = 'انتهت صلاحية الجلسة، جاري التحديث...';
          await refreshCsrfToken();
          // Retry the upload
          setTimeout(() => {
            handleBannerUpload(file);
          }, 500);
          return;
        }
        const errorData = JSON.parse(errorText);
        bannerStatus.textContent = errorData.message || 'فشل رفع الصورة';
      } catch {
        if (res.status === 419) {
          bannerStatus.textContent = 'انتهت صلاحية الجلسة، جاري التحديث...';
          await refreshCsrfToken();
          setTimeout(() => {
            handleBannerUpload(file);
          }, 500);
          return;
        }
        bannerStatus.textContent = 'خطأ في رفع الصورة (كود: ' + res.status + ')';
      }
      return;
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error('Non-JSON response:', text.substring(0, 200));
      bannerStatus.textContent = 'خطأ: استجابة غير صحيحة من السيرفر';
      return;
    }

    const data = await res.json();

    if (data.success) {
      bannerStatus.textContent = 'تم رفع الصورة بنجاح!';
      // التأكد من أن الرابط صحيح
      const imageUrl = data.url || data.path;
      bannerPreview.src = imageUrl;
      bannerPreview.style.display = 'block';
      bannerImgInput.value = imageUrl;
      
      // إعادة تحميل الصورة للتأكد من ظهورها
      bannerPreview.onerror = function() {
        console.error('Failed to load image:', imageUrl);
        bannerStatus.textContent = 'تم رفع الصورة ولكن لا يمكن عرضها. الرابط: ' + imageUrl;
      };
    } else {
      bannerStatus.textContent = data.message || 'فشل رفع الصورة';
    }
  } catch (e) {
    bannerStatus.textContent = 'حدث خطأ: ' + e.message;
    console.error('Upload error:', e);
  }
}

// Load Banners
async function loadBanners() {
  try {
    const res = await fetch(`${API_BASE}/banners`, {
      headers: {
        'X-CSRF-TOKEN': CSRF_TOKEN,
        'Accept': 'application/json'
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      renderBanners(data.banners || []);
    }
  } catch (e) {
    console.error('Error loading banners:', e);
  }
}

function renderBanners(banners) {
  const list = document.getElementById('bannersList');
  if (!list) return;
  
  if (banners.length === 0) {
    list.innerHTML = '<div class="muted" style="text-align:center;grid-column:1/-1">لا توجد إعلانات</div>';
    return;
  }
  
  list.innerHTML = banners.map(b => `
    <div class="card" style="padding:10px">
      <div style="display:flex;gap:10px;align-items:center">
        <img src="${b.image||''}" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:8px;background:#2a2550" />
        <div style="flex:1">
          <div style="font-weight:700">${b.title||''}</div>
          <div class="muted" style="font-size:12px">${b.text||''}</div>
        </div>
        <div class="actions">
          <button class="btn btn-secondary" onclick="editBanner(${b.id})">تعديل</button>
          <button class="btn btn-danger" onclick="deleteBanner(${b.id})">حذف</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Edit Banner
async function editBanner(id) {
  try {
    const res = await fetch(`${API_BASE}/banners`, {
      headers: {
        'X-CSRF-TOKEN': CSRF_TOKEN,
        'Accept': 'application/json'
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      const banner = data.banners.find(b => b.id === id);
      if (banner) {
        currentBannerEditId = banner.id;
        document.getElementById('bTitle').value = banner.title || '';
        document.getElementById('bText').value = banner.text || '';
        document.getElementById('bCtaText').value = banner.cta_text || '';
        document.getElementById('bCtaLink').value = banner.cta_link || '';
        document.getElementById('bBg').value = banner.bg || '#3f2b82';
        document.getElementById('bImg').value = banner.image || '';
        
        if (banner.image) {
          bannerPreview.src = banner.image;
          bannerPreview.style.display = 'block';
        }
        
        document.getElementById('addBanner').classList.add('hidden');
        document.getElementById('updateBanner').classList.remove('hidden');
        document.getElementById('cancelBannerEdit').classList.remove('hidden');
      }
    }
  } catch (e) {
    alert('خطأ في تحميل الإعلان: ' + e.message);
  }
}

// Delete Banner
async function deleteBanner(id) {
  if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;
  
  try {
    const res = await fetch(`${API_BASE}/banners/${id}`, {
      method: 'DELETE',
      headers: {
        'X-CSRF-TOKEN': CSRF_TOKEN,
        'Accept': 'application/json'
      }
    });
    
    const data = await res.json();
    
    if (data.success) {
      loadBanners();
      alert('تم حذف الإعلان بنجاح');
    } else {
      alert('فشل حذف الإعلان: ' + data.message);
    }
  } catch (e) {
    alert('حدث خطأ: ' + e.message);
  }
}

// Save Banner
document.getElementById('addBanner')?.addEventListener('click', async () => {
  const banner = {
    title: document.getElementById('bTitle').value,
    text: document.getElementById('bText').value,
    cta_text: document.getElementById('bCtaText').value,
    cta_link: document.getElementById('bCtaLink').value || '#products',
    bg: document.getElementById('bBg').value || '#3f2b82',
    image: document.getElementById('bImg').value
  };
  
  try {
    const res = await fetch(`${API_BASE}/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': CSRF_TOKEN,
        'Accept': 'application/json'
      },
      body: JSON.stringify(banner)
    });
    
    const data = await res.json();
    
    if (data.success) {
      alert('تم إضافة الإعلان بنجاح!');
      clearBannerForm();
      loadBanners();
    } else {
      alert('فشل حفظ الإعلان: ' + data.message);
    }
  } catch (e) {
    alert('حدث خطأ: ' + e.message);
  }
});

// Update Banner
document.getElementById('updateBanner')?.addEventListener('click', async () => {
  if (!currentBannerEditId) return;
  
  const banner = {
    id: currentBannerEditId,
    title: document.getElementById('bTitle').value,
    text: document.getElementById('bText').value,
    cta_text: document.getElementById('bCtaText').value,
    cta_link: document.getElementById('bCtaLink').value || '#products',
    bg: document.getElementById('bBg').value || '#3f2b82',
    image: document.getElementById('bImg').value
  };
  
  try {
    const res = await fetch(`${API_BASE}/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': CSRF_TOKEN,
        'Accept': 'application/json'
      },
      body: JSON.stringify(banner)
    });
    
    const data = await res.json();
    
    if (data.success) {
      alert('تم تحديث الإعلان بنجاح!');
      clearBannerForm();
      loadBanners();
    } else {
      alert('فشل تحديث الإعلان: ' + data.message);
    }
  } catch (e) {
    alert('حدث خطأ: ' + e.message);
  }
});

// Cancel Banner Edit
document.getElementById('cancelBannerEdit')?.addEventListener('click', () => {
  clearBannerForm();
});

function clearBannerForm() {
  currentBannerEditId = null;
  document.getElementById('bTitle').value = '';
  document.getElementById('bText').value = '';
  document.getElementById('bCtaText').value = '';
  document.getElementById('bCtaLink').value = '';
  document.getElementById('bBg').value = '#3f2b82';
  document.getElementById('bImg').value = '';
  bannerPreview.style.display = 'none';
  bannerStatus.textContent = '';
  bannerFileInput.value = '';
  document.getElementById('addBanner').classList.remove('hidden');
  document.getElementById('updateBanner').classList.add('hidden');
  document.getElementById('cancelBannerEdit').classList.add('hidden');
}

// Load products and banners on page load if logged in
@if($loggedIn)
loadProducts();
loadBanners();
@endif
</script>
@endpush
