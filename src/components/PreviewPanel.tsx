import React, { useState, useEffect, useRef } from 'react';
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
  Save
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
  const [activeCodeTab, setActiveCodeTab] = useState('frontend');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'components']));
  const [copied, setCopied] = useState<string | null>(null);
  const [editableContent, setEditableContent] = useState<{[key: string]: string}>({});
  const [isEditing, setIsEditing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [previewLogs, setPreviewLogs] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  // Initialize editable content when code changes
  useEffect(() => {
    if (code) {
      setEditableContent({
        frontend: typeof code === 'string' ? code : code.frontend || '',
        backend: code.backend || '',
        database: code.database || '',
        package: code.packageJson || '',
        tests: code.tests || '',
        deployment: code.deployment || '',
        readme: code.readme || ''
      });
    }
  }, [code]);

  const codeFiles = [
    {
      id: 'frontend',
      name: 'App.tsx',
      path: 'src/App.tsx',
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      language: 'typescript',
      content: editableContent.frontend || ''
    },
    {
      id: 'backend',
      name: 'server.js',
      path: 'server.js',
      icon: <Server className="h-4 w-4 text-green-500" />,
      language: 'javascript',
      content: editableContent.backend || ''
    },
    {
      id: 'database',
      name: 'schema.sql',
      path: 'database/schema.sql',
      icon: <Database className="h-4 w-4 text-purple-500" />,
      language: 'sql',
      content: editableContent.database || ''
    },
    {
      id: 'package',
      name: 'package.json',
      path: 'package.json',
      icon: <FileText className="h-4 w-4 text-orange-500" />,
      language: 'json',
      content: editableContent.package || ''
    },
    {
      id: 'tests',
      name: 'App.test.tsx',
      path: 'src/App.test.tsx',
      icon: <FileText className="h-4 w-4 text-red-500" />,
      language: 'typescript',
      content: editableContent.tests || ''
    },
    {
      id: 'deployment',
      name: 'Dockerfile',
      path: 'Dockerfile',
      icon: <FileText className="h-4 w-4 text-gray-500" />,
      language: 'dockerfile',
      content: editableContent.deployment || ''
    },
    {
      id: 'readme',
      name: 'README.md',
      path: 'README.md',
      icon: <FileText className="h-4 w-4 text-blue-400" />,
      language: 'markdown',
      content: editableContent.readme || ''
    }
  ];

  const fileTree = [
    {
      name: 'src',
      type: 'folder',
      children: [
        { name: 'App.tsx', type: 'file', id: 'frontend' },
        { name: 'App.test.tsx', type: 'file', id: 'tests' },
        { name: 'index.tsx', type: 'file' },
        { name: 'index.css', type: 'file' },
        {
          name: 'components',
          type: 'folder',
          children: [
            { name: 'Header.tsx', type: 'file' },
            { name: 'AuthModal.tsx', type: 'file' },
            { name: 'ChatInterface.tsx', type: 'file' },
            { name: 'PreviewPanel.tsx', type: 'file' }
          ]
        },
        {
          name: 'services',
          type: 'folder',
          children: [
            { name: 'ai.ts', type: 'file' },
            { name: 'preview.ts', type: 'file' },
            { name: 'deployment.ts', type: 'file' }
          ]
        },
        {
          name: 'hooks',
          type: 'folder',
          children: [
            { name: 'useAuth.tsx', type: 'file' },
            { name: 'useProjects.ts', type: 'file' }
          ]
        }
      ]
    },
    { name: 'server.js', type: 'file', id: 'backend' },
    { name: 'package.json', type: 'file', id: 'package' },
    { name: 'README.md', type: 'file', id: 'readme' },
    { name: 'Dockerfile', type: 'file', id: 'deployment' },
    {
      name: 'database',
      type: 'folder',
      children: [
        { name: 'schema.sql', type: 'file', id: 'database' }
      ]
    }
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
    console.log('Saved changes:', editableContent);
  };

  const downloadCode = async () => {
    if (!code) return;

    try {
      const zip = new JSZip();

      codeFiles.forEach(file => {
        if (file.content) {
          zip.file(file.path, file.content);
        }
      });

      zip.file('.env.example', `DATABASE_URL=postgresql://username:password@localhost:5432/dbname
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
NODE_ENV=development
PORT=3001`);

      zip.file('vite.config.ts', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});`);

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'generated-app.zip');
    } catch (error) {
      console.error('Failed to download code:', error);
    }
  };

  const refreshPreview = async () => {
    setIsRefreshing(true);
    setPreviewLogs(['Refreshing preview...']);
    setPreviewKey(prev => prev + 1);
    
    if (iframeRef.current && preview?.url) {
      const newUrl = preview.url + '?t=' + Date.now();
      iframeRef.current.src = newUrl;
      setPreviewLogs(prev => [...prev, 'Reloading iframe...', 'Preview refreshed']);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const openInNewTab = () => {
    if (preview?.url) {
      window.open(preview.url, '_blank', 'noopener,noreferrer');
    }
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
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel">
    const { useState, useEffect } = React;
    
    try {
      ${reactCode}
      
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(App));
      
    } catch (error) {
      document.getElementById('root').innerHTML = \`
        <div style="padding: 20px; background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; margin: 20px; color: #991b1b;">
          <h3>Error</h3>
          <p>\${error.message}</p>
        </div>
      \`;
    }
  </script>
</body>
</html>`;
  };

  const EmptyState = ({ type }: { type: 'preview' | 'code' }) => (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          {type === 'preview' ? (
            <Eye className="h-8 w-8 text-gray-400" />
          ) : (
            <Code2 className="h-8 w-8 text-gray-400" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {type === 'preview' ? 'No Preview Available' : 'No Code Generated'}
        </h3>
        <p className="text-gray-600 mb-6">
          {type === 'preview' 
            ? 'Start a conversation with the AI to generate your app and see a live preview here.'
            : 'Describe your app idea to the AI assistant and the generated code will appear here.'
          }
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
  );

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
                {((tab.id === 'preview' && preview) || (tab.id === 'code' && code)) && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
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
                
                {preview && (
                  <button 
                    onClick={openInNewTab}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors" 
                    title="Open in New Tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
            
            {activeTab === 'code' && code && (
              <>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isEditing ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={isEditing ? 'Exit Edit Mode' : 'Edit Code'}
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
        code ? (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 p-4 bg-gray-50 flex items-center justify-center overflow-auto">
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
                  <iframe
                    key={previewKey}
                    ref={iframeRef}
                    srcDoc={createPreviewHTML(typeof code === 'string' ? code : code.frontend || '')}
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                    title="App Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState type="preview" />
        )
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
                          value={activeFile.content}
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
          <EmptyState type="code" />
        )
      )}
    </div>
  );
};

export default PreviewPanel;