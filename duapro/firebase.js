// firebase.js (CDN + CLEAN)

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
const siirler = document.getElementById("siirler");
const baslik = document.getElementById("baslik");
const icerik = document.getElementById("icerik");
const duaCountSpan = document.getElementById("duaCount");
const searchInput = document.getElementById("searchInput");

/* 🧿 SÜRPRİZ */
let surprise = localStorage.getItem("surprise") === "on";

window.toggleSurprise = () => {
  surprise = !surprise;
  localStorage.setItem("surprise", surprise ? "on" : "off");
  toast(surprise ? "🧿 Sürpriz Modu Açık" : "🧿 Sürpriz Modu Kapalı");
  listele();
};

/* 🔔 TOAST */
window.toast = (msg) => {
  const t = document.createElement("div");
  t.className = "toast";
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
};

/* ➕ EKLE */
window.ekle = async () => {
  if (!baslik.value || !icerik.value) {
    toast("🤍 Boş dua olmaz");
    return;
  }

  // Yeni eklenen en sona gitmesi için order değerini al
  const snapshot = await getDocs(colRef);
  const maxOrder = snapshot.docs.reduce((max, d) => Math.max(max, d.data().order || 0), 0);

  await addDoc(colRef, {
    baslik: baslik.value,
    icerik: icerik.value,
    tarih: new Date(),
    favorite: false,
    order: maxOrder + 1
  });

  baslik.value = "";
  icerik.value = "";
  document.getElementById("addModal").classList.remove("active");

  toast("✨ Dua kaydedildi");
  listele();
};

/* 📖 LİSTELE */
let allDocs = []; // tüm belgeleri tutar
let sortableInstance = null;

async function listele() {
  siirler.innerHTML = "";

  const q = query(colRef);
  const snap = await getDocs(q);

  allDocs = [];
  snap.forEach(d => {
    allDocs.push({ id: d.id, ...d.data() });
  });

  // Favoriler önce, sonra order'a göre
  allDocs.sort((a, b) => {
    if (a.favorite === b.favorite) {
      return (a.order || 0) - (b.order || 0);
    }
    return a.favorite ? -1 : 1;
  });

  renderList(allDocs);
  duaCountSpan.innerText = allDocs.length;

  // Eğer daha önce Sortable varsa yok et
  if (sortableInstance) sortableInstance.destroy();

  // Drag & Drop başlat
  sortableInstance = new Sortable(siirler, {
    animation: 150,
    handle: '.drag-handle',
    onEnd: async (evt) => {
      const newOrder = Array.from(siirler.children).map(child => child.dataset.id);
      // Firestore'da order'ları güncelle
      await updateOrders(newOrder);
    }
  });
}

function renderList(docs) {
  siirler.innerHTML = "";
  docs.forEach(s => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = s.id;

    // Sürükleme tutamağı
    const handle = document.createElement("div");
    handle.className = "drag-handle";
    handle.innerHTML = "⋮⋮";
    card.appendChild(handle);

    // Favori yıldızı
    const favSpan = document.createElement("span");
    favSpan.style.cssText = "float:right;cursor:pointer;font-size:22px; position:relative; z-index:10;";
    favSpan.innerHTML = s.favorite ? "⭐" : "☆";
    favSpan.onclick = (e) => {
      e.stopPropagation();
      favToggle(s.id, s.favorite);
    };
    card.appendChild(favSpan);

    // Başlık
    const h2 = document.createElement("h2");
    h2.textContent = s.baslik;
    h2.onclick = (e) => toggleIcerik(e.target);
    card.appendChild(h2);

    // İçerik
    const pre = document.createElement("pre");
    pre.className = "icerik";
    pre.style.display = "none";
    pre.textContent = s.icerik;
    card.appendChild(pre);

    // Sürpriz mod değilse butonları ekle
    if (!surprise) {
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "actions";
      actionsDiv.innerHTML = `
        <button class="edit" onclick="siirDuzenle('${s.id}', \`${s.baslik.replace(/`/g, '\\`')}\`, \`${s.icerik.replace(/`/g, '\\`')}\`)">✏️ Düzenle</button>
        <button class="del" onclick="siirSil('${s.id}')">🗑️ Sil</button>
      `;
      card.appendChild(actionsDiv);
    }

    // Paylaş butonları (her zaman görünür)
    const shareDiv = document.createElement("div");
    shareDiv.className = "share-buttons";
    shareDiv.innerHTML = `
      <button onclick="share('whatsapp', '${encodeURIComponent(s.baslik)}', '${encodeURIComponent(s.icerik)}')" title="WhatsApp"><i class="fab fa-whatsapp" style="color:#25D366;"></i></button>
      <button onclick="share('telegram', '${encodeURIComponent(s.baslik)}', '${encodeURIComponent(s.icerik)}')" title="Telegram"><i class="fab fa-telegram" style="color:#0088cc;"></i></button>
      <button onclick="share('twitter', '${encodeURIComponent(s.baslik)}', '${encodeURIComponent(s.icerik)}')" title="Twitter"><i class="fab fa-twitter" style="color:#1DA1F2;"></i></button>
    `;
    card.appendChild(shareDiv);

    siirler.appendChild(card);
  });
}

// Sıralama güncelleme
async function updateOrders(newOrderIds) {
  const batch = writeBatch(db);
  newOrderIds.forEach((id, index) => {
    const ref = doc(db, "siirler", id);
    batch.update(ref, { order: index + 1 });
  });
  await batch.commit();
  toast("📋 Sıra güncellendi");
  listele(); // yeniden listele (opsiyonel)
}

/* 🔍 FİLTRELE (arama) */
window.filterDualar = () => {
  const term = searchInput.value.toLowerCase();
  if (!term) {
    renderList(allDocs);
    return;
  }
  const filtered = allDocs.filter(d =>
    d.baslik.toLowerCase().includes(term) ||
    d.icerik.toLowerCase().includes(term)
  );
  renderList(filtered);
};

/* 🔽 AÇ / KAPA */
window.toggleIcerik = (el) => {
  const pre = el.nextElementSibling;
  const actions = pre.nextElementSibling;
  const share = actions?.nextElementSibling;

  const acik = pre.style.display === "block";
  pre.style.display = acik ? "none" : "block";
  if (actions && actions.classList.contains("actions")) actions.style.display = acik ? "none" : "flex";
  if (share && share.classList.contains("share-buttons")) share.style.display = acik ? "none" : "flex";
};

/* 🗑️ SİL */
window.siirSil = (id) => {
  document.getElementById("alertTitle").innerText = "Bu duayı silmek istiyor musun?";
  document.getElementById("alertInput").style.display = "none";
  document.getElementById("alertBaslik").style.display = "none";
  document.getElementById("alertModal").classList.add("active");

  document.getElementById("alertOk").onclick = async () => {
    await deleteDoc(doc(db, "siirler", id));
    document.getElementById("alertModal").classList.remove("active");
    toast("💔 Dua silindi");
    listele();
  };
};

/* ✏️ DÜZENLE */
window.siirDuzenle = (id, eskiBaslik, eskiIcerik) => {
  document.getElementById("alertTitle").innerText = "Duayı düzenle 🤍";
  const alertInput = document.getElementById("alertInput");
  alertInput.style.display = "block";
  alertInput.value = eskiIcerik;

  const baslikInput = document.getElementById("alertBaslik");
  baslikInput.style.display = "block";
  baslikInput.value = eskiBaslik;

  document.getElementById("alertModal").classList.add("active");

  document.getElementById("alertOk").onclick = async () => {
    await updateDoc(doc(db, "siirler", id), {
      baslik: baslikInput.value,
      icerik: alertInput.value
    });

    document.getElementById("alertModal").classList.remove("active");
    toast("✨ Dua güncellendi");
    listele();
  };
};

/* ⭐ FAVORİ */
window.favToggle = async (id, val) => {
  await updateDoc(doc(db, "siirler", id), {
    favorite: !val
  });
  toast(val ? "🕊️ Favoriden çıkarıldı" : "🕊️ Favorilere eklendi");
  listele();
};

/* 📤 PAYLAŞIM */
window.share = (platform, baslik, icerik) => {
  const text = `${decodeURIComponent(baslik)}\n\n${decodeURIComponent(icerik)}`;
  let url = '';
  switch(platform) {
    case 'whatsapp':
      url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      break;
    case 'telegram':
      url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
      break;
    case 'twitter':
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      break;
  }
  window.open(url, '_blank');
};

// 🍔 Menü dışına tıklayınca kapat
document.addEventListener("click", function (e) {
  const menu = document.getElementById("menu");
  const menuBtn = document.querySelector(".menu-btn");

  if (!menu.classList.contains("active")) return;

  if (
    !menu.contains(e.target) &&
    !menuBtn.contains(e.target)
  ) {
    menu.classList.remove("active");
  }
});

window.onload = listele;
