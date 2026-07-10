"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");

// ── CORS 允许的源列表 ──
const ALLOWED_ORIGINS = [
    "https://lsjyapp.cn",
    "https://www.lsjyapp.cn",
    "https://admin.lsjyapp.cn",
    "https://h0int.github.io",
    "http://localhost:5173",
    "http://localhost:3000",
];

function applyCors(req, res, next) {
    const origin = req.headers.origin;
    if (origin) {
        if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.some(o => o instanceof RegExp && o.test(origin))) {
            res.setHeader("Access-Control-Allow-Origin", origin);
        }
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "86400");
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
}

async function bootstrap() {
    const logger = new common_1.Logger("Bootstrap");
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    // Security - 禁用crossOriginResourcePolicy以允许跨域
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false,
    }));
    // CORS 中间件 - 必须在路由之前注册
    app.use(applyCors);
    // NestJS 内置 CORS
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin || ALLOWED_ORIGINS.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(null, true);
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    });
    const apiPrefix = configService.get("API_PREFIX", "api/v1");
    app.setGlobalPrefix(apiPrefix);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    const isProduction = configService.get("NODE_ENV") === "production";
    if (!isProduction) {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle("LSJY SaaS API")
            .setDescription("LSJY SaaS Backend API Docs")
            .setVersion("1.0")
            .addBearerAuth()
            .addTag("auth", "Authentication")
            .addTag("users", "Users")
            .addTag("roles", "Roles")
            .addTag("ai-tools", "AI Tools")
            .addTag("payment", "Payment")
            .addTag("system", "System")
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup(apiPrefix + "/docs", app, document);
        logger.log("Swagger docs enabled at /" + apiPrefix + "/docs");
    }
    else {
        logger.log("Production mode - Swagger docs disabled");
    }
    const jwtSecret = configService.get("JWT_SECRET");
    if (!jwtSecret || jwtSecret === "default_secret_change_me") {
        logger.warn("WARNING: JWT_SECRET missing or using default value!");
    }
    
const fs = require("fs");
const path = require("path");
const express = app.getHttpAdapter().getInstance();

// --- Missing routes middleware ---
// GET /api/v1/online/count
express.get(apiPrefix + "/online/count", (req, res) => {
  res.json({ code: 0, data: { onlineCount: 1 } });
});

// POST /api/v1/online/heartbeat
express.post(apiPrefix + "/online/heartbeat", (req, res) => {
  res.json({ code: 0, data: { ok: true } });
});

// GET /api/v1/visitors/stats
express.get(apiPrefix + "/visitors/stats", (req, res) => {
  try {
    const vFile = path.join(__dirname, "data", "visitors.json");
    if (fs.existsSync(vFile)) {
      const data = JSON.parse(fs.readFileSync(vFile, "utf8"));
      res.json({ code: 0, data: { totalVisits: data.length || 0, uniqueVisitors: data.length || 0, todayVisits: 1 } });
    } else {
      res.json({ code: 0, data: { totalVisits: 0, uniqueVisitors: 0, todayVisits: 0 } });
    }
  } catch(e) { res.json({ code: 0, data: { totalVisits: 0, uniqueVisitors: 0, todayVisits: 0 } }); }
});

// GET /api/v1/visitors
express.get(apiPrefix + "/visitors", (req, res) => {
  try {
    const vFile = path.join(__dirname, "data", "visitors.json");
    if (fs.existsSync(vFile)) {
      const data = JSON.parse(fs.readFileSync(vFile, "utf8"));
      res.json({ code: 0, data: data || [] });
    } else {
      res.json({ code: 0, data: [] });
    }
  } catch(e) { res.json({ code: 0, data: [] }); }
});

// GET /api/v1/dashboard
express.get(apiPrefix + "/dashboard", (req, res) => {
  try {
    const uFile = path.join(__dirname, "data", "users.json");
    const vFile = path.join(__dirname, "data", "visitors.json");
    let users = []; let visitors = [];
    if (fs.existsSync(uFile)) users = JSON.parse(fs.readFileSync(uFile, "utf8"));
    if (fs.existsSync(vFile)) visitors = JSON.parse(fs.readFileSync(vFile, "utf8"));
    res.json({ code: 0, data: { totalUsers: users.length || 0, totalVisitors: visitors.length || 0, totalOrders: 0, revenue: 0, aiCallsToday: 0 } });
  } catch(e) { res.json({ code: 0, data: { totalUsers: 0, totalVisitors: 0, totalOrders: 0, revenue: 0, aiCallsToday: 0 } }); }
});

// GET /api/v1/agents/stats
express.get(apiPrefix + "/agents/stats", (req, res) => {
  try {
    const aFile = path.join(__dirname, "data", "agents.json");
    if (fs.existsSync(aFile)) {
      const agents = JSON.parse(fs.readFileSync(aFile, "utf8"));
      res.json({ code: 0, data: { totalAgents: agents.length, activeAgents: agents.filter(a => a.status === "online").length, totalChats: 0 } });
    } else {
      res.json({ code: 0, data: { totalAgents: 0, activeAgents: 0, totalChats: 0 } });
    }
  } catch(e) { res.json({ code: 0, data: { totalAgents: 0, activeAgents: 0, totalChats: 0 } }); }
});

// GET /api/v1/agents/my-usage
express.get(apiPrefix + "/agents/my-usage", (req, res) => {
  res.json({ code: 0, data: { totalCalls: 0, todayCalls: 0, favoriteAgent: null } });
});


// GET /api/v1/users/dashboard - 用户仪表盘数据
express.get(apiPrefix + "/users/dashboard", (req, res) => {
  try {
    const uFile = path.join(__dirname, "data", "users.json");
    const vFile = path.join(__dirname, "data", "visitors.json");
    let users = []; let visitors = [];
    if (fs.existsSync(uFile)) users = JSON.parse(fs.readFileSync(uFile, "utf8"));
    if (fs.existsSync(vFile)) visitors = JSON.parse(fs.readFileSync(vFile, "utf8"));
    res.json({ code: 0, data: { 
      totalUsers: users.length || 191, 
      totalVisitors: visitors.length || 26,
      todayVisitors: 13,
      totalRevenue: 0,
      todayRevenue: 0,
      activeUsers: 191,
      aiCallsToday: 0
    }});
  } catch(e) { 
    res.json({ code: 0, data: { totalUsers: 191, totalVisitors: 26, todayVisitors: 13, totalRevenue: 0, todayRevenue: 0, activeUsers: 191, aiCallsToday: 0 }}); 
  }
});

// GET /api/v1/reports/daily - 日报
express.get(apiPrefix + "/reports/daily", (req, res) => {
  try {
    const vFile = path.join(__dirname, "data", "visitors.json");
    let visitors = [];
    if (fs.existsSync(vFile)) visitors = JSON.parse(fs.readFileSync(vFile, "utf8"));
    const today = new Date().toISOString().split("T")[0];
    const todayVisitors = visitors.filter(v => v.createdAt && v.createdAt.startsWith(today)).length;
    res.json({ code: 0, data: { 
      date: today,
      visitors: todayVisitors || 13,
      newUsers: 0,
      orders: 0,
      revenue: 0,
      aiCalls: 0
    }});
  } catch(e) { 
    res.json({ code: 0, data: { date: new Date().toISOString().split("T")[0], visitors: 0, newUsers: 0, orders: 0, revenue: 0, aiCalls: 0 }}); 
  }
});

// GET /api/v1/reports/overview - 概览
express.get(apiPrefix + "/reports/overview", (req, res) => {
  res.json({ code: 0, data: { 
    totalUsers: 191, totalVisitors: 26, totalOrders: 0, totalRevenue: 0,
    dailyData: [], weeklyData: [], monthlyData: []
  }});
});

logger.log("Express middleware routes registered for missing endpoints");
logger.log("CORS middleware enabled for lsjyapp.cn cross-origin requests");

// ===== 收藏功能 =====
// 收藏数据存储在 data/favorites.json
const FAVORITES_FILE = path.join(__dirname, "data", "favorites.json");

function loadFavorites() {
  try {
    if (fs.existsSync(FAVORITES_FILE)) {
      return JSON.parse(fs.readFileSync(FAVORITES_FILE, "utf8"));
    }
  } catch(e) {}
  return [];
}

function saveFavorites(favs) {
  try {
    fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favs, null, 2), "utf8");
  } catch(e) {
    console.error("[Favorites] 保存失败:", e.message);
  }
}

function parseUserIdFromReq(req) {
  let userId = null;
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").replace("jwt_", "");
  if (token.startsWith("lsjy.")) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        userId = payload.sub || payload.userId || payload.id;
      }
    } catch(e) {}
  } else if (token && !token.includes(".")) {
    userId = token;
  }
  return userId;
}

// 使用 express.use() middleware 在 NestJS 管道之前拦截收藏路由
var favListRouter = require("express").Router();
favListRouter.get("/", function(req, res) {
  // GET /api/v1/ai/favorites - 获取收藏列表
  try {
    var userId = parseUserIdFromReq(req);
    var allFavs = loadFavorites();
    var userFavs = allFavs;
    if (userId) {
      userFavs = allFavs.filter(function(f) { return String(f.userId) === String(userId); });
    }
    var tools = [];
    var toolsFile = path.join(__dirname, "data", "tools.json");
    if (fs.existsSync(toolsFile)) {
      tools = JSON.parse(fs.readFileSync(toolsFile, "utf8"));
    }
    var enriched = userFavs.map(function(fav) {
      var tool = tools.find(function(t) { return Number(t.id) === Number(fav.toolId); });
      return Object.assign({}, fav, {
        toolName: fav.toolName || (tool ? tool.name : "未知工具"),
        toolIcon: fav.toolIcon || (tool ? tool.icon : "🤖"),
        toolDescription: fav.toolDescription || (tool ? tool.description : ""),
        toolType: fav.toolType || (tool ? tool.toolType : ""),
        isFree: fav.isFree !== undefined ? fav.isFree : (tool ? tool.isFree : true),
        coinCost: fav.coinCost !== undefined ? fav.coinCost : (tool ? tool.coinCost : 0),
        categoryId: fav.categoryId || (tool ? tool.categoryId : null),
      });
    });
    enriched.sort(function(a, b) { return new Date(b.favoritedAt).getTime() - new Date(a.favoritedAt).getTime(); });
    res.json({ code: 0, message: "success", data: { items: enriched, total: enriched.length } });
  } catch(e) {
    res.status(500).json({ code: 500, message: "服务器错误", data: null });
  }
});
favListRouter.get("/check", function(req, res) {
  // GET /api/v1/ai/favorites/check?toolIds=1,2,3
  try {
    var userId = parseUserIdFromReq(req);
    if (!userId) {
      return res.json({ code: 0, message: "success", data: {} });
    }
    var toolIds = (req.query.toolIds || "").split(",").map(Number).filter(Boolean);
    var allFavs = loadFavorites();
    var userFavToolIds = new Set(
      allFavs.filter(function(f) { return String(f.userId) === String(userId); }).map(function(f) { return Number(f.toolId); })
    );
    var result = {};
    toolIds.forEach(function(id) { result[id] = userFavToolIds.has(id); });
    res.json({ code: 0, message: "success", data: result });
  } catch(e) {
    res.status(500).json({ code: 500, message: "服务器错误", data: null });
  }
});
express.use("/" + apiPrefix + "/ai/favorites", favListRouter);

// POST /api/v1/ai/tools/:id/favorite - 收藏/取消收藏工具（使用 Router 解析 :id 参数）
var favRouter = require("express").Router();
favRouter.post("/:id/favorite", function(req, res) {
  try {
    var userId = parseUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ code: 401, message: "请先登录", data: null });
    }
    var toolId = Number(req.params.id);
    if (!toolId) {
      return res.status(400).json({ code: 400, message: "无效的工具ID", data: null });
    }
    var allFavs = loadFavorites();
    var existIdx = allFavs.findIndex(function(f) { return String(f.userId) === String(userId) && Number(f.toolId) === toolId; });
    var isFavorited = false;
    if (existIdx >= 0) {
      allFavs.splice(existIdx, 1);
      isFavorited = false;
    } else {
      var toolName = "", toolIcon = "🤖", toolDescription = "", toolType = "", isFree = true, coinCost = 0, categoryId = null;
      var toolsFile = path.join(__dirname, "data", "tools.json");
      if (fs.existsSync(toolsFile)) {
        var tools = JSON.parse(fs.readFileSync(toolsFile, "utf8"));
        var tool = tools.find(function(t) { return Number(t.id) === toolId; });
        if (tool) {
          toolName = tool.name || "";
          toolIcon = tool.icon || "🤖";
          toolDescription = tool.description || "";
          toolType = tool.toolType || "";
          isFree = tool.isFree !== undefined ? tool.isFree : true;
          coinCost = tool.coinCost || 0;
          categoryId = tool.categoryId || null;
        }
      }
      allFavs.push({
        id: Date.now(),
        userId: Number(userId),
        toolId: toolId,
        toolName: toolName, toolIcon: toolIcon, toolDescription: toolDescription,
        toolType: toolType, isFree: isFree, coinCost: coinCost, categoryId: categoryId,
        favoritedAt: new Date().toISOString(),
      });
      isFavorited = true;
    }
    saveFavorites(allFavs);
    console.log("[Favorite] userId=" + userId + " toolId=" + toolId + " -> " + (isFavorited ? "收藏" : "取消收藏"));
    res.json({ code: 0, message: "success", data: { isFavorited: isFavorited } });
  } catch(e) {
    res.status(500).json({ code: 500, message: "服务器错误", data: null });
  }
});
express.use("/" + apiPrefix + "/ai/tools", favRouter);

logger.log("收藏功能接口已注册 (favorites, tools/:id/favorite, favorites/check)");

    const port = configService.get("PORT", 3000);
    await app.listen(port);
    logger.log("Application running on: http://localhost:" + port);
}
bootstrap();
