// NAVIGATION

let admPage = 'dashboard';
const admLabels = {
  dashboard: 'Dashboard', pets: 'Hồ sơ Thú cưng', customers: 'Khách hàng',
  inventory: 'Kho hàng', appointments: 'Lịch dịch vụ', boarding: 'Lưu trú (Hotel)',
  pos: 'Bán hàng (POS)', orders: 'Đơn hàng online', promotions: 'Khuyến mãi',
  vendors: 'Nhà cung cấp', staff: 'Nhân viên', reports: 'Báo cáo', reminders: 'Lịch tiêm phòng',
  services: 'Dịch vụ đã sử dụng',transports: 'Lịch sử đưa đón',
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
    reminders: admReminders, services: admServices, transports: admTransports,
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

// Hàm hiển thị Modal Nhận phòng
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
// =============================================================
// STAFF — THÊM / SỬA / XÓA / SẮP XẾP LỊCH
// Thay thế hoàn toàn hàm admStaff() cũ.
// Copy đoạn này, tìm hàm admStaff() cũ trong admin.js và thay bằng đoạn dưới.
// =============================================================

// ── Danh sách ca cố định (khớp với server) ──────────────────
const STAFF_SHIFTS = [
  'Ca sáng (7h-12h)',
  'Ca chiều (13h-18h)',
  'Ca tối (18h-22h)',
  'Hành chính (8h-17h)',
  'Cả ngày (7h-22h)',
];

// ── Hàm chính render trang Nhân viên ────────────────────────
async function admStaff() {
  const staff = await api('/api/staff');
  document.getElementById('admContent').innerHTML = `
  <div class="adm-page-header">
    <div>
      <div class="adm-page-title">Nhân viên</div>
      <div class="adm-page-sub">${staff.length} nhân viên</div>
    </div>
    <div class="flex gap8">
      <button class="adm-btn adm-btn-sec" onclick="admStaffSchedule()">📅 Xem lịch ca</button>
      <button class="adm-btn adm-btn-primary" onclick="admStaffAdd()">+ Thêm NV</button>
    </div>
  </div>
  <div class="adm-staff-grid mb24">
    ${staff.map(s => `
    <div class="adm-staff-card">
      <div class="adm-staff-avatar" style="background:${s.color}">${s.name.split(' ').pop().charAt(0)}</div>
      <div class="adm-staff-name">${s.name}</div>
      <div class="adm-staff-role">${s.role}</div>
      <div class="text-muted text-sm mt8">📞 ${s.phone || '—'}</div>
      <div class="text-muted text-sm mt8">🕐 ${s.shift || '—'}</div>
      ${s.email ? `<div class="text-muted text-sm mt8">✉️ ${s.email}</div>` : ''}
      <div class="adm-staff-stats">
        <div style="text-align:center"><div class="adm-sval">${s.work_days}</div><div class="adm-slabel">Ngày công</div></div>
        <div style="text-align:center"><div class="adm-sval text-accent">${fmtShort(s.sales)}</div><div class="adm-slabel">Doanh số</div></div>
      </div>
      <div class="flex gap8 mt8" style="justify-content:center">
        <button class="adm-btn adm-btn-sec adm-btn-sm" onclick="admStaffEdit('${s.id}')">✏️ Sửa</button>
        <button class="adm-btn adm-btn-sm" style="background:#fee2e2;color:#991b1b" onclick="admStaffDelete('${s.id}','${s.name.replace(/'/g,"\\'")}')">🗑 Xóa</button>
      </div>
    </div>`).join('')}
  </div>`;
}

// ── Form Thêm nhân viên ──────────────────────────────────────
async function admStaffAdd() {
  // Lấy danh sách ca còn trống từ server
  let shifts = [];
  try {
    shifts = await api('/api/staff-shifts');
  } catch (_) {
    shifts = STAFF_SHIFTS.map(s => ({ shift: s, occupied: false, by: null }));
  }

  const shiftOptions = shifts.map(sh =>
    `<option value="${sh.shift}" ${sh.occupied ? 'style="color:#aaa"' : ''}>
      ${sh.shift}${sh.occupied ? ` (đã có: ${sh.by})` : ' ✅'}
    </option>`
  ).join('');

  document.getElementById('admModalTitle').textContent = '👔 Thêm nhân viên';
  document.getElementById('admModalBody').innerHTML = `
    <div class="adm-form-row">
      <div class="adm-form-group">
        <label class="adm-label">Họ tên *</label>
        <input class="adm-input" id="sfName" placeholder="Nguyễn Thị B">
      </div>
      <div class="adm-form-group">
        <label class="adm-label">Số điện thoại</label>
        <input class="adm-input" id="sfPhone" placeholder="09xxxxxxxx">
      </div>
    </div>
    <div class="adm-form-row">
      <div class="adm-form-group">
        <label class="adm-label">Chức vụ</label>
        <select class="adm-select" id="sfRole">
          <option>Nhân viên</option>
          <option>Quản trị viên</option>
          <option>Thu ngân</option>
          <option>Bác sĩ thú y</option>
          <option>Groomer</option>
        </select>
      </div>
      <div class="adm-form-group">
        <label class="adm-label">Ca làm</label>
        <select class="adm-select" id="sfShift">${shiftOptions}</select>
      </div>
    </div>
    <div class="adm-form-group">
      <label class="adm-label">Email (tuỳ chọn)</label>
      <input class="adm-input" id="sfEmail" placeholder="email@example.com">
    </div>
    <div id="sfError" style="color:#e8521a;font-size:.82rem;margin-top:8px;display:none"></div>
  `;
  document.getElementById('admModalFoot').innerHTML = `
    <button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Hủy</button>
    <button class="adm-btn adm-btn-primary" onclick="admStaffSaveNew()">💾 Thêm nhân viên</button>
  `;
  document.getElementById('admModalOverlay').classList.add('open');
}

async function admStaffSaveNew() {
  const name  = document.getElementById('sfName').value.trim();
  const phone = document.getElementById('sfPhone').value.trim();
  const role  = document.getElementById('sfRole').value;
  const shift = document.getElementById('sfShift').value;
  const email = document.getElementById('sfEmail').value.trim();
  const errEl = document.getElementById('sfError');

  if (!name) { errEl.textContent = 'Vui lòng nhập họ tên.'; errEl.style.display = 'block'; return; }

  const res = await api('/api/staff', {
    method: 'POST',
    body: JSON.stringify({ name, phone, role, shift, email }),
  });

  if (!res.success) {
    errEl.textContent = res.message;
    errEl.style.display = 'block';
    return;
  }

  admCloseModal();
  toast('Đã thêm nhân viên ' + name, 'success');
  admStaff();
}

// ── Form Sửa nhân viên ───────────────────────────────────────
async function admStaffEdit(id) {
  const [s, shifts] = await Promise.all([
    api('/api/staff/' + id),
    api('/api/staff-shifts').catch(() =>
      STAFF_SHIFTS.map(sh => ({ shift: sh, occupied: false, by: null }))
    ),
  ]);

  const shiftOptions = shifts.map(sh =>
    `<option value="${sh.shift}" ${sh.shift === s.shift ? 'selected' : ''} ${sh.occupied && sh.shift !== s.shift ? 'style="color:#aaa"' : ''}>
      ${sh.shift}${sh.occupied && sh.shift !== s.shift ? ` (đã có: ${sh.by})` : sh.shift === s.shift ? ' (hiện tại)' : ' ✅'}
    </option>`
  ).join('');

  const roleOptions = ['Nhân viên','Quản trị viên','Thu ngân','Bác sĩ thú y','Groomer'].map(r =>
    `<option ${r === s.role ? 'selected' : ''}>${r}</option>`
  ).join('');

  document.getElementById('admModalTitle').textContent = '✏️ Sửa nhân viên';
  document.getElementById('admModalBody').innerHTML = `
    <div class="adm-form-row">
      <div class="adm-form-group">
        <label class="adm-label">Họ tên *</label>
        <input class="adm-input" id="sfName" value="${s.name}">
      </div>
      <div class="adm-form-group">
        <label class="adm-label">Số điện thoại</label>
        <input class="adm-input" id="sfPhone" value="${s.phone || ''}">
      </div>
    </div>
    <div class="adm-form-row">
      <div class="adm-form-group">
        <label class="adm-label">Chức vụ</label>
        <select class="adm-select" id="sfRole">${roleOptions}</select>
      </div>
      <div class="adm-form-group">
        <label class="adm-label">Ca làm</label>
        <select class="adm-select" id="sfShift">${shiftOptions}</select>
      </div>
    </div>
    <div class="adm-form-group">
      <label class="adm-label">Email</label>
      <input class="adm-input" id="sfEmail" value="${s.email || ''}">
    </div>
    <div id="sfError" style="color:#e8521a;font-size:.82rem;margin-top:8px;display:none"></div>
  `;
  document.getElementById('admModalFoot').innerHTML = `
    <button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Hủy</button>
    <button class="adm-btn adm-btn-primary" onclick="admStaffSaveEdit('${id}')">💾 Lưu thay đổi</button>
  `;
  document.getElementById('admModalOverlay').classList.add('open');
}

async function admStaffSaveEdit(id) {
  const name  = document.getElementById('sfName').value.trim();
  const phone = document.getElementById('sfPhone').value.trim();
  const role  = document.getElementById('sfRole').value;
  const shift = document.getElementById('sfShift').value;
  const email = document.getElementById('sfEmail').value.trim();
  const errEl = document.getElementById('sfError');

  if (!name) { errEl.textContent = 'Vui lòng nhập họ tên.'; errEl.style.display = 'block'; return; }

  const res = await api('/api/staff/' + id, {
    method: 'PUT',
    body: JSON.stringify({ name, phone, role, shift, email }),
  });

  if (!res.success) {
    errEl.textContent = res.message;
    errEl.style.display = 'block';
    return;
  }

  admCloseModal();
  toast('Đã cập nhật ' + name, 'success');
  admStaff();
}

// ── Xóa nhân viên ───────────────────────────────────────────
function admStaffDelete(id, name) {
  document.getElementById('admModalTitle').textContent = '🗑 Xác nhận xóa';
  document.getElementById('admModalBody').innerHTML = `
    <p style="margin:0 0 12px">Bạn có chắc muốn xóa nhân viên <strong>${name}</strong>?</p>
    <p style="color:#6b7280;font-size:.85rem">Thao tác này không thể hoàn tác.</p>
  `;
  document.getElementById('admModalFoot').innerHTML = `
    <button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Hủy</button>
    <button class="adm-btn adm-btn-sm" style="background:#e8521a;color:#fff;padding:8px 18px;border-radius:8px;border:none;cursor:pointer;font-weight:700"
      onclick="admStaffConfirmDelete('${id}','${name.replace(/'/g,"\\'")}')">Xóa nhân viên</button>
  `;
  document.getElementById('admModalOverlay').classList.add('open');
}

async function admStaffConfirmDelete(id, name) {
  const res = await api('/api/staff/' + id, { method: 'DELETE' });
  admCloseModal();
  if (res.success) {
    toast('Đã xóa nhân viên ' + name, 'success');
    admStaff();
  } else {
    toast(res.message, 'error');
  }
}

// ── Xem lịch ca ─────────────────────────────────────────────
async function admStaffSchedule() {
  const [staff, shifts] = await Promise.all([
    api('/api/staff'),
    api('/api/staff-shifts').catch(() => []),
  ]);

  // Tạo bảng timeline từ 7h → 22h
  const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 7..22

  const rows = shifts.map(sh => {
    const [start, end] = sh.shift.match(/(\d+)h.*?(\d+)h/)
      ? [parseInt(RegExp.$1), parseInt(RegExp.$2)]
      : [null, null];

    const assignedStaff = staff.filter(s => s.shift === sh.shift);

    const cells = hours.map(h => {
      const active = start !== null && h >= start && h < end;
      const names  = active ? assignedStaff.map(s => s.name).join(', ') : '';
      return `<td style="
        background:${active ? (assignedStaff[0]?.color || 'var(--accent)') : 'transparent'};
        opacity:${active ? 0.85 : 1};
        color:${active ? '#fff' : 'transparent'};
        font-size:.65rem;text-align:center;padding:4px 2px;border-radius:4px;
        title='${names}'">${active && names ? names.split(' ').pop() : ''}</td>`;
    }).join('');

    return `<tr>
      <td style="font-size:.78rem;padding:4px 8px;white-space:nowrap;font-weight:600">${sh.shift}</td>
      ${cells}
      <td style="font-size:.75rem;padding:4px 8px;color:${sh.occupied ? 'var(--accent)' : 'var(--teal)'}">
        ${sh.occupied ? sh.by : '✅ Trống'}
      </td>
    </tr>`;
  }).join('');

  const hourHeaders = hours.map(h => `<th style="font-size:.7rem;text-align:center;padding:4px 2px;color:var(--text3)">${h}h</th>`).join('');

  document.getElementById('admModalTitle').textContent = '📅 Lịch ca làm việc';
  document.getElementById('admModalBody').innerHTML = `
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:separate;border-spacing:0 4px">
        <thead>
          <tr>
            <th style="text-align:left;font-size:.78rem;padding:4px 8px;color:var(--text3)">Ca làm</th>
            ${hourHeaders}
            <th style="font-size:.78rem;padding:4px 8px;color:var(--text3)">Phân công</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="margin-top:12px;font-size:.75rem;color:var(--text3)">
      💡 Màu thanh tương ứng màu nhân viên được phân ca. Ca trống = chưa có ai.
    </div>
  `;
  document.getElementById('admModalFoot').innerHTML = `
    <button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Đóng</button>
    <button class="adm-btn adm-btn-primary" onclick="admCloseModal();admStaffAdd()">+ Thêm NV vào ca trống</button>
  `;
  document.getElementById('admModalOverlay').classList.add('open');
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



// ================================================================
// NOTIFICATION BELL — Nhắc lịch booking (THÊM MỚI)
// ================================================================

let _notifOpen = false;

async function admLoadNotif() {
  const listEl  = document.getElementById('admNotifList');
  const badge   = document.getElementById('admNotifBadge');
  const countEl = document.getElementById('admNotifCount');
  if (!listEl) return;

  try {
    // Lấy reminders Pending
    const pending = await api('/api/booking-reminders?status=Pending');

    // Cập nhật badge
    const count = pending.length;
    badge.textContent  = count;
    badge.style.background = count > 0 ? 'var(--accent)' : 'var(--text3)';
    countEl.textContent = count > 0 ? `${count} lịch cần nhắc` : 'Không có lịch cần nhắc';

    if (count === 0) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:28px;color:var(--text3);font-size:.85rem">
          ✅ Không có lịch nhắc nào hôm nay
        </div>`;
      return;
    }

    // Render từng reminder
    listEl.innerHTML = pending.map(r => {
      const typeLabel = r.remind_type === '1_day'
        ? '<span style="background:#fef3c7;color:#92400e;padding:2px 7px;border-radius:6px;font-size:.7rem;font-weight:700">Trước 1 ngày</span>'
        : '<span style="background:#fee2e2;color:#991b1b;padding:2px 7px;border-radius:6px;font-size:.7rem;font-weight:700">Trước 1 giờ</span>';

      return `
        <div style="padding:10px 16px;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:4px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:700;font-size:.85rem">${r.full_name || '—'}</span>
            ${typeLabel}
          </div>
          <div style="font-size:.78rem;color:var(--text3)">
            📞 ${r.phone || '—'} &nbsp;|&nbsp; 🐾 ${r.service || '—'}
          </div>
          <div style="font-size:.78rem;color:var(--text3)">
            📅 ${r.date || '—'} lúc ${r.time_slot || '—'}
          </div>
          <div style="display:flex;gap:6px;margin-top:4px">
            <a href="tel:${r.phone}" class="adm-btn adm-btn-sec adm-btn-sm" style="font-size:.72rem;text-decoration:none">
              📞 Gọi ngay
            </a>
            <button class="adm-btn adm-btn-sm" style="font-size:.72rem;background:#dcfce7;color:#166534"
              onclick="admMarkReminderSent(${r.id})">
              ✅ Đã nhắc
            </button>
          </div>
        </div>`;
    }).join('');

  } catch(e) {
    listEl.innerHTML = `<div style="text-align:center;padding:24px;color:var(--accent);font-size:.82rem">Lỗi tải thông báo</div>`;
  }
}

async function admMarkReminderSent(reminderId) {
  try {
    await api('/api/booking-reminders/' + reminderId + '/mark-sent', { method: 'POST' });
    admLoadNotif(); // reload
  } catch(e) {
    toast('Lỗi cập nhật', 'error');
  }
}

function admToggleNotif() {
  _notifOpen = !_notifOpen;
  const dd = document.getElementById('admNotifDropdown');
  dd.style.display = _notifOpen ? 'block' : 'none';
  if (_notifOpen) admLoadNotif();
}

// Đóng dropdown khi click ra ngoài
document.addEventListener('click', e => {
  const btn = document.getElementById('admNotifBtn');
  const dd  = document.getElementById('admNotifDropdown');
  if (dd && btn && !btn.contains(e.target) && !dd.contains(e.target)) {
    dd.style.display = 'none';
    _notifOpen = false;
  }
});

// Hàm riêng chỉ cập nhật badge (không render dropdown)
async function _refreshNotifBadge() {
  try {
    const pending = await api('/api/booking-reminders?status=Pending');
    const badge = document.getElementById('admNotifBadge');
    if (badge) {
      badge.textContent = pending.length;
      badge.style.background = pending.length > 0 ? 'var(--accent)' : 'var(--text3)';
    }
  } catch(_) {}
}

// Tự động refresh badge mỗi 2 phút
setInterval(_refreshNotifBadge, 120000);

// Load badge ngay khi trang mở (1 lần duy nhất)
window.addEventListener('load', () => setTimeout(_refreshNotifBadge, 1500));

async function openCheckinModal() {
  const rooms = await api('/api/rooms');
  const pets  = await api('/api/pets');

  const availableRooms = rooms.filter(r => r.status === 'available');

  document.getElementById('admModalTitle').textContent = '🏠 Nhận phòng lưu trú';

  document.getElementById('admModalBody').innerHTML = `
    <div class="adm-form-row">
      <div class="adm-form-group">
        <label class="adm-label">Chọn phòng</label>
        <select class="adm-select" id="checkinRoom">
          ${availableRooms.map(r => `
            <option value="${r.id}">${r.id}</option>
          `).join('')}
        </select>
      </div>

      <div class="adm-form-group">
        <label class="adm-label">Ngày nhận</label>
        <input type="datetime-local" class="adm-input" id="checkinDate">
      </div>
    </div>

    <div class="adm-form-group">
      <label class="adm-label">Chọn thú cưng</label>
      <select class="adm-select" id="checkinPet" onchange="fillOwnerInfo()">
        <option value="">-- Chọn thú cưng --</option>
        ${pets.map(p => `
          <option value="${p.id}" data-owner="${p.owner_name || ''}">
            ${p.name} (${p.id})
          </option>
        `).join('')}
      </select>
    </div>

    <div class="adm-form-group">
      <label class="adm-label">Chủ nuôi</label>
      <input class="adm-input" id="ownerName" readonly placeholder="Hệ thống tự động hiển thị chủ nuôi...">
    </div>
  `;

  document.getElementById('admModalFoot').innerHTML = `
    <button class="adm-btn adm-btn-sec" onclick="admCloseModal()">Hủy</button>
    <button class="adm-btn adm-btn-primary" onclick="confirmCheckin()">🏠 Xác nhận nhận phòng</button>
  `;

  document.getElementById('admModalOverlay').classList.add('open');
}

function fillOwnerInfo() {
  const petSelect = document.getElementById('checkinPet');
  const ownerInput = document.getElementById('ownerName');
  if (petSelect && ownerInput) {
    const selectedOption = petSelect.options[petSelect.selectedIndex];
    ownerInput.value = selectedOption.getAttribute('data-owner') || (petSelect.value ? 'Chưa có thông tin chủ nuôi' : '');
  }
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

async function finishCleaningRoom(id) {

  const response = await api(`/api/rooms/${id}/clean`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'available' })
  });

  admCloseModal(); 
  if (toast) toast(response.message || `Phòng ${id} đã sạch sẽ, sẵn sàng đón khách mới!`, 'success');
  admBoarding(); 
}

async function admTransports(
  search = '',
  date = ''
) {

  const items = await api(
    `/api/transports?search=${search}&date=${date}`
  );

  document.getElementById(
    'admContent'
  ).innerHTML = `

  <div class="adm-page-header">

    <div>
      <div class="adm-page-title">
        🚚 Lịch sử đưa đón
      </div>
      <div class="adm-page-sub">
        ${items.length} chuyến xe
      </div>
    </div>

    <div class="flex gap8">
      <input
        id="transportSearch"
        class="adm-input"
        placeholder="Tìm mã, khách hàng..."
      >

      <button
        class="adm-btn adm-btn-sec"
        onclick="searchTransport()"
      >
        🔍
      </button>

      <input
          type="date"
          id="transportDate"
      />

      <button
          class="adm-btn"
          onclick="filterTransport()"
      >
          Lọc
      </button>
    </div>

  </div>

  <div class="adm-card" style="padding:0">

    <table class="adm-table">

    <thead>
      <tr>
        <th>Mã</th>
        <th>Khách hàng</th>
        <th>Thú cưng</th>
        <th>Ngày</th>
        <th>Tài xế</th>
        <th>Phí</th>
        <th>Trạng thái</th>
        <th>Chi tiết</th>
        <th>Thao tác</th>
      </tr>
    </thead>

      <tbody>

      ${items.map(i => `

      <tr>

        <td>${i.booking_code}</td>

        <td>
          ${i.owner_name}
          <br>
          <small>${i.phone}</small>
        </td>

        <td>${i.pet_name}</td>

        <td>
          ${i.transport_date}
          <br>
          ${i.transport_time}
        </td>

        <td>${i.driver_name || '-'}</td>

        <td>${fmt(i.total_price)}</td>

        <td>
          <span class="
          adm-badge
          ${transportBadge(i.status)}
          ">

          ${i.status}

          </span>

        </td>

        <td>

          <button
            class="adm-btn adm-btn-sec adm-btn-sm"
            onclick="viewTransport(${i.id})"
          >
            👁
          </button>

        </td>

        <td>

          <select
            class="adm-input"
            onchange="updateTransportStatus(${i.id}, this.value)"
          >

            <option value="Đã nhận thú cưng"
              ${i.status === 'Đã nhận thú cưng' ? 'selected' : ''}>
              📥 Đã nhận
            </option>

            <option value="Đang di chuyển"
              ${i.status === 'Đang di chuyển' ? 'selected' : ''}>
              🚚 Đang di chuyển
            </option>

            <option value="Đã giao thành công"
              ${i.status === 'Đã giao thành công' ? 'selected' : ''}>
              ✅ Đã giao
            </option>

            <option value="Hủy chuyến"
              ${i.status === 'Hủy chuyến' ? 'selected' : ''}>
              ❌ Hủy chuyến
            </option>

          </select>

        </td>

      </tr>

      `).join('')}

      </tbody>

    </table>

  </div>
  `;
}

async function viewTransport(id){

  const items = await api('/api/transports');

  const t = items.find(
    x => x.id == id
  );

  document.getElementById(
    'admModalTitle'
  ).textContent =
    'Chi tiết chuyến xe';

  document.getElementById(
    'admModalBody'
  ).innerHTML = `

    <p><b>Mã:</b> ${t.booking_code}</p>

    <p><b>Khách hàng:</b> ${t.owner_name}</p>

    <p><b>SĐT:</b> ${t.phone}</p>

    <p><b>Thú cưng:</b> ${t.pet_name}</p>

    <p><b>Điểm đón:</b> ${t.pickup_address}</p>

    <p><b>Điểm trả:</b> ${t.dropoff_address}</p>

    <p><b>Tài xế:</b> ${t.driver_name}</p>

    <p><b>Biển số:</b> ${t.vehicle_plate}</p>

    <p><b>Trạng thái:</b> ${t.status}</p>

  `;

  document
    .getElementById(
      'admModalOverlay'
    )
    .classList.add('open');
}

async function filterTransport() {

    const date =
        document.getElementById(
            'transportDate'
        ).value;

    admTransports('', date);
}

async function updateTransportStatus(
    id,
    status
){

    await fetch(
        `/admin/api/transports/${id}/status`,
        {
            method:'PUT',
            headers:{
                'Content-Type':
                'application/json'
            },
            body:JSON.stringify({
                status
            })
        }
    );

    admTransports();
}

function transportBadge(status){

    if(status==='Đã nhận thú cưng')
        return 'warning';

    if(status==='Đang di chuyển')
        return 'info';

    if(status==='Đã giao thành công')
        return 'success';

    if(status==='Hủy chuyến')
        return 'danger';

    return 'secondary';
}

function transportBadge(status){
    if(status === 'Đã nhận thú cưng') return 'warning';
    if(status === 'Đang di chuyển') return 'info';
    if(status === 'Đã giao thành công') return 'success';
    if(status === 'Hủy chuyến') return 'danger';
    return 'secondary';
}

function transportStatusText(status){

  const map = {

    pending : 'Chờ xác nhận',

    received : 'Đã nhận thú cưng',

    moving : 'Đang di chuyển',

    delivered : 'Đã giao thành công',

    cancelled : 'Hủy chuyến'

  };

  return map[status] || status;
}

function transportBadge(status){

  if(
    status === 'pending'
  )
    return 'warning';

  if(
    status === 'received'
  )
    return 'info';

  if(
    status === 'moving'
  )
    return 'primary';

  if(
    status === 'delivered'
  )
    return 'success';

  if(
    status === 'cancelled'
  )
    return 'danger';

  return 'secondary';
}

function searchTransport() {

  const keyword =
    document.getElementById(
      'transportSearch'
    ).value;

  admTransports(keyword);
}