/* TRIXA Cart Page */
const state = {
  currency: localStorage.getItem('currency') || 'SAR',
  rate: { SAR: 1, USD: 0.27, ILS: 0.98 }, // approximate per 1 SAR
  cart: JSON.parse(localStorage.getItem('cart')||'[]'),
};
const symbols = { SAR: '﷼', USD: '$', ILS: '₪' };
const fmt = (v) => {
  const c = state.currency; const rate = state.rate[c] ?? 1; const val = c==='SAR' ? v : v*rate; return `${val.toFixed(2)} ${symbols[c]||''}`;
};

const els = {
  count: document.getElementById('cartCount'),
  list: document.getElementById('cartList'),
  total: document.getElementById('total'),
  currency: document.getElementById('currency'),
  empty: document.getElementById('emptyState'),
  flag: document.getElementById('flagCart'),
};

function save(){ localStorage.setItem('cart', JSON.stringify(state.cart)); }
let storeSettings = { waNumber: localStorage.getItem('WA_NUMBER')||'' };
async function loadSettings(){
  try{
    if(window.db){
      const doc = await window.db.collection('settings').doc('store').get();
      if(doc.exists){ storeSettings = { ...storeSettings, ...doc.data() };
        if(storeSettings.waNumber) localStorage.setItem('WA_NUMBER', storeSettings.waNumber);
      }
    }
  }catch(e){ /* ignore, fallback to localStorage */ }
}
function render(){
  const items = state.cart;
  const total = items.reduce((s,i)=>s+i.price*i.qty,0);
  els.count.textContent = items.reduce((s,i)=>s+i.qty,0);
  els.total.textContent = fmt(total);
  els.currency.value = state.currency;

  if(items.length === 0){
    els.list.innerHTML = '';
    els.empty.hidden = false;
    return;
  }
  els.empty.hidden = true;
  els.list.innerHTML = items.map(i=>`
    <div class="cart-item">
      <img src="${i.image}" alt="${i.title}">
      <div class="meta">
        <div style="font-weight:700;margin-bottom:6px">${i.title}</div>
        <div class="qty">
          <button aria-label="نقص" data-act="dec" data-id="${i.id}">-</button>
          <span>${i.qty}</span>
          <button aria-label="زيادة" data-act="inc" data-id="${i.id}">+</button>
          <button class="remove" data-act="rm" data-id="${i.id}">حذف</button>
        </div>
      </div>
      <div>${fmt(i.price*i.qty)}</div>
    </div>
  `).join('');
}

els.list.addEventListener('click', (e)=>{
  const btn = e.target.closest('button'); if(!btn) return;
  const id = String(btn.dataset.id); const act = btn.dataset.act;
  const it = state.cart.find(x=> String(x.id) === id);
  if(act==='inc' && it){ it.qty++; }
  if(act==='dec' && it){ it.qty--; if(it.qty<=0) state.cart = state.cart.filter(x=> String(x.id) !== id); }
  if(act==='rm'){ state.cart = state.cart.filter(x=> String(x.id) !== id); }
  save(); loadSettings().then(render);
});

function setFlag(){ if(!els.flag) return; const map={SAR:'🇸🇦',USD:'🇺🇸',ILS:'🇵🇸'}; els.flag.textContent = map[state.currency]||'🇸🇦'; }
setFlag();

els.currency.addEventListener('change', (e)=>{
  state.currency = e.target.value; localStorage.setItem('currency', state.currency); setFlag(); render();
});

// Checkout via WhatsApp
const checkoutBtn = document.getElementById('checkout');
checkoutBtn.addEventListener('click', async ()=>{
  await loadSettings();
  const totalSar = state.cart.reduce((s,i)=>s+i.price*i.qty,0);
  const c = state.currency; const rate = state.rate[c] ?? 1; const symbol = symbols[c]||'';
  const total = c==='SAR' ? totalSar : totalSar*rate;
  const lines = state.cart.map(i=>`- ${i.title} x${i.qty} = ${((c==='SAR')? (i.price*i.qty) : (i.price*i.qty*rate)).toFixed(2)} ${symbol}`).join('%0A');
  const msg = `طلب جديد من TRIXA%0A${lines}%0Aالإجمالي: ${total.toFixed(2)} ${symbol} (${c})`;
  // Choose phone: if all cart items share same i.wa, use it; else use store-level
  const uniqueWas = [...new Set(state.cart.map(i=>i.wa).filter(Boolean))];
  const phone = uniqueWas.length===1 ? uniqueWas[0] : (storeSettings.waNumber||'');
  if(!phone){ alert('لم يتم إعداد رقم واتساب. أضف رقم المتجر من لوحة التحكم أو رقم للمنتج.'); return; }
  window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
});

render();
