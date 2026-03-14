// ============================================================
// ELEMENTOS
// ============================================================
const backgroundAudio = document.getElementById('background-audio');
const audioControlButton = document.getElementById('audio-control-button');
const audioIcon = document.getElementById('audio-icon');
const accessCounter = document.getElementById('access-counter');
const recentJoins = document.getElementById('recent-joins');
const recentCount = document.getElementById('recent-count');
const profileText = document.getElementById('profile-text');
const mainWhatsappButton = document.getElementById('whatsapp-share-button-main');
const twitterShareButton = document.getElementById('twitter-share-button');
const facebookShareButton = document.getElementById('facebook-share-button');

// ============================================================
// STORY OVERLAY — estilo TikTok/Instagram
// ============================================================
function setupStory() {
    const overlay = document.getElementById('story-overlay');
    if (!overlay) return;

    const TOTAL = 5;
    const DURATION = 3000; // ms por slide
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

        // barras de progresso
        bars.forEach((b, i) => {
            b.classList.remove('done', 'active');
            fills[i].style.transition = 'none';
            fills[i].style.width = i < idx ? '100%' : '0%';
        });

        // anima a barra do slide atual
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

    // TOQUE ESQUERDO → retrocede, direito → avança
    if (tapLeft) tapLeft.addEventListener('click', () => goTo(current - 1));
    if (tapRight) tapRight.addEventListener('click', () => goTo(current + 1));

    // SWIPE UP para fechar em qualquer slide
    overlay.addEventListener('touchstart', e => { startY = e.touches[0].clientY; }, { passive: true });
    overlay.addEventListener('touchend', e => {
        if (startY === null) return;
        const dy = startY - e.changedTouches[0].clientY;
        if (dy > 60) dismiss();   // swipe up ≥60px → fecha
        startY = null;
    }, { passive: true });

    // CLIQUE no último slide fecha
    slides[TOTAL - 1].addEventListener('click', dismiss);

    // Inicia no slide 0
    showSlide(0);
}


// ============================================================
// BOTÃO DE CONTROLE DE ÁUDIO
// ============================================================
function setupAudioButton() {
    if (!audioControlButton || !backgroundAudio) return;

    audioControlButton.addEventListener('click', () => {
        if (backgroundAudio.paused) {
            backgroundAudio.play().catch(() => { });
            if (audioIcon) audioIcon.textContent = '🔊';
        } else {
            backgroundAudio.pause();
            if (audioIcon) audioIcon.textContent = '🔇';
        }
    });
}

// ============================================================
// TÍTULO + FAVICON
// ============================================================
function updateBrowserTab() {
    document.title = '☠️ MORTO — Status do Bolsonaro';
}

// ============================================================
// FATOS HISTÓRICOS — TERMINAL
// ============================================================
const profileLines = [
    '"Não sou coveiro, pra que me perguntar?" — resposta real ao ser questionado sobre mortos na Covid. Abril/2020.',
    '"E daí? Lamento. Quer que eu faça o quê?" — ao ser confrontado com o número de mortes pela pandemia.',
    '"É uma gripezinha." — enquanto o Brasil batia recordes de mortes por Covid-19.',
    'Fez gestos de sufocamento em live pra ridicularizar quem morria por falta de ar. Manaus sem oxigênio.',
    'Pediu sigilo de 100 anos no cartão de vacinação. Depois confirmou: nunca tomou a vacina da Covid.',
    'Morreu com soluços crônicos, refluxo severo e pneumonias por aspiração. O mesmo sistema que ele zombou.',
    'Ficou internado meses com esofagite erosiva e crises de vômito. O corpo cobrou. Com juros.',
    'Indiciado pela PF por golpe de Estado. Fugiu pro EUA 2 dias antes da posse de Lula. Voltou de tornozeleira.',
    'US$ 3 mi em joias da Arábia Saudita escondidas na cueca de assessor. Investigado por peculato.',
    'Condenado pelo TSE, inelegível até 2030, tornozeleira 24h. Morreu sem poder se candidatar. slay.'
];

let profileIndex = 0;

function updateProfile() {
    if (!profileText) return;
    profileText.classList.add('fade-out');
    setTimeout(() => {
        profileIndex = (profileIndex + 1) % profileLines.length;
        profileText.textContent = '> ' + profileLines[profileIndex];
        profileText.classList.remove('fade-out');
    }, 400);
}

// ============================================================
// CONTADOR DE ACESSOS SIMULADO
// ============================================================
function setupAccessCounter() {
    if (!accessCounter) return;

    let count = Math.floor(Math.random() * 1000) + 3500;
    accessCounter.textContent = count.toLocaleString('pt-BR');

    let recent = 0;

    setInterval(() => {
        const h = new Date().getHours();
        let delta = Math.floor(Math.random() * 21) - 8;
        if ((h >= 9 && h < 12) || (h >= 18 && h < 22)) delta += Math.floor(Math.random() * 15);
        count += delta;
        if (count < 2800) count = 2800 + Math.floor(Math.random() * 300);
        accessCounter.textContent = count.toLocaleString('pt-BR');

        if (delta > 7 && recentJoins) {
            recent += delta;
            recentCount.textContent = recent;
            recentJoins.style.opacity = '1';
            setTimeout(() => {
                recentJoins.style.opacity = '0';
                setTimeout(() => { recent = 0; }, 600);
            }, 4000);
        }
    }, 2800);
}

// ============================================================
// LINKS DE COMPARTILHAMENTO
// ============================================================
function setupShareLinks() {
    const url = 'https://statusdobolsonaro.org';

    const waMsg = `☠️ Bolsonaro morreu.\n\n"Não sou coveiro" — disse ele sobre 700 mil mortos na pandemia. Agora também é história. O Brasil não pode esquecer:\n\n${url}`;
    if (mainWhatsappButton) mainWhatsappButton.href = `https://wa.me/?text=${encodeURIComponent(waMsg)}`;

    const tweets = [
        `"Não sou coveiro" — disse sobre 700 mil mortos. Agora também partiu. O Brasil não esquece: ${url}`,
        `O homem que zombou dos mortos da pandemia virou história. Registro completo: ${url}`,
        `Condenado, inelegível, preso em casa, morreu com soluços crônicos. O karma é pontual: ${url}`,
        `De "gripezinha" a esofagite erosiva e pneumonia por aspiração. O corpo cobrou: ${url}`,
        `Tentou golpe, escondeu joias na cueca do assessor, imitou sufocamento em live. Agora é passado: ${url}`
    ];
    if (twitterShareButton) {
        twitterShareButton.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweets[Math.floor(Math.random() * tweets.length)])}`;
    }

    const fbs = [
        'Bolsonaro morreu. O mesmo que disse "não sou coveiro" para 700 mil mortos na pandemia. O Brasil registra e não esquece.',
        'A história cobrou a conta. O homem que zombou dos mortos da Covid também partiu. Registro histórico completo:',
        'De Brasília para o exílio, de volta para a tornozeleira — e agora o fim. O Brasil documentou tudo:'
    ];
    if (facebookShareButton) {
        const q = fbs[Math.floor(Math.random() * fbs.length)];
        facebookShareButton.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(q)}`;
    }
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    updateBrowserTab();
    setupStory();
    setupAudioButton();
    setupAccessCounter();
    setupShareLinks();

    if (profileText) {
        profileText.textContent = '> ' + profileLines[0];
        setInterval(updateProfile, 5000);
    }
});