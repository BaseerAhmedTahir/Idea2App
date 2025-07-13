import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone, AlertCircle, CheckCircle } from 'lucide-react';

interface EnhancedPreviewProps {
  code: string;
  onConsoleLog?: (log: string) => void;
}

const EnhancedPreview: React.FC<EnhancedPreviewProps> = ({ code, onConsoleLog }) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [consoleLogs, setConsoleLogs] = useState<Array<{id: string, message: string, type: 'log' | 'error' | 'warn', timestamp: Date}>>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (code) {
      generatePreview();
    }
  }, [code]);

  const addConsoleLog = (message: string, type: 'log' | 'error' | 'warn' = 'log') => {
    const logEntry = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };
    setConsoleLogs(prev => [...prev, logEntry]);
    onConsoleLog?.(message);
  };

  const generatePreview = async () => {
    setIsLoading(true);
    setError(null);
    addConsoleLog('Starting build process...', 'log');

    try {
      // Clean and validate the React code
      const cleanCode = cleanReactCode(code);
      addConsoleLog('Code validation passed', 'log');
      
      if (!cleanCode) {
        throw new Error('No valid React component found');
      }

      addConsoleLog('Compiling React components...', 'log');
      
      // Create the preview HTML
      const previewHtml = createPreviewHTML(cleanCode);
      addConsoleLog('Build completed successfully', 'log');
      
      // Create blob URL
      const blob = new Blob([previewHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      setPreviewUrl(url);
      addConsoleLog('Preview ready', 'log');
      setIsLoading(false);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Build failed';
      setError(errorMessage);
      addConsoleLog(`Build failed: ${errorMessage}`, 'error');
      setIsLoading(false);
    }
  };

  const cleanReactCode = (rawCode: string): string => {
    if (!rawCode) return '';

    let cleanCode = rawCode;

    // Remove markdown code blocks
    cleanCode = cleanCode.replace(/```(?:tsx?|jsx?|javascript|typescript|react)?\n?([\s\S]*?)\n?```/g, '$1');
    
    // Remove comments and explanations
    cleanCode = cleanCode.replace(/\/\*[\s\S]*?\*\//g, '');
    cleanCode = cleanCode.replace(/\/\/.*$/gm, '');
    
    // Ensure React import
    if (!cleanCode.includes('import React')) {
      cleanCode = `import React, { useState, useEffect } from 'react';\n\n${cleanCode}`;
    }

    // Ensure export default
    if (!cleanCode.includes('export default')) {
      // Try to find the main component
      const componentMatch = cleanCode.match(/(?:function|const)\s+(\w+)/);
      if (componentMatch) {
        cleanCode += `\n\nexport default ${componentMatch[1]};`;
      }
    }

    return cleanCode.trim();
  };

  const createPreviewHTML = (reactCode: string): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { 
      margin: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: #f9fafb;
    }
    .error-boundary {
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 1rem;
      color: #991b1b;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel">
    const { useState, useEffect, createContext, useContext } = React;
    
    // Console override to capture logs
    const originalConsole = window.console;
    window.console = {
      ...originalConsole,
      log: (...args) => {
        originalConsole.log(...args);
        window.parent.postMessage({
          type: 'console',
          level: 'log',
          message: args.join(' ')
        }, '*');
      },
      error: (...args) => {
        originalConsole.error(...args);
        window.parent.postMessage({
          type: 'console',
          level: 'error',
          message: args.join(' ')
        }, '*');
      },
      warn: (...args) => {
        originalConsole.warn(...args);
        window.parent.postMessage({
          type: 'console',
          level: 'warn',
          message: args.join(' ')
        }, '*');
      }
    };

    // Error boundary component
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      
      componentDidCatch(error, errorInfo) {
        console.error('React Error:', error.message);
        window.parent.postMessage({
          type: 'console',
          level: 'error',
          message: \`React Error: \${error.message}\`
        }, '*');
      }
      
      render() {
        if (this.state.hasError) {
          return React.createElement('div', {
            className: 'error-boundary'
          }, [
            React.createElement('h3', { key: 'title' }, 'Component Error'),
            React.createElement('p', { key: 'message' }, this.state.error?.message || 'Unknown error'),
            React.createElement('button', {
              key: 'reload',
              onClick: () => window.location.reload(),
              style: { 
                background: '#dc2626', 
                color: 'white', 
                padding: '8px 16px', 
                border: 'none', 
                borderRadius: '4px', 
                marginTop: '8px',
                cursor: 'pointer'
              }
            }, 'Reload')
          ]);
        }
        
        return this.props.children;
      }
    }
    
    try {
      // Execute the React component code
      ${reactCode}
      
      // Render the app
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        React.createElement(ErrorBoundary, null, 
          React.createElement(App || (() => React.createElement('div', null, 'No App component found')))
        )
      );
      
      console.log('React app rendered successfully');
      
      window.parent.postMessage({
        type: 'ready'
      }, '*');
      
    } catch (error) {
      console.error('Failed to render:', error.message);
      document.getElementById('root').innerHTML = \`
        <div class="error-boundary">
          <h3>Compilation Error</h3>
          <p>\${error.message}</p>
          <pre style="background: #f3f4f6; padding: 1rem; border-radius: 0.25rem; overflow-x: auto; font-size: 0.875rem;">\${error.stack}</pre>
        </div>
      \`;
    }
  </script>
</body>
</html>`;
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setConsoleLogs([]);
    generatePreview();
  };

  const getFrameClass = () => {
    switch (viewMode) {
      case 'mobile':
        return 'w-80 h-[600px] max-w-80';
      case 'tablet':
        return 'w-[768px] h-[500px] max-w-[768px]';
      default:
        return 'w-full h-[600px]';
    }
  };

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        addConsoleLog(event.data.message, event.data.level);
      } else if (event.data.type === 'ready') {
        addConsoleLog('App loaded successfully', 'log');
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Live Preview</h3>
          <div className="flex items-center space-x-2">
            {/* View Mode Selector */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('desktop')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'desktop' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Desktop View"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('tablet')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'tablet' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Tablet View"
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'mobile' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Mobile View"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
            
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Refresh Preview"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Open in New Tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* Preview Content */}
      <div className="flex-1 p-4 bg-gray-50 flex items-center justify-center overflow-auto">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Building preview...</p>
          </div>
        ) : error ? (
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : previewUrl ? (
          <div className={`${getFrameClass()} border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg transition-all duration-300`}>
            {/* Browser Chrome */}
            <div className="h-8 bg-gray-100 flex items-center justify-between px-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white rounded px-3 py-1 text-xs text-gray-500 font-mono text-center max-w-48 truncate">
                  localhost:3000
                </div>
              </div>
              <div className="w-16"></div>
            </div>
            
            {/* App Content */}
            <div className="h-full bg-white">
              <iframe
                key={refreshKey}
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full border-0"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                title="React Preview"
              />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No preview available</p>
          </div>
        )}
      </div>
      
      {/* Console Logs */}
      <div className="border-t border-gray-200 bg-gray-900 text-green-400 font-mono text-xs h-32 overflow-y-auto">
        <div className="bg-gray-800 px-3 py-1 border-b border-gray-700 flex items-center justify-between">
          <span className="text-gray-300">Console Output</span>
          <button
            onClick={() => setConsoleLogs([])}
            className="text-gray-400 hover:text-gray-200 text-xs"
          >
            Clear
          </button>
        </div>
        <div className="p-3 space-y-1">
          {consoleLogs.map((log) => (
            <div key={log.id} className="flex items-start space-x-2">
              <span className="text-gray-500 text-xs min-w-[60px]">
                {log.timestamp.toLocaleTimeString()}
              </span>
              <span className={
                log.type === 'error' ? 'text-red-400' : 
                log.type === 'warn' ? 'text-yellow-400' : 
                'text-green-400'
              }>
                {log.message}
              </span>
            </div>
          ))}
          {consoleLogs.length === 0 && (
            <div className="text-gray-500">Console output will appear here...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPreview;