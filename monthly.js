class MonthlyPlanner {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.editingTaskId = null;
    this.tasks = {};
    this.monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    this.initElements();
    this.init();
  }
  
  initElements() {
    // Navigation elements
    this.monthDisplay = document.getElementById('monthDisplay');
    this.prevMonthBtn = document.getElementById('prevMonth');
    this.nextMonthBtn = document.getElementById('nextMonth');
    this.calendarGrid = document.getElementById('calendarGrid');
    
    // Stats elements
    this.totalTasksEl = document.getElementById('totalMonthTasks');
    this.completedTasksEl = document.getElementById('completedMonthTasks');
    this.monthProgressEl = document.getElementById('monthProgress');
    this.activeDaysEl = document.getElementById('activeDays');
    
    // Sidebar elements
    this.sidebar = document.getElementById('sidebar');
    this.sidebarClose = document.getElementById('sidebarClose');
    this.selectedDateTitle = document.getElementById('selectedDateTitle');
    this.taskInput = document.getElementById('taskInput');
    this.priorityInput = document.getElementById('priorityInput');
    this.addTaskBtn = document.getElementById('addTaskBtn');
    this.tasksList = document.getElementById('tasksList');
    this.dayTaskCount = document.getElementById('dayTaskCount');
    
    // Edit Modal elements
    this.editModalOverlay = document.getElementById('editModalOverlay');
    this.editModalClose = document.getElementById('editModalClose');
    this.editModalCancel = document.getElementById('editModalCancel');
    this.editModalSave = document.getElementById('editModalSave');
    this.editTaskInput = document.getElementById('editTaskInput');
    this.editPrioritySelector = document.getElementById('editPrioritySelector');
    
    // Quick Add Modal elements
    this.modalOverlay = document.getElementById('modalOverlay');
    this.modalClose = document.getElementById('modalClose');
    this.modalCancel = document.getElementById('modalCancel');
    this.modalAdd = document.getElementById('modalAdd');
    this.quickTaskInput = document.getElementById('quickTaskInput');
    this.dateSelector = document.getElementById('dateSelector');
    this.prioritySelector = document.getElementById('prioritySelector');
    this.quickAddFab = document.getElementById('quickAddFab');
    
    // Mobile navigation
    this.bottomNav = document.getElementById('bottomNav');
    this.todayBtn = document.getElementById('todayBtn');
    this.monthViewBtn = document.getElementById('monthViewBtn');
    this.addTaskMobileBtn = document.getElementById('addTaskMobileBtn');
  }
  
  init() {
    this.loadTasks();
    this.bindEvents();
    this.renderCalendar();
    this.updateMonthDisplay();
    this.updateMonthStats();
    this.setTodayAsDefault();
  }
  
  bindEvents() {
    // Month navigation
    this.prevMonthBtn.addEventListener('click', () => this.navigateMonth(-1));
    this.nextMonthBtn.addEventListener('click', () => this.navigateMonth(1));
    
    // Sidebar events
    this.sidebarClose.addEventListener('click', () => this.closeSidebar());
    this.taskInput.addEventListener('input', () => {
      const hasText = this.taskInput.value.trim().length > 0;
      this.addTaskBtn.disabled = !hasText;
    });
    this.taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && this.taskInput.value.trim()) {
        this.addTaskForSelectedDate();
      }
    });
    this.addTaskBtn.addEventListener('click', () => this.addTaskForSelectedDate());
    
    // Edit modal events
    this.editModalClose.addEventListener('click', () => this.closeEditModal());
    this.editModalCancel.addEventListener('click', () => this.closeEditModal());
    this.editModalSave.addEventListener('click', () => this.saveEditedTask());
    this.editTaskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.saveEditedTask();
    });
    
    // Quick Add modal events
    this.quickAddFab.addEventListener('click', () => this.openModal());
    this.addTaskMobileBtn.addEventListener('click', () => this.openModal());
    this.modalClose.addEventListener('click', () => this.closeModal());
    this.modalCancel.addEventListener('click', () => this.closeModal());
    this.modalAdd.addEventListener('click', () => this.addQuickTask());
    
    this.quickTaskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addQuickTask();
    });
    
    this.quickTaskInput.addEventListener('input', () => {
      const hasText = this.quickTaskInput.value.trim().length > 0;
      this.modalAdd.disabled = !hasText;
    });
    
    // Mobile navigation
    this.todayBtn.addEventListener('click', () => this.goToToday());
    this.monthViewBtn.addEventListener('click', () => this.closeSidebar());
    
    // Close modals on overlay click
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) this.closeModal();
    });
    
    this.editModalOverlay.addEventListener('click', (e) => {
      if (e.target === this.editModalOverlay) this.closeEditModal();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.closeEditModal();
        this.closeSidebar();
      }
      if (e.key === 'q' && e.ctrlKey) {
        e.preventDefault();
        this.openModal();
      }
      if (e.key === 't' && e.ctrlKey) {
        e.preventDefault();
        this.goToToday();
      }
    });
  }
  
  navigateMonth(direction) {
    const newDate = new Date(this.currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    this.currentDate = newDate;
    this.renderCalendar();
    this.updateMonthDisplay();
    this.updateMonthStats();
    this.selectedDate = null;
    this.closeSidebar();
  }
  
  updateMonthDisplay() {
    const monthName = this.monthNames[this.currentDate.getMonth()];
    const year = this.currentDate.getFullYear();
    this.monthDisplay.textContent = `${monthName} ${year}`;
  }
  
  renderCalendar() {
    this.calendarGrid.innerHTML = '';
    
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // Get first day of month and adjust for Monday start
    const firstDay = new Date(year, month, 1);
    const startDay = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    
    // Get last day of month
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    // Get previous month days to fill the grid
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    // Render previous month trailing days
    for (let i = startDay - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const date = new Date(year, month - 1, dayNum);
      this.createCalendarDay(date, true);
    }
    
    // Render current month days
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month, day);
      this.createCalendarDay(date, false);
    }
    
    // Render next month leading days to complete the grid
    const totalCells = this.calendarGrid.children.length;
    const remainingCells = 42 - totalCells; // 6 weeks * 7 days
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(year, month + 1, day);
      this.createCalendarDay(date, true);
    }
    
    // Restore selection if needed
    if (this.selectedDate) {
      this.updateSelectedDateInCalendar();
    }
  }
  
  createCalendarDay(date, isOtherMonth) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    if (isOtherMonth) {
      dayEl.classList.add('other-month');
    }
    
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      dayEl.classList.add('today');
    }
    
    const dateKey = this.getDateKey(date);
    const dayTasks = this.tasks[dateKey] || [];
    
    if (dayTasks.length > 0) {
      dayEl.classList.add('has-tasks');
    }
    
    dayEl.innerHTML = `
      <div class="day-number">${date.getDate()}</div>
      <div class="day-tasks-preview">
        ${this.renderTaskDots(dayTasks)}
      </div>
      ${dayTasks.length > 3 ? `<div class="task-count-badge">${dayTasks.length}</div>` : ''}
    `;
    
    dayEl.addEventListener('click', () => this.selectDate(date));
    
    this.calendarGrid.appendChild(dayEl);
    return dayEl;
  }
  
  renderTaskDots(tasks) {
    return tasks.slice(0, 3).map(task => {
      const completedClass = task.completed ? 'completed' : '';
      return `<div class="task-dot priority-${task.priority} ${completedClass}"></div>`;
    }).join('');
  }
  
  selectDate(date) {
    this.selectedDate = date;
    this.updateSelectedDateInCalendar();
    this.openSidebar();
    this.renderSelectedDateTasks();
    this.updateSelectedDateTitle();
  }
  
  updateSelectedDateInCalendar() {
    // Remove previous selection
    const prevSelected = this.calendarGrid.querySelector('.selected');
    if (prevSelected) {
      prevSelected.classList.remove('selected');
    }
    
    // Add selection to current date if it's in current month view
    if (this.selectedDate && 
        this.selectedDate.getMonth() === this.currentDate.getMonth() &&
        this.selectedDate.getFullYear() === this.currentDate.getFullYear()) {
      
      const dayElements = this.calendarGrid.querySelectorAll('.calendar-day:not(.other-month)');
      dayElements.forEach(dayEl => {
        const dayNumber = parseInt(dayEl.querySelector('.day-number').textContent);
        if (dayNumber === this.selectedDate.getDate()) {
          dayEl.classList.add('selected');
        }
      });
    }
  }
  
  openSidebar() {
    this.sidebar.classList.remove('mobile-hidden');
    if (window.innerWidth <= 768) {
      this.sidebar.scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  closeSidebar() {
    if (window.innerWidth <= 768) {
      this.sidebar.classList.add('mobile-hidden');
    }
    // Remove selection
    const selected = this.calendarGrid.querySelector('.selected');
    if (selected) {
      selected.classList.remove('selected');
    }
    this.selectedDate = null;
    this.selectedDateTitle.textContent = 'Select a date';
    this.tasksList.innerHTML = this.getEmptyState();
    this.dayTaskCount.textContent = '0 tasks';
  }
  
  updateSelectedDateTitle() {
    if (this.selectedDate) {
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      this.selectedDateTitle.textContent = this.selectedDate.toLocaleDateString('en-US', options);
    } else {
      this.selectedDateTitle.textContent = 'Select a date';
    }
  }
  
  renderSelectedDateTasks() {
    if (!this.selectedDate) {
      this.tasksList.innerHTML = this.getEmptyState();
      this.dayTaskCount.textContent = '0 tasks';
      return;
    }
    
    const dateKey = this.getDateKey(this.selectedDate);
    const dayTasks = this.tasks[dateKey] || [];
    
    this.dayTaskCount.textContent = `${dayTasks.length} task${dayTasks.length !== 1 ? 's' : ''}`;
    
    if (dayTasks.length === 0) {
      this.tasksList.innerHTML = this.getEmptyState();
      return;
    }
    
    this.tasksList.innerHTML = dayTasks
      .sort((a, b) => {
        // Sort by completion status, then priority, then creation time
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      })
      .map(task => this.createTaskElement(task))
      .join('');
    
    this.bindTaskEvents();
  }
  
  createTaskElement(task) {
    const createdTime = new Date(task.createdAt).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    return `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
               aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}">
        <div class="task-content">
          <p class="task-text">${this.escapeHtml(task.text)}</p>
          <div class="task-meta">
            <div class="priority-indicator ${task.priority}"></div>
            <span>${task.priority} priority</span>
            <span>•</span>
            <span>${createdTime}</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="edit-task-btn" aria-label="Edit task" title="Edit task">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="delete-task-btn" aria-label="Delete task" title="Delete task">×</button>
        </div>
      </div>
    `;
  }
  
  bindTaskEvents() {
    const taskItems = this.tasksList.querySelectorAll('.task-item');
    
    taskItems.forEach(taskItem => {
      const taskId = taskItem.dataset.id;
      const checkbox = taskItem.querySelector('.task-checkbox');
      const taskText = taskItem.querySelector('.task-text');
      const editBtn = taskItem.querySelector('.edit-task-btn');
      const deleteBtn = taskItem.querySelector('.delete-task-btn');
      
      checkbox.addEventListener('change', () => this.toggleTask(taskId));
      taskText.addEventListener('click', () => {
        checkbox.checked = !checkbox.checked;
        this.toggleTask(taskId);
      });
      editBtn.addEventListener('click', () => this.openEditModal(taskId));
      deleteBtn.addEventListener('click', () => this.deleteTask(taskId));
    });
  }
  
  addTaskForSelectedDate() {
    if (!this.selectedDate || !this.taskInput.value.trim()) return;
    
    const dateKey = this.getDateKey(this.selectedDate);
    const priority = this.priorityInput.value || 'medium';
    this.addTask(dateKey, this.taskInput.value.trim(), priority);
    this.taskInput.value = '';
    this.priorityInput.value = 'medium';
    this.addTaskBtn.disabled = true;
    this.taskInput.focus();
  }
  
  addTask(dateKey, text, priority = 'medium') {
    if (!this.tasks[dateKey]) this.tasks[dateKey] = [];
    
    const task = {
      id: this.generateId(),
      text: text,
      priority: priority,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    
    this.tasks[dateKey].push(task);
    this.saveTasks();
    this.renderSelectedDateTasks();
    this.renderCalendar();
    this.updateMonthStats();
  }
  
  toggleTask(taskId) {
    if (!this.selectedDate) return;
    
    const dateKey = this.getDateKey(this.selectedDate);
    const task = this.tasks[dateKey]?.find(t => t.id === taskId);
    
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      this.saveTasks();
      this.updateTaskItemState(taskId, task.completed);
      this.renderCalendar();
      this.updateMonthStats();
    }
  }
  
  updateTaskItemState(taskId, completed) {
    const taskElement = this.tasksList.querySelector(`[data-id="${taskId}"]`);
    if (taskElement) {
      taskElement.classList.toggle('completed', completed);
      const checkbox = taskElement.querySelector('.task-checkbox');
      checkbox.checked = completed;
    }
  }
  
  openEditModal(taskId) {
    if (!this.selectedDate) return;
    
    const dateKey = this.getDateKey(this.selectedDate);
    const task = this.tasks[dateKey]?.find(t => t.id === taskId);
    
    if (task) {
      this.editingTaskId = taskId;
      this.editTaskInput.value = task.text;
      this.editPrioritySelector.value = task.priority;
      this.editModalOverlay.classList.add('visible');
      this.editTaskInput.focus();
    }
  }
  
  closeEditModal() {
    this.editModalOverlay.classList.remove('visible');
    this.editingTaskId = null;
    this.editTaskInput.value = '';
    this.editPrioritySelector.value = 'medium';
  }
  
  saveEditedTask() {
    if (!this.editingTaskId || !this.selectedDate || !this.editTaskInput.value.trim()) return;
    
    const dateKey = this.getDateKey(this.selectedDate);
    const task = this.tasks[dateKey]?.find(t => t.id === this.editingTaskId);
    
    if (task) {
      task.text = this.editTaskInput.value.trim();
      task.priority = this.editPrioritySelector.value;
      task.updatedAt = new Date().toISOString();
      
      this.saveTasks();
      this.renderSelectedDateTasks();
      this.renderCalendar();
      this.closeEditModal();
    }
  }
  
  deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    if (!this.selectedDate) return;
    
    const dateKey = this.getDateKey(this.selectedDate);
    if (this.tasks[dateKey]) {
      this.tasks[dateKey] = this.tasks[dateKey].filter(t => t.id !== taskId);
      if (this.tasks[dateKey].length === 0) {
        delete this.tasks[dateKey];
      }
      this.saveTasks();
      this.renderSelectedDateTasks();
      this.renderCalendar();
      this.updateMonthStats();
    }
  }
  
  updateMonthStats() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    let totalTasks = 0;
    let completedTasks = 0;
    const activeDays = new Set();
    
    Object.keys(this.tasks).forEach(dateKey => {
      const [taskYear, taskMonth] = dateKey.split('-').map(Number);
      if (taskYear === year && taskMonth === month) {
        const dayTasks = this.tasks[dateKey];
        totalTasks += dayTasks.length;
        completedTasks += dayTasks.filter(t => t.completed).length;
        if (dayTasks.length > 0) {
          activeDays.add(dateKey);
        }
      }
    });
    
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    this.totalTasksEl.textContent = totalTasks;
    this.completedTasksEl.textContent = completedTasks;
    this.monthProgressEl.textContent = `${progress}%`;
    this.activeDaysEl.textContent = activeDays.size;
  }
  
  getEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <h4>No tasks for this day</h4>
        <p>Add your first task to get started</p>
      </div>
    `;
  }
  
  // Quick Add Modal methods
  openModal() {
    this.modalOverlay.classList.add('visible');
    this.quickTaskInput.focus();
    this.modalAdd.disabled = true;
    
    // Set default date to today or selected date
    const defaultDate = this.selectedDate || new Date();
    this.dateSelector.value = defaultDate.toISOString().split('T')[0];
  }
  
  closeModal() {
    this.modalOverlay.classList.remove('visible');
    this.quickTaskInput.value = '';
    this.modalAdd.disabled = true;
    this.prioritySelector.value = 'medium';
  }
  
  addQuickTask() {
    const text = this.quickTaskInput.value.trim();
    const selectedDate = new Date(this.dateSelector.value);
    const priority = this.prioritySelector.value;
    
    if (text && selectedDate) {
      const dateKey = this.getDateKey(selectedDate);
      this.addTask(dateKey, text, priority);
      this.closeModal();
      
      // If the task was added to currently selected date, refresh sidebar
      if (this.selectedDate && this.getDateKey(this.selectedDate) === dateKey) {
        this.renderSelectedDateTasks();
      }
    }
  }
  
  goToToday() {
    const today = new Date();
    this.currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.renderCalendar();
    this.updateMonthDisplay();
    this.updateMonthStats();
    this.selectDate(today);
  }
  
  setTodayAsDefault() {
    // Auto-select today's date on load if it's in current month
    const today = new Date();
    if (today.getMonth() === this.currentDate.getMonth() && 
        today.getFullYear() === this.currentDate.getFullYear()) {
      this.selectDate(today);
    }
  }
  
  // Utility methods
  getDateKey(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }
  
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
      localStorage.setItem('monthlyTasks_v2', JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  }
  
  loadTasks() {
    try {
      const saved = localStorage.getItem('monthlyTasks_v2');
      if (saved) {
        this.tasks = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      this.tasks = {};
    }
  }
}

// Initialize the monthly planner when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MonthlyPlanner();
});
