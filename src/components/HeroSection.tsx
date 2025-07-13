import React from 'react';
import { Sparkles, ArrowRight, Code2, Brain, Rocket } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4 mr-2" />
            Powered by Advanced AI
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Transform Ideas into
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {' '}Functional Apps
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Describe your app idea in plain English and watch our AI generate 
            production-ready code with frontend, backend, database, and deployment 
            configurations in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Watch Demo
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-gray-600">
                Advanced NLP understands complex requirements and generates comprehensive feature lists
              </p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
                <Code2 className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Production-Ready Code</h3>
              <p className="text-gray-600">
                Generates scalable, secure, and well-structured code with tests and documentation
              </p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
                <Rocket className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Deployment</h3>
              <p className="text-gray-600">
                One-click deployment to popular platforms with automated CI/CD pipelines
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-green-400 to-blue-400 rounded-full opacity-20 blur-3xl" />
      </div>
    </section>
  );
};

export default HeroSection;