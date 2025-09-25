# Webdesktop

**One familiar desktop interface for all devices with a browser — light, consistent, and extendable.**

---

## Project Briefing

### What Webdesktop is
Webdesktop is a lightweight browser-based interface that acts like a familiar desktop environment.  
It is intentionally simple, so it can run anywhere — from smart TVs and phones to IoT devices, kiosks, and industrial panels.

### Why it exists
Many devices today come with weak, inconsistent, or single-purpose interfaces.  
Webdesktop provides a unified, minimal layer — a familiar desktop — so apps and controls feel the same across all screens, even on hardware with very limited interaction options.

### What it brings
- A single environment instead of many fragmented UIs  
- Lightweight and offline-ready, so it loads fast on low-power devices  
- Familiar controls (launcher, windows) so users don’t re-learn each app  
- A consistent place for companies to extend functionality with apps  

### Value statement
**Webdesktop turns the browser into a universal controller — a tiny, unified environment that makes devices easier to use, extend, and trust.**

---

## Architecture (Plain Language)

**Shell (the desktop)** Shows launcher, windows, and basic settings. Lightweight and offline-first.

**Apps** Ordinary web pages (HTML/CSS/JS) that open inside windows. No special framework required.

### Data & storage
Each app uses browser storage (`localStorage` / `IndexedDB`) to save its data.  
Companies may connect to servers if they want, but the desktop itself stays server-free.

### Offline & install
The environment can cache itself like a PWA, ensuring it launches instantly even without network.  
Apps may also be cached individually.

---

## Practical Use Cases

- **Smart home hubs:** Wall-mounted controllers for lights, AC, security, and appliances can all run inside Webdesktop instead of rigid dashboards.  
- **IoT & appliances:** Touchscreen coffee makers, printers, or factory screens with basic browsers gain a familiar interface for setup and control.  
- **Kiosks & terminals:** Ticketing machines, ATMs, and point-of-sale systems benefit from a minimal, uniform UI.  
- **In-vehicle displays:** Car infotainment or OSD panels can use Webdesktop as a thin, extensible control layer.  
- **Workplace & industry:** Office dashboards, warehouse panels, or medical devices with limited UI can unify their apps through Webdesktop.  
- **Everyday devices:** Smart TVs, tablets, and phones also run it, keeping the environment consistent everywhere.  
- **Low-cost desktop setups:** TV boxes combined with a wireless mouse and keyboard can become affordable desktop workspaces powered by Webdesktop.  

---

## Considerations & Positioning

### Accessibility
Webdesktop inherits accessibility features from the browser, such as screen reader support, high contrast modes, and keyboard navigation.  
This means it is usable by a wide range of users without reinventing accessibility.

### Internationalization (i18n)
Because it runs in the browser, Webdesktop supports all major languages, writing systems, and input methods.  
It respects the user’s browser language and localization settings automatically.

### Device limitations
Designed to run even on modest hardware: as little as **512MB RAM** with a modern browser engine.  
It works with touch, basic remotes, or simple keyboard input, making it suitable for constrained devices.

### Differentiation & Trust
- Unlike heavy solutions like **Electron** (which bundle a browser per app) or native frameworks (which require separate builds per platform), Webdesktop is **one lightweight environment** that runs anywhere a browser exists.  
- Because apps share a consistent environment, users can trust the controls and interactions to remain familiar across all devices.  

---

## Getting Started

The easiest way to try Webdesktop is to open it directly in your browser:  

👉 **[edmundsparrow-webos.netlify.app](https://edmundsparrow-webos.netlify.app/)** No installation needed. Just visit the link and explore the environment.  

---

## License & Contribution
This project is released under the **GNU General Public License v3.0 (GPL-3.0)**.  
A full copy of the license text is available in the **[LICENSE](LICENSE)** file.

Webdesktop is an open-source project and welcomes contributions! If you find a bug, have a feature request, or want to contribute code, please check the [Issues](https://github.com/edmundsparrow/Webdesktop/issues) tab.

---

**Topics/Tags for GitHub:** `webdesktop` `desktop-environment` `edmundsparrow` `iot` `unified-ui` `pwa`


