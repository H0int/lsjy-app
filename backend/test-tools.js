/**
 * 罗圣纪元平台 - Playwright 自动化测试
 * 批量验证 100 个工具的可用性
 * 
 * 用法：
 *   npx playwright install chromium   # 首次运行需安装浏览器
 *   node test-tools.js                # 运行全部测试
 *   node test-tools.js --group=P0     # 仅测试 P0 工具
 *   node test-tools.js --module=AI    # 仅测试 AI 模块
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ── 工具定义 ──
const TOOLS = [
  // AI 人工智能 (30)
  { id: 'copywriter', name: 'AI文案创作', module: 'AI人工智能', priority: 'P0', type: 'ai' },
  { id: 'rewrite', name: '文案改写', module: 'AI人工智能', priority: 'P1', type: 'ai' },
  { id: 'article', name: 'AI长文写作', module: 'AI人工智能', priority: 'P1', type: 'ai' },
  { id: 'email', name: 'AI邮件生成', module: 'AI人工智能', priority: 'P1', type: 'ai' },
  { id: 'resume', name: 'AI简历生成', module: 'AI人工智能', priority: 'P1', type: 'ai' },
  { id: 'proposal', name: 'AI方案撰写', module: 'AI人工智能', priority: 'P1', type: 'ai' },
  { id: 'poetry', name: 'AI诗歌创作', module: 'AI人工智能', priority: 'P1', type: 'ai' },
  { id: 'novel', name: 'AI小说续写', module: 'AI人工智能', priority: 'P1', type: 'ai' },
  { id: 'slogan', name: 'AI广告语', module: 'AI人工智能', priority: 'P1', type: 'ai' },
  { id: 'summarize', name: 'AI摘要提取', module: 'AI人工智能', priority: 'P1', type: 'ai' },
  { id: 'text2img', name: 'AI文生图', module: 'AI人工智能', priority: 'P0', type: 'ai-image' },
  { id: 'img2img', name: 'AI图生图', module: 'AI人工智能', priority: 'P0', type: 'ai-image' },
  { id: 'removeBg', name: 'AI抠图去背', module: 'AI人工智能', priority: 'P1', type: 'ai-image' },
  { id: 'upscale', name: 'AI超分辨率', module: 'AI人工智能', priority: 'P1', type: 'ai-image' },
  { id: 'aigc', name: '智能文生图', module: 'AI人工智能', priority: 'P0', type: 'ai-image' },
  { id: 'colorize', name: 'AI老照片上色', module: 'AI人工智能', priority: 'P2', type: 'ai-image' },
  { id: 'sketch', name: 'AI线稿生成', module: 'AI人工智能', priority: 'P2', type: 'ai-image' },
  { id: 'voiceClone', name: '音色克隆', module: 'AI人工智能', priority: 'P2', type: 'ai-audio' },
  { id: 'audioEdit', name: 'AI智能修音', module: 'AI人工智能', priority: 'P2', type: 'ai-audio' },
  { id: 'soundEffect', name: 'AI音效生成', module: 'AI人工智能', priority: 'P2', type: 'ai-audio' },
  { id: 'musicGen', name: 'AI音乐生成', module: 'AI人工智能', priority: 'P2', type: 'ai-audio' },
  { id: 'speech2text', name: '语音转文字', module: 'AI人工智能', priority: 'P0', type: 'local' },
  { id: 'audioMerge', name: '音频拼接', module: 'AI人工智能', priority: 'P2', type: 'local' },
  { id: 'audioSplit', name: '音频分割', module: 'AI人工智能', priority: 'P2', type: 'local' },
  { id: 'podcast', name: '播客脚本', module: 'AI人工智能', priority: 'P1', type: 'ai' },
  { id: 'ringtone', name: '铃声制作', module: 'AI人工智能', priority: 'P2', type: 'ai' },
  { id: 'translater', name: 'AI翻译', module: 'AI人工智能', priority: 'P1', type: 'ai' },
  { id: 'proofread', name: 'AI校对', module: 'AI人工智能', priority: 'P1', type: 'ai' },
  { id: 'mindMap', name: '思维导图', module: 'AI人工智能', priority: 'P1', type: 'ai' },
  { id: 'codeHelper', name: 'AI代码助手', module: 'AI人工智能', priority: 'P1', type: 'ai' },
  { id: 'report', name: '报告生成', module: 'AI人工智能', priority: 'P1', type: 'ai' },

  // 自媒体 (24)
  { id: 'hashtag', name: '热门标签', module: '自媒体', priority: 'P1', type: 'ai' },
  { id: 'viralVideo', name: '爆款脚本', module: '自媒体', priority: 'P1', type: 'ai' },
  { id: 'commentReply', name: '评论回复', module: '自媒体', priority: 'P1', type: 'ai' },
  { id: 'adCopy', name: '广告文案', module: '自媒体', priority: 'P1', type: 'ai' },
  { id: 'liveScript', name: '直播话术', module: '自媒体', priority: 'P1', type: 'ai' },
  { id: 'titleGen', name: '爆款标题', module: '自媒体', priority: 'P1', type: 'ai' },
  { id: 'socialPost', name: '社媒文案', module: '自媒体', priority: 'P1', type: 'ai' },
  { id: 'brandStory', name: '品牌故事', module: '自媒体', priority: 'P1', type: 'ai' },
  { id: 'photoEdit', name: 'AI智能修图', module: '自媒体', priority: 'P1', type: 'local' },
  { id: 'avatar', name: 'AI头像生成', module: '自媒体', priority: 'P1', type: 'ai-image' },
  { id: 'poster', name: 'AI海报生成', module: '自媒体', priority: 'P1', type: 'ai-image' },
  { id: 'digitalHuman', name: '数字人口播', module: '自媒体', priority: 'P2', type: 'heygen' },
  { id: 'videoClip', name: 'AI视频剪辑', module: '自媒体', priority: 'P2', type: 'local' },
  { id: 'img2video', name: 'AI图生视频', module: '自媒体', priority: 'P2', type: 'ai' },
  { id: 'videoParse', name: '短视频解析', module: '自媒体', priority: 'P2', type: 'external' },
  { id: 'videoSrt', name: 'AI字幕生成', module: '自媒体', priority: 'P2', type: 'ai' },
  { id: 'videoSum', name: '视频摘要', module: '自媒体', priority: 'P2', type: 'ai' },
  { id: 'videoTag', name: '视频标签', module: '自媒体', priority: 'P2', type: 'ai' },
  { id: 'videoCover', name: '封面提取', module: '自媒体', priority: 'P2', type: 'ai-image' },
  { id: 'videoReverse', name: '视频倒放', module: '自媒体', priority: 'P2', type: 'local' },
  { id: 'videoGif', name: '视频转GIF', module: '自媒体', priority: 'P2', type: 'local' },
  { id: 'docGen', name: '智能图文表格', module: '自媒体', priority: 'P1', type: 'ai' },
  { id: 'pptOutline', name: 'PPT大纲', module: '自媒体', priority: 'P1', type: 'ai' },
  { id: 'productDesc', name: '商品文案', module: '电商', priority: 'P1', type: 'ai' },
  { id: 'seoKeywords', name: 'SEO关键词', module: '电商', priority: 'P1', type: 'ai' },

  // 电商 (12)
  { id: 'meetingNotes', name: '会议纪要', module: '电商', priority: 'P2', type: 'ai' },
  { id: 'contract', name: '合同生成', module: '电商', priority: 'P2', type: 'ai' },
  { id: 'qrCode', name: '二维码生成', module: '电商', priority: 'P2', type: 'local' },
  { id: 'qrParse', name: '二维码识别', module: '电商', priority: 'P2', type: 'local' },
  { id: 'shortUrl', name: '短链接生成', module: '电商', priority: 'P2', type: 'external' },
  { id: 'imgCompress', name: '图片压缩', module: '电商', priority: 'P2', type: 'local' },
  { id: 'imgFormat', name: '格式转换', module: '电商', priority: 'P2', type: 'local' },
  { id: 'imgCrop', name: '图片裁剪', module: '电商', priority: 'P2', type: 'local' },
  { id: 'imgWatermark', name: '文字水印', module: '电商', priority: 'P2', type: 'local' },
  { id: 'imgOcr', name: 'OCR识别', module: '电商', priority: 'P2', type: 'ai' },

  // 伯雅校园 (17)
  { id: 'colorPicker', name: '颜色拾取器', module: '伯雅校园', priority: 'P2', type: 'local' },
  { id: 'unitConvert', name: '单位换算', module: '伯雅校园', priority: 'P2', type: 'local' },
  { id: 'tsConvert', name: '时间戳转换', module: '伯雅校园', priority: 'P2', type: 'local' },
  { id: 'base64Code', name: 'Base64编解码', module: '伯雅校园', priority: 'P2', type: 'local' },
  { id: 'jsonFormat', name: 'JSON格式化', module: '伯雅校园', priority: 'P2', type: 'local' },
  { id: 'pwdGen', name: '密码生成器', module: '伯雅校园', priority: 'P2', type: 'local' },
  { id: 'ipLookup', name: 'IP归属查询', module: '伯雅校园', priority: 'P2', type: 'external' },
  { id: 'weather', name: '天气查询', module: '伯雅校园', priority: 'P2', type: 'external' },
  { id: 'dailyNews', name: '每日新闻', module: '伯雅校园', priority: 'P2', type: 'external' },
  { id: 'joke', name: '笑话生成', module: '伯雅校园', priority: 'P2', type: 'external' },
  { id: 'horoscope', name: '星座运势', module: '伯雅校园', priority: 'P2', type: 'external' },
  { id: 'calendar', name: '万年历', module: '伯雅校园', priority: 'P2', type: 'local' },
  { id: 'countdown', name: '倒计时', module: '伯雅校园', priority: 'P2', type: 'local' },
  { id: 'bmiCalc', name: 'BMI计算器', module: '伯雅校园', priority: 'P2', type: 'local' },
  { id: 'loanCalc', name: '贷款计算器', module: '伯雅校园', priority: 'P2', type: 'local' },
  { id: 'historyToday', name: '历史上的今天', module: '伯雅校园', priority: 'P2', type: 'external' },
  { id: 'idiomDict', name: '成语词典', module: '伯雅校园', priority: 'P2', type: 'local' },

  // 教育 (12)
  { id: 'excelFormula', name: 'Excel公式', module: '教育', priority: 'P2', type: 'ai' },
  { id: 'wordCount', name: '字数统计', module: '教育', priority: 'P2', type: 'local' },
  { id: 'diffText', name: '文本对比', module: '教育', priority: 'P2', type: 'local' },
  { id: 'mdEditor', name: 'Markdown编辑器', module: '教育', priority: 'P2', type: 'local' },
  { id: 'credits', name: '算力中心', module: '教育', priority: 'P2', type: 'local' },
  { id: 'redeemCode', name: '卡密兑换', module: '教育', priority: 'P2', type: 'local' },
  { id: 'creditLogs', name: '算力记录', module: '教育', priority: 'P2', type: 'local' },
  { id: 'knowledgeBase', name: '知识库', module: '教育', priority: 'P2', type: 'local' },
  { id: 'taskCenter', name: 'AI任务中心', module: '教育', priority: 'P2', type: 'local' },
  { id: 'dataBackup', name: '数据备份', module: '教育', priority: 'P2', type: 'local' },
  { id: 'dataExport', name: '数据导出', module: '教育', priority: 'P2', type: 'local' },
  { id: 'dataClean', name: '数据清理', module: '教育', priority: 'P2', type: 'local' },

  // 宠物 (5)
  { id: 'hashGen', name: '哈希生成', module: '宠物', priority: 'P2', type: 'local' },
  { id: 'nameGen', name: '随机取名', module: '宠物', priority: 'P2', type: 'ai' },
  { id: 'employeeAcct', name: '员工账号', module: '宠物', priority: 'P2', type: 'local' },
  { id: 'videoLib', name: '作品库', module: '宠物', priority: 'P2', type: 'local' },
  { id: 'accompaniment', name: 'AI智能伴奏', module: '宠物', priority: 'P2', type: 'ai' },
];

// ── 测试配置 ──
const BASE_URL = 'https://h0int.github.io/lsjy-app';
const ADMIN_URL = 'https://h0int.github.io/lsjy-app/admin';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// ── 测试结果收集 ──
const results = [];

/**
 * 测试单个工具：打开页面 → 点击工具 → 检查渲染
 */
async function testTool(page, tool) {
  const startTime = Date.now();
  const result = {
    ...tool,
    status: 'pass',
    loadTime: 0,
    error: '',
    screenshot: '',
  };

  try {
    // 导航到首页（如果不是首页）
    if (!page.url().includes('lsjy-app') || page.url().includes('admin')) {
      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
    }

    // 查找工具卡片
    const card = page.locator(`.tool-card[onclick*="openTool('${tool.id}'"]`);
    if (await card.count() === 0) {
      result.status = 'fail';
      result.error = '工具卡片未找到';
      return result;
    }

    // 滚动到工具卡片可见
    await card.scrollIntoViewIfNeeded({ timeout: 3000 });
    await page.waitForTimeout(300);

    // 点击工具卡片
    await card.click({ timeout: 3000 });
    await page.waitForTimeout(1500);

    // 检查工具面板是否打开
    const toolPanel = page.locator('#toolPanel, .tool-panel, #tp');
    if (await toolPanel.count() === 0) {
      result.status = 'fail';
      result.error = '工具面板未打开';
      return result;
    }

    // 检查面板内容是否渲染
    const panelVisible = await toolPanel.isVisible();
    if (!panelVisible) {
      result.status = 'fail';
      result.error = '工具面板不可见';
      return result;
    }

    // 检查是否有交互元素（输入框、按钮等）
    const inputs = await page.locator('#toolPanel input, #toolPanel textarea, #toolPanel select').count();
    const buttons = await page.locator('#toolPanel button').count();
    const contentText = await toolPanel.textContent();

    if (inputs === 0 && buttons === 0 && (!contentText || contentText.length < 10)) {
      result.status = 'fail';
      result.error = '工具面板内容为空';
      return result;
    }

    result.inputs = inputs;
    result.buttons = buttons;
    result.contentLength = contentText?.length || 0;

    // 截图
    const screenshotPath = path.join(SCREENSHOT_DIR, `${tool.id}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    result.screenshot = screenshotPath;

  } catch (err) {
    result.status = 'fail';
    result.error = err.message?.substring(0, 200) || '未知错误';
  } finally {
    result.loadTime = Date.now() - startTime;

    // 尝试关闭工具面板
    try {
      const closeBtn = page.locator('#toolPanel .close-btn, #toolPanel [onclick*="closeTool"], .overlay');
      if (await closeBtn.count() > 0) {
        await closeBtn.first().click({ timeout: 1000 });
      }
    } catch {}

    await page.waitForTimeout(300);
  }

  return result;
}

/**
 * 测试后台管理系统
 */
async function testAdmin(page) {
  const adminResults = [];
  try {
    await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 截图首页
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-home.png') });
    adminResults.push({ page: '首页', status: 'pass' });

    // 检查登录表单
    const loginForm = page.locator('#loginForm, .login-form');
    if (await loginForm.count() > 0) {
      adminResults.push({ page: '登录表单', status: 'pass' });
    } else {
      adminResults.push({ page: '登录表单', status: 'fail', error: '未找到登录表单' });
    }

    // 检查是否有硬编码密钥警告
    const pageText = await page.textContent('body');
    if (pageText.includes('ARK_API_KEY') || pageText.includes('ark-0eab')) {
      adminResults.push({ page: '安全检查', status: 'warn', error: '前端代码中仍含硬编码 API Key' });
    }

  } catch (err) {
    adminResults.push({ page: '后台首页', status: 'fail', error: err.message });
  }
  return adminResults;
}

/**
 * 生成 HTML 测试报告
 */
function generateReport(toolResults, adminResults) {
  const pass = toolResults.filter(r => r.status === 'pass').length;
  const fail = toolResults.filter(r => r.status === 'fail').length;
  const total = toolResults.length;

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>罗圣纪元平台 - 自动化测试报告</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Microsoft YaHei', sans-serif; background: #f5f7fa; padding: 20px; }
  .header { background: linear-gradient(135deg, #1a3a5c, #2b579a); color: white; padding: 30px; border-radius: 12px; margin-bottom: 24px; }
  .header h1 { font-size: 28px; margin-bottom: 8px; }
  .header p { opacity: 0.8; }
  .stats { display: flex; gap: 16px; margin-bottom: 24px; }
  .stat-card { background: white; padding: 20px; border-radius: 10px; flex: 1; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .stat-card .num { font-size: 36px; font-weight: bold; }
  .stat-card .label { color: #666; margin-top: 4px; }
  .stat-card.pass .num { color: #22c55e; }
  .stat-card.fail .num { color: #ef4444; }
  .stat-card.total .num { color: #3b82f6; }
  .table-wrap { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f8fafc; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0; }
  td { padding: 10px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
  tr:hover { background: #f8fafc; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; }
  .badge-pass { background: #dcfce7; color: #166534; }
  .badge-fail { background: #fee2e2; color: #991b1b; }
  .badge-P0 { background: #fee2e2; color: #991b1b; }
  .badge-P1 { background: #fef3c7; color: #92400e; }
  .badge-P2 { background: #f0fdf4; color: #166534; }
  .error { color: #ef4444; font-size: 12px; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .time { color: #64748b; font-size: 12px; }
  .section-title { font-size: 20px; font-weight: bold; margin: 24px 0 12px; color: #1e293b; }
  .screenshots { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-top: 12px; }
  .screenshot { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
  .screenshot img { width: 100%; height: 150px; object-fit: cover; }
  .screenshot .name { padding: 8px; font-size: 12px; background: white; }
  .filter-bar { display: flex; gap: 8px; margin-bottom: 16px; }
  .filter-btn { padding: 6px 16px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; cursor: pointer; font-size: 13px; }
  .filter-btn.active { background: #1a3a5c; color: white; border-color: #1a3a5c; }
</style>
</head>
<body>
  <div class="header">
    <h1>罗圣纪元平台 - 自动化测试报告</h1>
    <p>测试时间: ${new Date().toLocaleString('zh-CN')} | 测试地址: ${BASE_URL}</p>
  </div>

  <div class="stats">
    <div class="stat-card total"><div class="num">${total}</div><div class="label">总测试数</div></div>
    <div class="stat-card pass"><div class="num">${pass}</div><div class="label">通过</div></div>
    <div class="stat-card fail"><div class="num">${fail}</div><div class="label">失败</div></div>
    <div class="stat-card total"><div class="num">${(pass/total*100).toFixed(1)}%</div><div class="label">通过率</div></div>
  </div>

  <div class="filter-bar">
    <button class="filter-btn active" onclick="filter('all')">全部</button>
    <button class="filter-btn" onclick="filter('pass')">通过 (${pass})</button>
    <button class="filter-btn" onclick="filter('fail')">失败 (${fail})</button>
    <button class="filter-btn" onclick="filter('P0')">P0 核心</button>
    <button class="filter-btn" onclick="filter('P1')">P1 重要</button>
  </div>

  <div class="table-wrap">
    <table>
      <thead>
        <tr><th>模块</th><th>工具 ID</th><th>工具名称</th><th>优先级</th><th>状态</th><th>加载时间</th><th>错误信息</th></tr>
      </thead>
      <tbody>
        ${toolResults.map(r => `
        <tr data-status="${r.status}" data-priority="${r.priority}">
          <td>${r.module}</td>
          <td><code>${r.id}</code></td>
          <td>${r.name}</td>
          <td><span class="badge badge-${r.priority}">${r.priority}</span></td>
          <td><span class="badge badge-${r.status}">${r.status === 'pass' ? '通过' : '失败'}</span></td>
          <td class="time">${r.loadTime}ms</td>
          <td class="error" title="${(r.error || '').replace(/"/g, '&quot;')}">${r.error || '-'}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  ${adminResults.length > 0 ? `
  <h2 class="section-title">后台管理系统测试</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th>页面</th><th>状态</th><th>备注</th></tr></thead>
      <tbody>
        ${adminResults.map(r => `
        <tr>
          <td>${r.page}</td>
          <td><span class="badge badge-${r.status}">${r.status === 'pass' ? '通过' : (r.status === 'warn' ? '警告' : '失败')}</span></td>
          <td>${r.error || '-'}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}

  <script>
    function filter(type) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      document.querySelectorAll('tbody tr').forEach(tr => {
        const status = tr.dataset.status;
        const priority = tr.dataset.priority;
        if (type === 'all') tr.style.display = '';
        else if (type === 'pass' || type === 'fail') tr.style.display = status === type ? '' : 'none';
        else tr.style.display = priority === type ? '' : 'none';
      });
    }
  </script>
</body>
</html>`;

  const reportPath = path.join(__dirname, 'test-report.html');
  fs.writeFileSync(reportPath, html, 'utf-8');
  return reportPath;
}

// ── 主函数 ──
async function main() {
  // 解析命令行参数
  const args = process.argv.slice(2);
  const groupFilter = args.find(a => a.startsWith('--group='))?.split('=')[1];
  const moduleFilter = args.find(a => a.startsWith('--module='))?.split('=')[1];

  let toolsToTest = [...TOOLS];
  if (groupFilter) {
    toolsToTest = toolsToTest.filter(t => t.priority === groupFilter);
  }
  if (moduleFilter) {
    toolsToTest = toolsToTest.filter(t => t.module.includes(moduleFilter));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  罗圣纪元平台 - Playwright 自动化测试`);
  console.log(`  测试工具数: ${toolsToTest.length} / ${TOOLS.length}`);
  console.log(`  测试地址: ${BASE_URL}`);
  console.log(`${'='.repeat(60)}\n`);

  // 创建截图目录
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  // 启动浏览器
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
  });
  const page = await context.newPage();

  // 静默 console.error
  page.on('console', msg => {
    if (msg.type() === 'error') return; // 静默
  });

  const toolResults = [];

  // 先导航到首页
  try {
    console.log('正在加载首页...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log(`首页加载完成: ${page.url()}\n`);
  } catch (err) {
    console.error(`首页加载失败: ${err.message}`);
    console.log('尝试使用备用地址...\n');
    try {
      await page.goto('https://h0int.github.io/lsjy-app/', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000);
    } catch {
      console.error('备用地址也加载失败，终止测试');
      await browser.close();
      return;
    }
  }

  // 逐个测试工具
  for (let i = 0; i < toolsToTest.length; i++) {
    const tool = toolsToTest[i];
    const num = String(i + 1).padStart(3, ' ');
    process.stdout.write(`[${num}/${toolsToTest.length}] ${tool.id}... `);

    const result = await testTool(page, tool);
    toolResults.push(result);

    if (result.status === 'pass') {
      console.log(`PASS (${result.loadTime}ms)`);
    } else {
      console.log(`FAIL - ${result.error}`);
    }
  }

  // 测试后台
  console.log('\n正在测试后台管理系统...');
  const adminResults = await testAdmin(page);
  adminResults.forEach(r => {
    console.log(`  ${r.page}: ${r.status === 'pass' ? 'PASS' : r.status === 'warn' ? 'WARN' : 'FAIL'} ${r.error || ''}`);
  });

  // 关闭浏览器
  await browser.close();

  // 生成报告
  console.log('\n正在生成测试报告...');
  const reportPath = generateReport(toolResults, adminResults);

  // 输出汇总
  const pass = toolResults.filter(r => r.status === 'pass').length;
  const fail = toolResults.filter(r => r.status === 'fail').length;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  测试完成`);
  console.log(`  总计: ${toolResults.length} | 通过: ${pass} | 失败: ${fail} | 通过率: ${(pass / toolResults.length * 100).toFixed(1)}%`);
  console.log(`  报告: ${reportPath}`);
  console.log(`  截图: ${SCREENSHOT_DIR}`);
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(err => {
  console.error('测试运行失败:', err);
  process.exit(1);
});
