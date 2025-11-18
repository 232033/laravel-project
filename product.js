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

  // Fetch precedence: Firestore -> PRODUCTS cache/override -> products.js global
  async function resolveProduct(){
    // 1) Firestore
    try{
      if(window.db){
        // Try by document id first
        if(docId){
          const doc = await window.db.collection('products').doc(docId).get();
          if(doc.exists){ return { docId: doc.id, ...doc.data(), id: (doc.data().id ?? doc.id) }; }
        }
        // Try query by id field or slug
        let q = window.db.collection('products');
        if(pid){ q = q.where('id','==', isNaN(+pid) ? pid : +pid); }
        if(slug){ q = q.where('slug','==', slug); }
        const snap = await q.limit(1).get();
        if(!snap.empty){ const d = snap.docs[0]; return { docId: d.id, ...d.data(), id: (d.data().id ?? d.id) }; }
      }
    }catch(e){ console.warn('Firestore product fetch failed', e); }

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
        const data = await fetch('products.js').then(r=>r.text());
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
