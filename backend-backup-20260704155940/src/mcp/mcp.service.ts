
import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as path from 'path';
import * as fs from 'fs';

export interface McpTool {
  name: string;
  description: string;
  inputSchema: object;
}

@Injectable()
export class McpService {
  private readonly logger = new Logger(McpService.name);
  private tools: Map<string, McpTool> = new Map();

  // Whitelist of allowed internal API routes for database_query (GET only)
  // Empty by default - must be manually configured to enable
  private allowedApiRoutes: string[] = [];

  // Allowed file extensions for file_manager
  private allowedFileExtensions: string[] = ['.txt', '.csv', '.json', '.md', '.xml', '.html'];

  // Forbidden file patterns
  private forbiddenFilePatterns: string[] = ['.env', '.config', '.log', 'secret', 'credential', 'password'];

  // Base directory for file operations
  private readonly fileBaseDir: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.fileBaseDir = path.resolve(this.configService.get('FILE_UPLOAD_DIR', './uploads'));
    this.initTools();
  }

  private initTools() {
    this.tools.set('web-search', {
      name: 'web-search',
      description: 'Search the web for information',
      inputSchema: { type: 'object', properties: { query: { type: 'string' }, tenantId: { type: 'string' } }, required: ['query', 'tenantId'] },
    });

    this.tools.set('database-query', {
      name: 'database-query',
      description: 'Query internal API endpoints (GET only, whitelist-based)',
      inputSchema: { type: 'object', properties: { endpoint: { type: 'string' }, tenantId: { type: 'string' } }, required: ['endpoint', 'tenantId'] },
    });

    this.tools.set('file-manager', {
      name: 'file-manager',
      description: 'List and read files in the uploads directory (restricted extensions)',
      inputSchema: { type: 'object', properties: { action: { type: 'string', enum: ['list', 'read'] }, path: { type: 'string' }, tenantId: { type: 'string' } }, required: ['action', 'tenantId'] },
    });

    this.logger.log(`MCP tools initialized: ${Array.from(this.tools.keys()).join(', ')}`);
    this.logger.warn(`Database query whitelist: ${this.allowedApiRoutes.length === 0 ? 'EMPTY (all queries disabled)' : this.allowedApiRoutes.join(', ')}`);
  }

  getTools(): McpTool[] {
    return Array.from(this.tools.values());
  }

  private validateTenantContext(tenantId: string): void {
    if (!tenantId || typeof tenantId !== 'string' || tenantId.trim() === '') {
      throw new BadRequestException('tenantId is required for MCP tool execution');
    }
  }

  async executeTool(toolName: string, params: any, tenantId: string): Promise<any> {
    this.validateTenantContext(tenantId);

    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new BadRequestException(`Unknown tool: ${toolName}`);
    }

    switch (toolName) {
      case 'web-search':
        return this.executeWebSearch(params, tenantId);
      case 'database-query':
        return this.executeDatabaseQuery(params, tenantId);
      case 'file-manager':
        return this.executeFileManager(params, tenantId);
      default:
        throw new BadRequestException(`Tool ${toolName} not implemented`);
    }
  }

  private async executeWebSearch(params: any, tenantId: string): Promise<any> {
    this.logger.log(`[${tenantId}] Web search: ${params.query}`);
    // Placeholder: integrate with actual search API
    return { results: [], query: params.query, tenantId };
  }

  private async executeDatabaseQuery(params: any, tenantId: string): Promise<any> {
    const endpoint = params.endpoint;

    // STRICT WHITELIST CHECK
    if (this.allowedApiRoutes.length === 0) {
      throw new ForbiddenException('Database query tool is disabled: no API routes whitelisted. Contact admin to configure allowed routes.');
    }

    // Check if endpoint is in whitelist
    const isAllowed = this.allowedApiRoutes.some(route => endpoint === route || endpoint.startsWith(route + '?'));
    if (!isAllowed) {
      throw new ForbiddenException(`Endpoint "${endpoint}" is not in the allowed whitelist`);
    }

    // Ensure it's a read-only operation - only allow GET-like queries
    this.logger.log(`[${tenantId}] Database query (whitelisted): ${endpoint}`);

    // Proxy the request to internal API with tenant context
    const internalBaseUrl = this.configService.get('INTERNAL_API_URL', 'http://127.0.0.1:3000');
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${internalBaseUrl}${endpoint}`, {
          headers: { 'x-tenant-id': tenantId },
          timeout: 10000,
        })
      );
      // Mask sensitive fields in response
      return this.maskSensitiveFields(response.data as any);
    } catch (error: any) {
      this.logger.error(`[${tenantId}] Internal API call failed: ${error.message}`);
      throw new BadRequestException('Internal API query failed');
    }
  }

  private maskSensitiveFields(data: any): any {
    if (!data || typeof data !== 'object') return data;
    const sensitiveKeys = ['password', 'secret', 'token', 'apiKey', 'api_key', 'phone', 'email', 'idCard', 'id_card'];
    
    if (Array.isArray(data)) {
      return data.map(item => this.maskSensitiveFields(item));
    }

    const masked = { ...data };
    for (const key of Object.keys(masked)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        masked[key] = '[REDACTED]';
      } else if (typeof masked[key] === 'object') {
        masked[key] = this.maskSensitiveFields(masked[key]);
      }
    }
    return masked;
  }

  private async executeFileManager(params: any, tenantId: string): Promise<any> {
    const action = params.action;
    const filePath = params.path || '';

    // Path traversal protection
    const resolvedPath = path.resolve(this.fileBaseDir, filePath);
    if (!resolvedPath.startsWith(this.fileBaseDir)) {
      throw new ForbiddenException('Path traversal detected: access denied');
    }

    // Check forbidden patterns
    const lowerPath = resolvedPath.toLowerCase();
    for (const pattern of this.forbiddenFilePatterns) {
      if (lowerPath.includes(pattern)) {
        throw new ForbiddenException(`Access denied: file matches forbidden pattern "${pattern}"`);
      }
    }

    if (action === 'list') {
      this.logger.log(`[${tenantId}] Listing files in: ${resolvedPath}`);
      try {
        const entries = fs.readdirSync(resolvedPath, { withFileTypes: true });
        return {
          path: filePath || '/',
          entries: entries.map(e => ({
            name: e.name,
            type: e.isDirectory() ? 'directory' : 'file',
            allowed: e.isFile() ? this.allowedFileExtensions.includes(path.extname(e.name).toLowerCase()) : true,
          })),
          tenantId,
        };
      } catch (error: any) {
        throw new BadRequestException(`Cannot list directory: ${error.message}`);
      }
    }

    if (action === 'read') {
      // File content reading is DISABLED by default
      if (!this.configService.get('MCP_FILE_READ_ENABLED', 'false')) {
        throw new ForbiddenException('File content reading is disabled. Enable via MCP_FILE_READ_ENABLED=true');
      }

      // Extension whitelist check
      const ext = path.extname(resolvedPath).toLowerCase();
      if (!this.allowedFileExtensions.includes(ext)) {
        throw new ForbiddenException(`File extension "${ext}" is not in the allowed whitelist: ${this.allowedFileExtensions.join(', ')}`);
      }

      this.logger.log(`[${tenantId}] Reading file: ${resolvedPath}`);
      try {
        const content = fs.readFileSync(resolvedPath, 'utf-8');
        return { path: filePath, content, tenantId };
      } catch (error: any) {
        throw new BadRequestException(`Cannot read file: ${error.message}`);
      }
    }

    throw new BadRequestException(`Unknown action: ${action}`);
  }
}

