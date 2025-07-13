import React, { useState } from 'react';
import { Settings, ChevronDown, Zap, Brain, Cpu, Sparkles } from 'lucide-react';

interface ModelSelectorProps {
  currentProvider: string;
  currentModel: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (model: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  currentProvider,
  currentModel,
  onProviderChange,
  onModelChange
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const providers = [
    {
      id: 'groq',
      name: 'Groq',
      icon: <Zap className="h-4 w-4" />,
      description: 'Ultra-fast inference with Llama, Qwen, DeepSeek',
      color: 'bg-orange-100 text-orange-700',
      models: [
        { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', description: 'Most capable, balanced performance' },
        { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', description: 'Fast and efficient' },
        { id: 'llama-3.2-90b-text-preview', name: 'Llama 3.2 90B', description: 'Latest model, preview' },
        { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Mixture of experts model' },
        { id: 'gemma-7b-it', name: 'Gemma 7B', description: 'Google\'s instruction-tuned model' },
        { id: 'qwen2-72b-instruct', name: 'Qwen2 72B', description: 'Alibaba\'s multilingual model' },
        { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 70B', description: 'Reasoning-focused model' }
      ]
    },
    {
      id: 'openai',
      name: 'OpenAI',
      icon: <Brain className="h-4 w-4" />,
      description: 'GPT models for reliable performance',
      color: 'bg-green-100 text-green-700',
      models: [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and cost-effective' },
        { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable model' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and affordable' }
      ]
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      icon: <Cpu className="h-4 w-4" />,
      description: 'Claude models for thoughtful responses',
      color: 'bg-purple-100 text-purple-700',
      models: [
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced performance' },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fast and efficient' }
      ]
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      icon: <Sparkles className="h-4 w-4" />,
      description: 'Google\'s multimodal AI models',
      color: 'bg-blue-100 text-blue-700',
      models: [
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Latest and most capable' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Large context window' }
      ]
    }
  ];

  const currentProviderData = providers.find(p => p.id === currentProvider);
  const currentModelData = currentProviderData?.models.find(m => m.id === currentModel);

  const handleProviderSelect = (providerId: string) => {
    onProviderChange(providerId);
    const provider = providers.find(p => p.id === providerId);
    if (provider && provider.models.length > 0) {
      onModelChange(provider.models[0].id);
    }
    setIsOpen(false);
  };

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Settings className="h-4 w-4 text-gray-500" />
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">
            {currentProviderData?.name} - {currentModelData?.name}
          </div>
          <div className="text-xs text-gray-500">
            {currentModelData?.description}
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Select AI Provider & Model</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {providers.map((provider) => (
              <div key={provider.id} className="border-b border-gray-100 last:border-b-0">
                <div className="p-3">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg ${provider.color}`}>
                      {provider.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{provider.name}</h4>
                      <p className="text-xs text-gray-600">{provider.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1 ml-11">
                    {provider.models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          handleProviderSelect(provider.id);
                          handleModelSelect(model.id);
                        }}
                        className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                          currentProvider === provider.id && currentModel === model.id
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{model.name}</div>
                        <div className="text-xs text-gray-600">{model.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              Configure API keys in your .env file to use different providers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;