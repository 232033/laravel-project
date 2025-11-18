/* TRIXA Admin v2 (Netlify Functions + local fallback) */
const CRED = { user: 'alosh', pass: '131243ar' };
const API = '/.netlify/functions/products';

const els = {
  loginCard: document.getElementById('loginCard'),
  dash: document.getElementById('dash'),
  user: document.getElementById('user'),
  pass: document.getElementById('pass'),
  loginBtn: document.getElementById('loginBtn'),
  loginMsg: document.getElementById('loginMsg'),
  logout: document.getElementById('logout'),
  rows: document.getElementById('rows'),
  pTitle: document.getElementById('pTitle'),
  pPrice: document.getElementById('pPrice'),
  pOld: document.getElementById('pOld'),
  pImg: document.getElementById('pImg'),
  pDesc: document.getElementById('pDesc'),
  pInstant: document.getElementById('pInstant'),
  saveProduct: document.getElementById('saveProduct'),
  clearForm: document.getElementById('clearForm'),
  resetData: document.getElementById('resetData'),
};

async function ensureSeed(){
  if(localStorage.getItem('SEED_CACHE')) return;
  try{
    const text = await fetch('products.js').then(r=>r.text());
    const s = document.createElement('script'); s.textContent = text; document.head.appendChild(s);
    localStorage.setItem('SEED_CACHE', JSON.stringify(window.PRODUCTS||[]));
  }catch{ localStorage.setItem('SEED_CACHE', '[]'); }
}

async function getData(){
  // Try remote
  try{
    const res = await fetch(API, { headers: { 'Cache-Control':'no-cache' } });
    if(res.ok){ const data = await res.json(); if(Array.isArray(data)) return data; }
  }catch{}
  // Fallback: local override then seed
  let items = [];
  const o = localStorage.getItem('PRODUCTS_OVERRIDE');
  if(o){ try{ items = JSON.parse(o); }catch{ items=[]; } }
  if(!items.length){ items = JSON.parse(localStorage.getItem('SEED_CACHE')||'[]'); }
  return items;
}

function saveLocal(items){ localStorage.setItem('PRODUCTS_OVERRIDE', JSON.stringify(items)); }
async function saveRemote(items){
  let token = localStorage.getItem('ADMIN_TOKEN');
  if(!token){ token = prompt('أدخل ADMIN_TOKEN من Netlify'); if(token) localStorage.setItem('ADMIN_TOKEN', token); }
  const res = await fetch(API, { method:'POST', headers:{ 'Content-Type':'application/json','x-admin-token': token||'' }, body: JSON.stringify(items) });
  if(!res.ok){ throw new Error('فشل الحفظ على السيرفر'); }
}

function clearForm(){
  els.pTitle.value=''; els.pPrice.value=''; els.pOld.value=''; els.pImg.value=''; els.pDesc.value=''; els.pInstant.value='false';
  delete els.saveProduct.dataset.edit;
}

async function render(){
  const items = await getData();
  els.rows.innerHTML = items.map((p,i)=>`
    <tr>
      <td>${p.title||''}</td>
      <td>${p.price??''}</td>
      <td>${p.oldPrice||''}</td>
      <td>${p.instant?'<span class="badge">نعم</span>':'لا'}</td>
      <td>
        <button data-act="edit" data-i="${i}" class="btn btn-secondary">تعديل</button>
        <button data-act="del" data-i="${i}" class="btn btn-danger">حذف</button>
      </td>
    </tr>
  `).join('');
}

els.clearForm.addEventListener('click', clearForm);

els.saveProduct.addEventListener('click', async ()=>{
  const items = await getData();
  const obj = {
    id: Date.now(),
    title: els.pTitle.value.trim(),
    price: Number(els.pPrice.value||0),
    oldPrice: Number(els.pOld.value||0),
    image: els.pImg.value.trim(),
    desc: els.pDesc.value.trim(),
    instant: els.pInstant.value==='true'
  };
  const edit = els.saveProduct.dataset.edit;
  if(edit!==undefined){ items[Number(edit)] = { ...items[Number(edit)], ...obj, id: items[Number(edit)].id }; }
  else { items.push(obj); }
  try{ await saveRemote(items); }
  catch(e){ alert(e.message+'\nسيتم الحفظ محلياً كنسخة احتياطية'); saveLocal(items); }
  clearForm(); render();
});

els.rows.addEventListener('click', async (e)=>{
  const b = e.target.closest('button'); if(!b) return;
  const act = b.dataset.act; const i = Number(b.dataset.i); const items = await getData();
  if(act==='edit'){
    const p = items[i];
    els.pTitle.value=p.title||''; els.pPrice.value=p.price||''; els.pOld.value=p.oldPrice||''; els.pImg.value=p.image||''; els.pDesc.value=p.desc||''; els.pInstant.value=p.instant?'true':'false';
    els.saveProduct.dataset.edit = i;
  }
  if(act==='del'){
    items.splice(i,1);
    try{ await saveRemote(items); }
    catch(e){ alert(e.message+'\nسيتم الحفظ محلياً كنسخة احتياطية'); saveLocal(items); }
    render();
  }
});

els.resetData.addEventListener('click', async ()=>{ localStorage.removeItem('PRODUCTS_OVERRIDE'); await render(); });

function isLogged(){ return localStorage.getItem('ADMIN_AUTH')==='1'; }
function showDash(){ els.loginCard.classList.add('hidden'); els.dash.classList.remove('hidden'); render(); }
function showLogin(){ els.dash.classList.add('hidden'); els.loginCard.classList.remove('hidden'); }

els.loginBtn.addEventListener('click', ()=>{
  const u = els.user.value.trim(); const p = els.pass.value;
  if(u===CRED.user && p===CRED.pass){ localStorage.setItem('ADMIN_AUTH','1'); els.loginMsg.textContent=''; showDash(); }
  else { els.loginMsg.textContent='بيانات الدخول غير صحيحة'; }
});
els.logout.addEventListener('click', ()=>{ localStorage.removeItem('ADMIN_AUTH'); showLogin(); });

(async function init(){ await ensureSeed(); if(isLogged()) showDash(); else showLogin(); })();
