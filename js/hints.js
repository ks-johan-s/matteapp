// js/hints.js — autogenererad av split.py från original.html
import { playSound, state } from './core.js';
import { styleNumbersIn } from './utils.js';

export const moduleHintsData = {};

// Pedagogiskt "varför"-steg – förklarar idén bakom räknesättet, inte bara stegen.
const moduleConcepts = {
    addsub: 'Att räkna i huvudet går fortare om du delar upp talet: ta tiotalen för sig och entalen för sig – sen hoppar du på tallinjen.',
    mult: 'Multiplikation betyder ”lika många grupper” – som ett rutenät (array) med rader och kolumner. 3 × 4 är tre rader med fyra prickar – och 3 × 4 = 4 × 3.',
    div: 'Division betyder ”dela lika” – antingen delar du ut ett i taget (delning) eller räknar hur många grupper som får plats (innehåll). Det är multiplikation baklänges!',
    seq: 'Ett mönster är något som upprepas eller växer på ett regelbundet sätt. Nyckeln är att hitta regeln: ”vad händer mellan varje steg?”',
    algo: 'Uppställning är ett knep så att du inte tappar bort siffror: räkna från höger, skriv minnessiffror och stryk över det du lånar.',
    scale: 'Likhetstecknet betyder ”det som står till vänster är värt lika mycket som till höger" – inte ”här kommer svaret".',
    frac: 'Ett bråk beskriver en del av en hel: nämnaren (där nere) säger hur många bitar helheten är delad i, täljaren (där uppe) hur många bitar vi har.',
    combo: '”Bråk av ett antal” = dela först i lika högar, ta sedan så många högar som täljaren säger.',
    decimal: 'Decimaltal är tiondelar och hundradelar av en hel – på tallinjen ligger 0,5 precis mitt emellan 0 och 1.',
    length: 'Enheterna bildar en trappa: varje steg neråt (km → m → dm → cm → mm) multiplicerar med 10, varje steg uppåt dividerar.',
    volweight: 'Samma trappa-tänk som för längd: 1 l = 10 dl = 100 cl, och 1 kg = 10 hg = 1 000 g.',
    clock: 'Klockan har två visare: den korta visar timmar och den långa minuter – varje siffra på urtavlan är 5 minuter.',
    shop: 'Att ge tillbaka växel = räkna UPPÅT från varans pris till summan kunden betalar med.',
    geo: 'Area = hur stor yta figuren täcker (rutorna inuti), omkrets = hur långt det är runt hela figuren.',
    chart: 'Ett diagram gör datan synlig: ju högre stapel, desto fler – siffrorna till vänster hjälper dig läsa av.',
    avg: 'Det finns tre sätt att hitta ”det typiska talet”: medelvärde (jämna ut allt), median (mitten efter sortering) och typvärde (förekommer flest gånger).',
    word: 'Textuppgifter löses i steg: läs noga, gör om till samma enhet, räkna ut – och kontrollera att svaret har rätt enhet.'
};

export function setHintSteps(mod, stepsArr) {
    moduleHintsData[mod] = stepsArr;
    state.hintSteps[mod] = 1;
    const box = document.getElementById(`${mod}-hint-box`);
    if (box) box.classList.add('hidden');
    const card = document.getElementById(`view-${mod}`)?.querySelector('.rounded-3xl');
    if (card) {
        card.classList.remove('card-in');
        void card.offsetWidth;
        card.classList.add('card-in');
    }
    [`${mod}-question-text`, `${mod}-problem-text`, `${mod}-tilt-status`]
        .forEach(id => styleNumbersIn(document.getElementById(id)));
}

export function toggleHintBox(mod) {
    playSound('click');
    const box = document.getElementById(`${mod}-hint-box`);
    if (!box) return;
    const willOpen = box.classList.contains('hidden');
    box.classList.toggle('hidden');
    if (willOpen) {
        renderHintBox(mod);
        box.classList.remove('hint-box-enter');
        void box.offsetWidth;
        box.classList.add('hint-box-enter');
        setTimeout(() => box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
    }
}

export function nextHintStep(mod) {
    playSound('click');
    const steps = moduleHintsData[mod] || [];
    if (state.hintSteps[mod] < steps.length) {
        state.hintSteps[mod] += 1;
        renderHintBox(mod);
    }
}

export function renderHintBox(mod) {
    const steps = moduleHintsData[mod] || [];
    const shown = state.hintSteps[mod] || 1;
    const contentEl = document.getElementById(`${mod}-hint-content`);
    const badgeEl = document.getElementById(`${mod}-hint-step-badge`);
    const nextBtn = document.getElementById(`${mod}-hint-next-btn`);

    if (badgeEl) badgeEl.textContent = `Steg ${Math.min(shown, steps.length)} av ${steps.length}`;
    if (contentEl) {
        const concept = moduleConcepts[mod]
            ? `<div class="hint-step-card bg-violet-50 rounded-xl p-3 border border-violet-200 shadow-2xs">
                <span class="inline-block px-2 py-0.5 rounded-md bg-violet-100 text-violet-900 text-[11px] font-extrabold mb-1">💭 Varför?</span>
                <div>${moduleConcepts[mod]}</div>
            </div>`
            : '';
        contentEl.innerHTML = concept + steps.slice(0, shown).map((html, idx) => `
            <div class="hint-step-card bg-white rounded-xl p-3 border border-sky-200 shadow-2xs">
                <span class="inline-block px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 text-[11px] font-extrabold mb-1">Steg ${idx + 1}</span>
                <div>${html}</div>
            </div>
        `).join('');
    }
    if (nextBtn) {
        nextBtn.classList.toggle('hidden', shown >= steps.length);
    }
}
