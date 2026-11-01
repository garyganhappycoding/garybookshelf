// The two kinds of speaking question students can practise. Safe to import in the browser and on the server.
//   Part 2: individual long turn on a cue card, 1 minute.
//   Part 3: discussion question (give and justify an opinion), 2 minutes.
export type Part = 2 | 3;

export const PART_INFO: Record<Part, { name: string; short: string; speakSeconds: number; maxSeconds: number; minWords: number }> = {
  2: { name: "Part 2 · Individual long turn", short: "Part 2", speakSeconds: 60, maxSeconds: 75, minWords: 15 },
  3: { name: "Part 3 · Discussion", short: "Part 3", speakSeconds: 120, maxSeconds: 150, minWords: 25 },
};

export const toPart = (v: unknown): Part => (String(v) === "3" ? 3 : 2);

// What a good Part 3 answer does (used as the checklist the AI ticks off, like the bullets on a Part 2 card).
export const PART3_CHECKLIST = [
  "Gives a clear opinion that answers the question",
  "Gives at least two reasons for the opinion",
  "Supports a reason with an example from real life",
  "Thinks about the other side or a different view",
];
