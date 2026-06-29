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
exports.AgentDispatchController = void 0;
const common_1 = require("@nestjs/common");
const agent_dispatch_service_1 = require("./agent-dispatch.service");
let AgentDispatchController = class AgentDispatchController {
    constructor(agentDispatchService) {
        this.agentDispatchService = agentDispatchService;
    }
    getAgents() { return this.agentDispatchService.getAgents(); }
    getAgentStats() { return { code: 0, message: "success", data: { total_chats: 0, total_users: 0, avg_response_time: 0 } }; }
    getMyUsage() { return { code: 0, message: "success", data: { total_chats: 0, total_coins_spent: 0, favorite_agents: [] } }; }
    getAgentById(id) { return this.agentDispatchService.getAgentById(id); }
    async streamChat(agentId, body, req, res) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");
        res.flushHeaders();
        const userId = req.user ? req.user.id : 1;
        await this.agentDispatchService.streamChat(agentId, userId, body.message, res);
    }
};
exports.AgentDispatchController = AgentDispatchController;
__decorate([
    (0, common_1.Get)("agents"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AgentDispatchController.prototype, "getAgents", null);
__decorate([
    (0, common_1.Get)("agents/stats"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AgentDispatchController.prototype, "getAgentStats", null);
__decorate([
    (0, common_1.Get)("agents/my-usage"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AgentDispatchController.prototype, "getMyUsage", null);
__decorate([
    (0, common_1.Get)("agents/:id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AgentDispatchController.prototype, "getAgentById", null);
__decorate([
    (0, common_1.Post)("agents/:id/chat/stream"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], AgentDispatchController.prototype, "streamChat", null);
exports.AgentDispatchController = AgentDispatchController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [agent_dispatch_service_1.AgentDispatchService])
], AgentDispatchController);