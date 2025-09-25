// FILE: /SYSTEM/CORE/window-manager.js
// VERSION: 1.0.0
//
// WINDOW-MANAGER.JS - WINDOW LIFECYCLE MANAGEMENT SERVICE
//
// PURPOSE:
//   Core service managing window creation, controls, positioning, and cleanup
//   with proper viewport constraints and taskbar integration.
//
// ARCHITECTURE:
//   - Singleton service with window.WindowManager namespace
//   - Map-based window tracking with unique ID generation
//   - Direct event handling for window controls and drag operations
//   - Automatic cascade positioning with viewport constraints
//
// LIFECYCLE:
//   1. createWindow() generates unique window with standard controls
//   2. setupWindowControls() handles minimize/maximize/close actions
//   3. makeWindowDraggable() enables drag positioning with bounds
//   4. Window tracking in activeWindows Map with state metadata
//   5. Cleanup removes DOM elements and tracking on window close
//
// KEY FEATURES:
//   • Standard window creation with title bar and control buttons
//   • Minimize/maximize/close with proper state management
//   • Drag-and-drop positioning with viewport boundary constraints
//   • Taskbar integration for minimized window restoration
//   • Touch device support for mobile drag operations
//
// INTEGRATION:
//   - Apps: Use createWindow() for UI containers
//   - Taskbar: Minimized windows appear as clickable taskbar items
//   - Viewport: Automatic constraint handling for all screen sizes
//
// DEPENDENCIES:
//   - Modern browser with touch event support
//
// CUDOS:
//   edmundsparrow.netlify.app | whatsappme @ 09024054758 | 
//   webaplications5050@gmail.com
//
// ---------------------------------------------------------------------


// JS/CORE/WINDOW-MANAGER.JS - Updated with full window controls
window.WindowManager = {
    activeWindows: new Map(),
    nextWindowId: 0,
    
    createWindow(title, content, width = 600, height = 400) {
        const windowId = `win-${this.nextWindowId++}`;
        const win = document.createElement('div');
        win.classList.add('window');
        win.id = windowId;
        
        // Window HTML template now includes all three control buttons
        win.innerHTML = `
            <div class="window-title-bar">
                <span>${title}</span>
                <div class="window-controls">
                    <button class="minimize-btn">_</button>
                    <button class="maximize-btn">□</button>
                    <button class="close-btn">×</button>
                </div>
            </div>
            <div class="window-content">${content}</div>
        `;
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Ensure window fits within viewport with margins
        const maxWidth = Math.max(200, viewportWidth - 40);
        const maxHeight = Math.max(150, viewportHeight - 80);
        
        const finalWidth = Math.min(width, maxWidth);
        const finalHeight = Math.min(height, maxHeight);
        
        // Set constrained window size and original dimensions for maximization
        win.style.width = `${finalWidth}px`;
        win.style.height = `${finalHeight}px`;
        win.dataset.originalWidth = finalWidth;
        win.dataset.originalHeight = finalHeight;
        win.dataset.originalLeft = '';
        win.dataset.originalTop = '';
        
        // Calculate safe positioning - ensure title bar controls are always accessible
        const safeMargin = 20;
        const taskbarHeight = 40;
        
        const maxLeft = Math.max(safeMargin, viewportWidth - finalWidth - safeMargin);
        const maxTop = Math.max(safeMargin, viewportHeight - finalHeight - taskbarHeight - safeMargin);
        
        const cascadeOffset = Math.min(25, Math.floor(viewportWidth / 30));
        
        const baseLeft = 50;
        const baseTop = 50;
        const offsetLeft = baseLeft + (this.nextWindowId * cascadeOffset);
        const offsetTop = baseTop + (this.nextWindowId * cascadeOffset);
        
        const finalLeft = Math.min(Math.max(safeMargin, offsetLeft), maxLeft);
        const finalTop = Math.min(Math.max(safeMargin, offsetTop), maxTop);
        
        win.style.left = `${finalLeft}px`;
        win.style.top = `${finalTop}px`;
        win.style.pointerEvents = 'auto';
        
        // Add to windows container
        const container = document.getElementById('windows-container');
        if (container) {
            container.appendChild(win);
        } else {
            const desktop = document.getElementById('desktop');
            if (desktop) {
                desktop.appendChild(win);
            } else {
                document.body.appendChild(win);
            }
        }
        
        // Track the window
        this.activeWindows.set(windowId, { 
            element: win, 
            title: title,
            isMinimized: false,
            isMaximized: false
        });
        
        // Setup all window controls
        this.setupWindowControls(win, windowId, title);
        
        // Make window draggable
        this.makeWindowDraggable(win);
        
        return win;
    },

    setupWindowControls(win, windowId, title) {
        const minimizeBtn = win.querySelector('.minimize-btn');
        const maximizeBtn = win.querySelector('.maximize-btn');
        const closeBtn = win.querySelector('.close-btn');

        // Minimize button
        minimizeBtn.onclick = () => {
            this.minimizeWindow(windowId);
        };
        
        // Maximize button
        maximizeBtn.onclick = () => {
            this.toggleMaximize(windowId);
        };

        // Close button - clean up properly
        closeBtn.onclick = () => {
            // Remove from taskbar if present
            const taskItem = document.querySelector(`[data-window-id="${windowId}"]`);
            if (taskItem) taskItem.remove();
            
            // Remove from DOM and tracking
            win.remove();
            this.activeWindows.delete(windowId);
        };
        
        // Window focus handling
        win.addEventListener('mousedown', () => {
            this.bringToFront(win);
        });
        
        // Touch support for mobile devices
        win.addEventListener('touchstart', () => {
            this.bringToFront(win);
        });
    },

    // Centralized minimize function
    minimizeWindow(windowId) {
        const windowData = this.activeWindows.get(windowId);
        if (!windowData) return;
        
        const win = windowData.element;
        const title = windowData.title;
        
        // Hide window
        win.style.display = 'none';
        windowData.isMinimized = true;
        
        // Create taskbar item
        const taskbarItems = document.querySelector('.taskbar-items');
        if (!taskbarItems) return;
        
        // Remove existing taskbar item if present
        const existing = taskbarItems.querySelector(`[data-window-id="${windowId}"]`);
        if (existing) existing.remove();
        
        // Create new taskbar item
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
        
        taskItem.onclick = () => {
            win.style.display = 'block';
            windowData.isMinimized = false;
            this.bringToFront(win);
            taskItem.remove();
        };
        
        taskItem.onmouseover = () => {
            taskItem.style.background = 'rgba(255,255,255,0.3)';
        };
        
        taskItem.onmouseout = () => {
            taskItem.style.background = 'rgba(255,255,255,0.2)';
        };
        
        taskbarItems.appendChild(taskItem);
    },
    
    // Toggle maximize function
    toggleMaximize(windowId) {
        const windowData = this.activeWindows.get(windowId);
        if (!windowData) return;

        const win = windowData.element;
        const titleBar = win.querySelector('.window-title-bar');

        if (!windowData.isMaximized) {
            // Store original position and size
            win.dataset.originalLeft = win.style.left;
            win.dataset.originalTop = win.style.top;
            win.dataset.originalWidth = win.style.width;
            win.dataset.originalHeight = win.style.height;

            // Maximize to fill the viewport (minus taskbar)
            win.style.left = '0';
            win.style.top = '0';
            win.style.width = '100vw';
            win.style.height = `calc(100vh - 40px)`; // Account for a 40px taskbar
            win.classList.add('maximized');

            // Disable dragging
            titleBar.style.cursor = 'default';
            titleBar.removeEventListener('mousedown', this.makeWindowDraggable);
        } else {
            // Restore to original position and size
            win.style.left = win.dataset.originalLeft;
            win.style.top = win.dataset.originalTop;
            win.style.width = win.dataset.originalWidth;
            win.style.height = win.dataset.originalHeight;
            win.classList.remove('maximized');

            // Re-enable dragging
            this.makeWindowDraggable(win);
        }
        windowData.isMaximized = !windowData.isMaximized;
        this.bringToFront(win);
    },

    makeWindowDraggable(win) {
        const titleBar = win.querySelector('.window-title-bar');
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        // Mouse events
        titleBar.addEventListener('mousedown', (e) => {
            const windowData = this.activeWindows.get(win.id);
            if (e.target.closest('.window-controls') || windowData.isMaximized) return;
            
            isDragging = true;
            const rect = win.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            titleBar.style.cursor = 'grabbing';
            this.bringToFront(win);
            e.preventDefault();
        });
        
        // Touch events for mobile support
        titleBar.addEventListener('touchstart', (e) => {
            const windowData = this.activeWindows.get(win.id);
            if (e.target.closest('.window-controls') || windowData.isMaximized) return;
            
            const touch = e.touches[0];
            isDragging = true;
            const rect = win.getBoundingClientRect();
            dragOffset.x = touch.clientX - rect.left;
            dragOffset.y = touch.clientY - rect.top;
            
            this.bringToFront(win);
            e.preventDefault();
        });
        
        // Mouse move
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            this.moveWindow(win, e.clientX, e.clientY, dragOffset);
        });
        
        // Touch move
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const touch = e.touches[0];
            this.moveWindow(win, touch.clientX, touch.clientY, dragOffset);
            e.preventDefault();
        });
        
        // Mouse up
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                titleBar.style.cursor = 'grab';
            }
        });
        
        // Touch end
        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
            }
        });
    },

    // Helper method for window movement with safe bounds
    moveWindow(win, clientX, clientY, dragOffset) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const taskbarHeight = 40;
        
        let newX = clientX - dragOffset.x;
        let newY = clientY - dragOffset.y;
        
        const titleBarHeight = 30;
        const minVisibleArea = 50;
        
        const maxX = viewportWidth - minVisibleArea;
        const maxY = viewportHeight - taskbarHeight - titleBarHeight;
        const minX = -(win.offsetWidth - minVisibleArea);
        const minY = 0;
        
        newX = Math.max(minX, Math.min(newX, maxX));
        newY = Math.max(minY, Math.min(newY, maxY));
        
        win.style.left = newX + 'px';
        win.style.top = newY + 'px';
    },

    bringToFront(win) {
        let maxZ = 0;
        document.querySelectorAll('.window').forEach(w => {
            const z = parseInt(w.style.zIndex) || 0;
            if (z > maxZ) maxZ = z;
        });
        win.style.zIndex = maxZ + 1;
    },

    // Show desktop functionality - minimize all windows
    minimizeAllWindows() {
        this.activeWindows.forEach((windowData, windowId) => {
            if (!windowData.isMinimized && !windowData.isMaximized) {
                this.minimizeWindow(windowId);
            }
        });
    },

    // Utility methods
    getAllWindows() {
        return Array.from(this.activeWindows.values());
    },

    getWindow(windowId) {
        return this.activeWindows.get(windowId);
    }
};


// code to make this core app appear in about
// Register self-documentation
if (window.Docs && typeof window.Docs.registerDocumentation === 'function') {
    setTimeout(() => {
        window.Docs.registerDocumentation('windowmanager', {
            name: "Window Manager",
            version: "1.0.0",
            description: "Core service managing window creation, controls, positioning, and cleanup with viewport constraints",
            type: "System Service",
            features: [
                "Standard window creation with title bar and control buttons",
                "Minimize/maximize/close functionality with state management",
                "Drag-and-drop window positioning with boundary constraints", 
                "Taskbar integration for minimized window restoration",
                "Touch device support with mobile drag operations",
                "Automatic cascade positioning for multiple windows"
            ],
            dependencies: [],
            methods: [
                { name: "createWindow", description: "Create new window with title, content, and dimensions" },
                { name: "minimizeWindow", description: "Hide window and create taskbar restoration item" },
                { name: "toggleMaximize", description: "Toggle between maximized and restored window states" },
                { name: "makeWindowDraggable", description: "Enable drag positioning with viewport constraints" },
                { name: "bringToFront", description: "Bring window to front by managing z-index values" }
            ],
            notes: "Core system service handling all window lifecycle management. Integrates with taskbar for minimized window restoration.",
            cudos: "edmundsparrow.netlify.app | whatsappme @ 09024054758 | webaplications5050@gmail.com",
            auto_generated: false
        });
    }, 100);
}

