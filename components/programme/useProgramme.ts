"use client";
import { useEffect, useState } from "react";
import { DEFAULT_EXAMS, type Exam } from "@/lib/programme/calendar";

// Preview only: state and exam dates live in this browser. The real build stores them per student in Supabase.
const STATE_KEY = "pnds-state-v1";
const EXAM_KEY = "pnds-exams-v1";

function read<T>(k: string, fallback: T): T {
  try { const raw = localStorage.getItem(k); if (raw) return JSON.parse(raw) as T; } catch {}
  return fallback;
}
function write(k: string, v: unknown) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
}

export function useProgramme() {
  const [stateId, setStateId] = useState("KL");
  const [exams, setExams] = useState<Exam[]>(DEFAULT_EXAMS);
  useEffect(() => {
    setStateId(read(STATE_KEY, "KL"));
    setExams(read(EXAM_KEY, DEFAULT_EXAMS));
  }, []);
  return {
    stateId, exams,
    saveState: (s: string) => { setStateId(s); write(STATE_KEY, s); },
    saveExams: (e: Exam[]) => { setExams(e); write(EXAM_KEY, e); },
    resetExams: () => { setExams(DEFAULT_EXAMS); write(EXAM_KEY, DEFAULT_EXAMS); },
  };
}
