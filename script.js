let tasks = [
    {
        id: 1,
        name: "Draft Project Proposal",
        dueDate: getTodayDate(),
        priority: "high",
        completed: false
    },
    {
        id: 2,
        name: "Take Trash Out",
        dueDate: getTomorrowDate(),
        priority: "medium",
        completed: false
    },
    {
        id: 3,
        name: "Get Groceries",
        dueDate: getTomorrowDate(),
        priority: "medium",
        completed: false
    },
    {
        id: 4,
        name: "Send Mail",
        dueDate: getTomorrowDate(),
        priority: "medium",
        completed: false
    }
];

let currentFilter = "today";
let editTaskId = null;
let completedVisible = true;

const taskList = document.getElementById("taskList");
const completedList = document.getElementById("completedList");

const todayBtn = document.getElementById("todayBtn");
const pendingBtn = document.getElementById("pendingBtn");
const overdueBtn = document.getElementById("overdueBtn");
const addTaskBtn = document.getElementById("addTaskBtn");

const taskForm = document.getElementById("taskForm");
const taskNameInput = document.getElementById("taskName");
const taskDateInput = document.getElementById("taskDate");
const taskPriorityInput = document.getElementById("taskPriority");
const modalTitle = document.getElementById("modalTitle");

const toggleCompleted = document.getElementById("toggleCompleted");
const completedArrow = document.getElementById("completedArrow");

const taskModal = new bootstrap.Modal(document.getElementById("taskModal"));

/* ---------- Date Helper Functions ---------- */

function getTodayDate() {
    const today = new Date();
    return today.toISOString().split("T")[0];
}

function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

/* ---------- Filter Functions ---------- */

function isToday(dateString) {
    return dateString === getTodayDate();
}

function isOverdue(dateString) {
    return dateString < getTodayDate();
}

function isPending(dateString) {
    return dateString >= getTodayDate();
}

function setActiveButton(activeButton) {
    [todayBtn, pendingBtn, overdueBtn].forEach(button => {
        button.classList.remove("active-filter");
    });
    activeButton.classList.add("active-filter");
}

/* ---------- Render Functions ---------- */

function renderTasks() {
    taskList.innerHTML = "";
    completedList.innerHTML = "";

    let filteredTasks = tasks.filter(task => !task.completed);

    if (currentFilter === "today") {
        filteredTasks = filteredTasks.filter(task => isToday(task.dueDate));
    } else if (currentFilter === "pending") {
        filteredTasks = filteredTasks.filter(task => isPending(task.dueDate));
    } else if (currentFilter === "overdue") {
        filteredTasks = filteredTasks.filter(task => isOverdue(task.dueDate));
    }

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="alert alert-light border text-center">
                No tasks found in this section.
            </div>
        `;
    } else {
        filteredTasks.forEach(task => {
            taskList.innerHTML += createTaskCard(task);
        });
    }

    const completedTasks = tasks.filter(task => task.completed);

    if (completedTasks.length > 0) {
        completedTasks.forEach(task => {
            completedList.innerHTML += createTaskCard(task, true);
        });
    } else {
        completedList.innerHTML = `
            <div class="text-muted">No completed tasks yet.</div>
        `;
    }

    if (!completedVisible) {
        completedList.style.display = "none";
        completedArrow.textContent = "▼";
    } else {
        completedList.style.display = "block";
        completedArrow.textContent = "▲";
    }
}

function createTaskCard(task, isCompleted = false) {
    return `
        <div class="task-card ${isCompleted ? "completed-task" : ""}">
            <div class="task-left">
                <input 
                    type="checkbox" 
                    class="form-check-input task-check"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTaskComplete(${task.id})"
                >
                <p class="task-name">${task.name}</p>
            </div>

            <div class="task-middle">
                <i class="bi bi-clock"></i>
                <p class="task-date">${formatDate(task.dueDate)}</p>
            </div>

          <div class="task-right">
                <i class="bi bi-pencil-fill edit-icon" onclick="editTask(${task.id})"></i>
                <span class="priority-dot ${task.priority}" title="${task.priority} priority"></span>
          </div>
        </div>
    `;
}

/* ---------- Add Task ---------- */

addTaskBtn.addEventListener("click", function () {
    editTaskId = null;
    modalTitle.textContent = "Add Task";
    taskForm.reset();
    taskDateInput.value = getTodayDate();
    taskModal.show();
});

/* ---------- Save Task ---------- */

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const taskName = taskNameInput.value.trim();
    const taskDate = taskDateInput.value;
    const taskPriority = taskPriorityInput.value;

    if (taskName === "" || taskDate === "") {
        alert("Please fill all fields.");
        return;
    }

    if (editTaskId === null) {
        const newTask = {
            id: Date.now(),
            name: taskName,
            dueDate: taskDate,
            priority: taskPriority,
            completed: false
        };

        tasks.push(newTask);
    } else {
        const taskIndex = tasks.findIndex(task => task.id === editTaskId);

        tasks[taskIndex].name = taskName;
        tasks[taskIndex].dueDate = taskDate;
        tasks[taskIndex].priority = taskPriority;
    }

    taskForm.reset();
    taskModal.hide();
    renderTasks();
});

/* ---------- Edit Task ---------- */

function editTask(id) {
    const task = tasks.find(task => task.id === id);

    editTaskId = id;
    modalTitle.textContent = "Edit Task";

    taskNameInput.value = task.name;
    taskDateInput.value = task.dueDate;
    taskPriorityInput.value = task.priority;

    taskModal.show();
}

/* ---------- Delete Task ---------- */

function deleteTask(id) {
    const confirmDelete = confirm("Are you sure you want to delete this task?");

    if (confirmDelete) {
        tasks = tasks.filter(task => task.id !== id);
        renderTasks();
    }
}

/* ---------- Complete Task ---------- */

function toggleTaskComplete(id) {
    const task = tasks.find(task => task.id === id);
    task.completed = !task.completed;
    renderTasks();
}

/* ---------- Filter Button Events ---------- */

todayBtn.addEventListener("click", function () {
    currentFilter = "today";
    setActiveButton(todayBtn);
    renderTasks();
});

pendingBtn.addEventListener("click", function () {
    currentFilter = "pending";
    setActiveButton(pendingBtn);
    renderTasks();
});

overdueBtn.addEventListener("click", function () {
    currentFilter = "overdue";
    setActiveButton(overdueBtn);
    renderTasks();
});

/* ---------- Toggle Completed Section ---------- */

toggleCompleted.addEventListener("click", function () {
    completedVisible = !completedVisible;
    renderTasks();
});

/* ---------- Default Load ---------- */

window.onload = function () {
    taskDateInput.value = getTodayDate();
    renderTasks();
};