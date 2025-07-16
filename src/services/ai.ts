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
  aiProvider: string;
  aiModel: string;
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
    
    try {
      switch (provider) {
        case 'openai': {
          const client = this.getAIClient() as OpenAI;
          const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 4000
          });
          return response.choices[0]?.message?.content || '';
        }
        
        case 'anthropic': {
          const client = this.getAIClient() as Anthropic;
          const response = await client.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }]
          });
          return response.content[0]?.type === 'text' ? response.content[0].text : '';
        }
        
        case 'gemini': {
          const client = this.getAIClient() as GoogleGenerativeAI;
          const model = client.getGenerativeModel({ model: 'gemini-2.5-pro' });
          const response = await model.generateContent(prompt);
          return response.response.text();
        }
        
        case 'groq':
        default: {
          const client = this.getAIClient() as any;
          const response = await axios.post(
            `${client.baseURL}/chat/completions`,
            {
              model: client.model,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.7,
              max_tokens: 4000
            },
            {
              headers: {
                'Authorization': `Bearer ${client.apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          return response.data.choices[0]?.message?.content || '';
        }
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

Focus on practical, implementable features. Include UI components, data management, user interactions, and core functionality.`;

    try {
      const response = await this.callAI(prompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const features = JSON.parse(jsonMatch[0]);
        return features.map((f: any, index: number) => ({
          id: f.id || `feature-${index}`,
          name: f.name || 'Unnamed Feature',
          description: f.description || 'No description',
          category: f.category || 'ui',
          complexity: f.complexity || 'medium',
          enabled: f.enabled !== false,
          dependencies: f.dependencies || [],
          implementation: f.implementation || ''
        }));
      }
      
      // Fallback if JSON parsing fails
      return this.generateFallbackFeatures(idea);
    } catch (error) {
      console.error('Feature parsing error:', error);
      return this.generateFallbackFeatures(idea);
    }
  }

  private static generateFallbackFeatures(idea: string): ParsedFeature[] {
    const lowerIdea = idea.toLowerCase();
    const features: ParsedFeature[] = [];

    // Basic UI features
    features.push({
      id: 'main-interface',
      name: 'Main User Interface',
      description: 'Primary application interface and layout',
      category: 'ui',
      complexity: 'medium',
      enabled: true,
      dependencies: [],
      implementation: 'React components with responsive design'
    });

    // Conditional features based on keywords
    if (lowerIdea.includes('auth') || lowerIdea.includes('login') || lowerIdea.includes('user')) {
      features.push({
        id: 'user-auth',
        name: 'User Authentication',
        description: 'User login and registration system',
        category: 'security',
        complexity: 'high',
        enabled: true,
        dependencies: [],
        implementation: 'JWT-based authentication'
      });
    }

    if (lowerIdea.includes('data') || lowerIdea.includes('store') || lowerIdea.includes('save')) {
      features.push({
        id: 'data-storage',
        name: 'Data Storage',
        description: 'Store and retrieve application data',
        category: 'database',
        complexity: 'medium',
        enabled: true,
        dependencies: [],
        implementation: 'Local storage and state management'
      });
    }

    if (lowerIdea.includes('form') || lowerIdea.includes('input') || lowerIdea.includes('create')) {
      features.push({
        id: 'form-handling',
        name: 'Form Management',
        description: 'Handle user input and form submissions',
        category: 'ui',
        complexity: 'low',
        enabled: true,
        dependencies: [],
        implementation: 'Controlled components with validation'
      });
    }

    return features;
  }

  static async generateCode(idea: string, features: ParsedFeature[], techStack: TechStack): Promise<any> {
    console.log('Generating code for:', idea);
    console.log('Features:', features.map(f => f.name));

    // Generate all required files for a complete React app
    const generatedCode = {
      // React App Component
      'src/App.js': `import React from 'react';\n\n${await this.generateReactApp(idea, features)}`,
      
      // Entry point
      'src/index.js': this.generateIndexJs(),
      
      // CSS styles
      'src/index.css': this.generateIndexCss(),
      
      // HTML template
      'public/index.html': this.generateIndexHtml(idea),
      
      // Package.json with all dependencies
      'package.json': this.generatePackageJson(idea),
      
      // README
      'README.md': this.generateReadme(idea, features),
      
      // Environment example
      '.env.example': this.generateEnvExample(),
      
      // Gitignore
      '.gitignore': this.generateGitignore()
    };

    return generatedCode;
  }

  private static async generateReactApp(idea: string, features: ParsedFeature[]): Promise<string> {
    const hasAuth = features.some(f => f.name.toLowerCase().includes('auth'));
    const hasForm = features.some(f => f.name.toLowerCase().includes('form') || f.name.toLowerCase().includes('input'));
    const hasData = features.some(f => f.name.toLowerCase().includes('data') || f.name.toLowerCase().includes('storage'));

    const prompt = `Create a complete React functional component for: "${idea}"

Features to implement:
${features.map(f => `- ${f.name}: ${f.description}`).join('\n')}

Requirements:
- Use React hooks (useState, useEffect)
- Include Tailwind CSS classes for styling
- Make it fully functional and interactive
- Add proper error handling
- Include loading states where appropriate
- Make it responsive and modern looking
- Don't include any imports or exports (they'll be added automatically)

Return only the React component code, starting with the function declaration.`;

    try {
      const response = await this.callAI(prompt);
      
      // Clean up the response to extract just the component code
      let cleanCode = response;
      
      // Remove any markdown code blocks
      cleanCode = cleanCode.replace(/```(?:jsx?|javascript|react)?\n?/g, '');
      cleanCode = cleanCode.replace(/```\n?/g, '');
      
      // Remove any import statements (we'll add them separately)
      cleanCode = cleanCode.replace(/import.*?from.*?;?\n/g, '');
      
      // Remove any export statements
      cleanCode = cleanCode.replace(/export\s+default\s+\w+;?\n?/g, '');
      
      // Ensure the component starts with function App
      if (!cleanCode.includes('function App')) {
        // Try to find the main function and rename it to App
        const functionMatch = cleanCode.match(/function\s+(\w+)/);
        if (functionMatch) {
          cleanCode = cleanCode.replace(new RegExp(`function\\s+${functionMatch[1]}`, 'g'), 'function App');
        } else {
          // If no function found, wrap the code in an App function
          cleanCode = `function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My App</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Welcome to your generated app!</p>
        </div>
      </div>
    </div>
  );
}`;
        }
      }
      
      return cleanCode.trim();
    } catch (error) {
      console.error('Error generating React app:', error);
      return this.generateFallbackApp(idea, features);
    }
  }

  private static generateFallbackApp(idea: string, features: ParsedFeature[]): string {
    const hasAuth = features.some(f => f.name.toLowerCase().includes('auth'));
    const hasForm = features.some(f => f.name.toLowerCase().includes('form'));
    const hasData = features.some(f => f.name.toLowerCase().includes('data'));

    return `import React, { useState } from 'react';

function App() {
  const [items, setItems] = React.useState([
    { id: 1, title: 'Sample Item 1', description: 'This is a sample item for your app' },
    { id: 2, title: 'Sample Item 2', description: 'Another sample item to demonstrate functionality' }
  ]);
  const [newItem, setNewItem] = React.useState({ title: '', description: '' });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.title.trim()) {
      setIsLoading(true);
      setTimeout(() => {
        setItems(prev => [...prev, {
          id: Date.now(),
          title: newItem.title,
          description: newItem.description
        }]);
        setNewItem({ title: '', description: '' });
        setIsLoading(false);
      }, 500);
    }
  };

  const handleDeleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ${this.generateAppTitle(idea)}
            </h1>
            <p className="text-lg text-gray-600">
              ${idea}
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Items</h2>
                
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4a1 1 0 00-1-1H9a1 1 0 00-1 1v1" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
                    <p className="text-gray-600">Add your first item using the form on the right.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-600">{item.description}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Item</h2>
                
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newItem.title}
                      onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter item title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter item description"
                      rows={3}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading || !newItem.title.trim()}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </div>
                    ) : (
                      'Add Item'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;`;
  }

  private static generateAppTitle(idea: string): string {
    const lowerIdea = idea.toLowerCase();
    if (lowerIdea.includes('expense') || lowerIdea.includes('budget')) return 'Expense Tracker';
    if (lowerIdea.includes('todo') || lowerIdea.includes('task')) return 'Task Manager';
    if (lowerIdea.includes('portfolio')) return 'Portfolio Showcase';
    if (lowerIdea.includes('calculator')) return 'Calculator App';
    if (lowerIdea.includes('blog')) return 'Blog Platform';
    if (lowerIdea.includes('social')) return 'Social Platform';
    if (lowerIdea.includes('ecommerce') || lowerIdea.includes('store')) return 'Online Store';
    return 'My Application';
  }

  private static generateIndexJs(): string {
    return `import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;
  }

  private static generateIndexCss(): string {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

* {
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
}`;
  }

  private static generateIndexHtml(idea: string): string {
    const title = this.generateAppTitle(idea);
    
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="${idea}" />
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;
  }

  private static generatePackageJson(idea: string): string {
    const appName = this.generateAppTitle(idea).toLowerCase().replace(/\s+/g, '-');
    
    return `{
  "name": "${appName}",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
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
}`;
  }

  private static generateReadme(idea: string, features: ParsedFeature[]): string {
    const title = this.generateAppTitle(idea);
    
    return `# ${title}

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

## Available Scripts

- \`npm start\` - Runs the app in development mode
- \`npm test\` - Launches the test runner
- \`npm run build\` - Builds the app for production
- \`npm run eject\` - Ejects from Create React App (one-way operation)

## Technology Stack

- **Frontend**: React 18 with Hooks
- **Styling**: Tailwind CSS
- **Build Tool**: Create React App

## Project Structure

\`\`\`
src/
  ├── App.js          # Main application component
  ├── index.js        # Application entry point
  └── index.css       # Global styles
public/
  └── index.html      # HTML template
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
`;
  }

  private static generateEnvExample(): string {
    return `# Environment Variables
# Copy this file to .env and fill in your values

# API Configuration
REACT_APP_API_URL=http://localhost:3001

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DEBUG=true

# Third-party Services
# REACT_APP_GOOGLE_ANALYTICS_ID=your-ga-id
# REACT_APP_STRIPE_PUBLIC_KEY=your-stripe-key
`;
  }

  private static generateGitignore(): string {
    return `# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db
`;
  }

  // Additional methods for other code generation
  static async generateFrontendCode(idea: string, features: ParsedFeature[], techStack: TechStack): Promise<string> {
    return await this.generateReactApp(idea, features);
  }

  static async generateBackendCode(idea: string, features: ParsedFeature[], techStack: TechStack): Promise<string> {
    const prompt = `Create a Node.js Express backend for: "${idea}"

Features: ${features.map(f => f.name).join(', ')}

Include:
- Express server setup
- API routes
- Middleware
- Error handling
- CORS configuration

Return complete server code.`;

    try {
      const response = await this.callAI(prompt);
      return response;
    } catch (error) {
      return this.generateFallbackBackend();
    }
  }

  static async generateDatabaseSchema(idea: string, features: ParsedFeature[], techStack: TechStack): Promise<string> {
    const prompt = `Create a database schema for: "${idea}"

Features: ${features.map(f => f.name).join(', ')}

Return SQL CREATE TABLE statements with proper relationships and indexes.`;

    try {
      const response = await this.callAI(prompt);
      return response;
    } catch (error) {
      return this.generateFallbackDatabase();
    }
  }

  static async generateDeploymentConfig(idea: string, features: ParsedFeature[], techStack: TechStack): Promise<string> {
    return `# Deployment Configuration

## Vercel Deployment

1. Install Vercel CLI:
   \`\`\`bash
   npm i -g vercel
   \`\`\`

2. Deploy:
   \`\`\`bash
   vercel
   \`\`\`

## Docker Deployment

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## Environment Variables

Set these in your deployment platform:
- NODE_ENV=production
- Any API keys or configuration values
`;
  }

  private static generateFallbackBackend(): string {
    return `const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/items', (req, res) => {
  res.json([
    { id: 1, title: 'Sample Item 1', description: 'This is a sample item' },
    { id: 2, title: 'Sample Item 2', description: 'Another sample item' }
  ]);
});

app.post('/api/items', (req, res) => {
  const { title, description } = req.body;
  const newItem = {
    id: Date.now(),
    title,
    description,
    createdAt: new Date().toISOString()
  };
  res.status(201).json(newItem);
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;
  }

  private static generateFallbackDatabase(): string {
    return `-- Database Schema

CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_items_created_at ON items(created_at);

-- Sample data
INSERT INTO items (title, description) VALUES
('Sample Item 1', 'This is a sample item'),
('Sample Item 2', 'Another sample item');`;
  }
}
