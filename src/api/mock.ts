import type {
  User, Tool, CoinTransaction, CoinAccount, PaymentTransaction,
  RechargePackage, LoginResult, PageResult, AiCallRecord, ToolCategory
} from '@/types'

// ===== Mock用户数据 =====
export const mockUser: User = {
  id: 1, username: 'admin', nickname: '罗凯中', avatar: null,
  email: 'admin@lsjyapp.cn', phone: '138******88',
  gender: 1, bio: '平台管理员', userType: 'personal', vipLevel: 3,
  status: 'active', roles: ['super_admin'],
  createdAt: '2026-01-15T10:00:00.000Z', updatedAt: '2026-06-01T08:30:00.000Z',
  lastLoginAt: '2026-06-10T14:00:00.000Z'
}

export const mockCoinAccount: CoinAccount = {
  id: 1, userId: 1, balance: 2580, frozenAmount: 0,
  totalRecharge: 5000, totalConsumed: 2420, totalEarned: 0, totalWithdrawn: 0,
  status: 'active'
}

// ===== 工具子分类定义 =====
export const toolSubCategories: Record<number, { label: string; value: string }[]> = {
  1: [ // AI人工智能
    { label: '全部', value: '' },
    { label: '💬 对话聊天', value: 'chat' },
    { label: '✍️ 文案写作', value: 'writing' },
    { label: '🎨 AI绘画', value: 'image' },
    { label: '🎬 AI视频', value: 'video' },
    { label: '🎵 AI音频', value: 'audio' },
    { label: '💻 编程开发', value: 'code' },
    { label: '📊 数据分析', value: 'data' },
    { label: '🔧 实用工具', value: 'utility' },
  ],
  2: [ // 自媒体
    { label: '全部', value: '' },
    { label: '📝 脚本创作', value: 'script' },
    { label: '🎥 视频处理', value: 'video' },
    { label: '🖼️ 图文制作', value: 'image' },
    { label: '📈 运营推广', value: 'operation' },
    { label: '🎵 音频处理', value: 'audio' },
    { label: '🔍 数据解析', value: 'parser' },
  ],
  3: [ // 电商
    { label: '全部', value: '' },
    { label: '📝 商品文案', value: 'product' },
    { label: '🎨 主图设计', value: 'design' },
    { label: '📊 运营分析', value: 'operation' },
    { label: '💬 客服话术', value: 'service' },
    { label: '📢 营销推广', value: 'marketing' },
    { label: '📦 订单管理', value: 'order' },
  ],
  4: [ // 宠物
    { label: '全部', value: '' },
    { label: '🐶 狗狗专区', value: 'dog' },
    { label: '🐱 猫咪专区', value: 'cat' },
    { label: '🏥 健康医疗', value: 'health' },
    { label: '🍖 喂养指南', value: 'food' },
    { label: '🎓 训练教程', value: 'training' },
    { label: '✂️ 美容护理', value: 'grooming' },
  ],
  5: [ // 教育
    { label: '全部', value: '' },
    { label: '📚 教案课件', value: 'lesson' },
    { label: '📝 出题阅卷', value: 'exam' },
    { label: '🎓 学科辅导', value: 'tutoring' },
    { label: '🗣️ 语言学习', value: 'language' },
    { label: '📊 学情分析', value: 'analysis' },
    { label: '🎨 素质教育', value: 'quality' },
  ],
  6: [ // 伯雅校园
    { label: '全部', value: '' },
    { label: '💼 创业就业', value: 'career' },
    { label: '📝 论文写作', value: 'paper' },
    { label: '📚 学习资料', value: 'study' },
    { label: '🎪 校园活动', value: 'activity' },
    { label: '🏠 生活服务', value: 'life' },
    { label: '🤝 社交互助', value: 'social' },
  ],
}

export const mockCategories: ToolCategory[] = [
  { id: 1, name: 'AI人工智能', slug: 'ai', icon: '🤖', description: 'AI生成工具集合，覆盖文本、图像、视频、音频、编程等', module: 'ai', toolCount: 30 },
  { id: 2, name: '自媒体', slug: 'media', icon: '📱', description: '自媒体创作者必备工具，脚本、剪辑、运营一站式', module: 'media', toolCount: 30 },
  { id: 3, name: '电商', slug: 'ecommerce', icon: '🛒', description: '电商运营工具，商品文案、主图设计、营销推广全覆盖', module: 'shop', toolCount: 30 },
  { id: 4, name: '宠物', slug: 'pet', icon: '🐾', description: '宠物健康、喂养、训练、美容全方位工具', module: 'pet', toolCount: 30 },
  { id: 5, name: '教育', slug: 'education', icon: '📚', description: '教师教学、学生学习AI辅助工具', module: 'edu', toolCount: 30 },
  { id: 6, name: '伯雅校园', slug: 'campus', icon: '🎓', description: '大学生专属校园服务工具集', module: 'campus', toolCount: 30 },
]

// 工具ID生成器
let toolId = 1
const mkTool = (cat: number, sub: string, name: string, slug: string, desc: string, icon: string, type: Tool['toolType'], cost: number, free: number = 0, limit: number = 0, usage: number = 0, tags?: string[]): Tool => ({
  id: toolId++, categoryId: cat, subCategory: sub, name, slug, description: desc, icon,
  provider: type === 'other' ? 'local' : 'openai', modelId: type === 'image' ? 'sd-xl' : type === 'video' ? 'seedance-2.0' : 'gpt-4o',
  toolType: type, inputType: type === 'image' && icon.includes('✂️') ? 'image' : 'text',
  outputType: type === 'image' ? 'image' : type === 'video' ? 'video' : type === 'audio' ? 'audio' : type === 'other' ? 'file' : 'text',
  coinCost: cost, isFree: free, freeDailyLimit: limit,
  usageCount: usage || Math.floor(Math.random() * 20000) + 500,
  sortOrder: toolId, status: 'active',
  createdAt: '2026-01-01T00:00:00.000Z', tags
})

export const mockTools: Tool[] = [
  // ===== 1. AI人工智能 (30个) =====
  mkTool(1, 'chat', '大模型中心', 'llm-center', '豆包/DeepSeek/GLM/即梦/GPT 多模型自由切换对话', '⚡', 'text', 0, 1, 20, 35000, ['热门', '免费']),
  mkTool(1, 'chat', 'AI智能问答', 'ai-chat', '通用AI对话助手，解答各类问题', '💬', 'text', 5, 0, 0, 18900),
  mkTool(1, 'chat', 'AI角色扮演', 'roleplay', 'AI扮演各种角色对话练习', '🎭', 'text', 8, 0, 0, 6700),
  mkTool(1, 'writing', 'AI文案创作', 'ai-copywriting', '短视频/团购/种草/朋友圈/小红书文案一键生成', '✍️', 'text', 10, 0, 0, 12580, ['热门']),
  mkTool(1, 'writing', 'AI文章写作', 'article-writer', '长文章、公众号、博客文章生成', '📄', 'text', 15, 0, 0, 9200),
  mkTool(1, 'writing', 'AI论文写作', 'paper-writer', '论文大纲、内容润色、参考文献整理', '📑', 'text', 20, 0, 0, 7800),
  mkTool(1, 'writing', 'AI翻译大师', 'ai-translator', '多语言互译，支持100+语言', '🌐', 'text', 8, 1, 5, 11200),
  mkTool(1, 'writing', 'AI改写润色', 'polish', '文章润色、改写、降重、扩写', '✨', 'text', 8, 0, 0, 8300),
  mkTool(1, 'writing', 'AI起名取名', 'naming', '宝宝取名、公司起名、品牌命名', '🏷️', 'text', 10, 0, 0, 4500),
  mkTool(1, 'image', 'AI文生图', 'ai-image', '文字描述生成高清图片，SDXL模型', '🎨', 'image', 20, 0, 0, 8920, ['热门']),
  mkTool(1, 'image', 'AI智能抠图', 'ai-cutout', '一键智能去除图片背景，支持批量', '✂️', 'image', 10, 1, 3, 7650),
  mkTool(1, 'image', 'AI图片放大', 'upscaler', '图片无损放大4K/8K超分辨率', '🔍', 'image', 15, 0, 0, 5400),
  mkTool(1, 'image', 'AI老照片修复', 'photo-restore', '老照片修复、上色、清晰度增强', '📷', 'image', 25, 0, 0, 6800),
  mkTool(1, 'image', 'AI Logo设计', 'logo-design', '品牌Logo设计生成', '🎯', 'image', 30, 0, 0, 4200),
  mkTool(1, 'image', 'AI头像生成', 'avatar-generator', 'AI生成个性化头像、动漫头像', '👤', 'image', 15, 1, 2, 9800),
  mkTool(1, 'image', 'AI图片风格转换', 'style-transfer', '照片转油画/水彩/动漫/素描风格', '🖼️', 'image', 20, 0, 0, 5600),
  mkTool(1, 'video', 'AI视频生成', 'ai-video', 'Seedance 2.0 AI文生视频，文字转短视频', '🎬', 'video', 80, 0, 0, 5430),
  mkTool(1, 'video', '数字人口播', 'digital-human', 'AI脚本+数字人形象生成口播视频', '🧑‍💼', 'video', 100, 0, 0, 2340),
  mkTool(1, 'video', 'AI视频字幕', 'video-subtitle', '视频自动加字幕、翻译字幕', '💬', 'video', 15, 0, 0, 7200),
  mkTool(1, 'audio', 'AI语音合成', 'tts', '文字转语音，多种音色选择', '🔊', 'audio', 10, 1, 5, 6400),
  mkTool(1, 'audio', 'AI语音克隆', 'voice-clone', '声音克隆，定制专属音色', '🎤', 'audio', 50, 0, 0, 3200),
  mkTool(1, 'audio', 'AI音乐创作', 'music-gen', 'AI生成原创音乐、BGM', '🎵', 'audio', 30, 0, 0, 2800),
  mkTool(1, 'code', 'AI代码补全', 'code-complete', '代码生成、补全、Bug修复', '💻', 'text', 10, 1, 10, 16780),
  mkTool(1, 'code', 'AI代码解释', 'code-explain', '代码解释、注释生成、逻辑分析', '📖', 'text', 8, 0, 0, 5200),
  mkTool(1, 'code', 'AI SQL生成', 'sql-generator', '自然语言转SQL查询语句', '🗃️', 'text', 12, 0, 0, 3800),
  mkTool(1, 'data', 'AI数据分析', 'data-analysis', '数据分析报告生成、图表解读', '📊', 'analysis', 15, 0, 0, 4500),
  mkTool(1, 'data', 'AI PPT生成', 'ppt-generator', '一键生成PPT演示文稿', '📽️', 'text', 20, 0, 0, 10890, ['热门']),
  mkTool(1, 'data', 'AI思维导图', 'mindmap', 'AI生成思维导图，Markdown格式', '🧠', 'text', 12, 0, 0, 5600),
  mkTool(1, 'utility', 'AI PDF解析', 'pdf-parser', 'PDF文档问答、内容提取', '📕', 'text', 10, 0, 0, 6700),
  mkTool(1, 'utility', 'AI格式转换', 'format-convert', '各种文件格式互转', '🔄', 'other', 5, 1, 10, 8900),

  // ===== 2. 自媒体 (30个) =====
  mkTool(2, 'script', '爆款短视频脚本', 'viral-script', '抖音/快手/视频号爆款脚本生成', '📝', 'text', 50, 0, 0, 3210, ['热门']),
  mkTool(2, 'script', '口播文案生成', 'oral-script', '主播口播文案、带货话术', '🎙️', 'text', 12, 0, 0, 4500),
  mkTool(2, 'script', '小红书文案', 'xhs-copy', '小红书种草笔记、标题文案', '📕', 'text', 10, 0, 0, 8700, ['热门']),
  mkTool(2, 'script', '朋友圈文案', 'moments-copy', '朋友圈文案、配图配文', '👥', 'text', 5, 1, 5, 9200),
  mkTool(2, 'script', '公众号文章', 'wechat-article', '微信公众号长文生成', '📰', 'text', 18, 0, 0, 6300),
  mkTool(2, 'script', '直播话术', 'live-script', '直播带货话术、互动话术', '🔴', 'text', 15, 0, 0, 3800),
  mkTool(2, 'script', '段子搞笑文案', 'joke-writer', '搞笑段子、冷笑话、神回复', '😂', 'text', 8, 0, 0, 4200),
  mkTool(2, 'video', '短视频解析下载', 'video-parser', '抖音/快手/小红书无水印下载', '📥', 'other', 0, 1, 10, 25600, ['免费', '热门']),
  mkTool(2, 'video', '视频文案提取', 'video-text', '视频转文字、字幕提取', '📄', 'text', 10, 1, 3, 7800),
  mkTool(2, 'video', '视频去水印', 'remove-watermark', '视频水印智能去除', '💧', 'video', 15, 0, 0, 5600),
  mkTool(2, 'video', '视频压缩', 'video-compress', '视频压缩、清晰度调整', '📦', 'video', 8, 1, 5, 6200),
  mkTool(2, 'video', '视频格式转换', 'video-convert', 'MP4/MOV/AVI/GIF格式互转', '🔄', 'video', 8, 0, 0, 4100),
  mkTool(2, 'video', '视频剪辑助手', 'video-edit', 'AI自动剪辑、精彩片段提取', '✂️', 'video', 25, 0, 0, 3400),
  mkTool(2, 'image', '短视频封面制作', 'cover-maker', '爆款视频封面图设计', '🖼️', 'image', 15, 0, 0, 6700),
  mkTool(2, 'image', '九宫格切图', 'grid-cut', '图片切九宫格、朋友圈九宫格', '🎴', 'image', 5, 1, 10, 11200),
  mkTool(2, 'image', '图文成片', 'image-to-video', '图片+文案一键生成视频', '🎞️', 'video', 30, 0, 0, 4800),
  mkTool(2, 'image', '表情包生成', 'meme-maker', '搞笑表情包定制生成', '😜', 'image', 8, 1, 5, 8900),
  mkTool(2, 'image', '文案配配图', 'copy-image', '根据文案推荐/生成配图', '🌄', 'image', 12, 0, 0, 5400),
  mkTool(2, 'operation', '标题优化', 'title-optimizer', '爆款标题生成、标题优化', '🎯', 'text', 8, 0, 0, 9600),
  mkTool(2, 'operation', '标签话题推荐', 'hashtag', '热门话题标签推荐', '🏷️', 'text', 5, 1, 10, 7300),
  mkTool(2, 'operation', '账号定位分析', 'account-analysis', '账号定位、内容方向建议', '📈', 'analysis', 20, 0, 0, 2800),
  mkTool(2, 'operation', '选题策划', 'topic-planner', '内容选题、热点追踪', '💡', 'text', 12, 0, 0, 4100),
  mkTool(2, 'operation', '评论回复生成', 'reply-generator', '智能生成评论回复话术', '💬', 'text', 5, 1, 20, 6500),
  mkTool(2, 'operation', '数据分析报告', 'media-data', '账号数据分析、运营报告', '📊', 'analysis', 18, 0, 0, 2300),
  mkTool(2, 'audio', '音频转文字', 'audio-to-text', '录音转文字、语音速记', '🎧', 'text', 10, 1, 5, 8200),
  mkTool(2, 'audio', '背景音乐推荐', 'bgm-recommend', '根据视频内容推荐BGM', '🎵', 'text', 5, 1, 10, 5900),
  mkTool(2, 'audio', '音频降噪', 'audio-denoise', '录音降噪、音质提升', '🔇', 'audio', 12, 0, 0, 3700),
  mkTool(2, 'audio', '配音生成', 'voice-over', '视频配音、多角色配音', '🎤', 'audio', 15, 0, 0, 6800),
  mkTool(2, 'parser', '主页批量解析', 'profile-parser', '博主主页视频批量解析下载', '📋', 'other', 20, 0, 0, 4500),
  mkTool(2, 'parser', '评论采集分析', 'comment-analyzer', '评论采集、情感分析', '💭', 'analysis', 15, 0, 0, 2900),

  // ===== 3. 电商 (30个) =====
  mkTool(3, 'product', '商品详情文案', 'product-copy', '淘宝/拼多多/京东商品详情描述', '🏷️', 'text', 10, 0, 0, 4560, ['热门']),
  mkTool(3, 'product', '商品标题优化', 'product-title', 'SEO商品标题生成优化', '📝', 'text', 8, 0, 0, 7800),
  mkTool(3, 'product', '商品卖点提炼', 'selling-point', '产品核心卖点提炼、亮点描述', '💎', 'text', 10, 0, 0, 5600),
  mkTool(3, 'product', '商品参数整理', 'spec-sort', '商品参数规格整理', '📋', 'text', 6, 0, 0, 3200),
  mkTool(3, 'product', '买家秀文案', 'buyer-show', '好评评语、买家秀文案生成', '⭐', 'text', 5, 1, 10, 8900),
  mkTool(3, 'product', '问大家回答', 'qa-answer', '淘宝问大家智能回答', '❓', 'text', 5, 1, 10, 4500),
  mkTool(3, 'design', '商品主图设计', 'main-image', '电商主图AI设计生成', '🖼️', 'image', 25, 0, 0, 6700, ['热门']),
  mkTool(3, 'design', 'SKU图设计', 'sku-image', 'SKU规格图设计制作', '🎨', 'image', 20, 0, 0, 4300),
  mkTool(3, 'design', '详情页设计', 'detail-page', '商品详情页长图设计', '📄', 'image', 35, 0, 0, 3800),
  mkTool(3, 'design', '直通车创意图', 'ad-creative', '直通车/引力魔方创意图', '💰', 'image', 30, 0, 0, 5200),
  mkTool(3, 'design', '白底图制作', 'white-bg', '商品白底图、透明图制作', '⬜', 'image', 10, 1, 3, 7200),
  mkTool(3, 'design', '活动海报设计', 'poster-design', '618/双11大促海报设计', '🎉', 'image', 25, 0, 0, 4800),
  mkTool(3, 'operation', '竞品分析', 'competitor-analysis', '竞争对手店铺数据分析', '🔍', 'analysis', 20, 0, 0, 3200),
  mkTool(3, 'operation', '选品分析', 'product-selection', '蓝海选品、爆款潜力分析', '🎯', 'analysis', 25, 0, 0, 4100),
  mkTool(3, 'operation', '关键词挖掘', 'keyword-mining', '搜索关键词、长尾词挖掘', '🔑', 'text', 15, 0, 0, 5500),
  mkTool(3, 'operation', '定价策略', 'pricing-strategy', '商品定价、促销定价建议', '💲', 'analysis', 12, 0, 0, 3600),
  mkTool(3, 'operation', '库存管理建议', 'inventory-advice', '库存周转、补货建议', '📦', 'analysis', 10, 0, 0, 2100),
  mkTool(3, 'operation', '评价分析', 'review-analysis', '商品评价情感分析、差评原因', '📊', 'analysis', 15, 0, 0, 2900),
  mkTool(3, 'service', '客服话术库', 'customer-service', '售前售后客服话术模板', '💬', 'text', 8, 1, 10, 7600),
  mkTool(3, 'service', '售后回复', 'after-sales', '退换货、投诉处理回复模板', '🤝', 'text', 8, 0, 0, 5400),
  mkTool(3, 'service', '差评安抚', 'bad-review', '差评回复、安抚话术', '😔', 'text', 10, 0, 0, 3800),
  mkTool(3, 'service', '催付话术', 'payment-reminder', '下单未付款催付话术', '⏰', 'text', 5, 1, 10, 4200),
  mkTool(3, 'marketing', '直播脚本', 'live-script', '电商直播带货脚本', '🔴', 'text', 18, 0, 0, 5100),
  mkTool(3, 'marketing', '短视频带货脚本', 'short-video-sell', '抖音/快手带货短视频脚本', '🎬', 'text', 15, 0, 0, 6200),
  mkTool(3, 'marketing', '朋友圈广告文案', 'moments-ad', '私域朋友圈推广文案', '📱', 'text', 10, 0, 0, 4700),
  mkTool(3, 'marketing', '短信营销文案', 'sms-marketing', '会员短信营销文案', '📩', 'text', 8, 0, 0, 3300),
  mkTool(3, 'marketing', '满减活动策划', 'promotion-plan', '满减/折扣/拼团活动方案', '🎁', 'text', 12, 0, 0, 4900),
  mkTool(3, 'order', '快递单号生成', 'tracking-number', '测试快递单号生成（仅测试用）', '🚚', 'other', 0, 1, 999, 2200),
  mkTool(3, 'order', '发货短信通知', 'shipping-sms', '发货通知、物流提醒短信', '📤', 'text', 5, 1, 20, 3400),
  mkTool(3, 'order', '退换货流程模板', 'return-template', '退换货流程、协议模板', '↩️', 'text', 8, 0, 0, 2800),

  // ===== 4. 宠物 (30个) =====
  mkTool(4, 'dog', '狗狗品种识别', 'dog-breed', '拍照识别狗狗品种，详细介绍', '🐕', 'analysis', 5, 1, 5, 8900),
  mkTool(4, 'dog', '狗狗饲养指南', 'dog-care', '狗狗日常护理、饲养全攻略', '🦮', 'text', 8, 0, 0, 6700),
  mkTool(4, 'dog', '狗狗训练教程', 'dog-training', '狗狗基础训练、指令教学', '🦴', 'text', 10, 0, 0, 7200),
  mkTool(4, 'dog', '狗狗行为解读', 'dog-behavior', '狗狗动作、叫声行为含义解读', '🐶', 'analysis', 8, 0, 0, 5600),
  mkTool(4, 'dog', '狗粮推荐', 'dog-food', '根据犬种/年龄推荐合适狗粮', '🍖', 'text', 5, 1, 10, 9200),
  mkTool(4, 'cat', '猫咪品种识别', 'cat-breed', '拍照识别猫咪品种', '🐈', 'analysis', 5, 1, 5, 9400, ['热门']),
  mkTool(4, 'cat', '猫咪饲养指南', 'cat-care', '猫咪日常护理、喂养指南', '🐱', 'text', 8, 0, 0, 8100),
  mkTool(4, 'cat', '猫咪行为解读', 'cat-behavior', '猫咪肢体语言、行为含义', '😺', 'analysis', 8, 0, 0, 7800),
  mkTool(4, 'cat', '猫粮推荐', 'cat-food', '猫粮推荐、营养搭配建议', '🐟', 'text', 5, 1, 10, 8500),
  mkTool(4, 'cat', '猫咪玩具推荐', 'cat-toy', '猫咪玩具、用品推荐', '🧶', 'text', 5, 1, 10, 4500),
  mkTool(4, 'health', '宠物症状自查', 'pet-symptom', '宠物常见症状分析、就医建议', '🏥', 'analysis', 5, 0, 0, 2100, ['热门']),
  mkTool(4, 'health', '疫苗接种计划', 'vaccine-plan', '宠物疫苗接种时间表提醒', '💉', 'text', 0, 1, 999, 5600),
  mkTool(4, 'health', '驱虫计划', 'deworm-plan', '体内外驱虫时间、药品推荐', '💊', 'text', 5, 1, 10, 4200),
  mkTool(4, 'health', '宠物用药参考', 'pet-medication', '宠物常用药品、剂量参考', '💊', 'analysis', 10, 0, 0, 3800),
  mkTool(4, 'health', '绝育知识', 'neutering', '宠物绝育知识、术后护理', '💉', 'text', 5, 1, 10, 3400),
  mkTool(4, 'food', '宠物食谱制作', 'pet-recipe', '自制宠物粮食、零食食谱', '🍳', 'text', 8, 0, 0, 4900),
  mkTool(4, 'food', '禁忌食物查询', 'forbidden-food', '宠物禁食食物查询', '⚠️', 'text', 0, 1, 999, 7200, ['免费']),
  mkTool(4, 'food', '营养搭配建议', 'nutrition', '宠物营养补充、膳食搭配', '🥩', 'text', 8, 0, 0, 3700),
  mkTool(4, 'food', '零食推荐', 'treat-recommend', '宠物零食推荐、选购指南', '🦴', 'text', 5, 1, 10, 4100),
  mkTool(4, 'training', '定点如厕训练', 'toilet-training', '猫狗定点上厕所训练方法', '🚽', 'text', 10, 0, 0, 6800),
  mkTool(4, 'training', '不拆家训练', 'no-destroy', '防止拆家、咬东西训练', '🏠', 'text', 10, 0, 0, 5300),
  mkTool(4, 'training', '随行训练', 'heel-training', '狗狗随行、不暴冲训练', '🦮', 'text', 10, 0, 0, 4600),
  mkTool(4, 'training', '纠正坏习惯', 'bad-habit', '纠正乱叫、乱尿、扑人等坏习惯', '❌', 'text', 12, 0, 0, 5700),
  mkTool(4, 'grooming', '宠物美容造型', 'grooming-style', '宠物美容造型参考推荐', '✂️', 'image', 15, 0, 0, 4200),
  mkTool(4, 'grooming', '洗澡教程', 'bath-guide', '宠物洗澡步骤、注意事项', '🛁', 'text', 5, 1, 10, 6100),
  mkTool(4, 'grooming', '毛发护理', 'fur-care', '宠物毛发梳理、护毛建议', '🪮', 'text', 8, 0, 0, 3900),
  mkTool(4, 'grooming', '指甲修剪', 'nail-trim', '宠物剪指甲教程', '✂️', 'text', 5, 1, 10, 3500),
  mkTool(4, 'grooming', '口腔护理', 'dental-care', '宠物刷牙、口腔清洁', '🦷', 'text', 5, 1, 10, 2900),
  mkTool(4, 'health', '宠物医院推荐', 'vet-recommend', '附近宠物医院推荐、评价', '🏥', 'text', 0, 1, 5, 2400),
  mkTool(4, 'health', '应急处理', 'emergency', '宠物受伤、中毒应急处理', '🚨', 'analysis', 10, 0, 0, 3100),

  // ===== 5. 教育 (30个) =====
  mkTool(5, 'lesson', '教案生成', 'lesson-plan', '各学科课堂教案自动生成', '📚', 'text', 12, 0, 0, 1890, ['热门']),
  mkTool(5, 'lesson', '课件PPT制作', 'courseware-ppt', '教学课件PPT一键生成', '💻', 'text', 20, 0, 0, 2400),
  mkTool(5, 'lesson', '教学设计', 'teaching-design', '单元整体教学设计、课时设计', '📝', 'text', 15, 0, 0, 1700),
  mkTool(5, 'lesson', '板书设计', 'blackboard-design', '课堂板书设计方案', '✏️', 'text', 10, 0, 0, 1200),
  mkTool(5, 'lesson', '教学反思', 'teaching-reflection', '课后教学反思、教学总结', '🤔', 'text', 8, 0, 0, 980),
  mkTool(5, 'lesson', '导学案设计', 'learning-guide', '学生导学案、预习单设计', '📋', 'text', 10, 0, 0, 870),
  mkTool(5, 'exam', '试卷出题', 'exam-paper', '各学科试卷自动组卷出题', '📄', 'text', 18, 0, 0, 3200, ['热门']),
  mkTool(5, 'exam', '作业设计', 'homework-design', '分层作业、个性化作业设计', '📝', 'text', 10, 0, 0, 2100),
  mkTool(5, 'exam', '智能阅卷', 'auto-grading', '客观题自动批改、评分标准', '✅', 'analysis', 12, 0, 0, 1500),
  mkTool(5, 'exam', '错题分析', 'wrong-analysis', '错题整理、错误原因分析', '❌', 'analysis', 10, 0, 0, 1800),
  mkTool(5, 'exam', '知识点总结', 'knowledge-point', '章节知识点梳理总结', '📌', 'text', 8, 0, 0, 2600),
  mkTool(5, 'exam', '考点预测', 'exam-prediction', '考试考点预测、重点圈划', '🎯', 'analysis', 15, 0, 0, 2900),
  mkTool(5, 'tutoring', '数学解题', 'math-solver', '数学题分步解答、思路讲解', '🔢', 'text', 10, 1, 3, 4500, ['热门']),
  mkTool(5, 'tutoring', '物理化学解题', 'science-solver', '物理/化学题解答、公式推导', '⚗️', 'text', 12, 0, 0, 2800),
  mkTool(5, 'tutoring', '作文批改', 'essay-grading', '语文/英语作文批改点评', '📝', 'text', 12, 0, 0, 3100),
  mkTool(5, 'tutoring', '作文生成', 'essay-writer', '中小学作文写作指导生成', '✍️', 'text', 10, 1, 3, 3800),
  mkTool(5, 'tutoring', '阅读理解', 'reading-comprehension', '阅读理解题目解答、答题技巧', '📖', 'text', 10, 0, 0, 2400),
  mkTool(5, 'tutoring', '古诗文解析', 'poetry-analysis', '文言文/古诗词翻译赏析', '📜', 'text', 8, 1, 5, 2200),
  mkTool(5, 'language', '英语翻译', 'english-translate', '中英互译、语法纠正', '🌐', 'text', 8, 1, 10, 3500),
  mkTool(5, 'language', '英语口语练习', 'oral-english', '英语口语对话练习、纠错', '🗣️', 'text', 10, 0, 0, 2600),
  mkTool(5, 'language', '英语写作', 'english-writing', '英语作文、邮件写作', '✉️', 'text', 10, 0, 0, 1900),
  mkTool(5, 'language', '单词记忆', 'vocabulary', '单词记忆方法、例句生成', '📖', 'text', 5, 1, 10, 2100),
  mkTool(5, 'language', '语法讲解', 'grammar', '英语语法详细讲解举例', '📚', 'text', 8, 1, 5, 1700),
  mkTool(5, 'analysis', '学情分析', 'learning-analysis', '学生学习情况分析报告', '📊', 'analysis', 15, 0, 0, 980),
  mkTool(5, 'analysis', '成绩分析', 'grade-analysis', '考试成绩数据分析、排名', '📈', 'analysis', 12, 0, 0, 1100),
  mkTool(5, 'analysis', '个性化学习计划', 'study-plan', '根据学情定制学习计划', '📅', 'text', 15, 0, 0, 1800),
  mkTool(5, 'quality', '绘画教程', 'drawing-tutorial', '儿童绘画、美术教程指导', '🎨', 'text', 10, 0, 0, 1400),
  mkTool(5, 'quality', '音乐教学', 'music-teaching', '乐理知识、乐器入门教程', '🎵', 'text', 10, 0, 0, 950),
  mkTool(5, 'quality', '体育教案', 'pe-lesson', '体育课教案、游戏设计', '⚽', 'text', 8, 0, 0, 760),
  mkTool(5, 'quality', '心理健康辅导', 'mental-health', '学生心理健康辅导、沟通话术', '🧠', 'text', 12, 0, 0, 1300),

  // ===== 6. 伯雅校园 (30个) =====
  mkTool(6, 'career', '创业计划书', 'business-plan', '大学生创业计划书、BP撰写', '💼', 'text', 15, 0, 0, 980, ['热门']),
  mkTool(6, 'career', '简历制作', 'resume-builder', '求职简历优化、模板生成', '📄', 'text', 10, 0, 0, 3200, ['热门']),
  mkTool(6, 'career', '求职信生成', 'cover-letter', '求职信、自荐信撰写', '✉️', 'text', 8, 0, 0, 1800),
  mkTool(6, 'career', '面试问题', 'interview-qa', '面试常见问题、回答技巧', '🗣️', 'text', 10, 0, 0, 2600),
  mkTool(6, 'career', '职业规划', 'career-plan', '大学生职业规划、方向建议', '🧭', 'text', 15, 0, 0, 2100),
  mkTool(6, 'career', '实习报告', 'internship-report', '实习报告、实习总结撰写', '📋', 'text', 12, 0, 0, 1500),
  mkTool(6, 'paper', '论文开题报告', 'thesis-proposal', '毕业论文开题报告撰写', '📑', 'text', 20, 0, 0, 4200, ['热门']),
  mkTool(6, 'paper', '论文大纲生成', 'thesis-outline', '论文大纲、目录结构生成', '📚', 'text', 15, 0, 0, 3800),
  mkTool(6, 'paper', '论文降重', 'plagiarism-reduce', '论文查重降重、改写润色', '✂️', 'text', 18, 0, 0, 5600, ['热门']),
  mkTool(6, 'paper', '文献综述', 'literature-review', '文献综述撰写、文献整理', '📖', 'text', 20, 0, 0, 2900),
  mkTool(6, 'paper', '参考文献格式', 'citation-format', 'GB/T 7714参考文献格式生成', '🔖', 'text', 5, 1, 10, 4800),
  mkTool(6, 'paper', '答辩PPT制作', 'defense-ppt', '毕业答辩PPT内容生成', '💻', 'text', 25, 0, 0, 3400),
  mkTool(6, 'study', '课程笔记整理', 'class-notes', '课堂笔记整理、知识点梳理', '📒', 'text', 8, 1, 10, 3200),
  mkTool(6, 'study', '期末复习重点', 'final-review', '期末考试重点归纳、考点串讲', '📌', 'text', 10, 0, 0, 4500, ['热门']),
  mkTool(6, 'study', '思维导图生成', 'mindmap-study', '学科知识点思维导图', '🧠', 'text', 10, 0, 0, 2800),
  mkTool(6, 'study', '高数解题', 'calculus-solver', '高等数学题目详细解答', '📐', 'text', 12, 0, 0, 3800),
  mkTool(6, 'study', '英语四六级', 'cet-prep', '四六级写作、翻译、听力技巧', '📝', 'text', 10, 0, 0, 4100),
  mkTool(6, 'study', '考研政治', 'kaoyan-politics', '考研政治知识点、大题模板', '🎓', 'text', 12, 0, 0, 2900),
  mkTool(6, 'activity', '活动策划书', 'event-plan', '校园活动策划方案、流程', '🎉', 'text', 12, 0, 0, 2300),
  mkTool(6, 'activity', '社团招新文案', 'club-recruit', '社团招新宣传文案、海报文案', '📢', 'text', 8, 0, 0, 1700),
  mkTool(6, 'activity', '辩论赛准备', 'debate-prep', '辩题分析、论点论据准备', '⚖️', 'text', 10, 0, 0, 1200),
  mkTool(6, 'activity', '主持词生成', 'host-script', '晚会、活动主持词串词', '🎤', 'text', 10, 0, 0, 1500),
  mkTool(6, 'activity', '团日活动方案', 'league-activity', '团日活动、班会活动方案', '🏫', 'text', 8, 0, 0, 980),
  mkTool(6, 'life', '宿舍美食菜谱', 'dorm-recipe', '宿舍简易美食、无锅菜谱', '🍜', 'text', 5, 1, 10, 4200),
  mkTool(6, 'life', '二手交易文案', 'second-hand', '校园二手物品出售文案', '♻️', 'text', 5, 1, 10, 2600),
  mkTool(6, 'life', '租房攻略', 'rent-guide', '大学生校外租房攻略、合同', '🏠', 'text', 8, 1, 5, 1800),
  mkTool(6, 'life', '周边美食推荐', 'food-recommend', '学校周边美食探店文案', '🍔', 'text', 5, 1, 10, 3100),
  mkTool(6, 'social', '表白文案', 'confession', '表白情话、情书文案', '💕', 'text', 8, 0, 0, 5600, ['热门']),
  mkTool(6, 'social', '道歉信', 'apology-letter', '道歉信、和好话术', '🙏', 'text', 8, 0, 0, 3200),
  mkTool(6, 'social', '小组作业分工', 'group-work', '小组作业分工建议、沟通话术', '👥', 'text', 5, 1, 10, 2400),
]

export const mockPackages: RechargePackage[] = [
  { id: 1, name: '10圣点', coinAmount: 10, price: 1, originalPrice: null, bonusCoins: 0, isRecommended: 0, sortOrder: 1 },
  { id: 2, name: '50圣点', coinAmount: 50, price: 4.9, originalPrice: 5.9, bonusCoins: 0, isRecommended: 0, sortOrder: 2 },
  { id: 3, name: '100圣点', coinAmount: 100, price: 9.9, originalPrice: 12.9, bonusCoins: 10, isRecommended: 0, sortOrder: 3 },
  { id: 4, name: '300圣点', coinAmount: 300, price: 24.9, originalPrice: 32.9, bonusCoins: 30, isRecommended: 0, sortOrder: 4 },
  { id: 5, name: '500圣点', coinAmount: 500, price: 39.9, originalPrice: 54.9, bonusCoins: 80, isRecommended: 1, sortOrder: 5 },
  { id: 6, name: '1000圣点', coinAmount: 1000, price: 69.9, originalPrice: 99.9, bonusCoins: 200, isRecommended: 0, sortOrder: 6 },
  { id: 7, name: '2000圣点', coinAmount: 2000, price: 129, originalPrice: 199, bonusCoins: 500, isRecommended: 0, sortOrder: 7 },
  { id: 8, name: '5000圣点', coinAmount: 5000, price: 299, originalPrice: 499, bonusCoins: 1500, isRecommended: 0, sortOrder: 8 },
  { id: 9, name: '10000圣点', coinAmount: 10000, price: 499, originalPrice: 899, bonusCoins: 3500, isRecommended: 0, sortOrder: 9 },
  { id: 10, name: '至尊包', coinAmount: 50000, price: 1999, originalPrice: 3999, bonusCoins: 20000, isRecommended: 0, sortOrder: 10 },
];
export const mockTransactions: CoinTransaction[] = [
  { id: 1, userId: 1, transactionType: 'recharge', amount: 500, balanceBefore: 2080, balanceAfter: 2580, refType: 'recharge', refId: 1, remark: '套餐充值 - 500圣点', createdAt: '2026-06-09T09:00:00.000Z' },
  { id: 2, userId: 1, transactionType: 'consume', amount: -80, balanceBefore: 2580, balanceAfter: 2500, refType: 'ai_tool_call', refId: 3, remark: '调用AI工具: AI视频生成', createdAt: '2026-06-10T14:20:00.000Z' },
  { id: 3, userId: 1, transactionType: 'consume', amount: -10, balanceBefore: 2500, balanceAfter: 2490, refType: 'ai_tool_call', refId: 1, remark: '调用AI工具: AI文案创作', createdAt: '2026-06-10T10:00:00.000Z' },
  { id: 4, userId: 1, transactionType: 'consume', amount: -20, balanceBefore: 2490, balanceAfter: 2470, refType: 'ai_tool_call', refId: 2, remark: '调用AI工具: AI文生图', createdAt: '2026-06-09T16:30:00.000Z' },
  { id: 5, userId: 1, transactionType: 'recharge', amount: 200, balanceBefore: 2270, balanceAfter: 2470, refType: 'recharge', refId: 2, remark: '套餐充值 - 200圣点', createdAt: '2026-06-08T11:00:00.000Z' },
]

export const mockPaymentOrders: PaymentTransaction[] = [
  { id: 1, transactionNo: 'PAY20260609001', userId: 1, bizType: 'recharge', payChannel: 'wechat', amount: 199.00, coinAmount: 580, direction: 'in', status: 'success', remark: '充值: 500圣点', createdAt: '2026-06-09T09:00:00.000Z', paidAt: '2026-06-09T09:01:00.000Z' },
  { id: 2, transactionNo: 'PAY20260608002', userId: 1, bizType: 'recharge', payChannel: 'wechat', amount: 99.90, coinAmount: 210, direction: 'in', status: 'success', remark: '充值: 100圣点', createdAt: '2026-06-08T11:00:00.000Z', paidAt: '2026-06-08T11:01:00.000Z' },
]

export const mockUsers: User[] = [
  mockUser,
  { id: 2, username: 'zhangsan', nickname: '张三', avatar: null, email: 'z***@qq.com', phone: '139******34', gender: 1, bio: null, userType: 'personal', vipLevel: 1, status: 'active', roles: ['user'], createdAt: '2026-02-20T09:00:00.000Z', updatedAt: '2026-06-01T00:00:00.000Z', lastLoginAt: '2026-06-10T08:00:00.000Z' },
  { id: 3, username: 'lisi', nickname: '李四', avatar: null, email: 'l***@163.com', phone: '137******78', gender: 2, bio: null, userType: 'personal', vipLevel: 0, status: 'active', roles: ['user'], createdAt: '2026-03-15T14:00:00.000Z', updatedAt: '2026-06-05T00:00:00.000Z', lastLoginAt: '2026-06-09T16:00:00.000Z' },
  { id: 4, username: 'wangwu', nickname: '王五', avatar: null, email: 'w***@gmail.com', phone: '136******12', gender: 1, bio: null, userType: 'enterprise', vipLevel: 2, status: 'active', roles: ['merchant'], createdAt: '2026-01-20T10:00:00.000Z', updatedAt: '2026-06-08T00:00:00.000Z', lastLoginAt: '2026-06-10T12:00:00.000Z' },
  { id: 5, username: 'zhaoliu', nickname: '赵六', avatar: null, email: 'z***@qq.com', phone: '135******56', gender: 0, bio: null, userType: 'personal', vipLevel: 0, status: 'frozen', roles: ['user'], createdAt: '2026-04-01T08:00:00.000Z', updatedAt: '2026-05-20T00:00:00.000Z', lastLoginAt: '2026-05-15T10:00:00.000Z' },
]

// ===== Mock API =====
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const mockApi = {
  async login() {
    await delay(500)
    const result: LoginResult = {
      user: mockUser,
      accessToken: 'mock_access_token_xxx',
      refreshToken: 'mock_refresh_token_xxx'
    }
    return { code: 0, message: 'success', data: result }
  },

  async register() {
    await delay(500)
    return { code: 0, message: 'success', data: { user: mockUser, accessToken: 'mock_token', refreshToken: 'mock_refresh' } }
  },

  async getProfile() {
    await delay(300)
    return { code: 0, message: 'success', data: { ...mockUser, roles: [{ roleId: 1, roleName: 'super_admin', displayName: '超级管理员', scopeType: 'global' }] } }
  },

  async getCategories() {
    await delay(200)
    return { code: 0, message: 'success', data: mockCategories }
  },

  async getTools(params?: { categoryId?: number; subCategory?: string; toolType?: string }) {
    await delay(300)
    let list = [...mockTools].filter(t => t.status === 'active')
    if (params?.categoryId) list = list.filter(t => t.categoryId === params.categoryId)
    if (params?.subCategory) list = list.filter(t => t.subCategory === params.subCategory)
    if (params?.toolType) list = list.filter(t => t.toolType === params.toolType)
    const result: PageResult<Tool> = { items: list, total: list.length, page: 1, pageSize: 100 }
    return { code: 0, message: 'success', data: result }
  },

  async getToolDetail(id: number | string) {
    await delay(200)
    const tool = mockTools.find(t => t.id === Number(id))
    return { code: 0, message: 'success', data: tool }
  },

  async callTool(_id: number | string, input: any) {
    await delay(1000)
    const record: AiCallRecord = {
      id: 100, userId: 1, toolId: Number(_id), requestId: 'mock-req-id',
      inputText: input?.text || '', outputText: '【Mock生成结果】这是一段模拟的AI生成内容。\n\n基于您的需求，我为您生成了以下内容：\n\n1. 首先，我们需要明确目标和核心要点\n2. 其次，根据实际情况进行具体分析\n3. 最后，给出可执行的建议方案\n\n希望对您有帮助！',
      coinCost: 10, status: 'completed', isFavorite: 0, createdAt: new Date().toISOString()
    }
    return { code: 0, message: 'success', data: record }
  },

  async getBalance() {
    await delay(200)
    return { code: 0, message: 'success', data: mockCoinAccount }
  },

  async getPackages() {
    await delay(200)
    return { code: 0, message: 'success', data: mockPackages }
  },

  async recharge(_packageId: number) {
    await delay(500)
    const pkg = mockPackages.find(p => p.id === _packageId)
    return {
      code: 0, message: 'success',
      data: {
        paymentTransaction: { id: 99, transactionNo: 'PAY_MOCK_001', userId: 1, bizType: 'recharge', payChannel: 'wechat', amount: pkg?.price || 0, coinAmount: (pkg?.coinAmount || 0) + (pkg?.bonusCoins || 0), direction: 'in', status: 'pending', remark: `充值: ${pkg?.name}`, createdAt: new Date().toISOString(), paidAt: null },
        coinAmount: (pkg?.coinAmount || 0) + (pkg?.bonusCoins || 0)
      }
    }
  },

  async getTransactions(_params?: any) {
    await delay(300)
    const result: PageResult<CoinTransaction> = { items: mockTransactions, total: mockTransactions.length, page: 1, pageSize: 20 }
    return { code: 0, message: 'success', data: result }
  },

  async getPaymentOrders() {
    await delay(300)
    const result: PageResult<PaymentTransaction> = { items: mockPaymentOrders, total: mockPaymentOrders.length, page: 1, pageSize: 20 }
    return { code: 0, message: 'success', data: result }
  },

  async getUsers() {
    await delay(300)
    const result: PageResult<User> = { items: mockUsers, total: mockUsers.length, page: 1, pageSize: 20 }
    return { code: 0, message: 'success', data: result }
  }
}
