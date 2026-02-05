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
const siirler = document.getElementById("siirler");
const baslik = document.getElementById("baslik");
const icerik = document.getElementById("icerik");

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

  await addDoc(colRef, {
    baslik: baslik.value,
    icerik: icerik.value,
    tarih: new Date(),
    favorite: false
  });

  baslik.value = "";
  icerik.value = "";
  document.getElementById("addModal").classList.remove("active");

  toast("✨ Dua kaydedildi");
  listele();
};

/* 📖 LİSTELE */
async function listele() {
  siirler.innerHTML = "";

  const q = query(colRef, orderBy("tarih", "desc"));
  const snap = await getDocs(q);

  const docs = [];
  snap.forEach(d => {
    docs.push({ id: d.id, ...d.data() });
  });

  // ⭐ FAVORİLER ÜSTTE
  docs.sort((a, b) => {
    if (a.favorite === b.favorite) {
      return b.tarih.seconds - a.tarih.seconds;
    }
    return a.favorite ? -1 : 1;
  });

  docs.forEach(s => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <span style="float:right;cursor:pointer;font-size:22px"
        onclick="favToggle('${s.id}', ${s.favorite})">
        ${s.favorite ? "⭐" : "☆"}
      </span>

      <h2 onclick="toggleIcerik(this)" style="cursor:pointer">
        ${s.baslik}
      </h2>

      <pre class="icerik" style="display:none">${s.icerik}</pre>

      ${surprise ? "" : `
      <div class="actions" style="display:none">
        <button class="edit"
          onclick="siirDuzenle('${s.id}', \`${s.baslik}\`, \`${s.icerik}\`)">✏️</button>
        <button class="del"
          onclick="siirSil('${s.id}')">🗑️</button>
      </div>`}
    `;

    siirler.appendChild(card);
  });
}

/* 🔽 AÇ / KAPA */
window.toggleIcerik = (el) => {
  const pre = el.nextElementSibling;
  const actions = pre.nextElementSibling;

  const acik = pre.style.display === "block";
  pre.style.display = acik ? "none" : "block";
  if (actions) actions.style.display = acik ? "none" : "flex";
};

/* 🗑️ SİL */
window.siirSil = (id) => {
  alertTitle.innerText = "Bu duayı silmek istiyor musun?";
  alertInput.style.display = "none";
  alertModal.classList.add("active");

  alertOk.onclick = async () => {
    await deleteDoc(doc(db, "siirler", id));
    alertModal.classList.remove("active");
    toast("💔 Dua silindi");
    listele();
  };
};

/* ✏️ DÜZENLE */
window.siirDuzenle = (id, eskiBaslik, eskiIcerik) => {
  alertTitle.innerText = "Duayı düzenle 🤍";

  alertInput.style.display = "block";
  alertInput.value = eskiIcerik;

  let baslikInput = document.getElementById("alertBaslik");
  if (!baslikInput) {
    baslikInput = document.createElement("input");
    baslikInput.id = "alertBaslik";
    baslikInput.placeholder = "Dua Başlığı";
    baslikInput.style.marginBottom = "12px";
    alertModal.querySelector(".modal").insertBefore(
      baslikInput,
      alertInput
    );
  }

  baslikInput.value = eskiBaslik;
  alertModal.classList.add("active");

  alertOk.onclick = async () => {
    await updateDoc(doc(db, "siirler", id), {
      baslik: baslikInput.value,
      icerik: alertInput.value
    });

    alertModal.classList.remove("active");
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