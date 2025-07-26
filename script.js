// --- ELEMENTOS DA PÁGINA ---
const statusContainer = document.getElementById('status-container');
const temporaryStatus = document.getElementById('temporary-status');
const countdownContainer = document.getElementById('countdown-container');
const profileText = document.getElementById('profile-text');
const backgroundAudio = document.getElementById('background-audio');
const audioControlButton = document.getElementById('audio-control-button');
const accessCounter = document.getElementById('access-counter'); // Novo contador de acessos
const recentJoins = document.getElementById('recent-joins'); // Elemento para novos acessos
const recentCount = document.getElementById('recent-count'); // Contador de novos acessos
const mainWhatsappButton = document.getElementById('whatsapp-share-button-main');
const twitterShareButton = document.getElementById('twitter-share-button'); // Botão do Twitter
const facebookShareButton = document.getElementById('facebook-share-button'); // NOVO: Botão do Facebook

// Elementos para a funcionalidade de denúncia
const complaintFormContainer = document.getElementById('complaint-form-container');
const complaintListContainer = document.getElementById('complaint-list-container');
const complaintForm = document.getElementById('complaint-form');
const complaintStatusMessage = document.getElementById('complaint-status-message');
const openComplaintFormBtn = document.getElementById('open-complaint-form-btn');
const openComplaintListBtn = document.getElementById('open-complaint-list-btn');
const cancelComplaintButton = document.querySelector('#complaint-form-container .cancel-complaint-button');
const backToMainButton = document.querySelector('#complaint-list-container .back-to-main-button');

// --- LÓGICA DE HORÁRIOS ---
const feriados2025 = [
    { month: 0, day: 1 }, { month: 3, day: 18 }, { month: 3, day: 21 },
    { month: 4, day: 1 }, { month: 8, day: 7 }, { month: 9, day: 12 },
    { month: 10, day: 2 }, { month: 10, day: 15 }, { month: 10, day: 20 },
    { month: 11, day: 25 }
];

function isHoliday(date) {
    const todayMonth = date.getMonth();
    const todayDay = date.getDate();
    return feriados2025.some(feriado => feriado.month === todayMonth && feriado.day === todayDay);
}

function formatarDataCompleta(date) {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const diaSemana = dias[date.getDay()];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const ano = date.getFullYear();
    const horas = String(date.getHours()).padStart(2, '0');
    const minutos = String(date.getMinutes()).padStart(2, '0');
    return `${diaSemana}, ${dia} de ${mes} de ${ano}, às ${horas}:${minutos}`;
}

function updateBrowserTab(podeSair) {
    const favicon = document.querySelector("link[rel='icon']");
    const baseTitle = "Status do Bolsonaro";
    const faviconRecolhido = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%238ee09f%22/></svg>";
    const faviconNaRua = "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23ff9a94%22/></svg>";

    if (podeSair) {
        document.title = `🔴 NA RUA - ${baseTitle}`;
        favicon.href = faviconNaRua;
    } else {
        document.title = `🟢 RECOLHIDO - ${baseTitle}`;
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
    
    statusContainer.className = podeSair ? 'na-rua' : 'recolhido';
    
    const diff = proximaMudanca - agora;
    const horas = Math.floor(diff / 3600000);
    const minutos = Math.floor((diff % 3600000) / 60000);
    const segundos = Math.floor((diff % 60000) / 1000);
    const countdownString = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

    temporaryStatus.textContent = podeSair ? 'NA RUA' : 'RECOLHIDO';
    
    if (podeSair) {
        countdownContainer.innerHTML = `<p class="countdown-label">Fim da liberdade vigiada em:</p><p class="countdown-timer">${countdownString}</p>`;
    } else {
        countdownContainer.innerHTML = `
            <p class="info-text">O 'mito' silenciou. A tornozeleira no seu pé é a caneta de Moraes em ação.</p>
            <p class="release-time">Próxima autorização de saída: <strong>${formatarDataCompleta(proximaMudanca)}</strong></p>
            <p class="countdown-label">Tempo restante de segurança nacional:</p>
            <p class="countdown-timer">${countdownString}</p>
        `;
    }
    
    updateBrowserTab(podeSair);
}

// --- LÓGICA DE ANÁLISE PSICOLÓGICA ---
const profileLines=["Nível de Ameaça: ALTO (Risco iminente de postar fake news)","Estado Emocional: Saudade de uma motociata.","Capacidade Cognitiva: Estável (em negação permanente).","Humor: Irritadiço. Possível abstinência de poder.","Nível de Copium: CRÍTICO.","Pensamento Recorrente: 'A culpa é do sistema'.","Atividade Cerebral: Detectada tentativa de culpar a imprensa.","Probabilidade de Fuga: ALTA (Monitorar proximidade de embaixadas).","Memória Afetiva: Lembranças de um jet ski.","Avaliação de Risco: Perigo constante de falar 'talkei'."];
let profileIndex=0;
function updateProfile(){if(!profileText)return;profileText.classList.add("fade-out");setTimeout(()=>{profileIndex=(profileIndex+1)%profileLines.length;profileText.textContent=profileLines[profileIndex];profileText.classList.remove("fade-out")},400)}

// --- CONTROLE DE ÁUDIO ---
if(audioControlButton){audioControlButton.addEventListener("click",()=>{backgroundAudio.paused?(backgroundAudio.play().catch(e=>console.log("Autoplay bloqueado")),audioControlButton.textContent="🔊"):(backgroundAudio.pause(),audioControlButton.textContent="🔇")})}

// --- LÓGICA DO NOVO CONTADOR DE ACESSOS (MANIPULATIVO) ---
function setupAccessCounter() {
    if (!accessCounter) return;

    let currentAccessCount = Math.floor(Math.random() * 500) + 2500; // Começa com um número alto para prova social
    accessCounter.textContent = currentAccessCount;

    let recentJoinCount = 0;
    let lastUpdate = new Date();

    setInterval(() => {
        const now = new Date();
        const timeDiffMinutes = (now - lastUpdate) / (1000 * 60);
        lastUpdate = now;

        // Simula flutuações realistas com picos e vales
        let change = Math.floor(Math.random() * 21) - 10; // Variação de -10 a +10
        
        // Aumenta a variação em horários de pico (ex: 9h-12h, 18h-21h)
        const hour = now.getHours();
        if ((hour >= 9 && hour < 12) || (hour >= 18 && hour < 21)) {
            change += Math.floor(Math.random() * 10); // Adiciona mais 0-9
        }

        currentAccessCount += change;

        // Garante que o número não caia muito, simulando base de usuários
        if (currentAccessCount < 2000) {
            currentAccessCount = 2000 + Math.floor(Math.random() * 100);
        }

        accessCounter.textContent = currentAccessCount;

        // Lógica para simular novos acessos e exibir a mensagem manipulativa
        if (change > 0) {
            recentJoinCount += change; // Acumula os novos acessos
            recentCount.textContent = recentJoinCount;
            recentJoins.style.opacity = 1; // Torna visível
            recentJoins.style.transition = 'opacity 0.5s ease-in-out';
        } else if (recentJoinCount > 0 && timeDiffMinutes >= 5) { // Reseta a cada 5 minutos se não houver novos acessos
            recentJoins.style.opacity = 0; // Esconde
            setTimeout(() => {
                recentJoinCount = 0;
                recentCount.textContent = recentJoinCount;
            }, 500); // Espera a transição para resetar
        }

    }, 2500); // Atualiza a cada 2.5 segundos
}

// --- Lógica de exibição das seções principais ---
function showMainContent() {
    document.querySelectorAll('.container > div').forEach(section => {
        // Oculta todas as seções, exceto as novas de denúncia (que serão controladas pelos botões)
        // e as seções principais (status, perfil, contador, share, cta)
        if (section.id !== 'complaint-form-container' && section.id !== 'complaint-list-container') {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden'); // Garante que as seções de denúncia estão ocultas
        }
    });
    // Garante que o container principal esteja visível (caso tenha sido ocultado por algum fluxo)
    document.querySelector('main.container').classList.remove('hidden');
}

// --- Lógica para Denunciar e Ver Denúncias no Site ---
if (openComplaintFormBtn) {
    openComplaintFormBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.container > div').forEach(section => section.classList.add('hidden'));
        complaintFormContainer.classList.remove('hidden');
        complaintStatusMessage.classList.add('hidden'); // Oculta mensagens de status anteriores
    });
}

if (openComplaintListBtn) {
    openComplaintListBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.container > div').forEach(section => section.classList.add('hidden'));
        complaintListContainer.classList.remove('hidden');
    });
}

if (cancelComplaintButton) {
    cancelComplaintButton.addEventListener('click', () => {
        complaintForm.reset(); // Limpa o formulário
        showMainContent(); // Volta para a tela principal
        complaintFormContainer.classList.add('hidden'); // Esconde o formulário
    });
}

if (backToMainButton) {
    backToMainButton.addEventListener('click', () => {
        showMainContent(); // Volta para a tela principal
        complaintListContainer.classList.add('hidden'); // Esconde a lista de denúncias
    });
}

if (complaintForm) {
    complaintForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o envio padrão do formulário

        const descricaoDenuncia = document.getElementById('descricao_denuncia').value;
        const tipoCrime = document.getElementById('tipo_crime').value;
        const localOcorrencia = document.getElementById('local_ocorrencia').value;
        const dataOcorrencia = document.getElementById('data_ocorrencia').value;
        const linkProvas = document.getElementById('link_provas').value;

        // Simulação de envio da denúncia para o "backend"
        // Em um cenário real, você faria uma requisição fetch() para seu servidor aqui.
        console.log("Simulando envio de denúncia:", {
            descricaoDenuncia,
            tipoCrime,
            localOcorrencia,
            dataOcorrencia,
            linkProvas
        });

        // Exibe mensagem de sucesso
        complaintStatusMessage.textContent = '✅ Denúncia registrada com sucesso! Agradecemos sua colaboração.';
        complaintStatusMessage.className = 'complaint-message success'; // Adiciona classe de sucesso
        complaintStatusMessage.classList.remove('hidden'); // Torna visível

        // Limpa o formulário
        complaintForm.reset();

        // Opcional: Voltar para a tela principal após alguns segundos
        setTimeout(() => {
            complaintFormContainer.classList.add('hidden');
            complaintStatusMessage.classList.add('hidden');
            showMainContent();
        }, 5000); // Volta em 5 segundos
    });
}


// --- CONFIGURAÇÃO DOS ELEMENTOS INTERATIVOS ---
function setupInteractiveElements(){
    const siteUrl = "https://statusdobolsonaro.org"; // Substitua pela URL real do seu site se for diferente

    // --- WhatsApp ---
    const shareMessage = `🚨 Vigiando a ameaça à democracia 24h por dia!\n\nConfira o status do inelegível em tempo real e junte-se à vigilância popular:\n\n${siteUrl}`;
    const encodedMessage = encodeURIComponent(shareMessage);
    const whatsappLink = `https://wa.me/?text=${encodedMessage}`;
    if (mainWhatsappButton) mainWhatsappButton.href = whatsappLink;

    // --- Twitter / X ---
    const twitterTaunts = [
        "O ex-fugitivo tá recolhido de novo. Fiscalize o cercadinho virtual do inelegível aqui:",
        "Alguém sabe se pode levar o jet ski pra passear no pátio? Vigiando o inelegível 24/7:",
        "Status: com saudades de uma embaixada. Acompanhe o dia-a-dia do ex-presidente de pijama aqui:",
        "A tornozeleira tá apertada? 😂 Acompanhe em tempo real se o inelegível está NA RUA ou RECOLHIDO.",
        "Será que hoje ele tenta dar um pulo na embaixada de novo? 👀 Monitore o inelegível aqui:"
    ];
    const randomTwitterTaunt = twitterTaunts[Math.floor(Math.random() * twitterTaunts.length)];
    const twitterMessage = `${randomTwitterTaunt} ${siteUrl}`;
    const encodedTwitterMessage = encodeURIComponent(twitterMessage);
    const twitterLink = `https://twitter.com/intent/tweet?text=${encodedTwitterMessage}`;
    if (twitterShareButton) twitterShareButton.href = twitterLink;

    // --- Facebook (NOVO) ---
    const facebookTaunts = [
        "A democracia agradece a vigilância! Compartilhe o status do inelegível e ajude a fiscalizar cada passo: ",
        "O ex-presidente está de olho... e nós também! Ajude a fiscalizar no Facebook: ",
        "Notícias direto do cercadinho! Veja o que o inelegível está fazendo e compartilhe com seus amigos: ",
        "Se o Facebook não me derrubar, estou aqui pra te avisar: o 'mito' está sob vigília constante! Ajude a espalhar a palavra: ",
        "Cuidado com o que você curte! O inelegível está sendo monitorado. Compartilhe e junte-se à fiscalização: "
    ];
    const randomFacebookTaunt = facebookTaunts[Math.floor(Math.random() * facebookTaunts.length)];
    const facebookMessage = `${randomFacebookTaunt} ${siteUrl}`;
    const encodedFacebookMessage = encodeURIComponent(facebookMessage);
    // Link de compartilhamento do Facebook. A API de compartilhamento geralmente requer que a URL seja compartilhada como 'u' ou 'href'.
    // Apenas a URL do site é suficiente para o Facebook buscar o preview.
    const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodedFacebookMessage}`;
    if (facebookShareButton) facebookShareButton.href = facebookLink;
}

// --- INICIA OS CICLOS DE ATUALIZAÇÃO ---
document.addEventListener("DOMContentLoaded", () => {
    updateStatus();
    setInterval(updateStatus, 1000);
    
    if (profileText) {
        updateProfile();
        setInterval(updateProfile, 5000);
    }

    setupAccessCounter(); // Chama a nova função do contador de acessos
    setupInteractiveElements();
    showMainContent(); // Garante que o conteúdo principal seja exibido no carregamento inicial
});