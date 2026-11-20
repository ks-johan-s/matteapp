// js/modules/frac.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { formatFractionHTML, formatMixedHTML, randInt, showFeedback, shuffleArray } from '../utils.js';
import { renderPizzaSVG } from '../visuals.js';

export function setFracSubMode(mode) {
    playSound('click');
    state.fracSubMode = mode;
    ['mix', 'frac', 'mixed', 'twins', 'percent', 'percentof', 'arith'].forEach(m => {
        const btn = document.getElementById(`frac-sub-${m}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (m === mode ? 'bg-pink-600 text-white' : 'bg-white border border-pink-200 text-slate-700');
    });
    generateFracQuestion();
}

export function generateFracQuestion() {
    document.getElementById('frac-feedback').classList.add('hidden');
    document.getElementById('frac-next-wrap').classList.add('hidden');
    document.getElementById('frac-twins-btn-wrap').classList.add('hidden');
    document.getElementById('frac-type-whole-wrap').classList.add('hidden');
    document.getElementById('frac-type-stack-wrap').classList.remove('hidden');
    document.getElementById('frac-type-pct-wrap').classList.add('hidden');

    let mode = state.fracSubMode;
    if (mode === 'mix') mode = ['frac', 'mixed', 'twins', 'percent', 'percentof', 'arith'][randInt(0, 5)];

    const toggleWrap = document.getElementById('frac-input-mode-toggle');
    const optsEl = document.getElementById('frac-options');
    const typeEl = document.getElementById('frac-type-wrap');
    const visEl = document.getElementById('frac-visual-container');

    if (mode === 'twins') {
        if (toggleWrap) toggleWrap.classList.add('hidden');
        optsEl.classList.add('hidden');
        typeEl.classList.add('hidden');
        document.getElementById('frac-twins-btn-wrap').classList.remove('hidden');

        const twinPairs = state.difficulty === 'hard'
            ? [
                { n1: 2, d1: 5, d2: 10, targetCount: 4 },
                { n1: 3, d1: 5, d2: 10, targetCount: 6 },
                { n1: 4, d1: 5, d2: 10, targetCount: 8 },
                { n1: 2, d1: 3, d2: 12, targetCount: 8 },
                { n1: 3, d1: 4, d2: 12, targetCount: 9 },
                { n1: 5, d1: 6, d2: 12, targetCount: 10 }
              ]
            : [
                { n1: 1, d1: 2, d2: 4, targetCount: 2 },
                { n1: 1, d1: 2, d2: 6, targetCount: 3 },
                { n1: 1, d1: 3, d2: 6, targetCount: 2 },
                { n1: 2, d1: 3, d2: 6, targetCount: 4 },
                { n1: 1, d1: 4, d2: 8, targetCount: 2 },
                { n1: 3, d1: 4, d2: 8, targetCount: 6 }
              ];
        const pair = twinPairs[randInt(0, twinPairs.length - 1)];
        state.twinSelected = [];
        state.currentFrac = { type: 'twins', ...pair };

        document.getElementById('frac-mode-badge').textContent = '👯 Bråktvillingar';
        document.getElementById('frac-question-text').innerHTML = `Färglägg den högra pizzan så den blir lika stor som ${formatFractionHTML(pair.n1, pair.d1)} !`;

        const renderTwinBox = () => {
            visEl.innerHTML = `
                <div class="flex flex-col items-center bg-pink-50/70 p-4 rounded-3xl border-2 border-pink-200">
                    <span class="text-xs font-extrabold text-pink-900 mb-1">Målpizza: ${formatFractionHTML(pair.n1, pair.d1)}</span>
                    ${renderPizzaSVG(pair.d1, Array.from({ length: pair.n1 }, (_, i) => i), false, '', 145)}
                </div>
                <span class="font-display font-bold text-3xl text-slate-400">=</span>
                <div class="flex flex-col items-center bg-emerald-50/70 p-4 rounded-3xl border-2 border-emerald-300">
                    <span class="text-xs font-extrabold text-emerald-900 mb-1">Klicka på bitarna: ${formatFractionHTML(state.twinSelected.length, pair.d2)}</span>
                    ${renderPizzaSVG(pair.d2, state.twinSelected, true, 'toggleTwinSlice', 145)}
                </div>
            `;
        };
        state.renderTwinBox = renderTwinBox;
        renderTwinBox();

        setHintSteps('frac', [
            `<p>Den vänstra pizzan visar ${formatFractionHTML(pair.n1, pair.d1)}. Den högra är delad i <strong>${pair.d2} bitar</strong> (${pair.d2 / pair.d1} gånger fler bitar).</p>`,
            `<p>Då behöver du färglägga <strong>${pair.n1} × ${pair.d2 / pair.d1} = ${pair.targetCount} bitar</strong> i den högra pizzan!</p>`
        ]);
        return;
    }

    if (toggleWrap) toggleWrap.classList.remove('hidden');

    if (mode === 'frac') {
        const dens = state.difficulty === 'easy'
            ? [2, 3, 4]
            : (state.difficulty === 'medium' ? [3, 4, 5, 6, 8] : [5, 6, 8, 9, 10, 12]);
        const den = dens[randInt(0, dens.length - 1)];
        const num = randInt(state.difficulty === 'hard' ? 2 : 1, den - 1);
        state.currentFrac = { type: 'frac', num, den };

        document.getElementById('frac-mode-badge').textContent = '🍕 Bråkform';
        document.getElementById('frac-question-text').textContent = 'Hur stor del av pizzan är färgad?';
        visEl.innerHTML = renderPizzaSVG(den, Array.from({ length: num }, (_, i) => i), false, '', 165);

        const miniFrac = (label, fracCls) => `<div class="my-1.5 flex items-center justify-center gap-3">
            ${renderPizzaSVG(den, label === 'den' ? Array.from({ length: den }, (_, i) => i) : Array.from({ length: num }, (_, i) => i), false, '', 90)}
            <div class="text-left">
                <div class="stacked-frac"><span class="stacked-frac-num ${fracCls === 'num' ? 'text-rose-600' : 'text-slate-400'}">${num}</span><span class="stacked-frac-den ${fracCls === 'den' ? 'text-sky-700' : 'text-slate-400'}">${den}</span></div>
                <div class="text-[10px] font-extrabold text-slate-500 mt-1">${label === 'den' ? `nämnaren = ${den} bitar totalt` : `täljaren = ${num} färgade`}</div>
            </div>
        </div>`;
        setHintSteps('frac', [
            `<p>Räkna hur många bitar pizzan är delad i totalt: <strong>${den} bitar</strong> (det är <strong class="text-sky-700">nämnaren</strong> där nere).</p>` + miniFrac('den', 'den'),
            `<p>Räkna hur många bitar som är färgade: <strong>${num} bitar</strong> (det är <strong class="text-rose-600">täljaren</strong> där uppe) ➔ ${formatFractionHTML(num, den)}!</p>` + miniFrac('num', 'num')
        ]);

        if (state.inputModes.frac === 'choice') {
            optsEl.classList.remove('hidden');
            typeEl.classList.add('hidden');
            const choices = [{ n: num, d: den }];
            while (choices.length < 4) {
                const cd = dens[randInt(0, dens.length - 1)];
                const cn = randInt(1, cd);
                if (!choices.some(c => c.n === cn && c.d === cd)) choices.push({ n: cn, d: cd });
            }
            const shuffled = shuffleArray(choices);
            state.currentFrac.choices = shuffled;
            optsEl.innerHTML = shuffled.map((c, idx) => `
                <button onclick="checkFracChoice(${idx})" class="btn-3d bg-white hover:bg-pink-50 border-3 border-pink-300 rounded-2xl py-3.5 font-display font-bold text-2xl text-slate-900">
                    ${formatFractionHTML(c.n, c.d)}
                </button>
            `).join('');
        } else {
            optsEl.classList.add('hidden');
            typeEl.classList.remove('hidden');
            document.getElementById('frac-input-num').value = '';
            document.getElementById('frac-input-den').value = '';
            document.getElementById('frac-input-num').focus();
        }
    } else if (mode === 'mixed') {
        const whole = randInt(state.difficulty === 'hard' ? 2 : 1, state.difficulty === 'easy' ? 2 : 4);
        const den = state.difficulty === 'hard'
            ? [4, 5, 6, 8][randInt(0, 3)]
            : [2, 3, 4][randInt(0, 2)];
        const num = randInt(state.difficulty === 'hard' ? 2 : 1, den - 1);
        state.currentFrac = { type: 'mixed', whole, num, den };

        document.getElementById('frac-mode-badge').textContent = '🍕🍕 Blandad form';
        document.getElementById('frac-question-text').textContent = 'Skriv hur många hela och hur många delar som visas!';
        let pizzasHtml = '';
        for (let w = 0; w < whole; w++) {
            pizzasHtml += renderPizzaSVG(den, Array.from({ length: den }, (_, i) => i), false, '', 120);
        }
        pizzasHtml += renderPizzaSVG(den, Array.from({ length: num }, (_, i) => i), false, '', 120);
        visEl.innerHTML = pizzasHtml;

        setHintSteps('frac', [
            `<p>Räkna först de <strong>hela</strong> pizzorna som är helt färgade: <strong>${whole} hela</strong>.</p>`,
            `<p>Titta på den sista pizzan: <strong>${num} av ${den}</strong> bitar är färgade (${formatFractionHTML(num, den)}). Tillsammans blir det ${formatMixedHTML(whole, num, den)}!</p>`
        ]);

        if (state.inputModes.frac === 'choice') {
            optsEl.classList.remove('hidden');
            typeEl.classList.add('hidden');
            const choices = [{ w: whole, n: num, d: den }];
            while (choices.length < 4) {
                const cw = randInt(1, 3);
                const cd = [2, 3, 4][randInt(0, 2)];
                const cn = randInt(1, cd - 1);
                if (!choices.some(c => c.w === cw && c.n === cn && c.d === cd)) choices.push({ w: cw, n: cn, d: cd });
            }
            const shuffled = shuffleArray(choices);
            state.currentFrac.choices = shuffled;
            optsEl.innerHTML = shuffled.map((c, idx) => `
                <button onclick="checkFracChoice(${idx})" class="btn-3d bg-white hover:bg-pink-50 border-3 border-pink-300 rounded-2xl py-3.5 font-display font-bold text-2xl text-slate-900">
                    ${formatMixedHTML(c.w, c.n, c.d)}
                </button>
            `).join('');
        } else {
            optsEl.classList.add('hidden');
            typeEl.classList.remove('hidden');
            document.getElementById('frac-type-whole-wrap').classList.remove('hidden');
            document.getElementById('frac-type-whole-wrap').classList.add('flex');
            document.getElementById('frac-input-whole').value = '';
            document.getElementById('frac-input-num').value = '';
            document.getElementById('frac-input-den').value = '';
            document.getElementById('frac-input-whole').focus();
        }
    } else if (mode === 'percentof') {
        const recipes = state.difficulty === 'easy'
            ? [{ n: 1, d: 2 }, { n: 1, d: 4 }, { n: 1, d: 5 }]
            : (state.difficulty === 'medium'
                ? [{ n: 1, d: 4 }, { n: 3, d: 4 }, { n: 1, d: 5 }, { n: 2, d: 5 }, { n: 1, d: 10 }]
                : [{ n: 3, d: 4 }, { n: 2, d: 5 }, { n: 3, d: 5 }, { n: 4, d: 5 }, { n: 3, d: 10 }, { n: 7, d: 10 }, { n: 9, d: 10 }, { n: 3, d: 20 }, { n: 7, d: 20 }]);
        const r = recipes[randInt(0, recipes.length - 1)];
        const perPart = randInt(state.difficulty === 'easy' ? 2 : 3, state.difficulty === 'hard' ? 15 : 10);
        const amount = r.d * perPart;
        const answer = r.n * perPart;
        const pct = Math.round((r.n / r.d) * 100);
        const things = [
            { text: 'kr i veckopengen', unit: 'kr' },
            { text: 'äpplen i korgen', unit: 'äpplen' },
            { text: 'sidor i boken', unit: 'sidor' },
            { text: 'minuter av en lektion', unit: 'minuter' },
            { text: 'elever i klassen', unit: 'elever' }
        ];
        const thing = things[randInt(0, things.length - 1)];
        state.currentFrac = { type: 'percentof', n: r.n, d: r.d, pct, amount, perPart, answer, unit: thing.unit };

        document.getElementById('frac-mode-badge').textContent = '💰 Procent av ett antal';
        document.getElementById('frac-question-text').innerHTML = `Hur mycket är <strong>${pct} %</strong> av <strong>${amount} ${thing.text}</strong>?`;

        visEl.innerHTML = `
            <div class="w-full max-w-xl">
                <div class="flex gap-1.5 justify-center">
                    ${Array.from({ length: r.d }, (_, i) => `
                        <div class="pile-pop flex-1 rounded-xl border-2 py-2 px-1 ${i < r.n ? 'bg-pink-200 border-pink-400' : 'bg-slate-100 border-slate-300'}" style="animation-delay:${i * 110}ms">
                            <div class="font-display font-bold text-lg ${i < r.n ? 'text-pink-950' : 'text-slate-500'}">${perPart}</div>
                            <div class="text-[10px] font-extrabold ${i < r.n ? 'text-pink-900' : 'text-slate-400'}">${i < r.n ? '💰' : 'del ' + (i + 1)}</div>
                        </div>`).join('')}
                </div>
                <div class="text-xs font-extrabold text-pink-900 mt-2">${pct} % = ${formatFractionHTML(r.n, r.d)} – ${r.n} av ${r.d} delar är markerade</div>
            </div>`;

        setHintSteps('frac', [
            `<p><strong>${pct} %</strong> betyder ${formatFractionHTML(r.n, r.d)} – dela <strong>${amount}</strong> i <strong>${r.d} lika delar</strong>.</p>`,
            `<p>Varje del är ${amount} ÷ ${r.d} = <strong>${perPart}</strong>. Vi ska ha <strong>${r.n}</strong> ${r.n === 1 ? 'del' : 'delar'}: ${r.n} × ${perPart} = <strong>${answer}</strong>!</p>`
        ]);

        if (state.inputModes.frac === 'choice') {
            optsEl.classList.remove('hidden');
            typeEl.classList.add('hidden');
            const set = new Set([answer]);
            while (set.size < 4) {
                const cand = answer + [-perPart, perPart, -2, 2, -1, 1][randInt(0, 5)];
                if (cand > 0 && cand <= amount) set.add(cand);
            }
            const shuffled = shuffleArray([...set]);
            state.currentFrac.choices = shuffled;
            optsEl.innerHTML = shuffled.map((v, idx) => `
                <button onclick="checkFracChoice(${idx})" class="btn-3d bg-white hover:bg-pink-50 border-3 border-pink-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
                    ${v} ${thing.unit}
                </button>
            `).join('');
        } else {
            optsEl.classList.add('hidden');
            typeEl.classList.remove('hidden');
            document.getElementById('frac-type-stack-wrap').classList.add('hidden');
            document.getElementById('frac-type-pct-wrap').classList.remove('hidden');
            document.getElementById('frac-type-pct-wrap').classList.add('flex');
            document.getElementById('frac-type-pct-unit').textContent = thing.unit;
            const inp = document.getElementById('frac-input-pct');
            inp.value = '';
            inp.focus();
        }
    } else if (mode === 'arith') {
        let n1, d1, n2, d2;
        const sameDen = state.difficulty !== 'hard' || Math.random() < 0.4;
        if (sameDen) {
            d1 = state.difficulty === 'easy' ? [3, 4, 5, 6][randInt(0, 3)] : [4, 5, 6, 8][randInt(0, 3)];
            d2 = d1;
            n1 = randInt(1, d1 - 1);
            n2 = randInt(1, d1 - 1);
            if (state.difficulty === 'easy' && n1 + n2 > d1) n2 = d1 - n1;
        } else {
            d1 = [2, 3, 4, 5][randInt(0, 3)];
            d2 = d1 * randInt(2, 3);
            n1 = randInt(1, d1 - 1);
            n2 = randInt(1, d2 - 1);
        }
        const cd = d2;
        const aNum = n1 * (cd / d1);
        const bNum = n2 * (cd / d2);
        const op = Math.random() < 0.45 && aNum > bNum ? '−' : '+';
        const resNum = op === '+' ? aNum + bNum : aNum - bNum;
        const gcd = (a, b) => (b ? gcd(b, a % b) : a);
        const gg = gcd(resNum, cd);
        const ansNum = resNum / gg, ansDen = cd / gg;
        state.currentFrac = { type: 'arith', n1, d1, n2, d2, op, resNum, cd, ansNum, ansDen };

        document.getElementById('frac-mode-badge').textContent = '➕ Räkna med bråk';
        document.getElementById('frac-question-text').innerHTML = `Beräkna: <span class="inline-flex items-center gap-2">${formatFractionHTML(n1, d1)}<span class="text-pink-600 font-bold">${op}</span>${formatFractionHTML(n2, d2)}</span>`;
        visEl.innerHTML = `
            ${renderPizzaSVG(d1, Array.from({ length: n1 }, (_, i) => i), false, '', 115)}
            <span class="font-display font-bold text-4xl text-pink-600">${op}</span>
            ${renderPizzaSVG(d2, Array.from({ length: n2 }, (_, i) => i), false, '', 115)}
            <span class="font-display font-bold text-4xl text-slate-400">=</span>
            <span class="font-display font-bold text-4xl text-pink-700">?</span>`;

        const simplifyNote = gg > 1 ? ` (förkorta till ${formatFractionHTML(ansNum, ansDen)})` : '';
        setHintSteps('frac', sameDen
            ? [`<p>Båda bråken har <strong>samma nämnare ${d1}</strong> – räkna bara på täljarna: ${n1} ${op} ${n2} = <strong>${resNum}</strong>.</p>`,
               `<p>Svaret är ${formatFractionHTML(resNum, cd)}${simplifyNote}!</p>`]
            : [`<p>Olika nämnare! <strong>Förläng</strong> ${formatFractionHTML(n1, d1)} med ${cd / d1} ➔ ${formatFractionHTML(aNum, cd)} så att båda får ${cd}delar.</p>`,
               `<p>Nu kan vi räkna på täljarna: ${aNum} ${op} ${bNum} = <strong>${resNum}</strong> ➔ ${formatFractionHTML(resNum, cd)}${simplifyNote}!</p>`]);

        if (state.inputModes.frac === 'choice') {
            optsEl.classList.remove('hidden');
            typeEl.classList.add('hidden');
            const choices = [{ n: ansNum, d: ansDen }];
            const wrongs = [{ n: resNum === ansNum ? resNum + 1 : resNum, d: cd === ansDen ? cd + 1 : cd },
                            { n: ansNum + 1, d: ansDen },
                            { n: Math.max(1, ansNum - 1), d: ansDen }];
            for (const w of wrongs) {
                if (choices.length < 4 && !choices.some(c => c.n === w.n && c.d === w.d)) choices.push(w);
            }
            const shuffled = shuffleArray(choices);
            state.currentFrac.choices = shuffled;
            optsEl.innerHTML = shuffled.map((c, idx) => `
                <button onclick="checkFracChoice(${idx})" class="btn-3d bg-white hover:bg-pink-50 border-3 border-pink-300 rounded-2xl py-3.5 font-display font-bold text-2xl text-slate-900">
                    ${formatFractionHTML(c.n, c.d)}
                </button>
            `).join('');
        } else {
            optsEl.classList.add('hidden');
            typeEl.classList.remove('hidden');
            document.getElementById('frac-input-num').value = '';
            document.getElementById('frac-input-den').value = '';
            document.getElementById('frac-input-num').focus();
        }
    } else {
        const pctItems = state.difficulty === 'hard'
            ? [
                { n: 3, d: 5, pct: 60 },
                { n: 4, d: 5, pct: 80 },
                { n: 3, d: 10, pct: 30 },
                { n: 7, d: 10, pct: 70 },
                { n: 9, d: 10, pct: 90 },
                { n: 1, d: 20, pct: 5 },
                { n: 3, d: 20, pct: 15 },
                { n: 7, d: 20, pct: 35 }
              ]
            : [
                { n: 1, d: 2, pct: 50 },
                { n: 1, d: 4, pct: 25 },
                { n: 3, d: 4, pct: 75 },
                { n: 4, d: 4, pct: 100 },
                { n: 1, d: 5, pct: 20 },
                { n: 2, d: 5, pct: 40 },
                { n: 1, d: 10, pct: 10 }
              ];
        const item = pctItems[randInt(0, pctItems.length - 1)];
        state.currentFrac = { type: 'percent', ...item };

        document.getElementById('frac-mode-badge').textContent = '💯 Bråk & Procent (%)';
        document.getElementById('frac-question-text').innerHTML = `Hur många procent (%) motsvarar ${formatFractionHTML(item.n, item.d)} ?`;
        visEl.innerHTML = renderPizzaSVG(item.d, Array.from({ length: item.n }, (_, i) => i), false, '', 160);

        setHintSteps('frac', [
            `<p>En hel pizza är alltid <strong>100 %</strong>.</p>`,
            `<p>Dela 100 % i <strong>${item.d} lika delar</strong>: varje del är <strong>${100 / item.d} %</strong>. Med <strong>${item.n}</strong> delar blir det <strong>${item.pct} %</strong>!</p>`
        ]);

        if (state.inputModes.frac === 'choice') {
            optsEl.classList.remove('hidden');
            typeEl.classList.add('hidden');
            const pool = state.difficulty === 'hard'
                ? [5, 10, 15, 20, 25, 30, 35, 40, 60, 70, 75, 80, 90]
                : [10, 20, 25, 40, 50, 75, 100];
            const set = new Set([item.pct]);
            while (set.size < 4) set.add(pool[randInt(0, pool.length - 1)]);
            const shuffled = shuffleArray([...set]);
            state.currentFrac.choices = shuffled;
            optsEl.innerHTML = shuffled.map((p, idx) => `
                <button onclick="checkFracChoice(${idx})" class="btn-3d bg-white hover:bg-pink-50 border-3 border-pink-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
                    ${p}%
                </button>
            `).join('');
        } else {
            optsEl.classList.add('hidden');
            typeEl.classList.remove('hidden');
            document.getElementById('frac-type-stack-wrap').classList.add('hidden');
            document.getElementById('frac-type-pct-wrap').classList.remove('hidden');
            document.getElementById('frac-type-pct-wrap').classList.add('flex');
            document.getElementById('frac-type-pct-unit').textContent = '%';
            const inp = document.getElementById('frac-input-pct');
            inp.value = '';
            inp.focus();
        }
    }
}

export function toggleTwinSlice(idx) {
    if (!document.getElementById('frac-next-wrap').classList.contains('hidden')) return;
    playSound('click');
    const pos = state.twinSelected.indexOf(idx);
    if (pos >= 0) state.twinSelected.splice(pos, 1);
    else state.twinSelected.push(idx);
    if (state.renderTwinBox) state.renderTwinBox();
}

export function checkFracTwins() {
    if (!document.getElementById('frac-next-wrap').classList.contains('hidden')) return;
    const { n1, d1, d2, targetCount } = state.currentFrac;
    if (state.twinSelected.length === targetCount) {
        addReward(2);
        showFeedback('frac-feedback', true, `👯 Mitt i prick! ${formatFractionHTML(n1, d1)} är lika mycket som ${formatFractionHTML(targetCount, d2)}!`);
        document.getElementById('frac-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('frac-feedback', false, `🤔 Du har färglagt ${state.twinSelected.length} bitar – jämför storleken med den vänstra pizzan och försök igen!`);
    }
}

export function checkFracChoice(idx) {
    if (!document.getElementById('frac-next-wrap').classList.contains('hidden')) return;
    const cur = state.currentFrac;
    const picked = cur.choices[idx];
    let ok = false;
    if (cur.type === 'frac') ok = picked.n === cur.num && picked.d === cur.den;
    else if (cur.type === 'mixed') ok = picked.w === cur.whole && picked.n === cur.num && picked.d === cur.den;
    else if (cur.type === 'percent') ok = picked === cur.pct;
    else if (cur.type === 'percentof') ok = picked === cur.answer;
    else if (cur.type === 'arith') ok = picked.n === cur.ansNum && picked.d === cur.ansDen;

    if (ok) {
        addReward(1);
        showFeedback('frac-feedback', true, '🎉 Helt rätt! Snyggt avläst!');
        document.getElementById('frac-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('frac-feedback', false, '🤔 Inte riktigt – kika på bitarna under "💡 Visa hur man tänker"!');
    }
}

export function checkFracTyped() {
    if (!document.getElementById('frac-next-wrap').classList.contains('hidden')) return;
    const cur = state.currentFrac;
    if (cur.type === 'frac') {
        const n = parseInt(document.getElementById('frac-input-num').value, 10);
        const d = parseInt(document.getElementById('frac-input-den').value, 10);
        if (n === cur.num && d === cur.den) {
            addReward(2);
            showFeedback('frac-feedback', true, `🎉 Rätt! ${formatFractionHTML(cur.num, cur.den)} stämmer!`);
            document.getElementById('frac-next-wrap').classList.remove('hidden');
        } else {
            resetStreak();
            showFeedback('frac-feedback', false, '🤔 Kolla täljaren där uppe och nämnaren där nere!');
        }
    } else if (cur.type === 'mixed') {
        const w = parseInt(document.getElementById('frac-input-whole').value, 10);
        const n = parseInt(document.getElementById('frac-input-num').value, 10);
        const d = parseInt(document.getElementById('frac-input-den').value, 10);
        if (w === cur.whole && n === cur.num && d === cur.den) {
            addReward(2);
            showFeedback('frac-feedback', true, `🎉 Rätt! ${formatMixedHTML(cur.whole, cur.num, cur.den)} stämmer!`);
            document.getElementById('frac-next-wrap').classList.remove('hidden');
        } else {
            resetStreak();
            showFeedback('frac-feedback', false, '🤔 Räkna de hela pizzorna först och sedan bråkdelen!');
        }
    } else if (cur.type === 'percent') {
        const p = parseInt(document.getElementById('frac-input-pct').value, 10);
        if (p === cur.pct) {
            addReward(2);
            showFeedback('frac-feedback', true, `🎉 Rätt! ${cur.pct} % stämmer!`);
            document.getElementById('frac-next-wrap').classList.remove('hidden');
        } else {
            resetStreak();
            showFeedback('frac-feedback', false, '🤔 Kom ihåg att en hel = 100 %!');
        }
    } else if (cur.type === 'percentof') {
        const v = parseInt(document.getElementById('frac-input-pct').value, 10);
        if (v === cur.answer) {
            addReward(2);
            showFeedback('frac-feedback', true, `🎉 Rätt! ${cur.pct} % av ${cur.amount} är ${cur.answer} ${cur.unit}!`);
            document.getElementById('frac-next-wrap').classList.remove('hidden');
        } else {
            resetStreak();
            showFeedback('frac-feedback', false, `🤔 Dela ${cur.amount} i ${cur.d} lika delar först – hur stor är varje del?`);
        }
    } else if (cur.type === 'arith') {
        const n = parseInt(document.getElementById('frac-input-num').value, 10);
        const d = parseInt(document.getElementById('frac-input-den').value, 10);
        if (!isNaN(n) && !isNaN(d) && d !== 0 && n * cur.ansDen === cur.ansNum * d) {
            addReward(2);
            const same = n === cur.ansNum && d === cur.ansDen;
            showFeedback('frac-feedback', true, same
                ? `🎉 Rätt! ${formatFractionHTML(cur.ansNum, cur.ansDen)} stämmer!`
                : `🎉 Rätt – och ${formatFractionHTML(n, d)} är lika mycket som ${formatFractionHTML(cur.ansNum, cur.ansDen)}!`);
            document.getElementById('frac-next-wrap').classList.remove('hidden');
        } else {
            resetStreak();
            showFeedback('frac-feedback', false, cur.d1 === cur.d2
                ? '🤔 Samma nämnare – räkna bara på täljarna!'
                : `🤔 Förläng bråken så de får samma nämnare (${cur.cd}) först!`);
        }
    }
}

// "Visa mig": pizzan delas upp och bitarna fylls i – täljare/nämnare
// blir konkreta. Spelas i den delade demo-overlaysn (js/demo.js).
export function buildFracDemoSteps() {
    const den = 4, num = 3;
    const sel = (n) => Array.from({ length: n }, (_, i) => i);
    const pizza = (selArr, anim) => `<div class="flex justify-center">${renderPizzaSVG(den, selArr, false, '', 195, anim)}</div>`;
    return { steps: [
        { text: `<p>En hel pizza! 🍕 Ingen bit saknas – den är <strong>en hel</strong>.</p>`,
          html: `<div class="demo-pop flex justify-center">${renderPizzaSVG(1, [0], false, '', 195)}</div>` },
        { text: `<p>Vi <strong>delar</strong> pizzan i <strong>${den} lika stora bitar</strong>.</p>`,
          html: pizza([], { popAll: true }) },
        { text: `<p>Varje bit är <strong>en fjärdedel</strong> – det skriver vi ${formatFractionHTML(1, den)}.</p>`,
          html: pizza([0], { popIdx: 0, spotIdx: 0 }) },
        { text: `<p>Nu tar vi <strong>${num} bitar</strong> – räkna med: en… två… tre!</p>`,
          html: pizza(sel(num), { staggerFrom: 0, spotIdx: num - 1 }) },
        { text: `<p>Många skriver bråket <strong>baklänges</strong>! Nämnaren står <strong>under</strong> strecket: ${formatFractionHTML(num, den)} betyder ${num} av ${den} delar – <strong>inte</strong> ${formatFractionHTML(den, num)}!</p>`,
          warn: true,
          html: `<div class="flex items-center justify-center gap-8 font-display font-bold text-4xl">
              <span class="text-emerald-600">${formatFractionHTML(num, den)} ✓</span>
              <span class="text-red-400 line-through opacity-70">${formatFractionHTML(den, num)} ✗</span>
          </div>` },
        { text: `<p><strong>Din tur!</strong> Vilket bråk visar pizzan? Kom ihåg: täljaren räknar bitarna, nämnaren säger hur många delar pizzan delades i.</p>`,
          html: `<div class="flex justify-center">${renderPizzaSVG(den, sel(num), false, '', 185)}</div>`,
          guess: { options: [
              { label: formatFractionHTML(den, num), ok: false },
              { label: formatFractionHTML(num, den), ok: true },
              { label: formatFractionHTML(num, den + 3), ok: false },
          ] },
          doneText: `${formatFractionHTML(num, den)} – ${num} av ${den} delar! 🎉` },
    ] };
}
