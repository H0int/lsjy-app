
// lsjy-app interaction layer v9 - INLINE (bypasses CDN caching)
try {

// ===== 1. CREDITS & USERS SYSTEM =====
var _cr=localStorage.getItem('lsjy3_credits'),_c;
try{_c=JSON.parse(_cr)}catch(e){_c=null}
if(!_c||typeof _c!=='object'){_c={'KF02V9':10000};localStorage.setItem('lsjy3_credits',JSON.stringify(_c))}
else if(!_c['KF02V9']){_c['KF02V9']=10000;localStorage.setItem('lsjy3_credits',JSON.stringify(_c))}

var _users=JSON.parse(localStorage.getItem('lsjy3_users')||'[]');
if(!_users.some(function(u){return u.username==='KF02V9'})){_users.push({username:'KF02V9',password:btoa('LKZ2005430'),role:'admin',display:'管理员'});localStorage.setItem('lsjy3_users',JSON.stringify(_users))}

window._getCredits=function(){try{return JSON.parse(localStorage.getItem('lsjy3_credits'))||{}}catch(e){return{}}};
window._getCur=function(){try{return JSON.parse(localStorage.getItem('lsjy3_cur'))}catch(e){return null}};
window._getUserCredits=function(){var u=_getCur();return u?(_getCredits()[u.username]||0):0};
window._updateCreditsUI=function(){
var el=document.getElementById('creditDisplay');if(el)el.textContent=_getUserCredits();
var nc=document.getElementById('navCredits');
if(nc){nc.style.display=_getCur()?'inline-flex':'none'}
};
window.getCredits=_getCredits;window.getCur=_getCur;window.getUserCredits=_getUserCredits;window.updateCreditsUI=_updateCreditsUI;

// ===== 2. BUILD TOOL NAME MAP FROM DOM =====
var _nameMap={};
document.querySelectorAll('.tool-card[data-name]').forEach(function(c){
var dn=c.getAttribute('data-name');
var onclick=c.getAttribute('onclick')||'';
var m=onclick.match(/openTool\(['"]([^'"]+)['"]\)/);
if(m)_nameMap[m[1]]=dn;
var did=c.getAttribute('data-id');
if(did)_nameMap[did]=dn;
_nameMap[dn]=dn;
});

// ===== 3. PROFESSIONAL TOOL FORMS (per-category) =====
var _CATEGORY_FORMS={
'宠物':{
fields:[
{id:'f_species',label:'🐾 宠物类型',type:'select',opts:['犬类','猫类','鸟类','鱼类','爬行类','小型哺乳类','其他']},
{id:'f_breed',label:'🏷️ 品种',type:'text',ph:'如：金毛、英短、柯基等'},
{id:'f_age',label:'📅 年龄/阶段',type:'select',opts:['幼年期(0-1岁)','青年期(1-3岁)','成年期(3-7岁)','老年期(7岁以上)','不确定']},
{id:'f_issue',label:'❓ 具体问题/需求',type:'textarea',ph:'详细描述宠物的症状、行为或您的需求'}
],
style:'专业正式'
},
'AI人工智能':{
fields:[
{id:'f_scene',label:'🎯 使用场景',type:'select',opts:['社交媒体','电商详情页','品牌宣传','营销推广','内容创作','办公文档','学术论文','创意设计','数据分析']},
{id:'f_platform',label:'📱 目标平台',type:'select',opts:['通用','微信朋友圈','小红书','抖音/快手','微博','公众号','淘宝/京东','B站','知乎','LinkedIn']},
{id:'f_audience',label:'👥 目标人群',type:'select',opts:['年轻人(18-25)','都市白领(25-35)','宝妈群体','中老年群体','Z世代学生','职场精英','大众消费者','B端客户']},
{id:'f_tone',label:'📝 基调要求',type:'textarea',ph:'品牌调性、语言风格、参考案例等补充要求'}
]
},
'自媒体':{
fields:[
{id:'f_platform',label:'📱 发布平台',type:'select',opts:['抖音','快手','小红书','微信视频号','B站','微博','公众号','知乎']},
{id:'f_content_type',label:'🎬 内容类型',type:'select',opts:['种草笔记','测评分享','教程干货','生活Vlog','探店打卡','挑战赛','剧情类','知识科普']},
{id:'f_target',label:'🎯 目标效果',type:'select',opts:['涨粉','提升互动','品牌曝光','带货转化','打造IP','内容破圈']},
{id:'f_detail',label:'✏️ 具体要求',type:'textarea',ph:'选题方向、参考对标账号、特殊要求等'}
]
},
'电商':{
fields:[
{id:'f_product',label:'📦 商品类型',type:'select',opts:['服装鞋帽','美妆护肤','食品生鲜','数码家电','家居日用','母婴用品','运动户外','虚拟产品','其他']},
{id:'f_platform',label:'🛒 销售平台',type:'select',opts:['淘宝/天猫','京东','拼多多','抖音小店','快手小店','微信小程序','小红书店铺']},
{id:'f_goal',label:'🎯 营销目标',type:'select',opts:['提升转化','打造爆款','清仓促销','新品推广','品牌种草','复购促活']},
{id:'f_detail',label:'✏️ 补充说明',type:'textarea',ph:'商品卖点、价格区间、竞品参考等'}
]
},
'教育':{
fields:[
{id:'f_subject',label:'📚 学科/领域',type:'select',opts:['语文','数学','英语','物理','化学','生物','历史','地理','政治','计算机','音乐','美术','体育','综合']},
{id:'f_level',label:'🎓 学段',type:'select',opts:['小学','初中','高中','大学','职业教育','成人教育','考研/考公','兴趣培训']},
{id:'f_purpose',label:'📝 用途',type:'select',opts:['课堂教学','作业设计','考试出题','课程开发','教案编写','学习辅导','知识梳理','家校沟通']},
{id:'f_detail',label:'✏️ 详细要求',type:'textarea',ph:'知识点范围、难度要求、输出格式等'}
]
},
'伯雅校园':{
fields:[
{id:'f_role',label:'👤 角色',type:'select',opts:['大学生','研究生','高中生','社团负责人','学生会','创业者','求职者','辅导员']},
{id:'f_need',label:'🎯 需求类型',type:'select',opts:['创业规划','职业发展','学术写作','校园活动','竞赛准备','实习求职','社团运营','社交技能']},
{id:'f_detail',label:'✏️ 具体需求',type:'textarea',ph:'详细描述您的情况和目标'}
]
}
};

// ===== 4. EXTENDED STYLE OPTIONS =====
var _STYLES=['专业正式','轻松活泼','简洁明了','创意脑洞','温暖走心','数据驱动','幽默风趣','文艺清新','硬核技术','商业精英','年轻人潮语','小红书爆款风','抖音爆款体','知乎高赞体','小红书种草风','高级感','真诚走心','权威专家','邻家亲切'];

// ===== 5. CREATE DOM ELEMENTS =====
// Tool overlay
if(!document.getElementById('toolOverlay2')){
var d=document.createElement('div');d.id='toolOverlay2';
d.style.cssText='display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;justify-content:center;align-items:center;';
d.innerHTML='<div id="toolPanel2" style="background:#fff;border-radius:16px;max-width:640px;width:92%;max-height:85vh;overflow-y:auto;padding:28px;position:relative;box-shadow:0 25px 60px rgba(0,0,0,0.3)"></div><button id="closeBtn2" style="position:absolute;top:16px;right:20px;font-size:28px;background:none;border:none;cursor:pointer;color:#666;z-index:10001;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:50%">&#215;</button>';
document.body.appendChild(d);
document.getElementById('closeBtn2').onclick=function(){d.style.display='none';document.body.style.overflow=''};
d.onclick=function(e){if(e.target===d){d.style.display='none';document.body.style.overflow=''}};
}

// Auth modal
if(!document.getElementById('authModal2')){
var am=document.createElement('div');am.id='authModal2';
am.style.cssText='display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10001;justify-content:center;align-items:center;';
am.innerHTML='<div style="background:#fff;border-radius:16px;padding:36px;max-width:440px;width:92%;position:relative;box-shadow:0 25px 60px rgba(0,0,0,0.3)"><button id="closeAuth2" style="position:absolute;top:14px;right:18px;font-size:26px;background:none;border:none;cursor:pointer;color:#666;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%">&#215;</button><div id="authContent2"></div></div>';
am.onclick=function(e){if(e.target===am)am.style.display='none'};
document.body.appendChild(am);
document.getElementById('closeAuth2').onclick=function(){am.style.display='none'};
}

// ===== 6. CORE FUNCTIONS =====
// filterToolCat
window.filterToolCat=function(cat){
document.querySelectorAll('.tool-card').forEach(function(c){c.style.display=(cat==='\u5168\u90e8'||c.getAttribute('data-cat')===cat)?'':'none'});
document.querySelectorAll('#toolCats button,.tool-cat-btn').forEach(function(b){b.classList.remove('active');if(b.textContent.trim()===cat)b.classList.add('active')});
};

// searchTools
window.searchTools=function(kw){
kw=(kw||'').toLowerCase().trim();
document.querySelectorAll('.tool-card').forEach(function(c){if(!kw){c.style.display='';return}var n=(c.getAttribute('data-name')||'').toLowerCase(),d=(c.getAttribute('data-desc')||'').toLowerCase();c.style.display=(n.indexOf(kw)>=0||d.indexOf(kw)>=0)?'':'none'});
};

// openTool
window.openTool=function(id){
var cn=_nameMap[id]||id;
if(/[\u4e00-\u9fff]/.test(id))cn=id;
showToolForm(cn,id);
};

function showToolForm(name,eid){
var d=document.getElementById('toolOverlay2'),tp=document.getElementById('toolPanel2');
if(!d||!tp)return;
if(eid&&window._TOOL_MAP&&window._TOOL_MAP[eid]&&typeof window._TOOL_MAP[eid]==='function'){
tp.innerHTML='';var r=window._TOOL_MAP[eid]();if(typeof r==='string')tp.innerHTML=r;
}else{
tp.innerHTML=genProForm(name,eid);
}
d.style.display='flex';document.body.style.overflow='hidden';
}

// genProForm - professional form per category
function genProForm(name,eid){
var card=document.querySelector('.tool-card[data-name="'+name+'"]');
var desc=card?card.getAttribute('data-desc')||'':'';
var cat=card?card.getAttribute('data-cat')||'':'';
var costMatch=name.match(/(\d+)算力/);
var cost=costMatch?parseInt(costMatch[1]):5;
var costEl=card?card.querySelector('.badge'):null;
if(costEl){var ct=costEl.textContent.match(/(\d+)/);if(ct)cost=parseInt(ct[1])}

var cfg=_CATEGORY_FORMS[cat]||null;
var h='<div style="padding:2px 0">';
h+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px"><h3 style="text-align:left;color:#1a1a1a;font-size:18px;margin:0;font-weight:700">'+name+'</h3><span style="background:linear-gradient(135deg,#fee2e2,#fecaca);color:#dc2626;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600">'+cost+'算力</span></div>';
if(desc)h+='<p style="color:#888;font-size:13px;margin:0 0 20px;line-height:1.5">'+desc+'</p>';

if(cfg){
cfg.fields.forEach(function(f){
h+='<div style="margin-bottom:14px">';
h+='<label style="display:block;font-size:13px;color:#555;margin-bottom:5px;font-weight:600">'+f.label+'</label>';
if(f.type==='select'){
h+='<select id="'+f.id+'" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box;background:#fff;color:#333">';
f.opts.forEach(function(o){h+='<option>'+o+'</option>'});
h+='</select>';
}else if(f.type==='textarea'){
h+='<textarea id="'+f.id+'" placeholder="'+(f.ph||'')+'" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box;min-height:80px;resize:vertical"></textarea>';
}else{
h+='<input id="'+f.id+'" type="text" placeholder="'+(f.ph||'请输入')+'" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box">';
}
h+='</div>';
});
}else{
h+='<div style="margin-bottom:14px"><label style="display:block;font-size:13px;color:#555;margin-bottom:5px;font-weight:600">\ud83d\udcdd 主题/需求</label><input id="f_topic" type="text" placeholder="描述你的需求" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box"></div>';
h+='<div style="margin-bottom:14px"><label style="display:block;font-size:13px;color:#555;margin-bottom:5px;font-weight:600">\ud83d\udd0d 详细要求</label><textarea id="f_detail" placeholder="补充说明：目标人群、风格、字数等" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box;min-height:80px;resize:vertical"></textarea></div>';
}

h+='<div style="margin-bottom:18px"><label style="display:block;font-size:13px;color:#555;margin-bottom:5px;font-weight:600">\ud83c\udfa8 风格</label><select id="f_style" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box;background:#fff;color:#333">';
_STYLES.forEach(function(s){h+='<option>'+s+'</option>'});
h+='</select></div>';

h+='<button id="aiGenBtn" onclick="doGen9(\''+name.replace(/'/g,"\\'")+'\','+cost+')" style="width:100%;padding:14px;background:linear-gradient(135deg,#e53e3e,#c53030);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;letter-spacing:1px;transition:opacity .2s">\ud83d\ude80 AI 生成</button>';
h+='<div id="aiResult" style="margin-top:18px;display:none"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:13px;color:#888;font-weight:600">\ud83d\udcca 生成结果</span><button onclick="var t=document.getElementById(\'aiResultText\');navigator.clipboard.writeText(t.textContent).then(function(){this.textContent=\'\u5df2\u590d\u5236\';setTimeout(function(){this.textContent=\'\ud83d\udccb \u590d\u5236\'}.bind(this),1500)}.bind(this))" style="padding:6px 14px;background:#4299e1;color:#fff;border:none;border-radius:8px;font-size:12px;cursor:pointer">\ud83d\udccb 复制</button></div><div id="aiResultText" style="background:#f8f9fa;border-radius:12px;padding:18px;white-space:pre-wrap;font-size:14px;line-height:1.8;color:#333;max-height:400px;overflow-y:auto;border:1px solid #e5e7eb"></div></div>';
return h+'</div>';
}

// doGen9 - AI generation
window.doGen9=function(toolName,cost){
var fields={};
var selects=document.querySelectorAll('#toolPanel2 select[id^="f_"]');
selects.forEach(function(s){fields[s.id]=s.value});
var inputs=document.querySelectorAll('#toolPanel2 input[id^="f_"]');
inputs.forEach(function(i){if(i.value.trim())fields[i.id]=i.value.trim()});
var textareas=document.querySelectorAll('#toolPanel2 textarea[id^="f_"]');
textareas.forEach(function(t){if(t.value.trim())fields[t.id]=t.value.trim()});

var inputParts=[];
if(fields.f_topic)inputParts.push('主题:'+fields.f_topic);
if(fields.f_breed)inputParts.push('品种:'+fields.f_breed);
if(fields.f_species)inputParts.push('类型:'+fields.f_species);
if(fields.f_age)inputParts.push('阶段:'+fields.f_age);
if(fields.f_issue)inputParts.push('问题:'+fields.f_issue);
if(fields.f_scene)inputParts.push('场景:'+fields.f_scene);
if(fields.f_platform)inputParts.push('平台:'+fields.f_platform);
if(fields.f_audience)inputParts.push('人群:'+fields.f_audience);
if(fields.f_tone)inputParts.push('基调:'+fields.f_tone);
if(fields.f_content_type)inputParts.push('内容类型:'+fields.f_content_type);
if(fields.f_target)inputParts.push('目标:'+fields.f_target);
if(fields.f_detail)inputParts.push('要求:'+fields.f_detail);
if(fields.f_product)inputParts.push('商品:'+fields.f_product);
if(fields.f_goal)inputParts.push('营销目标:'+fields.f_goal);
if(fields.f_subject)inputParts.push('学科:'+fields.f_subject);
if(fields.f_level)inputParts.push('学段:'+fields.f_level);
if(fields.f_purpose)inputParts.push('用途:'+fields.f_purpose);
if(fields.f_role)inputParts.push('角色:'+fields.f_role);
if(fields.f_need)inputParts.push('需求:'+fields.f_need);
var style=document.getElementById('f_style');
if(style)inputParts.push('风格:'+style.value);

var input=inputParts.join(' | ');
if(!input){alert('请至少填写一个字段');return}

var cur=_getCur();if(!cur){alert('请先登录');openAuth('login');return}
var cr=_getCredits();if((cr[cur.username]||0)<cost){alert('算力不足，当前'+(cr[cur.username]||0)+'算力，需要'+cost+'算力');return}

var btn=document.getElementById('aiGenBtn');btn.disabled=true;btn.textContent='\u23f3 AI\u751f\u6210\u4e2d...';btn.style.opacity='0.7';

fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions',{
method:'POST',
headers:{'Content-Type':'application/json','Authorization':'Bearer ark-21eb820a-93fc-4379-bbc4-217498f7753b-a6876'},
body:JSON.stringify({
model:'doubao-seed-2-0-pro-260215',
messages:[
{role:'system',content:'你是专业的「'+toolName+'」助手。根据用户的具体需求和场景，生成高质量、有针对性的专业内容。直接输出结果，不需要额外解释。'},
{role:'user',content:input}
],
max_tokens:2000,
temperature:0.7
})
}).then(function(r){return r.json()})
.then(function(data){
btn.disabled=false;btn.textContent='\ud83d\ude80 AI 生成';btn.style.opacity='1';
if(data.choices&&data.choices[0]){
document.getElementById('aiResultText').textContent=data.choices[0].message.content;
document.getElementById('aiResult').style.display='block';
cr[cur.username]=(cr[cur.username]||0)-cost;
localStorage.setItem('lsjy3_credits',JSON.stringify(cr));
_updateCreditsUI();
}else{
alert('生成失败: '+(data.error||{}).message||'请稍后重试');
}
}).catch(function(e){
btn.disabled=false;btn.textContent='\ud83d\ude80 AI 生成';btn.style.opacity='1';
alert('网络错误: '+e.message);
});
};

window.closeTool=function(){var d=document.getElementById('toolOverlay2');if(d){d.style.display='none';document.body.style.overflow=''}};

// ===== 7. AUTH SYSTEM (Enhanced) =====
window.openAuth=function(mode){
var am=document.getElementById('authModal2'),ac=document.getElementById('authContent2');
if(!am||!ac)return;
var isLogin=mode==='login';
ac.innerHTML=
'<div style="text-align:center;margin-bottom:24px"><div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#e53e3e,#c53030);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff">'+(isLogin?'\ud83d\udd11':'\u270d\ufe0f')+'</div><h3 style="margin:0;color:#1a1a1a;font-size:20px;font-weight:700">'+(isLogin?'欢迎回来':'创建账号')+'</h3><p style="margin:4px 0 0;color:#888;font-size:13px">'+(isLogin?'登录您的罗圣纪元账号':'注册成为罗圣纪元用户')+'</p></div>'
+(isLogin?''
:'<div style="margin-bottom:14px"><label style="display:block;font-size:13px;color:#555;margin-bottom:5px;font-weight:600">\ud83c\udfa8 昵称</label><input id="ar_name" type="text" placeholder="您的显示名称" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box"></div>'
+'<div style="margin-bottom:14px"><label style="display:block;font-size:13px;color:#555;margin-bottom:5px;font-weight:600">\ud83d\udcf7 头像</label><div style="display:flex;align-items:center;gap:12px"><div id="regAvatar" style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#e53e3e,#c53030);display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;flex-shrink:0;cursor:pointer" onclick="document.getElementById(\'avatarInput\').click()">\ud83d\udc64</div><div style="flex:1"><input id="avatarInput" type="file" accept="image/*" style="display:none" onchange="handleAvatar(this)"><p style="font-size:12px;color:#999;margin:0">点击选择自定义头像</p></div></div></div>')
+'<div style="margin-bottom:14px"><label style="display:block;font-size:13px;color:#555;margin-bottom:5px;font-weight:600">\ud83d\udccb 账号</label><input id="au" type="text" placeholder="请输入账号" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box"></div>'
+'<div style="margin-bottom:20px"><label style="display:block;font-size:13px;color:#555;margin-bottom:5px;font-weight:600">\ud83d\udd12 密码</label><input id="ap" type="password" placeholder="请输入密码" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box"></div>'
+'<button id="authBtn" style="width:100%;padding:13px;background:linear-gradient(135deg,#e53e3e,#c53030);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:1px">'+(isLogin?'\u767b \u5f55':'\u6ce8 \u518c')+'</button>'
+'<p style="text-align:center;margin-top:14px;font-size:13px;color:#888">'+(isLogin?'没有账号？<a href="javascript:void(0)" id="authSwitch" style="color:var(--p);font-weight:600;text-decoration:none">立即注册</a>':'已有账号？<a href="javascript:void(0)" id="authSwitch" style="color:var(--p);font-weight:600;text-decoration:none">立即登录</a>')+'</p>';
document.getElementById('authBtn').onclick=function(){doAuth9(mode)};
document.getElementById('authSwitch').onclick=function(){openAuth(isLogin?'register':'login')};
am.style.display='flex';
};

window.handleAvatar=function(input){
if(input.files&&input.files[0]){
var reader=new FileReader();
reader.onload=function(e){
var av=document.getElementById('regAvatar');
if(av){av.innerHTML='<img src="'+e.target.result+'" style="width:100%;height:100%;border-radius:50%;object-fit:cover">';av._custom=true}
};
reader.readAsDataURL(input.files[0]);
}
};

window.doAuth=function(mode){doAuth9(mode)};

function doAuth9(mode){
var user=document.getElementById('au').value.trim(),pass=document.getElementById('ap').value.trim();
if(!user||!pass){alert('请填写账号和密码');return}
var users=JSON.parse(localStorage.getItem('lsjy3_users')||'[]');
if(mode==='register'){
if(users.find(function(u){return u.username===user})){alert('账号已存在');return}
if(users.find(function(u){return u.username===user})){alert('账号已存在');return}
var displayName=document.getElementById('ar_name')?document.getElementById('ar_name').value.trim():user;
var avEl=document.getElementById('regAvatar');
var hasCustomAvatar=avEl&&avEl._custom;
users.push({username:user,password:btoa(pass),role:'user',display:displayName,avatar:hasCustomAvatar});
localStorage.setItem('lsjy3_users',JSON.stringify(users));
var cr=_getCredits();if(!cr[user])cr[user]=100;localStorage.setItem('lsjy3_credits',JSON.stringify(cr));
alert('注册成功！赠送100算力');
openAuth('login');return;
}
var found=users.find(function(u){return u.username===user});
if(!found){alert('账号不存在，请先注册');return}
if(atob(found.password)!==pass){alert('密码错误');return}
localStorage.setItem('lsjy3_cur',JSON.stringify({username:found.username,role:found.role||'user',display:found.display||found.username}));
document.getElementById('authModal2').style.display='none';
updateNav9();_updateCreditsUI();
}

function updateNav9(){
var cur=_getCur(),lr=document.getElementById('navLoginBtn'),nr=document.getElementById('navRight');
if(cur){
var displayName=cur.display||cur.username;
if(lr){lr.textContent=displayName;lr.style.cssText='padding:6px 16px;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#78350f;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer';
lr.onclick=function(){if(confirm('确定退出登录？')){localStorage.removeItem('lsjy3_cur');updateNav9();_updateCreditsUI()}};lr.removeAttribute('data-target')}
var cr=document.getElementById('navCredits');
if(!cr&&nr){var cd=document.createElement('div');cd.id='navCredits';cd.style.cssText='display:inline-flex;align-items:center;gap:4px;padding:6px 14px;background:linear-gradient(135deg,#dbeafe,#bfdbfe);color:#1e40af;border-radius:8px;font-size:12px;font-weight:700;margin-right:8px';cd.innerHTML='\u26a1 <span id="creditDisplay">'+_getUserCredits()+'</span> \u7b97\u529b';nr.insertBefore(cd,nr.firstChild)}
else if(cr){document.getElementById('creditDisplay').textContent=_getUserCredits()}
}else{
if(lr){lr.textContent='\u767b\u5f55 / \u6ce8\u518c';lr.style.cssText='';lr.onclick=function(){openAuth('login')}}
var cr=document.getElementById('navCredits');if(cr)cr.style.display='none';
}
window.updateNavUI=updateNav9;
window.doLogout=function(){localStorage.removeItem('lsjy3_cur');updateNav9();_updateCreditsUI()};
}

// ===== 8. BIND EVENTS =====
var si=document.querySelector('input[placeholder*="\u641c\u7d22"]');
if(si&&!si._v9){si.addEventListener('input',function(){searchTools(this.value)});si._v9=true}

document.querySelectorAll('#toolCats button,.tool-cat-btn').forEach(function(b){
if(!b._v9){b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();filterToolCat(this.textContent.trim())});b._v9=true}
});

var _bindTC=function(el){
if(!el||el._v9)return;
el.addEventListener('click',function(e){
var card=e.target.closest('.tool-card');
if(card){e.preventDefault();e.stopPropagation();var tid=card.getAttribute('data-name')||'';if(tid)openTool(tid)}
});
el._v9=true;
};
_bindTC(document.getElementById('tools'));
_bindTC(document.querySelector('.tools-grid'));

var lb=document.getElementById('navLoginBtn');
if(lb&&!lb._v9){lb.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(_getCur()){if(confirm('确定退出登录？')){localStorage.removeItem('lsjy3_cur');updateNav9();_updateCreditsUI()}}else{openAuth('login')}});lb._v9=true}

var al=document.querySelector('a[href="admin/"]');
if(al&&al.textContent.trim()==='\u7ba1\u7406\u540e\u53f0')al.style.display='none';

// ===== 9. INIT =====
updateNav9();_updateCreditsUI();
window._v9Applied=true;
console.log('[lsjy-interact v9] All systems loaded. Tools:'+document.querySelectorAll('.tool-card').length);

} catch(e) { console.error('[lsjy-interact] Error:', e); }


// ===== 10. FIX: Remove phone link, add email =====
(function(){
var phoneLinks=document.querySelectorAll('a[href="tel:18890000368"]');
phoneLinks.forEach(function(a){a.outerHTML='<div class="btn" style="background:#fff;color:var(--n);border-radius:12px;cursor:default;padding:12px 24px">\ud83d\udce7 contact@lsjy.com</div>'});
})();

// ===== 11. FIX: Add contact info cards =====
(function(){
var ci=document.querySelector('.contact-info');
if(ci&&!ci.querySelector('.cv-website')){
var last=ci.lastElementChild;
var d1=document.createElement('div');d1.className='contact-item';
d1.innerHTML='<span class="ci">\ud83c\udf10</span><span class="cv cv-website">www.lsjy-app.com</span>';
ci.appendChild(d1);
var d2=document.createElement('div');d2.className='contact-item';
d2.innerHTML='<span class="ci">\u23f0</span><span class="cv">工作日 9:00-18:00 在线服务</span>';
ci.appendChild(d2);
}
})();

// ===== 12. FIX: Render pricing if grid is empty =====
(function(){
var g=document.getElementById('pricingGrid');
if(g&&!g.innerHTML.trim()){
try{if(typeof renderPricing==='function')renderPricing()}catch(e){console.error('Pricing render error:',e)}
}
})();

// ===== 13. Hide admin link =====
(function(){
var al=document.querySelector('a[href="admin/"]');
if(al)al.style.display='none';
})();
