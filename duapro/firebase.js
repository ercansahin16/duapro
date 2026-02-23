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
orderBy
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
const updateToggle = document.getElementById("updateToggle");
const themeToggle = document.getElementById("themeToggle");
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
  const q = query(colRef, orderBy("tarih", "desc"));
  const snap = await getDocs(q);
  try {
    const q = query(colRef, orderBy("tarih", "desc"));
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
    } else {
      siirlerDiv.classList.remove("search-mode");
    }

  tumDualar = [];
  snap.forEach(d => tumDualar.push({ id: d.id, ...d.data() }));
    filtrelenmis.sort((a, b) => (b.favorite === true ? 1 : 0) - (a.favorite === true ? 1 : 0));

  const arama = turkceNormalize(aramaInput.value);
    duaCountSpan.innerText = `${filtrelenmis.length} dua`;
    siirlerDiv.innerHTML = "";

  let filtrelenmis = tumDualar;
  if (arama) {
    filtrelenmis = tumDualar.filter(d => {
      const baslik = turkceNormalize(d.baslik);
      const icerik = turkceNormalize(d.icerik);
      return baslik.includes(arama) || icerik.includes(arama);
    });
    siirlerDiv.classList.add("search-mode");
  } else {
    siirlerDiv.classList.remove("search-mode");
  }
    if (clearBtn) {
      if (arama) clearBtn.classList.remove("hidden");
      else clearBtn.classList.add("hidden");
    }

  filtrelenmis.sort((a, b) => b.favorite - a.favorite);
    filtrelenmis.forEach(s => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.id = s.id;
      
      const safeBaslik = (s.baslik || '').replace(/`/g, '\\`').replace(/${/g, '\\${');
      const safeIcerik = (s.icerik || '').replace(/`/g, '\\`').replace(/${/g, '\\${');

      card.innerHTML = `
        <div class="drag-handle" style="${surprise ? 'display:none' : ''}">⋮⋮</div>
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

  duaCountSpan.innerText = `${filtrelenmis.length} dua`;
  siirlerDiv.innerHTML = "";
      siirlerDiv.appendChild(card);
    });

  if (clearBtn) {
    if (arama) clearBtn.classList.remove("hidden");
    else clearBtn.classList.add("hidden");
    initSortable();
    
  } catch (error) {
    console.error("Listeleme hatası:", error);
    window.toast("❌ Dualar yüklenirken hata oluştu");
}
}

  filtrelenmis.forEach(s => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = s.id;
    card.setAttribute("draggable", false);

    // Paylaş butonu ve favori yıldızı aynı kapta, doğrudan HTML içinde
    card.innerHTML = `
      <div class="drag-handle" ${surprise ? 'style="display:none"' : ''}>⋮⋮</div>
      <div class="card-actions">
        <span class="favorite-star" onclick="favToggle('${s.id}', ${s.favorite})">
          ${s.favorite ? "❤️" : "🤍"}
        </span>
        <button class="share-btn" onclick="window.paylas('${s.baslik}', \`${s.icerik}\`)">
          <i class="fas fa-share-alt"></i>
        </button>
      </div>
      <div class="card-content">
        <h2 onclick="toggleIcerik(this)">${s.baslik}</h2>
        <pre class="icerik" style="display:none">${s.icerik}</pre>
        ${surprise ? "" : `
        <div class="actions">
          <button class="edit" onclick="siirDuzenle('${s.id}', \`${s.baslik}\`, \`${s.icerik}\`)">✏️ Düzenle</button>
          <button class="del" onclick="siirSil('${s.id}')">🗑️ Sil</button>
        </div>
        `}
      </div>
    `;

    siirlerDiv.appendChild(card);
  });
/* 🔄 SORTABLE BAŞLAT */
function initSortable() {
  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }

  if (!surprise && typeof Sortable !== "undefined") {
    new Sortable(siirlerDiv, {
  if (!surprise && siirlerDiv.children.length > 0 && typeof Sortable !== "undefined") {
    sortableInstance = new Sortable(siirlerDiv, {
animation: 150,
handle: '.drag-handle',
      forceFallback: true,
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      chosenClass: 'sortable-chosen',
      delay: 0,
      delayOnTouchOnly: false,
      touchStartThreshold: 5,
      onStart: function(evt) {
        evt.item.classList.add('dragging');
      },
onEnd: function(evt) {
        evt.item.classList.remove('dragging');
const newOrder = Array.from(siirlerDiv.children).map(card => card.dataset.id);
localStorage.setItem('kartSirasi', JSON.stringify(newOrder));
        window.toast("📍 Sıra güncellendi");
}
});
}
}

/* 🧿 SÜRPRİZ MODU */
let surprise = localStorage.getItem("surprise") === "on";

if (updateToggle) {
  updateToggle.addEventListener('change', function() {
    surprise = this.checked;
    localStorage.setItem("surprise", surprise ? "on" : "off");
    
    const updateBadge = document.getElementById("updateStatus");
    if (updateBadge) {
      updateBadge.innerHTML = surprise ? "🛠️ Açık" : "🛠️ Kapalı";
    }
    
    window.toast(surprise ? "🛠️ Güncelleme modu açıldı" : "🛠️ Güncelleme modu kapatıldı");
    listele();
  });
}

/* 🌙 TEMA MODU */
function setTheme(isDark) {
  if (isDark) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  localStorage.setItem('dark', isDark);
}

if (themeToggle) {
  themeToggle.addEventListener('change', function() {
    setTheme(this.checked);
  });
}

window.addEventListener('load', function() {
  if (updateToggle) updateToggle.checked = surprise;
  const isDark = localStorage.getItem('dark') === 'true';
  if (themeToggle) themeToggle.checked = isDark;
  setTheme(isDark);
});

/* ➕ EKLE */
window.ekle = async () => {
  if (!baslikInput.value || !icerikInput.value) {
  if (!baslikInput.value.trim() || !icerikInput.value.trim()) {
window.toast("🤍 Boş dua olmaz");
return;
}

  await addDoc(colRef, {
    baslik: baslikInput.value,
    icerik: icerikInput.value,
    tarih: new Date(),
    favorite: false
  });
  try {
    await addDoc(colRef, {
      baslik: baslikInput.value.trim(),
      icerik: icerikInput.value.trim(),
      tarih: new Date(),
      favorite: false
    });

  baslikInput.value = "";
  icerikInput.value = "";
  document.getElementById("addModal").classList.remove("active");
    baslikInput.value = "";
    icerikInput.value = "";
    document.getElementById("addModal").classList.remove("active");

  window.toast("✨ Dua kaydedildi");
  listele();
    window.toast("✨ Dua kaydedildi");
    listele();
  } catch (error) {
    console.error("Ekleme hatası:", error);
    window.toast("❌ Dua kaydedilemedi");
  }
};

/* 📖 LİSTELE */
let tumDualar = [];


/* 🔽 İçerik aç/kapa */
window.toggleIcerik = (el) => {
const pre = el.nextElementSibling;
const actions = pre.nextElementSibling;
const acik = pre.style.display === "block";
pre.style.display = acik ? "none" : "block";
  if (actions) actions.style.display = acik ? "none" : "flex";
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
    cancelButtonText: 'İptal'
    cancelButtonText: 'İptal',
    confirmButtonColor: '#F7B490',
    cancelButtonColor: '#6F86A1'
}).then(async (result) => {
if (result.isConfirmed) {
      await deleteDoc(doc(db, "siirler", id));
      window.toast("💔 Dua silindi");
      listele();
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
  alertBaslik.value = eskiBaslik;
  alertBaslik.value = eskiBaslik || '';
alertInput.style.display = "block";
  alertInput.value = eskiIcerik;
  alertInput.value = eskiIcerik || '';

document.getElementById("alertModal").classList.add("active");

document.getElementById("alertOk").onclick = async () => {
    await updateDoc(doc(db, "siirler", id), {
      baslik: alertBaslik.value,
      icerik: alertInput.value
    });
    document.getElementById("alertModal").classList.remove("active");
    window.toast("✨ Dua güncellendi");
    listele();
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
  await updateDoc(doc(db, "siirler", id), { favorite: !val });
  window.toast(val ? "❤️ Favoriden çıkarıldı" : "❤️ Favorilere eklendi");
  listele();
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
        <div style="display:flex; gap:15px; justify-content:center;">
          <a href="${wa}" target="_blank" style="font-size:2rem; color:#25D366;">📱</a>
          <a href="${tw}" target="_blank" style="font-size:2rem; color:#1DA1F2;">🐦</a>
          <a href="${tg}" target="_blank" style="font-size:2rem; color:#0088cc;">✈️</a>
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
window.onload = listele;

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
