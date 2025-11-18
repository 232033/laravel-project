/* TRIXA Favorites Page Controller */
(function(){
  // Ensure cart badge, currency flag and fav count are correct
  if(typeof setFlag === 'function') setFlag();
  if(typeof loadCart === 'function') loadCart();
  if(typeof renderFavCount === 'function') renderFavCount();

  const grid = document.getElementById('productsGrid');
  const empty = document.getElementById('favEmpty');
  function updateEmpty(){
    try{
      const n = (window.state && window.state.fav) ? window.state.fav.size : 0;
      const hasCards = grid && grid.children && grid.children.length > 0 && !grid.querySelector('.empty');
      const showEmpty = n === 0 || !hasCards;
      if(empty){ empty.hidden = !showEmpty; }
    }catch(_){ if(empty) empty.hidden = false; }
  }

  // Render favorites grid on load
  if(typeof showFavorites === 'function'){
    showFavorites();
    updateEmpty();
  } else {
    // Fallback: simple local filter using cache if showFavorites is unavailable
    try{
      const favIds = new Set(state?.fav || []);
      let items = JSON.parse(localStorage.getItem('PRODUCTS_OVERRIDE')||'null')
              || JSON.parse(localStorage.getItem('PRODUCTS_CACHE')||'null')
              || [];
      const filtered = items.filter(p=> favIds.has(p.id));
      if(typeof renderProducts === 'function') renderProducts(filtered);
    }catch(_){ }
    updateEmpty();
  }

  // Keep empty state in sync when the user toggles favorites on this page
  document.addEventListener('click', (e)=>{
    const t = e.target;
    if(t && (t.id||'').startsWith('like-')){
      setTimeout(updateEmpty, 50);
    }
  });
})();
