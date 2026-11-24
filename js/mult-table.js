// js/mult-table.js — autogenererad av split.py från original.html
import { playSound, state } from './core.js';

export function toggleTableDrawer() {
    playSound('click');
    const drawer = document.getElementById('table-drawer');
    const backdrop = document.getElementById('table-drawer-backdrop');
    if (!drawer || !backdrop) return;
    const isClosed = drawer.classList.contains('translate-x-full');
    drawer.classList.toggle('translate-x-full', !isClosed);
    backdrop.classList.toggle('hidden', !isClosed);
}

export function buildMultHelperTable() {
    const container = document.getElementById('mult-helper-grid');
    if (!container) return;
    let html = `<div class="grid grid-cols-11 gap-1 text-center font-display font-bold text-xs sm:text-sm select-none">`;
    html += `<div class="p-1.5 rounded-lg border-2 border-slate-400 bg-white text-slate-700">×</div>`;
    for (let c = 1; c <= 10; c++) {
        html += `<div id="mt-col-hdr-${c}" class="mult-table-cell mtc-hdr-${c} p-1.5 rounded-lg border-2 bg-white text-slate-800">${c}</div>`;
    }
    for (let r = 1; r <= 10; r++) {
        html += `<div id="mt-row-hdr-${r}" class="mult-table-cell mtc-hdr-${r} p-1.5 rounded-lg border-2 bg-white text-slate-800">${r}</div>`;
        for (let c = 1; c <= 10; c++) {
            html += `<button id="mt-cell-${r}-${c}"
                onmouseenter="if(!state.lockedTableCell) highlightMultCell(${r}, ${c}, false)"
                onclick="highlightMultCell(${r}, ${c}, true)"
                class="mult-table-cell mtc-${c} p-1.5 rounded-lg border border-black/10 text-white hover:brightness-110">
                ${r * c}
            </button>`;
        }
    }
    html += `</div>`;
    container.innerHTML = html;
}

export function highlightMultCell(r, c, lock = false) {
    if (lock) {
        playSound('click');
        if (state.lockedTableCell && state.lockedTableCell.r === r && state.lockedTableCell.c === c) {
            state.lockedTableCell = null;
        } else {
            state.lockedTableCell = { r, c };
        }
    }
    const target = state.lockedTableCell || { r, c };
    document.querySelectorAll('.mult-table-cell').forEach(el => {
        el.classList.remove('mult-hl-row-col', 'mult-hl-header', 'mult-hl-active');
    });
    const rHdr = document.getElementById(`mt-row-hdr-${target.r}`);
    const cHdr = document.getElementById(`mt-col-hdr-${target.c}`);
    if (rHdr) rHdr.classList.add('mult-hl-header');
    if (cHdr) cHdr.classList.add('mult-hl-header');

    for (let i = 1; i <= 10; i++) {
        const rowCell = document.getElementById(`mt-cell-${target.r}-${i}`);
        const colCell = document.getElementById(`mt-cell-${i}-${target.c}`);
        if (rowCell) rowCell.classList.add('mult-hl-row-col');
        if (colCell) colCell.classList.add('mult-hl-row-col');
    }
    const activeCell = document.getElementById(`mt-cell-${target.r}-${target.c}`);
    if (activeCell) activeCell.classList.add('mult-hl-active');

    const readout = document.getElementById('mult-helper-readout');
    if (readout) {
        readout.textContent = `${target.r} × ${target.c} = ${target.r * target.c}${state.lockedTableCell ? ' 📌' : ''}`;
    }
}
