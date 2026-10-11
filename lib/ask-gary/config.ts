// Questions each student can ask per day. Change it with ASK_GARY_DAILY_LIMIT in .env.local / Vercel (default 5). Admins are unlimited.
export const DAILY_LIMIT = Number(process.env.ASK_GARY_DAILY_LIMIT) > 0 ? Number(process.env.ASK_GARY_DAILY_LIMIT) : 5;

// Master switch. Ask Gary is PAUSED for members unless ASK_GARY_OPEN=true is set (admins can always use it).
export const ASK_GARY_OPEN = process.env.ASK_GARY_OPEN === "true";
