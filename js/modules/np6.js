// js/modules/np6.js — NP-förberedelser åk 6: bråkförståelse
// Bygger på nationella provets muntliga delprov (bråk): jämföra bråk,
// storleksordna, placera på tallinjen och känna igen bråk i bilder
// (lika stora delar-begreppet + ekvivalenta bråk).
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { formatFractionHTML, randInt, showFeedback, shuffleArray, styleNumbersIn } from '../utils.js';

export function setNp6SubMode(mode) {
    playSound('click');
    state.np6SubMode = mode;
    generateNp6Question();
}

function gcd(x, y) { return y === 0 ? x : gcd(y, x % y); }
// Jämför två bråk: negativt om f1 < f2 (korsmultiplikation, exakt).
function cmpFrac(f1, f2) { return f1.n * f2.d - f2.n * f1.d; }
function fracVal(f) { return f.n / f.d; }

const fracHtml = f => formatFractionHTML(f.n, f.d);

// NP-autentiska parstrategier: samma täljare, nära 1, mot en halv,
// över 1, och (lätt) samma nämnare.
function genComparePair(diff) {
    const types = diff === 'easy' ? ['sameDen', 'sameNum', 'bench']
        : diff === 'medium' ? ['sameNum', 'nearOne', 'bench', 'overOne']
        : ['sameNum', 'nearOne', 'bench', 'overOne'];
    const type = types[randInt(0, types.length - 1)];
    if (type === 'sameDen') {
        const d = [6, 8, 10, 12][randInt(0, 3)];
        const n1 = randInt(1, d - 2);
        let n2 = randInt(n1 + 1, d - 1);
        return { pair: [{ n: n1, d }, { n: n2, d }], strat: 'sameDen' };
    }
    if (type === 'sameNum') {
        const n = randInt(2, diff === 'easy' ? 4 : 7);
        const d1 = randInt(n + 1, n + 5);
        const d2 = d1 + randInt(1, 3);
        return { pair: [{ n, d: d1 }, { n, d: d2 }], strat: 'sameNum' };
    }
    if (type === 'nearOne') {
        const d1 = randInt(5, diff === 'medium' ? 9 : 12);
        const d2 = d1 + randInt(1, 2);
        return { pair: [{ n: d1 - 1, d: d1 }, { n: d2 - 1, d: d2 }], strat: 'nearOne' };
    }
    if (type === 'overOne') {
        // Ett bråk över 1, ett under – träffsäker strategi: bara ett bråk
        // kan vara större än en hel.
        const d1 = randInt(3, 8);
        const f1 = { n: d1 + randInt(1, d1 - 1), d: d1 };
        const d2 = randInt(4, 9);
        const f2 = { n: randInt(1, d2 - 1), d: d2 };
        if (Math.abs(fracVal(f1) - fracVal(f2)) < 0.15) return genComparePair(diff);
        return { pair: [f1, f2], strat: 'overOne' };
    }
    // bench: båda på samma sida om en halv men tydligt olika – klassiska
    // NP-par som 2/5 mot 4/9 eller 3/5 mot 5/9.
    for (let tries = 0; tries < 30; tries++) {
        const d1 = [4, 5, 6, 8, 9, 10][randInt(0, 5)];
        const d2 = [4, 5, 6, 8, 9, 10][randInt(0, 5)];
        const f1 = { n: randInt(1, d1 - 1), d: d1 };
        const f2 = { n: randInt(1, d2 - 1), d: d2 };
        const c = cmpFrac(f1, f2);
        if (c === 0) continue;
        const v1 = fracVal(f1), v2 = fracVal(f2);
        const sameSide = (v1 - 0.5) * (v2 - 0.5) > 0;
        const diffv = Math.abs(v1 - v2);
        if (sameSide && diffv > 0.05 && diffv < 0.35 && f1.d !== f2.d) return { pair: [f1, f2], strat: 'bench' };
    }
    return { pair: [{ n: 2, d: 5 }, { n: 4, d: 9 }], strat: 'bench' };
}

// Strategiförklaringar – NP:s motiveringskrav i miniformat.
function stratText(strat, small, big) {
    const s = fracHtml(small), b = fracHtml(big);
    if (strat === 'sameDen') return `${s} är minst – nämnaren är samma, och ${small.n} delar är färre än ${big.n} delar!`;
    if (strat === 'sameNum') return `${s} är minst – täljaren är samma, men ju fler delar helan delats i, desto <strong>mindre</strong> är varje del. ${small.d}-delar är mindre än ${big.d}-delar!`;
    if (strat === 'nearOne') return `${b} är störst – räkna vad som fattas till en hel! Till ${b} fattas ${fracHtml({ n: 1, d: big.d })}, till ${s} fattas ${fracHtml({ n: 1, d: small.d })} – och ${fracHtml({ n: 1, d: big.d })} är mindre.`;
    if (strat === 'overOne') return `${s} är minst – det är <strong>mindre än en hel</strong> (täljaren är mindre än nämnaren), medan ${b} är mer än en hel!`;
    return `${s} är minst – jämför gärna med en halv! ${s} är ${fracVal(small) < 0.5 ? 'mindre' : 'större'} än ½ och ${b} är ${fracVal(big) < 0.5 ? 'mindre' : 'större'} än ½ – eller tänk på hur långt från halva vardera ligger.`;
}

function fracCardHtml(f, extra = '') {
    return `<div class="inline-flex items-center justify-center bg-white border-3 border-amber-300 rounded-2xl px-6 py-4 font-display font-bold text-3xl text-slate-900 ${extra}">${fracHtml(f)}</div>`;
}

export function generateNp6Question() {
    document.getElementById('np6-feedback').classList.add('hidden');
    document.getElementById('np6-next-wrap').classList.add('hidden');

    let mode = state.np6SubMode;
    if (mode === 'mix') mode = ['compare', 'order', 'numberline', 'images'][randInt(0, 3)];
    const diff = state.difficulty;
    const qEl = document.getElementById('np6-question-text');
    const visEl = document.getElementById('np6-visual');
    const optsEl = document.getElementById('np6-options');
    const badgeEl = document.getElementById('np6-mode-badge');
    visEl.innerHTML = '';
    visEl.classList.add('hidden');
    optsEl.innerHTML = '';
    optsEl.classList.remove('hidden');

    if (mode === 'compare') {
        badgeEl.textContent = '⚖️ Jämför bråk';
        const askNearestHalf = Math.random() < 0.25;
        if (askNearestHalf) {
            // Par H i provet: vilket bråk ligger närmast en halv?
            let f1, f2;
            for (let tries = 0; tries < 40; tries++) {
                const d1 = [4, 5, 6, 8, 9, 10, 12][randInt(0, 6)];
                const d2 = [4, 5, 6, 8, 9, 10, 12][randInt(0, 6)];
                f1 = { n: randInt(1, d1 - 1), d: d1 };
                f2 = { n: randInt(1, d2 - 1), d: d2 };
                if (d1 === d2) continue;
                const dist1 = Math.abs(fracVal(f1) - 0.5), dist2 = Math.abs(fracVal(f2) - 0.5);
                if (Math.abs(dist1 - dist2) > 0.04 && dist1 > 0.001 && dist2 > 0.001) break;
            }
            const correctIdx = Math.abs(fracVal(f1) - 0.5) < Math.abs(fracVal(f2) - 0.5) ? 0 : 1;
            state.currentNp6 = { mode, kind: 'nearest', pair: [f1, f2], correctIdx };
            qEl.innerHTML = `Vilket bråk ligger <strong>närmast en halv</strong>?`;
            setHintSteps('np6', [
                `<p>Tänk på hur långt varje bråk är från <strong>en halv</strong>. En halv av ${f1.d} är ${f1.d / 2} – ${fracHtml(f1)} är ${fracVal(f1) < 0.5 ? 'lite mindre' : 'lite större'} än så.</p>`,
                `<p>Jämför avstånden: det bråk som har <strong>minst avstånd</strong> till ½ vinner!</p>`
            ]);
        } else {
            const { pair, strat } = genComparePair(diff);
            const askSmallest = Math.random() < 0.7; // NP frågar mest om minst
            const c = cmpFrac(pair[0], pair[1]);
            const smallIdx = c < 0 ? 0 : 1;
            const correctIdx = askSmallest ? smallIdx : 1 - smallIdx;
            state.currentNp6 = { mode, kind: askSmallest ? 'smallest' : 'largest', pair, correctIdx, strat };
            qEl.innerHTML = `Klicka på det bråk som är <strong>${askSmallest ? 'minst' : 'störst'}</strong>!`;
            const s = pair[smallIdx], b = pair[1 - smallIdx];
            const hints = {
                sameDen: [`<p>Nämnaren är <strong>samma</strong> i båda bråken – då räcker det att jämföra täljarna: färre delar = mindre bråk!</p>`],
                sameNum: [`<p>Täljaren är <strong>samma</strong>! Tänk: om en kaka delas i ${s.d} bitar eller ${b.d} bitar – i vilken blir bitarna <strong>mindre</strong>?</p>`, `<p>Ju fler delar, desto mindre varje del. Alltså är ${fracHtml(s)} mindre än ${fracHtml(b)}!</p>`],
                nearOne: [`<p>Båda bråken är <strong>nära en hel</strong>! Räkna i stället vad som <strong>fattas</strong> till 1: den som har minst kvar är störst.</p>`],
                overOne: [`<p>Kolla täljare mot nämnare: är täljaren <strong>större</strong> än nämnaren är bråket mer än en hel – annars mindre. Bara ett av bråken kan vara över 1!</p>`],
                bench: [`<p>Använd <strong>en halv</strong> som måttstock! Är bråket mer eller mindre än ½? En halv av nämnaren är halva bråket.</p>`],
            };
            setHintSteps('np6', hints[strat] || hints.bench);
        }
        optsEl.className = 'flex flex-wrap justify-center gap-4 max-w-2xl mx-auto mt-4';
        const pair = state.currentNp6.pair;
        optsEl.innerHTML = shuffleArray([0, 1]).map(pos => `
            <button onclick="checkNp6Compare(${pos})" class="btn-3d bg-white hover:bg-amber-50 border-3 border-amber-300 rounded-2xl px-8 py-5 font-display font-bold text-3xl text-slate-900">${fracHtml(pair[pos])}</button>
        `).join('');
        return;
    }

    if (mode === 'order') {
        badgeEl.textContent = '🔀 Storleksordna';
        // Fyra bråk med tydligt olika värden – som NP:s bråkkort A–D.
        const dens = diff === 'easy' ? [2, 3, 4, 6] : diff === 'medium' ? [3, 4, 5, 6, 8, 9] : [4, 5, 6, 7, 8, 9, 10, 12];
        const fracs = [];
        for (let tries = 0; tries < 200 && fracs.length < 4; tries++) {
            const d = dens[randInt(0, dens.length - 1)];
            const f = { n: randInt(1, d - 1), d };
            if (fracs.every(o => cmpFrac(f, o) !== 0 && Math.abs(fracVal(f) - fracVal(o)) > 0.06)) fracs.push(f);
        }
        const order = fracs.map((f, i) => i).sort((x, y) => cmpFrac(fracs[x], fracs[y]));
        state.currentNp6 = { mode, fracs, order, picked: [] };
        qEl.innerHTML = `Lägg bråken i <strong>storleksordning</strong> – klicka på det <strong>minsta först</strong>!`;
        setHintSteps('np6', [
            `<p>Jämför två och två först – eller använd <strong>en halv</strong> som måttstock: vilka är under, vilka är över?</p>`,
            `<p>Samma täljare? Då är bråket med <strong>störst nämnare</strong> minst. Nära en hel? Räkna vad som fattas!</p>`
        ]);
        optsEl.className = 'flex flex-wrap justify-center gap-4 max-w-2xl mx-auto mt-4';
        renderNp6Order();
        return;
    }

    if (mode === 'numberline') {
        badgeEl.textContent = '📏 Bråk på tallinjen';
        // Easy: linje 0–1 med bråk under 1. Medel/hard: linje 0–2, bråk
        // kan vara över 1 – då måste eleven först hitta var 1 ligger.
        const span = diff === 'easy' ? 1 : 2;
        let f;
        for (let tries = 0; tries < 40; tries++) {
            const d = diff === 'easy' ? [2, 3, 4, 5, 6, 8][randInt(0, 5)] : [3, 4, 5, 6, 7, 8, 9, 10][randInt(0, 7)];
            const maxN = span === 1 ? d - 1 : Math.min(d * 2 - 1, d + 3);
            f = { n: randInt(1, maxN), d };
            if (f.n !== f.d && fracVal(f) <= span) break;
        }
        state.currentNp6 = { mode, frac: f, span, clicked: null };
        qEl.innerHTML = `Var på tallinjen ligger ${fracHtml(f)}? <strong>Klicka på linjen!</strong>`;
        setHintSteps('np6', span === 1 ? [
            `<p>Tänk: hur stor är <strong>en</strong> ${f.d}-del av sträckan? Dela upp sträckan i ${f.d} tankenämnda delar och räkna ${f.n} av dem!</p>`,
            `<p>Använd <strong>en halv</strong> som stöd – ligger bråket före eller efter mitten?</p>`
        ] : [
            `<p>Bråket är ${fracVal(f) > 1 ? '<strong>större än 1</strong> – först måste du hitta var en hel ligger' : 'mindre än 1'}! Tänk: var är mitten på linjen?</p>`,
            `<p>En hel är ${f.d} ${f.d}-delar. Räkna ${f.n} sådana delar från 0!</p>`
        ]);
        renderNp6Line();
        return;
    }

    // images — vilka bilder visar verkligen bråket? (lika stora delar!)
    badgeEl.textContent = '🖼️ Bråk i bilder';
    const den = diff === 'easy' ? [2, 3, 4][randInt(0, 2)] : diff === 'medium' ? [3, 4, 5, 6][randInt(0, 3)] : [4, 5, 6, 8][randInt(0, 3)];
    const num = randInt(1, den - 1);
    state.currentNp6 = { mode, frac: { n: num, d: den }, cards: genImageCards(num, den), chosen: new Set() };
    qEl.innerHTML = `Vilka bilder visar ${fracHtml({ n: num, d: den })}? <strong>Klicka på alla som stämmer</strong> – sen Kolla!`;
    setHintSteps('np6', [
        `<p>Viktigast av allt: delarna måste vara <strong>lika stora</strong>! Annars är det inte riktiga ${den === 2 ? 'halvor' : den === 3 ? 'tredjedelar' : den === 4 ? 'fjärdedelar' : den + '-delar'} – även om antalet ser rätt ut.</p>`,
        `<p>Räkna sedan: är det ${num} av ${den} lika delar som är färgade? Kom ihåg att samma andel kan skrivas med <strong>annat bråk</strong> – ${formatFractionHTML(num, den)} är lika mycket som ${formatFractionHTML(num * 2, den * 2)}!</p>`
    ]);
    renderNp6Images();
}

/* ---------- Jämför ---------- */
export function checkNp6Compare(pos) {
    if (!document.getElementById('np6-next-wrap').classList.contains('hidden')) return;
    const cur = state.currentNp6;
    if (!cur || cur.mode !== 'compare') return;
    if (pos === cur.correctIdx) {
        playSound('correct');
        addReward(1);
        const pair = cur.pair;
        let msg;
        if (cur.kind === 'nearest') {
            const winner = pair[cur.correctIdx];
            msg = `🎉 Rätt! ${fracHtml(winner)} ligger närmast en halv!`;
        } else {
            const smallIdx = cmpFrac(pair[0], pair[1]) < 0 ? 0 : 1;
            msg = `🎉 Rätt! ${stratText(cur.strat, pair[smallIdx], pair[1 - smallIdx])}`;
        }
        showFeedback('np6-feedback', true, msg);
        document.getElementById('np6-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        playSound('wrong');
        showFeedback('np6-feedback', false, cur.kind === 'nearest'
            ? '🤔 Tänk på avståndet till en halv – vilket bråk har kortast väg dit?'
            : '🤔 Inte riktigt – titta på ledtråden 💡 för ett smart sätt att jämföra!');
    }
}

/* ---------- Storleksordna ---------- */
function renderNp6Order() {
    const cur = state.currentNp6;
    const optsEl = document.getElementById('np6-options');
    optsEl.innerHTML = cur.fracs.map((f, i) => {
        const pickIdx = cur.picked.indexOf(i);
        const picked = pickIdx !== -1;
        return `<button onclick="np6OrderClick(${i})" ${picked ? 'disabled' : ''} class="btn-3d relative bg-white hover:bg-amber-50 border-3 ${picked ? 'border-emerald-500 bg-emerald-50' : 'border-amber-300'} rounded-2xl px-7 py-5 font-display font-bold text-3xl text-slate-900 ${picked ? 'opacity-90' : ''}">
            ${picked ? `<span class="absolute -top-2.5 -left-2.5 w-7 h-7 rounded-full bg-emerald-500 text-white text-sm font-extrabold flex items-center justify-center">${pickIdx + 1}</span>` : ''}
            ${fracHtml(f)}
        </button>`;
    }).join('');
}

export function np6OrderClick(i) {
    const cur = state.currentNp6;
    if (!cur || cur.mode !== 'order') return;
    if (!document.getElementById('np6-next-wrap').classList.contains('hidden')) return;
    const expect = cur.order[cur.picked.length];
    if (i === expect) {
        playSound('click');
        cur.picked.push(i);
        renderNp6Order();
        if (cur.picked.length === cur.fracs.length) {
            addReward(2);
            showFeedback('np6-feedback', true, `🎉 Hela ordningen rätt! ${cur.order.map(x => fracHtml(cur.fracs[x])).join(' &lt; ')}`);
            document.getElementById('np6-next-wrap').classList.remove('hidden');
        }
    } else {
        resetStreak();
        playSound('wrong');
        const actual = cur.fracs[i], wanted = cur.fracs[expect];
        showFeedback('np6-feedback', false, cur.picked.length === 0
            ? `🤔 ${fracHtml(actual)} är inte minst – jämför med de andra innan du klickar!`
            : `🤔 Nästan – men ${fracHtml(actual)} är större än något som är kvar. Vilket bråk är minst av de som är kvar?`);
    }
}

/* ---------- Tallinjen ---------- */
function renderNp6Line() {
    const cur = state.currentNp6;
    const visEl = document.getElementById('np6-visual');
    visEl.classList.remove('hidden');
    const W = 520, H = 96, pad = 36;
    const x0 = pad, x1 = W - pad;
    const px = v => x0 + (v / cur.span) * (x1 - x0);
    // Heltalsstreck (1 syns bara som streck på linjen, utan siffra, på
    // 0–2-linjen – eleven ska själv inse var en hel är).
    let ticks = '';
    for (let t = 0; t <= cur.span; t++) {
        const label = (t === 0 || t === cur.span) ? `<text x="${px(t)}" y="72" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="16" fill="#1e293b">${t}</text>` : '';
        ticks += `<line x1="${px(t)}" y1="34" x2="${px(t)}" y2="46" stroke="#94a3b8" stroke-width="2.5" />${label}`;
    }
    const marker = cur.clicked !== null ? `
        <g class="demo-pop">
            <line x1="${px(cur.clicked)}" y1="18" x2="${px(cur.clicked)}" y2="48" stroke="#e11d48" stroke-width="3.5" stroke-linecap="round" />
            <circle cx="${px(cur.clicked)}" cy="18" r="6" fill="#e11d48" />
        </g>` : '';
    visEl.innerHTML = `
        <svg id="np6-line-svg" width="100%" viewBox="0 0 ${W} ${H}" class="max-w-xl mx-auto cursor-crosshair select-none">
            <line x1="${x0}" y1="40" x2="${x1}" y2="40" stroke="#0f172a" stroke-width="4" stroke-linecap="round" />
            <polygon points="${x1},40 ${x1 - 12},33 ${x1 - 12},47" fill="#0f172a" />
            ${ticks}
            ${marker}
        </svg>`;
    const svg = document.getElementById('np6-line-svg');
    svg.addEventListener('click', (ev) => {
        const rect = svg.getBoundingClientRect();
        const frac = ((ev.clientX - rect.left) / rect.width) * (W / rect.width * rect.width) / W; // proportion of viewbox
        const vbX = ((ev.clientX - rect.left) / rect.width) * W;
        const v = Math.max(0, Math.min(cur.span, ((vbX - x0) / (x1 - x0)) * cur.span));
        np6LineGuess(v);
    });
}

export function np6LineGuess(v) {
    const cur = state.currentNp6;
    if (!cur || cur.mode !== 'numberline') return;
    if (!document.getElementById('np6-next-wrap').classList.contains('hidden')) return;
    cur.clicked = v;
    renderNp6Line();
    const target = fracVal(cur.frac);
    const tol = cur.span * 0.045;
    if (Math.abs(v - target) <= tol) {
        playSound('correct');
        addReward(2);
        showFeedback('np6-feedback', true, `🎉 Mitt i prick! ${fracHtml(cur.frac)} ligger ${fracVal(cur.frac) > 1 ? 'efter en hel – bra att du hittade den' : 'precis där'}!`);
        document.getElementById('np6-next-wrap').classList.remove('hidden');
    } else {
        playSound('click');
        const dir = v < target ? 'lite längre åt <strong>höger</strong>' : 'lite längre åt <strong>vänster</strong>';
        showFeedback('np6-feedback', false, `🔎 Nära! Men ${fracHtml(cur.frac)} ligger ${dir} – tänk på hur stora ${cur.frac.d}-delarna är.`);
    }
}

/* ---------- Bråk i bilder ---------- */
// Rektangel indelad i vertikala stjälpar; equal=false ger ojämna
// bredder (NP-fällan: rätt antal färgade men inte lika stora delar).
function rectDivSvg(parts, colored, equal, seedShift = 0) {
    const W = 150, H = 96;
    let widths;
    if (equal) {
        widths = Array(parts).fill(W / parts);
    } else {
        // Variera bredderna påtagligt men summan = W.
        const weights = Array.from({ length: parts }, (_, i) => 0.7 + ((i * 37 + seedShift * 13) % 10) / 12);
        const sum = weights.reduce((s, w) => s + w, 0);
        widths = weights.map(w => (w / sum) * W);
    }
    let x = 0, rects = '';
    for (let i = 0; i < parts; i++) {
        const w = widths[i];
        rects += `<rect x="${x.toFixed(1)}" y="0" width="${w.toFixed(1)}" height="${H}" fill="${i < colored ? '#a78bfa' : '#ffffff'}" stroke="#334155" stroke-width="2.2" />`;
        x += w;
    }
    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${rects}</svg>`;
}

// Cirkel indelad i tårtbitar; equal=false ger ojämna vinklar.
function pieDivSvg(parts, colored, equal, seedShift = 0) {
    const R = 46, cx = 52, cy = 52;
    let angles;
    if (equal) {
        angles = Array(parts).fill(360 / parts);
    } else {
        const weights = Array.from({ length: parts }, (_, i) => 0.72 + ((i * 29 + seedShift * 11) % 10) / 13);
        const sum = weights.reduce((s, w) => s + w, 0);
        angles = weights.map(w => (w / sum) * 360);
    }
    let a0 = -90, paths = '';
    for (let i = 0; i < parts; i++) {
        const a1 = a0 + angles[i];
        const large = angles[i] > 180 ? 1 : 0;
        const x1 = cx + R * Math.cos(a0 * Math.PI / 180), y1 = cy + R * Math.sin(a0 * Math.PI / 180);
        const x2 = cx + R * Math.cos(a1 * Math.PI / 180), y2 = cy + R * Math.sin(a1 * Math.PI / 180);
        paths += `<path d="M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${i < colored ? '#a78bfa' : '#ffffff'}" stroke="#334155" stroke-width="2.2" />`;
        a0 = a1;
    }
    return `<svg width="104" height="104" viewBox="0 0 104 104">${paths}</svg>`;
}

function genImageCards(num, den) {
    // Korttyper: correct-equal (n av d lika), correct-equiv (2n av 2d
    // lika), trap-unequal (rätt antal men ojämna delar!), wrong-count.
    const usePie = () => Math.random() < 0.45;
    const draw = (parts, colored, equal, seed) => usePie() ? pieDivSvg(parts, colored, equal, seed) : rectDivSvg(parts, colored, equal, seed);
    const cards = [
        { svg: draw(den, num, true, 1), correct: true, why: 'equal' },
        { svg: draw(den, num, false, 2), correct: false, why: 'unequal' },
    ];
    if (Math.random() < 0.6) {
        cards.push({ svg: draw(den * 2, num * 2, true, 3), correct: true, why: 'equiv' });
    } else {
        const wrongN = num === 1 ? num + 1 : num - 1;
        cards.push({ svg: draw(den, wrongN, true, 3), correct: false, why: 'count' });
    }
    const d2 = den + randInt(1, 2);
    cards.push({ svg: draw(d2, num, true, 4), correct: false, why: 'denom' });
    return shuffleArray(cards);
}

function renderNp6Images() {
    const cur = state.currentNp6;
    const visEl = document.getElementById('np6-visual');
    visEl.classList.remove('hidden');
    visEl.innerHTML = `
        <div class="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            ${cur.cards.map((c, i) => `
                <button onclick="np6ImageToggle(${i})" class="btn-3d rounded-2xl border-3 p-2.5 ${cur.chosen.has(i) ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white hover:border-violet-300'}">
                    ${c.svg}
                </button>`).join('')}
        </div>
        <div class="mt-4">
            <button onclick="checkNp6Images()" class="btn-3d bg-gradient-to-r from-violet-500 to-purple-600 text-white font-display font-bold text-lg px-7 py-2.5 rounded-2xl">Kolla! ✓</button>
        </div>`;
}

export function np6ImageToggle(i) {
    const cur = state.currentNp6;
    if (!cur || cur.mode !== 'images') return;
    if (!document.getElementById('np6-next-wrap').classList.contains('hidden')) return;
    playSound('click');
    if (cur.chosen.has(i)) cur.chosen.delete(i); else cur.chosen.add(i);
    renderNp6Images();
}

export function checkNp6Images() {
    const cur = state.currentNp6;
    if (!cur || cur.mode !== 'images') return;
    if (!document.getElementById('np6-next-wrap').classList.contains('hidden')) return;
    const correctIdx = cur.cards.map((c, i) => c.correct ? i : -1).filter(i => i !== -1);
    const chosenCorrect = [...cur.chosen].filter(i => cur.cards[i].correct);
    const chosenWrong = [...cur.chosen].filter(i => !cur.cards[i].correct);
    if (chosenCorrect.length === correctIdx.length && chosenWrong.length === 0 && cur.chosen.size > 0) {
        playSound('correct');
        addReward(2);
        const hasEquiv = cur.cards.some(c => c.correct && c.why === 'equiv');
        showFeedback('np6-feedback', true, `🎉 Alla rätt! ${hasEquiv ? 'En av dem visade samma andel med <strong>dubbelt så många delar</strong> – ekvivalenta bråk!' : 'Du kollade både att delarna är lika stora och att antalet stämmer!'}`);
        document.getElementById('np6-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        playSound('wrong');
        const trappedUnequal = chosenWrong.some(i => cur.cards[i].why === 'unequal');
        showFeedback('np6-feedback', false, trappedUnequal
            ? '🤔 SE UPP! En bild har rätt <em>antal</em> färgade delar men delarna är <strong>inte lika stora</strong> – då är det inte ett riktigt bråk!'
            : '🤔 Inte alla stämmer – räkna delarna i varje bild och kolla att de är <strong>lika stora</strong>. Kom ihåg att bråket kan finnas i förklädnad (dubbla delar)!');
    }
}
