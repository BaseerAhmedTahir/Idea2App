import React, { useState } from 'react';
import { Settings, CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface ParsedFeature {
  id: string;
  name: string;
  description: string;
  category: 'ui' | 'backend' | 'database' | 'security' | 'integration';
  complexity: 'low' | 'medium' | 'high';
  enabled: boolean;
  dependencies: string[];
  implementation: string;
}

interface FeatureCustomizerProps {
  idea: string;
  features: ParsedFeature[];
  onFeatureToggle: (featureId: string) => void;
  isLoading: boolean;
}

const FeatureCustomizer: React.FC<FeatureCustomizerProps> = ({
  idea,
  features,
  onFeatureToggle,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analyzing your idea...
            </h3>
            <p className="text-gray-600">
              Identifying features and components
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Ready to analyze
          </h3>
          <p className="text-gray-600">
            Features will appear here once analysis is complete
          </p>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ui': return 'bg-purple-100 text-purple-800';
      case 'backend': return 'bg-blue-100 text-blue-800';
      case 'database': return 'bg-green-100 text-green-800';
      case 'security': return 'bg-red-100 text-red-800';
      case 'integration': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Identified Features
        </h3>
        <p className="text-gray-600">
          I've analyzed your idea and identified these key features. You can enable or disable them as needed.
        </p>
      </div>

      <div className="space-y-4">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`border rounded-lg p-4 transition-all ${
              feature.enabled 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-gray-900">{feature.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(feature.category)}`}>
                    {feature.category}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(feature.complexity)}`}>
                    {feature.complexity}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{feature.description}</p>
                {feature.dependencies.length > 0 && (
                  <div className="text-xs text-gray-500">
                    Depends on: {feature.dependencies.join(', ')}
                  </div>
                )}
              </div>
              <div className="flex items-center ml-4">
                <button
                  onClick={() => onFeatureToggle(feature.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    feature.enabled ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      feature.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          <h4 className="font-semibold text-blue-900">Ready to Generate</h4>
        </div>
        <p className="text-blue-800 text-sm">
          {features.filter(f => f.enabled).length} features selected. 
          The AI will generate code for all enabled features.
        </p>
      </div>
    </div>
  );
};

export default FeatureCustomizer;