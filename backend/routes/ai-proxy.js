/**
 * 豆包（火山引擎方舟平台）API 代理路由
 * 所有 AI 请求统一经此后端代理，前端不再直接调用火山引擎
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../lib/auth');
const { rateLimit } = require('../lib/rate-limit');

const ARK_API_KEY = process.env.ARK_API_KEY;
const ARK_BASE_URL = process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';
const MODEL_TEXT = process.env.ARK_MODEL_TEXT || 'doubao-seed-2-0-pro-260215';
const MODEL_IMAGE = process.env.ARK_MODEL_IMAGE || 'doubao-seedream-5-0-260128';

// 检查 API Key 是否已配置
function checkArkKey(req, res, next) {
  if (!ARK_API_KEY || ARK_API_KEY.startsWith('ark-xxx')) {
    return res.status(503).json({
      error: 'AI 服务暂未配置',
      message: '请联系管理员配置 ARK_API_KEY',
    });
  }
  next();
}

// ── 文本生成代理 ──
router.post('/text', rateLimit, requireAuth, checkArkKey, async (req, res) => {
  try {
    const { prompt, system, max_tokens, temperature } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: '缺少 prompt 参数' });
    }

    const response = await fetch(`${ARK_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_TEXT,
        input: {
          messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            { role: 'user', content: prompt },
          ],
        },
        max_output_tokens: max_tokens || 4000,
        temperature: temperature || 0.9,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[AI] 文本生成失败:', response.status, JSON.stringify(data));
      return res.status(response.status).json({
        error: data.error?.message || 'AI 服务异常',
        code: data.error?.code,
      });
    }

    // 提取文本内容
    let text = '';
    if (data.output?.choices?.[0]?.message?.content) {
      text = data.output.choices[0].message.content;
    } else if (data.choices?.[0]?.message?.content) {
      text = data.choices[0].message.content;
    }

    res.json({ success: true, text, usage: data.usage });
  } catch (err) {
    console.error('[AI] 文本生成异常:', err.message);
    res.status(500).json({ error: 'AI 服务连接失败', detail: err.message });
  }
});

// ── 图片生成代理 ──
router.post('/image', rateLimit, requireAuth, checkArkKey, async (req, res) => {
  try {
    const { prompt, size, n } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: '缺少 prompt 参数' });
    }

    const response = await fetch(`${ARK_BASE_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_IMAGE,
        prompt,
        n: n || 1,
        size: size || '1024x1024',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[AI] 图片生成失败:', response.status, JSON.stringify(data));
      return res.status(response.status).json({
        error: data.error?.message || 'AI 图片服务异常',
      });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('[AI] 图片生成异常:', err.message);
    res.status(500).json({ error: 'AI 图片服务连接失败', detail: err.message });
  }
});

// ── 通用 AI 代理（兼容前端的 doGenericAI 调用）──
router.post('/generic', rateLimit, requireAuth, checkArkKey, async (req, res) => {
  try {
    const { prompt, system, tool } = req.body;

    // 根据不同工具设置不同 system prompt
    const toolPrompts = {
      article: '你是专业的长文写作助手，擅长撰写深度文章。文章结构清晰，逻辑严谨，语言流畅。',
      email: '你是专业的邮件撰写助手，根据用户提供的信息生成得体的商务/个人邮件。',
      resume: '你是专业的简历生成助手，生成结构清晰、重点突出的简历内容。',
      proposal: '你是方案撰写专家，擅长生成商业方案、项目计划等专业文档。',
      poetry: '你是诗词创作大师，擅长古诗词和现代诗歌创作。',
      novel: '你是小说创作助手，擅长各种类型小说的续写和创作。',
      slogan: '你是品牌营销专家，擅长创作简短有力、朗朗上口的广告语和品牌口号。',
      summarize: '你是内容摘要专家，能精准提取文本核心要点。',
      commentReply: '你是社媒运营专家，擅长撰写有吸引力的评论回复。',
      productDesc: '你是电商文案专家，擅长撰写吸引人的商品描述。',
      adCopy: '你是广告文案专家，擅长撰写高转化率的广告文案。',
      liveScript: '你是直播运营专家，擅长撰写直播话术和脚本。',
      seoKeywords: '你是 SEO 专家，擅长关键词分析和优化建议。',
      titleGen: '你是自媒体标题专家，擅长创作高点击率的标题。',
      socialPost: '你是社媒文案专家，擅长各平台的内容创作。',
      brandStory: '你是品牌策划专家，擅长讲述动人的品牌故事。',
      videoSrt: '你是视频字幕生成专家，根据视频内容生成精准字幕。',
      videoSum: '你是视频内容分析师，擅长视频内容总结。',
      videoTag: '你是视频运营专家，擅长视频标签优化。',
      soundEffect: '你是音效设计师，擅长描述和生成音效方案。',
      musicGen: '你是音乐创作助手，擅长描述音乐风格和创作方案。',
      podcast: '你是播客制作专家，擅长撰写播客脚本。',
      ringtone: '你是铃声设计专家，擅长描述铃声风格。',
      pptOutline: '你是 PPT 制作专家，擅长生成结构清晰的演示大纲。',
      meetingNotes: '你是会议纪要专家，擅长整理结构化的会议记录。',
      translater: '你是专业翻译，翻译准确流畅，保持原文风格。',
      proofread: '你是文字校对专家，能精准发现并修正文本中的错误。',
      mindMap: '你是思维导图专家，擅长将信息组织为结构化的思维导图格式。',
      excelFormula: '你是 Excel 公式专家，擅长生成复杂公式。',
      codeHelper: '你是编程助手，擅长多种编程语言的代码生成和调试。',
      contract: '你是法律文书专家，擅长生成规范的合同文本。',
      report: '你是报告撰写专家，擅长生成结构化的工作报告。',
    };

    const systemPrompt = system || toolPrompts[tool] || '你是罗圣纪元平台的 AI 助手，擅长各类内容创作。';
    const maxTokens = tool === 'novel' || tool === 'article' ? 8000 : 4000;

    const response = await fetch(`${ARK_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_TEXT,
        input: {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
        },
        max_output_tokens: maxTokens,
        temperature: 0.9,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || 'AI 服务异常',
      });
    }

    let text = '';
    if (data.output?.choices?.[0]?.message?.content) {
      text = data.output.choices[0].message.content;
    } else if (data.choices?.[0]?.message?.content) {
      text = data.choices[0].message.content;
    }

    res.json({ success: true, text, tool, usage: data.usage });
  } catch (err) {
    console.error('[AI] 通用生成异常:', err.message);
    res.status(500).json({ error: 'AI 服务连接失败', detail: err.message });
  }
});

// ── 简单分类/短回复（如标题生成、标签生成，使用小模型提高速度）──
router.post('/quick', rateLimit, requireAuth, checkArkKey, async (req, res) => {
  try {
    const { prompt, system } = req.body;

    const response = await fetch(`${ARK_BASE_URL}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_TEXT,
        input: {
          messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            { role: 'user', content: prompt },
          ],
        },
        max_output_tokens: 1000,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'AI 服务异常' });
    }

    let text = '';
    if (data.output?.choices?.[0]?.message?.content) {
      text = data.output.choices[0].message.content;
    } else if (data.choices?.[0]?.message?.content) {
      text = data.choices[0].message.content;
    }

    res.json({ success: true, text });
  } catch (err) {
    res.status(500).json({ error: 'AI 服务连接失败' });
  }
});

module.exports = { aiProxyRouter: router };
