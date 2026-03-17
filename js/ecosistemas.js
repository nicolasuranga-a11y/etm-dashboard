/* ============================================================
   ETM Dashboard — ecosistemas.js
   Alianzas, Proyectos, KPIs por Integrante
   ============================================================ */

const DEFAULT_PARTNERS = [
  { id: 1, org: 'Partner ejemplo 1', tipo: 'Tipo por definir', estado: 'Activo',    resp: 'María Ignacia',         desde: '-', contacto: '-', notas: 'Notas por completar' },
  { id: 2, org: 'Partner ejemplo 2', tipo: 'Tipo por definir', estado: 'Pendiente', resp: 'Juan Pablo Lobos',      desde: '-', contacto: '-', notas: 'Notas por completar' },
];

const DEFAULT_PUBLICAS = [
  { id: 1, org: 'Entidad pública ejemplo 1', area: 'Área por definir', estado: 'Pendiente', resp: 'María Ignacia',    programa: 'Programa por definir', monto: null, postulacion: 'Pendiente' },
  { id: 2, org: 'Entidad pública ejemplo 2', area: 'Área por definir', estado: 'Pendiente', resp: 'Ignacio Cisternas', programa: 'Programa por definir', monto: null, postulacion: 'Pendiente' },
];

const DEFAULT_PROYECTOS = [
  { id: 1, proyecto: 'Proyecto ejemplo 1', resp: 'María Ignacia',              estado: 'Pendiente', avance: 0, termino: 'TBD', desc: 'Descripción por completar' },
  { id: 2, proyecto: 'Proyecto ejemplo 2', resp: 'Juan Pablo Lobos',           estado: 'Pendiente', avance: 0, termino: 'TBD', desc: 'Descripción por completar' },
  { id: 3, proyecto: 'Proyecto ejemplo 3', resp: 'León Fernández de Castro',   estado: 'Pendiente', avance: 0, termino: 'TBD', desc: 'Descripción por completar' },
];

const TEAM_KPIS = [
  {
    nombre: 'María Ignacia',
    rol: 'Jefa Contenidos y Ecosistemas',
    avatar: 'MI',
    color: '#16A34A',
    kpis: [
      { label: 'KPI 1', actual: 0, meta: 1, unit: '' },
      { label: 'KPI 2', actual: 0, meta: 1, unit: '' },
      { label: 'KPI 3', actual: 0, meta: 1, unit: '' },
    ]
  },
  {
    nombre: 'Juan Pablo Lobos',
    rol: 'Contenidos y Ecosistemas',
    avatar: 'JP',
    color: '#7C3AED',
    kpis: [
      { label: 'KPI 1', actual: 0, meta: 1, unit: '' },
      { label: 'KPI 2', actual: 0, meta: 1, unit: '' },
      { label: 'KPI 3', actual: 0, meta: 1, unit: '' },
    ]
  },
  {
    nombre: 'Ignacio Cisternas',
    rol: 'Contenidos y Ecosistemas',
    avatar: 'IC',
    color: '#2563EB',
    kpis: [
      { label: 'KPI 1', actual: 0, meta: 1, unit: '' },
      { label: 'KPI 2', actual: 0, meta: 1, unit: '' },
      { label: 'KPI 3', actual: 0, meta: 1, unit: '' },
    ]
  },
  {
    nombre: 'León Fernández de Castro',
    rol: 'Contenidos y Ecosistemas',
    avatar: 'LF',
    color: '#059669',
    kpis: [
      { label: 'KPI 1', actual: 0, meta: 1, unit: '' },
      { label: 'KPI 2', actual: 0, meta: 1, unit: '' },
      { label: 'KPI 3', actual: 0, meta: 1, unit: '' },
    ]
  }
];

// ── KPIs ───────────────────────────────────────────────────
function renderKPIsEco() {
  const partners = LS.get('partners', DEFAULT_PARTNERS);
  const publicas = LS.get('publicas', DEFAULT_PUBLICAS);
  const proyectos = LS.get('proyectos', DEFAULT_PROYECTOS);

  const alianzasActivas = partners.filter(p => p.estado === 'Activo').length + publicas.filter(p => p.estado === 'Activo').length;
  const proyEnCurso = proyectos.filter(p => p.estado === 'En curso').length;
  const partnersEst = partners.filter(p => p.estado === 'Activo').length;
  const entPublicas = publicas.length;

  document.getElementById('kpi-alianzas').textContent = alianzasActivas;
  document.getElementById('kpi-proyectos').textContent = proyEnCurso;
  document.getElementById('kpi-partners').textContent = partnersEst;
  document.getElementById('kpi-entidades').textContent = entPublicas;
}

// ── Partners Table ─────────────────────────────────────────
function renderPartners(data) {
  const tbody = document.querySelector('#partners-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600">${escapeHtml(row.org)}</td>
      <td><span class="badge badge-purple">${escapeHtml(row.tipo)}</span></td>
      <td>${statusBadge(row.estado)}</td>
      <td>${escapeHtml(row.resp)}</td>
      <td>${escapeHtml(row.desde)}</td>
      <td style="white-space:nowrap">${escapeHtml(row.contacto)}</td>
      <td style="max-width:180px;font-size:12px;color:#6B7280">${escapeHtml(row.notas)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-sm btn-icon" title="Editar" onclick="openEditPartner(${row.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" title="Eliminar" onclick="deletePartner(${row.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  makeSortable('partners-table');
}

// ── Entidades Públicas Table ───────────────────────────────
function renderPublicas(data) {
  const tbody = document.querySelector('#publicas-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600">${escapeHtml(row.org)}</td>
      <td>${escapeHtml(row.area)}</td>
      <td>${statusBadge(row.estado)}</td>
      <td>${escapeHtml(row.resp)}</td>
      <td>${escapeHtml(row.programa)}</td>
      <td style="font-weight:700;color:var(--etm-primary)">${row.monto ? formatCLP(row.monto) : '-'}</td>
      <td>${statusBadge(row.postulacion)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-sm btn-icon" title="Editar" onclick="openEditPublica(${row.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" title="Eliminar" onclick="deletePublica(${row.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  makeSortable('publicas-table');
}

// ── Proyectos Table ────────────────────────────────────────
function renderProyectos(data) {
  const tbody = document.querySelector('#proyectos-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  data.forEach(row => {
    const pct = parseInt(row.avance) || 0;
    let barColor = 'purple';
    if (pct === 100) barColor = 'green';
    else if (pct >= 60) barColor = 'blue';
    else if (row.estado === 'Pausado') barColor = 'amber';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:600">${escapeHtml(row.proyecto)}</td>
      <td>${escapeHtml(row.resp)}</td>
      <td>${statusBadge(row.estado)}</td>
      <td style="min-width:140px">${progressBar(pct, barColor)}</td>
      <td style="white-space:nowrap">${escapeHtml(row.termino)}</td>
      <td style="max-width:200px;font-size:12.5px;color:#6B7280">${escapeHtml(row.desc)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-sm btn-icon" title="Editar" onclick="openEditProyecto(${row.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" title="Eliminar" onclick="deleteProyecto(${row.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  makeSortable('proyectos-table');
}

// ── Team KPIs ──────────────────────────────────────────────
function renderTeamKPIs() {
  const container = document.getElementById('team-kpis');
  if (!container) return;
  container.innerHTML = '';
  container.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:20px';

  TEAM_KPIS.forEach(member => {
    const card = document.createElement('div');
    card.className = 'panel';
    card.style.marginBottom = '0';
    card.innerHTML = `
      <div class="panel-header">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:44px;height:44px;border-radius:12px;background:${member.color};color:white;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;flex-shrink:0">${member.avatar}</div>
          <div>
            <div style="font-size:15px;font-weight:700;color:#111827">${escapeHtml(member.nombre)}</div>
            <div style="font-size:12px;color:#9CA3AF">${escapeHtml(member.rol)}</div>
          </div>
        </div>
      </div>
      <div class="panel-body">
        ${member.kpis.map(k => {
          const pct = Math.min(100, Math.round((k.actual / k.meta) * 100));
          let barColor = pct >= 80 ? 'green' : pct >= 50 ? 'purple' : 'amber';
          const actual = k.isCLP ? formatCLP(k.actual) : k.actual;
          const meta = k.isCLP ? formatCLP(k.meta) : k.meta;
          return `
            <div style="margin-bottom:14px">
              <div style="display:flex;justify-content:space-between;font-size:12.5px;color:#6B7280;margin-bottom:5px;font-weight:500">
                <span>${escapeHtml(k.label)}</span>
                <span style="font-weight:700;color:#111827">${actual} / ${meta}</span>
              </div>
              ${progressBar(pct, barColor)}
            </div>
          `;
        }).join('')}
      </div>
    `;
    container.appendChild(card);
  });
}

// ── Tabs ───────────────────────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

// ── CRUD Partners ──────────────────────────────────────────
function openAddPartner() {
  document.getElementById('partner-modal-title').textContent = 'Agregar Partner Privado';
  document.getElementById('partner-form').reset();
  document.getElementById('partner-edit-id').value = '';
  openModal('partner-modal');
}

function openEditPartner(id) {
  const data = LS.get('partners', DEFAULT_PARTNERS);
  const row = data.find(r => String(r.id) === String(id));
  if (!row) return;
  document.getElementById('partner-modal-title').textContent = 'Editar Partner';
  document.getElementById('partner-edit-id').value = row.id;
  document.getElementById('partner-org').value = row.org;
  document.getElementById('partner-tipo').value = row.tipo;
  document.getElementById('partner-estado').value = row.estado;
  document.getElementById('partner-resp').value = row.resp;
  document.getElementById('partner-desde').value = row.desde;
  document.getElementById('partner-contacto').value = row.contacto;
  document.getElementById('partner-notas').value = row.notas;
  openModal('partner-modal');
}

function savePartner() {
  const id = document.getElementById('partner-edit-id').value;
  const item = {
    org: document.getElementById('partner-org').value.trim(),
    tipo: document.getElementById('partner-tipo').value.trim(),
    estado: document.getElementById('partner-estado').value,
    resp: document.getElementById('partner-resp').value.trim(),
    desde: document.getElementById('partner-desde').value.trim() || '-',
    contacto: document.getElementById('partner-contacto').value.trim(),
    notas: document.getElementById('partner-notas').value.trim(),
  };
  if (!item.org) { showToast('Completa los campos requeridos', 'error'); return; }
  let data = LS.get('partners', DEFAULT_PARTNERS);
  if (id) {
    data = data.map(r => String(r.id) === String(id) ? { ...r, ...item } : r);
    LS.set('partners', data);
    showToast('Partner actualizado');
  } else {
    item.id = genId();
    data.push(item);
    LS.set('partners', data);
    showToast('Partner agregado');
  }
  closeModal('partner-modal');
  renderPartners(LS.get('partners', DEFAULT_PARTNERS));
  renderKPIsEco();
}

function deletePartner(id) {
  confirmAction('¿Eliminar este partner?', () => {
    LS.remove('partners', id);
    renderPartners(LS.get('partners', DEFAULT_PARTNERS));
    renderKPIsEco();
    showToast('Partner eliminado', 'info');
  });
}

// ── CRUD Públicas ──────────────────────────────────────────
function openAddPublica() {
  document.getElementById('publica-modal-title').textContent = 'Agregar Entidad Pública';
  document.getElementById('publica-form').reset();
  document.getElementById('publica-edit-id').value = '';
  openModal('publica-modal');
}

function openEditPublica(id) {
  const data = LS.get('publicas', DEFAULT_PUBLICAS);
  const row = data.find(r => String(r.id) === String(id));
  if (!row) return;
  document.getElementById('publica-modal-title').textContent = 'Editar Entidad Pública';
  document.getElementById('publica-edit-id').value = row.id;
  document.getElementById('publica-org').value = row.org;
  document.getElementById('publica-area').value = row.area;
  document.getElementById('publica-estado').value = row.estado;
  document.getElementById('publica-resp').value = row.resp;
  document.getElementById('publica-programa').value = row.programa;
  document.getElementById('publica-monto').value = row.monto || '';
  document.getElementById('publica-postulacion').value = row.postulacion;
  openModal('publica-modal');
}

function savePublica() {
  const id = document.getElementById('publica-edit-id').value;
  const item = {
    org: document.getElementById('publica-org').value.trim(),
    area: document.getElementById('publica-area').value.trim(),
    estado: document.getElementById('publica-estado').value,
    resp: document.getElementById('publica-resp').value.trim(),
    programa: document.getElementById('publica-programa').value.trim(),
    monto: parseCLP(document.getElementById('publica-monto').value) || null,
    postulacion: document.getElementById('publica-postulacion').value,
  };
  if (!item.org) { showToast('Completa los campos requeridos', 'error'); return; }
  let data = LS.get('publicas', DEFAULT_PUBLICAS);
  if (id) {
    data = data.map(r => String(r.id) === String(id) ? { ...r, ...item } : r);
    LS.set('publicas', data);
    showToast('Entidad actualizada');
  } else {
    item.id = genId();
    data.push(item);
    LS.set('publicas', data);
    showToast('Entidad agregada');
  }
  closeModal('publica-modal');
  renderPublicas(LS.get('publicas', DEFAULT_PUBLICAS));
  renderKPIsEco();
}

function deletePublica(id) {
  confirmAction('¿Eliminar esta entidad?', () => {
    LS.remove('publicas', id);
    renderPublicas(LS.get('publicas', DEFAULT_PUBLICAS));
    renderKPIsEco();
    showToast('Entidad eliminada', 'info');
  });
}

// ── CRUD Proyectos ─────────────────────────────────────────
function openAddProyecto() {
  document.getElementById('proyecto-modal-title').textContent = 'Agregar Proyecto';
  document.getElementById('proyecto-form').reset();
  document.getElementById('proyecto-edit-id').value = '';
  openModal('proyecto-modal');
}

function openEditProyecto(id) {
  const data = LS.get('proyectos', DEFAULT_PROYECTOS);
  const row = data.find(r => String(r.id) === String(id));
  if (!row) return;
  document.getElementById('proyecto-modal-title').textContent = 'Editar Proyecto';
  document.getElementById('proyecto-edit-id').value = row.id;
  document.getElementById('proyecto-nombre').value = row.proyecto;
  document.getElementById('proyecto-resp').value = row.resp;
  document.getElementById('proyecto-estado').value = row.estado;
  document.getElementById('proyecto-avance').value = row.avance;
  document.getElementById('proyecto-termino').value = row.termino;
  document.getElementById('proyecto-desc').value = row.desc;
  openModal('proyecto-modal');
}

function saveProyecto() {
  const id = document.getElementById('proyecto-edit-id').value;
  const item = {
    proyecto: document.getElementById('proyecto-nombre').value.trim(),
    resp: document.getElementById('proyecto-resp').value.trim(),
    estado: document.getElementById('proyecto-estado').value,
    avance: parseInt(document.getElementById('proyecto-avance').value) || 0,
    termino: document.getElementById('proyecto-termino').value.trim() || 'TBD',
    desc: document.getElementById('proyecto-desc').value.trim(),
  };
  if (!item.proyecto) { showToast('Completa los campos requeridos', 'error'); return; }
  let data = LS.get('proyectos', DEFAULT_PROYECTOS);
  if (id) {
    data = data.map(r => String(r.id) === String(id) ? { ...r, ...item } : r);
    LS.set('proyectos', data);
    showToast('Proyecto actualizado');
  } else {
    item.id = genId();
    data.push(item);
    LS.set('proyectos', data);
    showToast('Proyecto agregado');
  }
  closeModal('proyecto-modal');
  renderProyectos(LS.get('proyectos', DEFAULT_PROYECTOS));
  renderKPIsEco();
}

function deleteProyecto(id) {
  confirmAction('¿Eliminar este proyecto?', () => {
    LS.remove('proyectos', id);
    renderProyectos(LS.get('proyectos', DEFAULT_PROYECTOS));
    renderKPIsEco();
    showToast('Proyecto eliminado', 'info');
  });
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('ecosistemas');
  renderHeader('Contenidos y Ecosistemas', 'Alianzas estratégicas, proyectos y KPIs del equipo');

  if (!localStorage.getItem('etm_partners')) LS.set('partners', DEFAULT_PARTNERS);
  if (!localStorage.getItem('etm_publicas')) LS.set('publicas', DEFAULT_PUBLICAS);
  if (!localStorage.getItem('etm_proyectos')) LS.set('proyectos', DEFAULT_PROYECTOS);

  renderKPIsEco();
  renderPartners(LS.get('partners', DEFAULT_PARTNERS));
  renderPublicas(LS.get('publicas', DEFAULT_PUBLICAS));
  renderProyectos(LS.get('proyectos', DEFAULT_PROYECTOS));
  renderTeamKPIs();
});
