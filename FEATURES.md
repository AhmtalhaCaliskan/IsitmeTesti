# 🎯 Proje Özeti - İşitme Testi Web Uygulaması

## Başarıyla Oluşturulan Özellikler

### 1. 📋 Hoş Geldiniz Ekranı
- Kullanıcıdan yaş bilgisi alınır
- Test hakkında açıklamalar
- Talimatlar ve "Teste Başla" butonları
- Responsive tasarım

### 2. 🎓 Talimatlar Ekranı
- Detaylı test talimatları
- Kulaklık kullanım önerileri
- Sessiz ortam gerekliliği
- Uyarı ve sağlık notları
- Profesyonel teşhis değildir uyarısı

### 3. 🎧 Test Ekranı
- **Sol ve Sağ Kulak Testleri Ayrı Ayrı**
  - Sağ kulak ilk olarak test edilir
  - Sonra sol kulak test edilir
  
- **İnsan Kafası Görseli (SVG)**
  - Ortada yer alan profesyonel insan kafası
  - Sol ve sağ kulaklar aydınlatılarak test edilen kulak gösterilir
  - Uygun tasarım

- **Test Yönetimi**
  - Yüksek frekanstan (16.000 Hz) düşüğe (250 Hz) doğru ilerler
  - Web Audio API ile temiz sinüs dalgası üretilir
  - Her frekans kullanıcı yanıtına göre yönetilir

- **Kontrol Butonları**
  - "Sesi Duydum" - Sesin duyulduğunu kaydeder
  - "Sesi Duymadım" - Sesin duyulmadığını kaydeder
  - "Durdur" - Teste ara verip devam etme seçeneği

- **Görsel Göstergeler**
  - İlerleme çubuğu (sağ/sol kulak ilerleme)
  - Geçerli frekans göstergesi
  - Sesli gösterge animasyonu

### 4. 🧬 Yaş Ayarlaması Sistemi

Yaşa göre dinamik frekans aralığı:

```
18-25 yaş: 250 Hz - 17.400 Hz (Tam spektrum)
25-50 yaş: 250 Hz - 12.000 Hz (Genç yetişkin)
50-65 yaş: 250 Hz - 8.000 Hz (Orta yaş)
65+ yaş: 250 Hz - 4.000 Hz (Yaşlı)
```

### 5. 📊 Sonuç Sayfası

#### A. Her Kulak İçin Detaylı Sonuçlar
- Duymayan frekanslar listeleme
- İşitme kaybı seviyesi belirleme
  - Normal (✅)
  - Hafif (⚠️)
  - Orta (⚠️)
  - Ciddi (🔴)

#### B. Audiogram Grafiği
- Profesyonel audiogramı HTML5 Canvas ile çizme
- Sağ kulak (Mavi çizgi)
- Sol kulak (Kırmızı çizgi)
- Grid ve etiketler
- Frekans ve dB skalaları

#### C. Doktor Ziyareti Tavsiyesi
Akıllı sistem şu kriterlere göre karar verir:

```
NORMAL (Yeşil) ✅
- Her iki kulakta da normal işitme

UYARI (Sarı) ⚠️
- Hafif işitme kaybı
- Bir kulaklarda orta düzey kayıp

CIDDI (Kırmızı) 🔴
- Bir kulaklarda ciddi kayıp
- Her iki kulaklarda ciddi kayıp
```

#### D. İndir Seçeneği
- Sonuçları metin dosyası olarak indir
- Doktorla paylaşılmaya uygun format
- Tarih, yaş, frekans bilgileri

## 🔧 Teknik Özellikler

### HTML (index.html)
- Semantic HTML5 yapısı
- 4 ana ekran (Welcome, Instructions, Test, Results)
- SVG insan kafası görseli
- Canvas element (Audiogram grafiği için)
- Form kontrolleri

### CSS (styles.css)
- Modern gradient tasarım
- Responsive grid layout
- Animasyonlar ve geçişler
- Renk kodu sistemi (Primary, Success, Danger, Secondary)
- Mobile uyumlu media queries
- Erişilebilirlik (a11y) göz önüne alınmış

### JavaScript (script.js)
- **Web Audio API**
  - OscillatorNode ile sinüs dalgası üretimi
  - GainNode ile ses seviyesi kontrolü
  - ADSR envelope (Fade in/out)

- **State Yönetimi**
  - Kapsamlı durum nesnesi (state)
  - Ekran geçişleri

- **Test Algoritması**
  - Frekans döngüsü yönetimi
  - Kulak seçimi mantığı
  - Sonuç kaydı

- **Analiz**
  - İşitme kaybı sınıflandırması
  - Doktor tavsiyesi üretimi
  - Audiogram çizimi

## 🎨 Kullanıcı Deneyimi

### Renkler
- **Birincil (Mavi)**: #2563eb - Ana eylemler
- **Başarı (Yeşil)**: #10b981 - Duydum butonu
- **Uyarı (Kırmızı)**: #ef4444 - Duymadım butonu
- **İkincil (Gri)**: #6b7280 - Metin ve ayırıcılar

### Animasyonlar
- Ekran geçişleri (slideIn)
- Ses göstergesi dalgası (soundWave)
- Buton hover efektleri

### Erişilebilirlik
- Açık etiketler ve açıklamalar
- Uygun kontrast oranları
- Tuş yardımcıları (Ctrl+, Ctrl-)

## 📋 Test Frekansları

Yüksekten düşüğe sırayla test edilir:
- 16.000 Hz - Çok yüksek frekans
- 14.000 Hz
- 12.000 Hz
- 10.000 Hz
- 8.000 Hz - Standart audiometride en yüksek
- 6.000 Hz
- 4.000 Hz - Konuşmada kritik
- 2.000 Hz - Konuşmada kritik
- 1.000 Hz - Ses frekansı
- 500 Hz - Düşük sesin, vokalin
- 250 Hz - Çok düşük frekans

## 📁 Dosya Yapısı

```
ProjeKulak/
├── index.html          # Ana HTML dosyası
├── styles.css          # Stil sayfası
├── script.js           # JavaScript kodu
├── README.md           # Kullanım rehberi
└── FEATURES.md         # Bu dosya
```

## ⚡ Başlangıç Rehberi

1. **index.html dosyasını bir tarayıcıda açın**
   - Yerel olarak: Dosyayı çift tıklayıp tarayıcıda açın
   - Veya: Python sunucusu ile `python3 -m http.server 8000`

2. **Hoş geldiniz ekranında yaşınızı girin**

3. **Teste Başla'ya tıklayın**

4. **Kulaklık takınız ve şunları yapınız:**
   - Sesin duyulup duymadığını belirtin
   - İlerleme çubuğunu izleyin
   - Sol kulak testine geçilecek

5. **Sonuçları görüntüleyin ve indirin**

## ⚠️ Sınırlamalar ve Uyarılar

- **Profesyonel Değil**: Gerçek audiometer ile eşdeğer değil
- **Ortam Faktörü**: Sessiz ortamda en iyi sonuç
- **Donanım**: Kaliteli kulaklık gerekli
- **Tarayıcı**: Modern tarayıcı (Chrome, Firefox, Safari, Edge)
- **Tıbbi İşlem Değil**: Doktor ziyareti gerçek teşhis için gereklidir

## 🚀 Gelecekteki Geliştirmeler

- [ ] Bone conduction testing
- [ ] Speech intelligibility tests
- [ ] Tinnitus frequency identification
- [ ] Hearing aid simulator
- [ ] Multiple language support
- [ ] Result history tracking
- [ ] Comparison with previous tests
- [ ] Export as PDF
- [ ] Mobile app versiyonu

## 📞 Destek ve Geri Bildirim

Test sonuçlarının doğruluğu hakkında endişeniz varsa, lütfen bir profesyonel audioloğu ziyaret edin.

---

**Son Güncelleme:** 30 Kasım 2024
**Versiyon:** 1.0.0
