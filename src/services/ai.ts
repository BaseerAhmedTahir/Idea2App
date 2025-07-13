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

export interface GeneratedCode {
  frontend: string;
  backend: string;
  database: string;
  tests: string;
  deployment: string;
  packageJson: string;
  readme: string;
}

type AIProvider = 'openai' | 'gemini' | 'anthropic' | 'groq';

interface AIClient {
  generateText(prompt: string, systemPrompt?: string): Promise<string>;
}

class OpenAIClient implements AIClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
      baseURL: apiKey.startsWith('sk-or-v1-') ? 'https://openrouter.ai/api/v1' : undefined
    });
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const messages: any[] = [];
        
        if (systemPrompt) {
          messages.push({ role: 'system', content: systemPrompt });
        }
        
        messages.push({ role: 'user', content: prompt });

        const response = await this.client.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
          temperature: 0.7,
          max_tokens: 3000
        });

        return response.choices[0]?.message?.content || '';
      } catch (error: any) {
        // Check if it's a rate limit error
        if (error.status === 429 && attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
          console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If it's still a rate limit error on final attempt, throw a more helpful error
        if (error.status === 429) {
          throw new Error('OpenAI rate limit exceeded. Please wait a moment and try again, or consider upgrading your OpenAI plan at https://platform.openai.com/account/billing');
        }
        
        throw error;
      }
    }
    
    throw new Error('Failed to generate text after multiple attempts');
  }
}

class GeminiClient implements AIClient {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: "gemini-2.5-pro" });
    
    const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    
    return response.text();
  }
}

class AnthropicClient implements AIClient {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const response = await this.client.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 3000,
      system: systemPrompt,
      messages: [
        { role: "user", content: prompt }
      ]
    });

    return response.content[0]?.type === 'text' ? response.content[0].text : '';
  }
}

class GroqClient implements AIClient {
  private apiKey: string;
  private baseURL = 'https://api.groq.com/openai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    const maxRetries = 3;
    const baseDelay = 1000;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const messages: any[] = [];
        
        if (systemPrompt) {
          messages.push({ role: 'system', content: systemPrompt });
        }
        
        messages.push({ role: 'user', content: prompt });

        const response = await axios.post(
          `${this.baseURL}/chat/completions`,
          {
            model: this.getSelectedModel(),
            messages,
            temperature: 0.7,
            max_tokens: 3000,
            stream: false
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        return response.data.choices[0]?.message?.content || '';
      } catch (error: any) {
        // Check if it's a rate limit error
        if (error.response?.status === 429 && attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Groq rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        if (error.response?.status === 429) {
          throw new Error('Groq rate limit exceeded. Please wait a moment and try again.');
        }
        
        throw error;
      }
    }
    
    throw new Error('Failed to generate text after multiple attempts');
  }

  private getSelectedModel(): string {
    // Get the selected model from environment variable or default to llama
    const selectedModel = import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-70b-versatile';
    return selectedModel;
  }
}

class AIService {
  private static client: AIClient | null = null;

  private static getClient(): AIClient {
    if (!this.client) {
      const provider = (import.meta.env.VITE_AI_PROVIDER || 'openai') as AIProvider;
      
      switch (provider) {
        case 'openai':
          const openaiKey = import.meta.env.VITE_OPENROUTER_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;
          if (!openaiKey) {
            throw new Error('API key is not configured. Please add your API key to the .env file.');
          }
          if (openaiKey === 'your_openai_api_key_here' || openaiKey === 'your_openrouter_api_key_here') {
            throw new Error('Please replace the placeholder with your actual API key in the .env file.');
          }
          this.client = new OpenAIClient(openaiKey);
          break;
          
        case 'gemini':
          const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
          if (!geminiKey) {
            throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
          }
          this.client = new GeminiClient(geminiKey);
          break;
          
        case 'anthropic':
          const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
          if (!anthropicKey) {
            throw new Error('Anthropic API key is not configured. Please add VITE_ANTHROPIC_API_KEY to your .env file.');
          }
          this.client = new AnthropicClient(anthropicKey);
          break;
          
        case 'groq':
          const groqKey = import.meta.env.VITE_GROQ_API_KEY;
          if (!groqKey) {
            throw new Error('Groq API key is not configured. Please add VITE_GROQ_API_KEY to your .env file.');
          }
          if (groqKey === 'your_groq_api_key_here') {
            throw new Error('Please replace the placeholder with your actual Groq API key in the .env file.');
          }
          this.client = new GroqClient(groqKey);
          break;
          
        default:
          throw new Error(`Unsupported AI provider: ${provider}. Supported providers: openai, gemini, anthropic, groq`);
      }
    }
    
    return this.client;
  }

  static async parseIdea(idea: string, techStack: any): Promise<ParsedFeature[]> {
    try {
      const client = this.getClient();
      const systemPrompt = "You are an expert software architect. Analyze app ideas and extract implementable features. Always return valid JSON.";
      
      const prompt = `
        Analyze this app idea and extract specific features that need to be implemented:
        
        Idea: "${idea}"
        Tech Stack: ${JSON.stringify(techStack)}
        
        Return a JSON array of features with this exact structure:
        [
          {
            "id": "unique-feature-id",
            "name": "Feature Name",
            "description": "Detailed description of what this feature does",
            "category": "ui|backend|database|security|integration",
            "complexity": "low|medium|high",
            "enabled": true,
            "dependencies": ["array-of-feature-ids-this-depends-on"],
            "implementation": "Brief technical implementation approach"
          }
        ]
        
        Focus on:
        - User authentication and authorization
        - Core business logic features
        - Database entities and relationships
        - UI components and user interactions
        - Security considerations
        - Third-party integrations
        - API endpoints needed
        
        Make sure each feature is specific and actionable for code generation.
      `;

      const response = await client.generateText(prompt, systemPrompt);
      
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No valid JSON found in response');

      const features = JSON.parse(jsonMatch[0]);
      return features.map((feature: any, index: number) => ({
        ...feature,
        id: feature.id || `feature-${index + 1}`
      }));
    } catch (error) {
      console.error('Error parsing idea:', error);
      
      // If it's a rate limit error, provide helpful message
      if (error instanceof Error && error.message.includes('rate limit')) {
        throw new Error(`AI service temporarily unavailable due to rate limits. ${error.message}`);
      }
      
      // Fallback to basic feature extraction
      return this.fallbackFeatureExtraction(idea);
    }
  }

  static async generateCode(
    idea: string, 
    features: ParsedFeature[], 
    techStack: any
  ): Promise<GeneratedCode> {
    const enabledFeatures = features.filter(f => f.enabled);
    
    try {
      // Generate each code component
      const [frontend, backend, database, tests, deployment, packageJson, readme] = await Promise.all([
        this.generateFrontendCode(idea, enabledFeatures, techStack),
        this.generateBackendCode(idea, enabledFeatures, techStack),
        this.generateDatabaseSchema(idea, enabledFeatures, techStack),
        this.generateTests(idea, enabledFeatures, techStack),
        this.generateDeploymentConfig(idea, enabledFeatures, techStack),
        this.generatePackageJson(idea, enabledFeatures, techStack),
        this.generateReadme(idea, enabledFeatures, techStack)
      ]);

      return {
        frontend,
        backend,
        database,
        tests,
        deployment,
        packageJson,
        readme
      };
    } catch (error) {
      console.error('Error generating code:', error);
      
      // If it's a rate limit error, provide helpful message
      if (error instanceof Error && error.message.includes('rate limit')) {
        throw new Error(`Code generation temporarily unavailable due to rate limits. ${error.message}`);
      }
      
      throw new Error('Failed to generate code. Please try again.');
    }
  }

  static async generateFrontendCode(
    idea: string, 
    features: ParsedFeature[], 
    techStack: any
  ): Promise<string> {
    const client = this.getClient();
    const systemPrompt = "You are an expert frontend developer. Generate ONLY executable React code with TypeScript and Tailwind CSS. Do NOT include markdown, explanations, or documentation. Return ONLY the raw code that can be executed directly.";
    
    const prompt = `
      Generate ONLY the executable React component code for this idea (no markdown, no explanations):
      
      Idea: "${idea}"
      Features: ${JSON.stringify(features.map(f => ({ name: f.name, description: f.description })))}
      
      Requirements:
      - Return ONLY executable React/JSX code
      - Use Tailwind CSS for styling
      - Use React hooks (useState, useEffect)
      - Include form validation
      - Add error handling and loading states
      - Make it responsive and accessible
      - Create a functional single-page application
      
      Return ONLY the App component code that can be executed directly in a browser.
      Start with: import React, { useState } from 'react';
      End with: export default App;
    `;

    try {
      const response = await client.generateText(prompt, systemPrompt);
      
      // If we get a valid response, return it
      if (response && response.length > 100) {
        return response;
      }
    } catch (error) {
      console.error('Error generating frontend code:', error);
    }
    
    // Return fallback code based on the specific idea
    return this.getFallbackFrontendCode(techStack, idea, features);
  }

  static async generateBackendCode(
    idea: string, 
    features: ParsedFeature[], 
    techStack: any
  ): Promise<string> {
    const client = this.getClient();
    const systemPrompt = "You are an expert backend developer. Generate ONLY executable Node.js/Express code. Do NOT include markdown, explanations, or documentation. Return ONLY the raw code.";
    
    const prompt = `
      Generate ONLY the executable Node.js/Express server code for this idea:
      
      Idea: "${idea}"
      Features: ${JSON.stringify(features.map(f => ({ name: f.name, description: f.description })))}
      
      Requirements:
      - Return ONLY executable Node.js/Express code
      - Include authentication middleware (JWT)
      - Add input validation and sanitization
      - Implement proper error handling
      - Include CORS and security headers
      - Add rate limiting
      - Create RESTful API endpoints
      
      Return ONLY the server.js code that can be executed directly.
    `;

    const response = await client.generateText(prompt, systemPrompt);
    return response || this.getFallbackBackendCode(techStack);
  }

  static async generateDatabaseSchema(
    idea: string, 
    features: ParsedFeature[], 
    techStack: any
  ): Promise<string> {
    const client = this.getClient();
    const systemPrompt = "You are an expert database architect. Generate ONLY executable SQL schema code. Do NOT include markdown, explanations, or documentation. Return ONLY the raw SQL.";
    
    const prompt = `
      Generate ONLY the executable SQL schema for this idea:
      
      Idea: "${idea}"
      Features: ${JSON.stringify(features.map(f => ({ name: f.name, description: f.description })))}
      
      Requirements:
      - Return ONLY executable SQL code
      - Create tables with proper relationships
      - Include indexes for performance
      - Add constraints and validations
      - Include user authentication tables
      - Add audit fields (created_at, updated_at)
      
      Return ONLY the SQL schema code that can be executed directly.
    `;

    const response = await client.generateText(prompt, systemPrompt);
    return response || this.getFallbackDatabaseSchema(techStack);
  }

  static async generateTests(
    idea: string, 
    features: ParsedFeature[], 
    techStack: any
  ): Promise<string> {
    const client = this.getClient();
    const systemPrompt = "You are an expert test engineer. Generate ONLY executable test code. Do NOT include markdown, explanations, or documentation. Return ONLY the raw test code.";
    
    const prompt = `
      Generate ONLY the executable test code for this application:
      
      Idea: "${idea}"
      Features: ${JSON.stringify(features.map(f => ({ name: f.name, description: f.description })))}
      Tech Stack: ${JSON.stringify(techStack)}
      
      Requirements:
      - Return ONLY executable test code
      - Unit tests for components and functions
      - Integration tests for API endpoints
      - Use Jest and React Testing Library
      
      Return ONLY the test code that can be executed directly.
    `;

    const response = await client.generateText(prompt, systemPrompt);
    return response || this.getFallbackTests();
  }

  static async generateDeploymentConfig(
    idea: string, 
    features: ParsedFeature[], 
    techStack: any
  ): Promise<string> {
    const client = this.getClient();
    const systemPrompt = "You are an expert DevOps engineer. Generate ONLY executable deployment configuration. Do NOT include markdown, explanations, or documentation. Return ONLY the raw config.";
    
    const prompt = `
      Generate ONLY the executable deployment configuration for ${techStack.deployment}:
      
      Idea: "${idea}"
      Tech Stack: ${JSON.stringify(techStack)}
      
      Requirements:
      - Return ONLY executable configuration files
      - Docker configuration
      - CI/CD pipeline (GitHub Actions)
      - Environment variables setup
      - Production optimizations
      
      Return ONLY the deployment configuration that can be used directly.
    `;

    const response = await client.generateText(prompt, systemPrompt);
    return response || this.getFallbackDeploymentConfig(techStack);
  }

  static async generatePackageJson(
    idea: string, 
    features: ParsedFeature[], 
    techStack: any
  ): Promise<string> {
    const dependencies = this.getDependencies(features, techStack);
    
    const packageJson = {
      name: idea.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      version: "1.0.0",
      description: idea,
      main: "index.js",
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        preview: "vite preview",
        test: "jest",
        "test:watch": "jest --watch",
        "test:coverage": "jest --coverage",
        start: "node server.js",
        "start:dev": "nodemon server.js"
      },
      dependencies,
      devDependencies: {
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "@vitejs/plugin-react": "^4.0.0",
        "typescript": "^5.0.0",
        "vite": "^4.4.0",
        "jest": "^29.0.0",
        "@testing-library/react": "^13.0.0",
        "@testing-library/jest-dom": "^5.16.0",
        "nodemon": "^3.0.0"
      }
    };

    return JSON.stringify(packageJson, null, 2);
  }

  static async generateReadme(
    idea: string, 
    features: ParsedFeature[], 
    techStack: any
  ): Promise<string> {
    return `# ${idea}

## Description
${idea}

## Features
${features.map(f => `- ${f.name}: ${f.description}`).join('\n')}

## Tech Stack
- Frontend: ${techStack.frontend}
- Backend: ${techStack.backend}
- Database: ${techStack.database}
- Deployment: ${techStack.deployment}

## Getting Started

### Prerequisites
- Node.js 18+
- ${techStack.database}

### Installation
1. Clone the repository
2. Install dependencies: \`npm install\`
3. Set up environment variables (see .env.example)
4. Run database migrations
5. Start development server: \`npm run dev\`

### Deployment
This application is configured for deployment on ${techStack.deployment}.

## API Documentation
[Add API documentation here]

## Contributing
[Add contributing guidelines here]

## License
MIT License
`;
  }

  // Fallback methods for when AI fails
  private static fallbackFeatureExtraction(idea: string): ParsedFeature[] {
    const commonFeatures: ParsedFeature[] = [
      {
        id: 'user-auth',
        name: 'User Authentication',
        description: 'User registration, login, and profile management',
        category: 'security',
        complexity: 'medium',
        enabled: true,
        dependencies: [],
        implementation: 'JWT-based authentication with bcrypt password hashing'
      },
      {
        id: 'database-setup',
        name: 'Database Schema',
        description: 'Database tables and relationships',
        category: 'database',
        complexity: 'medium',
        enabled: true,
        dependencies: [],
        implementation: 'Relational database with proper indexing and constraints'
      },
      {
        id: 'api-endpoints',
        name: 'REST API',
        description: 'RESTful API endpoints for data operations',
        category: 'backend',
        complexity: 'medium',
        enabled: true,
        dependencies: ['database-setup'],
        implementation: 'Express.js REST API with validation and error handling'
      },
      {
        id: 'frontend-ui',
        name: 'User Interface',
        description: 'Responsive web interface',
        category: 'ui',
        complexity: 'medium',
        enabled: true,
        dependencies: ['api-endpoints'],
        implementation: 'React components with Tailwind CSS styling'
      }
    ];

    // Add specific features based on keywords in the idea
    if (idea.toLowerCase().includes('social') || idea.toLowerCase().includes('post')) {
      commonFeatures.push({
        id: 'social-features',
        name: 'Social Features',
        description: 'Posts, likes, comments, and social interactions',
        category: 'ui',
        complexity: 'high',
        enabled: true,
        dependencies: ['user-auth', 'api-endpoints'],
        implementation: 'Social interaction components with real-time updates'
      });
    }

    if (idea.toLowerCase().includes('notification')) {
      commonFeatures.push({
        id: 'notifications',
        name: 'Notifications',
        description: 'Real-time notifications system',
        category: 'backend',
        complexity: 'high',
        enabled: true,
        dependencies: ['user-auth'],
        implementation: 'WebSocket-based real-time notifications'
      });
    }

    return commonFeatures;
  }

  private static getFallbackFrontendCode(techStack: any, idea?: string, features?: ParsedFeature[]): string {
    // Generate different fallback code based on the idea
    if (idea && idea.toLowerCase().includes('portfolio')) {
      return this.getPortfolioFallbackCode();
    } else if (idea && idea.toLowerCase().includes('todo')) {
      return this.getTodoFallbackCode();
    } else if (idea && idea.toLowerCase().includes('blog')) {
      return this.getBlogFallbackCode();
    }
    
    // Default fallback
    return `// Generated ${techStack.frontend} Application
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Generated App</h1>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <h2 className="text-2xl font-bold mb-4">Welcome to Your Generated App</h2>
      <p className="text-gray-600">This is your generated application homepage.</p>
    </div>
  );
}

function Login() {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  );
}

function Register() {
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <form>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default App;`;
  }

  private static getPortfolioFallbackCode(): string {
    return `// Generated Portfolio Application
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">John Doe</h1>
            <nav className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="#projects" className="text-gray-600 hover:text-gray-900">Projects</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </header>
      
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Hi, I'm John Doe</h2>
            <p className="text-xl mb-8">Full Stack Developer & Designer</p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              View My Work
            </button>
          </div>
        </section>
        
        {/* About Section */}
        <section id="about" className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">About Me</h3>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-gray-600 mb-6">
                  I'm a passionate developer with 5+ years of experience creating 
                  beautiful and functional web applications. I love turning ideas 
                  into reality through clean, efficient code.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900 w-24">Frontend:</span>
                    <span className="text-gray-600">React, Vue, TypeScript</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900 w-24">Backend:</span>
                    <span className="text-gray-600">Node.js, Python, PostgreSQL</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-gray-900 w-24">Tools:</span>
                    <span className="text-gray-600">Git, Docker, AWS</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Profile Image</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Projects Section */}
        <section id="projects" className="py-20 bg-gray-100">
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">My Projects</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((project) => (
                <div key={project} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Project {project}</span>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-semibold mb-2">Project Title {project}</h4>
                    <p className="text-gray-600 mb-4">
                      A brief description of this amazing project and the technologies used.
                    </p>
                    <div className="flex space-x-4">
                      <button className="text-blue-600 hover:text-blue-800">View Demo</button>
                      <button className="text-gray-600 hover:text-gray-800">View Code</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Contact Section */}
        <section id="contact" className="py-20">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold mb-8">Get In Touch</h3>
            <p className="text-gray-600 mb-8">
              I'm always open to discussing new opportunities and interesting projects.
            </p>
            <div className="flex justify-center space-x-6">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Email Me
              </button>
              <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                LinkedIn
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2024 John Doe. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;`;
  }

  private static getTodoFallbackCode(): string {
    return `// Generated Todo Application
import React, { useState } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build a todo app', completed: true },
    { id: 3, text: 'Deploy to production', completed: false }
  ]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue,
        completed: false
      }]);
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto pt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Todo App</h1>
          
          {/* Add Todo Form */}
          <div className="flex mb-6">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="Add a new todo..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addTodo}
              className="bg-blue-500 text-white px-6 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </div>
          
          {/* Todo List */}
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={\`flex items-center p-3 border border-gray-200 rounded-lg \${
                  todo.completed ? 'bg-gray-50' : 'bg-white'
                }\`}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span
                  className={\`flex-1 \${
                    todo.completed
                      ? 'text-gray-500 line-through'
                      : 'text-gray-900'
                  }\`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          
          {/* Stats */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {todos.filter(todo => !todo.completed).length} of {todos.length} tasks remaining
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;`;
  }

  private static getBlogFallbackCode(): string {
    return `// Generated Blog Application
import React, { useState } from 'react';
import './App.css';

function App() {
  const [posts] = useState([
    {
      id: 1,
      title: 'Getting Started with React',
      excerpt: 'Learn the basics of React and start building amazing applications.',
      content: 'React is a powerful JavaScript library for building user interfaces...',
      author: 'John Doe',
      date: '2024-01-15',
      category: 'Tutorial'
    },
    {
      id: 2,
      title: 'Advanced JavaScript Concepts',
      excerpt: 'Dive deep into closures, promises, and async/await patterns.',
      content: 'JavaScript has many advanced concepts that can help you write better code...',
      author: 'Jane Smith',
      date: '2024-01-12',
      category: 'JavaScript'
    },
    {
      id: 3,
      title: 'Building Responsive Layouts',
      excerpt: 'Master CSS Grid and Flexbox for modern web layouts.',
      content: 'Creating responsive layouts is essential for modern web development...',
      author: 'Mike Johnson',
      date: '2024-01-10',
      category: 'CSS'
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">My Blog</h1>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to My Blog</h2>
          <p className="text-xl text-gray-600">Sharing thoughts on web development and technology</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {post.category}
                  </span>
                  <span className="text-gray-500 text-sm ml-auto">{post.date}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">By {post.author}</span>
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Read More
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2024 My Blog. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;`;
  }

  private static getFallbackBackendCode(techStack: any): string {
    return `// Generated ${techStack.backend} Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401);
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );
    
    // Generate token
    const token = jwt.sign(
      { userId: result.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: result.rows[0] });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(port, () => {
  console.log(\`Server running on port \${port}\`);
});

module.exports = app;`;
  }

  private static getFallbackDatabaseSchema(techStack: any): string {
    return `-- Generated ${techStack.database} Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for authentication
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Application-specific tables (example)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data
INSERT INTO users (email, password, name) VALUES
('admin@example.com', '$2a$10$example_hashed_password', 'Admin User'),
('user@example.com', '$2a$10$example_hashed_password', 'Regular User');`;
  }

  private static getFallbackTests(): string {
    return `// Generated Test Suite
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Mock API calls
jest.mock('../services/api', () => ({
  login: jest.fn(),
  register: jest.fn(),
  getProfile: jest.fn(),
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('App Component', () => {
  test('renders main navigation', () => {
    renderWithRouter(<App />);
    expect(screen.getByText('Generated App')).toBeInTheDocument();
  });

  test('renders home page by default', () => {
    renderWithRouter(<App />);
    expect(screen.getByText('Welcome to Your Generated App')).toBeInTheDocument();
  });
});

describe('Authentication', () => {
  test('user can navigate to login page', () => {
    renderWithRouter(<App />);
    // Add navigation test logic
  });

  test('user can register', async () => {
    renderWithRouter(<App />);
    // Add registration test logic
  });

  test('user can login', async () => {
    renderWithRouter(<App />);
    // Add login test logic
  });
});

// API Tests
describe('API Endpoints', () => {
  test('POST /api/auth/register creates new user', async () => {
    // Add API test logic
  });

  test('POST /api/auth/login authenticates user', async () => {
    // Add API test logic
  });

  test('GET /api/user/profile returns user data', async () => {
    // Add API test logic
  });
});`;
  }

  private static getFallbackDeploymentConfig(techStack: any): string {
    return `# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
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
      - DATABASE_URL=postgresql://user:password@db:5432/appdb
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=appdb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:

---

# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to ${techStack.deployment}
        run: |
          # Add deployment commands here
          echo "Deploying to ${techStack.deployment}"`;
  }

  private static getDependencies(features: ParsedFeature[], techStack: any): Record<string, string> {
    const baseDependencies = {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "react-router-dom": "^6.8.0",
      "axios": "^1.3.0"
    };

    // Add dependencies based on features
    const dependencies = { ...baseDependencies };

    if (features.some(f => f.category === 'security')) {
      dependencies["jsonwebtoken"] = "^9.0.0";
      dependencies["bcryptjs"] = "^2.4.3";
    }

    if (techStack.backend === 'Node.js') {
      dependencies["express"] = "^4.18.0";
      dependencies["cors"] = "^2.8.5";
      dependencies["helmet"] = "^6.0.0";
      dependencies["express-rate-limit"] = "^6.7.0";
    }

    if (techStack.database === 'PostgreSQL') {
      dependencies["pg"] = "^8.9.0";
    } else if (techStack.database === 'MongoDB') {
      dependencies["mongoose"] = "^7.0.0";
    }

    return dependencies;
  }
}

export { AIService };