# EKAP & İNŞAAT ANALİZ PROJESİ - GELİŞTİRİCİ NOTLARI

Bu dosya, projeyi devralacak olan yapay zeka asistanı için hazırlanmıştır. Projenin mevcut durumu, dosya yapısı, kullanılan teknolojiler ve geçmiş konuşmaların özetini içerir.

## 📌 Proje Özeti
Bu proje, iki ana bileşenden oluşmaktadır:
1.  **İnşaat Analiz & Metraj (Web Arayüzü)**: İnşaat pozlarını analiz eden, metraj çıkaran ve yapay zeka destekli sohbet arayüzü sunan bir web uygulaması.
2.  **EKAP İhale Takip (Python Script)**: EKAP üzerindeki ihaleleri takip eden ve bildirim gönderen bir otomasyon aracı.

---

## 📂 Dosya Yapısı ve Önemli Dosyalar
Proje dizini: `c:\Users\ASUS\Desktop\ekap-malzeme`

### 1. Web Uygulaması (Frontend & Backend)
-   **`index.html`**: Ana poz analiz sayfası.
-   **`metraj.html`**: **(Aktif)** Yapay zeka destekli sohbet paneli ("Akıllı Metraj").
-   **`metraj_app.js`**: `metraj.html` sayfasının mantığı. Hem istemci tarafı durum makinesi (State Machine) hem de backend iletişimi içerir.
-   **`app.js`**: Poz analizi ve arama mantığı.
-   **`server/`**: Backend dosyaları klasörü.
    -   `server/server.js`: Node.js Express sunucusu. `Pollinations.ai` API'sini kullanarak ücretsiz GPT-4o benzeri modelden yanıt alır.
    -   `server/package.json`: Backend bağımlılıkları (`npm install` ile kurulur).

### 2. Python Otomasyon Araçları (Masaüstü)
-   **`ekap_monitor.py`**: EKAP ihalelerini takip eden Python scripti.
-   **`config.json`**: Takip ayarları.

---

## 🛠️ Kurulum ve Çalıştırma Talimatları (Son Durum)

### A. Sohbet Panelini Çalıştırma
Sohbet paneli (Chatbot) hibrit çalışır: Basit sorulara frontend cevap verir, karmaşık sorular backend'e gider.

1.  **Frontend**: `c:\Users\ASUS\Desktop\ekap-malzeme\metraj.html` dosyasını tarayıcıda açın.
2.  **Backend (AI Özelliği İçin Gerekli)**:
    Terminalde şu komutları çalıştırın:
    ```powershell
    cd c:\Users\ASUS\Desktop\ekap-malzeme\server
    npm install  # (Eğer kurulmadıysa)
    npm start
    ```
    Sunucu `http://localhost:3000` adresinde çalışacaktır.

---

## 📜 Geçmiş Konuşmalar ve Geliştirme Süreci (Özet)

### 1. Sohbet Paneli Entegrasyonu (En Son)
-   Kullanıcı, sohbet panelinin nerede olduğunu sordu.
-   Panelin `metraj.html` içinde olduğu tespit edildi.
-   Yapay zeka yanıtlarının çalışması için yerel bir sunucu (`server/server.js`) gerektiği belirlendi.

### 2. EKAP İhale Takip (Ocak 2026)
-   Amaç: Belirli kriterlere uyan ihaleler yayınlandığında bildirim almak.
-   Zorluklar: EKAP'ın herkese açık bir API'si yok.
-   Çözüm: Python scripti (`ekap_monitor.py`) ile periyodik kontrol mekanizması tasarlandı.

### 3. Analiz Ekranı İyileştirmeleri (Aralık 2025 - Ocak 2026)
-   Poz analiz verilerinin "Tablo" şeklinde gösterilmesi sağlandı.
-   Yıllara göre fiyat değişimi (2025-2026) eklendi.
-   PDF analizlerini parse etmek için regex tabanlı çözümler geliştirildi.

---

## 🧩 Kritik Kod Parçaları (Referans İçin)

### `metraj_app.js` (Frontend Logic)
```javascript
const BACKEND_URL = 'http://localhost:3000/api/chat';

// Durum Makinesi (State Machine)
const STATES = {
    IDLE: 'IDLE',
    LOCATION: 'LOCATION',
    DIMENSIONS: 'DIMENSIONS',
    // ...
};

async function sendMessage() {
    // ...
    // Önce yerel makine kontrol eder, cevap veremezse backend'e sorar
    const localReply = processStateMachine(text);
    if (!localReply) {
       const beReply = await callBackendAI(text);
       // ...
    }
}
```

### `server/server.js` (Backend Logic)
```javascript
const express = require('express');
const app = express();
// ...
app.post('/api/chat', async (req, res) => {
    // Pollinations.ai Kullanarak Ücretsiz AI Desteği
    const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        body: JSON.stringify({
            messages: openAIMessages,
            model: 'openai'
        })
    });
    // ...
});
```

---

## ⚠️ Bilinen Sorunlar / Dikkat Edilmesi Gerekenler
1.  **Tarayıcı Güvenliği (CORS)**: `metraj.html` dosyasını direkt dosya sisteminden (`file://`) açtığınızda modern tarayıcılar bazen API isteklerini engelleyebilir. Eğer sunucuya bağlanamıyorsa, "VS Code Live Server" eklentisi ile `index.html` veya `metraj.html` dosyasını sunmanız önerilir.
2.  **API Limitleri**: `Pollinations.ai` ücretsiz bir servistir, bazen yavaş yanıt verebilir veya kesintiye uğrayabilir.
3.  **Veri Entegrasyonu**: `POZ_DATA` değişkeni `data.js` ve `data_2025.js` gibi dosyalardan yüklenir. Eğer bu dosyalar eksikse uygulama hata verebilir.

Bu belge, yeni asistanın projeyi hızlıca kavraması için yeterli teknik detayları içermektedir. Başarılar!
