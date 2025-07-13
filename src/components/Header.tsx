import React from 'react';
import { Zap, Github, User, LogOut, Sparkles, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ModelSelector from './ModelSelector';

interface HeaderProps {
  onAuthClick: (type: 'signin' | 'signup') => void;
}

const Header = ({ onAuthClick }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const [currentProvider, setCurrentProvider] = React.useState(
    import.meta.env.VITE_AI_PROVIDER || 'groq'
  );
  const [currentModel, setCurrentModel] = React.useState(
    import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-70b-versatile'
  );

  const handleProviderChange = (provider: string) => {
    setCurrentProvider(provider);
    // In a real app, you might want to persist this to localStorage or user preferences
  };

  const handleModelChange = (model: string) => {
    setCurrentModel(model);
    // In a real app, you might want to persist this to localStorage or user preferences
  };

  return (
    <header className="bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Idea2App</h1>
              <p className="text-xs text-gray-500 -mt-1">AI App Generator</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <ModelSelector
                  currentProvider={currentProvider}
                  currentModel={currentModel}
                  onProviderChange={handleProviderChange}
                  onModelChange={handleModelChange}
                />
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Github className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onAuthClick('signin')}
                  className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onAuthClick('signup')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;