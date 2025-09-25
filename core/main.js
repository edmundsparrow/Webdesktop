// FILE: /JS/main.js
// VERSION: 1.0.0
//
// MAIN.JS - SYSTEM BOOTSTRAPPER & APP LOADER
//
// PURPOSE:
//   Acts as the entry point for Pocket WebOS. Responsible for waiting until all
//   system dependencies are available, initializing system apps, and dynamically
//   loading user applications. This file ties together the OS core services and
//   user space applications at startup.
//
// RESPONSIBILITIES:
//   • Define the list of user applications to be loaded dynamically.
//   • Register system-level applications (e.g., Start Menu).
//   • Ensure core dependencies (AppRegistry, WindowManager, EventBus, Taskbar)
//     are loaded before initializing applications.
//   • Log initialization events for debugging and monitoring system startup.
//
// KEY FUNCTIONS:
//   - initializeSystem()
//       → Registers system apps and prepares them for launch.
//   - loadUserApplications()
//       → Dynamically loads all user-defined applications from /installer/applications.
//   - waitForDependencies()
//       → Polls until required core systems are available before bootstrapping apps.
//
// SYSTEM ROLE:
//   This script runs once on page load. It ensures a predictable startup sequence,
//   enabling both system and user apps to integrate seamlessly with the OS core.
//
// DEPENDENCIES:
//   • /SYSTEM/CORE/app-registry.js
//   • /SYSTEM/CORE/window-manager.js
//   • /SYSTEM/CORE/event-bus.js
//   • /SYSTEM/CORE/taskbar.js
//
// FUTURE EXTENSIONS:
//   • Lazy loading of user apps on-demand (instead of upfront).
//   • App preload caching for faster startup times.
//   • Support for external / remote app loading.
//
// CUDOS / APPRECIATION:
//   Contributions, shoutouts, and developer notes can be added here.
//   Example: edmundsparrow.netlify.app | whatsappme @ 09024054758 |
//            my email = webaplications5050@gmail.com
//
// ---------------------------------------------------------------------


// JS/MAIN.JS - App Registry and Loader - Simplified, no duplicate TaskbarManager
// ====================================

(function() {
    // List of user applications to load dynamically
    const appScripts = [
    "applications/pending/wled.js",
    "system/cloud-storage.js",
    "system/about.js",
    "system/pdfreader.js",
    
     "applications/clock1.js",
  //  "system/weather.js",
   // "applications/pending/terminal.js",

       // "installer/applications/messages.js",
     //  "installer/applications/email.js",
     //  "installer/applications/email-client.js",
    "applications/calculator.js",
       // "installer/applications/wordpad.js",
    "applications/gallery.js",
   // "system/web-launcher.js",
    "system/desktop-settings.js",
    "system/calendar.js",
  //  "system/clock.js",
    "system/contacts.js",
    "system/weather.js",
    "applications/media.js",
    //   "installer/applications/file-explorer.js",
    "system/task.js",
   // "system/webstore.js"
    "applications/pendong/sysinfo1.js"

    ];
    
    // System apps
    const systemApps = [
        {
            id: 'startmenu',
            name: 'Start Menu',
            icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><rect width='24' height='24' fill='%232c59a0'/><text x='12' y='16' text-anchor='middle' font-size='14' fill='white'>≡</text></svg>",
            handler: () => StartMenuApp.open(),
            singleInstance: true
        }
    ];

    // Initialize system services in correct order
    function initializeSystem() {
        console.log("Initializing WebOS system...");
        
        // Register system apps
        systemApps.forEach(app => {
            try {
                AppRegistry.register(app);
                console.log(`Registered system app: ${app.name}`);
            } catch (error) {
                console.error(`Failed to register system app ${app.name}:`, error);
            }
        });
        
        console.log("System apps registered successfully");
    }

    // Load user applications dynamically
    function loadUserApplications() {
        appScripts.forEach(src => {
            const script = document.createElement("script");
            script.src = src;
            script.onload = () => {
                console.log(`Loaded app script: ${src}`);
            };
            script.onerror = () => {
                console.error(`Failed to load app script: ${src}`);
            };
            document.body.appendChild(script);
        });
    }

    // Wait for DOM and core systems to be ready
    function waitForDependencies() {
        const requiredSystems = [
            'AppRegistry',
            'WindowManager', 
            'EventBus',
            'Taskbar'
        ];
        
        const checkSystems = () => {
            const missing = requiredSystems.filter(system => !window[system]);
            
            if (missing.length === 0) {
                console.log("All core systems ready");
                initializeSystem();
                loadUserApplications();
            } else {
                console.log(`Waiting for systems: ${missing.join(', ')}`);
                setTimeout(checkSystems, 100);
            }
        };
        
        checkSystems();
    }

    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForDependencies);
    } else {
        waitForDependencies();
    }

    console.log("Main.js initialized. System startup initiated.");
})();

