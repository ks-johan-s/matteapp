// js/navigation.js — autogenererad av split.py från original.html
import { focusAnswerInput, playSound, state } from './core.js';
import { closeDemo } from './demo.js';
import { generateAddSubQuestion } from './modules/addsub.js';
import { generateAlgoQuestion } from './modules/algo.js';
import { generateAvgQuestion } from './modules/avg.js';
import { generateChartQuestion } from './modules/chart.js';
import { generateClockQuestion, renderSandboxClock } from './modules/clock.js';
import { generateConnQuestion } from './modules/conn.js';
import { generateComboQuestion } from './modules/combo.js';
import { generateDecimalQuestion } from './modules/decimal.js';
import { generateDivQuestion } from './modules/div.js';
import { generateFracQuestion } from './modules/frac.js';
import { generateGeoQuestion } from './modules/geo.js';
import { generateLengthQuestion } from './modules/length.js';
import { generateMultQuestion } from './modules/mult.js';
import { generateScaleQuestion } from './modules/scale.js';
import { generateSeqQuestion } from './modules/seq.js';
import { generateShopQuestion } from './modules/shop.js';
import { generateVolWeightQuestion } from './modules/volweight.js';
import { generateWordQuestion } from './modules/word.js';

/* =============================================================
   3. NAVIGATION, SVÅRIGHETSGRAD & SVARSLÄGE
============================================================== */
export function navigateTo(viewName) {
    playSound('click');
    state.currentView = viewName;
    closeDemo();
    if (viewName === 'home' || viewName === 'school' || viewName === 'levelpicker') state.levelStepKey = '';
    const views = ['home', 'levelpicker', 'addsub', 'mult', 'div', 'conn', 'seq', 'frac', 'algo', 'combo', 'clock', 'scale', 'length', 'word', 'geo', 'volweight', 'decimal', 'shop', 'chart', 'avg', 'school'];
    views.forEach(v => {
        const sec = document.getElementById(`view-${v}`);
        if (!sec) return;
        sec.classList.toggle('hidden', v !== viewName);
        if (v === viewName) {
            sec.classList.remove('view-enter');
            void sec.offsetWidth;
            sec.classList.add('view-enter');
        }
    });
    if (viewName === 'home' && window.renderResumeCard) window.renderResumeCard();

    if (viewName === 'addsub') generateAddSubQuestion();
    if (viewName === 'mult') generateMultQuestion();
    if (viewName === 'div') generateDivQuestion();
    if (viewName === 'conn') generateConnQuestion();
    if (viewName === 'seq') generateSeqQuestion();
    if (viewName === 'frac') generateFracQuestion();
    if (viewName === 'algo') generateAlgoQuestion();
    if (viewName === 'combo') generateComboQuestion();
    if (viewName === 'clock') {
        if (state.clockSubMode === 'sandbox') renderSandboxClock();
        else generateClockQuestion();
    }
    if (viewName === 'scale') generateScaleQuestion();
    if (viewName === 'length') generateLengthQuestion();
    if (viewName === 'word') generateWordQuestion();
    if (viewName === 'geo') generateGeoQuestion();
    if (viewName === 'volweight') generateVolWeightQuestion();
    if (viewName === 'decimal') generateDecimalQuestion();
    if (viewName === 'shop') generateShopQuestion();
    if (viewName === 'chart') generateChartQuestion();
    if (viewName === 'avg') generateAvgQuestion();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    focusAnswerInput();
}

export function setDifficulty(level) {
    playSound('click');
    state.difficulty = level;
    const styles = {
        easy: 'bg-emerald-500 text-white shadow-xs',
        medium: 'bg-amber-500 text-white shadow-xs',
        hard: 'bg-rose-500 text-white shadow-xs'
    };
    ['easy', 'medium', 'hard'].forEach(lvl => {
        const btn = document.getElementById(`diff-${lvl}`);
        if (!btn) return;
        btn.className = 'px-2.5 py-1 rounded-xl text-xs sm:text-sm font-extrabold transition ' +
            (lvl === level ? styles[lvl] : 'text-slate-600 hover:text-slate-900');
    });

    if (state.currentView === 'addsub') generateAddSubQuestion();
    if (state.currentView === 'mult') generateMultQuestion();
    if (state.currentView === 'div') generateDivQuestion();
    if (state.currentView === 'conn') generateConnQuestion();
    if (state.currentView === 'seq') generateSeqQuestion();
    if (state.currentView === 'frac') generateFracQuestion();
    if (state.currentView === 'algo') generateAlgoQuestion();
    if (state.currentView === 'combo') generateComboQuestion();
    if (state.currentView === 'clock' && state.clockSubMode !== 'sandbox') generateClockQuestion();
    if (state.currentView === 'scale') generateScaleQuestion();
    if (state.currentView === 'length') generateLengthQuestion();
    if (state.currentView === 'word') generateWordQuestion();
    if (state.currentView === 'geo') generateGeoQuestion();
    if (state.currentView === 'volweight') generateVolWeightQuestion();
    if (state.currentView === 'decimal') generateDecimalQuestion();
    if (state.currentView === 'shop') generateShopQuestion();
    if (state.currentView === 'chart') generateChartQuestion();
    if (state.currentView === 'avg') generateAvgQuestion();
}

export function setInputMode(mod, mode) {
    playSound('click');
    state.inputModes[mod] = mode;
    const cBtn = document.getElementById(`${mod}-mode-choice`);
    const tBtn = document.getElementById(`${mod}-mode-type`);
    const activeColors = {
        addsub: 'bg-emerald-600 text-white',
        mult: 'bg-orange-500 text-white',
        div: 'bg-teal-600 text-white',
        seq: 'bg-purple-600 text-white',
        frac: 'bg-pink-600 text-white',
        combo: 'bg-indigo-600 text-white',
        length: 'bg-teal-600 text-white',
        geo: 'bg-fuchsia-600 text-white',
        volweight: 'bg-lime-600 text-white',
        decimal: 'bg-blue-600 text-white',
        chart: 'bg-purple-600 text-white',
        avg: 'bg-rose-600 text-white'
    };
    if (cBtn && tBtn) {
        cBtn.className = 'px-2.5 py-1 rounded-lg text-xs font-extrabold ' + (mode === 'choice' ? activeColors[mod] : 'text-slate-600');
        tBtn.className = 'px-2.5 py-1 rounded-lg text-xs font-extrabold ' + (mode === 'type' ? activeColors[mod] : 'text-slate-600');
    }
    if (mod === 'addsub') generateAddSubQuestion();
    if (mod === 'mult') generateMultQuestion();
    if (mod === 'div') generateDivQuestion();
    if (mod === 'seq') generateSeqQuestion();
    if (mod === 'frac') generateFracQuestion();
    if (mod === 'combo') generateComboQuestion();
    if (mod === 'length') generateLengthQuestion();
    if (mod === 'geo') generateGeoQuestion();
    if (mod === 'volweight') generateVolWeightQuestion();
    if (mod === 'decimal') generateDecimalQuestion();
    if (mod === 'chart') generateChartQuestion();
    if (mod === 'avg') generateAvgQuestion();
}
