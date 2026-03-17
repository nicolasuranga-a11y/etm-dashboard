/* ============================================================
   ETM Dashboard — shared.js
   Utilidades compartidas, sidebar, localStorage helpers
   ============================================================ */

// ── Sidebar HTML ───────────────────────────────────────────
const SIDEBAR_HTML = `
<div class="sidebar-logo">
  <div class="logo-icon">ETM</div>
  <div class="logo-text">
    <h2>Emprende tu Mente</h2>
    <p>Dashboard 2025</p>
  </div>
</div>
<nav class="sidebar-nav">
  <div class="nav-section-label">Principal</div>
  <a href="/index.html" class="nav-item" data-page="home">
    <span class="nav-icon"><i class="fa-solid fa-house"></i></span>
    <span class="nav-label">Inicio</span>
  </a>
  <div class="nav-section-label" style="margin-top:8px">Dashboards</div>
  <a href="/pages/produccion.html" class="nav-item" data-page="produccion">
    <span class="nav-icon"><i class="fa-solid fa-calendar-days"></i></span>
    <span class="nav-label">Producción</span>
  </a>
  <a href="/pages/comercial.html" class="nav-item" data-page="comercial">
    <span class="nav-icon"><i class="fa-solid fa-handshake"></i></span>
    <span class="nav-label">Comercial / CRM</span>
  </a>
  <a href="/pages/marketing.html" class="nav-item" data-page="marketing">
    <span class="nav-icon"><i class="fa-solid fa-bullhorn"></i></span>
    <span class="nav-label">Marketing</span>
  </a>
  <a href="/pages/ecosistemas.html" class="nav-item" data-page="ecosistemas">
    <span class="nav-icon"><i class="fa-solid fa-network-wired"></i></span>
    <span class="nav-label">Ecosistemas</span>
  </a>
</nav>
<div class="sidebar-footer">
  <div class="sidebar-version">ETM Dashboard v1.0 · 2025</div>
</div>
`;

// ── Render Sidebar ─────────────────────────────────────────
function renderSidebar(activePage) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.innerHTML = SIDEBAR_HTML;

  // Fix relative paths based on current page location
  const isInPages = window.location.pathname.includes('/pages/');
  const prefix = isInPages ? '../' : '';
  sidebar.querySelectorAll('a.nav-item').forEach(a => {
    const href = a.getAttribute('href');
    if (href.startsWith('/')) {
      a.setAttribute('href', prefix + href.replace(/^\//, ''));
    }
  });

  // Active state
  sidebar.querySelectorAll('a.nav-item').forEach(a => {
    if (a.dataset.page === activePage) a.classList.add('active');
  });
}

// ── Header ─────────────────────────────────────────────────
function renderHeader(title, subtitle) {
  const header = document.getElementById('main-header');
  if (!header) return;
  const today = formatDateCLP(new Date());
  header.innerHTML = `
    <div class="header-left">
      <h1>${title}</h1>
      <p>${subtitle || 'Corporación Emprende tu Mente'}</p>
    </div>
    <div class="header-right">
      <div class="header-date-badge">
        <i class="fa-regular fa-calendar"></i> ${today}
      </div>
      <div class="header-avatar" title="Administrador ETM">A</div>
    </div>
  `;
}

// ── LocalStorage Helpers ───────────────────────────────────
const LS = {
  get(key, fallback = []) {
    try {
      const v = localStorage.getItem('etm_' + key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('etm_' + key, JSON.stringify(value)); } catch {}
  },
  push(key, item, fallback = []) {
    const arr = this.get(key, fallback);
    item.id = item.id || Date.now();
    arr.push(item);
    this.set(key, arr);
    return arr;
  },
  update(key, id, newData, fallback = []) {
    let arr = this.get(key, fallback);
    arr = arr.map(x => String(x.id) === String(id) ? { ...x, ...newData } : x);
    this.set(key, arr);
    return arr;
  },
  remove(key, id) {
    let arr = this.get(key, []);
    arr = arr.filter(x => String(x.id) !== String(id));
    this.set(key, arr);
    return arr;
  }
};

// ── Format Helpers ─────────────────────────────────────────
function formatCLP(amount) {
  if (amount === null || amount === undefined || amount === '') return '-';
  const n = parseInt(String(amount).replace(/[^\d]/g, ''), 10);
  if (isNaN(n)) return '-';
  return '$' + n.toLocaleString('es-CL');
}

function parseCLP(str) {
  if (!str) return 0;
  return parseInt(String(str).replace(/[^\d]/g, ''), 10) || 0;
}

function formatDateCLP(date) {
  if (!date) return '-';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d)) return String(date);
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatPct(value, total) {
  if (!total) return '0%';
  return Math.round((value / total) * 100) + '%';
}

// ── Status Badge ───────────────────────────────────────────
function statusBadge(status) {
  const map = {
    // Green
    'Activo': 'badge-green',
    'Completado': 'badge-green',
    'Pagado': 'badge-green',
    'Cerrado': 'badge-green',
    'Aprobado': 'badge-green',
    'Confirmado': 'badge-green',
    'Enviado': 'badge-green',
    // Blue
    'En curso': 'badge-blue',
    'Parcial': 'badge-blue',
    'En proceso': 'badge-blue',
    'En negociación': 'badge-blue',
    'Programado': 'badge-indigo',
    // Yellow
    'Pendiente': 'badge-yellow',
    'Planificando': 'badge-yellow',
    'Planificado': 'badge-yellow',
    'En revisión': 'badge-yellow',
    // Red
    'Vencido': 'badge-red',
    'Pausado': 'badge-red',
    'Perdido': 'badge-red',
    // Gray
    'Borrador': 'badge-gray',
    'Sin definir': 'badge-gray',
  };
  const cls = map[status] || 'badge-gray';
  return `<span class="badge ${cls}">${status}</span>`;
}

// ── Progress Bar HTML ──────────────────────────────────────
function progressBar(pct, color = 'purple') {
  const colorMap = {
    purple: 'progress-fill-purple',
    green: 'progress-fill-green',
    amber: 'progress-fill-amber',
    red: 'progress-fill-red',
    blue: 'progress-fill-blue',
  };
  const p = Math.min(100, Math.max(0, parseInt(pct) || 0));
  const fillClass = colorMap[color] || 'progress-fill-purple';
  let c = color;
  if (p === 100) c = 'green';
  else if (p >= 60) c = 'purple';
  else if (p >= 30) c = 'amber';
  const fc = colorMap[c] || fillClass;
  return `
    <div class="progress-wrap">
      <div class="progress-bar" style="min-width:80px">
        <div class="progress-fill ${fc}" style="width:${p}%"></div>
      </div>
      <span class="progress-label">${p}%</span>
    </div>
  `;
}

// ── Modal Helpers ──────────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
}

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) closeAllModals();
});

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAllModals();
});

// ── Toast Notifications ────────────────────────────────────
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ── Sortable Tables ────────────────────────────────────────
function makeSortable(tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const headers = table.querySelectorAll('thead th');
  let currentCol = -1;
  let asc = true;

  headers.forEach((th, i) => {
    th.style.cursor = 'pointer';
    th.title = 'Ordenar por esta columna';
    th.addEventListener('click', () => {
      if (currentCol === i) { asc = !asc; } else { asc = true; currentCol = i; }
      headers.forEach(h => {
        h.innerHTML = h.innerHTML.replace(/ <i class="fa-solid fa-sort.*?<\/i>/g, '');
        h.innerHTML += ' <i class="fa-solid fa-sort" style="opacity:0.3;font-size:10px"></i>';
      });
      th.innerHTML = th.innerHTML.replace(/ <i class="fa-solid fa-sort.*?<\/i>/g, '');
      th.innerHTML += ` <i class="fa-solid ${asc ? 'fa-sort-up' : 'fa-sort-down'}" style="font-size:10px;color:var(--etm-primary)"></i>`;

      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.sort((a, b) => {
        const aText = (a.cells[i] ? a.cells[i].textContent.trim() : '');
        const bText = (b.cells[i] ? b.cells[i].textContent.trim() : '');
        const aNum = parseCLP(aText);
        const bNum = parseCLP(bText);
        if (!isNaN(aNum) && !isNaN(bNum) && aText.includes('$')) {
          return asc ? aNum - bNum : bNum - aNum;
        }
        return asc ? aText.localeCompare(bText, 'es') : bText.localeCompare(aText, 'es');
      });
      rows.forEach(r => tbody.appendChild(r));
    });
    th.innerHTML += ' <i class="fa-solid fa-sort" style="opacity:0.3;font-size:10px"></i>';
  });
}

// ── Confirm Dialog ─────────────────────────────────────────
function confirmAction(message, onConfirm) {
  const id = 'confirm-modal-' + Date.now();
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.id = id;
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:400px">
      <div class="modal-body">
        <div class="confirm-dialog">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <p>${message}</p>
          <small>Esta acción no se puede deshacer.</small>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="document.getElementById('${id}').remove()">Cancelar</button>
        <button class="btn btn-danger" id="${id}-confirm">Sí, eliminar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById(id + '-confirm').addEventListener('click', () => {
    overlay.remove();
    onConfirm();
  });
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

// ── Generate unique ID ─────────────────────────────────────
function genId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}
