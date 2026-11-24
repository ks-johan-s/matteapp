// js/modules/mult.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { randInt, showFeedback, shuffleArray } from '../utils.js';
import { divStackHTML } from '../visuals.js';

/* =============================================================
   5. MODUL 2: GÅNGERTABELLEN
============================================================== */
export function setSelectedTable(val) {
    playSound('click');
    state.selectedTable = val;
    generateMultQuestion();
}

export function setMultMissing(on) {
    playSound('click');
    state.multMissing = !!on;
    const btn = document.getElementById('mult-missing-btn');
    if (btn) btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
        (state.multMissing ? 'bg-orange-600 text-white' : 'bg-white border border-orange-200 text-slate-700');
    generateMultQuestion();
}

export function generateMultQuestion() {
    document.getElementById('mult-feedback').classList.add('hidden');
    document.getElementById('mult-next-wrap').classList.add('hidden');

    const isHard = state.difficulty === 'hard';
    const t = state.selectedTable === 'all'
        ? (isHard ? [6, 7, 8, 9, 11, 12][randInt(0, 5)] : randInt(2, 10))
        : parseInt(state.selectedTable, 10);
    const minFactor = isHard ? 4 : 1;
    const maxFactor = state.difficulty === 'easy' ? 6 : (isHard ? 12 : 10);
    const f = randInt(minFactor, maxFactor);
    const total = t * f;

    // Saknat faktor-läge: "? × 4 = 12" eller "3 × ? = 12" – array-modellen
    // visar hela rutnätet, eleven räknar antalet i den dolda riktningen.
    const missing = !!state.multMissing;
    const hideF = Math.random() < 0.5;
    const answer = missing ? (hideF ? f : t) : total;
    state.currentMult = { t, f, answer, total, missing };
    document.getElementById('mult-question-text').textContent = missing
        ? (hideF ? `${t} × ? = ${total}` : `? × ${f} = ${total}`)
        : `${t} × ${f} = ?`;

    const dotCls = (t > 9 || f > 9) ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5';
    const rows = Array.from({ length: t }, (_, r) => `
        <div class="pile-pop flex gap-1.5" style="animation-delay:${r * 80}ms">
            ${Array.from({ length: f }, () => `<span class="${dotCls} rounded-full ${r % 2 === 0 ? 'bg-orange-400' : 'bg-orange-600'}"></span>`).join('')}
        </div>`).join('');
    document.getElementById('mult-visual-groups').innerHTML = `
        <div class="flex items-center gap-3 bg-orange-50 border-2 border-orange-200 rounded-3xl p-4">
            <div class="flex flex-col items-center font-display font-bold ${missing && !hideF ? 'text-orange-500' : 'text-orange-800'}">
                <span class="text-xl">${missing && !hideF ? '?' : t}</span>
                <span class="text-[10px] font-extrabold uppercase">rader ↕</span>
            </div>
            <div class="flex flex-col gap-1.5">
                <div class="flex flex-col gap-1.5">${rows}</div>
                <div class="flex flex-col items-center font-display font-bold ${missing && hideF ? 'text-orange-500' : 'text-orange-800'} mt-0.5">
                    <span class="text-[10px] font-extrabold uppercase">${missing && hideF ? '?' : f} i varje rad ↔</span>
                </div>
            </div>
        </div>`;

    const jumps = Array.from({ length: t }, (_, i) => (i + 1) * f);
    setHintSteps('mult', missing ? (hideF
        ? [`<p><strong>${t} × ? = ${total}</strong> frågar: "hur många i varje rad om det är ${t} rader och ${total} prickar totalt?"</p>`,
           `<p>Räkna prickarna i en rad – det är <strong>${f}</strong>. Alltså ${t} × <strong>${f}</strong> = ${total}!</p>`]
        : [`<p><strong>? × ${f} = ${total}</strong> frågar: "hur många rader om ${f} prickar i varje rad blir ${total} totalt?"</p>`,
           `<p>Räkna raderna i rutan – det är <strong>${t}</strong>. Alltså <strong>${t}</strong> × ${f} = ${total}! (Samma sak som ${divStackHTML(total, f)}.)</p>`])
    : [
        `<p><strong>${t} × ${f}</strong> betyder <strong>${t} rader</strong> med <strong>${f}</strong> prickar i varje – som ett rutenät (${Array(t).fill(f).join(' + ')}).</p>`,
        `<p>Räkna i <strong>${f}-skutt</strong> ${t} gånger:</p>
         <div class="my-2 flex flex-wrap items-center justify-center gap-1.5 font-display font-bold text-sm">
            ${jumps.map((v, idx) => `<span class="px-2.5 py-1 rounded-xl ${idx === jumps.length - 1 ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-950'}">${v}</span>`).join('<span class="text-orange-500">➔</span>')}
         </div>`
    ]);

    const optsEl = document.getElementById('mult-options');
    const typeEl = document.getElementById('mult-type-wrap');
    if (state.inputModes.mult === 'choice') {
        optsEl.classList.remove('hidden');
        typeEl.classList.add('hidden');
        const set = new Set([answer]);
        while (set.size < 4) {
            const cand = answer + [-f, f, -t, t, 2, -2, 5][randInt(0, 6)];
            if (cand > 0) set.add(cand);
        }
        optsEl.innerHTML = shuffleArray([...set]).map(v => `
            <button onclick="checkMultChoice(${v})" class="btn-3d bg-white hover:bg-orange-50 border-3 border-orange-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
                ${v}
            </button>
        `).join('');
    } else {
        optsEl.classList.add('hidden');
        typeEl.classList.remove('hidden');
        const inp = document.getElementById('mult-type-input');
        inp.value = '';
        inp.focus();
    }
}

export function checkMultChoice(val) {
    if (!document.getElementById('mult-next-wrap').classList.contains('hidden')) return;
    const { t, f, answer, total, missing } = state.currentMult;
    if (val === answer) {
        addReward(1);
        showFeedback('mult-feedback', true, missing
            ? `🎉 Grymt! ${t} × ${f} = ${total} – den saknade faktorn var ${answer}! 💡 Kolla: ${divStackHTML(total, f)} = ${t}.`
            : `🎉 Grymt! ${t} × ${f} = ${answer}! ${t <= 6 ? `💡 Tänk: ${Array(t).fill(f).join(' + ')} = ${total}.` : `💡 Matteord: ${t} och ${f} är <strong>faktorer</strong>, ${total} är <strong>produkten</strong>!`}`);
        document.getElementById('mult-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('mult-feedback', false, `🤔 Inte riktigt ${val} – räkna grupp för grupp eller kika i 📊 Tabellen!`);
    }
}

export function checkMultTyped() {
    const val = parseInt(document.getElementById('mult-type-input').value, 10);
    if (isNaN(val)) return;
    checkMultChoice(val);
}

// "Visa mig": rader med prickar byggs upp en i taget – multiplikation
// som upprepad addition blir synlig.
export function buildMultDemoSteps() {
    const t = 3, f = 4;
    const grid = (rows, popLast) => `
        <div class="inline-flex items-center gap-4 bg-orange-50 border-2 border-orange-200 rounded-3xl p-4">
            <div class="flex flex-col items-center font-display font-bold text-orange-800">
                <span class="text-2xl">${rows}</span>
                <span class="text-[10px] font-extrabold uppercase">rader ↕</span>
            </div>
            <div class="flex flex-col gap-2">
                ${Array.from({ length: rows }, (_, r) => `
                    <div class="${popLast && r === rows - 1 ? 'pile-pop demo-spot rounded-lg' : ''} flex gap-2 items-center">
                        ${Array.from({ length: f }, () => '<span class="w-4 h-4 rounded-full bg-orange-500"></span>').join('')}
                        ${popLast && r === rows - 1 ? `<span class="demo-tag" style="background:#ffedd5;color:#c2410c;animation-delay:0.35s">+${f}</span>` : ''}
                    </div>`).join('')}
            </div>
            <div class="flex flex-col items-center font-display font-bold text-orange-800">
                <span class="text-2xl">${f}</span>
                <span class="text-[10px] font-extrabold uppercase">i varje →</span>
            </div>
        </div>`;
    const steps = [
        { text: `<p><strong>${t} × ${f}</strong> betyder <strong>${t} grupper med ${f} i varje</strong>. Multiplikation är ett genvägsknep – upprepad addition!</p>`,
          html: `<div class="font-display font-bold text-4xl text-orange-600 demo-pop">${t} × ${f} = ?</div>` },
        { text: `<p>Första raden: <strong>${f} prickar</strong>.</p>`,
          html: `${grid(1, true)}<div class="demo-pop font-display font-bold text-2xl text-orange-700 mt-2">${f}</div>` },
        { text: `<p>Andra raden till: <strong>${f} + ${f} = ${2 * f}</strong>.</p>`,
          html: `${grid(2, true)}<div class="demo-pop font-display font-bold text-2xl text-orange-700 mt-2">${f} + ${f} = ${2 * f}</div>` },
        { text: `<p>Och den tredje: <strong>${2 * f} + ${f} = ${t * f}</strong>.</p>`,
          html: `${grid(3, true)}<div class="demo-pop font-display font-bold text-2xl text-orange-700 mt-2">${2 * f} + ${f} = ${t * f}</div>` },
        { text: `<p>Många råkar plussa ihop i stället: ${t} + ${f} = ${t + f} – <strong>men × betyder grupper</strong>, inte addition av talen!</p>`,
          warn: true,
          html: `<div class="flex items-center justify-center gap-8 font-display font-bold text-3xl">
              <span class="text-emerald-600">${t} × ${f} = ${t * f} ✓</span>
              <span class="text-red-400 line-through opacity-70">${t} + ${f} = ${t + f} ✗</span>
          </div>` },
        { text: `<p><strong>Din tur!</strong> Vad är ${t} × ${f}?</p>`,
          html: grid(3, false),
          guess: { options: [
              { label: `${t + f}`, ok: false },
              { label: `${t * f}`, ok: true },
              { label: `${t * f - 1}`, ok: false },
          ] },
          doneText: `${t} × ${f} = ${t * f} – samma som ${f} + ${f} + ${f}! 🎉` },
    ];
    return { steps };
}
