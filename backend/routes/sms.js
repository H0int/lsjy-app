/**
 * 短信验证码服务路由
 * 对接阿里云短信服务
 */

const express = require('express');
const router = express.Router();
const { checkRateLimit, setCode, verifyCode } = require('../lib/cache');

const SMS_ACCESS_KEY_ID = process.env.SMS_ACCESS_KEY_ID;
const SMS_ACCESS_KEY_SECRET = process.env.SMS_ACCESS_KEY_SECRET;
const SMS_SIGN_NAME = process.env.SMS_SIGN_NAME;
const SMS_TEMPLATE_CODE = process.env.SMS_TEMPLATE_CODE;
const CODE_EXPIRE = parseInt(process.env.SMS_CODE_EXPIRE) || 300;

/**
 * 生成 6 位数字验证码
 */
function generateCode() {
  return Math.random().toString().slice(2, 8);
}

/**
 * 检查短信服务是否已配置
 */
function checkSmsConfig(req, res, next) {
  if (!SMS_ACCESS_KEY_ID || !SMS_ACCESS_KEY_SECRET || !SMS_SIGN_NAME || !SMS_TEMPLATE_CODE) {
    return res.status(503).json({
      error: '短信服务暂未配置',
      message: '请联系管理员配置阿里云短信服务凭证',
    });
  }
  next();
}

// ── 发送短信验证码 ──
router.post('/send', checkSmsConfig, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ error: '请输入正确的手机号码' });
    }

    // 频率限制（60 秒内不可重复发送）
    const rateLimited = await checkRateLimit(phone);
    if (rateLimited) {
      return res.status(429).json({
        error: '发送过于频繁，请 60 秒后重试',
        retryAfter: 60,
      });
    }

    // 生成验证码
    const code = generateCode();

    // 调用阿里云短信 API
    const AlicloudSms = require('@alicloud/dysmsapi20170525');
    const OpenApi = require('@alicloud/openapi-client');
    const Config = new OpenApi.Config({
      accessKeyId: SMS_ACCESS_KEY_ID,
      accessKeySecret: SMS_ACCESS_KEY_SECRET,
      endpoint: 'dysmsapi.aliyuncs.com',
    });
    const client = new AlicloudSms.default(new Config);

    const sendResult = await client.sendSms(new AlicloudSms.SendSmsRequest({
      phoneNumbers: phone,
      signName: SMS_SIGN_NAME,
      templateCode: SMS_TEMPLATE_CODE,
      templateParam: JSON.stringify({ code }),
    }));

    if (sendResult.body?.code !== 'OK') {
      console.error('[SMS] 发送失败:', JSON.stringify(sendResult.body));
      return res.status(500).json({
        error: '短信发送失败',
        detail: sendResult.body?.message,
      });
    }

    // 存储验证码
    await setCode(phone, code, CODE_EXPIRE);

    console.log(`[SMS] 验证码已发送: ${phone.slice(0,3)}****${phone.slice(-4)} -> ${code}`);

    res.json({
      success: true,
      message: '验证码已发送',
      expire: CODE_EXPIRE,
    });
  } catch (err) {
    console.error('[SMS] 发送异常:', err.message);
    res.status(500).json({ error: '短信发送失败', detail: err.message });
  }
});

// ── 校验短信验证码 ──
router.post('/verify', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: '缺少手机号或验证码' });
    }

    const valid = await verifyCode(phone, code);
    if (!valid) {
      return res.status(400).json({ error: '验证码错误或已过期' });
    }

    res.json({ success: true, message: '验证通过' });
  } catch (err) {
    res.status(500).json({ error: '验证失败' });
  }
});

module.exports = { smsRouter: router };
