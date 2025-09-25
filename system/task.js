// APPLICATIONS/TASK.JS - System Task Manager
/**
 * FILE: applications/task.js
 * VERSION: 1.0.0
 * BUILD DATE: 2025-09-22
 *
 * PURPOSE:
 *   System task manager providing real-time view of active windows and processes.
 *   Integrates with WindowManager to display, focus, and terminate running applications.
 *   Essential system utility for process monitoring and window management.
 *
 * ARCHITECTURE:
 *   - IIFE pattern with window.TaskManagerApp namespace
 *   - Direct integration with WindowManager.activeWindows
 *   - Real-time process list with refresh capability
 *   - Actual window termination via WindowManager methods
 *
 * LIFECYCLE:
 *   1. AppRegistry launches TaskManagerApp.open() on user request
 *   2. Window created with process list interface
 *   3. Real-time polling of WindowManager.activeWindows for active processes
 *   4. User can focus windows or terminate processes
 *   5. Auto-refresh every 3 seconds to track window state changes
 *
 * EXTENSION POINTS:
 *   - METRICS: Add CPU/memory usage monitoring per process
 *   - HISTORY: Track process launch/termination history
 *   - FILTERS: Filter by process type (system/user apps)
 *   - PERFORMANCE: Add system resource monitoring graphs
 *   - PRIORITY: Process priority management and control
 *   - AUTOMATION: Auto-kill unresponsive processes
 *
 * CUDOS:
 *   edmundsparrow.netlify.app | whatsappme @ 09024054758 | webaplications5050@gmail.com
 *
 * NOTES:
 *   - Directly reads from WindowManager.activeWindows Map
 *   - Uses proper window termination instead of fake alerts
 *   - Single instance system application for resource monitoring
 *   - Auto-refresh maintains real-time process visibility
 */

(function() {
  window.TaskManagerApp = {
    refreshInterval: null,
    currentWindow: null,

    open() {
      const taskManagerHTML = `
        <div style="display:flex;flex-direction:column;height:100%;background:#1e1e1e;color:#e0e0e0;font-family:'Segoe UI',monospace;font-size:13px">
          
          <div style="padding:12px;background:linear-gradient(135deg,#2b5797,#1e3f66);border-bottom:1px solid #333;display:flex;justify-content:space-between;align-items:center">
            <h3 style="margin:0;font-size:16px;font-weight:600;color:white">Task Manager</h3>
            <div style="display:flex;gap:8px">
              <span id="process-count" style="color:#4CAF50;font-size:12px">0 processes</span>
              <button id="refresh-btn" style="padding:4px 10px;border:none;border-radius:4px;background:#4CAF50;color:white;cursor:pointer;font-size:11px;transition:background 0.2s">
                Refresh
              </button>
            </div>
          </div>
          
          <div style="padding:8px 12px;background:#2a2a2a;border-bottom:1px solid #333;font-size:11px;color:#888;font-weight:600">
            <div style="display:grid;grid-template-columns:1fr 80px 60px;gap:10px">
              <span>PROCESS NAME</span>
              <span>STATUS</span>
              <span>ACTION</span>
            </div>
          </div>
          
          <div id="task-list" style="flex:1;overflow-y:auto;padding:5px">
            <div style="text-align:center;color:#666;padding:40px 20px;font-style:italic">
              Loading processes...
            </div>
          </div>
        </div>
      `;

      const win = window.WindowManager.createWindow('Task Manager', taskManagerHTML, 420, 350);
      this.currentWindow = win;
      this.setupTaskManager(win);
      return win;
    },

    setupTaskManager(win) {
      const taskList = win.querySelector('#task-list');
      const refreshBtn = win.querySelector('#refresh-btn');
      const processCount = win.querySelector('#process-count');

      const renderTasks = () => {
        if (!window.WindowManager?.activeWindows) {
          taskList.innerHTML = `
            <div style="text-align:center;color:#666;padding:40px 20px">
              WindowManager not available
            </div>`;
          return;
        }

        const processes = Array.from(window.WindowManager.activeWindows.entries()).map(([id, data]) => ({
          id,
          title: data.title,
          isMinimized: data.isMinimized,
          isMaximized: data.isMaximized
        }));
        
        processCount.textContent = `${processes.length} process${processes.length !== 1 ? 'es' : ''}`;
        
        if (processes.length === 0) {
          taskList.innerHTML = `
            <div style="text-align:center;color:#666;padding:40px 20px;font-style:italic">
              No active processes
            </div>`;
          return;
        }

        taskList.innerHTML = processes.map(proc => {
          const status = proc.isMinimized ? 'Minimized' : proc.isMaximized ? 'Maximized' : 'Active';
          const statusColor = proc.isMinimized ? '#ff9800' : proc.isMaximized ? '#2196f3' : '#4caf50';
          
          return `
            <div style="display:grid;grid-template-columns:1fr 80px 60px;gap:10px;align-items:center;padding:8px 12px;margin:2px 0;background:#2a2a2a;border:1px solid #333;border-radius:4px;transition:background 0.2s" 
                 onmouseover="this.style.background='#363636'" 
                 onmouseout="this.style.background='#2a2a2a'">
              
              <div style="display:flex;align-items:center;gap:8px;overflow:hidden">
                <div style="width:8px;height:8px;border-radius:50%;background:${statusColor}"></div>
                <span style="color:#fff;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${this.escapeHtml(proc.title)}">
                  ${this.escapeHtml(proc.title)}
                </span>
              </div>
              
              <span style="font-size:10px;color:${statusColor};font-weight:600">${status}</span>
              
              <div style="display:flex;gap:4px">
                <button onclick="window.TaskManagerApp.focusProcess('${proc.id}')" 
                        style="padding:3px 6px;border:none;border-radius:3px;background:#2196f3;color:white;cursor:pointer;font-size:9px;transition:background 0.2s" 
                        onmouseover="this.style.background='#1976d2'" 
                        onmouseout="this.style.background='#2196f3'"
                        title="Focus Window">
                  Focus
                </button>
                <button onclick="window.TaskManagerApp.killProcess('${proc.id}')" 
                        style="padding:3px 6px;border:none;border-radius:3px;background:#f44336;color:white;cursor:pointer;font-size:9px;transition:background 0.2s" 
                        onmouseover="this.style.background='#d32f2f'" 
                        onmouseout="this.style.background='#f44336'"
                        title="End Process">
                  Kill
                </button>
              </div>
            </div>
          `;
        }).join('');
      };

      // Global methods for onclick handlers
      this.focusProcess = (processId) => {
        const windowData = window.WindowManager.activeWindows.get(processId);
        if (windowData) {
          const win = windowData.element;
          if (win.style.display === 'none') {
            win.style.display = 'block';
            windowData.isMinimized = false;
            // Remove from taskbar if present
            const taskItem = document.querySelector(`[data-window-id="${processId}"]`);
            if (taskItem) taskItem.remove();
          }
          window.WindowManager.bringToFront(win);
          this.showNotification(`Focused: ${windowData.title}`, 'info');
        }
      };

      this.killProcess = (processId) => {
        const windowData = window.WindowManager.activeWindows.get(processId);
        if (windowData) {
          const processName = windowData.title;
          if (confirm(`End process "${processName}"?`)) {
            // Remove from taskbar if present
            const taskItem = document.querySelector(`[data-window-id="${processId}"]`);
            if (taskItem) taskItem.remove();
            
            // Remove window and clean up
            windowData.element.remove();
            window.WindowManager.activeWindows.delete(processId);
            
            this.showNotification(`Terminated: ${processName}`, 'warning');
            renderTasks(); // Refresh the list
          }
        }
      };

      // Event handlers
      refreshBtn.onclick = renderTasks;
      
      // Auto-refresh every 3 seconds
      this.refreshInterval = setInterval(renderTasks, 3000);
      
      // Cleanup on window close
      win.addEventListener('beforeunload', () => {
        if (this.refreshInterval) {
          clearInterval(this.refreshInterval);
          this.refreshInterval = null;
        }
      });

      // Initial render
      renderTasks();
    },

    showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      const colors = {
        success: '#4caf50',
        warning: '#ff9800',
        info: '#2196f3'
      };
      
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 10px 16px;
        border-radius: 4px;
        font-family: 'Segoe UI', monospace;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
      `;
      
      notification.textContent = message;
      document.body.appendChild(notification);
      
      requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
      });
      
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => {
          if (notification.parentNode) {
            document.body.removeChild(notification);
          }
        }, 300);
      }, 2000);
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text || '';
      return div.innerHTML;
    }
  };

  // Register app
  if (typeof AppRegistry !== 'undefined') {
    AppRegistry.registerApp({
      id: 'taskmanager',
      name: 'Task Manager',
      icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='48' height='48' rx='6' fill='%231e1e1e'/><rect x='8' y='8' width='32' height='4' fill='%234caf50'/><rect x='8' y='16' width='24' height='4' fill='%232196f3'/><rect x='8' y='24' width='28' height='4' fill='%23ff9800'/><rect x='8' y='32' width='20' height='4' fill='%23f44336'/></svg>",
      handler: () => window.TaskManagerApp.open(),
      singleInstance: true
    });
  }

  // Register documentation
  if (window.Docs && typeof window.Docs.registerDocumentation === 'function') {
    window.Docs.registerDocumentation('taskmanager', {
      name: "Task Manager",
      version: "1.0.0",
      description: "System task manager for monitoring and controlling active windows and processes with real-time updates",
      type: "System App",
      features: [
        "Real-time display of active windows from WindowManager",
        "Process status monitoring (Active, Minimized, Maximized)",
        "Focus windows directly from task list",
        "Terminate processes with confirmation dialog",
        "Auto-refresh every 3 seconds for live updates",
        "Process count display and manual refresh controls"
      ],
      dependencies: ["WindowManager", "AppRegistry"],
      methods: [
        { name: "open", description: "Creates task manager window with process monitoring interface" },
        { name: "focusProcess", description: "Brings specified window to front and restores if minimized" },
        { name: "killProcess", description: "Terminates process after user confirmation with proper cleanup" }
      ],
      notes: "Single instance system application. Directly integrates with WindowManager.activeWindows for accurate process tracking. Includes auto-refresh and proper cleanup on window close.",
      cudos: "edmundsparrow.netlify.app | whatsappme @ 09024054758 | webaplications5050@gmail.com",
      auto_generated: false
    });
  }
})();
