// ===== Toggle View Logic (Must be first!) =====
function showSection(sectionId) {
  const sections = ["cartSection", "prayerSection"];
  sections.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = id === sectionId ? "block" : "none";
    }
  });
}

// Make it available globally for onclick handlers
window.showSection = showSection;

// ===== Firebase Cart Logic =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  remove,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const mydatabase = {
  databaseURL:
    "https://test2-18a3f-default-rtdb.europe-west1.firebasedatabase.app/",
};

const inputFieldEl = document.getElementById("input-field");
const addButtonEl = document.getElementById("add-button");
const shoppingListEl = document.getElementById("shopping-list");

const app = initializeApp(mydatabase);
const database = getDatabase(app);
const shoppingListInDB = ref(database, "shoppingList");

onValue(shoppingListInDB, function (snapshot) {
  if (snapshot.exists()) {
    let itemArray = Object.entries(snapshot.val());
    clearShoppingListEl();

    for (let i = 0; i < itemArray.length; i++) {
      let currentItem = itemArray[i];
      appenedItemToShoppingListEl(currentItem);
    }
  } else {
    shoppingListEl.innerHTML = "No item add ... yet";
  }
});

addButtonEl.addEventListener("click", () => {
  let inputValue = inputFieldEl.value;
  if (inputValue == "" || inputValue == null) {
    return false;
  } else {
    push(shoppingListInDB, inputValue);
    clearInputFieldEl();
  }
});

function clearShoppingListEl() {
  shoppingListEl.innerHTML = "";
}

function clearInputFieldEl() {
  inputFieldEl.value = "";
}

function appenedItemToShoppingListEl(item) {
  let itemID = item[0];
  let itemValue = item[1];
  let newEl = document.createElement("li");

  newEl.textContent = itemValue;
  shoppingListEl.append(newEl);

  newEl.addEventListener("click", () => {
    newEl.classList.toggle("activeGreen");
  });

  newEl.addEventListener("dblclick", () => {
    let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`);
    remove(exactLocationOfItemInDB);
  });
}

// ===== Prayer Times Logic =====
const today = new Date().toISOString().substring(0, 10);

// Using AlAdhan API instead (supports CORS)
const API_URL = "https://api.aladhan.com/v1/timingsByCity";

const dateEl = document.getElementById("date");
if (dateEl) {
  dateEl.textContent = `التاريخ: ${today}`;
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    alert("المتصفح لا يدعم الإشعارات.");
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("يجب السماح بالإشعارات لتلقي تنبيهات الصلاة.");
    return false;
  }

  return true;
}

function scheduleNotification() {
  if (Notification.permission === "granted") {
    setTimeout(() => {
      new Notification("⏰ Test Alarm", {
        body: "This notification is triggered after 20 seconds",
      });
    }, 20000);
  }
}

// Map Arabic names to match your style
const prayerNameMap = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

async function loadPrayerTimes() {
  const loading = document.getElementById("loading");
  const error = document.getElementById("error");
  const prayerContainer = document.getElementById("prayerTimes");

  try {
    // Using AlAdhan API with Amman coordinates
    const res = await fetch(`${API_URL}?city=Amman&country=Jordan&method=4`);
    
    if (!res.ok) throw new Error("API request failed");
    
    const data = await res.json();
    
    if (data.code !== 200) throw new Error("Invalid response");

    const timings = data.data.timings;
    
    // Convert to your format
    const prayers = [
      { name: prayerNameMap.Fajr, time: timings.Fajr },
      { name: prayerNameMap.Sunrise, time: timings.Sunrise },
      { name: prayerNameMap.Dhuhr, time: timings.Dhuhr },
      { name: prayerNameMap.Asr, time: timings.Asr },
      { name: prayerNameMap.Maghrib, time: timings.Maghrib },
      { name: prayerNameMap.Isha, time: timings.Isha },
    ];

    prayers.forEach((prayer) => {
      const row = document.createElement("div");
      row.className = "prayer-row";

      const name = document.createElement("div");
      name.className = "prayer-name";
      name.textContent = prayer.name;

      const time = document.createElement("div");
      time.className = "prayer-time";
      time.textContent = prayer.time;

      row.appendChild(name);
      row.appendChild(time);
      prayerContainer.appendChild(row);
    });
  } catch (err) {
    console.error("Prayer times error:", err);
    error.style.display = "block";
    error.textContent = "فشل تحميل مواقيت الصلاة. يرجى المحاولة لاحقاً.";
  } finally {
    loading.style.display = "none";
  }
}

const notifyBtn = document.getElementById("notifyBtn");
if (notifyBtn) {
  notifyBtn.addEventListener("click", scheduleNotification);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", async () => {
  await requestNotificationPermission();
  loadPrayerTimes();
});