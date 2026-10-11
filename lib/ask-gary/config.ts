// Questions each student can ask per day. Change it with ASK_GARY_DAILY_LIMIT in .env.local / Vercel (default 5). Admins are unlimited.
export const DAILY_LIMIT = Number(process.env.ASK_GARY_DAILY_LIMIT) > 0 ? Number(process.env.ASK_GARY_DAILY_LIMIT) : 5;
