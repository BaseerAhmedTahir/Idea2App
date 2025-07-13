import React, { useState } from 'react';
import { Eye, ExternalLink, ArrowLeft, Download, RefreshCw, Smartphone, Monitor, Tablet } from 'lucide-react';

interface PreviewSectionProps {
  preview: {
    url: string;
    status: 'generating' | 'ready' | 'error';
  } | null;
  onBack: () => void;
  onExport: () => void;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ preview, onBack, onExport }) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getFrameClass = () => {
    switch (viewMode) {
      case 'mobile':
        return 'w-80 h-96 max-w-80';
      case 'tablet':
        return 'w-96 h-80 max-w-96';
      default:
        return 'w-full h-96';
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6">
            <Eye className="h-4 w-4 mr-2" />
            Live Preview
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your App is Ready!
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Preview your generated application in different screen sizes and 
            interact with all the features before exporting or deploying.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onBack}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Customization</span>
                </button>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                  {preview?.status === 'ready' && (
                    <a
                      href={preview.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('desktop')}
                    className={`p-2 rounded ${viewMode === 'desktop' ? 'bg-white shadow' : ''}`}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('tablet')}
                    className={`p-2 rounded ${viewMode === 'tablet' ? 'bg-white shadow' : ''}`}
                  >
                    <Tablet className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('mobile')}
                    className={`p-2 rounded ${viewMode === 'mobile' ? 'bg-white shadow' : ''}`}
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {preview?.status === 'generating' && (
              <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Preview</h3>
                  <p className="text-gray-600">Building your app preview...</p>
                </div>
              </div>
            )}
            
            {preview?.status === 'error' && (
              <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
                <div className="text-center">
                  <div className="text-red-500 mb-4">
                    <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Error</h3>
                  <p className="text-gray-600">There was an error generating the preview. Please try again.</p>
                  <button
                    onClick={handleRefresh}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}
            
            {preview?.status === 'ready' && (
              <div className="flex justify-center">
                <div className={`${getFrameClass()} border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg transition-all duration-300`}>
                  <div className="h-8 bg-gray-100 flex items-center justify-between px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      {preview.url}
                    </div>
                  </div>
                  <iframe
                    src={preview.url}
                    className="w-full h-full"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    title="App Preview"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feature Demo */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Interactive Demo</h3>
            <p className="text-gray-600 text-sm mb-4">
              Try out all the features in your app - create accounts, make posts, and test functionality.
            </p>
            <div className="flex items-center text-green-600 text-sm">
              <Eye className="h-4 w-4 mr-1" />
              Fully functional
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Responsive Design</h3>
            <p className="text-gray-600 text-sm mb-4">
              Your app works perfectly on all devices - desktop, tablet, and mobile.
            </p>
            <div className="flex items-center text-blue-600 text-sm">
              <Monitor className="h-4 w-4 mr-1" />
              All screen sizes
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Production Ready</h3>
            <p className="text-gray-600 text-sm mb-4">
              The code is optimized, secure, and ready for production deployment.
            </p>
            <div className="flex items-center text-purple-600 text-sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              Optimized code
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onExport}
            className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            Export & Deploy
          </button>
          <button
            onClick={onBack}
            className="bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            Modify Features
          </button>
        </div>
      </div>
    </section>
  );
};

export default PreviewSection;