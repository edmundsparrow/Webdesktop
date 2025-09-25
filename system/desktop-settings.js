// desktop-settings.js - Desktop Settings Application
/**
 * FILE: applications/desktop-settings.js
 * VERSION: 1.0.0
 * BUILD DATE: 2025-09-24
 *
 * PURPOSE:
 * Provides a unified control panel for customizing the WebDesktop experience,
 * including theme selection, desktop icon layout, app visibility, and basic
 * screen information. Designed to act as a lightweight system settings app.
 *
 * ARCHITECTURE:
 * - IIFE pattern with window.DesktopSettingsApp namespace
 * - Registered as a system app (hidden from desktop by default)
 * - Uses WindowManager for a scrollable multi-section UI
 * - Delegates theme changes to ThemeManager and icon changes to DesktopIconManager
 * - LocalStorage persistence for theme selection
 *
 * LIFECYCLE:
 * 1. User launches Desktop Settings from AppRegistry
 * 2. WindowManager creates settings window
 * 3. Form elements populated with current ThemeManager + DesktopIconManager state
 * 4. User changes values and previews them live
 * 5. Apply/Reset buttons persist changes and broadcast events
 *
 * EXTENSION POINTS:
 * - Add new sections (e.g. wallpapers, taskbar, accessibility)
 * - Integrate network or user profile settings
 * - Provide export/import of desktop configurations
 *
 * INTEGRATION:
 * - ThemeManager (for theme dropdown and persistence)
 * - DesktopIconManager (for layout, visibility, and interaction mode)
 * - WindowManager (for settings UI)
 * - EventBus / CustomEvents for broadcasting settings updates
 *
 * CREDITS:
 * edmundsparrow.netlify.app | whatsappme @ 09024054758 | webaplications5050@gmail.com
 *
 * NOTES:
 * - Settings changes are event-driven and do not require app reload
 * - Screen info section is read-only and updates dynamically
 * - Feedback system provides contextual success/info/error messages
 * - Designed to be easily extended without breaking core apps
 */

// INSTALLER/APPLICATIONS/DESKTOP-SETTINGS.JS - System Settings App
(function() {
    
    const DesktopSettingsApp = {
        init() {
            // Register as system app (won't appear on desktop)
            if (window.AppRegistry) {
                window.AppRegistry.registerApp({
                    id: 'desktop-settings',
                    name: 'Desktop Settings',
                    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><circle cx='24' cy='24' r='20' fill='%23444'/><circle cx='24' cy='24' r='8' fill='none' stroke='white' stroke-width='2'/><path d='M24 4v4M24 40v4M44 24h-4M8 24H4M37.2 10.8l-2.8 2.8M13.6 35.4l-2.8 2.8M37.2 37.2l-2.8-2.8M13.6 12.6l-2.8-2.8' stroke='white' stroke-width='2'/></svg>",
                    handler: this.open.bind(this),
                    singleInstance: true
                });
            }
        },

        open() {
            const settingsHTML = this.createSettingsHTML();
            
            const win = window.WindowManager.createWindow(
                'Desktop Settings', 
                settingsHTML, 
                480, 
                560 // Accommodates theme section
            );
            
            this.setupEventHandlers(win);
            this.loadCurrentSettings(win);
        },

        createSettingsHTML() {
            return `
                <div class="desktop-settings-app" style="height:100%;font-family:'Segoe UI',Arial,sans-serif;padding:16px;overflow-y:auto;background:var(--bg-primary);color:var(--text-primary);">
                    
                    <div style="margin-bottom: 20px; text-align: center;">
                        <h2 style="margin:0;font-size:24px;">Desktop Settings</h2>
                        <p style="margin:8px 0 0;font-size:14px;">Customize your desktop appearance</p>
                    </div>

                    <div class="settings-section" style="background:var(--bg-secondary);border-radius:8px;padding:16px;margin-bottom:16px;box-shadow:0 2px 4px var(--shadow);">
                        <h3 style="margin-top:0;font-size:16px;border-bottom:1px solid var(--border-color);padding-bottom:8px;">Theme</h3>
                        <div class="setting-group">
                            <label style="display:block;font-weight:600;margin-bottom:4px;">Select Theme</label>
                            <select id="themeSelect" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:4px;font-size:14px;background:var(--input-bg);color:var(--text-primary);">
                                </select>
                        </div>
                    </div>

                    <div class="settings-section" style="
                        background: var(--bg-secondary);
                        border-radius: 8px;
                        padding: 16px;
                        margin-bottom: 16px;
                        box-shadow: 0 2px 4px var(--shadow);
                    ">
                        <h3 style="margin-top: 0; font-size: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">Icon Display</h3>
                        
                        <div style="display: grid; gap: 12px;">
                            <div class="setting-group">
                                <label style="display: block; font-weight: 600; margin-bottom: 4px;">Icon Size</label>
                                <select id="iconSize" style="
                                    width: 100%;
                                    padding: 8px;
                                    border: 1px solid var(--border-color);
                                    border-radius: 4px;
                                    font-size: 14px;
                                    background:var(--input-bg);color:var(--text-primary);
                                ">
                                    <option value="small">Small (32px)</option>
                                    <option value="medium">Medium (48px)</option>
                                    <option value="large">Large (64px)</option>
                                </select>
                            </div>

                            <div class="setting-group">
                                <label style="display: block; font-weight: 600; margin-bottom: 4px;">Layout Mode</label>
                                <select id="layoutMode" style="
                                    width: 100%;
                                    padding: 8px;
                                    border: 1px solid var(--border-color);
                                    border-radius: 4px;
                                    font-size: 14px;
                                    background:var(--input-bg);color:var(--text-primary);
                                ">
                                    <option value="auto">Auto (Adapt to screen)</option>
                                    <option value="grid">Grid Layout</option>
                                    <option value="list">List Layout</option>
                                </select>
                            </div>

                            <div class="setting-group">
                                <label style="display: block; font-weight: 600; margin-bottom: 4px;">Icons Per Row</label>
                                <select id="maxIconsPerRow" style="
                                    width: 100%;
                                    padding: 8px;
                                    border: 1px solid var(--border-color);
                                    border-radius: 4px;
                                    font-size: 14px;
                                    background:var(--input-bg);color:var(--text-primary);
                                ">
                                    <option value="auto">Auto</option>
                                    <option value="2">2 icons</option>
                                    <option value="3">3 icons</option>
                                    <option value="4">4 icons</option>
                                    <option value="5">5 icons</option>
                                    <option value="6">6 icons</option>
                                </select>
                            </div>

                            <div class="setting-group">
                                <label style="display: block; font-weight: 600; margin-bottom: 4px;">Icon Spacing</label>
                                <select id="iconSpacing" style="
                                    width: 100%;
                                    padding: 8px;
                                    border: 1px solid var(--border-color);
                                    border-radius: 4px;
                                    font-size: 14px;
                                    background:var(--input-bg);color:var(--text-primary);
                                ">
                                    <option value="tight">Tight</option>
                                    <option value="normal">Normal</option>
                                    <option value="loose">Loose</option>
                                </select>
                            </div>

                            <div class="setting-group">
                                <label style="
                                    display: flex;
                                    align-items: center;
                                    font-weight: 600;
                                    cursor: pointer;
                                ">
                                    <input type="checkbox" id="showLabels" style="margin-right: 8px;">
                                    Show icon labels
                                </label>
                            </div>

                            <div class="setting-group">
                                <label style="
                                    display: flex;
                                    align-items: center;
                                    font-weight: 600;
                                    cursor: pointer;
                                ">
                                    <input type="checkbox" id="doubleClickToOpen" style="margin-right: 8px;">
                                    Double-click to open apps
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="settings-section" style="
                        background: var(--bg-secondary);
                        border-radius: 8px;
                        padding: 16px;
                        margin-bottom: 16px;
                        box-shadow: 0 2px 4px var(--shadow);
                    ">
                        <h3 style="margin-top: 0; font-size: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">Desktop Apps Visibility</h3>
                        <p style="margin: 8px 0 12px; font-size: 12px;">Choose which apps appear on your desktop</p>
                        
                        <div id="appVisibilityList" style="max-height: 200px; overflow-y: auto;">
                            </div>
                    </div>

                    <div class="settings-section" style="
                        background: var(--bg-info);
                        border-radius: 8px;
                        padding: 16px;
                        border-left: 4px solid var(--info-color);
                    ">
                        <h3 style="margin-top: 0; font-size: 16px;">Screen Information</h3>
                        <div id="screenInfo" style="font-size: 12px; font-family: monospace;">
                            </div>
                    </div>

                    <div style="margin-top: 20px; display: flex; gap: 12px; justify-content: flex-end;">
                        <button id="resetSettings" style="
                            padding: 10px 16px;
                            background: var(--btn-danger-bg);
                            color: var(--btn-danger-text);
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                        ">Reset to Defaults</button>
                        <button id="applySettings" style="
                            padding: 10px 16px;
                            background: var(--btn-success-bg);
                            color: var(--btn-success-text);
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                        ">Apply Settings</button>
                    </div>
                </div>
            `;
        },

        setupEventHandlers(win) {
            const applyBtn = win.querySelector('#applySettings');
            const resetBtn = win.querySelector('#resetSettings');
            
            // Apply settings
            applyBtn.addEventListener('click', () => {
                this.applySettings(win);
            });
            
            // Reset settings
            resetBtn.addEventListener('click', () => {
                this.resetSettings(win);
            });

            // Live preview on change
            const settingsInputs = win.querySelectorAll('select, input');
            settingsInputs.forEach(input => {
                input.addEventListener('change', () => {
                    this.previewSettings(win);
                });
            });

            // Theme change handler
            const themeSelect = win.querySelector('#themeSelect');
            if (themeSelect) {
                themeSelect.addEventListener('change', (e) => {
                    if (window.ThemeManager) {
                        const selectedThemeId = e.target.value;
                        const selectedOption = e.target.options[e.target.selectedIndex].textContent;
                        
                        ThemeManager.setTheme(selectedThemeId);
                        
                        // Persist chosen theme
                        localStorage.setItem('selectedTheme', selectedThemeId);

                        // Consistent/Friendly feedback text
                        this.showFeedback(win, `Theme switched to ${selectedOption}`, 'success');
                    }
                });
            }
        },

        loadCurrentSettings(win) {
            // Load available themes
            if (window.ThemeManager) {
                const themeSelect = win.querySelector('#themeSelect');
                const availableThemes = window.ThemeManager.getAvailableThemes ? window.ThemeManager.getAvailableThemes() : [];
                
                themeSelect.innerHTML = '';
                
                if (availableThemes.length === 0) {
                    // Fallback if no themes are found
                    themeSelect.innerHTML = '<option value="" disabled>No themes available</option>';
                    themeSelect.disabled = true;
                } else {
                    themeSelect.disabled = false;
                    const currentThemeId = window.ThemeManager.getCurrentTheme ? window.ThemeManager.getCurrentTheme() : null;
                    
                    availableThemes.forEach(t => {
                        const option = document.createElement('option');
                        option.value = t.id;
                        option.textContent = t.name;
                        
                        if (t.id === currentThemeId) {
                            option.selected = true;
                        }
                        themeSelect.appendChild(option);
                    });
                }
            }

            // Load desktop icon settings
            if (!window.DesktopIconManager) return;
            
            const currentSettings = window.DesktopIconManager.getSettings();
            
            // Apply to form
            win.querySelector('#iconSize').value = currentSettings.iconSize;
            win.querySelector('#layoutMode').value = currentSettings.layoutMode;
            win.querySelector('#maxIconsPerRow').value = currentSettings.maxIconsPerRow;
            win.querySelector('#iconSpacing').value = currentSettings.iconSpacing;
            win.querySelector('#showLabels').checked = currentSettings.showLabels;
            win.querySelector('#doubleClickToOpen').checked = currentSettings.doubleClickToOpen;
            
            // Populate apps list
            this.populateAppsVisibility(win);
            
            // Update screen info
            this.updateScreenInfo(win);
        },

        populateAppsVisibility(win) {
            const container = win.querySelector('#appVisibilityList');
            if (!container || !window.DesktopIconManager) return;
            
            const allApps = window.DesktopIconManager.getAllApps();
            const hiddenApps = window.DesktopIconManager.hiddenApps;
            
            container.innerHTML = '';
            
            if (allApps.length === 0) {
                container.innerHTML = '<p style="color: var(--text-muted); font-style: italic;">No apps available</p>';
                return;
            }
            
            allApps.forEach(app => {
                const isHidden = hiddenApps.has(app.id);
                const isSystemApp = window.DesktopIconManager.systemApps.has(app.id);
                
                if (isSystemApp) return; // Don't show system apps
                
                const appItem = document.createElement('div');
                appItem.style.cssText = `
                    display: flex;
                    align-items: center;
                    padding: 8px;
                    margin: 4px 0;
                    border-radius: 4px;
                    background: ${isHidden ? 'var(--bg-warning-light)' : 'var(--bg-success-light)'};
                    border: 1px solid ${isHidden ? 'var(--warning-color)' : 'var(--success-color)'};
                `;
                
                appItem.innerHTML = `
                    <img src="${app.icon}" alt="${app.name}" style="
                        width: 24px;
                        height: 24px;
                        margin-right: 12px;
                        border-radius: 4px;
                    ">
                    <span style="flex: 1; font-weight: 500;">${app.name}</span>
                    <button data-app-id="${app.id}" class="toggle-visibility-btn" style="
                        padding: 4px 12px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 12px;
                        background: ${isHidden ? 'var(--btn-danger-bg)' : 'var(--btn-success-bg)'};
                        color: white;
                    ">${isHidden ? 'Show' : 'Hide'}</button>
                `;
                
                // Add click handler
                const toggleBtn = appItem.querySelector('.toggle-visibility-btn');
                toggleBtn.addEventListener('click', () => {
                    const appId = toggleBtn.dataset.appId;
                    const isCurrentlyHidden = hiddenApps.has(appId);
                    
                    if (isCurrentlyHidden) {
                        window.DesktopIconManager.showApp(appId);
                    } else {
                        window.DesktopIconManager.hideApp(appId);
                    }
                    
                    // Refresh the list
                    this.populateAppsVisibility(win);
                });
                
                container.appendChild(appItem);
            });
        },

        updateScreenInfo(win) {
            const infoContainer = win.querySelector('#screenInfo');
            if (!infoContainer) return;
            
            const viewport = {
                width: window.innerWidth,
                height: window.innerHeight
            };
            
            const layout = window.DesktopIconManager ? 
                window.DesktopIconManager.currentLayout : null;
            
            infoContainer.innerHTML = `
                Screen Size: ${viewport.width} × ${viewport.height}px<br>
                Available Height: ${viewport.height - 40}px (minus taskbar)<br>
                Device Type: ${viewport.width <= 480 ? 'Mobile' : viewport.width <= 768 ? 'Tablet' : 'Desktop'}<br>
                ${layout ? `Current Layout: ${layout.mode} (${layout.columns} columns)<br>` : ''}
                ${layout ? `Max Icons: ${layout.maxIcons}<br>` : ''}
                ${layout ? `Can Fit All Apps: ${layout.canFitAllApps ? 'Yes' : 'No'}` : ''}
            `;
        },

        applySettings(win) {
            if (!window.DesktopIconManager) return;
            
            const newSettings = {
                iconSize: win.querySelector('#iconSize').value,
                layoutMode: win.querySelector('#layoutMode').value,
                maxIconsPerRow: win.querySelector('#maxIconsPerRow').value,
                iconSpacing: win.querySelector('#iconSpacing').value,
                showLabels: win.querySelector('#showLabels').checked,
                doubleClickToOpen: win.querySelector('#doubleClickToOpen').checked
            };
            
            // Dispatch custom event for DesktopIconManager
            window.dispatchEvent(new CustomEvent('desktop-settings-changed', {
                detail: newSettings
            }));
            
            // Update screen info
            setTimeout(() => this.updateScreenInfo(win), 100);
            
            // Show feedback
            this.showFeedback(win, 'Settings applied successfully!', 'success');
        },

        previewSettings(win) {
            // Live preview - apply settings without saving
            this.applySettings(win);
        },

        resetSettings(win) {
            const defaultSettings = {
                iconSize: 'medium',
                layoutMode: 'auto',
                maxIconsPerRow: 'auto',
                iconSpacing: 'normal',
                showLabels: true,
                doubleClickToOpen: true
            };
            
            // Apply to form
            win.querySelector('#iconSize').value = defaultSettings.iconSize;
            win.querySelector('#layoutMode').value = defaultSettings.layoutMode;
            win.querySelector('#maxIconsPerRow').value = defaultSettings.maxIconsPerRow;
            win.querySelector('#iconSpacing').value = defaultSettings.iconSpacing;
            win.querySelector('#showLabels').checked = defaultSettings.showLabels;
            win.querySelector('#doubleClickToOpen').checked = defaultSettings.doubleClickToOpen;
            
            // Apply settings
            this.applySettings(win);
            
            this.showFeedback(win, 'Settings reset to defaults!', 'info');
        },

        showFeedback(win, message, type = 'info') {
            // Create feedback element
            const feedback = document.createElement('div');
            feedback.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 16px;
                border-radius: 4px;
                color: white;
                font-weight: 600;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s ease;
                background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : 'var(--info-color)'};
            `;
            feedback.textContent = message;
            
            if (win instanceof HTMLElement) {
                win.appendChild(feedback);
            } else {
                return; 
            }
            
            // Animate in
            setTimeout(() => feedback.style.opacity = '1', 10);
            
            // Remove after delay
            setTimeout(() => {
                feedback.style.opacity = '0';
                setTimeout(() => feedback.remove(), 300);
            }, 2000);
        }
    };

    // Initialize the settings app
    DesktopSettingsApp.init();

    // Export for external access
    window.DesktopSettingsApp = DesktopSettingsApp;

})();


// Documentation Registration for docs.js
if (window.Docs) {
  window.Docs.registerDocumentation('desktop-settings', {
    name: "Desktop Settings",
    version: "1.0.0",
    description: "System settings app for customizing themes, desktop icon layout, app visibility, and screen information.",
    type: "System App",
    features: [
      "Theme switching with ThemeManager integration",
      "Desktop icon layout customization (size, spacing, labels, double-click)",
      "App visibility controls with show/hide toggles",
      "Screen information (resolution, device type, layout)",
      "Reset and Apply buttons with instant feedback"
    ],
    dependencies: ["WindowManager", "AppRegistry", "ThemeManager", "DesktopIconManager"],
    methods: [
      { name: "open", description: "Creates the Desktop Settings window with all available sections" },
      { name: "applySettings", description: "Applies new icon and layout settings via event dispatch" },
      { name: "previewSettings", description: "Provides live preview of settings before applying" },
      { name: "resetSettings", description: "Restores default settings and updates UI" },
      { name: "populateAppsVisibility", description: "Generates visibility toggles for all registered apps" },
      { name: "updateScreenInfo", description: "Updates live screen resolution and layout info" }
    ],
    notes: "Designed as a modular system app. Uses CSS variables and CustomEvents for maximum extensibility.",
    cudos: "edmundsparrow.netlify.app | whatsappme @ 09024054758 | webaplications5050@gmail.com",
    auto_generated: false
  });
}
