// system/js/taskbar.js - Updated with clickable time to launch Clock app
// =============================

window.Taskbar = {
    init() {
        const systemTray = document.querySelector('.system-tray');
        this.updateClock(systemTray);
        setInterval(() => this.updateClock(systemTray), 1000);

        // Wire Start button to system app
        document.querySelector('.start-button').onclick = () => {
            AppRegistry.openApp('startmenu');
        };
        
        // Setup show desktop button
        this.setupShowDesktop();
        
        // Setup clickable time
        this.setupClickableTime(systemTray);
    },

    updateClock(tray) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Update or create time element
        let timeElement = tray.querySelector('#taskbar-time');
        if (!timeElement) {
            timeElement = document.createElement('div');
            timeElement.id = 'taskbar-time';
            timeElement.style.cssText = `
                cursor: pointer;
                padding: 4px 8px;
                border-radius: 4px;
                transition: background-color 0.2s;
                user-select: none;
                font-size: 12px;
                color: white;
            `;
            
            // Add hover effect
            timeElement.addEventListener('mouseover', () => {
                timeElement.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });
            
            timeElement.addEventListener('mouseout', () => {
                timeElement.style.backgroundColor = 'transparent';
            });
            
            tray.appendChild(timeElement);
        }
        
        timeElement.textContent = timeStr;
    },

    setupClickableTime(systemTray) {
        // Add click handler to launch clock app
        systemTray.addEventListener('click', (e) => {
            if (e.target.id === 'taskbar-time' || e.target.closest('#taskbar-time')) {
                if (window.AppRegistry) {
                    window.AppRegistry.openApp('clock');
                }
            }
        });
    },

    setupShowDesktop() {
        const showDesktopBtn = document.querySelector('.show-desktop-button');
        if (showDesktopBtn) {
            showDesktopBtn.addEventListener('click', () => {
                // Use WindowManager's minimize all function
                if (window.WindowManager && typeof window.WindowManager.minimizeAllWindows === 'function') {
                    window.WindowManager.minimizeAllWindows();
                } else {
                    // Fallback: minimize all visible windows manually
                    document.querySelectorAll('.window').forEach(win => {
                        if (win.style.display !== 'none') {
                            const windowId = win.id;
                            const title = win.querySelector('.window-title-bar span')?.textContent || 'Window';
                            
                            // Hide window
                            win.style.display = 'none';
                            
                            // Create taskbar item
                            this.addTaskbarItem(windowId, title, win);
                        }
                    });
                }
            });
        }
    },

    // Helper function for show desktop functionality
    addTaskbarItem(windowId, title, windowElement) {
        const taskbarItems = document.querySelector('.taskbar-items');
        if (!taskbarItems) return;

        // Remove existing item
        const existing = taskbarItems.querySelector(`[data-window-id="${windowId}"]`);
        if (existing) existing.remove();
        
        // Create taskbar item with consistent styling
        const taskItem = document.createElement('div');
        taskItem.className = 'taskbar-item';
        taskItem.dataset.windowId = windowId;
        taskItem.textContent = title;
        taskItem.style.cssText = `
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 4px 8px;
            margin: 2px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
            display: inline-block;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: background-color 0.2s;
        `;
        
        // Hover effects
        taskItem.onmouseover = () => {
            taskItem.style.background = 'rgba(255,255,255,0.3)';
        };
        
        taskItem.onmouseout = () => {
            taskItem.style.background = 'rgba(255,255,255,0.2)';
        };
        
        // Click to restore
        taskItem.onclick = () => {
            windowElement.style.display = 'block';
            
            // Bring to front
            if (window.WindowManager && typeof window.WindowManager.bringToFront === 'function') {
                window.WindowManager.bringToFront(windowElement);
            } else {
                let maxZ = 0;
                document.querySelectorAll('.window').forEach(w => {
                    const z = parseInt(w.style.zIndex) || 0;
                    if (z > maxZ) maxZ = z;
                });
                windowElement.style.zIndex = maxZ + 1;
            }
            
            taskItem.remove();
        };
        
        taskbarItems.appendChild(taskItem);
    }
};

// Auto-init when DOM ready
document.addEventListener("DOMContentLoaded", () => Taskbar.init());
