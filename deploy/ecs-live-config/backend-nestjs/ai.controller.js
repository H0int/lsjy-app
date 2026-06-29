"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_service_1 = require("./ai.service");
const provider_manager_1 = require("./providers/provider-manager");
const chat_dto_1 = require("./dto/chat.dto");
const generate_image_dto_1 = require("./dto/generate-image.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const rxjs_1 = require("rxjs");
let AIController = class AIController {
    constructor(aiService, providerManager) {
        this.aiService = aiService;
        this.providerManager = providerManager;
    }
    async getProviders() {
        const status = await this.providerManager.getAllProviderStatus();
        return { data: status };
    }
    async getModels(category) {
        const models = await this.aiService.getAvailableModels(category);
        return { data: models };
    }
    async chat(userId, toolId, dto, req) {
        const messages = dto.messages.map((m) => ({
            role: m.role,
            content: m.content,
            imageUrl: m.imageUrl,
        }));
        const options = {
            model: dto.model,
            temperature: dto.temperature,
            maxTokens: dto.maxTokens,
            stream: dto.stream,
            topP: dto.topP,
            stop: dto.stop,
        };
        if (dto.systemPrompt) {
            messages.unshift({ role: 'system', content: dto.systemPrompt, imageUrl: '' });
        }
        const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '';
        const result = await this.aiService.chat(userId, toolId, messages, options, ip);
        return { data: result };
    }
    async chatStream(userId, toolId, dto, req) {
        const messages = dto.messages.map((m) => ({
            role: m.role,
            content: m.content,
            imageUrl: m.imageUrl,
        }));
        if (dto.systemPrompt) {
            messages.unshift({ role: 'system', content: dto.systemPrompt, imageUrl: '' });
        }
        const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '';
        return new rxjs_1.Observable((subscriber) => {
            const subject = new rxjs_1.Subject();
            const run = async () => {
                try {
                    const result = await this.aiService.chat(userId, toolId, messages, {
                        model: dto.model,
                        temperature: dto.temperature,
                        maxTokens: dto.maxTokens,
                        stream: true,
                        topP: dto.topP,
                        onStream: (chunk) => {
                            subscriber.next(JSON.stringify({ type: 'chunk', content: chunk }));
                        },
                    }, ip);
                    subscriber.next(JSON.stringify({
                        type: 'done',
                        usage: result.usage,
                        model: result.model,
                        provider: result.provider,
                        coinCost: result.coinCost,
                        callRecordId: result.callRecordId,
                    }));
                    subscriber.complete();
                }
                catch (err) {
                    subscriber.next(JSON.stringify({
                        type: 'error',
                        message: err.message || '生成失败',
                    }));
                    subscriber.complete();
                }
            };
            run();
        });
    }
    async generateImage(userId, toolId, dto, req) {
        const options = {
            size: dto.size,
            style: dto.style,
            count: dto.count,
            quality: dto.quality,
            refImage: dto.refImage,
        };
        const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '';
        const result = await this.aiService.generateImage(userId, toolId, dto.prompt, options, ip);
        return { data: result };
    }
    async quickChat(body) {
        // 支持前端发送的两种格式：
        // 1. { message: "...", modelName: "..." } （旧格式）
        // 2. { messages: [...], model: "..." } （新格式）
        let apiKey = process.env.DEEPSEEK_API_KEY || "";
        let baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
        if (!apiKey) {
            return { data: { reply: "AI服务未配置，请联系管理员。" } };
        }
        
        // 构建 messages 数组
        let messages = [];
        if (Array.isArray(body?.messages) && body.messages.length > 0) {
            // 新格式：直接传 messages 数组
            messages = body.messages.map(m => ({
                role: m.role || "user",
                content: m.content || ""
            }));
        } else if (bodolId/chat/stream'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'AI流式文本对话（SSE）' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('toolId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, chat_dto_1.ChatDto, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "chatStream", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('tools/:toolId/generate'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'AI图像生成' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('toolId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, generate_image_dto_1.GenerateImageDto, Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "generateImage", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('chat'),
    (0, swagger_1.ApiOperation)({ summary: '快捷AI对话（无需登录）' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AIController.prototype, "quickChat", null);
exports.AIController = AIController = __decorate([
    (0, swagger_1.ApiTags)('ai'),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_service_1.AIService,
        provider_manager_1.AIProviderManager])
], AIController);