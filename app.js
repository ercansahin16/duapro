// Uygulama durumu
let currentDay = 0;
let learnedWords = JSON.parse(localStorage.getItem('learnedWords')) || [];
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// DOM elementleri
const todayWordsContainer = document.getElementById('todayWords');
const learnedWordsList = document.getElementById('learnedWordsList');
const currentDateElement = document.getElementById('currentDate');
const progressBar = document.getElementById('progress');
const totalWordsElement = document.getElementById('totalWords');
const prevDayButton = document.getElementById('prevDay');
const nextDayButton = document.getElementById('nextDay');
const themeToggleButton = document.getElementById('themeToggle');
const statsElement = document.getElementById('stats');

// Ay isimleri
const monthNames = [
    "1. Ay", "2. Ay", "3. Ay", "4. Ay", "5. Ay", "6. Ay",
    "7. Ay", "8. Ay", "9. Ay", "10. Ay", "11. Ay", "12. Ay"
];

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
	
	addSearchToMenu();
    // Tema ayarı
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggleButton.innerHTML = '<i class="fas fa-sun"></i> Aydınlık Tema';
    }
    
    // Günü localStorage'dan yükle veya varsayılan olarak 0 (gün 1) yap
    currentDay = parseInt(localStorage.getItem('currentDay')) || 0;
    if (currentDay >= wordsDatabase.length) {
        currentDay = wordsDatabase.length - 1;
    }
    
	
	// Hamburger menü fonksiyonları
const hamburgerBtn = document.getElementById('hamburgerBtn');
const menuClose = document.getElementById('menuClose');
const hamburgerMenu = document.getElementById('hamburgerMenu');
const menuOverlay = document.getElementById('menuOverlay');

// Hamburger menüyü aç
function openMenu() {
    hamburgerMenu.classList.add('open');
    menuOverlay.classList.add('show');
    document.body.style.overflow = 'hidden'; // Sayfa kaydırmayı engelle
}

// Hamburger menüyü kapat
function closeMenu() {
    hamburgerMenu.classList.remove('open');
    menuOverlay.classList.remove('show');
    document.body.style.overflow = 'auto'; // Sayfa kaydırmayı geri aç
}

// Event listener'ları ekle
hamburgerBtn.addEventListener('click', openMenu);
menuClose.addEventListener('click', closeMenu);
menuOverlay.addEventListener('click', closeMenu);

// ESC tuşu ile menüyü kapat
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMenu();
    }
});

// Menüden dış linklere tıklanınca menüyü kapat
document.querySelectorAll('.menu-item[href^="http"]').forEach(link => {
    link.addEventListener('click', function(e) {
        setTimeout(closeMenu, 300); // 300ms sonra kapat (animasyon için)
    });
});
    // İlerlemeyi güncelle
    updateProgress();
    
    // Bugünün kelimelerini yükle
    loadTodayWords();
    
    // Öğrenilen kelimeleri yükle (AY BAZLI)
    loadLearnedWords();
    
    // Aylık ilerleme çubuğunu ekle
    createMonthlyProgress();
    
    // Event listener'ları ekle
    prevDayButton.addEventListener('click', goToPreviousDay);
    nextDayButton.addEventListener('click', goToNextDay);
    themeToggleButton.addEventListener('click', toggleTheme);
    
    // Sayfaya sıfırlama butonu ekle
    addResetButton();
});

// Bugünün kelimelerini yükle
function loadTodayWords() {
    // Gün başlığını güncelle
    const currentMonth = Math.floor(currentDay / 30) + 1;
    const dayInMonth = (currentDay % 30) + 1;
    currentDateElement.textContent = `${currentMonth}. Ay - ${dayInMonth}. Gün (Toplam: ${currentDay + 1}. Gün)`;
    
    // Kelime kartlarını temizle
    todayWordsContainer.innerHTML = '';
    
    // Mevcut günün kelimelerini al
    const todayWords = wordsDatabase[currentDay] || [];
    
    // Her kelime için bir kart oluştur
    todayWords.forEach((word, index) => {
        const isLearned = learnedWords.some(w => 
            w.arabic === word.arabic && w.day === currentDay
        );
        
        const wordCard = document.createElement('div');
        wordCard.className = `word-card ${isLearned ? 'learned' : ''}`;
        wordCard.innerHTML = `
            <div class="arabic-word">${word.arabic}</div>
            <div class="transcription">${word.transcription}</div>
            <div class="meaning ${isLearned ? 'show' : ''}">${word.meaning}</div>
            <div class="word-actions">
                <button class="action-btn ${isLearned ? 'learned' : ''}" onclick="toggleLearned(${currentDay}, ${index}, this)">
                    <i class="fas ${isLearned ? 'fa-check-circle' : 'fa-circle'}"></i>
                    ${isLearned ? 'Öğrenildi' : 'Öğrenildi olarak işaretle'}
                </button>
                <button class="action-btn" onclick="speakWord('${word.arabic}')">
                    <i class="fas fa-volume-up"></i> Dinle
                </button>
            </div>
        `;
        
        // Kelime kartına tıklayınca anlamını göster/gizle
        wordCard.addEventListener('click', function(e) {
            // Eğer tıklanan element bir buton değilse
            if (!e.target.closest('.action-btn')) {
                const meaningElement = this.querySelector('.meaning');
                meaningElement.classList.toggle('show');
            }
        });
        
        todayWordsContainer.appendChild(wordCard);
    });
    
    // Navigasyon butonlarını güncelle
    updateNavigationButtons();
}

// Öğrenilen kelimeleri AY bazında yükle
function loadLearnedWords() {
    // Öğrenilen kelimeleri AYLARA göre grupla
    const wordsByMonth = {};
    
    learnedWords.forEach(word => {
        // Gün numarasından ay numarasını hesapla (30 gün = 1 ay)
        const monthIndex = Math.floor(word.day / 30);
        const monthDay = (word.day % 30) + 1; // Ayın kaçıncı günü
        
        if (!wordsByMonth[monthIndex]) {
            wordsByMonth[monthIndex] = {};
        }
        
        if (!wordsByMonth[monthIndex][word.day]) {
            wordsByMonth[monthIndex][word.day] = [];
        }
        
        wordsByMonth[monthIndex][word.day].push(word);
    });
    
    // HTML oluştur
    learnedWordsList.innerHTML = '';
    
    if (Object.keys(wordsByMonth).length === 0) {
        learnedWordsList.innerHTML = '<p style="text-align: center; color: var(--apple-gray); padding: 40px 20px;">Henüz öğrenilen kelime yok. İlk kelimeleri öğrenmeye başlayın!</p>';
        return;
    }
    
    // Ay sıralaması (büyükten küçüğe)
    const sortedMonths = Object.keys(wordsByMonth).sort((a, b) => b - a);
    
    // İstatistik hesapla
    let totalWords = 0;
    let totalDaysWithWords = 0;
    
    sortedMonths.forEach(monthIndex => {
        const month = wordsByMonth[monthIndex];
        const daysInMonth = Object.keys(month).length;
        let wordsInMonth = 0;
        
        Object.values(month).forEach(dayWords => {
            wordsInMonth += dayWords.length;
            totalWords += dayWords.length;
        });
        
        totalDaysWithWords += daysInMonth;
        
        const monthSection = document.createElement('div');
        monthSection.className = 'month-section';
        
        const monthTitle = document.createElement('div');
        monthTitle.className = 'month-title';
        monthTitle.innerHTML = `
            <div>
                <strong>${monthNames[monthIndex] || `Ay ${parseInt(monthIndex) + 1}`}</strong>
                <div class="month-info">
                    <span>${daysInMonth} gün</span>
                    <span>•</span>
                    <span>${wordsInMonth} kelime</span>
                    <span>•</span>
                    <span>${monthIndex >= 5 ? 'Tamamlandı' : 'Devam ediyor'}</span>
                </div>
            </div>
        `;
        
        const monthWordsContainer = document.createElement('div');
        monthWordsContainer.className = 'month-words collapsed';
        
        // Ay içindeki günleri sırala
        const sortedDays = Object.keys(month).sort((a, b) => b - a);
        
        sortedDays.forEach(day => {
            const dayWords = month[day];
            
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            dayCard.innerHTML = `
                <div class="day-card-header">
                    <span class="day-number">Gün ${parseInt(day) + 1}</span>
                    <span class="day-word-count">${dayWords.length} kelime</span>
                </div>
                <div class="day-words-list">
                    ${dayWords.map(word => `
                        <div class="learned-word-item">
                            <div class="learned-arabic">${word.arabic}</div>
                            <div class="learned-meaning">${word.meaning}</div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            monthWordsContainer.appendChild(dayCard);
        });
        
        // Akordeon işlevi
        monthTitle.addEventListener('click', () => {
            monthTitle.classList.toggle('collapsed');
            monthWordsContainer.classList.toggle('collapsed');
        });
        
        monthSection.appendChild(monthTitle);
        monthSection.appendChild(monthWordsContainer);
        learnedWordsList.appendChild(monthSection);
    });
    
    // Toplam kelime sayısını güncelle
    totalWordsElement.textContent = totalWords;
    
    // İstatistikleri güncelle
    const totalDaysProgram = wordsDatabase.length;
    const totalPercent = ((totalWords / (wordsDatabase.length * 5)) * 100).toFixed(1);
    
    // Kaç ay tamamlandığını hesapla
    const completedMonths = sortedMonths.filter(month => month >= 5).length;
    
    statsElement.innerHTML = `
        <span>${sortedMonths.length} ayda ${totalDaysWithWords} gün</span>
        <span>•</span>
        <span>${totalWords} kelime</span>
        <span>•</span>
        <span>${completedMonths}/6 ay tamamlandı</span>
    `;
}

// Ay ilerleme çubuğu oluştur
function createMonthlyProgress() {
    // Mevcut ayı hesapla (0'dan başlar)
    const currentMonth = Math.floor(currentDay / 30);
    
    const progressDiv = document.createElement('div');
    progressDiv.className = 'monthly-progress';
    
    progressDiv.innerHTML = `
        <h3 style="margin-bottom: 15px; color: var(--apple-text);">6 Aylık Kur'an Kelime Programı</h3>
        <div style="display: flex; gap: 5px; margin-bottom: 10px;">
            ${Array.from({length: 6}, (_, i) => `
                <div style="flex: 1; text-align: center; padding: 10px; 
                    background-color: ${i <= currentMonth ? 'var(--apple-green)' : 'var(--apple-light-gray)'};
                    color: ${i <= currentMonth ? 'white' : 'var(--apple-gray)'};
                    border-radius: 8px; font-weight: 500;">
                    ${i + 1}. Ay
                </div>
            `).join('')}
        </div>
        <p style="color: var(--apple-gray); font-size: 0.9rem; text-align: center;">
            ${currentMonth + 1}. ayda, ${(currentDay % 30) + 1}. gündesiniz
        </p>
    `;
    
    // İlerleme çubuğunu header'dan sonra ekle
    const header = document.querySelector('header');
    const controls = document.querySelector('.controls');
    header.insertBefore(progressDiv, controls);
}

// İlerlemeyi güncelle
function updateProgress() {
    // Toplam kelime sayısı
    const totalWordsCount = wordsDatabase.length * 5;
    
    // Öğrenilen kelime yüzdesi
    const progressPercentage = (learnedWords.length / totalWordsCount) * 100;
    
    // İlerleme çubuğunu güncelle
    progressBar.style.width = `${Math.min(progressPercentage, 100)}%`;
}

// Kelimeyi öğrenildi olarak işaretle/kaldır
function toggleLearned(day, wordIndex, button) {
    const word = wordsDatabase[day][wordIndex];
    const wordCard = button.closest('.word-card');
    
    // Kelimeyi öğrenilenler listesinde ara
    const wordIndexInLearned = learnedWords.findIndex(w => 
        w.arabic === word.arabic && w.day === day
    );
    
    if (wordIndexInLearned === -1) {
        // Kelimeyi öğrenilenlere ekle
        learnedWords.push({
            arabic: word.arabic,
            transcription: word.transcription,
            meaning: word.meaning,
            day: day
        });
        
        // Butonu ve kartı güncelle
        button.classList.add('learned');
        button.innerHTML = '<i class="fas fa-check-circle"></i> Öğrenildi';
        wordCard.classList.add('learned');
        
        // Anlamı göster
        wordCard.querySelector('.meaning').classList.add('show');
    } else {
        // Kelimeyi öğrenilenlerden çıkar
        learnedWords.splice(wordIndexInLearned, 1);
        
        // Butonu ve kartı güncelle
        button.classList.remove('learned');
        button.innerHTML = '<i class="fas fa-circle"></i> Öğrenildi olarak işaretle';
        wordCard.classList.remove('learned');
    }
    
    // LocalStorage'a kaydet
    localStorage.setItem('learnedWords', JSON.stringify(learnedWords));
    
    // Öğrenilen kelimeler listesini ve ilerlemeyi güncelle
    loadLearnedWords();
    updateProgress();
}

// Kelimeyi sesli oku (tarayıcı desteği varsa)
function speakWord(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA'; // Arapça (Suudi Arabistan) aksanı
        utterance.rate = 0.8; // Okuma hızı
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Tarayıcınız ses sentezini desteklemiyor.");
    }
}

// Navigasyon butonlarını güncelle
function updateNavigationButtons() {
    nextDayButton.disabled = currentDay >= wordsDatabase.length - 1;
    prevDayButton.disabled = currentDay <= 0;
}

// Önceki güne git
function goToPreviousDay() {
    if (currentDay > 0) {
        currentDay--;
        localStorage.setItem('currentDay', currentDay);
        loadTodayWords();
        // Aylık ilerleme çubuğunu güncelle
        updateMonthlyProgress();
    }
}

// Sonraki güne git
function goToNextDay() {
    if (currentDay < wordsDatabase.length - 1) {
        currentDay++;
        localStorage.setItem('currentDay', currentDay);
        loadTodayWords();
        // Aylık ilerleme çubuğunu güncelle
        updateMonthlyProgress();
    }
}

// Aylık ilerleme çubuğunu güncelle
function updateMonthlyProgress() {
    const progressDiv = document.querySelector('.monthly-progress');
    if (progressDiv) {
        const currentMonth = Math.floor(currentDay / 30);
        
        progressDiv.innerHTML = `
            <h3 style="margin-bottom: 15px; color: var(--apple-text);">6 Aylık Kur'an Kelime Programı</h3>
            <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                ${Array.from({length: 6}, (_, i) => `
                    <div style="flex: 1; text-align: center; padding: 10px; 
                        background-color: ${i <= currentMonth ? 'var(--apple-green)' : 'var(--apple-light-gray)'};
                        color: ${i <= currentMonth ? 'white' : 'var(--apple-gray)'};
                        border-radius: 8px; font-weight: 500;">
                        ${i + 1}. Ay
                    </div>
                `).join('')}
            </div>
            <p style="color: var(--apple-gray); font-size: 0.9rem; text-align: center;">
                ${currentMonth + 1}. ayda, ${(currentDay % 30) + 1}. gündesiniz
            </p>
        `;
    }
}

// Tema değiştir
function toggleTheme() {
    isDarkMode = !isDarkMode;
    
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggleButton.innerHTML = '<i class="fas fa-sun"></i> Aydınlık Tema';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggleButton.innerHTML = '<i class="fas fa-moon"></i> Koyu Tema';
    }
    
    localStorage.setItem('darkMode', isDarkMode);
}

// Sayfaya sıfırlama butonu ekle
function addResetButton() {
    const resetButton = document.createElement('button');
    resetButton.className = 'btn btn-outline';
    resetButton.style.marginTop = '20px';
    resetButton.style.fontSize = '0.8rem';
    resetButton.innerHTML = '<i class="fas fa-redo"></i> İlerlemeyi Sıfırla';
    resetButton.onclick = resetProgress;
    document.querySelector('.controls').appendChild(resetButton);
}

// Sayfayı sıfırla
function resetProgress() {
    if (confirm("Tüm ilerlemeniz sıfırlanacak. Emin misiniz?")) {
        localStorage.removeItem('learnedWords');
        localStorage.removeItem('currentDay');
        localStorage.removeItem('darkMode');
        currentDay = 0;
        learnedWords = [];
        isDarkMode = false;
        document.body.classList.remove('dark-mode');
        themeToggleButton.innerHTML = '<i class="fas fa-moon"></i> Tema Değiştir';
        loadTodayWords();
        loadLearnedWords();
        updateProgress();
        updateMonthlyProgress();
    }
}

// CSS stilleri için
const style = document.createElement('style');
style.textContent = `
    .monthly-progress {
        background-color: var(--card-bg);
        padding: 20px;
        border-radius: 14px;
        border: 1px solid var(--border-color);
        margin: 20px 0;
    }
    
    .frequency {
        font-size: 0.8rem;
        margin-left: 8px;
        padding: 2px 6px;
        border-radius: 10px;
        font-weight: normal;
    }
    .frequency.high {
        background-color: rgba(52, 199, 89, 0.2);
        color: #34c759;
    }
    .frequency.medium {
        background-color: rgba(0, 113, 227, 0.2);
        color: #0071e3;
    }
    .frequency.low {
        background-color: rgba(134, 134, 139, 0.2);
        color: #86868b;
    }
`;
document.head.appendChild(style);



// app.js dosyasına bu geliştirilmiş fonksiyonu ekleyin

// Menüde arama özelliği
function addSearchToMenu() {
    const menuItemsContainer = document.querySelector('.menu-items');
    const menuSections = document.querySelectorAll('.menu-section');
    
    // Arama konteynerini oluştur
    const searchContainer = document.createElement('div');
    searchContainer.className = 'menu-search';
    searchContainer.innerHTML = `
        <input type="text" id="menuSearch" placeholder="Menüde ara...">
        <button class="clear-search" id="clearSearch" aria-label="Aramayı temizle">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Arama kutusunu menünün en üstüne ekle
    menuItemsContainer.insertBefore(searchContainer, menuItemsContainer.firstChild);
    
    const searchInput = document.getElementById('menuSearch');
    const clearSearchBtn = document.getElementById('clearSearch');
    
    // Arama fonksiyonu
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        // Arama sonuçlarını say
        let totalResults = 0;
        
        menuSections.forEach(section => {
            const menuItems = section.querySelectorAll('.menu-item');
            let sectionHasVisibleItems = false;
            let sectionResults = 0;
            
            menuItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                const matches = searchTerm === '' || text.includes(searchTerm);
                
                if (matches) {
                    item.style.display = 'flex';
                    item.style.animation = 'fadeIn 0.3s ease';
                    sectionHasVisibleItems = true;
                    sectionResults++;
                    totalResults++;
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Bölüm başlığını güncelle
            const sectionHeader = section.querySelector('h4');
            if (sectionHeader) {
                if (searchTerm === '') {
                    sectionHeader.innerHTML = sectionHeader.innerHTML.replace(/<span class="search-count">.*<\/span>/, '');
                    section.style.display = 'block';
                } else {
                    const existingCount = sectionHeader.querySelector('.search-count');
                    if (existingCount) {
                        existingCount.textContent = ` (${sectionResults})`;
                    } else {
                        const countSpan = document.createElement('span');
                        countSpan.className = 'search-count';
                        countSpan.textContent = ` (${sectionResults})`;
                        countSpan.style.color = 'var(--apple-blue)';
                        countSpan.style.fontWeight = 'normal';
                        sectionHeader.appendChild(countSpan);
                    }
                    section.style.display = sectionHasVisibleItems ? 'block' : 'none';
                }
            }
        });
        
        // Toplam sonuç bildirimi
        const searchInfo = document.getElementById('searchInfo') || (() => {
            const infoDiv = document.createElement('div');
            infoDiv.id = 'searchInfo';
            infoDiv.style.padding = '0 20px 10px';
            infoDiv.style.fontSize = '0.85rem';
            infoDiv.style.color = 'var(--apple-gray)';
            infoDiv.style.display = 'none';
            searchContainer.parentNode.insertBefore(infoDiv, searchContainer.nextSibling);
            return infoDiv;
        })();
        
        if (searchTerm === '') {
            searchInfo.style.display = 'none';
        } else {
            searchInfo.style.display = 'block';
            searchInfo.innerHTML = `<i class="fas fa-search"></i> ${totalResults} sonuç bulundu`;
            if (totalResults === 0) {
                searchInfo.innerHTML = `<i class="fas fa-search"></i> "$${searchTerm}" için sonuç bulunamadı`;
                searchInfo.style.color = 'var(--apple-green)';
            }
        }
        
        // Temizle butonunu göster/gizle
        clearSearchBtn.style.display = searchTerm === '' ? 'none' : 'block';
    }
    
    // Event listener'lar
    searchInput.addEventListener('input', performSearch);
    
    // Temizle butonu
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchInput.focus();
        performSearch();
    });
    
    // ESC tuşu ile aramayı temizle
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            performSearch();
        }
    });
    
    // Menü açıldığında arama kutusuna focus
    hamburgerBtn.addEventListener('click', function() {
        setTimeout(() => {
            searchInput.focus();
        }, 400); // Menü animasyonu bittikten sonra
    });
    
    // Arama animasyonu için CSS ekle
    const searchStyle = document.createElement('style');
    searchStyle.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .menu-item {
            transition: all 0.2s ease;
        }
        
        .menu-item.highlight {
            background-color: rgba(0, 113, 227, 0.1);
            border-left: 3px solid var(--apple-blue);
        }
        
        .search-highlight {
            background-color: rgba(255, 193, 7, 0.3);
            padding: 0 2px;
            border-radius: 2px;
        }
    `;
    document.head.appendChild(searchStyle);
}

