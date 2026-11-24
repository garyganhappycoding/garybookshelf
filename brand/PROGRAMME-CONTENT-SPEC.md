# 陪你读书 · how to extract one week of content

Used by the extraction agents and by overnight runs. One JSON file per week and language, written to
`lib/programme/content/raw/<form>/<lang>-w<NN>.json` (form = `f4` or `f5`, lang = `bi` or `bm`, NN = two digits, e.g. `f4/bi-w07.json`). Form 4 and Form 5 have SEPARATE content (Gary, 24 Nov 2026); Form 5 started as a copy of Form 4. After editing run `node scripts/build-content.mjs`.

## Hard rules
- Read-only on Google Drive (Drive MCP: search_files, read_file_content). Never move, rename, edit or trash anything.
- Copy text EXACTLY from Gary's documents. Never write, translate, fix or "improve" an essay, a sentence, a word or a Chinese meaning. If something is not in a document, leave it `null` or add a line to `gaps`. Never invent.
- Strip Markdown noise (`**`, `\-`, escape backslashes) but keep the words.
- Use only the "Exam Version" of an essay when a doc has Exam Version and Extended Version.

## Output shape (`WeekData`)
```json
{
  "n": 1, "lang": "bi",
  "theme": "Technology",
  "level": "B2",
  "essayTitle": "Smartphones: Friend or Foe?",
  "source": "SBP 2026 · Paper 2 · Part 3 Q3 · Article, 200–250 words",
  "essayUrl": "https://docs.google.com/document/d/…/edit",
  "paragraphs": ["body paragraph 1", "body paragraph 2"],
  "points": [{"code": "C1", "text": "State a technology commonly used by teenagers (one technology)"}],
  "openingIdx": [0],
  "keyPoint": {"idx": 2, "prompt": "Explain the benefits: benefit 1"},
  "closingIdx": [4],
  "words": [{"word": "…", "zh": "…", "example": "…or null"}],
  "goodPhrases": [{"phrase": "…", "zh": "…"}],
  "gaps": ["words that have no example sentence", "anything missing"]
}
```
- `paragraphs`: the essay body only (not the title or the "By:" line), one string per paragraph, in order. Put `essayTitle` separately.
- `points`: the question's content points if the doc has a "Question Analysis" table (code + the "Note from question" text). `[]` if there is none (Malay essays).
- `openingIdx`: index or indexes (into `paragraphs`) of the opening. `closingIdx`: of the conclusion.
- `keyPoint.idx`: index of ONE body paragraph that develops the first main point (the one Gary's students will practise on Thursday). `keyPoint.prompt`: the matching "Note from question" text if there is a table, else `null`.
- `words`: exactly the 10 words of that week from the week list file (see below), with their Chinese meaning as written there (remove the ‡ mark but keep the Chinese). `example`: ONE sentence containing the word, copied verbatim, looked for in this order: (1) the essay's vocabulary table "Sentence" / "ayat" column, (2) the same-theme pack "Universal phrases" section or a universal answer, (3) a sentence of the essay text that contains the word. `null` if none (and add it to `gaps`).
- `goodPhrases`: BI = the essay's "Table 1: Beautiful Phrases & Vocabulary" rows (phrase + 中文解释). BM = the essay's "Table 2: 高级词汇" rows (peribahasa etc.; `word` + `华文意思`). `[]` if none.
- `gaps`: plain English lines for anything you could not fill. Empty array if none.

## Week lists (which words, which theme, which level)
- BI: `brand/PROGRAMME-BI-VOCAB.md` ("### Week n: Theme, level"; words listed under it; the theme pack link is under the heading). The weeks run 11 themes x 4 rounds: Technology, Environment, Health & Sports, School & Education, Finance & Consumerism, People & Culture, Teenagers & Society, Travel / Leisure / Home, Review, Report, Story. Round 1 = weeks 1 to 11 (B2), round 2 = 12 to 22, round 3 = 23 to 33, round 4 = 34 to 44.
- BM: `brand/PROGRAMME-BM-VOCAB.md` ("### Week n: Topic"; words and the essay links listed under it).

## Choosing the essay
- BI: Gary's reorganised Drive folder `15igSQPwFQlLPoCzjGVjCfQoOvgQx7xOA` (sub-folders per theme; list them with search_files `'<folderId>' in parents`). For a theme, use a DIFFERENT essay in each of its 4 rounds (take them in the folder's own order; for a review/report/story folder use the folder's own sub-kinds). If the theme has fewer than 4 usable essays, fill the weeks you can and put `"no distinct essay left for this round"` in `gaps` of the others (do not reuse an essay silently; leave `essayTitle` null and `paragraphs` empty for such a week).
- BM: the essays linked in the week's section of the BM vocab file. For the 2nd and 3rd appearance of a topic use the next essay of that topic if there is one, otherwise the same essay again (say so in `gaps`). The BM question is the essay title.
- Prefer an essay whose own vocabulary table contains some of the week's 10 words, but never reorder the weeks.

## When you finish
Report a short table: week, essay title, number of words with an example, list of gaps. Do not commit.
