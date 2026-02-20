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

/* 🧿 SÜRPRİZ MODU */
let surprise = localStorage.getItem("surprise") === "on";

window.toggleSurprise = () => {
  surprise = !surprise;
  localStorage.setItem("surprise", surprise ? "on" : "off");
  toast(surprise ? "🧿 Sürpriz Modu Açık" : "🧿 Sürpriz Modu Kapalı");
  listele();
};

/* ➕ EKLE */
window.ekle = async () => {
  if (!baslikInput.value || !icerikInput.value) {
    toast("🤍 Boş dua olmaz");
    return;
  }

  await addDoc(colRef, {
    baslik: baslikInput.value,
    icerik: icerikInput.value,
    tarih: new Date(),
    favorite: false
  });

  baslikInput.value = "";
  icerikInput.value = "";
  document.getElementById("addModal").classList.remove("active");

  toast("✨ Dua kaydedildi");
  listele();
};

/* 📖 LİSTELE (arama + sıralama + drag & drop) */
let tumDualar = [];

async function listele() {
  const q = query(colRef, orderBy("tarih", "desc"));
  const snap = await getDocs(q);

  tumDualar = [];
  snap.forEach(d => {
    tumDualar.push({ id: d.id, ...d.data() });
  });

// Arama filtresi (büyük/küçük harf duyarsız, güvenli)

const arama = aramaInput.value.trim().toLowerCase();
console.log("Aranan:", arama); // Hata ayıklama

let filtrelenmis = tumDualar;
if (arama) {
  filtrelenmis = tumDualar.filter(d => 
    (d.baslik && typeof d.baslik === 'string' && d.baslik.toLowerCase().includes(arama)) ||
    (d.icerik && typeof d.icerik === 'string' && d.icerik.toLowerCase().includes(arama))
  );
  filtrelenmis = tumDualar.filter(d => {
    const baslik = d.baslik ? String(d.baslik).toLowerCase() : '';
    const icerik = d.icerik ? String(d.icerik).toLowerCase() : '';
    return baslik.includes(arama) || icerik.includes(arama);
  });
}

console.log("Bulunan sonuç sayısı:", filtrelenmis.length);

  // Favoriler üstte
  filtrelenmis.sort((a, b) => {
    if (a.favorite === b.favorite) return 0;
    return a.favorite ? -1 : 1;
  });

  // Sayacı güncelle
  duaCountSpan.innerText = `${filtrelenmis.length} dua`;

  siirlerDiv.innerHTML = "";
  filtrelenmis.forEach((s, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("draggable", !surprise);
    card.dataset.id = s.id;

    card.addEventListener("dragstart", handleDragStart);
    card.addEventListener("dragover", handleDragOver);
    card.addEventListener("drop", handleDrop);
    card.addEventListener("dragend", handleDragEnd);

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

/* 🖱️ DRAG & DROP */
let draggedItem = null;

function handleDragStart(e) {
  draggedItem = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
  e.stopPropagation();
  e.preventDefault();
  if (draggedItem !== this) {
    const parent = this.parentNode;
    const children = Array.from(parent.children);
    const draggedIndex = children.indexOf(draggedItem);
    const targetIndex = children.indexOf(this);
    if (draggedIndex < targetIndex) {
      parent.insertBefore(draggedItem, this.nextSibling);
    } else {
      parent.insertBefore(draggedItem, this);
    }
    const newOrder = Array.from(parent.children).map(card => card.dataset.id);
    localStorage.setItem('kartSirasi', JSON.stringify(newOrder));
  }
  this.classList.remove('drag-over');
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  document.querySelectorAll('.card').forEach(c => c.classList.remove('drag-over'));
}

/* 🔍 Arama olay dinleyicisi */
aramaInput.addEventListener('input', listele);

/* 🚀 İlk yükleme */
window.onload = () => {
  listele();
};

/* 🌙 Menü dışına tıklayınca kapat */
document.addEventListener("click", function (e) {
  const menu = document.getElementById("menu");
  const menuBtn = document.querySelector(".menu-btn");
  if (menu.classList.contains("active") && !menu.contains(e.target) && !menuBtn.contains(e.target)) {
    menu.classList.remove("active");
  }
});

