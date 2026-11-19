// js/modules/geo.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { formatNumSv, randInt, showFeedback, shuffleArray } from '../utils.js';

/* =============================================================
   15. MODUL 12: GEOMETRI (AREA & OMKRETS)
============================================================== */
export function setGeoSubMode(mode) {
    playSound('click');
    state.geoSubMode = mode;
    ['mix', 'rect', 'tri', 'circle', 'build'].forEach(m => {
        const btn = document.getElementById(`geo-sub-${m}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (m === mode ? 'bg-fuchsia-600 text-white' : 'bg-white border border-fuchsia-200 text-slate-700');
    });
    generateGeoQuestion();
}

export function generateGeoQuestion() {
    document.getElementById('geo-feedback').classList.add('hidden');
    document.getElementById('geo-next-wrap').classList.add('hidden');

    const isHard = state.difficulty === 'hard';
    let shape = state.geoSubMode;

    const modeToggle = document.getElementById('geo-mode-choice');
    if (modeToggle) modeToggle.parentElement.classList.remove('hidden');

    if (shape === 'build') {
        // CPA-läge: eleven klickar rutor för att bygga en figur med mål-arean.
        // Lätt = fri form (area = antal rutor). Medel/utmaning = måste vara
        // en rektangel, så eleven upptäcker faktorpar och area = rader × kolumner.
        const cols = 7, rows = 5;
        const needRect = state.difficulty !== 'easy';
        let target;
        if (needRect) {
            // Slumpa en rektangel som får plats – svaret kan byggas på flera sätt!
            const rh = isHard ? randInt(2, 5) : randInt(2, 3);
            const rw = isHard ? randInt(3, 7) : randInt(3, 6);
            target = rh * rw;
        } else {
            target = randInt(5, 12);
        }
        state.currentGeo = { mode: 'build', target, cols, rows, cells: new Set(), needRect };
        document.getElementById('geo-mode-badge').textContent = '🧱 Bygg själv';
        document.getElementById('geo-question-text').innerHTML = needRect
            ? `Bygg en <strong>rektangel</strong> med arean <strong>${target} rutor</strong> – tryck ett hörn och <strong>dra</strong> ut den!`
            : `Bygg en figur med arean <strong>${target} rutor</strong> – klicka på rutorna!`;
        document.getElementById('geo-sub-note').textContent = needRect
            ? '💡 Dra från ett hörn till motsatt hörn – eller tryck hörn för hörn. Rader × kolumner = ' + target + '!'
            : '💡 Alla former räknas – area är bara antalet rutor!';
        if (modeToggle) modeToggle.parentElement.classList.add('hidden');
        document.getElementById('geo-options').classList.add('hidden');
        document.getElementById('geo-type-wrap').classList.add('hidden');
        setHintSteps('geo', needRect ? [
            `<p>En rektangels area = <strong>rader × kolumner</strong>. Fråga dig: vilket tal gånger vilket tal blir ${target}?</p>`,
            `<p>Till exempel ${target} = ${factorText(target)}. Fyll en hel rektangel – utan hål eller utstickande rutor!</p>`
        ] : [
            `<p><strong>Area = antal rutor.</strong> Klicka på exakt <strong>${target} rutor</strong> – vilken form som helst duger!</p>`,
            `<p>Knep: en rektangel är lätt att räkna! Till exempel ${target} = ${factorText(target)}.</p>`
        ]);
        // Drag-lyssnare på containern: pekarrörelse uppdaterar förhandsgranskningen,
        // släpp låser rektangeln (eller växlar till "vänta på hörn 2"-läge).
        const container = document.getElementById('geo-visual-container');
        container.onpointermove = (ev) => {
            const c = state.currentGeo;
            if (!c || c.mode !== 'build' || !c.needRect || c.anchor == null || (!c.down && !c.waiting)) return;
            const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest?.('[data-cell]');
            if (!el) return;
            const i = +el.dataset.cell;
            if (i !== c.hover) { c.hover = i; renderGeoBuild(); }
        };
        container.onpointerup = () => {
            const c = state.currentGeo;
            if (!c || c.mode !== 'build' || !c.needRect || c.anchor == null || !c.down) return;
            c.down = false;
            if (c.hover === c.anchor) c.waiting = true;
            else { c.cells = new Set(rectIndices(c.anchor, c.hover, c.cols)); c.anchor = c.hover = null; }
            renderGeoBuild();
        };
        renderGeoBuild();
        return;
    }

    if (shape === 'mix') shape = ['rect', 'tri', 'circle'][randInt(0, 2)];

    const isArea = Math.random() < 0.55;
    let badge, qText, subNote = '', svgHtml, answer, unit, hints;

    if (shape === 'rect') {
        const w = isHard ? [8.5, 11.5, 12.5, 14, 16][randInt(0, 4)] : randInt(3, 9);
        const h = isHard ? [4, 6, 8, 9][randInt(0, 3)] : randInt(2, 7);
        if (isArea) {
            answer = Math.round(w * h * 100) / 100;
            unit = 'cm²';
            badge = '📐 Rektangel • Area';
            qText = 'Hur stor är rektangelns area?';
            svgHtml = `
                <svg viewBox="0 0 280 175" class="w-full max-w-xs mx-auto">
                    <rect x="65" y="30" width="150" height="100" rx="6" fill="#fae8ff" stroke="#a21caf" stroke-width="3.5" />
                    <text x="140" y="152" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="16" fill="#701a75">basen = ${formatNumSv(w)} cm</text>
                    <text x="225" y="85" text-anchor="start" font-family="Fredoka" font-weight="700" font-size="16" fill="#701a75">${formatNumSv(h)} cm</text>
                </svg>
            `;
            hints = [
                `<p>Arean av en rektangel är <strong>basen × höjden</strong>.</p>`,
                `<p>Räkna ut: <strong>${formatNumSv(w)} cm × ${formatNumSv(h)} cm = ${formatNumSv(answer)} cm²</strong>!</p>`
            ];
        } else {
            answer = Math.round(2 * (w + h) * 100) / 100;
            unit = 'cm';
            badge = '📐 Rektangel • Omkrets';
            qText = 'Hur lång är rektangelns omkrets (hela vägen runt)?';
            svgHtml = `
                <svg viewBox="0 0 280 175" class="w-full max-w-xs mx-auto">
                    <rect x="65" y="30" width="150" height="100" rx="6" fill="#e0f2fe" stroke="#0284c7" stroke-width="3.5" />
                    <text x="140" y="152" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="16" fill="#0c4a6e">${formatNumSv(w)} cm</text>
                    <text x="225" y="85" text-anchor="start" font-family="Fredoka" font-weight="700" font-size="16" fill="#0c4a6e">${formatNumSv(h)} cm</text>
                </svg>
            `;
            hints = [
                `<p>En rektangel har två långsidor (<strong>${formatNumSv(w)} cm</strong>) och två kortsidor (<strong>${formatNumSv(h)} cm</strong>).</p>`,
                `<p>Lägg ihop alla fyra sidorna: <strong>${formatNumSv(w)} + ${formatNumSv(h)} + ${formatNumSv(w)} + ${formatNumSv(h)} = ${formatNumSv(answer)} cm</strong>!</p>`
            ];
        }
    } else if (shape === 'tri') {
        const base = isHard ? [7.5, 9.5, 12, 14, 16][randInt(0, 4)] : [4, 6, 8, 10][randInt(0, 3)];
        const height = isHard ? [6, 8, 9, 10][randInt(0, 3)] : randInt(3, 7);
        if (isArea) {
            answer = Math.round(((base * height) / 2) * 100) / 100;
            unit = 'cm²';
            badge = '🔺 Triangel • Area';
            qText = 'Hur stor är triangelns area?';
            svgHtml = `
                <svg viewBox="0 0 280 175" class="w-full max-w-xs mx-auto">
                    <polygon points="60,135 220,135 140,32" fill="#fef3c7" stroke="#d97706" stroke-width="3.5" stroke-linejoin="round" />
                    <line x1="140" y1="32" x2="140" y2="135" stroke="#e11d48" stroke-width="2.5" stroke-dasharray="5 4" />
                    <text x="148" y="92" font-family="Fredoka" font-weight="700" font-size="14" fill="#be123c">h = ${formatNumSv(height)} cm</text>
                    <text x="140" y="158" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="16" fill="#78350f">basen = ${formatNumSv(base)} cm</text>
                </svg>
            `;
            hints = [
                `<p>En triangel är precis <strong>hälften</strong> av en rektangel: <strong>(basen × höjden) ÷ 2</strong>.</p>`,
                `<p>Räkna ut: <strong>(${formatNumSv(base)} × ${formatNumSv(height)}) ÷ 2 = ${formatNumSv(base * height)} ÷ 2 = ${formatNumSv(answer)} cm²</strong>!</p>`
            ];
        } else {
            const s1 = isHard ? [6.5, 8.5, 11.5][randInt(0, 2)] : randInt(4, 8);
            const s2 = isHard ? [7.5, 9.5, 12.5][randInt(0, 2)] : randInt(4, 8);
            const s3 = isHard ? [8, 10, 13][randInt(0, 2)] : randInt(4, 8);
            answer = Math.round((s1 + s2 + s3) * 100) / 100;
            unit = 'cm';
            badge = '🔺 Triangel • Omkrets';
            qText = 'Hur lång är triangelns omkrets?';
            svgHtml = `
                <svg viewBox="0 0 280 175" class="w-full max-w-xs mx-auto">
                    <polygon points="60,135 220,135 130,32" fill="#fce7f3" stroke="#db2777" stroke-width="3.5" stroke-linejoin="round" />
                    <text x="82" y="80" text-anchor="end" font-family="Fredoka" font-weight="700" font-size="15" fill="#831843">${formatNumSv(s1)} cm</text>
                    <text x="188" y="80" text-anchor="start" font-family="Fredoka" font-weight="700" font-size="15" fill="#831843">${formatNumSv(s2)} cm</text>
                    <text x="140" y="158" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="15" fill="#831843">${formatNumSv(s3)} cm</text>
                </svg>
            `;
            hints = [
                `<p>Omkretsen är alla tre sidorna tillsammans.</p>`,
                `<p>Lägg ihop: <strong>${formatNumSv(s1)} + ${formatNumSv(s2)} + ${formatNumSv(s3)} = ${formatNumSv(answer)} cm</strong>!</p>`
            ];
        }
    } else {
        const piVal = isHard ? 3.14 : 3;
        subNote = `Räkna med π ≈ ${formatNumSv(piVal)}`;
        if (isArea) {
            const r = isHard ? [4, 5, 6, 10][randInt(0, 3)] : randInt(2, 5);
            answer = Math.round(r * r * piVal * 100) / 100;
            unit = 'cm²';
            badge = '⭕ Cirkel • Area';
            qText = 'Hur stor är cirkelns area?';
            svgHtml = `
                <svg viewBox="0 0 260 170" class="w-full max-w-xs mx-auto">
                    <circle cx="130" cy="85" r="58" fill="#ffe4e6" stroke="#e11d48" stroke-width="3.5" />
                    <line x1="130" y1="85" x2="188" y2="85" stroke="#0f172a" stroke-width="3" />
                    <circle cx="130" cy="85" r="4" fill="#0f172a" />
                    <text x="158" y="77" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="14" fill="#0f172a">r = ${r} cm</text>
                </svg>
            `;
            hints = [
                `<p>Cirkelns area är <strong>radien × radien × π</strong>.</p>`,
                `<p>Räkna ut: <strong>${r} × ${r} × ${formatNumSv(piVal)} = ${formatNumSv(answer)} cm²</strong>!</p>`
            ];
        } else {
            const d = isHard ? [6, 8, 12, 20][randInt(0, 3)] : [4, 6, 8, 10][randInt(0, 3)];
            answer = Math.round(d * piVal * 100) / 100;
            unit = 'cm';
            badge = '⭕ Cirkel • Omkrets';
            qText = 'Hur lång är cirkelns omkrets?';
            svgHtml = `
                <svg viewBox="0 0 260 170" class="w-full max-w-xs mx-auto">
                    <circle cx="130" cy="85" r="58" fill="#e0f2fe" stroke="#0284c7" stroke-width="3.5" />
                    <line x1="72" y1="85" x2="188" y2="85" stroke="#0f172a" stroke-width="3" />
                    <text x="130" y="77" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="14" fill="#0f172a">d = ${d} cm</text>
                </svg>
            `;
            hints = [
                `<p>Cirkelns omkrets är <strong>diametern × π</strong>.</p>`,
                `<p>Räkna ut: <strong>${d} × ${formatNumSv(piVal)} = ${formatNumSv(answer)} cm</strong>!</p>`
            ];
        }
    }

    state.currentGeo = { answer, unit };
    document.getElementById('geo-mode-badge').textContent = badge;
    document.getElementById('geo-question-text').textContent = qText;
    document.getElementById('geo-sub-note').textContent = subNote;
    document.getElementById('geo-visual-container').innerHTML = svgHtml;
    document.getElementById('geo-type-unit').textContent = unit;
    setHintSteps('geo', hints);

    const optsEl = document.getElementById('geo-options');
    const typeEl = document.getElementById('geo-type-wrap');
    if (state.inputModes.geo === 'choice') {
        optsEl.classList.remove('hidden');
        typeEl.classList.add('hidden');
        const vals = [answer];
        while (vals.length < 4) {
            const cand = Math.round((answer + [-6, -4, -2, 2, 4, 6, 8][randInt(0, 6)]) * 100) / 100;
            if (cand > 0 && !vals.some(v => Math.abs(v - cand) < 0.01)) vals.push(cand);
        }
        optsEl.innerHTML = shuffleArray(vals).map(v => `
            <button onclick="checkGeoChoice(${v})" class="btn-3d bg-white hover:bg-fuchsia-50 border-3 border-fuchsia-300 rounded-2xl py-4 font-display font-bold text-xl sm:text-2xl text-slate-900">
                ${formatNumSv(v)} ${unit}
            </button>
        `).join('');
    } else {
        optsEl.classList.add('hidden');
        typeEl.classList.remove('hidden');
        const inp = document.getElementById('geo-type-input');
        inp.value = '';
        inp.focus();
    }
}

export function checkGeoChoice(val) {
    if (!document.getElementById('geo-next-wrap').classList.contains('hidden')) return;
    const { answer, unit } = state.currentGeo;
    if (Math.abs(val - answer) < 0.02) {
        addReward(1);
        showFeedback('geo-feedback', true, `🎉 Rätt! Svaret är ${formatNumSv(answer)} ${unit}!`);
        document.getElementById('geo-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('geo-feedback', false, `🤔 Inte riktigt ${formatNumSv(val)} ${unit} – kika på formeln under "💡 Visa hur man tänker"!`);
    }
}

export function checkGeoTyped() {
    const raw = document.getElementById('geo-type-input').value.trim().replace(',', '.');
    const val = parseFloat(raw);
    if (isNaN(val)) return;
    checkGeoChoice(val);
}

function factorText(n) {
    for (let w = Math.floor(Math.sqrt(n)); w >= 2; w--) {
        if (n % w === 0) return `${w} rader × ${n / w} i varje rad`;
    }
    return `t.ex. ${n - 1} i en lång rad + 1 bredvid`;
}

// Returnerar {w, h} om cellerna bildar en fylld rektangel, annars null.
function buildRectDims(cells, cols) {
    if (cells.size === 0) return null;
    let minR = Infinity, maxR = -1, minC = Infinity, maxC = -1;
    for (const i of cells) {
        const r = Math.floor(i / cols), c = i % cols;
        if (r < minR) minR = r; if (r > maxR) maxR = r;
        if (c < minC) minC = c; if (c > maxC) maxC = c;
    }
    const w = maxC - minC + 1, h = maxR - minR + 1;
    return w * h === cells.size ? { w, h } : null;
}

// Alla cellindex i rektangeln mellan hörn a och hörn b.
function rectIndices(a, b, cols) {
    const r1 = Math.floor(a / cols), c1 = a % cols, r2 = Math.floor(b / cols), c2 = b % cols;
    const out = [];
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++)
        for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++)
            out.push(r * cols + c);
    return out;
}

// Bygg själv-läget (CPA): klicka rutor tills figuren har rätt area.
function renderGeoBuild() {
    const cur = state.currentGeo;
    // Förhandsgranska rektangeln som dras ut (ankare → pekarens cell).
    const shown = new Set(cur.cells);
    if (cur.needRect && cur.anchor != null && cur.hover != null)
        rectIndices(cur.anchor, cur.hover, cur.cols).forEach(i => shown.add(i));
    const shownRect = buildRectDims(shown, cur.cols);
    let cellsHtml = '';
    for (let r = 0; r < cur.rows; r++) {
        for (let c = 0; c < cur.cols; c++) {
            const i = r * cur.cols + c;
            const committed = cur.cells.has(i), ghost = !committed && shown.has(i), anchor = cur.anchor === i;
            const events = cur.needRect ? `data-cell="${i}" onpointerdown="geoBuildDown(${i})"` : `onclick="geoBuildClick(${i})"`;
            cellsHtml += `<button ${events} class="w-9 h-9 sm:w-11 sm:h-11 rounded-lg border-2 transition-all select-none ${committed ? 'bg-fuchsia-500 border-fuchsia-700 scale-105' : ghost ? 'bg-fuchsia-300 border-fuchsia-400 scale-105' : 'bg-fuchsia-50 hover:bg-fuchsia-100 border-fuchsia-200'} ${anchor ? 'ring-2 ring-fuchsia-600' : ''}"></button>`;
        }
    }
    document.getElementById('geo-visual-container').innerHTML = `
        <div class="w-full flex flex-col items-center">
        <div class="inline-block bg-white/80 p-3 rounded-2xl border-2 border-fuchsia-200">
            <div class="grid gap-1.5" style="grid-template-columns: repeat(${cur.cols}, minmax(0, 1fr)); touch-action: none;">${cellsHtml}</div>
        </div>
        <div class="mt-3 font-display font-bold text-lg ${shown.size === cur.target ? 'text-emerald-700' : 'text-fuchsia-900'}">
            Din figur: ${shown.size} rutor • målet: ${cur.target}
        </div>
        <div class="mt-1 font-display font-bold text-base ${shownRect && shown.size ? 'text-emerald-600' : (cur.needRect ? 'text-fuchsia-700' : 'text-slate-500')}">
            ${shownRect && shown.size ? `✨ Rektangel! ${shownRect.w} × ${shownRect.h} = ${shownRect.w * shownRect.h} rutor` : (cur.needRect && shown.size ? 'Inte en rektangel ännu – fyll hål och utstick!' : '')}
        </div>
        <button onclick="checkGeoBuild()" class="btn-3d bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-display font-bold text-lg px-7 py-2.5 rounded-2xl mt-2">Klar! ✓</button>
        </div>`;
}

// Rektangel-läget: tryck på en cell = hörn 1 (ankare). Dra eller tryck på ett
// till hörn för att låsa rektangeln. Ny gest börjar om från noll.
export function geoBuildDown(i) {
    const cur = state.currentGeo;
    if (!cur || cur.mode !== 'build' || !cur.needRect || !document.getElementById('geo-next-wrap').classList.contains('hidden')) return;
    playSound('click');
    if (cur.waiting) {
        cur.cells = new Set(rectIndices(cur.anchor, i, cur.cols));
        cur.anchor = cur.hover = null; cur.waiting = false;
    } else {
        cur.cells = new Set();
        cur.anchor = i; cur.hover = i; cur.down = true;
    }
    renderGeoBuild();
}

export function geoBuildClick(i) {
    const cur = state.currentGeo;
    if (!cur || cur.mode !== 'build' || !document.getElementById('geo-next-wrap').classList.contains('hidden')) return;
    playSound('click');
    if (cur.cells.has(i)) cur.cells.delete(i);
    else if (cur.cells.size < cur.target + 4) cur.cells.add(i);
    renderGeoBuild();
}

export function checkGeoBuild() {
    const cur = state.currentGeo;
    if (!cur || cur.mode !== 'build' || !document.getElementById('geo-next-wrap').classList.contains('hidden')) return;
    const rect = buildRectDims(cur.cells, cur.cols);
    if (cur.needRect && !rect) {
        showFeedback('geo-feedback', false, `🤔 Din figur är ingen rektangel – den får inte ha hål eller utstickande rutor!`);
        return;
    }
    if (cur.cells.size !== cur.target) {
        const diff = cur.target - cur.cells.size;
        showFeedback('geo-feedback', false, diff > 0
            ? `🤔 Nästan! Din figur har ${cur.cells.size} rutor – du behöver ${diff} till!`
            : `🤔 För många rutor! Ta bort ${-diff} ${-diff === 1 ? 'ruta' : 'rutor'}!`);
        return;
    }
    addReward(2);
    showFeedback('geo-feedback', true, rect
        ? `🎉 Perfekt! Din rektangel är ${rect.w} × ${rect.h} = ${cur.target} rutor – area = rader × kolumner!`
        : `🎉 Perfekt bygge! Din figur har arean ${cur.target} rutor – alla former med ${cur.target} rutor har samma area!`);
    document.getElementById('geo-next-wrap').classList.remove('hidden');
}
