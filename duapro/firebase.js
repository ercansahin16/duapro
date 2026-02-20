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

/* 🔤 TÜRKÇE NORMALIZE */
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

/* 🧿 SÜRPRİZ MODU */
let surprise = localStorage.getItem("surprise") === "on";

window.toggleSurprise = () => {
  surprise = !surprise;
  localStorage.setItem("surprise", surprise ? "on" : "off");
  toast(surprise ? "🧿 Sürpriz Modu Açık" : "🧿 Sürpriz Modu Kapalı");
  listele();
};

/* 📖 LİSTELE + ARAMA */
let tumDualar = [];

async function listele() {
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

  // Favoriler üstte
  filtrelenmis.sort((a, b) => b.favorite - a.favorite);

  duaCountSpan.innerText = `${filtrelenmis.length} dua`;
  siirlerDiv.innerHTML = "";

  filtrelenmis.forEach(s => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = s.id;
    card.setAttribute("draggable", !surprise);

    card.innerHTML = `
      <span class="favorite-star" onclick="favToggle('${s.id}', ${s.favorite})">
        ${s.favorite ? "⭐" : "☆"}
      </span>
      <div class="card-content">
        <h2 onclick="toggleIcerik(this)">${s.baslik}</h2>
        <pre class="icerik" style="display:none">${s.icerik}</pre>
      </div>
    `;
    siirlerDiv.appendChild(card);
  });
}

/* 🔍 Arama */
aramaInput.addEventListener("input", listele);

/* 🧹 Aramayı temizle */
window.clearSearch = () => {
  aramaInput.value = "";
  listele();
};

/* 🚀 İlk yükleme */
window.onload = listele;
