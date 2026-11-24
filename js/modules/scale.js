// js/modules/scale.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { randInt, showFeedback, shuffleArray, styleNumbersIn } from '../utils.js';
import { renderScaleSVG } from '../visuals.js';

export function setScaleHands(on) {
    playSound('click');
    state.scaleHands = !!on;
    const btn = document.getElementById('scale-hands-btn');
    if (btn) btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
        (state.scaleHands ? 'bg-cyan-600 text-white' : 'bg-white border border-cyan-200 text-slate-700');
    generateScaleQuestion();
}

export function generateScaleQuestion() {
    document.getElementById('scale-feedback').classList.add('hidden');
    document.getElementById('scale-next-wrap').classList.add('hidden');

    let leftLabel, rightLabel, leftTotal, c, answer, step1Text;

    if (state.difficulty === 'hard') {
        const variant = randInt(0, 2);
        if (variant === 0) {
            const f1 = randInt(6, 9), f2 = randInt(6, 9);
            leftTotal = f1 * f2;
            c = randInt(14, leftTotal - 9);
            answer = leftTotal - c;
            leftLabel = `${f1} × ${f2}`;
            rightLabel = `${c} + ?`;
            step1Text = `Räkna ut multiplikationen på vänster sida: <strong>${f1} × ${f2} = ${leftTotal}</strong>.`;
        } else if (variant === 1) {
            const big = randInt(65, 96), sub = randInt(18, 39);
            leftTotal = big - sub;
            c = randInt(11, leftTotal - 7);
            answer = leftTotal - c;
            leftLabel = `${big} − ${sub}`;
            rightLabel = `? + ${c}`;
            step1Text = `Räkna ut subtraktionen på vänster sida: <strong>${big} − ${sub} = ${leftTotal}</strong>.`;
        } else {
            const a = randInt(38, 68), b = randInt(27, 56);
            leftTotal = a + b;
            c = randInt(29, leftTotal - 15);
            answer = leftTotal - c;
            leftLabel = `${a} + ${b}`;
            rightLabel = `${c} + ?`;
            step1Text = `Lägg ihop vänster sida: <strong>${a} + ${b} = ${leftTotal}</strong>.`;
        }
    } else {
        const a = randInt(8, state.difficulty === 'easy' ? 18 : 35);
        const b = randInt(5, state.difficulty === 'easy' ? 14 : 28);
        leftTotal = a + b;
        c = randInt(3, leftTotal - 2);
        answer = leftTotal - c;
        leftLabel = `${a} + ${b}`;
        rightLabel = `${c} + ?`;
        step1Text = `Räkna ut hur tung vänster sida är: <strong>${a} + ${b} = ${leftTotal}</strong>.`;
    }

    state.currentScale = { leftLabel, rightLabel, c, leftTotal, answer, extra: 0 };

    if (state.scaleHands) {
        // CPA-läge: eleven lägger på och tar av vikter tills vågen balanserar.
        document.getElementById('scale-options').classList.add('hidden');
        document.getElementById('scale-tilt-status').innerHTML = `Lägg på eller ta av vikter på höger sida tills vågen <strong>balanserar</strong>!<br><span class="text-cyan-700 text-base">Mål: höger ska också bli ${leftTotal}</span>`;
        setHintSteps('scale', [
            `<p><strong>Steg 1:</strong> ${step1Text}</p>`,
            `<p><strong>Steg 2:</strong> Höger sida börjar på <strong>${c}</strong>. Lägg på vikter – börja med stora (+10) och finjustera med små (+1) tills vågen står rakt!</p>`
        ]);
        renderScaleHands();
        return;
    }
    document.getElementById('scale-options').classList.remove('hidden');

    document.getElementById('scale-tilt-status').textContent = 'Vågen lutar just nu! Vilket tal gör båda sidor lika tunga?';
    document.getElementById('scale-svg-container').innerHTML = renderScaleSVG(leftLabel, rightLabel, -8);

    setHintSteps('scale', [
        `<p><strong>Steg 1:</strong> ${step1Text}</p>`,
        `<p><strong>Steg 2:</strong> Höger sida måste också bli <strong>${leftTotal}</strong>. Eftersom det redan ligger <strong>${c}</strong> där fattas <strong>${leftTotal} − ${c} = ${answer}</strong>!</p>`
    ]);

    const set = new Set([answer]);
    while (set.size < 4) {
        const cand = answer + [-10, -4, -2, -1, 1, 2, 4, 10][randInt(0, 7)];
        if (cand > 0) set.add(cand);
    }
    document.getElementById('scale-options').innerHTML = shuffleArray([...set]).map(v => `
        <button onclick="checkScaleChoice(${v})" class="btn-3d bg-white hover:bg-cyan-50 border-3 border-cyan-300 rounded-2xl py-4 font-display font-bold text-2xl text-slate-900">
            ${v}
        </button>
    `).join('');
}

export function checkScaleChoice(val) {
    if (!document.getElementById('scale-next-wrap').classList.contains('hidden')) return;
    const { leftLabel, c, leftTotal, answer } = state.currentScale;
    if (val === answer) {
        addReward(1);
        document.getElementById('scale-tilt-status').textContent = '⚖️ Vågen är i perfekt balans!';
        document.getElementById('scale-svg-container').innerHTML = renderScaleSVG(leftLabel, `${c} + ${answer}`, 0);
        showFeedback('scale-feedback', true, `🎉 Perfekt balans! Båda sidor är värda ${leftTotal}!`);
        document.getElementById('scale-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('scale-feedback', false, `🤔 Då blir höger sida ${c + val}, men vänster sida är ${leftTotal}. Försök igen!`);
    }
}

// Väg själv-läget (CPA): vikter på/av, vågen balanserar live.
function renderScaleHands() {
    const cur = state.currentScale;
    const rightTotal = cur.c + cur.extra;
    const tilt = Math.max(-10, Math.min(10, rightTotal - cur.leftTotal));
    document.getElementById('scale-svg-container').innerHTML =
        renderScaleSVG(cur.leftLabel, `${cur.c} + ${cur.extra}`, tilt) + `
        <div class="flex flex-wrap justify-center gap-2 mt-3">
            <button onclick="scaleWeigh(10)" class="btn-3d bg-cyan-500 hover:bg-cyan-600 text-white font-display font-bold px-4 py-2 rounded-xl">⚖️ +10</button>
            <button onclick="scaleWeigh(5)" class="btn-3d bg-cyan-400 hover:bg-cyan-500 text-white font-display font-bold px-4 py-2 rounded-xl">+5</button>
            <button onclick="scaleWeigh(1)" class="btn-3d bg-cyan-300 hover:bg-cyan-400 text-cyan-950 font-display font-bold px-4 py-2 rounded-xl">+1</button>
            <button onclick="scaleWeigh(-1)" class="btn-3d bg-slate-300 hover:bg-slate-400 text-slate-800 font-display font-bold px-4 py-2 rounded-xl">−1</button>
            <button onclick="scaleWeigh(-5)" class="btn-3d bg-slate-400 hover:bg-slate-500 text-white font-display font-bold px-4 py-2 rounded-xl">−5</button>
            <button onclick="scaleWeigh(-10)" class="btn-3d bg-slate-500 hover:bg-slate-600 text-white font-display font-bold px-4 py-2 rounded-xl">−10</button>
        </div>
        <div class="mt-2 text-sm font-extrabold ${rightTotal === cur.leftTotal ? 'text-emerald-700' : 'text-cyan-800'}">
            Höger sida nu: ${rightTotal} ${rightTotal === cur.leftTotal ? '– BALANS! ✓' : `(vänster är ${cur.leftTotal})`}
        </div>`;
}

export function scaleWeigh(d) {
    const cur = state.currentScale;
    if (!cur || !document.getElementById('scale-next-wrap').classList.contains('hidden')) return;
    playSound('click');
    cur.extra = Math.max(0, cur.extra + d);
    renderScaleHands();
    if (cur.c + cur.extra === cur.leftTotal) {
        addReward(2);
        const tiltEl = document.getElementById('scale-tilt-status');
        tiltEl.innerHTML = '⚖️ <strong>Vågen är i perfekt balans!</strong>';
        styleNumbersIn(tiltEl);
        document.getElementById('scale-svg-container').innerHTML = renderScaleSVG(cur.leftLabel, `${cur.c} + ${cur.extra}`, 0);
        showFeedback('scale-feedback', true, `🎉 Du vägde det själv! ${cur.c} + ${cur.extra} = ${cur.leftTotal} – det saknade ${cur.extra}!`);
        document.getElementById('scale-next-wrap').classList.remove('hidden');
    }
}

// "Visa mig": balansvågen = ett levande likhetstecken.
export function buildScaleDemoSteps() {
    const scale = (l, r, tilt) => `<div class="flex justify-center">${renderScaleSVG(l, r, tilt)}</div>`;
    return { steps: [
        { text: `<p>Balansvågen tippade! Vänster sida väger <strong>5 + 3 = 8</strong>, men höger bara <strong>4</strong>. Den tunga sidan åker <strong>ner</strong>!</p>`,
          html: scale('5 + 3', '4', -8) },
        { text: `<p>Gör höger sidan <strong>lika tung</strong> – lägg på <strong>4</strong> till, då står vågen rakt: <strong>5 + 3 = 8</strong>!</p>`,
          html: scale('5 + 3', '4', -8) + `<div class="flex justify-center my-1"><span data-sweight class="px-3 py-1.5 rounded-xl bg-amber-200 border-2 border-amber-500 font-display font-bold text-amber-900">+4</span></div>`,
          anim: { fly: [
              { text: '+4', from: '[data-sweight]', to: '[data-pan="right"]', cls: 'fly-weight', hideSource: true, hideTarget: false, fill: false, delay: 700,
                onLand: () => {
                    const v = document.getElementById('demo-visual');
                    if (v) v.innerHTML = scale('5 + 3', '4 + 4 = 8', 0);
                } },
          ] } },
        { text: `<p>Vågen är egentligen ett <strong>likhetstecken</strong>! Det som står på vänster sida ska väga <strong>exakt lika mycket</strong> som höger sida.</p>`,
          html: scale('8', '8', 0) },
        { text: `<p>Räkna alltid ut <strong>varje sida för sig</strong> först! Det räcker inte att höger sida har "många" vikter – det är summan som räknas.</p>`,
          warn: true,
          html: scale('10', '2 + 3 + 4', -6) },
        { text: `<p><strong>Din tur!</strong> Vänster sida visar <strong>7 + 2</strong>. Vilken vikt balanserar vågen?</p>`,
          html: scale('7 + 2', '?', -8),
          guess: { options: [
              { label: '8', ok: false },
              { label: '9', ok: true },
              { label: '10', ok: false },
          ] },
          doneText: `7 + 2 = <strong>9</strong> – vågen står rakt! 🎉` },
    ] };
}
