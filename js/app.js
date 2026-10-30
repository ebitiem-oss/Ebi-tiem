function qs(sel, el=document){ return el.querySelector(sel); }
function qsa(sel, el=document){ return Array.from(el.querySelectorAll(sel)); }

function setActivePage(pageName){
  qsa('.page').forEach(p => p.classList.toggle('active', p.dataset.page === pageName));
  qsa('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.go === pageName));
}

qsa('.nav-item').forEach(btn=>{
  btn.addEventListener('click', ()=> setActivePage(btn.dataset.go));
});

/* Games click: temporary alert */
qsa('.game-card').forEach(card=>{
  card.addEventListener('click', ()=>{
    const g = card.dataset.game;
    alert('فعلاً فقط UI آماده است. انتخاب شد: ' + g);
  });
});

/* Community: select chat updates profile panel */
const profiles = {
  arash: {name:'Arash', status:'آنلاین', id:'arash_gmr'},
  sara: {name:'Sara', status:'امن', id:'sara_secure'},
  kian: {name:'Kian', status:'آنلاین', id:'kian_77'},
  guild:{name:'Gaming Guild', status:'رسمی', id:'nivra_official'},
  elina:{name:'Elina', status:'آفلاین', id:'elina_13'},
  parham:{name:'Parham', status:'آنلاین', id:'parham_pv'}
};

function selectChat(userKey){
  qsa('.chat-item').forEach(x=>x.classList.remove('active'));
  const item = qs(`.chat-item[data-user="${userKey}"]`);
  if(item) item.classList.add('active');

  const p = profiles[userKey] || {name:'—', status:'—', id:'—'};
  qs('#ppName').textContent = p.name;
  qs('#ppStatus').textContent = p.status;
  qs('#ppId').textContent = p.id;
}

qsa('.chat-item').forEach(item=>{
  item.addEventListener('click', ()=> selectChat(item.dataset.user));
});

qs('#btnAddById')?.addEventListener('click', ()=>{
  const v = qs('#friendSearch')?.value?.trim();
  if(!v) return alert('اول شناسه را وارد کن.');
  alert('در نسخه بعدی: ارسال درخواست دوستی به ID = ' + v);
});

qs('#ppSettings')?.addEventListener('click', ()=> alert('تنظیمات: در مرحله بعدی'));
qs('#ppSecure')?.addEventListener('click', ()=> alert('امنیت PV: در مرحله بعدی'));
