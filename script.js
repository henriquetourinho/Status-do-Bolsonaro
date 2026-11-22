// ============================================================
// STATUS DOS BOLSONAROS — MOTOR INTERATIVO JAVASCRIPT
// ============================================================

// Elementos do Áudio e Interface
const backgroundAudio = document.getElementById('background-audio');
const audioControlButton = document.getElementById('audio-control-button');
const audioIcon = document.getElementById('audio-icon');
const accessCounter = document.getElementById('access-counter');
const recentJoins = document.getElementById('recent-joins');
const recentCount = document.getElementById('recent-count');
const profileText = document.getElementById('profile-text');
const destStatusBanner = document.getElementById('dest-status-banner');

// ============================================================
// SÍNTESE DE EFEITOS SONOROS COM WEB AUDIO API
// (Sirene de camburão, martelo de juiz, aviso de aeroporto)
// ============================================================
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// Efeito Sonoro: Sirene da Polícia Federal
function playSirenSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';

        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.linearRampToValueAtTime(950, now + 0.25);
        osc.frequency.linearRampToValueAtTime(650, now + 0.5);
        osc.frequency.linearRampToValueAtTime(950, now + 0.75);
        osc.frequency.linearRampToValueAtTime(650, now + 1.0);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.85);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.05);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.1);
    } catch (e) {
        // Silencioso se bloqueado pelo navegador
    }
}

// Efeito Sonoro: Batida de Martelo do Julgamento
function playGavelSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';

        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
    } catch (e) {}
}

// Efeito Sonoro: Chime de Embarque / Aeroporto
function playAirportSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const notes = [587.33, 880]; // D5, A5

        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + (idx * 0.22));

            gain.gain.setValueAtTime(0.2, now + (idx * 0.22));
            gain.gain.exponentialRampToValueAtTime(0.001, now + (idx * 0.22) + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + (idx * 0.22));
            osc.stop(now + (idx * 0.22) + 0.52);
        });
    } catch (e) {}
}

// ============================================================
// STORY OVERLAY — ESTILO TIKTOK / INSTAGRAM (5 SLIDES DO CLÃ)
// ============================================================
function setupStory() {
    const overlay = document.getElementById('story-overlay');
    if (!overlay) return;

    const TOTAL = 5;
    const DURATION = 3200; // ms por slide
    let current = 0;
    let timer = null;
    let startY = null;
    let audioStarted = false;

    const slides = overlay.querySelectorAll('.story-slide');
    const bars = overlay.querySelectorAll('.sp-bar');
    const fills = overlay.querySelectorAll('.sp-fill');
    const tapLeft = document.getElementById('tap-left');
    const tapRight = document.getElementById('tap-right');

    function startAudio() {
        if (audioStarted || !backgroundAudio) return;
        audioStarted = true;
        backgroundAudio.volume = 0.35;
        backgroundAudio.play()
            .then(() => { if (audioIcon) audioIcon.textContent = '🔊'; })
            .catch(() => { if (audioIcon) audioIcon.textContent = '🔇'; });
    }

    function showSlide(idx) {
        slides.forEach((s, i) => s.classList.toggle('active', i === idx));

        bars.forEach((b, i) => {
            b.classList.remove('done', 'active');
            fills[i].style.transition = 'none';
            fills[i].style.width = i < idx ? '100%' : '0%';
        });

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                fills[idx].style.transition = `width ${DURATION}ms linear`;
                fills[idx].style.width = '100%';
            });
        });

        clearTimeout(timer);
        timer = setTimeout(() => goTo(idx + 1), DURATION);
    }

    function goTo(idx) {
        if (idx >= TOTAL) {
            dismiss();
            return;
        }
        current = Math.max(0, Math.min(TOTAL - 1, idx));
        showSlide(current);
    }

    function dismiss() {
        clearTimeout(timer);
        startAudio();
        overlay.classList.add('dismissed');
        overlay.addEventListener('animationend', () => {
            overlay.style.display = 'none';
        }, { once: true });
    }

    if (tapLeft) tapLeft.addEventListener('click', () => goTo(current - 1));
    if (tapRight) tapRight.addEventListener('click', () => goTo(current + 1));

    overlay.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    overlay.addEventListener('touchend', e => {
        if (startY === null) return;
        const dy = startY - e.changedTouches[0].clientY;
        if (dy > 60) dismiss();
        startY = null;
    }, { passive: true });

    slides[TOTAL - 1].addEventListener('click', dismiss);
    showSlide(0);
}

// ============================================================
// CONTROLE DE ÁUDIO DE FUNDO
// ============================================================
function setupAudioButton() {
    if (!audioControlButton || !backgroundAudio) return;

    audioControlButton.addEventListener('click', () => {
        getAudioContext();
        if (backgroundAudio.paused) {
            backgroundAudio.play().catch(() => {});
            if (audioIcon) audioIcon.textContent = '🔊';
        } else {
            backgroundAudio.pause();
            if (audioIcon) audioIcon.textContent = '🔇';
        }
    });
}

// ============================================================
// DESTINÔMETRO — COCKPIT INTERATIVO DE SENTENÇAS
// ============================================================
function setupDestinometro() {
    const btnArrestAll = document.getElementById('btn-arrest-all');
    const btnEscapeAll = document.getElementById('btn-escape-all');
    const btnRandomDest = document.getElementById('btn-random-dest');
    const btnResetRadar = document.getElementById('btn-reset-radar');
    const cards = document.querySelectorAll('.member-card');

    if (!cards.length) return;

    // Mandar todos pra Papuda
    if (btnArrestAll) {
        btnArrestAll.addEventListener('click', () => {
            getAudioContext();
            playSirenSound();
            setTimeout(playGavelSound, 400);

            cards.forEach(card => {
                card.classList.remove('state-fugitive');
                card.classList.add('state-arrested');
                const statusPill = card.querySelector('.live-status-pill');
                if (statusPill) {
                    statusPill.innerHTML = '<span class="pulse-dot"></span> PRESO NA PAPUDA · ALA B';
                    statusPill.style.background = '#ff1744';
                    statusPill.style.color = '#fff';
                }
            });

            if (destStatusBanner) {
                destStatusBanner.innerHTML = '🚨 MANDADO COLETIVO CUMPRIDO: TODOS OS 4 ENCAMINHADOS À PAPUDA COM UNIFORME LARANJA E CARDÁPIO DO DIA.';
                destStatusBanner.style.borderLeftColor = 'var(--red)';
                destStatusBanner.style.color = 'var(--red)';
            }
        });
    }

    // Fuga Internacional do Clã
    if (btnEscapeAll) {
        btnEscapeAll.addEventListener('click', () => {
            getAudioContext();
            playAirportSound();

            cards.forEach(card => {
                card.classList.remove('state-arrested');
                card.classList.add('state-fugitive');
                const statusPill = card.querySelector('.live-status-pill');
                if (statusPill) {
                    statusPill.innerHTML = '✈️ FORAGIDO EM ORLANDO / HUNGRIA';
                    statusPill.style.background = '#0066cc';
                    statusPill.style.color = '#fff';
                }
            });

            if (destStatusBanner) {
                destStatusBanner.innerHTML = '✈️ ALERTA VERMELHO DA INTERPOL: O CLÃ EMBARCOU COM PASSAPORTE FALSO E FOI VISTO NA DISNEY E EM BUDAPESTE!';
                destStatusBanner.style.borderLeftColor = 'var(--cyan)';
                destStatusBanner.style.color = 'var(--cyan)';
            }
        });
    }

    // Sorteio Aleatório / Roleta do STF
    if (btnRandomDest) {
        btnRandomDest.addEventListener('click', () => {
            getAudioContext();
            playGavelSound();

            cards.forEach(card => {
                const isArrested = Math.random() > 0.45;
                card.classList.remove('state-arrested', 'state-fugitive');
                const statusPill = card.querySelector('.live-status-pill');

                if (isArrested) {
                    card.classList.add('state-arrested');
                    if (statusPill) {
                        statusPill.innerHTML = '<span class="pulse-dot"></span> PRESO NA PAPUDA · CELA COMUM';
                        statusPill.style.background = '#ff1744';
                        statusPill.style.color = '#fff';
                    }
                } else {
                    card.classList.add('state-fugitive');
                    if (statusPill) {
                        statusPill.innerHTML = '✈️ FORAGIDO NO EXTERIOR';
                        statusPill.style.background = '#0066cc';
                        statusPill.style.color = '#fff';
                    }
                }
            });

            if (destStatusBanner) {
                destStatusBanner.innerHTML = '⚖️ ROLETA DA JUSTIÇA: ALGUNS FORAM PRA PAPUDA, OUTROS FUGIRAM DE JET SKI PARA MIAMI!';
                destStatusBanner.style.borderLeftColor = 'var(--yellow)';
                destStatusBanner.style.color = 'var(--yellow)';
            }
        });
    }

    // Resetar Radar
    if (btnResetRadar) {
        btnResetRadar.addEventListener('click', () => {
            cards.forEach(card => {
                card.classList.remove('state-arrested', 'state-fugitive');
                const statusPill = card.querySelector('.live-status-pill');
                const originalText = card.getAttribute('data-original-status') || 'INVESTIGADO NO STF';
                if (statusPill) {
                    statusPill.innerHTML = `<span class="pulse-dot"></span> ${originalText}`;
                    statusPill.style.background = '#000';
                    statusPill.style.color = 'var(--yellow)';
                }
            });

            if (destStatusBanner) {
                destStatusBanner.innerHTML = '📡 RADAR RESTAURADO: MONITORANDO INQUÉRITOS, PASSAPORTES E TORNOZELEIRAS EM BRASÍLIA.';
                destStatusBanner.style.borderLeftColor = 'var(--green)';
                destStatusBanner.style.color = 'var(--green)';
            }
        });
    }

    // Botões Individuais em cada Card
    document.querySelectorAll('.btn-card-arrest').forEach(btn => {
        btn.addEventListener('click', (e) => {
            getAudioContext();
            playSirenSound();
            const card = e.target.closest('.member-card');
            if (card) {
                card.classList.remove('state-fugitive');
                card.classList.add('state-arrested');
                const pill = card.querySelector('.live-status-pill');
                if (pill) {
                    pill.innerHTML = '<span class="pulse-dot"></span> PRESO NA PAPUDA';
                    pill.style.background = '#ff1744';
                    pill.style.color = '#fff';
                }
            }
        });
    });

    document.querySelectorAll('.btn-card-fugitive').forEach(btn => {
        btn.addEventListener('click', (e) => {
            getAudioContext();
            playAirportSound();
            const card = e.target.closest('.member-card');
            if (card) {
                card.classList.remove('state-arrested');
                card.classList.add('state-fugitive');
                const pill = card.querySelector('.live-status-pill');
                if (pill) {
                    pill.innerHTML = '✈️ FORAGIDO NA FLÓRIDA';
                    pill.style.background = '#0066cc';
                    pill.style.color = '#fff';
                }
            }
        });
    });
}

// ============================================================
// FILTRO DE MEMBROS DO CLÃ (TODOS, JAIR, FLÁVIO, EDUARDO, CARLOS)
// ============================================================
function setupClanFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const memberCards = document.querySelectorAll('.member-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const target = btn.getAttribute('data-filter');

            memberCards.forEach(card => {
                if (target === 'all' || card.getAttribute('data-member') === target) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ============================================================
// ENQUETE INTERATIVA DO POVO (PAPUDA VS DISNEY)
// ============================================================
function setupPoll() {
    const btn1 = document.getElementById('poll-opt-1');
    const btn2 = document.getElementById('poll-opt-2');
    const bar1 = document.getElementById('poll-bar-1');
    const bar2 = document.getElementById('poll-bar-2');
    const count1 = document.getElementById('poll-count-1');
    const count2 = document.getElementById('poll-count-2');
    const thanks = document.getElementById('poll-thanks');

    if (!btn1 || !btn2) return;

    let v1 = parseInt(localStorage.getItem('bolsonaro_poll_papuda') || '3842', 10);
    let v2 = parseInt(localStorage.getItem('bolsonaro_poll_disney') || '612', 10);

    function updateBars() {
        const total = v1 + v2;
        const p1 = Math.round((v1 / total) * 100);
        const p2 = 100 - p1;

        if (bar1) bar1.style.width = p1 + '%';
        if (bar2) bar2.style.width = p2 + '%';
        if (count1) count1.textContent = `${v1.toLocaleString('pt-BR')} votos (${p1}%)`;
        if (count2) count2.textContent = `${v2.toLocaleString('pt-BR')} votos (${p2}%)`;
    }

    updateBars();

    btn1.addEventListener('click', () => {
        getAudioContext();
        playSirenSound();
        v1++;
        localStorage.setItem('bolsonaro_poll_papuda', v1);
        updateBars();
        if (thanks) {
            thanks.style.display = 'block';
            thanks.textContent = '✅ Voto computado: Papuda com cela compartilhada e água de torneira!';
        }
    });

    btn2.addEventListener('click', () => {
        getAudioContext();
        playAirportSound();
        v2++;
        localStorage.setItem('bolsonaro_poll_disney', v2);
        updateBars();
        if (thanks) {
            thanks.style.display = 'block';
            thanks.textContent = '✅ Voto computado: Exílio perpétuo na Disney vendendo sorvete com orelha de Mickey!';
        }
    });
}

// ============================================================
// FATOS DO CLÃ & LINHAS DO TERMINAL HACKER DE BRASÍLIA
// ============================================================
const clanLines = [
    'JAIR (#00): Indiciado pela PF por golpe de Estado, minuta golpista e falsificação no cartão de vacinas.',
    'FLÁVIO (#01): Investigado pelo esquema das rachadinhas na Alerj, cheques de Queiroz e loja de chocolates.',
    'EDUARDO (#03): Defendeu "novo AI-5", articulação em Washington e disse que fritar hambúrguer o qualificava pra embaixada.',
    'CARLOS (#02): Apontado pela PF como mentor do Gabinete do Ódio e alvo de operação sobre espionagem na Abin Paralela.',
    'JAIR (#00): US$ 3 milhões em joias sauditas desviadas e vendidas nos EUA com recompra de emergência.',
    'FLÁVIO (#01): Relatório do Coaf apontou 48 depósitos em espécie de R$ 2 mil no caixa eletrônico da Alerj.',
    'CARLOS (#02): Fugiu de jet ski na costa de Angra dos Reis minutos antes da chegada da Polícia Federal.',
    'EDUARDO (#03): Presente nos EUA durante contatos golpistas pós-eleição e constante presença na CPAC.',
    'PLANO GERAL: Se a Papuda lotar, a Hungria e a Flórida já preparam o comitê de recepção com tornozeleira.',
    'INELEGIBILIDADE: Jair Bolsonaro condenado pelo TSE até 2030 por desinformação contra as urnas eletrônicas.'
];

let clanLineIdx = 0;

function updateTerminalProfile() {
    if (!profileText) return;
    profileText.classList.add('fade-out');
    setTimeout(() => {
        clanLineIdx = (clanLineIdx + 1) % clanLines.length;
        profileText.textContent = '> ' + clanLines[clanLineIdx];
        profileText.classList.remove('fade-out');
    }, 400);
}

// ============================================================
// CONTADOR SIMULADO DE TESTEMUNHAS ONLINE
// ============================================================
function setupAccessCounter() {
    if (!accessCounter) return;

    let count = Math.floor(Math.random() * 1200) + 4800;
    accessCounter.textContent = count.toLocaleString('pt-BR');

    let recent = 0;

    setInterval(() => {
        const h = new Date().getHours();
        let delta = Math.floor(Math.random() * 25) - 9;
        if ((h >= 9 && h < 13) || (h >= 18 && h < 23)) delta += Math.floor(Math.random() * 18);
        count += delta;
        if (count < 3500) count = 3500 + Math.floor(Math.random() * 400);
        accessCounter.textContent = count.toLocaleString('pt-BR');

        if (delta > 8 && recentJoins) {
            recent += delta;
            if (recentCount) recentCount.textContent = recent;
            recentJoins.style.opacity = '1';
            setTimeout(() => {
                recentJoins.style.opacity = '0';
                setTimeout(() => { recent = 0; }, 600);
            }, 3500);
        }
    }, 3000);
}

// ============================================================
// LINKS DE COMPARTILHAMENTO VIRAL
// ============================================================
function setupShareLinks() {
    const url = window.location.href || 'https://statusdobolsonaro.github.io';

    const waMsg = `🚨 STATUS DOS BOLSONAROS: PAPUDA OU MIAMI?\n\nO cerco fechou para a família: Jair, Flávio, Eduardo e Carlos no radar da Justiça. Veja o resumo dos inquéritos e decida o destino no Destinômetro:\n\n${url}`;
    const waBtn = document.getElementById('whatsapp-share-button-main');
    if (waBtn) waBtn.href = `https://wa.me/?text=${encodeURIComponent(waMsg)}`;

    const tweetMsg = `🚨 STATUS DOS BOLSONAROS: Papuda ou Miami? O radar do Clã Bolsonaro com inquéritos, rachadinhas, joias e o Destinômetro interativo: ${url}`;
    const twBtn = document.getElementById('twitter-share-button');
    if (twBtn) twBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetMsg)}`;

    const tgBtn = document.getElementById('telegram-share-button');
    if (tgBtn) tgBtn.href = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(waMsg)}`;

    const fbBtn = document.getElementById('facebook-share-button');
    if (fbBtn) fbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    setupStory();
    setupAudioButton();
    setupDestinometro();
    setupClanFilters();
    setupPoll();
    setupAccessCounter();
    setupShareLinks();

    if (profileText) {
        profileText.textContent = '> ' + clanLines[0];
        setInterval(updateTerminalProfile, 4500);
    }
});
