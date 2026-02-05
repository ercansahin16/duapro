// KUR'AN'DA EN ÇOK GEÇEN KELİMELER
// Kaynak: Kur'an İstatistikleri ve Sık Kullanılan Kelimeler
const baseWords = [
    // EN TEMEL KELİMELER (1000+ geçiş)
    { arabic: "إِلَّا", transcription: "illâ", meaning: "Ancak, hariç" },
    { arabic: "إِنَّ", transcription: "inne", meaning: "Şüphesiz, muhakkak" },
    { arabic: "الَّذِي", transcription: "ellezî", meaning: "O ki, ...olan" },
    { arabic: "مِن", transcription: "min", meaning: "-den, -dan" },
    { arabic: "عَلَى", transcription: "alâ", meaning: "Üzerinde, üzerine" },
    { arabic: "أَن", transcription: "en", meaning: "Ki, -mesi" },
    { arabic: "لَا", transcription: "lâ", meaning: "Hayır, yok" },
    { arabic: "فِي", transcription: "fî", meaning: "İçinde, -de" },
    { arabic: "مَا", transcription: "mâ", meaning: "Ne, ...şey" },
    { arabic: "هُوَ", transcription: "huve", meaning: "O (eril)" },
    
    // TANRI İLE İLGİLİ KELİMELER
    { arabic: "اللَّهُ", transcription: "Allâh", meaning: "Allah" },
    { arabic: "رَبّ", transcription: "rabb", meaning: "Rab, Efendi" },
    { arabic: "إِلَٰه", transcription: "ilâh", meaning: "İlah, tanrı" },
    { arabic: "رَحْمَة", transcription: "rahmet", meaning: "Rahmet, merhamet" },
    { arabic: "رَحِيم", transcription: "rahîm", meaning: "Rahim, merhametli" },
    { arabic: "غَفُور", transcription: "ğafûr", meaning: "Gafur, bağışlayan" },
    { arabic: "عَزِيز", transcription: "azîz", meaning: "Aziz, güçlü" },
    { arabic: "حَكِيم", transcription: "hakîm", meaning: "Hakim, hikmet sahibi" },
    { arabic: "عَلِيم", transcription: "alîm", meaning: "Alim, bilen" },
    { arabic: "سَمِيع", transcription: "semî'", meaning: "Semi', işiten" },
    
    // İNSAN VE TOPLUM
    { arabic: "إِنْسَان", transcription: "insân", meaning: "İnsan" },
    { arabic: "قَوْم", transcription: "kavm", meaning: "Kavim, toplum" },
    { arabic: "نَاس", transcription: "nâs", meaning: "İnsanlar" },
    { arabic: "أُمَّة", transcription: "ümmet", meaning: "Ümmet, topluluk" },
    { arabic: "قَلْب", transcription: "kalb", meaning: "Kalp, gönül" },
    { arabic: "نَفْس", transcription: "nefs", meaning: "Nefis, benlik" },
    { arabic: "رُوح", transcription: "rûh", meaning: "Ruh" },
    { arabic: "عَقْل", transcription: "akl", meaning: "Akıl" },
    { arabic: "يَد", transcription: "yed", meaning: "El" },
    { arabic: "وَجْه", transcription: "vech", meaning: "Yüz, vechi" },
    
    // DİNİ TERİMLER
    { arabic: "إِيمَان", transcription: "îmân", meaning: "İman" },
    { arabic: "إِسْلَام", transcription: "islâm", meaning: "İslam" },
    { arabic: "صَلَاة", transcription: "salât", meaning: "Namaz" },
    { arabic: "زَكَاة", transcription: "zekât", meaning: "Zekat" },
    { arabic: "صَوْم", transcription: "savm", meaning: "Oruç" },
    { arabic: "حَجّ", transcription: "hacc", meaning: "Hac" },
    { arabic: "قُرْآن", transcription: "Kur'ân", meaning: "Kur'an" },
    { arabic: "كِتَاب", transcription: "kitâb", meaning: "Kitap" },
    { arabic: "آيَة", transcription: "âye", meaning: "Ayet" },
    { arabic: "سُورَة", transcription: "sûre", meaning: "Sure" },
    
    // AHİRET VE KADER
    { arabic: "يَوْم", transcription: "yevm", meaning: "Gün" },
    { arabic: "آخِرَة", transcription: "âhire", meaning: "Ahiret" },
    { arabic: "دُنْيَا", transcription: "dünyâ", meaning: "Dünya" },
    { arabic: "حَيَاة", transcription: "hayât", meaning: "Hayat" },
    { arabic: "مَوْت", transcription: "mevt", meaning: "Ölüm" },
    { arabic: "قِيَامَة", transcription: "kıyâme", meaning: "Kıyamet" },
    { arabic: "جَنَّة", transcription: "cenne", meaning: "Cennet" },
    { arabic: "نَار", transcription: "nâr", meaning: "Ateş, cehennem" },
    { arabic: "ثَوَاب", transcription: "sevâb", meaning: "Sevap" },
    { arabic: "عَذَاب", transcription: "azâb", meaning: "Azap" },
    
    // PEYGAMBERLER
    { arabic: "رَسُول", transcription: "resûl", meaning: "Elçi, peygamber" },
    { arabic: "نَبِيّ", transcription: "nebiyy", meaning: "Nebi, peygamber" },
    { arabic: "مُحَمَّد", transcription: "Muhammed", meaning: "Muhammed" },
    { arabic: "مُوسَى", transcription: "Mûsâ", meaning: "Musa" },
    { arabic: "عِيسَى", transcription: "Îsâ", meaning: "İsa" },
    { arabic: "إِبْرَاهِيم", transcription: "İbrâhîm", meaning: "İbrahim" },
    { arabic: "نُوح", transcription: "Nûh", meaning: "Nuh" },
    { arabic: "آدَم", transcription: "Âdem", meaning: "Adem" },
    
    // FİİLLER (MASTAR)
    { arabic: "قَالَ", transcription: "kâle", meaning: "Dedi" },
    { arabic: "كَانَ", transcription: "kâne", meaning: "Oldu, idi" },
    { arabic: "يَكُون", transcription: "yekûn", meaning: "Olur" },
    { arabic: "عَلِمَ", transcription: "alime", meaning: "Bildi" },
    { arabic: "عَبَدَ", transcription: "abede", meaning: "İbadet etti" },
    { arabic: "خَلَقَ", transcription: "halaka", meaning: "Yarattı" },
    { arabic: "أَرَادَ", transcription: "erâde", meaning: "İstedi" },
    { arabic: "جَعَلَ", transcription: "ceale", meaning: "Kıldı, yaptı" },
    { arabic: "أَتَى", transcription: "etâ", meaning: "Geldi" },
    { arabic: "رَأَى", transcription: "reâ", meaning: "Gördü" },
    
    // ZIT ANLAMLILAR
    { arabic: "خَيْر", transcription: "hayr", meaning: "Hayır, iyilik" },
    { arabic: "شَرّ", transcription: "şerr", meaning: "Şer, kötülük" },
    { arabic: "حَقّ", transcription: "hakk", meaning: "Hak, gerçek" },
    { arabic: "بَاطِل", transcription: "bâtıl", meaning: "Batıl, boş" },
    { arabic: "حَلَال", transcription: "helâl", meaning: "Helal" },
    { arabic: "حَرَام", transcription: "harâm", meaning: "Haram" },
    { arabic: "طَيِّب", transcription: "tayyib", meaning: "Tayyip, temiz" },
    { arabic: "خَبِيث", transcription: "habîs", meaning: "Habîs, pis" },
    { arabic: "ظَالِم", transcription: "zâlim", meaning: "Zalim" },
    { arabic: "مُؤْمِن", transcription: "mü'min", meaning: "Mümin, inanan" },
    
    // DOĞA VE EVREN
    { arabic: "أَرْض", transcription: "ard", meaning: "Yeryüzü, toprak" },
    { arabic: "سَمَاء", transcription: "semâ'", meaning: "Gök, sema" },
    { arabic: "شَمْس", transcription: "şems", meaning: "Güneş" },
    { arabic: "قَمَر", transcription: "kamer", meaning: "Ay" },
    { arabic: "نُجُوم", transcription: "nücûm", meaning: "Yıldızlar" },
    { arabic: "بَحْر", transcription: "bahr", meaning: "Deniz" },
    { arabic: "نَهْر", transcription: "nehr", meaning: "Nehir" },
    { arabic: "جَبَل", transcription: "cebel", meaning: "Dağ" },
    { arabic: "شَجَر", transcription: "şecer", meaning: "Ağaç" },
    { arabic: "مَاء", transcription: "mâ'", meaning: "Su" },
    
    // ZAMAN KAVRAMLARI
    { arabic: "وَقْت", transcription: "vakt", meaning: "Vakit, zaman" },
    { arabic: "سَاعَة", transcription: "sâat", meaning: "Saat, an" },
    { arabic: "لَيْل", transcription: "leyl", meaning: "Gece" },
    { arabic: "نَهَار", transcription: "nehâr", meaning: "Gündüz" },
    { arabic: "صَبَاح", transcription: "sabâh", meaning: "Sabah" },
    { arabic: "مَسَاء", transcription: "mesâ'", meaning: "Akşam" },
    { arabic: "شَهْر", transcription: "şehr", meaning: "Ay" },
    { arabic: "سَنَة", transcription: "sene", meaning: "Yıl" },
    { arabic: "قَدِيم", transcription: "kadîm", meaning: "Kadim, eski" },
    { arabic: "حَدِيث", transcription: "hadîs", meaning: "Hadis, yeni" },
    
    // SAYILAR
    { arabic: "وَاحِد", transcription: "vâhid", meaning: "Bir, tek" },
    { arabic: "اِثْنَان", transcription: "isnân", meaning: "İki" },
    { arabic: "ثَلَاثَة", transcription: "selâse", meaning: "Üç" },
    { arabic: "أَرْبَعَة", transcription: "erbaa", meaning: "Dört" },
    { arabic: "خَمْسَة", transcription: "hamse", meaning: "Beş" },
    { arabic: "سِتَّة", transcription: "sitte", meaning: "Altı" },
    { arabic: "سَبْعَة", transcription: "seb'a", meaning: "Yedi" },
    { arabic: "ثَمَانِيَة", transcription: "semâniye", meaning: "Sekiz" },
    { arabic: "تِسْعَة", transcription: "tis'a", meaning: "Dokuz" },
    { arabic: "عَشْرَة", transcription: "aşere", meaning: "On" },
    
    // SORU KELİMELERİ
    { arabic: "مَاذَا", transcription: "mâzâ", meaning: "Ne?" },
    { arabic: "مَنْ", transcription: "men", meaning: "Kim?" },
    { arabic: "أَيْنَ", transcription: "eyne", meaning: "Nerede?" },
    { arabic: "مَتَى", transcription: "metâ", meaning: "Ne zaman?" },
    { arabic: "كَيْفَ", transcription: "keyfe", meaning: "Nasıl?" },
    { arabic: "لِمَاذَا", transcription: "limâzâ", meaning: "Niçin?" },
    { arabic: "كَمْ", transcription: "kem", meaning: "Kaç?" },
    { arabic: "أَيّ", transcription: "eyy", meaning: "Hangi?" },
    
    // EDATLAR VE BAĞLAÇLAR
    { arabic: "وَ", transcription: "ve", meaning: "Ve" },
    { arabic: "أَو", transcription: "ev", meaning: "Veya" },
    { arabic: "ثُمَّ", transcription: "sümme", meaning: "Sonra" },
    { arabic: "حَتَّى", transcription: "hattâ", meaning: "Hatta, -e kadar" },
    { arabic: "لِ", transcription: "li", meaning: "İçin, -e" },
    { arabic: "بِ", transcription: "bi", meaning: "İle, -le" },
    { arabic: "كَ", transcription: "ke", meaning: "Gibi" },
    { arabic: "إِلَى", transcription: "ilâ", meaning: "-e, -a kadar" },
    { arabic: "عَن", transcription: "an", meaning: "-den, hakkında" },
    { arabic: "مَعَ", transcription: "mea", meaning: "Birlikte, ile" },
    
    // SIFATLAR
    { arabic: "كَبِير", transcription: "kebîr", meaning: "Büyük" },
    { arabic: "صَغِير", transcription: "sağîr", meaning: "Küçük" },
    { arabic: "جَدِيد", transcription: "cedîd", meaning: "Yeni" },
    { arabic: "قَوِيّ", transcription: "kaviyy", meaning: "Kuvvetli" },
    { arabic: "ضَعِيف", transcription: "daîf", meaning: "Zayıf" },
    { arabic: "غَنِيّ", transcription: "ğaniyy", meaning: "Zengin" },
    { arabic: "فَقِير", transcription: "fakîr", meaning: "Fakir" },
    { arabic: "حَيّ", transcription: "hayy", meaning: "Canlı, diri" },
    { arabic: "مَيِّت", transcription: "meyyit", meaning: "Ölü" },
    { arabic: "صَادِق", transcription: "sâdık", meaning: "Doğru sözlü" },
    
    // MELEKLER VE GAYB
    { arabic: "مَلَك", transcription: "melek", meaning: "Melek" },
    { arabic: "جِبْرِيل", transcription: "Cibrîl", meaning: "Cebrail" },
    { arabic: "مِيكَال", transcription: "Mîkâl", meaning: "Mikail" },
    { arabic: "شَيْطَان", transcription: "şeytân", meaning: "Şeytan" },
    { arabic: "إِبْلِيس", transcription: "İblîs", meaning: "İblis" },
    { arabic: "جِنّ", transcription: "cinn", meaning: "Cin" },
    { arabic: "غَيْب", transcription: "ğayb", meaning: "Gayb, görünmeyen" },
    { arabic: "شَهَادَة", transcription: "şehâde", meaning: "Şahitlik, görünen" },
    
    // KUR'AN'DA SIK GEÇEN FİİLLER (2)
    { arabic: "آمَنَ", transcription: "âmene", meaning: "İman etti" },
    { arabic: "كَفَرَ", transcription: "kefera", meaning: "Küfretti" },
    { arabic: "صَبَرَ", transcription: "sabere", meaning: "Sabretti" },
    { arabic: "شَكَرَ", transcription: "şekere", meaning: "Şükretti" },
    { arabic: "ذَكَرَ", transcription: "zekere", meaning: "Zikretti, andı" },
    { arabic: "نَسِيَ", transcription: "nesiye", meaning: "Unuttu" },
    { arabic: "أَمَرَ", transcription: "emere", meaning: "Emretti" },
    { arabic: "نَهَى", transcription: "neha", meaning: "Yasakladı" },
    { arabic: "رَضِيَ", transcription: "radıye", meaning: "Razı oldu" },
    { arabic: "سَخِطَ", transcription: "sahıta", meaning: "Gazap etti" },
    
    // SON 10 ÖNEMLİ KELİME
    { arabic: "حَسَنَة", transcription: "hasene", meaning: "Hasene, iyilik" },
    { arabic: "سَيِّئَة", transcription: "seyyie", meaning: "Seyyie, kötülük" },
    { arabic: "مَغْفِرَة", transcription: "mağfire", meaning: "Mağfiret, bağış" },
    { arabic: "تُوبَة", transcription: "tevbe", meaning: "Tövbe" },
    { arabic: "صِدْق", transcription: "sıdk", meaning: "Doğruluk" },
    { arabic: "كَذِب", transcription: "kezib", meaning: "Yalan" },
    { arabic: "أَمَانَة", transcription: "emâne", meaning: "Emanet" },
    { arabic: "خِيَانَة", transcription: "hiyâne", meaning: "Hıyanet" },
    { arabic: "سَلَام", transcription: "selâm", meaning: "Selam, barış" },
    { arabic: "حَرْب", transcription: "harb", meaning: "Savaş" }
];

// Fonksiyon: 180 günlük veri seti oluştur (Kur'an odaklı)
function generateQuranWordsDatabase(days = 180, wordsPerDay = 5) {
    const wordsDatabase = [];
    
    // Tüm kelimeleri karıştır ama mantıklı bir sıra olsun
    // Önce en temel kelimeler, sonra diğerleri
    const organizedWords = [...baseWords];
    
    for (let day = 0; day < days; day++) {
        const dayWords = [];
        
        // Her gün için 5 kelime seç (döngüsel)
        for (let i = 0; i < wordsPerDay; i++) {
            const wordIndex = (day * wordsPerDay + i) % organizedWords.length;
            const word = { 
                ...organizedWords[wordIndex], 
                learned: false,
                // Ek bilgi: Kur'an'da geçiş sıklığı (örnek)
                frequency: getWordFrequency(organizedWords[wordIndex].arabic)
            };
            dayWords.push(word);
        }
        
        wordsDatabase.push(dayWords);
    }
    
    return wordsDatabase;
}

// Kelime sıklığı bilgisi (örnek - gerçek veri eklenebilir)
function getWordFrequency(arabicWord) {
    const frequencyMap = {
        "اللَّهُ": 2700, "إِنَّ": 1200, "مِن": 1200, "عَلَى": 700,
        "رَبّ": 900, "إِلَّا": 600, "كَانَ": 1300, "قَالَ": 500,
        "يَوْم": 400, "إِنْسَان": 200, "أَرْض": 200, "سَمَاء": 100
    };
    
    return frequencyMap[arabicWord] || Math.floor(Math.random() * 100) + 50;
}

// 180 günlük Kur'an kelime veritabanını oluştur
const wordsDatabase = generateQuranWordsDatabase(180, 5);

// Konsola bilgi yazdır
console.log(`KUR'AN KELİMELERİ VERİTABANI`);
console.log(`Toplam ${baseWords.length} Kur'an kelimesi`);
console.log(`${wordsDatabase.length} günlük program (her gün 5 kelime)`);
console.log(`Toplam ${wordsDatabase.length * 5} kelime kartı hazır`);
console.log(`Hedef: Kur'an'ın %70'ini anlayabilmek için temel kelimeler`);