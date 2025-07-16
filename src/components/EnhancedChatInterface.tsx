import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Code2, Eye, Download, Loader2, User, Bot, Copy, CheckCircle2 } from 'lucide-react';
import { AIService, ParsedFeature } from '../services/ai';
import { PreviewService } from '../services/preview';
import { DeploymentService } from '../services/deployment';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    features?: ParsedFeature[];
    code?: any;
    preview?: any;
    progress?: {
      step: string;
      status: 'pending' | 'in-progress' | 'completed';
      description: string;
    };
  };
}

interface EnhancedChatInterfaceProps {
  onCodeGenerated?: (code: any) => void;
  onPreviewGenerated?: (preview: any) => void;
}

type WorkflowStep = 'chat' | 'features' | 'generating' | 'complete';

const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({ onCodeGenerated, onPreviewGenerated }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI assistant. Describe the app you'd like to build and I'll generate real, functional code for you. I can create expense trackers, portfolio websites, calculators, todo apps, and much more!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('chat');
  const [currentIdea, setCurrentIdea] = useState('');
  const [extractedFeatures, setExtractedFeatures] = useState<ParsedFeature[]>([]);
  const [techStack] = useState({
    frontend: 'React',
    backend: 'Node.js',
    database: 'PostgreSQL',
    deployment: 'Vercel',
    aiProvider: import.meta.env.VITE_AI_PROVIDER || 'groq',
    aiModel: import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-70b-versatile'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const examplePrompts = [
    "Create an expense tracker with income/expense categories",
    "Build a portfolio website with project showcase",
    "Make a calculator with scientific functions",
    "Design a task management app with priorities"
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    addMessage({
      type: 'user',
      content: userMessage
    });

    setIsProcessing(true);

    try {
      if (currentStep === 'chat') {
        await handleDirectCodeGeneration(userMessage);
      } else if (currentStep === 'features') {
        await handleFeatureModification(userMessage);
      } else {
        addMessage({
          type: 'assistant',
          content: "I'm currently generating your app. Please wait for the process to complete before sending new messages."
        });
      }
    } catch (error) {
      addMessage({
        type: 'assistant',
        content: `I encountered an error: ${error instanceof Error ? error.message : 'Something went wrong'}. Please try again or rephrase your request.`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectCodeGeneration = async (idea: string) => {
    setCurrentIdea(idea);
    setCurrentStep('generating');
    
    // Add assistant response with progress
    addMessage({
      type: 'assistant',
      content: "🚀 **Generating your application...**\n\nI'm creating a complete, functional application based on your idea. This includes:\n\n" +
        "• Analyzing your requirements\n" +
        "• Generating React components\n" +
        "• Creating interactive features\n" +
        "• Building a working preview\n\n" +
        "This may take a few moments...",
      metadata: {
        progress: {
          step: 'generating',
          status: 'in-progress',
          description: 'Generating complete application code'
        }
      }
    });

    try {
      console.log('🔄 Starting code generation for:', idea);
      
      // Step 1: Parse features
      updateLastMessage({
        content: "🔍 **Analyzing your idea...**\n\nIdentifying key features and components needed for your application.",
        metadata: {
          progress: {
            step: 'analyzing',
            status: 'in-progress',
            description: 'Analyzing requirements and identifying features'
          }
        }
      });

      const features = await AIService.parseIdea(idea, techStack);
      console.log('✅ Features parsed:', features);
      setExtractedFeatures(features);

      // Step 2: Generate code
      updateLastMessage({
        content: "⚡ **Generating code...**\n\nCreating functional React components and application logic based on your requirements.",
        metadata: {
          progress: {
            step: 'coding',
            status: 'in-progress',
            description: 'Generating React components and application code'
          }
        }
      });

      const generatedCode = await AIService.generateCode(idea, features, techStack);
      console.log('✅ Code generated:', Object.keys(generatedCode));

      // Step 3: Create preview
      updateLastMessage({
        content: "🎨 **Creating live preview...**\n\nBuilding an interactive preview of your application.",
        metadata: {
          progress: {
            step: 'preview',
            status: 'in-progress',
            description: 'Creating interactive preview'
          }
        }
      });

      onCodeGenerated?.(generatedCode);
      
      // Generate preview
      try {
        const preview = await PreviewService.generatePreview(generatedCode);
        console.log('✅ Preview generated:', preview.status);
        onPreviewGenerated?.(preview);
        
        setCurrentStep('complete');
        
        updateLastMessage({
          content: "🎉 **Your app is ready!**\n\n" +
            "I've successfully created a fully functional application based on your idea. " +
            "You can see the live preview on the right panel and interact with all the features.\n\n" +
            "**What you can do now:**\n" +
            "• Test your app in the live preview\n" +
            "• View and download the source code\n" +
            "• Request modifications or new features\n" +
            "• Deploy your app to make it live\n\n" +
            "To create a new app, simply describe another idea!",
          metadata: {
            features,
            code: generatedCode,
            preview,
            progress: {
              step: 'completed',
              status: 'completed',
              description: 'Application ready and functional'
            }
          }
        });
      } catch (previewError) {
        console.error('❌ Preview generation failed:', previewError);
        const errorPreview = {
          url: '',
          status: 'error' as const,
          error: previewError instanceof Error ? previewError.message : 'Preview generation failed'
        };
        onPreviewGenerated?.(errorPreview);
        
        setCurrentStep('complete');
        
        updateLastMessage({
          content: "⚠️ **App generated with preview issues**\n\n" +
            "Your application code has been generated successfully, but there was an issue creating the live preview. " +
            "You can still view and download the complete source code.\n\n" +
            "**What you can do:**\n" +
            "• Download the complete source code\n" +
            "• Run the app locally with `npm start`\n" +
            "• Request a new version of the app\n\n" +
            `Preview error: ${previewError instanceof Error ? previewError.message : 'Unknown error'}`,
          metadata: {
            features,
            code: generatedCode,
            preview: errorPreview,
            progress: {
              step: 'completed-with-issues',
              status: 'completed',
              description: 'Application ready (preview issues)'
            }
          }
        });
      }
    } catch (error) {
      console.error('❌ Code generation failed:', error);
      updateLastMessage({
        content: `❌ **Generation failed**\n\nI encountered an issue while generating your app: ${error instanceof Error ? error.message : 'Unknown error'}. Please try describing your app idea again, perhaps with more specific details.`
      });
      setCurrentStep('chat');
    }
  };

  const handleFeatureModification = async (request: string) => {
    if (request.toLowerCase().includes('proceed') || request.toLowerCase().includes('generate') || request.toLowerCase().includes('continue')) {
      await generateApplication();
      return;
    }
    
    // Handle feature modification requests
    addMessage({
      type: 'assistant',
      content: "🔧 **Updating features...**\n\nI'm processing your feature modification request.",
      metadata: {
        progress: {
          step: 'modifying-features',
          status: 'in-progress',
          description: 'Updating feature list based on your request'
        }
      }
    });
    
    // Simulate feature modification (in a real app, you'd use AI to parse the request)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    updateLastMessage({
      content: "✅ **Features updated!**\n\nI've processed your request. Here are the updated features:\n\n" + 
        extractedFeatures.filter(f => f.enabled).map(f => `• **${f.name}**: ${f.description}`).join('\n') + 
        "\n\n**Ready to proceed?**\n" +
        "• Type 'proceed' to generate code with these features\n" +
        "• Ask for more modifications if needed",
      metadata: {
        features: extractedFeatures,
        progress: {
          step: 'features-updated',
          status: 'completed',
          description: 'Features updated - ready to proceed'
        }
      }
    });
  };
  
  const generateApplication = async () => {
    setCurrentStep('generating');
    
    addMessage({
      type: 'assistant',
      content: "🚀 **Generating your application...**\n\nI'm now creating your complete application with all the selected features. This includes:\n\n" +
        "• Frontend components and UI\n" +
        "• Backend API and business logic\n" +
        "• Database schema and models\n" +
        "• Tests and deployment configuration\n\n" +
        "This may take a few moments...",
      metadata: {
        progress: {
          step: 'generating',
          status: 'in-progress',
          description: 'Generating complete application code'
        }
      }
    });

    try {
      const enabledFeatures = extractedFeatures.filter(f => f.enabled);
      const generatedCode = await AIService.generateCode(currentIdea, enabledFeatures, techStack);
      
      updateLastMessage({
        content: "🎉 **Application generated successfully!**\n\n" +
          `✅ Frontend (React)\n✅ Backend (Node.js)\n✅ Database (PostgreSQL)\n✅ Tests & Deployment\n\n` +
          "🖥️ **Creating live preview...**\n\nGenerating an interactive preview of your application.",
        metadata: {
          features: enabledFeatures,
          code: generatedCode,
          progress: {
            step: 'preview',
            status: 'in-progress',
            description: 'Creating live preview'
          }
        }
      });

      onCodeGenerated?.(generatedCode);
      
      // Add a small delay before generating preview to ensure code is processed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const preview = await PreviewService.generatePreview(generatedCode);
        onPreviewGenerated?.(preview);
        setCurrentStep('complete');

        updateLastMessage({
          content: "🚀 **Your app is ready!**\n\n" +
            "I've successfully created your application with all the features you requested. " +
            "You can see the live preview on the right panel.\n\n" +
            "**What you can do now:**\n" +
            "• View and interact with your app in the preview\n" +
            "• Request deployment to make it live\n" +
            "• Download the complete source code\n\n" +
            "To create a new app, simply refresh the page and start over!",
          metadata: {
            features: enabledFeatures,
            code: generatedCode,
            preview,
            progress: {
              step: 'completed',
              status: 'completed',
              description: 'Application ready'
            }
          }
        });
      } catch (previewError) {
        console.error('Preview generation failed:', previewError);
        const preview = {
          url: '',
          status: 'error' as const,
          error: previewError instanceof Error ? previewError.message : 'Preview generation failed',
          logs: ['Preview generation failed', 'Using fallback error display']
        };
        onPreviewGenerated?.(preview);
        setCurrentStep('complete');
        
        updateLastMessage({
          content: "⚠️ **App generated with preview issues**\n\n" +
            "Your application code has been generated successfully, but there was an issue creating the live preview. " +
            "You can still download the code and run it locally.\n\n" +
            "**What you can do:**\n" +
            "• Download the complete source code\n" +
            "• Run the app locally with `npm start`\n" +
            "• Request deployment to make it live\n\n" +
            `Preview error: ${previewError instanceof Error ? previewError.message : 'Unknown error'}`,
          metadata: {
            features: enabledFeatures,
            code: generatedCode,
            preview,
            progress: {
              step: 'completed-with-issues',
              status: 'completed',
              description: 'Application ready (preview issues)'
            }
          }
        });
      }
    } catch (error) {
      updateLastMessage({
        content: `❌ **Generation failed**\n\nI encountered an issue while generating your app: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      });
      setCurrentStep('features');
    }
  };

  const handleFeatureToggle = (featureId: string) => {
    const updatedFeatures = extractedFeatures.map(f => 
      f.id === featureId ? { ...f, enabled: !f.enabled } : f
    );
    setExtractedFeatures(updatedFeatures);
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

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">AI Code Generator</h2>
            <p className="text-sm text-gray-500">
              {isProcessing ? 'Generating your app...' : 'Ready to build your app'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
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
                
                {message.metadata?.progress && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      {message.metadata.progress.status === 'in-progress' ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      ) : message.metadata.progress.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                      )}
                      <span className="text-xs text-gray-600">
                        {message.metadata.progress.description}
                      </span>
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
                  <span className="text-sm text-gray-600">Generating code...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Example Prompts */}
      {messages.length === 1 && currentStep === 'chat' && (
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

      {/* Input */}
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
              placeholder="Describe the app you want to build (e.g., 'expense tracker with categories', 'portfolio with project showcase')..."
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
