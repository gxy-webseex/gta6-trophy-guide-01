// Load the trophy data: the official 55 names, descriptions and grades plus our
// own guides, kinds, missable flags and roadmap stages (app/data/trophies.json).
export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('could not load data/trophies.json');
  const doc = await response.json();
  return doc.trophies;
}

// The five roadmap stages, in the order to play them. Each stage names the
// trophies it holds by id; the guide text here is the stage's own summary.
export const STAGES = [
  {
    stage: 1,
    title: 'Play the story',
    hours: '60–80 hours',
    blurb:
      'Chapters 1–4 and the finale, plus the named story missions. Grab the Chapter 1 meditation the first time it is offered — it is the one trophy that can be missed.',
  },
  {
    stage: 2,
    title: 'One-time moments',
    hours: 'during the story',
    blurb:
      'The partner trophies, the choice trophy and the one-off stunts. Do them when the moment appears: your partner must be beside you, and there is no mission replay.',
  },
  {
    stage: 3,
    title: 'Strangers & side missions',
    hours: 'about 10 hours',
    blurb:
      'The 8 stranger strands and their finales, plus Bret’s unique-animal hunt. Stranger missions stay open in free roam after the story.',
  },
  {
    stage: 4,
    title: 'Collectibles & activities',
    hours: 'the big counts',
    blurb:
      '250 stunts, 42 shooting-range golds, 14 drone-race locations, 100 WAiNK spots, 52 areas, 9 gangs, 8 garages, 100 vehicles and the rest. Do these in free roam.',
  },
  {
    stage: 5,
    title: 'Cleanup — 100% & platinum',
    hours: 'about 100 hours',
    blurb:
      'The 100% Completion checklist appears after the story (Progress > Stats > 100% Completion). Finish it and the platinum pops on the last trophy.',
  },
];

export function stageOf(trophy) {
  return STAGES.find((s) => s.stage === trophy.stage) ?? STAGES[0];
}
