class DailyTaskManager {
  constructor() {
    this.tasks = [];
    this.taskInput = document.getElementById("taskInput");
    this.taskList = document.getElementById("taskList");
    this.addButton = document.getElementById("addButton");
    this.emptyState = document.getElementById("emptyState");
    this.dateDisplay = document.getElementById("dateDisplay");
    this.totalTasksEl = document.getElementById("totalTasks");
    this.completedTasksEl = document.getElementById("completedTasks");
    
    this.init();
  }
  
  init() {
    this.loadTasks();
    this.updateDate();
    this.bindEvents();
    this.updateUI();
  }
  
  bindEvents() {
    // Add task events
    this.addButton.addEventListener("click", () => this.handleAddTask());
    this.taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handleAddTask();
    });
    
    // Input validation
    this.taskInput.addEventListener("input", () => {
      const hasText = this.taskInput.value.trim().length > 0;
      this.addButton.disabled = !hasText;
    });
    
    // Set initial button state
    this.addButton.disabled = true;
  }
  
  updateDate() {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    this.dateDisplay.textContent = now.toLocaleDateString('en-US', options);
  }
  
  handleAddTask() {
    const text = this.taskInput.value.trim();
    if (!text) return;
    
    this.addTask(text);
    this.taskInput.value = "";
    this.addButton.disabled = true;
    this.taskInput.focus();
  }
  
  addTask(text, completed = false, id = null) {
    const task = {
      id: id || this.generateId(),
      text: text,
      completed: completed,
      createdAt: new Date().toISOString(),
      completedAt: completed ? new Date().toISOString() : null
    };
    
    this.tasks.unshift(task);
    this.saveTasks();
    this.renderTask(task, true);
    this.updateUI();
  }
  
  renderTask(task, isNew = false) {
    const taskEl = document.createElement("div");
    taskEl.className = `task${task.completed ? " completed" : ""}${isNew ? " new" : ""}`;
    taskEl.dataset.id = task.id;
    
    const createdDate = new Date(task.createdAt);
    const timeAgo = this.getTimeAgo(createdDate);
    
    taskEl.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}">
      <div class="task-content">
        <p class="task-text">${this.escapeHtml(task.text)}</p>
        <div class="task-meta">Created ${timeAgo}</div>
      </div>
      <div class="task-actions">
        <button class="delete-button" aria-label="Delete task" title="Delete task">×</button>
      </div>
    `;
    
    // Bind events
    const checkbox = taskEl.querySelector('input[type="checkbox"]');
    const taskText = taskEl.querySelector('.task-text');
    const deleteBtn = taskEl.querySelector('.delete-button');
    
    checkbox.addEventListener("change", () => this.toggleTask(task.id));
    taskText.addEventListener("click", () => this.toggleTask(task.id));
    deleteBtn.addEventListener("click", () => this.deleteTask(task.id));
    
    // Insert at the beginning of the list
    if (this.taskList.firstChild) {
      this.taskList.insertBefore(taskEl, this.taskList.firstChild);
    } else {
      this.taskList.appendChild(taskEl);
    }
    
    // Remove animation class after animation completes
    if (isNew) {
      setTimeout(() => taskEl.classList.remove("new"), 300);
    }
  }
  
  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return;
    
    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date().toISOString() : null;
    
    const taskEl = document.querySelector(`[data-id="${id}"]`);
    taskEl.classList.toggle("completed", task.completed);
    
    const checkbox = taskEl.querySelector('input[type="checkbox"]');
    checkbox.checked = task.completed;
    
    this.saveTasks();
    this.updateStats();
  }
  
  deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    this.tasks = this.tasks.filter(t => t.id !== id);
    const taskEl = document.querySelector(`[data-id="${id}"]`);
    
    if (taskEl) {
      taskEl.style.transform = "translateX(100%)";
      taskEl.style.opacity = "0";
      setTimeout(() => {
        taskEl.remove();
        this.updateUI();
      }, 200);
    }
    
    this.saveTasks();
    this.updateStats();
  }
  
  updateUI() {
    this.renderAllTasks();
    this.updateStats();
    this.updateEmptyState();
  }
  
  renderAllTasks() {
    this.taskList.innerHTML = "";
    this.tasks
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .forEach(task => this.renderTask(task));
  }
  
  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    
    this.totalTasksEl.textContent = total;
    this.completedTasksEl.textContent = completed;
  }
  
  updateEmptyState() {
    this.emptyState.classList.toggle("hidden", this.tasks.length > 0);
  }
  
  saveTasks() {
    try {
      localStorage.setItem("dailyTasks_v2", JSON.stringify(this.tasks));
    } catch (error) {
      console.error("Failed to save tasks:", error);
    }
  }
  
  loadTasks() {
    try {
      const saved = localStorage.getItem("dailyTasks_v2");
      if (saved) {
        this.tasks = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
      this.tasks = [];
    }
  }
  
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new DailyTaskManager();
});
