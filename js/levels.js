// js/levels.js — nivåtrappa per modul.
// Varje modul har en kärntrappa (steg 1, 2, 3… som blir svårare) plus en
// "Utforska"-grupp med fristående aktiviteter. Hemkorten öppnar väljaren
// först (openModule), och inne i aktiviteten visar en brödsmula modul +
// vald nivå med en "Byt nivå"-knapp tillbaka.
import { playSound, state } from './core.js';
import { closeDemo, startModuleDemo } from './demo.js';
import { navigateTo } from './navigation.js';
import { setAddSubMode, setAddSubOp } from './modules/addsub.js';
import { setDivSubMode } from './modules/div.js';
import { setMultMissing } from './modules/mult.js';
import { setAlgoOp, setAlgoSheetMode } from './modules/algo.js';
import { setSeqSubMode } from './modules/seq.js';
import { setFracSubMode } from './modules/frac.js';
import { setComboHands } from './modules/combo.js';
import { setScaleHands } from './modules/scale.js';
import { setClockSubMode } from './modules/clock.js';
import { setLengthSubMode } from './modules/length.js';
import { setVolWeightSubMode } from './modules/volweight.js';
import { setDecimalSubMode } from './modules/decimal.js';
import { setShopSubMode } from './modules/shop.js';
import { setGeoSubMode } from './modules/geo.js';
import { setChartSubMode } from './modules/chart.js';
import { setAvgSubMode } from './modules/avg.js';
import { setWordCategory } from './modules/word.js';

export const LEVEL_MODULES = {
    add: {
        title: 'Addition', icon: '➕',
        steps: [
            { icon: '🧠', label: 'Huvudräkning', desc: 'Räkna i huvudet', apply: () => { setAddSubOp('add'); setAddSubMode('mix'); return 'addsub'; } },
            { icon: '📝', label: 'Uppställning', desc: 'Skriv siffrorna i rutor', demo: true, apply: () => { setAlgoOp('add'); state.algoLevel = 'plain'; setAlgoSheetMode('guided'); return 'algo'; } },
            { icon: '🔥', label: 'Uppställning med minnessiffra', desc: 'Öva att växla tiotal', demo: true, apply: () => { setAlgoOp('add'); state.algoLevel = 'carry'; setAlgoSheetMode('guided'); return 'algo'; } },
        ],
        explore: [
            { icon: '🔢', label: 'Platsvärde', apply: () => { setAddSubOp('add'); setAddSubMode('pv'); return 'addsub'; } },
            { icon: '🐸', label: 'Hoppa själv', apply: () => { setAddSubOp('add'); setAddSubMode('jumps'); return 'addsub'; } },
            { icon: '🔟', label: 'Tiotalshopp', apply: () => { setAddSubOp('add'); setAddSubMode('tens'); return 'addsub'; } },
            { icon: '❓', label: 'Saknat tal', apply: () => { setAddSubOp('add'); setAddSubMode('missing'); return 'addsub'; } },
        ],
    },
    sub: {
        title: 'Subtraktion', icon: '➖',
        steps: [
            { icon: '🧠', label: 'Huvudräkning', desc: 'Räkna i huvudet', apply: () => { setAddSubOp('sub'); setAddSubMode('mix'); return 'addsub'; } },
            { icon: '📝', label: 'Uppställning', desc: 'Skriv siffrorna i rutor', demo: true, apply: () => { setAlgoOp('sub'); state.algoLevel = 'plain'; setAlgoSheetMode('guided'); return 'algo'; } },
            { icon: '🔥', label: 'Uppställning med lån', desc: 'Öva att växla tiotal', demo: true, apply: () => { setAlgoOp('sub'); state.algoLevel = 'carry'; setAlgoSheetMode('guided'); return 'algo'; } },
        ],
        explore: [
            { icon: '🔢', label: 'Platsvärde', apply: () => { setAddSubOp('sub'); setAddSubMode('pv'); return 'addsub'; } },
            { icon: '🐸', label: 'Hoppa själv', apply: () => { setAddSubOp('sub'); setAddSubMode('jumps'); return 'addsub'; } },
            { icon: '🔟', label: 'Tiotalshopp', apply: () => { setAddSubOp('sub'); setAddSubMode('tens'); return 'addsub'; } },
            { icon: '❓', label: 'Saknat tal', apply: () => { setAddSubOp('sub'); setAddSubMode('missing'); return 'addsub'; } },
        ],
    },
    mul: {
        title: 'Multiplikation', icon: '✖️',
        steps: [
            { icon: '🧠', label: 'Huvudräkning', desc: 'Träna tabellerna', demo: true, apply: () => { setMultMissing(false); return 'mult'; } },
            { icon: '📝', label: 'Uppställning', desc: 'Skriv siffrorna i rutor', demo: true, apply: () => { setAlgoOp('mul'); state.algoLevel = 'plain'; setAlgoSheetMode('guided'); return 'algo'; } },
            { icon: '🔥', label: 'Uppställning med minnessiffra', desc: 'Öva att växla tiotal', demo: true, apply: () => { setAlgoOp('mul'); state.algoLevel = 'carry'; setAlgoSheetMode('guided'); return 'algo'; } },
            { icon: '🧮', label: 'Uppställning × 2 siffror', desc: 'Delresultat + addition', demo: true, apply: () => { setAlgoOp('mul'); state.algoLevel = 'mul2'; setAlgoSheetMode('guided'); return 'algo'; } },
        ],
        explore: [
            { icon: '❓', label: 'Saknat faktor', apply: () => { setMultMissing(true); return 'mult'; } },
        ],
    },
    div: {
        title: 'Division', icon: '➗',
        steps: [
            { icon: '🧠', label: 'Huvudräkning', desc: 'Dela lika i huvudet', demo: true, apply: () => { setDivSubMode('share'); return 'div'; } },
            { icon: '📝', label: 'Uppställning', desc: 'Kort division utan rester', demo: true, apply: () => { setAlgoOp('div'); state.algoLevel = 'plain'; setAlgoSheetMode('guided'); return 'algo'; } },
            { icon: '🔥', label: 'Uppställning med rest', desc: 'Skriv resten litet i uppställningen', demo: true, apply: () => { setAlgoOp('div'); state.algoLevel = 'carry'; setAlgoSheetMode('guided'); return 'algo'; } },
        ],
        explore: [
            { icon: '🤲', label: 'Dela själv', apply: () => { setDivSubMode('hands'); return 'div'; } },
            { icon: '🛍️', label: 'Påsar', apply: () => { setDivSubMode('group'); return 'div'; } },
            { icon: '⚡', label: 'Snabb division', apply: () => { setDivSubMode('quick'); return 'div'; } },
            { icon: '❓', label: 'Saknat tal', apply: () => { setDivSubMode('missing'); return 'div'; } },
        ],
    },
    seq: {
        title: 'Mönster', icon: '🧩',
        steps: [
            { icon: '🎨', label: 'Formmönster', desc: 'Se vad som upprepas', apply: () => { setSeqSubMode('shapes'); return 'seq'; } },
            { icon: '🔢', label: 'Talföljder', desc: 'Hitta räkneregeln', demo: true, apply: () => { setSeqSubMode('numbers'); return 'seq'; } },
            { icon: '📈', label: 'Växande figurer', desc: 'Koppla mönster till tal', apply: () => { setSeqSubMode('grow'); return 'seq'; } },
        ],
        explore: [
            { icon: '🎲', label: 'Blandat', apply: () => { setSeqSubMode('mix'); return 'seq'; } },
        ],
    },
    frac: {
        title: 'Bråk & Procent', icon: '🍕',
        steps: [
            { icon: '🍕', label: 'Bråkform', desc: 'Läs och skriv bråk', demo: true, apply: () => { setFracSubMode('frac'); return 'frac'; } },
            { icon: '🍕🍕', label: 'Blandad form', desc: 'Hela och delar', apply: () => { setFracSubMode('mixed'); return 'frac'; } },
            { icon: '➕', label: 'Bråkräkning', desc: 'Räkna med bråk', apply: () => { setFracSubMode('arith'); return 'frac'; } },
        ],
        explore: [
            { icon: '👯', label: 'Bråktvillingar', apply: () => { setFracSubMode('twins'); return 'frac'; } },
            { icon: '💯', label: 'Procent (%)', apply: () => { setFracSubMode('percent'); return 'frac'; } },
            { icon: '💰', label: 'Procent av', apply: () => { setFracSubMode('percentof'); return 'frac'; } },
            { icon: '🎲', label: 'Blandat', apply: () => { setFracSubMode('mix'); return 'frac'; } },
        ],
    },
    combo: {
        title: 'Bråk av ett antal', icon: '🍎',
        steps: [
            { icon: '🤲', label: 'Dela själv', desc: 'Fördela i lika högar', apply: () => { setComboHands(true); return 'combo'; } },
            { icon: '🍎', label: 'Bråk av ett antal', desc: 'Hur mycket är 1/3 av 12?', demo: true, apply: () => { setComboHands(false); return 'combo'; } },
        ],
        explore: [],
    },
    scale: {
        title: 'Balansvågen', icon: '⚖️',
        steps: [
            { icon: '🤲', label: 'Väg själv', desc: 'Lägg tyngder på vågen', apply: () => { setScaleHands(true); return 'scale'; } },
            { icon: '⚖️', label: 'Balansfrågor', desc: 'Vilken tyngd saknas?', demo: true, apply: () => { setScaleHands(false); return 'scale'; } },
        ],
        explore: [],
    },
    clock: {
        title: 'Klockan', icon: '🕒',
        steps: [
            { icon: '🕒', label: 'Klockslag', desc: 'Läs av klockan', demo: true, apply: () => { setClockSubMode('read'); return 'clock'; } },
            { icon: '🖥️', label: 'Digital → Analog', desc: 'Vilken klocka visar tiden?', demo: true, apply: () => { setClockSubMode('digital'); return 'clock'; } },
            { icon: '💬', label: 'Med ord', desc: 'Kvart över, halv, kvart i…', demo: true, apply: () => { setClockSubMode('words'); return 'clock'; } },
            { icon: '⏩', label: 'Tidshopp', desc: 'Hur lång tid har gått?', apply: () => { setClockSubMode('jump'); return 'clock'; } },
        ],
        explore: [
            { icon: '🖐️', label: 'Övningsklocka', apply: () => { setClockSubMode('sandbox'); return 'clock'; } },
            { icon: '🎲', label: 'Blandat', apply: () => { setClockSubMode('mix'); return 'clock'; } },
        ],
    },
    length: {
        title: 'Längd', icon: '📏',
        steps: [
            { icon: '📏', label: 'mm ↔ cm', desc: 'Millimeter och centimeter', demo: true, apply: () => { setLengthSubMode('mmcm'); return 'length'; } },
            { icon: '📐', label: 'cm ↔ dm ↔ m', desc: 'Decimeter och meter', apply: () => { setLengthSubMode('cmdmm'); return 'length'; } },
            { icon: '🗺️', label: 'm ↔ km', desc: 'Meter och kilometer', apply: () => { setLengthSubMode('mkm'); return 'length'; } },
        ],
        explore: [
            { icon: '🎲', label: 'Blandat', apply: () => { setLengthSubMode('mix'); return 'length'; } },
        ],
    },
    volweight: {
        title: 'Vikt & Volym', icon: '⚖️',
        steps: [
            { icon: '🧪', label: 'Volym (ml–l)', desc: 'Milliliter och liter', demo: true, apply: () => { setVolWeightSubMode('vol'); return 'volweight'; } },
            { icon: '⚖️', label: 'Vikt (g–kg)', desc: 'Gram och kilogram', apply: () => { setVolWeightSubMode('weight'); return 'volweight'; } },
        ],
        explore: [
            { icon: '🎲', label: 'Blandat', apply: () => { setVolWeightSubMode('mix'); return 'volweight'; } },
        ],
    },
    decimal: {
        title: 'Decimaltal', icon: '🎯',
        steps: [
            { icon: '🔍', label: 'Läs av tallinjen', desc: 'Vilket tal pekar pilen på?', demo: true, apply: () => { setDecimalSubMode('read'); return 'decimal'; } },
            { icon: '🎯', label: 'Placera på tallinjen', desc: 'Var hör talet hemma?', apply: () => { setDecimalSubMode('place'); return 'decimal'; } },
            { icon: '🔗', label: 'Bråk & %', desc: 'Koppla decimaltal till bråk', apply: () => { setDecimalSubMode('link'); return 'decimal'; } },
            { icon: '🌡️', label: 'Negativa tal', desc: 'Tallinjen under noll', apply: () => { setDecimalSubMode('neg'); return 'decimal'; } },
        ],
        explore: [
            { icon: '🎲', label: 'Blandat', apply: () => { setDecimalSubMode('mix'); return 'decimal'; } },
        ],
    },
    shop: {
        title: 'Mattekiosken', icon: '🛒',
        steps: [
            { icon: '🛒', label: 'Betala varor', desc: 'Räkna ihop priset', demo: true, apply: () => { setShopSubMode('pay'); return 'shop'; } },
            { icon: '💵', label: 'Ge tillbaka växel', desc: 'Hur mycket får man tillbaka?', demo: true, apply: () => { setShopSubMode('change'); return 'shop'; } },
        ],
        explore: [
            { icon: '🎲', label: 'Blandat', apply: () => { setShopSubMode('mix'); return 'shop'; } },
        ],
    },
    geo: {
        title: 'Geometri', icon: '📐',
        steps: [
            { icon: '📐', label: 'Rektangel & Kvadrat', desc: 'Omkrets och area', demo: true, apply: () => { setGeoSubMode('rect'); return 'geo'; } },
            { icon: '🔺', label: 'Triangel', desc: 'Halva rektangeln', apply: () => { setGeoSubMode('tri'); return 'geo'; } },
            { icon: '⭕', label: 'Cirkel', desc: 'Radie, diameter, omkrets', apply: () => { setGeoSubMode('circle'); return 'geo'; } },
        ],
        explore: [
            { icon: '🧱', label: 'Bygg själv', apply: () => { setGeoSubMode('build'); return 'geo'; } },
            { icon: '🎲', label: 'Blandat', apply: () => { setGeoSubMode('mix'); return 'geo'; } },
        ],
    },
    chart: {
        title: 'Tabeller & Diagram', icon: '📊',
        steps: [
            { icon: '📊', label: 'Läs av stapel', desc: 'Vad visar diagrammet?', demo: true, apply: () => { setChartSubMode('read'); return 'chart'; } },
            { icon: '⚖️', label: 'Jämför & Totalt', desc: 'Skillnader och summor', apply: () => { setChartSubMode('diff'); return 'chart'; } },
        ],
        explore: [
            { icon: '🎲', label: 'Blandat', apply: () => { setChartSubMode('mix'); return 'chart'; } },
        ],
    },
    avg: {
        title: 'Medelvärde & Median', icon: '⚖️',
        steps: [
            { icon: '🧱', label: 'Jämna ut', desc: 'Fördela lika med klossar', apply: () => { setAvgSubMode('level'); return 'avg'; } },
            { icon: '⚖️', label: 'Medelvärde', desc: 'Genomsnittet av talen', demo: true, apply: () => { setAvgSubMode('mean'); return 'avg'; } },
            { icon: '🎯', label: 'Median', desc: 'Talet i mitten', apply: () => { setAvgSubMode('median'); return 'avg'; } },
            { icon: '👑', label: 'Typvärde', desc: 'Vanligaste värdet', apply: () => { setAvgSubMode('mode'); return 'avg'; } },
        ],
        explore: [
            { icon: '🎲', label: 'Blandat', apply: () => { setAvgSubMode('mix'); return 'avg'; } },
        ],
    },
    word: {
        title: 'Textuppgifter', icon: '📖',
        steps: [
            { icon: '💰', label: 'Vardagsproblem', desc: 'Pengar och flersteg', demo: true, apply: () => { setWordCategory('money'); return 'word'; } },
            { icon: '➗', label: 'Dela & Fördela', desc: 'Division i vardagen', apply: () => { setWordCategory('div'); return 'word'; } },
            { icon: '🍕', label: 'Bråk & Procent', desc: 'Delar av helheter', apply: () => { setWordCategory('frac'); return 'word'; } },
            { icon: '📐', label: 'Area & Mått', desc: 'Geometri i vardagen', apply: () => { setWordCategory('geo'); return 'word'; } },
        ],
        explore: [
            { icon: '🎲', label: 'Blandat', apply: () => { setWordCategory('all'); return 'word'; } },
            { icon: '🧪', label: 'Enheter & Volym', apply: () => { setWordCategory('units'); return 'word'; } },
            { icon: '🔢', label: 'Mönster & Medel', apply: () => { setWordCategory('patterns'); return 'word'; } },
        ],
    },
    algo: {
        title: 'Uppställning', icon: '📝',
        steps: [
            { icon: '➕', label: 'Addition', desc: 'Minnessiffra', demo: true, apply: () => { setAlgoOp('add'); state.algoLevel = ''; return 'algo'; } },
            { icon: '➖', label: 'Subtraktion', desc: 'Växling – låna', demo: true, apply: () => { setAlgoOp('sub'); state.algoLevel = ''; return 'algo'; } },
            { icon: '✖️', label: 'Multiplikation', desc: 'Minnessiffra vid sidan', demo: true, apply: () => { setAlgoOp('mul'); state.algoLevel = ''; return 'algo'; } },
            { icon: '🧮', label: 'Multiplikation ×2', desc: 'Två delresultat', demo: true, apply: () => { setAlgoOp('mul'); state.algoLevel = 'mul2'; return 'algo'; } },
            { icon: '➗', label: 'Division', desc: 'Kort division i bråkform', demo: true, apply: () => { setAlgoOp('div'); state.algoLevel = ''; return 'algo'; } },
        ],
        explore: [],
    },
};

export function openModule(key) {
    state.levelModule = key;
    renderModulePicker(key);
    navigateTo('levelpicker');
}

function stepStarsHtml(key) {
    const count = (state.stepProgress && state.stepProgress[key]) || 0;
    const stars = Math.min(3, Math.floor(count / 3));
    return `<span class="level-step-stars">${[0, 1, 2].map(i =>
        `<span class="lvl-star${i < stars ? ' on' : ''}">★</span>`).join('')}</span>`;
}

export function renderModulePicker(key) {
    const mod = LEVEL_MODULES[key];
    if (!mod) return;
    document.getElementById('levelpicker-title').textContent = `${mod.icon} ${mod.title}`;
    document.getElementById('levelpicker-steps').innerHTML = mod.steps.map((s, i) => `
        <div class="level-step-card">
            <button onclick="chooseModuleStep('steps', ${i})" class="level-step-main">
                <span class="level-step-num">${i + 1}</span>
                <span class="level-step-icon">${s.icon}</span>
                <span class="level-step-text"><strong>${s.label}</strong><small>${s.desc || ''}</small></span>
                ${stepStarsHtml(`${key}:steps:${i}`)}
            </button>
            ${s.demo ? `<button onclick="demoModuleStep('steps', ${i})" class="level-demo-btn" title="Se ett genomarbetat exempel steg för steg">▶<small>Visa mig</small></button>` : ''}
        </div>`).join('');
    const wrap = document.getElementById('levelpicker-explore-wrap');
    wrap.classList.toggle('hidden', !mod.explore.length);
    document.getElementById('levelpicker-explore').innerHTML = mod.explore.map((s, i) =>
        `<button onclick="chooseModuleStep('explore', ${i})" class="level-explore-chip">${s.icon} ${s.label}${stepStarsHtml(`${key}:explore:${i}`)}</button>`).join('');
}

export function chooseModuleStep(group, idx) {
    const mod = LEVEL_MODULES[state.levelModule];
    if (!mod) return navigateTo('home');
    const step = (group === 'steps' ? mod.steps : mod.explore)[idx];
    state.levelStepLabel = `${step.icon} ${step.label}`;
    state.levelStepKey = `${state.levelModule}:${group}:${idx}`;
    state.resumeStep = { key: state.levelModule, group, idx, label: state.levelStepLabel };
    closeDemo();
    const view = step.apply();
    navigateTo(view);
    updateLevelBreadcrumb();
}

// "Visa mig": samma steg men landar i det animerade demon istället.
export function demoModuleStep(group, idx) {
    const mod = LEVEL_MODULES[state.levelModule];
    if (!mod) return navigateTo('home');
    const step = (group === 'steps' ? mod.steps : mod.explore)[idx];
    state.levelStepLabel = `${step.icon} ${step.label}`;
    state.levelStepKey = `${state.levelModule}:${group}:${idx}`;
    state.resumeStep = { key: state.levelModule, group, idx, label: state.levelStepLabel };
    const view = step.apply();
    navigateTo(view);
    updateLevelBreadcrumb();
    startModuleDemo(view);
}

export function goModuleStep(key, group, idx) {
    state.levelModule = key;
    chooseModuleStep(group, idx);
}

// "Fortsätt där du slutade"-kortet på hemskärmen. resumeStep är en
// egen snapshot – levelStepKey nollställs nämligen när man går hem.
export function resumeLastStep() {
    const r = state.resumeStep;
    if (!r || !LEVEL_MODULES[r.key]) return;
    playSound('click');
    goModuleStep(r.key, r.group, r.idx);
}

export function renderResumeCard() {
    const wrap = document.getElementById('home-resume-wrap');
    if (!wrap) return;
    const r = state.resumeStep;
    const mod = r && LEVEL_MODULES[r.key];
    if (!mod) {
        wrap.classList.add('hidden');
        return;
    }
    wrap.classList.remove('hidden');
    wrap.innerHTML = `
        <button onclick="resumeLastStep()" class="btn-3d w-full text-left bg-gradient-to-r from-sky-50 to-indigo-50 hover:from-sky-100 hover:to-indigo-100 rounded-3xl p-4 sm:p-5 border-3 border-sky-300 flex items-center gap-4 group">
            <span class="w-11 h-11 rounded-2xl bg-sky-500 text-white flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition">▶</span>
            <span class="min-w-0">
                <span class="block text-[11px] font-extrabold uppercase tracking-wider text-sky-700">Fortsätt där du slutade</span>
                <span class="block font-display font-bold text-base sm:text-lg text-slate-900 truncate">${mod.icon} ${mod.title} · ${r.label || 'Nivå'} ${stepStarsHtml(`${r.key}:${r.group}:${r.idx}`)}</span>
            </span>
            <span class="ml-auto text-sky-600 font-extrabold text-xl shrink-0">➔</span>
        </button>`;
}

export function backToModulePicker() {
    if (state.levelModule && LEVEL_MODULES[state.levelModule]) openModule(state.levelModule);
    else navigateTo('home');
}

export function updateLevelBreadcrumb() {
    const mod = LEVEL_MODULES[state.levelModule];
    const text = mod ? `${mod.icon} ${mod.title} › ${state.levelStepLabel || 'Välj nivå'}` : '';
    const stars = state.levelStepKey ? stepStarsHtml(state.levelStepKey) : '';
    document.querySelectorAll('.level-crumb-label').forEach(el => { el.innerHTML = text + stars; });
}
