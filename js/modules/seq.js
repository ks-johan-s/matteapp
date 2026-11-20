// js/modules/seq.js — MODUL: MÖNSTER & TALFÖLJDER
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { randInt, showFeedback, shuffleArray } from '../utils.js';

const SEQ_PATTERNS = [
    ['🔵', '🔴'], ['🌟', '🌙'], ['🍏', '🍎'], ['🐶', '🐱'],
    ['🔺', '🔵', '🟡'], ['🟩', '🟨', '🟥'], ['🌸', '🌼', '🌻'],
    ['⚽', '🏀', '🏀'], ['🐸', '🐸', '🦋']
];

export function setSeqSubMode(mode) {
    playSound('click');
    state.seqSubMode = mode;
    ['mix', 'numbers', 'shapes', 'grow'].forEach(m => {
        const btn = document.getElementById(`seq-sub-${m}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (m === mode ? 'bg-purple-600 text-white' : 'bg-white border border-purple-200 text-slate-700');
    });
    generateSeqQuestion();
}

function dotsRow(count, cls) {
    return `<span class="inline-flex flex-wrap gap-1 justify-center">${'●'.repeat(count).split('').map(() => `<span class="${cls}">●</span>`).join('')}</span>`;
}

export function generateSeqQuestion() {
    document.getElementById('seq-feedback').classList.add('hidden');
    document.getElementById('seq-next-wrap').classList.add('hidden');

    let mode = state.seqSubMode;
    if (mode === 'mix') mode = ['numbers', 'shapes', 'grow'][randInt(0, 2)];

    const diff = state.difficulty;
    const qEl = document.getElementById('seq-question-text');
    const badgeEl = document.getElementById('seq-mode-badge');
    const visEl = document.getElementById('seq-visual-container');
    const optsEl = document.getElementById('seq-options');
    const typeEl = document.getElementById('seq-type-wrap');
    let hints, answer;

    if (mode === 'numbers') {
        let seq, step, doubling = false, asc = true;
        if (diff === 'hard' && Math.random() < 0.4) {
            doubling = true;
            const start = randInt(1, 3);
            seq = [start, start * 2, start * 4, start * 8];
            answer = start * 16;
        } else {
            asc = diff === 'easy' ? true : Math.random() < 0.6;
            step = diff === 'easy' ? randInt(1, 5) : (diff === 'medium' ? randInt(2, 10) : randInt(3, 15));
            const start = asc ? randInt(1, 15) : randInt(diff === 'medium' ? 40 : 60, 100);
            seq = Array.from({ length: 4 }, (_, i) => asc ? start + i * step : start - i * step);
            answer = asc ? start + 4 * step : start - 4 * step;
        }
        state.currentSeq = { mode, seq, step, doubling, asc, answer };

        badgeEl.textContent = '🔢 Talföljd';
        qEl.innerHTML = `Vilket tal kommer <strong>härnäst</strong> i talföljden?`;
        visEl.innerHTML = seq.map(n => `
            <span class="pile-pop px-3.5 py-2 rounded-2xl bg-purple-50 border-2 border-purple-300 font-display font-bold text-xl sm:text-2xl text-slate-900">${n}</span>
        `).join('<span class="text-purple-400 font-bold self-center">→</span>') +
        `<span class="text-purple-400 font-bold self-center">→</span>
         <span class="px-3.5 py-2 rounded-2xl bg-purple-600 border-2 border-purple-700 font-display font-bold text-xl sm:text-2xl text-white animate-pulse">?</span>`;

        const up = seq[1] > seq[0];
        const stepArrow = (lbl) => `<span class="inline-flex flex-col items-center mx-0.5"><span class="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-1.5 rounded-md border border-purple-300">${lbl}</span><span class="text-purple-400 font-bold text-sm leading-none">▼</span></span>`;
        const numChip = (n, highlight) => `<span class="px-2.5 py-1 rounded-xl border-2 font-display font-bold text-base ${highlight ? 'bg-purple-600 border-purple-800 text-white' : 'bg-purple-50 border-purple-300 text-slate-900'}">${n}</span>`;
        const seqVisual = (withAnswer) => `<div class="my-1.5 flex flex-wrap items-center justify-center gap-y-1">` +
            seq.map((n, i) => numChip(n) + (i < seq.length - 1 ? stepArrow(doubling ? '×2' : `${up ? '+' : '−'}${step}`) : '')).join('') +
            stepArrow(doubling ? '×2' : `${up ? '+' : '−'}${step}`) +
            (withAnswer ? numChip(answer, true) : `<span class="px-2.5 py-1 rounded-xl bg-white border-2 border-dashed border-purple-400 font-display font-bold text-base text-purple-600">?</span>`) + `</div>`;
        hints = doubling
            ? [`<p>Titta på vad som händer mellan talen: ${seq[1]} ÷ ${seq[0]} = <strong>2</strong>. Varje tal är <strong>dubbelt</strong> så stort!</p>` + seqVisual(false),
               `<p>${seq[3]} × 2 = <strong>${answer}</strong>!</p>` + seqVisual(true)]
            : [`<p>Räkna <strong>skillnaden</strong> mellan två tal i rad: ${up ? `${seq[1]} − ${seq[0]}` : `${seq[0]} − ${seq[1]}`} = <strong>${step}</strong>. Samma steg varje gång, men <strong>${up ? 'uppåt' : 'neråt'}</strong>!</p>` + seqVisual(false),
               `<p>Nästa tal blir ${seq[3]} ${up ? '+' : '−'} ${step} = <strong>${answer}</strong>!</p>` + seqVisual(true)];
    } else if (mode === 'shapes') {
        const pattern = SEQ_PATTERNS[randInt(0, SEQ_PATTERNS.length - 1)];
        const reps = diff === 'hard' ? 2 : 3;
        const shown = [];
        for (let r = 0; r < reps; r++) shown.push(...pattern);
        const answerIdx = shown.length % pattern.length;
        answer = pattern[answerIdx];
        state.currentSeq = { mode, pattern, answer };

        badgeEl.textContent = '🎨 Formmönster';
        qEl.innerHTML = `Vilken symbol kommer <strong>härnäst</strong> i mönstret?`;
        visEl.innerHTML = shown.map((s, i) => `
            <span class="pile-pop text-2xl sm:text-3xl" style="animation-delay:${i * 90}ms">${s}</span>
        `).join('') + `<span class="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-purple-600 border-2 border-purple-700 text-white font-display font-bold text-xl animate-pulse ml-1">?</span>`;

        const patternVisual = `<div class="my-1.5 flex flex-wrap items-center justify-center gap-1.5">` +
            pattern.map(s => `<span class="px-2 py-1 rounded-xl bg-purple-50 border-2 border-purple-300 text-xl">${s}</span>`).join('') +
            `<span class="text-purple-500 font-extrabold text-xs px-1">⟲ upprepas</span></div>`;
        hints = [
            `<p>Hitta <strong>upprepningen</strong>: mönstret är ${pattern.join(' ')} som börjar om gång på gång.</p>` + patternVisual,
            `<p>Efter ${shown[shown.length - 1]} börjar mönstret om – nästa symbol är <strong>${answer}</strong>!</p>` +
            `<div class="my-1.5 text-center"><span class="inline-block px-3 py-1.5 rounded-2xl bg-purple-600 border-2 border-purple-800 text-3xl">${answer}</span></div>`
        ];

        const opts = [...new Set(pattern)];
        while (opts.length < 3) {
            const extra = SEQ_PATTERNS[randInt(0, SEQ_PATTERNS.length - 1)][0];
            if (!opts.includes(extra)) opts.push(extra);
        }
        state.currentSeq.options = shuffleArray(opts);
    } else {
        const stairs = diff !== 'easy' && Math.random() < 0.45;
        let figs;
        if (stairs) {
            figs = [1, 3, 6];
            answer = 10;
        } else {
            const step = diff === 'easy' ? 2 : randInt(2, 4);
            const base = randInt(1, 3);
            figs = [base + step, base + 2 * step, base + 3 * step];
            answer = base + 4 * step;
        }
        state.currentSeq = { mode, figs, stairs, answer };

        badgeEl.textContent = '📈 Växande figur';
        qEl.innerHTML = stairs
            ? `Figuren får <strong>en rad till</strong> varje gång.<br>Hur många prickar har <strong>figur 4</strong>?`
            : `Figuren växer lika mycket varje gång.<br>Hur många prickar har <strong>figur 4</strong>?`;
        visEl.innerHTML = figs.map((count, i) => {
            let dots = '';
            if (stairs) {
                for (let r = 1; r <= i + 1; r++) dots += `<div class="leading-none text-purple-500 text-sm tracking-[0.15em]">${'●'.repeat(r)}</div>`;
            } else {
                dots = `<div class="text-purple-500 text-lg tracking-[0.1em] max-w-[140px] leading-snug">${'●'.repeat(count)}</div>`;
            }
            return `<div class="pile-pop flex flex-col items-center gap-1 px-3 py-2 rounded-2xl bg-white border-2 border-purple-200" style="animation-delay:${i * 150}ms">
                ${dots}
                <span class="text-[11px] font-extrabold text-purple-900">Figur ${i + 1}</span>
            </div>`;
        }).join('') + `<div class="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl bg-purple-600 border-2 border-purple-700">
            <span class="text-white font-display font-bold text-2xl">?</span>
            <span class="text-[11px] font-extrabold text-purple-100">Figur 4</span>
        </div>`;

        hints = stairs
            ? [`<p>Räkna prickarna: <strong>1, 3, 6</strong>. Ökningen växer: +2, +3 … nästa är +4!</p>`,
               `<p>Figur 4 får en rad till med 4 prickar: 6 + 4 = <strong>10</strong>!</p>
                <div class="my-1.5 flex flex-col items-center leading-none text-sm tracking-[0.15em]">
                    <div class="text-purple-500">${'●'.repeat(1)}</div>
                    <div class="text-purple-500">${'●'.repeat(2)}</div>
                    <div class="text-purple-500">${'●'.repeat(3)}</div>
                    <div class="text-emerald-600 font-bold">${'●'.repeat(4)} <span class="text-[10px] font-extrabold">+4 nya!</span></div>
                </div>`]
            : [`<p>Räkna prickarna i varje figur: <strong>${figs.join(', ')}</strong>.</p>`,
               `<p>Ökningen är <strong>+${figs[1] - figs[0]}</strong> prickar varje gång: ${figs[2]} + ${figs[1] - figs[0]} = <strong>${answer}</strong>!</p>
                <div class="my-1.5 text-center text-sm tracking-[0.1em] leading-snug max-w-xs mx-auto">
                    <span class="text-purple-500">${'●'.repeat(figs[2])}</span><span class="text-emerald-600 font-bold">${'●'.repeat(figs[1] - figs[0])}</span>
                    <div class="text-[10px] font-extrabold text-slate-500 mt-0.5">${figs[2]} gamla + ${figs[1] - figs[0]} nya = ${answer}</div>
                </div>`];
    }

    setHintSteps('seq', hints);

    if (mode === 'shapes') {
        optsEl.classList.remove('hidden');
        typeEl.classList.add('hidden');
        optsEl.innerHTML = state.currentSeq.options.map((s, idx) => `
            <button onclick="checkSeqShape(${idx})" class="btn-3d bg-white hover:bg-purple-50 border-3 border-purple-300 rounded-2xl py-4 text-4xl">
                ${s}
            </button>
        `).join('');
    } else if (state.inputModes.seq === 'choice') {
        optsEl.classList.remove('hidden');
        typeEl.classList.add('hidden');
        const set = new Set([answer]);
        while (set.size < 4) {
            const cand = answer + [-3, -2, -1, 1, 2, 3, 5][randInt(0, 6)];
            if (cand > 0) set.add(cand);
        }
        optsEl.innerHTML = shuffleArray([...set]).map(v => `
            <button onclick="checkSeqChoice(${v})" class="btn-3d bg-white hover:bg-purple-50 border-3 border-purple-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
                ${v}
            </button>
        `).join('');
    } else {
        optsEl.classList.add('hidden');
        typeEl.classList.remove('hidden');
        const inp = document.getElementById('seq-type-input');
        inp.value = '';
        inp.focus();
    }
}

export function checkSeqChoice(val) {
    if (!document.getElementById('seq-next-wrap').classList.contains('hidden')) return;
    const { answer, mode, step, doubling, asc, figs } = state.currentSeq;
    if (val === answer) {
        addReward(1);
        const nudge = mode === 'numbers'
            ? (doubling ? '💡 Varje tal var dubbelt så stort som det förra!' : `💡 Regeln var ${asc ? '+' : '−'}${step} mellan varje tal!`)
            : (mode === 'grow' && figs && figs.length > 1 ? `💡 Varje ny figur fick ${figs[1] - figs[0]} prickar till!` : '');
        showFeedback('seq-feedback', true, `🎉 Rätt – du hittade mönstret! ${nudge}`);
        document.getElementById('seq-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('seq-feedback', false, '🤔 Jämför hur mycket det ändras mellan varje steg – kika på "💡 Visa hur man tänker"!');
    }
}

export function checkSeqShape(idx) {
    if (!document.getElementById('seq-next-wrap').classList.contains('hidden')) return;
    const picked = state.currentSeq.options[idx];
    if (picked === state.currentSeq.answer) {
        addReward(1);
        showFeedback('seq-feedback', true, `🎉 Rätt – mönstret fortsätter med ${picked}! 💡 Det upprepas: ${state.currentSeq.pattern.join(' ')}.`);
        document.getElementById('seq-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('seq-feedback', false, '🤔 Titta på vilka symboler som upprepas – vad kommer efter den sista?');
    }
}

export function checkSeqTyped() {
    const val = parseInt(document.getElementById('seq-type-input').value, 10);
    if (isNaN(val)) return;
    checkSeqChoice(val);
}
