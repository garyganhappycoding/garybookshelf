// Placeholder daily content. The real questions, answers and explanations are still to be written with Gary.
// Everything that shows a day's task reads it from here, so replacing this one file replaces the content.
import { parse, type Calendar } from "./calendar";

export type Lang = "BM" | "BI";
export type DayTask = { title: string; instructions: string; minutes: number };

export function taskFor(cal: Calendar, day: string, lang: Lang): DayTask | null {
  const d = parse(day);
  if (!cal.weekOf(d)) return null;
  const base = cal.tasks[d.getDay()];
  return { title: base[0], instructions: `${base[1]}（${lang}）`, minutes: 20 };
}

// A student may open any day that has already started (Malaysia time). Future days are never sent.
export const opened = (day: string, today: string) => day <= today;
export const todayMY = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });
