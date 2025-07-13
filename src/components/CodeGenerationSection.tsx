import React, { useState } from 'react';
import { Code2, CheckCircle2, Clock, FileText, Database, Globe, Shield, Play } from 'lucide-react';

interface ParsedFeature {
  id: string;
  name: string;
  description: string;
  category: 'ui' | 'backend' | 'database' | 'security' | 'integration';
  complexity: 'low' | 'medium' | 'high';
  enabled: boolean;
  dependencies: string[];
}

interface GeneratedCode {
  frontend: string;
  backend: string;
  database: string;
  tests: string;
  deployment: string;
}

interface CodeGenerationSectionProps {
  features: ParsedFeature[];
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    deployment: string;
  };
  generatedCode: GeneratedCode | null;
  isProcessing: boolean;
}

const CodeGenerationSection: React.FC<CodeGenerationSectionProps> = ({
  features,
  techStack,
  generatedCode,
  isProcessing
}) => {
  const [activeTab, setActiveTab] = useState<'frontend' | 'backend' | 'database' | 'tests' | 'deployment'>('frontend');

  const codeAreas = [
    {
      id: 'frontend',
      name: 'Frontend',
      icon: <Globe className="h-4 w-4" />,
      description: `${techStack.frontend} components and UI`,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'backend',
      name: 'Backend',
      icon: <Code2 className="h-4 w-4" />,
      description: `${techStack.backend} API and business logic`,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'database',
      name: 'Database',
      icon: <Database className="h-4 w-4" />,
      description: `${techStack.database} schema and models`,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'tests',
      name: 'Tests',
      icon: <Shield className="h-4 w-4" />,
      description: 'Unit and integration tests',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'deployment',
      name: 'Deployment',
      icon: <Play className="h-4 w-4" />,
      description: `${techStack.deployment} configuration`,
      color: 'bg-red-100 text-red-800'
    }
  ];

  const getCodeContent = (area: string) => {
    if (!generatedCode) return '';
    return generatedCode[area as keyof GeneratedCode] || '';
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6">
            <Code2 className="h-4 w-4 mr-2" />
            Code Generation Complete
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Your App Code is Ready
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We've generated production-ready code for your entire application, 
            including frontend, backend, database, tests, and deployment configurations.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Generated Components</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {codeAreas.map((area) => (
                <div key={area.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                  <div className="text-white mb-2">{area.icon}</div>
                  <div className="text-white font-medium text-sm">{area.name}</div>
                  <div className="text-white/80 text-xs mt-1">{area.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isProcessing ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="text-lg font-medium text-gray-700">Generating code...</span>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {codeAreas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => setActiveTab(area.id as any)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === area.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {area.icon}
                      <span>{area.name}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {codeAreas.find(a => a.id === activeTab)?.name} Code
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    codeAreas.find(a => a.id === activeTab)?.color
                  }`}>
                    {codeAreas.find(a => a.id === activeTab)?.description}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {activeTab === 'frontend' && 'React components with TypeScript, state management, and modern UI patterns'}
                  {activeTab === 'backend' && 'Express.js API with authentication, validation, and database integration'}
                  {activeTab === 'database' && 'PostgreSQL schema with relationships, indexes, and migrations'}
                  {activeTab === 'tests' && 'Comprehensive test suite with unit and integration tests'}
                  {activeTab === 'deployment' && 'Production-ready deployment configuration and CI/CD pipeline'}
                </p>
              </div>
              
              <div className="bg-gray-900 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {activeTab}.{activeTab === 'database' ? 'sql' : activeTab === 'deployment' ? 'yml' : 'tsx'}
                  </div>
                </div>
                <pre className="p-4 text-sm text-gray-300 overflow-x-auto max-h-96">
                  <code>{getCodeContent(activeTab)}</code>
                </pre>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <h3 className="font-semibold text-gray-900">Code Quality</h3>
            </div>
            <p className="text-gray-600 text-sm">
              All generated code follows best practices, includes proper error handling, and is production-ready.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="h-6 w-6 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Security First</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Implements authentication, authorization, input validation, and other security best practices.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="h-6 w-6 text-purple-500" />
              <h3 className="font-semibold text-gray-900">Documentation</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Includes comprehensive documentation, API references, and setup instructions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CodeGenerationSection;