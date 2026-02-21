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
const surpriseStatusSpan = document.getElementById("surpriseStatus"); // YENİ

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

/* 🧿 SÜRPRİZ MODU - SweetAlert eklendi */
let surprise = localStorage.getItem("surprise") === "on";

// Surprise durumunu göster
function updateSurpriseStatus() {
  if (surpriseStatusSpan) {
    surpriseStatusSpan.innerText = surprise ? "🧿 Güncelleme Modu Açık" : "🧿 Güncelleme Modu Kapalı";
  }
}

window.toggleSurprise = async () => {
  const result = await Swal.fire({
    title: surprise ? 'Güncelleme Modu Kapatılsın mı?' : 'Güncelleme Modu Açılsın mı?',
    text: surprise 
      ? 'Mod kapatılırsa düzenleme/silme butonları görünür olacak.'
      : 'Mod açılırsa düzenleme/silme butonları gizlenecek ve kartlar sürüklenemez olacak.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Evet',
    cancelButtonText: 'İptal'
  });

  if (result.isConfirmed) {
    surprise = !surprise;
    localStorage.setItem("surprise", surprise ? "on" : "off");
    updateSurpriseStatus();
    toast(surprise ? "🧿 Sürpriz Modu Açık" : "🧿 Sürpriz Modu Kapalı");
    listele();
  }
};

/* ➕ EKLE */
window.ekle = async () => {
  if (!baslikInput.value || !icerikInput.value) {
    toast("🤍 Boş dua olmaz");
    return;
  }

  // Yeni dua eklenirken sıra numarasını belirle (mevcut duaların en büyük sırası + 1)
  const q = query(colRef, orderBy("order", "desc"));
  const snap = await getDocs(q);
  let maxOrder = 0;
  snap.forEach(d => {
    const data = d.data();
    if (data.order && data.order > maxOrder) maxOrder = data.order;
  });

  await addDoc(colRef, {
    baslik: baslikInput.value,
    icerik: icerikInput.value,
    tarih: new Date(),
    favorite: false,
    order: maxOrder + 1
  });

  baslikInput.value = "";
  icerikInput.value = "";
  document.getElementById("addModal").classList.remove("active");

  toast("✨ Dua kaydedildi");
  listele();
};

/* 📖 LİSTELE - order'a göre sırala */
let tumDualar = [];

async function listele() {
  const q = query(colRef, orderBy("order", "asc")); // order'a göre sırala
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

  // Favoriler üstte (order korunarak)
  filtrelenmis.sort((a, b) => {
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return a.order - b.order;
  });

  duaCountSpan.innerText = `${filtrelenmis.length} dua`;
  siirlerDiv.innerHTML = "";

  // Çarpı butonu görünürlüğü
  if (clearBtn) {
    if (arama) clearBtn.classList.remove("hidden");
    else clearBtn.classList.add("hidden");
  }

  // Surprise durumunu güncelle
  updateSurpriseStatus();

  filtrelenmis.forEach(s => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = s.id;
    card.setAttribute("draggable", false); // HTML5 drag kapalı

    card.innerHTML = `
      <div class="drag-handle" ${surprise ? 'style="display:none"' : ''}>⋮⋮</div>
      <span class="favorite-star" onclick="favToggle('${s.id}', ${s.favorite})">
        ${s.favorite ? "⭐" : "☆"}
      </span>
      <div class="card-content">
        <h2 onclick="toggleIcerik(this)">${s.baslik}</h2>
        <pre class="icerik" style="display:none">${s.icerik}</pre>
        ${surprise ? "" : `
        <div class="actions">
          <button class="edit" onclick="siirDuzenle('${s.id}', \`${s.baslik}\`, \`${s.icerik}\`)">✏️ Düzenle</button>
          <button class="del" onclick="siirSil('${s.id}')">🗑️ Sil</button>
        </div>
        `}
        <button class="share-btn" onclick="paylas('${s.baslik}', \`${s.icerik}\`)">
          <i class="fas fa-share-alt"></i> Paylaş
        </button>
      </div>
    `;

    siirlerDiv.appendChild(card);
  });

  // SortableJS'yi başlat (sürpriz modu kapalıysa)
  if (!surprise && typeof Sortable !== "undefined") {
    new Sortable(siirlerDiv, {
      animation: 150,
      handle: '.drag-handle',
      forceFallback: true,
      onEnd: async function(evt) {
        // Yeni sırayı al
        const items = Array.from(siirlerDiv.children);
        const updates = items.map((item, index) => {
          const id = item.dataset.id;
          return { id, order: index + 1 };
        });

        // Firestore'da toplu güncelleme
        const batch = writeBatch(db);
        updates.forEach(u => {
          const docRef = doc(db, "siirler", u.id);
          batch.update(docRef, { order: u.order });
        });
        await batch.commit();

        toast("🔄 Sıralama güncellendi");
      }
    });
  }
}

/* 🔽 İçerik aç/kapa */
window.toggleIcerik = (el) => {
  const pre = el.nextElementSibling;
  const actions = pre.nextElementSibling;
  const acik = pre.style.display === "block";
  pre.style.display = acik ? "none" : "block";
  if (actions) actions.style.display = acik ? "none" : "flex";
};

/* 🗑️ SİL */
window.siirSil = (id) => {
  Swal.fire({
    title: 'Bu duayı silmek istiyor musun?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Evet, sil',
    cancelButtonText: 'İptal'
  }).then(async (result) => {
    if (result.isConfirmed) {
      await deleteDoc(doc(db, "siirler", id));
      toast("💔 Dua silindi");
      listele();
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
  alertInput.style.display = "block";
  alertInput.value = eskiIcerik;

  document.getElementById("alertModal").classList.add("active");

  document.getElementById("alertOk").onclick = async () => {
    await updateDoc(doc(db, "siirler", id), {
      baslik: alertBaslik.value,
      icerik: alertInput.value
    });
    document.getElementById("alertModal").classList.remove("active");
    toast("✨ Dua güncellendi");
    listele();
  };
};

/* ⭐ FAVORİ */
window.favToggle = async (id, val) => {
  await updateDoc(doc(db, "siirler", id), { favorite: !val });
  toast(val ? "🕊️ Favoriden çıkarıldı" : "🕊️ Favorilere eklendi");
  listele();
};

/* 📤 PAYLAŞ */
window.paylas = (baslik, icerik) => {
  const metin = `${baslik}\n\n${icerik}`;
  if (navigator.share) {
    navigator.share({
      title: baslik,
      text: icerik,
    }).catch(() => toast("Paylaşım iptal edildi"));
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

/* 🔍 Arama olay dinleyicisi */
aramaInput.addEventListener("input", listele);

/* 🚀 İlk yükleme */
window.onload = () => {
  updateSurpriseStatus();
  listele();
};
