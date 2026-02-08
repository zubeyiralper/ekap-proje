const fs = require('fs');

console.log('🔍 2025 VERİ ANALİZİ BAŞLIYOR...\n');

// Data dosyasını yükle
let DATA_2025;
try {
    const fileContent = fs.readFileSync('./data_2025.js', 'utf8');
    // const DATA_2025 = [...] yapısını parse et
    const match = fileContent.match(/const DATA_2025 = (\[[\s\S]*\]);/);
    if (match) {
        DATA_2025 = JSON.parse(match[1]);
        console.log('✅ data_2025.js başarıyla yüklendi');
    } else {
        throw new Error('DATA_2025 array bulunamadı');
    }
} catch (e) {
    console.error('❌ data_2025.js yüklenemedi:', e.message);
    console.log('\n⚡ Alternatif yöntem deneniyor...');

    // HTML içinde script olarak yüklendiğinde çalışır
    try {
        eval(fs.readFileSync('./data_2025.js', 'utf8'));
        console.log('✅ Alternatif yöntemle yüklendi');
    } catch (e2) {
        console.error('❌ Alternatif yöntem de başarısız:', e2.message);
        process.exit(1);
    }
}

const data = DATA_2025;
console.log(`\n📊 GENEL İSTATİSTİKLER:`);
console.log(`   Toplam Kayıt: ${data.length.toLocaleString('tr-TR')}`);

// Geçerli poz numaraları (nokta içerenler)
const validPozlar = data.filter(item => item.id && item.id.includes('.'));
console.log(`   Geçerli Poz No: ${validPozlar.length.toLocaleString('tr-TR')}`);

// Geçersiz poz numaraları
const invalidPozlar = data.filter(item => !item.id || !item.id.includes('.'));
console.log(`   Geçersiz Poz No: ${invalidPozlar.length.toLocaleString('tr-TR')}`);

// Kuruma göre dağılım
const kurumlar = {};
data.forEach(item => {
    const kurum = item.kurum || 'Belirsiz';
    kurumlar[kurum] = (kurumlar[kurum] || 0) + 1;
});

console.log(`\n🏢 KURUMLARA GÖRE DAĞILIM:`);
Object.entries(kurumlar)
    .sort((a, b) => b[1] - a[1])
    .forEach(([kurum, count]) => {
        console.log(`   ${kurum}: ${count.toLocaleString('tr-TR')} poz`);
    });

// Analiz verisi olanlar
const analizliPozlar = data.filter(item => item.analiz && item.analiz.length > 0);
console.log(`\n📋 ANALİZ VERİSİ:`);
console.log(`   Analizli Pozlar: ${analizliPozlar.length.toLocaleString('tr-TR')}`);
console.log(`   Analizsiz Pozlar: ${(data.length - analizliPozlar.length).toLocaleString('tr-TR')}`);

// Fiyat kontrolü
const fiyatliPozlar = data.filter(item => item.fiyatlar && item.fiyatlar[2025] && item.fiyatlar[2025] > 0);
const fiyatsizPozlar = data.filter(item => !item.fiyatlar || !item.fiyatlar[2025] || item.fiyatlar[2025] <= 0);

console.log(`\n💰 FİYAT DURUMU:`);
console.log(`   Fiyatlı Pozlar: ${fiyatliPozlar.length.toLocaleString('tr-TR')}`);
console.log(`   Fiyatsız/Geçersiz: ${fiyatsizPozlar.length.toLocaleString('tr-TR')}`);

// Örnek geçerli pozlar
console.log(`\n✅ ÖRNEK GEÇERLİ POZLAR (İlk 10):`);
validPozlar.slice(0, 10).forEach(item => {
    const fiyat = item.fiyatlar && item.fiyatlar[2025] ? item.fiyatlar[2025] : 0;
    console.log(`   ${item.id} - ${item.tanim.substring(0, 50)}... (${fiyat} TL)`);
});

// Örnek geçersiz pozlar
if (invalidPozlar.length > 0) {
    console.log(`\n⚠️ ÖRNEK GEÇERSİZ POZLAR (İlk 10):`);
    invalidPozlar.slice(0, 10).forEach(item => {
        console.log(`   "${item.id}" - ${item.tanim.substring(0, 50)}...`);
    });
}

console.log('\n✅ Analiz tamamlandı!\n');
