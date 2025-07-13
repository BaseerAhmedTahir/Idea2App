import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Smartphone, Monitor, Tablet, Maximize2, Minimize2 } from 'lucide-react';

interface LivePreviewProps {
  preview: {
    url: string;
    status: 'generating' | 'ready' | 'error';
  };
}

const LivePreview: React.FC<LivePreviewProps> = ({ preview }) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIframeKey(prev => prev + 1); // Force iframe reload
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getFrameClass = () => {
    if (isFullscreen) {
      return 'w-full h-full';
    }
    
    switch (viewMode) {
      case 'mobile':
        return 'w-80 h-[600px] max-w-80';
      case 'tablet':
        return 'w-[768px] h-[500px] max-w-[768px]';
      default:
        return 'w-full h-[600px]';
    }
  };

  const getContainerClass = () => {
    if (isFullscreen) {
      return 'fixed inset-0 z-50 bg-white';
    }
    return 'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden';
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFullscreen]);

  return (
    <div className={getContainerClass()}>
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Live Preview</h3>
          <div className="flex items-center space-x-2">
            {!isFullscreen && (
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'desktop' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('tablet')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'tablet' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'mobile' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
              title="Refresh Preview"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {preview.status === 'ready' && (
              <a
                href={preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="Open in New Tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
      
      <div className={`${isFullscreen ? 'h-full' : 'p-4'}`}>
        {preview.status === 'generating' && (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Preview</h3>
              <p className="text-gray-600">Building your app preview...</p>
            </div>
          </div>
        )}
        
        {preview.status === 'error' && (
          <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Error</h3>
              <p className="text-gray-600 mb-4">There was an error generating the preview. Please try again.</p>
              <button
                onClick={handleRefresh}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        
        {preview.status === 'ready' && (
          <div className={`flex ${isFullscreen ? 'h-full' : 'justify-center'}`}>
            <div className={`${getFrameClass()} border border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg transition-all duration-300`}>
              {/* Browser Chrome */}
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
              
              {/* App Content */}
              <div className="h-full bg-white">
                <iframe
                  key={iframeKey}
                  src={preview.url}
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
                  title="App Preview"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Preview Info */}
      {!isFullscreen && preview.status === 'ready' && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Viewing: <span className="font-medium text-gray-900 capitalize">{viewMode}</span>
              </span>
              <span className="text-gray-600">
                Status: <span className="font-medium text-green-600">Live</span>
              </span>
            </div>
            <div className="text-gray-500">
              Interactive preview • Click to explore
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePreview;