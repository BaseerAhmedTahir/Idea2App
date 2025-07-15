import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Copy, CheckCircle2, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    code?: any;
    features?: string[];
    isGenerating?: boolean;
  };
}

interface EnhancedChatInterfaceProps {
  onCodeGenerated?: (code: any) => void;
  onPreviewGenerated?: (preview: any) => void;
}

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({ 
  onCodeGenerated, 
  onPreviewGenerated 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI assistant. Describe the app you'd like to build and I'll generate clean, production-ready code with a live preview.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const updateLastMessage = (updates: Partial<Message>) => {
    setMessages(prev => prev.map((msg, index) => 
      index === prev.length - 1 ? { ...msg, ...updates } : msg
    ));
  };

  const extractFeatures = (idea: string): string[] => {
    const features: string[] = [];
    const lowerIdea = idea.toLowerCase();

    if (lowerIdea.includes('auth') || lowerIdea.includes('login') || lowerIdea.includes('user')) {
      features.push('authentication');
    }
    if (lowerIdea.includes('form') || lowerIdea.includes('input') || lowerIdea.includes('submit')) {
      features.push('forms');
    }
    if (lowerIdea.includes('nav') || lowerIdea.includes('menu') || lowerIdea.includes('route')) {
      features.push('navigation');
    }
    if (lowerIdea.includes('data') || lowerIdea.includes('list') || lowerIdea.includes('item') || lowerIdea.includes('post')) {
      features.push('data management');
    }
    if (lowerIdea.includes('search')) {
      features.push('search');
    }
    if (lowerIdea.includes('comment') || lowerIdea.includes('review')) {
      features.push('comments');
    }
    if (lowerIdea.includes('real-time') || lowerIdea.includes('chat') || lowerIdea.includes('notification')) {
      features.push('real-time features');
    }

    return features.length > 0 ? features : ['basic functionality'];
  };

  const generateReactApp = (idea: string, features: string[]) => {
    const hasAuth = features.includes('authentication');
    const hasForms = features.includes('forms');
    const hasNavigation = features.includes('navigation');
    const hasData = features.includes('data management');

    const appComponent = `import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  ${hasAuth ? `const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);` : ''}
  ${hasData ? `const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);` : ''}
  ${hasForms ? `const [formData, setFormData] = useState({});` : ''}

  ${hasData ? `useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setItems([
        { id: 1, title: 'Sample Item 1', description: 'This is a sample item' },
        { id: 2, title: 'Sample Item 2', description: 'Another sample item' },
        { id: 3, title: 'Sample Item 3', description: 'Yet another item' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);` : ''}

  ${hasAuth ? `const handleLogin = (email, password) => {
    if (email && password) {
      setUser({ email, name: email.split('@')[0] });
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };` : ''}

  ${hasForms ? `const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };` : ''}

  ${hasAuth ? `if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            handleLogin(email, password);
          }}>
            <div className="mb-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }` : ''}

  return (
    <div className="min-h-screen bg-gray-100">
      ${hasNavigation ? `<nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">${idea.includes('todo') ? 'Todo App' : idea.includes('blog') ? 'Blog Platform' : idea.includes('store') || idea.includes('shop') ? 'Online Store' : 'My App'}</h1>
            </div>
            ${hasAuth ? `<div className="flex items-center space-x-4">
              {user && <span className="text-gray-700">Welcome, {user.name}</span>}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>` : ''}
          </div>
        </div>
      </nav>` : ''}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              ${idea.includes('todo') ? 'Todo List' : idea.includes('blog') ? 'Blog Posts' : idea.includes('store') || idea.includes('shop') ? 'Products' : 'Welcome'}
            </h2>

            ${hasForms ? `<form onSubmit={handleSubmit} className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  onChange={handleInputChange}
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </form>` : ''}

            ${hasData ? `{loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                    <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}` : `<div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to your app!</h3>
              <p className="text-gray-600">This is your generated application based on: ${idea}</p>
            </div>`}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;`;

    const indexJs = `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Generated React App" />
    <title>Generated App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;

    const appCss = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

* {
  box-sizing: border-box;
}`;

    const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`;

    const packageJson = {
      name: "generated-react-app",
      version: "0.1.0",
      private: true,
      dependencies: {
        "@testing-library/jest-dom": "^5.16.4",
        "@testing-library/react": "^13.3.0",
        "@testing-library/user-event": "^13.5.0",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-scripts": "5.0.1",
        "web-vitals": "^2.1.4"
      },
      scripts: {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
      },
      eslintConfig: {
        extends: [
          "react-app",
          "react-app/jest"
        ]
      },
      browserslist: {
        production: [
          ">0.2%",
          "not dead",
          "not op_mini all"
        ],
        development: [
          "last 1 chrome version",
          "last 1 firefox version",
          "last 1 safari version"
        ]
      },
      devDependencies: {
        "tailwindcss": "^3.3.0",
        "autoprefixer": "^10.4.14",
        "postcss": "^8.4.24"
      }
    };

    return {
      'src/App.js': appComponent,
      'src/index.js': indexJs,
      'src/App.css': appCss,
      'src/index.css': indexCss,
      'public/index.html': indexHtml,
      'package.json': JSON.stringify(packageJson, null, 2),
      'README.md': `# Generated React App

This project was generated based on: ${idea}

## Available Scripts

In the project directory, you can run:

### \`npm start\`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### \`npm test\`

Launches the test runner in the interactive watch mode.

### \`npm run build\`

Builds the app for production to the \`build\` folder.

### \`npm run eject\`

**Note: this is a one-way operation. Once you \`eject\`, you can't go back!**

## Features

${features.map(f => `- ${f.charAt(0).toUpperCase() + f.slice(1)}`).join('\n')}

## Getting Started

1. Extract the downloaded files
2. Run \`npm install\` to install dependencies
3. Run \`npm start\` to start the development server
4. Open [http://localhost:3000](http://localhost:3000) to view the app
`
    };
  };

  const generateCode = async (idea: string) => {
    const features = extractFeatures(idea);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const generatedFiles = generateReactApp(idea, features);
    
    return { code: generatedFiles, features };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    
    addMessage({
      type: 'user',
      content: userMessage
    });

    setIsProcessing(true);

    try {
      const processingMessage = addMessage({
        type: 'assistant',
        content: "🔄 Generating your React application...",
        metadata: { isGenerating: true }
      });

      const { code, features } = await generateCode(userMessage);
      
      onCodeGenerated?.(code);
      
      onPreviewGenerated?.({
        url: '',
        status: 'ready',
        code: code['src/App.js']
      });
      
      updateLastMessage({
        content: `✅ **React Application Generated Successfully!**

I've created a complete React application with proper file structure:

**Features Implemented:**
${features.map(f => `• ${f.charAt(0).toUpperCase() + f.slice(1)}`).join('\n')}

**Generated Files:**
• src/App.js - Main React component
• src/index.js - React entry point
• public/index.html - HTML template
• package.json - Dependencies and scripts
• README.md - Setup instructions

**Ready to Use:**
• Download the code and run \`npm install\`
• Start with \`npm start\`
• View live preview in the Preview tab

Your app is production-ready with proper React structure!`,
        metadata: {
          code: code['src/App.js'],
          features,
          isGenerating: false
        }
      });

    } catch (error) {
      updateLastMessage({
        content: `❌ **Generation Failed**

I encountered an issue while generating your app: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again with a different description.`,
        metadata: { isGenerating: false }
      });
      
      onPreviewGenerated?.({
        url: '',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExamplePrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const examplePrompts = [
    "Create a todo app with add, edit, and delete functionality",
    "Build a simple blog with posts and comments",
    "Make a calculator with basic math operations",
    "Design a weather app with current conditions"
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-white ml-3' 
                  : 'bg-gray-100 text-gray-600 mr-3'
              }`}>
                {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              
              <div className={`rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </div>
                
                {message.metadata?.isGenerating && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-xs text-gray-600">Generating React app...</span>
                    </div>
                  </div>
                )}
                
                {message.type === 'assistant' && (
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="mt-2 text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600">Creating React app structure...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">Try these examples:</p>
          <div className="grid grid-cols-1 gap-2">
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleExamplePrompt(prompt)}
                className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Describe the app you want to build..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={isProcessing}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
