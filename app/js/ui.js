// Render the guide: progress bar, missable callout, roadmap stages, and the
// trophy checklist with its filters, spoiler setting and expandable guides.
import { STAGES, stageOf } from './data.js';

const MISSABLE_REASONS = {
  28: 'The first meditation (Jason’s house, Chapter 1) becomes unavailable after that chapter — do it the first time it is offered.',
  33: 'Your partner must be beside you when you lose the 4-star wanted level.',
  34: 'Your partner must be beside you, and the wanted level must stay alive across all 3 shops.',
  48: 'A story choice — and there is no mission replay, so make it when it appears.',
};

const KIND_LABELS = {
  story: 'Story',
  mission: 'Mission',
  collectible: 'Collectible',
  activity: 'Activity',
  platinum: 'Platinum',
  online: 'Online',
};

const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

export function trophyMatches(trophy, filters, earned) {
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
  if (filters.missableOnly && !trophy.missable) return false;
  if (filters.earned === 'earned' && !earned) return false;
  if (filters.earned === 'remaining' && earned) return false;
  if (filters.search) {
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind}`.toLowerCase();
    if (!hay.includes(filters.search)) return false;
  }
  return true;
}

export function renderProgress(trophies, store) {
  const earned = store.earnedCount();
  const total = trophies.length;
  const pct = Math.round((earned / total) * 100);
  document.getElementById('progress-count').textContent = `${earned} of ${total} earned`;
  document.getElementById('progress-pct').textContent = `${pct}% to platinum`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] ?? { total: 0, earned: 0 };
    byGrade[t.grade].total += 1;
    if (store.isEarned(t.id)) byGrade[t.grade].earned += 1;
  }
  document.getElementById('grades-line').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${GRADE_LABELS[g]} ${byGrade[g].earned}/${byGrade[g].total}`)
    .join(' · ');
}

export function renderMissableCallout(trophies) {
  const list = document.getElementById('missable-list');
  list.replaceChildren();
  for (const t of trophies.filter((x) => x.missable)) {
    const li = document.createElement('li');
    const name = document.createElement('b');
    name.textContent = t.name;
    li.append(name, document.createTextNode(` — ${MISSABLE_REASONS[t.id] ?? t.description}`));
    list.append(li);
  }
}

export function renderRoadmap(trophies, store) {
  const ol = document.getElementById('roadmap-stages');
  ol.replaceChildren();
  for (const stage of STAGES) {
    const members = trophies.filter((t) => t.stage === stage.stage);
    const earned = members.filter((t) => store.isEarned(t.id)).length;
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = `Stage ${stage.stage}`;
    h3.append(num, document.createTextNode(stage.title));
    const meta = document.createElement('p');
    meta.className = 'stage-meta';
    meta.textContent = `${stage.hours} · ${earned} of ${members.length} earned`;
    const blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    const names = document.createElement('p');
    names.className = 'stage-trophies';
    members.forEach((t, i) => {
      if (i > 0) names.append(document.createTextNode(' · '));
      const a = document.createElement('a');
      a.href = `#trophy-${t.id}`;
      a.textContent = t.name;
      names.append(a);
    });
    li.append(h3, meta, blurb, names);
    ol.append(li);
  }
}

function buildTrophyCard(trophy, store, spoilerOn, open) {
  const earned = store.isEarned(trophy.id);
  const spoiled = spoilerOn && trophy.hidden && !earned;
  const card = document.createElement('article');
  card.className = `trophy${earned ? ' earned' : ''}${spoiled ? ' spoiled' : ''}`;
  card.id = `trophy-${trophy.id}`;

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Mark ${spoiled ? 'hidden trophy' : trophy.name} as earned`);
  box.addEventListener('change', () => {
    store.toggle(trophy.id, box.checked);
    document.dispatchEvent(new CustomEvent('progress-changed'));
  });
  const main = document.createElement('div');
  main.className = 'trophy-main';
  const name = document.createElement('div');
  name.className = 'trophy-name';
  name.textContent = spoiled ? 'Hidden trophy' : trophy.name;
  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  desc.textContent = spoiled
    ? 'A hidden story trophy — earn it to reveal its name and description.'
    : trophy.description;
  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  const gradeTag = document.createElement('span');
  gradeTag.className = `tag grade-${trophy.grade}`;
  gradeTag.textContent = GRADE_LABELS[trophy.grade];
  tags.append(gradeTag);
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  tags.append(kindTag);
  if (trophy.missable) {
    const m = document.createElement('span');
    m.className = 'tag missable';
    m.textContent = '⚠ Missable';
    tags.append(m);
  }
  if (trophy.hidden) {
    const h = document.createElement('span');
    h.className = 'tag hidden-tag';
    h.textContent = 'Hidden on PS5';
    tags.append(h);
  }
  const stageTag = document.createElement('span');
  stageTag.className = 'tag';
  stageTag.textContent = `Stage ${trophy.stage} · ${stageOf(trophy).title}`;
  tags.append(stageTag);
  main.append(name, desc, tags);
  head.append(box, main);

  if (!spoiled) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'guide-toggle';
    toggle.textContent = open ? 'Hide guide' : 'Show guide';
    toggle.addEventListener('click', () => {
      const guide = card.querySelector('.trophy-guide');
      const showing = guide.hidden;
      guide.hidden = !showing;
      toggle.textContent = showing ? 'Hide guide' : 'Show guide';
    });
    head.append(toggle);
  }
  card.append(head);

  if (!spoiled) {
    const guide = document.createElement('div');
    guide.className = 'trophy-guide';
    guide.hidden = !open;
    const text = document.createElement('p');
    text.textContent = trophy.guide;
    guide.append(text);
    const sources = document.createElement('p');
    sources.className = 'sources';
    sources.append(document.createTextNode('Sources: '));
    trophy.sources.forEach((s, i) => {
      if (i > 0) sources.append(document.createTextNode(' · '));
      if (s.url) {
        const a = document.createElement('a');
        a.href = s.url;
        a.rel = 'noopener';
        a.textContent = s.name;
        sources.append(a);
      } else {
        sources.append(document.createTextNode(s.name));
      }
    });
    guide.append(sources);
    card.append(guide);
  }
  return card;
}

export function renderTrophyList(trophies, store, filters, openId) {
  const list = document.getElementById('trophy-list');
  list.replaceChildren();
  const shown = trophies.filter((t) => trophyMatches(t, filters, store.isEarned(t.id)));
  for (const t of shown) {
    list.append(buildTrophyCard(t, store, filters.spoiler, openId === t.id));
  }
  document.getElementById('shown-count').textContent =
    `${shown.length} of ${trophies.length} shown`;
  const empty = document.getElementById('empty-note');
  if (shown.length === 0) {
    empty.hidden = false;
    empty.textContent =
      filters.kind === 'online'
        ? 'GTA VI has no online trophies — all 55 are earned in single-player.'
        : 'No trophies match these filters.';
  } else {
    empty.hidden = true;
  }
}
