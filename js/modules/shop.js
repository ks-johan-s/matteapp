// js/modules/shop.js — autogenererad av split.py från original.html
import { addReward, playSound, resetStreak, state } from '../core.js';
import { setHintSteps } from '../hints.js';
import { randInt, showFeedback } from '../utils.js';
import { buildNumberLineJumpSVG } from '../visuals.js';

/* =============================================================
   14. MODUL 11: MATTEKIOSKEN (PENGAR & VÄXEL)
============================================================== */
export const SHOP_CATALOG = [
    { name: 'Äpple', icon: '🍎', price: 7 },
    { name: 'Kanelbulle', icon: '🥐', price: 16 },
    { name: 'Juicepaket', icon: '🧃', price: 12 },
    { name: 'Glass', icon: '🍦', price: 18 },
    { name: 'Smörgås', icon: '🥪', price: 24 },
    { name: 'Serietidning', icon: '📚', price: 35 },
    { name: 'Fotboll', icon: '⚽', price: 65 },
    { name: 'Biobiljett', icon: '🎟️', price: 115 },
    { name: 'Brädspel', icon: '🎲', price: 128 },
    { name: 'Ryggsäck', icon: '🎒', price: 147 },
    { name: 'Hörlurar', icon: '🎧', price: 184 }
];

export function setShopSubMode(mode) {
    playSound('click');
    state.shopSubMode = mode;
    ['mix', 'pay', 'change'].forEach(m => {
        const btn = document.getElementById(`shop-sub-${m}`);
        if (!btn) return;
        btn.className = 'px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold ' +
            (m === mode ? 'bg-amber-500 text-white' : 'bg-white border border-amber-300 text-slate-700');
    });
    generateShopQuestion();
}

export function renderMoneyBadgeHTML(val, index = -1) {
    const isBill = val >= 20;
    const bgCls = val === 500 ? 'bg-rose-600 border-rose-800 text-white'
        : (val === 200 ? 'bg-emerald-600 border-emerald-800 text-white'
        : (val === 100 ? 'bg-sky-500 border-sky-700 text-white'
        : (val === 50 ? 'bg-orange-400 border-orange-600 text-white'
        : (val === 20 ? 'bg-purple-500 border-purple-700 text-white'
        : (val === 10 ? 'bg-yellow-300 border-amber-500 text-amber-950'
        : (val === 5 ? 'bg-yellow-400 border-yellow-600 text-yellow-950'
        : 'bg-amber-600 border-amber-800 text-white'))))));
    const shapeCls = isBill ? 'px-3.5 py-2 rounded-xl' : 'w-11 h-11 rounded-full flex items-center justify-center';
    const clickAttr = index >= 0 ? `onclick="removeMoneyFromTray(${index})" title="Klicka för att ta bort"` : '';
    return `<button ${clickAttr} class="btn-3d ${shapeCls} ${bgCls} border-2 font-display font-bold text-xs sm:text-sm">${val} kr</button>`;
}

export function updateShopTrayUI() {
    const total = state.shopTray.reduce((acc, v) => acc + v, 0);
    document.getElementById('shop-tray-total').textContent = total;
    const visualEl = document.getElementById('shop-tray-visual');
    if (state.shopTray.length === 0) {
        visualEl.innerHTML = `<span class="text-xs font-bold text-slate-400">Klicka på sedlar eller mynt nedan för att lägga dem här!</span>`;
    } else {
        visualEl.innerHTML = state.shopTray.map((v, idx) => renderMoneyBadgeHTML(v, idx)).join('');
    }
}

function flyMoneyToTray(val, fromEl) {
    const tray = document.getElementById('shop-tray-visual');
    if (!tray || !fromEl) return;
    const tRect = tray.getBoundingClientRect();
    const fRect = fromEl.getBoundingClientRect();
    const coin = document.createElement('div');
    coin.textContent = `${val} kr`;
    coin.className = 'fixed z-[999] px-2.5 py-1.5 rounded-xl border-2 border-amber-700 bg-amber-500 text-white font-display font-bold text-xs shadow-lg pointer-events-none';
    coin.style.left = `${fRect.left + fRect.width / 2 - 18}px`;
    coin.style.top = `${fRect.top + fRect.height / 2 - 12}px`;
    document.body.appendChild(coin);
    const dx = tRect.left + tRect.width / 2 - (fRect.left + fRect.width / 2);
    const dy = tRect.top + tRect.height / 2 - (fRect.top + fRect.height / 2);
    coin.animate([
        { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 70}px) scale(1.15) rotate(10deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.35) rotate(-8deg)`, opacity: 0.85 }
    ], { duration: 520, easing: 'cubic-bezier(.3,.7,.4,1)' }).onfinish = () => coin.remove();
}

export function addMoneyToTray(val) {
    if (!document.getElementById('shop-next-wrap').classList.contains('hidden')) return;
    playSound('click');
    state.shopTray.push(val);
    updateShopTrayUI();
    flyMoneyToTray(val, window.event && window.event.target);
}

export function removeMoneyFromTray(idx) {
    if (!document.getElementById('shop-next-wrap').classList.contains('hidden')) return;
    playSound('click');
    state.shopTray.splice(idx, 1);
    updateShopTrayUI();
}

export function clearShopTray() {
    playSound('click');
    state.shopTray = [];
    updateShopTrayUI();
}

export function generateShopQuestion() {
    document.getElementById('shop-feedback').classList.add('hidden');
    document.getElementById('shop-next-wrap').classList.add('hidden');
    state.shopTray = [];
    updateShopTrayUI();

    let mode = state.shopSubMode;
    if (mode === 'mix') mode = Math.random() < 0.5 ? 'pay' : 'change';

    const isHard = state.difficulty === 'hard';
    const itemCount = state.difficulty === 'easy' ? 1 : (isHard ? 3 : 2);
    const picked = [];
    const pool = state.difficulty === 'easy'
        ? SHOP_CATALOG.slice(0, 5)
        : (isHard ? SHOP_CATALOG.slice(1) : SHOP_CATALOG.slice(0, 7));
    while (picked.length < itemCount) {
        const it = pool[randInt(0, pool.length - 1)];
        picked.push(it);
    }
    const totalCost = picked.reduce((s, it) => s + it.price, 0);

    const itemsHtml = picked.map(it => `
        <div class="bg-amber-50 border-2 border-amber-300 rounded-2xl px-4 py-3 flex flex-col items-center shadow-2xs">
            <span class="text-3xl mb-1">${it.icon}</span>
            <span class="font-display font-bold text-sm text-slate-900">${it.name}</span>
            <span class="mt-1 px-2.5 py-0.5 rounded-full bg-white border border-amber-300 font-display font-bold text-sm text-amber-900">${it.price} kr</span>
        </div>
    `).join('<span class="font-display font-bold text-2xl text-slate-400">+</span>');

    if (mode === 'pay') {
        state.currentShop = { mode: 'pay', targetAmount: totalCost, totalCost };
        document.getElementById('shop-mode-badge').textContent = '🛒 Betala varorna';
        document.getElementById('shop-question-text').textContent = 'Hur mycket kostar varorna tillsammans? Lägg rätt summa på disken!';
        document.getElementById('shop-items-container').innerHTML = itemsHtml;

        const sumDesc = picked.length === 1
            ? `Varan kostar <strong>${totalCost} kr</strong>.`
            : `Lägg ihop priserna: <strong>${picked.map(i => i.price).join(' + ')} = ${totalCost} kr</strong>.`;
        setHintSteps('shop', [
            `<p>${sumDesc}</p>`,
            `<p>Bygg ihop <strong>${totalCost} kr</strong> på kassadisken med sedlar och mynt nedan!</p>`
        ]);
    } else {
        const paidBill = totalCost <= 20 ? 20 : (totalCost <= 50 ? 50 : (totalCost <= 100 ? 100 : (totalCost <= 200 ? 200 : 500)));
        const change = paidBill - totalCost;
        state.currentShop = { mode: 'change', targetAmount: change, totalCost, paidBill };

        document.getElementById('shop-mode-badge').textContent = '💵 Ge tillbaka växel';
        document.getElementById('shop-question-text').textContent = `Kunden betalar med en ${paidBill}-lapp. Lägg rätt växel på disken!`;
        document.getElementById('shop-items-container').innerHTML = `
            <div class="flex flex-wrap items-center justify-center gap-3">
                ${itemsHtml}
                <div class="ml-2 px-4 py-3 rounded-2xl bg-sky-50 border-2 border-sky-300 text-left">
                    <div class="text-[11px] font-extrabold text-sky-800 uppercase">Kunden betalar med:</div>
                    <div class="font-display font-bold text-xl text-sky-950">${paidBill} kr</div>
                </div>
            </div>
        `;

        const nextTen = Math.ceil(totalCost / 10) * 10;
        const jump1 = nextTen - totalCost;
        const jump2 = paidBill - nextTen;

        setHintSteps('shop', [
            `<p><strong>Steg 1:</strong> Varorna kostar tillsammans <strong>${totalCost} kr</strong>.</p>`,
            jump1 > 0 && jump2 > 0
                ? `<p><strong>Steg 2:</strong> Räkna uppåt från <strong>${totalCost} kr</strong> till <strong>${paidBill} kr</strong> på tallinjen:</p>
                   ${buildNumberLineJumpSVG(totalCost, nextTen, paidBill, `+${jump1} kr`, `+${jump2} kr`, false)}
                   <p class="text-center font-display font-bold text-emerald-800">Växel = ${jump1} + ${jump2} = ${change} kr!</p>`
                : `<p><strong>Steg 2:</strong> Räkna ut skillnaden: <strong>${paidBill} kr − ${totalCost} kr = ${change} kr</strong> i växel!</p>`
        ]);
    }
}

export function checkShopAnswer() {
    if (!document.getElementById('shop-next-wrap').classList.contains('hidden')) return;
    const userSum = state.shopTray.reduce((acc, v) => acc + v, 0);
    const { mode, targetAmount } = state.currentShop;
    if (userSum === 0) {
        showFeedback('shop-feedback', false, '👛 Klicka på sedlarna och mynten för att lägga pengar på kassadisken först!');
        return;
    }
    if (userSum === targetAmount) {
        addReward(2);
        const msg = mode === 'pay'
            ? `🎉 Tack för köpet! ${targetAmount} kr stämmer på kronan!`
            : `🎉 Perfekt växel! ${targetAmount} kr tillbaka till kunden!`;
        showFeedback('shop-feedback', true, msg);
        document.getElementById('shop-next-wrap').classList.remove('hidden');
    } else {
        resetStreak();
        const diffMsg = userSum < targetAmount ? 'Det saknas lite pengar på disken.' : 'Det ligger lite för mycket pengar på disken.';
        showFeedback('shop-feedback', false, `🤔 Du har lagt ${userSum} kr på disken. ${diffMsg} Prova igen!`);
    }
}
