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
        const target = isHard ? randInt(15, 30) : (state.difficulty === 'medium' ? randInt(9, 20) : randInt(5, 12));
        const cols = 7, rows = 5;
        state.currentGeo = { mode: 'build', target, cols, rows, cells: new Set() };
        document.getElementById('geo-mode-badge').textContent = '🧱 Bygg själv';
        document.getElementById('geo-question-text').innerHTML = `Bygg en figur med arean <strong>${target} rutor</strong> – klicka på rutorna!`;
        document.getElementById('geo-sub-note').textContent = '💡 Alla former räknas – area är bara antalet rutor!';
        if (modeToggle) modeToggle.parentElement.classList.add('hidden');
        document.getElementById('geo-options').classList.add('hidden');
        document.getElementById('geo-type-wrap').classList.add('hidden');
        setHintSteps('geo', [
            `<p><strong>Area = antal rutor.</strong> Klicka på exakt <strong>${target} rutor</strong> – vilken form som helst duger!</p>`,
            `<p>Knep: en rektangel är lätt att räkna! Till exempel ${target} = ${factorText(target)}.</p>`
        ]);
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

// Bygg själv-läget (CPA): klicka rutor tills figuren har rätt area.
function renderGeoBuild() {
    const cur = state.currentGeo;
    let cellsHtml = '';
    for (let r = 0; r < cur.rows; r++) {
        for (let c = 0; c < cur.cols; c++) {
            const i = r * cur.cols + c;
            const on = cur.cells.has(i);
            cellsHtml += `<button onclick="geoBuildClick(${i})" class="w-9 h-9 sm:w-11 sm:h-11 rounded-lg border-2 transition-all ${on ? 'bg-fuchsia-500 border-fuchsia-700 scale-105' : 'bg-fuchsia-50 hover:bg-fuchsia-100 border-fuchsia-200'}"></button>`;
        }
    }
    document.getElementById('geo-visual-container').innerHTML = `
        <div class="inline-block bg-white/80 p-3 rounded-2xl border-2 border-fuchsia-200">
            <div class="grid gap-1.5" style="grid-template-columns: repeat(${cur.cols}, minmax(0, 1fr));">${cellsHtml}</div>
        </div>
        <div class="mt-3 font-display font-bold text-lg ${cur.cells.size === cur.target ? 'text-emerald-700' : 'text-fuchsia-900'}">
            Din figur: ${cur.cells.size} rutor • målet: ${cur.target}
        </div>
        <button onclick="checkGeoBuild()" class="btn-3d bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-display font-bold text-lg px-7 py-2.5 rounded-2xl mt-2">Klar! ✓</button>`;
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
    if (cur.cells.size !== cur.target) {
        const diff = cur.target - cur.cells.size;
        showFeedback('geo-feedback', false, diff > 0
            ? `🤔 Nästan! Din figur har ${cur.cells.size} rutor – du behöver ${diff} till!`
            : `🤔 För många rutor! Ta bort ${-diff} ${-diff === 1 ? 'ruta' : 'rutor'}!`);
        return;
    }
    addReward(2);
    showFeedback('geo-feedback', true, `🎉 Perfekt bygge! Din figur har arean ${cur.target} rutor – alla former med ${cur.target} rutor har samma area!`);
    document.getElementById('geo-next-wrap').classList.remove('hidden');
}
