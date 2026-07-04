/**
 * HeyGen 数字人 API 代理路由
 * 封装创建视频、查询状态、获取视频 URL 三个核心接口
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../lib/auth');
const { rateLimit } = require('../lib/rate-limit');

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_API_URL = process.env.HEYGEN_API_URL || 'https://api.heygen.com/v2';

// 检查 HeyGen 是否已配置
function checkHeygenConfig(req, res, next) {
  if (!HEYGEN_API_KEY) {
    return res.status(503).json({
      error: '数字人服务暂未配置',
      message: '请联系管理员配置 HEYGEN_API_KEY',
    });
  }
  next();
}

// ── 创建数字人视频任务 ──
router.post('/create', rateLimit, requireAuth, checkHeygenConfig, async (req, res) => {
  try {
    const { text, avatar_id, voice_id, background } = req.body;

    if (!text) {
      return res.status(400).json({ error: '缺少文本内容' });
    }

    const response = await fetch(`${HEYGEN_API_URL}/video/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': HEYGEN_API_KEY,
      },
      body: JSON.stringify({
        test: true, // 测试模式，不消耗额度
        video_inputs: [{
          character: {
            type: 'avatar',
            avatar_id: avatar_id || 'default_male_01',
            avatar_style: 'normal',
          },
          voice: {
            type: 'text',
            input_text: text,
            voice_id: voice_id,
          },
          ...(background ? { background } : {}),
        }],
      }),
    });

    const data = await response.json();

    if (!response.ok || data.code !== 100) {
      return res.status(response.status).json({
        error: data.message || '数字人视频创建失败',
      });
    }

    res.json({
      success: true,
      taskId: data.data?.video_id,
      status: 'processing',
    });
  } catch (err) {
    console.error('[HeyGen] 创建视频异常:', err.message);
    res.status(500).json({ error: '数字人服务连接失败', detail: err.message });
  }
});

// ── 查询视频任务状态 ──
router.get('/status/:taskId', requireAuth, checkHeygenConfig, async (req, res) => {
  try {
    const { taskId } = req.params;

    const response = await fetch(`${HEYGEN_API_URL}/video_status.get?video_id=${taskId}`, {
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: '查询失败' });
    }

    res.json({
      success: true,
      taskId,
      status: data.data?.status, // processing / completed / failed
      videoUrl: data.data?.video_url,
      duration: data.data?.duration,
    });
  } catch (err) {
    res.status(500).json({ error: '查询失败', detail: err.message });
  }
});

// ── 获取可用数字人列表 ──
router.get('/avatars', requireAuth, checkHeygenConfig, async (req, res) => {
  try {
    const response = await fetch(`${HEYGEN_API_URL}/avatar.list`, {
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: '获取头像列表失败' });
    }

    // 返回简化后的头像列表
    const avatars = (data.data?.avatars || []).map(a => ({
      id: a.avatar_id,
      name: a.avatar_name,
      previewUrl: a.preview_image_url,
      gender: a.gender,
    }));

    res.json({ success: true, avatars });
  } catch (err) {
    // 如果 API 调用失败，返回预设列表
    res.json({
      success: true,
      avatars: [
        { id: 'default_male_01', name: '商务精英', gender: 'male' },
        { id: 'default_female_01', name: '职场女性', gender: 'female' },
      ],
    });
  }
});

module.exports = { heygenRouter: router };
