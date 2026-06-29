"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_IMAGE_MODEL = exports.IMAGE_MODELS = exports.MODEL_MAP = exports.PROVIDER_CONFIGS = exports.CORS_ORIGINS = exports.JWT_SECRET = exports.PORT = void 0;
exports.getModelConfig = getModelConfig;
exports.getProviderConfig = getProviderConfig;
exports.getModelList = getModelList;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ============ 环境变量 ============
exports.PORT = parseInt(process.env.PORT || '3001', 10);
exports.JWT_SECRET = process.env.JWT_SECRET || 'luosheng-default-secret';
exports.CORS_ORIGINS = (process.env.CORS_ORIGINS || '*').split(',').map(s => s.trim());
// ============ 提供商配置 ============
exports.PROVIDER_CONFIGS = {
    siliconflow: {
        baseUrl: 'https://api.siliconflow.cn/v1',
        apiKey: process.env.SILICONFLOW_API_KEY || '',
        name: '硅基流动',
    },
    zhipu: {
        baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
        apiKey: process.env.ZHIPU_API_KEY || '',
        name: '智谱 AI',
    },
    dashscope: {
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        apiKey: process.env.DASHSCOPE_API_KEY || '',
        name: '阿里云百炼',
    },
    coze: {
        baseUrl: 'https://api.coze.cn',
        apiKey: process.env.COZE_API_KEY || '',
        name: '扣子智能体',
    },
};
// ============ 模型映射（全部真实可用） ============
exports.MODEL_MAP = {
    // SiliconFlow 模型 - 全部已验证可用
    'deepseek-v3': {
        provider: 'siliconflow',
        model: 'deepseek-ai/DeepSeek-V3',
        displayName: 'DeepSeek V3',
        free: true,
    },
    'deepseek-r1': {
        provider: 'siliconflow',
        model: 'deepseek-ai/DeepSeek-R1',
        displayName: 'DeepSeek R1 (推理)',
        free: true,
    },
    'qwen3-32b': {
        provider: 'siliconflow',
        model: 'Qwen/Qwen3-32B',
        displayName: 'Qwen3 32B',
        free: true,
    },
    'qwen3-14b': {
        provider: 'siliconflow',
        model: 'Qwen/Qwen3-14B',
        displayName: 'Qwen3 14B',
        free: true,
    },
    'qwen35-9b': {
        provider: 'siliconflow',
        model: 'Qwen/Qwen3.5-9B',
        displayName: 'Qwen3.5 9B',
        free: true,
    },
    'qwen25-72b': {
        provider: 'siliconflow',
        model: 'Qwen/Qwen2.5-72B-Instruct',
        displayName: 'Qwen2.5 72B',
        free: true,
    },
    'glm-5': {
        provider: 'siliconflow',
        model: 'zai-org/GLM-5.2',
        displayName: 'GLM-5.2 (智谱)',
        free: true,
    },
    'kimi-k2': {
        provider: 'siliconflow',
        model: 'moonshotai/Kimi-K2.7-Code',
        displayName: 'Kimi K2.7 (月之暗面)',
        free: true,
    },
    'glm-4-32b': {
        provider: 'siliconflow',
        model: 'THUDM/GLM-4-32B-0414',
        displayName: 'GLM-4 32B',
        free: true,
    },
    'minimax': {
        provider: 'siliconflow',
        model: 'MiniMaxAI/MiniMax-M2.5',
        displayName: 'MiniMax M2.5',
        free: true,
    },
    'hunyuan': {
        provider: 'siliconflow',
        model: 'tencent/Hunyuan-A13B-Instruct',
        displayName: '混元 A13B (腾讯)',
        free: true,
    },
    // Frontend-compatible model aliases
    'deepseek-chat': {
        provider: 'siliconflow',
        model: 'deepseek-ai/DeepSeek-V3',
        displayName: 'DeepSeek Chat',
        free: true,
    },
    'deepseek-v4-pro': {
        provider: 'siliconflow',
        model: 'deepseek-ai/DeepSeek-V3',
        displayName: 'DeepSeek V4 Pro',
        free: true,
    },
    'deepseek-v4-flash': {
        provider: 'siliconflow',
        model: 'Qwen/Qwen2.5-72B-Instruct',
        displayName: 'DeepSeek V4 Flash',
        free: true,
    },
    'deepseek-coder': {
        provider: 'siliconflow',
        model: 'deepseek-ai/DeepSeek-Coder-V2-Instruct',
        displayName: 'DeepSeek Coder',
        free: true,
    },
        // 扣子智能体 - 通过 Coze API 调用
    'coze-agent': {
        provider: 'coze',
        model: process.env.COZE_BOT_ID || '7651223356586786856',
        displayName: '罗圣AI智能体 (扣子)',
        free: false,
    },
};
// ============ 图片生成模型 ============
exports.IMAGE_MODELS = {
    'stable-diffusion': {
        provider: 'siliconflow',
        model: 'Tongyi-MAI/Z-Image-Turbo',
    },
    'cogview-4': {
        provider: 'zhipu',
        model: 'cogview-4',
    },
    'flux': {
        provider: 'siliconflow',
        model: 'Tongyi-MAI/Z-Image-Turbo',
    },
};
// 默认图片模型
exports.DEFAULT_IMAGE_MODEL = 'stable-diffusion';
// ============ 辅助函数 ============
function getModelConfig(modelId) {
    return exports.MODEL_MAP[modelId] || null;
}
function getProviderConfig(provider) {
    return exports.PROVIDER_CONFIGS[provider];
}
function getModelList() {
    return Object.entries(exports.MODEL_MAP).map(([id, config]) => ({
        id,
        name: config.displayName,
        provider: config.provider,
        free: config.free,
    }));
}
//# sourceMappingURL=config.js.map