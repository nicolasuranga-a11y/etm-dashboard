/* ============================================================
   ETM Dashboard — produccion.js
   Dashboard de Producción: Gantt + Proveedores
   ============================================================ */

// ── Default Data ───────────────────────────────────────────
const DEFAULT_GANTT = [
  { id: 1, etapa: 'Producción General',     responsable: 'Carolina Achondo', inicio: '01/03/2025', termino: '30/11/2025', avance: 15, estado: 'En curso' },
  { id: 2, etapa: 'Producción Audiovisual', responsable: 'Matías Correa',    inicio: '01/04/2025', termino: '15/11/2025', avance: 5,  estado: 'Pendiente' },
  { id: 3, etapa: 'Comunicaciones',         responsable: 'Antonia Torres',   inicio: '01/04/2025', termino: '20/11/2025', avance: 10, estado: 'En curso' },
  { id: 4, etapa: 'Comercial',              responsable: 'Ivonne Zuñiga',    inicio: '01/03/2025', termino: '30/11/2025', avance: 20, estado: 'En curso' },
  { id: 5, etapa: 'Ecosistema',             responsable: 'Daniel López',     inicio: '01/05/2025', termino: '30/11/2025', avance: 0,  estado: 'Pendiente' },
  { id: 6, etapa: 'Logística Venue',        responsable: 'Carolina Achondo', inicio: '01/06/2025', termino: '25/11/2025', avance: 0,  estado: 'Pendiente' },
  { id: 7, etapa: 'Proveedores Técnicos',   responsable: 'Matías Correa',    inicio: '01/07/2025', termino: '20/11/2025', avance: 0,  estado: 'Pendiente' },
  { id: 8, etapa: 'Marketing Digital',      responsable: 'Antonia Torres',   inicio: '01/04/2025', termino: '30/11/2025', avance: 8,  estado: 'En curso' },
  { id: 9, etapa: 'Contenidos',             responsable: 'Daniel López',     inicio: '01/05/2025', termino: '25/11/2025', avance: 0,  estado: 'Pendiente' },
  { id: 10, etapa: 'Cierre y Evaluación',   responsable: 'Ivonne Zuñiga',    inicio: '25/11/2025', termino: '15/12/2025', avance: 0,  estado: 'Pendiente' },
];

const DEFAULT_PROVEEDORES = [
  { id: 1, proveedor: 'TGA Producciones',      servicio: 'Producción General',  monto: 12000000, estado: 'Parcial',   cuotas: '2/3' },
  { id: 2, proveedor: 'Parque Bicentenario',   servicio: 'Venue',               monto: 8500000,  estado: 'Pendiente', cuotas: '0/2' },
  { id: 3, proveedor: 'Sonido y Luz Pro',      servicio: 'Equipamiento AV',     monto: 4200000,  estado: 'Pagado',    cuotas: '3/3' },
  { id: 4, proveedor: 'Catering Eventos',      servicio: 'Alimentación',        monto: 3800000,  estado: 'Pendiente', cuotas: '0/2' },
  { id: 5, proveedor: 'Impresos y Señalética', servicio: 'Material gráfico',    monto: 1200000,  estado: 'Pagado',    cuotas: '1/1' },
  { id: 6, proveedor: 'Seguridad Privada',     servicio: 'Guardias',            monto: 2500000,  estado: 'Pendiente', cuotas: '0/2' },
  { id: 7, proveedor: 'Transporte y Logística',servicio: 'Traslados',           monto: 1800000,  estado: 'Pendiente', cuotas: '0/1' },
  { id: 8, proveedor: 'Fotografía y Video',    servicio: 'Registro',            monto: 3500000,  estado: 'Pendiente', cuotas: '0/2' },
];

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
  document.getElementById('kpi-monto-total').textContent = formatCLP(montoTotal);
  document.getElementById('kpi-pagos-completados').textContent = pagados;
  document.getElementById('kpi-pagos-pendientes').textContent = pendientes;
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
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fa-solid fa-store-slash"></i><p>Sin proveedores registrados</p></td></tr>';
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
  renderGantt(data);
  renderProveedores(LS.get('proveedores', DEFAULT_PROVEEDORES));
}

function deleteGanttRow(id) {
  confirmAction('¿Eliminar esta etapa del Gantt?', () => {
    const data = LS.remove('gantt', id);
    renderGantt(LS.get('gantt', DEFAULT_GANTT));
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
  const proveedores = LS.get('proveedores', DEFAULT_PROVEEDORES);
  renderProveedores(proveedores);
  renderKPIs(proveedores);
}

function deleteProveedor(id) {
  confirmAction('¿Eliminar este proveedor?', () => {
    LS.remove('proveedores', id);
    const proveedores = LS.get('proveedores', DEFAULT_PROVEEDORES);
    renderProveedores(proveedores);
    renderKPIs(proveedores);
    showToast('Proveedor eliminado', 'info');
  });
}

// ── Escape HTML ────────────────────────────────────────────
function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('produccion');
  renderHeader('Producción — EtMday 2025', 'Planificación y proveedores del evento');

  // Load data (fallback to defaults on first visit)
  if (!localStorage.getItem('etm_gantt')) LS.set('gantt', DEFAULT_GANTT);
  if (!localStorage.getItem('etm_proveedores')) LS.set('proveedores', DEFAULT_PROVEEDORES);

  const ganttData = LS.get('gantt', DEFAULT_GANTT);
  const provData = LS.get('proveedores', DEFAULT_PROVEEDORES);

  renderKPIs(provData);
  renderGantt(ganttData);
  renderProveedores(provData);
});
