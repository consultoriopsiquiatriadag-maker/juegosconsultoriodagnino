(function(){
  const root = document.documentElement;
  const btnMinus = document.getElementById("btnAminus");
  const btnPlus  = document.getElementById("btnAplus");

  const KEY = "dagnino_font_base";
  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
  function setBase(px){
    px = clamp(px, 14, 20);
    root.style.setProperty("--base", px + "px");
    try{ localStorage.setItem(KEY, String(px)); }catch(e){}
  }
  function getBase(){
    try{
      const v = parseInt(localStorage.getItem(KEY) || "16", 10);
      return isNaN(v) ? 16 : v;
    }catch(e){ return 16; }
  }

  setBase(getBase());

  if(btnMinus) btnMinus.addEventListener("click", () => setBase(getBase()-1));
  if(btnPlus)  btnPlus.addEventListener("click",  () => setBase(getBase()+1));
})();
