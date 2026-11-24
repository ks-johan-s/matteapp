// js/modules/addsub.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { formatPlaceValueHTML, randInt, showFeedback, shuffleArray } from '../utils.js';
import { buildNumberLineJumpSVG } from '../visuals.js';

/* =============================================================
   4. MODUL 1: PLUS & MINUS (HUVUDRÄKNING)
============================================================== */
// Vilket räknesätt modulen övar – sätts av hemkorten Addition/Subtraktion
// eller av op-chip:en i vyn. 'pv' är op-neutralt.
export function setAddSubOp(op) {
    playSound('click');
    state.addsubOp = op;
    refreshAddSubChips();
    generateAddSubQuestion();
}

function refreshAddSubChips() {
    ['add', 'sub'].forEach(o => {
        const btn = document.getElementById(`addsub-op-${o}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (o === state.addsubOp ? 'bg-emerald-700 text-white' : 'bg-white border border-emerald-300 text-emerald-800');
    });
    ['mix', 'tens', 'missing', 'jumps', 'pv'].forEach(m => {
        const btn = document.getElementById(`addsub-sub-${m}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (m === state.addSubMode ? 'bg-emerald-500 text-white' : 'bg-white border border-emerald-200 text-slate-700');
    });
}

export function setAddSubMode(mode) {
    playSound('click');
    state.addSubMode = mode;
    refreshAddSubChips();
    generateAddSubQuestion();
}

export function generateAddSubQuestion() {
    document.getElementById('addsub-feedback').classList.add('hidden');
    document.getElementById('addsub-next-wrap').classList.add('hidden');

    const modeToggle = document.getElementById('addsub-mode-choice');
    if (modeToggle) modeToggle.parentElement.classList.remove('hidden');

    let mode = state.addSubMode;
    if (mode === 'plus' || mode === 'minus') mode = 'basic';
    if (mode === 'mix') mode = ['basic', 'missing', 'tens', 'jumps'][randInt(0, 3)];

    let a, b, isSub, answer, badge, missing = null;

    if (mode === 'jumps') {
        // CPA-läge: eleven gör tallinjehoppen själv med knapparna.
        isSub = state.addsubOp === 'sub';
        if (state.difficulty === 'easy') {
            a = randInt(11, 60); b = randInt(5, 24);
        } else if (state.difficulty === 'medium') {
            a = randInt(30, 90); b = randInt(15, 55);
        } else {
            a = randInt(120, 850); b = randInt(45, 280);
        }
        if (isSub && a <= b) { const t = a; a = b + randInt(19, 65); b = t; }
        const target = isSub ? a - b : a + b;
        badge = '🐸 Hoppa själv';
        answer = target;
        state.currentAddSub = { a, b, isSub, answer, missing: null, jumps: { pos: a, target, count: 0, best: optimalJumps(b) } };
        document.getElementById('addsub-mode-badge').textContent = badge;
        document.getElementById('addsub-question-text').innerHTML = `Hoppa dig fram till <strong>${a} ${isSub ? '−' : '+'} ${b}</strong> – du står på <strong>${a}</strong>, målet är <strong>${target}</strong> – på <strong>så få hopp som möjligt</strong>!`;
        if (modeToggle) modeToggle.parentElement.classList.add('hidden');
        document.getElementById('addsub-options').classList.add('hidden');
        document.getElementById('addsub-type-wrap').classList.add('hidden');
        setHintSteps('addsub', [
            `<p>Tänk som på tallinjen: först stora <strong>tiotalshopp</strong> (+10/−10), sen små <strong>entalshopp</strong> (+1/−1) för att landa exakt!</p>`,
            `<p>Från ${a} till ${target}: till exempel ${isSub ? '−' : '+'}${Math.floor(b / 10) * 10} sen ${isSub ? '−' : '+'}${b % 10}.</p>`
        ]);
        renderAddSubJumps();
        return;
    }

    if (mode === 'pv') {
        // Platsvärde: siffrans värde, vilken siffra på plats X, eller sätt ihop talet.
        const placeNames = { 1: 'ental', 10: 'tiotal', 100: 'hundratal', 1000: 'tusental' };
        const legend = ['ental', 'tiotal', 'hundratal', 'tusental']
            .map((t, i) => `<span class="pv-num pv-${Math.pow(10, i)} px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-extrabold">${t}</span>`).join('');
        const digits = state.difficulty === 'easy' ? 2 : (state.difficulty === 'medium' ? 3 : 4);
        const n = randInt(Math.pow(10, digits - 1) + 1, Math.pow(10, digits) - 1);
        const s = String(n);
        const variant = randInt(0, 2);
        let qHtml, pvMsg, opts;
        badge = '🔢 Platsvärde';

        if (variant === 0) {
            const pos = randInt(0, s.length - 1);
            const place = Math.pow(10, s.length - 1 - pos);
            const d = Number(s[pos]);
            answer = d * place;
            qHtml = `I talet ${formatPlaceValueHTML(n)} – vad är siffran <strong class="pv-num pv-${place}">${d}</strong> värd?`;
            pvMsg = `🎉 Siffran ${d} står i ${placeNames[place]} – den är värd ${answer}!`;
            const set = new Set([answer, d]);
            [10, 100, 1000].forEach(p => { if (d * p !== answer) set.add(d * p); });
            while (set.size < 4) set.add(answer + [1, -1, 10, -10][randInt(0, 3)]);
            opts = [...set].slice(0, 4);
        } else if (variant === 1) {
            const pos = randInt(0, s.length - 1);
            const place = Math.pow(10, s.length - 1 - pos);
            answer = Number(s[pos]);
            qHtml = `I talet ${formatPlaceValueHTML(n)} – vilken siffra står i <strong class="pv-num pv-${place}">${placeNames[place]}</strong>-positionen?`;
            pvMsg = `🎉 Siffran ${answer} står i ${placeNames[place]}!`;
            const set = new Set(s.split('').map(Number));
            while (set.size < 4) set.add(randInt(0, 9));
            opts = [...set];
        } else {
            const parts = s.split('').map((d, i) => ({ d: Number(d), p: Math.pow(10, s.length - 1 - i) })).filter(x => x.d > 0);
            answer = n;
            qHtml = `Vilket tal blir det? ${parts.map(x => `<span class="pv-num pv-${x.p} font-extrabold">${x.d} ${placeNames[x.p]}</span>`).join(' <span class="text-slate-400">+</span> ')}`;
            pvMsg = `🎉 ${parts.map(x => x.d * x.p).join(' + ')} = ${n}!`;
            const set = new Set([n]);
            let guard = 0;
            while (set.size < 4 && guard++ < 60) {
                const cand = Number(s.split('').sort(() => Math.random() - 0.5).join(''));
                if (String(cand).length === s.length) set.add(cand);
            }
            while (set.size < 4) set.add(n + randInt(1, 5) * 10);
            opts = [...set];
        }

        state.currentAddSub = { mode: 'pv', a: 0, b: 0, isSub: false, answer, missing: null, pvMsg };
        document.getElementById('addsub-mode-badge').textContent = badge;
        const qEl = document.getElementById('addsub-question-text');
        qEl.innerHTML = qHtml;
        document.getElementById('addsub-visual').innerHTML = `
            <div class="inline-flex flex-wrap items-center justify-center gap-1.5 bg-emerald-50/80 border border-emerald-200 px-3.5 py-2 rounded-2xl">
                <span class="text-[11px] font-extrabold text-emerald-900 mr-1">Platsvärden:</span>${legend}
            </div>`;
        setHintSteps('addsub', [
            `<p><strong>Platsvärde:</strong> Siffrans värde beror på var den står! Längst till höger står <strong>entalen</strong>, sen <strong>tiotalen</strong>, sen <strong>hundratalen</strong>, sen <strong>tusentalen</strong>.</p>`,
            `<p>I ${formatPlaceValueHTML(n)} betyder varje färg en plats: <strong>${s.split('').map((d, i) => `${d} → ${placeNames[Math.pow(10, s.length - 1 - i)]}`).join(', ')}</strong> = ${answer}.</p>`
        ]);

        const optsEl = document.getElementById('addsub-options');
        const typeEl = document.getElementById('addsub-type-wrap');
        if (state.inputModes.addsub === 'choice') {
            optsEl.classList.remove('hidden');
            typeEl.classList.add('hidden');
            optsEl.innerHTML = shuffleArray(opts).map(v => `
                <button onclick="checkAddSubChoice(${v})" class="btn-3d bg-white hover:bg-emerald-50 border-3 border-emerald-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">${v}</button>
            `).join('');
        } else {
            optsEl.classList.add('hidden');
            typeEl.classList.remove('hidden');
            const inp = document.getElementById('addsub-type-input');
            inp.value = '';
            inp.focus();
        }
        return;
    }

    if (mode === 'missing') {
        isSub = false;
        badge = '❓ Saknat tal';
        const c = state.difficulty === 'easy' ? randInt(12, 50) : (state.difficulty === 'medium' ? randInt(30, 120) : randInt(120, 900));
        // Addition-modulen frågar "del + ? = hela", subtraktions-modulen
        // "hela − ? = del" eller "? − del = del".
        const variant = state.addsubOp === 'add' ? 0 : randInt(1, 2);
        if (variant === 2) {
            // ? − b = c  → hela är okänd, delarna b och c kända
            b = randInt(4, Math.min(state.difficulty === 'hard' ? 300 : 40, c - 5));
            a = c + b;
            missing = { shown: `? − ${b} = ${c}`, whole: a, part1: c, part2: b, wholeKnown: false, fullEq: `${a} − ${b} = ${c}` };
            answer = a;
        } else {
            const part = randInt(3, c - 3);
            a = 0; b = 0;
            answer = c - part;
            missing = variant === 0
                ? { shown: `${part} + ? = ${c}`, whole: c, part1: part, part2: answer, wholeKnown: true, fullEq: `${part} + ${answer} = ${c}` }
                : { shown: `${c} − ? = ${part}`, whole: c, part1: part, part2: answer, wholeKnown: true, fullEq: `${c} − ${answer} = ${part}` };
        }
    } else if (mode === 'tens') {
        isSub = state.addsubOp === 'sub';
        badge = '🔟 Tiotalshopp';
        if (state.difficulty === 'easy') {
            a = randInt(12, 58);
            b = randInt(1, 3) * 10;
        } else if (state.difficulty === 'medium') {
            a = randInt(35, 89);
            b = randInt(2, 5) * 10;
        } else {
            a = randInt(245, 890);
            b = randInt(6, 18) * 10;
        }
        if (isSub && a <= b) a += b + 24;
        answer = isSub ? a - b : a + b;
    } else {
        isSub = state.addsubOp === 'sub';
        badge = isSub ? '➖ Subtraktion' : '➕ Addition';
        if (state.difficulty === 'easy') {
            a = randInt(11, 45);
            b = randInt(4, 18);
        } else if (state.difficulty === 'medium') {
            a = randInt(28, 76);
            b = randInt(14, 38);
        } else {
            if (isSub) {
                const h1 = randInt(4, 8), t1 = randInt(1, 4), e1 = randInt(1, 5);
                const h2 = randInt(1, h1 - 1), t2 = randInt(t1 + 1, 8), e2 = randInt(e1 + 1, 9);
                a = h1 * 100 + t1 * 10 + e1;
                b = h2 * 100 + t2 * 10 + e2;
            } else {
                a = randInt(168, 675);
                b = randInt(57, 268);
            }
        }
        if (isSub && a <= b) {
            const tmp = a;
            a = b + randInt(19, 65);
            b = tmp;
        }
        answer = isSub ? a - b : a + b;
    }

    state.currentAddSub = { a, b, isSub, answer, missing };
    document.getElementById('addsub-mode-badge').textContent = badge;
    document.getElementById('addsub-question-text').textContent = missing ? missing.shown : `${a} ${isSub ? '−' : '+'} ${b} = ?`;

    if (missing) {
        const otherPart = missing.wholeKnown ? missing.part1 : Math.min(missing.part1, missing.part2);
        const other2 = missing.wholeKnown ? '?' : Math.max(missing.part1, missing.part2);
        document.getElementById('addsub-visual').innerHTML = `
            <div class="w-full max-w-md mx-auto">
                <div class="text-[11px] font-extrabold text-emerald-900 mb-1">Del–helhets-tänket: ${missing.wholeKnown ? 'hela + två delar' : 'okänd hel = del + del'}</div>
                <div class="rounded-2xl ${missing.wholeKnown ? 'bg-emerald-500 text-white' : 'bg-white border-2 border-dashed border-emerald-500 text-emerald-700'} font-display font-bold text-xl py-2.5 text-center">
                    ${missing.wholeKnown ? `Hela: ${missing.whole}` : 'Hela: ?'}
                </div>
                <div class="flex gap-1.5 mt-1.5">
                    <div class="flex-1 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-950 font-display font-bold text-lg py-2 text-center">${otherPart}</div>
                    <div class="flex-1 rounded-2xl ${missing.wholeKnown ? 'bg-white border-2 border-dashed border-emerald-500 text-emerald-700' : 'bg-emerald-100 border-2 border-emerald-300 text-emerald-950'} font-display font-bold text-lg py-2 text-center">${missing.wholeKnown ? '?' : other2}</div>
                </div>
            </div>`;

        setHintSteps('addsub', missing.wholeKnown
            ? [`<p>Helheten är <strong>${missing.whole}</strong> och en del är <strong>${missing.part1}</strong>. Del + del = hela!</p>`,
               `<p>Hitta den andra delen: ${missing.whole} − ${missing.part1} = <strong>${answer}</strong>!</p>`]
            : [`<p>Den okända hela delades i <strong>${missing.part1}</strong> och <strong>${missing.part2}</strong>.</p>`,
               `<p>Lägg ihop delarna: ${missing.part1} + ${missing.part2} = <strong>${answer}</strong>!</p>`]);
    } else {
    const tensPart = Math.floor(b / 10) * 10;
    const onesPart = b % 10;
    document.getElementById('addsub-visual').innerHTML = `
        <div class="inline-flex flex-wrap items-center justify-center gap-2 bg-emerald-50/80 border border-emerald-200 px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold text-emerald-950">
            <span>💡 Dela upp ${formatPlaceValueHTML(b)}:</span>
            ${tensPart > 0 ? `<span class="px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-300"><span class="pv-num pv-10">${tensPart}</span> (tiotal)</span>` : ''}
            ${onesPart > 0 ? `<span class="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-300"><span class="pv-num pv-1">${onesPart}</span> (ental)</span>` : ''}
        </div>
    `;

    const midVal = isSub ? a - tensPart : a + tensPart;
    if (tensPart > 0 && onesPart > 0) {
        setHintSteps('addsub', [
            `<p>Dela upp <strong>${formatPlaceValueHTML(b)}</strong> i tiotal (<strong class="pv-num pv-10">${tensPart}</strong>) och ental (<strong class="pv-num pv-1">${onesPart}</strong>).</p>`,
            { html: `<p>Hoppa på tallinjen – först tiotalen, sedan entalen:</p>
             ${buildNumberLineJumpSVG(a, midVal, answer, `${isSub ? '−' : '+'}${tensPart}`, `${isSub ? '−' : '+'}${onesPart}`, isSub)}`,
              anim: { fly: [
                  { text: '🐸', from: '[data-nl="0"]', to: '[data-nl="1"]', hideTarget: false, fill: false, cls: 'fly-emoji', delay: 800 },
                  { text: '🐸', from: '[data-nl="1"]', to: '[data-nl="2"]', hideTarget: false, fill: false, cls: 'fly-emoji', delay: 1900 },
              ] } },
        ]);
    } else {
        setHintSteps('addsub', [
            `<p>Starta på <strong>${a}</strong> och ta ett stort hopp på <strong>${isSub ? '−' : '+'}${b}</strong>:</p>
             <div class="my-2 flex items-center justify-center gap-2 font-display font-bold text-base">
                <span>${a} ${isSub ? '−' : '+'} ${b}</span>
                <span class="hint-arrow-nudge text-emerald-700">➔</span>
                <span class="px-4 py-1 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-950">${answer}</span>
             </div>`
        ]);
    }
    }

    const optsEl = document.getElementById('addsub-options');
    const typeEl = document.getElementById('addsub-type-wrap');
    if (state.inputModes.addsub === 'choice') {
        optsEl.classList.remove('hidden');
        typeEl.classList.add('hidden');
        const set = new Set([answer]);
        while (set.size < 4) {
            const cand = answer + [-10, -2, -1, 1, 2, 10][randInt(0, 5)];
            if (cand > 0) set.add(cand);
        }
        optsEl.innerHTML = shuffleArray([...set]).map(v => `
            <button onclick="checkAddSubChoice(${v})" class="btn-3d bg-white hover:bg-emerald-50 border-3 border-emerald-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
                ${v}
            </button>
        `).join('');
    } else {
        optsEl.classList.add('hidden');
        typeEl.classList.remove('hidden');
        const inp = document.getElementById('addsub-type-input');
        inp.value = '';
        inp.focus();
    }
}

// En kort tänknugget efter rätt svar – visar en strategi eller ett matteord.
function thinkAddSub({ a, b, isSub, answer, missing }) {
    if (missing) return '💡 Kolla alltid: sätt in svaret i ekvationen och se att den stämmer!';
    const op = isSub ? '−' : '+';
    const tens = Math.floor(b / 10) * 10, ones = b % 10;
    if (tens > 0 && ones > 0) {
        const mid = isSub ? a - tens : a + tens;
        return `💡 Tänk: ${a} ${op} ${tens} = ${mid}, sen ${op} ${ones} = ${answer}.`;
    }
    const aOnes = a % 10;
    if (!isSub && b < 10 && aOnes + b >= 10 && aOnes > 0) {
        const gap = 10 - aOnes;
        return `💡 Tänk "bron till tia": ${a} + ${gap} = ${a + gap}, sen +${b - gap} = ${answer}.`;
    }
    if (isSub && b < 10 && aOnes > 0 && aOnes < b) {
        return `💡 Tänk "bron till tia": ${a} − ${aOnes} = ${a - aOnes}, sen −${b - aOnes} = ${answer}.`;
    }
    return `💡 Matteord: svaret kallas <strong>${isSub ? 'differens' : 'summa'}</strong>!`;
}

export function checkAddSubChoice(val) {
    if (!document.getElementById('addsub-next-wrap').classList.contains('hidden')) return;
    const cur = state.currentAddSub;
    if (cur.mode === 'pv') {
        if (val === cur.answer) {
            addReward(1);
            showFeedback('addsub-feedback', true, cur.pvMsg);
            document.getElementById('addsub-next-wrap').classList.remove('hidden');
        } else {
            resetStreak();
            showFeedback('addsub-feedback', false, `🤔 Inte riktigt ${val} – titta på färgerna! Varje plats har sin egen färg.`);
        }
        return;
    }
    const { a, b, isSub, answer, missing } = cur;
    if (val === answer) {
        addReward(1);
        const eq = missing ? missing.fullEq : `${a} ${isSub ? '−' : '+'} ${b} = ${answer}`;
        showFeedback('addsub-feedback', true, `🎉 Snyggt! ${eq}! ${thinkAddSub(cur)}`);
        document.getElementById('addsub-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('addsub-feedback', false, missing
            ? '🤔 Tänk del–helhet: hela = del + del. Kika på "💡 Visa hur man tänker"!'
            : `🤔 Inte riktigt ${val} – kika på tallinjehoppen under "💡 Visa hur man tänker"!`);
    }
}

export function checkAddSubTyped() {
    const val = parseInt(document.getElementById('addsub-type-input').value, 10);
    if (isNaN(val)) return;
    checkAddSubChoice(val);
}

// Minsta antalet hopp (±10/±5/±1) för en sträcka — tillåter omväg via
// överskjut, t.ex. 9 = +10,−1 (2 hopp). Dynamisk programmering.
function optimalJumps(dist) {
    const d = Math.abs(dist);
    const dp = [0];
    for (let n = 1; n <= d + 10; n++) {
        dp[n] = Math.min(
            (dp[Math.max(0, n - 1)] || 0) + 1,
            n >= 5 ? dp[n - 5] + 1 : Infinity,
            n >= 10 ? dp[n - 10] + 1 : Infinity
        );
    }
    // Överskjut: hoppa förbi och tillbaka kan ge färre hopp (9 → +10,−1).
    let best = dp[d];
    for (let over = 1; over <= 10 && d + over < dp.length; over++) {
        const via = dp[d + over] + dp[over];
        if (via < best) best = via;
    }
    return best;
}

// Hoppa själv-läget (CPA): eleven hoppar på tallinjen med knapparna.
function renderAddSubJumps() {
    const cur = state.currentAddSub;
    const j = cur.jumps;
    const lo = Math.min(cur.a, j.target) - 8;
    const hi = Math.max(cur.a, j.target) + 8;
    j.lo = lo; j.hi = hi;
    const pct = (v) => ((v - lo) / (hi - lo)) * 100;
    document.getElementById('addsub-visual').innerHTML = `
        <div class="w-full max-w-lg mx-auto">
            <div class="font-display font-bold text-lg text-emerald-950 mb-1">
                🐸 Du är på <span class="text-emerald-700" id="jump-pos">${j.pos}</span> • målet är ${j.target} • kvar: <span id="jump-left">${j.target - j.pos}</span> • hopp: <span id="jump-count">0</span>
            </div>
            <div class="relative h-24 mt-2">
                <div class="absolute left-0 right-0 top-14 h-1.5 bg-emerald-200 rounded-full"></div>
                <div id="jump-arcs" class="absolute inset-x-0 top-0 pointer-events-none" style="height:56px"></div>
                <div class="absolute top-5 -translate-x-1/2 text-center" style="left:${pct(j.target)}%">
                    <div class="text-xl">🚩</div>
                    <div class="text-[10px] font-extrabold text-emerald-800">${j.target}</div>
                </div>
                <div id="jump-frog" class="absolute top-11 -translate-x-1/2 text-center" style="left:${pct(j.pos)}%; transition: left 0.45s cubic-bezier(0.22,1.3,0.36,1);">
                    <div id="jump-frog-body" class="text-2xl">${j.pos === j.target ? '🎉' : '🐸'}</div>
                    <div id="jump-pos-label" class="text-xs font-extrabold text-emerald-900 bg-white/90 rounded-lg px-1.5 border border-emerald-300">${j.pos}</div>
                </div>
            </div>
            <div class="flex flex-wrap justify-center gap-2 mt-2">
                <button onclick="addSubJump(10)" class="btn-3d bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold px-4 py-2 rounded-xl">+10</button>
                <button onclick="addSubJump(5)" class="btn-3d bg-emerald-400 hover:bg-emerald-500 text-white font-display font-bold px-4 py-2 rounded-xl">+5</button>
                <button onclick="addSubJump(1)" class="btn-3d bg-emerald-300 hover:bg-emerald-400 text-emerald-950 font-display font-bold px-4 py-2 rounded-xl">+1</button>
                <button onclick="addSubJump(-1)" class="btn-3d bg-slate-300 hover:bg-slate-400 text-slate-800 font-display font-bold px-4 py-2 rounded-xl">−1</button>
                <button onclick="addSubJump(-5)" class="btn-3d bg-slate-400 hover:bg-slate-500 text-white font-display font-bold px-4 py-2 rounded-xl">−5</button>
                <button onclick="addSubJump(-10)" class="btn-3d bg-slate-500 hover:bg-slate-600 text-white font-display font-bold px-4 py-2 rounded-xl">−10</button>
            </div>
        </div>`;
}

// Uppdaterar grodans position utan att bygga om DOM:en — då hinner
// left-transitionen spela och grodan "glidhoppar" i stället för att teleportera.
function updateJumpVisual(oldPos) {
    const j = state.currentAddSub.jumps;
    const pct = (v) => ((v - j.lo) / (j.hi - j.lo)) * 100;
    const frog = document.getElementById('jump-frog');
    if (!frog) return;
    frog.style.left = pct(j.pos) + '%';
    const body = document.getElementById('jump-frog-body');
    body.textContent = j.pos === j.target ? '🎉' : '🐸';
    body.classList.remove('frog-hop');
    void body.offsetWidth;
    body.classList.add('frog-hop');
    document.getElementById('jump-pos-label').textContent = j.pos;
    document.getElementById('jump-pos').textContent = j.pos;
    document.getElementById('jump-left').textContent = j.target - j.pos;
    const counter = document.getElementById('jump-count');
    if (counter) counter.textContent = j.count;
    const arcs = document.getElementById('jump-arcs');
    const x0 = pct(oldPos), x1 = pct(j.pos);
    const arcH = Math.min(12 + Math.abs(x1 - x0) * 0.35, 34);
    const arc = document.createElement('div');
    arc.className = 'jump-arc';
    arc.style.left = Math.min(x0, x1) + '%';
    arc.style.width = Math.abs(x1 - x0) + '%';
    arc.style.height = arcH + 'px';
    arcs.appendChild(arc);
    const d = j.pos - oldPos;
    const label = document.createElement('div');
    label.className = 'jump-arc-label';
    label.textContent = (d > 0 ? '+' : '−') + Math.abs(d);
    label.style.left = ((x0 + x1) / 2) + '%';
    label.style.bottom = (arcH - 4) + 'px';
    arcs.appendChild(label);
}

export function addSubJump(d) {
    const cur = state.currentAddSub;
    if (!cur || !cur.jumps || !document.getElementById('addsub-next-wrap').classList.contains('hidden')) return;
    playSound('click');
    const oldPos = cur.jumps.pos;
    cur.jumps.pos += d;
    cur.jumps.count++;
    updateJumpVisual(oldPos);
    if (cur.jumps.pos === cur.jumps.target) {
        const { count, best } = cur.jumps;
        addReward(count === best ? 3 : 2);
        const eq = `${cur.a} ${cur.isSub ? '−' : '+'} ${cur.b} = ${cur.answer}`;
        const msg = count === best
            ? `🏆 FÄRSTA MÖJLIGA! ${eq} – du klarade det på bara ${count} hopp, smart strategi!`
            : count <= best + 2
                ? `🎉 Bra! ${eq} – du använde ${count} hopp, det snabbaste sättet är ${best}. Nära!`
                : `🐸 Du kom fram! ${eq} – men med smarta stora hopp räcker ${best} st. Prova fler tiotalshopp nästa gång!`;
        showFeedback('addsub-feedback', true, msg);
        document.getElementById('addsub-next-wrap').classList.remove('hidden');
    }
}
