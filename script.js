/* eslint-disable no-use-before-define */
/**
 * Agenda personnel & professionnel
 * --------------------------------
 * Fonctionnalités principales :
 *  - Gestion d'une to-do list quotidienne avec persistance via localStorage.
 *  - Transport automatique des tâches incomplètes vers le lendemain.
 *  - Gestion d'un espace de notes (multiples notes avec titre, contenu, suppression).
 *  - Interface mono-page avec navigation entre "Agenda / Tâches" et "Notes".
 *  - Affichage de la date du jour et sélection d'une date personnalisée.
 *
 * Le code ci-dessous est fortement commenté afin de clarifier chaque étape.
 */

// --- Sélecteurs et éléments principaux --- //
const navButtons = document.querySelectorAll(".nav-button");
const sections = document.querySelectorAll(".app-section");
const currentDateLabel = document.getElementById("current-date");
const selectedDateInput = document.getElementById("selected-date");
const previousDayButton = document.getElementById("previous-day-button");
const nextDayButton = document.getElementById("next-day-button");

const taskList = document.getElementById("task-list");
const taskTemplate = document.getElementById("task-template");
const addTaskButton = document.getElementById("add-task-button");
const clearDayButton = document.getElementById("clear-day-button");

const notesContainer = document.getElementById("notes-container");
const noteTemplate = document.getElementById("note-template");
const addNoteButton = document.getElementById("add-note-button");
const notesSearchInput = document.getElementById("notes-search");
const themeToggle = document.getElementById("theme-toggle");
const taskFilters = document.querySelectorAll(".filter-btn");
const totalTasksSpan = document.getElementById("total-tasks");
const completedTasksSpan = document.getElementById("completed-tasks");
const progressPercentSpan = document.getElementById("progress-percent");
const exportDataButton = document.getElementById("export-data-button");
const importDataButton = document.getElementById("import-data-button");
const importFileInput = document.getElementById("import-file-input");

// --- Constantes locales --- //
const STORAGE_KEYS = {
  TASKS: "agenda.tasks",
  NOTES: "agenda.notes",
  THEME: "agenda.theme",
};

// État de l'application
let currentFilter = "all";
let searchQuery = "";

// Formatage internationalisé pour afficher les dates lisiblement.
const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

// --- Vérification de la disponibilité de localStorage --- //
function isStorageAvailable() {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// --- Initialisation de l'application --- //
document.addEventListener("DOMContentLoaded", () => {
  // Vérifier que localStorage fonctionne
  if (!isStorageAvailable()) {
    const warning = document.createElement("div");
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f59e0b;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      max-width: 300px;
      font-size: 0.9rem;
    `;
    warning.textContent = "⚠️ Le stockage local n'est pas disponible. Vos données ne seront pas sauvegardées.";
    document.body.appendChild(warning);
    setTimeout(() => warning.remove(), 5000);
  }
  
  initTheme();
  initNavigation();
  initDateSelection();
  initTasks();
  initNotes();
  initKeyboardShortcuts();
  initSync();
});

// --- Gestion du thème --- //
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle?.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  if (themeToggle) {
    const icon = themeToggle.querySelector(".theme-icon");
    if (icon) {
      icon.textContent = theme === "dark" ? "☀️" : "🌙";
    }
  }
}

// --- Initialisation de la navigation --- //
function initNavigation() {
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.section;
      if (!targetId) return;

      navButtons.forEach((btn) => btn.classList.toggle("active", btn === button));
      sections.forEach((section) =>
        section.classList.toggle("active", section.id === targetId)
      );
    });
  });
}

// --- Gestion des dates et affichage du jour --- //
function initDateSelection() {
  const today = formatDateInputValue(new Date());
  applyDateChange(today);

  selectedDateInput.addEventListener("change", () => {
    applyDateChange(selectedDateInput.value || today);
  });

  previousDayButton?.addEventListener("click", () => {
    const current = selectedDateInput.value || today;
    const previous = getPreviousDateValue(current);
    applyDateChange(previous);
  });

  nextDayButton?.addEventListener("click", () => {
    const current = selectedDateInput.value || today;
    const next = getNextDateValue(current);
    applyDateChange(next);
  });
}

function applyDateChange(targetDate) {
  const normalizedDate = targetDate || formatDateInputValue(new Date());
  selectedDateInput.value = normalizedDate;
  updateCurrentDateLabel(normalizedDate);
  ensureCarryOver(normalizedDate);
  renderTaskList(normalizedDate);
  renderNotes(normalizedDate);
  updateTaskStats(normalizedDate);
}

function updateCurrentDateLabel(dateValue) {
  const date = dateFromInputValue(dateValue);
  currentDateLabel.textContent = capitalize(dateFormatter.format(date));
}

// Convertit un objet Date en valeur compatible avec un input[type="date"].
function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromInputValue(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getPreviousDateValue(currentValue) {
  const currentDate = dateFromInputValue(currentValue);
  const previous = new Date(currentDate);
  previous.setDate(previous.getDate() - 1);
  return formatDateInputValue(previous);
}

function getNextDateValue(currentValue) {
  const currentDate = dateFromInputValue(currentValue);
  const next = new Date(currentDate);
  next.setDate(next.getDate() + 1);
  return formatDateInputValue(next);
}

// --- Gestion du stockage local --- //
function readStorage(key, fallback) {
  if (!isStorageAvailable()) {
    console.warn("localStorage n'est pas disponible. Les données ne seront pas sauvegardées.");
    return fallback;
  }
  
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Impossible de lire ${key} depuis localStorage`, error);
    return fallback;
  }
}

function writeStorage(key, value) {
  if (!isStorageAvailable()) {
    console.warn("localStorage n'est pas disponible. Impossible de sauvegarder.");
    return false;
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Impossible d'écrire ${key} dans localStorage`, error);
    // Si le quota est dépassé, essayer de nettoyer un peu
    if (error.name === "QuotaExceededError") {
      console.warn("Quota localStorage dépassé. Nettoyage des anciennes données...");
      try {
        // Supprimer les données de plus de 30 jours
        cleanupOldData();
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error("Impossible de libérer de l'espace", e);
      }
    }
    return false;
  }
}

// Nettoyage des données anciennes (plus de 30 jours)
function cleanupOldData() {
  try {
    const tasks = readStorage(STORAGE_KEYS.TASKS, {});
    const notes = readStorage(STORAGE_KEYS.NOTES, {});
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Nettoyer les tâches anciennes
    const cleanedTasks = {};
    Object.keys(tasks).forEach((dateKey) => {
      const taskDate = new Date(dateKey);
      if (taskDate >= thirtyDaysAgo) {
        cleanedTasks[dateKey] = tasks[dateKey];
      }
    });
    writeStorage(STORAGE_KEYS.TASKS, cleanedTasks);
    
    // Nettoyer les notes anciennes
    const cleanedNotes = {};
    Object.keys(notes).forEach((dateKey) => {
      const noteDate = new Date(dateKey);
      if (noteDate >= thirtyDaysAgo) {
        cleanedNotes[dateKey] = notes[dateKey];
      }
    });
    writeStorage(STORAGE_KEYS.NOTES, cleanedNotes);
  } catch (error) {
    console.warn("Erreur lors du nettoyage", error);
  }
}

// --- Gestion des tâches --- //
function initTasks() {
  addTaskButton.addEventListener("click", () => {
    const dateValue = selectedDateInput.value;
    const task = createTask();
    const tasks = getTasksByDate(dateValue);
    tasks.push(task);
    saveTasksByDate(dateValue, tasks);
    renderTaskList(dateValue);
    updateTaskStats(dateValue);
  });

  clearDayButton.addEventListener("click", () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer toutes les tâches de cette journée ?")) {
      const dateValue = selectedDateInput.value;
      saveTasksByDate(dateValue, []);
      renderTaskList(dateValue);
      updateTaskStats(dateValue);
    }
  });

  // Filtres de tâches
  taskFilters.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      taskFilters.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderTaskList(selectedDateInput.value);
    });
  });
}

function getAllTasks() {
  return readStorage(STORAGE_KEYS.TASKS, {});
}

function getTasksByDate(dateValue) {
  const allTasks = getAllTasks();
  return allTasks[dateValue] ? [...allTasks[dateValue]] : [];
}

function saveTasksByDate(dateValue, tasks) {
  const allTasks = getAllTasks();
  allTasks[dateValue] = tasks;
  writeStorage(STORAGE_KEYS.TASKS, allTasks);
}

function createTask(overrides = {}) {
  return {
    id: generateId(),
    text: "",
    completed: false,
    priority: "normal",
    carriedFrom: null,
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function ensureCarryOver(currentDateValue) {
  const tasksToday = getTasksByDate(currentDateValue);
  if (tasksToday.length > 0) {
    return;
  }

  const yesterdayValue = getPreviousDateValue(currentDateValue);
  const tasksYesterday = getTasksByDate(yesterdayValue);
  if (tasksYesterday.length === 0) {
    return;
  }

  const incompleteTasks = tasksYesterday.filter((task) => !task.completed);
  if (incompleteTasks.length === 0) {
    return;
  }

  const carriedTasks = incompleteTasks.map((task) =>
    createTask({
      id: task.id,
      text: task.text,
      completed: false,
      priority: task.priority || "normal",
      carriedFrom: yesterdayValue,
      updatedAt: new Date().toISOString(),
    })
  );

  saveTasksByDate(currentDateValue, carriedTasks);
}

function renderTaskList(dateValue) {
  let tasks = getTasksByDate(dateValue);
  
  // Appliquer le filtre
  if (currentFilter === "active") {
    tasks = tasks.filter((t) => !t.completed);
  } else if (currentFilter === "completed") {
    tasks = tasks.filter((t) => t.completed);
  }

  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = `
      <li class="task-item empty">
        <div class="task-content">
          <p class="task-text" style="opacity:0.7;">Aucune tâche pour cette journée. Ajoutez-en une pour commencer !</p>
        </div>
      </li>`;
    updateTaskStats(dateValue);
    return;
  }

  // Trier par priorité (haute > normale > basse) puis par date
  tasks.sort((a, b) => {
    const priorityOrder = { high: 3, normal: 2, low: 1 };
    if (priorityOrder[a.priority || "normal"] !== priorityOrder[b.priority || "normal"]) {
      return priorityOrder[b.priority || "normal"] - priorityOrder[a.priority || "normal"];
    }
    return new Date(a.updatedAt) - new Date(b.updatedAt);
  });

  tasks.forEach((task) => {
    const taskElement = taskTemplate.content.firstElementChild.cloneNode(true);
    const checkbox = taskElement.querySelector(".task-complete");
    const textInput = taskElement.querySelector(".task-text");
    const prioritySelect = taskElement.querySelector(".task-priority");
    const updatedSpan = taskElement.querySelector(".task-updated");
    const deleteButton = taskElement.querySelector(".delete-task");

    if (task.completed) {
      taskElement.classList.add("completed");
    }
    
    taskElement.setAttribute("data-priority", task.priority || "normal");
    textInput.value = task.text;
    checkbox.checked = task.completed;
    prioritySelect.value = task.priority || "normal";
    updatedSpan.textContent = formatUpdatedAt(task.updatedAt);

    textInput.addEventListener("input", () => {
      const updated = updateTask(dateValue, task.id, { text: textInput.value }, { rerender: false });
      if (updated) {
        updatedSpan.textContent = formatUpdatedAt(updated.updatedAt);
      }
    });

    textInput.addEventListener("blur", () => {
      const trimmed = textInput.value.trim();
      textInput.value = trimmed;
      updateTask(dateValue, task.id, { text: trimmed });
    });

    textInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        textInput.blur();
      }
    });

    prioritySelect.addEventListener("change", () => {
      const updated = updateTask(dateValue, task.id, { priority: prioritySelect.value }, { rerender: false });
      if (updated) {
        taskElement.setAttribute("data-priority", updated.priority);
      }
    });

    checkbox.addEventListener("change", () => {
      const updated = updateTask(dateValue, task.id, { completed: checkbox.checked });
      if (updated?.completed) {
        cleanupCarriedTasks(dateValue, updated.id);
      }
      updateTaskStats(dateValue);
    });

    deleteButton.addEventListener("click", () => {
      deleteTask(dateValue, task.id);
    });

    taskList.appendChild(taskElement);
  });

  updateTaskStats(dateValue);
}

function updateTaskStats(dateValue) {
  const allTasks = getTasksByDate(dateValue);
  const total = allTasks.length;
  const completed = allTasks.filter((t) => t.completed).length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (totalTasksSpan) totalTasksSpan.textContent = total;
  if (completedTasksSpan) completedTasksSpan.textContent = completed;
  if (progressPercentSpan) progressPercentSpan.textContent = `${progress}%`;
}

function updateTask(dateValue, taskId, updates, options = {}) {
  const { rerender = true } = options;
  const tasks = getTasksByDate(dateValue);
  let updatedTask;
  const updatedTasks = tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }
    updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return updatedTask;
  });

  saveTasksByDate(dateValue, updatedTasks);
  if (rerender) {
    renderTaskList(dateValue);
    updateTaskStats(dateValue);
  }
  return updatedTask;
}

function cleanupCarriedTasks(dateValue, taskId) {
  let currentDate = dateValue;

  for (let step = 0; step < 365; step += 1) {
    const nextDate = getNextDateValue(currentDate);
    const tasks = getTasksByDate(nextDate);

    if (tasks.length === 0) {
      break;
    }

    const filteredTasks = tasks.filter((task) => task.id !== taskId);
    if (filteredTasks.length === tasks.length) {
      break;
    }

    saveTasksByDate(nextDate, filteredTasks);
    if (selectedDateInput.value === nextDate) {
      renderTaskList(nextDate);
    }

    currentDate = nextDate;
  }
}

function deleteTask(dateValue, taskId) {
  const tasks = getTasksByDate(dateValue);
  const updatedTasks = tasks.filter((task) => task.id !== taskId);
  saveTasksByDate(dateValue, updatedTasks);
  renderTaskList(dateValue);
  updateTaskStats(dateValue);
}

function formatUpdatedAt(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return `Mis à jour à ${timeFormatter.format(date)}`;
}

// --- Gestion des notes --- //
function initNotes() {
  addNoteButton.addEventListener("click", () => {
    const dateValue = selectedDateInput.value;
    const note = createNote();
    const notes = getNotesByDate(dateValue);
    notes.unshift(note); // Ajouter en tête pour un accès rapide.
    saveNotesByDate(dateValue, notes);
    renderNotes(dateValue);
  });

  // Recherche dans les notes
  notesSearchInput?.addEventListener("input", (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderNotes(selectedDateInput.value);
  });
}

function getAllNotes() {
  const stored = readStorage(STORAGE_KEYS.NOTES, {});
  if (Array.isArray(stored)) {
    const fallbackDate = selectedDateInput?.value || formatDateInputValue(new Date());
    const normalized = { [fallbackDate]: stored };
    writeStorage(STORAGE_KEYS.NOTES, normalized);
    return normalized;
  }
  return stored;
}

function getNotesByDate(dateValue) {
  const allNotes = getAllNotes();
  return allNotes[dateValue] ? [...allNotes[dateValue]] : [];
}

function saveNotesByDate(dateValue, notes) {
  const allNotes = getAllNotes();
  allNotes[dateValue] = notes;
  writeStorage(STORAGE_KEYS.NOTES, allNotes);
}

function createNote(overrides = {}) {
  return {
    id: generateId(),
    title: "",
    body: "",
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderNotes(dateValue) {
  const targetDate = dateValue || selectedDateInput.value;
  let notes = getNotesByDate(targetDate);
  
  // Filtrer par recherche
  if (searchQuery) {
    notes = notes.filter((note) => {
      const titleMatch = note.title?.toLowerCase().includes(searchQuery);
      const bodyMatch = note.body?.toLowerCase().includes(searchQuery);
      return titleMatch || bodyMatch;
    });
  }

  notesContainer.innerHTML = "";

  if (notes.length === 0) {
    const message = searchQuery 
      ? `<p style="opacity:0.7;">Aucune note ne correspond à votre recherche.</p>`
      : `<p style="opacity:0.7;">Aucune note pour le moment. Créez votre première note !</p>`;
    notesContainer.innerHTML = message;
    return;
  }

  notes.forEach((note) => {
    const noteElement = noteTemplate.content.firstElementChild.cloneNode(true);
    const titleInput = noteElement.querySelector(".note-title");
    const bodyTextarea = noteElement.querySelector(".note-body");
    const deleteButton = noteElement.querySelector(".delete-note");
    const updatedSpan = noteElement.querySelector(".note-updated");

    titleInput.value = note.title;
    bodyTextarea.value = note.body;
    updatedSpan.textContent = formatNoteUpdatedAt(note.updatedAt);

    titleInput.addEventListener("input", () => {
      const updated = updateNote(targetDate, note.id, { title: titleInput.value }, { rerender: false });
      if (updated) {
        updatedSpan.textContent = formatNoteUpdatedAt(updated.updatedAt);
      }
    });

    bodyTextarea.addEventListener("input", () => {
      const updated = updateNote(targetDate, note.id, { body: bodyTextarea.value }, { rerender: false });
      if (updated) {
        updatedSpan.textContent = formatNoteUpdatedAt(updated.updatedAt);
      }
    });

    deleteButton.addEventListener("click", () => {
      deleteNote(targetDate, note.id);
    });

    notesContainer.appendChild(noteElement);
  });
}

function updateNote(dateValue, noteId, updates, options = {}) {
  const { rerender = true } = options;
  const notes = getNotesByDate(dateValue);
  let updatedNote;
  const updatedNotes = notes.map((note) => {
    if (note.id !== noteId) {
      return note;
    }
    updatedNote = {
      ...note,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return updatedNote;
  });

  saveNotesByDate(dateValue, updatedNotes);
  if (rerender) {
    renderNotes(dateValue);
  }
  return updatedNote;
}

function deleteNote(dateValue, noteId) {
  const notes = getNotesByDate(dateValue);
  const updatedNotes = notes.filter((note) => note.id !== noteId);
  saveNotesByDate(dateValue, updatedNotes);
  renderNotes(dateValue);
}

function formatNoteUpdatedAt(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return `Modifiée le ${dateFormatter.format(date)} à ${timeFormatter.format(date)}`;
}

// --- Utilitaires --- //
function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

// --- Synchronisation et export/import --- //
function initSync() {
  // Export des données
  exportDataButton?.addEventListener("click", () => {
    const data = {
      tasks: readStorage(STORAGE_KEYS.TASKS, {}),
      notes: readStorage(STORAGE_KEYS.NOTES, {}),
      theme: readStorage(STORAGE_KEYS.THEME, "light"),
      exportDate: new Date().toISOString(),
      version: "1.0"
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agenda-backup-${formatDateInputValue(new Date())}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Afficher un message de confirmation
    showNotification("✅ Données exportées avec succès !", "success");
  });

  // Import des données
  importDataButton?.addEventListener("click", () => {
    importFileInput?.click();
  });

  importFileInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        // Vérifier que c'est un fichier valide
        if (!data.tasks || !data.notes) {
          throw new Error("Format de fichier invalide");
        }

        // Demander confirmation
        const confirmMessage = `Importer ces données ?\n\n` +
          `- Tâches : ${Object.keys(data.tasks).length} journées\n` +
          `- Notes : ${Object.keys(data.notes).length} journées\n\n` +
          `⚠️ Cela remplacera vos données actuelles !`;
        
        if (confirm(confirmMessage)) {
          // Fusionner avec les données existantes (ou remplacer)
          const merge = confirm("Fusionner avec les données existantes ?\n\nOui = Fusionner\nNon = Remplacer tout");
          
          if (merge) {
            // Fusionner les tâches
            const existingTasks = readStorage(STORAGE_KEYS.TASKS, {});
            const mergedTasks = { ...existingTasks };
            Object.keys(data.tasks).forEach((date) => {
              if (mergedTasks[date]) {
                // Fusionner les tâches de cette date
                const existing = mergedTasks[date];
                const imported = data.tasks[date];
                const existingIds = new Set(existing.map(t => t.id));
                const newTasks = imported.filter(t => !existingIds.has(t.id));
                mergedTasks[date] = [...existing, ...newTasks];
              } else {
                mergedTasks[date] = data.tasks[date];
              }
            });

            // Fusionner les notes
            const existingNotes = readStorage(STORAGE_KEYS.NOTES, {});
            const mergedNotes = { ...existingNotes };
            Object.keys(data.notes).forEach((date) => {
              if (mergedNotes[date]) {
                const existing = mergedNotes[date];
                const imported = data.notes[date];
                const existingIds = new Set(existing.map(n => n.id));
                const newNotes = imported.filter(n => !existingIds.has(n.id));
                mergedNotes[date] = [...existing, ...newNotes];
              } else {
                mergedNotes[date] = data.notes[date];
              }
            });

            writeStorage(STORAGE_KEYS.TASKS, mergedTasks);
            writeStorage(STORAGE_KEYS.NOTES, mergedNotes);
          } else {
            // Remplacer tout
            writeStorage(STORAGE_KEYS.TASKS, data.tasks);
            writeStorage(STORAGE_KEYS.NOTES, data.notes);
          }

          // Importer le thème si présent
          if (data.theme) {
            writeStorage(STORAGE_KEYS.THEME, data.theme);
            document.documentElement.setAttribute("data-theme", data.theme);
            updateThemeIcon(data.theme);
          }

          // Recharger l'affichage
          const currentDate = selectedDateInput.value;
          renderTaskList(currentDate);
          renderNotes(currentDate);
          updateTaskStats(currentDate);

          showNotification("✅ Données importées avec succès !", "success");
        }
      } catch (error) {
        console.error("Erreur lors de l'import", error);
        showNotification("❌ Erreur : Fichier invalide ou corrompu", "error");
      }
    };

    reader.readAsText(file);
    e.target.value = ""; // Réinitialiser l'input
  });
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#2f9e44" : type === "error" ? "#d84b57" : "#4c6ef5"};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 10000;
    max-width: 300px;
    font-size: 0.9rem;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Ajouter les animations CSS pour les notifications
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// --- Raccourcis clavier --- //
function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Ignorer si on est dans un input/textarea
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      // Permettre Ctrl/Cmd + N pour nouvelle tâche même dans un input
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        addTaskButton?.click();
      }
      return;
    }

    // N = Nouvelle tâche
    if (e.key === "n" || e.key === "N") {
      e.preventDefault();
      addTaskButton?.click();
    }

    // Flèches gauche/droite = Navigation entre les jours
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      previousDayButton?.click();
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextDayButton?.click();
    }

    // 1, 2, 3 = Navigation entre sections
    if (e.key === "1") {
      e.preventDefault();
      const agendaBtn = document.querySelector('[data-section="agenda-section"]');
      agendaBtn?.click();
    }
    if (e.key === "2") {
      e.preventDefault();
      const notesBtn = document.querySelector('[data-section="notes-section"]');
      notesBtn?.click();
    }
  });
}

