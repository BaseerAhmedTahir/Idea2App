import React from 'react';
import { Users, Code2, Clock, Trophy } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    {
      icon: <Users className="h-8 w-8 text-indigo-600" />,
      number: "50,000+",
      label: "Apps Generated",
      description: "Developers worldwide trust our platform"
    },
    {
      icon: <Code2 className="h-8 w-8 text-green-600" />,
      number: "99.9%",
      label: "Code Quality",
      description: "Production-ready code with best practices"
    },
    {
      icon: <Clock className="h-8 w-8 text-purple-600" />,
      number: "5 min",
      label: "Average Time",
      description: "From idea to deployed application"
    },
    {
      icon: <Trophy className="h-8 w-8 text-yellow-600" />,
      number: "4.9/5",
      label: "User Rating",
      description: "Rated by satisfied developers"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Developers Worldwide
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of developers who have transformed their ideas into 
            production-ready applications using our AI-powered platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold text-gray-800 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Build Your Next App?
          </h3>
          <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
            Start with a simple description of your idea and watch our AI generate 
            a complete, production-ready application in minutes.
          </p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started Free
          </button>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;