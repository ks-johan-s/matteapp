// js/modules/chart.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { randInt, showFeedback, shuffleArray } from '../utils.js';
import { renderBarChartSVG, renderPieChartSVG, renderLineChartSVG } from '../visuals.js';

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
    if (mode === 'mix') mode = ['read', 'diff', 'pie', 'line'][randInt(0, 3)];
    if (mode === 'pie') return genPieChart();
    if (mode === 'line') return genLineChart();

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

    mountChart(badge, qText, answer, hints, renderBarChartSVG(theme.title, items));
}

function mountChart(badge, qText, answer, hints, visualHTML) {
    state.currentChart = { answer };
    document.getElementById('chart-mode-badge').textContent = badge;
    document.getElementById('chart-question-text').textContent = qText;
    document.getElementById('chart-visual-container').innerHTML = visualHTML;
    setHintSteps('chart', hints);

    const optsEl = document.getElementById('chart-options');
    const typeEl = document.getElementById('chart-type-wrap');
    if (state.inputModes.chart === 'choice') {
        optsEl.classList.remove('hidden');
        typeEl.classList.add('hidden');
        const set = new Set([answer]);
        let guard = 0;
        while (set.size < 4 && guard++ < 200) {
            const cand = answer + [-3, -2, -1, 1, 2, 3, 4][randInt(0, 6)];
            set.add(cand);
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

/* ---------- Cirkeldiagram: andelar kopplade till bråk av antal ---------- */
const PIE_THEMES = [
    { title: 'Favoritdjur i klassen', cats: [['Hund', '🐶'], ['Katt', '🐱'], ['Kanin', '🐰'], ['Fågel', '🐦']] },
    { title: 'Favoritsport', cats: [['Fotboll', '⚽'], ['Simning', '🏊'], ['Ridning', '🐴'], ['Dans', '💃']] },
    { title: 'Sätt att åka till skolan', cats: [['Cykel', '🚲'], ['Gång', '🚶'], ['Buss', '🚌'], ['Bil', '🚗']] },
];
// uppdelningar av helheten i bråkdelssektorer: [täljare, gemensam nämnare] per sektor
function genPieChart() {
    const diff = state.difficulty;
    // välj partition: lista av bråk-delpunkter i åttondelar/fjärdedelar
    const parts = diff === 'easy'
        ? [[[4, 8], [2, 8], [2, 8]], [[1, 2], [1, 4], [1, 4]]][randInt(0, 1)]
        : diff === 'medium'
            ? [[[1, 2], [1, 4], [1, 8], [1, 8]], [[3, 4], [1, 8], [1, 8]], [[1, 2], [3, 8], [1, 8]]][randInt(0, 2)]
            : [[[5, 8], [2, 8], [1, 8]], [[3, 8], [3, 8], [2, 8]], [[1, 2], [1, 4], [1, 8], [1, 8]], [[4, 8], [3, 8], [1, 8]]][randInt(0, 3)];
    const total = diff === 'easy' ? wTot([8, 16]) : wTot([16, 24]);
    const theme = PIE_THEMES[randInt(0, PIE_THEMES.length - 1)];
    const cats = shuffleArray([...theme.cats]).slice(0, parts.length);
    const items = parts.map((p, i) => ({
        label: cats[i][0], icon: cats[i][1],
        val: p[0] / p[1], // renderaren skalar proportionellt — summan är 1
        fracLabel: fracStr(p[0], p[1]),
        frac: p[0] / p[1],
    }));

    function fracStr(a, b) {
        // förkorta: 4/8 → 1/2, 2/8 → 1/4
        const gcd = (x, y) => y ? gcd(y, x % y) : x;
        const d = gcd(a, b);
        return `${a / d}/${b / d}`;
    }
    function wTot(arr) { return arr[randInt(0, arr.length - 1)]; }

    const pieVisual = () => `<div class="text-center font-bold text-slate-600 text-sm mb-1">${theme.title} — ${total} elever</div>${renderPieChartSVG(items, { fracLabels: true })}`;

    // två frågetyper: avläs antal för en sektor, eller (svår) skillnad mellan två
    const twoStep = diff === 'hard' && items.length >= 3 && Math.random() < 0.5;
    let answer, qText, hints, badge;
    if (twoStep) {
        const sorted = [...items].sort((a, b) => b.frac - a.frac);
        const big = sorted[0], small = sorted[sorted.length - 1];
        const bigN = Math.round(big.frac * total), smallN = Math.round(small.frac * total);
        answer = bigN - smallN;
        badge = '🥧 Tvåsteg • Cirkeldiagram';
        qText = `Hur många fler elever röstade på ${big.label.toLowerCase()} än på ${small.label.toLowerCase()}?`;
        hints = [
            `<p><strong>Steg 1:</strong> ${big.label} är ${big.fracLabel} av ${total} elever. Räkna som "bråk av antal": <strong>${total} ÷ ${big.fracLabel.split('/')[1]} × ${big.fracLabel.split('/')[0]} = ${bigN}</strong>.</p>`,
            `<p><strong>Steg 2:</strong> ${small.label} är ${small.fracLabel} av ${total}: <strong>${total} ÷ ${small.fracLabel.split('/')[1]}${small.fracLabel.split('/')[0] !== '1' ? ' × ' + small.fracLabel.split('/')[0] : ''} = ${smallN}</strong>.</p>`,
            `<p><strong>Steg 3:</strong> Skillnaden: <strong>${bigN} − ${smallN} = ${answer}</strong>!</p>`
        ];
    } else {
        const idx = randInt(0, items.length - 1);
        const it = items[idx];
        const [t, n] = it.fracLabel.split('/').map(Number);
        answer = Math.round(it.frac * total);
        badge = '🥧 Cirkeldiagram';
        qText = `${total} elever röstade. Hur många röstade på ${it.label.toLowerCase()}?`;
        hints = [
            `<p>Sektorn för <strong>${it.label} ${it.icon}</strong> är märkt <strong>${it.fracLabel}</strong> — det är andelen av helheten.</p>
             <div class="flex justify-center my-1">${renderPieChartSVG(items.map((x, i) => ({ ...x })), { fracLabels: true, dimExcept: idx })}</div>`,
            `<p>Räkna som "bråk av antal": <strong>${total} ÷ ${n}${t > 1 ? ' × ' + t : ''} = ${answer}</strong>. Alltså <strong>${answer}</strong> elever!</p>`
        ];
    }
    mountChart(badge, qText, answer, hints, pieVisual());
}

/* ---------- Linjediagram: temperatur över veckan ---------- */
function genLineChart() {
    const diff = state.difficulty;
    const days = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];
    // generera en rimlig temperaturkurva
    const lo = diff === 'easy' ? 2 : diff === 'medium' ? -4 : -9;
    const hi = diff === 'easy' ? 12 : diff === 'medium' ? 10 : 8;
    let cur = randInt(Math.max(0, lo), hi - 3);
    const points = days.map(d => {
        cur += randInt(-4, 4);
        cur = Math.max(lo, Math.min(hi + 4, cur));
        return { label: d, val: cur };
    });
    // frågetyper: avläs dag, eller skillnad mellan två dagar
    const isDiff = Math.random() < (diff === 'easy' ? 0.35 : 0.6);
    let answer, qText, hints, badge, guideIdx;
    if (!isDiff) {
        const idx = randInt(0, 6);
        answer = points[idx].val;
        guideIdx = idx;
        badge = '📈 Avläs linjediagram';
        qText = `Hur många grader var det på ${['måndagen', 'tisdagen', 'onsdagen', 'torsdagen', 'fredagen', 'lördagen', 'söndagen'][idx]}?`;
        hints = [
            `<p>Hitta <strong>${points[idx].label}</strong> längs nederkanten och följ den streckade linjen upp till punkten — läs sen av mot skalan till vänster. Den streckade noll-linjen skiljer plus från minus!</p>`,
            `<p>Punkten för ${points[idx].label} ligger på <strong>${answer} grader</strong>!</p>`
        ];
    } else {
        let i1 = randInt(0, 6), i2 = randInt(0, 6);
        while (i2 === i1 || points[i1].val === points[i2].val) { i1 = randInt(0, 6); i2 = randInt(0, 6); }
        const a = points[i1], b = points[i2];
        const warm = a.val > b.val ? a : b;
        const cold = a.val > b.val ? b : a;
        answer = warm.val - cold.val;
        const crosses = (warm.val > 0 && cold.val < 0);
        badge = '📈 Jämför dagar';
        qText = `Hur många grader varmare var det på ${fullDay(days.indexOf(warm.label))} än på ${fullDay(days.indexOf(cold.label))}?`;
        hints = [
            `<p>Läs av båda punkterna: <strong>${warm.label} = ${warm.val}°</strong> och <strong>${cold.label} = ${cold.val}°</strong>.${crosses ? ' Observera att den ena ligger <strong>under</strong> noll-linjen!' : ''}</p>`,
            crosses
                ? `<p>Passerar noll! Hoppa först till 0: <strong>${warm.val} + ${Math.abs(cold.val)} = ${answer}</strong> graders skillnad!</p>`
                : `<p>Skillnaden: <strong>${warm.val} − ${cold.val} = ${answer}</strong> grader!</p>`
        ];
        guideIdx = undefined;
    }
    function fullDay(i) { return ['måndagen', 'tisdagen', 'onsdagen', 'torsdagen', 'fredagen', 'lördagen', 'söndagen'][i]; }
    const visual = `<div class="flex justify-center">${renderLineChartSVG('Temperaturen en vecka i februari', points, { guideIdx })}</div>`;
    mountChart(badge, qText, answer, hints, visual);
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

// "Visa mig": läs av stapeldiagrammet mot skalan.
export function buildChartDemoSteps() {
    if (state.chartSubMode === 'pie') return buildPieDemo();
    if (state.chartSubMode === 'line') return buildLineDemo();
    const items = [{ label: '🍎', val: 6 }, { label: '🍌', val: 9 }, { label: '🍇', val: 4 }, { label: '🍓', val: 7 }];
    const chart = (hi = [], bracket = false) => `<div class="flex justify-center">${renderBarChartSVG('Favoritfrukt i klassen', items, hi, bracket)}</div>`;
    return { steps: [
        { text: `<p>Ett <strong>stapeldiagram</strong> visar antal som staplar – ju <strong>högre</strong> stapel, desto <strong>fler</strong> röster!</p>`,
          html: chart() },
        { text: `<p>Läs av en stapel: följ dess <strong>topp</strong> rakt ut mot <strong>skalan till vänster</strong>. 🍌 når upp till <strong>9</strong>!</p>`,
          html: chart([1]) },
        { text: `<p>Jämför: störst är 🍌 (<strong>9</strong>) och minst är 🍇 (<strong>4</strong>). Skillnaden är <strong>9 − 4 = 5</strong>!</p>`,
          html: chart([1, 2], true) },
        { text: `<p>Gissa <strong>inte</strong> på höjden med ögat – en stapel mellan två linjer är lätt att läsa fel på. Följ alltid rutlinjen till siffran!</p>`,
          warn: true,
          html: chart([3]) },
        { text: `<p><strong>Din tur!</strong> Hur många röstade på 🍓?</p>`,
          html: chart([3]),
          guess: { options: [
              { label: '6', ok: false },
              { label: '7', ok: true },
              { label: '8', ok: false },
          ] },
          doneText: `🍓 når upp till <strong>7</strong>! 🎉` },
    ] };
}

function buildPieDemo() {
    const items = [
        { label: 'Fotboll', icon: '⚽', val: 1 / 2, fracLabel: '1/2' },
        { label: 'Simning', icon: '🏊', val: 1 / 4, fracLabel: '1/4' },
        { label: 'Dans', icon: '💃', val: 1 / 4, fracLabel: '1/4' },
    ];
    const pie = (opts = {}) => renderPieChartSVG(items, { fracLabels: true, ...opts });
    return { steps: [
        { text: `<p>Ett <strong>cirkeldiagram</strong> visar <strong>andelar av en helhet</strong> – hela cirkeln är alla röster, och varje tårtbit är en andel. Titta när bitarna växer fram!</p>`,
          html: `<div class="flex justify-center">${renderPieChartSVG(items, { stagger: true })}</div>` },
        { text: `<p>Hälften av cirkeln är röd – fotboll fick <strong>hälften</strong> av rösterna, ${'1/2'}. Simning och dans fick en <strong>fjärdedel</strong> var.</p>`,
          html: `<div class="flex justify-center">${pie()}</div>` },
        { text: `<p>Räkna antal med samma knep som "bråk av antal": om <strong>20 elever</strong> röstade är fotboll 20 ÷ 2 = <strong>10 elever</strong>!</p>`,
          html: `<div class="demo-pop font-display font-bold text-2xl text-center text-violet-700">1/2 av 20 = 20 ÷ 2 = 10</div>` },
        { text: `<p>Och en fjärdedel? 20 ÷ 4 = <strong>5 elever</strong> var för simning och dans. Kontrollräkna alltid: 10 + 5 + 5 = 20 – hela cirkeln!</p>`,
          html: `<div class="demo-pop font-display font-bold text-xl text-center text-slate-700">bitarna tillsammans = helheten ✓</div>` },
        { text: `<p><strong>Din tur!</strong> 16 elever röstade. Simning är ${'1/4'} av cirkeln – hur många elever är det?</p>`,
          html: `<div class="flex justify-center">${pie({ dimExcept: 1 })}</div>`,
          guess: { options: [
              { label: '2', ok: false },
              { label: '4', ok: true },
              { label: '8', ok: false },
          ] },
          doneText: 'Rätt! 16 ÷ 4 = 4 elever. Bråk av antal fast i diagramform! 🎉' },
    ] };
}

function buildLineDemo() {
    const points = [
        { label: 'Mån', val: 2 }, { label: 'Tis', val: 5 }, { label: 'Ons', val: 3 },
        { label: 'Tor', val: -1 }, { label: 'Fre', val: -4 }, { label: 'Lör', val: 0 }, { label: 'Sön', val: 3 },
    ];
    const line = (opts = {}) => `<div class="flex justify-center">${renderLineChartSVG('Temperaturen en vecka', points, opts)}</div>`;
    return { steps: [
        { text: `<p>Ett <strong>linjediagram</strong> visar hur något <strong>förändras över tid</strong>. Varje punkt är en dag – linjen visar hur temperaturen rörde sig.</p>`,
          html: line({ stagger: true }) },
        { text: `<p>Avläs en punkt: hitta dagen längs nederkanten, följ den streckade linjen upp och läs skalan åt vänster. Tisdag var <strong>5 grader</strong>.</p>`,
          html: line({ guideIdx: 1 }) },
        { text: `<p>Den streckade <strong>noll-linjen</strong> är viktig! Punkter under den är minusgrader – fredag var <strong>−4 grader</strong>.</p>`,
          html: line({ guideIdx: 4 }) },
        { text: `<p>Jämföra två dagar över noll? Hoppa till noll först! Tisdag 5° mot fredag −4°: 5 + 4 = <strong>9 graders skillnad</strong>.</p>`,
          html: `<div class="demo-pop font-display font-bold text-xl text-center text-violet-700">5° → 0° är 5 steg, 0° → −4° är 4 steg: 5 + 4 = 9</div>` },
        { text: `<p><strong>Din tur!</strong> Hur många grader var det på onsdagen?</p>`,
          html: line({ guideIdx: 2 }),
          guess: { options: [
              { label: '2°', ok: false },
              { label: '3°', ok: true },
              { label: '−3°', ok: false },
          ] },
          doneText: 'Rätt! Onsdagens punkt ligger på 3 grader – över noll-linjen! 🎉' },
    ] };
}

