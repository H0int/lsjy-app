
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateText, streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { PromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class AiEnhancedService {
  private readonly logger = new Logger(AiEnhancedService.name);
  private providers: Map<string, any> = new Map();

  constructor(private configService: ConfigService) {
    this.initProviders();
  }

  private initProviders() {
    // Register available AI providers from environment
    const providerConfigs = [
      { name: 'openai', keyEnv: 'OPENAI_API_KEY', baseUrlEnv: 'OPENAI_BASE_URL' },
      { name: 'deepseek', keyEnv: 'DEEPSEEK_API_KEY', baseUrlEnv: 'DEEPSEEK_BASE_URL' },
      { name: 'zhipu', keyEnv: 'ZHIPU_API_KEY', baseUrlEnv: 'ZHIPU_BASE_URL' },
    ];

    for (const cfg of providerConfigs) {
      const apiKey = this.configService.get(cfg.keyEnv);
      if (apiKey) {
        const baseUrl = this.configService.get(cfg.baseUrlEnv);
        const provider = createOpenAI({
          apiKey,
          baseURL: baseUrl || undefined,
        });
        this.providers.set(cfg.name, provider);
        this.logger.log(`AI provider registered: ${cfg.name}`);
      }
    }
  }

  sanitizePrompt(prompt: string): string {
    // Data masking: remove potential sensitive patterns
    return prompt
      .replace(/\b\d{17}[\dXx]\b/g, '[ID_REDACTED]')       // 身份证号
      .replace(/\b1[3-9]\d{9}\b/g, '[PHONE_REDACTED]')      // 手机号
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]'); // 邮箱
  }

  async generate(providerName: string, model: string, prompt: string, tenantId: string) {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new BadRequestException(`Provider ${providerName} not available`);
    }
    const sanitized = this.sanitizePrompt(prompt);
    this.logger.log(`[${tenantId}] Generating via ${providerName}/${model}`);

    const result = await generateText({
      model: provider(model),
      prompt: sanitized,
    });
    return { text: result.text, provider: providerName, model };
  }

  async generateStream(providerName: string, model: string, prompt: string, tenantId: string): Promise<any> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new BadRequestException(`Provider ${providerName} not available`);
    }
    const sanitized = this.sanitizePrompt(prompt);
    this.logger.log(`[${tenantId}] Streaming via ${providerName}/${model}`);

    const result = await streamText({
      model: provider(model),
      prompt: sanitized,
    });
    return result;
  }

  async langchainProcess(modelName: string, prompt: string, tenantId: string) {
    const apiKey = this.configService.get('OPENAI_API_KEY') || this.configService.get('DEEPSEEK_API_KEY');
    const baseUrl = this.configService.get('OPENAI_BASE_URL') || this.configService.get('DEEPSEEK_BASE_URL');
    if (!apiKey) {
      throw new BadRequestException('No LLM API key configured');
    }

    const sanitized = this.sanitizePrompt(prompt);
    this.logger.log(`[${tenantId}] LangChain processing with model: ${modelName}`);

    const llm = new ChatOpenAI({
      modelName,
      openAIApiKey: apiKey,
      configuration: baseUrl ? { baseURL: baseUrl } : undefined,
      temperature: 0.7,
    });

    const promptTemplate = PromptTemplate.fromTemplate('{input}');
    const chain = RunnableSequence.from([promptTemplate, llm, new StringOutputParser()]);
    const result = await chain.invoke({ input: sanitized });
    return { text: result, model: modelName };
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

