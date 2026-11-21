// js/modules/algo.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { handleSheetInput, handleSheetKeyDown } from '../sheets.js';
import { randInt, showFeedback, shuffleArray } from '../utils.js';

/* =============================================================
   6. MODUL 3: UPPSTÄLLNING (MED SPECIFICERAD AHA-FEEDBACK)
============================================================== */
// Miniatyr-uppställning i ledtråden: visar konkret vad steget gör.
// highlight = kolumn att markera (bärnstensram), struck = överstrukna
// siffror, carries = {kolumn: '10'/'1'}, showAns = antal ifyllda svartal från höger.
// Nivåkontroller för trappan: 'plain' = utan växling/minne/rest,
// 'carry' = garanterat med. Hjälpfunktionerna simulerar metoden.
function addNeedsCarry(a, b) {
    let c = 0;
    while (a > 0 || b > 0) {
        const s = (a % 10) + (b % 10) + c;
        if (s >= 10) return true;
        c = s >= 10 ? 1 : 0;
        a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return false;
}
function subNeedsLoan(a, b) {
    while (a > 0 || b > 0) {
        if (a % 10 < b % 10) return true;
        a = Math.floor(a / 10); b = Math.floor(b / 10);
    }
    return false;
}
function mulNeedsCarry(a, b) {
    let rem = 0;
    for (const ch of String(a).split('').reverse()) {
        const p = (+ch) * b + rem;
        if (p >= 10) return true;
        rem = Math.floor(p / 10);
    }
    return false;
}
function divHasRest(a, b) {
    let rem = 0;
    for (const ch of String(a)) {
        rem = (rem * 10 + (+ch)) % b;
        if (rem > 0) return true;
    }
    return false;
}

const PV_NAMES = { 1: 'ental', 10: 'tiotal', 100: 'hundratal', 1000: 'tusental' };

function algoMiniGrid(a, b, op, answer, { highlight = -1, struck = [], carries = {}, showAns = 0,
    freshStruck = [], freshCarry = [], popAns = false, big = false, glowBlank = false } = {}) {
    const digits = Math.max(String(a).length, String(b).length, String(answer).length);
    const aStr = String(a).padStart(digits, ' ');
    const bStr = String(b).padStart(digits, ' ');
    const ansStr = String(answer).padStart(digits, ' ');
    const cols = digits + 1;
    const opSym = op === 'sub' ? '−' : (op === 'add' ? '+' : '×');
    const place = c => Math.pow(10, cols - 1 - c);
    const cell = (content, cls = '') => `<div class="math-grid-cell ${cls}">${content}</div>`;
    const carryCls = c => `math-grid-carry${freshCarry.includes(c) ? ' carry-pop cell-soft-glow' : ''}`;

    let h = `<div class="math-grid-paper math-grid-mini${big ? ' math-grid-big' : ''} mx-auto my-1.5" style="grid-template-columns: repeat(${cols}, ${big ? 62 : 34}px);">`;
    if (op !== 'mul') for (let c = 0; c < cols; c++) h += cell(carries[c] || '', carryCls(c));
    for (let c = 0; c < cols; c++) {
        const cls = [c > 0 ? `pv-col-${place(c)}` : '', struck.includes(c) ? 'digit-struck' : '',
            freshStruck.includes(c) ? 'demo-struck' : '',
            freshStruck.includes(c) && c !== highlight ? 'cell-soft-glow' : '',
            c === highlight ? 'cell-hl' : ''].join(' ');
        const colTag = big && c === highlight && PV_NAMES[place(c)]
            ? `<span class="demo-col-tag">▾ ${PV_NAMES[place(c)]}</span>` : '';
        h += cell(colTag + (c > 0 ? `<span class="pv-num pv-${place(c)}">${aStr[c - 1]}</span>` : ''), cls);
    }
    for (let c = 0; c < cols; c++) {
        const content = c === 0 ? `<span class="text-sky-600">${opSym}</span>` : `<span class="pv-num pv-${place(c)}">${bStr[c - 1]}</span>`;
        h += cell(content, `${c > 0 ? `pv-col-${place(c)}` : ''}`);
    }
    h += `<div style="grid-column: 1 / -1; height: 3px; margin: -4px 1px 0;">
        <div style="height: 3px; background: #0f172a; border-radius: 2px;"></div>
    </div>`;
    for (let c = 0; c < cols; c++) {
        const d = c === 0 ? '' : ansStr[c - 1];
        const shown = d.trim() !== '' && digits - c < showAns;
        const isNew = popAns && shown && digits - c === showAns - 1;
        const isBlank = glowBlank && c > 0 && !shown && digits - c === showAns;
        // Minnessiffran i multiplikation står litet till vänster i rutan
        // där den ska adderas – "vid sidan", som i svenska läromedel.
        const side = op === 'mul' && carries[c]
            ? `<span class="mul-carry-side${freshCarry.includes(c) ? ' carry-pop' : ''}">${carries[c]}</span>` : '';
        const soft = isNew || isBlank || (side && freshCarry.includes(c));
        h += cell(c === 0 ? '' : side + `<span class="pv-num pv-${place(c)}${isNew ? ' ans-pop' : ''}">${shown ? d : '<span class="text-slate-300">?</span>'}</span>`,
            `${c > 0 ? `pv-col-${place(c)}` : ''}${soft ? ' cell-soft-glow' : ''}`);
    }
    return h + '</div>';
}

// Trapp-miniatyr för kort division: minnessiffror över täljarsiffrorna,
// nämnare/=/svar centrerade på streckets höjd. showAns = antal synliga
// svarssiffror från VÄNSTER (division räknas från vänster!).
function algoMiniDivGrid(a, b, answer, { showAns = 0, carries = {}, hlDigit = -1,
    freshCarry = [], popAnsIdx = -1, big = false, glowBlank = false } = {}) {
    const aStr = String(a);
    const divLen = aStr.length;
    const ansStr = String(answer);
    const cols = divLen + 2 + ansStr.length;
    const span = (col) => `grid-row: 2 / span 3; grid-column: ${col}; height: auto;`;
    let h = `<div class="math-grid-paper math-grid-mini${big ? ' math-grid-big' : ''} mx-auto my-1.5" style="grid-template-columns: repeat(${cols}, ${big ? 62 : 34}px);">`;
    // Minnessifferrad över täljarsiffror 2..n (rutnätskolumn dIdx + 2).
    for (let c = 1; c <= cols; c++) {
        const dIdx = c - 2;
        const cv = (dIdx >= 1 && dIdx <= divLen - 1 && carries[dIdx]) || '';
        h += `<div class="math-grid-cell math-grid-carry${freshCarry.includes(dIdx) ? ' carry-pop cell-soft-glow' : ''}">${cv}</div>`;
    }
    h += `<div class="math-grid-cell text-sky-700 font-bold" style="${span(1)}">${b}</div>`;
    for (let i = 0; i < divLen; i++) {
        const place = Math.pow(10, divLen - 1 - i);
        const colTag = big && i === hlDigit && PV_NAMES[place]
            ? `<span class="demo-col-tag">▾ ${PV_NAMES[place]}</span>` : '';
        h += `<div class="math-grid-cell pv-col-${place}${i === hlDigit ? ' cell-hl' : ''}">${colTag}<span class="pv-num pv-${place}">${aStr[i]}</span></div>`;
    }
    h += `<div class="math-grid-cell text-slate-900 font-bold" style="${span(divLen + 2)}">=</div>`;
    for (let i = 0; i < ansStr.length; i++) {
        const shown = i < showAns;
        const isNew = i === popAnsIdx && shown;
        const isBlank = glowBlank && !shown && i === showAns;
        h += `<div class="math-grid-cell${isNew || isBlank ? ' cell-soft-glow' : ''}" style="${span(divLen + 3 + i)}">
            <span class="pv-num pv-1${isNew ? ' ans-pop' : ''}">${shown ? ansStr[i] : '<span class="text-slate-300">?</span>'}</span>
        </div>`;
    }
    h += `<div style="grid-row: 3; grid-column: 2 / ${divLen + 2}; display: flex; align-items: center; height: 4px; margin: -4px 2px;">
        <div style="width: 100%; height: 4px; background: #0f172a; border-radius: 2px;"></div>
    </div>`;
    for (let c = 0; c < divLen; c++) {
        h += `<div class="math-grid-cell" style="grid-row: 4; grid-column: ${c + 2};"></div>`;
    }
    return h + '</div>';
}

// Uppställning för tvåsiffrig multiplikator (svensk skolkonvention):
// multiplikand | × multiplikator | – | delresultat 1 (entalen, med
// minnessiffror litet till vänster i rutan) | + delresultat 2 (tiotalen,
// förskjutet ett steg åt vänster) | – | slutsumman.
// showP1/showP2/showAns = antal ifyllda siffror från höger per rad.
// Carries indexeras per rutnätskolumn och ritas vid sidan i var sin rad.
function algoMiniMul2Grid(a, b, { showP1 = 0, showP2 = 0, showAns = 0,
    p1Carries = {}, p2Carries = {}, ansCarries = {},
    hlRow = '', hlCol = -1, freshCarry = [],
    popP1 = false, popP2 = false, popAns = false,
    big = false, glowBlank = false } = {}) {
    const b0 = b % 10;
    const p1 = a * b0, p2 = a * ((b - b0) / 10), answer = a * b;
    const digits = Math.max(String(a).length, String(b).length, String(answer).length,
        String(p1).length, String(p2).length + 1);
    const aStr = String(a).padStart(digits, ' ');
    const bStr = String(b).padStart(digits, ' ');
    const p1D = String(p1), p2D = String(p2), ansD = String(answer);
    const cols = digits + 1;
    const place = c => Math.pow(10, cols - 1 - c);
    const cell = (content, cls = '') => `<div class="math-grid-cell ${cls}">${content}</div>`;
    const carryAt = (row, c) => {
        const map = row === 'p1' ? p1Carries : row === 'p2' ? p2Carries : ansCarries;
        if (!map[c]) return '';
        const fresh = freshCarry.some(f => f.row === row && f.col === c);
        return `<span class="mul-carry-side${fresh ? ' carry-pop' : ''}">${map[c]}</span>`;
    };
    const freshAt = (row, c) => freshCarry.some(f => f.row === row && f.col === c);
    const tagAt = (row, c) => big && row === hlRow && c === hlCol && PV_NAMES[place(c)]
        ? `<span class="demo-col-tag">▾ ${PV_NAMES[place(c)]}</span>` : '';
    const hl = (row, c) => (row === hlRow && c === hlCol ? ' cell-hl' : '');

    let h = `<div class="math-grid-paper math-grid-mini${big ? ' math-grid-mid' : ''} mx-auto my-1.5" style="grid-template-columns: repeat(${cols}, ${big ? 46 : 34}px);">`;
    for (let c = 0; c < cols; c++)
        h += cell(tagAt('a', c) + (c > 0 ? `<span class="pv-num pv-${place(c)}">${aStr[c - 1]}</span>` : ''),
            `${c > 0 ? `pv-col-${place(c)}` : ''}${hl('a', c)}`);
    for (let c = 0; c < cols; c++)
        h += cell(tagAt('b', c) + (c === 0 ? `<span class="text-sky-600">×</span>` : `<span class="pv-num pv-${place(c)}">${bStr[c - 1]}</span>`),
            `${c > 0 ? `pv-col-${place(c)}` : ''}${hl('b', c)}`);
    h += `<div style="grid-column: 1 / -1; height: 3px; margin: -4px 1px 0;">
        <div style="height: 3px; background: #0f172a; border-radius: 2px;"></div>
    </div>`;
    // Delresultat 1 (entalen av multiplikatorn) – skrivs från höger.
    for (let c = 0; c < cols; c++) {
        const pos = cols - 1 - c;
        const d = pos < p1D.length ? p1D[p1D.length - 1 - pos] : ' ';
        const shown = pos >= 0 && pos < p1D.length && pos < showP1;
        const isNew = popP1 && shown && pos === showP1 - 1;
        const side = c > 0 ? carryAt('p1', c) : '';
        const soft = isNew || freshAt('p1', c);
        h += cell(c === 0 ? '' : side + `<span class="pv-num pv-${place(c)}${isNew ? ' ans-pop' : ''}">${shown ? d : '<span class="text-slate-300">?</span>'}</span>`,
            `${c > 0 ? `pv-col-${place(c)}` : ''}${hl('p1', c)}${soft ? ' cell-soft-glow' : ''}`);
    }
    // Delresultat 2 (tiotalen) – förskjutet ett steg, + framför.
    for (let c = 0; c < cols; c++) {
        const pos = cols - 2 - c;
        const d = pos >= 0 && pos < p2D.length ? p2D[p2D.length - 1 - pos] : ' ';
        const shown = pos >= 0 && pos < p2D.length && pos < showP2;
        const isNew = popP2 && shown && pos === showP2 - 1;
        const side = c > 0 ? carryAt('p2', c) : '';
        const soft = isNew || freshAt('p2', c);
        h += cell(c === 0 ? `<span class="text-sky-600">+</span>` : side + `<span class="pv-num pv-${place(c)}${isNew ? ' ans-pop' : ''}">${shown ? d : '<span class="text-slate-300">?</span>'}</span>`,
            `${c > 0 ? `pv-col-${place(c)}` : ''}${hl('p2', c)}${soft ? ' cell-soft-glow' : ''}`);
    }
    h += `<div style="grid-column: 1 / -1; height: 3px; margin: -4px 1px 0;">
        <div style="height: 3px; background: #0f172a; border-radius: 2px;"></div>
    </div>`;
    for (let c = 0; c < cols; c++) {
        const pos = cols - 1 - c;
        const d = pos < ansD.length ? ansD[ansD.length - 1 - pos] : ' ';
        const shown = pos >= 0 && pos < ansD.length && pos < showAns;
        const isNew = popAns && shown && pos === showAns - 1;
        const isBlank = glowBlank && pos === showAns;
        const side = c > 0 ? carryAt('ans', c) : '';
        const soft = isNew || isBlank || freshAt('ans', c);
        h += cell(c === 0 ? '' : side + `<span class="pv-num pv-${place(c)}${isNew ? ' ans-pop' : ''}">${shown ? d : '<span class="text-slate-300">?</span>'}</span>`,
            `${c > 0 ? `pv-col-${place(c)}` : ''}${hl('ans', c)}${soft ? ' cell-soft-glow' : ''}`);
    }
    return h + '</div>';
}

export function setAlgoOp(op) {
    playSound('click');
    state.algoOp = op;
    ['sub', 'add', 'mul', 'div'].forEach(o => {
        const btn = document.getElementById(`algo-op-${o}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (o === op ? 'bg-sky-600 text-white' : 'bg-white border border-sky-200 text-slate-700');
    });
    generateAlgoQuestion();
}

export function setAlgoSheetMode(mode) {
    playSound('click');
    state.algoSheetMode = mode;
    document.getElementById('algo-sheet-guided').className = 'px-2.5 py-1 rounded-lg text-xs font-extrabold ' + (mode === 'guided' ? 'bg-sky-600 text-white' : 'text-slate-600');
    document.getElementById('algo-sheet-blank').className = 'px-2.5 py-1 rounded-lg text-xs font-extrabold ' + (mode === 'blank' ? 'bg-sky-600 text-white' : 'text-slate-600');
    document.getElementById('algo-guided-area').classList.toggle('hidden', mode !== 'guided');
    document.getElementById('algo-blank-area').classList.toggle('hidden', mode !== 'blank');
    if (mode === 'blank') buildBlankAlgoSheet();
    else renderGuidedAlgoGrid();
}

export function generateAlgoQuestion() {
    document.getElementById('algo-feedback').classList.add('hidden');
    document.getElementById('algo-next-wrap').classList.add('hidden');
    document.getElementById('algo-owl')?.classList.add('hidden');
    state.algoLoans = {};

    const op = state.algoOp;
    const isHard = state.difficulty === 'hard';
    let a, b, answer, badge, qText, steps;

    if (op === 'sub') {
        if (state.algoLevel === 'plain') {
            badge = '− Uppställning';
            do {
                a = isHard ? randInt(120, 940) : randInt(34, 99);
                b = isHard ? randInt(110, 899) : randInt(12, 33);
            } while (a <= b || subNeedsLoan(a, b));
            answer = a - b;
            qText = `Räkna ut ${a} − ${b}!`;
            steps = [
                { text: `<p><strong>Steg 1 (Entalen):</strong> Räkna <strong>${a % 10} − ${b % 10} = ${(a % 10) - (b % 10)}</strong> och skriv under strecket.</p>`, grid: { showAns: 1 } },
                { text: `<p><strong>Steg 2:</strong> Fortsätt åt vänster, talsort för talsort ➔ Svaret är <strong>${answer}</strong>!</p>`, grid: { showAns: 99 } }
            ];
        } else if (isHard) {
            badge = '− Subtraktion med dubbel växling (Låna ×2 🔄)';
            const hTop = randInt(4, 9);
            const tTop = randInt(1, 5);
            const eTop = randInt(1, 5);
            const hBot = randInt(1, hTop - 1);
            const tBot = randInt(tTop + 1, 8);
            const eBot = randInt(eTop + 1, 9);
            a = hTop * 100 + tTop * 10 + eTop;
            b = hBot * 100 + tBot * 10 + eBot;
            answer = a - b;
            qText = `Räkna ut ${a} − ${b}!`;

            steps = [
                { text: `<p><strong>Steg 1 (Entalen):</strong> <strong>${eTop}</strong> är mindre än <strong>${eBot}</strong>. Tryck på tiotalet <strong>${tTop}</strong> för att låna <strong>10</strong> ➔ <strong>${10 + eTop} − ${eBot} = ${(10 + eTop) - eBot}</strong>.</p>`, grid: { highlight: 2, struck: [2], carries: { 3: '10' }, showAns: 1 } },
                { text: `<p><strong>Steg 2 (Tiotalen):</strong> Nu finns <strong>${tTop - 1}</strong> kvar i tiotalen, vilket är mindre än <strong>${tBot}</strong>! Tryck på hundratalet <strong>${hTop}</strong> för att låna <strong>10</strong> tiotal ➔ <strong>${10 + tTop - 1} − ${tBot} = ${(10 + tTop - 1) - tBot}</strong>.</p>`, grid: { highlight: 1, struck: [1, 2], carries: { 2: '10', 3: '10' }, showAns: 2 } },
                { text: `<p><strong>Steg 3 (Hundratalen):</strong> Nu finns <strong>${hTop - 1}</strong> kvar längst till vänster: <strong>${hTop - 1} − ${hBot} = ${(hTop - 1) - hBot}</strong> ➔ Svaret är <strong>${answer}</strong>!</p>`, grid: { struck: [1, 2], carries: { 2: '10', 3: '10' }, showAns: 3 } }
            ];
        } else {
            badge = '− Subtraktion med växling (Låna 🔄)';
            const tTop = randInt(4, 9);
            const eTop = randInt(1, 6);
            const tBot = randInt(1, tTop - 1);
            const eBot = randInt(eTop + 1, 9);
            a = tTop * 10 + eTop;
            b = tBot * 10 + eBot;
            answer = a - b;
            qText = `Räkna ut ${a} − ${b}!`;

            steps = [
                { text: `<p><strong>Steg 1 (Entalen längst till höger):</strong> Vi ska ta <strong>${eTop} − ${eBot}</strong>, men ${eTop} är mindre än ${eBot}. Tryck på tiotalet <strong>${tTop}</strong> för att låna <strong>10</strong>!</p>`, grid: { highlight: 1 } },
                { text: `<p><strong>Steg 2:</strong> Nu har vi <strong>10 + ${eTop} = ${10 + eTop}</strong> i entalen! Räkna <strong>${10 + eTop} − ${eBot} = ${(10 + eTop) - eBot}</strong>.</p>`, grid: { struck: [1], carries: { 2: '10' }, showAns: 1 } },
                { text: `<p><strong>Steg 3 (Tiotalen):</strong> Eftersom vi lånade 1 tiotal från ${tTop} finns <strong>${tTop - 1}</strong> kvar där uppe. Räkna <strong>${tTop - 1} − ${tBot} = ${(tTop - 1) - tBot}</strong> ➔ Svaret blir <strong>${answer}</strong>!</p>`, grid: { struck: [1], carries: { 2: '10' }, showAns: 2 } }
            ];
        }
    } else if (op === 'add') {
        if (state.algoLevel === 'plain') {
            badge = '+ Uppställning';
            do {
                a = isHard ? randInt(101, 499) : randInt(12, 88);
                b = isHard ? randInt(101, 499) : randInt(11, 87);
            } while (addNeedsCarry(a, b));
            answer = a + b;
            qText = `Räkna ut ${a} + ${b}!`;
            steps = [
                { text: `<p><strong>Steg 1 (Entalen):</strong> Räkna <strong>${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}</strong> och skriv under strecket.</p>`, grid: { showAns: 1 } },
                { text: `<p><strong>Steg 2:</strong> Fortsätt åt vänster, talsort för talsort ➔ Svaret är <strong>${answer}</strong>!</p>`, grid: { showAns: 99 } }
            ];
        } else if (isHard) {
            badge = '+ Addition med dubbel minnessiffra';
            const hTop = randInt(2, 5);
            const tTop = randInt(5, 8);
            const eTop = randInt(5, 9);
            const hBot = randInt(1, 3);
            const tBot = randInt(10 - tTop, 9);
            const eBot = randInt(10 - eTop, 9);
            a = hTop * 100 + tTop * 10 + eTop;
            b = hBot * 100 + tBot * 10 + eBot;
            answer = a + b;
            qText = `Räkna ut ${a} + ${b}!`;

            const eSum = eTop + eBot;
            const tSum = 1 + tTop + tBot;
            steps = [
                { text: `<p><strong>Steg 1 (Entalen):</strong> <strong>${eTop} + ${eBot} = ${eSum}</strong>. Skriv <strong>${eSum % 10}</strong> och minnessiffran <strong class="text-emerald-600">1</strong> över tiotalen.</p>`, grid: { carries: { 2: '1' }, showAns: 1 } },
                { text: `<p><strong>Steg 2 (Tiotalen):</strong> <strong>1 + ${tTop} + ${tBot} = ${tSum}</strong>. Skriv <strong>${tSum % 10}</strong> och minnessiffran <strong class="text-emerald-600">1</strong> över hundratalen.</p>`, grid: { carries: { 1: '1', 2: '1' }, showAns: 2 } },
                { text: `<p><strong>Steg 3 (Hundratalen):</strong> <strong>1 + ${hTop} + ${hBot} = ${1 + hTop + hBot}</strong> ➔ Svaret blir <strong>${answer}</strong>!</p>`, grid: { carries: { 1: '1', 2: '1' }, showAns: 3 } }
            ];
        } else {
            badge = '+ Addition med minnessiffra';
            const tTop = randInt(2, 6);
            const eTop = randInt(5, 9);
            const tBot = randInt(1, 5);
            const eBot = randInt(10 - eTop, 9);
            a = tTop * 10 + eTop;
            b = tBot * 10 + eBot;
            answer = a + b;
            qText = `Räkna ut ${a} + ${b}!`;

            steps = [
                { text: `<p><strong>Steg 1 (Entalen längst till höger):</strong> Räkna <strong>${eTop} + ${eBot} = ${eTop + eBot}</strong>. Skriv entalet <strong>${(eTop + eBot) % 10}</strong> längst ner och minnessiffran <strong class="text-emerald-600">1</strong> över tiotalen.</p>`, grid: { carries: { 1: '1' }, showAns: 1 } },
                { text: `<p><strong>Steg 2 (Tiotalen):</strong> Räkna ihop minnessiffran och tiotalen: <strong>1 + ${tTop} + ${tBot} = ${1 + tTop + tBot}</strong> ➔ Svaret blir <strong>${answer}</strong>!</p>`, grid: { carries: { 1: '1' }, showAns: 2 } }
            ];
        }
    } else if (op === 'mul') {
        if (state.algoLevel === 'mul2') {
            badge = '× Tvåsiffrig uppställning';
            do {
                a = isHard ? randInt(123, 489) : randInt(23, state.difficulty === 'easy' ? 49 : 89);
                b = randInt(12, state.difficulty === 'easy' ? 39 : (isHard ? 89 : 69));
            } while (b % 10 === 0);
            answer = a * b;
            qText = `Räkna ut ${a} × ${b}!`;

            const b0 = b % 10;
            const b1 = (b - b0) / 10;
            const p1 = a * b0;
            const p2 = a * b1;
            const lenA = String(a).length;
            const dRev = String(a).split('').reverse().map(Number);
            const mDigits = Math.max(lenA, String(b).length, String(answer).length, String(p1).length, String(p2).length + 1);
            const mCols = mDigits + 1;
            const colOf = (pos, shift) => mCols - 1 - pos - shift;

            steps = [
                { text: `<p><strong>Steg 1 – ställ upp:</strong> Talet med flest siffror, <strong>${a}</strong>, står överst och <strong>${b}</strong> under. Vi räknar <strong>en multiplikator-siffra i taget</strong> – först entalen ${b0}, sen tiotalen ${b1}!</p>`, mul2Grid: { hlRow: 'b', hlCol: mCols - 1 } },
            ];
            let carry = 0;
            const acc1 = {};
            for (let i = 0; i < lenA; i++) {
                const d = dRev[i];
                const prod = b0 * d + carry;
                const last = i === lenA - 1;
                const newCarry = last ? 0 : Math.floor(prod / 10);
                const col = colOf(i + 1, 0);
                if (newCarry) acc1[col] = String(newCarry);
                steps.push({
                    text: i === 0
                        ? `<p><strong>Entalsraden:</strong> ${b0} · ${d} = <strong>${prod}</strong>. Skriv <strong>${prod % 10}</strong> under strecket${newCarry ? ` och minnessiffran <strong class="text-emerald-600">${newCarry}</strong> litet till vänster i nästa ruta` : ''}.</p>`
                        : `<p><strong>${b0} · ${d}${carry ? ` + minne <strong class="text-emerald-600">${carry}</strong>` : ''} = <strong>${prod}</strong>. ${last ? `Skriv hela talet <strong>${prod}</strong>!` : `Skriv <strong>${prod % 10}</strong>${newCarry ? ` – minnessiffra <strong class="text-emerald-600">${newCarry}</strong> till vänster` : ''}.`}</p>`,
                    mul2Grid: { showP1: last ? String(p1).length : i + 1, p1Carries: { ...acc1 }, hlRow: 'p1', hlCol: colOf(i, 0) }
                });
                carry = newCarry;
            }
            steps.push({
                text: `<p><strong>Nu tiotalen ${b1}!</strong> Den är värd <strong>${b1 * 10}</strong> – därför skrivs det här delresultatet <strong>ett steg åt vänster</strong>, med ett + framför.</p>`,
                mul2Grid: { showP1: 99, p1Carries: { ...acc1 }, hlRow: 'b', hlCol: mCols - 2 }
            });
            carry = 0;
            const acc2 = {};
            for (let i = 0; i < lenA; i++) {
                const d = dRev[i];
                const prod = b1 * d + carry;
                const last = i === lenA - 1;
                const newCarry = last ? 0 : Math.floor(prod / 10);
                const col = colOf(i + 1, 1);
                if (newCarry) acc2[col] = String(newCarry);
                steps.push({
                    text: `<p><strong>${b1} · ${d}${carry ? ` + minne <strong class="text-emerald-600">${carry}</strong>` : ''} = <strong>${prod}</strong>. ${last ? `Skriv hela talet <strong>${prod}</strong> – ett steg åt vänster!` : `Skriv <strong>${prod % 10}</strong>${newCarry ? ` – minnessiffra <strong class="text-emerald-600">${newCarry}</strong> till vänster` : ''}.`}</p>`,
                    mul2Grid: { showP1: 99, p1Carries: { ...acc1 }, showP2: last ? String(p2).length : i + 1, p2Carries: { ...acc2 }, hlRow: 'p2', hlCol: colOf(i, 1) }
                });
                carry = newCarry;
            }
            // Slutadditionen av delresultaten, med eventuella minnessiffror.
            let ac = 0;
            const acc3 = {};
            const p1D = String(p1), p2D = String(p2);
            for (let pos = 0; pos < String(answer).length; pos++) {
                const d1 = pos < p1D.length ? +p1D[p1D.length - 1 - pos] : 0;
                const d2 = pos > 0 && pos - 1 < p2D.length ? +p2D[p2D.length - pos] : 0;
                const s = d1 + d2 + ac;
                ac = Math.floor(s / 10);
                if (ac) acc3[colOf(pos + 1, 0)] = String(ac);
            }
            steps.push({
                text: `<p><strong>Lägg ihop delresultaten!</strong> ${p1} + ${p2 * 10} – räkna talsort för talsort som vanlig addition ➔ <strong>${a} × ${b} = ${answer}</strong>!</p>`,
                mul2Grid: { showP1: 99, showP2: 99, showAns: 99, p1Carries: { ...acc1 }, p2Carries: { ...acc2 }, ansCarries: acc3, hlRow: 'ans', hlCol: -1 }
            });
        } else {
        badge = state.algoLevel === 'carry' ? '× Uppställning med minnessiffra' : '× Uppställning';
        do {
            a = isHard ? randInt(124, 348) : randInt(14, state.difficulty === 'easy' ? 29 : 48);
            b = isHard ? randInt(4, 8) : randInt(2, state.difficulty === 'easy' ? 4 : 6);
        } while ((state.algoLevel === 'carry' && !mulNeedsCarry(a, b)) ||
                 (state.algoLevel === 'plain' && mulNeedsCarry(a, b)));
        answer = a * b;
        qText = `Räkna ut ${a} × ${b}!`;

        const eTop = a % 10;
        const rest = Math.floor(a / 10) * 10;
        const eProd = eTop * b;
        const eCarry = Math.floor(eProd / 10);
        const mulDigits = Math.max(String(a).length, String(b).length, String(answer).length);
        const mulCarries = eCarry > 0 ? { [mulDigits - 1]: String(eCarry) } : {};
        steps = [
            { text: `<p><strong>Steg 1:</strong> Börja med entalen: <strong>${b} × ${eTop} = ${eProd}</strong>. Skriv <strong>${eProd % 10}</strong> längst ner${eCarry > 0 ? ` och minnessiffran <strong class="text-emerald-600">${eCarry}</strong> litet till vänster i nästa svarsruta` : ''}.</p>`, grid: { highlight: mulDigits, carries: mulCarries, showAns: 1 } },
            { text: `<p><strong>Steg 2:</strong> Gångra resten${eCarry > 0 ? ' och lägg till minnessiffran' : ''}: <strong>${b} × ${rest} = ${b * rest}</strong>. Tillsammans blir det <strong>${answer}</strong>!</p>`, grid: { carries: mulCarries, showAns: 99 } }
        ];
        }
    } else {
        badge = state.algoLevel === 'carry' ? '÷ Kort division med rest' : '÷ Kort division';
        do {
            b = isHard ? randInt(4, 9) : randInt(2, 5);
            answer = isHard ? randInt(42, 128) : randInt(12, state.difficulty === 'easy' ? 24 : 36);
            a = answer * b;
        } while ((state.algoLevel === 'carry' && !divHasRest(a, b)) ||
                 (state.algoLevel === 'plain' && divHasRest(a, b)));
        qText = `Räkna ut ${a} ÷ ${b}!`;

        // Kort division steg för steg: varje täljarsiffra delas från vänster,
        // resten blir minnessiffra över nästa siffra i trappan.
        const aStr = String(a);
        let rem = 0;
        const acc = {};
        steps = [];
        for (let i = 0; i < aStr.length; i++) {
            const cur = rem * 10 + (+aStr[i]);
            const q = Math.floor(cur / b);
            rem = cur % b;
            if (rem > 0) acc[i + 1] = String(rem); // minnessiffra över NÄSTA siffra
            steps.push({
                text: i === 0
                    ? `<p><strong>Steg ${i + 1} – börja till vänster:</strong> Hur många gånger går <strong>${b}</strong> i <strong>${cur}</strong>? <strong>${q}</strong> gång${q === 1 ? '' : 'er'}${rem > 0 ? ` – resten <strong class="text-emerald-600">${rem}</strong> skrivs litet över nästa siffra!` : ' – jämnt, ingen rest!'}</p>`
                    : `<p><strong>Steg ${i + 1}:</strong> Minnessiffran + siffran = <strong>${cur}</strong>. Hur många gånger går <strong>${b}</strong> i ${cur}? <strong>${q}</strong> gång${q === 1 ? '' : 'er'}${rem > 0 ? ` – resten <strong class="text-emerald-600">${rem}</strong> över nästa!` : ' – jämnt!'}</p>`,
                divGrid: { showAns: i + 1, carries: { ...acc }, hlDigit: i }
            });
        }
        steps.push({
            text: `<p><strong>Klart!</strong> Kontrollera med multiplikation: <strong>${b} × ${answer} = ${a}</strong> ➔ Svaret är <strong>${answer}</strong>!</p>`,
            divGrid: { showAns: 99, carries: { ...acc } }
        });
    }

    state.currentAlgo = { a, b, op, answer, steps, mul2: op === 'mul' && state.algoLevel === 'mul2' };
    // Ledtrådarna byggs av samma strukturerade steg som "Visa mig"-demon.
    const hints = (steps || []).map(s => s.text +
        (s.grid ? algoMiniGrid(a, b, op, answer, s.grid) : '') +
        (s.mul2Grid ? algoMiniMul2Grid(a, b, s.mul2Grid) : '') +
        (s.divGrid ? algoMiniDivGrid(a, b, answer, s.divGrid) : ''));
    document.getElementById('algo-mode-badge').textContent = badge;
    document.getElementById('algo-question-text').textContent = qText;
    document.getElementById('algo-blank-problem-label').textContent = `${a} ${op === 'sub' ? '−' : (op === 'add' ? '+' : (op === 'mul' ? '×' : '÷'))} ${b}`;
    const opTips = {
        add: '➕ Minnessiffran skriver du litet i toppraden, över talsorten där den ska adderas.',
        sub: '➖ Låna genom att stryka siffran (Space) och skriva 10 i toppraden.',
        mul: '✖️ Minnessiffran skriver du till vänster i den svarsruta där den ska adderas – två tecken får plats i samma ruta.',
        div: '➗ Trappan: täljarens siffror ovanför strecket, nämnaren till vänster, svaret efter = – på streckets höjd.'
    };
    document.getElementById('algo-blank-op-tip').textContent = opTips[op];
    setHintSteps('algo', hints);

    document.getElementById('algo-check-btn').classList.remove('hidden');
    document.getElementById('algo-guided-area').classList.toggle('hidden', state.algoSheetMode !== 'guided');
    document.getElementById('algo-blank-area').classList.toggle('hidden', state.algoSheetMode !== 'blank');
    const sheetToggle = document.getElementById('algo-sheet-guided')?.parentElement;
    if (sheetToggle) sheetToggle.classList.remove('hidden');

    if (state.algoSheetMode === 'guided') renderGuidedAlgoGrid();
    else buildBlankAlgoSheet();
}

// "Visa mig": bygger det animerade exemplet åt den delade demo-motorn
// (js/demo.js). Samma stegdata som ledtrådarna – varje steg får sin
// rutnätsbild förrenderad med pop/draw-animationer.
export function buildAlgoDemoSteps() {
    const cur = state.currentAlgo;
    if (!cur || !cur.steps || !cur.steps.length) return { steps: [] };
    const { a, b, op } = cur;
    const intros = {
        add: `Vi räknar <strong>${a} + ${b}</strong> med uppställning! <strong>Börja alltid längst till höger — med entalen.</strong>`,
        sub: `Vi räknar <strong>${a} − ${b}</strong> med uppställning! <strong>Börja längst till höger — med entalen.</strong>`,
        mul: cur.mul2
            ? `Vi räknar <strong>${a} × ${b}</strong> med uppställning! När multiplikatorn har två siffror får vi <strong>två delresultat</strong> som läggs ihop.`
            : `Vi räknar <strong>${a} × ${b}</strong> med uppställning! <strong>Gångra en siffra i taget, från höger till vänster.</strong>`,
        div: `Vi delar <strong>${a}</strong> med <strong>${b}</strong> i trappan! <strong>I division börjar vi TILL VÄNSTER</strong> — tvärtom mot de andra räknesätten!`
    };
    const intro = { text: `<p>${intros[op]}</p>` };
    if (cur.mul2) intro.mul2Grid = {};
    else if (op === 'div') intro.divGrid = { showAns: 0, carries: {}, hlDigit: -1 };
    else intro.grid = { showAns: 0 };
    const raw = [intro, ...cur.steps];

    const steps = raw.map((s, idx) => {
        if (s.mul2Grid) {
            const prev = idx > 0 ? (raw[idx - 1].mul2Grid || {}) : {};
            const g = s.mul2Grid;
            const freshCarry = [['p1Carries', 'p1'], ['p2Carries', 'p2'], ['ansCarries', 'ans']]
                .flatMap(([k, row]) => Object.keys(g[k] || {}).map(Number)
                    .filter(c => !(prev[k] || {})[c]).map(col => ({ row, col })));
            return { text: s.text, html: algoMiniMul2Grid(cur.a, cur.b,
                { ...g, freshCarry, popP1: true, popP2: true, popAns: true, big: true }) };
        }
        const prevG = idx > 0 ? (raw[idx - 1].grid || raw[idx - 1].divGrid || {}) : {};
        let g = s.grid || s.divGrid || {};
        const freshStruck = (g.struck || []).filter(c => !(prevG.struck || []).includes(c));
        const freshCarry = Object.keys(g.carries || {}).map(Number).filter(c => !(prevG.carries || {})[c]);
        // Auto-highlight: om steget inte markerar någon kolumn själv lyser den
        // kolumn vars svarssiffra precis avslöjades (t.ex. entalen i steg 1).
        if (g.highlight === undefined && (g.showAns || 0) > 0 && cur.op !== 'div') {
            const digits = Math.max(String(cur.a).length, String(cur.b).length, String(cur.answer).length);
            const col = digits - g.showAns + 1;
            if (col >= 1 && col <= digits) g = { ...g, highlight: col };
        }
        // I demon finns inget att "trycka" på – formulera om låna-stegen.
        const text = s.text.replace(/Tryck på (\w+)talet/g, 'Stryk $1talet');
        const html = cur.op === 'div'
            ? algoMiniDivGrid(cur.a, cur.b, cur.answer, { ...g, freshCarry, popAnsIdx: (g.showAns || 0) - 1, big: true })
            : algoMiniGrid(cur.a, cur.b, cur.op, cur.answer, { ...g, freshStruck, freshCarry, popAns: true, big: true });
        return { text, html };
    });

    // "Se upp!"-steg: det vanligaste felet för just detta räknesätt.
    const hasCarry = cur.steps.some(s => Object.keys((s.grid || s.divGrid || {}).carries || {}).length > 0);
    const warns = {
        add: hasCarry
            ? 'Glöm inte <strong>minnessiffran</strong> – den lilla siffran högst upp räknas också!'
            : 'Börja alltid med <strong>entalen längst till höger</strong> – inte från vänster!',
        sub: 'Byt inte plats på siffrorna när den nedersta är större! 4 − 7 blir INTE 3 – <strong>växla ett tiotal</strong> först!',
        mul: cur.mul2
            ? 'Glöm inte <strong>förskjutningen</strong>! Andra delresultatet börjar ett steg åt vänster – tiotalssiffran är ju värd tio gånger mer!'
            : 'Minnessiffran <strong>läggs till</strong> efteråt – den gångas inte med nästa siffra!',
        div: 'Kolla alltid med <strong>gånger</strong> efteråt: om 12 ÷ 3 = 4 ska 4 × 3 = 12 stämma!',
    };
    steps.push({ text: `<p>${warns[op]}</p>`, warn: true, html: '' });

    // "Din tur!"-steg: en svarssiffra saknas – eleven gissar den innan
    // 'Öva själv nu!' låses upp.
    const ansStr = String(cur.answer);
    const missIdx = cur.op === 'div' ? ansStr.length - 1 : 0;
    const missDigit = +ansStr[missIdx];
    const options = shuffleArray([
        { label: String(missDigit), ok: true },
        { label: String((missDigit + 1) % 10), ok: false },
        { label: String((missDigit + 9) % 10), ok: false },
    ]);
    const lastRaw = raw[raw.length - 1];
    const lg = lastRaw.grid || lastRaw.divGrid || lastRaw.mul2Grid || {};
    const guessGrid = { ...lg, showAns: ansStr.length - 1, glowBlank: true };
    if (cur.mul2) { guessGrid.hlRow = 'ans'; guessGrid.hlCol = -1; }
    else if (cur.op !== 'div') guessGrid.highlight = 1;
    else guessGrid.hlDigit = -1;
    const sym = cur.op === 'sub' ? '−' : (cur.op === 'add' ? '+' : (cur.op === 'mul' ? '×' : '÷'));
    steps.push({
        text: `<p><strong>Din tur!</strong> Vilken siffra saknas i svaret?</p>`,
        html: cur.mul2
            ? algoMiniMul2Grid(cur.a, cur.b, { ...guessGrid, big: true })
            : cur.op === 'div'
                ? algoMiniDivGrid(cur.a, cur.b, cur.answer, { ...guessGrid, big: true })
                : algoMiniGrid(cur.a, cur.b, cur.op, cur.answer, { ...guessGrid, big: true }),
        guess: { options },
        doneText: `${cur.a} ${sym} ${cur.b} = ${cur.answer} 🎉`,
    });
    return { steps };
}

export function toggleAlgoLoan(colIdx) {
    if (state.algoOp !== 'sub') return;
    playSound('click');
    state.algoLoans[colIdx] = !state.algoLoans[colIdx];
    renderGuidedAlgoGrid();
}

export function resetAlgoLoans() {
    playSound('click');
    state.algoLoans = {};
    renderGuidedAlgoGrid();
}

export function renderGuidedAlgoGrid() {
    const { a, b, op, answer } = state.currentAlgo;
    const loanBar = document.getElementById('algo-loan-bar');
    loanBar.classList.toggle('hidden', op !== 'sub');

    const container = document.getElementById('algo-grid-container');
    const ansStr = String(answer);

    if (op === 'div') {
        // Svensk kort division ("trappan"): minnessiffror överst, täljarens
        // siffror med streck under – och nämnare, = och svar på streckets
        // höjd (de "korsar" raderna, vertikalt centrerade) som i skolboken.
        const aStr = String(a);
        const divLen = aStr.length;
        const cols = divLen + 2 + ansStr.length; // nämnare | täljare | = | svar
        const spanStyle = (col) => `grid-row: 2 / span 3; grid-column: ${col}; height: auto;`;
        let html = `<div class="math-grid-paper" style="grid-template-columns: repeat(${cols}, 54px);">`;
        // Minnessifferrad: carry-rutor över täljarsiffrorna (utom första).
        for (let c = 0; c < cols; c++) {
            if (c >= 2 && c <= divLen) {
                html += `<div class="math-grid-cell"><input maxlength="1" inputmode="numeric" class="math-grid-input math-grid-carry-input" placeholder="·"></div>`;
            } else {
                html += `<div class="math-grid-cell"></div>`;
            }
        }
        // Nämnaren: vertikalt centrerad på streckets höjd, längst till vänster.
        html += `<div class="math-grid-cell text-sky-700" style="${spanStyle(1)}">${b}</div>`;
        // Täljarsiffrorna på rad 2.
        for (let c = 0; c < divLen; c++) {
            const place = Math.pow(10, divLen - 1 - c);
            html += `<div class="math-grid-cell pv-col-${place}"><span class="pv-num pv-${place}">${aStr[c]}</span></div>`;
        }
        // = på streckets höjd, direkt till höger om täljaren.
        html += `<div class="math-grid-cell text-slate-900" style="${spanStyle(divLen + 2)}">=</div>`;
        // Svarsrutorna på streckets höjd.
        for (let idx = 0; idx < ansStr.length; idx++) {
            const place = Math.pow(10, ansStr.length - 1 - idx);
            html += `<div class="math-grid-cell pv-col-${place}" style="${spanStyle(divLen + 3 + idx)}">
                <input id="algo-ans-${idx}" maxlength="1" inputmode="numeric"
                    oninput="if(this.value && document.getElementById('algo-ans-${idx + 1}')) document.getElementById('algo-ans-${idx + 1}').focus()"
                    onkeydown="algoAnsKey(event, ${idx})"
                    class="math-grid-input pv-num pv-${place}" placeholder="?">
            </div>`;
        }
        // Strecket under bara täljarsiffrorna.
        html += `<div style="grid-row: 3; grid-column: 2 / ${divLen + 2}; display: flex; align-items: center; height: 4px; margin: -4px 2px;">
            <div style="width: 100%; height: 4px; background: #0f172a; border-radius: 2px;"></div>
        </div>`;
        // Tomma celler under täljaren håller radhöjden symmetrisk så att
        // nämnare/=/svar hamnar exakt på streckets mitt.
        for (let c = 0; c < divLen; c++) {
            html += `<div class="math-grid-cell" style="grid-row: 4; grid-column: ${c + 2};"></div>`;
        }
        html += `</div>`;
        container.innerHTML = html;
        return;
    }

    if (op === 'mul' && state.algoLevel === 'mul2') {
        // Tvåsiffrig multiplikator: multiplikand, ×rad, streck,
        // delresultat 1 (ental), +delresultat 2 (förskjutet), streck, summa.
        // Minnessiffror skrivs litet till vänster i rutan där de adderas.
        const b0 = b % 10;
        const p1 = a * b0, p2 = a * ((b - b0) / 10);
        const lenA = String(a).length;
        const digits = Math.max(lenA, String(b).length, ansStr.length,
            String(p1).length, String(p2).length + 1);
        const aStr = String(a).padStart(digits, ' ');
        const bStr = String(b).padStart(digits, ' ');
        const cols = digits + 1;
        const place = c => Math.pow(10, cols - 1 - c);
        const lineDiv = `<div style="grid-column: 1 / -1; height: 4px; margin: -6px 2px 0;">
            <div style="height: 4px; background: #0f172a; border-radius: 2px;"></div>
        </div>`;
        const sideInput = '<input maxlength="1" inputmode="numeric" class="math-grid-carry-side-input" placeholder="·">';
        let html = `<div class="math-grid-paper" style="grid-template-columns: repeat(${cols}, 54px);">`;
        for (let c = 0; c < cols; c++)
            html += `<div class="math-grid-cell text-slate-900 ${c > 0 ? `pv-col-${place(c)}` : ''}">${c > 0 ? `<span class="pv-num pv-${place(c)}">${aStr[c - 1]}</span>` : ''}</div>`;
        for (let c = 0; c < cols; c++)
            html += `<div class="math-grid-cell text-slate-900 ${c > 0 ? `pv-col-${place(c)}` : ''}">${c === 0 ? `<span class="text-sky-600">×</span>` : `<span class="pv-num pv-${place(c)}">${bStr[c - 1]}</span>`}</div>`;
        html += lineDiv;
        for (let c = 0; c < cols; c++) {
            const pos = cols - 1 - c;
            const isCarryCol = c >= cols - lenA && c <= cols - 2;
            html += `<div class="math-grid-cell pv-col-${place(c)}">${c === 0 ? '' : `
                <input id="algo-p1-${pos}" maxlength="1" inputmode="numeric"
                    oninput="if(this.value && document.getElementById('algo-p1-${pos - 1}')) document.getElementById('algo-p1-${pos - 1}').focus()"
                    onkeydown="algoRowKey(event, 'algo-p1', ${pos})"
                    class="math-grid-input pv-num pv-${place(c)}" placeholder="?">
                ${isCarryCol ? sideInput : ''}`}</div>`;
        }
        for (let c = 0; c < cols; c++) {
            const pos = cols - 2 - c;
            const isCarryCol = c >= cols - lenA - 1 && c <= cols - 3;
            html += `<div class="math-grid-cell pv-col-${place(c)}">${c === 0 ? '<span class="text-sky-600">+</span>' : (c === cols - 1 ? '' : `
                <input id="algo-p2-${pos}" maxlength="1" inputmode="numeric"
                    oninput="if(this.value && document.getElementById('algo-p2-${pos - 1}')) document.getElementById('algo-p2-${pos - 1}').focus()"
                    onkeydown="algoRowKey(event, 'algo-p2', ${pos})"
                    class="math-grid-input pv-num pv-${place(c)}" placeholder="?">
                ${isCarryCol ? sideInput : ''}`)}</div>`;
        }
        html += lineDiv;
        for (let c = 0; c < cols; c++) {
            const idx = c - 1;
            const isCarryCol = c > 0 && c <= cols - 2;
            html += `<div class="math-grid-cell pv-col-${place(c)}">${c === 0 ? '' : `
                <input id="algo-ans-${idx}" maxlength="1" inputmode="numeric"
                    oninput="if(this.value && document.getElementById('algo-ans-${idx - 1}')) document.getElementById('algo-ans-${idx - 1}').focus()"
                    onkeydown="algoAnsKey(event, ${idx})"
                    class="math-grid-input pv-num pv-${place(c)}" placeholder="?">
                ${isCarryCol ? sideInput : ''}`}</div>`;
        }
        html += `</div>`;
        container.innerHTML = html;
        return;
    }

    const digits = Math.max(String(a).length, String(b).length, ansStr.length);
    const aStr = String(a).padStart(digits, ' ');
    const bStr = String(b).padStart(digits, ' ');
    const cols = digits + 1;
    const opSym = op === 'sub' ? '−' : (op === 'add' ? '+' : '×');

    let html = `<div class="math-grid-paper" style="grid-template-columns: repeat(${cols}, 54px);">`;
    // Översta raden: lånade 10:or (subtraktion) eller minnessiffror
    // (addition). Multiplikation skriver minnessiffran på multiplikatorns
    // rad istället, så där ritas ingen topprad.
    if (op !== 'mul') {
        for (let c = 0; c < cols; c++) {
            if (op === 'sub' && c >= 2 && state.algoLoans[c - 1]) {
                html += `<div class="math-grid-cell font-hand text-emerald-600 text-xl font-bold items-end pb-1">10</div>`;
            } else if (op === 'add' && c > 0 && c < cols - 1) {
                html += `<div class="math-grid-cell"><input maxlength="1" inputmode="numeric" class="math-grid-input math-grid-carry-input" placeholder="·"></div>`;
            } else {
                html += `<div class="math-grid-cell"></div>`;
            }
        }
    }
    for (let c = 0; c < cols; c++) {
        const digit = c === 0 ? '' : aStr[c - 1];
        const place = c === 0 ? 0 : Math.pow(10, cols - 1 - c);
        const canLoanFromCol = op === 'sub' && c >= 1 && c <= cols - 2 && digit.trim() !== '';
        const isStruck = !!state.algoLoans[c];
        if (canLoanFromCol) {
            html += `<div onclick="toggleAlgoLoan(${c})" title="Klicka för att låna 10" class="math-grid-cell cursor-pointer hover:bg-sky-100 pv-col-${place} ${isStruck ? 'digit-struck' : 'text-sky-950'}"><span class="pv-num pv-${place}">${digit}</span></div>`;
        } else {
            html += `<div class="math-grid-cell text-slate-900 ${c > 0 ? `pv-col-${place}` : ''}">${c > 0 ? `<span class="pv-num pv-${place}">${digit}</span>` : ''}</div>`;
        }
    }
    for (let c = 0; c < cols; c++) {
        const place = c === 0 ? 0 : Math.pow(10, cols - 1 - c);
        const content = c === 0 ? `<span class="text-sky-600">${opSym}</span>` : `<span class="pv-num pv-${place}">${bStr[c - 1]}</span>`;
        html += `<div class="math-grid-cell text-slate-900 ${c > 0 ? `pv-col-${place}` : ''}">${content}</div>`;
    }
    // Sammanhängande räknestreck under hela operandraden (inte uppdelat
    // av cellkanterna).
    html += `<div style="grid-column: 1 / -1; height: 4px; margin: -6px 2px 0;">
        <div style="height: 4px; background: #0f172a; border-radius: 2px;"></div>
    </div>`;
    for (let c = 0; c < cols; c++) {
        if (c === 0) {
            html += `<div class="math-grid-cell"></div>`;
        } else {
            const idx = c - 1;
            const prevIdx = idx - 1;
            const place = Math.pow(10, cols - 1 - c);
            // Minnessiffran i multiplikation skrivs litet till vänster i
            // den svarsruta där den ska adderas ("vid sidan").
            const isCarryCol = op === 'mul' && c >= cols - String(a).length && c <= cols - 2;
            html += `
                <div class="math-grid-cell pv-col-${place}">
                    <input id="algo-ans-${idx}" maxlength="1" inputmode="numeric"
                        oninput="if(this.value && document.getElementById('algo-ans-${prevIdx}')) document.getElementById('algo-ans-${prevIdx}').focus()"
                        onkeydown="algoAnsKey(event, ${idx})"
                        class="math-grid-input pv-num pv-${place}" placeholder="?">
                    ${isCarryCol ? '<input maxlength="1" inputmode="numeric" class="math-grid-carry-side-input" placeholder="·">' : ''}
                </div>
            `;
        }
    }
    html += `</div>`;
    container.innerHTML = html;
}

export function buildBlankAlgoSheet() {
    const container = document.getElementById('algo-blank-grid-container');
    if (!container) return;
    // Rutpappret formas efter räknesättet – samma metod som i Färdig mall:
    // + och −: minnessiffra/lån i toppraden, streck under andra operanden.
    // ×: minnessiffran skrivs "vid sidan" – litet till vänster i svarsrutan,
    //    så cellerna under första strecket får plats med två tecken
    //    (minne + svarssiffra). Toppraden blir vanlig arbetsyta.
    // ÷: trappan – rester litet över täljaren, streck direkt under täljaren
    //    och = + svar på raden under, plus arbetsrader längst ner.
    const op = state.algoOp;
    const isDiv = op === 'div';
    const isMul2 = op === 'mul' && state.algoLevel === 'mul2';
    const rows = isDiv ? 6 : (isMul2 ? 7 : 5), cols = 8;
    const carryRow = op === 'mul' ? -1 : 0;
    const lineRows = isDiv ? [1] : (isMul2 ? [2, 4] : [2]);
    const ansRow = isDiv ? 2 : (isMul2 ? 5 : 3);
    let html = `<div class="math-grid-paper" style="grid-template-columns: repeat(${cols}, 48px);">`;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cellId = `blank-cell-${r}-${c}`;
            const isCarry = r === carryRow;
            // ×-rader under strecket får plats med minnessiffra + svarssiffra
            // i samma ruta (svensk "vid sidan"-konvention).
            const twoChar = isCarry || (op === 'mul' && r > lineRows[0]);
            const ph = isCarry ? '·' : (r === ansRow ? '?' : '');
            html += `
                <div class="math-grid-cell" style="width:48px;height:48px;">
                    <input id="${cellId}" maxlength="${twoChar ? 2 : 1}"
                        ${twoChar && !isCarry ? 'data-side="1"' : ''}
                        ${ph ? `placeholder="${ph}"` : ''}
                        onfocus="state.lastFocusedCellId='${cellId}'"
                        onclick="if(state.blankStrikeMode){this.classList.toggle('digit-struck');}"
                        onkeydown="handleSheetKeyDown(event, '${cellId}')"
                        oninput="handleSheetInput(this, ${r})"
                        class="math-grid-input ${isCarry ? 'math-grid-carry-input' : ''}">
                </div>
            `;
        }
        // Ett sammanhängande räknestreck – från ruta 1 till näst sista,
        // inte utbrutet av cellkanterna. ×2 har två streck (delresultat + summa).
        if (lineRows.includes(r)) {
            const pct = 100 / cols;
            html += `<div style="grid-column: 1 / -1; height: 4px; margin: -6px 0 0; padding: 0 ${pct}%;">
                <div style="height: 4px; background: #0f172a; border-radius: 2px;"></div>
            </div>`;
        }
    }
    html += `</div>`;
    container.innerHTML = html;
}

export function toggleBlankStrikeMode() {
    playSound('click');
    state.blankStrikeMode = !state.blankStrikeMode;
    const btn = document.getElementById('blank-strike-btn');
    if (btn) {
        btn.className = state.blankStrikeMode
            ? 'px-3 py-1.5 rounded-xl bg-rose-600 text-white border border-rose-700 text-xs font-extrabold'
            : 'px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 text-xs font-extrabold';
    }
}

// Piltangenter i svarsrutorna: vänster/höger flyttar rumsligt.
export function algoAnsKey(e, idx) {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (step == null) return;
    const next = document.getElementById(`algo-ans-${idx + step}`);
    if (next) { e.preventDefault(); next.focus(); next.select(); }
}

// Samma pilnavigering för delresultatraderna i ×2-uppställningen.
export function algoRowKey(e, rowId, idx) {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (step == null) return;
    const next = document.getElementById(`${rowId}-${idx + step}`);
    if (next) { e.preventDefault(); next.focus(); next.select(); }
}

export function clearBlankSheet() {
    playSound('click');
    buildBlankAlgoSheet();
}

export function diagnoseAlgoMistake(userVal, a, b, op, answer) {
    if (op === 'sub') {
        const eTop = a % 10;
        const eBot = b % 10;
        const tTop = Math.floor((a % 100) / 10);
        const tBot = Math.floor((b % 100) / 10);

        if (eTop < eBot && userVal % 10 === (eBot - eTop)) {
            return `🦉 <strong>Aha!</strong> Titta på entalen längst till höger: det ser ut som att du räknat <strong>${eBot} − ${eTop} = ${eBot - eTop}</strong> nedifrån och upp, men vi måste alltid räkna <strong>uppifrån och ner (${eTop} − ${eBot})</strong>! Klicka på tiotalet <strong>${tTop}</strong> för att låna <strong>10</strong> först!`;
        }
        if (userVal === answer + 10) {
            return `🦉 <strong>Aha!</strong> Entalen blev helt rätt (<strong>${10 + eTop} − ${eBot} = ${(10 + eTop) - eBot}</strong>), men kom ihåg att du lånade 1 tiotal från <strong>${tTop}</strong> – så där uppe finns nu bara <strong>${tTop - 1}</strong> tiotal kvar (${tTop - 1} − ${tBot} = ${(tTop - 1) - tBot})!`;
        }
        if (state.algoSheetMode === 'guided' && Object.keys(state.algoLoans).length === 0) {
            return `🦉 <strong>Aha!</strong> Eftersom <strong>${eTop}</strong> är mindre än <strong>${eBot}</strong> behöver du först trycka på tiotalet <strong>${tTop}</strong> där uppe för att låna <strong>10</strong>!`;
        }
    } else if (op === 'add') {
        const eSum = (a % 10) + (b % 10);
        if (eSum >= 10 && userVal === answer - 10) {
            return `🦉 <strong>Aha!</strong> Entalen blev rätt (<strong>${a % 10} + ${b % 10} = ${eSum}</strong>), men du glömde att plussa på <strong>minnessiffran 1</strong> uppe vid tiotalen!`;
        }
        if (userVal === answer - 100) {
            return `🦉 <strong>Aha!</strong> Du glömde att lägga till <strong>minnessiffran 1</strong> uppe vid hundratalen!`;
        }
    } else if (op === 'mul') {
        if (state.algoLevel === 'mul2') {
            const b0 = b % 10;
            const p1 = a * b0, p2 = a * ((b - b0) / 10);
            if (userVal === p1 + p2) {
                return `🦉 <strong>Aha!</strong> Nästan! Du adderade <strong>${p1} + ${p2}</strong> – men andra delresultatet ska ligga ett steg åt vänster, det är egentligen <strong>${p2 * 10}</strong>. Tiotals-siffran ${(b - b0) / 10} är ju värd ${b - b0}!`;
            }
            if (userVal === p1) {
                return `🦉 <strong>Aha!</strong> Du gångade bara med entalen <strong>${b0}</strong>! Kom ihåg att även gångra ${a} med tiotalen <strong>${(b - b0) / 10}</strong> och lägga ihop de två raderna.`;
            }
        }
        const eProd = (a % 10) * b;
        const carry = Math.floor(eProd / 10);
        if (carry > 0 && userVal === answer - carry * 10) {
            return `🦉 <strong>Aha!</strong> Entalen blev rätt (<strong>${b} × ${a % 10} = ${eProd}</strong>), men glöm inte att plussa på <strong>minnessiffran ${carry}</strong> efter att du gångrat tiotalet!`;
        }
        if (userVal === a + b) {
            return `🦉 <strong>Aha!</strong> Här står ett gångertecken (<strong>×</strong>), så vi ska multiplicera (<strong>${a} × ${b}</strong>) och inte plussa!`;
        }
    } else if (op === 'div') {
        if (userVal === a * b) {
            return `🦉 <strong>Aha!</strong> Här är det division (<strong>÷</strong>) – vi ska dela upp <strong>${a}</strong> i <strong>${b}</strong> lika delar, inte gångra!`;
        }
    }
    return null;
}

// Ugglan ger fel-feedback direkt under arbetsytan i stället för längst ner.
function showAlgoOwl(html) {
    const owl = document.getElementById('algo-owl');
    const box = document.getElementById('algo-feedback');
    if (!owl) { showFeedback('algo-feedback', false, html); return; }
    if (box) box.classList.add('hidden');
    document.getElementById('algo-owl-text').innerHTML = html;
    owl.classList.remove('hidden', 'owl-in');
    void owl.offsetWidth;
    owl.classList.add('owl-in');
}

export function checkAlgoAnswer() {
    if (!document.getElementById('algo-next-wrap').classList.contains('hidden')) return;
    const { a, b, op, answer } = state.currentAlgo;
    const ansStr = String(answer);

    if (state.algoSheetMode === 'guided') {
        let userStr = '';
        for (let i = 0; i < ansStr.length; i++) {
            const inp = document.getElementById(`algo-ans-${i}`);
            userStr += inp ? inp.value.trim() : '';
        }
        if (userStr.length < ansStr.length) {
            showAlgoOwl('✏️ Fyll i alla rutor under strecket först!');
            return;
        }
        const userVal = parseInt(userStr, 10);
        if (userVal === answer) {
            addReward(2);
            showFeedback('algo-feedback', true, `🎉 Snyggt uppställt och helt rätt! Svaret är ${answer}!`);
            document.getElementById('algo-next-wrap').classList.remove('hidden');
        } else {
            resetStreak();
            // Markera varje svarsruta: grön om siffran stämmer, röd + skak om fel.
            const wrongPos = [];
            for (let i = 0; i < ansStr.length; i++) {
                const inp = document.getElementById(`algo-ans-${i}`);
                if (!inp) continue;
                const ok = inp.value.trim() === ansStr[i];
                inp.classList.remove('cell-wrong', 'cell-right');
                void inp.offsetWidth;
                inp.classList.add(ok ? 'cell-right' : 'cell-wrong');
                if (!ok) wrongPos.push(ansStr.length - 1 - i);
            }
            const placeNames = ['entalen', 'tiotalen', 'hundratalen', 'tusentalen'];
            const placeMsg = wrongPos.length === 1
                ? ` Felet sitter i <strong>${placeNames[wrongPos[0]]}</strong> – den röda rutan!`
                : ' De röda rutorna visar exakt var det blev fel!';
            const ahaTip = diagnoseAlgoMistake(userVal, a, b, op, answer);
            showAlgoOwl(ahaTip
                ? ahaTip + placeMsg
                : `🤔 Det blev ${userStr}, men rätt svar är ${answer}.${placeMsg} Kika på talsorterna och försök igen!`);
        }
    } else {
        let foundRowVal = null;
        if (op === 'div') {
            // Trappan: svaret står efter = – nämnaren före = räknas inte med.
            for (let r = 9; r >= 0 && foundRowVal === null; r--) {
                let afterEq = false, digits = '';
                for (let c = 0; c < 8; c++) {
                    const el = document.getElementById(`blank-cell-${r}-${c}`);
                    if (!el) continue;
                    const ch = el.value.trim();
                    if (ch === '=') { afterEq = true; continue; }
                    if (afterEq && /^[0-9]+$/.test(ch) && !el.classList.contains('digit-struck')) digits += ch;
                }
                if (afterEq && digits) foundRowVal = parseInt(digits, 10);
            }
        }
        if (foundRowVal === null) {
            for (let r = 9; r >= 0; r--) {
                let rowDigits = '';
                for (let c = 0; c < 8; c++) {
                    const el = document.getElementById(`blank-cell-${r}-${c}`);
                    if (el && !el.classList.contains('digit-struck')) {
                        const ch = el.value.trim();
                        // ×-rutor kan ha minnessiffra + svarssiffra ("57") —
                        // svaret är alltid den sista siffran i rutan.
                        if (/^[0-9]+$/.test(ch)) rowDigits += ch.slice(-1);
                    }
                }
                if (rowDigits.length > 0) {
                    // Minnessiffror "vid sidan" (i samma ruta eller i rutan till
                    // vänster) räknas inte med – svaret är radens sista siffror.
                    foundRowVal = parseInt(rowDigits.slice(-ansStr.length), 10);
                    break;
                }
            }
        }
        if (foundRowVal === null) {
            showAlgoOwl('✏️ Skriv upp talen och ditt svar längst ner på rutpappret!');
            return;
        }
        if (foundRowVal === answer) {
            addReward(2);
            showFeedback('algo-feedback', true, `🌟 Grymt jobbat på eget rutpapper! ${answer} är helt rätt!`);
            document.getElementById('algo-next-wrap').classList.remove('hidden');
        } else {
            resetStreak();
            const ahaTip = diagnoseAlgoMistake(foundRowVal, a, b, op, answer);
            showAlgoOwl(ahaTip || `🤔 ${op === 'div' ? 'Svaret efter =' : 'Nedersta raden'} visar ${foundRowVal}, men rätt svar är ${answer}. Kolla raderna och försök igen!`);
        }
    }
}
