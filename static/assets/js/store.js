let selectedVehiclePrice = 50000;

let selectedVehicle = 'Pet Bike';

let selectedPayment = 'COD';

let insuranceEnabled = true;

let recurringEnabled = false;

let currentTransportBooking = null;

let bookingMap;
let trackingMap;

let pickupCoords = null;
let dropCoords = null;

let pickupMarker = null;
let dropMarker = null;

let driverMarker = null;
let routeLine = null;

let trackingInterval = null;

// NAVIGATION 
function scrollToSection(id) {
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
  const petName = document.getElementById('bkPetName').value.trim();
  const breed = document.getElementById('bkBreed').value.trim();
  const service = document.getElementById('bkService').value;
  const date = document.getElementById('bkDate').value;
  const notes = document.getElementById('bkNotes').value.trim();

  if (!name || !phone) {
    toast('Vui lòng nhập tên và số điện thoại!', 'error');
    return;
  }

  if (!service || !date || !selectedSlot) {
    toast('Vui lòng chọn dịch vụ, ngày và giờ hẹn!', 'error');
    return;
  }

  // Validate phone format
  if (!/^0\d{9,10}$/.test(phone)) {
    toast('Số điện thoại không hợp lệ!', 'error');
    return;
  }

  const payload = {
    full_name: name,
    phone,
    pet_name: petName,
    breed,
    service,
    date,
    time_slot: selectedSlot,
    notes,
  };

  try {
    const res = await fetch('/api/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    
    if (data.ok) {
      toast(data.message, 'success');
      // Reset form
      document.getElementById('bkName').value = '';
      document.getElementById('bkPhone').value = '';
      document.getElementById('bkPetName').value = '';
      document.getElementById('bkBreed').value = '';
      document.getElementById('bkService').value = 'Spa & Tắm';
      document.getElementById('bkDate').valueAsDate = new Date();
      document.getElementById('bkNotes').value = '';
      document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
      selectedSlot = '';
    } else {
      toast(data.message, 'error');
    }
  } catch (error) {
    console.error('Booking error:', error);
    toast('Có lỗi kết nối. Vui lòng thử lại!', 'error');
  }
}

// VALIDATE PHONE 
function validatePhone(phone) {
  return /^0\d{9,10}$/.test(phone);
}

function validateDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

// UTILS 
function fmt(n) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  
  // CSS cho toast
  const style = document.createElement('style');
  if (!document.getElementById('toast-styles')) {
    style.id = 'toast-styles';
    style.textContent = `
      .toast {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
      }
      .toast-success {
        background: #10b981;
        color: white;
      }
      .toast-error {
        background: #ef4444;
        color: white;
      }
      .toast-info {
        background: #3b82f6;
        color: white;
      }
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  setTimeout(() => el.remove(), 3000);
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

// Close modal on overlay click
document.getElementById('bookingModal').addEventListener('click', e => {
  if (e.target === document.getElementById('bookingModal')) closeModal();
});

// vehicle select

document.addEventListener('click', e => {

  const vehicle = e.target.closest('.vehicle-item');

  if (!vehicle) return;

  document
    .querySelectorAll('.vehicle-item')
    .forEach(v => v.classList.remove('active'));

  vehicle.classList.add('active');

  selectedVehiclePrice = Number(vehicle.dataset.price);

  selectedVehicle =
    vehicle.querySelector('.vehicle-name').textContent.trim();

  document.getElementById('transportPrice').textContent =
    fmt(selectedVehiclePrice);

});

// payment select

document.addEventListener('click', e => {

  const pay = e.target.closest('.payment-item');

  if (!pay) return;

  document
    .querySelectorAll('.payment-item')
    .forEach(p => p.classList.remove('active'));

  pay.classList.add('active');

  selectedPayment =
    pay.textContent.trim();

});

//feature select 

document.addEventListener('click', e => {

  const feature = e.target.closest('.transport-feature');

  if (!feature) return;

  feature.classList.toggle('active');

  const text = feature.textContent;

  if (text.includes('Insurance')) {

    insuranceEnabled =
      feature.classList.contains('active');
  }

  if (text.includes('Định kỳ')) {

    recurringEnabled =
      feature.classList.contains('active');
  }

});

// submit booking

async function submitTransportBooking() {

  const owner =
    document.getElementById('tpOwner').value.trim();

  const phone =
    document.getElementById('tpPhone').value.trim();

  const pet =
    document.getElementById('tpPet').value.trim();

  const pickupAddress =
    document.getElementById('tpPickup').value.trim();

  const dropoffAddress =
    document.getElementById('tpDropoff').value.trim();

  const health =
    document.getElementById('tpHealth').value.trim();

  const date =
    document.getElementById('tpDate').value;

  const time =
    document.getElementById('tpTime').value;

  // validate
  if (
    !owner ||
    !phone ||
    !pet ||
    !pickupAddress ||
    !dropoffAddress
  ) {

    toast(
      'Vui lòng nhập đầy đủ thông tin!',
      'error'
    );

    return;
  }

  if (!pickupCoords || !dropCoords) {

    toast(
      'Vui lòng chọn địa chỉ từ gợi ý!',
      'error'
    );

    return;
  }

  if (!/^0\d{9,10}$/.test(phone)) {

    toast(
      'Số điện thoại không hợp lệ!',
      'error'
    );

    return;
  }

  const btn =
    document.querySelector('.btn-transport-book');

  btn.disabled = true;

  btn.innerHTML =
    '⏳ Đang tìm tài xế...';

  try {

    const payload = {

      owner_name: owner,

      phone,

      pet_name: pet,

      pickup_address: pickupAddress,

      dropoff_address: dropoffAddress,

      transport_date: date,

      transport_time: time,

      vehicle_type: selectedVehicle,

      payment_method: selectedPayment,

      health_notes: health,

      insurance_enabled: insuranceEnabled,

      recurring: recurringEnabled,

      total_price: selectedVehiclePrice

    };

    const res = await fetch(
      '/api/transport-booking',
      {

        method:'POST',

        headers:{
          'Content-Type':'application/json'
        },

        body: JSON.stringify(payload)

      }
    );

    const data = await res.json();

    btn.disabled = false;

    btn.innerHTML =
      '🚚 Đặt xe';

    if (!data.ok) {

      toast(data.message, 'error');

      return;
    }

    currentTransportBooking =
      data.booking;

    toast(
      'Đặt xe thành công! 🚚',
      'success'
    );

    document.getElementById(
      'transportBookingSection'
    ).style.display = 'none';

    document.getElementById(
      'trackingSection'
    ).style.display = 'block';

    document
      .getElementById('trackingSection')
      .scrollIntoView({
        behavior:'smooth'
      });

    startTrackingSimulation();

  }

  catch(err) {

    console.error(err);

    btn.disabled = false;

    btn.innerHTML =
      '🚚 Đặt xe';

    toast(
      'Lỗi kết nối server!',
      'error'
    );

  }

}

function initBookingMap(){

  if(bookingMap) return;

  bookingMap = L.map('bookingMap',{
    zoomControl:true
  }).setView(
    [21.0285,105.8542],
    13
  );

  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution:'© OpenStreetMap © CARTO'
    }
  ).addTo(bookingMap);

  setTimeout(()=>{

    bookingMap.invalidateSize();

  },500);

}

async function searchAddress(q){

  if(!q || q.length < 3)
    return [];

  try{

    const res = await fetch(
      `/api/search-address?q=${encodeURIComponent(q)}`
    );

    if(!res.ok){
      console.error('API ERROR', res.status);
      return [];
    }

    return await res.json();

  }
  catch(err){

    console.error(err);

    return [];

  }

}

async function geocodeAddress(address){

  try{

    const res = await fetch(
      `/api/search-address?q=${encodeURIComponent(address)}`
    );

    const data = await res.json();

    if(!data.length)
      return null;

    return [
      Number(data[0].lat),
      Number(data[0].lon)
    ];

  }
  catch(err){

    console.error(err);

    return null;

  }

}

function initAddressAutocomplete(
  inputId,
  suggestionId,
  isPickup
){

  const input =
    document.getElementById(inputId);

  const box =
    document.getElementById(suggestionId);

let searchTimeout;

let lastQuery = '';

input.addEventListener('input', ()=>{

  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(async ()=>{

    const q = input.value.trim();

    if(q.length < 3){

      box.style.display='none';

      return;
    }

    if(q === lastQuery) return; 

      lastQuery = q;

    const results =
      await searchAddress(q);

    box.innerHTML =
      results.slice(0,5).map(r=>`

        <div
          class="address-item"
          data-lat="${r.lat}"
          data-lon="${r.lon}"
          data-name="${r.display_name}"
        >
          📍 ${r.display_name}
        </div>

      `).join('');

    box.style.display='block';

    box.querySelectorAll('.address-item')
      .forEach(item=>{

        item.onclick = ()=>{

          input.value =
            item.dataset.name;

          const lat =
            Number(item.dataset.lat);

          const lon =
            Number(item.dataset.lon);

          const coords = [lat, lon];

          if(isPickup){

            pickupCoords = coords;

            if(pickupMarker)
              bookingMap.removeLayer(pickupMarker);

            pickupMarker =
              L.marker(coords)
               .addTo(bookingMap)
               .bindPopup('📍 Điểm đón');

          }else{

            dropCoords = coords;

            if(dropMarker)
              bookingMap.removeLayer(dropMarker);

            dropMarker =
              L.marker(coords)
               .addTo(bookingMap)
               .bindPopup('🏠 Điểm đến');

          }

          bookingMap.setView(coords,15);

          updateTripInfo();

          drawPreviewRoute();

          box.style.display='none';

        };

      });

  }, 500);

});

}

function updateTripInfo(){

  if (
    !pickupCoords ||
    !dropCoords ||
    !Array.isArray(pickupCoords) ||
    !Array.isArray(dropCoords)
  ){
    return;
  }

  const distance =
    calcDistance(
      pickupCoords[0],
      pickupCoords[1],
      dropCoords[0],
      dropCoords[1]
    );

  document.getElementById(
    'distanceValue'
  ).textContent =
    distance.toFixed(1) + ' km';

  const eta =
    Math.round(distance * 3);

  document.getElementById(
    'etaValue'
  ).textContent =
    eta + ' phút';
}

function calcDistance(
  lat1,
  lon1,
  lat2,
  lon2
){

  const R = 6371;

  const dLat =
    (lat2-lat1) * Math.PI/180;

  const dLon =
    (lon2-lon1) * Math.PI/180;

  const a =
    Math.sin(dLat/2) *
    Math.sin(dLat/2) +

    Math.cos(lat1*Math.PI/180) *
    Math.cos(lat2*Math.PI/180) *

    Math.sin(dLon/2) *
    Math.sin(dLon/2);

  return R * 2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1-a)
    );

}

function startTrackingSimulation(){

  if (!pickupCoords || !dropCoords) {

    toast(
      'Thiếu tọa độ bản đồ!',
      'error'
    );

    return;
  }

  if (trackingMap) {
    trackingMap.remove();
  }

  const mapEl = document.getElementById('realMap');

  if (!mapEl) {
    toast('Không tìm thấy bản đồ!', 'error');
    return;
  }

  trackingMap = L.map(mapEl).setView(
    pickupCoords,
    14
  );

  L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }
  ).addTo(trackingMap);

    setTimeout(() => {

    trackingMap.invalidateSize();

  }, 300);

  L.marker(pickupCoords)
    .addTo(trackingMap)
    .bindPopup('📍 Điểm đón');

  L.marker(dropCoords)
    .addTo(trackingMap)
    .bindPopup('🏠 Điểm đến');

  driverMarker = L.marker(pickupCoords)
    .addTo(trackingMap)
    .bindPopup('🚚 Tài xế');

  simulateDriverMovement();

}

async function simulateDriverMovement() {

  const routeCoords =
    await drawRoute();

  if (
    !routeCoords ||
    !routeCoords.length
  ) {
    return;
  }

  let i = 0;

  driverMarker.setLatLng(
    routeCoords[0]
  );

  trackingInterval = setInterval(() => {

    if (i >= routeCoords.length) {

      clearInterval(trackingInterval);

      toast(
        '🏠 Đã giao thú cưng an toàn',
        'success'
      );

      return;
    }

    const point =
      routeCoords[i];

    if (!point) return;

    driverMarker.setLatLng(point);

    trackingMap.panTo(point);

    i++;

  }, 800);

}

function newTransportBooking(){

  document.getElementById(
    'trackingSection'
  ).style.display='none';

  document.getElementById(
    'transportBookingSection'
  ).style.display='block';

  location.reload();

}

async function drawRoute() {

  if (!pickupCoords || !dropCoords)
    return null;

  try {

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${pickupCoords[1]},${pickupCoords[0]};` +
      `${dropCoords[1]},${dropCoords[0]}` +
      `?overview=full&geometries=geojson`;

    const res = await fetch(url);

    const data = await res.json();

    if (!data.routes || !data.routes.length)
      return null;

    const coords =
      data.routes[0]
      .geometry.coordinates.map(
        c => [c[1], c[0]]
      );

    if (routeLine && trackingMap.hasLayer(routeLine)) {
      trackingMap.removeLayer(routeLine);
    }

    routeLine = L.polyline(coords,{
      color:'#7c3aed',
      weight:5
    }).addTo(trackingMap);

    trackingMap.fitBounds(
      routeLine.getBounds()
    );

    return coords;

  }
  catch(err){

    console.error(err);

    toast(
      'Không thể tạo tuyến đường!',
      'error'
    );

    return null;

  }

}

async function drawPreviewRoute() {

  if (!pickupCoords || !dropCoords)
    return;

  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${pickupCoords[1]},${pickupCoords[0]};` +
    `${dropCoords[1]},${dropCoords[0]}` +
    `?overview=full&geometries=geojson`;

  const res = await fetch(url);

  const data = await res.json();

  if (!data.routes || !data.routes.length) {
    toast('Không tìm thấy tuyến đường', 'error');
    return;
  }

  const coords =
    data.routes[0].geometry.coordinates.map(
      c => [c[1], c[0]]
    );

  if (routeLine && bookingMap.hasLayer(routeLine)) {
    bookingMap.removeLayer(routeLine);
  }

  routeLine = L.polyline(coords,{
    color:'#10b981',
    weight:4
  }).addTo(bookingMap);

  bookingMap.fitBounds(
    routeLine.getBounds()
  );

}

navigator.geolocation.getCurrentPosition(pos => {

  if (!bookingMap) return;

  const lat = pos.coords.latitude;
  const lng = pos.coords.longitude;

  bookingMap.setView([lat, lng], 15);

});

window.addEventListener('load', () => {

  setTimeout(() => {

    if (bookingMap) {
      bookingMap.invalidateSize();
    }

    if (trackingMap) {
      trackingMap.invalidateSize();
    }

  },300);

});

document.addEventListener('DOMContentLoaded', () => {

  initBookingMap();

  initAddressAutocomplete(
    'tpPickup',
    'pickupSuggestions',
    true
  );

  initAddressAutocomplete(
    'tpDropoff',
    'dropSuggestions',
    false
  );

});
