// js/visuals.js — autogenererad av split.py från original.html
import { formatNumSv } from './utils.js';

export function buildNumberLineJumpSVG(start, mid, end, lbl1, lbl2, isSub = false) {
    const arcColor = isSub ? '#e11d48' : '#0284c7';
    return `
        <svg viewBox="0 0 360 92" class="w-full max-w-md mx-auto my-2">
            <defs>
                <marker id="nl-arr-${isSub ? 'sub' : 'add'}" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
                    <path d="M 0 1 L 6 3.5 L 0 6 z" fill="${arcColor}" />
                </marker>
            </defs>
            <line x1="35" y1="62" x2="325" y2="62" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" />
            <path d="M 55 58 Q 117 12 176 55" fill="none" stroke="${arcColor}" stroke-width="2.8" marker-end="url(#nl-arr-${isSub ? 'sub' : 'add'})" class="svg-arc-draw" />
            <text x="117" y="22" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="13" fill="${arcColor}">${lbl1}</text>
            <path d="M 184 58 Q 242 12 301 55" fill="none" stroke="#10b981" stroke-width="2.8" marker-end="url(#nl-arr-${isSub ? 'sub' : 'add'})" class="svg-arc-draw-delay" />
            <text x="242" y="22" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="13" fill="#047857">${lbl2}</text>
            <circle cx="55" cy="62" r="5" fill="#0f172a" />
            <text x="55" y="82" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="13" fill="#0f172a">${start}</text>
            <circle cx="180" cy="62" r="5" fill="${arcColor}" />
            <text x="180" y="82" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="13" fill="${arcColor}">${mid}</text>
            <circle cx="305" cy="62" r="6" fill="#10b981" />
            <text x="305" y="82" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="14" fill="#065f46">${end}</text>
        </svg>
    `;
}

/* =============================================================
   7. MODUL 4: BALANSVÅGEN
============================================================== */
export function renderScaleSVG(leftText, rightText, tiltDeg = -8) {
    return `
        <svg viewBox="0 0 380 235" class="w-full max-w-md mx-auto">
            <polygon points="155,172 225,172 190,115" fill="#0891b2" />
            <rect x="135" y="170" width="110" height="10" rx="5" fill="#164e63" />
            <g transform="translate(190, 115) rotate(${tiltDeg})">
                <line x1="-135" y1="0" x2="135" y2="0" stroke="#0f172a" stroke-width="6" stroke-linecap="round" />
                <circle cx="0" cy="0" r="9" fill="#f59e0b" stroke="#0f172a" stroke-width="3" />
                <g transform="translate(-125, 0) rotate(${-tiltDeg})">
                    <line x1="-30" y1="35" x2="0" y2="0" stroke="#64748b" stroke-width="2" />
                    <line x1="30" y1="35" x2="0" y2="0" stroke="#64748b" stroke-width="2" />
                    <rect x="-54" y="34" width="108" height="36" rx="12" fill="#e0f2fe" stroke="#0284c7" stroke-width="3" />
                    <text x="0" y="57" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="16" fill="#0c4a6e">${leftText}</text>
                </g>
                <g transform="translate(125, 0) rotate(${-tiltDeg})">
                    <line x1="-30" y1="35" x2="0" y2="0" stroke="#64748b" stroke-width="2" />
                    <line x1="30" y1="35" x2="0" y2="0" stroke="#64748b" stroke-width="2" />
                    <rect x="-54" y="34" width="108" height="36" rx="12" fill="#fef3c7" stroke="#d97706" stroke-width="3" />
                    <text x="0" y="57" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="16" fill="#78350f">${rightText}</text>
                </g>
            </g>
        </svg>
    `;
}

/* =============================================================
   8. MODUL 5: BRÅK, BRÅKTVILLINGAR & PROCENT
============================================================== */
// anim: { popAll } poppar alla bitar i sekvens, { popIdx } poppar en bit,
// { staggerFrom } poppar de fyllda bitarna fr.o.m. indexet en i taget.
export function renderPizzaSVG(den, selectedArr, interactive = false, clickPrefix = '', size = 150, anim = null) {
    const cx = size / 2, cy = size / 2, r = size * 0.42;
    let slicesHtml = '';
    const sliceAnim = (i) => {
        if (!anim) return '';
        if (anim.popAll) return `class="demo-slice" style="animation-delay:${i * 150}ms"`;
        if (anim.staggerFrom !== undefined && i >= anim.staggerFrom && selectedArr.includes(i))
            return `class="demo-slice" style="animation-delay:${(i - anim.staggerFrom) * 420}ms"`;
        if (anim.popIdx !== undefined && i === anim.popIdx) return `class="demo-slice"`;
        return '';
    };

    if (den === 1) {
        const filled = selectedArr.includes(0);
        slicesHtml = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${filled ? '#fb7185' : '#fef3c7'}" stroke="#b45309" stroke-width="3.5" ${sliceAnim(0)} ${interactive ? `onclick="${clickPrefix}(0)" class="cursor-pointer"` : ''} />`;
    } else {
        for (let i = 0; i < den; i++) {
            const a1 = (i / den) * Math.PI * 2 - Math.PI / 2;
            const a2 = ((i + 1) / den) * Math.PI * 2 - Math.PI / 2;
            const x1 = cx + r * Math.cos(a1);
            const y1 = cy + r * Math.sin(a1);
            const x2 = cx + r * Math.cos(a2);
            const y2 = cy + r * Math.sin(a2);
            const largeArc = (1 / den) > 0.5 ? 1 : 0;
            const filled = selectedArr.includes(i);
            const d = `M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
            const animAttr = sliceAnim(i);
            const cls = animAttr || (interactive ? `class="cursor-pointer hover:opacity-85"` : '');
            slicesHtml += `<path d="${d}" fill="${filled ? '#fb7185' : '#fef3c7'}" stroke="#b45309" stroke-width="2.5" ${cls} ${interactive ? `onclick="${clickPrefix}(${i})"` : ''} />`;
        }
    }

    return `
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="drop-shadow-xs">
            <circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="#d97706" />
            ${slicesHtml}
        </svg>
    `;
}

// opts: { hideMarker } ritar linjen utan markör, { markerCls } lägger en
// CSS-klass på markörens inre grupp (t.ex. hoppar in i demon).
export function renderDecimalNumberLineSVG(minVal, maxVal, step, markerVal, interactive = false, showMarkerLabel = true, highlightJumpTo = null, opts = {}) {
    const xStart = 35, xEnd = 365, width = xEnd - xStart;
    const span = maxVal - minVal;
    const totalSteps = Math.round(span / step);
    // Etiketter: heltal/halva för decimalintervall, annars "snygga" heltalssteg
    const labelStep = step < 1
        ? (span <= 2 ? 0.5 : 1)
        : [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find(c => span / c <= 8) || 1000;
    const isLabel = (v) => Math.abs(v / labelStep - Math.round(v / labelStep)) < 0.01;
    let ticksHtml = '';

    for (let i = 0; i <= totalSteps; i++) {
        const val = Math.round((minVal + i * step) * 100) / 100;
        const x = xStart + (i / totalSteps) * width;
        const major = isLabel(val);
        const isZero = Math.abs(val) < step / 2 && minVal < 0;
        const tickH = major ? 18 : 8;
        const col = isZero ? '#0f766e' : (major ? '#1e3a8a' : '#64748b');
        ticksHtml += `<line x1="${x.toFixed(1)}" y1="${65 - tickH}" x2="${x.toFixed(1)}" y2="${65 + tickH}" stroke="${col}" stroke-width="${major || isZero ? 3 : 1.8}" />`;
        if (major) {
            ticksHtml += `<text x="${x.toFixed(1)}" y="102" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="14" fill="#1e293b">${formatNumSv(val)}</text>`;
        }
    }

    let jumpArcHtml = '';
    if (highlightJumpTo !== null) {
        const targetX = xStart + ((highlightJumpTo - minVal) / span) * width;
        jumpArcHtml = `
            <defs>
                <marker id="dec-arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                    <path d="M 0 1 L 7 4 L 0 7 z" fill="#0284c7" />
                </marker>
            </defs>
            <path d="M ${xStart} 56 Q ${((xStart + targetX) / 2).toFixed(1)} 10 ${(targetX - 4).toFixed(1)} 52" fill="none" stroke="#0284c7" stroke-width="3" marker-end="url(#dec-arr)" class="svg-arc-draw" />
        `;
    }

    const mx = xStart + Math.max(0, Math.min(1, (markerVal - minVal) / span)) * width;
    const markerHtml = opts.hideMarker ? '' : `
        <g transform="translate(${mx.toFixed(1)}, 65)" class="${interactive ? 'cursor-grab active:cursor-grabbing' : ''}">
            <g class="${opts.markerCls || ''}">
            <circle cx="0" cy="0" r="11" fill="#f59e0b" stroke="#78350f" stroke-width="3" />
            ${showMarkerLabel ? `
                <rect x="-24" y="-42" width="48" height="22" rx="8" fill="#1d4ed8" />
                <text x="0" y="-27" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="12" fill="#ffffff">${formatNumSv(markerVal)}</text>
            ` : `
                <rect x="-18" y="-42" width="36" height="22" rx="8" fill="#f43f5e" />
                <text x="0" y="-27" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="13" fill="#ffffff">?</text>
            `}
            </g>
        </g>
    `;

    return `
        <svg id="${interactive ? 'decimal-interactive-svg' : ''}" viewBox="0 0 400 115" class="w-full max-w-xl mx-auto select-none touch-none ${interactive ? 'cursor-pointer' : ''}">
            <line x1="${xStart}" y1="65" x2="${xEnd}" y2="65" stroke="#334155" stroke-width="4" stroke-linecap="round" />
            ${ticksHtml}
            ${jumpArcHtml}
            ${markerHtml}
        </svg>
    `;
}

export function renderMeasuringJugSVG(val, unit, litersRatio) {
    const fillRatio = Math.max(0.15, Math.min(0.92, litersRatio));
    const jugTop = 26, jugBot = 148, jugH = jugBot - jugTop;
    const waterH = Math.round(jugH * fillRatio);
    const waterY = jugBot - waterH;

    return `
        <svg width="240" height="175" viewBox="0 0 240 175" class="drop-shadow-xs">
            <path d="M 165 44 C 198 44, 198 118, 165 118" fill="none" stroke="#65a30d" stroke-width="8" stroke-linecap="round" />
            <rect x="64" y="${waterY}" width="100" height="${waterH}" rx="6" fill="#38bdf8" fill-opacity="0.45" />
            <line x1="64" y1="${waterY}" x2="164" y2="${waterY}" stroke="#0284c7" stroke-width="3" />
            <path d="M 55 24 L 64 148 Q 64 156 74 156 L 154 156 Q 164 156 164 148 L 170 24" fill="none" stroke="#365314" stroke-width="4" stroke-linecap="round" />
            <line x1="64" y1="50" x2="84" y2="50" stroke="#365314" stroke-width="2" />
            <line x1="64" y1="82" x2="90" y2="82" stroke="#365314" stroke-width="2.5" />
            <line x1="64" y1="115" x2="84" y2="115" stroke="#365314" stroke-width="2" />
            <rect x="76" y="88" width="76" height="28" rx="10" fill="#ffffff" stroke="#0284c7" stroke-width="2" />
            <text x="114" y="107" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="14" fill="#0c4a6e">${formatNumSv(val)} ${unit}</text>
        </svg>
    `;
}

export function renderKitchenScaleSVG(val, unit, emoji = '', label = '') {
    const objectHtml = emoji
        ? `<text x="120" y="52" text-anchor="middle" font-size="26">${emoji}</text>
           <text x="120" y="68" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="10.5" fill="#78350f">${label}</text>`
        : `<text x="120" y="53" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="15" fill="#78350f">${formatNumSv(val)} ${unit}</text>`;
    return `
        <svg width="240" height="175" viewBox="0 0 240 175" class="drop-shadow-xs">
            <rect x="78" y="24" width="84" height="48" rx="12" fill="#fef3c7" stroke="#d97706" stroke-width="3" />
            ${objectHtml}
            <rect x="56" y="74" width="128" height="8" rx="4" fill="#4d7c0f" />
            <rect x="110" y="82" width="20" height="22" fill="#65a30d" />
            <path d="M 48 162 L 66 104 L 174 104 L 192 162 Z" fill="#ecfccb" stroke="#4d7c0f" stroke-width="3.5" stroke-linejoin="round" />
            <rect x="78" y="120" width="84" height="28" rx="8" fill="#1e293b" />
            <text x="120" y="139" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="14" fill="#a3e635">${formatNumSv(val)} ${unit}</text>
        </svg>
    `;
}

export function buildUnitLadderSVGHTML(units, stepMuls, stepDivs, fromUnit, toUnit, isMul) {
    const fromIdx = units.indexOf(fromUnit);
    const toIdx = units.indexOf(toUnit);
    const minIdx = Math.min(fromIdx, toIdx);
    const maxIdx = Math.max(fromIdx, toIdx);

    let html = `<div class="flex flex-wrap items-center justify-center gap-1.5 my-2">`;
    units.forEach((u, idx) => {
        const isFrom = u === fromUnit;
        const isTo = u === toUnit;
        const isBetween = idx > minIdx && idx < maxIdx;
        const cls = isFrom
            ? 'bg-amber-400 text-amber-950 border-amber-600 scale-105 shadow-xs'
            : (isTo ? 'bg-lime-600 text-white border-lime-800 scale-105 shadow-xs'
            : (isBetween ? 'bg-sky-100 text-sky-900 border-sky-400' : 'bg-slate-100 text-slate-400 border-slate-200 opacity-65'));
        html += `<span class="px-3 py-1.5 rounded-xl border-2 font-display font-bold text-sm ${cls}">${u}</span>`;
        if (idx < units.length - 1) {
            const active = idx >= minIdx && idx < maxIdx;
            const lbl = isMul ? `${stepMuls[idx]} →` : `← ${stepDivs[idx]}`;
            html += `<span class="px-2 py-0.5 rounded-lg text-[11px] font-extrabold ${active ? 'hint-arrow-nudge bg-lime-100 text-lime-950 border border-lime-400' : 'text-slate-400 opacity-50'}">${lbl}</span>`;
        }
    });
    html += `</div>`;
    return html;
}

/* =============================================================
   13. MODUL 10: KLOCKAN & TID + ÖVNINGSKLOCKA
============================================================== */
export function renderClockSVG(hours, minutes, size = 190, interactive = false, focus = null) {
    const cx = size / 2, cy = size / 2, r = size * 0.43;
    let ticksHtml = '';
    for (let t = 0; t < 60; t++) {
        const ang = (t / 60) * Math.PI * 2 - Math.PI / 2;
        const isMajor = t % 5 === 0;
        const rOuter = r * 0.96;
        const rInner = r * (isMajor ? 0.89 : 0.925);
        const x1 = cx + rInner * Math.cos(ang), y1 = cy + rInner * Math.sin(ang);
        const x2 = cx + rOuter * Math.cos(ang), y2 = cy + rOuter * Math.sin(ang);
        ticksHtml += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${isMajor ? '#475569' : '#cbd5e1'}" stroke-width="${isMajor ? 2.2 : 1.2}" />`;
    }
    let numsHtml = '';
    for (let n = 1; n <= 12; n++) {
        const ang = (n / 12) * Math.PI * 2 - Math.PI / 2;
        const nx = cx + (r * 0.75) * Math.cos(ang);
        const ny = cy + (r * 0.75) * Math.sin(ang) + 5;
        numsHtml += `<text x="${nx.toFixed(1)}" y="${ny.toFixed(1)}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="${size * 0.085}" fill="#1e293b">${n}</text>`;
    }

    const minAngle = (minutes / 60) * Math.PI * 2 - Math.PI / 2;
    const hourAngle = (((hours % 12) + minutes / 60) / 12) * Math.PI * 2 - Math.PI / 2;
    const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;
    const minDeg = (minutes / 60) * 360;

    const hx = cx + (r * 0.5) * Math.cos(hourAngle);
    const hy = cy + (r * 0.5) * Math.sin(hourAngle);
    const mx = cx + (r * 0.74) * Math.cos(minAngle);
    const my = cy + (r * 0.74) * Math.sin(minAngle);

    return `
        <svg id="${interactive ? 'sandbox-clock-svg' : ''}" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="drop-shadow-sm ${interactive ? 'cursor-pointer' : ''}">
            <circle cx="${cx}" cy="${cy}" r="${r + 6}" fill="#7c3aed" />
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" />
            ${ticksHtml}
            ${numsHtml}
            ${interactive ? `
            <line x1="${cx}" y1="${cy}" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="#e11d48" stroke-width="${size * 0.036}" stroke-linecap="round" opacity="${focus === 'min' ? 0.25 : 1}" />
            <circle cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" r="10" fill="#e11d48" fill-opacity="0.35" />
            <line x1="${cx}" y1="${cy}" x2="${mx.toFixed(1)}" y2="${my.toFixed(1)}" stroke="#0284c7" stroke-width="${size * 0.024}" stroke-linecap="round" opacity="${focus === 'hour' ? 0.25 : 1}" />
            <circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="10" fill="#0284c7" fill-opacity="0.35" />
            ` : `
            <g class="clock-hand clock-hand-hour" style="--hand-rot:${hourDeg.toFixed(1)}deg; animation-delay:0.05s" opacity="${focus === 'min' ? 0.22 : 1}">
                <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${(cy - r * 0.5).toFixed(1)}" stroke="#e11d48" stroke-width="${size * 0.036}" stroke-linecap="round" />
            </g>
            <g class="clock-hand" style="--hand-rot:${minDeg.toFixed(1)}deg; animation-delay:0.18s" opacity="${focus === 'hour' ? 0.22 : 1}">
                <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${(cy - r * 0.74).toFixed(1)}" stroke="#0284c7" stroke-width="${size * 0.024}" stroke-linecap="round" />
            </g>
            `}
            <circle cx="${cx}" cy="${cy}" r="${size * 0.032}" fill="#0f172a" />
        </svg>
    `;
}

export function renderBarChartSVG(title, items, highlightIndices = [], showCompareBracket = false) {
    const maxVal = Math.max(...items.map(i => i.val));
    const step = maxVal > 20 ? 10 : (maxVal > 10 ? 5 : 2);
    const yMax = Math.ceil((maxVal + 1) / step) * step;
    const chartLeft = 48, chartRight = 365, chartTop = 34, chartBot = 155;
    const chartH = chartBot - chartTop;
    const chartW = chartRight - chartLeft;

    let gridHtml = '';
    for (let v = 0; v <= yMax; v += step) {
        const y = chartBot - (v / yMax) * chartH;
        gridHtml += `<line x1="${chartLeft}" y1="${y.toFixed(1)}" x2="${chartRight}" y2="${y.toFixed(1)}" stroke="#e2e8f0" stroke-width="1.5" />`;
        gridHtml += `<text x="${chartLeft - 8}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-family="Fredoka" font-weight="700" font-size="12" fill="#475569">${v}</text>`;
    }

    const slotW = chartW / items.length;
    const barW = Math.min(48, slotW * 0.62);
    const colors = ['#f43f5e', '#f59e0b', '#10b981', '#0284c7'];

    let barsHtml = '';
    let guideHtml = '';

    items.forEach((it, idx) => {
        const barH = (it.val / yMax) * chartH;
        const bx = chartLeft + idx * slotW + (slotW - barW) / 2;
        const by = chartBot - barH;
        const isHl = highlightIndices.includes(idx);
        const opacity = highlightIndices.length > 0 && !isHl ? '0.35' : '1';

        barsHtml += `
            <g opacity="${opacity}">
                <rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="8" fill="${colors[idx % colors.length]}" />
                <text x="${(bx + barW / 2).toFixed(1)}" y="${(by - 6).toFixed(1)}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="13" fill="#0f172a">${it.val}</text>
                <text x="${(bx + barW / 2).toFixed(1)}" y="${chartBot + 18}" text-anchor="middle" font-size="15">${it.icon}</text>
                <text x="${(bx + barW / 2).toFixed(1)}" y="${chartBot + 33}" text-anchor="middle" font-family="Nunito" font-weight="800" font-size="11" fill="#334155">${it.label}</text>
            </g>
        `;

        if (isHl) {
            guideHtml += `<line x1="${chartLeft}" y1="${by.toFixed(1)}" x2="${(bx + barW / 2).toFixed(1)}" y2="${by.toFixed(1)}" stroke="#7c3aed" stroke-width="2.5" stroke-dasharray="5 4" class="svg-arc-draw" />`;
        }
    });

    if (showCompareBracket && highlightIndices.length === 2) {
        const i1 = highlightIndices[0], i2 = highlightIndices[1];
        const y1 = chartBot - (items[i1].val / yMax) * chartH;
        const y2 = chartBot - (items[i2].val / yMax) * chartH;
        const yTop = Math.min(y1, y2), yLow = Math.max(y1, y2);
        const diff = Math.abs(items[i1].val - items[i2].val);
        guideHtml += `
            <line x1="350" y1="${yTop.toFixed(1)}" x2="350" y2="${yLow.toFixed(1)}" stroke="#e11d48" stroke-width="3.5" />
            <rect x="316" y="${((yTop + yLow) / 2 - 11).toFixed(1)}" width="66" height="22" rx="8" fill="#ffe4e6" stroke="#e11d48" stroke-width="1.5" />
            <text x="349" y="${((yTop + yLow) / 2 + 4).toFixed(1)}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="11" fill="#9f1239">Skillnad: ${diff}</text>
        `;
    }

    return `
        <svg viewBox="0 0 390 198" class="w-full max-w-lg mx-auto bg-purple-50/40 rounded-2xl border border-purple-200 p-1">
            <text x="195" y="18" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="14" fill="#3b0764">${title}</text>
            ${gridHtml}
            <line x1="${chartLeft}" y1="${chartTop}" x2="${chartLeft}" y2="${chartBot}" stroke="#334155" stroke-width="2.5" />
            <line x1="${chartLeft}" y1="${chartBot}" x2="${chartRight}" y2="${chartBot}" stroke="#334155" stroke-width="2.5" />
            ${barsHtml}
            ${guideHtml}
        </svg>
    `;
}

export function renderMeanLevelingSVG(nums, labels, meanVal) {
    const maxVal = Math.max(...nums, meanVal) + 1;
    const chartLeft = 36, chartRight = 354, chartTop = 26, chartBot = 135;
    const chartH = chartBot - chartTop;
    const slotW = (chartRight - chartLeft) / nums.length;
    const barW = Math.min(44, slotW * 0.58);
    const colors = ['#fb7185', '#f59e0b', '#38bdf8', '#34d399', '#a78bfa'];
    const meanY = chartBot - (meanVal / maxVal) * chartH;

    let barsHtml = nums.map((v, idx) => {
        const barH = (v / maxVal) * chartH;
        const bx = chartLeft + idx * slotW + (slotW - barW) / 2;
        const by = chartBot - barH;
        return `
            <rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="8" fill="${colors[idx % colors.length]}" />
            <text x="${(bx + barW / 2).toFixed(1)}" y="${(by - 6).toFixed(1)}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="13" fill="#0f172a">${formatNumSv(v)}</text>
            <text x="${(bx + barW / 2).toFixed(1)}" y="${chartBot + 17}" text-anchor="middle" font-family="Nunito" font-weight="800" font-size="11" fill="#475569">${labels[idx]}</text>
        `;
    }).join('');

    return `
        <svg viewBox="0 0 390 165" class="w-full max-w-md mx-auto bg-rose-50/40 rounded-2xl border border-rose-200 p-1 my-2">
            <line x1="${chartLeft}" y1="${chartBot}" x2="${chartRight}" y2="${chartBot}" stroke="#334155" stroke-width="2.5" />
            ${barsHtml}
            <line x1="${chartLeft - 6}" y1="${meanY.toFixed(1)}" x2="${chartRight + 6}" y2="${meanY.toFixed(1)}" stroke="#059669" stroke-width="3" stroke-dasharray="6 4" class="svg-arc-draw" />
            <rect x="115" y="${Math.max(4, meanY - 24).toFixed(1)}" width="160" height="20" rx="8" fill="#d1fae5" stroke="#059669" stroke-width="1.5" />
            <text x="195" y="${Math.max(18, meanY - 10).toFixed(1)}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="11" fill="#065f46">Utjämnad nivå = ${formatNumSv(meanVal)}</text>
        </svg>
    `;
}
