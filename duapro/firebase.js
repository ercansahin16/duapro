import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  writeBatch
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

/* 🔥 CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyCloL8IN0NpHQBxFjaRH_62vOEWjLQjr4o",
  authDomain: "duapro-a7d7e.firebaseapp.com",
  projectId: "duapro-a7d7e",
  storageBucket: "duapro-a7d7e.appspot.com",
  messagingSenderId: "450775848659",
  appId: "1:450775848659:web:ca192a401da3f887e1e626"
};

/* INIT */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const colRef = collection(db, "siirler");

/* DOM */
const siirlerDiv = document.getElementById("siirler");
const baslikInput = document.getElementById("baslik");
const icerikInput = document.getElementById("icerik");
const aramaInput = document.getElementById("searchInput");
const duaCountSpan = document.getElementById("duaCount");
const clearBtn = document.getElementById("clearSearch");
const updateBadge = document.getElementById("updateStatus");
const updateModeBtn = document.getElementById("updateModeBtn");

/* 🧿 SÜRPRİZ MODU (Güncelleme Modu) */
let surprise = localStorage.getItem("surprise") === "on";
let sortableInstance = null;

function updateSurpriseUI() {
  const statusText = surprise ? "🛠️ Açık" : "🛠️ Kapalı";
  const btnText = surprise ? "🛠️ Güncelleme: Açık" : "🛠️ Güncelleme: Kapalı";
  
  if (updateBadge) updateBadge.innerText = statusText;
  if (updateModeBtn) updateModeBtn.innerText = btnText;
  
  document.querySelectorAll('.drag-handle').forEach(handle => {
    handle.style.display = surprise ? 'none' : 'block';
  });
  
  document.querySelectorAll('.actions').forEach(action => {
    action.style.display = 'none';
  });
  
  initSortable();
}

window.toggleSurprise = () => {
  surprise = !surprise;
  localStorage.setItem("surprise", surprise ? "on" : "off");
  updateSurpriseUI();
  window.toast(surprise ? "🛠️ Güncelleme modu açıldı" : "🛠️ Güncelleme modu kapatıldı");
  listele();
};

/* 🌙 TEMA MODU */
window.toggleDark = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('dark', document.body.classList.contains('dark'));
};

if (localStorage.getItem('dark') === 'true') {
  document.body.classList.add('dark');
}

/* TOAST */
window.toast = (msg) => {
  const t = document.getElementById('toast');
  t.innerText = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
};

/* 🔤 TÜRKÇE NORMALİZASYON */
function turkceNormalize(text) {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "c")
    .toLowerCase()
    .trim();
}

/* 📖 LİSTELE */
let tumDualar = [];

async function listele() {
  try {
    // Sadece sira'ya göre sırala - indeks gerektirmez
    const q = query(colRef, orderBy("sira", "asc"));
    const snap = await getDocs(q);

    tumDualar = [];
    snap.forEach(d => tumDualar.push({ id: d.id, ...d.data() }));

    const arama = turkceNormalize(aramaInput.value);

    let filtrelenmis = tumDualar;
    if (arama) {
      filtrelenmis = tumDualar.filter(d => {
        const baslik = turkceNormalize(d.baslik);
        const icerik = turkceNormalize(d.icerik);
        return baslik.includes(arama) || icerik.includes(arama);
      });
      siirlerDiv.classList.add("search-mode");
      // Arama modunda sürükle-bırak devre dışı
      if (sortableInstance) {
        sortableInstance.option("disabled", true);
      }
    } else {
      siirlerDiv.classList.remove("search-mode");
      // Normal modda sürükle-bırak aktif
      if (sortableInstance) {
        sortableInstance.option("disabled", false);
      }
    }

    // Favorileri üste al (sadece normal görünümde)
    if (!arama) {
      filtrelenmis.sort((a, b) => {
        if (b.favorite !== a.favorite) {
          return (b.favorite === true ? 1 : 0) - (a.favorite === true ? 1 : 0);
        }
        return (a.sira || 0) - (b.sira || 0);
      });
    }

    duaCountSpan.innerText = `${filtrelenmis.length} dua`;
    siirlerDiv.innerHTML = "";

    if (clearBtn) {
      if (arama) clearBtn.classList.remove("hidden");
      else clearBtn.classList.add("hidden");
    }

    filtrelenmis.forEach(s => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.id = s.id;
      
      const safeBaslik = (s.baslik || '').replace(/`/g, '\\`').replace(/${/g, '\\${');
      const safeIcerik = (s.icerik || '').replace(/`/g, '\\`').replace(/${/g, '\\${');

      card.innerHTML = `
        <div class="drag-handle" style="${surprise || arama ? 'display:none' : ''}">⋮⋮</div>
        <div class="card-actions">
          <span class="favorite-star" onclick="favToggle('${s.id}', ${s.favorite === true})">
            ${s.favorite ? "❤️" : "🤍"}
          </span>
          <button class="share-btn" onclick="paylas('${safeBaslik}', \`${safeIcerik}\`)">
            <i class="fas fa-share-alt"></i>
          </button>
        </div>
        <div class="card-content">
          <h2 onclick="toggleIcerik(this)">${s.baslik || 'İsimsiz Dua'}</h2>
          <pre class="icerik" style="display:none">${s.icerik || ''}</pre>
          ${surprise ? "" : `
          <div class="actions">
            <button class="edit" onclick="siirDuzenle('${s.id}', \`${safeBaslik}\`, \`${safeIcerik}\`)">✏️ Düzenle</button>
            <button class="del" onclick="siirSil('${s.id}')">🗑️ Sil</button>
          </div>
          `}
        </div>
      `;

      siirlerDiv.appendChild(card);
    });

    initSortable();
    
  } catch (error) {
    console.error("Listeleme hatası:", error);
    window.toast("❌ Dualar yüklenirken hata: " + error.message);
  }
}

/* 🔄 SORTABLE BAŞLAT */
function initSortable() {
  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }

  // Arama yapılıyorsa sürükle-bırak devre dışı
  if (aramaInput.value.trim() !== "") return;

  if (!surprise && siirlerDiv.children.length > 0 && typeof Sortable !== "undefined") {
    sortableInstance = new Sortable(siirlerDiv, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      chosenClass: 'sortable-chosen',
      delay: 0,
      delayOnTouchOnly: false,
      touchStartThreshold: 5,
      disabled: false,
      onStart: function(evt) {
        evt.item.classList.add('dragging');
      },
      onEnd: async function(evt) {
        evt.item.classList.remove('dragging');
        
        // Yeni sırayı al
        const cards = Array.from(siirlerDiv.children);
        const updates = [];
        
        // Her kartın yeni sıra numarasını hesapla
        cards.forEach((card, index) => {
          const id = card.dataset.id;
          const newSira = index;
          updates.push({ id, sira: newSira });
        });
        
        // Firebase'de toplu güncelleme
        try {
          const batch = writeBatch(db);
          
          updates.forEach(item => {
            const docRef = doc(db, "siirler", item.id);
            batch.update(docRef, { sira: item.sira });
          });
          
          await batch.commit();
          window.toast("📍 Sıra kaydedildi");
          
          // Yerel diziyi de güncelle
          tumDualar.forEach(d => {
            const update = updates.find(u => u.id === d.id);
            if (update) d.sira = update.sira;
          });
          
        } catch (error) {
          console.error("Sıra kaydetme hatası:", error);
          window.toast("❌ Sıra kaydedilemedi, sayfa yenileniyor...");
          setTimeout(() => listele(), 1000);
        }
      }
    });
  }
}

/* ➕ EKLE */
window.ekle = async () => {
  if (!baslikInput.value.trim() || !icerikInput.value.trim()) {
    window.toast("🤍 Boş dua olmaz");
    return;
  }

  try {
    // Mevcut en yüksek sira numarasını bul
    const q = query(colRef, orderBy("sira", "desc"));
    const snap = await getDocs(q);
    let maxSira = 0;
    if (!snap.empty) {
      const firstDoc = snap.docs[0].data();
      maxSira = (firstDoc.sira || 0) + 1;
    }

    await addDoc(colRef, {
      baslik: baslikInput.value.trim(),
      icerik: icerikInput.value.trim(),
      tarih: new Date(),
      favorite: false,
      sira: maxSira
    });

    baslikInput.value = "";
    icerikInput.value = "";
    document.getElementById("addModal").classList.remove("active");

    window.toast("✨ Dua kaydedildi");
    listele();
  } catch (error) {
    console.error("Ekleme hatası:", error);
    window.toast("❌ Dua kaydedilemedi: " + error.message);
  }
};

/* 🔽 İçerik aç/kapa */
window.toggleIcerik = (el) => {
  const pre = el.nextElementSibling;
  const actions = pre.nextElementSibling;
  const acik = pre.style.display === "block";
  pre.style.display = acik ? "none" : "block";
  if (actions && !surprise) actions.style.display = acik ? "none" : "flex";
};

/* 🗑️ SİL */
window.siirSil = (id) => {
  Swal.fire({
    title: 'Bu duayı silmek istiyor musun?',
    text: "Bu işlem geri alınamaz!",
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Evet, sil',
    cancelButtonText: 'İptal',
    confirmButtonColor: '#F7B490',
    cancelButtonColor: '#6F86A1'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "siirler", id));
        window.toast("💔 Dua silindi");
        listele();
      } catch (error) {
        console.error("Silme hatası:", error);
        window.toast("❌ Silme işlemi başarısız");
      }
    }
  });
};

/* ✏️ DÜZENLE */
window.siirDuzenle = (id, eskiBaslik, eskiIcerik) => {
  document.getElementById("alertTitle").innerText = "Duayı düzenle 🤍";
  const alertInput = document.getElementById("alertInput");
  const alertBaslik = document.getElementById("alertBaslik");

  alertBaslik.style.display = "block";
  alertBaslik.value = eskiBaslik || '';
  alertInput.style.display = "block";
  alertInput.value = eskiIcerik || '';

  document.getElementById("alertModal").classList.add("active");

  document.getElementById("alertOk").onclick = async () => {
    if (!alertBaslik.value.trim() || !alertInput.value.trim()) {
      window.toast("🤍 Boş dua olmaz");
      return;
    }
    
    try {
      await updateDoc(doc(db, "siirler", id), {
        baslik: alertBaslik.value.trim(),
        icerik: alertInput.value.trim()
      });
      document.getElementById("alertModal").classList.remove("active");
      window.toast("✨ Dua güncellendi");
      listele();
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      window.toast("❌ Güncelleme başarısız");
    }
  };
};

/* ⭐ FAVORİ */
window.favToggle = async (id, val) => {
  try {
    await updateDoc(doc(db, "siirler", id), { favorite: !val });
    window.toast(val ? "❤️ Favoriden çıkarıldı" : "❤️ Favorilere eklendi");
    listele();
  } catch (error) {
    console.error("Favori hatası:", error);
  }
};

/* 📤 PAYLAŞ */
window.paylas = (baslik, icerik) => {
  const metin = `${baslik}\n\n${icerik}`;
  if (navigator.share) {
    navigator.share({
      title: baslik,
      text: icerik,
    }).catch(() => window.toast("Paylaşım iptal edildi"));
  } else {
    const encoded = encodeURIComponent(metin);
    const wa = `https://wa.me/?text=${encoded}`;
    const tw = `https://twitter.com/intent/tweet?text=${encoded}`;
    const tg = `https://t.me/share/url?url=&text=${encoded}`;

    Swal.fire({
      title: 'Paylaş',
      html: `
        <div style="display:flex; gap:15px; justify-content:center; margin-top:20px;">
          <a href="${wa}" target="_blank" style="font-size:2.5rem; color:#25D366; text-decoration:none;">📱</a>
          <a href="${tw}" target="_blank" style="font-size:2.5rem; color:#1DA1F2; text-decoration:none;">🐦</a>
          <a href="${tg}" target="_blank" style="font-size:2.5rem; color:#0088cc; text-decoration:none;">✈️</a>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true
    });
  }
};

/* 🧹 Aramayı temizle */
window.clearSearch = () => {
  aramaInput.value = "";
  listele();
};

/* MENU */
window.toggleMenu = () => {
  document.getElementById('menu').classList.toggle('active');
};

window.openAdd = () => {
  document.getElementById('addModal').classList.add('active');
  toggleMenu();
};

window.closeAdd = () => {
  document.getElementById('addModal').classList.remove('active');
};

window.alertCancel = () => {
  document.getElementById('alertModal').classList.remove('active');
  document.getElementById('alertInput').style.display = 'none';
  document.getElementById('alertBaslik').style.display = 'none';
};

window.goVideos = () => {
  window.location.href = "duavideolari.html";
};

/* EVENT LISTENERS */
aramaInput.addEventListener("input", listele);

document.addEventListener('click', function(event) {
  const menu = document.getElementById('menu');
  const menuBtn = document.querySelector('.menu-btn');
  
  if (menu.classList.contains('active') && !menu.contains(event.target) && !menuBtn.contains(event.target)) {
    menu.classList.remove('active');
  }
});

document.querySelectorAll('.modal-bg').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
});

/* BAŞLAT */
window.addEventListener('load', () => {
  updateSurpriseUI();
  listele();
});
