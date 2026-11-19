// js/modules/length.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { formatNumSv, randInt, showFeedback, shuffleArray } from '../utils.js';
import { buildUnitLadderSVGHTML } from '../visuals.js';

/* =============================================================
   11. MODUL 8: LÄNGD & ENHETSOMVANDLING
============================================================== */
export function setLengthSubMode(mode) {
    playSound('click');
    state.lengthSubMode = mode;
    ['mix', 'mmcm', 'cmdmm', 'mkm'].forEach(m => {
        const btn = document.getElementById(`len-sub-${m}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (m === mode ? 'bg-teal-600 text-white' : 'bg-white border border-teal-200 text-slate-700');
    });
    generateLengthQuestion();
}

export function generateLengthQuestion() {
    document.getElementById('length-feedback').classList.add('hidden');
    document.getElementById('length-next-wrap').classList.add('hidden');

    let mode = state.lengthSubMode;
    if (mode === 'mix') mode = ['mmcm', 'cmdmm', 'mkm'][randInt(0, 2)];

    const pools = state.difficulty === 'hard'
        ? {
            mmcm: [
                { fv: 12.5, fu: 'cm', tu: 'mm', ans: 125, rule: '1 cm = 10 mm' },
                { fv: 345, fu: 'mm', tu: 'cm', ans: 34.5, rule: '10 mm = 1 cm' },
                { fv: 0.75, fu: 'm', tu: 'mm', ans: 750, rule: '1 m = 1 000 mm' },
                { fv: 450, fu: 'mm', tu: 'dm', ans: 4.5, rule: '100 mm = 1 dm' }
            ],
            cmdmm: [
                { fv: 1.45, fu: 'm', tu: 'cm', ans: 145, rule: '1 m = 100 cm' },
                { fv: 235, fu: 'cm', tu: 'm', ans: 2.35, rule: '100 cm = 1 m' },
                { fv: 3.8, fu: 'm', tu: 'dm', ans: 38, rule: '1 m = 10 dm' },
                { fv: 65, fu: 'cm', tu: 'm', ans: 0.65, rule: '100 cm = 1 m' }
            ],
            mkm: [
                { fv: 2.35, fu: 'km', tu: 'm', ans: 2350, rule: '1 km = 1 000 m' },
                { fv: 3450, fu: 'm', tu: 'km', ans: 3.45, rule: '1 000 m = 1 km' },
                { fv: 0.85, fu: 'km', tu: 'm', ans: 850, rule: '1 km = 1 000 m' },
                { fv: 1.5, fu: 'km', tu: 'dm', ans: 15000, rule: '1 km = 10 000 dm' }
            ]
        }
        : {
            mmcm: [
                { fv: 3, fu: 'cm', tu: 'mm', ans: 30, rule: '1 cm = 10 mm' },
                { fv: 70, fu: 'mm', tu: 'cm', ans: 7, rule: '10 mm = 1 cm' },
                { fv: 2.5, fu: 'cm', tu: 'mm', ans: 25, rule: '1 cm = 10 mm' }
            ],
            cmdmm: [
                { fv: 4, fu: 'dm', tu: 'cm', ans: 40, rule: '1 dm = 10 cm' },
                { fv: 2, fu: 'm', tu: 'cm', ans: 200, rule: '1 m = 100 cm' },
                { fv: 300, fu: 'cm', tu: 'm', ans: 3, rule: '100 cm = 1 m' },
                { fv: 1.5, fu: 'm', tu: 'dm', ans: 15, rule: '1 m = 10 dm' }
            ],
            mkm: [
                { fv: 2, fu: 'km', tu: 'm', ans: 2000, rule: '1 km = 1 000 m' },
                { fv: 4000, fu: 'm', tu: 'km', ans: 4, rule: '1 000 m = 1 km' },
                { fv: 1.5, fu: 'km', tu: 'm', ans: 1500, rule: '1 km = 1 000 m' }
            ]
        };
    const pool = pools[mode];
    const t = pool[randInt(0, pool.length - 1)];

    state.currentLength = { fromVal: t.fv, fromUnit: t.fu, toUnit: t.tu, answer: t.ans };
    document.getElementById('length-question-text').textContent = `Hur många ${t.tu} är ${formatNumSv(t.fv)} ${t.fu}?`;
    document.getElementById('length-type-unit').textContent = t.tu;

    document.getElementById('length-visual-container').innerHTML = `
        <div class="inline-flex items-center gap-2 bg-teal-50 border-2 border-teal-200 px-4 py-2 rounded-2xl font-display font-bold text-sm text-teal-950">
            <span>📏 ${formatNumSv(t.fv)} ${t.fu}</span>
            <span class="text-teal-600">➔</span>
            <span>? ${t.tu}</span>
        </div>
    `;

    const units = ['km', 'm', 'dm', 'cm', 'mm'];
    const isMul = units.indexOf(t.fu) < units.indexOf(t.tu);
    const ladderHtml = buildUnitLadderSVGHTML(units, ['×1000', '×10', '×10', '×10'], ['÷1000', '÷10', '÷10', '÷10'], t.fu, t.tu, isMul);
    setHintSteps('length', [
        `<p>Kika på längdtrappan (${t.rule}):</p>${ladderHtml}`,
        `<p><strong>${formatNumSv(t.fv)} ${t.fu} = ${formatNumSv(t.ans)} ${t.tu}</strong>!</p>`
    ]);

    const optsEl = document.getElementById('length-options');
    const typeEl = document.getElementById('length-type-wrap');
    if (state.inputModes.length === 'choice') {
        optsEl.classList.remove('hidden');
        typeEl.classList.add('hidden');
        const vals = [t.ans];
        for (const c of [t.ans * 10, t.ans / 10, t.ans * 100, t.ans / 100, t.ans + 10]) {
            const r = Math.round(c * 100) / 100;
            if (vals.length < 4 && r > 0 && !vals.some(v => Math.abs(v - r) < 0.001)) vals.push(r);
        }
        while (vals.length < 4) vals.push(t.ans + randInt(2, 9));
        optsEl.innerHTML = shuffleArray(vals).map(v => `
            <button onclick="checkLengthChoice(${v})" class="btn-3d bg-white hover:bg-teal-50 border-3 border-teal-300 rounded-2xl py-4 font-display font-bold text-xl sm:text-2xl text-slate-900">
                ${formatNumSv(v)} ${t.tu}
            </button>
        `).join('');
    } else {
        optsEl.classList.add('hidden');
        typeEl.classList.remove('hidden');
        const inp = document.getElementById('length-type-input');
        inp.value = '';
        inp.focus();
    }
}

export function checkLengthChoice(val) {
    if (!document.getElementById('length-next-wrap').classList.contains('hidden')) return;
    const { fromVal, fromUnit, toUnit, answer } = state.currentLength;
    if (Math.abs(val - answer) < 0.005) {
        addReward(1);
        showFeedback('length-feedback', true, `🎉 Rätt! ${formatNumSv(fromVal)} ${fromUnit} = ${formatNumSv(answer)} ${toUnit}!`);
        document.getElementById('length-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('length-feedback', false, `🤔 Inte riktigt ${formatNumSv(val)} ${toUnit} – kika på längdtrappan!`);
    }
}

export function checkLengthTyped() {
    const raw = document.getElementById('length-type-input').value.trim().replace(',', '.');
    const val = parseFloat(raw);
    if (isNaN(val)) return;
    checkLengthChoice(val);
}
