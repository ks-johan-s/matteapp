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
    ['mix', 'place', 'read', 'link', 'neg', 'temp'].forEach(m => {
        const btn = document.getElementById(`dec-sub-${m}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (m === mode ? 'bg-blue-600 text-white' : 'bg-white border border-blue-200 text-slate-700');
    });
    generateDecimalQuestion();
}

export let decimalDragging = false;

export function attachDecimalLineEvents(minVal, maxVal, step) {
    const svg = document.getElementById('decimal-interactive-svg');
    if (!svg) return;

    const updateFromClientX = (clientX) => {
        const rect = svg.getBoundingClientRect();
        const relX = ((clientX - rect.left) / rect.width) * 400;
        const clamped = Math.max(35, Math.min(365, relX));
        const ratio = (clamped - 35) / 330;
        const rawVal = minVal + ratio * (maxVal - minVal);
        const snapped = Math.round(rawVal / step) * step;
        state.decimalSliderVal = Math.round(snapped * 100) / 100;
        document.getElementById('decimal-slider-readout').textContent = formatNumSv(state.decimalSliderVal);
        document.getElementById('decimal-visual-container').innerHTML = renderDecimalNumberLineSVG(minVal, maxVal, step, state.decimalSliderVal, true, true);
        attachDecimalLineEvents(minVal, maxVal, step);
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
    const { minVal, maxVal, step } = state.currentDecimal;
    const next = Math.max(minVal, Math.min(maxVal, Math.round((state.decimalSliderVal + dir * step) * 100) / 100));
    state.decimalSliderVal = next;
    document.getElementById('decimal-slider-readout').textContent = formatNumSv(next);
    document.getElementById('decimal-visual-container').innerHTML = renderDecimalNumberLineSVG(minVal, maxVal, step, next, true, true);
    attachDecimalLineEvents(minVal, maxVal, step);
}

// Intervall per svårighetsgrad: [min, max, steg] — varierad linje och strecktäthet.
const RANGE_TABLE = {
    easy: [[0, 1, 0.1]],
    medium: [[0, 1, 0.1], [0, 10, 1], [0, 20, 2], [0, 50, 5], [0, 2, 0.2]],
    hard: [[0, 2, 0.05], [0, 100, 10], [0, 500, 50], [0, 1000, 100]]
};
const NEG_TABLE = {
    easy: [[-10, 10, 1]],
    medium: [[-10, 10, 1], [-20, 20, 2]],
    hard: [[-20, 20, 2], [-50, 50, 5], [-100, 100, 10]]
};
function pickRange(table) {
    const arr = table[state.difficulty] || table.medium;
    return arr[randInt(0, arr.length - 1)];
}


// Vertikal termometer: temperaturer, nollmarkering och hopp-bågar.
// jumps=true visar bro-genom-noll-uppdelningen (start→0→end) med antal steg.
function renderThermometerSVG(minT, maxT, opts = {}) {
    const { start = null, end = null, jumps = false, popStart = false } = opts;
    const span = maxT - minT;
    const H = 330, W = jumps ? 210 : 150;
    const tubeX = jumps ? 96 : 62, tubeW = 15;
    const padT = 14, padB = 14;
    const y = t => padT + (maxT - t) / span * (H - padT - padB);
    const labelEvery = span > 22 ? 5 : span > 12 ? 2 : 1;
    let g = '';
    // skala: streck varje grad, etiketter glesare
    for (let t = Math.ceil(minT); t <= Math.floor(maxT); t++) {
        const isZero = t === 0;
        const labeled = t % labelEvery === 0;
        const len = isZero ? 15 : labeled ? 11 : 6;
        g += `<line x1="${tubeX - len}" y1="${y(t)}" x2="${tubeX}" y2="${y(t)}" stroke="${isZero ? '#0d9488' : '#94a3b8'}" stroke-width="${isZero ? 2.6 : labeled ? 1.6 : 1}" />`;
        if (labeled || isZero) g += `<text x="${tubeX - len - 5}" y="${y(t) + 3.5}" text-anchor="end" font-family="Fredoka" font-weight="${isZero ? 800 : 600}" font-size="${isZero ? 12.5 : 11}" fill="${isZero ? '#0f766e' : '#475569'}">${t}</text>`;
    }
    // röret
    g += `<rect x="${tubeX}" y="${padT - 4}" width="${tubeW}" height="${H - padT - padB + 8}" rx="7.5" fill="#e0f2fe" stroke="#334155" stroke-width="2" />`;
    g += `<circle cx="${tubeX + tubeW / 2}" cy="${H - padB + 9}" r="13" fill="#ef4444" stroke="#334155" stroke-width="2" />`;
    // markörer: start blå, end röd
    const marker = (t, color, label, cls) => `
        <g class="${cls || ''}">
            <line x1="${tubeX + tubeW}" y1="${y(t)}" x2="${tubeX + tubeW + 10}" y2="${y(t)}" stroke="${color}" stroke-width="3" />
            <circle cx="${tubeX + tubeW + 14}" cy="${y(t)}" r="7" fill="${color}" stroke="#1e293b" stroke-width="1.5" />
            ${label ? `<text x="${tubeX + tubeW + 26}" y="${y(t) + 4}" font-family="Fredoka" font-weight="700" font-size="11.5" fill="${color}">${label}</text>` : ''}
        </g>`;
    if (start !== null) g += marker(start, '#3b82f6', opts.labelStart || 'mån', popStart ? 'demo-spot-svg' : '');
    if (end !== null) g += marker(end, '#ef4444', opts.labelEnd || 'tis');
    // hoppbågar: start→0→end i två färger med stegantal
    if (jumps && start !== null && end !== null) {
        const bx = tubeX - 34;
        const seg = (t1, t2, color, count, dy) => {
            const y1 = y(t1), y2 = y(t2);
            return `<g class="demo-pop" style="animation-delay:${dy}ms">
                <line x1="${bx}" y1="${y1}" x2="${bx}" y2="${y2}" stroke="${color}" stroke-width="3.5" stroke-linecap="round" />
                <path d="M ${bx - 5} ${y2 - 7} L ${bx} ${y2} L ${bx + 5} ${y2 - 7}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" />
                <text x="${bx - 9}" y="${(y1 + y2) / 2 + 4}" text-anchor="end" font-family="Fredoka" font-weight="800" font-size="12" fill="${color}">${count}</text>
            </g>`;
        };
        const crossesZero = (start > 0 && end < 0) || (start < 0 && end > 0);
        const down = end < start;
        if (crossesZero) {
            g += seg(start, 0, '#3b82f6', Math.abs(start), 100);
            g += seg(0, end, '#ef4444', Math.abs(end), 550);
        } else {
            g += seg(start, end, '#8b5cf6', Math.abs(start - end), 100);
        }
    }
    return `<svg width="100%" viewBox="0 0 ${W} ${H + 24}" class="max-w-[210px] mx-auto" style="overflow:visible">${g}</svg>`;
}

export function generateDecimalQuestion() {
    document.getElementById('decimal-feedback').classList.add('hidden');
    document.getElementById('decimal-next-wrap').classList.add('hidden');
    document.getElementById('decimal-place-controls').classList.add('hidden');

    let mode = state.decimalSubMode;
    if (mode === 'mix') mode = ['place', 'read', 'link', 'neg', 'temp'][randInt(0, 4)];

    const toggleWrap = document.getElementById('decimal-input-mode-toggle');
    const optsEl = document.getElementById('decimal-options');
    const typeEl = document.getElementById('decimal-type-wrap');

    if (mode === 'place') {
        if (toggleWrap) toggleWrap.classList.add('hidden');
        optsEl.classList.add('hidden');
        typeEl.classList.add('hidden');
        document.getElementById('decimal-place-controls').classList.remove('hidden');

        const [minVal, maxVal, step] = pickRange(RANGE_TABLE);
        const stepsCount = Math.round((maxVal - minVal) / step);
        const target = Math.round((minVal + randInt(1, stepsCount - 1) * step) * 100) / 100;

        state.currentDecimal = { mode: 'place', target, minVal, maxVal, step };
        state.decimalSliderVal = minVal;

        document.getElementById('decimal-mode-badge').textContent = '🎯 Placera på tallinjen';
        document.getElementById('decimal-question-text').textContent = `Dra eller klicka på tallinjen för att markera ${formatNumSv(target)} !`;
        document.getElementById('decimal-slider-readout').textContent = formatNumSv(minVal);
        document.getElementById('decimal-visual-container').innerHTML = renderDecimalNumberLineSVG(minVal, maxVal, step, minVal, true, true);
        attachDecimalLineEvents(minVal, maxVal, step);

        setHintSteps('decimal', [
            `<p>Tallinjen går från <strong>${formatNumSv(minVal)}</strong> till <strong>${formatNumSv(maxVal)}</strong> och är uppdelad i <strong>${stepsCount} lika stora steg</strong> à <strong>${formatNumSv(step)}</strong>.</p>`,
            `<p>Gå fram till <strong>${formatNumSv(target)}</strong> på tallinjen:</p>
             ${renderDecimalNumberLineSVG(minVal, maxVal, step, target, false, true, target)}`
        ]);
        return;
    }

    if (mode === 'temp') {
        const diff = state.difficulty;
        // cross = temperaturen passerar noll (den pedagogiska kärnan)
        const wantCross = diff === 'easy' ? Math.random() < 0.45 : diff === 'medium' ? Math.random() < 0.7 : Math.random() < 0.8;
        let a, b;
        if (wantCross) {
            const mag = diff === 'easy' ? 6 : diff === 'medium' ? 9 : 12;
            a = randInt(1, mag);
            b = -randInt(1, mag);
            if (Math.random() < 0.5) { const t = a; a = b; b = t; } // ibland startar den under noll
        } else if (diff === 'hard' && Math.random() < 0.4) {
            a = -randInt(3, 15); b = -randInt(1, 14);
            if (a === b) b = -(b + 3);
        } else {
            a = randInt(2, 14);
            b = randInt(0, 12);
            if (Math.abs(a - b) < 2) b = Math.max(0, a - 4);
        }
        const drops = b < a; // temperaturen sjunker
        const type = diff === 'easy' ? 'change' : Math.random() < 0.65 ? 'change' : 'findend';
        const change = Math.abs(a - b);
        const crossesZero = (a > 0 && b < 0) || (a < 0 && b > 0);
        state.currentDecimal = { mode: 'temp', type, a, b, change, crossesZero, drops,
            target: type === 'change' ? change : b };

        document.getElementById('decimal-mode-badge').textContent = '🌡️ Temperaturhopp';
        const qEl = document.getElementById('decimal-question-text');
        const visEl = document.getElementById('decimal-visual-container');
        const lo = Math.min(a, b) - 3, hi = Math.max(a, b, 0) + 3;
        const days = ['måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag'];
        const d1 = randInt(0, days.length - 2);
        const day1 = days[d1], day2 = days[d1 + 1];

        if (type === 'change') {
            qEl.innerHTML = `I ${day1} var det <strong>${a} grader</strong>. Till ${day2} ${drops ? 'sjönk' : 'steg'} temperaturen till <strong>${b} grader</strong>.<br>Hur många grader ${drops ? 'sjönk' : 'steg'} den?`;
        } else {
            state.currentDecimal.target = drops ? a - change : a + change;
            qEl.innerHTML = `På kvällen var det <strong>${a} grader</strong>. Under natten ${drops ? 'sjönk' : 'steg'} temperaturen <strong>${change} grader</strong>.<br>Vad visar termometern på morgonen?`;
        }
        visEl.innerHTML = renderThermometerSVG(lo, hi, type === 'change'
            ? { start: a, end: b, labelStart: day1.slice(0, 3), labelEnd: day2.slice(0, 3) }
            : { start: a, end: null, labelStart: 'kväll' });

        // ledtrådar: bron genom noll — samma strategi som tiotalshopp!
        if (crossesZero) {
            const first = Math.abs(a), second = Math.abs(b);
            setHintSteps('decimal', [
                `<p>När temperaturen passerar noll: <strong>dela upp hoppet vid nollan</strong> — precis som när du hoppar via tiotal! Räkna först biten till noll, sedan biten på andra sidan:</p>
                 <div class="demo-pop flex justify-center my-1">${renderThermometerSVG(lo, hi, { start: a, end: b, jumps: true, labelStart: day1.slice(0, 3), labelEnd: day2.slice(0, 3) })}</div>`,
                `<p>Första biten: ${a} → 0 är <strong>${first} grader</strong>. Andra biten: 0 → ${b} är <strong>${second} grader</strong>. Totalt ${type === 'change' ? `${first} + ${second} = <strong>${first + second} grader</strong>` : 'hoppas det hela vägen'}!</p>`
            ]);
        } else {
            setHintSteps('decimal', [
                `<p>Hoppet passerar inte noll — räkna bara avståndet mellan de två temperaturerna på termometern: från <strong>${a}</strong> till <strong>${b}</strong>.</p>
                 <div class="demo-pop flex justify-center my-1">${renderThermometerSVG(lo, hi, { start: a, end: type === 'change' ? b : null, jumps: type === 'change', labelStart: day1.slice(0, 3), labelEnd: day2.slice(0, 3) })}</div>`,
                type === 'change'
                    ? `<p>Skillnaden är <strong>${change} grader</strong>${a < 0 && b < 0 ? ' – båda är under noll, men avståndet räknas på samma sätt!' : '.'}</p>`
                    : `<p>Från ${a}, hoppa ${change} steg ${drops ? 'neråt' : 'uppåt'} — då landar du på <strong>${state.currentDecimal.target}</strong>.</p>`
            ]);
        }

        // flervalsalternativ med autentiska fällor
        const correct = state.currentDecimal.target;
        const opts = new Set([correct]);
        if (type === 'change') {
            if (crossesZero) {
                const naive = Math.abs(a) - Math.abs(b); // 5 → -5 ger 0! klassikern
                if (naive >= 0) opts.add(naive);
            } else {
                const overcount = Math.abs(a) + Math.abs(b);
                if (overcount !== correct) opts.add(overcount);
            }
            opts.add(correct + 2);
            if (correct - 2 > 0) opts.add(correct - 2);
        } else {
            opts.add(a + (drops ? change : -change)); // fel riktning!
            opts.add(correct + 2);
            opts.add(correct - 2);
            if (correct > 0) opts.add(-correct); // teckenfälla
            else if (correct < 0) opts.add(-correct);
        }
        const arr = [...opts].filter(v => v !== correct && (type === 'change' ? v >= 0 : true)).slice(0, 3);
        for (let fill = 3; arr.length < 3 && fill < 9; fill++) {
            const cand = correct + fill;
            if (!arr.includes(cand)) arr.push(cand);
        }
        arr.push(correct);

        if (state.inputModes.decimal === 'choice') {
            optsEl.classList.remove('hidden');
            typeEl.classList.add('hidden');
            optsEl.innerHTML = shuffleArray(arr).map(v => `
                <button onclick="checkDecimalChoice(${v})" class="btn-3d bg-white hover:bg-blue-50 border-3 border-blue-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
                    ${formatNumSv(v)}${type === 'change' ? ' grader' : '°'}
                </button>
            `).join('');
        } else {
            optsEl.classList.add('hidden');
            typeEl.classList.remove('hidden');
            const inp = document.getElementById('decimal-type-input');
            inp.value = '';
            inp.focus();
        }
        return;
    }

    if (mode === 'neg') {
        const [minVal, maxVal, step] = pickRange(NEG_TABLE);
        const stepsCount = Math.round((maxVal - minVal) / step);
        const target = Math.round((minVal + randInt(1, stepsCount - 1) * step) * 100) / 100;
        state.currentDecimal = { mode: 'neg', target, minVal, maxVal, step };

        document.getElementById('decimal-mode-badge').textContent = '🌡️ Negativa tal';
        document.getElementById('decimal-question-text').textContent = 'Vilket tal pekar den röda markören (?) på?';
        document.getElementById('decimal-visual-container').innerHTML = renderDecimalNumberLineSVG(minVal, maxVal, step, target, false, false);

        setHintSteps('decimal', [
            `<p>Tallinjen går <strong>genom noll</strong> – talen till vänster om den <strong>tealfärgade nollan</strong> är <strong>negativa</strong> (minus). Varje streck är <strong>${formatNumSv(step)}</strong>.</p>`,
            `<p>Markören står på <strong>${formatNumSv(target)}</strong>:</p>
             ${renderDecimalNumberLineSVG(minVal, maxVal, step, target, false, true, target)}`
        ]);

        if (state.inputModes.decimal === 'choice') {
            optsEl.classList.remove('hidden');
            typeEl.classList.add('hidden');
            const set = new Set([target]);
            if (-target !== target) set.add(-target);
            while (set.size < 4) {
                const cand = Math.round((minVal + randInt(0, stepsCount) * step) * 100) / 100;
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
        return;
    }

    if (toggleWrap) toggleWrap.classList.remove('hidden');

    if (mode === 'read') {
        const [minVal, maxVal, step] = pickRange(RANGE_TABLE);
        const stepsCount = Math.round((maxVal - minVal) / step);
        const target = Math.round((minVal + randInt(1, stepsCount - 1) * step) * 100) / 100;
        state.currentDecimal = { mode: 'read', target, minVal, maxVal, step };

        document.getElementById('decimal-mode-badge').textContent = '🔍 Läs av tallinjen';
        document.getElementById('decimal-question-text').textContent = 'Vilket tal pekar den röda markören (?) på?';
        document.getElementById('decimal-visual-container').innerHTML = renderDecimalNumberLineSVG(minVal, maxVal, step, target, false, false);

        setHintSteps('decimal', [
            `<p>Varje litet streck på tallinjen är värt <strong>${formatNumSv(step)}</strong>. Räkna strecken från närmaste markerade tal!</p>`,
            `<p>Markören står på <strong>${formatNumSv(target)}</strong>:</p>
             ${renderDecimalNumberLineSVG(minVal, maxVal, step, target, false, true, target)}`
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
             ${renderDecimalNumberLineSVG(0, 1, 0.05, item.dec, false, true, item.dec)}`
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
    const cur = state.currentDecimal;
    const { target } = cur;
    const isTemp = cur.mode === 'temp';
    if (Math.abs(val - target) < 0.005) {
        addReward(1);
        if (isTemp && cur.type === 'change' && cur.crossesZero) {
            showFeedback('decimal-feedback', true, `🎉 Rätt! Hoppet delas vid nollan: ${cur.a} → 0 är ${Math.abs(cur.a)} grader och 0 → ${cur.b} är ${Math.abs(cur.b)} grader – totalt ${cur.change} grader!`);
        } else if (isTemp && cur.type === 'findend') {
            showFeedback('decimal-feedback', true, `🎉 Rätt! Termometern visar ${formatNumSv(target)} grader på morgonen${target < 0 ? ' – under noll!' : '.'}`);
        } else {
            showFeedback('decimal-feedback', true, `🎉 Helt rätt! Svaret är ${formatNumSv(target)}!`);
        }
        document.getElementById('decimal-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        if (isTemp && cur.crossesZero && Math.abs(val - (Math.abs(cur.a) - Math.abs(cur.b))) < 0.005) {
            showFeedback('decimal-feedback', false, `🤔 Nollfällan! Det är frestande att räkna ${Math.abs(cur.a)} − ${Math.abs(cur.b)} – men temperaturen fortsätter <strong>förbi</strong> noll! Dela hoppet vid nollan: först ner till 0, sedan vidare. Kika på 💡-tipset!`);
        } else if (isTemp && cur.type === 'findend' && Math.abs(val - (cur.a + (cur.drops ? cur.change : -cur.change))) < 0.005) {
            showFeedback('decimal-feedback', false, `🤔 Fel håll på termometern! Temperaturen ${cur.drops ? 'sjönk' : 'steg'} – hoppet går ${cur.drops ? 'neråt' : 'uppåt'}.`);
        } else {
            showFeedback('decimal-feedback', false, `🤔 Inte riktigt ${formatNumSv(val)} – kika på tallinjen under "💡 Visa hur man tänker"!`);
        }
    }
}

export function checkDecimalTyped() {
    const raw = document.getElementById('decimal-type-input').value.trim().replace(',', '.');
    const val = parseFloat(raw);
    if (isNaN(val)) return;
    checkDecimalChoice(val);
}

// "Visa mig": markören hoppar ut på tallinjen – tiondelarna räknas
// streck för streck.
export function buildDecimalTempDemoSteps() {
    const a = 5, b = -3, lo = -6, hi = 8;
    const th = (opts) => `<div class="demo-pop flex justify-center my-1">${renderThermometerSVG(lo, hi, opts)}</div>`;
    return { steps: [
        { text: `<p>I måndags var det <strong>5 grader</strong> – plus. Till tisdags hade det blivit <strong>-3 grader</strong> – minus! Hur många grader sjönk temperaturen?</p>`,
          html: th({ start: a, end: b }) },
        { text: `<p>Många svarar 2 grader – för 5 minus 3 är 2. Men det är en <strong>fälla</strong>! Temperaturen stannade ju inte vid noll…</p>`,
          html: th({ start: a, end: b, popStart: true }) },
        { text: `<p><strong>Knepet: dela hoppet vid nollan!</strong> Först sjunker det från 5 ner till 0 – det är <strong>5 grader</strong>.</p>`,
          html: th({ start: a, end: b, jumps: true }) },
        { text: `<p>Sedan fortsätter det från 0 ner till -3 – <strong>3 grader till</strong>. Totalt: 5 + 3 = <strong>8 grader</strong>!</p>`,
          html: th({ start: a, end: b, jumps: true }) +
               `<div class="demo-pop mt-2 font-display font-bold text-xl text-emerald-700" style="animation-delay:300ms">5 + 3 = 8 grader kallare</div>` },
        { text: `<p><strong>Din tur!</strong> Det var 4 grader på dagen och -2 grader på natten. Hur många grader sjönk det?</p>`,
          html: th({ start: 4, end: -2 }),
          guess: { options: [
              { label: '2 grader', ok: false },
              { label: '6 grader', ok: true },
              { label: '8 grader', ok: false },
          ] },
          doneText: 'Rätt! 4 ner till noll är 4 grader, och 0 ner till -2 är 2 till: 4 + 2 = 6 grader! 🎉' },
    ] };
}

export function buildDecimalDemoSteps() {
    if (state.decimalSubMode === 'temp') return buildDecimalTempDemoSteps();
    const val = 0.7, guessVal = 0.4;
    const line = (marker, opts) => `<div class="max-w-lg mx-auto">${renderDecimalNumberLineSVG(0, 1, 0.1, marker, false, opts.label !== false, opts.jump !== undefined ? opts.jump : null, opts)}</div>`;
    return { steps: [
        { text: `<p>Den här tallinjen går från <strong>0</strong> till <strong>1</strong>.</p>`,
          html: line(0, { hideMarker: true }) },
        { text: `<p>Den är delad i <strong>10 lika stora delar</strong> – räkna märkena som tänds: varje litet streck är <strong>en tiondel (0,1)</strong>!</p>`,
          html: line(0, { hideMarker: true, countTicks: 10 }) },
        { text: `<p>Räkna inte strecken från 1 – börja vid <strong>nollan</strong>! Första strecket efter 0 är ${formatNumSv(0.1)}, andra är ${formatNumSv(0.2)} …</p>`,
          warn: true,
          html: line(0.1, { countTicks: 1 }) },
        { text: `<p>Markören <strong>hoppar ut</strong> på linjen! Följ bågen: 0,1 – 0,2 – … – <strong>${formatNumSv(val)}</strong>. Sju streck = sju tiondelar!</p>`,
          html: line(val, { countTicks: 7, jump: val, markerCls: 'demo-marker-hop' }) },
        { text: `<p><strong>Din tur!</strong> Vilket tal visar markören? Räkna strecken från nollan: 0,1 – 0,2 – 0,3 …</p>`,
          html: line(guessVal, { label: false, markerCls: 'demo-marker-hop demo-spot-svg' }),
          guess: { options: [
              { label: '4', ok: false },
              { label: formatNumSv(guessVal), ok: true },
              { label: formatNumSv(0.04), ok: false },
          ] },
          doneText: `${formatNumSv(guessVal)} – fyra tiondelar! 🎉` },
    ] };
}
