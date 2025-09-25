// FILE: /SYSTEM/CORE/app-registry.js
// VERSION: 1.0.0
//
// APP REGISTRY - CORE SYSTEM MODULE
//
// PURPOSE:
//   The App Registry is the central controller that manages the lifecycle
//   of all applications within Pocket WebOS. It ensures apps are registered,
//   launched, and managed consistently across the system.
//
// RESPONSIBILITIES:
//   • Maintain a global registry of installed applications (name, icon, entry point).
//   • Provide a single interface to launch applications on demand.
//   • Enforce "single instance" behavior (apps cannot open multiple times
//     unless explicitly designed to support it).
//   • Handle app focus and relaunching of existing instances.
//   • Serve as the dependency point for the Start Menu, Taskbar, and Window Manager.
//
// KEY FUNCTIONS:
//   - registerApp(appConfig)
//       → Registers a new application with metadata and entry function.
//   - launchApp(appName)
//       → Opens the app window if not already open, otherwise focuses existing instance.
//   - getAppList()
//       → Returns a list of all registered applications (used by UI components).
//   - closeApp(appName)
//       → Closes an app instance and frees memory from the registry.
//
// USAGE IN SYSTEM:
//   This module is loaded once during system initialization and remains in
//   memory for the lifetime of the OS. All application launch requests pass
//   through this registry to ensure consistent behavior.
//
// DEPENDENCIES:
//   • /SYSTEM/CORE/window-manager.js  (for window handling)
//   • /SYSTEM/CORE/event-bus.js       (for system-wide communication)
//
// FUTURE EXTENSIONS:
//   • Multi-instance support for select apps (e.g. Notepad).
//   • App permissions / access control.
//   • Persistent app state saving across sessions.
//   • Remote app installation.
//
// CUDOS / APPRECIATION:
//   Contributions, shoutouts, and developer notes can be added here.
//   Example: nokia..om | whatsappme @ 09024054758 | 
//            my email = webaplications5050@gmail.com
//
// ---------------------------------------------------------------------


// INSTALLER/JS/APP-REGISTRY.JS - Updated with single instance support
window.AppRegistry = {
    registeredApps: new Map(),
    runningInstances: new Map(), // Track running app instances
    
    registerApp(app) {
        if (!app.id || !app.name || !app.handler) {
            console.error('Invalid app registration:', app);
            return;
        }
        this.registeredApps.set(app.id, app);
        EventBus.emit('app-registered', app);
    },
    
    openApp(appId) {
        const app = this.registeredApps.get(appId);
        if (!app) {
            console.error(`App "${appId}" not found.`);
            return null;
        }

        // Check for single instance requirement
        if (app.singleInstance) {
            const existingInstance = this.runningInstances.get(appId);
            if (existingInstance) {
                // Bring existing instance to front instead of creating new one
                this.focusExistingInstance(existingInstance, appId);
                return existingInstance;
            }
        }

        try {
            // Launch the app
            const instance = app.handler();
            
            // Track the instance if it's a window
            if (instance && instance.classList && instance.classList.contains('window')) {
                this.trackInstance(appId, instance, app.singleInstance);
            }
            
            return instance;
        } catch (error) {
            console.error(`Error launching app "${appId}":`, error);
            return null;
        }
    },

    trackInstance(appId, windowElement, isSingleInstance) {
        if (isSingleInstance) {
            // For single instance apps, store the window reference
            this.runningInstances.set(appId, windowElement);
            
            // Set up cleanup when window is closed
            this.setupInstanceCleanup(appId, windowElement);
        }
        // For multi-instance apps, we don't need to track them
    },

    setupInstanceCleanup(appId, windowElement) {
        // Watch for window closure to clean up tracking
        const cleanupInstance = () => {
            this.runningInstances.delete(appId);
        };

        // Monitor for window removal from DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.removedNodes.forEach((node) => {
                        if (node === windowElement) {
                            cleanupInstance();
                            observer.disconnect();
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Also listen for close button clicks
        const closeBtn = windowElement.querySelector('.close-btn');
        if (closeBtn) {
            const originalHandler = closeBtn.onclick;
            closeBtn.onclick = () => {
                cleanupInstance();
                if (originalHandler) originalHandler();
            };
        }
    },

    focusExistingInstance(windowElement, appId) {
        // Show the window if it's minimized
        if (windowElement.style.display === 'none') {
            windowElement.style.display = 'block';
            
            // Remove from taskbar if present
            const taskItem = document.querySelector(`[data-window-id="${windowElement.id}"]`);
            if (taskItem) taskItem.remove();
        }

        // Bring to front
        if (window.WindowManager && typeof window.WindowManager.bringToFront === 'function') {
            window.WindowManager.bringToFront(windowElement);
        } else {
            // Fallback z-index management
            let maxZ = 0;
            document.querySelectorAll('.window').forEach(w => {
                const z = parseInt(w.style.zIndex) || 0;
                if (z > maxZ) maxZ = z;
            });
            windowElement.style.zIndex = maxZ + 1;
        }

        // Flash the window to indicate it's been activated
        this.flashWindow(windowElement);
    },

    flashWindow(windowElement) {
        const titleBar = windowElement.querySelector('.window-title-bar');
        if (titleBar) {
            const originalBackground = titleBar.style.background;
            titleBar.style.background = 'rgba(74, 144, 226, 0.8)';
            setTimeout(() => {
                titleBar.style.background = originalBackground;
            }, 200);
        }
    },
    
    // Utility methods
    getRegisteredApps() {
        return Array.from(this.registeredApps.values());
    },

    getAllApps() {
        return Array.from(this.registeredApps.values());
    },

    getApp(appId) {
        return this.registeredApps.get(appId);
    },

    isAppRunning(appId) {
        return this.runningInstances.has(appId);
    },

    getRunningInstance(appId) {
        return this.runningInstances.get(appId);
    }
};

// Maintain backward compatibility
window.AppRegistry.register = window.AppRegistry.registerApp;

