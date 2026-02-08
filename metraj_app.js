// PROFESYONEL İNTERAKTİF REHBER (State Machine v6.0 - Universal Matrix)
// "Maddeye Göre Şekil Al: m2, m3, mtül, kg"

const BACKEND_URL = 'http://localhost:3000/api/chat';

const STATES = {
    IDLE: 'IDLE',
    LOCATION: 'LOCATION',
    DIMENSIONS: 'DIMENSIONS',
    HEIGHT_CHECK: 'HEIGHT_CHECK', // Artık "3. Boyut Kontrolü" (Yükseklik/Kalınlık)
    OPENINGS: 'OPENINGS',
    CALCULATING: 'CALCULATING'
};

// Malzeme Sınıflandırması
const CAT_VOL = ["beton", "şap", "kazı", "dolgu", "hafriyat", "toprak", "mıcır", "kum", "çimento", "asfalt"];
const CAT_LIN = ["korkuluk", "süpürgelik", "boru", "kablo", "kanal", "oluk", "profil", "demir", "çit", "tel", "bant"];
// Geri kalanı Alan (Boya, Sıva, Fayans vb) veya Adet varsayılır.

let appState = {
    current: STATES.IDLE,
    data: {
        jobType: null,
        jobCategory: 'area', // area, vol, lin
        location: null,
        areaBase: 0,
        dims: { w: 0, l: 0 },
        dim3: 0, // Height or Thickness
        isBuilding: false,
        openings: null,
        calculatedAmount: 0 // Result
    },
    history: []
};

document.addEventListener('DOMContentLoaded', () => {
    restartChat();
    const input = document.getElementById('user-input');
    if (input) {
        input.onkeypress = null;
        input.addEventListener('keydown', handleKeyPress);
    }
});

function handleKeyPress(e) {
    if (e.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text) return;

    addUserMessage(text);
    input.value = '';
    showTyping();

    const localReply = processStateMachine(text);

    if (localReply) {
        removeTyping();
        addBotMessageHTML(marked.parse(localReply));
        appState.history.push({ role: 'user', content: text });
        appState.history.push({ role: 'assistant', content: localReply });
    } else {
        try {
            const beReply = await callBackendAI(text);
            removeTyping();
            addBotMessageHTML(marked.parse(beReply.reply));
        } catch (e) {
            removeTyping();
            addBotMessage("Bağlantı hatası.");
        }
    }
}

function processStateMachine(input) {
    const t = input.toLowerCase();

    if (t === 'başa dön' || t === 'yenile' || t === 'reset') {
        restartChat();
        return "Sıfırlandı. Ne işlem yapılacak?";
    }

    if (t.includes('nasıl') || t.includes('neden') || t.includes('yanlış')) {
        return handleExplanation(t);
    }

    switch (appState.current) {

        case STATES.IDLE:
            if (t.match(/^(merhaba|selam|slm)/)) return "Merhaba! Ne yapmak istiyorsunuz?";

            appState.data.jobType = input;

            // Kategori Belirle
            let cat = 'area';
            if (CAT_VOL.some(x => t.includes(x))) cat = 'vol';
            else if (CAT_LIN.some(x => t.includes(x))) cat = 'lin';
            appState.data.jobCategory = cat;

            appState.current = STATES.LOCATION;
            return `"${input}" işlemi anlaşıldı. \n\n**Nerede** yapılacak? (Örn: Bina dış cephe, Oda zemini, Bahçe)`;

        case STATES.LOCATION:
            // Sadece bağlamı kaydet, hesap mantığını etkilemez ama raporda görünür
            if (t.includes('iç') || t.includes('oda') || t.includes('salon')) appState.data.location = 'ic';
            else if (t.includes('dış') || t.includes('cephe') || t.includes('bina')) appState.data.location = 'dis';
            else appState.data.location = 'genel';

            appState.current = STATES.DIMENSIONS;

            // Kategoriye Göre Soru
            if (appState.data.jobCategory === 'vol') return "Uygulama yapılacak alanın **En ve Boy** ölçüleri nedir? (Örn: 10x20)";
            if (appState.data.jobCategory === 'lin') return "Uygulama yapılacak yerin **Uzunluğu** veya **Çevresi** nedir? (Örn: 50m veya 10x20 alanın çevresi)";

            // Area (Default)
            return "Uygulama yüzeyinin **En x Boy** ölçüleri nedir? (Örn: 5x6)";

        case STATES.DIMENSIONS:
            const dims = t.match(/(\d+)[^\d]+(\d+)/);
            const single = t.match(/(\d+)/);

            // Temizleme
            let val1 = 0, val2 = 0;

            if (dims) {
                val1 = parseFloat(dims[1]);
                val2 = parseFloat(dims[2]);
                appState.data.dims = { w: val1, l: val2 };
                appState.data.areaBase = val1 * val2; // Taban alanı
            } else if (single) {
                val1 = parseFloat(single[0]);
                appState.data.dims = { w: 0, l: 0 }; // Kesin değil
                appState.data.areaBase = val1; // Tek sayı geldiyse alan veya uzunluk kabul et
            } else {
                return "Ölçü anlaşılamadı. Lütfen sayısal değer giriniz.";
            }

            appState.current = STATES.HEIGHT_CHECK;

            // Kategoriye Göre 2. Soru
            const c = appState.data.jobCategory;

            if (c === 'vol') {
                return `Taban alanı (${appState.data.areaBase} m2) alındı. \n\nHacim hesabı için **Kalınlık / Derinlik** nedir? (cm veya m belirtin, örn: 10 cm)`;
            }
            if (c === 'lin') {
                // Lineer işlerde eğer tek sayı verdiyse o uzunluktur. "100m" -> Bitti.
                // Eğer "10x20" verdiyse -> Çevresini istiyor olabilir "Korkuluk" vb.
                if (dims) {
                    let perim = (val1 + val2) * 2;
                    appState.data.calculatedAmount = perim;
                    // Lineer'de 3. boyuta (Yükseklik) gerek var mı? "Korkuluk yüksekliği"?
                    // Miktar genelde mtül'dür. Detay bilgisi için sorulabilir ama hesap için gerekmez.
                    // Biz yine de soralım ama "Gerek yok" deme şansı verelim.
                    return `Taban çevresi **${perim}m** olarak hesaplandı. \n\nVarsa yüksekliğin önemi belirtin veya **"Yok"** yazın.`;
                } else {
                    // Tek sayı -> Direkt uzunluk
                    appState.data.calculatedAmount = val1;
                    return `**${val1} metre** uzunluk alındı. \n\nEkstra bir teknik detay veya kesinti var mı? (Yoksa "Yok" yazın)`;
                }
            }

            // Area (Boya, Sıva, Duvar)
            if (t.includes('m2') && t.includes('duvar')) {
                // Direkt duvar alanı
                appState.data.calculatedAmount = val1;
                appState.current = STATES.OPENINGS;
                return `${val1} m2 yüzey alındı. Pencere/Kapı boşluğu var mı?`;
            }
            return `Ölçüler alındı. \n\nDuvar/Yüzey alanı için **Yükseklik** veya **Kat Sayısı** nedir?`;

        case STATES.HEIGHT_CHECK:
            // 3. Boyut (Height or Thickness)
            const hMatch = t.match(/(\d+)/);
            if (t.includes('yok') && appState.data.jobCategory === 'lin') {
                // Lineer işlerde yükseklik yok
                appState.current = STATES.OPENINGS;
                return processStateMachine("yok"); // Auto-skip to openings check logic
            }

            if (hMatch) {
                let val = parseFloat(hMatch[0]);

                // Birim kontrolü (cm mi m mi?)
                let isCm = t.includes('cm') || t.includes('santim');
                if (isCm) val = val / 100; // Metreye çevir
                else if (t.includes('kat')) val = val * 3; // Kat -> 3m

                appState.data.dim3 = val;

                // Ana HESAP
                const cat = appState.data.jobCategory;
                let result = 0;

                if (cat === 'vol') {
                    // Hacim = Taban Alanı * Kalınlık
                    result = appState.data.areaBase * val; // m2 * m = m3
                } else if (cat === 'area') {
                    // Duvar Alanı = Çevre * Yükseklik (Eğer taban verildiyse)
                    // Veya (En*Boy) * 1 (Zemin ise?)
                    // BURADA AYRIM YAPMALIYIZ: ZEMİN İŞİ Mİ DUVAR İŞİ Mİ?
                    // Kullanıcı "duvar" veya "cephe" dediyse Duvar Alanı.
                    // "Zemin", "parke" dediyse Yükseklik çarpanı saçma olur (Parke m2).
                    // AMA "parke" dediyse zaten HEIGHT_CHECK'e gelmemeliydi, IDLE'da yakalamalıydık?
                    // Kategori mantığını biraz daha açmalıyız ama şimdilik Duvar varsayımı güçlü.

                    let perimeter = 0;
                    if (appState.data.dims.w > 0) perimeter = (appState.data.dims.w + appState.data.dims.l) * 2;
                    else perimeter = Math.sqrt(appState.data.areaBase) * 4;

                    result = perimeter * val; // Çevre x Yükseklik
                } else {
                    // lin - yükseklik girildiyse bile miktar değişmez genelde mtül'dür.
                    // Ama belki "Çit" -> m2 (Uzunluk x Yükseklik)?
                    // "Çit" m2 ile hesaplanır bazen.
                    if (appState.data.jobType.includes('çit') || appState.data.jobType.includes('duvar')) {
                        result = appState.data.calculatedAmount * val; // m x m = m2
                        appState.data.jobCategory = 'area'; // Sonuç m2 oldu
                    } else {
                        result = appState.data.calculatedAmount; // Değişmez
                    }
                }

                appState.data.calculatedAmount = result;
                appState.current = STATES.OPENINGS;

                // Geri bildirim
                let unit = (cat === 'vol') ? 'm3' : (cat === 'lin' ? 'mtül' : 'm2');
                return `Hesap: **${parseFloat(result.toFixed(2))} ${unit}**. \n\nDüşülecek boşluk/fire var mı?`;
            }
            return "Lütfen geçerli bir değer giriniz.";

        case STATES.OPENINGS:
            let deduct = 0;
            if (t.includes('çok')) deduct = 0.20;
            else if (t.includes('az')) deduct = 0.05;
            else if (t.includes('normal')) deduct = 0.10;

            appState.data.calculatedAmount = appState.data.calculatedAmount * (1 - deduct);

            // Final Rapor
            return generateFinalReport(appState.data);

        default:
            return "Hata. 'Başa Dön' yazınız.";
    }
}

function handleExplanation(t) { return "Hesaplama detayları: Geometri (En x Boy x Yükseklik/Kalınlık)."; }

function generateFinalReport(data) {
    let amt = parseFloat(data.calculatedAmount.toFixed(2));
    let cat = data.jobCategory;
    let unit = 'm2';
    if (cat === 'vol') unit = 'm3';
    else if (cat === 'lin') unit = 'mtül';

    // Tonaj Hesabı (Opsiyonel Extra)
    let extraInfo = "";
    if (unit === 'm3' && data.jobType.includes('beton')) {
        extraInfo = `(~${(amt * 2.4).toFixed(1)} Ton)`;
    }

    return `
### 📋 ${data.jobType.toUpperCase()} Analizi
**Konum:** ${data.location === 'dis' ? 'Dış Alan' : 'İç Mekan'}

| Veri | Değer |
|---|---|
| **Net Miktar** | **${amt} ${unit}** ${extraInfo} |
| **Taban/Çevre** | ${data.areaBase || data.dims.w + 'x' + data.dims.l} |
| **Kalınlık/Yük.** | ${data.dim3 || '-'} |

> *Bu miktar üzerinden malzeme siparişi verebilirsiniz. Nakliye için tonaj bilgisini dikkate alınız.*

*Yeni işlem başlatmak için yazabilirsiniz.*
    `;
}

// BACKEND
async function callBackendAI(text) {
    const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: appState.history })
    });
    return await response.json();
}

// UI...
function addUserMessage(text) { appendMessage(createMsgDiv(text, 'user')); }
function addBotMessageHTML(html) { const d = createMsgDiv('', 'bot'); d.innerHTML = html; appendMessage(d); }
function addBotMessage(text) { appendMessage(createMsgDiv(text, 'bot')); }
function createMsgDiv(c, t) { const d = document.createElement('div'); d.className = `message ${t}`; d.innerText = c; return d; }
function showTyping() { const d = createMsgDiv('', 'bot'); d.id = 'typing'; d.innerHTML = '<i class="fa-solid fa-server fa-fade"></i>...'; appendMessage(d); }
function removeTyping() { const el = document.getElementById('typing'); if (el) el.remove(); }
function appendMessage(el) { const c = document.getElementById('chat-messages'); c.appendChild(el); c.scrollTop = c.scrollHeight; }
function restartChat() {
    appState = { current: STATES.IDLE, data: { dims: { w: 0, l: 0 } }, history: [] };
    document.getElementById('chat-messages').innerHTML = '';
    // Universal Greeting
    addBotMessage("İnşaat Asistanı aktif. \nHer türlü malzeme ve iş için hesap yapabilirim.");
}
