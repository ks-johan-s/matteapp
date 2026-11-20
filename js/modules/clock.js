// js/modules/clock.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { randInt, showFeedback, shuffleArray } from '../utils.js';
import { renderClockSVG } from '../visuals.js';

export function formatDigitalTime(h, m) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function setClockSubMode(mode) {
    playSound('click');
    state.clockSubMode = mode;
    ['mix', 'read', 'jump', 'sandbox'].forEach(m => {
        const btn = document.getElementById(`clock-sub-${m}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (m === mode ? 'bg-violet-600 text-white' : 'bg-white border border-violet-200 text-slate-700');
    });
    document.getElementById('clock-quiz-card').classList.toggle('hidden', mode === 'sandbox');
    document.getElementById('clock-sandbox-card').classList.toggle('hidden', mode !== 'sandbox');
    if (mode === 'sandbox') renderSandboxClock();
    else generateClockQuestion();
}

export function generateClockQuestion() {
    document.getElementById('clock-feedback').classList.add('hidden');
    document.getElementById('clock-next-wrap').classList.add('hidden');

    const isHard = state.difficulty === 'hard';
    let mode = state.clockSubMode;
    if (mode === 'mix') mode = Math.random() < 0.55 ? 'read' : 'jump';

    const h = randInt(1, 12);
    const minsPool = state.difficulty === 'easy'
        ? [0, 30]
        : (state.difficulty === 'medium'
            ? [0, 15, 30, 45]
            : [3, 7, 12, 18, 23, 27, 34, 38, 42, 47, 53, 58]);
    const m = minsPool[randInt(0, minsPool.length - 1)];

    if (mode === 'read') {
        const isAfternoon = isHard && Math.random() < 0.65;
        const dispH = isAfternoon ? (h === 12 ? 12 : h + 12) : (isHard && h === 12 ? 0 : h);
        const ansStr = formatDigitalTime(dispH, m);
        state.currentClock = { mode: 'read', h, m, ansStr };

        document.getElementById('clock-mode-badge').textContent = isAfternoon ? '🌙 Klockslag (Eftermiddag)' : '🕒 Klockslag';
        document.getElementById('clock-question-text').textContent = isAfternoon
            ? 'Hur mycket är klockan på eftermiddagen / kvällen?'
            : 'Hur mycket är klockan (förmiddag)?';
        document.getElementById('clock-svg-container').innerHTML = renderClockSVG(h, m, 195);

        setHintSteps('clock', [
            `<p>Titta på den <strong class="text-rose-600">korta röda timvisaren</strong>: den pekar på <strong>${h}</strong>${isAfternoon ? ` (på eftermiddagen plussar vi på 12: <strong>${h} + 12 = ${dispH}</strong>)` : ''}.</p>
             <div class="flex justify-center my-1">${renderClockSVG(h, m, 110, false, 'hour')}</div>`,
            `<p>Räkna minutstrecken på den <strong class="text-sky-600">långa blå minutvisaren</strong>: <strong>${String(m).padStart(2, '0')} minuter</strong> ➔ Klockan är <strong>${ansStr}</strong>!</p>
             <div class="flex justify-center my-1">${renderClockSVG(h, m, 110, false, 'min')}</div>`
        ]);

        const set = new Set([ansStr]);
        while (set.size < 4) {
            const ch = randInt(1, 12);
            const cDispH = isAfternoon ? (ch === 12 ? 12 : ch + 12) : ch;
            const cm = minsPool[randInt(0, minsPool.length - 1)];
            set.add(formatDigitalTime(cDispH, cm));
        }
        const shuffled = shuffleArray([...set]);
        state.currentClock.choices = shuffled;
        document.getElementById('clock-options').innerHTML = shuffled.map((tStr, idx) => `
            <button onclick="checkClockChoice(${idx})" class="btn-3d bg-white hover:bg-violet-50 border-3 border-violet-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
                ${tStr}
            </button>
        `).join('');
    } else {
        const jumpMins = state.difficulty === 'easy'
            ? 30
            : (state.difficulty === 'medium' ? [15, 30, 45][randInt(0, 2)] : [75, 85, 95, 110, 135][randInt(0, 4)]);
        const startMins = isHard ? [15, 25, 35, 40, 45, 50][randInt(0, 5)] : m;
        const totalMins = h * 60 + startMins + jumpMins;
        const endH = ((Math.floor(totalMins / 60) - 1) % 12) + 1;
        const endM = totalMins % 60;
        const ansStr = formatDigitalTime(endH, endM);

        state.currentClock = { mode: 'jump', h, m: startMins, jumpMins, ansStr };
        document.getElementById('clock-mode-badge').textContent = '⏩ Tidshopp';
        document.getElementById('clock-question-text').textContent = `Klockan är ${formatDigitalTime(h, startMins)}. Hur mycket är hon om ${jumpMins} minuter?`;
        document.getElementById('clock-svg-container').innerHTML = renderClockSVG(h, startMins, 185);

        const extraH = Math.floor(jumpMins / 60);
        const extraM = jumpMins % 60;
        setHintSteps('clock', [
            `<p>Dela upp <strong>${jumpMins} minuter</strong> i timmar och minuter: <strong>${extraH > 0 ? `${extraH} tim och ` : ''}${extraM} min</strong> (60 min = 1 timme).</p>`,
            `<p>Starta på <strong>${formatDigitalTime(h, startMins)}</strong> och hoppa framåt ➔ <strong>${ansStr}</strong>!</p>`
        ]);

        const set = new Set([ansStr]);
        while (set.size < 4) {
            const offset = [-30, -15, -10, 10, 15, 30, 60][randInt(0, 6)];
            const tM = h * 60 + startMins + jumpMins + offset;
            const cH = ((Math.floor((tM + 720) / 60) - 1) % 12) + 1;
            const cM = (tM + 720) % 60;
            set.add(formatDigitalTime(cH, cM));
        }
        const shuffled = shuffleArray([...set]);
        state.currentClock.choices = shuffled;
        document.getElementById('clock-options').innerHTML = shuffled.map((tStr, idx) => `
            <button onclick="checkClockChoice(${idx})" class="btn-3d bg-white hover:bg-violet-50 border-3 border-violet-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
                ${tStr}
            </button>
        `).join('');
    }
}

export function checkClockChoice(idx) {
    if (!document.getElementById('clock-next-wrap').classList.contains('hidden')) return;
    const picked = state.currentClock.choices[idx];
    if (picked === state.currentClock.ansStr) {
        addReward(1);
        showFeedback('clock-feedback', true, `🎉 Rätt tid! Klockan är ${picked}!`);
        document.getElementById('clock-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('clock-feedback', false, `🤔 Inte riktigt ${picked} – kolla korta röda och långa blå visaren!`);
    }
}

export function describeTimeInWords(h, m) {
    const names = ['tolv', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv'];
    const curName = names[h % 12 || 12];
    const nextName = names[(h % 12) + 1];
    if (m === 0) return `Klockan ${curName}`;
    if (m === 15) return `Kvart över ${curName}`;
    if (m === 30) return `Halv ${nextName}`;
    if (m === 45) return `Kvart i ${nextName}`;
    if (m < 30) return `${m} minuter över ${curName}`;
    return `${60 - m} minuter i ${nextName}`;
}

export function renderSandboxClock() {
    const wrap = document.getElementById('sandbox-clock-wrap');
    if (!wrap) return;
    wrap.innerHTML = renderClockSVG(state.sandboxHours, state.sandboxMinutes, 230, true);

    const displayH = state.sandboxIsPM
        ? (state.sandboxHours === 12 ? 12 : state.sandboxHours + 12)
        : (state.sandboxHours === 12 ? 0 : state.sandboxHours);
    document.getElementById('sandbox-digital-display').textContent = formatDigitalTime(displayH, state.sandboxMinutes);
    document.getElementById('sandbox-words-display').textContent = describeTimeInWords(state.sandboxHours, state.sandboxMinutes);

    const svg = document.getElementById('sandbox-clock-svg');
    if (!svg) return;
    let dragging = false;
    const handleMove = (clientX, clientY) => {
        const rect = svg.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const ang = Math.atan2(clientY - cy, clientX - cx) + Math.PI / 2;
        const norm = (ang + Math.PI * 2) % (Math.PI * 2);
        const mins = Math.round((norm / (Math.PI * 2)) * 60 / 5) * 5 % 60;
        const prevM = state.sandboxMinutes;
        if (prevM >= 45 && mins <= 15) state.sandboxHours = (state.sandboxHours % 12) + 1;
        if (prevM <= 15 && mins >= 45) state.sandboxHours = state.sandboxHours === 1 ? 12 : state.sandboxHours - 1;
        state.sandboxMinutes = mins;
        renderSandboxClock();
    };
    svg.onpointerdown = (e) => { dragging = true; handleMove(e.clientX, e.clientY); };
    window.onpointermove = (e) => { if (dragging) handleMove(e.clientX, e.clientY); };
    window.onpointerup = () => { dragging = false; };
}

export function setSandboxPM(isPM) {
    playSound('click');
    state.sandboxIsPM = isPM;
    document.getElementById('sandbox-ampm-am').className = 'px-2.5 py-1 rounded-lg text-xs font-extrabold ' + (!isPM ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300');
    document.getElementById('sandbox-ampm-pm').className = 'px-2.5 py-1 rounded-lg text-xs font-extrabold ' + (isPM ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300');
    renderSandboxClock();
}

export function adjustSandboxMinutes(delta) {
    playSound('click');
    let total = (state.sandboxHours % 12) * 60 + state.sandboxMinutes + delta;
    total = (total + 720) % 720;
    const nh = Math.floor(total / 60);
    state.sandboxHours = nh === 0 ? 12 : nh;
    state.sandboxMinutes = total % 60;
    renderSandboxClock();
}

export function startSandboxChallenge() {
    playSound('click');
    const th = randInt(1, 12);
    const tm = [0, 15, 30, 45][randInt(0, 3)];
    const pm = Math.random() < 0.5;
    const dispH = pm ? (th === 12 ? 12 : th + 12) : (th === 12 ? 0 : th);
    state.sandboxTarget = { h: th, m: tm, pm, dispStr: formatDigitalTime(dispH, tm) };
    document.getElementById('sandbox-target-banner').classList.remove('hidden');
    document.getElementById('sandbox-feedback').classList.add('hidden');
    document.getElementById('sandbox-target-text').textContent = `Ställ klockan på: ${state.sandboxTarget.dispStr}`;
}

export function checkSandboxTarget() {
    if (!state.sandboxTarget) return;
    const displayH = state.sandboxIsPM
        ? (state.sandboxHours === 12 ? 12 : state.sandboxHours + 12)
        : (state.sandboxHours === 12 ? 0 : state.sandboxHours);
    const curStr = formatDigitalTime(displayH, state.sandboxMinutes);
    if (curStr === state.sandboxTarget.dispStr) {
        addReward(2);
        showFeedback('sandbox-feedback', true, `🎉 Mitt i prick! Klockan visar ${curStr}!`);
    } else {
        resetStreak();
        showFeedback('sandbox-feedback', false, `🤔 Klockan visar ${curStr} just nu (glöm inte FM/EM-knappen!). Prova igen!`);
    }
}

// "Visa mig": visarna sveper fram och lyfts fram var för sig med
// befintliga clock-hand-animationen och focus-dimningen.
export function buildClockDemoSteps() {
    const h = 4, m = 15;
    const clock = (focus) => `<div class="flex justify-center">${renderClockSVG(h, m, 215, false, focus)}</div>`;
    return { steps: [
        { text: `<p>En klocka har <strong>två visare</strong>! Den <span class="text-rose-600 font-bold">korta</span> visar <strong>timmar</strong> och den <span class="text-sky-600 font-bold">långa</span> visar <strong>minuter</strong>.</p>`,
          html: clock(null) },
        { text: `<p>Titta på den <span class="text-rose-600 font-bold">korta timvisaren</span>: den har passerat <strong>${h}</strong> – det är ${h} i timmen!</p>`,
          html: clock('hour') },
        { text: `<p>Nu den <span class="text-sky-600 font-bold">långa minutvisaren</span>: varje siffra på urtavlan betyder <strong>5 minuter</strong>. Räkna: 5, 10, <strong>${m}</strong> – ${m} minuter kallas <strong>en kvart</strong>!</p>`,
          html: clock('min') },
        { text: `<p>Många blandar ihop visarna! Den <span class="text-rose-600 font-bold">korta</span> är timmar och den <span class="text-sky-600 font-bold">långa</span> är minuter – inte tvärtom!</p>`,
          warn: true,
          html: clock(null) },
        { text: `<p><strong>Din tur!</strong> Vad visar klockan?</p>`,
          html: clock(null),
          guess: { options: [
              { label: 'Kvart i fyra', ok: false },
              { label: 'Kvart över fyra', ok: true },
              { label: 'Halv fyra', ok: false },
          ] },
          doneText: `${describeTimeInWords(h, m)} – digitalt ${formatDigitalTime(h, m)}! 🎉` },
    ] };
}
