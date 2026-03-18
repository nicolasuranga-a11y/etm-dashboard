/* ============================================================
   ETM Dashboard — produccion.js
   Dashboard de Producción: Gantt Visual + Proveedores
   ============================================================ */

const PRESUPUESTO_MAX = 250001000; // Presupuesto máximo EtMday 2025

// ── Default Data ───────────────────────────────────────────
const DEFAULT_GANTT = [
  { id: 1, etapa: 'Etapa ejemplo 1', responsable: 'Pamela Abello', inicio: '01/03/2025', termino: '30/06/2025', avance: 0, estado: 'Pendiente' },
  { id: 2, etapa: 'Etapa ejemplo 2', responsable: 'Pamela Abello', inicio: '01/05/2025', termino: '30/09/2025', avance: 0, estado: 'Pendiente' },
  { id: 3, etapa: 'Etapa ejemplo 3', responsable: 'Pamela Abello', inicio: '01/08/2025', termino: '30/11/2025', avance: 0, estado: 'Pendiente' },
];

const DEFAULT_PROVEEDORES = [
  { id: 1, proveedor: 'Proveedor ejemplo 1', servicio: 'Servicio ejemplo A', monto: 0, estado: 'Pendiente', cuotas: '0/1' },
  { id: 2, proveedor: 'Proveedor ejemplo 2', servicio: 'Servicio ejemplo B', monto: 0, estado: 'Pendiente', cuotas: '0/1' },
];

// ── Helpers ────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function parseDate(str) {
  if (!str) return null;
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  const d = new Date(parts[2], parts[1] - 1, parts[0]);
  return isNaN(d) ? null : d;
}

// ── KPIs ───────────────────────────────────────────────────
function calcKPIs(proveedores) {
  const total = proveedores.length;
  const montoTotal = proveedores.reduce((a, p) => a + (parseInt(p.monto) || 0), 0);
  const pagados = proveedores.filter(p => p.estado === 'Pagado').length;
  const pendientes = proveedores.filter(p => p.estado !== 'Pagado').length;
  return { total, montoTotal, pagados, pendientes };
}

function renderKPIs(proveedores) {
  const { total, montoTotal, pagados, pendientes } = calcKPIs(proveedores);
  document.getElementById('kpi-total-proveedores').textContent = total;
  document.getElementById('kpi-pagos-completados').textContent = pagados;
  document.getElementById('kpi-pagos-pendientes').textContent = pendientes;

  // Budget progress
  const pct = PRESUPUESTO_MAX > 0 ? Math.min(100, Math.round((montoTotal / PRESUPUESTO_MAX) * 100)) : 0;
  const montoEl = document.getElementById('kpi-monto-total');
  if (montoEl) montoEl.textContent = formatCLP(montoTotal);

  const bar = document.getElementById('budget-bar-fill');
  const label = document.getElementById('budget-bar-pct');
  const sub = document.getElementById('budget-bar-sub');
  if (bar) {
    bar.style.width = pct + '%';
    bar.style.background = pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#7C3AED';
  }
  if (label) label.textContent = pct + '%';
  if (sub) sub.textContent = formatCLP(montoTotal) + ' comprometido de ' + formatCLP(PRESUPUESTO_MAX);
}

// ── Visual Gantt ───────────────────────────────────────────
function renderGanttVisual(data) {
  const container = document.getElementById('gantt-visual');
  if (!container) return;

  if (!data.length) {
    container.innerHTML = '<p style="text-align:center;color:#9CA3AF;padding:32px 20px">Sin etapas registradas. Agrega una etapa para ver la línea de tiempo.</p>';
    return;
  }

  const dates = data.flatMap(r => [parseDate(r.inicio), parseDate(r.termino)]).filter(Boolean);
  if (!dates.length) {
    container.innerHTML = '<p style="text-align:center;color:#9CA3AF;padding:32px 20px">Define fechas en las etapas para ver la línea de tiempo.</p>';
    return;
  }

  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  // Add 5% padding on each side
  const totalMs = (maxDate - minDate) || (1000 * 60 * 60 * 24 * 30);

  // Generate months for header
  const months = [];
  let cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  while (cur <= maxDate) {
    months.push(new Date(cur));
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  const stateColors = {
    'Completado': { bg: '#D1FAE5', border: '#22C55E', fill: '#22C55E' },
    'En curso':   { bg: '#EDE9FE', border: '#7C3AED', fill: '#7C3AED' },
    'Pendiente':  { bg: '#F3F4F6', border: '#94A3B8', fill: '#94A3B8' },
    'Pausado':    { bg: '#FEE2E2', border: '#EF4444', fill: '#EF4444' },
  };

  let monthsHtml = months.map(m => {
    const leftPct = ((m - minDate) / totalMs) * 100;
    return `<div class="gv-month" style="left:${leftPct.toFixed(2)}%">${monthNames[m.getMonth()]} '${String(m.getFullYear()).slice(2)}</div>`;
  }).join('');

  let gridLines = months.map(m => {
    const leftPct = ((m - minDate) / totalMs) * 100;
    return `<div class="gv-gridline" style="left:${leftPct.toFixed(2)}%"></div>`;
  }).join('');

  // Today marker
  const today = new Date();
  let todayHtml = '';
  if (today >= minDate && today <= maxDate) {
    const todayPct = ((today - minDate) / totalMs) * 100;
    todayHtml = `<div class="gv-today" style="left:${todayPct.toFixed(2)}%"><div class="gv-today-label">Hoy</div></div>`;
  }

  let rowsHtml = data.map(r => {
    const start = parseDate(r.inicio);
    const end = parseDate(r.termino);
    const colors = stateColors[r.estado] || stateColors['Pendiente'];
    const pct = Math.min(100, Math.max(0, parseInt(r.avance) || 0));

    let barHtml = '';
    if (start && end) {
      const leftPct = Math.max(0, ((start - minDate) / totalMs) * 100);
      const widthPct = Math.max(1, ((end - start) / totalMs) * 100);
      barHtml = `
        <div class="gv-bar" style="left:${leftPct.toFixed(2)}%;width:${widthPct.toFixed(2)}%;background:${colors.bg};border:2px solid ${colors.border}" title="${escapeHtml(r.etapa)} · ${pct}%">
          <div class="gv-bar-fill" style="width:${pct}%;background:${colors.fill}"></div>
          <span class="gv-bar-label">${escapeHtml(r.etapa)} · ${pct}%</span>
        </div>`;
    } else {
      barHtml = `<div style="padding:8px;font-size:11px;color:#9CA3AF">Sin fechas definidas</div>`;
    }

    return `
      <div class="gv-row">
        <div class="gv-row-label" title="${escapeHtml(r.etapa)}">
          <span class="gv-state-dot" style="background:${colors.border}"></span>
          <span>${escapeHtml(r.etapa)}</span>
        </div>
        <div class="gv-row-timeline">
          ${gridLines}
          ${todayHtml}
          ${barHtml}
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="gv-wrap">
      <div class="gv-header-row">
        <div class="gv-header-label">Etapa</div>
        <div class="gv-header-timeline">
          ${monthsHtml}
          ${gridLines}
        </div>
      </div>
      ${rowsHtml}
    </div>`;
}

// ── Gantt Table ────────────────────────────────────────────
function renderGantt(data) {
  const tbody = document.querySelector('#gantt-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fa-solid fa-calendar-xmark"></i><p>Sin etapas registradas</p></td></tr>';
    return;
  }
  data.forEach(row => {
    const pct = parseInt(row.avance) || 0;
    let barColor = 'purple';
    if (pct === 100) barColor = 'green';
    else if (pct >= 50) barColor = 'blue';
    else if (pct <= 10 && pct > 0) barColor = 'amber';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-truncate" style="max-width:170px;font-weight:600">${escapeHtml(row.etapa)}</td>
      <td>${escapeHtml(row.responsable)}</td>
      <td style="white-space:nowrap">${escapeHtml(row.inicio)}</td>
      <td style="white-space:nowrap">${escapeHtml(row.termino)}</td>
      <td>${progressBar(pct, barColor)}</td>
      <td>${statusBadge(row.estado)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-sm btn-icon" title="Editar" onclick="openEditGantt(${row.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" title="Eliminar" onclick="deleteGanttRow(${row.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  makeSortable('gantt-table');
}

// ── Proveedores Table ──────────────────────────────────────
function renderProveedores(data) {
  const tbody = document.querySelector('#proveedores-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fa-solid fa-store-slash"></i><p>Sin proveedores registrados</p></td></tr>';
    return;
  }
  data.forEach(row => {
    const tr = document.createElement('tr');
    if (row.estado === 'Vencido') tr.classList.add('vencido-row');
    tr.innerHTML = `
      <td style="font-weight:600">${escapeHtml(row.proveedor)}</td>
      <td>${escapeHtml(row.servicio)}</td>
      <td style="font-weight:700;color:var(--etm-primary)">${formatCLP(row.monto)}</td>
      <td>${statusBadge(row.estado)}</td>
      <td><span class="badge badge-gray">${escapeHtml(row.cuotas)}</span></td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-sm btn-icon" title="Editar" onclick="openEditProveedor(${row.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" title="Eliminar" onclick="deleteProveedor(${row.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  makeSortable('proveedores-table');
}

// ── CRUD Gantt ─────────────────────────────────────────────
function openAddGantt() {
  document.getElementById('gantt-modal-title').textContent = 'Agregar Etapa';
  document.getElementById('gantt-form').reset();
  document.getElementById('gantt-edit-id').value = '';
  openModal('gantt-modal');
}

function openEditGantt(id) {
  const data = LS.get('gantt', DEFAULT_GANTT);
  const row = data.find(r => String(r.id) === String(id));
  if (!row) return;
  document.getElementById('gantt-modal-title').textContent = 'Editar Etapa';
  document.getElementById('gantt-edit-id').value = row.id;
  document.getElementById('gantt-etapa').value = row.etapa;
  document.getElementById('gantt-responsable').value = row.responsable;
  document.getElementById('gantt-inicio').value = row.inicio;
  document.getElementById('gantt-termino').value = row.termino;
  document.getElementById('gantt-avance').value = row.avance;
  document.getElementById('gantt-estado').value = row.estado;
  openModal('gantt-modal');
}

function saveGantt() {
  const id = document.getElementById('gantt-edit-id').value;
  const item = {
    etapa: document.getElementById('gantt-etapa').value.trim(),
    responsable: document.getElementById('gantt-responsable').value.trim(),
    inicio: document.getElementById('gantt-inicio').value.trim(),
    termino: document.getElementById('gantt-termino').value.trim(),
    avance: parseInt(document.getElementById('gantt-avance').value) || 0,
    estado: document.getElementById('gantt-estado').value,
  };
  if (!item.etapa || !item.responsable) {
    showToast('Completa los campos requeridos', 'error'); return;
  }
  let data = LS.get('gantt', DEFAULT_GANTT);
  if (id) {
    data = data.map(r => String(r.id) === String(id) ? { ...r, ...item } : r);
    LS.set('gantt', data);
    showToast('Etapa actualizada correctamente');
  } else {
    item.id = genId();
    data.push(item);
    LS.set('gantt', data);
    showToast('Etapa agregada correctamente');
  }
  closeModal('gantt-modal');
  refreshProduccion();
}

function deleteGanttRow(id) {
  confirmAction('¿Eliminar esta etapa del Gantt?', () => {
    LS.remove('gantt', id);
    refreshProduccion();
    showToast('Etapa eliminada', 'info');
  });
}

// ── CRUD Proveedores ───────────────────────────────────────
function openAddProveedor() {
  document.getElementById('prov-modal-title').textContent = 'Agregar Proveedor';
  document.getElementById('prov-form').reset();
  document.getElementById('prov-edit-id').value = '';
  openModal('prov-modal');
}

function openEditProveedor(id) {
  const data = LS.get('proveedores', DEFAULT_PROVEEDORES);
  const row = data.find(r => String(r.id) === String(id));
  if (!row) return;
  document.getElementById('prov-modal-title').textContent = 'Editar Proveedor';
  document.getElementById('prov-edit-id').value = row.id;
  document.getElementById('prov-nombre').value = row.proveedor;
  document.getElementById('prov-servicio').value = row.servicio;
  document.getElementById('prov-monto').value = row.monto;
  document.getElementById('prov-estado').value = row.estado;
  document.getElementById('prov-cuotas').value = row.cuotas;
  openModal('prov-modal');
}

function saveProveedor() {
  const id = document.getElementById('prov-edit-id').value;
  const item = {
    proveedor: document.getElementById('prov-nombre').value.trim(),
    servicio: document.getElementById('prov-servicio').value.trim(),
    monto: parseCLP(document.getElementById('prov-monto').value),
    estado: document.getElementById('prov-estado').value,
    cuotas: document.getElementById('prov-cuotas').value.trim() || '0/1',
  };
  if (!item.proveedor || !item.servicio) {
    showToast('Completa los campos requeridos', 'error'); return;
  }
  let data = LS.get('proveedores', DEFAULT_PROVEEDORES);
  if (id) {
    data = data.map(r => String(r.id) === String(id) ? { ...r, ...item } : r);
    LS.set('proveedores', data);
    showToast('Proveedor actualizado correctamente');
  } else {
    item.id = genId();
    data.push(item);
    LS.set('proveedores', data);
    showToast('Proveedor agregado correctamente');
  }
  closeModal('prov-modal');
  refreshProduccion();
}

function deleteProveedor(id) {
  confirmAction('¿Eliminar este proveedor?', () => {
    LS.remove('proveedores', id);
    refreshProduccion();
    showToast('Proveedor eliminado', 'info');
  });
}

// ── Refresh All ────────────────────────────────────────────
function refreshProduccion() {
  const ganttData = LS.get('gantt', DEFAULT_GANTT);
  const provData = LS.get('proveedores', DEFAULT_PROVEEDORES);
  renderKPIs(provData);
  renderGanttVisual(ganttData);
  renderGantt(ganttData);
  renderProveedores(provData);
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('produccion');
  renderHeader('Producción — EtMday 2025', 'Planificación, proveedores y carta Gantt del evento');

  if (!localStorage.getItem('etm_gantt')) LS.set('gantt', DEFAULT_GANTT);
  if (!localStorage.getItem('etm_proveedores')) LS.set('proveedores', DEFAULT_PROVEEDORES);

  refreshProduccion();
});
