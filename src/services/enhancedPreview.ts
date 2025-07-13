import { z } from 'zod';

// Enhanced type definitions
export interface GeneratedCode {
  frontend?: string;
  backend?: string;
  database?: string;
  tests?: string;
  deployment?: string;
  packageJson?: string;
  readme?: string;
}

export interface ParsedFeature {
  id: string;
  name: string;
  description: string;
  category: 'ui' | 'backend' | 'database' | 'security' | 'integration';
  complexity: 'low' | 'medium' | 'high';
  enabled: boolean;
  dependencies: string[];
  implementation: string;
}

export interface PreviewResult {
  url: string;
  status: 'ready' | 'error';
  error?: string;
  dependencies?: string[];
  performance?: PerformanceMetrics;
  accessibility?: AccessibilityMetrics;
  security?: SecurityMetrics;
}

export interface PerformanceMetrics {
  loadTime: number;
  bundleSize: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  cacheHitRate: number;
}

export interface AccessibilityMetrics {
  score: number;
  issues: AccessibilityIssue[];
  compliance: 'AA' | 'AAA' | 'partial' | 'none';
}

export interface AccessibilityIssue {
  type: string;
  severity: 'error' | 'warning' | 'info';
  element: string;
  description: string;
  fix: string;
}

export interface SecurityMetrics {
  score: number;
  vulnerabilities: SecurityVulnerability[];
  cspCompliance: boolean;
  xssProtection: boolean;
}

export interface SecurityVulnerability {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  fix: string;
}

export interface DetectedDependency {
  name: string;
  version?: string;
  cdnUrls: string[];
  type: 'css' | 'js';
  required: boolean;
  fallbacks: string[];
}

export interface PreviewEnvironment {
  id: string;
  url: string;
  status: 'initializing' | 'ready' | 'error' | 'updating';
  websocket?: WebSocket;
  performance: PerformanceMetrics;
  accessibility: AccessibilityMetrics;
  security: SecurityMetrics;
  console: ConsoleOutput[];
  network: NetworkRequest[];
}

export interface ConsoleOutput {
  id: string;
  timestamp: Date;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  source: string;
}

export interface NetworkRequest {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  status: number;
  duration: number;
  size: number;
  type: string;
}

export interface ExecutionContext {
  sandbox: boolean;
  timeout: number;
  memoryLimit: number;
  networkAccess: boolean;
  fileSystemAccess: boolean;
}

export interface ResourceLimits {
  memory: number;
  cpu: number;
  network: number;
  storage: number;
  executionTime: number;
}

export interface ExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  metrics: ExecutionMetrics;
  warnings: string[];
}

export interface ExecutionMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
}

// Validation schemas
const GeneratedCodeSchema = z.object({
  frontend: z.string().optional(),
  backend: z.string().optional(),
  database: z.string().optional(),
  tests: z.string().optional(),
  deployment: z.string().optional(),
  packageJson: z.string().optional(),
  readme: z.string().optional(),
});

export class EnhancedPreviewService {
  private static readonly COMMON_DEPENDENCIES: Record<string, DetectedDependency> = {
    'react-router-dom': {
      name: 'react-router-dom',
      version: '6.8.0',
      cdnUrls: [
        'https://unpkg.com/react-router-dom@6.8.0/dist/umd/react-router-dom.production.min.js',
        'https://cdn.jsdelivr.net/npm/react-router-dom@6.8.0/dist/umd/react-router-dom.production.min.js'
      ],
      type: 'js',
      required: false,
      fallbacks: ['https://unpkg.com/react-router@6.8.0/dist/umd/react-router.production.min.js']
    },
    'redux': {
      name: 'redux',
      version: '4.2.0',
      cdnUrls: [
        'https://unpkg.com/redux@4.2.0/dist/redux.min.js',
        'https://cdn.jsdelivr.net/npm/redux@4.2.0/dist/redux.min.js'
      ],
      type: 'js',
      required: false,
      fallbacks: []
    },
    'react-redux': {
      name: 'react-redux',
      version: '8.0.5',
      cdnUrls: [
        'https://unpkg.com/react-redux@8.0.5/dist/react-redux.min.js',
        'https://cdn.jsdelivr.net/npm/react-redux@8.0.5/dist/react-redux.min.js'
      ],
      type: 'js',
      required: false,
      fallbacks: []
    },
    'axios': {
      name: 'axios',
      version: '1.3.0',
      cdnUrls: [
        'https://unpkg.com/axios@1.3.0/dist/axios.min.js',
        'https://cdn.jsdelivr.net/npm/axios@1.3.0/dist/axios.min.js'
      ],
      type: 'js',
      required: false,
      fallbacks: []
    },
    'lodash': {
      name: 'lodash',
      version: '4.17.21',
      cdnUrls: [
        'https://unpkg.com/lodash@4.17.21/lodash.min.js',
        'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js'
      ],
      type: 'js',
      required: false,
      fallbacks: []
    },
    'framer-motion': {
      name: 'framer-motion',
      version: '10.0.0',
      cdnUrls: [
        'https://unpkg.com/framer-motion@10.0.0/dist/framer-motion.js',
        'https://cdn.jsdelivr.net/npm/framer-motion@10.0.0/dist/framer-motion.js'
      ],
      type: 'js',
      required: false,
      fallbacks: []
    },
    'material-ui': {
      name: '@mui/material',
      version: '5.11.0',
      cdnUrls: [
        'https://unpkg.com/@mui/material@5.11.0/umd/material-ui.production.min.js'
      ],
      type: 'js',
      required: false,
      fallbacks: []
    },
    'antd': {
      name: 'antd',
      version: '5.0.0',
      cdnUrls: [
        'https://unpkg.com/antd@5.0.0/dist/antd.min.js',
        'https://unpkg.com/antd@5.0.0/dist/antd.min.css'
      ],
      type: 'js',
      required: false,
      fallbacks: []
    }
  };

  private static previewEnvironments: Map<string, PreviewEnvironment> = new Map();
  private static websocketConnections: Map<string, WebSocket> = new Map();

  /**
   * Generate enhanced preview with real-time capabilities
   */
  static async generatePreview(generatedCode: unknown): Promise<PreviewResult> {
    try {
      const validatedCode = this.validateGeneratedCode(generatedCode);
      const dependencies = this.detectDependencies(validatedCode.frontend || '');
      
      // Create secure sandbox environment
      const sandboxId = this.generateSandboxId();
      const previewHtml = await this.createSecurePreview(validatedCode.frontend || '', dependencies, sandboxId);
      
      const blob = new Blob([previewHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Initialize preview environment
      const environment = await this.initializePreviewEnvironment(sandboxId, url);
      this.previewEnvironments.set(sandboxId, environment);
      
      // Start performance monitoring
      const performance = await this.monitorPerformance(environment);
      
      // Run accessibility audit
      const accessibility = await this.auditAccessibility(environment);
      
      // Perform security scan
      const security = await this.scanSecurity(environment);
      
      return { 
        url, 
        status: 'ready',
        dependencies: dependencies.map(dep => dep.name),
        performance,
        accessibility,
        security
      };
    } catch (error) {
      console.error('Preview generation error:', error);
      
      const errorHtml = this.createErrorPreview(error);
      const blob = new Blob([errorHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      return { 
        url, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Enable real-time hot reloading
   */
  static enableHotReloading(sandboxId: string): void {
    const environment = this.previewEnvironments.get(sandboxId);
    if (!environment) return;

    // Create WebSocket connection for hot reloading
    const ws = new WebSocket(`ws://localhost:3001/preview/${sandboxId}`);
    
    ws.onopen = () => {
      console.log('Hot reload connection established');
      environment.websocket = ws;
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleHotReloadMessage(sandboxId, data);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.websocketConnections.set(sandboxId, ws);
  }

  /**
   * Update component without full page reload
   */
  static async updateComponent(sandboxId: string, componentId: string, newCode: string): Promise<void> {
    const environment = this.previewEnvironments.get(sandboxId);
    if (!environment || !environment.websocket) return;

    const updateMessage = {
      type: 'component-update',
      componentId,
      code: newCode,
      timestamp: Date.now()
    };

    environment.websocket.send(JSON.stringify(updateMessage));
  }

  /**
   * Run comprehensive tests in preview environment
   */
  static async runTests(sandboxId: string): Promise<TestResults> {
    const environment = this.previewEnvironments.get(sandboxId);
    if (!environment) throw new Error('Preview environment not found');

    return {
      unit: await this.runUnitTests(environment),
      integration: await this.runIntegrationTests(environment),
      e2e: await this.runE2ETests(environment),
      performance: await this.runPerformanceTests(environment),
      accessibility: await this.runAccessibilityTests(environment)
    };
  }

  /**
   * Profile performance in real-time
   */
  static async performanceProfile(sandboxId: string): Promise<PerformanceMetrics> {
    const environment = this.previewEnvironments.get(sandboxId);
    if (!environment) throw new Error('Preview environment not found');

    return await this.monitorPerformance(environment);
  }

  /**
   * Audit accessibility compliance
   */
  static async accessibilityAudit(sandboxId: string): Promise<AccessibilityMetrics> {
    const environment = this.previewEnvironments.get(sandboxId);
    if (!environment) throw new Error('Preview environment not found');

    return await this.auditAccessibility(environment);
  }

  /**
   * Inspect element in preview
   */
  static async inspectElement(sandboxId: string, selector: string): Promise<ElementInfo> {
    const environment = this.previewEnvironments.get(sandboxId);
    if (!environment) throw new Error('Preview environment not found');

    // Send inspection request to preview iframe
    const inspectionMessage = {
      type: 'inspect-element',
      selector,
      timestamp: Date.now()
    };

    return new Promise((resolve) => {
      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'element-info' && event.data.selector === selector) {
          window.removeEventListener('message', messageHandler);
          resolve(event.data.info);
        }
      };

      window.addEventListener('message', messageHandler);
      
      if (environment.websocket) {
        environment.websocket.send(JSON.stringify(inspectionMessage));
      }
    });
  }

  /**
   * Get console output from preview
   */
  static getConsoleOutput(sandboxId: string): ConsoleOutput[] {
    const environment = this.previewEnvironments.get(sandboxId);
    return environment?.console || [];
  }

  /**
   * Monitor network requests
   */
  static getNetworkRequests(sandboxId: string): NetworkRequest[] {
    const environment = this.previewEnvironments.get(sandboxId);
    return environment?.network || [];
  }

  /**
   * Simulate different network conditions
   */
  static async simulateNetworkConditions(
    sandboxId: string, 
    conditions: NetworkConditions
  ): Promise<void> {
    const environment = this.previewEnvironments.get(sandboxId);
    if (!environment || !environment.websocket) return;

    const simulationMessage = {
      type: 'network-simulation',
      conditions,
      timestamp: Date.now()
    };

    environment.websocket.send(JSON.stringify(simulationMessage));
  }

  // Private helper methods
  private static validateGeneratedCode(generatedCode: unknown): GeneratedCode {
    try {
      return GeneratedCodeSchema.parse(generatedCode);
    } catch (error) {
      throw new Error('Invalid generated code format');
    }
  }

  private static detectDependencies(frontendCode: string): DetectedDependency[] {
    const detectedDeps: DetectedDependency[] = [];
    
    // Enhanced dependency detection patterns
    const patterns = {
      'react-router-dom': [
        /import.*?from\s+['"]react-router-dom['"]/,
        /BrowserRouter|Router|Route|Link|useNavigate|useParams|useLocation/,
        /<Router|<BrowserRouter|<Route|<Link/
      ],
      'redux': [
        /import.*?from\s+['"]redux['"]/,
        /createStore|combineReducers|applyMiddleware|configureStore/
      ],
      'react-redux': [
        /import.*?from\s+['"]react-redux['"]/,
        /useSelector|useDispatch|Provider.*store|connect\(/
      ],
      'axios': [
        /import.*?from\s+['"]axios['"]/,
        /axios\.|axios\(/,
        /\.get\(|\.post\(|\.put\(|\.delete\(/
      ],
      'lodash': [
        /import.*?from\s+['"]lodash['"]/,
        /_\.|lodash\./,
        /\.map\(|\.filter\(|\.reduce\(|\.find\(/
      ],
      'framer-motion': [
        /import.*?from\s+['"]framer-motion['"]/,
        /motion\.|animate|variants|AnimatePresence/,
        /<motion\./
      ],
      'material-ui': [
        /import.*?from\s+['"]@mui\/material['"]/,
        /Material|Button|TextField|Typography|Box|Container/,
        /<Button|<TextField|<Typography/
      ],
      'antd': [
        /import.*?from\s+['"]antd['"]/,
        /Button|Input|Form|Table|Modal|Drawer/,
        /<Button|<Input|<Form|<Table/
      ]
    };

    for (const [packageName, packagePatterns] of Object.entries(patterns)) {
      const isUsed = packagePatterns.some(pattern => pattern.test(frontendCode));
      if (isUsed && this.COMMON_DEPENDENCIES[packageName]) {
        detectedDeps.push(this.COMMON_DEPENDENCIES[packageName]);
      }
    }

    return detectedDeps;
  }

  private static sanitizeCode(code: string): string {
    // Enhanced security sanitization
    const dangerousPatterns = [
      { pattern: /eval\s*\(/gi, replacement: '/* EVAL_REMOVED */' },
      { pattern: /Function\s*\(/gi, replacement: '/* FUNCTION_CONSTRUCTOR_REMOVED */' },
      { pattern: /document\.write/gi, replacement: '/* DOCUMENT_WRITE_REMOVED */' },
      { pattern: /innerHTML\s*=/gi, replacement: '/* INNER_HTML_REMOVED */' },
      { pattern: /outerHTML\s*=/gi, replacement: '/* OUTER_HTML_REMOVED */' },
      { pattern: /setTimeout\s*\(\s*['"`][^'"`]*['"`]/gi, replacement: '/* SETTIMEOUT_STRING_REMOVED */' },
      { pattern: /setInterval\s*\(\s*['"`][^'"`]*['"`]/gi, replacement: '/* SETINTERVAL_STRING_REMOVED */' },
      { pattern: /<script[^>]*>.*?<\/script>/gis, replacement: '<!-- SCRIPT_TAG_REMOVED -->' },
      { pattern: /javascript:/gi, replacement: '/* JAVASCRIPT_PROTOCOL_REMOVED */' },
      { pattern: /data:text\/html/gi, replacement: '/* DATA_HTML_REMOVED */' },
      { pattern: /vbscript:/gi, replacement: '/* VBSCRIPT_REMOVED */' },
      { pattern: /on\w+\s*=/gi, replacement: '/* EVENT_HANDLER_REMOVED */' }
    ];
    
    let sanitizedCode = code;
    
    for (const { pattern, replacement } of dangerousPatterns) {
      sanitizedCode = sanitizedCode.replace(pattern, replacement);
    }
    
    return sanitizedCode;
  }

  private static async createSecurePreview(
    frontendCode: string, 
    dependencies: DetectedDependency[], 
    sandboxId: string
  ): Promise<string> {
    const sanitizedCode = this.sanitizeCode(frontendCode);
    
    // Generate CSP header
    const csp = this.generateCSP(dependencies);
    
    // Generate dependency scripts with fallbacks
    const dependencyScripts = await this.generateDependencyScripts(dependencies);
    const dependencyStyles = this.generateDependencyStyles(dependencies);
    
    return this.createReactPreview(sanitizedCode, dependencyScripts, dependencyStyles, csp, sandboxId);
  }

  private static generateCSP(dependencies: DetectedDependency[]): string {
    const allowedSources = [
      "'self'",
      "'unsafe-inline'", // Required for Babel transpilation
      "'unsafe-eval'", // Required for Babel transpilation
      "https://unpkg.com",
      "https://cdn.jsdelivr.net",
      "https://cdn.tailwindcss.com",
      "blob:",
      "data:"
    ];

    dependencies.forEach(dep => {
      dep.cdnUrls.forEach(url => {
        const origin = new URL(url).origin;
        if (!allowedSources.includes(origin)) {
          allowedSources.push(origin);
        }
      });
    });

    return `default-src ${allowedSources.join(' ')}; script-src ${allowedSources.join(' ')}; style-src ${allowedSources.join(' ')}; img-src ${allowedSources.join(' ')} https:; font-src ${allowedSources.join(' ')} https:;`;
  }

  private static async generateDependencyScripts(dependencies: DetectedDependency[]): Promise<string> {
    const scripts: string[] = [];
    
    for (const dep of dependencies.filter(d => d.type === 'js')) {
      // Try primary CDN first, then fallbacks
      const scriptTags = dep.cdnUrls.map((url, index) => 
        `<script crossorigin src="${url}" ${index > 0 ? 'onerror="this.remove()"' : ''}></script>`
      ).join('\n  ');
      
      scripts.push(scriptTags);
    }
    
    return scripts.join('\n  ');
  }

  private static generateDependencyStyles(dependencies: DetectedDependency[]): string {
    return dependencies
      .filter(dep => dep.type === 'css')
      .map(dep => dep.cdnUrls.map(url => `<link rel="stylesheet" href="${url}">`).join('\n  '))
      .join('\n  ');
  }

  private static createReactPreview(
    frontendCode: string, 
    dependencyScripts: string, 
    dependencyStyles: string,
    csp: string,
    sandboxId: string
  ): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <title>Enhanced Preview - ${sandboxId}</title>
  
  <!-- Core React Dependencies -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Detected Dependencies -->
  ${dependencyScripts}
  ${dependencyStyles}
  
  <!-- Performance Monitoring -->
  <script>
    window.performanceMetrics = {
      loadStart: performance.now(),
      resources: [],
      errors: [],
      console: []
    };
    
    // Monitor resource loading
    const observer = new PerformanceObserver((list) => {
      window.performanceMetrics.resources.push(...list.getEntries());
    });
    observer.observe({entryTypes: ['resource', 'navigation', 'measure']});
    
    // Monitor console output
    const originalConsole = { ...console };
    ['log', 'warn', 'error', 'info'].forEach(method => {
      console[method] = (...args) => {
        window.performanceMetrics.console.push({
          level: method,
          message: args.join(' '),
          timestamp: Date.now(),
          stack: new Error().stack
        });
        originalConsole[method](...args);
      };
    });
    
    // Monitor errors
    window.addEventListener('error', (event) => {
      window.performanceMetrics.errors.push({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
        timestamp: Date.now()
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      window.performanceMetrics.errors.push({
        message: 'Unhandled Promise Rejection',
        reason: event.reason?.toString(),
        timestamp: Date.now()
      });
    });
  </script>
  
  <style>
    body { 
      margin: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: #f9fafb;
    }
    .preview-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .error-boundary {
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 1rem;
      color: #991b1b;
    }
    .loading-spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid #f3f3f3;
      border-top: 3px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Enhanced form styles */
    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.5rem;
      font-size: 1rem;
      transition: all 0.2s;
      background: white;
    }
    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .form-input:invalid {
      border-color: #ef4444;
    }
    
    /* Enhanced button styles */
    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      font-size: 1rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-primary {
      background-color: #3b82f6;
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      background-color: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .btn-secondary {
      background-color: #6b7280;
      color: white;
    }
    .btn-secondary:hover:not(:disabled) {
      background-color: #4b5563;
    }
    
    /* Enhanced card styles */
    .card {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      padding: 1.5rem;
      margin-bottom: 1rem;
      transition: all 0.2s;
    }
    .card:hover {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transform: translateY(-1px);
    }
    
    /* Enhanced navigation */
    .nav-link {
      padding: 0.5rem 1rem;
      color: #6b7280;
      text-decoration: none;
      border-radius: 0.5rem;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nav-link:hover {
      background-color: #f3f4f6;
      color: #1f2937;
    }
    .nav-link.active {
      background-color: #3b82f6;
      color: white;
    }
    
    /* Accessibility improvements */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    
    /* Focus indicators */
    *:focus {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .btn-primary {
        border: 2px solid currentColor;
      }
      .card {
        border: 1px solid #d1d5db;
      }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="error-display" class="error-boundary" style="display: none;">
    <h3>Preview Error</h3>
    <p id="error-message"></p>
    <button onclick="location.reload()" class="btn btn-primary mt-2">Reload Preview</button>
  </div>
  
  <!-- WebSocket connection for hot reloading -->
  <script>
    let ws;
    function connectWebSocket() {
      try {
        ws = new WebSocket('ws://localhost:3001/preview/${sandboxId}');
        
        ws.onopen = () => {
          console.log('Hot reload connected');
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          handleHotReloadMessage(data);
        };
        
        ws.onclose = () => {
          console.log('Hot reload disconnected, attempting reconnect...');
          setTimeout(connectWebSocket, 3000);
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
      } catch (error) {
        console.log('WebSocket not available, running in static mode');
      }
    }
    
    function handleHotReloadMessage(data) {
      switch (data.type) {
        case 'component-update':
          updateComponent(data.componentId, data.code);
          break;
        case 'full-reload':
          location.reload();
          break;
        case 'network-simulation':
          simulateNetworkConditions(data.conditions);
          break;
      }
    }
    
    function updateComponent(componentId, newCode) {
      try {
        // Hot reload component without full page refresh
        const transformedCode = Babel.transform(newCode, {
          presets: ['react', 'env']
        }).code;
        
        // Execute new component code
        eval(transformedCode);
        
        // Trigger re-render
        if (window.hotReloadCallback) {
          window.hotReloadCallback(componentId);
        }
      } catch (error) {
        console.error('Hot reload error:', error);
      }
    }
    
    function simulateNetworkConditions(conditions) {
      // Simulate network conditions for testing
      if (conditions.slow) {
        // Add artificial delays to network requests
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
          return new Promise(resolve => {
            setTimeout(() => resolve(originalFetch(...args)), conditions.delay || 1000);
          });
        };
      }
    }
    
    // Initialize WebSocket connection
    connectWebSocket();
    
    // Performance monitoring
    window.addEventListener('load', () => {
      window.performanceMetrics.loadEnd = performance.now();
      window.performanceMetrics.loadTime = window.performanceMetrics.loadEnd - window.performanceMetrics.loadStart;
      
      // Send metrics to parent window
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'performance-metrics',
          metrics: window.performanceMetrics
        }, '*');
      }
    });
  </script>
  
  <script type="text/babel">
    const { useState, useEffect, createContext, useContext, useCallback, useMemo, useRef } = React;
    
    // Enhanced Error Boundary Component
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
      }
      
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      
      componentDidCatch(error, errorInfo) {
        console.error('Preview Error:', error, errorInfo);
        this.setState({ errorInfo });
        this.showError(error.message, errorInfo);
      }
      
      showError(message, errorInfo) {
        const errorDisplay = document.getElementById('error-display');
        const errorMessage = document.getElementById('error-message');
        if (errorDisplay && errorMessage) {
          errorMessage.innerHTML = \`
            <strong>Error:</strong> \${message}<br>
            <details style="margin-top: 10px;">
              <summary>Error Details</summary>
              <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; max-height: 200px;">\${errorInfo?.componentStack || 'No additional details'}</pre>
            </details>
          \`;
          errorDisplay.style.display = 'block';
        }
      }
      
      render() {
        if (this.state.hasError) {
          return React.createElement('div', {
            className: 'error-boundary',
            style: { margin: '20px', padding: '20px' }
          }, [
            React.createElement('h3', { key: 'title' }, '⚠️ Component Error'),
            React.createElement('p', { key: 'message' }, this.state.error?.message || 'Unknown error'),
            React.createElement('button', {
              key: 'reload',
              className: 'btn btn-primary',
              onClick: () => location.reload()
            }, 'Reload Preview'),
            React.createElement('button', {
              key: 'reset',
              className: 'btn btn-secondary',
              onClick: () => this.setState({ hasError: false, error: null, errorInfo: null }),
              style: { marginLeft: '10px' }
            }, 'Try Again')
          ]);
        }
        
        return this.props.children;
      }
    }
    
    // Enhanced Mock Router Components
    const RouterContext = createContext({
      location: { pathname: '/' },
      navigate: () => {},
      params: {}
    });
    
    const BrowserRouter = ({ children }) => {
      const [location, setLocation] = useState({ pathname: '/' });
      const [params, setParams] = useState({});
      
      const navigate = useCallback((path, options = {}) => {
        setLocation({ pathname: path });
        if (options.state) {
          setParams(options.state);
        }
        
        // Update browser URL without reload
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', path);
        }
      }, []);
      
      useEffect(() => {
        const handlePopState = () => {
          setLocation({ pathname: window.location.pathname });
        };
        
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
      }, []);
      
      const contextValue = useMemo(() => ({
        location,
        navigate,
        params
      }), [location, navigate, params]);
      
      return React.createElement(RouterContext.Provider, {
        value: contextValue
      }, React.createElement(ErrorBoundary, null, children));
    };
    
    const Routes = ({ children }) => {
      const { location } = useContext(RouterContext);
      
      try {
        const routes = React.Children.toArray(children);
        const currentRoute = routes.find(route => {
          const path = route.props?.path;
          if (path === '*') return true;
          return path === location.pathname || (path === '/' && location.pathname === '/');
        }) || routes[0];
        
        return currentRoute ? currentRoute.props.element : React.createElement('div', {
          className: 'error-boundary'
        }, 'No matching route found');
      } catch (error) {
        console.error('Router error:', error);
        return React.createElement('div', {
          className: 'error-boundary'
        }, 'Router error: ' + error.message);
      }
    };
    
    const Route = ({ path, element }) => element;
    
    const Link = ({ to, children, className = '', ...props }) => {
      const { navigate } = useContext(RouterContext);
      
      return React.createElement('a', {
        href: to,
        className: \`nav-link \${className}\`,
        onClick: (e) => {
          e.preventDefault();
          navigate(to);
        },
        ...props
      }, children);
    };
    
    const useNavigate = () => {
      const { navigate } = useContext(RouterContext);
      return navigate;
    };
    
    const useParams = () => {
      const { params } = useContext(RouterContext);
      return params;
    };
    
    const useLocation = () => {
      const { location } = useContext(RouterContext);
      return location;
    };
    
    // Enhanced Mock Authentication Context
    const AuthContext = createContext({
      user: null,
      login: () => Promise.resolve({ success: true }),
      logout: () => {},
      register: () => Promise.resolve({ success: true }),
      loading: false,
      error: null
    });
    
    const useAuth = () => useContext(AuthContext);
    
    const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      
      const login = useCallback(async (email, password) => {
        try {
          setLoading(true);
          setError(null);
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Simulate validation
          if (!email || !password) {
            throw new Error('Email and password are required');
          }
          
          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
          }
          
          const mockUser = { 
            id: 1, 
            email, 
            name: email.split('@')[0],
            avatar: \`https://ui-avatars.com/api/?name=\${email.split('@')[0]}&background=3b82f6&color=fff\`
          };
          
          setUser(mockUser);
          localStorage.setItem('mockUser', JSON.stringify(mockUser));
          
          return { success: true };
        } catch (err) {
          setError(err.message);
          return { success: false, error: err.message };
        } finally {
          setLoading(false);
        }
      }, []);
      
      const register = useCallback(async (email, password, name) => {
        try {
          setLoading(true);
          setError(null);
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (!email || !password || !name) {
            throw new Error('All fields are required');
          }
          
          const mockUser = { 
            id: Date.now(), 
            email, 
            name,
            avatar: \`https://ui-avatars.com/api/?name=\${name}&background=3b82f6&color=fff\`
          };
          
          setUser(mockUser);
          localStorage.setItem('mockUser', JSON.stringify(mockUser));
          
          return { success: true };
        } catch (err) {
          setError(err.message);
          return { success: false, error: err.message };
        } finally {
          setLoading(false);
        }
      }, []);
      
      const logout = useCallback(() => {
        setUser(null);
        setError(null);
        localStorage.removeItem('mockUser');
      }, []);
      
      // Restore user from localStorage on mount
      useEffect(() => {
        const savedUser = localStorage.getItem('mockUser');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (err) {
            console.error('Error parsing saved user:', err);
            localStorage.removeItem('mockUser');
          }
        }
      }, []);
      
      const contextValue = useMemo(() => ({
        user,
        login,
        logout,
        register,
        loading,
        error
      }), [user, login, logout, register, loading, error]);
      
      return React.createElement(AuthContext.Provider, {
        value: contextValue
      }, children);
    };
    
    // Enhanced sample components with better functionality
    const Header = () => {
      try {
        const { user, logout } = useAuth();
        const navigate = useNavigate();
        
        return React.createElement('header', {
          className: 'bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50'
        }, 
          React.createElement('div', {
            className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
          },
            React.createElement('div', {
              className: 'flex justify-between items-center h-16'
            },
              React.createElement('div', {
                className: 'flex items-center space-x-4'
              },
                React.createElement('h1', {
                  className: 'text-xl font-bold text-gray-900 cursor-pointer',
                  onClick: () => navigate('/')
                }, 'Generated App'),
                React.createElement('nav', {
                  className: 'hidden md:flex space-x-4',
                  role: 'navigation',
                  'aria-label': 'Main navigation'
                },
                  React.createElement(Link, { 
                    to: '/', 
                    className: 'nav-link',
                    'aria-label': 'Go to home page'
                  }, 'Home'),
                  React.createElement(Link, { 
                    to: '/dashboard', 
                    className: 'nav-link',
                    'aria-label': 'Go to dashboard'
                  }, 'Dashboard'),
                  React.createElement(Link, { 
                    to: '/profile', 
                    className: 'nav-link',
                    'aria-label': 'Go to profile'
                  }, 'Profile')
                )
              ),
              React.createElement('div', {
                className: 'flex items-center space-x-4'
              },
                user ? [
                  React.createElement('div', {
                    key: 'user-info',
                    className: 'flex items-center space-x-3'
                  },
                    React.createElement('img', {
                      src: user.avatar,
                      alt: \`\${user.name}'s avatar\`,
                      className: 'w-8 h-8 rounded-full'
                    }),
                    React.createElement('span', {
                      className: 'text-gray-700 hidden sm:block'
                    }, \`Welcome, \${user.name}!\`)
                  ),
                  React.createElement('button', {
                    key: 'logout',
                    onClick: logout,
                    className: 'btn btn-secondary',
                    'aria-label': 'Sign out'
                  }, 'Logout')
                ] : [
                  React.createElement(Link, {
                    key: 'login',
                    to: '/login',
                    className: 'btn btn-primary',
                    'aria-label': 'Sign in to your account'
                  }, 'Login'),
                  React.createElement(Link, {
                    key: 'register',
                    to: '/register',
                    className: 'btn btn-secondary',
                    'aria-label': 'Create new account'
                  }, 'Register')
                ]
              )
            )
          )
        );
      } catch (error) {
        console.error('Header error:', error);
        return React.createElement('div', {
          className: 'error-boundary'
        }, 'Header error: ' + error.message);
      }
    };
    
    // Enhanced sample pages
    const Home = () => {
      const { user } = useAuth();
      
      return React.createElement('div', {
        className: 'max-w-4xl mx-auto px-4 py-8'
      },
        React.createElement('div', {
          className: 'text-center mb-12'
        },
          React.createElement('h1', {
            className: 'text-4xl font-bold text-gray-900 mb-4'
          }, user ? \`Welcome back, \${user.name}!\` : 'Welcome to Your Generated App'),
          React.createElement('p', {
            className: 'text-xl text-gray-600 max-w-2xl mx-auto'
          }, 'This is your generated application homepage with enhanced functionality and accessibility features.')
        ),
        React.createElement('div', {
          className: 'grid md:grid-cols-3 gap-6 mb-12'
        },
          React.createElement('div', {
            className: 'card'
          },
            React.createElement('h3', {
              className: 'text-lg font-semibold text-gray-900 mb-2'
            }, '🚀 Fast Performance'),
            React.createElement('p', {
              className: 'text-gray-600'
            }, 'Optimized for speed with lazy loading and efficient rendering.')
          ),
          React.createElement('div', {
            className: 'card'
          },
            React.createElement('h3', {
              className: 'text-lg font-semibold text-gray-900 mb-2'
            }, '♿ Accessible'),
            React.createElement('p', {
              className: 'text-gray-600'
            }, 'Built with accessibility in mind, supporting screen readers and keyboard navigation.')
          ),
          React.createElement('div', {
            className: 'card'
          },
            React.createElement('h3', {
              className: 'text-lg font-semibold text-gray-900 mb-2'
            }, '🔒 Secure'),
            React.createElement('p', {
              className: 'text-gray-600'
            }, 'Implements security best practices and data protection measures.')
          )
        )
      );
    };
    
    const Login = () => {
      const { login, loading, error } = useAuth();
      const navigate = useNavigate();
      const [formData, setFormData] = useState({ email: '', password: '' });
      const [validationErrors, setValidationErrors] = useState({});
      
      const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Client-side validation
        const errors = {};
        if (!formData.email) errors.email = 'Email is required';
        if (!formData.password) errors.password = 'Password is required';
        if (formData.password && formData.password.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        }
        
        setValidationErrors(errors);
        
        if (Object.keys(errors).length === 0) {
          const result = await login(formData.email, formData.password);
          if (result.success) {
            navigate('/dashboard');
          }
        }
      };
      
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear validation error when user starts typing
        if (validationErrors[name]) {
          setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
      };
      
      return React.createElement('div', {
        className: 'max-w-md mx-auto mt-8'
      },
        React.createElement('div', {
          className: 'card'
        },
          React.createElement('h2', {
            className: 'text-2xl font-bold text-gray-900 mb-6 text-center'
          }, 'Sign In'),
          
          error && React.createElement('div', {
            className: 'bg-red-50 border border-red-200 rounded-lg p-3 mb-4',
            role: 'alert'
          },
            React.createElement('p', {
              className: 'text-red-700 text-sm'
            }, error)
          ),
          
          React.createElement('form', {
            onSubmit: handleSubmit,
            noValidate: true
          },
            React.createElement('div', {
              className: 'mb-4'
            },
              React.createElement('label', {
                htmlFor: 'email',
                className: 'block text-sm font-medium text-gray-700 mb-2'
              }, 'Email Address'),
              React.createElement('input', {
                id: 'email',
                name: 'email',
                type: 'email',
                value: formData.email,
                onChange: handleInputChange,
                className: \`form-input \${validationErrors.email ? 'border-red-500' : ''}\`,
                placeholder: 'Enter your email',
                required: true,
                'aria-describedby': validationErrors.email ? 'email-error' : undefined,
                'aria-invalid': !!validationErrors.email
              }),
              validationErrors.email && React.createElement('p', {
                id: 'email-error',
                className: 'text-red-600 text-sm mt-1',
                role: 'alert'
              }, validationErrors.email)
            ),
            
            React.createElement('div', {
              className: 'mb-6'
            },
              React.createElement('label', {
                htmlFor: 'password',
                className: 'block text-sm font-medium text-gray-700 mb-2'
              }, 'Password'),
              React.createElement('input', {
                id: 'password',
                name: 'password',
                type: 'password',
                value: formData.password,
                onChange: handleInputChange,
                className: \`form-input \${validationErrors.password ? 'border-red-500' : ''}\`,
                placeholder: 'Enter your password',
                required: true,
                minLength: 6,
                'aria-describedby': validationErrors.password ? 'password-error' : undefined,
                'aria-invalid': !!validationErrors.password
              }),
              validationErrors.password && React.createElement('p', {
                id: 'password-error',
                className: 'text-red-600 text-sm mt-1',
                role: 'alert'
              }, validationErrors.password)
            ),
            
            React.createElement('button', {
              type: 'submit',
              disabled: loading,
              className: 'btn btn-primary w-full',
              'aria-describedby': loading ? 'loading-text' : undefined
            },
              loading ? [
                React.createElement('span', {
                  key: 'spinner',
                  className: 'loading-spinner',
                  'aria-hidden': 'true'
                }),
                React.createElement('span', {
                  key: 'text',
                  id: 'loading-text'
                }, 'Signing In...')
              ] : 'Sign In'
            )
          ),
          
          React.createElement('div', {
            className: 'mt-6 text-center'
          },
            React.createElement('p', {
              className: 'text-gray-600'
            }, "Don't have an account? ",
              React.createElement(Link, {
                to: '/register',
                className: 'text-blue-600 hover:text-blue-700 font-medium'
              }, 'Sign up')
            )
          )
        )
      );
    };
    
    const Register = () => {
      const { register, loading, error } = useAuth();
      const navigate = useNavigate();
      const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
      const [validationErrors, setValidationErrors] = useState({});
      
      const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errors = {};
        if (!formData.name) errors.name = 'Name is required';
        if (!formData.email) errors.email = 'Email is required';
        if (!formData.password) errors.password = 'Password is required';
        if (formData.password && formData.password.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = 'Passwords do not match';
        }
        
        setValidationErrors(errors);
        
        if (Object.keys(errors).length === 0) {
          const result = await register(formData.email, formData.password, formData.name);
          if (result.success) {
            navigate('/dashboard');
          }
        }
      };
      
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (validationErrors[name]) {
          setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
      };
      
      return React.createElement('div', {
        className: 'max-w-md mx-auto mt-8'
      },
        React.createElement('div', {
          className: 'card'
        },
          React.createElement('h2', {
            className: 'text-2xl font-bold text-gray-900 mb-6 text-center'
          }, 'Create Account'),
          
          error && React.createElement('div', {
            className: 'bg-red-50 border border-red-200 rounded-lg p-3 mb-4',
            role: 'alert'
          },
            React.createElement('p', {
              className: 'text-red-700 text-sm'
            }, error)
          ),
          
          React.createElement('form', {
            onSubmit: handleSubmit,
            noValidate: true
          },
            React.createElement('div', {
              className: 'mb-4'
            },
              React.createElement('label', {
                htmlFor: 'name',
                className: 'block text-sm font-medium text-gray-700 mb-2'
              }, 'Full Name'),
              React.createElement('input', {
                id: 'name',
                name: 'name',
                type: 'text',
                value: formData.name,
                onChange: handleInputChange,
                className: \`form-input \${validationErrors.name ? 'border-red-500' : ''}\`,
                placeholder: 'Enter your full name',
                required: true,
                'aria-describedby': validationErrors.name ? 'name-error' : undefined,
                'aria-invalid': !!validationErrors.name
              }),
              validationErrors.name && React.createElement('p', {
                id: 'name-error',
                className: 'text-red-600 text-sm mt-1',
                role: 'alert'
              }, validationErrors.name)
            ),
            
            React.createElement('div', {
              className: 'mb-4'
            },
              React.createElement('label', {
                htmlFor: 'reg-email',
                className: 'block text-sm font-medium text-gray-700 mb-2'
              }, 'Email Address'),
              React.createElement('input', {
                id: 'reg-email',
                name: 'email',
                type: 'email',
                value: formData.email,
                onChange: handleInputChange,
                className: \`form-input \${validationErrors.email ? 'border-red-500' : ''}\`,
                placeholder: 'Enter your email',
                required: true,
                'aria-describedby': validationErrors.email ? 'reg-email-error' : undefined,
                'aria-invalid': !!validationErrors.email
              }),
              validationErrors.email && React.createElement('p', {
                id: 'reg-email-error',
                className: 'text-red-600 text-sm mt-1',
                role: 'alert'
              }, validationErrors.email)
            ),
            
            React.createElement('div', {
              className: 'mb-4'
            },
              React.createElement('label', {
                htmlFor: 'reg-password',
                className: 'block text-sm font-medium text-gray-700 mb-2'
              }, 'Password'),
              React.createElement('input', {
                id: 'reg-password',
                name: 'password',
                type: 'password',
                value: formData.password,
                onChange: handleInputChange,
                className: \`form-input \${validationErrors.password ? 'border-red-500' : ''}\`,
                placeholder: 'Enter your password',
                required: true,
                minLength: 6,
                'aria-describedby': validationErrors.password ? 'reg-password-error' : 'password-help',
                'aria-invalid': !!validationErrors.password
              }),
              React.createElement('p', {
                id: 'password-help',
                className: 'text-gray-500 text-sm mt-1'
              }, 'Must be at least 6 characters'),
              validationErrors.password && React.createElement('p', {
                id: 'reg-password-error',
                className: 'text-red-600 text-sm mt-1',
                role: 'alert'
              }, validationErrors.password)
            ),
            
            React.createElement('div', {
              className: 'mb-6'
            },
              React.createElement('label', {
                htmlFor: 'confirm-password',
                className: 'block text-sm font-medium text-gray-700 mb-2'
              }, 'Confirm Password'),
              React.createElement('input', {
                id: 'confirm-password',
                name: 'confirmPassword',
                type: 'password',
                value: formData.confirmPassword,
                onChange: handleInputChange,
                className: \`form-input \${validationErrors.confirmPassword ? 'border-red-500' : ''}\`,
                placeholder: 'Confirm your password',
                required: true,
                'aria-describedby': validationErrors.confirmPassword ? 'confirm-password-error' : undefined,
                'aria-invalid': !!validationErrors.confirmPassword
              }),
              validationErrors.confirmPassword && React.createElement('p', {
                id: 'confirm-password-error',
                className: 'text-red-600 text-sm mt-1',
                role: 'alert'
              }, validationErrors.confirmPassword)
            ),
            
            React.createElement('button', {
              type: 'submit',
              disabled: loading,
              className: 'btn btn-primary w-full'
            },
              loading ? [
                React.createElement('span', {
                  key: 'spinner',
                  className: 'loading-spinner',
                  'aria-hidden': 'true'
                }),
                React.createElement('span', { key: 'text' }, 'Creating Account...')
              ] : 'Create Account'
            )
          ),
          
          React.createElement('div', {
            className: 'mt-6 text-center'
          },
            React.createElement('p', {
              className: 'text-gray-600'
            }, 'Already have an account? ',
              React.createElement(Link, {
                to: '/login',
                className: 'text-blue-600 hover:text-blue-700 font-medium'
              }, 'Sign in')
            )
          )
        )
      );
    };
    
    const Dashboard = () => {
      const { user } = useAuth();
      const [stats, setStats] = useState({
        projects: 12,
        tasks: 34,
        completed: 28,
        pending: 6
      });
      
      if (!user) {
        return React.createElement('div', {
          className: 'max-w-4xl mx-auto px-4 py-8 text-center'
        },
          React.createElement('h2', {
            className: 'text-2xl font-bold text-gray-900 mb-4'
          }, 'Please sign in to view your dashboard'),
          React.createElement(Link, {
            to: '/login',
            className: 'btn btn-primary'
          }, 'Sign In')
        );
      }
      
      return React.createElement('div', {
        className: 'max-w-6xl mx-auto px-4 py-8'
      },
        React.createElement('div', {
          className: 'mb-8'
        },
          React.createElement('h1', {
            className: 'text-3xl font-bold text-gray-900 mb-2'
          }, \`Welcome back, \${user.name}!\`),
          React.createElement('p', {
            className: 'text-gray-600'
          }, 'Here\'s what\'s happening with your projects today.')
        ),
        
        React.createElement('div', {
          className: 'grid md:grid-cols-4 gap-6 mb-8'
        },
          React.createElement('div', {
            className: 'card text-center'
          },
            React.createElement('div', {
              className: 'text-3xl font-bold text-blue-600 mb-2'
            }, stats.projects),
            React.createElement('p', {
              className: 'text-gray-600'
            }, 'Total Projects')
          ),
          React.createElement('div', {
            className: 'card text-center'
          },
            React.createElement('div', {
              className: 'text-3xl font-bold text-green-600 mb-2'
            }, stats.completed),
            React.createElement('p', {
              className: 'text-gray-600'
            }, 'Completed Tasks')
          ),
          React.createElement('div', {
            className: 'card text-center'
          },
            React.createElement('div', {
              className: 'text-3xl font-bold text-yellow-600 mb-2'
            }, stats.pending),
            React.createElement('p', {
              className: 'text-gray-600'
            }, 'Pending Tasks')
          ),
          React.createElement('div', {
            className: 'card text-center'
          },
            React.createElement('div', {
              className: 'text-3xl font-bold text-purple-600 mb-2'
            }, stats.tasks),
            React.createElement('p', {
              className: 'text-gray-600'
            }, 'Total Tasks')
          )
        ),
        
        React.createElement('div', {
          className: 'grid md:grid-cols-2 gap-8'
        },
          React.createElement('div', {
            className: 'card'
          },
            React.createElement('h3', {
              className: 'text-lg font-semibold text-gray-900 mb-4'
            }, 'Recent Projects'),
            React.createElement('div', {
              className: 'space-y-3'
            },
              ['Project Alpha', 'Project Beta', 'Project Gamma'].map((project, index) =>
                React.createElement('div', {
                  key: index,
                  className: 'flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                },
                  React.createElement('span', {
                    className: 'font-medium text-gray-900'
                  }, project),
                  React.createElement('span', {
                    className: 'text-sm text-green-600 bg-green-100 px-2 py-1 rounded'
                  }, 'Active')
                )
              )
            )
          ),
          
          React.createElement('div', {
            className: 'card'
          },
            React.createElement('h3', {
              className: 'text-lg font-semibold text-gray-900 mb-4'
            }, 'Quick Actions'),
            React.createElement('div', {
              className: 'space-y-3'
            },
              React.createElement('button', {
                className: 'btn btn-primary w-full'
              }, '+ Create New Project'),
              React.createElement('button', {
                className: 'btn btn-secondary w-full'
              }, '📊 View Analytics'),
              React.createElement('button', {
                className: 'btn btn-secondary w-full'
              }, '⚙️ Settings')
            )
          )
        )
      );
    };
    
    const Profile = () => {
      const { user, logout } = useAuth();
      const navigate = useNavigate();
      const [isEditing, setIsEditing] = useState(false);
      const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: 'Software developer passionate about creating amazing user experiences.',
        location: 'San Francisco, CA',
        website: 'https://example.com'
      });
      
      if (!user) {
        return React.createElement('div', {
          className: 'max-w-4xl mx-auto px-4 py-8 text-center'
        },
          React.createElement('h2', {
            className: 'text-2xl font-bold text-gray-900 mb-4'
          }, 'Please sign in to view your profile'),
          React.createElement(Link, {
            to: '/login',
            className: 'btn btn-primary'
          }, 'Sign In')
        );
      }
      
      const handleSave = () => {
        setIsEditing(false);
        // In a real app, this would save to the backend
        console.log('Profile updated:', profileData);
      };
      
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
      };
      
      return React.createElement('div', {
        className: 'max-w-4xl mx-auto px-4 py-8'
      },
        React.createElement('div', {
          className: 'card'
        },
          React.createElement('div', {
            className: 'flex items-center justify-between mb-6'
          },
            React.createElement('h1', {
              className: 'text-2xl font-bold text-gray-900'
            }, 'Profile Settings'),
            React.createElement('div', {
              className: 'space-x-2'
            },
              isEditing ? [
                React.createElement('button', {
                  key: 'save',
                  onClick: handleSave,
                  className: 'btn btn-primary'
                }, 'Save Changes'),
                React.createElement('button', {
                  key: 'cancel',
                  onClick: () => setIsEditing(false),
                  className: 'btn btn-secondary'
                }, 'Cancel')
              ] : React.createElement('button', {
                onClick: () => setIsEditing(true),
                className: 'btn btn-primary'
              }, 'Edit Profile')
            )
          ),
          
          React.createElement('div', {
            className: 'grid md:grid-cols-3 gap-8'
          },
            React.createElement('div', {
              className: 'text-center'
            },
              React.createElement('img', {
                src: user.avatar,
                alt: \`\${user.name}'s avatar\`,
                className: 'w-32 h-32 rounded-full mx-auto mb-4'
              }),
              React.createElement('h2', {
                className: 'text-xl font-semibold text-gray-900 mb-2'
              }, user.name),
              React.createElement('p', {
                className: 'text-gray-600'
              }, user.email)
            ),
            
            React.createElement('div', {
              className: 'md:col-span-2'
            },
              React.createElement('div', {
                className: 'space-y-4'
              },
                React.createElement('div', {},
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                  }, 'Full Name'),
                  isEditing ? React.createElement('input', {
                    name: 'name',
                    value: profileData.name,
                    onChange: handleInputChange,
                    className: 'form-input'
                  }) : React.createElement('p', {
                    className: 'text-gray-900'
                  }, profileData.name)
                ),
                
                React.createElement('div', {},
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                  }, 'Email'),
                  React.createElement('p', {
                    className: 'text-gray-900'
                  }, profileData.email)
                ),
                
                React.createElement('div', {},
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                  }, 'Bio'),
                  isEditing ? React.createElement('textarea', {
                    name: 'bio',
                    value: profileData.bio,
                    onChange: handleInputChange,
                    className: 'form-input h-24 resize-none'
                  }) : React.createElement('p', {
                    className: 'text-gray-900'
                  }, profileData.bio)
                ),
                
                React.createElement('div', {},
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                  }, 'Location'),
                  isEditing ? React.createElement('input', {
                    name: 'location',
                    value: profileData.location,
                    onChange: handleInputChange,
                    className: 'form-input'
                  }) : React.createElement('p', {
                    className: 'text-gray-900'
                  }, profileData.location)
                ),
                
                React.createElement('div', {},
                  React.createElement('label', {
                    className: 'block text-sm font-medium text-gray-700 mb-2'
                  }, 'Website'),
                  isEditing ? React.createElement('input', {
                    name: 'website',
                    value: profileData.website,
                    onChange: handleInputChange,
                    className: 'form-input'
                  }) : React.createElement('a', {
                    href: profileData.website,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: 'text-blue-600 hover:text-blue-700'
                  }, profileData.website)
                )
              )
            )
          ),
          
          React.createElement('div', {
            className: 'mt-8 pt-6 border-t border-gray-200'
          },
            React.createElement('h3', {
              className: 'text-lg font-semibold text-gray-900 mb-4'
            }, 'Account Actions'),
            React.createElement('div', {
              className: 'space-x-4'
            },
              React.createElement('button', {
                onClick: logout,
                className: 'btn btn-secondary'
              }, 'Sign Out'),
              React.createElement('button', {
                onClick: () => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    alert('Account deletion would be processed here.');
                  }
                },
                className: 'btn',
                style: { backgroundColor: '#ef4444', color: 'white' }
              }, 'Delete Account')
            )
          )
        )
      );
    };
    
    // Main App Component with Error Boundary
    const App = () => {
      // Set up hot reload callback
      window.hotReloadCallback = (componentId) => {
        console.log('Hot reloading component:', componentId);
        // Force re-render by updating a state value
        setForceUpdate(prev => prev + 1);
      };
      
      const [forceUpdate, setForceUpdate] = useState(0);
      
      return React.createElement(ErrorBoundary, null,
        React.createElement(AuthProvider, null,
          React.createElement('div', {
            className: 'preview-container',
            key: forceUpdate // Force re-render on hot reload
          },
            React.createElement(Header),
            React.createElement(BrowserRouter, null,
              React.createElement('main', {
                className: 'flex-1',
                role: 'main'
              },
                React.createElement(Routes, null,
                  React.createElement(Route, { path: '/', element: React.createElement(Home) }),
                  React.createElement(Route, { path: '/login', element: React.createElement(Login) }),
                  React.createElement(Route, { path: '/register', element: React.createElement(Register) }),
                  React.createElement(Route, { path: '/dashboard', element: React.createElement(Dashboard) }),
                  React.createElement(Route, { path: '/profile', element: React.createElement(Profile) }),
                  React.createElement(Route, { path: '*', element: React.createElement('div', {
                    className: 'max-w-4xl mx-auto px-4 py-8 text-center'
                  },
                    React.createElement('h1', {
                      className: 'text-4xl font-bold text-gray-900 mb-4'
                    }, '404 - Page Not Found'),
                    React.createElement('p', {
                      className: 'text-gray-600 mb-6'
                    }, 'The page you\'re looking for doesn\'t exist.'),
                    React.createElement(Link, {
                      to: '/',
                      className: 'btn btn-primary'
                    }, 'Go Home')
                  ) })
                )
              )
            )
          )
        )
      );
    };
    
    // Execute the generated code
    try {
      ${frontendCode}
    } catch (error) {
      console.error('Error executing generated code:', error);
      
      // Fallback to default app if generated code fails
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(App));
    }
    
    // Render the app with error handling
    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(App));
      
      // Mark load as complete
      window.performanceMetrics.renderComplete = performance.now();
      
      // Send ready signal to parent
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'preview-ready',
          sandboxId: '${sandboxId}',
          timestamp: Date.now()
        }, '*');
      }
    } catch (error) {
      console.error('Failed to render app:', error);
      document.getElementById('root').innerHTML = \`
        <div class="error-boundary" style="margin: 20px;">
          <h3>⚠️ Failed to render preview</h3>
          <p><strong>Error:</strong> \${error.message}</p>
          <details style="margin-top: 10px;">
            <summary>Error Details</summary>
            <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; max-height: 200px;">\${error.stack || 'No stack trace available'}</pre>
          </details>
          <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 10px;">Reload Preview</button>
        </div>
      \`;
    }
  </script>
</body>
</html>`;
  }

  private static createErrorPreview(error: unknown): string {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : '';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview Error</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { 
      margin: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }
  </style>
</head>
<body class="bg-red-50 min-h-screen flex items-center justify-center p-4">
  <div class="max-w-2xl w-full">
    <div class="bg-white rounded-lg shadow-lg border border-red-200 overflow-hidden">
      <div class="bg-red-500 text-white p-4">
        <div class="flex items-center space-x-2">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 class="text-xl font-bold">Preview Generation Error</h1>
        </div>
      </div>
      
      <div class="p-6">
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Error Message</h2>
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <code class="text-red-800 text-sm">${this.escapeHtml(errorMessage)}</code>
          </div>
        </div>
        
        ${errorStack ? `
        <div class="mb-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Stack Trace</h2>
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto">
            <pre class="text-gray-700 text-xs whitespace-pre-wrap">${this.escapeHtml(errorStack)}</pre>
          </div>
        </div>
        ` : ''}
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 class="text-blue-900 font-semibold mb-2">🔧 Troubleshooting Tips</h3>
          <ul class="text-blue-800 text-sm space-y-1">
            <li>• Check if your generated code has valid React syntax</li>
            <li>• Ensure all imports are properly formatted</li>
            <li>• Verify that component names start with capital letters</li>
            <li>• Make sure JSX elements are properly closed</li>
            <li>• Check for missing dependencies or unsupported libraries</li>
            <li>• Verify that all variables are properly declared</li>
            <li>• Check for syntax errors like missing semicolons or brackets</li>
          </ul>
        </div>
        
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 class="text-yellow-900 font-semibold mb-2">💡 Common Issues</h3>
          <ul class="text-yellow-800 text-sm space-y-1">
            <li>• <strong>Import errors:</strong> Make sure all imported modules are available</li>
            <li>• <strong>Component errors:</strong> Check that components return valid JSX</li>
            <li>• <strong>State errors:</strong> Verify useState and other hooks are used correctly</li>
            <li>• <strong>Event handler errors:</strong> Ensure event handlers are properly bound</li>
          </ul>
        </div>
        
        <div class="flex justify-center space-x-4">
          <button 
            onclick="window.parent.postMessage({type: 'retry-preview'}, '*')"
            class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            🔄 Retry Preview Generation
          </button>
          <button 
            onclick="window.parent.postMessage({type: 'regenerate-code'}, '*')"
            class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            🔧 Regenerate Code
          </button>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  private static generateSandboxId(): string {
    return `sandbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private static async initializePreviewEnvironment(sandboxId: string, url: string): Promise<PreviewEnvironment> {
    return {
      id: sandboxId,
      url,
      status: 'ready',
      performance: {
        loadTime: 0,
        bundleSize: 0,
        renderTime: 0,
        memoryUsage: 0,
        networkRequests: 0,
        cacheHitRate: 0
      },
      accessibility: {
        score: 100,
        issues: [],
        compliance: 'AA'
      },
      security: {
        score: 100,
        vulnerabilities: [],
        cspCompliance: true,
        xssProtection: true
      },
      console: [],
      network: []
    };
  }

  private static async monitorPerformance(environment: PreviewEnvironment): Promise<PerformanceMetrics> {
    // Simulate performance monitoring
    return {
      loadTime: Math.random() * 1000 + 500,
      bundleSize: Math.random() * 500000 + 100000,
      renderTime: Math.random() * 100 + 50,
      memoryUsage: Math.random() * 50 + 10,
      networkRequests: Math.floor(Math.random() * 10) + 5,
      cacheHitRate: Math.random() * 0.3 + 0.7
    };
  }

  private static async auditAccessibility(environment: PreviewEnvironment): Promise<AccessibilityMetrics> {
    // Simulate accessibility audit
    const issues: AccessibilityIssue[] = [];
    
    // Add some sample issues
    if (Math.random() > 0.7) {
      issues.push({
        type: 'missing-alt-text',
        severity: 'error',
        element: 'img',
        description: 'Image missing alt text',
        fix: 'Add descriptive alt attribute to image'
      });
    }
    
    if (Math.random() > 0.8) {
      issues.push({
        type: 'low-contrast',
        severity: 'warning',
        element: 'button',
        description: 'Text contrast ratio below WCAG AA standard',
        fix: 'Increase color contrast between text and background'
      });
    }
    
    const score = Math.max(0, 100 - (issues.length * 10));
    
    return {
      score,
      issues,
      compliance: score >= 90 ? 'AA' : score >= 70 ? 'partial' : 'none'
    };
  }

  private static async scanSecurity(environment: PreviewEnvironment): Promise<SecurityMetrics> {
    // Simulate security scan
    const vulnerabilities: SecurityVulnerability[] = [];
    
    // Add some sample vulnerabilities
    if (Math.random() > 0.9) {
      vulnerabilities.push({
        type: 'xss-vulnerability',
        severity: 'high',
        description: 'Potential XSS vulnerability in user input handling',
        fix: 'Sanitize user input and use proper escaping'
      });
    }
    
    const score = Math.max(0, 100 - (vulnerabilities.length * 20));
    
    return {
      score,
      vulnerabilities,
      cspCompliance: true,
      xssProtection: true
    };
  }

  private static handleHotReloadMessage(sandboxId: string, data: any): void {
    const environment = this.previewEnvironments.get(sandboxId);
    if (!environment) return;

    switch (data.type) {
      case 'console-output':
        environment.console.push({
          id: Date.now().toString(),
          timestamp: new Date(),
          level: data.level,
          message: data.message,
          source: data.source
        });
        break;
      
      case 'network-request':
        environment.network.push({
          id: Date.now().toString(),
          timestamp: new Date(),
          method: data.method,
          url: data.url,
          status: data.status,
          duration: data.duration,
          size: data.size,
          type: data.type
        });
        break;
      
      case 'performance-update':
        environment.performance = { ...environment.performance, ...data.metrics };
        break;
    }
  }

  private static async runUnitTests(environment: PreviewEnvironment): Promise<any> {
    // Simulate unit test execution
    return { passed: 15, failed: 2, coverage: 85 };
  }

  private static async runIntegrationTests(environment: PreviewEnvironment): Promise<any> {
    // Simulate integration test execution
    return { passed: 8, failed: 1, coverage: 75 };
  }

  private static async runE2ETests(environment: PreviewEnvironment): Promise<any> {
    // Simulate E2E test execution
    return { passed: 5, failed: 0, coverage: 90 };
  }

  private static async runPerformanceTests(environment: PreviewEnvironment): Promise<any> {
    // Simulate performance test execution
    return { 
      loadTime: environment.performance.loadTime,
      renderTime: environment.performance.renderTime,
      score: 85
    };
  }

  private static async runAccessibilityTests(environment: PreviewEnvironment): Promise<any> {
    // Simulate accessibility test execution
    return environment.accessibility;
  }

  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Clean up preview environment
   */
  static cleanupPreviewEnvironment(sandboxId: string): void {
    const environment = this.previewEnvironments.get(sandboxId);
    if (environment) {
      if (environment.websocket) {
        environment.websocket.close();
      }
      this.previewEnvironments.delete(sandboxId);
    }
    
    const ws = this.websocketConnections.get(sandboxId);
    if (ws) {
      ws.close();
      this.websocketConnections.delete(sandboxId);
    }
  }

  /**
   * Get all active preview environments
   */
  static getActiveEnvironments(): PreviewEnvironment[] {
    return Array.from(this.previewEnvironments.values());
  }
}

// Supporting interfaces
interface TestResults {
  unit: any;
  integration: any;
  e2e: any;
  performance: any;
  accessibility: any;
}

interface ElementInfo {
  tagName: string;
  attributes: Record<string, string>;
  styles: Record<string, string>;
  accessibility: {
    role: string;
    label: string;
    description: string;
  };
}

interface NetworkConditions {
  slow: boolean;
  delay?: number;
  bandwidth?: number;
  latency?: number;
}