import React, { useState } from 'react';
import { Download, Github, Cloud, Copy, CheckCircle2, ExternalLink, FileText, Zap } from 'lucide-react';
import { DeploymentOptions } from '../services/deployment';

interface AppData {
  idea: string;
  features: any[];
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    deployment: string;
  };
  generatedCode: any;
  preview: any;
}

interface ExportSectionProps {
  appData: AppData;
  onBack: () => void;
  onExport: (options: DeploymentOptions) => Promise<{ success: boolean; url?: string; error?: string }>;
}

const ExportSection: React.FC<ExportSectionProps> = ({ appData, onBack, onExport }) => {
  const [selectedExportType, setSelectedExportType] = useState<'download' | 'github' | 'deploy'>('download');
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null);
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [formData, setFormData] = useState({
    projectName: 'my-generated-app',
    githubRepo: 'generated-app',
    visibility: 'private',
    deploymentPlatform: 'vercel',
    customDomain: '',
    envVars: ''
  });

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);
    
    const options: DeploymentOptions = {
      type: selectedExportType,
      projectName: formData.projectName,
      includeOptions: ['Source Code', 'Documentation', 'Docker Configuration', 'Environment Templates'],
      githubRepo: formData.githubRepo,
      deploymentPlatform: formData.deploymentPlatform,
      customDomain: formData.customDomain,
      envVars: formData.envVars
    };
    
    try {
      const result = await onExport(options);
      setExportResult(result);
      
      if (result.success) {
        setExportComplete(true);
        if (selectedExportType === 'github' && result.url) {
          setGithubRepo(result.url);
        } else if (selectedExportType === 'deploy' && result.url) {
          setDeploymentUrl(result.url);
        }
      }
    } catch (err) {
      setExportResult({ 
        success: false, 
        error: err instanceof Error ? err.message : 'Export failed' 
      });
    }
    
    setIsExporting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const exportOptions = [
    {
      id: 'download',
      name: 'Download Code',
      description: 'Download a complete ZIP file with all source code, documentation, and setup instructions',
      icon: <Download className="h-6 w-6" />,
      color: 'bg-blue-500',
      features: ['Complete source code', 'Documentation', 'Setup instructions', 'Environment templates']
    },
    {
      id: 'github',
      name: 'GitHub Repository',
      description: 'Create a new GitHub repository with your generated code and automated CI/CD setup',
      icon: <Github className="h-6 w-6" />,
      color: 'bg-gray-800',
      features: ['New GitHub repo', 'CI/CD pipeline', 'Issue templates', 'README generation']
    },
    {
      id: 'deploy',
      name: 'Instant Deploy',
      description: 'Deploy your app immediately to production with automated hosting and database setup',
      icon: <Cloud className="h-6 w-6" />,
      color: 'bg-green-500',
      features: ['Live deployment', 'Database setup', 'SSL certificates', 'Custom domain']
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
            <Zap className="h-4 w-4 mr-2" />
            Export & Deploy
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Get Your App Ready for Production
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose how you'd like to export and deploy your generated application. 
            All options include production-ready code and deployment configurations.
          </p>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {exportOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedExportType(option.id as any)}
              className={`text-left p-6 rounded-2xl border-2 transition-all ${
                selectedExportType === option.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-3 rounded-lg ${option.color} text-white`}>
                  {option.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{option.name}</h3>
                  {selectedExportType === option.id && (
                    <span className="text-sm text-indigo-600 font-medium">Selected</span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">{option.description}</p>
              <div className="space-y-2">
                {option.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Export Configuration */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Export Configuration</h3>
          </div>
          
          <div className="p-6">
            {selectedExportType === 'download' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    name="projectName"
                    type="text"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Include Options
                  </label>
                  <div className="space-y-2">
                    {['Source Code', 'Documentation', 'Docker Configuration', 'Environment Templates'].map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {selectedExportType === 'github' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repository Name
                  </label>
                  <input
                    name="githubRepo"
                    type="text"
                    value={formData.githubRepo}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repository Visibility
                  </label>
                  <select 
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Integration
                  </label>
                  <div className="space-y-2">
                    {['Setup CI/CD Actions', 'Create Issue Templates', 'Generate README', 'Setup Branch Protection'].map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {selectedExportType === 'deploy' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deployment Platform
                  </label>
                  <select 
                    name="deploymentPlatform"
                    value={formData.deploymentPlatform}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="vercel">Vercel</option>
                    <option value="netlify">Netlify</option>
                    <option value="aws">AWS</option>
                    <option value="heroku">Heroku</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Domain (Optional)
                  </label>
                  <input
                    name="customDomain"
                    type="text"
                    value={formData.customDomain}
                    onChange={handleInputChange}
                    placeholder="myapp.com"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Environment Variables
                  </label>
                  <textarea
                    name="envVars"
                    value={formData.envVars}
                    onChange={handleInputChange}
                    placeholder="DATABASE_URL=postgresql://...&#10;STRIPE_SECRET_KEY=sk_..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 h-24"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export Results */}
        {exportResult && (
          <div className={`border rounded-2xl p-6 mb-8 ${
            exportResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              {exportResult.success ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <div className="h-6 w-6 text-red-600">⚠️</div>
              )}
              <h3 className={`text-lg font-semibold ${
                exportResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {exportResult.success ? 'Export Complete!' : 'Export Failed'}
              </h3>
            </div>
            
            {exportResult.success && selectedExportType === 'download' && (
              <div className="space-y-3">
                <p className="text-green-800">Your app has been packaged and is ready for download.</p>
              </div>
            )}
            
            {exportResult.success && selectedExportType === 'github' && exportResult.url && (
              <div className="space-y-3">
                <p className="text-green-800">Your repository has been created successfully!</p>
                <div className="flex items-center space-x-3">
                  <a
                    href={exportResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors inline-flex items-center space-x-2"
                  >
                    <Github className="h-4 w-4" />
                    <span>View Repository</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(exportResult.url!)}
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            
            {exportResult.success && selectedExportType === 'deploy' && exportResult.url && (
              <div className="space-y-3">
                <p className="text-green-800">Your app is now live and accessible!</p>
                <div className="flex items-center space-x-3">
                  <a
                    href={exportResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center space-x-2"
                  >
                    <Cloud className="h-4 w-4" />
                    <span>Visit Live App</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(exportResult.url!)}
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            
            {!exportResult.success && exportResult.error && (
              <p className="text-red-800">{exportResult.error}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!exportResult?.success ? (
            <>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {exportOptions.find(opt => opt.id === selectedExportType)?.icon}
                    {exportOptions.find(opt => opt.id === selectedExportType)?.name}
                  </>
                )}
              </button>
              <button
                onClick={onBack}
                className="bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Back to Preview
              </button>
            </>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Create Another App
            </button>
          )}
        </div>

        {/* Documentation */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-6 w-6 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">What's Included</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Frontend</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• {appData.techStack.frontend} components with TypeScript</li>
                <li>• Responsive design with Tailwind CSS</li>
                <li>• State management and routing</li>
                <li>• Form validation and error handling</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Backend</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• {appData.techStack.backend} API with authentication</li>
                <li>• RESTful endpoints with validation</li>
                <li>• Error handling and logging</li>
                <li>• Security best practices</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Database</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• {appData.techStack.database} schema with relationships</li>
                <li>• Migrations and seeders</li>
                <li>• Indexes for performance</li>
                <li>• Backup and recovery scripts</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">DevOps</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Docker configuration</li>
                <li>• CI/CD pipeline setup</li>
                <li>• Environment configurations</li>
                <li>• Monitoring and logging</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExportSection;