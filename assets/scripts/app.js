// ===== Toggle View Logic (Must be first!) =====
function showSection(sectionId) {
  const sections = ["cartSection"];
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

