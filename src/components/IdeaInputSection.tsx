import React, { useState } from 'react';
import { Send, Lightbulb, Zap, Settings, ArrowRight } from 'lucide-react';

interface IdeaInputSectionProps {
  onSubmit: (idea: string, preferences: any) => void;
}

const IdeaInputSection: React.FC<IdeaInputSectionProps> = ({ onSubmit }) => {
  const [idea, setIdea] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    frontend: 'React',
    backend: 'Node.js',
    database: 'PostgreSQL',
    deployment: 'Vercel',
    authentication: true,
    realtime: false,
    testing: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      onSubmit(idea, preferences);
    }
  };

  const exampleIdeas = [
    {
      title: "Social Media Platform",
      description: "Create a social media app with user profiles, posts, likes, comments, and real-time notifications",
      icon: "👥"
    },
    {
      title: "E-commerce Store",
      description: "Build an online store with product catalog, shopping cart, payment processing, and order management",
      icon: "🛒"
    },
    {
      title: "Task Management App",
      description: "Develop a project management tool with boards, tasks, team collaboration, and progress tracking",
      icon: "📋"
    },
    {
      title: "Learning Management System",
      description: "Create an LMS with courses, quizzes, progress tracking, and student-teacher interaction",
      icon: "📚"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white to-indigo-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium mb-6">
            <Lightbulb className="h-4 w-4 mr-2" />
            Describe Your Vision
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What App Would You Like to Build?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Describe your app idea in detail. The more specific you are, the better 
            our AI can understand and generate the perfect solution for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="p-6">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Example: Create a social media platform where users can share photos, follow friends, comment on posts, and receive real-time notifications. Include user profiles, a news feed, and admin dashboard..."
                className="w-full h-40 p-4 text-lg border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none placeholder-gray-400"
                required
              />
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Tech Stack Preferences
                  <ArrowRight className={`h-4 w-4 transition-transform ${showPreferences ? 'rotate-90' : ''}`} />
                </button>
                
                <button
                  type="submit"
                  disabled={!idea.trim()}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="h-4 w-4" />
                  Generate App
                </button>
              </div>
            </div>
          </div>
          
          {showPreferences && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technology Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frontend Framework</label>
                  <select
                    value={preferences.frontend}
                    onChange={(e) => setPreferences(prev => ({ ...prev, frontend: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="React">React</option>
                    <option value="Vue">Vue.js</option>
                    <option value="Angular">Angular</option>
                    <option value="Svelte">Svelte</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Backend Technology</label>
                  <select
                    value={preferences.backend}
                    onChange={(e) => setPreferences(prev => ({ ...prev, backend: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Node.js">Node.js</option>
                    <option value="Python">Python (Django/Flask)</option>
                    <option value="Ruby">Ruby on Rails</option>
                    <option value="Go">Go</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Database</label>
                  <select
                    value={preferences.database}
                    onChange={(e) => setPreferences(prev => ({ ...prev, database: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="PostgreSQL">PostgreSQL</option>
                    <option value="MongoDB">MongoDB</option>
                    <option value="MySQL">MySQL</option>
                    <option value="SQLite">SQLite</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deployment Platform</label>
                  <select
                    value={preferences.deployment}
                    onChange={(e) => setPreferences(prev => ({ ...prev, deployment: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Vercel">Vercel</option>
                    <option value="Netlify">Netlify</option>
                    <option value="AWS">AWS</option>
                    <option value="Heroku">Heroku</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="authentication"
                    checked={preferences.authentication}
                    onChange={(e) => setPreferences(prev => ({ ...prev, authentication: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="authentication" className="ml-2 text-sm text-gray-700">
                    Include user authentication system
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="realtime"
                    checked={preferences.realtime}
                    onChange={(e) => setPreferences(prev => ({ ...prev, realtime: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="realtime" className="ml-2 text-sm text-gray-700">
                    Enable real-time features (WebSockets)
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="testing"
                    checked={preferences.testing}
                    onChange={(e) => setPreferences(prev => ({ ...prev, testing: e.target.checked }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="testing" className="ml-2 text-sm text-gray-700">
                    Generate test suites
                  </label>
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="mt-16">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Need Inspiration? Try These Examples
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exampleIdeas.map((example, index) => (
              <button
                key={index}
                onClick={() => setIdea(example.description)}
                className="text-left p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{example.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {example.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{example.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IdeaInputSection;