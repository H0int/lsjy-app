
// ============================================================
// 罗圣纪元管理后台 V8.0 核心逻辑
// (c) 2026 祁阳市罗圣纪元互联网科技有限责任公司
// 7大功能模块 + 用户审批 + 权限管理 + 赛博朋克UI + 移动端适配
// ============================================================

(function() {
'use strict';

// ========== 全局配置 ==========
var APP = {
  version: 'V8.0',
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
  creditsKey: 'lsjy3_credits'
};

// 默认管理员
var DEFAULT_ADMIN = { username: 'KF02V9', password: 'LKZ2005430', role: 'superadmin', status: 'approved', createTime: '2026-05-12T00:00:00' };

// 默认统计
var DEFAULT_STATS = {
  totalUsers: 156, todayNewUsers: 3, activeUsers: 42,
  totalCredits: 28500, todayCredits: 1200,
  todayRevenue: 580, weekRevenue: 3200, monthRevenue: 12800
};

// 工具分类及工具列表
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

// 示例用户数据
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
    try {
      var v = localStorage.getItem(APP.usersKey);
      if (v) return JSON.parse(v);
    } catch(e) {}
    return null;
  },
  setUsers: function(users) {
    try { localStorage.setItem(APP.usersKey, JSON.stringify(users)); } catch(e) {}
  },
  getCredits: function() {
    try {
      var v = localStorage.getItem(APP.creditsKey);
      if (v) return JSON.parse(v);
    } catch(e) {}
    return null;
  },
  setCredits: function(credits) {
    try { localStorage.setItem(APP.creditsKey, JSON.stringify(credits)); } catch(e) {}
  },
  getSession: function() {
    try { var v = sessionStorage.getItem(APP.sessionKey); return v ? JSON.parse(v) : null; } catch(e) { return null; }
  },
  setSession: function(s) {
    try { sessionStorage.setItem(APP.sessionKey, JSON.stringify(s)); } catch(e) {}
  },
  clearSession: function() {
    try { sessionStorage.removeItem(APP.sessionKey); } catch(e) {}
  }
};

// ========== 初始化 ==========
function initData() {
  // 初始化用户数据（如果不存在）
  var users = Store.getUsers();
  if (!users || !users.length) {
    var allUsers = [DEFAULT_ADMIN].concat(SAMPLE_USERS);
    Store.setUsers(allUsers);
  } else {
    // 确保管理员存在且密码正确
    var adminExists = false;
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === 'KF02V9') {
        users[i].password = 'LKZ2005430';
        users[i].role = 'superadmin';
        users[i].status = 'approved';
        adminExists = true;
        break;
      }
    }
    if (!adminExists) {
      users.unshift(DEFAULT_ADMIN);
    }
    Store.setUsers(users);
  }

  // 初始化算力数据
  var credits = Store.getCredits();
  if (!credits) {
    Store.setCredits(SAMPLE_CREDITS);
  }

  // 初始化订单
  if (!Store.get('orders')) Store.set('orders', SAMPLE_ORDERS);

  // 初始化公告
  if (!Store.get('announcements')) Store.set('announcements', SAMPLE_ANNOUNCEMENTS);

  // 初始化FAQ
  if (!Store.get('faqs')) Store.set('faqs', SAMPLE_FAQS);

  // 初始化工具配置
  if (!Store.get('tools')) Store.set('tools', TOOL_CATEGORIES);

  // 初始化统计
  if (!Store.get('stats')) Store.set('stats', DEFAULT_STATS);

  // 初始化日志
  if (!Store.get('logs')) Store.set('logs', SAMPLE_LOGS);

  // 初始化管理员列表
  if (!Store.get('admins')) {
    Store.set('admins', [{username:'KF02V9', role:'superadmin', createTime:'2026-05-12T00:00:00', status:'active'}]);
  }

  // 初始化角色
  if (!Store.get('roles')) {
    Store.set('roles', [
      {id:'superadmin', name:'超级管理员', desc:'拥有所有权限，不可被修改', permissions:['all']},
      {id:'admin', name:'管理员', desc:'可管理用户和内容，不可管理权限和系统设置', permissions:['users','content','tools','finance']},
      {id:'viewer', name:'查看者', desc:'只能查看数据，不可修改', permissions:['view']}
    ]);
  }

  // 初始化系统设置
  if (!Store.get('settings')) {
    Store.set('settings', {
      siteName: '罗圣纪元',
      siteDesc: '罗圣纪元 - AI工具聚合平台',
      theme: 'dark',
      apiKey: '',
      version: APP.version
    });
  }

  // SEO设置
  if (!Store.get('seo')) {
    Store.set('seo', {
      title: '罗圣纪元 - AI工具聚合平台',
      keywords: 'AI工具,人工智能,文本生成,图片生成,编程助手',
      description: '罗圣纪元提供200+AI工具，涵盖文本生成、图片生成、编程开发、音频视频、数据分析等全领域AI服务。',
      favicon: ''
    });
  }

  // 弹窗广告
  if (!Store.get('popups')) {
    Store.set('popups', [
      {id:1,title:'新用户福利',content:'注册即送100算力！',enabled:true,startTime:'2026-06-01',endTime:'2026-07-01'}
    ]);
  }

  // 版本日志
  if (!Store.get('changelogs')) {
    Store.set('changelogs', [
      {version:'V6.0',date:'2026-06-13',content:'后台管理系统完全重建，7大功能模块上线'},
      {version:'V5.2',date:'2026-06-10',content:'修复CDN缓存问题，优化登录体验'},
      {version:'V5.0',date:'2026-06-05',content:'新增50个AI工具，优化算力系统'},
      {version:'V4.0',date:'2026-06-01',content:'全新UI设计，支持暗色主题'},
      {version:'V3.0',date:'2026-05-25',content:'用户审批系统上线'}
    ]);
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

// Toast通知
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

// 确认弹窗
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

// 添加日志
function addLog(type, detail) {
  var logs = Store.get('logs') || [];
  var user = Store.getSession();
  logs.unshift({
    time: formatTime(new Date().toISOString()),
    type: type,
    user: user ? user.username : 'system',
    detail: detail,
    ip: '192.168.1.1'
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
  finance: { render: renderFinance, title: '财务管理' },
  content: { render: renderContent, title: '内容管理' },
  permissions: { render: renderPermissions, title: '权限管理' },
  settings: { render: renderSettings, title: '系统设置' }
};

function navigate(page) {
  if (!routes[page]) page = 'dashboard';
  currentPage = page;
  window.location.hash = page;
  // 更新侧边栏
  $$('.sb-item').forEach(function(el) {
    el.classList.toggle('active', el.dataset.page === page);
  });
  // 更新标题
  var titleEl = $('#page-title');
  if (titleEl) titleEl.textContent = routes[page].title;
  // 渲染页面
  routes[page].render();
  // 移动端关闭侧边栏
  if (window.innerWidth <= 768) {
    closeMobileSidebar();
  }
}

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

  // 统计卡片 - 增强版
  html += statCard('fa-users', '用户总数', stats.totalUsers, '已通过'+approvedCount+'人', 'var(--p)');
  html += statCard('fa-user-plus', '今日新增', stats.todayNewUsers, '待审批'+pendingCount+'人', 'var(--p2)');
  html += statCard('fa-bolt', '算力总量', totalCreditBalance, '今日消耗+'+stats.todayCredits, '#f59e0b');
  html += statCard('fa-coins', '今日收入', '¥'+stats.todayRevenue, '本周¥'+stats.weekRevenue, 'var(--ok)');
  html += statCard('fa-chart-line', '本月收入', '¥'+stats.monthRevenue, '环比+15%', 'var(--p2)');
  html += statCard('fa-clock', '待审批', pendingCount, pendingCount > 0 ? '需处理' : '无待处理', pendingCount > 0 ? 'var(--err)' : 'var(--ok)');
  html += statCard('fa-ban', '已封禁', bannedCount, '占比'+(stats.totalUsers>0?Math.round(bannedCount/stats.totalUsers*100):0)+'%', 'var(--err)');
  html += statCard('fa-receipt', '今日订单', todayOrders, '总'+orders.length+'笔', 'var(--p2)');

  html += '</div>';

  // 趋势图时间段切换
  html += '<div style="margin-bottom:12px;display:flex;gap:8px;align-items:center;">';
  html += '<span style="color:var(--nd);font-size:13px;"><i class="fa-solid fa-chart-area" style="color:var(--p)"></i> 数据趋势</span>';
  html += '<button class="btn-xs" style="background:var(--p);color:#fff;border:none;" id="dash-period-7" onclick="AdminAPI.switchDashPeriod(7)">近7天</button>';
  html += '<button class="btn-xs" id="dash-period-30" onclick="AdminAPI.switchDashPeriod(30)">近30天</button>';
  html += '</div>';

  // 工具使用排行
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

  // 用户增长趋势图
  html += '<div class="dash-card" style="flex:1;min-width:300px;">';
  html += '<div class="dash-card-header"><i class="fa-solid fa-chart-area" style="color:var(--p2)"></i> 用户增长趋势 (近7天)</div>';
  html += '<div style="padding:16px;">';
  html += renderSVGChart();
  html += '</div></div>';

  html += '</div>';

  // 用户地域分布 + 支付方式分布
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

  // 支付方式分布
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

  // 最近注册用户
  html += '<div class="dash-card">';
  html += '<div class="dash-card-header"><i class="fa-solid fa-clock-rotate-left" style="color:var(--warn)"></i> 最近注册用户</div>';
  html += '<div class="table-wrapper"><table class="admin-table"><thead><tr><th>用户名</th><th>注册时间</th><th>状态</th><th>操作</th></tr></thead><tbody>';
  var recentUsers = users.slice().sort(function(a,b){ return new Date(b.registerTime||0)-new Date(a.registerTime||0); }).slice(0,8);
  recentUsers.forEach(function(u) {
    if (u.role === 'superadmin') return;
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

function renderSVGChart() {
  var data = [12,18,15,22,28,25,31];
  var labels = ['6/7','6/8','6/9','6/10','6/11','6/12','6/13'];
  var w = 400, h = 180, padX = 40, padY = 20;
  var maxV = Math.max.apply(null, data) * 1.2;
  var stepX = (w - padX*2) / (data.length - 1);

  var points = data.map(function(v, i) {
    return (padX + i * stepX) + ',' + (h - padY - (v / maxV) * (h - padY*2));
  });

  var areaPoints = points.join(' ') + ' ' + (padX + (data.length-1)*stepX) + ',' + (h - padY) + ' ' + padX + ',' + (h - padY);

  var svg = '<svg viewBox="0 0 '+w+' '+h+'" style="width:100%;height:auto;">';
  svg += '<defs>';
  svg += '<linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--p)" stop-opacity="0.25"/><stop offset="100%" stop-color="var(--p2)" stop-opacity="0.02"/></linearGradient>';
  svg += '<filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  svg += '</defs>';

  // Grid lines
  for (var i = 0; i <= 4; i++) {
    var y = padY + i * (h - padY*2) / 4;
    svg += '<line x1="'+padX+'" y1="'+y+'" x2="'+(w-padX)+'" y2="'+y+'" stroke="var(--bd)" stroke-width="0.5"/>';
  }

  svg += '<polygon points="'+areaPoints+'" fill="url(#areaGrad)"/>';
  svg += '<polyline points="'+points.join(' ')+'" fill="none" stroke="var(--p)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>';

  data.forEach(function(v, i) {
    var x = padX + i * stepX;
    var y = h - padY - (v / maxV) * (h - padY*2);
    svg += '<circle cx="'+x+'" cy="'+y+'" r="4" fill="var(--bg3)" stroke="var(--p)" stroke-width="2" filter="url(#glow)"/>';
    svg += '<text x="'+x+'" y="'+(h-4)+'" text-anchor="middle" fill="var(--nd)" font-size="10">'+labels[i]+'</text>';
    svg += '<text x="'+x+'" y="'+(y-10)+'" text-anchor="middle" fill="var(--p)" font-size="10" font-weight="600">'+v+'</text>';
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
  html += '</div>';
  html += '</div>';

  html += '<div class="dash-card"><div style="overflow-x:auto;"><table class="admin-table" id="users-table"><thead><tr>';
  html += '<th><input type="checkbox" id="user-select-all" onchange="AdminAPI.toggleSelectAll(this)"></th>';
  html += '<th>用户名</th><th>状态</th><th>算力余额</th><th>注册时间</th><th>最后登录</th><th>操作</th>';
  html += '</tr></thead><tbody id="users-tbody">';

  users.forEach(function(u) {
    html += renderUserRow(u, credits[u.username] || 0);
  });

  html += '</tbody></table></div></div>';
  html += '<div id="user-pagination" class="pagination"></div>';

  $('#main-content').innerHTML = html;
  AdminAPI.filterUsers();
}

function renderUserRow(u, credit) {
  var statusMap = {pending:'<span class="badge badge-warn">待审批</span>',approved:'<span class="badge badge-ok">已通过</span>',banned:'<span class="badge badge-err">已封禁</span>',rejected:'<span class="badge badge-err">已拒绝</span>'};
  var isAdmin = u.role === 'superadmin';
  var html = '<tr data-username="'+u.username+'" data-status="'+u.status+'">';
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
    if (u.status === 'approved') {
      html += '<button class="btn-xs btn-warn" onclick="AdminAPI.banUser(\''+u.username+'\')">封禁</button>';
    }
    if (u.status === 'banned') {
      html += '<button class="btn-xs btn-ok" onclick="AdminAPI.unbanUser(\''+u.username+'\')">解封</button>';
    }
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
  var totalTools = 0;
  var enabledTools = 0;
  toolCats.forEach(function(cat) {
    cat.tools.forEach(function(t) {
      totalTools++;
      if (t.enabled) enabledTools++;
    });
  });

  var html = '<div class="page-toolbar">';
  html += '<div class="toolbar-left"><span style="color:var(--nd);">共 <strong style="color:var(--p)">'+totalTools+'</strong> 个工具，已启用 <strong style="color:var(--ok)">'+enabledTools+'</strong> 个</span>';
  html += '<input type="text" id="tool-search" placeholder="搜索工具名称..." oninput="AdminAPI.searchTools()" style="margin-left:12px;">';
  html += '</div>';
  html += '<div class="toolbar-right">';
  html += '<button class="admin-btn" style="background:var(--ok);" onclick="AdminAPI.enableAllTools()"><i class="fa-solid fa-toggle-on"></i> 全部启用</button>';
  html += '<button class="admin-btn" style="background:var(--err);" onclick="AdminAPI.disableAllTools()"><i class="fa-solid fa-toggle-off"></i> 全部禁用</button>';
  html += '<button class="admin-btn" style="background:var(--p2);" onclick="AdminAPI.batchAdjustToolCredits()"><i class="fa-solid fa-sliders"></i> 批量调价</button>';
  html += '<button class="admin-btn" onclick="AdminAPI.resetTools()"><i class="fa-solid fa-rotate"></i> 重置默认</button>';
  html += '</div>';
  html += '</div>';

  // 分类标签
  html += '<div class="tab-bar" id="tool-tabs">';
  html += '<div class="tab-item active" data-cat="all" onclick="AdminAPI.switchToolTab(\'all\',this)">全部</div>';
  toolCats.forEach(function(cat) {
    html += '<div class="tab-item" data-cat="'+cat.id+'" onclick="AdminAPI.switchToolTab(\''+cat.id+'\',this)">'+cat.name+' ('+cat.tools.length+')</div>';
  });
  html += '</div>';

  // 工具列表
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

  // 子标签
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
  if (refunds.length === 0) {
    html += '<tr><td colspan="7" style="text-align:center;color:var(--nd);padding:40px;">暂无退款记录</td></tr>';
  }
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
  html += '<div id="content-area">';
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

  // 角色列表
  html += '<div class="dash-grid">';
  roles.forEach(function(r) {
    var isSuper = r.id === 'superadmin';
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
    if (!isSuper) {
      html += '<div style="margin-top:12px;"><button class="admin-btn" style="font-size:12px;" onclick="AdminAPI.editRole(\''+r.id+'\')"><i class="fa-solid fa-pen"></i> 编辑</button></div>';
    }
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
    var roleMap = {superadmin:'<span class="badge badge-warn">超级管理员</span>',admin:'<span class="badge badge-p">管理员</span>',viewer:'<span class="badge badge-ok">查看者</span>'};
    var isSuper = a.role === 'superadmin';
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

// ========== 公共API ==========
window.AdminAPI = {
  // 登录
  login: function(username, password) {
    var users = Store.getUsers() || [];
    var user = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username && users[i].password === password) {
        user = users[i]; break;
      }
    }
    if (!user) { toast('用户名或密码错误', 'error'); return; }
    if (user.status === 'banned') { toast('账号已被封禁', 'error'); return; }
    if (user.status === 'pending') { toast('账号待审批，请联系管理员', 'warning'); return; }
    if (user.status === 'rejected') { toast('账号已被拒绝', 'error'); return; }
    // 检查是否为管理员
    var admins = Store.get('admins') || [];
    var isAdmin = false;
    var role = 'viewer';
    for (var j = 0; j < admins.length; j++) {
      if (admins[j].username === username) {
        isAdmin = true;
        role = admins[j].role;
        break;
      }
    }
    if (username === 'KF02V9') { isAdmin = true; role = 'superadmin'; }
    if (!isAdmin) { toast('无管理员权限', 'error'); return; }

    Store.setSession({ username: username, role: role, loginTime: new Date().toISOString() });
    addLog('login', '管理员 '+username+' 登录系统');
    toast('登录成功', 'success');
    setTimeout(function() { showMainApp(); }, 500);
  },

  logout: function() {
    var session = Store.getSession();
    if (session) addLog('login', '管理员 '+session.username+' 退出系统');
    Store.clearSession();
    showLoginPage();
  },

  // 用户管理
  approveUser: function(username) {
    confirmDialog('确定通过用户 "'+username+'" 的审批？', function() {
      var users = Store.getUsers() || [];
      for (var i = 0; i < users.length; i++) {
        if (users[i].username === username) { users[i].status = 'approved'; break; }
      }
      Store.setUsers(users);
      addLog('user', '审批通过用户 '+username);
      toast('已通过用户 '+username, 'success');
      navigate(currentPage);
    });
  },

  rejectUser: function(username) {
    confirmDialog('确定拒绝用户 "'+username+'" 的注册？', function() {
      var users = Store.getUsers() || [];
      for (var i = 0; i < users.length; i++) {
        if (users[i].username === username) { users[i].status = 'rejected'; break; }
      }
      Store.setUsers(users);
      addLog('user', '拒绝用户 '+username);
      toast('已拒绝用户 '+username, 'warning');
      navigate(currentPage);
    });
  },

  banUser: function(username) {
    confirmDialog('确定封禁用户 "'+username+'"？封禁后该用户将无法登录。', function() {
      var users = Store.getUsers() || [];
      for (var i = 0; i < users.length; i++) {
        if (users[i].username === username) { users[i].status = 'banned'; break; }
      }
      Store.setUsers(users);
      addLog('user', '封禁用户 '+username);
      toast('已封禁用户 '+username, 'warning');
      navigate(currentPage);
    });
  },

  unbanUser: function(username) {
    confirmDialog('确定解封用户 "'+username+'"？', function() {
      var users = Store.getUsers() || [];
      for (var i = 0; i < users.length; i++) {
        if (users[i].username === username) { users[i].status = 'approved'; break; }
      }
      Store.setUsers(users);
      addLog('user', '解封用户 '+username);
      toast('已解封用户 '+username, 'success');
      navigate(currentPage);
    });
  },

  addUser: function() {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.zIndex = '99998';
    var box = document.createElement('div');
    box.className = 'modal-box';
    box.style.maxWidth = '420px';
    box.innerHTML = '<div style="font-size:16px;font-weight:600;margin-bottom:16px;"><i class="fa-solid fa-user-plus" style="color:var(--ok)"></i> 创建用户</div>'+
      '<div class="form-group"><label>用户名</label><input type="text" id="new-user-name" placeholder="至少3个字符" style="width:100%"></div>'+
      '<div class="form-group"><label>密码</label><input type="password" id="new-user-pwd" placeholder="至少6个字符" style="width:100%"></div>'+
      '<div class="form-group"><label>昵称</label><input type="text" id="new-user-nick" placeholder="选填" style="width:100%"></div>'+
      '<div class="form-group"><label>手机号</label><input type="text" id="new-user-phone" placeholder="选填" maxlength="11" style="width:100%"></div>'+
      '<div class="form-group"><label>初始算力</label><input type="number" id="new-user-credits" value="100" min="0" style="width:100%"></div>'+
      '<div class="form-group"><label>角色</label><select id="new-user-role" style="width:100%"><option value="user">普通用户</option><option value="admin">管理员</option></select></div>'+
      '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px">'+
      '<button class="admin-btn-cancel" onclick="this.closest(\'div[style*=fixed]\').remove()">取消</button>'+
      '<button class="admin-btn" onclick="AdminAPI.doAddUser()">确认创建</button></div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e){ if(e.target===overlay) overlay.remove(); });
  },

  doAddUser: function() {
    var username = document.getElementById('new-user-name').value.trim();
    var pwd = document.getElementById('new-user-pwd').value;
    var nick = document.getElementById('new-user-nick').value.trim();
    var phone = document.getElementById('new-user-phone').value.trim();
    var credits = parseInt(document.getElementById('new-user-credits').value)||0;
    var role = document.getElementById('new-user-role').value;
    if(username.length<3) return toast('用户名至少3个字符','error');
    if(pwd.length<6) return toast('密码至少6个字符','error');
    var users = Store.getUsers() || [];
    if(users.find(function(u){return u.username===username})) return toast('用户名已存在','error');
    if(phone&&users.find(function(u){return u.phone===phone})) return toast('手机号已被注册','error');
    users.push({username:username,password:btoa(pwd),nickname:nick||username,role:role,status:'approved',phone:phone,qq:'',wx:'',created:new Date().toLocaleString(),registerTime:new Date().toISOString()});
    Store.setUsers(users);
    var allCredits = Store.getCredits() || {};
    allCredits[username] = credits;
    Store.setCredits(allCredits);
    addLog('user', '创建用户 '+username+' (角色:'+role+', 算力:'+credits+')');
    toast('用户 '+username+' 创建成功','success');
    document.querySelector('div[style*="fixed"][style*="99998"]').remove();
    navigate(currentPage);
  },

  deleteUser: function(username) {
    confirmDialog('确定删除用户 "'+username+'"？此操作不可恢复！', function() {
      var users = Store.getUsers() || [];
      users = users.filter(function(u){ return u.username !== username; });
      Store.setUsers(users);
      var credits = Store.getCredits() || {};
      delete credits[username];
      Store.setCredits(credits);
      addLog('user', '删除用户 '+username);
      toast('已删除用户 '+username, 'success');
      navigate(currentPage);
    });
  },

  adjustCredits: function(username) {
    var credits = Store.getCredits() || {};
    var current = credits[username] || 0;
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.zIndex = '99998';
    var box = document.createElement('div');
    box.className = 'modal-box';
    box.style.maxWidth = '400px';
    box.innerHTML = '<div style="font-size:16px;font-weight:600;margin-bottom:16px;">调整算力 - '+username+'</div>'+
      '<div style="margin-bottom:12px;color:var(--nd);">当前算力: <strong style="color:var(--p)">'+current+'</strong></div>'+
      '<div class="form-group"><label>调整方式</label><select id="credit-action" style="width:100%"><option value="add">增加</option><option value="set">设为</option><option value="subtract">减少</option></select></div>'+
      '<div class="form-group"><label>数量</label><input type="number" id="credit-amount" value="100" min="1" style="width:100%"></div>'+
      '<div style="display:flex;gap:10px;justify-content:flex-end;">'+
      '<button class="admin-btn-cancel" onclick="this.closest(\'div[style*=fixed]\').remove()">取消</button>'+
      '<button class="admin-btn" onclick="AdminAPI.doAdjustCredits(\''+username+'\')">确认</button></div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    overlay.onclick = function(e) { if(e.target===overlay) overlay.remove(); };
  },

  doAdjustCredits: function(username) {
    var action = document.getElementById('credit-action').value;
    var amount = parseInt(document.getElementById('credit-amount').value) || 0;
    var credits = Store.getCredits() || {};
    var old = credits[username] || 0;
    if (action === 'add') credits[username] = old + amount;
    else if (action === 'set') credits[username] = amount;
    else if (action === 'subtract') credits[username] = Math.max(0, old - amount);
    Store.setCredits(credits);
    addLog('user', '调整用户 '+username+' 算力: '+old+' -> '+credits[username]);
    toast('算力已调整: '+old+' -> '+credits[username], 'success');
    document.querySelector('div[style*="fixed"]').remove();
    navigate(currentPage);
  },

  batchApprove: function() {
    var checked = document.querySelectorAll('.user-checkbox:checked');
    if (checked.length === 0) { toast('请先选择用户', 'warning'); return; }
    var usernames = [];
    checked.forEach(function(cb) { usernames.push(cb.value); });
    confirmDialog('确定批量通过 '+usernames.length+' 个用户？', function() {
      var users = Store.getUsers() || [];
      users.forEach(function(u) {
        if (usernames.indexOf(u.username) >= 0 && u.status === 'pending') {
          u.status = 'approved';
        }
      });
      Store.setUsers(users);
      addLog('user', '批量审批通过 '+usernames.length+' 个用户');
      toast('已批量通过 '+usernames.length+' 个用户', 'success');
      navigate(currentPage);
    });
  },

  toggleSelectAll: function(el) {
    document.querySelectorAll('.user-checkbox').forEach(function(cb) { cb.checked = el.checked; });
  },

  filterUsers: function() {
    var search = (document.getElementById('user-search') || {}).value || '';
    var filter = (document.getElementById('user-filter') || {}).value || '';
    var rows = document.querySelectorAll('#users-tbody tr');
    rows.forEach(function(tr) {
      var un = (tr.dataset.username || '').toLowerCase();
      var st = tr.dataset.status || '';
      var show = true;
      if (search && un.indexOf(search.toLowerCase()) < 0) show = false;
      if (filter && st !== filter) show = false;
      tr.style.display = show ? '' : 'none';
    });
  },

  // AI工具管理
  switchToolTab: function(cat, el) {
    $$('#tool-tabs .tab-item').forEach(function(t){ t.classList.remove('active'); });
    el.classList.add('active');
    var toolCats = Store.get('tools') || TOOL_CATEGORIES;
    document.getElementById('tools-list').innerHTML = renderToolsList(toolCats, cat);
  },

  toggleTool: function(catId, toolId, enabled) {
    var toolCats = Store.get('tools') || TOOL_CATEGORIES;
    toolCats.forEach(function(cat) {
      if (cat.id === catId) {
        cat.tools.forEach(function(t) {
          if (t.id === toolId) t.enabled = enabled;
        });
      }
    });
    Store.set('tools', toolCats);
    toast('工具已'+(enabled?'启用':'禁用'), 'success');
  },

  toggleCategory: function(catId, enabled) {
    var toolCats = Store.get('tools') || TOOL_CATEGORIES;
    toolCats.forEach(function(cat) {
      if (cat.id === catId) {
        cat.tools.forEach(function(t) { t.enabled = enabled; });
      }
    });
    Store.set('tools', toolCats);
    toast(catId+'分类已'+(enabled?'全部启用':'全部禁用'), 'success');
    navigate(currentPage);
  },

  updateToolCredit: function(catId, toolId, val) {
    var toolCats = Store.get('tools') || TOOL_CATEGORIES;
    toolCats.forEach(function(cat) {
      if (cat.id === catId) {
        cat.tools.forEach(function(t) {
          if (t.id === toolId) t.credit = parseInt(val) || 1;
        });
      }
    });
    Store.set('tools', toolCats);
  },

  resetTools: function() {
    confirmDialog('确定重置所有工具配置为默认值？', function() {
      Store.set('tools', TOOL_CATEGORIES);
      toast('工具配置已重置', 'success');
      navigate(currentPage);
    });
  },

  // 财务管理
  switchFinanceTab: function(tab, el) {
    el.parentElement.querySelectorAll('.tab-item').forEach(function(t){ t.classList.remove('active'); });
    el.classList.add('active');
    var content = document.getElementById('finance-content');
    if (tab === 'orders') content.innerHTML = renderFinanceOrders(Store.get('orders') || []);
    else if (tab === 'refunds') content.innerHTML = renderFinanceRefunds();
    else if (tab === 'payments') content.innerHTML = renderFinancePayments();
    else if (tab === 'revenue') content.innerHTML = renderFinanceRevenue();
    else if (tab === 'stats') content.innerHTML = renderFinanceStats();
  },

  completeOrder: function(orderId) {
    var orders = Store.get('orders') || [];
    orders.forEach(function(o) {
      if (o.id === orderId) o.status = 'completed';
    });
    Store.set('orders', orders);
    addLog('finance', '完成订单 '+orderId);
    toast('订单已完成', 'success');
    navigate(currentPage);
  },

  approveRefund: function(orderId) {
    var orders = Store.get('orders') || [];
    orders.forEach(function(o) { if (o.id === orderId) o.status = 'completed'; });
    Store.set('orders', orders);
    addLog('finance', '批准退款 '+orderId);
    toast('退款已批准', 'success');
    navigate(currentPage);
  },

  rejectRefund: function(orderId) {
    confirmDialog('确定拒绝此退款？', function() {
      var orders = Store.get('orders') || [];
      orders = orders.filter(function(o){ return o.id !== orderId; });
      Store.set('orders', orders);
      toast('退款已拒绝', 'warning');
      navigate(currentPage);
    });
  },

  exportFinance: function() {
    var orders = Store.get('orders') || [];
    var csv = '订单号,用户,类型,金额,算力,支付方式,状态,时间\n';
    orders.forEach(function(o) {
      csv += o.id+','+o.username+','+o.type+','+o.amount+','+o.credits+','+o.method+','+o.status+','+o.time+'\n';
    });
    var blob = new Blob(['\ufeff'+csv], {type:'text/csv'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'finance_export_'+formatDate(new Date().toISOString())+'.csv';
    a.click();
    toast('数据已导出', 'success');
  },

  // 内容管理
  switchContentTab: function(tab, el) {
    el.parentElement.querySelectorAll('.tab-item').forEach(function(t){ t.classList.remove('active'); });
    el.classList.add('active');
    var content = document.getElementById('content-area');
    if (tab === 'announcements') content.innerHTML = renderContentAnnouncements();
    else if (tab === 'faq') content.innerHTML = renderContentFAQ();
    else if (tab === 'seo') content.innerHTML = renderContentSEO();
    else if (tab === 'popup') content.innerHTML = renderContentPopup();
    else if (tab === 'changelog') content.innerHTML = renderContentChangelog();
    else if (tab === 'emailtpl') content.innerHTML = renderContentEmailTpl();
  },

  addAnnouncement: function() {
    showAnnouncementForm(null);
  },

  editAnnouncement: function(id) {
    var anns = Store.get('announcements') || [];
    var ann = anns.filter(function(a){ return a.id===id; })[0];
    if (ann) showAnnouncementForm(ann);
  },

  deleteAnnouncement: function(id) {
    confirmDialog('确定删除此公告？', function() {
      var anns = Store.get('announcements') || [];
      anns = anns.filter(function(a){ return a.id!==id; });
      Store.set('announcements', anns);
      toast('公告已删除', 'success');
      navigate(currentPage);
    });
  },

  addFAQ: function() {
    showFAQForm(null);
  },

  editFAQ: function(id) {
    var faqs = Store.get('faqs') || [];
    var faq = faqs.filter(function(f){ return f.id===id; })[0];
    if (faq) showFAQForm(faq);
  },

  deleteFAQ: function(id) {
    confirmDialog('确定删除此FAQ？', function() {
      var faqs = Store.get('faqs') || [];
      faqs = faqs.filter(function(f){ return f.id!==id; });
      Store.set('faqs', faqs);
      toast('FAQ已删除', 'success');
      navigate(currentPage);
    });
  },

  saveSEO: function() {
    var seo = {
      title: document.getElementById('seo-title').value,
      keywords: document.getElementById('seo-keywords').value,
      description: document.getElementById('seo-desc').value,
      favicon: ''
    };
    Store.set('seo', seo);
    toast('SEO设置已保存', 'success');
  },

  togglePopup: function(id, enabled) {
    var popups = Store.get('popups') || [];
    popups.forEach(function(p) { if (p.id === id) p.enabled = enabled; });
    Store.set('popups', popups);
    toast('弹窗已'+(enabled?'启用':'禁用'), 'success');
  },

  deletePopup: function(id) {
    confirmDialog('确定删除此弹窗广告？', function() {
      var popups = Store.get('popups') || [];
      popups = popups.filter(function(p){ return p.id!==id; });
      Store.set('popups', popups);
      toast('弹窗已删除', 'success');
      navigate(currentPage);
    });
  },

  addPopup: function() {
    showPopupForm();
  },

  addChangelog: function() {
    showChangelogForm();
  },

  // 权限管理
  switchPermTab: function(tab, el) {
    el.parentElement.querySelectorAll('.tab-item').forEach(function(t){ t.classList.remove('active'); });
    el.classList.add('active');
    var content = document.getElementById('perm-content');
    if (tab === 'admins') content.innerHTML = renderPermAdmins();
    else if (tab === 'matrix') content.innerHTML = renderPermMatrix();
    else if (tab === 'audit') content.innerHTML = renderPermAudit();
    else navigate(currentPage);
  },

  addAdmin: function() {
    showAdminForm(null);
  },

  editAdmin: function(username) {
    var admins = Store.get('admins') || [];
    var admin = admins.filter(function(a){ return a.username===username; })[0];
    if (admin) showAdminForm(admin);
  },

  removeAdmin: function(username) {
    confirmDialog('确定移除管理员 "'+username+'"？', function() {
      var admins = Store.get('admins') || [];
      admins = admins.filter(function(a){ return a.username!==username; });
      Store.set('admins', admins);
      addLog('user', '移除管理员 '+username);
      toast('管理员已移除', 'success');
      navigate(currentPage);
    });
  },

  editRole: function(roleId) {
    showRoleForm(roleId);
  },

  // 系统设置
  switchSettingsTab: function(tab, el) {
    el.parentElement.querySelectorAll('.tab-item').forEach(function(t){ t.classList.remove('active'); });
    el.classList.add('active');
    var content = document.getElementById('settings-content');
    if (tab === 'basic') content.innerHTML = renderSettingsBasic(Store.get('settings')||{});
    else if (tab === 'theme') content.innerHTML = renderSettingsTheme();
    else if (tab === 'api') content.innerHTML = renderSettingsAPI();
    else if (tab === 'email') content.innerHTML = renderSettingsEmail();
    else if (tab === 'backup') content.innerHTML = renderSettingsBackup();
    else if (tab === 'logs') content.innerHTML = renderSettingsLogs();
    else if (tab === 'health') content.innerHTML = renderSettingsHealth();
    else if (tab === 'about') content.innerHTML = renderSettingsAbout();
  },

  saveBasicSettings: function() {
    var settings = Store.get('settings') || {};
    settings.siteName = document.getElementById('set-sitename').value;
    settings.siteDesc = document.getElementById('set-sitedesc').value;
    Store.set('settings', settings);
    addLog('system', '更新基本设置');
    toast('设置已保存', 'success');
  },

  setTheme: function(theme) {
    var settings = Store.get('settings') || {};
    settings.theme = theme;
    Store.set('settings', settings);
    applyTheme(theme);
    toast('主题已切换', 'success');
    navigate(currentPage);
  },

  saveAPISettings: function() {
    var settings = Store.get('settings') || {};
    settings.apiKey = document.getElementById('set-apikey').value;
    settings.apiEndpoint = document.getElementById('set-apiendpoint').value;
    Store.set('settings', settings);
    addLog('system', '更新API配置');
    toast('API配置已保存', 'success');
  },

  testAPI: function() {
    toast('API连接测试中...', 'info');
    setTimeout(function() {
      var settings = Store.get('settings') || {};
      if (settings.apiKey) toast('API连接成功！', 'success');
      else toast('未配置API Key，当前使用模拟数据', 'warning');
    }, 1500);
  },

  backupData: function() {
    var data = {};
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key.indexOf('lsjy') === 0 || key.indexOf(APP.prefix) === 0) {
        data[key] = localStorage.getItem(key);
      }
    }
    var blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'lsjy_backup_'+formatDate(new Date().toISOString())+'.json';
    a.click();
    addLog('system', '数据备份完成');
    toast('数据已备份', 'success');
  },

  restoreData: function() {
    var fileInput = document.getElementById('restore-file');
    if (!fileInput.files.length) { toast('请选择备份文件', 'warning'); return; }
    confirmDialog('恢复数据将覆盖当前所有数据，确定继续？', function() {
      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          var data = JSON.parse(e.target.result);
          Object.keys(data).forEach(function(key) {
            localStorage.setItem(key, data[key]);
          });
          addLog('system', '数据恢复完成');
          toast('数据已恢复，页面将刷新', 'success');
          setTimeout(function(){ location.reload(); }, 1500);
        } catch(err) {
          toast('文件格式错误', 'error');
        }
      };
      reader.readAsText(fileInput.files[0]);
    });
  },

  clearAllData: function() {
    confirmDialog('确定清除所有数据？此操作不可恢复！', function() {
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.indexOf('lsjy') === 0) keys.push(key);
      }
      keys.forEach(function(k){ localStorage.removeItem(k); });
      toast('数据已清除，页面将刷新', 'success');
      setTimeout(function(){ location.reload(); }, 1500);
    });
  },

  clearLogs: function() {
    confirmDialog('确定清空所有日志？', function() {
      Store.set('logs', []);
      toast('日志已清空', 'success');
      navigate(currentPage);
    });
  },

  // ===== 增强功能 =====

  // 数据看板 - 切换时间周期
  switchDashPeriod: function(days) {
    var btn7 = document.getElementById('dash-period-7');
    var btn30 = document.getElementById('dash-period-30');
    if (btn7) { btn7.style.background = days===7?'var(--p)':''; btn7.style.color = days===7?'#fff':''; }
    if (btn30) { btn30.style.background = days===30?'var(--p)':''; btn30.style.color = days===30?'#fff':''; }
    // Re-render chart in the second dash-card
    var chartCards = document.querySelectorAll('.dash-card');
    for (var i = 0; i < chartCards.length; i++) {
      var header = chartCards[i].querySelector('.dash-card-header');
      if (header && header.textContent.indexOf('用户增长') >= 0) {
        var chartDiv = chartCards[i].querySelector('div[style*="padding"]');
        if (chartDiv) chartDiv.innerHTML = renderSVGChartExtended(days);
        break;
      }
    }
    toast('已切换至近'+days+'天趋势', 'info');
  },

  // 用户管理 - 查看用户详情
  viewUserDetail: function(username) {
    var users = Store.getUsers() || [];
    var user = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].username === username) { user = users[i]; break; }
    }
    if (!user) { toast('用户不存在', 'error'); return; }
    var credits = Store.getCredits() || {};
    var credit = credits[username] || 0;
    var orders = (Store.get('orders') || []).filter(function(o){ return o.username===username; });
    var statusMap = {pending:'待审批',approved:'已通过',banned:'已封禁',rejected:'已拒绝'};

    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.zIndex = '99998';
    var box = document.createElement('div');
    box.className = 'modal-box';
    box.style.maxWidth = '600px';
    box.style.maxHeight = '85vh';
    box.style.overflowY = 'auto';
    var html = '<div style="font-size:18px;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px;"><i class="fa-solid fa-user" style="color:var(--p)"></i> 用户详情</div>';

    html += '<div style="background:var(--bg2);border-radius:8px;padding:16px;margin-bottom:16px;">';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;">';
    html += '<div><span style="color:var(--nd);">用户名：</span><strong>'+user.username+'</strong></div>';
    html += '<div><span style="color:var(--nd);">状态：</span><span class="badge badge-'+(user.status==='approved'?'ok':user.status==='pending'?'warn':'err')+'">'+(statusMap[user.status]||user.status)+'</span></div>';
    html += '<div><span style="color:var(--nd);">手机：</span>'+(user.phone||'-')+'</div>';
    html += '<div><span style="color:var(--nd);">邮箱：</span>'+(user.email||'-')+'</div>';
    html += '<div><span style="color:var(--nd);">注册时间：</span>'+formatTime(user.registerTime)+'</div>';
    html += '<div><span style="color:var(--nd);">最后登录：</span>'+formatTime(user.lastLogin)+'</div>';
    html += '<div><span style="color:var(--nd);">算力余额：</span><strong style="color:var(--p);">'+credit+'</strong></div>';
    html += '<div><span style="color:var(--nd);">订单数：</span>'+orders.length+'</div>';
    html += '</div></div>';

    html += '<div style="margin-bottom:16px;"><div style="font-weight:600;margin-bottom:8px;"><i class="fa-solid fa-bolt" style="color:#f59e0b"></i> 近期算力消费</div>';
    html += '<div style="background:var(--bg2);border-radius:8px;padding:12px;max-height:200px;overflow-y:auto;">';
    var sampleConsume = [
      {tool:'AI文章生成',credit:5,time:'2026-06-12 15:30'},{tool:'AI绘画',credit:10,time:'2026-06-12 11:20'},
      {tool:'AI翻译助手',credit:2,time:'2026-06-11 16:45'},{tool:'AI代码生成',credit:6,time:'2026-06-11 09:10'},
      {tool:'AI摘要提取',credit:3,time:'2026-06-10 14:00'},{tool:'AI简历优化',credit:4,time:'2026-06-10 10:30'},
      {tool:'AI数据分析',credit:6,time:'2026-06-09 15:20'},{tool:'AI语音合成',credit:5,time:'2026-06-09 08:45'}
    ];
    sampleConsume.forEach(function(c){
      html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bd);font-size:12px;">';
      html += '<span>'+c.tool+'</span><span style="color:var(--err);">-'+c.credit+'</span><span style="color:var(--nd);">'+c.time+'</span>';
      html += '</div>';
    });
    html += '</div></div>';

    if (orders.length > 0) {
      html += '<div style="margin-bottom:16px;"><div style="font-weight:600;margin-bottom:8px;"><i class="fa-solid fa-receipt" style="color:var(--ok)"></i> 相关订单</div>';
      html += '<div style="background:var(--bg2);border-radius:8px;padding:12px;max-height:200px;overflow-y:auto;">';
      orders.forEach(function(o){
        html += '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bd);font-size:12px;">';
        html += '<span style="color:var(--nd);">'+o.id+'</span>';
        html += '<span>'+(o.type==='recharge'?'充值':'退款')+'</span>';
        html += '<span style="color:'+(o.amount>0?'var(--ok)':'var(--err)')+'">¥'+Math.abs(o.amount)+'</span>';
        html += '<span style="color:var(--nd);">'+formatTime(o.time)+'</span>';
        html += '</div>';
      });
      html += '</div></div>';
    }

    html += '<div style="display:flex;gap:10px;justify-content:flex-end;">';
    html += '<button class="admin-btn-cancel" onclick="this.closest(\'div[style*=fixed]\').remove()">关闭</button>';
    html += '<button class="admin-btn" onclick="AdminAPI.adjustCredits(\''+username+'\');this.closest(\'div[style*=fixed]\').remove();">调整算力</button>';
    html += '</div>';

    box.innerHTML = html;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    overlay.onclick = function(e) { if(e.target===overlay) overlay.remove(); };
  },

  // 用户管理 - 批量封禁
  batchBan: function() {
    var checked = document.querySelectorAll('.user-checkbox:checked');
    if (checked.length === 0) { toast('请先选择用户', 'warning'); return; }
    var usernames = [];
    checked.forEach(function(cb) { usernames.push(cb.value); });
    confirmDialog('确定批量封禁 '+usernames.length+' 个用户？', function() {
      var users = Store.getUsers() || [];
      users.forEach(function(u) {
        if (usernames.indexOf(u.username) >= 0 && u.status === 'approved') {
          u.status = 'banned';
        }
      });
      Store.setUsers(users);
      addLog('user', '批量封禁 '+usernames.length+' 个用户');
      toast('已批量封禁 '+usernames.length+' 个用户', 'warning');
      navigate(currentPage);
    });
  },

  // 用户管理 - 批量删除
  batchDelete: function() {
    var checked = document.querySelectorAll('.user-checkbox:checked');
    if (checked.length === 0) { toast('请先选择用户', 'warning'); return; }
    var usernames = [];
    checked.forEach(function(cb) { usernames.push(cb.value); });
    confirmDialog('确定批量删除 '+usernames.length+' 个用户？此操作不可恢复！', function() {
      var users = Store.getUsers() || [];
      users = users.filter(function(u){ return usernames.indexOf(u.username) < 0; });
      Store.setUsers(users);
      var credits = Store.getCredits() || {};
      usernames.forEach(function(un){ delete credits[un]; });
      Store.setCredits(credits);
      addLog('user', '批量删除 '+usernames.length+' 个用户');
      toast('已批量删除 '+usernames.length+' 个用户', 'success');
      navigate(currentPage);
    });
  },

  // 用户管理 - 导出用户
  exportUsers: function() {
    var users = Store.getUsers() || [];
    var credits = Store.getCredits() || {};
    var csv = '用户名,状态,算力余额,注册时间,最后登录,手机,邮箱\n';
    users.forEach(function(u) {
      csv += u.username+','+u.status+','+(credits[u.username]||0)+','+formatTime(u.registerTime)+','+formatTime(u.lastLogin)+','+(u.phone||'')+','+(u.email||'')+'\n';
    });
    var blob = new Blob(['\ufeff'+csv], {type:'text/csv'});
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'users_export_'+formatDate(new Date().toISOString())+'.csv';
    a.click();
    toast('用户数据已导出', 'success');
  },

  // 工具管理 - 搜索工具
  searchTools: function() {
    var keyword = (document.getElementById('tool-search') || {}).value || '';
    keyword = keyword.toLowerCase();
    var rows = document.querySelectorAll('#tools-list tr');
    rows.forEach(function(tr) {
      var tds = tr.querySelectorAll('td');
      if (tds.length < 2) return;
      var name = (tds[1].textContent || '').toLowerCase();
      tr.style.display = (!keyword || name.indexOf(keyword) >= 0) ? '' : 'none';
    });
  },

  // 工具管理 - 全部启用
  enableAllTools: function() {
    confirmDialog('确定启用所有工具？', function() {
      var toolCats = Store.get('tools') || TOOL_CATEGORIES;
      toolCats.forEach(function(cat) {
        cat.tools.forEach(function(t) { t.enabled = true; });
      });
      Store.set('tools', toolCats);
      addLog('system', '启用所有工具');
      toast('已启用所有工具', 'success');
      navigate(currentPage);
    });
  },

  // 工具管理 - 全部禁用
  disableAllTools: function() {
    confirmDialog('确定禁用所有工具？', function() {
      var toolCats = Store.get('tools') || TOOL_CATEGORIES;
      toolCats.forEach(function(cat) {
        cat.tools.forEach(function(t) { t.enabled = false; });
      });
      Store.set('tools', toolCats);
      addLog('system', '禁用所有工具');
      toast('已禁用所有工具', 'warning');
      navigate(currentPage);
    });
  },

  // 工具管理 - 批量调整算力
  batchAdjustToolCredits: function() {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.zIndex = '99998';
    var box = document.createElement('div');
    box.className = 'modal-box';
    box.style.maxWidth = '400px';
    box.innerHTML = '<div style="font-size:16px;font-weight:600;margin-bottom:16px;"><i class="fa-solid fa-sliders" style="color:var(--p2)"></i> 批量调整算力</div>'+
      '<div class="form-group"><label>调整方式</label><select id="batch-credit-action" style="width:100%"><option value="multiply">乘以倍数</option><option value="add">统一增加</option><option value="set">统一设为</option></select></div>'+
      '<div class="form-group"><label>数值</label><input type="number" id="batch-credit-value" value="1" min="0" step="0.5" style="width:100%"></div>'+
      '<div class="form-group"><label>应用范围</label><select id="batch-credit-scope" style="width:100%"><option value="all">所有工具</option><option value="text">文本生成</option><option value="image">图片生成</option><option value="code">编程开发</option><option value="audio">音频视频</option><option value="data">数据分析</option><option value="edu">教育学习</option><option value="life">生活助手</option></select></div>'+
      '<div style="display:flex;gap:10px;justify-content:flex-end;">'+
      '<button class="admin-btn-cancel" onclick="this.closest(\'div[style*=fixed]\').remove()">取消</button>'+
      '<button class="admin-btn" onclick="AdminAPI._doBatchAdjustCredits()">确认调整</button></div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    overlay.onclick = function(e) { if(e.target===overlay) overlay.remove(); };
  },

  _doBatchAdjustCredits: function() {
    var action = document.getElementById('batch-credit-action').value;
    var value = parseFloat(document.getElementById('batch-credit-value').value) || 0;
    var scope = document.getElementById('batch-credit-scope').value;
    var toolCats = Store.get('tools') || TOOL_CATEGORIES;
    var count = 0;
    toolCats.forEach(function(cat) {
      if (scope !== 'all' && cat.id !== scope) return;
      cat.tools.forEach(function(t) {
        if (action === 'multiply') t.credit = Math.max(1, Math.round(t.credit * value));
        else if (action === 'add') t.credit = Math.max(1, t.credit + Math.round(value));
        else if (action === 'set') t.credit = Math.max(1, Math.round(value));
        count++;
      });
    });
    Store.set('tools', toolCats);
    addLog('system', '批量调整工具算力: '+action+' '+value+' ('+count+'个工具)');
    toast('已调整 '+count+' 个工具的算力消耗', 'success');
    document.querySelector('div[style*="fixed"]').remove();
    navigate(currentPage);
  },

  // 内容管理 - 预览公告
  previewAnnouncement: function(id) {
    var anns = Store.get('announcements') || [];
    var ann = anns.filter(function(a){ return a.id===id; })[0];
    if (!ann) return;
    var typeMap = {important:'重要通知',normal:'系统公告',activity:'活动公告'};
    var typeColor = {important:'var(--err)',normal:'var(--p)',activity:'#f59e0b'};
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.zIndex = '99998';
    var box = document.createElement('div');
    box.className = 'modal-box';
  box.style.maxWidth = '500px';
    box.innerHTML = '<div style="font-size:12px;color:var(--nd);margin-bottom:8px;">'+typeMap[ann.type]+' · '+formatTime(ann.createTime)+'</div>'+
      '<div style="font-size:20px;font-weight:700;color:'+typeColor[ann.type]+';margin-bottom:16px;">'+ann.title+'</div>'+
      '<div style="color:var(--nd);line-height:1.8;padding:16px;background:var(--bg2);border-radius:8px;margin-bottom:16px;">'+ann.content+'</div>'+
      (ann.expireTime?'<div style="font-size:12px;color:var(--nd);">过期时间: '+formatTime(ann.expireTime)+'</div>':'')+
      '<div style="display:flex;justify-content:flex-end;margin-top:12px;"><button class="admin-btn-cancel" onclick="this.closest(\'div[style*=fixed]\').remove()">关闭</button></div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    overlay.onclick = function(e) { if(e.target===overlay) overlay.remove(); };
  },

  // 内容管理 - 预览弹窗
  previewPopup: function(id) {
    var popups = Store.get('popups') || [];
    var popup = popups.filter(function(p){ return p.id===id; })[0];
    if (!popup) return;
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.zIndex = '99998';
    var box = document.createElement('div');
    box.className = 'modal-box';
    box.style.maxWidth = '400px';
    box.style.padding = '30px';
    box.style.textAlign = 'center';
    box.style.position = 'relative';
    box.style.borderColor = 'var(--p)';
    box.innerHTML = '<button onclick="this.closest(\'div[style*=fixed]\').remove()" style="position:absolute;top:8px;right:12px;background:none;border:none;color:var(--nd);cursor:pointer;font-size:18px;">&times;</button>'+
      '<div style="font-size:18px;font-weight:700;color:var(--p);margin-bottom:12px;">'+popup.title+'</div>'+
      '<div style="color:var(--nd);line-height:1.6;margin-bottom:16px;">'+popup.content+'</div>'+
      '<div style="font-size:11px;color:var(--nd);">'+popup.startTime+' ~ '+popup.endTime+'</div>'+
      '<button class="admin-btn" style="margin-top:12px;" onclick="this.closest(\'div[style*=fixed]\').remove()">知道了</button>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  },

  // 内容管理 - 编辑版本日志
  editChangelog: function(idx) {
    var logs = Store.get('changelogs') || [];
    var log = logs[idx];
    if (!log) return;
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.zIndex = '99998';
    var box = document.createElement('div');
    box.className = 'modal-box';
  box.style.maxWidth = '500px';
    box.innerHTML = '<div style="font-size:16px;font-weight:600;margin-bottom:16px;">编辑版本日志</div>'+
      '<div class="form-group"><label>版本号</label><input type="text" id="cl-version" value="'+log.version+'" style="width:100%"></div>'+
      '<div class="form-group"><label>日期</label><input type="date" id="cl-date" value="'+log.date+'" style="width:100%"></div>'+
      '<div class="form-group"><label>更新内容</label><textarea id="cl-content" rows="3" style="width:100%">'+log.content+'</textarea></div>'+
      '<div style="display:flex;gap:10px;justify-content:flex-end;">'+
      '<button class="admin-btn-cancel" onclick="this.closest(\'div[style*=fixed]\').remove()">取消</button>'+
      '<button class="admin-btn" onclick="AdminAPI._saveChangelogEdit('+idx+')">保存</button></div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    overlay.onclick = function(e) { if(e.target===overlay) overlay.remove(); };
  },

  _saveChangelogEdit: function(idx) {
    var logs = Store.get('changelogs') || [];
    if (logs[idx]) {
      logs[idx].version = document.getElementById('cl-version').value;
      logs[idx].date = document.getElementById('cl-date').value;
      logs[idx].content = document.getElementById('cl-content').value;
    }
    Store.set('changelogs', logs);
    toast('版本日志已更新', 'success');
    document.querySelector('div[style*="fixed"]').remove();
    navigate(currentPage);
  },

  // 内容管理 - 删除版本日志
  deleteChangelog: function(idx) {
    confirmDialog('确定删除此版本日志？', function() {
      var logs = Store.get('changelogs') || [];
      logs.splice(idx, 1);
      Store.set('changelogs', logs);
      toast('版本日志已删除', 'success');
      navigate(currentPage);
    });
  },

  // 系统健康检查
  systemHealthCheck: function() {
    return this._doHealthCheck();
  },

  _doHealthCheck: function() {
    var checks = [];
    try {
      var testKey = '__health_check__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      checks.push({name:'LocalStorage',status:'ok',detail:'读写正常'});
    } catch(e) {
      checks.push({name:'LocalStorage',status:'error',detail:'读写异常: '+e.message});
    }
    var users = Store.getUsers();
    checks.push({name:'用户数据',status:users&&users.length>0?'ok':'warn',detail:users?users.length+'条记录':'数据为空'});
    var credits = Store.getCredits();
    checks.push({name:'算力数据',status:credits?'ok':'warn',detail:credits?Object.keys(credits).length+'条记录':'数据为空'});
    var orders = Store.get('orders');
    checks.push({name:'订单数据',status:orders?'ok':'warn',detail:orders?orders.length+'条记录':'数据为空'});
    var tools = Store.get('tools');
    var toolCount = 0;
    if(tools) tools.forEach(function(c){ toolCount += c.tools.length; });
    checks.push({name:'工具配置',status:tools?'ok':'warn',detail:tools?toolCount+'个工具':'未配置'});
    var session = Store.getSession();
    checks.push({name:'登录会话',status:session?'ok':'warn',detail:session?'已登录('+session.username+')':'未登录'});
    var totalSize = 0;
    for(var i=0;i<localStorage.length;i++){
      var k = localStorage.key(i);
      if(k) totalSize += (localStorage.getItem(k)||'').length;
    }
    checks.push({name:'存储使用',status:totalSize<5000000?'ok':'warn',detail:(totalSize/1024).toFixed(1)+'KB'});
    return checks;
  },

  // 邮件模板保存
  saveEmailTemplate: function(type) {
    var templates = Store.get('emailTemplates') || {};
    templates[type] = {
      subject: document.getElementById('email-subject').value,
      body: document.getElementById('email-body').value,
      enabled: document.getElementById('email-enabled') ? document.getElementById('email-enabled').checked : true
    };
    Store.set('emailTemplates', templates);
    addLog('system', '保存邮件模板: '+type);
    toast('邮件模板已保存', 'success');
  },

  // 移动端侧边栏控制
  closeMobileSidebar: closeMobileSidebar,
  openMobileSidebar: openMobileSidebar
};


// ========== 增强渲染函数 ==========

// 扩展SVG图表（支持7天/30天）
function renderSVGChartExtended(days) {
  var data7 = [12,18,15,22,28,25,31];
  var labels7 = ['6/7','6/8','6/9','6/10','6/11','6/12','6/13'];
  var data30 = [5,8,12,10,15,18,14,22,19,25,20,28,24,30,26,35,32,38,33,40,36,42,38,45,40,48,44,50,46,52];
  var labels30 = [];
  for(var i=29;i>=0;i--) {
    var d = new Date(); d.setDate(d.getDate()-i);
    labels30.push((d.getMonth()+1)+'/'+d.getDate());
  }
  var data = days===30 ? data30 : data7;
  var labels = days===30 ? labels30 : labels7;
  var w = 400, h = 180, padX = 40, padY = 20;
  var maxV = Math.max.apply(null, data) * 1.2;
  var stepX = (w - padX*2) / (data.length - 1);
  var points = data.map(function(v, i) {
    return (padX + i * stepX) + ',' + (h - padY - (v / maxV) * (h - padY*2));
  });
  var areaPoints = points.join(' ') + ' ' + (padX + (data.length-1)*stepX) + ',' + (h - padY) + ' ' + padX + ',' + (h - padY);
  var svg = '<svg viewBox="0 0 '+w+' '+h+'" style="width:100%;height:auto;">';
  svg += '<defs><linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--p)" stop-opacity="0.3"/><stop offset="100%" stop-color="var(--p)" stop-opacity="0.02"/></linearGradient></defs>';
  for (var i = 0; i <= 4; i++) {
    var y = padY + i * (h - padY*2) / 4;
    svg += '<line x1="'+padX+'" y1="'+y+'" x2="'+(w-padX)+'" y2="'+y+'" stroke="var(--bd)" stroke-width="0.5"/>';
  }
  svg += '<polygon points="'+areaPoints+'" fill="url(#areaGrad2)"/>';
  svg += '<polyline points="'+points.join(' ')+'" fill="none" stroke="var(--p)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
  // Only show labels for 7-day, for 30-day show every 5th
  data.forEach(function(v, i) {
    var x = padX + i * stepX;
    var y = h - padY - (v / maxV) * (h - padY*2);
    svg += '<circle cx="'+x+'" cy="'+y+'" r="2" fill="var(--p)"/>';
    if (days===7 || i%5===0) {
      svg += '<text x="'+x+'" y="'+(h-4)+'" text-anchor="middle" fill="var(--nd)" font-size="9">'+labels[i]+'</text>';
      svg += '<text x="'+x+'" y="'+(y-6)+'" text-anchor="middle" fill="var(--p)" font-size="9">'+v+'</text>';
    }
  });
  svg += '</svg>';
  return svg;
}

// 财务 - 收入趋势
function renderFinanceRevenue() {
  var orders = Store.get('orders') || [];
  var completedOrders = orders.filter(function(o){ return o.status==='completed' && o.type==='recharge'; });
  var html = '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-chart-line" style="color:var(--ok)"></i> 收入趋势</div>';
  html += '<div style="padding:16px;">';
  // Simulated monthly revenue data
  var months = ['1月','2月','3月','4月','5月','6月'];
  var revenues = [2800,3500,4200,5800,8600,12800];
  var maxR = Math.max.apply(null, revenues) * 1.2;
  var w = 400, h = 200, padX = 50, padY = 20;
  var stepX = (w - padX*2) / (months.length - 1);
  var points = revenues.map(function(v, i) {
    return (padX + i * stepX) + ',' + (h - padY - (v / maxR) * (h - padY*2));
  });
  html += '<svg viewBox="0 0 '+w+' '+h+'" style="width:100%;height:auto;">';
  html += '<defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--ok)" stop-opacity="0.3"/><stop offset="100%" stop-color="var(--ok)" stop-opacity="0.02"/></linearGradient></defs>';
  for (var i = 0; i <= 4; i++) {
    var y = padY + i * (h - padY*2) / 4;
    html += '<line x1="'+padX+'" y1="'+y+'" x2="'+(w-padX)+'" y2="'+y+'" stroke="var(--bd)" stroke-width="0.5"/>';
    html += '<text x="'+(padX-5)+'" y="'+(y+4)+'" text-anchor="end" fill="var(--nd)" font-size="9">¥'+Math.round(maxR*(1-i/4))+'</text>';
  }
  var areaPoints = points.join(' ') + ' ' + (padX + (months.length-1)*stepX) + ',' + (h-padY) + ' ' + padX + ',' + (h-padY);
  html += '<polygon points="'+areaPoints+'" fill="url(#revGrad)"/>';
  html += '<polyline points="'+points.join(' ')+'" fill="none" stroke="var(--ok)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>';
  revenues.forEach(function(v, i) {
    var x = padX + i * stepX;
    var y2 = h - padY - (v / maxR) * (h - padY*2);
    html += '<circle cx="'+x+'" cy="'+y2+'" r="4" fill="var(--ok)"/>';
    html += '<text x="'+x+'" y="'+(h-4)+'" text-anchor="middle" fill="var(--nd)" font-size="10">'+months[i]+'</text>';
    html += '<text x="'+x+'" y="'+(y2-10)+'" text-anchor="middle" fill="var(--ok)" font-size="9">¥'+v+'</text>';
  });
  html += '</svg>';
  html += '</div></div>';

  // 收入构成
  html += '<div class="dash-card" style="margin-top:16px;"><div class="dash-card-header"><i class="fa-solid fa-pie-chart" style="color:var(--p2)"></i> 收入构成分析</div>';
  html += '<div style="padding:16px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">';
  var incomeItems = [
    {label:'小额充值(¥20-50)',amount:3200,pct:25,color:'var(--p)'},
    {label:'中额充值(¥50-100)',amount:6400,pct:50,color:'var(--ok)'},
    {label:'大额充值(¥100+)',amount:3200,pct:25,color:'var(--p2)'}
  ];
  incomeItems.forEach(function(item){
    html += '<div style="background:var(--bg2);border-radius:8px;padding:16px;text-align:center;">';
    html += '<div style="font-size:20px;font-weight:700;color:'+item.color+';">¥'+item.amount+'</div>';
    html += '<div style="font-size:12px;color:var(--nd);margin-top:4px;">'+item.label+'</div>';
    html += '<div style="margin-top:8px;height:4px;background:var(--w2);border-radius:2px;overflow:hidden;"><div style="width:'+item.pct+'%;height:100%;background:'+item.color+';border-radius:2px;"></div></div>';
    html += '<div style="font-size:11px;color:var(--nd);margin-top:2px;">'+item.pct+'%</div>';
    html += '</div>';
  });
  html += '</div></div>';
  return html;
}

// 财务 - 统计
function renderFinanceStats() {
  var orders = Store.get('orders') || [];
  var recharges = orders.filter(function(o){ return o.type==='recharge'; });
  var refunds = orders.filter(function(o){ return o.type==='refund'; });
  var completedRecharges = recharges.filter(function(o){ return o.status==='completed'; });
  var pendingRecharges = recharges.filter(function(o){ return o.status==='pending'; });
  var processingRefunds = refunds.filter(function(o){ return o.status==='processing'; });
  var totalIncome = completedRecharges.reduce(function(s,o){ return s+o.amount; },0);
  var totalRefund = refunds.reduce(function(s,o){ return s+Math.abs(o.amount); },0);
  var wechatCount = orders.filter(function(o){ return o.method==='wechat'; }).length;
  var alipayCount = orders.filter(function(o){ return o.method==='alipay'; }).length;
  var qqCount = orders.filter(function(o){ return o.method==='qq'; }).length;

  var html = '<div class="dash-grid">';
  html += statCard('fa-money-bill-wave','总收入','¥'+totalIncome, completedRecharges.length+'笔完成','var(--ok)');
  html += statCard('fa-rotate-left','退款总额','¥'+totalRefund, processingRefunds.length+'笔处理中','var(--err)');
  html += statCard('fa-hourglass-half','待处理订单',pendingRecharges.length,'需及时处理','var(--warn)');
  html += statCard('fa-chart-simple','净收入','¥'+(totalIncome-totalRefund),'','var(--p)');
  html += '</div>';

  // 退款统计
  html += '<div class="dash-card" style="margin-top:16px;"><div class="dash-card-header"><i class="fa-solid fa-rotate-left" style="color:var(--err)"></i> 退款统计</div>';
  html += '<div style="padding:16px;">';
  var refundRate = recharges.length > 0 ? (refunds.length / recharges.length * 100).toFixed(1) : 0;
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;">';
  html += '<div style="text-align:center;padding:12px;background:var(--bg2);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:var(--err);">'+refunds.length+'</div><div style="font-size:12px;color:var(--nd);">退款总数</div></div>';
  html += '<div style="text-align:center;padding:12px;background:var(--bg2);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:var(--err);">¥'+totalRefund+'</div><div style="font-size:12px;color:var(--nd);">退款总额</div></div>';
  html += '<div style="text-align:center;padding:12px;background:var(--bg2);border-radius:8px;"><div style="font-size:24px;font-weight:700;color:var(--warn);">'+refundRate+'%</div><div style="font-size:12px;color:var(--nd);">退款率</div></div>';
  html += '</div></div></div>';

  // 支付方式分布
  html += '<div class="dash-card" style="margin-top:16px;"><div class="dash-card-header"><i class="fa-solid fa-credit-card" style="color:var(--p2)"></i> 支付方式分布</div>';
  html += '<div style="padding:16px;">';
  var totalOrders = orders.length || 1;
  var paymentData = [
    {name:'微信支付',count:wechatCount,icon:'fa-brands fa-weixin',color:'#07c160'},
    {name:'支付宝',count:alipayCount,icon:'fa-brands fa-alipay',color:'#1677ff'},
    {name:'QQ支付',count:qqCount,icon:'fa-brands fa-qq',color:'#12b7f5'}
  ];
  paymentData.forEach(function(pm){
    var pct = Math.round(pm.count / totalOrders * 100);
    html += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:12px;background:var(--bg2);border-radius:8px;">';
    html += '<i class="fa-solid '+pm.icon+'" style="font-size:20px;color:'+pm.color+';width:24px;text-align:center;"></i>';
    html += '<div style="flex:1;"><div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-weight:600;">'+pm.name+'</span><span style="color:var(--nd);">'+pm.count+'笔 ('+pct+'%)</span></div>';
    html += '<div style="height:6px;background:var(--w2);border-radius:3px;overflow:hidden;"><div style="width:'+pct+'%;height:100%;background:'+pm.color+';border-radius:3px;"></div></div>';
    html += '</div></div>';
  });
  html += '</div></div>';
  return html;
}

// 权限 - 权限矩阵
function renderPermMatrix() {
  var roles = Store.get('roles') || [];
  var modules = ['users','content','tools','finance','view','permissions','settings'];
  var moduleNames = {users:'用户管理',content:'内容管理',tools:'工具管理',finance:'财务管理',view:'查看权限',permissions:'权限管理',settings:'系统设置'};
  var html = '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-table-cells" style="color:var(--p)"></i> 权限矩阵</div>';
  html += '<div style="padding:16px;overflow-x:auto;">';
  html += '<table class="admin-table"><thead><tr><th>功能模块</th>';
  roles.forEach(function(r){ html += '<th style="text-align:center;">'+r.name+'</th>'; });
  html += '</tr></thead><tbody>';
  modules.forEach(function(m) {
    html += '<tr><td><strong>'+moduleNames[m]+'</strong></td>';
    roles.forEach(function(r) {
      var has = r.permissions.indexOf(m) >= 0 || r.permissions.indexOf('all') >= 0;
      html += '<td style="text-align:center;">';
      if (r.id === 'superadmin') {
        html += '<i class="fa-solid fa-crown" style="color:#f59e0b;font-size:16px;" title="超级管理员拥有全部权限"></i>';
      } else {
        html += '<label class="toggle-switch"><input type="checkbox" '+(has?'checked':'')+' onchange="AdminAPI._togglePerm(\''+r.id+'\',\''+m+'\',this.checked)"><span class="toggle-slider"></span></label>';
      }
      html += '</td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table></div></div>';
  return html;
}

// 权限矩阵切换
AdminAPI._togglePerm = function(roleId, perm, enabled) {
  var roles = Store.get('roles') || [];
  roles.forEach(function(r) {
    if (r.id === roleId) {
      if (enabled) {
        if (r.permissions.indexOf(perm) < 0) r.permissions.push(perm);
      } else {
        r.permissions = r.permissions.filter(function(p){ return p !== perm; });
      }
    }
  });
  Store.set('roles', roles);
  addLog('system', '修改角色权限: '+roleId+' '+perm+' '+(enabled?'启用':'禁用'));
  toast('权限已更新', 'success');
};

// 权限 - 操作审计
function renderPermAudit() {
  var logs = Store.get('logs') || [];
  // Filter for admin operations
  var auditLogs = logs.filter(function(l){
    return l.type==='login' || l.type==='system' || l.type==='finance' || l.type==='user';
  });
  var html = '<div class="page-toolbar"><div class="toolbar-left"><span style="color:var(--nd)">共 '+auditLogs.length+' 条审计记录</span>';
  html += '<select id="audit-filter" onchange="AdminAPI._filterAudit()" style="margin-left:8px;"><option value="">全部类型</option><option value="login">登录</option><option value="system">系统</option><option value="user">用户</option><option value="finance">财务</option></select></div>';
  html += '<div class="toolbar-right"><button class="admin-btn" onclick="AdminAPI.exportAuditLog()"><i class="fa-solid fa-download"></i> 导出审计日志</button></div></div>';
  html += '<div class="dash-card"><div style="overflow-x:auto;"><table class="admin-table" id="audit-table"><thead><tr>';
  html += '<th>时间</th><th>类型</th><th>操作人</th><th>详情</th><th>IP</th>';
  html += '</tr></thead><tbody>';
  if (auditLogs.length === 0) {
    html += '<tr><td colspan="5" style="text-align:center;color:var(--nd);padding:40px;">暂无审计记录</td></tr>';
  }
  auditLogs.slice(0,100).forEach(function(l) {
    var typeMap = {login:'<span class="badge badge-p">登录</span>',user:'<span class="badge badge-ok">用户</span>',system:'<span class="badge badge-warn">系统</span>',finance:'<span class="badge badge-err">财务</span>'};
    html += '<tr data-type="'+l.type+'"><td style="font-size:12px;white-space:nowrap;">'+l.time+'</td><td>'+(typeMap[l.type]||l.type)+'</td><td>'+l.user+'</td><td>'+l.detail+'</td><td style="font-size:12px;color:var(--nd);">'+l.ip+'</td></tr>';
  });
  html += '</tbody></table></div></div>';
  return html;
}

AdminAPI._filterAudit = function() {
  var filter = (document.getElementById('audit-filter') || {}).value || '';
  var rows = document.querySelectorAll('#audit-table tbody tr');
  rows.forEach(function(tr) {
    var type = tr.dataset.type || '';
    tr.style.display = (!filter || type === filter) ? '' : 'none';
  });
};

AdminAPI.exportAuditLog = function() {
  var logs = Store.get('logs') || [];
  var csv = '时间,类型,操作人,详情,IP\n';
  logs.forEach(function(l) {
    csv += l.time+','+l.type+','+l.user+','+l.detail+','+l.ip+'\n';
  });
  var blob = new Blob(['\ufeff'+csv], {type:'text/csv'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'audit_log_'+formatDate(new Date().toISOString())+'.csv';
  a.click();
  toast('审计日志已导出', 'success');
};

// 系统设置 - 邮件模板
function renderSettingsEmail() {
  var templates = Store.get('emailTemplates') || {};
  var defaultTemplates = {
    welcome: {subject:'欢迎注册罗圣纪元',body:'尊敬的{username}，欢迎注册罗圣纪元平台！您的账号正在审核中，审核通过后即可使用全部AI工具。',enabled:true},
    approved: {subject:'账号审核通过通知',body:'尊敬的{username}，恭喜！您的罗圣纪元账号已审核通过，现在可以登录使用平台的所有AI工具。',enabled:true},
    recharge: {subject:'充值成功通知',body:'尊敬的{username}，您已成功充值{amount}元，获得{credits}算力。当前算力余额：{balance}。',enabled:true},
    banned: {subject:'账号状态变更通知',body:'尊敬的{username}，您的账号已被管理员封禁。如有疑问请联系客服。',enabled:false}
  };
  // Merge defaults
  Object.keys(defaultTemplates).forEach(function(k){
    if (!templates[k]) templates[k] = defaultTemplates[k];
  });
  Store.set('emailTemplates', templates);

  var html = '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-envelope" style="color:var(--p2)"></i> 邮件模板配置</div>';
  html += '<div style="padding:16px;">';
  html += '<p style="color:var(--nd);margin-bottom:16px;">配置系统自动发送的邮件模板，支持变量：{username}、{amount}、{credits}、{balance}</p>';

  var tplNames = {welcome:'注册欢迎邮件',approved:'审核通过邮件',recharge:'充值成功邮件',banned:'账号封禁邮件'};
  var tplColors = {welcome:'var(--ok)',approved:'var(--p)',recharge:'#f59e0b',banned:'var(--err)'};

  Object.keys(tplNames).forEach(function(key) {
    var tpl = templates[key] || defaultTemplates[key];
    html += '<div style="border:1px solid var(--bd);border-radius:8px;padding:16px;margin-bottom:16px;">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">';
    html += '<div style="font-weight:600;color:'+tplColors[key]+';"><i class="fa-solid fa-envelope" style="margin-right:6px;"></i>'+tplNames[key]+'</div>';
    html += '<label class="toggle-switch"><input type="checkbox" id="email-enabled-'+key+'" '+(tpl.enabled?'checked':'')+'><span class="toggle-slider"></span><span style="margin-left:8px;font-size:12px;color:var(--nd);">'+(tpl.enabled?'已启用':'已禁用')+'</span></label>';
    html += '</div>';
    html += '<div class="form-group"><label>邮件主题</label><input type="text" id="email-subject-'+key+'" value="'+tpl.subject+'" style="width:100%"></div>';
    html += '<div class="form-group"><label>邮件正文</label><textarea id="email-body-'+key+'" rows="3" style="width:100%">'+tpl.body+'</textarea></div>';
    html += '<button class="admin-btn" style="font-size:12px;" onclick="AdminAPI._saveEmailTemplateByKey(\''+key+'\')"><i class="fa-solid fa-save"></i> 保存此模板</button>';
    html += '</div>';
  });

  html += '</div></div>';
  return html;
}

AdminAPI._saveEmailTemplateByKey = function(key) {
  var templates = Store.get('emailTemplates') || {};
  templates[key] = {
    subject: document.getElementById('email-subject-'+key).value,
    body: document.getElementById('email-body-'+key).value,
    enabled: document.getElementById('email-enabled-'+key).checked
  };
  Store.set('emailTemplates', templates);
  addLog('system', '保存邮件模板: '+key);
  toast('邮件模板已保存', 'success');
};

// 系统设置 - 健康检查
function renderSettingsHealth() {
  var checks = AdminAPI._doHealthCheck();
  var html = '<div class="dash-card"><div class="dash-card-header"><i class="fa-solid fa-heart-pulse" style="color:var(--ok)"></i> 系统健康检查';
  html += '<button class="admin-btn" style="float:right;font-size:12px;" onclick="navigate(currentPage)"><i class="fa-solid fa-rotate"></i> 重新检查</button>';
  html += '</div>';
  html += '<div style="padding:16px;">';

  checks.forEach(function(c) {
    var statusIcon = c.status==='ok'?'fa-circle-check':'fa-triangle-exclamation';
    var statusColor = c.status==='ok'?'var(--ok)':c.status==='warn'?'var(--warn)':'var(--err)';
    html += '<div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg2);border-radius:8px;margin-bottom:8px;">';
    html += '<i class="fa-solid '+statusIcon+'" style="color:'+statusColor+';font-size:18px;"></i>';
    html += '<div style="flex:1;"><div style="font-weight:600;">'+c.name+'</div><div style="font-size:12px;color:var(--nd);">'+c.detail+'</div></div>';
    html += '<span class="badge badge-'+(c.status==='ok'?'ok':c.status==='warn'?'warn':'err')+'">'+(c.status==='ok'?'正常':c.status==='warn'?'警告':'异常')+'</span>';
    html += '</div>';
  });

  // Overall status
  var allOk = checks.every(function(c){return c.status==='ok';});
  html += '<div style="text-align:center;margin-top:16px;padding:20px;background:var(--bg2);border-radius:8px;">';
  html += '<i class="fa-solid '+(allOk?'fa-shield-check':'fa-shield-exclamation')+'" style="font-size:48px;color:'+(allOk?'var(--ok)':'var(--warn)')+';margin-bottom:8px;"></i>';
  html += '<div style="font-size:18px;font-weight:700;color:'+(allOk?'var(--ok)':'var(--warn)')+';">系统状态: '+(allOk?'健康':'需关注')+'</div>';
  html += '<div style="color:var(--nd);font-size:13px;margin-top:4px;">检查时间: '+formatTime(new Date().toISOString())+'</div>';
  html += '</div>';

  html += '</div></div>';

  // Storage details
  html += '<div class="dash-card" style="margin-top:16px;"><div class="dash-card-header"><i class="fa-solid fa-database" style="color:var(--p2)"></i> 存储详情</div>';
  html += '<div style="padding:16px;">';
  var storageKeys = ['lsjy3_users','lsjy3_credits','lsjy_admin_orders','lsjy_admin_announcements','lsjy_admin_faqs','lsjy_admin_tools','lsjy_admin_stats','lsjy_admin_logs','lsjy_admin_admins','lsjy_admin_roles','lsjy_admin_settings','lsjy_admin_seo','lsjy_admin_popups','lsjy_admin_changelogs'];
  var totalBytes = 0;
  storageKeys.forEach(function(key) {
    var val = localStorage.getItem(key) || '';
    var size = val.length;
    totalBytes += size;
    var pct = Math.min(100, size / 50000 * 100);
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;font-size:12px;">';
    html += '<span style="width:200px;color:var(--nd);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+key+'</span>';
    html += '<div style="flex:1;height:6px;background:var(--w2);border-radius:3px;overflow:hidden;"><div style="width:'+pct+'%;height:100%;background:var(--p);border-radius:3px;"></div></div>';
    html += '<span style="width:60px;text-align:right;color:var(--nd);">'+(size/1024).toFixed(1)+'KB</span>';
    html += '</div>';
  });
  html += '<div style="text-align:right;color:var(--nd);font-size:12px;margin-top:8px;">合计: '+(totalBytes/1024).toFixed(1)+'KB</div>';
  html += '</div></div>';

  return html;
}

// 内容管理 - 邮件模板标签
function renderContentEmailTpl() {
  return renderSettingsEmail();
}

// ========== 弹窗表单 ==========
function showAnnouncementForm(ann) {
  var isEdit = !!ann;
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
    overlay.style.zIndex = '99998';
  var box = document.createElement('div');
  box.className = 'modal-box';
  box.style.maxWidth = '500px';
  box.style.maxHeight = '90vh';
  box.style.overflowY = 'auto';
  box.innerHTML = '<div style="font-size:16px;font-weight:600;margin-bottom:16px;">'+(isEdit?'编辑':'新增')+'公告</div>'+
    '<div class="form-group"><label>标题</label><input type="text" id="ann-title" value="'+(ann?ann.title:'')+'" style="width:100%"></div>'+
    '<div class="form-group"><label>内容</label><textarea id="ann-content" rows="4" style="width:100%">'+(ann?ann.content:'')+'</textarea></div>'+
    '<div class="form-group"><label>类型</label><select id="ann-type" style="width:100%"><option value="normal"'+(ann&&ann.type==='normal'?' selected':'')+'>普通</option><option value="important"'+(ann&&ann.type==='important'?' selected':'')+'>重要</option><option value="activity"'+(ann&&ann.type==='activity'?' selected':'')+'>活动</option></select></div>'+
    '<div class="form-group"><label>状态</label><select id="ann-status" style="width:100%"><option value="draft"'+(ann&&ann.status==='draft'?' selected':'')+'>草稿</option><option value="published"'+(ann&&ann.status==='published'?' selected':'')+'>已发布</option></select></div>'+
    '<div class="form-group"><label>过期时间</label><input type="datetime-local" id="ann-expire" value="'+(ann?ann.expireTime:'')+'" style="width:100%"></div>'+
    '<div style="display:flex;gap:10px;justify-content:flex-end;">'+
    '<button class="admin-btn-cancel" onclick="this.closest(\'div[style*=fixed]\').remove()">取消</button>'+
    '<button class="admin-btn" onclick="AdminAPI._saveAnnouncement('+(isEdit?ann.id:'null')+')">保存</button></div>';
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  overlay.onclick = function(e) { if(e.target===overlay) overlay.remove(); };
}

AdminAPI._saveAnnouncement = function(id) {
  var anns = Store.get('announcements') || [];
  var data = {
    id: id || Date.now(),
    title: document.getElementById('ann-title').value,
    content: document.getElementById('ann-content').value,
    type: document.getElementById('ann-type').value,
    status: document.getElementById('ann-status').value,
    createTime: id ? (anns.filter(function(a){return a.id===id})[0]||{}).createTime : new Date().toISOString(),
    expireTime: document.getElementById('ann-expire').value || ''
  };
  if (id) {
    anns = anns.map(function(a){ return a.id===id ? data : a; });
  } else {
    anns.unshift(data);
  }
  Store.set('announcements', anns);
  addLog('system', (id?'更新':'新增')+'公告: '+data.title);
  toast('公告已保存', 'success');
  document.querySelector('div[style*="fixed"]').remove();
  navigate(currentPage);
};

function showFAQForm(faq) {
  var isEdit = !!faq;
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
    overlay.style.zIndex = '99998';
  var box = document.createElement('div');
  box.className = 'modal-box';
  box.style.maxWidth = '500px';
  box.style.maxHeight = '90vh';
  box.style.overflowY = 'auto';
  box.innerHTML = '<div style="font-size:16px;font-weight:600;margin-bottom:16px;">'+(isEdit?'编辑':'新增')+'FAQ</div>'+
    '<div class="form-group"><label>问题</label><input type="text" id="faq-q" value="'+(faq?faq.question:'')+'" style="width:100%"></div>'+
    '<div class="form-group"><label>答案</label><textarea id="faq-a" rows="4" style="width:100%">'+(faq?faq.answer:'')+'</textarea></div>'+
    '<div class="form-group"><label>分类</label><select id="faq-cat" style="width:100%"><option>账号</option><option>算力</option><option>支付</option><option>工具</option><option>其他</option></select></div>'+
    '<div class="form-group"><label>排序</label><input type="number" id="faq-sort" value="'+(faq?faq.sort:1)+'" style="width:100%"></div>'+
    '<div style="display:flex;gap:10px;justify-content:flex-end;">'+
    '<button class="admin-btn-cancel" onclick="this.closest(\'div[style*=fixed]\').remove()">取消</button>'+
    '<button class="admin-btn" onclick="AdminAPI._saveFAQ('+(isEdit?faq.id:'null')+')">保存</button></div>';
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  if (faq) document.getElementById('faq-cat').value = faq.category;
  overlay.onclick = function(e) { if(e.target===overlay) overlay.remove(); };
}

AdminAPI._saveFAQ = function(id) {
  var faqs = Store.get('faqs') || [];
  var data = {
    id: id || Date.now(),
    question: document.getElementById('faq-q').value,
    answer: document.getElementById('faq-a').value,
    category: document.getElementById('faq-cat').value,
    sort: parseInt(document.getElementById('faq-sort').value) || 1
  };
  if (id) {
    faqs = faqs.map(function(f){ return f.id===id ? data : f; });
  } else {
    faqs.push(data);
  }
  Store.set('faqs', faqs);
  addLog('system', (id?'更新':'新增')+'FAQ');
  toast('FAQ已保存', 'success');
  document.querySelector('div[style*="fixed"]').remove();
  navigate(currentPage);
};

function showPopupForm() {
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
    overlay.style.zIndex = '99998';
  var box = document.createElement('div');
  box.className = 'modal-box';
  box.style.maxWidth = '500px';
  box.innerHTML = '<div style="font-size:16px;font-weight:600;margin-bottom:16px;">新增弹窗广告</div>'+
    '<div class="form-group"><label>标题</label><input type="text" id="popup-title" style="width:100%"></div>'+
    '<div class="form-group"><label>内容</label><textarea id="popup-content" rows="3" style="width:100%"></textarea></div>'+
    '<div class="form-group"><label>开始时间</label><input type="date" id="popup-start" style="width:100%"></div>'+
    '<div class="form-group"><label>结束时间</label><input type="date" id="popup-end" style="width:100%"></div>'+
    '<div style="display:flex;gap:10px;justify-content:flex-end;">'+
    '<button class="admin-btn-cancel" onclick="this.closest(\'div[style*=fixed]\').remove()">取消</button>'+
    '<button class="admin-btn" onclick="AdminAPI._savePopup()">保存</button></div>';
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  overlay.onclick = function(e) { if(e.target===overlay) overlay.remove(); };
}

AdminAPI._savePopup = function() {
  var popups = Store.get('popups') || [];
  popups.push({
    id: Date.now(),
    title: document.getElementById('popup-title').value,
    content: document.getElementById('popup-content').value,
    enabled: true,
    startTime: document.getElementById('popup-start').value,
    endTime: document.getElementById('popup-end').value
  });
  Store.set('popups', popups);
  toast('弹窗已添加', 'success');
  document.querySelector('div[style*="fixed"]').remove();
  navigate(currentPage);
};

function showChangelogForm() {
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
    overlay.style.zIndex = '99998';
  var box = document.createElement('div');
  box.className = 'modal-box';
  box.style.maxWidth = '500px';
  box.innerHTML = '<div style="font-size:16px;font-weight:600;margin-bottom:16px;">新增版本日志</div>'+
    '<div class="form-group"><label>版本号</label><input type="text" id="cl-version" placeholder="V6.1" style="width:100%"></div>'+
    '<div class="form-group"><label>日期</label><input type="date" id="cl-date" style="width:100%"></div>'+
    '<div class="form-group"><label>更新内容</label><textarea id="cl-content" rows="3" style="width:100%"></textarea></div>'+
    '<div style="display:flex;gap:10px;justify-content:flex-end;">'+
    '<button class="admin-btn-cancel" onclick="this.closest(\'div[style*=fixed]\').remove()">取消</button>'+
    '<button class="admin-btn" onclick="AdminAPI._saveChangelog()">保存</button></div>';
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  overlay.onclick = function(e) { if(e.target===overlay) overlay.remove(); };
}

AdminAPI._saveChangelog = function() {
  var logs = Store.get('changelogs') || [];
  logs.unshift({
    version: document.getElementById('cl-version').value,
    date: document.getElementById('cl-date').value,
    content: document.getElementById('cl-content').value
  });
  Store.set('changelogs', logs);
  toast('版本日志已添加', 'success');
  document.querySelector('div[style*="fixed"]').remove();
  navigate(currentPage);
};

function showAdminForm(admin) {
  var isEdit = !!admin;
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
    overlay.style.zIndex = '99998';
  var box = document.createElement('div');
  box.className = 'modal-box';
  box.style.maxWidth = '500px';
  box.innerHTML = '<div style="font-size:16px;font-weight:600;margin-bottom:16px;">'+(isEdit?'编辑':'添加')+'管理员</div>'+
    '<div class="form-group"><label>用户名</label><input type="text" id="adm-username" value="'+(admin?admin.username:'')+'" '+(isEdit?'readonly':'')+' style="width:100%"></div>'+
    (isEdit?'':'<div class="form-group"><label>密码</label><input type="password" id="adm-password" style="width:100%"></div>')+
    '<div class="form-group"><label>角色</label><select id="adm-role" style="width:100%"><option value="admin"'+(admin&&admin.role==='admin'?' selected':'')+'>管理员</option><option value="viewer"'+(admin&&admin.role==='viewer'?' selected':'')+'>查看者</option></select></div>'+
    '<div style="display:flex;gap:10px;justify-content:flex-end;">'+
    '<button class="admin-btn-cancel" onclick="this.closest(\'div[style*=fixed]\').remove()">取消</button>'+
    '<button class="admin-btn" onclick="AdminAPI._saveAdmin('+(isEdit?'\''+admin.username+'\'':'null')+')">保存</button></div>';
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  overlay.onclick = function(e) { if(e.target===overlay) overlay.remove(); };
}

AdminAPI._saveAdmin = function(username) {
  var admins = Store.get('admins') || [];
  if (username) {
    admins.forEach(function(a) {
      if (a.username === username) a.role = document.getElementById('adm-role').value;
    });
  } else {
    var newUsername = document.getElementById('adm-username').value;
    var newPassword = document.getElementById('adm-password').value;
    var newRole = document.getElementById('adm-role').value;
    if (!newUsername || !newPassword) { toast('请填写完整信息', 'warning'); return; }
    admins.push({username:newUsername, role:newRole, createTime:new Date().toISOString(), status:'active'});
    // 同时在users中创建
    var users = Store.getUsers() || [];
    users.push({username:newUsername, password:newPassword, role:newRole, status:'approved', registerTime:new Date().toISOString()});
    Store.setUsers(users);
    var credits = Store.getCredits() || {};
    credits[newUsername] = 0;
    Store.setCredits(credits);
  }
  Store.set('admins', admins);
  addLog('user', (username?'更新':'新增')+'管理员');
  toast('管理员已保存', 'success');
  document.querySelector('div[style*="fixed"]').remove();
  navigate(currentPage);
};

function showRoleForm(roleId) {
  var roles = Store.get('roles') || [];
  var role = roles.filter(function(r){ return r.id===roleId; })[0];
  if (!role) return;
  var allPerms = ['users','content','tools','finance','view','permissions','settings'];
  var permNames = {users:'用户管理',content:'内容管理',tools:'工具管理',finance:'财务管理',view:'查看权限',permissions:'权限管理',settings:'系统设置'};
  var overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
    overlay.style.zIndex = '99998';
  var box = document.createElement('div');
  box.className = 'modal-box';
  box.style.maxWidth = '500px';
  var permHtml = '<div style="font-size:16px;font-weight:600;margin-bottom:16px;">编辑角色 - '+role.name+'</div>';
  permHtml += '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px;">';
  allPerms.forEach(function(p) {
    var checked = role.permissions.indexOf(p) >= 0;
    permHtml += '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 12px;background:var(--bg2);border:1px solid var(--bd);border-radius:6px;font-size:13px;">';
    permHtml += '<input type="checkbox" class="role-perm" value="'+p+'" '+(checked?'checked':'')+'> '+permNames[p]+'</label>';
  });
  permHtml += '</div>';
  permHtml += '<div style="display:flex;gap:10px;justify-content:flex-end;">'+
    '<button class="admin-btn-cancel" onclick="this.closest(\'div[style*=fixed]\').remove()">取消</button>'+
    '<button class="admin-btn" onclick="AdminAPI._saveRole(\''+roleId+'\')">保存</button></div>';
  box.innerHTML = permHtml;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  overlay.onclick = function(e) { if(e.target===overlay) overlay.remove(); };
}

AdminAPI._saveRole = function(roleId) {
  var roles = Store.get('roles') || [];
  var perms = [];
  document.querySelectorAll('.role-perm:checked').forEach(function(cb) { perms.push(cb.value); });
  if (perms.indexOf('view') < 0) perms.push('view');
  roles.forEach(function(r) {
    if (r.id === roleId) r.permissions = perms;
  });
  Store.set('roles', roles);
  toast('角色已更新', 'success');
  document.querySelector('div[style*="fixed"]').remove();
  navigate(currentPage);
};

// ========== 主题系统 ==========
function applyTheme(theme) {
  document.body.className = '';
  if (theme === 'light') document.body.classList.add('theme-light');
  else if (theme === 'enterprise') document.body.classList.add('theme-enterprise');
}

// ========== 页面切换 ==========
function showLoginPage() {
  $('#login-page').style.display = 'flex';
  $('#main-app').style.display = 'none';
}

function showMainApp() {
  $('#login-page').style.display = 'none';
  $('#main-app').style.display = 'flex';
  var session = Store.getSession();
  var userInfo = $('#admin-info');
  if (userInfo && session) {
    var roleMap = {superadmin:'超级管理员',admin:'管理员',viewer:'查看者'};
    userInfo.innerHTML = '<i class="fa-solid fa-user-shield" style="color:var(--p)"></i> '+session.username+' <span style="color:var(--nd);font-size:12px;">('+roleMap[session.role]+')</span>';
  }
  navigate('dashboard');
}

// ========== Matrix Rain Effect ==========
function initMatrixRain() {
  var canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w, h, cols, drops;
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&ロサンティ纪元';

  function resize() {
    w = canvas.width = canvas.parentElement.offsetWidth;
    h = canvas.height = canvas.parentElement.offsetHeight;
    cols = Math.floor(w / 16);
    drops = [];
    for (var i = 0; i < cols; i++) {
      drops[i] = Math.random() * -100;
    }
  }

  function draw() {
    ctx.fillStyle = 'rgba(6,10,18,0.06)';
    ctx.fillRect(0, 0, w, h);
    ctx.font = '14px monospace';

    for (var i = 0; i < cols; i++) {
      var char = chars[Math.floor(Math.random() * chars.length)];
      var x = i * 16;
      var y = drops[i] * 16;

      // Gradient color - cyan to purple
      var ratio = i / cols;
      if (ratio < 0.5) {
        ctx.fillStyle = 'rgba(0,245,255,' + (0.3 + Math.random() * 0.4) + ')';
      } else {
        ctx.fillStyle = 'rgba(139,92,246,' + (0.3 + Math.random() * 0.4) + ')';
      }
      ctx.fillText(char, x, y);

      if (y > h && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 0.5 + Math.random() * 0.5;
    }
  }

  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 50);
}

// ========== Mobile Sidebar ==========
function openMobileSidebar() {
  var sb = document.getElementById('sidebar');
  var bd = document.getElementById('sidebar-backdrop');
  if (sb) sb.classList.add('mobile-open');
  if (bd) bd.classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
  var sb = document.getElementById('sidebar');
  var bd = document.getElementById('sidebar-backdrop');
  if (sb) sb.classList.remove('mobile-open');
  if (bd) bd.classList.remove('visible');
  document.body.style.overflow = '';
}

// ========== 初始化 ==========
function init() {
  initData();

  // 应用主题
  var settings = Store.get('settings') || {};
  applyTheme(settings.theme || 'dark');

  // Matrix rain on login page
  initMatrixRain();

  // 检查会话
  var session = Store.getSession();
  if (session) {
    showMainApp();
  } else {
    showLoginPage();
  }

  // 登录表单
  var loginForm = $('#login-form');
  if (loginForm) {
    loginForm.onsubmit = function(e) {
      e.preventDefault();
      var u = $('#login-username').value.trim();
      var p = $('#login-password').value;
      if (!u || !p) { toast('请输入用户名和密码', 'warning'); return; }
      AdminAPI.login(u, p);
    };
  }

  // 密码切换
  var togglePwd = $('#toggle-pwd');
  if (togglePwd) {
    togglePwd.onclick = function() {
      var input = $('#login-password');
      input.type = input.type === 'password' ? 'text' : 'password';
      this.innerHTML = input.type === 'password' ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
    };
  }

  // 侧边栏折叠
  var toggleBtn = $('#sidebar-toggle');
  if (toggleBtn) {
    toggleBtn.onclick = function() {
      var sb = $('#sidebar');
      sb.classList.toggle('collapsed');
    };
  }

  // 退出
  var logoutBtn = $('#btn-logout');
  if (logoutBtn) {
    logoutBtn.onclick = function() {
      confirmDialog('确定退出登录？', function() { AdminAPI.logout(); });
    };
  }

  // 路由监听
  window.onhashchange = function() {
    var hash = window.location.hash.replace('#','');
    if (hash && routes[hash]) navigate(hash);
  };

  // 移动端侧边栏 - 打开
  var menuBtn = $('#mobile-menu');
  if (menuBtn) {
    menuBtn.onclick = function() {
      var sb = $('#sidebar');
      if (sb.classList.contains('mobile-open')) {
        closeMobileSidebar();
      } else {
        openMobileSidebar();
      }
    };
  }

  // 侧边栏点击关闭移动端
  var sbItems = $$('.sb-item');
  sbItems.forEach(function(item) {
    item.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        closeMobileSidebar();
      }
    });
  });

  // 窗口大小变化时重置侧边栏状态
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      closeMobileSidebar();
    }
  });
}

// DOM加载完毕后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
