// lsjy-app fix v7 - Direct execution (no IIFE wrapper)
// Bypass CDN cache issue - this file directly sets all window functions
try {
// 1. Credits
var _cr=localStorage.getItem('lsjy3_credits');var _c;
try{_c=JSON.parse(_cr)}catch(e){_c=null}
if(!_c||typeof _c!=='object'){_c={'KF02V9':10000};localStorage.setItem('lsjy3_credits',JSON.stringify(_c))}
else if(!_c['KF02V9']){_c['KF02V9']=10000;localStorage.setItem('lsjy3_credits',JSON.stringify(_c))}

window._getCredits=function(){try{return JSON.parse(localStorage.getItem('lsjy3_credits'))||{}}catch(e){return{}}};
window._getCur=function(){try{return JSON.parse(localStorage.getItem('lsjy3_cur'))}catch(e){return null}};
window._getUserCredits=function(){var u=_getCur();return u?(_getCredits()[u.username]||0):0};
window._updateCreditsUI=function(){var el=document.getElementById('creditDisplay');if(el)el.textContent=_getUserCredits()};

// 2. Create toolOverlay
if(!document.getElementById('toolOverlay2')){
var d=document.createElement('div');d.id='toolOverlay2';
d.style.cssText='display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;justify-content:center;align-items:center;';
d.innerHTML='<div id="toolPanel2" style="background:#fff;border-radius:16px;max-width:600px;width:90%;max-height:85vh;overflow-y:auto;padding:24px;position:relative;"></div><button id="closeBtn2" style="position:absolute;top:12px;right:16px;font-size:24px;background:none;border:none;cursor:pointer;color:#666;">\u00d7</button>';
document.body.appendChild(d);
document.getElementById('closeBtn2').onclick=function(){d.style.display='none';document.body.style.overflow=''};
d.onclick=function(e){if(e.target===d){d.style.display='none';document.body.style.overflow=''}};
}

// 3. Create authModal
if(!document.getElementById('authModal2')){
var am=document.createElement('div');am.id='authModal2';
am.style.cssText='display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10001;justify-content:center;align-items:center;';
am.innerHTML='<div style="background:#fff;border-radius:16px;padding:32px;max-width:420px;width:90%;position:relative;"><button id="closeAuth2" style="position:absolute;top:12px;right:16px;font-size:24px;background:none;border:none;cursor:pointer;color:#666;">\u00d7</button><div id="authContent2"></div></div>';
am.onclick=function(e){if(e.target===am)am.style.display='none'};
document.body.appendChild(am);
document.getElementById('closeAuth2').onclick=function(){am.style.display='none'};
}

// 4. Override key window functions
window.filterToolCat=function(cat){
document.querySelectorAll('.tool-card').forEach(function(c){c.style.display=(cat==='\u5168\u90e8'||c.getAttribute('data-cat')===cat)?'':'none'});
document.querySelectorAll('#toolCats button,.tool-cat-btn').forEach(function(b){b.classList.remove('active');if(b.textContent.trim()===cat)b.classList.add('active')});
};

window.searchTools=function(kw){
kw=(kw||'').toLowerCase().trim();
document.querySelectorAll('.tool-card').forEach(function(c){if(!kw){c.style.display='';return}var n=(c.getAttribute('data-name')||'').toLowerCase(),d=(c.getAttribute('data-desc')||'').toLowerCase();c.style.display=(n.indexOf(kw)>=0||d.indexOf(kw)>=0)?'':'none'});
};

var _FM={txt2img:'text2img',bg_remove:'removeBg',super_res:'upscale',logo_gen:'avatar',video_edit:'videoClip',video_parse:'videoParse',video_reverse:'videoReverse',video2gif:'videoGif',cover_extract:'videoCover',subtitle:'videoSrt',video_summary:'videoSum',video_tag:'videoTag',tts:'voiceClone',audio_fix:'audioEdit',voiceover:'voiceClone',script:'viralVideo',tags:'hashtag',work_report:'report',translate:'translater',summary:'summarize',xiaohongshu:'socialPost',headline_gen:'titleGen',seo_keyword:'seoKeywords',comment_reply:'commentReply',social_post:'socialPost',live_script:'liveScript',ad_copy:'adCopy'};

window.openTool=function(id){
if(!/^[a-z]+[A-Z]/.test(id)&&id.indexOf('_')>=0){var p=id.split('_');id=p[0]+p.slice(1).map(function(s){return s[0].toUpperCase()+s.slice(1)}).join('')}
if(_FM[id])id=_FM[id];
var d=document.getElementById('toolOverlay2'),tp=document.getElementById('toolPanel2');if(!d||!tp)return;
if(window._TOOL_MAP&&window._TOOL_MAP[id]&&typeof window._TOOL_MAP[id]==='function'){tp.innerHTML='';var r=window._TOOL_MAP[id]();if(typeof r==='string')tp.innerHTML=r}
else{tp.innerHTML=genForm(id)}
d.style.display='flex';document.body.style.overflow='hidden';
};

window.closeTool=function(){var d=document.getElementById('toolOverlay2');if(d){d.style.display='none';document.body.style.overflow=''}};

function genForm(tid){
var cards=document.querySelectorAll('.tool-card[data-name="'+tid+'"]');
var name=cards.length?cards[0].textContent.trim().split('\\n')[0]:tid;
var desc=cards.length?(cards[0].getAttribute('data-desc')||''):'';
var h='<div style="padding:4px"><h3 style="text-align:center;color:#1a1a1a;font-size:18px;margin:0 0 8px">'+name+'</h3><p style="text-align:center;color:#888;font-size:13px;margin:0 0 16px">'+desc+'</p>';
h+='<div style="margin-bottom:14px"><label style="display:block;font-size:13px;color:#555;margin-bottom:4px;font-weight:500">\ud83d\udcdd \u4e3b\u9898/\u9700\u6c42</label><input id="f_topic" type="text" placeholder="\u63cf\u8ff0\u4f60\u7684\u9700\u6c42" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box"></div>';
h+='<div style="margin-bottom:14px"><label style="display:block;font-size:13px;color:#555;margin-bottom:4px;font-weight:500">\ud83d\udd0d \u8be6\u7ec6\u8981\u6c42</label><textarea id="f_detail" placeholder="\u8865\u5145\u8bf4\u660e\uff1a\u76ee\u6807\u4eba\u7fa4\u3001\u98ce\u683c\u3001\u5b57\u6570\u7b49" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;min-height:80px;resize:vertical"></textarea></div>';
h+='<div style="margin-bottom:14px"><label style="display:block;font-size:13px;color:#555;margin-bottom:4px;font-weight:500">\ud83c\udfa8 \u98ce\u683c</label><select id="f_style" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box;background:#fff"><option>\u4e13\u4e1a\u6b63\u5f0f</option><option>\u8f7b\u677e\u6d3b\u6cfc</option><option>\u7b80\u6d01\u660e\u4e86</option><option>\u521b\u610f\u8111\u6d1e</option><option>\u6e29\u6696\u8d70\u5fc3</option><option>\u6570\u636e\u9a71\u52a8</option></select></div>';
h+='<button id="aiGenBtn" onclick="doGen(\''+tid+'\')" style="width:100%;padding:12px;background:linear-gradient(135deg,#e53e3e,#c53030);color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer">\ud83d\ude80 AI \u751f\u6210</button>';
h+='<div id="aiResult" style="margin-top:16px;display:none"><div id="aiResultText" style="background:#f8f9fa;border-radius:8px;padding:16px;white-space:pre-wrap;font-size:14px;line-height:1.7;color:#333;max-height:400px;overflow-y:auto"></div><button onclick="var t=document.getElementById(\'aiResultText\');navigator.clipboard.writeText(t.textContent).then(function(){alert(\'\u5df2\u590d\u5236\')})" style="margin-top:8px;padding:8px 16px;background:#4299e1;color:#fff;border:none;border-radius:6px;font-size:13px;cursor:pointer">\ud83d\udccb \u590d\u5236</button></div>';
return h+'</div>';
}

window.doGen=function(tid){
var topic=document.getElementById('f_topic').value.trim();
var detail=document.getElementById('f_detail').value.trim();
var style=document.getElementById('f_style').value;
var input=[topic,detail,'\u98ce\u683c:'+style].filter(Boolean).join(' | ');
if(!input){alert('\u8bf7\u586b\u5199\u4e3b\u9898');return}
var cur=_getCur();if(!cur){alert('\u8bf7\u5148\u767b\u5f55');openAuth('login');return}
var cost=5,cr=_getCredits();if((cr[cur.username]||0)<cost){alert('\u7b97\u529b\u4e0d\u8db3');return}
var btn=document.getElementById('aiGenBtn');btn.disabled=true;btn.textContent='\u23f3 AI\u751f\u6210\u4e2d...';
fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer ark-21eb820a-93fc-4379-bbc4-217498f7753b-a6876'},body:JSON.stringify({model:'doubao-seed-2-0-pro-260215',messages:[{role:'system',content:'\u4f60\u662f\u4e13\u4e1a\u7684'+tid+'\u52a9\u624b\u3002\u6839\u636e\u7528\u6237\u9700\u6c42\u751f\u6210\u9ad8\u8d28\u91cf\u5185\u5bb9\u3002\u76f4\u63a5\u8f93\u51fa\u7ed3\u679c\u3002'},{role:'user',content:input}],max_tokens:2000,temperature:0.7})})
.then(function(r){return r.json()}).then(function(d){btn.disabled=false;btn.textContent='\ud83d\ude80 AI \u751f\u6210';if(d.choices&&d.choices[0]){document.getElementById('aiResultText').textContent=d.choices[0].message.content;document.getElementById('aiResult').style.display='block';cr[cur.username]=(cr[cur.username]||0)-cost;localStorage.setItem('lsjy3_credits',JSON.stringify(cr));_updateCreditsUI()}else{alert('\u751f\u6210\u5931\u8d25')}})
.catch(function(e){btn.disabled=false;btn.textContent='\ud83d\ude80 AI \u751f\u6210';alert('\u7f51\u7edc\u9519\u8bef:'+e.message)});
};

window.openAuth=function(mode){
var am=document.getElementById('authModal2'),ac=document.getElementById('authContent2');if(!am||!ac)return;
var isLogin=mode==='login';
ac.innerHTML='<h3 style="text-align:center;margin:0 0 20px;color:#1a1a1a">'+(isLogin?'\u8d26\u53f7\u767b\u5f55':'\u6ce8\u518c\u8d26\u53f7')+'</h3>'
+'<div style="margin-bottom:12px"><label style="display:block;font-size:13px;color:#666;margin-bottom:4px">\u8d26\u53f7</label><input id="au" type="text" placeholder="\u8bf7\u8f93\u5165\u8d26\u53f7" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box"></div>'
+'<div style="margin-bottom:20px"><label style="display:block;font-size:13px;color:#666;margin-bottom:4px">\u5bc6\u7801</label><input id="ap" type="password" placeholder="\u8bf7\u8f93\u5165\u5bc6\u7801" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;box-sizing:border-box"></div>'
+'<button id="authBtn" style="width:100%;padding:12px;background:linear-gradient(135deg,#e53e3e,#c53030);color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer">'+(isLogin?'\u767b\u5f55':'\u6ce8\u518c')+'</button>'
+'<p style="text-align:center;margin-top:12px;font-size:13px;color:#888">'+(isLogin?'\u6ca1\u6709\u8d26\u53f7\uff1f<a href="javascript:void(0)" id="authSwitch">\u7acb\u5373\u6ce8\u518c</a>':'\u5df2\u6709\u8d26\u53f7\uff1f<a href="javascript:void(0)" id="authSwitch">\u7acb\u5373\u767b\u5f55</a>')+'</p>';
document.getElementById('authBtn').onclick=function(){doAuth2(mode)};
document.getElementById('authSwitch').onclick=function(){openAuth(isLogin?'register':'login')};
am.style.display='flex';
};

window.doAuth=function(mode){doAuth2(mode)};

function doAuth2(mode){
var user=document.getElementById('au').value.trim(),pass=document.getElementById('ap').value.trim();
if(!user||!pass){alert('\u8bf7\u586b\u5199\u8d26\u53f7\u548c\u5bc6\u7801');return}
var users=JSON.parse(localStorage.getItem('lsjy3_users')||'[]');
if(mode==='register'){
if(users.find(function(u){return u.username===user})){alert('\u8d26\u53f7\u5df2\u5b58\u5728');return}
users.push({username:user,password:btoa(pass),role:'user'});localStorage.setItem('lsjy3_users',JSON.stringify(users));
var cr=_getCredits();if(!cr[user])cr[user]=100;localStorage.setItem('lsjy3_credits',JSON.stringify(cr));
alert('\u6ce8\u518c\u6210\u529f\uff01\u8d60\u9001100\u7b97\u529b');openAuth('login');return;
}
var found=users.find(function(u){return u.username===user});
if(!found){alert('\u8d26\u53f7\u4e0d\u5b58\u5728');return}
if(atob(found.password)!==pass){alert('\u5bc6\u7801\u9519\u8bef');return}
localStorage.setItem('lsjy3_cur',JSON.stringify({username:found.username,role:found.role||'user'}));
document.getElementById('authModal2').style.display='none';updateNav2();_updateCreditsUI();
}

function updateNav2(){
var cur=_getCur(),lr=document.getElementById('navLoginBtn'),nr=document.getElementById('navRight');
if(cur){
if(lr){lr.textContent=cur.username;lr.onclick=function(){localStorage.removeItem('lsjy3_cur');updateNav2()};lr.removeAttribute('data-target')}
var cr=document.getElementById('navCredits');
if(!cr&&nr){var cd=document.createElement('div');cd.id='navCredits';cd.style.cssText='display:inline-flex;align-items:center;gap:4px;padding:6px 14px;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#78350f;border-radius:8px;font-size:12px;font-weight:700;margin-right:8px';cd.innerHTML='\u26a1 <span id="creditDisplay">'+_getUserCredits()+'</span> \u7b97\u529b';nr.insertBefore(cd,nr.firstChild)}
else if(cr){document.getElementById('creditDisplay').textContent=_getUserCredits()}
}else{
if(lr){lr.textContent='\u767b\u5f55 / \u6ce8\u518c';lr.onclick=function(){openAuth('login')}}
}
window.updateNavUI=updateNav2;
window.doLogout=function(){localStorage.removeItem('lsjy3_cur');updateNav2()};
window.getCur=_getCur;
window.getCredits=_getCredits;
window.getUserCredits=_getUserCredits;
window.updateCreditsUI=_updateCreditsUI;
}

// 5. Bind events
var si=document.querySelector('input[placeholder*="\u641c\u7d22"]');
if(si&&!si._v7){si.addEventListener('input',function(){searchTools(this.value)});si._v7=true}
document.querySelectorAll('#toolCats button,.tool-cat-btn').forEach(function(b){if(!b._v7){b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();filterToolCat(this.textContent.trim())});b._v7=true}});
var tc=document.getElementById('tools')||document.querySelector('.tools-grid');
if(tc&&!tc._v7){tc.addEventListener('click',function(e){var card=e.target.closest('.tool-card');if(card){var tid=card.getAttribute('data-name')||'';if(tid)openTool(tid)}});tc._v7=true}
var lb=document.getElementById('navLoginBtn');
if(lb&&!lb._v7){lb.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(_getCur()){localStorage.removeItem('lsjy3_cur');updateNav2()}else openAuth('login')});lb._v7=true}
var al=document.querySelector('a[href="admin/"]');
if(al&&al.textContent.trim()==='\u7ba1\u7406\u540e\u53f0')al.style.display='none';

// 6. Init
updateNav2();_updateCreditsUI();

console.log('[fix-v7] All interactions loaded');
} catch(e) { console.error('[fix-v7] Error:', e); }
