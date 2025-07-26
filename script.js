// --- ELEMENTOS DA PÁGINA ---
const statusContainer = document.getElementById('status-container');
const temporaryStatus = document.getElementById('temporary-status');
const countdownContainer = document.getElementById('countdown-container');
const profileText = document.getElementById('profile-text');
const backgroundAudio = document.getElementById('background-audio');
const audioControlButton = document.getElementById('audio-control-button');

// --- LISTA DE FERIADOS NACIONAIS DE 2025 ---
const feriados2025 = [
    { month: 0, day: 1 },   // Confraternização Universal
    { month: 3, day: 18 },  // Paixão de Cristo
    { month: 3, day: 21 },  // Tiradentes
    { month: 4, day: 1 },   // Dia do Trabalho
    { month: 8, day: 7 },   // Independência do Brasil
    { month: 9, day: 12 },  // Nossa Senhora Aparecida
    { month: 10, day: 2 },  // Finados
    { month: 10, day: 15 }, // Proclamação da República
    { month: 10, day: 20 }, // Dia da Consciência Negra
    { month: 11, day: 25 }  // Natal
];

function isHoliday(date) {
    const todayMonth = date.getMonth();
    const todayDay = date.getDate();
    return feriados2025.some(feriado => feriado.month === todayMonth && feriado.day === todayDay);
}

function formatarDataCompleta(date) {
    const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    const diaSemana = dias[date.getDay()];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const ano = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');

    return `${diaSemana}, ${dia} de ${mes} de ${ano}, às ${horas}:${minutos}`;
}

// --- LÓGICA DA ANÁLISE PSICOLÓGICA ---
const profileLines = [
    "Nível de Ameaça: ALTO (Risco iminente de postar fake news)",
    "Estado Emocional: Saudade de uma motociata.",
    "Capacidade Cognitiva: Estável (em negação permanente).",
    "Humor: Irritadiço. Possível abstinência de poder.",
    "Nível de Copium: CRÍTICO.",
    "Pensamento Recorrente: 'A culpa é do sistema'.",
    "Atividade Cerebral: Detectada tentativa de culpar a imprensa.",
    "Probabilidade de Fuga: ALTA (Monitorar proximidade de embaixadas).",
    "Memória Afetiva: Lembranças de um jet ski.",
    "Avaliação de Risco: Perigo constante de falar 'talkei'."
];
let profileIndex = 0;
function updateProfile() {
    profileText.classList.add("fade-out");
    setTimeout(() => {
        profileIndex = (profileIndex + 1) % profileLines.length;
        profileText.textContent = profileLines[profileIndex];
        profileText.classList.remove("fade-out");
    }, 400);
}

// --- FUNÇÃO PARA ATUALIZAR A ABA DO NAVEGADOR ---
function updateBrowserTab(podeSair) {
    const favicon = document.querySelector("link[rel='icon']");
    const baseTitle = "Status do Bolsonaro";
    const faviconRecolhido = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23d93025%22/></svg>";
    const faviconNaRua = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%231877f2%22/></svg>";

    if (podeSair) {
        document.title = `🟢 NA RUA - ${baseTitle}`;
        favicon.href = faviconNaRua;
    } else {
        document.title = `🔴 RECOLHIDO - ${baseTitle}`;
        favicon.href = faviconRecolhido;
    }
}

// --- FUNÇÃO PRINCIPAL DE ATUALIZAÇÃO DE STATUS ---
function updateStatus() {
    const agora = new Date();
    const diaDaSemana = agora.getDay();
    const hora = agora.getHours();
    const ehFimDeSemana = (diaDaSemana === 0 || diaDaSemana === 6);
    const ehFeriado = isHoliday(agora);
    let podeSair = false;
    let proximaMudanca;

    if (ehFimDeSemana || ehFeriado) {
        podeSair = false;
        proximaMudanca = new Date(agora);
        proximaMudanca.setHours(7, 0, 0, 0);
        do {
            proximaMudanca.setDate(proximaMudanca.getDate() + 1);
        } while (proximaMudanca.getDay() === 0 || proximaMudanca.getDay() === 6 || isHoliday(proximaMudanca));
    } else {
        if (hora >= 7 && hora < 19) {
            podeSair = true;
            proximaMudanca = new Date(agora);
            proximaMudanca.setHours(19, 0, 0, 0);
        } else {
            podeSair = false;
            proximaMudanca = new Date(agora);
            proximaMudanca.setHours(7, 0, 0, 0);
            if (hora >= 19) {
                proximaMudanca.setDate(proximaMudanca.getDate() + 1);
            }
        }
    }
    
    statusContainer.className = podeSair ? 'pode-sair' : 'nao-pode-sair';

    const diff = proximaMudanca - agora;
    const horas = Math.floor(diff / 3600000);
    const minutos = Math.floor((diff % 3600000) / 60000);
    const segundos = Math.floor((diff % 60000) / 1000);
    const countdownString = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

    if (podeSair) {
        temporaryStatus.textContent = 'NA RUA';
        countdownContainer.innerHTML = `<p class="countdown-label">Retorno obrigatório à base em:</p><p class="countdown-timer">${countdownString}</p>`;
    } else {
        temporaryStatus.textContent = 'RECOLHIDO';
        countdownContainer.innerHTML = `
            <p class="info-text">O 'mito' silenciou. A tornozeleira no seu pé é a caneta de Moraes em ação.</p>
            <p class="info-text release-time">Próxima autorização de saída: <strong>${formatarDataCompleta(proximaMudanca)}</strong></p>
            <p class="countdown-label">Tempo restante de contenção:</p>
            <p class="countdown-timer">${countdownString}</p>
        `;
    }
    
    // CORREÇÃO: Esta linha foi movida para fora do bloco if/else
    updateBrowserTab(podeSair);
}

// --- LÓGICA DE CONTROLE DO ÁUDIO ---
audioControlButton.addEventListener('click', () => {
    if (backgroundAudio.paused) {
        backgroundAudio.play().catch(error => {
            console.log("O navegador impediu o autoplay. O usuário precisa interagir para iniciar.");
        });
        audioControlButton.textContent = '🔊';
    } else {
        backgroundAudio.pause();
        audioControlButton.textContent = '🔇';
    }
});

// --- INICIA OS CICLOS DE ATUALIZAÇÃO ---
updateStatus();
setInterval(updateStatus, 1000);
setInterval(updateProfile, 5000);