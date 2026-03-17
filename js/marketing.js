/* ============================================================
   ETM Dashboard — marketing.js
   Sprints de Contenido, Newsletter, EtMtuesday
   ============================================================ */

const DEFAULT_SPRINTS = [
  {
    id: 1,
    nombre: 'Sprint 1 — Lanzamiento Marzo',
    inicio: '01/03/2025',
    fin: '15/03/2025',
    estado: 'Completado',
    tareas: [
      { plataforma: 'Instagram', cantidad: 3, descripcion: 'Posts anuncio EtMday, quote emprendimiento, reel motivacional' },
      { plataforma: 'LinkedIn',  cantidad: 2, descripcion: 'Artículo tendencias, publicación institucional' },
      { plataforma: 'TikTok',    cantidad: 1, descripcion: 'Video corto tips emprendimiento' },
    ]
  },
  {
    id: 2,
    nombre: 'Sprint 2 — EtMday 2025 Awareness',
    inicio: '16/03/2025',
    fin: '31/03/2025',
    estado: 'En curso',
    tareas: [
      { plataforma: 'Instagram', cantidad: 4, descripcion: 'Countdown EtMday, speakers reveal, behind-the-scenes, stories interactivas' },
      { plataforma: 'LinkedIn',  cantidad: 3, descripcion: 'Anuncio oficial, articulo impacto 2024, llamado a sponsors' },
      { plataforma: 'Twitter',   cantidad: 2, descripcion: 'Thread EtMday, encuesta emprendimiento' },
      { plataforma: 'TikTok',    cantidad: 1, descripcion: 'Preview evento' },
    ]
  },
  {
    id: 3,
    nombre: 'Sprint 3 — Abril Contenido',
    inicio: '01/04/2025',
    fin: '15/04/2025',
    estado: 'Planificado',
    tareas: [
      { plataforma: 'Instagram', cantidad: 4, descripcion: 'Por definir' },
      { plataforma: 'LinkedIn',  cantidad: 2, descripcion: 'Por definir' },
      { plataforma: 'TikTok',    cantidad: 2, descripcion: 'Por definir' },
    ]
  },
];

const DEFAULT_NEWSLETTER = [
  { id: 1, edicion: '#48', fecha: '28/02/2025', asunto: 'Emprende en Marzo',       suscriptores: 2340, apertura: '32%', estado: 'Enviado'     },
  { id: 2, edicion: '#49', fecha: '14/03/2025', asunto: 'EtMday 2025 se acerca',   suscriptores: 2340, apertura: '-',   estado: 'Programado'  },
  { id: 3, edicion: '#50', fecha: '28/03/2025', asunto: '(sin definir)',            suscriptores: null, apertura: '-',   estado: 'Borrador'    },
];

const DEFAULT_ETMTUESDAY = [
  { id: 1, fecha: '18/03/2025', tema: 'Financiamiento CORFO',           ponente: 'Rodrigo Vera', formato: 'Presencial', inscritos: 45, estado: 'Confirmado' },
  { id: 2, fecha: '25/03/2025', tema: 'Marketing Digital para Pymes',   ponente: 'Ana Gómez',    formato: 'Online',     inscritos: 67, estado: 'Confirmado' },
  { id: 3, fecha: '01/04/2025', tema: '(por definir)',                  ponente: '-',            formato: '-',          inscritos: 0,  estado: 'Planificando' },
];

const PLATFORM_ICONS = {
  'Instagram': { cls: 'platform-instagram', icon: 'fa-brands fa-instagram' },
  'LinkedIn':  { cls: 'platform-linkedin',  icon: 'fa-brands fa-linkedin-in' },
  'Twitter':   { cls: 'platform-twitter',   icon: 'fa-brands fa-x-twitter' },
  'TikTok':    { cls: 'platform-tiktok',    icon: 'fa-brands fa-tiktok' },
  'YouTube':   { cls: 'platform-youtube',   icon: 'fa-brands fa-youtube' },
  'Facebook':  { cls: 'platform-email',     icon: 'fa-brands fa-facebook-f' },
};

// ── KPIs ───────────────────────────────────────────────────
function renderKPIsMarketing() {
  const sprints = LS.get('sprints', DEFAULT_SPRINTS);
  const nl = LS.get('newsletter', DEFAULT_NEWSLETTER);
  const etmt = LS.get('etmtuesday', DEFAULT_ETMTUESDAY);

  const activos = sprints.filter(s => s.estado === 'En curso').length;
  const pubMes = sprints.filter(s => s.estado !== 'Planificado')
    .reduce((a, s) => a + (s.tareas || []).reduce((b, t) => b + (parseInt(t.cantidad) || 0), 0), 0);
  const suscrip = nl.length ? nl[nl.length - 1].suscriptores || 2340 : 2340;
  const proximo = etmt.filter(e => e.estado !== 'Completado')[0];

  document.getElementById('kpi-sprints').textContent = activos;
  document.getElementById('kpi-publicaciones').textContent = pubMes;
  document.getElementById('kpi-suscriptores').textContent = (suscrip || 0).toLocaleString('es-CL');
  document.getElementById('kpi-proximo-etmt').textContent = proximo ? proximo.fecha : '-';
}

// ── Sprints ────────────────────────────────────────────────
function renderSprints(sprints) {
  const container = document.getElementById('sprints-container');
  if (!container) return;
  container.innerHTML = '';
  if (!sprints.length) {
    container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-rocket"></i><p>Sin sprints registrados</p></div>';
    return;
  }
  sprints.forEach(sprint => {
    const card = document.createElement('div');
    card.className = 'sprint-card';
    const totalPosts = (sprint.tareas || []).reduce((a, t) => a + (parseInt(t.cantidad) || 0), 0);

    card.innerHTML = `
      <div class="sprint-card-header">
        <div class="sprint-info">
          <div class="sprint-badge-num">${sprint.id}</div>
          <div class="sprint-details">
            <h3>${escapeHtml(sprint.nombre)}</h3>
            <p><i class="fa-regular fa-calendar" style="margin-right:4px"></i>${escapeHtml(sprint.inicio)} — ${escapeHtml(sprint.fin)} · ${totalPosts} publicaciones</p>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${statusBadge(sprint.estado)}
          <button class="btn btn-ghost btn-sm btn-icon" title="Editar" onclick="openEditSprint(${sprint.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" title="Eliminar" onclick="deleteSprint(${sprint.id})"><i class="fa-solid fa-trash"></i></button>
          <button class="btn btn-ghost btn-sm btn-icon" onclick="toggleSprintBody(this)" title="Ver detalle">
            <i class="fa-solid fa-chevron-down"></i>
          </button>
        </div>
      </div>
      <div class="sprint-card-body" style="display:none">
        ${(sprint.tareas || []).map(t => {
          const pi = PLATFORM_ICONS[t.plataforma] || { cls: 'platform-linkedin', icon: 'fa-solid fa-share-nodes' };
          return `
            <div class="sprint-task-item">
              <div class="platform-icon ${pi.cls}"><i class="${pi.icon}"></i></div>
              <div class="sprint-task-desc"><strong>${escapeHtml(t.plataforma)}</strong> — ${escapeHtml(t.descripcion)}</div>
              <span class="badge badge-purple">${t.cantidad} post${parseInt(t.cantidad) !== 1 ? 's' : ''}</span>
            </div>
          `;
        }).join('')}
        ${!(sprint.tareas || []).length ? '<p style="color:#9CA3AF;font-size:13px;text-align:center;padding:12px">Sin tareas definidas</p>' : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

function toggleSprintBody(btn) {
  const body = btn.closest('.sprint-card').querySelector('.sprint-card-body');
  const icon = btn.querySelector('i');
  if (body.style.display === 'none') {
    body.style.display = 'block';
    icon.className = 'fa-solid fa-chevron-up';
  } else {
    body.style.display = 'none';
    icon.className = 'fa-solid fa-chevron-down';
  }
}

// ── Newsletter Table ───────────────────────────────────────
function renderNewsletter(data) {
  const tbody = document.querySelector('#newsletter-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:700">${escapeHtml(row.edicion)}</td>
      <td style="white-space:nowrap">${escapeHtml(row.fecha)}</td>
      <td>${escapeHtml(row.asunto)}</td>
      <td>${row.suscriptores ? row.suscriptores.toLocaleString('es-CL') : '-'}</td>
      <td>${escapeHtml(row.apertura)}</td>
      <td>${statusBadge(row.estado)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-sm btn-icon" title="Editar" onclick="openEditNewsletter(${row.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" title="Eliminar" onclick="deleteNewsletter(${row.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  makeSortable('newsletter-table');
}

// ── EtMtuesday Table ───────────────────────────────────────
function renderEtMtuesday(data) {
  const tbody = document.querySelector('#etmtuesday-table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="white-space:nowrap;font-weight:600">${escapeHtml(row.fecha)}</td>
      <td>${escapeHtml(row.tema)}</td>
      <td>${escapeHtml(row.ponente)}</td>
      <td><span class="badge ${row.formato === 'Online' ? 'badge-blue' : 'badge-teal'}">${escapeHtml(row.formato)}</span></td>
      <td style="text-align:center">${row.inscritos > 0 ? row.inscritos : '-'}</td>
      <td>${statusBadge(row.estado)}</td>
      <td>
        <div style="display:flex;gap:4px">
          <button class="btn btn-ghost btn-sm btn-icon" title="Editar" onclick="openEditEtMtuesday(${row.id})"><i class="fa-solid fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" title="Eliminar" onclick="deleteEtMtuesday(${row.id})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  makeSortable('etmtuesday-table');
}

// ── CRUD Sprints ───────────────────────────────────────────
function openAddSprint() {
  document.getElementById('sprint-modal-title').textContent = 'Nuevo Sprint';
  document.getElementById('sprint-form').reset();
  document.getElementById('sprint-edit-id').value = '';
  document.getElementById('sprint-tareas-list').innerHTML = '';
  openModal('sprint-modal');
}

function openEditSprint(id) {
  const data = LS.get('sprints', DEFAULT_SPRINTS);
  const row = data.find(r => String(r.id) === String(id));
  if (!row) return;
  document.getElementById('sprint-modal-title').textContent = 'Editar Sprint';
  document.getElementById('sprint-edit-id').value = row.id;
  document.getElementById('sprint-nombre').value = row.nombre;
  document.getElementById('sprint-inicio').value = row.inicio;
  document.getElementById('sprint-fin').value = row.fin;
  document.getElementById('sprint-estado').value = row.estado;
  const list = document.getElementById('sprint-tareas-list');
  list.innerHTML = '';
  (row.tareas || []).forEach(t => addTareaRow(t.plataforma, t.cantidad, t.descripcion));
  openModal('sprint-modal');
}

function addTareaRow(plat = '', cant = '', desc = '') {
  const list = document.getElementById('sprint-tareas-list');
  const row = document.createElement('div');
  row.className = 'tarea-row';
  row.style.cssText = 'display:grid;grid-template-columns:110px 60px 1fr 32px;gap:8px;margin-bottom:8px;align-items:start';
  row.innerHTML = `
    <select class="form-control form-select tarea-plat" style="padding:7px 8px;font-size:12px">
      <option value="">Plataforma</option>
      ${['Instagram','LinkedIn','Twitter','TikTok','YouTube','Facebook'].map(p =>
        `<option value="${p}" ${p===plat?'selected':''}>${p}</option>`).join('')}
    </select>
    <input type="number" class="form-control tarea-cant" placeholder="#" value="${escapeHtml(String(cant))}" min="1" style="padding:7px 8px;font-size:12px">
    <input type="text" class="form-control tarea-desc" placeholder="Descripción tareas" value="${escapeHtml(String(desc))}" style="padding:7px 8px;font-size:12px">
    <button type="button" class="btn btn-danger btn-sm btn-icon" onclick="this.closest('.tarea-row').remove()" title="Quitar"><i class="fa-solid fa-times"></i></button>
  `;
  list.appendChild(row);
}

function saveSprint() {
  const id = document.getElementById('sprint-edit-id').value;
  const tareas = Array.from(document.querySelectorAll('#sprint-tareas-list .tarea-row')).map(r => ({
    plataforma: r.querySelector('.tarea-plat').value,
    cantidad: parseInt(r.querySelector('.tarea-cant').value) || 0,
    descripcion: r.querySelector('.tarea-desc').value.trim(),
  })).filter(t => t.plataforma);

  const item = {
    nombre: document.getElementById('sprint-nombre').value.trim(),
    inicio: document.getElementById('sprint-inicio').value.trim(),
    fin: document.getElementById('sprint-fin').value.trim(),
    estado: document.getElementById('sprint-estado').value,
    tareas,
  };
  if (!item.nombre) { showToast('Ingresa un nombre para el sprint', 'error'); return; }
  let data = LS.get('sprints', DEFAULT_SPRINTS);
  if (id) {
    data = data.map(r => String(r.id) === String(id) ? { ...r, ...item } : r);
    LS.set('sprints', data);
    showToast('Sprint actualizado');
  } else {
    item.id = genId();
    data.push(item);
    LS.set('sprints', data);
    showToast('Sprint creado');
  }
  closeModal('sprint-modal');
  renderSprints(LS.get('sprints', DEFAULT_SPRINTS));
  renderKPIsMarketing();
}

function deleteSprint(id) {
  confirmAction('¿Eliminar este sprint?', () => {
    LS.remove('sprints', id);
    renderSprints(LS.get('sprints', DEFAULT_SPRINTS));
    renderKPIsMarketing();
    showToast('Sprint eliminado', 'info');
  });
}

// ── CRUD Newsletter ────────────────────────────────────────
function openAddNewsletter() {
  document.getElementById('nl-modal-title').textContent = 'Agregar Newsletter';
  document.getElementById('nl-form').reset();
  document.getElementById('nl-edit-id').value = '';
  openModal('nl-modal');
}

function openEditNewsletter(id) {
  const data = LS.get('newsletter', DEFAULT_NEWSLETTER);
  const row = data.find(r => String(r.id) === String(id));
  if (!row) return;
  document.getElementById('nl-modal-title').textContent = 'Editar Newsletter';
  document.getElementById('nl-edit-id').value = row.id;
  document.getElementById('nl-edicion').value = row.edicion;
  document.getElementById('nl-fecha').value = row.fecha;
  document.getElementById('nl-asunto').value = row.asunto;
  document.getElementById('nl-suscriptores').value = row.suscriptores || '';
  document.getElementById('nl-apertura').value = row.apertura;
  document.getElementById('nl-estado').value = row.estado;
  openModal('nl-modal');
}

function saveNewsletter() {
  const id = document.getElementById('nl-edit-id').value;
  const item = {
    edicion: document.getElementById('nl-edicion').value.trim(),
    fecha: document.getElementById('nl-fecha').value.trim(),
    asunto: document.getElementById('nl-asunto').value.trim(),
    suscriptores: parseInt(document.getElementById('nl-suscriptores').value) || null,
    apertura: document.getElementById('nl-apertura').value.trim() || '-',
    estado: document.getElementById('nl-estado').value,
  };
  if (!item.edicion) { showToast('Completa los campos requeridos', 'error'); return; }
  let data = LS.get('newsletter', DEFAULT_NEWSLETTER);
  if (id) {
    data = data.map(r => String(r.id) === String(id) ? { ...r, ...item } : r);
    LS.set('newsletter', data);
    showToast('Newsletter actualizado');
  } else {
    item.id = genId();
    data.push(item);
    LS.set('newsletter', data);
    showToast('Newsletter agregado');
  }
  closeModal('nl-modal');
  renderNewsletter(LS.get('newsletter', DEFAULT_NEWSLETTER));
}

function deleteNewsletter(id) {
  confirmAction('¿Eliminar este newsletter?', () => {
    LS.remove('newsletter', id);
    renderNewsletter(LS.get('newsletter', DEFAULT_NEWSLETTER));
    showToast('Newsletter eliminado', 'info');
  });
}

// ── CRUD EtMtuesday ────────────────────────────────────────
function openAddEtMtuesday() {
  document.getElementById('etmt-modal-title').textContent = 'Agregar EtMtuesday';
  document.getElementById('etmt-form').reset();
  document.getElementById('etmt-edit-id').value = '';
  openModal('etmt-modal');
}

function openEditEtMtuesday(id) {
  const data = LS.get('etmtuesday', DEFAULT_ETMTUESDAY);
  const row = data.find(r => String(r.id) === String(id));
  if (!row) return;
  document.getElementById('etmt-modal-title').textContent = 'Editar EtMtuesday';
  document.getElementById('etmt-edit-id').value = row.id;
  document.getElementById('etmt-fecha').value = row.fecha;
  document.getElementById('etmt-tema').value = row.tema;
  document.getElementById('etmt-ponente').value = row.ponente;
  document.getElementById('etmt-formato').value = row.formato;
  document.getElementById('etmt-inscritos').value = row.inscritos;
  document.getElementById('etmt-estado').value = row.estado;
  openModal('etmt-modal');
}

function saveEtMtuesday() {
  const id = document.getElementById('etmt-edit-id').value;
  const item = {
    fecha: document.getElementById('etmt-fecha').value.trim(),
    tema: document.getElementById('etmt-tema').value.trim(),
    ponente: document.getElementById('etmt-ponente').value.trim() || '-',
    formato: document.getElementById('etmt-formato').value,
    inscritos: parseInt(document.getElementById('etmt-inscritos').value) || 0,
    estado: document.getElementById('etmt-estado').value,
  };
  if (!item.fecha || !item.tema) { showToast('Completa los campos requeridos', 'error'); return; }
  let data = LS.get('etmtuesday', DEFAULT_ETMTUESDAY);
  if (id) {
    data = data.map(r => String(r.id) === String(id) ? { ...r, ...item } : r);
    LS.set('etmtuesday', data);
    showToast('EtMtuesday actualizado');
  } else {
    item.id = genId();
    data.push(item);
    LS.set('etmtuesday', data);
    showToast('EtMtuesday agregado');
  }
  closeModal('etmt-modal');
  renderEtMtuesday(LS.get('etmtuesday', DEFAULT_ETMTUESDAY));
  renderKPIsMarketing();
}

function deleteEtMtuesday(id) {
  confirmAction('¿Eliminar este EtMtuesday?', () => {
    LS.remove('etmtuesday', id);
    renderEtMtuesday(LS.get('etmtuesday', DEFAULT_ETMTUESDAY));
    renderKPIsMarketing();
    showToast('EtMtuesday eliminado', 'info');
  });
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('marketing');
  renderHeader('Marketing y Comunicaciones', 'Sprints de contenido, newsletter y eventos semanales');

  if (!localStorage.getItem('etm_sprints')) LS.set('sprints', DEFAULT_SPRINTS);
  if (!localStorage.getItem('etm_newsletter')) LS.set('newsletter', DEFAULT_NEWSLETTER);
  if (!localStorage.getItem('etm_etmtuesday')) LS.set('etmtuesday', DEFAULT_ETMTUESDAY);

  renderKPIsMarketing();
  renderSprints(LS.get('sprints', DEFAULT_SPRINTS));
  renderNewsletter(LS.get('newsletter', DEFAULT_NEWSLETTER));
  renderEtMtuesday(LS.get('etmtuesday', DEFAULT_ETMTUESDAY));
});
