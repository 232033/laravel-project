/* TRIXA Mobile Shop - Vanilla JS */
const state = {
  currency: localStorage.getItem('currency') || 'SAR',
  rate: { SAR: 1, USD: 0.27, ILS: 0.98 }, // approximate: per 1 SAR
  cart: [],
  search: localStorage.getItem('search') || '',
};
const symbols = { SAR: '﷼', USD: '$', ILS: '₪' };
const fmt = (v) => {
  const c = state.currency;
  const rate = state.rate[c] ?? 1;
  const val = c==='SAR' ? v : v*rate;
  return `${val.toFixed(2)} ${symbols[c]||''}`;
};

// Helper to build a safe key for element IDs
function keyOf(p){ return String(p?.id ?? p?.docId ?? p?.slug ?? p?.title ?? ''); }

// Info modal (reusable)
function openInfoModal(title, html){
  const m = document.getElementById('infoModal');
  if(!m) return;
  const t = document.getElementById('infoTitle');
  const b = document.getElementById('infoBody');
  if(t) t.textContent = title||'';
  if(b) b.innerHTML = html||'';
  m.classList.add('active');
}
function closeInfoModal(){
  const m = document.getElementById('infoModal'); if(!m) return;
  m.classList.remove('active');
}
document.addEventListener('click', (e)=>{
  const closeEl = e.target.closest('[data-close-info]');
  if(closeEl){ closeInfoModal(); }
});

// Delegated handler for quick links [data-info]
document.addEventListener('click', async (e)=>{
  const link = e.target.closest('a[data-info]');
  if(!link) return;
  e.preventDefault();
  const key = link.getAttribute('data-info');
  if(key==='about'){
    openInfoModal('من نحن', 'TRIXA متجر تطبيقات وخدمات رقمية نوفر أكواد وتفعيل فوري بأسعار منافسة.');
    return;
  }
  if(key==='privacy'){
    openInfoModal('سياسة الخصوصية', 'نحترم خصوصيتك ولا نشارك بياناتك مع أطراف ثالثة إلا لغرض إتمام الطلب وفق القوانين المعمول بها.');
    return;
  }
  if(key==='support'){
    const s = await loadSettingsFront();
    const num = (s.waNumber||'').replace(/[^\d]/g,'');
    const pretty = s.waNumber && s.waNumber.trim() ? (s.waNumber) : (num?('+'+num):'');
    const waUrl = num ? `https://wa.me/${num}?text=${encodeURIComponent('مرحباً، أحتاج دعم من TRIXA.')}` : '#';
    openInfoModal('الدعم', `
      <div style="display:grid;gap:10px">
        <a href="https://instagram.com/trixa.store" target="_blank" rel="noopener" class="btn btn-light">Instagram</a>
        <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-primary">WhatsApp ${pretty?`(${pretty})`:''}</a>
      </div>
    `);
    return;
  }
});

// (listeners wired after 'els' definition below)

const els = {
  grid: document.getElementById('productsGrid'),
  count: document.getElementById('cartCount'),
  currency: document.getElementById('currency'),
  dots: document.getElementById('sliderDots'),
  sliderTrack: document.getElementById('sliderTrack'),
  sliderDots: document.getElementById('sliderDots'),
  year: document.getElementById('year'),
  searchInput: document.getElementById('searchInput'),
  resetSearch: document.getElementById('resetSearch'),
  flag: document.getElementById('flag'),
  // Sidebar & extras
  btnMenu: document.getElementById('btnMenu'),
  sideDrawer: document.getElementById('sideDrawer'),
  sideBackdrop: document.getElementById('sideBackdrop'),
  sideClose: document.getElementById('sideClose'),
  currencySide: document.getElementById('currencySide'),
  themeToggle: document.getElementById('themeToggle'),
  notifyBtn: document.getElementById('notifyBtn'),
  fabWhatsApp: document.getElementById('fabWhatsApp'),
  openRelated: document.getElementById('openRelated'),
  openSupport: document.getElementById('openSupport'),
};

// Init year (if present)
if(els.year){ els.year.textContent = new Date().getFullYear(); }

// Wire sidebar info buttons (now that els exists)
if(els.openRelated){
  els.openRelated.addEventListener('click', ()=>{
    openInfoModal('روابط ذات صلة', `
      <ul style="list-style:none;padding:0;margin:0;display:grid;gap:8px">
        <li><a href="#" class="link">من نحن</a></li>
        <li><a href="#" class="link">سياسة الخصوصية</a></li>
        <li><a href="#" class="link">الدعم</a></li>
      </ul>
    `);
  });
}
if(els.openSupport){
  els.openSupport.addEventListener('click', async ()=>{
    const s = await loadSettingsFront();
    const num = (s.waNumber||'').replace(/[^\d]/g,'');
    const pretty = s.waNumber && s.waNumber.trim() ? (s.waNumber) : (num?('+'+num):'');
    const waUrl = num ? `https://wa.me/${num}?text=${encodeURIComponent('مرحباً، أحتاج دعم من TRIXA.')}` : '#';
    openInfoModal('الدعم', `
      <div style="display:grid;gap:10px">
        <a href="https://instagram.com/trixa.store" target="_blank" rel="noopener" class="btn btn-light">Instagram</a>
        <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-primary">WhatsApp ${pretty?`(${pretty})`:''}</a>
      </div>
    `);
  });
}

// Real-time subscription state
let __liveItems = [];
let __banners = [];
let __settings = null; // store settings cache

// Simple skeleton placeholders while loading
function renderSkeletons(count=8){
  if(!els.grid) return;
  const sk = Array.from({length:count}).map(()=>`
    <article class="card skeleton-card" aria-hidden="true">
      <div class="card__img skeleton-img skel"></div>
      <div class="card__body">
        <div class="skeleton-row"><div class="skeleton-line skel" style="width:70%"></div></div>
        <div class="skeleton-row">
          <div class="skeleton-line skel" style="width:40%"></div>
          <div class="skeleton-line skel" style="width:30%"></div>
        </div>
        <div class="skeleton-btn skel"></div>
      </div>
    </article>
  `).join('');
  els.grid.innerHTML = sk;
}

// Load products
async function loadProducts(){
  // Show skeletons immediately while loading
  try{ if(els.grid){ renderSkeletons(8); } }catch(_){ }
  
  // 1) API endpoint
  let items = [];
  try {
    const res = await fetch('/api/products');
    if(res.ok){ 
      const data = await res.json();
      if(data.success && Array.isArray(data.products)) {
        items = data.products.map(p => ({
          id: p.id,
          docId: p.id,
          title: p.title,
          price: parseFloat(p.price),
          oldPrice: p.old_price ? parseFloat(p.old_price) : null,
          image: p.image,
          desc: p.desc,
          instant: p.instant,
          waNumber: p.wa_number || ''
        }));
      }
    }
  } catch(e){ 
    console.warn('API error:', e);
  }

  // 2) Local seed fallback
  if(!items.length){
    try {
      const data = await fetch('/js/products.js').then(r=>r.text());
      const sandbox = document.createElement('script');
      sandbox.textContent = data; document.head.appendChild(sandbox);
      items = window.PRODUCTS || [];
      try{
        const override = localStorage.getItem('PRODUCTS_OVERRIDE');
        if(override){ items = JSON.parse(override); }
      }catch(err){ console.warn('Bad PRODUCTS_OVERRIDE', err); }
    } catch(e) {
      console.warn('Failed to load products.js:', e);
    }
  }
  renderProducts(applyFilter(items));
}

function applyFilter(items){
  const q = (state.search || '').trim().toLowerCase();
  if(!q) return items;
  return items.filter(p =>
    (p.title && p.title.toLowerCase().includes(q)) ||
    (p.desc && p.desc.toLowerCase().includes(q))
  );
}

function renderProducts(items){
  if(!els.grid) return; // safely exit on pages without products grid
  if(!items || !items.length){
    const msg = 'لا توجد نتائج للعرض.';
    els.grid.innerHTML = `<div class=\"empty\" style=\"grid-column:1/-1;text-align:center;color:#bdb9d8;padding:24px 0\">${msg}</div>`;
  } else {
    els.grid.innerHTML = items.map(renderCard).join('');
  }
  // cache for product page fallback resolution
  try{ localStorage.setItem('PRODUCTS_CACHE', JSON.stringify(items)); }catch(_){ }
  // attach handlers
  items.forEach(p=>{
    const key = keyOf(p);
    document.getElementById(`add-${key}`)?.addEventListener('click',()=>addToCart(p));
    // save current product for details page instant render
    const a1 = document.getElementById(`link-img-${key}`);
    const a2 = document.getElementById(`link-title-${key}`);
    const openQuick = (e)=>{
      const hasModal = !!document.getElementById('productModal');
      // Always cache current product for fast detail page rendering
      try{ sessionStorage.setItem('CURRENT_PRODUCT', JSON.stringify(p)); }catch(_){ }
      if(hasModal){
        e.preventDefault();
        openProductModal(p);
      } // else: no preventDefault -> navigate to product.html normally
    };
    a1?.addEventListener('click', openQuick);
    a2?.addEventListener('click', openQuick);
  });
}

// (favorites feature removed)

function renderCard(p){
  const key = keyOf(p);
  const discount = p.oldPrice && p.oldPrice>p.price ? Math.round((1-p.price/p.oldPrice)*100) : 0;
  const q = new URLSearchParams({ id: String(p.docId||p.id), pid: String(p.id||''), slug: String(p.slug||'') });
  const sold = (p && ((p.stock===0) || p.outOfStock === true || p.available === false));
  const isNew = !!(p?.isNew || p?.new || (p?.createdAt && (Date.now() - Number(p.createdAt)) < (14*24*60*60*1000)));
  const best = !!(p?.best || p?.bestSeller || (Array.isArray(p?.tags) && p.tags.includes('best')));
  const btnAttrs = sold ? 'class="btn-cart" disabled aria-disabled="true"' : 'class="btn-cart"';
  const btnText = sold ? 'نفد' : 'أضف إلى السلة';
  const productUrl = '/product?' + q.toString();
  return `
  <article class="card" aria-label="${p.title}">
    <a id="link-img-${key}" class="card__img" href="${productUrl}" data-link data-id="${p.docId||p.id}">
      ${discount?`<span class="badge-discount">-${discount}%</span>`:''}
      ${sold?`<span class="badge-tag badge-sold">نفد</span>`:''}
      ${isNew?`<span class="badge-tag badge-new">جديد</span>`:''}
      ${best?`<span class="badge-tag badge-best">الأكثر مبيعاً</span>`:''}
      <img src="${p.image}" alt="${p.title}">
    </a>
    <div class="card__body">
      <a id="link-title-${key}" class="card__title" href="${productUrl}" data-link data-id="${p.docId||p.id}">${p.title}</a>
      <div class="price">
        ${p.oldPrice?`<span class="old">${fmt(p.oldPrice)}</span>`:''}
        <span class="new">${fmt(p.price)}</span>
      </div>
      <div class="actions">
        <button ${btnAttrs} id="add-${key}">${btnText}</button>
      </div>
    </div>
  </article>`;
}

function addToCart(p){
  const item = state.cart.find(i=>i.id===p.id);
  if(item) item.qty++;
  else state.cart.push({id:p.id,title:p.title,price:p.price,image:p.image,qty:1, wa:p.waNumber||''});
  saveCart();
}

function saveCart(){
  localStorage.setItem('cart', JSON.stringify(state.cart));
  renderCart();
}

function loadCart(){
  state.cart = JSON.parse(localStorage.getItem('cart')||'[]');
  renderCart();
}

function renderCart(){
  els.count.textContent = state.cart.reduce((s,i)=>s+i.qty,0);
}

// (favorites count removed)

window.incQty = (id)=>{ const it=state.cart.find(i=>i.id===id); if(it){it.qty++; saveCart();} };
window.decQty = (id)=>{ const it=state.cart.find(i=>i.id===id); if(it){ it.qty--; if(it.qty<=0) state.cart=state.cart.filter(x=>x.id!==id); saveCart(); } };

// (favorites toggle removed)

// Currency
if(els.currency){
  els.currency.value = state.currency;
  els.currency.addEventListener('change', (e)=>{ 
    state.currency = e.target.value; 
    localStorage.setItem('currency', state.currency);
    setFlag();
    if(els.currencySide) els.currencySide.value = state.currency;
    renderCart(); loadProducts();
  });
}

// Sidebar: currency duplicate
if(els.currencySide){
  els.currencySide.value = state.currency;
  els.currencySide.addEventListener('change', (e)=>{
    state.currency = e.target.value;
    localStorage.setItem('currency', state.currency);
    if(els.currency) els.currency.value = state.currency;
    setFlag(); renderCart(); loadProducts();
  });
}

// Search
if(els.searchInput){
  els.searchInput.value = state.search;
  let t;
  els.searchInput.addEventListener('input', (e)=>{
    clearTimeout(t);
    t = setTimeout(()=>{
      state.search = e.target.value;
      localStorage.setItem('search', state.search);
      loadProducts();
    }, 150);
  });
}
if(els.resetSearch){
  els.resetSearch.addEventListener('click', (e)=>{ e.preventDefault(); state.search=''; localStorage.setItem('search',''); if(els.searchInput) els.searchInput.value=''; loadProducts();});
}

// (favorites topbar removed)

// Slider dots
(function initSlider(){
  function wire(){
    if(!els.sliderTrack || !els.sliderDots) return;
    const track = els.sliderTrack;
    const slides = [...track.children];
    els.sliderDots.innerHTML = slides.map((_,i)=>`<button aria-label="انتقال إلى الشريحة ${i+1}"></button>`).join('');
    const dots = [...els.sliderDots.children];
    function setActive(){
      if(!slides.length) return;
      const idx = Math.round(track.scrollLeft / (slides[0].clientWidth+10));
      dots.forEach((d,i)=>d.classList.toggle('active', i===idx));
    }
    setActive();
    track.addEventListener('scroll', ()=>requestAnimationFrame(setActive));
    dots.forEach((d,i)=>d.addEventListener('click', ()=>{
      track.scrollTo({left:i*(slides[0].clientWidth+10), behavior:'smooth'});
    }));

    // Auto-advance every 3 seconds
    let timer = window.__sliderTimer;
    const step = ()=>{
      if(!slides.length) return;
      const w = (slides[0].clientWidth+10);
      const maxIdx = slides.length - 1;
      const cur = Math.round(track.scrollLeft / w);
      const next = (cur >= maxIdx) ? 0 : (cur + 1);
      track.scrollTo({left: next * w, behavior: 'smooth'});
    };
    const start = ()=>{ stop(); timer = window.__sliderTimer = setInterval(step, 3000); };
    const stop = ()=>{ if(timer){ clearInterval(timer); timer = window.__sliderTimer = null; } };

    // Pause on hover only for hover-capable devices
    const supportsHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
    if(supportsHover){
      track.addEventListener('mouseenter', stop);
      track.addEventListener('mouseleave', start);
    }
    // Pause when page hidden (add listener once)
    if(!window.__sliderVisHook){
      document.addEventListener('visibilitychange', ()=>{ document.hidden ? stop() : start(); });
      window.__sliderVisHook = true;
    }
    // Restart on resize (layout changes)
    let resizeT;
    window.addEventListener('resize', ()=>{ clearTimeout(resizeT); resizeT = setTimeout(()=>{ start(); }, 200); });

    // Start auto-play
    start();
  }
  window.__wireSlider = wire;
  wire();
})();

// Quick View Modal logic
function openProductModal(p){
  const modal = document.getElementById('productModal'); if(!modal) return;
  const mMedia = document.getElementById('mMedia');
  const mTitle = document.getElementById('mTitle');
  const mOld = document.getElementById('mOld');
  const mNew = document.getElementById('mNew');
  const mDesc = document.getElementById('mDesc');
  const mInst = document.getElementById('mInstant');
  const mAdd = document.getElementById('mAdd');
  // fill media as background for perfect cover within rounded frame
  const safeImg = (p && p.image) ? p.image : 'https://dummyimage.com/800x800/2a2550/ffffff&text=TRIXA';
  mMedia.classList.add('is-bg');
  mMedia.style.backgroundImage = `url('${safeImg.replace(/'/g, "%27")}')`;
  mMedia.innerHTML = '';
  mTitle.textContent = p.title||'';
  mNew.textContent = fmt(p.price||0);
  if(p.oldPrice && p.oldPrice>p.price){ mOld.textContent = fmt(p.oldPrice); mOld.hidden = false; } else { mOld.hidden = true; }
  mDesc.textContent = p.desc||'';
  mInst.hidden = !p.instant;
  // add handler
  mAdd.onclick = ()=>{ addToCart(p); };
  modal.classList.add('active');
  document.documentElement.style.overflow = 'hidden';
}
function closeProductModal(){
  const modal = document.getElementById('productModal'); if(!modal) return; modal.classList.remove('active');
  document.documentElement.style.overflow = '';
  // reset media
  const mMedia = document.getElementById('mMedia'); if(mMedia){ mMedia.style.backgroundImage=''; mMedia.classList.remove('is-bg'); mMedia.innerHTML=''; }
}
document.addEventListener('click', (e)=>{
  const target = e.target;
  if(target && target.matches('[data-close]')){ closeProductModal(); }
});
document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeProductModal(); });

// No checkout on index page; available in cart.html

// Start
function setFlag(){
  if(!els.flag) return;
  const map = { SAR: '🇸🇦', USD: '🇺🇸', ILS: '🇵🇸' };
  els.flag.textContent = map[state.currency] || '🇸🇦';
}
setFlag();
loadCart();
loadProducts();

// Sidebar drawer open/close
function openSide(){ if(els.sideDrawer){ els.sideDrawer.classList.add('active'); document.documentElement.style.overflow='hidden'; } }
function closeSide(){ if(els.sideDrawer){ els.sideDrawer.classList.remove('active'); document.documentElement.style.overflow=''; } }
if(els.btnMenu) els.btnMenu.addEventListener('click', openSide);
if(els.sideBackdrop) els.sideBackdrop.addEventListener('click', closeSide);
if(els.sideClose) els.sideClose.addEventListener('click', closeSide);

// Theme: force dark only, hide toggle
function applyTheme(){
  const root = document.documentElement;
  root.classList.remove('theme-light');
  try{ localStorage.setItem('THEME','dark'); }catch(_){ }
  if(els.themeToggle){ els.themeToggle.checked = false; }
}
applyTheme();
if(els.themeToggle){
  // Hide the toggle UI
  try{ els.themeToggle.closest('.field')?.setAttribute('hidden',''); }catch(_){ }
  els.themeToggle.addEventListener('change', ()=>{ applyTheme(); });
}

// Notifications subscribe (simple prompt + Firestore if available)
async function subscribeNotifications(){
  try{
    const contact = prompt('أدخل بريدك الإلكتروني أو رقمك للاشتراك بالعروض');
    if(!contact) return;
    if(window.db){
      try{
        await window.db.collection('subscribers').add({ contact, createdAt: Date.now() });
        showToast('تم الاشتراك بنجاح');
      }catch(e){
        const msg = String(e && (e.code||e.message)||'');
        if(msg.includes('permission-denied') || /insufficient permissions/i.test(msg)){
          localStorage.setItem('SUBSCRIBER_CONTACT', contact);
          showToast('تم حفظ اشتراكك محلياً');
        } else {
          showToast('تعذر الاشتراك حالياً');
          console.warn('subscribe error', e);
        }
      }
    } else {
      localStorage.setItem('SUBSCRIBER_CONTACT', contact);
      showToast('تم حفظ اشتراكك محلياً');
    }
  }catch(e){ showToast('تعذر الاشتراك'); console.warn(e); }
}
if(els.notifyBtn){ els.notifyBtn.addEventListener('click', subscribeNotifications); }

// Load store settings (waNumber)
async function loadSettingsFront(){
  if(__settings) return __settings;
  __settings = {};
  __settings.waNumber = localStorage.getItem('WA_NUMBER') || '';
  // Apply hardcoded default if still missing (user request)
  if(!__settings.waNumber){
    __settings.waNumber = '+972593093014';
    try{ localStorage.setItem('WA_NUMBER', __settings.waNumber); }catch(_){ }
  }
  // Expose number on FAB tooltip/title
  try{
    if(els.fabWhatsApp && __settings.waNumber){
      const pretty = __settings.waNumber.startsWith('+')? __settings.waNumber : ('+'+__settings.waNumber.replace(/[^\d+]/g,''));
      els.fabWhatsApp.title = `واتساب: ${pretty}`;
      els.fabWhatsApp.setAttribute('aria-label', `واتساب ${pretty}`);
    }
  }catch(_){ }
  return __settings;
}

function buildCartMessage(){
  if(!state.cart.length) return 'مرحباً، أحتاج دعم من TRIXA عبر واتساب بخصوص استفسار عام. شكراً لكم!';
  const lines = state.cart.map(i=>`- ${i.title} × ${i.qty} = ${fmt(i.price*i.qty)}`);
  const total = state.cart.reduce((s,i)=>s+i.price*i.qty,0);
  return `مرحباً، أريد إتمام الطلب:\n${lines.join('\n')}\nالإجمالي: ${fmt(total)}`;
}

async function openWhatsApp(){
  try{
    const s = await loadSettingsFront();
    const num = (s.waNumber||'').replace(/[^\d]/g,'');
    if(!num){ alert('رقم واتساب غير متاح حالياً'); return; }
    const msg = encodeURIComponent(buildCartMessage());
    const url = `https://wa.me/${num}?text=${msg}`;
    // Toast the number for user confirmation
    const pretty = s.waNumber && s.waNumber.trim() ? (s.waNumber.startsWith('+')? s.waNumber : ('+'+s.waNumber)) : ('+'+num);
    showToast(`التواصل عبر واتساب: ${pretty}`);
    window.open(url, '_blank');
  }catch(e){ alert('تعذر فتح واتساب'); }
}
if(els.fabWhatsApp){ els.fabWhatsApp.addEventListener('click', openWhatsApp); }

// Toast helper
function showToast(text){
  try{
    const el = document.getElementById('toast');
    if(!el) return;
    el.textContent = text;
    el.hidden = false;
    el.style.opacity = '1';
    clearTimeout(window.__toastT);
    window.__toastT = setTimeout(()=>{
      el.style.opacity = '0';
      setTimeout(()=>{ el.hidden = true; el.textContent=''; }, 250);
    }, 1600);
  }catch(_){ }
}

// Banners: load from API
async function loadBanners(){
  if(!els.sliderTrack) return;
  try{
    const res = await fetch('/api/banners');
    if(res.ok){
      const data = await res.json();
      if(data.success && Array.isArray(data.banners) && data.banners.length > 0){
        renderBanners(data.banners);
        return;
      }
    }
  }catch(e){ 
    console.warn('Failed to load banners:', e);
  }
  // Keep static fallback if no banners from API
}

function renderBanners(items){
  if(!els.sliderTrack) return;
  if(!items || !items.length) return; // keep static fallback
  els.sliderTrack.innerHTML = items.map(b=>`
    <article class="slide" style="--bg:${b.bg||'#3f2b82'};background:${b.bg||'#3f2b82'}">
      <div class="slide__content">
        <h2>${b.title||''}</h2>
        ${b.text?`<p>${b.text}</p>`:''}
        ${b.cta_text?`<a href="${b.cta_link||'#'}" class="btn btn-light">${b.cta_text}</a>`:''}
      </div>
      ${b.image?`<img src="${b.image}" alt="${b.title||''}">`:''}
    </article>
  `).join('');
  if(window.__wireSlider) window.__wireSlider();
}

loadBanners();

// Sticky footer auto-hide
(()=>{
  const footer = document.querySelector('.footer');
  if(!footer) return;
  let lastY = window.scrollY, ticking = false;
  function onScroll(){
    const y = window.scrollY;
    if(!ticking){
      window.requestAnimationFrame(()=>{
        if(y > lastY && y > 40){
          footer.classList.add('footer--hidden');
        } else {
          footer.classList.remove('footer--hidden');
        }
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
})();
