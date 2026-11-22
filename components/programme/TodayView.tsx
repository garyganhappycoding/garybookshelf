"use client";
import { useState } from "react";
import { DEMO_TODAY, buildCalendar, cn, levelOf, parse, themeOf, WEEKDAY_ZH } from "@/lib/programme/calendar";
import { useProgramme } from "./useProgramme";

type Lang = "BM" | "BI";
const MINUTES: Record<Lang, string> = { BM: "约 20 分钟", BI: "约 20 分钟" };

// Sample classmates. Real build: loaded only after the student has submitted their own answer.
const SAMPLE_POSTS = [
  { who: "薯片", text: "我用 'sustainable' 造句：Recycling is a sustainable habit.", me: false },
  { who: "星星", text: "第 3 个词我不确定用法，有人知道吗？", me: false },
];

export default function TodayView() {
  const { stateId } = useProgramme();
  const cal = buildCalendar(stateId);
  const d = parse(DEMO_TODAY), wk = cal.weekOf(d), task = cal.tasks[d.getDay()];
  const [lang, setLang] = useState<Lang>("BM");
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reported, setReported] = useState(false);
  const [note, setNote] = useState("");
  const [posts, setPosts] = useState(SAMPLE_POSTS);
  const [comment, setComment] = useState("");
  const [warn, setWarn] = useState("");

  // Same rules the real filter will apply: no links, phone numbers, emails or @handles.
  const bad = (t: string) => /https?:\/\/|www\.|\.com\b|@\w|\b\d{8,}\b|\d{3}[- ]?\d{7,}/i.test(t);
  const send = () => {
    if (!comment.trim()) return;
    if (bad(comment)) { setWarn("留言里不能有链接、电话、邮箱或 @账号。"); return; }
    setWarn("");
    setPosts([...posts, { who: "我", text: comment.trim(), me: true }]);
    setComment("");
  };

  return (
    <div>
      <p className="text-sm text-ink/60">{cn(d)} 星期{WEEKDAY_ZH[d.getDay()]}（示范日期）</p>
      <h1 className="text-2xl font-medium mb-1">今天</h1>
      <p className="text-sm text-ink/60 mb-4">第 {wk} 周 · {themeOf(wk)} · {levelOf(wk)}</p>

      <div role="tablist" className="flex gap-2 mb-4">
        {(["BM", "BI"] as Lang[]).map((l) => (
          <button key={l} role="tab" aria-selected={lang === l} type="button" onClick={() => setLang(l)}
            className={lang === l ? "btn-primary text-sm" : "btn-secondary text-sm"}>{l}</button>
        ))}
      </div>

      <div className="card mb-4">
        <p className="text-xs text-ink/60 mb-1">{lang} · 预计时间 {MINUTES[lang]}</p>
        <p>{task[0]}：{task[1]}</p>
        <p className="text-sm text-ink/60 mt-2">（示范：真实网站会在这里放今天的词汇表和题目。）</p>
      </div>

      <div className="card mb-4">
        <p className="font-medium mb-2">我的答案</p>
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={submitted} rows={5}
          aria-label="我的答案" placeholder="写在这里，交上去之后才看得到同学的"
          className="w-full rounded-lg border border-ink/20 bg-white p-3 text-sm disabled:opacity-60" />
        {!submitted ? (
          <button type="button" disabled={!answer.trim()} onClick={() => setSubmitted(true)} className="btn-primary mt-3 text-sm disabled:opacity-40">
            交上去，然后看同学的
          </button>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="rounded-lg bg-sage-400/20 p-3 text-sm">
              <p className="font-medium mb-1">AI 反馈（示范）</p>
              <p>你的句子意思清楚。下一步可以把句子再写长一点，用上一个连接词。</p>
            </div>
            {!reported ? (
              <div>
                <p className="text-sm text-ink/70 mb-1">觉得 AI 的反馈不对或不好？告诉 Gary：</p>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} aria-label="告诉 Gary"
                  className="w-full rounded-lg border border-ink/20 bg-white p-2 text-sm" />
                <button type="button" onClick={() => setReported(true)} className="btn-secondary mt-2 text-sm">告诉 Gary</button>
              </div>
            ) : (
              <p className="text-sm text-ink/70">已经告诉 Gary 了。（真实网站：Gary 会收到通知。）</p>
            )}
          </div>
        )}
      </div>

      <div className="card">
        <p className="font-medium mb-2">同学讨论</p>
        {!submitted ? (
          <p className="text-sm text-ink/60">先交上你自己的答案，才看得到同学的。</p>
        ) : (
          <>
            <ul className="space-y-2 mb-3">
              {posts.map((p, i) => (
                <li key={i} className={`rounded-lg p-3 text-sm ${p.me ? "bg-clay-400/15" : "bg-ink/5"}`}>
                  <span className="font-medium">{p.who}</span>：{p.text}
                  {!p.me && <button type="button" className="ml-2 text-xs text-ink/50 underline">举报</button>}
                </li>
              ))}
            </ul>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} aria-label="写留言"
              placeholder="写下你今天怎么做的，或问同学一个问题"
              className="w-full rounded-lg border border-ink/20 bg-white p-2 text-sm" />
            {warn && <p className="text-sm text-red-700 mt-1" role="alert">{warn}</p>}
            <button type="button" onClick={send} className="btn-secondary mt-2 text-sm">留言</button>
            <p className="text-xs text-ink/50 mt-2">只用昵称，不留联系方式，不贴链接。AI 没把握的留言，会等 Gary 来看。</p>
          </>
        )}
      </div>
    </div>
  );
}
