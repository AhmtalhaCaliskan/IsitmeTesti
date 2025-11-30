// Yapılandırma
const config = {
    // Standart test frekansları (yüksekten düşüğe) - Detaylı aralıklar
    frequencies: [
        16000, 15000, 14000, 13000, 12000, 11000, 10000, 9000, 8000, 7000, 6000, 5500,
        5000, 4500, 4000, 3500, 3000, 2500, 2000, 1500, 1000, 750, 500, 375, 250, 
        200, 125, 100, 75, 60, 50, 40
    ],
    
    // Yaş gruplarına göre normal işitme eşikleri (dB)
    ageThresholds: {
        young: { min: 0, max: 25, maxFreq: 17400, label: "Genç (18-25)" }, // 18-25 yaş
        adult: { min: 0, max: 25, maxFreq: 16000, label: "Yetişkin (25-50)" }, // 25-50 yaş
        middleAged: { min: 0, max: 30, maxFreq: 12000, label: "Orta Yaş (50-65)" }, // 50-65 yaş
        elderly: { min: 0, max: 40, maxFreq: 8000, label: "Yaşlı (65+)" } // 65+ yaş
    },
    
    // Ses seviyesi (dB SPL)
    soundLevel: 60, // Başlangıç seviyesi
    testDuration: 2000 // Milisaniye cinsinden ses süresi
};

// Durum yönetimi
let state = {
    currentScreen: 'welcome',
    age: 30,
    currentFrequency: 0,
    currentFrequencyIndex: 0,
    currentEar: 'right', // 'right' veya 'left'
    testResults: {
        right: {},
        left: {}
    },
    isPlaying: false,
    isPaused: false,
    testStarted: false,
    audioContext: null,
    oscillator: null,
    gainNode: null,
    isWaitingForResponse: false // ← YENİ: Buton tıklama beklemesini kontrol et
};

// Web Audio API başlatıcı
function initAudioContext() {
    if (!state.audioContext) {
        state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Ses üretici fonksiyon
function playTone(frequency, duration) {
    if (!state.audioContext) initAudioContext();
    
    const context = state.audioContext;
    
    // Ses başlatılıysa önce durdur
    stopTone();
    
    // Oscillator ve Gain oluştur
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Ses parametreleri
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    // Ses seviyesi (dB'yi lineer olarak dönüştür)
    const linearGain = Math.pow(10, config.soundLevel / 20) / 100;
    gainNode.gain.setValueAtTime(linearGain, context.currentTime);
    
    // Fade in/out için ADSR envelope
    gainNode.gain.linearRampToValueAtTime(linearGain, context.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(linearGain * 0.5, context.currentTime + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, context.currentTime + duration);
    
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration);
    
    state.oscillator = oscillator;
    state.gainNode = gainNode;
    state.isPlaying = true;
    
    // Ses sona erdikten sonra flag'i güncelle
    setTimeout(() => {
        state.isPlaying = false;
    }, duration * 1000);
}

function stopTone() {
    if (state.oscillator) {
        try {
            state.oscillator.stop();
        } catch (e) {
            // Already stopped
        }
        state.oscillator = null;
    }
    if (state.gainNode) {
        state.gainNode.gain.value = 0;
    }
    state.isPlaying = false;
}

// Ekran geçişi
function switchScreen(screenName) {
    // Tüm ekranları gizle
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Hedef ekranı göster
    const targetScreen = document.getElementById(screenName + 'Screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
        state.currentScreen = screenName;
    }
}

// Yaş grubunu belirle
function getAgeGroup(age) {
    if (age < 26) return 'young';
    if (age < 50) return 'adult';
    if (age < 65) return 'middleAged';
    return 'elderly';
}

// Test frekanslarını yaşa göre ayarla
function adjustFrequenciesForAge(age) {
    const ageGroup = getAgeGroup(age);
    const threshold = config.ageThresholds[ageGroup];
    
    // Yaş grubuna uygun frekansları filtrele
    return config.frequencies.filter(freq => freq <= threshold.maxFreq);
}

// Teste başla
function startTest() {
    const ageInput = document.getElementById('ageInput');
    state.age = parseInt(ageInput.value) || 30;
    
    // Frekansları yaşa göre ayarla
    let adjustedFrequencies = adjustFrequenciesForAge(state.age);
    if (adjustedFrequencies.length === 0) {
        adjustedFrequencies = config.frequencies;
    }
    
    state.frequencies = adjustedFrequencies;
    state.currentFrequencyIndex = 0;
    state.currentEar = 'right';
    state.testResults = { right: {}, left: {} };
    state.testStarted = true;
    state.isWaitingForResponse = false; // ← Reset flag
    
    switchScreen('test');
    runTest();
}

// Test sürüşü
function runTest() {
    // Test bitti mi kontrol et
    if (state.currentFrequencyIndex >= state.frequencies.length) {
        // Sağ kulak bitti, sol kulağa geç
        if (state.currentEar === 'right') {
            state.currentEar = 'left';
            state.currentFrequencyIndex = 0;
            runTest();
            return;
        } else {
            // Her iki kulak da bitti
            showResults();
            return;
        }
    }
    
    state.currentFrequency = state.frequencies[state.currentFrequencyIndex];
    updateTestUI();
    
    // Otomatik olarak sesin oynatılması
    setTimeout(() => {
        if (!state.isPaused) {
            playTone(state.currentFrequency, config.testDuration / 1000);
            
            // Ses oynatıldığını göster
            document.getElementById('soundBar').style.animation = 'none';
            setTimeout(() => {
                document.getElementById('soundBar').style.animation = '';
            }, 10);
        }
    }, 500);
}

// Test UI güncelle
function updateTestUI() {
    const title = state.currentEar === 'right' ? 'Sağ Kulak Testi' : 'Sol Kulak Testi';
    document.getElementById('testTitle').textContent = title;
    document.getElementById('currentFreq').textContent = state.currentFrequency;
    document.getElementById('earInfo').textContent = 
        state.currentEar === 'right' ? 'Sağ kulak test ediliyor...' : 'Sol kulak test ediliyor...';
    
    // Kulağı vurgula
    document.getElementById('rightEar').classList.remove('active');
    document.getElementById('leftEar').classList.remove('active');
    
    if (state.currentEar === 'right') {
        document.getElementById('rightEar').classList.add('active');
    } else {
        document.getElementById('leftEar').classList.add('active');
    }
    
    // İlerleme çubuğu
    const totalSteps = state.frequencies.length * 2;
    const currentStep = (state.currentEar === 'right' ? 0 : state.frequencies.length) + state.currentFrequencyIndex + 1;
    const progress = (currentStep / totalSteps) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

// Kullanıcı "Duydum" butonuna basıyor - İyileştirilmiş
function onHeard() {
    // Eğer test devam etmiyorsa veya test başlamadıysa yoksay
    if (state.isPaused || !state.testStarted) {
        return;
    }
    
    // Eğer ses hala çalmıyorsa ve beklenmiyorsa bu klik hiçbir şey yapmaz
    if (!state.isPlaying && !state.isWaitingForResponse) {
        return;
    }
    
    // Eğer zaten bu frekansı işlediyse yoksay
    if (state.isWaitingForResponse) {
        return;
    }
    
    // Beklemede olduğunu işaretle
    state.isWaitingForResponse = true;
    
    // Sesi durdur
    stopTone();
    
    // Sonucu kaydet: DUYDU
    state.testResults[state.currentEar][state.currentFrequency] = true;
    state.currentFrequencyIndex++;
    
    // Visual feedback
    const heardBtn = document.getElementById('heardBtn');
    const notHeardBtn = document.getElementById('notHeardBtn');
    heardBtn.style.opacity = '0.6';
    heardBtn.style.pointerEvents = 'none';
    notHeardBtn.style.pointerEvents = 'none';
    
    // Sonraki teste geç
    setTimeout(() => {
        heardBtn.style.opacity = '1';
        heardBtn.style.pointerEvents = 'auto';
        notHeardBtn.style.pointerEvents = 'auto';
        state.isWaitingForResponse = false;
        
        if (!state.isPaused) {
            runTest();
        }
    }, 300);
}

// Kullanıcı "Duymadım" butonuna basıyor
function onNotHeard() {
    // Eğer test devam etmiyorsa veya test başlamadıysa yoksay
    if (state.isPaused || !state.testStarted) {
        return;
    }
    
    // Eğer zaten bu frekansı işlediyse yoksay
    if (state.isWaitingForResponse) {
        return;
    }
    
    // Beklemede olduğunu işaretle
    state.isWaitingForResponse = true;
    
    // Sesi durdur
    if (state.isPlaying) {
        stopTone();
    }
    
    // Sonucu kaydet: DUYMADI
    state.testResults[state.currentEar][state.currentFrequency] = false;
    state.currentFrequencyIndex++;
    
    // Visual feedback
    const heardBtn = document.getElementById('heardBtn');
    const notHeardBtn = document.getElementById('notHeardBtn');
    notHeardBtn.style.opacity = '0.6';
    heardBtn.style.pointerEvents = 'none';
    notHeardBtn.style.pointerEvents = 'none';
    
    // Sonraki teste geç
    setTimeout(() => {
        notHeardBtn.style.opacity = '1';
        heardBtn.style.pointerEvents = 'auto';
        notHeardBtn.style.pointerEvents = 'auto';
        state.isWaitingForResponse = false;
        
        if (!state.isPaused) {
            runTest();
        }
    }, 300);
}

// Sonuçları göster
function showResults() {
    switchScreen('results');
    
    // Sonuçları analiz et
    const age = state.age;
    const ageGroup = getAgeGroup(age);
    
    // Sonuçları HTML'ye dönüştür
    const rightEarResults = formatResults(state.testResults.right, age, ageGroup);
    const leftEarResults = formatResults(state.testResults.left, age, ageGroup);
    
    document.getElementById('rightEarResults').innerHTML = rightEarResults.html;
    document.getElementById('leftEarResults').innerHTML = leftEarResults.html;
    
    // Genel tavsiye
    const recommendation = generateRecommendation(rightEarResults, leftEarResults, age);
    const recommendationBox = document.getElementById('recommendationBox');
    document.getElementById('recommendationText').textContent = recommendation.text;
    
    recommendationBox.className = 'recommendation-box ' + recommendation.level;
    
    // Audiogram çiz
    drawAudiogram();
}

// Sonuçları formatla
function formatResults(results, age, ageGroup) {
    const thresholds = config.ageThresholds[ageGroup];
    const unheardFrequencies = [];
    let html = '';
    let hearingLoss = 'normal';
    
    for (const [freq, heard] of Object.entries(results)) {
        const frequency = parseInt(freq);
        if (!heard) {
            unheardFrequencies.push(frequency);
        }
    }
    
    if (unheardFrequencies.length === 0) {
        html = `<p>✅ İyi haberler! Test ettiğimiz tüm frekanslarda normal işitme tespit edilmiştir.</p>`;
        hearingLoss = 'normal';
    } else if (unheardFrequencies.length <= 2) {
        html = `<p>⚠️ Bazı yüksek frekanslarda hafif kayıp tespit edilmiştir: ${unheardFrequencies.join(', ')} Hz</p>`;
        hearingLoss = 'mild';
    } else if (unheardFrequencies.length <= 5) {
        html = `<p>⚠️ Orta düzeyde işitme kaybı tespit edilmiştir. Duymayan frekanslar: ${unheardFrequencies.join(', ')} Hz</p>`;
        hearingLoss = 'moderate';
    } else {
        html = `<p>🔴 Ciddi işitme kaybı tespit edilmiştir. Duymayan frekanslar: ${unheardFrequencies.join(', ')} Hz</p>`;
        hearingLoss = 'severe';
    }
    
    return { html, unheardFrequencies, hearingLoss };
}

// Tavsiye oluştur
function generateRecommendation(rightResults, leftResults, age) {
    let level = 'success';
    let text = '✅ Sonuçlarınıza göre herhangi bir endişe yok. Yolunuza devam edebilirsiniz.';
    
    // Her iki kulakta da ciddi kayıp var mı
    if (rightResults.hearingLoss === 'severe' && leftResults.hearingLoss === 'severe') {
        level = 'danger';
        text = `🔴 HEMEDİ BİR DOKTORA GİTMENİZ ÖNERİLİR!\n\nHer iki kulaklarda ciddi işitme kaybı tespit edilmiştir.\n\n👨‍⚕️ Lütfen en kısa sürede:\n• Odyolog (İşitme Uzmanı)\n• KBB Doktoru (Kulak Burun Boğaz Uzmanı)\nlarından birini ziyaret edin.`;
    }
    // Bir kulakta ciddi kayıp
    else if (rightResults.hearingLoss === 'severe' || leftResults.hearingLoss === 'severe') {
        level = 'danger';
        text = `🔴 DOKTOR ZİYARETİ GEREKLI!\n\nBir kulaklarda ciddi işitme kaybı tespit edilmiştir.\n\n👨‍⚕️ Lütfen en kısa sürede:\n• Odyolog (İşitme Uzmanı)\n• KBB Doktoru (Kulak Burun Boğaz Uzmanı)\nlarından birini ziyaret edin.`;
    }
    // Her iki kulakta da orta düzey kayıp
    else if (rightResults.hearingLoss === 'moderate' && leftResults.hearingLoss === 'moderate') {
        level = 'warning';
        text = `⚠️ DOKTOR ZİYARETİ ÖNERİLİR!\n\nHer iki kulaklarda orta düzey işitme kaybı tespit edilmiştir.\n\n👨‍⚕️ Yakında bir:\n• Odyolog (İşitme Uzmanı)\n• KBB Doktoru (Kulak Burun Boğaz Uzmanı)\nile görüşünüz.`;
    }
    // Bir kulakta orta düzey kayıp
    else if (rightResults.hearingLoss === 'moderate' || leftResults.hearingLoss === 'moderate') {
        level = 'warning';
        text = `⚠️ DOKTOR ZİYARETİ ÖNERİLİR!\n\nBir kulaklarda orta düzey işitme kaybı tespit edilmiştir.\n\n👨‍⚕️ Yakında bir:\n• Odyolog (İşitme Uzmanı)\n• KBB Doktoru (Kulak Burun Boğaz Uzmanı)\nile görüşünüz.`;
    }
    // Hafif kayıp
    else if (rightResults.hearingLoss === 'mild' || leftResults.hearingLoss === 'mild') {
        level = 'warning';
        text = `⚠️ Hafif işitme kaybı tespit edilmiştir.\n\nGözlemlemeyi devam etmeniz önerilir.\n\nEğer semptomlar devam ederse:\n• Odyolog (İşitme Uzmanı)\n• KBB Doktoru (Kulak Burun Boğaz Uzmanı)\nile görüşünüz.`;
    }
    
    return { text, level };
}

// Audiogram çiz
function drawAudiogram() {
    const canvas = document.getElementById('audiogramChart');
    const ctx = canvas.getContext('2d');
    
    const padding = 60;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    
    // Canvas temizle
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid çiz
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Yatay çizgiler
    for (let i = 0; i <= 5; i++) {
        const y = padding + (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }
    
    // Dikey çizgiler
    const freqs = state.frequencies;
    for (let i = 0; i < freqs.length; i++) {
        const x = padding + (width / (freqs.length - 1)) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, canvas.height - padding);
        ctx.stroke();
    }
    
    // Eksenler
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    // Y ekseni (dB)
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();
    
    // X ekseni (Frekans)
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Etiketler
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Frekans etiketleri (sadece belirli frekanslar)
    const displayFreqs = [500, 1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < displayFreqs.length; i++) {
        const freqIndex = freqs.indexOf(displayFreqs[i]);
        if (freqIndex !== -1) {
            const x = padding + (width / (freqs.length - 1)) * freqIndex;
            ctx.fillText(displayFreqs[i] + ' Hz', x, canvas.height - padding + 20);
        }
    }
    
    // dB etiketleri
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
        const y = padding + (height / 5) * i;
        const db = 25 - (i * 5);
        ctx.fillText(db + ' dB', padding - 10, y + 5);
    }
    
    // Başlık
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Audiogram', canvas.width / 2, 25);
    
    // Y ekseni etiketi
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('İşitme Seviyesi (dB HL)', 0, 0);
    ctx.restore();
    
    // X ekseni etiketi
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Frekans (Hz)', canvas.width / 2, canvas.height - 5);
    
    // Verileri çiz (Sağ kulak - mavi, Sol kulak - kırmızı)
    drawEarLine(ctx, state.testResults.right, padding, width, height, freqs, '#2563eb', 'o');
    drawEarLine(ctx, state.testResults.left, padding, width, height, freqs, '#ef4444', 'x');
    
    // Legend
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    // Sağ kulak
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(canvas.width - 180, 20, 10, 10);
    ctx.fillStyle = '#333';
    ctx.fillText('Sağ Kulak', canvas.width - 165, 28);
    
    // Sol kulak
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(canvas.width - 180, 40, 10, 10);
    ctx.fillStyle = '#333';
    ctx.fillText('Sol Kulak', canvas.width - 165, 48);
}

function drawEarLine(ctx, results, padding, width, height, freqs, color, symbol) {
    const points = [];
    
    for (let i = 0; i < freqs.length; i++) {
        const freq = freqs[i];
        const heard = results[freq];
        
        const x = padding + (width / (freqs.length - 1)) * i;
        let y;
        
        if (heard === true) {
            // Duyuldu - 0 dB
            y = padding;
        } else {
            // Duymadı - 25 dB
            y = padding + height;
        }
        
        points.push({ x, y });
    }
    
    // Çizgi çiz
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < points.length; i++) {
        if (i === 0) {
            ctx.moveTo(points[i].x, points[i].y);
        } else {
            ctx.lineTo(points[i].x, points[i].y);
        }
    }
    ctx.stroke();
    
    // Noktaları çiz
    ctx.fillStyle = color;
    for (const point of points) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Sonuçları indir
function downloadResults() {
    const ageGroup = getAgeGroup(state.age);
    const timestamp = new Date().toLocaleString('tr-TR');
    
    let content = `İŞİTME TESTİ SONUÇLARI\n`;
    content += `======================\n\n`;
    content += `Test Tarihi: ${timestamp}\n`;
    content += `Yaş: ${state.age}\n`;
    content += `Yaş Grubu: ${ageGroup}\n\n`;
    
    content += `SAĞ KULAK SONUÇLARI:\n`;
    content += `------------------\n`;
    for (const [freq, heard] of Object.entries(state.testResults.right)) {
        content += `${freq} Hz: ${heard ? 'Duyuldu' : 'Duymadı'}\n`;
    }
    
    content += `\nSOL KULAK SONUÇLARI:\n`;
    content += `------------------\n`;
    for (const [freq, heard] of Object.entries(state.testResults.left)) {
        content += `${freq} Hz: ${heard ? 'Duyuldu' : 'Duymadı'}\n`;
    }
    
    content += `\n\nÖNEMLİ NOT:\n`;
    content += `Bu test profesyonel tıbbi teşhis yerine geçmez.\n`;
    content += `Sonuçlarınızı bir audioloğu veya ENT doktoruyla paylaşınız.\n`;
    
    // İndir
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IsitmeTest_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Modal kapatma
    document.getElementById('closeDisclaimer').addEventListener('click', () => {
        const modal = document.getElementById('disclaimerModal');
        modal.style.display = 'none';
        startTest();
    });
    
    // Hoş geldiniz ekranı butonları
    const startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', () => {
        const modal = document.getElementById('disclaimerModal');
        modal.style.display = 'flex';
    });
    
    const helpBtn = document.getElementById('helpBtn');
    helpBtn.addEventListener('click', () => {
        switchScreen('instructions');
    });
    
    // Talimatlar ekranı butonları
    document.getElementById('backToWelcomeBtn').addEventListener('click', () => {
        switchScreen('welcome');
    });
    
    document.getElementById('continueBtn').addEventListener('click', () => {
        switchScreen('welcome');
    });
    
    // Test ekranı butonları - İyileştirilmiş touch support
    const heardBtn = document.getElementById('heardBtn');
    const notHeardBtn = document.getElementById('notHeardBtn');
    
    // Click listener
    heardBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onHeard();
    });
    
    // Touch listener (mobil için)
    heardBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onHeard();
    });
    
    // Click listener
    notHeardBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onNotHeard();
    });
    
    // Touch listener (mobil için)
    notHeardBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onNotHeard();
    });
    
    document.getElementById('pauseBtn').addEventListener('click', () => {
        state.isPaused = !state.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        if (state.isPaused) {
            pauseBtn.textContent = 'Devam Et';
            stopTone();
        } else {
            pauseBtn.textContent = 'Durdur';
            runTest();
        }
    });
    
    // Sonuçlar ekranı butonları
    document.getElementById('restartBtn').addEventListener('click', () => {
        switchScreen('welcome');
    });
    
    document.getElementById('downloadBtn').addEventListener('click', () => {
        downloadResults();
    });
    
    // Ses seviyesi kontrol (Ctrl+, Ctrl+- ile)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey) {
            if (e.key === '+' || e.key === '=') {
                config.soundLevel = Math.min(100, config.soundLevel + 5);
                console.log('Ses seviyesi:', config.soundLevel, 'dB');
            } else if (e.key === '-') {
                config.soundLevel = Math.max(0, config.soundLevel - 5);
                console.log('Ses seviyesi:', config.soundLevel, 'dB');
            }
        }
    });
});
