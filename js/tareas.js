/* ============================================================
   ETM Dashboard — tareas.js
   Bucket list: Tareas & Proyectos con CRUD completo
   ============================================================ */

const TEAM_MEMBERS = [
  'Nicolás Uranga',
  'María Ignacia',
  'Juan Pablo Lobos',
  'Ignacio Cisternas',
  'León Fernández de Castro',
  'Pamela Abello',
  'Catalina Pizarro',
  'Javiera López',
  'Andrea Báez',
  'Daniela Alegría',
  '(Otro)',
];

const AREAS = [
  'Producción',
  'Comercial',
  'Marketing',
  'Ecosistemas',
  'Dirección',
  'RRHH',
  'Operaciones',
];

const ESTADOS = ['Pendiente', 'En curso', 'Completada', 'Bloqueada'];

// ── Sample data ────────────────────────────────────────────
const DEFAULT_TAREAS = [
  { id: 1, tarea: 'Tarea de ejemplo 1', proyecto: 'Proyecto A', plazo: '30/04/2025', responsable: '—', area: 'Producción',  estado: 'Pendiente'  },
  { id: 2, tarea: 'Tarea de ejemplo 2', proyecto: 'Proyecto B', plazo: '15/05/2025', responsable: '—', area: 'Comercial',   estado: 'En curso'   },
  { id: 3, tarea: 'Tarea de ejemplo 3', proyecto: 'Proyecto A', plazo: '01/06/2025', responsable: '—', area: 'Marketing',   estado: 'Pendiente'  },
  { id: 4, tarea: 'Tarea de ejemplo 4', proyecto: 'Proyecto C', plazo: '20/04/2025', responsable: '—', area: 'Ecosistemas', estado: 'Completada' },
  { id: 5, tarea: 'Tarea de ejemplo 5', proyecto: 'Proyecto B', plazo: '10/04/2025', responsable: '—', area: 'Dirección',   estado: 'Bloqueada'  },
];

// ── Parse DD/MM/YYYY to Date ───────────────────────────────
function parseDateCLP(str) {
  if (!str || str === '—') return null;
  const parts = String(str).split('/');
  if (parts.length !== 3) return null;
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
}

function isVencida(tarea) {
  if (tarea.estado === 'Completada') return false;
  const d = parseDateCLP(tarea.plazo);
  if (!d) return false;
  return d < new Date(new Date().setHours(0,0,0,0));
}

// ── Escape HTML ────────────────────────────────────────────
function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Estado badge map ───────────────────────────────────────
function estadoBadgeTareas(estado) {
  const map = {
    'Pendiente':  'badge-yellow',
    'En curso':   'badge-blue',
    'Completada': 'badge-green',
    'Bloqueada':  'badge-red',
  };
  return `<span class="badge ${map[estado] || 'badge-gray'}">${estado}</span>`;
}

// ── KPIs ───────────────────────────────────────────────────
function renderKPIsTareas(tareas) {
  const total      = tareas.length;
  const enCurso    = tareas.filter(t => t.estado === 'En curso').length;
  const completada = tareas.filter(t => t.estado === 'Completada').length;
  const vencidas   = tareas.filter(t => isVencida(t)).length;

  document.getElementById('kpi-total-tareas').textContent = total;
  document.getElementById('kpi-en-curso').textContent = enCurso;
  document.getElementById('kpi-completadas').textContent = completada;
  document.getElementById('kpi-vencidas').textContent = vencidas;
}

// ── Filters state ──────────────────────────────────────────
let currentFilters = { area: '', responsable: '', estado: '', search: '' };

function applyFilters(tareas) {
  return tareas.filter(t => {
    const { area, responsable, estado, search } = currentFilters;
    if (area && t.area !== area) return false;
    if (responsable && t.responsable !== responsable) return false;
    if (estado && t.estado !== estado) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!t.tarea.toLowerCase().includes(q) && !t.proyecto.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

// ── Render Table ───────────────────────────────────────────
function renderTareas() {
  const tareas = LS.get('tareas', DEFAULT_TAREAS);
  renderKPIsTareas(tareas);

  const filtered = applyFilters(tareas);
  const tbody = document.querySelector('#tareas-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><i class="fa-solid fa-clipboard-list"></i><p>Sin tareas para mostrar</p></td></tr>';
    return;
  }

  filtered.forEach((t, idx) => {
    const venc = isVencida(t);
    const tr = document.createElement('tr');
    if (venc) tr.classList.add('vencido-row');
    tr.innerHTML = `
      <td style="color:#9CA3AF;font-size:12px">${idx + 1}</td>
      <td style="font-weight:600;max-width:220px">${escapeHtml(t.tarea)}${venc ? ' <span class="badge badge-red" style="font-size:10px">Vencida</span>' : ''}</td>
      <td>${escapeHtml(t.proyecto)}</td>
      <td style="white-space:nowrap">${escapeHtml(t.plazo)}</td>
      <td>${escapeHtml(t.responsable)}</td>
      <td><span class="badge badge-purple" style="font-size:11px">${escapeHtml(t.area)}</span></td>
      <td>${estadoBadgeTareas(t.estado)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-sm btn-icon" title="Editar" onclick="openEditTarea(${t.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" title="Eliminar" onclick="deleteTarea(${t.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  makeSortable('tareas-table');
}

// ── CRUD ───────────────────────────────────────────────────
function openAddTarea() {
  document.getElementById('tarea-modal-title').textContent = 'Agregar Tarea';
  document.getElementById('tarea-form').reset();
  document.getElementById('tarea-edit-id').value = '';
  openModal('tarea-modal');
}

function openEditTarea(id) {
  const data = LS.get('tareas', DEFAULT_TAREAS);
  const row = data.find(r => String(r.id) === String(id));
  if (!row) return;
  document.getElementById('tarea-modal-title').textContent = 'Editar Tarea';
  document.getElementById('tarea-edit-id').value = row.id;
  document.getElementById('tarea-desc').value = row.tarea;
  document.getElementById('tarea-proyecto').value = row.proyecto;
  document.getElementById('tarea-plazo').value = row.plazo;
  document.getElementById('tarea-responsable').value = row.responsable;
  document.getElementById('tarea-area').value = row.area;
  document.getElementById('tarea-estado').value = row.estado;
  openModal('tarea-modal');
}

function saveTarea() {
  const id = document.getElementById('tarea-edit-id').value;
  const item = {
    tarea:       document.getElementById('tarea-desc').value.trim(),
    proyecto:    document.getElementById('tarea-proyecto').value.trim(),
    plazo:       document.getElementById('tarea-plazo').value.trim() || '—',
    responsable: document.getElementById('tarea-responsable').value,
    area:        document.getElementById('tarea-area').value,
    estado:      document.getElementById('tarea-estado').value,
  };
  if (!item.tarea) { showToast('Ingresa una descripción para la tarea', 'error'); return; }

  let data = LS.get('tareas', DEFAULT_TAREAS);
  if (id) {
    data = data.map(r => String(r.id) === String(id) ? { ...r, ...item } : r);
    LS.set('tareas', data);
    showToast('Tarea actualizada');
  } else {
    item.id = genId();
    data.push(item);
    LS.set('tareas', data);
    showToast('Tarea agregada');
  }
  closeModal('tarea-modal');
  renderTareas();
}

function deleteTarea(id) {
  confirmAction('¿Eliminar esta tarea?', () => {
    LS.remove('tareas', id);
    renderTareas();
    showToast('Tarea eliminada', 'info');
  });
}

// ── Filter Listeners ───────────────────────────────────────
function bindFilters() {
  document.getElementById('filter-area').addEventListener('change', e => {
    currentFilters.area = e.target.value;
    renderTareas();
  });
  document.getElementById('filter-responsable').addEventListener('change', e => {
    currentFilters.responsable = e.target.value;
    renderTareas();
  });
  document.getElementById('filter-estado').addEventListener('change', e => {
    currentFilters.estado = e.target.value;
    renderTareas();
  });
  document.getElementById('filter-search').addEventListener('input', e => {
    currentFilters.search = e.target.value.trim();
    renderTareas();
  });
  document.getElementById('filter-clear').addEventListener('click', () => {
    currentFilters = { area: '', responsable: '', estado: '', search: '' };
    document.getElementById('filter-area').value = '';
    document.getElementById('filter-responsable').value = '';
    document.getElementById('filter-estado').value = '';
    document.getElementById('filter-search').value = '';
    renderTareas();
  });
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('tareas');
  renderHeader('Tareas & Proyectos', 'Seguimiento de tareas por área y responsable · ETM 2025');

  if (!localStorage.getItem('etm_tareas')) LS.set('tareas', DEFAULT_TAREAS);

  renderTareas();
  bindFilters();
});
