import React from 'react';
import { Brain, CheckCircle2, Clock, Users, Shield, Database, Palette, Code2 } from 'lucide-react';

interface ParsedFeature {
  id: string;
  name: string;
  description: string;
  category: 'ui' | 'backend' | 'database' | 'security' | 'integration';
  complexity: 'low' | 'medium' | 'high';
  enabled: boolean;
  dependencies: string[];
}

interface FeatureParsingSectionProps {
  idea: string;
  features: ParsedFeature[];
  isProcessing: boolean;
}

const FeatureParsingSection: React.FC<FeatureParsingSectionProps> = ({ 
  idea, 
  features, 
  isProcessing 
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ui': return <Palette className="h-5 w-5" />;
      case 'backend': return <Code2 className="h-5 w-5" />;
      case 'database': return <Database className="h-5 w-5" />;
      case 'security': return <Shield className="h-5 w-5" />;
      case 'integration': return <Users className="h-5 w-5" />;
      default: return <CheckCircle2 className="h-5 w-5" />;
    }
  };

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
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-6">
            <Brain className="h-4 w-4 mr-2" />
            AI Analysis in Progress
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Understanding Your App Requirements
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI is analyzing your idea and identifying the key features, 
            components, and technical requirements needed to build your app.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
            <h3 className="text-xl font-semibold text-white mb-2">Your App Idea</h3>
            <p className="text-indigo-100 leading-relaxed">{idea}</p>
          </div>
        </div>

        {isProcessing ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="text-lg font-medium text-gray-700">Processing your idea...</span>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Identified Features</h3>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {features.length} features detected
                </span>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(feature.category)}`}>
                        {getCategoryIcon(feature.category)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{feature.name}</h4>
                        <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(feature.category)}`}>
                            {feature.category}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(feature.complexity)}`}>
                            {feature.complexity} complexity
                          </span>
                          {feature.dependencies.length > 0 && (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {feature.dependencies.length} dependencies
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Next Steps</h3>
          </div>
          <p className="text-blue-800 mb-4">
            Based on your requirements, we'll generate a complete application with:
          </p>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Frontend components and user interface</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Backend API endpoints and business logic</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Database schema and data models</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Security implementation and authentication</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Test suites and deployment configurations</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default FeatureParsingSection;