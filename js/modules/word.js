// js/modules/word.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { handleSheetInput, handleSheetKeyDown } from '../sheets.js';
import { formatNumSv, randInt, showFeedback } from '../utils.js';

/* =============================================================
   18. MODUL 15: TEXTUPPGIFTER (FLERSTEG & EGET RUTPAPPER)
============================================================== */
export const WORD_PROBLEMS = [
    {
        level: 'easy',
        cat: 'units',
        badge: '🧪 Volym & Enhetsbyte',
        text: 'Kalle har 0,45 liter kaffe i sin termos. Under dagen dricker han 25 cl. Hur mycket kaffe är kvar? Svara i liter.',
        ans: 0.2,
        unit: 'liter',
        hints: [
            '<p>Gör om båda måtten till samma enhet (cl): <strong>0,45 liter = 45 cl</strong>.</p>',
            '<p>Räkna ut hur mycket som är kvar: <strong>45 cl − 25 cl = 20 cl</strong>, vilket är <strong>0,2 liter</strong>!</p>'
        ]
    },
    {
        level: 'medium',
        cat: 'units',
        badge: '📏 Längd i flera steg',
        text: 'Sara har ett snöre som är 2 meter långt. Hon klipper av två bitar som är 45 cm vardera. Hur många cm snöre har hon kvar?',
        ans: 110,
        unit: 'cm',
        hints: [
            '<p>Gör om 2 meter till centimeter: <strong>2 m = 200 cm</strong>. De två bitarna är tillsammans <strong>45 + 45 = 90 cm</strong>.</p>',
            '<p>Dra bort bitarna: <strong>200 cm − 90 cm = 110 cm</strong> kvar!</p>'
        ]
    },
    {
        level: 'hard',
        cat: 'units',
        badge: '🚀 Flersteg • Volym & Enheter',
        text: 'En vattenflaska rymmer 1,5 liter. Lisa häller upp 3 glas med 25 cl i varje glas och dricker sedan 1,5 dl ur flaskan. Hur många deciliter (dl) vatten är kvar i flaskan?',
        ans: 6,
        unit: 'dl',
        hints: [
            '<p><strong>Steg 1:</strong> Gör om allt till deciliter (dl): Flaskan har <strong>1,5 liter = 15 dl</strong>.</p>',
            '<p><strong>Steg 2:</strong> De 3 glasen är <strong>3 × 25 cl = 75 cl = 7,5 dl</strong>. Hon dricker också <strong>1,5 dl</strong> (tillsammans <strong>9 dl</strong>).</p>',
            '<p><strong>Steg 3:</strong> Kvar i flaskan: <strong>15 dl − 9 dl = 6 dl</strong>!</p>'
        ]
    },
    {
        level: 'hard',
        cat: 'units',
        badge: '🚀 Flersteg • Sträcka & Kilometer',
        text: 'En löparbana är 400 meter lång. Erik springer 6 varv och sedan ytterligare 350 meter. Hur långt har han sprungit totalt? Svara i kilometer.',
        ans: 2.75,
        unit: 'km',
        hints: [
            '<p><strong>Steg 1:</strong> Räkna ut sträckan på banan: <strong>6 × 400 m = 2 400 m</strong>.</p>',
            '<p><strong>Steg 2:</strong> Lägg till de sista 350 meterna: <strong>2 400 + 350 = 2 750 m</strong>.</p>',
            '<p><strong>Steg 3:</strong> Gör om till kilometer (dela med 1 000): <strong>2 750 m = 2,75 km</strong>!</p>'
        ]
    },
    {
        level: 'easy',
        cat: 'frac',
        badge: '🍕 Bråk & Antal',
        text: 'I en låda ligger 24 kolor. Maja äter upp 1/4 av kolorna och ger sedan bort 3 kolor till sin bror. Hur många kolor har Maja kvar i lådan?',
        ans: 15,
        unit: 'kolor',
        hints: [
            '<p>Räkna först ut 1/4 av 24: <strong>24 ÷ 4 = 6 kolor</strong> som hon äter upp (24 − 6 = 18 kvar).</p>',
            '<p>Sedan ger hon bort 3 kolor: <strong>18 − 3 = 15 kolor</strong> kvar!</p>'
        ]
    },
    {
        level: 'hard',
        cat: 'frac',
        badge: '🚀 Flersteg • Bråk & Procent',
        text: 'I en biosalong finns 120 platser. 3/4 av platserna är bokade av vuxna och 1/6 av platserna är bokade av barn. Hur många tomma platser finns det kvar?',
        ans: 10,
        unit: 'platser',
        hints: [
            '<p><strong>Steg 1:</strong> Vuxna: 1/4 av 120 är 30, så 3/4 är <strong>3 × 30 = 90 platser</strong>.</p>',
            '<p><strong>Steg 2:</strong> Barn: 1/6 av 120 är <strong>120 ÷ 6 = 20 platser</strong>. Totalt bokat: <strong>90 + 20 = 110 platser</strong>.</p>',
            '<p><strong>Steg 3:</strong> Tomma platser: <strong>120 − 110 = 10 platser</strong>!</p>'
        ]
    },
    {
        level: 'hard',
        cat: 'frac',
        badge: '🚀 Flersteg • Rea & Rabatt',
        text: 'En jacka kostar 480 kr. På rean sänks priset först med 25 % och sedan får Amir ytterligare 40 kr rabatt med en kupong. Vad får Amir betala för jackan?',
        ans: 320,
        unit: 'kr',
        hints: [
            '<p><strong>Steg 1:</strong> 25 % är samma sak som en fjärdedel (1/4): <strong>480 ÷ 4 = 120 kr</strong> i rabatt.</p>',
            '<p><strong>Steg 2:</strong> Efter rean kostar jackan <strong>480 − 120 = 360 kr</strong>.</p>',
            '<p><strong>Steg 3:</strong> Dra av kupongen på 40 kr: <strong>360 − 40 = 320 kr</strong>!</p>'
        ]
    },
    {
        level: 'medium',
        cat: 'money',
        badge: '💰 Vardag & Flersteg',
        text: 'Leo köper 3 tidningar som kostar 25 kr styck. Han betalar med en 100-lapp. Hur mycket ska han få tillbaka i växel?',
        ans: 25,
        unit: 'kr',
        hints: [
            '<p>Räkna först ut vad 3 tidningar kostar: <strong>3 × 25 kr = 75 kr</strong>.</p>',
            '<p>Räkna ut växeln från 100 kr: <strong>100 kr − 75 kr = 25 kr</strong> tillbaka!</p>'
        ]
    },
    {
        level: 'hard',
        cat: 'money',
        badge: '🚀 Flersteg • Klassresa',
        text: 'En klass på 24 elever ska åka på utflykt. Biljetten kostar 45 kr per elev och bussen kostar 620 kr totalt för alla. Hur mycket kostar hela utflykten tillsammans?',
        ans: 1700,
        unit: 'kr',
        hints: [
            '<p><strong>Steg 1:</strong> Räkna ut biljetterna för alla 24 elever: <strong>24 × 45 kr = 1 080 kr</strong>.</p>',
            '<p><strong>Steg 2:</strong> Lägg till busskostnaden: <strong>1 080 + 620 = 1 700 kr</strong>!</p>'
        ]
    }
];

export function setWordCategory(cat) {
    playSound('click');
    state.wordCategory = cat;
    ['all', 'units', 'frac', 'money'].forEach(c => {
        const btn = document.getElementById(`word-cat-${c}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (c === cat ? 'bg-amber-500 text-white' : 'bg-white border border-amber-200 text-slate-700');
    });
    generateWordQuestion();
}

export function generateWordQuestion() {
    document.getElementById('word-feedback').classList.add('hidden');
    document.getElementById('word-next-wrap').classList.add('hidden');
    state.wordLineRows = {};
    buildWordGrid();

    let pool = state.wordCategory === 'all'
        ? WORD_PROBLEMS
        : WORD_PROBLEMS.filter(p => p.cat === state.wordCategory);

    if (state.difficulty === 'hard') {
        const hardPool = pool.filter(p => p.level === 'hard');
        if (hardPool.length > 0) pool = hardPool;
    } else if (state.difficulty === 'easy') {
        const easyPool = pool.filter(p => p.level !== 'hard');
        if (easyPool.length > 0) pool = easyPool;
    }

    const item = pool[randInt(0, pool.length - 1)];
    state.currentWord = item;

    document.getElementById('word-badge').textContent = item.badge;
    document.getElementById('word-problem-text').textContent = item.text;
    document.getElementById('word-unit-label').textContent = item.unit;
    const inp = document.getElementById('word-final-input');
    inp.value = '';
    setHintSteps('word', item.hints);
}

export function buildWordGrid() {
    const container = document.getElementById('word-grid-container');
    if (!container) return;
    const rows = 4, cols = 9;
    let html = `<div class="math-grid-paper" style="grid-template-columns: repeat(${cols}, 44px);">`;
    for (let r = 0; r < rows; r++) {
        const hasLine = !!state.wordLineRows[r];
        for (let c = 0; c < cols; c++) {
            const cellId = `word-cell-${r}-${c}`;
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

export function insertWordGridSymbol(sym) {
    playSound('click');
    if (state.lastFocusedCellId && state.lastFocusedCellId.startsWith('word-cell-')) {
        const el = document.getElementById(state.lastFocusedCellId);
        if (el) { el.value = sym; el.focus(); return; }
    }
    const first = document.getElementById('word-cell-1-1');
    if (first) { first.value = sym; first.focus(); }
}

export function toggleWordGridLine() {
    playSound('click');
    let targetRow = 1;
    if (state.lastFocusedCellId && state.lastFocusedCellId.startsWith('word-cell-')) {
        targetRow = parseInt(state.lastFocusedCellId.split('-')[2], 10);
    }
    state.wordLineRows[targetRow] = !state.wordLineRows[targetRow];
    buildWordGrid();
}

export function clearWordGrid() {
    playSound('click');
    state.wordLineRows = {};
    buildWordGrid();
}

export function checkWordAnswer() {
    if (!document.getElementById('word-next-wrap').classList.contains('hidden')) return;
    const raw = document.getElementById('word-final-input').value.trim().replace(',', '.');
    const val = parseFloat(raw);
    if (isNaN(val)) {
        showFeedback('word-feedback', false, '✏️ Skriv ditt slutsvar i rutan ovanför!');
        return;
    }
    const { ans, unit } = state.currentWord;
    if (Math.abs(val - ans) < 0.005) {
        addReward(2);
        showFeedback('word-feedback', true, `🌟 Strålande lösning! Rätt svar är ${formatNumSv(ans)} ${unit}!`);
        document.getElementById('word-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        showFeedback('word-feedback', false, `🤔 Inte riktigt ${formatNumSv(val)} ${unit} – dela upp problemet i två steg och försök igen!`);
    }
}
