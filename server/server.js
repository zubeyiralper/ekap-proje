require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// ÇOK HIZLI VE SADE PROMPT
const SYSTEM_PROMPT = `HESAP ROBOTU.
KURALLAR:
- "Merhaba" deme.
- Sadece soru veya cevap ver.
- Format: Tablo.
`;

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;

        // Timeout kontrolü için AbortController
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15 Saniye limit

        // Mesajları hazırla (Sadece son 1 geçmiş mesaj + sistem)
        const openAIMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...(history || []).slice(-2).map(h => ({
                role: h.role === 'model' ? 'assistant' : 'user',
                content: h.parts[0].text
            })),
            { role: 'user', content: message }
        ];

        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: openAIMessages,
                model: 'openai', // Free tiers: openai, searchgpt, karma
                seed: Math.floor(Math.random() * 1000) // Caching önlemek için
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);
        const text = await response.text();
        res.json({ reply: text });

    } catch (error) {
        console.error("Hata:", error.message);
        if (error.name === 'AbortError') {
            res.status(504).json({ error: "Sunucu yanıt vermedi (Zaman aşımı). Lütfen tekrar deneyin." });
        } else {
            res.status(500).json({ error: "Sunucu Hatası: " + error.message });
        }
    }
});

app.listen(PORT, () => {});
