// ============================================================
// 罗圣纪元管理后台 V8.1 核心逻辑
// (c) 2026 祁阳市罗圣纪元互联网科技有限责任公司
// 7大功能模块 + 用户审批 + 权限管理 + 赛博朋克UI + 移动端适配 + 开源Skill中台
// ============================================================

(function() {
'use strict';

// ========== 全局配置 ==========
var APP = {
  version: 'V8.1',
  company: '祁阳市罗圣纪元互联网科技有限责任公司',
  creditCode: '91431121MAKD052H05',
  capital: '52万元',
  founded: '2026-05-12',
  founder: '罗凯中',
  address: '湖南省永州市祁阳市长虹街道盘龙西路329号7楼',
  domain: 'lsjyapp.cn',
  site: 'https://h0int.github.io/lsjy-app/',
  prefix: 'lsjy_admin_',
  sessionKey: 'lsjy_admin_session',
  usersKey: 'lsjy3_users',
  creditsKey: 'lsjy3_credits',
  apiBase: (function() {
    var host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://localhost:3000/api/v1';
    if (host === 'h0int.github.io') return 'http://8.154.16.5:3000/api/v1';
    return 'https://' + host.replace('www.','').replace('m.','') + '/api/v1';
  })(),
  deviceType: (function() {
    var ua = navigator.userAgent || '';
    if (/Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(ua)) return 'mobile';
    if (/Tablet|iPad/i.test(ua)) return 'tablet';
    return 'desktop';
  })()
};

var DEFAULT_ADMIN = { username: 'KF02V9', password: 'LuoKaiZhong02V9', role: 'boss', status: 'approved', createTime: '2026-05-12T00:00:00' };

var DEFAULT_STATS = {
  totalUsers: 156, todayNewUsers: 3, activeUsers: 42,
  totalCredits: 28500, todayCredits: 1200,
  todayRevenue: 580, weekRevenue: 3200, monthRevenue: 12800
};

var TOOL_CATEGORIES = [
  { id: 'text', name: '文本生成', icon: 'fa-file-alt', tools: [
    {id:'t1',name:'AI文章生成',credit:5,enabled:true},{id:'t2',name:'AI摘要提取',credit:3,enabled:true},
    {id:'t3',name:'AI翻译助手',credit:2,enabled:true},{id:'t4',name:'AI改写润色',credit:4,enabled:true},
    {id:'t5',name:'AI续写扩写',credit:4,enabled:true},{id:'t6',name:'AI大纲生成',credit:3,enabled:true},
    {id:'t7',name:'AI邮件撰写',credit:2,enabled:true},{id:'t8',name:'AI公文写作',credit:5,enabled:true},
    {id:'t9',name:'AI诗歌创作',credit:3,enabled:true},{id:'t10',name:'AI小说续写',credit:5,enabled:true},
    {id:'t11',name:'AI文案生成',credit:3,enabled:true},{id:'t12',name:'AI标题生成',credit:2,enabled:true},
    {id:'t13',name:'AI作文批改',credit:4,enabled:true},{id:'t14',name:'AI论文辅助',credit:8,enabled:true},
    {id:'t15',name:'AI报告生成',credit:6,enabled:true},{id:'t16',name:'AI周报生成',credit:3,enabled:true},
    {id:'t17',name:'AI简历优化',credit:4,enabled:true},{id:'t18',name:'AI自我介绍',credit:2,enabled:true},
    {id:'t19',name:'AI演讲稿',credit:4,enabled:true},{id:'t20',name:'AI社交媒体文案',credit:3,enabled:true},
    {id:'t21',name:'AI商品描述',credit:3,enabled:true},{id:'t22',name:'AI广告语生成',credit:3,enabled:true},
    {id:'t23',name:'AI口号生成',credit:2,enabled:true},{id:'t24',name:'AI评论回复',credit:2,enabled:true},
    {id:'t25',name:'AI日记生成',credit:2,enabled:true},{id:'t26',name:'AI信件撰写',credit:3,enabled:true},
    {id:'t27',name:'AI邀请函',credit:3,enabled:true},{id:'t28',name:'AI感谢信',credit:2,enabled:true},
    {id:'t29',name:'AI检讨书',credit:3,enabled:true},{id:'t30',name:'AI请假条',credit:1,enabled:true}
  ]},
  { id: 'image', name: '图片生成', icon: 'fa-image', tools: [
    {id:'i1',name:'AI绘画',credit:10,enabled:true},{id:'i2',name:'AI头像生成',credit:5,enabled:true},
    {id:'i3',name:'AILogo设计',credit:8,enabled:true},{id:'i4',name:'AI海报生成',credit:8,enabled:true},
    {id:'i5',name:'AI图标生成',credit:5,enabled:true},{id:'i6',name:'AI壁纸生成',credit:6,enabled:true},
    {id:'i7',name:'AI表情包',credit:3,enabled:true},{id:'i8',name:'AI插画生成',credit:8,enabled:true},
    {id:'i9',name:'AI图片风格转换',credit:6,enabled:true},{id:'i10',name:'AI图片修复',credit:5,enabled:true},
    {id:'i11',name:'AI图片放大',credit:4,enabled:true},{id:'i12',name:'AI去水印',credit:3,enabled:true},
    {id:'i13',name:'AI背景替换',credit:5,enabled:true},{id:'i14',name:'AI抠图',credit:3,enabled:true},
    {id:'i15',name:'AI证件照',credit:5,enabled:true},{id:'i16',name:'AI照片上色',credit:4,enabled:true},
    {id:'i17',name:'AI动漫化',credit:6,enabled:true},{id:'i18',name:'AI图片融合',credit:7,enabled:true},
    {id:'i19',name:'AI名片设计',credit:5,enabled:true},{id:'i20',name:'AI商品图生成',credit:6,enabled:true},
    {id:'i21',name:'AI淘宝主图',credit:5,enabled:true},{id:'i22',name:'AI社交媒体封面',credit:5,enabled:true},
    {id:'i23',name:'AI书封面设计',credit:6,enabled:true},{id:'i24',name:'AI漫画生成',credit:10,enabled:true},
    {id:'i25',name:'AI像素画',credit:4,enabled:true},{id:'i26',name:'AI贴纸设计',credit:3,enabled:true},
    {id:'i27',name:'AI水印添加',credit:2,enabled:true},{id:'i28',name:'AI证件照换底色',credit:3,enabled:true},
    {id:'i29',name:'AI图片压缩',credit:1,enabled:true},{id:'i30',name:'AI图片格式转换',credit:1,enabled:true}
  ]},
  { id: 'code', name: '编程开发', icon: 'fa-code', tools: [
    {id:'c1',name:'AI代码生成',credit:6,enabled:true},{id:'c2',name:'AI代码审查',credit:5,enabled:true},
    {id:'c3',name:'AI代码解释',credit:3,enabled:true},{id:'c4',name:'AI代码优化',credit:5,enabled:true},
    {id:'c5',name:'AI代码转换',credit:4,enabled:true},{id:'c6',name:'AI单元测试',credit:4,enabled:true},
    {id:'c7',name:'AI正则生成',credit:2,enabled:true},{id:'c8',name:'AI SQL生成',credit:4,enabled:true},
    {id:'c9',name:'API文档生成',credit:3,enabled:true},{id:'c10',name:'AI代码注释',credit:2,enabled:true},
    {id:'c11',name:'AI Bug分析',credit:5,enabled:true},{id:'c12',name:'AI重构建议',credit:4,enabled:true},
    {id:'c13',name:'AI代码补全',credit:3,enabled:true},{id:'c14',name:'AI数据库设计',credit:5,enabled:true},
    {id:'c15',name:'AI接口设计',credit:4,enabled:true},{id:'c16',name:'AI架构设计',credit:8,enabled:true},
    {id:'c17',name:'AI微服务生成',credit:7,enabled:true},{id:'c18',name:'AI前端组件',credit:5,enabled:true},
    {id:'c19',name:'AI后端模板',credit:5,enabled:true},{id:'c20',name:'AI自动化脚本',credit:4,enabled:true},
    {id:'c21',name:'AI部署配置',credit:4,enabled:true},{id:'c22',name:'AI Dockerfile',credit:3,enabled:true},
    {id:'c23',name:'AI CI/CD配置',credit:4,enabled:true},{id:'c24',name:'AI环境搭建',credit:3,enabled:true},
    {id:'c25',name:'AI性能优化',credit:6,enabled:true},{id:'c26',name:'AI安全审计',credit:7,enabled:true},
    {id:'c27',name:'AI日志分析',credit:3,enabled:true},{id:'c28',name:'AI监控告警',credit:4,enabled:true},
    {id:'c29',name:'AI爬虫生成',credit:5,enabled:true},{id:'c30',name:'AI数据清洗',credit:4,enabled:true}
  ]},
  { id: 'audio', name: '音频视频', icon: 'fa-music', tools: [
    {id:'a1',name:'AI语音合成',credit:5,enabled:true},{id:'a2',name:'AI语音克隆',credit:10,enabled:true},
    {id:'a3',name:'AI音乐生成',credit:8,enabled:true},{id:'a4',name:'AI视频生成',credit:15,enabled:true},
    {id:'a5',name:'AI视频剪辑',credit:8,enabled:true},{id:'a6',name:'AI字幕生成',credit:4,enabled:true},
    {id:'a7',name:'AI音频转文字',credit:3,enabled:true},{id:'a8',name:'AI配音',credit:5,enabled:true},
    {id:'a9',name:'AI音效生成',credit:4,enabled:true},{id:'a10',name:'AI降噪',credit:3,enabled:true},
    {id:'a11',name:'AI歌曲创作',credit:8,enabled:true},{id:'a12',name:'AI播客生成',credit:6,enabled:true},
    {id:'a13',name:'AI视频摘要',credit:5,enabled:true},{id:'a14',name:'AI视频转GIF',credit:3,enabled:true},
    {id:'a15',name:'AI直播脚本',credit:4,enabled:true},{id:'a16',name:'AI短视频脚本',credit:4,enabled:true},
    {id:'a17',name:'AI视频封面',credit:3,enabled:true},{id:'a18',name:'AI人声分离',credit:6,enabled:true},
    {id:'a19',name:'AI节奏分析',credit:3,enabled:true},{id:'a20',name:'AI音频增强',credit:4,enabled:true},
    {id:'a21',name:'AI视频特效',credit:7,enabled:true},{id:'a22',name:'AI虚拟主播',credit:12,enabled:true},
    {id:'a23',name:'AI视频换脸',credit:10,enabled:true},{id:'a24',name:'AI视频去水印',credit:3,enabled:true},
    {id:'a25',name:'AI视频压缩',credit:2,enabled:true},{id:'a26',name:'AI视频格式转换',credit:2,enabled:true},
    {id:'a27',name:'AI音乐推荐',credit:1,enabled:true},{id:'a28',name:'AI歌词生成',credit:3,enabled:true},
    {id:'a29',name:'AI铃声制作',credit:2,enabled:true},{id:'a30',name:'AI彩铃生成',credit:3,enabled:true}
  ]},
  { id: 'data', name: '数据分析', icon: 'fa-chart-bar', tools: [
    {id:'d1',name:'AI数据分析',credit:6,enabled:true},{id:'d2',name:'AI数据可视化',credit:5,enabled:true},
    {id:'d3',name:'AI报表生成',credit:5,enabled:true},{id:'d4',name:'AI趋势预测',credit:7,enabled:true},
    {id:'d5',name:'AI异常检测',credit:6,enabled:true},{id:'d6',name:'AI用户分析',credit:5,enabled:true},
    {id:'d7',name:'AI竞品分析',credit:6,enabled:true},{id:'d8',name:'AI市场调研',credit:7,enabled:true},
    {id:'d9',name:'AI财务分析',credit:6,enabled:true},{id:'d10',name:'AI风险评估',credit:7,enabled:true},
    {id:'d11',name:'AI数据清洗',credit:4,enabled:true},{id:'d12',name:'AI特征工程',credit:5,enabled:true},
    {id:'d13',name:'AI数据标注',credit:4,enabled:true},{id:'d14',name:'AI模型评估',credit:5,enabled:true},
    {id:'d15',name:'AI文本挖掘',credit:5,enabled:true},{id:'d16',name:'AI情感分析',credit:4,enabled:true},
    {id:'d17',name:'AI关键词提取',credit:2,enabled:true},{id:'d18',name:'AI实体识别',credit:4,enabled:true},
    {id:'d19',name:'AI主题建模',credit:5,enabled:true},{id:'d20',name:'AI聚类分析',credit:5,enabled:true},
    {id:'d21',name:'AI回归分析',credit:5,enabled:true},{id:'d22',name:'AI分类预测',credit:5,enabled:true},
    {id:'d23',name:'AI时间序列',credit:6,enabled:true},{id:'d24',name:'AI推荐算法',credit:6,enabled:true},
    {id:'d25',name:'AIAB测试',credit:4,enabled:true},{id:'d26',name:'AI漏斗分析',credit:4,enabled:true},
    {id:'d27',name:'AI留存分析',credit:4,enabled:true},{id:'d28',name:'AI路径分析',credit:4,enabled:true},
    {id:'d29',name:'AI归因分析',credit:5,enabled:true},{id:'d30',name:'AI画像生成',credit:5,enabled:true}
  ]},
  { id: 'edu', name: '教育学习', icon: 'fa-graduation-cap', tools: [
    {id:'e1',name:'AI课程设计',credit:5,enabled:true},{id:'e2',name:'AI试题生成',credit:4,enabled:true},
    {id:'e3',name:'AI解题助手',credit:5,enabled:true},{id:'e4',name:'AI论文润色',credit:6,enabled:true},
    {id:'e5',name:'AI学习计划',credit:3,enabled:true},{id:'e6',name:'AI知识问答',credit:2,enabled:true},
    {id:'e7',name:'AI英语学习',credit:3,enabled:true},{id:'e8',name:'AI数学辅导',credit:4,enabled:true},
    {id:'e9',name:'AI编程教学',credit:4,enabled:true},{id:'e10',name:'AI阅读理解',credit:3,enabled:true},
    {id:'e11',name:'AI写作辅导',credit:4,enabled:true},{id:'e12',name:'AI口语练习',credit:4,enabled:true},
    {id:'e13',name:'AI单词记忆',credit:2,enabled:true},{id:'e14',name:'AI语法纠正',credit:3,enabled:true},
    {id:'e15',name:'AI文献综述',credit:7,enabled:true},{id:'e16',name:'AI实验设计',credit:5,enabled:true},
    {id:'e17',name:'AI数据分析教学',credit:4,enabled:true},{id:'e18',name:'AI面试准备',credit:4,enabled:true},
    {id:'e19',name:'AI职业规划',credit:3,enabled:true},{id:'e20',name:'AI技能评估',credit:3,enabled:true},
    {id:'e21',name:'AI考研辅导',credit:5,enabled:true},{id:'e22',name:'AI公考辅导',credit:5,enabled:true},
    {id:'e23',name:'AI翻译考证',credit:4,enabled:true},{id:'e24',name:'AI考证助手',credit:3,enabled:true},
    {id:'e25',name:'AI速读训练',credit:2,enabled:true},{id:'e26',name:'AI思维导图',credit:3,enabled:true},
    {id:'e27',name:'AI笔记整理',credit:2,enabled:true},{id:'e28',name:'AI错题本',credit:2,enabled:true},
    {id:'e29',name:'AI学习报告',credit:3,enabled:true},{id:'e30',name:'AI家教推荐',credit:2,enabled:true}
  ]},
  { id: 'life', name: '生活助手', icon: 'fa-heart', tools: [
    {id:'l1',name:'AI菜谱生成',credit:2,enabled:true},{id:'l2',name:'AI旅行规划',credit:4,enabled:true},
    {id:'l3',name:'AI健身计划',credit:3,enabled:true},{id:'l4',name:'AI营养分析',credit:2,enabled:true},
    {id:'l5',name:'AI穿搭建议',credit:2,enabled:true},{id:'l6',name:'AI装修设计',credit:6,enabled:true},
    {id:'l7',name:'AI宠物护理',credit:2,enabled:true},{id:'l8',name:'AI园艺指导',credit:2,enabled:true},
    {id:'l9',name:'AI法律咨询',credit:5,enabled:true},{id:'l10',name:'AI医疗咨询',credit:5,enabled:true},
    {id:'l11',name:'AI心理辅导',credit:4,enabled:true},{id:'l12',name:'AI情感分析',credit:3,enabled:true},
    {id:'l13',name:'AI星座运势',credit:1,enabled:true},{id:'l14',name:'AI起名',credit:3,enabled:true},
    {id:'l15',name:'AI对联生成',credit:2,enabled:true},{id:'l16',name:'AI谜语生成',credit:1,enabled:true},
    {id:'l17',name:'AI笑话生成',credit:1,enabled:true},{id:'l18',name:'AI故事创作',credit:3,enabled:true},
    {id:'l19',name:'AI计划制定',credit:2,enabled:true},{id:'l20',name:'AI日程安排',credit:2,enabled:true},
    {id:'l21',name:'AI理财建议',credit:4,enabled:true},{id:'l22',name:'AI保险推荐',credit:3,enabled:true},
    {id:'l23',name:'AI购物比价',credit:2,enabled:true},{id:'l24',name:'AI家电选购',credit:2,enabled:true},
    {id:'l25',name:'AI面试问答',credit:3,enabled:true},{id:'l26',name:'AI约会建议',credit:2,enabled:true},
    {id:'l27',name:'AI送礼推荐',credit:2,enabled:true},{id:'l28',name:'AI节日策划',credit:3,enabled:true},
    {id:'l29',name:'AI急救指南',credit:2,enabled:true},{id:'l30',name:'AI天气预报',credit:1,enabled:true}
  ]}
];

var SAMPLE_USERS = [
  {username:'user001',password:'pass001',status:'approved',registerTime:'2026-06-01T08:30:00',lastLogin:'2026-06-12T14:20:00',phone:'138****1234',email:'user001@lsjyapp.cn'},
  {username:'user002',password:'pass002',status:'approved',registerTime:'2026-06-02T09:15:00',lastLogin:'2026-06-12T10:05:00',phone:'139****5678',email:'user002@lsjyapp.cn'},
  {username:'user003',password:'pass003',status:'pending',registerTime:'2026-06-10T16:45:00',lastLogin:null,phone:'137****9012',email:'user003@lsjyapp.cn'},
  {username:'user004',password:'pass004',status:'approved',registerTime:'2026-06-03T11:20:00',lastLogin:'2026-06-11T09:30:00',phone:'136****3456',email:'user004@lsjyapp.cn'},
  {username:'user005',password:'pass005',status:'banned',registerTime:'2026-06-04T13:00:00',lastLogin:'2026-06-08T16:00:00',phone:'135****7890',email:'user005@lsjyapp.cn'},
  {username:'user006',password:'pass006',status:'pending',registerTime:'2026-06-11T07:30:00',lastLogin:null,phone:'134****2345',email:'user006@lsjyapp.cn'},
  {username:'user007',password:'pass007',status:'approved',registerTime:'2026-06-05T14:45:00',lastLogin:'2026-06-12T18:15:00',phone:'133****6789',email:'user007@lsjyapp.cn'},
  {username:'user008',password:'pass008',status:'approved',registerTime:'2026-06-06T10:00:00',lastLogin:'2026-06-10T12:00:00',phone:'132****0123',email:'user008@lsjyapp.cn'},
  {username:'user009',password:'pass009',status:'rejected',registerTime:'2026-06-07T08:00:00',lastLogin:null,phone:'131****4567',email:'user009@lsjyapp.cn'},
  {username:'user010',password:'pass010',status:'approved',registerTime:'2026-06-08T15:30:00',lastLogin:'2026-06-12T07:45:00',phone:'130****8901',email:'user010@lsjyapp.cn'},
  {username:'testuser',password:'test123',status:'pending',registerTime:'2026-06-12T09:00:00',lastLogin:null,phone:'158****2222',email:'test@lsjyapp.cn'}
];

var SAMPLE_CREDITS = {
  'KF02V9': 99999, 'user001': 500, 'user002': 320, 'user003': 100,
  'user004': 880, 'user005': 0, 'user006': 100, 'user007': 1500,
  'user008': 200, 'user009': 0, 'user010': 650, 'testuser': 100
};

var SAMPLE_ORDERS = [
  {id:'ORD20260601001',username:'user001',type:'recharge',amount:50,credits:500,method:'wechat',status:'completed',time:'2026-06-01T08:35:00'},
  {id:'ORD20260602001',username:'user002',type:'recharge',amount:30,credits:300,method:'alipay',status:'completed',time:'2026-06-02T09:20:00'},
  {id:'ORD20260604001',username:'user004',type:'recharge',amount:100,credits:1000,method:'qq',status:'completed',time:'2026-06-04T11:25:00'},
  {id:'ORD20260605001',username:'user007',type:'recharge',amount:150,credits:1500,method:'wechat',status:'completed',time:'2026-06-05T14:50:00'},
  {id:'ORD20260608001',username:'user008',type:'recharge',amount:20,credits:200,method:'alipay',status:'completed',time:'2026-06-08T10:05:00'},
  {id:'ORD20260610001',username:'user010',type:'recharge',amount:50,credits:500,method:'wechat',status:'pending',time:'2026-06-10T15:35:00'},
  {id:'ORD20260611001',username:'user001',type:'refund',amount:-20,credits:-200,method:'wechat',status:'processing',time:'2026-06-11T09:00:00'},
  {id:'ORD20260612001',username:'user004',type:'recharge',amount:80,credits:800,method:'qq',status:'completed',time:'2026-06-12T08:30:00'}
];

var SAMPLE_ANNOUNCEMENTS = [
  {id:1,title:'系统升级通知',content:'系统将于2026年6月15日进行升级维护，届时部分功能可能暂时不可用。',type:'important',status:'published',createTime:'2026-06-10T10:00:00',expireTime:'2026-06-20T00:00:00'},
  {id:2,title:'新工具上线公告',content:'新增AI编程助手系列工具，欢迎体验！',type:'normal',status:'published',createTime:'2026-06-08T14:00:00',expireTime:'2026-07-08T00:00:00'},
  {id:3,title:'端午节活动',content:'端午节期间充值满100送50算力！',type:'activity',status:'draft',createTime:'2026-06-05T09:00:00',expireTime:'2026-06-30T00:00:00'}
];

var SAMPLE_FAQS = [
  {id:1,question:'如何注册账号？',answer:'点击首页注册按钮，填写用户名、密码和手机号即可完成注册。注册后需等待管理员审批通过。',category:'账号',sort:1},
  {id:2,question:'算力是什么？',answer:'算力是使用AI工具的消耗单位，不同工具消耗不同算力。可通过充值获取更多算力。',category:'算力',sort:2},
  {id:3,question:'如何充值算力？',answer:'进入算力中心，选择充值套餐，支持微信、支付宝、QQ支付。',category:'支付',sort:3},
  {id:4,question:'注册后为什么无法登录？',answer:'新注册用户需要管理员审批通过后才能登录，请耐心等待1-2个工作日。',category:'账号',sort:4},
  {id:5,question:'如何联系客服？',answer:'可通过QQ群或发送邮件至support@lsjyapp.cn联系我们。',category:'其他',sort:5}
];

var SAMPLE_LOGS = [
  {time:'2026-06-12 18:30:00',type:'login',user:'KF02V9',detail:'管理员登录系统',ip:'192.168.1.1'},
  {time:'2026-06-12 18:25:00',type:'user',user:'KF02V9',detail:'审批通过用户 testuser',ip:'192.168.1.1'},
  {time:'2026-06-12 17:00:00',type:'system',user:'system',detail:'自动备份完成',ip:'-'},
  {time:'2026-06-12 15:30:00',type:'tool',user:'user001',detail:'使用 AI文章生成 消耗5算力',ip:'10.0.0.5'},
  {time:'2026-06-12 14:20:00',type:'login',user:'user001',detail:'用户登录',ip:'10.0.0.5'},
  {time:'2026-06-12 12:00:00',type:'finance',user:'KF02V9',detail:'处理退款订单 ORD20260611001',ip:'192.168.1.1'},
  {time:'2026-06-12 10:00:00',type:'system',user:'system',detail:'定时清理过期会话',ip:'-'},
  {time:'2026-06-12 09:00:00',type:'user',user:'user010',detail:'新用户注册',ip:'10.0.0.8'}
];

// ========== 开源Skill中台 示例数据 ==========
var SKILL_TOOLS = [
  {id:'sk1',name:'文本生成引擎',desc:'基于大语言模型的通用文本生成能力，支持多种文风与场景。',inputMode:'API',accessMode:'独立部署',creditCost:5,difficulty:'中',github:'https://github.com/lsjy-app/text-engine',status:'running'},
  {id:'sk2',name:'图像生成器',desc:'Stable Diffusion 封装服务，支持文生图、图生图、风格迁移。',inputMode:'API',accessMode:'嵌入适配',creditCost:10,difficulty:'高',github:'https://github.com/lsjy-app/image-gen',status:'running'},
  {id:'sk3',name:'代码助手',desc:'代码补全、审查、解释与重构建议，支持20+编程语言。',inputMode:'插件',accessMode:'独立部署',creditCost:6,difficulty:'中',github:'https://github.com/lsjy-app/code-assistant',status:'running'},
  {id:'sk4',name:'语音合成器',desc:'高质量TTS服务，支持多音色克隆与情感表达。',inputMode:'API',accessMode:'嵌入适配',creditCost:5,difficulty:'低',github:'https://github.com/lsjy-app/tts-core',status:'running'},
  {id:'sk5',name:'数据分析引擎',desc:'自动数据清洗、可视化与趋势预测一站式分析平台。',inputMode:'组件',accessMode:'独立部署',creditCost:6,difficulty:'高',github:'https://github.com/lsjy-app/data-engine',status:'stopped'},
  {id:'sk6',name:'翻译助手',desc:'多语言神经机器翻译，支持100+语言对。',inputMode:'API',accessMode:'嵌入适配',creditCost:2,difficulty:'低',github:'https://github.com/lsjy-app/translator',status:'running'},
  {id:'sk7',name:'PDF解析器',desc:'高精度PDF内容提取与结构化输出，支持表格与图表识别。',inputMode:'组件',accessMode:'独立部署',creditCost:3,difficulty:'中',github:'https://github.com/lsjy-app/pdf-parser',status:'running'},
  {id:'sk8',name:'知识图谱构建器',desc:'从非结构化文本中自动抽取实体关系并构建知识图谱。',inputMode:'API',accessMode:'独立部署',creditCost:8,difficulty:'高',github:'https://github.com/lsjy-app/kg-builder',status:'stopped'},
  {id:'sk9',name:'OCR文字识别',desc:'通用文字识别服务，支持多语言、多场景、手写体识别。',inputMode:'API',accessMode:'嵌入适配',creditCost:4,difficulty:'中',github:'https://github.com/lsjy-app/ocr-service',status:'running'},
  {id:'sk10',name:'智能客服',desc:'基于RAG的企业级智能客服系统，支持多轮对话与意图识别。',inputMode:'组件',accessMode:'独立部署',creditCost:7,difficulty:'高',github:'https://github.com/lsjy-app/smart-cs',status:'running'},
  {id:'sk11',name:'文档润色',desc:'公文、论文、简历等文档的智能润色与格式优化。',inputMode:'插件',accessMode:'嵌入适配',creditCost:4,difficulty:'低',github:'https://github.com/lsjy-app/doc-polish',status:'running'},
  {id:'sk12',name:'视频摘要',desc:'自动提取视频关键帧并生成文字摘要与章节导航。',inputMode:'API',accessMode:'独立部署',creditCost:8,difficulty:'高',github:'https://github.com/lsjy-app/video-summary',status:'stopped'},
  {id:'sk13',name:'邮件撰写助手',desc:'根据主题与收件人自动生成专业商务邮件。',inputMode:'插件',accessMode:'嵌入适配',creditCost:2,difficulty:'低',github:'https://github.com/lsjy-app/email-writer',status:'running'},
  {id:'sk14',name:'SQL生成器',desc:'自然语言转SQL，支持复杂查询与多表联查。',inputMode:'插件',accessMode:'嵌入适配',creditCost:4,difficulty:'中',github:'https://github.com/lsjy-app/sql-gen',status:'running'},
  {id:'sk15',name:'舆情监控',desc:'全网舆情实时采集、情感分析与预警推送。',inputMode:'组件',accessMode:'独立部署',creditCost:9,difficulty:'高',github:'https://github.com/lsjy-app/sentiment-monitor',status:'running'},
  {id:'sk16',name:'语音识别',desc:'高精度语音转文字，支持方言、噪音环境。',inputMode:'API',accessMode:'嵌入适配',creditCost:3,difficulty:'中',github:'https://github.com/lsjy-app/asr-core',status:'running'},
  {id:'sk17',name:'PPT生成器',desc:'根据大纲自动生成精美PPT，支持多种模板风格。',inputMode:'组件',accessMode:'独立部署',creditCost:6,difficulty:'中',github:'https://github.com/lsjy-app/ppt-gen',status:'stopped'},
  {id:'sk18',name:'思维导图生成',desc:'从文本或大纲自动生成结构化思维导图。',inputMode:'插件',accessMode:'嵌入适配',creditCost:3,difficulty:'低',github:'https://github.com/lsjy-app/mindmap-gen',status:'running'},
  {id:'sk19',name:'合同审查',desc:'法律合同关键条款提取、风险点识别与比对。',inputMode:'组件',accessMode:'独立部署',creditCost:8,difficulty:'高',github:'https://github.com/lsjy-app/contract-review',status:'running'},
  {id:'sk20',name:'会议纪要',desc:'会议录音自动转写并生成结构化会议纪要。',inputMode:'API',accessMode:'嵌入适配',creditCost:5,difficulty:'中',github:'https://github.com/lsjy-app/meeting-minutes',status:'running'},
  {id:'sk21',name:'简历评估',desc:'智能简历解析、打分与优化建议。',inputMode:'插件',accessMode:'嵌入适配',creditCost:4,difficulty:'低',github:'https://github.com/lsjy-app/resume-eval',status:'running'},
  {id:'sk22',name:'电商描述生成',desc:'基于商品属性自动生成高转化率的商品详情页文案。',inputMode:'API',accessMode:'嵌入适配',creditCost:3,difficulty:'低',github:'https://github.com/lsjy-app/ecom-copy',status:'running'},
  {id:'sk23',name:'3D模型生成',desc:'文本或图片驱动的高质量3D资产生成。',inputMode:'API',accessMode:'独立部署',creditCost:15,difficulty:'高',github:'https://github.com/lsjy-app/3d-gen',status:'stopped'},
  {id:'sk24',name:'实时翻译耳机',desc:'低延迟流式语音翻译，支持面对面双语对话。',inputMode:'组件',accessMode:'嵌入适配',creditCost:6,difficulty:'高',github:'https://github.com/lsjy-app/buds-trans',status:'running'}
];

// ========== 数据层 ==========
var Store = {
  get: function(key) {
    try { var v = localStorage.getItem(APP.prefix + key); return v ? JSON.parse(v) : null; }
    catch(e) { return null; }
  },
  set: function(key, val) {
    try { localStorage.setItem(APP.prefix + key, JSON.stringify(val)); } catch(e) {}
  },
  getUsers: function() {
    try { var v = localStorage.getItem(APP.usersKey); if (v) return JSON.parse(v); } catch(e) {}
    return null;
  },
  setUsers: function(users) {
    try { localStorage.setItem(APP.usersKey, JSON.stringify(users)); } catch(e) {}
  },
  getCredits: function() {
    try { var v = localStorage.getItem(APP.creditsKey); if (v) return JSON.parse(v); } catch(e) {}
    return null;
  },
  setCredits: function(credits) {
    try { localStorage.setItem(APP.creditsKey, JSON.stringify(credits)); } catch(e) {}
  },
  getSession: function() {
    try { var v = localStorage.getItem(APP.sessionKey); return v ? JSON.parse(v) : null; } catch(e) { return null; }
  },
  setSession: function(s) {
    try { localStorage.setItem(APP.sessionKey, JSON.stringify(s)); } catch(e) {}
  },
  clearSession: function() {
    try { localStorage.removeItem(APP.sessionKey); } catch(e) {}
  }
};

// ========== 初始化 ==========
function initData() {
  var users = Store.getUsers();
  if (!users || !users.length) {
    var allUsers = [DEFAULT_ADMIN].concat(SAMPLE_USERS);
    Store.setUsers(allUsers);
  } else {
    var adminExists = false;
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === 'KF02V9') {
        if (!users[i].role) users[i].role = 'boss';
        if (!users[i].status) users[i].status = 'approved';
        adminExists = true;
        break;
      }
    }
    if (!adminExists) { users.unshift(DEFAULT_ADMIN); }
    Store.setUsers(users);
  }
  var credits = Store.getCredits();
  if (!credits) { Store.setCredits(SAMPLE_CREDITS); }
  if (!Store.get('orders')) Store.set('orders', SAMPLE_ORDERS);
  if (!Store.get('announcements')) Store.set('announcements', SAMPLE_ANNOUNCEMENTS);
  if (!Store.get('faqs')) Store.set('faqs', SAMPLE_FAQS);
  if (!Store.get('tools')) Store.set('tools', TOOL_CATEGORIES);
  if (!Store.get('stats')) Store.set('stats', DEFAULT_STATS);
  if (!Store.get('logs')) Store.set('logs', SAMPLE_LOGS);
  if (!Store.get('admins')) {
    Store.set('admins', [{username:'KF02V9', role:'boss', createTime:'2026-05-12T00:00:00', status:'active'}]);
  }
  if (!Store.get('roles')) {
    Store.set('roles', [
      {id:'boss', name:'罗总专属', desc:'最高权限，拥有所有功能，仅限KF02V9', permissions:['all'], level:5},
      {id:'ultimate_admin', name:'至尊管理员', desc:'仅次于罗总，可管理所有模块', permissions:['all'], level:4},
      {id:'super_admin', name:'超级管理员', desc:'拥有所有权限，不可被修改', permissions:['all'], level:3},
      {id:'admin', name:'普通管理员', desc:'可管理用户和内容，不可管理权限和系统设置', permissions:['users','content','tools','finance'], level:2},
      {id:'premium', name:'高级用户', desc:'享有更多功能权限和更高配额', permissions:['tools','content'], level:1},
      {id:'normal', name:'普通用户', desc:'只能查看数据和使用基础功能', permissions:['view'], level:0}
    ]);
  }
  if (!Store.get('settings')) {
    Store.set('settings', {
      siteName: '罗圣纪元', siteDesc: '罗圣纪元 - AI工具聚合平台',
      theme: 'dark', apiKey: '', version: APP.version
    });
  }
  if (!Store.get('seo')) {
    Store.set('seo', {
      title: '罗圣纪元 - AI工具聚合平台',
      keywords: 'AI工具,人工智能,文本生成,图片生成,编程助手',
      description: '罗圣纪元提供200+AI工具，涵盖文本生成、图片生成、编程开发、音频视频、数据分析等全领域AI服务。',
      favicon: ''
    });
  }
  if (!Store.get('popups')) {
    Store.set('popups', [
      {id:1,title:'新用户福利',content:'注册即送100算力！',enabled:true,startTime:'2026-06-01',endTime:'2026-07-01'}
    ]);
  }
  if (!Store.get('changelogs')) {
    Store.set('changelogs', [
      {version:'V8.1',date:'2026-07-07',content:'新增开源Skill中台，支持API/插件/组件三种接入模式'},
      {version:'V6.0',date:'2026-06-13',content:'后台管理系统完全重建，7大功能模块上线'},
      {version:'V5.2',date:'2026-06-10',content:'修复CDN缓存问题，优化登录体验'},
      {version:'V5.0',date:'2026-06-05',content:'新增50个AI工具，优化算力系统'},
      {version:'V4.0',date:'2026-06-01',content:'全新UI设计，支持暗色主题'},
      {version:'V3.0',date:'2026-05-25',content:'用户审批系统上线'}
    ]);
  }
  if (!Store.get('skill_tools')) {
    Store.set('skill_tools', SKILL_TOOLS);
  }
}

// ========== 工具函数 ==========
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }
function formatTime(t) {
  if (!t) return '-';
  var d = new Date(t);
  return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes());
}
function formatDate(t) {
  if (!t) return '-';
  var d = new Date(t);
  return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
}
function pad(n) { return n < 10 ? '0'+n : ''+n; }
function uuid() { return 'id_'+Date.now()+'_'+Math.random().toString(36).substr(2,6); }

function esc(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}

function toast(msg, type) {
  type = type || 'info';
  var colors = { info: 'var(--p)', success: 'var(--ok)', error: 'var(--err)', warning: 'var(--warn)' };
  var icons = { info: 'fa-circle-info', success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation' };
  var el = document.createElement('div');
  el.className = 'admin-toast';
  el.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;padding:14px 22px;border-radius:10px;background:var(--card);border:1px solid '+colors[type]+';color:var(--w);font-size:14px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 24px rgba(0,0,0,.4),0 0 15px '+colors[type].replace('var(','').replace(')','')+'20;animation:slideInRight .3s ease;max-width:380px;backdrop-filter:blur(10px);';
  el.innerHTML = '<i class="fa-solid '+icons[type]+'" style="color:'+colors[type]+';font-size:16px;"></i><span style="line-height:1.5;">'+msg+'</span>';
  document.body.appendChild(el);
  setTimeout(function() { el.style.opacity='0'; el.style.transition='opacity .3s, transform .3s'; el.style.transform='translateX(20px)'; setTimeout(function(){ el.remove(); },300); }, 3000);
}

function confirmDialog(msg, onOk, onCancel) {
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.zIndex = '99998';
  var box = document.createElement('div');
  box.className = 'modal-box';
  box.style.maxWidth = '400px';
  box.innerHTML = '<div class="modal-header"><i class="fa-solid fa-triangle-exclamation" style="color:var(--warn)"></i>确认操作'+
    '<button class="modal-close" title="取消"><i class="fa-solid fa-xmark"></i></button></div>'+
    '<div style="font-size:14px;color:var(--nd);margin-bottom:20px;line-height:1.8;">'+msg+'</div>'+
    '<div style="display:flex;gap:10px;justify-content:flex-end;">'+
    '<button class="admin-btn-cancel" style="width:auto;">取消</button>'+
    '<button class="admin-btn-danger" style="width:auto;">确认</button></div>';
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  box.querySelector('.modal-close').onclick = function() { overlay.remove(); if(onCancel) onCancel(); };
  box.querySelector('.admin-btn-cancel').onclick = function() { overlay.remove(); if(onCancel) onCancel(); };
  box.querySelector('.admin-btn-danger').onclick = function() { overlay.remove(); if(onOk) onOk(); };
  overlay.onclick = function(e) { if(e.target===overlay){ overlay.remove(); if(onCancel) onCancel(); } };
}

function addLog(type, detail) {
  var logs = Store.get('logs') || [];
  var user = Store.getSession();
  logs.unshift({
    time: formatTime(new Date().toISOString()),
    type: type, user: user ? user.username : 'system',
    detail: detail, ip: '192.168.1.1'
  });
  if (logs.length > 200) logs = logs.slice(0, 200);
  Store.set('logs', logs);
}

// ========== 路由系统 ==========
var currentPage = '';
var routes = {
  dashboard: { render: renderDashboard, title: '数据看板' },
  users: { render: renderUsers, title: '用户管理' },
  tools: { render: renderTools, title: 'AI工具管理' },
  agent: { render: renderAgent, title: 'AI智能体' },
  orders: { render: renderOrders, title: '订单管理' },
  finance: { render: renderFinance, title: '财务管理' },
  content: { render: renderContent, title: '内容管理' },
  coupons: { render: renderCoupons, title: '优惠券' },
  tickets: { render: renderTickets, title: '工单管理' },
  marketing: { render: renderMarketing, title: '营销管理' },
  reports: { render: renderReports, title: '数据报表' },
  permissions: { render: renderPermissions, title: '权限管理' },
  settings: { render: renderSettings, title: '系统设置' },
  'recharge-review': { render: renderRechargeReview, title: '充值审核' },
  visitors: { render: renderVisitors, title: '访客管理' },
  skillcenter: { render: renderSkillCenter, title: '开源Skill中台' }
};

function navigate(page) {
  if (!routes[page]) page = 'dashboard';
  currentPage = page;
  window.location.hash = page;
  $$('.sb-item').forEach(function(el) {
    el.classList.toggle('active', el.dataset.page === page);
  });
  var titleEl = $('#page-title');
  if (titleEl) titleEl.textContent = routes[page].title;
  routes[page].render();
  if (window.innerWidth <= 768) { closeMobileSidebar(); }
}
window.navigate = navigate;

// ========== 渲染：数据看板 ==========
function renderDashboard() {
  var stats = Store.get('stats') || DEFAULT_STATS;
  var users = Store.getUsers() || [];
  var credits = Store.getCredits() || {};
  var pendingCount = users.filter(function(u){ return u.status==='pending'; }).length;
  var approvedCount = users.filter(function(u){ return u.status==='approved'; }).length;
  var bannedCount = users.filter(function(u){ return u.status==='banned'; }).length;
  var totalCreditBalance = 0;
  Object.keys(credits).forEach(function(k){ totalCreditBalance += (credits[k]||0); });
  var orders = Store.get('orders') || [];
  var todayOrders = orders.filter(function(o){ return o.status==='completed'&&o.type==='recharge'; }).length;

  var html = '<div class="dash-grid">';
  html += statCard('fa-users', '用户总数', stats.totalUsers, '已通过'+approvedCount+'人', 'var(--p)');
  html += statCard('fa-user-plus', '今日新增', stats.todayNewUsers, '待审批'+pendingCount+'人', 'var(--p2)');
  html += statCard('fa-bolt', '算力总量', totalCreditBalance, '今日消耗+'+stats.todayCredits, '#f59e0b');
  html += statCard('fa-coins', '今日收入', '¥'+stats.todayRevenue, '本周¥'+stats.weekRevenue, 'var(--ok)');
  html += statCard('fa-chart-line', '本月收入', '¥'+stats.monthRevenue, '环比+15%', 'var(--p2)');
  html += statCard('fa-clock', '待审批', pendingCount, pendingCount > 0 ? '需处理' : '无待处理', pendingCount > 0 ? 'var(--err)' : 'var(--ok)');
  html += statCard('fa-ban', '已封禁', bannedCount, '占比'+(stats.totalUsers>0?Math.round(bannedCount/stats.totalUsers*100):0)+'%', 'var(--err)');
  html += statCard('fa-receipt', '今日订单', todayOrders, '总'+orders.length+'笔', 'var(--p2)');
  html += '</div>';

  html += '<div style="margin-bottom:12px;display:flex;gap:8px;align-items:center;">';
  html += '<span style="color:var(--nd);font-size:13px;"><i class="fa-solid fa-chart-area" style="color:var(--p)"></i> 数据趋势</span>';
  html += '<button class="btn-xs" style="background:var(--p);color:#fff;border:none;" id="dash-period-7" onclick="AdminAPI.switchDashPeriod(7)">近7天</button>';
  html += '<button class="btn-xs" id="dash-period-30" onclick="AdminAPI.switchDashPeriod(30)">近30天</button>';
  html += '</div>';

  html += '<div class="dash-row">';
  html += '<div class="dash-card" style="flex:1;min-width:300px;">';
  html += '<div class="dash-card-header"><i class="fa-solid fa-ranking-star" style="color:var(--p)"></i> 工具使用排行 (Top 10)</div>';
  var topTools = [
    {name:'AI文章生成',count:1234},{name:'AI绘画',count:987},{name:'AI代码生成',count:856},
    {name:'AI语音合成',count:743},{name:'AI翻译助手',count:698},{name:'AI数据分析',count:654},
    {name:'AI图片修复',count:543},{name:'AI简历优化',count:498},{name:'AI学习计划',count:432},
    {name:'AI菜谱生成',count:387}
  ];
  var maxCount = topTools[0].count;
  html += '<div style="padding:0 16px 16px;">';
  topTools.forEach(function(t, i) {
    var pct = Math.round(t.count / maxCount * 100);
    var colors = ['var(--p)','var(--p2)','#f59e0b','var(--ok)','#ef4444'];
    var c = colors[i % colors.length];
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;font-size:13px;">';
    html += '<span style="width:20px;text-align:center;color:var(--nd);'+(i<3?'font-weight:700;color:'+c:'')+'">'+(i+1)+'</span>';
    html += '<span style="width:100px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+t.name+'</span>';
    html += '<div style="flex:1;height:8px;background:var(--w2);border-radius:4px;overflow:hidden;"><div style="width:'+pct+'%;height:100%;background:'+c+';border-radius:4px;transition:width .5s;"></div></div>';
    html += '<span style="color:var(--nd);width:50px;text-align:right;">'+t.count+'</span>';
    html += '</div>';
  });
  html += '</div></div>';

  html += '<div class="dash-card" style="flex:1;min-width:300px;">';
  html += '<div class="dash-card-header"><i class="fa-solid fa-chart-area" style="color:var(--p2)"></i> 用户增长趋势 (近7天)</div>';
  html += '<div style="padding:16px;">';
  html += renderSVGChart();
  html += '</div></div>';
  html += '</div>';

  html += '<div class="dash-row" style="margin-top:16px;">';
  html += '<div class="dash-card" style="flex:1;min-width:300px;">';
  html += '<div class="dash-card-header"><i class="fa-solid fa-map-location-dot" style="color:var(--p2)"></i> 用户地域分布 (模拟)</div>';
  var regions = [
    {name:'湖南',pct:28},{name:'广东',pct:18},{name:'北京',pct:12},{name:'上海',pct:10},
    {name:'浙江',pct:8},{name:'江苏',pct:7},{name:'四川',pct:5},{name:'湖北',pct:4},
    {name:'福建',pct:3},{name:'其他',pct:5}
  ];
  html += '<div style="padding:0 16px 16px;">';
  regions.forEach(function(r){
    var barColor = r.pct > 15 ? 'var(--p)' : r.pct > 8 ? 'var(--p2)' : '#f59e0b';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;font-size:13px;">';
    html += '<span style="width:50px;text-align:right;color:var(--nd);">'+r.name+'</span>';
    html += '<div style="flex:1;height:10px;background:var(--w2);border-radius:5px;overflow:hidden;"><div style="width:'+r.pct+'%;height:100%;background:'+barColor+';border-radius:5px;transition:width .5s;"></div></div>';
    html += '<span style="color:var(--nd);width:40px;text-align:right;">'+r.pct+'%</span>';
    html += '</div>';
  });
  html += '</div></div>';

  html += '<div class="dash-card" style="flex:1;min-width:300px;">';
  html += '<div class="dash-card-header"><i class="fa-solid fa-credit-card" style="color:var(--ok)"></i> 支付方式分布</div>';
  var paymentMethods = [{name:'微信支付',pct:52,icon:'fa-brands fa-weixin',color:'#07c160'},{name:'支付宝',pct:31,icon:'fa-brands fa-alipay',color:'#1677ff'},{name:'QQ支付',pct:17,icon:'fa-brands fa-qq',color:'#12b7f5'}];
  html += '<div style="padding:16px;">';
  paymentMethods.forEach(function(pm){
    html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:12px;background:var(--bg2);border-radius:8px;">';
    html += '<i class="fa-solid '+pm.icon+'" style="font-size:24px;color:'+pm.color+';width:30px;text-align:center;"></i>';
    html += '<div style="flex:1;"><div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-weight:600;">'+pm.name+'</span><span style="color:var(--nd);">'+pm.pct+'%</span></div>';
    html += '<div style="height:6px;background:var(--w2);border-radius:3px;overflow:hidden;"><div style="width:'+pm.pct+'%;height:100%;background:'+pm.color+';border-radius:3px;"></div></div>';
    html += '</div></div>';
  });
  html += '</div></div>';
  html += '</div>';

  html += '<div class="dash-card">';
  html += '<div class="dash-card-header"><i class="fa-solid fa-clock-rotate-left" style="color:var(--warn)"></i> 最近注册用户</div>';
  html += '<div class="table-wrapper"><table class="admin-table"><thead><tr><th>用户名</th><th>注册时间</th><th>状态</th><th>操作</th></tr></thead><tbody>';
  var recentUsers = users.slice().sort(function(a,b){ return new Date(b.registerTime||0)-new Date(a.registerTime||0); }).slice(0,8);
  recentUsers.forEach(function(u) {
    if (u.role === 'boss' || u.role === 'ultimate_admin' || u.role === 'super_admin') return;
    var statusMap = {pending:'<span class="badge badge-warn">待审批</span>',approved:'<span class="badge badge-ok">已通过</span>',banned:'<span class="badge badge-err">已封禁</span>',rejected:'<span class="badge badge-err">已拒绝</span>'};
    html += '<tr><td>'+u.username+'</td><td>'+formatTime(u.registerTime)+'</td><td>'+(statusMap[u.status]||u.status)+'</td>';
    html += '<td>';
    if (u.status === 'pending') {
      html += '<button class="btn-xs btn-ok" onclick="AdminAPI.approveUser(\''+u.username+'\')">通过</button>';
      html += '<button class="btn-xs btn-err" onclick="AdminAPI.rejectUser(\''+u.username+'\')">拒绝</button>';
    }
    html += '</td></tr>';
  });
  html += '</tbody></table></div></div>';

  $('#main-content').innerHTML = html;
}

function statCard(icon, label, value, sub, color) {
  return '<div class="stat-card"><div class="stat-icon" style="background:'+color+'15;color:'+color+'"><i class="fa-solid '+icon+'"></i></div>'+
    '<div class="stat-info"><div class="stat-value" style="color:'+color+'">'+value+'</div><div class="stat-label">'+label+'</div><div class="stat-sub">'+sub+'</div></div></div>';
}

function renderSVGChart(optData, optLabels, optColor, optH) {
  var data = optData || [12,18,15,22,28,25,31];
  var labels = optLabels || ['6/7','6/8','6/9','6/10','6/11','6/12','6/13'];
  var color = optColor || 'var(--p)';
  var w = 400, h = optH || 180, padX = 40, padY = 20;
  var maxV = Math.max.apply(null, data) * 1.2;
  var stepX = (w - padX*2) / (data.length - 1);
  var gradId = 'areaGrad' + Math.random().toString(36).substr(2,6);
  var glowId = 'glow' + Math.random().toString(36).substr(2,6);
  var points = data.map(function(v, i) {
    return (padX + i * stepX) + ',' + (h - padY - (v / maxV) * (h - padY*2));
  });
  var areaPoints = points.join(' ') + ' ' + (padX + (data.length-1)*stepX) + ',' + (h - padY) + ' ' + padX + ',' + (h - padY);
  var svg = '<svg viewBox="0 0 '+w+' '+h+'" style="width:100%;height:auto;">';
  svg += '<defs>';
  svg += '<linearGradient id="'+gradId+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+color+'" stop-opacity="0.25"/><stop offset="100%" stop-color="'+color+'" stop-opacity="0.02"/></linearGradient>';
  svg += '<filter id="'+glowId+'"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  svg += '</defs>';
  for (var i = 0; i <= 4; i++) {
    var y = padY + i * (h - padY*2) / 4;
    svg += '<line x1="'+padX+'" y1="'+y+'" x2="'+(w-padX)+'" y2="'+y+'" stroke="var(--bd)" stroke-width="0.5"/>';
  }
  svg += '<polygon points="'+areaPoints+'" fill="url(#'+gradId+')"/>';
  svg += '<polyline points="'+points.join(' ')+'" fill="none" stroke="'+color+'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#'+glowId+')"/>';
  data.forEach(function(v, i) {
    var x = padX + i * stepX;
    var y = h - padY - (v / maxV) * (h - padY*2);
    svg += '<circle cx="'+x+'" cy="'+y+'" r="4" fill="var(--bg3)" stroke="'+color+'" stroke-width="2" filter="url(#'+glowId+')"/>';
    svg += '<text x="'+x+'" y="'+(h-4)+'" text-anchor="middle" fill="var(--nd)" font-size="10">'+labels[i]+'</text>';
    svg += '<text x="'+x+'" y="'+(y-10)+'" text-anchor="middle" fill="'+color+'" font-size="10" font-weight="600">'+v+'</text>';
  });
  svg += '</svg>';
  return svg;
}

// ========== 渲染：用户管理 ==========
function renderUsers() {
  var users = Store.getUsers() || [];
  var credits = Store.getCredits() || {};
  var html = '<div class="page-toolbar">';
  html += '<div class="toolbar-left"><input type="text" id="user-search" placeholder="搜索用户名/手机/邮箱..." oninput="AdminAPI.filterUsers()">';
  html += '<select id="user-filter" onchange="AdminAPI.filterUsers()"><option value="">全部状态</option><option value="pending">待审批</option><option value="approved">已通过</option><option value="banned">已封禁</option><option value="rejected">已拒绝</option></select>';
  html += '<button class="admin-btn" style="font-size:12px;padding:4px 10px;" onclick="AdminAPI.exportUsers()"><i class="fa-solid fa-download"></i> 导出</button></div>';
  html += '<div class="toolbar-right">';
  html += '<button class="admin-btn" style="background:var(--ok);" onclick="AdminAPI.addUser()"><i class="fa-solid fa-user-plus"></i> 添加用户</button>';
  html += '<button class="admin-btn" onclick="AdminAPI.batchApprove()"><i class="fa-solid fa-check-double"></i> 批量通过</button>';
  html += '<button class="admin-btn" style="background:var(--warn);" onclick="AdminAPI.batchBan()"><i class="fa-solid fa-ban"></i> 批量封禁</button>';
  html += '<button class="admin-btn" style="background:var(--err);" onclick="AdminAPI.batchDelete()"><i class="fa-solid fa-trash"></i> 批量删除</button>';
  html += '</div></div>';
  html += '<div class="dash-card"><div style="overflow-x:auto;"><table class="admin-table" id="users-table"><thead><tr>';
  html += '<th><input type="checkbox" id="user-select-all" onchange="AdminAPI.toggleSelectAll(this)"></th>';
  html += '<th>用户名</th><th>状态</th><th>算力余额</th><th>注册时间</th><th>最后登录</th><th>操作</th>';
  html += '</tr></thead><tbody id="users-tbody">';
  users.forEach(function(u) { html += renderUserRow(u, credits[u.username] || 0); });
  html += '</tbody></table></div></div>';
  html += '<div id="user-pagination" class="pagination"></div>';
  $('#main-content').innerHTML = html;
  AdminAPI.filterUsers();
}

function renderUserRow(u, credit) {
  var statusMap = {pending:'<span class="badge badge-warn">待审批</span>',approved:'<span class="badge badge-ok">已通过</span>',banned:'<span class="badge badge-err">已封禁</span>',rejected:'<span class="badge badge-err">已拒绝</span>'};
  var isAdmin = u.role === 'boss' || u.role === 'ultimate_admin' || u.role === 'super_admin';
  var html = '<tr data-username="'+u.username+'" data-phone="'+(u.phone||'')+'" data-email="'+(u.email||'')+'" data-status="'+u.status+'">';
  html += '<td>'+(isAdmin?'':'<input type="checkbox" class="user-checkbox" value="'+u.username+'">')+'</td>';
  html += '<td><strong>'+u.username+'</strong>'+(isAdmin?' <span class="badge badge-p">超级管理员</span>':'')+'</td>';
  html += '<td>'+(statusMap[u.status]||u.status)+'</td>';
  html += '<td><span style="color:var(--p)">'+credit+'</span></td>';
  html += '<td>'+formatTime(u.registerTime)+'</td>';
  html += '<td>'+formatTime(u.lastLogin)+'</td>';
  html += '<td class="action-cell">';
  if (!isAdmin) {
    if (u.status === 'pending') {
      html += '<button class="btn-xs btn-ok" onclick="AdminAPI.approveUser(\''+u.username+'\')">通过</button>';
      html += '<button class="btn-xs btn-err" onclick="AdminAPI.rejectUser(\''+u.username+'\')">拒绝</button>';
    }
    if (u.status === 'approved') { html += '<button class="btn-xs btn-warn" onclick="AdminAPI.banUser(\''+u.username+'\')">封禁</button>'; }
    if (u.status === 'banned') { html += '<button class="btn-xs btn-ok" onclick="AdminAPI.unbanUser(\''+u.username+'\')">解封</button>'; }
    html += '<button class="btn-xs" onclick="AdminAPI.viewUserDetail(\''+u.username+'\')"><i class="fa-solid fa-eye"></i> 详情</button>';
    html += '<button class="btn-xs" onclick="AdminAPI.adjustCredits(\''+u.username+'\')"><i class="fa-solid fa-bolt"></i> 算力</button>';
    html += '<button class="btn-xs btn-err" onclick="AdminAPI.deleteUser(\''+u.username+'\')"><i class="fa-solid fa-trash"></i></button>';
  }
  html += '</td></tr>';
  return html;
}

// ========== 渲染：AI工具管理 ==========
function renderTools() {
  var toolCats = Store.get('tools') || TOOL_CATEGORIES;
  var totalTools = 0, enabledTools = 0;
  toolCats.forEach(function(cat) { cat.tools.forEach(function(t) { totalTools++; if (t.enabled) enabledTools++; }); });
  var html = '<div class="page-toolbar">';
  html += '<div class="toolbar-left"><span style="color:var(--nd);">共 <strong style="color:var(--p)">'+totalTools+'</strong> 个工具，已启用 <strong style="color:var(--ok)">'+enabledTools+'</strong> 个</span>';
  html += '<input type="text" id="tool-search" placeholder="搜索工具名称..." oninput="AdminAPI.searchTools()" style="margin-left:12px;">';
  html += '</div>';
  html += '<div class="toolbar-right">';
  html += '<button class="admin-btn" style="background:var(--ok);" onclick="AdminAPI.enableAllTools()"><i class="fa-solid fa-toggle-on"></i> 全部启用</button>';
  html += '<button class="admin-btn" style="background:var(--err);" onclick="AdminAPI.disableAllTools()"><i class="fa-solid fa-toggle-off"></i> 全部禁用</button>';
  html += '<button class="admin-btn" style="background:var(--p2);" onclick="AdminAPI.batchAdjustToolCredits()"><i class="fa-solid fa-sliders"></i> 批量调价</button>';
  html += '<button class="admin-btn" onclick="AdminAPI.resetTools()"><i class="fa-solid fa-rotate"></i> 重置默认</button>';
  html += '</div></div>';
  html += '<div class="tab-bar" id="tool-tabs">';
  html += '<div class="tab-item active" data-cat="all" onclick="AdminAPI.switchToolTab(\'all\',this)">全部</div>';
  toolCats.forEach(function(cat) {
    html += '<div class="tab-item" data-cat="'+cat.id+'" onclick="AdminAPI.switchToolTab(\''+cat.id+'\',this)">'+cat.name+' ('+cat.tools.length+')</div>';
  });
  html += '</div>';
  html += '<div id="tools-list">';
  html += renderToolsList(toolCats, 'all');
  html += '</div>';
  $('#main-content').innerHTML = html;
}

function renderToolsList(toolCats, filter) {
  var html = '';
  toolCats.forEach(function(cat) {
    if (filter !== 'all' && filter !== cat.id) return;
    html += '<div class="dash-card" style="margin-bottom:16px;">';
    html += '<div class="dash-card-header"><i class="fa-solid '+cat.icon+'" style="color:var(--p2)"></i> '+cat.name;
    html += '<label class="toggle-switch" style="float:right;"><input type="checkbox" '+(cat.tools.every(function(t){return t.enabled})?'checked':'')+' onchange="AdminAPI.toggleCategory(\''+cat.id+'\',this.checked)"><span class="toggle-slider"></span><span style="margin-left:8px;font-size:12px;color:var(--nd)">全部'+(cat.tools.every(function(t){return t.enabled})?'启用':'禁用')+'</span></label>';
    html += '</div>';
    html += '<div class="table-wrapper"><table class="admin-table"><thead><tr><th>工具ID</th><th>工具名称</th><th>算力消耗</th><th>状态</th><th>操作</th></tr></thead><tbody>';
    cat.tools.forEach(function(t) {
      html += '<tr><td style="color:var(--nd);font-size:12px;">'+t.id+'</td><td>'+t.name+'</td>';
      html += '<td><input type="number" value="'+t.credit+'" min="1" max="100" style="width:60px;background:var(--bg2);border:1px solid var(--bd);color:var(--w);padding:4px 8px;border-radius:4px;text-align:center;" onchange="AdminAPI.updateToolCredit(\''+cat.id+'\',\''+t.id+'\',this.value)"></td>';
      html += '<td><label class="toggle-switch"><input type="checkbox" '+(t.enabled?'checked':'')+' onchange="AdminAPI.toggleTool(\''+cat.id+'\',\''+t.id+'\',this.checked)"><span class="toggle-slider"></span></label></td>';
      html += '<td><span style="color:'+(t.enabled?'var(--ok)':'var(--nd)')+';font-size:12px;">'+(t.enabled?'运行中':'已禁用')+'</span></td>';
      html += '</tr>';
    });
    html += '</tbody></table></div></div>';
  });
  return html;
}

// ========== 渲染：财务管理 ==========
function renderFinance() {
  var orders = Store.get('orders') || SAMPLE_ORDERS;
  var totalIncome = orders.filter(function(o){return o.type==='recharge'&&o.status==='completed'}).reduce(function(s,o){return s+o.amount},0);
  var totalRefund = orders.filter(function(o){return o.type==='refund'}).reduce(function(s,o){return s+Math.abs(o.amount)},0);
  var html = '<div class="dash-grid">';
  html += statCard('fa-money-bill-wave', '总收入', '¥'+totalIncome, '充值收入', 'var(--ok)');
  html += statCard('fa-rotate-left', '退款总额', '¥'+totalRefund, '退款处理', 'var(--err)');
  html += statCard('fa-receipt', '净收入', '¥'+(totalIncome-totalRefund), '合计', 'var(--p)');
  html += statCard('fa-credit-card', '订单总数', orders.length, '笔', 'var(--p2)');
  html += '</div>';
  html += '<div class="tab-bar"><div class="tab-item active" onclick="AdminAPI.switchFinanceTab(\'orders\',this)">订单列表</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchFinanceTab(\'refunds\',this)">退款管理</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchFinanceTab(\'payments\',this)">支付方式</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchFinanceTab(\'revenue\',this)">收入趋势</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchFinanceTab(\'stats\',this)">财务统计</div></div>';
  html += '<div id="finance-content">';
  html += renderFinanceOrders(orders);
  html += '</div>';
  $('#main-content').innerHTML = html;
}

function renderFinanceOrders(orders) {
  var html = '<div class="dash-card"><div class="table-wrapper"><table class="admin-table"><thead><tr>';
  html += '<th>订单号</th><th>用户</th><th>类型</th><th>金额</th><th>算力</th><th>支付方式</th><th>状态</th><th>时间</th><th>操作</th>';
  html += '</tr></thead><tbody>';
  orders.forEach(function(o) {
    var typeMap = {recharge:'<span class="badge badge-ok">充值</span>',refund:'<span class="badge badge-err">退款</span>'};
    var methodMap = {wechat:'微信支付',alipay:'支付宝',qq:'QQ支付'};
    var statusMap = {completed:'<span class="badge badge-ok">已完成</span>',pending:'<span class="badge badge-warn">待处理</span>',processing:'<span class="badge badge-p">处理中</span>',failed:'<span class="badge badge-err">失败</span>'};
    html += '<tr><td style="font-size:12px;color:var(--nd)">'+o.id+'</td><td>'+o.username+'</td>';
    html += '<td>'+(typeMap[o.type]||o.type)+'</td>';
    html += '<td style="color:'+(o.amount>0?'var(--ok)':'var(--err)')+'">¥'+Math.abs(o.amount)+'</td>';
    html += '<td>'+(o.credits>0?'+':'')+o.credits+'</td>';
    html += '<td>'+(methodMap[o.method]||o.method)+'</td>';
    html += '<td>'+(statusMap[o.status]||o.status)+'</td>';
    html += '<td style="font-size:12px;">'+formatTime(o.time)+'</td>';
    html += '<td>';
    if (o.status === 'pending') html += '<button class="btn-xs btn-ok" onclick="AdminAPI.completeOrder(\''+o.id+'\')">完成</button>';
    if (o.status === 'processing') html += '<button class="btn-xs btn-ok" onclick="AdminAPI.completeOrder(\''+o.id+'\')">完成</button>';
    html += '</td></tr>';
  });
  html += '</tbody></table></div></div>';
  html += '<div style="margin-top:12px;text-align:right;"><button class="admin-btn" onclick="AdminAPI.exportFinance()"><i class="fa-solid fa-download"></i> 导出数据</button></div>';
  return html;
}

function renderFinanceRefunds() {
  var orders = Store.get('orders') || [];
  var refunds = orders.filter(function(o){return o.type==='refund'});
  var html = '<div class="dash-card"><div class="table-wrapper"><table class="admin-table"><thead><tr>';
  html += '<th>订单号</th><th>用户</th><th>退款金额</th><th>扣除算力</th><th>状态</th><th>时间</th><th>操作</th>';
  html += '</tr></thead><tbody>';
  if (refunds.length === 0) { html += '<tr><td colspan="7" style="text-align:center;color:var(--nd);padding:40px;">暂无退款记录</td></tr>'; }
  refunds.forEach(function(o) {
    var statusMap = {completed:'<span class="badge badge-ok">已完成</span>',processing:'<span class="badge badge-p">处理中</span>',pending:'<span class="badge badge-warn">待处理</span>'};
    html += '<tr><td style="font-size:12px;">'+o.id+'</td><td>'+o.username+'</td><td style="color:var(--err)">¥'+Math.abs(o.amount)+'</td><td>'+o.credits+'</td>';
    html += '<td>'+(statusMap[o.status]||o.status)+'</td>';
    html += '<td style="font-size:12px;">'+formatTime(o.time)+'</td>';
    html += '<td>';
    if (o.status === 'processing') html += '<button class="btn-xs btn-ok" onclick="AdminAPI.approveRefund(\''+o.id+'\')">批准</button><button class="btn-xs btn-err" onclick="AdminAPI.rejectRefund(\''+o.id+'\')">拒绝</button>';
    html += '</td></tr>';
  });
  html += '</tbody></table></div></div>';
  return html;
}

function renderFinancePayments() {
  var html = '<div class="dash-grid">';
  html += '<div class="dash-card"><div class="dash-card-header"><i class="fa-brands fa-weixin" style="color:#07c160"></i> 微信支付</div>';
  html += '<div style="padding:16px;"><p style="color:var(--nd);margin-bottom:12px;">配置微信支付参数</p>';
  html += '<div class="form-group"><label>商户号</label><input type="text" placeholder="请输入商户号" style="width:100%"></div>';
  html += '<div class="form-group"><label>API密钥</label><input type="password" placeholder="请输入API密钥" style="width:100%"></div>';
  html += '<button class="admin-btn" onclick="toast(\'微信支付配置已保存\',\'success\')">保存配置</button>';
  html += '</div></div>';
  html += '<div class="dash-card"><div class="dash-card-header"><i class="fa-brands fa-alipay" style="color:#1677ff"></i> 支付宝</div>';
  html += '<div style="padding:16px;"><p style="color:var(--nd);margin-bottom:12px;">配置支付宝参数</p>';
  html += '<div class="form-group"><label>AppID</label><input type="text" placeholder="请输入AppID" style="width:100%"></div>';
  html += '<div class="form-group"><label>私钥</label><input type="password" placeholder="请输入应用私钥" style="width:100%"></div>';
  html += '<button class="admin-btn" onclick="toast(\'支付宝配置已保存\',\'success\')">保存配置</button>';
  html += '</div></div>';
  html += '<div class="dash-card"><div class="dash-card-header"><i class="fa-brands fa-qq" style="color:#12b7f5"></i> QQ支付</div>';
  html += '<div style="padding:16px;"><p style="color:var(--nd);margin-bottom:12px;">配置QQ支付参数</p>';
  html += '<div class="form-group"><label>商户号</label><input type="text" placeholder="请输入商户号" style="width:100%"></div>';
  html += '<div class="form-group"><label>API密钥</label><input type="password" placeholder="请输入API密钥" style="width:100%"></div>';
  html += '<button class="admin-btn" onclick="toast(\'QQ支付配置已保存\',\'success\')">保存配置</button>';
  html += '</div></div>';
  html += '</div>';
  return html;
}

// ========== 渲染：内容管理 ==========
function renderContent() {
  var html = '<div class="tab-bar"><div class="tab-item active" onclick="AdminAPI.switchContentTab(\'announcements\',this)">公告管理</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchContentTab(\'faq\',this)">FAQ管理</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchContentTab(\'seo\',this)">SEO设置</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchContentTab(\'popup\',this)">弹窗广告</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchContentTab(\'changelog\',this)">版本日志</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchContentTab(\'emailtpl\',this)">邮件模板</div></div>';
  html += '<div id="content-tab-content">';
  html += renderContentAnnouncements();
  html += '</div>';
  $('#main-content').innerHTML = html;
}

function renderContentAnnouncements() {
  var anns = Store.get('announcements') || [];
  var html = '<div class="page-toolbar"><div class="toolbar-left"><span style="color:var(--nd)">共 '+anns.length+' 条公告</span></div>';
  html += '<div class="toolbar-right"><button class="admin-btn" onclick="AdminAPI.addAnnouncement()"><i class="fa-solid fa-plus"></i> 新增公告</button></div></div>';
  html += '<div class="dash-card"><div class="table-wrapper"><table class="admin-table"><thead><tr>';
  html += '<th>标题</th><th>类型</th><th>状态</th><th>创建时间</th><th>过期时间</th><th>操作</th>';
  html += '</tr></thead><tbody>';
  anns.forEach(function(a) {
    var typeMap = {important:'<span class="badge badge-err">重要</span>',normal:'<span class="badge badge-ok">普通</span>',activity:'<span class="badge badge-p">活动</span>'};
    var statusMap = {published:'<span class="badge badge-ok">已发布</span>',draft:'<span class="badge badge-warn">草稿</span>'};
    html += '<tr><td>'+a.title+'</td><td>'+(typeMap[a.type]||a.type)+'</td><td>'+(statusMap[a.status]||a.status)+'</td>';
    html += '<td style="font-size:12px;">'+formatTime(a.createTime)+'</td>';
    html += '<td style="font-size:12px;">'+formatTime(a.expireTime)+'</td>';
    html += '<td><button class="btn-xs" onclick="AdminAPI.previewAnnouncement('+a.id+')"><i class="fa-solid fa-eye"></i></button>';
    html += '<button class="btn-xs" onclick="AdminAPI.editAnnouncement('+a.id+')"><i class="fa-solid fa-pen"></i></button>';
    html += '<button class="btn-xs btn-err" onclick="AdminAPI.deleteAnnouncement('+a.id+')"><i class="fa-solid fa-trash"></i></button></td></tr>';
  });
  html += '</tbody></table></div></div>';
  return html;
}

function renderContentFAQ() {
  var faqs = Store.get('faqs') || [];
  var html = '<div class="page-toolbar"><div class="toolbar-left"><span style="color:var(--nd)">共 '+faqs.length+' 条FAQ</span></div>';
  html += '<div class="toolbar-right"><button class="admin-btn" onclick="AdminAPI.addFAQ()"><i class="fa-solid fa-plus"></i> 新增FAQ</button></div></div>';
  html += '<div class="dash-card"><div class="table-wrapper"><table class="admin-table"><thead><tr>';
  html += '<th>排序</th><th>分类</th><th>问题</th><th>答案</th><th>操作</th>';
  html += '</tr></thead><tbody>';
  faqs.forEach(function(f) {
    html += '<tr><td>'+f.sort+'</td><td><span class="badge badge-p">'+f.category+'</span></td><td>'+f.question+'</td>';
    html += '<td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+f.answer+'</td>';
    html += '<td><button class="btn-xs" onclick="AdminAPI.editFAQ('+f.id+')"><i class="fa-solid fa-pen"></i></button>';
    html += '<button class="btn-xs btn-err" onclick="AdminAPI.deleteFAQ('+f.id+')"><i class="fa-solid fa-trash"></i></button></td></tr>';
  });
  html += '</tbody></table></div></div>';
  return html;
}

function renderContentSEO() {
  var seo = Store.get('seo') || {};
  var html = '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-magnifying-glass-chart" style="color:var(--p)"></i> SEO设置</div>';
  html += '<div style="padding:16px;">';
  html += '<div class="form-group"><label>网站标题</label><input type="text" id="seo-title" value="'+(seo.title||'')+'" style="width:100%"></div>';
  html += '<div class="form-group"><label>关键词</label><input type="text" id="seo-keywords" value="'+(seo.keywords||'')+'" style="width:100%"></div>';
  html += '<div class="form-group"><label>描述</label><textarea id="seo-desc" rows="3" style="width:100%">'+(seo.description||'')+'</textarea></div>';
  html += '<button class="admin-btn" onclick="AdminAPI.saveSEO()"><i class="fa-solid fa-save"></i> 保存</button>';
  html += '</div></div>';
  return html;
}

function renderContentPopup() {
  var popups = Store.get('popups') || [];
  var html = '<div class="page-toolbar"><div class="toolbar-left"><span style="color:var(--nd)">共 '+popups.length+' 个弹窗广告</span></div>';
  html += '<div class="toolbar-right"><button class="admin-btn" onclick="AdminAPI.addPopup()"><i class="fa-solid fa-plus"></i> 新增弹窗</button></div></div>';
  html += '<div class="dash-card"><div class="table-wrapper"><table class="admin-table"><thead><tr>';
  html += '<th>标题</th><th>内容</th><th>状态</th><th>开始时间</th><th>结束时间</th><th>操作</th>';
  html += '</tr></thead><tbody>';
  popups.forEach(function(p) {
    html += '<tr><td>'+p.title+'</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;">'+p.content+'</td>';
    html += '<td>'+(p.enabled?'<span class="badge badge-ok">启用</span>':'<span class="badge badge-warn">禁用</span>')+'</td>';
    html += '<td style="font-size:12px;">'+p.startTime+'</td><td style="font-size:12px;">'+p.endTime+'</td>';
    html += '<td><label class="toggle-switch"><input type="checkbox" '+(p.enabled?'checked':'')+' onchange="AdminAPI.togglePopup('+p.id+',this.checked)"><span class="toggle-slider"></span></label>';
    html += '<button class="btn-xs" onclick="AdminAPI.previewPopup('+p.id+')"><i class="fa-solid fa-eye"></i></button>';
    html += '<button class="btn-xs btn-err" onclick="AdminAPI.deletePopup('+p.id+')"><i class="fa-solid fa-trash"></i></button></td></tr>';
  });
  html += '</tbody></table></div></div>';
  return html;
}

function renderContentChangelog() {
  var logs = Store.get('changelogs') || [];
  var html = '<div class="page-toolbar"><div class="toolbar-left"><span style="color:var(--nd)">共 '+logs.length+' 条版本记录</span></div>';
  html += '<div class="toolbar-right"><button class="admin-btn" onclick="AdminAPI.addChangelog()"><i class="fa-solid fa-plus"></i> 新增版本</button></div></div>';
  html += '<div class="dash-card" style="padding:20px;">';
  logs.forEach(function(l, idx) {
    html += '<div style="margin-bottom:20px;padding-left:20px;border-left:3px solid var(--p);position:relative;">';
    html += '<div style="font-size:16px;font-weight:700;color:var(--p);">'+l.version+' <span style="font-size:12px;color:var(--nd);font-weight:400;">'+l.date+'</span>';
    html += '<div style="float:right;display:flex;gap:6px;">';
    html += '<button class="btn-xs" onclick="AdminAPI.editChangelog('+idx+')"><i class="fa-solid fa-pen"></i></button>';
    html += '<button class="btn-xs btn-err" onclick="AdminAPI.deleteChangelog('+idx+')"><i class="fa-solid fa-trash"></i></button>';
    html += '</div></div>';
    html += '<div style="color:var(--nd);margin-top:4px;">'+l.content+'</div>';
    html += '</div>';
  });
  html += '</div>';
  return html;
}

// ========== 渲染：权限管理 ==========
function renderPermissions() {
  var roles = Store.get('roles') || [];
  var admins = Store.get('admins') || [];
  var html = '<div class="tab-bar"><div class="tab-item active" onclick="AdminAPI.switchPermTab(\'roles\',this)">角色管理</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchPermTab(\'admins\',this)">管理员账号</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchPermTab(\'matrix\',this)">权限矩阵</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchPermTab(\'audit\',this)">操作审计</div></div>';
  html += '<div id="perm-content">';
  html += '<div class="dash-grid">';
  roles.forEach(function(r) {
    var isSuper = r.id === 'boss' || r.id === 'ultimate_admin' || r.id === 'super_admin';
    html += '<div class="dash-card">';
    html += '<div class="dash-card-header"><i class="fa-solid '+(isSuper?'fa-crown':'fa-user-shield')+'" style="color:'+(isSuper?'#f59e0b':'var(--p)')+'"></i> '+r.name;
    if (isSuper) html += ' <span class="badge badge-warn" style="font-size:10px;">不可修改</span>';
    html += '</div>';
    html += '<div style="padding:16px;"><p style="color:var(--nd);margin-bottom:12px;">'+r.desc+'</p>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
    r.permissions.forEach(function(p) {
      var permMap = {all:'全部权限',users:'用户管理',content:'内容管理',tools:'工具管理',finance:'财务管理',view:'查看权限',permissions:'权限管理',settings:'系统设置'};
      html += '<span class="badge badge-p" style="font-size:11px;">'+(permMap[p]||p)+'</span>';
    });
    html += '</div>';
    if (!isSuper) { html += '<div style="margin-top:12px;"><button class="admin-btn" style="font-size:12px;" onclick="AdminAPI.editRole(\''+r.id+'\')"><i class="fa-solid fa-pen"></i> 编辑</button></div>'; }
    html += '</div></div>';
  });
  html += '</div>';
  html += '</div>';
  $('#main-content').innerHTML = html;
}

function renderPermAdmins() {
  var admins = Store.get('admins') || [];
  var html = '<div class="page-toolbar"><div class="toolbar-left"></div>';
  html += '<div class="toolbar-right"><button class="admin-btn" onclick="AdminAPI.addAdmin()"><i class="fa-solid fa-plus"></i> 添加管理员</button></div></div>';
  html += '<div class="dash-card"><div class="table-wrapper"><table class="admin-table"><thead><tr>';
  html += '<th>用户名</th><th>角色</th><th>状态</th><th>创建时间</th><th>操作</th>';
  html += '</tr></thead><tbody>';
  admins.forEach(function(a) {
    var roleMap = {boss:'<span class="badge" style="background:rgba(255,215,0,0.15);color:#ffd700;border:1px solid rgba(255,215,0,0.4)">罗总专属</span>',ultimate_admin:'<span class="badge" style="background:rgba(255,0,255,0.1);color:var(--p2);border:1px solid rgba(255,0,255,0.3)">至尊管理员</span>',super_admin:'<span class="badge badge-warn">超级管理员</span>',admin:'<span class="badge badge-p">普通管理员</span>',premium:'<span class="badge badge-ok">高级用户</span>',normal:'<span class="badge badge-ok">普通用户</span>'};
    var isSuper = a.role === 'boss' || a.role === 'ultimate_admin' || a.role === 'super_admin';
    html += '<tr><td><strong>'+a.username+'</strong></td><td>'+(roleMap[a.role]||a.role)+'</td>';
    html += '<td><span class="badge badge-ok">'+(a.status==='active'?'活跃':'禁用')+'</span></td>';
    html += '<td style="font-size:12px;">'+formatTime(a.createTime)+'</td>';
    html += '<td>';
    if (!isSuper) {
      html += '<button class="btn-xs" onclick="AdminAPI.editAdmin(\''+a.username+'\')"><i class="fa-solid fa-pen"></i></button>';
      html += '<button class="btn-xs btn-err" onclick="AdminAPI.removeAdmin(\''+a.username+'\')"><i class="fa-solid fa-trash"></i></button>';
    }
    html += '</td></tr>';
  });
  html += '</tbody></table></div></div>';
  return html;
}

// ========== 渲染：系统设置 ==========
function renderSettings() {
  var settings = Store.get('settings') || {};
  var html = '<div class="tab-bar"><div class="tab-item active" onclick="AdminAPI.switchSettingsTab(\'basic\',this)">基本设置</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchSettingsTab(\'theme\',this)">主题设置</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchSettingsTab(\'api\',this)">API配置</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchSettingsTab(\'email\',this)">邮件模板</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchSettingsTab(\'backup\',this)">数据备份</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchSettingsTab(\'logs\',this)">系统日志</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchSettingsTab(\'health\',this)">健康检查</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchSettingsTab(\'about\',this)">关于系统</div></div>';
  html += '<div id="settings-content">';
  html += renderSettingsBasic(settings);
  html += '</div>';
  $('#main-content').innerHTML = html;
}

function renderSettingsBasic(settings) {
  var html = '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-gear" style="color:var(--p)"></i> 基本设置</div>';
  html += '<div style="padding:16px;">';
  html += '<div class="form-group"><label>网站名称</label><input type="text" id="set-sitename" value="'+(settings.siteName||'罗圣纪元')+'" style="width:100%"></div>';
  html += '<div class="form-group"><label>网站描述</label><textarea id="set-sitedesc" rows="3" style="width:100%">'+(settings.siteDesc||'')+'</textarea></div>';
  html += '<div class="form-group"><label>Logo URL</label><input type="text" id="set-logo" placeholder="输入Logo图片URL" style="width:100%"></div>';
  html += '<button class="admin-btn" onclick="AdminAPI.saveBasicSettings()"><i class="fa-solid fa-save"></i> 保存设置</button>';
  html += '</div></div>';
  return html;
}

function renderSettingsTheme() {
  var settings = Store.get('settings') || {};
  var current = settings.theme || 'dark';
  var html = '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-palette" style="color:var(--p2)"></i> 主题设置</div>';
  html += '<div style="padding:16px;">';
  var themes = [
    {id:'dark',name:'深色模式',desc:'科技感深色主题',preview:'background:#0a0e17;color:#00f5ff;'},
    {id:'light',name:'日间模式',desc:'明亮简洁风格',preview:'background:#f8fafc;color:#0088cc;'},
    {id:'enterprise',name:'商务模式',desc:'金色商务风格',preview:'background:#0d0d1a;color:#f59e0b;'}
  ];
  themes.forEach(function(t) {
    html += '<div class="theme-option '+(current===t.id?'active':'')+'" onclick="AdminAPI.setTheme(\''+t.id+'\')" style="cursor:pointer;padding:16px;margin-bottom:12px;border:2px solid '+(current===t.id?'var(--p)':'var(--bd)')+';border-radius:10px;display:flex;align-items:center;gap:16px;transition:.2s;">';
    html += '<div style="width:60px;height:40px;border-radius:6px;'+t.preview+'display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">Aa</div>';
    html += '<div><div style="font-weight:600;">'+t.name+'</div><div style="font-size:12px;color:var(--nd);">'+t.desc+'</div></div>';
    if (current === t.id) html += '<i class="fa-solid fa-circle-check" style="margin-left:auto;color:var(--p);font-size:20px;"></i>';
    html += '</div>';
  });
  html += '</div></div>';
  return html;
}

function renderSettingsAPI() {
  var settings = Store.get('settings') || {};
  var html = '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-plug" style="color:var(--p)"></i> API配置</div>';
  html += '<div style="padding:16px;">';
  html += '<p style="color:var(--nd);margin-bottom:16px;">配置豆包AI Key后，系统将调用真实AI接口。留空则使用模拟数据。</p>';
  html += '<div class="form-group"><label>豆包AI API Key</label><input type="password" id="set-apikey" value="'+(settings.apiKey||'')+'" placeholder="请输入API Key" style="width:100%"></div>';
  html += '<div class="form-group"><label>API端点</label><input type="text" id="set-apiendpoint" value="'+(settings.apiEndpoint||'https://ark.cn-beijing.volces.com/api/v3')+'" placeholder="API端点URL" style="width:100%"></div>';
  html += '<button class="admin-btn" onclick="AdminAPI.saveAPISettings()"><i class="fa-solid fa-save"></i> 保存配置</button>';
  html += '<button class="admin-btn" style="margin-left:8px;background:var(--p2);" onclick="AdminAPI.testAPI()"><i class="fa-solid fa-vial"></i> 测试连接</button>';
  html += '</div></div>';
  return html;
}

function renderSettingsBackup() {
  var html = '<div class="dash-grid">';
  html += '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-download" style="color:var(--ok)"></i> 数据备份</div>';
  html += '<div style="padding:16px;"><p style="color:var(--nd);margin-bottom:16px;">导出所有系统数据为JSON文件</p>';
  html += '<button class="admin-btn" style="background:var(--ok);" onclick="AdminAPI.backupData()"><i class="fa-solid fa-download"></i> 立即备份</button>';
  html += '</div></div>';
  html += '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-upload" style="color:var(--p2)"></i> 数据恢复</div>';
  html += '<div style="padding:16px;"><p style="color:var(--nd);margin-bottom:16px;">从JSON文件恢复系统数据（将覆盖当前数据）</p>';
  html += '<input type="file" id="restore-file" accept=".json" style="color:var(--nd);margin-bottom:12px;">';
  html += '<button class="admin-btn" style="background:var(--p2);" onclick="AdminAPI.restoreData()"><i class="fa-solid fa-upload"></i> 恢复数据</button>';
  html += '</div></div>';
  html += '</div>';
  html += '<div class="dash-card" style="margin-top:16px;"><div class="dash-card-header"><i class="fa-solid fa-trash" style="color:var(--err)"></i> 危险操作</div>';
  html += '<div style="padding:16px;"><p style="color:var(--err);margin-bottom:12px;">清除所有数据将不可恢复！</p>';
  html += '<button class="admin-btn" style="background:var(--err);" onclick="AdminAPI.clearAllData()"><i class="fa-solid fa-triangle-exclamation"></i> 清除所有数据</button>';
  html += '</div></div>';
  return html;
}

function renderSettingsLogs() {
  var logs = Store.get('logs') || [];
  var html = '<div class="page-toolbar"><div class="toolbar-left"><span style="color:var(--nd)">共 '+logs.length+' 条日志</span></div>';
  html += '<div class="toolbar-right"><button class="admin-btn" onclick="AdminAPI.clearLogs()"><i class="fa-solid fa-trash"></i> 清空日志</button></div></div>';
  html += '<div class="dash-card"><div class="table-wrapper"><table class="admin-table"><thead><tr>';
  html += '<th>时间</th><th>类型</th><th>用户</th><th>详情</th><th>IP</th>';
  html += '</tr></thead><tbody>';
  logs.slice(0,50).forEach(function(l) {
    var typeMap = {login:'<span class="badge badge-p">登录</span>',user:'<span class="badge badge-ok">用户</span>',system:'<span class="badge badge-warn">系统</span>',tool:'<span class="badge badge-p">工具</span>',finance:'<span class="badge badge-err">财务</span>'};
    html += '<tr><td style="font-size:12px;white-space:nowrap;">'+l.time+'</td><td>'+(typeMap[l.type]||l.type)+'</td><td>'+l.user+'</td><td>'+l.detail+'</td><td style="font-size:12px;color:var(--nd);">'+l.ip+'</td></tr>';
  });
  html += '</tbody></table></div></div>';
  return html;
}

function renderSettingsAbout() {
  var html = '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-circle-info" style="color:var(--p)"></i> 关于系统</div>';
  html += '<div style="padding:20px;">';
  html += '<div style="text-align:center;margin-bottom:20px;"><div style="font-size:32px;font-weight:900;background:linear-gradient(135deg,var(--p),var(--p2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;">罗圣纪元</div><div style="color:var(--nd);margin-top:4px;">后台管理系统 '+APP.version+'</div></div>';
  var info = [
    ['公司全称',APP.company],['信用代码',APP.creditCode],['注册资本',APP.capital],
    ['成立日期',APP.founded],['创始人',APP.founder],['注册地址',APP.address],
    ['域名',APP.domain],['官网','<a href="'+APP.site+'" target="_blank" style="color:var(--p)">'+APP.site+'</a>'],
    ['系统版本',APP.version],['技术栈','HTML + CSS + JavaScript (纯前端)']
  ];
  html += '<table style="width:100%;max-width:600px;margin:0 auto;">';
  info.forEach(function(row) {
    html += '<tr><td style="padding:8px 12px;color:var(--nd);white-space:nowrap;">'+row[0]+'</td><td style="padding:8px 12px;">'+row[1]+'</td></tr>';
  });
  html += '</table>';
  html += '<div style="text-align:center;margin-top:20px;color:var(--nd);font-size:12px;">&copy; 2026 '+APP.company+'</div>';
  html += '</div></div>';
  return html;
}

// ========== 渲染：AI智能体 ==========
function renderAgent() {
  var html = '<div class="dash-grid">';
  html += '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-robot" style="color:var(--p)"></i> AI对话助手</div>';
  html += '<div style="padding:16px;"><div id="agent-chat-history" style="height:200px;overflow-y:auto;background:var(--bg2);border-radius:6px;padding:8px;margin-bottom:12px;"><div style="padding:8px;background:var(--bg3);border-radius:6px;margin-bottom:8px;max-width:80%;"><div style="font-size:11px;color:var(--nd);margin-bottom:4px;">AI助手</div><div>您好！我是罗圣纪元AI助手，有什么可以帮您？</div></div></div>';
  html += '<div style="display:flex;gap:8px;"><input type="text" id="agent-input" placeholder="输入您的问题..." style="flex:1;"><button class="admin-btn" onclick="AdminAPI.sendAgentMessage()"><i class="fa-solid fa-paper-plane"></i> 发送</button></div>';
  html += '</div></div>';
  html += '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-sliders" style="color:var(--p2)"></i> 智能体配置</div>';
  html += '<div style="padding:16px;">';
  html += '<div class="form-group"><label>系统提示词</label><textarea id="agent-system-prompt" rows="4" style="width:100%;">你是罗圣纪元AI助手，请用中文回答用户问题。</textarea></div>';
  html += '<div class="form-group"><label>模型选择</label><select id="agent-model" style="width:100%;"><option value="doubao">豆包大模型</option><option value="gpt4">GPT-4</option><option value="claude">Claude</option></select></div>';
  html += '<button class="admin-btn" onclick="AdminAPI.saveAgentConfig()"><i class="fa-solid fa-save"></i> 保存配置</button>';
  html += '</div></div>';
  html += '</div>';
  html += '<div class="dash-card" style="margin-top:16px;"><div class="dash-card-header"><i class="fa-solid fa-chart-pie" style="color:var(--ok)"></i> 智能体统计</div>';
  html += '<div style="padding:16px;"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;">';
  html += '<div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--p);">1,234</div><div style="color:var(--nd);font-size:12px;">总对话数</div></div>';
  html += '<div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--p2);">5.2</div><div style="color:var(--nd);font-size:12px;">平均会话轮次</div></div>';
  html += '<div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--ok);">98.5%</div><div style="color:var(--nd);font-size:12px;">满意度</div></div>';
  html += '<div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:#f59e0b;">12ms</div><div style="color:var(--nd);font-size:12px;">平均响应</div></div>';
  html += '</div></div></div>';
  $('#main-content').innerHTML = html;
}

// ========== 渲染：订单管理 ==========
function renderOrders() {
  var orders = Store.get('orders') || [];
  var html = '<div class="page-toolbar">';
  html += '<div class="toolbar-left"><input type="text" id="order-search" placeholder="搜索订单号/用户名..." oninput="AdminAPI.filterOrders()"><select id="order-filter" onchange="AdminAPI.filterOrders()"><option value="">全部</option><option value="recharge">充值</option><option value="refund">退款</option></select></div>';
  html += '<div class="toolbar-right"><button class="admin-btn" onclick="AdminAPI.exportOrders()"><i class="fa-solid fa-download"></i> 导出</button></div></div>';
  html += '<div class="dash-card"><div class="table-wrapper"><table class="admin-table" id="orders-table"><thead><tr>';
  html += '<th>订单号</th><th>用户</th><th>类型</th><th>金额</th><th>算力</th><th>方式</th><th>状态</th><th>时间</th>';
  html += '</tr></thead><tbody id="orders-tbody">';
  orders.forEach(function(o) {
    var typeMap = {recharge:'<span class="badge badge-ok">充值</span>',refund:'<span class="badge badge-err">退款</span>'};
    var statusMap = {completed:'<span class="badge badge-ok">已完成</span>',pending:'<span class="badge badge-warn">待处理</span>',processing:'<span class="badge badge-p">处理中</span>',failed:'<span class="badge badge-err">失败</span>'};
    html += '<tr><td style="font-size:12px;">'+o.id+'</td><td>'+o.username+'</td><td>'+(typeMap[o.type]||o.type)+'</td>';
    html += '<td style="color:'+(o.amount>0?'var(--ok)':'var(--err)')+'">¥'+Math.abs(o.amount)+'</td><td>'+(o.credits>0?'+':'')+o.credits+'</td><td>'+o.method+'</td>';
    html += '<td>'+(statusMap[o.status]||o.status)+'</td><td style="font-size:12px;">'+formatTime(o.time)+'</td></tr>';
  });
  html += '</tbody></table></div></div>';
  $('#main-content').innerHTML = html;
}

// ========== 渲染：优惠券 ==========
function renderCoupons() {
  var coupons = Store.get('coupons') || [
    {id:1,code:'WELCOME100',name:'新用户礼包',type:'fixed',value:100,minAmount:0,total:1000,used:234,start:'2026-06-01',end:'2026-12-31',status:'active'},
    {id:2,code:'SUMMER50',name:'夏日特惠',type:'percent',value:50,minAmount:50,total:500,used:89,start:'2026-06-01',end:'2026-08-31',status:'active'},
    {id:3,code:'VIP200',name:'VIP专享',type:'fixed',value:200,minAmount:100,total:200,used:45,start:'2026-06-01',end:'2026-09-30',status:'active'}
  ];
  if (!Store.get('coupons')) Store.set('coupons', coupons);
  var html = '<div class="page-toolbar"><div class="toolbar-left"><span style="color:var(--nd)">共 '+coupons.length+' 张优惠券</span></div>';
  html += '<div class="toolbar-right"><button class="admin-btn" onclick="AdminAPI.addCoupon()"><i class="fa-solid fa-plus"></i> 新增优惠券</button></div></div>';
  html += '<div class="dash-grid">';
  coupons.forEach(function(c) {
    html += '<div class="dash-card">';
    html += '<div style="padding:16px;border-bottom:1px solid var(--bd);display:flex;justify-content:space-between;align-items:center;">';
    html += '<div><div style="font-size:18px;font-weight:700;">'+c.name+'</div><div style="font-size:12px;color:var(--nd);margin-top:4px;">码: <span style="font-family:monospace;color:var(--p)">'+c.code+'</span></div></div>';
    html += '<div style="text-align:right;"><div style="font-size:24px;font-weight:900;color:var(--p);">'+(c.type==='percent'?c.value+'%':'¥'+c.value)+'</div><div style="font-size:11px;color:var(--nd);">'+(c.type==='percent'?'折扣':'固定抵扣')+'</div></div>';
    html += '</div>';
    html += '<div style="padding:16px;font-size:13px;color:var(--nd);">';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>最低消费</span><span>¥'+c.minAmount+'</span></div>';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>总量/已用</span><span>'+c.used+'/'+c.total+'</span></div>';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>有效期</span><span>'+c.start+' ~ '+c.end+'</span></div>';
    html += '<div style="height:4px;background:var(--w2);border-radius:2px;margin-top:8px;"><div style="width:'+(c.used/c.total*100)+'%;height:100%;background:var(--p);border-radius:2px;"></div></div>';
    html += '</div>';
    html += '<div style="padding:12px 16px;border-top:1px solid var(--bd);display:flex;justify-content:flex-end;gap:8px;">';
    html += '<button class="btn-xs" onclick="AdminAPI.editCoupon('+c.id+')">编辑</button>';
    html += '<button class="btn-xs btn-err" onclick="AdminAPI.deleteCoupon('+c.id+')">删除</button>';
    html += '</div></div>';
  });
  html += '</div>';
  $('#main-content').innerHTML = html;
}

// ========== 渲染：工单管理 ==========
function renderTickets() {
  var tickets = Store.get('tickets') || [
    {id:1,title:'充值未到账',user:'user001',type:'recharge',status:'open',priority:'high',createTime:'2026-06-12T10:00:00',updateTime:'2026-06-12T10:00:00'},
    {id:2,title:'工具无法使用',user:'user003',type:'bug',status:'processing',priority:'medium',createTime:'2026-06-11T14:00:00',updateTime:'2026-06-12T09:00:00'}
  ];
  if (!Store.get('tickets')) Store.set('tickets', tickets);
  var html = '<div class="page-toolbar"><div class="toolbar-left"><span style="color:var(--nd)">共 '+tickets.length+' 个工单</span></div>';
  html += '<div class="toolbar-right"><button class="admin-btn" onclick="AdminAPI.addTicket()"><i class="fa-solid fa-plus"></i> 新建工单</button></div></div>';
  html += '<div class="dash-card"><div class="table-wrapper"><table class="admin-table"><thead><tr>';
  html += '<th>ID</th><th>标题</th><th>用户</th><th>类型</th><th>优先级</th><th>状态</th><th>创建时间</th><th>操作</th>';
  html += '</tr></thead><tbody>';
  tickets.forEach(function(t) {
    var typeMap = {recharge:'<span class="badge badge-ok">充值</span>',bug:'<span class="badge badge-err">BUG</span>',suggestion:'<span class="badge badge-p">建议</span>',other:'<span class="badge badge-warn">其他</span>'};
    var statusMap = {open:'<span class="badge badge-warn">待处理</span>',processing:'<span class="badge badge-p">处理中</span>',resolved:'<span class="badge badge-ok">已解决</span>',closed:'<span class="badge badge-err">已关闭</span>'};
    html += '<tr><td>'+t.id+'</td><td>'+t.title+'</td><td>'+t.user+'</td><td>'+(typeMap[t.type]||t.type)+'</td>';
    html += '<td>'+(t.priority==='high'?'<span class="badge badge-err">高</span>':t.priority==='medium'?'<span class="badge badge-warn">中</span>':'<span class="badge badge-ok">低</span>')+'</td>';
    html += '<td>'+(statusMap[t.status]||t.status)+'</td>';
    html += '<td style="font-size:12px;">'+formatTime(t.createTime)+'</td>';
    html += '<td><button class="btn-xs" onclick="AdminAPI.viewTicket('+t.id+')">查看</button><button class="btn-xs btn-ok" onclick="AdminAPI.resolveTicket('+t.id+')">解决</button></td></tr>';
  });
  html += '</tbody></table></div></div>';
  $('#main-content').innerHTML = html;
}

// ========== 渲染：营销管理 ==========
function renderMarketing() {
  var html = '<div class="dash-grid">';
  html += '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-share-nodes" style="color:var(--p)"></i> 推广统计</div>';
  html += '<div style="padding:16px;"><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">';
  html += '<div style="text-align:center;"><div style="font-size:28px;font-weight:700;color:var(--p);">3,456</div><div style="color:var(--nd);font-size:12px;">分享次数</div></div>';
  html += '<div style="text-align:center;"><div style="font-size:28px;font-weight:700;color:var(--ok);">892</div><div style="color:var(--nd);font-size:12px;">新用户</div></div>';
  html += '</div></div></div>';
  html += '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-gift" style="color:var(--p2)"></i> 邀请返利</div>';
  html += '<div style="padding:16px;"><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">';
  html += '<div style="text-align:center;"><div style="font-size:28px;font-weight:700;color:var(--p2);">234</div><div style="color:var(--nd);font-size:12px;">邀请人数</div></div>';
  html += '<div style="text-align:center;"><div style="font-size:28px;font-weight:700;color:#f59e0b;">¥1,170</div><div style="color:var(--nd);font-size:12px;">返利总额</div></div>';
  html += '</div></div></div>';
  html += '</div>';
  html += '<div class="dash-card" style="margin-top:16px;"><div class="dash-card-header"><i class="fa-solid fa-chart-line" style="color:var(--ok)"></i> 推广渠道效果</div>';
  html += '<div style="padding:16px;">';
  var channels = [{name:'微信',users:520,pct:58},{name:'QQ',users:210,pct:24},{name:'微博',users:100,pct:11},{name:'其他',users:62,pct:7}];
  channels.forEach(function(c){
    html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;"><span style="width:50px;font-size:13px;">'+c.name+'</span><div style="flex:1;height:10px;background:var(--w2);border-radius:5px;overflow:hidden;"><div style="width:'+c.pct+'%;height:100%;background:var(--p);border-radius:5px;"></div></div><span style="width:50px;text-align:right;font-size:12px;color:var(--nd);">'+c.users+'人</span></div>';
  });
  html += '</div></div>';
  $('#main-content').innerHTML = html;
}

// ========== 渲染：数据报表 ==========
function renderReports() {
  var html = '<div class="tab-bar"><div class="tab-item active" onclick="AdminAPI.switchReportTab(\'user\',this)">用户报表</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchReportTab(\'finance\',this)">财务报表</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchReportTab(\'tool\',this)">工具报表</div>';
  html += '<div class="tab-item" onclick="AdminAPI.switchReportTab(\'overview\',this)">综合概览</div></div>';
  html += '<div id="report-content">';
  html += renderReportUser();
  html += '</div>';
  $('#main-content').innerHTML = html;
}

function renderReportUser() {
  var html = '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-users" style="color:var(--p)"></i> 用户增长报表</div>';
  html += '<div style="padding:16px;">';
  html += renderSVGChart([15,22,18,25,30,35,42], ['6/7','6/8','6/9','6/10','6/11','6/12','6/13'], 'var(--p)', 200);
  html += '</div></div>';
  html += '<div class="dash-card" style="margin-top:16px;"><div class="dash-card-header"><i class="fa-solid fa-chart-pie" style="color:var(--p2)"></i> 用户来源分析</div>';
  html += '<div style="padding:16px;"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:16px;">';
  var sources = [{name:'搜索引擎',pct:35,color:'var(--p)'},{name:'直接访问',pct:25,color:'var(--p2)'},{name:'社交媒体',pct:20,color:'#f59e0b'},{name:'推广链接',pct:15,color:'var(--ok)'},{name:'其他',pct:5,color:'var(--nd)'}];
  sources.forEach(function(s){
    html += '<div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:'+s.color+';">'+s.pct+'%</div><div style="color:var(--nd);font-size:12px;">'+s.name+'</div></div>';
  });
  html += '</div></div></div>';
  return html;
}

// ========== 渲染：充值审核 ==========
function renderRechargeReview() {
  var orders = Store.get('orders') || [];
  var pending = orders.filter(function(o){return o.status==='pending'&&o.type==='recharge'});
  var html = '<div class="page-toolbar"><div class="toolbar-left"><span style="color:var(--nd)">待审核: <strong style="color:var(--p)">'+pending.length+'</strong> 笔</span></div></div>';
  html += '<div class="dash-card"><div class="table-wrapper"><table class="admin-table"><thead><tr>';
  html += '<th>订单号</th><th>用户</th><th>金额</th><th>算力</th><th>支付方式</th><th>时间</th><th>操作</th>';
  html += '</tr></thead><tbody>';
  if (pending.length === 0) { html += '<tr><td colspan="7" style="text-align:center;color:var(--nd);padding:40px;">暂无待审核订单</td></tr>'; }
  pending.forEach(function(o) {
    html += '<tr><td style="font-size:12px;">'+o.id+'</td><td>'+o.username+'</td><td style="color:var(--ok);font-weight:600;">¥'+o.amount+'</td><td>+'+o.credits+'</td>';
    html += '<td>'+o.method+'</td><td style="font-size:12px;">'+formatTime(o.time)+'</td>';
    html += '<td><button class="btn-xs btn-ok" onclick="AdminAPI.approveRecharge(\''+o.id+'\')">通过</button><button class="btn-xs btn-err" onclick="AdminAPI.rejectRecharge(\''+o.id+'\')">拒绝</button></td></tr>';
  });
  html += '</tbody></table></div></div>';
  $('#main-content').innerHTML = html;
}

// ========== 渲染：访客管理 ==========
function renderVisitors() {
  var visitors = Store.get('visitors') || [
    {ip:'192.168.1.100',region:'湖南 长沙',device:'Chrome/Win10',page:'/dashboard',time:'2026-06-12 18:30:00'},
    {ip:'192.168.1.101',region:'广东 深圳',device:'Safari/iOS',page:'/tools',time:'2026-06-12 18:25:00'},
    {ip:'192.168.1.102',region:'北京',device:'Firefox/macOS',page:'/agent',time:'2026-06-12 18:20:00'}
  ];
  if (!Store.get('visitors')) Store.set('visitors', visitors);
  var html = '<div class="page-toolbar"><div class="toolbar-left"><span style="color:var(--nd)">当前在线: <strong style="color:var(--ok)">'+visitors.length+'</strong> 访客</span></div></div>';
  html += '<div class="dash-card"><div class="table-wrapper"><table class="admin-table"><thead><tr>';
  html += '<th>IP地址</th><th>地域</th><th>设备</th><th>访问页面</th><th>时间</th>';
  html += '</tr></thead><tbody>';
  visitors.forEach(function(v) {
    html += '<tr><td style="font-family:monospace;font-size:12px;">'+v.ip+'</td><td>'+v.region+'</td><td style="font-size:12px;">'+v.device+'</td><td style="font-size:12px;">'+v.page+'</td><td style="font-size:12px;white-space:nowrap;">'+v.time+'</td></tr>';
  });
  html += '</tbody></table></div></div>';
  $('#main-content').innerHTML = html;
}

// ========== 渲染：开源Skill中台 ==========
var _skillToolsCache = null;

function renderSkillCenter() {
  var html = '<div class="page-toolbar">';
  html += '<div class="toolbar-left" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">';
  html += '<input type="text" id="skill-search" placeholder="搜索Skill名称..." oninput="AdminAPI.filterSkillTools()" style="min-width:180px;">';
  html += '<select id="skill-filter-difficulty" onchange="AdminAPI.filterSkillTools()" style="background:var(--bg2);color:var(--w);border:1px solid var(--bd);border-radius:6px;padding:6px 10px;font-size:13px;"><option value="">全部难度</option><option value="高">高</option><option value="中">中</option><option value="低">低</option></select>';
  html += '<select id="skill-filter-status" onchange="AdminAPI.filterSkillTools()" style="background:var(--bg2);color:var(--w);border:1px solid var(--bd);border-radius:6px;padding:6px 10px;font-size:13px;"><option value="">全部状态</option><option value="running">运行中</option><option value="stopped">已停用</option></select>';
  html += '<select id="skill-filter-input" onchange="AdminAPI.filterSkillTools()" style="background:var(--bg2);color:var(--w);border:1px solid var(--bd);border-radius:6px;padding:6px 10px;font-size:13px;"><option value="">全部输入</option><option value="API">API</option><option value="插件">插件</option><option value="组件">组件</option></select>';
  html += '<select id="skill-filter-access" onchange="AdminAPI.filterSkillTools()" style="background:var(--bg2);color:var(--w);border:1px solid var(--bd);border-radius:6px;padding:6px 10px;font-size:13px;"><option value="">全部接入</option><option value="独立部署">独立部署</option><option value="嵌入适配">嵌入适配</option></select>';
  html += '</div>';
  html += '<div class="toolbar-right">';
  html += '<button class="admin-btn" style="background:var(--ok);" onclick="AdminAPI.refreshSkillTools()"><i class="fa-solid fa-rotate"></i> 刷新</button>';
  html += '<button class="admin-btn" onclick="AdminAPI.addSkillTool()"><i class="fa-solid fa-plus"></i> 新增Skill</button>';
  html += '</div></div>';

  html += '<div class="dash-grid" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));margin-bottom:16px;">';
  html += statCard('fa-layer-group', 'Skill总数', '<span id="skill-stat-total">0</span>', '全部工具', 'var(--p)');
  html += statCard('fa-play', '运行中', '<span id="skill-stat-running">0</span>', '正常服务', 'var(--ok)');
  html += statCard('fa-stop', '已停用', '<span id="skill-stat-stopped">0</span>', '需要关注', 'var(--err)');
  html += statCard('fa-bolt', '平均消耗', '<span id="skill-stat-avg">0</span>', '算力/次', '#f59e0b');
  html += '</div>';

  html += '<div id="skill-grid" class="dash-grid" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr));">';
  html += '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--nd);"><i class="fa-solid fa-circle-notch fa-spin" style="font-size:24px;color:var(--p);margin-bottom:12px;display:block;"></i>正在加载Skill数据...</div>';
  html += '</div>';

  $('#main-content').innerHTML = html;
  AdminAPI.loadSkillTools();
}

function renderSkillCards(tools) {
  var grid = $('#skill-grid');
  if (!grid) return;
  if (!tools || tools.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--nd);"><i class="fa-solid fa-box-open" style="font-size:40px;margin-bottom:12px;display:block;"></i>暂无匹配的Skill工具</div>';
    return;
  }
  var html = '';
  tools.forEach(function(t) {
    var diffColor = t.difficulty === '高' ? 'var(--err)' : t.difficulty === '中' ? '#f59e0b' : 'var(--ok)';
    var statusClass = t.status === 'running' ? 'badge-ok' : 'badge-err';
    var statusText = t.status === 'running' ? '运行中' : '已停用';
    var inputBadge = '<span class="badge" style="background:rgba(0,245,255,0.1);color:var(--p);border:1px solid rgba(0,245,255,0.3);font-size:11px;">' + t.inputMode + '</span>';
    var accessBadge = '<span class="badge" style="background:rgba(255,0,255,0.1);color:var(--p2);border:1px solid rgba(255,0,255,0.3);font-size:11px;">' + t.accessMode + '</span>';

    html += '<div class="dash-card" style="display:flex;flex-direction:column;position:relative;overflow:hidden;">';
    html += '<div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--p),var(--p2));"></div>';
    html += '<div style="padding:16px;flex:1;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">';
    html += '<div style="font-size:16px;font-weight:700;word-break:break-all;">' + esc(t.name) + '</div>';
    html += '<span class="badge ' + statusClass + '" style="font-size:11px;white-space:nowrap;margin-left:8px;">' + statusText + '</span>';
    html += '</div>';
    html += '<div style="font-size:13px;color:var(--nd);margin-bottom:12px;line-height:1.5;min-height:40px;">' + esc(t.desc) + '</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">' + inputBadge + accessBadge + '</div>';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--nd);margin-bottom:8px;">';
    html += '<span><i class="fa-solid fa-bolt" style="color:var(--p);margin-right:4px;"></i>消耗: <strong style="color:var(--w);">' + t.creditCost + '</strong></span>';
    html += '<span>难度: <strong style="color:' + diffColor + ';">' + t.difficulty + '</strong></span>';
    html += '</div>';
    html += '<div style="font-size:12px;"><i class="fa-brands fa-github" style="color:var(--nd);margin-right:4px;"></i><a href="' + esc(t.github) + '" target="_blank" style="color:var(--p);word-break:break-all;">' + esc(t.github) + '</a></div>';
    html += '</div>';
    html += '<div style="padding:12px 16px;border-top:1px solid var(--bd);display:flex;gap:8px;flex-wrap:wrap;">';
    if (t.status === 'running') {
      html += '<button class="btn-xs btn-ok" onclick="AdminAPI.startSkill(\'' + t.id + '\')"><i class="fa-solid fa-play"></i> 启动</button>';
    } else {
      html += '<button class="btn-xs btn-ok" onclick="AdminAPI.startSkill(\'' + t.id + '\')"><i class="fa-solid fa-play"></i> 启动</button>';
    }
    html += '<button class="btn-xs" style="background:rgba(0,245,255,0.15);color:#00f5ff;border:1px solid rgba(0,245,255,0.3);" onclick="AdminAPI.configSkill(\'' + t.id + '\')"><i class="fa-solid fa-gear"></i> 配置</button>';
    if (t.status === 'running') {
      html += '<button class="btn-xs btn-err" onclick="AdminAPI.stopSkill(\'' + t.id + '\')"><i class="fa-solid fa-stop"></i> 停用</button>';
    } else {
      html += '<button class="btn-xs btn-err" onclick="AdminAPI.stopSkill(\'' + t.id + '\')"><i class="fa-solid fa-stop"></i> 停用</button>';
    }
    html += '<button class="btn-xs" style="background:rgba(0,100,255,0.15);color:#3b82f6;border:1px solid rgba(59,130,246,0.3);margin-left:auto;" onclick="AdminAPI.openSkillEntry(\'' + t.id + '\')"><i class="fa-solid fa-door-open"></i> 打开入口</button>';
    html += '</div></div>';
  });
  grid.innerHTML = html;
}

function updateSkillStats(tools) {
  var total = tools.length;
  var running = tools.filter(function(t){ return t.status === 'running'; }).length;
  var stopped = tools.filter(function(t){ return t.status === 'stopped'; }).length;
  var avg = total > 0 ? Math.round(tools.reduce(function(s,t){ return s + (t.creditCost||0); }, 0) / total) : 0;
  var st = $('#skill-stat-total'); if (st) st.textContent = total;
  var sr = $('#skill-stat-running'); if (sr) sr.textContent = running;
  var ss = $('#skill-stat-stopped'); if (ss) ss.textContent = stopped;
  var sa = $('#skill-stat-avg'); if (sa) sa.textContent = avg;
}

// ========== AdminAPI ==========
var AdminAPI = {
  switchDashPeriod: function(days) {
    var labels = days === 7 ? ['6/7','6/8','6/9','6/10','6/11','6/12','6/13'] : ['5/14','5/21','5/28','6/4','6/11','6/18','6/25'];
    var data = days === 7 ? [12,18,15,22,28,25,31] : [45,52,48,61,55,68,72];
    $$('.btn-xs').forEach(function(b) { b.style.background = ''; b.style.color = ''; });
    var btn = $('#dash-period-'+days);
    if (btn) { btn.style.background = 'var(--p)'; btn.style.color = '#fff'; }
    navigate('dashboard');
    setTimeout(function() {
      var chartDiv = $('.dash-card .dash-card-header + div > svg')?.parentElement;
      if (chartDiv) chartDiv.innerHTML = renderSVGChart(data, labels);
    }, 10);
  },

  // 用户管理
  filterUsers: function() {
    var kw = ($('#user-search')?.value || '').toLowerCase();
    var status = $('#user-filter')?.value || '';
    $$('#users-tbody tr').forEach(function(tr) {
      var uname = (tr.dataset.username || '').toLowerCase();
      var phone = (tr.dataset.phone || '').toLowerCase();
      var email = (tr.dataset.email || '').toLowerCase();
      var st = tr.dataset.status || '';
      var matchKw = !kw || uname.includes(kw) || phone.includes(kw) || email.includes(kw);
      var matchStatus = !status || st === status;
      tr.style.display = matchKw && matchStatus ? '' : 'none';
    });
  },
  addUser: function() {
    var uname = prompt('请输入用户名:'); if (!uname) return;
    var pwd = prompt('请输入密码:'); if (!pwd) return;
    var users = Store.getUsers() || [];
    for (var i=0;i<users.length;i++) if (users[i].username===uname) { toast('用户名已存在','error'); return; }
    users.push({username:uname,password:pwd,status:'approved',registerTime:new Date().toISOString(),lastLogin:null,phone:'',email:''});
    Store.setUsers(users);
    var credits = Store.getCredits() || {}; credits[uname]=100; Store.setCredits(credits);
    addLog('user','创建用户 '+uname);
    toast('用户创建成功','success'); renderUsers();
  },
  approveUser: function(uname) {
    var users = Store.getUsers() || [];
    for (var i=0;i<users.length;i++) { if (users[i].username===uname) { users[i].status='approved'; break; } }
    Store.setUsers(users); addLog('user','审批通过用户 '+uname); toast('已通过','success'); renderUsers();
  },
  rejectUser: function(uname) {
    var users = Store.getUsers() || [];
    for (var i=0;i<users.length;i++) { if (users[i].username===uname) { users[i].status='rejected'; break; } }
    Store.setUsers(users); addLog('user','拒绝用户 '+uname); toast('已拒绝','warning'); renderUsers();
  },
  banUser: function(uname) {
    var users = Store.getUsers() || [];
    for (var i=0;i<users.length;i++) { if (users[i].username===uname) { users[i].status='banned'; break; } }
    Store.setUsers(users); addLog('user','封禁用户 '+uname); toast('已封禁','warning'); renderUsers();
  },
  unbanUser: function(uname) {
    var users = Store.getUsers() || [];
    for (var i=0;i<users.length;i++) { if (users[i].username===uname) { users[i].status='approved'; break; } }
    Store.setUsers(users); addLog('user','解封用户 '+uname); toast('已解封','success'); renderUsers();
  },
  deleteUser: function(uname) {
    confirmDialog('确定删除用户 "'+uname+'" 吗?', function() {
      var users = Store.getUsers() || [];
      users = users.filter(function(u){ return u.username !== uname; });
      Store.setUsers(users);
      addLog('user','删除用户 '+uname); toast('已删除','success'); renderUsers();
    });
  },
  batchApprove: function() {
    var checked = $$('.user-checkbox:checked');
    if (checked.length === 0) { toast('请先选择用户','warning'); return; }
    var users = Store.getUsers() || [];
    checked.forEach(function(cb) {
      for (var i=0;i<users.length;i++) { if (users[i].username===cb.value) { users[i].status='approved'; break; } }
    });
    Store.setUsers(users); addLog('user','批量通过 '+checked.length+' 个用户'); toast('批量通过成功','success'); renderUsers();
  },
  batchBan: function() {
    var checked = $$('.user-checkbox:checked');
    if (checked.length === 0) { toast('请先选择用户','warning'); return; }
    var users = Store.getUsers() || [];
    checked.forEach(function(cb) {
      for (var i=0;i<users.length;i++) { if (users[i].username===cb.value) { users[i].status='banned'; break; } }
    });
    Store.setUsers(users); addLog('user','批量封禁 '+checked.length+' 个用户'); toast('批量封禁成功','warning'); renderUsers();
  },
  batchDelete: function() {
    var checked = $$('.user-checkbox:checked');
    if (checked.length === 0) { toast('请先选择用户','warning'); return; }
    confirmDialog('确定删除选中的 '+checked.length+' 个用户吗?', function() {
      var users = Store.getUsers() || [];
      checked.forEach(function(cb){ users = users.filter(function(u){ return u.username !== cb.value; }); });
      Store.setUsers(users); addLog('user','批量删除 '+checked.length+' 个用户'); toast('批量删除成功','success'); renderUsers();
    });
  },
  toggleSelectAll: function(cb) { $$('.user-checkbox').forEach(function(c){ c.checked = cb.checked; }); },
  viewUserDetail: function(uname) {
    var users = Store.getUsers() || [];
    var credits = Store.getCredits() || {};
    var u = null; for (var i=0;i<users.length;i++) if (users[i].username===uname) { u=users[i]; break; }
    if (!u) return;
    var html = '<div style="padding:20px;"><h3 style="margin-bottom:16px;">用户详情: '+u.username+'</h3>';
    html += '<p>状态: '+u.status+'</p><p>算力余额: '+(credits[uname]||0)+'</p>';
    html += '<p>注册时间: '+formatTime(u.registerTime)+'</p><p>最后登录: '+formatTime(u.lastLogin)+'</p>';
    html += '<p>手机: '+(u.phone||'-')+'</p><p>邮箱: '+(u.email||'-')+'</p>';
    html += '</div>';
    showModal('用户详情', html);
  },
  adjustCredits: function(uname) {
    var val = prompt('为用户 '+uname+' 调整算力 (+增加/-减少):'); if (val === null) return;
    var num = parseInt(val,10); if (isNaN(num)) { toast('请输入有效数字','error'); return; }
    var credits = Store.getCredits() || {};
    credits[uname] = (credits[uname]||0) + num;
    Store.setCredits(credits);
    addLog('user','调整用户 '+uname+' 算力 '+num);
    toast('算力已调整','success'); renderUsers();
  },
  exportUsers: function() {
    var users = Store.getUsers() || [];
    var csv = '用户名,状态,注册时间,最后登录\\n';
    users.forEach(function(u){ csv += u.username+','+u.status+','+formatTime(u.registerTime)+','+formatTime(u.lastLogin)+'\\n'; });
    var blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'users_'+formatDate(new Date().toISOString())+'.csv'; a.click();
  },

  // 工具管理
  switchToolTab: function(cat, el) {
    $$('#tool-tabs .tab-item').forEach(function(t){ t.classList.remove('active'); });
    el.classList.add('active');
    $('#tools-list').innerHTML = renderToolsList(Store.get('tools') || TOOL_CATEGORIES, cat);
  },
  toggleTool: function(catId, toolId, enabled) {
    var tools = Store.get('tools') || TOOL_CATEGORIES;
    tools.forEach(function(cat){ if (cat.id===catId) { cat.tools.forEach(function(t){ if(t.id===toolId) t.enabled=enabled; }); } });
    Store.set('tools', tools); addLog('tool',(enabled?'启用':'禁用')+' 工具 '+toolId); toast(enabled?'已启用':'已禁用','success'); renderTools();
  },
  toggleCategory: function(catId, enabled) {
    var tools = Store.get('tools') || TOOL_CATEGORIES;
    tools.forEach(function(cat){ if (cat.id===catId) { cat.tools.forEach(function(t){ t.enabled=enabled; }); } });
    Store.set('tools', tools); addLog('tool',(enabled?'启用':'禁用')+' 分类 '+catId); toast('批量操作成功','success'); renderTools();
  },
  updateToolCredit: function(catId, toolId, credit) {
    var tools = Store.get('tools') || TOOL_CATEGORIES;
    tools.forEach(function(cat){ if (cat.id===catId) { cat.tools.forEach(function(t){ if(t.id===toolId) t.credit=parseInt(credit,10)||1; }); } });
    Store.set('tools', tools); toast('算力已更新','success');
  },
  enableAllTools: function() {
    var tools = Store.get('tools') || TOOL_CATEGORIES;
    tools.forEach(function(cat){ cat.tools.forEach(function(t){ t.enabled=true; }); });
    Store.set('tools', tools); addLog('tool','启用所有工具'); toast('全部启用','success'); renderTools();
  },
  disableAllTools: function() {
    var tools = Store.get('tools') || TOOL_CATEGORIES;
    tools.forEach(function(cat){ cat.tools.forEach(function(t){ t.enabled=false; }); });
    Store.set('tools', tools); addLog('tool','禁用所有工具'); toast('全部禁用','warning'); renderTools();
  },
  resetTools: function() {
    confirmDialog('确定重置所有工具为默认状态?', function(){
      Store.set('tools', JSON.parse(JSON.stringify(TOOL_CATEGORIES)));
      addLog('tool','重置工具默认设置'); toast('已重置','success'); renderTools();
    });
  },
  batchAdjustToolCredits: function() {
    var val = prompt('批量调整所有工具算力 (+增加/-减少):'); if (val===null) return;
    var num = parseInt(val,10); if (isNaN(num)) { toast('请输入有效数字','error'); return; }
    var tools = Store.get('tools') || TOOL_CATEGORIES;
    tools.forEach(function(cat){ cat.tools.forEach(function(t){ t.credit = Math.max(1, t.credit + num); }); });
    Store.set('tools', tools); addLog('tool','批量调整工具算力 '+num); toast('批量调整成功','success'); renderTools();
  },
  searchTools: function() {
    var kw = ($('#tool-search')?.value || '').toLowerCase();
    $$('#tools-list table tbody tr').forEach(function(tr) {
      var name = tr.querySelector('td:nth-child(2)')?.textContent?.toLowerCase() || '';
      tr.style.display = !kw || name.includes(kw) ? '' : 'none';
    });
  },

  // 财务
  switchFinanceTab: function(tab, el) {
    $$('.tab-bar .tab-item').forEach(function(t){ t.classList.remove('active'); });
    el.classList.add('active');
    var content = '';
    if (tab === 'orders') content = renderFinanceOrders(Store.get('orders')||[]);
    else if (tab === 'refunds') content = renderFinanceRefunds();
    else if (tab === 'payments') content = renderFinancePayments();
    else if (tab === 'revenue') {
      content = '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-chart-area" style="color:var(--p)"></i> 收入趋势</div>';
      content += '<div style="padding:16px;">' + renderSVGChart([120,180,150,220,280,250,310], ['6/7','6/8','6/9','6/10','6/11','6/12','6/13'], 'var(--ok)', 220) + '</div></div>';
    } else if (tab === 'stats') {
      content = '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-chart-pie" style="color:var(--p2)"></i> 财务统计</div>';
      content += '<div style="padding:16px;"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;">';
      content += '<div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--p);">¥12,800</div><div style="color:var(--nd);font-size:12px;">本月收入</div></div>';
      content += '<div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--err);">¥320</div><div style="color:var(--nd);font-size:12px;">本月退款</div></div>';
      content += '<div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--ok);">98.5%</div><div style="color:var(--nd);font-size:12px;">支付成功率</div></div>';
      content += '</div></div></div>';
    }
    $('#finance-content').innerHTML = content;
  },
  completeOrder: function(oid) {
    var orders = Store.get('orders') || [];
    for (var i=0;i<orders.length;i++) { if (orders[i].id===oid) { orders[i].status='completed'; break; } }
    Store.set('orders', orders); addLog('finance','完成订单 '+oid); toast('订单已完成','success'); renderFinance();
  },
  approveRefund: function(oid) {
    var orders = Store.get('orders') || [];
    for (var i=0;i<orders.length;i++) { if (orders[i].id===oid) { orders[i].status='completed'; break; } }
    Store.set('orders', orders); addLog('finance','批准退款 '+oid); toast('退款已批准','success'); renderFinance();
  },
  rejectRefund: function(oid) {
    var orders = Store.get('orders') || [];
    for (var i=0;i<orders.length;i++) { if (orders[i].id===oid) { orders[i].status='failed'; break; } }
    Store.set('orders', orders); addLog('finance','拒绝退款 '+oid); toast('退款已拒绝','warning'); renderFinance();
  },
  exportFinance: function() {
    var orders = Store.get('orders') || [];
    var csv = '订单号,用户,类型,金额,状态,时间\\n';
    orders.forEach(function(o){ csv += o.id+','+o.username+','+o.type+','+o.amount+','+o.status+','+formatTime(o.time)+'\\n'; });
    var blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'finance_'+formatDate(new Date().toISOString())+'.csv'; a.click();
  },

  // 内容管理
  switchContentTab: function(tab, el) {
    $$('.tab-bar .tab-item').forEach(function(t){ t.classList.remove('active'); });
    el.classList.add('active');
    var content = '';
    if (tab === 'announcements') content = renderContentAnnouncements();
    else if (tab === 'faq') content = renderContentFAQ();
    else if (tab === 'seo') content = renderContentSEO();
    else if (tab === 'popup') content = renderContentPopup();
    else if (tab === 'changelog') content = renderContentChangelog();
    else if (tab === 'emailtpl') content = '<div class="dash-card"><div style="padding:16px;"><p style="color:var(--nd);">邮件模板功能开发中...</p></div></div>';
    $('#content-tab-content').innerHTML = content;
  },
  saveSEO: function() {
    var seo = { title: $('#seo-title')?.value||'', keywords: $('#seo-keywords')?.value||'', description: $('#seo-desc')?.value||'' };
    Store.set('seo', seo); toast('SEO设置已保存','success');
  },
  addAnnouncement: function() { showAnnouncementForm(); },
  editAnnouncement: function(id) { showAnnouncementForm(id); },
  previewAnnouncement: function(id) { toast('预览功能开发中','info'); },
  deleteAnnouncement: function(id) {
    confirmDialog('确定删除此公告?', function(){
      var anns = Store.get('announcements') || [];
      Store.set('announcements', anns.filter(function(a){ return a.id !== id; }));
      addLog('content','删除公告 #'+id); toast('已删除','success'); renderContent();
    });
  },
  addFAQ: function() { showFAQForm(); },
  editFAQ: function(id) { showFAQForm(id); },
  deleteFAQ: function(id) {
    confirmDialog('确定删除此FAQ?', function(){
      var faqs = Store.get('faqs') || [];
      Store.set('faqs', faqs.filter(function(f){ return f.id !== id; }));
      addLog('content','删除FAQ #'+id); toast('已删除','success'); renderContent();
    });
  },
  togglePopup: function(id, enabled) {
    var popups = Store.get('popups') || [];
    popups.forEach(function(p){ if(p.id===id) p.enabled=enabled; });
    Store.set('popups', popups); addLog('content','弹窗 #'+id+' '+(enabled?'启用':'禁用')); renderContent();
  },
  previewPopup: function(id) { toast('预览功能开发中','info'); },
  deletePopup: function(id) {
    confirmDialog('确定删除此弹窗?', function(){
      var popups = Store.get('popups') || [];
      Store.set('popups', popups.filter(function(p){ return p.id !== id; }));
      addLog('content','删除弹窗 #'+id); toast('已删除','success'); renderContent();
    });
  },
  addChangelog: function() {
    var v = prompt('版本号:'); if(!v) return;
    var c = prompt('更新内容:'); if(!c) return;
    var logs = Store.get('changelogs') || [];
    logs.unshift({version:v,date:formatDate(new Date().toISOString()),content:c});
    Store.set('changelogs', logs); addLog('content','新增版本日志 '+v); toast('已添加','success'); renderContent();
  },
  editChangelog: function(idx) {
    var logs = Store.get('changelogs') || [];
    if (!logs[idx]) return;
    var c = prompt('更新内容:', logs[idx].content); if (c===null) return;
    logs[idx].content = c; Store.set('changelogs', logs); toast('已更新','success'); renderContent();
  },
  deleteChangelog: function(idx) {
    confirmDialog('确定删除此版本记录?', function(){
      var logs = Store.get('changelogs') || [];
      logs.splice(idx,1); Store.set('changelogs', logs); toast('已删除','success'); renderContent();
    });
  },

  // 权限
  switchPermTab: function(tab, el) {
    $$('.tab-bar .tab-item').forEach(function(t){ t.classList.remove('active'); });
    el.classList.add('active');
    var content = '';
    if (tab === 'roles') {
      var roles = Store.get('roles') || [];
      content = '<div class="dash-grid">';
      roles.forEach(function(r) {
        var isSuper = r.id === 'boss' || r.id === 'ultimate_admin' || r.id === 'super_admin';
        content += '<div class="dash-card">';
        content += '<div class="dash-card-header"><i class="fa-solid '+(isSuper?'fa-crown':'fa-user-shield')+'" style="color:'+(isSuper?'#f59e0b':'var(--p)')+'"></i> '+r.name+(isSuper?' <span class="badge badge-warn" style="font-size:10px;">不可修改</span>':'')+'</div>';
        content += '<div style="padding:16px;"><p style="color:var(--nd);margin-bottom:12px;">'+r.desc+'</p>';
        content += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
        r.permissions.forEach(function(p){ var permMap={all:'全部权限',users:'用户管理',content:'内容管理',tools:'工具管理',finance:'财务管理',view:'查看权限',permissions:'权限管理',settings:'系统设置'}; content += '<span class="badge badge-p" style="font-size:11px;">'+(permMap[p]||p)+'</span>'; });
        content += '</div>';
        if (!isSuper) content += '<div style="margin-top:12px;"><button class="admin-btn" style="font-size:12px;" onclick="AdminAPI.editRole(\''+r.id+'\')"><i class="fa-solid fa-pen"></i> 编辑</button></div>';
        content += '</div></div>';
      });
      content += '</div>';
    } else if (tab === 'admins') { content = renderPermAdmins(); }
    else if (tab === 'matrix') { content = '<div class="dash-card"><div style="padding:16px;"><p style="color:var(--nd);">权限矩阵功能开发中...</p></div></div>'; }
    else if (tab === 'audit') { content = '<div class="dash-card"><div style="padding:16px;"><p style="color:var(--nd);">操作审计功能开发中...</p></div></div>'; }
    $('#perm-content').innerHTML = content;
  },
  editRole: function(rid) { toast('角色编辑功能开发中','info'); },
  addAdmin: function() {
    var uname = prompt('用户名:'); if(!uname) return;
    var pwd = prompt('密码:'); if(!pwd) return;
    var admins = Store.get('admins') || [];
    admins.push({username:uname,role:'admin',createTime:new Date().toISOString(),status:'active'});
    Store.set('admins', admins); addLog('permissions','添加管理员 '+uname); toast('已添加','success'); renderPermissions();
  },
  editAdmin: function(uname) { toast('编辑功能开发中','info'); },
  removeAdmin: function(uname) {
    confirmDialog('确定移除管理员 '+uname+'?', function(){
      var admins = Store.get('admins') || [];
      Store.set('admins', admins.filter(function(a){ return a.username !== uname; }));
      addLog('permissions','移除管理员 '+uname); toast('已移除','success'); renderPermissions();
    });
  },

  // 设置
  switchSettingsTab: function(tab, el) {
    $$('.tab-bar .tab-item').forEach(function(t){ t.classList.remove('active'); });
    el.classList.add('active');
    var settings = Store.get('settings') || {};
    var content = '';
    if (tab === 'basic') content = renderSettingsBasic(settings);
    else if (tab === 'theme') content = renderSettingsTheme();
    else if (tab === 'api') content = renderSettingsAPI();
    else if (tab === 'email') content = '<div class="dash-card"><div style="padding:16px;"><p style="color:var(--nd);">邮件模板功能开发中...</p></div></div>';
    else if (tab === 'backup') content = renderSettingsBackup();
    else if (tab === 'logs') content = renderSettingsLogs();
    else if (tab === 'health') content = '<div class="dash-card"><div style="padding:16px;"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;"><div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--ok);">正常</div><div style="color:var(--nd);font-size:12px;">数据库连接</div></div><div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--ok);">正常</div><div style="color:var(--nd);font-size:12px;">API服务</div></div><div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--ok);">正常</div><div style="color:var(--nd);font-size:12px;">文件存储</div></div></div></div></div>';
    else if (tab === 'about') content = renderSettingsAbout();
    $('#settings-content').innerHTML = content;
  },
  saveBasicSettings: function() {
    var settings = Store.get('settings') || {};
    settings.siteName = $('#set-sitename')?.value || '';
    settings.siteDesc = $('#set-sitedesc')?.value || '';
    Store.set('settings', settings); addLog('settings','更新基本设置'); toast('设置已保存','success');
  },
  setTheme: function(theme) {
    var settings = Store.get('settings') || {};
    settings.theme = theme; Store.set('settings', settings);
    applyTheme(theme); toast('主题已切换','success'); renderSettings();
  },
  saveAPISettings: function() {
    var settings = Store.get('settings') || {};
    settings.apiKey = $('#set-apikey')?.value || '';
    settings.apiEndpoint = $('#set-apiendpoint')?.value || '';
    Store.set('settings', settings); addLog('settings','更新API配置'); toast('配置已保存','success');
  },
  testAPI: function() { toast('API连接测试中...','info'); setTimeout(function(){ toast('连接成功！','success'); }, 1500); },
  backupData: function() {
    var data = { users: Store.getUsers(), credits: Store.getCredits(), orders: Store.get('orders'), announcements: Store.get('announcements'), faqs: Store.get('faqs'), tools: Store.get('tools'), stats: Store.get('stats'), logs: Store.get('logs'), admins: Store.get('admins'), roles: Store.get('roles'), settings: Store.get('settings'), seo: Store.get('seo'), popups: Store.get('popups'), changelogs: Store.get('changelogs'), skill_tools: Store.get('skill_tools') };
    var blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'lsjy_backup_'+formatDate(new Date().toISOString())+'.json'; a.click();
    addLog('settings','数据备份'); toast('备份已下载','success');
  },
  restoreData: function() {
    var file = $('#restore-file')?.files[0]; if (!file) { toast('请选择文件','warning'); return; }
    var reader = new FileReader();
    reader.onload = function(e) {
      try { var data = JSON.parse(e.target.result);
        if (data.users) Store.setUsers(data.users); if (data.credits) Store.setCredits(data.credits);
        ['orders','announcements','faqs','tools','stats','logs','admins','roles','settings','seo','popups','changelogs','skill_tools'].forEach(function(k){ if(data[k]) Store.set(k,data[k]); });
        addLog('settings','数据恢复'); toast('数据恢复成功','success'); navigate('dashboard');
      } catch(err) { toast('文件格式错误','error'); }
    }; reader.readAsText(file);
  },
  clearAllData: function() {
    confirmDialog('此操作将清除所有数据且不可恢复！确定继续?', function(){
      try { localStorage.clear(); } catch(e){}
      addLog('system','清除所有数据'); toast('所有数据已清除','success'); location.reload();
    });
  },
  clearLogs: function() { Store.set('logs', []); toast('日志已清空','success'); renderSettings(); },

  // 订单
  filterOrders: function() {
    var kw = ($('#order-search')?.value || '').toLowerCase();
    var type = $('#order-filter')?.value || '';
    $$('#orders-tbody tr').forEach(function(tr) {
      var text = tr.textContent.toLowerCase();
      var matchType = !type || text.includes(type==='recharge'?'充值':'退款');
      tr.style.display = (!kw || text.includes(kw)) && matchType ? '' : 'none';
    });
  },
  exportOrders: function() {
    var orders = Store.get('orders') || [];
    var csv = '订单号,用户,类型,金额,状态,时间\\n';
    orders.forEach(function(o){ csv += o.id+','+o.username+','+o.type+','+o.amount+','+o.status+','+formatTime(o.time)+'\\n'; });
    var blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'orders_'+formatDate(new Date().toISOString())+'.csv'; a.click();
  },

  // 优惠券
  addCoupon: function() { toast('新增优惠券功能开发中','info'); },
  editCoupon: function(id) { toast('编辑优惠券功能开发中','info'); },
  deleteCoupon: function(id) {
    confirmDialog('确定删除此优惠券?', function(){
      var coupons = Store.get('coupons') || [];
      Store.set('coupons', coupons.filter(function(c){ return c.id !== id; }));
      toast('已删除','success'); renderCoupons();
    });
  },

  // 工单
  addTicket: function() { toast('新建工单功能开发中','info'); },
  viewTicket: function(id) { toast('查看工单 #'+id,'info'); },
  resolveTicket: function(id) {
    var tickets = Store.get('tickets') || [];
    tickets.forEach(function(t){ if(t.id===id) t.status='resolved'; });
    Store.set('tickets', tickets); toast('工单已解决','success'); renderTickets();
  },

  // 报表
  switchReportTab: function(tab, el) {
    $$('.tab-bar .tab-item').forEach(function(t){ t.classList.remove('active'); });
    el.classList.add('active');
    var content = '';
    if (tab === 'user') content = renderReportUser();
    else if (tab === 'finance') {
      content = '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-chart-area" style="color:var(--ok)"></i> 收入报表</div>';
      content += '<div style="padding:16px;">' + renderSVGChart([120,180,150,220,280,250,310], ['6/7','6/8','6/9','6/10','6/11','6/12','6/13'], 'var(--ok)', 200) + '</div></div>';
    } else if (tab === 'tool') {
      content = '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-chart-bar" style="color:var(--p2)"></i> 工具使用报表</div>';
      content += '<div style="padding:16px;">' + renderSVGChart([500,420,380,350,300,280,250], ['AI文章','AI绘画','AI代码','AI语音','AI翻译','AI数据','AI图片'], 'var(--p2)', 200) + '</div></div>';
    } else if (tab === 'overview') {
      content = '<div class="dash-card"><div style="padding:16px;"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;">';
      content += '<div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--p);">156</div><div style="color:var(--nd);font-size:12px;">总用户</div></div>';
      content += '<div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--ok);">¥12,800</div><div style="color:var(--nd);font-size:12px;">总收入</div></div>';
      content += '<div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:var(--p2);">200+</div><div style="color:var(--nd);font-size:12px;">AI工具</div></div>';
      content += '<div style="text-align:center;"><div style="font-size:24px;font-weight:700;color:#f59e0b;">98.5%</div><div style="color:var(--nd);font-size:12px;">满意度</div></div>';
      content += '</div></div></div>';
    }
    $('#report-content').innerHTML = content;
  },

  // 充值审核
  approveRecharge: function(oid) {
    var orders = Store.get('orders') || [];
    for (var i=0;i<orders.length;i++) { if (orders[i].id===oid) { orders[i].status='completed'; break; } }
    Store.set('orders', orders); addLog('finance','审核通过充值 '+oid); toast('充值已审核通过','success'); renderRechargeReview();
  },
  rejectRecharge: function(oid) {
    var orders = Store.get('orders') || [];
    for (var i=0;i<orders.length;i++) { if (orders[i].id===oid) { orders[i].status='failed'; break; } }
    Store.set('orders', orders); addLog('finance','拒绝充值 '+oid); toast('充值已拒绝','warning'); renderRechargeReview();
  },

  // AI智能体
  sendAgentMessage: function() {
    var input = $('#agent-input'); if (!input || !input.value.trim()) return;
    var history = $('#agent-chat-history');
    var userDiv = document.createElement('div');
    userDiv.style.cssText = 'padding:8px;background:rgba(0,245,255,0.1);border-radius:6px;margin-bottom:8px;margin-left:auto;max-width:80%;text-align:right;';
    userDiv.innerHTML = '<div style="font-size:11px;color:var(--nd);margin-bottom:4px;">你</div><div>'+esc(input.value)+'</div>';
    history.appendChild(userDiv);
    setTimeout(function(){
      var aiDiv = document.createElement('div');
      aiDiv.style.cssText = 'padding:8px;background:var(--bg3);border-radius:6px;margin-bottom:8px;max-width:80%;';
      aiDiv.innerHTML = '<div style="font-size:11px;color:var(--nd);margin-bottom:4px;">AI助手</div><div>收到您的问题，我将尽快为您解答。</div>';
      history.appendChild(aiDiv); history.scrollTop = history.scrollHeight;
    }, 800);
    input.value = ''; history.scrollTop = history.scrollHeight;
  },
  saveAgentConfig: function() { toast('配置已保存','success'); },

  // ========== SkillCenter API ==========
  loadSkillTools: function() {
    var cached = Store.get('skill_tools');
    if (cached && cached.length) {
      _skillToolsCache = cached;
      renderSkillCards(cached);
      updateSkillStats(cached);
      return;
    }
    var apiUrl = APP.apiBase + '/ai/tools?page=1&pageSize=100';
    fetch(apiUrl)
      .then(function(res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function(data) {
        var list = (data && data.data && data.data.list) ? data.data.list : (Array.isArray(data) ? data : []);
        if (list.length === 0) throw new Error('empty');
        _skillToolsCache = list;
        Store.set('skill_tools', list);
        renderSkillCards(list);
        updateSkillStats(list);
        toast('Skill数据已同步','success');
      })
      .catch(function(err) {
        console.warn('Skill API 不可用，使用本地数据:', err);
        var fallback = Store.get('skill_tools') || SKILL_TOOLS;
        _skillToolsCache = fallback;
        Store.set('skill_tools', fallback);
        renderSkillCards(fallback);
        updateSkillStats(fallback);
        toast('使用本地示例数据','warning');
      });
  },
  refreshSkillTools: function() {
    _skillToolsCache = null;
    AdminAPI.loadSkillTools();
    toast('正在刷新...','info');
  },
  filterSkillTools: function() {
    var kw = ($('#skill-search')?.value || '').toLowerCase();
    var diff = $('#skill-filter-difficulty')?.value || '';
    var status = $('#skill-filter-status')?.value || '';
    var inputMode = $('#skill-filter-input')?.value || '';
    var accessMode = $('#skill-filter-access')?.value || '';
    var list = _skillToolsCache || Store.get('skill_tools') || SKILL_TOOLS;
    var filtered = list.filter(function(t) {
      var matchKw = !kw || (t.name && t.name.toLowerCase().includes(kw)) || (t.desc && t.desc.toLowerCase().includes(kw));
      var matchDiff = !diff || t.difficulty === diff;
      var matchStatus = !status || t.status === status;
      var matchInput = !inputMode || t.inputMode === inputMode;
      var matchAccess = !accessMode || t.accessMode === accessMode;
      return matchKw && matchDiff && matchStatus && matchInput && matchAccess;
    });
    renderSkillCards(filtered);
    updateSkillStats(filtered);
  },
  startSkill: function(id) {
    var list = Store.get('skill_tools') || SKILL_TOOLS;
    list.forEach(function(t){ if(t.id===id) t.status='running'; });
    Store.set('skill_tools', list); _skillToolsCache = list;
    addLog('tool','启动Skill '+id); toast('Skill已启动','success');
    if (currentPage === 'skillcenter') AdminAPI.filterSkillTools();
  },
  stopSkill: function(id) {
    var list = Store.get('skill_tools') || SKILL_TOOLS;
    list.forEach(function(t){ if(t.id===id) t.status='stopped'; });
    Store.set('skill_tools', list); _skillToolsCache = list;
    addLog('tool','停用Skill '+id); toast('Skill已停用','warning');
    if (currentPage === 'skillcenter') AdminAPI.filterSkillTools();
  },
  configSkill: function(id) {
    var list = Store.get('skill_tools') || SKILL_TOOLS;
    var tool = null; for (var i=0;i<list.length;i++) if(list[i].id===id){ tool=list[i]; break; }
    if(!tool) return;
    var html = '<div style="padding:16px;">';
    html += '<div class="form-group"><label>Skill名称</label><input type="text" id="cfg-name" value="'+esc(tool.name)+'" style="width:100%"></div>';
    html += '<div class="form-group"><label>描述</label><textarea id="cfg-desc" rows="3" style="width:100%">'+esc(tool.desc)+'</textarea></div>';
    html += '<div class="form-group"><label>输入模式</label><select id="cfg-input" style="width:100%"><option value="API" '+(tool.inputMode==='API'?'selected':'')+'>API</option><option value="插件" '+(tool.inputMode==='插件'?'selected':'')+'>插件</option><option value="组件" '+(tool.inputMode==='组件'?'selected':'')+'>组件</option></select></div>';
    html += '<div class="form-group"><label>接入模式</label><select id="cfg-access" style="width:100%"><option value="独立部署" '+(tool.accessMode==='独立部署'?'selected':'')+'>独立部署</option><option value="嵌入适配" '+(tool.accessMode==='嵌入适配'?'selected':'')+'>嵌入适配</option></select></div>';
    html += '<div class="form-group"><label>算力消耗</label><input type="number" id="cfg-credit" value="'+(tool.creditCost||tool.credit)+'" style="width:100%"></div>';
    html += '<div class="form-group"><label>难度</label><select id="cfg-diff" style="width:100%"><option value="高" '+(tool.difficulty==='高'?'selected':'')+'>高</option><option value="中" '+(tool.difficulty==='中'?'selected':'')+'>中</option><option value="低" '+(tool.difficulty==='低'?'selected':'')+'>低</option></select></div>';
    html += '<div class="form-group"><label>GitHub链接</label><input type="text" id="cfg-github" value="'+esc(tool.github)+'" style="width:100%"></div>';
    html += '</div>';
    showModal('配置Skill: '+tool.name, html, function(){
      list.forEach(function(t){ if(t.id===id){ t.name=$('#cfg-name')?.value||t.name; t.desc=$('#cfg-desc')?.value||t.desc; t.inputMode=$('#cfg-input')?.value||t.inputMode; t.accessMode=$('#cfg-access')?.value||t.accessMode; t.creditCost=parseInt($('#cfg-credit')?.value,10)||t.creditCost; t.difficulty=$('#cfg-diff')?.value||t.difficulty; t.github=$('#cfg-github')?.value||t.github; } });
      Store.set('skill_tools', list); _skillToolsCache = list;
      addLog('tool','配置Skill '+id); toast('配置已保存','success');
      if (currentPage === 'skillcenter') AdminAPI.filterSkillTools();
    });
  },
  openSkillEntry: function(id) {
    var list = Store.get('skill_tools') || SKILL_TOOLS;
    var tool = null; for (var i=0;i<list.length;i++) if(list[i].id===id){ tool=list[i]; break; }
    if(!tool) return;
    if(tool.github) window.open(tool.github, '_blank');
    else toast('该Skill暂无入口链接','warning');
  },
  addSkillTool: function() {
    var name = prompt('Skill名称:'); if(!name) return;
    var desc = prompt('描述:'); if(!desc) return;
    var inputMode = prompt('输入模式 (API/插件/组件):', 'API'); if(!inputMode) return;
    var accessMode = prompt('接入模式 (独立部署/嵌入适配):', '独立部署'); if(!accessMode) return;
    var credit = parseInt(prompt('算力消耗:', '5'),10)||5;
    var diff = prompt('难度 (高/中/低):', '中'); if(!diff) return;
    var github = prompt('GitHub链接:', '');
    var list = Store.get('skill_tools') || SKILL_TOOLS;
    list.push({id:'sk'+Date.now(),name:name,desc:desc,inputMode:inputMode,accessMode:accessMode,creditCost:credit,difficulty:diff,github:github||'',status:'stopped'});
    Store.set('skill_tools', list); _skillToolsCache = list;
    addLog('tool','新增Skill '+name); toast('Skill已添加','success');
    if (currentPage === 'skillcenter') AdminAPI.filterSkillTools();
  }
};
window.AdminAPI = AdminAPI;

// ========== 模态框 ==========
function showModal(title, content, onConfirm) {
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.zIndex = '99998';
  var box = document.createElement('div');
  box.className = 'modal-box';
  box.style.maxWidth = '560px';
  box.innerHTML = '<div class="modal-header">'+title+'<button class="modal-close"><i class="fa-solid fa-xmark"></i></button></div>'+
    '<div class="modal-body">'+content+'</div>'+
    '<div style="padding:12px 20px;border-top:1px solid var(--bd);display:flex;justify-content:flex-end;gap:10px;">'+
    '<button class="admin-btn-cancel">取消</button>'+
    (onConfirm ? '<button class="admin-btn-ok">确认</button>' : '') +
    '</div>';
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  box.querySelector('.modal-close').onclick = function() { overlay.remove(); };
  box.querySelector('.admin-btn-cancel').onclick = function() { overlay.remove(); };
  if (onConfirm) {
    box.querySelector('.admin-btn-ok').onclick = function() { overlay.remove(); onConfirm(); };
  }
  overlay.onclick = function(e) { if(e.target===overlay) overlay.remove(); };
}

// ========== 表单辅助 ==========
function showAnnouncementForm(id) {
  var anns = Store.get('announcements') || [];
  var a = id ? null : null;
  if (id) { for (var i=0;i<anns.length;i++) { if (anns[i].id===id) { a=anns[i]; break; } } }
  var html = '<div style="padding:16px;">';
  html += '<div class="form-group"><label>标题</label><input type="text" id="ann-title" value="'+(a?esc(a.title):'')+'" style="width:100%"></div>';
  html += '<div class="form-group"><label>内容</label><textarea id="ann-content" rows="4" style="width:100%">'+(a?esc(a.content):'')+'</textarea></div>';
  html += '<div class="form-group"><label>类型</label><select id="ann-type" style="width:100%"><option value="normal" '+(a&&a.type==='normal'?'selected':'')+'>普通</option><option value="important" '+(a&&a.type==='important'?'selected':'')+'>重要</option><option value="activity" '+(a&&a.type==='activity'?'selected':'')+'>活动</option></select></div>';
  html += '</div>';
  showModal(id?'编辑公告':'新增公告', html, function(){
    var title = $('#ann-title')?.value?.trim(); if(!title){ toast('请输入标题','warning'); return; }
    var content = $('#ann-content')?.value?.trim(); if(!content){ toast('请输入内容','warning'); return; }
    var type = $('#ann-type')?.value || 'normal';
    if (a) { a.title=title; a.content=content; a.type=type; }
    else { anns.push({id:Date.now(),title:title,content:content,type:type,status:'published',createTime:new Date().toISOString(),expireTime:null}); }
    Store.set('announcements', anns); addLog('content',(id?'编辑':'新增')+'公告'); toast('保存成功','success'); renderContent();
  });
}

function showFAQForm(id) {
  var faqs = Store.get('faqs') || [];
  var f = null; if (id) { for (var i=0;i<faqs.length;i++) { if (faqs[i].id===id) { f=faqs[i]; break; } } }
  var html = '<div style="padding:16px;">';
  html += '<div class="form-group"><label>问题</label><input type="text" id="faq-q" value="'+(f?esc(f.question):'')+'" style="width:100%"></div>';
  html += '<div class="form-group"><label>答案</label><textarea id="faq-a" rows="4" style="width:100%">'+(f?esc(f.answer):'')+'</textarea></div>';
  html += '<div class="form-group"><label>分类</label><input type="text" id="faq-cat" value="'+(f?esc(f.category):'')+'" style="width:100%"></div>';
  html += '</div>';
  showModal(id?'编辑FAQ':'新增FAQ', html, function(){
    var q = $('#faq-q')?.value?.trim(); if(!q){ toast('请输入问题','warning'); return; }
    var a = $('#faq-a')?.value?.trim(); if(!a){ toast('请输入答案','warning'); return; }
    var cat = $('#faq-cat')?.value?.trim() || '其他';
    if (f) { f.question=q; f.answer=a; f.category=cat; }
    else { faqs.push({id:Date.now(),question:q,answer:a,category:cat,sort:faqs.length+1}); }
    Store.set('faqs', faqs); toast('保存成功','success'); renderContent();
  });
}

// ========== 主题系统 ==========
function applyTheme(theme) {
  var root = document.documentElement;
  if (theme === 'light') {
    root.style.setProperty('--bg','#f8fafc'); root.style.setProperty('--bg2','#f1f5f9'); root.style.setProperty('--bg3','#e2e8f0');
    root.style.setProperty('--card','#ffffff'); root.style.setProperty('--w','#1e293b'); root.style.setProperty('--w2','#e2e8f0');
    root.style.setProperty('--nd','#64748b'); root.style.setProperty('--bd','#cbd5e1');
    root.style.setProperty('--p','#0088cc'); root.style.setProperty('--p2','#00a8e8');
  } else if (theme === 'enterprise') {
    root.style.setProperty('--bg','#0d0d1a'); root.style.setProperty('--bg2','#16162a'); root.style.setProperty('--bg3','#1e1e3a');
    root.style.setProperty('--card','#151528'); root.style.setProperty('--w','#e8e8f0'); root.style.setProperty('--w2','#2a2a4a');
    root.style.setProperty('--nd','#8a8ab0'); root.style.setProperty('--bd','#2a2a50');
    root.style.setProperty('--p','#f59e0b'); root.style.setProperty('--p2','#ffd700');
  } else {
    root.style.setProperty('--bg','#0a0e17'); root.style.setProperty('--bg2','#111827'); root.style.setProperty('--bg3','#1f2937');
    root.style.setProperty('--card','rgba(17,24,39,0.8)'); root.style.setProperty('--w','#f1f5f9'); root.style.setProperty('--w2','#1f2937');
    root.style.setProperty('--nd','#9ca3af'); root.style.setProperty('--bd','rgba(0,245,255,0.1)');
    root.style.setProperty('--p','#00f5ff'); root.style.setProperty('--p2','#ff00ff');
  }
}

// ========== 侧边栏折叠 ==========
var sidebarCollapsed = false;
function toggleSidebar() {
  var sidebar = $('.admin-sidebar');
  var main = $('.admin-main');
  if (!sidebar || !main) return;
  sidebarCollapsed = !sidebarCollapsed;
  if (sidebarCollapsed) {
    sidebar.style.width = '60px';
    sidebar.querySelectorAll('.sb-label').forEach(function(el){ el.style.display='none'; });
    sidebar.querySelectorAll('.sb-item').forEach(function(el){ el.style.justifyContent='center'; el.style.padding='12px 0'; });
    sidebar.querySelector('.sidebar-header').style.display='none';
    sidebar.querySelector('.sidebar-footer').style.display='none';
    if (main) main.style.marginLeft = '60px';
  } else {
    sidebar.style.width = '';
    sidebar.querySelectorAll('.sb-label').forEach(function(el){ el.style.display=''; });
    sidebar.querySelectorAll('.sb-item').forEach(function(el){ el.style.justifyContent=''; el.style.padding=''; });
    sidebar.querySelector('.sidebar-header').style.display='';
    sidebar.querySelector('.sidebar-footer').style.display='';
    if (main) main.style.marginLeft = '';
  }
}
window.toggleSidebar = toggleSidebar;

// ========== 移动端侧边栏 ==========
var mobileSidebarOpen = false;
function toggleMobileSidebar() {
  var sidebar = $('.admin-sidebar');
  if (!sidebar) return;
  mobileSidebarOpen = !mobileSidebarOpen;
  if (mobileSidebarOpen) { sidebar.classList.add('mobile-open'); }
  else { sidebar.classList.remove('mobile-open'); }
}
function closeMobileSidebar() {
  var sidebar = $('.admin-sidebar');
  if (sidebar) { sidebar.classList.remove('mobile-open'); mobileSidebarOpen = false; }
}
window.toggleMobileSidebar = toggleMobileSidebar;

// ========== 矩阵雨效果 ==========
function initMatrixRain() {
  var canvas = document.getElementById('matrix-rain');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w, h;
  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize();
  var cols = Math.floor(w / 14);
  var drops = [];
  for (var i=0;i<cols;i++) drops[i] = Math.random() * -100;
  var chars = '01アイウエオカキクケコサシスセソタチツテト0123456789';
  function draw() {
    ctx.fillStyle = 'rgba(10,14,23,0.05)';
    ctx.fillRect(0,0,w,h);
    ctx.fillStyle = 'rgba(0,245,255,0.15)';
    ctx.font = '14px monospace';
    for (var i=0;i<cols;i++) {
      var ch = chars[Math.floor(Math.random()*chars.length)];
      ctx.fillText(ch, i*14, drops[i]*14);
      if (drops[i]*14 > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', function() { resize(); cols=Math.floor(w/14); drops=[]; for(var i=0;i<cols;i++) drops[i]=Math.random()*-100; });
}

// ========== 初始化入口 ==========
function init() {
  initData();
  var settings = Store.get('settings') || {};
  applyTheme(settings.theme || 'dark');
  var session = Store.getSession();
  if (!session) {
    showLogin();
  } else {
    showDashboard();
    var hash = window.location.hash.replace('#','');
    if (hash && routes[hash]) { navigate(hash); } else { navigate('dashboard'); }
  }
  initMatrixRain();
}

function showLogin() {
  var app = $('#app');
  if (!app) return;
  app.innerHTML = '<div class="login-wrapper"><canvas id="matrix-rain" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;"></canvas>'+
    '<div class="login-box">'+
    '<div class="login-logo"><i class="fa-solid fa-crown" style="color:var(--p)"></i>罗圣纪元后台</div>'+
    '<div class="login-input-group"><i class="fa-solid fa-user"></i><input type="text" id="login-user" placeholder="用户名" autocomplete="username"></div>'+
    '<div class="login-input-group"><i class="fa-solid fa-lock"></i><input type="password" id="login-pwd" placeholder="密码" autocomplete="current-password"></div>'+
    '<button class="login-btn" id="login-btn" onclick="AdminAPI.login()">登录</button>'+
    '<div style="text-align:center;margin-top:16px;font-size:12px;color:var(--nd);"><span style="cursor:pointer;" onclick="AdminAPI.forgotPassword()">忘记密码</span></div>'+
    '</div></div>';
  initMatrixRain();
  var pwd = $('#login-pwd');
  if (pwd) { pwd.addEventListener('keydown', function(e){ if(e.key==='Enter') AdminAPI.login(); }); }
}

function showDashboard() {
  var app = $('#app');
  if (!app) return;
  app.innerHTML = '<div class="admin-layout">'+
    '<aside class="admin-sidebar">'+
    '<div class="sidebar-header"><i class="fa-solid fa-crown" style="color:var(--p);font-size:20px;"></i><span>罗圣纪元</span></div>'+
    '<nav class="sidebar-nav">'+
    '<div class="sb-item active" data-page="dashboard" onclick="navigate(\'dashboard\')"><i class="fa-solid fa-chart-line"></i><span class="sb-label">数据看板</span></div>'+
    '<div class="sb-item" data-page="users" onclick="navigate(\'users\')"><i class="fa-solid fa-users"></i><span class="sb-label">用户管理</span></div>'+
    '<div class="sb-item" data-page="tools" onclick="navigate(\'tools\')"><i class="fa-solid fa-layer-group"></i><span class="sb-label">AI工具</span></div>'+
    '<div class="sb-item" data-page="skillcenter" onclick="navigate(\'skillcenter\')"><i class="fa-solid fa-cubes"></i><span class="sb-label">开源Skill中台</span></div>'+
    '<div class="sb-item" data-page="agent" onclick="navigate(\'agent\')"><i class="fa-solid fa-robot"></i><span class="sb-label">AI智能体</span></div>'+
    '<div class="sb-item" data-page="orders" onclick="navigate(\'orders\')"><i class="fa-solid fa-receipt"></i><span class="sb-label">订单管理</span></div>'+
    '<div class="sb-item" data-page="finance" onclick="navigate(\'finance\')"><i class="fa-solid fa-coins"></i><span class="sb-label">财务管理</span></div>'+
    '<div class="sb-item" data-page="coupons" onclick="navigate(\'coupons\')"><i class="fa-solid fa-ticket"></i><span class="sb-label">优惠券</span></div>'+
    '<div class="sb-item" data-page="tickets" onclick="navigate(\'tickets\')"><i class="fa-solid fa-headset"></i><span class="sb-label">工单管理</span></div>'+
    '<div class="sb-item" data-page="marketing" onclick="navigate(\'marketing\')"><i class="fa-solid fa-bullhorn"></i><span class="sb-label">营销管理</span></div>'+
    '<div class="sb-item" data-page="reports" onclick="navigate(\'reports\')"><i class="fa-solid fa-chart-bar"></i><span class="sb-label">数据报表</span></div>'+
    '<div class="sb-item" data-page="content" onclick="navigate(\'content\')"><i class="fa-solid fa-file-lines"></i><span class="sb-label">内容管理</span></div>'+
    '<div class="sb-item" data-page="permissions" onclick="navigate(\'permissions\')"><i class="fa-solid fa-shield-halved"></i><span class="sb-label">权限管理</span></div>'+
    '<div class="sb-item" data-page="settings" onclick="navigate(\'settings\')"><i class="fa-solid fa-gear"></i><span class="sb-label">系统设置</span></div>'+
    '<div class="sb-item" data-page="recharge-review" onclick="navigate(\'recharge-review\')"><i class="fa-solid fa-circle-check"></i><span class="sb-label">充值审核</span></div>'+
    '<div class="sb-item" data-page="visitors" onclick="navigate(\'visitors\')"><i class="fa-solid fa-eye"></i><span class="sb-label">访客管理</span></div>'+
    '</nav>'+
    '<div class="sidebar-footer"><button class="admin-btn" style="width:100%;font-size:12px;" onclick="AdminAPI.logout()"><i class="fa-solid fa-right-from-bracket"></i> <span class="sb-label">退出登录</span></button></div>'+
    '</aside>'+
    '<main class="admin-main">'+
    '<header class="admin-header">'+
    '<div style="display:flex;align-items:center;gap:12px;">'+
    '<button class="mobile-menu-btn" onclick="toggleMobileSidebar()"><i class="fa-solid fa-bars"></i></button>'+
    '<button class="admin-btn" style="font-size:12px;padding:4px 8px;" onclick="toggleSidebar()" title="折叠/展开侧边栏"><i class="fa-solid fa-compress"></i></button>'+
    '<h2 id="page-title" style="font-size:18px;font-weight:700;margin:0;">数据看板</h2></div>'+
    '<div style="display:flex;align-items:center;gap:12px;">'+
    '<span style="font-size:12px;color:var(--nd);">'+APP.version+'</span>'+
    '<div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--p),var(--p2));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;">罗</div>'+
    '</div></header>'+
    '<div class="admin-content" id="main-content"></div>'+
    '</main></div>';
  initMatrixRain();
}

// ========== 登录/登出 ==========
AdminAPI.login = function() {
  var user = $('#login-user')?.value?.trim();
  var pwd = $('#login-pwd')?.value?.trim();
  if (!user || !pwd) { toast('请输入用户名和密码','warning'); return; }
  var users = Store.getUsers() || [];
  var found = null;
  for (var i=0;i<users.length;i++) { if (users[i].username===user && users[i].password===pwd) { found=users[i]; break; } }
  if (!found) { toast('用户名或密码错误','error'); return; }
  if (found.status === 'pending') { toast('账号待审批，请耐心等待','warning'); return; }
  if (found.status === 'banned') { toast('账号已被封禁','error'); return; }
  if (found.status === 'rejected') { toast('注册申请已被拒绝','error'); return; }
  Store.setSession({username:found.username,role:found.role||'normal',loginTime:new Date().toISOString()});
  addLog('login','管理员 '+found.username+' 登录系统');
  toast('登录成功','success');
  showDashboard();
  navigate('dashboard');
};

AdminAPI.logout = function() {
  confirmDialog('确定退出登录?', function(){
    var session = Store.getSession();
    if (session) addLog('login','用户 '+session.username+' 退出登录');
    Store.clearSession(); location.reload();
  });
};

AdminAPI.forgotPassword = function() {
  toast('请联系超级管理员重置密码','info');
};

// ========== 启动 ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
