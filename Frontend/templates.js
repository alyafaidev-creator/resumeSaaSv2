/* ═══════════════════════════════════════════════
   TEMPLATE LIBRARY — templates.js
   ═══════════════════════════════════════════════ */

// Template metadata — maps id → display info
const TEMPLATE_META = {
  'se-1': { name: 'Clean Dev',         industry: 'Software Engineering', layout: 'single',  color: 'blue'   },
  'se-2': { name: 'Tech Stack',        industry: 'Software Engineering', layout: 'single',  color: 'teal'   },
  'se-3': { name: 'Open Source',       industry: 'Software Engineering', layout: 'single',  color: 'blue'   },
  'se-4': { name: 'Full Stack',        industry: 'Software Engineering', layout: 'single',  color: 'blue'   },
  'se-5': { name: 'Minimal Dev',       industry: 'Software Engineering', layout: 'single',  color: 'blue'   },
  'se-6': { name: 'Senior Engineer',   industry: 'Software Engineering', layout: 'two-col', color: 'blue'   },

  'mk-1': { name: 'Brand Voice',       industry: 'Marketing',            layout: 'two-col', color: 'purple' },
  'mk-2': { name: 'Campaign Pro',      industry: 'Marketing',            layout: 'two-col', color: 'purple' },
  'mk-3': { name: 'Growth Lead',       industry: 'Marketing',            layout: 'single',  color: 'purple' },
  'mk-4': { name: 'Digital Marketer',  industry: 'Marketing',            layout: 'two-col', color: 'purple' },

  'fi-1': { name: 'Capital',           industry: 'Finance',              layout: 'two-col', color: 'navy'   },
  'fi-2': { name: 'Analyst Pro',       industry: 'Finance',              layout: 'single',  color: 'navy'   },
  'fi-3': { name: 'Portfolio',         industry: 'Finance',              layout: 'two-col', color: 'navy'   },
  'fi-4': { name: 'Investment Banker', industry: 'Finance',              layout: 'single',  color: 'navy'   },

  'bz-1': { name: 'Executive',         industry: 'Business',             layout: 'two-col', color: 'slate'  },
  'bz-2': { name: 'Corporate',         industry: 'Business',             layout: 'single',  color: 'slate'  },
  'bz-3': { name: 'Leadership',        industry: 'Business',             layout: 'two-col', color: 'slate'  },

  'hc-1': { name: 'Clinical',          industry: 'Healthcare',           layout: 'single',  color: 'green'  },
  'hc-2': { name: 'Patient First',     industry: 'Healthcare',           layout: 'single',  color: 'green'  },
  'hc-3': { name: 'MedPro',            industry: 'Healthcare',           layout: 'single',  color: 'green'  },

  'ar-1': { name: 'Blueprint',         industry: 'Architecture',         layout: 'sidebar', color: 'amber'  },
  'ar-2': { name: 'Studio',            industry: 'Architecture',         layout: 'sidebar', color: 'amber'  },
  'ar-3': { name: 'Structural',        industry: 'Architecture',         layout: 'sidebar', color: 'amber'  },

  'ds-1': { name: 'Canvas',            industry: 'Design',               layout: 'sidebar', color: 'pink'   },
  'ds-2': { name: 'UX Portfolio',      industry: 'Design',               layout: 'sidebar', color: 'pink'   },
  'ds-3': { name: 'Artboard',          industry: 'Design',               layout: 'sidebar', color: 'pink'   },

  'ad-1': { name: 'Office Pro',        industry: 'Administrative',       layout: 'single',  color: 'blue'   },
  'ad-2': { name: 'Executive Asst.',   industry: 'Administrative',       layout: 'single',  color: 'blue'   },
  'ad-3': { name: 'Operations',        industry: 'Administrative',       layout: 'single',  color: 'blue'   },

  'ac-1': { name: 'Spotlight',         industry: 'Acting / Creative',    layout: 'sidebar', color: 'red'    },
  'ac-2': { name: 'Stage Ready',       industry: 'Acting / Creative',    layout: 'single',  color: 'red'    },
  'ac-3': { name: 'Talent',            industry: 'Acting / Creative',    layout: 'single',  color: 'red'    },

  'ed-1': { name: 'Academic',          industry: 'Education',            layout: 'single',  color: 'indigo' },
  'ed-2': { name: 'Scholar',           industry: 'Education',            layout: 'single',  color: 'indigo' },
  'ed-3': { name: 'Educator',          industry: 'Education',            layout: 'two-col', color: 'indigo' },
};

// ── FILTER LOGIC ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterIndustry(btn.dataset.filter);
    });
  });

  // Load selected template from URL param (e.g. coming back from editor)
  const params = new URLSearchParams(window.location.search);
  const highlight = params.get('highlight');
  if (highlight) highlightCard(highlight);
});

function filterIndustry(filter) {
  const sections = document.querySelectorAll('.industry-section');
  sections.forEach(section => {
    if (filter === 'all' || section.dataset.industry === filter) {
      section.classList.remove('hidden');
      // Re-trigger reveal animation
      section.classList.remove('in');
      requestAnimationFrame(() => section.classList.add('in'));
    } else {
      section.classList.add('hidden');
    }
  });
}

// ── SELECT & USE TEMPLATE ─────────────────────────
function useTemplate(id) {
  const meta = TEMPLATE_META[id];
  if (!meta) return;

  // Store template selection in sessionStorage
  sessionStorage.setItem('selectedTemplate', JSON.stringify({
    id,
    name: meta.name,
    industry: meta.industry,
    layout: meta.layout,
    color: meta.color,
  }));

  // Visual feedback — mark card as selected
  document.querySelectorAll('.tpl-card').forEach(c => c.classList.remove('selected'));
  const card = document.querySelector(`.tpl-card[data-id="${id}"]`);
  if (card) card.classList.add('selected');

  // Transition to editor
  showTransition(meta.name, () => {
    window.location.href = 'editor.html';
  });
}

function showTransition(templateName, callback) {
  const overlay = document.createElement('div');
  overlay.className = 'loading-overlay';
  overlay.innerHTML = `
    <div class="loading-box">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading <strong>${templateName}</strong>...</div>
    </div>
  `;

  // Inject overlay styles inline
  const style = document.createElement('style');
  style.textContent = `
    .loading-overlay {
      position: fixed; inset: 0; background: rgba(255,255,255,0.92);
      backdrop-filter: blur(8px); z-index: 200;
      display: flex; align-items: center; justify-content: center;
      animation: fadeInOverlay 0.2s ease;
    }
    @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
    .loading-box { text-align: center; }
    .loading-spinner {
      width: 36px; height: 36px;
      border: 3px solid #E5E7EB;
      border-top-color: #2563EB;
      border-radius: 50%;
      margin: 0 auto 1rem;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-text { font-size: 0.9rem; color: #374151; font-family: 'Inter', sans-serif; }
    .loading-text strong { color: #111318; }
  `;
  document.head.appendChild(style);
  document.body.appendChild(overlay);

  setTimeout(callback, 800);
}

// ── PREVIEW MODAL ─────────────────────────────────
let currentPreviewId = null;

function previewTemplate(id) {
  const meta = TEMPLATE_META[id];
  if (!meta) return;

  currentPreviewId = id;
  const modal = document.getElementById('preview-modal');
  const content = document.getElementById('modal-preview-content');
  const nameEl = document.getElementById('modal-template-name');
  const useBtn = document.getElementById('modal-use-btn');

  // Clone the card's preview element into the modal
  const card = document.querySelector(`.tpl-card[data-id="${id}"]`);
  if (card) {
    const previewEl = card.querySelector('.tpl-preview');
    if (previewEl) {
      const clone = previewEl.cloneNode(true);
      clone.style.height = '360px';
      clone.style.width = '100%';
      clone.style.borderRadius = '8px';
      clone.style.border = '1px solid #E5E7EB';
      content.innerHTML = '';
      content.appendChild(clone);
    }
  }

  nameEl.textContent = `${meta.name} — ${meta.industry}`;
  useBtn.onclick = () => { closeModal(); useTemplate(id); };

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('preview-modal') && !e.target.closest('.modal-close')) return;
  const modal = document.getElementById('preview-modal');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  currentPreviewId = null;
}

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal({ target: document.getElementById('preview-modal') });
});

// ── HIGHLIGHT CARD (from URL param) ──────────────
function highlightCard(id) {
  const card = document.querySelector(`.tpl-card[data-id="${id}"]`);
  if (card) {
    card.classList.add('selected');
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
