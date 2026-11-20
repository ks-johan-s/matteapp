// js/modules/algo.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { handleSheetInput, handleSheetKeyDown } from '../sheets.js';
import { randInt, showFeedback } from '../utils.js';

/* =============================================================
   6. MODUL 3: UPPSTÄLLNING (MED SPECIFICERAD AHA-FEEDBACK)
============================================================== */
// Miniatyr-uppställning i ledtråden: visar konkret vad steget gör.
// highlight = kolumn att markera (bärnstensram), struck = överstrukna
// siffror, carries = {kolumn: '10'/'1'}, showAns = antal ifyllda svartal från höger.
function algoMiniGrid(a, b, op, answer, { highlight = -1, struck = [], carries = {}, showAns = 0 } = {}) {
    const digits = Math.max(String(a).length, String(b).length, String(answer).length);
    const aStr = String(a).padStart(digits, ' ');
    const bStr = String(b).padStart(digits, ' ');
    const ansStr = String(answer).padStart(digits, ' ');
    const cols = digits + 1;
    const opSym = op === 'sub' ? '−' : (op === 'add' ? '+' : '×');
    const place = c => Math.pow(10, cols - 1 - c);
    const cell = (content, cls = '') => `<div class="math-grid-cell ${cls}">${content}</div>`;

    let h = `<div class="math-grid-paper math-grid-mini mx-auto my-1.5" style="grid-template-columns: repeat(${cols}, 34px);">`;
    for (let c = 0; c < cols; c++) h += cell(carries[c] || '', 'math-grid-carry');
    for (let c = 0; c < cols; c++) {
        const cls = [c > 0 ? `pv-col-${place(c)}` : '', struck.includes(c) ? 'digit-struck' : '', c === highlight ? 'cell-hl' : ''].join(' ');
        h += cell(c > 0 ? `<span class="pv-num pv-${place(c)}">${aStr[c - 1]}</span>` : '', cls);
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
        h += cell(c === 0 ? '' : `<span class="pv-num pv-${place(c)}">${shown ? d : '<span class="text-slate-300">?</span>'}</span>`,
            c > 0 ? `pv-col-${place(c)}` : '');
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
    state.algoLoans = {};

    const op = state.algoOp;
    const isHard = state.difficulty === 'hard';
    let a, b, answer, badge, qText, hints;

    if (op === 'sub') {
        if (isHard) {
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

            hints = [
                `<p><strong>Steg 1 (Entalen):</strong> <strong>${eTop}</strong> är mindre än <strong>${eBot}</strong>. Tryck på tiotalet <strong>${tTop}</strong> för att låna <strong>10</strong> ➔ <strong>${10 + eTop} − ${eBot} = ${(10 + eTop) - eBot}</strong>.</p>` +
                algoMiniGrid(a, b, op, answer, { highlight: 2, struck: [2], carries: { 3: '10' }, showAns: 1 }),
                `<p><strong>Steg 2 (Tiotalen):</strong> Nu finns <strong>${tTop - 1}</strong> kvar i tiotalen, vilket är mindre än <strong>${tBot}</strong>! Tryck på hundratalet <strong>${hTop}</strong> för att låna <strong>10</strong> tiotal ➔ <strong>${10 + tTop - 1} − ${tBot} = ${(10 + tTop - 1) - tBot}</strong>.</p>` +
                algoMiniGrid(a, b, op, answer, { highlight: 1, struck: [1, 2], carries: { 2: '10', 3: '10' }, showAns: 2 }),
                `<p><strong>Steg 3 (Hundratalen):</strong> Nu finns <strong>${hTop - 1}</strong> kvar längst till vänster: <strong>${hTop - 1} − ${hBot} = ${(hTop - 1) - hBot}</strong> ➔ Svaret är <strong>${answer}</strong>!</p>` +
                algoMiniGrid(a, b, op, answer, { struck: [1, 2], carries: { 2: '10', 3: '10' }, showAns: 3 })
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

            hints = [
                `<p><strong>Steg 1 (Entalen längst till höger):</strong> Vi ska ta <strong>${eTop} − ${eBot}</strong>, men ${eTop} är mindre än ${eBot}. Tryck på tiotalet <strong>${tTop}</strong> för att låna <strong>10</strong>!</p>` +
                algoMiniGrid(a, b, op, answer, { highlight: 1 }),
                `<p><strong>Steg 2:</strong> Nu har vi <strong>10 + ${eTop} = ${10 + eTop}</strong> i entalen! Räkna <strong>${10 + eTop} − ${eBot} = ${(10 + eTop) - eBot}</strong>.</p>` +
                algoMiniGrid(a, b, op, answer, { struck: [1], carries: { 2: '10' }, showAns: 1 }),
                `<p><strong>Steg 3 (Tiotalen):</strong> Eftersom vi lånade 1 tiotal från ${tTop} finns <strong>${tTop - 1}</strong> kvar där uppe. Räkna <strong>${tTop - 1} − ${tBot} = ${(tTop - 1) - tBot}</strong> ➔ Svaret blir <strong>${answer}</strong>!</p>` +
                algoMiniGrid(a, b, op, answer, { struck: [1], carries: { 2: '10' }, showAns: 2 })
            ];
        }
    } else if (op === 'add') {
        if (isHard) {
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
            hints = [
                `<p><strong>Steg 1 (Entalen):</strong> <strong>${eTop} + ${eBot} = ${eSum}</strong>. Skriv <strong>${eSum % 10}</strong> och minnessiffran <strong class="text-emerald-600">1</strong> över tiotalen.</p>` +
                algoMiniGrid(a, b, op, answer, { carries: { 2: '1' }, showAns: 1 }),
                `<p><strong>Steg 2 (Tiotalen):</strong> <strong>1 + ${tTop} + ${tBot} = ${tSum}</strong>. Skriv <strong>${tSum % 10}</strong> och minnessiffran <strong class="text-emerald-600">1</strong> över hundratalen.</p>` +
                algoMiniGrid(a, b, op, answer, { carries: { 1: '1', 2: '1' }, showAns: 2 }),
                `<p><strong>Steg 3 (Hundratalen):</strong> <strong>1 + ${hTop} + ${hBot} = ${1 + hTop + hBot}</strong> ➔ Svaret blir <strong>${answer}</strong>!</p>` +
                algoMiniGrid(a, b, op, answer, { carries: { 1: '1', 2: '1' }, showAns: 3 })
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

            hints = [
                `<p><strong>Steg 1 (Entalen längst till höger):</strong> Räkna <strong>${eTop} + ${eBot} = ${eTop + eBot}</strong>. Skriv entalet <strong>${(eTop + eBot) % 10}</strong> längst ner och minnessiffran <strong class="text-emerald-600">1</strong> över tiotalen.</p>` +
                algoMiniGrid(a, b, op, answer, { carries: { 1: '1' }, showAns: 1 }),
                `<p><strong>Steg 2 (Tiotalen):</strong> Räkna ihop minnessiffran och tiotalen: <strong>1 + ${tTop} + ${tBot} = ${1 + tTop + tBot}</strong> ➔ Svaret blir <strong>${answer}</strong>!</p>` +
                algoMiniGrid(a, b, op, answer, { carries: { 1: '1' }, showAns: 2 })
            ];
        }
    } else if (op === 'mul') {
        badge = '× Multiplikation i uppställning';
        a = isHard ? randInt(124, 348) : randInt(14, state.difficulty === 'easy' ? 29 : 48);
        b = isHard ? randInt(4, 8) : randInt(2, state.difficulty === 'easy' ? 4 : 6);
        answer = a * b;
        qText = `Räkna ut ${a} × ${b}!`;

        const eTop = a % 10;
        const rest = Math.floor(a / 10) * 10;
        const eProd = eTop * b;
        hints = [
            `<p><strong>Steg 1:</strong> Börja med entalen: <strong>${b} × ${eTop} = ${eProd}</strong>.</p>` +
            algoMiniGrid(a, b, op, answer, { highlight: Math.max(String(a).length, String(b).length, String(answer).length) }),
            `<p><strong>Steg 2:</strong> Gångra resten: <strong>${b} × ${rest} = ${b * rest}</strong>. Lägg ihop <strong>${b * rest} + ${eProd} = ${answer}</strong>!</p>` +
            algoMiniGrid(a, b, op, answer, { showAns: 99 })
        ];
    } else {
        badge = '÷ Kort division';
        b = isHard ? randInt(4, 9) : randInt(2, 5);
        answer = isHard ? randInt(42, 128) : randInt(12, state.difficulty === 'easy' ? 24 : 36);
        a = answer * b;
        qText = `Räkna ut ${a} ÷ ${b}!`;

        hints = [
            `<p><strong>Steg 1 (Från vänster i division):</strong> Dela <strong>${a}</strong> talsort för talsort med <strong>${b}</strong>. Blir det rest skriver du den som liten <strong class="text-emerald-600">minnessiffra</strong> ovanför nästa siffra!</p>`,
            `<p><strong>Steg 2:</strong> Kontrollera med multiplikation: <strong>${b} × ${answer} = ${a}</strong> ➔ Svaret är <strong>${answer}</strong>!</p>`
        ];
    }

    state.currentAlgo = { a, b, op, answer };
    document.getElementById('algo-mode-badge').textContent = badge;
    document.getElementById('algo-question-text').textContent = qText;
    document.getElementById('algo-blank-problem-label').textContent = `${a} ${op === 'sub' ? '−' : (op === 'add' ? '+' : (op === 'mul' ? '×' : '÷'))} ${b}`;
    setHintSteps('algo', hints);

    if (state.algoSheetMode === 'guided') renderGuidedAlgoGrid();
    else buildBlankAlgoSheet();
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
        // Svensk kort division ("trappan"): minnessiffror överst, täljaren
        // siffra för siffra med ETT sammanhängande streck under, och
        // nämnaren liten under första täljarsiffran – som i skolboken.
        const aStr = String(a);
        const divLen = aStr.length;
        const cols = divLen + 1 + ansStr.length;
        let html = `<div class="math-grid-paper" style="grid-template-columns: repeat(${cols}, 54px);">`;
        // Minnessifferrad: carry-rutor över täljarsiffrorna (utom första).
        for (let c = 0; c < cols; c++) {
            if (c >= 1 && c < divLen) {
                html += `<div class="math-grid-cell"><input maxlength="1" inputmode="numeric" class="math-grid-input math-grid-carry-input" placeholder="·"></div>`;
            } else {
                html += `<div class="math-grid-cell"></div>`;
            }
        }
        // Mittenraden: täljarsiffror | = | svarsrutor
        for (let c = 0; c < cols; c++) {
            if (c < divLen) {
                const place = Math.pow(10, divLen - 1 - c);
                html += `<div class="math-grid-cell pv-col-${place}"><span class="pv-num pv-${place}">${aStr[c]}</span></div>`;
            } else if (c === divLen) {
                html += `<div class="math-grid-cell text-slate-900">=</div>`;
            } else {
                const idx = c - divLen - 1;
                const place = Math.pow(10, ansStr.length - 1 - idx);
                html += `<div class="math-grid-cell pv-col-${place}">
                    <input id="algo-ans-${idx}" maxlength="1" inputmode="numeric"
                        oninput="if(this.value && document.getElementById('algo-ans-${idx + 1}')) document.getElementById('algo-ans-${idx + 1}').focus()"
                        onkeydown="algoAnsKey(event, ${idx})"
                        class="math-grid-input pv-num pv-${place}" placeholder="?">
                </div>`;
            }
        }
        // Ett sammanhängande streck under bara täljarsiffrorna.
        const linePct = (divLen / cols) * 100;
        html += `<div style="grid-column: 1 / -1; height: 4px; margin: -8px 2px 0;">
            <div style="width: calc(${linePct}% - 6px); height: 4px; background: #0f172a; border-radius: 2px;"></div>
        </div>`;
        // Nämnaren liten under första täljarsiffran.
        for (let c = 0; c < cols; c++) {
            html += `<div class="math-grid-cell ${c === 0 ? 'text-sky-700' : ''}" style="font-size: 1.15rem;">${c === 0 ? b : ''}</div>`;
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
    for (let c = 0; c < cols; c++) {
        if (op === 'sub' && c >= 2 && state.algoLoans[c - 1]) {
            html += `<div class="math-grid-cell font-hand text-emerald-600 text-xl font-bold items-end pb-1">10</div>`;
        } else if ((op === 'add' || op === 'mul') && c > 0 && c < cols - 1) {
            html += `<div class="math-grid-cell"><input maxlength="1" inputmode="numeric" class="math-grid-input math-grid-carry-input" placeholder="·"></div>`;
        } else {
            html += `<div class="math-grid-cell"></div>`;
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
            html += `
                <div class="math-grid-cell pv-col-${place}">
                    <input id="algo-ans-${idx}" maxlength="1" inputmode="numeric"
                        oninput="if(this.value && document.getElementById('algo-ans-${prevIdx}')) document.getElementById('algo-ans-${prevIdx}').focus()"
                        onkeydown="algoAnsKey(event, ${idx})"
                        class="math-grid-input pv-num pv-${place}" placeholder="?">
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
    const rows = 5, cols = 8;
    let html = `<div class="math-grid-paper" style="grid-template-columns: repeat(${cols}, 48px);">`;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cellId = `blank-cell-${r}-${c}`;
            html += `
                <div class="math-grid-cell" style="width:48px;height:48px;">
                    <input id="${cellId}" maxlength="${r === 0 ? 2 : 1}"
                        onfocus="state.lastFocusedCellId='${cellId}'"
                        onclick="if(state.blankStrikeMode){this.classList.toggle('digit-struck');}"
                        onkeydown="handleSheetKeyDown(event, '${cellId}')"
                        oninput="handleSheetInput(this, ${r})"
                        class="math-grid-input ${r === 0 ? 'math-grid-carry-input' : ''}">
                </div>
            `;
        }
        // Ett sammanhängande räknestreck under rad 2 – från ruta 1 till
        // näst sista, inte utbrutet av cellkanterna.
        if (r === 2) {
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
            showFeedback('algo-feedback', false, '✏️ Fyll i alla rutor under strecket först!');
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
            showFeedback('algo-feedback', false, ahaTip
                ? ahaTip + placeMsg
                : `🤔 Det blev ${userStr}, men rätt svar är ${answer}.${placeMsg} Kika på talsorterna och försök igen!`);
        }
    } else {
        let foundRowVal = null;
        for (let r = 4; r >= 0; r--) {
            let rowDigits = '';
            for (let c = 0; c < 8; c++) {
                const el = document.getElementById(`blank-cell-${r}-${c}`);
                if (el && !el.classList.contains('digit-struck')) {
                    const ch = el.value.trim();
                    if (/^[0-9]+$/.test(ch)) rowDigits += ch;
                }
            }
            if (rowDigits.length > 0) {
                foundRowVal = parseInt(rowDigits, 10);
                break;
            }
        }
        if (foundRowVal === null) {
            showFeedback('algo-feedback', false, '✏️ Skriv upp talen och ditt svar längst ner på rutpappret!');
            return;
        }
        if (foundRowVal === answer) {
            addReward(2);
            showFeedback('algo-feedback', true, `🌟 Grymt jobbat på eget rutpapper! ${answer} är helt rätt!`);
            document.getElementById('algo-next-wrap').classList.remove('hidden');
        } else {
            resetStreak();
            const ahaTip = diagnoseAlgoMistake(foundRowVal, a, b, op, answer);
            showFeedback('algo-feedback', false, ahaTip || `🤔 Nedersta raden visar ${foundRowVal}, men rätt svar är ${answer}. Kolla raderna och försök igen!`);
        }
    }
}
