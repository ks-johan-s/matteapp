// js/modules/chart.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { randInt, showFeedback, shuffleArray } from '../utils.js';
import { renderBarChartSVG } from '../visuals.js';

/* =============================================================
   16. MODUL 13: DIAGRAM & STATISTIK
============================================================== */
export function setChartSubMode(mode) {
    playSound('click');
    state.chartSubMode = mode;
    ['mix', 'read', 'diff'].forEach(m => {
        const btn = document.getElementById(`chart-sub-${m}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (m === mode ? 'bg-purple-600 text-white' : 'bg-white border border-purple-200 text-slate-700');
    });
    generateChartQuestion();
}

export function generateChartQuestion() {
    document.getElementById('chart-feedback').classList.add('hidden');
    document.getElementById('chart-next-wrap').classList.add('hidden');

    const isHard = state.difficulty === 'hard';
    const themes = isHard
        ? [
            {
                title: 'Sålda biljetter på skolfesten',
                items: [
                    { label: 'Åk 3', icon: '🎟️', val: [15, 25, 35][randInt(0, 2)] },
                    { label: 'Åk 4', icon: '🎪', val: [20, 30, 40][randInt(0, 2)] },
                    { label: 'Åk 5', icon: '🎭', val: [25, 35, 45][randInt(0, 2)] },
                    { label: 'Åk 6', icon: '🎶', val: [10, 15, 30][randInt(0, 2)] }
                ]
            },
            {
                title: 'Lästa sidor i läsutmaningen',
                items: [
                    { label: 'Måndag', icon: '📖', val: [20, 30, 40][randInt(0, 2)] },
                    { label: 'Tisdag', icon: '📚', val: [15, 25, 35][randInt(0, 2)] },
                    { label: 'Onsdag', icon: '🔖', val: [30, 40, 50][randInt(0, 2)] },
                    { label: 'Torsdag', icon: '🦉', val: [10, 20, 25][randInt(0, 2)] }
                ]
            }
          ]
        : [
            {
                title: 'Klassens favoritfrukt',
                items: [
                    { label: 'Äpple', icon: '🍎', val: randInt(3, 9) },
                    { label: 'Banan', icon: '🍌', val: randInt(2, 8) },
                    { label: 'Jordgubbe', icon: '🍓', val: randInt(4, 10) },
                    { label: 'Päron', icon: '🍐', val: randInt(2, 7) }
                ]
            },
            {
                title: 'Husdjur i klassen',
                items: [
                    { label: 'Hund', icon: '🐶', val: randInt(4, 10) },
                    { label: 'Katt', icon: '🐱', val: randInt(3, 9) },
                    { label: 'Kanin', icon: '🐰', val: randInt(2, 7) },
                    { label: 'Hamster', icon: '🐹', val: randInt(1, 6) }
                ]
            }
          ];
    const theme = themes[randInt(0, themes.length - 1)];
    const items = theme.items;

    let mode = state.chartSubMode;
    if (mode === 'mix') mode = Math.random() < 0.45 ? 'read' : 'diff';

    let qText = '', answer = 0, badge = '', hints = [];

    if (mode === 'read') {
        const idx = randInt(0, items.length - 1);
        const target = items[idx];
        answer = target.val;
        badge = '📊 Läs av stapeldiagram';
        qText = `Hur många visar stapeln för ${target.label} (${target.icon})?`;

        hints = [
            `<p>Hitta stapeln för <strong>${target.label} ${target.icon}</strong> och följ den streckade linjen rakt ut till siffrorna till vänster (ligger toppen mitt emellan två streck är det mitt emellan talen!):</p>
             ${renderBarChartSVG(theme.title, items, [idx], false)}`,
            `<p>Stapeln för <strong>${target.label}</strong> visar <strong>${answer}</strong>!</p>`
        ];
    } else if (isHard) {
        const pair1Sum = items[0].val + items[1].val;
        const pair2Sum = items[2].val + items[3].val;
        if (pair1Sum !== pair2Sum && Math.random() < 0.65) {
            const firstBigger = pair1Sum > pair2Sum;
            const bigPair = firstBigger ? [items[0], items[1]] : [items[2], items[3]];
            const smallPair = firstBigger ? [items[2], items[3]] : [items[0], items[1]];
            const bigSum = Math.max(pair1Sum, pair2Sum);
            const smallSum = Math.min(pair1Sum, pair2Sum);
            answer = bigSum - smallSum;
            badge = '🚀 Tvåsteg • Jämför par av staplar';
            qText = `Hur många fler hade ${bigPair[0].label} och ${bigPair[1].label} tillsammans än ${smallPair[0].label} och ${smallPair[1].label} tillsammans?`;

            hints = [
                `<p><strong>Steg 1:</strong> Lägg ihop det första paret: <strong>${bigPair[0].val} + ${bigPair[1].val} = ${bigSum}</strong>.</p>`,
                `<p><strong>Steg 2:</strong> Lägg ihop det andra paret: <strong>${smallPair[0].val} + ${smallPair[1].val} = ${smallSum}</strong>.</p>`,
                `<p><strong>Steg 3:</strong> Räkna ut skillnaden: <strong>${bigSum} − ${smallSum} = ${answer}</strong>!</p>`
            ];
        } else {
            answer = items.reduce((s, it) => s + it.val, 0);
            badge = '➕ Totalen i diagrammet';
            qText = 'Hur många blir det totalt om vi lägger ihop alla fyra staplarna?';
            hints = [
                `<p>Läs av alla fyra staplarna: <strong>${items.map(i => `${i.label} (${i.val})`).join(', ')}</strong>.</p>`,
                `<p>Lägg ihop alla: <strong>${items.map(i => i.val).join(' + ')} = ${answer}</strong>!</p>`
            ];
        }
    } else {
        if (Math.random() < 0.65) {
            let i1 = randInt(0, items.length - 1);
            let i2 = randInt(0, items.length - 1);
            while (i2 === i1 || items[i1].val === items[i2].val) {
                i1 = randInt(0, items.length - 1);
                i2 = randInt(0, items.length - 1);
            }
            const highIdx = items[i1].val > items[i2].val ? i1 : i2;
            const lowIdx = highIdx === i1 ? i2 : i1;
            const high = items[highIdx], low = items[lowIdx];
            answer = high.val - low.val;
            badge = '⚖️ Jämför två staplar';
            qText = `Hur många fler valde ${high.label.toLowerCase()} (${high.icon}) än ${low.label.toLowerCase()} (${low.icon})?`;

            hints = [
                `<p><strong>Steg 1:</strong> Läs av båda staplarna: <strong>${high.label} = ${high.val}</strong> och <strong>${low.label} = ${low.val}</strong>:</p>
                 ${renderBarChartSVG(theme.title, items, [highIdx, lowIdx], true)}`,
                `<p><strong>Steg 2:</strong> Räkna ut skillnaden mellan dem:</p>
                 <div class="my-2 flex items-center justify-center gap-2 font-display font-bold text-base">
                    <span>${high.val} − ${low.val}</span>
                    <span class="hint-arrow-nudge text-purple-600">➔</span>
                    <span class="px-4 py-1 rounded-2xl bg-purple-100 border-2 border-purple-400 text-purple-950">${answer} fler</span>
                 </div>`
            ];
        } else {
            answer = items.reduce((s, it) => s + it.val, 0);
            badge = '➕ Totalen i diagrammet';
            qText = 'Hur många svarade totalt i hela undersökningen?';

            hints = [
                `<p>Läs av alla fyra staplarna: <strong>${items.map(i => `${i.label} (${i.val})`).join(', ')}</strong>.</p>`,
                `<p>Lägg ihop alla staplarna:</p>
                 <div class="my-2 flex flex-wrap items-center justify-center gap-2 font-display font-bold text-base">
                    <span>${items.map(i => i.val).join(' + ')}</span>
                    <span class="hint-arrow-nudge text-purple-600">➔</span>
                    <span class="px-4 py-1 rounded-2xl bg-purple-100 border-2 border-purple-400 text-purple-950">${answer} totalt</span>
                 </div>`
            ];
        }
    }

    state.currentChart = { answer };
    document.getElementById('chart-mode-badge').textContent = badge;
    document.getElementById('chart-question-text').textContent = qText;
    document.getElementById('chart-visual-container').innerHTML = renderBarChartSVG(theme.title, items);
    setHintSteps('chart', hints);

    const optsEl = document.getElementById('chart-options');
    const typeEl = document.getElementById('chart-type-wrap');
    if (state.inputModes.chart === 'choice') {
        optsEl.classList.remove('hidden');
        typeEl.classList.add('hidden');
        const set = new Set([answer]);
        while (set.size < 4) {
            const cand = answer + [-3, -2, -1, 1, 2, 3, 4][randInt(0, 6)];
            if (cand > 0) set.add(cand);
        }
        optsEl.innerHTML = shuffleArray([...set]).map(v => `
            <button onclick="checkChartChoice(${v})" class="btn-3d bg-white hover:bg-purple-50 border-3 border-purple-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
                ${v}
            </button>
        `).join('');
    } else {
        optsEl.classList.add('hidden');
        typeEl.classList.remove('hidden');
        const inp = document.getElementById('chart-type-input');
        inp.value = '';
        inp.focus();
    }
}

export function checkChartChoice(val) {
    if (!document.getElementById('chart-next-wrap').classList.contains('hidden')) return;
    const { answer } = state.currentChart;
    if (val === answer) {
        addReward(1);
        showFeedback('chart-feedback', true, `🎉 Rätt avläst! Svaret är ${answer}!`);
        document.getElementById('chart-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('chart-feedback', false, `🤔 Inte riktigt ${val} – följ stapelns topp ut till siffrorna till vänster!`);
    }
}

export function checkChartTyped() {
    const val = parseInt(document.getElementById('chart-type-input').value, 10);
    if (isNaN(val)) return;
    checkChartChoice(val);
}
