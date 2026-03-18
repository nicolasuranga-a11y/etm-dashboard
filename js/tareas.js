/* ============================================================
   ETM Dashboard — tareas.js
   Proyectos + Tareas con notificaciones de email via EmailJS
   ============================================================ */

// ── Equipo ─────────────────────────────────────────────────
const TEAM_MEMBERS = [
  'Nicolás Uranga','María Ignacia','Juan Pablo Lobos','Ignacia Cisternas',
  'León Fernández de Castro','Pamela Abello','Catalina Pizarro',
  'Javiera López','Andrea Báez','Daniela Alegría','(Otro)',
];

const AREAS = ['Producción','Comercial','Marketing','Ecosistemas','Dirección','RRHH','Operaciones'];

// ── Proyectos data ─────────────────────────────────────────
const DEFAULT_PROYECTOS = [
  {
    id: 1,
    nombre: 'EtMtuesday 21 de abril',
    descripcion: 'Preparación y ejecución del evento EtMtuesday del 21 de abril 2025',
    fechaInicio: '01/04/2025',
    fechaFin: '21/04/2025',
    estado: 'En curso',
  },
  {
    id: 2,
    nombre: 'EtMworks',
    descripcion: 'Gestión y desarrollo del programa EtMworks 2025 — conexión entre emprendedores y expertos',
    fechaInicio: '01/03/2025',
    fechaFin: '31/05/2025',
    estado: 'En curso',
  },
];

// ── Tareas data ────────────────────────────────────────────
const DEFAULT_TAREAS = [
  // EtMtuesday 21 de abril
  { id: 1,  tarea: 'Confirmar ponente / invitado especial',     proyecto: 'EtMtuesday 21 de abril', plazo: '01/04/2025', responsable: 'Javiera López',   area: 'Marketing',   estado: 'Pendiente' },
  { id: 2,  tarea: 'Diseñar artes para RRSS del evento',        proyecto: 'EtMtuesday 21 de abril', plazo: '07/04/2025', responsable: 'Daniela Alegría', area: 'Marketing',   estado: 'Pendiente' },
  { id: 3,  tarea: 'Publicar convocatoria en Instagram y LinkedIn', proyecto: 'EtMtuesday 21 de abril', plazo: '10/04/2025', responsable: 'Andrea Báez', area: 'Marketing',   estado: 'Pendiente' },
  { id: 4,  tarea: 'Confirmar y reservar venue / sala',          proyecto: 'EtMtuesday 21 de abril', plazo: '05/04/2025', responsable: 'Pamela Abello',  area: 'Producción',  estado: 'Pendiente' },
  { id: 5,  tarea: 'Gestionar inscripciones de asistentes',      proyecto: 'EtMtuesday 21 de abril', plazo: '14/04/2025', responsable: 'Catalina Pizarro', area: 'Comercial', estado: 'Pendiente' },
  { id: 6,  tarea: 'Enviar invitación a red de ecosistema',      proyecto: 'EtMtuesday 21 de abril', plazo: '10/04/2025', responsable: 'María Ignacia',  area: 'Ecosistemas', estado: 'Pendiente' },
  { id: 7,  tarea: 'Newsletter de convocatoria EtMtuesday',      proyecto: 'EtMtuesday 21 de abril', plazo: '08/04/2025', responsable: 'Javiera López',  area: 'Marketing',   estado: 'Pendiente' },
  // EtMworks
  { id: 8,  tarea: 'Definir mecánica y estructura del programa', proyecto: 'EtMworks', plazo: '31/03/2025', responsable: 'Nicolás Uranga',   area: 'Dirección',   estado: 'En curso'  },
  { id: 9,  tarea: 'Levantar convocatoria a emprendedores',      proyecto: 'EtMworks', plazo: '15/04/2025', responsable: 'María Ignacia',    area: 'Ecosistemas', estado: 'Pendiente' },
  { id: 10, tarea: 'Diseñar materiales de difusión',             proyecto: 'EtMworks', plazo: '20/04/2025', responsable: 'Daniela Alegría',  area: 'Marketing',   estado: 'Pendiente' },
  { id: 11, tarea: 'Conseguir mentores y expertos participantes',proyecto: 'EtMworks', plazo: '30/04/2025', responsable: 'María Ignacia',    area: 'Ecosistemas', estado: 'Pendiente' },
  { id: 12, tarea: 'Gestionar sponsors del programa',            proyecto: 'EtMworks', plazo: '15/04/2025', responsable: 'Catalina Pizarro', area: 'Comercial',   estado: 'Pendiente' },
  { id: 13, tarea: 'Coordinar logística del espacio físico',     proyecto: 'EtMworks', plazo: '25/04/2025', responsable: 'Pamela Abello',    area: 'Producción',  estado: 'Pendiente' },
];

// ── Date helpers ───────────────────────────────────────────
function parseDateCLP(str) {
  if (!str || str === '—') return null;
  const p = String(str).split('/');
  if (p.length !== 3) return null;
  const d = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
  return isNaN(d) ? null : d;
}

function today0() {
  const d = new Date(); d.setHours(0,0,0,0); return d;
}

function isVencida(t) {
  if (t.estado === 'Completada') return false;
  const d = parseDateCLP(t.plazo);
  return d ? d < today0() : false;
}

function isProxima(t) {
  if (t.estado === 'Completada') return false;
  const d = parseDateCLP(t.plazo);
  if (!d) return false;
  const diff = (d - today0()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 3;
}

// ── Escape HTML ────────────────────────────────────────────
function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function estadoBadgeTareas(estado) {
  const map = { 'Pendiente':'badge-yellow','En curso':'badge-blue','Completada':'badge-green','Bloqueada':'badge-red' };
  return `<span class="badge ${map[estado]||'badge-gray'}">${estado}</span>`;
}

// ═══════════════════════════════════════════════════════════
//  KPIs
// ═══════════════════════════════════════════════════════════
function renderKPIsTareas(tareas) {
  const total      = tareas.length;
  const enCurso    = tareas.filter(t => t.estado === 'En curso').length;
  const completada = tareas.filter(t => t.estado === 'Completada').length;
  const vencidas   = tareas.filter(t => isVencida(t)).length;
  const proximas   = tareas.filter(t => isProxima(t)).length;

  document.getElementById('kpi-total-tareas').textContent = total;
  document.getElementById('kpi-en-curso').textContent = enCurso;
  document.getElementById('kpi-completadas').textContent = completada;
  document.getElementById('kpi-vencidas').textContent = vencidas;

  const proxEl = document.getElementById('kpi-proximas');
  if (proxEl) proxEl.textContent = proximas;
}

// ═══════════════════════════════════════════════════════════
//  TABS: Proyectos / Tareas
// ═══════════════════════════════════════════════════════════
let activeTab = 'proyectos';

function switchTab(tab) {
  activeTab = tab;
  ['proyectos','tareas'].forEach(t => {
    const btn = document.getElementById('tab-btn-' + t);
    const panel = document.getElementById('tab-panel-' + t);
    if (btn) btn.classList.toggle('tab-active', t === tab);
    if (panel) panel.style.display = t === tab ? '' : 'none';
  });
  if (tab === 'proyectos') renderProyectos();
  if (tab === 'tareas') renderTareas();
}

// ═══════════════════════════════════════════════════════════
//  PROYECTOS
// ═══════════════════════════════════════════════════════════
function renderProyectos() {
  const proyectos = LS.get('proyectos', DEFAULT_PROYECTOS);
  const tareas    = LS.get('tareas', DEFAULT_TAREAS);
  const container = document.getElementById('proyectos-grid');
  if (!container) return;

  if (!proyectos.length) {
    container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-diagram-project"></i><p>Sin proyectos registrados</p></div>';
    return;
  }

  container.innerHTML = proyectos.map(p => {
    const pTareas    = tareas.filter(t => t.proyecto === p.nombre);
    const completadas = pTareas.filter(t => t.estado === 'Completada').length;
    const vencidas   = pTareas.filter(t => isVencida(t)).length;
    const proximas   = pTareas.filter(t => isProxima(t)).length;
    const pct        = pTareas.length ? Math.round((completadas / pTareas.length) * 100) : 0;
    const areas      = [...new Set(pTareas.map(t => t.area))];
    const responsables = [...new Set(pTareas.map(t => t.responsable).filter(r => r && r !== '—'))];

    const estadoColor = { 'En curso':'kpi-icon-blue','Completado':'kpi-icon-green','Pausado':'kpi-icon-amber','Pendiente':'kpi-icon-purple' };

    return `
    <div class="proyecto-card">
      <div class="proyecto-card-header">
        <div>
          <div class="proyecto-nombre">${escapeHtml(p.nombre)}</div>
          <div class="proyecto-desc">${escapeHtml(p.descripcion)}</div>
        </div>
        <span class="badge ${p.estado==='Completado'?'badge-green':p.estado==='En curso'?'badge-blue':'badge-yellow'}">${p.estado}</span>
      </div>

      <div class="proyecto-meta">
        <span><i class="fa-regular fa-calendar"></i> ${p.fechaInicio} → ${p.fechaFin}</span>
        <span><i class="fa-solid fa-list-check"></i> ${pTareas.length} tareas</span>
        ${vencidas ? `<span style="color:#EF4444"><i class="fa-solid fa-triangle-exclamation"></i> ${vencidas} vencida${vencidas>1?'s':''}</span>` : ''}
        ${proximas ? `<span style="color:#F59E0B"><i class="fa-solid fa-bell"></i> ${proximas} próxima${proximas>1?'s':''}</span>` : ''}
      </div>

      <div style="margin:12px 0">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:#6B7280;margin-bottom:4px">
          <span>Avance</span><span>${pct}%</span>
        </div>
        <div style="background:#E5E7EB;border-radius:99px;height:8px;overflow:hidden">
          <div style="width:${pct}%;background:${pct===100?'#22C55E':'#7C3AED'};height:100%;border-radius:99px;transition:width 0.4s"></div>
        </div>
      </div>

      ${areas.length ? `
      <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">
        ${areas.map(a => `<span class="badge badge-purple" style="font-size:10px">${a}</span>`).join('')}
      </div>` : ''}

      ${responsables.length ? `
      <div style="font-size:11px;color:#9CA3AF;margin-bottom:12px">
        <i class="fa-solid fa-users" style="margin-right:4px"></i>${responsables.join(' · ')}
      </div>` : ''}

      <!-- Mini task list -->
      <div class="proyecto-tasks-wrap" id="tasks-wrap-${p.id}" style="display:none">
        <div style="border-top:1px solid #E5E7EB;padding-top:10px;margin-top:4px">
          ${pTareas.length ? pTareas.map(t => `
            <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #F9FAFB">
              <span style="flex:1;font-size:12px;font-weight:500;color:${isVencida(t)?'#EF4444':'#374151'}">${escapeHtml(t.tarea)}</span>
              <span style="font-size:10px;color:#9CA3AF;white-space:nowrap">${t.plazo}</span>
              ${estadoBadgeTareas(t.estado)}
            </div>`).join('') : '<p style="text-align:center;color:#9CA3AF;font-size:12px;padding:10px">Sin tareas asignadas</p>'}
        </div>
      </div>

      <div class="proyecto-card-footer">
        <button class="btn btn-ghost btn-sm" onclick="toggleTasks(${p.id})" id="toggle-btn-${p.id}">
          <i class="fa-solid fa-chevron-down"></i> Ver tareas
        </button>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="switchTab('tareas');setFilterProyecto('${escapeHtml(p.nombre)}')">
            <i class="fa-solid fa-table-list"></i> Ir a Tareas
          </button>
          <button class="btn btn-ghost btn-sm btn-icon" title="Editar" onclick="openEditProyecto(${p.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" title="Eliminar" onclick="deleteProyecto(${p.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleTasks(id) {
  const wrap = document.getElementById('tasks-wrap-' + id);
  const btn  = document.getElementById('toggle-btn-' + id);
  if (!wrap) return;
  const open = wrap.style.display !== 'none';
  wrap.style.display = open ? 'none' : '';
  if (btn) btn.innerHTML = open
    ? '<i class="fa-solid fa-chevron-down"></i> Ver tareas'
    : '<i class="fa-solid fa-chevron-up"></i> Ocultar tareas';
}

// ── CRUD Proyectos ─────────────────────────────────────────
function openAddProyecto() {
  document.getElementById('proyecto-modal-title').textContent = 'Nuevo Proyecto';
  document.getElementById('proyecto-form').reset();
  document.getElementById('proyecto-edit-id').value = '';
  openModal('proyecto-modal');
}

function openEditProyecto(id) {
  const data = LS.get('proyectos', DEFAULT_PROYECTOS);
  const row  = data.find(r => String(r.id) === String(id));
  if (!row) return;
  document.getElementById('proyecto-modal-title').textContent = 'Editar Proyecto';
  document.getElementById('proyecto-edit-id').value = row.id;
  document.getElementById('proyecto-nombre').value = row.nombre;
  document.getElementById('proyecto-desc').value = row.descripcion;
  document.getElementById('proyecto-inicio').value = row.fechaInicio;
  document.getElementById('proyecto-fin').value = row.fechaFin;
  document.getElementById('proyecto-estado').value = row.estado;
  openModal('proyecto-modal');
}

function saveProyecto() {
  const id = document.getElementById('proyecto-edit-id').value;
  const item = {
    nombre:      document.getElementById('proyecto-nombre').value.trim(),
    descripcion: document.getElementById('proyecto-desc').value.trim(),
    fechaInicio: document.getElementById('proyecto-inicio').value.trim(),
    fechaFin:    document.getElementById('proyecto-fin').value.trim(),
    estado:      document.getElementById('proyecto-estado').value,
  };
  if (!item.nombre) { showToast('Ingresa el nombre del proyecto', 'error'); return; }
  let data = LS.get('proyectos', DEFAULT_PROYECTOS);
  if (id) {
    data = data.map(r => String(r.id) === String(id) ? { ...r, ...item } : r);
    LS.set('proyectos', data);
    showToast('Proyecto actualizado');
  } else {
    item.id = genId();
    data.push(item);
    LS.set('proyectos', data);
    showToast('Proyecto creado');
  }
  closeModal('proyecto-modal');
  renderProyectos();
}

function deleteProyecto(id) {
  confirmAction('¿Eliminar este proyecto? Las tareas asociadas no se eliminarán.', () => {
    LS.remove('proyectos', id);
    renderProyectos();
    showToast('Proyecto eliminado', 'info');
  });
}

// ═══════════════════════════════════════════════════════════
//  TAREAS TABLE
// ═══════════════════════════════════════════════════════════
let currentFilters = { area:'', responsable:'', estado:'', proyecto:'', search:'' };

function setFilterProyecto(nombre) {
  currentFilters.proyecto = nombre;
  const sel = document.getElementById('filter-proyecto');
  if (sel) sel.value = nombre;
  renderTareas();
}

function applyFilters(tareas) {
  return tareas.filter(t => {
    const { area, responsable, estado, proyecto, search } = currentFilters;
    if (area && t.area !== area) return false;
    if (responsable && t.responsable !== responsable) return false;
    if (estado && t.estado !== estado) return false;
    if (proyecto && t.proyecto !== proyecto) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!t.tarea.toLowerCase().includes(q) && !t.proyecto.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function updateProyectoFilter() {
  const sel = document.getElementById('filter-proyecto');
  if (!sel) return;
  const proyectos = LS.get('proyectos', DEFAULT_PROYECTOS);
  const current = sel.value;
  sel.innerHTML = '<option value="">Todos los proyectos</option>' +
    proyectos.map(p => `<option value="${escapeHtml(p.nombre)}" ${current===p.nombre?'selected':''}>${escapeHtml(p.nombre)}</option>`).join('');
}

function renderTareas() {
  const tareas = LS.get('tareas', DEFAULT_TAREAS);
  renderKPIsTareas(tareas);
  updateProyectoFilter();

  const filtered = applyFilters(tareas);
  const tbody = document.querySelector('#tareas-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><i class="fa-solid fa-clipboard-list"></i><p>Sin tareas para mostrar</p></td></tr>';
    return;
  }

  filtered.forEach((t, idx) => {
    const venc  = isVencida(t);
    const prox  = isProxima(t);
    const email = TEAM_EMAILS[t.responsable];
    const tr = document.createElement('tr');
    if (venc) tr.classList.add('vencido-row');
    tr.innerHTML = `
      <td style="color:#9CA3AF;font-size:12px">${idx + 1}</td>
      <td style="font-weight:600;max-width:200px">
        ${escapeHtml(t.tarea)}
        ${venc ? '<span class="badge badge-red" style="font-size:10px;display:block;margin-top:3px">Vencida</span>' : ''}
        ${prox && !venc ? '<span class="badge badge-yellow" style="font-size:10px;display:block;margin-top:3px">⚠ Próxima</span>' : ''}
      </td>
      <td><span class="badge badge-purple" style="font-size:11px">${escapeHtml(t.proyecto)}</span></td>
      <td style="white-space:nowrap">${escapeHtml(t.plazo)}</td>
      <td style="font-size:12px;font-weight:600">${escapeHtml(t.responsable)}</td>
      <td><span class="badge badge-gray" style="font-size:11px">${escapeHtml(t.area)}</span></td>
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

// ── CRUD Tareas ────────────────────────────────────────────
function openAddTarea() {
  document.getElementById('tarea-modal-title').textContent = 'Agregar Tarea';
  document.getElementById('tarea-form').reset();
  document.getElementById('tarea-edit-id').value = '';
  updateProyectoSelect();
  openModal('tarea-modal');
}

function openEditTarea(id) {
  const data = LS.get('tareas', DEFAULT_TAREAS);
  const row  = data.find(r => String(r.id) === String(id));
  if (!row) return;
  updateProyectoSelect();
  document.getElementById('tarea-modal-title').textContent = 'Editar Tarea';
  document.getElementById('tarea-edit-id').value   = row.id;
  document.getElementById('tarea-desc').value       = row.tarea;
  document.getElementById('tarea-proyecto').value   = row.proyecto;
  document.getElementById('tarea-plazo').value      = row.plazo;
  document.getElementById('tarea-responsable').value = row.responsable;
  document.getElementById('tarea-area').value       = row.area;
  document.getElementById('tarea-estado').value     = row.estado;
  openModal('tarea-modal');
}

function updateProyectoSelect() {
  const sel = document.getElementById('tarea-proyecto');
  if (!sel) return;
  const proyectos = LS.get('proyectos', DEFAULT_PROYECTOS);
  const current = sel.value;
  sel.innerHTML = '<option value="">Sin proyecto</option>' +
    proyectos.map(p => `<option value="${escapeHtml(p.nombre)}" ${current===p.nombre?'selected':''}>${escapeHtml(p.nombre)}</option>`).join('') +
    '<option value="__nuevo__">+ Nuevo proyecto...</option>';
}

function saveTarea() {
  const id = document.getElementById('tarea-edit-id').value;
  let proyecto = document.getElementById('tarea-proyecto').value;
  if (proyecto === '__nuevo__') {
    proyecto = prompt('Nombre del nuevo proyecto:')?.trim() || '';
  }
  const item = {
    tarea:       document.getElementById('tarea-desc').value.trim(),
    proyecto,
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
  if (activeTab === 'proyectos') renderProyectos();
}

function deleteTarea(id) {
  confirmAction('¿Eliminar esta tarea?', () => {
    LS.remove('tareas', id);
    renderTareas();
    if (activeTab === 'proyectos') renderProyectos();
    showToast('Tarea eliminada', 'info');
  });
}

// ── Filter Listeners ───────────────────────────────────────
function bindFilters() {
  ['filter-area','filter-responsable','filter-estado','filter-proyecto'].forEach(fid => {
    const el = document.getElementById(fid);
    if (el) el.addEventListener('change', e => {
      const key = fid.replace('filter-','');
      currentFilters[key] = e.target.value;
      renderTareas();
    });
  });
  const search = document.getElementById('filter-search');
  if (search) search.addEventListener('input', e => {
    currentFilters.search = e.target.value.trim();
    renderTareas();
  });
  const clear = document.getElementById('filter-clear');
  if (clear) clear.addEventListener('click', () => {
    currentFilters = { area:'', responsable:'', estado:'', proyecto:'', search:'' };
    ['filter-area','filter-responsable','filter-estado','filter-proyecto'].forEach(fid => {
      const el = document.getElementById(fid);
      if (el) el.value = '';
    });
    const s = document.getElementById('filter-search');
    if (s) s.value = '';
    renderTareas();
  });
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('tareas');
  renderHeader('Proyectos & Tareas', 'Seguimiento de proyectos y tareas por área · ETM 2025');

  if (!localStorage.getItem('etm_proyectos')) LS.set('proyectos', DEFAULT_PROYECTOS);
  if (!localStorage.getItem('etm_tareas'))    LS.set('tareas', DEFAULT_TAREAS);

  switchTab('proyectos');
  bindFilters();
});
