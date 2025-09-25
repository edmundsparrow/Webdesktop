// JS/CORE/DESKP.JS - Adaptive Desktop Icon Manager
window.DesktopIconManager = {
    // Configuration
    settings: {
        iconSize: 'medium',        // small, medium, large
        layoutMode: 'auto',       // auto, grid, list
        maxIconsPerRow: 'auto',   // auto, 2, 3, 4, 5, 6
        showLabels: true,
        doubleClickToOpen: true,
        iconSpacing: 'normal'     // tight, normal, loose
    },
    
    // State
    registeredApps: new Map(),
    hiddenApps: new Set(),
    systemApps: new Set(['startmenu', 'settings', 'task-manager', 'sysinfo']), // Won't show on desktop
    currentLayout: null,
    iconsContainer: null,
    
    // Icon size configurations
    iconSizes: {
        small: { size: 32, fontSize: '10px', padding: '4px' },
        medium: { size: 48, fontSize: '12px', padding: '6px' },
        large: { size: 64, fontSize: '14px', padding: '8px' }
    },
    
    // Spacing configurations
    spacingConfig: {
        tight: { gap: '4px', margin: '8px' },
        normal: { gap: '8px', margin: '12px' },
        loose: { gap: '12px', margin: '16px' }
    },

    init() {
        this.iconsContainer = document.getElementById('icons');
        if (!this.iconsContainer) {
            console.error('Desktop icons container not found');
            return;
        }

        // Load settings from localStorage
        this.loadSettings();
        
        // Listen for app registrations
        if (window.EventBus) {
            window.EventBus.on('app-registered', (app) => this.handleAppRegistered(app));
        }
        
        // Listen for window resize
        window.addEventListener('resize', () => this.debounce(() => this.updateLayout(), 300));
        
        // Initialize layout
        this.updateLayout();
        
        // Listen for settings changes
        window.addEventListener('desktop-settings-changed', (e) => {
            this.updateSettings(e.detail);
        });
        
        console.log('DesktopIconManager initialized');
    },

    loadSettings() {
        const saved = localStorage.getItem('desktop-icon-settings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            } catch (e) {
                console.warn('Failed to load desktop settings, using defaults');
            }
        }
        
        const hiddenApps = localStorage.getItem('hidden-desktop-apps');
        if (hiddenApps) {
            try {
                this.hiddenApps = new Set(JSON.parse(hiddenApps));
            } catch (e) {
                console.warn('Failed to load hidden apps list');
            }
        }
    },

    saveSettings() {
        localStorage.setItem('desktop-icon-settings', JSON.stringify(this.settings));
        localStorage.setItem('hidden-desktop-apps', JSON.stringify([...this.hiddenApps]));
    },

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
        this.updateLayout();
    },

    handleAppRegistered(app) {
        // Skip system apps that shouldn't appear on desktop
        if (this.systemApps.has(app.id)) {
            return;
        }
        
        this.registeredApps.set(app.id, app);
        this.updateLayout();
    },

    calculateOptimalLayout() {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight - 40 // Account for taskbar
        };
        
        const iconConfig = this.iconSizes[this.settings.iconSize];
        const spacing = this.spacingConfig[this.settings.iconSpacing];
        
        // Calculate available space
        const availableWidth = viewport.width - (parseInt(spacing.margin) * 2);
        const availableHeight = viewport.height - (parseInt(spacing.margin) * 2);
        
        // Calculate icon with label dimensions
        const iconTotalWidth = iconConfig.size + parseInt(spacing.gap);
        const iconTotalHeight = iconConfig.size + (this.settings.showLabels ? 20 : 0) + parseInt(spacing.gap);
        
        // Calculate how many icons fit
        const maxCols = Math.floor(availableWidth / iconTotalWidth);
        const maxRows = Math.floor(availableHeight / iconTotalHeight);
        const maxIcons = maxCols * maxRows;
        
        // Determine layout mode
        let layoutMode = this.settings.layoutMode;
        if (layoutMode === 'auto') {
            // Auto-detect best layout based on screen dimensions
            if (viewport.width < 480) {
                layoutMode = maxCols <= 2 ? 'list' : 'grid';
            } else if (viewport.width < 768) {
                layoutMode = maxCols <= 4 ? 'grid' : 'grid';
            } else {
                layoutMode = 'grid';
            }
        }
        
        // Calculate columns based on settings or auto-detection
        let columns;
        if (this.settings.maxIconsPerRow === 'auto') {
            if (layoutMode === 'list') {
                columns = 1;
            } else {
                columns = Math.min(maxCols, 6); // Cap at 6 for usability
            }
        } else {
            columns = Math.min(parseInt(this.settings.maxIconsPerRow), maxCols);
        }
        
        return {
            mode: layoutMode,
            columns: columns,
            maxIcons: maxIcons,
            iconConfig: iconConfig,
            spacing: spacing,
            canFitAllApps: this.registeredApps.size <= maxIcons
        };
    },

    updateLayout() {
        if (!this.iconsContainer) return;
        
        this.currentLayout = this.calculateOptimalLayout();
        this.applyLayoutStyles();
        this.renderIcons();
    },

    applyLayoutStyles() {
        const { mode, columns, iconConfig, spacing } = this.currentLayout;
        
        // Clear existing styles
        this.iconsContainer.className = 'icons-container';
        
        // Apply layout-specific styles
        const styles = {
            display: mode === 'list' ? 'flex' : 'grid',
            flexDirection: mode === 'list' ? 'column' : undefined,
            gridTemplateColumns: mode === 'grid' ? `repeat(${columns}, 1fr)` : undefined,
            gap: spacing.gap,
            padding: spacing.margin,
            maxHeight: '100%',
            overflowY: 'auto',
            overflowX: 'hidden'
        };
        
        Object.assign(this.iconsContainer.style, styles);
        
        // Add CSS class for mode-specific styling
        this.iconsContainer.classList.add(`layout-${mode}`);
    },

    renderIcons() {
        if (!this.iconsContainer) return;
        
        // Clear existing icons
        this.iconsContainer.innerHTML = '';
        
        // Filter visible apps
        const visibleApps = Array.from(this.registeredApps.values())
            .filter(app => !this.hiddenApps.has(app.id) && !this.systemApps.has(app.id));
        
        // Check if we need to show a subset due to space constraints
        const { maxIcons, canFitAllApps } = this.currentLayout;
        
        if (!canFitAllApps && visibleApps.length > maxIcons) {
            // Show most recently used apps first, then alphabetical
            const recentApps = JSON.parse(localStorage.getItem('webos-recent-apps') || '[]');
            visibleApps.sort((a, b) => {
                const aIndex = recentApps.indexOf(a.id);
                const bIndex = recentApps.indexOf(b.id);
                
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                return a.name.localeCompare(b.name);
            });
            
            // Trim to fit available space, but leave room for "more apps" indicator
            visibleApps.splice(maxIcons - 1);
        }
        
        // Render icons
        visibleApps.forEach(app => this.createIcon(app));
        
        // Add "more apps" icon if needed
        if (!canFitAllApps && this.registeredApps.size > visibleApps.length) {
            this.createMoreAppsIcon();
        }
        
        // Apply icon-specific styles
        this.applyIconStyles();
    },

    createIcon(app) {
        const { iconConfig } = this.currentLayout;
        const { mode } = this.currentLayout;
        
        const iconElement = document.createElement('div');
        iconElement.className = 'desktop-icon';
        iconElement.dataset.appId = app.id;
        
        const iconImg = document.createElement('img');
        iconImg.src = app.icon || this.getDefaultIcon();
        iconImg.alt = app.name;
        iconImg.style.cssText = `
            width: ${iconConfig.size}px;
            height: ${iconConfig.size}px;
            object-fit: contain;
        `;
        
        iconElement.appendChild(iconImg);
        
        if (this.settings.showLabels) {
            const label = document.createElement('span');
            label.textContent = app.name;
            label.style.cssText = `
                font-size: ${iconConfig.fontSize};
                text-align: center;
                color: white;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
                margin-top: 4px;
                word-wrap: break-word;
                max-width: ${iconConfig.size + 20}px;
                display: block;
            `;
            iconElement.appendChild(label);
        }
        
        // Apply icon container styles
        iconElement.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            padding: ${iconConfig.padding};
            border-radius: 8px;
            transition: background-color 0.2s;
            user-select: none;
            ${mode === 'list' ? 'flex-direction: row; text-align: left;' : ''}
        `;
        
        // Hover effect
        iconElement.onmouseover = () => {
            iconElement.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        };
        iconElement.onmouseout = () => {
            iconElement.style.backgroundColor = 'transparent';
        };
        
        // FIX: The multi-instance issue is addressed here.
        // It uses `addEventListener` for a cleaner, more robust event handling
        // and removes the conflicting `ontouchend` property.
        const openApp = (e) => {
            // Prevent default behavior and event bubbling
            e.preventDefault();
            e.stopPropagation();
            if (window.AppRegistry) {
                window.AppRegistry.openApp(app.id);
            }
        };

        if (this.settings.doubleClickToOpen) {
            iconElement.addEventListener('dblclick', openApp);
        } else {
            iconElement.addEventListener('click', openApp);
        }
        
        this.iconsContainer.appendChild(iconElement);
    },

    createMoreAppsIcon() {
        const { iconConfig } = this.currentLayout;
        
        const moreIcon = document.createElement('div');
        moreIcon.className = 'desktop-icon more-apps';
        moreIcon.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            padding: ${iconConfig.padding};
            border-radius: 8px;
            background-color: rgba(255, 255, 255, 0.1);
            border: 2px dashed rgba(255, 255, 255, 0.3);
        `;
        
        const icon = document.createElement('div');
        icon.style.cssText = `
            width: ${iconConfig.size}px;
            height: ${iconConfig.size}px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${iconConfig.size / 2}px;
            color: white;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
        `;
        icon.textContent = '⋯';
        
        if (this.settings.showLabels) {
            const label = document.createElement('span');
            label.textContent = 'More Apps';
            label.style.cssText = `
                font-size: ${iconConfig.fontSize};
                text-align: center;
                color: white;
                margin-top: 4px;
            `;
            moreIcon.appendChild(icon);
            moreIcon.appendChild(label);
        } else {
            moreIcon.appendChild(icon);
        }
        
        // Click to open start menu
        moreIcon.onclick = () => {
            if (window.AppRegistry) {
                window.AppRegistry.openApp('startmenu');
            }
        };
        
        this.iconsContainer.appendChild(moreIcon);
    },

    applyIconStyles() {
        // Add responsive scrolling for overflow
        if (this.iconsContainer.scrollHeight > this.iconsContainer.clientHeight) {
            this.iconsContainer.style.overflowY = 'auto';
            this.iconsContainer.style.scrollbarWidth = 'thin';
        }
    },

    getDefaultIcon() {
        return "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='48' height='48' fill='%23666' rx='8'/><text x='24' y='30' text-anchor='middle' font-size='12' fill='white'>App</text></svg>";
    },

    // Public API for settings app
    getSettings() {
        return { ...this.settings };
    },

    hideApp(appId) {
        this.hiddenApps.add(appId);
        this.saveSettings();
        this.updateLayout();
    },

    showApp(appId) {
        this.hiddenApps.delete(appId);
        this.saveSettings();
        this.updateLayout();
    },

    getVisibleApps() {
        return Array.from(this.registeredApps.values())
            .filter(app => !this.hiddenApps.has(app.id) && !this.systemApps.has(app.id));
    },

    getAllApps() {
        return Array.from(this.registeredApps.values());
    },

    // Utility function for debouncing resize events
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.DesktopIconManager.init();
});

// Also init immediately if DOM already loaded
if (document.readyState !== 'loading') {
    window.DesktopIconManager.init();
}


//*******************

