/* ============================================================
   ETM Dashboard — comercial.js
   CRM: Pipeline Kanban + Hitos de Pago + Chart
   3 categorías: Activo, Potencial Ex-Auspiciador, Potencial Nuevo
   ============================================================ */

const DEFAULT_CLIENTES = [
  { id: 1, empresa: 'Cliente ejemplo A', monto: 0, responsable: 'Catalina Pizarro', etapa: 'Prospecto',         dias: 1, tipo: 'potencial-nuevo' },
  { id: 2, empresa: 'Cliente ejemplo B', monto: 0, responsable: 'Catalina Pizarro', etapa: 'Contactado',        dias: 1, tipo: 'potencial-ex' },
  { id: 3, empresa: 'Cliente ejemplo C', monto: 0, responsable: 'Catalina Pizarro', etapa: 'Propuesta Enviada', dias: 1, tipo: 'potencial-ex' },
  { id: 4, empresa: 'Cliente ejemplo D', monto: 0, responsable: 'Catalina Pizarro', etapa: 'Negociación',       dias: 1, tipo: 'potencial-nuevo' },
  { id: 5, empresa: 'Cliente ejemplo E', monto: 0, responsable: 'Catalina Pizarro', etapa: 'Cerrado',           dias: 1, tipo: 'activo' },
];

const DEFAULT_HITOS = [
  { id: 1, cliente: 'Cliente ejemplo A', hito: 'Hito ejemplo 1', monto: 0, vencimiento: '01/06/2025', estado: 'Pendiente' },
  { id: 2, cliente: 'Cliente ejemplo B', hito: 'Hito ejemplo 2', monto: 0, vencimiento: '01/09/2025', estado: 'Pendiente' },
];

const META_ANUAL = 0;
const STAGES = ['Prospecto', 'Contactado', 'Propuesta Enviada', 'Negociación', 'Cerrado'];

let currentFilter = 'todos';

// ── Tipo Labels ────────────────────────────────────────────
const TIPO_LABELS = {
  'activo':          { label: 'Cliente Activo',           badge: 'badge-green',  icon: 'fa-circle-check' },
  'potencial-ex':    { label: 'Potencial Ex-Auspiciador', badge: 'badge-blue',   icon: 'fa-rotate-left' },
  'potencial-nuevo': { label: 'Potencial Nuevo',          badge: 'badge-yellow', icon: 'fa-star' },
};

function tipoBadge(tipo) {
  const t = TIPO_LABELS[tipo] || { label: tipo, badge: 'badge-gray', icon: 'fa-circle' };
  return `<span class="badge ${t.badge}"><i class="fa-solid ${t.icon}" style="margin-right:3px;font-size:9px"></i>${t.label}</span>`;
}

// ── KPIs ───────────────────────────────────────────────────
function renderKPIsComercial(clientes) {
  const pipeline   = clientes.reduce((a, c) => a + (parseInt(c.monto) || 0), 0);
  const activos    = clientes.filter(c => c.tipo === 'activo').length;
  const exAuspi    = clientes.filter(c => c.tipo === 'potencial-ex').length;
  const nuevos     = clientes.filter(c => c.tipo === 'potencial-nuevo').length;
  const cerrado    = clientes.filter(c => c.etapa === 'Cerrado').reduce((a, c) => a + (parseInt(c.monto) || 0), 0);
  const pct        = META_ANUAL > 0 ? Math.round((cerrado / META_ANUAL) * 100) : 0;

  setText('kpi-pipeline',   formatCLP(pipeline));
  setText('kpi-activos',    activos);
  setText('kpi-ex-auspi',   exAuspi);
  setText('kpi-nuevos',     nuevos);
  setText('kpi-meta',       formatCLP(META_ANUAL));
  setText('kpi-pct',        pct + '%');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── Tab Switching ──────────────────────────────────────────
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.crm-tab').forEach(btn => {
    btn.classList.toggle('crm-tab-active', btn.dataset.filter === filter);
  });
  const clientes = LS.get('clientes', DEFAULT_CLIENTES);
  renderKanban(clientes);
  renderChart(clientes);
}

function filteredClientes(clientes) {
  if (currentFilter === 'todos') return clientes;
  return clientes.filter(c => c.tipo === currentFilter);
}

// ── Kanban Board ───────────────────────────────────────────
const STAGE_STYLES = {
  'Prospecto':         { header: 'kanban-prospecto',   icon: 'fa-circle-dot' },
  'Contactado':        { header: 'kanban-contactado',  icon: 'fa-phone' },
  'Propuesta Enviada': { header: 'kanban-propuesta',   icon: 'fa-file-lines' },
  'Negociación':       { header: 'kanban-negociacion', icon: 'fa-handshake' },
  'Cerrado':           { header: 'kanban-cerrado',     icon: 'fa-circle-check' },
};

function renderKanban(clientes) {
  const board = document.getElementById('kanban-board');
  if (!board) return;
  board.innerHTML = '';
  const visible = filteredClientes(clientes);

  STAGES.forEach(stage => {
    const items = visible.filter(c => c.etapa === stage);
    const total = items.reduce((a, c) => a + (parseInt(c.monto) || 0), 0);
    const style = STAGE_STYLES[stage] || { header: 'kanban-prospecto', icon: 'fa-circle' };

    const col = document.createElement('div');
    col.className = 'kanban-col';
    col.innerHTML = `
      <div class="kanban-col-header ${style.header}">
        <span><i class="fa-solid ${style.icon}" style="margin-right:6px"></i>${stage}</span>
        <span style="font-size:11px;opacity:0.8">${items.length} · ${formatCLP(total)}</span>
      </div>
      <div class="kanban-col-body" id="kanban-col-${stage.replace(/\s/g,'-')}">
        ${items.length === 0 ? '<div style="text-align:center;padding:20px;font-size:12px;color:#9CA3AF">Sin registros</div>' : ''}
      </div>
    `;
    board.appendChild(col);

    const colBody = col.querySelector('.kanban-col-body');
    items.forEach(c => {
      const card = document.createElement('div');
      card.className = 'kanban-card';
      card.innerHTML = `
        <div class="kanban-card-company">${escapeHtml(c.empresa)}</div>
        <div style="margin:4px 0">${tipoBadge(c.tipo)}</div>
        <div class="kanban-card-contact"><i class="fa-solid fa-user" style="margin-right:4px"></i>${escapeHtml(c.responsable)}</div>
        <div class="kanban-card-amount">${formatCLP(c.monto)}</div>
        <div class="kanban-card-footer">
          <span class="kanban-days"><i class="fa-regular fa-clock"></i> ${c.dias} días</span>
          <div style="display:flex;gap:4px">
            <button class="btn btn-ghost btn-sm btn-icon" title="Editar" onclick="openEditCliente(${c.id})"><i class="fa-solid fa-pen"></i></button>
            <button class="btn btn-danger btn-sm btn-icon" title="Eliminar" onclick="deleteCliente(${c.id})"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      `;
      colBody.appendChild(card);
    });
  });
}

// ── Hitos Table ────────────────────────────────────────────
function renderHitos(hitos) {
  const tbody = document.querySelector('#hitos-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (!hitos.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fa-solid fa-calendar-xmark"></i><p>Sin hitos registrados</p></td></tr>';
    return;
  }
  hitos.forEach(h => {
    const tr = document.createElement('tr');
    if (h.estado === 'Vencido') tr.classList.add('vencido-row');
    tr.innerHTML = `
      <td style="font-weight:600">${escapeHtml(h.cliente)}</td>
      <td>${escapeHtml(h.hito)}</td>
      <td style="font-weight:700;color:var(--etm-primary)">${formatCLP(h.monto)}</td>
      <td style="white-space:nowrap">${escapeHtml(h.vencimiento)}</td>
      <td>${statusBadge(h.estado)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-sm btn-icon" title="Editar" onclick="openEditHito(${h.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" title="Eliminar" onclick="deleteHito(${h.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  makeSortable('hitos-table');
}

// ── Donut Chart ────────────────────────────────────────────
let chartInstance = null;
function renderChart(clientes) {
  const ctx = document.getElementById('pipeline-chart');
  if (!ctx) return;
  const visible = filteredClientes(clientes);
  const amounts = STAGES.map(s => visible.filter(c => c.etapa === s).reduce((a, c) => a + (parseInt(c.monto) || 0), 0));
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: STAGES,
      datasets: [{
        data: amounts,
        backgroundColor: ['#94A3B8','#3B82F6','#7C3AED','#F59E0B','#22C55E'],
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${formatCLP(ctx.raw)}` } }
      },
      cutout: '62%',
    }
  });
}

// ── CRUD Clientes ──────────────────────────────────────────
function openAddCliente() {
  document.getElementById('cliente-modal-title').textContent = 'Agregar Cliente / Sponsor';
  document.getElementById('cliente-form').reset();
  document.getElementById('cliente-edit-id').value = '';
  openModal('cliente-modal');
}

function openEditCliente(id) {
  const data = LS.get('clientes', DEFAULT_CLIENTES);
  const row = data.find(r => String(r.id) === String(id));
  if (!row) return;
  document.getElementById('cliente-modal-title').textContent = 'Editar Cliente';
  document.getElementById('cliente-edit-id').value = row.id;
  document.getElementById('cliente-empresa').value = row.empresa;
  document.getElementById('cliente-monto').value = row.monto;
  document.getElementById('cliente-responsable').value = row.responsable;
  document.getElementById('cliente-etapa').value = row.etapa;
  document.getElementById('cliente-dias').value = row.dias;
  document.getElementById('cliente-tipo').value = row.tipo || 'potencial-nuevo';
  openModal('cliente-modal');
}

function saveCliente() {
  const id = document.getElementById('cliente-edit-id').value;
  const item = {
    empresa:     document.getElementById('cliente-empresa').value.trim(),
    monto:       parseCLP(document.getElementById('cliente-monto').value),
    responsable: document.getElementById('cliente-responsable').value.trim(),
    etapa:       document.getElementById('cliente-etapa').value,
    dias:        parseInt(document.getElementById('cliente-dias').value) || 0,
    tipo:        document.getElementById('cliente-tipo').value,
  };
  if (!item.empresa) { showToast('Completa los campos requeridos', 'error'); return; }
  let data = LS.get('clientes', DEFAULT_CLIENTES);
  if (id) {
    data = data.map(r => String(r.id) === String(id) ? { ...r, ...item } : r);
    LS.set('clientes', data);
    showToast('Cliente actualizado correctamente');
  } else {
    item.id = genId();
    data.push(item);
    LS.set('clientes', data);
    showToast('Cliente agregado correctamente');
  }
  closeModal('cliente-modal');
  refreshComercial();
}

function deleteCliente(id) {
  confirmAction('¿Eliminar este cliente del pipeline?', () => {
    LS.remove('clientes', id);
    refreshComercial();
    showToast('Cliente eliminado', 'info');
  });
}

// ── CRUD Hitos ─────────────────────────────────────────────
function openAddHito() {
  document.getElementById('hito-modal-title').textContent = 'Agregar Hito de Pago';
  document.getElementById('hito-form').reset();
  document.getElementById('hito-edit-id').value = '';
  openModal('hito-modal');
}

function openEditHito(id) {
  const data = LS.get('hitos', DEFAULT_HITOS);
  const row = data.find(r => String(r.id) === String(id));
  if (!row) return;
  document.getElementById('hito-modal-title').textContent = 'Editar Hito';
  document.getElementById('hito-edit-id').value = row.id;
  document.getElementById('hito-cliente').value = row.cliente;
  document.getElementById('hito-hito').value = row.hito;
  document.getElementById('hito-monto').value = row.monto;
  document.getElementById('hito-vencimiento').value = row.vencimiento;
  document.getElementById('hito-estado').value = row.estado;
  openModal('hito-modal');
}

function saveHito() {
  const id = document.getElementById('hito-edit-id').value;
  const item = {
    cliente:     document.getElementById('hito-cliente').value.trim(),
    hito:        document.getElementById('hito-hito').value.trim(),
    monto:       parseCLP(document.getElementById('hito-monto').value),
    vencimiento: document.getElementById('hito-vencimiento').value.trim(),
    estado:      document.getElementById('hito-estado').value,
  };
  if (!item.cliente || !item.hito) { showToast('Completa los campos requeridos', 'error'); return; }
  let data = LS.get('hitos', DEFAULT_HITOS);
  if (id) {
    data = data.map(r => String(r.id) === String(id) ? { ...r, ...item } : r);
    LS.set('hitos', data);
    showToast('Hito actualizado');
  } else {
    item.id = genId();
    data.push(item);
    LS.set('hitos', data);
    showToast('Hito agregado');
  }
  closeModal('hito-modal');
  renderHitos(LS.get('hitos', DEFAULT_HITOS));
}

function deleteHito(id) {
  confirmAction('¿Eliminar este hito de pago?', () => {
    LS.remove('hitos', id);
    renderHitos(LS.get('hitos', DEFAULT_HITOS));
    showToast('Hito eliminado', 'info');
  });
}

// ── Refresh All ────────────────────────────────────────────
function refreshComercial() {
  const clientes = LS.get('clientes', DEFAULT_CLIENTES);
  renderKPIsComercial(clientes);
  renderKanban(clientes);
  renderChart(clientes);
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('comercial');
  renderHeader('CRM Comercial', 'Sponsors, clientes y pipeline de ventas');

  if (!localStorage.getItem('etm_clientes')) LS.set('clientes', DEFAULT_CLIENTES);
  if (!localStorage.getItem('etm_hitos'))    LS.set('hitos', DEFAULT_HITOS);

  refreshComercial();
  renderHitos(LS.get('hitos', DEFAULT_HITOS));
});
