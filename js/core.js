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
        btn.className = state.focusMode
            ? 'btn-3d bg-teal-600 border-2 border-teal-700 text-white px-2.5 py-1.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-1'
            : 'btn-3d bg-teal-50 hover:bg-teal-100 border-2 border-teal-300 text-teal-900 px-2.5 py-1.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-1';
        btn.innerHTML = state.focusMode
            ? '<span>🧘</span><span class="hidden sm:inline">Avsluta lugn vy</span>'
            : '<span>🧘</span><span class="hidden lg:inline">Lugn vy</span>';
    }
}

export function addReward(points = 1) {
    playSound('correct');
    state.stars += points;
    state.streak += 1;
    document.getElementById('star-count').textContent = state.stars;
    document.getElementById('streak-count').textContent = state.streak;
    saveState();
}

export function resetStreak() {
    playSound('wrong');
    state.streak = 0;
    document.getElementById('streak-count').textContent = '0';
    saveState();
}
