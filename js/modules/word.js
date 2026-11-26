// js/modules/word.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { handleSheetInput, handleSheetKeyDown } from '../sheets.js';
import { formatNumSv, randInt, showFeedback } from '../utils.js';
import { divStackHTML } from '../visuals.js';

/* =============================================================
   18. MODUL 15: TEXTUPPGIFTER (FLERSTEG & EGET RUTPAPPER)
============================================================== */
// Generativa textuppgifter: varje mall ger ny fråga med slumpade namn och tal.
const WORD_NAMES = ['Kalle', 'Sara', 'Leo', 'Lisa', 'Maja', 'Amir', 'Elin', 'Omar', 'Freja', 'Sam', 'Iris', 'Nils', 'Vera', 'Hugo'];
const wPick = (arr) => arr[randInt(0, arr.length - 1)];
const wName = () => wPick(WORD_NAMES);
const wTwoNames = () => {
    const a = wName();
    let b = wName();
    if (b === a) b = a === 'Lisa' ? 'Kalle' : 'Lisa';
    return [a, b];
};
const wGen = (name) => name.endsWith('s') ? name : name + 's';
const wFmt = (n) => formatNumSv(n);

function genVolym() {
    const name = wName();
    if (state.difficulty === 'easy') {
        const drinkCl = wPick([15, 20, 25, 30, 35, 40]);
        const leftCl = wPick([10, 20, 25, 30, 50, 60]);
        const totalL = (drinkCl + leftCl) / 100;
        return {
            badge: '🧪 Volym & Enhetsbyte',
            text: `${name} har ${wFmt(totalL)} liter saft i sin flaska. Under dagen dricker hen ${drinkCl} cl. Hur mycket saft är kvar? Svara i liter.`,
            ans: leftCl / 100, unit: 'liter',
            hints: [
                `<p>Gör om till samma enhet (cl): <strong>${wFmt(totalL)} liter = ${drinkCl + leftCl} cl</strong>.</p>`,
                `<p>Kvar: <strong>${drinkCl + leftCl} cl − ${drinkCl} cl = ${leftCl} cl</strong>, vilket är <strong>${wFmt(leftCl / 100)} liter</strong>!</p>`
            ]
        };
    }
    if (state.difficulty === 'medium') {
        const n = wPick([2, 3]);
        const glassCl = wPick([25, 30, 50]);
        const leftCl = wPick([50, 75, 100, 150]);
        const totalCl = n * glassCl + leftCl;
        return {
            badge: '🧪 Volym i flera steg',
            text: `En saftflaska rymmer ${wFmt(totalCl / 100)} liter. ${name} häller upp ${n} glas med ${glassCl} cl i varje glas. Hur många centiliter saft är kvar?`,
            ans: leftCl, unit: 'cl',
            hints: [
                `<p><strong>Steg 1:</strong> Gör om till centiliter: <strong>${wFmt(totalCl / 100)} liter = ${totalCl} cl</strong>. Glasen är <strong>${n} × ${glassCl} = ${n * glassCl} cl</strong>.</p>`,
                `<p><strong>Steg 2:</strong> Kvar: <strong>${totalCl} − ${n * glassCl} = ${leftCl} cl</strong>!</p>`
            ]
        };
    }
    let liters, n, glassCl, drinkDl, ans;
    do {
        liters = wPick([1.5, 2, 2.5, 3]);
        n = wPick([3, 4]);
        glassCl = wPick([20, 25, 50]);
        drinkDl = wPick([1.5, 2, 2.5]);
        ans = liters * 10 - (n * glassCl) / 10 - drinkDl;
    } while (ans <= 0);
    return {
        badge: '🚀 Flersteg • Volym & Enheter',
        text: `En vattenflaska rymmer ${wFmt(liters)} liter. ${name} häller upp ${n} glas med ${glassCl} cl i varje glas och dricker sedan ${wFmt(drinkDl)} dl ur flaskan. Hur många deciliter (dl) vatten är kvar?`,
        ans, unit: 'dl',
        hints: [
            `<p><strong>Steg 1:</strong> Gör om allt till deciliter: flaskan har <strong>${wFmt(liters)} liter = ${liters * 10} dl</strong>.</p>`,
            `<p><strong>Steg 2:</strong> Glasen är <strong>${n} × ${glassCl} cl = ${n * glassCl} cl = ${wFmt(n * glassCl / 10)} dl</strong>. Plus ${wFmt(drinkDl)} dl blir det <strong>${wFmt(n * glassCl / 10 + drinkDl)} dl</strong> som försvinner.</p>`,
            `<p><strong>Steg 3:</strong> Kvar: <strong>${liters * 10} − ${wFmt(n * glassCl / 10 + drinkDl)} = ${wFmt(ans)} dl</strong>!</p>`
        ]
    };
}

function genLangd() {
    const name = wName();
    const totalM = wPick(state.difficulty === 'easy' ? [1, 2, 3] : [1.5, 2, 2.5, 3, 4]);
    const n = wPick(state.difficulty === 'hard' ? [2, 3, 4] : [2, 3]);
    const maxPiece = Math.floor(totalM * 100 / n / 5) * 5 - 5;
    const pieceCm = wPick([25, 30, 35, 40, 45, 50, 55, 60].filter(c => c <= maxPiece));
    const ans = Math.round(totalM * 100) - n * pieceCm;
    return {
        badge: '📏 Längd i flera steg',
        text: `${name} har ett snöre som är ${wFmt(totalM)} meter långt. Hen klipper av ${n} bitar som är ${pieceCm} cm vardera. Hur många cm snöre är kvar?`,
        ans, unit: 'cm',
        hints: [
            `<p><strong>Steg 1:</strong> Gör om till centimeter: <strong>${wFmt(totalM)} m = ${Math.round(totalM * 100)} cm</strong>. Bitarna är tillsammans <strong>${n} × ${pieceCm} = ${n * pieceCm} cm</strong>.</p>`,
            `<p><strong>Steg 2:</strong> Kvar: <strong>${Math.round(totalM * 100)} − ${n * pieceCm} = ${ans} cm</strong>!</p>`
        ]
    };
}

function genStracka() {
    const name = wName();
    if (state.difficulty !== 'hard') {
        const laps = wPick([3, 4, 5]);
        const extra = wPick([100, 200, 350, 500]);
        const ans = laps * 400 + extra;
        return {
            badge: '🏃 Sträcka & Meter',
            text: `En löparbana är 400 meter lång. ${name} springer ${laps} varv och sedan ytterligare ${extra} meter. Hur många meter har hen sprungit totalt?`,
            ans, unit: 'meter',
            hints: [
                `<p><strong>Steg 1:</strong> Varven: <strong>${laps} × 400 = ${laps * 400} m</strong>.</p>`,
                `<p><strong>Steg 2:</strong> Totalt: <strong>${laps * 400} + ${extra} = ${ans} m</strong>!</p>`
            ]
        };
    }
    const laps = wPick([4, 5, 6, 8]);
    const extra = wPick([150, 250, 350, 450, 600, 750]);
    const totalM = laps * 400 + extra;
    return {
        badge: '🚀 Flersteg • Sträcka & Kilometer',
        text: `En löparbana är 400 meter lång. ${name} springer ${laps} varv och sedan ytterligare ${extra} meter. Hur långt har hen sprungit totalt? Svara i kilometer.`,
        ans: totalM / 1000, unit: 'km',
        hints: [
            `<p><strong>Steg 1:</strong> Varven: <strong>${laps} × 400 m = ${wFmt(laps * 400)} m</strong>.</p>`,
            `<p><strong>Steg 2:</strong> Lägg till de sista meterna: <strong>${wFmt(laps * 400)} + ${extra} = ${wFmt(totalM)} m</strong>.</p>`,
            `<p><strong>Steg 3:</strong> Gör om till kilometer (dela med 1 000): <strong>${wFmt(totalM)} m = ${wFmt(totalM / 1000)} km</strong>!</p>`
        ]
    };
}

function genTid() {
    const name = wName();
    if (state.difficulty === 'easy') {
        const h = wPick([14, 15, 16, 17]);
        const startM = wPick([10, 15, 20, 25]);
        const addM = wPick([10, 15, 20, 30]);
        const endM = startM + addM;
        return {
            badge: '🕐 Tiden till filmen',
            text: `Klockan är ${h}:${String(startM).padStart(2, '0')}. ${wGen(name)} film börjar ${h}:${String(endM).padStart(2, '0')}. Hur många minuter är det kvar till filmen börjar?`,
            ans: addM, unit: 'minuter',
            hints: [
                `<p><strong>Steg 1:</strong> Timmen är samma på båda klockslagen – räkna bara minuterna!</p>`,
                `<p><strong>Steg 2:</strong> <strong>${endM} − ${startM} = ${addM} minuter</strong> kvar!</p>`
            ]
        };
    }
    if (state.difficulty === 'medium') {
        const h = wPick([14, 15, 16, 17, 18]);
        const m = wPick([0, 10, 15, 20, 30]);
        const durM = wPick([25, 35, 45, 50, 55, 65, 75, 85]);
        const endM = m + durM;
        const endH = h + Math.floor(endM / 60);
        const clock = endH + (endM % 60) / 100;
        return {
            badge: '🕐 När slutar filmen?',
            text: `Filmen börjar klockan ${h}:${String(m).padStart(2, '0')} och är ${durM} minuter lång. Vad är klockan när den slutar? (Skriv t.ex. 15.35)`,
            ans: Math.round(clock * 100) / 100, unit: 'klockan',
            hints: [
                `<p><strong>Steg 1:</strong> Lägg till minuterna: <strong>${m} + ${durM} = ${endM} minuter</strong>. ${endM >= 60 ? `Det är mer än 60, så klockan blir en timme senare och ${endM % 60} minuter över.` : 'Det är under 60, så timmen är densamma.'}</p>`,
                `<p><strong>Steg 2:</strong> Filmen slutar <strong>${endH}:${String(endM % 60).padStart(2, '0')}</strong> – skriv ${wFmt(clock)}!</p>`
            ]
        };
    }
    const h1 = wPick([13, 14, 15, 16]);
    const m1 = wPick([5, 10, 15, 20, 25, 35, 40, 45]);
    const addH = wPick([1, 1, 2]);
    const addM = wPick([10, 20, 25, 30, 40]);
    let m2 = m1 + addM;
    if (m2 >= 60) return genTid();
    const dur = addH * 60 + (m2 - m1);
    return {
        badge: '🚀 Flersteg • Tid & Timmar',
        text: `Träningen började klockan ${h1}:${String(m1).padStart(2, '0')} och slutade ${h1 + addH}:${String(m2).padStart(2, '0')}. Hur många minuter höll träningen på?`,
        ans: dur, unit: 'minuter',
        hints: [
            `<p><strong>Steg 1:</strong> Dela upp det! Från ${h1}:${String(m1).padStart(2, '0')} till ${h1 + addH}:${String(m1).padStart(2, '0')} är <strong>${addH} timmar = ${addH * 60} minuter</strong>.</p>`,
            `<p><strong>Steg 2:</strong> Lägg till minuterna som blivit över: <strong>${addH * 60} + ${m2 - m1} = ${dur} minuter</strong>!</p>`
        ]
    };
}

function genJamfor() {
    const [n1, n2] = wTwoNames();
    if (state.difficulty === 'easy') {
        const aM = wPick([600, 800, 900, 1200]);
        const bKm = wPick([0.5, 1, 1.5, 2]);
        if (aM === bKm * 1000) return genJamfor();
        const winner = aM > bKm * 1000 ? n1 : n2;
        const diff = Math.abs(aM - bKm * 1000);
        return {
            badge: '⚖️ Vem sprang längst?',
            text: `${n1} sprang ${aM} meter. ${n2} sprang ${wFmt(bKm)} km. Hur många meter längre sprang ${winner}?`,
            ans: diff, unit: 'meter',
            hints: [
                `<p><strong>Steg 1:</strong> Gör om till samma enhet: <strong>${wFmt(bKm)} km = ${wFmt(bKm * 1000)} m</strong>.</p>`,
                `<p><strong>Steg 2:</strong> ${winner} sprang längst: <strong>${Math.max(aM, bKm * 1000)} − ${Math.min(aM, bKm * 1000)} = ${diff} m</strong>!</p>`
            ]
        };
    }
    const laps = wPick([4, 5, 6, 8]);
    const aM = laps * 400;
    const bKm = aM < 4000 ? wPick([3, 3.5]) : wPick([1.5, 2, 2.5]);
    const bM = bKm * 1000;
    const winner = aM > bM ? n1 : n2;
    const diff = Math.abs(aM - bM);
    return {
        badge: '🚀 Flersteg • Jämförelse',
        text: `${n1} springer ${laps} varv på en 400-metersbana. ${n2} springer ${wFmt(bKm)} km på en rak väg. Hur många meter längre sprang den som sprang längst?`,
        ans: diff, unit: 'meter',
        hints: [
            `<p><strong>Steg 1:</strong> ${n1}: <strong>${laps} × 400 = ${wFmt(aM)} m</strong>. ${n2}: <strong>${wFmt(bKm)} km = ${wFmt(bM)} m</strong>.</p>`,
            `<p><strong>Steg 2:</strong> Jämför samma enhet! ${winner} sprang längst: <strong>${Math.max(aM, bM)} − ${Math.min(aM, bM)} = ${wFmt(diff)} m</strong> längre!</p>`
        ]
    };
}

function genBrakAv() {
    const name = wName();
    const item = wPick([['kolor', 'kolorna'], ['kulor', 'kulorna'], ['klistermärken', 'klistermärkena'], ['bollar', 'bollarna']]);
    if (state.difficulty === 'easy') {
        const den = wPick([2, 3, 4, 5]);
        const perPile = wPick([4, 5, 6, 8, 9]);
        const total = den * perPile;
        const num = wPick([1, 1, 2].filter(v => v < den));
        const eaten = num * perPile;
        const left = total - eaten;
        return {
            badge: '🍕 Bråk & Antal',
            text: `I en låda ligger ${total} ${item[0]}. ${name} tar ${num}/${den} av ${item[1]}. Hur många ${item[0]} finns kvar i lådan?`,
            ans: left, unit: item[0],
            hints: [
                `<p><strong>Steg 1:</strong> Dela ${total} i ${den} lika delar: <strong>${divStackHTML(total, den)} = ${perPile}</strong> ${item[0]} per del.</p>`,
                `<p><strong>Steg 2:</strong> ${name} tar ${num} ${num === 1 ? 'del' : 'delar'}: <strong>${num} × ${perPile} = ${eaten}</strong>. Kvar: <strong>${total} − ${eaten} = ${left}</strong>!</p>`
            ]
        };
    }
    const den = wPick([3, 4, 6, 8]);
    const perPile = wPick([5, 6, 8, 10]);
    const total = den * perPile;
    const num = wPick([1, 2, 3].filter(v => v < den));
    const taken = num * perPile;
    const given = wPick([2, 3, 4, 5]);
    const other = wTwoNames()[0] === name ? 'Elin' : wTwoNames()[0];
    const ans = total - taken - given;
    return {
        badge: '🍕 Flersteg • Bråk & Antal',
        text: `I en låda ligger ${total} ${item[0]}. ${name} tar ${num}/${den} av ${item[1]} och ger sedan bort ${given} till ${other}. Hur många ${item[0]} har ${name} kvar?`,
        ans, unit: item[0],
        hints: [
            `<p><strong>Steg 1:</strong> ${num}/${den} av ${total}: en del är <strong>${divStackHTML(total, den)} = ${perPile}</strong>, så ${num} delar är <strong>${num} × ${perPile} = ${taken}</strong>.</p>`,
            `<p><strong>Steg 2:</strong> Kvar: <strong>${total} − ${taken} − ${given} = ${ans}</strong> ${item[0]}!</p>`
        ]
    };
}

function genProcent() {
    const name = wName();
    const thing = wPick([['ett dataspel', 'spelet'], ['en skateboard', 'skateboarden'], ['en ryggsäck', 'ryggsäcken'], ['ett par skor', 'skorna'], ['en bok', 'boken']]);
    if (state.difficulty === 'hard') {
        const price = wPick([240, 320, 400, 480, 600]);
        const pct = wPick([25, 50]);
        const coupon = wPick([20, 30, 40, 50]);
        const disc = price * pct / 100;
        const ans = price - disc - coupon;
        return {
            badge: '🏷️ Flersteg • Rea & Rabatt',
            text: `En ${thing[0].slice(3)} kostar ${price} kr. På rean sänks priset först med ${pct} % och sedan får ${name} ytterligare ${coupon} kr rabatt med en kupong. Vad får hen betala?`,
            ans, unit: 'kr',
            hints: [
                `<p><strong>Steg 1:</strong> ${pct} % av ${price}: <strong>${divStackHTML(price, 100 / pct)} = ${disc} kr</strong> i rabatt.</p>`,
                `<p><strong>Steg 2:</strong> Efter rean: <strong>${price} − ${disc} = ${price - disc} kr</strong>.</p>`,
                `<p><strong>Steg 3:</strong> Med kupongen: <strong>${price - disc} − ${coupon} = ${ans} kr</strong>!</p>`
            ]
        };
    }
    const pct = state.difficulty === 'easy' ? wPick([10, 25, 50]) : wPick([10, 20, 25, 50]);
    const per = wPick([20, 30, 40, 50, 60]);
    const price = per * (100 / pct);
    const ans = price * pct / 100;
    return {
        badge: '🏷️ Procent av priset',
        text: `${thing[0][0].toUpperCase() + thing[0].slice(1)} kostar ${price} kr. Det är ${pct} % rabatt i affären. Hur många kronor rabatt får ${name}?`,
        ans, unit: 'kr',
        hints: [
            `<p><strong>Steg 1:</strong> ${pct} % betyder ${pct}/100 = 1/${100 / pct}. Dela priset: <strong>${divStackHTML(price, 100 / pct)} = ${ans} kr</strong>.</p>`,
            `<p><strong>Steg 2:</strong> Rabatten är <strong>${ans} kr</strong>! (Det nya priset skulle bli ${price - ans} kr.)</p>`
        ]
    };
}

function genVaxel() {
    const name = wName();
    const thing = wPick([['tidningar', 'tidningen'], ['bullar', 'bullen'], ['pennor', 'pennan'], ['smygböcker', 'boken'], ['äpplen', 'äpplet']]);
    const n = wPick([2, 3, 4]);
    const price = wPick([15, 20, 25, 30, 35, 40]);
    const pays = wPick([100, 100, 200, 500].filter(p => p > n * price));
    const ans = pays - n * price;
    return {
        badge: '💰 Vardag & Växel',
        text: `${name} köper ${n} ${thing[0]} som kostar ${price} kr styck. Hen betalar med en ${pays}-lapp. Hur mycket ska hen få tillbaka i växel?`,
        ans, unit: 'kr',
        hints: [
            `<p><strong>Steg 1:</strong> Kostnaden: <strong>${n} × ${price} kr = ${n * price} kr</strong>.</p>`,
            `<p><strong>Steg 2:</strong> Växeln: <strong>${pays} − ${n * price} = ${ans} kr</strong> tillbaka!</p>`
        ]
    };
}

function genMissingStart() {
    const [n1, n2] = wTwoNames();
    const item = wPick(['kulor', 'klistermärken', 'fotbollskort', 'pärlor']);
    const gave = wPick([4, 6, 7, 8, 9, 12, 15]);
    const left = wPick([7, 9, 11, 13, 15, 18, 21]);
    const ans = gave + left;
    return {
        badge: '❓ Saknat start-tal',
        text: `${n1} hade en massa ${item}. Hen gav bort ${gave} ${item} till ${n2}, och har ${left} kvar. Hur många ${item} hade ${n1} från början?`,
        ans, unit: item,
        hints: [
            `<p><strong>Tänk baklänges!</strong> Vi vet slutet (${left} kvar) och vad som togs bort (${gave}). För att hitta början: <strong>${left} + ${gave}</strong>.</p>`,
            `<p>Svar: <strong>${left} + ${gave} = ${ans}</strong> ${item} från början!</p>`
        ]
    };
}

function genKlassresa() {
    const easy = state.difficulty === 'easy';
    const kids = easy ? wPick([20, 25, 30]) : wPick([18, 20, 22, 24, 26, 28]);
    const ticket = easy ? wPick([5, 10]) : wPick([35, 40, 45, 50, 55]);
    const bus = easy ? wPick([200, 300, 500]) : wPick([450, 520, 620, 750]);
    const ans = kids * ticket + bus;
    return {
        badge: '🚀 Flersteg • Klassresa',
        text: `En klass på ${kids} elever ska åka på utflykt. Biljetten kostar ${ticket} kr per elev och bussen kostar ${bus} kr totalt för alla. Vad kostar hela utflykten?`,
        ans, unit: 'kr',
        hints: [
            `<p><strong>Steg 1:</strong> Biljetterna: <strong>${kids} × ${ticket} kr = ${wFmt(kids * ticket)} kr</strong>.</p>`,
            `<p><strong>Steg 2:</strong> Lägg till bussen: <strong>${wFmt(kids * ticket)} + ${bus} = ${wFmt(ans)} kr</strong>!</p>`
        ]
    };
}

function genPasar() {
    const name = wName();
    const item = wPick([['kulor', 'påse', 'påsar'], ['äpplen', 'kasse', 'kassar'], ['kakor', 'burk', 'burkar'], ['pennor', 'ask', 'askar']]);
    const per = wPick([3, 4, 5, 6]);
    const n = wPick(state.difficulty === 'easy' ? [3, 4, 5] : [4, 5, 6, 7, 8]);
    const total = per * n;
    return {
        badge: '➗ Hur många påsar?',
        text: `${name} har ${total} ${item[0]} och lägger ${per} ${item[0]} i varje ${item[1]}. Hur många ${item[2]} blir det?`,
        ans: n, unit: item[2],
        hints: [
            `<p><strong>Steg 1:</strong> Tänk multiplikation baklänges: <strong>${per} × ? = ${total}</strong>.</p>`,
            `<p><strong>Steg 2:</strong> <strong>${divStackHTML(total, per)} = ${n}</strong> ${item[2]}!</p>`
        ]
    };
}

function genDelaLika() {
    const item = wPick(['godisar', 'kort', 'bollar', 'kakor']);
    const kids = wPick([3, 4, 5, 6]);
    const each = wPick([4, 5, 6, 7, 8, 9]);
    const total = kids * each;
    return {
        badge: '➗ Dela lika',
        text: `${total} ${item} ska delas lika mellan ${kids} barn. Hur många ${item} får varje barn?`,
        ans: each, unit: `${item} per barn`,
        hints: [
            `<p><strong>Steg 1:</strong> Fördela en i taget: ${divStackHTML(total, kids)} – hur många gånger rymms ${kids} i ${total}?</p>`,
            `<p><strong>Steg 2:</strong> <strong>${divStackHTML(total, kids)} = ${each}</strong> ${item} till varje barn!</p>`
        ]
    };
}

function genKartonger() {
    const name = wName();
    if (state.difficulty === 'easy') {
        const per = wPick([6, 10, 12]);
        const n = wPick([2, 3, 4]);
        const total = per * n;
        return {
            badge: '🥚 Äggkartonger',
            text: `${name} har ${total} ägg. Varje kartong rymmer ${per} ägg. Hur många kartonger fyller hen?`,
            ans: n, unit: 'kartonger',
            hints: [
                `<p><strong>Steg 1:</strong> Hur många gånger rymms ${per} i ${total}?</p>`,
                `<p><strong>Steg 2:</strong> <strong>${divStackHTML(total, per)} = ${n}</strong> kartonger!</p>`
            ]
        };
    }
    const per = wPick([6, 10, 12]);
    const full = wPick([3, 4, 5, 6]);
    const rest = wPick([1, 2, 3, 4, 5].filter(r => r < per));
    const total = full * per + rest;
    const need = full + 1;
    return {
        badge: '🚀 Flersteg • Räcker det?',
        text: `${name} har ${total} ägg. Äggkartongerna rymmer ${per} ägg styck. Hur många kartonger behövs för att alla äggen ska få plats?`,
        ans: need, unit: 'kartonger',
        hints: [
            `<p><strong>Steg 1:</strong> Fyllda kartonger: <strong>${divStackHTML(total, per)} = ${full}</strong> hela, men det blir <strong>${rest} ägg över</strong>!</p>`,
            `<p><strong>Steg 2:</strong> De ${rest} äggen behöver en egen kartong: <strong>${full} + 1 = ${need} kartonger</strong>!</p>`
        ]
    };
}

function genTalfoljdSpar() {
    const name = wName();
    const step = wPick([5, 10, 10, 20]);
    const start = wPick([5, 10, 15]);
    const week = wPick([5, 6, 7]);
    const ans = start + step * (week - 1);
    return {
        badge: '🔢 Mönster & Sparande',
        text: `${name} sparar ${start} kr vecka 1. Varje vecka ökar sparandet med ${step} kr – vecka 2: ${start + step} kr, vecka 3: ${start + 2 * step} kr. Hur mycket sparar hen vecka ${week}?`,
        ans, unit: 'kr',
        hints: [
            `<p><strong>Steg 1:</strong> Mönstret ökar med ${step} kr per vecka. Från vecka 1 till vecka ${week} är det ${week - 1} steg.</p>`,
            `<p><strong>Steg 2:</strong> <strong>${start} + ${week - 1} × ${step} = ${start} + ${step * (week - 1)} = ${ans} kr</strong>!</p>`
        ]
    };
}

function genTalfoljdKul() {
    const name = wName();
    if (state.difficulty === 'hard') {
        const day = wPick([6, 7]);
        const ans = Math.pow(2, day - 1);
        return {
            badge: '🚀 Mönster • Dubblering',
            text: `${name} lägger kulor i en burk: dag 1 läggs 1 kula, dag 2 dubbleras antalet (2), dag 3: 4, dag 4: 8. Antalet fördubblas varje dag. Hur många kulor finns det dag ${day}?`,
            ans, unit: 'kulor',
            hints: [
                `<p><strong>Steg 1:</strong> Varje dag dubbleras antalet: 1, 2, 4, 8, 16, 32, 64...</p>`,
                `<p><strong>Steg 2:</strong> Dag ${day} är det <strong>${ans} kulor</strong>!</p>`
            ]
        };
    }
    const start = wPick([3, 4, 5]);
    const step = wPick([2, 3, 4]);
    const day = wPick([5, 6, 7]);
    const ans = start + step * (day - 1);
    return {
        badge: '🔢 Mönster & Prickar',
        text: `${name} bygger prickfigurer: dag 1 används ${start} prickar, dag 2: ${start + step}, dag 3: ${start + 2 * step} – figuren växer med ${step} prickar varje dag. Hur många prickar behövs dag ${day}?`,
        ans, unit: 'prickar',
        hints: [
            `<p><strong>Steg 1:</strong> Figuren växer med ${step} prickar per dag. Dag ${day} är ${day - 1} steg efter dag 1.</p>`,
            `<p><strong>Steg 2:</strong> <strong>${start} + ${day - 1} × ${step} = ${ans} prickar</strong>!</p>`
        ]
    };
}

function genMedelWord() {
    const name = wName();
    const ctx = wPick([['sidor hon läste', 'sidor'], ['poäng i rundorna', 'poäng'], ['mål i matcherna', 'mål']]);
    if (state.difficulty === 'hard') {
        const m = wPick([10, 12, 15]);
        const n = 3;
        const nums = [m - wPick([2, 4]), m, m + wPick([2, 4])];
        const sum = nums.reduce((a, b) => a + b, 0);
        const target = (n + 1) * m;
        const ans = target - sum;
        return {
            badge: '🚀 Mål-medelvärde',
            text: `${name} har läst ${nums.join(', ')} ${ctx[1]} på tre dagar. Hur många ${ctx[1]} måste hen läsa dag 4 för att snittet ska bli exakt ${m} ${ctx[1]} per dag?`,
            ans, unit: ctx[1],
            hints: [
                `<p><strong>Steg 1:</strong> För att snittet på 4 dagar ska bli ${m} måste summan vara <strong>4 × ${m} = ${target}</strong> ${ctx[1]}.</p>`,
                `<p><strong>Steg 2:</strong> Hittills: <strong>${nums.join(' + ')} = ${sum}</strong>. Kvar att läsa: <strong>${target} − ${sum} = ${ans}</strong> ${ctx[1]}!</p>`
            ]
        };
    }
    const m = wPick([4, 5, 6, 7, 8, 10]);
    const n = wPick([3, 4]);
    let nums;
    for (let tries = 0; tries < 40; tries++) {
        nums = Array.from({ length: n - 1 }, () => wPick([m - 2, m - 1, m, m + 1, m + 2, m + 3].filter(x => x >= 1)));
        const last = m * n - nums.reduce((a, b) => a + b, 0);
        if (last >= 1 && last <= m * 2) { nums.push(last); break; }
        nums = null;
    }
    if (!nums) return genMedelWord();
    const sum = nums.reduce((a, b) => a + b, 0);
    return {
        badge: '📊 Medelvärde i praktiken',
        text: `${name} har fått ${nums.join(', ')} ${ctx[1]} under ${n} tillfällen. Vad är medelvärdet (genomsnittet)?`,
        ans: m, unit: ctx[1],
        hints: [
            `<p><strong>Steg 1:</strong> Lägg ihop alla: <strong>${nums.join(' + ')} = ${sum}</strong>.</p>`,
            `<p><strong>Steg 2:</strong> Dela på antalet: <strong>${divStackHTML(sum, n)} = ${wFmt(m)}</strong> ${ctx[1]} i snitt!</p>`
        ]
    };
}

function genAreaWord() {
    const name = wName();
    const thing = wPick(['blomlåda', 'matta', 'gräsmatta', 'lekrum']);
    const w = wPick(state.difficulty === 'easy' ? [3, 4, 5] : [4, 5, 6, 8]);
    const h = wPick(state.difficulty === 'easy' ? [2, 3, 4] : [3, 4, 5, 7]);
    return {
        badge: '📐 Area i verkligheten',
        text: `${wGen(name)} ${thing} är ${w} meter lång och ${h} meter bred. Hur stor är dess area i kvadratmeter (m²)?`,
        ans: w * h, unit: 'm²',
        hints: [
            `<p>Area = bas × höjd: <strong>${w} m × ${h} m = ${w * h} m²</strong>!</p>`,
            `<p>Tänk dig att rummet är fyllt med ${w * h} st rutor som är 1 m × 1 m stora.</p>`
        ]
    };
}

function genOmkretsWord() {
    const name = wName();
    const w = wPick([4, 5, 6, 8]);
    const h = wPick([3, 4, 5]);
    const missingSide = state.difficulty !== 'easy' && Math.random() < 0.5;
    if (missingSide) {
        const ans = w + 2 * h;
        return {
            badge: '🚀 Flersteg • Staket',
            text: `${wGen(name)} trädgård är ${w} m lång och ${h} m bred. Ena långsidan ligger mot huset, så där behövs inget staket. Hur många meter staket behövs till de andra tre sidorna?`,
            ans, unit: 'meter',
            hints: [
                `<p><strong>Steg 1:</strong> Hela omkretsen är <strong>2×${w} + 2×${h} = ${2 * (w + h)} m</strong>, men en långsida (${w} m) behöver inget staket.</p>`,
                `<p><strong>Steg 2:</strong> <strong>${2 * (w + h)} − ${w} = ${ans} m</strong> staket!</p>`
            ]
        };
    }
    const ans = 2 * (w + h);
    return {
        badge: '📐 Omkrets & Staket',
        text: `${name} ska sätta staket runt en ${w} m lång och ${h} m bred gräsplätt. Hur många meter staket behövs runt hela plätten?`,
        ans, unit: 'meter',
        hints: [
            `<p>Omkretsen är alla fyra sidorna tillsammans: <strong>${w} + ${h} + ${w} + ${h}</strong> eller <strong>2 × (${w} + ${h})</strong>.</p>`,
            `<p>Svar: <strong>${ans} meter</strong> staket!</p>`
        ]
    };
}


/* ---- Chans & kluringar: kombinatorik, sannolikhet, temperatur ---- */
function genKombinationer() {
    const name = wName();
    const d = state.difficulty;
    const na = d === 'easy' ? wPick([2, 3]) : wPick([2, 3, 4]);
    const nb = d === 'easy' ? wPick([2, 3]) : wPick([3, 4]);
    const useC = d !== 'easy' && Math.random() < 0.5;
    const nc = useC ? 2 : 0;
    const ans = na * nb * (nc || 1);
    const itemA = wPick([['tröjor', 'en tröja'], ['mackor', 'en macka']]);
    const itemB = itemA[0] === 'tröjor' ? ['par byxor', 'ett par byxor'] : ['drycker', 'en dryck'];
    const mulStr = nc ? `${na} × ${nb} × ${nc}` : `${na} × ${nb}`;
    return {
        badge: '🌳 Kombinatorik',
        text: `${name} ska välja ${itemA[1]} och ${itemB[1]}${nc ? ' och en efterrätt' : ''}. Det finns ${na} ${itemA[0]} och ${nb} ${itemB[0]}${nc ? ' och 2 efterrätter' : ''} att välja mellan. Hur många olika kombinationer kan ${name} sätta ihop?`,
        ans, unit: 'kombinationer',
        hints: [
            `<p>Varje val i första steget kan kombineras med <strong>alla</strong> valen i nästa steg. Kan du rita ett rutnät i rutpapperet?</p>`,
            `<p><strong>Multiplicera!</strong> ${mulStr} = <strong>${ans}</strong>. (Fällan är att addera – det räknar inte kombinationerna!)</p>`
        ]
    };
}

function genKo() {
    const n = state.difficulty === 'easy' ? 3 : wPick([3, 4]);
    let ans = 1;
    for (let i = n; i >= 1; i--) ans *= i;
    const mulStr = Array.from({ length: n }, (_, i) => n - i).join(' × ');
    return {
        badge: '👯 Kompiskö',
        text: `${n} kompisar ska ställa sig i kö till skolans bibiliotek. På hur många olika sätt kan de ordna sig i kön?`,
        ans, unit: 'sätt',
        hints: [
            `<p>Första platsen: <strong>${n}</strong> kompisar kan stå där. När den är tagen återstår <strong>${n - 1}</strong> för nästa plats …</p>`,
            `<p>Multiplicera: ${mulStr} = <strong>${ans}</strong> olika köer!</p>`
        ]
    };
}

function genForvantat() {
    const name = wName();
    const d = state.difficulty;
    // sannolikhet baklänges: "x/n är vinstkulor" eller förväntat antal sexor
    if (Math.random() < 0.5) {
        const perSix = d === 'easy' ? 6 : wPick([6, 12]);
        const mult = d === 'easy' ? wPick([10, 20]) : wPick([20, 25, 50]);
        const rolls = perSix * mult;
        return {
            badge: '🎲 Förväntat antal',
            text: `${name} kastar en vanlig tärning ${rolls} gånger. Ungefär hur många sexor kan hen vänta sig att få totalt?`,
            ans: mult * (perSix / 6), unit: 'sexor',
            hints: [
                `<p>Chansen för sexa är 1/6 – ungefär var sjätte kast blir en sexa i snitt.</p>`,
                `<p>Delat i grupper om 6 kast: <strong>${rolls} ÷ 6 = ${rolls / 6}</strong> grupper → ungefär <strong>${rolls / 6}</strong> sexor!</p>`
            ]
        };
    }
    const total = wPick([12, 20, 24]);
    const frac = wPick([[1, 4], [1, 3], [1, 2]]);
    const ans = total * frac[0] / frac[1];
    return {
        badge: '🎯 Sannolikhet baklänges',
        text: `I en lyckopåse finns det ${total} kulor. Sannolikheten att dra en vinstkula är ${frac[0]}/${frac[1]}. Hur många vinstkulor finns det i påsen?`,
        ans, unit: 'vinstkulor',
        hints: [
            `<p>${frac[0]}/${frac[1]} av kulorna är vinstkulor – samma räknesätt som "bråk av antal"!</p>`,
            `<p><strong>${total} ÷ ${frac[1]} = ${total / frac[1]}</strong>${frac[0] > 1 ? `, och × ${frac[0]} = <strong>${ans}</strong>` : ''} → <strong>${ans}</strong> vinstkulor!</p>`
        ]
    };
}

function genTemperatur() {
    const d = state.difficulty;
    const neg = d !== 'easy' && Math.random() < 0.55;
    const start = neg ? -wPick([2, 3, 4, 5, 8, 10]) : wPick([3, 5, 7, 8, 12]);
    const drop = Math.random() < 0.55;
    const change = d === 'easy' ? wPick([3, 4, 5, 6]) : wPick([4, 5, 7, 9, 11, 15]);
    const ans = drop ? start - change : start + change;
    const way = drop ? 'sjönk' : 'steg';
    return {
        badge: '🌡️ Temperaturkluring',
        text: `På morgonen visade termometern ${start} grader. Under dagen ${way} temperaturen ${change} grader. Vad visar termometern på eftermiddagen?`,
        ans, unit: 'grader',
        hints: [
            `<p>Tänk på tallinjen/termometern: börja på <strong>${start}</strong> och hoppa ${change} steg ${drop ? 'nedåt' : 'uppåt'}.</p>`,
            ans < 0 || start < 0 ? `<p>Passerar du noll? Hoppa först till 0, sedan resten. Svaret blir <strong>${ans}</strong> grader!</p>` : `<p>Svaret: ${start} ${drop ? '−' : '+'} ${change} = <strong>${ans}</strong> grader!</p>`
        ]
    };
}

const WORD_GENERATORS = {
    units: [genVolym, genLangd, genStracka, genTid, genJamfor],
    frac: [genBrakAv, genProcent],
    money: [genVaxel, genMissingStart, genKlassresa],
    div: [genPasar, genDelaLika, genKartonger],
    patterns: [genTalfoljdSpar, genTalfoljdKul, genMedelWord],
    geo: [genAreaWord, genOmkretsWord],
    prob: [genKombinationer, genKo, genForvantat, genTemperatur]
};

export function setWordCategory(cat) {
    playSound('click');
    state.wordCategory = cat;
    ['all', 'units', 'frac', 'money', 'div', 'patterns', 'geo'].forEach(c => {
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

    const cats = state.wordCategory === 'all'
        ? Object.keys(WORD_GENERATORS)
        : [state.wordCategory];
    const gens = cats.flatMap(c => WORD_GENERATORS[c]);
    const item = gens[randInt(0, gens.length - 1)]();
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

// "Visa mig": metod för textuppgift – läs, hitta talen, räkna i steg.
export function buildWordDemoSteps() {
    const story = (inner) => `<div class="max-w-md mx-auto bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-left text-base sm:text-lg text-slate-800 my-2">${inner}</div>`;
    const num = (t, i) => `<span class="bg-yellow-200 border border-yellow-400 rounded-lg px-1.5 font-extrabold" ${i !== undefined ? `data-wnum="${i}"` : ''}>${t}</span>`;
    return { steps: [
        { text: `<p>Textuppgifter gömmer en räkneuppgift i en <strong>berättelse</strong>. Läs hela först – vad handlar den om?</p>`,
          html: story(`Sara köper 3 paket bullar för 20 kr styck. Hon betalar med en 100-lapp. Hur mycket får hon tillbaka?`) },
        { text: `<p><strong>Steg 1:</strong> Markera <strong>talen</strong> och <strong>frågan</strong> – vad ska vi räkna ut?</p>`,
          html: story(`Sara köper ${num('3')} paket bullar för ${num('20 kr')} styck. Hon betalar med en ${num('100')}-lapp. Hur mycket får hon <strong>tillbaka</strong>?`) },
        { text: `<p><strong>Steg 2:</strong> Lyft ut <strong>talen ur texten</strong> och räkna i <strong>två steg</strong>: kostnaden först (3 × 20 = <strong>60 kr</strong>), sen växeln (100 − 60 = <strong>40 kr</strong>)!</p>`,
          html: story(`Sara köper ${num('3', 0)} paket bullar för ${num('20', 1)} kr styck. Hon betalar med en ${num('100', 2)}-lapp. Hur mycket får hon <strong>tillbaka</strong>?`) +
              `<div class="flex flex-wrap items-center justify-center gap-2 font-display font-bold text-xl text-slate-800 my-3">
                  <span class="conn-slot" data-wslot="0"></span> × <span class="conn-slot" data-wslot="1"></span> = 60 kr
                  <span class="text-amber-500 mx-1">➔</span>
                  <span class="conn-slot" data-wslot="2"></span> − 60 = <strong>40 kr</strong>
              </div>`,
          anim: { fly: [
              { text: '3', from: '[data-wnum="0"]', to: '[data-wslot="0"]', cls: 'fly-num', hideTarget: false, delay: 600 },
              { text: '20', from: '[data-wnum="1"]', to: '[data-wslot="1"]', cls: 'fly-num', hideTarget: false, delay: 1400 },
              { text: '100', from: '[data-wnum="2"]', to: '[data-wslot="2"]', cls: 'fly-num', hideTarget: false, delay: 2200 },
          ] } },
        { text: `<p>Svara på <strong>det som frågas</strong>! Svaret är 40 kr – inte 60 kr (det var bara mellansteget). Skriv alltid svaret med <strong>enheten</strong>: "kr".</p>`,
          warn: true,
          html: story(`✅ <strong>40 kr</strong> &nbsp;&nbsp; ❌ 60 kr &nbsp;&nbsp; ❌ "40" (utan kr)`) },
        { text: `<p><strong>Din tur!</strong> Mia har <strong>4 påsar</strong> med <strong>6 kulor</strong> i varje. Hur många kulor har hon?</p>`,
          guess: { options: [
              { label: '10 kulor', ok: false },
              { label: '24 kulor', ok: true },
              { label: '20 kulor', ok: false },
          ] },
          doneText: `4 × 6 = <strong>24 kulor</strong>! 🎉` },
    ] };
}
