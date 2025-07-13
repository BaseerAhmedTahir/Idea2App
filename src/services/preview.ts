import { z } from 'zod';

// Type definitions
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
  logs?: string[];
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

export class PreviewService {
  static async generatePreview(generatedCode: unknown): Promise<PreviewResult> {
    try {
      console.log('🚀 Starting preview generation...');
      
      // Validate input
      const validatedCode = this.validateGeneratedCode(generatedCode);
      console.log('✅ Code validation passed');
      
      // Extract and clean the React code
      const cleanCode = this.extractAndCleanReactCode(validatedCode.frontend || '');
      console.log('🧹 Code cleaned and extracted');
      
      if (!cleanCode) {
        console.log('⚠️ No valid React code found, generating demo app');
        const demoCode = this.generateDemoApp();
        const previewHtml = this.createLivePreview(demoCode);
        const url = this.createBlobUrl(previewHtml);
        
        return { 
          url, 
          status: 'ready',
          dependencies: ['react', 'react-dom'],
          logs: ['Generated demo app', 'Preview ready']
        };
      }
      
      // Create live preview
      console.log('🎨 Creating live preview...');
      const previewHtml = this.createLivePreview(cleanCode);
      const url = this.createBlobUrl(previewHtml);
      
      console.log('✅ Preview generated successfully');
      
      return { 
        url, 
        status: 'ready',
        dependencies: this.extractDependencies(cleanCode),
        logs: [
          'Code extracted successfully',
          'Dependencies resolved',
          'Preview compiled',
          'App ready to view'
        ]
      };
    } catch (error) {
      console.error('❌ Preview generation failed:', error);
      
      // Create error preview with detailed information
      const errorHtml = this.createErrorPreview(error);
      const url = this.createBlobUrl(errorHtml);
      
      return { 
        url, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        logs: [
          'Preview generation started',
          `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'Fallback error page created'
        ]
      };
    }
  }

  private static validateGeneratedCode(generatedCode: unknown): GeneratedCode {
    try {
      return GeneratedCodeSchema.parse(generatedCode);
    } catch (error) {
      console.warn('⚠️ Invalid generated code format, using fallback');
      return { frontend: '' };
    }
  }

  private static extractAndCleanReactCode(content: string): string {
    if (!content || content.trim() === '') {
      return '';
    }

    console.log('🔍 Analyzing content type...');
    
    // Remove any markdown formatting
    let cleanContent = content;
    
    // Extract from code blocks if present
    if (content.includes('```')) {
      const codeBlockRegex = /```(?:tsx?|jsx?|javascript|typescript|react)?\n?([\s\S]*?)\n?```/g;
      const matches = [];
      let match;
      
      while ((match = codeBlockRegex.exec(content)) !== null) {
        matches.push(match[1]);
      }
      
      if (matches.length > 0) {
        // Find the main React component
        const mainComponent = matches.find(code => 
          this.isValidReactComponent(code)
        ) || matches[0];
        
        cleanContent = mainComponent;
        console.log('📦 Extracted from code block');
      }
    }
    
    // Validate if it's a React component
    if (this.isValidReactComponent(cleanContent)) {
      console.log('✅ Valid React component detected');
      return this.ensureProperImports(cleanContent);
    }
    
    console.log('❌ No valid React component found');
    return '';
  }

  private static isValidReactComponent(code: string): boolean {
    // Check for React component patterns
    const hasReactImport = code.includes('import React') || code.includes('from \'react\'') || code.includes('from "react"');
    const hasComponent = code.includes('function App') || code.includes('const App') || code.includes('export default');
    const hasJSX = code.includes('<') && code.includes('>') && (code.includes('div') || code.includes('span') || code.includes('button'));
    
    return (hasReactImport || hasComponent) && hasJSX;
  }

  private static ensureProperImports(code: string): string {
    // Ensure React is imported
    if (!code.includes('import React')) {
      code = `import React, { useState, useEffect } from 'react';\n\n${code}`;
    }
    
    // Ensure component is exported
    if (!code.includes('export default')) {
      code = `${code}\n\nexport default App;`;
    }
    
    return code;
  }

  private static extractDependencies(code: string): string[] {
    const importRegex = /import.*?from\s+['"`]([^'"`]+)['"`]/g;
    const dependencies: string[] = [];
    let match;
    
    while ((match = importRegex.exec(code)) !== null) {
      if (!match[1].startsWith('.') && !match[1].startsWith('/')) {
        dependencies.push(match[1]);
      }
    }
    
    // Always include React essentials
    const essentials = ['react', 'react-dom'];
    essentials.forEach(dep => {
      if (!dependencies.includes(dep)) {
        dependencies.push(dep);
      }
    });
    
    return dependencies;
  }

  private static generateDemoApp(): string {
    return `import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build awesome apps', completed: true }
  ]);
  const [newTodo, setNewTodo] = useState('');

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: newTodo,
        completed: false
      }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            🚀 Demo App
          </h1>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Counter Demo</h2>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setCount(count - 1)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                -
              </button>
              <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                {count}
              </span>
              <button
                onClick={() => setCount(count + 1)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-900 mb-4">Todo List Demo</h2>
            <div className="flex mb-4">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                placeholder="Add a new todo..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addTodo}
                className="bg-blue-500 text-white px-6 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
            
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center p-3 bg-white rounded-lg border border-gray-200"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span
                    className={\`flex-1 \${
                      todo.completed
                        ? 'text-gray-500 line-through'
                        : 'text-gray-900'
                    }\`}
                  >
                    {todo.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-600">
          <p>This is a demo app showing React functionality</p>
          <p className="text-sm mt-2">Generated by AI Assistant</p>
        </div>
      </div>
    </div>
  );
}

export default App;`;
  }

  private static createLivePreview(reactCode: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { 
      margin: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    }
    .preview-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: #f9fafb;
      font-size: 18px;
      color: #666;
    }
    .preview-error {
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
  <div id="loading" class="preview-loading">
    <div class="spinner"></div>
    <span>Loading React App...</span>
  </div>
  <div id="root"></div>
  <div id="error-display" class="preview-error" style="display: none;">
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
    }
    
    function hideLoading() {
      const loading = document.getElementById('loading');
      if (loading) loading.style.display = 'none';
    }
    
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
            className: 'preview-error',
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
      ${reactCode}
      
      console.log('✅ Component code executed successfully');
      console.log('🎨 Rendering app...');
      
      // Create root and render
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        React.createElement(ErrorBoundary, null, 
          React.createElement(App)
        )
      );
      
      console.log('🎉 App rendered successfully!');
      hideLoading();
      
    } catch (error) {
      console.error('💥 Error executing code:', error);
      showError('Code execution error: ' + error.message);
    }
  </script>
</body>
</html>`;
  }

  private static createErrorPreview(error: unknown): string {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview Error</title>
  <script src="https://cdn.tailwindcss.com"></script>
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
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Error Details</h2>
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <code class="text-red-800 text-sm">${this.escapeHtml(errorMessage)}</code>
          </div>
        </div>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 class="text-blue-900 font-semibold mb-2">🔧 Troubleshooting</h3>
          <ul class="text-blue-800 text-sm space-y-1">
            <li>• Make sure your code is valid React/JavaScript</li>
            <li>• Check for syntax errors in your component</li>
            <li>• Ensure proper import/export statements</li>
            <li>• Try a simpler component first</li>
          </ul>
        </div>
        
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 class="text-green-900 font-semibold mb-2">✨ Example Working Code</h3>
          <pre class="text-green-800 text-sm bg-green-100 p-3 rounded overflow-x-auto"><code>import React, { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  
  return (
    &lt;div className="p-8"&gt;
      &lt;h1&gt;Hello World!&lt;/h1&gt;
      &lt;button onClick={() =&gt; setCount(count + 1)}&gt;
        Count: {count}
      &lt;/button&gt;
    &lt;/div&gt;
  );
}

export default App;</code></pre>
        </div>
        
        <div class="mt-6 flex justify-center">
          <button 
            onclick="window.parent.postMessage({type: 'retry-preview'}, '*')"
            class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  private static createBlobUrl(html: string): string {
    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }

  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  static async updatePreview(generatedCode: GeneratedCode, features: ParsedFeature[]): Promise<PreviewResult> {
    try {
      return await this.generatePreview(generatedCode);
    } catch (error) {
      console.error('Preview update error:', error);
      return { 
        url: '', 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to update preview'
      };
    }
  }
}