import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";


const TOTAL_QUESTIONS = 54
const SECONDS_PER_QUESTION = 90
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DONATE = {
  paypal: "https://www.paypal.me/larrychiem",
  github: "https://github.com/sponsors/LarryChiem",
  coffee: "https://www.buymeacoffee.com/larrychiem",
}
const LS_SEEN = "ppe_seen_v1";
const LS_QUEUE = "ppe_queue_v1";
const LS_QUEUE_POS = "ppe_queue_pos_v1";


function loadSeenSet() {
  try {
    const arr = JSON.parse(localStorage.getItem(LS_SEEN) || "[]");
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveSeenSet(set) {
  localStorage.setItem(LS_SEEN, JSON.stringify([...set]));
}

// crude but effective “is this code?” check
function looksLikeCode(text) {
  if (!text || typeof text !== "string") return false;
  if (!text.includes("\n")) return false;

  // Strong punctuation signal for C-like code
  const punctHint = (text.includes("{") && text.includes("}")) || text.includes(";") || text.includes("::");

  const cppHints = [
    "#include",
    "std::",
    "template",
    "typename",
    "constexpr",
    "consteval",
    "constinit",
    "concept",
    "requires",
    "namespace",
    "using ",
    "struct ",
    "class ",
    "enum ",
    "->",
    "noexcept",
    "co_await",
    "co_yield",
    "co_return",
    "std::ranges",
    "std::views",
    "std::span",
    "std::jthread"
  ];

  const pyHints = ["def ", "class ", "for ", "if ", "import ", "return ", "print("];

  const hasCpp = cppHints.some(h => text.includes(h));
  const hasPy = pyHints.some(h => text.includes(h));

  return (hasCpp && punctHint) || (!hasCpp && hasPy);
}

function detectCodeLanguage(text) {
  if (!text || typeof text !== "string") return "text";
  const cppStrong = ["#include", "std::", "template", "concept", "requires", "namespace", "::", "->"];
  const pyStrong = ["def ", "import ", "print(", "elif ", "None", "True", "False"];
  const isCpp = cppStrong.some(h => text.includes(h));
  const isPy = pyStrong.some(h => text.includes(h));
  if (isCpp && !isPy) return "cpp";
  if (isPy && !isCpp) return "python";
  // Default for this project going forward: C++
  return "cpp";
}

async function loadQuestionsFromBanks() {
  // Preferred: manifest listing all bank JSON files.
  // NOTE: In a static site (GitHub Pages), the browser cannot list directories.
  // So we load a manifest at /question_banks/index.json.
  try {
    const manifestRes = await fetch("question_banks/index.json");
    if (manifestRes.ok) {
      const manifest = await manifestRes.json();
      const files = Array.isArray(manifest.files) ? manifest.files : [];
      if (files.length) {
        const banks = await Promise.all(
          files.map((name) =>
            fetch(`question_banks/${name}`).then((r) => {
              if (!r.ok) throw new Error(`Failed to load ${name}`);
              return r.json();
            })
          )
        );
        return banks.flat().map(normalizeQuestionShape);
      }
    }
  } catch (e) {
    // Fall through to other strategies
  }

  // Fallback 1: legacy single-bank questions.json
  const legacyRes = await fetch("questions.json");
  if (!legacyRes.ok) throw new Error("Failed to load /questions.json (and no manifest found).");
  const legacy = await legacyRes.json();
  return (Array.isArray(legacy) ? legacy : []).map(normalizeQuestionShape);
}

function inferTopicFromTags(tags, prompt = "") {
  const lowerTags = Array.isArray(tags) ? tags.map((t) => String(t).toLowerCase()) : [];
  const text = String(prompt || "").toLowerCase();
  const hasAny = (vals) => vals.some((v) => lowerTags.includes(v));

  if (hasAny(["concurrency", "mutex", "thread", "atomic", "future", "async", "jthread"]) || /mutex|thread|atomic|future|async/.test(text)) {
    return "Concurrency";
  }
  if (hasAny(["exceptions", "error-handling", "noexcept", "terminate"]) || /exception|throw|catch|noexcept|terminate/.test(text)) {
    return "Exceptions";
  }
  if (hasAny(["templates", "metaprogramming", "type-traits", "if-constexpr", "concepts"]) || /template|if constexpr|type_trait|concept|requires/.test(text)) {
    return "Templates";
  }
  if (hasAny(["stl", "algorithms", "vector", "map", "set", "ranges", "iterator", "span"]) || /std::vector|std::map|std::set|std::ranges|std::span|std::unique/.test(text)) {
    return "STL";
  }
  if (hasAny(["oop", "inheritance", "polymorphism", "virtual-destructor", "override"]) || /virtual|override|base|derived|class/.test(text)) {
    return "OOP";
  }
  if (hasAny(["memory", "raii", "smart-pointers", "unique_ptr", "shared_ptr", "ownership"]) || /unique_ptr|shared_ptr|new |delete|raii/.test(text)) {
    return "Memory/RAII";
  }
  if (hasAny(["utilities", "optional", "variant", "any", "string_view", "filesystem", "best-practices"]) || /optional|variant|any|string_view|filesystem/.test(text)) {
    return "Utilities";
  }
  return "Types/Basics";
}

function normalizeQuestionShape(q) {
  const rawOptions = Array.isArray(q?.options) ? q.options : [];
  const normalizedOptions = rawOptions.map((opt, i) => {
    if (typeof opt === "string") {
      return {
        id: LETTERS[i],
        text: opt,
        isCorrect: Array.isArray(q?.correct) ? q.correct.includes(i) : false,
        explanation: q?.explanations?.[String(i)] ?? "",
      };
    }
    return {
      id: opt?.id ?? LETTERS[i],
      text: typeof opt?.text === "string" ? opt.text : String(opt?.text ?? ""),
      isCorrect:
        typeof opt?.isCorrect === "boolean"
          ? opt.isCorrect
          : Array.isArray(q?.correct)
          ? q.correct.includes(i)
          : false,
      explanation:
        typeof opt?.explanation === "string"
          ? opt.explanation
          : q?.explanations?.[String(i)] ?? "",
    };
  });

  const correct = normalizedOptions
    .map((opt, i) => (opt.isCorrect ? i : -1))
    .filter((i) => i >= 0);

  const explanations = {};
  normalizedOptions.forEach((opt, i) => {
    if (opt.explanation) explanations[String(i)] = opt.explanation;
  });

  return {
    ...q,
    topic:
      typeof q?.topic === "string" && q.topic.trim()
        ? q.topic.trim()
        : inferTopicFromTags(q?.tags, q?.prompt),
    options: normalizedOptions,
    correct,
    explanations,
  };
}

function assertUniqueQuestionIds(questions) {
  const seen = new Set();
  for (const q of questions) {
    if (!q || !q.id) throw new Error("Question missing required `id` field.");
    if (seen.has(q.id)) throw new Error(`Duplicate question id detected: ${q.id}`);
    seen.add(q.id);
  }
}


export function PromptText({ text }) {
  const value = String(text ?? "");
  const parts = [];
  const fenceRe = /```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g;
  let last = 0;
  let match;

  while ((match = fenceRe.exec(value)) !== null) {
    const full = match[0];
    const lang = match[1]?.trim() || detectCodeLanguage(match[2]);
    const code = match[2] ?? "";
    const start = match.index;
    if (start > last) parts.push({ type: "text", value: value.slice(last, start) });
    parts.push({ type: "code", value: code, lang });
    last = start + full.length;
  }
  if (last < value.length) parts.push({ type: "text", value: value.slice(last) });

  if (!parts.length) {
    if (looksLikeCode(value)) {
      return (
        <SyntaxHighlighter
          language={detectCodeLanguage(value)}
          style={oneLight}
          customStyle={{
            margin: 0,
            borderRadius: 12,
            padding: 12,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {value}
        </SyntaxHighlighter>
      );
    }
    return <div style={{ whiteSpace: "pre-wrap" }}>{value}</div>;
  }

  return (
    <div className="promptText">
      {parts.map((p, i) =>
        p.type === "code" ? (
          <SyntaxHighlighter
            key={i}
            language={p.lang}
            style={oneLight}
            customStyle={{
              margin: "8px 0",
              borderRadius: 12,
              padding: 12,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {p.value}
          </SyntaxHighlighter>
        ) : (
          <div key={i} style={{ whiteSpace: "pre-wrap" }}>
            {p.value}
          </div>
        )
      )}
    </div>
  );
}

function ExplanationText({ text }) {
  const value = String(text ?? "");
  const parts = [];
  const fenceRe = /```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g;
  let last = 0;
  let match;

  while ((match = fenceRe.exec(value)) !== null) {
    const full = match[0];
    const lang = match[1]?.trim() || detectCodeLanguage(match[2]);
    const code = match[2] ?? "";
    const start = match.index;
    if (start > last) {
      parts.push({ type: "text", value: value.slice(last, start) });
    }
    parts.push({ type: "code", value: code, lang });
    last = start + full.length;
  }
  if (last < value.length) {
    parts.push({ type: "text", value: value.slice(last) });
  }

  // Common bank format: "Example:\n<code lines>" without fenced blocks.
  if (!parts.some((p) => p.type === "code")) {
    const m = value.match(/^([\s\S]*?\bExample:\s*\n)([\s\S]+)$/i);
    if (m) {
      const head = m[1];
      const code = m[2];
      return (
        <div className="explainText">
          {head.trim() ? <div style={{ whiteSpace: "pre-wrap" }}>{head}</div> : null}
          <SyntaxHighlighter
            language={detectCodeLanguage(code)}
            style={oneLight}
            customStyle={{
              margin: "8px 0 0",
              borderRadius: 10,
              padding: 12,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );
    }
  }

  return (
    <div className="explainText">
      {parts.map((p, i) =>
        p.type === "code" ? (
          <SyntaxHighlighter
            key={i}
            language={p.lang}
            style={oneLight}
            customStyle={{
              margin: "8px 0",
              borderRadius: 10,
              padding: 12,
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            {p.value}
          </SyntaxHighlighter>
        ) : (
          <div key={i} style={{ whiteSpace: "pre-wrap" }}>
            {p.value}
          </div>
        )
      )}
    </div>
  );
}

function loadQueue() {
  try {
    const arr = JSON.parse(localStorage.getItem(LS_QUEUE) || "[]");
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function loadQueuePos() {
  const n = Number(localStorage.getItem(LS_QUEUE_POS) || "0");
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function saveQueue(queue, pos) {
  localStorage.setItem(LS_QUEUE, JSON.stringify(queue));
  localStorage.setItem(LS_QUEUE_POS, String(pos));
}

function clearQueue() {
  localStorage.removeItem(LS_QUEUE);
  localStorage.removeItem(LS_QUEUE_POS);
}

function resetSeenProgress() {
  localStorage.removeItem(LS_SEEN);
  clearQueue();
}

function markSeen(questions) {
  const seen = loadSeenSet();
  let changed = false;
  for (const q of questions || []) {
    const id = qid(q);
    if (!seen.has(id)) {
      seen.add(id);
      changed = true;
    }
  }
  if (changed) {
    saveSeenSet(seen);
    clearQueue();
  }
  return changed;
}

function buildExam(pool, count) {
  const desired = Math.max(1, Math.min(Number(count || pool.length), pool.length));
  const seen = loadSeenSet();

  const byId = new Map();
  for (const q of pool) byId.set(qid(q), q);

  const unseenIds = [];
  const already = [];
  for (const q of pool) {
    const id = qid(q);
    if (seen.has(id)) already.push(q);
    else unseenIds.push(id);
  }

  const poolIdSet = new Set(byId.keys());
  const unseenSet = new Set(unseenIds);

  // Prefer unseen-only sessions while unseen questions remain.
  // Once unseen is exhausted, loop randomly over the full pool.
  if (!unseenIds.length) {
    clearQueue();
    return { exam: shuffle(pool).slice(0, desired), remainingUnseen: 0 };
  }

  // Build a persistent "queue" of unseen question ids so we cover everything efficiently
  // without repeats across sessions.
  let queue = loadQueue().filter((id) => poolIdSet.has(id) && unseenSet.has(id));
  if (!queue.length && unseenIds.length) queue = shuffle(unseenIds);

  let pos = loadQueuePos();
  if (!Number.isFinite(pos) || pos < 0 || pos > queue.length) pos = 0;

  let pickedIds = queue.slice(pos, pos + desired);
  pos += pickedIds.length;

  // If we ran out of queued unseen, rebuild from the remaining unseen and continue.
  if (pickedIds.length < desired && unseenIds.length > pickedIds.length) {
    const pickedSet = new Set(pickedIds);
    const remainingUnseen = unseenIds.filter((id) => !pickedSet.has(id));
    queue = remainingUnseen.length ? shuffle(remainingUnseen) : [];
    pos = 0;

    const need = desired - pickedIds.length;
    const more = queue.slice(0, need);
    pickedIds = pickedIds.concat(more);
    pos += more.length;
  }

  saveQueue(queue, pos);

  let exam = pickedIds.map((id) => byId.get(id)).filter(Boolean);

  return { exam, remainingUnseen: unseenIds.length };
}

function DonateBlock() {
    return (
        <section className="donate">
            <h2>Support</h2>
            <p className="muted">
                This app is free and has no ads. If it helped you, donations are optional and appreciated.
            </p>
            <div className="donateBtns">
                <a className="btn" href={DONATE.paypal} target="_blank" rel="noreferrer">Donate (Paypal)</a>
                <a className="btn ghost" href={DONATE.github} target="_blank" rel="noreferrer">Sponsor (GitHub)</a>
                <a className="btn ghost" href={DONATE.coffee} target="_blank" rel="noreferrer">Buy me a coffee</a>
            </div>
        </section>
    )
}

const LS_INPROGRESS = "ppe_inprogress_v1";

function saveInProgress(state) {
  localStorage.setItem(LS_INPROGRESS, JSON.stringify(state));
}

function loadInProgress() {
  try {
    return JSON.parse(localStorage.getItem(LS_INPROGRESS) || "null");
  } catch {
    return null;
  }
}

function clearInProgress() {
  localStorage.removeItem(LS_INPROGRESS);
}

function fmtMMSS(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const s = String(totalSeconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

function dedupeByPrompt(arr) {
  const seen = new Set()
  const out = []
  for (const q of arr) {
    if (!q?.prompt || seen.has(q.prompt)) continue
    seen.add(q.prompt)
    out.push(q)
  }
  return out
}

function shuffle(a) {
  const arr = [...a]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function isMultiSelect(q) {
  return (q.correct?.length ?? 0) > 1
}

function pct(correct, attempted) {
  return attempted ? (correct / attempted) * 100 : 0
}

function nowIsoLocal() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem('ppx_history') || '[]')
  } catch {
    return []
  }
}

function saveHistory(rows) {
  localStorage.setItem('ppx_history', JSON.stringify(rows))
}

function qid(q) {
  // Prefer explicit id if present
  if (q.id) return String(q.id);

  // Deterministic fallback id from content
  const base = JSON.stringify([q.topic ?? "", q.prompt ?? "", q.options ?? []]);
  let h = 2166136261; // FNV-1a-ish
  for (let i = 0; i < base.length; i++) {
    h ^= base.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return "q_" + (h >>> 0).toString(16);
}

function LineChart({ values }) {
  if (!values?.length) return null
  const w = 320
  const h = 120
  const pad = 12

  const points = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1)
    const y = h - pad - (v * (h - pad * 2)) / 100
    return [x, y]
  })

  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', maxWidth: w }}>
      <rect x="0" y="0" width={w} height={h} rx="10" fill="#fff" />
      {[0, 25, 50, 75, 100].map((g) => {
        const y = h - pad - (g * (h - pad * 2)) / 100
        return <line key={g} x1={pad} x2={w - pad} y1={y} y2={y} stroke="#e6e8ee" strokeWidth="1" />
      })}
      <path d={d} fill="none" stroke="#111" strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#111" />
      ))}
    </svg>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [bank, setBank] = useState([])
  const [exam, setExam] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(new Set())
  const [locked, setLocked] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [attempted, setAttempted] = useState(0)
  const [startTs, setStartTs] = useState(null)
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(TOTAL_QUESTIONS * SECONDS_PER_QUESTION)
  const [timeLeft, setTimeLeft] = useState(TOTAL_QUESTIONS * SECONDS_PER_QUESTION)
  const [history, setHistory] = useState(loadHistory())
  const [seenTick, setSeenTick] = useState(0)
  const [seenStats, setSeenStats] = useState({ seen: 0, unseen: 0, total: 0 })
  const [questionCount, setQuestionCount] = useState(TOTAL_QUESTIONS)
  const [selectedTopics, setSelectedTopics] = useState([]) // empty = all
  const [resumeSnapshot, setResumeSnapshot] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await loadQuestionsFromBanks()
        assertUniqueQuestionIds(Array.isArray(data) ? data : [])
        setBank(dedupeByPrompt(Array.isArray(Array.isArray(data) ? data : [])
? data : []))
      } catch (e) {
        console.error(e)
        setBank([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

// Restore an in-progress attempt (if any)
useEffect(() => {
  const snap = loadInProgress()
  if (snap && snap.exam?.length && typeof snap.idx === "number") {
    setResumeSnapshot(snap)
  }
}, [])


function startExam(opts = { fresh: true }) {
  // If starting a brand-new attempt, clear any saved in-progress state
  if (opts?.fresh) {
    clearInProgress()
    setResumeSnapshot(null)
  }

  const pool = poolForSelection
  const { exam } = buildExam(pool, questionCount)
  const dynamicLimit = Math.max(1, exam.length) * SECONDS_PER_QUESTION
  setExam(exam)
  setIdx(0)
  setSelected(new Set())
  setLocked(false)
  setCorrectCount(0)
  setAttempted(0)

  const now = Date.now()
  setStartTs(now)
  setTimeLimitSeconds(dynamicLimit)
  setTimeLeft(dynamicLimit)
}


function resumeExam() {
  const snap = loadInProgress()
  if (!snap || !snap.exam?.length) {
    setResumeSnapshot(null)
    return
  }
  setExam(snap.exam)
  setIdx(snap.idx ?? 0)
  setSelected(new Set(snap.selected || []))
  setLocked(!!snap.locked)
  setCorrectCount(snap.correctCount ?? 0)
  setAttempted(snap.attempted ?? 0)
  setStartTs(snap.startTs ?? Date.now())
  const resumedLimit = typeof snap.timeLimitSeconds === "number"
    ? snap.timeLimitSeconds
    : Math.max(1, (snap.exam?.length ?? snap.questionCount ?? TOTAL_QUESTIONS)) * SECONDS_PER_QUESTION
  setTimeLimitSeconds(resumedLimit)
  setTimeLeft(typeof snap.timeLeft === "number" ? snap.timeLeft : resumedLimit)
  setQuestionCount(snap.questionCount ?? TOTAL_QUESTIONS)
  setSelectedTopics(snap.selectedTopics ?? [])
}

function abandonExam() {
  clearInProgress()
  setResumeSnapshot(null)
  setStartTs(null)
  setExam([])
  setIdx(0)
  setSelected(new Set())
  setLocked(false)
  setCorrectCount(0)
  setAttempted(0)
  const freshLimit = Math.max(1, Number(questionCount || TOTAL_QUESTIONS)) * SECONDS_PER_QUESTION
  setTimeLimitSeconds(freshLimit)
  setTimeLeft(freshLimit)
}


  useEffect(() => {
    if (!startTs) return
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTs) / 1000)
      setTimeLeft(Math.max(0, timeLimitSeconds - elapsed))
    }, 250)
    return () => timerRef.current && clearInterval(timerRef.current)
  }, [startTs, timeLimitSeconds])

  useEffect(() => {
    if (startTs && timeLeft <= 0) setLocked(true)
  }, [timeLeft, startTs])

// Persist progress so the user can resume if they close the app
useEffect(() => {
  if (!startTs || !exam.length) return
  const state = {
    v: 1,
    startTs,
    exam,
    idx,
    selected: Array.from(selected),
    locked,
    correctCount,
    attempted,
    timeLeft,
    timeLimitSeconds,
    questionCount,
    selectedTopics,
  }
  saveInProgress(state)
}, [startTs, exam, idx, selected, locked, correctCount, attempted, timeLeft, timeLimitSeconds, questionCount, selectedTopics])

// If time expires, keep the last saved state (so they can still view results)

  const topics = useMemo(() => {
  const set = new Set((bank || []).map((qq) => qq.topic).filter(Boolean))
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}, [bank])

const poolForSelection = useMemo(() => {
  const unique = dedupeByPrompt(bank)
  if (!selectedTopics.length) return unique
  const sel = new Set(selectedTopics)
  return unique.filter((qq) => sel.has(qq.topic))
}, [bank, selectedTopics])

useEffect(() => {
  const pool = poolForSelection || []
  if (!pool.length) {
    setSeenStats({ seen: 0, unseen: 0, total: 0 })
    return
  }
  const seen = loadSeenSet()
  let seenN = 0
  for (const qq of pool) {
    if (seen.has(qid(qq))) seenN++
  }
  setSeenStats({ seen: seenN, unseen: pool.length - seenN, total: pool.length })
}, [poolForSelection, seenTick])


const q = exam[idx]
  const isDone = useMemo(() => {
    if (!startTs) return false
    if (timeLeft <= 0) return true
    return idx >= exam.length
  }, [startTs, timeLeft, idx, exam.length])

  function toggleOption(optIdx) {
    if (!q || locked) return
    const ms = isMultiSelect(q)
    setSelected((prev) => {
      const next = new Set(prev)
      if (!ms) {
        next.clear()
        next.add(optIdx)
        return next
      }
      next.has(optIdx) ? next.delete(optIdx) : next.add(optIdx)
      return next
    })
  }

  function submitAnswer() {
    if (!q || locked || !selected.size) return
    setLocked(true)
    const corr = new Set(q.correct || [])
    const ok = corr.size === selected.size && [...corr].every((x) => selected.has(x))
    setAttempted((a) => a + 1)
    if (ok) setCorrectCount((c) => c + 1)
  }

  function nextQuestion() {
    setLocked(false)
    setSelected(new Set())
    setIdx((i) => i + 1)
  }

  function finishAndLog() {
    clearInProgress()
    setResumeSnapshot(null)

    if (markSeen(exam)) setSeenTick((t) => t + 1)

    const durationSec = startTs ? Math.floor((Date.now() - startTs) / 1000) : 0
    const row = {
      timestamp: nowIsoLocal(),
      attempted,
      correct: correctCount,
      score_pct: Number(pct(correctCount, attempted).toFixed(2)),
      duration_sec: durationSec,
      total_questions: exam.length,
    }
    const next = [row, ...history].slice(0, 200)
    setHistory(next)
    saveHistory(next)
    setStartTs(null)
    setExam([])
    setIdx(0)
    setSelected(new Set())
    setLocked(false)
    const freshLimit = Math.max(1, Number(questionCount || TOTAL_QUESTIONS)) * SECONDS_PER_QUESTION
    setTimeLimitSeconds(freshLimit)
    setTimeLeft(freshLimit)
  }

  function exportCsv() {
    const header = ['timestamp','attempted','correct','score_pct','duration_sec','total_questions']
    const lines = [header.join(',')]
    for (const r of history) {
      const row = [r.timestamp, r.attempted, r.correct, r.score_pct, r.duration_sec, r.total_questions]
      lines.push(row.map(String).map(v => `"${v.replaceAll('"','""')}"`).join(','))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'practice_results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const scores = history.slice().reverse().map((r) => r.score_pct)

  return (
    <div className="wrap">
      <header className="top">
        <div>
          <h1>C++ 17/20 Practice Exam</h1>
          <p className="sub">{bank.length} questions loaded • 90s/question • mobile-friendly</p>
        </div>
        <div className="pillRow">
          <span className="pill">Bank: {bank.length} q</span>
          {startTs && <span className="pill">Time left: {fmtMMSS(timeLeft)}</span>}
        </div>
      </header>

      <main className="card">
        {loading && <p>Loading questions…</p>}

        {!loading && bank.length === 0 && (
          <div>
            <p><b>No questions loaded.</b></p>
            <p>Make sure <code>public/questions.json</code> exists and is valid JSON.</p>
          </div>
        )}

        {!loading && bank.length > 0 && !startTs && (
          <div className="start">
            <div className="startHead">
              <h2>Practice Settings</h2>
              <span className="muted small">{poolForSelection.length} selectable questions</span>
            </div>

            {resumeSnapshot && (
              <div className="resume">
                <p><b>Resume available:</b> You were on question {(resumeSnapshot.idx ?? 0) + 1} of {resumeSnapshot.exam?.length}.</p>
                <div className="actions">
                  <button className="btn" onClick={resumeExam}>Resume</button>
                  <button className="btn ghost" onClick={() => startExam({ fresh: true })}>Start New</button>
                </div>
              </div>
            )}

            <div className="startPanels">
              <section className="panel setupPanel">
                <div className="settings">
                  <label className="field">
                    <span className="label">Number of questions</span>
                    <input
                      type="number"
                      min="1"
                      max={poolForSelection.length || 1}
                      value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value || '1', 10))}
                    />
                    <span className="muted small">Max: {poolForSelection.length}</span>
                  </label>

                  <div className="field">
                    <span className="label">Topics</span>
                    <div className="topicRow">
                      <label className="chk">
                        <input
                          type="checkbox"
                          checked={selectedTopics.length === 0}
                          onChange={() => setSelectedTopics([])}
                        />
                        <span>All topics</span>
                      </label>
                      <span className="muted small">{selectedTopics.length ? `${selectedTopics.length} selected` : `${topics.length} topics`}</span>
                    </div>

                    <div className="topics">
                      {topics.map((t) => (
                        <label className="chk" key={t}>
                          <input
                            type="checkbox"
                            checked={selectedTopics.includes(t)}

                            onChange={(e) => {
                              const next = new Set(selectedTopics.length ? selectedTopics : [])
                              if (e.target.checked) next.add(t)
                              else next.delete(t)
                              setSelectedTopics(Array.from(next))
                            }}
                          />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>
                    <p className="muted small">Tip: Uncheck “All topics” by selecting at least one topic.</p>
                  </div>
                </div>

                <div className="actions compactActions">
                  <button className="btn" onClick={() => startExam({ fresh: true })}>Start Practice</button>
                </div>
                <p className="hint">Tip: On your phone, open the site and “Add to Home Screen.”</p>
                <DonateBlock />
              </section>

              <section className="panel history">
                <div className="historyHead">
                  <h2>Progress</h2>
                  <div className="actions">
                    <button className="btn ghost" onClick={exportCsv} disabled={!history.length}>Export CSV</button>
                    <button
                      className="btn ghost"
                      onClick={() => {
                        resetSeenProgress()
                        setSeenTick((t) => t + 1)
                      }}
                      title="Clears which questions you've already seen so you can start a fresh coverage cycle."
                    >
                      Reset Seen
                    </button>
                  </div>
                </div>
                <p className="muted small">
                  Coverage (current filter): <b>{seenStats.seen}</b> of <b>{seenStats.total}</b> seen, <b>{seenStats.unseen}</b> new remaining.
                </p>
                <LineChart values={scores} />
                {!history.length ? (
                  <p className="muted">No attempts yet.</p>
                ) : (
                  <div className="tableScroll">
                    <div className="table">
                      <div className="row head">
                        <div>When</div><div>Score</div><div>Attempted</div><div>Duration</div>
                      </div>
                      {history.slice(0, 6).map((r, i) => (
                        <div key={i} className="row">
                          <div className="mono">{r.timestamp}</div>
                          <div><b>{r.score_pct}%</b></div>
                          <div>{r.correct}/{r.attempted}</div>
                          <div>{Math.floor(r.duration_sec/60)}m</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {startTs && !isDone && q && (
          <div className="quiz">
            <div className="qmeta">
              <span className="pill">Q {idx + 1} / {exam.length}</span>
              <span className="pill">Topic: {q.topic || 'General'}</span>
              <span className="pill">Score: {correctCount}/{attempted}</span>
            </div>

            <div className="prompt">
                <PromptText text={q.prompt} />
            </div>

            <div className="opts">
              {q.options.map((opt, oi) => {
                const chosen = selected.has(oi)
                const corr = (q.correct || []).includes(oi)
                const show = locked
                return (
                  <button
                    key={oi}
                    className={[
                      'opt',
                      chosen ? 'chosen' : '',
                      show && corr ? 'correct' : '',
                      show && chosen && !corr ? 'wrong' : '',
                    ].join(' ').trim()}
                    onClick={() => toggleOption(oi)}
                    disabled={locked || timeLeft <= 0}
                  >
                    <span className="letter">{LETTERS[oi]}</span>
                    <span className="optText">
                        <PromptText text={opt.text} />
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="actions">
              {!locked ? (
                <button className="btn" onClick={submitAnswer} disabled={!selected.size || timeLeft <= 0}>
                  Submit
                </button>
              ) : (
                <button className="btn" onClick={nextQuestion}>
                  Next
                </button>
              )}
              <button
                className="btn ghost"
                onClick={() => {
                  if (window.confirm("Quit this session? Unsaved progress for this attempt will be discarded.")) {
                    abandonExam()
                  }
                }}
              >
                Quit
              </button>
            </div>

            {locked && (
              <div className="explain">
                <h3>Explanation</h3>
                {(q.options || []).map((opt, oi) => {
                  const isC = (q.correct || []).includes(oi)
                  const optText = typeof opt === 'string' ? opt : (opt?.text ?? '')
                  const why = q.explanations?.[String(oi)] ?? opt?.explanation ?? q.explanation ?? 'No explanation provided.'
                  return (
                    <div key={oi} className="exRow">
                      <div className="mono"><b>{LETTERS[oi]}.</b> {optText}</div>
                      <div className={isC ? 'good' : 'bad'}>
                        <b>{isC ? 'CORRECT' : 'WRONG'}:</b>
                      </div>
                      <ExplanationText text={why} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {startTs && (isDone || idx >= exam.length) && (
          <div className="done">
            <h2>Done</h2>
            <p><b>Score:</b> {correctCount}/{attempted} ({pct(correctCount, attempted).toFixed(1)}%)</p>
            <p className="muted">Attempts are saved locally in your browser (localStorage).</p>
            <div className="actions">
              <button className="btn" onClick={finishAndLog}>Save Attempt</button>
              <button className="btn ghost" onClick={abandonExam}>Back</button>
            </div>

            <DonateBlock />
          </div>
        )}
      </main>

      <footer className="foot">
        <span className="muted">
          Hosted via GitHub Pages • Export CSV available •{" "}
          <a href="https://github.com/LarryChiem/Cpp-IKM" target="_blank" rel="noreferrer">
            View GitHub Repo
          </a>
        </span>
      </footer>
    </div>
  )
}
