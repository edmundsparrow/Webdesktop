// WLED Controller App for edmundsparrow-WebOS
(function() {
    window.WLEDApp = {
        deviceIP: '',
        isConnected: false,
        currentWindow: null,

        open() {
            const wledHTML = `
                <div class="wled-app" style="
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    font-family: 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                    color: white;
                ">
                    <!-- Header -->
                    <div class="wled-header" style="
                        padding: 16px 20px;
                        background: rgba(255, 255, 255, 0.1);
                        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                        backdrop-filter: blur(10px);
                    ">
                        <h2 style="margin: 0 0 8px 0; font-size: 20px; color: #64ffda;">WLED Controller</h2>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <input 
                                type="text" 
                                id="deviceIP" 
                                placeholder="192.168.1.100" 
                                value="${this.deviceIP}"
                                style="
                                    padding: 8px 12px;
                                    border: 1px solid rgba(100, 255, 218, 0.3);
                                    border-radius: 6px;
                                    background: rgba(255, 255, 255, 0.1);
                                    color: white;
                                    font-size: 14px;
                                    width: 140px;
                                "
                            />
                            <button id="connectBtn" style="
                                padding: 8px 16px;
                                border: none;
                                border-radius: 6px;
                                background: ${this.isConnected ? '#4caf50' : '#2196f3'};
                                color: white;
                                font-weight: 600;
                                cursor: pointer;
                                font-size: 14px;
                                transition: all 0.3s ease;
                            ">${this.isConnected ? 'Connected' : 'Connect'}</button>
                            
                            <div id="statusIndicator" style="
                                width: 12px;
                                height: 12px;
                                border-radius: 50%;
                                background: ${this.isConnected ? '#4caf50' : '#f44336'};
                                margin-left: auto;
                                box-shadow: 0 0 10px ${this.isConnected ? '#4caf50' : '#f44336'};
                            "></div>
                        </div>
                    </div>

                    <!-- Controls Section -->
                    <div class="wled-controls" style="
                        flex: 1;
                        padding: 24px;
                        overflow-y: auto;
                    ">
                        <!-- Power Control -->
                        <div class="control-group" style="margin-bottom: 32px;">
                            <h3 style="margin: 0 0 16px 0; color: #64ffda; font-size: 16px; border-bottom: 1px solid rgba(100, 255, 218, 0.3); padding-bottom: 8px;">Power</h3>
                            <div style="display: flex; gap: 12px;">
                                <button id="powerOn" class="control-btn" style="
                                    flex: 1;
                                    padding: 16px;
                                    border: none;
                                    border-radius: 8px;
                                    background: linear-gradient(135deg, #4caf50, #45a049);
                                    color: white;
                                    font-weight: 600;
                                    cursor: pointer;
                                    font-size: 16px;
                                    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                                    transition: all 0.3s ease;
                                ">ON</button>
                                <button id="powerOff" class="control-btn" style="
                                    flex: 1;
                                    padding: 16px;
                                    border: none;
                                    border-radius: 8px;
                                    background: linear-gradient(135deg, #f44336, #d32f2f);
                                    color: white;
                                    font-weight: 600;
                                    cursor: pointer;
                                    font-size: 16px;
                                    box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
                                    transition: all 0.3s ease;
                                ">OFF</button>
                            </div>
                        </div>

                        <!-- Brightness Control -->
                        <div class="control-group" style="margin-bottom: 32px;">
                            <h3 style="margin: 0 0 16px 0; color: #64ffda; font-size: 16px; border-bottom: 1px solid rgba(100, 255, 218, 0.3); padding-bottom: 8px;">Brightness</h3>
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <span style="font-size: 14px; opacity: 0.8; min-width: 30px;">0</span>
                                <input 
                                    type="range" 
                                    id="brightness" 
                                    min="0" 
                                    max="255" 
                                    value="128"
                                    style="
                                        flex: 1;
                                        height: 6px;
                                        border-radius: 3px;
                                        background: linear-gradient(90deg, #333, #64ffda);
                                        outline: none;
                                        cursor: pointer;
                                    "
                                />
                                <span style="font-size: 14px; opacity: 0.8; min-width: 30px;">255</span>
                                <span id="brightnessValue" style="
                                    font-weight: 600;
                                    color: #64ffda;
                                    min-width: 40px;
                                    text-align: center;
                                    background: rgba(100, 255, 218, 0.1);
                                    padding: 4px 8px;
                                    border-radius: 4px;
                                ">128</span>
                            </div>
                        </div>

                        <!-- Color Control -->
                        <div class="control-group" style="margin-bottom: 32px;">
                            <h3 style="margin: 0 0 16px 0; color: #64ffda; font-size: 16px; border-bottom: 1px solid rgba(100, 255, 218, 0.3); padding-bottom: 8px;">Color</h3>
                            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                                <input 
                                    type="color" 
                                    id="colorPicker" 
                                    value="#ff0000"
                                    style="
                                        width: 60px;
                                        height: 40px;
                                        border: none;
                                        border-radius: 8px;
                                        cursor: pointer;
                                        background: none;
                                    "
                                />
                                <span id="colorValue" style="
                                    font-family: monospace;
                                    background: rgba(100, 255, 218, 0.1);
                                    padding: 8px 12px;
                                    border-radius: 6px;
                                    color: #64ffda;
                                    flex: 1;
                                ">#ff0000</span>
                            </div>
                            
                            <!-- Quick Color Presets -->
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(40px, 1fr)); gap: 8px;">
                                <button class="color-preset" data-color="#ff0000" style="width: 40px; height: 40px; background: #ff0000; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer;"></button>
                                <button class="color-preset" data-color="#00ff00" style="width: 40px; height: 40px; background: #00ff00; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer;"></button>
                                <button class="color-preset" data-color="#0000ff" style="width: 40px; height: 40px; background: #0000ff; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer;"></button>
                                <button class="color-preset" data-color="#ffff00" style="width: 40px; height: 40px; background: #ffff00; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer;"></button>
                                <button class="color-preset" data-color="#ff00ff" style="width: 40px; height: 40px; background: #ff00ff; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer;"></button>
                                <button class="color-preset" data-color="#00ffff" style="width: 40px; height: 40px; background: #00ffff; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer;"></button>
                                <button class="color-preset" data-color="#ffffff" style="width: 40px; height: 40px; background: #ffffff; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer;"></button>
                                <button class="color-preset" data-color="#ffa500" style="width: 40px; height: 40px; background: #ffa500; border: 2px solid rgba(255,255,255,0.3); border-radius: 8px; cursor: pointer;"></button>
                            </div>
                        </div>

                        <!-- Effects -->
                        <div class="control-group" style="margin-bottom: 32px;">
                            <h3 style="margin: 0 0 16px 0; color: #64ffda; font-size: 16px; border-bottom: 1px solid rgba(100, 255, 218, 0.3); padding-bottom: 8px;">Effects</h3>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 12px;">
                                <button class="effect-btn" data-effect="0" style="
                                    padding: 12px 8px;
                                    border: none;
                                    border-radius: 8px;
                                    background: rgba(100, 255, 218, 0.1);
                                    color: #64ffda;
                                    font-weight: 600;
                                    cursor: pointer;
                                    font-size: 12px;
                                    transition: all 0.3s ease;
                                    border: 1px solid rgba(100, 255, 218, 0.3);
                                ">Solid</button>
                                <button class="effect-btn" data-effect="1" style="
                                    padding: 12px 8px;
                                    border: none;
                                    border-radius: 8px;
                                    background: rgba(100, 255, 218, 0.1);
                                    color: #64ffda;
                                    font-weight: 600;
                                    cursor: pointer;
                                    font-size: 12px;
                                    transition: all 0.3s ease;
                                    border: 1px solid rgba(100, 255, 218, 0.3);
                                ">Blink</button>
                                <button class="effect-btn" data-effect="2" style="
                                    padding: 12px 8px;
                                    border: none;
                                    border-radius: 8px;
                                    background: rgba(100, 255, 218, 0.1);
                                    color: #64ffda;
                                    font-weight: 600;
                                    cursor: pointer;
                                    font-size: 12px;
                                    transition: all 0.3s ease;
                                    border: 1px solid rgba(100, 255, 218, 0.3);
                                ">Breathe</button>
                                <button class="effect-btn" data-effect="3" style="
                                    padding: 12px 8px;
                                    border: none;
                                    border-radius: 8px;
                                    background: rgba(100, 255, 218, 0.1);
                                    color: #64ffda;
                                    font-weight: 600;
                                    cursor: pointer;
                                    font-size: 12px;
                                    transition: all 0.3s ease;
                                    border: 1px solid rgba(100, 255, 218, 0.3);
                                ">Wipe</button>
                                <button class="effect-btn" data-effect="9" style="
                                    padding: 12px 8px;
                                    border: none;
                                    border-radius: 8px;
                                    background: rgba(100, 255, 218, 0.1);
                                    color: #64ffda;
                                    font-weight: 600;
                                    cursor: pointer;
                                    font-size: 12px;
                                    transition: all 0.3s ease;
                                    border: 1px solid rgba(100, 255, 218, 0.3);
                                ">Rainbow</button>
                                <button class="effect-btn" data-effect="12" style="
                                    padding: 12px 8px;
                                    border: none;
                                    border-radius: 8px;
                                    background: rgba(100, 255, 218, 0.1);
                                    color: #64ffda;
                                    font-weight: 600;
                                    cursor: pointer;
                                    font-size: 12px;
                                    transition: all 0.3s ease;
                                    border: 1px solid rgba(100, 255, 218, 0.3);
                                ">Fade</button>
                            </div>
                        </div>
                    </div>

                    <!-- Status Bar -->
                    <div class="wled-status" style="
                        padding: 12px 20px;
                        background: rgba(0, 0, 0, 0.3);
                        border-top: 1px solid rgba(255, 255, 255, 0.1);
                        font-size: 12px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <span id="statusMessage">Ready to connect</span>
                        <span id="deviceInfo">No device</span>
                    </div>
                </div>
            `;

            const win = window.WindowManager.createWindow('WLED Controller', wledHTML, 400, 600);
            this.currentWindow = win;
            this.setupEventHandlers(win);
            return win;
        },

        setupEventHandlers(win) {
            const deviceIPInput = win.querySelector('#deviceIP');
            const connectBtn = win.querySelector('#connectBtn');
            const powerOnBtn = win.querySelector('#powerOn');
            const powerOffBtn = win.querySelector('#powerOff');
            const brightnessSlider = win.querySelector('#brightness');
            const brightnessValue = win.querySelector('#brightnessValue');
            const colorPicker = win.querySelector('#colorPicker');
            const colorValue = win.querySelector('#colorValue');
            const colorPresets = win.querySelectorAll('.color-preset');
            const effectBtns = win.querySelectorAll('.effect-btn');
            const statusMessage = win.querySelector('#statusMessage');

            // Connect/Disconnect
            connectBtn.addEventListener('click', () => {
                if (this.isConnected) {
                    this.disconnect(win);
                } else {
                    this.deviceIP = deviceIPInput.value.trim();
                    if (this.deviceIP) {
                        this.connect(win);
                    } else {
                        this.showStatus(win, 'Please enter device IP address', 'error');
                    }
                }
            });

            // Power controls
            powerOnBtn.addEventListener('click', () => this.sendCommand('/win&T=1'));
            powerOffBtn.addEventListener('click', () => this.sendCommand('/win&T=0'));

            // Brightness control
            brightnessSlider.addEventListener('input', (e) => {
                brightnessValue.textContent = e.target.value;
            });
            brightnessSlider.addEventListener('change', (e) => {
                this.sendCommand(`/win&A=${e.target.value}`);
            });

            // Color picker
            colorPicker.addEventListener('change', (e) => {
                const color = e.target.value;
                colorValue.textContent = color;
                this.setColor(color);
            });

            // Color presets
            colorPresets.forEach(preset => {
                preset.addEventListener('click', () => {
                    const color = preset.dataset.color;
                    colorPicker.value = color;
                    colorValue.textContent = color;
                    this.setColor(color);
                });
            });

            // Effects
            effectBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const effect = btn.dataset.effect;
                    this.sendCommand(`/win&FX=${effect}`);
                    
                    // Visual feedback
                    effectBtns.forEach(b => {
                        b.style.background = 'rgba(100, 255, 218, 0.1)';
                        b.style.borderColor = 'rgba(100, 255, 218, 0.3)';
                    });
                    btn.style.background = 'rgba(100, 255, 218, 0.3)';
                    btn.style.borderColor = '#64ffda';
                });
            });

            // Add hover effects
            this.addHoverEffects(win);
        },

        addHoverEffects(win) {
            // Control buttons hover
            win.querySelectorAll('.control-btn').forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'translateY(-2px)';
                    btn.style.boxShadow = btn.style.boxShadow.replace('4px', '8px');
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = 'translateY(0)';
                    btn.style.boxShadow = btn.style.boxShadow.replace('8px', '4px');
                });
            });

            // Effect buttons hover
            win.querySelectorAll('.effect-btn').forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    if (btn.style.background === 'rgba(100, 255, 218, 0.1)') {
                        btn.style.background = 'rgba(100, 255, 218, 0.2)';
                    }
                });
                btn.addEventListener('mouseleave', () => {
                    if (btn.style.background === 'rgba(100, 255, 218, 0.2)') {
                        btn.style.background = 'rgba(100, 255, 218, 0.1)';
                    }
                });
            });
        },

        async connect(win) {
            this.showStatus(win, 'Connecting...', 'info');
            
            try {
                // Test connection with a simple info request
                const response = await fetch(`http://${this.deviceIP}/json/info`, {
                    method: 'GET',
                    timeout: 5000
                });
                
                if (response.ok) {
                    const info = await response.json();
                    this.isConnected = true;
                    this.updateConnectionUI(win, true);
                    this.showStatus(win, 'Connected successfully', 'success');
                    
                    const deviceInfo = win.querySelector('#deviceInfo');
                    deviceInfo.textContent = `${info.name || 'WLED Device'} v${info.ver || 'Unknown'}`;
                } else {
                    throw new Error('Failed to connect');
                }
            } catch (error) {
                this.showStatus(win, 'Connection failed. Check IP address and network.', 'error');
                this.isConnected = false;
                this.updateConnectionUI(win, false);
            }
        },

        disconnect(win) {
            this.isConnected = false;
            this.updateConnectionUI(win, false);
            this.showStatus(win, 'Disconnected', 'info');
            
            const deviceInfo = win.querySelector('#deviceInfo');
            deviceInfo.textContent = 'No device';
        },

        updateConnectionUI(win, connected) {
            const connectBtn = win.querySelector('#connectBtn');
            const statusIndicator = win.querySelector('#statusIndicator');
            
            connectBtn.textContent = connected ? 'Disconnect' : 'Connect';
            connectBtn.style.background = connected ? '#f44336' : '#2196f3';
            
            statusIndicator.style.background = connected ? '#4caf50' : '#f44336';
            statusIndicator.style.boxShadow = `0 0 10px ${connected ? '#4caf50' : '#f44336'}`;
        },

        async sendCommand(command) {
            if (!this.isConnected || !this.deviceIP) {
                this.showStatus(this.currentWindow, 'Not connected to device', 'error');
                return false;
            }

            try {
                const response = await fetch(`http://${this.deviceIP}${command}`, {
                    method: 'GET',
                    timeout: 3000
                });
                
                if (response.ok) {
                    this.showStatus(this.currentWindow, 'Command sent', 'success');
                    return true;
                } else {
                    throw new Error('Command failed');
                }
            } catch (error) {
                this.showStatus(this.currentWindow, 'Command failed', 'error');
                return false;
            }
        },

        setColor(hexColor) {
            // Convert hex to RGB
            const r = parseInt(hexColor.substr(1, 2), 16);
            const g = parseInt(hexColor.substr(3, 2), 16);
            const b = parseInt(hexColor.substr(5, 2), 16);
            
            this.sendCommand(`/win&R=${r}&G=${g}&B=${b}`);
        },

        showStatus(win, message, type) {
            const statusMessage = win.querySelector('#statusMessage');
            statusMessage.textContent = message;
            
            // Color coding for status types
            const colors = {
                success: '#4caf50',
                error: '#f44336',
                info: '#2196f3',
                warning: '#ff9800'
            };
            
            statusMessage.style.color = colors[type] || colors.info;
            
            // Auto-clear success messages
            if (type === 'success') {
                setTimeout(() => {
                    statusMessage.textContent = 'Ready';
                    statusMessage.style.color = '#64ffda';
                }, 3000);
            }
        }
    };

    // Register app with the system
    if (window.AppRegistry) {
        window.AppRegistry.registerApp({
            id: 'wled',
            name: 'WLED Controller',
            icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='48' height='48' rx='8' fill='%231a1a2e'/><circle cx='12' cy='24' r='4' fill='%23ff0000'/><circle cx='24' cy='24' r='4' fill='%2300ff00'/><circle cx='36' cy='24' r='4' fill='%230000ff'/><path d='M8 32h32v4H8z' fill='%2364ffda'/></svg>",
            handler: () => window.WLEDApp.open(),
            singleInstance: true
        });
    }

    // Register documentation
    if (window.Docs && typeof window.Docs.registerDocumentation === 'function') {
        window.Docs.registerDocumentation('wled', {
            name: "WLED Controller",
            version: "1.0.0",
            description: "IoT LED strip controller app for WLED-compatible devices with real-time color, brightness, and effect control",
            type: "IoT App",
            features: [
                "Real-time LED strip control via HTTP API",
                "Color picker with hex color display",
                "Brightness control with live feedback",
                "Built-in effect presets (solid, blink, rainbow, etc.)",
                "Device connection status monitoring",
                "Quick color presets for common colors",
                "Professional IoT device interface design"
            ],
            dependencies: ["WindowManager", "AppRegistry"],
            methods: [
                { name: "open", description: "Creates WLED controller window with full IoT interface" },
                { name: "connect", description: "Establishes connection to WLED device via HTTP" },
                { name: "sendCommand", description: "Sends HTTP commands to control LED strip parameters" },
                { name: "setColor", description: "Converts hex colors to RGB and sends to device" }
            ],
            notes: "Demonstrates real IoT device control with immediate hardware response. Requires WLED-compatible LED strips with network connectivity. Uses standard WLED HTTP API endpoints.",
            cudos: "edmundsparrow.netlify.app | whatsappme @ 09024054758 | webaplications5050@gmail.com",
            auto_generated: false
        });
    }

})();