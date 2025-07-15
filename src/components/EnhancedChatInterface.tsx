import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { CleanCodeGenerator } from '../services/cleanCodeGenerator';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    code?: string;
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

  const generateCode = async (idea: string) => {
    const features = extractFeatures(idea);
    
    // Simulate realistic generation timing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const frontendCode = CleanCodeGenerator.generateReactComponent(idea, features);
    const backendCode = CleanCodeGenerator.generateBackendCode(idea, features);
    const databaseCode = CleanCodeGenerator.generateDatabaseSchema(features);
    
    const generatedCode = {
      frontend: frontendCode,
      backend: backendCode,
      database: databaseCode,
      packageJson: JSON.stringify({
        name: "generated-app",
        version: "1.0.0",
        dependencies: {
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "@types/react": "^18.2.0",
          "@types/react-dom": "^18.2.0",
          "typescript": "^5.0.0",
          "tailwindcss": "^3.3.0"
        },
        scripts: {
          "start": "react-scripts start",
          "build": "react-scripts build",
          "test": "react-scripts test",
          "eject": "react-scripts eject"
        }
      }, null, 2),
      readme: `# Generated App

This app was generated based on: ${idea}

## Features
${features.map(f => `- ${f.charAt(0).toUpperCase() + f.slice(1)}`).join('\n')}

## Getting Started

\`\`\`bash
npm install
npm start
\`\`\`

## Available Scripts

- \`npm start\` - Runs the app in development mode
- \`npm build\` - Builds the app for production
- \`npm test\` - Launches the test runner

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- Modern React hooks for state management
- Responsive design
- Production-ready code structure
`
    };
    
    return { code: generatedCode, features };
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
        content: "🔄 Generating your application...",
        metadata: { isGenerating: true }
      });

      const { code, features } = await generateCode(userMessage);
      
      // Pass the generated code to the parent component
      onCodeGenerated?.(code);
      
      // Generate preview immediately
      onPreviewGenerated?.({
        url: '',
        status: 'ready',
        code: code.frontend
      });
      
      updateLastMessage({
        content: `✅ **Application Generated Successfully!**

I've created a production-ready React application based on your requirements:

**Features Implemented:**
${features.map(f => `• ${f.charAt(0).toUpperCase() + f.slice(1)}`).join('\n')}

**What's Included:**
• Clean, production-ready React components
• Modern UI with Tailwind CSS
• Proper state management with hooks
• Responsive design
• Error handling and loading states
• TypeScript for type safety

You can now view the live preview and interact with your application!`,
        metadata: {
          code: code.frontend,
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
      
      // Show error in preview
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
                      <span className="text-xs text-gray-600">Generating code...</span>
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
                  <span className="text-sm text-gray-600">Processing your request...</span>
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
