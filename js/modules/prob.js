// js/modules/prob.js — Sannolikhet & Kombinatorik (Lgr22 åk 4–6)
// Centralt innehåll: "Sannolikhet, chans och risk grundat på observationer,
// simuleringar eller statistiskt material från vardagliga situationer" samt
// "kombinatorik i konkreta situationer". Fem lägen:
//  box      – kulor i en låda: P = gynnsamma/möjliga som bråk
//  spin     – tärning/lyckohjul: händelser med flera gynnsamma utfall
//  best     – jämför två lådor: fler röda ≠ större chans!
//  comb     – multiplikationsprincipen (kläder, menyer, köbildning)
//  classify – säker / möjlig / omöjlig händelse
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { randInt, showFeedback, shuffleArray } from '../utils.js';

export function setProbSubMode(mode) {
    playSound('click');
    state.probSubMode = mode;
    generateProbQuestion();
}

/* ---------- små visualbyggare ---------- */

// HTML-bråk: täljare över nämnare med bråkstreck
function fracHTML(g, m, cls = '') {
    return `<span class="inline-flex flex-col items-center leading-none ${cls}"><span class="border-b-2 border-current px-1 font-bold">${g}</span><span class="px-1 font-bold">${m}</span></span>`;
}

// Hint-renderaren läser enbart s.html – slå ihop text+visual till html.
function setProbHints(steps) {
    setHintSteps('prob', steps.map(st => typeof st === 'string' ? st : {
        html: (st.text || '') + (st.html ? `<div class="mt-2.5 flex justify-center">${st.html}</div>` : ''),
        anim: st.anim
    }));
}

const BALL_HEX = { red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', purple: '#a78bfa' };
const BALL_SV = { red: 'röd', blue: 'blå', green: 'grön', yellow: 'gul', purple: 'lila' };
const BALL_PL = { red: 'röda', blue: 'blå', green: 'gröna', yellow: 'gula', purple: 'lila' };

// En låda med kulor — returnerar HTML för containern
function ballsHTML(counts, opts = {}) {
    const { size = 'w-8 h-8', gap = 'gap-1.5', label = true, stagger = false, hlColor = null, delayBase = 0 } = opts;
    let balls = '';
    let idx = 0;
    const order = ['red', 'blue', 'green', 'yellow', 'purple'];
    for (const c of order) {
        const n = counts[c] || 0;
        for (let i = 0; i < n; i++) {
            const hl = hlColor === c;
            const cls = stagger ? 'demo-slice' : hl ? 'demo-pop' : '';
            const dl = (stagger || hl) ? `animation-delay:${delayBase + idx * 130}ms;` : '';
            const ring = hl ? 'box-shadow:0 0 0 3px #10b981, 0 0 10px #10b981;' : '';
            balls += `<div class="${size} rounded-full border-2 border-slate-700 shadow-sm ${cls}" style="${dl}${ring}background:radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6), ${BALL_HEX[c]})"></div>`;
            idx++;
        }
    }
    const total = order.reduce((s, c) => s + (counts[c] || 0), 0);
    return `<div class="inline-block bg-gradient-to-b from-amber-100 to-amber-200 border-3 border-amber-400 rounded-2xl px-4 py-3 shadow-inner">
        <div class="flex flex-wrap justify-center ${gap} max-w-xs">${balls}</div>
        ${label ? `<div class="text-center text-xs font-extrabold text-amber-900 mt-1.5">${total} kulor i lådan</div>` : ''}
    </div>`;
}

// Tärningar med unicode-prickar ⚀⚁⚂⚃⚄⚅
const DIE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
function diceHTML(highlight = []) {
    // highlight: lista av tal 1–6 som är gynnsamma (markeras gröna)
    let out = '<div class="flex justify-center gap-2 flex-wrap">';
    for (let n = 1; n <= 6; n++) {
        const hl = highlight.includes(n);
        const cls = hl ? 'demo-pop' : '';
        const dl = hl ? ` style="animation-delay:${highlight.indexOf(n) * 350}ms"` : '';
        out += `<div class="flex flex-col items-center gap-0.5 ${cls}"${dl}>
            <div class="w-12 h-12 rounded-xl border-2 ${hl ? 'border-emerald-500 bg-emerald-100' : 'border-slate-400 bg-white'} flex items-center justify-center text-3xl shadow-sm">${DIE_FACES[n - 1]}</div>
            <span class="text-xs font-extrabold ${hl ? 'text-emerald-700' : 'text-slate-500'}">${n}</span>
        </div>`;
    }
    return out + '</div>';
}

// Lyckohjul: lika stora sektorer, numrerade
function spinnerSVG(numbers, highlight = [], size = 170) {
    const cx = size / 2, r = size / 2 - 8, n = numbers.length;
    const cols = ['#fde68a', '#bfdbfe', '#fecaca', '#bbf7d0', '#e9d5ff', '#fed7aa', '#a5f3fc', '#fbcfe8'];
    let slices = '';
    for (let i = 0; i < n; i++) {
        const a1 = (i / n) * 2 * Math.PI - Math.PI / 2, a2 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
        const x1 = cx + r * Math.cos(a1), y1 = cx + r * Math.sin(a1);
        const x2 = cx + r * Math.cos(a2), y2 = cx + r * Math.sin(a2);
        const hl = highlight.includes(numbers[i]);
        const fill = hl ? '#86efac' : cols[i % cols.length];
        slices += `<path d="M ${cx} ${cx} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${fill}" stroke="#334155" stroke-width="1.5"/>`;
        const am = (a1 + a2) / 2, tx = cx + r * 0.62 * Math.cos(am), ty = cx + r * 0.62 * Math.sin(am);
        slices += `<text x="${tx.toFixed(1)}" y="${(ty + 5).toFixed(1)}" text-anchor="middle" font-size="15" font-weight="800" fill="#1e293b">${numbers[i]}</text>`;
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${slices}<circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="#334155" stroke-width="2.5"/><polygon points="${cx - 8},6 ${cx + 8},6 ${cx},22" fill="#dc2626"/></svg>`;
}

// Förkorta bråk
function simplify(g, m) {
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const d = gcd(g, m);
    return [g / d, m / d];
}

// generisk svarskontroll — alla lägen lagrar options med ok/trap i state.currentProb
export function checkProbChoice(i) {
    const cur = state.currentProb;
    if (!cur || cur.answered) return;
    if (!document.getElementById('prob-next-wrap').classList.contains('hidden')) return;
    const opt = cur.options[i];
    if (opt.ok) {
        cur.answered = true;
        playSound('correct');
        addReward(1);
        showFeedback('prob-feedback', true, cur.correctFb);
        document.getElementById('prob-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        playSound('wrong');
        const trapMsg = cur.trapFb && cur.trapFb[opt.trap];
        showFeedback('prob-feedback', false, (trapMsg || cur.wrongFb) + ' Kika på 💡-tipset!');
    }
}

function mountProb(qHTML, visHTML) {
    document.getElementById('prob-mode-badge').textContent = cur_badge;
    document.getElementById('prob-question-text').innerHTML = qHTML;
    const vis = document.getElementById('prob-visual');
    vis.innerHTML = visHTML ? `<div class="flex justify-center">${visHTML}</div>` : '';
    vis.classList.toggle('hidden', !visHTML);
    document.getElementById('prob-feedback').classList.add('hidden');
    document.getElementById('prob-next-wrap').classList.add('hidden');
    document.getElementById('prob-hint-box').classList.add('hidden');
    const opts = document.getElementById('prob-options');
    opts.innerHTML = '';
    state.currentProb.options.forEach((o, i) => {
        const btn = document.createElement('button');
        btn.className = 'btn-3d bg-white hover:bg-violet-50 border-2 border-violet-300 rounded-2xl px-5 py-3.5 font-display font-bold text-xl text-slate-800 flex items-center gap-2 justify-center min-w-[5rem]';
        btn.innerHTML = o.label;
        btn.onclick = () => checkProbChoice(i);
        opts.appendChild(btn);
    });
}
let cur_badge = '';

/* ---------- Läge 1: Kulor i lådan ---------- */
function genBox(diff) {
    // antal kulor per färg; easy små tal & direktbråk, medium/svår kräver förkortning ibland/alltid
    const nColors = diff === 'easy' ? 2 : randInt(2, 3);
    const colors = shuffleArray(['red', 'blue', 'green', 'yellow', 'purple']).slice(0, nColors);
    const counts = {};
    let total = 0;
    for (const c of colors) {
        const n = diff === 'easy' ? randInt(1, 4) : randInt(1, 6);
        counts[c] = n;
        total += n;
    }
    const target = colors[randInt(0, colors.length - 1)];
    // hard: ibland komplementhändelsen "inte röd"
    const complement = diff === 'hard' && Math.random() < 0.4;
    const g0 = complement ? total - counts[target] : counts[target];
    const mustSimplify = diff !== 'easy' && g0 > 1 && total % g0 === 0 && (diff === 'hard' || Math.random() < 0.6);
    const [g, m] = mustSimplify ? simplify(g0, total) : [g0, total];
    const vis = ballsHTML(counts);
    const q = complement
        ? `Du drar en kula utan att titta.<br>Vad är sannolikheten att den <strong>inte</strong> är ${BALL_SV[target]}?`
        : `Du drar en kula utan att titta.<br>Vad är sannolikheten att den är <strong>${BALL_SV[target]}</strong>?`;
    const correct = fracHTML(g, m);
    // distraktorer med autentiska missförstånd
    const wrongs = [
        { g: m, m: g, trap: 'invert' },                       // baklänges bråk
        { g: g0, m: total, trap: mustSimplify ? 'nosimplify' : 'other' }, // oförkortat när förkortning krävs
        { g: complement ? counts[target] : total - counts[target], m: total, trap: 'wrongcount' },
    ];
    if (mustSimplify) wrongs[1] = { g: g0, m: total, trap: 'nosimplify' };
    const opts = [{ label: correct, ok: true }];
    const used = new Set([`${g}/${m}`]);
    for (const w of wrongs) {
        if (w.g <= 0 || w.m <= 0) continue;
        const key = `${w.g}/${w.m}`;
        if (used.has(key) || w.g / w.m === g / m) continue;
        used.add(key);
        opts.push({ label: fracHTML(w.g, w.m), ok: false, trap: w.trap });
    }
    while (opts.length < 4) {
        const dg = randInt(1, total - 1);
        const key = `${dg}/${total}`;
        if (used.has(key) || dg / total === g / m) continue;
        used.add(key);
        opts.push({ label: fracHTML(dg, total), ok: false, trap: 'other' });
    }
    cur_badge = '🎲 Kulor i lådan';
    state.currentProb = {
        mode: 'box', options: shuffleArray(opts),
        correctFb: `🎉 Rätt! ${complement ? `Det är <strong>${g0}</strong> kulor som inte är ${BALL_PL[target]}` : `Det är <strong>${g0}</strong> ${BALL_PL[target]} ${g0 === 1 ? 'kula' : 'kulor'}`} av ${total} totalt – alltså ${fracHTML(g0, total)}${mustSimplify ? `, som förkortas till ${fracHTML(g, m)}!` : '.'}`,
        wrongFb: `Räkna lugnt: sannolikheten är <strong>gynnsamma delat med möjliga</strong> – antalet ${complement ? 'som inte är ' + BALL_PL[target] : BALL_PL[target]} delat med alla kulor.`,
        trapFb: {
            invert: `Bråket är baklänges! Täljaren (uppe) är de <strong>gynnsamma</strong> – nämnaren (nere) är <strong>alla</strong> kulor.`,
            nosimplify: `${fracHTML(g0, total)} stämmer som antal – men svaret ska <strong>förkortas</strong>: dela båda med ${g0} så får du ${fracHTML(g, m)}!`,
            wrongcount: complement ? `Här efterfrågas kulor som <strong>inte</strong> är ${BALL_PL[target]} – räkna alla andra färger!` : `Räkna de ${BALL_PL[target]} kulorna en gång till – hur många är de?`,
            other: `Räkna lugnt: gynnsamma delat med möjliga.`
        }
    };
    setProbHints( [
        { text: `<p>Sannolikhet är ett <strong>bråk</strong>: <span class="whitespace-nowrap">${fracHTML('gynnsamma', 'möjliga')}</span> — de du vill ha delat med alla som finns.</p>` },
        { text: `<p><strong>Möjliga utfall:</strong> räkna ALLA kulor i lådan.</p>`, html: vis },
        { text: `<p><strong>Gynnsamma utfall:</strong> räkna ${complement ? 'kulorna som <strong>inte</strong> är ' + BALL_PL[target] : 'de ' + BALL_PL[target] + ' kulorna'}. Det är <strong>${g0}</strong> av <strong>${total}</strong> — sannolikheten är ${fracHTML(g, m)}.</p>`, html: vis },
    ]);
    mountProb(q, vis);
}

/* ---------- Läge 2: Tärning & lyckohjul – händelser med flera utfall ---------- */
function genSpin(diff) {
    const useDice = diff === 'easy' ? true : Math.random() < 0.6;
    // händelsetyper: minst X, högst X, jämnt/udda, exakt
    const events = useDice
        ? (diff === 'easy'
            ? [{ txt: 'en sexa', hit: [6] }, { txt: 'en etta', hit: [1] }, { txt: 'minst 5', hit: [5, 6] }, { txt: 'jämnt tal', hit: [2, 4, 6] }]
            : diff === 'medium'
                ? [{ txt: 'minst 4', hit: [4, 5, 6] }, { txt: 'högst 3', hit: [1, 2, 3] }, { txt: 'udda tal', hit: [1, 3, 5] }, { txt: 'minst 5', hit: [5, 6] }]
                : [{ txt: 'minst 3', hit: [3, 4, 5, 6] }, { txt: 'högst 4', hit: [1, 2, 3, 4] }, { txt: 'mer än 2', hit: [3, 4, 5, 6] }, { txt: 'mindre än 5', hit: [1, 2, 3, 4] }])
        : null;
    let hit, total, vis, thingTxt;
    if (useDice) {
        const ev = events[randInt(0, events.length - 1)];
        hit = ev.hit; total = 6;
        vis = diceHTML(diff === 'easy' ? hit : []);
        thingTxt = `Du kastar en vanlig tärning.<br>Vad är sannolikheten att få <strong>${ev.txt}</strong>?`;
    } else {
        // lyckohjul med 4–8 numrerade sektorer
        total = diff === 'medium' ? randInt(4, 6) : randInt(5, 8);
        const numbers = [];
        for (let i = 0; i < total; i++) numbers.push(i + 1);
        const evType = randInt(0, 2);
        let evTxt;
        if (evType === 0) {
            const x = randInt(2, total - 1);
            hit = numbers.filter(n => n >= x);
            evTxt = `minst ${x}`;
        } else if (evType === 1) {
            const x = randInt(2, total - 1);
            hit = numbers.filter(n => n <= x);
            evTxt = `högst ${x}`;
        } else {
            hit = numbers.filter(n => n % 2 === 0);
            evTxt = 'jämnt tal';
        }
        vis = spinnerSVG(numbers);
        thingTxt = `Hjulet snurrar och stannar slumpmässigt.<br>Vad är sannolikheten för <strong>${evTxt}</strong>?`;
    }
    const g0 = hit.length;
    const [g, m] = simplify(g0, total);
    const needSimplify = g !== g0;
    const opts = [{ label: fracHTML(g, m), ok: true }];
    const used = new Set([`${g}/${m}`, `${g0}/${total}`]);
    if (needSimplify) opts.push({ label: fracHTML(g0, total), ok: false, trap: 'nosimplify' });
    opts.push({ label: fracHTML(m, g), ok: false, trap: 'invert' });
    opts.push({ label: fracHTML(1, total), ok: false, trap: 'single' }); // "det är ett specifikt tal"-fällan
    while (opts.length < 4) {
        const dg = randInt(1, total);
        const key = `${dg}/${total}`;
        if (used.has(key) || dg / total === g / m) continue;
        used.add(key);
        opts.push({ label: fracHTML(dg, total), ok: false, trap: 'other' });
    }
    cur_badge = useDice ? '🎲 Tärningen' : '🌈 Lyckohjulet';
    state.currentProb = {
        mode: 'spin', options: shuffleArray(opts),
        correctFb: `🎉 Rätt! Det är <strong>${g0}</strong> gynnsamma utfall av <strong>${total}</strong> möjliga – ${fracHTML(g0, total)}${needSimplify ? ` = ${fracHTML(g, m)} förkortat` : ''}.`,
        wrongFb: `Sannolikheten är gynnsamma utfall delat med möjliga. Markera alla utfall som uppfyller villkoret!`,
        trapFb: {
            invert: 'Bråket är baklänges! Gynnsamma utfall hör hemma <strong>uppåt</strong> i bråket.',
            nosimplify: `${fracHTML(g0, total)} är rätt räknat – men bråket kan <strong>förkortas</strong> till ${fracHTML(g, m)}!`,
            single: `Det där hade varit chansen för <strong>ett enda exakt</strong> utfall – men här är flera utfall gynnsamma! Räkna dem.`,
            other: 'Räkna utfallen som uppfyller villkoret – hur många är de?'
        }
    };
    setProbHints( [
        { text: `<p>Räkna först <strong>alla möjliga utfall</strong> – det är nämnaren. Här är det <strong>${total}</strong>.</p>`, html: vis },
        { text: `<p>Markera sen <strong>alla utfall som räknas</strong> – de gynnsamma. Titta noga: det kan vara flera!</p>`, html: useDice ? diceHTML(hit) : spinnerSVG(Array.from({ length: total }, (_, i) => i + 1), hit) },
        { text: `<p>Det är <strong>${g0}</strong> gynnsamma av <strong>${total}</strong> möjliga: ${fracHTML(g0, total)}${needSimplify ? ` – förkorta till ${fracHTML(g, m)}` : ''}!</p>` },
    ]);
    mountProb(thingTxt, vis);
}

/* ---------- Läge 3: Bästa chansen – jämför två lådor ---------- */
function genBest(diff) {
    // två lådor; ibland har den med FLER röda sämre chans (nyckelfällan!)
    let a, b, totalA, totalB;
    for (let tries = 0; tries < 60; tries++) {
        totalA = diff === 'easy' ? randInt(4, 8) : randInt(5, 12);
        totalB = diff === 'easy' ? randInt(4, 8) : randInt(5, 12);
        a = randInt(1, totalA - 1);
        b = randInt(1, totalB - 1);
        const pa = a / totalA, pb = b / totalB;
        if (Math.abs(pa - pb) < 0.08) continue;
        // på medel/svår: ofta fällan – den sämre lådan har fler röda kulor
        const trapWanted = diff !== 'easy';
        const trapped = (pa > pb && a < b) || (pb > pa && b < a);
        if (trapWanted && !trapped && Math.random() < 0.7) continue;
        break;
    }
    const pa = a / totalA, pb = b / totalB;
    const aWins = pa > pb;
    const countsA = { red: a, blue: totalA - a };
    const countsB = { red: b, blue: totalB - b };
    const boxRow = `<div class="flex flex-wrap justify-center items-start gap-6 sm:gap-10">
        <div class="flex flex-col items-center gap-1.5"><span class="font-display font-bold text-lg text-slate-700">Låda A</span>${ballsHTML(countsA)}</div>
        <div class="flex flex-col items-center gap-1.5"><span class="font-display font-bold text-lg text-slate-700">Låda B</span>${ballsHTML(countsB)}</div>
    </div>`;
    const opts = shuffleArray([
        { label: 'Låda A', ok: aWins, trap: 'count' },
        { label: 'Låda B', ok: !aWins, trap: 'count' },
        { label: 'Lika stor chans', ok: false, trap: 'same' },
    ]);
    const [ga, ma] = simplify(a, totalA), [gb, mb] = simplify(b, totalB);
    cur_badge = '⚖️ Bästa chansen';
    state.currentProb = {
        mode: 'best', options: opts,
        correctFb: `🎉 Rätt! ${aWins ? 'A' : 'B'}: ${fracHTML(ga, ma)} mot ${fracHTML(gb, mb)} – det är <strong>andelarna</strong> som avgör, inte antalet röda!`,
        wrongFb: 'Jämför andelarna: röda delat med totalt i varje låda. Vilket bråk är störst?',
        trapFb: {
            count: `Fällan! Det är inte <strong>antalet</strong> röda som avgör, utan <strong>andelen</strong>: A har ${fracHTML(ga, ma)} och B har ${fracHTML(gb, mb)}. Jämför bråken!`,
            same: `Inte riktigt – andelarna skiljer: ${fracHTML(ga, ma)} mot ${fracHTML(gb, mb)}. Vilket bråk är störst?`
        }
    };
    setProbHints( [
        { text: `<p>För varje låda: räkna sannolikheten för röd som ett bråk – röda delat med totalt.</p>`, html: boxRow },
        { text: `<p>Låda A: <strong>${a}</strong> röda av <strong>${totalA}</strong> → ${fracHTML(ga, ma)}. Låda B: <strong>${b}</strong> av <strong>${totalB}</strong> → ${fracHTML(gb, mb)}.</p>` },
        { text: `<p>Nu är det en bråkjämförelse – samma knep som i bråkmodulen! Förläng gärna till gemensam nämnare. <strong>Obs:</strong> fler röda kulor betyder inte automatiskt större chans!</p>` },
    ]);
    mountProb('Du vill vinna genom att dra en <strong>röd</strong> kula.<br>Från vilken låda har du störst chans?', boxRow);
}

/* ---------- Läge 4: Kombinatorik – multiplikationsprincipen ---------- */
const COMB_SCENARIOS = [
    { a: { name: 'tröjor', items: ['👕', '👚', '🎽', '🧥'] }, b: { name: 'byxor', items: ['👖', '🩳', '👖', '🩳'] }, thing: 'olika kläduttryck', verb: 'tröjor och par byxor' },
    { a: { name: 'mackor', items: ['🥪', '🌭', '🍔'] }, b: { name: 'drycker', items: ['🥤', '🧃', '🥛'] }, thing: 'mellanmål', verb: 'mackor och drycker' },
    { a: { name: 'glassar', items: ['🍓', '🍫', '🍋', '🫐'] }, b: { name: 'strössel', items: ['🌈', '🍪', '🍬'] }, thing: 'glasskombinationer', verb: 'glassmaker och strösselsorter' },
    { a: { name: 'förrätter', items: ['🥗', '🍲', '🥖'] }, b: { name: 'varmrätter', items: ['🍝', '🍕', '🐟', '🍛'] }, thing: 'middagar', verb: 'förrätter och varmrätter' },
];
function genComb(diff) {
    // hard: permutation – kompisar i kö (n·(n−1)·…·1)
    if (diff === 'hard' && Math.random() < 0.45) {
        const n = randInt(3, 4);
        let answer = 1;
        for (let i = n; i >= 1; i--) answer *= i;
        const mulStr = Array.from({ length: n }, (_, i) => n - i).join(' · ');
        const wrongs = [Math.pow(n, n), n * n, n + n].filter((v, i, arr) => arr.indexOf(v) === i && v !== answer);
        const opts = shuffleArray([{ label: `${answer}`, ok: true },
            { label: `${Math.pow(n, n)}`, ok: false, trap: 'pow' },
            { label: `${n * n}`, ok: false, trap: 'sq' },
            { label: `${n + n + (n - 1)}`, ok: false, trap: 'add' }]);
        cur_badge = '👯 Kompiskö';
        state.currentProb = {
            mode: 'comb', options: opts,
            correctFb: `🎉 Rätt! Första platsen kan fyllas på ${n} sätt, nästa på ${n - 1} (en kompis är redan placerad!) … ${mulStr} = <strong>${answer}</strong> köer.`,
            wrongFb: `För varje plats i kön blir det färre kompisar kvar att välja på – multiplicera ${mulStr}!`,
            trapFb: {
                pow: `${n}·${n}·${n} hade betytt att samma kompis kan stå på flera platser samtidigt – det kan man inte! Antalet val <strong>minskar</strong> för varje plats.`,
                sq: 'Det är fler platser än två – och antalet val minskar för varje plats som fylls!',
                add: 'Addera inte! Varje person på första platsen kan kombineras med alla ordningar av resten – multiplicera i stället.'
            }
        };
        setProbHints( [
            { text: `<p>Första platsen i kön: <strong>${n}</strong> kompisar kan stå där.</p>` },
            { text: `<p>Nästa plats: en kompis är redan upptagen – bara <strong>${n - 1}</strong> kvar att välja på. Och så vidare tills kön är full!</p>` },
            { text: `<p>Multiplicera: ${mulStr} = <strong>${answer}</strong> olika köer.</p>` },
        ]);
        mountProb(`<strong>${n}</strong> kompisar ska ställa sig i kö till bio.<br>På hur många olika sätt kan de stå i kön?`, `<div class="text-5xl flex justify-center gap-2">${'🧒'.repeat(0)}${Array.from({ length: n }, () => ['🧒', '👧', '👦', '🧑'][randInt(0, 3)]).join(' ')}</div>`);
        return;
    }
    const sc = COMB_SCENARIOS[randInt(0, COMB_SCENARIOS.length - 1)];
    const na = diff === 'easy' ? randInt(2, 3) : randInt(2, 4);
    const nb = diff === 'easy' ? randInt(2, 3) : randInt(2, 4);
    const useC = diff !== 'easy' && Math.random() < 0.5;
    const nc = useC ? randInt(2, 3) : 0;
    const answer = na * nb * (nc || 1);
    const cName = 'efterrätter';
    const mulStr = nc ? `${na} · ${nb} · ${nc}` : `${na} · ${nb}`;
    const opts = [{ label: `${answer}`, ok: true }];
    const wrongSet = new Set();
    const addTrap = na + nb + nc;
    if (addTrap !== answer) wrongSet.add(JSON.stringify({ v: addTrap, trap: 'add' }));
    if (nc && na * nb !== answer) wrongSet.add(JSON.stringify({ v: na * nb, trap: 'miss' }));
    wrongSet.add(JSON.stringify({ v: answer + na, trap: 'other' }));
    wrongSet.add(JSON.stringify({ v: Math.max(2, answer - nb), trap: 'other' }));
    const wrongArr = shuffleArray([...wrongSet].map(s => JSON.parse(s))).slice(0, 3);
    for (const w of wrongArr) opts.push({ label: `${w.v}`, ok: false, trap: w.trap });
    while (opts.length < 4) opts.push({ label: `${answer + randInt(2, 6)}`, ok: false, trap: 'other' });
    // rutmatris för två val – varje cell är en kombination
    const emA = sc.a.items.slice(0, na), emB = sc.b.items.slice(0, nb);
    let grid = '';
    if (!nc) {
        grid = `<div class="inline-block"><div class="grid gap-1" style="grid-template-columns:auto repeat(${nb},1fr)">
            <div></div>${emB.map(e => `<div class="text-2xl text-center">${e}</div>`).join('')}
            ${emA.map(ea => `<div class="text-2xl flex items-center">${ea}</div>` + emB.map(() => `<div class="w-9 h-9 rounded-lg bg-violet-100 border border-violet-300 flex items-center justify-center text-xs font-bold text-violet-700">${ea}${''}</div>`).join('')).join('')}
        </div></div>`;
        // enklare celler: bara prickar
        grid = `<div class="inline-block bg-violet-50 border-2 border-violet-200 rounded-2xl p-3"><div class="grid gap-1.5" style="grid-template-columns:auto repeat(${nb},auto)">
            <div></div>${emB.map(e => `<div class="text-2xl text-center w-10">${e}</div>`).join('')}
            ${emA.map(ea => `<div class="text-2xl w-8 flex items-center justify-center">${ea}</div>` + emB.map(eb => `<div class="w-10 h-10 rounded-lg bg-white border border-violet-300 flex items-center justify-center text-sm shadow-sm">${ea}${eb}</div>`).join('')).join('')}
        </div></div>`;
    } else {
        grid = `<div class="flex justify-center gap-4 text-4xl">${emA.join('')} <span class="text-slate-400 font-bold">×</span> ${emB.join('')} <span class="text-slate-400 font-bold">×</span> 🍰×${nc}</div>`;
    }
    cur_badge = '🌳 Kombinatorik';
    state.currentProb = {
        mode: 'comb', options: shuffleArray(opts),
        correctFb: `🎉 Rätt! Varje ${sc.a.name.slice(0, -1)} kan kombineras med alla andra val: ${mulStr} = <strong>${answer}</strong> ${sc.thing}.`,
        wrongFb: `Multiplikationsprincipen! Varje val i första steget kan kombineras med ALLA val i nästa steg.`,
        trapFb: {
            add: `Additionsfällan! ${na}+${nb} räknar bara valen var för sig. Men varje ${sc.a.name.slice(0, -1)} kan paras med <strong>alla</strong> ${sc.b.name} – multiplicera i stället!`,
            miss: 'Glöm inte det tredje valet – multiplicera alla tre antalen!',
            other: `Tänk: varje val i steg 1 kan kombineras med alla val i steg 2 – vilket räknesätt passar?`
        }
    };
    setProbHints( [
        { text: `<p>Systemet: för varje val i första steget finns <strong>alla</strong> val i nästa steg kvar. Inget val "tar slut"!</p>`, html: grid },
        { text: `<p>${na} ${sc.a.name} × ${nb} ${sc.b.name}${nc ? ` × ${nc} ${cName}` : ''}: varje cell i rutnätet är en egen kombination.</p>`, html: grid },
        { text: `<p><strong>Multiplikationsprincipen:</strong> ${mulStr} = <strong>${answer}</strong> ${sc.thing}. Fällan är att addera – det räknar inte kombinationerna!</p>` },
    ]);
    mountProb(`Det finns <strong>${na}</strong> ${sc.a.name} och <strong>${nb}</strong> ${sc.b.name}${nc ? ` och <strong>${nc}</strong> ${cName}` : ''} att välja på.<br>Hur många olika ${sc.thing} kan du sätta ihop?`, grid);
}

/* ---------- Läge 5: Säkert, möjligt eller omöjligt ---------- */
function genClassify(diff) {
    // scenarier med tydliga händelser kopplade till en visuell situation
    const pool = [];
    // låda med en enda färg → säkert/omöjligt
    const mono = ['red', 'blue', 'green'][randInt(0, 2)];
    pool.push({
        vis: ballsHTML({ [mono]: 5 }),
        events: [
            { txt: `Jag drar en ${BALL_SV[mono]} kula`, cat: 'säker' },
            { txt: 'Jag drar en gul kula', cat: 'omöjlig' },
        ]
    });
    // blandad låda → möjligt
    const mixed = { red: 3, blue: 2 };
    pool.push({
        vis: ballsHTML(mixed),
        events: [
            { txt: 'Jag drar en röd kula', cat: 'möjlig' },
            { txt: 'Jag drar en blå kula', cat: 'möjlig' },
            { txt: 'Jag drar en grön kula', cat: 'omöjlig' },
        ]
    });
    // tärning
    pool.push({
        vis: diceHTML(),
        events: [
            { txt: 'Tärningen visar 7', cat: 'omöjlig' },
            { txt: 'Tärningen visar ett tal mindre än 7', cat: 'säker' },
            { txt: 'Tärningen visar 4', cat: 'möjlig' },
        ]
    });
    const sc = pool[randInt(0, pool.length - 1)];
    const ev = sc.events[randInt(0, sc.events.length - 1)];
    const cats = ['säker', 'möjlig', 'omöjlig'];
    const catFb = {
        'säker': 'händer <strong>alltid</strong> – sannolikheten är 1 (100 %)!',
        'omöjlig': 'kan <strong>aldrig</strong> hända – sannolikheten är 0!',
        'möjlig': 'kan hända, men inte alltid – sannolikheten är någonstans <strong>mellan</strong> 0 och 1.'
    };
    cur_badge = '🔮 Säkert eller omöjligt?';
    state.currentProb = {
        mode: 'classify',
        options: shuffleArray(cats.map(c => ({ label: c.charAt(0).toUpperCase() + c.slice(1), ok: c === ev.cat, trap: c }))),
        correctFb: `🎉 Rätt! Händelsen är <strong>${ev.cat}</strong> – den ${catFb[ev.cat]}`,
        wrongFb: 'Fråga dig: kan det hända? Händer det alltid?',
        trapFb: {
            'säker': 'Säker betyder att det händer <strong>varje gång</strong>, utan undantag. Stämmer det här?',
            'omöjlig': 'Omöjlig betyder att det <strong>aldrig</strong> kan hända. Finns det verkligen ingen chans alls?',
            'möjlig': 'Möjlig betyder att det <strong>kan</strong> hända men inte alltid. Kolla en gång till!'
        }
    };
    setProbHints( [
        { text: `<p><strong>Säker</strong> = händer ALLTID (P = 1). <strong>Omöjlig</strong> = kan ALDRIG hända (P = 0). <strong>Möjlig</strong> = kan hända, men inte alltid.</p>` },
        { text: `<p>Titta på situationen och fråga dig: <em>kan det hända? händer det alltid?</em></p>`, html: sc.vis },
        { text: `<p>Här: "${ev.txt}" — den händelsen är <strong>${ev.cat}</strong>.</p>`, html: sc.vis },
    ]);
    mountProb(`<em>"${ev.txt}"</em><br>Är den händelsen säker, möjlig eller omöjlig?`, sc.vis);
}


/* ---------- Läge 6: Utan återläggning ---------- */
function genNorep(diff) {
    const nRed = diff === 'easy' ? randInt(3, 5) : randInt(3, 6);
    const nOther = diff === 'easy' ? randInt(1, 3) : randInt(2, 4);
    const total = nRed + nOther;
    const drawn = diff === 'hard' && Math.random() < 0.4 ? 2 : 1;
    const remaining = nRed - drawn;
    const totAfter = total - drawn;
    const [g, m] = simplify(remaining, totAfter);
    const needSimplify = g !== remaining;
    const counts = { red: nRed, blue: nOther };
    const vis = `<div class="flex flex-col items-center gap-2">${ballsHTML(counts)}
        <div class="text-sm font-extrabold text-slate-600 bg-slate-100 rounded-xl px-3 py-1.5">Du drar ${drawn === 2 ? 'två' : 'en'} röd${drawn === 2 ? 'a' : ''} kula${drawn === 2 ? 'r' : ''} – och behåller ${drawn === 2 ? 'dem' : 'den'}!</div></div>`;
    const q = `Du har dragit <strong>${drawn === 2 ? 'två' : 'en'} röd${drawn === 2 ? 'a' : ''}</strong> och inte lagt tillbaka ${drawn === 2 ? 'dem' : 'den'}.<br>Vad är nu chansen att nästa kula också är röd?`;
    const opts = [{ label: fracHTML(g, m), ok: true }];
    const used = new Set([`${g}/${m}`]);
    const traps = [
        { g: nRed, m: total, trap: 'orig' },         // använder ursprungsantalen
        { g: remaining, m: total, trap: 'halforig' }, // minskar bara täljaren
    ];
    for (const w of traps) {
        const key = `${w.g}/${w.m}`;
        if (!used.has(key) && w.g / w.m !== g / m) { used.add(key); opts.push({ label: fracHTML(w.g, w.m), ok: false, trap: w.trap }); }
    }
    while (opts.length < 4) {
        const dg = randInt(1, total), dm = total;
        const key = `${dg}/${dm}`;
        if (used.has(key) || dg / dm === g / m) continue;
        used.add(key);
        opts.push({ label: fracHTML(dg, dm), ok: false, trap: 'other' });
    }
    cur_badge = '🖐️ Utan återläggning';
    state.currentProb = {
        mode: 'norep', options: shuffleArray(opts),
        correctFb: `🎉 Rätt! Kvar i lådan: <strong>${remaining}</strong> röda av <strong>${totAfter}</strong> totalt – chansen är ${fracHTML(g, m)}. Lådan har förändrats!`,
        wrongFb: 'Kulan du drog är borta! Både antalet röda OCH totalen har minskat.',
        trapFb: {
            orig: `Du räknade med ursprungslådan! Men ${drawn === 2 ? 'två kulor' : 'en kula'} är redan drag${drawn === 2 ? 'na' : 'en'} – räkna vad som är kvar.`,
            halforig: 'Du minskade de röda men glömde totalen – det är färre kulor kvar i hela lådan!',
            other: 'Räkna kulorna som är kvar i lådan – både röda och totalt.'
        }
    };
    setProbHints( [
        { text: `<p>När man inte lägger tillbaka kulan <strong>förändras lådan</strong>. Sannolikheten måste räknas om från början!</p>`, html: ballsHTML(counts) },
        { text: `<p>Före: ${nRed} röda av ${total}. Du tog bort ${drawn} röd${drawn === 2 ? 'a' : ''} – kvar: <strong>${remaining}</strong> röda av <strong>${totAfter}</strong> kulor.</p>` },
        { text: `<p>Chansen är alltså ${fracHTML(remaining, totAfter)}${needSimplify ? ` = ${fracHTML(g, m)} förkortat` : ''}.</p>` },
    ]);
    mountProb(q, vis);
}

/* ---------- Läge 7: Simulering – experimentet ---------- */
function genSim(diff) {
    const target = 6; // sexa med tärning
    const goal = diff === 'easy' ? 60 : diff === 'medium' ? 100 : 150;
    state.currentProb = { mode: 'sim', sim: { rolls: 0, hits: 0, goal }, options: [], answered: false,
        correctFb: '', wrongFb: '', trapFb: {} };
    cur_badge = '🔬 Simuleringen';
    setProbHints( [
        { text: `<p><strong>Experiment:</strong> ju fler kast du gör, desto närmare hamnar den uppmätta frekvensen det teoretiska värdet.</p>` },
        { text: `<p>Teorin säger: chansen för sexa är ${fracHTML(1, 6)} ≈ 17 %. Kasta många gånger och jämför!</p>` },
    ]);
    document.getElementById('prob-mode-badge').textContent = cur_badge;
    document.getElementById('prob-question-text').innerHTML = `Kasta tärningen många gånger! Vad händer med andelen sexor?<br><span class="text-lg text-slate-500">Mål: minst ${goal} kast</span>`;
    renderSim();
    document.getElementById('prob-feedback').classList.add('hidden');
    document.getElementById('prob-next-wrap').classList.add('hidden');
}

function renderSim() {
    const cur = state.currentProb;
    const { rolls, hits, goal } = cur.sim;
    const vis = document.getElementById('prob-visual');
    vis.classList.remove('hidden');
    const pct = rolls ? Math.round(100 * hits / rolls) : 0;
    const dev = rolls ? Math.abs(100 * hits / rolls - 16.7) : 16.7;
    vis.innerHTML = `<div class="flex flex-col items-center gap-3">
        <div class="flex items-end gap-1 h-24">${Array.from({ length: 6 }, (_, i) => {
            const c = cur.sim['c' + (i + 1)] || 0;
            const mx = Math.max(1, rolls / 6);
            const h = Math.min(90, Math.round(85 * c / (mx * 1.3)));
            return `<div class="flex flex-col items-center gap-0.5"><div class="w-10 rounded-t-lg ${i === 5 ? 'bg-emerald-400' : 'bg-violet-300'} transition-all duration-300" style="height:${h}px"></div><span class="text-lg">${DIE_FACES[i]}</span></div>`;
        }).join('')}</div>
        <div class="flex items-center gap-3 flex-wrap justify-center">
            <span class="font-extrabold text-slate-700">${rolls} kast</span>
            <span class="font-extrabold text-emerald-700">${hits} sexor = ${pct}%</span>
            <span class="font-extrabold text-slate-400">teorin: ${fracHTML(1, 6)} ≈ 17%</span>
        </div>
        <div class="w-full max-w-sm h-4 rounded-full bg-slate-200 relative overflow-visible">
            <div class="h-full rounded-full bg-emerald-400 transition-all duration-500" style="width:${pct}%"></div>
            <div class="absolute top-[-4px] h-6 w-1 bg-violet-600 rounded" style="left:16.7%"></div>
        </div>
    </div>`;
    const opts = document.getElementById('prob-options');
    opts.innerHTML = '';
    [['Kasta 10 gånger', 10], ['Kasta 50 gånger', 50], ['Kasta 100 gånger', 100]].forEach(([lbl, n]) => {
        const btn = document.createElement('button');
        btn.className = 'btn-3d bg-white hover:bg-violet-50 border-2 border-violet-300 rounded-2xl px-5 py-3 font-display font-bold text-lg text-slate-800';
        btn.textContent = '🎲 ' + lbl;
        btn.onclick = () => simRoll(n);
        opts.appendChild(btn);
    });
    if (rolls >= goal && !cur.answered) {
        cur.answered = true;
        addReward(1);
        playSound('correct');
        showFeedback('prob-feedback', true, `🎉 Experiment klart! Efter <strong>${rolls}</strong> kast blev andelen sexor <strong>${pct}%</strong> – teorin säger ≈17%. Ju fler kast, desto närmare teorin hamnar man. Det kallas <strong>lagen om stora tal</strong>!`);
        document.getElementById('prob-next-wrap').classList.remove('hidden');
    }
}

export function simRoll(n) {
    const cur = state.currentProb;
    if (!cur || cur.mode !== 'sim' || cur.answered) return;
    for (let i = 0; i < n; i++) {
        const r = randInt(1, 6);
        cur.sim['c' + r] = (cur.sim['c' + r] || 0) + 1;
        cur.sim.rolls++;
        if (r === 6) cur.sim.hits++;
    }
    playSound('click');
    renderSim();
}

function buildSimDemo() {
    return { steps: [
        { text: `<p>Hur stor är chansen att få en sexa? Teorin säger ${fracHTML(1, 6)} – ungefär 17 %. Men <em>stämmer</em> det i verkligheten?</p>`, html: diceHTML([6]) },
        { text: `<p>Det kan man testa med ett <strong>experiment</strong>! Kasta tärningen många gånger och räkna hur ofta det blir en sexa.</p>` },
        { text: `<p>I början svänger andelen vilt – kanske 3 sexor på 10 kast (30 %)! Men ju fler kast desto lugnare: efter hundratals kast hamnar andelen nära 17 %.</p>`,
          html: `<div class="demo-pop font-display font-bold text-xl text-center text-slate-700">få kast: stor svängning<br>många kast: nära teorin</div>` },
        { text: `<p>Det kallas <strong>lagen om stora tal</strong> – slumpen jämnar ut sig när experimentet växer. Testa själv i övningen!</p>` },
        { text: `<p><strong>Din tur!</strong> Ella kastade en tärning 600 gånger och fick 98 sexor. Ungefär hur många procent är det?</p>`,
          html: `<div class="demo-pop text-center font-display font-bold text-xl text-slate-700">98 av 600 ≈ ?</div>`,
          guess: { options: [
              { label: '≈ 16 %', ok: true },
              { label: '≈ 50 %', ok: false },
              { label: '≈ 98 %', ok: false },
          ] },
          doneText: 'Rätt! 98/600 ≈ 16 % – nära teorins 17 %. Lagen om stora tal i praktiken! 🎉' },
    ] };
}

function buildNorepDemo() {
    const counts = { red: 4, blue: 2 };
    return { steps: [
        { text: `<p>Lådan har 4 röda och 2 blå. Chansen att dra röd är ${fracHTML(4, 6)}.</p>`,
          html: `<div class="flex justify-center items-center gap-5 flex-wrap">${ballsHTML(counts, { hlColor: 'red' })}<span class="demo-pop font-display font-bold text-2xl text-violet-700" style="animation-delay:900ms">${fracHTML(4, 6)}</span></div>` },
        { text: `<p>Men nu händer något: du drar en röd – och <strong>behåller den</strong>! Titta, den försvinner ur lådan.</p>`,
          html: `<div class="flex justify-center items-center gap-5 flex-wrap">${ballsHTML({ red: 3, blue: 2 })}<span class="demo-pop text-3xl" style="animation-delay:400ms">🖐️🔴</span></div>` },
        { text: `<p>Lådan har <strong>förändrats</strong>! Både antalet röda och totalen minskade: nu 3 röda av 5. Chansen för ännu en röd är ${fracHTML(3, 5)} – inte ${fracHTML(4, 6)} längre!</p>`,
          html: `<div class="demo-pop font-display font-bold text-2xl text-center"><span class="text-emerald-700">${fracHTML(3, 5)}</span><span class="text-slate-400 text-lg line-through ml-3">${fracHTML(4, 6)}</span></div>` },
        { text: `<p><strong>Nyckelinsikten:</strong> utan återläggning måste man räkna om lådan – både täljare och nämnare kan ha ändrats!</p>` },
        { text: `<p><strong>Din tur!</strong> Lådan har 3 gröna och 3 gula. Du drar en grön och behåller den. Vad är chansen att nästa också är grön?</p>`,
          html: ballsHTML({ green: 3, yellow: 3 }),
          guess: { options: [
              { label: fracHTML(3, 6), ok: false },
              { label: fracHTML(2, 5), ok: true },
              { label: fracHTML(2, 6), ok: false },
          ] },
          doneText: 'Rätt! Kvar: 2 gröna av 5 totalt. (3/6 var ursprungslådan, och 2/6 glömde att totalen också minskat!) 🎉' },
    ] };
}

/* ---------- huvudgenerator ---------- */
export function generateProbQuestion() {
    let mode = state.probSubMode;
    if (mode === 'mix') mode = ['box', 'spin', 'best', 'comb', 'classify', 'norep'][randInt(0, 5)];
    const diff = state.difficulty;
    if (mode === 'spin') return genSpin(diff);
    if (mode === 'best') return genBest(diff);
    if (mode === 'comb') return genComb(diff);
    if (mode === 'classify') return genClassify(diff);
    if (mode === 'norep') return genNorep(diff);
    if (mode === 'sim') return genSim(diff);
    return genBox(diff);
}

/* ---------- genomgångar ---------- */
export function buildProbDemoSteps() {
    const mode = state.probSubMode;
    if (mode === 'spin') return buildSpinDemo();
    if (mode === 'best') return buildBestDemo();
    if (mode === 'comb') return buildCombDemo();
    if (mode === 'classify') return buildClassifyDemo();
    if (mode === 'norep') return buildNorepDemo();
    if (mode === 'sim') return buildSimDemo();
    return buildBoxDemo();
}

function buildBoxDemo() {
    const counts = { red: 2, blue: 3 };
    return { steps: [
        { text: `<p>I lådan finns röda och blå kulor. Titta när de räknas upp – en i taget!</p>`,
          html: ballsHTML(counts, { stagger: true }) },
        { text: `<p>Sannolikhet är ett <strong>bråk</strong>: de utfall du <em>vill</em> ha delat med <em>alla</em> utfall. Nämnaren är alla 5 kulor.</p>`,
          html: `<div class="flex justify-center items-center gap-5 flex-wrap">${ballsHTML(counts)}<div class="demo-pop font-display font-bold text-3xl text-violet-700" style="animation-delay:400ms">${fracHTML('gynnsamma', 'möjliga')}</div></div>` },
        { text: `<p>De <strong>gynnsamma</strong> – de röda – lyser upp en i taget! Det är <strong>2</strong> röda av <strong>5</strong> totalt.</p>`,
          html: `<div class="flex justify-center items-center gap-5 flex-wrap">${ballsHTML(counts, { hlColor: 'red' })}<div class="demo-pop font-display font-bold text-3xl text-violet-700" style="animation-delay:900ms">${fracHTML(2, 5)}</div></div>` },
        { text: `<p>Ser du att bråket aldrig kan vara större än 1? De gynnsamma kan ju aldrig vara fler än de möjliga! Bråk större än 1 i sannolikhet = något är fel.</p>`,
          html: `<div class="demo-pop text-center font-display font-bold text-xl text-slate-700">0 &le; sannolikhet &le; 1</div>` },
        { text: `<p><strong>Din tur!</strong> I en låda finns 3 gröna och 1 gul kula. Vad är chansen att dra en grön?</p>`,
          html: ballsHTML({ green: 3, yellow: 1 }, { stagger: true }),
          guess: { options: [
              { label: fracHTML(3, 4), ok: true },
              { label: fracHTML(1, 4), ok: false },
              { label: fracHTML(4, 3), ok: false },
          ] },
          doneText: 'Rätt! 3 gröna av 4 kulor totalt – 3/4. (Och 4/3 är större än 1 – det kan aldrig vara en sannolikhet!) 🎉' },
    ] };
}

function buildSpinDemo() {
    return { steps: [
        { text: `<p>Du kastar en tärning. Vad är chansen att få <strong>en sexa</strong>? Det finns 6 möjliga utfall – och bara ett av dem är en sexa.</p>`,
          html: diceHTML([6]) },
        { text: `<p>Meningen "minst X" eller "jämnt" är lurig – det är inte ett enda utfall som räknas!</p>`,
          html: `<div class="demo-pop text-center font-display font-bold text-lg text-slate-600">räkna ALLA utfall som uppfyller villkoret</div>` },
        { text: `<p>Men många frågor handlar om händelser där <strong>flera</strong> utfall räknas! Vad är chansen för <strong>minst 4</strong>?</p>`, html: diceHTML() },
        { text: `<p>Markera alla utfall som uppfyller villkoret: 4, 5 och 6 är alla "minst 4" – det är <strong>3 gynnsamma</strong> av 6 möjliga!</p>`,
          html: `${diceHTML([4, 5, 6])}<div class="demo-pop font-display font-bold text-2xl text-violet-700 text-center mt-3">${fracHTML(3, 6)} = ${fracHTML(1, 2)}</div>` },
        { text: `<p>Glöm inte att <strong>förkorta</strong>! 3/6 är samma sak som 1/2 – hälften av alla utfall är gynnsamma.</p>`,
          html: `<div class="demo-pop text-center font-display font-bold text-xl text-slate-700">delar du täljare och nämnare med samma tal ändras inte värdet</div>` },
        { text: `<p><strong>Din tur!</strong> Vad är chansen att få ett <strong>jämnt</strong> tal med tärningen?</p>`,
          html: diceHTML(),
          guess: { options: [
              { label: fracHTML(1, 6), ok: false },
              { label: fracHTML(1, 2), ok: true },
              { label: fracHTML(1, 3), ok: false },
          ] },
          doneText: 'Rätt! 2, 4 och 6 är jämna – 3 av 6 utfall, alltså 3/6 = 1/2. 🎉' },
    ] };
}

function buildBestDemo() {
    const countsA = { red: 2, blue: 2 }, countsB = { red: 3, blue: 7 };
    const row = `<div class="flex flex-wrap justify-center items-start gap-8">
        <div class="flex flex-col items-center gap-1.5"><span class="font-display font-bold text-slate-700">Låda A</span>${ballsHTML(countsA)}</div>
        <div class="flex flex-col items-center gap-1.5"><span class="font-display font-bold text-slate-700">Låda B</span>${ballsHTML(countsB)}</div>
    </div>`;
    return { steps: [
        { text: `<p>Här är ett klurigt exempel! Låda A har <strong>2</strong> röda, låda B har <strong>3</strong> röda. Från vilken låda är det störst chans att dra en röd?</p>`, html: row },
        { text: `<p>Många väljer B direkt – fler röda ju! Men vänta: räkna <strong>alla</strong> kulor. A har 4 totalt, B har hela 10!</p>`, html: row },
        { text: `<p>De röda lyser upp – men titta på <strong>andelen</strong>: A ger ${fracHTML(2, 4)} = ${fracHTML(1, 2)} och B ger bara ${fracHTML(3, 10)}!</p>`,
          html: `<div class="flex flex-wrap justify-center items-start gap-8">
        <div class="flex flex-col items-center gap-1.5"><span class="font-display font-bold text-slate-700">Låda A</span>${ballsHTML(countsA, { hlColor: 'red' })}</div>
        <div class="flex flex-col items-center gap-1.5"><span class="font-display font-bold text-slate-700">Låda B</span>${ballsHTML(countsB, { hlColor: 'red' })}</div>
    </div>` },
        { text: `<p>Som staplar syns det direkt: halva A är röd, men bara en liten bit av B. Hälften mot mindre än en tredjedel – A vinner!</p>`,
          html: `<div class="flex justify-center gap-10 items-end">
            <div class="flex flex-col items-center gap-1"><div class="w-24 h-8 rounded-lg bg-slate-200 overflow-hidden flex"><div class="demo-slice h-full bg-red-500" style="width:50%"></div></div><span class="font-display font-bold text-lg text-emerald-700">A: ${fracHTML(1, 2)}</span></div>
            <div class="flex flex-col items-center gap-1"><div class="w-24 h-8 rounded-lg bg-slate-200 overflow-hidden flex"><div class="demo-slice h-full bg-red-500" style="width:30%;animation-delay:400ms"></div></div><span class="font-display font-bold text-lg text-slate-500">B: ${fracHTML(3, 10)}</span></div>
          </div>` },
        { text: `<p><strong>Nyckelinsikten:</strong> fler röda kulor betyder inte större chans – det är förhållandet mellan röda och alla kulor som räknas. Bråkjämförelse, precis som i bråkmodulen!</p>` },
        { text: `<p><strong>Din tur!</strong> Låda A: 1 röd av 3. Låda B: 2 röda av 4. Vilken ger störst chans på röd?</p>`,
          html: `<div class="flex justify-center gap-8 font-display font-bold text-xl"><span class="demo-pop">A: ${fracHTML(1, 3)}</span><span class="demo-pop">B: ${fracHTML(2, 4)}</span></div>`,
          guess: { options: [
              { label: 'Låda A', ok: false },
              { label: 'Låda B', ok: true },
              { label: 'Lika stora', ok: false },
          ] },
          doneText: 'Rätt! 2/4 = 1/2 och en halv är mer än en tredjedel. B vinner trots att… nej vänta, B har till och med fler röda OCKSÅ – dubbelvinst! 🎉' },
    ] };
}

function buildCombDemo() {
    const grid = `<div class="inline-block bg-violet-50 border-2 border-violet-200 rounded-2xl p-3"><div class="grid gap-1.5" style="grid-template-columns:auto repeat(3,auto)">
        <div></div>${['👖', '🩳', '🩱'].map(e => `<div class="text-2xl text-center w-10">${e}</div>`).join('')}
        ${['👕', '👚'].map((ea, ri) => `<div class="text-2xl w-8 flex items-center justify-center">${ea}</div>` + ['👖', '🩳', '🩱'].map((eb, ci) => `<div class="w-10 h-10 rounded-lg bg-white border border-violet-300 flex items-center justify-center text-sm shadow-sm demo-slice" style="animation-delay:${(ri * 3 + ci) * 220}ms">${ea}${eb}</div>`).join('')).join('')}
    </div></div>`;
    return { steps: [
        { text: `<p>Alva har <strong>2 tröjor</strong> och <strong>3 par byxor</strong>. Hur många olika outfits kan hon sätta ihop?</p>`,
          html: `<div class="flex justify-center gap-6 text-4xl"><span>👕👚</span><span class="text-slate-400">+</span><span>👖🩳🩱</span></div>` },
        { text: `<p>Man kan rita upp alla kombinationer i ett rutnät: varje tröja kan paras med <strong>alla</strong> byxorna. Titta när rutorna fylls i!</p>`, html: grid },
        { text: `<p>Räkna cellerna: 6 stycken! Men ännu smartare: 2 rader × 3 kolumner – <strong>multiplicera bara!</strong></p>`,
          html: `<div class="demo-pop font-display font-bold text-3xl text-violet-700 text-center">2 · 3 = 6 outfits</div>` },
        { text: `<p>Det kallas <strong>multiplikationsprincipen</strong>. Den funkar med fler steg också: 2 tröjor × 3 byxor × 2 mössor = 12! Fällan är att <em>addera</em> – 2+3=5 räknar inte kombinationerna alls.</p>`,
          html: `<div class="demo-pop font-display font-bold text-2xl text-violet-700 text-center">2 · 3 · 2 = 12</div>` },
        { text: `<p><strong>Din tur!</strong> En restaurang har 4 förrätter och 3 varmrätter. Hur många olika middagar kan beställas?</p>`,
          html: `<div class="flex justify-center gap-5 text-4xl"><span>🥗🍲🥖🧀</span><span class="text-slate-400">+</span><span>🍝🍕🐟</span></div>`,
          guess: { options: [
              { label: '7', ok: false },
              { label: '12', ok: true },
              { label: '64', ok: false },
          ] },
          doneText: 'Rätt! 4 · 3 = 12 middagar. (7 är additionsfällan – den räknar bara valen var för sig!) 🎉' },
    ] };
}

function buildClassifyDemo() {
    return { steps: [
        { text: `<p>Sannolikheten för en händelse ligger alltid mellan <strong>0 och 1</strong>. Två ytterligheter har egna namn!</p>`,
          html: `<div class="max-w-md mx-auto"><div class="h-3 rounded-full bg-gradient-to-r from-red-300 via-amber-200 to-emerald-400 relative demo-pop"><div class="absolute -top-1.5 left-0 w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow demo-pop" style="animation-delay:300ms"></div><div class="absolute -top-1.5 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow demo-pop" style="animation-delay:600ms"></div><div class="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-400 border-2 border-white shadow demo-pop" style="animation-delay:900ms"></div></div><div class="flex justify-between mt-2 font-display font-bold text-sm"><span class="text-red-700">0 = omöjlig</span><span class="text-amber-700">möjlig</span><span class="text-emerald-700">1 = säker</span></div></div>` },
        { text: `<p>En <strong>omöjlig</strong> händelse kan aldrig hända: en tärning som visar 7, eller en grön kula ur en låda utan gröna kulor.</p>`, html: diceHTML() },
        { text: `<p>En <strong>säker</strong> händelse händer ALLTID: tärningen visar alltid ett tal mindre än 7 – prickarna kan inte bli något annat!</p>`, html: diceHTML() },
        { text: `<p>Allt däremellan är <strong>möjligt</strong>: att få just en fyra kan hända – men inte varje gång. Då är sannolikheten ett bråk mellan 0 och 1.</p>` },
        { text: `<p><strong>Din tur!</strong> I en låda finns bara blå kulor. "Jag drar en blå kula" – vad är det för händelse?</p>`,
          html: ballsHTML({ blue: 5 }),
          guess: { options: [
              { label: 'Omöjlig', ok: false },
              { label: 'Möjlig', ok: false },
              { label: 'Säker', ok: true },
          ] },
          doneText: 'Rätt! Det finns inga andra kulor – du kan omöjligt dra något annat. Händelsen är säker, P = 1! 🎉' },
    ] };
}
