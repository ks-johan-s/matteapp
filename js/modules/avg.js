// js/modules/avg.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { formatNumSv, randInt, showFeedback, shuffleArray } from '../utils.js';
import { renderMeanLevelingSVG } from '../visuals.js';

/* =============================================================
   17. MODUL 14: MEDELVÄRDE (GENOMSNITT), MEDIAN & TYPVÄRDE
============================================================== */
export function setAvgSubMode(mode) {
    playSound('click');
    state.avgSubMode = mode;
    ['mix', 'mean', 'median', 'mode', 'level'].forEach(m => {
        const btn = document.getElementById(`avg-sub-${m}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (m === mode ? 'bg-rose-600 text-white' : 'bg-white border border-rose-200 text-slate-700');
    });
    generateAvgQuestion();
}

export function generateAvgQuestion() {
    document.getElementById('avg-feedback').classList.add('hidden');
    document.getElementById('avg-next-wrap').classList.add('hidden');

    let mode = state.avgSubMode;
    if (mode === 'mix') mode = ['mean', 'median', 'mode'][randInt(0, 2)];

    const modeToggle = document.getElementById('avg-mode-choice');
    if (modeToggle) modeToggle.parentElement.classList.remove('hidden');

    if (mode === 'level') {
        // CPA-läge: eleven flyttar kuber mellan staplarna tills alla är lika höga.
        const count = state.difficulty === 'easy' ? 3 : 4;
        const m = state.difficulty === 'easy' ? randInt(4, 7) : (state.difficulty === 'medium' ? randInt(6, 10) : randInt(8, 14));
        const bars = Array(count).fill(m);
        const moves = randInt(2, 5);
        for (let k = 0; k < moves; k++) {
            const src = randInt(0, count - 1), dst = randInt(0, count - 1);
            if (src !== dst && bars[src] > 1) { bars[src]--; bars[dst]++; }
        }
        if (bars.every(b => b === bars[0])) { bars[0]--; bars[1]++; } // stör utan att ändra summan – annars olösbart!
        state.currentAvg = { mode: 'level', bars, hand: 0, answer: m };
        document.getElementById('avg-mode-badge').textContent = '🧱 Jämna ut';
        document.getElementById('avg-question-text').innerHTML = 'Jämna ut staplarna så <strong>alla blir lika höga</strong>!';
        document.getElementById('avg-context-note').textContent = '💡 Dra en kub till en annan stapel – eller klicka för att ta/lägga!';
        if (modeToggle) modeToggle.parentElement.classList.add('hidden');
        document.getElementById('avg-options').classList.add('hidden');
        document.getElementById('avg-type-wrap').classList.add('hidden');
        setHintSteps('avg', [
            `<p><strong>Medelvärde = "jämn utdelning".</strong> Ta kuber från de höga staplarna och lägg på de låga – tills alla är lika höga!</p>`,
            `<p>När alla staplar är lika höga är höjden just <strong>medelvärdet</strong> – utan att räkna summan!</p>`
        ]);
        renderAvgLevel();
        return;
    }

    const isHard = state.difficulty === 'hard';
    const contexts = [
        { title: 'Lästa sidor per dag', labels: ['Mån', 'Tis', 'Ons', 'Tor', 'Fre'], unit: 'sidor' },
        { title: 'Mål på fotbollsträningen', labels: ['Pass 1', 'Pass 2', 'Pass 3', 'Pass 4', 'Pass 5'], unit: 'mål' },
        { title: 'Plockade äpplen i korgarna', labels: ['Korg 1', 'Korg 2', 'Korg 3', 'Korg 4', 'Korg 5'], unit: 'äpplen' },
        { title: 'Poäng i rundorna', labels: ['Omg 1', 'Omg 2', 'Omg 3', 'Omg 4', 'Omg 5'], unit: 'poäng' }
    ];
    const ctx = contexts[randInt(0, contexts.length - 1)];

    let nums = [], answer = 0, badge = '', qText = '', contextNote = '', visualHtml = '', hints = [];

    if (mode === 'mean') {
        badge = '⚖️ Medelvärde (Genomsnitt)';
        qText = 'Vad är medelvärdet (genomsnittet) av talen?';
        contextNote = `📊 ${ctx.title}`;

        if (state.difficulty === 'easy') {
            const target = randInt(3, 8);
            const d1 = randInt(1, 2);
            const d2 = randInt(1, 2);
            nums = shuffleArray([target - d1, target, target + d1]);
            if (Math.random() < 0.5) nums = shuffleArray([target - d1 - d2, target + d1, target + d2]);
            answer = nums.reduce((a, b) => a + b, 0) / nums.length;
        } else if (state.difficulty === 'medium') {
            const target = randInt(5, 12);
            const a = randInt(1, 3), b = randInt(1, 3);
            nums = shuffleArray([target - a, target + a, target - b, target + b]);
            answer = target;
        } else {
            if (Math.random() < 0.55) {
                const target = randInt(12, 22);
                const a = randInt(2, 5), b = randInt(2, 6);
                nums = shuffleArray([target - a, target + a, target, target - b, target + b]);
                answer = target;
            } else {
                const base = randInt(5, 11);
                nums = shuffleArray([base - 1, base, base + 1, base + 2]);
                answer = nums.reduce((a, b) => a + b, 0) / nums.length;
            }
        }

        const sum = nums.reduce((a, b) => a + b, 0);
        const count = nums.length;

        visualHtml = nums.map((n, idx) => `
            <div class="bg-rose-50 border-2 border-rose-300 rounded-2xl px-4 py-3 min-w-[74px] shadow-2xs">
                <div class="text-[11px] font-extrabold text-rose-800 uppercase">${ctx.labels[idx]}</div>
                <div class="font-display font-bold text-2xl sm:text-3xl text-slate-900 mt-0.5">${formatNumSv(n)}</div>
            </div>
        `).join('');

        hints = [
            `<p><strong>Steg 1 (Lägg ihop alla talen):</strong> Räkna ut summan tillsammans:<br>
             <span class="inline-block mt-1 px-3 py-1 rounded-xl bg-rose-100 font-display font-bold text-rose-950">${nums.map(formatNumSv).join(' + ')} = ${formatNumSv(sum)}</span></p>`,
            `<p><strong>Steg 2 (Dela lika på antal tal = ${count} st):</strong> Jämna ut staplarna så alla får lika mycket: <strong>${formatNumSv(sum)} ÷ ${count} = ${formatNumSv(answer)}</strong>!</p>
             ${renderMeanLevelingSVG(nums, ctx.labels, answer)}`
        ];
    } else if (mode === 'median') {
        badge = '🎯 Median (Mittersta talet)';
        qText = 'Vad är medianen av dessa tal?';
        contextNote = '💡 Tips: Dra korten i storleksordning – medianen hittar du i mitten!';

        if (state.difficulty === 'easy') {
            const pool = shuffleArray([2, 3, 4, 5, 6, 7, 8, 9]);
            nums = pool.slice(0, 3);
            const sorted = [...nums].sort((a, b) => a - b);
            answer = sorted[1];

            hints = [
                `<p><strong>Steg 1:</strong> Sortera de 3 talen i storleksordning (från minst till störst):</p>
                 <div class="my-2 flex items-center justify-center gap-2 font-display font-bold text-lg">
                    <span class="px-3 py-1 rounded-xl bg-slate-100 text-slate-500 line-through">${sorted[0]}</span>
                    <span class="px-4 py-1.5 rounded-xl bg-emerald-500 text-white shadow-xs">${sorted[1]}</span>
                    <span class="px-3 py-1 rounded-xl bg-slate-100 text-slate-500 line-through">${sorted[2]}</span>
                 </div>`,
                `<p><strong>Steg 2:</strong> Talet precis i mitten är <strong>${answer}</strong>!</p>`
            ];
        } else if (state.difficulty === 'medium') {
            const pool = shuffleArray([3, 4, 5, 6, 7, 8, 9, 11, 12, 14, 15]);
            nums = pool.slice(0, 5);
            const sorted = [...nums].sort((a, b) => a - b);
            answer = sorted[2];

            hints = [
                `<p><strong>Steg 1:</strong> Sortera alla 5 talen från minst till störst:</p>
                 <div class="my-2 flex flex-wrap items-center justify-center gap-2 font-display font-bold text-base">
                    ${sorted.map((v, i) => `<span class="px-3 py-1 rounded-xl ${i === 2 ? 'bg-emerald-500 text-white shadow-xs scale-105' : 'bg-slate-100 text-slate-500 line-through'}">${v}</span>`).join('')}
                 </div>`,
                `<p><strong>Steg 2:</strong> När vi plockar bort ett tal från vänster och ett från höger blir <strong>${answer}</strong> kvar precis i mitten!</p>`
            ];
        } else {
            const base = randInt(4, 14);
            const n1 = base - randInt(3, 5);
            const m1 = base;
            const m2 = base + [2, 4, 6][randInt(0, 2)];
            const n4 = m2 + randInt(3, 6);
            nums = shuffleArray([n1, m1, m2, n4]);
            const sorted = [...nums].sort((a, b) => a - b);
            answer = (m1 + m2) / 2;

            hints = [
                `<p><strong>Steg 1:</strong> Sortera de 4 talen från minst till störst. Eftersom det är ett jämnt antal tal hamnar <strong>två tal i mitten</strong>:</p>
                 <div class="my-2 flex items-center justify-center gap-2 font-display font-bold text-base">
                    <span class="px-3 py-1 rounded-xl bg-slate-100 text-slate-400 line-through">${sorted[0]}</span>
                    <span class="px-3.5 py-1.5 rounded-xl bg-amber-300 text-amber-950 border-2 border-amber-500">${sorted[1]}</span>
                    <span class="px-3.5 py-1.5 rounded-xl bg-amber-300 text-amber-950 border-2 border-amber-500">${sorted[2]}</span>
                    <span class="px-3 py-1 rounded-xl bg-slate-100 text-slate-400 line-through">${sorted[3]}</span>
                 </div>`,
                `<p><strong>Steg 2:</strong> Medianen ligger precis mitt emellan <strong>${sorted[1]}</strong> och <strong>${sorted[2]}</strong>: <strong>(${sorted[1]} + ${sorted[2]}) ÷ 2 = ${formatNumSv(answer)}</strong>!</p>`
            ];
        }

        visualHtml = ''; // renderas som dragsorterbara kort via renderAvgSortCards()
    } else {
        badge = '👑 Typvärde (Vanligaste talet)';
        qText = 'Vilket är typvärdet (det tal som förekommer flest gånger)?';
        contextNote = '👟 Undersökning i klassen';

        const count = state.difficulty === 'easy' ? 5 : (state.difficulty === 'medium' ? 6 : 8);
        const winner = randInt(2, 9);
        const others = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(x => x !== winner));

        if (state.difficulty === 'easy') {
            nums = shuffleArray([winner, winner, winner, others[0], others[1]]);
        } else if (state.difficulty === 'medium') {
            nums = shuffleArray([winner, winner, winner, others[0], others[0], others[1]]);
        } else {
            nums = shuffleArray([winner, winner, winner, winner, others[0], others[0], others[1], others[2]]);
        }
        answer = winner;

        visualHtml = ''; // renderas som dragsorterbara kort via renderAvgSortCards()

        const freqMap = {};
        nums.forEach(x => freqMap[x] = (freqMap[x] || 0) + 1);
        const sortedKeys = Object.keys(freqMap).map(Number).sort((a, b) => a - b);

        hints = [
            `<p><strong>Steg 1:</strong> Räkna hur många gånger varje tal finns med:</p>
             <div class="my-2 flex flex-wrap items-center justify-center gap-2 text-xs font-extrabold">
                ${sortedKeys.map(k => `<span class="px-3 py-1.5 rounded-xl border ${k === winner ? 'bg-emerald-100 border-emerald-400 text-emerald-950' : 'bg-slate-100 border-slate-200 text-slate-700'}">Talet <strong>${k}</strong>: ${freqMap[k]} st</span>`).join('')}
             </div>`,
            `<p><strong>Steg 2:</strong> Talet <strong>${winner}</strong> finns med flest gånger (${freqMap[winner]} st), så typvärdet är <strong>${winner}</strong>!</p>`
        ];
    }

    state.currentAvg = { mode, nums, answer, order: [...nums] };
    document.getElementById('avg-mode-badge').textContent = badge;
    document.getElementById('avg-question-text').textContent = qText;
    document.getElementById('avg-context-note').textContent = contextNote;
    document.getElementById('avg-visual-container').innerHTML = visualHtml;
    setHintSteps('avg', hints);
    if (mode === 'median' || mode === 'mode') renderAvgSortCards();

    const optsEl = document.getElementById('avg-options');
    const typeEl = document.getElementById('avg-type-wrap');
    if (state.inputModes.avg === 'choice') {
        optsEl.classList.remove('hidden');
        typeEl.classList.add('hidden');
        const vals = [answer];
        const pool = [...nums, answer - 1, answer + 1, answer - 2, answer + 2, answer + 3];
        for (const c of shuffleArray(pool)) {
            const r = Math.round(c * 100) / 100;
            if (vals.length < 4 && r > 0 && !vals.some(v => Math.abs(v - r) < 0.01)) {
                vals.push(r);
            }
        }
        while (vals.length < 4) vals.push(answer + vals.length + 1);
        optsEl.innerHTML = shuffleArray(vals).map(v => `
            <button onclick="checkAvgChoice(${v})" class="btn-3d bg-white hover:bg-rose-50 border-3 border-rose-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
                ${formatNumSv(v)}
            </button>
        `).join('');
    } else {
        optsEl.classList.add('hidden');
        typeEl.classList.remove('hidden');
        const inp = document.getElementById('avg-type-input');
        inp.value = '';
        inp.focus();
    }
}

export function checkAvgChoice(val) {
    if (!document.getElementById('avg-next-wrap').classList.contains('hidden')) return;
    const { mode, answer } = state.currentAvg;
    if (Math.abs(val - answer) < 0.01) {
        addReward(1);
        const label = mode === 'mean' ? 'medelvärdet' : (mode === 'median' ? 'medianen' : 'typvärdet');
        showFeedback('avg-feedback', true, `🎉 Helt rätt! ${formatNumSv(answer)} är ${label}!`);
        document.getElementById('avg-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        const hintTip = mode === 'mean'
            ? 'Lägg ihop alla tal och dela med hur många de är!'
            : (mode === 'median'
                ? 'Kom ihåg att sortera talen från minst till störst först!'
                : 'Räkna vilket tal som dyker upp flest gånger!');
        showFeedback('avg-feedback', false, `🤔 Inte riktigt ${formatNumSv(val)} – ${hintTip}`);
    }
}

export function checkAvgTyped() {
    const raw = document.getElementById('avg-type-input').value.trim().replace(',', '.');
    const val = parseFloat(raw);
    if (isNaN(val)) return;
    checkAvgChoice(val);
}

// Jämna ut-läget (CPA): dra eller klicka kuber mellan staplarna tills alla är lika.
function renderAvgLevel() {
    const cur = state.currentAvg;
    const barsHtml = cur.bars.map((n, i) => `
        <button onclick="avgLevelClick(${i})" class="avg-level-stack btn-3d bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 rounded-b-none rounded-t-xl px-2 pt-2 pb-0 flex flex-col items-center justify-end min-w-[56px] min-h-[200px] relative touch-none select-none">
            <span class="absolute top-1.5 font-display font-bold text-sm text-rose-900">${n}</span>
            ${'<div class="w-9 h-5 rounded bg-rose-400 border border-rose-600 mt-1 transition-all"></div>'.repeat(Math.min(n, 14))}${n > 14 ? `<div class="w-9 h-5 rounded bg-rose-500 border border-rose-700 mt-1 flex items-center justify-center text-[10px] font-extrabold text-white">+${n - 14}</div>` : ''}
        </button>`).join('');

    const allEqual = cur.bars.every(b => b === cur.bars[0]);
    document.getElementById('avg-visual-container').innerHTML = `
        <div class="w-full max-w-xl mx-auto">
            <div class="text-sm font-extrabold ${cur.hand > 0 ? 'text-amber-700' : 'text-slate-500'} mb-1">
                ${cur.hand > 0 ? `✋ Du håller en kub – klicka eller släpp på en stapel för att lägga den!` : '👆 Dra en kub till en annan stapel – eller klicka för att ta den!'}
            </div>
            <div class="flex items-end justify-center gap-3 border-b-4 border-rose-300 pb-0">${barsHtml}</div>
            <div class="mt-2 font-display font-bold text-lg ${allEqual ? 'text-emerald-700' : 'text-rose-900'}">
                ${allEqual ? `Alla staplar är ${cur.bars[0]} – BALANS! ✓` : `Staplarna: ${cur.bars.join(' • ')}`}
            </div>
        </div>`;
    attachLevelDrag();
}

// Dra-och-släpp: håll på en stapel och dra till en annan → överför översta kuben.
function attachLevelDrag() {
    document.querySelectorAll('.avg-level-stack').forEach((el, i) => {
        el.addEventListener('pointerdown', (e) => levelDragStart(e, i));
    });
}

function levelDragStart(e, srcIdx) {
    const cur = state.currentAvg;
    if (!cur || cur.mode !== 'level' || !document.getElementById('avg-next-wrap').classList.contains('hidden')) return;
    if (cur.hand === 0 && cur.bars[srcIdx] <= 0) return;
    const startX = e.clientX, startY = e.clientY;
    let ghost = null, dragged = false;
    const onMove = (ev) => {
        if (!dragged && Math.hypot(ev.clientX - startX, ev.clientY - startY) > 8) {
            dragged = true;
            ghost = document.createElement('div');
            ghost.className = 'w-9 h-5 rounded bg-rose-500 border-2 border-rose-700 fixed z-50 pointer-events-none shadow-lg';
            document.body.appendChild(ghost);
            playSound('click');
        }
        if (ghost) { ghost.style.left = (ev.clientX - 18) + 'px'; ghost.style.top = (ev.clientY - 10) + 'px'; }
    };
    const onUp = (ev) => {
        document.removeEventListener('pointermove', onMove);
        if (!ghost) return;
        ghost.remove();
        cur.justDragged = true;
        setTimeout(() => cur.justDragged = false, 0);
        let dst = -1;
        document.querySelectorAll('.avg-level-stack').forEach((el, i) => {
            const r = el.getBoundingClientRect();
            if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) dst = i;
        });
        if (dst < 0) return;
        if (cur.hand > 0) { cur.hand = 0; cur.bars[dst]++; }
        else if (dst !== srcIdx) { cur.bars[srcIdx]--; cur.bars[dst]++; }
        else return;
        renderAvgLevel();
        checkLevelWin();
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp, { once: true });
    document.addEventListener('pointercancel', onUp, { once: true });
}

function checkLevelWin() {
    const cur = state.currentAvg;
    if (cur.hand === 0 && cur.bars.every(b => b === cur.bars[0])) {
        addReward(2);
        showFeedback('avg-feedback', true, `🎉 Alla staplar är ${cur.bars[0]}! Medelvärdet är ${formatNumSv(cur.answer)} – du jämnade ut det själv!`);
        document.getElementById('avg-next-wrap').classList.remove('hidden');
    }
}

export function avgLevelClick(i) {
    const cur = state.currentAvg;
    if (!cur || cur.mode !== 'level' || cur.justDragged || !document.getElementById('avg-next-wrap').classList.contains('hidden')) return;
    playSound('click');
    if (cur.hand === 0) {
        if (cur.bars[i] <= 0) return;
        cur.bars[i]--; cur.hand = 1;
    } else {
        cur.bars[i]++; cur.hand = 0;
    }
    renderAvgLevel();
    checkLevelWin();
}

// Sorterbara talkort för Median & Typvärde: dra korten i storleksordning.
function renderAvgSortCards() {
    const cur = state.currentAvg;
    const n = cur.order.length;
    const sorted = cur.order.every((v, i) => i === 0 || cur.order[i - 1] <= v) ||
                   cur.order.every((v, i) => i === 0 || cur.order[i - 1] >= v);
    const mid = Math.floor(n / 2);
    const mids = n % 2 === 1 ? [mid] : [mid - 1, mid];

    // Typvärde: när korten är sorterade bildar likadana tal färgade klumpar.
    const tintMap = {};
    if (cur.mode === 'mode' && sorted) {
        const colors = ['bg-sky-100', 'bg-amber-100', 'bg-emerald-100', 'bg-violet-100', 'bg-orange-100'];
        [...new Set(cur.order)].forEach((v, i) => tintMap[v] = colors[i % colors.length]);
    }
    const freqMap = {};
    cur.nums.forEach(x => freqMap[x] = (freqMap[x] || 0) + 1);
    const modeVal = cur.mode === 'mode' ? cur.answer : null;

    const cards = cur.order.map((v, i) => {
        const isMid = sorted && cur.mode === 'median' && mids.includes(i);
        const isMode = sorted && cur.mode === 'mode' && v === modeVal;
        const tint = tintMap[v] || 'bg-amber-50';
        return `<div data-i="${i}" class="avg-sort-card cursor-grab active:cursor-grabbing select-none ${isMid ? 'bg-emerald-500 border-emerald-700 text-white scale-110' : isMode ? 'bg-violet-500 border-violet-700 text-white' : `${tint} border-amber-300 text-slate-900`} border-3 rounded-2xl w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center font-display font-bold text-2xl sm:text-3xl shadow-2xs relative">
            ${formatNumSv(v)}
            ${isMid ? '<div class="absolute -top-3 text-sm">🎯</div>' : ''}
            ${isMode ? '<div class="absolute -top-3 text-sm">👑</div>' : ''}
        </div>`;
    }).join('');

    let note = '✋ Dra korten så de hamnar i storleksordning!';
    if (sorted && cur.mode === 'median') {
        note = mids.length === 1
            ? `✨ Sorterat! 🎯 Mitttalet lyser – det är <strong>medianen</strong>!`
            : `✨ Sorterat! 🎯 Två tal i mitten – medianen är <strong>(${formatNumSv(cur.order[mids[0]])} + ${formatNumSv(cur.order[mids[1]])}) ÷ 2</strong>!`;
    } else if (sorted && cur.mode === 'mode') {
        note = `✨ Sorterat! 👑 Klumpen med flest likadana – <strong>typvärdet ${modeVal}</strong> finns ${freqMap[modeVal]} gånger!`;
    }

    document.getElementById('avg-visual-container').innerHTML = `
        <div class="w-full mx-auto">
            <div class="flex flex-wrap items-center justify-center gap-2 mb-2" id="avg-sort-row">${cards}</div>
            <div class="text-sm font-extrabold ${sorted ? 'text-emerald-700' : 'text-slate-500'}">${note}</div>
        </div>`;
    attachSortDrag();
}

function attachSortDrag() {
    const row = document.getElementById('avg-sort-row');
    if (!row) return;
    [...row.children].forEach((card) => {
        card.style.touchAction = 'none';
        card.addEventListener('pointerdown', (e) => {
            if (!document.getElementById('avg-next-wrap').classList.contains('hidden')) return;
            e.preventDefault();
            try { card.setPointerCapture(e.pointerId); } catch (_) { /* syntetiska/kantfall */ }
            const startX = e.clientX;
            const from = Number(card.dataset.i);
            card.classList.add('avg-dragging');
            const onMove = (ev) => {
                card.style.transform = `translateX(${ev.clientX - startX}px) scale(1.08) rotate(-2deg)`;
            };
            const onUp = (ev) => {
                card.removeEventListener('pointermove', onMove);
                card.classList.remove('avg-dragging');
                const cur = state.currentAvg;
                if (!cur || cur.mode === 'level') return;
                const rects = [...row.children].map(c => c.getBoundingClientRect());
                let to = rects.findIndex(r => ev.clientX < r.left + r.width / 2);
                if (to === -1) to = rects.length - 1;
                if (to !== from) {
                    const [v] = cur.order.splice(from, 1);
                    cur.order.splice(to, 0, v);
                    playSound('click');
                }
                renderAvgSortCards();
            };
            card.addEventListener('pointermove', onMove);
            card.addEventListener('pointerup', onUp, { once: true });
            card.addEventListener('pointercancel', onUp, { once: true });
        });
    });
}

// "Visa mig": medelvärde = jämna ut staplarna.
export function buildAvgDemoSteps() {
    const nums = [4, 8, 6], labels = ['Ali', 'Bo', 'Cy'], mean = 6;
    const towers = (ns) => `<div class="flex items-end justify-center gap-5 my-3">` + ns.map((v, i) =>
        `<div class="flex flex-col items-center gap-1.5">
            <div class="flex flex-col-reverse gap-0.5">${Array.from({ length: v }, () => '<div class="w-9 h-4 rounded-md bg-rose-400 border border-rose-200"></div>').join('')}</div>
            <span class="text-xs font-extrabold text-slate-600">${labels[i]} (${v})</span>
        </div>`).join('') + `</div>`;
    const svg = `<div class="flex justify-center">${renderMeanLevelingSVG(nums, labels, mean)}</div>`;
    return { steps: [
        { text: `<p>Tre kompisar plockade klossar – ojämnt fördelat! <strong>Medelvärdet</strong> svarar på: <em>hur många skulle var och en ha om alla hade lika?</em></p>`,
          html: towers(nums) },
        { text: `<p><strong>Steg 1:</strong> Lägg ihop ALLT först: <strong>${nums.join(' + ')} = ${nums.reduce((a, b) => a + b)}</strong> klossar totalt.</p>`,
          html: towers(nums) },
        { text: `<p><strong>Steg 2:</strong> Dela lika på ${nums.length} personer: <strong>${nums.reduce((a, b) => a + b)} ÷ ${nums.length} = ${mean}</strong>. Den gröna streckade linjen visar den utjämnade nivån!</p>`,
          html: svg },
        { text: `<p>Dela alltid med <strong>antalet tal</strong> – här ${nums.length}, inte 2! Och blanda inte ihop med <strong>medianen</strong>: det är mitt-talet när talen står i storleksordning.</p>`,
          warn: true,
          html: svg },
        { text: `<p><strong>Din tur!</strong> Vilket är medelvärdet av <strong>3, 5, 7</strong>? (Lägg ihop, dela med 3!)</p>`,
          guess: { options: [
              { label: '4', ok: false },
              { label: '5', ok: true },
              { label: '6', ok: false },
          ] },
          doneText: `3 + 5 + 7 = 15, och 15 ÷ 3 = <strong>5</strong>! 🎉` },
    ] };
}
