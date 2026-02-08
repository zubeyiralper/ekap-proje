const fs = require('fs');

console.log('🔧 VERİ TEMİZLEME VE DÜZELTME BAŞLIYOR...\n');

// Data dosyasını yükle
let DATA_2025;
try {
    const fileContent = fs.readFileSync('./data_2025.js', 'utf8');
    const match = fileContent.match(/const DATA_2025 = (\[[\s\S]*\]);/);
    if (match) {
        DATA_2025 = JSON.parse(match[1]);
        console.log('✅ data_2025.js yüklendi');
    }
} catch (e) {
    eval(fs.readFileSync('./data_2025.js', 'utf8'));
}

const originalCount = DATA_2025.length;
console.log(`📊 Orijinal Kayıt Sayısı: ${originalCount.toLocaleString('tr-TR')}\n`);

// 1. GEÇERSİZ POZLARI TEMİZLE
console.log('🧹 ADIM 1: Geçersiz pozlar temizleniyor...');
const validData = DATA_2025.filter(item => {
    // Geçerli poz numarası: en az bir nokta içermeli
    return item.id && item.id.includes('.');
});

const removedInvalid = originalCount - validData.length;
console.log(`   ❌ Silinen geçersiz poz: ${removedInvalid}`);
console.log(`   ✅ Kalan geçerli poz: ${validData.length.toLocaleString('tr-TR')}\n`);

// 2. FİYATSIZ POZLARI KONTROL ET VE RAPORLA
console.log('💰 ADIM 2: Fiyatsız pozlar kontrol ediliyor...');
const fiyatsizPozlar = validData.filter(item =>
    !item.fiyatlar || !item.fiyatlar[2025] || item.fiyatlar[2025] <= 0
);

console.log(`   ⚠️ Fiyatsız poz sayısı: ${fiyatsizPozlar.length}`);

// Kuruma göre fiyatsız pozlar
const fiyatsizKurum = {};
fiyatsizPozlar.forEach(item => {
    const kurum = item.kurum || 'Belirsiz';
    fiyatsizKurum[kurum] = (fiyatsizKurum[kurum] || 0) + 1;
});

console.log('   📋 Kuruma göre fiyatsız pozlar:');
Object.entries(fiyatsizKurum)
    .sort((a, b) => b[1] - a[1])
    .forEach(([kurum, count]) => {
        console.log(`      ${kurum}: ${count} poz`);
    });

// Fiyatsız pozları dosyaya kaydet
const fiyatsizRapor = fiyatsizPozlar.map(item => ({
    id: item.id,
    kurum: item.kurum,
    tanim: item.tanim,
    birim: item.birim
}));

fs.writeFileSync(
    'fiyatsiz_pozlar_raporu.json',
    JSON.stringify(fiyatsizRapor, null, 2),
    'utf8'
);
console.log(`   📄 Rapor kaydedildi: fiyatsiz_pozlar_raporu.json\n`);

// 3. TEMİZ VERİYİ KAYDET
console.log('💾 ADIM 3: Temiz veri kaydediliyor...');

// Yedek al
fs.copyFileSync('data_2025.js', 'data_2025_backup.js');
console.log('   📦 Yedek oluşturuldu: data_2025_backup.js');

// Temiz veriyi kaydet
const cleanedContent = `const DATA_2025 = ${JSON.stringify(validData, null, 2)};`;
fs.writeFileSync('data_2025.js', cleanedContent, 'utf8');
console.log('   ✅ Temiz veri kaydedildi: data_2025.js\n');

// 4. ÖZET İSTATİSTİKLER
console.log('📊 TEMİZLEME ÖZETİ:');
console.log(`   Orijinal Kayıt: ${originalCount.toLocaleString('tr-TR')}`);
console.log(`   Silinen Geçersiz: ${removedInvalid}`);
console.log(`   Kalan Geçerli: ${validData.length.toLocaleString('tr-TR')}`);
console.log(`   Fiyatlı Poz: ${(validData.length - fiyatsizPozlar.length).toLocaleString('tr-TR')}`);
console.log(`   Fiyatsız Poz: ${fiyatsizPozlar.length}`);

const analizliCount = validData.filter(item => item.analiz && item.analiz.length > 0).length;
console.log(`   Analizli Poz: ${analizliCount.toLocaleString('tr-TR')}\n`);

console.log('✅ VERİ TEMİZLEME TAMAMLANDI!\n');
