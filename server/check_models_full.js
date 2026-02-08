require('dotenv').config();

async function list() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        const flashModels = data.models
            .map(m => m.name)
            .filter(n => n.includes('flash')); // Sadece Flash modellerini göster

        console.log("MEVCUT FLASH MODELLERİ:", JSON.stringify(flashModels, null, 2));
    } catch (e) {
        console.error(e);
    }
}
list();
