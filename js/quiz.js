// js/quiz.js — "Testa mig"-läge: 10 blandade frågor från alla moduler + resultatskärm.
// Räkna rätt-svar genom att hålla koll på när modulernas "Nästa"-knapp dyker upp
// och om ett fel-feedback (rosa) visades före den – ingen modulkod ändras.
import { state, playSound } from './core.js';
import { setClockSubMode } from './modules/clock.js';
import { shuffleArray } from './utils.js';

const QUIZ_VIEWS = ['addsub', 'mult', 'div', 'conn', 'seq', 'frac', 'algo', 'combo', 'clock', 'scale', 'length', 'word', 'geo', 'volweight', 'decimal', 'shop', 'chart', 'avg'];
const QUIZ_TOTAL = 10;

let quiz = null; // { order, index, results, wrongThisQ, observer, prevClockSubMode, advancing }

const rawNavigateTo = window.navigateTo;

// Om eleven navigerar bort manuellt (t.ex. tillbakapilen) avslutas quizet snyggt.
window.navigateTo = function (view) {
    if (quiz && view !== quiz.order[quiz.index]) exitQuiz(false);
    return rawNavigateTo(view);
};

function startQuiz() {
    if (quiz) return;
    playSound('click');
    quiz = {
        order: shuffleArray([...QUIZ_VIEWS]).slice(0, QUIZ_TOTAL),
        index: 0,
        results: [],
        wrongThisQ: false,
        advancing: false,
        prevClockSubMode: state.clockSubMode
    };
    state.levelStepKey = '';
    // Övningsklockan har inget fråga–svar-flöde, så quizet använder alltid frågelägena.
    if (state.clockSubMode === 'sandbox') setClockSubMode('mix');

    if (!document.getElementById('quiz-banner')) {
        const b = document.createElement('div');
        b.id = 'quiz-banner';
        b.className = 'fixed top-24 sm:top-20 left-1/2 -translate-x-1/2 z-40 bg-amber-300 border-3 border-amber-500 rounded-2xl shadow-lg px-4 py-2 flex items-center gap-3 font-extrabold text-amber-950 text-sm whitespace-nowrap';
        b.innerHTML = `<span id="quiz-banner-text"></span>
            <button onclick="exitQuiz(true)" class="btn-3d bg-white/80 hover:bg-white text-amber-900 px-2.5 py-1 rounded-xl text-xs font-extrabold">Avsluta</button>`;
        document.body.appendChild(b);
    }

    quiz.observer = new MutationObserver((mutations) => {
        if (!quiz || quiz.advancing) return;
        const mod = quiz.order[quiz.index];
        for (const m of mutations) {
            if (m.type !== 'attributes' || m.attributeName !== 'class') continue;
            const el = m.target;
            if (!(el instanceof HTMLElement)) continue;
            if (el.id === `${mod}-feedback` && !el.classList.contains('hidden') && el.className.includes('bg-rose-50')) {
                quiz.wrongThisQ = true;
            }
            if (el.id === `${mod}-next-wrap` && !el.classList.contains('hidden')) {
                onQuestionSolved();
                return;
            }
        }
    });
    quiz.observer.observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });

    nextQuizQuestion();
}

function nextQuizQuestion() {
    quiz.wrongThisQ = false;
    updateQuizBanner();
    rawNavigateTo(quiz.order[quiz.index]);
}

function onQuestionSolved() {
    if (quiz.advancing) return;
    quiz.advancing = true;
    quiz.results.push({ mod: quiz.order[quiz.index], firstTry: !quiz.wrongThisQ });
    updateQuizBanner();
    setTimeout(() => {
        if (!quiz) return;
        quiz.index += 1;
        quiz.advancing = false;
        if (quiz.index >= quiz.order.length) {
            showQuizEnd();
        } else {
            nextQuizQuestion();
        }
    }, 1600);
}

function updateQuizBanner() {
    const t = document.getElementById('quiz-banner-text');
    if (t && quiz) {
        const done = Math.min(quiz.results.length, quiz.order.length);
        t.textContent = `🎯 Fråga ${Math.min(quiz.index + 1, quiz.order.length)} av ${quiz.order.length} • Lösta: ${done}`;
    }
}

function showQuizEnd() {
    const firstTries = quiz.results.filter(r => r.firstTry).length;
    const total = quiz.results.length;
    const praise = firstTries === total ? '🏆 Perfekt – allt rätt på första försöket!'
        : firstTries >= total * 0.7 ? '🌟 Starkt jobbat!'
        : '💪 Bra kämpat – fortsätt öva!';
    const ov = document.createElement('div');
    ov.id = 'quiz-end-overlay';
    ov.className = 'fixed inset-0 z-[95] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs';
    ov.innerHTML = `
        <div class="bg-white rounded-3xl border-4 border-amber-400 shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center">
            <div class="text-5xl mb-1">🎯</div>
            <h2 class="font-display font-bold text-2xl text-slate-900">Quiz klart!</h2>
            <p class="font-bold text-slate-700 mt-2">Du löste <strong>${total} av ${total}</strong> frågor – varav <strong>${firstTries}</strong> rätt på första försöket.</p>
            <p class="font-display font-bold text-lg text-amber-600 mt-2">${praise}</p>
            <div class="flex gap-2.5 mt-5">
                <button onclick="restartQuiz()" class="btn-3d flex-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-display font-bold px-4 py-3 rounded-2xl">Kör igen</button>
                <button onclick="exitQuiz(true)" class="btn-3d flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-display font-bold px-4 py-3 rounded-2xl">Avsluta</button>
            </div>
        </div>`;
    document.body.appendChild(ov);
    playSound('correct');
}

function exitQuiz(navToHome) {
    if (!quiz) return;
    const q = quiz;
    quiz = null;
    if (q.observer) q.observer.disconnect();
    document.getElementById('quiz-banner')?.remove();
    document.getElementById('quiz-end-overlay')?.remove();
    if (q.prevClockSubMode === 'sandbox') setClockSubMode('sandbox');
    playSound('click');
    if (navToHome) rawNavigateTo('home');
}

function restartQuiz() {
    const q = quiz;
    quiz = null;
    if (q && q.observer) q.observer.disconnect();
    document.getElementById('quiz-end-overlay')?.remove();
    startQuiz();
}

Object.assign(window, { startQuiz, exitQuiz, restartQuiz });
