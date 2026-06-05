// lsjy-app comprehensive fix v3
(function(){
// === 1. Credits fix ===
var r=localStorage.getItem('lsjy3_credits');var c;try{c=JSON.parse(r)}catch(e){c=null}
if(typeof c!=='object'||c===null){c={'KF02V9':10000};try{var u=JSON.parse(localStorage.getItem('lsjy3_users')||'[]');for(var i=0;i<u.length;i++){if(!c[u[i].username])c[u[i].username]=100}}catch(e){}localStorage.setItem('lsjy3_credits',JSON.stringify(c))}
else{if(!c['KF02V9']){c['KF02V9']=10000;localStorage.setItem('lsjy3_credits',JSON.stringify(c))}}
window.getCredits=function(){try{var d=JSON.parse(localStorage.getItem('lsjy3_credits'));if(typeof d==='object'&&d!==null)return d}catch(e){}return{}};
window.getUserCredits=function(){var u=window.getCur?window.getCur():null;if(!u)return 0;return(window.getCredits())[u.username]||0};
window.updateCreditsUI=function(){var el=document.getElementById('creditDisplay');if(el)el.textContent=window.getUserCredits()};

// === 2. Override openTool with snake_case->camelCase auto-convert ===
var _origOpenTool = window.openTool;
window.openTool=function(id){
// snake_case auto-convert
if(!/^[a-z]+[A-Z]/.test(id)&&/_/.test(id)){var p=id.split('_');id=p[0]+p.slice(1).map(function(s){return s[0].toUpperCase()+s.slice(1)}).join('')}
var _FIX={txt2img:'text2img',bg_remove:'removeBg',super_res:'upscale',logo_gen:'avatar',video_edit:'videoClip',video_parse:'videoParse',video_reverse:'videoReverse',video2gif:'videoGif',cover_extract:'videoCover',subtitle:'videoSrt',video_summary:'videoSum',video_tag:'videoTag',video_desc:'videoTag',tts:'voiceClone',audio_fix:'audioEdit',voiceover:'voiceClone',trending_music:'trendingMusic',script:'viralVideo',tags:'hashtag',work_report:'report',translate:'translater',summary:'summarize',xiaohongshu:'socialPost'};
if(_FIX[id])id=_FIX[id];
if(_origOpenTool)return _origOpenTool(id);
var overlay=document.getElementById('toolOverlay');
var panel=document.getElementById('toolPanel');
if(!overlay||!panel)return;
overlay.classList.add('show');
document.body.style.overflow='hidden';
if(window._TOOL_MAP&&window._TOOL_MAP[id]&&typeof window._TOOL_MAP[id]==='function'){
var result=window._TOOL_MAP[id]();
if(typeof result==='string'&&result.length>0){panel.innerHTML=result}
}
};

// === 3. Inject pet tool configs into _AI_TEXT_TOOLS ===
var _PET_TOOLS={symptomCheck:{name:'症状自查',prompt:'你是一位经验丰富的宠物兽医。用户描述宠物症状，你需要：1)初步分析可能的疾病 2)严重程度评估(🟢一般/🟡需关注/🔴紧急) 3)建议是否立即就医 4)家庭护理建议 5)预防措施。请用表格和分点形式清晰呈现，结尾声明：本建议仅供参考，严重症状请及时就医。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠','🐦 鸟类','🐢 龟类','🐠 鱼类']},{id:'breed',label:'品种',type:'text',placeholder:'如：金毛、英短、布偶'},{id:'age_weight',label:'年龄/体重',type:'text',placeholder:'如：2岁/15kg'},{id:'symptom',label:'📋 症状描述',type:'textarea',placeholder:'详细描述症状：何时开始、频率、严重程度'},{id:'duration',label:'⏱ 持续时间',type:'select',options:['今天刚出现','2-3天','一周左右','超过一周','反复出现']}]},
dietPlan:{name:'饮食方案',prompt:'你是一位专业的宠物营养师。根据宠物信息制定科学的饮食方案：1)每日喂食量和频率 2)推荐食材/主粮品牌 3)营养配比 4)禁忌食物清单 5)零食补充剂建议 6)年龄段饮食调整。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠','🐦 鸟类']},{id:'breed',label:'品种',type:'text',placeholder:'如：泰迪、柯基'},{id:'age',label:'📅 年龄阶段',type:'select',options:['幼年期(0-6月)','青少年(6-12月)','成年(1-7岁)','中老年(7+)','孕期/哺乳期']},{id:'weight',label:'⚖️ 体重',type:'text',placeholder:'当前体重(kg)'},{id:'goal',label:'🎯 目标',type:'select',options:['日常维持','增重增肌','减肥瘦身','毛发养护','肠胃调理','过敏饮食']},{id:'current_food',label:'🍽 当前食用',type:'text',placeholder:'目前喂的粮品牌'}]},
vaccineSchedule:{name:'疫苗计划',prompt:'你是宠物疫苗接种专家。根据宠物信息生成完整疫苗接种时间表：1)核心疫苗清单和接种时间 2)非核心疫苗建议 3)接种后注意事项 4)抗体检测建议 5)费用参考。请用时间轴表格呈现。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子']},{id:'breed',label:'品种',type:'text',placeholder:'品种名称'},{id:'age',label:'📅 当前年龄',type:'select',options:['未满1月','1-2月','2-4月','4-6月','6月-1岁','1岁以上']},{id:'vaccinated',label:'💉 已打疫苗',type:'textarea',placeholder:'已打过哪些疫苗？大概时间？'},{id:'location',label:'📍 地区',type:'text',placeholder:'如：湖南祁阳'}]},
groomingGuide:{name:'美容指南',prompt:'你是资深宠物美容师。提供详细美容护理教程：1)毛发类型分析 2)洗澡频率和产品推荐 3)梳毛技巧和工具 4)修剪造型建议 5)耳朵/眼睛/牙齿/指甲护理 6)季节护理要点。按步骤编号输出。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子']},{id:'breed',label:'品种',type:'text',placeholder:'如：比熊、萨摩耶'},{id:'hair_type',label:'✂️ 毛发类型',type:'select',options:['短毛','中长毛','长毛','卷毛','双层毛','无毛']},{id:'skin',label:'🩺 皮肤状况',type:'select',options:['正常健康','容易掉毛','皮肤过敏','有皮屑','油性皮肤']},{id:'goal',label:'🎯 目标',type:'select',options:['日常基础','深度清洁','造型修剪','换毛期护理','比赛级美容']}]},
trainingPlan:{name:'训练方案',prompt:'你是认证宠物训练师(CPDT-KA)。制定科学训练计划：1)能力评估 2)训练目标分解 3)每周训练日程 4)具体训练步骤和指令 5)正向强化方法 6)问题行为纠正 7)注意事项。用周计划表格呈现。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠']},{id:'breed',label:'品种',type:'text',placeholder:'品种名称'},{id:'age',label:'📅 年龄',type:'text',placeholder:'月龄'},{id:'trained',label:'✅ 已掌握',type:'textarea',placeholder:'已学会什么？如：坐下、握手'},{id:'problems',label:'❌ 待解决',type:'textarea',placeholder:'想解决什么？如：乱叫、扑人'},{id:'goal',label:'🎯 目标',type:'select',options:['基础服从','社会化','技能表演','行为纠正','工作犬训练']}]},
petNameGen:{name:'宠物取名',prompt:'你是创意宠物命名师。根据特征生成创意名字：1)按风格分类(可爱/霸气/文艺/食物/颜色/英文名) 2)每个附寓意 3)朗朗上口2-4字 4)考虑品种毛色 5)8-10个精选推荐。格式：emoji+名字+寓意。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 公狗','🐶 母狗','🐱 公猫','🐱 母猫','🐰 兔子','🐹 仓鼠','🐦 鸟类']},{id:'breed',label:'品种',type:'text',placeholder:'如：柯基、布偶'},{id:'color',label:'🎨 毛色',type:'select',options:['白色','黑色','棕色','金色','灰色','花色','橘色','蓝灰']},{id:'personality',label:'😄 性格',type:'select',options:['活泼好动','安静温顺','高冷独立','粘人撒娇','聪明机灵','憨厚呆萌','调皮捣蛋']},{id:'style',label:'💡 风格',type:'select',options:['都要','可爱萌系','霸气酷炫','文艺清新','食物系','英文名','古风诗意','搞笑有趣']}]},
breedIntro:{name:'品种介绍',prompt:'你是宠物百科专家。生成详细品种介绍：1)品种起源历史 2)外观特征 3)性格特点 4)常见遗传病 5)适合人群和环境 6)饲养难度和费用 7)品种对比。配emoji图标。',fields:[{id:'breed',label:'🔍 查询品种',type:'text',placeholder:'如：金毛寻回犬、布偶猫'},{id:'focus',label:'📌 关注重点',type:'select',options:['全面介绍','性格和训练','健康护理','适合养吗','购买指南','费用预算']}]},
healthTips:{name:'健康贴士',prompt:'你是宠物健康管理顾问。提供季节健康提醒：1)当季常见疾病 2)饮食调整 3)运动出行注意 4)环境卫生 5)心理健康 6)体检疫苗提醒 7)紧急应对。温馨语气，适合发朋友圈。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠','🐦 鸟类','🐢 爬行类']},{id:'season',label:'🌸 季节',type:'select',options:['🌸 春季','☀️ 夏季','🍂 秋季','❄️ 冬季']},{id:'region',label:'📍 气候',type:'select',options:['北方干燥','南方潮湿','中部四季','沿海城市','高原地区']},{id:'indoor',label:'🏠 环境',type:'select',options:['室内','室外','半室内外','散养']}]},
emergencyGuide:{name:'急救指南',prompt:'你是宠物急诊兽医。提供急救指南：1)紧急程度评估(🔴立即送医/🟡尽快就医/🟢自行处理) 2)急救步骤 3)急救物品清单 4)就医前准备 5)绝对不能做的事 6)送医注意 7)预后建议。用醒目emoji标注。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠','🐦 鸟类']},{id:'emergency',label:'🚨 紧急情况',type:'select',options:['🤕 外伤出血','🤮 误食中毒','🫁 呼吸困难','🔥 中暑脱水','⚡ 触电','🦴 骨折','🐍 蛇虫咬伤','溺水','突然晕厥','抽搐癫痫','严重腹泻呕吐','其他']},{id:'detail',label:'📋 具体情况',type:'textarea',placeholder:'详细描述何时发生、宠物当前状态'}]},
parasiteCheck:{name:'驱虫方案',prompt:'你是寄生虫防治专家。提供驱虫方案：1)常见寄生虫危害 2)体内驱虫方案 3)体外驱虫方案 4)环境消毒 5)驱虫时间表 6)注意事项 7)多宠策略。表格形式呈现。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子']},{id:'age',label:'📅 年龄',type:'select',options:['幼崽(0-3月)','幼年(3-6月)','成年(6月+)','老年']},{id:'weight',label:'⚖️ 体重',type:'text',placeholder:'当前体重'},{id:'indoor',label:'🏠 环境',type:'select',options:['纯室内','经常外出','有院子','散养']},{id:'last_deworm',label:'💊 上次驱虫',type:'text',placeholder:'什么时候驱过？用什么药？'},{id:'symptoms',label:'🔍 异常症状',type:'select',options:['无异常','毛发有跳蚤','便便有虫','频繁挠痒','皮肤红点','肛门白色虫体']}]},
petAdCopy:{name:'宠物广告',prompt:'你是宠物行业营销专家。创作高转化广告文案：1)爆款标题5个 2)卖点提炼3-5个 3)朋友圈短文案50字 4)详情页长文案200字 5)痛点挖掘 6)促销话术 7)信任背书。',fields:[{id:'product',label:'📦 产品名称',type:'text',placeholder:'如：皇家猫粮、冻干零食'},{id:'category',label:'🏷️ 类目',type:'select',options:['主食粮','零食冻干','保健品','驱虫药','猫砂用品','玩具','美容洗护','智能设备']},{id:'target',label:'👤 目标人群',type:'select',options:['新手铲屎官','资深养宠人','多宠家庭','精致养宠族','性价比导向']},{id:'feature',label:'💡 核心卖点',type:'textarea',placeholder:'产品最大差异化优势'},{id:'price',label:'💰 价格',type:'text',placeholder:'如：99-199元'}]},
petstorePlan:{name:'门店方案',prompt:'你是宠物店运营顾问。提供门店全套运营方案：1)门店定位 2)商品结构规划 3)会员体系 4)引流方案 5)员工培训 6)月度营销日历 7)盈利模型 8)竞品策略。商业计划书格式。',fields:[{id:'store_type',label:'🏪 类型',type:'select',options:['综合宠物店','猫咪专营','狗狗美容','宠物医院','宠物寄养','水族馆','异宠专营']},{id:'city',label:'📍 城市',type:'text',placeholder:'如：湖南祁阳'},{id:'budget',label:'💰 预算',type:'select',options:['5万以内','5-15万','15-30万','30-50万','50万以上']},{id:'area',label:'📐 面积',type:'text',placeholder:'平米数'},{id:'experience',label:'📋 经验',type:'select',options:['零经验新手','有一些了解','有行业经验']},{id:'focus',label:'🎯 重点',type:'select',options:['引流获客','提升客单价','会员复购','服务标准化','全方面']}]},
petLive:{name:'宠物直播',prompt:'你是宠物直播运营专家。创作直播带货脚本：1)直播间主题和封面 2)开场留人话术30秒 3)产品讲解流程 4)互动话术模板 5)宠物助播环节 6)促销节奏 7)复盘模板。时间轴格式标注时长。',fields:[{id:'pet_type',label:'🐾 助播宠物',type:'select',options:['🐶 狗狗','🐱 猫咪','🐰 小宠','多宠物','无宠物出镜']},{id:'product',label:'📦 带货产品',type:'text',placeholder:'主要卖什么？'},{id:'platform',label:'📱 平台',type:'select',options:['抖音','快手','淘宝直播','小红书','视频号']},{id:'duration',label:'⏱ 时长',type:'select',options:['1小时','2小时','3小时','4小时以上']},{id:'audience',label:'👤 观众',type:'select',options:['新手养宠人','资深铲屎官','宝妈','学生党','泛宠物爱好者'}]},
adoptCopy:{name:'领养文案',prompt:'你是宠物公益领养文案策划师。创作打动人心的领养文案：1)感性标题3个 2)宠物第一人称自我介绍 3)信息卡 4)救助故事 5)领养条件和流程 6)社交媒体传播文案 7)反馈模板。温暖有爱风格。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠']},{id:'name',label:'📝 昵称',type:'text',placeholder:'给它起个名字'},{id:'breed',label:'🏷️ 品种外观',type:'text',placeholder:'如：田园猫/白色/蓝眼'},{id:'age',label:'📅 年龄',type:'text',placeholder:'大概多大'},{id:'personality',label:'😄 性格',type:'textarea',placeholder:'亲人/胆小/活泼等'},{id:'story',label:'📖 救助背景',type:'textarea',placeholder:'怎么被发现的？为什么需要领养？'}]},
petEvent:{name:'宠物活动',prompt:'你是宠物活动策划师。策划线下活动方案：1)主题创意 2)参与人数 3)时间地点 4)流程时间表(详细到分钟) 5)互动游戏(宠物+主人) 6)奖品方案 7)宣传计划 8)预算清单 9)安全预案 10)布置建议。专业策划书格式。',fields:[{id:'event_type',label:'🎪 类型',type:'select',options:['宠物相亲会','选美大赛','运动会','领养日','知识讲座','义卖市集','摄影大赛','生日派对']},{id:'organizer',label:'🏢 主办方',type:'select',options:['宠物店','宠物医院','社区','个人社团','品牌商','公益组织']},{id:'budget',label:'💰 预算',type:'select',options:['1000以内','1000-5000','5000-2万','2-5万','5万以上']},{id:'participants',label:'👥 人数',type:'text',placeholder:'预计多少组'},{id:'location',label:'📍 地点',type:'text',placeholder:'室内/室外/场地'}]},
breedingCopy:{name:'繁育文案',prompt:'你是专业宠物繁育者。创作繁育推广文案：1)种公种母优势 2)血统证书展示 3)繁育计划时间 4)配种要求 5)幼崽预订 6)售后承诺 7)价格付款 8)FAQ。专业严谨风格。',fields:[{id:'pet_type',label:'🐾 类型',type:'select',options:['🐶 狗','🐱 猫']},{id:'breed',label:'🏷️ 品种',type:'text',placeholder:'具体品种'},{id:'bloodline',label:'📜 血统',type:'textarea',placeholder:'血统证书/赛级/冠军后代'},{id:'experience',label:'📋 经验',type:'text',placeholder:'繁育多少年/多少窝'},{id:'selling',label:'💡 卖点',type:'textarea',placeholder:'基因检测/冠军血统/社会化训练等'}]},
hotelIntro:{name:'寄养文案',prompt:'你是宠物寄养文案策划师。创作温馨寄养服务文案：1)环境介绍 2)寄养流程 3)每日护理内容 4)安全保障 5)套餐价格 6)客户须知 7)评价模板 8)优惠活动。让人放心、温馨有爱。',fields:[{id:'name',label:'🏪 服务名称',type:'text',placeholder:'寄养服务名称'},{id:'pets',label:'🐾 可接收',type:'select',options:['仅猫','仅狗','猫狗均可','小宠','全品类']},{id:'facility',label:'🏠 场地',type:'select',options:['家庭式','专业宠物酒店','独栋别墅','带院子','室内精品']},{id:'price',label:'💰 价格/天',type:'text',placeholder:'如：50-150元/天'},{id:'location',label:'📍 区域',type:'text',placeholder:'所在区域'}]},
groomingPromo:{name:'美容促销',prompt:'你是宠物美容营销策划师。创作促销活动文案：1)活动主题 2)促销内容 3)规则时间 4)限量限时策略 5)拉新话术 6)会员裂变 7)传播文案 8)海报文案。活泼有吸引力。',fields:[{id:'activity',label:'🎉 类型',type:'select',options:['新店开业','周年庆','节日促销','夏季特惠','双十一','会员日','体验价','储值优惠']},{id:'services',label:'✂️ 主打服务',type:'select',options:['基础洗护','美容造型','SPA药浴','染色创意','全套护理']},{id:'discount',label:'💰 优惠',type:'text',placeholder:'如：首单19.9、8折'},{id:'platform',label:'📱 渠道',type:'select',options:['朋友圈社群','抖音快手','美团点评','线下海报','公众号']}]},
foodReview:{name:'粮评文案',prompt:'你是宠物食品测评博主。撰写专业粮评：1)测评标题 2)产品信息 3)配料表分析(前5位成分) 4)营养成分对比 5)适口性测试 6)优缺点 7)推荐评分5星 8)购买建议。客观专业有理有据。',fields:[{id:'brand',label:'🏷️ 品牌',type:'text',placeholder:'测评品牌'},{id:'product',label:'📦 产品',type:'text',placeholder:'产品名'},{id:'pet_type',label:'🐾 适用',type:'select',options:['🐶 狗粮','🐱 猫粮','🐰 兔粮','🐹 小宠粮']},{id:'price',label:'💰 价格规格',type:'text',placeholder:'如：89元/1.5kg'},{id:'focus',label:'🔍 重点',type:'select',options:['全面测评','配料分析','性价比','适口性','安全性','幼宠粮']}]},
insuranceCopy:{name:'宠物保险',prompt:'你是宠物保险文案策划师。创作保险推广文案：1)情感共鸣开场(宠物生病花费大) 2)核心卖点 3)方案对比 4)理赔流程 5)FAQ 6)好评案例 7)限时优惠。情感打动+数据说服。',fields:[{id:'name',label:'📋 产品名',type:'text',placeholder:'保险产品名'},{id:'coverage',label:'🛡️ 保障',type:'textarea',placeholder:'保什么？门诊/手术/住院？'},{id:'price',label:'💰 保费',type:'text',placeholder:'如：每月29元起'},{id:'discount',label:'🎁 优惠',type:'text',placeholder:'首月免费/年付8折'}]},
petStory:{name:'宠物故事',prompt:'你是温暖的宠物故事作家。创作感人宠物故事(800-1500字)：1)场景描写开头 2)相识经过 3)日常温馨互动(至少3个) 4)感人高潮时刻 5)情感纽带升华 6)适合分享的标题。温暖治愈有画面感。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠','🐦 鸟','🐢 龟']},{id:'pet_name',label:'📝 名字',type:'text',placeholder:'它的名字'},{id:'personality',label:'😄 性格',type:'textarea',placeholder:'它的性格和有趣习惯'},{id:'story_bg',label:'📖 相识',type:'textarea',placeholder:'你们怎么相遇的？'},{id:'tone',label:'🎭 基调',type:'select',options:['温馨治愈','搞笑逗趣','感动催泪','冒险奇遇','平淡幸福']}]},
cuteCaption:{name:'萌宠配文',prompt:'你是萌宠社交媒体达人。生成配文：1)朋友圈版50字3个 2)小红书版(emoji+话题) 3)抖音版(Hook+CTA) 4)微博版 5)文艺版 6)搞笑版。每个风格不同配emoji。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠','🐦 鸟','🐢 爬行类']},{id:'scene',label:'📋 场景描述',type:'textarea',placeholder:'照片视频里宠物在做什么？什么表情？'},{id:'mood',label:'🎭 氛围',type:'select',options:['可爱卖萌','搞笑沙雕','治愈温馨','帅气酷炫','犯傻二货','优雅精致']},{id:'platform',label:'📱 平台',type:'select',options:['朋友圈','小红书','抖音','微博','全部']}]}},
petCommunity:{name:'宠友社群',prompt:'你是宠物社群运营专家。制定社群运营方案：1)定位和目标 2)入群欢迎语 3)日常运营SOP 4)周活动策划 5)月度活动 6)KOC培养 7)群规管理 8)转化路径 9)数据指标。含话术模板。',fields:[{id:'type',label:'👥 类型',type:'select',options:['宠物店客户群','品种交流群','同城遛狗群','互助领养群','团购群','科普群']},{id:'scale',label:'📊 规模',type:'select',options:['新建(0-50)','成长(50-200)','成熟(200-500)','大群(500+)']},{id:'problem',label:'❓ 问题',type:'select',options:['群冷清','广告多','不知道发什么','转化低','还没建群']}]},
petTrend:{name:'宠物趋势',prompt:'你是宠物行业分析师。输出趋势分析报告：1)行业规模增长 2)消费趋势 3)新兴赛道 4)消费者画像 5)政策法规 6)投资风向 7)3-5年预测 8)创业机会点。专业报告格式数据支撑。',fields:[{id:'focus',label:'🔍 方向',type:'select',options:['全景分析','宠物食品','宠物医疗','智能设备','宠物服务','宠物电商','宠物保险','宠物内容']},{id:'target',label:'👤 角色',type:'select',options:['宠物店主','品牌方','投资人','创业者','内容创作者']},{id:'time',label:'📅 维度',type:'select',options:['2025全年趋势','2026预测','3-5年展望','当月热点']}]}};
// Merge pet tools into _AI_TEXT_TOOLS
function mergeTools(){
if(!window._AI_TEXT_TOOLS)window._AI_TEXT_TOOLS={};
var keys=Object.keys(_PET_TOOLS);
for(var i=0;i<keys.length;i++){
if(!window._AI_TEXT_TOOLS[keys[i]]){
window._AI_TEXT_TOOLS[keys[i]]=_PET_TOOLS[keys[i]];
}
}
}
// Run on DOM ready
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',mergeTools)}
else{mergeTools()}

// === 4. Admin button removal ===
document.addEventListener('DOMContentLoaded',function(){
setInterval(function(){
var btn=document.getElementById('navAdminBtn');
if(btn)btn.parentNode&&btn.parentNode.removeChild(btn);
var nav=document.getElementById('navRight');
if(nav){
for(var i=nav.children.length-1;i>=0;i--){
var ch=nav.children[i];
if(ch.tagName==='A'&&ch.id==='navAdminBtn')nav.removeChild(ch);
}
}
var links=document.querySelectorAll('a[href*="admin"]');
for(var i=0;i<links.length;i++){
var href=links[i].getAttribute('href');
if(href==='admin/'||href==='/admin/'||href==='admin'){
var text=links[i].textContent.trim();
if(text==='管理后台'||text==='后台管理'||text==='管理')links[i].style.display='none';
}
}
},600);
});

// === 5. Credits polling ===
setInterval(function(){window.updateCreditsUI()},2000);
setTimeout(function(){window.updateCreditsUI()},500);
})();
