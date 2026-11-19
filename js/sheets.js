// js/sheets.js — autogenererad av split.py från original.html
import { playSound } from './core.js';

export function handleSheetKeyDown(e, cellId) {
    if (e.key === ' ') {
        e.preventDefault();
        playSound('click');
        e.target.classList.toggle('digit-struck');
        return;
    }
    const parts = cellId.split('-');
    if (parts.length < 4) return;
    const prefix = `${parts[0]}-${parts[1]}`;
    const r = parseInt(parts[2], 10);
    const c = parseInt(parts[3], 10);

    if (e.key === 'ArrowRight') {
        const next = document.getElementById(`${prefix}-${r}-${c + 1}`);
        if (next) { e.preventDefault(); next.focus(); }
    } else if (e.key === 'ArrowLeft') {
        const prev = document.getElementById(`${prefix}-${r}-${c - 1}`);
        if (prev) { e.preventDefault(); prev.focus(); }
    } else if (e.key === 'ArrowDown') {
        const down = document.getElementById(`${prefix}-${r + 1}-${c}`);
        if (down) { e.preventDefault(); down.focus(); }
    } else if (e.key === 'ArrowUp') {
        const up = document.getElementById(`${prefix}-${r - 1}-${c}`);
        if (up) { e.preventDefault(); up.focus(); }
    } else if (e.key === 'Backspace' && e.target.value === '') {
        const prev = document.getElementById(`${prefix}-${r}-${c - 1}`);
        if (prev) { e.preventDefault(); prev.focus(); }
    }
}

export function handleSheetInput(inp, rowIdx) {
    let v = inp.value;
    if (v.toLowerCase() === 'x' || v === '*') {
        inp.value = '×';
    } else if (v === '-') {
        inp.value = '−';
    }
    if (rowIdx === 0 || inp.value.trim() === '10') {
        inp.classList.add('math-grid-carry-input');
    } else {
        inp.classList.remove('math-grid-carry-input');
    }
}
