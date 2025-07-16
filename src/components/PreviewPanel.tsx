import React, { useState, useRef, useEffect } from 'react';
import { 
  Eye, 
  Code2, 
  Monitor, 
  Smartphone, 
  Tablet, 
  ExternalLink, 
  RefreshCw, 
  Download,
  FileText,
  Database,
  Server,
  Maximize2,
  Minimize2,
  Copy,
  CheckCircle2,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Edit3,
  Save,
  AlertCircle
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface PreviewPanelProps {
  code?: any;
  preview?: any;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ code, preview }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState('src/App.js');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'public']));
  const [copied, setCopied] = useState<string | null>(null);
  const [editableContent, setEditableContent] = useState<{[key: string]: string}>({});
  const [isEditing, setIsEditing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [consoleLogs, setConsoleLogs] = useState<Array<{id: string, message: string, type: 'log' | 'error' | 'warn', timestamp: Date}>>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const tabs = [
    { id: 'preview', name: 'Preview', icon: <Eye className="h-4 w-4" /> },
    { id: 'code', name: 'Code', icon: <Code2 className="h-4 w-4" /> }
  ];

  const viewModes = [
    { id: 'desktop', name: 'Desktop', icon: <Monitor className="h-4 w-4" /> },
    { id: 'tablet', name: 'Tablet', icon: <Tablet className="h-4 w-4" /> },
    { id: 'mobile', name: 'Mobile', icon: <Smartphone className="h-4 w-4" /> }
  ];

  useEffect(() => {
    if (code) {
      setEditableContent(code);
      // Generate preview when code is available
      generatePreview();
    }
  }, [code]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        addConsoleLog(event.data.message, event.data.level);
      } else if (event.data.type === 'ready') {
        addConsoleLog('React app loaded successfully', 'log');
        setPreviewError(null);
      } else if (event.data.type === 'error') {
        addConsoleLog(`Error: ${event.data.message}`, 'error');
        setPreviewError(event.data.message);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const addConsoleLog = (message: string, type: 'log' | 'error' | 'warn' = 'log') => {
    const logEntry = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };
    setConsoleLogs(prev => [...prev.slice(-50), logEntry]);
  };

  const generatePreview = () => {
    if (!code) {
      console.log('No code available for preview');
      return;
    }

    try {
      // Try different possible locations for the React code
      const appCode = code['src/App.js'] || code['App.js'] || code.frontend || '';
      
      if (!appCode) {
        console.log('No React app code found');
        setPreviewError('No React app code found');
        return;
      }
      
      const previewHtml = createPreviewHTML(appCode);
      
      // Create blob URL for the preview
      const blob = new Blob([previewHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Clean up previous URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setPreviewUrl(url);
      setPreviewError(null);
      addConsoleLog('Preview generated successfully', 'log');
    } catch (error) {
      console.error('Preview generation failed:', error);
      setPreviewError(error instanceof Error ? error.message : 'Preview generation failed');
      addConsoleLog(`Preview generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const createPreviewHTML = (appCode: string): string => {
    if (!appCode || appCode.trim() === '') {
      return createNoCodeHTML();
    }

    // Clean the React code for browser execution
    const cleanCode = cleanReactCodeForBrowser(appCode);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React App Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { 
      margin: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }
    .error-boundary {
      background: #fee2e2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 1rem;
      color: #991b1b;
    }
    .spinner {
      border: 3px solid #f3f4f6;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      animation: spin 1s linear infinite;
      margin-right: 12px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div id="loading" style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #f9fafb; font-size: 18px; color: #666;">
    <div class="spinner"></div>
    <span>Loading React App...</span>
  </div>
  <div id="root"></div>
  <div id="error-display" class="error-boundary" style="display: none;">
    <h3>Preview Error</h3>
    <p id="error-message"></p>
    <button onclick="location.reload()" style="background: #3b82f6; color: white; padding: 8px 16px; border: none; border-radius: 4px; margin-top: 8px; cursor: pointer;">
      Reload Preview
    </button>
  </div>
  
  <script type="text/babel">
    console.log('🚀 Starting React app...');
    
    const { useState, useEffect, createContext, useContext } = React;
    
    // Global error handlers
    window.addEventListener('error', (event) => {
      console.error('❌ Global error:', event.error);
      showError(event.error?.message || 'Unknown error occurred');
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('❌ Unhandled promise rejection:', event.reason);
      showError(event.reason?.message || 'Promise rejection occurred');
    });
    
    function showError(message) {
      const loading = document.getElementById('loading');
      const errorDisplay = document.getElementById('error-display');
      const errorMessage = document.getElementById('error-message');
      
      if (loading) loading.style.display = 'none';
      if (errorDisplay && errorMessage) {
        errorMessage.textContent = message;
        errorDisplay.style.display = 'block';
      }
      
      window.parent.postMessage({
        type: 'error',
        message: message
      }, '*');
    }
    
    function hideLoading() {
      const loading = document.getElementById('loading');
      if (loading) loading.style.display = 'none';
    }
    
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
    
    // Error Boundary Component
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      
      static getDerivedStateFromError(error) {
        console.error('🚨 Error boundary caught error:', error);
        return { hasError: true, error };
      }
      
      componentDidCatch(error, errorInfo) {
        console.error('🚨 Component error:', error, errorInfo);
        showError(error.message);
      }
      
      render() {
        if (this.state.hasError) {
          return React.createElement('div', {
            className: 'error-boundary',
            style: { margin: '20px' }
          }, [
            React.createElement('h3', { key: 'title' }, 'Component Error'),
            React.createElement('p', { key: 'message' }, this.state.error?.message || 'Unknown error'),
            React.createElement('button', {
              key: 'reload',
              onClick: () => location.reload(),
              style: { 
                background: '#3b82f6', 
                color: 'white', 
                padding: '8px 16px', 
                border: 'none', 
                borderRadius: '4px', 
                marginTop: '8px',
                cursor: 'pointer'
              }
            }, 'Reload Preview')
          ]);
        }
        
        return this.props.children;
      }
    }
    
    try {
      console.log('📦 Executing React component code...');
      
      // Execute the generated React code
      ${cleanCode}
      
      console.log('✅ Component code executed successfully');
      console.log('🎨 Rendering app...');
      
      // Create root and render
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        React.createElement(ErrorBoundary, null, 
          React.createElement(App || (() => React.createElement('div', { 
            style: { padding: '20px', textAlign: 'center' } 
          }, 'App component not found')))
        )
      );
      
      console.log('🎉 App rendered successfully!');
      hideLoading();
      
      window.parent.postMessage({ type: 'ready' }, '*');
      
    } catch (error) {
      console.error('💥 Error executing code:', error);
      showError('Code execution error: ' + error.message);
    }
  </script>
</body>
</html>`;
  };

  const createNoCodeHTML = (): string => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>No Code Generated</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
  <div class="text-center max-w-md mx-auto p-8">
    <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg class="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    </div>
    <h1 class="text-xl font-bold text-gray-900 mb-2">No Code Generated Yet</h1>
    <p class="text-gray-600 mb-4">Start a conversation with the AI to generate your React app and see a live preview here.</p>
    <div class="bg-white border border-gray-200 rounded-lg p-4 text-left">
      <p class="text-sm text-gray-700 mb-2">Try saying:</p>
      <ul class="text-sm text-gray-600 space-y-1">
        <li>• "Create a todo app"</li>
        <li>• "Build a calculator"</li>
        <li>• "Make a weather app"</li>
      </ul>
    </div>
  </div>
  <script>
    console.log('Preview ready - no code to display');
    window.parent.postMessage({ type: 'ready' }, '*');
  </script>
</body>
</html>`;
  };

  const cleanReactCodeForBrowser = (reactCode: string): string => {
    if (!reactCode) return '';

    let cleanCode = reactCode;

    // Remove all import statements
    cleanCode = cleanCode.replace(/import\s+.*?from\s+['"][^'"]+['"];?\s*/g, '');
    cleanCode = cleanCode.replace(/import\s+['"][^'"]+['"];?\s*/g, '');

    // Remove export statements
    cleanCode = cleanCode.replace(/export\s+default\s+/g, '');
    cleanCode = cleanCode.replace(/export\s+\{[^}]*\}\s*;?\s*/g, '');

    // Ensure React hooks are available at the top
    const needsHooks = cleanCode.includes('useState') || cleanCode.includes('useEffect') || cleanCode.includes('useContext') || cleanCode.includes('useCallback') || cleanCode.includes('useMemo');
    if (needsHooks) {
      cleanCode = `const { useState, useEffect, useContext, useCallback, useMemo, createContext } = React;\n\n${cleanCode}`;
    }

    // Ensure the App function is properly defined
    if (!cleanCode.includes('function App') && !cleanCode.includes('const App')) {
      // If no App component found, create a simple one
      cleanCode = `function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Generated App</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Your app content will appear here.</p>
        </div>
      </div>
    </div>
  );
}`;
    }

    return cleanCode.trim();
  };

  const codeFiles = code ? Object.keys(code).map(filePath => {
    const fileName = filePath.split('/').pop() || filePath;
    const isJs = filePath.endsWith('.js') || filePath.endsWith('.jsx');
    const isJson = filePath.endsWith('.json');
    const isHtml = filePath.endsWith('.html');
    const isCss = filePath.endsWith('.css');
    const isMd = filePath.endsWith('.md');
    
    return {
      id: filePath,
      name: fileName,
      path: filePath,
      icon: isJs ? <Code2 className="h-4 w-4 text-yellow-500" /> :
            isJson ? <FileText className="h-4 w-4 text-orange-500" /> :
            isHtml ? <FileText className="h-4 w-4 text-red-500" /> :
            isCss ? <FileText className="h-4 w-4 text-blue-500" /> :
            isMd ? <FileText className="h-4 w-4 text-gray-500" /> :
            <FileText className="h-4 w-4 text-gray-400" />,
      language: isJs ? 'javascript' : isJson ? 'json' : isHtml ? 'html' : isCss ? 'css' : isMd ? 'markdown' : 'text',
      content: code[filePath] || ''
    };
  }) : [];

  const fileTree = [
    {
      name: 'src',
      type: 'folder',
      children: codeFiles.filter(f => f.path.startsWith('src/')).map(f => ({
        name: f.name,
        type: 'file',
        id: f.id
      }))
    },
    {
      name: 'public',
      type: 'folder',
      children: codeFiles.filter(f => f.path.startsWith('public/')).map(f => ({
        name: f.name,
        type: 'file',
        id: f.id
      }))
    },
    ...codeFiles.filter(f => !f.path.includes('/')).map(f => ({
      name: f.name,
      type: 'file',
      id: f.id
    }))
  ];

  const getFrameClass = () => {
    if (isFullscreen) return 'w-full h-full';
    
    switch (viewMode) {
      case 'mobile':
        return 'w-80 h-[600px] max-w-80';
      case 'tablet':
        return 'w-[768px] h-[500px] max-w-[768px]';
      default:
        return 'w-full h-[600px]';
    }
  };

  const toggleFolder = (folderName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  const copyToClipboard = async (content: string, fileId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(fileId);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCodeChange = (fileId: string, newContent: string) => {
    setEditableContent(prev => ({
      ...prev,
      [fileId]: newContent
    }));
  };

  const saveChanges = () => {
    setIsEditing(false);
    setPreviewKey(prev => prev + 1);
    generatePreview(); // Regenerate preview with updated code
    addConsoleLog('Code changes saved and preview updated', 'log');
  };

  const downloadCode = async () => {
    if (!code) return;

    try {
      const zip = new JSZip();

      Object.keys(code).forEach(filePath => {
        zip.file(filePath, code[filePath]);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'react-app.zip');
      addConsoleLog('Code downloaded successfully', 'log');
    } catch (error) {
      console.error('Failed to download code:', error);
      addConsoleLog('Failed to download code', 'error');
    }
  };

  const refreshPreview = async () => {
    setIsRefreshing(true);
    addConsoleLog('Refreshing preview...', 'log');
    setPreviewKey(prev => prev + 1);
    setPreviewError(null);
    
    setTimeout(() => {
      generatePreview();
      setIsRefreshing(false);
      addConsoleLog('Preview refreshed', 'log');
    }, 1000);
  };

  const renderFileTree = (items: any[], level = 0) => {
    return items.map((item, index) => (
      <div key={index} style={{ marginLeft: `${level * 16}px` }}>
        {item.type === 'folder' ? (
          <div>
            <button
              onClick={() => toggleFolder(item.name)}
              className="flex items-center space-x-1 py-1 px-2 hover:bg-gray-100 rounded text-sm w-full text-left"
            >
              {expandedFolders.has(item.name) ? (
                <ChevronDown className="h-3 w-3 text-gray-500" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-500" />
              )}
              <FolderOpen className="h-4 w-4 text-blue-500" />
              <span className="text-gray-700">{item.name}</span>
            </button>
            {expandedFolders.has(item.name) && item.children && (
              <div>
                {renderFileTree(item.children, level + 1)}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => item.id && setActiveCodeTab(item.id)}
            className={`flex items-center space-x-2 py-1 px-2 hover:bg-gray-100 rounded text-sm w-full text-left ${
              activeCodeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`}
          >
            <FileText className="h-4 w-4 text-gray-400" />
            <span>{item.name}</span>
            {item.id && editableContent[item.id] && (
              <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
            )}
          </button>
        )}
      </div>
    ));
  };

  return (
    <div className={`flex flex-col h-full bg-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
                {tab.id === 'preview' && previewUrl && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
                {tab.id === 'code' && code && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {activeTab === 'preview' && (
              <>
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  {viewModes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id as any)}
                      className={`p-2 rounded transition-colors ${
                        viewMode === mode.id 
                          ? 'bg-white shadow text-blue-600' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title={mode.name}
                    >
                      {mode.icon}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                
                <button 
                  onClick={refreshPreview}
                  disabled={isRefreshing}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </>
            )}
            
            {activeTab === 'code' && code && (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isEditing ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={isEditing ? 'Save Changes' : 'Edit Code'}
                >
                  {isEditing ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                  <span>{isEditing ? 'Save' : 'Edit'}</span>
                </button>
                
                <button 
                  onClick={downloadCode}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  title="Download Code"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {activeTab === 'preview' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-4 bg-gray-50 flex items-center justify-center overflow-auto">
            {!code || !code['src/App.js'] ? (
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Preview Available</h3>
                <p className="text-gray-600 mb-6">
                  Generate code using the chat interface to see a live preview here.
                </p>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-left">
                  <p className="text-sm text-gray-700 mb-2">Try saying:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• "Create a todo app"</li>
                    <li>• "Build a calculator"</li>
                    <li>• "Make a weather app"</li>
                  </ul>
                </div>
              </div>
            ) : previewError ? (
              <div className="text-center max-w-md mx-auto p-8">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Error</h3>
                <p className="text-gray-600 mb-4">{previewError}</p>
                <button
                  onClick={refreshPreview}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry Preview
                </button>
              </div>
            ) : (
              <div className={`${getFrameClass()} border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg transition-all duration-300`}>
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
                
                <div className="h-full bg-white">
                  {previewUrl ? (
                    <iframe
                      key={previewKey}
                      ref={iframeRef}
                      src={previewUrl}
                      className="w-full h-full border-0"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                      title="React App Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Generating preview...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
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
      ) : (
        code ? (
          <div className="flex-1 flex overflow-hidden">
            <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Project Files</h3>
              <div className="space-y-1">
                {renderFileTree(fileTree)}
              </div>
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="border-b border-gray-200 bg-white overflow-x-auto">
                <div className="flex items-center space-x-1 px-4 py-2 min-w-max">
                  {codeFiles.filter(file => file.content).map((file) => (
                    <button
                      key={file.id}
                      onClick={() => setActiveCodeTab(file.id)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-t-lg text-sm transition-colors whitespace-nowrap ${
                        activeCodeTab === file.id
                          ? 'bg-gray-100 text-gray-900 border-b-2 border-blue-500'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {file.icon}
                      <span>{file.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 bg-gray-900 text-gray-300 overflow-hidden">
                {(() => {
                  const activeFile = codeFiles.find(f => f.id === activeCodeTab);
                  if (!activeFile || !activeFile.content) {
                    return (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Code2 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                          <p className="text-gray-500">No code available for this file</p>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="relative h-full flex flex-col">
                      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
                        {isEditing && (
                          <button
                            onClick={saveChanges}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                          >
                            <Save className="h-4 w-4" />
                            <span>Save</span>
                          </button>
                        )}
                        <button
                          onClick={() => copyToClipboard(activeFile.content, activeFile.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
                        >
                          {copied === activeFile.id ? (
                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          <span>{copied === activeFile.id ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                      
                      {isEditing ? (
                        <textarea
                          value={editableContent[activeFile.id] || activeFile.content}
                          onChange={(e) => handleCodeChange(activeFile.id, e.target.value)}
                          className="flex-1 p-4 bg-gray-900 text-gray-300 font-mono text-sm resize-none border-0 outline-0 overflow-auto"
                          style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
                        />
                      ) : (
                        <div className="flex-1 overflow-auto">
                          <pre className="p-4 text-sm h-full overflow-auto">
                            <code style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}>
                              {activeFile.content}
                            </code>
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code2 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Code Generated</h3>
              <p className="text-gray-600 mb-6">
                Describe your app idea to the AI assistant and the generated code will appear here.
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-left">
                <p className="text-sm text-gray-700 mb-2">Try saying:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• "Create a todo app with user authentication"</li>
                  <li>• "Build a blog platform with comments"</li>
                  <li>• "Make an e-commerce store"</li>
                </ul>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default PreviewPanel;
