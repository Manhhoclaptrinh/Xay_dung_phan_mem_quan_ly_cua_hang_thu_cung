// NAVIGATION

let admPage = 'dashboard';
const admLabels = {
  dashboard: 'Dashboard', pets: 'Hồ sơ Thú cưng', customers: 'Khách hàng',
  inventory: 'Kho hàng', appointments: 'Lịch dịch vụ', boarding: 'Lưu trú (Hotel)',
  pos: 'Bán hàng (POS)', orders: 'Đơn hàng online', promotions: 'Khuyến mãi',
  vendors: 'Nhà cung cấp', staff: 'Nhân viên', reports: 'Báo cáo',
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.adm-nav-item').forEach(el => {
    el.addEventListener('click', () => admNav(el.dataset.adm));
  });
  document.getElementById('admToggle').addEventListener('click', () => {
    document.getElementById('admSidebar').classList.toggle('collapsed');
    document.getElementById('admMain').classList.toggle('full');
  });
  document.getElementById('admModalClose').addEventListener('click', admCloseModal);
  document.getElementById('admModalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('admModalOverlay')) admCloseModal();
  });
  admRender();
});

function admNav(page) {
  admPage = page;
  document.querySelectorAll('.adm-nav-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-adm="${page}"]`)?.classList.add('active');
  document.getElementById('admTitle').textContent = admLabels[page] || page;
  admRender();
}

async function admRender() {
  const c = document.getElementById('admContent');
  c.innerHTML = '<div style="text-align:center;padding:60px;color:var(--text3)">Đang tải...</div>';
  const pages = {
    dashboard: admDashboard, pets: admPets, customers: admCustomers,
    inventory: admInventory, appointments: admAppointments, boarding: admBoarding,
    pos: admPOS, orders: admOrders, promotions: admPromotions,
    vendors: admVendors, staff: admStaff, reports: admReports,
  };
  await (pages[admPage] || admDashboard)();
}

// API HELPERS
async function api(path, opts = {}) {
  const res = await fetch('/admin' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  return res.json();
}

// DASHBOARD
async function admDashboard() {
  const d = await api('/api/dashboard');
  const rev = d.monthly_revenue;
  const maxRev = Math.max(...rev);
  const c = document.getElementById('admContent');
  c.innerHTML = `
  <div class="adm-page-header">
    <div><div class="adm-page-title">Tổng Quan</div><div class="adm-page-sub">Thứ Hai, 25/11/2024 — Chào mừng trở lại! 🐾</div></div>
    <button class="adm-btn adm-btn-primary" onclick="admShowModal('addTransaction')">+ Giao dịch mới</button>
  </div>
  <div class="adm-grid adm-g4 mb24">
    <div class="adm-stat" style="--sc:var(--accent)"><div class="adm-stat-icon">💰</div><div class="adm-stat-val">${fmtShort(48000000)}</div><div class="adm-stat-label">Doanh thu tháng 11</div><div class="adm-stat-change">↑ +12.4% so với tháng trước</div></div>
    <div class="adm-stat" style="--sc:var(--teal)"><div class="adm-stat-icon">🐾</div><div class="adm-stat-val">${d.pets_count}</div><div class="adm-stat-label">Thú cưng quản lý</div><div class="adm-stat-change">↑ +2 mới tháng này</div></div>
    <div class="adm-stat" style="--sc:var(--gold)"><div class="adm-stat-icon">📅</div><div class="adm-stat-val">${d.today_appointments.length}</div><div class="adm-stat-label">Lịch hẹn hôm nay</div><div class="adm-stat-change">2 xác nhận • 0 vắng</div></div>
    <div class="adm-stat" style="--sc:var(--pink)"><div class="adm-stat-icon">⚠️</div><div class="adm-stat-val">${d.inventory_alerts}</div><div class="adm-stat-label">Hàng cần xử lý</div><div class="adm-stat-change down">↓ Cần kiểm tra sớm</div></div>
  </div>
  <div class="adm-grid mb16" style="grid-template-columns:2fr 1fr;gap:16px">
    <div class="adm-card">
      <div class="fxb mb12"><div class="adm-card-title" style="margin:0">Doanh thu 12 tháng</div><span class="adm-tag adm-tag-green">↑ Tăng trưởng tốt</span></div>
      <div class="adm-chart-wrap">
        ${rev.map((v, i) => `<div class="adm-bar" style="height:${Math.round(v / maxRev * 100)}%"><div class="adm-tip">T${i + 1}: ${v}M</div></div>`).join('')}
      </div>
      <div class="adm-chart-labels">${['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'].map(m => `<div class="adm-chart-label">${m}</div>`).join('')}</div>
    </div>
    <div class="adm-card">
      <div class="adm-card-title">Lịch hẹn hôm nay</div>
      ${d.today_appointments.map(a => `
        <div style="background:var(--cream);border-radius:9px;padding:11px 12px;margin-bottom:9px;border-left:3px solid var(--${a.status === 'Xác nhận' ? 'teal' : 'gold'})">
          <div class="fxb"><span style="font-size:.84rem;font-weight:700">${a.time} — ${a.service}</span><span class="adm-tag adm-tag-${a.status === 'Xác nhận' ? 'green' : 'gold'}">${a.status}</span></div>
          <div class="text-sm text-muted mt8">${a.pet_name} • ${a.owner_name}</div>
          <div class="text-sm text-accent font-bold mt8">${fmt(a.price)}</div>
        </div>`).join('')}
    </div>
  </div>
  <div class="adm-grid adm-g3 gap-16">
    <div class="adm-card">
      <div class="adm-card-title">Tình trạng phòng lưu trú</div>
      ${[{l:'Đang có khách',v:d.rooms_occupied,c:'pink'},{l:'Trống',v:d.rooms_available,c:'teal'},{l:'Đang dọn',v:d.rooms_cleaning,c:'gold'}]
        .map(r => `<div class="fxb" style="margin-bottom:10px"><span class="text-sm">${r.l}</span><span class="font-bold text-${r.c}">${r.v}</span></div>`).join('')}
      <div class="divider"></div>
      <div class="fxb mb8"><span class="text-sm text-muted">Tỷ lệ lấp đầy</span><span class="text-sm font-bold">${Math.round(d.rooms_occupied / d.rooms.length * 100)}%</span></div>
      <div class="adm-progress"><div class="adm-progress-fill" style="width:${Math.round(d.rooms_occupied / d.rooms.length * 100)}%"></div></div>
    </div>
    <div class="adm-card" style="grid-column:span 2">
      <div class="adm-card-title">Top khách hàng</div>
      ${d.top_customers.map((c, i) => `
        <div class="fxc gap12" style="margin-bottom:12px">
          <div style="width:26px;height:26px;border-radius:50%;background:var(--cream2);display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:800;color:var(--gold)">${i + 1}</div>
          <div style="flex:1"><div class="text-sm font-bold">${c.name}</div><div style="font-size:.68rem;color:var(--text3)">${c.level} · ${c.points} điểm</div></div>
          <div class="text-sm text-accent font-bold">${fmtShort(c.total_spent)}</div>
        </div>`).join('')}
    </div>
  </div>`;
}

// PETS 
async function admPets(search = '') {

  const pets = await api(`/api/pets?search=${search}`);

  document.getElementById('admContent').innerHTML = `
  <div class="adm-page-header">

    <div>
      <div class="adm-page-title">Hồ sơ Thú cưng</div>
      <div class="adm-page-sub">
        ${pets.length} thú cưng đang quản lý
      </div>
    </div>

    <div class="flex gap8">

      <input
        class="adm-input"
        id="petSearch"
        placeholder="Tìm tên, giống, mã..."
        style="width:220px"
        value="${search}"
      >

      <button
        class="adm-btn adm-btn-sec"
        onclick="searchPets()"
      >
        🔍
      </button>

      <button
        class="adm-btn adm-btn-primary"
        onclick="admShowModal('addPet')"
      >
        + Thêm hồ sơ
      </button>

    </div>
  </div>

  <div class="adm-card" style="padding:0">

    <div class="adm-table-wrap">

      <table class="adm-table">

        <thead>
          <tr>
            <th>ID</th>
            <th>Thú cưng</th>
            <th>Loài</th>
            <th>Tuổi</th>
            <th>Chủ nuôi</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>

          ${pets.map(p => `
          <tr>

            <td>
              <div class="font-bold">${p.id}</div>
            </td>

            <td>
              <div class="font-bold">${p.name}</div>
              <div class="text-muted text-sm">${p.breed}</div>
            </td>

            <td>${p.species}</td>

            <td>${p.age} tuổi</td>

            <td>${p.owner_name || 'N/A'}</td>

            <td>
              <span class="adm-tag adm-tag-${p.status === 'Khỏe mạnh' ? 'green' : 'orange'}">
                ${p.status}
              </span>
            </td>

            <td>

              <div class="flex gap6">

                <button
                  class="adm-btn adm-btn-sec adm-btn-sm"
                  onclick="viewPet('${p.id}')"
                >
                  👁
                </button>

                <button
                  class="adm-btn adm-btn-sec adm-btn-sm"
                  onclick="editPet('${p.id}')"
                >
                  ✏️
                </button>

                <button
                  class="adm-btn adm-btn-danger adm-btn-sm"
                  onclick="deletePet('${p.id}')"
                >
                  🗑
                </button>

              </div>

            </td>

          </tr>
          `).join('')}

        </tbody>

      </table>

    </div>

  </div>
  `;
}

function searchPets() {

  const keyword = document.getElementById('petSearch').value;

  admPets(keyword);
}

async function viewPet(id) {

  const p = await api(`/api/pets/${id}`);

  document.getElementById('admModalTitle').textContent =
    `🐾 Chi tiết ${p.name}`;

  document.getElementById('admModalBody').innerHTML = `

    <div class="adm-grid adm-g2">

      <div>
        <strong>Mã:</strong>
        <div>${p.id}</div>
      </div>

      <div>
        <strong>Tên:</strong>
        <div>${p.name}</div>
      </div>

      <div>
        <strong>Loài:</strong>
        <div>${p.species}</div>
      </div>

      <div>
        <strong>Giống:</strong>
        <div>${p.breed}</div>
      </div>

      <div>
        <strong>Tuổi:</strong>
        <div>${p.age}</div>
      </div>

      <div>
        <strong>Giới tính:</strong>
        <div>${p.gender}</div>
      </div>

      <div>
        <strong>Chủ nuôi:</strong>
        <div>${p.owner_name || 'N/A'}</div>
      </div>

      <div>
        <strong>Chip:</strong>
        <div>${p.chip || 'Không có'}</div>
      </div>

      <div>
        <strong>Dị ứng:</strong>
        <div>${p.allergies || 'Không'}</div>
      </div>

      <div>
        <strong>Trạng thái:</strong>
        <div>${p.status}</div>
      </div>

    </div>
  `;

  document.getElementById('admModalFoot').innerHTML = `
    <button
      class="adm-btn adm-btn-sec"
      onclick="admCloseModal()"
    >
      Đóng
    </button>
  `;

  document.getElementById('admModalOverlay')
    .classList.add('open');
}

async function editPet(id) {

  const p = await api(`/api/pets/${id}`);

  document.getElementById('admModalTitle').textContent =
    `✏️ Chỉnh sửa ${p.name}`;

  document.getElementById('admModalBody').innerHTML = `

    <div class="adm-form-row">

      <div class="adm-form-group">
        <label class="adm-label">Tên</label>
        <input class="adm-input" id="ePetName" value="${p.name}">
      </div>

      <div class="adm-form-group">
        <label class="adm-label">Loài</label>
        <input class="adm-input" id="ePetSpecies" value="${p.species}">
      </div>

    </div>

    <div class="adm-form-row">

      <div class="adm-form-group">
        <label class="adm-label">Giống</label>
        <input class="adm-input" id="ePetBreed" value="${p.breed}">
      </div>

      <div class="adm-form-group">
        <label class="adm-label">Tuổi</label>
        <input class="adm-input" type="number" id="ePetAge" value="${p.age}">
      </div>

    </div>

  `;

  document.getElementById('admModalFoot').innerHTML = `
    <button class="adm-btn adm-btn-sec" onclick="admCloseModal()">
      Hủy
    </button>

    <button
      class="adm-btn adm-btn-primary"
      onclick="updatePet('${p.id}')"
    >
      💾 Lưu
    </button>
  `;

  document.getElementById('admModalOverlay')
    .classList.add('open');
}

async function updatePet(id) {

  const payload = {

    name: document.getElementById('ePetName').value,

    species: document.getElementById('ePetSpecies').value,

    breed: document.getElementById('ePetBreed').value,

    age: document.getElementById('ePetAge').value,
  };

  const d = await api(`/api/pets/${id}`, {

    method: 'PUT',

    body: JSON.stringify(payload)
  });

  admCloseModal();

  toast(d.message, 'success');

  admRender();
}

async function deletePet(id) {

  if (!confirm('Bạn có chắc muốn xóa thú cưng này?')) {
    return;
  }

  const d = await api(`/api/pets/${id}`, {

    method: 'DELETE'
  });

  toast(d.message, 'success');

  admRender();
}

// CUSTOMERS 
async function admCustomers() {
  const customers = await api('/api/customers');
  document.getElementById('admContent').innerHTML = `
  <div class="adm-page-header">
    <div><div class="adm-page-title">Khách hàng (CRM)</div><div class="adm-page-sub">${customers.length} khách hàng trong hệ thống</div></div>
    <button class="adm-btn adm-btn-primary" onclick="admShowModal('addCustomer')">+ Thêm khách hàng</button>
  </div>
  <div class="adm-grid adm-g4 mb24">
    ${[{l:'Diamond',i:'💎',c:'blue'},{l:'Gold',i:'🥇',c:'gold'},{l:'Silver',i:'🥈',c:'purple'},{l:'Bronze',i:'🥉',c:'orange'}]
      .map(lv => `<div class="adm-stat" style="--sc:var(--${lv.c})"><div class="adm-stat-icon">${lv.i}</div><div class="adm-stat-val">${customers.filter(c => c.level === lv.l).length}</div><div class="adm-stat-label">Hạng ${lv.l}</div></div>`).join('')}
  </div>
  <div class="adm-card" style="padding:0">
    <div class="adm-table-wrap">
      <table class="adm-table">
        <thead><tr><th>Khách hàng</th><th>Liên hệ</th><th>Hạng</th><th>Điểm</th><th>Tổng chi</th><th>Từ ngày</th><th>Thao tác</th></tr></thead>
        <tbody>
          ${customers.map(c => {
            const lc = {Diamond:'blue',Gold:'gold',Silver:'purple',Bronze:'orange'}[c.level];
            return `<tr>
              <td><div class="font-bold">${c.name}</div><div class="text-muted text-sm">${c.id}</div></td>
              <td><div class="text-sm">${c.phone}</div><div class="text-muted" style="font-size:.7rem">${c.email}</div></td>
              <td><span class="adm-tag adm-tag-${lc}">${c.level}</span></td>
              <td class="font-bold text-gold">${c.points}</td>
              <td class="font-bold text-accent">${fmt(c.total_spent)}</td>
              <td class="text-sm text-muted">${c.join_date}</td>
              <td><div class="flex gap6"><button class="adm-btn adm-btn-sec adm-btn-sm" onclick="toast('Xem ${c.name}','info')">👁</button><button class="adm-btn adm-btn-sec adm-btn-sm">✏️</button></div></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// INVENTORY
async function admInventory() {
  const items = await api('/api/inventory');
  const alerts = items.filter(i => i.status !== 'OK');
  document.getElementById('admContent').innerHTML = `
  <div class="adm-page-header">
    <div><div class="adm-page-title">Kho hàng</div><div class="adm-page-sub">${items.length} mặt hàng · ${alerts.length} cần xử lý</div></div>
    <button class="adm-btn adm-btn-primary" onclick="admShowModal('addProduct')">+ Thêm sản phẩm</button>
  </div>
  ${alerts.length ? `<div style="background:var(--gold-bg);border:1px solid rgba(201,136,10,.25);border-radius:var(--r);padding:14px 18px;margin-bottom:16px">
    <div class="fxc gap8 mb8"><span>⚠️</span><strong class="text-sm">Cảnh báo kho hàng:</strong></div>
    ${alerts.map(a => `<div class="text-sm" style="margin-top:5px">• <strong>${a.name}</strong>: ${a.status} (còn ${a.quantity})</div>`).join('')}
  </div>` : ''}
  <div class="adm-card" style="padding:0">
    <div class="adm-table-wrap">
      <table class="adm-table">
        <thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Tồn kho</th><th>Đơn giá</th><th>Hạn SD</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>
          ${items.map(item => {
            const sc = {OK:'green','Sắp hết':'orange','Sắp hết hạn':'red'}[item.status] || 'orange';
            const pct = Math.min(100, Math.round(item.quantity / Math.max(item.min_qty * 3, 1) * 100));
            return `<tr>
              <td><div class="font-bold">${item.name}</div><div class="text-muted text-sm">${item.unit}</div></td>
              <td><span class="adm-tag adm-tag-blue">${item.category}</span></td>
              <td>
                <div class="fxb mb8" style="max-width:100px"><span class="font-bold">${item.quantity}</span><span class="text-muted text-sm">min:${item.min_qty}</span></div>
                <div class="adm-progress" style="width:90px"><div class="adm-progress-fill" style="width:${pct}%;background:var(--${item.status==='OK'?'teal':item.status==='Sắp hết'?'gold':'pink'})"></div></div>
              </td>
              <td class="font-bold text-accent">${fmt(item.price)}</td>
              <td class="text-sm">${item.expiry || '—'}</td>
              <td><span class="adm-tag adm-tag-${sc}">${item.status}</span></td>
              <td><button class="adm-btn adm-btn-sec adm-btn-sm" onclick="toast('Điều chỉnh kho...','info')">📦</button></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// APPOINTMENTS 
async function admAppointments() {
  const apts = await api('/api/appointments');
  document.getElementById('admContent').innerHTML = `
  <div class="adm-page-header">
    <div><div class="adm-page-title">Lịch Dịch vụ</div><div class="adm-page-sub">${apts.length} lịch hẹn</div></div>
    <button class="adm-btn adm-btn-primary" onclick="admShowModal('addAppointment')">+ Đặt lịch mới</button>
  </div>
  <div class="adm-card" style="padding:0">
    <div class="adm-table-wrap">
      <table class="adm-table">
        <thead><tr><th>Lịch hẹn</th><th>Thú cưng</th><th>Dịch vụ</th><th>Nhân viên</th><th>Giá</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>
          ${apts.map(a => `<tr>
            <td><div class="font-bold">${a.date}</div><div class="text-muted text-sm">⏰ ${a.time} (${a.duration} phút)</div></td>
            <td><div class="font-bold text-sm">${a.pet_name}</div><div class="text-muted" style="font-size:.7rem">${a.owner_name}</div></td>
            <td><span class="adm-tag adm-tag-purple">${a.service}</span></td>
            <td class="text-sm">${a.staff}</td>
            <td class="font-bold text-accent">${fmt(a.price)}</td>
            <td><span class="adm-tag adm-tag-${a.status==='Xác nhận'?'green':'gold'}">${a.status}</span></td>
            <td><div class="flex gap6">
              ${a.status === 'Chờ' ? `<button class="adm-btn adm-btn-success adm-btn-sm" onclick="confirmApt('${a.id}')">✓</button>` : ''}
              <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="cancelApt('${a.id}')">✕</button>
            </div></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

async function confirmApt(id) {
  const d = await api(`/api/appointments/${id}/confirm`, { method: 'PATCH' });
  toast(d.message, 'success');
  admRender();
}
async function cancelApt(id) {
  const d = await api(`/api/appointments/${id}`, { method: 'DELETE' });
  toast(d.message, 'info');
  admRender();
}

// BOARDING
// BOARDING (PET HOTEL)

async function admBoarding() {

  const rooms = await api('/api/rooms');

  const occupied =
    rooms.filter(r => r.status === 'occupied').length;

  const available =
    rooms.filter(r => r.status === 'available').length;

  const cleaning =
    rooms.filter(r => r.status === 'cleaning').length;

  const occupancyRate =
    rooms.length > 0
      ? Math.round((occupied / rooms.length) * 100)
      : 0;

  document.getElementById('admContent').innerHTML = `

  <!-- HEADER -->

  <div class="adm-page-header">

    <div>

      <div class="adm-page-title">
        🏨 Quản lý lưu trú thú cưng
      </div>

      <div class="adm-page-sub">
        Quản lý phòng khách sạn thú cưng
      </div>

    </div>

    <div class="flex gap8">

      <button
        class="adm-btn adm-btn-sec"
        onclick="admBoarding()">

        🔄 Làm mới

      </button>

      <button
        class="adm-btn adm-btn-primary"
        onclick="openCheckinModal()">

        🏠 Nhận phòng

      </button>

    </div>

  </div>

  <!-- THỐNG KÊ -->

  <div class="adm-grid adm-g4 mb24">

    <div class="adm-stat" style="--sc:var(--pink)">

      <div class="adm-stat-icon">
        🐾
      </div>

      <div class="adm-stat-val">
        ${occupied}
      </div>

      <div class="adm-stat-label">
        Đang có khách
      </div>

    </div>

    <div class="adm-stat" style="--sc:var(--teal)">

      <div class="adm-stat-icon">
        🏠
      </div>

      <div class="adm-stat-val">
        ${available}
      </div>

      <div class="adm-stat-label">
        Phòng trống
      </div>

    </div>

    <div class="adm-stat" style="--sc:var(--gold)">

      <div class="adm-stat-icon">
        🧹
      </div>

      <div class="adm-stat-val">
        ${cleaning}
      </div>

      <div class="adm-stat-label">
        Đang vệ sinh
      </div>

    </div>

    <div class="adm-stat" style="--sc:var(--accent)">

      <div class="adm-stat-icon">
        📊
      </div>

      <div class="adm-stat-val">
        ${occupancyRate}%
      </div>

      <div class="adm-stat-label">
        Tỷ lệ lấp đầy
      </div>

    </div>

  </div>

  <!-- TỔNG QUAN -->

  <div class="adm-card mb24">

    <div class="adm-card-title">
      Tổng quan lưu trú
    </div>

    <div class="fxb mb12">

      <span class="text-sm">
        Số phòng hiện có
      </span>

      <strong>
        ${rooms.length}
      </strong>

    </div>

    <div class="fxb mb12">

      <span class="text-sm">
        Đang sử dụng
      </span>

      <strong class="text-pink">
        ${occupied}
      </strong>

    </div>

    <div class="fxb mb12">

      <span class="text-sm">
        Phòng trống
      </span>

      <strong class="text-teal">
        ${available}
      </strong>

    </div>

    <div class="fxb mb12">

      <span class="text-sm">
        Đang vệ sinh
      </span>

      <strong class="text-gold">
        ${cleaning}
      </strong>

    </div>

    <div class="divider"></div>

    <div class="fxb mb8">

      <span class="text-sm text-muted">
        Tỷ lệ sử dụng
      </span>

      <strong>
        ${occupancyRate}%
      </strong>

    </div>

    <div class="adm-progress">

      <div
        class="adm-progress-fill"
        style="width:${occupancyRate}%">

      </div>

    </div>

  </div>

  <!-- DANH SÁCH PHÒNG -->

  <div class="adm-card">

    <div class="fxb mb16">

      <div class="adm-card-title">

        Sơ đồ phòng lưu trú

      </div>

      <span class="adm-tag adm-tag-blue">

        ${rooms.length} phòng

      </span>

    </div>

    <div class="adm-room-grid">

      ${rooms.map(room => {

        let roomText = '';
        let roomIcon = '';
        let tagColor = '';

        if (room.status === 'occupied') {

          roomText = 'Có khách';
          roomIcon = '🐾';
          tagColor = 'green';

        }

        else if (room.status === 'available') {

          roomText = 'Trống';
          roomIcon = '🏠';
          tagColor = 'blue';

        }

        else {

          roomText = 'Đang dọn';
          roomIcon = '🧹';
          tagColor = 'gold';

        }

        return `

        <div
          class="adm-room ${room.status}"
          onclick="showRoomInfo('${room.id}')"
          style="cursor:pointer">

          <div class="adm-room-icon">

            ${roomIcon}

          </div>

          <div
            class="adm-room-id"
            style="font-size:18px;font-weight:800">

            ${room.id}

          </div>

          <div class="adm-room-status">

            <span class="adm-tag adm-tag-${tagColor}">
              ${roomText}
            </span>

          </div>

          <div
            style="
              margin-top:10px;
              font-size:12px;
              color:var(--text3);
            ">

            ${room.room_type || 'Phòng tiêu chuẩn'}

          </div>

        </div>

        `;

      }).join('')}

    </div>

  </div>

  `;
}
// POS 
const posItems = [
  {id:'ps1',name:'Hạt Royal Canin',icon:'🎁',price:320000},
  {id:'ps2',name:'Pate Whiskas',icon:'🐟',price:25000},
  {id:'ps3',name:'Sữa tắm Bio-groom',icon:'🛁',price:180000},
  {id:'ps4',name:'Đồ chơi cào mèo',icon:'🧸',price:250000},
  {id:'ps5',name:'Chuồng size M',icon:'🏠',price:850000},
  {id:'ps6',name:'Spa & Tắm',icon:'✨',price:280000},
  {id:'ps7',name:'Cắt tỉa lông',icon:'✂️',price:200000},
  {id:'ps8',name:'Khám bệnh',icon:'🏥',price:150000},
];
let admCart = [];

async function admPOS() {
  const customers = await api('/api/customers');
  const total = admCart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('admContent').innerHTML = `
  <div class="adm-page-header">
    <div><div class="adm-page-title">Bán hàng (POS)</div></div>
    <select class="adm-select" style="width:200px"><option>-- Chọn khách hàng --</option>${customers.map(c => `<option>${c.name}</option>`).join('')}</select>
  </div>
  <div class="adm-pos-wrap">
    <div>
      <div class="adm-pos-items">${posItems.map(p => `<div class="adm-pos-item" onclick="admAddCart('${p.id}','${p.name}',${p.price},'${p.icon}')"><div class="adm-pos-item-icon">${p.icon}</div><div class="adm-pos-item-name">${p.name}</div><div class="adm-pos-item-price">${fmt(p.price)}</div></div>`).join('')}</div>
    </div>
    <div class="adm-cart" id="admCartPanel">
      <div class="adm-card-title">🛒 Giỏ hàng</div>
      <div class="adm-cart-items" id="admCartItems">${admCart.length === 0 ? '<div class="text-muted text-sm" style="text-align:center;padding:30px 0">Chưa có sản phẩm</div>' : admCart.map(i => admCartItemHtml(i)).join('')}</div>
      <div class="divider"></div>
      <div class="adm-cart-total-row"><span>Tổng cộng:</span><span class="adm-cart-total-val" id="admCartTotal">${fmt(total)}</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px">
        <button class="adm-btn adm-btn-sec adm-btn-sm" style="justify-content:center">💵 Tiền mặt</button>
        <button class="adm-btn adm-btn-sec adm-btn-sm" style="justify-content:center">🏦 Chuyển khoản</button>
      </div>
      <button class="adm-btn adm-btn-primary w-full mt12" style="justify-content:center" onclick="admCheckout()">🧾 Thanh toán & In HĐ</button>
      <button class="adm-btn adm-btn-danger w-full mt8" style="justify-content:center" onclick="admClearCart()">🗑 Xóa giỏ hàng</button>
    </div>
  </div>`;
}

function admCartItemHtml(i) {
  return `<div class="adm-cart-item"><span>${i.icon}</span><span class="adm-cart-item-name">${i.name}</span>
    <div class="adm-cqwrap"><button class="adm-cqbtn" onclick="admChgQty('${i.id}',-1)">−</button><span style="font-size:.82rem;font-weight:700;min-width:16px;text-align:center">${i.qty}</span><button class="adm-cqbtn" onclick="admChgQty('${i.id}',1)">+</button></div>
    <span class="adm-cart-price">${fmt(i.price * i.qty)}</span></div>`;
}
function admAddCart(id, name, price, icon) {
  const ex = admCart.find(i => i.id === id);
  if (ex) ex.qty++; else admCart.push({ id, name, price: parseInt(price), icon, qty: 1 });
  admUpdateCart();
}
function admChgQty(id, d) { const i = admCart.find(x => x.id === id); if (!i) return; i.qty += d; if (i.qty <= 0) admCart = admCart.filter(x => x.id !== id); admUpdateCart(); }
function admClearCart() { admCart = []; admUpdateCart(); toast('Đã xóa giỏ hàng!', 'info'); }
function admCheckout() {
  if (!admCart.length) { toast('Giỏ hàng trống!', 'error'); return; }
  const t = admCart.reduce((s, i) => s + i.price * i.qty, 0);
  admCart = []; admUpdateCart();
  toast(`Thanh toán ${fmt(t)} thành công! 🧾`, 'success');
}
function admUpdateCart() {
  const el = document.getElementById('admCartItems');
  const tv = document.getElementById('admCartTotal');
  if (!el) return;
  const total = admCart.reduce((s, i) => s + i.price * i.qty, 0);
  if (tv) tv.textContent = fmt(total);
  el.innerHTML = admCart.length === 0 ? '<div class="text-muted text-sm" style="text-align:center;padding:30px 0">Chưa có sản phẩm</div>' : admCart.map(admCartItemHtml).join('');
}

// ORDERS 
async function admOrders() {
  const orders = await api('/api/orders');
  document.getElementById('admContent').innerHTML = `
  <div class="adm-page-header"><div><div class="adm-page-title">Đơn hàng Online</div><div class="adm-page-sub">${orders.length} đơn hàng</div></div></div>
  <div class="adm-card" style="padding:0">
    <div class="adm-table-wrap">
      <table class="adm-table">
        <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Trạng thái</th><th>Ngày đặt</th><th>Thao tác</th></tr></thead>
        <tbody>
          ${orders.map(o => {
            const sc = {'Hoàn thành':'green','Đang giao':'blue','Chờ xác nhận':'gold'}[o.status] || 'orange';
            return `<tr>
              <td class="font-bold text-sm">${o.id}</td>
              <td class="font-bold text-sm">${o.customer}</td>
              <td class="text-sm">${o.product}</td>
              <td class="font-bold text-accent">${fmt(o.total)}</td>
              <td><span class="adm-tag adm-tag-${sc}">${o.status}</span></td>
              <td class="text-sm text-muted">${o.date}</td>
              <td>${o.status === 'Chờ xác nhận' ? `<button class="adm-btn adm-btn-success adm-btn-sm" onclick="confirmOrder('${o.id}')">✓ Xác nhận</button>` : ''}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}
async function confirmOrder(id) {
  const d = await api(`/api/orders/${id}/confirm`, { method: 'PATCH' });
  toast(d.message, 'success');
  admRender();
}

// PROMOTIONS 
async function admPromotions() {
  const promos = await api('/api/promotions');
  document.getElementById('admContent').innerHTML = `
  <div class="adm-page-header">
    <div><div class="adm-page-title">Khuyến mãi</div><div class="adm-page-sub">${promos.filter(p => p.status === 'Đang chạy').length} đang hoạt động</div></div>
    <button class="adm-btn adm-btn-primary" onclick="admShowModal('addPromotion')">+ Tạo khuyến mãi</button>
  </div>
  <div class="adm-grid adm-gauto mb24">
    ${promos.map(p => `<div class="adm-card">
      <div class="fxb mb12"><span class="adm-tag adm-tag-${p.status==='Đang chạy'?'green':p.status==='Sắp diễn ra'?'gold':'orange'}">${p.status}</span><span>${p.promo_type.includes('%') ? '🏷️' : '🎁'}</span></div>
      <div style="font-family:var(--ff);font-size:1rem;font-weight:800;margin-bottom:6px">${p.name}</div>
      <div style="font-family:monospace;font-size:1.1rem;font-weight:800;color:var(--accent);background:var(--cream2);padding:6px 10px;border-radius:6px;text-align:center;margin-bottom:10px">${p.code}</div>
      <div class="text-sm text-muted mb8">${p.promo_type} — Giảm ${p.value}%</div>
      <div class="fxb mt12"><span class="text-sm text-muted">Đã dùng: <strong class="text-gold">${p.used}</strong></span>
        <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="deletePromo('${p.id}')">🗑</button></div>
    </div>`).join('')}
  </div>`;
}
async function deletePromo(id) {
  const d = await api(`/api/promotions/${id}`, { method: 'DELETE' });
  toast(d.message, 'info');
  admRender();
}

  // VENDORS
  async function admVendors() {
  const vendors = await api('/api/vendors');
  const totalDebt = vendors.reduce((s, v) => s + v.debt, 0);
  document.getElementById('admContent').innerHTML = `
  <div class="adm-page-header">
    <div><div class="adm-page-title">Nhà cung cấp</div><div class="adm-page-sub">Tổng công nợ: ${fmt(totalDebt)}</div></div>
  </div>
  <div class="adm-grid adm-g3">
    ${vendors.map(v => `<div class="adm-card">
      <div class="fxb mb12"><div><div style="font-family:var(--ff);font-weight:800">${v.name}</div><div class="text-muted text-sm">${v.id}</div></div><span class="adm-tag adm-tag-blue">${v.category}</span></div>
      <div class="text-sm mb8">👤 ${v.contact}</div>
      <div class="text-sm mb8">📞 ${v.phone}</div>
      <div class="divider"></div>
      <div class="fxb mb8"><span class="text-sm text-muted">Công nợ:</span><span class="font-bold text-${v.debt > 0 ? 'pink' : 'teal'}">${v.debt > 0 ? fmt(v.debt) : 'Không nợ'}</span></div>
      <div class="fxb"><span class="text-sm text-muted">${v.total_orders} đơn hàng</span><button class="adm-btn adm-btn-primary adm-btn-sm" onclick="toast('Trả nợ ${v.name}...','info')">💳 Trả nợ</button></div>
    </div>`).join('')}
  </div>`;
}

// STAFF 
async function admStaff() {
  const staff = await api('/api/staff');
  document.getElementById('admContent').innerHTML = `
  <div class="adm-page-header">
    <div><div class="adm-page-title">Nhân viên</div><div class="adm-page-sub">${staff.length} nhân viên</div></div>
    <button class="adm-btn adm-btn-primary" onclick="toast('Thêm nhân viên...','info')">+ Thêm NV</button>
  </div>
  <div class="adm-staff-grid mb24">
    ${staff.map(s => `<div class="adm-staff-card">
      <div class="adm-staff-avatar" style="background:${s.color}">${s.name.split(' ').pop().charAt(0)}</div>
      <div class="adm-staff-name">${s.name}</div>
      <div class="adm-staff-role">${s.role}</div>
      <div class="text-muted text-sm mt8">📞 ${s.phone}</div>
      <div class="text-muted text-sm mt8">🕐 ${s.shift}</div>
      <div class="adm-staff-stats">
        <div style="text-align:center"><div class="adm-sval">${s.work_days}</div><div class="adm-slabel">Ngày công</div></div>
        <div style="text-align:center"><div class="adm-sval text-accent">${fmtShort(s.sales)}</div><div class="adm-slabel">Doanh số</div></div>
      </div>
    </div>`).join('')}
  </div>`;
}

// REPORTS
async function admReports() {
  const [dash, staff] = await Promise.all([api('/api/dashboard'), api('/api/staff')]);
  const rev = dash.monthly_revenue;
  const mx = Math.max(...rev);
  document.getElementById('admContent').innerHTML = `
  <div class="adm-page-header">
    <div><div class="adm-page-title">Báo cáo & Thống kê</div></div>
    <button class="adm-btn adm-btn-sec">📥 Xuất</button>
  </div>
  <div class="adm-grid adm-g4 mb24">
    <div class="adm-stat" style="--sc:var(--accent)"><div class="adm-stat-icon">💰</div><div class="adm-stat-val">48M</div><div class="adm-stat-label">Doanh thu tháng</div><div class="adm-stat-change">↑ +12.4%</div></div>
    <div class="adm-stat" style="--sc:var(--teal)"><div class="adm-stat-icon">🛒</div><div class="adm-stat-val">186</div><div class="adm-stat-label">Giao dịch</div><div class="adm-stat-change">↑ +8.2%</div></div>
    <div class="adm-stat" style="--sc:var(--gold)"><div class="adm-stat-icon">👥</div><div class="adm-stat-val">12</div><div class="adm-stat-label">Khách hàng mới</div></div>
    <div class="adm-stat" style="--sc:var(--purple)"><div class="adm-stat-icon">⭐</div><div class="adm-stat-val">4.8</div><div class="adm-stat-label">Điểm đánh giá TB</div></div>
  </div>
  <div class="adm-grid mb16" style="grid-template-columns:3fr 2fr;gap:16px">
    <div class="adm-card">
      <div class="adm-card-title">Doanh thu 2024 (triệu đ)</div>
      <div class="adm-chart-wrap">${rev.map((v, i) => `<div class="adm-bar" style="height:${Math.round(v/mx*100)}%"><div class="adm-tip">T${i+1}: ${v}M</div></div>`).join('')}</div>
      <div class="adm-chart-labels">${['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'].map(m => `<div class="adm-chart-label">${m}</div>`).join('')}</div>
    </div>
    <div class="adm-card">
      <div class="adm-card-title">Phân bổ doanh thu</div>
      ${[{n:'Spa & Grooming',p:35,c:'accent'},{n:'Thức ăn & PK',p:28,c:'blue'},{n:'Lưu trú',p:18,c:'teal'},{n:'Khám & Điều trị',p:12,c:'gold'},{n:'Khác',p:7,c:'purple'}].map(x => `
        <div style="margin-bottom:12px">
          <div class="fxb mb8"><span class="text-sm">${x.n}</span><span class="text-sm font-bold">${x.p}%</span></div>
          <div class="adm-progress"><div class="adm-progress-fill" style="width:${x.p}%;background:var(--${x.c})"></div></div>
        </div>`).join('')}
    </div>
  </div>
  <div class="adm-card">
    <div class="adm-card-title">Hiệu suất nhân viên</div>
    ${staff.map(s => `
      <div style="margin-bottom:12px">
        <div class="fxb mb8"><div class="fxc gap8"><div style="width:8px;height:8px;border-radius:50%;background:${s.color}"></div><span class="text-sm font-bold">${s.name}</span></div><span class="text-sm text-accent font-bold">${fmtShort(s.sales)}</span></div>
        <div class="adm-progress"><div class="adm-progress-fill" style="width:${Math.round(s.sales/45000000*100)}%;background:${s.color}"></div></div>
      </div>`).join('')}
  </div>`;
}

// ADMIN MODAL 
function admShowModal(type) {
  const cfg = {
    addPet: {
      title: '🐾 Thêm hồ sơ thú cưng',
      body: `<div class="adm-form-row"><div class="adm-form-group"><label class="adm-label">Tên thú cưng</label><input class="adm-input" id="mPetName" placeholder="Bông"></div><div class="adm-form-group"><label class="adm-label">Loài</label><select class="adm-select" id="mSpecies"><option>Chó</option><option>Mèo</option><option>Thỏ</option></select></div></div><div class="adm-form-row"><div class="adm-form-group"><label class="adm-label">Giống</label><input class="adm-input" id="mBreed" placeholder="Poodle..."></div><div class="adm-form-group"><label class="adm-label">Tuổi</label><input class="adm-input" type="number" id="mAge" placeholder="2"></div></div>`,
      foot: `<button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Hủy</button><button class="adm-btn adm-btn-primary" onclick="savePet()">💾 Lưu</button>`,
    },
    addCustomer: {
      title: '👥 Thêm khách hàng',
      body: `<div class="adm-form-row"><div class="adm-form-group"><label class="adm-label">Họ tên</label><input class="adm-input" id="mCusName" placeholder="Nguyễn Văn A"></div><div class="adm-form-group"><label class="adm-label">SĐT</label><input class="adm-input" id="mCusPhone" placeholder="09xx"></div></div><div class="adm-form-group"><label class="adm-label">Email</label><input class="adm-input" id="mCusEmail" placeholder="email@..."></div>`,
      foot: `<button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Hủy</button><button class="adm-btn adm-btn-primary" onclick="saveCustomer()">💾 Lưu</button>`,
    },
    addAppointment: {
      title: '📅 Đặt lịch dịch vụ',
      body: `<div class="adm-form-row"><div class="adm-form-group"><label class="adm-label">Dịch vụ</label><select class="adm-select" id="mAptSvc"><option>Spa & Tắm</option><option>Cắt tỉa lông</option><option>Khám bệnh</option><option>Tiêm phòng</option></select></div><div class="adm-form-group"><label class="adm-label">Ngày & giờ</label><input class="adm-input" type="datetime-local" id="mAptDate"></div></div><div class="adm-form-group"><label class="adm-label">Giá dịch vụ</label><input class="adm-input" type="number" id="mAptPrice" placeholder="200000"></div>`,
      foot: `<button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Hủy</button><button class="adm-btn adm-btn-primary" onclick="admCloseModal();toast('Đã đặt lịch!','success')">📅 Đặt lịch</button>`,
    },
    addTransaction: {
      title: '💳 Giao dịch mới',
      body: `<div class="adm-form-group"><label class="adm-label">Mô tả giao dịch</label><input class="adm-input" placeholder="VD: Mua hạt Royal Canin 2kg"></div><div class="adm-form-row"><div class="adm-form-group"><label class="adm-label">Số tiền (đ)</label><input class="adm-input" type="number" placeholder="0"></div><div class="adm-form-group"><label class="adm-label">Hình thức TT</label><select class="adm-select"><option>Tiền mặt</option><option>Chuyển khoản</option></select></div></div>`,
      foot: `<button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Hủy</button><button class="adm-btn adm-btn-primary" onclick="admCloseModal();toast('Đã ghi nhận giao dịch!','success')">💾 Ghi nhận</button>`,
    },
    addProduct: {
      title: '📦 Thêm sản phẩm kho',
      body: `<div class="adm-form-group"><label class="adm-label">Tên sản phẩm</label><input class="adm-input" placeholder="VD: Hạt Purina Pro Plan"></div><div class="adm-form-row"><div class="adm-form-group"><label class="adm-label">Số lượng</label><input class="adm-input" type="number" placeholder="0"></div><div class="adm-form-group"><label class="adm-label">Giá bán (đ)</label><input class="adm-input" type="number" placeholder="0"></div></div>`,
      foot: `<button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Hủy</button><button class="adm-btn adm-btn-primary" onclick="admCloseModal();toast('Đã thêm sản phẩm!','success')">💾 Thêm</button>`,
    },
    addPromotion: {
      title: '🎁 Tạo khuyến mãi',
      body: `<div class="adm-form-group"><label class="adm-label">Tên chương trình</label><input class="adm-input" id="mPromoName" placeholder="Mừng Tết..."></div><div class="adm-form-row"><div class="adm-form-group"><label class="adm-label">Loại</label><select class="adm-select" id="mPromoType"><option>Giảm giá %</option><option>Combo</option></select></div><div class="adm-form-group"><label class="adm-label">Mức giảm (%)</label><input class="adm-input" type="number" id="mPromoVal" placeholder="20"></div></div><div class="adm-form-group"><label class="adm-label">Mã giảm giá</label><input class="adm-input" id="mPromoCode" placeholder="TET2025"></div><div class="adm-form-row"><div class="adm-form-group"><label class="adm-label">Ngày bắt đầu</label><input class="adm-input" type="date" id="mPromoFrom"></div><div class="adm-form-group"><label class="adm-label">Ngày kết thúc</label><input class="adm-input" type="date" id="mPromoTo"></div></div>`,
      foot: `<button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Hủy</button><button class="adm-btn adm-btn-primary" onclick="savePromotion()">🎁 Tạo</button>`,
    },
  };
  const c = cfg[type];
  if (!c) return;
  document.getElementById('admModalTitle').textContent = c.title;
  document.getElementById('admModalBody').innerHTML = c.body;
  document.getElementById('admModalFoot').innerHTML = c.foot;
  document.getElementById('admModalOverlay').classList.add('open');
}

function admCloseModal() {
  document.getElementById('admModalOverlay').classList.remove('open');
}

async function savePet() {
  const payload = {
    name: document.getElementById('mPetName').value,
    species: document.getElementById('mSpecies').value,
    breed: document.getElementById('mBreed').value,
    age: document.getElementById('mAge').value,
  };
  const d = await api('/api/pets', { method: 'POST', body: JSON.stringify(payload) });
  admCloseModal();
  toast(d.message, 'success');
  admRender();
}

async function saveCustomer() {
  const payload = {
    name:  document.getElementById('mCusName').value,
    phone: document.getElementById('mCusPhone').value,
    email: document.getElementById('mCusEmail').value,
  };
  const d = await api('/api/customers', { method: 'POST', body: JSON.stringify(payload) });
  admCloseModal();
  toast(d.message, 'success');
  admRender();
}

async function savePromotion() {
  const payload = {
    name:       document.getElementById('mPromoName').value,
    promo_type: document.getElementById('mPromoType').value,
    value:      document.getElementById('mPromoVal').value,
    code:       document.getElementById('mPromoCode').value,
    valid_from: document.getElementById('mPromoFrom').value,
    valid_to:   document.getElementById('mPromoTo').value,
  };
  const d = await api('/api/promotions', { method: 'POST', body: JSON.stringify(payload) });
  admCloseModal();
  toast(d.message, 'success');
  admRender();
}
async function openCheckinModal() {

  const rooms = await api('/api/rooms');
  const pets  = await api('/api/pets');

  const availableRooms =
    rooms.filter(r => r.status === 'available');

  document.getElementById('admModalTitle').textContent =
    '🏠 Nhận phòng lưu trú';

  document.getElementById('admModalBody').innerHTML = `

    <div class="adm-form-row">

      <div class="adm-form-group">

        <label class="adm-label">
          Chọn phòng
        </label>

        <select class="adm-select" id="checkinRoom">

          ${availableRooms.map(r => `
            <option value="${r.id}">
              ${r.id}
            </option>
          `).join('')}

        </select>

      </div>

      <div class="adm-form-group">

        <label class="adm-label">
          Ngày nhận
        </label>

        <input
          type="datetime-local"
          class="adm-input"
          id="checkinDate">

      </div>

    </div>

    <div class="adm-form-group">

      <label class="adm-label">
        Chọn thú cưng
      </label>

      <select
        class="adm-select"
        id="checkinPet"
        onchange="fillOwnerInfo()">

        <option value="">
          -- Chọn thú cưng --
        </option>

        ${pets.map(p => `
          <option
            value="${p.id}"
            data-owner="${p.owner_name || ''}">
            ${p.name} (${p.id})
          </option>
        `).join('')}

      </select>

    </div>

    <div class="adm-form-group">

      <label class="adm-label">
        Chủ nuôi
      </label>

      <input
        class="adm-input"
        id="ownerName"
        readonly>

    </div>

  `;

  document.getElementById('admModalFoot').innerHTML = `

    <button
      class="adm-btn adm-btn-sec"
      onclick="admCloseModal()">
      Hủy
    </button>

    <button
      class="adm-btn adm-btn-primary"
      onclick="confirmCheckin()">
      🏠 Xác nhận nhận phòng
    </button>

  `;

  document.getElementById('admModalOverlay')
    .classList.add('open');
}
async function confirmCheckin() {

  const room =
    document.getElementById('checkinRoom').value;

  const petId =
    document.getElementById('checkinPet').value;

  const date =
    document.getElementById('checkinDate').value;

  if (!room) {

    toast(
      'Vui lòng chọn phòng',
      'error'
    );

    return;
  }

  if (!petId) {

    toast(
      'Vui lòng chọn thú cưng',
      'error'
    );

    return;
  }

  if (!date) {

    toast(
      'Vui lòng chọn ngày nhận',
      'error'
    );

    return;
  }

  try {

    const roomInfo =
      await api('/api/rooms');

    const currentRoom =
      roomInfo.find(r => r.id === room);

    if (
      currentRoom &&
      currentRoom.status === 'occupied'
    ) {

      toast(
        'Phòng đã có khách',
        'error'
      );

      return;
    }

    const result =
      await api(`/api/rooms/${room}`, {

        method: 'PATCH',

        body: JSON.stringify({
        status: 'occupied',
        pet_id: petId,
        checkin_date: date
      })

      });

    admCloseModal();

    toast(
      result.message ||
      'Nhận phòng thành công',
      'success'
    );

    admBoarding();

  } catch (err) {

    console.error(err);

    toast(
      'Lỗi nhận phòng',
      'error'
    );

  }
}
function fillOwnerInfo() {

  const petSelect =
    document.getElementById('checkinPet');

  const owner =
    petSelect.options[
      petSelect.selectedIndex
    ].dataset.owner || '';

  document.getElementById('ownerName').value =
    owner;
}

async function checkoutRoom(id) {
  if (!confirm(`Bạn có chắc chắn muốn làm thủ tục TRẢ PHÒNG cho phòng ${id}? \nPhòng sẽ tự động chuyển sang trạng thái chờ dọn dẹp.`)) {
    return;
  }


  const response = await api(`/api/rooms/${id}/checkout`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'cleaning' })
  });

  admCloseModal(); 
  if (toast) toast(response.message || `Đã trả phòng ${id} thành công!`, 'success');
  admBoarding(); 

}
async function finishCleaningRoom(id) {

  const response = await api(`/api/rooms/${id}/clean`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'available' })
  });

  admCloseModal(); 
  if (toast) toast(response.message || `Phòng ${id} đã sạch sẽ, sẵn sàng đón khách mới!`, 'success');
  admBoarding(); 
}

// HIỂN THỊ CHI TIẾT PHÒNG VÀ CÁC THAOTÁC LOGIC
async function showRoomInfo(id) {
  const room = await api(`/api/rooms/${id}`);
  
  const statusLabels = {
    'occupied': '🔴 Đang có khách',
    'available': '🟢 Phòng trống',
    'cleaning': '🟡 Đang dọn dẹp'
  };

  document.getElementById('admModalTitle').textContent = `🏨 Quản lý chi tiết: Phòng ${room.id}`;

  let bodyHtml = `
    <div style="font-family:var(--ff); padding: 5px;">
      <div class="adm-grid adm-g2" style="gap:16px; margin-bottom:20px">
        <div><strong>Mã phòng:</strong> <div class="mt4 font-bold" style="font-size:1.1rem">${room.id}</div></div>
        <div><strong>Loại phòng:</strong> <div class="mt4">${room.room_type || 'Phòng tiêu chuẩn'}</div></div>
        <div><strong>Trạng thái:</strong> <div class="mt4"><span class="adm-tag adm-tag-${room.status === 'occupied' ? 'green' : room.status === 'available' ? 'blue' : 'gold'}">${statusLabels[room.status]}</span></div></div>
        <div><strong>Giá phòng/ngày:</strong> <div class="mt4 text-accent font-bold">${typeof fmt !== 'undefined' ? fmt(room.price || 0) : room.price}</div></div>
      </div>
      <div class="divider"></div>
  `;

  if (room.status === 'occupied') {
    // Tự động lấy class định dạng màu theo Hạng thành viên đồng bộ với phần CRM
    const levelClass = room.owner_level ? { Diamond: 'blue', Gold: 'gold', Silver: 'purple', Bronze: 'orange' }[room.owner_level] : 'sec';

    bodyHtml += `
      <div style="background:var(--cream); padding:16px; border-radius:8px; margin-top:12px; border-left:4px solid var(--pink)">
        <h4 style="margin:0 0 12px 0; color:var(--accent); display:flex; align-items:center; gap:6px;">🐾 Thông tin khách hàng & Thú cưng</h4>
        
        <div class="adm-grid adm-g2" style="gap:12px; font-size:0.9rem">
          <div><strong>Tên thú cưng:</strong> <span style="color:var(--text); font-weight:600;">${room.pet_name || 'Chưa cập nhật'}</span></div>
          <div><strong>Chủ nuôi:</strong> <span class="font-bold text-accent">${room.owner_name || 'Chưa cập nhật'}</span></div>
          
          <div><strong>Ngày nhận phòng:</strong> <span>${room.checkin_date || '—'}</span></div>
          <div><strong>Số điện thoại:</strong> <span style="color:var(--text); font-weight:600;">${room.owner_phone || 'Chưa cập nhật'}</span></div>
          
          ${room.owner_level ? `
          <div style="grid-column: span 2; display:flex; align-items:center; gap:8px; margin-top:4px;">
            <strong>Hạng thành viên:</strong> 
            <span class="adm-tag adm-tag-${levelClass}">${room.owner_level}</span>
          </div>
          ` : ''}

          <div style="grid-column: span 2; margin-top:4px;">
            <strong>Ghi chú/Dị ứng:</strong> <span class="text-pink" style="font-weight:600;">${room.notes || 'Không có'}</span>
          </div>
        </div>
      </div>
    `;
  } else if (room.status === 'cleaning') {
    bodyHtml += `
      <p class="text-muted" style="text-align:center; padding:10px 0">🧹 Phòng đang trong quá trình vệ sinh, khử trùng sạch sẽ trước khi đón khách tiếp theo.</p>
    `;
  } else {
    bodyHtml += `
      <p class="text-teal" style="text-align:center; padding:10px 0">🏠 Phòng trống sạch sẽ, sẵn sàng đón khách vào ở.</p>
    `;
  }

  bodyHtml += `</div>`;
  document.getElementById('admModalBody').innerHTML = bodyHtml;

  let footHtml = `<button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Đóng</button>`;

  if (room.status === 'occupied') {
    footHtml += `
      <button class="adm-btn adm-btn-danger" onclick="checkoutRoom('${room.id}')">
        🏃 Rời phòng (Trả phòng)
      </button>
    `;
  } else if (room.status === 'cleaning') {
    footHtml += `
      <button class="adm-btn adm-btn-success" onclick="finishCleaningRoom('${room.id}')">
        ✅ Đã dọn xong (Hoàn phòng)
      </button>
    `;
  } else if (room.status === 'available') {
    footHtml += `
      <button class="adm-btn adm-btn-primary" onclick="admCloseModal(); openCheckinModal('${room.id}')">
        🔑 Cho thuê phòng
      </button>
    `;
  }

  document.getElementById('admModalFoot').innerHTML = footHtml;
  document.getElementById('admModalOverlay').classList.add('open');
}