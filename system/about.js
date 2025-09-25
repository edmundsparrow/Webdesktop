// INSTALLER/APPLICATIONS/ABOUT.JS - System Documentation Viewer
/**
 * FILE: installer/applications/about.js
 * VERSION: 1.1
 * BUILD DATE: 2025-09-22
 *
 * PURPOSE:
 *   A system documentation viewer that presents collected documentation for
 *   all registered applications and core services. Provides search, filtering,
 *   highlighting, and detailed rendering (including CUDOS / appreciation).
 *
 * ARCHITECTURE:
 *   - Single-instance app exposed as window.AboutApp
 *   - UI rendered into a window created by WindowManager.createWindow()
 *   - Data source: window.Docs service (core documentation registry)
 *   - Presentation: sidebar list + main content area for detailed docs
 *
 * LIFECYCLE:
 *   1. AppRegistry launches AboutApp.open()
 *   2. AboutApp creates window shell and binds UI handlers
 *   3. AboutApp ensures Docs service initialized and requests docs
 *   4. User searches, filters or selects items to view full documentation
 *   5. Window close cleans up transient listeners (WindowManager usually handles DOM removal)
 *
 * EXTENSION POINTS:
 *   - Add pagination / lazy loading for very large doc sets
 *   - Allow editing / submitting documentation from the About UI (with permission)
 *   - Add export/import UI and version history view
 *   - Link "Open" controls to launch the actual app from the docs panel
 *
 * CUDOS:
 *   edmundsparrow.netlify.app | whatsappme @ 09024054758 | webaplications5050@gmail.com
 *
 * NOTES:
 *   - This viewer expects window.Docs (Docs service) to be available; it will
 *     gracefully operate in a degraded mode if Docs is missing (shows helpful message).
 *   - Registered docs may include additional fields (cudos, category, repo, tags).
 */

(function() {
  // Expose AboutApp namespace
  window.AboutApp = {
    currentWindow: null,
    currentFilter: 'all',   // 'all' | 'system' | 'user' | 'undocumented'
    searchQuery: '',

    open() {
      // If single instance is enforced by AppRegistry, opening twice is handled there.
      const aboutHTML = this.createAboutHTML();
      const win = window.WindowManager.createWindow('System Documentation', aboutHTML, 900, 650);
      this.currentWindow = win;

      // Setup handlers and load data
      this.setupEventHandlers(win);
      this.loadDocumentation(win);
      return win;
    },

    createAboutHTML() {
      return `
        <div class="about-app" style="
            display: flex;
            height: 100%;
            font-family: 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        ">
          <!-- Sidebar -->
          <div class="about-sidebar" style="
              width: 280px;
              background: linear-gradient(180deg, #343a40 0%, #495057 100%);
              color: white;
              display: flex;
              flex-direction: column;
              border-right: 1px solid #dee2e6;
          ">
            <div style="
                padding: 20px;
                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                text-align: center;
                box-shadow: inset 0 -1px 0 rgba(255,255,255,0.1);
            ">
              <h2 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">Webdesktop-by-edmundsparrow</h2>
              <p style="margin: 0; font-size: 12px; opacity: 0.9;">System Documentation</p>
            </div>

            <div style="padding: 16px;">
              <input type="text" id="doc-search" placeholder="Search documentation..." style="
                width: 100%;
                padding: 10px 12px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                background: rgba(255,255,255,0.08);
                color: white;
                box-sizing: border-box;
              " />
            </div>

            <div style="padding: 0 16px 16px;">
              <div class="filter-group">
                <button class="filter-btn active" data-filter="all" style="
                    width: 100%;
                    padding: 8px 12px;
                    margin: 2px 0;
                    border: none;
                    border-radius: 4px;
                    background: rgba(255,255,255,0.2);
                    color: white;
                    cursor: pointer;
                    font-size: 13px;
                    text-align: left;
                ">📚 All Apps (<span id="count-all">0</span>)</button>

                <button class="filter-btn" data-filter="system" style="
                    width: 100%;
                    padding: 8px 12px;
                    margin: 2px 0;
                    border: none;
                    border-radius: 4px;
                    background: transparent;
                    color: rgba(255,255,255,0.8);
                    cursor: pointer;
                    font-size: 13px;
                    text-align: left;
                ">⚙️ System Apps (<span id="count-system">0</span>)</button>

                <button class="filter-btn" data-filter="user" style="
                    width: 100%;
                    padding: 8px 12px;
                    margin: 2px 0;
                    border: none;
                    border-radius: 4px;
                    background: transparent;
                    color: rgba(255,255,255,0.8);
                    cursor: pointer;
                    font-size: 13px;
                    text-align: left;
                ">👤 User Apps (<span id="count-user">0</span>)</button>

                <button class="filter-btn" data-filter="undocumented" style="
                    width: 100%;
                    padding: 8px 12px;
                    margin: 2px 0;
                    border: none;
                    border-radius: 4px;
                    background: transparent;
                    color: rgba(255,255,255,0.8);
                    cursor: pointer;
                    font-size: 13px;
                    text-align: left;
                ">⚠️ Auto-Generated (<span id="count-undoc">0</span>)</button>
              </div>
            </div>

            <div id="app-list" style="
                flex: 1;
                padding: 0 8px;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: rgba(255,255,255,0.3) transparent;
            "></div>

            <div style="
                padding: 12px 16px;
                border-top: 1px solid rgba(255,255,255,0.1);
                font-size: 11px;
                color: rgba(255,255,255,0.6);
                text-align: center;
            ">
              <div id="doc-stats">Loading documentation...</div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="about-content" style="
              flex: 1;
              display: flex;
              flex-direction: column;
              background: white;
          ">
            <div id="content-header" style="
                padding: 20px 24px;
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-bottom: 1px solid #dee2e6;
                display: none;
            ">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <h1 id="app-title" style="margin: 0 0 4px 0; font-size: 24px; color: #212529;"></h1>
                  <p id="app-version" style="margin: 0; color: #6c757d; font-size: 14px;"></p>
                </div>
                <div id="app-type-badge" style="
                    padding: 4px 12px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    background: #e9ecef;
                    color: #495057;
                "></div>
              </div>
            </div>

            <div id="doc-content" style="
                flex: 1;
                padding: 24px;
                overflow-y: auto;
                line-height: 1.6;
            ">
              <div class="welcome-screen" style="
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  height:100%;
                  text-align:center;
                  color:#6c757d;
              ">
                <div>
                  <div style="font-size:64px;margin-bottom:16px;">📖</div>
                  <h3 style="margin:0 0 8px 0; color:#495057;">System Documentation</h3>
                  <p style="margin:0; max-width:300px;">
                    Select an application from the sidebar to view its documentation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    setupEventHandlers(win) {
      const searchInput = win.querySelector('#doc-search');
      const filterBtns = win.querySelectorAll('.filter-btn');
      const appList = win.querySelector('#app-list');

      // Search
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.updateAppList(win);
      });

      // Filters
      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => {
            b.classList.remove('active');
            b.style.background = 'transparent';
            b.style.color = 'rgba(255,255,255,0.8)';
          });
          btn.classList.add('active');
          btn.style.background = 'rgba(255,255,255,0.2)';
          btn.style.color = 'white';

          this.currentFilter = btn.dataset.filter;
          this.updateAppList(win);
        });
      });

      // App selection (event delegation)
      appList.addEventListener('click', (e) => {
        const appItem = e.target.closest('.app-item');
        if (!appItem) return;
        const appId = appItem.dataset.appId;
        // highlight
        win.querySelectorAll('.app-item').forEach(item => item.style.background = 'transparent');
        appItem.style.background = 'rgba(255,255,255,0.08)';
        this.selectApp(win, appId);
      });
    },

    loadDocumentation(win) {
      // Ensure Docs service is initialized (Docs may auto-init on load)
      if (window.Docs && !window.Docs.isInitialized) {
        try { window.Docs.init(); } catch (e) { /* ignore */ }
      }

      // Slight delay to allow Docs to collect registrations
      setTimeout(() => {
        this.updateAppList(win);
        this.updateStats(win);
      }, 200);
    },

    updateAppList(win) {
      const appList = win.querySelector('#app-list');
      if (!window.Docs) {
        appList.innerHTML = '<div style="padding:20px;color:rgba(255,255,255,0.6);">Docs service not available</div>';
        return;
      }

      let docs = window.Docs.getAllDocumentation();

      // If search query present, use Docs.searchDocumentation to get relevance ordering
      if (this.searchQuery) {
        const searchResults = window.Docs.searchDocumentation(this.searchQuery);
        // searchDocumentation returns docs with relevance and id, normalize back to doc objects
        docs = searchResults.map(r => {
          // some implementations return full doc, others return subset - ensure we have full doc
          const d = window.Docs.getDocumentation(r.id) || r;
          return { ...d, relevance: r.relevance || 0 };
        });
      }

      // Apply filter
      if (this.currentFilter !== 'all') {
        if (this.currentFilter === 'system') {
          docs = docs.filter(doc => doc.type === 'System App' || doc.type === 'System Service' || doc.type === 'Service');
        } else if (this.currentFilter === 'user') {
          docs = docs.filter(doc => doc.type === 'User App');
        } else if (this.currentFilter === 'undocumented') {
          docs = docs.filter(doc => doc.auto_generated);
        }
      }

      if (!docs || docs.length === 0) {
        appList.innerHTML = `
          <div style="padding:20px;color:rgba(255,255,255,0.6);text-align:center;">
            ${this.searchQuery ? 'No apps match your search' : 'No apps found'}
          </div>
        `;
        return;
      }

      // Render list
      appList.innerHTML = docs.map(doc => {
        const name = this.highlightSearchTerm(doc.name || doc.id);
        const desc = (doc.description || '').substring(0, 60);
        const shortDesc = this.highlightSearchTerm(desc) + ((doc.description || '').length > 60 ? '...' : '');
        const version = doc.version || '1.0';
        const type = doc.type || (doc.auto_generated ? 'User App' : 'User App');
        const color = this.getAppTypeColor(type);
        return `
          <div class="app-item" data-app-id="${doc.id}" style="
              padding: 12px 8px;
              margin: 4px 0;
              border-radius: 6px;
              cursor: pointer;
              transition: background-color 0.2s;
              border-left: 3px solid ${color};
          ">
              <div style="font-weight: 500; font-size: 14px; margin-bottom: 2px;">${name}</div>
              <div style="font-size: 11px; opacity: 0.7; margin-bottom: 4px;">v${version} • ${type}</div>
              <div style="font-size: 12px; opacity: 0.8; line-height: 1.3;">${shortDesc}</div>
          </div>
        `;
      }).join('');
    },

    selectApp(win, appId) {
      const doc = window.Docs ? window.Docs.getDocumentation(appId) : null;
      if (!doc) return;

      // Show header
      const header = win.querySelector('#content-header');
      header.style.display = 'block';
      win.querySelector('#app-title').textContent = doc.name || appId;
      win.querySelector('#app-version').textContent = `Version ${doc.version || '1.0'}`;

      const badge = win.querySelector('#app-type-badge');
      badge.textContent = doc.type || (doc.auto_generated ? 'User App' : 'App');
      badge.style.background = this.getAppTypeColor(doc.type || 'User App');
      badge.style.color = 'white';

      // Render content
      const content = win.querySelector('#doc-content');
      content.innerHTML = this.renderDocumentation(doc);
    },

    renderDocumentation(doc) {
      // Build HTML sections: Description, Features, Methods, Dependencies, Notes, Cudos, Metadata
      let html = '';

      // Description
      html += `
        <div class="doc-section">
          <h3 style="color: #495057; margin: 0 0 12px 0; font-size: 18px;">Description</h3>
          <p style="margin: 0 0 20px 0; color: #6c757d;">${doc.description || 'No description provided.'}</p>
        </div>
      `;

      // Features
      if (doc.features && doc.features.length) {
        html += `
          <div class="doc-section">
            <h3 style="color: #495057; margin: 0 0 12px 0; font-size: 18px;">Features</h3>
            <ul style="margin: 0 0 20px 0; color: #6c757d;">
              ${doc.features.map(f => `<li style="margin-bottom:4px;">${f}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      // Methods
      if (doc.methods && doc.methods.length) {
        html += `
          <div class="doc-section">
            <h3 style="color: #495057; margin: 0 0 12px 0; font-size: 18px;">Methods</h3>
            <div style="margin: 0 0 20px 0;">
              ${doc.methods.map(method => `
                <div style="background:#f8f9fa;border:1px solid #e9ecef;border-radius:6px;padding:12px;margin-bottom:8px;">
                  <code style="background:#007bff;color:white;padding:2px 6px;border-radius:3px;font-size:13px;font-weight:600;">${method.name}</code>
                  <p style="margin:8px 0 0 0;color:#6c757d;font-size:14px;">${method.description || ''}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      // Dependencies
      if (doc.dependencies && doc.dependencies.length) {
        html += `
          <div class="doc-section">
            <h3 style="color: #495057; margin: 0 0 12px 0; font-size: 18px;">Dependencies</h3>
            <div style="margin: 0 0 20px 0;">
              ${doc.dependencies.map(dep => `<span style="background:#e9ecef;color:#495057;padding:4px 8px;border-radius:12px;font-size:12px;margin-right:6px;display:inline-block;margin-bottom:4px;">${dep}</span>`).join('')}
            </div>
          </div>
        `;
      }

      // Notes
      if (doc.notes) {
        html += `
          <div class="doc-section">
            <h3 style="color: #495057; margin: 0 0 12px 0; font-size: 18px;">Notes</h3>
            <div style="background:#fff3cd;border:1px solid #ffeaa7;border-radius:6px;padding:12px;margin:0 0 20px 0;color:#856404;">
              ${doc.notes}
            </div>
          </div>
        `;
      }

      // CUDOS / Appreciation
      if (doc.cudos) {
        html += `
          <div class="doc-section">
            <h3 style="color: #495057; margin: 0 0 12px 0; font-size: 18px;">Cudos / Appreciation</h3>
            <div style="background:#e8f7ff;border:1px solid #bfe9ff;border-radius:6px;padding:12px;margin:0 0 20px 0;color:#0277bd;font-size:14px;">
              ${this.escapeHtml(doc.cudos)}
            </div>
          </div>
        `;
      }

      // Auto-generated warning
      if (doc.auto_generated) {
        html += `
          <div class="doc-section">
            <div style="background:#f8d7da;border:1px solid #f5c6cb;border-radius:6px;padding:12px;margin:0 0 20px 0;color:#721c24;">
              <strong>⚠️ Auto-Generated Documentation</strong><br>
              This documentation was generated automatically. Please add proper documentation in the application source for better detail.
            </div>
          </div>
        `;
      }

      // Metadata block
      html += `
        <div class="doc-section">
          <h3 style="color: #495057; margin: 0 0 12px 0; font-size: 18px;">Metadata</h3>
          <div style="background:#f8f9fa;border-radius:6px;padding:12px;font-family:monospace;font-size:12px;color:#6c757d;">
            <div><strong>App ID:</strong> ${doc.id}</div>
            <div><strong>Version:</strong> ${doc.version || '1.0'}</div>
            <div><strong>Type:</strong> ${doc.type || (doc.auto_generated ? 'User App' : 'App')}</div>
            ${doc.lastUpdated ? `<div><strong>Last Updated:</strong> ${new Date(doc.lastUpdated).toLocaleString()}</div>` : ''}
            ${doc.repo ? `<div><strong>Repo:</strong> ${this.escapeHtml(doc.repo)}</div>` : ''}
          </div>
        </div>
      `;

      return html;
    },

    updateStats(win) {
      if (!window.Docs) return;
      const allDocs = window.Docs.getAllDocumentation();
      const systemDocs = allDocs.filter(d => d.type === 'System App' || d.type === 'System Service' || d.type === 'Service');
      const userDocs = allDocs.filter(d => d.type === 'User App');
      const undocumentedDocs = allDocs.filter(d => d.auto_generated);

      win.querySelector('#count-all').textContent = allDocs.length;
      win.querySelector('#count-system').textContent = systemDocs.length;
      win.querySelector('#count-user').textContent = userDocs.length;
      win.querySelector('#count-undoc').textContent = undocumentedDocs.length;

      win.querySelector('#doc-stats').innerHTML = `
        ${allDocs.length} apps documented<br>
        ${undocumentedDocs.length} need proper docs
      `;
    },

    getAppTypeColor(type) {
      const colors = {
        'System App': '#dc3545',
        'System Service': '#6f42c1',
        'User App': '#28a745',
        'Service': '#17a2b8'
      };
      return colors[type] || '#6c757d';
    },

    highlightSearchTerm(text) {
      if (!this.searchQuery || !text) return text || '';
      const escaped = this.searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');
      return (text || '').replace(regex, '<mark style="background:#ffeb3b;padding:1px 2px;border-radius:2px;">$1</mark>');
    },

    escapeHtml(str) {
      if (!str && str !== 0) return '';
      return String(str).replace(/[&<>"'`=\/]/g, function(s) {
        return ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
          '`': '&#96;',
          '=': '&#61;',
          '/': '&#47;'
        })[s];
      });
    }
  };

  // Register About app with AppRegistry as single-instance
  if (window.AppRegistry && typeof window.AppRegistry.registerApp === 'function') {
    window.AppRegistry.registerApp({
      id: 'about',
      name: 'About',
      icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><circle cx='24' cy='24' r='20' fill='%234a90e2'/><path d='M24 8c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm-2 12v16h4V20h-4z' fill='white'/></svg>",
      handler: () => window.AboutApp.open(),
      singleInstance: true
    });
  }

  // Register About documentation with Docs service (if available)
  if (window.Docs && typeof window.Docs.registerDocumentation === 'function') {
    window.Docs.registerDocumentation('about', {
      name: "About",
      version: "1.1",
      description: "System documentation viewer with search and filtering capabilities for all registered applications.",
      type: "System App",
      features: [
        "Browse documentation for all registered apps",
        "Search documentation with relevance scoring",
        "Filter by app type (System/User/Auto-generated)",
        "Developer-friendly interface with highlighting",
        "Real-time documentation collection and metadata display"
      ],
      dependencies: ["WindowManager", "AppRegistry", "Docs"],
      methods: [
        { name: "open", description: "Creates the main documentation window with sidebar and content area" },
        { name: "setupEventHandlers", description: "Binds search, filter, and app selection event handlers" },
        { name: "updateAppList", description: "Refreshes the app list based on current search and filter criteria" },
        { name: "selectApp", description: "Displays detailed documentation for the selected app" },
        { name: "renderDocumentation", description: "Renders formatted HTML documentation content with sections for features, methods, dependencies, notes, and CUDOS" }
      ],
      notes: "Integrates with the Docs service to provide a comprehensive view of all system and user applications.",
      cudos: "edmundsparrow.netlify.app",
      auto_generated: false
    });
  }
})();
