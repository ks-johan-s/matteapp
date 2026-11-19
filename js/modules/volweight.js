// js/modules/volweight.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { formatNumSv, randInt, showFeedback, shuffleArray } from '../utils.js';
import { buildUnitLadderSVGHTML, renderKitchenScaleSVG, renderMeasuringJugSVG } from '../visuals.js';

/* =============================================================
   12. MODUL 9: VIKT & VOLYM (MÅTTBÄGARE & KÖKSVÅG)
============================================================== */
// Vardagsföremål som "väger ungefär så här" – bygger referensvikter.
const WEIGHT_OBJECTS = {
    50: { emoji: '🥚', label: 'ett ägg' },
    400: { emoji: '🍬', label: 'godispåse' },
    500: { emoji: '🧈', label: 'smörpaket' },
    600: { emoji: '🍞', label: 'limpa' },
    750: { emoji: '🍞', label: 'stor limpa' },
    1000: { emoji: '🥛', label: 'mjölkpaket' },
    1250: { emoji: '🐔', label: 'liten kyckling' },
    1500: { emoji: '🐔', label: 'kyckling' },
    1850: { emoji: '🍉', label: 'liten melon' },
    2000: { emoji: '🥛🥛', label: 'två mjölkpaket' },
    2400: { emoji: '🐈', label: 'liten katt' },
    2500: { emoji: '🐈', label: 'katt' },
    3000: { emoji: '🐈', label: 'stor katt' },
    3450: { emoji: '🎃', label: 'pumpa' },
    4750: { emoji: '🐕', label: 'liten hund' }
};

const WEIGHT_BENCHMARKS_HTML = `
    <div class="mt-3 inline-flex flex-wrap items-center justify-center gap-1.5 bg-lime-50/80 border border-lime-200 px-3.5 py-2 rounded-2xl text-[11px] font-extrabold text-lime-950">
        <span class="mr-1">⚖️ Ungefärliga vikter:</span>
        <span>🥚 ägg ≈ 50 g</span><span class="text-lime-400">•</span>
        <span>🍎 äpple ≈ 2 hg</span><span class="text-lime-400">•</span>
        <span>🧈 smör ≈ 5 hg</span><span class="text-lime-400">•</span>
        <span>🥛 mjölk ≈ 1 kg</span><span class="text-lime-400">•</span>
        <span>🐈 katt ≈ 3 kg</span>
    </div>`;

export function setVolWeightSubMode(mode) {
    playSound('click');
    state.volWeightSubMode = mode;
    ['mix', 'vol', 'weight'].forEach(m => {
        const btn = document.getElementById(`vw-sub-${m}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (m === mode ? 'bg-lime-600 text-white' : 'bg-white border border-lime-300 text-slate-700');
    });
    generateVolWeightQuestion();
}

export function generateVolWeightQuestion() {
    document.getElementById('volweight-feedback').classList.add('hidden');
    document.getElementById('volweight-next-wrap').classList.add('hidden');

    let mode = state.volWeightSubMode;
    if (mode === 'mix') mode = Math.random() < 0.5 ? 'vol' : 'weight';

    let fromVal, fromUnit, toUnit, answer, ruleText, visualHtml, ladderHtml, badge;

    if (mode === 'vol') {
        badge = '🧪 Volym (l • dl • cl • ml)';
        const tasks = state.difficulty === 'easy'
            ? [
                { fv: 2, fu: 'liter', tu: 'dl', ans: 20, rule: '1 liter = 10 dl', ratio: 0.65 },
                { fv: 4, fu: 'dl', tu: 'cl', ans: 40, rule: '1 dl = 10 cl', ratio: 0.4 },
                { fv: 50, fu: 'cl', tu: 'dl', ans: 5, rule: '10 cl = 1 dl', ratio: 0.5 },
                { fv: 300, fu: 'ml', tu: 'dl', ans: 3, rule: '100 ml = 1 dl', ratio: 0.3 }
              ]
            : (state.difficulty === 'medium'
            ? [
                { fv: 1.5, fu: 'liter', tu: 'dl', ans: 15, rule: '1 liter = 10 dl', ratio: 0.75 },
                { fv: 0.5, fu: 'liter', tu: 'cl', ans: 50, rule: '1 liter = 100 cl', ratio: 0.5 },
                { fv: 25, fu: 'cl', tu: 'ml', ans: 250, rule: '1 cl = 10 ml', ratio: 0.25 },
                { fv: 6, fu: 'dl', tu: 'liter', ans: 0.6, rule: '10 dl = 1 liter', ratio: 0.6 }
              ]
            : [
                { fv: 0.75, fu: 'liter', tu: 'ml', ans: 750, rule: '1 liter = 1 000 ml', ratio: 0.75 },
                { fv: 1250, fu: 'ml', tu: 'liter', ans: 1.25, rule: '1 000 ml = 1 liter', ratio: 0.85 },
                { fv: 2.35, fu: 'liter', tu: 'cl', ans: 235, rule: '1 liter = 100 cl', ratio: 0.8 },
                { fv: 1750, fu: 'ml', tu: 'dl', ans: 17.5, rule: '100 ml = 1 dl', ratio: 0.7 },
                { fv: 0.08, fu: 'liter', tu: 'ml', ans: 80, rule: '1 liter = 1 000 ml', ratio: 0.18 },
                { fv: 425, fu: 'cl', tu: 'liter', ans: 4.25, rule: '100 cl = 1 liter', ratio: 0.9 }
              ]);
        const t = tasks[randInt(0, tasks.length - 1)];
        fromVal = t.fv; fromUnit = t.fu; toUnit = t.tu; answer = t.ans; ruleText = t.rule;
        visualHtml = renderMeasuringJugSVG(fromVal, fromUnit, t.ratio);
        const units = ['liter', 'dl', 'cl', 'ml'];
        const isMul = units.indexOf(fromUnit) < units.indexOf(toUnit);
        ladderHtml = buildUnitLadderSVGHTML(units, ['×10', '×10', '×10'], ['÷10', '÷10', '÷10'], fromUnit, toUnit, isMul);
    } else {
        badge = '⚖️ Vikt (kg • hg • g)';
        const tasks = state.difficulty === 'easy'
            ? [
                { fv: 3, fu: 'kg', tu: 'hg', ans: 30, rule: '1 kg = 10 hg' },
                { fv: 2, fu: 'kg', tu: 'g', ans: 2000, rule: '1 kg = 1 000 g' },
                { fv: 4, fu: 'hg', tu: 'g', ans: 400, rule: '1 hg = 100 g' },
                { fv: 500, fu: 'g', tu: 'hg', ans: 5, rule: '100 g = 1 hg' }
              ]
            : (state.difficulty === 'medium'
            ? [
                { fv: 1.5, fu: 'kg', tu: 'g', ans: 1500, rule: '1 kg = 1 000 g' },
                { fv: 2.5, fu: 'kg', tu: 'hg', ans: 25, rule: '1 kg = 10 hg' },
                { fv: 750, fu: 'g', tu: 'hg', ans: 7.5, rule: '100 g = 1 hg' },
                { fv: 600, fu: 'g', tu: 'kg', ans: 0.6, rule: '1 000 g = 1 kg' }
              ]
            : [
                { fv: 1.25, fu: 'kg', tu: 'g', ans: 1250, rule: '1 kg = 1 000 g' },
                { fv: 2400, fu: 'g', tu: 'kg', ans: 2.4, rule: '1 000 g = 1 kg' },
                { fv: 3.45, fu: 'kg', tu: 'hg', ans: 34.5, rule: '1 kg = 10 hg' },
                { fv: 1850, fu: 'g', tu: 'hg', ans: 18.5, rule: '100 g = 1 hg' },
                { fv: 0.05, fu: 'kg', tu: 'g', ans: 50, rule: '1 kg = 1 000 g' },
                { fv: 4750, fu: 'g', tu: 'kg', ans: 4.75, rule: '1 000 g = 1 kg' }
              ]);
        const t = tasks[randInt(0, tasks.length - 1)];
        fromVal = t.fv; fromUnit = t.fu; toUnit = t.tu; answer = t.ans; ruleText = t.rule;
        const grams = Math.round(fromVal * (fromUnit === 'kg' ? 1000 : (fromUnit === 'hg' ? 100 : 1)));
        const obj = WEIGHT_OBJECTS[grams];
        visualHtml = renderKitchenScaleSVG(fromVal, fromUnit, obj?.emoji || '', obj?.label || '') + WEIGHT_BENCHMARKS_HTML;
        const units = ['kg', 'hg', 'g'];
        const isMul = units.indexOf(fromUnit) < units.indexOf(toUnit);
        ladderHtml = buildUnitLadderSVGHTML(units, ['×10', '×100'], ['÷10', '÷100'], fromUnit, toUnit, isMul);
    }

    state.currentVolWeight = { fromVal, fromUnit, toUnit, answer };
    document.getElementById('volweight-mode-badge').textContent = badge;
    document.getElementById('volweight-question-text').textContent = `Hur många ${toUnit} är ${formatNumSv(fromVal)} ${fromUnit}?`;
    document.getElementById('volweight-visual-container').innerHTML = visualHtml;
    document.getElementById('volweight-type-unit').textContent = toUnit;

    setHintSteps('volweight', [
        `<p>Följ stegen i mått-trappan från <strong>${fromUnit}</strong> till <strong>${toUnit}</strong> (${ruleText}):</p>${ladderHtml}`,
        `<p>Räkna ut omvandlingen:</p>
         <div class="my-2 flex items-center justify-center gap-2 font-display font-bold text-base">
            <span>${formatNumSv(fromVal)} ${fromUnit}</span>
            <span class="hint-arrow-nudge text-lime-700">➔</span>
            <span class="px-4 py-1 rounded-2xl bg-lime-100 border-2 border-lime-500 text-lime-950">${formatNumSv(answer)} ${toUnit}</span>
         </div>`
    ]);

    const optsEl = document.getElementById('volweight-options');
    const typeEl = document.getElementById('volweight-type-wrap');
    if (state.inputModes.volweight === 'choice') {
        optsEl.classList.remove('hidden');
        typeEl.classList.add('hidden');
        const vals = [answer];
        const cands = [answer * 10, answer / 10, answer * 100, answer / 100, answer + 5, answer + 50];
        for (const c of cands) {
            const rounded = Math.round(c * 100) / 100;
            if (vals.length < 4 && rounded > 0 && !vals.some(v => Math.abs(v - rounded) < 0.001)) {
                vals.push(rounded);
            }
        }
        while (vals.length < 4) vals.push(answer + randInt(2, 15));
        optsEl.innerHTML = shuffleArray(vals).map(v => `
            <button onclick="checkVolWeightChoice(${v})" class="btn-3d bg-white hover:bg-lime-50 border-3 border-lime-400 rounded-2xl py-4 px-2 font-display font-bold text-xl sm:text-2xl text-slate-900">
                ${formatNumSv(v)} ${toUnit}
            </button>
        `).join('');
    } else {
        optsEl.classList.add('hidden');
        typeEl.classList.remove('hidden');
        const inp = document.getElementById('volweight-type-input');
        inp.value = '';
        inp.focus();
    }
}

export function checkVolWeightChoice(val) {
    if (!document.getElementById('volweight-next-wrap').classList.contains('hidden')) return;
    const { fromVal, fromUnit, toUnit, answer } = state.currentVolWeight;
    if (Math.abs(val - answer) < 0.005) {
        addReward(1);
        showFeedback('volweight-feedback', true, `🎉 Rätt! ${formatNumSv(fromVal)} ${fromUnit} = ${formatNumSv(answer)} ${toUnit}!`);
        document.getElementById('volweight-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('volweight-feedback', false, `🤔 Inte riktigt ${formatNumSv(val)} ${toUnit} – kika på mått-trappan under "💡 Visa hur man omvandlar"!`);
    }
}

export function checkVolWeightTyped() {
    const raw = document.getElementById('volweight-type-input').value.trim().replace(',', '.');
    const val = parseFloat(raw);
    if (isNaN(val)) return;
    checkVolWeightChoice(val);
}
