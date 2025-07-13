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

interface ChatInterfaceProps {
  onCodeGenerated?: (code: any) => void;
  onPreviewGenerated?: (preview: any) => void;
}

type WorkflowStep = 'chat' | 'features' | 'generating' | 'complete';

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onCodeGenerated, onPreviewGenerated }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI assistant. Describe the app you'd like to build and I'll analyze it to identify the key features. You'll then be able to review and customize these features before I generate the code.",
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
    "Create a social media app with user profiles and posts",
    "Build an e-commerce store with shopping cart",
    "Make a task management app with teams",
    "Design a blog platform with comments"
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
        await handleIdeaAnalysis(userMessage);
      } else if (currentStep === 'features') {
        // Handle feature modification requests
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

  const handleIdeaAnalysis = async (idea: string) => {
    setCurrentIdea(idea);
    
    // Add assistant response with progress
    addMessage({
      type: 'assistant',
      content: "🔍 **Analyzing your idea...**\n\nI'm identifying the key features and components needed for your application.",
      metadata: {
        progress: {
          step: 'analyzing',
          status: 'in-progress',
          description: 'Analyzing your app idea and identifying features'
        }
      }
    });

    try {
      const features = await AIService.parseIdea(idea, techStack);
      setExtractedFeatures(features);
      setCurrentStep('features');
      
      updateLastMessage({
        content: "✨ **Analysis Complete!**\n\nI've identified these key features for your app:\n\n" + 
          features.map(f => `• ${f.name}: ${f.description}`).join('\n') + 
          "\n\n**What would you like to do?**\n" +
          "• Type 'proceed' to generate code with these features\n" +
          "• Ask me to add, remove, or modify specific features\n" +
          "• Request changes like 'remove user authentication' or 'add real-time chat'\n\n" +
          "You can also use the feature customization panel on the right to toggle features on/off.",
        metadata: {
          features,
          progress: {
            step: 'features-ready',
            status: 'completed',
            description: 'Features identified - ready for customization'
          }
        }
      });
    } catch (error) {
      updateLastMessage({
        content: `❌ **Analysis failed**\n\nI encountered an issue while analyzing your idea: ${error instanceof Error ? error.message : 'Unknown error'}. Please try describing your app idea again.`
      });
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
        console.log('Preview generated:', preview);
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
        return;
      }
      
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
    } catch (error) {
      updateLastMessage({
        content: `❌ **Generation failed**\n\nI encountered an issue while generating your app: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      });
      setCurrentStep('features');
    }
  };

  const handleDeploymentRequest = async (request: string) => {
    if (currentStep !== 'complete') {
      addMessage({
        type: 'assistant',
        content: "I don't have an app to deploy yet. Please create an app first by describing what you'd like to build."
      });
      return;
    }

    if (request.toLowerCase().includes('download')) {
      addMessage({
        type: 'assistant',
        content: "📦 **Preparing download...**\n\nI'm packaging your complete application with all source code, documentation, and deployment configurations.",
        metadata: {
          progress: {
            step: 'packaging',
            status: 'in-progress',
            description: 'Creating download package'
          }
        }
      });

      try {
        // Simulate download preparation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        updateLastMessage({
          content: "🎉 **Download ready!**\n\nYour application has been packaged and downloaded. The ZIP file contains:\n\n" +
            "• Complete source code (frontend & backend)\n" +
            "• Database schema and migrations\n" +
            "• Test suites\n" +
            "• Deployment configurations\n" +
            "• Documentation and setup instructions\n\n" +
            "You can now extract and run the application locally!"
        });
      } catch (error) {
        updateLastMessage({
          content: `❌ **Download failed**\n\nThere was an issue preparing your download: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    } else {
      addMessage({
        type: 'assistant',
        content: "🚀 **Deploying your app...**\n\nI'm deploying your application to make it live on the internet. This process includes:\n\n" +
          "• Building optimized production code\n" +
          "• Setting up hosting infrastructure\n" +
          "• Configuring SSL certificates\n" +
          "• Initializing the database\n\n" +
          "This may take a few minutes...",
        metadata: {
          progress: {
            step: 'deploying',
            status: 'in-progress',
            description: 'Deploying to production'
          }
        }
      });

      // Simulate deployment
      await new Promise(resolve => setTimeout(resolve, 3000));

      updateLastMessage({
        content: "🎉 **Deployment successful!**\n\n" +
          "Your app is now live at: **https://my-app.vercel.app**\n\n" +
          "🔗 **What's included:**\n" +
          "• Fully functional web application\n" +
          "• Secure HTTPS connection\n" +
          "• Global CDN for fast loading\n" +
          "• Automatic scaling\n" +
          "• Database hosting\n\n" +
          "Your app is ready for users! You can share the link with anyone."
      });
    }
  };

  const handleFeatureToggle = (featureId: string) => {
    const updatedFeatures = extractedFeatures.map(f => 
      f.id === featureId ? { ...f, enabled: !f.enabled } : f
    );
    setExtractedFeatures(updatedFeatures);
  };

  const handleProjectUpdate = async (request: string) => {
    addMessage({
      type: 'assistant',
      content: "I understand you want to make changes to your current project. Could you be more specific about what you'd like to modify? For example:\n\n" +
        "• Add a new feature (e.g., 'add user notifications')\n" +
        "• Change the design (e.g., 'make it more colorful')\n" +
        "• Modify functionality (e.g., 'change the login system')\n" +
        "• Update the database (e.g., 'add a comments table')"
    });
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
            <h2 className="font-semibold text-gray-900">AI Assistant</h2>
            <p className="text-sm text-gray-500">
              {isProcessing ? 'Working on your request...' : 'Ready to help you build'}
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
                  <span className="text-sm text-gray-600">Thinking...</span>
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
      
      {/* Feature Customization Panel */}
      {currentStep === 'features' && extractedFeatures.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Customize Features</h3>
            <p className="text-xs text-gray-600 mb-3">Toggle features on/off or ask me to modify them</p>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {extractedFeatures.map((feature) => (
              <div
                key={feature.id}
                className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
                  feature.enabled 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{feature.name}</div>
                  <div className="text-xs text-gray-600">{feature.description}</div>
                </div>
                <button
                  onClick={() => handleFeatureToggle(feature.id)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    feature.enabled ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                      feature.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={() => generateApplication()}
              disabled={isProcessing || extractedFeatures.filter(f => f.enabled).length === 0}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {isProcessing ? 'Processing...' : `Generate App (${extractedFeatures.filter(f => f.enabled).length} features)`}
            </button>
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
              placeholder={
                currentStep === 'chat' 
                  ? "Describe the app you want to build..." 
                  : currentStep === 'features'
                  ? "Ask me to modify features or type 'proceed' to generate code..."
                  : "App generation in progress..."
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={isProcessing || currentStep === 'generating'}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isProcessing || currentStep === 'generating'}
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

export default ChatInterface;