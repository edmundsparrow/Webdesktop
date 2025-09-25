// calculator.js - Simple Calculator Application
/**
 * FILE: applications/calculator.js
 * VERSION: 1.0.1
 * BUILD DATE: 2025-09-24
 *
 * PURPOSE:
 * Lightweight calculator application providing basic arithmetic operations
 * with a clean, minimal interface. Designed for efficiency and compatibility
 * across old and new browsers with minimal memory footprint.
 *
 * ARCHITECTURE:
 * - IIFE pattern with window.CalculatorApp namespace
 * - Single window interface with button grid layout
 * - Pure JavaScript evaluation with error handling
 * - Event-driven button interactions
 * - Minimal DOM manipulation for optimal performance
 *
 * LIFECYCLE:
 * 1. AppRegistry launches CalculatorApp.open()
 * 2. Window created with calculator button grid and display
 * 3. User clicks buttons or uses keyboard for input
 * 4. Real-time calculation display with immediate feedback
 * 5. Error handling for invalid expressions
 *
 * EXTENSION POINTS:
 * - Scientific calculator functions (sin, cos, log, etc.)
 * - Memory operations (M+, M-, MR, MC)
 * - History/tape functionality
 * - Themes and customizable layouts
 * - Copy/paste integration
 *
 * INTEGRATION:
 * - Keyboard shortcuts for all operations
 * - Copy result to clipboard capability
 * - Standard calculator button layout
 *
 * CREDITS:
 * edmundsparrow.netlify.app | whatsappme @ 09024054758 | webaplications5050@gmail.com
 *
 * NOTES:
 * - Uses eval() with input sanitization for calculations
 * - Optimized for minimal code length and memory usage
 * - Compatible with legacy browsers through basic ES5 features
 * - Responsive button layout adapts to window size
 *
 * REVISION 1.0.1:
 * - Fixed: Calculator expression manipulation to allow operators after an '=' calculation.
 * - Improvement: The previous result is now used as the starting expression for continuous calculation.
 */

(function() {
  window.CalculatorApp = {
    currentExpression: '0',
    shouldResetDisplay: false,

    open() {
      // Windows 7 Aero-inspired color scheme
      const win7_bg = '#DEE8F5'; // Light blue/gray for the app background
      const win7_panel = '#E4EAF2'; // Slightly lighter panel background
      const win7_display_bg = '#FFFFFF'; // White for display background
      const win7_display_border = '#A5BBD9'; // Subtle display border
      const win7_number_btn_bg = 'linear-gradient(to bottom, #F7F9FB, #EAEFF7)'; // Number button gradient
      const win7_operator_btn_bg = 'linear-gradient(to bottom, #E8F0F7, #D9E3F0)'; // Operator button gradient
      const win7_equal_btn_bg = 'linear-gradient(to bottom, #89B6D7, #4D8BC1)'; // Blue for equals
      const win7_clear_btn_bg = 'linear-gradient(to bottom, #F0F5F9, #DDE6F0)'; // Clear button
      const win7_text = '#1F4765'; // Dark blue text
      const win7_dark_text = '#000000'; // Black for operators/clear

      const html = `
        <div style="display:flex;flex-direction:column;height:100%;font-family:'Segoe UI',sans-serif;background:${win7_bg}">
          
          <div style="padding:10px 10px 5px 10px;background:${win7_panel};border-bottom:1px solid #C4D3E3">
            <div id="calc-display" style="
              background:${win7_display_bg};
              color:${win7_text};
              font-family:'Segoe UI',monospace;
              font-size:24px;
              font-weight:600;
              padding:8px 12px;
              border-radius:3px;
              text-align:right;
              min-height:36px;
              border:1px solid ${win7_display_border};
              box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
            ">0</div>
          </div>
          
          <div style="flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:4px;background:${win7_bg}">
            
            <button class="calc-btn clear" data-action="clear" style="
              background:${win7_clear_btn_bg};color:${win7_dark_text};border:1px solid #B0C4DE;font-size:16px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">C</button>
            <button class="calc-btn operator" data-action="backspace" style="
              background:${win7_clear_btn_bg};color:${win7_dark_text};border:1px solid #B0C4DE;font-size:16px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">⌫</button>
            <button class="calc-btn operator" data-value="%" style="
              background:${win7_operator_btn_bg};color:${win7_text};border:1px solid #B0C4DE;font-size:16px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">%</button>
            <button class="calc-btn operator" data-value="/" style="
              background:${win7_operator_btn_bg};color:${win7_text};border:1px solid #B0C4DE;font-size:16px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">÷</button>
            
            <button class="calc-btn number" data-value="7" style="
              background:${win7_number_btn_bg};color:${win7_dark_text};border:1px solid #B0C4DE;font-size:18px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">7</button>
            <button class="calc-btn number" data-value="8" style="
              background:${win7_number_btn_bg};color:${win7_dark_text};border:1px solid #B0C4DE;font-size:18px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">8</button>
            <button class="calc-btn number" data-value="9" style="
              background:${win7_number_btn_bg};color:${win7_dark_text};border:1px solid #B0C4DE;font-size:18px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">9</button>
            <button class="calc-btn operator" data-value="*" style="
              background:${win7_operator_btn_bg};color:${win7_text};border:1px solid #B0C4DE;font-size:16px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">×</button>
            
            <button class="calc-btn number" data-value="4" style="
              background:${win7_number_btn_bg};color:${win7_dark_text};border:1px solid #B0C4DE;font-size:18px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">4</button>
            <button class="calc-btn number" data-value="5" style="
              background:${win7_number_btn_bg};color:${win7_dark_text};border:1px solid #B0C4DE;font-size:18px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">5</button>
            <button class="calc-btn number" data-value="6" style="
              background:${win7_number_btn_bg};color:${win7_dark_text};border:1px solid #B0C4DE;font-size:18px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">6</button>
            <button class="calc-btn operator" data-value="-" style="
              background:${win7_operator_btn_bg};color:${win7_text};border:1px solid #B0C4DE;font-size:16px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">−</button>
            
            <button class="calc-btn number" data-value="1" style="
              background:${win7_number_btn_bg};color:${win7_dark_text};border:1px solid #B0C4DE;font-size:18px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">1</button>
            <button class="calc-btn number" data-value="2" style="
              background:${win7_number_btn_bg};color:${win7_dark_text};border:1px solid #B0C4DE;font-size:18px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">2</button>
            <button class="calc-btn number" data-value="3" style="
              background:${win7_number_btn_bg};color:${win7_dark_text};border:1px solid #B0C4DE;font-size:18px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">3</button>
            <button class="calc-btn operator" data-value="+" style="
              background:${win7_operator_btn_bg};color:${win7_text};border:1px solid #B0C4DE;font-size:16px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">+</button>
            
            <button class="calc-btn number" data-value="0" style="
              background:${win7_number_btn_bg};color:${win7_dark_text};border:1px solid #B0C4DE;font-size:18px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);grid-column:span 2;
            ">0</button>
            <button class="calc-btn number" data-value="." style="
              background:${win7_number_btn_bg};color:${win7_dark_text};border:1px solid #B0C4DE;font-size:18px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">.</button>
            <button class="calc-btn equals" data-action="equals" style="
              background:${win7_equal_btn_bg};color:white;border:1px solid #336699;font-size:18px;font-weight:bold;cursor:pointer;
              transition:background 0.1s;border-radius:3px;box-shadow:0 1px 2px rgba(0,0,0,0.1);
            ">=</button>
            
          </div>
        </div>
      `;

      const win = WindowManager.createWindow('Calculator', html, 320, 400);
      this.setup(win);
      return win;
    },

    setup(win) {
      const display = win.querySelector('#calc-display');
      
      // Button clicks
      win.addEventListener('click', e => {
        const btn = e.target.closest('.calc-btn');
        if (!btn) return;
        
        this.handleButtonPress(btn, display);
        this.animateButton(btn);
      });

      // Keyboard support
      win.addEventListener('keydown', e => {
        const key = e.key;
        let btn = null;
        
        if ('0123456789.'.includes(key)) {
          btn = win.querySelector(`[data-value="${key}"]`);
        } else if ('+-*/'.includes(key)) {
          btn = win.querySelector(`[data-value="${key}"]`);
        } else if (key === 'Enter' || key === '=') {
          btn = win.querySelector('[data-action="equals"]');
        } else if (key === 'Escape' || key === 'c' || key === 'C') {
          btn = win.querySelector('[data-action="clear"]');
        } else if (key === 'Backspace') {
          btn = win.querySelector('[data-action="backspace"]');
        } else if (key === '%') {
          btn = win.querySelector('[data-value="%"]');
        }
        
        if (btn) {
          e.preventDefault();
          this.handleButtonPress(btn, display);
          this.animateButton(btn);
        }
      });

      win.tabIndex = 0;
      win.focus();
    },

    handleButtonPress(btn, display) {
      const action = btn.dataset.action;
      const value = btn.dataset.value;
      const isOperatorButton = btn.classList.contains('operator') || btn.dataset.value === '%';

      if (action === 'clear') {
        this.currentExpression = '0';
        this.shouldResetDisplay = false;
        this.updateDisplay(display);
      } else if (action === 'backspace') {
        this.handleBackspace(display);
      } else if (action === 'equals') {
        this.calculate(display);
      } else if (value) {
        // Core logic update: If we are in the 'result state' and press an operator,
        // we append the operator to the result without resetting.
        if (this.shouldResetDisplay && isOperatorButton) {
          this.shouldResetDisplay = false;
          // The currentExpression is already the result from calculate(), so we just append.
        }
        
        this.handleInput(value, display);
      }
    },

    handleInput(value, display) {
      // If we are in result state and a NUMBER is pressed, reset the expression
      if (this.shouldResetDisplay && !this.isOperator(value)) {
        this.currentExpression = '';
        this.shouldResetDisplay = false;
      }
      
      // If we are in result state and an OPERATOR is pressed, currentExpression is kept, and we proceed to append.
      // This is handled in handleButtonPress, so we only need to check for number reset here.

      if (this.currentExpression === '0' && '0123456789.'.includes(value)) {
        this.currentExpression = value;
      } else {
        // Prevent multiple consecutive operators
        if (this.isOperator(value) && this.isOperator(this.currentExpression.slice(-1))) {
          // Replace the last operator with the new one (e.g., '5+' -> '5*')
          this.currentExpression = this.currentExpression.slice(0, -1) + value;
        } else {
          this.currentExpression += value;
        }
      }
      
      this.updateDisplay(display);
    },

    handleBackspace(display) {
      if (this.currentExpression === 'Error') {
         this.currentExpression = '0';
      } else if (this.currentExpression.length > 1) {
        this.currentExpression = this.currentExpression.slice(0, -1);
      } else {
        this.currentExpression = '0';
      }
      this.shouldResetDisplay = false; // Allow further input immediately after backspace
      this.updateDisplay(display);
    },

    calculate(display) {
      try {
        // Clean expression and replace display symbols with JS operators
        let expr = this.currentExpression
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-');

        // Basic security - only allow safe characters
        if (!/^[0-9+\-*/.% ()]+$/.test(expr)) {
          throw new Error('Invalid characters');
        }

        // Use Function constructor for safer evaluation
        const result = Function('return ' + expr)();
        
        if (!isFinite(result)) {
          throw new Error('Invalid result');
        }

        this.currentExpression = this.formatResult(result);
        this.shouldResetDisplay = true; // Set flag to indicate we're showing a result
        this.updateDisplay(display);
        
      } catch (error) {
        this.currentExpression = 'Error';
        this.shouldResetDisplay = true;
        this.updateDisplay(display);
      }
    },

    formatResult(result) {
      // Handle very large or very small numbers
      if (Math.abs(result) > 1e10 || (Math.abs(result) < 1e-6 && result !== 0)) {
        return result.toExponential(6);
      }
      
      // Round to avoid floating point issues
      return parseFloat(result.toFixed(10)).toString();
    },

    isOperator(char) {
      return '+-*/%.'.includes(char);
    },

    updateDisplay(display) {
      display.textContent = this.currentExpression.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');
      
      // Adjust font size for long expressions
      if (this.currentExpression.length > 12) {
        display.style.fontSize = '18px';
      } else if (this.currentExpression.length > 8) {
        display.style.fontSize = '20px';
      } else {
        display.style.fontSize = '24px';
      }
    },

    animateButton(btn) {
      const isNumber = btn.classList.contains('number') || btn.dataset.value === '.';
      const isOperator = btn.classList.contains('operator') || btn.dataset.action === 'backspace';
      const isClear = btn.classList.contains('clear');
      const isEquals = btn.classList.contains('equals');
      
      // Windows 7 hover/press effect colors
      const pressBg = isEquals ? '#336699' : // Darker blue for equals
                      isNumber ? '#C4D3E3' : // Light blue/gray for numbers
                      '#DDE6F0'; // Slightly darker utility/operator
      
      const originalBg = btn.style.background;
      const originalBorder = btn.style.borderColor;

      btn.style.background = pressBg;
      btn.style.borderColor = isEquals ? '#1F4765' : '#8DA3B8'; // Deeper border on press

      setTimeout(() => {
        btn.style.background = originalBg;
        btn.style.borderColor = originalBorder;
      }, 100); // Shorter duration for a snappier feel
    }
  };

  if (typeof AppRegistry !== 'undefined') {
    AppRegistry.registerApp({
      id: 'calculator',
      name: 'Calculator',
      // Updated icon to look more like the Win7 calculator icon
      icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect x='4' y='4' width='40' height='40' rx='4' fill='url(%23g1)'/><defs><linearGradient id='g1' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' style='stop-color:%23DDE6F0'/><stop offset='100%' style='stop-color:%23B0C4DE'/></linearGradient></defs><rect x='8' y='8' width='32' height='8' fill='%23FFFFFF' rx='2' stroke='%23A5BBD9' stroke-width='1'/><text x='24' y='14' font-family='sans-serif' font-size='6' fill='%231F4765' text-anchor='middle'>CALC</text><rect x='10' y='20' width='28' height='18' fill='url(%23g2)' rx='2'/><defs><linearGradient id='g2' x1='0%' y1='0%' x2='0%' y2='100%'><stop offset='0%' style='stop-color:%2389B6D7'/><stop offset='100%' style='stop-color:%234D8BC1'/></linearGradient></defs><text x='24' y='34' font-family='sans-serif' font-size='12' font-weight='bold' fill='%23FFFFFF' text-anchor='middle'>=</text></svg>",
      handler: () => window.CalculatorApp.open()
    });
  }

  if (window.Docs) {
    window.Docs.registerDocumentation('calculator', {
      name: "Calculator",
      version: "1.0.1",
      description: "Lightweight calculator application with basic arithmetic operations, designed for minimal memory usage and maximum compatibility. Updated to support continuous operation after calculation.",
      type: "User App",
      features: [
        "Basic arithmetic operations (+, -, ×, ÷, %)",
        "Decimal number support with floating point handling",
        "Full keyboard support with number keys and operators",
        "Backspace and clear functionality",
        "Visual button press feedback with animations",
        "Automatic font scaling for long expressions",
        "Error handling for invalid calculations",
        "Scientific notation for very large/small numbers",
        "**Continuous Calculation (Operator follows Result)**"
      ],
      dependencies: ["WindowManager", "AppRegistry"],
      methods: [
        { name: "open", description: "Creates calculator window with button grid and display" },
        { name: "handleButtonPress", description: "Processes button clicks and keyboard input (now supports continuous ops)" },
        { name: "calculate", description: "Evaluates mathematical expressions with security checks" },
        { name: "formatResult", description: "Formats calculation results with proper precision" },
        { name: "updateDisplay", description: "Updates display with auto-scaling font size" }
      ],
      notes: "Uses Function constructor instead of eval() for safer expression evaluation. Optimized for minimal code length while maintaining full functionality.",
      cudos: "edmundsparrow.netlify.app | whatsappme @ 09024054758 | webaplications5050@gmail.com",
      auto_generated: false
    });
  }
})();

