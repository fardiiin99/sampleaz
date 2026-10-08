// Carnival Care — clickable demo. Hash-routed single page, no build step.
(function () {
  'use strict';

  const D = window.CC_DATA;
  const R = D.demoRx;
  const PT = Object.assign({ hue: 200 }, D.patient);
  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modalRoot');
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('drawerBackdrop');

  // ---------- Helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const docById = (id) => D.doctors.find((d) => d.id === id);
  const deptById = (id) => D.departments.find((x) => x.id === id);
  const money = (n) => '৳' + Math.round(n).toLocaleString('en-IN');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const initials = (name) => name.replace(/^Dr\.\s*/, '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('');
  const firstName = (d) => d.name.replace(/^Dr\.\s*/, '').split(' ')[0];
  const rid = (p) => p + '-' + Math.floor(1000 + Math.random() * 9000);
  const fmtDate = (dt) => dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const today = () => fmtDate(new Date());
  const mmss = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  };
  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    stethoscope: '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    baby: '<path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/>',
    flower: '<circle cx="12" cy="12" r="3"/><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"/>',
    sparkle: '<path d="M12 3l1.9 5.8L20 10.6l-6.1 1.9L12 18l-1.9-5.5L4 10.6l6.1-1.8z"/>',
    brain: '<path d="M12 5a3 3 0 1 0-6 .1 4 4 0 0 0-2.5 5.8 4 4 0 0 0 .6 6.6A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 6 .1 4 4 0 0 1 2.5 5.8 4 4 0 0 1-.6 6.6A4 4 0 1 1 12 18Z"/><path d="M12 5v13"/>',
    bone: '<path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.82-.7-1.8 0-2.5Z"/>',
    ear: '<path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
    pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
    star: '<path fill="currentColor" stroke="none" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    video: '<path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    videoOff: '<path d="m16 13 5.2 3.5a.5.5 0 0 0 .8-.4V7.9a.5.5 0 0 0-.8-.4L16 11"/><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M2 2l20 20"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/>',
    micOff: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><path d="M12 18v4"/><path d="M2 2l20 20"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>',
    flask: '<path d="M9 3h6"/><path d="M10 3v6.5L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9.5V3"/><path d="M7 15h10"/>',
    cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
    chev: '<path d="m9 18 6-6-6-6"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    back: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    truck: '<path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    print: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    signal: '<path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    play: '<path d="M6 4l14 8-14 8z"/>',
    pause: '<path d="M7 4h3v16H7z"/><path d="M14 4h3v16h-3z"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    wallet: '<path d="M20 7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
    refer: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  };
  const icon = (name, cls = '') =>
    `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  const avatar = (p, size = '', dot = false) =>
    `<span class="avatar ${size}" style="--h:${p.hue}">${initials(p.name)}${dot ? '<i class="dot"></i>' : ''}</span>`;

  // Extra items the doctor can pick in the prescription composer.
  const MED_LIB = R.medicines.concat([
    { name: 'Azithrocin 500 mg', generic: 'Azithromycin', dose: '1 + 0 + 0', duration: '3 days', note: 'Before meal', price: 35, qty: 3 },
    { name: 'Montair 10 mg', generic: 'Montelukast', dose: '0 + 0 + 1', duration: '14 days', note: 'At night', price: 16, qty: 14 },
    { name: 'Ace Plus', generic: 'Paracetamol + Caffeine', dose: '1 + 1 + 1', duration: '3 days', note: 'After meal', price: 2.5, qty: 9 },
    { name: 'Tusca Plus Syrup', generic: 'Dextromethorphan', dose: '2 tsp × 3', duration: '5 days', note: 'After meal', price: 95, qty: 1 },
  ]);
  const TEST_LIB = R.tests.concat([
    { name: 'Chest X-ray P/A view', price: 600, tat: '4 hrs' },
    { name: 'C-Reactive Protein (CRP)', price: 800, tat: '12 hrs' },
  ]);
  const ADVICE_LIB = R.advice.concat(['Wear a mask at home to avoid spreading infection']);
  const COMPLAINT_LIB = R.complaints.concat(['Loss of appetite', 'Weakness']);

  // ---------- State ----------
  const KEY = 'cc-demo-state-v1';
  const fresh = () => ({ appointment: null, upcoming: [], rx: null, cart: [], orders: [], draft: null });
  let S = fresh();
  try {
    S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}'));
  } catch (e) { /* storage unavailable — keep in memory */ }
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ }
  };

  const ui = { dept: 'all', q: '', online: false, book: null, dash: null, call: null };
  let teardown = [];
  const runTeardown = () => {
    teardown.forEach((f) => { try { f(); } catch (e) { /* ignore */ } });
    teardown = [];
  };

  // ---------- Toast / modal / cart ----------
  function toast(msg, ic = 'check') {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = icon(ic) + '<span>' + msg + '</span>';
    $('#toasts').appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 2800);
  }
  function openModal(html, maxWidth) {
    modalRoot.innerHTML = `<div class="modal-backdrop" data-action="modal-bg"><div class="modal" role="dialog" aria-modal="true" ${maxWidth ? `style="max-width:${maxWidth}px"` : ''}>${html}</div></div>`;
  }
  function closeModal() { modalRoot.innerHTML = ''; }
  function processing(text) {
    openModal(`<div class="modal-pad" style="text-align:center;padding:44px 28px"><div class="spin"></div><h3 style="margin-top:20px">${text}</h3><p class="muted small" style="margin-top:6px">Please don't close this window</p></div>`, 420);
  }

  function updateCartBadge(pop) {
    const n = S.cart.length;
    const b = $('#cartCount');
    b.textContent = n;
    b.hidden = n === 0;
    if (pop) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
  }
  function cartTotals() {
    const meds = S.cart.filter((i) => i.type === 'med').reduce((a, i) => a + i.price * i.qty, 0);
    const tests = S.cart.filter((i) => i.type === 'test').reduce((a, i) => a + i.price * i.qty, 0);
    const discount = Math.round(meds * 0.1);
    const delivery = meds > 0 ? 50 : 0;
    return { meds, tests, discount, delivery, total: meds + tests - discount + delivery };
  }
  function renderCart() {
    const t = cartTotals();
    drawer.innerHTML = `
      <div class="drawer-head"><h3>Your cart</h3><button class="icon-btn" data-action="close-cart" aria-label="Close">${icon('x')}</button></div>
      <div class="drawer-body">
        ${S.cart.length === 0 ? `<div class="empty">${icon('cart', 'xl')}<p style="margin-top:10px">Your cart is empty.</p><p class="small faint">Order medicines from your prescription in the patient portal.</p></div>` :
          S.cart.map((i) => `
          <div class="list-row">
            <span style="color:${i.type === 'med' ? 'var(--green)' : '#9a6400'}">${icon(i.type === 'med' ? 'pill' : 'flask', 'lg')}</span>
            <div class="grow"><div class="bold">${esc(i.name)}</div><div class="small muted">${esc(i.sub || '')}</div></div>
            <div class="qty"><button data-action="cart-qty" data-key="${esc(i.key)}" data-d="-1" aria-label="Less">−</button><span>${i.qty}</span><button data-action="cart-qty" data-key="${esc(i.key)}" data-d="1" aria-label="More">+</button></div>
            <div class="price" style="min-width:64px;text-align:right">${money(i.price * i.qty)}</div>
          </div>`).join('')}
      </div>
      ${S.cart.length ? `<div class="drawer-foot">
        <div class="sum-line"><span>Medicines</span><b>${money(t.meds)}</b></div>
        ${t.discount ? `<div class="sum-line"><span>Carnival Care discount (10%)</span><b style="color:var(--green-2)">− ${money(t.discount)}</b></div>` : ''}
        ${t.tests ? `<div class="sum-line"><span>Lab tests</span><b>${money(t.tests)}</b></div>` : ''}
        ${t.delivery ? `<div class="sum-line"><span>Home delivery</span><b>${money(t.delivery)}</b></div>` : ''}
        <div class="sum-total"><span>Total</span><span>${money(t.total)}</span></div>
        <button class="btn primary block lg" style="margin-top:14px" data-action="checkout">${icon('lock', 'sm')} Checkout</button>
      </div>` : ''}`;
  }
  function openCart() { renderCart(); drawer.hidden = false; backdrop.hidden = false; }
  function closeCart() { drawer.hidden = true; backdrop.hidden = true; }

  function addToCart(items) {
    items.forEach((it) => {
      const ex = S.cart.find((c) => c.key === it.key);
      if (ex) ex.qty = it.qty; else S.cart.push(it);
    });
    save();
    updateCartBadge(true);
  }

  // ---------- Router ----------
  const routes = {
    '/': viewHome,
    '/doctor': viewBooking,
    '/booked': viewBooked,
    '/consult': viewConsult,
    '/dashboard': viewDashboard,
    '/prescription': viewRx,
    '/doctor-portal': viewDoctorPortal,
  };
  const navMap = { '/': 'home', '/doctor': 'home', '/booked': 'home', '/dashboard': 'dashboard', '/prescription': 'dashboard', '/doctor-portal': 'doctor-portal', '/consult': '' };
  function parse() {
    const h = location.hash.replace(/^#/, '') || '/';
    const [path, qs] = h.split('?');
    const parts = path.split('/').filter(Boolean);
    return { base: '/' + (parts[0] || ''), param: parts[1], query: new URLSearchParams(qs || '') };
  }
  function route() {
    runTeardown();
    closeModal();
    closeCart();
    ui.call = null;
    const r = parse();
    const fn = routes[r.base] || viewHome;
    document.body.classList.toggle('in-call', r.base === '/consult');
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === navMap[r.base]));
    fn(r);
    window.scrollTo({ top: 0, behavior: 'instant' });
    app.focus({ preventScroll: true });
  }
  function go(hash) {
    if (location.hash === hash) route(); else location.hash = hash;
  }
  function rerender() {
    const y = window.scrollY;
    const r = parse();
    (routes[r.base] || viewHome)(r);
    window.scrollTo({ top: y, behavior: 'instant' });
  }

  // ---------- Shared builders ----------
  function newDraft(apptId) {
    return { apptId, complaints: [], vitals: null, diagnosis: '', medicines: [], tests: [], advice: [], referral: null, followUp: '', signed: false };
  }
  const addAll = (arr, items) => items.forEach((x) => { if (!arr.includes(x)) arr.push(x); });
  const addMed = (x, m) => { if (m && !x.medicines.some((n) => n.name === m.name)) x.medicines.push(Object.assign({}, m)); };
  const addTest = (x, t) => { if (t && !x.tests.some((n) => n.name === t.name)) x.tests.push(Object.assign({}, t)); };
  function fillAll(x) {
    addAll(x.complaints, R.complaints);
    x.vitals = x.vitals || Object.assign({}, R.vitals);
    x.diagnosis = x.diagnosis || R.diagnosis;
    R.medicines.forEach((m) => addMed(x, m));
    R.tests.forEach((t) => addTest(x, t));
    addAll(x.advice, R.advice);
    x.referral = x.referral || Object.assign({}, R.referral);
    x.followUp = x.followUp || R.followUp;
  }

  function defaultAppointment(doctorId) {
    const d = docById(doctorId || 'd1');
    return { id: rid('APT'), doctorId: d.id, date: today(), dayLabel: 'Today', time: d.next.split(', ')[1] || '4:30 PM', mode: 'Video', symptoms: ['Fever', 'Headache'], fee: d.fee, total: d.fee + 30, status: 'upcoming' };
  }

  function finalizeConsult() {
    if (!S.appointment) { S.appointment = defaultAppointment(); S.upcoming.unshift(S.appointment); }
    if (!S.draft || S.draft.apptId !== S.appointment.id) S.draft = newDraft(S.appointment.id);
    if (!S.draft.signed) { fillAll(S.draft); S.draft.signed = true; }
    const n = 1042 + (S.rx ? 1 : 0);
    S.rx = Object.assign({}, JSON.parse(JSON.stringify(S.draft)), {
      id: 'RX-' + n,
      doctorId: S.appointment.doctorId,
      date: today(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    });
    S.appointment.status = 'completed';
    const u = S.upcoming.find((a) => a.id === S.appointment.id);
    if (u) u.status = 'completed';
    ui.dash = null;
    save();
  }

  // ======================================================
  // 1. LANDING — doctors across departments
  // ======================================================
  function viewHome() {
    const d1 = docById('d1');
    app.innerHTML = `
    <section class="hero">
      <div class="container hero-grid">
        <div>
          <span class="pill">${icon('stethoscope', 'sm')} Consultation · Diagnostic · Medicine</span>
          <h1 style="margin-top:18px">Consult top doctors <em>effortlessly</em>, from anywhere.</h1>
          <p class="lede">Pick a specialist, book a slot in seconds, see them on video — and get your prescription, medicines and lab tests in one place.</p>
          <div class="hero-cta">
            <button class="btn primary lg" data-action="scroll-doctors">${icon('search')} Find a doctor</button>
            <a class="btn outline lg" href="#/dashboard">${icon('grid')} Patient portal</a>
          </div>
          <div class="hero-stats">
            <div><b>${D.doctors.length}+</b><span>Specialist doctors</span></div>
            <div><b>${D.departments.length}</b><span>Departments</span></div>
            <div><b>~7 min</b><span>Average wait time</span></div>
          </div>
        </div>
        <div class="hero-visual" aria-hidden="true">
          <div class="hv-card hv-call">
            <span class="tag pill" style="background:rgba(237,28,36,.92);color:#fff"><span class="live-dot"></span> Live consultation</span>
            <div class="doc"><span class="speaking">${avatar(d1)}</span></div>
            <div class="ctrls"><span>${icon('mic', 'sm')}</span><span>${icon('video', 'sm')}</span><span class="end">${icon('phone', 'sm')}</span></div>
          </div>
          <div class="hv-card hv-book">
            <span class="mini-check">${icon('check', 'sm')}</span>
            <div><div class="bold small">Appointment confirmed</div><div class="tiny muted">${d1.name} · ${d1.next}</div></div>
          </div>
          <div class="hv-card hv-rx">
            <div class="row between"><b class="small">${icon('file', 'sm')} e-Prescription</b><span class="pill tiny">Signed</span></div>
            ${R.medicines.slice(0, 3).map((m, i) => `<div class="rx-med" style="padding:7px 0"><span class="n">${i + 1}</span><div><b class="small">${m.name}</b><div class="sub">${m.dose} · ${m.duration}</div></div></div>`).join('')}
          </div>
        </div>
      </div>
    </section>

    <div class="container">
      <div class="search-card">
        <div class="search-row">
          <label class="field">${icon('search')}<input id="q" type="search" placeholder="Search doctor, specialty or hospital" value="${esc(ui.q)}" autocomplete="off" aria-label="Search doctors" /></label>
          <button class="btn ${ui.online ? 'primary' : 'outline'}" style="height:52px" data-action="toggle-online" aria-pressed="${ui.online}"><span class="live-dot" style="animation:none"></span> Available now</button>
        </div>
        <div class="dept-strip" id="deptStrip"></div>
      </div>
    </div>

    <section class="section" id="doctors">
      <div class="container">
        <div class="section-head">
          <div><div class="eyebrow">Our specialists</div><h2 id="docHeading">All doctors</h2></div>
          <p class="muted" id="docCount"></p>
        </div>
        <div class="doc-grid" id="docGrid"></div>
      </div>
    </section>

    <section class="section" style="padding-top:8px">
      <div class="container">
        <div class="section-head"><div><div class="eyebrow">How it works</div><h2>Care in four simple steps</h2></div></div>
        <div class="steps">
          ${[
            ['search', 'Choose a doctor', 'Browse specialists across departments by rating, fee and availability.'],
            ['calendar', 'Book a slot', 'Pick a time that suits you and pay securely with bKash, Nagad or card.'],
            ['video', 'Consult on video', 'Talk face-to-face. Your doctor writes the prescription live during the call.'],
            ['pill', 'Medicines & tests', 'Order medicines and book home sample collection straight from your prescription.'],
          ].map(([ic, t, p]) => `<div class="card step"><div class="ico">${icon(ic, 'lg')}</div><h4>${t}</h4><p class="muted small">${p}</p></div>`).join('')}
        </div>
        <div class="band" style="margin-top:28px">
          <div><h3>Already booked a consultation?</h3><p>Join your doctor's waiting room or see your prescriptions in the patient portal.</p></div>
          <div class="row wrap" style="position:relative">
            <button class="btn primary lg" data-action="join-call">${icon('video')} Join consultation</button>
            <a class="btn outline lg" href="#/dashboard">Open patient portal</a>
          </div>
        </div>
      </div>
    </section>`;

    paintDepts();
    paintDoctors();
    $('#q').addEventListener('input', (e) => { ui.q = e.target.value; paintDoctors(); });
  }

  function paintDepts() {
    const count = (id) => D.doctors.filter((d) => id === 'all' || d.dept === id).length;
    $('#deptStrip').innerHTML = [{ id: 'all', name: 'All', icon: 'grid' }].concat(D.departments).map((x) =>
      `<button class="dept-chip ${ui.dept === x.id ? 'active' : ''}" data-action="dept" data-id="${x.id}">${icon(x.icon, 'sm')} ${x.name} <span class="count">${count(x.id)}</span></button>`
    ).join('');
  }

  function paintDoctors() {
    const q = ui.q.trim().toLowerCase();
    const list = D.doctors.filter((d) =>
      (ui.dept === 'all' || d.dept === ui.dept) &&
      (!ui.online || d.online) &&
      (!q || [d.name, d.title, d.hospital, deptById(d.dept).name].join(' ').toLowerCase().includes(q))
    );
    $('#docHeading').textContent = ui.dept === 'all' ? 'All doctors' : deptById(ui.dept).name + ' specialists';
    $('#docCount').textContent = list.length + (list.length === 1 ? ' doctor' : ' doctors') + (ui.online ? ' available now' : '');
    $('#docGrid').innerHTML = list.length ? list.map((d, i) => `
      <article class="card doc-card" style="animation-delay:${i * 35}ms" data-action="book-doc" data-id="${d.id}">
        <div class="doc-top">
          ${avatar(d, '', d.online)}
          <div class="grow"><div class="doc-name">${d.name}</div><div class="doc-title">${d.title}</div></div>
        </div>
        <div class="row wrap" style="gap:6px">
          <span class="pill navy">${icon(deptById(d.dept).icon, 'sm')} ${deptById(d.dept).name}</span>
          ${d.online ? '<span class="pill"><span class="live-dot"></span> Online</span>' : '<span class="pill gray">Offline</span>'}
        </div>
        <div class="doc-meta">
          <span>${icon('star', 'sm star')} <b>${d.rating}</b>&nbsp;(${d.reviews.toLocaleString()})</span>
          <span>${icon('award', 'sm')} ${d.exp} yrs exp.</span>
        </div>
        <div class="doc-meta"><span>${icon('pin', 'sm')} ${d.hospital}</span></div>
        <div class="next-slot">${icon('clock', 'sm')} Next available: ${d.next}</div>
        <div class="doc-foot">
          <div class="fee"><b>${money(d.fee)}</b><span>per consultation</span></div>
          <button class="btn primary sm" data-action="book-doc" data-id="${d.id}">Book now ${icon('arrow', 'sm')}</button>
        </div>
      </article>`).join('') :
      `<div class="card empty" style="grid-column:1/-1">${icon('search', 'xl')}<p style="margin-top:10px">No doctors match your search.</p><button class="btn ghost" data-action="clear-filters">Clear filters</button></div>`;
  }

  // ======================================================
  // 2. BOOKING
  // ======================================================
  const SLOT_TIMES = ['4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM'];
  const SYMPTOMS = ['Fever', 'Headache', 'Cough', 'Body ache', 'Sore throat', 'Stomach pain', 'Skin rash', 'Chest pain', 'Dizziness'];

  function nextDays() {
    const out = [];
    const base = new Date();
    for (let i = 0; i < 7; i++) {
      const dt = new Date(base);
      dt.setDate(base.getDate() + i);
      out.push({ dt, dow: i === 0 ? 'Today' : dt.toLocaleDateString('en-US', { weekday: 'short' }), num: dt.getDate(), mon: dt.toLocaleDateString('en-US', { month: 'short' }) });
    }
    return out;
  }
  const isTaken = (day, i) => (i * 7 + day * 3) % 5 === 0 || (day === 0 && i < 1);

  function viewBooking(r) {
    const d = docById(r.param) || docById('d1');
    const ref = r.query.get('ref');
    if (!ui.book || ui.book.docId !== d.id) {
      ui.book = { docId: d.id, day: 0, slot: null, mode: 'Video', syms: ref ? [] : ['Fever'], note: '', pay: 'bkash', files: 0 };
    }
    const b = ui.book;
    const dept = deptById(d.dept);
    const days = nextDays();
    const day = days[b.day];
    const refDoc = S.rx ? docById(S.rx.doctorId) : docById('d1');
    const fee = ref ? d.followUp : d.fee;

    app.innerHTML = `
    <div class="container page">
      <nav class="crumbs"><a href="#/">Home</a>${icon('chev', 'sm')}<a href="#/" data-action="dept-link" data-id="${dept.id}">${dept.name}</a>${icon('chev', 'sm')}<span>${d.name}</span></nav>
      ${ref ? `<div class="card card-pad row wrap" style="margin-bottom:20px;background:var(--mint);border-color:#cfe9da">
          <span style="color:var(--green-2)">${icon('refer', 'xl')}</span>
          <div class="grow"><b>${ref === 'followup' ? 'Follow-up consultation' : 'Referred by ' + refDoc.name}</b>
          <div class="small muted">${ref === 'followup' ? 'Bring your test reports. Your last prescription is shared automatically.' : esc(R.referral.reason) + '. Your prescription and reports are shared with the doctor automatically.'}</div></div>
          <span class="pill">Follow-up fee ${money(d.followUp)}</span></div>` : ''}
      <div class="book-grid">
        <div class="stack" style="gap:22px">
          <div class="card card-pad">
            <div class="profile-head">
              ${avatar(d, 'lg', d.online)}
              <div class="grow">
                <div class="row wrap" style="gap:6px;margin-bottom:6px"><span class="pill navy">${icon(dept.icon, 'sm')} ${dept.name}</span>${d.online ? '<span class="pill"><span class="live-dot"></span> Online now</span>' : ''}<span class="pill cyan">${icon('shield', 'sm')} BMDC verified</span></div>
                <h1>${d.name}</h1>
                <p class="muted">${d.title} · ${d.degrees}</p>
                <p class="small faint" style="margin-top:4px">${icon('pin', 'sm')} ${d.hospital}</p>
              </div>
            </div>
            <div class="facts">
              <div class="fact"><b>${d.exp} yrs</b><span>Experience</span></div>
              <div class="fact"><b>${icon('star', 'sm star')} ${d.rating}</b><span>${d.reviews.toLocaleString()} reviews</span></div>
              <div class="fact"><b>${(d.reviews * 3).toLocaleString()}+</b><span>Consultations</span></div>
              <div class="fact"><b style="font-size:16px">${d.languages.join(', ')}</b><span>Languages</span></div>
            </div>
          </div>

          <div class="card card-pad">
            <span class="label">1 · Consultation type</span>
            <div class="seg" style="margin-bottom:22px">
              ${[['Video', 'video'], ['Audio', 'phone'], ['Chat', 'message']].map(([m, ic]) => `<button class="${b.mode === m ? 'active' : ''}" data-action="pick-mode" data-v="${m}">${icon(ic, 'sm')} ${m}</button>`).join('')}
            </div>
            <span class="label">2 · Pick a date</span>
            <div class="days" style="margin-bottom:22px">
              ${days.map((x, i) => `<button class="day ${b.day === i ? 'active' : ''}" data-action="pick-day" data-v="${i}"><small>${x.dow}</small><b>${x.num}</b><small>${x.mon}</small></button>`).join('')}
            </div>
            <span class="label">3 · Pick a time <span class="faint small" style="font-weight:500">· ${SLOT_TIMES.filter((_, i) => !isTaken(b.day, i)).length} slots open</span></span>
            <div class="slots">
              ${SLOT_TIMES.map((t, i) => `<button class="slot ${isTaken(b.day, i) ? 'taken' : ''} ${b.slot === t ? 'active' : ''}" data-action="pick-slot" data-v="${t}" ${isTaken(b.day, i) ? 'disabled' : ''}>${t}</button>`).join('')}
            </div>
          </div>

          <div class="card card-pad">
            <span class="label">4 · What's bothering you?</span>
            <div class="sym-chips">
              ${SYMPTOMS.map((s) => `<button class="sym-chip ${b.syms.includes(s) ? 'on' : ''}" data-action="toggle-sym" data-v="${s}">${b.syms.includes(s) ? '✓ ' : '+ '}${s}</button>`).join('')}
            </div>
            <textarea class="input" id="note" rows="3" aria-label="Describe your symptoms" placeholder="Describe your symptoms, how long you've had them, and any medicines you take…">${esc(b.note)}</textarea>
            <div class="row wrap" style="margin-top:12px">
              <button class="btn outline sm" data-action="attach">${icon('upload', 'sm')} Attach reports</button>
              ${b.files ? `<span class="pill">${icon('file', 'sm')} ${b.files} file${b.files > 1 ? 's' : ''} attached</span>` : '<span class="small faint">Previous prescriptions, lab reports or photos (optional)</span>'}
            </div>
          </div>
        </div>

        <aside class="card card-pad summary">
          <div class="row">${avatar(d, 'md')}<div class="grow"><b>${d.name}</b><div class="small muted">${dept.name}</div></div></div>
          <div class="ticket" style="margin:16px 0 8px">
            <div><small>Date</small><b>${day.dow === 'Today' ? 'Today' : day.dow}, ${day.num} ${day.mon}</b></div>
            <div><small>Time</small><b>${b.slot || '<span class="faint">Select a slot</span>'}</b></div>
            <div><small>Type</small><b>${b.mode} consultation</b></div>
            <div><small>Duration</small><b>Up to 15 min</b></div>
          </div>
          <div class="sum-line"><span>${ref ? 'Follow-up fee' : 'Consultation fee'}</span><b>${money(fee)}</b></div>
          <div class="sum-line"><span>Service charge</span><b>${money(30)}</b></div>
          <div class="sum-total"><span>Total</span><span>${money(fee + 30)}</span></div>
          <span class="label" style="margin-top:18px">Pay with</span>
          <div class="pay-opts" style="margin-top:0">
            ${[['bkash', 'bKash', 'bkash'], ['nagad', 'Nagad', 'nagad'], ['card', 'Card', 'card-logo']].map(([k, n, c]) => `<button class="pay-opt ${b.pay === k ? 'active' : ''}" data-action="pick-pay" data-v="${k}" aria-label="${n}"><div class="logo ${c}">${k === 'card' ? icon('wallet') + '&nbsp;Card' : n}</div></button>`).join('')}
          </div>
          <button class="btn primary block lg" data-action="confirm-booking" ${b.slot ? '' : 'disabled'}>${b.slot ? `Confirm & pay ${money(fee + 30)}` : 'Select a time slot'}</button>
          <p class="small faint" style="margin-top:12px;display:flex;gap:6px">${icon('shield', 'sm')} Full refund if the doctor doesn't join within 15 minutes.</p>
        </aside>
      </div>
    </div>`;
    $('#note').addEventListener('input', (e) => { b.note = e.target.value; });
  }

  function confirmBooking() {
    const b = ui.book;
    const d = docById(b.docId);
    const ref = parse().query.get('ref');
    const day = nextDays()[b.day];
    const fee = ref ? d.followUp : d.fee;
    processing(`Processing payment via ${b.pay === 'card' ? 'card' : b.pay === 'nagad' ? 'Nagad' : 'bKash'}…`);
    setTimeout(() => {
      const appt = {
        id: rid('APT'), doctorId: d.id, date: fmtDate(day.dt), dayLabel: day.dow, time: b.slot, mode: b.mode,
        symptoms: b.syms.slice(), fee, total: fee + 30, status: 'upcoming', referral: !!ref,
      };
      S.upcoming.unshift(appt);
      S.appointment = appt;
      save();
      ui.book = null;
      go('#/booked');
    }, 1500);
  }

  function viewBooked() {
    const a = S.appointment;
    if (!a) { go('#/'); return; }
    const d = docById(a.doctorId);
    app.innerHTML = `
    <div class="container">
      <div class="card success">
        <div class="check-burst">${icon('check', 'xl')}</div>
        <h1 style="font-size:32px">Appointment confirmed!</h1>
        <p class="muted" style="margin-top:8px">We've sent the details by SMS. You'll get a reminder 15 minutes before your consultation.</p>
        <div class="ticket">
          <div><small>Appointment ID</small><b>${a.id}</b></div>
          <div><small>Doctor</small><b>${d.name}</b></div>
          <div><small>Date & time</small><b>${a.dayLabel === 'Today' ? 'Today' : a.date}, ${a.time}</b></div>
          <div><small>Type</small><b>${a.mode} consultation</b></div>
          <div><small>Symptoms</small><b>${a.symptoms.length ? a.symptoms.join(', ') : '—'}</b></div>
          <div><small>Paid</small><b>${money(a.total)}</b></div>
        </div>
        <div class="row wrap" style="justify-content:center">
          <button class="btn primary lg" data-action="join-call">${icon('video')} Join waiting room</button>
          <a class="btn outline lg" href="#/dashboard">Go to patient portal</a>
        </div>
        <p class="small faint" style="margin-top:16px">${icon('zap', 'sm')} Demo: ${d.name} is ready — you can join right away.</p>
      </div>
    </div>`;
  }

  // ======================================================
  // 3 + 4. CONSULTATION — video call + live prescription
  // ======================================================
  function buildScript(d) {
    const fn = firstName(d);
    const refDoc = docById(R.referral.doctorId);
    return [
      { who: 'sys', text: `${d.name} joined the consultation` },
      { who: 'doc', text: `Hello Arif, I'm Dr. ${fn}. I've read the symptoms you shared — tell me, how are you feeling?` },
      { who: 'pt', text: "I've had fever on and off for 4 days, with a headache and body ache.", apply: (x) => addAll(x.complaints, R.complaints.slice(0, 2)) },
      { who: 'doc', text: 'Any cough, vomiting, rash or bleeding?' },
      { who: 'pt', text: 'A mild dry cough. No vomiting or rash.', apply: (x) => addAll(x.complaints, [R.complaints[2]]) },
      { who: 'doc', text: 'Your vitals synced from your device — temperature 100.8 °F, pulse 92.', apply: (x) => { x.vitals = Object.assign({}, R.vitals); } },
      { who: 'doc', text: 'This looks like a viral fever, but this season we must rule out dengue.', apply: (x) => { x.diagnosis = R.diagnosis; } },
      { who: 'doc', text: 'Take Napa Extend twice a day for the fever, after meals.', apply: (x) => addMed(x, R.medicines[0]) },
      { who: 'doc', text: "I'm adding Fexo at night, and Seclo to protect your stomach.", apply: (x) => { addMed(x, R.medicines[1]); addMed(x, R.medicines[2]); } },
      { who: 'doc', text: 'Keep Orsaline-N handy and drink plenty of fluids.', apply: (x) => addMed(x, R.medicines[3]) },
      { who: 'doc', text: 'Please do a CBC, Dengue NS1, SGPT and urine test. You can book home sample collection from your portal.', apply: (x) => R.tests.forEach((t) => addTest(x, t)) },
      { who: 'doc', text: 'Rest well, avoid painkillers like ibuprofen, and come back right away if you notice any bleeding.', apply: (x) => addAll(x.advice, R.advice) },
      { who: 'doc', text: `If your SGPT is high, please see ${refDoc.name}, our liver specialist. I've added a referral.`, apply: (x) => { x.referral = Object.assign({}, R.referral); } },
      { who: 'doc', text: "I've signed your prescription — it's already in your portal. Get well soon, Arif!", apply: (x) => { x.followUp = R.followUp; x.signed = true; } },
    ];
  }

  function viewConsult(r) {
    if (!S.appointment || S.appointment.status === 'completed') {
      const keep = S.appointment ? S.appointment.doctorId : null;
      S.appointment = defaultAppointment(keep || 'd1');
      S.upcoming.unshift(S.appointment);
    }
    const appt = S.appointment;
    if (!S.draft || S.draft.apptId !== appt.id || S.draft.signed) S.draft = newDraft(appt.id);
    save();
    const d = docById(appt.doctorId);
    const as = r.query.get('as') === 'doctor' ? 'doctor' : 'patient';
    const c = ui.call = {
      d, view: as, tab: 'rx', step: 0, playing: as === 'patient', chat: [], start: Date.now(),
      mic: true, cam: false, stream: null, medQ: '', script: buildScript(d), caption: '', seen: new Set(),
    };

    app.innerHTML = `
    <div class="call-page">
      <div class="call-layout">
        <div class="call-stage">
          <div class="call-top">
            <div class="who" id="who"></div>
            <div class="row wrap" style="gap:10px;justify-content:flex-end">
              <div class="seg dark" id="viewSeg"></div>
              <span class="timer"><span class="live-dot"></span><span id="timer">00:00</span></span>
            </div>
          </div>
          <div class="video-main" id="stage"></div>
          <div class="call-ctrls" id="ctrls"></div>
        </div>
        <div class="call-side" id="side"></div>
      </div>
    </div>`;

    paintCall();

    const timer = setInterval(() => { const t = $('#timer'); if (t) t.textContent = mmss(Date.now() - c.start); }, 1000);
    let tick = null;
    const kickoff = setTimeout(() => {
      tick = setInterval(() => { if (c.playing) runStep(); }, 2700);
      if (c.playing) runStep();
    }, 1200);
    teardown.push(() => clearInterval(timer), () => clearInterval(tick), () => clearTimeout(kickoff), stopCamera);
  }

  function paintCall() {
    const c = ui.call;
    $('#viewSeg').innerHTML = `
      <button class="${c.view === 'patient' ? 'active' : ''}" data-action="call-view" data-v="patient">${icon('user', 'sm')} Patient view</button>
      <button class="${c.view === 'doctor' ? 'active' : ''}" data-action="call-view" data-v="doctor">${icon('stethoscope', 'sm')} Doctor view</button>`;
    paintWho();
    paintStage();
    paintCtrls();
    paintSide();
  }

  function paintWho() {
    const c = ui.call;
    $('#who').innerHTML = c.view === 'patient'
      ? `${avatar(c.d, 'md')}<div><b>${c.d.name}</b><div class="small" style="color:#b9c5de">${deptById(c.d.dept).name} · ${c.d.hospital}</div></div>`
      : `${avatar(PT, 'md')}<div><b>${PT.name}</b><div class="small" style="color:#b9c5de">${PT.age} yrs · ${PT.sex} · ${PT.blood} · ${PT.id}</div></div>`;
  }

  function paintStage() {
    const c = ui.call;
    const remote = c.view === 'patient' ? c.d : PT;
    const self = c.view === 'patient' ? PT : c.d;
    $('#stage').innerHTML = `
      <span class="speaking" id="remoteAv">${avatar(remote)}</span>
      <div class="name-tag">${icon('mic', 'sm')} ${remote.name}</div>
      <div class="net">${icon('signal', 'sm')} HD · Encrypted</div>
      <div class="caption-bar" id="caption" ${c.caption ? '' : 'style="opacity:0"'}>${c.caption}</div>
      <div class="self-view">
        ${c.view === 'patient' && c.stream ? '<video id="selfVideo" autoplay muted playsinline></video>' : avatar(self, 'lg')}
        <span class="lbl">You${c.mic ? '' : ' · muted'}</span>
      </div>`;
    const v = $('#selfVideo');
    if (v && c.stream) v.srcObject = c.stream;
  }

  function paintCtrls() {
    const c = ui.call;
    const done = c.step >= c.script.length;
    $('#ctrls').innerHTML = `
      <button class="cbtn ${c.mic ? '' : 'off'}" data-action="toggle-mic" title="${c.mic ? 'Mute' : 'Unmute'}" aria-label="Toggle microphone">${icon(c.mic ? 'mic' : 'micOff', 'lg')}</button>
      <button class="cbtn ${c.cam ? '' : 'off'}" data-action="toggle-cam" title="Camera" aria-label="Toggle camera">${icon(c.cam ? 'video' : 'videoOff', 'lg')}</button>
      <button class="cbtn" data-action="share-screen" title="Share screen" aria-label="Share screen">${icon('monitor', 'lg')}</button>
      <button class="cbtn" data-action="side-tab" data-tab="chat" title="Chat" aria-label="Open chat">${icon('message', 'lg')}</button>
      <button class="cbtn" data-action="toggle-play" title="${c.playing ? 'Pause demo script' : 'Play demo script'}" aria-label="Toggle demo autoplay" ${done ? 'disabled' : ''}>${icon(c.playing ? 'pause' : 'play', 'lg')}</button>
      <button class="cbtn" data-action="fast-forward" title="Skip to signed prescription" aria-label="Fast-forward demo" ${done ? 'disabled' : ''}>${icon('zap', 'lg')}</button>
      <button class="cbtn end" data-action="end-call" title="End consultation" aria-label="End call">${icon('phone', 'lg')}</button>`;
  }

  function runStep(silent) {
    const c = ui.call;
    if (!c || c.step >= c.script.length) return;
    const s = c.script[c.step++];
    const x = S.draft;
    const wasSigned = x.signed;
    if (s.apply) s.apply(x);
    c.chat.push({ who: s.who, text: s.text });
    if (!silent && s.who !== 'sys') {
      const name = s.who === 'doc' ? 'Dr. ' + firstName(c.d) : 'Arif';
      c.caption = `<b>${name}:</b> ${esc(s.text)}`;
      const cap = $('#caption');
      if (cap) { cap.innerHTML = c.caption; cap.style.opacity = 1; }
      const av = $('#remoteAv');
      const remoteSpeaks = (c.view === 'patient') === (s.who === 'doc');
      if (av) av.classList.toggle('speaking', remoteSpeaks);
    }
    save();
    if (!silent) {
      paintSide(true);
      if (!wasSigned && x.signed) onSigned();
    }
    if (c.step >= c.script.length) { c.playing = false; if (!silent) paintCtrls(); }
  }

  function onSigned() {
    const c = ui.call;
    c.chat.push({ who: 'sys', text: 'Prescription signed & shared with patient' });
    toast(c.view === 'doctor' ? 'Prescription signed & sent to Arif' : `Prescription received from Dr. ${firstName(c.d)}`, 'file');
    paintSide(true);
    paintCtrls();
  }

  // Animate only items that appear for the first time during this call.
  const nw = (k) => {
    const s = ui.call && ui.call.seen;
    if (!s || s.has(k)) return '';
    s.add(k);
    return ' new';
  };

  function paintSide(scrollEnd) {
    const c = ui.call;
    const side = $('#side');
    if (!c || !side) return;
    const prev = $('#sideBody');
    const keepScroll = prev ? prev.scrollTop : 0;
    if (c.view === 'doctor') {
      side.innerHTML = composerHTML();
    } else {
      const x = S.draft;
      side.innerHTML = `
        <div class="side-tabs" role="tablist">
          <button class="${c.tab === 'rx' ? 'active' : ''}" role="tab" aria-selected="${c.tab === 'rx'}" data-action="side-tab" data-tab="rx">${icon('file', 'sm')} Prescription ${x.medicines.length ? `<span class="count">${x.medicines.length}</span>` : ''}</button>
          <button class="${c.tab === 'chat' ? 'active' : ''}" role="tab" aria-selected="${c.tab === 'chat'}" data-action="side-tab" data-tab="chat">${icon('message', 'sm')} Chat ${c.chat.length ? `<span class="count">${c.chat.length}</span>` : ''}</button>
        </div>
        <div class="side-body" id="sideBody">${c.tab === 'rx' ? liveRxHTML(x, c.d) : chatHTML()}</div>
        <div class="side-foot">${c.tab === 'chat'
          ? `<form id="chatForm" class="row"><label class="field" style="height:44px"><input id="chatInput" placeholder="Type a message…" autocomplete="off" aria-label="Message" /></label><button class="btn primary" style="width:44px;padding:0" aria-label="Send">${icon('send', 'sm')}</button></form>`
          : x.signed
            ? `<div class="row between"><span class="small" style="color:var(--green-2);font-weight:600">${icon('check', 'sm')} Saved to your patient portal</span><button class="btn primary sm" data-action="end-call">Finish & view</button></div>`
            : `<div class="small faint row">${icon('pen', 'sm')} Updates live as your doctor writes</div>`}
        </div>`;
    }
    const body = $('#sideBody');
    if (body) body.scrollTop = scrollEnd ? body.scrollHeight : keepScroll;
  }

  function vitalPills(v) {
    return `<div class="row wrap" style="gap:6px">${Object.entries({ BP: v.bp, Pulse: v.pulse, Temp: v.temp, SpO2: v.spo2 }).map(([k, val]) => `<span class="pill gray">${k} <b style="color:var(--navy)">${val}</b></span>`).join('')}</div>`;
  }

  function liveRxHTML(x, d) {
    const empty = !x.complaints.length && !x.diagnosis && !x.medicines.length;
    if (empty) {
      return `<div class="rx-live-empty"><div class="pulse">${icon('pen', 'xl')}</div><b style="color:var(--navy)">Your e-prescription will appear here</b><p class="small" style="margin-top:6px">${d.name} writes it during the call — you'll see each item as it's added.</p><div class="typing" style="margin-top:14px"><i></i><i></i><i></i></div></div>`;
    }
    const ref = x.referral && docById(x.referral.doctorId);
    return `
      <div class="row between" style="margin-bottom:14px">
        <div><b style="font-family:var(--font-display);font-size:17px">e-Prescription</b><div class="tiny faint">${d.name} · ${today()}</div></div>
        ${x.signed ? `<span class="pill">${icon('check', 'sm')} Signed</span>` : '<span class="pill amber"><span class="typing"><i></i><i></i><i></i></span> Writing</span>'}
      </div>
      ${x.complaints.length ? `<div class="rx-sec${nw('s:complaints')}"><h5>Chief complaints</h5><ul style="margin:0;padding-left:18px">${x.complaints.map((t) => `<li class="small">${esc(t)}</li>`).join('')}</ul></div>` : ''}
      ${x.vitals ? `<div class="rx-sec${nw('s:vitals')}"><h5>Vitals</h5>${vitalPills(x.vitals)}</div>` : ''}
      ${x.diagnosis ? `<div class="rx-sec${nw('s:dx')}"><h5>Diagnosis</h5><b>${esc(x.diagnosis)}</b></div>` : ''}
      ${x.medicines.length ? `<div class="rx-sec${nw('s:meds')}"><h5>Medicines</h5>${x.medicines.map((m, i) => `
        <div class="rx-med${nw('m:' + m.name)}"><span class="n">${i + 1}</span><div class="grow"><b>${esc(m.name)}</b><div class="sub">${esc(m.generic)}</div><div class="small"><span class="dose">${esc(m.dose)}</span> · ${esc(m.duration)} · ${esc(m.note)}</div></div></div>`).join('')}</div>` : ''}
      ${x.tests.length ? `<div class="rx-sec${nw('s:tests')}"><h5>Investigations</h5>${x.tests.map((t) => `<div class="row small" style="padding:4px 0;gap:8px">${icon('flask', 'sm')} ${esc(t.name)}</div>`).join('')}</div>` : ''}
      ${x.advice.length ? `<div class="rx-sec${nw('s:advice')}"><h5>Advice</h5><ul style="margin:0;padding-left:18px">${x.advice.map((t) => `<li class="small">${esc(t)}</li>`).join('')}</ul></div>` : ''}
      ${ref ? `<div class="rx-sec${nw('s:ref')}"><h5>Referral</h5><div class="row">${avatar(ref, 'sm')}<div><b class="small">${ref.name}</b><div class="tiny muted">${esc(x.referral.reason)}</div></div></div></div>` : ''}
      ${x.followUp ? `<div class="rx-sec${nw('s:fu')}"><h5>Follow-up</h5><span class="small">${esc(x.followUp)}</span></div>` : ''}`;
  }

  function chatHTML() {
    const c = ui.call;
    if (!c.chat.length) return `<div class="rx-live-empty">${icon('message', 'xl')}<p class="small" style="margin-top:8px">Messages and shared files appear here.</p></div>`;
    const mine = c.view === 'patient' ? 'pt' : 'doc';
    return `<div class="chat">${c.chat.map((m, i) => `<div class="msg ${m.who === 'sys' ? 'sys' : m.who === mine ? 'me' : 'them'}${nw('c:' + i)}">${esc(m.text)}</div>`).join('')}</div>`;
  }

  // Doctor-side prescription composer
  function composerHTML() {
    const x = S.draft;
    const c = ui.call;
    const appt = S.appointment;
    const q = c.medQ.trim().toLowerCase();
    const medSug = MED_LIB.filter((m) => !q || (m.name + ' ' + m.generic).toLowerCase().includes(q));
    const others = D.doctors.filter((d) => d.id !== c.d.id);
    return `
      <div class="dw-head">
        ${avatar(PT, 'md')}
        <div class="grow"><b>${PT.name}</b><div class="small muted">${PT.age} yrs · ${PT.sex} · Blood ${PT.blood} · ${PT.weight}</div></div>
        <span class="pill ${x.signed ? '' : 'amber'}">${x.signed ? icon('check', 'sm') + ' Signed' : icon('pen', 'sm') + ' Draft'}</span>
      </div>
      <div class="side-body dw-form${x.signed ? ' locked' : ''}" id="sideBody">
        ${appt && appt.symptoms && appt.symptoms.length ? `<div class="small" style="background:var(--cyan-soft);padding:10px 12px;border-radius:10px;color:#05587d">${icon('clipboard', 'sm')} Reported at booking: <b>${appt.symptoms.map(esc).join(', ')}</b></div>` : ''}

        <label>Chief complaints</label>
        <div class="sym-chips" style="margin:0">
          ${x.complaints.map((t, i) => `<button class="sym-chip on" data-action="dw-remove" data-kind="complaints" data-i="${i}" title="Remove">✓ ${esc(t)}</button>`).join('')}
          ${COMPLAINT_LIB.filter((t) => !x.complaints.includes(t)).map((t) => `<button class="sym-chip" data-action="dw-add" data-kind="complaint" data-v="${esc(t)}">+ ${esc(t)}</button>`).join('')}
        </div>

        <label>Vitals</label>
        ${x.vitals ? vitalPills(x.vitals) : `<button class="btn outline sm" data-action="dw-add" data-kind="vitals">${icon('activity', 'sm')} Pull vitals from patient device</button>`}

        <label for="dxInput">Diagnosis</label>
        <div class="field">${icon('clipboard', 'sm')}<input id="dxInput" value="${esc(x.diagnosis)}" placeholder="e.g. Viral fever" autocomplete="off" /></div>

        <label for="medQ">Medicines · ${x.medicines.length}</label>
        <div class="mini-list">${x.medicines.map((m, i) => `<div class="mini-item${nw('dm:' + m.name)}"><div><b>${esc(m.name)}</b> <span class="muted">· <span class="dose">${esc(m.dose)}</span> · ${esc(m.duration)}</span></div><button data-action="dw-remove" data-kind="medicines" data-i="${i}" aria-label="Remove ${esc(m.name)}">${icon('x', 'sm')}</button></div>`).join('')}</div>
        <div class="field" style="margin-top:8px">${icon('search', 'sm')}<input id="medQ" value="${esc(c.medQ)}" placeholder="Search medicine by brand or generic" autocomplete="off" /></div>
        <div class="suggest" id="medSuggest">${medSugHTML(medSug, x)}</div>

        <label>Investigations · ${x.tests.length}</label>
        <div class="mini-list">${x.tests.map((t, i) => `<div class="mini-item${nw('dt:' + t.name)}"><div>${icon('flask', 'sm')} ${esc(t.name)}</div><button data-action="dw-remove" data-kind="tests" data-i="${i}" aria-label="Remove ${esc(t.name)}">${icon('x', 'sm')}</button></div>`).join('')}</div>
        <div class="sym-chips" style="margin-top:8px">${TEST_LIB.filter((t) => !x.tests.some((n) => n.name === t.name)).map((t) => `<button class="sym-chip" data-action="dw-add" data-kind="test" data-v="${esc(t.name)}">+ ${esc(t.name)}</button>`).join('')}</div>

        <label>Advice</label>
        <div class="mini-list">${x.advice.map((t, i) => `<div class="mini-item${nw('da:' + t)}"><div>${esc(t)}</div><button data-action="dw-remove" data-kind="advice" data-i="${i}" aria-label="Remove advice">${icon('x', 'sm')}</button></div>`).join('')}</div>
        <div class="sym-chips" style="margin-top:8px">${ADVICE_LIB.filter((t) => !x.advice.includes(t)).map((t) => `<button class="sym-chip" data-action="dw-add" data-kind="advice" data-v="${esc(t)}">+ ${esc(t.length > 38 ? t.slice(0, 36) + '…' : t)}</button>`).join('')}</div>

        <label for="refSel">Refer to specialist</label>
        <div class="field">${icon('refer', 'sm')}<select id="refSel"><option value="">No referral</option>${others.map((d) => `<option value="${d.id}" ${x.referral && x.referral.doctorId === d.id ? 'selected' : ''}>${d.name} — ${deptById(d.dept).name}</option>`).join('')}</select></div>

        <label for="fuInput">Follow-up</label>
        <div class="field">${icon('calendar', 'sm')}<input id="fuInput" value="${esc(x.followUp)}" placeholder="e.g. After 5 days with reports" autocomplete="off" /></div>
      </div>
      <div class="side-foot row">
        <button class="btn outline sm" data-action="dw-autofill" title="Fill the rest of the prescription" ${x.signed ? 'disabled' : ''}>${icon('zap', 'sm')} Auto-fill</button>
        <button class="btn primary grow" data-action="dw-sign" ${x.signed ? 'disabled' : ''}>${icon('pen', 'sm')} ${x.signed ? 'Signed & sent' : 'Sign & send to patient'}</button>
      </div>`;
  }
  function medSugHTML(list, x) {
    if (!list.length) return '<div class="small faint" style="padding:10px 12px">No match in formulary</div>';
    return list.slice(0, 5).map((m) => {
      const used = x.medicines.some((n) => n.name === m.name);
      return `<button class="${used ? 'used' : ''}" data-action="dw-add" data-kind="med" data-v="${esc(m.name)}" ${used ? 'disabled' : ''}><span><b>${esc(m.name)}</b> <span class="faint">${esc(m.generic)}</span></span><span class="small" style="color:var(--green-2);white-space:nowrap">${used ? 'Added' : '+ Add'}</span></button>`;
    }).join('');
  }

  function startCamera() {
    const c = ui.call;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast('Camera not available here — showing avatar', 'videoOff');
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((stream) => {
      if (ui.call !== c) { stream.getTracks().forEach((t) => t.stop()); return; }
      c.stream = stream;
      c.cam = true;
      paintStage();
      paintCtrls();
    }).catch(() => toast('Camera permission denied — showing avatar', 'videoOff'));
  }
  function stopCamera() {
    const c = ui.call;
    if (c && c.stream) { c.stream.getTracks().forEach((t) => t.stop()); c.stream = null; }
    if (c) c.cam = false;
  }

  function endCall() {
    const c = ui.call;
    const dur = mmss(Date.now() - c.start);
    const asDoctor = c.view === 'doctor';
    while (c.step < c.script.length) runStep(true);
    finalizeConsult();
    runTeardown();
    openModal(`
      <div class="modal-pad" style="text-align:center">
        <div class="check-burst" style="width:72px;height:72px">${icon('check', 'xl')}</div>
        <h2>Consultation completed</h2>
        <p class="muted" style="margin-top:6px">${asDoctor ? `Prescription ${S.rx.id} was sent to ${PT.name}.` : `Your e-prescription from ${c.d.name} is ready in your patient portal.`}</p>
        <div class="ticket" style="text-align:left">
          <div><small>Duration</small><b>${dur}</b></div>
          <div><small>Prescription</small><b>${S.rx.id}</b></div>
          <div><small>Medicines</small><b>${S.rx.medicines.length} prescribed</b></div>
          <div><small>Lab tests</small><b>${S.rx.tests.length} ordered</b></div>
        </div>
        <div class="row wrap" style="justify-content:center">
          ${asDoctor
            ? `<a class="btn primary lg" href="#/doctor-portal">Back to doctor portal</a><a class="btn outline lg" href="#/dashboard">See patient portal</a>`
            : `<a class="btn primary lg" href="#/dashboard">${icon('grid')} Open patient portal</a><a class="btn outline lg" href="#/prescription">View prescription</a>`}
        </div>
      </div>`, 520);
  }

  // ======================================================
  // 5. PATIENT DASHBOARD
  // ======================================================
  function dashState() {
    const rx = S.rx;
    if (rx && (!ui.dash || ui.dash.rxId !== rx.id)) {
      ui.dash = {
        rxId: rx.id,
        meds: rx.medicines.map((m) => ({ on: true, qty: m.qty })),
        tests: rx.tests.map(() => true),
      };
    }
    return ui.dash;
  }

  function spark(vals, color) {
    const max = Math.max(...vals), min = Math.min(...vals);
    const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * 100},${26 - ((v - min) / (max - min || 1)) * 22}`).join(' ');
    return `<svg class="spark" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  const ORDER_STEPS = {
    Medicine: ['Placed', 'Packed', 'On the way', 'Delivered'],
    'Lab test': ['Booked', 'Collector assigned', 'Sample collected', 'Report ready'],
  };

  function viewDashboard() {
    const rx = S.rx;
    const ds = dashState();
    const rd = rx ? docById(rx.doctorId) : null;
    const upcoming = S.upcoming.filter((a) => a.status === 'upcoming');

    let medTotal = 0, medCount = 0, testTotal = 0, testCount = 0;
    if (rx) {
      rx.medicines.forEach((m, i) => { if (ds.meds[i].on) { medTotal += m.price * ds.meds[i].qty; medCount++; } });
      rx.tests.forEach((t, i) => { if (ds.tests[i]) { testTotal += t.price; testCount++; } });
    }
    const referralDoc = rx && rx.referral ? docById(rx.referral.doctorId) : null;
    const referralBooked = referralDoc && S.upcoming.find((a) => a.doctorId === referralDoc.id && a.status === 'upcoming');

    let hero;
    if (rx) {
      hero = `
        <div class="alert-card">
          <div class="ico">${icon('file', 'xl')}</div>
          <div class="grow" style="position:relative;z-index:1">
            <b style="font-family:var(--font-display);font-size:19px">New prescription from ${rd.name}</b>
            <p>${esc(rx.diagnosis)} · ${rx.medicines.length} medicines · ${rx.tests.length} tests${rx.referral ? ' · 1 referral' : ''}</p>
          </div>
          <a class="btn primary" href="#/prescription">View prescription ${icon('arrow', 'sm')}</a>
        </div>
        <div class="tiles">
          <a class="tile t-green" href="#/prescription"><span class="ico">${icon('file', 'lg')}</span><b>See prescription</b><span>${rx.id} · ${rx.date}</span></a>
          <button class="tile t-cyan" data-action="dash-scroll" data-target="medsCard"><span class="ico">${icon('pill', 'lg')}</span><b>Buy medicines</b><span>${rx.medicines.length} items · 10% off</span></button>
          <button class="tile t-amber" data-action="dash-scroll" data-target="testsCard"><span class="ico">${icon('flask', 'lg')}</span><b>Book lab tests</b><span>Free home collection</span></button>
          <button class="tile t-navy" data-action="dash-scroll" data-target="${referralDoc ? 'refCard' : 'apptCard'}"><span class="ico">${icon('refer', 'lg')}</span><b>Referred doctor</b><span>${referralDoc ? referralDoc.name : 'None'}</span></button>
        </div>`;
    } else if (upcoming.length) {
      const ud = docById(upcoming[0].doctorId);
      hero = `
        <div class="alert-card">
          <div class="ico">${icon('video', 'xl')}</div>
          <div class="grow" style="position:relative;z-index:1">
            <b style="font-family:var(--font-display);font-size:19px">Upcoming: ${ud.name}</b>
            <p>${upcoming[0].dayLabel === 'Today' ? 'Today' : upcoming[0].date}, ${upcoming[0].time} · ${upcoming[0].mode} consultation · Doctor is online</p>
          </div>
          <button class="btn primary" data-action="join-appt" data-id="${upcoming[0].id}">${icon('video', 'sm')} Join now</button>
        </div>`;
    } else {
      hero = `
        <div class="alert-card">
          <div class="ico">${icon('stethoscope', 'xl')}</div>
          <div class="grow" style="position:relative;z-index:1">
            <b style="font-family:var(--font-display);font-size:19px">No upcoming consultations</b>
            <p>Book a doctor, or load a finished consultation to explore the portal.</p>
          </div>
          <button class="btn primary" data-action="seed-demo">Load sample consultation</button>
        </div>`;
    }

    const ordersCard = S.orders.length ? `
      <div class="card">
        <div class="card-head"><h3>Orders</h3><span class="pill">${icon('truck', 'sm')} ${S.orders.length} active</span></div>
        ${S.orders.map((o) => {
          const steps = ORDER_STEPS[o.kind];
          const at = Math.min(steps.length - 1, 1 + Math.floor((Date.now() - o.placedAt) / 45000));
          return `<div class="list-row" style="display:block">
            <div class="row between wrap"><div><b>${o.kind === 'Medicine' ? 'Medicine delivery' : 'Home sample collection'}</b> <span class="faint small">· ${o.id}</span><div class="small muted">${o.items.length} items · ${money(o.total)}${o.slot ? ' · ' + o.slot : ''}</div></div><span class="pill ${at === steps.length - 1 ? '' : 'cyan'}">${steps[at]}</span></div>
            <div class="track">${steps.map((s, i) => `<div class="st ${i <= at ? 'done' : ''} ${i === at ? 'now' : ''}">${s}</div>`).join('')}</div>
          </div>`;
        }).join('')}
      </div>` : '';

    const medsCard = rx ? `
      <div class="card" id="medsCard">
        <div class="card-head"><div><h3>Medicines from your prescription</h3><p class="small muted">Delivered to your door in 2–4 hours</p></div><span class="pill">${icon('truck', 'sm')} Express</span></div>
        ${rx.medicines.map((m, i) => `
        <div class="list-row">
          <button class="check ${ds.meds[i].on ? 'on' : ''}" data-action="med-toggle" data-i="${i}" aria-pressed="${ds.meds[i].on}" aria-label="Select ${esc(m.name)}">${ds.meds[i].on ? icon('check', 'sm') : ''}</button>
          <div class="grow"><b>${esc(m.name)}</b><div class="small muted">${esc(m.generic)} · <span class="dose">${esc(m.dose)}</span> · ${esc(m.duration)}</div></div>
          <div class="qty"><button data-action="med-qty" data-i="${i}" data-d="-1" aria-label="Less">−</button><span>${ds.meds[i].qty}</span><button data-action="med-qty" data-i="${i}" data-d="1" aria-label="More">+</button></div>
          <div class="price" style="min-width:64px;text-align:right">${money(m.price * ds.meds[i].qty)}</div>
        </div>`).join('')}
        <div class="order-bar">
          <div><b>${medCount} selected</b> <span class="muted">· ${money(medTotal * 0.9)}</span>${medTotal ? `<span class="strike">${money(medTotal)}</span>` : ''}</div>
          <div class="row"><button class="btn outline sm" data-action="add-meds-cart" ${medCount ? '' : 'disabled'}>${icon('cart', 'sm')} Add to cart</button><button class="btn primary sm" data-action="order-meds" ${medCount ? '' : 'disabled'}>Order now</button></div>
        </div>
      </div>

      <div class="card" id="testsCard" ${rx.tests.length ? '' : 'hidden'}>
        <div class="card-head"><div><h3>Lab tests ordered by your doctor</h3><p class="small muted">Free home sample collection · reports land in your portal</p></div><span class="pill amber">${icon('home', 'sm')} At home</span></div>
        ${rx.tests.map((t, i) => `
        <div class="list-row">
          <button class="check ${ds.tests[i] ? 'on' : ''}" data-action="test-toggle" data-i="${i}" aria-pressed="${ds.tests[i]}" aria-label="Select ${esc(t.name)}">${ds.tests[i] ? icon('check', 'sm') : ''}</button>
          <div class="grow"><b>${esc(t.name)}</b><div class="small muted">${icon('clock', 'sm')} Report in ${t.tat}</div></div>
          <div class="price">${money(t.price)}</div>
        </div>`).join('')}
        <div class="order-bar">
          <div><b>${testCount} tests</b> <span class="muted">· ${money(testTotal)}</span></div>
          <button class="btn primary sm" data-action="book-tests" ${testCount ? '' : 'disabled'}>${icon('calendar', 'sm')} Book home collection</button>
        </div>
      </div>` : `
      <div class="card card-pad empty">
        ${icon('file', 'xl')}
        <h3 style="margin-top:12px">Your prescriptions, medicines and tests live here</h3>
        <p class="muted small" style="margin-top:6px">After a consultation you can buy prescribed medicines, book lab tests and see referred doctors in one tap.</p>
        <div class="row wrap" style="justify-content:center;margin-top:16px"><a class="btn primary" href="#/">Find a doctor</a><button class="btn outline" data-action="seed-demo">Load sample consultation</button></div>
      </div>`;

    app.innerHTML = `
    <div class="container dash">
      <aside class="side-nav">
        <div class="card me">${avatar(PT, 'md')}<div><b>${PT.name}</b><div class="tiny faint">${PT.id}</div></div></div>
        <a class="active" href="#/dashboard">${icon('grid')} Overview</a>
        <a href="#/prescription">${icon('file')} Prescriptions ${rx ? '<span class="count">1</span>' : ''}</a>
        <a href="#/dashboard" data-action="dash-scroll" data-target="medsCard">${icon('pill')} Medicines</a>
        <a href="#/dashboard" data-action="dash-scroll" data-target="testsCard">${icon('flask')} Lab tests</a>
        <a href="#/dashboard" data-action="dash-scroll" data-target="apptCard">${icon('calendar')} Appointments ${upcoming.length ? `<span class="count">${upcoming.length}</span>` : ''}</a>
        <a href="#/">${icon('search')} Find doctors</a>
        <a href="#/dashboard" data-action="reset-demo" style="margin-top:12px;color:var(--ink-3)">${icon('zap')} Reset demo</a>
      </aside>

      <div class="dash-main">
        <div class="greet">
          <div><h1>${greeting()}, ${PT.name.split(' ')[0]}</h1><p class="muted">${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
          <a class="btn primary" href="#/">${icon('plus', 'sm')} Book appointment</a>
        </div>
        ${hero}
        ${ordersCard}
        <div class="two-col">
          <div class="stack" style="gap:22px">
            ${medsCard}
            <div class="card">
              <div class="card-head"><h3>Past prescriptions</h3>${rx ? '<a class="btn ghost sm" href="#/prescription">View latest</a>' : ''}</div>
              ${rx ? `<a class="list-row click" href="#/prescription">${avatar(rd, 'md')}<div class="grow"><b>${esc(rx.diagnosis)}</b><div class="small muted">${rd.name} · ${rx.date}</div></div><span class="pill">New</span>${icon('chev', 'sm')}</a>` : ''}
              ${D.history.map((h) => { const hd = docById(h.doctorId); return `<div class="list-row click" data-action="old-rx">${avatar(hd, 'md')}<div class="grow"><b>${h.diagnosis}</b><div class="small muted">${hd.name} · ${h.date}</div></div><span class="faint small">${h.meds} meds</span>${icon('chev', 'sm')}</div>`; }).join('')}
            </div>
          </div>

          <div class="stack" style="gap:22px">
            ${referralDoc ? `
            <div class="card" id="refCard">
              <div class="card-head"><h3>Referred specialist</h3><span class="pill navy">From Dr. ${firstName(rd)}</span></div>
              <div class="referral">
                ${avatar(referralDoc, 'lg', referralDoc.online)}
                <div class="grow"><b style="font-family:var(--font-display);font-size:18px">${referralDoc.name}</b><div class="small muted">${referralDoc.title}</div><div class="small" style="margin-top:4px">${icon('star', 'sm star')} ${referralDoc.rating} · ${money(referralDoc.followUp)} referral fee</div></div>
              </div>
              <div class="card-body" style="padding-top:0">
                <p class="small" style="background:var(--mint);padding:10px 12px;border-radius:10px">${icon('clipboard', 'sm')} ${esc(rx.referral.reason)}</p>
                ${referralBooked
                  ? `<div class="row between" style="margin-top:12px"><span class="pill">${icon('check', 'sm')} Booked · ${referralBooked.dayLabel === 'Today' ? 'Today' : referralBooked.date}, ${referralBooked.time}</span><button class="btn ghost sm" data-action="join-appt" data-id="${referralBooked.id}">Join</button></div>`
                  : `<a class="btn navy block" style="margin-top:12px" href="#/doctor/${referralDoc.id}?ref=1">${icon('calendar', 'sm')} Book appointment</a>`}
              </div>
            </div>` : ''}

            <div class="card" id="apptCard">
              <div class="card-head"><h3>Appointments</h3><a class="btn ghost sm" href="#/">${icon('plus', 'sm')} New</a></div>
              ${upcoming.map((a) => { const ad = docById(a.doctorId); return `<div class="list-row">${avatar(ad, 'md', ad.online)}<div class="grow"><b>${ad.name}</b><div class="small muted">${a.dayLabel === 'Today' ? 'Today' : a.date}, ${a.time} · ${a.mode}</div></div><button class="btn primary sm" data-action="join-appt" data-id="${a.id}">Join</button></div>`; }).join('')}
              ${rx ? `<div class="list-row"><span style="color:var(--green)">${icon('bell', 'lg')}</span><div class="grow"><b>Follow-up with ${rd.name}</b><div class="small muted">${esc(rx.followUp || 'As advised')}</div></div><a class="btn outline sm" href="#/doctor/${rd.id}?ref=followup">Book</a></div>` : ''}
              ${!upcoming.length && !rx ? '<div class="list-row muted small">No appointments yet.</div>' : ''}
            </div>

            <div class="card">
              <div class="card-head"><h3>Health summary</h3><span class="tiny faint">Synced from device</span></div>
              <div class="vitals">
                <div class="vital"><small>Blood pressure</small><b>120/80</b>${spark([124, 122, 126, 121, 119, 120], '#289f67')}</div>
                <div class="vital"><small>Heart rate</small><b>92 <span class="small muted">bpm</span></b>${spark([74, 78, 76, 85, 90, 92], '#ed1c24')}</div>
                <div class="vital"><small>Temperature</small><b>100.8 <span class="small muted">°F</span></b>${spark([98.4, 98.6, 101.2, 100.4, 101, 100.8], '#f2a20c')}</div>
                <div class="vital"><small>SpO₂</small><b>97 <span class="small muted">%</span></b>${spark([98, 98, 97, 97, 98, 97], '#019cde')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

    // Advance live order tracking while the dashboard is open.
    if (S.orders.length && !teardown.orderTick) {
      const t = setInterval(() => { if (!modalRoot.innerHTML && drawer.hidden && parse().base === '/dashboard') rerender(); }, 15000);
      teardown.orderTick = true;
      teardown.push(() => { clearInterval(t); });
    }
  }

  function selectedMeds() {
    const rx = S.rx, ds = dashState();
    return rx.medicines.map((m, i) => ({ m, s: ds.meds[i] })).filter((o) => o.s.on).map(({ m, s }) => ({
      key: 'med:' + m.name, type: 'med', name: m.name, sub: m.generic + ' · ' + m.dose, price: m.price, qty: s.qty,
    }));
  }

  function bookTestsModal() {
    const rx = S.rx, ds = dashState();
    const tests = rx.tests.filter((_, i) => ds.tests[i]);
    const total = tests.reduce((a, t) => a + t.price, 0);
    const days = nextDays().slice(1, 4);
    const st = { day: 0, slot: '7:00 – 9:00 AM' };
    const paint = () => {
      openModal(`
        <div class="card-head"><h3>Home sample collection</h3><button class="icon-btn" data-action="close-modal" aria-label="Close">${icon('x')}</button></div>
        <div class="modal-pad stack" style="gap:16px;padding-top:20px">
          <div>${tests.map((t) => `<div class="row between small" style="padding:4px 0"><span>${icon('flask', 'sm')} ${esc(t.name)}</span><b>${money(t.price)}</b></div>`).join('')}</div>
          <div><span class="label">Collection address</span><div class="field">${icon('pin', 'sm')}<input value="House 12, Road 5, Dhanmondi, Dhaka 1205" aria-label="Address" /></div></div>
          <div><span class="label">Date</span><div class="days" style="grid-template-columns:repeat(3,1fr)">${days.map((x, i) => `<button class="day ${st.day === i ? 'active' : ''}" data-tday="${i}"><small>${x.dow}</small><b>${x.num}</b><small>${x.mon}</small></button>`).join('')}</div></div>
          <div><span class="label">Time window</span><div class="slots" style="grid-template-columns:repeat(3,1fr)">${['7:00 – 9:00 AM', '9:00 – 11:00 AM', '4:00 – 6:00 PM'].map((s) => `<button class="slot ${st.slot === s ? 'active' : ''}" data-tslot="${s}" style="font-size:13px">${s}</button>`).join('')}</div></div>
          <div class="sum-line"><span>Sample collection</span><b style="color:var(--green-2)">Free</b></div>
          <div class="sum-total" style="margin-top:0"><span>Total · pay on collection</span><span>${money(total)}</span></div>
          <button class="btn primary block lg" id="confirmTests">${icon('check', 'sm')} Confirm booking</button>
        </div>`, 520);
      modalRoot.querySelectorAll('[data-tday]').forEach((b) => b.addEventListener('click', () => { st.day = +b.dataset.tday; paint(); }));
      modalRoot.querySelectorAll('[data-tslot]').forEach((b) => b.addEventListener('click', () => { st.slot = b.dataset.tslot; paint(); }));
      $('#confirmTests').addEventListener('click', () => {
        processing('Booking your sample collection…');
        setTimeout(() => {
          const day = days[st.day];
          S.orders.unshift({ id: rid('LAB'), kind: 'Lab test', items: tests.map((t) => t.name), total, placedAt: Date.now(), slot: `${day.dow} ${day.num} ${day.mon}, ${st.slot}` });
          save();
          closeModal();
          rerender();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          toast('Sample collection booked — the collector will call before arriving', 'flask');
        }, 1300);
      });
    };
    paint();
  }

  function checkoutModal() {
    const t = cartTotals();
    const st = { pay: 'bkash' };
    const paint = () => {
      openModal(`
        <div class="card-head"><h3>Checkout</h3><button class="icon-btn" data-action="close-modal" aria-label="Close">${icon('x')}</button></div>
        <div class="modal-pad stack" style="gap:16px;padding-top:20px">
          <div><span class="label">Deliver to</span><div class="field">${icon('pin', 'sm')}<input value="House 12, Road 5, Dhanmondi, Dhaka 1205" aria-label="Delivery address" /></div></div>
          <div><span class="label">Payment method</span>
            <div class="pay-opts" style="grid-template-columns:repeat(4,1fr);margin:0">
              ${[['bkash', 'bKash', 'bkash'], ['nagad', 'Nagad', 'nagad'], ['card', 'Card', 'card-logo'], ['cod', 'Cash', 'card-logo']].map(([k, n, c]) => `<button class="pay-opt ${st.pay === k ? 'active' : ''}" data-cpay="${k}"><div class="logo ${c}">${n}</div></button>`).join('')}
            </div>
          </div>
          <div>
            <div class="sum-line"><span>${S.cart.length} item${S.cart.length === 1 ? '' : 's'}</span><b>${money(t.meds + t.tests)}</b></div>
            ${t.discount ? `<div class="sum-line"><span>Discount</span><b style="color:var(--green-2)">− ${money(t.discount)}</b></div>` : ''}
            ${t.delivery ? `<div class="sum-line"><span>Delivery</span><b>${money(t.delivery)}</b></div>` : ''}
            <div class="sum-total"><span>Total</span><span>${money(t.total)}</span></div>
          </div>
          <button class="btn primary block lg" id="placeOrder">${icon('lock', 'sm')} Place order · ${money(t.total)}</button>
        </div>`, 520);
      modalRoot.querySelectorAll('[data-cpay]').forEach((b) => b.addEventListener('click', () => { st.pay = b.dataset.cpay; paint(); }));
      $('#placeOrder').addEventListener('click', () => {
        processing(st.pay === 'cod' ? 'Placing your order…' : 'Processing payment…');
        setTimeout(() => {
          const meds = S.cart.filter((i) => i.type === 'med');
          if (meds.length) S.orders.unshift({ id: rid('ORD'), kind: 'Medicine', items: meds.map((i) => i.name), total: t.total, placedAt: Date.now() });
          S.cart = [];
          save();
          updateCartBadge();
          closeModal();
          if (parse().base === '/dashboard') { rerender(); window.scrollTo({ top: 0, behavior: 'smooth' }); } else go('#/dashboard');
          toast('Order placed — arriving in 2–4 hours', 'truck');
        }, 1400);
      });
    };
    closeCart();
    paint();
  }

  // ======================================================
  // PRESCRIPTION (printable)
  // ======================================================
  function viewRx() {
    if (!S.rx) finalizeConsult();
    const rx = S.rx;
    const d = docById(rx.doctorId);
    const ref = rx.referral && docById(rx.referral.doctorId);
    const qr = Array.from({ length: 81 }, (_, i) => {
      const r = Math.floor(i / 9), c = i % 9;
      const inFinder = (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);
      const on = inFinder ? !((r % 6 === 1) && (c % 6 === 1)) || (r === 1 && c === 7) : ((i * 37 + r * 5) % 7) < 3;
      return `<i class="${on ? '' : 'o'}"></i>`;
    }).join('');
    app.innerHTML = `
    <div class="container page" style="max-width:980px">
      <div class="row between wrap no-print" style="margin-bottom:18px">
        <a class="btn ghost" href="#/dashboard">${icon('back', 'sm')} Patient portal</a>
        <div class="row wrap">
          <button class="btn outline sm" data-action="print">${icon('print', 'sm')} Print / Save PDF</button>
          <button class="btn outline sm" data-action="goto-dash" data-target="testsCard">${icon('flask', 'sm')} Book tests</button>
          <button class="btn primary sm" data-action="goto-dash" data-target="medsCard">${icon('pill', 'sm')} Order medicines</button>
        </div>
      </div>
      <article class="rx-paper">
        <header class="rx-paper-head">
          <div class="rx-doc">
            <b>${d.name}</b>
            <div class="small muted">${d.degrees}</div>
            <div class="small muted">${d.title}</div>
            <div class="small muted">${d.hospital}</div>
          </div>
          <div style="text-align:right">
            <img src="assets/carnival-care-logo.svg" alt="Carnival Care" style="margin-left:auto" />
            <div class="tiny faint" style="margin-top:6px">e-Prescription · ${rx.id}</div>
          </div>
        </header>
        <div class="rx-pt">
          <div><span>Patient</span> <b>${PT.name}</b></div>
          <div><span>Age</span> <b>${PT.age} yrs</b></div>
          <div><span>Sex</span> <b>${PT.sex}</b></div>
          <div><span>Weight</span> <b>${PT.weight}</b></div>
          <div><span>ID</span> <b>${PT.id}</b></div>
          <div><span>Date</span> <b>${rx.date}</b></div>
        </div>
        <div class="rx-paper-body">
          <div class="rx-left">
            <div class="rx-sec"><h5>Chief complaints</h5><ul>${rx.complaints.map((t) => `<li class="small">${esc(t)}</li>`).join('')}</ul></div>
            ${rx.vitals ? `<div class="rx-sec"><h5>On examination</h5><div class="small stack-sm"><span>BP: <b>${rx.vitals.bp} mmHg</b></span><span>Pulse: <b>${rx.vitals.pulse}</b></span><span>Temp: <b>${rx.vitals.temp}</b></span><span>SpO₂: <b>${rx.vitals.spo2}</b></span></div></div>` : ''}
            ${rx.tests.length ? `<div class="rx-sec"><h5>Investigations</h5><ul>${rx.tests.map((t) => `<li class="small">${esc(t.name)}</li>`).join('')}</ul></div>` : ''}
            ${ref ? `<div class="rx-sec"><h5>Referral</h5><p class="small"><b>${ref.name}</b><br>${deptById(ref.dept).name} — ${esc(rx.referral.reason)}</p></div>` : ''}
          </div>
          <div class="rx-right">
            <div class="rx-sec"><h5>Diagnosis</h5><b style="font-size:16px">${esc(rx.diagnosis)}</b></div>
            <div class="rx-symbol">Rx</div>
            ${rx.medicines.map((m, i) => `
              <div class="rx-med"><span class="n">${i + 1}</span><div class="grow">
                <b>${esc(m.name)}</b> <span class="faint small">(${esc(m.generic)})</span>
                <div class="small"><span class="dose">${esc(m.dose)}</span> &nbsp;—&nbsp; ${esc(m.note)} &nbsp;—&nbsp; ${esc(m.duration)}</div>
              </div></div>`).join('')}
            ${rx.advice.length ? `<div class="rx-sec" style="margin-top:18px"><h5>Advice</h5><ul>${rx.advice.map((t) => `<li class="small">${esc(t)}</li>`).join('')}</ul></div>` : ''}
            ${rx.followUp ? `<div class="rx-sec"><h5>Follow-up</h5><p class="small">${esc(rx.followUp)}</p></div>` : ''}
          </div>
        </div>
        <footer class="rx-foot">
          <div class="row"><div class="qr" aria-hidden="true">${qr}</div><div class="tiny faint">Scan to verify<br>${rx.id}<br>Online consultation via Carnival Care</div></div>
          <div style="text-align:center"><div class="sig">${d.name.replace(/^Dr\.\s*/, '')}</div><div class="tiny faint" style="margin-top:4px">Digitally signed · ${rx.date}${rx.time ? ', ' + rx.time : ''}</div></div>
        </footer>
      </article>
    </div>`;
  }

  // ======================================================
  // DOCTOR PORTAL
  // ======================================================
  function viewDoctorPortal() {
    const d = docById(S.appointment ? S.appointment.doctorId : 'd1');
    const waiting = S.appointment && S.appointment.status === 'upcoming';
    const syms = (S.appointment && S.appointment.symptoms.join(', ')) || 'Fever, Headache';
    const queue = [
      { name: PT.name, hue: 200, info: `${PT.age} M · ${syms}`, time: (waiting && S.appointment.time) || 'Now' },
      { name: 'Nasima Begum', hue: 320, info: '52 F · Follow-up, hypertension', time: '6:00 PM' },
      { name: 'Rakib Hasan', hue: 30, info: '27 M · Acidity, chest burn', time: '6:15 PM' },
      { name: 'Tahmina Akter', hue: 270, info: '41 F · Joint pain', time: '6:30 PM' },
      { name: 'Jahid Khan', hue: 100, info: '8 M · Cough & cold (with parent)', time: '6:45 PM' },
    ];
    app.innerHTML = `
    <div class="container page">
      <div class="greet" style="margin-bottom:22px">
        <div class="row">${avatar(d, 'lg', true)}<div><p class="muted small">Doctor portal</p><h1 style="font-size:30px">${greeting()}, Dr. ${firstName(d)}</h1><p class="muted">${deptById(d.dept).name} · ${d.hospital}</p></div></div>
        <span class="pill" style="padding:8px 14px"><span class="live-dot"></span> Online & accepting patients</span>
      </div>
      <div class="tiles" style="margin-bottom:22px">
        <div class="tile t-green"><span class="ico">${icon('users', 'lg')}</span><b>14 patients</b><span>Scheduled today</span></div>
        <div class="tile t-cyan"><span class="ico">${icon('check', 'lg')}</span><b>9 completed</b><span>Avg. 11 min per consult</span></div>
        <div class="tile t-amber"><span class="ico">${icon('wallet', 'lg')}</span><b>${money(9 * d.fee)}</b><span>Earned today</span></div>
        <div class="tile t-navy"><span class="ico">${icon('star', 'lg')}</span><b>${d.rating} rating</b><span>${d.reviews.toLocaleString()} reviews</span></div>
      </div>
      <div class="two-col">
        <div class="card">
          <div class="card-head"><h3>Today's queue</h3><span class="pill cyan">${queue.length} remaining</span></div>
          ${queue.map((p, i) => `
          <div class="queue-row ${i === 0 ? 'next' : ''}">
            ${avatar(p, 'md')}
            <div><b>${p.name}</b><div class="small muted">${esc(p.info)}</div></div>
            <span class="small faint">${icon('clock', 'sm')} ${p.time}</span>
            ${i === 0
              ? `<button class="btn primary sm" data-action="doctor-start">${icon('video', 'sm')} ${waiting ? 'Start consultation' : 'Start demo call'}</button>`
              : '<span class="pill gray">Booked</span>'}
          </div>`).join('')}
        </div>
        <div class="stack" style="gap:22px">
          ${waiting ? `<div class="alert-card"><div class="ico">${icon('bell', 'xl')}</div><div class="grow" style="position:relative;z-index:1"><b style="font-family:var(--font-display);font-size:18px">${PT.name} is in the waiting room</b><p>Reported: ${esc(syms)}</p></div><button class="btn primary sm" data-action="doctor-start">Admit</button></div>` : ''}
          <div class="card">
            <div class="card-head"><h3>Recent prescriptions</h3></div>
            ${S.rx ? `<a class="list-row click" href="#/prescription">${avatar(PT, 'md')}<div class="grow"><b>${PT.name}</b><div class="small muted">${esc(S.rx.diagnosis)}</div></div><span class="pill">${S.rx.id}</span></a>` : ''}
            <div class="list-row">${avatar({ name: 'Sumaiya Rahman', hue: 340 }, 'md')}<div class="grow"><b>Sumaiya Rahman</b><div class="small muted">Migraine without aura</div></div><span class="faint small">2:40 PM</span></div>
            <div class="list-row">${avatar({ name: 'Habibur Rahman', hue: 60 }, 'md')}<div class="grow"><b>Habibur Rahman</b><div class="small muted">Type 2 diabetes — dose review</div></div><span class="faint small">1:15 PM</span></div>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ======================================================
  // Event wiring
  // ======================================================
  const actions = {
    'scroll-doctors': () => $('#doctors').scrollIntoView({ behavior: 'smooth' }),
    dept: (el) => { ui.dept = el.dataset.id; paintDepts(); paintDoctors(); },
    'clear-filters': () => { ui.dept = 'all'; ui.q = ''; ui.online = false; rerender(); },
    'dept-link': (el, e) => { e.preventDefault(); ui.dept = el.dataset.id; go('#/'); setTimeout(() => { const s = $('#doctors'); if (s) s.scrollIntoView(); }, 50); },
    'toggle-online': () => { ui.online = !ui.online; rerender(); },
    'book-doc': (el) => go('#/doctor/' + el.dataset.id),

    'pick-mode': (el) => { ui.book.mode = el.dataset.v; rerender(); },
    'pick-day': (el) => { ui.book.day = +el.dataset.v; ui.book.slot = null; rerender(); },
    'pick-slot': (el) => { ui.book.slot = el.dataset.v; rerender(); },
    'pick-pay': (el) => { ui.book.pay = el.dataset.v; rerender(); },
    'toggle-sym': (el) => {
      const a = ui.book.syms, i = a.indexOf(el.dataset.v);
      if (i >= 0) a.splice(i, 1); else a.push(el.dataset.v);
      rerender();
    },
    attach: () => { ui.book.files++; rerender(); toast('Report attached', 'file'); },
    'confirm-booking': confirmBooking,

    'join-call': () => go('#/consult'),
    'join-appt': (el) => {
      const a = S.upcoming.find((x) => x.id === el.dataset.id);
      if (a) { S.appointment = a; save(); }
      go('#/consult');
    },
    'doctor-start': () => go('#/consult?as=doctor'),
    'call-view': (el) => {
      ui.call.view = el.dataset.v;
      if (ui.call.view === 'doctor') stopCamera();
      paintCall();
    },
    'side-tab': (el) => {
      if (ui.call.view === 'doctor') ui.call.view = 'patient';
      ui.call.tab = el.dataset.tab;
      paintCall();
      paintSide(true);
      const i = $('#chatInput');
      if (ui.call.tab === 'chat' && i) i.focus();
    },
    'toggle-mic': () => { ui.call.mic = !ui.call.mic; paintCtrls(); paintStage(); toast(ui.call.mic ? 'Microphone on' : 'You are muted', ui.call.mic ? 'mic' : 'micOff'); },
    'toggle-cam': () => {
      const c = ui.call;
      if (c.cam) { stopCamera(); paintStage(); paintCtrls(); } else if (c.view === 'patient') startCamera();
      else toast('Switch to patient view to preview your camera', 'video');
    },
    'share-screen': () => toast('Screen sharing is part of the full app', 'monitor'),
    'toggle-play': () => { ui.call.playing = !ui.call.playing; paintCtrls(); if (ui.call.playing) runStep(); },
    'fast-forward': () => {
      const c = ui.call;
      const wasSigned = S.draft.signed;
      while (c.step < c.script.length) runStep(true);
      c.playing = false;
      c.caption = '';
      paintStage();
      paintCtrls();
      if (!wasSigned) onSigned(); else paintSide(false);
    },
    'end-call': endCall,

    'dw-add': (el) => {
      const x = S.draft, k = el.dataset.kind, v = el.dataset.v;
      if (k === 'complaint') addAll(x.complaints, [v]);
      if (k === 'vitals') x.vitals = Object.assign({}, R.vitals);
      if (k === 'med') { addMed(x, MED_LIB.find((m) => m.name === v)); ui.call.medQ = ''; }
      if (k === 'test') addTest(x, TEST_LIB.find((t) => t.name === v));
      if (k === 'advice') addAll(x.advice, [v]);
      save();
      paintSide();
    },
    'dw-remove': (el) => { S.draft[el.dataset.kind].splice(+el.dataset.i, 1); save(); paintSide(); },
    'dw-autofill': () => { fillAll(S.draft); save(); paintSide(true); toast('Prescription filled from template', 'zap'); },
    'dw-sign': () => {
      const x = S.draft;
      if (!x.medicines.length) { toast('Add at least one medicine before signing', 'pill'); return; }
      if (!x.diagnosis) x.diagnosis = R.diagnosis;
      x.signed = true;
      save();
      ui.call.step = ui.call.script.length;
      ui.call.playing = false;
      onSigned();
    },

    'dash-scroll': (el, e) => {
      e.preventDefault();
      const t = document.getElementById(el.dataset.target);
      if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else toast('Available after your consultation', 'file');
    },
    'goto-dash': (el) => {
      go('#/dashboard');
      setTimeout(() => { const t = document.getElementById(el.dataset.target); if (t) t.scrollIntoView({ behavior: 'smooth' }); }, 60);
    },
    'med-toggle': (el) => { const s = dashState().meds[+el.dataset.i]; s.on = !s.on; rerender(); },
    'med-qty': (el) => { const s = dashState().meds[+el.dataset.i]; s.qty = Math.max(1, s.qty + +el.dataset.d); s.on = true; rerender(); },
    'test-toggle': (el) => { const ts = dashState().tests; ts[+el.dataset.i] = !ts[+el.dataset.i]; rerender(); },
    'add-meds-cart': () => { addToCart(selectedMeds()); toast('Medicines added to cart', 'cart'); },
    'order-meds': () => { addToCart(selectedMeds()); openCart(); },
    'book-tests': bookTestsModal,
    'old-rx': () => toast('Older prescriptions open in the full app', 'file'),
    'seed-demo': () => { finalizeConsult(); rerender(); toast('Sample consultation loaded', 'zap'); },
    'reset-demo': (el, e) => {
      e.preventDefault();
      openModal(`<div class="modal-pad"><h3>Reset the demo?</h3><p class="muted" style="margin-top:8px">This clears the sample appointments, prescription, cart and orders saved in this browser.</p><div class="row" style="justify-content:flex-end;margin-top:20px"><button class="btn outline" data-action="close-modal">Cancel</button><button class="btn danger" data-action="reset-confirm">Reset</button></div></div>`, 420);
    },
    'reset-confirm': () => { S = fresh(); ui.dash = null; ui.book = null; save(); updateCartBadge(); closeModal(); go('#/'); toast('Demo reset', 'zap'); },
    print: () => window.print(),

    'close-cart': closeCart,
    'cart-qty': (el) => {
      const it = S.cart.find((c) => c.key === el.dataset.key);
      if (!it) return;
      it.qty += +el.dataset.d;
      if (it.qty <= 0) S.cart = S.cart.filter((c) => c !== it);
      save();
      updateCartBadge();
      renderCart();
    },
    checkout: checkoutModal,
    'close-modal': closeModal,
    'modal-bg': (el, e) => { if (e.target === el) closeModal(); },
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const fn = actions[el.dataset.action];
    if (fn) fn(el, e);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); closeCart(); }
  });
  document.addEventListener('input', (e) => {
    if (!S.draft || !ui.call) return;
    if (e.target.id === 'dxInput') { S.draft.diagnosis = e.target.value; save(); }
    if (e.target.id === 'fuInput') { S.draft.followUp = e.target.value; save(); }
    if (e.target.id === 'medQ') {
      ui.call.medQ = e.target.value;
      const q = ui.call.medQ.trim().toLowerCase();
      $('#medSuggest').innerHTML = medSugHTML(MED_LIB.filter((m) => !q || (m.name + ' ' + m.generic).toLowerCase().includes(q)), S.draft);
    }
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'refSel' && S.draft) {
      const v = e.target.value;
      S.draft.referral = v ? { doctorId: v, reason: v === R.referral.doctorId ? R.referral.reason : 'Specialist opinion requested' } : null;
      save();
    }
  });
  document.addEventListener('submit', (e) => {
    if (e.target.id !== 'chatForm') return;
    e.preventDefault();
    const c = ui.call;
    const text = $('#chatInput').value.trim();
    if (!c || !text) return;
    c.chat.push({ who: c.view === 'patient' ? 'pt' : 'doc', text });
    paintSide(true);
    $('#chatInput').focus();
    setTimeout(() => {
      if (ui.call !== c) return;
      c.chat.push({ who: c.view === 'patient' ? 'doc' : 'pt', text: c.view === 'patient' ? "Noted, thank you — I'll keep that in mind." : 'Okay doctor, thank you.' });
      if (c.tab === 'chat') { paintSide(true); const i = $('#chatInput'); if (i) i.focus(); }
    }, 1600);
  });

  $('#cartBtn').addEventListener('click', openCart);
  backdrop.addEventListener('click', closeCart);
  document.querySelectorAll('[data-icon]').forEach((s) => { s.outerHTML = icon(s.dataset.icon, 'lg'); });

  window.addEventListener('hashchange', route);
  updateCartBadge();
  route();
})();
