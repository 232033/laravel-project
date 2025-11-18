// Initialize Firebase app if config is present
(function(){
  try{
    if(!window.FIREBASE_CONFIG) return; // config file not provided
    // Using compat SDKs loaded via script tags
    const app = firebase.initializeApp(window.FIREBASE_CONFIG);
    const db = firebase.firestore(app);
    window.db = db; // expose globally
  }catch(e){
    console.warn('Firebase init skipped:', e);
  }
})();
