<!-- Türkçe Açıklama Dosyası -->

# 🎯 İşitme Testi Projesi - Detaylı Açıklama

Merhaba! Sizin için profesyonel bir audiometri testi web uygulaması oluşturdum. 

## 📌 Proje Nedir?

Bu web sitesi, kullanıcıların kulaklarının ne kadar iyi duyabıldığını kontrol etmelerini sağlayan etkileşimli bir araçtır. Kullanıcı yaşına göre farklı frekanslar test eder ve sonuçlar profesyonel bir audiogram grafiğinde gösterilir.

## 🌟 Temel Özellikler

### 1. **Yaşa Uygun Test**
Kullanıcının yaşı alındıktan sonra test frekansları otomatik olarak ayarlanır:
- 18-25 yaş: 250 Hz - 17.400 Hz (Genç işitme)
- 25-50 yaş: 250 Hz - 12.000 Hz (Yetişkin işitme)
- 50-65 yaş: 250 Hz - 8.000 Hz (Orta yaşlı)
- 65+ yaş: 250 Hz - 4.000 Hz (Yaşlı işitme)

### 2. **Sol ve Sağ Kulak Testleri**
Her kulak ayrı ayrı test edilir:
- Önce sağ kulak test edilir
- Sonra sol kulak test edilir
- Ortada yer alan insan kafası görseli aktif kulağı gösterir

### 3. **Web Audio API ile Profesyonel Ses**
- Temiz sinüs dalgası kullanılır
- Rahatlık için Fade in/out efektleri uygulanır
- Kullanıcı Ctrl++ ve Ctrl+- ile ses seviyesini ayarlayabilir

### 4. **Detaylı Sonuçlar**
Her kulak için ayrı ayrı:
- Duymayan frekanslar listeleme
- İşitme kaybı seviyesi (Normal/Hafif/Orta/Ciddi)
- Doktor ziyareti tavsiyesi

### 5. **Audiogram Grafiği**
Profesyonel sesli harita:
- Mavi çizgi: Sağ kulak
- Kırmızı çizgi: Sol kulak
- X ekseni: Frekans (Hz)
- Y ekseni: İşitme Seviyesi (dB HL)

### 6. **Akıllı Doktor Tavsiyesi**
Test sonuçlarına göre:
- ✅ **Yeşil (Normal)**: İyi haberler, endişe yok
- ⚠️ **Sarı (Uyarı)**: Hafif kayıp, gözlemleme
- 🔴 **Kırmızı (Ciddi)**: Derhal doktor ziyareti

## 🎮 Kullanım Adımları

### Adım 1: Başlama
```
- index.html dosyasını tarayıcıda açın
- "Teste Başla" tuşuna basın
```

### Adım 2: Bilgi Girişi
```
- Yaşınızı girin (Örn: 30)
- Talimatları okuyun (önemli!)
- "Devam Et" tuşuna basın
```

### Adım 3: Test Yapma
```
- Kulaklık takın
- Sesli uyarı dinleyin
- Sesin duyup duymadığını belirtin
  - "Sesi Duydum" → Sesi işittim
  - "Sesi Duymadım" → Sesi işitmedim
- Test otomatik ilerler
```

### Adım 4: Sonuçları Görüntüleme
```
- Audiogram grafiği görülür
- Doktor tavsiyesi okunur
- Sonuçları indir butonuyla kaydet
```

## 🔊 Test Frekansları Detaylı

İşitme testinde bu frekanslar kullanılır (yüksekten düşüğe):

| Frekans | Hz | Açıklama |
|---------|----|----|
| Çok Yüksek | 16.000 | Genç işitme kapasitesi |
| Yüksek | 14.000 | Üstün işitme |
| Yüksek | 12.000 | Keskin sesler |
| Yüksek | 10.000 | Üstün işitme |
| **Standart** | **8.000** | Standart audiometride en yüksek |
| Orta-Yüksek | 6.000 | Konuşmada önemli |
| Orta | 4.000 | **Çok önemli** konuşma frekansı |
| Orta | 2.000 | **Çok önemli** konuşma frekansı |
| Orta | 1.000 | Konuşmada temel frekans |
| Düşük | 500 | Ses derinliği, vokaller |
| Çok Düşük | 250 | En düşük test frekansı |

## 📊 İşitme Kaybı Sınıflandırması

Testin sonundaki sınıflandırma:

```
NORMAL (0-25 dB)
- Hiç kayıp yok
- Rutin işitme
- Kısıtlama yok

HAFİF (25-45 dB)
- Çok az kayıp
- Çoğu durumda normal
- Periyodik kontrol

ORTA (45-65 dB)
- Açık kayıp
- Konuşmada zorluk
- Doktor önerilir

CİDDİ (65-85 dB)
- Ciddi sorun
- Doktor ziyareti gerekli
- Hearing aid gerekebilir

ÇOK CİDDİ (>85 dB)
- Kritik kayıp
- Acil doktor ziyareti
- Ciddi müdahale gerekebilir
```

## ⚕️ Doktor Ziyareti Kılavuzu

### DERHAL DOKTOR ZİYARETİ GEREKLİ:
- 🔴 Her iki kulaklarda ciddi kayıp
- 🔴 Bir kulaklarda ciddi kayıp
- 🔴 Ani işitme kaybı
- 🔴 Asimetrik kayıp (bir kulak diğerinden çok farklı)

### YAKINDA DOKTOR ZİYARETİ ÖNERİLİR:
- ⚠️ Her iki kulaklarda orta düzey kayıp
- ⚠️ Bir kulaklarda orta düzey kayıp
- ⚠️ Hafif kayıp persiste ederse

### GÖZLEMLEME:
- ℹ️ Hafif kayıp
- ℹ️ Yüksek frekanslarda hafif kayıp
- ℹ️ Normal işitme

## 🎨 Ekranlar Detaylı

### Ekran 1: Hoş Geldiniz
```
- Başlık ve açıklama
- Yaş girişi
- "Teste Başla" butonu
- "Talimatlar" butonu
```

### Ekran 2: Talimatlar
```
- Detaylı test talimatları
- 6 temel kural
- Sonuç hakkında bilgi
- Uyarı: "Profesyonel değil"
- Geri/Devam butonları
```

### Ekran 3: Test
```
- İnsan kafası görseli (ortada)
- Kulak aydınlama (test edilen kulağı gösterir)
- İlerleme çubuğu
- Geçerli frekans göstergesi
- Ses çubuğu animasyonu
- "Sesi Duydum" ve "Sesi Duymadım" butonları
- "Durdur" butonu (teste ara verme)
```

### Ekran 4: Sonuçlar
```
- Sağ kulak sonuçları
- Sol kulak sonuçları
- Audiogram grafiği (mavi/kırmızı çizgiler)
- Doktor tavsiyesi (renk kodlu)
- "Tekrar Test Et" butonu
- "Sonuçları İndir" butonu
```

## 💾 İndirilen Dosya Formatı

Sonuçları indirdiğinizde şu bilgiler bulunur:

```
İŞİTME TESTİ SONUÇLARI
======================

Test Tarihi: 30.11.2024 15:45:32
Yaş: 35
Yaş Grubu: adult

SAĞ KULAK SONUÇLARI:
------------------
16000 Hz: Duyuldu
14000 Hz: Duyuldu
12000 Hz: Duyuldu
10000 Hz: Duymadı
8000 Hz: Duymadı
... (tüm frekanslar)

SOL KULAK SONUÇLARI:
------------------
16000 Hz: Duyuldu
... (tüm frekanslar)

ÖNEMLİ NOT:
Bu test profesyonel tıbbi teşhis yerine geçmez.
Sonuçlarınızı bir audioloğu veya ENT doktoruyla paylaşınız.
```

## 🛠️ Teknik Bilgiler

### Kullanılan Teknolojiler
- **HTML5**: Yapı ve semantik
- **CSS3**: Styling, animations, responsive design
- **JavaScript (ES6+)**: Mantık, event handling
- **Web Audio API**: Ses üretimi ve kontrol

### Ses Üretimi İçin
```javascript
- OscillatorNode: Sinüs dalgası üretimi
- GainNode: Ses seviyesi kontrolü
- ADSR Envelope: Yumuşak geçişler
```

## ⌨️ Kısayollar

- `Ctrl + +` : Ses seviyesini artır
- `Ctrl + -` : Ses seviyesini azalt
- `Enter` : Buton tıklaması (bazı tarayıcılarda)

## 🔒 Gizlilik ve Güvenlik

- **Veriler yerel olarak kalır**: Sunucuya hiçbir veri gönderilmez
- **Çerez yok**: Takip yok
- **Tamamen özel**: Sadece sizin bilgisayarınızda çalışır

## ⚠️ ÖNEMLİ UYARILAR

1. **Profesyonel Değil**
   - Bu test, hakiki bir audiometrik cihaz yerine geçmez
   - Profesyonel audioloğun yapacağı test çok daha detaylıdır

2. **Çevre Gereksinimi**
   - En iyi sonuçlar için sessiz ortamda yapınız
   - Arka plan gürültüsü sonuçları etkileyebilir

3. **Donanım Gereksinimi**
   - Kaliteli kulaklık gereklidir
   - Telefon veya tablet hoparlörleri ideal değildir

4. **Tarayıcı Uyumluluğu**
   - Modern tarayıcılar gerekli (Chrome, Firefox, Safari, Edge)
   - Web Audio API desteği zorunludur

5. **Tıbbi Karar Almayın**
   - Test sonuçlarına göre kendi kendinize teşhis koymayın
   - Herhangi bir endişeniz varsa doktor ziyareti yapınız

## 🎓 İşitme Sağlığı İpuçları

1. **Gürültüden Koruma**
   - Yüksek ses seviyeleri kulaklarınızı zarar verebilir
   - Kulaklıkla 1 saat günde max
   - İşyerinde gürültü koruyucusu kullanınız

2. **Düzenli Kontrol**
   - Her 10 yılda bir test yaptırınız (18-50 yaş)
   - Her 3 yılda bir test yaptırınız (50+ yaş)
   - Semptomlar olursa hemen doktor ziyareti

3. **Yaşlılıkta Bakım**
   - Presbycusis (yaşlılık kayıtı) doğal bir işlemdir
   - Erken müdahale kaliteyi iyileştirir
   - Hearing aids modern ve etkilidir

## 📞 Profesyonel Yardım

Sizin için: Bu test bir **başlangıç** aracı olarak tasarlanmıştır.

Profesyonel doktor ziyareti için:
- **ENT (Otolaringoloji)**: Kulak hastalıkları uzmanı
- **Audiolog**: İşitme uzmanı
- **Genel Pratisyen**: Başlangıç konsultasyonu

---

**Son Notlar:**
- Test sonuçlarınızı doktorla paylaşmayı unutmayın
- Çok önemli: Test sonucunda doktor ziyareti önerilirse HEMEDİ yapınız
- Kulaklarınızın sağlığı çok önemlidir! 👂❤️

**Proje Oluşturulma Tarihi:** 30 Kasım 2024
**Versiyon:** 1.0.0
**Dil:** Türkçe
