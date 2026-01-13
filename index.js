class TickMeDashboard {
  constructor() {
    this.isLoading = true;
    this.userStats = {
      totalTasks: 0,
      completedTasks: 0,
      currentStreak: 0,
      completionRate: 0
    };
    
    this.initElements();
    this.init();
  }
  
  initElements() {
    // Loading screen
    this.loadingScreen = document.getElementById('loadingScreen');
    
    // Navigation
    this.navbar = document.getElementById('navbar');
    this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
    this.profileBtn = document.getElementById('profileBtn');
    
    // Hero section
    this.ctaBtn = document.getElementById('ctaBtn');
    this.learnMoreBtn = document.getElementById('learnMoreBtn');
    this.heroStats = document.getElementById('heroStats');
    this.totalTasksEl = document.getElementById('totalTasks');
    this.completedTasksEl = document.getElementById('completedTasks');
    this.currentStreakEl = document.getElementById('currentStreak');
    
    // Features
    this.featuresSection = document.getElementById('featuresSection');
    this.featureCards = document.querySelectorAll('.feature-card');
    
    // Profile modal
    this.profileModal = document.getElementById('profileModal');
    this.profileModalClose = document.getElementById('profileModalClose');
    this.profileTotalTasksEl = document.getElementById('profileTotalTasks');
    this.profileCompletedTasksEl = document.getElementById('profileCompletedTasks');
    this.profileCurrentStreakEl = document.getElementById('profileCurrentStreak');
    this.profileProductivityEl = document.getElementById('profileProductivity');
    this.clearDataBtn = document.getElementById('clearDataBtn');
    this.exportDataBtn = document.getElementById('exportDataBtn');
  }
  
  async init() {
    await this.simulateLoading();
    this.bindEvents();
    this.loadUserStats();
    this.updateUI();
    this.setupScrollEffects();
  }
  
  async simulateLoading() {
    // Brief loading time to show the screen
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    this.loadingScreen.classList.add('hidden');
    this.isLoading = false;
    
    // Remove loading screen after animation
    setTimeout(() => {
      this.loadingScreen.style.display = 'none';
    }, 500);
  }
  
  bindEvents() {
    // CTA button - smart routing
    this.ctaBtn.addEventListener('click', () => this.handleCTAClick());
    
    // Learn more button
    this.learnMoreBtn.addEventListener('click', () => this.scrollToFeatures());
    
    // Profile modal
    this.profileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.openProfileModal();
    });
    
    this.profileModalClose.addEventListener('click', () => this.closeProfileModal());
    
    // Profile actions
    this.clearDataBtn.addEventListener('click', () => this.clearAllData());
    this.exportDataBtn.addEventListener('click', () => this.exportData());
    
    // Feature cards
    this.featureCards.forEach(card => {
      card.addEventListener('click', () => {
        const feature = card.dataset.feature;
        this.navigateToFeature(feature);
      });
    });
    
    // Mobile menu
    this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
    
    // Close modal on overlay click
    this.profileModal.addEventListener('click', (e) => {
      if (e.target === this.profileModal) {
        this.closeProfileModal();
      }
    });
    
    // Scroll effects
    window.addEventListener('scroll', () => this.handleScroll());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeProfileModal();
      }
      if (e.key === 'p' && e.ctrlKey) {
        e.preventDefault();
        this.openProfileModal();
      }
    });
  }
  
  handleCTAClick() {
    // Smart routing based on existing data and time
    const hasData = this.userStats.totalTasks > 0;
    const hour = new Date().getHours();
    
    let targetPage = 'daily.html';
    
    if (hasData) {
      // If user has data, route based on their most used planner
      targetPage = this.getMostUsedPlanner();
    } else {
      // New user - route based on time of day
      if (hour < 12) {
        targetPage = 'daily.html'; // Morning - daily focus
      } else if (hour < 18) {
        targetPage = 'weekly.html'; // Afternoon - weekly overview
      } else {
        targetPage = 'monthly.html'; // Evening - monthly planning
      }
    }
    
    // Visual feedback
    this.ctaBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      window.location.href = targetPage;
    }, 150);
  }
  
  getMostUsedPlanner() {
    try {
      const dailyTasks = JSON.parse(localStorage.getItem('dailyTasks_v2') || '[]');
      const weeklyTasks = JSON.parse(localStorage.getItem('weeklyTasks_v2') || '{}');
      const monthlyTasks = JSON.parse(localStorage.getItem('monthlyTasks_v2') || '{}');
      
      const dailyCount = dailyTasks.length;
      const weeklyCount = Object.values(weeklyTasks).flat().filter(Array.isArray).flat().length;
      const monthlyCount = Object.values(monthlyTasks).flat().filter(Array.isArray).length;
      
      if (dailyCount >= weeklyCount && dailyCount >= monthlyCount) return 'daily.html';
      if (weeklyCount >= monthlyCount) return 'weekly.html';
      return 'monthly.html';
    } catch {
      return 'daily.html';
    }
  }
  
  scrollToFeatures() {
    this.featuresSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  }
  
  navigateToFeature(feature) {
    const urls = {
      daily: 'daily.html',
      weekly: 'weekly.html',
      monthly: 'monthly.html'
    };
    
    if (urls[feature]) {
      window.location.href = urls[feature];
    }
  }
  
  toggleMobileMenu() {
    // For mobile, scroll to features
    this.scrollToFeatures();
  }
  
  openProfileModal() {
    this.loadUserStats();
    this.updateProfileModal();
    this.profileModal.classList.add('visible');
  }
  
  closeProfileModal() {
    this.profileModal.classList.remove('visible');
  }
  
  loadUserStats() {
    try {
      // Load data from all planners
      const dailyTasks = JSON.parse(localStorage.getItem('dailyTasks_v2') || '[]');
      const weeklyTasks = JSON.parse(localStorage.getItem('weeklyTasks_v2') || '{}');
      const monthlyTasks = JSON.parse(localStorage.getItem('monthlyTasks_v2') || '{}');
      
      let totalTasks = 0;
      let completedTasks = 0;
      
      // Count daily tasks
      totalTasks += dailyTasks.length;
      completedTasks += dailyTasks.filter(task => task.completed).length;
      
      // Count weekly tasks
      Object.values(weeklyTasks).forEach(weekData => {
        Object.values(weekData).forEach(dayTasks => {
          if (Array.isArray(dayTasks)) {
            totalTasks += dayTasks.length;
            completedTasks += dayTasks.filter(task => task.completed).length;
          }
        });
      });
      
      // Count monthly tasks
      Object.values(monthlyTasks).forEach(dayTasks => {
        if (Array.isArray(dayTasks)) {
          totalTasks += dayTasks.length;
          completedTasks += dayTasks.filter(task => task.completed).length;
        }
      });
      
      this.userStats.totalTasks = totalTasks;
      this.userStats.completedTasks = completedTasks;
      this.userStats.completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      this.userStats.currentStreak = this.calculateStreak();
      
    } catch (error) {
      console.error('Error loading user stats:', error);
      this.userStats = { totalTasks: 0, completedTasks: 0, currentStreak: 0, completionRate: 0 };
    }
  }
  
  calculateStreak() {
    // Calculate streak based on recent activity across all planners
    try {
      const today = new Date();
      const dates = [];
      
      // Get dates from daily tasks
      const dailyTasks = JSON.parse(localStorage.getItem('dailyTasks_v2') || '[]');
      dailyTasks.forEach(task => {
        if (task.completed) {
          const date = new Date(task.completedAt || task.createdAt).toDateString();
          if (!dates.includes(date)) dates.push(date);
        }
      });
      
      // Get dates from weekly and monthly tasks (simplified)
      // For now, just check if user has any completed tasks recently
      if (this.userStats.completedTasks > 0) {
        const hasRecentActivity = dailyTasks.some(task => {
          const taskDate = new Date(task.createdAt);
          const daysDiff = Math.floor((today - taskDate) / (1000 * 60 * 60 * 24));
          return daysDiff <= 1;
        });
        
        return hasRecentActivity ? Math.min(Math.floor(this.userStats.completedTasks / 5) + 1, 30) : 0;
      }
      
      return 0;
    } catch {
      return 0;
    }
  }
  
  updateUI() {
    // Update hero stats
    this.totalTasksEl.textContent = this.userStats.totalTasks;
    this.completedTasksEl.textContent = this.userStats.completedTasks;
    this.currentStreakEl.textContent = this.userStats.currentStreak;
    
    // Show stats if user has data
    if (this.userStats.totalTasks > 0) {
      setTimeout(() => {
        this.heroStats.classList.add('visible');
      }, 800);
    }
  }
  
  updateProfileModal() {
    this.profileTotalTasksEl.textContent = this.userStats.totalTasks;
    this.profileCompletedTasksEl.textContent = this.userStats.completedTasks;
    this.profileCurrentStreakEl.textContent = this.userStats.currentStreak;
    this.profileProductivityEl.textContent = `${this.userStats.completionRate}%`;
  }
  
  clearAllData() {
    if (confirm('Are you sure you want to clear all your task data? This action cannot be undone.')) {
      localStorage.removeItem('dailyTasks_v2');
      localStorage.removeItem('weeklyTasks_v2');
      localStorage.removeItem('monthlyTasks_v2');
      
      // Reset stats
      this.userStats = { totalTasks: 0, completedTasks: 0, currentStreak: 0, completionRate: 0 };
      this.updateUI();
      this.updateProfileModal();
      
      // Hide hero stats
      this.heroStats.classList.remove('visible');
      
      alert('All your task data has been cleared successfully.');
    }
  }
  
  exportData() {
    try {
      const data = {
        dailyTasks: JSON.parse(localStorage.getItem('dailyTasks_v2') || '[]'),
        weeklyTasks: JSON.parse(localStorage.getItem('weeklyTasks_v2') || '{}'),
        monthlyTasks: JSON.parse(localStorage.getItem('monthlyTasks_v2') || '{}'),
        exportDate: new Date().toISOString(),
        stats: this.userStats,
        version: '2.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tickme-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Your TickMe data has been exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  }
  
  setupScrollEffects() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);
    
    // Observe cards
    document.querySelectorAll('.feature-card, .benefit-card').forEach(card => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(card);
    });
  }
  
  handleScroll() {
    // Add scrolled class to navbar
    if (window.scrollY > 50) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }
  }
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
  new TickMeDashboard();
});
