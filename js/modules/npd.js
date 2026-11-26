// js/modules/npd.js — NP-förberedelser åk 6: tal i decimalform
// Bygger på 2018 års muntliga delprov (bollarna): jämföra decimaler
// med sifferfällor, avslutande nollor (0,250 = 0,25), storleksordna
// vikter, avläsa spridningsdiagram och placera punkter i diagram.
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { randInt, showFeedback, shuffleArray } from '../utils.js';
import { enableDragSort } from '../visuals.js';

export function setNpdSubMode(mode) {
    playSound('click');
    state.npdSubMode = mode;
    generateNpdQuestion();
}

// Svensk decimalcomma: 0.25 → "0,25"
function fmtDec(x) {
    return String(Math.round(x * 1000) / 1000).replace('.', ',');
}
// Decimal exakt som sträng med fast antal värdesiffror, t.ex. (0.25, 3) → "0,250"
function fmtDecFixed(x, decimals) {
    return x.toFixed(decimals).replace('.', ',');
}

const BALL_COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a78bfa'];

// Boll-SVG: färgglad boll med viktext under (eller inuti).
function ballSvg(color, label, size = 64) {
    const r = size / 2 - 3;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <defs><radialGradient id="bg${color.slice(1)}" cx="35%" cy="30%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/><stop offset="100%" stop-color="${color}"/></radialGradient></defs>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="url(#bg${color.slice(1)})" stroke="#1e293b" stroke-width="2" />
    </svg>${label ? `<div class="font-display font-bold text-lg sm:text-xl text-slate-900 -mt-1">${label}</div>` : ''}`;
}

// Hundrarutnät: 10×10 rutor där n är skuggade – visualiserar hundradelar.
function hundredGrid(n, opts = {}) {
    const { size = 120, color = '#a78bfa', stagger = false, delayBase = 0 } = opts;
    const c = size / 10;
    let cells = '';
    for (let i = 0; i < 100; i++) {
        const x = (i % 10) * c, y = Math.floor(i / 10) * c;
        const filled = i < n;
        const cls = stagger && filled ? 'demo-slice' : '';
        const dl = stagger && filled ? ` style="animation-delay:${delayBase + i * 22}ms"` : '';
        cells += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${c.toFixed(1)}" height="${c.toFixed(1)}" fill="${filled ? color : '#fff'}" stroke="#cbd5e1" stroke-width="0.8" class="${cls}"${dl}/>`;
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect x="0" y="0" width="${size}" height="${size}" fill="none" stroke="#334155" stroke-width="2.2"/>${cells}</svg>`;
}

/* ---------- Jämför: NP-autentiska sifferfällor ---------- */
function genDecCompare(diff) {
    // typ digitTrap: 0,x mot 0,yz – den naiva läsningen "25 > 4" felar
    // typ moreDigits: 0,xy mot 0,xys – fler siffror ser större ut
    // typ trailing: avslutande nolla i en av dem, men olika värden
    const types = diff === 'easy' ? ['digitTrap', 'digitTrap', 'plain']
        : diff === 'medium' ? ['digitTrap', 'moreDigits', 'trailing']
        : ['digitTrap', 'moreDigits', 'trailing', 'moreDigits'];
    const type = types[randInt(0, types.length - 1)];
    if (type === 'digitTrap') {
        const t = randInt(2, 8); // tiondelar
        let h = randInt(11, 99);
        if (h % 10 === 0) h += 1;
        const a = t / 10, b = h / 100;
        if (Math.abs(a - b) < 0.06) return genDecCompare(diff);
        return { pair: [{ v: a, s: fmtDecFixed(a, 1) }, { v: b, s: fmtDecFixed(b, 2) }], strat: 'digitTrap' };
    }
    if (type === 'moreDigits') {
        const h = randInt(2, 8) * 10 + randInt(1, 9); // tvåsiffrigt icke-jämnt
        const th = h * 10 + randInt(1, 9);
        const a = h / 100, b = th / 1000;
        if (Math.abs(a - b) < 0.02) return genDecCompare(diff);
        return { pair: [{ v: a, s: fmtDecFixed(a, 2) }, { v: b, s: fmtDecFixed(b, 3) }], strat: 'moreDigits' };
    }
    if (type === 'trailing') {
        const h = randInt(2, 8) * 10 + randInt(1, 9);
        const a = h / 100;
        // b skiljer sig lite: plusminus några hundradelar, skrivet med nolla
        const b = Math.round((a + (Math.random() < 0.5 ? 0.1 : -0.1) + randInt(0, 4) / 100) * 1000) / 1000;
        if (b <= 0 || Math.abs(a - b) < 0.015) return genDecCompare(diff);
        const aS = Math.random() < 0.5 ? fmtDecFixed(a, 3) : fmtDecFixed(a, 2);
        return { pair: [{ v: a, s: aS }, { v: b, s: fmtDecFixed(b, Math.abs(b * 100 - Math.round(b * 100)) < 1e-9 ? 2 : 3) }], strat: 'trailing' };
    }
    const a = randInt(2, 8) / 10;
    let b = randInt(2, 8) / 10;
    if (a === b) b = a === 0.8 ? 0.2 : a + 0.1;
    return { pair: [{ v: a, s: fmtDecFixed(a, 1) }, { v: b, s: fmtDecFixed(b, 1) }], strat: 'plain' };
}

/* ---------- Samma vikt? – avslutande nollor ---------- */
function genDecSame(diff) {
    const equal = Math.random() < 0.5;
    const h = randInt(1, 8) * 10 + randInt(0, 9);
    const base = h / 100;
    if (equal) {
        // 0,25 mot 0,250 eller 0,5 mot 0,50 – avslutande nollor ändrar inget
        const short = h % 10 === 0 ? fmtDecFixed(base, 1) : fmtDecFixed(base, 2);
        const long = h % 10 === 0 ? fmtDecFixed(base, 2) : fmtDecFixed(base, 3);
        return { pair: [{ v: base, s: short }, { v: base, s: long }], equal: true };
    }
    // Nära men olika: skifta en decimal eller tappa en nolla i mitten
    const variant = randInt(0, 2);
    let other;
    if (variant === 0) other = base + (Math.random() < 0.5 ? 0.1 : -0.1);       // tiondel skiljer
    else if (variant === 1) other = base + randInt(1, 5) / 100 * (Math.random() < 0.5 ? 1 : -1); // hundradelar
    else other = base / 10;                                                     // decimalpunktsflytt!
    if (other <= 0 || other === base) return genDecSame(diff);
    const decs = Math.abs(other * 1000 - Math.round(other * 1000)) < 1e-9 ? (Math.abs(other * 100 - Math.round(other * 100)) < 1e-9 ? 2 : 3) : 3;
    return { pair: [{ v: base, s: fmtDecFixed(base, 2) }, { v: other, s: fmtDecFixed(other, decs) }], equal: false };
}

/* ---------- Spridningsdiagram (massa/studshöjd) ---------- */
// x: massa 0–1 kg (stora streck var 0,2, etiketter), y: studshöjd 0–100 cm.
function scatterSvg(points, opts = {}) {
    const { hiPoint = -1, followLines = null, candidates = null, horizY = null } = opts;
    const W = 440, H = 300, padL = 52, padB = 44, padT = 14, padR = 18;
    const x0 = padL, y0 = H - padB, x1 = W - padR, y1 = padT;
    const px = v => x0 + (v / 1) * (x1 - x0);
    const py = v => y0 - (v / 100) * (y0 - y1);
    let g = '';
    // rutnät: minor var 0,1 kg / 10 cm, major var 0,2 / 20
    for (let i = 1; i < 10; i++) {
        const major = i % 2 === 0;
        g += `<line x1="${px(i / 10)}" y1="${y0}" x2="${px(i / 10)}" y2="${y1}" stroke="${major ? '#cbd5e1' : '#eef2f7'}" stroke-width="${major ? 1.4 : 1}" />`;
    }
    for (let j = 1; j < 10; j++) {
        const major = j % 2 === 0;
        g += `<line x1="${x0}" y1="${py(j * 10)}" x2="${x1}" y2="${py(j * 10)}" stroke="${major ? '#cbd5e1' : '#eef2f7'}" stroke-width="${major ? 1.4 : 1}" />`;
    }
    // axlar + etiketter
    g += `<line x1="${x0}" y1="${y0}" x2="${x1 + 6}" y2="${y0}" stroke="#0f172a" stroke-width="2.5" />
          <line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1 - 6}" stroke="#0f172a" stroke-width="2.5" />`;
    for (let i = 0; i <= 10; i += 2) {
        g += `<text x="${px(i / 10)}" y="${y0 + 18}" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="11.5" fill="#334155">${fmtDec(i / 10)}</text>`;
    }
    for (let j = 0; j <= 100; j += 20) {
        g += `<text x="${x0 - 7}" y="${py(j) + 4}" text-anchor="end" font-family="Fredoka" font-weight="600" font-size="11.5" fill="#334155">${j}</text>`;
    }
    g += `<text x="${(x0 + x1) / 2}" y="${H - 4}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="12.5" fill="#0f172a">massa (kg)</text>`;
    g += `<text x="13" y="${(y0 + y1) / 2}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="12.5" fill="#0f172a" transform="rotate(-90 13 ${(y0 + y1) / 2})">studshöjd (cm)</text>`;
    // horisontell linje för place-läget
    if (horizY !== null) {
        g += `<line x1="${x0}" y1="${py(horizY)}" x2="${x1}" y2="${py(horizY)}" stroke="#f472b6" stroke-width="2" stroke-dasharray="6 4" class="demo-pop" />`;
    }
    // hjälp-linjer från punkt till axlar (demo)
    if (followLines) {
        const p = followLines;
        g += `<line x1="${px(p.x)}" y1="${py(p.y)}" x2="${px(p.x)}" y2="${y0}" stroke="#e11d48" stroke-width="2" stroke-dasharray="5 4" class="demo-pop" style="animation-delay:250ms" />
              <line x1="${px(p.x)}" y1="${py(p.y)}" x2="${x0}" y2="${py(p.y)}" stroke="#3b82f6" stroke-width="2" stroke-dasharray="5 4" class="demo-pop" style="animation-delay:650ms" />`;
    }
    // bollar
    points.forEach((p, i) => {
        const color = BALL_COLORS[i % BALL_COLORS.length];
        const ring = i === hiPoint ? `<circle cx="${px(p.x)}" cy="${py(p.y)}" r="14" fill="none" stroke="#f59e0b" stroke-width="3" class="demo-spot-svg" />` : '';
        g += `${ring}<circle cx="${px(p.x)}" cy="${py(p.y)}" r="10.5" fill="${color}" stroke="#1e293b" stroke-width="1.8" />
              <text x="${px(p.x)}" y="${py(p.y) + 4}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="11" fill="#ffffff">${i + 1}</text>`;
    });
    // kandidatpunkter A–D
    if (candidates) {
        candidates.forEach((c, i) => {
            g += `<g class="demo-pop" style="animation-delay:${200 + i * 180}ms">
                <circle cx="${px(c.x)}" cy="${py(c.y)}" r="12" fill="#ffffff" stroke="#e11d48" stroke-width="2.4" stroke-dasharray="3 2.5" />
                <text x="${px(c.x)}" y="${py(c.y) + 4.5}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="12" fill="#e11d48">${'ABCD'[i]}</text>
            </g>`;
        });
    }
    return `<svg width="100%" viewBox="0 0 ${W} ${H}" class="max-w-lg mx-auto" style="overflow:visible">${g}</svg>`;
}

export function generateNpdQuestion() {
    document.getElementById('npd-feedback').classList.add('hidden');
    document.getElementById('npd-next-wrap').classList.add('hidden');

    let mode = state.npdSubMode;
    if (mode === 'mix') mode = ['compare', 'same', 'order', 'read', 'place'][randInt(0, 4)];
    const diff = state.difficulty;
    const qEl = document.getElementById('npd-question-text');
    const visEl = document.getElementById('npd-visual');
    const optsEl = document.getElementById('npd-options');
    const badgeEl = document.getElementById('npd-mode-badge');
    visEl.innerHTML = '';
    visEl.classList.add('hidden');
    optsEl.innerHTML = '';
    optsEl.className = '';
    optsEl.classList.remove('hidden');

    if (mode === 'compare') {
        badgeEl.textContent = '⚖️ Jämför vikter';
        const { pair, strat } = genDecCompare(diff);
        const askLightest = Math.random() < 0.7;
        const lightIdx = pair[0].v < pair[1].v ? 0 : 1;
        const correctIdx = askLightest ? lightIdx : 1 - lightIdx;
        state.currentNpd = { mode, pair, correctIdx, strat };
        qEl.innerHTML = `Klicka på den boll som är <strong>${askLightest ? 'lättast' : 'tyngst'}</strong>!`;
        const light = pair[lightIdx], heavy = pair[1 - lightIdx];
        const expandNote = `${light.s} = ${light.v < 1 ? fmtDecFixed(light.v, Math.max(2, heavy.s.replace(',', '.').split('.')[1]?.length || 2)) : light.s}`;
        setHintSteps('npd', [
            `<p><strong>Fällan:</strong> fler siffror betyder inte större tal! Fyll ut med nollor så båda får lika många decimaler – då syns det direkt:</p>
             <div class="demo-pop flex items-center justify-center gap-6 my-2 font-display font-bold text-xl">
                <span>${pair[0].s} kg</span><span class="text-slate-400">=</span><span>${fmtDecFixed(pair[0].v, 3)} kg</span>
                <span class="text-slate-300">|</span>
                <span>${pair[1].s} kg</span><span class="text-slate-400">=</span><span>${fmtDecFixed(pair[1].v, 3)} kg</span>
             </div>`,
            `<p>Jämför nu tusendelarna som heltal: <strong>${Math.round(pair[0].v * 1000)}</strong> mot <strong>${Math.round(pair[1].v * 1000)}</strong> – vilket är minst? Hundrarutnäten visar samma sak:</p>
             <div class="flex justify-center gap-8 my-1">
                <div class="flex flex-col items-center gap-1">${hundredGrid(Math.round(pair[0].v * 100))}<span class="font-bold text-sm">${pair[0].s} kg</span></div>
                <div class="flex flex-col items-center gap-1">${hundredGrid(Math.round(pair[1].v * 100))}<span class="font-bold text-sm">${pair[1].s} kg</span></div>
             </div>`
        ]);
        optsEl.className = 'flex flex-wrap justify-center gap-6 max-w-2xl mx-auto mt-4';
        optsEl.innerHTML = shuffleArray([0, 1]).map(pos => `
            <button onclick="checkNpdCompare(${pos})" class="btn-3d bg-white hover:bg-amber-50 border-3 border-amber-300 rounded-2xl px-6 py-4 flex flex-col items-center">
                ${ballSvg(BALL_COLORS[pos], pair[pos].s + ' kg')}
            </button>
        `).join('');
        return;
    }

    if (mode === 'same') {
        badgeEl.textContent = '🟰 Samma vikt?';
        const { pair, equal } = genDecSame(diff);
        state.currentNpd = { mode, pair, equal };
        qEl.innerHTML = `Väger bollarna <strong>lika mycket</strong> – eller olika?`;
        const g1 = Math.round(pair[0].v * 100), g2 = Math.round(pair[1].v * 100);
        setHintSteps('npd', [
            `<p>Nollor <strong>längst ut till höger</strong> i ett decimaltal ändrar inte värdet – de lägger bara till noll tusendelar! Jämför rutnäten för just de här bollarna:</p>
             <div class="demo-pop flex justify-center gap-8 my-1">
                <div class="flex flex-col items-center gap-1">${hundredGrid(g1, { size: 100 })}<span class="font-bold text-sm">${pair[0].s} kg</span></div>
                <div class="flex flex-col items-center gap-1">${hundredGrid(g2, { size: 100, color: '#60a5fa' })}<span class="font-bold text-sm">${pair[1].s} kg</span></div>
             </div>
             <p class="text-center font-bold">${g1 === g2 ? 'Lika många rutor är fyllda – samma vikt!' : 'Olika många rutor – olika vikt!'}</p>`,
            `<p>Men se upp: nollor <strong>mitt i</strong> talet spelar stor roll! ${fmtDecFixed(0.205, 3)} är inte alls samma som ${fmtDecFixed(0.25, 2)}. Fyll ut med nollor och jämför siffra för siffra från vänster – var skiljer de sig först?</p>`
        ]);
        visEl.classList.remove('hidden');
        visEl.innerHTML = `<div class="flex flex-wrap items-center justify-center gap-8">
            ${pair.map((p, i) => `<div class="flex flex-col items-center">${ballSvg(BALL_COLORS[i], p.s + ' kg', 74)}</div>`).join('<span class="font-display font-bold text-3xl text-slate-400">?</span>')}
        </div>`;
        optsEl.className = 'flex flex-wrap justify-center gap-4 max-w-xl mx-auto mt-4';
        optsEl.innerHTML = `
            <button onclick="checkNpdSame(true)" class="btn-3d bg-white hover:bg-emerald-50 border-3 border-emerald-400 rounded-2xl px-8 py-4 font-display font-bold text-2xl text-emerald-800">🟰 Lika mycket</button>
            <button onclick="checkNpdSame(false)" class="btn-3d bg-white hover:bg-rose-50 border-3 border-rose-400 rounded-2xl px-8 py-4 font-display font-bold text-2xl text-rose-800">✖️ Olika</button>`;
        return;
    }

    if (mode === 'order') {
        badgeEl.textContent = '🔀 Storleksordna';
        const count = diff === 'easy' ? 3 : diff === 'medium' ? 4 : 5;
        // NP-autentiska vikter: blanda antalet decimaler så fällorna finns med
        const vals = [];
        for (let tries = 0; tries < 300 && vals.length < count; tries++) {
            const kind = randInt(0, 2);
            let v, s;
            if (kind === 0) { v = randInt(1, 9) / 10; s = fmtDecFixed(v, 1); }
            else if (kind === 1) { v = (randInt(1, 9) * 10 + randInt(1, 9)) / 100; s = fmtDecFixed(v, 2); }
            else { v = (randInt(1, 8) * 100 + randInt(1, 99)) / 1000; s = fmtDecFixed(v, 3); }
            if (vals.every(o => Math.abs(o.v - v) > 0.03)) vals.push({ v, s });
        }
        const correct = vals.map((o, i) => i).sort((a, b) => vals[a].v - vals[b].v);
        state.currentNpd = { mode, vals, correct };
        qEl.innerHTML = `<strong>Dra bollarna</strong> i ordning – <strong>lättast till vänster</strong>, tyngst till höger!`;
        const sortedForBars = [...vals].sort((a, b) => a.v - b.v);
        const maxV = Math.max(...vals.map(o => o.v));
        setHintSteps('npd', [
            `<p><strong>Knepet:</strong> fyll ut med nollor så alla får <strong>lika många decimaler</strong> – då jämför du dem som heltal!</p>
             <div class="demo-pop font-display font-bold text-base sm:text-lg space-y-1 my-2">
                ${vals.map((o, i) => `<div class="flex items-center gap-2"><span class="inline-block w-3.5 h-3.5 rounded-full" style="background:${BALL_COLORS[i]}"></span><span>${o.s} → ${fmtDecFixed(o.v, 3)} = <strong class="text-violet-700">${Math.round(o.v * 1000)}</strong> tusendelar</span></div>`).join('')}
             </div>`,
            `<p>Så här ser vikterna ut som staplar – lättast har den kortaste stapeln och ska ligga längst till vänster:</p>
             <div class="demo-pop space-y-1.5 my-2" style="animation-delay:150ms">
                ${sortedForBars.map(o => {
                    const bi = vals.indexOf(o);
                    return `<div class="flex items-center gap-2"><span class="text-xs font-bold w-12 text-right">${o.s}</span><div class="h-4 rounded-full" style="width:${Math.max(6, o.v / maxV * 100)}%;background:${BALL_COLORS[bi]}"></div></div>`;
                }).join('')}
             </div>`
        ]);
        optsEl.className = 'max-w-2xl mx-auto mt-4';
        optsEl.innerHTML = `
            <div id="npd-sort-row" class="relative flex flex-nowrap justify-center gap-2 sm:gap-3 py-2 select-none">
                ${vals.map((o, i) => `
                    <div class="np6-drag-card border-3 border-amber-300 bg-white rounded-2xl px-3 sm:px-4 py-2.5 flex flex-col items-center" data-frac="${i}">
                        ${ballSvg(BALL_COLORS[i], o.s, 52)}
                    </div>
                `).join('')}
            </div>
            <div class="mt-3 text-center">
                <button onclick="checkNpdOrder()" class="btn-3d bg-gradient-to-r from-violet-500 to-purple-600 text-white font-display font-bold text-lg px-7 py-2.5 rounded-2xl">Kolla! ✓</button>
            </div>`;
        enableDragSort(document.getElementById('npd-sort-row'), { locked: () => !document.getElementById('npd-next-wrap').classList.contains('hidden'), clearMarking: '.np6-slot-ok,.np6-slot-bad' });
        return;
    }

    if (mode === 'read') {
        badgeEl.textContent = '📊 Avläs diagram';
        // Punkter som kräver interpolering mellan rutnätslinjer
        const pts = [];
        for (let i = 0; i < 4; i++) {
            pts.push({
                x: (randInt(1, 9) * 10 + 5) / 100,  // alltid på halva: 0,15–0,95
                y: randInt(1, 9) * 10 + 5,          // 15–95 cm
            });
        }
        // ungefärlig separering
        const ballIdx = randInt(0, 3);
        const askWeight = Math.random() < 0.5;
        const p = pts[ballIdx];
        const correctV = askWeight ? p.x : p.y / 100; // håll i decimalform kg respektive m? nej – studshöjd i cm
        state.currentNpd = { mode, pts, ballIdx, askWeight };
        qEl.innerHTML = askWeight
            ? `Hur mycket väger <strong>boll ${ballIdx + 1}</strong>?`
            : `Hur högt kan <strong>boll ${ballIdx + 1}</strong> studsa?`;
        setHintSteps('npd', askWeight ? [
            `<p>Vikten läser du på <strong>x-axeln</strong> (massa)! Titta – den röda linjen följer bollen rakt <strong>neråt</strong> till axeln:</p>
             <div class="demo-pop my-1">${scatterSvg(pts, { hiPoint: ballIdx, followLines: p })}</div>`,
            `<p>Linjen landar <strong>mellan</strong> två streck – då måste du dela upp stegen. Varje litet steg är 0,1 kg, och halvvägs mellan två streck är 0,05 kg extra. Läs av: vilket streck ligger närmast under, plus halvvägs?</p>`
        ] : [
            `<p>Studshöjden läser du på <strong>y-axeln</strong>! Titta – den blå linjen följer bollen rakt <strong>åt vänster</strong> till axeln:</p>
             <div class="demo-pop my-1">${scatterSvg(pts, { hiPoint: ballIdx, followLines: p })}</div>`,
            `<p>Linjen landar <strong>mellan</strong> två streck. Varje litet steg är 10 cm – halvvägs är 5 cm extra. Vilket streck ligger närmast under, plus halvvägs?</p>`
        ]);
        visEl.classList.remove('hidden');
        visEl.innerHTML = `<div class="npd-split"><div class="npd-split-diagram">${scatterSvg(pts, { hiPoint: ballIdx })}</div><div id="npd-side-opts" class="npd-split-opts"></div></div>`;
        optsEl.classList.add('hidden');
        optsEl.innerHTML = '';
        const correct = askWeight ? p.x : p.y;
        const unit = askWeight ? ' kg' : ' cm';
        const opts = new Set([correct]);
        // distraktorer: rutnätslinje under/över + förväxlad axel + decimalskift
        const cands = askWeight
            ? [correct - 0.05, correct + 0.05, correct + 0.1, correct - 0.1, p.y / 100].map(c => Math.round(c * 100) / 100)
            : [correct - 5, correct + 5, correct + 10, correct - 10, Math.round(p.x * 100)];
        const optList = [];
        for (const c of shuffleArray(cands)) {
            if (optList.length >= 3) break;
            if (c <= 0 || c === correct || optList.includes(c) || (askWeight && c >= 1) || (!askWeight && c > 100)) continue;
            optList.push(c);
        }
        optList.push(correct);
        state.currentNpd.options = shuffleArray(optList);
        state.currentNpd.correctV = correct;
        document.getElementById('npd-side-opts').innerHTML = state.currentNpd.options.map(v => `
            <button onclick="checkNpdRead(${v})" data-v="${v}" class="btn-3d bg-white hover:bg-amber-50 border-3 border-amber-300 rounded-2xl px-4 py-3.5 font-display font-bold text-2xl text-slate-900 w-full">${fmtDec(v)}${unit}</button>
        `).join('');
        return;
    }

    // place — placera den grå/rosa bollen i diagrammet (2D-resonemang)
    badgeEl.textContent = '📍 Placera i diagrammet';
    const refPts = [];
    for (let i = 0; i < 3; i++) {
        refPts.push({ x: (randInt(2, 9) * 10) / 100, y: randInt(2, 9) * 10 });
    }
    const refIdx = randInt(0, 2);
    const ref = refPts[refIdx];
    // den nya bollen: vikt med decimalskift-fälla inbyggd
    const newWeight = randInt(1, 8) / 100; // 0,01–0,08 kg – lätt!
    const newY = ref.y; // samma studshöjd som referensbollen
    // kandidater: rätt x på rätt höjd + fällor
    const candX = shuffleArray([
        { x: newWeight, trap: false },
        { x: Math.min(0.95, newWeight * 10), trap: true },   // 0,06 → 0,6!
        { x: ref.x, trap: true },                            // rakt under referensbollen
        { x: Math.min(0.95, newWeight + 0.2), trap: true },
    ]);
    const correctIdx = candX.findIndex(c => !c.trap);
    const candidates = candX.map(c => ({ x: c.x, y: newY }));
    state.currentNpd = { mode, refPts, refIdx, candidates, correctIdx, newWeight, newY };
    const wt = fmtDecFixed(newWeight, 2);
    qEl.innerHTML = `Den <strong>grå bollen</strong> väger <strong>${wt} kg</strong> och studsar <strong>lika högt som boll ${refIdx + 1}</strong>. Vilken punkt är dess?`;
    setHintSteps('npd', [
        `<p>Två ledtrådar i texten! <strong>Samma studshöjd</strong> som boll ${refIdx + 1} betyder att punkten måste ligga på samma <strong>horisontella linje</strong> – se den rosa streckade linjen:</p>
         <div class="demo-pop my-1">${scatterSvg(refPts, { horizY: newY, candidates })}</div>`,
        `<p>Vikten avgör <strong>hur långt åt höger</strong> punkten ligger. SE UPP med decimalpunktsfällan – jämför rutnäten:</p>
         <div class="demo-pop flex justify-center gap-8 my-1" style="animation-delay:150ms">
            <div class="flex flex-col items-center gap-1">${hundredGrid(Math.max(1, Math.round(newWeight * 100)), { size: 90 })}<span class="font-bold text-sm">${wt} kg – nästan tom!</span></div>
            <div class="flex flex-col items-center gap-1">${hundredGrid(Math.round(newWeight * 10 * 100), { size: 90, color: '#f472b6' })}<span class="font-bold text-sm">${fmtDecFixed(newWeight * 10, 1)} kg – tio gånger tyngre!</span></div>
         </div>
         <p class="text-center font-bold">${wt} kg ligger alltså nära noll på massa-axeln!</p>`
    ]);
    visEl.classList.remove('hidden');
    visEl.innerHTML = `<div class="npd-split"><div class="npd-split-diagram">${scatterSvg(refPts, { candidates, horizY: newY })}</div><div id="npd-side-opts" class="npd-split-opts"></div></div>`;
    optsEl.classList.add('hidden');
    optsEl.innerHTML = '';
    document.getElementById('npd-side-opts').innerHTML = candidates.map((c, i) => `
        <button onclick="checkNpdPlace(${i})" class="btn-3d bg-white hover:bg-rose-50 border-3 border-rose-300 rounded-2xl px-6 py-3.5 font-display font-bold text-xl text-rose-700 w-full">Punkt ${'ABCD'[i]}</button>
    `).join('');
}

/* ---------- Jämför ---------- */
export function checkNpdCompare(pos) {
    if (!document.getElementById('npd-next-wrap').classList.contains('hidden')) return;
    const cur = state.currentNpd;
    if (!cur || cur.mode !== 'compare') return;
    if (pos === cur.correctIdx) {
        playSound('correct');
        addReward(1);
        const light = cur.pair[cur.pair[0].v < cur.pair[1].v ? 0 : 1];
        const heavy = cur.pair[cur.pair[0].v < cur.pair[1].v ? 1 : 0];
        showFeedback('npd-feedback', true, `🎉 Rätt! ${light.s} kg är lättast – utskrivet med tre decimaler är det <strong>${Math.round(light.v * 1000)}</strong> tusendelar mot <strong>${Math.round(heavy.v * 1000)}</strong>. Fler siffror betyder inte större tal!`);
        document.getElementById('npd-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        playSound('wrong');
        showFeedback('npd-feedback', false, '🤔 Se upp med fällan! Ett tal med färre siffror kan vara större – fyll ut med nollor och jämför som heltal. Kika på 💡-tipset!');
    }
}

/* ---------- Samma vikt? ---------- */
export function checkNpdSame(answerEqual) {
    if (!document.getElementById('npd-next-wrap').classList.contains('hidden')) return;
    const cur = state.currentNpd;
    if (!cur || cur.mode !== 'same') return;
    if (answerEqual === cur.equal) {
        playSound('correct');
        addReward(1);
        showFeedback('npd-feedback', true, cur.equal
            ? `🎉 Rätt – lika mycket! Nollor längst till höger ändrar inte värdet: ${cur.pair[0].s} och ${cur.pair[1].s} är exakt samma vikt.`
            : `🎉 Rätt – olika! ${cur.pair[0].s} kg och ${cur.pair[1].s} kg skiljer sig åt även om de liknar varandra.`);
        document.getElementById('npd-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        playSound('wrong');
        showFeedback('npd-feedback', false, cur.equal
            ? '🤔 De är faktiskt lika! Den avslutande nollan lägger bara till noll tusendelar – värdet ändras inte.'
            : '🤔 De är faktiskt olika – jämför siffra för siffra från vänster. Var skiljer de sig första gången?');
    }
}

/* ---------- Storleksordna ---------- */
export function checkNpdOrder() {
    const cur = state.currentNpd;
    if (!cur || cur.mode !== 'order') return;
    if (!document.getElementById('npd-next-wrap').classList.contains('hidden')) return;
    const row = document.getElementById('npd-sort-row');
    if (!row) return;
    const cards = [...row.querySelectorAll('.np6-drag-card')];
    const arrangement = cards.map(c => parseInt(c.dataset.frac, 10));
    const isCorrect = arrangement.every((fi, slot) => fi === cur.correct[slot]);
    if (isCorrect) {
        playSound('correct');
        addReward(2);
        cards.forEach(c => c.classList.add('np6-slot-ok'));
        showFeedback('npd-feedback', true, `🎉 Hela ordningen rätt! ${cur.correct.map(x => cur.vals[x].s + ' kg').join(' &lt; ')}`);
        document.getElementById('npd-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        playSound('wrong');
        let rightCount = 0;
        cards.forEach((c, slot) => {
            const ok = parseInt(c.dataset.frac, 10) === cur.correct[slot];
            c.classList.toggle('np6-slot-ok', ok);
            c.classList.toggle('np6-slot-bad', !ok);
            if (ok) rightCount++;
        });
        showFeedback('npd-feedback', false, rightCount > 0
            ? `🤔 ${rightCount} av ${cards.length} sitter rätt (gröna) – de röda behöver flyttas. Kom ihåg: lika många decimaler först!`
            : '🤔 Ingen sitter rätt ännu – fyll ut med nollor så alla har tre decimaler och jämför som heltal!');
    }
}

/* ---------- Avläs diagram ---------- */
export function checkNpdRead(v) {
    if (!document.getElementById('npd-next-wrap').classList.contains('hidden')) return;
    const cur = state.currentNpd;
    if (!cur || cur.mode !== 'read') return;
    const correct = cur.correctV;
    if (Math.abs(v - correct) < 0.001) {
        playSound('correct');
        addReward(1);
        const p = cur.pts[cur.ballIdx];
        showFeedback('npd-feedback', true, cur.askWeight
            ? `🎉 Rätt! Boll ${cur.ballIdx + 1} väger ${fmtDec(correct)} kg – rakt under punkten, halvvägs mellan två rutnätsstreck.`
            : `🎉 Rätt! Boll ${cur.ballIdx + 1} studsar ${correct} cm – rakt åt vänster från punkten, halvvägs mellan strecken.`);
        document.getElementById('npd-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        playSound('wrong');
        showFeedback('npd-feedback', false, cur.askWeight
            ? '🤔 Följ punkten rakt neråt till massa-axeln. Ligger den mellan två streck? Varje litet steg är 0,1 kg – halvvägs är 0,05 extra.'
            : '🤔 Följ punkten rakt åt vänster till studshöjd-axeln. Varje litet steg är 10 cm – halvvägs är 5 extra.');
    }
}

/* ---------- Placera i diagrammet ---------- */
export function checkNpdPlace(i) {
    if (!document.getElementById('npd-next-wrap').classList.contains('hidden')) return;
    const cur = state.currentNpd;
    if (!cur || cur.mode !== 'place') return;
    if (i === cur.correctIdx) {
        playSound('correct');
        addReward(2);
        showFeedback('npd-feedback', true, `🎉 Rätt! Samma höjd som boll ${cur.refIdx + 1} (den rosa linjen) <em>och</em> rätt vikt – båda villkoren måste stämma samtidigt!`);
        document.getElementById('npd-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        playSound('wrong');
        const wt = fmtDecFixed(cur.newWeight, 2);
        const chosenX = cur.candidates[i].x;
        const digitTrap = Math.abs(chosenX - cur.newWeight * 10) < 0.001;
        showFeedback('npd-feedback', false, digitTrap
            ? `🤔 Decimalpunktsfällan! ${wt} kg är inte samma som ${fmtDecFixed(cur.newWeight * 10, 1)} kg – den är mycket lätt, nära noll på massa-axeln!`
            : '🤔 Kolla båda villkoren: punkten måste ligga på den rosa horisontella linjen <em>och</em> rakt ovanför rätt vikt på massa-axeln.');
    }
}

/* =========================================================
   Demon – per läge
========================================================= */
export function buildNpdDemoSteps() {
    const mode = state.npdSubMode;
    if (mode === 'same') return buildNpdSameDemo();
    if (mode === 'order') return buildNpdOrderDemo();
    if (mode === 'read') return buildNpdReadDemo();
    if (mode === 'place') return buildNpdPlaceDemo();
    return buildNpdCompareDemo();
}

function buildNpdCompareDemo() {
    const gridPair = (n1, n2, l1, l2, stagger = false) => `
        <div class="flex justify-center gap-10">
            <div class="flex flex-col items-center gap-1.5">${hundredGrid(n1, { size: 130, stagger })}<span class="font-display font-bold text-lg">${l1}</span></div>
            <div class="flex flex-col items-center gap-1.5">${hundredGrid(n2, { size: 130, stagger, delayBase: stagger ? n1 * 22 + 200 : 0, color: '#60a5fa' })}<span class="font-display font-bold text-lg">${l2}</span></div>
        </div>`;
    return { steps: [
        { text: `<p>Vilken boll är lättast: <strong>0,4 kg</strong> eller <strong>0,25 kg</strong>? Många svarar 0,4 – för 4 är mindre än 25. Men det är en <strong>fälla</strong>!</p>`,
          html: `<div class="flex justify-center gap-8">${ballSvg('#3b82f6', '0,4 kg')}${ballSvg('#22c55e', '0,25 kg')}</div>` },
        { text: `<p>Titta på hundrarutnäten! Rutorna fylls i en i taget. 0,4 är <strong>fyra tiondelar</strong> – det är 40 av 100 rutor. 0,25 är 25 rutor.</p>`,
          html: gridPair(40, 25, '0,4 = 0,40', '0,25', true) },
        { text: `<p><strong>Knepet:</strong> fyll ut med nollor så båda får lika många decimaler! 0,4 = 0,40 – och <strong>40</strong> hundradelar är fler än <strong>25</strong>. Alltså är 0,25 lättast!</p>`,
          html: `<div class="demo-pop font-display font-bold text-2xl text-emerald-700 mb-3">0,25 kg &lt; 0,40 kg</div>${gridPair(40, 25, '0,40 kg', '0,25 kg')}` },
        { text: `<p>Samma knep med tre decimaler: 0,207 och 0,25 ser luriga ut, men som tusendelar är det <strong>207</strong> mot <strong>250</strong> – tydligt!</p>`,
          html: `<div class="demo-pop font-display font-bold text-xl text-slate-800 text-center">0,207 = <strong>207</strong> tusendelar<br>0,25 = 0,250 = <strong>250</strong> tusendelar</div>` },
        { text: `<p><strong>Din tur!</strong> Vilken boll är lättast?</p>`,
          html: `<div class="flex justify-center gap-8">${ballSvg('#eab308', '0,6 kg')}${ballSvg('#ef4444', '0,58 kg')}</div>`,
          guess: { options: [
              { label: '0,6 kg', ok: false },
              { label: '0,58 kg', ok: true },
              { label: 'De väger lika', ok: false },
          ] },
          doneText: 'Rätt! 0,6 = 0,60 – och 58 hundradelar är färre än 60. 0,58 kg är lättast! 🎉' },
    ] };
}

function buildNpdSameDemo() {
    return { steps: [
        { text: `<p>Här är provets klurigaste hemlighet! Två bollar: <strong>0,25 kg</strong> och <strong>0,250 kg</strong>. Väger de lika – eller olika?</p>`,
          html: `<div class="flex justify-center gap-8">${ballSvg('#3b82f6', '0,25 kg')}${ballSvg('#22c55e', '0,250 kg')}</div>` },
        { text: `<p>Titta på rutnäten: exakt lika många rutor är fyllda! Den extra nollan betyder <strong>noll tusendelar till</strong> – inget alls ändras.</p>`,
          html: `<div class="flex justify-center gap-10">
              <div class="flex flex-col items-center gap-1.5">${hundredGrid(25, { size: 130, stagger: true })}<span class="font-display font-bold">0,25</span></div>
              <div class="flex flex-col items-center gap-1.5">${hundredGrid(25, { size: 130, stagger: true, delayBase: 600, color: '#60a5fa' })}<span class="font-display font-bold">0,250</span></div>
          </div>` },
        { text: `<p>Regeln: nollor <strong>längst ut till höger</strong> ändrar inte värdet. Men nollor <strong>mitt i</strong> talet är viktiga – 0,205 är mycket mindre än 0,25!</p>`,
          html: `<div class="flex justify-center gap-10">
              <div class="flex flex-col items-center gap-1.5">${hundredGrid(21, { size: 110, color: '#f472b6' })}<span class="font-display font-bold">0,205 ≈ 20½ rutor</span></div>
              <div class="flex flex-col items-center gap-1.5">${hundredGrid(25, { size: 110 })}<span class="font-display font-bold">0,25 = 25 rutor</span></div>
          </div>` },
        { text: `<p><strong>Din tur!</strong> Väger 0,7 kg och 0,70 kg lika mycket?</p>`,
          html: `<div class="flex justify-center gap-8">${ballSvg('#eab308', '0,7 kg')}${ballSvg('#ef4444', '0,70 kg')}</div>`,
          guess: { options: [
              { label: 'Lika mycket', ok: true },
              { label: 'Olika – 0,70 är tyngre', ok: false },
              { label: 'Olika – 0,7 är tyngre', ok: false },
          ] },
          doneText: 'Rätt! Nollan längst ut till höger ändrar inget: 0,7 = 0,70. Samma vikt! 🎉' },
    ] };
}

function buildNpdOrderDemo() {
    const cardRow = (items, opts = {}) => `<div class="flex flex-nowrap justify-center gap-2.5 py-2">
        ${items.map((it, i) => `<div class="border-3 rounded-2xl px-3 py-2 ${i < (opts.doneCount || 0) ? 'border-emerald-500 bg-emerald-50' : i === opts.spot ? 'border-amber-400 bg-amber-50 demo-spot' : 'border-amber-300 bg-white'} ${opts.flyLast && i === (opts.doneCount || 0) - 1 ? 'demo-fly-down' : ''}">${ballSvg(it.color, it.s, 48)}</div>`).join('')}
    </div>`;
    const balls = [
        { s: '0,4', color: '#3b82f6' }, { s: '0,207', color: '#22c55e' }, { s: '0,25', color: '#eab308' }, { s: '0,56', color: '#ef4444' },
    ];
    return { steps: [
        { text: `<p>Provets bolluppgift! Fyra bollar ska ordnas från <strong>lättast till tyngst</strong>. Vikterna ser luriga ut – olika många siffror!</p>`,
          html: cardRow(balls) },
        { text: `<p><strong>Knepet:</strong> skriv alla med lika många decimaler – tre stycken. Då kan du jämföra dem som heltal!</p>`,
          html: `<div class="demo-pop font-display font-bold text-lg text-slate-800 text-center space-y-1">
              <div>0,4 → 0,400 = <strong>400</strong></div>
              <div>0,207 = <strong>207</strong></div>
              <div>0,25 → 0,250 = <strong>250</strong></div>
              <div>0,56 → 0,560 = <strong>560</strong></div>
          </div>` },
        { text: `<p>Minst är <strong>207</strong> – alltså är 0,207 kg lättast, trots att den har många siffror! Den åker längst åt vänster.</p>`,
          html: cardRow([balls[1], balls[0], balls[2], balls[3]], { doneCount: 1, flyLast: true, spot: 0 }) },
        { text: `<p>Näst minst är <strong>250</strong> (0,25) – inte 400! Sen 400 och sist 560. Klart!</p>`,
          html: cardRow([balls[1], balls[2], balls[0], balls[3]], { doneCount: 4 }) +
                `<div class="demo-pop mt-2 font-display font-bold text-lg text-emerald-700" style="animation-delay:250ms">0,207 &lt; 0,25 &lt; 0,4 &lt; 0,56</div>` },
        { text: `<p><strong>Din tur!</strong> Vilken boll ska ligga längst till vänster?</p>`,
          html: `<div class="flex justify-center gap-8">${ballSvg('#3b82f6', '0,6 kg', 54)}${ballSvg('#22c55e', '0,07 kg', 54)}${ballSvg('#eab308', '0,65 kg', 54)}</div>`,
          guess: { options: [
              { label: '0,6 kg', ok: false },
              { label: '0,07 kg', ok: true },
              { label: '0,65 kg', ok: false },
          ] },
          doneText: 'Rätt! 0,07 = 70 tusendelar – minst av alla. Fler siffror betyder inte större tal! 🎉' },
    ] };
}

function buildNpdReadDemo() {
    const pts = [{ x: 0.25, y: 55 }, { x: 0.55, y: 25 }, { x: 0.75, y: 75 }, { x: 0.4, y: 45 }];
    return { steps: [
        { text: `<p>I provet finns ett diagram med bollar! <strong>X-axeln</strong> visar massa i kg, <strong>y-axeln</strong> studshöjd i cm. Varje boll är en punkt.</p>`,
          html: scatterSvg(pts) },
        { text: `<p>Hur mycket väger boll 1? Följ punkten rakt <strong>neråt</strong> – den röda linjen visar vägen till massa-axeln.</p>`,
          html: scatterSvg(pts, { hiPoint: 0, followLines: pts[0] }) },
        { text: `<p>Punkten landar <strong>mellan</strong> 0,2 och 0,4. Halvvägs mellan två småstreck! Varje litet steg är 0,1 – så halvvägs emellan är 0,05 extra: <strong>0,25 kg</strong>!</p>`,
          html: scatterSvg(pts, { hiPoint: 0, followLines: pts[0] }) +
                `<div class="demo-pop mt-1 font-display font-bold text-xl text-emerald-700" style="animation-delay:300ms">boll 1 väger 0,25 kg</div>` },
        { text: `<p>Och studshöjden? Samma sak men åt andra hållet: följ den <strong>blå linjen</strong> åt vänster till y-axeln. Halvvägs mellan 50 och 60 är <strong>55 cm</strong>!</p>`,
          html: scatterSvg(pts, { hiPoint: 0, followLines: pts[0] }) },
        { text: `<p><strong>Din tur!</strong> Hur högt kan boll 2 studsa? Följ den åt vänster i huvudet…</p>`,
          html: scatterSvg(pts, { hiPoint: 1 }),
          guess: { options: [
              { label: '25 cm', ok: true },
              { label: '55 cm', ok: false },
              { label: '0,55 cm', ok: false },
          ] },
          doneText: 'Rätt! Boll 2 ligger halvvägs mellan 20 och 30 på y-axeln: 25 cm! (0,55 är vikten – lätt att blanda ihop axlarna!) 🎉' },
    ] };
}

function buildNpdPlaceDemo() {
    const pts = [{ x: 0.4, y: 60 }, { x: 0.7, y: 30 }, { x: 0.2, y: 80 }];
    const cands = [{ x: 0.06, y: 60 }, { x: 0.6, y: 60 }, { x: 0.4, y: 60 }, { x: 0.26, y: 60 }];
    return { steps: [
        { text: `<p>Sista provknepet är två ledtrådar samtidigt! <em>"Den grå bollen väger 0,06 kg och studsar lika högt som boll 1."</em> Var hör den hemma?</p>`,
          html: scatterSvg(pts, { hiPoint: 0 }) },
        { text: `<p>Ledtråd 1: <strong>samma studshöjd</strong> som boll 1. Alla punkter med samma höjd ligger på en <strong>horisontell linje</strong> – den rosa!</p>`,
          html: scatterSvg(pts, { hiPoint: 0, horizY: 60 }) },
        { text: `<p>Ledtråd 2: vikten <strong>0,06 kg</strong> avgör hur långt åt höger. SE UPP: 0,06 är väldigt lätt – nära noll! Det är inte alls samma sak som 0,6!</p>`,
          html: scatterSvg(pts, { hiPoint: 0, horizY: 60, candidates: cands }) },
        { text: `<p>Bara punkt <strong>A</strong> uppfyller båda villkoren: på den rosa linjen <em>och</em> nära noll på massa-axeln. Punkt B är decimalpunktsfällan – 0,6 kg är tio gånger tyngre!</p>`,
          html: scatterSvg(pts, { hiPoint: 0, horizY: 60, candidates: cands }) +
                `<div class="demo-pop mt-1 font-display font-bold text-xl text-emerald-700" style="animation-delay:300ms">Punkt A är rätt!</div>` },
        { text: `<p><strong>Din tur!</strong> En boll väger 0,3 kg och studsar lika högt som boll 2. Vilken punkt?</p>`,
          html: scatterSvg(pts, { horizY: 30, candidates: [{ x: 0.03, y: 30 }, { x: 0.3, y: 30 }, { x: 0.7, y: 30 }, { x: 0.55, y: 30 }] }),
          guess: { options: [
              { label: 'Punkt A (0,03)', ok: false },
              { label: 'Punkt B (0,3)', ok: true },
              { label: 'Punkt C (rakt under boll 2)', ok: false },
          ] },
          doneText: 'Rätt! Samma höjd som boll 2 (den rosa linjen) och 0,3 kg på massa-axeln – båda villkoren! 🎉' },
    ] };
}
