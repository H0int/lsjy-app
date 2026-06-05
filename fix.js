// lsjy-app comprehensive fix v4
(function(){
// === 1. Credits fix ===
var r=localStorage.getItem('lsjy3_credits');var c;try{c=JSON.parse(r)}catch(e){c=null}
if(typeof c!=='object'||c===null){c={'KF02V9':10000};try{var u=JSON.parse(localStorage.getItem('lsjy3_users')||'[]');for(var i=0;i<u.length;i++){if(!c[u[i].username])c[u[i].username]=100}}catch(e){}localStorage.setItem('lsjy3_credits',JSON.stringify(c))}
else{if(!c['KF02V9']){c['KF02V9']=10000;localStorage.setItem('lsjy3_credits',JSON.stringify(c))}}
window.getCredits=function(){try{var d=JSON.parse(localStorage.getItem('lsjy3_credits'));if(typeof d==='object'&&d!==null)return d}catch(e){}return{}};
window.getUserCredits=function(){var u=window.getCur?window.getCur():null;if(!u)return 0;return(window.getCredits())[u.username]||0};
window.updateCreditsUI=function(){var el=document.getElementById('creditDisplay');if(el)el.textContent=window.getUserCredits()};

// === 2. Pet tool configs (injected early) ===
var _PET={
symptomCheck:{name:'症状自查',prompt:'你是一位经验丰富的宠物兽医。根据用户描述的症状分析：1)可能疾病 2)严重程度(🟢/🟡/🔴) 3)是否就医 4)家庭护理 5)预防措施。表格形式，结尾声明仅供参考。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠','🐦 鸟类','🐢 龟类']},{id:'breed',label:'品种',type:'text',placeholder:'如：金毛、英短'},{id:'age_weight',label:'年龄/体重',type:'text',placeholder:'如：2岁/15kg'},{id:'symptom',label:'📋 症状描述',type:'textarea',placeholder:'详细描述症状：何时开始、频率、严重程度'},{id:'duration',label:'⏱ 持续时间',type:'select',options:['今天刚出现','2-3天','一周左右','超过一周','反复出现']}]}
,dietPlan:{name:'饮食方案',prompt:'你是宠物营养师。制定饮食方案：1)每日喂食量和频率 2)推荐食材/主粮 3)营养配比 4)禁忌食物 5)零食补充剂 6)年龄段调整。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠']},{id:'breed',label:'品种',type:'text',placeholder:'如：泰迪、柯基'},{id:'age',label:'📅 年龄阶段',type:'select',options:['幼年(0-6月)','青少年(6-12月)','成年(1-7岁)','中老年(7+)','孕期/哺乳期']},{id:'weight',label:'⚖️ 体重',type:'text',placeholder:'当前体重(kg)'},{id:'goal',label:'🎯 目标',type:'select',options:['日常维持','增重增肌','减肥瘦身','毛发养护','肠胃调理','过敏饮食']},{id:'current_food',label:'🍽 当前食用',type:'text',placeholder:'目前喂的粮'}]}
,vaccineSchedule:{name:'疫苗计划',prompt:'你是疫苗接种专家。生成疫苗时间表：1)核心疫苗 2)非核心疫苗 3)接种注意事项 4)抗体检测 5)费用参考。时间轴表格。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子']},{id:'breed',label:'品种',type:'text',placeholder:'品种名称'},{id:'age',label:'📅 当前年龄',type:'select',options:['未满1月','1-2月','2-4月','4-6月','6月-1岁','1岁以上']},{id:'vaccinated',label:'💉 已打疫苗',type:'textarea',placeholder:'已打过哪些？大概时间？'},{id:'location',label:'📍 地区',type:'text',placeholder:'如：湖南祁阳'}]}
,groomingGuide:{name:'美容指南',prompt:'你是资深宠物美容师。提供教程：1)毛发分析 2)洗澡频率和产品 3)梳毛技巧 4)修剪造型 5)耳朵/眼睛/牙齿/指甲护理 6)季节护理。步骤编号。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子']},{id:'breed',label:'品种',type:'text',placeholder:'如：比熊、萨摩耶'},{id:'hair_type',label:'✂️ 毛发类型',type:'select',options:['短毛','中长毛','长毛','卷毛','双层毛','无毛']},{id:'skin',label:'🩺 皮肤',type:'select',options:['正常','容易掉毛','过敏','皮屑','油性']},{id:'goal',label:'🎯 目标',type:'select',options:['日常基础','深度清洁','造型修剪','换毛期','比赛级']}]}
,trainingPlan:{name:'训练方案',prompt:'你是认证宠物训练师。制定训练计划：1)能力评估 2)目标分解 3)周训练日程 4)训练步骤指令 5)正向强化方法 6)问题纠正 7)注意事项。周计划表格。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠']},{id:'breed',label:'品种',type:'text',placeholder:'品种名称'},{id:'age',label:'📅 月龄',type:'text',placeholder:'月龄'},{id:'trained',label:'✅ 已掌握',type:'textarea',placeholder:'已学会什么？'},{id:'problems',label:'❌ 待解决',type:'textarea',placeholder:'想解决什么？'},{id:'goal',label:'🎯 目标',type:'select',options:['基础服从','社会化','技能表演','行为纠正','工作犬']}]}
,petNameGen:{name:'宠物取名',prompt:'你是创意命名师。生成名字：1)按风格分类(可爱/霸气/文艺/食物/英文名) 2)附寓意 3)2-4字 4)考虑品种毛色 5)8-10个推荐。emoji+名字+寓意。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 公狗','🐶 母狗','🐱 公猫','🐱 母猫','🐰 兔子','🐹 仓鼠']},{id:'breed',label:'品种',type:'text',placeholder:'如：柯基、布偶'},{id:'color',label:'🎨 毛色',type:'select',options:['白色','黑色','棕色','金色','灰色','花色','橘色','蓝灰']},{id:'personality',label:'😄 性格',type:'select',options:['活泼','安静','高冷','粘人','聪明','憨厚','调皮']},{id:'style',label:'💡 风格',type:'select',options:['都要','可爱萌系','霸气酷炫','文艺清新','食物系','英文名','古风','搞笑']}]}
,breedIntro:{name:'品种介绍',prompt:'你是宠物百科专家。品种介绍：1)起源历史 2)外观特征 3)性格 4)常见遗传病 5)适合人群 6)饲养难度费用 7)品种对比。配emoji。',fields:[{id:'breed',label:'🔍 品种',type:'text',placeholder:'如：金毛寻回犬、布偶猫'},{id:'focus',label:'📌 重点',type:'select',options:['全面介绍','性格训练','健康护理','适合养吗','购买指南','费用']}]}
,healthTips:{name:'健康贴士',prompt:'你是宠物健康管理顾问。季节健康提醒：1)当季常见病 2)饮食调整 3)运动注意 4)环境卫生 5)心理健康 6)体检疫苗 7)紧急应对。温馨语气适合朋友圈。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠','🐦 鸟类','🐢 爬行类']},{id:'season',label:'🌸 季节',type:'select',options:['🌸 春季','☀️ 夏季','🍂 秋季','❄️ 冬季']},{id:'region',label:'📍 气候',type:'select',options:['北方干燥','南方潮湿','中部四季','沿海','高原']},{id:'indoor',label:'🏠 环境',type:'select',options:['室内','室外','半室内外','散养']}]}
,emergencyGuide:{name:'急救指南',prompt:'你是宠物急诊兽医。急救指南：1)紧急度(🔴立即/🟡尽快/🟢自行) 2)急救步骤 3)急救物品 4)就医准备 5)绝对不能做 6)送医注意 7)预后。醒目emoji标注。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠']},{id:'emergency',label:'🚨 紧急情况',type:'select',options:['🤕 外伤出血','🤮 误食中毒','🫁 呼吸困难','🔥 中暑','⚡ 触电','🦴 骨折','🐍 蛇虫咬','溺水','晕厥','抽搐','严重腹泻呕吐','其他']},{id:'detail',label:'📋 具体情况',type:'textarea',placeholder:'何时发生、当前状态'}]}
,parasiteCheck:{name:'驱虫方案',prompt:'你是寄生虫防治专家。驱虫方案：1)常见寄生虫 2)体内驱虫方案 3)体外驱虫方案 4)环境消毒 5)时间表 6)注意事项 7)多宠策略。表格形式。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子']},{id:'age',label:'📅 年龄',type:'select',options:['幼崽(0-3月)','幼年(3-6月)','成年(6月+)','老年']},{id:'weight',label:'⚖️ 体重',type:'text',placeholder:'kg'},{id:'indoor',label:'🏠 环境',type:'select',options:['纯室内','经常外出','有院子','散养']},{id:'last_deworm',label:'💊 上次驱虫',type:'text',placeholder:'时间和药物'},{id:'symptoms',label:'🔍 异常',type:'select',options:['无异常','跳蚤','便便有虫','频繁挠痒','皮肤红点','肛门虫体']}]}
,petAdCopy:{name:'宠物广告',prompt:'你是宠物营销专家。广告文案：1)爆款标题5个 2)卖点3-5个 3)朋友圈短文案 4)详情页长文案 5)痛点挖掘 6)促销话术。真实接地气。',fields:[{id:'product',label:'📦 产品名',type:'text',placeholder:'如：皇家猫粮、冻干'},{id:'category',label:'🏷️ 类目',type:'select',options:['主食粮','零食冻干','保健品','驱虫药','猫砂','玩具','洗护','智能设备']},{id:'target',label:'👤 人群',type:'select',options:['新手铲屎官','资深养宠人','多宠家庭','精致养宠','性价比']},{id:'feature',label:'💡 卖点',type:'textarea',placeholder:'差异化优势'},{id:'price',label:'💰 价格',type:'text',placeholder:'如：99-199元'}]}
,petstorePlan:{name:'门店方案',prompt:'你是宠物店运营顾问。门店运营方案：1)定位 2)商品结构 3)会员体系 4)引流方案 5)员工培训 6)营销日历 7)盈利模型 8)竞品策略。商业计划书格式。',fields:[{id:'store_type',label:'🏪 类型',type:'select',options:['综合宠物店','猫咪专营','狗狗美容','宠物医院','宠物寄养','水族馆','异宠专营']},{id:'city',label:'📍 城市',type:'text',placeholder:'如：湖南祁阳'},{id:'budget',label:'💰 预算',type:'select',options:['5万以内','5-15万','15-30万','30-50万','50万以上']},{id:'area',label:'📐 面积',type:'text',placeholder:'平米'},{id:'experience',label:'📋 经验',type:'select',options:['零经验','有一些了解','有行业经验']},{id:'focus',label:'🎯 重点',type:'select',options:['引流获客','提升客单价','会员复购','服务标准化','全方面']}]}
,petLive:{name:'宠物直播',prompt:'你是宠物直播运营专家。直播带货脚本：1)主题和封面 2)开场留人30秒 3)产品讲解流程 4)互动话术 5)宠物助播环节 6)促销节奏 7)复盘模板。时间轴格式。',fields:[{id:'pet_type',label:'🐾 助播',type:'select',options:['🐶 狗狗','🐱 猫咪','🐰 小宠','多宠物','无宠物出镜']},{id:'product',label:'📦 产品',type:'text',placeholder:'主要卖什么？'},{id:'platform',label:'📱 平台',type:'select',options:['抖音','快手','淘宝直播','小红书','视频号']},{id:'duration',label:'⏱ 时长',type:'select',options:['1小时','2小时','3小时','4小时+']},{id:'audience',label:'👤 观众',type:'select',options:['新手养宠人','资深铲屎官','宝妈','学生党','泛宠爱好者']}]}
,adoptCopy:{name:'领养文案',prompt:'你是宠物公益文案策划师。领养文案：1)感性标题3个 2)宠物第一人称介绍 3)信息卡 4)救助故事 5)领养条件和流程 6)社交媒体传播文案。温暖有爱。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠']},{id:'name',label:'📝 昵称',type:'text',placeholder:'给它起个名字'},{id:'breed',label:'🏷️ 品种外观',type:'text',placeholder:'田园猫/白色/蓝眼'},{id:'age',label:'📅 年龄',type:'text',placeholder:'大概多大'},{id:'personality',label:'😄 性格',type:'textarea',placeholder:'亲人/胆小/活泼'},{id:'story',label:'📖 背景',type:'textarea',placeholder:'怎么被发现的？'}]}
,petEvent:{name:'宠物活动',prompt:'你是宠物活动策划师。线下活动方案：1)主题创意 2)参与人数 3)时间地点 4)流程时间表 5)互动游戏 6)奖品方案 7)宣传计划 8)预算 9)安全预案。策划书格式。',fields:[{id:'event_type',label:'🎪 类型',type:'select',options:['相亲会','选美大赛','运动会','领养日','知识讲座','义卖市集','摄影大赛','生日派对']},{id:'organizer',label:'🏢 主办方',type:'select',options:['宠物店','宠物医院','社区','个人社团','品牌商','公益组织']},{id:'budget',label:'💰 预算',type:'select',options:['1000内','1k-5k','5k-2万','2-5万','5万+']},{id:'participants',label:'👥 人数',type:'text',placeholder:'预计多少组'},{id:'location',label:'📍 地点',type:'text',placeholder:'室内/室外/场地名']}]}
,breedingCopy:{name:'繁育文案',prompt:'你是专业繁育者。繁育推广文案：1)种公种母优势 2)血统证书 3)繁育计划 4)配种要求 5)幼崽预订 6)售后承诺 7)价格付款 8)FAQ。专业严谨。',fields:[{id:'pet_type',label:'🐾 类型',type:'select',options:['🐶 狗','🐱 猫']},{id:'breed',label:'🏷️ 品种',type:'text',placeholder:'具体品种'},{id:'bloodline',label:'📜 血统',type:'textarea',placeholder:'血统证书/赛级/冠军'},{id:'experience',label:'📋 经验',type:'text',placeholder:'繁育年数/窝数'},{id:'selling',label:'💡 卖点',type:'textarea',placeholder:'基因检测/冠军血统等'}]}
,hotelIntro:{name:'寄养文案',prompt:'你是寄养文案策划师。寄养服务文案：1)环境介绍 2)寄养流程 3)每日护理 4)安全保障 5)套餐价格 6)客户须知 7)优惠活动。温馨让人放心。',fields:[{id:'name',label:'🏪 服务名',type:'text',placeholder:'寄养服务名'},{id:'pets',label:'🐾 可接收',type:'select',options:['仅猫','仅狗','猫狗均可','小宠','全品类']},{id:'facility',label:'🏠 场地',type:'select',options:['家庭式','宠物酒店','独栋别墅','带院子','室内精品']},{id:'price',label:'💰 价格/天',type:'text',placeholder:'如：50-150元/天'},{id:'location',label:'📍 区域',type:'text',placeholder:'所在区域']}]}
,groomingPromo:{name:'美容促销',prompt:'你是宠物美容营销策划。促销活动文案：1)活动主题 2)促销内容 3)规则时间 4)限时限量 5)拉新话术 6)会员裂变 7)传播文案。活泼有吸引力。',fields:[{id:'activity',label:'🎉 类型',type:'select',options:['新店开业','周年庆','节日促销','夏季特惠','双十一','会员日','体验价','储值优惠']},{id:'services',label:'✂️ 服务',type:'select',options:['基础洗护','美容造型','SPA药浴','染色创意','全套护理']},{id:'discount',label:'💰 优惠',type:'text',placeholder:'如：首单19.9、8折'},{id:'platform',label:'📱 渠道',type:'select',options:['朋友圈社群','抖音快手','美团点评','线下海报','公众号']}]}
,foodReview:{name:'粮评文案',prompt:'你是宠物食品测评博主。粮评文案：1)测评标题 2)产品信息 3)配料表分析 4)营养对比 5)适口性 6)优缺点 7)5星评分 8)购买建议。客观专业。',fields:[{id:'brand',label:'🏷️ 品牌',type:'text',placeholder:'测评品牌'},{id:'product',label:'📦 产品',type:'text',placeholder:'产品名'},{id:'pet_type',label:'🐾 适用',type:'select',options:['🐶 狗粮','🐱 猫粮','🐰 兔粮','🐹 小宠粮']},{id:'price',label:'💰 价格规格',type:'text',placeholder:'如：89元/1.5kg'},{id:'focus',label:'🔍 重点',type:'select',options:['全面测评','配料分析','性价比','适口性','安全性','幼宠粮']}]}
,insuranceCopy:{name:'宠物保险',prompt:'你是宠物保险文案策划师。保险推广文案：1)情感开场(宠物生病花费大) 2)核心卖点 3)方案对比 4)理赔流程 5)FAQ 6)好评案例 7)限时优惠。情感+数据。',fields:[{id:'name',label:'📋 产品名',type:'text',placeholder:'保险产品名'},{id:'coverage',label:'🛡️ 保障',type:'textarea',placeholder:'保什么？门诊/手术/住院？'},{id:'price',label:'💰 保费',type:'text',placeholder:'如：每月29元起'},{id:'discount',label:'🎁 优惠',type:'text',placeholder:'首月免费/年付8折']}]}
,petStory:{name:'宠物故事',prompt:'你是温暖的宠物故事作家。创作感人故事(800-1500字)：1)场景开头 2)相识经过 3)日常温馨互动 4)感人高潮 5)情感升华 6)分享标题。温暖治愈有画面感。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠','🐦 鸟','🐢 龟']},{id:'pet_name',label:'📝 名字',type:'text',placeholder:'它的名字'},{id:'personality',label:'😄 性格',type:'textarea',placeholder:'性格和有趣习惯'},{id:'story_bg',label:'📖 相识',type:'textarea',placeholder:'怎么相遇的？'},{id:'tone',label:'🎭 基调',type:'select',options:['温馨治愈','搞笑逗趣','感动催泪','冒险奇遇','平淡幸福']}]}
,cuteCaption:{name:'萌宠配文',prompt:'你是萌宠社交媒体达人。配文：1)朋友圈版50字 2)小红书版(emoji+话题) 3)抖音版 4)微博版 5)文艺版 6)搞笑版。每个风格不同配emoji。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠','🐦 鸟','🐢 爬行类']},{id:'scene',label:'📋 场景',type:'textarea',placeholder:'照片视频里宠物在做什么？'},{id:'mood',label:'🎭 氛围',type:'select',options:['可爱卖萌','搞笑沙雕','治愈温馨','帅气酷炫','犯傻','优雅精致']},{id:'platform',label:'📱 平台',type:'select',options:['朋友圈','小红书','抖音','微博','全部']}]}
,petCommunity:{name:'宠友社群',prompt:'你是宠物社群运营专家。社群运营方案：1)定位 2)欢迎语 3)日常SOP 4)周活动 5)月活动 6)KOC培养 7)群规 8)转化路径 9)数据指标。含话术。',fields:[{id:'type',label:'👥 类型',type:'select',options:['宠物店客户群','品种交流群','同城遛狗群','互助领养群','团购群','科普群']},{id:'scale',label:'📊 规模',type:'select',options:['新建(0-50)','成长(50-200)','成熟(200-500)','大群(500+)']},{id:'problem',label:'❓ 问题',type:'select',options:['群冷清','广告多','不知道发什么','转化低','还没建群']}]}
,petTrend:{name:'宠物趋势',prompt:'你是宠物行业分析师。趋势分析报告：1)行业规模 2)消费趋势 3)新兴赛道 4)消费者画像 5)政策法规 6)投资风向 7)3-5年预测 8)创业机会。专业报告格式。',fields:[{id:'focus',label:'🔍 方向',type:'select',options:['全景分析','宠物食品','宠物医疗','智能设备','宠物服务','宠物电商','宠物保险','宠物内容']},{id:'target',label:'👤 角色',type:'select',options:['宠物店主','品牌方','投资人','创业者','内容创作者']},{id:'time',label:'📅 维度',type:'select',options:['2025全年','2026预测','3-5年展望','当月热点']}]}
,influencerPlan:{name:'宠物博主',prompt:'你是宠物自媒体运营专家。博主运营方案：1)账号定位 2)内容规划 3)选题库30个 4)爆款公式 5)涨粉策略 6)变现模式 7)数据复盘 8)3月增长目标。',fields:[{id:'pet_type',label:'🐾 宠物',type:'select',options:['🐶 狗','🐱 猫','🐰 多宠','🦔 异宠','无宠物(科普)']},{id:'platform',label:'📱 平台',type:'select',options:['抖音','小红书','快手','B站','公众号','多平台']},{id:'fans',label:'📊 粉丝',type:'select',options:['0新号','1k以下','1k-1万','1万-10万','10万+']},{id:'goal',label:'🎯 目标',type:'select',options:['涨粉','变现接广告','品牌合作','个人IP','纯粹分享']}]}};

// === 3. Inject pet tools + openTool override (after main script loads) ===
function setupTools(){
// Merge pet configs into _AI_TEXT_TOOLS
if(!window._AI_TEXT_TOOLS)window._AI_TEXT_TOOLS={};
var keys=Object.keys(_PET);
for(var i=0;i<keys.length;i++){
if(!window._AI_TEXT_TOOLS[keys[i]])window._AI_TEXT_TOOLS[keys[i]]=_PET[keys[i]];
}
// Override openTool if not already overridden
if(!window.openTool||!window.openTool._patched){
var orig=window.openTool&&typeof window.openTool==='function'?window.openTool:null;
window.openTool=function(id){
// snake_case -> camelCase
if(!/^[a-z]+[A-Z]/.test(id)&&/_/.test(id)){var p=id.split('_');id=p[0]+p.slice(1).map(function(s){return s[0].toUpperCase()+s.slice(1)}).join('')}
var _F={txt2img:'text2img',bg_remove:'removeBg',super_res:'upscale',logo_gen:'avatar',video_edit:'videoClip',video_parse:'videoParse',video_reverse:'videoReverse',video2gif:'videoGif',cover_extract:'videoCover',subtitle:'videoSrt',video_summary:'videoSum',video_tag:'videoTag',tts:'voiceClone',audio_fix:'audioEdit',voiceover:'voiceClone',script:'viralVideo',tags:'hashtag',work_report:'report',translate:'translater',summary:'summarize',xiaohongshu:'socialPost'};
if(_F[id])id=_F[id];
if(orig)return orig(id);
var o=document.getElementById('toolOverlay'),p=document.getElementById('toolPanel');
if(!o||!p)return;
o.classList.add('show');document.body.style.overflow='hidden';
if(window._TOOL_MAP&&window._TOOL_MAP[id]&&typeof window._TOOL_MAP[id]==='function'){
var r=window._TOOL_MAP[id]();if(typeof r==='string'&&r.length>0)p.innerHTML=r;}
};
window.openTool._patched=true;
}
}

// === 4. Admin button removal ===
function cleanAdmin(){
var btn=document.getElementById('navAdminBtn');
if(btn&&btn.parentNode)btn.parentNode.removeChild(btn);
var links=document.querySelectorAll('a[href*="admin"]');
for(var i=0;i<links.length;i++){
var href=links[i].getAttribute('href');
if(href==='admin/'||href==='/admin/'||href==='admin'){
var text=links[i].textContent.trim();
if(text==='管理后台'||text==='后台管理'||text==='管理')links[i].style.display='none';
}
}
}

// === 5. Init on DOM ready ===
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){setupTools();cleanAdmin();setInterval(cleanAdmin,600)})}
else{setupTools();cleanAdmin();setInterval(cleanAdmin,600)}
// Also poll for openTool in case main script hasn't loaded yet
var _poll=setInterval(function(){
if(typeof window.openTool==='function'&&!window.openTool._patched){setupTools();clearInterval(_poll)}
},300);
setTimeout(function(){clearInterval(_poll)},10000);

// === 6. Credits polling ===
setInterval(function(){window.updateCreditsUI()},2000);
setTimeout(function(){window.updateCreditsUI()},500);
})();
