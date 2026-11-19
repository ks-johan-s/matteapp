// js/modules/combo.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { formatFractionHTML, randInt, showFeedback, shuffleArray, styleNumbersIn } from '../utils.js';

export function setComboHands(on) {
    playSound('click');
    state.comboHands = !!on;
    const btn = document.getElementById('combo-hands-btn');
    if (btn) btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
        (state.comboHands ? 'bg-indigo-600 text-white' : 'bg-white border border-indigo-200 text-slate-700');
    generateComboQuestion();
}

/* =============================================================
   9. MODUL 6: BRÅK AV ANTAL
============================================================== */
export function generateComboQuestion() {
    document.getElementById('combo-feedback').classList.add('hidden');
    document.getElementById('combo-next-wrap').classList.add('hidden');

    const isHard = state.difficulty === 'hard';
    const den = isHard ? [5, 6, 7, 8, 9, 10][randInt(0, 5)] : [2, 3, 4, 5][randInt(0, 3)];
    const num = state.difficulty === 'easy' ? 1 : randInt(isHard ? 2 : 1, den - 1);
    const perPile = isHard ? randInt(5, 11) : randInt(2, 4);
    const total = den * perPile;
    const answer = num * perPile;

    const modeToggle = document.getElementById('combo-mode-choice');
    if (modeToggle) modeToggle.parentElement.classList.remove('hidden');

    if (state.comboHands) {
        // CPA-läge: fas 1 – fördela alla äpplen lika, fas 2 – markera num högar.
        state.currentCombo = { num, den, total, perPile, answer, hands: { piles: Array(den).fill(0), history: [], taken: new Set(), phase: 'dist' } };
        if (modeToggle) modeToggle.parentElement.classList.add('hidden');
        document.getElementById('combo-options').classList.add('hidden');
        document.getElementById('combo-type-wrap').classList.add('hidden');
        setHintSteps('combo', [
            `<p><strong>Fas 1:</strong> Klicka på högarna och dela ut <strong>ett äpple i taget</strong> – varv efter varv tills brickan är tom. Alla högar ska få lika många!</p>`,
            `<p><strong>Fas 2:</strong> När högar är lika, klicka på <strong>${num} högar</strong> för att "ta" ${formatFractionHTML(num, den)} av ${total}!</p>`
        ]);
        renderComboHands();
        return;
    }

    state.currentCombo = { num, den, total, perPile, answer };
    document.getElementById('combo-question-text').innerHTML = `Hur mycket är ${formatFractionHTML(num, den)} av ${total} äpplen?`;

    let pilesHtml = '';
    for (let p = 0; p < den; p++) {
        const isTaken = p < num;
        const applesDisplay = perPile <= 6 ? '🍎'.repeat(perPile) : `🍎 × ${perPile}`;
        pilesHtml += `
            <div class="pile-pop px-3 py-2 rounded-2xl border-2 ${isTaken ? 'bg-indigo-100 border-indigo-400' : 'bg-slate-50 border-slate-200 opacity-75'}" style="animation-delay:${p * 110}ms">
                <div class="text-base sm:text-lg font-display font-bold text-slate-900">${applesDisplay}</div>
                <div class="text-[11px] font-extrabold ${isTaken ? 'text-indigo-900' : 'text-slate-500'}">Hög ${p + 1} (${perPile} st)</div>
            </div>
        `;
    }
    document.getElementById('combo-visual-container').innerHTML = pilesHtml;

    setHintSteps('combo', [
        `<p><strong>Steg 1:</strong> Dela upp alla <strong>${total} äpplen</strong> i <strong>${den} lika högar</strong> (${total} ÷ ${den} = <strong>${perPile} äpplen</strong> i varje hög).</p>`,
        `<p><strong>Steg 2:</strong> Vi ska ta <strong>${num}</strong> sådana högar: <strong>${num} × ${perPile} = ${answer} äpplen</strong>!</p>`
    ]);

    const optsEl = document.getElementById('combo-options');
    const typeEl = document.getElementById('combo-type-wrap');
    if (state.inputModes.combo === 'choice') {
        optsEl.classList.remove('hidden');
        typeEl.classList.add('hidden');
        const set = new Set([answer]);
        while (set.size < 4) {
            const cand = answer + [-perPile, perPile, -2, 2, 1, -1][randInt(0, 5)];
            if (cand > 0 && cand <= total) set.add(cand);
        }
        optsEl.innerHTML = shuffleArray([...set]).map(v => `
            <button onclick="checkComboChoice(${v})" class="btn-3d bg-white hover:bg-indigo-50 border-3 border-indigo-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
                ${v} st
            </button>
        `).join('');
    } else {
        optsEl.classList.add('hidden');
        typeEl.classList.remove('hidden');
        const inp = document.getElementById('combo-type-input');
        inp.value = '';
        inp.focus();
    }
}

export function checkComboChoice(val) {
    if (!document.getElementById('combo-next-wrap').classList.contains('hidden')) return;
    const { answer } = state.currentCombo;
    if (val === answer) {
        addReward(1);
        showFeedback('combo-feedback', true, `🎉 Rätt! Svaret är ${answer} äpplen!`);
        document.getElementById('combo-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('combo-feedback', false, '🤔 Räkna hur många äpplen som ligger i de markerade högarna!');
    }
}

export function checkComboTyped() {
    const val = parseInt(document.getElementById('combo-type-input').value, 10);
    if (isNaN(val)) return;
    checkComboChoice(val);
}

// Dela själv-läget (CPA): fas 1 fördela lika, fas 2 markera num högar.
function renderComboHands() {
    const cur = state.currentCombo;
    const h = cur.hands;
    const left = cur.total - h.piles.reduce((s, n) => s + n, 0);
    const qEl = document.getElementById('combo-question-text');

    if (h.phase === 'dist') {
        qEl.innerHTML = `Dela ut <strong>${cur.total}</strong> 🍎 mellan <strong>${cur.den} högar</strong> – alla ska få lika många!`;
    } else {
        const takenItems = [...h.taken].reduce((s, i) => s + h.piles[i], 0);
        qEl.innerHTML = `Klicka på <strong>${cur.num}</strong> ${cur.num === 1 ? 'hög' : 'högar'} för att ta ${formatFractionHTML(cur.num, cur.den)} av ${cur.total}.<br><span class="text-indigo-600">Valt: ${h.taken.size} ${h.taken.size === 1 ? 'hög' : 'högar'} = ${takenItems} 🍎</span>`;
    }
    styleNumbersIn(qEl);

    const trayHtml = h.phase === 'dist' ? `
        <div class="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 mb-3">
            <div class="text-xs font-extrabold text-amber-900 mb-1">🧺 Brickan – ${left} kvar att dela ut:</div>
            <div class="text-xl sm:text-2xl leading-relaxed">${left > 0
                ? '🍎'.repeat(Math.min(left, 20)) + (left > 20 ? ` <span class="text-sm font-extrabold">× ${left}</span>` : '')
                : '<span class="text-sm font-extrabold text-emerald-700">Tom – alla är utdelade! ✓</span>'}</div>
        </div>` : '';

    const pilesHtml = h.piles.map((n, i) => {
        const taken = h.taken.has(i);
        return `
            <button onclick="comboHandsClick(${i})" class="btn-3d border-2 rounded-2xl px-4 py-3 min-w-[84px] ${taken ? 'bg-indigo-500 border-indigo-700' : 'bg-indigo-50 hover:bg-indigo-100 border-indigo-300'}">
                <div class="text-lg min-h-[1.6em] ${taken ? 'text-white' : ''}">${n > 0
                    ? '🍎'.repeat(Math.min(n, 8)) + (n > 8 ? `<span class="text-xs font-extrabold"> ×${n}</span>` : '')
                    : '<span class="text-slate-300 font-extrabold">+</span>'}</div>
                <div class="text-[11px] font-extrabold ${taken ? 'text-indigo-100' : 'text-indigo-900'}">${taken ? '✓ Tagits!' : `Hög ${i + 1}: ${n} st`}</div>
            </button>`;
    }).join('');

    const footer = h.phase === 'dist' ? `
        <div class="flex justify-center gap-3 mt-4">
            <button onclick="comboHandsUndo()" class="btn-3d bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm px-4 py-2 rounded-xl ${h.history.length === 0 ? 'opacity-40 pointer-events-none' : ''}">↩️ Ta tillbaka</button>
            <button onclick="checkComboHandsDist()" class="btn-3d bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-display font-bold text-lg px-6 py-2 rounded-xl">Klart delat! ➔</button>
        </div>` : `
        <div class="flex justify-center gap-3 mt-4">
            <button onclick="checkComboHandsTake()" class="btn-3d bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-display font-bold text-lg px-6 py-2 rounded-xl">Ta dessa högar! ✓</button>
        </div>`;

    document.getElementById('combo-visual-container').innerHTML = `
        <div class="w-full max-w-xl">${trayHtml}
            <div class="flex flex-wrap justify-center gap-3">${pilesHtml}</div>
            ${footer}
        </div>`;
}

export function comboHandsClick(i) {
    const cur = state.currentCombo;
    const h = cur && cur.hands;
    if (!h) return;
    playSound('click');
    if (h.phase === 'dist') {
        const left = cur.total - h.piles.reduce((s, n) => s + n, 0);
        if (left <= 0) return;
        h.piles[i]++;
        h.history.push(i);
    } else {
        if (h.taken.has(i)) h.taken.delete(i);
        else if (h.taken.size < cur.num) h.taken.add(i);
    }
    renderComboHands();
}

export function comboHandsUndo() {
    const cur = state.currentCombo;
    const h = cur && cur.hands;
    if (!h || h.phase !== 'dist' || h.history.length === 0) return;
    playSound('click');
    h.piles[h.history.pop()]--;
    renderComboHands();
}

export function checkComboHandsDist() {
    const cur = state.currentCombo;
    const h = cur && cur.hands;
    if (!h || h.phase !== 'dist') return;
    const left = cur.total - h.piles.reduce((s, n) => s + n, 0);
    if (left > 0) {
        showFeedback('combo-feedback', false, `🧺 Det finns fortfarande ${left} 🍎 kvar i brickan – dela ut alla!`);
        return;
    }
    const min = Math.min(...h.piles), max = Math.max(...h.piles);
    if (min !== max) {
        showFeedback('combo-feedback', false, `🤔 Nästan! Högarna har inte lika många – en har ${max}, en annan ${min}. Justera med "↩️ Ta tillbaka"!`);
        return;
    }
    h.phase = 'take';
    playSound('correct');
    showFeedback('combo-feedback', true, `👏 Bra delat! Varje hög fick ${cur.perPile} – nu tar du ${cur.num} ${cur.num === 1 ? 'hög' : 'högar'}!`);
    renderComboHands();
}

export function checkComboHandsTake() {
    const cur = state.currentCombo;
    const h = cur && cur.hands;
    if (!h || h.phase !== 'take') return;
    if (h.taken.size !== cur.num) {
        showFeedback('combo-feedback', false, `🤔 Du ska ta ${formatFractionHTML(cur.num, cur.den)} – det är ${cur.num} av ${cur.den} högar. Du har valt ${h.taken.size}!`);
        return;
    }
    const items = [...h.taken].reduce((s, i) => s + h.piles[i], 0);
    addReward(2);
    showFeedback('combo-feedback', true, `🎉 ${formatFractionHTML(cur.num, cur.den)} av ${cur.total} = ${items} 🍎 – du delade upp och tog rätt högar själv!`);
    document.getElementById('combo-next-wrap').classList.remove('hidden');
}
