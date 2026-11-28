"use client";
import { useActionState } from "react";
import { betaFeedbackAction, type BetaResult } from "@/app/programme/today/beta-feedback";

export type BetaFeedbackValues = { time_spent: string | null; ai_helpful: string | null; ai_why: string | null; stuck: string | null; change: string | null };
const init: BetaResult = {};

const TIMES: [string, string][] = [["lt10", "少过 10 分钟"], ["10to20", "10 到 20 分钟"], ["20to30", "20 到 30 分钟"], ["gt30", "超过 30 分钟"]];
const HELPFUL: [string, string][] = [["yes", "有帮助"], ["ok", "一般"], ["no", "没有帮助"]];

// The beta testers' daily feedback box. It sits under the day's task; it can be sent again the same day to change the answer.
export default function BetaFeedback({ day, submitted, saved }: { day: string; submitted: boolean; saved: BetaFeedbackValues | null }) {
  const [state, action, pending] = useActionState(betaFeedbackAction, init);
  const radio = "flex min-h-11 items-center gap-2 rounded-xl border border-ink/15 bg-white px-3 text-sm has-[:checked]:border-clay-600 has-[:checked]:bg-clay-400/15";
  const text = "w-full rounded-lg border border-ink/20 bg-white p-2 text-sm";
  if (!submitted) {
    return (
      <div className="card mt-4">
        <p className="font-medium">今日反馈（内测）</p>
        <p className="mt-1 text-sm text-ink/60">做完并交上今天的作业之后，这里会出现一个很短的反馈表。每天 2 分钟，帮我把这个功课变得更好。</p>
      </div>
    );
  }
  return (
    <form action={action} className="card mt-4 space-y-4">
      <input type="hidden" name="day" value={day} />
      <div>
        <p className="font-medium">今日反馈（内测）</p>
        <p className="mt-1 text-sm text-ink/70">每天 2 分钟就好。请<b>写得具体</b>：哪一步、你以为会怎样、结果怎样。
          「不错」对我帮助不大；「第 3 步我不知道要写几个字」对我帮助很大。{saved ? " 你今天已经交过了，可以修改再送出。" : ""}</p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">1. 今天一共用了多久？</legend>
        <div className="flex flex-wrap gap-2">
          {TIMES.map(([v, l]) => <label key={v} className={radio}><input type="radio" name="time_spent" value={v} defaultChecked={saved?.time_spent === v} className="accent-clay-600" />{l}</label>)}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">2. AI 给你的反馈，有帮到你吗？</legend>
        <div className="flex flex-wrap gap-2">
          {HELPFUL.map(([v, l]) => <label key={v} className={radio}><input type="radio" name="ai_helpful" value={v} defaultChecked={saved?.ai_helpful === v} className="accent-clay-600" />{l}</label>)}
        </div>
        <label className="mt-2 block text-sm text-ink/70">哪一句有用，或哪一句不对、太笼统？（可以复制那一句）
          <textarea name="ai_why" rows={2} defaultValue={saved?.ai_why ?? ""} className={`${text} mt-1`} />
        </label>
      </fieldset>

      <label className="block text-sm font-medium">3. 哪一步你看不懂，或者卡住了？
        <span className="block text-xs font-normal text-ink/60">说是哪一页、哪一步，你本来以为是什么意思。</span>
        <textarea name="stuck" rows={3} defaultValue={saved?.stuck ?? ""} className={`${text} mt-1 font-normal`} />
      </label>

      <label className="block text-sm font-medium">4. 如果我只能改一件事，你想我改什么？
        <span className="block text-xs font-normal text-ink/60">一件就好，说清楚为什么。</span>
        <textarea name="change" rows={3} defaultValue={saved?.change ?? ""} className={`${text} mt-1 font-normal`} />
      </label>

      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.ok && <p role="status" className="text-sm text-sage-600">谢谢你！我已经收到了，我会看。</p>}
      <button disabled={pending} className="btn-primary min-h-11 text-sm">{pending ? "送出中…" : saved || state.ok ? "更新今日反馈" : "送出今日反馈"}</button>
    </form>
  );
}
