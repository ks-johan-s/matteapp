// js/core.js — autogenererad av split.py från original.html

/* =============================================================
   1. GLOBAL STATE & LJUDMOTOR (WEB AUDIO API)
============================================================== */
export const state = {
    currentView: 'home',
    difficulty: 'easy',
    focusMode: false,
    stars: 0,
    streak: 0,
    soundOn: true,
    inputModes: {
        addsub: 'choice',
        mult: 'choice',
        div: 'choice',
        seq: 'choice',
        frac: 'choice',
        combo: 'choice',
        length: 'choice',
        geo: 'choice',
        volweight: 'choice',
        decimal: 'choice',
        chart: 'choice',
        avg: 'choice'
    },
    hintSteps: {
        addsub: 1,
        mult: 1,
        div: 1,
        seq: 1,
        frac: 1,
        algo: 1,
        combo: 1,
        clock: 1,
        scale: 1,
        length: 1,
        word: 1,
        geo: 1,
        volweight: 1,
        decimal: 1,
        shop: 1,
        chart: 1,
        avg: 1
    },
    addSubMode: 'mix',
    addsubOp: 'add',
    levelModule: null,
    levelStepLabel: '',
    levelStepKey: '',
    resumeStep: null,
    stepProgress: {},
    algoLevel: '',
    currentAddSub: null,
    selectedTable: 'all',
    currentMult: null,
    divSubMode: 'mix',
    multMissing: false,
    comboHands: false,
    scaleHands: false,
    currentDiv: null,
    seqSubMode: 'mix',
    currentSeq: null,
    fracSubMode: 'mix',
    currentFrac: null,
    twinSelected: [],
    algoOp: 'add',
    algoSheetMode: 'guided',
    currentAlgo: null,
    algoLoans: {},
    blankStrikeMode: false,
    lastFocusedCellId: null,
    currentCombo: null,
    clockSubMode: 'mix',
    currentClock: null,
    sandboxHours: 3,
    sandboxMinutes: 0,
    sandboxIsPM: false,
    sandboxTarget: null,
    currentScale: null,
    lengthSubMode: 'mix',
    currentLength: null,
    wordCategory: 'all',
    currentWord: null,
    wordLineRows: {},
    geoSubMode: 'mix',
    currentGeo: null,
    volWeightSubMode: 'mix',
    currentVolWeight: null,
    decimalSubMode: 'mix',
    currentDecimal: null,
    decimalSliderVal: 0,
    shopSubMode: 'mix',
    currentShop: null,
    shopTray: [],
    chartSubMode: 'mix',
    currentChart: null,
    avgSubMode: 'mix',
    currentAvg: null,
    connSubMode: 'mix',
    np6SubMode: 'compare',
    npdSubMode: 'compare',
    probSubMode: 'box',
    currentConn: null,
    scratchpadOpen: false,
    scratchpadTab: 'grid',
    scratchpadLineRows: {},
    lockedTableCell: null
};

/* =============================================================
   1b. SPARA FRAMSTEG I WEBBLÄSAREN (LOCALSTORAGE, INGET KONTO)
============================================================== */
const SAVE_KEY = 'matteaventyr-save-v1';

export function saveState() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {}
}

export function loadState() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) {
        return null;
    }
}

// Spara automatiskt när sidan lämnas/göms och regelbundet (lägesval, inställningar).
window.addEventListener('pagehide', saveState);
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveState();
});
setInterval(saveState, 4000);

export let audioCtx = null;

export function playSound(type) {
    if (!state.soundOn) return;
    try {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(520, now);
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
            osc.start(now);
            osc.stop(now + 0.06);
        } else if (type === 'correct') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.09);
            osc.frequency.setValueAtTime(783.99, now + 0.18);
            gain.gain.setValueAtTime(0.14, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
            osc.start(now);
            osc.stop(now + 0.36);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.linearRampToValueAtTime(165, now + 0.22);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
            osc.start(now);
            osc.stop(now + 0.24);
        }
    } catch (e) {}
}

export function toggleSound() {
    state.soundOn = !state.soundOn;
    document.getElementById('sound-btn').textContent = state.soundOn ? '🔊' : '🔇';
}

export function toggleFocusMode() {
    playSound('click');
    state.focusMode = !state.focusMode;
    document.body.classList.toggle('focus-mode-active', state.focusMode);
    const btn = document.getElementById('focus-mode-btn');
    if (btn) {
        btn.className = 'w-9 h-9 rounded-2xl flex items-center justify-center text-base ' + (state.focusMode
            ? 'bg-teal-600 border border-teal-700 text-white'
            : 'bg-teal-50 hover:bg-teal-100 border border-teal-300 text-teal-900');
    }
}

export function addReward(points = 1) {
    playSound('correct');
    state.stars += points;
    state.streak += 1;
    if (state.levelStepKey) {
        if (!state.stepProgress) state.stepProgress = {};
        state.stepProgress[state.levelStepKey] = Math.min((state.stepProgress[state.levelStepKey] || 0) + 1, 9);
        if (window.updateLevelBreadcrumb) window.updateLevelBreadcrumb();
        if (window.renderResumeCard) window.renderResumeCard();
    }
    flyStarsToCounter(Math.min(points, 3));
    document.getElementById('star-count').textContent = state.stars;
    document.getElementById('streak-count').textContent = state.streak;
    saveState();
}

// ⭐ Stjärnor flyger från det rätta svaret upp till räknaren i headern.
function flyStarsToCounter(count) {
    const badge = document.getElementById('star-count')?.parentElement;
    if (!badge) return;
    const t = badge.getBoundingClientRect();
    const view = document.getElementById(`view-${state.currentView}`);
    const origin = view?.querySelector('.opt-correct')
        || view?.querySelector('[id$="-feedback"]:not(.hidden)')
        || view?.querySelector('.rounded-3xl');
    const o = origin ? origin.getBoundingClientRect()
        : { left: innerWidth / 2 - 16, top: innerHeight / 2, width: 32, height: 32 };
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const star = document.createElement('span');
            star.className = 'flying-star';
            star.textContent = '⭐';
            star.style.left = `${o.left + o.width / 2 - 16}px`;
            star.style.top = `${o.top - 6}px`;
            document.body.appendChild(star);
            requestAnimationFrame(() => {
                const dx = t.left + t.width / 2 - (o.left + o.width / 2);
                const dy = t.top + t.height / 2 - (o.top + 8);
                star.style.transform = `translate(${dx}px, ${dy}px) scale(0.4) rotate(${Math.round(Math.random() * 30 - 15)}deg)`;
            });
            star.addEventListener('transitionend', () => {
                star.remove();
                badge.classList.remove('star-pop');
                void badge.offsetWidth;
                badge.classList.add('star-pop');
            }, { once: true });
        }, i * 150);
    }
}

// Flyttar fokus till den första synliga svarsrutan i den aktiva vyn
// (skriv-läget). Körs efter varje genererad fråga – se main.js.
export function focusAnswerInput() {
    setTimeout(() => {
        if (!document.getElementById('demo-overlay')?.classList.contains('hidden')) return;
        const view = document.getElementById(`view-${state.currentView}`);
        if (!view) return;
        const inp = view.querySelector('input[id$="-type-input"], input#word-final-input, input[id^="frac-input-"], input[id^="algo-ans-"]');
        if (inp && inp.offsetParent !== null) inp.focus({ preventScroll: true });
    }, 90);
}

export function resetStreak() {
    playSound('wrong');
    state.streak = 0;
    document.getElementById('streak-count').textContent = '0';
    saveState();
}
