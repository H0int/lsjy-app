/**
 * 工具参数配置 - 每个subCategory对应一组专属参数
 */

export interface ToolParam {
  key: string
  label: string
  type: 'select' | 'input' | 'textarea' | 'number'
  options?: { label: string; value: string }[]
  placeholder?: string
  defaultValue?: string | number
}

export interface ToolParamGroup {
  title: string
  params: ToolParam[]
}

// 参数配置映射 - 按subCategory匹配
export const toolParamMap: Record<string, ToolParamGroup[]> = {
  // AI绘画
  'AI绘画': [
    {
      title: '图像生成',
      params: [
        { key: 'size', label: '尺寸', type: 'select', defaultValue: '1024x1024', options: [
          { label: '1024×1024', value: '1024x1024' },
          { label: '512×512', value: '512x512' },
          { label: '768×1344', value: '768x1344' },
          { label: '1344×768', value: '1344x768' },
        ]},
        { key: 'style', label: '风格', type: 'select', defaultValue: '', options: [
          { label: '请选择风格', value: '' },
          { label: '写实风格', value: 'realistic' },
          { label: '动漫风格', value: 'anime' },
          { label: '油画风格', value: 'oil' },
          { label: '水彩风格', value: 'watercolor' },
          { label: '赛博朋克', value: 'cyberpunk' },
          { label: '像素风格', value: 'pixel' },
          { label: '3D渲染', value: '3d' },
        ]},
        { key: 'count', label: '数量', type: 'select', defaultValue: '1', options: [
          { label: '1张', value: '1' },
          { label: '2张', value: '2' },
          { label: '4张', value: '4' },
        ]},
        { key: 'quality', label: '质量', type: 'select', defaultValue: 'standard', options: [
          { label: '标准', value: 'standard' },
          { label: '高清', value: 'hd' },
          { label: '超清', value: 'ultra' },
        ]},
      ],
    },
  ],

  // 文案撰写
  '文案撰写': [
    {
      title: '文案配置',
      params: [
        { key: 'copyType', label: '文案类型', type: 'select', defaultValue: 'marketing', options: [
          { label: '营销文案', value: 'marketing' },
          { label: '品牌文案', value: 'brand' },
          { label: '活动文案', value: 'event' },
          { label: '产品文案', value: 'product' },
          { label: '情感文案', value: 'emotion' },
        ]},
        { key: 'tone', label: '语气风格', type: 'select', defaultValue: 'professional', options: [
          { label: '专业正式', value: 'professional' },
          { label: '活泼轻松', value: 'casual' },
          { label: '幽默搞笑', value: 'humorous' },
          { label: '温暖治愈', value: 'warm' },
          { label: '高端大气', value: 'luxury' },
        ]},
        { key: 'length', label: '字数要求', type: 'select', defaultValue: 'medium', options: [
          { label: '短文案 (50字内)', value: 'short' },
          { label: '中文案 (100-300字)', value: 'medium' },
          { label: '长文案 (500字+)', value: 'long' },
        ]},
      ],
    },
  ],

  // 视频脚本
  '视频脚本': [
    {
      title: '脚本配置',
      params: [
        { key: 'duration', label: '视频时长', type: 'select', defaultValue: '15s', options: [
          { label: '15秒', value: '15s' },
          { label: '30秒', value: '30s' },
          { label: '60秒', value: '60s' },
          { label: '3分钟', value: '3min' },
          { label: '5分钟', value: '5min' },
        ]},
        { key: 'style', label: '脚本风格', type: 'select', defaultValue: 'funny', options: [
          { label: '搞笑反转', value: 'funny' },
          { label: '正经科普', value: 'serious' },
          { label: '温情故事', value: 'warm' },
          { label: '悬疑刺激', value: 'suspense' },
          { label: '干货教程', value: 'tutorial' },
        ]},
        { key: 'platform', label: '发布平台', type: 'select', defaultValue: 'douyin', options: [
          { label: '抖音', value: 'douyin' },
          { label: '快手', value: 'kuaishou' },
          { label: 'B站', value: 'bilibili' },
          { label: '小红书', value: 'xiaohongshu' },
          { label: '视频号', value: 'shipinhao' },
        ]},
      ],
    },
  ],

  // 直播运营
  '直播运营': [
    {
      title: '直播配置',
      params: [
        { key: 'liveType', label: '直播类型', type: 'select', defaultValue: 'sales', options: [
          { label: '带货直播', value: 'sales' },
          { label: '知识分享', value: 'knowledge' },
          { label: '娱乐互动', value: 'entertainment' },
          { label: '品牌发布会', value: 'brand' },
        ]},
        { key: 'liveDuration', label: '直播时长', type: 'select', defaultValue: '2h', options: [
          { label: '1小时', value: '1h' },
          { label: '2小时', value: '2h' },
          { label: '3小时', value: '3h' },
          { label: '4小时+', value: '4h' },
        ]},
        { key: 'goal', label: '直播目标', type: 'select', defaultValue: 'conversion', options: [
          { label: '促进转化', value: 'conversion' },
          { label: '涨粉引流', value: 'followers' },
          { label: '品牌曝光', value: 'brand' },
          { label: '用户留存', value: 'retention' },
        ]},
      ],
    },
  ],

  // 宠物
  '养宠指导': [
    {
      title: '宠物信息',
      params: [
        { key: 'petType', label: '宠物类型', type: 'select', defaultValue: 'dog', options: [
          { label: '狗狗', value: 'dog' },
          { label: '猫咪', value: 'cat' },
          { label: '兔子', value: 'rabbit' },
          { label: '仓鼠', value: 'hamster' },
          { label: '鸟类', value: 'bird' },
          { label: '其他', value: 'other' },
        ]},
        { key: 'petAge', label: '宠物年龄', type: 'select', defaultValue: 'adult', options: [
          { label: '幼年期 (0-1岁)', value: 'baby' },
          { label: '成年期 (1-7岁)', value: 'adult' },
          { label: '老年期 (7岁+)', value: 'senior' },
        ]},
        { key: 'issueType', label: '问题类型', type: 'select', defaultValue: 'health', options: [
          { label: '健康问题', value: 'health' },
          { label: '训练行为', value: 'training' },
          { label: '饮食营养', value: 'diet' },
          { label: '美容护理', value: 'grooming' },
          { label: '用品推荐', value: 'supplies' },
        ]},
      ],
    },
  ],

  // 校园生活
  '校园生活': [
    {
      title: '校园服务',
      params: [
        { key: 'serviceType', label: '服务类型', type: 'select', defaultValue: 'study', options: [
          { label: '学业辅导', value: 'study' },
          { label: '求职就业', value: 'career' },
          { label: '考试备考', value: 'exam' },
          { label: '心理成长', value: 'mental' },
          { label: '社团活动', value: 'club' },
        ]},
        { key: 'grade', label: '年级', type: 'select', defaultValue: 'undergrad1', options: [
          { label: '大一', value: 'undergrad1' },
          { label: '大二', value: 'undergrad2' },
          { label: '大三', value: 'undergrad3' },
          { label: '大四', value: 'undergrad4' },
          { label: '研究生', value: 'master' },
          { label: '博士生', value: 'phd' },
        ]},
      ],
    },
  ],

  // 商品运营 (电商)
  '商品运营': [
    {
      title: '电商配置',
      params: [
        { key: 'platform', label: '电商平台', type: 'select', defaultValue: 'taobao', options: [
          { label: '淘宝', value: 'taobao' },
          { label: '京东', value: 'jd' },
          { label: '拼多多', value: 'pdd' },
          { label: '抖音电商', value: 'douyin' },
          { label: '快手电商', value: 'kuaishou' },
        ]},
        { key: 'shopType', label: '店铺类型', type: 'select', defaultValue: 'product', options: [
          { label: '商品运营', value: 'product' },
          { label: '店铺管理', value: 'shop' },
          { label: '营销推广', value: 'marketing' },
          { label: '客服售后', value: 'service' },
        ]},
      ],
    },
  ],

  // 学习方法 (教育)
  '学习方法': [
    {
      title: '学习配置',
      params: [
        { key: 'subject', label: '学科', type: 'select', defaultValue: 'math', options: [
          { label: '数学', value: 'math' },
          { label: '语文', value: 'chinese' },
          { label: '英语', value: 'english' },
          { label: '物理', value: 'physics' },
          { label: '化学', value: 'chemistry' },
          { label: '生物', value: 'biology' },
          { label: '历史', value: 'history' },
          { label: '地理', value: 'geography' },
          { label: '政治', value: 'politics' },
        ]},
        { key: 'eduLevel', label: '教育阶段', type: 'select', defaultValue: 'high', options: [
          { label: '小学', value: 'primary' },
          { label: '初中', value: 'middle' },
          { label: '高中', value: 'high' },
          { label: '大学', value: 'college' },
          { label: '成人教育', value: 'adult' },
        ]},
      ],
    },
  ],

  // 对话聊天 (通用AI)
  '对话聊天': [
    {
      title: 'AI配置',
      params: [
        { key: 'model', label: 'AI模型', type: 'select', defaultValue: 'doubao-pro', options: [
          { label: '豆包 Pro', value: 'doubao-pro' },
          { label: '豆包 Lite', value: 'doubao-lite' },
          { label: 'DeepSeek', value: 'deepseek' },
          { label: '通义千问', value: 'qwen' },
          { label: 'GPT-4', value: 'gpt4' },
        ]},
        { key: 'responseStyle', label: '回复风格', type: 'select', defaultValue: 'balanced', options: [
          { label: '平衡', value: 'balanced' },
          { label: '创意', value: 'creative' },
          { label: '精确', value: 'precise' },
        ]},
      ],
    },
  ],

  // 数据分析
  '数据分析': [
    {
      title: '分析配置',
      params: [
        { key: 'analysisType', label: '分析类型', type: 'select', defaultValue: 'trend', options: [
          { label: '趋势分析', value: 'trend' },
          { label: '用户画像', value: 'user' },
          { label: '竞品分析', value: 'competitor' },
          { label: '财务报表', value: 'finance' },
          { label: '市场预测', value: 'forecast' },
        ]},
        { key: 'dataFormat', label: '数据格式', type: 'select', defaultValue: 'text', options: [
          { label: '文本描述', value: 'text' },
          { label: '表格数据', value: 'table' },
          { label: 'JSON数据', value: 'json' },
        ]},
      ],
    },
  ],

  // 编程开发
  '编程开发': [
    {
      title: '开发配置',
      params: [
        { key: 'language', label: '编程语言', type: 'select', defaultValue: 'javascript', options: [
          { label: 'JavaScript', value: 'javascript' },
          { label: 'Python', value: 'python' },
          { label: 'Java', value: 'java' },
          { label: 'Go', value: 'go' },
          { label: 'Rust', value: 'rust' },
          { label: 'C++', value: 'cpp' },
          { label: 'PHP', value: 'php' },
          { label: 'TypeScript', value: 'typescript' },
        ]},
        { key: 'taskType', label: '任务类型', type: 'select', defaultValue: 'code', options: [
          { label: '代码生成', value: 'code' },
          { label: 'Bug修复', value: 'debug' },
          { label: '代码审查', value: 'review' },
          { label: '架构设计', value: 'design' },
          { label: '算法优化', value: 'algorithm' },
        ]},
      ],
    },
  ],

  // 内容策划
  '内容策划': [
    {
      title: '策划配置',
      params: [
        { key: 'contentType', label: '内容类型', type: 'select', defaultValue: 'article', options: [
          { label: '图文文章', value: 'article' },
          { label: '短视频', value: 'short_video' },
          { label: '长视频', value: 'long_video' },
          { label: '直播', value: 'live' },
          { label: '音频播客', value: 'podcast' },
        ]},
        { key: 'targetAudience', label: '目标受众', type: 'select', defaultValue: 'general', options: [
          { label: '大众用户', value: 'general' },
          { label: '专业人士', value: 'professional' },
          { label: '年轻群体', value: 'young' },
          { label: '商务人士', value: 'business' },
        ]},
      ],
    },
  ],

  // 视觉设计
  '视觉设计': [
    {
      title: '设计配置',
      params: [
        { key: 'designType', label: '设计类型', type: 'select', defaultValue: 'cover', options: [
          { label: '封面设计', value: 'cover' },
          { label: '海报设计', value: 'poster' },
          { label: 'Logo设计', value: 'logo' },
          { label: 'Banner设计', value: 'banner' },
          { label: 'UI界面', value: 'ui' },
        ]},
        { key: 'colorStyle', label: '配色风格', type: 'select', defaultValue: 'cyber', options: [
          { label: '赛博朋克', value: 'cyber' },
          { label: '极简黑白', value: 'minimal' },
          { label: '渐变色', value: 'gradient' },
          { label: '暖色调', value: 'warm' },
          { label: '冷色调', value: 'cool' },
        ]},
      ],
    },
  ],

  // 账号运营
  '账号运营': [
    {
      title: '运营配置',
      params: [
        { key: 'platform', label: '运营平台', type: 'select', defaultValue: 'douyin', options: [
          { label: '抖音', value: 'douyin' },
          { label: '小红书', value: 'xiaohongshu' },
          { label: 'B站', value: 'bilibili' },
          { label: '公众号', value: 'wechat' },
          { label: '微博', value: 'weibo' },
        ]},
        { key: 'opGoal', label: '运营目标', type: 'select', defaultValue: 'growth', options: [
          { label: '涨粉增长', value: 'growth' },
          { label: '内容变现', value: 'monetize' },
          { label: '品牌塑造', value: 'brand' },
          { label: '用户活跃', value: 'engagement' },
        ]},
      ],
    },
  ],

  // 视频生成
  '视频生成': [
    {
      title: '视频配置',
      params: [
        { key: 'videoDuration', label: '视频时长', type: 'select', defaultValue: '5s', options: [
          { label: '5秒', value: '5s' },
          { label: '10秒', value: '10s' },
          { label: '15秒', value: '15s' },
          { label: '30秒', value: '30s' },
          { label: '60秒', value: '60s' },
        ]},
        { key: 'videoStyle', label: '视频风格', type: 'select', defaultValue: 'cinematic', options: [
          { label: '电影感', value: 'cinematic' },
          { label: '动漫风格', value: 'anime' },
          { label: '写实风格', value: 'realistic' },
          { label: '赛博朋克', value: 'cyberpunk' },
          { label: '梦幻唯美', value: 'dreamy' },
          { label: '复古怀旧', value: 'retro' },
        ]},
        { key: 'aspectRatio', label: '画面比例', type: 'select', defaultValue: '16:9', options: [
          { label: '16:9 横屏', value: '16:9' },
          { label: '9:16 竖屏', value: '9:16' },
          { label: '1:1 方形', value: '1:1' },
          { label: '4:3 横屏', value: '4:3' },
        ]},
        { key: 'resolution', label: '分辨率', type: 'select', defaultValue: '720p', options: [
          { label: '720P', value: '720p' },
          { label: '1080P', value: '1080p' },
          { label: '2K', value: '2k' },
        ]},
        { key: 'cameraMotion', label: '镜头运动', type: 'select', defaultValue: 'static', options: [
          { label: '固定镜头', value: 'static' },
          { label: '推镜头', value: 'push' },
          { label: '拉镜头', value: 'pull' },
          { label: '环绕镜头', value: 'orbit' },
          { label: '跟随镜头', value: 'follow' },
        ]},
        { key: 'sceneType', label: '场景类型', type: 'select', defaultValue: 'indoor', options: [
          { label: '室内场景', value: 'indoor' },
          { label: '室外场景', value: 'outdoor' },
          { label: '自然风光', value: 'nature' },
          { label: '城市街景', value: 'city' },
          { label: '科幻场景', value: 'scifi' },
        ]},
      ],
    },
  ],
}

// 获取工具参数配置
export function getToolParams(subCategory: string): ToolParamGroup[] {
  return toolParamMap[subCategory] || []
}

// 是否有参数配置
export function hasToolParams(subCategory: string): boolean {
  return !!toolParamMap[subCategory]
}
