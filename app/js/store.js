// Progress store: which trophies are earned, saved in localStorage, with
// export to a file, import from a file, and reset. Nothing leaves the browser.
const KEY = 'gta6-trophy-guide-progress-v1';

export function createProgressStore() {
  let earned = new Set(readStoredIds());

  function readStoredIds() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const ids = JSON.parse(raw);
      return Array.isArray(ids) ? ids.filter((n) => Number.isInteger(n)) : [];
    } catch {
      return [];
    }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  }

  return {
    isEarned(id) {
      return earned.has(id);
    },
    earnedCount() {
      return earned.size;
    },
    earnedIds() {
      return [...earned].sort((a, b) => a - b);
    },
    toggle(id, on) {
      if (on) earned.add(id);
      else earned.delete(id);
      save();
    },
    exportJson() {
      return JSON.stringify({ game: 'Grand Theft Auto VI', earned: this.earnedIds() }, null, 2);
    },
    importJson(text) {
      const doc = JSON.parse(text);
      const ids = Array.isArray(doc) ? doc : doc.earned;
      if (!Array.isArray(ids)) throw new Error('no trophy list in file');
      earned = new Set(ids.filter((n) => Number.isInteger(n)));
      save();
    },
    reset() {
      earned = new Set();
      save();
    },
  };
}
