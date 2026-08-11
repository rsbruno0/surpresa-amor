/* ==========================================================================
   Configurações Globais & Estado da Aplicação
   ========================================================================== */

const state = {
    theme: 'theme-blush',
    fromName: 'Bruno Santos Santana',
    toName: 'Maria Eduarda De Oliveira Gonçalves',
    letterText: `Você é a menina mais especial da minha vida, eu quero te ama para todo o sempre. Vamos fazer com que tudo que almejamos der certo para nós, eu estou torcendo muito por você, assim como torço para que a gente construa um lindo futuro juntos de de muito amor e companherismo. Quero estar ao seu lado nas sua melhores emoções e vivencias.

Dizem que existe amor para vida, eu creio que existe o amor que eu quero para a minha vida, assim como o amor que você quer para a sua vida, é uma escolha estar aqui e vamos lutar todos os dias para nossa escolha sempre seja ficar e acolher. Você é o amor para a minha vida e so você pode me provar isso.

Fiz esse Mural para que a gente possa colocar fotos de momentos nele, vamos atualizando com o passar dos anos para sempre olhar para ele e ver nossos momentos mais felizes sempre que o momento estiver difícil, um mural para nos lembrar o porque estamos aqui, lutando todos os dias contra nosso ego para que um dia sejamos a melhor versão de si para o outro.

Eu te amo como nunca amei ninguém Princesa e pretendo sempre te amar ❤`,
    customMusicUrl: '',
    isPlaying: false,
    currentTrack: 1,
    audioInitialized: false,
    synthFallbackActive: false,
    db: null,
    highestZ: 10,
    isScrubbing: false
};

// Tracks Românticas (Utiliza SoundHelix como links estáveis, e Synth procedural como Fallback)
const tracks = [
    { id: 1, title: "5 Estrelas Part. II (Cartel MCs)", artist: "Cartel MCs", url: "Cartel MCs - 5 Estrelas Part. II.mp3?v=3" },
    { id: 2, title: "Psiu (Liniker)", artist: "Liniker", url: "Psiu - Liniker.mp3?v=3" },
    { id: 3, title: "Pés no Chão (Delacruz)", artist: "Delacruz", url: "Pés no chão - Delacruz.mp3?v=3" }
];

/* ==========================================================================
   Banco de Dados Local (IndexedDB) para Fotos Polaroid
   ========================================================================== */

const DB_NAME = 'LoveGalleryDB';
const DB_VERSION = 1;
const STORE_NAME = 'polaroids';

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error("Erro ao abrir IndexedDB:", event);
            reject(event);
        };

        request.onsuccess = (event) => {
            state.db = event.target.result;
            resolve(state.db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

function getAllPolaroids() {
    return new Promise((resolve, reject) => {
        if (!state.db) return resolve([]);
        const transaction = state.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function savePolaroid(polaroid) {
    return new Promise((resolve, reject) => {
        if (!state.db) return reject("DB não inicializado");
        const transaction = state.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(polaroid);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function deletePolaroidFromDB(id) {
    return new Promise((resolve, reject) => {
        if (!state.db) return reject("DB não inicializado");
        const transaction = state.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function clearAllPolaroidsFromDB() {
    return new Promise((resolve, reject) => {
        if (!state.db) return reject("DB não inicializado");
        const transaction = state.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/* ==========================================================================
   Física de Partículas (Canvas Heart Rain & Confetti Burst)
   ========================================================================== */

const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const particleEmojis = ['❤️', '💖', '🌸', '✨', '🎈', '💕', '🌹', '💐', '💓', '💗', '💌', '🎉'];

class Particle {
    constructor(x, y, isBurst = false) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 16 + 14;
        
        // Se for uma explosão, vai pra todas as direções. Se não, flutua suavemente para cima.
        if (isBurst) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 3;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - 2; // Leve impulso para cima
        } else {
            this.vx = Math.random() * 2 - 1;
            this.vy = -(Math.random() * 2 + 1);
        }
        
        this.emoji = particleEmojis[Math.floor(Math.random() * particleEmojis.length)];
        this.alpha = 1;
        this.fade = Math.random() * 0.015 + 0.005;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.04 - 0.02;
        this.gravity = isBurst ? 0.15 : 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity; // Gravidade afeta a curva
        this.rotation += this.rotationSpeed;
        this.alpha -= this.fade;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.alpha;
        ctx.font = `${this.size}px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.emoji, 0, 0);
        ctx.restore();
    }
}

function spawnBurst(x, y) {
    for (let i = 0; i < 60; i++) {
        particlesArray.push(new Particle(x, y, true));
    }
}

function handleParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Pequena probabilidade de flutuar coraÃ§Ãµes normais no fundo constantemente
    if (Math.random() < 0.05 && particlesArray.length < 150) {
        particlesArray.push(new Particle(Math.random() * canvas.width, canvas.height + 20, false));
    }

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();

        if (particlesArray[i].alpha <= 0) {
            particlesArray.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(handleParticles);
}
requestAnimationFrame(handleParticles);

// Adiciona partÃ­culas ao clicar na tela
window.addEventListener('click', (e) => {
    // Apenas se nÃ£o clicar em botÃµes/inputs
    if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.closest('.polaroid-item') && !e.target.closest('.config-drawer')) {
        for (let i = 0; i < 5; i++) {
            particlesArray.push(new Particle(e.clientX, e.clientY, true));
        }
    }
});

/* ==========================================================================
   LÃ³gica do Envelope
   ========================================================================== */

const envelope = document.getElementById('envelope');
const mainView = document.getElementById('main-view');
const loveCard = document.getElementById('love-card');
const waxSeal = document.getElementById('wax-seal');
const instructionText = document.getElementById('instruction-text');

waxSeal.addEventListener('click', (e) => {
    e.stopPropagation();
    envelope.classList.add('open');
    instructionText.style.opacity = '0';
    
    // ExplosÃ£o de coraÃ§Ãµes
    const rect = waxSeal.getBoundingClientRect();
    spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    
    // Tocar mÃºsica
    initAudio();
    togglePlayState(true);

    // Espera a animaÃ§Ã£o do papel subir e depois exibe o cartÃ£o principal
    setTimeout(() => {
        document.getElementById('envelope-scene').style.opacity = '0';
        document.getElementById('envelope-scene').style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            document.getElementById('envelope-scene').style.display = 'none';
            loveCard.style.display = 'flex';
            
            // Renderiza polaroids salvas apÃ³s abrir
            renderAllPolaroids();
        }, 500);
    }, 1200);
});

/* ==========================================================================
   Sistema de Abas
   ========================================================================== */

const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(targetTab).classList.add('active');

        // Reinicia posiÃ§Ãµes das polaroids se for para a aba galeria (garante posicionamento correto)
        if (targetTab === 'tab-gallery') {
            adjustPolaroidPositions();
        }
    });
});

/* ==========================================================================
   Trilha Sonora & Player de MÃºsica (Procedural Audio + HTML5 Audio)
   ========================================================================== */

const bgAudio = document.getElementById('bg-audio');
const playPauseBtn = document.getElementById('play-pause-btn');
const quickMusicBtn = document.getElementById('quick-music-btn');
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.getElementById('volume-icon');
const progressSlider = document.getElementById('progress-slider');
const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const vinylDisc = document.getElementById('vinyl-disc');
const vinylTonearm = document.getElementById('vinyl-tonearm');
const trackOptions = document.querySelectorAll('.track-option');
const prevTrackBtn = document.getElementById('prev-track');
const nextTrackBtn = document.getElementById('next-track');

// Web Audio API Synthesizer (Fallback de SeguranÃ§a RomÃ¢ntico)
let audioCtx = null;
let synthInterval = null;
let currentSynthNote = 0;
// ProgressÃ£o de acordes melancÃ³licos: Am - Dm9 - Fmaj7 - E7
const chords = [
    [220.00, 261.63, 329.63, 392.00], // Am7 (A3, C4, E4, G4)
    [146.83, 174.61, 220.00, 261.63], // Dm9 (D3, F3, A3, C4)
    [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
    [164.81, 207.65, 246.94, 293.66]  // E7 (E3, G#3, B3, D4)
];

function initAudio() {
    if (state.audioInitialized) return;
    
    // Configura HTML5 audio
    loadTrack(state.currentTrack);
    bgAudio.volume = volumeSlider.value;

    // Atualiza barra de progresso
    bgAudio.addEventListener('timeupdate', () => {
        if (!state.synthFallbackActive && !state.isScrubbing) {
            const percent = (bgAudio.currentTime / bgAudio.duration) * 100;
            progressSlider.value = isNaN(percent) ? 0 : percent;
            timeCurrent.textContent = formatTime(bgAudio.currentTime);
            timeTotal.textContent = formatTime(bgAudio.duration);
        }
    });

    bgAudio.addEventListener('loadedmetadata', () => {
        timeTotal.textContent = formatTime(bgAudio.duration);
    });

    // AvanÃ§a para prÃ³xima faixa quando terminar
    bgAudio.addEventListener('ended', () => {
        changeTrack(1);
    });

    state.audioInitialized = true;
}

function playSynthFallback() {
    if (synthInterval) clearInterval(synthInterval);
    
    // Inicializa Web Audio API se necessÃ¡rio
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    state.synthFallbackActive = true;
    let chordIndex = 0;

    // FunÃ§Ã£o para tocar uma nota suave do sintetizador
    function playNote(freq, startTime, duration) {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = 'sine'; // Som senoidal extremamente suave e melancÃ³lico
        osc.frequency.setValueAtTime(freq, startTime);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, startTime); // Corta ainda mais agudos
        filter.frequency.exponentialRampToValueAtTime(100, startTime + duration);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.04 * volumeSlider.value, startTime + 0.1); // Volume reduzido para 0.04 para ficar bem baixo
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Release longo

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    // Loop de reproduÃ§Ã£o dos acordes romÃ¢nticos procedurais
    function playChordLoop() {
        const now = audioCtx.currentTime;
        const duration = 2.8;
        const notes = chords[chordIndex];
        
        // Toca as notas do acorde com um arpejo curtinho
        notes.forEach((freq, idx) => {
            playNote(freq, now + idx * 0.08, duration - idx * 0.08);
        });

        // Alterna entre uma melodia aguda aleatÃ³ria na escala de dÃ³ maior pentatÃ´nica
        const melodyScale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6
        if (Math.random() > 0.3) {
            const mFreq = melodyScale[Math.floor(Math.random() * melodyScale.length)];
            playNote(mFreq, now + 0.8, 0.6);
        }
        if (Math.random() > 0.5) {
            const mFreq2 = melodyScale[Math.floor(Math.random() * melodyScale.length)];
            playNote(mFreq2, now + 1.6, 0.6);
        }

        chordIndex = (chordIndex + 1) % chords.length;
    }

    playChordLoop();
    synthInterval = setInterval(playChordLoop, 3000);

    // Mock progress bar
    let mockPercent = 0;
    progressSlider.value = 0;
    timeTotal.textContent = "âˆž";
}

function stopSynthFallback() {
    if (synthInterval) {
        clearInterval(synthInterval);
        synthInterval = null;
    }
    state.synthFallbackActive = false;
}

function loadTrack(trackId) {
    let track;
    if (trackId === 'custom') {
        track = {
            id: 'custom',
            title: "Sua Trilha Sonora",
            artist: "MÃºsica Personalizada",
            url: state.customMusicUrl
        };
    } else {
        track = tracks.find(t => t.id === parseInt(trackId));
    }
    if (!track) return;
    
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    
    // Atualiza classes ativas
    trackOptions.forEach(opt => {
        const optTrack = opt.getAttribute('data-track');
        if (optTrack === String(trackId)) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });

    state.currentTrack = trackId;
    bgAudio.src = track.url;
    bgAudio.load();
}

function togglePlayState(shouldPlay) {
    if (shouldPlay === undefined) {
        state.isPlaying = !state.isPlaying;
    } else {
        state.isPlaying = shouldPlay;
    }

    if (state.isPlaying) {
        initAudio();
        
        // Tenta tocar o Ã¡udio do HTML5
        bgAudio.play()
            .then(() => {
                state.synthFallbackActive = false;
                stopSynthFallback();
            })
            .catch(err => {
                console.warn("HTML5 Audio bloqueado ou offline. Ativando Sintetizador de Fallback procedural:", err);
                playSynthFallback();
            });

        playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        quickMusicBtn.classList.add('playing');
        vinylDisc.classList.add('playing');
    } else {
        bgAudio.pause();
        stopSynthFallback();
        playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        quickMusicBtn.classList.remove('playing');
        vinylDisc.classList.remove('playing');
    }
}

function changeTrack(direction) {
    if (state.currentTrack === 'custom') {
        loadTrack(direction > 0 ? 1 : tracks.length);
        if (state.isPlaying) bgAudio.play().catch(() => playSynthFallback());
        return;
    }
    let nextId = state.currentTrack + direction;
    if (nextId > tracks.length) {
        if (state.customMusicUrl) {
            nextId = 'custom';
        } else {
            nextId = 1;
        }
    } else if (nextId < 1) {
        if (state.customMusicUrl) {
            nextId = 'custom';
        } else {
            nextId = tracks.length;
        }
    }
    
    loadTrack(nextId);
    if (state.isPlaying) {
        bgAudio.play().catch(() => playSynthFallback());
    }
}

// Event Listeners do Player de MÃºsica
playPauseBtn.addEventListener('click', () => togglePlayState());
quickMusicBtn.addEventListener('click', () => togglePlayState());

prevTrackBtn.addEventListener('click', () => changeTrack(-1));
nextTrackBtn.addEventListener('click', () => changeTrack(1));

trackOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        const trackVal = opt.getAttribute('data-track');
        const id = (trackVal === 'custom') ? 'custom' : parseInt(trackVal);
        loadTrack(id);
        togglePlayState(true);
    });
});

volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    bgAudio.volume = val;
    
    // Atualiza Ã­cone
    if (val === 0) volumeIcon.className = 'fa-solid fa-volume-xmark';
    else if (val < 0.4) volumeIcon.className = 'fa-solid fa-volume-low';
    else volumeIcon.className = 'fa-solid fa-volume-high';

    // Se estiver no Synth procedural, ajusta volume em tempo real
    if (state.synthFallbackActive && state.isPlaying) {
        playSynthFallback();
    }
});

progressSlider.addEventListener('mousedown', () => { state.isScrubbing = true; });
progressSlider.addEventListener('touchstart', () => { state.isScrubbing = true; });

progressSlider.addEventListener('input', (e) => {
    if (bgAudio.duration) {
        state.isScrubbing = true;
        const time = (parseFloat(e.target.value) / 100) * bgAudio.duration;
        timeCurrent.textContent = formatTime(time);
    }
});

progressSlider.addEventListener('change', (e) => {
    if (!state.synthFallbackActive && bgAudio.duration) {
        const time = (parseFloat(e.target.value) / 100) * bgAudio.duration;
        bgAudio.currentTime = time;
    }
    state.isScrubbing = false;
});

function formatTime(secs) {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

/* ==========================================================================
   Mural de Fotos Polaroid (Drag, Drop, IndexedDB & Upload)
   ========================================================================== */

const polaroidTable = document.getElementById('polaroid-table');
const uploadPhotoInput = document.getElementById('upload-photo');
const emptyGalleryMsg = document.getElementById('empty-gallery-msg');
const zoomModal = document.getElementById('zoom-modal');
const zoomImg = document.getElementById('zoom-img');
const zoomText = document.getElementById('zoom-text');
const zoomDate = document.getElementById('zoom-date');
const modalClose = document.getElementById('modal-close');

// Trata o drag and drop das polaroids
let activeDragItem = null;
let dragStartX = 0;
let dragStartY = 0;
let itemStartX = 0;
let itemStartY = 0;

function setupPolaroidEvents(item, polaroidData) {
    // 1. Arrastar com Mouse & Touch
    item.addEventListener('pointerdown', (e) => {
        // Se clicar em botÃµes internos ou legenda focada, nÃ£o inicia drag
        if (e.target.closest('.polaroid-actions') || e.target.closest('.caption-text') || e.target.tagName === 'INPUT') {
            return;
        }

        e.preventDefault();
        activeDragItem = item;
        
        // Trazer o item atual para frente de todos
        state.highestZ++;
        item.style.zIndex = state.highestZ;
        polaroidData.zIndex = state.highestZ;

        const rect = item.getBoundingClientRect();
        const tableRect = polaroidTable.getBoundingClientRect();
        
        // PosiÃ§Ã£o inicial do cursor
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        
        // PosiÃ§Ã£o inicial do item em relaÃ§Ã£o Ã  mesa (.polaroid-table)
        itemStartX = rect.left - tableRect.left;
        itemStartY = rect.top - tableRect.top;
        
        item.style.cursor = 'grabbing';
        item.setPointerCapture(e.pointerId);
    });

    item.addEventListener('pointermove', (e) => {
        if (activeDragItem !== item) return;
        e.preventDefault();

        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        
        let newX = itemStartX + deltaX;
        let newY = itemStartY + deltaY;

        // Limites da mesa
        const tableRect = polaroidTable.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        
        const maxX = tableRect.width - itemRect.width;
        const maxY = tableRect.height - itemRect.height;
        
        // RestriÃ§Ã£o opcional de bordas
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        // Converte para porcentagem para manter posiÃ§Ãµes proporcionais no resize
        const pctX = (newX / tableRect.width) * 100;
        const pctY = (newY / tableRect.height) * 100;

        item.style.left = `${pctX}%`;
        item.style.top = `${pctY}%`;
        
        polaroidData.x = pctX;
        polaroidData.y = pctY;
    });

    item.addEventListener('pointerup', (e) => {
        if (activeDragItem !== item) return;
        activeDragItem = null;
        item.style.cursor = 'grab';
        item.releasePointerCapture(e.pointerId);

        // Salva novas posiÃ§Ãµes X/Y no IndexedDB
        savePolaroid(polaroidData);
    });

    // 2. Dois cliques para focar (Zoom Modal)
    item.addEventListener('dblclick', () => {
        zoomImg.src = polaroidData.image;
        zoomText.textContent = polaroidData.caption;
        zoomDate.textContent = formatDateString(polaroidData.date);
        zoomModal.style.display = 'flex';
    });

    // 3. EdiÃ§Ã£o de Legenda em Tempo Real (In-place edit)
    const captionEl = item.querySelector('.caption-text');
    captionEl.addEventListener('blur', () => {
        const text = captionEl.textContent.trim();
        polaroidData.caption = text || "Sem legenda";
        captionEl.textContent = polaroidData.caption;
        savePolaroid(polaroidData);
    });
    
    captionEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            captionEl.blur(); // Perder o foco salva
        }
    });

    // 4. EdiÃ§Ã£o de data ao clicar na data ou no botÃ£o de calendÃ¡rio
    const dateEl = item.querySelector('.polaroid-date');
    const dateBtn = item.querySelector('.p-act-btn.date-edit-btn');
    
    function triggerDateEdit() {
        if (item.querySelector('.date-editor')) return;
        
        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.value = polaroidData.date;
        dateInput.className = 'date-editor';
        
        // Estilos visuais para garantir que o input apareÃ§a de forma limpa sobre a Polaroid
        dateInput.style.position = 'absolute';
        dateInput.style.bottom = '2px';
        dateInput.style.left = '5px';
        dateInput.style.width = 'calc(100% - 10px)';
        dateInput.style.fontSize = '12px';
        dateInput.style.fontFamily = 'inherit';
        dateInput.style.border = '1px solid var(--primary-color)';
        dateInput.style.borderRadius = '4px';
        dateInput.style.background = '#fff';
        dateInput.style.padding = '2px';
        dateInput.style.textAlign = 'center';
        dateInput.style.zIndex = '99';
        
        dateEl.style.visibility = 'hidden';
        item.appendChild(dateInput);
        dateInput.focus();

        // MÃ©todo padrÃ£o moderno do HTML5 para abrir o pop-up do calendÃ¡rio diretamente
        if (typeof dateInput.showPicker === 'function') {
            try {
                dateInput.showPicker();
            } catch (e) {
                console.warn("showPicker falhou ou foi bloqueado:", e);
            }
        }

        function finishDateEdit() {
            if (dateInput.parentNode) {
                polaroidData.date = dateInput.value;
                dateEl.innerHTML = `<i class="fa-regular fa-calendar" style="margin-right: 4px;"></i>${formatDateString(polaroidData.date)}`;
                dateEl.style.visibility = 'visible';
                dateInput.remove();
                savePolaroid(polaroidData);
            }
        }

        dateInput.addEventListener('blur', finishDateEdit);
        dateInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') finishDateEdit();
        });
    }

    dateEl.addEventListener('click', triggerDateEdit);
    if (dateBtn) {
        dateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerDateEdit();
        });
    }

    // 5. BotÃµes de aÃ§Ã£o rÃ¡pida (Deletar)
    const delBtn = item.querySelector('.p-act-btn.delete');
    delBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (confirm("Quer mesmo deletar esta foto da galeria?")) {
            await deletePolaroidFromDB(polaroidData.id);
            item.remove();
            checkEmptyGallery();
        }
    });

    // 6. BotÃ£o de Foco rÃ¡pido (Celulares que nÃ£o tem dblclick fÃ¡cil)
    const zoomBtn = item.querySelector('.p-act-btn.focus');
    zoomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        zoomImg.src = polaroidData.image;
        zoomText.textContent = polaroidData.caption;
        zoomDate.textContent = formatDateString(polaroidData.date);
        zoomModal.style.display = 'flex';
    });
}

async function checkEmptyGallery() {
    try {
        const polaroids = await getAllPolaroids();
        const muralLoaded = localStorage.getItem("mural_loaded_v3");
        
        // Se ainda não carregou o mural.json v3 nesta origem/navegador, força o recarregamento com legendas limpas
        if (muralLoaded !== "true") {
            try {
                const res = await fetch('mural.json?v=3');
                if (res.ok) {
                    const parsedData = await res.json();
                    if (parsedData && Array.isArray(parsedData.polaroids) && parsedData.polaroids.length > 0) {
                        // Limpa o banco para remover qualquer imagem default ou resíduo antigo com codificação incorreta
                        await clearAllPolaroidsFromDB();
                        
                        for (const p of parsedData.polaroids) {
                            delete p.id;
                            await savePolaroid(p);
                        }
                        localStorage.setItem("mural_loaded_v3", "true");
                        emptyGalleryMsg.style.display = 'none';
                        await renderAllPolaroids();
                        return;
                    }
                }
            } catch (err) {
                console.log("mural.json não encontrado ou erro ao importar:", err);
            }
        }
        
        // Fallback: Se o banco estiver zerado (e sem mural.json), mostra mensagem vazia e carrega ilustração padrão
        if (polaroids.length === 0) {
            emptyGalleryMsg.style.display = 'block';
            
            fetch('default-photo.png')
                .then(res => {
                    if (!res.ok) throw new Error("Sem foto padrÃ£o");
                    return res.blob();
                })
                .then(blob => {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64data = reader.result;
                        const defaultPolaroid = {
                            image: base64data,
                            caption: "NÃ³s Dois â¤ï¸",
                            date: new Date().toISOString().split('T')[0],
                            x: 35,
                            y: 25,
                            rotate: -4,
                            zIndex: 10
                        };
                        const id = await savePolaroid(defaultPolaroid);
                        defaultPolaroid.id = id;
                        emptyGalleryMsg.style.display = 'none';
                        createPolaroidElement(defaultPolaroid);
                    };
                    reader.readAsDataURL(blob);
                })
                .catch(err => {
                    console.log("Foto padrÃ£o indisponÃ­vel ou offline:", err);
                });
        } else {
            emptyGalleryMsg.style.display = 'none';
        }
    } catch (e) {
        console.error(e);
    }
}

// Gera e posiciona a Polaroid no DOM
function createPolaroidElement(data) {
    const item = document.createElement('div');
    item.className = 'polaroid-item';
    item.style.left = `${data.x}%`;
    item.style.top = `${data.y}%`;
    item.style.zIndex = data.zIndex;
    item.style.transform = `rotate(${data.rotate}deg)`;
    item.id = `polaroid-${data.id}`;

    item.innerHTML = `
        <div class="polaroid-actions">
            <button class="p-act-btn focus" title="Zoom"><i class="fa-solid fa-expand"></i></button>
            <button class="p-act-btn date-edit-btn" title="Alterar Data"><i class="fa-solid fa-calendar-days"></i></button>
            <button class="p-act-btn delete" title="Deletar"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="polaroid-img-wrapper">
            <img src="${data.image}" alt="LembranÃ§a">
        </div>
        <div class="polaroid-caption">
            <span class="caption-text" contenteditable="true">${data.caption}</span>
            <span class="polaroid-date"><i class="fa-regular fa-calendar" style="margin-right: 4px;"></i>${formatDateString(data.date)}</span>
        </div>
    `;

    setupPolaroidEvents(item, data);
    polaroidTable.appendChild(item);
}

// Renderiza todas as polaroids carregadas do banco local
async function renderAllPolaroids() {
    // Limpa fotos renderizadas (menos a mensagem vazia)
    const items = polaroidTable.querySelectorAll('.polaroid-item');
    items.forEach(it => it.remove());

    const polaroids = await getAllPolaroids();
    
    if (polaroids.length > 0) {
        emptyGalleryMsg.style.display = 'none';
        
        // Define o maior z-index
        polaroids.forEach(p => {
            if (p.zIndex > state.highestZ) state.highestZ = p.zIndex;
            createPolaroidElement(p);
        });
    } else {
        emptyGalleryMsg.style.display = 'block';
    }
}

// MantÃ©m polaroids dentro do quadrado visÃ­vel no resize
function adjustPolaroidPositions() {
    const items = polaroidTable.querySelectorAll('.polaroid-item');
    const tableRect = polaroidTable.getBoundingClientRect();
    
    items.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        let leftPct = parseFloat(item.style.left);
        let topPct = parseFloat(item.style.top);

        const leftPx = (leftPct / 100) * tableRect.width;
        const topPx = (topPct / 100) * tableRect.height;

        const maxXPx = tableRect.width - itemRect.width;
        const maxYPx = tableRect.height - itemRect.height;

        if (leftPx > maxXPx && maxXPx > 0) {
            item.style.left = `${(maxXPx / tableRect.width) * 100}%`;
        }
        if (topPx > maxYPx && maxYPx > 0) {
            item.style.top = `${(maxYPx / tableRect.height) * 100}%`;
        }
    });
}

// Lida com Upload de Nova Foto
uploadPhotoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        const imgDataUrl = event.target.result;
        
        // Define posiÃ§Ãµes aleatÃ³rias centralizadas
        const randX = Math.random() * 40 + 20; // 20% a 60%
        const randY = Math.random() * 40 + 20;
        const randRotate = Math.random() * 24 - 12; // -12deg a 12deg
        state.highestZ++;

        const newPhoto = {
            image: imgDataUrl,
            caption: "Clique para editar",
            date: new Date().toISOString().split('T')[0],
            x: randX,
            y: randY,
            rotate: Math.round(randRotate),
            zIndex: state.highestZ
        };

        const id = await savePolaroid(newPhoto);
        newPhoto.id = id;
        
        emptyGalleryMsg.style.display = 'none';
        createPolaroidElement(newPhoto);
        
        // Limpa input
        uploadPhotoInput.value = '';
    };
    reader.readAsDataURL(file);
});

// Formatador de data fofo
function formatDateString(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    // Formato Brasileiro: DD/MM/AAAA
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Fechar Zoom Modal
modalClose.addEventListener('click', () => zoomModal.style.display = 'none');
zoomModal.addEventListener('click', (e) => {
    if (e.target === zoomModal) zoomModal.style.display = 'none';
});

/* ==========================================================================
   ExportaÃ§Ã£o e ImportaÃ§Ã£o de Backup (.love)
   ========================================================================== */

const exportBtn = document.getElementById('export-btn');
const importPhotoInput = document.getElementById('import-photo');

exportBtn.addEventListener('click', async () => {
    const polaroids = await getAllPolaroids();
    if (polaroids.length === 0) {
        alert("Adicione algumas fotos antes de exportar!");
        return;
    }

    const backupData = {
        app: 'ValentineCardApp',
        version: 1.0,
        exportedAt: new Date().toISOString(),
        polaroids: polaroids
    };

    const dataStr = JSON.stringify(backupData);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'nossas-lembrancas.love';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
});

importPhotoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const parsedData = JSON.parse(event.target.result);
            if (parsedData.app !== 'ValentineCardApp' || !Array.isArray(parsedData.polaroids)) {
                throw new Error("Formato de arquivo inválido. Deve ser um backup .love válido.");
            }

            if (confirm("Ao importar, suas fotos atuais na galeria deste navegador serão substituídas. Continuar?")) {
                await clearAllPolaroidsFromDB();
                
                // Insere as novas no DB
                for (const p of parsedData.polaroids) {
                    // Remove ID antigo para autogerar novos limpos
                    delete p.id;
                    await savePolaroid(p);
                }

                await renderAllPolaroids();
                alert("Mural de fotos importado com sucesso! 🎉");
            }
        } catch (err) {
            alert("Erro ao ler o arquivo de amor: " + err.message);
        }
        importPhotoInput.value = '';
    };
    reader.readAsText(file);
});



/* ==========================================================================
   Configurações Dinâmicas & Gaveta de Personalização
   ========================================================================== */

const configBtn = document.getElementById('config-btn');
const closeConfigBtn = document.getElementById('close-config-btn');
const configDrawer = document.getElementById('config-drawer');
const generateLinkBtn = document.getElementById('generate-link-btn');

const inputFrom = document.getElementById('cfg-from');
const inputTo = document.getElementById('cfg-to');
const inputLetterText = document.getElementById('cfg-letter');
const inputMusicUrl = document.getElementById('cfg-music-url');
const themeSelectButtons = document.querySelectorAll('.theme-select-btn');

// Elementos renderizados
const textDestinatario = document.querySelectorAll('.destinatario-text');
const textRemetente = document.querySelectorAll('.remetente-text');
const textCartaCompleta = document.getElementById('customized-letter-text');
const previewFrom = document.getElementById('preview-from');
const previewTo = document.getElementById('preview-to');

// Preenche dados padrÃ£o no formulÃ¡rio
inputLetterText.value = state.letterText;
if (inputMusicUrl) inputMusicUrl.value = state.customMusicUrl;

// Abre/Fecha Gaveta
configBtn.addEventListener('click', () => {
    configDrawer.classList.toggle('active');
});

closeConfigBtn.addEventListener('click', () => {
    configDrawer.classList.remove('active');
});

// Fecha gaveta ao clicar fora dela
window.addEventListener('click', (e) => {
    if (configDrawer.classList.contains('active') && !configDrawer.contains(e.target) && !configBtn.contains(e.target)) {
        configDrawer.classList.remove('active');
    }
});

// Escuta alteraÃ§Ãµes de texto e atualiza o DOM em tempo real
inputFrom.addEventListener('input', (e) => {
    state.fromName = e.target.value || 'VocÃª';
    textRemetente.forEach(el => el.textContent = state.fromName);
    previewFrom.textContent = state.fromName;
});

inputTo.addEventListener('input', (e) => {
    state.toName = e.target.value || 'Meu Amor';
    textDestinatario.forEach(el => el.textContent = state.toName);
    previewTo.textContent = state.toName;
});

inputLetterText.addEventListener('input', (e) => {
    state.letterText = e.target.value;
    textCartaCompleta.innerHTML = state.letterText.replace(/\n/g, '<br>');
});

inputMusicUrl.addEventListener('input', (e) => {
    state.customMusicUrl = e.target.value.trim();
    updateCustomTrackUi();
});

function updateCustomTrackUi() {
    const customOpt = document.getElementById('track-option-custom');
    if (!customOpt) return;
    if (state.customMusicUrl) {
        customOpt.style.display = 'inline-flex';
        loadTrack('custom');
        togglePlayState(true);
    } else {
        customOpt.style.display = 'none';
        if (state.currentTrack === 'custom') {
            loadTrack(1);
            togglePlayState(state.isPlaying);
        }
    }
}

// Troca de Temas
themeSelectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        themeSelectButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const targetTheme = btn.getAttribute('data-theme');
        
        // Remove temas antigos
        document.body.className = '';
        document.body.classList.add(targetTheme);
        state.theme = targetTheme;
    });
});

/* ==========================================================================
   Codificador e Leitor de Link (URL Hash Engine)
   ========================================================================== */

generateLinkBtn.addEventListener('click', () => {
    const configToSave = {
        f: state.fromName,
        t: state.toName,
        l: state.letterText,
        th: state.theme,
        m: state.customMusicUrl
    };

    try {
        // Converte pra string de JSON -> Escapa caracteres especiais de português -> Base64
        const jsonStr = JSON.stringify(configToSave);
        const encoded = btoa(unescape(encodeURIComponent(jsonStr)));
        
        // Cria link completo com hash
        const shareUrl = `${window.location.origin}${window.location.pathname}#amor=${encoded}`;
        
        // Copia para Área de Transferência
        navigator.clipboard.writeText(shareUrl).then(() => {
            // Pequeno balão/feedback
            const originalText = generateLinkBtn.innerHTML;
            generateLinkBtn.innerHTML = '<i class="fa-solid fa-check"></i> Link Copiado!';
            generateLinkBtn.style.background = '#2a9d8f';
            
            setTimeout(() => {
                generateLinkBtn.innerHTML = originalText;
                generateLinkBtn.style.background = '';
            }, 2000);
            
            // Lança corações festivos
            spawnBurst(window.innerWidth / 2, window.innerHeight / 2);
        }).catch(err => {
            console.error("Falha ao copiar:", err);
            alert("Não foi possível copiar automaticamente. Copie este link:\n" + shareUrl);
        });

    } catch (e) {
        console.error("Erro ao gerar link:", e);
        alert("Ocorreu um erro ao gerar o seu link de amor.");
    }
});

// Decodifica a URL ao abrir
function loadCustomSettingsFromUrl() {
    const hash = window.location.hash;
    if (!hash.startsWith('#amor=')) return;

    try {
        const base64Data = hash.substring(6);
        // Base64 -> Decodifica UTF-8 -> String de JSON -> Objeto
        const jsonStr = decodeURIComponent(escape(atob(base64Data)));
        const decodedConfig = JSON.parse(jsonStr);

        // Aplica o tema
        if (decodedConfig.th) {
            state.theme = decodedConfig.th;
            document.body.className = '';
            document.body.classList.add(state.theme);
            
            // Atualiza botões do Drawer
            themeSelectButtons.forEach(btn => {
                if (btn.getAttribute('data-theme') === state.theme) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }

        // Aplica nomes
        if (decodedConfig.f) {
            state.fromName = decodedConfig.f;
            inputFrom.value = state.fromName;
            textRemetente.forEach(el => el.textContent = state.fromName);
            previewFrom.textContent = state.fromName;
        }

        if (decodedConfig.t) {
            state.toName = decodedConfig.t;
            inputTo.value = state.toName;
            textDestinatario.forEach(el => el.textContent = state.toName);
            previewTo.textContent = state.toName;
        }

        // Aplica carta
        if (decodedConfig.l) {
            state.letterText = decodedConfig.l;
            inputLetterText.value = state.letterText;
            textCartaCompleta.innerHTML = state.letterText.replace(/\n/g, '<br>');
        }

        // Aplica música customizada
        if (decodedConfig.m) {
            state.customMusicUrl = decodedConfig.m;
            if (inputMusicUrl) inputMusicUrl.value = state.customMusicUrl;
            updateCustomTrackUi();
        }

        console.log("Configurações românticas customizadas carregadas com sucesso via URL!");

    } catch (e) {
        console.error("Erro ao ler hash da URL:", e);
    }
}

/* ==========================================================================
   Inicialização
   ========================================================================== */

window.addEventListener('DOMContentLoaded', async () => {
    // 1. Inicializa IndexedDB
    try {
        await initDB();
        checkEmptyGallery();
    } catch (e) {
        console.warn("IndexedDB indisponível. Fotos não serão salvas após recarregar.", e);
    }

    // 2. Carrega configurações da URL se existirem
    loadCustomSettingsFromUrl();

    // 3. Aplica nomes iniciais
    textRemetente.forEach(el => el.textContent = state.fromName);
    textDestinatario.forEach(el => el.textContent = state.toName);
    previewFrom.textContent = state.fromName;
    previewTo.textContent = state.toName;
    textCartaCompleta.innerHTML = state.letterText.replace(/\n/g, '<br>');
});
