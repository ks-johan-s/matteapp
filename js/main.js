// js/main.js — entry point. Autogenererad av split.py från original.html
// Exponerar alla modulers API på window så att inline-onclick i index.html
// och globala anrop (t.ex. navigateTo('home')) funkar precis som förr.

import * as ns_core from './core.js';
import * as ns_utils from './utils.js';
import * as ns_hints from './hints.js';
import * as ns_visuals from './visuals.js';
import * as ns_sheets from './sheets.js';
import * as ns_navigation from './navigation.js';
import * as ns_addsub from './modules/addsub.js';
import * as ns_mult from './modules/mult.js';
import * as ns_algo from './modules/algo.js';
import * as ns_scale from './modules/scale.js';
import * as ns_frac from './modules/frac.js';
import * as ns_combo from './modules/combo.js';
import * as ns_decimal from './modules/decimal.js';
import * as ns_div from './modules/div.js';
import * as ns_length from './modules/length.js';
import * as ns_volweight from './modules/volweight.js';
import * as ns_clock from './modules/clock.js';
import * as ns_shop from './modules/shop.js';
import * as ns_geo from './modules/geo.js';
import * as ns_chart from './modules/chart.js';
import * as ns_avg from './modules/avg.js';
import * as ns_word from './modules/word.js';
import * as ns_seq from './modules/seq.js';
import * as ns_scratchpad from './scratchpad.js';
import * as ns_mult_table from './mult-table.js';
import * as ns_levels from './levels.js';
import * as ns_demo from './demo.js';

Object.assign(window, ns_core, ns_utils, ns_hints, ns_visuals, ns_sheets, ns_navigation, ns_addsub, ns_mult, ns_div, ns_seq, ns_algo, ns_scale, ns_frac, ns_combo, ns_decimal, ns_length, ns_volweight, ns_clock, ns_shop, ns_geo, ns_chart, ns_avg, ns_word, ns_scratchpad, ns_mult_table, ns_levels, ns_demo);

// Autofokus i svarsrutan: wrappa alla generate*Question så att fokus
// flyttas även när frågan genereras via inline-onclick ("Nästa uppgift").
for (const name of Object.keys(window)) {
    if (/^generate\w+Question$/.test(name) && typeof window[name] === 'function') {
        const orig = window[name];
        window[name] = function (...args) {
            const r = orig.apply(this, args);
            ns_core.focusAnswerInput();
            return r;
        };
    }
}
ns_core.focusAnswerInput();

/* =============================================================
   20. GLOBAL ENTER-TANGENT (SVARA / KONTROLLERA / NÄSTA)
============================================================== */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (isDemoOpen()) { demoExit(); return; }
        if (!state.currentView || state.currentView === 'home') return;
        if (state.levelModule && LEVEL_MODULES[state.levelModule]
            && state.currentView !== 'levelpicker' && state.currentView !== 'school') backToModulePicker();
        else navigateTo('home');
        return;
    }
    // Piltangenter bläddrar i 'Visa mig'-demon.
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && isDemoOpen()) {
        e.preventDefault();
        demoNav(e.key === 'ArrowRight' ? 1 : -1);
        return;
    }
    if (e.key !== 'Enter') return;
    if (isDemoOpen()) { e.preventDefault(); demoNav(1); return; }
    const v = state.currentView;
    if (!v || v === 'home' || v === 'school') return;

    if (document.activeElement && document.activeElement.id && document.activeElement.id.startsWith('sp-cell-')) {
        return;
    }

    e.preventDefault();

    if (v === 'addsub') {
        if (!document.getElementById('addsub-next-wrap').classList.contains('hidden')) generateAddSubQuestion();
        else if (state.inputModes.addsub === 'type') checkAddSubTyped();
    } else if (v === 'mult') {
        if (!document.getElementById('mult-next-wrap').classList.contains('hidden')) generateMultQuestion();
        else if (state.inputModes.mult === 'type') checkMultTyped();
    } else if (v === 'div') {
        if (!document.getElementById('div-next-wrap').classList.contains('hidden')) generateDivQuestion();
        else if (state.inputModes.div === 'type') checkDivTyped();
    } else if (v === 'seq') {
        if (!document.getElementById('seq-next-wrap').classList.contains('hidden')) generateSeqQuestion();
        else if (state.inputModes.seq === 'type') checkSeqTyped();
    } else if (v === 'frac') {
        if (!document.getElementById('frac-next-wrap').classList.contains('hidden')) generateFracQuestion();
        else if (state.currentFrac && state.currentFrac.type === 'twins') checkFracTwins();
        else if (state.inputModes.frac === 'type') checkFracTyped();
    } else if (v === 'algo') {
        if (!document.getElementById('algo-next-wrap').classList.contains('hidden')) generateAlgoQuestion();
        else checkAlgoAnswer();
    } else if (v === 'combo') {
        if (!document.getElementById('combo-next-wrap').classList.contains('hidden')) generateComboQuestion();
        else if (state.inputModes.combo === 'type') checkComboTyped();
    } else if (v === 'clock') {
        if (!document.getElementById('clock-next-wrap').classList.contains('hidden')) generateClockQuestion();
    } else if (v === 'scale') {
        if (!document.getElementById('scale-next-wrap').classList.contains('hidden')) generateScaleQuestion();
    } else if (v === 'length') {
        if (!document.getElementById('length-next-wrap').classList.contains('hidden')) generateLengthQuestion();
        else if (state.inputModes.length === 'type') checkLengthTyped();
    } else if (v === 'word') {
        if (!document.getElementById('word-next-wrap').classList.contains('hidden')) generateWordQuestion();
        else checkWordAnswer();
    } else if (v === 'geo') {
        if (!document.getElementById('geo-next-wrap').classList.contains('hidden')) generateGeoQuestion();
        else if (state.inputModes.geo === 'type') checkGeoTyped();
    } else if (v === 'volweight') {
        if (!document.getElementById('volweight-next-wrap').classList.contains('hidden')) generateVolWeightQuestion();
        else if (state.inputModes.volweight === 'type') checkVolWeightTyped();
    } else if (v === 'decimal') {
        if (!document.getElementById('decimal-next-wrap').classList.contains('hidden')) generateDecimalQuestion();
        else if (state.currentDecimal && state.currentDecimal.mode === 'place') checkDecimalPlaced();
        else if (state.inputModes.decimal === 'type') checkDecimalTyped();
    } else if (v === 'shop') {
        if (!document.getElementById('shop-next-wrap').classList.contains('hidden')) generateShopQuestion();
        else checkShopAnswer();
    } else if (v === 'chart') {
        if (!document.getElementById('chart-next-wrap').classList.contains('hidden')) generateChartQuestion();
        else if (state.inputModes.chart === 'type') checkChartTyped();
    } else if (v === 'avg') {
        if (!document.getElementById('avg-next-wrap').classList.contains('hidden')) generateAvgQuestion();
        else if (state.inputModes.avg === 'type') checkAvgTyped();
    }
});

/* =============================================================
   21. INITIERING VID SIDLADDNING
============================================================== */

// Läser tillbaka sparad state och synkar alla knappar/lägen med den.
// Setterna återanvänds för att styla UI:t – ljudet stängs av tillfälligt
// eftersom Web Audio inte får starta utan användargest.
function restoreSavedState() {
    const saved = loadState();
    if (!saved) return;
    const { inputModes: savedInputModes, hintSteps: savedHintSteps, ...rest } = saved;
    Object.assign(state, rest);
    if (savedInputModes) Object.assign(state.inputModes, savedInputModes);
    if (savedHintSteps) Object.assign(state.hintSteps, savedHintSteps);

    const hadSound = state.soundOn;
    state.soundOn = false;
    try {
        setDifficulty(state.difficulty);
        setAddSubMode(state.addSubMode);
        setSelectedTable(state.selectedTable);
        setMultMissing(!!state.multMissing);
        setComboHands(!!state.comboHands);
        setScaleHands(!!state.scaleHands);
        setDivSubMode(state.divSubMode);
        setSeqSubMode(state.seqSubMode);
        setAlgoOp(state.algoOp);
        setAlgoSheetMode(state.algoSheetMode);
        setFracSubMode(state.fracSubMode);
        setClockSubMode(state.clockSubMode);
        setLengthSubMode(state.lengthSubMode);
        setWordCategory(state.wordCategory);
        setGeoSubMode(state.geoSubMode);
        setVolWeightSubMode(state.volWeightSubMode);
        setDecimalSubMode(state.decimalSubMode);
        setShopSubMode(state.shopSubMode);
        setChartSubMode(state.chartSubMode);
        setAvgSubMode(state.avgSubMode);
        for (const m of Object.keys(state.inputModes)) {
            if (state.inputModes[m]) setInputMode(m, state.inputModes[m]);
        }
        setScratchpadTab(state.scratchpadTab || 'grid');
        if (state.scratchpadOpen) {
            const sec = document.getElementById('docked-scratchpad');
            const btn = document.getElementById('scratchpad-toggle-btn');
            if (sec) sec.classList.remove('hidden');
            if (btn) btn.classList.add('ring-2', 'ring-sky-500');
        }
    } catch (err) {
        console.warn('Kunde inte återställa alla sparade inställningar.', err);
    }
    state.soundOn = hadSound;

    const sb = document.getElementById('sound-btn');
    if (sb) sb.textContent = state.soundOn ? '🔊' : '🔇';
    if (state.focusMode) {
        document.body.classList.add('focus-mode-active');
        const fb = document.getElementById('focus-mode-btn');
        if (fb) {
            fb.className = 'w-9 h-9 rounded-2xl flex items-center justify-center text-base bg-teal-600 border border-teal-700 text-white';
        }
    }
    const sc = document.getElementById('star-count');
    if (sc) sc.textContent = state.stars;
    const stc = document.getElementById('streak-count');
    if (stc) stc.textContent = state.streak;
}

window.onload = function () {
    buildMultHelperTable();
    buildScratchpadGrid();
    initScratchpadCanvas();
    restoreSavedState();
    const startView = state.currentView && state.currentView !== 'home' && document.getElementById(`view-${state.currentView}`) ? state.currentView : 'home';
    navigateTo(startView);
};
    
