// lsjy-app v10 - async gen + media lib + credits shop + bug fixes
try {
// ===== 1. CREDITS & USERS =====
var _cr=localStorage.getItem('lsjy3_credits'),_c;
try{_c=JSON.parse(_cr)}catch(e){_c=null}
if(!_c||typeof _c!=='object'){_c={'KF02V9':10000};localStorage.setItem('lsjy3_credits',JSON.stringify(_c))}
else if(!_c['KF02V9']){_c['KF02V9']=10000;localStorage.setItem('lsjy3_credits',JSON.stringify(_c))}
var _users=JSON.parse(localStorage.getItem('lsjy3_users')||'[]');
if(!_users.some(function(u){return u.username==='KF02V9'})){_users.push({username:'KF02V9',password:btoa('LKZ2005430'),role:'admin',display:'\u7ba1\u7406\u5458'});localStorage.setItem('lsjy3_users',JSON.stringify(_users))}
window._getCredits=function(){try{return JSON.parse(localStorage.getItem('lsjy3_credits'))||{}}catch(e){return{}}};
window._getCur=function(){try{return JSON.parse(localStorage.getItem('lsjy3_cur'))}catch(e){return null}};
window._getUserCredits=function(){var u=_getCur();return u?(_getCredits()[u.username]||0):0};
window._updateCreditsUI=function(){var el=document.getElementById('creditDisplay');if(el)el.textContent=_getUserCredits();var nc=document.getElementById('navCredits');if(nc)nc.style.display=_getCur()?'inline-flex':'none'};
window.getCredits=_getCredits;window.getCur=_getCur;window.getUserCredits=_getUserCredits;window.updateCreditsUI=_updateCreditsUI;
// ===== 1b. MEDIA LIBRARY =====
window._getMediaLib=function(){try{return JSON.parse(localStorage.getItem('lsjy3_media')||'[]')}catch(e){return[]}};
window._saveMediaLib=function(lib){try{localStorage.setItem('lsjy3_media',JSON.stringify(lib.slice(0,200)))}catch(e){}};
window._addMedia=function(item){var lib=_getMediaLib();item.id=Date.now()+'_'+Math.random().toString(36).substr(2,6);item.time=new Date().toLocaleString('zh-CN');item.user=_getCur()?_getCur().username:'guest';lib.unshift(item);_saveMediaLib(lib);return item};
// ===== 2. NAME MAP =====
var _nameMap={};
document.querySelectorAll('.tool-card[data-name]').forEach(function(c){var dn=c.getAttribute('data-name'),oc=c.getAttribute('onclick')||'';var m=oc.match(/openTool\(['"]([^'"]+)['"]\)/);if(m)_nameMap[m[1]]=dn;_nameMap[dn]=dn});
var _IMG_KW=['\u6587\u751f\u56fe','\u56fe\u751f\u56fe','\u4fee\u56fe','\u62a0\u56fe','\u53bb\u80cc','\u8d85\u5206\u8fa8','\u5934\u50cf','\u6d77\u62a5','\u8001\u7167\u7247','\u7ebf\u7a3f','Logo\u8bbe\u8ba1'];
var _VID_KW=['\u6570\u5b57\u4eba','\u89c6\u9891\u526a\u8f91','\u56fe\u751f\u89c6\u9891'];
function _isImg(n){return _IMG_KW.some(function(k){return n.indexOf(k)>=0})}
function _isVid(n){return _VID_KW.some(function(k){return n.indexOf(k)>=0})}
// ===== 3. CATEGORY FORMS =====
var _CF={
'\u5ba0\u7269':{fields:[
{id:'f_species',label:'\ud83d\udc3e \u5ba0\u7269\u7c7b\u578b',type:'select',opts:['\u72ac\u7c7b','\u732b\u7c7b','\u9e1f\u7c7b','\u9c7c\u7c7b','\u722c\u884c\u7c7b','\u5c0f\u578b\u54fa\u4e73\u7c7b','\u5176\u4ed6']},
{id:'f_breed',label:'\ud83c\udff7\ufe0f \u54c1\u79cd',type:'text',ph:'\u5982\uff1a\u91d1\u6bdb\u3001\u82f1\u77ed\u3001\u67ef\u57fa\u7b49'},
{id:'f_age',label:'\ud83d\udcc5 \u5e74\u9f84/\u9636\u6bb5',type:'select',opts:['\u5e7c\u5e74\u671f(0-1\u5c81)','\u9752\u5e74\u671f(1-3\u5c81)','\u6210\u5e74\u671f(3-7\u5c81)','\u8001\u5e74\u671f(7\u5c81\u4ee5\u4e0a)','\u4e0d\u786e\u5b9a']},
{id:'f_issue',label:'\u2753 \u5177\u4f53\u95ee\u9898',type:'textarea',ph:'\u8be6\u7ec6\u63cf\u8ff0\u5ba0\u7269\u7684\u75c7\u72b6\u6216\u9700\u6c42'}
]},
'AI\u4eba\u5de5\u667a\u80fd':{fields:[
{id:'f_scene',label:'\ud83c\udfaf \u4f7f\u7528\u573a\u666f',type:'select',opts:['\u793e\u4ea4\u5a92\u4f53','\u7535\u5546\u8be6\u60c5\u9875','\u54c1\u724c\u5ba3\u4f20','\u8425\u9500\u63a8\u5e7f','\u5185\u5bb9\u521b\u4f5c','\u529e\u516c\u6587\u6863','\u5b66\u672f\u8bba\u6587','\u521b\u610f\u8bbe\u8ba1','\u6570\u636e\u5206\u6790']},
{id:'f_platform',label:'\ud83d\udcf1 \u76ee\u6807\u5e73\u53f0',type:'select',opts:['\u901a\u7528','\u5fae\u4fe1\u670b\u53cb\u5708','\u5c0f\u7ea2\u4e66','\u6296\u97f3/\u5feb\u624b','\u5fae\u535a','\u516c\u4f17\u53f7','\u6dd8\u5b9d/\u4eac\u4e1c','B\u7ad9','\u77e5\u4e4e','LinkedIn']},
{id:'f_audience',label:'\ud83d\udc65 \u76ee\u6807\u4eba\u7fa4',type:'select',opts:['\u5e74\u8f7b\u4eba(18-25)','\u90fd\u5e02\u767d\u9886(25-35)','\u5b9d\u5988\u7fa4\u4f53','\u4e2d\u8001\u5e74\u7fa4\u4f53','Z\u4e16\u4ee3\u5b66\u751f','\u804c\u573a\u7cbe\u82f1','\u5927\u4f17\u6d88\u8d39\u8005','B\u7aef\u5ba2\u6237']},
{id:'f_tone',label:'\ud83d\udcdd \u57fa\u8c03\u8981\u6c42',type:'textarea',ph:'\u54c1\u724c\u8c03\u6027\u3001\u8bed\u8a00\u98ce\u683c\u7b49'}
]},
'\u81ea\u5a92\u4f53':{fields:[
{id:'f_platform',label:'\ud83d\udcf1 \u53d1\u5e03\u5e73\u53f0',type:'select',opts:['\u6296\u97f3','\u5feb\u624b','\u5c0f\u7ea2\u4e66','\u5fae\u4fe1\u89c6\u9891\u53f7','B\u7ad9','\u5fae\u535a','\u516c\u4f17\u53f7','\u77e5\u4e4e']},
{id:'f_content_type',label:'\ud83c\udfac \u5185\u5bb9\u7c7b\u578b',type:'select',opts:['\u79cd\u8349\u7b14\u8bb0','\u6d4b\u8bc4\u5206\u4eab','\u6559\u7a0b\u5e72\u8d27','\u751f\u6d3bVlog','\u63a2\u5e97\u6253\u5361','\u6311\u6218\u8d5b','\u5267\u60c5\u7c7b','\u77e5\u8bc6\u79d1\u666e']},
{id:'f_target',label:'\ud83c\udfaf \u76ee\u6807\u6548\u679c',type:'select',opts:['\u6da8\u7c89','\u63d0\u5347\u4e92\u52a8','\u54c1\u724c\u66dd\u5149','\u5e26\u8d27\u8f6c\u5316','\u6253\u9020IP','\u5185\u5bb9\u7834\u5708']},
{id:'f_detail',label:'\u270f\ufe0f \u5177\u4f53\u8981\u6c42',type:'textarea',ph:'\u9009\u9898\u65b9\u5411\u3001\u53c2\u8003\u5bf9\u6807\u8d26\u53f7\u7b49'}
]},
'\u7535\u5546':{fields:[
{id:'f_product',label:'\ud83d\udce6 \u5546\u54c1\u7c7b\u578b',type:'select',opts:['\u670d\u88c5\u978b\u5e3d','\u7f8e\u5986\u62a4\u80a4','\u98df\u54c1\u751f\u9c9c','\u6570\u7801\u5bb6\u7535','\u5bb6\u5c45\u65e5\u7528','\u6bcd\u5a74\u7528\u54c1','\u8fd0\u52a8\u6237\u5916','\u865a\u62df\u4ea7\u54c1','\u5176\u4ed6']},
{id:'f_platform',label:'\ud83d\uded2 \u9500\u552e\u5e73\u53f0',type:'select',opts:['\u6dd8\u5b9d/\u5929\u732b','\u4eac\u4e1c','\u62fc\u591a\u591a','\u6296\u97f3\u5c0f\u5e97','\u5feb\u624b\u5c0f\u5e97','\u5fae\u4fe1\u5c0f\u7a0b\u5e8f','\u5c0f\u7ea2\u4e66\u5e97\u94fa']},
{id:'f_goal',label:'\ud83c\udfaf \u8425\u9500\u76ee\u6807',type:'select',opts:['\u63d0\u5347\u8f6c\u5316','\u6253\u9020\u7206\u6b3e','\u6e05\u4ed3\u4fc3\u9500','\u65b0\u54c1\u63a8\u5e7f','\u54c1\u724c\u79cd\u8349','\u590d\u8d2d\u4fc3\u6d3b']},
{id:'f_detail',label:'\u270f\ufe0f \u8865\u5145\u8bf4\u660e',type:'textarea',ph:'\u5546\u54c1\u5356\u70b9\u3001\u4ef7\u683c\u533a\u95f4\u7b49'}
]},
'\u6559\u80b2':{fields:[
{id:'f_subject',label:'\ud83d\udcda \u5b66\u79d1',type:'select',opts:['\u8bed\u6587','\u6570\u5b66','\u82f1\u8bed','\u7269\u7406','\u5316\u5b66','\u751f\u7269','\u5386\u53f2','\u5730\u7406','\u653f\u6cbb','\u8ba1\u7b97\u673a','\u97f3\u4e50','\u7f8e\u672f','\u4f53\u80b2','\u7efc\u5408']},
{id:'f_level',label:'\ud83c\udf93 \u5b66\u6bb5',type:'select',opts:['\u5c0f\u5b66','\u521d\u4e2d','\u9ad8\u4e2d','\u5927\u5b66','\u804c\u4e1a\u6559\u80b2','\u6210\u4eba\u6559\u80b2','\u8003\u7814/\u8003\u516c','\u5174\u8da3\u57f9\u8bad']},
{id:'f_purpose',label:'\ud83d\udcdd \u7528\u9014',type:'select',opts:['\u8bfe\u5802\u6559\u5b66','\u4f5c\u4e1a\u8bbe\u8ba1','\u8003\u8bd5\u51fa\u9898','\u8bfe\u7a0b\u5f00\u53d1','\u6559\u6848\u7f16\u5199','\u5b66\u4e60\u8f85\u5bfc','\u77e5\u8bc6\u68b3\u7406','\u5bb6\u6821\u6c9f\u901a']},
{id:'f_detail',label:'\u270f\ufe0f \u8be6\u7ec6\u8981\u6c42',type:'textarea',ph:'\u77e5\u8bc6\u70b9\u3001\u96be\u5ea6\u3001\u8f93\u51fa\u683c\u5f0f\u7b49'}
]},
'\u4f2f\u96c5\u6821\u56ed':{fields:[
{id:'f_role',label:'\ud83d\udc64 \u89d2\u8272',type:'select',opts:['\u5927\u5b66\u751f','\u7814\u7a76\u751f','\u9ad8\u4e2d\u751f','\u793e\u56e2\u8d1f\u8d23\u4eba','\u5b66\u751f\u4f1a','\u521b\u4e1a\u8005','\u6c42\u804c\u8005','\u8f85\u5bfc\u5458']},
{id:'f_need',label:'\ud83c\udfaf \u9700\u6c42\u7c7b\u578b',type:'select',opts:['\u521b\u4e1a\u89c4\u5212','\u804c\u4e1a\u53d1\u5c55','\u5b66\u672f\u5199\u4f5c','\u6821\u56ed\u6d3b\u52a8','\u7ade\u8d5b\u51c6\u5907','\u5b9e\u4e60\u6c42\u804c','\u793e\u56e2\u8fd0\u8425','\u793e\u4ea4\u6280\u80fd']},
{id:'f_detail',label:'\u270f\ufe0f \u5177\u4f53\u9700\u6c42',type:'textarea',ph:'\u60a8\u7684\u60c5\u51b5\u548c\u76ee\u6807'}
]}
};
var _STYLES=['\u4e13\u4e1a\u6b63\u5f0f','\u8f7b\u677e\u6d3b\u6cfc','\u7b80\u6d01\u660e\u4e86','\u521b\u610f\u8111\u6d1e','\u6e29\u6696\u8d70\u5fc3','\u6570\u636e\u9a71\u52a8','\u5e7d\u9ed8\u98ce\u8da3','\u6587\u827a\u6e05\u65b0','\u786c\u6838\u6280\u672f','\u5546\u4e1a\u7cbe\u82f1','\u5e74\u8f7b\u4eba\u6f6e\u8bed','\u5c0f\u7ea2\u4e66\u7206\u6b3e\u98ce','\u6296\u97f3\u7206\u6b3e\u4f53','\u77e5\u4e4e\u9ad8\u8d5e\u4f53','\u5c0f\u7ea2\u4e66\u79cd\u8349\u98ce','\u9ad8\u7ea7\u611f','\u771f\u8bda\u8d70\u5fc3','\u6743\u5a01\u4e13\u5bb6','\u90bb\u5bb6\u4eb2\u5207'];

// ===== 5. DOM ELEMENTS =====
function _mkEl(id,html,z){var e=document.createElement('div');e.id=id;e.style.cssText='display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:'+(z||10000)+';justify-content:center;align-items:center;';e.innerHTML=html;e.onclick=function(ev){if(ev.target===e)e.style.display='none'};document.body.appendChild(e);return e}
if(!document.getElementById('toolOverlay2'))_mkEl('toolOverlay2','<div id="toolPanel2" style="background:#fff;border-radius:16px;max-width:640px;width:92%;max-height:85vh;overflow-y:auto;padding:28px;position:relative;box-shadow:0 25px 60px rgba(0,0,0,0.3)"></div><button id="closeBtn2" style="position:absolute;top:16px;right:20px;font-size:28px;background:none;border:none;cursor:pointer;color:#666;z-index:10001;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:50%">&times;</button>');
document.getElementById('closeBtn2').onclick=function(){document.getElementById('toolOverlay2').style.display='none';document.body.style.overflow=''};
if(!document.getElementById('authModal2'))_mkEl('authModal2','<div style="background:#fff;border-radius:16px;padding:36px;max-width:440px;width:92%;position:relative;box-shadow:0 25px 60px rgba(0,0,0,0.3)"><button id="closeAuth2" style="position:absolute;top:14px;right:18px;font-size:26px;background:none;border:none;cursor:pointer;color:#666;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%">&times;</button><div id="authContent2"></div></div>',10001);
document.getElementById('closeAuth2').onclick=function(){document.getElementById('authModal2').style.display='none'};
if(!document.getElementById('creditsShopModal'))_mkEl('creditsShopModal','<div style="background:#fff;border-radius:16px;padding:36px;max-width:520px;width:92%;max-height:85vh;overflow-y:auto;position:relative;box-shadow:0 25px 60px rgba(0,0,0,0.3)"><button id="closeShop" style="position:absolute;top:14px;right:18px;font-size:26px;background:none;border:none;cursor:pointer;color:#666;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%">&times;</button><div id="shopContent"></div></div>',10002);
document.getElementById('closeShop').onclick=function(){document.getElementById('creditsShopModal').style.display='none'};
if(!document.getElementById('mediaLibModal'))_mkEl('mediaLibModal','<div style="background:#fff;border-radius:16px;padding:36px;max-width:700px;width:94%;max-height:85vh;overflow-y:auto;position:relative;box-shadow:0 25px 60px rgba(0,0,0,0.3)"><button id="closeMedia" style="position:absolute;top:14px;right:18px;font-size:26px;background:none;border:none;cursor:pointer;color:#666;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%">&times;</button><div id="mediaContent"></div></div>',10002);
document.getElementById('closeMedia').onclick=function(){document.getElementById('mediaLibModal').style.display='none'};

// ===== 6. CORE FUNCTIONS =====
window.filterToolCat=function(cat){document.querySelectorAll('.tool-card').forEach(function(c){c.style.display=(cat==='\u5168\u90e8'||c.getAttribute('data-cat')===cat)?'':'none'});document.querySelectorAll('#toolCats button,.tool-cat-btn').forEach(function(b){b.classList.remove('active');if(b.textContent.trim()===cat)b.classList.add('active')})};
window.searchTools=function(kw){kw=(kw||'').toLowerCase().trim();document.querySelectorAll('.tool-card').forEach(function(c){if(!kw){c.style.display='';return}var n=(c.getAttribute('data-name')||'').toLowerCase(),d=(c.getAttribute('data-desc')||'').toLowerCase();c.style.display=(n.indexOf(kw)>=0||d.indexOf(kw)>=0)?'':'none'})};
window.openTool=function(id){var cn=_nameMap[id]||id;if(/[\u4e00-\u9fff]/.test(id))cn=id;_sf(cn,id)};
window.closeTool=function(){var d=document.getElementById('toolOverlay2');if(d){d.style.display='none';document.body.style.overflow=''}};

function _sf(name,eid){var d=document.getElementById('toolOverlay2'),tp=document.getElementById('toolPanel2');if(!d||!tp)return;tp.innerHTML=_gf(name);d.style.display='flex';document.body.style.overflow='hidden'}

function _rf(f){var h='<div style="margin-bottom:14px"><label style="display:block;font-size:13px;color:#555;margin-bottom:5px;font-weight:600">'+f.label+'</label>';if(f.type==='select'){h+='<select id="'+f.id+'" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box;background:#fff;color:#333">';f.opts.forEach(function(o){h+='<option>'+o+'</option>'});h+='</select>'}else if(f.type==='textarea'){h+='<textarea id="'+f.id+'" placeholder="'+(f.ph||'')+'" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box;min-height:80px;resize:vertical"></textarea>'}else{h+='<input id="'+f.id+'" type="text" placeholder="'+(f.ph||'')+'" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box">'}return h+'</div>'}

function _gf(name){
var card=document.querySelector('.tool-card[data-name="'+name+'"]');var desc=card?card.getAttribute('data-desc')||'':'';var cat=card?card.getAttribute('data-cat')||'':'';var cost=5;var ce=card?card.querySelector('.badge'):null;if(ce){var m=ce.textContent.match(/(\d+)/);if(m)cost=parseInt(m[1])}
var isI=_isImg(name),isV=_isVid(name);var cfg=_CF[cat]||null;
var h='<div style="padding:2px 0"><div style="display:flex;align-items:center;gap:10px;margin-bottom:4px"><h3 style="text-align:left;color:#1a1a1a;font-size:18px;margin:0;font-weight:700">'+name+'</h3><span style="background:linear-gradient(135deg,#fee2e2,#fecaca);color:#dc2626;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600">'+cost+'\u7b97\u529b</span></div>';
if(desc)h+='<p style="color:#888;font-size:13px;margin:0 0 20px;line-height:1.5">'+desc+'</p>';
if(cfg)cfg.fields.forEach(function(f){h+=_rf(f)});
else{h+='<div style="margin-bottom:14px"><label style="display:block;font-size:13px;color:#555;margin-bottom:5px;font-weight:600">\ud83d\udcdd \u4e3b\u9898/\u9700\u6c42</label><input id="f_topic" type="text" placeholder="\u63cf\u8ff0\u4f60\u7684\u9700\u6c42" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box"></div>';h+='<div style="margin-bottom:14px"><label style="display:block;font-size:13px;color:#555;margin-bottom:5px;font-weight:600">\ud83d\udd0d \u8be6\u7ec6\u8981\u6c42</label><textarea id="f_detail" placeholder="\u76ee\u6807\u4eba\u7fa4\u3001\u98ce\u683c\u3001\u5b57\u6570\u7b49" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box;min-height:80px;resize:vertical"></textarea></div>'}
h+='<div style="margin-bottom:18px"><label style="display:block;font-size:13px;color:#555;margin-bottom:5px;font-weight:600">\ud83c\udfa8 \u98ce\u683c</label><select id="f_style" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box;background:#fff;color:#333">';_STYLES.forEach(function(s){h+='<option>'+s+'</option>'});h+='</select></div>';
if(isI||isV){h+='<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:10px"><span style="font-size:20px">'+(isI?'\ud83d\udcbc':'\ud83c\udfac')+'</span><div><div style="font-size:13px;font-weight:600;color:#1e40af">\u5f02\u6b65\u751f\u6210\u6a21\u5f0f</div><div style="font-size:12px;color:#6b7280">\u63d0\u4ea4\u540e\u53ef\u5173\u95ed\u9875\u9762\uff0c\u5b8c\u6210\u540e\u5728'+(isI?'\u56fe\u6587\u5e93':'\u89c6\u9891\u5e93')+'\u67e5\u770b</div></div></div>'}
h+='<button id="aiGenBtn" onclick="doGen10(\''+name.replace(/'/g,"\\'")+'\','+cost+','+isI+','+isV+')" style="width:100%;padding:14px;background:linear-gradient(135deg,#e53e3e,#c53030);color:#fff;border:none;border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;letter-spacing:1px">\ud83d\ude80 '+(isI||isV?'\u63d0\u4ea4\u751f\u6210':'AI \u751f\u6210')+'</button>';
h+='<div id="genStatus" style="margin-top:14px;display:none"></div>';
if(!isI&&!isV){h+='<div id="aiResult" style="margin-top:18px;display:none"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:13px;color:#888;font-weight:600">\ud83d\udcca \u751f\u6210\u7ed3\u679c</span><button onclick="var t=document.getElementById(\'aiResultText\');navigator.clipboard.writeText(t.textContent)" style="padding:6px 14px;background:#4299e1;color:#fff;border:none;border-radius:8px;font-size:12px;cursor:pointer">\ud83d\udccb \u590d\u5236</button></div><div id="aiResultText" style="background:#f8f9fa;border-radius:12px;padding:18px;white-space:pre-wrap;font-size:14px;line-height:1.8;color:#333;max-height:400px;overflow-y:auto;border:1px solid #e5e7eb"></div></div>'}
return h+'</div>'}

// ===== 7. doGen10 ASYNC =====
window.doGen10=function(toolName,cost,isImg,isVid){
var fields={};
document.querySelectorAll('#toolPanel2 select[id^="f_"]').forEach(function(s){fields[s.id]=s.value});
document.querySelectorAll('#toolPanel2 input[id^="f_"]').forEach(function(i){if(i.value.trim())fields[i.id]=i.value.trim()});
document.querySelectorAll('#toolPanel2 textarea[id^="f_"]').forEach(function(t){if(t.value.trim())fields[t.id]=t.value.trim()});
var labels={'f_topic':'\u4e3b\u9898','f_breed':'\u54c1\u79cd','f_species':'\u7c7b\u578b','f_age':'\u9636\u6bb5','f_issue':'\u95ee\u9898','f_scene':'\u573a\u666f','f_platform':'\u5e73\u53f0','f_audience':'\u4eba\u7fa4','f_tone':'\u57fa\u8c03','f_content_type':'\u5185\u5bb9\u7c7b\u578b','f_target':'\u76ee\u6807','f_detail':'\u8981\u6c42','f_product':'\u5546\u54c1','f_goal':'\u76ee\u6807','f_subject':'\u5b66\u79d1','f_level':'\u5b66\u6bb5','f_purpose':'\u7528\u9014','f_role':'\u89d2\u8272','f_need':'\u9700\u6c42'};
var parts=[];Object.keys(fields).forEach(function(k){parts.push((labels[k]||k)+':'+fields[k])});
var sty=document.getElementById('f_style');if(sty)parts.push('\u98ce\u683c:'+sty.value);
var input=parts.join(' | ');if(!input){alert('\u8bf7\u81f3\u5c11\u586b\u5199\u4e00\u4e2a\u5b57\u6bb5');return}
var cur=_getCur();if(!cur){alert('\u8bf7\u5148\u767b\u5f55');openAuth('login');return}
var cr=_getCredits();if((cr[cur.username]||0)<cost){openCreditsShop();return}
var btn=document.getElementById('aiGenBtn'),st=document.getElementById('genStatus');
btn.disabled=true;btn.textContent='\u23f3 \u5904\u7406\u4e2d...';btn.style.opacity='0.7';
cr[cur.username]=(cr[cur.username]||0)-cost;localStorage.setItem('lsjy3_credits',JSON.stringify(cr));_updateCreditsUI();
var model=isImg?'doubao-seedream-5-0-260128':'doubao-seed-2-0-pro-260215';
var body=isImg?{model:model,messages:[{role:'user',content:input}],size:'1024x1024'}:{model:model,messages:[{role:'system',content:'\u4f60\u662f\u4e13\u4e1a\u7684\u300c'+toolName+'\u300d\u52a9\u624b\u3002\u76f4\u63a5\u8f93\u51fa\u7ed3\u679c\u3002'},{role:'user',content:input}],max_tokens:2000,temperature:0.7};
fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer ark-21eb820a-93fc-4379-bbc4-217498f7753b-a6876'},body:JSON.stringify(body)})
.then(function(r){return r.json()})
.then(function(data){
btn.disabled=false;btn.textContent=isImg||isVid?'\ud83d\ude80 \u63d0\u4ea4\u751f\u6210':'\ud83d\ude80 AI \u751f\u6210';btn.style.opacity='1';
if(data.error){st.style.display='block';st.innerHTML='<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px;color:#dc2626;font-size:13px">\u274c \u5931\u8d25: '+data.error.message+'</div>';cr[cur.username]=(cr[cur.username]||0)+cost;localStorage.setItem('lsjy3_credits',JSON.stringify(cr));_updateCreditsUI();return}
if(isImg||isVid){
var url=data.data&&data.data[0]&&data.data[0].url||'';_addMedia({type:isImg?'image':'video',tool:toolName,input:input,url:url});
st.style.display='block';st.innerHTML='<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px;color:#16a34a;font-size:13px">\u2705 \u751f\u6210\u5b8c\u6210\uff01\u5df2\u4fdd\u5b58\u5230'+(isImg?'\u56fe\u6587\u5e93':'\u89c6\u9891\u5e93')+'<br><a href="javascript:void(0)" onclick="openMediaLib()" style="color:#2563eb;text-decoration:underline">\u67e5\u770b</a></div>';
}else{
var txt=data.choices[0].message.content;_addMedia({type:'text',tool:toolName,input:input,content:txt});
document.getElementById('aiResultText').textContent=txt;document.getElementById('aiResult').style.display='block';
st.style.display='block';st.innerHTML='<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:12px;color:#16a34a;font-size:13px">\u2705 \u751f\u6210\u6210\u529f\uff01</div>';
}
})
.catch(function(e){btn.disabled=false;btn.textContent='\ud83d\ude80 AI \u751f\u6210';btn.style.opacity='1';st.style.display='block';st.innerHTML='<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px;color:#dc2626;font-size:13px">\u274c \u7f51\u7edc\u9519\u8bef</div>';cr[cur.username]=(cr[cur.username]||0)+cost;localStorage.setItem('lsjy3_credits',JSON.stringify(cr));_updateCreditsUI()});
};

// ===== 8. CREDITS SHOP =====
var _PLANS=[
{id:'starter',name:'\u5165\u95e8\u5957\u9910',credits:500,price:9.9,badge:'\u70ed\u5356',desc:'\u8bd5\u7528205\u5de5\u5177',color:'#3b82f6'},
{id:'basic',name:'\u57fa\u7840\u5957\u9910',credits:2000,price:29.9,badge:'\u63a8\u8350',desc:'\u65e5\u5e38\u5185\u5bb9\u521b\u4f5c',color:'#8b5cf6'},
{id:'pro',name:'\u4e13\u4e1a\u5957\u9910',credits:5000,price:49.9,badge:'\u6027\u4ef7\u6bd4',desc:'\u521b\u4f5c\u8005\u9996\u9009',color:'#f59e0b'},
{id:'enterprise',name:'\u4f01\u4e1a\u5957\u9910',credits:20000,price:149.9,badge:'\u6700\u4f73',desc:'\u56e2\u961f\u5145\u8db3\u7528\u91cf',color:'#ef4444'},
{id:'ultimate',name:'\u65e0\u9650\u5957\u9910',credits:99999,price:399.9,badge:'VIP',desc:'\u5168\u5de5\u5177+\u4f18\u5148\u4f53\u9a8c',color:'#1a1a1a'}
];
window.openCreditsShop=function(){
var sc=document.getElementById('shopContent');if(!sc)return;var cur=_getCur();
sc.innerHTML='<div style="text-align:center;margin-bottom:24px"><div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#fbbf24,#f59e0b);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:24px">\u26a1</div><h3 style="margin:0;color:#1a1a1a;font-size:20px;font-weight:700">\u7b97\u529b\u4e2d\u5fc3</h3><p style="margin:4px 0 0;color:#888;font-size:13px">\u5f53\u524d\u7b97\u529b\uff1a<b style="color:#f59e0b;font-size:18px">'+(cur?_getUserCredits():0)+'</b></p></div><div style="display:grid;gap:12px">';
_PLANS.forEach(function(p){sc.innerHTML+='<div style="border:2px solid '+(p.badge==='\u63a8\u8350'?'var(--p)':'#e5e7eb')+';border-radius:14px;padding:16px;position:relative;cursor:pointer;transition:box-shadow .2s" onmouseover="this.style.boxShadow=\'0 4px 12px rgba(0,0,0,0.1)\'" onmouseout="this.style.boxShadow=\'none\'" onclick="buyPlan(\''+p.id+'\')">'+(p.badge?'<span style="position:absolute;top:-8px;right:12px;background:'+p.color+';color:#fff;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600">'+p.badge+'</span>':'')+'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-size:15px;font-weight:700;color:#1a1a1a">'+p.name+'</span><span style="font-size:20px;font-weight:800;color:'+p.color+'">\xa5'+p.price+'</span></div><div style="font-size:13px;color:#6b7280;margin-bottom:4px">'+p.desc+'</div><div style="display:flex;align-items:center;gap:4px"><span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:8px;font-size:12px;font-weight:600">\u26a1 '+p.credits+' \u7b97\u529b</span></div></div>'});
sc.innerHTML+='</div><p style="text-align:center;margin-top:16px;font-size:12px;color:#9ca3af">\u5fae\u4fe1 / \u652f\u4ed8\u5b9d / QQ\u94b1\u5305 \u00b7 \u5373\u4e70\u5373\u5230\u8d26</p>';
document.getElementById('creditsShopModal').style.display='flex';
};
window.buyPlan=function(id){
var p=_PLANS.find(function(x){return x.id===id});if(!p)return;var cur=_getCur();if(!cur){alert('\u8bf7\u5148\u767b\u5f55');openAuth('login');return}
if(confirm('\u8d2d\u4e70 '+p.name+'\uff08'+p.credits+'\u7b97\u529b\uff09\n\n\u4ef7\u683c\uff1a\xa5'+p.price+'\n\n\u652f\u4ed8\u5f00\u53d1\u4e2d\uff0c\u6682\u514d\u8d39\u8d60\u9001\uff01')){
var cr=_getCredits();cr[cur.username]=(cr[cur.username]||0)+p.credits;localStorage.setItem('lsjy3_credits',JSON.stringify(cr));_updateCreditsUI();
alert('\u606d\u559c\uff01\u83b7\u5f97 '+p.credits+' \u7b97\u529b');openCreditsShop();}
};

// ===== 9. MEDIA LIBRARY =====
window.openMediaLib=function(type){
var mc=document.getElementById('mediaContent');if(!mc)return;var lib=_getMediaLib();
var f=type?lib.filter(function(m){return m.type===type||m.type==='text'}):lib;
mc.innerHTML='<div style="text-align:center;margin-bottom:20px"><h3 style="margin:0;color:#1a1a1a;font-size:20px;font-weight:700">\ud83d\udcda \u4f5c\u54c1\u5e93</h3><p style="margin:4px 0 0;color:#888;font-size:13px">\u5171 '+lib.length+' \u4e2a\u4f5c\u54c1</p></div>';
mc.innerHTML+='<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">';
mc.innerHTML+='<button onclick="openMediaLib()" style="padding:6px 14px;border-radius:20px;font-size:12px;border:1px solid #e5e7eb;background:'+( !type?'var(--p)':'#fff')+';color:'+( !type?'#fff':'#666')+';cursor:pointer">\u5168\u90e8</button>';
mc.innerHTML+='<button onclick="openMediaLib(\'text\')" style="padding:6px 14px;border-radius:20px;font-size:12px;border:1px solid #e5e7eb;background:'+(type==='text'?'var(--p)':'#fff')+';color:'+(type==='text'?'#fff':'#666')+';cursor:pointer">\ud83d\udcdd \u56fe\u6587</button>';
mc.innerHTML+='<button onclick="openMediaLib(\'image\')" style="padding:6px 14px;border-radius:20px;font-size:12px;border:1px solid #e5e7eb;background:'+(type==='image'?'var(--p)':'#fff')+';color:'+(type==='image'?'#fff':'#666')+';cursor:pointer">\ud83d\udcbc \u56fe\u7247</button>';
mc.innerHTML+='<button onclick="openMediaLib(\'video\')" style="padding:6px 14px;border-radius:20px;font-size:12px;border:1px solid #e5e7eb;background:'+(type==='video'?'var(--p)':'#fff')+';color:'+(type==='video'?'#fff':'#666')+';cursor:pointer">\ud83c\udfac \u89c6\u9891</button>';
mc.innerHTML+='</div>';
if(f.length===0){mc.innerHTML+='<div style="text-align:center;padding:40px;color:#9ca3af;font-size:14px">\u6682\u65e0\u4f5c\u54c1\uff0c\u5f00\u59cb\u4f7f\u7528\u5de5\u5177\u521b\u4f5c\u5427\uff01</div>';document.getElementById('mediaLibModal').style.display='flex';return}
mc.innerHTML+='<div style="display:grid;gap:12px">';
f.forEach(function(item,i){
var icon=item.type==='image'?'\ud83d\udcbc':item.type==='video'?'\ud83c\udfac':'\ud83d\udcdd';
mc.innerHTML+='<div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px;cursor:default"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-weight:600;font-size:14px;color:#1a1a1a">'+icon+' '+item.tool+'</span><span style="font-size:11px;color:#9ca3af">'+item.time+'</span></div>';
if(item.type==='text'&&item.content){mc.innerHTML+='<div style="background:#f8f9fa;border-radius:8px;padding:10px;font-size:13px;color:#333;max-height:80px;overflow:hidden;white-space:pre-wrap;line-height:1.6">'+item.content.substring(0,200)+(item.content.length>200?'...':'')+'</div>'}
else if(item.url){mc.innerHTML+='<div style="text-align:center"><img src="'+item.url+'" style="max-width:100%;border-radius:8px;max-height:120px;object-fit:cover" onerror="this.style.display=\'none\'"></div>'}
mc.innerHTML+='</div>';
});
mc.innerHTML+='</div>';
document.getElementById('mediaLibModal').style.display='flex';
};

// ===== 10. AUTH SYSTEM =====
window.openAuth=function(mode){
var ac=document.getElementById('authContent2');if(!ac)return;var isL=mode==='login';
ac.innerHTML='<div style="text-align:center;margin-bottom:24px"><div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#e53e3e,#c53030);margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff">'+(isL?'\ud83d\udd11':'\u270d\ufe0f')+'</div><h3 style="margin:0;color:#1a1a1a;font-size:20px;font-weight:700">'+(isL?'\u6b22\u8fce\u56de\u6765':'\u521b\u5efa\u8d26\u53f7')+'</h3></div>'
+(isL?'':'<div style="margin-bottom:14px"><label style="display:block;font-size:13px;color:#555;margin-bottom:5px;font-weight:600">\ud83c\udfa8 \u6635\u79f0</label><input id="ar_name" type="text" placeholder="\u60a8\u7684\u663e\u793a\u540d\u79f0" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box"></div>'
+'<div style="margin-bottom:14px"><label style="display:block;font-size:13px;color:#555;margin-bottom:5px;font-weight:600">\ud83d\udcf7 \u5934\u50cf</label><div style="display:flex;align-items:center;gap:12px"><div id="regAvatar" style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#e53e3e,#c53030);display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;flex-shrink:0;cursor:pointer" onclick="document.getElementById(\'avatarInput\').click()">\ud83d\udc64</div><div><input id="avatarInput" type="file" accept="image/*" style="display:none" onchange="handleAvatar(this)"><p style="font-size:12px;color:#999;margin:0">\u70b9\u51fb\u9009\u62e9\u5934\u50cf</p></div></div></div>')
+'<div style="margin-bottom:14px"><label style="display:block;font-size:13px;color:#555;margin-bottom:5px;font-weight:600">\ud83d\udccb \u8d26\u53f7</label><input id="au" type="text" placeholder="\u8bf7\u8f93\u5165\u8d26\u53f7" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box"></div>'
+'<div style="margin-bottom:20px"><label style="display:block;font-size:13px;color:#555;margin-bottom:5px;font-weight:600">\ud83d\udd12 \u5bc6\u7801</label><input id="ap" type="password" placeholder="\u8bf7\u8f93\u5165\u5bc6\u7801" style="width:100%;padding:10px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;box-sizing:border-box"></div>'
+'<button id="authBtn" style="width:100%;padding:13px;background:linear-gradient(135deg,#e53e3e,#c53030);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer">'+(isL?'\u767b \u5f55':'\u6ce8 \u518c')+'</button>'
+'<p style="text-align:center;margin-top:14px;font-size:13px;color:#888">'+(isL?'\u6ca1\u6709\u8d26\u53f7\uff1f<a href="javascript:void(0)" id="authSwitch" style="color:var(--p);font-weight:600">\u7acb\u5373\u6ce8\u518c</a>':'\u5df2\u6709\u8d26\u53f7\uff1f<a href="javascript:void(0)" id="authSwitch" style="color:var(--p);font-weight:600">\u7acb\u5373\u767b\u5f55</a>')+'</p>';
document.getElementById('authBtn').onclick=function(){_doAuth10(mode)};
document.getElementById('authSwitch').onclick=function(){openAuth(isL?'register':'login')};
document.getElementById('authModal2').style.display='flex';
};
window.handleAvatar=function(inp){if(inp.files&&inp.files[0]){var r=new FileReader();r.onload=function(e){var a=document.getElementById('regAvatar');if(a){a.innerHTML='<img src="'+e.target.result+'" style="width:100%;height:100%;border-radius:50%;object-fit:cover">';a._custom=true}};r.readAsDataURL(inp.files[0])}};
window.doAuth=function(mode){_doAuth10(mode)};
function _doAuth10(mode){
var u=document.getElementById('au').value.trim(),p=document.getElementById('ap').value.trim();if(!u||!p){alert('\u586b\u5199\u8d26\u53f7\u548c\u5bc6\u7801');return}
var users=JSON.parse(localStorage.getItem('lsjy3_users')||'[]');
if(mode==='register'){if(users.find(function(x){return x.username===u})){alert('\u8d26\u53f7\u5df2\u5b58\u5728');return}
var dn=document.getElementById('ar_name')?document.getElementById('ar_name').value.trim():u;
users.push({username:u,password:btoa(p),role:'user',display:dn});localStorage.setItem('lsjy3_users',JSON.stringify(users));
var cr=_getCredits();if(!cr[u])cr[u]=100;localStorage.setItem('lsjy3_credits',JSON.stringify(cr));
alert('\u6ce8\u518c\u6210\u529f\uff01\u8d60\u9001100\u7b97\u529b');openAuth('login');return}
var found=users.find(function(x){return x.username===u});if(!found){alert('\u8d26\u53f7\u4e0d\u5b58\u5728\uff0c\u8bf7\u5148\u6ce8\u518c');return}
if(atob(found.password)!==p){alert('\u5bc6\u7801\u9519\u8bef');return}
localStorage.setItem('lsjy3_cur',JSON.stringify({username:found.username,role:found.role||'user',display:found.display||found.username}));
document.getElementById('authModal2').style.display='none';_updateNav();_updateCreditsUI();
}
function _updateNav(){
var cur=_getCur(),lr=document.getElementById('navLoginBtn'),nr=document.getElementById('navRight');
if(cur){var dn=cur.display||cur.username;if(lr){lr.textContent=dn;lr.style.cssText='padding:6px 16px;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#78350f;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer';lr.onclick=function(){if(confirm('\u786e\u5b9a\u9000\u51fa\uff1f')){localStorage.removeItem('lsjy3_cur');_updateNav();_updateCreditsUI()}}}
var nc=document.getElementById('navCredits');if(!nc&&nr){var cd=document.createElement('div');cd.id='navCredits';cd.style.cssText='display:inline-flex;align-items:center;gap:4px;padding:6px 14px;background:linear-gradient(135deg,#dbeafe,#bfdbfe);color:#1e40af;border-radius:8px;font-size:12px;font-weight:700;margin-right:8px;cursor:pointer';cd.innerHTML='\u26a1 <span id="creditDisplay">'+_getUserCredits()+'</span> \u7b97\u529b';cd.onclick=function(){openCreditsShop()};nr.insertBefore(cd,nr.firstChild)}else if(nc){document.getElementById('creditDisplay').textContent=_getUserCredits()}}
else{if(lr){lr.textContent='\u767b\u5f55 / \u6ce8\u518c';lr.style.cssText='';lr.onclick=function(){openAuth('login')}}var nc=document.getElementById('navCredits');if(nc)nc.style.display='none'}
window.updateNavUI=_updateNav;window.doLogout=function(){localStorage.removeItem('lsjy3_cur');_updateNav();_updateCreditsUI()};
}

// ===== 11. EVENTS =====
var si=document.querySelector('input[placeholder*="\u641c\u7d22"]');if(si&&!si._v10){si.addEventListener('input',function(){searchTools(this.value)});si._v10=true}
document.querySelectorAll('#toolCats button,.tool-cat-btn').forEach(function(b){if(!b._v10){b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();filterToolCat(this.textContent.trim())});b._v10=true}});
var _bt=function(el){if(!el||el._v10)return;el.addEventListener('click',function(e){var c=e.target.closest('.tool-card');if(c){e.preventDefault();e.stopPropagation();var t=c.getAttribute('data-name')||'';if(t)openTool(t)}});el._v10=true};
_bt(document.getElementById('tools'));_bt(document.querySelector('.tools-grid'));
var lb=document.getElementById('navLoginBtn');if(lb&&!lb._v10){lb.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();if(_getCur()){if(confirm('\u786e\u5b9a\u9000\u51fa\uff1f')){localStorage.removeItem('lsjy3_cur');_updateNav();_updateCreditsUI()}}else{openAuth('login')}});lb._v10=true}

// ===== 12. FIXES =====
(function(){var ph=document.querySelectorAll('a[href="tel:18890000368"]');ph.forEach(function(a){a.outerHTML='<div class="btn" style="background:#fff;color:var(--n);border-radius:12px;cursor:default;padding:12px 24px">\ud83d\udce7 contact@lsjy.com</div>'})})();
(function(){var ci=document.querySelector('.contact-info');if(ci&&!ci.querySelector('.cv-website')){ci.innerHTML+='<div class="contact-item"><span class="ci">\ud83c\udf10</span><span class="cv cv-website">www.lsjy-app.com</span></div><div class="contact-item"><span class="ci">\u23f0</span><span class="cv">\u5de5\u4f5c\u65e5 9:00-18:00</span></div>'}})();
(function(){var g=document.getElementById('pricingGrid');if(g&&!g.innerHTML.trim()){try{if(typeof renderPricing==='function')renderPricing()}catch(e){}}})();
(function(){var al=document.querySelector('a[href="admin/"]');if(al)al.style.display='none'})();
_updateNav();_updateCreditsUI();window._v10Applied=true;
console.log('[v10] All systems loaded. Tools:'+document.querySelectorAll('.tool-card').length);
} catch(e) { console.error('[v10] Error:', e); }
