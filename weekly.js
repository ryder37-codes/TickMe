class WeeklyPlanner {
  constructor() {
    this.currentWeek = this.getWeekStart(new Date());
    this.tasks = {};
    this.days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    this.dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    this.initElements();
    this.init();
  }
  
  initElements() {
    this.daysGrid = document.getElementById('daysGrid');
    this.weekDisplay = document.getElementById('weekDisplay');
    this.prevWeekBtn = document.getElementById('prevWeek');
    this.nextWeekBtn = document.getElementById('nextWeek');
    this.totalTasksEl = document.getElementById('totalWeekTasks');
    this.completedTasksEl = document.getElementById('completedWeekTasks');
    
    // Modal elements
    this.modalOverlay = document.getElementById('modalOverlay');
    this.modalClose = document.getElementById('modalClose');
    this.modalCancel = document.getElementById('modalCancel');
    this.modalAdd = document.getElementById('modalAdd');
    this.quickTaskInput = document.getElementById('quickTaskInput');
    this.daySelector = document.getElementById('daySelector');
    this.quickAddFab = document.getElementById('quickAddFab');
  }
  
  init() {
    this.loadTasks();
    this.bindEvents();
    this.renderWeek();
    this.updateWeekDisplay();
    this.updateWeekStats();
  }
  
  bindEvents() {
    // Week navigation
    this.prevWeekBtn.addEventListener('click', () => this.navigateWeek(-1));
    this.nextWeekBtn.addEventListener('click', () => this.navigateWeek(1));
    
    // Modal events
    this.quickAddFab.addEventListener('click', () => this.openModal());
    this.modalClose.addEventListener('click', () => this.closeModal());
    this.modalCancel.addEventListener('click', () => this.closeModal());
    this.modalAdd.addEventListener('click', () => this.addQuickTask());
    
    // Modal input events
    this.quickTaskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addQuickTask();
    });
    
    this.quickTaskInput.addEventListener('input', () => {
      const hasText = this.quickTaskInput.value.trim().length > 0;
      this.modalAdd.disabled = !hasText;
    });
    
    // Close modal on overlay click
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) this.closeModal();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
      if (e.key === 'q' && e.ctrlKey) {
        e.preventDefault();
        this.openModal();
      }
    });
  }
  
  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    return new Date(d.setDate(diff));
  }
  
  getWeekKey(date) {
    const weekStart = this.getWeekStart(date);
    return `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}-${weekStart.getMonth()}`;
  }
  
  getCurrentWeekKey() {
    return this.getWeekKey(this.currentWeek);
  }
  
  navigateWeek(direction) {
    const newDate = new Date(this.currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    this.currentWeek = newDate;
    this.updateWeekDisplay();
    this.renderWeek();
    this.updateWeekStats();
  }
  
  updateWeekDisplay() {
    const weekStart = new Date(this.currentWeek);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const formatOptions = { month: 'short', day: 'numeric' };
    const startStr = weekStart.toLocaleDateString('en-US', formatOptions);
    const endStr = weekEnd.toLocaleDateString('en-US', formatOptions);
    const year = weekStart.getFullYear();
    
    this.weekDisplay.textContent = `${startStr} - ${endStr}, ${year}`;
  }
  
  renderWeek() {
    this.daysGrid.innerHTML = '';
    
    this.days.forEach((day, index) => {
      const dayCard = this.createDayCard(day, index);
      this.daysGrid.appendChild(dayCard);
    });
  }
  
  createDayCard(day, index) {
    const dayDate = new Date(this.currentWeek);
    dayDate.setDate(dayDate.getDate() + index);
    
    const dayCard = document.createElement('div');
    dayCard.className = 'day-card';
    dayCard.dataset.day = day;
    
    const today = new Date();
    const isToday = dayDate.toDateString() === today.toDateString();
    
    dayCard.innerHTML = `
      <div class="day-header">
        <h3 class="day-title">${this.dayNames[index]} ${isToday ? '(Today)' : ''}</h3>
        <p class="day-date">${dayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
      </div>
      <div class="day-body">
        <div class="task-input-section">
          <div class="task-input">
            <input type="text" placeholder="Add a task..." maxlength="100">
            <button class="add-task-btn" disabled aria-label="Add task">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="tasks-list" data-day="${day}">
          ${this.renderDayTasks(day)}
        </div>
      </div>
    `;
    
    this.bindDayCardEvents(dayCard, day);
    return dayCard;
  }
  
  renderDayTasks(day) {
    const weekKey = this.getCurrentWeekKey();
    const dayTasks = this.tasks[weekKey]?.[day] || [];
    
    if (dayTasks.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <h4>No tasks yet</h4>
          <p>Add your first task for ${this.dayNames[this.days.indexOf(day)]}</p>
        </div>
      `;
    }
    
    return dayTasks
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(task => this.createTaskElement(task))
      .join('');
  }
  
  createTaskElement(task) {
    const createdTime = new Date(task.createdAt).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    return `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <input type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}">
        <div class="task-content">
          <p class="task-text">${this.escapeHtml(task.text)}</p>
          <div class="task-time">Added at ${createdTime}</div>
        </div>
        <div class="task-actions">
          <button class="delete-task-btn" aria-label="Delete task" title="Delete task">×</button>
        </div>
      </div>
    `;
  }
  
  bindDayCardEvents(dayCard, day) {
    const input = dayCard.querySelector('.task-input input');
    const addBtn = dayCard.querySelector('.add-task-btn');
    const tasksList = dayCard.querySelector('.tasks-list');
    
    // Input events
    input.addEventListener('input', () => {
      const hasText = input.value.trim().length > 0;
      addBtn.disabled = !hasText;
    });
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        this.addTask(day, input.value.trim());
        input.value = '';
        addBtn.disabled = true;
      }
    });
    
    addBtn.addEventListener('click', () => {
      if (input.value.trim()) {
        this.addTask(day, input.value.trim());
        input.value = '';
        addBtn.disabled = true;
        input.focus();
      }
    });
    
    // Task list events (using event delegation)
    tasksList.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const taskId = e.target.closest('.task-item').dataset.id;
        this.toggleTask(day, taskId);
      }
    });
    
    tasksList.addEventListener('click', (e) => {
      if (e.target.classList.contains('task-text')) {
        const checkbox = e.target.closest('.task-item').querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;
        const taskId = e.target.closest('.task-item').dataset.id;
        this.toggleTask(day, taskId);
      }
      
      if (e.target.classList.contains('delete-task-btn')) {
        const taskId = e.target.closest('.task-item').dataset.id;
        this.deleteTask(day, taskId);
      }
    });
  }
  
  addTask(day, text) {
    const weekKey = this.getCurrentWeekKey();
    
    if (!this.tasks[weekKey]) this.tasks[weekKey] = {};
    if (!this.tasks[weekKey][day]) this.tasks[weekKey][day] = [];
    
    const task = {
      id: this.generateId(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    this.tasks[weekKey][day].push(task);
    this.saveTasks();
    this.renderDayTasks(day);
    this.updateTasksList(day);
    this.updateWeekStats();
  }
  
  toggleTask(day, taskId) {
    const weekKey = this.getCurrentWeekKey();
    const task = this.tasks[weekKey]?.[day]?.find(t => t.id === taskId);
    
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      this.saveTasks();
      this.updateTaskItemState(day, taskId, task.completed);
      this.updateWeekStats();
    }
  }
  
  deleteTask(day, taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    const weekKey = this.getCurrentWeekKey();
    if (this.tasks[weekKey]?.[day]) {
      this.tasks[weekKey][day] = this.tasks[weekKey][day].filter(t => t.id !== taskId);
      this.saveTasks();
      this.removeTaskElement(day, taskId);
      this.updateWeekStats();
      
      // Update empty state if needed
      if (this.tasks[weekKey][day].length === 0) {
        this.updateTasksList(day);
      }
    }
  }
  
  updateTaskItemState(day, taskId, completed) {
    const taskElement = document.querySelector(`[data-day="${day}"] .task-item[data-id="${taskId}"]`);
    if (taskElement) {
      taskElement.classList.toggle('completed', completed);
      const checkbox = taskElement.querySelector('input[type="checkbox"]');
      checkbox.checked = completed;
    }
  }
  
  removeTaskElement(day, taskId) {
    const taskElement = document.querySelector(`[data-day="${day}"] .task-item[data-id="${taskId}"]`);
    if (taskElement) {
      taskElement.style.transform = 'translateX(100%)';
      taskElement.style.opacity = '0';
      setTimeout(() => taskElement.remove(), 200);
    }
  }
  
  updateTasksList(day) {
    const tasksList = document.querySelector(`[data-day="${day}"] .tasks-list`);
    if (tasksList) {
      tasksList.innerHTML = this.renderDayTasks(day);
    }
  }
  
  updateWeekStats() {
    const weekKey = this.getCurrentWeekKey();
    const weekTasks = this.tasks[weekKey] || {};
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    Object.values(weekTasks).forEach(dayTasks => {
      totalTasks += dayTasks.length;
      completedTasks += dayTasks.filter(t => t.completed).length;
    });
    
    this.totalTasksEl.textContent = totalTasks;
    this.completedTasksEl.textContent = completedTasks;
  }
  
  // Modal methods
  openModal() {
    this.modalOverlay.classList.add('visible');
    this.quickTaskInput.focus();
    this.modalAdd.disabled = true;
    
    // Set default day to today or next available day
    const today = new Date();
    const todayIndex = (today.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    this.daySelector.value = this.days[todayIndex];
  }
  
  closeModal() {
    this.modalOverlay.classList.remove('visible');
    this.quickTaskInput.value = '';
    this.modalAdd.disabled = true;
  }
  
  addQuickTask() {
    const text = this.quickTaskInput.value.trim();
    const selectedDay = this.daySelector.value;
    
    if (text) {
      this.addTask(selectedDay, text);
      this.closeModal();
    }
  }
  
  // Utility methods
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  saveTasks() {
    try {
      localStorage.setItem('weeklyTasks_v2', JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  }
  
  loadTasks() {
    try {
      const saved = localStorage.getItem('weeklyTasks_v2');
      if (saved) {
        this.tasks = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      this.tasks = {};
    }
  }
}

// Initialize the weekly planner when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new WeeklyPlanner();
});
