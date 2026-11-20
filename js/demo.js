// js/demo.js — delad "Visa mig"-motor: stegvisa animerade genomgångar
// som spelas upp i en overlay ovanför aktivitetsvyn. Varje modul
// tillhandahåller en stegbyggare som returnerar { steps, onExit }.
import { playSound } from './core.js';
import { buildAlgoDemoSteps, generateAlgoQuestion } from './modules/algo.js';
import { buildFracDemoSteps } from './modules/frac.js';
import { buildClockDemoSteps } from './modules/clock.js';
import { buildMultDemoSteps } from './modules/mult.js';
import { buildDecimalDemoSteps } from './modules/decimal.js';

// Stegbyggare per modul. onExit körs när eleven väljer "Öva själv nu!"
// (algo genererar om frågan så demon inte råkar visa övningens svar).
const DEMO_BUILDERS = {
    algo: { build: buildAlgoDemoSteps, onExit: () => generateAlgoQuestion() },
    frac: { build: buildFracDemoSteps },
    clock: { build: buildClockDemoSteps },
    mult: { build: buildMultDemoSteps },
    decimal: { build: buildDecimalDemoSteps },
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
    demo = { steps: built.steps, idx: 0, playing: false, timer: null, onExit: def.onExit || null };
    document.getElementById('demo-overlay').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    renderDemoStep();
    return true;
}

export function closeDemo() {
    if (demo && demo.timer) clearTimeout(demo.timer);
    demo = null;
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

function renderDemoStep() {
    if (!demo) return;
    const { steps, idx } = demo;
    const step = steps[idx];
    const last = idx === steps.length - 1;
    document.getElementById('demo-card').innerHTML = `
        <div class="bg-violet-50 border-2 border-violet-200 rounded-3xl p-4 sm:p-6 text-center shadow-2xl">
            <div class="flex items-center justify-center gap-2 mb-2">
                <span class="inline-block px-4 py-1 rounded-full bg-violet-500 text-white text-xs font-extrabold">
                    📺 VISA MIG · Steg ${idx + 1} av ${steps.length}
                </span>
                <button onclick="demoExit()" title="Stäng"
                    class="w-7 h-7 rounded-full bg-violet-200 hover:bg-violet-300 text-violet-800 font-extrabold text-sm">✕</button>
            </div>
            <div class="flex items-center justify-center gap-1.5 mb-3">
                ${steps.map((_, i) => `<span class="inline-block w-2 h-2 rounded-full ${i === idx ? 'bg-violet-500 scale-125' : i < idx ? 'bg-violet-300' : 'bg-violet-200'}"></span>`).join('')}
            </div>
            <div class="demo-fade text-base sm:text-lg text-slate-800 max-w-xl mx-auto mb-3">${step.text}</div>
            <div class="demo-fade demo-grid-wrap">${step.html}</div>
            <div class="flex flex-wrap items-center justify-center gap-2 mt-4">
                <button onclick="demoNav(-1)" ${idx === 0 ? 'disabled' : ''}
                    class="btn-3d bg-white border-2 border-violet-300 text-violet-900 font-extrabold text-sm px-4 py-2 rounded-xl disabled:opacity-40">◀ Förra</button>
                <button onclick="demoTogglePlay()"
                    class="btn-3d ${demo.playing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-violet-500 hover:bg-violet-600'} text-white font-extrabold text-sm px-4 py-2 rounded-xl">
                    ${demo.playing ? '⏸ Pausa' : '▶ Spela upp'}</button>
                ${last
                    ? `<button onclick="demoExit()" class="btn-3d bg-emerald-500 hover:bg-emerald-600 text-white font-display font-bold text-sm px-5 py-2 rounded-xl">✏️ Öva själv nu!</button>`
                    : `<button onclick="demoNav(1)" class="btn-3d bg-violet-500 hover:bg-violet-600 text-white font-extrabold text-sm px-4 py-2 rounded-xl">Nästa ▶</button>`}
            </div>
        </div>`;
}
