/* TRIXA Admin (Firebase Firestore) */
const CRED = { user: 'alosh', pass: '131243ar' };

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
  pFile: document.getElementById('pFile'),
  pUploadStatus: document.getElementById('pUploadStatus'),
  pPreview: document.getElementById('pPreview'),
  pResolve: document.getElementById('pResolve'),
  pDesc: document.getElementById('pDesc'),
  pInstant: document.getElementById('pInstant'),
  pWa: document.getElementById('pWa'),
  saveProduct: document.getElementById('saveProduct'),
  clearForm: document.getElementById('clearForm'),
  resetData: document.getElementById('resetData'),
  waNumber: document.getElementById('waNumber'),
  saveSettings: document.getElementById('saveSettings'),
  // Banners admin
  bTitle: document.getElementById('bTitle'),
  bText: document.getElementById('bText'),
  bCtaText: document.getElementById('bCtaText'),
  bCtaLink: document.getElementById('bCtaLink'),
  bBg: document.getElementById('bBg'),
  bFile: document.getElementById('bFile'),
  bStatus: document.getElementById('bStatus'),
  addBanner: document.getElementById('addBanner'),
  updateBanner: document.getElementById('updateBanner'),
  cancelBannerEdit: document.getElementById('cancelBannerEdit'),
  bannersList: document.getElementById('bannersList'),
  addBannerTelegram: document.getElementById('addBannerTelegram'),
  addBannerInsta: document.getElementById('addBannerInsta'),
  addBannerTiktok: document.getElementById('addBannerTiktok'),
  addBannerSnap: document.getElementById('addBannerSnap'),
  addBannerFb: document.getElementById('addBannerFb'),
  // Apply buttons (presets)
  applyTelegram: document.getElementById('applyTelegram'),
  applyInsta: document.getElementById('applyInsta'),
  applyTiktok: document.getElementById('applyTiktok'),
  applySnap: document.getElementById('applySnap'),
  applyFb: document.getElementById('applyFb'),
  applyTool: document.getElementById('applyTool'),
  openaiKey: document.getElementById('openaiKey'),
  saveOpenAIKey: document.getElementById('saveOpenAIKey'),
  genDesc: document.getElementById('genDesc'),
  genStatus: document.getElementById('genStatus'),
};

function isLogged(){ return localStorage.getItem('ADMIN_AUTH')==='1'; }

// Quick-apply preset image into the form (لا ينشئ إعلاناً جديداً)
function quickAddBanner(key, title){
  const map = {
    telegram: 'assets/presets/telegram.jpg',
    instagram: 'assets/presets/instagram.jpg',
    tiktok: 'assets/presets/tiktok.jpg',
    snapchat: 'assets/presets/snapchat.jpg',
    facebook: 'assets/presets/facebook.jpg'
  };
  const image = map[key]; if(!image){ alert('الصورة غير موجودة في assets/presets'); return; }
  // خزّن رابط الصورة المسبقة ليتم استخدامها عند الحفظ إذا لم يُرفَع ملف
  els.addBanner.dataset.presetImage = image;
  if(els.bTitle && !els.bTitle.value) els.bTitle.value = title || key;
  if(els.bCtaText && !els.bCtaText.value) els.bCtaText.value = 'تسوق الآن';
  if(els.bCtaLink && !els.bCtaLink.value) els.bCtaLink.value = '#products';
  if(els.bBg && !els.bBg.value) els.bBg.value = '#3f2b82';
  els.bStatus.textContent = 'تم تحميل صورة جاهزة في النموذج — احفظ لتطبيقها على الإعلان';
}
if(els.addBannerTelegram) els.addBannerTelegram.addEventListener('click', ()=>quickAddBanner('telegram','Telegram'));
if(els.addBannerInsta) els.addBannerInsta.addEventListener('click', ()=>quickAddBanner('instagram','Instagram'));
if(els.addBannerTiktok) els.addBannerTiktok.addEventListener('click', ()=>quickAddBanner('tiktok','TikTok'));
if(els.addBannerSnap) els.addBannerSnap.addEventListener('click', ()=>quickAddBanner('snapchat','Snapchat'));
if(els.addBannerFb) els.addBannerFb.addEventListener('click', ()=>quickAddBanner('facebook','Facebook'));
function showDash(){ els.loginCard.classList.add('hidden'); els.dash.classList.remove('hidden'); render(); loadSettings(); subscribeBanners(); }
function showLogin(){ els.dash.classList.add('hidden'); els.loginCard.classList.remove('hidden'); }

// Banners: subscribe & render list
let unsubBanners = null;
function subscribeBanners(){
  if(!els.bannersList || !window.db) return;
  try{ if(unsubBanners) unsubBanners(); }catch(_){ }
  try{
    unsubBanners = window.db.collection('banners').orderBy('createdAt','desc').onSnapshot((snap)=>{
      const items = snap.docs.map(d=>({ id:d.id, ...d.data() }));
      els.bannersList.innerHTML = items.map(b=>`
        <div class="card" style="padding:10px">
          <div style="display:flex; gap:10px; align-items:center">
            <img src="${b.image||''}" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:8px;background:#2a2550" />
            <div style="flex:1">
              <div style="font-weight:700">${b.title||''}</div>
              <div class="muted" style="font-size:12px">${b.text||''}</div>
              <div class="muted" style="font-size:12px">زر: ${b.ctaText||''} → ${b.ctaLink||''}</div>
            </div>
            <div class="actions">
              <button class="btn btn-secondary" data-edit="${b.id}">تعديل</button>
              <button class="btn btn-secondary" data-del="${b.id}">حذف</button>
            </div>
          </div>
        </div>
      `).join('');
    });
    els.bannersList.addEventListener('click', async (e)=>{
      const delBtn = e.target.closest('button[data-del]');
      const editBtn = e.target.closest('button[data-edit]');
      if(delBtn){
        const id = delBtn.dataset.del;
        try{ await window.db.collection('banners').doc(id).delete(); }catch(err){ alert('فشل الحذف: '+err.message); }
      }
      if(editBtn){
        const id = editBtn.dataset.edit;
        try{
          const doc = await window.db.collection('banners').doc(id).get();
          if(doc.exists){
            const b = doc.data();
            els.bTitle.value = b.title||'';
            els.bText.value = b.text||'';
            els.bCtaText.value = b.ctaText||'';
            els.bCtaLink.value = b.ctaLink||'';
            els.bBg.value = b.bg||'';
            els.addBanner.dataset.editId = id; // mark editing
            els.bStatus.textContent = 'وضع تعديل: سيتم تحديث الإعلان الموجود';
          }
        }catch(err){ alert('تعذر تحميل الإعلان للتعديل: '+err.message); }
      }
    });
  }catch(err){ console.warn('banners subscribe error', err); }
}

// Add banner
if(els.addBanner){
  els.addBanner.addEventListener('click', async ()=>{
    try{
      if(!window.db){ alert('Firestore غير متاح'); return; }
      const title = (els.bTitle?.value||'').trim();
      const text = (els.bText?.value||'').trim();
      const ctaText = (els.bCtaText?.value||'').trim();
      const ctaLink = (els.bCtaLink?.value||'').trim() || '#products';
      const bg = (els.bBg?.value||'').trim() || '#3f2b82';
      let imageUrl = '';
      const file = els.bFile?.files?.[0];
      if(file){
        if(!firebase?.storage){ alert('Firebase Storage غير محمّل'); return; }
        els.bStatus.textContent = 'جارٍ رفع الصورة...';
        const path = `banners/${Date.now()}-${file.name}`;
        const ref = firebase.storage().ref().child(path);
        await ref.put(file, { contentType: file.type||'image/*' });
        imageUrl = await ref.getDownloadURL();
      }
      // استخدم الصورة الجاهزة إن لم يتم رفع ملف
      if(!imageUrl && els.addBanner.dataset.presetImage){ imageUrl = els.addBanner.dataset.presetImage; }
      els.bStatus.textContent = 'جارٍ الحفظ...';
      await window.db.collection('banners').add({ title, text, ctaText, ctaLink, bg, image: imageUrl, createdAt: Date.now() });
      els.bStatus.textContent = 'تمت الإضافة ✓';
      // clear fields
      if(els.bTitle) els.bTitle.value=''; if(els.bText) els.bText.value=''; if(els.bCtaText) els.bCtaText.value=''; if(els.bCtaLink) els.bCtaLink.value=''; if(els.bBg) els.bBg.value=''; if(els.bFile) els.bFile.value='';
      els.addBanner.dataset.presetImage = '';
    }catch(err){ els.bStatus.textContent='فشل الإضافة'; alert('فشل إضافة الإعلان: '+err.message); }
  });
}

// Update existing banner
if(els.updateBanner){
  els.updateBanner.addEventListener('click', async ()=>{
    try{
      const id = els.addBanner.dataset.editId;
      if(!id){ alert('اختر إعلاناً للتعديل من القائمة (زر تعديل)'); return; }
      const title = (els.bTitle?.value||'').trim();
      const text = (els.bText?.value||'').trim();
      const ctaText = (els.bCtaText?.value||'').trim();
      const ctaLink = (els.bCtaLink?.value||'').trim() || '#products';
      const bg = (els.bBg?.value||'').trim() || '#3f2b82';
      const file = els.bFile?.files?.[0];
      let patch = { title, text, ctaText, ctaLink, bg };
      if(file){
        if(!firebase?.storage){ alert('Firebase Storage غير محمّل'); return; }
        els.bStatus.textContent = 'جارٍ رفع الصورة...';
        const path = `banners/${Date.now()}-${file.name}`;
        const ref = firebase.storage().ref().child(path);
        await ref.put(file, { contentType: file.type||'image/*' });
        patch.image = await ref.getDownloadURL();
      }
      // استخدم الصورة الجاهزة إذا لم تُرفَع صورة جديدة وكان هناك preset
      if(!patch.image && els.addBanner.dataset.presetImage){ patch.image = els.addBanner.dataset.presetImage; }
      els.bStatus.textContent = 'جارٍ التحديث...';
      await window.db.collection('banners').doc(id).set(patch, { merge: true });
      els.bStatus.textContent = 'تم التحديث ✓';
      // clear edit state
      els.addBanner.dataset.editId = '';
      els.addBanner.dataset.presetImage = '';
      if(els.bFile) els.bFile.value='';
    }catch(err){ els.bStatus.textContent='فشل التحديث'; alert('فشل التحديث: '+err.message); }
  });
}

// Cancel edit
if(els.cancelBannerEdit){
  els.cancelBannerEdit.addEventListener('click', ()=>{
    els.addBanner.dataset.editId = '';
    els.bTitle.value=''; els.bText.value=''; els.bCtaText.value=''; els.bCtaLink.value=''; els.bBg.value=''; if(els.bFile) els.bFile.value='';
    els.bStatus.textContent = '';
  });
}

// Import default banners (current static two slides)
if(els.importDefaultBanners){
  els.importDefaultBanners.addEventListener('click', async ()=>{
    try{
      if(!window.db){ alert('Firestore غير متاح'); return; }
      const defaults = [
        { title:'خصم %60 على جميع المنتجات', text:'أكثر من 1800 تطبيق بلس ومهكر بلمسة واحدة', ctaText:'تسوق الآن', ctaLink:'#products', bg:'#3f2b82', image:'https://dummyimage.com/250x500/2e1f5b/ffffff&text=TRIXA+Plus' },
        { title:'تفعيل فوري بعد الدفع', text:'استلم الكود مباشرة داخل حسابك', ctaText:'اكتشف المنتجات', ctaLink:'#products', bg:'#512da8', image:'https://dummyimage.com/250x500/3d2a70/ffffff&text=Instant+Code' },
      ];
      for(const b of defaults){ await window.db.collection('banners').add({ ...b, createdAt: Date.now() }); }
      els.bStatus.textContent = 'تم الاستيراد ✓';
    }catch(err){ alert('فشل الاستيراد: '+err.message); }
  });
}

els.loginBtn.addEventListener('click', ()=>{
  const u = els.user.value.trim(); const p = els.pass.value;
  if(u===CRED.user && p===CRED.pass){ localStorage.setItem('ADMIN_AUTH','1'); els.loginMsg.textContent=''; showDash(); }
  else { els.loginMsg.textContent='بيانات الدخول غير صحيحة'; }
});

// Resolve Pinterest link to direct image URL (supports pin.it short links)
async function resolveDirectImageUrl(raw){
  // Returns a direct image URL or empty string
  const wrapHttps = (u) => 'https://r.jina.ai/https://'+u.replace(/^https?:\/\//,'');
  const wrapHttp  = (u) => 'https://r.jina.ai/http://'+u.replace(/^https?:\/\//,'');
  const fetchText = async (u)=>{
    let res = await fetch(wrapHttps(u));
    if(!res.ok){ res = await fetch(wrapHttp(u)); }
    if(!res.ok) return '';
    return res.text();
  };
  let target = raw.startsWith('http') ? raw : ('https://'+raw);
  try{
    const host = new URL(target).host;
    if(host.includes('pin.it')){
      const html0 = await fetchText(target);
      const can0 = html0 && (html0.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
               || html0.match(/http-equiv=["']refresh["'][^>]+url=([^"'>]+)/i)?.[1]);
      if(can0) target = can0.startsWith('http')? can0 : ('https://'+can0.replace(/^\/+/,''));
    }
    const html = await fetchText(target);
    if(html){
      let m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
      let direct = m?.[1] || '';
      if(!direct && /pinterest\./i.test(target)){
        try{
          const oe = await fetch(`https://www.pinterest.com/oembed.json?url=${encodeURIComponent(target)}`);
          if(oe.ok){ const data = await oe.json(); direct = data.thumbnail_url || direct; }
        }catch(_){/* ignore */}
      }
      return direct || '';
    }
  }catch(_){ /* ignore */ }
  return '';
}

if(els.pResolve){
  els.pResolve.addEventListener('click', async ()=>{
    const raw = (els.pImg?.value||'').trim(); if(!raw){ alert('أدخل رابط الصورة أولاً'); return; }
    const direct = await resolveDirectImageUrl(raw);
    if(!direct){ alert('تعذر استخراج رابط الصورة من صفحة بنترست'); return; }
    els.pImg.value = direct;
    if(els.pPreview){ els.pPreview.src = direct; els.pPreview.style.display='block'; }
    const editId = els.saveProduct.dataset.editId; if(editId){ await col().doc(editId).set({ image: direct }, { merge:true }); }
    alert('تم تحويل رابط بنترست للصورة المباشرة');
  });
}

// Upload from URL (including Pinterest)
if(els.pUploadFromUrl){
  els.pUploadFromUrl.addEventListener('click', async ()=>{
    const raw = (els.pImg?.value||'').trim(); if(!raw){ alert('أدخل رابط الصورة أولاً'); return; }
    try{
      els.pUploadStatus.textContent = 'جلب الصورة من الرابط...';
      let url = raw;
      if(/pin\.it|pinterest\./i.test(raw)){
        const d = await resolveDirectImageUrl(raw);
        if(d) url = d; else throw new Error('تعذر استخراج رابط الصورة من بنترست');
      }
      // Fetch image bytes via proxy to bypass CORS (try https then http)
      const proxH = 'https://r.jina.ai/https://'+url.replace(/^https?:\/\//,'');
      const proxL = 'https://r.jina.ai/http://'+url.replace(/^https?:\/\//,'');
      let res = await fetch(proxH);
      if(!res.ok) res = await fetch(proxL);
      if(!res.ok) throw new Error('تعذر تحميل الصورة من الرابط');
      const ct = res.headers.get('content-type')||'';
      if(!/image\//i.test(ct)){
        // بعض السيرفرات لا تعيد ترويسة صحيحة، نجرب الاستمرار
        console.warn('Non-image content-type from proxy:', ct);
      }
      const blob = await res.blob();
      if(blob.size === 0) throw new Error('الملف فارغ من المصدر');
      // Upload blob to storage with progress
      els.pUploadStatus.textContent = 'رفع الصورة إلى التخزين...';
      const path = `products/${Date.now()}-fromurl`;
      const storageRef = firebase.storage().ref().child(path);
      await storageRef.put(blob, { contentType: ct||'image/*' });
      const download = await storageRef.getDownloadURL();
      els.pImg.value = download; if(els.pPreview){ els.pPreview.src=download; els.pPreview.style.display='block'; }
      // Persist best-effort
      try{
        let editId = els.saveProduct.dataset.editId;
        if(!editId){ const docRef = await col().add({ title: (els.pTitle?.value||'').trim()||'بدون عنوان', price:Number(els.pPrice?.value||0), oldPrice:Number(els.pOld?.value||0), image: download, desc:(els.pDesc?.value||'').trim(), instant:(els.pInstant?.value==='true'), waNumber:(els.pWa?.value||'').trim(), createdAt: Date.now() }); editId = docRef.id; els.saveProduct.dataset.editId = editId; }
        else { await col().doc(editId).set({ image: download }, { merge:true }); }
        render();
      }catch(dbErr){ console.warn('Saved to storage but Firestore not updated yet', dbErr); }
      els.pUploadStatus.textContent = 'تم الرفع ✓';
    }catch(err){
      // Fallback: استخدم الرابط كما هو دون رفع، واحفظه في المنتج
      console.warn('Upload-from-URL failed, fallback to direct URL', err);
      const raw = (els.pImg?.value||'').trim();
      if(raw){
        els.pImg.value = raw; if(els.pPreview){ els.pPreview.src=raw; els.pPreview.style.display='block'; }
        try{
          let editId = els.saveProduct.dataset.editId;
          if(!editId){ const docRef = await col().add({ title: (els.pTitle?.value||'').trim()||'بدون عنوان', price:Number(els.pPrice?.value||0), oldPrice:Number(els.pOld?.value||0), image: raw, desc:(els.pDesc?.value||'').trim(), instant:(els.pInstant?.value==='true'), waNumber:(els.pWa?.value||'').trim(), createdAt: Date.now() }); editId = docRef.id; els.saveProduct.dataset.editId = editId; }
          else { await col().doc(editId).set({ image: raw }, { merge:true }); }
          render(); els.pUploadStatus.textContent='تم الحفظ كرابط خارجي ✓';
        }catch(dbErr){ els.pUploadStatus.textContent='فشل الرفع'; alert('فشل الرفع من الرابط: '+(err.message||err)); }
      } else {
        els.pUploadStatus.textContent='فشل الرفع';
        alert('فشل الرفع من الرابط: '+(err.message||err));
      }
    }
  });
}

// Upload image to Firebase Storage
if(els.pFile){
  els.pFile.addEventListener('change', async (e)=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    if(!firebase?.storage){ alert('Firebase Storage غير محمّل'); return; }
    try{
      els.pUploadStatus.textContent = 'جارٍ الرفع 0%';
      const path = `products/${Date.now()}-${file.name}`;
      const storageRef = firebase.storage().ref().child(path);
      await new Promise((resolve, reject)=>{
        const task = storageRef.put(file, { contentType: file.type||'application/octet-stream' });
        let lastProgressTs = Date.now();
        const watchdog = setInterval(()=>{
          if(Date.now()-lastProgressTs>10000){
            clearInterval(watchdog);
            try{ task.cancel(); }catch(_){}
            reject(new Error('Timeout: upload stalled (تحقق من قواعد Storage أو الاتصال)'));
          }
        }, 2000);
        task.on('state_changed', (snap)=>{
          const pct = Math.round((snap.bytesTransferred/snap.totalBytes)*100);
          els.pUploadStatus.textContent = `جارٍ الرفع ${pct}%`;
          lastProgressTs = Date.now();
        }, (err)=>{ clearInterval(watchdog); reject(err); }, ()=>{ clearInterval(watchdog); resolve(); });
      });
      const url = await storageRef.getDownloadURL();
      els.pImg.value = url;
      els.pUploadStatus.textContent = 'تم الرفع ✓';
      if(els.pPreview){ els.pPreview.src = url; els.pPreview.style.display='block'; }
      // Try to persist to Firestore (best-effort). If fails, user can hit "حفظ المنتج" لاحقاً.
      try{
        let editId = els.saveProduct.dataset.editId;
        if(!editId){
          const draft = {
            title: (els.pTitle?.value||'').trim() || 'بدون عنوان',
            price: Number(els.pPrice?.value||0),
            oldPrice: Number(els.pOld?.value||0),
            image: url,
            desc: (els.pDesc?.value||'').trim(),
            instant: (els.pInstant?.value==='true'),
            waNumber: (els.pWa?.value||'').trim(),
            createdAt: Date.now()
          };
          const refDoc = await col().add(draft);
          editId = refDoc.id;
          els.saveProduct.dataset.editId = editId;
        } else {
          await col().doc(editId).set({ image: url }, { merge:true });
        }
        render();
      }catch(dbErr){
        console.warn('Image uploaded but Firestore not updated yet:', dbErr);
        // leave url in input so user can press Save
      }
    }catch(err){
      console.error(err);
      els.pUploadStatus.textContent = 'فشل الرفع';
      const code = err && (err.code||err.message||'');
      alert('فشل رفع الصورة: '+code+'\nتحقق من قواعد Storage، ومفاتيح firebase-config.js، والاتصال بالشبكة.');
    }
  });
}

// OpenAI key (local-only)
if(els.openaiKey){ els.openaiKey.value = localStorage.getItem('OPENAI_KEY')||''; }
if(els.saveOpenAIKey){ els.saveOpenAIKey.addEventListener('click', ()=>{ localStorage.setItem('OPENAI_KEY', els.openaiKey.value||''); alert('تم حفظ مفتاح OpenAI محلياً'); }); }

// Generate description
if(els.genDesc){
  els.genDesc.addEventListener('click', async ()=>{
    const title = (els.pTitle?.value||'').trim();
    if(!title){ alert('أدخل اسم المنتج أولاً'); return; }
    const key = localStorage.getItem('OPENAI_KEY');
    if(!key){ alert('أدخل OpenAI API Key في الإعدادات أولاً'); return; }
    els.genStatus.textContent = 'جارٍ التوليد...';
    try{
      const prompt = `اكتب وصفاً عربيًا جذابًا ومنسقًا لمنتج بعنوان: ${title}. اجعله مختصرًا (3-5 جُمل)، مع إبراز الفوائد، وذكر سياسة التفعيل/التسليم إن لزم، وCTA في النهاية.`;
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${key}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role:'system', content:'أنت مساعد تسويق عربي محترف يكتب وصف منتجات موجز وجذاب.' },
            { role:'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 220
        })
      });
      if(!res.ok){ throw new Error(await res.text()); }
      const data = await res.json();
      const text = data.choices?.[0]?.message?.content?.trim() || '';
      els.pDesc.value = text;
      els.genStatus.textContent = 'تم التوليد ✓';
    }catch(e){
      console.error(e);
      els.genStatus.textContent = 'فشل التوليد';
      alert('تعذر توليد الوصف: '+e.message);
    }
  });
}
els.logout.addEventListener('click', ()=>{ localStorage.removeItem('ADMIN_AUTH'); showLogin(); });

function clearForm(){
  delete els.saveProduct.dataset.editId;
  if(els.pPreview){ els.pPreview.style.display='none'; els.pPreview.src=''; }
}
els.clearForm.addEventListener('click', clearForm);

function col(){
  if(!window.db){
    alert('Firebase غير مهيّأ. أضف مفاتيحك في firebase-config.js');
    throw new Error('no db');
  }
  return window.db.collection('products');
}

async function render(){
  try{
    const snap = await col().get();
    const items = snap.docs.map(d=>({ id: d.id, ...d.data() }));
    els.rows.innerHTML = items.map(p=>`
      <tr data-id="${p.id}" class="row-click">
        <td>${p.title||''}</td>
        <td>${p.price??''}</td>
        <td>${p.oldPrice||''}</td>
        <td>${p.instant?'<span class="badge">نعم</span>':'لا'}</td>
        <td>
          <button data-act="edit" data-id="${p.id}" class="btn btn-secondary">تعديل</button>
          <button data-act="del" data-id="${p.id}" class="btn btn-danger">حذف</button>
        </td>
      </tr>
    `).join('');
  }catch(e){
    els.rows.innerHTML = `<tr><td colspan="5" class="muted">تعذر جلب البيانات: ${e.message}</td></tr>`;
  }
}

els.rows.addEventListener('click', async (e)=>{
  const b = e.target.closest('button');
  const tr = e.target.closest('tr');
  // Button actions take priority
  if(b){
    const act = b.dataset.act; const id = b.dataset.id;
    if(act==='edit'){
      try{
        const doc = await col().doc(id).get();
        const p = doc.data();
        els.pTitle.value=p.title||''; els.pPrice.value=p.price||''; els.pOld.value=p.oldPrice||''; els.pImg.value=p.image||''; els.pDesc.value=p.desc||''; els.pInstant.value=p.instant?'true':'false'; els.pWa.value = p.waNumber||'';
        els.saveProduct.dataset.editId = id;
        if(els.pPreview && p.image){ els.pPreview.src=p.image; els.pPreview.style.display='block'; }
      }catch(e2){ alert('خطأ: '+e2.message); }
    }
    if(act==='del'){
      if(!confirm('حذف هذا المنتج؟')) return;
      try{ await col().doc(id).delete(); render(); }catch(e2){ alert('خطأ: '+e2.message); }
    }
    return;
  }
  // If clicking the row (outside buttons), open for editing
  if(tr){
    const id = tr.dataset.id;
    try{
      const doc = await col().doc(id).get();
      const p = doc.data();
      els.pTitle.value=p.title||''; els.pPrice.value=p.price||''; els.pOld.value=p.oldPrice||''; els.pImg.value=p.image||''; els.pDesc.value=p.desc||''; els.pInstant.value=p.instant?'true':'false'; els.pWa.value = p.waNumber||'';
      els.saveProduct.dataset.editId = id;
      if(els.pPreview && p.image){ els.pPreview.src=p.image; els.pPreview.style.display='block'; }
    }catch(err){ alert('خطأ: '+err.message); }
  }
});

els.saveProduct.addEventListener('click', async ()=>{
  try{
    const payload = {
      title: els.pTitle.value.trim(),
      price: Number(els.pPrice.value||0),
      oldPrice: Number(els.pOld.value||0),
      image: els.pImg.value.trim(),
      desc: els.pDesc.value.trim(),
      instant: els.pInstant.value==='true',
      waNumber: (els.pWa?.value||'').trim()
    };
    const editId = els.saveProduct.dataset.editId;
    if(editId){ await col().doc(editId).set(payload, { merge:true }); }
    else { await col().add(payload); }
    clearForm(); render();
  }catch(e){ alert('فشل الحفظ: '+e.message); }
});


(async function init(){ if(isLogged()) showDash(); else showLogin(); })();

// Settings: WhatsApp number
async function loadSettings(){
  try{
    const doc = await window.db.collection('settings').doc('store').get();
    const data = doc.exists ? doc.data() : {};
    if(els.waNumber) els.waNumber.value = data.waNumber || localStorage.getItem('WA_NUMBER') || '';
  }catch(e){ if(els.waNumber){ els.waNumber.value = localStorage.getItem('WA_NUMBER')||''; } }
}

if(els.saveSettings){
  els.saveSettings.addEventListener('click', async ()=>{
    try{
      const wa = (els.waNumber?.value||'').trim();
      await window.db.collection('settings').doc('store').set({ waNumber: wa }, { merge:true });
      localStorage.setItem('WA_NUMBER', wa);
      alert('تم حفظ الإعدادات');
    }catch(e){ alert('تعذر حفظ الإعدادات: '+e.message); }
  });
}

// Apply preset to product image from /assets/presets/
const PRESETS = {
  telegram: 'assets/presets/telegram.jpg',
  insta: 'assets/presets/instagram.jpg',
  tiktok: 'assets/presets/tiktok.jpg',
  snap: 'assets/presets/snapchat.jpg',
  fb: 'assets/presets/facebook.jpg',
  tool: 'assets/presets/Tool.jpg'
};
async function applyPreset(key){
  const url = PRESETS[key];
  if(!url){ alert('الصورة غير معرفة'); return; }
  els.pImg.value = url; if(els.pPreview){ els.pPreview.src=url; els.pPreview.style.display='block'; }
  const editId = els.saveProduct.dataset.editId;
  if(editId){ try{ await col().doc(editId).set({ image: url }, { merge:true }); }catch(e){ /* ignore */ } }
}
if(els.applyTelegram) els.applyTelegram.addEventListener('click', ()=>applyPreset('telegram'));
if(els.applyInsta) els.applyInsta.addEventListener('click', ()=>applyPreset('insta'));
if(els.applyTiktok) els.applyTiktok.addEventListener('click', ()=>applyPreset('tiktok'));
if(els.applySnap) els.applySnap.addEventListener('click', ()=>applyPreset('snap'));
if(els.applyFb) els.applyFb.addEventListener('click', ()=>applyPreset('fb'));
if(els.applyTool) els.applyTool.addEventListener('click', ()=>applyPreset('tool'));
