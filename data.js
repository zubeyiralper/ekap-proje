const POZ_DATA = [
    {
        id: "15.120.1001",
        kurum: "ÇŞB",
        tanim: "C 25/30 sınıfı hazır beton dökülmesi, yerleştirilmesi (Beton nakli dahil)",
        birim: "m³",
        fiyat: 2450.50,
        analiz: [
            { kod: "04.150", tanim: "Hazır Beton (C 25/30)", miktar: "1.00", birim: "m³", tutar: 2100.00 },
            { kod: "İşçilik", tanim: "Beton Döküm ve Vibratör İşçiliği", miktar: "1.00", birim: "saat", tutar: 250.00 },
            { kod: "Genel", tanim: "Nakliye ve Diğer Giderler", miktar: "1.00", birim: "adet", tutar: 100.50 }
        ]
    },
    {
        id: "15.255.1002",
        kurum: "ÇŞB",
        tanim: "190x190x135 mm Yatay Delikli Tuğla ile Duvar Örülmesi",
        birim: "m²",
        fiyat: 485.75,
        analiz: [
            { kod: "04.017", tanim: "Yatay Delikli Tuğla (190x190x135)", miktar: "25.00", birim: "adet", tutar: 250.00 },
            { kod: "10.001", tanim: "Harç Yapılması", miktar: "0.02", birim: "m³", tutar: 85.75 },
            { kod: "İşçilik", tanim: "Duvarcı Ustası ve Yardımcısı", miktar: "0.50", birim: "saat", tutar: 150.00 }
        ]
    },
    {
        id: "Y.23.010",
        kurum: "KGM",
        tanim: "Ø 8-12 mm Nervürlü Beton Çelik Çubuğu",
        birim: "ton",
        fiyat: 18500.00,
        analiz: [
            { kod: "04.200", tanim: "Nervürlü Çelik", miktar: "1.00", birim: "ton", tutar: 17000.00 },
            { kod: "İşçilik", tanim: "Demir Bağlama İşçiliği", miktar: "20.00", birim: "saat", tutar: 1500.00 }
        ]
    },
    {
        id: "A.101",
        kurum: "Özel",
        tanim: "Hafriyat ve Kazı İşleri (Makine ile)",
        birim: "m³",
        fiyat: 120.00,
        analiz: [
            { kod: "M.001", tanim: "Ekskavatör Çalışması", miktar: "0.05", birim: "saat", tutar: 100.00 },
            { kod: "M.002", tanim: "Kamyon Nakliyesi", miktar: "0.20", birim: "sefer", tutar: 20.00 }
        ]
    },
    {
        id: "15.150.1105",
        kurum: "ÇŞB",
        tanim: "Beton santralinde üretilen veya satın alınan ve beton pompasıyla basılan, C 25/30 basınç dayanım sınıfında, beyaz renkte, normal hazır beton dökülmesi (beton nakli dahil)",
        detayli_tanim: "Beton üretimine uygun komple beton tesisinde (asgari 60m3/sa kapasiteli, dört gözlü agrega bunkerli kompresörlü ve kumanda kabini ile birlikte bilgisayar kontrollü, min. 50 ton kapasiteli çimento silosu bulunan konveyör bant sistemli) standardına ve projesine uygun, yıkanmış, elenmiş granülometrik kum-çakıl ve/veya kırmataş, çimento, su ve gerektiğinde katkı malzemesi ile C 25/30 sınıfında üretilen veya bu niteliklere sahip beton tesisinden satın alınan hazır beton harcının; beton kalite kontrollerinin yapılması, transmikserlere yüklenmesi, işyerine kadar nakli, döküm yerine beton pompası ile basılması, yerleştirilmesi, vibratör ile sıkıştırılması, sulanması, soğuktan, sıcaktan ve diğer dış tesirlerden korunması ve bakımının yapılması, gerekli ve yeter sayıda deney için numune alınması ve gerekli deneylerin yapılması için gerekli her türlü işçilik, malzeme ve zayiatı, makine araç, gereç ve laboratuvar giderleri dahil, yerinde dökülmüş ve basınç dayanımı C 25/30 olan beyaz renkte, normal hazır betonun 1 m³ fiyatı: <br><br> ÖLÇÜ: Projedeki boyutlar üzerinden hesaplanır.",
        birim: "m³",
        fiyatlar: {
            2025: 3900.69,
            2024: 2525.40
        },
        analiz: [
            { kod: "10.130.1022", tanim: "Beyaz Hazır Beton (C 25/30)", miktar: "1.00", birim: "m³", tutar: 3500.00 },
            { kod: "İşçilik", tanim: "Beton Pompası ve Döküm İşçiliği", miktar: "1.00", birim: "saat", tutar: 400.69 }
        ]
    },
    {
        id: "10.130.1022",
        kurum: "ÇŞB",
        tanim: "Beyaz Hazır Beton (C 25/30) Satın Alınması",
        birim: "m³",
        fiyat: 3500.00,
        analiz: [
            { kod: "04.004", tanim: "Beyaz Çimento", miktar: "350", birim: "kg", tutar: 2000.00 },
            { kod: "04.001", tanim: "Kum-Çakıl", miktar: "1.2", birim: "ton", tutar: 1500.00 }
        ]
    },
    {
        id: "18.198.1001",
        kurum: "ÇŞB",
        tanim: "04.270 kodlu çam kerestesi ile ahşap seri kalıp yapılması",
        birim: "m²",
        fiyatlar: {
            2024: 450.00
            /* 2025 missing intentionally */
        },
        analiz: []
    }
];
