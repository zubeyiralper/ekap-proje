document.addEventListener('DOMContentLoaded', () => {

    // EĞER data.js SİLİNMİŞSE ÇÖKMEYİ ENGELLE
    if (typeof POZ_DATA === 'undefined') {
        window.POZ_DATA = [];
    }

    // SABİTLER
    const ENFLASYON_CARPANI = 1.25; // 2026 Tahmini için

    const pozIndex = new Map();
    POZ_DATA.forEach(item => {
        if (item && item.id !== undefined && item.id !== null) {
            pozIndex.set(item.id, item);
        }
    });

    function getPozById(id) {
        return pozIndex.get(id);
    }

    function registerPoz(item) {
        if (!item) return;
        if (item.id !== undefined && item.id !== null) {
            pozIndex.set(item.id, item);
        }
    }
    // ============================================
    // VERİ ENTEGRASYONU
    // ============================================

    // 2024 Verisi
    if (typeof EXTRA_DATA !== 'undefined' && Array.isArray(EXTRA_DATA)) {
        let mergedCount = 0;
        EXTRA_DATA.forEach(newItem => {
            const searchId = String(newItem.id ?? '').trim();
            const existing = getPozById(searchId);
            if (existing) {
                if (!existing.fiyatlar) existing.fiyatlar = {};
                if (newItem.fiyatlar && newItem.fiyatlar[2024] > 0) {
                    existing.fiyatlar[2024] = newItem.fiyatlar[2024];
                }
            } else {
                POZ_DATA.push(newItem);
                registerPoz(newItem);
                mergedCount++;
            }
        });
    }

    // 2025 Legacy Verisi
    if (typeof EXTRA_DATA_2025 !== 'undefined' && Array.isArray(EXTRA_DATA_2025)) {
        let mergedCount2025 = 0;
        EXTRA_DATA_2025.forEach(newItem => {
            const searchId = String(newItem.id ?? '').trim();
            const existing = getPozById(searchId);
            if (existing) {
                if (!existing.fiyatlar) existing.fiyatlar = {};
                if (newItem.fiyatlar && newItem.fiyatlar[2025] !== null) {
                    existing.fiyatlar[2025] = newItem.fiyatlar[2025];
                }
                if (!existing.birim || existing.birim === '-') existing.birim = newItem.birim;
            } else {
                POZ_DATA.push(newItem);
                registerPoz(newItem);
                mergedCount2025++;
            }
        });
    }

    // KGM 2024 Verisi
    if (typeof KGM_DATA !== 'undefined' && Array.isArray(KGM_DATA)) {
        let mergedCountKGM = 0;
        KGM_DATA.forEach(newItem => {
            const searchId = String(newItem.id ?? '').trim();
            const existing = getPozById(searchId);
            if (existing) {
                if (!existing.fiyatlar) existing.fiyatlar = {};
                if (newItem.fiyatlar && newItem.fiyatlar[2024]) {
                    existing.fiyatlar[2024] = newItem.fiyatlar[2024];
                }
            } else {
                POZ_DATA.push(newItem);
                registerPoz(newItem);
                mergedCountKGM++;
            }
        });
    }

    // DATA_2024 Entegrasyonu
    if (typeof DATA_2024 !== 'undefined' && Array.isArray(DATA_2024)) {
        let added = 0;
        DATA_2024.forEach(item => {
            const existing = getPozById(item.id);
            if (existing) {
                if (!existing.fiyatlar) existing.fiyatlar = {};
                existing.fiyatlar[2024] = item.fiyatlar[2024];
            } else {
                POZ_DATA.push(item);
                registerPoz(item);
                added++;
            }
        });
    }

    // DATA_2025 Entegrasyonu (Analiz ile)
    if (typeof DATA_2025 !== 'undefined' && Array.isArray(DATA_2025)) {
        let added = 0;
        DATA_2025.forEach(item => {
            const existing = getPozById(item.id);
            if (existing) {
                if (!existing.fiyatlar) existing.fiyatlar = {};
                existing.fiyatlar[2025] = item.fiyatlar[2025];

                if (item.analiz && item.analiz.length > 0) {
                    existing.analiz = item.analiz;
                }
                const itemTanim = typeof item.tanim === 'string' ? item.tanim : '';
                const existingTanim = typeof existing.tanim === 'string' ? existing.tanim : '';
                if (itemTanim.length > 0 && itemTanim.length > existingTanim.length) {
                    existing.tanim = itemTanim;
                }
            } else {
                POZ_DATA.push(item);
                registerPoz(item);
                added++;
            }
        });
    }

    // DATA_2026 Entegrasyonu (YENİ PDF ARACI)
    if (typeof POZ_DATA_2026 !== 'undefined' && Array.isArray(POZ_DATA_2026)) {
        let added = 0;
        POZ_DATA_2026.forEach(item => {
            const searchId = String(item.id ?? '').trim();
            const existing = getPozById(searchId);

            // Fiyat Parse Et (1.234,56 -> 1234.56)
            let rawPrice = item.fiyat;
            let finalPrice = 0;
            if (typeof rawPrice === 'number') {
                finalPrice = rawPrice;
            } else if (typeof rawPrice === 'string') {
                finalPrice = parseFloat(rawPrice.replace(/\./g, '').replace(',', '.'));
            }

            if (existing) {
                if (!existing.fiyatlar) existing.fiyatlar = {};
                existing.fiyatlar[2026] = finalPrice;

                // Tanım güncelle (daha güncel)
                existing.tanim = item.tanim;
                existing.birim = item.birim;
            } else {
                // Yeni Poz Oluştur
                const newEntry = {
                    id: searchId,
                    tanim: item.tanim,
                    birim: item.birim,
                    fiyatlar: { 2026: finalPrice },
                    analiz: [] // Analizi şimdilik boş
                };
                POZ_DATA.push(newEntry);
                registerPoz(newEntry);
                added++;
            }
        });
    }

    // ============================================
    // DOM ELEMANLARI
    // ============================================
    const mainContainer = document.getElementById('main-container');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const resultsContainer = document.getElementById('results-container');
    const resultContent = document.getElementById('result-content');
    const miniSearchInput = document.getElementById('mini-search-input');
    const miniLogo = document.querySelector('.mini-logo');

    // ============================================
    // EVENT LISTENERS
    // ============================================
    searchBtn.addEventListener('click', () => window.performSearch(searchInput.value));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') window.performSearch(searchInput.value);
    });
    miniSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') window.performSearch(miniSearchInput.value);
    });
    miniLogo.addEventListener('click', () => resetSearch());

    // URL Parametre Kontrolü (Deep Linking)
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
        // Sayfa yüklendiğinde otomatik arama (Gecikmesiz)
        searchInput.value = searchParam;
        window.performSearch(searchParam);
    }

    // ============================================
    // ARAMA FONKSİYONU
    // ============================================
    window.performSearch = function (query) {
        if (!query.trim()) return;
        const results = searchData(query);
        mainContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        miniSearchInput.value = query;
        renderResults(results);
        window.scrollTo(0, 0); // Sayfanın en üstüne git
    };

    function searchData(query) {
        const lowerQuery = query.toLocaleLowerCase('tr-TR').trim();
        return POZ_DATA.filter(item => {
            const idMatch = String(item.id ?? '').trim().toLowerCase().includes(lowerQuery);
            const tanimMatch = String(item.tanim ?? '').toLocaleLowerCase('tr-TR').includes(lowerQuery);
            const kurumMatch = String(item.kurum ?? '').toLocaleLowerCase('tr-TR').includes(lowerQuery);
            return idMatch || tanimMatch || kurumMatch;
        });
    }

    // ============================================
    // PARA BİRİMİ FORMATLAMA
    // ============================================
    function formatCurrency(amount) {
        if (amount === null || amount === undefined) return '-';
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount) + ' TL';
    }

    // ============================================
    // YENİ SONUÇLARI RENDER ETME (PREMIUM PANEL - REVISION 2)
    // ============================================

    function renderResults(results) {
        resultContent.innerHTML = '';

        if (results.length === 0) {
            resultContent.innerHTML = `
                <div style="text-align:center; padding: 50px; color: #5f6368;">
                    <h2>Sonuç Bulunamadı</h2>
                    <p>"${miniSearchInput.value}" ile eşleşen bir poz kaydı yok.</p>
                </div>`;
            return;
        }

        results.forEach(item => {
            // RISK: item.tanim/birim gibi alanlar eksikse render sırasında "undefined" görünebilir.
            const card = document.createElement('div');
            card.className = 'premium-panel'; // Yeni Panel Sınıfı

            // Fiyatları Hazırla
            const prices = item.fiyatlar || {};
            const price2025 = prices[2025] || 0;
            const price2026 = prices[2026] || (price2025 * ENFLASYON_CARPANI);

            const fmt2025 = formatCurrency(price2025);
            const fmt2026 = formatCurrency(price2026);

            let diffRate = 0;
            if (price2025 > 0) {
                diffRate = ((price2026 - price2025) / price2025) * 100;
            }

            // Analiz Tablosu (Grouped)
            const analizTableHTML = generateAnalizTable(Array.isArray(item.analiz) ? item.analiz : [], price2026, item.id);

            card.innerHTML = `
                <!-- 1. HEADER -->
                <div class="premium-header">
                    <div class="ph-left">
                        <div class="ph-badges">
                            <span class="badge badge-kurum">${item.kurum || 'Genel'}</span>
                            <span class="badge badge-no">${item.id}</span>
                        </div>
                        <h3 class="ph-title">${item.tanim}</h3>
                    </div>
                </div>

                <!-- 2. GRID (FİYAT & ANALİZ) - Layout Değişti: Analiz Üste -->
                <div class="premium-grid-rev2">
                    
                    <!-- Fiyat Kartı (Üstte) - Yeni Layout: label solda, toggle sağda, fiyat altta -->
                    <div class="pg-price-card-full">
                        
                        <!-- Sol: Fiyat ve Etiket -->
                        <div class="price-left-section">
                             <div class="phr-label">2026 Yıl Sonu Birim Fiyat (Tahmini)</div>
                             <div class="price-display-wrapper" id="price-display-${item.id}">
                                <span class="price-value-large">${fmt2026} <span class="unit-label" style="font-size:1rem; color:#5f6368; font-weight:normal;">/ ${item.birim || 'Birim'}</span></span>
                             </div>
                        </div>

                        <!-- Sağ: Yıl Değiştirme -->
                        <div class="price-right-section">
                             <div class="year-tabs-container">
                                <button class="yt-btn" onclick="window.switchYear(this, '${item.id}', 2025)">2025</button>
                                <button class="yt-btn active" onclick="window.switchYear(this, '${item.id}', 2026)">2026</button>
                            </div>
                        </div>

                        <!-- Gizli Veri -->
                        <div id="data-${item.id}" style="display:none;" 
                             data-p2025="${price2025}" 
                             data-p2026="${price2026}"
                             data-diff="${diffRate.toFixed(1)}"></div>
                    </div>

                    <!-- Analiz Tablosu (Accordion) -->
                    <div class="accordion-section open">
                        <div class="accordion-header" onclick="window.toggleAccordion(this)">
                            <div><i class="fas fa-layer-group"></i> ${item.id} Pozu Analizi</div>
                            <i class="fas fa-chevron-down acc-icon"></i>
                        </div>
                        <div class="accordion-content" style="display:block;">
                             ${analizTableHTML || '<div style="padding:20px; text-align:center; color:#999;">Analiz verisi bulunmamaktadır.</div>'}
                        </div>
                    </div>

                    <!-- Poz Tarifi (Accordion - Kapalı Başla) -->
                    <div class="accordion-section">
                        <div class="accordion-header" onclick="window.toggleAccordion(this)">
                            <div><i class="fas fa-align-left"></i> ${item.id} Pozu Tarifi, Yapım Şartları ve Ölçüsü</div>
                            <i class="fas fa-chevron-down acc-icon"></i>
                        </div>
                        <div class="accordion-content" style="display:none;">
                             <div class="pg-content-full">
                                ${item.tarif || generateMockDescription(item.tanim)}
                             </div>
                        </div>
                    </div>

                </div>
            `;

            resultContent.appendChild(card);
        });
    }

    // Placeholder Tarif Oluşturucu
    function generateMockDescription(title) {
        return `<strong>${title}</strong><br><br>
        Bu poz, teknik şartnamelere uygun olarak, projesinde belirtilen ölçü ve detaylara göre, gerekli her türlü malzeme, işçilik, alet ve edevat giderleri, yükleme, boşaltma, yatay ve düşey taşıma, müteahhit kârı ve genel giderler dahil (nakliye hariç) edilerek hesaplanmıştır.<br><br>
        <em>Not: Detaylı tarif verisi kurum listelerinden güncellenmektedir.</em>`;
    }

    // Analiz Tablosu Üretici (Düz Liste - Başlıksız)
    function generateAnalizTable(analizData, parentPrice2026, parentId) {
        if (!analizData || analizData.length === 0) return null;

        // Başlık satırlarını (ör: Malzeme, Nakliye vb.) filtrele
        const dataRows = analizData.filter(row => row.type !== 'header');

        if (dataRows.length === 0) return null;

        const rowsHTML = dataRows.map(r => renderAnalizRow(r, parentId)).join('');

        const tableHTML = `
            <div class="analiz-group">
                <table class="pa-table">
                    <thead>
                        <tr>
                            <th style="width:10%">Kitap</th>
                            <th style="width:15%">Poz No</th>
                            <th style="width:35%">Tanımı</th>
                            <th style="width:8%">Birimi</th>
                            <th style="width:8%">Miktarı</th>
                            <th style="width:12%; text-align:right;">Birim Fiyat</th>
                            <th style="width:12%; text-align:right;">Tutar (TL)</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHTML}</tbody>
                </table>
            </div>
        `;

        // Toplamları Hesapla (2025 ve 2026)
        let total2025 = 0;
        let total2026 = 0;

        dataRows.forEach(row => {
            const sub = getPozById(row.kod);
            const amount = parseFloat(String(row.miktar).replace(',', '.'));
            if (!isNaN(amount) && sub && sub.fiyatlar) {
                const p25 = sub.fiyatlar[2025] || 0;
                const p26 = sub.fiyatlar[2026] || (p25 * ENFLASYON_CARPANI);
                total2025 += amount * p25;
                total2026 += amount * p26;
            }
        });

        // Eğer toplam hesaplanamadıysa (veri yoksa) genel fiyattan devam et
        // 2025 Tahmini: parentPrice2026 / 1.25
        const parentPrice2025 = parentPrice2026 / ENFLASYON_CARPANI;

        // TUTARLILIK İÇİN: Footer, her zaman Ana Birim Fiyata uymalıdır.
        // Satırların toplamı (total2025) bazen veri hatasından dolayı tutmayabilir.
        // Kullanıcı "Birim Fiyat" ile "Analiz Toplamı"nın aynı olmasını bekler.
        // Bu yüzden Footer'ı tersten hesaplıyoruz (Reverse Calculation).

        const karliToplam2025 = parentPrice2025;
        const karliToplam2026 = parentPrice2026;

        // %25 Kâr Hariç Maliyet (Analiz Toplamı)
        const analizToplam2025 = karliToplam2025 / 1.25;
        const analizToplam2026 = karliToplam2026 / 1.25;

        // Kâr Miktarı
        const kar2025 = karliToplam2025 - analizToplam2025;
        const kar2026 = karliToplam2026 - analizToplam2026;

        const footerHTML = `
            <div class="analiz-footer">
                <div class="footer-row text-orange">
                    <span>Analiz Toplam (Kârsız)</span>
                    <span>
                        <span class="val-2025" style="display:none;">${formatCurrency(analizToplam2025)}</span>
                        <span class="val-2026">${formatCurrency(analizToplam2026)}</span>
                    </span>
                </div>
                <div class="footer-row text-orange">
                    <span>%25 Yüklenici Kârı</span>
                    <span>
                        <span class="val-2025" style="display:none;">${formatCurrency(kar2025)}</span>
                        <span class="val-2026">${formatCurrency(kar2026)}</span>
                    </span>
                </div>
                <div class="footer-row bold text-orange" style="border-top:1px solid #ffe0b2; padding-top:5px; margin-top:5px;">
                    <span>Genel Toplam (Birim Fiyat)</span>
                    <span>
                        <span class="val-2025" style="display:none;">${formatCurrency(karliToplam2025)}</span>
                        <span class="val-2026">${formatCurrency(karliToplam2026)}</span>
                    </span>
                </div>
            </div>
        `;

        return tableHTML + footerHTML;
    }

    function renderAnalizRow(row, parentId) {
        // Alt poz verisini bul
        const rowKod = String(row.kod ?? '');
        const subItem = getPozById(rowKod);

        let unitPrice2025 = 0;
        let unitPrice2026 = 0;

        // Alt fiyatları bul (2025 ve 2026)
        if (subItem && subItem.fiyatlar) {
            unitPrice2025 = subItem.fiyatlar[2025] || 0;
            unitPrice2026 = subItem.fiyatlar[2026] || (unitPrice2025 * ENFLASYON_CARPANI);
        }

        let amount = parseFloat(String(row.miktar ?? '').replace(',', '.'));
        let total2025 = 0;
        let total2026 = 0;

        if (!isNaN(amount)) {
            if (unitPrice2025 > 0) total2025 = amount * unitPrice2025;
            if (unitPrice2026 > 0) total2026 = amount * unitPrice2026;
        }

        // Satır kimliği
        const rowId = `row-${parentId}-${rowKod}-${Math.floor(Math.random() * 1000)}`;

        // Poz Kodu Görünümü (Tıklanmaz)
        const pozCodeDisplay = rowKod
            ? `<span style="color:#3c4043; font-weight:600; text-decoration:none; cursor:default;">
                 ${rowKod}
               </span>`
            : `<span style="color:#5f6368; font-weight:500;">-</span>`;

        const fmtUnit2025 = unitPrice2025 > 0 ? formatCurrency(unitPrice2025) : '<span class="login-link">Giriş Yap</span>';
        const fmtUnit2026 = unitPrice2026 > 0 ? formatCurrency(unitPrice2026) : '<span class="login-link">Giriş Yap</span>';

        const fmtTotal2025 = total2025 > 0 ? formatCurrency(total2025) : '<span class="login-link">Giriş Yap</span>';
        const fmtTotal2026 = total2026 > 0 ? formatCurrency(total2026) : '<span class="login-link">Giriş Yap</span>';

        return `
            <tr id="${rowId}" data-sub-code="${row.kod}">
                <td><span class="badge-kurum-mini">ÇŞB</span></td>
                <td>${pozCodeDisplay}</td>
                <td>${row.tanim}</td>
                <td style="text-align:center;">${row.birim || '-'}</td>
                <td style="text-align:center;">${amount}</td>
                <td style="text-align:right; white-space:nowrap;">
                    <span class="val-2025" style="display:none;">${fmtUnit2025}</span>
                    <span class="val-2026">${fmtUnit2026}</span>
                </td>
                <td style="text-align:right; font-weight:600; white-space:nowrap;">
                    <span class="val-2025" style="display:none;">${fmtTotal2025}</span>
                    <span class="val-2026">${fmtTotal2026}</span>
                </td>
            </tr>`;
    }

    // ============================================
    // YENİ GLOBAL FONKSİYONLAR (REVISION 2)
    // ============================================

    // Yıl Değiştirme
    window.switchYear = function (btn, itemId, year) {
        const container = btn.parentElement;
        container.querySelectorAll('.yt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Ana paneli bul ve class ekle/çıkar (CSS ile alt elemanları yönetmek için)
        const mainPanel = container.closest('.premium-panel');
        if (mainPanel) {
            if (year === 2025) {
                mainPanel.classList.add('year-2025-mode');
            } else {
                mainPanel.classList.remove('year-2025-mode');
            }
        }

        const dataDiv = document.getElementById(`data-${itemId}`);
        if (!dataDiv) return;
        const p2025 = parseFloat(dataDiv.getAttribute('data-p2025'));
        const p2026 = parseFloat(dataDiv.getAttribute('data-p2026'));
        const diff = dataDiv.getAttribute('data-diff');

        const displayWrapper = document.getElementById(`price-display-${itemId}`);
        // Label'i bulmak için (wrapper'ın kardeşi)
        const labelDiv = displayWrapper.previousElementSibling; // .phr-label

        // Birim Okuma (Sağlam Yöntem)
        let currentUnit = 'Birim';
        // Önce class ile bulmayı dene
        const unitSpan = displayWrapper.querySelector('.unit-label');
        if (unitSpan) {
            // Sadece metni al ("/ " kısmını temizle)
            currentUnit = unitSpan.innerText.replace('/', '').trim();
        } else {
            // Fallback: Text parse (ama badge hariç)
            const fullText = displayWrapper.innerText;
            if (fullText.includes('/')) {
                // Badge varsa textin sonuna eklenmiştir, o yüzden split'in ilk parçasını değil, '/' sonrası ama badge öncesi almalıyız.
                // Basitçe: " m3 \n 2026'ya göre..." gibi olabilir.
                const parts = fullText.split('/');
                if (parts.length > 1) {
                    currentUnit = parts[1].trim().split('\n')[0];
                }
            }
        }

        const unitHtml = `<span class="unit-label" style="font-size:1rem; color:#5f6368; font-weight:normal;">/ ${currentUnit}</span>`;

        if (year === 2025) {
            // Label Güncelle
            if (labelDiv) labelDiv.innerText = "2025 Birim Fiyatı";

            // Değer Güncelle
            displayWrapper.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:flex-start;">
                    <span class="price-value-large" style="color:#5f6368;">${formatCurrency(p2025)} ${unitHtml}</span>
                    <div class="price-diff-badge" style="margin-top:5px; font-size:0.9rem; padding: 4px 10px; background-color:#e6f4ea; color:#137333; border:1px solid #ceead6;">
                        <i class="fas fa-arrow-trend-up"></i> 2026 Artış Oranı: %${diff}
                    </div>
                </div>
            `;
        } else {
            // Label Güncelle
            if (labelDiv) labelDiv.innerText = "2026 Yıl Sonu Birim Fiyat (Tahmini)";

            // Değer Güncelle
            displayWrapper.innerHTML = `<span class="price-value-large">${formatCurrency(p2026)} ${unitHtml}</span>`;
        }
    };

    // Accordion Aç/Kapa
    window.toggleAccordion = function (headerElement) {
        const section = headerElement.parentElement;
        const content = section.querySelector('.accordion-content');
        const icon = headerElement.querySelector('.acc-icon');

        if (section.classList.contains('open')) {
            section.classList.remove('open');
            content.style.display = 'none';
        } else {
            section.classList.add('open');
            content.style.display = 'block';
        }
    };

    // Alt Analiz (Nested) - Güncellendi
    window.toggleNestedAnaliz = function (btn, subParams, rowId) {
        const row = document.getElementById(rowId);
        const icon = btn.querySelector('i');
        const nextRow = row.nextElementSibling;

        if (nextRow && nextRow.classList.contains('nested-analiz-row')) {
            if (nextRow.style.display === 'none') {
                nextRow.style.display = 'table-row';
                btn.classList.add('active');
                icon.className = "fas fa-caret-up";
            } else {
                nextRow.style.display = 'none';
                btn.classList.remove('active');
                icon.className = "fas fa-caret-down";
            }
            return;
        }

        const subItem = getPozById(subParams);
        if (!subItem || !subItem.analiz) return;

        const base2025 = subItem.fiyatlar ? (subItem.fiyatlar[2025] || 0) : 0;
        const p2026 = subItem.fiyatlar ? (subItem.fiyatlar[2026] || (base2025 * ENFLASYON_CARPANI)) : 0;
        // Recursive call with same group logic
        const subTableHTML = generateAnalizTable(subItem.analiz, p2026, subItem.id);

        const newRow = document.createElement('tr');
        newRow.className = 'nested-analiz-row';
        newRow.innerHTML = `
            <td colspan="7" style="padding:0;">
                <div class="nested-analiz-wrapper">
                    ${subTableHTML || 'Alt analiz bulunamadı.'}
                </div>
            </td>
        `;

        row.parentNode.insertBefore(newRow, row.nextSibling);
        btn.classList.add('active');
        icon.className = "fas fa-caret-up";
    };

    // Ana Sayfaya Dön
    window.resetSearch = function () {
        mainContainer.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        searchInput.value = '';
        searchInput.focus();
    }

});
