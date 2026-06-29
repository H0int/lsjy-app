// ============ 类型定义 ============

export interface ModelMapping {
  provider: Provider;
  model: string;
  displayName: string;
  free: boolean;
}

export type Provider = 'siliconflow' | 'zhipu' | 'dashscope' | 'coze';

export interface ProviderConfig {
  baseUrl: string;
  apiKey: string;
  name: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface StreamChoice {
  delta: { content?: string; role?: string };
  finish_reason: string | null;
  index: number;
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: StreamChoice[];
}

export interface NonStreamChoice {
  message: { role: string; content: string };
  finish_reason: string;
  index: number;
}

export interface NonStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: NonStreamChoice[];
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  free: boolean;
}

export interface GenerateImageRequest {
  prompt: string;
  model?: string;
  size?: string;
  n?: number;
}

export interface ToolUseRequest {
  input: string;
  [key: string]: any;
}

export interface JwtPayload {
  userId?: string;
  sub?: string;
  id?: string;
  [key: string]: any;
}
