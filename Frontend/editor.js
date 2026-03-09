/* ═══════════════════════════════════════════════
   RESUME EDITOR — editor.js
   ═══════════════════════════════════════════════ */

let currentStep = 1;
const TOTAL_STEPS = 6;
let currentZoom = 1;

// ── INIT ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadTemplate();
  loadDraft();
  initCharCount();
  updateStepNav();
  updatePreview();
});

// ── LOAD TEMPLATE FROM SESSION ────────────────────
function loadTemplate() {
  const raw = sessionStorage.getItem('selectedTemplate');
  const tpl = raw ? JSON.parse(raw) : { id: 'se-1', name: 'Clean Dev', layout: 'single', color: 'blue' };

  // Update indicator
  const nameEl = document.getElementById('tpl-indicator-name');
  if (nameEl) nameEl.textContent = tpl.name;

  // Apply layout class to resume sheet
  const sheet = document.getElementById('resume-render');
  if (sheet) {
    sheet.className = `resume-render layout-${tpl.layout} color-${tpl.color}`;
  }

  // Apply accent color CSS variable for this template
  applyTemplateStyle(tpl);
}

function applyTemplateStyle(tpl) {
  const colorMap = {
    blue:   '#2563EB',
    teal:   '#0D9488',
    purple: '#7C3AED',
    navy:   '#1E3A5F',
    green:  '#059669',
    amber:  '#D97706',
    slate:  '#475569',
    pink:   '#DB2777',
    red:    '#DC2626',
    indigo: '#4338CA',
  };
  const accent = colorMap[tpl.color] || colorMap.blue;
  document.documentElement.style.setProperty('--resume-accent', accent);

  // Update all section titles in preview
  document.querySelectorAll('.r-sec-title').forEach(el => {
    el.style.color = accent;
  });
  document.querySelectorAll('.r-title').forEach(el => {
    el.style.color = accent;
  });
}

// ── STEP NAVIGATION ───────────────────────────────
function goToStep(step) {
  if (step < 1 || step > TOTAL_STEPS) return;

  // Hide current, show new
  document.querySelectorAll('.step-form').forEach(f => f.classList.remove('active'));
  document.getElementById(`step-${step}`).classList.add('active');

  currentStep = step;
  updateStepNav();
  updatePreview();
}

function updateStepNav() {
  document.querySelectorAll('.step-nav-item').forEach(item => {
    const s = parseInt(item.dataset.step);
    item.classList.remove('active', 'done');
    if (s === currentStep) item.classList.add('active');
    else if (s < currentStep) item.classList.add('done');
  });
}

// ── ZOOM ──────────────────────────────────────────
function zoomPreview(delta) {
  currentZoom = Math.min(1.4, Math.max(0.5, currentZoom + delta));
  const sheet = document.getElementById('resume-sheet');
  if (sheet) sheet.style.transform = `scale(${currentZoom})`;
  const zoomEl = document.getElementById('zoom-level');
  if (zoomEl) zoomEl.textContent = `${Math.round(currentZoom * 100)}%`;
}

// ── CHAR COUNT ────────────────────────────────────
function initCharCount() {
  const summary = document.getElementById('f-summary');
  const count = document.getElementById('summary-count');
  if (summary && count) {
    summary.addEventListener('input', () => {
      count.textContent = summary.value.length;
      count.style.color = summary.value.length > 400 ? '#EF4444' : '';
    });
  }
}

// ── LIVE PREVIEW UPDATE ───────────────────────────
function updatePreview() {
  updateHeaderPreview();
  updateSummaryPreview();
  updateExperiencePreview();
  updateSkillsPreview();
  updateEducationPreview();
  updateProjectsPreview();
}

function updateHeaderPreview() {
  const name     = document.getElementById('f-name')?.value.trim() || '';
  const title    = document.getElementById('f-title')?.value.trim() || '';
  const email    = document.getElementById('f-email')?.value.trim() || '';
  const phone    = document.getElementById('f-phone')?.value.trim() || '';
  const location = document.getElementById('f-location')?.value.trim() || '';
  const linkedin = document.getElementById('f-linkedin')?.value.trim() || '';
  const website  = document.getElementById('f-website')?.value.trim() || '';

  setPreview('r-name', name || 'Your Name', !name);
  setPreview('r-title', title || 'Job Title', !title);

  // Contact row
  const parts = [email, phone, location].filter(Boolean);
  const contactEl = document.getElementById('r-contact');
  if (contactEl) {
    if (parts.length) {
      contactEl.innerHTML = parts.map((p, i) =>
        `<span>${p}</span>${i < parts.length - 1 ? '<span class="r-sep">·</span>' : ''}`
      ).join('');
    } else {
      contactEl.innerHTML = '<span style="color:#D1D5DB;font-style:italic">email · phone · location</span>';
    }
  }

  // Links row
  const linksEl = document.getElementById('r-links');
  if (linksEl) {
    const links = [];
    if (linkedin) links.push(`<span>${linkedin}</span>`);
    if (website)  links.push(`<span>${website}</span>`);
    linksEl.innerHTML = links.join('<span class="r-sep" style="margin:0 4px">·</span>');
  }
}

function setPreview(id, text, isPlaceholder) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('r-placeholder', isPlaceholder);
}

function updateSummaryPreview() {
  const val = document.getElementById('f-summary')?.value.trim() || '';
  const el = document.getElementById('r-summary');
  if (el) {
    el.textContent = val || 'Your professional summary will appear here...';
    el.classList.toggle('r-placeholder', !val);
  }
}

function updateExperiencePreview() {
  const container = document.getElementById('r-experience-body');
  if (!container) return;

  const entries = document.querySelectorAll('.experience-entry');
  const html = [];

  entries.forEach(entry => {
    const expTitle    = entry.querySelector('.exp-title')?.value.trim() || '';
    const expCompany  = entry.querySelector('.exp-company')?.value.trim() || '';
    const expStart    = entry.querySelector('.exp-start')?.value.trim() || '';
    const expEnd      = entry.querySelector('.exp-end')?.value.trim() || '';
    const expLocation = entry.querySelector('.exp-location')?.value.trim() || '';
    const expBullets  = entry.querySelector('.exp-bullets')?.value.trim() || '';

    if (!expTitle && !expCompany) return;

    const dateRange = [expStart, expEnd].filter(Boolean).join(' – ');
    const companyLine = [expCompany, expLocation].filter(Boolean).join(' · ');

    const bullets = expBullets
      ? expBullets.split('\n')
          .map(l => l.trim().replace(/^[•\-*]\s*/, ''))
          .filter(Boolean)
          .map(l => `<li>${escapeHtml(l)}</li>`)
          .join('')
      : '';

    html.push(`
      <div class="r-exp-entry">
        <div class="r-exp-header">
          <span class="r-exp-title">${escapeHtml(expTitle)}</span>
          ${dateRange ? `<span class="r-exp-date">${escapeHtml(dateRange)}</span>` : ''}
        </div>
        ${companyLine ? `<div class="r-exp-company">${escapeHtml(companyLine)}</div>` : ''}
        ${bullets ? `<ul class="r-exp-bullets">${bullets}</ul>` : ''}
      </div>
    `);
  });

  container.innerHTML = html.length
    ? html.join('')
    : '<div class="r-placeholder">Your work experience will appear here...</div>';
}

function updateSkillsPreview() {
  const container = document.getElementById('r-skills-body');
  if (!container) return;

  const tech   = document.getElementById('f-tech-skills')?.value.trim() || '';
  const soft   = document.getElementById('f-soft-skills')?.value.trim() || '';
  const tools  = document.getElementById('f-tools')?.value.trim() || '';
  const langs  = document.getElementById('f-languages')?.value.trim() || '';

  const rows = [
    { label: 'Technical', val: tech },
    { label: 'Soft Skills', val: soft },
    { label: 'Tools', val: tools },
    { label: 'Languages', val: langs },
  ].filter(r => r.val);

  if (!rows.length) {
    container.innerHTML = '<div class="r-placeholder">Your skills will appear here...</div>';
    return;
  }

  container.innerHTML = `
    <div class="r-skills-wrap">
      ${rows.map(r => `
        <div class="r-skill-row">
          <span class="r-skill-label">${r.label}</span>
          <div class="r-skill-tags">
            ${r.val.split(',').map(s => s.trim()).filter(Boolean)
              .map(s => `<span class="r-skill-tag">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function updateEducationPreview() {
  const container = document.getElementById('r-education-body');
  if (!container) return;

  const entries = document.querySelectorAll('.education-entry');
  const html = [];

  entries.forEach(entry => {
    const degree  = entry.querySelector('.edu-degree')?.value.trim() || '';
    const school  = entry.querySelector('.edu-school')?.value.trim() || '';
    const year    = entry.querySelector('.edu-year')?.value.trim() || '';
    const gpa     = entry.querySelector('.edu-gpa')?.value.trim() || '';
    const honors  = entry.querySelector('.edu-honors')?.value.trim() || '';

    if (!degree && !school) return;

    const detail = [gpa ? `GPA: ${gpa}` : '', honors].filter(Boolean).join(' · ');

    html.push(`
      <div class="r-edu-entry">
        <div class="r-edu-header">
          <span class="r-edu-degree">${escapeHtml(degree)}</span>
          ${year ? `<span class="r-edu-year">${escapeHtml(year)}</span>` : ''}
        </div>
        ${school ? `<div class="r-edu-school">${escapeHtml(school)}</div>` : ''}
        ${detail ? `<div class="r-edu-detail">${escapeHtml(detail)}</div>` : ''}
      </div>
    `);
  });

  container.innerHTML = html.length
    ? html.join('')
    : '<div class="r-placeholder">Your education will appear here...</div>';
}

function updateProjectsPreview() {
  const container = document.getElementById('r-projects-body');
  if (!container) return;

  const projEntries = document.querySelectorAll('.project-entry');
  const certEntries = document.querySelectorAll('.cert-entry');
  const html = [];

  projEntries.forEach(entry => {
    const name = entry.querySelector('.proj-name')?.value.trim() || '';
    const tech = entry.querySelector('.proj-tech')?.value.trim() || '';
    const desc = entry.querySelector('.proj-desc')?.value.trim() || '';
    const url  = entry.querySelector('.proj-url')?.value.trim() || '';

    if (!name) return;

    html.push(`
      <div class="r-proj-entry">
        <div class="r-proj-header">
          <span class="r-proj-name">${escapeHtml(name)}</span>
          ${tech ? `<span class="r-proj-tech">${escapeHtml(tech)}</span>` : ''}
        </div>
        ${desc ? `<div class="r-proj-desc">${escapeHtml(desc)}</div>` : ''}
        ${url ? `<div class="r-proj-link">${escapeHtml(url)}</div>` : ''}
      </div>
    `);
  });

  certEntries.forEach(entry => {
    const name   = entry.querySelector('.cert-name')?.value.trim() || '';
    const issuer = entry.querySelector('.cert-issuer')?.value.trim() || '';
    if (!name) return;
    html.push(`
      <div class="r-cert-entry">
        <span class="r-cert-name">${escapeHtml(name)}</span>
        ${issuer ? `<span class="r-cert-issuer">${escapeHtml(issuer)}</span>` : ''}
      </div>
    `);
  });

  container.innerHTML = html.length
    ? html.join('')
    : '<div class="r-placeholder">Your projects and certifications will appear here...</div>';
}

// ── ADD / REMOVE ENTRIES ──────────────────────────
function addExperienceEntry() {
  const container = document.getElementById('experience-entries');
  const count = container.querySelectorAll('.experience-entry').length;
  const entry = document.createElement('div');
  entry.className = 'experience-entry';
  entry.dataset.entry = count;
  entry.innerHTML = `
    <div class="entry-header">
      <span class="entry-label">Position ${count + 1}</span>
      <button class="entry-remove" onclick="removeEntry('experience', ${count})">Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Job Title *</label>
        <input type="text" class="exp-title" placeholder="e.g. Product Manager" oninput="updatePreview()"/>
      </div>
      <div class="form-group">
        <label>Company *</label>
        <input type="text" class="exp-company" placeholder="e.g. Airbnb" oninput="updatePreview()"/>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Start Date</label>
        <input type="text" class="exp-start" placeholder="Mar 2020" oninput="updatePreview()"/>
      </div>
      <div class="form-group">
        <label>End Date</label>
        <input type="text" class="exp-end" placeholder="Jan 2022" oninput="updatePreview()"/>
      </div>
    </div>
    <div class="form-group">
      <label>Location</label>
      <input type="text" class="exp-location" placeholder="Remote" oninput="updatePreview()"/>
    </div>
    <div class="form-group">
      <label>Responsibilities & Achievements</label>
      <textarea class="exp-bullets" rows="4" placeholder="• Led cross-functional team of 8..." oninput="updatePreview()"></textarea>
      <div class="form-hint">Start each line with • for bullet points.</div>
    </div>
  `;
  container.appendChild(entry);
  entry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function addEducationEntry() {
  const container = document.getElementById('education-entries');
  const count = container.querySelectorAll('.education-entry').length;
  const entry = document.createElement('div');
  entry.className = 'education-entry';
  entry.dataset.entry = count;
  entry.innerHTML = `
    <div class="entry-header">
      <span class="entry-label">Degree ${count + 1}</span>
      <button class="entry-remove" onclick="removeEntry('education', ${count})">Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Degree / Certificate *</label>
        <input type="text" class="edu-degree" placeholder="e.g. M.S. Data Science" oninput="updatePreview()"/>
      </div>
      <div class="form-group">
        <label>Institution *</label>
        <input type="text" class="edu-school" placeholder="e.g. Stanford" oninput="updatePreview()"/>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Graduation Year</label>
        <input type="text" class="edu-year" placeholder="2022" oninput="updatePreview()"/>
      </div>
      <div class="form-group">
        <label>GPA (optional)</label>
        <input type="text" class="edu-gpa" placeholder="3.9 / 4.0" oninput="updatePreview()"/>
      </div>
    </div>
    <div class="form-group">
      <label>Honors / Coursework</label>
      <input type="text" class="edu-honors" placeholder="e.g. Summa Cum Laude" oninput="updatePreview()"/>
    </div>
  `;
  container.appendChild(entry);
  entry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function addProjectEntry() {
  const container = document.getElementById('project-entries');
  const count = container.querySelectorAll('.project-entry').length;
  const entry = document.createElement('div');
  entry.className = 'project-entry';
  entry.dataset.entry = count;
  entry.innerHTML = `
    <div class="entry-header">
      <span class="entry-label">Project ${count + 1}</span>
      <button class="entry-remove" onclick="removeEntry('project', ${count})">Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Project Name</label>
        <input type="text" class="proj-name" placeholder="Project Title" oninput="updatePreview()"/>
      </div>
      <div class="form-group">
        <label>Tech Stack</label>
        <input type="text" class="proj-tech" placeholder="React, AWS" oninput="updatePreview()"/>
      </div>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea class="proj-desc" rows="2" placeholder="Brief description..." oninput="updatePreview()"></textarea>
    </div>
    <div class="form-group">
      <label>URL</label>
      <input type="url" class="proj-url" placeholder="github.com/..." oninput="updatePreview()"/>
    </div>
  `;
  container.appendChild(entry);
  entry.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function addCertEntry() {
  const container = document.getElementById('cert-entries');
  const entry = document.createElement('div');
  entry.className = 'cert-entry';
  entry.innerHTML = `
    <div class="form-row">
      <div class="form-group">
        <label>Certification</label>
        <input type="text" class="cert-name" placeholder="e.g. PMP" oninput="updatePreview()"/>
      </div>
      <div class="form-group">
        <label>Issuer & Year</label>
        <input type="text" class="cert-issuer" placeholder="PMI, 2024" oninput="updatePreview()"/>
      </div>
    </div>
  `;
  container.appendChild(entry);
  updatePreview();
}

function removeEntry(type, index) {
  const containerMap = {
    experience: 'experience-entries',
    education:  'education-entries',
    project:    'project-entries',
  };
  const container = document.getElementById(containerMap[type]);
  if (!container) return;

  const entries = container.children;
  if (entries.length <= 1) return; // keep at least one

  const entry = container.querySelector(`[data-entry="${index}"]`);
  if (entry) entry.remove();

  // Renumber remaining entries
  Array.from(container.children).forEach((e, i) => {
    e.dataset.entry = i;
    const label = e.querySelector('.entry-label');
    const typeCapital = type.charAt(0).toUpperCase() + type.slice(1);
    const labelText = type === 'experience' ? 'Position' : typeCapital === 'Education' ? 'Degree' : typeCapital;
    if (label) label.textContent = `${labelText} ${i + 1}`;

    const removeBtn = e.querySelector('.entry-remove');
    if (removeBtn) {
      removeBtn.setAttribute('onclick', `removeEntry('${type}', ${i})`);
      removeBtn.style.display = container.children.length > 1 ? '' : 'none';
    }
  });

  updatePreview();
}

// ── DRAFT SAVE / LOAD ─────────────────────────────
function saveResume() {
  const data = collectFormData();
  localStorage.setItem('resumeIQ_draft', JSON.stringify(data));

  const btn = document.getElementById('btn-save');
  if (btn) {
    btn.textContent = 'Saved ✓';
    btn.style.color = '#059669';
    setTimeout(() => {
      btn.textContent = 'Save Draft';
      btn.style.color = '';
    }, 1800);
  }
}

function loadDraft() {
  const raw = localStorage.getItem('resumeIQ_draft');
  if (!raw) return;

  try {
    const data = JSON.parse(raw);
    fillFormData(data);
    updatePreview();
  } catch (e) {
    // Invalid draft, ignore
  }
}

function collectFormData() {
  const getVal = id => document.getElementById(id)?.value || '';

  const experience = [];
  document.querySelectorAll('.experience-entry').forEach(entry => {
    experience.push({
      title:    entry.querySelector('.exp-title')?.value || '',
      company:  entry.querySelector('.exp-company')?.value || '',
      start:    entry.querySelector('.exp-start')?.value || '',
      end:      entry.querySelector('.exp-end')?.value || '',
      location: entry.querySelector('.exp-location')?.value || '',
      bullets:  entry.querySelector('.exp-bullets')?.value || '',
    });
  });

  const education = [];
  document.querySelectorAll('.education-entry').forEach(entry => {
    education.push({
      degree: entry.querySelector('.edu-degree')?.value || '',
      school: entry.querySelector('.edu-school')?.value || '',
      year:   entry.querySelector('.edu-year')?.value || '',
      gpa:    entry.querySelector('.edu-gpa')?.value || '',
      honors: entry.querySelector('.edu-honors')?.value || '',
    });
  });

  return {
    name: getVal('f-name'), title: getVal('f-title'), location: getVal('f-location'),
    email: getVal('f-email'), phone: getVal('f-phone'),
    linkedin: getVal('f-linkedin'), website: getVal('f-website'),
    summary: getVal('f-summary'),
    techSkills: getVal('f-tech-skills'), softSkills: getVal('f-soft-skills'),
    tools: getVal('f-tools'), languages: getVal('f-languages'),
    experience, education,
  };
}

function fillFormData(data) {
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

  setVal('f-name', data.name);       setVal('f-title', data.title);
  setVal('f-location', data.location); setVal('f-email', data.email);
  setVal('f-phone', data.phone);     setVal('f-linkedin', data.linkedin);
  setVal('f-website', data.website); setVal('f-summary', data.summary);
  setVal('f-tech-skills', data.techSkills); setVal('f-soft-skills', data.softSkills);
  setVal('f-tools', data.tools);     setVal('f-languages', data.languages);

  // Restore experience entries
  if (data.experience?.length) {
    const container = document.getElementById('experience-entries');
    container.innerHTML = '';
    data.experience.forEach((exp, i) => {
      const entry = document.createElement('div');
      entry.className = 'experience-entry';
      entry.dataset.entry = i;
      entry.innerHTML = buildExpEntryHTML(i, exp);
      container.appendChild(entry);
    });
  }

  // Restore education entries
  if (data.education?.length) {
    const container = document.getElementById('education-entries');
    container.innerHTML = '';
    data.education.forEach((edu, i) => {
      const entry = document.createElement('div');
      entry.className = 'education-entry';
      entry.dataset.entry = i;
      entry.innerHTML = buildEduEntryHTML(i, edu);
      container.appendChild(entry);
    });
  }
}

function buildExpEntryHTML(i, exp) {
  return `
    <div class="entry-header">
      <span class="entry-label">Position ${i + 1}</span>
      <button class="entry-remove" onclick="removeEntry('experience', ${i})"${i === 0 ? ' style="display:none"' : ''}>Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Job Title *</label>
        <input type="text" class="exp-title" value="${escapeAttr(exp.title)}" oninput="updatePreview()"/></div>
      <div class="form-group"><label>Company *</label>
        <input type="text" class="exp-company" value="${escapeAttr(exp.company)}" oninput="updatePreview()"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Start Date</label>
        <input type="text" class="exp-start" value="${escapeAttr(exp.start)}" oninput="updatePreview()"/></div>
      <div class="form-group"><label>End Date</label>
        <input type="text" class="exp-end" value="${escapeAttr(exp.end)}" oninput="updatePreview()"/></div>
    </div>
    <div class="form-group"><label>Location</label>
      <input type="text" class="exp-location" value="${escapeAttr(exp.location)}" oninput="updatePreview()"/></div>
    <div class="form-group"><label>Responsibilities & Achievements</label>
      <textarea class="exp-bullets" rows="4" oninput="updatePreview()">${escapeHtml(exp.bullets)}</textarea>
      <div class="form-hint">Start each line with • for bullet points.</div></div>
  `;
}

function buildEduEntryHTML(i, edu) {
  return `
    <div class="entry-header">
      <span class="entry-label">Degree ${i + 1}</span>
      <button class="entry-remove" onclick="removeEntry('education', ${i})"${i === 0 ? ' style="display:none"' : ''}>Remove</button>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Degree / Certificate *</label>
        <input type="text" class="edu-degree" value="${escapeAttr(edu.degree)}" oninput="updatePreview()"/></div>
      <div class="form-group"><label>Institution *</label>
        <input type="text" class="edu-school" value="${escapeAttr(edu.school)}" oninput="updatePreview()"/></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Graduation Year</label>
        <input type="text" class="edu-year" value="${escapeAttr(edu.year)}" oninput="updatePreview()"/></div>
      <div class="form-group"><label>GPA (optional)</label>
        <input type="text" class="edu-gpa" value="${escapeAttr(edu.gpa)}" oninput="updatePreview()"/></div>
    </div>
    <div class="form-group"><label>Honors / Coursework</label>
      <input type="text" class="edu-honors" value="${escapeAttr(edu.honors)}" oninput="updatePreview()"/></div>
  `;
}

// ── DOWNLOAD ──────────────────────────────────────
function downloadResume() {
  // Auto-save before download
  saveResume();

  // Use browser print for PDF generation
  const sheet = document.getElementById('resume-sheet');
  if (!sheet) return;

  // Reset zoom for print
  const prevTransform = sheet.style.transform;
  sheet.style.transform = 'none';

  // Create print window with just the resume
  const render = document.getElementById('resume-render');
  if (!render) return;

  // Collect all stylesheets
  const styles = Array.from(document.styleSheets)
    .map(s => {
      try { return Array.from(s.cssRules).map(r => r.cssText).join('\n'); }
      catch { return ''; }
    }).join('\n');

  const printWindow = window.open('', '_blank', 'width=900,height=1100');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8"/>
      <title>Resume — ResumeIQ</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; background: #fff; }
        @page { margin: 0; size: A4; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        ${styles}
        .resume-render { padding: 48px 52px !important; }
      </style>
    </head>
    <body>
      ${render.outerHTML}
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() { window.close(); };
        };
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();

  sheet.style.transform = prevTransform;
}

// ── HELPERS ───────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
