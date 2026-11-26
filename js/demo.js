// js/demo.js — delad "Visa mig"-motor: stegvisa animerade genomgångar
// som spelas upp i en overlay ovanför aktivitetsvyn. Varje modul
// tillhandahåller en stegbyggare som returnerar { steps, onExit }.
import { playSound } from './core.js';
import { runStepFlights } from './visuals.js';
import { buildAlgoDemoSteps, generateAlgoQuestion } from './modules/algo.js';
import { buildFracDemoSteps } from './modules/frac.js';
import { buildClockDemoSteps } from './modules/clock.js';
import { buildConnDemoSteps } from './modules/conn.js';
import { buildMultDemoSteps } from './modules/mult.js';
import { buildDecimalDemoSteps } from './modules/decimal.js';
import { buildDivDemoSteps } from './modules/div.js';
import { buildGeoDemoSteps } from './modules/geo.js';
import { buildAvgDemoSteps } from './modules/avg.js';
import { buildScaleDemoSteps } from './modules/scale.js';
import { buildComboDemoSteps } from './modules/combo.js';
import { buildLengthDemoSteps } from './modules/length.js';
import { buildVolWeightDemoSteps } from './modules/volweight.js';
import { buildShopDemoSteps } from './modules/shop.js';
import { buildChartDemoSteps } from './modules/chart.js';
import { buildSeqDemoSteps } from './modules/seq.js';
import { buildWordDemoSteps } from './modules/word.js';
import { buildNp6DemoSteps } from './modules/np6.js';
import { buildNpdDemoSteps } from './modules/npd.js';

// Stegbyggare per modul. onExit körs när eleven väljer "Öva själv nu!"
// (algo genererar om frågan så demon inte råkar visa övningens svar).
const DEMO_BUILDERS = {
    algo: { build: buildAlgoDemoSteps, onExit: () => generateAlgoQuestion() },
    frac: { build: buildFracDemoSteps },
    clock: { build: buildClockDemoSteps },
    conn: { build: buildConnDemoSteps },
    mult: { build: buildMultDemoSteps },
    decimal: { build: buildDecimalDemoSteps },
    div: { build: buildDivDemoSteps },
    geo: { build: buildGeoDemoSteps },
    avg: { build: buildAvgDemoSteps },
    scale: { build: buildScaleDemoSteps },
    combo: { build: buildComboDemoSteps },
    length: { build: buildLengthDemoSteps },
    volweight: { build: buildVolWeightDemoSteps },
    shop: { build: buildShopDemoSteps },
    chart: { build: buildChartDemoSteps },
    seq: { build: buildSeqDemoSteps },
    word: { build: buildWordDemoSteps },
    np6: { build: buildNp6DemoSteps },
    npd: { build: buildNpdDemoSteps },
};

// Demo-state hålls utanför `state` – det är flyktigt och ska inte
// sparas till localStorage.
let demo = null; // { steps: [{text, html}], idx, playing, timer, onExit }

export function isDemoOpen() {
    return !!demo;
}

export function startModuleDemo(key) {
    const def = DEMO_BUILDERS[key];
    if (!def) return false;
    const built = def.build();
    if (!built || !built.steps || !built.steps.length) return false;
    closeDemo();
    demo = { steps: built.steps, idx: 0, playing: false, timer: null, onExit: def.onExit || null, solved: false };
    document.getElementById('demo-overlay').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    // Skelettet byggs en gång – stegbyten uppdaterar bara innehållet,
    // så inget "blinkar" mellan stegen.
    document.getElementById('demo-card').innerHTML = `
        <div class="bg-violet-50 border-2 border-violet-200 rounded-3xl p-4 sm:p-6 text-center shadow-2xl">
            <div class="flex items-center justify-center gap-2 mb-2">
                <span id="demo-badge" class="inline-block px-4 py-1 rounded-full bg-violet-500 text-white text-xs font-extrabold"></span>
                <button onclick="demoExit()" title="Stäng"
                    class="w-7 h-7 rounded-full bg-violet-200 hover:bg-violet-300 text-violet-800 font-extrabold text-sm">✕</button>
            </div>
            <div id="demo-dots" class="flex items-center justify-center gap-1.5 mb-3"></div>
            <div id="demo-text" class="text-base sm:text-lg text-slate-800 max-w-xl mx-auto mb-3"></div>
            <div id="demo-visual" class="demo-grid-wrap"></div>
            <div id="demo-guess"></div>
            <div id="demo-done"></div>
            <div class="flex flex-wrap items-center justify-center gap-2 mt-4">
                <button id="demo-btn-prev" onclick="demoNav(-1)"
                    class="btn-3d bg-white border-2 border-violet-300 text-violet-900 font-extrabold text-sm px-4 py-2 rounded-xl disabled:opacity-40">◀ Förra</button>
                <button id="demo-btn-play" onclick="demoTogglePlay()"
                    class="btn-3d bg-violet-500 hover:bg-violet-600 text-white font-extrabold text-sm px-4 py-2 rounded-xl">▶ Spela upp</button>
                <span id="demo-btn-next"></span>
            </div>
        </div>`;
    renderDemoStep();
    return true;
}

export function closeDemo() {
    if (demo && demo.timer) clearTimeout(demo.timer);
    demo = null;
    document.querySelectorAll('.demo-fly-token').forEach(el => el.remove());
    document.getElementById('demo-overlay')?.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}



export function demoExit() {
    const onExit = demo?.onExit;
    closeDemo();
    playSound('click');
    if (onExit) onExit();
}

function stopDemoPlay() {
    if (!demo) return;
    demo.playing = false;
    if (demo.timer) { clearTimeout(demo.timer); demo.timer = null; }
}

export function demoNav(d) {
    if (!demo) return;
    stopDemoPlay();
    demo.idx = Math.max(0, Math.min(demo.steps.length - 1, demo.idx + d));
    playSound('click');
    renderDemoStep();
}

// Svarschip i "Din tur!"-steget: rätt låser upp 'Öva själv nu!',
// fel stryker chippet så eleven kan gissa om.
export function demoGuess(btn, ok) {
    if (!demo || btn.disabled) return;
    if (ok) {
        playSound('correct');
        demo.solved = true;
        renderDemoStep();
    } else {
        playSound('wrong');
        btn.disabled = true;
        btn.classList.add('opacity-40', 'line-through', 'demo-shake');
    }
}

export function demoTogglePlay() {
    if (!demo) return;
    playSound('click');
    if (demo.playing) { stopDemoPlay(); renderDemoStep(); return; }
    demo.playing = true;
    const tick = () => {
        if (!demo || !demo.playing) return;
        if (demo.idx >= demo.steps.length - 1) { stopDemoPlay(); renderDemoStep(); return; }
        demo.idx++;
        renderDemoStep();
        demo.timer = setTimeout(tick, 3200);
    };
    demo.timer = setTimeout(tick, 1400);
}

// Uppdaterar bara delarna av skelettet – texten fadar mjukt om,
// visualen swappas direkt så likadana SVG:er ser ut att "förändras"
// snarare än att blinka till.
function renderDemoStep() {
    if (!demo) return;
    const { steps, idx } = demo;
    const step = steps[idx];
    const last = idx === steps.length - 1;

    document.getElementById('demo-badge').textContent = `📺 VISA MIG · Steg ${idx + 1} av ${steps.length}`;
    document.getElementById('demo-dots').innerHTML = steps.map((_, i) =>
        `<span class="inline-block w-2 h-2 rounded-full ${i === idx ? 'bg-violet-500 scale-125' : i < idx ? 'bg-violet-300' : 'bg-violet-200'}"></span>`).join('');

    // Stegtyps-etikett ger varje genomgång samma rytm:
    // TITTA → RÄKNA MED → SE UPP! → DIN TUR.
    const kind = step.warn
        ? '<span class="demo-kind" style="background:#fcd34d;color:#78350f">⚠️ SE UPP!</span><br>'
        : step.guess
            ? '<span class="demo-kind demo-kind-you">✏️ DIN TUR</span><br>'
            : `<span class="demo-kind ${idx === 0 ? 'demo-kind-look' : 'demo-kind-count'}">${idx === 0 ? '👀 TITTA' : '🧮 RÄKNA MED'}</span><br>`;

    document.getElementById('demo-text').className =
        `text-base sm:text-lg text-slate-800 max-w-xl mx-auto mb-3 ${step.warn ? 'bg-amber-100 border-2 border-amber-400 rounded-2xl px-4 py-2.5' : ''}`;
    document.getElementById('demo-text').innerHTML =
        `<div class="demo-fade">${kind}${step.text}</div>`;

    const visEl = document.getElementById('demo-visual');
    visEl.innerHTML = step.html || '';
    // Steg-specifik rörelse: token flyger mellan celler (lån,
    // minnessiffror, omflyttade siffror). Rensa ev. kvarvarande.
    document.querySelectorAll('.demo-fly-token').forEach(el => el.remove());
    runStepFlights(step.anim, visEl);

    // Gissningszonen är alltid lika hög. När steget är löst ersätts
    // chip-raden av belöningstexten i samma zon – modalen växer inte.
    document.getElementById('demo-guess').innerHTML = demo.solved && step.doneText
        ? `<div class="demo-pop text-emerald-700 font-extrabold text-lg">${step.doneText}</div>`
        : (step.guess ? `<div class="flex flex-wrap items-center justify-center gap-2">
            ${step.guess.options.map(o => `<button onclick="demoGuess(this, ${o.ok ? 'true' : 'false'})"
                class="demo-guess-chip btn-3d border-2 font-display font-bold text-lg px-5 py-2 rounded-xl
                    bg-white border-violet-300 text-violet-900">${o.label}</button>`).join('')}
        </div>` : '');
    document.getElementById('demo-done').innerHTML = '';

    document.getElementById('demo-btn-prev').disabled = idx === 0;
    const playBtn = document.getElementById('demo-btn-play');
    playBtn.textContent = demo.playing ? '⏸ Pausa' : '▶ Spela upp';
    playBtn.className = `btn-3d ${demo.playing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-violet-500 hover:bg-violet-600'} text-white font-extrabold text-sm px-4 py-2 rounded-xl`;
    const gate = last && step.guess && !demo.solved;
    document.getElementById('demo-btn-next').innerHTML = last
        ? `<button onclick="demoExit()" ${gate ? 'disabled title="Svara på frågan först!"' : ''}
            class="btn-3d bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-sm px-5 py-2 rounded-xl ${gate ? 'opacity-40' : ''}">✏️ Öva själv nu!</button>`
        : `<button onclick="demoNav(1)" class="btn-3d bg-violet-500 hover:bg-violet-600 text-white font-extrabold text-sm px-4 py-2 rounded-xl">Nästa ▶</button>`;
}
