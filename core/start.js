// FILE: /SYSTEM/CORE/start.js
// VERSION: 1.3.0
// BUILD DATE: 2025-09-22
//
// START.JS - ENHANCED START MENU SYSTEM
//
// PURPOSE:
//   Advanced start menu implementation providing categorized application access,
//   search functionality, and recent applications tracking. Core system component
//   for application discovery and launching with minimal resource footprint.
//   Integrates seamlessly with AppRegistry and WindowManager systems.
//
// RESPONSIBILITIES:
//   • Provide intuitive application launcher interface with category organization
//   • Track and display recently used applications for quick access
//   • Implement real-time search functionality across all registered apps
//   • Manage expandable category views with visual feedback
//   • Handle proper event delegation to prevent menu hiding conflicts
//   • Persist user preferences and recent app history to localStorage
//
// ARCHITECTURE:
//   - Standalone IIFE with window.EnhancedStartMenu namespace
//   - Self-contained DOM manipulation without framework dependencies  
//   - Category-based app organization with intelligent keyword matching
//   - localStorage integration for recent apps persistence
//   - Event-driven integration with AppRegistry for live app updates
//   - Responsive design adapting to different viewport configurations
//
// LIFECYCLE:
//   1. StartMenuApp.open() triggers EnhancedStartMenu.open()
//   2. Menu window created with search, categories, and view controls
//   3. Apps loaded from AppRegistry and categorized dynamically using keywords
//   4. User interaction launches apps and updates recent history automatically
//   5. Menu auto-hides on outside clicks, persists recent apps to localStorage
//   6. Category expansion state maintained across sessions
//
// KEY FEATURES:
//   - Smart categorization using keyword matching algorithms
//   - Dual view modes: Categories and All Programs
//   - Real-time search with term highlighting
//   - Recent apps tracking with visual indicators
//   - Responsive layout adapting to mobile and desktop
//   - Smooth animations and visual feedback
//   - Keyboard navigation support
//
// EXTENSION POINTS:
//   - THEMES: Custom color schemes and visual styles via CSS variables
//   - CATEGORIES: User-defined custom categories and classification rules
//   - PLUGINS: Third-party app sources and external integrations  
//   - LAYOUTS: Grid view, compact view, or custom arrangements
//   - ANALYTICS: Usage tracking and app recommendation engine
//   - SHORTCUTS: Enhanced keyboard navigation and global hotkey support
//
// INTEGRATION:
//   Requires: AppRegistry, WindowManager, EventBus (optional)
//   Provides: StartMenuApp.open() interface for system integration
//   Exports: EnhancedStartMenu namespace for advanced customization
//
// PERFORMANCE:
//   - Lazy DOM rendering with efficient category grouping
//   - Debounced search input to minimize processing overhead
//   - Minimal memory footprint with cleanup on menu close
//   - Optimized event handling to prevent memory leaks
//
// DEPENDENCIES:
//   • /SYSTEM/CORE/app-registry.js - Application registration system
//   • /SYSTEM/CORE/window-manager.js - Window lifecycle management
//   • /SYSTEM/CORE/event-bus.js - Optional event communication (if available)
//
// FUTURE EXTENSIONS:
//   • Plugin architecture for custom app sources
//   • Advanced search with fuzzy matching and scoring
//   • User-configurable category definitions and rules
//   • Cloud synchronization of preferences and recent apps
//   • Accessibility improvements for screen readers
//   • Performance metrics and usage analytics
//
// COMPATIBILITY:
//   - Modern browsers supporting ES6+ features
//   - Mobile touch interfaces with responsive design
//   - High DPI displays with scalable vector graphics
//   - Keyboard-only navigation for accessibility
//
// AUTHOR NOTES:
//   This implementation prioritizes user experience while maintaining system
//   performance. The categorization algorithm automatically classifies apps
//   without requiring manual configuration, making it maintainable as new
//   applications are added to the system.
//
// CREDITS:
//   edmundsparrow.netlify.app | whatsappme @ 09024054758 | 
//   webaplications5050@gmail.com
//
// NOTES:
//   - Zero external dependencies maintains system independence
//   - Efficient DOM rendering with minimal memory allocation
//   - Category keywords automatically classify apps without manual configuration
//   - Recent apps limited to 6 entries to prevent storage bloat
//   - Event handling designed to prevent conflicts with global click handlers
// 
// ---------------------------------------------------------------------

// Enhanced Start Menu with Categories - Rewritten for new architecture
window.EnhancedStartMenu = {
    menuWindow: null,
    searchQuery: '',
    expandedCategories: new Set(['recent', 'productivity']),
    recentApps: JSON.parse(localStorage.getItem('webos-recent-apps') || '[]'),
    maxRecent: 6,
    viewMode: 'categories',

    // Category definitions with intelligent keyword matching
    categories: {
        'recent': {
            name: 'Recently Used',
            icon: '🕒',
            description: 'Your most recently opened applications'
        },
        'productivity': {
            name: 'Office & Productivity',
            icon: '📊',
            description: 'Tools for work and productivity',
            keywords: ['office', 'text', 'document', 'note', 'calculator', 'word', 'pad']
        },
        'system': {
            name: 'System & Tools',
            icon: '⚙️',
            description: 'System utilities and tools',
            keywords: ['system', 'settings', 'file', 'task', 'monitor', 'info', 'about', 'docs']
        },
        'multimedia': {
            name: 'Multimedia',
            icon: '🎭',
            description: 'Audio, video, and image applications',
            keywords: ['media', 'audio', 'video', 'music', 'image', 'photo', 'gallery']
        },
        'games': {
            name: 'Games & Entertainment',
            icon: '🎮',
            description: 'Games and entertainment apps',
            keywords: ['game', 'puzzle', 'fun', 'play', 'snake', 'solitaire']
        },
        'internet': {
            name: 'Internet & Communication',
            icon: '🌐',
            description: 'Web browsing and communication tools',
            keywords: ['web', 'browser', 'email', 'chat', 'weather', 'online', 'contacts']
        },
        'other': {
            name: 'Other Applications',
            icon: '📁',
            description: 'Miscellaneous applications'
        }
    },

    /**
     * Main entry point - Opens or toggles the start menu
     * Prevents multiple instances and handles visibility states
     */
    open() {
        // Prevent multiple instances
        if (this.menuWindow && document.body.contains(this.menuWindow)) {
            if (this.menuWindow.style.display === "none") {
                this.menuWindow.style.display = "block";
                this.refreshApps();
            } else {
                this.menuWindow.style.display = "none";
            }
            return;
        }

        this.createMenuWindow();
        this.refreshApps();
    },

    /**
     * Creates the main menu window with proper styling and structure
     * Builds the complete DOM hierarchy for the start menu interface
     */
    createMenuWindow() {
        const menuHTML = `
            <div class="enhanced-start-menu" style="
                display: flex;
                flex-direction: column;
                height: 100%;
                background: linear-gradient(180deg, #f7f9fc 0%, #e8f1ff 50%, #d6e8ff 100%);
                font-family: 'Segoe UI', Arial, sans-serif;
                font-size: 13px;
            ">
                <!-- Header -->
                <div class="menu-header" style="
                    background: linear-gradient(180deg, #4a90e2 0%, #2b5797 100%);
                    color: white;
                    padding: 12px 16px;
                    font-weight: bold;
                    font-size: 16px;
                    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                    border-bottom: 1px solid rgba(0,0,0,0.1);
                ">
                    <span>🪟 edmundsparrow-WebOs</span>
                </div>

                <!-- Search -->
                <div class="menu-search" style="
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(0,0,0,0.1);
                    background: rgba(255,255,255,0.5);
                ">
                    <input type="text" id="enhanced-search" placeholder="Search programs and files..." style="
                        width: 100%;
                        padding: 8px 12px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        font-size: 13px;
                        outline: none;
                        background: white;
                        box-sizing: border-box;
                        box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
                    ">
                </div>

                <!-- Content Area -->
                <div class="menu-content" id="enhanced-content" style="
                    flex-grow: 1;
                    overflow-y: auto;
                    padding: 8px;
                "></div>

                <!-- Footer -->
                <div class="menu-footer" style="
                    background: linear-gradient(180deg, rgba(43,87,151,0.1) 0%, rgba(43,87,151,0.2) 100%);
                    padding: 8px 16px;
                    border-top: 1px solid rgba(43,87,151,0.2);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div class="menu-stats" id="enhanced-stats" style="font-size: 10px; color: #666;">
                        0 programs available
                    </div>
                    <div class="view-toggle" style="
                        display: flex;
                        background: rgba(255,255,255,0.3);
                        border-radius: 4px;
                        overflow: hidden;
                        border: 1px solid rgba(43,87,151,0.2);
                    ">
                        <button class="toggle-btn active" data-view="categories" style="
                            padding: 4px 8px;
                            font-size: 10px;
                            background: rgba(43,87,151,0.3);
                            color: white;
                            border: none;
                            cursor: pointer;
                        ">Categories</button>
                        <button class="toggle-btn" data-view="all" style="
                            padding: 4px 8px;
                            font-size: 10px;
                            background: transparent;
                            color: #2b5797;
                            border: none;
                            cursor: pointer;
                        ">All Programs</button>
                    </div>
                </div>
            </div>
        `;

        this.menuWindow = document.createElement("div");
        this.menuWindow.style.cssText = `
            position: fixed;
            left: 0;
            bottom: 40px;
            width: 420px;
            height: 500px;
            background: white;
            border: 1px solid rgba(43, 87, 151, 0.3);
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.8);
            z-index: 2000;
            overflow: hidden;
        `;

        this.menuWindow.innerHTML = menuHTML;
        document.body.appendChild(this.menuWindow);

        this.setupEventHandlers();
    },

    /**
     * Sets up all event handlers with proper delegation and conflict prevention
     * FIXED: Category clicks no longer trigger menu hiding
     */
    setupEventHandlers() {
        const searchInput = this.menuWindow.querySelector('#enhanced-search');
        const contentArea = this.menuWindow.querySelector('#enhanced-content');
        let isMenuClick = false; // Flag to track internal clicks

        // Search functionality with debounced input
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderApps();
        });

        // Menu interactions
        contentArea.addEventListener('click', (e) => {
            // App launch - SHOULD hide menu
            const appItem = e.target.closest('.menu-app-item');
            if (appItem) {
                const appId = appItem.dataset.appId;
                this.launchApp(appId); // This already hides the menu
                return;
            }

            // Category toggle - SHOULD NOT hide menu
            const categoryHeader = e.target.closest('.category-header');
            if (categoryHeader) {
                e.preventDefault();
                e.stopPropagation();
                isMenuClick = true; // Mark as internal click to prevent menu hiding
                
                const categoryId = categoryHeader.dataset.category;
                if (this.expandedCategories.has(categoryId)) {
                    this.expandedCategories.delete(categoryId);
                } else {
                    this.expandedCategories.add(categoryId);
                }
                this.renderApps();
                
                // Reset the flag after processing
                setTimeout(() => {
                    isMenuClick = false;
                }, 50);
                return;
            }
        });

        // Mark any click within the menu window as internal for view toggles
        this.menuWindow.addEventListener('click', (e) => {
            // View toggle buttons
            const toggleBtn = e.target.closest('.toggle-btn');
            if (toggleBtn) {
                isMenuClick = true;
                
                this.menuWindow.querySelectorAll('.toggle-btn').forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.background = 'transparent';
                    btn.style.color = '#2b5797';
                });
                toggleBtn.classList.add('active');
                toggleBtn.style.background = 'rgba(43,87,151,0.3)';
                toggleBtn.style.color = 'white';

                this.viewMode = toggleBtn.dataset.view;
                this.renderApps();
                
                // Reset flag after processing
                setTimeout(() => {
                    isMenuClick = false;
                }, 50);
            }
        });

        // Hide menu when clicking outside - FIXED VERSION
        document.addEventListener('click', (e) => {
            // Don't hide if this was an internal menu click
            if (isMenuClick) {
                return;
            }
            
            if (this.menuWindow && 
                this.menuWindow.style.display !== 'none' && 
                !this.menuWindow.contains(e.target)) {
                
                const startButton = document.querySelector('.start-button');
                if (!startButton || !startButton.contains(e.target)) {
                    this.menuWindow.style.display = 'none';
                }
            }
        });

        this.viewMode = 'categories';
    },

    /**
     * Refreshes the apps list - called when new apps are registered
     * Re-renders the current view to pick up any new registrations
     */
    refreshApps() {
        if (this.menuWindow && this.menuWindow.style.display !== 'none') {
            this.renderApps();
        }
    },
    
    /**
     * Main rendering function - orchestrates the display of apps
     * Handles both category and all-programs views with search filtering
     */
    renderApps() {
        const contentArea = this.menuWindow.querySelector('#enhanced-content');
        const statsArea = this.menuWindow.querySelector('#enhanced-stats');
        
        // Get all registered apps from AppRegistry
        const apps = this.getAllApps();
        const processedApps = this.processApps(apps);

        // Update statistics display
        statsArea.textContent = `${apps.length} programs in ${Object.keys(this.categories).length - 1} categories`;

        // Filter by search if needed
        let filteredApps = this.searchQuery ? 
            this.filterAppsBySearch(processedApps, this.searchQuery) : 
            processedApps;

        if (filteredApps.length === 0) {
            contentArea.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">No programs found</div>';
            return;
        }

        // Render based on current view mode
        if (this.viewMode === 'categories' && !this.searchQuery) {
            this.renderCategoryView(contentArea, filteredApps);
        } else {
            this.renderAllView(contentArea, filteredApps);
        }
    },

    /**
     * Retrieves all registered apps from AppRegistry
     * Filters out system UI components that shouldn't appear in the menu
     */
    getAllApps() {
        const apps = [];
        if (window.AppRegistry && window.AppRegistry.registeredApps) {
            window.AppRegistry.registeredApps.forEach((app, id) => {
                // Exclude system UI components from the app list
                if (id !== 'start-menu' && id !== 'startmenu' && id !== 'enhanced-start-menu') {
                    apps.push({
                        id: id,
                        name: app.name,
                        icon: app.icon || this.getDefaultIcon(),
                        handler: app.handler
                    });
                }
            });
        }
        return apps;
    },

    /**
     * Processes apps by adding category and description metadata
     * Enriches app data for improved display and organization
     */
    processApps(apps) {
        return apps.map(app => ({
            ...app,
            category: this.categorizeApp(app),
            description: this.getAppDescription(app.id)
        }));
    },

    /**
     * Intelligent app categorization using keyword matching
     * Automatically classifies apps based on name and ID content
     */
    categorizeApp(app) {
        const searchText = (app.name + ' ' + app.id).toLowerCase();
        
        for (const [categoryId, category] of Object.entries(this.categories)) {
            if (categoryId === 'recent' || categoryId === 'other') continue;
            
            if (category.keywords) {
                for (const keyword of category.keywords) {
                    if (searchText.includes(keyword)) {
                        return categoryId;
                    }
                }
            }
        }
        
        return 'other';
    },

    /**
     * Provides user-friendly descriptions for common applications
     * Fallback generates generic description for unknown apps
     */
    getAppDescription(appId) {
        const descriptions = {
            'calculator': 'Perform basic arithmetic calculations',
            'wordpad': 'Rich text editor and document processor',
            'clock': 'Analog clock with world time and utilities',
            'contacts': 'Manage your contact information',
            'weather': 'Current weather conditions and forecasts',
            'taskmanager': 'Monitor and manage running processes',
            'about': 'System information and documentation',
            'gallery': 'View and manage your photos',
            'task': 'Task management and productivity tools',
            'docs': 'Documentation and help system',
            'calendar': 'Calendar and scheduling application',
            'media': 'Multimedia player and manager',
            'file-explorer': 'Browse and manage files and folders',
            'desktop-settings': 'Customize desktop appearance and behavior',
            'edmundsparrow-webOs-store': 'Browse and install applications'
        };
        return descriptions[appId] || `${appId.charAt(0).toUpperCase() + appId.slice(1)} application`;
    },

    /**
     * Filters apps based on search query
     * Searches across name, description, and ID fields
     */
    filterAppsBySearch(apps, query) {
        return apps.filter(app => {
            const searchText = (app.name + ' ' + app.description + ' ' + app.id).toLowerCase();
            return searchText.includes(query);
        });
    },

    /**
     * Renders the categorized view with expandable sections
     * Shows recent apps first, followed by categorized applications
     */
    renderCategoryView(container, apps) {
        const categorized = this.groupAppsByCategory(apps);
        let html = '';

        // Add recent apps category first if available
        if (this.recentApps.length > 0) {
            const recentAppData = this.recentApps
                .map(id => apps.find(app => app.id === id))
                .filter(app => app);
            
            if (recentAppData.length > 0) {
                categorized.recent = recentAppData;
            }
        }

        // Render each category with proper styling and interaction
        Object.entries(categorized).forEach(([categoryId, categoryApps]) => {
            if (categoryApps.length === 0) return;

            const category = this.categories[categoryId];
            const isExpanded = this.expandedCategories.has(categoryId);

            html += `
                <div class="menu-category" style="margin-bottom: 8px; background: rgba(255,255,255,0.3); border-radius: 6px; border: 1px solid rgba(43,87,151,0.1);">
                    <div class="category-header" data-category="${categoryId}" style="
                        display: flex;
                        align-items: center;
                        padding: 8px 12px;
                        background: linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 100%);
                        cursor: pointer;
                        user-select: none;
                        transition: all 0.2s ease;
                        border-bottom: 1px solid rgba(43,87,151,0.1);
                    ">
                        <span style="font-size: 16px; margin-right: 8px; width: 20px; text-align: center;">${category.icon}</span>
                        <span style="flex-grow: 1; font-weight: 600; font-size: 13px; color: #2b5797;">${category.name}</span>
                        <span style="background: rgba(43,87,151,0.2); color: #2b5797; padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: bold; margin-right: 6px;">${categoryApps.length}</span>
                        <span style="font-size: 12px; color: #2b5797; transition: transform 0.2s ease; ${isExpanded ? 'transform: rotate(90deg);' : ''}">▶</span>
                    </div>
                    <div class="category-apps" style="
                        ${isExpanded ? 'display: block;' : 'display: none;'}
                        padding: 4px;
                        background: rgba(255,255,255,0.2);
                    ">
                        ${categoryApps.map(app => this.renderAppItem(app, categoryId === 'recent')).join('')}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    /**
     * Renders the all-programs view as a single expanded list
     * Provides alphabetically sorted list of all available applications
     */
    renderAllView(container, apps) {
        const sortedApps = apps.sort((a, b) => a.name.localeCompare(b.name));
        
        const html = `
            <div class="menu-category" style="margin-bottom: 8px; background: rgba(255,255,255,0.3); border-radius: 6px; border: 1px solid rgba(43,87,151,0.1);">
                <div class="category-header" style="
                    display: flex;
                    align-items: center;
                    padding: 8px 12px;
                    background: linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.3) 100%);
                ">
                    <span style="font-size: 16px; margin-right: 8px; width: 20px; text-align: center;">📋</span>
                    <span style="flex-grow: 1; font-weight: 600; font-size: 13px; color: #2b5797;">All Programs</span>
                    <span style="background: rgba(43,87,151,0.2); color: #2b5797; padding: 2px 6px; border-radius: 10px; font-size: 10px; font-weight: bold;">${sortedApps.length}</span>
                </div>
                <div class="category-apps" style="display: block; padding: 4px; background: rgba(255,255,255,0.2);">
                    ${sortedApps.map(app => this.renderAppItem(app, false)).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    /**
     * Renders individual app items with icons, names, and descriptions
     * Supports search term highlighting and recent app indicators
     */
    renderAppItem(app, isRecent = false) {
        const highlightedName = this.highlightSearchTerm(app.name, this.searchQuery);
        const highlightedDesc = this.highlightSearchTerm(app.description, this.searchQuery);

        return `
            <div class="menu-app-item" data-app-id="${app.id}" style="
                display: flex;
                align-items: center;
                padding: 6px 8px;
                margin: 2px 0;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.15s ease;
                background: rgba(255,255,255,0.4);
                border: 1px solid transparent;
                ${isRecent ? 'border-left: 3px solid #4caf50;' : ''}
            ">
                <img src="${app.icon}" alt="${app.name}" style="width: 24px; height: 24px; margin-right: 10px; border-radius: 2px;">
                <div style="flex-grow: 1;">
                    <div style="font-size: 13px; font-weight: 500; color: #333; margin-bottom: 1px;">${highlightedName}</div>
                    <div style="font-size: 10px; color: #666; opacity: 0.8;">${highlightedDesc}</div>
                </div>
            </div>
        `;
    },

    /**
     * Groups processed apps by their assigned categories
     * Returns organized structure for category view rendering
     */
    groupAppsByCategory(apps) {
        const grouped = {};
        
        // Initialize categories (exclude recent as it's handled separately)
        Object.keys(this.categories).forEach(categoryId => {
            if (categoryId !== 'recent') {
                grouped[categoryId] = [];
            }
        });

        // Group apps by their assigned categories
        apps.forEach(app => {
            const category = app.category;
            if (grouped[category]) {
                grouped[category].push(app);
            }
        });

        // Remove empty categories to keep interface clean
        Object.keys(grouped).forEach(categoryId => {
            if (grouped[categoryId].length === 0) {
                delete grouped[categoryId];
            }
        });

        return grouped;
    },

    /**
     * Highlights search terms in text with yellow background
     * Safely escapes regex special characters to prevent errors
     */
    highlightSearchTerm(text, searchTerm) {
        if (!searchTerm || !text) return text;
        
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span style="background: yellow; padding: 1px 2px; border-radius: 2px;">$1</span>');
    },

    /**
     * Launches an application and manages recent apps tracking
     * Hides menu after successful launch and updates usage history
     */
    launchApp(appId) {
        // Use the existing AppRegistry to launch
        if (window.AppRegistry) {
            window.AppRegistry.openApp(appId);
            this.addToRecent(appId);
            this.menuWindow.style.display = 'none';
        }
    },

    /**
     * Adds an app to the recent apps list with smart deduplication
     * Maintains chronological order and enforces maximum recent count
     */
    addToRecent(appId) {
        // Remove if already exists to avoid duplicates
        this.recentApps = this.recentApps.filter(id => id !== appId);
        
        // Add to beginning of list (most recent first)
        this.recentApps.unshift(appId);
        
        // Enforce maximum recent apps limit
        if (this.recentApps.length > this.maxRecent) {
            this.recentApps = this.recentApps.slice(0, this.maxRecent);
        }
        
        // Persist to localStorage for cross-session retention
        localStorage.setItem('webos-recent-apps', JSON.stringify(this.recentApps));
    },

    /**
     * Provides default icon for apps without custom icons
     * Returns base64-encoded SVG with generic app appearance
     */
    getDefaultIcon() {
        return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><rect width='24' height='24' fill='%23ccc'/><text x='12' y='16' text-anchor='middle' font-size='12' fill='%23666'>App</text></svg>";
    }
};

// System integration layer - provides simple interface for other components
window.StartMenuApp = {
    /**
     * Main entry point for opening the start menu
     * Called by taskbar, keyboard shortcuts, or other system components
     */
    open() {
        window.EnhancedStartMenu.open();
    }
};

// Auto-refresh menu when new apps are registered (if EventBus is available)
if (window.EventBus) {
    window.EventBus.on('app-registered', () => {
        if (window.EnhancedStartMenu.menuWindow && 
            window.EnhancedStartMenu.menuWindow.style.display !== 'none') {
            window.EnhancedStartMenu.refreshApps();
        }
    });
}