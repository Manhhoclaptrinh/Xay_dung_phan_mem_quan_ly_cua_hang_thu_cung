// NAVIGATION

let admPage = 'dashboard';
const admLabels = {
  dashboard: 'Dashboard', pets: 'Hồ sơ Thú cưng', customers: 'Khách hàng',
  inventory: 'Kho hàng', appointments: 'Lịch dịch vụ', boarding: 'Lưu trú (Hotel)',
  pos: 'Bán hàng (POS)', orders: 'Đơn hàng online', promotions: 'Khuyến mãi',
  vendors: 'Nhà cung cấp', staff: 'Nhân viên', reports: 'Báo cáo', reminders: 'Lịch tiêm phòng',
  services: 'Dịch vụ đã sử dụng',
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
    vendors: admVendors, staff: admStaff, reports: admReports,bookings: admBookings, 
    reminders: admReminders, services: admServices,
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

                <button
                  class="adm-btn adm-btn-sec adm-btn-sm"
                  onclick="viewMedical('${p.id}')"
                >
                  🏥
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
        <thead><tr><th>Khách hàng</th><th>Liên hệ</th><th>Hạng</th><th>Điểm</th><th>Tổng chi</th><th>Từ ngày</th><th>Thao tác</th><th>Thú cưng</th></tr></thead>
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
              <td>
                ${c.pets.map(p =>
                  `<span class="adm-tag adm-tag-blue">${p}</span>`
                ).join('')}
              </td>
              <td><div class="flex gap6"><button class="adm-btn adm-btn-sec adm-btn-sm" onclick="toast('Xem ${c.name}','info')">👁</button><button class="adm-btn adm-btn-sec adm-btn-sm">✏️</button></div></td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// INVENTORY
async function admInventory(
  search = '',
  category = '',
  brand = '',
  stock = ''
) {

  const items = await api(
    `/api/inventory?search=${search}&category=${category}&brand=${brand}&stock=${stock}`
  );

  const alerts = await api('/api/inventory-alerts');

  const categories = await api('/api/categories');

  document.getElementById('admContent').innerHTML = `

  <div class="adm-page-header">

    <div>
      <div class="adm-page-title">
        Quản lý Kho hàng
      </div>

      <div class="adm-page-sub">
        ${items.length} sản phẩm trong kho
      </div>
    </div>

    <div class="flex gap8">

      <button
        class="adm-btn adm-btn-sec"
        onclick="admShowCategories()"
      >
        📂 Danh mục
      </button>

      <button
        class="adm-btn adm-btn-sec"
        onclick="admImportReceipt()"
      >
        📥 Nhập kho
      </button>

      <button
        class="adm-btn adm-btn-sec"
        onclick="admExportReceipt()"
      >
        📤 Xuất kho
      </button>

      <button
        class="adm-btn adm-btn-primary"
        onclick="admAddProduct()"
      >
        + Thêm SP
      </button>

    </div>

  </div>

  <!-- ALERTS -->

  <div class="adm-grid adm-g4 mb16">

    <div class="adm-stat">
      <div class="adm-stat-icon">⚠️</div>
      <div class="adm-stat-val">
        ${alerts.low_stock}
      </div>
      <div class="adm-stat-label">
        Sắp hết hàng
      </div>
    </div>

    <div class="adm-stat">
      <div class="adm-stat-icon">❌</div>
      <div class="adm-stat-val">
        ${alerts.out_stock}
      </div>
      <div class="adm-stat-label">
        Hết hàng
      </div>
    </div>

    <div class="adm-stat">
      <div class="adm-stat-icon">⏰</div>
      <div class="adm-stat-val">
        ${alerts.expiring}
      </div>
      <div class="adm-stat-label">
        Sắp hết hạn
      </div>
    </div>

    <div class="adm-stat">
      <div class="adm-stat-icon">📦</div>
      <div class="adm-stat-val">
        ${alerts.over_stock}
      </div>
      <div class="adm-stat-label">
        Tồn quá nhiều
      </div>
    </div>

  </div>

  <!-- FILTER -->

  <div class="adm-card mb16">

    <div class="flex gap8 wrap">

      <input
        id="invSearch"
        class="adm-input"
        placeholder="Tìm sản phẩm..."
        value="${search}"
        style="width:220px"
      >

      <select
        id="invCategory"
        class="adm-input"
        style="width:180px"
      >
        <option value="">Tất cả danh mục</option>

        ${categories.map(c => `
          <option
            value="${c.id}"
            ${category === c.id ? 'selected' : ''}
          >
            ${c.name}
          </option>
        `).join('')}

      </select>

      <select
        id="invStock"
        class="adm-input"
        style="width:160px"
      >
        <option value="">Tất cả tồn kho</option>

        <option
          value="available"
          ${stock === 'available' ? 'selected' : ''}
        >
          Còn hàng
        </option>

        <option
          value="low"
          ${stock === 'low' ? 'selected' : ''}
        >
          Sắp hết
        </option>

        <option
          value="out"
          ${stock === 'out' ? 'selected' : ''}
        >
          Hết hàng
        </option>

      </select>

      <button
        class="adm-btn adm-btn-primary"
        onclick="searchInventory()"
      >
        🔍 Lọc
      </button>

    </div>

  </div>

  <!-- TABLE -->

  <div class="adm-card" style="padding:0">

    <div class="adm-table-wrap">

      <table class="adm-table">

        <thead>

          <tr>

            <th>SP</th>

            <th>Danh mục</th>

            <th>Giá bán</th>

            <th>Tồn kho</th>

            <th>Barcode</th>

            <th>Trạng thái</th>

            <th>Thao tác</th>

          </tr>

        </thead>

        <tbody>

          ${items.map(i => `

          <tr>

            <td>

                <div>

                  <div class="font-bold">
                    ${i.name}
                  </div>

                  <div class="text-sm text-muted">
                    ${i.id}
                  </div>

                </div>

            </td>

            <td>
              ${i.category_name || '-'}
            </td>

            <td class="font-bold text-accent">
              ${fmt(i.sell_price)}
            </td>

            <td>

              <div class="
                ${i.quantity < i.min_qty ? 'text-danger font-bold' : ''}
              ">
                ${i.quantity}
              </div>

            </td>

            <td>
              ${i.barcode || '-'}
            </td>

            <td>

              <span class="
                adm-tag
                ${i.status === 'OK'
                  ? 'adm-tag-green'
                  : 'adm-tag-red'}
              ">
                ${i.status}
              </span>

            </td>

            <td>

              <div class="flex gap6">

                <button
                  class="adm-btn adm-btn-sec adm-btn-sm"
                  onclick="viewProduct('${i.id}')"
                >
                  👁
                </button>

                <button
                  class="adm-btn adm-btn-sec adm-btn-sm"
                  onclick="editProduct('${i.id}')"
                >
                  ✏️
                </button>

                <button
                  class="adm-btn adm-btn-danger adm-btn-sm"
                  onclick="deleteProduct('${i.id}')"
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

  <!-- CATEGORY -->

  <div class="adm-card mt16">

    <div class="adm-card-title">
      📂 Danh mục sản phẩm
    </div>

    <div class="adm-grid adm-g4">

      ${categories.map(c => `

      <div
        style="
          background:var(--cream);
          padding:16px;
          border-radius:14px;
        "
      >

        <div class="font-bold mb8">
          ${c.name}
        </div>

        <div class="text-muted text-sm">
          ${c.products_count} sản phẩm
        </div>

      </div>

      `).join('')}

    </div>

  </div>

  `;
}

function searchInventory() {

  admInventory(

    document.getElementById('invSearch').value,

    document.getElementById('invCategory').value,

    '',

    document.getElementById('invStock').value
  );
}

async function viewProduct(id) {

  const p = await api(`/api/inventory/${id}`);

  document.getElementById('admModalTitle').textContent =
    `📦 ${p.name}`;

  document.getElementById('admModalBody').innerHTML = `

    <div class="adm-grid adm-g2">

      <div>

        <div class="mb12">

          <div class="text-muted text-sm">
            Mã SP
          </div>

          <div class="font-bold">
            ${p.id}
          </div>

        </div>

        <div class="mb12">

          <div class="text-muted text-sm">
            Danh mục
          </div>

          <div class="font-bold">
            ${p.category_name || '-'}
          </div>

        </div>

        <div class="mb12">

          <div class="text-muted text-sm">
            Giá bán
          </div>

          <div class="font-bold text-accent">
            ${fmt(p.sell_price)}
          </div>

        </div>

        <div class="mb12">

          <div class="text-muted text-sm">
            Tồn kho
          </div>

          <div class="font-bold">
            ${p.quantity}
          </div>

        </div>

        <div class="mb12">

          <div class="text-muted text-sm">
            Barcode
          </div>

          <div class="font-bold">
            ${p.barcode || '-'}
          </div>

        </div>

      </div>

    </div>

    <div class="mt16">

      <div class="text-muted text-sm mb8">
        Mô tả
      </div>

      <div>
        ${p.description || 'Không có mô tả'}
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

async function admAddProduct() {

  const categories = await api('/api/categories');

  document.getElementById('admModalTitle').textContent =
    '➕ Thêm sản phẩm';

  document.getElementById('admModalBody').innerHTML = `

    <div class="adm-form-row">

      <div class="adm-form-group">
        <label class="adm-label">
          Tên SP
        </label>

        <input
          id="pName"
          class="adm-input"
        >
      </div>

      <div class="adm-form-group">

        <label class="adm-label">
          Danh mục
        </label>

        <select
          id="pCategory"
          class="adm-input"
        >

          ${categories.map(c => `
            <option value="${c.id}">
              ${c.name}
            </option>
          `).join('')}

        </select>

      </div>

    </div>

    <div class="adm-form-row">

      <div class="adm-form-group">
        <label class="adm-label">
          Giá nhập
        </label>

        <input
          id="pImport"
          type="number"
          class="adm-input"
        >
      </div>

      <div class="adm-form-group">
        <label class="adm-label">
          Giá bán
        </label>

        <input
          id="pSell"
          type="number"
          class="adm-input"
        >
      </div>

    </div>

    <div class="adm-form-row">

      <div class="adm-form-group">
        <label class="adm-label">
          Số lượng
        </label>

        <input
          id="pQty"
          type="number"
          class="adm-input"
        >
      </div>

    </div>

    <div class="adm-form-group">

      <label class="adm-label">
        Barcode
      </label>

      <input
        id="pBarcode"
        class="adm-input"
      >

    </div>

    <div class="adm-form-group">

      <label class="adm-label">
        Mô tả
      </label>

      <textarea
        id="pDesc"
        class="adm-input"
        rows="4"
      ></textarea>

    </div>

  `;

  document.getElementById('admModalFoot').innerHTML = `

    <button
      class="adm-btn adm-btn-sec"
      onclick="admCloseModal()"
    >
      Hủy
    </button>

    <button
      class="adm-btn adm-btn-primary"
      onclick="saveProduct()"
    >
      💾 Lưu SP
    </button>

  `;

  document.getElementById('admModalOverlay')
    .classList.add('open');
}

async function saveProduct() {

  const payload = {

    name: document.getElementById('pName').value,

    category_id:
      document.getElementById('pCategory').value,

    import_price:
      document.getElementById('pImport').value,

    sell_price:
      document.getElementById('pSell').value,

    quantity:
      document.getElementById('pQty').value,

    barcode:
      document.getElementById('pBarcode').value,

    description:
      document.getElementById('pDesc').value,
  };

  const d = await api('/api/inventory', {

    method: 'POST',

    body: JSON.stringify(payload)
  });

  toast(d.message, 'success');

  admCloseModal();

  admRender();
}

async function editProduct(id) {

  const p = await api(`/api/inventory/${id}`);
  const categories = await api('/api/categories');

  document.getElementById('admModalTitle').textContent =
    `✏️ Chỉnh sửa ${p.name}`;

  document.getElementById('admModalBody').innerHTML = `

    <div class="adm-form-row">

      <div class="adm-form-group">
        <label class="adm-label">Tên SP</label>

        <input
          id="ePName"
          class="adm-input"
          value="${p.name}"
        >
      </div>

      <div class="adm-form-group">
        <label class="adm-label">Danh mục</label>

        <select
          id="ePCategory"
          class="adm-input"
        >

          ${categories.map(c => `
            <option
              value="${c.id}"
              ${p.category_id === c.id ? 'selected' : ''}
            >
              ${c.name}
            </option>
          `).join('')}

        </select>
      </div>

    </div>

    <div class="adm-form-row">

      <div class="adm-form-group">
        <label class="adm-label">Thương hiệu</label>

        <input
          id="ePBrand"
          class="adm-input"
          value="${p.brand || ''}"
        >
      </div>

      <div class="adm-form-group">
        <label class="adm-label">Nhà cung cấp</label>

        <input
          id="ePSupplier"
          class="adm-input"
          value="${p.supplier || ''}"
        >
      </div>

    </div>

    <div class="adm-form-row">

      <div class="adm-form-group">
        <label class="adm-label">Giá nhập</label>

        <input
          id="ePImport"
          type="number"
          class="adm-input"
          value="${p.import_price}"
        >
      </div>

      <div class="adm-form-group">
        <label class="adm-label">Giá bán</label>

        <input
          id="ePSell"
          type="number"
          class="adm-input"
          value="${p.sell_price}"
        >
      </div>

    </div>

    <div class="adm-form-row">

      <div class="adm-form-group">
        <label class="adm-label">Số lượng</label>

        <input
          id="ePQty"
          type="number"
          class="adm-input"
          value="${p.quantity}"
        >
      </div>

      <div class="adm-form-group">
        <label class="adm-label">SL tối thiểu</label>

        <input
          id="ePMinQty"
          type="number"
          class="adm-input"
          value="${p.min_qty}"
        >
      </div>

    </div>

    <div class="adm-form-row">

      <div class="adm-form-group">
        <label class="adm-label">Hạn sử dụng</label>

        <input
          id="ePExpiry"
          type="date"
          class="adm-input"
          value="${p.expiry || ''}"
        >
      </div>

    </div>

    <div class="adm-form-group">
      <label class="adm-label">Barcode</label>

      <input
        id="ePBarcode"
        class="adm-input"
        value="${p.barcode || ''}"
      >
    </div>

    <div class="adm-form-group">
      <label class="adm-label">Mô tả</label>

      <textarea
        id="ePDesc"
        class="adm-input"
        rows="4"
      >${p.description || ''}</textarea>
    </div>
  `;

  document.getElementById('admModalFoot').innerHTML = `

    <button
      class="adm-btn adm-btn-sec"
      onclick="admCloseModal()"
    >
      Hủy
    </button>

    <button
      class="adm-btn adm-btn-primary"
      onclick="updateProduct('${p.id}')"
    >
      💾 Lưu thay đổi
    </button>
  `;

  document.getElementById('admModalOverlay')
    .classList.add('open');
}

async function updateProduct(id) {

  const payload = {

    name:
      document.getElementById('ePName').value,

    category_id:
      document.getElementById('ePCategory').value,

    brand:
      document.getElementById('ePBrand').value,

    supplier:
      document.getElementById('ePSupplier').value,

    import_price:
      document.getElementById('ePImport').value,

    sell_price:
      document.getElementById('ePSell').value,

    quantity:
      document.getElementById('ePQty').value,

    min_qty:
      document.getElementById('ePMinQty').value,

    expiry:
      document.getElementById('ePExpiry').value,

    barcode:
      document.getElementById('ePBarcode').value,

    description:
      document.getElementById('ePDesc').value,
  };

  const d = await api(`/api/inventory/${id}`, {

    method: 'PUT',

    body: JSON.stringify(payload)
  });

  toast(d.message, 'success');

  admCloseModal();

  admRender();
}

async function deleteProduct(id) {

  if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
    return;
  }

  const d = await api(`/api/inventory/${id}`, {

    method: 'DELETE'
  });

  toast(d.message, 'success');

  admRender();
}

async function admShowCategories() {

  const categories = await api('/api/categories');

  document.getElementById('admModalTitle').textContent =
    '📂 Quản lý danh mục';

  document.getElementById('admModalBody').innerHTML = `

    <div class="mb16">

      <button
        class="adm-btn adm-btn-primary"
        onclick="showAddCategoryForm()"
      >
        + Thêm danh mục
      </button>

    </div>

    <div class="adm-table-wrap">

      <table class="adm-table">

        <thead>

          <tr>
            <th>Mã</th>
            <th>Tên danh mục</th>
            <th>Số SP</th>
            <th>Thao tác</th>
          </tr>

        </thead>

        <tbody>

          ${categories.map(c => `

          <tr>

            <td>${c.id}</td>

            <td class="font-bold">
              ${c.name}
            </td>

            <td>${c.products_count}</td>

            <td>

              <div class="flex gap6">

                <button
                  class="adm-btn adm-btn-sec adm-btn-sm"
                  onclick="editCategory('${c.id}')"
                >
                  ✏️
                </button>

                <button
                  class="adm-btn adm-btn-danger adm-btn-sm"
                  onclick="deleteCategory('${c.id}')"
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

async function admImportReceipt() {

  const items = await api('/api/inventory');

  document.getElementById('admModalTitle').textContent =
    '📥 Tạo phiếu nhập kho';

  document.getElementById('admModalBody').innerHTML = `

    <div class="adm-form-row">

      <div class="adm-form-group">

        <label class="adm-label">
          Nhà cung cấp
        </label>

        <input
          id="impSupplier"
          class="adm-input"
        >

      </div>

      <div class="adm-form-group">

        <label class="adm-label">
          Người nhập
        </label>

        <input
          id="impUser"
          class="adm-input"
        >

      </div>

    </div>

    <div class="adm-form-group">

      <label class="adm-label">
        Chọn sản phẩm
      </label>

      <select
        id="impProduct"
        class="adm-input"
      >

        ${items.map(i => `
          <option value="${i.id}">
            ${i.name}
          </option>
        `).join('')}

      </select>

    </div>

    <div class="adm-form-row">

      <div class="adm-form-group">

        <label class="adm-label">
          Số lượng
        </label>

        <input
          id="impQty"
          type="number"
          class="adm-input"
        >

      </div>

      <div class="adm-form-group">

        <label class="adm-label">
          Giá nhập
        </label>

        <input
          id="impPrice"
          type="number"
          class="adm-input"
        >

      </div>

    </div>

    <div class="adm-form-group">

      <label class="adm-label">
        Ghi chú
      </label>

      <textarea
        id="impNote"
        class="adm-input"
      ></textarea>

    </div>
  `;

  document.getElementById('admModalFoot').innerHTML = `

    <button
      class="adm-btn adm-btn-sec"
      onclick="admCloseModal()"
    >
      Hủy
    </button>

    <button
      class="adm-btn adm-btn-primary"
      onclick="saveImportReceipt()"
    >
      💾 Nhập kho
    </button>
  `;

  document.getElementById('admModalOverlay')
    .classList.add('open');
}

async function admExportReceipt() {

  const items = await api('/api/inventory');

  document.getElementById('admModalTitle').textContent =
    '📤 Tạo phiếu xuất kho';

  document.getElementById('admModalBody').innerHTML = `

    <div class="adm-form-group">

      <label class="adm-label">
        Loại xuất
      </label>

      <select
        id="expType"
        class="adm-input"
      >

        <option value="sale">
          Xuất bán
        </option>

        <option value="broken">
          Xuất hỏng
        </option>

        <option value="service">
          Xuất dịch vụ
        </option>

        <option value="internal">
          Xuất nội bộ
        </option>

      </select>

    </div>

    <div class="adm-form-group">

      <label class="adm-label">
        Sản phẩm
      </label>

      <select
        id="expProduct"
        class="adm-input"
      >

        ${items.map(i => `
          <option value="${i.id}">
            ${i.name}
          </option>
        `).join('')}

      </select>

    </div>

    <div class="adm-form-group">

      <label class="adm-label">
        Số lượng
      </label>

      <input
        id="expQty"
        type="number"
        class="adm-input"
      >

    </div>

    <div class="adm-form-group">

      <label class="adm-label">
        Ghi chú
      </label>

      <textarea
        id="expNote"
        class="adm-input"
      ></textarea>

    </div>
  `;

  document.getElementById('admModalFoot').innerHTML = `

    <button
      class="adm-btn adm-btn-sec"
      onclick="admCloseModal()"
    >
      Hủy
    </button>

    <button
      class="adm-btn adm-btn-primary"
      onclick="saveExportReceipt()"
    >
      💾 Xuất kho
    </button>
  `;

  document.getElementById('admModalOverlay')
    .classList.add('open');
}

async function saveImportReceipt() {

  toast('Đã tạo phiếu nhập!', 'success');

  admCloseModal();

  admRender();
}

async function saveExportReceipt() {

  toast('Đã tạo phiếu xuất!', 'success');

  admCloseModal();

  admRender();
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

// ── BOOKINGS ONLINE ─────────────────────────────────────
async function admBookings() {

    const res = await fetch('/admin/bookings');
    const html = await res.text();

    document.getElementById('admContent').innerHTML = html;

    loadBookings();

    const modal = document.getElementById('actionModal');

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
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
// BOARDING - CẬP NHẬT HOÀN CHỈNH
async function admBoarding() {
  const rooms = await api('/api/rooms');
  const occupied = rooms.filter(r => r.status === 'occupied').length;
  const available = rooms.filter(r => r.status === 'available').length;
  const cleaning = rooms.filter(r => r.status === 'cleaning').length;

  document.getElementById('admContent').innerHTML = `
  <div class="adm-page-header">
    <div>
        <div class="adm-page-title">Lưu trú (Pet Hotel)</div>
        <div class="adm-page-sub">${occupied}/${rooms.length} phòng có khách</div>
    </div>
    <!-- Cập nhật onclick để gọi hàm hiển thị Modal thực tế -->
    <button class="adm-btn adm-btn-primary" onclick="admShowCheckinModal()">+ Nhận phòng</button>
  </div>

  <div class="adm-grid adm-g4 mb24">
    <div class="adm-stat" style="--sc:var(--pink)"><div class="adm-stat-icon">🏠</div><div class="adm-stat-val">${occupied}</div><div class="adm-stat-label">Đang có khách</div></div>
    <div class="adm-stat" style="--sc:var(--teal)"><div class="adm-stat-icon">✅</div><div class="adm-stat-val">${available}</div><div class="adm-stat-label">Phòng trống</div></div>
    <div class="adm-stat" style="--sc:var(--gold)"><div class="adm-stat-icon">🧹</div><div class="adm-stat-val">${cleaning}</div><div class="adm-stat-label">Đang vệ sinh</div></div>
    <div class="adm-stat" style="--sc:var(--accent)"><div class="adm-stat-icon">💰</div><div class="adm-stat-val">760K</div><div class="adm-stat-label">Đang phát sinh</div></div>
  </div>

  <div class="adm-card">
    <div class="adm-card-title">Sơ đồ phòng</div>
    <div class="adm-room-grid">
      ${rooms.map(r => `
      <div class="adm-room ${r.status}" 
       style="cursor: pointer;" 
       onclick="${r.status === 'available' ? `quickCheckin('${r.id}')` : `viewRoomDetail('${r.id}')`}">
      <div class="adm-room-icon">${r.status === 'occupied' ? '🐾' : r.status === 'cleaning' ? '🧹' : '🏠'}</div>
      <div class="adm-room-id">${r.id}</div>
      <div class="adm-room-status">${r.status === 'occupied' ? 'Có khách' : r.status === 'available' ? 'Trống' : 'Đang dọn'}</div>
     </div>`).join('')}
    </div>
  </div>`;  
}

// Hàm hiển thị Modal Nhận phòng
async function admShowCheckinModal() {
    const [pets, rooms] = await Promise.all([api('/api/pets'), api('/api/rooms')]);
    const availableRooms = rooms.filter(r => r.status === 'available');

    document.getElementById('admModalTitle').textContent = '🐾 Đăng ký nhận phòng (Check-in)';
    
    document.getElementById('admModalBody').innerHTML = `
        <div class="adm-grid adm-g2" style="gap:15px">
            <div class="adm-form-group">
                <label class="adm-label">Thú cưng</label>
                <select class="adm-input" id="checkinPetId">
                    <option value="">-- Chọn thú cưng --</option>
                    ${pets.map(p => `<option value="${p.id}">${p.name} (Chủ: ${p.owner_name})</option>`).join('')}
                </select>
            </div>
            <div class="adm-form-group">
                <label class="adm-label">Phòng trống</label>
                <select class="adm-input" id="checkinRoomId">
                    ${availableRooms.map(r => `<option value="${r.id}">Phòng ${r.id} (${fmt(r.price || 150000)}/ngày)</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="adm-grid adm-g2 mt12" style="gap:15px">
            <div class="adm-form-group">
                <label class="adm-label">Ngày nhận</label>
                <input type="date" class="adm-input" id="checkinDate" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="adm-form-group">
                <label class="adm-label">Dự kiến trả</label>
                <input type="date" class="adm-input" id="checkoutDate">
            </div>
        </div>
        <div class="adm-form-group mt12">
            <label class="adm-label">Ghi chú đặc biệt</label>
            <textarea class="adm-input" id="checkinNote" rows="2" placeholder="Tình trạng sức khỏe, thói quen ăn uống..."></textarea>
        </div>
    `;

    document.getElementById('admModalFoot').innerHTML = `
        <button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Hủy</button>
        <button class="adm-btn adm-btn-primary" onclick="admSubmitCheckin()">Xác nhận nhận phòng</button>
    `;

    document.getElementById('admModalOverlay').classList.add('open');
}

async function quickCheckin(roomId) {
    await admShowCheckinModal(); 
    const roomSelect = document.getElementById('checkinRoomId');
    if (roomSelect) {
        roomSelect.value = roomId;
    }
}
// Hàm gửi dữ liệu Check-in về Server
async function admSubmitCheckin() {
    const payload = {
        pet_id: document.getElementById('checkinPetId').value,
        room_id: document.getElementById('checkinRoomId').value,
        checkin_date: document.getElementById('checkinDate').value,
        checkout_expected: document.getElementById('checkoutDate').value,
        note: document.getElementById('checkinNote').value
    };

    // Kiểm tra dữ liệu đầu vào
    if (!payload.pet_id || !payload.room_id || !payload.checkout_expected) {
        toast('Vui lòng điền đầy đủ thông tin và ngày dự kiến trả!', 'error');
        return;
    }

    try {
        const res = await api('/api/boarding/checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.success || res.message === "Nhận phòng thành công!") {
            admCloseModal();
            toast(res.message || 'Nhận phòng thành công!', 'success');
            admRender(); // Tải lại giao diện để các ô R01, R02... cập nhật màu sắc
        } else {
            toast(res.message || 'Có lỗi xảy ra', 'error');
        }
    } catch (err) {
        toast('Không thể kết nối đến máy chủ', 'error');
        console.error(err);
    }
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
  const running = promos.filter(p => p.status === 'Đang chạy').length;
  const statusTag = s => ({
    'Đang chạy': 'green', 'Sắp diễn ra': 'gold', 'Tạm dừng': 'orange', 'Kết thúc': 'pink'
  }[s] || 'blue');
  document.getElementById('admContent').innerHTML = `
  <div class="adm-page-header">
    <div>
      <div class="adm-page-title">Khuyến mãi</div>
      <div class="adm-page-sub">${running} đang hoạt động · ${promos.length} tổng cộng</div>
    </div>
    <button class="adm-btn adm-btn-primary" onclick="admShowModal('addPromotion')">+ Tạo khuyến mãi</button>
  </div>
  <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
    ${['', 'Đang chạy', 'Sắp diễn ra', 'Tạm dừng', 'Kết thúc'].map(s =>
      `<button class="adm-btn adm-btn-sec adm-btn-sm" onclick="filterPromos('${s}')">${s || 'Tất cả'}</button>`
    ).join('')}
  </div>
  <div class="adm-grid adm-gauto mb24" id="promoGrid">
    ${promos.map(p => promoCard(p)).join('')}
  </div>`;
}
function promoCard(p) {
  const statusTag = s => ({'Đang chạy':'green','Sắp diễn ra':'gold','Tạm dừng':'orange','Kết thúc':'pink'}[s]||'blue');
  return `<div class="adm-card" id="pc-${p.id}">
    <div class="fxb mb12">
      <span class="adm-tag adm-tag-${statusTag(p.status)}">${p.status}</span>
      <span>${p.promo_type && p.promo_type.includes('%') ? '🏷️' : '🎁'}</span>
    </div>
    <div style="font-family:var(--ff);font-size:1rem;font-weight:800;margin-bottom:6px">${p.name}</div>
    <div style="font-family:monospace;font-size:1.1rem;font-weight:800;color:var(--accent);background:var(--cream2);padding:6px 10px;border-radius:6px;text-align:center;margin-bottom:10px">${p.code || '—'}</div>
    <div class="text-sm text-muted mb4">${p.promo_type} — Giảm <strong>${p.value}%</strong></div>
    <div class="text-sm text-muted mb8">📅 ${p.valid_from || '?'} → ${p.valid_to || '?'}</div>
    <div class="divider"></div>
    <div class="fxb mt8">
      <span class="text-sm text-muted">Đã dùng: <strong class="text-gold">${p.used}</strong></span>
      <div style="display:flex;gap:4px">
        <button class="adm-btn adm-btn-sec adm-btn-sm" onclick="editPromo('${p.id}')">✏️</button>
        <button class="adm-btn adm-btn-sec adm-btn-sm" onclick="togglePromoStatus('${p.id}','${p.status}')" title="Đổi trạng thái">
          ${p.status === 'Đang chạy' ? '⏸' : '▶️'}
        </button>
        <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="deletePromo('${p.id}')">🗑</button>
      </div>
    </div>
  </div>`;
}
async function filterPromos(status) {
  const url = status ? `/api/promotions?status=${encodeURIComponent(status)}` : '/api/promotions';
  const promos = await api(url);
  const grid = document.getElementById('promoGrid');
  if (grid) grid.innerHTML = promos.map(p => promoCard(p)).join('');
}
async function togglePromoStatus(id, current) {
  const next = current === 'Đang chạy' ? 'Tạm dừng' : 'Đang chạy';
  const d = await api(`/api/promotions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: next }) });
  toast(d.message, d.ok ? 'success' : 'error');
  admRender();
}
async function editPromo(id) {
  const p = await api(`/api/promotions/${id}`);
  const cfg = {
    title: '✏️ Sửa khuyến mãi',
    body: `
      <div class="adm-form-group"><label class="adm-label">Tên chương trình</label>
        <input class="adm-input" id="mPromoName" value="${p.name}"></div>
      <div class="adm-form-row">
        <div class="adm-form-group"><label class="adm-label">Loại</label>
          <select class="adm-select" id="mPromoType">
            <option ${p.promo_type==='Giảm giá %'?'selected':''}>Giảm giá %</option>
            <option ${p.promo_type==='Combo'?'selected':''}>Combo</option>
            <option ${p.promo_type==='Tặng quà'?'selected':''}>Tặng quà</option>
          </select></div>
        <div class="adm-form-group"><label class="adm-label">Mức giảm (%)</label>
          <input class="adm-input" type="number" id="mPromoVal" value="${p.value}"></div>
      </div>
      <div class="adm-form-group"><label class="adm-label">Mã giảm giá</label>
        <input class="adm-input" id="mPromoCode" value="${p.code || ''}"></div>
      <div class="adm-form-row">
        <div class="adm-form-group"><label class="adm-label">Ngày bắt đầu</label>
          <input class="adm-input" type="date" id="mPromoFrom" value="${p.valid_from || ''}"></div>
        <div class="adm-form-group"><label class="adm-label">Ngày kết thúc</label>
          <input class="adm-input" type="date" id="mPromoTo" value="${p.valid_to || ''}"></div>
      </div>
      <div class="adm-form-group"><label class="adm-label">Trạng thái</label>
        <select class="adm-select" id="mPromoStatus">
          ${['Sắp diễn ra','Đang chạy','Tạm dừng','Kết thúc'].map(s =>
            `<option ${p.status===s?'selected':''}>${s}</option>`).join('')}
        </select></div>`,
    foot: `<button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Hủy</button>
           <button class="adm-btn adm-btn-primary" onclick="updatePromo('${id}')">💾 Lưu</button>`
  };
  document.getElementById('admModalTitle').textContent = cfg.title;
  document.getElementById('admModalBody').innerHTML = cfg.body;
  document.getElementById('admModalFoot').innerHTML = cfg.foot;
  document.getElementById('admModalOverlay').classList.add('open');
}
async function updatePromo(id) {
  const payload = {
    name: document.getElementById('mPromoName').value,
    promo_type: document.getElementById('mPromoType').value,
    value: document.getElementById('mPromoVal').value,
    code: document.getElementById('mPromoCode').value,
    valid_from: document.getElementById('mPromoFrom').value,
    valid_to: document.getElementById('mPromoTo').value,
    status: document.getElementById('mPromoStatus').value,
  };
  const d = await api(`/api/promotions/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  admCloseModal();
  toast(d.message, d.ok ? 'success' : 'error');
  admRender();
}
async function deletePromo(id) {
  if (!confirm('Xác nhận xóa khuyến mãi này?')) return;
  const d = await api(`/api/promotions/${id}`, { method: 'DELETE' });
  toast(d.message, 'info');
  admRender();
}

// VENDORS
async function admVendors() {
  const vendors = await api('/api/vendors');
  const totalImport = vendors.reduce((s, v) => s + (v.total_import || 0), 0);
  document.getElementById('admContent').innerHTML = `
  <div class="adm-page-header">
    <div>
      <div class="adm-page-title">Nhà cung cấp</div>
      <div class="adm-page-sub">${vendors.length} nhà cung cấp · Tổng nhập: ${fmt(totalImport)}</div>
    </div>
    <div style="display:flex;gap:8px">
      <input class="adm-input" id="vendorSearch" placeholder="🔍 Tìm kiếm..." style="width:200px"
        oninput="searchVendors(this.value)">
      <button class="adm-btn adm-btn-primary" onclick="admShowModal('addVendor')">+ Thêm NCC</button>
    </div>
  </div>
  <div class="adm-grid adm-g3" id="vendorGrid">
    ${vendors.map(v => vendorCard(v)).join('')}
  </div>`;
}
function vendorCard(v) {
  return `<div class="adm-card" id="vc-${v.id}">
    <div class="fxb mb12">
      <div>
        <div style="font-family:var(--ff);font-weight:800">${v.name}</div>
        <div class="text-muted text-sm">${v.id}</div>
      </div>
      <span class="adm-tag adm-tag-blue">${v.company || '—'}</span>
    </div>
    <div class="text-sm mb6">📞 ${v.phone || '—'}</div>
    <div class="text-sm mb6">✉️ ${v.email || '—'}</div>
    <div class="text-sm mb8">📍 ${v.address || '—'}</div>
    <div class="divider"></div>
    <div class="fxb mt8">
      <span class="text-sm text-muted">Nhập hàng: <strong class="text-teal">${fmt(v.total_import || 0)}</strong></span>
      <div style="display:flex;gap:4px">
        <button class="adm-btn adm-btn-sec adm-btn-sm" onclick="editVendor('${v.id}')">✏️</button>
        <button class="adm-btn adm-btn-danger adm-btn-sm" onclick="deleteVendor('${v.id}','${v.name}')">🗑</button>
      </div>
    </div>
  </div>`;
}
async function searchVendors(q) {
  const url = q ? `/api/vendors?search=${encodeURIComponent(q)}` : '/api/vendors';
  const vendors = await api(url);
  const grid = document.getElementById('vendorGrid');
  if (grid) grid.innerHTML = vendors.length ? vendors.map(v => vendorCard(v)).join('') :
    `<div class="text-muted text-sm" style="grid-column:1/-1;padding:24px;text-align:center">Không tìm thấy nhà cung cấp nào</div>`;
}
async function editVendor(id) {
  const v = await api(`/api/vendors/${id}`);
  const cfg = {
    title: '✏️ Sửa nhà cung cấp',
    body: `
      <div class="adm-form-row">
        <div class="adm-form-group"><label class="adm-label">Tên liên hệ</label>
          <input class="adm-input" id="mVendorName" value="${v.name || ''}"></div>
        <div class="adm-form-group"><label class="adm-label">Công ty</label>
          <input class="adm-input" id="mVendorCompany" value="${v.company || ''}"></div>
      </div>
      <div class="adm-form-row">
        <div class="adm-form-group"><label class="adm-label">Số điện thoại</label>
          <input class="adm-input" id="mVendorPhone" value="${v.phone || ''}"></div>
        <div class="adm-form-group"><label class="adm-label">Email</label>
          <input class="adm-input" id="mVendorEmail" value="${v.email || ''}"></div>
      </div>
      <div class="adm-form-group"><label class="adm-label">Địa chỉ</label>
        <textarea class="adm-input" id="mVendorAddr">${v.address || ''}</textarea></div>`,
    foot: `<button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Hủy</button>
           <button class="adm-btn adm-btn-primary" onclick="updateVendor('${id}')">💾 Lưu</button>`
  };
  document.getElementById('admModalTitle').textContent = cfg.title;
  document.getElementById('admModalBody').innerHTML = cfg.body;
  document.getElementById('admModalFoot').innerHTML = cfg.foot;
  document.getElementById('admModalOverlay').classList.add('open');
}
async function updateVendor(id) {
  const payload = {
    name:    document.getElementById('mVendorName').value,
    company: document.getElementById('mVendorCompany').value,
    phone:   document.getElementById('mVendorPhone').value,
    email:   document.getElementById('mVendorEmail').value,
    address: document.getElementById('mVendorAddr').value,
  };
  const d = await api(`/api/vendors/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  admCloseModal();
  toast(d.message, d.ok ? 'success' : 'error');
  admRender();
}
async function deleteVendor(id, name) {
  if (!confirm(`Xác nhận xóa nhà cung cấp "${name}"?`)) return;
  const d = await api(`/api/vendors/${id}`, { method: 'DELETE' });
  toast(d.message, d.ok ? 'info' : 'error');
  admRender();
}
async function saveVendor() {
  const payload = {
    name:    document.getElementById('mVendorName').value,
    company: document.getElementById('mVendorCompany').value,
    phone:   document.getElementById('mVendorPhone').value,
    email:   document.getElementById('mVendorEmail').value,
    address: document.getElementById('mVendorAddr').value,
  };
  if (!payload.name) { toast('Vui lòng nhập tên nhà cung cấp!', 'error'); return; }
  const d = await api('/api/vendors', { method: 'POST', body: JSON.stringify(payload) });
  admCloseModal();
  toast(d.message, d.ok ? 'success' : 'error');
  admRender();
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
      body: `
      <div class="adm-form-row">

        <div class="adm-form-group">
          <label class="adm-label">Họ tên</label>
          <input class="adm-input" id="mCusName">
        </div>

        <div class="adm-form-group">
          <label class="adm-label">SĐT</label>
          <input class="adm-input" id="mCusPhone">
        </div>

      </div>

      <div class="adm-form-group">
        <label class="adm-label">Email</label>
        <input class="adm-input" id="mCusEmail">
      </div>

      <div class="adm-form-group">
        <label class="adm-label">Địa chỉ</label>
        <textarea class="adm-input" id="mCusAddress"></textarea>
      </div>
      `,
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
    addVendor: {
      title: '🏭 Thêm nhà cung cấp',
      body: `
        <div class="adm-form-row">
          <div class="adm-form-group"><label class="adm-label">Tên liên hệ *</label>
            <input class="adm-input" id="mVendorName" placeholder="Nguyễn Văn A"></div>
          <div class="adm-form-group"><label class="adm-label">Tên công ty</label>
            <input class="adm-input" id="mVendorCompany" placeholder="Royal Pet Co."></div>
        </div>
        <div class="adm-form-row">
          <div class="adm-form-group"><label class="adm-label">Số điện thoại</label>
            <input class="adm-input" id="mVendorPhone" placeholder="0901234567"></div>
          <div class="adm-form-group"><label class="adm-label">Email</label>
            <input class="adm-input" id="mVendorEmail" placeholder="contact@company.com"></div>
        </div>
        <div class="adm-form-group"><label class="adm-label">Địa chỉ</label>
          <textarea class="adm-input" id="mVendorAddr" placeholder="Số 1, đường ABC, Hà Nội"></textarea></div>`,
      foot: `<button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Hủy</button><button class="adm-btn adm-btn-primary" onclick="saveVendor()">💾 Thêm</button>`,
    },
    addPromotion: {
      title: '🎁 Tạo khuyến mãi',
      body: `<div class="adm-form-group"><label class="adm-label">Tên chương trình *</label><input class="adm-input" id="mPromoName" placeholder="Mừng Tết..."></div><div class="adm-form-row"><div class="adm-form-group"><label class="adm-label">Loại</label><select class="adm-select" id="mPromoType"><option>Giảm giá %</option><option>Combo</option><option>Tặng quà</option></select></div><div class="adm-form-group"><label class="adm-label">Mức giảm (%)</label><input class="adm-input" type="number" id="mPromoVal" placeholder="20"></div></div><div class="adm-form-group"><label class="adm-label">Mã giảm giá</label><input class="adm-input" id="mPromoCode" placeholder="TET2025"></div><div class="adm-form-row"><div class="adm-form-group"><label class="adm-label">Ngày bắt đầu</label><input class="adm-input" type="date" id="mPromoFrom"></div><div class="adm-form-group"><label class="adm-label">Ngày kết thúc</label><input class="adm-input" type="date" id="mPromoTo"></div></div><div class="adm-form-group"><label class="adm-label">Trạng thái ban đầu</label><select class="adm-select" id="mPromoStatus"><option>Sắp diễn ra</option><option>Đang chạy</option></select></div>`,
      foot: `<button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Hủy</button><button class="adm-btn adm-btn-primary" onclick="savePromotion()">🎁 Tạo</button>`,
    },
    addReminder: {

      title: '💉 Tạo lịch tiêm phòng',

      body: `

        <div class="adm-form-group">
          <label class="adm-label">Pet ID</label>
          <input class="adm-input" id="mRemPet">
        </div>

        <div class="adm-form-group">
          <label class="adm-label">Loại nhắc</label>

          <select class="adm-select" id="mRemType">

            <option>Tiêm vaccine</option>

            <option>Tẩy giun</option>

            <option>Khám định kỳ</option>

          </select>
        </div>

        <div class="adm-form-group">
          <label class="adm-label">Ngày nhắc</label>

          <input
            class="adm-input"
            type="date"
            id="mRemDate"
          >
        </div>

        <div class="adm-form-group">
          <label class="adm-label">Ghi chú</label>

          <textarea
            class="adm-input"
            id="mRemNote"
          ></textarea>
        </div>
      `,

      foot: `

        <button
          class="adm-btn adm-btn-sec"
          onclick="admCloseModal()"
        >
          Hủy
        </button>

        <button
          class="adm-btn adm-btn-primary"
          onclick="saveReminder()"
        >
          💾 Lưu
        </button>
      `
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
  const name = document.getElementById('mPromoName').value;
  if (!name) { toast('Vui lòng nhập tên khuyến mãi!', 'error'); return; }
  const payload = {
    name,
    promo_type: document.getElementById('mPromoType').value,
    value:      document.getElementById('mPromoVal').value,
    code:       document.getElementById('mPromoCode').value,
    valid_from: document.getElementById('mPromoFrom').value,
    valid_to:   document.getElementById('mPromoTo').value,
    status:     document.getElementById('mPromoStatus') ? document.getElementById('mPromoStatus').value : 'Sắp diễn ra',
  };
  const d = await api('/api/promotions', { method: 'POST', body: JSON.stringify(payload) });
  admCloseModal();
  toast(d.message, d.ok ? 'success' : 'error');
  admRender();
}

// BOOKINGS

let currentAction = null;
let currentBookingId = null;

async function admBookings() {

    const res = await fetch('/admin/bookings');
    const html = await res.text();

    document.getElementById('admContent').innerHTML = html;

    loadBookings();

    const modal = document.getElementById('actionModal');

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
}

async function loadBookings(status = '') {

    try {

        const url = status
            ? `/admin/api/bookings?status=${status}`
            : '/admin/api/bookings';

        const res = await fetch(url);

        const bookings = await res.json();

        renderBookings(bookings);

        updateStats(bookings);

    } catch (error) {

        console.error(error);

        showToast('Lỗi khi tải dữ liệu', 'error');
    }
}

function renderBookings(bookings) {

    const tbody = document.getElementById('bookingsList');

    const emptyState = document.getElementById('emptyState');

    if (!bookings || bookings.length === 0) {

        tbody.innerHTML = '';

        emptyState.style.display = 'block';

        return;
    }

    emptyState.style.display = 'none';

    tbody.innerHTML = bookings.map(b => `

        <tr>

            <td>
                <span class="booking-id">#${b.id}</span>
            </td>

            <td>

                <div class="customer-info">

                    <span class="customer-name">
                        ${b.full_name}
                    </span>

                    <span class="customer-phone">
                        ${b.phone}
                    </span>

                    ${b.pet_name
                        ? `<div class="pet-info">
                            Thú: ${b.pet_name}
                            ${b.breed ? '(' + b.breed + ')' : ''}
                           </div>`
                        : ''
                    }

                </div>

            </td>

            <td>
                <span class="service-badge">
                    ${b.service}
                </span>
            </td>

            <td>

                <div class="date-time">

                    <strong>
                        ${formatDate(b.date)}
                    </strong>

                    ${b.time_slot}

                </div>

            </td>

            <td>

                <span class="status ${getStatusClass(b.status)}">

                    ${getStatusIcon(b.status)}
                    ${b.status}

                </span>

            </td>

            <td>

                <div class="notes">

                    ${b.notes || '-'}

                </div>

            </td>

            <td>

                <div class="actions">
                    ${getActionButtons(b.id, b.status)}
                </div>

            </td>

        </tr>

    `).join('');
}

function getActionButtons(id, status) {

    let buttons = '';

    if (status === 'Chờ xác nhận') {

        buttons += `
            <button class="btn btn-confirm"
                    onclick="askAction(${id}, 'confirm')">
                ✓ Xác nhận
            </button>
        `;

        buttons += `
            <button class="btn btn-reject"
                    onclick="askAction(${id}, 'reject')">
                ✕ Hủy
            </button>
        `;
    }

    else if (status === 'Xác nhận') {

        buttons += `
            <button class="btn btn-complete"
                    onclick="askAction(${id}, 'complete')">
                ✓ Hoàn thành
            </button>
        `;

        buttons += `
            <button class="btn btn-reject"
                    onclick="askAction(${id}, 'reject')">
                ✕ Hủy
            </button>
        `;
    }

    return buttons || '<span style="color:#999">-</span>';
}

function askAction(bookingId, action) {

    currentBookingId = bookingId;

    currentAction = action;

    const titles = {
        confirm: '✅ Xác Nhận Lịch Hẹn',
        reject: '❌ Hủy Lịch Hẹn',
        complete: '🎉 Hoàn Thành Dịch Vụ'
    };

    const messages = {
        confirm: 'Xác nhận lịch hẹn này?',
        reject: 'Hủy lịch hẹn này?',
        complete: 'Đánh dấu đã hoàn thành?'
    };

    document.getElementById('modalTitle').textContent =
        titles[action];

    document.getElementById('modalBody').textContent =
        messages[action];

    document.getElementById('actionModal')
        .classList.add('show');
}

function closeModal() {

    document.getElementById('actionModal')
        .classList.remove('show');
}

async function executeAction() {

    if (!currentAction || !currentBookingId)
        return;

    closeModal();

    const endpoints = {

        confirm:
            `/admin/api/booking/${currentBookingId}/confirm`,

        reject:
            `/admin/api/booking/${currentBookingId}/reject`,

        complete:
            `/admin/api/booking/${currentBookingId}/complete`
    };

    try {

        const res = await fetch(
            endpoints[currentAction],
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        const data = await res.json();

        if (data.ok) {

            showToast(data.message, 'success');

            loadBookings();

        } else {

            showToast(data.message, 'error');
        }

    } catch (error) {

        console.error(error);

        showToast('Lỗi thao tác', 'error');
    }
}

function filterStatus(event, status)
{
    if(event)
    {
        document
            .querySelectorAll('.filter-btn')
            .forEach(btn => {
                btn.classList.remove('active');
            });

        event.target.classList.add('active');
    }

    const rows = document.querySelectorAll(
        '#bookingsList tr'
    );

    rows.forEach(row => {

        const statusText =
            row.children[4].innerText.trim();

        if(status === 'all')
        {
            row.style.display = '';
        }
        else if(statusText.includes(status))
        {
            row.style.display = '';
        }
        else
        {
            row.style.display = 'none';
        }

    });
}

function updateStats(bookings) {

    const stats = {
        'Chờ xác nhận': 0,
        'Xác nhận': 0,
        'Hoàn thành': 0,
        'Hủy': 0
    };

    bookings.forEach(b => {

        if (stats.hasOwnProperty(b.status)) {
            stats[b.status]++;
        }
    });

    document.getElementById('pendingCount')
        .textContent = stats['Chờ xác nhận'];

    document.getElementById('confirmedCount')
        .textContent = stats['Xác nhận'];

    document.getElementById('completedCount')
        .textContent = stats['Hoàn thành'];
}

function formatDate(dateStr) {

    const date =
        new Date(dateStr + 'T00:00:00');

    return date.toLocaleDateString('vi-VN', {

        weekday: 'short',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function getStatusClass(status) {

    const map = {

        'Chờ xác nhận': 'pending',
        'Xác nhận': 'confirmed',
        'Hoàn thành': 'completed',
        'Hủy': 'cancelled'
    };

    return map[status] || 'pending';
}

function getStatusIcon(status) {

    const map = {

        'Chờ xác nhận': '⏳',
        'Xác nhận': '✅',
        'Hoàn thành': '🎉',
        'Hủy': '❌'
    };

    return map[status] || '❓';
}

function showToast(message, type = 'info') {

    const toast = document.createElement('div');

    toast.className = `toast ${type}`;

    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

async function saveCustomer() {

  const payload = {

    name: document.getElementById('mCusName').value,

    phone: document.getElementById('mCusPhone').value,

    email: document.getElementById('mCusEmail').value,

    address: document.getElementById('mCusAddress').value,
  };

  const d = await api('/api/customers', {

    method: 'POST',

    body: JSON.stringify(payload)
  });

  admCloseModal();

  toast(d.message, 'success');

  admRender();
}

async function viewMedical(petId) {

  const records = await api(
    `/api/medical-records/${petId}`
  );

  document.getElementById('admModalTitle').textContent =
    '🏥 Hồ sơ y tế';

  document.getElementById('admModalBody').innerHTML = `

    <div class="flex mb16">
      <button
        class="adm-btn adm-btn-primary"
        onclick="addMedical('${petId}')"
      >
        + Thêm hồ sơ
      </button>
    </div>

    ${records.map(r => `

      <div class="adm-card mb12">

        <div class="fxb">

          <strong>${r.visit_date}</strong>

          <span class="adm-tag adm-tag-red">
            ${r.condition}
          </span>

        </div>

        <div class="mt8">
          <strong>Chuẩn đoán:</strong>
          ${r.diagnosis}
        </div>

        <div class="mt8">
          <strong>Bác sĩ:</strong>
          ${r.doctor}
        </div>

        <div class="mt8">
          <strong>Thuốc:</strong>
          ${r.medicine}
        </div>

        <div class="mt8">
          <strong>Vaccine:</strong>
          ${r.vaccine}
        </div>

      </div>

    `).join('')}
  `;

  document.getElementById('admModalFoot').innerHTML =
    `<button class="adm-btn adm-btn-sec"
      onclick="admCloseModal()">
      Đóng
    </button>`;

  document.getElementById('admModalOverlay')
    .classList.add('open');
}

function addMedical(petId) {

  document.getElementById('admModalTitle')
    .textContent = '➕ Hồ sơ y tế';

  document.getElementById('admModalBody')
    .innerHTML = `

    <div class="adm-form-group">
      <label class="adm-label">Ngày khám</label>
      <input class="adm-input"
        type="date"
        id="mVisitDate">
    </div>

    <div class="adm-form-group">
      <label class="adm-label">Chuẩn đoán</label>
      <textarea class="adm-input"
        id="mDiagnosis"></textarea>
    </div>

    <div class="adm-form-group">
      <label class="adm-label">Bác sĩ</label>
      <input class="adm-input"
        id="mDoctor">
    </div>

    <div class="adm-form-group">
      <label class="adm-label">Thuốc</label>
      <textarea class="adm-input"
        id="mMedicine"></textarea>
    </div>

  `;

  document.getElementById('admModalFoot')
    .innerHTML = `

    <button
      class="adm-btn adm-btn-sec"
      onclick="admCloseModal()"
    >
      Hủy
    </button>

    <button
      class="adm-btn adm-btn-primary"
      onclick="saveMedical('${petId}')"
    >
      💾 Lưu
    </button>
  `;
}

async function saveMedical(petId) {

  const payload = {

    pet_id: petId,

    visit_date:
      document.getElementById('mVisitDate').value,

    diagnosis:
      document.getElementById('mDiagnosis').value,

    doctor:
      document.getElementById('mDoctor').value,

    medicine:
      document.getElementById('mMedicine').value,

    condition: 'Đang điều trị',
  };

  const d = await api(
    '/api/medical-records',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );

  toast(d.message, 'success');

  admCloseModal();
}

// REMINDERS / VACCINE
async function admReminders() {

  const reminders = await api('/api/reminders');

  document.getElementById('admContent').innerHTML = `

    <div class="adm-page-header">

      <div>
        <div class="adm-page-title">
          💉 Lịch tiêm phòng
        </div>

        <div class="adm-page-sub">
          ${reminders.length} lịch nhắc
        </div>
      </div>

      <button
        class="adm-btn adm-btn-primary"
        onclick="admShowModal('addReminder')"
      >
        + Tạo nhắc lịch
      </button>

    </div>

    <div class="adm-card" style="padding:0">

      <div class="adm-table-wrap">

        <table class="adm-table">

          <thead>
            <tr>
              <th>Pet ID</th>
              <th>Loại nhắc</th>
              <th>Ngày nhắc</th>
              <th>Ghi chú</th>
              <th>Trạng thái</th>
            </tr>
          </thead>

          <tbody>

            ${reminders.map(r => `

              <tr>

                <td>
                  <strong>${r.pet_id}</strong>
                </td>

                <td>
                  <span class="adm-tag adm-tag-blue">
                    ${r.reminder_type}
                  </span>
                </td>

                <td>${r.reminder_date}</td>

                <td>${r.note || '-'}</td>

                <td>

                  <span class="adm-tag adm-tag-green">
                    Đang hoạt động
                  </span>

                </td>

              </tr>

            `).join('')}

          </tbody>

        </table>

      </div>

    </div>
  `;
}

// SERVICE HISTORY
async function admServices() {

  const petId = prompt(
    'Nhập ID thú cưng để xem lịch sử dịch vụ'
  );

  if (!petId) return;

  const services = await api(
    `/api/service-history/${petId}`
  );

  document.getElementById('admContent').innerHTML = `

    <div class="adm-page-header">

      <div>
        <div class="adm-page-title">
          🛁 Dịch vụ đã sử dụng
        </div>

        <div class="adm-page-sub">
          ${services.length} dịch vụ
        </div>
      </div>

      <button
        class="adm-btn adm-btn-primary"
        onclick="addService('${petId}')"
      >
        + Thêm dịch vụ
      </button>

    </div>

    <div class="adm-grid adm-g3">

      ${services.map(s => `

        <div class="adm-card">

          <div class="fxb mb12">

            <strong>${s.service_name}</strong>

            <span class="adm-tag adm-tag-purple">
              ${s.status}
            </span>

          </div>

          <div class="text-sm mb8">
            📅 ${s.service_date}
          </div>

          <div class="text-sm mb8">
            💰 ${fmt(s.price)}
          </div>

          <div class="text-sm">
            📝 ${s.note || '-'}
          </div>

        </div>

      `).join('')}

    </div>
  `;
}

async function saveReminder() {

  const payload = {

    pet_id:
      document.getElementById('mRemPet').value,

    reminder_type:
      document.getElementById('mRemType').value,

    reminder_date:
      document.getElementById('mRemDate').value,

    note:
      document.getElementById('mRemNote').value,
  };

  const d = await api(
    '/api/reminders',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );

  toast(d.message, 'success');

  admCloseModal();

  admRender();
}

function addService(petId) {

  document.getElementById('admModalTitle')
    .textContent = '🛁 Thêm dịch vụ';

  document.getElementById('admModalBody')
    .innerHTML = `

    <div class="adm-form-group">

      <label class="adm-label">
        Tên dịch vụ
      </label>

      <input
        class="adm-input"
        id="mServiceName"
      >

    </div>

    <div class="adm-form-group">

      <label class="adm-label">
        Ngày sử dụng
      </label>

      <input
        type="date"
        class="adm-input"
        id="mServiceDate"
      >

    </div>

    <div class="adm-form-group">

      <label class="adm-label">
        Giá
      </label>

      <input
        type="number"
        class="adm-input"
        id="mServicePrice"
      >

    </div>

    <div class="adm-form-group">

      <label class="adm-label">
        Ghi chú
      </label>

      <textarea
        class="adm-input"
        id="mServiceNote"
      ></textarea>

    </div>
  `;

  document.getElementById('admModalFoot')
    .innerHTML = `

    <button
      class="adm-btn adm-btn-sec"
      onclick="admCloseModal()"
    >
      Hủy
    </button>

    <button
      class="adm-btn adm-btn-primary"
      onclick="saveService('${petId}')"
    >
      💾 Lưu
    </button>
  `;

  document.getElementById('admModalOverlay')
    .classList.add('open');
}

async function saveService(petId) {

  const payload = {

    pet_id: petId,

    service_name:
      document.getElementById('mServiceName').value,

    service_date:
      document.getElementById('mServiceDate').value,

    status: 'Hoàn thành',

    price:
      document.getElementById('mServicePrice').value,

    note:
      document.getElementById('mServiceNote').value,
  };

  const d = await api(
    '/api/service-history',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );

  toast(d.message, 'success');

  admCloseModal();

  admRender();
}

