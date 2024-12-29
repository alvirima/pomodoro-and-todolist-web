// header
const editableHeader = document.getElementById("editableHeader");
const STORAGE_KEY = "editableHeaderContent"; // Kunci penyimpanan di Local Storage

// Fungsi untuk menyimpan teks ke Local Storage
const saveContent = () => {
  const currentContent = editableHeader.textContent.trim();
  if (currentContent !== "" && currentContent !== "New page") {
    localStorage.setItem(STORAGE_KEY, currentContent); // Simpan hanya jika bukan default
  }
};

// Fungsi untuk memuat teks dari Local Storage
const loadContent = () => {
  const savedContent = localStorage.getItem(STORAGE_KEY);
  if (savedContent !== null && savedContent.trim() !== "") {
    editableHeader.textContent = savedContent;
    editableHeader.style.color = "#cd5e77";
  } else {
    editableHeader.textContent = "New page"; // Default
    editableHeader.style.color = "#aaa"; //
  }
};

// Event: Hapus placeholder saat mulai mengetik
editableHeader.addEventListener("focus", () => {
  if (
    editableHeader.textContent.trim() ===
    editableHeader.getAttribute("data-placeholder")
  ) {
    editableHeader.textContent = ""; // Kosongkan jika placeholder
    editableHeader.style.color = "#cd5e77";
  }
});

// Event: Kembalikan placeholder jika teks kosong
editableHeader.addEventListener("blur", () => {
  const currentContent = editableHeader.textContent.trim();
  if (currentContent === "") {
    editableHeader.textContent = "New page"; // Kembalikan placeholder
    editableHeader.style.color = "#aaa"; // Kembalikan warna abu-abu
  }
  saveContent(); // Simpan ke Local Storage
});

editableHeader.addEventListener("input", () => {
  // Set warna menjadi hitam saat mengetik
  if (editableHeader.textContent.trim() !== "") {
    editableHeader.style.color = "#cd5e77";
  } else {
    editableHeader.style.color = "#aaa";
  }
});

// Muat teks dari Local Storage saat halaman pertama kali dimuat
window.addEventListener("load", loadContent);

//pomodoro timer
var time = 25 * 60;
var timerInterval;
var currentMode = "pomodoro";
var MODES = {
  pomodoro: 25,
  short: 5,
  long: 15,
};
const DEFAULT_MODES = {
  pomodoro: 25,
  short: 5,
  long: 15,
};
var totalBreaks = 0;
const alaramSound = new Audio("alaram.wav");

document.querySelectorAll("#modes button").forEach((button) => {
  button.addEventListener("click", handleModeButtons);
});

document.querySelectorAll("#duration-control input").forEach(function (input) {
  input.addEventListener("change", durationControlHandler);
  input.value = "";
});

function durationControlHandler(event) {
  var value = event.target.value.trim();
  var durationId = event.target.dataset.durationId;

  if (
    value != "" &&
    !isNaN(value) &&
    Number.isInteger(parseFloat(value)) &&
    parseInt(value) != 0
  ) {
    MODES[durationId] = parseInt(value);
  } else {
    MODES[durationId] = DEFAULT_MODES(durationId);
  }

  resetTimer();
}

function handleModeButtons(event) {
  switchMode(event.target.dataset.modeId);
}

function updateControlButtons(isrunning) {
  var start_button = document.querySelector(".timer-control.start");
  var pause_button = document.querySelector(".timer-control.pause");

  if (isrunning) {
    start_button.disabled = true;
    pause_button.disabled = false;
  } else {
    start_button.disabled = false;
    pause_button.disabled = true;
  }
}

function switchMode(mode) {
  /*
    Pomodoro Mode : pomodoro
    Short Break : short
    Long break : long 
    */

  currentMode = mode;
  document.querySelectorAll("#modes button").forEach((elem) => {
    elem.classList.remove("active");
  });
  document
    .querySelector(`button[data-mode-id="${mode}"]`)
    .classList.add("active");
  resetTimer();
}

function startTimer() {
  // Play alarm sound silently to unlock autoplay
  alaramSound
    .play()
    .then(() => {
      alaramSound.pause();
      alaramSound.currentTime = 0;
    })
    .catch((error) => {
      console.error("Autoplay error:", error);
    });

  // Mulai timer
  timerInterval = setInterval(updateTimer, 1000);
  updateControlButtons(true);
}
function pauseTimer() {
  clearInterval(timerInterval);
  updateControlButtons(false);
}

function updateTimer() {
  var minutes = Math.floor(time / 60); //2
  var seconds = time % 60; //5

  minutes = minutes < 10 ? "0" + minutes : minutes; //02
  seconds = seconds < 10 ? "0" + seconds : seconds; //05

  document.getElementById("timer").textContent = minutes + ":" + seconds;

  if (time <= 0) {
    pauseTimer();
    alaramSound.play();
    alert("Time's Up!");
    alaramSound.pause();
    alaramSound.currentTime = 0;
    nextMode();
    resetTimer();
  }
  time -= 1;
}

function nextMode() {
  if (currentMode == "pomodoro") {
    totalBreaks += 1;
    if (totalBreaks % 4 == 0) {
      switchMode("long");
    } else {
      switchMode("short");
    }
  } else {
    switchMode("pomodoro");
  }
}

function resetTimer() {
  time = MODES[currentMode] * 60;
  clearInterval(timerInterval);
  updateTimer();
  updateControlButtons(false);
}

// TODO LIST
const todoInput = document.querySelector(".todo-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const filterOption = document.querySelector(".filter-todo");

document.addEventListener("DOMContentLoaded", getLocalTodos);
todoButton.addEventListener("click", addTodo);
todoList.addEventListener("click", deleteCheck);
filterOption.addEventListener("change", filterTodo);

function addTodo(event) {
  event.preventDefault();
  const todoDiv = document.createElement("div");
  todoDiv.classList.add("todo");
  const newTodo = document.createElement("li");
  newTodo.innerText = todoInput.value;
  newTodo.classList.add("todo-item");
  todoDiv.appendChild(newTodo);
  // ADDING TO LOCAL STORAGE
  saveLocalTodos(todoInput.value);

  const completedButton = document.createElement("button");
  completedButton.innerHTML = '<i class="fas fa-circle-check"></i>';
  completedButton.classList.add("complete-btn");
  todoDiv.appendChild(completedButton);

  const trashButton = document.createElement("button");
  trashButton.innerHTML = '<i class="fas fa-trash"></i>';
  trashButton.classList.add("trash-btn");
  todoDiv.appendChild(trashButton);

  todoList.appendChild(todoDiv);
  todoInput.value = "";
}

function deleteCheck(e) {
  const item = e.target;

  if (item.classList[0] === "trash-btn") {
    const todo = item.parentElement;
    todo.classList.add("slide");

    removeLocalTodos(todo);
    todo.addEventListener("transitionend", function () {
      todo.remove();
    });
  }

  if (item.classList[0] === "complete-btn") {
    const todo = item.parentElement;
    todo.classList.toggle("completed");
  }
}

function saveLocalTodos(todo) {
  let todos;
  if (localStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem("todos"));
  }
  todos.push(todo);
  localStorage.setItem("todos", JSON.stringify(todos));
}

function getLocalTodos() {
  let todos;
  if (localStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem("todos"));
  }
  todos.forEach(function (todo) {
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");
    const newTodo = document.createElement("li");
    newTodo.innerText = todo;
    newTodo.classList.add("todo-item");
    todoDiv.appendChild(newTodo);

    const completedButton = document.createElement("button");
    completedButton.innerHTML = '<i class="fas fa-circle-check"></i>';
    completedButton.classList.add("complete-btn");
    todoDiv.appendChild(completedButton);

    const trashButton = document.createElement("button");
    trashButton.innerHTML = '<i class="fas fa-trash"></i>';
    trashButton.classList.add("trash-btn");
    todoDiv.appendChild(trashButton);

    todoList.appendChild(todoDiv);
  });
}

function removeLocalTodos(todo) {
  let todos;
  if (localStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(localStorage.getItem("todos"));
  }

  const todoIndex = todo.children[0].innerText;
  todos.splice(todos.indexOf(todoIndex), 1);
  localStorage.setItem("todos", JSON.stringify(todos));
}
