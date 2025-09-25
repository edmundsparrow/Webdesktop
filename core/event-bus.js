// FILE: /SYSTEM/CORE/event-bus.js
// VERSION: 1.1.0
//
// EVENT-BUS.JS - LIGHTWEIGHT EVENT COMMUNICATION SERVICE
//
// PURPOSE:
//   Minimal publish-subscribe event system enabling decoupled communication
//   between webdesktop components without direct dependencies.
//
// ARCHITECTURE:
//   - Simple Map-based listener storage with window.EventBus namespace
//   - Synchronous event emission with immediate callback execution
//   - No event queuing or async handling for minimal complexity
//   - Memory-efficient with automatic cleanup on listener removal
//
// LIFECYCLE:
//   1. EventBus available immediately when script loads
//   2. Components register listeners via EventBus.on(event, callback)
//   3. Components emit events via EventBus.emit(event, data)
//   4. All registered listeners execute synchronously in registration order
//
// KEY FEATURES:
//   • Lightweight pub-sub pattern with zero external dependencies
//   • Synchronous event handling for predictable execution order
//   • Multiple listeners per event with automatic callback management
//   • Simple API: just on() and emit() methods
//
// INTEGRATION:
//   - AppRegistry: Emits 'app-registered' when new apps added
//   - Docs Service: Listens for 'app-registered' to collect documentation
//   - System Components: Cross-component communication without tight coupling
//
// DEPENDENCIES:
//   None - completely self-contained
//
// CUDOS:
//   edmundsparrow.netlify.app | whatsappme @ 09024054758 | 
//   webaplications5050@gmail.com
//
// ---------------------------------------------------------------------

// Core Event Bus Implementation
window.EventBus = {
    listeners: new Map(),
    
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    },
    
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for '${event}':`, error);
                }
            });
        }
    },
    
    // Utility method to remove listeners
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
                if (callbacks.length === 0) {
                    this.listeners.delete(event);
                }
            }
        }
    },
    
    // Get all registered events (for debugging)
    getEvents() {
        return Array.from(this.listeners.keys());
    },
    
    // Get listener count for an event
    getListenerCount(event) {
        return this.listeners.has(event) ? this.listeners.get(event).length : 0;
    }
};

// Self-documentation registration with proper timing
(function registerEventBusDocumentation() {
    const documentation = {
        name: "Event Bus",
        version: "1.1.0",
        description: "Lightweight publish-subscribe event system for decoupled component communication across the webdesktop environment",
        type: "System Service",
        features: [
            "Simple pub-sub pattern with Map-based listener storage",
            "Synchronous event emission with predictable execution order",
            "Multiple listeners per event with automatic management",
            "Zero dependencies - completely self-contained service",
            "Memory efficient with minimal overhead",
            "Error handling for individual event listeners",
            "Utility methods for listener management and debugging"
        ],
        dependencies: [],
        methods: [
            { name: "on", description: "Register event listener: EventBus.on('event', callback)" },
            { name: "emit", description: "Emit event to all listeners: EventBus.emit('event', data)" },
            { name: "off", description: "Remove specific event listener: EventBus.off('event', callback)" },
            { name: "getEvents", description: "Get list of all registered events for debugging" },
            { name: "getListenerCount", description: "Get number of listeners for a specific event" }
        ],
        notes: "Core system service that enables loose coupling between components. Used extensively by AppRegistry, Docs service, and other system components for event-driven communication. All event emission is synchronous to ensure predictable execution order.",
        cudos: "edmundsparrow.netlify.app | whatsappme @ 09024054758 | webaplications5050@gmail.com",
        auto_generated: false
    };

    const tryRegister = () => {
        if (window.Docs && 
            typeof window.Docs.registerDocumentation === 'function' && 
            (window.Docs.isReady ? window.Docs.isReady() : window.Docs.isInitialized)) {
            
            try {
                window.Docs.registerDocumentation('eventbus', documentation);
                console.log('EventBus documentation registered successfully');
                return true;
            } catch (error) {
                console.warn('Failed to register EventBus documentation:', error);
                return false;
            }
        }
        return false;
    };

    // Try immediate registration
    if (tryRegister()) {
        return;
    }

    // Listen for docs service ready event
    window.EventBus.on('docs-service-ready', () => {
        if (tryRegister()) {
            // Remove this listener after successful registration
            window.EventBus.off('docs-service-ready', arguments.callee);
        }
    });

    // Fallback timeout registration (ensures registration even if event is missed)
    setTimeout(() => {
        if (!tryRegister()) {
            console.warn('EventBus documentation registration failed after timeout - Docs service may not be available');
        }
    }, 500);

    // Additional fallback for very late Docs service initialization
    const maxRetries = 10;
    let retryCount = 0;
    
    const retryRegistration = () => {
        if (retryCount >= maxRetries) {
            console.warn('EventBus documentation registration abandoned after maximum retries');
            return;
        }
        
        if (!tryRegister()) {
            retryCount++;
            setTimeout(retryRegistration, 1000 * retryCount); // Exponential backoff
        }
    };
    
    // Start retry sequence after initial delay
    setTimeout(retryRegistration, 1000);
})();

// Export for module environments (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.EventBus;
}