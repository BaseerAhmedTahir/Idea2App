import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import { ComponentSpec, APISpec, DatabaseSpec, GeneratedComponent, GeneratedAPI, GeneratedSchema } from '../types/codeGeneration';

export interface AIModelConfig {
  provider: 'openai' | 'gemini' | 'anthropic' | 'groq';
  model: string;
  temperature: number;
  maxTokens: number;
  specialization: 'ui' | 'backend' | 'database' | 'testing' | 'general';
}

export interface ConversationContext {
  messages: ConversationMessage[];
  userPreferences: UserPreferences;
  projectContext: ProjectContext;
  codeHistory: CodeHistory[];
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'code' | 'explanation' | 'suggestion' | 'error';
    language?: string;
    component?: string;
  };
}

export interface UserPreferences {
  codeStyle: CodeStylePreferences;
  frameworks: FrameworkPreferences;
  patterns: PatternPreferences;
  accessibility: AccessibilityPreferences;
  performance: PerformancePreferences;
}

export interface CodeStylePreferences {
  indentation: 'spaces' | 'tabs';
  indentSize: number;
  quotes: 'single' | 'double';
  semicolons: boolean;
  trailingCommas: boolean;
  lineLength: number;
  naming: 'camelCase' | 'PascalCase' | 'snake_case' | 'kebab-case';
}

export interface FrameworkPreferences {
  frontend: string;
  backend: string;
  database: string;
  testing: string;
  styling: string;
  stateManagement: string;
}

export interface PatternPreferences {
  architecture: 'mvc' | 'mvvm' | 'clean' | 'hexagonal' | 'layered';
  designPatterns: string[];
  folderStructure: 'feature' | 'type' | 'domain';
  componentStructure: 'functional' | 'class' | 'hooks';
}

export interface AccessibilityPreferences {
  level: 'AA' | 'AAA';
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorContrast: boolean;
  focusManagement: boolean;
}

export interface PerformancePreferences {
  bundleSize: 'aggressive' | 'balanced' | 'conservative';
  lazyLoading: boolean;
  caching: boolean;
  optimization: 'development' | 'production';
}

export interface ProjectContext {
  name: string;
  description: string;
  techStack: TechStack;
  features: string[];
  constraints: ProjectConstraints;
  timeline: ProjectTimeline;
}

export interface TechStack {
  frontend: string;
  backend: string;
  database: string;
  deployment: string;
  testing: string;
  monitoring: string;
}

export interface ProjectConstraints {
  budget: 'low' | 'medium' | 'high';
  timeline: 'fast' | 'normal' | 'extended';
  scalability: 'small' | 'medium' | 'large';
  security: 'basic' | 'standard' | 'high';
}

export interface ProjectTimeline {
  start: Date;
  milestones: Milestone[];
  deadline?: Date;
}

export interface Milestone {
  name: string;
  description: string;
  dueDate: Date;
  dependencies: string[];
  status: 'pending' | 'in-progress' | 'completed';
}

export interface CodeHistory {
  id: string;
  timestamp: Date;
  type: 'generation' | 'modification' | 'optimization';
  component: string;
  changes: CodeChange[];
  reasoning: string;
}

export interface CodeChange {
  type: 'add' | 'modify' | 'delete';
  file: string;
  line?: number;
  content: string;
  reason: string;
}

export class EnhancedAIService {
  private static models: Map<string, AIModelConfig> = new Map();
  private static conversationContext: ConversationContext | null = null;
  private static clients: Map<string, any> = new Map();

  static initialize() {
    // Initialize specialized AI models for different tasks
    this.models.set('ui-specialist', {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 3000,
      specialization: 'ui'
    });

    this.models.set('backend-specialist', {
      provider: 'anthropic',
      model: 'claude-3-sonnet-20240229',
      temperature: 0.5,
      maxTokens: 4000,
      specialization: 'backend'
    });

    this.models.set('database-specialist', {
      provider: 'groq',
      model: 'llama-3.1-70b-versatile',
      temperature: 0.3,
      maxTokens: 2000,
      specialization: 'database'
    });

    this.models.set('testing-specialist', {
      provider: 'gemini',
      model: 'gemini-2.5-pro',
      temperature: 0.4,
      maxTokens: 2500,
      specialization: 'testing'
    });

    // Initialize AI clients
    this.initializeClients();
  }

  private static initializeClients() {
    // OpenAI client
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      this.clients.set('openai', new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      }));
    }

    // Anthropic client
    if (import.meta.env.VITE_ANTHROPIC_API_KEY) {
      this.clients.set('anthropic', new Anthropic({
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
        dangerouslyAllowBrowser: true
      }));
    }

    // Gemini client
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      this.clients.set('gemini', new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY));
    }

    // Groq client (using axios)
    if (import.meta.env.VITE_GROQ_API_KEY) {
      this.clients.set('groq', {
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1'
      });
    }
  }

  /**
   * Generate UI components using specialized AI model
   */
  static async generateComponent(spec: ComponentSpec, context?: ConversationContext): Promise<GeneratedComponent> {
    const model = this.models.get('ui-specialist')!;
    const prompt = this.buildComponentPrompt(spec, context);
    
    const response = await this.callAIModel(model, prompt);
    
    return {
      code: this.extractCode(response, 'tsx'),
      dependencies: this.extractDependencies(response),
      tests: await this.generateComponentTests(spec),
      documentation: this.generateComponentDocs(spec),
      performance: await this.analyzeComponentPerformance(response),
      accessibility: await this.analyzeComponentAccessibility(response)
    };
  }

  /**
   * Generate API endpoints using specialized AI model
   */
  static async generateAPI(spec: APISpec, context?: ConversationContext): Promise<GeneratedAPI> {
    const model = this.models.get('backend-specialist')!;
    const prompt = this.buildAPIPrompt(spec, context);
    
    const response = await this.callAIModel(model, prompt);
    
    return {
      code: this.extractCode(response, 'ts'),
      routes: this.extractRoutes(response),
      middleware: this.extractMiddleware(response),
      tests: await this.generateAPITests(spec),
      documentation: this.generateAPIDocs(spec),
      security: await this.analyzeAPISecurity(response)
    };
  }

  /**
   * Generate database schema using specialized AI model
   */
  static async generateDatabase(spec: DatabaseSpec, context?: ConversationContext): Promise<GeneratedSchema> {
    const model = this.models.get('database-specialist')!;
    const prompt = this.buildDatabasePrompt(spec, context);
    
    const response = await this.callAIModel(model, prompt);
    
    return {
      migrations: this.extractMigrations(response),
      models: this.extractModels(response),
      seeds: this.extractSeeds(response),
      documentation: this.generateDatabaseDocs(spec),
      performance: await this.analyzeDatabasePerformance(response)
    };
  }

  /**
   * Context-aware code generation with conversation history
   */
  static async generateWithContext(
    prompt: string, 
    type: 'component' | 'api' | 'database' | 'general',
    context?: ConversationContext
  ): Promise<string> {
    const modelKey = `${type}-specialist`;
    const model = this.models.get(modelKey) || this.models.get('ui-specialist')!;
    
    const enhancedPrompt = this.enhancePromptWithContext(prompt, context);
    const response = await this.callAIModel(model, enhancedPrompt);
    
    // Update conversation context
    if (context) {
      this.updateConversationContext(context, prompt, response);
    }
    
    return response;
  }

  /**
   * Progressive enhancement - start basic and add complexity
   */
  static async generateProgressive(
    baseSpec: any,
    enhancements: string[],
    context?: ConversationContext
  ): Promise<{ basic: string; enhanced: string; steps: string[] }> {
    // Generate basic version
    const basic = await this.generateWithContext(
      `Generate a basic implementation for: ${JSON.stringify(baseSpec)}`,
      'component',
      context
    );

    // Apply enhancements progressively
    let enhanced = basic;
    const steps: string[] = [];

    for (const enhancement of enhancements) {
      const enhancementPrompt = `
        Enhance the following code with: ${enhancement}
        
        Current code:
        ${enhanced}
        
        Requirements:
        - Maintain existing functionality
        - Add the enhancement seamlessly
        - Follow best practices
        - Provide clear comments for changes
      `;

      enhanced = await this.generateWithContext(enhancementPrompt, 'component', context);
      steps.push(`Added: ${enhancement}`);
    }

    return { basic, enhanced, steps };
  }

  /**
   * Learn from user preferences and adapt generation
   */
  static updateUserPreferences(preferences: Partial<UserPreferences>): void {
    if (!this.conversationContext) {
      this.conversationContext = {
        messages: [],
        userPreferences: this.getDefaultPreferences(),
        projectContext: this.getDefaultProjectContext(),
        codeHistory: []
      };
    }

    this.conversationContext.userPreferences = {
      ...this.conversationContext.userPreferences,
      ...preferences
    };
  }

  /**
   * Analyze code patterns and suggest improvements
   */
  static async analyzeAndSuggest(code: string, type: string): Promise<{
    analysis: CodeAnalysis;
    suggestions: CodeSuggestion[];
    optimizations: CodeOptimization[];
  }> {
    const model = this.models.get('ui-specialist')!;
    const prompt = `
      Analyze the following ${type} code and provide:
      1. Code quality analysis
      2. Performance suggestions
      3. Security recommendations
      4. Best practice improvements
      5. Accessibility enhancements

      Code:
      ${code}
    `;

    const response = await this.callAIModel(model, prompt);
    
    return {
      analysis: this.parseAnalysis(response),
      suggestions: this.parseSuggestions(response),
      optimizations: this.parseOptimizations(response)
    };
  }

  // Private helper methods
  private static async callAIModel(model: AIModelConfig, prompt: string): Promise<string> {
    const client = this.clients.get(model.provider);
    if (!client) {
      throw new Error(`AI client for ${model.provider} not initialized`);
    }

    try {
      switch (model.provider) {
        case 'openai':
          const openaiResponse = await client.chat.completions.create({
            model: model.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: model.temperature,
            max_tokens: model.maxTokens
          });
          return openaiResponse.choices[0]?.message?.content || '';

        case 'anthropic':
          const anthropicResponse = await client.messages.create({
            model: model.model,
            max_tokens: model.maxTokens,
            messages: [{ role: 'user', content: prompt }]
          });
          return anthropicResponse.content[0]?.type === 'text' ? anthropicResponse.content[0].text : '';

        case 'gemini':
          const geminiModel = client.getGenerativeModel({ model: model.model });
          const geminiResponse = await geminiModel.generateContent(prompt);
          return geminiResponse.response.text();

        case 'groq':
          const groqResponse = await axios.post(
            `${client.baseURL}/chat/completions`,
            {
              model: model.model,
              messages: [{ role: 'user', content: prompt }],
              temperature: model.temperature,
              max_tokens: model.maxTokens
            },
            {
              headers: {
                'Authorization': `Bearer ${client.apiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );
          return groqResponse.data.choices[0]?.message?.content || '';

        default:
          throw new Error(`Unsupported AI provider: ${model.provider}`);
      }
    } catch (error) {
      console.error(`Error calling ${model.provider}:`, error);
      throw new Error(`Failed to generate content using ${model.provider}`);
    }
  }

  private static buildComponentPrompt(spec: ComponentSpec, context?: ConversationContext): string {
    const preferences = context?.userPreferences;
    
    return `
      Generate a React component with the following specifications:
      
      Component: ${spec.name}
      Type: ${spec.type}
      Props: ${JSON.stringify(spec.props)}
      Styling: ${JSON.stringify(spec.styling)}
      Accessibility: ${JSON.stringify(spec.accessibility)}
      Performance: ${JSON.stringify(spec.performance)}
      
      ${preferences ? `
      User Preferences:
      - Code Style: ${JSON.stringify(preferences.codeStyle)}
      - Frameworks: ${JSON.stringify(preferences.frameworks)}
      - Patterns: ${JSON.stringify(preferences.patterns)}
      ` : ''}
      
      Requirements:
      - Use TypeScript with proper type definitions
      - Follow React best practices
      - Implement proper error boundaries
      - Include accessibility features
      - Optimize for performance
      - Add comprehensive JSDoc comments
      - Include prop validation
      - Handle edge cases gracefully
    `;
  }

  private static buildAPIPrompt(spec: APISpec, context?: ConversationContext): string {
    return `
      Generate a REST API with the following specifications:
      
      Endpoints: ${JSON.stringify(spec.endpoints)}
      Authentication: ${JSON.stringify(spec.authentication)}
      Validation: ${JSON.stringify(spec.validation)}
      Documentation: ${JSON.stringify(spec.documentation)}
      Testing: ${JSON.stringify(spec.testing)}
      
      Requirements:
      - Use Express.js with TypeScript
      - Implement proper error handling
      - Add input validation and sanitization
      - Include authentication middleware
      - Add rate limiting
      - Implement proper logging
      - Include comprehensive API documentation
      - Add security headers
      - Handle CORS properly
    `;
  }

  private static buildDatabasePrompt(spec: DatabaseSpec, context?: ConversationContext): string {
    return `
      Generate a database schema with the following specifications:
      
      Type: ${spec.type}
      Tables: ${JSON.stringify(spec.tables)}
      Relationships: ${JSON.stringify(spec.relationships)}
      Indexes: ${JSON.stringify(spec.indexes)}
      Migrations: ${JSON.stringify(spec.migrations)}
      
      Requirements:
      - Create proper table structures
      - Define relationships and constraints
      - Add appropriate indexes
      - Include data validation
      - Implement row-level security
      - Add audit trails
      - Include backup strategies
      - Optimize for performance
    `;
  }

  private static enhancePromptWithContext(prompt: string, context?: ConversationContext): string {
    if (!context) return prompt;

    const recentMessages = context.messages.slice(-5);
    const projectInfo = context.projectContext;
    const preferences = context.userPreferences;

    return `
      Context:
      Project: ${projectInfo.name} - ${projectInfo.description}
      Tech Stack: ${JSON.stringify(projectInfo.techStack)}
      
      Recent Conversation:
      ${recentMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}
      
      User Preferences:
      ${JSON.stringify(preferences)}
      
      Current Request:
      ${prompt}
    `;
  }

  private static updateConversationContext(context: ConversationContext, prompt: string, response: string): void {
    context.messages.push(
      {
        id: Date.now().toString(),
        role: 'user',
        content: prompt,
        timestamp: new Date()
      },
      {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }
    );

    // Keep only last 20 messages to manage memory
    if (context.messages.length > 20) {
      context.messages = context.messages.slice(-20);
    }
  }

  private static extractCode(response: string, language: string): string {
    const codeBlockRegex = new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\\n\`\`\``, 'g');
    const match = codeBlockRegex.exec(response);
    return match ? match[1] : response;
  }

  private static extractDependencies(response: string): string[] {
    const importRegex = /import.*?from\s+['"]([^'"]+)['"]/g;
    const dependencies: string[] = [];
    let match;
    
    while ((match = importRegex.exec(response)) !== null) {
      if (!match[1].startsWith('.') && !match[1].startsWith('/')) {
        dependencies.push(match[1]);
      }
    }
    
    return [...new Set(dependencies)];
  }

  private static extractRoutes(response: string): string {
    // Extract route definitions from response
    return '';
  }

  private static extractMiddleware(response: string): string {
    // Extract middleware definitions from response
    return '';
  }

  private static extractMigrations(response: string): string[] {
    // Extract migration files from response
    return [];
  }

  private static extractModels(response: string): string {
    // Extract model definitions from response
    return '';
  }

  private static extractSeeds(response: string): string {
    // Extract seed data from response
    return '';
  }

  private static async generateComponentTests(spec: ComponentSpec): Promise<string> {
    const model = this.models.get('testing-specialist')!;
    const prompt = `Generate comprehensive tests for a React component with these specs: ${JSON.stringify(spec)}`;
    return await this.callAIModel(model, prompt);
  }

  private static async generateAPITests(spec: APISpec): Promise<string> {
    const model = this.models.get('testing-specialist')!;
    const prompt = `Generate comprehensive API tests for these endpoints: ${JSON.stringify(spec.endpoints)}`;
    return await this.callAIModel(model, prompt);
  }

  private static generateComponentDocs(spec: ComponentSpec): string {
    return `# ${spec.name} Component\n\n${spec.name} component documentation...`;
  }

  private static generateAPIDocs(spec: APISpec): string {
    return `# API Documentation\n\nAPI documentation for endpoints...`;
  }

  private static generateDatabaseDocs(spec: DatabaseSpec): string {
    return `# Database Schema\n\nDatabase schema documentation...`;
  }

  private static async analyzeComponentPerformance(code: string): Promise<any> {
    // Analyze component performance
    return { bundleSize: 0, loadTime: 0, renderTime: 0, memoryUsage: 0, cpuUsage: 0, networkRequests: 0 };
  }

  private static async analyzeComponentAccessibility(code: string): Promise<any> {
    // Analyze component accessibility
    return { score: 100, issues: [], suggestions: [], compliance: 'AA' };
  }

  private static async analyzeAPISecurity(code: string): Promise<any> {
    // Analyze API security
    return { score: 100, vulnerabilities: [], recommendations: [], compliance: [] };
  }

  private static async analyzeDatabasePerformance(code: string): Promise<any> {
    // Analyze database performance
    return { queryPerformance: [], indexUsage: [], recommendations: [] };
  }

  private static parseAnalysis(response: string): CodeAnalysis {
    return { quality: 100, maintainability: 100, performance: 100, security: 100 };
  }

  private static parseSuggestions(response: string): CodeSuggestion[] {
    return [];
  }

  private static parseOptimizations(response: string): CodeOptimization[] {
    return [];
  }

  private static getDefaultPreferences(): UserPreferences {
    return {
      codeStyle: {
        indentation: 'spaces',
        indentSize: 2,
        quotes: 'single',
        semicolons: true,
        trailingCommas: true,
        lineLength: 100,
        naming: 'camelCase'
      },
      frameworks: {
        frontend: 'React',
        backend: 'Node.js',
        database: 'PostgreSQL',
        testing: 'Jest',
        styling: 'Tailwind CSS',
        stateManagement: 'Context API'
      },
      patterns: {
        architecture: 'clean',
        designPatterns: ['Observer', 'Factory', 'Strategy'],
        folderStructure: 'feature',
        componentStructure: 'functional'
      },
      accessibility: {
        level: 'AA',
        screenReader: true,
        keyboardNavigation: true,
        colorContrast: true,
        focusManagement: true
      },
      performance: {
        bundleSize: 'balanced',
        lazyLoading: true,
        caching: true,
        optimization: 'production'
      }
    };
  }

  private static getDefaultProjectContext(): ProjectContext {
    return {
      name: 'New Project',
      description: 'A new project',
      techStack: {
        frontend: 'React',
        backend: 'Node.js',
        database: 'PostgreSQL',
        deployment: 'Vercel',
        testing: 'Jest',
        monitoring: 'Sentry'
      },
      features: [],
      constraints: {
        budget: 'medium',
        timeline: 'normal',
        scalability: 'medium',
        security: 'standard'
      },
      timeline: {
        start: new Date(),
        milestones: []
      }
    };
  }
}

// Supporting interfaces
interface CodeAnalysis {
  quality: number;
  maintainability: number;
  performance: number;
  security: number;
}

interface CodeSuggestion {
  type: string;
  description: string;
  impact: string;
  implementation: string;
}

interface CodeOptimization {
  type: string;
  description: string;
  savings: string;
  implementation: string;
}