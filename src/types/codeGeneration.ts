// Core interfaces for the enhanced code generation system

export interface ComponentSpec {
  name: string;
  type: 'functional' | 'class' | 'hook';
  props: PropSpec[];
  state?: StateSpec[];
  methods?: MethodSpec[];
  styling: StylingSpec;
  accessibility: AccessibilitySpec;
  performance: PerformanceSpec;
}

export interface PropSpec {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
  validation?: ValidationRule[];
}

export interface StateSpec {
  name: string;
  type: string;
  initialValue: any;
  persistence?: 'local' | 'session' | 'none';
}

export interface MethodSpec {
  name: string;
  parameters: ParameterSpec[];
  returnType: string;
  async: boolean;
  description?: string;
}

export interface ParameterSpec {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
}

export interface StylingSpec {
  framework: 'tailwind' | 'styled-components' | 'css-modules' | 'emotion';
  responsive: boolean;
  theme?: ThemeSpec;
  animations?: AnimationSpec[];
}

export interface ThemeSpec {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
  breakpoints: Record<string, string>;
}

export interface AnimationSpec {
  name: string;
  type: 'transition' | 'keyframe' | 'spring';
  duration: number;
  easing?: string;
  trigger: 'hover' | 'click' | 'scroll' | 'mount';
}

export interface AccessibilitySpec {
  ariaLabels: Record<string, string>;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  colorContrast: 'AA' | 'AAA';
  focusManagement: boolean;
}

export interface PerformanceSpec {
  lazyLoading: boolean;
  memoization: boolean;
  bundleSplitting: boolean;
  imageOptimization: boolean;
  caching: CachingSpec;
}

export interface CachingSpec {
  strategy: 'memory' | 'disk' | 'network';
  ttl: number;
  invalidation: string[];
}

export interface APISpec {
  endpoints: EndpointSpec[];
  authentication: AuthSpec;
  validation: ValidationSpec;
  documentation: DocumentationSpec;
  testing: TestingSpec;
}

export interface EndpointSpec {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  parameters: ParameterSpec[];
  requestBody?: RequestBodySpec;
  responses: ResponseSpec[];
  middleware: MiddlewareSpec[];
  rateLimit?: RateLimitSpec;
}

export interface RequestBodySpec {
  type: 'json' | 'form-data' | 'url-encoded';
  schema: any;
  validation: ValidationRule[];
}

export interface ResponseSpec {
  statusCode: number;
  description: string;
  schema: any;
  examples: any[];
}

export interface MiddlewareSpec {
  name: string;
  type: 'auth' | 'validation' | 'logging' | 'cors' | 'rate-limit' | 'custom';
  config: Record<string, any>;
  order: number;
}

export interface RateLimitSpec {
  requests: number;
  window: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface AuthSpec {
  type: 'jwt' | 'oauth' | 'api-key' | 'session';
  provider?: string;
  scopes?: string[];
  config: Record<string, any>;
}

export interface ValidationSpec {
  library: 'joi' | 'yup' | 'zod' | 'ajv';
  schemas: Record<string, any>;
  errorHandling: ErrorHandlingSpec;
}

export interface ErrorHandlingSpec {
  strategy: 'throw' | 'return' | 'callback';
  format: 'json' | 'xml' | 'plain';
  logging: boolean;
  monitoring: boolean;
}

export interface DocumentationSpec {
  format: 'openapi' | 'postman' | 'insomnia';
  includeExamples: boolean;
  includeSchemas: boolean;
  authentication: boolean;
}

export interface TestingSpec {
  framework: 'jest' | 'mocha' | 'vitest';
  types: ('unit' | 'integration' | 'e2e')[];
  coverage: CoverageSpec;
  mocking: MockingSpec;
}

export interface CoverageSpec {
  threshold: number;
  reports: ('html' | 'lcov' | 'text' | 'json')[];
  exclude: string[];
}

export interface MockingSpec {
  strategy: 'manual' | 'auto' | 'hybrid';
  external: boolean;
  database: boolean;
}

export interface DatabaseSpec {
  type: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite';
  tables: TableSpec[];
  relationships: RelationshipSpec[];
  indexes: IndexSpec[];
  migrations: MigrationSpec[];
  seeding: SeedingSpec;
}

export interface TableSpec {
  name: string;
  columns: ColumnSpec[];
  constraints: ConstraintSpec[];
  triggers: TriggerSpec[];
  policies: PolicySpec[];
}

export interface ColumnSpec {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: any;
  unique: boolean;
  primaryKey: boolean;
  foreignKey?: ForeignKeySpec;
  validation?: ValidationRule[];
}

export interface ForeignKeySpec {
  table: string;
  column: string;
  onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  onUpdate: 'CASCADE' | 'SET NULL' | 'RESTRICT';
}

export interface ConstraintSpec {
  name: string;
  type: 'CHECK' | 'UNIQUE' | 'FOREIGN KEY' | 'PRIMARY KEY';
  definition: string;
}

export interface TriggerSpec {
  name: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  timing: 'BEFORE' | 'AFTER';
  function: string;
}

export interface PolicySpec {
  name: string;
  type: 'RLS' | 'SECURITY';
  definition: string;
  roles: string[];
}

export interface RelationshipSpec {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  from: TableColumnSpec;
  to: TableColumnSpec;
  cascading: boolean;
}

export interface TableColumnSpec {
  table: string;
  column: string;
}

export interface IndexSpec {
  name: string;
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist';
  unique: boolean;
  partial?: string;
}

export interface MigrationSpec {
  version: string;
  description: string;
  up: string;
  down: string;
  dependencies: string[];
}

export interface SeedingSpec {
  strategy: 'faker' | 'fixtures' | 'custom';
  tables: Record<string, SeedDataSpec>;
}

export interface SeedDataSpec {
  count: number;
  data?: any[];
  generator?: string;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  function?: string;
}

export interface GeneratedComponent {
  code: string;
  dependencies: string[];
  tests: string;
  documentation: string;
  performance: PerformanceMetrics;
  accessibility: AccessibilityReport;
}

export interface GeneratedAPI {
  code: string;
  routes: string;
  middleware: string;
  tests: string;
  documentation: string;
  security: SecurityReport;
}

export interface GeneratedSchema {
  migrations: string[];
  models: string;
  seeds: string;
  documentation: string;
  performance: DatabasePerformanceReport;
}

export interface PerformanceMetrics {
  bundleSize: number;
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkRequests: number;
}

export interface AccessibilityReport {
  score: number;
  issues: AccessibilityIssue[];
  suggestions: string[];
  compliance: 'AA' | 'AAA' | 'partial' | 'none';
}

export interface AccessibilityIssue {
  type: string;
  severity: 'error' | 'warning' | 'info';
  element: string;
  description: string;
  fix: string;
}

export interface SecurityReport {
  score: number;
  vulnerabilities: SecurityVulnerability[];
  recommendations: string[];
  compliance: string[];
}

export interface SecurityVulnerability {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  fix: string;
  cve?: string;
}

export interface DatabasePerformanceReport {
  queryPerformance: QueryPerformanceMetric[];
  indexUsage: IndexUsageMetric[];
  recommendations: string[];
}

export interface QueryPerformanceMetric {
  query: string;
  executionTime: number;
  frequency: number;
  optimization: string;
}

export interface IndexUsageMetric {
  index: string;
  usage: number;
  effectiveness: number;
  recommendation: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  type: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  line: number;
  column: number;
  message: string;
  type: string;
  fix?: string;
}

export interface OptimizedCode {
  code: string;
  optimizations: Optimization[];
  metrics: OptimizationMetrics;
}

export interface Optimization {
  type: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  savings: OptimizationSavings;
}

export interface OptimizationSavings {
  bundleSize?: number;
  loadTime?: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface OptimizationMetrics {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  performanceGain: number;
}

export interface Suggestion {
  type: 'performance' | 'security' | 'accessibility' | 'maintainability' | 'best-practice';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}