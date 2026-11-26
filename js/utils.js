// js/utils.js — autogenererad av split.py från original.html

/* =============================================================
   2. HJÄLPFUNKTIONER & STEGVISA VISUELLA LEDTRÅDAR
============================================================== */
export function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function formatNumSv(num) {
    const clean = Math.round(num * 1000) / 1000;
    return String(clean).replace('.', ',');
}

export function formatFractionHTML(num, den) {
    return `<span class="stacked-frac"><span class="stacked-frac-num">${num}</span><span class="stacked-frac-den">${den}</span></span>`;
}

export function formatMixedHTML(whole, num, den) {
    return `<span class="stacked-mixed"><span class="stacked-mixed-whole">${whole}</span>${formatFractionHTML(num, den)}</span>`;
}

// Varje siffra färgas efter sin platsvärde (ental/tiotal/hundratal/tusental).
export function formatPlaceValueHTML(n) {
    const s = String(n);
    return s.split('').map((d, i) => {
        const place = Math.pow(10, s.length - 1 - i);
        return `<span class="pv-num pv-${place}">${d}</span>`;
    }).join('');
}

// Spårar senast klickade svarsknapp så showFeedback kan markera den.
let lastOptionBtn = null;
if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        lastOptionBtn = (btn && btn.closest('[id$="-options"]')) ? btn : null;
    }, true);
    // Felmarkering i svarsrutor (cell-wrong/cell-right) suddas när eleven skriver om.
    document.addEventListener('input', (e) => {
        if (e.target.id && e.target.id.startsWith('algo-ans-'))
            e.target.classList.remove('cell-wrong', 'cell-right');
    });
}

export function showFeedback(elId, isSuccess, htmlMsg) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.classList.remove('hidden');
    el.className = 'mt-5 p-3.5 rounded-2xl font-extrabold text-sm sm:text-base max-w-xl mx-auto border-2 ' +
        (isSuccess
            ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
            : 'bg-rose-50 border-rose-300 text-rose-950');
    el.innerHTML = htmlMsg;
    styleNumbersIn(el);
    // Feedbacken hamnar ofta under den synliga ytan i lägen med höga
    // visualer – scrolla mjukt fram den. scroll-margin-bottom gör att
    // även "Nästa fråga"-knappen (som visas direkt efter) hinner med.
    // block:'nearest' = ingen scroll alls om den redan syns helt.
    el.style.scrollMarginBottom = '130px';
    requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    const card = document.getElementById(`view-${elId.replace(/-feedback$/, '')}`)?.querySelector('.rounded-3xl');
    if (card) {
        const cls = isSuccess ? 'card-correct' : 'card-wrong';
        card.classList.remove('card-correct', 'card-wrong', 'card-in');
        void card.offsetWidth;
        card.classList.add(cls);
        card.addEventListener('animationend', () => card.classList.remove(cls), { once: true });
    }
    if (lastOptionBtn && document.contains(lastOptionBtn)) {
        const cls = isSuccess ? 'opt-correct' : 'opt-wrong';
        lastOptionBtn.classList.remove('opt-correct', 'opt-wrong');
        void lastOptionBtn.offsetWidth;
        lastOptionBtn.classList.add(cls);
    }
    lastOptionBtn = null;
}

// Slår in lösa siffror i en "piller"-span så talen sticker ut visuellt.
export function styleNumbersIn(el) {
    if (!el) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => /\d/.test(n.nodeValue) &&
            !(n.parentElement && n.parentElement.closest('sup, sub, .qnum, .stacked-frac, .stacked-mixed, .pv-num'))
            ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
        const frag = document.createDocumentFragment();
        n.nodeValue.split(/(\d+(?:[.,]\d+)?)/g).forEach(part => {
            if (/^\d/.test(part)) {
                const s = document.createElement('span');
                s.className = 'qnum';
                s.textContent = part;
                frag.appendChild(s);
            } else if (part) {
                frag.appendChild(document.createTextNode(part));
            }
        });
        n.parentNode.replaceChild(frag, n);
    });
}
