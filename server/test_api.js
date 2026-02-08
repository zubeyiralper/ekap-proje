require('dotenv').config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.error) {
            console.error("API Error:", data.error);
        } else {
            console.log("AVAILABLE MODELS:", data.models?.map(m => m.name));
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

listModels();
