// lsjy-app fix v5 - Complete interaction layer for CDN compatibility
(function(){
// === 1. Credits ===
var r=localStorage.getItem('lsjy3_credits');var c;try{c=JSON.parse(r)}catch(e){c=null}
if(typeof c!=='object'||c===null){c={'KF02V9':10000};try{var u=JSON.parse(localStorage.getItem('lsjy3_users')||'[]');for(var i=0;i<u.length;i++){if(!c[u[i].username])c[u[i].username]=100}}catch(e){}localStorage.setItem('lsjy3_credits',JSON.stringify(c))}
else{if(!c['KF02V9']){c['KF02V9']=10000;localStorage.setItem('lsjy3_credits',JSON.stringify(c))}}
window.getCredits=function(){try{return JSON.parse(localStorage.getItem('lsjy3_credits'))||{}}catch(e){return{}}};
window.getUserCredits=function(){var u=window.getCur?window.getCur():null;if(!u)return 0;return getCredits()[u.username]||0};
window.updateCreditsUI=function(){var el=document.getElementById('creditDisplay');if(el)el.textContent=getUserCredits()};

// === 2. Tool overlay/modal (create if missing) ===
if(!document.getElementById('toolOverlay')){
var ov=document.createElement('div');ov.id='toolOverlay';ov.className='tool-overlay';
ov.innerHTML='<div id="toolPanel" class="tool-panel"></div><button id="closeToolBtn" class="close-tool-btn">&times;</button>';
ov.style.cssText='display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;justify-content:center;align-items:center;';
document.body.appendChild(ov);
var tp=document.getElementById('toolPanel');
tp.style.cssText='background:#fff;border-radius:16px;max-width:600px;width:90%;max-height:85vh;overflow-y:auto;padding:24px;position:relative;';
var cb=document.getElementById('closeToolBtn');
cb.style.cssText='position:absolute;top:12px;right:16px;font-size:24px;background:none;border:none;cursor:pointer;color:#666;z-index:10;';
cb.onclick=function(){ov.style.display='none';document.body.style.overflow='';};
ov.addEventListener('click',function(e){if(e.target===ov){ov.style.display='none';document.body.style.overflow='';}});
}
window.closeTool=function(){
var ov=document.getElementById('toolOverlay');
if(ov){ov.style.display='none';document.body.style.overflow='';}
};

// === 3. Auth modal (create if missing) ===
if(!document.getElementById('authModal')){
var am=document.createElement('div');am.id='authModal';
am.style.cssText='display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10001;justify-content:center;align-items:center;';
am.innerHTML='<div style="background:#fff;border-radius:16px;padding:32px;max-width:420px;width:90%;position:relative;">'+
'<button onclick="document.getElementById(\'authModal\').style.display=\'none\'" style="position:absolute;top:12px;right:16px;font-size:24px;background:none;border:none;cursor:pointer;color:#666;">&times;</button>'+
'<div id="authContent"></div></div>';
am.addEventListener('click',function(e){if(e.target===am)am.style.display='none';});
document.body.appendChild(am);
}
window.openAuth=function(mode){
var am=document.getElementById('authModal');
var ac=document.getElementById('authContent');
if(!am||!ac)return;
var isLogin=mode==='login';
ac.innerHTML='<h3 style="text-align:center;margin:0 0 20px;color:#1a1a1a;">'+(isLogin?'账号登录':'注册账号')+'</h3>'+
'<div style="margin-bottom:12px;"><label style="display:block;font-size:13px;color:#666;margin-bottom:4px;">账号</label>'+
'<input id="authUser" type="text" placeholder="请输入账号" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;"></div>'+
'<div style="margin-bottom:20px;"><label style="display:block;font-size:13px;color:#666;margin-bottom:4px;">密码</label>'+
'<input id="authPass" type="password" placeholder="请输入密码" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;"></div>'+
'<button onclick="doAuth(\''+mode+'\')" style="width:100%;padding:12px;background:linear-gradient(135deg,#e53e3e,#c53030);color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;">'+(isLogin?'登录':'注册')+'</button>'+
'<p style="text-align:center;margin-top:12px;font-size:13px;color:#888;">'+(isLogin?'没有账号？<a href="javascript:void(0)" onclick="openAuth(\'register\')">立即注册</a>':'已有账号？<a href="javascript:void(0)" onclick="openAuth(\'login\')">立即登录</a>')+'</p>';
am.style.display='flex';
};
window.doAuth=function(mode){
var user=document.getElementById('authUser').value.trim();
var pass=document.getElementById('authPass').value.trim();
if(!user||!pass){alert('请填写账号和密码');return;}
var users=JSON.parse(localStorage.getItem('lsjy3_users')||'[]');
if(mode==='register'){
if(users.find(function(u){return u.username===user})){alert('账号已存在');return;}
users.push({username:user,password:btoa(pass),role:'user'});
localStorage.setItem('lsjy3_users',JSON.stringify(users));
var cr=getCredits();if(!cr[user])cr[user]=100;localStorage.setItem('lsjy3_credits',JSON.stringify(cr));
alert('注册成功！赠送100算力');
openAuth('login');return;
}
var found=users.find(function(u){return u.username===user});
if(!found){alert('账号不存在');return;}
if(atob(found.password)!==pass){alert('密码错误');return;}
localStorage.setItem('lsjy3_cur',JSON.stringify({username:found.username,role:found.role||'user'}));
document.getElementById('authModal').style.display='none';
updateNavUI();updateCreditsUI();
};
window.updateNavUI=function(){
var cur=getCur();var lr=document.getElementById('navLoginBtn');var nr=document.getElementById('navRight');
var cr=document.getElementById('navCredits');
if(cur){
if(lr){lr.textContent=cur.username;lr.setAttribute('onclick','doLogout()');lr.removeAttribute('data-target');}
if(!cr&&nr){
var cd=document.createElement('div');cd.id='navCredits';
cd.style.cssText='display:inline-flex;align-items:center;gap:4px;padding:6px 14px;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#78350f;border-radius:8px;font-size:12px;font-weight:700;margin-right:8px;';
cd.innerHTML='<i class="fa-solid fa-bolt"></i> <span id="creditDisplay">'+getUserCredits()+'</span> 算力';
nr.insertBefore(cd,nr.firstChild);
}else if(cr){document.getElementById('creditDisplay').textContent=getUserCredits();}
}else{
if(lr){lr.textContent='登录 / 注册';lr.setAttribute('onclick','openAuth("login")');}
if(cr)cr.style.display='none';
}
};
window.getCur=function(){try{return JSON.parse(localStorage.getItem('lsjy3_cur'))}catch(e){return null}};
window.doLogout=function(){localStorage.removeItem('lsjy3_cur');updateNavUI();};

// === 4. filterToolCat & searchTools (critical - for category filtering) ===
if(typeof window.filterToolCat!=='function'){
window.filterToolCat=function(cat){
var cards=document.querySelectorAll('.tool-card');
cards.forEach(function(card){
if(cat==='全部'){card.style.display='';return;}
var c=card.getAttribute('data-cat')||'';
card.style.display=(c===cat)?'':'none';
});
var btns=document.querySelectorAll('#toolCats button');
btns.forEach(function(b){b.classList.remove('active');if(b.textContent.trim()===cat)b.classList.add('active');});
};
}
if(typeof window.searchTools!=='function'){
window.searchTools=function(keyword){
var kw=(keyword||'').toLowerCase().trim();
var cards=document.querySelectorAll('.tool-card');
cards.forEach(function(card){
if(!kw){card.style.display='';return;}
var name=(card.getAttribute('data-name')||'').toLowerCase();
var desc=(card.getAttribute('data-desc')||'').toLowerCase();
card.style.display=(name.includes(kw)||desc.includes(kw))?'':'none';
});
};
// Bind search input
setTimeout(function(){
var si=document.querySelector('input[placeholder*="搜索"]');
if(si){si.addEventListener('input',function(){searchTools(this.value)});}
// Bind category buttons
var catBtns=document.querySelectorAll('#toolCats button');
catBtns.forEach(function(b){b.addEventListener('click',function(){filterToolCat(this.textContent.trim())})});
},100);
}

// === 5. openTool with ID conversion ===
if(typeof window.openTool!=='function'||!window.openTool._patched){
var orig=typeof window.openTool==='function'?window.openTool:null;
window.openTool=function(id){
// snake_case -> camelCase
if(!/^[a-z]+[A-Z]/.test(id)&&/_/.test(id)){var p=id.split('_');id=p[0]+p.slice(1).map(function(s){return s[0].toUpperCase()+s.slice(1)}).join('')}
var F={txt2img:'text2img',bg_remove:'removeBg',super_res:'upscale',logo_gen:'avatar',video_edit:'videoClip',video_parse:'videoParse',video_reverse:'videoReverse',video2gif:'videoGif',cover_extract:'videoCover',subtitle:'videoSrt',video_summary:'videoSum',video_tag:'videoTag',tts:'voiceClone',audio_fix:'audioEdit',voiceover:'voiceClone',script:'viralVideo',tags:'hashtag',work_report:'report',translate:'translater',summary:'summarize',xiaohongshu:'socialPost',headline_gen:'titleGen',seo_keyword:'seoKeywords',comment_reply:'commentReply',social_post:'socialPost',live_script:'liveScript',ad_copy:'adCopy'};
if(F[id])id=F[id];
if(orig&&orig!==window.openTool)try{return orig(id)}catch(e){}
var ov=document.getElementById('toolOverlay');var tp=document.getElementById('toolPanel');
if(!ov||!tp)return;
// Check _TOOL_MAP
if(window._TOOL_MAP&&window._TOOL_MAP[id]&&typeof window._TOOL_MAP[id]==='function'){
tp.innerHTML='';var r=window._TOOL_MAP[id]();if(typeof r==='string')tp.innerHTML=r;}
else if(window._AI_TEXT_TOOLS&&window._AI_TEXT_TOOLS[id]){
tp.innerHTML=renderGenericAIText(id);
}else{
tp.innerHTML='<h3 style="text-align:center;color:#1a1a1a;margin-top:40px;">🚧 功能开发中</h3><p style="text-align:center;color:#888;margin:10px 0;">该工具正在升级中，敬请期待</p>';
}
ov.style.display='flex';document.body.style.overflow='hidden';
};
window.openTool._patched=true;
}

// === 6. renderGenericAIText ===
if(typeof window.renderGenericAIText!=='function'){
window.renderGenericAIText=function(toolId){
var t=window._AI_TEXT_TOOLS&&window._AI_TEXT_TOOLS[toolId];
if(!t)return'<p>配置加载中...</p>';
var h='<div style="padding:4px;">';
h+='<h3 style="text-align:center;color:#1a1a1a;font-size:18px;margin:0 0 16px;">'+t.name+'</h3>';
(t.fields||[]).forEach(function(f){
h+='<div style="margin-bottom:14px;">';
h+='<label style="display:block;font-size:13px;color:#555;margin-bottom:4px;font-weight:500;">'+f.label+'</label>';
if(f.type==='select'){
h+='<select id="field_'+f.id+'" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;background:#fff;">';
(f.options||[]).forEach(function(o){h+='<option value="'+o+'">'+o+'</option>';});
h+='</select>';
}else if(f.type==='textarea'){
h+='<textarea id="field_'+f.id+'" placeholder="'+(f.placeholder||'')+'" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;min-height:80px;resize:vertical;"></textarea>';
}else{
h+='<input id="field_'+f.id+'" type="text" placeholder="'+(f.placeholder||'')+'" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;">';
}
h+='</div>';
});
h+='<button id="aiGenBtn" onclick="runAIText(\''+toolId+'\')" style="width:100%;padding:12px;background:linear-gradient(135deg,#e53e3e,#c53030);color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;margin-top:8px;">🚀 AI 生成</button>';
h+='<div id="aiResult" style="margin-top:16px;display:none;"><div id="aiResultText" style="background:#f8f9fa;border-radius:8px;padding:16px;white-space:pre-wrap;font-size:14px;line-height:1.7;color:#333;max-height:400px;overflow-y:auto;"></div><button onclick="copyResult()" style="margin-top:8px;padding:8px 16px;background:#4299e1;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer;">📋 复制内容</button></div>';
h+='</div>';
return h;
};
}

// === 7. runAIText - call Doubao API ===
window.runAIText=function(toolId){
var t=window._AI_TEXT_TOOLS&&window._AI_TEXT_TOOLS[toolId];if(!t)return;
var fields={};(t.fields||[]).forEach(function(f){var el=document.getElementById('field_'+f.id);if(el)fields[f.id]=el.value||el.textContent||''});
var input=Object.values(fields).filter(function(v){return v}).join(' | ');
if(!input){alert('请填写至少一个字段');return;}
var cur=getCur();if(!cur){alert('请先登录');openAuth('login');return;}
var cost=5;var cr=getCredits();var balance=cr[cur.username]||0;if(balance<cost){alert('算力不足，请联系管理员充值');return;}
var btn=document.getElementById('aiGenBtn');var resultDiv=document.getElementById('aiResult');var resultText=document.getElementById('aiResultText');
btn.disabled=true;btn.textContent='⏳ AI生成中...';resultDiv.style.display='none';
var systemPrompt=t.prompt||'你是AI助手。';
var messages=[{role:'system',content:systemPrompt},{role:'user',content:input}];
fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions',{
method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer ark-21eb820a-93fc-4379-bbc4-217498f7753b-a6876'},
body:JSON.stringify({model:'doubao-seed-2-0-pro-260215',messages:messages,max_tokens:2000,temperature:0.7})
}).then(function(r){return r.json()}).then(function(d){
btn.disabled=false;btn.textContent='🚀 AI 生成';
if(d.choices&&d.choices[0]){
var text=d.choices[0].message.content;
resultText.textContent=text;resultDiv.style.display='block';
cr[cur.username]=(cr[cur.username]||0)-cost;localStorage.setItem('lsjy3_credits',JSON.stringify(cr));updateCreditsUI();
}else{alert('生成失败：'+JSON.stringify(d).substring(0,200));}
}).catch(function(e){
btn.disabled=false;btn.textContent='🚀 AI 生成';alert('网络错误：'+e.message);
});
};
window.copyResult=function(){
var text=document.getElementById('aiResultText');if(!text)return;
navigator.clipboard.writeText(text.textContent).then(function(){alert('已复制')}).catch(function(){
var ta=document.createElement('textarea');ta.value=text.textContent;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);alert('已复制');
});
};

// === 8. Pet tool configs ===
var _P={symptomCheck:{name:'症状自查',prompt:'你是宠物兽医。分析症状：1)可能疾病 2)严重度(🟢/🟡/🔴) 3)是否就医 4)家庭护理 5)预防。表格形式，结尾声明仅供参考。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠','🐦 鸟类','🐢 龟类']},{id:'breed',label:'品种',type:'text',placeholder:'如：金毛、英短'},{id:'age_weight',label:'年龄/体重',type:'text',placeholder:'如：2岁/15kg'},{id:'symptom',label:'📋 症状描述',type:'textarea',placeholder:'详细描述症状'},{id:'duration',label:'⏱ 持续时间',type:'select',options:['今天刚出现','2-3天','一周左右','超过一周','反复出现']}]}
,dietPlan:{name:'饮食方案',prompt:'你是宠物营养师。制定饮食方案：1)喂食量频率 2)推荐主粮 3)营养配比 4)禁忌食物 5)零食补充剂 6)年龄调整。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠']},{id:'breed',label:'品种',type:'text',placeholder:'如：泰迪'},{id:'age',label:'📅 年龄',type:'select',options:['幼年(0-6月)','青少年(6-12月)','成年(1-7岁)','中老年(7+)','孕期/哺乳期']},{id:'weight',label:'⚖️ 体重',type:'text',placeholder:'kg'},{id:'goal',label:'🎯 目标',type:'select',options:['日常维持','增重增肌','减肥瘦身','毛发养护','肠胃调理','过敏饮食']},{id:'current_food',label:'🍽 当前食用',type:'text',placeholder:'目前喂的粮'}]}
,vaccineSchedule:{name:'疫苗计划',prompt:'你是疫苗接种专家。生成疫苗时间表：1)核心疫苗 2)非核心疫苗 3)注意事项 4)抗体检测 5)费用参考。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子']},{id:'breed',label:'品种',type:'text',placeholder:'品种名'},{id:'age',label:'📅 年龄',type:'select',options:['未满1月','1-2月','2-4月','4-6月','6月-1岁','1岁以上']},{id:'vaccinated',label:'💉 已打疫苗',type:'textarea',placeholder:'已打哪些？时间？'},{id:'location',label:'📍 地区',type:'text',placeholder:'如：湖南祁阳'}]}
,groomingGuide:{name:'美容指南',prompt:'你是宠物美容师。教程：1)毛发分析 2)洗澡频率产品 3)梳毛技巧 4)修剪造型 5)耳眼牙甲护理 6)季节护理。步骤编号。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子']},{id:'breed',label:'品种',type:'text',placeholder:'如：比熊'},{id:'hair_type',label:'✂️ 毛发类型',type:'select',options:['短毛','中长毛','长毛','卷毛','双层毛']},{id:'skin',label:'🩺 皮肤',type:'select',options:['正常','容易掉毛','过敏','皮屑','油性']},{id:'goal',label:'🎯 目标',type:'select',options:['日常基础','深度清洁','造型修剪','换毛期','比赛级']}]}
,trainingPlan:{name:'训练方案',prompt:'你是认证训练师。训练计划：1)能力评估 2)目标分解 3)周日程 4)训练步骤 5)正向强化 6)问题纠正 7)注意事项。周计划表格。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠']},{id:'breed',label:'品种',type:'text',placeholder:'品种名'},{id:'age',label:'📅 月龄',type:'text',placeholder:'月龄'},{id:'trained',label:'✅ 已掌握',type:'textarea',placeholder:'已学会什么？'},{id:'problems',label:'❌ 待解决',type:'textarea',placeholder:'想解决什么？'},{id:'goal',label:'🎯 目标',type:'select',options:['基础服从','社会化','技能表演','行为纠正','工作犬']}]}
,petNameGen:{name:'宠物取名',prompt:'你是创意命名师。生成名字：按风格分类(可爱/霸气/文艺/食物/英文名)附寓意，2-4字，8-10个推荐。emoji+名字+寓意。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 公狗','🐶 母狗','🐱 公猫','🐱 母猫','🐰 兔子','🐹 仓鼠']},{id:'breed',label:'品种',type:'text',placeholder:'如：柯基'},{id:'color',label:'🎨 毛色',type:'select',options:['白色','黑色','棕色','金色','灰色','花色','橘色','蓝灰']},{id:'personality',label:'😄 性格',type:'select',options:['活泼','安静','高冷','粘人','聪明','憨厚','调皮']},{id:'style',label:'💡 风格',type:'select',options:['都要','可爱萌系','霸气酷炫','文艺清新','食物系','英文名','古风','搞笑']}]}
,breedIntro:{name:'品种介绍',prompt:'你是宠物百科专家。品种介绍：1)起源 2)外观 3)性格 4)常见遗传病 5)适合人群 6)饲养难度费用 7)品种对比。配emoji。',fields:[{id:'breed',label:'🔍 品种',type:'text',placeholder:'如：金毛寻回犬'},{id:'focus',label:'📌 重点',type:'select',options:['全面介绍','性格训练','健康护理','适合养吗','购买指南','费用']}]}
,healthTips:{name:'健康贴士',prompt:'你是宠物健康顾问。季节健康提醒：1)当季常见病 2)饮食调整 3)运动注意 4)环境卫生 5)心理健康 6)体检疫苗。温馨语气。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠','🐦 鸟类','🐢 爬行类']},{id:'season',label:'🌸 季节',type:'select',options:['🌸 春季','☀️ 夏季','🍂 秋季','❄️ 冬季']},{id:'region',label:'📍 气候',type:'select',options:['北方干燥','南方潮湿','中部四季','沿海','高原']},{id:'indoor',label:'🏠 环境',type:'select',options:['室内','室外','半室内外','散养']}]}
,emergencyGuide:{name:'急救指南',prompt:'你是宠物急诊兽医。急救：1)紧急度(🔴/🟡/🟢) 2)急救步骤 3)急救物品 4)就医准备 5)禁止事项 6)送医注意 7)预后。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠']},{id:'emergency',label:'🚨 紧急情况',type:'select',options:['🤕 外伤出血','🤮 误食中毒','🫁 呼吸困难','🔥 中暑','⚡ 触电','🦴 骨折','🐍 蛇虫咬','溺水','晕厥','抽搐','严重腹泻呕吐','其他']},{id:'detail',label:'📋 具体情况',type:'textarea',placeholder:'何时发生、当前状态'}]}
,parasiteCheck:{name:'驱虫方案',prompt:'你是寄生虫专家。驱虫方案：1)常见寄生虫 2)体内驱虫 3)体外驱虫 4)环境消毒 5)时间表 6)注意事项 7)多宠策略。表格。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子']},{id:'age',label:'📅 年龄',type:'select',options:['幼崽(0-3月)','幼年(3-6月)','成年(6月+)','老年']},{id:'weight',label:'⚖️ 体重',type:'text',placeholder:'kg'},{id:'indoor',label:'🏠 环境',type:'select',options:['纯室内','经常外出','有院子','散养']},{id:'last_deworm',label:'💊 上次驱虫',type:'text',placeholder:'时间和药物'},{id:'symptoms',label:'🔍 异常',type:'select',options:['无异常','跳蚤','便便有虫','频繁挠痒','皮肤红点','肛门虫体']}]}
,petAdCopy:{name:'宠物广告',prompt:'你是宠物营销专家。广告文案：1)标题5个 2)卖点3-5个 3)朋友圈短文案 4)详情页长文案 5)痛点挖掘 6)促销话术。',fields:[{id:'product',label:'📦 产品名',type:'text',placeholder:'如：皇家猫粮'},{id:'category',label:'🏷️ 类目',type:'select',options:['主食粮','零食冻干','保健品','驱虫药','猫砂','玩具','洗护','智能设备']},{id:'target',label:'👤 人群',type:'select',options:['新手铲屎官','资深养宠人','多宠家庭','精致养宠','性价比']},{id:'feature',label:'💡 卖点',type:'textarea',placeholder:'差异化优势'},{id:'price',label:'💰 价格',type:'text',placeholder:'如：99-199元'}]}
,petstorePlan:{name:'门店方案',prompt:'你是宠物店运营顾问。门店方案：1)定位 2)商品结构 3)会员体系 4)引流 5)员工培训 6)营销日历 7)盈利模型。',fields:[{id:'store_type',label:'🏪 类型',type:'select',options:['综合宠物店','猫咪专营','狗狗美容','宠物医院','宠物寄养','水族馆','异宠专营']},{id:'city',label:'📍 城市',type:'text',placeholder:'如：湖南祁阳'},{id:'budget',label:'💰 预算',type:'select',options:['5万以内','5-15万','15-30万','30-50万','50万以上']},{id:'area',label:'📐 面积',type:'text',placeholder:'平米'},{id:'experience',label:'📋 经验',type:'select',options:['零经验','有一些','有行业经验']},{id:'focus',label:'🎯 重点',type:'select',options:['引流获客','提升客单价','会员复购','服务标准化','全方面']}]}
,petLive:{name:'宠物直播',prompt:'你是宠物直播专家。带货脚本：1)主题封面 2)开场留人 3)产品讲解 4)互动话术 5)宠物助播 6)促销节奏 7)复盘。时间轴。',fields:[{id:'pet_type',label:'🐾 助播',type:'select',options:['🐶 狗狗','🐱 猫咪','🐰 小宠','多宠物','无宠物出镜']},{id:'product',label:'📦 产品',type:'text',placeholder:'卖什么？'},{id:'platform',label:'📱 平台',type:'select',options:['抖音','快手','淘宝直播','小红书','视频号']},{id:'duration',label:'⏱ 时长',type:'select',options:['1小时','2小时','3小时','4小时+']},{id:'audience',label:'👤 观众',type:'select',options:['新手养宠人','资深铲屎官','宝妈','学生党','泛宠爱好者']}]}
,adoptCopy:{name:'领养文案',prompt:'你是公益领养文案策划师。领养文案：1)感性标题3个 2)宠物第一人称介绍 3)信息卡 4)救助故事 5)领养流程。温暖有爱。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠']},{id:'name',label:'📝 昵称',type:'text',placeholder:'给它起个名字'},{id:'breed',label:'🏷️ 品种外观',type:'text',placeholder:'田园猫/白色/蓝眼'},{id:'age',label:'📅 年龄',type:'text',placeholder:'大概多大'},{id:'personality',label:'😄 性格',type:'textarea',placeholder:'亲人/胆小/活泼'},{id:'story',label:'📖 背景',type:'textarea',placeholder:'怎么被发现的？'}]}
,petEvent:{name:'宠物活动',prompt:'你是宠物活动策划师。活动方案：1)主题 2)参与人数 3)时间地点 4)流程时间表 5)互动游戏 6)奖品 7)宣传 8)预算 9)安全预案。',fields:[{id:'event_type',label:'🎪 类型',type:'select',options:['相亲会','选美大赛','运动会','领养日','知识讲座','义卖市集','摄影大赛','生日派对']},{id:'organizer',label:'🏢 主办方',type:'select',options:['宠物店','宠物医院','社区','个人社团','品牌商','公益组织']},{id:'budget',label:'💰 预算',type:'select',options:['1000内','1k-5k','5k-2万','2-5万','5万+']},{id:'participants',label:'👥 人数',type:'text',placeholder:'预计多少组'},{id:'location',label:'📍 地点',type:'text',placeholder:'室内/室外/场地']}]}
,breedingCopy:{name:'繁育文案',prompt:'你是专业繁育者。繁育文案：1)种公种母优势 2)血统证书 3)繁育计划 4)配种要求 5)幼崽预订 6)售后承诺 7)价格付款。专业严谨。',fields:[{id:'pet_type',label:'🐾 类型',type:'select',options:['🐶 狗','🐱 猫']},{id:'breed',label:'🏷️ 品种',type:'text',placeholder:'具体品种'},{id:'bloodline',label:'📜 血统',type:'textarea',placeholder:'血统证书/赛级/冠军'},{id:'experience',label:'📋 经验',type:'text',placeholder:'繁育年数/窝数'},{id:'selling',label:'💡 卖点',type:'textarea',placeholder:'基因检测/冠军血统等'}]}
,hotelIntro:{name:'寄养文案',prompt:'你是寄养文案策划师。服务文案：1)环境介绍 2)寄养流程 3)每日护理 4)安全保障 5)套餐价格 6)须知 7)优惠。温馨让人放心。',fields:[{id:'name',label:'🏪 服务名',type:'text',placeholder:'服务名称'},{id:'pets',label:'🐾 可接收',type:'select',options:['仅猫','仅狗','猫狗均可','小宠','全品类']},{id:'facility',label:'🏠 场地',type:'select',options:['家庭式','宠物酒店','独栋别墅','带院子','室内精品']},{id:'price',label:'💰 价格/天',type:'text',placeholder:'如：50-150元/天'},{id:'location',label:'📍 区域',type:'text',placeholder:'所在区域']}]}
,groomingPromo:{name:'美容促销',prompt:'你是宠物美容营销策划。促销文案：1)主题 2)促销内容 3)规则时间 4)限时限量 5)拉新话术 6)会员裂变 7)传播文案。',fields:[{id:'activity',label:'🎉 类型',type:'select',options:['新店开业','周年庆','节日促销','夏季特惠','双十一','会员日','体验价','储值优惠']},{id:'services',label:'✂️ 服务',type:'select',options:['基础洗护','美容造型','SPA药浴','染色创意','全套护理']},{id:'discount',label:'💰 优惠',type:'text',placeholder:'如：首单19.9'},{id:'platform',label:'📱 渠道',type:'select',options:['朋友圈社群','抖音快手','美团点评','线下海报','公众号']}]}
,foodReview:{name:'粮评文案',prompt:'你是宠物食品测评博主。粮评：1)标题 2)产品信息 3)配料表分析 4)营养对比 5)适口性 6)优缺点 7)5星评分 8)购买建议。客观专业。',fields:[{id:'brand',label:'🏷️ 品牌',type:'text',placeholder:'测评品牌'},{id:'product',label:'📦 产品',type:'text',placeholder:'产品名'},{id:'pet_type',label:'🐾 适用',type:'select',options:['🐶 狗粮','🐱 猫粮','🐰 兔粮','🐹 小宠粮']},{id:'price',label:'💰 价格规格',type:'text',placeholder:'如：89元/1.5kg'},{id:'focus',label:'🔍 重点',type:'select',options:['全面测评','配料分析','性价比','适口性','安全性','幼宠粮']}]}
,insuranceCopy:{name:'宠物保险',prompt:'你是宠物保险文案策划。保险推广：1)情感开场 2)核心卖点 3)方案对比 4)理赔流程 5)FAQ 6)好评案例 7)限时优惠。情感+数据。',fields:[{id:'name',label:'📋 产品名',type:'text',placeholder:'保险产品名'},{id:'coverage',label:'🛡️ 保障',type:'textarea',placeholder:'保什么？门诊/手术/住院？'},{id:'price',label:'💰 保费',type:'text',placeholder:'如：每月29元起'},{id:'discount',label:'🎁 优惠',type:'text',placeholder:'首月免费/年付8折']}]}
,petStory:{name:'宠物故事',prompt:'你是宠物故事作家。创作感人故事(800-1500字)：1)场景开头 2)相识经过 3)日常互动 4)感人高潮 5)情感升华 6)分享标题。温暖治愈。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠','🐦 鸟','🐢 龟']},{id:'pet_name',label:'📝 名字',type:'text',placeholder:'它的名字'},{id:'personality',label:'😄 性格',type:'textarea',placeholder:'性格和习惯'},{id:'story_bg',label:'📖 相识',type:'textarea',placeholder:'怎么相遇的？'},{id:'tone',label:'🎭 基调',type:'select',options:['温馨治愈','搞笑逗趣','感动催泪','冒险奇遇','平淡幸福']}]}
,cuteCaption:{name:'萌宠配文',prompt:'你是萌宠社交媒体达人。配文：1)朋友圈版 2)小红书版 3)抖音版 4)微博版 5)文艺版 6)搞笑版。每个风格不同配emoji。',fields:[{id:'pet_type',label:'🐾 宠物类型',type:'select',options:['🐶 狗','🐱 猫','🐰 兔子','🐹 仓鼠','🐦 鸟','🐢 爬行类']},{id:'scene',label:'📋 场景',type:'textarea',placeholder:'照片里宠物在做什么？'},{id:'mood',label:'🎭 氛围',type:'select',options:['可爱卖萌','搞笑沙雕','治愈温馨','帅气酷炫','犯傻','优雅精致']},{id:'platform',label:'📱 平台',type:'select',options:['朋友圈','小红书','抖音','微博','全部']}]}
,petCommunity:{name:'宠友社群',prompt:'你是宠物社群运营专家。社群方案：1)定位 2)欢迎语 3)日常SOP 4)周活动 5)月活动 6)KOC培养 7)群规 8)转化路径。含话术。',fields:[{id:'type',label:'👥 类型',type:'select',options:['宠物店客户群','品种交流群','同城遛狗群','互助领养群','团购群','科普群']},{id:'scale',label:'📊 规模',type:'select',options:['新建(0-50)','成长(50-200)','成熟(200-500)','大群(500+)']},{id:'problem',label:'❓ 问题',type:'select',options:['群冷清','广告多','不知道发什么','转化低','还没建群']}]}
,petTrend:{name:'宠物趋势',prompt:'你是宠物行业分析师。趋势报告：1)行业规模 2)消费趋势 3)新兴赛道 4)消费者画像 5)政策法规 6)投资风向 7)3-5年预测 8)创业机会。',fields:[{id:'focus',label:'🔍 方向',type:'select',options:['全景分析','宠物食品','宠物医疗','智能设备','宠物服务','宠物电商','宠物保险','宠物内容']},{id:'target',label:'👤 角色',type:'select',options:['宠物店主','品牌方','投资人','创业者','内容创作者']},{id:'time',label:'📅 维度',type:'select',options:['2025全年','2026预测','3-5年展望','当月热点']}]}
,influencerPlan:{name:'宠物博主',prompt:'你是宠物自媒体运营专家。博主方案：1)定位 2)内容规划 3)选题库 4)爆款公式 5)涨粉策略 6)变现模式 7)数据复盘 8)3月目标。',fields:[{id:'pet_type',label:'🐾 宠物',type:'select',options:['🐶 狗','🐱 猫','🐰 多宠','🦔 异宠','无宠物(科普)']},{id:'platform',label:'📱 平台',type:'select',options:['抖音','小红书','快手','B站','公众号','多平台']},{id:'fans',label:'📊 粉丝',type:'select',options:['0新号','1k以下','1k-1万','1万-10万','10万+']},{id:'goal',label:'🎯 目标',type:'select',options:['涨粉','变现接广告','品牌合作','个人IP','纯粹分享']}]}};

// Merge pet + all text tools
if(!window._AI_TEXT_TOOLS)window._AI_TEXT_TOOLS={};
var k=Object.keys(_P);for(var i=0;i<k.length;i++){if(!window._AI_TEXT_TOOLS[k[i]])window._AI_TEXT_TOOLS[k[i]]=_P[k[i]];}

// === 9. Admin button removal ===
function cleanAdmin(){
var btn=document.getElementById('navAdminBtn');if(btn&&btn.parentNode)btn.parentNode.removeChild(btn);
var links=document.querySelectorAll('a[href*="admin"]');
for(var i=0;i<links.length;i++){var href=links[i].getAttribute('href');if(href==='admin/'||href==='/admin/'||href==='admin'){var t=links[i].textContent.trim();if(t==='管理后台'||t==='后台管理'||t==='管理')links[i].style.display='none';}}
}

// === 10. Init ===
function init(){
if(typeof window.filterToolCat!=='function')window.filterToolCat=window.filterToolCat;
if(typeof window.openTool!=='function'||!window.openTool._patched)window.openTool=window.openTool;
updateNavUI();updateCreditsUI();cleanAdmin();
var si=document.querySelector('input[placeholder*="搜索"]');
if(si&&!si._bound){si.addEventListener('input',function(){searchTools(this.value)});si._bound=true;}
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init)}
else{init()}
// Poll for late-loading main script functions
var _poll=setInterval(function(){
var changed=false;
if(typeof window.filterToolCat!=='function'||typeof window.openTool!=='function'){changed=true;}
// Re-merge pet tools in case main script overwrote
var k=Object.keys(_P);for(var i=0;i<k.length;i++){if(!window._AI_TEXT_TOOLS[k[i]]){window._AI_TEXT_TOOLS[k[i]]=_P[k[i]];changed=true;}}
if(changed)init();
},500);
setTimeout(function(){clearInterval(_poll)},15000);

// === 11. Credits polling ===
setInterval(function(){updateCreditsUI()},2000);
setTimeout(function(){updateCreditsUI()},500);
})();
