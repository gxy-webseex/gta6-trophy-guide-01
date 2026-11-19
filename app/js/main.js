// Bootstrap the guide: load the trophies, wire the filters, the spoiler
// setting, the saved progress and the export/import/reset buttons, then render.
import { loadTrophies } from './data.js';
import { createProgressStore } from './store.js';
import {
  renderProgress,
  renderMissableCallout,
  renderRoadmap,
  renderTrophyList,
} from './ui.js';

const store = createProgressStore();
let trophies = [];
let openId = null;

const filters = {
  search: '',
  grade: 'all',
  kind: 'all',
  earned: 'all',
  missableOnly: false,
  spoiler: true,
};

function readFiltersFromControls() {
  filters.search = document.getElementById('search').value.trim().toLowerCase();
  filters.grade = document.getElementById('grade').value;
  filters.kind = document.getElementById('kind').value;
  filters.earned = document.getElementById('earned-filter').value;
  filters.missableOnly = document.getElementById('missable-only').checked;
  filters.spoiler = document.getElementById('spoiler').checked;
}

function renderAll() {
  renderProgress(trophies, store);
  renderRoadmap(trophies, store);
  renderTrophyList(trophies, store, filters, openId);
}

function applyHash() {
  const hash = location.hash;
  const trophyMatch = hash.match(/^#trophy-(\d+)$/);
  if (trophyMatch) {
    openId = Number(trophyMatch[1]);
    renderTrophyList(trophies, store, filters, openId);
    document.getElementById(`trophy-${openId}`)?.scrollIntoView({ block: 'center' });
    return;
  }
  if (hash === '#roadmap') {
    document.getElementById('roadmap')?.scrollIntoView();
  }
}

function download(filename, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function start() {
  trophies = await loadTrophies();
  renderMissableCallout(trophies);

  document.getElementById('search').addEventListener('input', () => {
    readFiltersFromControls();
    renderTrophyList(trophies, store, filters, openId);
  });
  for (const id of ['grade', 'kind', 'earned-filter', 'missable-only', 'spoiler']) {
    document.getElementById(id).addEventListener('change', () => {
      readFiltersFromControls();
      renderTrophyList(trophies, store, filters, openId);
    });
  }
  document.getElementById('export').addEventListener('click', () => {
    download('gta6-trophy-progress.json', store.exportJson());
  });
  document.getElementById('import').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      store.importJson(await file.text());
      renderAll();
    } catch {
      alert('That file is not a trophy-progress export.');
    }
    event.target.value = '';
  });
  document.getElementById('reset').addEventListener('click', () => {
    if (confirm('Clear every tick on this checklist?')) {
      store.reset();
      renderAll();
    }
  });
  // A tick changes the progress bar and the roadmap counts; when the
  // earned/remaining filter is on, the list itself changes too.
  document.addEventListener('progress-changed', () => {
    if (filters.earned === 'all') {
      renderProgress(trophies, store);
      renderRoadmap(trophies, store);
      document
        .querySelectorAll('.trophy')
        .forEach((card) => {
          const id = Number(card.id.replace('trophy-', ''));
          card.classList.toggle('earned', store.isEarned(id));
        });
    } else {
      renderAll();
    }
  });
  window.addEventListener('hashchange', applyHash);

  renderAll();
  applyHash();
}

start().catch((error) => {
  document.getElementById('trophy-list').textContent =
    `Could not load the trophy list: ${error.message}`;
});
