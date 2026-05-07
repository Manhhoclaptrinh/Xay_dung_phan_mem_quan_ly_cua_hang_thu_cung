// ── TOAST ──────────────────────────────────────────────────────────────────
function toast(msg, type = 'info') {
  const w = document.getElementById('toastWrap');
  const t = document.createElement('div');
  const ic = { success: '✅', error: '❌', info: 'ℹ️' };
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${ic[type] || 'ℹ️'}</span><span>${msg}</span>`;
  w.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut .28s ease forwards';
    setTimeout(() => t.remove(), 300);
  }, 3200);
}

// ── FORMAT ─────────────────────────────────────────────────────────────────
function fmt(n) {
  return new Intl.NumberFormat('vi-VN').format(n) + 'đ';
}
function fmtShort(n) {
  return n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : (n / 1000).toFixed(0) + 'K';
}