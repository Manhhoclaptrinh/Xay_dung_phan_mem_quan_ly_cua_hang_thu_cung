// INIT 
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('bkDate').valueAsDate = new Date();
  loadProducts();
});

// NAVIGATION 
function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// PRODUCTS 
async function loadProducts(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch('/api/products' + (qs ? '?' + qs : ''));
  const products = await res.json();
  renderProducts(products);
}

function renderProducts(list) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  if (!list.length) {
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text3)">Không tìm thấy sản phẩm nào.</div>';
    return;
  }
  grid.innerHTML = list.map(p => `
    <div class="product-card">
      <div class="product-img">${p.icon}
        ${p.badge === 'hot' ? '<span class="product-badge hot-badge">🔥 Hot</span>'
          : p.badge === 'new' ? '<span class="product-badge new-badge">✨ Mới</span>'
          : p.badge === 'sale' ? '<span class="product-badge">Sale</span>' : ''}
      </div>
      <div class="product-info">
        <div class="product-brand">${p.brand}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.description}</div>
        <div class="product-rating">
          <span class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5 - Math.floor(p.rating))}</span>
          <span>${p.rating} (${p.reviews})</span>
        </div>
        <div class="product-foot">
          <div>
            <span class="product-price">${fmt(p.price)}</span>
            ${p.old_price ? `<span class="product-price-old">${fmt(p.old_price)}</span>` : ''}
          </div>
          <button class="btn-addcart" onclick="addCart(${JSON.stringify(p)})">+ Thêm</button>
        </div>
      </div>
    </div>`).join('');
}

function filterCat(cat) {
  loadProducts({ category: cat });
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

let searchTimer;
function liveSearch(q) {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    loadProducts(q ? { q } : {});
  }, 300);
}

// CART 
let cart = [];

function addCart(p) {
  const ex = cart.find(x => x.id === p.id);
  if (ex) ex.qty++;
  else cart.push({ ...p, qty: 1 });
  updateCartUI();
  toast(`Đã thêm "${p.name}" vào giỏ hàng! 🛒`, 'success');
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = count;
  const el = document.getElementById('cartItemsEl');
  const foot = document.getElementById('cartFoot');

  if (!cart.length) {
    el.innerHTML = '<div class="cart-empty"><div class="cart-empty-icon">🛒</div><div>Giỏ hàng đang trống</div></div>';
    foot.style.display = 'none';
    return;
  }
  el.innerHTML = cart.map(i => `
    <div class="cart-item">
      <div class="cart-item-img">${i.icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${i.name}</div>
        <div class="cart-item-price">${fmt(i.price * i.qty)}</div>
        <div class="cart-qty-wrap">
          <button class="cqbtn" onclick="changeQty('${i.id}',-1)">−</button>
          <span style="font-size:.85rem;font-weight:700;min-width:18px;text-align:center">${i.qty}</span>
          <button class="cqbtn" onclick="changeQty('${i.id}',1)">+</button>
          <button class="cqbtn" onclick="changeQty('${i.id}',-999)" style="margin-left:4px;font-size:.7rem">✕</button>
        </div>
      </div>
    </div>`).join('');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cartTotalVal').textContent = fmt(total);
  foot.style.display = 'block';
}

function changeQty(id, d) {
  const i = cart.find(x => x.id === id);
  if (!i) return;
  i.qty += d;
  if (i.qty <= 0) cart = cart.filter(x => x.id !== id);
  updateCartUI();
}

function toggleCart() {
  document.getElementById('cartOverlay').classList.toggle('open');
  document.getElementById('cartDrawer').classList.toggle('open');
}

function checkout() {
  if (!cart.length) { toast('Giỏ hàng đang trống!', 'error'); return; }
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  cart = [];
  updateCartUI();
  toggleCart();
  toast(`Đặt hàng thành công! Tổng: ${fmt(total)} 🎉`, 'success');
}

// BOOKING 
let selectedSlot = '';

function selectSlot(el) {
  document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  selectedSlot = el.textContent.trim();
}

async function submitBooking() {
  const name  = document.getElementById('bkName').value.trim();
  const phone = document.getElementById('bkPhone').value.trim();
  if (!name || !phone) { toast('Vui lòng nhập tên và số điện thoại!', 'error'); return; }

  const payload = {
    full_name: name,
    phone,
    pet_name:  document.getElementById('bkPetName').value.trim(),
    breed:     document.getElementById('bkBreed').value.trim(),
    service:   document.getElementById('bkService').value,
    date:      document.getElementById('bkDate').value,
    time_slot: selectedSlot,
    notes:     document.getElementById('bkNotes').value.trim(),
  };

  const res  = await fetch('/api/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await res.json();
  toast(data.message, data.ok ? 'success' : 'error');
}

// BOOKING MODAL
let modalService = '';

function openBooking(service) {
  modalService = service;
  document.getElementById('modalServiceTitle').textContent = '📅 Đặt lịch — ' + service;
  document.getElementById('bookingModal').classList.add('open');
}

function closeModal() {
  document.getElementById('bookingModal').classList.remove('open');
}

async function submitModal() {
  const name  = document.getElementById('modalName').value.trim();
  const phone = document.getElementById('modalPhone').value.trim();
  if (!name || !phone) { toast('Vui lòng nhập tên và số điện thoại!', 'error'); return; }

  const payload = {
    full_name: name,
    phone,
    pet_name:  document.getElementById('modalPetName').value.trim(),
    service:   modalService,
    date:      document.getElementById('modalDate').value,
    notes:     document.getElementById('modalNotes').value.trim(),
  };

  const res  = await fetch('/api/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await res.json();
  closeModal();
  toast(data.message, data.ok ? 'success' : 'error');
}

document.getElementById('bookingModal').addEventListener('click', e => {
  if (e.target === document.getElementById('bookingModal')) closeModal();
});