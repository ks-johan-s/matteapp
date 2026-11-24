// js/modules/conn.js — sambandet mellan multiplikation och division
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { randInt, showFeedback, shuffleArray } from '../utils.js';

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

// Satstexten med '?' på luckan (utan ram).
function connStmtText(st, isAsked, part) {
    const v = (val, isBlank) => isAsked && isBlank ? '<strong class="text-indigo-600">?</strong>' : val;
    return `${v(st.lhs, part === 'lhs')} ${st.op} ${v(st.rhs, part === 'rhs')} = ${v(st.res, part === 'res')}`;
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
        visEl.innerHTML = `<div class="inline-block bg-indigo-50 border-3 border-indigo-300 rounded-3xl px-8 py-5">${
            connStmtHtml(asked, true, form.part)
        }</div>`;
    }
    optEl.innerHTML = choices.map((v, idx) => `
        <button onclick="checkConnChoice(${idx})" class="btn-3d bg-white hover:bg-indigo-50 border-3 border-indigo-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
            ${v}
        </button>`).join('');

    const familyStr = stmts.map(s => `${s.lhs} ${s.op} ${s.rhs} = ${s.res}`).join(' &nbsp;•&nbsp; ');
    const askedEq = `${asked.lhs} ${asked.op} ${asked.rhs} = ${asked.res}`;
    setHintSteps('conn', [
        `<p><strong>Steg 1:</strong> I en faktorfamilj är <strong>multiplikation och division samma sanning</strong>! <strong>${a} × ${b} = ${c}</strong> ⇄ <strong>${c} ÷ ${a} = ${b}</strong>.</p>`,
        `<p><strong>Steg 2:</strong> Frågan är <strong>${askedEq}</strong>. Tänk "vilket tal gör likhet?" – svaret är <strong>${form.ans}</strong>! Hela familjen: ${familyStr}</p>`
    ]);
}

export function checkConnChoice(idx) {
    if (!document.getElementById('conn-next-wrap').classList.contains('hidden')) return;
    const picked = state.currentConn.choices[idx];
    const cur = state.currentConn;
    const st = connStmts(cur.a, cur.b, cur.c)[cur.form.s];
    if (picked === cur.ans) {
        addReward(1);
        showFeedback('conn-feedback', true, `🎉 Rätt! ${st.lhs} ${st.op} ${st.rhs} = ${st.res} – samma sanning i hela faktorfamiljen!`);
        document.getElementById('conn-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        const hintEq = cur.form.part === 'res' ? `${st.lhs} ${st.op} ${st.rhs} = ?`
            : cur.form.part === 'rhs' ? `${st.lhs} ${st.op} ? = ${st.res}`
            : `? ${st.op} ${st.rhs} = ${st.res}`;
        showFeedback('conn-feedback', false, `🤔 ${picked} passar inte! Tänk: ${hintEq} – vilket tal gör likhet?`);
    }
}

// "Visa mig": en faktorfamilj ur fyra likvärdiga satser.
export function buildConnDemoSteps() {
    const a = 7, b = 8, c = 56;
    const stmts = connStmts(a, b, c);
    const panel = (askIdx = -1, part = null) =>
        `<div class="grid grid-cols-2 gap-2 max-w-md mx-auto">${stmts.map((st, i) =>
            `<div class="bg-white border-2 ${i === askIdx ? 'border-indigo-400 bg-indigo-50' : 'border-indigo-200'} rounded-xl px-3 py-2 font-display font-bold text-lg text-slate-900">${connStmtText(st, i === askIdx, part)}</div>`
        ).join('')}</div>`;
    return { steps: [
        { text: `<p>Tre tal kan bilda en <strong>faktorfamilj</strong>! Talen <strong>7, 8 och 56</strong> hänger ihop – de kan skrivas på <strong>fyra olika sätt</strong>.</p>`,
          html: `<div class="flex justify-center gap-2 my-2">${[7, 8, 56].map(n => `<span class="px-4 py-2 rounded-2xl bg-indigo-100 border-2 border-indigo-300 font-display font-bold text-2xl text-indigo-900">${n}</span>`).join('<span class="self-center text-indigo-400 font-bold">+</span>')}</div>` },
        { text: `<p>Multiplikationen ger produkten: <strong>7 × 8 = 56</strong>. Och <strong>tvärtom</strong>: <strong>8 × 7 = 56</strong> – samma svar!</p>`,
          html: panel() },
        { text: `<p>Samma familj ger <strong>division</strong>! <strong>56 ÷ 7 = 8</strong> och <strong>56 ÷ 8 = 7</strong> – division är bara multiplikation baklänges!</p>`,
          html: panel() },
        { text: `<p>Knepet: division <strong>56 ÷ 7</strong> frågar <em>"vilket tal gånger 7 blir 56?"</em> – samma som <strong>7 × ? = 56</strong>. Tänk alltid på produkten först!</p>`,
          warn: true,
          html: panel() },
        { text: `<p><strong>Din tur!</strong> Vilket tal saknas i familjen?</p>`,
          html: panel(2, 'res'),
          guess: { options: [
              { label: '7', ok: false },
              { label: '8', ok: true },
              { label: '6', ok: false },
          ] },
          doneText: `56 ÷ 7 = <strong>8</strong> – för 7 × 8 = 56! 🎉` },
    ] };
}
