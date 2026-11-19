// js/modules/decimal.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { formatFractionHTML, formatNumSv, randInt, showFeedback, shuffleArray } from '../utils.js';
import { renderDecimalNumberLineSVG, renderPizzaSVG } from '../visuals.js';

/* =============================================================
   10. MODUL 7: DECIMALTAL PÅ TALLINJEN
============================================================== */
export function setDecimalSubMode(mode) {
    playSound('click');
    state.decimalSubMode = mode;
    ['mix', 'place', 'read', 'link'].forEach(m => {
        const btn = document.getElementById(`dec-sub-${m}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (m === mode ? 'bg-blue-600 text-white' : 'bg-white border border-blue-200 text-slate-700');
    });
    generateDecimalQuestion();
}

export let decimalDragging = false;

export function attachDecimalLineEvents(maxVal, step) {
    const svg = document.getElementById('decimal-interactive-svg');
    if (!svg) return;

    const updateFromClientX = (clientX) => {
        const rect = svg.getBoundingClientRect();
        const relX = ((clientX - rect.left) / rect.width) * 400;
        const clamped = Math.max(35, Math.min(365, relX));
        const ratio = (clamped - 35) / 330;
        const rawVal = ratio * maxVal;
        const snapped = Math.round(rawVal / step) * step;
        state.decimalSliderVal = Math.round(snapped * 100) / 100;
        document.getElementById('decimal-slider-readout').textContent = formatNumSv(state.decimalSliderVal);
        document.getElementById('decimal-visual-container').innerHTML = renderDecimalNumberLineSVG(maxVal, step, state.decimalSliderVal, true, true);
        attachDecimalLineEvents(maxVal, step);
    };

    svg.onpointerdown = (e) => {
        decimalDragging = true;
        updateFromClientX(e.clientX);
    };
    window.onpointermove = (e) => {
        if (decimalDragging) updateFromClientX(e.clientX);
    };
    window.onpointerup = () => {
        decimalDragging = false;
    };
}

export function nudgeDecimalSlider(dir) {
    if (!state.currentDecimal) return;
    playSound('click');
    const { maxVal, step } = state.currentDecimal;
    const next = Math.max(0, Math.min(maxVal, Math.round((state.decimalSliderVal + dir * step) * 100) / 100));
    state.decimalSliderVal = next;
    document.getElementById('decimal-slider-readout').textContent = formatNumSv(next);
    document.getElementById('decimal-visual-container').innerHTML = renderDecimalNumberLineSVG(maxVal, step, next, true, true);
    attachDecimalLineEvents(maxVal, step);
}

export function generateDecimalQuestion() {
    document.getElementById('decimal-feedback').classList.add('hidden');
    document.getElementById('decimal-next-wrap').classList.add('hidden');
    document.getElementById('decimal-place-controls').classList.add('hidden');

    let mode = state.decimalSubMode;
    if (mode === 'mix') mode = ['place', 'read', 'link'][randInt(0, 2)];

    const toggleWrap = document.getElementById('decimal-input-mode-toggle');
    const optsEl = document.getElementById('decimal-options');
    const typeEl = document.getElementById('decimal-type-wrap');

    if (mode === 'place') {
        if (toggleWrap) toggleWrap.classList.add('hidden');
        optsEl.classList.add('hidden');
        typeEl.classList.add('hidden');
        document.getElementById('decimal-place-controls').classList.remove('hidden');

        const maxVal = state.difficulty === 'hard' ? 2 : 1;
        const step = state.difficulty === 'easy' ? 0.1 : 0.05;
        const stepsCount = Math.round(maxVal / step);
        const target = Math.round(randInt(1, stepsCount - 1) * step * 100) / 100;

        state.currentDecimal = { mode: 'place', target, maxVal, step };
        state.decimalSliderVal = 0;

        document.getElementById('decimal-mode-badge').textContent = '🎯 Placera på tallinjen';
        document.getElementById('decimal-question-text').textContent = `Dra eller klicka på tallinjen för att markera ${formatNumSv(target)} !`;
        document.getElementById('decimal-slider-readout').textContent = '0,0';
        document.getElementById('decimal-visual-container').innerHTML = renderDecimalNumberLineSVG(maxVal, step, 0, true, true);
        attachDecimalLineEvents(maxVal, step);

        setHintSteps('decimal', [
            `<p>Mellan <strong>0</strong> och <strong>1</strong> är tallinjen uppdelad i <strong>10 tiondelar</strong> (varje litet streck här är <strong>${formatNumSv(step)}</strong>, och mittenstrecket mellan heltal är <strong>0,5</strong> / <strong>1,5</strong>).</p>`,
            `<p>Gå fram till <strong>${formatNumSv(target)}</strong> på tallinjen:</p>
             ${renderDecimalNumberLineSVG(maxVal, step, target, false, true, target)}`
        ]);
        return;
    }

    if (toggleWrap) toggleWrap.classList.remove('hidden');

    if (mode === 'read') {
        const maxVal = state.difficulty === 'hard' ? 2 : 1;
        const step = state.difficulty === 'hard' ? 0.05 : 0.1;
        const stepsCount = Math.round(maxVal / step);
        const target = Math.round(randInt(1, stepsCount - 1) * step * 100) / 100;
        state.currentDecimal = { mode: 'read', target, maxVal, step };

        document.getElementById('decimal-mode-badge').textContent = '🔍 Läs av tallinjen';
        document.getElementById('decimal-question-text').textContent = 'Vilket decimaltal pekar den röda markören (?) på?';
        document.getElementById('decimal-visual-container').innerHTML = renderDecimalNumberLineSVG(maxVal, step, target, false, false);

        setHintSteps('decimal', [
            `<p>Varje litet streck på tallinjen är värt <strong>${formatNumSv(step)}</strong>. Räkna strecken från närmaste heltal eller halv!</p>`,
            `<p>Markören står på <strong>${formatNumSv(target)}</strong>:</p>
             ${renderDecimalNumberLineSVG(maxVal, step, target, false, true, target)}`
        ]);

        if (state.inputModes.decimal === 'choice') {
            optsEl.classList.remove('hidden');
            typeEl.classList.add('hidden');
            const set = new Set([target]);
            while (set.size < 4) {
                const cand = Math.round(randInt(1, stepsCount - 1) * step * 100) / 100;
                set.add(cand);
            }
            optsEl.innerHTML = shuffleArray([...set]).map(v => `
                <button onclick="checkDecimalChoice(${v})" class="btn-3d bg-white hover:bg-blue-50 border-3 border-blue-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
                    ${formatNumSv(v)}
                </button>
            `).join('');
        } else {
            optsEl.classList.add('hidden');
            typeEl.classList.remove('hidden');
            const inp = document.getElementById('decimal-type-input');
            inp.value = '';
            inp.focus();
        }
    } else {
        const links = state.difficulty === 'hard'
            ? [
                { dec: 0.6, num: 3, den: 5, pct: 60, text: 'tre femtedelar (3/5)' },
                { dec: 0.8, num: 4, den: 5, pct: 80, text: 'fyra femtedelar (4/5)' },
                { dec: 0.15, num: 3, den: 20, pct: 15, text: 'tre tjugondelar (3/20)' },
                { dec: 0.35, num: 7, den: 20, pct: 35, text: 'sju tjugondelar (7/20)' },
                { dec: 0.45, num: 9, den: 20, pct: 45, text: 'nio tjugondelar (9/20)' }
              ]
            : [
                { dec: 0.5, num: 1, den: 2, pct: 50, text: 'hälften (1/2)' },
                { dec: 0.25, num: 1, den: 4, pct: 25, text: 'en fjärdedel (1/4)' },
                { dec: 0.75, num: 3, den: 4, pct: 75, text: 'tre fjärdedelar (3/4)' },
                { dec: 0.1, num: 1, den: 10, pct: 10, text: 'en tiondel (1/10)' },
                { dec: 0.2, num: 1, den: 5, pct: 20, text: 'en femtedel (1/5)' }
              ];
        const item = links[randInt(0, links.length - 1)];
        state.currentDecimal = { mode: 'link', target: item.dec, ...item };

        document.getElementById('decimal-mode-badge').textContent = '🔗 Decimaltal, Bråk & %';
        document.getElementById('decimal-question-text').innerHTML = `Vilket decimaltal är lika mycket som ${formatFractionHTML(item.num, item.den)} (${item.pct} %) ?`;
        document.getElementById('decimal-visual-container').innerHTML = renderPizzaSVG(item.den, Array.from({ length: item.num }, (_, i) => i), false, '', 140);

        setHintSteps('decimal', [
            `<p>${formatFractionHTML(item.num, item.den)} betyder <strong>${item.text}</strong>, vilket är <strong>${item.pct} %</strong> av en hel (1,0).</p>`,
            `<p>På tallinjen mellan 0 och 1 ligger ${formatFractionHTML(item.num, item.den)} på <strong>${formatNumSv(item.dec)}</strong>:</p>
             ${renderDecimalNumberLineSVG(1, 0.05, item.dec, false, true, item.dec)}`
        ]);

        if (state.inputModes.decimal === 'choice') {
            optsEl.classList.remove('hidden');
            typeEl.classList.add('hidden');
            const pool = [0.1, 0.2, 0.25, 0.5, 0.75, 0.8];
            const set = new Set([item.dec]);
            while (set.size < 4) set.add(pool[randInt(0, pool.length - 1)]);
            optsEl.innerHTML = shuffleArray([...set]).map(v => `
                <button onclick="checkDecimalChoice(${v})" class="btn-3d bg-white hover:bg-blue-50 border-3 border-blue-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
                    ${formatNumSv(v)}
                </button>
            `).join('');
        } else {
            optsEl.classList.add('hidden');
            typeEl.classList.remove('hidden');
            const inp = document.getElementById('decimal-type-input');
            inp.value = '';
            inp.focus();
        }
    }
}

export function checkDecimalPlaced() {
    if (!document.getElementById('decimal-next-wrap').classList.contains('hidden')) return;
    const { target } = state.currentDecimal;
    if (Math.abs(state.decimalSliderVal - target) < 0.005) {
        addReward(2);
        showFeedback('decimal-feedback', true, `🎯 Mitt i prick! Du placerade markören på ${formatNumSv(target)}!`);
        document.getElementById('decimal-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('decimal-feedback', false, `🤔 Din markör står på ${formatNumSv(state.decimalSliderVal)}, men målet är ${formatNumSv(target)}. Prova igen!`);
    }
}

export function checkDecimalChoice(val) {
    if (!document.getElementById('decimal-next-wrap').classList.contains('hidden')) return;
    const { target } = state.currentDecimal;
    if (Math.abs(val - target) < 0.005) {
        addReward(1);
        showFeedback('decimal-feedback', true, `🎉 Helt rätt! Svaret är ${formatNumSv(target)}!`);
        document.getElementById('decimal-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('decimal-feedback', false, `🤔 Inte riktigt ${formatNumSv(val)} – kika på tallinjen under "💡 Visa hur man tänker"!`);
    }
}

export function checkDecimalTyped() {
    const raw = document.getElementById('decimal-type-input').value.trim().replace(',', '.');
    const val = parseFloat(raw);
    if (isNaN(val)) return;
    checkDecimalChoice(val);
}
