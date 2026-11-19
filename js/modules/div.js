// js/modules/div.js — MODUL: DIVISION (DELA LIKA, PÅSAR & TABELL-DIVISION)
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { randInt, showFeedback, shuffleArray } from '../utils.js';

const DIV_ITEMS = ['🍎', '🍪', '⚽', '🍓', '🥕', '🧃', '🍊'];
const DIV_WHO = ['barn', 'vänner', 'grisar', 'ugglor'];

export function setDivSubMode(mode) {
    playSound('click');
    state.divSubMode = mode;
    ['mix', 'share', 'group', 'quick', 'missing', 'hands'].forEach(m => {
        const btn = document.getElementById(`div-sub-${m}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (m === mode ? 'bg-teal-600 text-white' : 'bg-white border border-teal-200 text-slate-700');
    });
    generateDivQuestion();
}

export function generateDivQuestion() {
    document.getElementById('div-feedback').classList.add('hidden');
    document.getElementById('div-next-wrap').classList.add('hidden');
    const modeToggle = document.getElementById('div-mode-choice');
    if (modeToggle) modeToggle.parentElement.classList.remove('hidden');

    let mode = state.divSubMode;
    if (mode === 'mix') mode = ['share', 'group', 'quick', 'missing', 'hands'][randInt(0, 4)];

    const diff = state.difficulty;
    let divisor, quotient;
    if (mode === 'quick') {
        divisor = diff === 'easy' ? randInt(2, 5) : (diff === 'medium' ? randInt(2, 9) : [4, 6, 7, 8, 9, 11, 12][randInt(0, 6)]);
        quotient = randInt(diff === 'easy' ? 2 : 3, diff === 'hard' ? 12 : 10);
    } else {
        divisor = diff === 'easy' ? randInt(2, 3) : (diff === 'medium' ? randInt(2, 5) : randInt(3, 6));
        quotient = randInt(diff === 'easy' ? 2 : 3, diff === 'hard' ? 9 : 7);
    }
    const total = divisor * quotient;
    const item = DIV_ITEMS[randInt(0, DIV_ITEMS.length - 1)];
    const answer = quotient;
    let answerOverride = null, fullEq = null;

    const qEl = document.getElementById('div-question-text');
    const badgeEl = document.getElementById('div-mode-badge');
    const visEl = document.getElementById('div-visual-container');
    let hints;

    if (mode === 'share') {
        const who = DIV_WHO[randInt(0, DIV_WHO.length - 1)];
        badgeEl.textContent = '🧺 Dela lika';
        qEl.innerHTML = `Dela <strong>${total}</strong> ${item} lika mellan <strong>${divisor} ${who}</strong>.<br>Hur många får var och en?`;
        const pileLabel = who === 'barn' ? 'Barn' : 'Hög';
        visEl.innerHTML = `<div class="w-full text-sm font-extrabold text-teal-900 mb-1">👆 ${total} ${item} delas ut, ett i taget:</div>` +
            Array.from({ length: divisor }, (_, p) => `
                <div class="pile-pop px-3 py-2 rounded-2xl border-2 bg-teal-50 border-teal-300" style="animation-delay:${p * 160}ms">
                    <div class="text-base sm:text-lg">${item.repeat(quotient)}</div>
                    <div class="text-[11px] font-extrabold text-teal-900">${pileLabel} ${p + 1}</div>
                </div>`).join('');
        hints = [
            `<p>Tänk <strong>"dela ut"</strong>: ge ett ${item} i taget till varje hög, varv efter varv, tills alla ${total} är slut.</p>`,
            `<p>När alla är utdelade ligger det <strong>${quotient} i varje hög</strong>: ${total} ÷ ${divisor} = <strong>${quotient}</strong>!</p>`
        ];
    } else if (mode === 'group') {
        badgeEl.textContent = '🛍️ Påsar';
        qEl.innerHTML = `Lägg <strong>${total}</strong> ${item} i påsar med <strong>${divisor}</strong> i varje påse.<br>Hur många påsar behövs?`;
        visEl.innerHTML = `<div class="w-full text-sm font-extrabold text-amber-900 mb-1">👆 ${total} ${item} packas, ${divisor} åt gången:</div>` +
            Array.from({ length: quotient }, (_, b) => `
                <div class="pile-pop px-3 py-2 rounded-2xl border-2 bg-amber-50 border-amber-300" style="animation-delay:${b * 160}ms">
                    <div class="text-base sm:text-lg">🛍️ ${item.repeat(divisor)}</div>
                    <div class="text-[11px] font-extrabold text-amber-900">Påse ${b + 1}</div>
                </div>`).join('');
        hints = [
            `<p>Räkna hur många gånger <strong>${divisor}</strong> får plats i ${total}: ${Array.from({ length: quotient }, (_, i) => `${divisor * (i + 1)}`).join(' ➔ ')}.</p>`,
            `<p>Det blev <strong>${quotient} påsar</strong>: ${total} ÷ ${divisor} = <strong>${quotient}</strong>!</p>`
        ];
    } else if (mode === 'missing') {
        const missDividend = Math.random() < 0.5;
        if (missDividend) {
            // ? ÷ d = q  → saknat total; multiplikation baklänges
            badgeEl.textContent = '❓ Saknat tal';
            qEl.innerHTML = `<span class="text-teal-700">?</span> ÷ ${divisor} = ${quotient}`;
            visEl.innerHTML = `<div class="w-full text-sm font-extrabold text-teal-900 mb-1">👆 Ett okänt antal delades i ${divisor} högar – varje hög fick ${quotient}:</div>` +
                Array.from({ length: divisor }, (_, p) => `
                    <div class="pile-pop px-3 py-2 rounded-2xl border-2 bg-teal-50 border-teal-300" style="animation-delay:${p * 130}ms">
                        <div class="text-base sm:text-lg">${item.repeat(quotient)}</div>
                        <div class="text-[11px] font-extrabold text-teal-900">Hög ${p + 1}: ${quotient} st</div>
                    </div>`).join('');
            hints = [
                `<p>Varje hög fick <strong>${quotient}</strong> och det är <strong>${divisor} högar</strong>. Det okända antalet = antal högar × per hög!</p>`,
                `<p>${divisor} × ${quotient} = <strong>${total}</strong> – division är multiplikation baklänges!</p>`
            ];
            answerOverride = total;
            fullEq = `${total} ÷ ${divisor} = ${quotient}`;
        } else {
            // t ÷ ? = q  → saknad divisor; hur många högar?
            badgeEl.textContent = '❓ Saknat tal';
            qEl.innerHTML = `${total} ÷ <span class="text-teal-700">?</span> = ${quotient}`;
            visEl.innerHTML = `<div class="w-full text-sm font-extrabold text-amber-900 mb-1">👆 ${total} ${item} packades i högar med ${quotient} i varje – <strong>räkna högarana!</strong></div>` +
                Array.from({ length: divisor }, (_, p) => `
                    <div class="pile-pop px-3 py-2 rounded-2xl border-2 bg-amber-50 border-amber-300" style="animation-delay:${p * 130}ms">
                        <div class="text-base sm:text-lg">${item.repeat(quotient)}</div>
                        <div class="text-[11px] font-extrabold text-amber-900">Hög ${p + 1}</div>
                    </div>`).join('');
            hints = [
                `<p>${total} ska bli högar med <strong>${quotient}</strong> i varje. Räkna högarana i bilden – eller tänk: <strong>vilken tabell</strong> når ${total} i ${quotient} skutt?</p>`,
                `<p>${quotient} × ? = ${total} ➔ det är <strong>${divisor} högar</strong>: ${total} ÷ ${divisor} = ${quotient}!</p>`
            ];
            answerOverride = divisor;
            fullEq = `${total} ÷ ${divisor} = ${quotient}`;
        }
    } else if (mode === 'hands') {
        badgeEl.textContent = '🤲 Dela själv';
        qEl.innerHTML = `Dela ut <strong>${total}</strong> ${item} mellan <strong>${divisor} högar</strong> – klicka på en hög för att lägga dit ett ${item} i taget. Alla ska få <strong>lika många</strong>!`;
        state.currentDiv = { mode, total, divisor, quotient, item, answer: quotient, piles: Array(divisor).fill(0), history: [] };
        hints = [
            `<p>Ge <strong>ett ${item} i taget</strong> åt varje hög – samma turordning varje varv, som när man delar ut kort!</p>`,
            `<p>När alla ${total} är utdelade ska varje hög ha <strong>${quotient}</strong> – det betyder ${total} ÷ ${divisor} = ${quotient}.</p>`
        ];
        setHintSteps('div', hints);
        if (modeToggle) modeToggle.parentElement.classList.add('hidden');
        document.getElementById('div-options').classList.add('hidden');
        document.getElementById('div-type-wrap').classList.add('hidden');
        renderDivHands();
        return;
    } else {
        badgeEl.textContent = '⚡ Snabb division';
        qEl.innerHTML = `${total} ÷ ${divisor} = <span class="text-teal-700">?</span>`;
        visEl.innerHTML = `
            <div class="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-teal-50 border-2 border-teal-200 rounded-2xl px-5 py-3">
                <span class="text-sm font-extrabold text-teal-900">💡 Tänk baklänges:</span>
                <span class="font-display font-bold text-2xl sm:text-3xl text-slate-900">${divisor} × ? = ${total}</span>
            </div>`;
        hints = [
            `<p>Division är multiplikation <strong>baklänges</strong>: fråga dig "<strong>${divisor} gånger vilket tal blir ${total}</strong>?"</p>`,
            `<p>Prova ${divisor}-tabellen: ${divisor} × ${quotient} = ${total} → svaret är <strong>${quotient}</strong>!</p>`
        ];
    }

    state.currentDiv = { mode, total, divisor, quotient, answer: answerOverride ?? answer, fullEq };
    setHintSteps('div', hints);

    const optsEl = document.getElementById('div-options');
    const typeEl = document.getElementById('div-type-wrap');
    if (state.inputModes.div === 'choice') {
        optsEl.classList.remove('hidden');
        typeEl.classList.add('hidden');
        const set = new Set([answer]);
        while (set.size < 4) {
            const cand = answer + [-2, -1, 1, 2, divisor, -divisor][randInt(0, 5)];
            if (cand > 0 && cand <= total) set.add(cand);
        }
        optsEl.innerHTML = shuffleArray([...set]).map(v => `
            <button onclick="checkDivChoice(${v})" class="btn-3d bg-white hover:bg-teal-50 border-3 border-teal-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
                ${v}
            </button>
        `).join('');
    } else {
        optsEl.classList.add('hidden');
        typeEl.classList.remove('hidden');
        const inp = document.getElementById('div-type-input');
        inp.value = '';
        inp.focus();
    }
}

export function checkDivChoice(val) {
    if (!document.getElementById('div-next-wrap').classList.contains('hidden')) return;
    const { total, divisor, answer, fullEq } = state.currentDiv;
    if (val === answer) {
        addReward(1);
        showFeedback('div-feedback', true, `🎉 Rätt! ${fullEq || `${total} ÷ ${divisor} = ${answer}`}!`);
        document.getElementById('div-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('div-feedback', false, '🤔 Inte riktigt – dela ut ett i taget eller kika på "💡 Visa hur man tänker"!');
    }
}

export function checkDivTyped() {
    const val = parseInt(document.getElementById('div-type-input').value, 10);
    if (isNaN(val)) return;
    checkDivChoice(val);
}

// Dela själv-läget: eleven fördelar objekten i högar för hand (CPA – konkret steg).
function renderDivHands() {
    const cur = state.currentDiv;
    const left = cur.total - cur.piles.reduce((s, n) => s + n, 0);
    const item = cur.item;
    document.getElementById('div-visual-container').innerHTML = `
        <div class="w-full max-w-xl">
            <div class="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3 mb-3">
                <div class="text-xs font-extrabold text-amber-900 mb-1">🧺 Brickan – ${left} kvar att dela ut:</div>
                <div class="text-xl sm:text-2xl leading-relaxed">${left > 0
                    ? item.repeat(Math.min(left, 20)) + (left > 20 ? ` <span class="text-sm font-extrabold">× ${left}</span>` : '')
                    : '<span class="text-sm font-extrabold text-emerald-700">Tom – alla är utdelade! ✓</span>'}</div>
            </div>
            <div class="flex flex-wrap justify-center gap-3">
                ${cur.piles.map((n, i) => `
                    <button onclick="divHandsDrop(${i})" class="btn-3d bg-teal-50 hover:bg-teal-100 border-2 border-teal-300 rounded-2xl px-4 py-3 min-w-[84px]">
                        <div class="text-lg min-h-[1.6em]">${n > 0
                            ? item.repeat(Math.min(n, 8)) + (n > 8 ? `<span class="text-xs font-extrabold"> ×${n}</span>` : '')
                            : '<span class="text-slate-300 font-extrabold">+</span>'}</div>
                        <div class="text-[11px] font-extrabold text-teal-900">Hög ${i + 1}: ${n} st</div>
                    </button>`).join('')}
            </div>
            <div class="flex justify-center gap-3 mt-4">
                <button onclick="divHandsUndo()" class="btn-3d bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm px-4 py-2 rounded-xl ${cur.history.length === 0 ? 'opacity-40 pointer-events-none' : ''}">↩️ Ta tillbaka</button>
                <button onclick="checkDivHands()" class="btn-3d bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-display font-bold text-lg px-6 py-2 rounded-xl">Klar! ✓</button>
            </div>
        </div>`;
}

export function divHandsDrop(i) {
    const cur = state.currentDiv;
    if (!cur || cur.mode !== 'hands') return;
    const left = cur.total - cur.piles.reduce((s, n) => s + n, 0);
    if (left <= 0) return;
    playSound('click');
    cur.piles[i]++;
    cur.history.push(i);
    renderDivHands();
}

export function divHandsUndo() {
    const cur = state.currentDiv;
    if (!cur || cur.mode !== 'hands' || cur.history.length === 0) return;
    playSound('click');
    cur.piles[cur.history.pop()]--;
    renderDivHands();
}

export function checkDivHands() {
    const cur = state.currentDiv;
    if (!cur || cur.mode !== 'hands') return;
    const left = cur.total - cur.piles.reduce((s, n) => s + n, 0);
    if (left > 0) {
        showFeedback('div-feedback', false, `🧺 Det finns fortfarande ${left} ${cur.item} kvar i brickan – dela ut alla!`);
        return;
    }
    const min = Math.min(...cur.piles), max = Math.max(...cur.piles);
    if (min !== max) {
        showFeedback('div-feedback', false, `🤔 Nästan! Högarna har inte lika många – en har ${max}, en annan ${min}. Flytta om med "↩️ Ta tillbaka"!`);
        return;
    }
    addReward(2);
    showFeedback('div-feedback', true, `🎉 Perfekt fördelat! Varje hög fick ${cur.quotient} – ${cur.total} ÷ ${cur.divisor} = ${cur.quotient}!`);
    document.getElementById('div-next-wrap').classList.remove('hidden');
}
