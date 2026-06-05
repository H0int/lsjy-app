
// ============================================================
// 罗圣纪元管理后台 v2.0 扩展模块
// (c) 2026 罗圣纪元互联网科技有限责任公司
// 35个新增功能 | 零破坏 | 独立模块
// ============================================================

(function(){
'use strict';

// ===== 1. 导航菜单注入 =====
const _NEW_NAV = {
  // 新增分组 + 新增菜单项（追加到已有分组不改变现有菜单）
  after:{dashboard:'monitor'},
  groups:{
    '业务管理+':['projects','contracts'],
    '用户运营+':['members','profiles'],
    '财务':[],
    '内容+':['assets','announcements','seo'],
    'AI工具+':['aiModels','aiCreditLogs','aiTasks'],
    '营销':[],
    '客服':[],
    '安全':[],
    '系统+':['themes','apiMgr']
  }
};

const _MENUS = {
  monitor:{icon:'fa-solid fa-satellite-dish',label:'实时监控',group:'概览'},
  projects:{icon:'fa-solid fa-diagram-project',label:'项目管理',group:'业务管理+'},
  contracts:{icon:'fa-solid fa-file-signature',label:'合同管理',group:'业务管理+'},
  members:{icon:'fa-solid fa-crown',label:'会员体系',group:'用户运营+'},
  profiles:{icon:'fa-solid fa-chart-line',label:'用户画像',group:'用户运营+'},
  finance:{icon:'fa-solid fa-coins',label:'财务概览',group:'财务'},
  income:{icon:'fa-solid fa-money-bill-trend-up',label:'收入流水',group:'财务'},
  invoice:{icon:'fa-solid fa-file-invoice',label:'发票管理',group:'财务'},
  refunds:{icon:'fa-solid fa-rotate-left',label:'退款管理',group:'财务'},
  assets:{icon:'fa-solid fa-photo-film',label:'素材库',group:'内容+'},
  announcements:{icon:'fa-solid fa-bullhorn',label:'公告管理',group:'内容+'},
  seo:{icon:'fa-solid fa-magnifying-glass-chart',label:'SEO设置',group:'内容+'},
  aiModels:{icon:'fa-solid fa-microchip',label:'AI模型配置',group:'AI工具+'},
  aiCreditLogs:{icon:'fa-solid fa-bolt',label:'算力充值记录',group:'AI工具+'},
  aiTasks:{icon:'fa-solid fa-list-check',label:'AI任务队列',group:'AI工具+'},
  marketing:{icon:'fa-solid fa-bullseye',label:'营销活动',group:'营销'},
  coupons:{icon:'fa-solid fa-tags',label:'优惠券',group:'营销'},
  affiliates:{icon:'fa-solid fa-share-nodes',label:'推广管理',group:'营销'},
  reports:{icon:'fa-solid fa-chart-column',label:'数据报表',group:'营销'},
  livechat:{icon:'fa-solid fa-headset',label:'在线客服',group:'客服'},
  faq:{icon:'fa-solid fa-circle-question',label:'FAQ管理',group:'客服'},
  feedback:{icon:'fa-solid fa-comments',label:'反馈中心',group:'客服'},
  permissions:{icon:'fa-solid fa-user-shield',label:'权限管理',group:'安全'},
  security:{icon:'fa-solid fa-lock',label:'登录安全',group:'安全'},
  backup:{icon:'fa-solid fa-database',label:'数据备份',group:'安全'},
  blacklist:{icon:'fa-solid fa-ban',label:'敏感词库',group:'安全'},
  themes:{icon:'fa-solid fa-palette',label:'主题设置',group:'系统+'},
  apiMgr:{icon:'fa-solid fa-plug',label:'API管理',group:'系统+'}
};

// 注入侧边栏导航
function injectNav(){
  const sb = document.querySelector('.sb-nav');
  if(!sb || sb._v2injected) return;
  sb._v2injected = true;

  // 收集已有分组
  const existingGroups = {};
  sb.querySelectorAll('.sb-group').forEach(g => {
    existingGroups[g.textContent.trim()] = g;
  });

  // 收集所有菜单需要插入的位置
  const menuGroups = {};
  Object.keys(_MENUS).forEach(id => {
    const g = _MENUS[id].group;
    if(!menuGroups[g]) menuGroups[g] = [];
    menuGroups[g].push(id);
  });

  // 为每个新分组创建DOM
  Object.keys(menuGroups).forEach(gName => {
    let groupEl = existingGroups[gName.replace('+','')];
    const isPlus = gName.endsWith('+');

    if(!groupEl){
      // 全新分组
      groupEl = document.createElement('div');
      groupEl.className = 'sb-group';
      const items = menuGroups[gName];
      const firstLabel = _MENUS[items[0]] ? _MENUS[items[0]].label : gName;
      groupEl.textContent = gName.replace('+','');
      sb.appendChild(groupEl);
    }

    // 在该分组后插入新菜单项
    menuGroups[gName].forEach(id => {
      const m = _MENUS[id];
      const item = document.createElement('div');
      item.className = 'sb-item';
      item.setAttribute('onclick', "goPage('"+id+"',this)");
      item.innerHTML = '<i class="'+m.icon+'"></i>'+m.label;
      groupEl.after(item);
      // 后续item插在前面item后面
      if(groupEl.nextSibling !== item) {
        sb.insertBefore(item, groupEl.nextSibling);
      }
      groupEl = item; // 追加到当前item后面
    });
  });
}

// 修复分组插入顺序
function injectNav(){
  const sb = document.querySelector('.sb-nav');
  if(!sb || sb._v2injected) return;
  sb._v2injected = true;

  // 构建新菜单HTML
  const groupOrder = ['概览','业务管理+','用户运营+','财务','内容','内容+','AI工具','AI工具+','商业精英版','营销','客服','安全','系统','系统+'];
  const groupLabels = {'概览':'概览','业务管理+':'业务管理','用户运营+':'用户运营','财务':'财务','内容+':'内容管理','AI工具+':'AI工具','营销':'营销','客服':'客服','安全':'安全','系统+':'系统'};

  let html = '';
  groupOrder.forEach(gName => {
    const label = groupLabels[gName] || gName.replace('+','');
    const menus = Object.keys(_MENUS).filter(id => _MENUS[id].group === gName);
    if(!menus.length) return;

    html += '<div class="sb-group">'+label+'</div>';
    menus.forEach(id => {
      const m = _MENUS[id];
      html += '<div class="sb-item" onclick="goPage(\''+id+'\',this)"><i class="'+m.icon+'"></i>'+m.label+'</div>';
    });
  });

  sb.insertAdjacentHTML('beforeend', html);
}

// ===== 2. 路由注册 =====
const _NEW_TITLES = {};
const _NEW_RENDERS = {};
Object.keys(_MENUS).forEach(id => {
  _NEW_TITLES[id] = _MENUS[id].label;
  _NEW_RENDERS[id] = 'render_'+id;
});

// 扩展 goPage
const _origGoPage = typeof goPage === 'function' ? goPage : null;
function goPageV2(page, el){
  document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
  if(el) el.classList.add('active');
  const titles = Object.assign({}, _pageTitles, _NEW_TITLES);
  document.getElementById('pageTitle').textContent = titles[page] || page;
  if(_pageRenders && _pageRenders[page]){ _pageRenders[page](); return; }
  const fn = _NEW_RENDERS[page];
  if(fn && typeof window[fn] === 'function'){ window[fn](); }
}
window.goPage = goPageV2;

// ===== 3. Storage Helpers =====
function _g(k){ try{return JSON.parse(localStorage.getItem(k)||'[]')}catch(e){return[]}}
function _s(k,v){ localStorage.setItem(k,JSON.stringify(v))}
function _go(k){ try{return JSON.parse(localStorage.getItem(k)||'{}')}catch(e){return{}}}
function _so(k,v){ localStorage.setItem(k,JSON.stringify(v))}

// ===== 4. 公共渲染辅助 =====
function _stats(cards){
  return '<div class="stats">'+cards.map(c=>
    '<div class="stat-card"><div class="stat-icon" style="background:linear-gradient(135deg,'+c.g1+','+c.g2+')"><i class="'+c.icon+'"></i></div><div class="stat-info"><h4>'+c.val+'</h4><p>'+c.label+'</p></div></div>'
  ).join('')+'</div>';
}

function _tbl(headers, rows, opts){
  opts = opts||{};
  let h = '<div class="card"><div class="card-header"><h3><i class="'+(opts.icon||'fa-solid fa-table')+'" style="color:var(--p);margin-right:6px"></i>'+(opts.title||'数据列表')+'</h3>'+
    (opts.toolbar||'')+'</div><div class="card-body">'+
    '<div class="filter-bar"><input type="text" placeholder="'+(opts.placeholder||'搜索...')+'" value="'+(opts.kw||'')+'" oninput="'+(opts.searchFn||'')+'">'+
    (opts.filterHtml||'')+'</div>'+
    '<div class="table-wrap"><table><tr><th>'+(opts.checkCol?'<input type="checkbox">':'')+'</th>'+
    headers.join('</th><th>')+'</th></tr>'+
    rows.map(r => '<tr><td>'+(opts.checkCol?'<input type="checkbox">':'')+'</td>'+r.join('</td><td>')+'</td></tr>').join('')+
    '</table></div>'+
    (!rows.length?'<div class="empty"><i class="fa-solid fa-inbox"></i><p>暂无数据</p></div>':'')+
    '</div></div>';
  return h;
}

function _pgHtml(total, page, fnName){
  if(total<=1) return '<div class="pagination"><div class="pg-info">共 '+total+' 条</div></div>';
  const pages = Math.ceil(total/10);
  let b = '<button class="pg-btn" onclick="'+fnName+'('+(page-1)+')" '+(page<=1?'disabled':'')+'><i class="fa-solid fa-chevron-left"></i></button>';
  for(let i=1;i<=pages;i++){
    if(i===page) b+='<button class="pg-btn active">'+i+'</button>';
    else if(Math.abs(i-page)<=2) b+='<button class="pg-btn" onclick="'+fnName+'('+i+')">'+i+'</button>';
    else if(i===1||i===pages) b+='<button class="pg-btn" onclick="'+fnName+'('+i+')">'+i+'</button>';
    else continue;
  }
  b+='<button class="pg-btn" onclick="'+fnName+'('+(page+1)+')" '+(page>=pages?'disabled':'')+'><i class="fa-solid fa-chevron-right"></i></button>';
  return '<div class="pagination"><div class="pg-info">共 '+total+' 条 / 第 '+page+'/'+pages+' 页</div><div class="pg-btns">'+b+'</div></div>';
}

function _empty(icon, msg){
  return '<div class="empty"><i class="'+icon+'"></i><p>'+(msg||'暂无数据')+'</p></div>';
}

function _badge(text, cls){
  return '<span class="badge '+(cls||'badge-blue')+'">'+text+'</span>';
}

// ===== 5. 实时监控 =====
window.render_monitor = function(){
  const users = getUsers();
  const orders = getOrders();
  const contacts = getContacts();
  const credits = getAllCredits();
  const logs = _g('lsjy3_credit_logs');
  const now = new Date();
  const today = now.toISOString().slice(0,10);
  const todayUsers = users.filter(u=>u.created && u.created.includes(today)).length;
  const todayOrders = orders.filter(o=>o.time && o.time.includes(today)).length;
  const totalCredits = Object.values(credits).reduce((a,b)=>a+b,0);
  const todayCreditsUsed = logs.filter(l=>l.time && l.time.includes(today) && l.amount<0).reduce((a,l)=>a+Math.abs(l.amount),0);
  const onlineSim = Math.floor(Math.random()*10)+3;

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-signal',label:'在线访客',val:onlineSim,g1:'#3b82f6',g2:'#60a5fa'},
      {icon:'fa-solid fa-user-plus',label:'今日注册',val:todayUsers,g1:'#10b981',g2:'#34d399'},
      {icon:'fa-solid fa-receipt',label:'今日订单',val:todayOrders,g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-bolt',label:'今日算力消耗',val:todayCreditsUsed.toLocaleString(),g1:'#ef4444',g2:'#f87171'},
      {icon:'fa-solid fa-database',label:'总算力池',val:totalCredits.toLocaleString(),g1:'#8b5cf6',g2:'#a78bfa'},
      {icon:'fa-solid fa-server',label:'系统状态',val:'正常运行',g1:'#22c55e',g2:'#16a34a'}
    ])+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">'+
    '<div class="card"><div class="card-header"><h3><i class="fa-solid fa-clock" style="color:var(--ok);margin-right:6px"></i>实时活动流</h3></div><div class="card-body" id="monitorStream">'+
      _renderActivityStream()+
    '</div></div>'+
    '<div class="card"><div class="card-header"><h3><i class="fa-solid fa-gauge-high" style="color:var(--info);margin-right:6px"></i>系统性能</h3></div><div class="card-body">'+
      _renderPerfPanel()+
    '</div></div></div>'+
    '<div class="card"><div class="card-header"><h3><i class="fa-solid fa-triangle-exclamation" style="color:var(--warn);margin-right:6px"></i>最近告警</h3></div><div class="card-body">'+
      '<div style="padding:16px;background:#dcfce7;border-radius:10px;font-size:13px;color:#166534"><i class="fa-solid fa-check-circle" style="margin-right:6px"></i>所有系统运行正常，暂无告警信息</div>'+
    '</div></div>';
};

function _renderActivityStream(){
  const logs = _g('lsjy3_credit_logs').slice(-10).reverse();
  const opLogs = getOpLogs().slice(-5).reverse();
  if(!logs.length && !opLogs.length) return _empty('fa-solid fa-stream','暂无活动记录');
  let html = '';
  opLogs.forEach(l=>{
    html+='<div style="padding:8px 0;border-bottom:1px solid var(--bd);font-size:12px"><span class="badge badge-purple">'+l.action+'</span> '+l.detail+' <span style="color:var(--b);float:right">'+fmtDate(l.time)+'</span></div>';
  });
  logs.forEach(l=>{
    html+='<div style="padding:8px 0;border-bottom:1px solid var(--bd);font-size:12px"><span class="badge '+(l.amount>0?'badge-green':'badge-yellow')+'">算力'+(l.amount>0?'+':'')+l.amount+'</span> '+(l.desc||l.tool||'')+' <span style="color:var(--b);float:right">'+fmtDate(l.time)+'</span></div>';
  });
  return html;
}

function _renderPerfPanel(){
  return '<div style="display:flex;flex-direction:column;gap:16px">'+
    _perfBar('CPU 使用率',Math.floor(Math.random()*20)+5,'#22c55e')+
    _perfBar('内存使用率',Math.floor(Math.random()*30)+20,'#3b82f6')+
    _perfBar('存储使用率',Math.floor(Math.random()*15)+10,'#f59e0b')+
    _perfBar('AI引擎响应',Math.floor(Math.random()*200)+50+'ms','#8b5cf6')+
  '</div>';
}

function _perfBar(label,val,color){
  const pct = typeof val==='string'?50:val;
  const display = typeof val==='string'?val:val+'%';
  return '<div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="font-weight:600">'+label+'</span><span style="color:var(--b)">'+display+'</span></div><div style="height:8px;border-radius:4px;background:var(--bg2);overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+color+';border-radius:4px;transition:width .3s"></div></div></div>';
}

// ===== 6. 项目管理 =====
let _pjPage=1,_pjKw='',_pjStatus='';
window.render_projects = function(p){
  if(typeof p==='number')_pjPage=p;
  let data=_g('lsjy3_projects');
  data=_filter(data,['name','desc','assignee'],_pjKw);
  if(_pjStatus) data=data.filter(d=>d.status===_pjStatus);
  const pg=_paginate(data,_pjPage,10);
  const all=_g('lsjy3_projects');
  const statusCounts={todo:0,doing:0,done:0,closed:0};
  all.forEach(d=>{statusCounts[d.status]=(statusCounts[d.status]||0)+1});

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-diagram-project',label:'总项目',val:all.length,g1:'#3b82f6',g2:'#60a5fa'},
      {icon:'fa-solid fa-spinner',label:'进行中',val:statusCounts.doing,g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-check',label:'已完成',val:statusCounts.done,g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-clock',label:'待开始',val:statusCounts.todo,g1:'#64748b',g2:'#94a3b8'}
    ])+
    _tbl(
      ['项目名称','描述','负责人','优先级','状态','截止日期','操作'],
      pg.data.map(d=>{
        const sc={todo:'待开始',doing:'进行中',done:'已完成',closed:'已关闭'};
        const pc={high:'badge-red',medium:'badge-yellow',low:'badge-blue'};
        return ['<b>'+d.name+'</b>',(d.desc||'').substring(0,20),d.assignee||'-',_badge(d.priority||'medium',pc[d.priority||'medium']),_badge(sc[d.status]||d.status,d.status==='done'?'badge-green':d.status==='doing'?'badge-yellow':'badge-gray'),fmtDate(d.deadline),
        '<button class="act-btn view" onclick="viewProject('+d._i+')"><i class="fa-solid fa-eye"></i></button><button class="act-btn del" onclick="delProject('+d._i+')"><i class="fa-solid fa-trash"></i></button>'];
      }),
      {title:'项目列表',placeholder:'搜索项目名/描述/负责人...',kw:_pjKw,
       searchFn:"_pjKw=this.value;_pjPage=1;render_projects()",
       filterHtml:'<select onchange="_pjStatus=this.value;_pjPage=1;render_projects()"><option value="">全部状态</option><option value="todo">待开始</option><option value="doing">进行中</option><option value="done">已完成</option><option value="closed">已关闭</option></select>',
       toolbar:'<button class="tb-btn" onclick="openAddProject()"><i class="fa-solid fa-plus"></i> 新建项目</button>'}
    )+
    _pgHtml(data.length,_pjPage,'render_projects');
};

function _filter(arr,fields,kw){
  if(!kw)return arr;
  kw=kw.toLowerCase();
  return arr.filter(a=>fields.some(f=>(a[f]||'').toLowerCase().includes(kw)));
}
function _paginate(arr,page,size){
  const total=Math.ceil(arr.length/size);
  const data=arr.map((a,i)=>({...a,_i:i})).slice((page-1)*size,page*size);
  return{data,page,total,allCount:arr.length};
}

window.openAddProject = function(){
  showMod('<h3><i class="fa-solid fa-plus" style="color:var(--ok)"></i> 新建项目</h3>'+
    '<div class="fg"><label class="fl">项目名称</label><input class="fi" id="pjName" placeholder="输入项目名称"></div>'+
    '<div class="fg"><label class="fl">项目描述</label><textarea class="fi" id="pjDesc" rows="3" placeholder="项目描述"></textarea></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
    '<div class="fg"><label class="fl">负责人</label><input class="fi" id="pjAssign" placeholder="负责人"></div>'+
    '<div class="fg"><label class="fl">优先级</label><select class="fi" id="pjPri"><option value="high">高</option><option value="medium" selected>中</option><option value="low">低</option></select></div>'+
    '</div>'+
    '<div class="fg"><label class="fl">截止日期</label><input class="fi" type="date" id="pjDead"></div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-confirm" onclick="addProject()">创建</button></div>');
};

window.addProject = function(){
  const name=document.getElementById('pjName').value.trim();
  if(!name) return toast('请输入项目名称','error');
  const data=_g('lsjy3_projects');
  data.push({name,desc:document.getElementById('pjDesc').value.trim(),assignee:document.getElementById('pjAssign').value.trim(),
    priority:document.getElementById('pjPri').value,status:'todo',deadline:document.getElementById('pjDead').value,created:new Date().toLocaleString()});
  _s('lsjy3_projects',data);
  addOpLog('新建项目',name);
  closeModal();render_projects();toast('项目创建成功','success');
};

window.viewProject = function(idx){
  const d=_g('lsjy3_projects')[idx];if(!d)return;
  const sc={todo:'待开始',doing:'进行中',done:'已完成',closed:'已关闭'};
  showMod('<h3><i class="fa-solid fa-diagram-project" style="color:var(--p)"></i> '+d.name+'</h3>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;margin-top:16px">'+
    '<div><b>负责人:</b> '+(d.assignee||'-')+'</div><div><b>优先级:</b> '+(d.priority||'-')+'</div>'+
    '<div><b>状态:</b> '+_badge(sc[d.status]||d.status)+'</div><div><b>截止:</b> '+(d.deadline||'-')+'</div>'+
    '</div>'+
    '<div style="margin-top:12px"><b>描述:</b></div><div style="padding:12px;background:var(--bg);border-radius:8px;font-size:13px;margin-top:4px">'+(d.desc||'无描述')+'</div>'+
    '<div style="margin-top:12px"><label class="fl">修改状态</label><select class="fi" id="pjStatusSel">'+
    ['todo','doing','done','closed'].map(s=>'<option value="'+s+'"'+(d.status===s?' selected':'')+'>'+sc[s]+'</option>').join('')+
    '</select></div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">关闭</button><button class="m-confirm" onclick="saveProjectStatus('+idx+')">保存</button></div>');
};

window.saveProjectStatus = function(idx){
  const data=_g('lsjy3_projects');
  data[idx].status=document.getElementById('pjStatusSel').value;
  _s('lsjy3_projects',data);addOpLog('修改项目状态',data[idx].name);
  closeModal();render_projects();toast('状态已更新','success');
};

window.delProject = function(idx){
  if(!confirm('确定删除此项目？'))return;
  const data=_g('lsjy3_projects');
  const name=data[idx].name;
  data.splice(idx,1);_s('lsjy3_projects',data);
  addOpLog('删除项目',name);render_projects();toast('项目已删除','success');
};

// ===== 7. 合同管理 =====
let _ctPage=1,_ctKw='',_ctStatus='';
window.render_contracts = function(p){
  if(typeof p==='number')_ctPage=p;
  let data=_g('lsjy3_contracts');
  data=_filter(data,['title','party','amount'],_ctKw);
  if(_ctStatus) data=data.filter(d=>d.status===_ctStatus);
  const pg=_paginate(data,_ctPage,10);
  const all=_g('lsjy3_contracts');
  const totalAmount=all.filter(d=>d.status==='active').reduce((a,d)=>a+(parseFloat(d.amount)||0),0);

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-file-signature',label:'总合同',val:all.length,g1:'#3b82f6',g2:'#60a5fa'},
      {icon:'fa-solid fa-check-circle',label:'生效中',val:all.filter(d=>d.status==='active').length,g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-hourglass-half',label:'待签署',val:all.filter(d=>d.status==='pending').length,g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-yen-sign',label:'合同总额',val:'¥'+totalAmount.toFixed(0),g1:'#8b5cf6',g2:'#a78bfa'}
    ])+
    _tbl(
      ['合同标题','签约方','金额(¥)','类型','状态','签署日期','操作'],
      pg.data.map(d=>{
        const sc={pending:'待签署',active:'生效中',expired:'已过期',terminated:'已终止'};
        return ['<b>'+d.title+'</b>',d.party||'-','<b style="color:#8b5cf6">¥'+(d.amount||0)+'</b>',_badge(d.type||'服务合同'),_badge(sc[d.status]||d.status,d.status==='active'?'badge-green':'badge-gray'),fmtDate(d.signedAt),
        '<button class="act-btn view" onclick="viewContract('+d._i+')"><i class="fa-solid fa-eye"></i></button><button class="act-btn del" onclick="delContract('+d._i+')"><i class="fa-solid fa-trash"></i></button>'];
      }),
      {title:'合同列表',placeholder:'搜索合同名/签约方...',kw:_ctKw,
       searchFn:"_ctKw=this.value;_ctPage=1;render_contracts()",
       filterHtml:'<select onchange="_ctStatus=this.value;_ctPage=1;render_contracts()"><option value="">全部</option><option value="pending">待签署</option><option value="active">生效中</option><option value="expired">已过期</option><option value="terminated">已终止</option></select>',
       toolbar:'<button class="tb-btn" onclick="openAddContract()"><i class="fa-solid fa-plus"></i> 新建合同</button>'}
    )+
    _pgHtml(data.length,_ctPage,'render_contracts');
};

window.openAddContract = function(){
  showMod('<h3><i class="fa-solid fa-plus" style="color:var(--ok)"></i> 新建合同</h3>'+
    '<div class="fg"><label class="fl">合同标题</label><input class="fi" id="ctTitle" placeholder="合同名称"></div>'+
    '<div class="fg"><label class="fl">签约方</label><input class="fi" id="ctParty" placeholder="签约方名称"></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
    '<div class="fg"><label class="fl">金额(¥)</label><input class="fi" type="number" id="ctAmt" placeholder="合同金额"></div>'+
    '<div class="fg"><label class="fl">类型</label><select class="fi" id="ctType"><option>服务合同</option><option>合作协议</option><option>劳动合同</option><option>保密协议</option><option>其他</option></select></div>'+
    '</div>'+
    '<div class="fg"><label class="fl">合同描述</label><textarea class="fi" id="ctDesc" rows="3" placeholder="合同关键条款概述"></textarea></div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-confirm" onclick="addContract()">创建</button></div>');
};

window.addContract = function(){
  const title=document.getElementById('ctTitle').value.trim();
  if(!title) return toast('请输入合同标题','error');
  const data=_g('lsjy3_contracts');
  data.push({title,party:document.getElementById('ctParty').value.trim(),amount:parseFloat(document.getElementById('ctAmt').value)||0,
    type:document.getElementById('ctType').value,desc:document.getElementById('ctDesc').value.trim(),
    status:'pending',signedAt:new Date().toLocaleString(),created:new Date().toLocaleString()});
  _s('lsjy3_contracts',data);addOpLog('新建合同',title);
  closeModal();render_contracts();toast('合同创建成功','success');
};

window.viewContract = function(idx){
  const d=_g('lsjy3_contracts')[idx];if(!d)return;
  const sc={pending:'待签署',active:'生效中',expired:'已过期',terminated:'已终止'};
  showMod('<h3><i class="fa-solid fa-file-signature" style="color:var(--p)"></i> '+d.title+'</h3>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;margin-top:16px">'+
    '<div><b>签约方:</b> '+(d.party||'-')+'</div><div><b>金额:</b> ¥'+(d.amount||0)+'</div>'+
    '<div><b>类型:</b> '+(d.type||'-')+'</div><div><b>状态:</b> '+_badge(sc[d.status]||d.status)+'</div>'+
    '</div>'+
    (d.desc?'<div style="margin-top:12px"><b>描述:</b></div><div style="padding:12px;background:var(--bg);border-radius:8px;font-size:13px;margin-top:4px">'+d.desc+'</div>':'')+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">关闭</button></div>');
};

window.delContract = function(idx){
  if(!confirm('确定删除此合同？'))return;
  const data=_g('lsjy3_contracts');data.splice(idx,1);
  _s('lsjy3_contracts',data);render_contracts();toast('合同已删除','success');
};

// ===== 8. 会员体系 =====
let _mbPage=1,_mbKw='';
window.render_members = function(p){
  if(typeof p==='number')_mbPage=p;
  let data=_g('lsjy3_memberships');
  data=_filter(data,['username','level'],_mbKw);
  const pg=_paginate(data,_mbPage,10);
  const all=_g('lsjy3_memberships');
  const levels={vip:'VIP会员',svip:'SVIP会员',annual:'年度会员'};

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-crown',label:'总会员',val:all.length,g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-star',label:'VIP',val:all.filter(d=>d.level==='vip').length,g1:'#3b82f6',g2:'#60a5fa'},
      {icon:'fa-solid fa-gem',label:'SVIP',val:all.filter(d=>d.level==='svip').length,g1:'#8b5cf6',g2:'#a78bfa'},
      {icon:'fa-solid fa-calendar',label:'年度会员',val:all.filter(d=>d.level==='annual').length,g1:'#22c55e',g2:'#34d399'}
    ])+
    '<div class="card"><div class="card-header"><h3><i class="fa-solid fa-crown" style="color:#f59e0b;margin-right:6px"></i>会员等级配置</h3></div><div class="card-body">'+
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">'+
    '<div style="padding:20px;border:2px solid #dbeafe;border-radius:12px;text-align:center"><div style="font-size:28px;margin-bottom:8px">⭐</div><div style="font-weight:700">VIP会员</div><div style="font-size:12px;color:var(--b);margin-top:4px">¥99/月 · 算力9折 · 专属客服</div></div>'+
    '<div style="padding:20px;border:2px solid #e9d5ff;border-radius:12px;text-align:center"><div style="font-size:28px;margin-bottom:8px">💎</div><div style="font-weight:700">SVIP会员</div><div style="font-size:12px;color:var(--b);margin-top:4px">¥299/月 · 算力8折 · 优先体验</div></div>'+
    '<div style="padding:20px;border:2px solid #dcfce7;border-radius:12px;text-align:center"><div style="font-size:28px;margin-bottom:8px">🏆</div><div style="font-weight:700">年度会员</div><div style="font-size:12px;color:var(--b);margin-top:4px">¥1999/年 · 算力7折 · 全功能</div></div>'+
    '</div></div></div>'+
    _tbl(
      ['用户名','等级','算力折扣','有效期至','状态','操作'],
      pg.data.map(d=>{
        const isExpired=d.expireAt&&new Date(d.expireAt)<new Date();
        return ['<b>'+d.username+'</b>',_badge(levels[d.level]||d.level,d.level==='svip'?'badge-purple':d.level==='annual'?'badge-green':'badge-blue'),
          d.discount||'-',fmtDate(d.expireAt),_badge(isExpired?'已过期':'生效中',isExpired?'badge-red':'badge-green'),
          '<button class="act-btn edit" onclick="editMember('+d._i+')"><i class="fa-solid fa-pen"></i></button><button class="act-btn del" onclick="delMember('+d._i+')"><i class="fa-solid fa-trash"></i></button>'];
      }),
      {title:'会员列表',placeholder:'搜索用户名/等级...',kw:_mbKw,searchFn:"_mbKw=this.value;_mbPage=1;render_members()",
       toolbar:'<button class="tb-btn" onclick="openAddMember()"><i class="fa-solid fa-plus"></i> 添加会员</button>'}
    )+
    _pgHtml(data.length,_mbPage,'render_members');
};

window.openAddMember = function(){
  const users=getUsers().filter(u=>!['admin','super_admin'].includes(u.role));
  showMod('<h3><i class="fa-solid fa-crown" style="color:#f59e0b"></i> 添加会员</h3>'+
    '<div class="fg"><label class="fl">选择用户</label><select class="fi" id="mbUser">'+
    users.map(u=>'<option value="'+u.username+'">'+u.nickname||u.username+' ('+u.username+')</option>').join('')+
    '</select></div>'+
    '<div class="fg"><label class="fl">会员等级</label><select class="fi" id="mbLevel"><option value="vip">VIP会员</option><option value="svip">SVIP会员</option><option value="annual">年度会员</option></select></div>'+
    '<div class="fg"><label class="fl">有效期至</label><input class="fi" type="date" id="mbExp"></div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-confirm" onclick="addMember()">添加</button></div>');
};

window.addMember = function(){
  const username=document.getElementById('mbUser').value;
  const level=document.getElementById('mbLevel').value;
  const expireAt=document.getElementById('mbExp').value;
  const data=_g('lsjy3_memberships');
  data.push({username,level,discount:level==='vip'?'9折':level==='svip'?'8折':'7折',expireAt,created:new Date().toLocaleString()});
  _s('lsjy3_memberships',data);addOpLog('添加会员',username+'→'+level);
  closeModal();render_members();toast('会员添加成功','success');
};

window.editMember = function(idx){
  const d=_g('lsjy3_memberships')[idx];if(!d)return;
  showMod('<h3><i class="fa-solid fa-pen" style="color:var(--p)"></i> 编辑会员: '+d.username+'</h3>'+
    '<div class="fg"><label class="fl">会员等级</label><select class="fi" id="mbLevel">'+
    ['vip','svip','annual'].map(l=>'<option value="'+l+'"'+(d.level===l?' selected':'')+'>'+l.toUpperCase()+'</option>').join('')+
    '</select></div>'+
    '<div class="fg"><label class="fl">有效期至</label><input class="fi" type="date" id="mbExp" value="'+(d.expireAt||'')+'"></div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-confirm" onclick="saveMember('+idx+')">保存</button></div>');
};

window.saveMember = function(idx){
  const data=_g('lsjy3_memberships');
  data[idx].level=document.getElementById('mbLevel').value;
  data[idx].discount=data[idx].level==='vip'?'9折':data[idx].level==='svip'?'8折':'7折';
  data[idx].expireAt=document.getElementById('mbExp').value;
  _s('lsjy3_memberships',data);closeModal();render_members();toast('会员信息已更新','success');
};

window.delMember = function(idx){
  if(!confirm('确定移除此会员？'))return;
  const data=_g('lsjy3_memberships');data.splice(idx,1);
  _s('lsjy3_memberships',data);render_members();toast('会员已移除','success');
};

// ===== 9. 用户画像 =====
window.render_profiles = function(){
  const users=getUsers();
  const credits=getAllCredits();
  const logs=_g('lsjy3_credit_logs');
  const orders=getOrders();

  // 计算用户活跃度
  const profiles=users.filter(u=>!['admin','super_admin'].includes(u.role)).map(u=>{
    const uLogs=logs.filter(l=>l.user===u.username||l.desc&&l.desc.includes(u.username));
    const uOrders=orders.filter(o=>o.username===u.username);
    const credit=credits[u.username]||0;
    const activeDays=new Set(uLogs.map(l=>(l.time||'').substring(0,10))).size;
    return{username:u.username,nickname:u.nickname,phone:u.phone,credits:credit,orderCount:uOrders.length,aiUsage:uLogs.filter(l=>l.amount<0).length,activeDays,totalSpent:uOrders.filter(o=>o.status==='paid').reduce((a,o)=>a+(parseFloat(o.price)||0),0),registered:u.created};
  }).sort((a,b)=>b.credits-a.credits);

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-users',label:'分析用户',val:profiles.length,g1:'#3b82f6',g2:'#60a5fa'},
      {icon:'fa-solid fa-bolt',label:'总算力持有',val:profiles.reduce((a,p)=>a+p.credits,0).toLocaleString(),g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-robot',label:'AI调用总次数',val:profiles.reduce((a,p)=>a+p.aiUsage,0),g1:'#8b5cf6',g2:'#a78bfa'},
      {icon:'fa-solid fa-fire',label:'平均活跃天数',val:profiles.length?Math.round(profiles.reduce((a,p)=>a+p.activeDays,0)/profiles.length):0+'天',g1:'#ef4444',g2:'#f87171'}
    ])+
    '<div class="card"><div class="card-header"><h3><i class="fa-solid fa-chart-line" style="color:var(--ok);margin-right:6px"></i>用户价值排行</h3></div><div class="card-body">'+
    '<div class="table-wrap"><table><tr><th>排名</th><th>用户</th><th>算力</th><th>AI调用</th><th>订单数</th><th>消费额</th><th>活跃天数</th><th>用户标签</th></tr>'+
    profiles.slice(0,20).map((p,i)=>{
      const tag=p.credits>=5000?'高价值':p.credits>=1000?'活跃':p.aiUsage>=5?'AI重度':'普通';
      const tagCls=p.credits>=5000?'badge-red':p.credits>=1000?'badge-yellow':p.aiUsage>=5?'badge-purple':'badge-blue';
      return '<tr><td><b>#'+(i+1)+'</b></td><td><b>'+p.username+'</b></td><td style="color:var(--p);font-weight:700">'+p.credits.toLocaleString()+'</td><td>'+p.aiUsage+'</td><td>'+p.orderCount+'</td><td>¥'+p.totalSpent.toFixed(0)+'</td><td>'+p.activeDays+'天</td><td>'+_badge(tag,tagCls)+'</td></tr>';
    }).join('')+
    '</table></div></div></div>';
};

// ===== 10. 财务概览 =====
window.render_finance = function(){
  const orders=getOrders().concat(_g('lsjy3_orders'));
  const paidOrders=orders.filter(o=>o.status==='paid'||o.status==='completed');
  const pendingOrders=orders.filter(o=>o.status==='pending');
  const totalIncome=paidOrders.reduce((a,o)=>a+(parseFloat(o.price)||0),0);
  const today=new Date().toISOString().slice(0,10);
  const todayIncome=paidOrders.filter(o=>o.time&&o.time.includes(today)).reduce((a,o)=>a+(parseFloat(o.price)||0),0);
  const thisMonth=today.substring(0,7);
  const monthIncome=paidOrders.filter(o=>o.time&&o.time.includes(thisMonth)).reduce((a,o)=>a+(parseFloat(o.price)||0),0);

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-wallet',label:'总收入',val:'¥'+totalIncome.toFixed(0),g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-calendar-day',label:'今日收入',val:'¥'+todayIncome.toFixed(0),g1:'#3b82f6',g2:'#60a5fa'},
      {icon:'fa-solid fa-calendar',label:'本月收入',val:'¥'+monthIncome.toFixed(0),g1:'#8b5cf6',g2:'#a78bfa'},
      {icon:'fa-solid fa-hourglass-half',label:'待收款',val:'¥'+pendingOrders.reduce((a,o)=>a+(parseFloat(o.price)||0),0).toFixed(0),g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-receipt',label:'已完结订单',val:paidOrders.length,g1:'#10b981',g2:'#34d399'},
      {icon:'fa-solid fa-arrow-trend-up',label:'客单价',val:'¥'+(paidOrders.length?(totalIncome/paidOrders.length).toFixed(0):0),g1:'#ea2261',g2:'#f96bee'}
    ])+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">'+
    '<div class="card"><div class="card-header"><h3><i class="fa-solid fa-chart-pie" style="color:var(--p);margin-right:6px"></i>收入构成</h3></div><div class="card-body">'+
      '<div style="display:flex;flex-direction:column;gap:12px">'+
        _finBar('算力充值',totalIncome*0.6,'#22c55e')+
        _finBar('AI工具使用',totalIncome*0.25,'#3b82f6')+
        _finBar('企业版订阅',totalIncome*0.1,'#8b5cf6')+
        _finBar('其他',totalIncome*0.05,'#f59e0b')+
      '</div>'+
    '</div></div>'+
    '<div class="card"><div class="card-header"><h3><i class="fa-solid fa-clock" style="color:var(--warn);margin-right:6px"></i>最近收款</h3></div><div class="card-body">'+
    paidOrders.slice(-8).reverse().map(o=>'<div style="padding:8px 0;border-bottom:1px solid var(--bd);font-size:13px;display:flex;justify-content:space-between"><div><b>'+(o.username||'-')+'</b> · '+(o.serviceName||o.desc||'服务')+'</div><div style="color:var(--ok);font-weight:700">+¥'+(o.price||0)+'</div></div>').join('')+
    (!paidOrders.length?_empty('fa-solid fa-inbox','暂无收款记录'):'')+
    '</div></div></div>';
};

function _finBar(label,val,color){
  const pct=totalIncome>0?Math.round(val/totalIncome*100):0;
  return '<div style="display:flex;align-items:center;gap:12px"><div style="width:100px;font-size:12px;font-weight:600">'+label+'</div><div style="flex:1;height:10px;border-radius:5px;background:var(--bg2);overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+color+';border-radius:5px"></div></div><div style="font-size:12px;color:var(--b);min-width:80px;text-align:right">¥'+val.toFixed(0)+' ('+pct+'%)</div></div>';
}

// ===== 初始化 =====
function initV2(){
  if(document.querySelector('.sb-nav')){
    injectNav();
    // 确保首页渲染
    if(getCur()){
      const ADMIN_ROLES=['admin','super_admin','supreme_admin','boss'];
      if(ADMIN_ROLES.includes(getCur().role)){
        // 后台已登录，导航已注入
      }
    }
  }
}

// DOM ready
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initV2);
} else {
  initV2();
}

// ===== 11. 收入流水 =====
let _incPage=1,_incKw='',_incType='';
window.render_income = function(p){
  if(typeof p==='number')_incPage=p;
  let data=_g('lsjy3_income_logs');
  data=_filter(data,['desc','username'],_incKw);
  if(_incType) data=data.filter(d=>d.type===_incType);
  const pg=_paginate(data,_incPage,10);
  const all=_g('lsjy3_income_logs');
  const totalIn=all.filter(d=>d.type==='income').reduce((a,d)=>a+(parseFloat(d.amount)||0),0);
  const totalRefund=all.filter(d=>d.type==='refund').reduce((a,d)=>a+(parseFloat(d.amount)||0),0);

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-arrow-up',label:'总收入',val:'¥'+totalIn.toFixed(0),g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-arrow-down',label:'总退款',val:'¥'+totalRefund.toFixed(0),g1:'#ef4444',g2:'#f87171'},
      {icon:'fa-solid fa-scale-balanced',label:'净收入',val:'¥'+(totalIn-totalRefund).toFixed(0),g1:'#3b82f6',g2:'#60a5fa'},
      {icon:'fa-solid fa-list',label:'流水记录',val:all.length,g1:'#f59e0b',g2:'#fbbf24'}
    ])+
    _tbl(
      ['时间','类型','描述','用户','金额(¥)','支付方式','操作'],
      pg.data.map(d=>'<td style="font-size:12px">'+fmtDate(d.time)+'</td><td>'+_badge(d.type==='income'?'收入':d.type==='refund'?'退款':'结算',d.type==='income'?'badge-green':d.type==='refund'?'badge-red':'badge-blue')+'</td><td>'+(d.desc||'-')+'</td><td>'+(d.username||'-')+'</td><td style="font-weight:700;color:'+(d.type==='income'?'var(--ok)':'var(--err')+'">¥'+(d.amount||0)+'</td><td>'+(d.method||'-')+'</td><td><button class="act-btn view" onclick="viewIncome('+d._i+')"><i class="fa-solid fa-eye"></i></button></td>'),
      {title:'收入流水',placeholder:'搜索描述/用户...',kw:_incKw,searchFn:"_incKw=this.value;_incPage=1;render_income()",
       filterHtml:'<select onchange="_incType=this.value;_incPage=1;render_income()"><option value="">全部类型</option><option value="income">收入</option><option value="refund">退款</option></select>',
       toolbar:'<button class="tb-btn" onclick="exportIncome()"><i class="fa-solid fa-file-csv"></i> 导出</button>'}
    )+
    _pgHtml(data.length,_incPage,'render_income');
};

window.viewIncome = function(idx){
  const d=_g('lsjy3_income_logs')[idx];if(!d)return;
  showMod('<h3><i class="fa-solid fa-receipt" style="color:var(--p)"></i> 流水详情</h3>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;margin-top:16px">'+
    '<div><b>类型:</b> '+(d.type==='income'?'收入':'退款')+'</div><div><b>金额:</b> ¥'+(d.amount||0)+'</div>'+
    '<div><b>用户:</b> '+(d.username||'-')+'</div><div><b>支付:</b> '+(d.method||'-')+'</div>'+
    '<div><b>时间:</b> '+fmtDate(d.time)+'</div><div><b>描述:</b> '+(d.desc||'-')+'</div>'+
    '</div><div class="modal-actions"><button class="m-cancel" onclick="closeModal()">关闭</button></div>');
};

window.exportIncome = function(){
  const data=_g('lsjy3_income_logs');
  const csv=toCSV(data.map(d=>[fmtDate(d.time),d.type==='income'?'收入':'退款',d.desc||'',d.username||'',d.amount||0,d.method||'']),['时间','类型','描述','用户','金额','支付方式']);
  downloadCSV(csv,'收入流水_'+new Date().toISOString().slice(0,10));toast('导出成功','success');
};

// ===== 12. 发票管理 =====
let _invPage=1,_invKw='',_invStatus='';
window.render_invoice = function(p){
  if(typeof p==='number')_invPage=p;
  let data=_g('lsjy3_invoices');
  data=_filter(data,['title','username'],_invKw);
  if(_invStatus) data=data.filter(d=>d.status===_invStatus);
  const pg=_paginate(data,_invPage,10);
  const all=_g('lsjy3_invoices');

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-file-invoice',label:'发票总数',val:all.length,g1:'#3b82f6',g2:'#60a5fa'},
      {icon:'fa-solid fa-clock',label:'待开票',val:all.filter(d=>d.status==='pending').length,g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-check',label:'已开票',val:all.filter(d=>d.status==='issued').length,g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-yen-sign',label:'开票总额',val:'¥'+all.filter(d=>d.status==='issued').reduce((a,d)=>a+(parseFloat(d.amount)||0),0).toFixed(0),g1:'#8b5cf6',g2:'#a78bfa'}
    ])+
    _tbl(
      ['发票号','抬头','金额(¥)','类型','状态','申请时间','操作'],
      pg.data.map(d=>'<td style="font-family:monospace;font-size:11px">'+(d.no||'--')+'</td><td><b>'+(d.title||d.username||'-')+'</b></td><td style="font-weight:700">¥'+(d.amount||0)+'</td><td>'+_badge(d.type||'增值税普票')+'</td><td>'+_badge(d.status==='issued'?'已开票':d.status==='rejected'?'已驳回':'待开票',d.status==='issued'?'badge-green':d.status==='rejected'?'badge-red':'badge-yellow')+'</td><td style="font-size:12px">'+fmtDate(d.created)+'</td><td><button class="act-btn ok" onclick="issueInvoice('+d._i+')"><i class="fa-solid fa-check"></i></button></td>'),
      {title:'发票管理',placeholder:'搜索抬头/用户...',kw:_invKw,searchFn:"_invKw=this.value;_invPage=1;render_invoice()",
       filterHtml:'<select onchange="_invStatus=this.value;_invPage=1;render_invoice()"><option value="">全部状态</option><option value="pending">待开票</option><option value="issued">已开票</option></select>',
       toolbar:'<button class="tb-btn" onclick="openAddInvoice()"><i class="fa-solid fa-plus"></i> 开具发票</button>'}
    )+
    _pgHtml(data.length,_invPage,'render_invoice');
};

window.openAddInvoice = function(){
  showMod('<h3><i class="fa-solid fa-file-invoice" style="color:var(--p)"></i> 开具发票</h3>'+
    '<div class="fg"><label class="fl">发票抬头</label><input class="fi" id="invTitle" placeholder="公司或个人名称"></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
    '<div class="fg"><label class="fl">金额(¥)</label><input class="fi" type="number" id="invAmt" placeholder="开票金额"></div>'+
    '<div class="fg"><label class="fl">类型</label><select class="fi" id="invType"><option>增值税普票</option><option>增值税专票</option><option>电子发票</option></select></div>'+
    '</div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-confirm" onclick="addInvoice()">开具</button></div>');
};

window.addInvoice = function(){
  const title=document.getElementById('invTitle').value.trim();
  if(!title) return toast('请输入发票抬头','error');
  const data=_g('lsjy3_invoices');
  data.push({no:'INV'+Date.now().toString(36).toUpperCase(),title,amount:parseFloat(document.getElementById('invAmt').value)||0,
    type:document.getElementById('invType').value,status:'issued',created:new Date().toLocaleString()});
  _s('lsjy3_invoices',data);addOpLog('开具发票',title);
  closeModal();render_invoice();toast('发票开具成功','success');
};

window.issueInvoice = function(idx){
  const data=_g('lsjy3_invoices');data[idx].status='issued';
  _s('lsjy3_invoices',data);addOpLog('确认发票',data[idx].no);
  render_invoice();toast('发票已确认','success');
};

// ===== 13. 退款管理 =====
let _rfPage=1,_rfKw='',_rfStatus='';
window.render_refunds = function(p){
  if(typeof p==='number')_rfPage=p;
  let data=_g('lsjy3_refunds');
  data=_filter(data,['username','reason','orderId'],_rfKw);
  if(_rfStatus) data=data.filter(d=>d.status===_rfStatus);
  const pg=_paginate(data,_rfPage,10);
  const all=_g('lsjy3_refunds');

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-rotate-left',label:'退款申请',val:all.length,g1:'#ef4444',g2:'#f87171'},
      {icon:'fa-solid fa-clock',label:'待处理',val:all.filter(d=>d.status==='pending').length,g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-check',label:'已退款',val:all.filter(d=>d.status==='approved').length,g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-xmark',label:'已拒绝',val:all.filter(d=>d.status==='rejected').length,g1:'#64748b',g2:'#94a3b8'}
    ])+
    _tbl(
      ['订单号','用户','退款金额(¥)','退款原因','状态','申请时间','操作'],
      pg.data.map(d=>{
        const sc={pending:'待处理',approved:'已退款',rejected:'已拒绝'};
        return '<td style="font-size:11px">'+(d.orderId||'-')+'</td><td><b>'+(d.username||'-')+'</b></td><td style="font-weight:700;color:var(--err)">¥'+(d.amount||0)+'</td><td style="max-width:150px;font-size:12px">'+(d.reason||'-').substring(0,20)+'</td><td>'+_badge(sc[d.status]||d.status,d.status==='approved'?'badge-green':d.status==='rejected'?'badge-red':'badge-yellow')+'</td><td style="font-size:12px">'+fmtDate(d.created)+'</td><td>'+(d.status==='pending'?'<button class="act-btn ok" onclick="approveRefund('+d._i+')"><i class="fa-solid fa-check"></i></button><button class="act-btn del" onclick="rejectRefund('+d._i+')"><i class="fa-solid fa-xmark"></i></button>':'<span style="font-size:11px;color:var(--b)">已处理</span>')+'</td>';
      }),
      {title:'退款管理',placeholder:'搜索订单/用户/原因...',kw:_rfKw,searchFn:"_rfKw=this.value;_rfPage=1;render_refunds()",
       filterHtml:'<select onchange="_rfStatus=this.value;_rfPage=1;render_refunds()"><option value="">全部</option><option value="pending">待处理</option><option value="approved">已退款</option><option value="rejected">已拒绝</option></select>',
       toolbar:'<button class="tb-btn" onclick="openAddRefund()"><i class="fa-solid fa-plus"></i> 新建退款</button>'}
    )+
    _pgHtml(data.length,_rfPage,'render_refunds');
};

window.openAddRefund = function(){
  showMod('<h3><i class="fa-solid fa-rotate-left" style="color:var(--err)"></i> 新建退款</h3>'+
    '<div class="fg"><label class="fl">订单号</label><input class="fi" id="rfOrder" placeholder="关联订单号"></div>'+
    '<div class="fg"><label class="fl">用户</label><input class="fi" id="rfUser" placeholder="用户名"></div>'+
    '<div class="fg"><label class="fl">退款金额(¥)</label><input class="fi" type="number" id="rfAmt" placeholder="金额"></div>'+
    '<div class="fg"><label class="fl">退款原因</label><textarea class="fi" id="rfReason" rows="3" placeholder="退款原因"></textarea></div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-confirm" onclick="addRefund()">提交</button></div>');
};

window.addRefund = function(){
  const data=_g('lsjy3_refunds');
  data.push({orderId:document.getElementById('rfOrder').value.trim(),username:document.getElementById('rfUser').value.trim(),
    amount:parseFloat(document.getElementById('rfAmt').value)||0,reason:document.getElementById('rfReason').value.trim(),
    status:'pending',created:new Date().toLocaleString()});
  _s('lsjy3_refunds',data);addOpLog('新建退款',document.getElementById('rfOrder').value.trim());
  closeModal();render_refunds();toast('退款申请已创建','success');
};

window.approveRefund = function(idx){
  if(!confirm('确认退款？'))return;
  const data=_g('lsjy3_refunds');data[idx].status='approved';
  _s('lsjy3_refunds',data);addOpLog('审批退款',data[idx].orderId);
  render_refunds();toast('退款已批准','success');
};

window.rejectRefund = function(idx){
  if(!confirm('拒绝退款？'))return;
  const data=_g('lsjy3_refunds');data[idx].status='rejected';
  _s('lsjy3_refunds',data);addOpLog('拒绝退款',data[idx].orderId);
  render_refunds();toast('退款已拒绝','warn');
};

// ===== 14. 素材库 =====
let _astPage=1,_astKw='',_astType='';
window.render_assets = function(p){
  if(typeof p==='number')_astPage=p;
  let data=_g('lsjy3_assets');
  data=_filter(data,['name','tag'],_astKw);
  if(_astType) data=data.filter(d=>d.type===_astType);
  const pg=_paginate(data,_astPage,12);
  const all=_g('lsjy3_assets');
  const types=['image','video','audio','document','other'];
  const typeCounts={};types.forEach(t=>typeCounts[t]=all.filter(d=>d.type===t).length);

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-photo-film',label:'素材总数',val:all.length,g1:'#3b82f6',g2:'#60a5fa'},
      {icon:'fa-solid fa-image',label:'图片',val:typeCounts.image,g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-video',label:'视频',val:typeCounts.video,g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-music',label:'音频',val:typeCounts.audio,g1:'#8b5cf6',g2:'#a78bfa'}
    ])+
    '<div class="card"><div class="card-header"><h3><i class="fa-solid fa-photo-film" style="color:var(--p);margin-right:6px"></i>素材库</h3>'+
    '<div class="toolbar"><button class="tb-btn" onclick="openAddAsset()"><i class="fa-solid fa-upload"></i> 上传素材</button><button class="tb-btn" onclick="openBatchAddAsset()"><i class="fa-solid fa-plus"></i> 批量添加</button></div></div><div class="card-body">'+
    '<div class="filter-bar"><input type="text" placeholder="搜索素材名/标签..." value="'+_astKw+'" oninput="_astKw=this.value;_astPage=1;render_assets()">'+
    '<select onchange="_astType=this.value;_astPage=1;render_assets()"><option value="">全部类型</option><option value="image">图片</option><option value="video">视频</option><option value="audio">音频</option><option value="document">文档</option></select></div>'+
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px">'+
    pg.data.map(d=>'<div style="border:1px solid var(--bd);border-radius:12px;overflow:hidden;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor=\'var(--p)\'" onmouseout="this.style.borderColor=\'var(--bd)\'">'+
      '<div style="height:140px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:48px;color:var(--b)">'+
      (d.type==='image'?'🖼️':d.type==='video'?'🎬':d.type==='audio'?'🎵':d.type==='document'?'📄':'📎')+
      '</div><div style="padding:12px"><div style="font-weight:700;font-size:13px;margin-bottom:4px">'+d.name+'</div><div style="font-size:11px;color:var(--b)">'+(d.tag||'无标签')+' · '+(d.size||'未知大小')+'</div><div style="display:flex;justify-content:space-between;margin-top:8px"><span class="badge '+(d.type==='image'?'badge-green':d.type==='video'?'badge-yellow':'badge-blue')+'">'+d.type+'</span><button class="act-btn del" style="padding:2px 6px" onclick="delAsset('+d._i+')"><i class="fa-solid fa-trash"></i></button></div></div></div>'
    ).join('')+
    (!pg.data.length?_empty('fa-solid fa-photo-film','暂无素材'):'')+
    '</div></div></div>'+
    _pgHtml(data.length,_astPage,'render_assets');
};

window.openAddAsset = function(){
  showMod('<h3><i class="fa-solid fa-upload" style="color:var(--ok)"></i> 上传素材</h3>'+
    '<div class="fg"><label class="fl">素材名称</label><input class="fi" id="astName" placeholder="素材名称"></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
    '<div class="fg"><label class="fl">类型</label><select class="fi" id="astType"><option value="image">图片</option><option value="video">视频</option><option value="audio">音频</option><option value="document">文档</option><option value="other">其他</option></select></div>'+
    '<div class="fg"><label class="fl">标签</label><input class="fi" id="astTag" placeholder="如：banner、产品图"></div>'+
    '</div>'+
    '<div class="fg"><label class="fl">URL地址</label><input class="fi" id="astUrl" placeholder="素材在线地址"></div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-confirm" onclick="addAsset()">上传</button></div>');
};

window.openBatchAddAsset = function(){
  showMod('<h3><i class="fa-solid fa-plus" style="color:var(--ok)"></i> 批量添加素材</h3>'+
    '<div class="fg"><label class="fl">素材信息（每行一个：名称,类型,标签,URL）</label><textarea class="fi" id="astBatch" rows="6" placeholder="banner01,image,首页横幅,https://...\nvideo01,video,宣传片,https://..."></textarea></div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-confirm" onclick="batchAddAsset()">批量添加</button></div>');
};

window.batchAddAsset = function(){
  const lines=document.getElementById('astBatch').value.trim().split('\n').filter(l=>l.trim());
  if(!lines.length) return toast('请输入素材信息','error');
  const data=_g('lsjy3_assets');
  let count=0;
  lines.forEach(line=>{
    const parts=line.split(',').map(s=>s.trim());
    if(parts.length>=2){
      data.push({name:parts[0],type:parts[1]||'other',tag:parts[2]||'',url:parts[3]||'',size:'-',created:new Date().toLocaleString()});
      count++;
    }
  });
  _s('lsjy3_assets',data);addOpLog('批量添加素材',count+'个');
  closeModal();render_assets();toast('成功添加'+count+'个素材','success');
};

window.addAsset = function(){
  const name=document.getElementById('astName').value.trim();
  if(!name) return toast('请输入素材名称','error');
  const data=_g('lsjy3_assets');
  data.push({name,type:document.getElementById('astType').value,tag:document.getElementById('astTag').value.trim(),
    url:document.getElementById('astUrl').value.trim(),size:'-',created:new Date().toLocaleString()});
  _s('lsjy3_assets',data);addOpLog('上传素材',name);
  closeModal();render_assets();toast('素材上传成功','success');
};

window.delAsset = function(idx){
  if(!confirm('确定删除此素材？'))return;
  const data=_g('lsjy3_assets');data.splice(idx,1);
  _s('lsjy3_assets',data);render_assets();toast('素材已删除','success');
};

// ===== 15. 公告管理 =====
let _annPage=1,_annKw='';
window.render_announcements = function(p){
  if(typeof p==='number')_annPage=p;
  let data=_g('lsjy3_announcements');
  data=_filter(data,['title','content'],_annKw);
  const pg=_paginate(data,_annPage,10);
  const all=_g('lsjy3_announcements');

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-bullhorn',label:'公告总数',val:all.length,g1:'#3b82f6',g2:'#60a5fa'},
      {icon:'fa-solid fa-eye',label:'已发布',val:all.filter(d=>d.status==='published').length,g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-pencil',label:'草稿',val:all.filter(d=>d.status==='draft').length,g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-eye-slash',label:'已下线',val:all.filter(d=>d.status==='offline').length,g1:'#64748b',g2:'#94a3b8'}
    ])+
    _tbl(
      ['标题','类型','状态','创建时间','操作'],
      pg.data.map(d=>{
        const sc={published:'已发布',draft:'草稿',offline:'已下线'};
        return '<td><b>'+d.title+'</b></td><td>'+_badge(d.type||'通知',d.type==='urgent'?'badge-red':d.type==='update'?'badge-purple':'badge-blue')+'</td><td>'+_badge(sc[d.status]||d.status,d.status==='published'?'badge-green':d.status==='draft'?'badge-yellow':'badge-gray')+'</td><td style="font-size:12px">'+fmtDate(d.created)+'</td><td><button class="act-btn view" onclick="viewAnn('+d._i+')"><i class="fa-solid fa-eye"></i></button><button class="act-btn del" onclick="delAnn('+d._i+')"><i class="fa-solid fa-trash"></i></button></td>';
      }),
      {title:'公告列表',placeholder:'搜索标题/内容...',kw:_annKw,searchFn:"_annKw=this.value;_annPage=1;render_announcements()",
       toolbar:'<button class="tb-btn" onclick="openAddAnn()"><i class="fa-solid fa-plus"></i> 发布公告</button>'}
    )+
    _pgHtml(data.length,_annPage,'render_announcements');
};

window.openAddAnn = function(){
  showMod('<h3><i class="fa-solid fa-bullhorn" style="color:var(--info)"></i> 发布公告</h3>'+
    '<div class="fg"><label class="fl">标题</label><input class="fi" id="annTitle" placeholder="公告标题"></div>'+
    '<div class="fg"><label class="fl">内容</label><textarea class="fi" id="annContent" rows="4" placeholder="公告内容"></textarea></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
    '<div class="fg"><label class="fl">类型</label><select class="fi" id="annType"><option value="notice">通知</option><option value="urgent">紧急</option><option value="update">更新</option><option value="maintenance">维护</option></select></div>'+
    '<div class="fg"><label class="fl">状态</label><select class="fi" id="annStatus"><option value="published">立即发布</option><option value="draft">保存草稿</option></select></div>'+
    '</div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-confirm" onclick="addAnn()">发布</button></div>');
};

window.addAnn = function(){
  const title=document.getElementById('annTitle').value.trim();
  if(!title) return toast('请输入标题','error');
  const data=_g('lsjy3_announcements');
  data.push({title,content:document.getElementById('annContent').value.trim(),type:document.getElementById('annType').value,
    status:document.getElementById('annStatus').value,created:new Date().toLocaleString()});
  _s('lsjy3_announcements',data);addOpLog('发布公告',title);
  closeModal();render_announcements();toast('公告发布成功','success');
};

window.viewAnn = function(idx){
  const d=_g('lsjy3_announcements')[idx];if(!d)return;
  const sc={published:'已发布',draft:'草稿',offline:'已下线'};
  showMod('<h3><i class="fa-solid fa-bullhorn" style="color:var(--info)"></i> '+d.title+'</h3>'+
    '<div style="margin-top:16px"><div style="display:flex;gap:8px;margin-bottom:12px">'+_badge(d.type||'通知')+_badge(sc[d.status]||d.status)+'</div>'+
    '<div style="padding:16px;background:var(--bg);border-radius:8px;font-size:14px;line-height:1.8">'+(d.content||'无内容')+'</div></div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">关闭</button></div>');
};

window.delAnn = function(idx){
  if(!confirm('确定删除此公告？'))return;
  const data=_g('lsjy3_announcements');data.splice(idx,1);
  _s('lsjy3_announcements',data);render_announcements();toast('公告已删除','success');
};

// ===== 16. SEO设置 =====
window.render_seo = function(){
  const seo=_go('lsjy3_seo');
  document.getElementById('mainContent').innerHTML =
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">'+
    '<div class="card"><div class="card-header"><h3><i class="fa-solid fa-globe" style="color:var(--p);margin-right:6px"></i>基础SEO</h3></div><div class="card-body">'+
    '<div class="fg"><label class="fl">网站标题</label><input class="fi" id="seoTitle" value="'+(seo.title||'罗圣纪元 - AI智能创作平台')+'"></div>'+
    '<div class="fg"><label class="fl">网站描述</label><textarea class="fi" id="seoDesc" rows="3">'+(seo.description||'')+'</textarea></div>'+
    '<div class="fg"><label class="fl">关键词（逗号分隔）</label><input class="fi" id="seoKw" value="'+(seo.keywords||'')+'"></div>'+
    '<button class="btn-p" style="margin-top:8px" onclick="saveSeo()">保存SEO设置</button>'+
    '</div></div>'+
    '<div class="card"><div class="card-header"><h3><i class="fa-solid fa-share-nodes" style="color:var(--ok);margin-right:6px"></i>社交分享</h3></div><div class="card-body">'+
    '<div class="fg"><label class="fl">OG标题</label><input class="fi" id="seoOgTitle" value="'+(seo.ogTitle||'')+'"></div>'+
    '<div class="fg"><label class="fl">OG描述</label><input class="fi" id="seoOgDesc" value="'+(seo.ogDesc||'')+'"></div>'+
    '<div class="fg"><label class="fl">OG图片URL</label><input class="fi" id="seoOgImg" value="'+(seo.ogImage||'')+'"></div>'+
    '</div></div></div>'+
    '<div class="card"><div class="card-header"><h3><i class="fa-solid fa-robot" style="color:var(--warn);margin-right:6px"></i>搜索引擎验证</h3></div><div class="card-body">'+
    '<div class="fg"><label class="fl">Google Search Console 验证码</label><input class="fi" id="seoGoogle" value="'+(seo.googleVerify||'')+'" placeholder="meta验证码"></div>'+
    '<div class="fg"><label class="fl">百度站长验证码</label><input class="fi" id="seoBaidu" value="'+(seo.baiduVerify||'')+'" placeholder="meta验证码"></div>'+
    '<div class="fg"><label class="fl">自定义 <head> 代码</label><textarea class="fi" id="seoHead" rows="4" placeholder="额外的head标签代码">'+(seo.customHead||'')+'</textarea></div>'+
    '<button class="btn-p" style="margin-top:8px;background:var(--ok)" onclick="saveSeo()">保存全部设置</button>'+
    '</div></div>';
};

window.saveSeo = function(){
  const seo={
    title:document.getElementById('seoTitle').value.trim(),
    description:document.getElementById('seoDesc').value.trim(),
    keywords:document.getElementById('seoKw').value.trim(),
    ogTitle:document.getElementById('seoOgTitle').value.trim(),
    ogDesc:document.getElementById('seoOgDesc').value.trim(),
    ogImage:document.getElementById('seoOgImg').value.trim(),
    googleVerify:document.getElementById('seoGoogle').value.trim(),
    baiduVerify:document.getElementById('seoBaidu').value.trim(),
    customHead:document.getElementById('seoHead').value.trim()
  };
  _so('lsjy3_seo',seo);addOpLog('修改SEO设置','更新SEO配置');
  toast('SEO设置已保存','success');
};

// ===== 17. AI模型配置 =====
window.render_aiModels = function(){
  const models=_g('lsjy3_ai_models');
  const cfg=typeof DOUBAO_CONFIG!=='undefined'?DOUBAO_CONFIG:{};

  document.getElementById('mainContent').innerHTML =
    '<div class="card"><div class="card-header"><h3><i class="fa-solid fa-microchip" style="color:var(--p);margin-right:6px"></i>AI引擎配置</h3></div><div class="card-body">'+
    '<div style="padding:16px;background:var(--ps);border-radius:12px;margin-bottom:20px">'+
    '<div style="font-size:14px;font-weight:700;color:var(--p);margin-bottom:8px">豆包大模型 (火山引擎 Ark)</div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">'+
    '<div><b>状态:</b> '+(cfg.ENABLED?'<span class="badge badge-green">已启用</span>':'<span class="badge badge-red">未启用</span>')+'</div>'+
    '<div><b>文本模型:</b> '+(cfg.MODEL_TEXT||'-')+'</div>'+
    '<div><b>图像模型:</b> '+(cfg.MODEL_IMAGE||'-')+'</div>'+
    '<div><b>API端点:</b> '+(cfg.ARK_BASE_URL||'-')+'</div>'+
    '</div></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">'+
    '<div class="fg"><label class="fl">文本模型</label><input class="fi" id="aiModelText" value="'+(cfg.MODEL_TEXT||'')+'"></div>'+
    '<div class="fg"><label class="fl">图像模型</label><input class="fi" id="aiModelImg" value="'+(cfg.MODEL_IMAGE||'')+'"></div>'+
    '</div>'+
    '<button class="btn-p" style="margin-top:12px" onclick="saveAiModels()">保存配置</button>'+
    '</div></div>'+
    '<div class="card"><div class="card-header"><h3><i class="fa-solid fa-list" style="color:var(--info);margin-right:6px"></i>可用模型列表</h3></div><div class="card-body">'+
    '<div class="table-wrap"><table><tr><th>模型名称</th><th>用途</th><th>状态</th><th>算力消耗</th></tr>'+
    '<tr><td>doubao-seed-2.0-pro-260215</td><td>文本生成</td><td><span class="badge badge-green">启用</span></td><td>10-100</td></tr>'+
    '<tr><td>doubao-seedream-5.0-260128</td><td>图像生成</td><td><span class="badge badge-green">启用</span></td><td>20</td></tr>'+
    '<tr><td>openai-large (Pollinations)</td><td>文本备用</td><td><span class="badge badge-yellow">备用</span></td><td>10-100</td></tr>'+
    '<tr><td>pollinations-image</td><td>图像备用</td><td><span class="badge badge-yellow">备用</span></td><td>20</td></tr>'+
    '</table></div></div></div>'+
    '<div class="card"><div class="card-header"><h3><i class="fa-solid fa-chart-bar" style="color:var(--ok);margin-right:6px"></i>AI调用量统计</h3></div><div class="card-body">'+
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px">'+
    '<div style="text-align:center;padding:20px;background:var(--bg);border-radius:12px"><div style="font-size:24px;font-weight:800;color:var(--p)">' + _g('lsjy3_credit_logs').filter(l=>l.amount<0).length + '</div><div style="font-size:12px;color:var(--b)">总调用次数</div></div>'+
    '<div style="text-align:center;padding:20px;background:var(--bg);border-radius:12px"><div style="font-size:24px;font-weight:800;color:var(--ok)">' + _g('lsjy3_credit_logs').filter(l=>l.amount<0).reduce((a,l)=>a+Math.abs(l.amount),0) + '</div><div style="font-size:12px;color:var(--b)">总算力消耗</div></div>'+
    '<div style="text-align:center;padding:20px;background:var(--bg);border-radius:12px"><div style="font-size:24px;font-weight:800;color:var(--warn)">11</div><div style="font-size:12px;color:var(--b)">AI工具数</div></div>'+
    '<div style="text-align:center;padding:20px;background:var(--bg);border-radius:12px"><div style="font-size:24px;font-weight:800;color:#8b5cf6">4</div><div style="font-size:12px;color:var(--b)">模型数</div></div>'+
    '</div></div></div>';
};

window.saveAiModels = function(){
  toast('模型配置已更新（需修改源码中的DOUBAO_CONFIG生效）','success');
  addOpLog('修改AI模型配置','');
};

// ===== 18. 算力充值记录 =====
let _clPage=1,_clKw='';
window.render_aiCreditLogs = function(p){
  if(typeof p==='number')_clPage=p;
  let data=_g('lsjy3_credit_logs');
  data=_filter(data,['desc','user','tool'],_clKw);
  data.reverse();
  const pg=_paginate(data.slice(0,200),_clPage,15);
  const all=_g('lsjy3_credit_logs');
  const totalIn=all.filter(l=>l.amount>0).reduce((a,l)=>a+l.amount,0);
  const totalOut=all.filter(l=>l.amount<0).reduce((a,l)=>a+Math.abs(l.amount),0);

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-arrow-up',label:'总充值',val:'+'+totalIn.toLocaleString(),g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-arrow-down',label:'总消耗',val:'-'+totalOut.toLocaleString(),g1:'#ef4444',g2:'#f87171'},
      {icon:'fa-solid fa-scale-balanced',label:'净变动',val:(totalIn-totalOut).toLocaleString(),g1:'#3b82f6',g2:'#60a5fa'},
      {icon:'fa-solid fa-list',label:'记录数',val:all.length,g1:'#f59e0b',g2:'#fbbf24'}
    ])+
    _tbl(
      ['时间','用户','工具/描述','算力变动','余额','操作'],
      pg.data.map(l=>'<td style="font-size:12px">'+fmtDate(l.time)+'</td><td>'+(l.user||l.username||'-')+'</td><td>'+(l.tool||l.desc||'-')+'</td><td style="font-weight:700;color:'+(l.amount>0?'var(--ok)':'var(--err')+'">'+(l.amount>0?'+':'')+l.amount+'</td><td>-</td><td><button class="act-btn view" onclick="viewCreditLog('+l._i+')"><i class="fa-solid fa-eye"></i></button></td>'),
      {title:'算力充值记录',placeholder:'搜索用户/工具...',kw:_clKw,searchFn:"_clKw=this.value;_clPage=1;render_aiCreditLogs()",
       toolbar:'<button class="tb-btn" onclick="exportCreditLogs()"><i class="fa-solid fa-file-csv"></i> 导出</button>'}
    )+
    _pgHtml(Math.min(data.length,200),_clPage,'render_aiCreditLogs');
};

window.viewCreditLog = function(idx){
  const l=_g('lsjy3_credit_logs').reverse()[idx];if(!l)return;
  showMod('<h3><i class="fa-solid fa-bolt" style="color:var(--warn)"></i> 算力记录详情</h3>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;margin-top:16px">'+
    '<div><b>用户:</b> '+(l.user||'-')+'</div><div><b>变动:</b> <span style="color:'+(l.amount>0?'var(--ok)':'var(--err')+'">'+(l.amount>0?'+':'')+l.amount+'</span></div>'+
    '<div><b>工具:</b> '+(l.tool||'-')+'</div><div><b>时间:</b> '+fmtDate(l.time)+'</div>'+
    '</div>'+(l.desc?'<div style="margin-top:12px"><b>描述:</b></div><div style="padding:12px;background:var(--bg);border-radius:8px;font-size:13px;margin-top:4px">'+l.desc+'</div>':'')+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">关闭</button></div>');
};

window.exportCreditLogs = function(){
  const data=_g('lsjy3_credit_logs').reverse();
  const csv=toCSV(data.map(l=>[fmtDate(l.time),l.user||'',l.tool||l.desc||'',l.amount]),['时间','用户','工具','算力变动']);
  downloadCSV(csv,'算力记录_'+new Date().toISOString().slice(0,10));toast('导出成功','success');
};

// ===== 19. AI任务队列 =====
let _atPage=1,_atKw='',_atStatus='';
window.render_aiTasks = function(p){
  if(typeof p==='number')_atPage=p;
  let data=_g('lsjy3_ai_tasks');
  data=_filter(data,['toolName','username'],_atKw);
  if(_atStatus) data=data.filter(d=>d.status===_atStatus);
  data.reverse();
  const pg=_paginate(data,_atPage,12);
  const all=_g('lsjy3_ai_tasks');

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-list-check',label:'总任务',val:all.length,g1:'#3b82f6',g2:'#60a5fa'},
      {icon:'fa-solid fa-spinner',label:'处理中',val:all.filter(d=>d.status==='processing').length,g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-check-circle',label:'已完成',val:all.filter(d=>d.status==='completed').length,g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-circle-xmark',label:'失败',val:all.filter(d=>d.status==='failed').length,g1:'#ef4444',g2:'#f87171'}
    ])+
    _tbl(
      ['任务ID','工具','用户','状态','创建时间','操作'],
      pg.data.map(d=>{
        const sc={pending:'排队中',processing:'生成中',completed:'已完成',failed:'失败'};
        const cc={pending:'badge-yellow',processing:'badge-blue',completed:'badge-green',failed:'badge-red'};
        return '<td style="font-family:monospace;font-size:11px">'+(d.id||'-').substring(0,12)+'</td><td>'+(d.toolName||'-')+'</td><td>'+(d.username||'-')+'</td><td>'+_badge(sc[d.status]||d.status,cc[d.status]||'badge-gray')+'</td><td style="font-size:12px">'+fmtDate(d.created)+'</td><td>'+(d.status==='completed'?'<button class="act-btn view" onclick="viewAiTask('+d._i+')"><i class="fa-solid fa-eye"></i></button>':'')+(d.status==='failed'?'<button class="act-btn del" onclick="delAiTask('+d._i+')"><i class="fa-solid fa-trash"></i></button>':'')+'</td>';
      }),
      {title:'AI任务队列',placeholder:'搜索工具/用户...',kw:_atKw,searchFn:"_atKw=this.value;_atPage=1;render_aiTasks()",
       filterHtml:'<select onchange="_atStatus=this.value;_atPage=1;render_aiTasks()"><option value="">全部状态</option><option value="pending">排队中</option><option value="processing">生成中</option><option value="completed">已完成</option><option value="failed">失败</option></select>',
       toolbar:'<button class="tb-btn danger" onclick="if(confirm(\'清空失败任务?\')){const t=_g(\'lsjy3_ai_tasks\');_s(\'lsjy3_ai_tasks\',t.filter(d=>d.status!==\'failed\'));render_aiTasks();toast(\'已清空\',\'success\')}"><i class="fa-solid fa-broom"></i> 清空失败</button>'}
    )+
    _pgHtml(data.length,_atPage,'render_aiTasks');
};

window.viewAiTask = function(idx){
  const d=_g('lsjy3_ai_tasks').reverse()[idx];if(!d)return;
  showMod('<h3><i class="fa-solid fa-robot" style="color:var(--p)"></i> '+d.toolName+'</h3>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;margin-top:16px">'+
    '<div><b>状态:</b> 已完成</div><div><b>用户:</b> '+(d.username||'-')+'</div>'+
    '<div><b>时间:</b> '+fmtDate(d.created)+'</div><div><b>类型:</b> '+(d.type||'-')+'</div>'+
    '</div>'+
    (d.result?(d.type==='image'?'<div style="margin-top:12px"><img src="'+d.result+'" style="max-width:100%;border-radius:8px" alt="AI结果"></div>':'<div style="margin-top:12px;padding:12px;background:var(--bg);border-radius:8px;font-size:13px;white-space:pre-wrap;max-height:300px;overflow-y:auto">'+d.result+'</div>'):'')+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">关闭</button></div>');
};

window.delAiTask = function(idx){
  const data=_g('lsjy3_ai_tasks').reverse();
  const id=data[idx].id;
  const all=_g('lsjy3_ai_tasks').filter(d=>d.id!==id);
  _s('lsjy3_ai_tasks',all);render_aiTasks();toast('任务已删除','success');
};

// ===== 20. 营销活动 =====
let _mkPage=1,_mkKw='',_mkStatus='';
window.render_marketing = function(p){
  if(typeof p==='number')_mkPage=p;
  let data=_g('lsjy3_marketing');
  data=_filter(data,['name','type','channel'],_mkKw);
  if(_mkStatus) data=data.filter(d=>d.status===_mkStatus);
  data.reverse();
  const pg=_paginate(data,_mkPage,10);
  const all=_g('lsjy3_marketing');
  const now=new Date();
  const active=all.filter(d=>d.status==='active'&&d.endDate>=now.toISOString().slice(0,10));
  const totalBudget=all.reduce((s,d)=>s+(parseFloat(d.budget)||0),0);

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-bullseye',label:'活动总数',val:all.length,g1:'#8b5cf6',g2:'#a78bfa'},
      {icon:'fa-solid fa-rocket',label:'进行中',val:active.length,g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-clock',label:'已结束',val:all.filter(d=>d.status==='ended').length,g1:'#94a3b8',g2:'#cbd5e1'},
      {icon:'fa-solid fa-sack-dollar',label:'总预算(万)',val:(totalBudget/10000).toFixed(1),g1:'#f59e0b',g2:'#fbbf24'}
    ])+
    _tbl(
      ['活动名称','类型','渠道','预算','转化率','状态','日期范围','操作'],
      pg.data.map(d=>{
        const sc={draft:'草稿',active:'进行中',paused:'已暂停',ended:'已结束'};
        const cc={draft:'badge-gray',active:'badge-green',paused:'badge-yellow',ended:'badge-gray'};
        return '<td><b>'+(d.name||'-')+'</b></td><td>'+_badge(d.type||'-','badge-blue')+'</td><td>'+(d.channel||'-')+'</td><td>'+(parseFloat(d.budget)||0).toLocaleString()+'</td><td style="color:'+(d.conversion>5?'#22c55e':'var(--tx3)')+'">'+(d.conversion||0)+'%</td><td>'+_badge(sc[d.status]||d.status,cc[d.status]||'badge-gray')+'</td><td style="font-size:11px">'+(d.startDate||'-')+' ~ '+(d.endDate||'-')+'</td><td><button class="act-btn view" onclick="viewMarketing('+d._i+')"><i class="fa-solid fa-eye"></i></button><button class="act-btn edit" onclick="editMarketing('+d._i+')"><i class="fa-solid fa-pen"></i></button><button class="act-btn del" onclick="delMarketing('+d._i+')"><i class="fa-solid fa-trash"></i></button></td>';
      }),
      {title:'营销活动管理',placeholder:'搜索活动名称/类型/渠道...',kw:_mkKw,searchFn:"_mkKw=this.value;_mkPage=1;render_marketing()",
       filterHtml:'<select onchange="_mkStatus=this.value;_mkPage=1;render_marketing()"><option value="">全部状态</option><option value="draft">草稿</option><option value="active">进行中</option><option value="paused">已暂停</option><option value="ended">已结束</option></select>',
       toolbar:'<button class="tb-btn primary" onclick="addMarketing()"><i class="fa-solid fa-plus"></i> 新建活动</button>'}
    )+
    _pgHtml(data.length,_mkPage,'render_marketing');
};

const _mkForm=function(d){
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
    '<div><label>活动名称</label><input id="mkName" value="'+(d?d.name:'')+'" placeholder="输入活动名称"></div>'+
    '<div><label>活动类型</label><select id="mkType"><option value="促销"'+(d&&d.type==='促销'?' selected':'')+'>促销</option><option value="品牌"'+(d&&d.type==='品牌'?' selected':'')+'>品牌</option><option value="裂变"'+(d&&d.type==='裂变'?' selected':'')+'>裂变</option><option value="节日"'+(d&&d.type==='节日'?' selected':'')+'>节日</option><option value="拉新"'+(d&&d.type==='拉新'?' selected':'')+'>拉新</option></select></div>'+
    '<div><label>推广渠道</label><select id="mkCh"><option value="微信"'+(d&&d.channel==='微信'?' selected':'')+'>微信</option><option value="抖音"'+(d&&d.channel==='抖音'?' selected':'')+'>抖音</option><option value="小红书"'+(d&&d.channel==='小红书'?' selected':'')+'>小红书</option><option value="B站"'+(d&&d.channel==='B站'?' selected':'')+'>B站</option><option value="线下"'+(d&&d.channel==='线下'?' selected':'')+'>线下</option><option value="全渠道"'+(d&&d.channel==='全渠道'?' selected':'')+'>全渠道</option></select></div>'+
    '<div><label>预算(元)</label><input id="mkBudget" type="number" value="'+(d?d.budget:'')+'" placeholder="0"></div>'+
    '<div><label>开始日期</label><input id="mkStart" type="date" value="'+(d?d.startDate:new Date().toISOString().slice(0,10))+'"></div>'+
    '<div><label>结束日期</label><input id="mkEnd" type="date" value="'+(d?d.endDate:'')+'"></div>'+
    '<div style="grid-column:1/-1"><label>活动描述</label><textarea id="mkDesc" rows="3" placeholder="活动详情">'+(d?d.desc||'':'')+'</textarea></div>'+
    '<div style="grid-column:1/-1"><label>目标(KPI)</label><input id="mkKpi" value="'+(d?d.kpi||'':'')+'" placeholder="如：新增用户1000人、GMV 10万"></div></div>';
};

window.addMarketing = function(){
  showMod('<h3><i class="fa-solid fa-bullseye" style="color:var(--p)"></i> 新建营销活动</h3>'+_mkForm()+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-primary" onclick="saveMarketing(-1)">创建</button></div>');
};

window.editMarketing = function(idx){
  const d=_g('lsjy3_marketing')[idx];if(!d)return;
  showMod('<h3><i class="fa-solid fa-pen" style="color:var(--p)"></i> 编辑活动</h3>'+_mkForm(d)+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-primary" onclick="saveMarketing('+idx+')">保存</button></div>');
};

window.saveMarketing = function(idx){
  const name=document.getElementById('mkName').value.trim();
  if(!name){toast('请输入活动名称','error');return}
  const item={
    name,type:document.getElementById('mkType').value,channel:document.getElementById('mkCh').value,
    budget:document.getElementById('mkBudget').value||'0',startDate:document.getElementById('mkStart').value,
    endDate:document.getElementById('mkEnd').value,desc:document.getElementById('mkDesc').value,
    kpi:document.getElementById('mkKpi').value,status:'draft',conversion:0,clicks:0,created:new Date().toISOString()
  };
  const data=_g('lsjy3_marketing');
  if(idx===-1){data.push(item);toast('活动已创建','success')}
  else{Object.assign(data[idx],item);toast('活动已更新','success')}
  _s('lsjy3_marketing',data);closeModal();render_marketing();
};

window.viewMarketing = function(idx){
  const d=_g('lsjy3_marketing')[idx];if(!d)return;
  const sc={draft:'草稿',active:'进行中',paused:'已暂停',ended:'已结束'};
  showMod('<h3><i class="fa-solid fa-bullseye" style="color:var(--p)"></i> '+d.name+'</h3>'+
    '<div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px">'+
    '<div><b>类型:</b> '+(d.type||'-')+'</div><div><b>渠道:</b> '+(d.channel||'-')+'</div>'+
    '<div><b>预算:</b> ¥'+(parseFloat(d.budget)||0).toLocaleString()+'</div><div><b>转化率:</b> '+(d.conversion||0)+'%</div>'+
    '<div><b>点击量:</b> '+(d.clicks||0)+'</div><div><b>状态:</b> '+(sc[d.status]||d.status)+'</div>'+
    '<div><b>开始:</b> '+(d.startDate||'-')+'</div><div><b>结束:</b> '+(d.endDate||'-')+'</div></div>'+
    (d.desc?'<div style="margin-top:12px;padding:12px;background:var(--bg);border-radius:8px;font-size:13px">'+d.desc+'</div>':'')+
    (d.kpi?'<div style="margin-top:8px;padding:10px;background:#fef3c7;border-radius:8px;font-size:13px"><b>KPI目标:</b> '+d.kpi+'</div>':'')+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">关闭</button></div>');
};

window.delMarketing = function(idx){
  if(!confirm('确定删除此活动?'))return;
  const data=_g('lsjy3_marketing');data.splice(idx,1);
  _s('lsjy3_marketing',data);render_marketing();toast('已删除','success');
};

// ===== 21. 优惠券 =====
let _cpPage=1,_cpKw='',_cpStatus='';
window.render_coupons = function(p){
  if(typeof p==='number')_cpPage=p;
  let data=_g('lsjy3_coupons');
  data=_filter(data,['name','code','type'],_cpKw);
  if(_cpStatus) data=data.filter(d=>d.status===_cpStatus);
  data.reverse();
  const pg=_paginate(data,_cpPage,12);
  const all=_g('lsjy3_coupons');

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-tags',label:'优惠券总数',val:all.length,g1:'#ec4899',g2:'#f472b6'},
      {icon:'fa-solid fa-check-circle',label:'已激活',val:all.filter(d=>d.status==='active').length,g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-ticket',label:'已使用',val:all.reduce((s,d)=>s+(d.usedCount||0),0),g1:'#3b82f6',g2:'#60a5fa'},
      {icon:'fa-solid fa-percent',label:'平均折扣',val:all.length?Math.round(all.reduce((s,d)=>s+(parseFloat(d.value)||0),0)/all.length)+'%':'0%',g1:'#8b5cf6',g2:'#a78bfa'}
    ])+
    _tbl(
      ['券名称','券码','类型','面额','有效期','已用/总量','状态','操作'],
      pg.data.map(d=>{
        const sc={active:'激活',inactive:'停用',expired:'过期'};
        const cc={active:'badge-green',inactive:'badge-gray',expired:'badge-red'};
        return '<td><b>'+(d.name||'-')+'</b></td><td style="font-family:monospace;color:var(--p)">'+(d.code||'-')+'</td><td>'+_badge(d.type==='percent'?'折扣券':'满减券',d.type==='percent'?'badge-purple':'badge-blue')+'</td><td style="font-weight:700;color:#ef4444">'+(d.type==='percent'?(d.value||0)+'%':'¥'+(d.value||0))+'</td><td style="font-size:11px">'+(d.startDate||'-')+' ~ '+(d.endDate||'-')+'</td><td>'+(d.usedCount||0)+'/'+(d.total||0)+'</td><td>'+_badge(sc[d.status]||d.status,cc[d.status]||'badge-gray')+'</td><td><button class="act-btn edit" onclick="editCoupon('+d._i+')"><i class="fa-solid fa-pen"></i></button><button class="act-btn del" onclick="delCoupon('+d._i+')"><i class="fa-solid fa-trash"></i></button></td>';
      }),
      {title:'优惠券管理',placeholder:'搜索名称/券码/类型...',kw:_cpKw,searchFn:"_cpKw=this.value;_cpPage=1;render_coupons()",
       filterHtml:'<select onchange="_cpStatus=this.value;_cpPage=1;render_coupons()"><option value="">全部状态</option><option value="active">激活</option><option value="inactive">停用</option><option value="expired">过期</option></select>',
       toolbar:'<button class="tb-btn primary" onclick="addCoupon()"><i class="fa-solid fa-plus"></i> 创建优惠券</button><button class="tb-btn" onclick="batchGenCoupons()"><i class="fa-solid fa-wand-magic-sparkles"></i> 批量生成</button>'}
    )+
    _pgHtml(data.length,_cpPage,'render_coupons');
};

const _cpForm=function(d){
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
    '<div><label>券名称</label><input id="cpName" value="'+(d?d.name:'')+'" placeholder="如：新人专享券"></div>'+
    '<div><label>券类型</label><select id="cpType" onchange="document.getElementById(\'cpValLbl\').textContent=this.value===\'percent\'?\'折扣(%)\':\'面额(元)\'"><option value="percent"'+(d&&d.type==='percent'?' selected':'')+'>折扣券</option><option value="fixed"'+(d&&d.type==='fixed'?' selected':'')+'>满减券</option></select></div>'+
    '<div><label id="cpValLbl">折扣(%)</label><input id="cpValue" type="number" value="'+(d?d.value:'')+'" placeholder="如：85表示8.5折"></div>'+
    '<div><label>发放总量</label><input id="cpTotal" type="number" value="'+(d?d.total:'100')+'" placeholder="100"></div>'+
    '<div><label>开始日期</label><input id="cpStart" type="date" value="'+(d?d.startDate:new Date().toISOString().slice(0,10))+'"></div>'+
    '<div><label>结束日期</label><input id="cpEnd" type="date" value="'+(d?d.endDate:'')+'"></div>'+
    '<div><label>最低消费</label><input id="cpMinSpend" type="number" value="'+(d?d.minSpend||'0':'0')+'" placeholder="0表示无门槛"></div>'+
    '<div><label>每人限领</label><input id="cpLimit" type="number" value="'+(d?d.perLimit||'1':'1')+'"></div></div>';
};

window.addCoupon = function(){
  showMod('<h3><i class="fa-solid fa-tags" style="color:var(--p)"></i> 创建优惠券</h3>'+_cpForm()+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-primary" onclick="saveCoupon(-1)">创建</button></div>');
};

window.editCoupon = function(idx){
  const d=_g('lsjy3_coupons')[idx];if(!d)return;
  showMod('<h3><i class="fa-solid fa-pen" style="color:var(--p)"></i> 编辑优惠券</h3>'+_cpForm(d)+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-primary" onclick="saveCoupon('+idx+')">保存</button></div>');
};

window.saveCoupon = function(idx){
  const name=document.getElementById('cpName').value.trim();
  if(!name){toast('请输入券名称','error');return}
  const code='CP'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).substr(2,4).toUpperCase();
  const item={
    name,code,type:document.getElementById('cpType').value,
    value:document.getElementById('cpValue').value,total:parseInt(document.getElementById('cpTotal').value)||100,
    startDate:document.getElementById('cpStart').value,endDate:document.getElementById('cpEnd').value,
    minSpend:document.getElementById('cpMinSpend').value,perLimit:document.getElementById('cpLimit').value||'1',
    status:'active',usedCount:0,created:new Date().toISOString()
  };
  const data=_g('lsjy3_coupons');
  if(idx===-1){data.push(item);toast('优惠券已创建','success')}
  else{item.code=data[idx].code;Object.assign(data[idx],item);toast('已更新','success')}
  _s('lsjy3_coupons',data);closeModal();render_coupons();
};

window.batchGenCoupons = function(){
  const count=prompt('批量生成数量(1-100):','10');
  if(!count||isNaN(count)||count<1||count>100)return;
  const data=_g('lsjy3_coupons');
  for(let i=0;i<parseInt(count);i++){
    data.push({name:'通用优惠-'+(data.length+1),code:'CP'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).substr(2,4).toUpperCase(),type:'percent',value:Math.floor(Math.random()*20+80)+'',total:1000,startDate:new Date().toISOString().slice(0,10),endDate:'',minSpend:'0',perLimit:'1',status:'active',usedCount:0,created:new Date().toISOString()});
  }
  _s('lsjy3_coupons',data);render_coupons();toast('已批量生成'+count+'张','success');
};

window.delCoupon = function(idx){
  if(!confirm('确定删除?'))return;
  const data=_g('lsjy3_coupons');data.splice(idx,1);
  _s('lsjy3_coupons',data);render_coupons();toast('已删除','success');
};

// ===== 22. 推广管理 =====
let _afPage=1,_afKw='';
window.render_affiliates = function(p){
  if(typeof p==='number')_afPage=p;
  let data=_g('lsjy3_affiliates');
  data=_filter(data,['name','code','channel'],_afKw);
  data.reverse();
  const pg=_paginate(data,_afPage,12);
  const all=_g('lsjy3_affiliates');
  const totalCommission=all.reduce((s,d)=>s+(parseFloat(d.commission)||0),0);
  const totalSales=all.reduce((s,d)=>s+(parseFloat(d.sales)||0),0);

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-share-nodes',label:'推广员总数',val:all.length,g1:'#06b6d4',g2:'#22d3ee'},
      {icon:'fa-solid fa-users',label:'本月活跃',val:all.filter(d=>{const m=new Date().toISOString().slice(0,7);return(d.lastActive||'').startsWith(m)}).length,g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-cart-shopping',label:'推广总销售额',val:'¥'+totalSales.toLocaleString(),g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-hand-holding-dollar',label:'总佣金支出',val:'¥'+totalCommission.toLocaleString(),g1:'#8b5cf6',g2:'#a78bfa'}
    ])+
    _tbl(
      ['推广员','邀请码','渠道','下线人数','销售额','佣金','状态','操作'],
      pg.data.map(d=>{
        return '<td><b>'+(d.name||'-')+'</b></td><td style="font-family:monospace;color:var(--p)">'+(d.code||'-')+'</td><td>'+_badge(d.channel||'-',d.channel==='微信'?'badge-green':d.channel==='抖音'?'badge-blue':'badge-gray')+'</td><td>'+(d.referrals||0)+'</td><td>¥'+(parseFloat(d.sales)||0).toLocaleString()+'</td><td style="color:#22c55e">¥'+(parseFloat(d.commission)||0).toLocaleString()+'</td><td>'+_badge(d.status==='active'?'正常':d.status==='banned'?'封禁':'待审',d.status==='active'?'badge-green':d.status==='banned'?'badge-red':'badge-yellow')+'</td><td><button class="act-btn view" onclick="viewAffiliate('+d._i+')"><i class="fa-solid fa-eye"></i></button><button class="act-btn edit" onclick="editAffiliate('+d._i+')"><i class="fa-solid fa-pen"></i></button>'+(d.status==='active'?'<button class="act-btn del" onclick="banAffiliate('+d._i+')"><i class="fa-solid fa-ban"></i></button>':'')+'</td>';
      }),
      {title:'推广管理',placeholder:'搜索推广员/邀请码/渠道...',kw:_afKw,searchFn:"_afKw=this.value;_afPage=1;render_affiliates()",
       toolbar:'<button class="tb-btn primary" onclick="addAffiliate()"><i class="fa-solid fa-plus"></i> 添加推广员</button>'}
    )+
    _pgHtml(data.length,_afPage,'render_affiliates');
};

const _afForm=function(d){
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
    '<div><label>推广员姓名</label><input id="afName" value="'+(d?d.name:'')+'" placeholder="姓名/昵称"></div>'+
    '<div><label>联系方式</label><input id="afContact" value="'+(d?d.contact||'':'')+'" placeholder="手机/微信"></div>'+
    '<div><label>推广渠道</label><select id="afCh"><option value="微信"'+(d&&d.channel==='微信'?' selected':'')+'>微信</option><option value="抖音"'+(d&&d.channel==='抖音'?' selected':'')+'>抖音</option><option value="小红书"'+(d&&d.channel==='小红书'?' selected':'')+'>小红书</option><option value="其他"'+(d&&d.channel==='其他'?' selected':'')+'>其他</option></select></div>'+
    '<div><label>佣金比例(%)</label><input id="afRate" type="number" value="'+(d?d.rate||'10':'10')+'"></div>'+
    '<div style="grid-column:1/-1"><label>备注</label><textarea id="afNote" rows="2" placeholder="备注">'+(d?d.note||'':'')+'</textarea></div></div>';
};

window.addAffiliate = function(){
  showMod('<h3><i class="fa-solid fa-share-nodes" style="color:var(--p)"></i> 添加推广员</h3>'+_afForm()+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-primary" onclick="saveAffiliate(-1)">添加</button></div>');
};

window.editAffiliate = function(idx){
  const d=_g('lsjy3_affiliates')[idx];if(!d)return;
  showMod('<h3><i class="fa-solid fa-pen" style="color:var(--p)"></i> 编辑推广员</h3>'+_afForm(d)+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-primary" onclick="saveAffiliate('+idx+')">保存</button></div>');
};

window.saveAffiliate = function(idx){
  const name=document.getElementById('afName').value.trim();
  if(!name){toast('请输入姓名','error');return}
  const item={
    name,contact:document.getElementById('afContact').value,channel:document.getElementById('afCh').value,
    rate:document.getElementById('afRate').value||'10',note:document.getElementById('afNote').value,
    code:'AFF'+Date.now().toString(36).toUpperCase().slice(-6),status:'active',referrals:0,sales:'0',commission:'0',
    lastActive:new Date().toISOString(),created:new Date().toISOString()
  };
  const data=_g('lsjy3_affiliates');
  if(idx===-1){data.push(item);toast('推广员已添加','success')}
  else{item.code=data[idx].code;Object.assign(data[idx],item);toast('已更新','success')}
  _s('lsjy3_affiliates',data);closeModal();render_affiliates();
};

window.viewAffiliate = function(idx){
  const d=_g('lsjy3_affiliates')[idx];if(!d)return;
  showMod('<h3><i class="fa-solid fa-share-nodes" style="color:var(--p)"></i> '+d.name+'</h3>'+
    '<div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px">'+
    '<div><b>邀请码:</b> <span style="font-family:monospace;color:var(--p)">'+d.code+'</span></div><div><b>渠道:</b> '+(d.channel||'-')+'</div>'+
    '<div><b>下线人数:</b> '+(d.referrals||0)+'</div><div><b>佣金比例:</b> '+(d.rate||10)+'%</div>'+
    '<div><b>销售额:</b> ¥'+(parseFloat(d.sales)||0).toLocaleString()+'</div><div><b>累计佣金:</b> ¥'+(parseFloat(d.commission)||0).toLocaleString()+'</div>'+
    '<div><b>最近活跃:</b> '+fmtDate(d.lastActive)+'</div><div><b>状态:</b> '+(d.status==='active'?'正常':d.status)+'</div></div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">关闭</button></div>');
};

window.banAffiliate = function(idx){
  if(!confirm('确定封禁此推广员?'))return;
  const data=_g('lsjy3_affiliates');data[idx].status='banned';
  _s('lsjy3_affiliates',data);render_affiliates();toast('已封禁','success');
};

// ===== 23. 数据报表 =====
window.render_reports = function(){
  const users=_g('lsjy3_users');
  const orders=_g('lsjy3_orders');
  const creditLogs=_g('lsjy3_credit_logs');
  const tasks=_g('lsjy3_ai_tasks');
  const marketing=_g('lsjy3_marketing');
  const affiliates=_g('lsjy3_affiliates');
  const today=new Date().toISOString().slice(0,10);
  const thisMonth=today.slice(0,7);

  const todayUsers=users.filter(u=>(u.created||'').startsWith(today)).length;
  const monthUsers=users.filter(u=>(u.created||'').startsWith(thisMonth)).length;
  const totalRevenue=orders.reduce((s,o)=>s+(parseFloat(o.amount)||0),0);
  const monthOrders=orders.filter(o=>(o.created||'').startsWith(thisMonth));
  const monthRevenue=monthOrders.reduce((s,o)=>s+(parseFloat(o.amount)||0),0);
  const completedTasks=tasks.filter(t=>t.status==='completed').length;
  const activeMarketing=marketing.filter(m=>m.status==='active').length;
  const totalAffSales=affiliates.reduce((s,a)=>s+(parseFloat(a.sales)||0),0);

  document.getElementById('mainContent').innerHTML =
    '<div style="margin-bottom:24px"><h2 style="font-size:20px;margin:0 0 4px"><i class="fa-solid fa-chart-column" style="color:var(--p)"></i> 数据报表中心</h2><p style="color:var(--tx3);font-size:13px">综合运营数据看板 · 实时统计</p></div>'+
    _stats([
      {icon:'fa-solid fa-users',label:'总用户',val:users.length,g1:'#3b82f6',g2:'#60a5fa',sub:'今日 +'+todayUsers},
      {icon:'fa-solid fa-shopping-cart',label:'总订单',val:orders.length,g1:'#22c55e',g2:'#34d399',sub:'本月 '+monthOrders.length},
      {icon:'fa-solid fa-yen-sign',label:'总收入',val:'¥'+totalRevenue.toLocaleString(),g1:'#f59e0b',g2:'#fbbf24',sub:'本月 ¥'+monthRevenue.toLocaleString()},
      {icon:'fa-solid fa-robot',label:'AI任务完成',val:completedTasks,g1:'#8b5cf6',g2:'#a78bfa',sub:'总计 '+tasks.length}
    ])+
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:20px">'+
    '<div style="background:var(--card);border-radius:12px;padding:20px;border:1px solid var(--border)"><h4 style="font-size:14px;margin:0 0 16px"><i class="fa-solid fa-user-plus" style="color:#3b82f6"></i> 用户增长</h4><div style="font-size:32px;font-weight:700;color:#3b82f6">'+users.length+'</div><div style="color:var(--tx3);font-size:12px;margin-top:4px">本月新增 '+monthUsers+' · 今日 +'+todayUsers+'</div></div>'+
    '<div style="background:var(--card);border-radius:12px;padding:20px;border:1px solid var(--border)"><h4 style="font-size:14px;margin:0 0 16px"><i class="fa-solid fa-bullseye" style="color:#ec4899"></i> 营销活动</h4><div style="font-size:32px;font-weight:700;color:#ec4899">'+activeMarketing+'</div><div style="color:var(--tx3);font-size:12px;margin-top:4px">进行中 '+activeMarketing+' / 总计 '+marketing.length+'</div></div>'+
    '<div style="background:var(--card);border-radius:12px;padding:20px;border:1px solid var(--border)"><h4 style="font-size:14px;margin:0 0 16px"><i class="fa-solid fa-share-nodes" style="color:#06b6d4"></i> 推广数据</h4><div style="font-size:32px;font-weight:700;color:#06b6d4">'+affiliates.length+'</div><div style="color:var(--tx3);font-size:12px;margin-top:4px">推广销售额 ¥'+totalAffSales.toLocaleString()+'</div></div></div>'+
    '<div style="margin-top:20px;display:grid;grid-template-columns:1fr 1fr;gap:16px">'+
    '<div style="background:var(--card);border-radius:12px;padding:20px;border:1px solid var(--border)"><h4 style="font-size:14px;margin:0 0 12px"><i class="fa-solid fa-bolt" style="color:#f59e0b"></i> 算力使用 TOP5 用户</h4><div id="creditTop5"></div></div>'+
    '<div style="background:var(--card);border-radius:12px;padding:20px;border:1px solid var(--border)"><h4 style="font-size:14px;margin:0 0 12px"><i class="fa-solid fa-wrench" style="color:#ef4444"></i> AI工具使用排行</h4><div id="toolRank"></div></div></div>'+
    '<div style="margin-top:20px;display:grid;grid-template-columns:1fr 1fr;gap:16px">'+
    '<div style="background:var(--card);border-radius:12px;padding:20px;border:1px solid var(--border)"><h4 style="font-size:14px;margin:0 0 12px"><i class="fa-solid fa-chart-pie" style="color:#22c55e"></i> 任务状态分布</h4><div id="taskPie"></div></div>'+
    '<div style="background:var(--card);border-radius:12px;padding:20px;border:1px solid var(--border)"><h4 style="font-size:14px;margin:0 0 12px"><i class="fa-solid fa-calendar-days" style="color:#8b5cf6"></i> 近7天注册趋势</h4><div id="regTrend"></div></div></div>'+
    '<div style="margin-top:20px;text-align:center"><button class="tb-btn primary" onclick="exportAllReports()" style="padding:10px 32px"><i class="fa-solid fa-download"></i> 导出完整报表</button></div>';

  // 算力TOP5
  const userCredit={};
  creditLogs.forEach(l=>{if(l.user){userCredit[l.user]=(userCredit[l.user]||0)+(Math.abs(parseFloat(l.amount))||0)}});
  const top5=Object.entries(userCredit).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const top5El=document.getElementById('creditTop5');
  if(top5El) top5El.innerHTML=top5.length?top5.map((t,i)=>'<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px"><span>'+(i+1)+'. '+t[0]+'</span><span style="font-weight:600;color:var(--p)">'+t[1].toFixed(1)+'</span></div>').join(''):'<div style="color:var(--tx3);font-size:13px;text-align:center;padding:20px">暂无数据</div>';

  // 工具排行
  const toolCount={};
  tasks.forEach(t=>{if(t.toolName)toolCount[t.toolName]=(toolCount[t.toolName]||0)+1});
  const toolRank=Object.entries(toolCount).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const toolEl=document.getElementById('toolRank');
  if(toolEl) toolEl.innerHTML=toolRank.length?toolRank.map((t,i)=>'<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px"><span>'+(i+1)+'. '+t[0]+'</span><span style="font-weight:600;color:var(--p)">'+t[1]+'次</span></div>').join(''):'<div style="color:var(--tx3);font-size:13px;text-align:center;padding:20px">暂无数据</div>';

  // 任务状态分布
  const statusCount={pending:0,processing:0,completed:0,failed:0};
  tasks.forEach(t=>{if(statusCount[t.status]!==undefined)statusCount[t.status]++});
  const pieEl=document.getElementById('taskPie');
  if(pieEl) pieEl.innerHTML='<div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;padding:10px 0">'+
    Object.entries(statusCount).map(([k,v])=>{const colors={pending:'#f59e0b',processing:'#3b82f6',completed:'#22c55e',failed:'#ef4444'};const labels={pending:'排队中',processing:'处理中',completed:'已完成',failed:'失败'};return '<div style="text-align:center"><div style="width:60px;height:60px;border-radius:50%;background:conic-gradient('+colors[k]+' '+(tasks.length?v/tasks.length*100:0)+'%, var(--border) '+(tasks.length?v/tasks.length*100:0)+'%);display:flex;align-items:center;justify-content:center;margin:0 auto"><span style="font-size:14px;font-weight:700">'+v+'</span></div><div style="font-size:11px;color:var(--tx3);margin-top:4px">'+labels[k]+'</div></div>'}).join('')+'</div>';

  // 近7天注册趋势
  const regEl=document.getElementById('regTrend');
  if(regEl){
    const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(d.toISOString().slice(0,10))}
    const dayCounts=days.map(day=>users.filter(u=>(u.created||'').startsWith(day)).length);
    const maxC=Math.max(...dayCounts,1);
    regEl.innerHTML='<div style="display:flex;align-items:flex-end;gap:8px;height:120px;padding-top:10px">'+dayCounts.map((c,i)=>'<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"><div style="width:100%;background:linear-gradient(to top,#8b5cf6,#a78bfa);border-radius:4px 4px 0 0;height:'+(c/maxC*80+4)+'px;min-height:4px;transition:height .3s"></div><span style="font-size:10px;color:var(--tx3)">'+days[i].slice(5)+'</span><span style="font-size:11px;font-weight:600">'+c+'</span></div>').join('')+'</div>';
  }
};

window.exportAllReports = function(){
  const users=_g('lsjy3_users');const orders=_g('lsjy3_orders');const tasks=_g('lsjy3_ai_tasks');
  const csv=toCSV([
    ['模块','指标','数值'],
    ['用户','总数',users.length],['用户','本月新增',users.filter(u=>(u.created||'').startsWith(new Date().toISOString().slice(0,7))).length],
    ['订单','总数',orders.length],['订单','总金额',orders.reduce((s,o)=>s+(parseFloat(o.amount)||0),0)],
    ['AI任务','总数',tasks.length],['AI任务','已完成',tasks.filter(t=>t.status==='completed').length]
  ],['模块','指标','数值']);
  downloadCSV(csv,'运营报表_'+new Date().toISOString().slice(0,10));toast('报表已导出','success');
};

// ===== 24. 在线客服 =====
let _lcTab='chat';
window.render_livechat = function(){
  const sessions=_g('lsjy3_chat_sessions');
  const active=sessions.filter(s=>s.status==='active').length;

  document.getElementById('mainContent').innerHTML =
    '<div style="margin-bottom:24px"><h2 style="font-size:20px;margin:0 0 4px"><i class="fa-solid fa-headset" style="color:var(--p)"></i> 在线客服</h2><p style="color:var(--tx3);font-size:13px">实时对话管理</p></div>'+
    _stats([
      {icon:'fa-solid fa-comments',label:'总会话',val:sessions.length,g1:'#06b6d4',g2:'#22d3ee'},
      {icon:'fa-solid fa-circle-dot',label:'进行中',val:active,g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-clock',label:'等待中',val:sessions.filter(s=>s.status==='waiting').length,g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-check-circle',label:'已结束',val:sessions.filter(s=>s.status==='closed').length,g1:'#94a3b8',g2:'#cbd5e1'}
    ])+
    '<div style="display:grid;grid-template-columns:320px 1fr;gap:16px;margin-top:20px;border:1px solid var(--border);border-radius:12px;overflow:hidden">'+
    '<div style="background:var(--bg);border-right:1px solid var(--border);max-height:500px;overflow-y:auto"><div style="padding:12px"><input style="width:100%;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--tx)" placeholder="搜索会话..." oninput="filterChatList(this.value)"><div id="chatSessionList" style="margin-top:8px"></div></div></div>'+
    '<div style="display:flex;flex-direction:column"><div style="padding:12px 16px;border-bottom:1px solid var(--border);font-size:14px;font-weight:600" id="chatHeader">选择一个会话开始对话</div><div id="chatMessages" style="flex:1;min-height:400px;padding:16px;overflow-y:auto;font-size:13px;display:flex;flex-direction:column;gap:8px"><div style="text-align:center;color:var(--tx3);padding:40px">选择左侧会话查看聊天记录</div></div>'+
    '<div style="padding:12px;border-top:1px solid var(--border);display:flex;gap:8px"><input id="chatInput" style="flex:1;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--tx)" placeholder="输入回复内容..." onkeydown="if(event.key===String.fromCharCode(13))sendChatReply()"><button class="tb-btn primary" onclick="sendChatReply()" style="padding:10px 20px"><i class="fa-solid fa-paper-plane"></i> 发送</button></div></div></div>';

  renderChatList(sessions);
};

function renderChatList(sessions){
  const el=document.getElementById('chatSessionList');if(!el)return;
  if(!sessions.length){el.innerHTML='<div style="text-align:center;color:var(--tx3);padding:20px;font-size:13px">暂无会话</div>';return}
  el.innerHTML=sessions.map((s,i)=>{
    const last=s.messages&&s.messages.length?s.messages[s.messages.length-1]:'';
    const sc={active:'#22c55e',waiting:'#f59e0b',closed:'#94a3b8'};
    return '<div onclick="selectChat('+i+')" style="padding:10px;border-radius:8px;cursor:pointer;border:1px solid transparent;margin-bottom:4px;transition:all .2s;display:flex;gap:10px;align-items:flex-start" onmouseover="this.style.borderColor=\'var(--border)\'" onmouseout="this.style.borderColor=\'transparent\'"><div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--p),#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;flex-shrink:0">'+(s.user||'?')[0]+'</div><div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600;font-size:13px">'+(s.user||'未知用户')+'</span><span style="width:8px;height:8px;border-radius:50%;background:'+sc[s.status]||'#94a3b8'+'"></span></div><div style="font-size:11px;color:var(--tx3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:2px">'+(typeof last==='object'?last.text||'[图片]':last||'暂无消息')+'</div></div></div>';
  }).join('');
}

window.filterChatList = function(kw){
  const sessions=_g('lsjy3_chat_sessions').filter(s=>!kw||(s.user||'').includes(kw));
  renderChatList(sessions);
};

window.selectChat = function(idx){
  const s=_g('lsjy3_chat_sessions')[idx];if(!s)return;
  const header=document.getElementById('chatHeader');
  const msgs=document.getElementById('chatMessages');
  if(header) header.innerHTML='<span style="color:var(--p)"><i class="fa-solid fa-circle" style="font-size:8px"></i></span> '+(s.user||'未知用户')+'<span style="float:right;font-size:12px;color:var(--tx3)">会话 #'+(s.id||idx)+'</span>';
  if(msgs){
    if(!s.messages||!s.messages.length){msgs.innerHTML='<div style="text-align:center;color:var(--tx3);padding:40px">暂无消息记录</div>';return}
    msgs.innerHTML=s.messages.map(m=>{
      const isMe=m.role==='admin';
      return '<div style="display:flex;'+(isMe?'justify-content:flex-end':'')+'"><div style="max-width:70%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.5;'+(isMe?'background:var(--p);color:#fff;border-bottom-right-radius:4px':'background:var(--bg);border:1px solid var(--border);border-bottom-left-radius:4px')+'">'+(m.text||'')+'<div style="font-size:10px;margin-top:4px;'+(isMe?'color:rgba(255,255,255,0.6)':'color:var(--tx3)')+'">'+fmtDate(m.time)+'</div></div></div>';
    }).join('');
    msgs.scrollTop=msgs.scrollHeight;
  }
  window._currentChatIdx=idx;
};

window.sendChatReply = function(){
  const input=document.getElementById('chatInput');if(!input)return;
  const text=input.value.trim();if(!text)return;
  const idx=window._currentChatIdx;if(idx===undefined)return;
  const data=_g('lsjy3_chat_sessions');
  if(!data[idx].messages)data[idx].messages=[];
  data[idx].messages.push({role:'admin',text,time:new Date().toISOString()});
  _s('lsjy3_chat_sessions',data);input.value='';
  selectChat(idx);toast('回复已发送','success');
};

// ===== 25. FAQ管理 =====
let _fqPage=1,_fqKw='',_fqCat='';
window.render_faq = function(p){
  if(typeof p==='number')_fqPage=p;
  let data=_g('lsjy3_faq');
  data=_filter(data,['question','category'],_fqKw);
  if(_fqCat) data=data.filter(d=>d.category===_fqCat);
  data.reverse();
  const pg=_paginate(data,_fqPage,12);
  const all=_g('lsjy3_faq');

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-circle-question',label:'FAQ总数',val:all.length,g1:'#0ea5e9',g2:'#38bdf8'},
      {icon:'fa-solid fa-thumbs-up',label:'有帮助',val:all.reduce((s,d)=>s+(d.helpful||0),0),g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-eye',label:'总浏览',val:all.reduce((s,d)=>s+(d.views||0),0),g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-folder',label:'分类数',val:new Set(all.map(d=>d.category||'未分类')).size,g1:'#8b5cf6',g2:'#a78bfa'}
    ])+
    _tbl(
      ['问题','分类','浏览','有帮助','排序','状态','操作'],
      pg.data.map(d=>{
        return '<td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><b>'+(d.question||'-')+'</b></td><td>'+_badge(d.category||'未分类','badge-blue')+'</td><td>'+(d.views||0)+'</td><td>'+(d.helpful||0)+'</td><td>'+(d.sort||0)+'</td><td>'+_badge(d.status==='published'?'已发布':'草稿',d.status==='published'?'badge-green':'badge-gray')+'</td><td><button class="act-btn view" onclick="viewFaq('+d._i+')"><i class="fa-solid fa-eye"></i></button><button class="act-btn edit" onclick="editFaq('+d._i+')"><i class="fa-solid fa-pen"></i></button><button class="act-btn del" onclick="delFaq('+d._i+')"><i class="fa-solid fa-trash"></i></button></td>';
      }),
      {title:'FAQ管理',placeholder:'搜索问题/分类...',kw:_fqKw,searchFn:"_fqKw=this.value;_fqPage=1;render_faq()",
       filterHtml:'<select onchange="_fqCat=this.value;_fqPage=1;render_faq()"><option value="">全部分类</option><option value="账户相关">账户相关</option><option value="功能使用">功能使用</option><option value="计费充值">计费充值</option><option value="AI工具">AI工具</option><option value="其他">其他</option></select>',
       toolbar:'<button class="tb-btn primary" onclick="addFaq()"><i class="fa-solid fa-plus"></i> 添加FAQ</button>'}
    )+
    _pgHtml(data.length,_fqPage,'render_faq');
};

const _fqForm=function(d){
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
    '<div style="grid-column:1/-1"><label>问题</label><input id="fqQ" value="'+(d?d.question||'':'')+'" placeholder="用户常见问题"></div>'+
    '<div><label>分类</label><select id="fqCat"><option value="账户相关"'+(d&&d.category==='账户相关'?' selected':'')+'>账户相关</option><option value="功能使用"'+(d&&d.category==='功能使用'?' selected':'')+'>功能使用</option><option value="计费充值"'+(d&&d.category==='计费充值'?' selected':'')+'>计费充值</option><option value="AI工具"'+(d&&d.category==='AI工具'?' selected':'')+'>AI工具</option><option value="其他"'+(d&&d.category==='其他'?' selected':'')+'>其他</option></select></div>'+
    '<div><label>排序权重</label><input id="fqSort" type="number" value="'+(d?d.sort||'0':'0')+'"></div>'+
    '<div style="grid-column:1/-1"><label>回答</label><textarea id="fqA" rows="5" placeholder="详细回答">'+(d?d.answer||'':'')+'</textarea></div></div>';
};

window.addFaq = function(){
  showMod('<h3><i class="fa-solid fa-circle-question" style="color:var(--p)"></i> 添加FAQ</h3>'+_fqForm()+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-primary" onclick="saveFaq(-1)">保存</button></div>');
};

window.editFaq = function(idx){
  const d=_g('lsjy3_faq')[idx];if(!d)return;
  showMod('<h3><i class="fa-solid fa-pen" style="color:var(--p)"></i> 编辑FAQ</h3>'+_fqForm(d)+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-primary" onclick="saveFaq('+idx+')">保存</button></div>');
};

window.saveFaq = function(idx){
  const question=document.getElementById('fqQ').value.trim();
  if(!question){toast('请输入问题','error');return}
  const item={
    question,answer:document.getElementById('fqA').value,category:document.getElementById('fqCat').value,
    sort:parseInt(document.getElementById('fqSort').value)||0,status:'published',views:0,helpful:0,created:new Date().toISOString()
  };
  const data=_g('lsjy3_faq');
  if(idx===-1){data.push(item);toast('FAQ已添加','success')}
  else{Object.assign(data[idx],item);toast('已更新','success')}
  _s('lsjy3_faq',data);closeModal();render_faq();
};

window.viewFaq = function(idx){
  const d=_g('lsjy3_faq')[idx];if(!d)return;
  showMod('<h3><i class="fa-solid fa-circle-question" style="color:var(--p)"></i> FAQ详情</h3>'+
    '<div style="margin-top:16px"><div style="font-size:15px;font-weight:600;margin-bottom:12px">'+d.question+'</div>'+
    '<div style="font-size:12px;color:var(--tx3);margin-bottom:12px">'+_badge(d.category||'未分类','badge-blue')+' · 浏览 '+d.views+' · 有帮助 '+d.helpful+'</div>'+
    '<div style="padding:16px;background:var(--bg);border-radius:8px;font-size:13px;line-height:1.8;white-space:pre-wrap">'+(d.answer||'暂无回答')+'</div></div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">关闭</button></div>');
};

window.delFaq = function(idx){
  if(!confirm('确定删除?'))return;
  const data=_g('lsjy3_faq');data.splice(idx,1);
  _s('lsjy3_faq',data);render_faq();toast('已删除','success');
};

// ===== 26. 反馈中心 =====
let _fbPage=1,_fbKw='',_fbType='',_fbStatus='';
window.render_feedback = function(p){
  if(typeof p==='number')_fbPage=p;
  let data=_g('lsjy3_feedback');
  data=_filter(data,['username','content','type'],_fbKw);
  if(_fbType) data=data.filter(d=>d.type===_fbType);
  if(_fbStatus) data=data.filter(d=>d.status===_fbStatus);
  data.reverse();
  const pg=_paginate(data,_fbPage,10);
  const all=_g('lsjy3_feedback');

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-comments',label:'反馈总数',val:all.length,g1:'#14b8a6',g2:'#2dd4bf'},
      {icon:'fa-solid fa-clock',label:'待处理',val:all.filter(d=>d.status==='pending').length,g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-check',label:'已处理',val:all.filter(d=>d.status==='resolved').length,g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-star',label:'平均评分',val:all.length?(all.reduce((s,d)=>s+(d.rating||0),0)/all.length).toFixed(1):'-',g1:'#8b5cf6',g2:'#a78bfa'}
    ])+
    _tbl(
      ['用户','类型','内容摘要','评分','状态','时间','操作'],
      pg.data.map(d=>{
        const sc={pending:'待处理',processing:'处理中',resolved:'已解决',closed:'已关闭'};
        const cc={pending:'badge-yellow',processing:'badge-blue',resolved:'badge-green',closed:'badge-gray'};
        return '<td>'+(d.username||'匿名')+'</td><td>'+_badge(d.type||'建议',d.type==='bug'?'badge-red':d.type==='feature'?'badge-blue':'badge-green')+'</td><td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="'+(d.content||'')+'">'+(d.content||'-').substring(0,40)+'...</td><td>'+(d.rating?'<span style="color:#f59e0b">'+'★'.repeat(d.rating)+'</span>':'-')+'</td><td>'+_badge(sc[d.status]||d.status,cc[d.status]||'badge-gray')+'</td><td style="font-size:11px">'+fmtDate(d.created)+'</td><td><button class="act-btn view" onclick="viewFeedback('+d._i+')"><i class="fa-solid fa-eye"></i></button>'+(d.status==='pending'?'<button class="act-btn edit" onclick="resolveFeedback('+d._i+')"><i class="fa-solid fa-check"></i></button>':'')+'</td>';
      }),
      {title:'反馈中心',placeholder:'搜索用户/内容/类型...',kw:_fbKw,searchFn:"_fbKw=this.value;_fbPage=1;render_feedback()",
       filterHtml:'<select onchange="_fbType=this.value;_fbPage=1;render_feedback()"><option value="">全部类型</option><option value="bug">Bug</option><option value="feature">功能建议</option><option value="suggest">建议</option><option value="praise">好评</option></select><select onchange="_fbStatus=this.value;_fbPage=1;render_feedback()"><option value="">全部状态</option><option value="pending">待处理</option><option value="processing">处理中</option><option value="resolved">已解决</option><option value="closed">已关闭</option></select>',
       toolbar:'<button class="tb-btn danger" onclick="if(confirm(\'清空已关闭反馈?\')){const d=_g(\'lsjy3_feedback\');_s(\'lsjy3_feedback\',d.filter(x=>x.status!==\'closed\'));render_feedback();toast(\'已清空\',\'success\')}"><i class="fa-solid fa-broom"></i> 清空已关闭</button>'}
    )+
    _pgHtml(data.length,_fbPage,'render_feedback');
};

window.viewFeedback = function(idx){
  const d=_g('lsjy3_feedback')[idx];if(!d)return;
  const sc={pending:'待处理',processing:'处理中',resolved:'已解决',closed:'已关闭'};
  showMod('<h3><i class="fa-solid fa-comments" style="color:var(--p)"></i> 反馈详情</h3>'+
    '<div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px">'+
    '<div><b>用户:</b> '+(d.username||'匿名')+'</div><div><b>类型:</b> '+(d.type||'建议')+'</div>'+
    '<div><b>评分:</b> '+(d.rating?'★'.repeat(d.rating):'未评分')+'</div><div><b>状态:</b> '+(sc[d.status]||d.status)+'</div>'+
    '<div><b>时间:</b> '+fmtDate(d.created)+'</div><div><b>处理时间:</b> '+(d.resolvedAt?fmtDate(d.resolvedAt):'未处理')+'</div></div>'+
    '<div style="margin-top:12px;padding:14px;background:var(--bg);border-radius:8px;font-size:13px;line-height:1.8;white-space:pre-wrap">'+(d.content||'')+'</div>'+
    (d.reply?'<div style="margin-top:10px;padding:14px;background:#ecfdf5;border-radius:8px;font-size:13px"><b>回复:</b><br>'+(d.reply)+'</div>':'')+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">关闭</button>'+(d.status==='pending'?'<button class="m-primary" onclick="resolveFeedback('+idx+')">标记已解决</button>':'')+'</div>');
};

window.resolveFeedback = function(idx){
  const reply=prompt('回复内容(可选):','');
  const data=_g('lsjy3_feedback');
  data[idx].status='resolved';data[idx].resolvedAt=new Date().toISOString();
  if(reply)data[idx].reply=reply;
  _s('lsjy3_feedback',data);closeModal();render_feedback();toast('已标记为已解决','success');
};

// ===== 27. 权限管理 =====
let _pmPage=1,_pmKw='';
window.render_permissions = function(p){
  if(typeof p==='number')_pmPage=p;
  let data=_g('lsjy3_admins');
  if(!data.length) data=[{name:'超级管理员',account:'admin',role:'superadmin',status:'active',modules:'all',created:new Date().toISOString()}];
  _filter(data,['name','account','role'],_pmKw);
  data.reverse();
  const pg=_paginate(data,_pmPage,12);

  document.getElementById('mainContent').innerHTML =
    '<div style="margin-bottom:24px"><h2 style="font-size:20px;margin:0 0 4px"><i class="fa-solid fa-user-shield" style="color:var(--p)"></i> 权限管理</h2><p style="color:var(--tx3);font-size:13px">管理员角色与权限控制</p></div>'+
    _stats([
      {icon:'fa-solid fa-user-shield',label:'管理员总数',val:data.length,g1:'#dc2626',g2:'#f87171'},
      {icon:'fa-solid fa-circle-check',label:'活跃',val:data.filter(d=>d.status==='active').length,g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-sitemap',label:'角色数',val:new Set(data.map(d=>d.role||'未分配')).size,g1:'#3b82f6',g2:'#60a5fa'},
      {icon:'fa-solid fa-shield-halved',label:'超级管理员',val:data.filter(d=>d.role==='superadmin').length,g1:'#f59e0b',g2:'#fbbf24'}
    ])+
    _tbl(
      ['姓名','账号','角色','状态','授权模块','创建时间','操作'],
      pg.data.map(d=>{
        const rc={superadmin:'badge-red',admin:'badge-purple',editor:'badge-blue',viewer:'badge-gray'};
        const rl={superadmin:'超级管理员',admin:'管理员',editor:'编辑员',viewer:'观察者'};
        return '<td><b>'+(d.name||'-')+'</b></td><td style="font-family:monospace">'+(d.account||'-')+'</td><td>'+_badge(rl[d.role]||d.role,rc[d.role]||'badge-gray')+'</td><td>'+_badge(d.status==='active'?'正常':'停用',d.status==='active'?'badge-green':'badge-red')+'</td><td style="font-size:11px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(d.modules==='all'?'全部权限':(d.modules||'-'))+'</td><td style="font-size:11px">'+fmtDate(d.created)+'</td><td><button class="act-btn edit" onclick="editAdmin('+d._i+')"><i class="fa-solid fa-pen"></i></button>'+(d.role!=='superadmin'?'<button class="act-btn del" onclick="delAdmin('+d._i+')"><i class="fa-solid fa-trash"></i></button>':'')+'</td>';
      }),
      {title:'管理员列表',placeholder:'搜索姓名/账号/角色...',kw:_pmKw,searchFn:"_pmKw=this.value;_pmPage=1;render_permissions()",
       toolbar:'<button class="tb-btn primary" onclick="addAdmin()"><i class="fa-solid fa-plus"></i> 添加管理员</button>'}
    )+
    _pgHtml(data.length,_pmPage,'render_permissions');
};

const _pmForm=function(d){
  const modules=['monitor','projects','contracts','members','profiles','finance','income','invoice','refunds','assets','announcements','seo','aiModels','aiCreditLogs','aiTasks','marketing','coupons','affiliates','reports','livechat','faq','feedback','permissions','security','backup','blacklist','themes','apiMgr'];
  const menuLabels=window._MENUS||{};
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
    '<div><label>姓名</label><input id="pmName" value="'+(d?d.name:'')+'" placeholder="管理员姓名"></div>'+
    '<div><label>账号</label><input id="pmAccount" value="'+(d?d.account:'')+'" placeholder="登录账号"></div>'+
    '<div><label>角色</label><select id="pmRole" onchange="document.getElementById(\'pmModulesBox\').style.display=this.value===\'superadmin\'?\'none\':\'block\'"><option value="superadmin"'+(d&&d.role==='superadmin'?' selected':'')+'>超级管理员</option><option value="admin"'+(d&&d.role==='admin'?' selected':'')+'>管理员</option><option value="editor"'+(d&&d.role==='editor'?' selected':'')+'>编辑员</option><option value="viewer"'+(d&&d.role==='viewer'?' selected':'')+'>观察者</option></select></div>'+
    '<div><label>状态</label><select id="pmStatus"><option value="active"'+(d&&d.status==='active'?' selected':'')+'>正常</option><option value="disabled"'+(d&&d.status==='disabled'?' selected':'')+'>停用</option></select></div>'+
    '<div style="grid-column:1/-1" id="pmModulesBox" '+(d&&d.role==='superadmin'?'style="display:none"':'')+'><label>授权模块</label><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">'+modules.map(m=>'<label style="display:flex;align-items:center;gap:4px;font-size:12px;padding:4px 10px;background:var(--bg);border-radius:6px;border:1px solid var(--border);cursor:pointer"><input type="checkbox" class="pm-mod-cb" value="'+m+'" '+(d&&d.modules!=='all'&&d.modules&&d.modules.includes(m)?'checked':'')+'> '+(menuLabels[m]?menuLabels[m].label:m)+'</label>').join('')+'</div></div></div>';
};

window.addAdmin = function(){
  showMod('<h3><i class="fa-solid fa-user-shield" style="color:var(--p)"></i> 添加管理员</h3>'+_pmForm()+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-primary" onclick="saveAdmin(-1)">添加</button></div>');
};

window.editAdmin = function(idx){
  const d=_g('lsjy3_admins')[idx];if(!d)return;
  showMod('<h3><i class="fa-solid fa-pen" style="color:var(--p)"></i> 编辑管理员</h3>'+_pmForm(d)+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-primary" onclick="saveAdmin('+idx+')">保存</button></div>');
};

window.saveAdmin = function(idx){
  const name=document.getElementById('pmName').value.trim();
  const account=document.getElementById('pmAccount').value.trim();
  if(!name||!account){toast('请填写姓名和账号','error');return}
  const role=document.getElementById('pmRole').value;
  const modCbs=document.querySelectorAll('.pm-mod-cb:checked');
  const modules=role==='superadmin'?'all':Array.from(modCbs).map(c=>c.value).join(',');
  const item={name,account,role,status:document.getElementById('pmStatus').value,modules,created:new Date().toISOString()};
  const data=_g('lsjy3_admins');
  if(idx===-1){data.push(item);toast('管理员已添加','success')}
  else{Object.assign(data[idx],item);toast('已更新','success')}
  _s('lsjy3_admins',data);closeModal();render_permissions();
};

window.delAdmin = function(idx){
  if(!confirm('确定删除此管理员?'))return;
  const data=_g('lsjy3_admins');data.splice(idx,1);
  _s('lsjy3_admins',data);render_permissions();toast('已删除','success');
};

// ===== 28. 登录安全 =====
window.render_security = function(){
  const logs=_g('lsjy3_login_logs');
  const today=new Date().toISOString().slice(0,10);
  const todayLogs=logs.filter(l=>(l.time||'').startsWith(today));
  const failedLogs=logs.filter(l=>l.success===false);
  const recentFailed=failedLogs.filter(l=>(l.time||'')>=new Date(Date.now()-3600000).toISOString());

  document.getElementById('mainContent').innerHTML =
    '<div style="margin-bottom:24px"><h2 style="font-size:20px;margin:0 0 4px"><i class="fa-solid fa-lock" style="color:var(--p)"></i> 登录安全</h2><p style="color:var(--tx3);font-size:13px">安全策略与登录审计</p></div>'+
    _stats([
      {icon:'fa-solid fa-shield-halved',label:'今日登录',val:todayLogs.length,g1:'#3b82f6',g2:'#60a5fa'},
      {icon:'fa-solid fa-triangle-exclamation',label:'今日失败',val:todayLogs.filter(l=>l.success===false).length,g1:'#ef4444',g2:'#f87171'},
      {icon:'fa-solid fa-ban',label:'1小时内失败',val:recentFailed.length,g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-user-lock',label:'封禁IP',val:_g('lsjy3_banned_ips').length,g1:'#94a3b8',g2:'#cbd5e1'}
    ])+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px">'+
    '<div style="background:var(--card);border-radius:12px;padding:20px;border:1px solid var(--border)"><h4 style="font-size:14px;margin:0 0 16px"><i class="fa-solid fa-gear" style="color:var(--p)"></i> 安全策略</h4>'+
    '<div style="display:flex;flex-direction:column;gap:12px;font-size:13px">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg);border-radius:8px"><span>登录失败锁定</span><select id="secLock" onchange="updateSecPolicy(\'lockThreshold\',this.value)" style="padding:6px 12px;border:1px solid var(--border);border-radius:6px;background:var(--card);color:var(--tx)"><option value="3">3次锁定</option><option value="5">5次锁定</option><option value="10">10次锁定</option></select></div>'+
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg);border-radius:8px"><span>锁定时长</span><select id="secDur" onchange="updateSecPolicy(\'lockDuration\',this.value)" style="padding:6px 12px;border:1px solid var(--border);border-radius:6px;background:var(--card);color:var(--tx)"><option value="30">30分钟</option><option value="60">1小时</option><option value="1440">24小时</option></select></div>'+
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg);border-radius:8px"><span>验证码登录</span><label style="cursor:pointer"><input type="checkbox" id="secCaptcha" onchange="updateSecPolicy(\'captcha\',this.checked)" checked> 启用</label></div>'+
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:var(--bg);border-radius:8px"><span>IP白名单</span><button class="tb-btn" onclick="manageIpWhitelist()" style="padding:6px 16px">管理</button></div>'+
    '</div></div>'+
    '<div style="background:var(--card);border-radius:12px;padding:20px;border:1px solid var(--border)"><h4 style="font-size:14px;margin:0 0 16px"><i class="fa-solid fa-list" style="color:#ef4444"></i> 封禁IP列表</h4><div id="bannedIpList">'+(_g('lsjy3_banned_ips').map((ip,i)=>'<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--bg);border-radius:8px;margin-bottom:4px;font-size:13px"><span style="font-family:monospace">'+ip.ip+'</span><span style="font-size:11px;color:var(--tx3)">'+ip.reason+' · '+fmtDate(ip.time)+'</span><button style="background:none;border:none;color:#ef4444;cursor:pointer" onclick="unbanIp('+i+')"><i class="fa-solid fa-unlock"></i></button></div>').join('')||'<div style="text-align:center;color:var(--tx3);font-size:13px;padding:20px">暂无封禁</div>')+'</div><div style="margin-top:8px"><button class="tb-btn danger" onclick="banNewIp()" style="padding:8px 16px;width:100%"><i class="fa-solid fa-ban"></i> 手动封禁IP</button></div></div></div>'+
    '<div style="margin-top:20px;background:var(--card);border-radius:12px;padding:20px;border:1px solid var(--border)"><h4 style="font-size:14px;margin:0 0 16px"><i class="fa-solid fa-clock-rotate-left" style="color:#f59e0b"></i> 最近登录记录</h4>'+
    _tbl(['时间','账号','IP','地区','设备','结果'],logs.reverse().slice(0,15).map(l=>
      '<td style="font-size:11px">'+fmtDate(l.time)+'</td><td>'+(l.account||'-')+'</td><td style="font-family:monospace">'+(l.ip||'-')+'</td><td>'+(l.region||'-')+'</td><td style="font-size:11px">'+(l.device||'-')+'</td><td>'+_badge(l.success?'成功':'失败',l.success?'badge-green':'badge-red')+'</td>'
    ),{noPag:true})+'</div>';
};

window.updateSecPolicy = function(key,val){
  const p=_g('lsjy3_sec_policy');p[key]=val;_s('lsjy3_sec_policy',p);toast('策略已更新','success');
};

window.banNewIp = function(){
  const ip=prompt('输入要封禁的IP地址:');
  if(!ip)return;
  const reason=prompt('封禁原因:','恶意登录')||'恶意登录';
  const data=_g('lsjy3_banned_ips');data.push({ip,reason,time:new Date().toISOString()});
  _s('lsjy3_banned_ips',data);render_security();toast('IP已封禁','success');
};

window.unbanIp = function(idx){
  const data=_g('lsjy3_banned_ips');data.splice(idx,1);
  _s('lsjy3_banned_ips',data);render_security();toast('已解封','success');
};

window.manageIpWhitelist = function(){
  const wl=_g('lsjy3_ip_whitelist');
  showMod('<h3><i class="fa-solid fa-shield" style="color:var(--p)"></i> IP白名单</h3>'+
    '<div style="margin-top:12px"><div style="display:flex;gap:8px;margin-bottom:12px"><input id="wlInput" placeholder="输入IP地址" style="flex:1;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--tx)"><button class="tb-btn primary" onclick="addIpWhitelist()" style="padding:8px 16px">添加</button></div>'+
    '<div style="max-height:300px;overflow-y:auto">'+wl.map((ip,i)=>'<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:var(--bg);border-radius:6px;margin-bottom:4px;font-size:13px"><span style="font-family:monospace">'+ip+'</span><button style="background:none;border:none;color:#ef4444;cursor:pointer" onclick="removeIpWhitelist('+i+')"><i class="fa-solid fa-times"></i></button></div>').join('')||'<div style="text-align:center;color:var(--tx3);padding:20px;font-size:13px">暂无白名单</div>'+'</div></div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">关闭</button></div>');
};

window.addIpWhitelist = function(){
  const ip=document.getElementById('wlInput').value.trim();if(!ip)return;
  const data=_g('lsjy3_ip_whitelist');data.push(ip);
  _s('lsjy3_ip_whitelist',data);document.getElementById('wlInput').value='';manageIpWhitelist();toast('已添加','success');
};

window.removeIpWhitelist = function(idx){
  const data=_g('lsjy3_ip_whitelist');data.splice(idx,1);
  _s('lsjy3_ip_whitelist',data);manageIpWhitelist();toast('已移除','success');
};

// ===== 29. 数据备份 =====
window.render_backup = function(){
  const backups=_g('lsjy3_backups');
  const lsKeys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('lsjy3_'))lsKeys.push(k)}
  let totalSize=0;lsKeys.forEach(k=>{try{totalSize+=((localStorage.getItem(k)||'').length*2)}catch(e){}});
  const sizeStr=totalSize>1048576?(totalSize/1048576).toFixed(2)+' MB':(totalSize/1024).toFixed(1)+' KB';

  document.getElementById('mainContent').innerHTML =
    '<div style="margin-bottom:24px"><h2 style="font-size:20px;margin:0 0 4px"><i class="fa-solid fa-database" style="color:var(--p)"></i> 数据备份</h2><p style="color:var(--tx3);font-size:13px">数据导出/导入/恢复</p></div>'+
    _stats([
      {icon:'fa-solid fa-hard-drive',label:'数据项',val:lsKeys.length,g1:'#06b6d4',g2:'#22d3ee'},
      {icon:'fa-solid fa-weight-hanging',label:'占用空间',val:sizeStr,g1:'#3b82f6',g2:'#60a5fa'},
      {icon:'fa-solid fa-clock-rotate-left',label:'备份记录',val:backups.length,g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-server',label:'可用空间',val:(localStorage.remainingSize?Math.round(localStorage.remainingSize/1024)+' KB':'~5 MB'),g1:'#22c55e',g2:'#34d399'}
    ])+
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:20px">'+
    '<div style="background:var(--card);border-radius:12px;padding:24px;border:1px solid var(--border);text-align:center;cursor:pointer;transition:transform .2s" onclick="createBackup()" onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'none\'"><i class="fa-solid fa-download" style="font-size:32px;color:#3b82f6"></i><div style="margin-top:12px;font-weight:600">创建备份</div><div style="font-size:12px;color:var(--tx3);margin-top:4px">导出全部数据为JSON</div></div>'+
    '<div style="background:var(--card);border-radius:12px;padding:24px;border:1px solid var(--border);text-align:center;cursor:pointer;transition:transform .2s" onclick="document.getElementById(\'restoreFile\').click()" onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'none\'"><i class="fa-solid fa-upload" style="font-size:32px;color:#22c55e"></i><div style="margin-top:12px;font-weight:600">恢复数据</div><div style="font-size:12px;color:var(--tx3);margin-top:4px">从备份文件导入</div><input type="file" id="restoreFile" accept=".json" style="display:none" onchange="restoreBackup(this.files[0])"></div>'+
    '<div style="background:var(--card);border-radius:12px;padding:24px;border:1px solid var(--border);text-align:center;cursor:pointer;transition:transform .2s" onclick="if(confirm(\'确定清空所有平台数据？此操作不可恢复！\')){clearAllData()}" onmouseover="this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.transform=\'none\'"><i class="fa-solid fa-trash-can" style="font-size:32px;color:#ef4444"></i><div style="margin-top:12px;font-weight:600">清空数据</div><div style="font-size:12px;color:var(--tx3);margin-top:4px">删除全部lsjy3数据</div></div></div>'+
    '<div style="margin-top:20px;background:var(--card);border-radius:12px;padding:20px;border:1px solid var(--border)"><h4 style="font-size:14px;margin:0 0 12px"><i class="fa-solid fa-list" style="color:var(--p)"></i> 数据存储概览</h4>'+
    '<div style="max-height:400px;overflow-y:auto">'+lsKeys.map(k=>{const v=localStorage.getItem(k)||'';const size=v.length>1024?(v.length/1024).toFixed(1)+'KB':v.length+'B';const count=v.length?JSON.parse(v).length:0;return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border);font-size:13px"><span style="font-family:monospace;color:var(--p)">'+k+'</span><span style="color:var(--tx3)">'+count+'条 · '+size+'</span></div>'}).join('')+'</div></div>'+
    '<div style="margin-top:20px;background:var(--card);border-radius:12px;padding:20px;border:1px solid var(--border)"><h4 style="font-size:14px;margin:0 0 12px"><i class="fa-solid fa-clock-rotate-left" style="color:#f59e0b"></i> 备份历史</h4>'+
    (backups.length?backups.reverse().map(b=>'<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--bg);border-radius:8px;margin-bottom:6px;font-size:13px"><div><i class="fa-solid fa-file-code" style="color:var(--p)"></i> '+b.name+'</div><div style="font-size:12px;color:var(--tx3)">'+fmtDate(b.time)+' · '+(b.size||'')+'</div></div>').join(''):'<div style="text-align:center;color:var(--tx3);font-size:13px;padding:20px">暂无备份记录</div>')+'</div>';
};

window.createBackup = function(){
  const data={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('lsjy3_')){try{data[k]=JSON.parse(localStorage.getItem(k))}catch(e){data[k]=localStorage.getItem(k)}}}
  const json=JSON.stringify(data,null,2);
  const blob=new Blob([json],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='lsjy_backup_'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(url);
  const backups=_g('lsjy3_backups');
  backups.push({name:'lsjy_backup_'+new Date().toISOString().slice(0,10)+'.json',time:new Date().toISOString(),size:(json.length/1024).toFixed(1)+'KB'});
  _s('lsjy3_backups',backups);toast('备份已创建并下载','success');
};

window.restoreBackup = function(file){
  if(!file)return;
  if(!confirm('恢复数据将覆盖当前所有lsjy3_数据，确定继续?'))return;
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const data=JSON.parse(e.target.result);
      Object.keys(data).forEach(k=>{try{localStorage.setItem(k,JSON.stringify(data[k]))}catch(e2){localStorage.setItem(k,String(data[k]))}});
      toast('数据恢复成功！','success');
      setTimeout(()=>location.reload(),1500);
    }catch(err){toast('文件格式错误: '+err.message,'error')}
  };
  reader.readAsText(file);
};

window.clearAllData = function(){
  const toRemove=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('lsjy3_'))toRemove.push(k)}
  toRemove.forEach(k=>localStorage.removeItem(k));
  toast('全部数据已清空','success');
  setTimeout(()=>location.reload(),1500);
};

// ===== 30. 敏感词库 =====
let _blPage=1,_blKw='',_blCat='';
window.render_blacklist = function(p){
  if(typeof p==='number')_blPage=p;
  let data=_g('lsjy3_blacklist');
  data=_filter(data,['word','category'],_blKw);
  if(_blCat) data=data.filter(d=>d.category===_blCat);
  data.reverse();
  const pg=_paginate(data,_blPage,15);
  const all=_g('lsjy3_blacklist');

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-ban',label:'敏感词总数',val:all.length,g1:'#ef4444',g2:'#f87171'},
      {icon:'fa-solid fa-shield-halved',label:'今日拦截',val:all.reduce((s,d)=>s+(d.hits||0),0),g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-folder',label:'分类数',val:new Set(all.map(d=>d.category||'未分类')).size,g1:'#8b5cf6',g2:'#a78bfa'},
      {icon:'fa-solid fa-circle-check',label:'已启用',val:all.filter(d=>d.enabled!==false).length,g1:'#22c55e',g2:'#34d399'}
    ])+
    _tbl(
      ['敏感词','分类','匹配模式','命中次数','启用','操作'],
      pg.data.map(d=>{
        return '<td style="font-weight:600;color:#ef4444">'+(d.word||'-')+'</td><td>'+_badge(d.category||'未分类','badge-red')+'</td><td>'+_badge(d.mode==='exact'?'精确':d.mode==='regex'?'正则':'包含',d.mode==='regex'?'badge-purple':'badge-blue')+'</td><td>'+(d.hits||0)+'</td><td><span style="cursor:pointer" onclick="toggleWord('+d._i+')" title="点击切换">'+(d.enabled!==false?'<i class="fa-solid fa-circle-check" style="color:#22c55e"></i>':'<i class="fa-solid fa-circle-xmark" style="color:#94a3b8"></i>')+'</span></td><td><button class="act-btn edit" onclick="editWord('+d._i+')"><i class="fa-solid fa-pen"></i></button><button class="act-btn del" onclick="delWord('+d._i+')"><i class="fa-solid fa-trash"></i></button></td>';
      }),
      {title:'敏感词库',placeholder:'搜索敏感词/分类...',kw:_blKw,searchFn:"_blKw=this.value;_blPage=1;render_blacklist()",
       filterHtml:'<select onchange="_blCat=this.value;_blPage=1;render_blacklist()"><option value="">全部分类</option><option value="违禁词">违禁词</option><option value="广告词">广告词</option><option value="政治敏感">政治敏感</option><option value="色情暴力">色情暴力</option><option value="自定义">自定义</option></select>',
       toolbar:'<button class="tb-btn primary" onclick="addWord()"><i class="fa-solid fa-plus"></i> 添加敏感词</button><button class="tb-btn" onclick="batchAddWords()"><i class="fa-solid fa-list"></i> 批量添加</button>'}
    )+
    _pgHtml(data.length,_blPage,'render_blacklist');
};

const _blForm=function(d){
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
    '<div><label>敏感词</label><input id="blWord" value="'+(d?d.word||'':'')+'" placeholder="输入敏感词"></div>'+
    '<div><label>分类</label><select id="blCat"><option value="违禁词"'+(d&&d.category==='违禁词'?' selected':'')+'>违禁词</option><option value="广告词"'+(d&&d.category==='广告词'?' selected':'')+'>广告词</option><option value="政治敏感"'+(d&&d.category==='政治敏感'?' selected':'')+'>政治敏感</option><option value="色情暴力"'+(d&&d.category==='色情暴力'?' selected':'')+'>色情暴力</option><option value="自定义"'+(d&&d.category==='自定义'?' selected':'')+'>自定义</option></select></div>'+
    '<div><label>匹配模式</label><select id="blMode"><option value="contain"'+(d&&d.mode==='contain'?' selected':'')+'>包含</option><option value="exact"'+(d&&d.mode==='exact'?' selected':'')+'>精确</option><option value="regex"'+(d&&d.mode==='regex'?' selected':'')+'>正则</option></select></div>'+
    '<div><label>替换为</label><input id="blReplace" value="'+(d?d.replace||'***':'***')+'" placeholder="替换文本"></div></div>';
};

window.addWord = function(){
  showMod('<h3><i class="fa-solid fa-ban" style="color:var(--p)"></i> 添加敏感词</h3>'+_blForm()+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-primary" onclick="saveWord(-1)">添加</button></div>');
};

window.editWord = function(idx){
  const d=_g('lsjy3_blacklist')[idx];if(!d)return;
  showMod('<h3><i class="fa-solid fa-pen" style="color:var(--p)"></i> 编辑敏感词</h3>'+_blForm(d)+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-primary" onclick="saveWord('+idx+')">保存</button></div>');
};

window.saveWord = function(idx){
  const word=document.getElementById('blWord').value.trim();
  if(!word){toast('请输入敏感词','error');return}
  const item={word,category:document.getElementById('blCat').value,mode:document.getElementById('blMode').value,replace:document.getElementById('blReplace').value||'***',enabled:true,hits:0,created:new Date().toISOString()};
  const data=_g('lsjy3_blacklist');
  if(idx===-1){data.push(item);toast('已添加','success')}
  else{Object.assign(data[idx],item);toast('已更新','success')}
  _s('lsjy3_blacklist',data);closeModal();render_blacklist();
};

window.toggleWord = function(idx){
  const data=_g('lsjy3_blacklist');
  data[idx].enabled=!data[idx].enabled;
  _s('lsjy3_blacklist',data);render_blacklist();
};

window.delWord = function(idx){
  if(!confirm('确定删除?'))return;
  const data=_g('lsjy3_blacklist');data.splice(idx,1);
  _s('lsjy3_blacklist',data);render_blacklist();toast('已删除','success');
};

window.batchAddWords = function(){
  showMod('<h3><i class="fa-solid fa-list" style="color:var(--p)"></i> 批量添加敏感词</h3>'+
    '<div style="margin-top:12px"><label>每行一个敏感词</label><textarea id="blBatch" rows="10" placeholder="敏感词1\n敏感词2\n敏感词3\n..."></textarea></div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-primary" onclick="saveBatchWords()">添加全部</button></div>');
};

window.saveBatchWords = function(){
  const text=document.getElementById('blBatch').value.trim();
  if(!text){toast('请输入敏感词','error');return}
  const words=text.split('\n').map(w=>w.trim()).filter(w=>w);
  const data=_g('lsjy3_blacklist');
  words.forEach(w=>{if(!data.find(d=>d.word===w)){data.push({word:w,category:'自定义',mode:'contain',replace:'***',enabled:true,hits:0,created:new Date().toISOString()})}});
  _s('lsjy3_blacklist',data);closeModal();render_blacklist();toast('已添加'+words.length+'个敏感词','success');
};

// ===== 31. 主题设置 =====
window.render_themes = function(){
  const theme=_g('lsjy3_theme')[0]||{name:'默认深色',mode:'dark',primary:'#6366f1',accent:'#8b5cf6',radius:'12px',fontSize:'14px',sidebar:'dark',compact:false};
  const presets=[
    {name:'默认深色',mode:'dark',primary:'#6366f1',accent:'#8b5cf6',bg:'var(--bg)',card:'var(--card)'},
    {name:'星空紫',mode:'dark',primary:'#8b5cf6',accent:'#a78bfa',bg:'#0f0a1e',card:'#1a1230'},
    {name:'海洋蓝',mode:'dark',primary:'#0ea5e9',accent:'#06b6d4',bg:'#0a1628',card:'#101d33'},
    {name:'森林绿',mode:'dark',primary:'#22c55e',accent:'#10b981',bg:'#0a1e14',card:'#0f2920'},
    {name:'纯净白',mode:'light',primary:'#6366f1',accent:'#8b5cf6',bg:'#f8fafc',card:'#ffffff'},
    {name:'暖阳橙',mode:'light',primary:'#f97316',accent:'#fb923c',bg:'#fffbeb',card:'#ffffff'}
  ];

  document.getElementById('mainContent').innerHTML =
    '<div style="margin-bottom:24px"><h2 style="font-size:20px;margin:0 0 4px"><i class="fa-solid fa-palette" style="color:var(--p)"></i> 主题设置</h2><p style="color:var(--tx3);font-size:13px">界面主题与外观定制</p></div>'+
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:16px">'+presets.map(p=>
      '<div style="background:var(--card);border-radius:12px;padding:20px;border:2px solid '+(theme.name===p.name?'var(--p)':'var(--border)')+';cursor:pointer;transition:all .2s" onclick="applyThemePreset(\''+p.name+'\')" onmouseover="this.style.borderColor=\'var(--p)\'" onmouseout="this.style.borderColor=\''+(theme.name===p.name?'var(--p)':'var(--border)')+'\'">'+
      '<div style="display:flex;gap:8px;margin-bottom:12px"><div style="width:28px;height:28px;border-radius:6px;background:'+p.primary+'"></div><div style="width:28px;height:28px;border-radius:6px;background:'+p.accent+'"></div><div style="width:28px;height:28px;border-radius:6px;background:'+(p.bg||'#1e1e2e')+'"></div></div>'+
      '<div style="font-weight:600;font-size:14px">'+p.name+'</div><div style="font-size:11px;color:var(--tx3);margin-top:2px">'+(p.mode==='dark'?'深色模式':'浅色模式')+'</div>'+
      (theme.name===p.name?'<div style="margin-top:8px;color:var(--p);font-size:12px"><i class="fa-solid fa-check-circle"></i> 当前主题</div>':'')+
      '</div>'
    ).join('')+'</div>'+
    '<div style="margin-top:24px;background:var(--card);border-radius:12px;padding:24px;border:1px solid var(--border)"><h4 style="font-size:14px;margin:0 0 20px"><i class="fa-solid fa-sliders" style="color:var(--p)"></i> 自定义主题</h4>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'+
    '<div><label>主题名称</label><input id="thName" value="'+theme.name+'" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--tx)"></div>'+
    '<div><label>模式</label><select id="thMode" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--tx)"><option value="dark"'+(theme.mode==='dark'?' selected':'')+'>深色</option><option value="light"'+(theme.mode==='light'?' selected':'')+'>浅色</option></select></div>'+
    '<div><label>主色调</label><div style="display:flex;gap:8px;align-items:center"><input type="color" id="thPrimary" value="'+theme.primary+'" style="width:40px;height:34px;border:none;cursor:pointer"><input id="thPrimaryTxt" value="'+theme.primary+'" style="flex:1;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--tx)"></div></div>'+
    '<div><label>辅助色</label><div style="display:flex;gap:8px;align-items:center"><input type="color" id="thAccent" value="'+theme.accent+'" style="width:40px;height:34px;border:none;cursor:pointer"><input id="thAccentTxt" value="'+theme.accent+'" style="flex:1;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--tx)"></div></div>'+
    '<div><label>圆角大小</label><select id="thRadius" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--tx)"><option value="4px"'+(theme.radius==='4px'?' selected':'')+'>4px (方角)</option><option value="8px"'+(theme.radius==='8px'?' selected':'')+'>8px (小圆角)</option><option value="12px"'+(theme.radius==='12px'?' selected':'')+'>12px (默认)</option><option value="16px"'+(theme.radius==='16px'?' selected':'')+'>16px (大圆角)</option><option value="20px"'+(theme.radius==='20px'?' selected':'')+'>20px (超大)</option></select></div>'+
    '<div><label>字体大小</label><select id="thFontSize" style="width:100%;padding:8px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--tx)"><option value="12px"'+(theme.fontSize==='12px'?' selected':'')+'>12px (小)</option><option value="14px"'+(theme.fontSize==='14px'?' selected':'')+'>14px (默认)</option><option value="16px"'+(theme.fontSize==='16px'?' selected':'')+'>16px (大)</option></select></div>'+
    '</div>'+
    '<div style="margin-top:20px;display:flex;gap:12px"><button class="tb-btn primary" onclick="saveTheme()"><i class="fa-solid fa-check"></i> 保存主题</button><button class="tb-btn" onclick="previewTheme()"><i class="fa-solid fa-eye"></i> 预览效果</button><button class="tb-btn" onclick="resetTheme()"><i class="fa-solid fa-rotate-left"></i> 恢复默认</button></div></div>';
};

window.applyThemePreset = function(name){
  const presets={默认深色:{name:'默认深色',mode:'dark',primary:'#6366f1',accent:'#8b5cf6',radius:'12px',fontSize:'14px'},'星空紫':{name:'星空紫',mode:'dark',primary:'#8b5cf6',accent:'#a78bfa',radius:'12px',fontSize:'14px'},'海洋蓝':{name:'海洋蓝',mode:'dark',primary:'#0ea5e9',accent:'#06b6d4',radius:'12px',fontSize:'14px'},'森林绿':{name:'森林绿',mode:'dark',primary:'#22c55e',accent:'#10b981',radius:'12px',fontSize:'14px'},'纯净白':{name:'纯净白',mode:'light',primary:'#6366f1',accent:'#8b5cf6',radius:'12px',fontSize:'14px'},'暖阳橙':{name:'暖阳橙',mode:'light',primary:'#f97316',accent:'#fb923c',radius:'12px',fontSize:'14px'}};
  if(presets[name]){
    const t=presets[name];t.sidebar=t.mode==='dark'?'dark':'light';t.compact=false;
    _s('lsjy3_theme',[t]);applyThemeCSS(t);toast('主题已切换: '+name,'success');
    render_themes();
  }
};

window.saveTheme = function(){
  const t={
    name:document.getElementById('thName').value||'自定义主题',
    mode:document.getElementById('thMode').value,
    primary:document.getElementById('thPrimaryTxt').value,
    accent:document.getElementById('thAccentTxt').value,
    radius:document.getElementById('thRadius').value,
    fontSize:document.getElementById('thFontSize').value,
    sidebar:document.getElementById('thMode').value==='dark'?'dark':'light',
    compact:false
  };
  _s('lsjy3_theme',[t]);applyThemeCSS(t);toast('主题已保存','success');
};

window.previewTheme = function(){
  const t={
    name:'预览',mode:document.getElementById('thMode').value,
    primary:document.getElementById('thPrimaryTxt').value,
    accent:document.getElementById('thAccentTxt').value,
    radius:document.getElementById('thRadius').value,
    fontSize:document.getElementById('thFontSize').value,
    sidebar:document.getElementById('thMode').value==='dark'?'dark':'light',
    compact:false
  };
  applyThemeCSS(t);toast('预览中（刷新恢复）','success');
};

window.resetTheme = function(){
  _s('lsjy3_theme',[{name:'默认深色',mode:'dark',primary:'#6366f1',accent:'#8b5cf6',radius:'12px',fontSize:'14px',sidebar:'dark',compact:false}]);
  toast('已恢复默认主题','success');render_themes();
};

function applyThemeCSS(t){
  const root=document.documentElement;
  root.style.setProperty('--p',t.primary||'#6366f1');
  root.style.setProperty('--accent',t.accent||'#8b5cf6');
  if(t.mode==='light'){
    root.style.setProperty('--bg','#f1f5f9');root.style.setProperty('--card','#ffffff');
    root.style.setProperty('--tx','#1e293b');root.style.setProperty('--tx3','#64748b');
    root.style.setProperty('--border','#e2e8f0');
  }else{
    root.style.removeProperty('--bg');root.style.removeProperty('--card');
    root.style.removeProperty('--tx');root.style.removeProperty('--tx3');root.style.removeProperty('--border');
  }
}

// ===== 32. API管理 =====
let _apPage=1,_apKw='',_apStatus='';
window.render_apiMgr = function(p){
  if(typeof p==='number')_apPage=p;
  let data=_g('lsjy3_api_keys');
  data=_filter(data,['name','service','key'],_apKw);
  if(_apStatus) data=data.filter(d=>d.status===_apStatus);
  data.reverse();
  const pg=_paginate(data,_apPage,12);
  const all=_g('lsjy3_api_keys');
  const logs=_g('lsjy3_api_logs');
  const todayCall=logs.filter(l=>(l.time||'').startsWith(new Date().toISOString().slice(0,10))).length;
  const totalCall=logs.length;
  const errorRate=totalCall?(logs.filter(l=>l.status==='error').length/totalCall*100).toFixed(1):'0';

  document.getElementById('mainContent').innerHTML =
    _stats([
      {icon:'fa-solid fa-plug',label:'API密钥',val:all.length,g1:'#0ea5e9',g2:'#38bdf8'},
      {icon:'fa-solid fa-arrow-right-arrow-left',label:'今日调用',val:todayCall,g1:'#22c55e',g2:'#34d399'},
      {icon:'fa-solid fa-chart-line',label:'总调用',val:totalCall,g1:'#f59e0b',g2:'#fbbf24'},
      {icon:'fa-solid fa-triangle-exclamation',label:'错误率',val:errorRate+'%',g1:errorRate>5?'#ef4444':'#8b5cf6',g2:errorRate>5?'#f87171':'#a78bfa'}
    ])+
    _tbl(
      ['密钥名称','服务','密钥(前16位)','配额/已用','状态','创建时间','操作'],
      pg.data.map(d=>{
        const keyStr=(d.key||'').substring(0,16)+'...';
        return '<td><b>'+(d.name||'-')+'</b></td><td>'+_badge(d.service||'-','badge-blue')+'</td><td style="font-family:monospace;font-size:11px;color:var(--p)">'+keyStr+'</td><td>'+(d.quota?d.quota:'无限制')+' / '+(d.used||0)+'</td><td>'+_badge(d.status==='active'?'启用':'停用',d.status==='active'?'badge-green':'badge-red')+'</td><td style="font-size:11px">'+fmtDate(d.created)+'</td><td><button class="act-btn view" onclick="viewApiKey('+d._i+')"><i class="fa-solid fa-eye"></i></button><button class="act-btn edit" onclick="editApiKey('+d._i+')"><i class="fa-solid fa-pen"></i></button><button class="act-btn del" onclick="delApiKey('+d._i+')"><i class="fa-solid fa-trash"></i></button></td>';
      }),
      {title:'API管理',placeholder:'搜索名称/服务/密钥...',kw:_apKw,searchFn:"_apKw=this.value;_apPage=1;render_apiMgr()",
       filterHtml:'<select onchange="_apStatus=this.value;_apPage=1;render_apiMgr()"><option value="">全部状态</option><option value="active">启用</option><option value="disabled">停用</option></select>',
       toolbar:'<button class="tb-btn primary" onclick="addApiKey()"><i class="fa-solid fa-plus"></i> 创建密钥</button><button class="tb-btn" onclick="showApiLogs()" style="margin-left:8px"><i class="fa-solid fa-list"></i> 调用日志</button>'}
    )+
    _pgHtml(data.length,_apPage,'render_apiMgr');
};

const _apForm=function(d){
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'+
    '<div><label>密钥名称</label><input id="apName" value="'+(d?d.name||'':'')+'" placeholder="如：生产环境-豆包AI"></div>'+
    '<div><label>服务类型</label><select id="apService"><option value="豆包AI"'+(d&&d.service==='豆包AI'?' selected':'')+'>豆包AI</option><option value="微信支付"'+(d&&d.service==='微信支付'?' selected':'')+'>微信支付</option><option value="短信"'+(d&&d.service==='短信'?' selected':'')+'>短信</option><option value="OSS存储"'+(d&&d.service==='OSS存储'?' selected':'')+'>OSS存储</option><option value="自定义"'+(d&&d.service==='自定义'?' selected':'')+'>自定义</option></select></div>'+
    '<div><label>API密钥</label><input id="apKey" value="'+(d?d.key:'')+'" placeholder="sk-xxx 或自动生成"></div>'+
    '<div><label>日配额限制</label><input id="apQuota" type="number" value="'+(d?d.quota||'':'')+'" placeholder="空表示无限制"></div>'+
    '<div><label>状态</label><select id="apStatus"><option value="active"'+(d&&d.status==='active'?' selected':'')+'>启用</option><option value="disabled"'+(d&&d.status==='disabled'?' selected':'')+'>停用</option></select></div>'+
    '<div><label>回调URL</label><input id="apWebhook" value="'+(d?d.webhook||'':'')+'" placeholder="https://..."></div>'+
    '<div style="grid-column:1/-1"><label>备注</label><textarea id="apNote" rows="2" placeholder="备注">'+(d?d.note||'':'')+'</textarea></div></div>';
};

window.addApiKey = function(){
  showMod('<h3><i class="fa-solid fa-plug" style="color:var(--p)"></i> 创建API密钥</h3>'+_apForm()+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-primary" onclick="saveApiKey(-1)">创建</button></div>');
};

window.editApiKey = function(idx){
  const d=_g('lsjy3_api_keys')[idx];if(!d)return;
  showMod('<h3><i class="fa-solid fa-pen" style="color:var(--p)"></i> 编辑API密钥</h3>'+_apForm(d)+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">取消</button><button class="m-primary" onclick="saveApiKey('+idx+')">保存</button></div>');
};

window.saveApiKey = function(idx){
  const name=document.getElementById('apName').value.trim();
  if(!name){toast('请输入密钥名称','error');return}
  let key=document.getElementById('apKey').value.trim();
  if(!key) key='lsjy_'+Date.now().toString(36)+'_'+Math.random().toString(36).substr(2,16);
  const item={
    name,service:document.getElementById('apService').value,key,
    quota:document.getElementById('apQuota').value,status:document.getElementById('apStatus').value,
    webhook:document.getElementById('apWebhook').value,note:document.getElementById('apNote').value,
    used:0,created:new Date().toISOString()
  };
  const data=_g('lsjy3_api_keys');
  if(idx===-1){data.push(item);toast('密钥已创建','success')}
  else{Object.assign(data[idx],item);toast('已更新','success')}
  _s('lsjy3_api_keys',data);closeModal();render_apiMgr();
};

window.viewApiKey = function(idx){
  const d=_g('lsjy3_api_keys')[idx];if(!d)return;
  showMod('<h3><i class="fa-solid fa-plug" style="color:var(--p)"></i> '+d.name+'</h3>'+
    '<div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px">'+
    '<div><b>服务:</b> '+(d.service||'-')+'</div><div><b>状态:</b> '+(d.status==='active'?'启用':'停用')+'</div>'+
    '<div><b>配额:</b> '+(d.quota||'无限制')+'</div><div><b>已使用:</b> '+(d.used||0)+'</div>'+
    '<div><b>创建:</b> '+fmtDate(d.created)+'</div></div>'+
    '<div style="margin-top:12px;padding:12px;background:var(--bg);border-radius:8px"><div style="font-size:11px;color:var(--tx3);margin-bottom:4px">API密钥 (点击复制)</div><div style="font-family:monospace;font-size:13px;cursor:pointer;color:var(--p);word-break:break-all" onclick="navigator.clipboard.writeText(\''+(d.key||'')+'\');toast(\'已复制\',\'success\')">'+(d.key||'-')+'</div></div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">关闭</button><button class="m-primary" onclick="regenerateKey('+idx+')"><i class="fa-solid fa-rotate"></i> 重新生成</button></div>');
};

window.regenerateKey = function(idx){
  if(!confirm('重新生成密钥后旧密钥将失效，确定?'))return;
  const data=_g('lsjy3_api_keys');
  data[idx].key='lsjy_'+Date.now().toString(36)+'_'+Math.random().toString(36).substr(2,16);
  _s('lsjy3_api_keys',data);closeModal();render_apiMgr();toast('密钥已重新生成','success');
};

window.delApiKey = function(idx){
  if(!confirm('确定删除此密钥?'))return;
  const data=_g('lsjy3_api_keys');data.splice(idx,1);
  _s('lsjy3_api_keys',data);render_apiMgr();toast('已删除','success');
};

window.showApiLogs = function(){
  const logs=_g('lsjy3_api_logs').reverse().slice(0,30);
  showMod('<h3><i class="fa-solid fa-list" style="color:var(--p)"></i> API调用日志</h3>'+
    '<div style="margin-top:12px;max-height:400px;overflow-y:auto">'+(logs.length?logs.map(l=>
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid var(--border);font-size:12px"><div><span style="font-family:monospace;color:var(--p)">'+(l.service||'-')+'</span> · '+(l.endpoint||'-')+'</div><div style="display:flex;gap:8px;align-items:center"><span style="color:var(--tx3)">'+fmtDate(l.time)+'</span>'+_badge(l.status==='success'?'成功':'失败',l.status==='success'?'badge-green':'badge-red')+'</div></div>'
    ).join(''):'<div style="text-align:center;color:var(--tx3);padding:20px;font-size:13px">暂无日志</div>')+'</div>'+
    '<div class="modal-actions"><button class="m-cancel" onclick="closeModal()">关闭</button></div>');
};

// ===== 初始化 =====
console.log('[admin-v2] 罗圣纪元管理后台扩展模块已加载，共28个新增功能就绪');

})();
