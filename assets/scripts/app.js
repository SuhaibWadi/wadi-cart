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

const app = initializeApp(mydatabase);
const database = getDatabase(app);

// ===== Toggle View Logic =====
function showSection(sectionId) {
  const sections = [
    "cartSection",
    "smartSection",
    "vegetablesSection",
    "electronicsSection",
    "newsSection",
    "todoSection",
    "eventsSection",
  ];
  sections.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = id === sectionId ? "block" : "none";
    }
  });
}

// Make it available globally for onclick handlers
window.showSection = showSection;

// ===== Category Logic =====
function setupCategory(databasePath, inputId, buttonId, listId) {
  const inputFieldEl = document.getElementById(inputId);
  const addButtonEl = document.getElementById(buttonId);
  const shoppingListEl = document.getElementById(listId);

  if (!inputFieldEl || !addButtonEl || !shoppingListEl) {
    console.error("Missing elements for category:", databasePath);
    return;
  }

  const shoppingListInDB = ref(database, databasePath);

  // Sync with DB
  onValue(shoppingListInDB, function (snapshot) {
    if (snapshot.exists()) {
      let itemArray = Object.entries(snapshot.val());
      clearListEl(shoppingListEl);

      for (let i = 0; i < itemArray.length; i++) {
        let currentItem = itemArray[i];
        appendItemToListEl(currentItem, shoppingListEl, databasePath);
      }
    } else {
      shoppingListEl.innerHTML = "No item add ... yet";
    }
  });

  // Add Item
  addButtonEl.addEventListener("click", () => {
    let inputValue = inputFieldEl.value;
    if (inputValue == "" || inputValue == null) {
      return false;
    } else {
      push(shoppingListInDB, inputValue);
      clearInputEl(inputFieldEl);
    }
  });
}

function clearListEl(listElement) {
  listElement.innerHTML = "";
}

function clearInputEl(inputElement) {
  inputElement.value = "";
}

function appendItemToListEl(item, listElement, databasePath) {
  let itemID = item[0];
  let itemValue = item[1];
  let newEl = document.createElement("li");

  newEl.textContent = itemValue;
  listElement.append(newEl);

  newEl.addEventListener("click", () => {
    newEl.classList.toggle("activeGreen");
  });

  newEl.addEventListener("dblclick", () => {
    let exactLocationOfItemInDB = ref(database, `${databasePath}/${itemID}`);
    remove(exactLocationOfItemInDB);
  });
}

// Initialize all categories (Must be called AFTER setupCategory and database are defined)
setupCategory("shoppingList", "input-cart", "btn-cart", "list-cart");
setupCategory("smartList", "input-smart", "btn-smart", "list-smart");
setupCategory("vegetablesList", "input-vegetables", "btn-vegetables", "list-vegetables");
setupCategory("electronicsList", "input-electronics", "btn-electronics", "list-electronics");
setupCategory("newsList", "input-news", "btn-news", "list-news");
setupCategory("todoList", "input-todo", "btn-todo", "list-todo");
setupCategory("eventsList", "input-events", "btn-events", "list-events");
