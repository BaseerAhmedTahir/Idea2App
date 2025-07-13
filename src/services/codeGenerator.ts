import { ComponentSpec, APISpec, DatabaseSpec, GeneratedComponent, GeneratedAPI, GeneratedSchema, ValidationResult, OptimizedCode, Suggestion } from '../types/codeGeneration';
import { CodeAnalysisService } from './codeAnalysis';
import { EnhancedAIService } from './enhancedAI';

export interface CodeGenerator {
  generateComponent(spec: ComponentSpec): Promise<GeneratedComponent>;
  generateAPI(spec: APISpec): Promise<GeneratedAPI>;
  generateDatabase(spec: DatabaseSpec): Promise<GeneratedSchema>;
}

export interface CodeValidator {
  validateSyntax(code: string): ValidationResult;
  optimizeCode(code: string): OptimizedCode;
  suggestImprovements(code: string): Suggestion[];
}

export class ModularCodeGenerator implements CodeGenerator {
  private static instance: ModularCodeGenerator;
  private aiService: typeof EnhancedAIService;
  private analysisService: typeof CodeAnalysisService;

  private constructor() {
    this.aiService = EnhancedAIService;
    this.analysisService = CodeAnalysisService;
  }

  static getInstance(): ModularCodeGenerator {
    if (!ModularCodeGenerator.instance) {
      ModularCodeGenerator.instance = new ModularCodeGenerator();
    }
    return ModularCodeGenerator.instance;
  }

  /**
   * Generate React component with advanced features
   */
  async generateComponent(spec: ComponentSpec): Promise<GeneratedComponent> {
    try {
      // Generate base component using AI
      const baseComponent = await this.aiService.generateComponent(spec);
      
      // Enhance with performance optimizations
      const optimizedCode = await this.optimizeComponentCode(baseComponent.code, spec);
      
      // Add accessibility features
      const accessibleCode = await this.enhanceAccessibility(optimizedCode, spec.accessibility);
      
      // Generate comprehensive tests
      const tests = await this.generateComponentTests(spec, accessibleCode);
      
      // Generate documentation
      const documentation = await this.generateComponentDocumentation(spec, accessibleCode);
      
      // Analyze performance
      const performance = await this.analyzeComponentPerformance(accessibleCode);
      
      // Audit accessibility
      const accessibility = await this.auditComponentAccessibility(accessibleCode);
      
      return {
        code: accessibleCode,
        dependencies: this.extractDependencies(accessibleCode),
        tests,
        documentation,
        performance,
        accessibility
      };
    } catch (error) {
      console.error('Component generation error:', error);
      throw new Error(`Failed to generate component: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate API with security and validation
   */
  async generateAPI(spec: APISpec): Promise<GeneratedAPI> {
    try {
      // Generate base API using AI
      const baseAPI = await this.aiService.generateAPI(spec);
      
      // Add security middleware
      const secureCode = await this.addSecurityMiddleware(baseAPI.code, spec.authentication);
      
      // Add validation layer
      const validatedCode = await this.addValidationLayer(secureCode, spec.validation);
      
      // Generate routes
      const routes = await this.generateAPIRoutes(spec.endpoints);
      
      // Generate middleware
      const middleware = await this.generateAPIMiddleware(spec.endpoints);
      
      // Generate tests
      const tests = await this.generateAPITests(spec);
      
      // Generate documentation
      const documentation = await this.generateAPIDocumentation(spec);
      
      // Perform security analysis
      const security = await this.analyzeAPISecurity(validatedCode);
      
      return {
        code: validatedCode,
        routes,
        middleware,
        tests,
        documentation,
        security
      };
    } catch (error) {
      console.error('API generation error:', error);
      throw new Error(`Failed to generate API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate database schema with optimization
   */
  async generateDatabase(spec: DatabaseSpec): Promise<GeneratedSchema> {
    try {
      // Generate base schema using AI
      const baseSchema = await this.aiService.generateDatabase(spec);
      
      // Optimize schema design
      const optimizedMigrations = await this.optimizeDatabaseSchema(baseSchema.migrations, spec);
      
      // Generate models with relationships
      const models = await this.generateDatabaseModels(spec);
      
      // Generate seed data
      const seeds = await this.generateSeedData(spec);
      
      // Generate documentation
      const documentation = await this.generateDatabaseDocumentation(spec);
      
      // Analyze performance
      const performance = await this.analyzeDatabasePerformance(optimizedMigrations);
      
      return {
        migrations: optimizedMigrations,
        models,
        seeds,
        documentation,
        performance
      };
    } catch (error) {
      console.error('Database generation error:', error);
      throw new Error(`Failed to generate database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods for component generation
  private async optimizeComponentCode(code: string, spec: ComponentSpec): Promise<string> {
    let optimizedCode = code;
    
    // Add React.memo for performance if specified
    if (spec.performance.memoization) {
      optimizedCode = this.addMemoization(optimizedCode);
    }
    
    // Add lazy loading if specified
    if (spec.performance.lazyLoading) {
      optimizedCode = this.addLazyLoading(optimizedCode);
    }
    
    // Optimize bundle splitting
    if (spec.performance.bundleSplitting) {
      optimizedCode = this.addBundleSplitting(optimizedCode);
    }
    
    return optimizedCode;
  }

  private async enhanceAccessibility(code: string, accessibilitySpec: any): Promise<string> {
    let accessibleCode = code;
    
    // Add ARIA labels
    if (accessibilitySpec.ariaLabels) {
      accessibleCode = this.addAriaLabels(accessibleCode, accessibilitySpec.ariaLabels);
    }
    
    // Add keyboard navigation
    if (accessibilitySpec.keyboardNavigation) {
      accessibleCode = this.addKeyboardNavigation(accessibleCode);
    }
    
    // Add focus management
    if (accessibilitySpec.focusManagement) {
      accessibleCode = this.addFocusManagement(accessibleCode);
    }
    
    return accessibleCode;
  }

  private async generateComponentTests(spec: ComponentSpec, code: string): Promise<string> {
    const testTemplate = `
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ${spec.name} } from './${spec.name}';

describe('${spec.name}', () => {
  const defaultProps = {
    ${spec.props.map(prop => `${prop.name}: ${this.getDefaultValue(prop.type)}`).join(',\n    ')}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<${spec.name} {...defaultProps} />);
  });

  it('displays correct content', () => {
    render(<${spec.name} {...defaultProps} />);
    // Add specific content assertions based on component
  });

  ${spec.props.filter(prop => prop.required).map(prop => `
  it('handles ${prop.name} prop correctly', () => {
    const testValue = ${this.getTestValue(prop.type)};
    render(<${spec.name} {...defaultProps} ${prop.name}={testValue} />);
    // Add assertions for prop handling
  });`).join('\n')}

  ${spec.accessibility.keyboardNavigation ? `
  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<${spec.name} {...defaultProps} />);
    
    // Test tab navigation
    await user.tab();
    // Add keyboard navigation assertions
  });` : ''}

  ${spec.accessibility.screenReaderSupport ? `
  it('provides proper screen reader support', () => {
    render(<${spec.name} {...defaultProps} />);
    
    // Check for ARIA labels and roles
    expect(screen.getByRole('button')).toBeInTheDocument();
    // Add more accessibility assertions
  });` : ''}

  it('handles errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Test error scenarios
    render(<${spec.name} {...defaultProps} />);
    
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  ${spec.performance.memoization ? `
  it('memoizes correctly to prevent unnecessary re-renders', () => {
    const { rerender } = render(<${spec.name} {...defaultProps} />);
    
    // Test memoization behavior
    rerender(<${spec.name} {...defaultProps} />);
    // Add memoization assertions
  });` : ''}
});
`;
    
    return testTemplate;
  }

  private async generateComponentDocumentation(spec: ComponentSpec, code: string): Promise<string> {
    return `
# ${spec.name} Component

## Overview
${spec.name} is a ${spec.type} React component that provides ${spec.props.map(p => p.description).join(', ')}.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
${spec.props.map(prop => 
  `| ${prop.name} | \`${prop.type}\` | ${prop.required ? 'Yes' : 'No'} | \`${prop.defaultValue || 'undefined'}\` | ${prop.description || 'No description'} |`
).join('\n')}

## Usage

\`\`\`tsx
import { ${spec.name} } from './${spec.name}';

function App() {
  return (
    <${spec.name}
      ${spec.props.filter(p => p.required).map(prop => `${prop.name}={${this.getExampleValue(prop.type)}}`).join('\n      ')}
    />
  );
}
\`\`\`

## Accessibility

- **ARIA Support**: ${spec.accessibility.ariaLabels ? 'Full ARIA labels and roles implemented' : 'Basic ARIA support'}
- **Keyboard Navigation**: ${spec.accessibility.keyboardNavigation ? 'Full keyboard navigation support' : 'Limited keyboard support'}
- **Screen Reader**: ${spec.accessibility.screenReaderSupport ? 'Optimized for screen readers' : 'Basic screen reader support'}
- **Color Contrast**: Meets WCAG ${spec.accessibility.colorContrast} standards

## Performance

- **Bundle Size**: Optimized for minimal bundle impact
- **Lazy Loading**: ${spec.performance.lazyLoading ? 'Supports lazy loading' : 'Not lazy loaded'}
- **Memoization**: ${spec.performance.memoization ? 'Uses React.memo for optimization' : 'No memoization'}
- **Bundle Splitting**: ${spec.performance.bundleSplitting ? 'Supports code splitting' : 'No code splitting'}

## Styling

- **Framework**: ${spec.styling.framework}
- **Responsive**: ${spec.styling.responsive ? 'Fully responsive design' : 'Fixed layout'}
- **Theme Support**: ${spec.styling.theme ? 'Supports theming' : 'No theme support'}
- **Animations**: ${spec.styling.animations?.length ? `${spec.styling.animations.length} animations included` : 'No animations'}

## Examples

### Basic Usage
\`\`\`tsx
<${spec.name} ${spec.props.filter(p => p.required).map(prop => `${prop.name}="${this.getExampleValue(prop.type)}"`).join(' ')} />
\`\`\`

### Advanced Usage
\`\`\`tsx
<${spec.name}
  ${spec.props.map(prop => `${prop.name}={${this.getExampleValue(prop.type)}}`).join('\n  ')}
/>
\`\`\`
`;
  }

  private async analyzeComponentPerformance(code: string): Promise<any> {
    // Analyze bundle size impact
    const bundleSize = this.estimateBundleSize(code);
    
    // Analyze render complexity
    const renderComplexity = this.analyzeRenderComplexity(code);
    
    // Check for performance anti-patterns
    const antiPatterns = this.detectPerformanceAntiPatterns(code);
    
    return {
      bundleSize,
      loadTime: bundleSize / 1000, // Rough estimate
      renderTime: renderComplexity * 10,
      memoryUsage: bundleSize / 10000,
      cpuUsage: renderComplexity,
      networkRequests: this.countNetworkRequests(code)
    };
  }

  private async auditComponentAccessibility(code: string): Promise<any> {
    const issues: any[] = [];
    
    // Check for missing alt text
    if (code.includes('<img') && !code.includes('alt=')) {
      issues.push({
        type: 'missing-alt-text',
        severity: 'error',
        element: 'img',
        description: 'Images missing alt text',
        fix: 'Add descriptive alt attributes to all images'
      });
    }
    
    // Check for missing ARIA labels
    if (code.includes('button') && !code.includes('aria-label')) {
      issues.push({
        type: 'missing-aria-label',
        severity: 'warning',
        element: 'button',
        description: 'Interactive elements missing ARIA labels',
        fix: 'Add aria-label or aria-labelledby attributes'
      });
    }
    
    // Check for proper heading hierarchy
    const headingPattern = /<h[1-6]/g;
    const headings = code.match(headingPattern);
    if (headings && headings.length > 1) {
      // Check if headings follow proper hierarchy
      // This is a simplified check
    }
    
    const score = Math.max(0, 100 - (issues.length * 15));
    
    return {
      score,
      issues,
      suggestions: issues.map(issue => issue.fix),
      compliance: score >= 90 ? 'AA' : score >= 70 ? 'partial' : 'none'
    };
  }

  // Private helper methods for API generation
  private async addSecurityMiddleware(code: string, authSpec: any): Promise<string> {
    const securityMiddleware = `
// Security middleware
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter);

${code}
`;
    
    return securityMiddleware;
  }

  private async addValidationLayer(code: string, validationSpec: any): Promise<string> {
    const validationMiddleware = `
// Validation middleware
import { body, param, query, validationResult } from 'express-validator';

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

${code}
`;
    
    return validationMiddleware;
  }

  private async generateAPIRoutes(endpoints: any[]): Promise<string> {
    return endpoints.map(endpoint => `
// ${endpoint.method} ${endpoint.path}
router.${endpoint.method.toLowerCase()}('${endpoint.path}', [
  ${endpoint.middleware?.map((m: any) => `${m.name}Middleware`).join(',\n  ') || ''}
], async (req, res) => {
  try {
    // Implementation for ${endpoint.path}
    ${this.generateEndpointImplementation(endpoint)}
  } catch (error) {
    console.error('Error in ${endpoint.path}:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
`).join('\n');
  }

  private async generateAPIMiddleware(endpoints: any[]): Promise<string> {
    const middlewareSet = new Set();
    endpoints.forEach(endpoint => {
      endpoint.middleware?.forEach((m: any) => middlewareSet.add(m.name));
    });
    
    return Array.from(middlewareSet).map(name => `
// ${name} middleware
const ${name}Middleware = (req, res, next) => {
  // Implementation for ${name}
  next();
};
`).join('\n');
  }

  private async generateAPITests(spec: APISpec): Promise<string> {
    return `
import request from 'supertest';
import app from '../app';

describe('API Endpoints', () => {
  ${spec.endpoints.map(endpoint => `
  describe('${endpoint.method} ${endpoint.path}', () => {
    it('should respond successfully', async () => {
      const response = await request(app)
        .${endpoint.method.toLowerCase()}('${endpoint.path}')
        ${endpoint.requestBody ? `.send(${JSON.stringify(endpoint.requestBody)})` : ''}
        .expect(200);
      
      // Add specific assertions based on endpoint
    });
    
    it('should handle validation errors', async () => {
      const response = await request(app)
        .${endpoint.method.toLowerCase()}('${endpoint.path}')
        .send({}) // Invalid data
        .expect(400);
      
      expect(response.body.error).toBe('Validation failed');
    });
    
    ${endpoint.authentication ? `
    it('should require authentication', async () => {
      const response = await request(app)
        .${endpoint.method.toLowerCase()}('${endpoint.path}')
        .expect(401);
    });` : ''}
  });`).join('\n')}
});
`;
  }

  private async generateAPIDocumentation(spec: APISpec): Promise<string> {
    return `
# API Documentation

## Authentication
${spec.authentication.type === 'jwt' ? 'JWT Bearer token authentication' : `${spec.authentication.type} authentication`}

## Endpoints

${spec.endpoints.map(endpoint => `
### ${endpoint.method} ${endpoint.path}

${endpoint.description || 'No description available'}

**Parameters:**
${endpoint.parameters?.map(param => `- \`${param.name}\` (${param.type}): ${param.description || 'No description'}`).join('\n') || 'None'}

**Request Body:**
${endpoint.requestBody ? `\`\`\`json\n${JSON.stringify(endpoint.requestBody.schema, null, 2)}\n\`\`\`` : 'None'}

**Responses:**
${endpoint.responses?.map(response => `- ${response.statusCode}: ${response.description}`).join('\n') || 'No responses documented'}

**Example:**
\`\`\`bash
curl -X ${endpoint.method} \\
  ${process.env.API_BASE_URL || 'http://localhost:3001'}${endpoint.path} \\
  -H "Content-Type: application/json" \\
  ${endpoint.requestBody ? `-d '${JSON.stringify(endpoint.requestBody.schema, null, 2)}'` : ''}
\`\`\`
`).join('\n')}
`;
  }

  private async analyzeAPISecurity(code: string): Promise<any> {
    const vulnerabilities: any[] = [];
    
    // Check for SQL injection vulnerabilities
    if (code.includes('SELECT') && code.includes('${') && !code.includes('prepared')) {
      vulnerabilities.push({
        type: 'sql-injection',
        severity: 'high',
        description: 'Potential SQL injection vulnerability',
        fix: 'Use parameterized queries or prepared statements'
      });
    }
    
    // Check for XSS vulnerabilities
    if (code.includes('innerHTML') || code.includes('dangerouslySetInnerHTML')) {
      vulnerabilities.push({
        type: 'xss',
        severity: 'medium',
        description: 'Potential XSS vulnerability',
        fix: 'Sanitize user input and use safe rendering methods'
      });
    }
    
    // Check for authentication bypass
    if (!code.includes('authenticate') && !code.includes('auth')) {
      vulnerabilities.push({
        type: 'missing-auth',
        severity: 'high',
        description: 'Missing authentication middleware',
        fix: 'Add authentication middleware to protected routes'
      });
    }
    
    const score = Math.max(0, 100 - (vulnerabilities.length * 20));
    
    return {
      score,
      vulnerabilities,
      recommendations: vulnerabilities.map(v => v.fix),
      compliance: ['OWASP Top 10', 'Security Best Practices']
    };
  }

  // Private helper methods for database generation
  private async optimizeDatabaseSchema(migrations: string[], spec: DatabaseSpec): Promise<string[]> {
    return migrations.map(migration => {
      // Add indexes for foreign keys
      let optimizedMigration = migration;
      
      // Add performance indexes
      spec.indexes.forEach(index => {
        if (!optimizedMigration.includes(`CREATE INDEX ${index.name}`)) {
          optimizedMigration += `\nCREATE INDEX ${index.name} ON ${index.table} (${index.columns.join(', ')});`;
        }
      });
      
      return optimizedMigration;
    });
  }

  private async generateDatabaseModels(spec: DatabaseSpec): Promise<string> {
    return spec.tables.map(table => `
// ${table.name} model
export interface ${this.toPascalCase(table.name)} {
  ${table.columns.map(col => `${col.name}: ${this.mapSqlTypeToTs(col.type)};`).join('\n  ')}
}

export class ${this.toPascalCase(table.name)}Model {
  static async findById(id: string): Promise<${this.toPascalCase(table.name)} | null> {
    // Implementation
    return null;
  }
  
  static async create(data: Partial<${this.toPascalCase(table.name)}>): Promise<${this.toPascalCase(table.name)}> {
    // Implementation
    return {} as ${this.toPascalCase(table.name)};
  }
  
  static async update(id: string, data: Partial<${this.toPascalCase(table.name)}>): Promise<${this.toPascalCase(table.name)} | null> {
    // Implementation
    return null;
  }
  
  static async delete(id: string): Promise<boolean> {
    // Implementation
    return false;
  }
}
`).join('\n');
  }

  private async generateSeedData(spec: DatabaseSpec): Promise<string> {
    return `
// Database seed data
${spec.tables.map(table => `
// ${table.name} seed data
export const ${table.name}Seeds = [
  ${Array.from({ length: 5 }, (_, i) => `{
    ${table.columns.filter(col => !col.primaryKey).map(col => 
      `${col.name}: ${this.generateSeedValue(col.type, i)}`
    ).join(',\n    ')}
  }`).join(',\n  ')}
];
`).join('\n')}

// Seed function
export async function seedDatabase() {
  try {
    ${spec.tables.map(table => `
    console.log('Seeding ${table.name}...');
    for (const seed of ${table.name}Seeds) {
      await ${this.toPascalCase(table.name)}Model.create(seed);
    }`).join('\n')}
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
`;
  }

  private async generateDatabaseDocumentation(spec: DatabaseSpec): Promise<string> {
    return `
# Database Schema Documentation

## Overview
This database schema supports a ${spec.type} database with ${spec.tables.length} tables and ${spec.relationships.length} relationships.

## Tables

${spec.tables.map(table => `
### ${table.name}

${table.columns.map(col => `
- **${col.name}** (${col.type})${col.nullable ? '' : ' *required*'}
  ${col.defaultValue ? `- Default: \`${col.defaultValue}\`` : ''}
  ${col.foreignKey ? `- Foreign key to ${col.foreignKey.table}.${col.foreignKey.column}` : ''}
`).join('')}

**Constraints:**
${table.constraints?.map(constraint => `- ${constraint.name}: ${constraint.definition}`).join('\n') || 'None'}

**Indexes:**
${spec.indexes.filter(idx => idx.table === table.name).map(idx => `- ${idx.name}: ${idx.columns.join(', ')}`).join('\n') || 'None'}
`).join('\n')}

## Relationships

${spec.relationships.map(rel => `
- **${rel.type}**: ${rel.from.table}.${rel.from.column} → ${rel.to.table}.${rel.to.column}
`).join('')}

## Migrations

${spec.migrations.map(migration => `
### ${migration.version} - ${migration.description}
Dependencies: ${migration.dependencies.join(', ') || 'None'}
`).join('')}
`;
  }

  private async analyzeDatabasePerformance(migrations: string[]): Promise<any> {
    const queryPerformance: any[] = [];
    const indexUsage: any[] = [];
    const recommendations: string[] = [];
    
    // Analyze migrations for performance issues
    migrations.forEach(migration => {
      // Check for missing indexes on foreign keys
      if (migration.includes('FOREIGN KEY') && !migration.includes('CREATE INDEX')) {
        recommendations.push('Add indexes on foreign key columns for better join performance');
      }
      
      // Check for large table scans
      if (migration.includes('SELECT *')) {
        recommendations.push('Avoid SELECT * queries, specify only needed columns');
      }
    });
    
    return {
      queryPerformance,
      indexUsage,
      recommendations
    };
  }

  // Utility methods
  private extractDependencies(code: string): string[] {
    const importRegex = /import.*?from\s+['"`]([^'"`]+)['"`]/g;
    const dependencies: string[] = [];
    let match;
    
    while ((match = importRegex.exec(code)) !== null) {
      if (!match[1].startsWith('.') && !match[1].startsWith('/')) {
        dependencies.push(match[1]);
      }
    }
    
    return [...new Set(dependencies)];
  }

  private addMemoization(code: string): string {
    // Add React.memo wrapper
    if (code.includes('export default function') || code.includes('export const')) {
      return code.replace(
        /(export default function|export const)(\s+\w+)/,
        'import React from "react";\n\n$1$2'
      ).replace(
        /export default (\w+);?$/,
        'export default React.memo($1);'
      );
    }
    return code;
  }

  private addLazyLoading(code: string): string {
    // Add React.lazy wrapper for dynamic imports
    return `import React, { Suspense } from 'react';

const LazyComponent = React.lazy(() => import('./Component'));

export default function LazyWrapper(props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

${code}`;
  }

  private addBundleSplitting(code: string): string {
    // Add dynamic imports for code splitting
    return code.replace(
      /import\s+(\w+)\s+from\s+['"`]([^'"`]+)['"`]/g,
      (match, name, path) => {
        if (path.startsWith('./') || path.startsWith('../')) {
          return `const ${name} = React.lazy(() => import('${path}'));`;
        }
        return match;
      }
    );
  }

  private addAriaLabels(code: string, ariaLabels: Record<string, string>): string {
    let enhancedCode = code;
    
    Object.entries(ariaLabels).forEach(([selector, label]) => {
      // Add aria-label to matching elements
      const regex = new RegExp(`<${selector}([^>]*)>`, 'g');
      enhancedCode = enhancedCode.replace(regex, `<${selector}$1 aria-label="${label}">`);
    });
    
    return enhancedCode;
  }

  private addKeyboardNavigation(code: string): string {
    // Add keyboard event handlers
    return code.replace(
      /<(button|a|input|select|textarea)([^>]*)>/g,
      '<$1$2 onKeyDown={handleKeyDown}>'
    ).replace(
      /}\s*$/,
      `
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.target.click();
    }
  };
}`
    );
  }

  private addFocusManagement(code: string): string {
    // Add focus management hooks
    return `import React, { useRef, useEffect } from 'react';

${code}

// Focus management hook
const useFocusManagement = () => {
  const focusRef = useRef(null);
  
  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, []);
  
  return focusRef;
};`;
  }

  private getDefaultValue(type: string): string {
    switch (type.toLowerCase()) {
      case 'string': return "''";
      case 'number': return '0';
      case 'boolean': return 'false';
      case 'array': return '[]';
      case 'object': return '{}';
      default: return 'undefined';
    }
  }

  private getTestValue(type: string): string {
    switch (type.toLowerCase()) {
      case 'string': return "'test value'";
      case 'number': return '42';
      case 'boolean': return 'true';
      case 'array': return "['test']";
      case 'object': return "{ test: 'value' }";
      default: return 'null';
    }
  }

  private getExampleValue(type: string): string {
    switch (type.toLowerCase()) {
      case 'string': return '"Example text"';
      case 'number': return '123';
      case 'boolean': return 'true';
      case 'array': return '["item1", "item2"]';
      case 'object': return '{ key: "value" }';
      default: return 'undefined';
    }
  }

  private estimateBundleSize(code: string): number {
    // Rough estimation based on code length and complexity
    const baseSize = code.length;
    const importCount = (code.match(/import/g) || []).length;
    const componentCount = (code.match(/function|const.*=/g) || []).length;
    
    return baseSize + (importCount * 1000) + (componentCount * 500);
  }

  private analyzeRenderComplexity(code: string): number {
    // Analyze render complexity based on JSX elements and logic
    const jsxElements = (code.match(/<\w+/g) || []).length;
    const conditionals = (code.match(/\?|&&|\|\|/g) || []).length;
    const loops = (code.match(/\.map\(|\.filter\(|\.reduce\(/g) || []).length;
    
    return jsxElements + (conditionals * 2) + (loops * 3);
  }

  private detectPerformanceAntiPatterns(code: string): string[] {
    const antiPatterns: string[] = [];
    
    if (code.includes('new Date()') && code.includes('render')) {
      antiPatterns.push('Creating new Date objects in render');
    }
    
    if (code.includes('{}') && code.includes('props')) {
      antiPatterns.push('Creating new objects in props');
    }
    
    if (code.includes('() =>') && code.includes('onClick')) {
      antiPatterns.push('Creating new functions in render');
    }
    
    return antiPatterns;
  }

  private countNetworkRequests(code: string): number {
    const fetchCount = (code.match(/fetch\(/g) || []).length;
    const axiosCount = (code.match(/axios\./g) || []).length;
    const useEffectCount = (code.match(/useEffect/g) || []).length;
    
    return fetchCount + axiosCount + useEffectCount;
  }

  private generateEndpointImplementation(endpoint: any): string {
    switch (endpoint.method.toUpperCase()) {
      case 'GET':
        return `
    const data = await ${endpoint.path.split('/')[1]}Service.findAll();
    res.json(data);`;
      case 'POST':
        return `
    const newItem = await ${endpoint.path.split('/')[1]}Service.create(req.body);
    res.status(201).json(newItem);`;
      case 'PUT':
        return `
    const updatedItem = await ${endpoint.path.split('/')[1]}Service.update(req.params.id, req.body);
    res.json(updatedItem);`;
      case 'DELETE':
        return `
    await ${endpoint.path.split('/')[1]}Service.delete(req.params.id);
    res.status(204).send();`;
      default:
        return '// Implementation needed';
    }
  }

  private toPascalCase(str: string): string {
    return str.replace(/(^\w|_\w)/g, (match) => match.replace('_', '').toUpperCase());
  }

  private mapSqlTypeToTs(sqlType: string): string {
    const typeMap: Record<string, string> = {
      'varchar': 'string',
      'text': 'string',
      'char': 'string',
      'int': 'number',
      'integer': 'number',
      'bigint': 'number',
      'decimal': 'number',
      'float': 'number',
      'double': 'number',
      'boolean': 'boolean',
      'bool': 'boolean',
      'date': 'Date',
      'datetime': 'Date',
      'timestamp': 'Date',
      'json': 'any',
      'jsonb': 'any',
      'uuid': 'string'
    };
    
    return typeMap[sqlType.toLowerCase()] || 'any';
  }

  private generateSeedValue(type: string, index: number): string {
    switch (type.toLowerCase()) {
      case 'varchar':
      case 'text':
      case 'char':
        return `"Sample text ${index + 1}"`;
      case 'int':
      case 'integer':
      case 'bigint':
        return `${index + 1}`;
      case 'decimal':
      case 'float':
      case 'double':
        return `${(index + 1) * 10.5}`;
      case 'boolean':
      case 'bool':
        return `${index % 2 === 0}`;
      case 'date':
      case 'datetime':
      case 'timestamp':
        return `new Date('2024-01-${String(index + 1).padStart(2, '0')}')`;
      case 'json':
      case 'jsonb':
        return `{ "key": "value${index + 1}" }`;
      case 'uuid':
        return `"uuid-${index + 1}"`;
      default:
        return `"default-${index + 1}"`;
    }
  }
}

export class AdvancedCodeValidator implements CodeValidator {
  validateSyntax(code: string): ValidationResult {
    return CodeAnalysisService.validateCode(code);
  }

  optimizeCode(code: string): OptimizedCode {
    return CodeAnalysisService.optimizeCode(code);
  }

  suggestImprovements(code: string): Suggestion[] {
    return CodeAnalysisService.generateSuggestions(code);
  }
}

// Export singleton instances
export const codeGenerator = ModularCodeGenerator.getInstance();
export const codeValidator = new AdvancedCodeValidator();