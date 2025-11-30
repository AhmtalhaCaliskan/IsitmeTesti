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
    isWaitingForResponse: false,
    currentFrequencyProcessed: false // ← YENİ: Mevcut frekans işlendi mi?
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
    state.isWaitingForResponse = false;
    state.currentFrequencyProcessed = false; // ← RESET: Yeni frekans başladı
    
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
    state.currentFrequencyProcessed = false; // ← RESET: Yeni frekans için flag'i sıfırla
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

// Kullanıcı "Duydum" butonuna basıyor - ÜST ÜSTE BASILAMALI
function onHeard() {
    // Test devam etmiyorsa veya başlamadıysa yoksay
    if (state.isPaused || !state.testStarted) {
        return;
    }
    
    // Mevcut frekans zaten işlendiyse yoksay
    if (state.currentFrequencyProcessed) {
        return;
    }
    
    // Beklemede olduğunu işaretle
    state.isWaitingForResponse = true;
    state.currentFrequencyProcessed = true;
    
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
    }, 250);
}

// Kullanıcı "Duymadım" butonuna basıyor - ÜST ÜSTE BASILAMALI
function onNotHeard() {
    // Test devam etmiyorsa veya başlamadıysa yoksay
    if (state.isPaused || !state.testStarted) {
        return;
    }
    
    // Mevcut frekans zaten işlendiyse yoksay
    if (state.currentFrequencyProcessed) {
        return;
    }
    
    // Beklemede olduğunu işaretle
    state.isWaitingForResponse = true;
    state.currentFrequencyProcessed = true;
    
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
    }, 250);
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

// PDF olarak sonuçları indir
function downloadResults() {
    const timestamp = new Date().toLocaleString('tr-TR');
    const age = state.age;
    const ageGroup = getAgeGroup(age);
    
    // Sonuçları analiz et
    const rightEarResults = formatResults(state.testResults.right, age, ageGroup);
    const leftEarResults = formatResults(state.testResults.left, age, ageGroup);
    
    // PDF içeriği oluştur
    const pdfContent = `
    <div style="font-family: Arial, sans-serif; padding: 30px; color: #333; line-height: 1.6;">
        <!-- Başlık -->
        <div style="text-align: center; border-bottom: 3px solid #1e40af; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0; color: #1e40af; font-size: 28px;">👂 İŞİTME TESTİ SONUÇLARI</h1>
            <p style="margin: 10px 0 0 0; color: #666; font-size: 14px;">Profesyonel İşitme Değerlendirmesi</p>
        </div>
        
        <!-- Test Bilgileri -->
        <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #1e40af;">
            <h3 style="margin-top: 0; color: #1e40af;">📋 Test Bilgileri</h3>
            <table style="width: 100%; font-size: 14px;">
                <tr>
                    <td style="padding: 5px; font-weight: bold; width: 30%;">Test Tarihi:</td>
                    <td style="padding: 5px;">${timestamp}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; font-weight: bold;">Katılımcı Yaşı:</td>
                    <td style="padding: 5px;">${age} yaş</td>
                </tr>
                <tr>
                    <td style="padding: 5px; font-weight: bold;">Yaş Grubu:</td>
                    <td style="padding: 5px;">${ageGroup}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; font-weight: bold;">Test Frekansları:</td>
                    <td style="padding: 5px;">31 frekans aralığı (40 Hz - 16000 Hz)</td>
                </tr>
            </table>
        </div>
        
        <!-- Sağ Kulak Sonuçları -->
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #059669;">
            <h3 style="margin-top: 0; color: #059669;">👂 SAĞ KULAK SONUÇLARI</h3>
            <div style="font-size: 14px; line-height: 1.8;">
                ${rightEarResults.html}
            </div>
        </div>
        
        <!-- Sol Kulak Sonuçları -->
        <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #dc2626;">👂 SOL KULAK SONUÇLARI</h3>
            <div style="font-size: 14px; line-height: 1.8;">
                ${leftEarResults.html}
            </div>
        </div>
        
        <!-- Audiogram Grafiği -->
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px; border: 2px solid #e5e7eb; text-align: center;">
            <h3 style="margin-top: 0; color: #1e40af;">📊 AUDIOGRAM GRAFİĞİ</h3>
            <canvas id="pdfAudiogramChart" width="600" height="400" style="max-width: 100%;"></canvas>
        </div>
        
        <!-- Öneriler -->
        <div id="pdfRecommendation" style="padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid;">
            <h3 style="margin-top: 0;">👨‍⚕️ UZMAN TAVSIYELERI</h3>
            <div style="font-size: 14px; line-height: 1.8; white-space: pre-wrap;"></div>
        </div>
        
        <!-- Önemli Uyarılar -->
        <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #dc2626;">⚠️ ÖNEMLİ UYARILAR</h3>
            <ul style="margin: 10px 0; padding-left: 20px; font-size: 13px;">
                <li><strong>Bu test profesyonel değildir:</strong> Gerçek audiometrik cihaz kadar doğru değildir.</li>
                <li><strong>Doktor yerine geçmez:</strong> Sonuçları mutlaka bir Odyolog veya KBB Doktoru ile paylaşınız.</li>
                <li><strong>Tıbbi karar alınırken:</strong> Bu testi tek başına kullanmayınız. Her zaman profesyonel danışman alınız.</li>
                <li><strong>Doktor ziyareti:</strong> İşitme kaybı şüphesi varsa en kısa sürede uzman doktor ile görüşün.</li>
            </ul>
        </div>
        
        <!-- Alt Bilgi -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 12px; color: #666;">
            <p style="margin: 5px 0;">Bu rapor <strong>IsitmeTesti.com</strong> platformu tarafından oluşturulmuştur.</p>
            <p style="margin: 5px 0;">Rapor Oluşturma Tarihi: ${new Date().toLocaleString('tr-TR')}</p>
            <p style="margin: 5px 0; font-style: italic;">Bu belge gizlidir ve özel olarak sizin için oluşturulmuştur.</p>
        </div>
    </div>
    `;
    
    // HTML'yi DOM'a ekle
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = pdfContent;
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);
    
    // Audiogram grafiğini çiz
    const pdfCanvas = tempDiv.querySelector('#pdfAudiogramChart');
    drawAudiogramForPDF(pdfCanvas);
    
    // Önerileri ekle
    const recommendation = generateRecommendation(rightEarResults, leftEarResults, age);
    const recBox = tempDiv.querySelector('#pdfRecommendation');
    recBox.classList.add('recommendation-box', recommendation.level);
    recBox.style.borderLeftColor = 
        recommendation.level === 'danger' ? '#dc2626' :
        recommendation.level === 'warning' ? '#f59e0b' : '#059669';
    recBox.style.background = 
        recommendation.level === 'danger' ? '#fef2f2' :
        recommendation.level === 'warning' ? '#fffbeb' : '#ecfdf5';
    recBox.querySelector('div').textContent = recommendation.text;
    
    // PDF oluştur
    const element = tempDiv;
    const opt = {
        margin: 10,
        filename: `IsitmeTest_Sonuclari_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
        // TempDiv'i sil
        document.body.removeChild(tempDiv);
    });
}

// PDF için Audiogram çiz
function drawAudiogramForPDF(canvas) {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const padding = 50;
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
    
    // Y ekseni
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.stroke();
    
    // X ekseni
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Etiketler
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    
    // Frekans etiketleri
    const displayFreqs = [500, 1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < displayFreqs.length; i++) {
        const freqIndex = freqs.indexOf(displayFreqs[i]);
        if (freqIndex !== -1) {
            const x = padding + (width / (freqs.length - 1)) * freqIndex;
            ctx.fillText(displayFreqs[i] + ' Hz', x, canvas.height - padding + 18);
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
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Audiogram Grafiği', canvas.width / 2, 25);
    
    // Y ekseni etiketi
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('İşitme Seviyesi (dB HL)', 0, 0);
    ctx.restore();
    
    // X ekseni etiketi
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Frekans (Hz)', canvas.width / 2, canvas.height - 5);
    
    // Verileri çiz
    drawEarLine(ctx, state.testResults.right, padding, width, height, freqs, '#2563eb', 'o');
    drawEarLine(ctx, state.testResults.left, padding, width, height, freqs, '#ef4444', 'x');
    
    // Legend
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(canvas.width - 160, 20, 12, 12);
    ctx.fillStyle = '#333';
    ctx.fillText('Sağ Kulak', canvas.width - 143, 28);
    
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(canvas.width - 160, 38, 12, 12);
    ctx.fillStyle = '#333';
    ctx.fillText('Sol Kulak', canvas.width - 143, 46);
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
