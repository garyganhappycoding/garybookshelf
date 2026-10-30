// Browser-only helpers: remember, on this phone or laptop, which questions the student asked, so they can find Gary's
// replies later without keeping a link. (The private link is the key; it is only ever stored in this browser.)
const KEY = "gb_threads";

export function getThreads(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((t) => typeof t === "string" && /^[0-9a-f]{32}$/.test(t)).slice(0, 20) : [];
  } catch {
    return [];
  }
}

export function addThread(token: string) {
  try {
    const list = getThreads().filter((t) => t !== token);
    localStorage.setItem(KEY, JSON.stringify([token, ...list].slice(0, 20)));
  } catch {
    /* private mode or storage blocked: the tracking link still works */
  }
}

export function getSeen(token: string): string {
  try {
    return localStorage.getItem(`gb_seen_${token}`) ?? "";
  } catch {
    return "";
  }
}

export function markSeen(token: string, iso: string) {
  try {
    localStorage.setItem(`gb_seen_${token}`, iso);
  } catch {
    /* ignore */
  }
}

// "https://.../track/<token>" or just the token
export function tokenFromText(text: string): string | null {
  const m = text.match(/[0-9a-f]{32}/i);
  return m ? m[0].toLowerCase() : null;
}
