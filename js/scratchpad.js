// js/scratchpad.js — autogenererad av split.py från original.html
import { playSound, state } from './core.js';
import { handleSheetInput, handleSheetKeyDown } from './sheets.js';

/* =============================================================
   19. DOCKAT KLADDBLOCK & MULTIPLIKATIONSTABELL-DRAWER
============================================================== */
export function toggleScratchpad() {
    playSound('click');
    state.scratchpadOpen = !state.scratchpadOpen;
    const sec = document.getElementById('docked-scratchpad');
    const btn = document.getElementById('scratchpad-toggle-btn');
    if (!sec) return;
    sec.classList.toggle('hidden', !state.scratchpadOpen);
    if (btn) {
        btn.classList.toggle('ring-2', state.scratchpadOpen);
        btn.classList.toggle('ring-sky-500', state.scratchpadOpen);
    }
    if (state.scratchpadOpen) {
        if (!document.getElementById('scratchpad-grid-container').innerHTML) buildScratchpadGrid();
        if (state.scratchpadTab === 'draw') resizeScratchpadCanvas();
        sec.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

export function setScratchpadTab(tab) {
    playSound('click');
    state.scratchpadTab = tab;
    document.getElementById('sp-tab-grid').className = 'px-3 py-1.5 rounded-xl text-xs font-extrabold ' + (tab === 'grid' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700');
    document.getElementById('sp-tab-draw').className = 'px-3 py-1.5 rounded-xl text-xs font-extrabold ' + (tab === 'draw' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700');
    document.getElementById('sp-grid-panel').classList.toggle('hidden', tab !== 'grid');
    document.getElementById('sp-draw-panel').classList.toggle('hidden', tab !== 'draw');
    if (tab === 'draw') resizeScratchpadCanvas();
}

export function buildScratchpadGrid() {
    const container = document.getElementById('scratchpad-grid-container');
    if (!container) return;
    const rows = 5, cols = 10;
    let html = `<div class="math-grid-paper" style="grid-template-columns: repeat(${cols}, 44px);">`;
    for (let r = 0; r < rows; r++) {
        const hasLine = !!state.scratchpadLineRows[r];
        for (let c = 0; c < cols; c++) {
            const cellId = `sp-cell-${r}-${c}`;
            html += `
                <div class="math-grid-cell ${hasLine ? 'math-grid-row-line' : ''}" style="width:44px;height:44px;">
                    <input id="${cellId}" maxlength="2"
                        onfocus="state.lastFocusedCellId='${cellId}'"
                        onkeydown="handleSheetKeyDown(event, '${cellId}')"
                        oninput="handleSheetInput(this, ${r})"
                        class="math-grid-input text-lg">
                </div>
            `;
        }
    }
    html += `</div>`;
    container.innerHTML = html;
}

export function insertScratchpadSymbol(sym) {
    playSound('click');
    if (state.lastFocusedCellId && state.lastFocusedCellId.startsWith('sp-cell-')) {
        const el = document.getElementById(state.lastFocusedCellId);
        if (el) { el.value = sym; el.focus(); return; }
    }
    const first = document.getElementById('sp-cell-1-1');
    if (first) { first.value = sym; first.focus(); }
}

export function toggleScratchpadLine() {
    playSound('click');
    let targetRow = 2;
    if (state.lastFocusedCellId && state.lastFocusedCellId.startsWith('sp-cell-')) {
        targetRow = parseInt(state.lastFocusedCellId.split('-')[2], 10);
    }
    state.scratchpadLineRows[targetRow] = !state.scratchpadLineRows[targetRow];
    buildScratchpadGrid();
}

export let spPenColor = '#0284c7';

export let spPenWidth = 4;

export let spDrawing = false;

export function setScratchpadPen(color, width) {
    playSound('click');
    spPenColor = color;
    spPenWidth = width;
}

export function resizeScratchpadCanvas() {
    const canvas = document.getElementById('scratchpad-canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
}

export function initScratchpadCanvas() {
    const canvas = document.getElementById('scratchpad-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const start = (e) => {
        spDrawing = true;
        const p = getPos(e);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
    };
    const move = (e) => {
        if (!spDrawing) return;
        if (e.cancelable) e.preventDefault();
        const p = getPos(e);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = spPenColor;
        ctx.lineWidth = spPenWidth;
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    };
    const end = () => { spDrawing = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);
}

export function clearScratchpad() {
    playSound('click');
    if (state.scratchpadTab === 'grid') {
        state.scratchpadLineRows = {};
        buildScratchpadGrid();
    } else {
        const canvas = document.getElementById('scratchpad-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
}
