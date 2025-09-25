// JS/CORE/APP-LOADER.JS
        window.AppLoader = {
            loadedScripts: new Set(),
            
            load(scriptPaths) {
                const promises = scriptPaths.map(path => this.loadScript(path));
                return Promise.all(promises);
            },
            
            loadScript(src) {
                if (this.loadedScripts.has(src)) {
                    return Promise.resolve();
                }
                
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = src;
                    script.onload = () => {
                        this.loadedScripts.add(src);
                        resolve();
                    };
                    script.onerror = () => reject(new Error(`Failed to load ${src}`));
                    document.head.appendChild(script);
                });
            }
        };