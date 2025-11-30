# 👂 İşitme Testi Web Uygulaması

Kulaklarınızın ne kadar iyi duyabıldığını kontrol etmek için etkileşimli bir web uygulaması.

## 🎯 Özellikler

- ✅ **Yaşa Uygun Test**: Kullanıcı yaşına göre test frekansları otomatik olarak ayarlanır
- 🎧 **Sol ve Sağ Kulak Testleri**: Her kulak ayrı ayrı test edilir
- 📊 **Audiogram Grafiği**: Test sonuçlarını görsel olarak gösterir
- 🔊 **Web Audio API**: Uygun ses frekansları üretilir
- 📈 **Ayrıntılı Sonuçlar**: İşitme kaybı seviyesini belirler
- 💊 **Doktor Tavsiyesi**: Sonuçlara göre doktor ziyareti gerekli olup olmadığını belirler
- 📥 **Sonuçları İndir**: Test sonuçlarını metin dosyası olarak indirir

## 🏥 Yaş Gruplarına Göre Test Aralığı

| Yaş Aralığı | Test Frekansları | Açıklama |
|---|---|---|
| 18-25 | 250-17.400 Hz | Genç yetişkinler |
| 25-50 | 250-12.000 Hz | Yetişkinler |
| 50-65 | 250-8.000 Hz | Orta yaşlı |
| 65+ | 250-4.000 Hz | Yaşlı |

## 📋 Test Frekansları

Standart audiometri testinde kullanılan frekanslar (yüksekten düşüğe):
- 16.000 Hz
- 14.000 Hz
- 12.000 Hz
- 10.000 Hz
- 8.000 Hz
- 6.000 Hz
- 4.000 Hz
- 2.000 Hz
- 1.000 Hz
- 500 Hz
- 250 Hz

## 🎚️ İşitme Kaybı Sınıflandırması

| Sınıflandırma | dB HL Aralığı | Açıklama |
|---|---|---|
| Normal | 0-25 dB | Herhangi bir kayıp yok |
| Hafif | 25-45 dB | Çok az işitme kaybı |
| Orta | 45-65 dB | Açık işitme kaybı |
| Ciddi | 65-85 dB | Önemli kayıp |
| Çok Ciddi | >85 dB | Kritik seviye |

## ⚠️ Doktor Ziyareti Önerileri

Aşağıdaki durumlarda **mutlaka** bir doktor (audioloğu veya ENT) ziyaret etmelisiniz:

- 🔴 Ciddi işitme kaybı tespit edildiğinde
- 🔴 Her iki kulaklarda da orta düzey kayıp varsa
- 🔴 Ani işitme kaybı yaşarsanız
- 🔴 Yalnızca bir kulaklarda işitme kaybı varsa
- ⚠️ Hafif işitme kaybı persiste ederse

## 🛠️ Kullanım

1. **Dosyaları İndir/Kopyala**: Proje dosyalarını bilgisayarınıza kopyalayın
2. **Tarayıcıda Aç**: `index.html` dosyasını web tarayıcınızda açın
3. **Kulaklık Takın**: Başınızda kulaklık takmalıdır
4. **Yaşınızı Girin**: Hoş geldiniz ekranında yaşınızı yazın
5. **Teste Başla**: "Teste Başla" butonuna tıklayın
6. **Test Yapın**: Sesin duyup duymadığını belirtin
7. **Sonuçları İnceyin**: Grafiği ve tavsiyeleri okuyun

## ⚙️ Teknik Detaylar

### Teknoloji Stack
- **HTML5** - Yapı
- **CSS3** - Stil ve animasyonlar
- **JavaScript** - Mantık ve Web Audio API
- **Web Audio API** - Ses üretimi

### Ses Üretimi
- **Sine Wave**: Temiz sinüs dalgası kullanılır
- **Dinamik Seviye**: Rahatlık için ses seviyesi ayarlanabilir
- **Fade In/Out**: Kulaklar için daha konforlu geçiş

### Tastatura Kısayolları
- `Ctrl + Plus (+)`: Ses seviyesini artır
- `Ctrl + Minus (-)`: Ses seviyesini azalt

## 📊 Audiogram Grafiği

Sonuçlar, profesyonel audiometry'de kullanılan standart audiogram formatında gösterilir:
- **Mavi Çizgi**: Sağ kulak sonuçları
- **Kırmızı Çizgi**: Sol kulak sonuçları
- **X Ekseni**: Frekans (Hz)
- **Y Ekseni**: İşitme Seviyesi (dB HL)

## ⚠️ Önemli Uyarılar

1. **Profesyonel Değildir**: Bu test, profesyonel audiometrik değerlendirmenin yerine geçmez
2. **Tarayıcı Uyumluluğu**: Modern tarayıcılar (Chrome, Firefox, Safari, Edge) gereklidir
3. **Donanım**: Çalışan kulaklık/hoparlör gereklidir
4. **Çevre**: En iyi sonuçlar için sessiz bir ortamda test yapınız
5. **Tıbbi İşlem Değildir**: Herhangi bir tıbbi sorun varsa doktora danışınız

## 📝 Sonuçları Paylaşma

Test sonuçlarını indirebilir ve bunları doktorunuzla paylaşabilirsiniz. Dosya şu bilgileri içerir:
- Test tarihi ve saati
- Yaş ve yaş grubu
- Her frekansda her kulağın işitme durumu

## 🔐 Gizlilik

- Veriler yalnızca yerel tarayıcıda saklanır
- Sunucuya hiçbir veri gönderilmez
- Gizlilik tamamen korunmaktadır

## 📧 Hakkında

Bu proje, insanların işitme sağlığı hakkında farkındalık yaratmak amacıyla oluşturulmuştur.

---

**Sağlıklı işitme için önlemler alınız! 👂❤️**
# IsitmeTesti
# IsitmeTesti
