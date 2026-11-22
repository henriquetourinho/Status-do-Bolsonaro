// ============================================================
// STATUS DOS BOLSONAROS — MOTOR INTERATIVO JAVASCRIPT
// ============================================================

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
    } catch (e) {}
}

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

function playAirportSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const notes = [587.33, 880];

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
// STORY OVERLAY (5 SLIDES)
// ============================================================
function setupStory() {
    const overlay = document.getElementById('story-overlay');
    if (!overlay) return;

    const TOTAL = 5;
    const DURATION = 3300;
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

    // Mandar todos pra Papudinha com o pai
    if (btnArrestAll) {
        btnArrestAll.addEventListener('click', () => {
            getAudioContext();
            playSirenSound();
            setTimeout(playGavelSound, 400);

            cards.forEach(card => {
                card.classList.remove('state-fugitive');
                card.classList.add('state-arrested');
                const jBars = card.querySelector('.jail-bars');
                if (jBars) jBars.style.opacity = '1';
                const fOverlay = card.querySelector('.flight-overlay');
                if (fOverlay) fOverlay.style.opacity = '0';

                const statusPill = card.querySelector('.live-status-pill');
                if (statusPill) {
                    const member = card.getAttribute('data-member');
                    if (member === 'jair') {
                        statusPill.innerHTML = '<span class="pulse-dot"></span> CONDENADO A 27 ANOS · PRESO NA PAPUDINHA';
                    } else {
                        statusPill.innerHTML = '<span class="pulse-dot"></span> PRESO NA PAPUDINHA · FAZENDO COMPANHIA PRO CAPITÃO';
                    }
                    statusPill.style.background = '#ff1744';
                    statusPill.style.color = '#fff';
                }
            });

            if (destStatusBanner) {
                destStatusBanner.innerHTML = '🚨 MANDADOS CUMPRIDOS: OS 4 FILHOS FORAM TRANSFERIDOS PARA A PAPUDINHA JUNTO COM JAIR BOLSONARO NO 19º BPM!';
                destStatusBanner.style.borderLeftColor = 'var(--red)';
                destStatusBanner.style.color = 'var(--red)';
            }
        });
    }

    // Fuga Geral pro Exterior (juntar com Eduardo)
    if (btnEscapeAll) {
        btnEscapeAll.addEventListener('click', () => {
            getAudioContext();
            playAirportSound();

            cards.forEach(card => {
                card.classList.remove('state-arrested');
                card.classList.add('state-fugitive');
                const jBars = card.querySelector('.jail-bars');
                if (jBars) jBars.style.opacity = '0';
                const fOverlay = card.querySelector('.flight-overlay');
                if (fOverlay) fOverlay.style.opacity = '1';

                const statusPill = card.querySelector('.live-status-pill');
                if (statusPill) {
                    const member = card.getAttribute('data-member');
                    if (member === 'eduardo') {
                        statusPill.innerHTML = '✈️ FORAGIDO NOS EUA · CASO BANCO MASTER (DALLAS)';
                    } else if (member === 'carlos') {
                        statusPill.innerHTML = '🛥️ FORAGIDO DE JET SKI EM ÁGUAS INTERNACIONAIS';
                    } else {
                        statusPill.innerHTML = '✈️ FORAGIDO NO EXTERIOR · GASTANDO O FUNDO HAVENGATE';
                    }
                    statusPill.style.background = '#0066cc';
                    statusPill.style.color = '#fff';
                }
            });

            if (destStatusBanner) {
                destStatusBanner.innerHTML = '✈️ ALERTA VERMELHO INTERPOL: O CLÃ FOI VISTO NO TEXAS, FLÓRIDA E ILHAS CAYMAN COM A GRANA DO BANCO MASTER!';
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
                const member = card.getAttribute('data-member');
                // Jair SEMPRE fica preso (condenado a 27 anos)
                const isArrested = member === 'jair' ? true : Math.random() > 0.5;

                card.classList.remove('state-arrested', 'state-fugitive');
                const jBars = card.querySelector('.jail-bars');
                const fOverlay = card.querySelector('.flight-overlay');
                const statusPill = card.querySelector('.live-status-pill');

                if (isArrested) {
                    card.classList.add('state-arrested');
                    if (jBars) jBars.style.opacity = '1';
                    if (fOverlay) fOverlay.style.opacity = '0';
                    if (statusPill) {
                        statusPill.innerHTML = '<span class="pulse-dot"></span> PRESO NA PAPUDA · 19º BPM';
                        statusPill.style.background = '#ff1744';
                        statusPill.style.color = '#fff';
                    }
                } else {
                    card.classList.add('state-fugitive');
                    if (jBars) jBars.style.opacity = '0';
                    if (fOverlay) fOverlay.style.opacity = '1';
                    if (statusPill) {
                        statusPill.innerHTML = '✈️ FORAGIDO NO EXTERIOR';
                        statusPill.style.background = '#0066cc';
                        statusPill.style.color = '#fff';
                    }
                }
            });

            if (destStatusBanner) {
                destStatusBanner.innerHTML = '⚖️ ROLETA DO STF: JAIR NA PAPUDINHA, E OS FILHOS DIVIDIDOS ENTRE O CAMBURÃO E O TEXAS!';
                destStatusBanner.style.borderLeftColor = 'var(--yellow)';
                destStatusBanner.style.color = 'var(--yellow)';
            }
        });
    }

    // Restaurar Radar Real (Jair preso / Eduardo foragido / demais no radar)
    if (btnResetRadar) {
        btnResetRadar.addEventListener('click', () => {
            cards.forEach(card => {
                const member = card.getAttribute('data-member');
                card.classList.remove('state-arrested', 'state-fugitive');
                const jBars = card.querySelector('.jail-bars');
                const fOverlay = card.querySelector('.flight-overlay');
                const statusPill = card.querySelector('.live-status-pill');

                if (member === 'jair') {
                    card.classList.add('state-arrested');
                    if (jBars) jBars.style.opacity = '1';
                    if (fOverlay) fOverlay.style.opacity = '0';
                    if (statusPill) {
                        statusPill.innerHTML = '<span class="pulse-dot"></span> CONDENADO A 27 ANOS PELO STF · PRESO NA PAPUDA';
                        statusPill.style.background = '#ff1744';
                        statusPill.style.color = '#fff';
                    }
                } else if (member === 'eduardo') {
                    card.classList.add('state-fugitive');
                    if (jBars) jBars.style.opacity = '0';
                    if (fOverlay) fOverlay.style.opacity = '1';
                    if (statusPill) {
                        statusPill.innerHTML = '✈️ FORAGIDO NOS EUA · CASO BANCO MASTER & FUNDO NO TEXAS';
                        statusPill.style.background = '#0066cc';
                        statusPill.style.color = '#fff';
                    }
                } else {
                    if (jBars) jBars.style.opacity = '0';
                    if (fOverlay) fOverlay.style.opacity = '0';
                    const originalText = card.getAttribute('data-original-status') || 'INVESTIGADO NO STF';
                    if (statusPill) {
                        statusPill.innerHTML = `<span class="pulse-dot"></span> ${originalText}`;
                        statusPill.style.background = '#000';
                        statusPill.style.color = 'var(--yellow)';
                    }
                }
            });

            if (destStatusBanner) {
                destStatusBanner.innerHTML = '📡 RADAR RESTAURADO: JAIR CONDENADO NA PAPUDINHA · EDUARDO FORAGIDO NOS EUA NO CASO BANCO MASTER · FLÁVIO, CARLOS E RENAN MONITORADOS.';
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
                const jBars = card.querySelector('.jail-bars');
                if (jBars) jBars.style.opacity = '1';
                const fOverlay = card.querySelector('.flight-overlay');
                if (fOverlay) fOverlay.style.opacity = '0';

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
                const jBars = card.querySelector('.jail-bars');
                if (jBars) jBars.style.opacity = '0';
                const fOverlay = card.querySelector('.flight-overlay');
                if (fOverlay) fOverlay.style.opacity = '1';

                const pill = card.querySelector('.live-status-pill');
                if (pill) {
                    pill.innerHTML = '✈️ FORAGIDO NO EXTERIOR';
                    pill.style.background = '#0066cc';
                    pill.style.color = '#fff';
                }
            }
        });
    });
}

// ============================================================
// FILTROS DE MEMBROS (TODOS, JAIR, FLÁVIO, EDUARDO, CARLOS, RENAN)
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
// ENQUETE INTERATIVA DO POVO (PAPUDINHA VS TEXAS)
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

    let v1 = parseInt(localStorage.getItem('bolsonaro_poll_papuda_v2') || '4210', 10);
    let v2 = parseInt(localStorage.getItem('bolsonaro_poll_disney_v2') || '520', 10);

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
        localStorage.setItem('bolsonaro_poll_papuda_v2', v1);
        updateBars();
        if (thanks) {
            thanks.style.display = 'block';
            thanks.textContent = '✅ Voto computado: Beliche quádruplo no 19º BPM com Jair Bolsonaro na Papudinha!';
        }
    });

    btn2.addEventListener('click', () => {
        getAudioContext();
        playAirportSound();
        v2++;
        localStorage.setItem('bolsonaro_poll_disney_v2', v2);
        updateBars();
        if (thanks) {
            thanks.style.display = 'block';
            thanks.textContent = '✅ Voto computado: Exílio no Texas com Eduardo Bolsonaro gastando a grana do Banco Master!';
        }
    });
}

// ============================================================
// FATOS DO CLÃ & LINHAS DO TERMINAL HACKER DE BRASÍLIA
// ============================================================
const clanLines = [
    'JAIR (#00): Condenado pelo STF a 27 anos e 3 meses por tentativa de golpe de Estado e organização criminosa armada.',
    'JAIR (#00): Tentou violar tornozeleira eletrônica com ferro de solda; Moraes decretou prisão preventiva fechada na Papudinha.',
    'JAIR (#00): Instalado na Sala de Estado-Maior no 19º BPM (Complexo da Papuda, cela individual de 64 m²).',
    'EDUARDO (#03): Foragido nos EUA. Investigado pela PF por repasses de R$ 61 milhões do Banco Master (Daniel Vorcaro).',
    'EDUARDO (#03): Grana do Banco Master irrigou o Havengate Development Fund no Texas gerido por advogados ligados a Eduardo.',
    'FLÁVIO (#01): Articulou com Daniel Vorcaro o contrato milionário de R$ 134 milhões disfarçado de filme sobre Jair.',
    'CARLOS (#02): Alvo da Operação Última Milha por chefiar espionagem da Abin Paralela; famosa fuga de jet ski em Angra.',
    'RENAN (#04): Réu na 5ª Vara Criminal do DF por lavagem de dinheiro, falsidade ideológica e calote de R$ 291 mil no Santander.',
    'RENAN (#04): Investigado pela PF por tráfico de influência para abrir portas de ministérios a empresários em troca de carro elétrico.',
    'CERCO TOTAL: Jair já inaugurou a Papudinha. O destino dos filhos é a cela ao lado ou a extradição internacional.'
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

    let count = Math.floor(Math.random() * 1200) + 5800;
    accessCounter.textContent = count.toLocaleString('pt-BR');

    let recent = 0;

    setInterval(() => {
        const h = new Date().getHours();
        let delta = Math.floor(Math.random() * 25) - 9;
        if ((h >= 9 && h < 13) || (h >= 18 && h < 23)) delta += Math.floor(Math.random() * 18);
        count += delta;
        if (count < 4200) count = 4200 + Math.floor(Math.random() * 400);
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

    const waMsg = `🚨 STATUS DOS BOLSONAROS: JAIR NA PAPUDINHA & EDUARDO FORAGIDO NOS EUA (CASO BANCO MASTER)!\n\nJair condenado a 27 anos no 19º BPM, Eduardo no Texas com os R$ 61 mi de Vorcaro, e Flávio, Carlos e Renan no radar. Veja o Destinômetro:\n\n${url}`;
    const waBtn = document.getElementById('whatsapp-share-button-main');
    if (waBtn) waBtn.href = `https://wa.me/?text=${encodeURIComponent(waMsg)}`;

    const tweetMsg = `🚨 STATUS DOS BOLSONAROS: Jair cumprindo 27 anos na Papudinha, Eduardo foragido nos EUA no Caso Banco Master, Flávio, Carlos e Renan no radar do STF: ${url}`;
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
