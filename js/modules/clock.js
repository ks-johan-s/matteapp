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
    ['mix', 'read', 'digital', 'words', 'jump', 'sandbox'].forEach(m => {
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
    if (mode === 'mix') {
        const r = Math.random();
        mode = r < 0.35 ? 'read' : r < 0.6 ? 'digital' : r < 0.85 ? 'words' : 'jump';
    }
    if (mode === 'digital' || mode === 'words') {
        generateClockVisualQuestion(mode);
        return;
    }

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

// Vanliga felsvar: fel timme, "över"↔"i"-spegling, halvtimmesfel.
function clockPerturbations(h, m) {
    const cands = [
        [h, (m + 30) % 60],
        [h === 12 ? 1 : h + 1, m],
        [h === 1 ? 12 : h - 1, m],
        [h, 60 - m],
        [h, (m + 15) % 60],
        [h, (m + 45) % 60],
        [h === 12 ? 1 : h + 1, (m + 30) % 60],
    ];
    const seen = new Set([h * 60 + m]);
    const out = [];
    for (const [dh, dm] of cands) {
        const key = dh * 60 + dm;
        if (!seen.has(key)) { seen.add(key); out.push({ h: dh, m: dm }); }
    }
    return out;
}

function wordMinuteRule(h, m) {
    const names = ['tolv', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv'];
    const cur = names[h % 12 || 12];
    const next = names[(h % 12) + 1];
    if (m === 0) return `Minutvisaren rakt upp på 12 ➔ "<strong>Klockan ${cur}</strong>" – hela timmen!`;
    if (m === 30) return `"<strong>Halv ${next}</strong>" = halvvägs mot ${next} – visaren rakt ner på 6.`;
    if (m === 25) return `25 minuter är <strong>fem i halv ${next}</strong> – fem minuter kvar till halv ${next}.`;
    if (m === 35) return `35 minuter är <strong>fem över halv ${next}</strong> – fem minuter efter halv ${next}.`;
    if (m < 30) return `"<strong>Över</strong>" säger vi när klockan passerat hela timmen: ${m} minuter efter ${cur}.`;
    return `"<strong>I</strong>" säger vi när vi närmar oss nästa timme: ${60 - m} minuter kvar till ${next}.`;
}

// 'digital': digital tid → välj urtavla. 'words': klocka/ord/digital i tre riktningar.
function generateClockVisualQuestion(mode) {
    const isHard = state.difficulty === 'hard';
    const h = randInt(1, 12);
    const mPool = mode === 'words'
        ? (state.difficulty === 'easy' ? [0, 15, 30, 45] : CLOCK_WORD_MINS)
        : (state.difficulty === 'easy' ? [0, 30]
            : (state.difficulty === 'medium' ? [0, 15, 30, 45] : CLOCK_WORD_MINS));
    const m = mPool[randInt(0, mPool.length - 1)];
    const word = describeTimeInWords(h, m);
    const isAfternoon = isHard && Math.random() < 0.5;
    const dispH = isAfternoon ? (h === 12 ? 12 : h + 12) : (isHard && h === 12 ? 0 : h);
    const digStr = formatDigitalTime(dispH, m);

    const badgeEl = document.getElementById('clock-mode-badge');
    const qEl = document.getElementById('clock-question-text');
    const svgEl = document.getElementById('clock-svg-container');
    const optEl = document.getElementById('clock-options');

    const bigLabel = (txt) => `<div class="font-display font-extrabold text-4xl sm:text-5xl text-slate-900 tracking-wide bg-violet-50 border-3 border-violet-300 rounded-3xl px-7 py-6 inline-block">${txt}</div>`;
    const pairChoices = shuffleArray([{ h, m }, ...shuffleArray(clockPerturbations(h, m)).slice(0, 3)]);
    const clockButtons = pairChoices.map((p, idx) => `
        <button onclick="checkClockChoice(${idx})" class="btn-3d bg-white hover:bg-violet-50 border-3 border-violet-300 rounded-2xl py-3 flex justify-center items-center">
            ${renderClockSVG(p.h, p.m, 96)}
        </button>`).join('');
    const textButtons = (labels) => labels.map((w, idx) => `
        <button onclick="checkClockChoice(${idx})" class="btn-3d bg-white hover:bg-violet-50 border-3 border-violet-300 rounded-2xl py-4 px-2 font-display font-bold text-lg sm:text-xl text-slate-900">
            ${w}
        </button>`).join('');

    if (mode === 'digital') {
        badgeEl.textContent = isAfternoon ? '🖥️ Digital tid (Eftermiddag)' : '🖥️ Digital tid';
        qEl.textContent = 'Vilken klocka visar samma tid?';
        svgEl.innerHTML = bigLabel(digStr);
        state.currentClock = { mode, h, m, ansStr: formatDigitalTime(h, m), choices: pairChoices.map(p => formatDigitalTime(p.h, p.m)), ansLabel: `Rätt klocka! ${digStr} är ${word}` };
        optEl.innerHTML = clockButtons;
        setHintSteps('clock', [
            `<p>Den <strong class="text-rose-600">korta timvisaren</strong> ska peka mot <strong>${h}</strong>${isAfternoon ? ` (${dispH} på eftermiddagen = ${dispH} − 12 = <strong>${h}</strong>)` : ''}.</p>`,
            `<p>Den <strong class="text-sky-600">långa minutvisaren</strong> ska stå på <strong>${String(m).padStart(2, '0')} min</strong> ➔ ${digStr}!</p>`
        ]);
        return;
    }

    badgeEl.textContent = '💬 Tid med ord';
    const wt = ['c2w', 'w2c', 'w2d'][randInt(0, 2)];
    if (wt === 'c2w') {
        qEl.textContent = 'Vad heter tiden?';
        svgEl.innerHTML = renderClockSVG(h, m, 185);
        const seen = new Set([word]);
        const wChoices = [word];
        for (const p of shuffleArray(clockPerturbations(h, m))) {
            const w = describeTimeInWords(p.h, p.m);
            if (!seen.has(w)) { seen.add(w); wChoices.push(w); }
            if (wChoices.length === 4) break;
        }
        while (wChoices.length < 4) {
            const w = describeTimeInWords(randInt(1, 12), CLOCK_WORD_MINS[randInt(0, CLOCK_WORD_MINS.length - 1)]);
            if (!seen.has(w)) { seen.add(w); wChoices.push(w); }
        }
        const shuffled = shuffleArray(wChoices);
        state.currentClock = { mode, h, m, ansStr: word, choices: shuffled, ansLabel: `Rätt! Klockan är ${digStr} – "${word}"` };
        optEl.innerHTML = textButtons(shuffled);
        setHintSteps('clock', [
            `<p>Minutvisaren pekar på <strong>${String(m).padStart(2, '0')} min</strong>. ${wordMinuteRule(h, m)}</p>`,
            `<p>➔ Tiden heter <strong>${word}</strong>!</p>`
        ]);
    } else if (wt === 'w2c') {
        qEl.textContent = 'Vilken klocka visar det?';
        svgEl.innerHTML = bigLabel(word);
        state.currentClock = { mode, h, m, ansStr: formatDigitalTime(h, m), choices: pairChoices.map(p => formatDigitalTime(p.h, p.m)), ansLabel: `Rätt! "${word}" är klockan ${digStr}` };
        optEl.innerHTML = clockButtons;
        setHintSteps('clock', [
            `<p>${wordMinuteRule(h, m)}</p>`,
            `<p>Kolla timvisaren också – den ska vara på väg mot <strong>${m >= 25 ? 'nästa' : 'den passerade'} timmen</strong> ➔ ${digStr}!</p>`
        ]);
    } else {
        qEl.textContent = isAfternoon ? 'Vilken tid är det på eftermiddagen?' : 'Vilken tid är det?';
        svgEl.innerHTML = bigLabel(word);
        const dChoices = pairChoices.map(p => {
            const pd = isAfternoon ? (p.h === 12 ? 12 : p.h + 12) : p.h;
            return formatDigitalTime(pd, p.m);
        });
        state.currentClock = { mode, h, m, ansStr: digStr, choices: dChoices, ansLabel: `Rätt! "${word}" är klockan ${digStr}` };
        optEl.innerHTML = dChoices.map((t, idx) => `
            <button onclick="checkClockChoice(${idx})" class="btn-3d bg-white hover:bg-violet-50 border-3 border-violet-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
                ${t}
            </button>`).join('');
        setHintSteps('clock', [
            `<p>${wordMinuteRule(h, m)}</p>`,
            `<p>Minutvisaren står på <strong>${String(m).padStart(2, '0')}</strong> och timmen är <strong>${dispH}</strong> ➔ ${digStr}!</p>`
        ]);
    }
}

export function checkClockChoice(idx) {
    if (!document.getElementById('clock-next-wrap').classList.contains('hidden')) return;
    const picked = state.currentClock.choices[idx];
    if (picked === state.currentClock.ansStr) {
        addReward(1);
        showFeedback('clock-feedback', true, `🎉 ${state.currentClock.ansLabel || `Rätt tid! Klockan är ${picked}`}!`);
        document.getElementById('clock-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('clock-feedback', false, `🤔 Inte riktigt ${picked} – kolla korta röda och långa blå visaren!`);
    }
}

const CLOCK_WORD_MINS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export function describeTimeInWords(h, m) {
    const names = ['tolv', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio', 'elva', 'tolv'];
    const curName = names[h % 12 || 12];
    const nextName = names[(h % 12) + 1];
    const byMinute = {
        0: `Klockan ${curName}`,
        5: `Fem över ${curName}`,
        10: `Tio över ${curName}`,
        15: `Kvart över ${curName}`,
        20: `Tjugo över ${curName}`,
        25: `Fem i halv ${nextName}`,
        30: `Halv ${nextName}`,
        35: `Fem över halv ${nextName}`,
        40: `Tjugo i ${nextName}`,
        45: `Kvart i ${nextName}`,
        50: `Tio i ${nextName}`,
        55: `Fem i ${nextName}`,
    };
    if (byMinute[m]) return byMinute[m];
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
    const tm = CLOCK_WORD_MINS[randInt(0, CLOCK_WORD_MINS.length - 1)];
    const pm = Math.random() < 0.5;
    const dispH = pm ? (th === 12 ? 12 : th + 12) : (th === 12 ? 0 : th);
    state.sandboxTarget = { h: th, m: tm, pm, dispStr: formatDigitalTime(dispH, tm) };
    const label = Math.random() < 0.5 ? describeTimeInWords(th, tm) : state.sandboxTarget.dispStr;
    document.getElementById('sandbox-target-banner').classList.remove('hidden');
    document.getElementById('sandbox-feedback').classList.add('hidden');
    document.getElementById('sandbox-target-text').textContent = `Ställ klockan på: ${label}`;
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
    const clock = (focus, opts = {}) => `<div class="flex justify-center">${renderClockSVG(h, m, 215, false, focus, opts)}</div>`;
    return { steps: [
        { text: `<p>En klocka har <strong>två visare</strong>! Den <span class="text-rose-600 font-bold">korta</span> visar <strong>timmar</strong> och den <span class="text-sky-600 font-bold">långa</span> visar <strong>minuter</strong>.</p>`,
          html: clock(null) },
        { text: `<p>Titta på den <span class="text-rose-600 font-bold">korta timvisaren</span> <span class="demo-tag" style="background:#ffe4e6;color:#be123c">timmar</span>: den har passerat <strong>${h}</strong> – det är ${h} i timmen!</p>`,
          html: clock('hour', { handLabels: true }) },
        { text: `<p>Nu den <span class="text-sky-600 font-bold">långa minutvisaren</span> <span class="demo-tag" style="background:#e0f2fe;color:#075985">minuter</span>: varje siffra betyder <strong>5 minuter</strong>. Räkna märkena: 5, 10, <strong>${m}</strong> – det är <strong>en kvart</strong>!</p>`,
          html: clock('min', { handLabels: true, minCounts: true }) },
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
