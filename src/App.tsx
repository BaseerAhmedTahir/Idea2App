import React, { useState } from 'react';
import { AuthProvider } from './hooks/useAuth';
import Header from './components/Header';
import EnhancedChatInterface from './components/EnhancedChatInterface';
import PreviewPanel from './components/PreviewPanel';
import AuthModal from './components/AuthModal';

function App() {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });
  
  // State for generated code and preview
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  const handleCodeGenerated = (code: any) => {
    console.log('Code generated:', code);
    setGeneratedCode(code);
  };

  const handlePreviewGenerated = (preview: any) => {
    console.log('Preview generated:', preview);
    setPreviewData(preview);
  };

  return (
    <AuthProvider>
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        <Header onAuthClick={(mode) => setAuthModal({ isOpen: true, mode })} />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Chat Interface */}
          <div className="w-1/2 border-r border-gray-200 bg-white flex flex-col">
            <EnhancedChatInterface 
              onCodeGenerated={handleCodeGenerated}
              onPreviewGenerated={handlePreviewGenerated}
            />
          </div>
          
          {/* Right Panel - Preview & Code */}
          <div className="w-1/2 bg-gray-50 flex flex-col">
            <PreviewPanel 
              code={generatedCode}
              preview={previewData}
            />
          </div>
        </div>
        
        <AuthModal 
          isOpen={authModal.isOpen}
          mode={authModal.mode}
          onClose={() => setAuthModal({ isOpen: false, mode: 'signin' })}
          onSwitchMode={(mode) => setAuthModal({ isOpen: true, mode })}
        />
      </div>
    </AuthProvider>
  );
}

export default App;