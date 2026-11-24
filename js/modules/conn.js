// js/modules/conn.js — sambandet mellan multiplikation och division
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { randInt, showFeedback, shuffleArray } from '../utils.js';
import { divStackHTML } from '../visuals.js';

export function setConnSubMode(mode) {
    playSound('click');
    state.connSubMode = mode;
    ['family', 'missing', 'mix'].forEach(m => {
        const btn = document.getElementById(`conn-sub-${m}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (m === mode ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-200 text-slate-700');
    });
    generateConnQuestion();
}

// Bygger de fyra faktorfamilj-satserna; en del kan vara lucka.
function connStmts(a, b, c) {
    return [
        { lhs: a, op: '×', rhs: b, res: c },
        { lhs: b, op: '×', rhs: a, res: c },
        { lhs: c, op: '÷', rhs: a, res: b },
        { lhs: c, op: '÷', rhs: b, res: a },
    ];
}

// Satstexten med '?' på luckan (utan ram). Division ritas i
// bråkform – samma form som uppställningen visar.
function connStmtText(st, isAsked, part) {
    const v = (val, isBlank) => isAsked && isBlank ? '<strong class="conn-q">?</strong>' : val;
    if (st.op === '÷') {
        return `${divStackHTML(v(st.lhs, part === 'lhs'), v(st.rhs, part === 'rhs'))}<span class="conn-eq">=</span>${v(st.res, part === 'res')}`;
    }
    return `${v(st.lhs, part === 'lhs')} <span class="conn-op-x">×</span> ${v(st.rhs, part === 'rhs')} <span class="conn-eq">=</span> ${v(st.res, part === 'res')}`;
}

// En html-ruta med en familjsats; isAskedLucka anger vilken del som är '?'.
function connStmtHtml(st, isAsked, part) {
    return `<div class="conn-stmt ${isAsked ? 'conn-asked' : ''}">${connStmtText(st, isAsked, part)}</div>`;
}

export function generateConnQuestion() {
    document.getElementById('conn-feedback').classList.add('hidden');
    document.getElementById('conn-next-wrap').classList.add('hidden');

    const isHard = state.difficulty === 'hard';
    let mode = state.connSubMode;
    if (mode === 'mix') mode = Math.random() < 0.5 ? 'family' : 'missing';

    const maxT = state.difficulty === 'easy' ? 6 : (isHard ? 12 : 9);
    const a = randInt(2, maxT);
    let b = randInt(2, maxT);
    while (b === a) b = randInt(2, maxT); // a=b skulle ge dubbla satser i familjen
    const c = a * b;
    const stmts = connStmts(a, b, c);

    // Alla möjliga luckor: division är kärnan, men multiplikationssidan
    // ingår också (divisionen "baklänges").
    const forms = [
        { s: 2, part: 'res', ans: b, kind: 'div' },
        { s: 3, part: 'res', ans: a, kind: 'div' },
        { s: 2, part: 'rhs', ans: a, kind: 'div' },
        { s: 3, part: 'rhs', ans: b, kind: 'div' },
        { s: 2, part: 'lhs', ans: c, kind: 'div' },
        { s: 3, part: 'lhs', ans: c, kind: 'div' },
        { s: 0, part: 'rhs', ans: b, kind: 'mul' },
        { s: 1, part: 'rhs', ans: a, kind: 'mul' },
        { s: 0, part: 'res', ans: c, kind: 'mul' },
        { s: 0, part: 'lhs', ans: a, kind: 'mul' },
        { s: 1, part: 'lhs', ans: b, kind: 'mul' },
        { s: 1, part: 'res', ans: c, kind: 'mul' },
    ];
    const pool = state.difficulty === 'easy'
        ? forms.filter(f => f.kind === 'div' && f.part === 'res')
        : (isHard ? forms : forms.filter(f => f.kind === 'div' || f.part !== 'lhs'));
    const form = pool[randInt(0, pool.length - 1)];
    const asked = stmts[form.s];

    // Flerval: rätt svar + övriga familjevärden + en utomstående.
    const valSet = new Set([form.ans]);
    for (const v of [a, b, c, a + 1, b + 1, c - a]) if (valSet.size < 4 && v > 0) valSet.add(v);
    while (valSet.size < 4) valSet.add(randInt(2, 15));
    const choices = shuffleArray([...valSet]);
    state.currentConn = { mode, a, b, c, form, ans: form.ans, choices };

    const badgeEl = document.getElementById('conn-mode-badge');
    const qEl = document.getElementById('conn-question-text');
    const famEl = document.getElementById('conn-family');
    const visEl = document.getElementById('conn-visual');
    const optEl = document.getElementById('conn-options');
    const askWord = form.part === 'res' ? 'Vad är svaret?' : 'Vilket tal saknas?';

    if (mode === 'family') {
        badgeEl.textContent = '🔁 Faktorfamilj';
        qEl.textContent = 'Fyra sanningar ur samma familj – en har en lucka!';
        famEl.classList.remove('hidden');
        famEl.classList.add('grid');
        visEl.classList.add('hidden');
        famEl.innerHTML = stmts.map((st, i) =>
            connStmtHtml(st, i === form.s, form.part)).join('');
    } else {
        badgeEl.textContent = '❓ Saknat tal';
        qEl.textContent = 'Vilket tal saknas?';
        famEl.classList.add('hidden');
        famEl.classList.remove('grid');
        visEl.classList.remove('hidden');
        visEl.innerHTML = `<div class="conn-visual-box inline-block bg-indigo-50 border-3 border-indigo-300 rounded-3xl px-8 py-5">${
            connStmtText(asked, true, form.part)
        }</div>`;
    }
    optEl.innerHTML = choices.map((v, idx) => `
        <button onclick="checkConnChoice(${idx})" class="btn-3d bg-white hover:bg-indigo-50 border-3 border-indigo-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
            ${v}
        </button>`).join('');

    const familyStr = stmts.map(st => connStmtText(st, false, null)).join(' &nbsp;•&nbsp; ');
    const askedEq = connStmtText(asked, false, null);
    // Den multiplikationssats som "bevisar" svaret – alltid sann i familjen.
    const mulCheck = form.ans === a ? `${b} × ${a} = ${c}`
        : form.ans === b ? `${a} × ${b} = ${c}`
        : `${a} × ${b} = ${c}`;
    const isDivAsk = asked.op === '÷';
    const divHint = form.part === 'res'
        ? `frågar "vad gånger <strong>${asked.rhs}</strong> blir <strong>${asked.lhs}</strong>?"`
        : form.part === 'rhs'
        ? `frågar "vilket tal gånger <strong>${asked.res}</strong> blir <strong>${asked.lhs}</strong>?"`
        : `betyder <strong>${asked.rhs} × ${asked.res} = ?</strong>`;
    setHintSteps('conn', [
        `<p><strong>Steg 1:</strong> I en faktorfamilj är <strong>× och ÷ samma sanning</strong>! <strong>${a} × ${b} = ${c}</strong> ⇄ <strong>${divStackHTML(c, a)} = ${b}</strong> – dela upp produkten ger samma tal tillbaka.</p>`,
        isDivAsk
            ? `<p><strong>Steg 2:</strong> Division är multiplikation baklänges! <strong>${askedEq}</strong> ${divHint}. Testa: <strong>${mulCheck}</strong> ✓ – svaret är <strong>${form.ans}</strong>!</p>`
            : `<p><strong>Steg 2:</strong> Frågan är <strong>${askedEq}</strong>. Tänk "vilket tal gör likhet?" – kolla tabellen: <strong>${mulCheck}</strong> – svaret är <strong>${form.ans}</strong>!</p>`,
        `<p><strong>Steg 3:</strong> Hela familjen: ${familyStr} – alla fyra är samma sanning!</p>`
    ]);
}

export function checkConnChoice(idx) {
    if (!document.getElementById('conn-next-wrap').classList.contains('hidden')) return;
    const picked = state.currentConn.choices[idx];
    const cur = state.currentConn;
    const st = connStmts(cur.a, cur.b, cur.c)[cur.form.s];
    if (picked === cur.ans) {
        addReward(1);
        showFeedback('conn-feedback', true, `🎉 Rätt! ${connStmtText(st, false, null)} – samma sanning i hela faktorfamiljen!`);
        document.getElementById('conn-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        const hintEq = connStmtText(st, true, cur.form.part);
        showFeedback('conn-feedback', false, `🤔 ${picked} passar inte! Tänk: ${hintEq} – vilket tal gör likhet?`);
    }
}

// Prickmatrisen (arraymodellen): 8 kolumner × 7 rader = 56 prickar.
// Samma prickar ses som 7 högar à 8 (×) eller 8 grupper à 7 (÷) –
// det är bron mellan räknesätten.
function connArraySVG({ hlRows = [], hlCols = [], rowNums = false, colNums = false } = {}) {
    const r = 6.5, gap = 30, padX = 38, padY = 30;
    const w = padX * 2 + 7 * gap;
    const h = padY * 2 + 6 * gap + (colNums ? 22 : 0);
    const cx = c => padX + c * gap;
    const cy = i => padY + i * gap;
    let s = `<svg viewBox="0 0 ${w} ${h}" class="mx-auto" style="max-width:300px;height:auto">`;
    hlRows.forEach(i => {
        s += `<rect x="8" y="${cy(i) - gap / 2 + 3}" width="${w - 16}" height="${gap - 6}" rx="14" fill="#e0f2fe"/>`;
    });
    hlCols.forEach(i => {
        s += `<rect x="${cx(i) - gap / 2 + 3}" y="8" width="${gap - 6}" height="${h - 16 - (colNums ? 22 : 0)}" rx="14" fill="#fef3c7"/>`;
    });
    for (let i = 0; i < 7; i++) for (let c = 0; c < 8; c++) {
        s += `<circle cx="${cx(c)}" cy="${cy(i)}" r="${r}" fill="#6366f1"/>`;
    }
    if (rowNums) for (let i = 0; i < 7; i++)
        s += `<text x="20" y="${cy(i) + 4.5}" text-anchor="middle" font-size="14" font-weight="800" fill="#0369a1">${i + 1}</text>`;
    if (colNums) for (let c = 0; c < 8; c++)
        s += `<text x="${cx(c)}" y="${h - 6}" text-anchor="middle" font-size="14" font-weight="800" fill="#b45309">${c + 1}</text>`;
    return s + '</svg>';
}

const CONN_ALL_ROWS = [0, 1, 2, 3, 4, 5, 6];
const CONN_ALL_COLS = [0, 1, 2, 3, 4, 5, 6, 7];

// "Visa mig":_from vardaglig situation → prickmatris → båda räknesätten →
// hela familjen → ett motfråga där eleven måste använda sambandet.
export function buildConnDemoSteps() {
    const a = 7, b = 8, c = 56;
    const stmts = connStmts(a, b, c);
    const panel = (askIdx = -1, part = null) =>
        `<div class="grid grid-cols-2 gap-2 max-w-md mx-auto">${stmts.map((st, i) =>
            `<div class="bg-white border-2 ${i === askIdx ? 'border-indigo-400 bg-indigo-50' : 'border-indigo-200'} rounded-xl px-3 py-2 font-display font-bold text-xl text-slate-900">${connStmtText(st, i === askIdx, part)}</div>`
        ).join('')}</div>`;
    return { steps: [
        { text: `<p>56 kakor ska delas till <strong>7 barn</strong> – <strong>8 kakor var</strong>. Rita prickarna som en matris: <strong>7 rader med 8 prickar</strong>. Men samma 56 prickar kan också ses som <strong>8 kolumner med 7 prickar</strong>!</p>`,
          html: connArraySVG({}) },
        { text: `<p><strong>Multiplikation</strong> räknar prickarna: <strong>7 × 8 = 56</strong> betyder "7 högar (rader) med 8 i varje". Byt plats: <strong>8 × 7 = 56</strong> – samma prickar ger samma svar!</p>`,
          html: connArraySVG({ hlRows: CONN_ALL_ROWS }) },
        { text: `<p><strong>Division baklänges:</strong> 56 kakor i högar <strong>à 8</strong> – hur många högar får plats? Räkna <strong>raderna</strong>: 1–2–3–4–5–6–7! Alltså <strong>${divStackHTML(56, 8)} = 7</strong>.</p>`,
          html: connArraySVG({ hlRows: CONN_ALL_ROWS, rowNums: true }) },
        { text: `<p>Eller 56 kakor i <strong>påsar à 7</strong>: räkna <strong>kolumnerna</strong> istället – 1–2–3–4–5–6–7–8! Alltså <strong>${divStackHTML(56, 7)} = 8</strong>. Samma prickar – bara ett annat sätt att dela!</p>`,
          html: connArraySVG({ hlCols: CONN_ALL_COLS, colNums: true }) },
        { text: `<p><strong>${divStackHTML(56, 7)}</strong> frågar <em>"vad gånger 7 blir 56?"</em> – samma som <strong>7 × ? = 56</strong>. Men akta: <strong>${divStackHTML(56, 7)} är INTE samma sak som ${divStackHTML(7, 56)}!</strong></p>`,
          warn: true,
          html: panel() },
        { text: `<p><strong>Din tur!</strong> Vilket tal saknas? Titta på familjen – multiplicera baklänges!</p>`,
          html: panel(3, 'lhs'),
          guess: { options: [
              { label: '48', ok: false },
              { label: '56', ok: true },
              { label: '64', ok: false },
              { label: '42', ok: false },
          ] },
          doneText: `${divStackHTML('?', 8)} = 7 → <strong>56</strong> – för 7 × 8 = 56! 🎉` },
    ] };
}
