/* TRIXA Product Details */
(function(){
  // Helpers from app.js: state, fmt, addToCart, setFlag, etc. are already loaded before this file
  const qs = new URLSearchParams(location.search);
  const docId = qs.get('id');
  const pid = qs.get('pid');
  const slug = (qs.get('slug')||'').trim();

  const el = {
    media: document.getElementById('pMedia'),
    title: document.getElementById('pTitle'),
    old: document.getElementById('pOld'),
    price: document.getElementById('pNew'),
    desc: document.getElementById('pDesc'),
    instant: document.getElementById('pInstant'),
    add: document.getElementById('pAdd'),
  };

  let current = null;

  // Render product into DOM
  function render(p){
    if(!p) return;
    current = p;
    const safeImg = (p.image) ? p.image : 'https://dummyimage.com/800x800/2a2550/ffffff&text=TRIXA';
    el.media.classList.add('is-bg');
    el.media.style.backgroundImage = `url('${safeImg.replace(/'/g, "%27")}')`;
    el.media.innerHTML = '';

    el.title.textContent = p.title || '';
    el.price.textContent = (typeof fmt === 'function') ? fmt(p.price||0) : `${(p.price||0).toFixed(2)} SAR`;
    if(p.oldPrice && p.oldPrice>p.price){
      el.old.textContent = (typeof fmt === 'function') ? fmt(p.oldPrice) : `${p.oldPrice.toFixed(2)} SAR`;
      el.old.hidden = false;
    } else {
      el.old.hidden = true;
    }
    el.desc.textContent = p.desc || '';
    el.instant.hidden = !p.instant;

    if(el.add){ el.add.onclick = ()=>{ if(window.addToCart) addToCart(p); }; }
  }

  // Try sessionStorage instant render
  try{
    const s = sessionStorage.getItem('CURRENT_PRODUCT');
    if(s){
      const p = JSON.parse(s);
      // only render if id or slug matches the current
      if(p && (String(p.docId||p.id)===String(docId||pid||'') || (slug && p.slug===slug)) ){
        render(p);
      }
    }
  }catch(_){ }

  // Fetch precedence: API -> Local cache -> products.js global
  async function resolveProduct(){
    // 1) API
    try{
      const res = await fetch('/api/products');
      if(res.ok){
        const data = await res.json();
        if(data.success && Array.isArray(data.products)){
          const p = findInArray(data.products.map(prod => ({
            id: prod.id,
            docId: prod.id,
            title: prod.title,
            price: parseFloat(prod.price),
            oldPrice: prod.old_price ? parseFloat(prod.old_price) : null,
            image: prod.image,
            desc: prod.desc,
            instant: prod.instant,
            slug: prod.slug || ''
          })));
          if(p) return p;
        }
      }
    }catch(e){ console.warn('API product fetch failed', e); }

    // 2) Local cache or override
    try{
      const cache = JSON.parse(localStorage.getItem('PRODUCTS_OVERRIDE')||'null')
                 || JSON.parse(localStorage.getItem('PRODUCTS_CACHE')||'null');
      if(Array.isArray(cache) && cache.length){
        const p = findInArray(cache);
        if(p) return p;
      }
    }catch(_){ }

    // 3) products.js global
    if(Array.isArray(window.PRODUCTS) && window.PRODUCTS.length){
      const p = findInArray(window.PRODUCTS);
      if(p) return p;
    }

    // 4) As a last resort, load products.js dynamically if not present
    try{
      if(!window.PRODUCTS){
        const data = await fetch('/js/products.js').then(r=>r.text());
        const sc = document.createElement('script'); sc.textContent = data; document.head.appendChild(sc);
      }
      if(Array.isArray(window.PRODUCTS)){
        const p = findInArray(window.PRODUCTS);
        if(p) return p;
      }
    }catch(e){ console.warn('Failed to load products.js', e); }

    return null;
  }

  function findInArray(arr){
    const idToMatch = String(docId||pid||'');
    return arr.find(p =>
      (idToMatch && (String(p.docId||p.id)===idToMatch)) ||
      (slug && p.slug===slug)
    );
  }

  (async function init(){
    const p = await resolveProduct();
    if(p){
      render(p);
    } else {
      el.title.textContent = 'المنتج غير متوفر';
      el.desc.textContent = 'تعذر العثور على هذا المنتج. يرجى العودة للمتجر.';
      if(el.add) el.add.disabled = true;
    }

    // Ensure currency flag is correct
    if(typeof setFlag === 'function') setFlag();
    if(typeof loadCart === 'function') loadCart(); // to refresh cart badge
  })();
})();
