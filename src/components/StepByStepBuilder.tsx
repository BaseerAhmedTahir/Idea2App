import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Eye, Code2, Database, Server, Rocket, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { AIService, ParsedFeature } from '../services/ai';
import { PreviewService } from '../services/preview';
import CodeViewer from './CodeViewer';
import LivePreview from './LivePreview';
import FeatureCustomizer from './FeatureCustomizer';

interface AppData {
  idea: string;
  features: ParsedFeature[];
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    deployment: string;
  };
  generatedCode: {
    frontend?: string;
    backend?: string;
    database?: string;
    tests?: string;
    deployment?: string;
    packageJson?: string;
    readme?: string;
  };
  preview: {
    url: string;
    status: 'generating' | 'ready' | 'error';
  } | null;
  currentStep: 'input' | 'building';
}

interface StepByStepBuilderProps {
  appData: AppData;
  onUpdateAppData: (updates: Partial<AppData>) => void;
  onBack: () => void;
}

type BuildStep = 'features' | 'frontend' | 'backend' | 'database' | 'deployment' | 'complete';

const StepByStepBuilder: React.FC<StepByStepBuilderProps> = ({ 
  appData, 
  onUpdateAppData, 
  onBack 
}) => {
  const [currentBuildStep, setCurrentBuildStep] = useState<BuildStep>('features');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const steps = [
    { id: 'features', name: 'Features', icon: <Sparkles className="h-5 w-5" />, description: 'Define app features' },
    { id: 'frontend', name: 'Frontend', icon: <Eye className="h-5 w-5" />, description: 'User interface' },
    { id: 'backend', name: 'Backend', icon: <Server className="h-5 w-5" />, description: 'API & logic' },
    { id: 'database', name: 'Database', icon: <Database className="h-5 w-5" />, description: 'Data storage' },
    { id: 'deployment', name: 'Deploy', icon: <Rocket className="h-5 w-5" />, description: 'Go live' },
    { id: 'complete', name: 'Complete', icon: <CheckCircle2 className="h-5 w-5" />, description: 'All done!' }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentBuildStep);

  useEffect(() => {
    if (currentBuildStep === 'features' && appData.features.length === 0) {
      generateFeatures();
    }
  }, [currentBuildStep]);

  const generateFeatures = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const features = await AIService.parseIdea(appData.idea, appData.techStack);
      onUpdateAppData({ features });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate features');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateStep = async (step: BuildStep) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      let generatedContent = '';
      
      switch (step) {
        case 'frontend':
          generatedContent = await AIService.generateFrontendCode(
            appData.idea, 
            appData.features.filter(f => f.enabled), 
            appData.techStack
          );
          onUpdateAppData({ 
            generatedCode: { ...appData.generatedCode, frontend: generatedContent }
          });
          break;
          
        case 'backend':
          generatedContent = await AIService.generateBackendCode(
            appData.idea, 
            appData.features.filter(f => f.enabled), 
            appData.techStack
          );
          onUpdateAppData({ 
            generatedCode: { ...appData.generatedCode, backend: generatedContent }
          });
          break;
          
        case 'database':
          generatedContent = await AIService.generateDatabaseSchema(
            appData.idea, 
            appData.features.filter(f => f.enabled), 
            appData.techStack
          );
          onUpdateAppData({ 
            generatedCode: { ...appData.generatedCode, database: generatedContent }
          });
          break;
          
        case 'deployment':
          generatedContent = await AIService.generateDeploymentConfig(
            appData.idea, 
            appData.features.filter(f => f.enabled), 
            appData.techStack
          );
          onUpdateAppData({ 
            generatedCode: { ...appData.generatedCode, deployment: generatedContent }
          });
          break;
      }
      
      // Generate preview if frontend is ready
      if (step === 'frontend' && generatedContent) {
        generatePreview();
        setShowPreview(true); // Automatically show preview when frontend is generated
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to generate ${step}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePreview = async () => {
    if (!appData.generatedCode.frontend) return;
    
    try {
      onUpdateAppData({ preview: { url: '', status: 'generating' } });
      const preview = await PreviewService.generatePreview(appData.generatedCode);
      onUpdateAppData({ preview });
    } catch (err) {
      onUpdateAppData({ preview: { url: '', status: 'error' } });
    }
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1].id as BuildStep;
      setCurrentBuildStep(nextStep);
      
      // Auto-generate next step if not already generated
      if (nextStep !== 'complete' && !appData.generatedCode[nextStep as keyof typeof appData.generatedCode]) {
        generateStep(nextStep);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentBuildStep(steps[currentStepIndex - 1].id as BuildStep);
    }
  };

  const handleFeatureToggle = (featureId: string) => {
    const updatedFeatures = appData.features.map(f => 
      f.id === featureId ? { ...f, enabled: !f.enabled } : f
    );
    onUpdateAppData({ features: updatedFeatures });
  };

  const handleRegenerate = () => {
    if (currentBuildStep !== 'features' && currentBuildStep !== 'complete') {
      generateStep(currentBuildStep);
    } else if (currentBuildStep === 'features') {
      generateFeatures();
    }
  };

  const isStepComplete = (stepId: string) => {
    if (stepId === 'features') return appData.features.length > 0;
    if (stepId === 'complete') return Object.keys(appData.generatedCode).length >= 4;
    return !!appData.generatedCode[stepId as keyof typeof appData.generatedCode];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Input</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setCurrentBuildStep(step.id as BuildStep)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      currentBuildStep === step.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : isStepComplete(step.id)
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {isStepComplete(step.id) ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      step.icon
                    )}
                    <span className="text-sm font-medium">{step.name}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-300 mx-2" />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCode(!showCode)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  showCode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Code2 className="h-4 w-4" />
              </button>
              {appData.preview && (
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    showPreview ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`grid gap-8 ${showPreview || showCode ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {/* Main Content */}
          <div className="space-y-6">
            {/* Step Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {steps.find(s => s.id === currentBuildStep)?.name}
                  </h2>
                  <p className="text-gray-600">
                    {steps.find(s => s.id === currentBuildStep)?.description}
                  </p>
                </div>
                
                {currentBuildStep !== 'complete' && (
                  <button
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    <span>{isGenerating ? 'Generating...' : 'Regenerate'}</span>
                  </button>
                )}
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {currentBuildStep === 'features' && (
                <FeatureCustomizer
                  idea={appData.idea}
                  features={appData.features}
                  onFeatureToggle={handleFeatureToggle}
                  isLoading={isGenerating}
                />
              )}
              
              {currentBuildStep !== 'features' && currentBuildStep !== 'complete' && (
                <div className="p-6">
                  {isGenerating ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Generating {currentBuildStep}...
                        </h3>
                        <p className="text-gray-600">
                          This may take a few moments
                        </p>
                      </div>
                    </div>
                  ) : appData.generatedCode[currentBuildStep as keyof typeof appData.generatedCode] ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {currentBuildStep.charAt(0).toUpperCase() + currentBuildStep.slice(1)} Generated Successfully
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-600 mb-4">
                          Your {currentBuildStep} code has been generated and is ready for review.
                          {currentBuildStep === 'frontend' && appData.preview && ' Check out the live preview on the right!'}
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setShowCode(true)}
                            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                          >
                            View Code
                          </button>
                          {currentBuildStep === 'frontend' && appData.preview && (
                            <button
                              onClick={() => setShowPreview(true)}
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                showPreview 
                                  ? 'bg-green-600 text-white hover:bg-green-700' 
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}
                            >
                              {showPreview ? 'Preview Active' : 'Show Preview'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 mb-4">
                        {steps.find(s => s.id === currentBuildStep)?.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Ready to generate {currentBuildStep}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Click the generate button to create your {currentBuildStep} code.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {currentBuildStep === 'complete' && (
                <div className="p-6 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Your App is Complete!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    All components have been generated successfully. You can now deploy your application.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
                      Deploy Now
                    </button>
                    <button className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                      Download Code
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            {currentBuildStep !== 'complete' && (
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!isStepComplete(currentBuildStep) || isGenerating}
                  className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Side Panel */}
          {(showPreview && appData.preview) || showCode ? (
            <div className="space-y-6">
              {showPreview && appData.preview && appData.preview.status !== 'error' && (
                <div className="space-y-4">
                  <LivePreview preview={appData.preview} />
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Preview Features</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Fully interactive components</li>
                      <li>• Responsive design testing</li>
                      <li>• Real-time form validation</li>
                      <li>• Navigation between pages</li>
                      <li>• Authentication flow demo</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {showCode && (
                <CodeViewer 
                  code={appData.generatedCode[currentBuildStep as keyof typeof appData.generatedCode] || ''}
                  language={currentBuildStep === 'database' ? 'sql' : currentBuildStep === 'deployment' ? 'yaml' : 'typescript'}
                  title={`${currentBuildStep.charAt(0).toUpperCase() + currentBuildStep.slice(1)} Code`}
                />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default StepByStepBuilder;