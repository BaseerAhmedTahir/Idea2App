import { ExecutionContext, ResourceLimits, ExecutionResult, ExecutionMetrics } from '../types/codeGeneration';

export interface SecureSandbox {
  executeCode(code: string, context: ExecutionContext): Promise<ExecutionResult>;
  limitResources(limits: ResourceLimits): void;
  monitorExecution(): ExecutionMetrics;
  terminateExecution(): void;
}

export class WebWorkerSandbox implements SecureSandbox {
  private worker: Worker | null = null;
  private executionTimeout: number = 30000; // 30 seconds default
  private resourceLimits: ResourceLimits = {
    memory: 100 * 1024 * 1024, // 100MB
    cpu: 80, // 80% CPU usage
    network: 10 * 1024 * 1024, // 10MB network
    storage: 50 * 1024 * 1024, // 50MB storage
    executionTime: 30000 // 30 seconds
  };
  private executionMetrics: ExecutionMetrics = {
    executionTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkRequests: 0
  };
  private isExecuting = false;
  private executionStartTime = 0;

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker(): void {
    // Create a secure web worker for code execution
    const workerCode = `
      // Secure sandbox worker
      let executionContext = null;
      let resourceMonitor = null;
      let networkRequestCount = 0;
      let memoryUsage = 0;
      let startTime = 0;

      // Override dangerous globals
      const originalEval = self.eval;
      const originalFunction = self.Function;
      const originalImportScripts = self.importScripts;
      const originalFetch = self.fetch;

      // Disable dangerous functions
      self.eval = () => { throw new Error('eval() is disabled in sandbox'); };
      self.Function = () => { throw new Error('Function constructor is disabled in sandbox'); };
      self.importScripts = () => { throw new Error('importScripts is disabled in sandbox'); };

      // Monitor network requests
      self.fetch = (...args) => {
        networkRequestCount++;
        if (networkRequestCount > 10) {
          throw new Error('Network request limit exceeded');
        }
        return originalFetch.apply(self, args);
      };

      // Memory monitoring
      function monitorMemory() {
        if (performance.memory) {
          memoryUsage = performance.memory.usedJSHeapSize;
          if (memoryUsage > executionContext?.memoryLimit) {
            throw new Error('Memory limit exceeded');
          }
        }
      }

      // CPU monitoring (simplified)
      function monitorCPU() {
        const currentTime = performance.now();
        if (currentTime - startTime > executionContext?.executionTime) {
          throw new Error('Execution time limit exceeded');
        }
      }

      // Safe console implementation
      const safeConsole = {
        log: (...args) => {
          self.postMessage({
            type: 'console',
            level: 'log',
            message: args.join(' '),
            timestamp: Date.now()
          });
        },
        warn: (...args) => {
          self.postMessage({
            type: 'console',
            level: 'warn',
            message: args.join(' '),
            timestamp: Date.now()
          });
        },
        error: (...args) => {
          self.postMessage({
            type: 'console',
            level: 'error',
            message: args.join(' '),
            timestamp: Date.now()
          });
        },
        info: (...args) => {
          self.postMessage({
            type: 'console',
            level: 'info',
            message: args.join(' '),
            timestamp: Date.now()
          });
        }
      };

      // Replace global console
      self.console = safeConsole;

      // Message handler
      self.onmessage = function(event) {
        const { type, code, context } = event.data;

        switch (type) {
          case 'execute':
            try {
              executionContext = context;
              startTime = performance.now();
              networkRequestCount = 0;
              memoryUsage = 0;

              // Start monitoring
              const monitorInterval = setInterval(() => {
                try {
                  monitorMemory();
                  monitorCPU();
                } catch (error) {
                  clearInterval(monitorInterval);
                  self.postMessage({
                    type: 'error',
                    error: error.message,
                    metrics: {
                      executionTime: performance.now() - startTime,
                      memoryUsage,
                      cpuUsage: 0, // Simplified
                      networkRequests: networkRequestCount
                    }
                  });
                }
              }, 100);

              // Execute code in try-catch
              const result = (function() {
                'use strict';
                ${this.createSafeEnvironment()}
                return eval(code);
              })();

              clearInterval(monitorInterval);

              self.postMessage({
                type: 'success',
                result,
                metrics: {
                  executionTime: performance.now() - startTime,
                  memoryUsage,
                  cpuUsage: 0,
                  networkRequests: networkRequestCount
                }
              });

            } catch (error) {
              self.postMessage({
                type: 'error',
                error: error.message,
                stack: error.stack,
                metrics: {
                  executionTime: performance.now() - startTime,
                  memoryUsage,
                  cpuUsage: 0,
                  networkRequests: networkRequestCount
                }
              });
            }
            break;

          case 'terminate':
            self.close();
            break;
        }
      };

      // Error handler
      self.onerror = function(error) {
        self.postMessage({
          type: 'error',
          error: error.message,
          filename: error.filename,
          lineno: error.lineno,
          colno: error.colno
        });
      };

      // Unhandled promise rejection handler
      self.onunhandledrejection = function(event) {
        self.postMessage({
          type: 'error',
          error: 'Unhandled promise rejection: ' + event.reason
        });
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));

    this.worker.onmessage = (event) => {
      this.handleWorkerMessage(event.data);
    };

    this.worker.onerror = (error) => {
      console.error('Worker error:', error);
    };
  }

  private createSafeEnvironment(): string {
    return `
      // Create safe environment
      const safeGlobals = {
        console: self.console,
        setTimeout: self.setTimeout,
        setInterval: self.setInterval,
        clearTimeout: self.clearTimeout,
        clearInterval: self.clearInterval,
        Promise: self.Promise,
        Date: self.Date,
        Math: self.Math,
        JSON: self.JSON,
        Object: self.Object,
        Array: self.Array,
        String: self.String,
        Number: self.Number,
        Boolean: self.Boolean,
        RegExp: self.RegExp,
        Error: self.Error,
        TypeError: self.TypeError,
        ReferenceError: self.ReferenceError,
        SyntaxError: self.SyntaxError
      };

      // Whitelist approach - only allow safe globals
      const allowedGlobals = Object.keys(safeGlobals);
      for (const key of Object.getOwnPropertyNames(self)) {
        if (!allowedGlobals.includes(key) && key !== 'self' && key !== 'postMessage') {
          try {
            delete self[key];
          } catch (e) {
            // Some properties can't be deleted
          }
        }
      }
    `;
  }

  private handleWorkerMessage(data: any): void {
    switch (data.type) {
      case 'success':
        this.executionMetrics = data.metrics;
        this.isExecuting = false;
        break;
      case 'error':
        this.executionMetrics = data.metrics || this.executionMetrics;
        this.isExecuting = false;
        break;
      case 'console':
        // Forward console messages to main thread
        console[data.level](data.message);
        break;
    }
  }

  async executeCode(code: string, context: ExecutionContext): Promise<ExecutionResult> {
    if (this.isExecuting) {
      throw new Error('Another execution is already in progress');
    }

    if (!this.worker) {
      throw new Error('Worker not initialized');
    }

    this.isExecuting = true;
    this.executionStartTime = performance.now();

    // Sanitize code before execution
    const sanitizedCode = this.sanitizeCode(code);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.terminateExecution();
        reject(new Error('Execution timeout'));
      }, context.timeout || this.executionTimeout);

      const messageHandler = (event: MessageEvent) => {
        const data = event.data;
        
        if (data.type === 'success') {
          clearTimeout(timeout);
          this.worker!.removeEventListener('message', messageHandler);
          resolve({
            success: true,
            output: data.result,
            metrics: data.metrics,
            warnings: []
          });
        } else if (data.type === 'error') {
          clearTimeout(timeout);
          this.worker!.removeEventListener('message', messageHandler);
          resolve({
            success: false,
            error: data.error,
            metrics: data.metrics || this.executionMetrics,
            warnings: []
          });
        }
      };

      this.worker!.addEventListener('message', messageHandler);
      
      // Send code to worker for execution
      this.worker!.postMessage({
        type: 'execute',
        code: sanitizedCode,
        context: {
          ...context,
          memoryLimit: this.resourceLimits.memory,
          executionTime: this.resourceLimits.executionTime
        }
      });
    });
  }

  limitResources(limits: ResourceLimits): void {
    this.resourceLimits = { ...this.resourceLimits, ...limits };
  }

  monitorExecution(): ExecutionMetrics {
    return {
      ...this.executionMetrics,
      executionTime: this.isExecuting ? performance.now() - this.executionStartTime : this.executionMetrics.executionTime
    };
  }

  terminateExecution(): void {
    if (this.worker && this.isExecuting) {
      this.worker.postMessage({ type: 'terminate' });
      this.worker.terminate();
      this.initializeWorker(); // Reinitialize for next execution
      this.isExecuting = false;
    }
  }

  private sanitizeCode(code: string): string {
    // Remove dangerous patterns
    const dangerousPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(\s*['"`][^'"`]*['"`]/gi,
      /setInterval\s*\(\s*['"`][^'"`]*['"`]/gi,
      /new\s+Function/gi,
      /document\./gi,
      /window\./gi,
      /global\./gi,
      /process\./gi,
      /require\s*\(/gi,
      /import\s*\(/gi,
      /importScripts/gi,
      /XMLHttpRequest/gi,
      /ActiveXObject/gi,
      /WebSocket/gi,
      /EventSource/gi,
      /SharedWorker/gi,
      /ServiceWorker/gi,
      /localStorage/gi,
      /sessionStorage/gi,
      /indexedDB/gi,
      /webkitIndexedDB/gi,
      /mozIndexedDB/gi,
      /msIndexedDB/gi,
      /navigator\./gi,
      /location\./gi,
      /history\./gi
    ];

    let sanitizedCode = code;
    
    dangerousPatterns.forEach(pattern => {
      sanitizedCode = sanitizedCode.replace(pattern, '/* REMOVED_FOR_SECURITY */');
    });

    // Wrap in strict mode
    sanitizedCode = `'use strict';\n${sanitizedCode}`;

    return sanitizedCode;
  }

  destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export class IframeSandbox implements SecureSandbox {
  private iframe: HTMLIFrameElement | null = null;
  private executionTimeout: number = 30000;
  private resourceLimits: ResourceLimits = {
    memory: 100 * 1024 * 1024,
    cpu: 80,
    network: 10 * 1024 * 1024,
    storage: 50 * 1024 * 1024,
    executionTime: 30000
  };
  private executionMetrics: ExecutionMetrics = {
    executionTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkRequests: 0
  };

  async executeCode(code: string, context: ExecutionContext): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      // Create sandboxed iframe
      this.iframe = document.createElement('iframe');
      this.iframe.style.display = 'none';
      this.iframe.sandbox = 'allow-scripts';
      
      // Set CSP for additional security
      const csp = "default-src 'none'; script-src 'unsafe-inline'; object-src 'none';";
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="Content-Security-Policy" content="${csp}">
        </head>
        <body>
          <script>
            try {
              const startTime = performance.now();
              let networkRequests = 0;
              
              // Override fetch to monitor network requests
              const originalFetch = window.fetch;
              window.fetch = (...args) => {
                networkRequests++;
                if (networkRequests > 10) {
                  throw new Error('Network request limit exceeded');
                }
                return originalFetch.apply(window, args);
              };
              
              // Execute code
              const result = (function() {
                ${this.sanitizeCode(code)}
              })();
              
              const executionTime = performance.now() - startTime;
              
              parent.postMessage({
                type: 'success',
                result: result,
                metrics: {
                  executionTime,
                  memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0,
                  cpuUsage: 0,
                  networkRequests
                }
              }, '*');
              
            } catch (error) {
              parent.postMessage({
                type: 'error',
                error: error.message,
                stack: error.stack
              }, '*');
            }
          </script>
        </body>
        </html>
      `;
      
      const messageHandler = (event: MessageEvent) => {
        if (event.source !== this.iframe!.contentWindow) return;
        
        window.removeEventListener('message', messageHandler);
        
        if (this.iframe && this.iframe.parentNode) {
          this.iframe.parentNode.removeChild(this.iframe);
        }
        
        if (event.data.type === 'success') {
          resolve({
            success: true,
            output: event.data.result,
            metrics: event.data.metrics,
            warnings: []
          });
        } else {
          resolve({
            success: false,
            error: event.data.error,
            metrics: event.data.metrics || this.executionMetrics,
            warnings: []
          });
        }
      };
      
      window.addEventListener('message', messageHandler);
      
      // Set timeout
      const timeout = setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        if (this.iframe && this.iframe.parentNode) {
          this.iframe.parentNode.removeChild(this.iframe);
        }
        reject(new Error('Execution timeout'));
      }, context.timeout || this.executionTimeout);
      
      this.iframe.onload = () => {
        clearTimeout(timeout);
      };
      
      this.iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
      document.body.appendChild(this.iframe);
    });
  }

  limitResources(limits: ResourceLimits): void {
    this.resourceLimits = { ...this.resourceLimits, ...limits };
  }

  monitorExecution(): ExecutionMetrics {
    return this.executionMetrics;
  }

  terminateExecution(): void {
    if (this.iframe && this.iframe.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
      this.iframe = null;
    }
  }

  private sanitizeCode(code: string): string {
    // Similar sanitization as WebWorkerSandbox
    const dangerousPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /document\.write/gi,
      /innerHTML\s*=/gi,
      /outerHTML\s*=/gi,
      /location\./gi,
      /history\./gi,
      /navigator\./gi
    ];

    let sanitizedCode = code;
    
    dangerousPatterns.forEach(pattern => {
      sanitizedCode = sanitizedCode.replace(pattern, '/* REMOVED_FOR_SECURITY */');
    });

    return sanitizedCode;
  }
}

// Factory for creating appropriate sandbox based on environment
export class SandboxFactory {
  static createSandbox(type: 'worker' | 'iframe' = 'worker'): SecureSandbox {
    switch (type) {
      case 'worker':
        if (typeof Worker !== 'undefined') {
          return new WebWorkerSandbox();
        }
        // Fallback to iframe if Worker is not available
        return new IframeSandbox();
      case 'iframe':
        return new IframeSandbox();
      default:
        throw new Error(`Unsupported sandbox type: ${type}`);
    }
  }
}

// Export default sandbox instance
export const defaultSandbox = SandboxFactory.createSandbox('worker');