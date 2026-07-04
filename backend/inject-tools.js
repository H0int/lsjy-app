const fs = require('fs');
const toolsData = JSON.parse(fs.readFileSync('c:\\Users\\罗凯中\\.trae-cn\\work\\6a488f98714b4cac34bc2d00\\tools-data.json', 'utf8'));

let content = fs.readFileSync('routes/admin.js', 'utf8');

const categoriesCode = JSON.stringify(toolsData.categories);
const toolsCode = JSON.stringify(toolsData.tools);

const injectCode = `
// AI Tools & Categories API
const toolCategories = ${categoriesCode};
const allTools = ${toolsCode};

router.get('/ai/categories', (req, res) => {
  const cats = toolCategories.map(c => ({
    id: c.id, name: c.name, slug: c.slug, module: c.module,
    icon: c.icon, description: c.description,
    toolCount: allTools.filter(t => t.categoryId === c.id).length,
  }));
  res.json({ code: 0, message: 'success', data: cats });
});

router.get('/ai/categories/:id', (req, res) => {
  const cat = toolCategories.find(c => c.id === parseInt(req.params.id));
  if (!cat) return res.status(404).json({ code: 1, message: 'not found' });
  res.json({ code: 0, message: 'success', data: { ...cat, toolCount: allTools.filter(t => t.categoryId === cat.id).length } });
});

router.get('/ai/tools', (req, res) => {
  const { categoryId, toolType, page = 1, pageSize = 200, keyword } = req.query;
  let filtered = [...allTools];
  if (categoryId) filtered = filtered.filter(t => t.categoryId === parseInt(categoryId));
  if (toolType) filtered = filtered.filter(t => t.toolType === toolType);
  if (keyword) filtered = filtered.filter(t => t.name.includes(keyword) || (t.description && t.description.includes(keyword)));
  const total = filtered.length;
  const start = (parseInt(page) - 1) * parseInt(pageSize);
  const items = filtered.slice(start, start + parseInt(pageSize));
  res.json({ code: 0, message: 'success', data: { total, page: parseInt(page), pageSize: parseInt(pageSize), items } });
});

router.get('/ai/tools/:id', (req, res) => {
  const tool = allTools.find(t => t.id === parseInt(req.params.id));
  if (!tool) return res.status(404).json({ code: 1, message: 'not found' });
  const cat = toolCategories.find(c => c.id === tool.categoryId);
  res.json({ code: 0, message: 'success', data: { ...tool, category: cat || null } });
});

router.post('/ai/tools/:id/call', requireAuth, (req, res) => {
  const tool = allTools.find(t => t.id === parseInt(req.params.id));
  if (!tool) return res.status(404).json({ code: 1, message: 'not found' });
  res.json({ code: 0, message: 'success', data: { toolId: tool.id, toolName: tool.name, status: 'active' } });
});

router.post('/ai/tools/:id/chat', requireAuth, async (req, res) => {
  const tool = allTools.find(t => t.id === parseInt(req.params.id));
  if (!tool) return res.status(404).json({ code: 1, message: 'not found' });
  const { messages, model, temperature, maxTokens, systemPrompt } = req.body;
  const ARK_API_KEY = process.env.ARK_API_KEY;
  const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  const MODEL = model || process.env.ARK_MODEL_TEXT || 'doubao-seed-2-0-pro-260215';
  if (!ARK_API_KEY) return res.status(503).json({ code: 1, message: 'AI service not configured' });
  try {
    const sysPrompt = systemPrompt || tool.systemPrompt || 'You are a professional AI assistant.';
    const apiMessages = [{ role: 'system', content: sysPrompt }, ...messages.map(m => ({ role: m.role, content: m.content }))];
    const response = await fetch(ARK_BASE_URL + '/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ARK_API_KEY },
      body: JSON.stringify({ model: MODEL, messages: apiMessages, max_tokens: maxTokens || 4000, temperature: temperature || 0.9 }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ code: 1, message: data.error?.message || 'AI error' });
    const text = data.choices?.[0]?.message?.content || data.output?.choices?.[0]?.message?.content || '';
    res.json({ code: 0, message: 'success', data: { id: Date.now(), toolId: tool.id, toolName: tool.name, content: text, usage: data.usage, model: MODEL } });
  } catch (err) { res.status(500).json({ code: 1, message: 'AI connection failed: ' + err.message }); }
});

router.post('/ai/tools/:id/generate', requireAuth, async (req, res) => {
  const tool = allTools.find(t => t.id === parseInt(req.params.id));
  if (!tool) return res.status(404).json({ code: 1, message: 'not found' });
  const { prompt } = req.body;
  const ARK_API_KEY = process.env.ARK_API_KEY;
  const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
  const MODEL = process.env.ARK_MODEL_IMAGE || 'doubao-seedream-5-0-260128';
  if (!ARK_API_KEY) return res.status(503).json({ code: 1, message: 'AI service not configured' });
  try {
    const response = await fetch(ARK_BASE_URL + '/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + ARK_API_KEY },
      body: JSON.stringify({ model: MODEL, prompt, n: 1, size: '1024x1024' }),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ code: 1, message: data.error?.message || 'Image gen failed' });
    const imageUrl = data.data?.[0]?.url || data.data?.[0]?.b64_json || '';
    res.json({ code: 0, message: 'success', data: { id: Date.now(), toolId: tool.id, toolName: tool.name, imageUrl, prompt } });
  } catch (err) { res.status(500).json({ code: 1, message: 'Image service failed: ' + err.message }); }
});

`;

content = content.replace("module.exports = { adminRouter: router };", injectCode + "module.exports = { adminRouter: router };");
fs.writeFileSync('routes/admin.js', content, 'utf8');
console.log('Done! Categories:', toolsData.categories.length, 'Tools:', toolsData.tools.length);
