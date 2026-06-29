import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PORT, CORS_ORIGINS } from './config';
import * as fs from "fs";
import * as path from "path";
import aiRouter from './routes/ai';

dotenv.config();

const app = express();

// ============ 中间件 ============

// CORS
app.use(cors({
  origin: (origin, callback) => {
    // 允许无 origin 的请求（如 Postman、curl）
    if (!origin) return callback(null, true);
    if (CORS_ORIGINS.includes('*') || CORS_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // 开发阶段全部放行，生产环境请严格配置
    }
  },
  credentials: true,
}));

// JSON 解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 请求日志
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  const userId = (req as any).user?.userId || (req as any).user?.sub || 'anonymous';
  console.log(`[${timestamp}] ${req.method} ${req.path} user=${userId}`);
  next();
});

// ============ 路由 ============

// 健康检查
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'luosheng-ai-proxy',
    version: '1.0.0',
  });
});

// AI 路由
app.use('/api/v1/ai', aiRouter);


// ============ 访客统计 ============
const VISITOR_FILE = path.join(__dirname, "..", "visitor_stats.json");

function loadVisitorData() {
  try {
    if (fs.existsSync(VISITOR_FILE)) {
      return JSON.parse(fs.readFileSync(VISITOR_FILE, "utf8"));
    }
  } catch (e) { /* ignore */ }
  // Initialize with base data
  return {
    totalVisitors: 313,
    todayVisitors: 0,
    uniqueIPs: 0,
    lastVisitTime: new Date().toISOString(),
    recentVisitors: [],
    lastResetDate: new Date().toISOString().slice(0, 10)
  };
}

function saveVisitorData(data: any) {
  try {
    fs.writeFileSync(VISITOR_FILE, JSON.stringify(data, null, 2));
  } catch (e) { /* ignore */ }
}

function trackVisitor(ip: string) {
  const data = loadVisitorData();
  const today = new Date().toISOString().slice(0, 10);
  
  // Reset daily counters
  if (data.lastResetDate !== today) {
    data.todayVisitors = 0;
    data.uniqueIPs = 0;
    data.lastResetDate = today;
  }
  
  data.totalVisitors++;
  data.todayVisitors++;
  data.lastVisitTime = new Date().toISOString();
  
  // Track unique IPs (keep last 100)
  if (!data.seenIPs) data.seenIPs = [];
  if (!data.seenIPs.includes(ip)) {
    data.seenIPs.push(ip);
    data.uniqueIPs++;
    if (data.seenIPs.length > 100) data.seenIPs.shift();
  }
  
  // Recent visitors log (keep last 20)
  data.recentVisitors.unshift({ ip, time: new Date().toISOString() });
  if (data.recentVisitors.length > 20) data.recentVisitors.pop();
  
  saveVisitorData(data);
  return data;
}

app.get("/api/v1/visitors/stats", (req: express.Request, res: express.Response) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const data = trackVisitor(ip);
  res.json({
    code: 0,
    data: {
      totalVisitors: data.totalVisitors,
      todayVisitors: data.todayVisitors,
      uniqueIPs: data.uniqueIPs,
      lastVisitTime: data.lastVisitTime,
      recentVisitors: (data.recentVisitors || []).slice(0, 10)
    }
  });
});


app.post("/api/v1/visitors/checkin", (req: express.Request, res: express.Response) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const data = trackVisitor(ip);
  res.json({ code: 0, data: { message: "ok" } });
});

// 404 处理
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: '请求的接口不存在',
    hint: '可用端点: GET /health, GET /api/v1/ai/models, POST /api/v1/ai/chat/stream, POST /api/v1/ai/chat, POST /api/v1/ai/generate-image, POST /api/v1/ai/tools/:id/use, POST /api/v1/ai/tools/:id/generate-form',
  });
});

// 全局错误处理
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? '服务内部错误' : err.message,
  });
});

// ============ 启动 ============
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║     罗圣纪元 AI Proxy Server v1.0.0          ║
║                                              ║
║     端口: ${PORT}                                ║
║     API:  /api/v1/ai/*                       ║
║                                              ║
║     可用端点:                                 ║
║       GET  /health                           ║
║       GET  /api/v1/ai/models                 ║
║       POST /api/v1/ai/chat/stream  (SSE)     ║
║       POST /api/v1/ai/chat                   ║
║       POST /api/v1/ai/generate-image         ║
║       POST /api/v1/ai/tools/:id/use          ║
║       POST /api/v1/ai/tools/:id/generate-form  ║
╚══════════════════════════════════════════════╝
  `);

  // 检查 API Key 配置状态
  const { SILICONFLOW_API_KEY, ZHIPU_API_KEY, DASHSCOPE_API_KEY } = process.env;
  console.log('提供商 API Key 状态:');
  console.log(`  硅基流动 SiliconFlow: ${SILICONFLOW_API_KEY ? '✓ 已配置' : '✗ 未配置'}`);
  console.log(`  智谱 AI:              ${ZHIPU_API_KEY ? '✓ 已配置' : '✗ 未配置'}`);
  console.log(`  阿里云百炼:           ${DASHSCOPE_API_KEY ? '✓ 已配置' : '✗ 未配置'}`);
  console.log('');
});

export default app;
