// js/levels.js — nivåtrappa per modul.
// Varje modul har en kärntrappa (steg 1, 2, 3… som blir svårare) plus en
// "Utforska"-grupp med fristående aktiviteter. Hemkorten öppnar väljaren
// först (openModule), och inne i aktiviteten visar en brödsmula modul +
// vald nivå med en "Byt nivå"-knapp tillbaka.
import { state } from './core.js';
import { navigateTo } from './navigation.js';

export const LEVEL_MODULES = {
    add: {
        title: 'Addition', icon: '➕',
        steps: [
            { icon: '🧠', label: 'Huvudräkning', desc: 'Räkna i huvudet', apply: () => { state.addsubOp = 'add'; state.addSubMode = 'mix'; return 'addsub'; } },
            { icon: '📝', label: 'Uppställning', desc: 'Skriv siffrorna i rutor', apply: () => { state.algoOp = 'add'; state.algoLevel = 'plain'; state.algoSheetMode = 'guided'; return 'algo'; } },
            { icon: '🔥', label: 'Uppställning med minnessiffra', desc: 'Öva att växla tiotal', apply: () => { state.algoOp = 'add'; state.algoLevel = 'carry'; state.algoSheetMode = 'guided'; return 'algo'; } },
        ],
        explore: [
            { icon: '🔢', label: 'Platsvärde', apply: () => { state.addsubOp = 'add'; state.addSubMode = 'pv'; return 'addsub'; } },
            { icon: '🐸', label: 'Hoppa själv', apply: () => { state.addsubOp = 'add'; state.addSubMode = 'jumps'; return 'addsub'; } },
            { icon: '🔟', label: 'Tiotalshopp', apply: () => { state.addsubOp = 'add'; state.addSubMode = 'tens'; return 'addsub'; } },
            { icon: '❓', label: 'Saknat tal', apply: () => { state.addsubOp = 'add'; state.addSubMode = 'missing'; return 'addsub'; } },
        ],
    },
    sub: {
        title: 'Subtraktion', icon: '➖',
        steps: [
            { icon: '🧠', label: 'Huvudräkning', desc: 'Räkna i huvudet', apply: () => { state.addsubOp = 'sub'; state.addSubMode = 'mix'; return 'addsub'; } },
            { icon: '📝', label: 'Uppställning', desc: 'Skriv siffrorna i rutor', apply: () => { state.algoOp = 'sub'; state.algoLevel = 'plain'; state.algoSheetMode = 'guided'; return 'algo'; } },
            { icon: '🔥', label: 'Uppställning med lån', desc: 'Öva att växla tiotal', apply: () => { state.algoOp = 'sub'; state.algoLevel = 'carry'; state.algoSheetMode = 'guided'; return 'algo'; } },
        ],
        explore: [
            { icon: '🔢', label: 'Platsvärde', apply: () => { state.addsubOp = 'sub'; state.addSubMode = 'pv'; return 'addsub'; } },
            { icon: '🐸', label: 'Hoppa själv', apply: () => { state.addsubOp = 'sub'; state.addSubMode = 'jumps'; return 'addsub'; } },
            { icon: '🔟', label: 'Tiotalshopp', apply: () => { state.addsubOp = 'sub'; state.addSubMode = 'tens'; return 'addsub'; } },
            { icon: '❓', label: 'Saknat tal', apply: () => { state.addsubOp = 'sub'; state.addSubMode = 'missing'; return 'addsub'; } },
        ],
    },
    mul: {
        title: 'Multiplikation', icon: '✖️',
        steps: [
            { icon: '🧠', label: 'Huvudräkning', desc: 'Träna tabellerna', apply: () => { state.multMissing = false; return 'mult'; } },
            { icon: '📝', label: 'Uppställning', desc: 'Skriv siffrorna i rutor', apply: () => { state.algoOp = 'mul'; state.algoLevel = 'plain'; state.algoSheetMode = 'guided'; return 'algo'; } },
            { icon: '🔥', label: 'Uppställning med minnessiffra', desc: 'Öva att växla tiotal', apply: () => { state.algoOp = 'mul'; state.algoLevel = 'carry'; state.algoSheetMode = 'guided'; return 'algo'; } },
        ],
        explore: [
            { icon: '❓', label: 'Saknat faktor', apply: () => { state.multMissing = true; return 'mult'; } },
        ],
    },
    div: {
        title: 'Division', icon: '➗',
        steps: [
            { icon: '🧠', label: 'Huvudräkning', desc: 'Dela lika i huvudet', apply: () => { state.divSubMode = 'share'; return 'div'; } },
            { icon: '📝', label: 'Uppställning', desc: 'Kort division utan rester', apply: () => { state.algoOp = 'div'; state.algoLevel = 'plain'; state.algoSheetMode = 'guided'; return 'algo'; } },
            { icon: '🔥', label: 'Uppställning med rest', desc: 'Skriv minnessiffror i trappan', apply: () => { state.algoOp = 'div'; state.algoLevel = 'carry'; state.algoSheetMode = 'guided'; return 'algo'; } },
        ],
        explore: [
            { icon: '🤲', label: 'Dela själv', apply: () => { state.divSubMode = 'hands'; return 'div'; } },
            { icon: '🛍️', label: 'Påsar', apply: () => { state.divSubMode = 'group'; return 'div'; } },
            { icon: '⚡', label: 'Snabb division', apply: () => { state.divSubMode = 'quick'; return 'div'; } },
            { icon: '❓', label: 'Saknat tal', apply: () => { state.divSubMode = 'missing'; return 'div'; } },
        ],
    },
    algo: {
        title: 'Uppställning', icon: '📝',
        steps: [
            { icon: '➕', label: 'Addition', desc: 'Minnessiffra', apply: () => { state.algoOp = 'add'; state.algoLevel = ''; return 'algo'; } },
            { icon: '➖', label: 'Subtraktion', desc: 'Växling – låna', apply: () => { state.algoOp = 'sub'; state.algoLevel = ''; return 'algo'; } },
            { icon: '✖️', label: 'Multiplikation', desc: 'Minnessiffra på multiplikatorraden', apply: () => { state.algoOp = 'mul'; state.algoLevel = ''; return 'algo'; } },
            { icon: '➗', label: 'Division', desc: 'Kort division – trappan', apply: () => { state.algoOp = 'div'; state.algoLevel = ''; return 'algo'; } },
        ],
        explore: [],
    },
};

export function openModule(key) {
    state.levelModule = key;
    renderModulePicker(key);
    navigateTo('levelpicker');
}

export function renderModulePicker(key) {
    const mod = LEVEL_MODULES[key];
    if (!mod) return;
    document.getElementById('levelpicker-title').textContent = `${mod.icon} ${mod.title}`;
    document.getElementById('levelpicker-steps').innerHTML = mod.steps.map((s, i) => `
        <button onclick="chooseModuleStep('steps', ${i})" class="level-step-card">
            <span class="level-step-num">${i + 1}</span>
            <span class="level-step-icon">${s.icon}</span>
            <span class="level-step-text"><strong>${s.label}</strong><small>${s.desc || ''}</small></span>
        </button>`).join('');
    const wrap = document.getElementById('levelpicker-explore-wrap');
    wrap.classList.toggle('hidden', !mod.explore.length);
    document.getElementById('levelpicker-explore').innerHTML = mod.explore.map((s, i) =>
        `<button onclick="chooseModuleStep('explore', ${i})" class="level-explore-chip">${s.icon} ${s.label}</button>`).join('');
}

export function chooseModuleStep(group, idx) {
    const mod = LEVEL_MODULES[state.levelModule];
    if (!mod) return navigateTo('home');
    const step = (group === 'steps' ? mod.steps : mod.explore)[idx];
    state.levelStepLabel = `${step.icon} ${step.label}`;
    const view = step.apply();
    navigateTo(view);
    updateLevelBreadcrumb();
}

export function backToModulePicker() {
    if (state.levelModule && LEVEL_MODULES[state.levelModule]) openModule(state.levelModule);
    else navigateTo('home');
}

export function updateLevelBreadcrumb() {
    const mod = LEVEL_MODULES[state.levelModule];
    const text = mod ? `${mod.icon} ${mod.title} › ${state.levelStepLabel || 'Välj nivå'}` : '';
    document.querySelectorAll('.level-crumb-label').forEach(el => { el.textContent = text; });
}
