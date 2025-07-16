import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

export interface ParsedFeature {
  id: string;
  name: string;
  description: string;
  category: 'ui' | 'backend' | 'database' | 'security' | 'integration';
  complexity: 'low' | 'medium' | 'high';
  enabled: boolean;
  dependencies: string[];
  implementation: string;
}

export interface TechStack {
  frontend: string;
  backend: string;
  database: string;
  deployment: string;
  aiProvider?: string;
  aiModel?: string;
}

export class AIService {
  private static getAIClient() {
    const provider = import.meta.env.VITE_AI_PROVIDER || 'groq';
    
    switch (provider) {
      case 'openai':
        if (!import.meta.env.VITE_OPENAI_API_KEY) {
          throw new Error('OpenAI API key not configured');
        }
        return new OpenAI({
          apiKey: import.meta.env.VITE_OPENAI_API_KEY,
          dangerouslyAllowBrowser: true
        });
      
      case 'anthropic':
        if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
          throw new Error('Anthropic API key not configured');
        }
        return new Anthropic({
          apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
          dangerouslyAllowBrowser: true
        });
      
      case 'gemini':
        if (!import.meta.env.VITE_GEMINI_API_KEY) {
          throw new Error('Gemini API key not configured');
        }
        return new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      
      case 'groq':
      default:
        if (!import.meta.env.VITE_GROQ_API_KEY) {
          throw new Error('Groq API key not configured');
        }
        return {
          apiKey: import.meta.env.VITE_GROQ_API_KEY,
          baseURL: 'https://api.groq.com/openai/v1',
          model: import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-70b-versatile'
        };
    }
  }

  private static async callAI(prompt: string): Promise<string> {
    const provider = import.meta.env.VITE_AI_PROVIDER || 'groq';
    const client = this.getAIClient();

    try {
      switch (provider) {
        case 'openai':
          const openaiResponse = await (client as OpenAI).chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 4000
          });
          return openaiResponse.choices[0]?.message?.content || '';

        case 'anthropic':
          const anthropicResponse = await (client as Anthropic).messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }]
          });
          return anthropicResponse.content[0]?.type === 'text' ? anthropicResponse.content[0].text : '';

        case 'gemini':
          const geminiModel = (client as GoogleGenerativeAI).getGenerativeModel({ model: 'gemini-2.5-pro' });
          const geminiResponse = await geminiModel.generateContent(prompt);
          return geminiResponse.response.text();

        case 'groq':
        default:
          const groqClient = client as { apiKey: string; baseURL: string; model: string };
          const groqResponse = await axios.post(
            `${groqClient.baseURL}/chat/completions`,
            {
              model: groqClient.model,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.7,
              max_tokens: 4000
            },
            {
              headers: {
                'Authorization': `Bearer ${groqClient.apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          return groqResponse.data.choices[0]?.message?.content || '';
      }
    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async parseIdea(idea: string, techStack: TechStack): Promise<ParsedFeature[]> {
    const prompt = `Analyze this app idea and extract key features: "${idea}"

Return a JSON array of features with this exact structure:
[
  {
    "id": "unique-id",
    "name": "Feature Name",
    "description": "Brief description",
    "category": "ui|backend|database|security|integration",
    "complexity": "low|medium|high",
    "enabled": true,
    "dependencies": ["other-feature-ids"],
    "implementation": "Brief implementation note"
  }
]

Focus on practical, implementable features. Include UI components, data management, user interactions, and any special functionality mentioned.`;

    try {
      const response = await this.callAI(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const features = JSON.parse(jsonMatch[0]);
        return features.map((f: any, index: number) => ({
          id: f.id || `feature-${index}`,
          name: f.name || 'Unknown Feature',
          description: f.description || 'No description',
          category: f.category || 'ui',
          complexity: f.complexity || 'medium',
          enabled: f.enabled !== false,
          dependencies: f.dependencies || [],
          implementation: f.implementation || ''
        }));
      }
    } catch (error) {
      console.error('Feature parsing error:', error);
    }

    // Fallback feature generation
    return this.generateFallbackFeatures(idea);
  }

  private static generateFallbackFeatures(idea: string): ParsedFeature[] {
    const features: ParsedFeature[] = [];
    const lowerIdea = idea.toLowerCase();

    // Common features based on keywords
    if (lowerIdea.includes('portfolio') || lowerIdea.includes('showcase')) {
      features.push(
        {
          id: 'hero-section',
          name: 'Hero Section',
          description: 'Main landing section with introduction',
          category: 'ui',
          complexity: 'low',
          enabled: true,
          dependencies: [],
          implementation: 'React component with animations'
        },
        {
          id: 'projects-showcase',
          name: 'Projects Showcase',
          description: 'Grid display of projects with details',
          category: 'ui',
          complexity: 'medium',
          enabled: true,
          dependencies: [],
          implementation: 'Dynamic project cards with filtering'
        },
        {
          id: 'skills-section',
          name: 'Skills Section',
          description: 'Display of technical skills and expertise',
          category: 'ui',
          complexity: 'low',
          enabled: true,
          dependencies: [],
          implementation: 'Animated skill bars or tags'
        },
        {
          id: 'contact-form',
          name: 'Contact Form',
          description: 'Contact form for inquiries',
          category: 'ui',
          complexity: 'medium',
          enabled: true,
          dependencies: [],
          implementation: 'Form with validation and email integration'
        }
      );
    }

    if (lowerIdea.includes('expense') || lowerIdea.includes('budget') || lowerIdea.includes('finance')) {
      features.push(
        {
          id: 'expense-tracker',
          name: 'Expense Tracker',
          description: 'Add and categorize expenses',
          category: 'ui',
          complexity: 'medium',
          enabled: true,
          dependencies: [],
          implementation: 'Form with category selection and amount input'
        },
        {
          id: 'budget-overview',
          name: 'Budget Overview',
          description: 'Visual budget summary and remaining amounts',
          category: 'ui',
          complexity: 'medium',
          enabled: true,
          dependencies: ['expense-tracker'],
          implementation: 'Charts and progress bars'
        },
        {
          id: 'expense-categories',
          name: 'Expense Categories',
          description: 'Manage different expense categories',
          category: 'ui',
          complexity: 'low',
          enabled: true,
          dependencies: [],
          implementation: 'Category management interface'
        },
        {
          id: 'reports-analytics',
          name: 'Reports & Analytics',
          description: 'Generate expense reports and analytics',
          category: 'ui',
          complexity: 'high',
          enabled: true,
          dependencies: ['expense-tracker'],
          implementation: 'Charts and data visualization'
        }
      );
    }

    // Add more feature patterns as needed
    if (features.length === 0) {
      // Generic features for any app
      features.push(
        {
          id: 'main-interface',
          name: 'Main Interface',
          description: 'Primary user interface',
          category: 'ui',
          complexity: 'medium',
          enabled: true,
          dependencies: [],
          implementation: 'Core application interface'
        },
        {
          id: 'data-management',
          name: 'Data Management',
          description: 'Handle application data',
          category: 'backend',
          complexity: 'medium',
          enabled: true,
          dependencies: [],
          implementation: 'State management and data operations'
        }
      );
    }

    return features;
  }

  static async generateCode(idea: string, features: ParsedFeature[], techStack: TechStack): Promise<any> {
    console.log('Generating code for:', idea);
    console.log('Features:', features.map(f => f.name));

    const prompt = `Generate a complete, functional React application for: "${idea}"

Features to implement:
${features.map(f => `- ${f.name}: ${f.description}`).join('\n')}

Requirements:
1. Generate ONLY working React code with TypeScript
2. Use modern React hooks (useState, useEffect)
3. Include Tailwind CSS for styling
4. Make it fully functional and interactive
5. NO explanations, NO markdown, NO comments - just clean code
6. The component should be named "App" and exported as default
7. Include proper state management for all features
8. Make it responsive and visually appealing

Generate the complete React component code:`;

    try {
      const response = await this.callAI(prompt);
      
      // Clean the response to extract only the code
      let cleanCode = response;
      
      // Remove markdown code blocks
      cleanCode = cleanCode.replace(/```(?:tsx?|jsx?|javascript|typescript|react)?\n?/g, '');
      cleanCode = cleanCode.replace(/```\n?/g, '');
      
      // Remove any explanatory text before or after code
      const lines = cleanCode.split('\n');
      let startIndex = 0;
      let endIndex = lines.length - 1;
      
      // Find the start of actual code (import or function/const)
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ') || 
            lines[i].trim().startsWith('function ') || 
            lines[i].trim().startsWith('const ') ||
            lines[i].trim().startsWith('export ')) {
          startIndex = i;
          break;
        }
      }
      
      // Find the end of actual code
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim().endsWith(';') || 
            lines[i].trim().endsWith('}') ||
            lines[i].trim().startsWith('export ')) {
          endIndex = i;
          break;
        }
      }
      
      cleanCode = lines.slice(startIndex, endIndex + 1).join('\n');
      
      // Ensure proper imports
      if (!cleanCode.includes('import React')) {
        cleanCode = `import React, { useState, useEffect } from 'react';\n\n${cleanCode}`;
      }
      
      // Ensure export default
      if (!cleanCode.includes('export default')) {
        cleanCode += '\n\nexport default App;';
      }

      return {
        'src/App.js': cleanCode,
        'package.json': this.generatePackageJson(idea),
        'README.md': this.generateReadme(idea, features)
      };
    } catch (error) {
      console.error('Code generation error:', error);
      // Return fallback code
      return {
        'src/App.js': this.generateFallbackCode(idea, features),
        'package.json': this.generatePackageJson(idea),
        'README.md': this.generateReadme(idea, features)
      };
    }
  }

  private static generateFallbackCode(idea: string, features: ParsedFeature[]): string {
    const lowerIdea = idea.toLowerCase();
    
    if (lowerIdea.includes('portfolio') || lowerIdea.includes('showcase')) {
      return this.generatePortfolioCode();
    }
    
    if (lowerIdea.includes('expense') || lowerIdea.includes('budget') || lowerIdea.includes('finance')) {
      return this.generateExpenseTrackerCode();
    }
    
    if (lowerIdea.includes('calculator')) {
      return this.generateCalculatorCode();
    }
    
    if (lowerIdea.includes('todo') || lowerIdea.includes('task')) {
      return this.generateTodoCode();
    }
    
    // Generic app template
    return this.generateGenericAppCode(idea, features);
  }

  private static generatePortfolioCode(): string {
    return `import React, { useState, useEffect } from 'react';

function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [projects] = useState([
    {
      id: 1,
      title: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with React and Node.js',
      image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=400',
      tech: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      github: '#',
      demo: '#'
    },
    {
      id: 2,
      title: 'Task Management App',
      description: 'Collaborative task management with real-time updates',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
      tech: ['React', 'Firebase', 'Material-UI'],
      github: '#',
      demo: '#'
    },
    {
      id: 3,
      title: 'Weather Dashboard',
      description: 'Beautiful weather app with location-based forecasts',
      image: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=400',
      tech: ['React', 'OpenWeather API', 'Chart.js'],
      github: '#',
      demo: '#'
    }
  ]);

  const [skills] = useState([
    { name: 'React', level: 90 },
    { name: 'JavaScript', level: 95 },
    { name: 'TypeScript', level: 85 },
    { name: 'Node.js', level: 80 },
    { name: 'Python', level: 75 },
    { name: 'MongoDB', level: 70 }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Message sent! Thank you for reaching out.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-gray-800">Portfolio</div>
            <div className="hidden md:flex space-x-8">
              {['home', 'about', 'projects', 'skills', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={\`capitalize px-3 py-2 rounded-md transition-colors \${
                    activeSection === section
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-blue-600'
                  }\`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      {activeSection === 'home' && (
        <section className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="mb-8">
              <img
                src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200"
                alt="Profile"
                className="w-32 h-32 rounded-full mx-auto mb-6 object-cover shadow-lg"
              />
              <h1 className="text-5xl font-bold text-gray-800 mb-4">
                Hi, I'm <span className="text-blue-600">John Doe</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Full-Stack Developer passionate about creating amazing web experiences
                with modern technologies and clean, efficient code.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setActiveSection('projects')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View My Work
                </button>
                <button
                  onClick={() => setActiveSection('contact')}
                  className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Get In Touch
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      {activeSection === 'about' && (
        <section className="pt-24 min-h-screen bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">About Me</h2>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=500"
                  alt="About"
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Passionate Developer & Problem Solver
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  With over 5 years of experience in web development, I specialize in creating
                  scalable, user-friendly applications using modern technologies. I'm passionate
                  about clean code, innovative solutions, and continuous learning.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-blue-600 rounded-full mr-3"></span>
                    <span>5+ years of professional experience</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-blue-600 rounded-full mr-3"></span>
                    <span>50+ projects completed</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 bg-blue-600 rounded-full mr-3"></span>
                    <span>Full-stack development expertise</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Projects Section */}
      {activeSection === 'projects' && (
        <section className="pt-24 min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">My Projects</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{project.title}</h3>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-4">
                      <a
                        href={project.github}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        GitHub
                      </a>
                      <a
                        href={project.demo}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Live Demo
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Skills Section */}
      {activeSection === 'skills' && (
        <section className="pt-24 min-h-screen bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Skills & Expertise</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {skills.map((skill) => (
                <div key={skill.name} className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-lg font-medium text-gray-800">{skill.name}</span>
                    <span className="text-blue-600 font-medium">{skill.level}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: \`\${skill.level}%\` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      {activeSection === 'contact' && (
        <section className="pt-24 min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Get In Touch</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">Let's Work Together</h3>
                <p className="text-gray-600 mb-8">
                  I'm always interested in new opportunities and exciting projects.
                  Feel free to reach out if you'd like to collaborate!
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-600 rounded-full mr-4"></span>
                    <span>john.doe@email.com</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-600 rounded-full mr-4"></span>
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-blue-600 rounded-full mr-4"></span>
                    <span>San Francisco, CA</span>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;`;
  }

  private static generateExpenseTrackerCode(): string {
    return `import React, { useState, useEffect } from 'react';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [categories] = useState([
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Travel',
    'Other'
  ]);
  const [budget, setBudget] = useState(2000);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food & Dining',
    date: new Date().toISOString().split('T')[0]
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedBudget = localStorage.getItem('budget');
    
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    if (savedBudget) {
      setBudget(parseFloat(savedBudget));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('budget', budget.toString());
  }, [budget]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.description && formData.amount) {
      const newExpense = {
        id: Date.now(),
        ...formData,
        amount: parseFloat(formData.amount)
      };
      setExpenses([newExpense, ...expenses]);
      setFormData({
        description: '',
        amount: '',
        category: 'Food & Dining',
        date: new Date().toISOString().split('T')[0]
      });
    }
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = budget - totalExpenses;

  const filteredExpenses = filter === 'all' 
    ? expenses 
    : expenses.filter(expense => expense.category === filter);

  const expensesByCategory = categories.map(category => {
    const categoryExpenses = expenses.filter(expense => expense.category === category);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    return { category, total, count: categoryExpenses.length };
  }).filter(item => item.total > 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          💰 Expense Tracker
        </h1>

        {/* Budget Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Monthly Budget</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">\${budget.toFixed(2)}</span>
              <button
                onClick={() => {
                  const newBudget = prompt('Enter new budget:', budget);
                  if (newBudget && !isNaN(newBudget)) {
                    setBudget(parseFloat(newBudget));
                  }
                }}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                ✏️
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Spent</h3>
            <span className="text-2xl font-bold text-red-600">\${totalExpenses.toFixed(2)}</span>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Remaining</h3>
            <span className={\`text-2xl font-bold \${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}\`}>
              \${remainingBudget.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Budget Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={\`h-4 rounded-full transition-all duration-500 \${
                (totalExpenses / budget) * 100 > 90 ? 'bg-red-500' :
                (totalExpenses / budget) * 100 > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }\`}
              style={{ width: \`\${Math.min((totalExpenses / budget) * 100, 100)}%\` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {((totalExpenses / budget) * 100).toFixed(1)}% of budget used
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Expense Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Lunch at restaurant"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Expense
              </button>
            </form>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Spending by Category</h2>
            <div className="space-y-3">
              {expensesByCategory.map(({ category, total, count }) => (
                <div key={category} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                  <div>
                    <span className="font-medium text-gray-800">{category}</span>
                    <span className="text-sm text-gray-600 ml-2">({count} items)</span>
                  </div>
                  <span className="font-bold text-red-600">\${total.toFixed(2)}</span>
                </div>
              ))}
              {expensesByCategory.length === 0 && (
                <p className="text-gray-500 text-center py-4">No expenses yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Recent Expenses</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredExpenses.map(expense => (
              <div key={expense.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{expense.description}</h4>
                      <p className="text-sm text-gray-600">{expense.category} • {expense.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-red-600">\${expense.amount.toFixed(2)}</span>
                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="ml-3 text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredExpenses.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                {filter === 'all' ? 'No expenses yet. Add your first expense above!' : \`No expenses in \${filter} category.\`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;`;
  }

  private static generateCalculatorCode(): string {
    return `import React, { useState } from 'react';

function App() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue, secondValue, operation) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const Button = ({ onClick, className = '', children, ...props }) => (
    <button
      onClick={onClick}
      className={\`h-16 text-xl font-semibold rounded-lg transition-all duration-150 active:scale-95 \${className}\`}
      {...props}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center p-4">
      <div className="bg-black rounded-3xl p-6 shadow-2xl max-w-sm w-full">
        <div className="mb-6">
          <div className="bg-gray-900 rounded-2xl p-6 text-right">
            <div className="text-4xl font-light text-white overflow-hidden">
              {display}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {/* Row 1 */}
          <Button
            onClick={clear}
            className="col-span-2 bg-gray-500 hover:bg-gray-400 text-black"
          >
            Clear
          </Button>
          <Button
            onClick={() => {
              if (display !== '0') {
                setDisplay(display.slice(0, -1) || '0');
              }
            }}
            className="bg-gray-500 hover:bg-gray-400 text-black"
          >
            ⌫
          </Button>
          <Button
            onClick={() => performOperation('÷')}
            className="bg-orange-500 hover:bg-orange-400 text-white"
          >
            ÷
          </Button>

          {/* Row 2 */}
          <Button
            onClick={() => inputNumber(7)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            7
          </Button>
          <Button
            onClick={() => inputNumber(8)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            8
          </Button>
          <Button
            onClick={() => inputNumber(9)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            9
          </Button>
          <Button
            onClick={() => performOperation('×')}
            className="bg-orange-500 hover:bg-orange-400 text-white"
          >
            ×
          </Button>

          {/* Row 3 */}
          <Button
            onClick={() => inputNumber(4)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            4
          </Button>
          <Button
            onClick={() => inputNumber(5)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            5
          </Button>
          <Button
            onClick={() => inputNumber(6)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            6
          </Button>
          <Button
            onClick={() => performOperation('-')}
            className="bg-orange-500 hover:bg-orange-400 text-white"
          >
            −
          </Button>

          {/* Row 4 */}
          <Button
            onClick={() => inputNumber(1)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            1
          </Button>
          <Button
            onClick={() => inputNumber(2)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            2
          </Button>
          <Button
            onClick={() => inputNumber(3)}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            3
          </Button>
          <Button
            onClick={() => performOperation('+')}
            className="bg-orange-500 hover:bg-orange-400 text-white"
          >
            +
          </Button>

          {/* Row 5 */}
          <Button
            onClick={() => inputNumber(0)}
            className="col-span-2 bg-gray-700 hover:bg-gray-600 text-white"
          >
            0
          </Button>
          <Button
            onClick={inputDecimal}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            .
          </Button>
          <Button
            onClick={handleEquals}
            className="bg-orange-500 hover:bg-orange-400 text-white"
          >
            =
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">Calculator App</p>
        </div>
      </div>
    </div>
  );
}

export default App;`;
  }

  private static generateTodoCode(): string {
    return `import React, { useState, useEffect } from 'react';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim()) {
      const newTodo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };
      setTodos([newTodo, ...todos]);
      setInputValue('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEditing = (id, text) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = () => {
    if (editingText.trim()) {
      setTodos(todos.map(todo =>
        todo.id === editingId ? { ...todo, text: editingText.trim() } : todo
      ));
    }
    setEditingId(null);
    setEditingText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const activeCount = todos.length - completedCount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
            <h1 className="text-3xl font-bold text-center mb-2">📝 Todo App</h1>
            <p className="text-center text-blue-100">Stay organized and productive</p>
          </div>

          {/* Add Todo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                placeholder="What needs to be done?"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={addTodo}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {activeCount} active, {completedCount} completed
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={\`px-3 py-1 rounded-full text-xs font-medium transition-colors \${
                    filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }\`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={\`px-3 py-1 rounded-full text-xs font-medium transition-colors \${
                    filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }\`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={\`px-3 py-1 rounded-full text-xs font-medium transition-colors \${
                    filter === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }\`}
                >
                  Completed
                </button>
              </div>
            </div>
          </div>

          {/* Todo List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredTodos.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-lg font-medium mb-2">No todos yet</p>
                <p className="text-sm">
                  {filter === 'all' && "Add a todo above to get started!"}
                  {filter === 'active' && "No active todos. Great job!"}
                  {filter === 'completed' && "No completed todos yet."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className={\`p-4 hover:bg-gray-50 transition-colors \${
                      todo.completed ? 'bg-gray-50' : ''
                    }\`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTodo(todo.id)}
                        className={\`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors \${
                          todo.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-400'
                        }\`}
                      >
                        {todo.completed && '✓'}
                      </button>

                      {editingId === todo.id ? (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <span
                            className={\`flex-1 \${
                              todo.completed
                                ? 'text-gray-500 line-through'
                                : 'text-gray-900'
                            }\`}
                          >
                            {todo.text}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditing(todo.id, todo.text)}
                              className="text-blue-500 hover:text-blue-700 text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTodo(todo.id)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {todos.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {todos.length} total todo{todos.length !== 1 ? 's' : ''}
                </span>
                {completedCount > 0 && (
                  <button
                    onClick={clearCompleted}
                    className="text-sm text-red-500 hover:text-red-700 font-medium"
                  >
                    Clear completed ({completedCount})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;`;
  }

  private static generateGenericAppCode(idea: string, features: ParsedFeature[]): string {
    const appName = idea.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');

    return `import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general'
  });

  useEffect(() => {
    const savedData = localStorage.getItem('appData');
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('appData', JSON.stringify(data));
  }, [data]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      const newItem = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      setData([newItem, ...data]);
      setFormData({ title: '', description: '', category: 'general' });
    }
  };

  const deleteItem = (id) => {
    setData(data.filter(item => item.id !== id));
  };

  const toggleStatus = (id) => {
    setData(data.map(item =>
      item.id === id 
        ? { ...item, status: item.status === 'active' ? 'completed' : 'active' }
        : item
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🚀 ${appName}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            ${idea}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New Item</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter title..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="general">General</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Add Item
              </button>
            </form>
          </div>

          {/* Data Display Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Items</h2>
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                {data.length} total
              </span>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {data.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
                  <p className="text-gray-600">Add your first item using the form on the left.</p>
                </div>
              ) : (
                data.map((item) => (
                  <div
                    key={item.id}
                    className={\`p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow \${
                      item.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white'
                    }\`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className={\`font-semibold \${
                            item.status === 'completed' ? 'text-green-800 line-through' : 'text-gray-800'
                          }\`}>
                            {item.title}
                          </h3>
                          <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                            item.category === 'important' ? 'bg-red-100 text-red-800' :
                            item.category === 'urgent' ? 'bg-orange-100 text-orange-800' :
                            item.category === 'low' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }\`}>
                            {item.category}
                          </span>
                        </div>
                        {item.description && (
                          <p className={\`text-gray-600 text-sm mb-2 \${
                            item.status === 'completed' ? 'line-through' : ''
                          }\`}>
                            {item.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => toggleStatus(item.id)}
                          className={\`px-3 py-1 rounded text-sm font-medium transition-colors \${
                            item.status === 'completed'
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }\`}
                        >
                          {item.status === 'completed' ? 'Reopen' : 'Complete'}
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${features.map(feature => `
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">${feature.name}</h3>
              <p className="text-gray-600 text-sm">${feature.description}</p>
              <span className="inline-block mt-2 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                ${feature.category}
              </span>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;`;
  }

  private static generatePackageJson(idea: string): string {
    const projectName = idea.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    return JSON.stringify({
      name: projectName,
      version: "1.0.0",
      private: true,
      dependencies: {
        "react": "^18.3.1",
        "react-dom": "^18.3.1"
      },
      scripts: {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test",
        "eject": "react-scripts eject"
      },
      devDependencies: {
        "react-scripts": "5.0.1"
      },
      browserslist: {
        "production": [
          ">0.2%",
          "not dead",
          "not op_mini all"
        ],
        "development": [
          "last 1 chrome version",
          "last 1 firefox version",
          "last 1 safari version"
        ]
      }
    }, null, 2);
  }

  private static generateReadme(idea: string, features: ParsedFeature[]): string {
    const appName = idea.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');

    return `# ${appName}

${idea}

## Features

${features.map(f => `- **${f.name}**: ${f.description}`).join('\n')}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Technologies Used

- React 18
- Tailwind CSS
- Local Storage for data persistence

## Available Scripts

- \`npm start\` - Runs the app in development mode
- \`npm build\` - Builds the app for production
- \`npm test\` - Launches the test runner

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License.
`;
  }

  // Additional methods for backward compatibility
  static async generateFrontendCode(idea: string, features: ParsedFeature[], techStack: TechStack): Promise<string> {
    const fullCode = await this.generateCode(idea, features, techStack);
    return fullCode['src/App.js'] || '';
  }

  static async generateBackendCode(idea: string, features: ParsedFeature[], techStack: TechStack): Promise<string> {
    return `// Backend code for: ${idea}
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// API endpoints based on features
${features.map(f => `// ${f.name}: ${f.description}`).join('\n')}

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;
  }

  static async generateDatabaseSchema(idea: string, features: ParsedFeature[], techStack: TechStack): Promise<string> {
    return `-- Database schema for: ${idea}
-- Generated based on features: ${features.map(f => f.name).join(', ')}

CREATE TABLE IF NOT EXISTS app_data (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_data_status ON app_data(status);
CREATE INDEX idx_app_data_category ON app_data(category);
CREATE INDEX idx_app_data_created_at ON app_data(created_at);`;
  }

  static async generateDeploymentConfig(idea: string, features: ParsedFeature[], techStack: TechStack): Promise<string> {
    return `# Deployment configuration for: ${idea}
# Platform: ${techStack.deployment}

# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

---

# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production

---

# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run build
      - run: npm run deploy`;
  }
}
