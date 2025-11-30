#!/bin/bash

# İşitme Testi Uygulaması - Hızlı Başlangıç

echo "🎧 İşitme Testi Web Uygulaması - Hızlı Başlangıç"
echo "================================================"
echo ""

# Mevcut dizini kontrol et
if [ ! -f "index.html" ]; then
    echo "❌ Hata: index.html dosyası bulunamadı"
    echo "Lütfen bu dosya ProjeKulak klasöründe olduğundan emin olunuz"
    exit 1
fi

echo "✅ Dosyalar hazır"
echo ""
echo "🚀 Web sunucusu başlatılıyor..."
echo ""

# Python'un versiyonunu kontrol et
if command -v python3 &> /dev/null; then
    PORT=8000
    echo "📍 Başlangıç: http://localhost:${PORT}"
    echo ""
    echo "Tarayıcınızda açmak için Ctrl+Click yapınız veya tarayıcıya kopyalayınız"
    echo ""
    echo "Sunucuyu durdurmak için: Ctrl+C"
    echo ""
    python3 -m http.server ${PORT}
else
    echo "❌ Python3 bulunamadı"
    echo "Lütfen Python3'ü yükleyiniz"
    exit 1
fi
