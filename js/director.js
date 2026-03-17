/* ============================================================
   ETM Dashboard — director.js
   Dashboard Director Ejecutivo: KPIs por área, KPIs por
   jefatura (editables), notas privadas. Con password gate.
   ============================================================ */

// ── Password Gate ──────────────────────────────────────────
const DIRECTOR_PASSWORD = 'ETM2025';
const SESSION_KEY = 'etm_director_auth';

function checkAuth() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

function attemptLogin() {
  const input = document.getElementById('dir-password-input');
  const error = document.getElementById('dir-password-error');
  if (!input) return;
  if (input.value === DIRECTOR_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, '1');
    document.getElementById('dir-password-overlay').style.display = 'none';
    document.getElementById('dir-dashboard').style.display = 'block';
    initDashboard();
  } else {
    error.style.display = 'block';
    input.value = '';
    input.focus();
    setTimeout(() => { error.style.display = 'none'; }, 3000);
  }
}

// Allow Enter key on password field
function handlePasswordKey(e) {
  if (e.key === 'Enter') attemptLogin();
}

// ── KPIs por Jefatura — Data ───────────────────────────────
const JEFATURAS = [
  {
    id: 'nicolas',
    nombre: 'Nicolás Uranga',
    rol: 'Director Ejecutivo',
    avatar: 'NU',
    color: '#7C3AED',
    kpis: [
      { label: 'Fondos totales gestionados', metaKey: 'nicolas_k1_meta', logKey: 'nicolas_k1_log', metaDefault: '—', logDefault: '—' },
      { label: 'Sponsors cerrados',          metaKey: 'nicolas_k2_meta', logKey: 'nicolas_k2_log', metaDefault: '—', logDefault: '—' },
      { label: 'Hitos estratégicos cumplidos', metaKey: 'nicolas_k3_meta', logKey: 'nicolas_k3_log', metaDefault: '—', logDefault: '—' },
    ]
  },
  {
    id: 'mariaingnacia',
    nombre: 'María Ignacia',
    rol: 'Jefa Contenidos y Ecosistemas',
    avatar: 'MI',
    color: '#16A34A',
    kpis: [
      { label: 'Alianzas nuevas',           metaKey: 'mi_k1_meta', logKey: 'mi_k1_log', metaDefault: '—', logDefault: '—' },
      { label: 'Proyectos activos',         metaKey: 'mi_k2_meta', logKey: 'mi_k2_log', metaDefault: '—', logDefault: '—' },
      { label: 'EtMtuesday coordinados',    metaKey: 'mi_k3_meta', logKey: 'mi_k3_log', metaDefault: '—', logDefault: '—' },
    ]
  },
  {
    id: 'pamela',
    nombre: 'Pamela Abello',
    rol: 'Jefa Producción',
    avatar: 'PA',
    color: '#EA580C',
    kpis: [
      { label: 'Proveedores gestionados',        metaKey: 'pa_k1_meta', logKey: 'pa_k1_log', metaDefault: '—', logDefault: '—' },
      { label: 'Hitos Gantt cumplidos',          metaKey: 'pa_k2_meta', logKey: 'pa_k2_log', metaDefault: '—', logDefault: '—' },
      { label: '% avance producción EtMday',     metaKey: 'pa_k3_meta', logKey: 'pa_k3_log', metaDefault: '—', logDefault: '—' },
    ]
  },
  {
    id: 'comercial_vacante',
    nombre: 'Jefe/a Comercial',
    rol: 'Comercial',
    avatar: '?',
    color: '#9CA3AF',
    vacante: true,
    kpis: []
  },
  {
    id: 'javiera',
    nombre: 'Javiera López',
    rol: 'Jefa Marketing y Comunicaciones',
    avatar: 'JL',
    color: '#E11D48',
    kpis: [
      { label: 'Publicaciones mensuales',  metaKey: 'jl_k1_meta', logKey: 'jl_k1_log', metaDefault: '—', logDefault: '—' },
      { label: 'Crecimiento seguidores',   metaKey: 'jl_k2_meta', logKey: 'jl_k2_log', metaDefault: '—', logDefault: '—' },
      { label: 'Newsletter enviados',      metaKey: 'jl_k3_meta', logKey: 'jl_k3_log', metaDefault: '—', logDefault: '—' },
    ]
  },
  {
    id: 'catalina',
    nombre: 'Catalina Pizarro',
    rol: 'Analista Comercial y Control de Gestión',
    avatar: 'CP',
    color: '#0891B2',
    kpis: [
      { label: 'Propuestas enviadas',      metaKey: 'cp_k1_meta', logKey: 'cp_k1_log', metaDefault: '—', logDefault: '—' },
      { label: 'Seguimiento de clientes',  metaKey: 'cp_k2_meta', logKey: 'cp_k2_log', metaDefault: '—', logDefault: '—' },
      { label: 'Informes de gestión',      metaKey: 'cp_k3_meta', logKey: 'cp_k3_log', metaDefault: '—', logDefault: '—' },
    ]
  },
];

// ── LS helpers for director keys ───────────────────────────
function getDirVal(key, def) {
  return localStorage.getItem('etm_dir_' + key) || def;
}
function setDirVal(key, val) {
  localStorage.setItem('etm_dir_' + key, val);
}

// ── Compute progress pct from two values ───────────────────
function computePct(logVal, metaVal) {
  const cleanNum = s => parseFloat(String(s).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
  const log = cleanNum(logVal);
  const meta = cleanNum(metaVal);
  if (!meta || meta === 0) return 0;
  return Math.min(100, Math.round((log / meta) * 100));
}

function statusDot(pct) {
  if (pct >= 80) return '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#22C55E;flex-shrink:0" title="En camino"></span>';
  if (pct >= 40) return '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#F59E0B;flex-shrink:0" title="Atención"></span>';
  return '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#EF4444;flex-shrink:0" title="Bajo meta"></span>';
}

// ── Render Area Cards ──────────────────────────────────────
const AREA_CARDS = [
  {
    icon: 'fa-industry',
    color: '#7C3AED',
    bg: '#F5F3FF',
    title: 'Producción',
    metrics: [
      { label: 'Avance Carta Gantt', key: 'area_prod_gantt', def: '—%' },
      { label: 'Proveedores pagados', key: 'area_prod_pagados', def: '—/—' },
      { label: 'Presupuesto ejecutado', key: 'area_prod_presup', def: '$—' },
    ]
  },
  {
    icon: 'fa-briefcase',
    color: '#2563EB',
    bg: '#DBEAFE',
    title: 'Comercial',
    metrics: [
      { label: 'Pipeline total', key: 'area_com_pipeline', def: '$—' },
      { label: 'Meta anual', key: 'area_com_meta', def: '$—' },
      { label: '% Cumplimiento', key: 'area_com_pct', def: '—%' },
    ]
  },
  {
    icon: 'fa-bullhorn',
    color: '#D97706',
    bg: '#FEF3C7',
    title: 'Marketing',
    metrics: [
      { label: 'Posts publicados', key: 'area_mkt_posts', def: '—/—' },
      { label: 'Suscriptores newsletter', key: 'area_mkt_suscrip', def: '—' },
      { label: 'Próximo EtMtuesday', key: 'area_mkt_etmt', def: '—' },
    ]
  },
  {
    icon: 'fa-handshake-angle',
    color: '#16A34A',
    bg: '#DCFCE7',
    title: 'Ecosistemas',
    metrics: [
      { label: 'Alianzas activas', key: 'area_eco_alianzas', def: '—' },
      { label: 'Proyectos en curso', key: 'area_eco_proyectos', def: '—' },
      { label: 'Fondos gestionados', key: 'area_eco_fondos', def: '$—' },
    ]
  },
];

function renderAreaCards() {
  const grid = document.getElementById('area-cards-grid');
  if (!grid) return;
  grid.innerHTML = '';
  AREA_CARDS.forEach(card => {
    const el = document.createElement('div');
    el.className = 'dir-area-card';
    el.style.cssText = `border-top: 4px solid ${card.color};`;
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
        <div style="width:38px;height:38px;border-radius:10px;background:${card.bg};color:${card.color};display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0">
          <i class="fa-solid ${card.icon}"></i>
        </div>
        <span style="font-size:15px;font-weight:700;color:#111827">${card.title}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${card.metrics.map(m => `
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px">
            <span style="color:#6B7280">${m.label}</span>
            <span style="font-weight:700;color:#111827">${getDirVal(m.key, m.def)}</span>
          </div>
        `).join('')}
      </div>
    `;
    grid.appendChild(el);
  });
}

// ── Render Jefatura KPI Cards ──────────────────────────────
function renderJefaturas() {
  const grid = document.getElementById('jefaturas-grid');
  if (!grid) return;
  grid.innerHTML = '';

  JEFATURAS.forEach(jef => {
    const card = document.createElement('div');
    card.className = 'panel dir-kpi-card';
    card.style.marginBottom = '0';

    // Special render for vacante card
    if (jef.vacante) {
      card.style.cssText = 'margin-bottom:0;border:2px dashed #D1D5DB;background:#F9FAFB';
      card.innerHTML = `
        <div class="panel-header" style="padding-bottom:12px">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:12px;background:#D1D5DB;color:white;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;flex-shrink:0">?</div>
            <div>
              <div style="font-size:15px;font-weight:700;color:#9CA3AF">${jef.nombre}</div>
              <div style="font-size:12px;color:#9CA3AF">${jef.rol}</div>
            </div>
            <span style="margin-left:auto;display:inline-block;background:#F3F4F6;color:#9CA3AF;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase">Vacante</span>
          </div>
        </div>
        <div class="panel-body" style="padding-top:4px;text-align:center;padding-bottom:20px">
          <i class="fa-solid fa-user-slash" style="font-size:24px;color:#D1D5DB;margin-bottom:10px;display:block"></i>
          <p style="font-size:13px;color:#9CA3AF;margin:0">Este cargo está siendo reclutado</p>
        </div>
      `;
      grid.appendChild(card);
      return;
    }

    const kpiRows = jef.kpis.map(k => {
      const metaVal = getDirVal(k.metaKey, k.metaDefault);
      const logVal  = getDirVal(k.logKey,  k.logDefault);
      const pct     = computePct(logVal, metaVal);
      const dot     = statusDot(pct);

      let barColor = 'red';
      if (pct >= 80) barColor = 'green';
      else if (pct >= 40) barColor = 'amber';

      return `
        <div class="dir-kpi-row" style="margin-bottom:14px">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:5px">
            <div style="display:flex;align-items:center;gap:6px;min-width:0">
              ${dot}
              <span style="font-size:12.5px;color:#374151;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${k.label}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
              <span style="font-size:11px;color:#9CA3AF">Meta:</span>
              <span
                class="dir-editable"
                data-key="${k.metaKey}"
                data-def="${k.metaDefault}"
                data-jef="${jef.id}"
                style="font-size:12px;font-weight:600;color:#7C3AED;cursor:pointer;border-bottom:1px dashed #DDD6FE;min-width:20px"
                title="Haz clic para editar"
              >${metaVal}</span>
              <span style="font-size:11px;color:#9CA3AF">Log:</span>
              <span
                class="dir-editable"
                data-key="${k.logKey}"
                data-def="${k.logDefault}"
                data-jef="${jef.id}"
                style="font-size:12px;font-weight:700;color:#111827;cursor:pointer;border-bottom:1px dashed #D1D5DB;min-width:20px"
                title="Haz clic para editar"
              >${logVal}</span>
            </div>
          </div>
          ${progressBar(pct, barColor)}
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <div class="panel-header" style="padding-bottom:12px">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:44px;height:44px;border-radius:12px;background:${jef.color};color:white;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;flex-shrink:0">${jef.avatar}</div>
          <div>
            <div style="font-size:15px;font-weight:700;color:#111827">${jef.nombre}</div>
            <div style="font-size:12px;color:#9CA3AF">${jef.rol}</div>
          </div>
        </div>
      </div>
      <div class="panel-body" style="padding-top:4px">
        ${kpiRows}
      </div>
    `;
    grid.appendChild(card);
  });

  // Attach click-to-edit on all editable spans
  grid.querySelectorAll('.dir-editable').forEach(span => {
    span.addEventListener('click', function() {
      const key = this.dataset.key;
      const current = getDirVal(key, this.dataset.def);
      const input = document.createElement('input');
      input.type = 'text';
      input.value = current === '—' || current === '—%' || current === '$—' || current === '—/—' ? '' : current;
      input.placeholder = this.dataset.def;
      input.style.cssText = 'width:60px;font-size:12px;font-weight:600;border:1px solid #7C3AED;border-radius:4px;padding:2px 4px;outline:none;color:#111827';
      this.replaceWith(input);
      input.focus();
      input.select();

      const save = () => {
        const val = input.value.trim() || getDirVal(key, this.dataset.def);
        setDirVal(key, val);
        // Re-render the entire jefatura grid to update progress bars
        renderJefaturas();
        showToast('KPI guardado', 'success');
      };
      input.addEventListener('blur', save);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
    });
  });
}

// ── Notas del Director ─────────────────────────────────────
const NOTES_KEY = 'etm_dir_notas';

function renderNotas() {
  const ta = document.getElementById('dir-notas-textarea');
  const ts = document.getElementById('dir-notas-timestamp');
  if (!ta) return;

  const saved = localStorage.getItem(NOTES_KEY);
  const savedTs = localStorage.getItem(NOTES_KEY + '_ts');

  ta.value = saved || '';
  if (savedTs) {
    ts.textContent = 'Guardado: ' + savedTs;
  }

  ta.addEventListener('input', () => {
    localStorage.setItem(NOTES_KEY, ta.value);
    const now = new Date().toLocaleString('es-CL');
    localStorage.setItem(NOTES_KEY + '_ts', now);
    ts.textContent = 'Guardado: ' + now;
  });
}

// ── Init Dashboard ─────────────────────────────────────────
function initDashboard() {
  renderAreaCards();
  renderJefaturas();
  renderNotas();
}

// ── DOMContentLoaded ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('director');
  renderHeader('Dashboard Director Ejecutivo', 'Vista consolidada · ETM 2025');

  if (checkAuth()) {
    document.getElementById('dir-password-overlay').style.display = 'none';
    document.getElementById('dir-dashboard').style.display = 'block';
    initDashboard();
  } else {
    document.getElementById('dir-password-overlay').style.display = 'flex';
    document.getElementById('dir-dashboard').style.display = 'none';
    // Focus password input after a brief delay
    setTimeout(() => {
      const inp = document.getElementById('dir-password-input');
      if (inp) inp.focus();
    }, 100);
  }
});
