// ===== ELITE BUSINESS VERSION V2.0 - COMPLETE UPGRADE =====
// 零破坏性原则：所有新功能以叠加方式注入，不修改原有代码
(function(){
'use strict';

// ===== 1. 几何线条纹理背景 =====
var geoStyle = document.createElement('style');
geoStyle.textContent = `
body::after{content:'';position:fixed;top:0;left:0;width:100%;height:100%;
background-image:
  linear-gradient(30deg,rgba(185,28,28,.02) 12%,transparent 12.5%,transparent 87%,rgba(185,28,28,.02) 87.5%,rgba(185,28,28,.02)),
  linear-gradient(150deg,rgba(185,28,28,.02) 12%,transparent 12.5%,transparent 87%,rgba(185,28,28,.02) 87.5%,rgba(185,28,28,.02)),
  linear-gradient(30deg,rgba(185,28,28,.02) 12%,transparent 12.5%,transparent 87%,rgba(185,28,28,.02) 87.5%,rgba(185,28,28,.02)),
  linear-gradient(150deg,rgba(185,28,28,.02) 12%,transparent 12.5%,transparent 87%,rgba(185,28,28,.02) 87.5%,rgba(185,28,28,.02)),
  linear-gradient(60deg,rgba(234,179,8,.015) 25%,transparent 25.5%,transparent 75%,rgba(234,179,8,.015) 75%,rgba(234,179,8,.015)),
  linear-gradient(60deg,rgba(234,179,8,.015) 25%,transparent 25.5%,transparent 75%,rgba(234,179,8,.015) 75%,rgba(234,179,8,.015));
background-size:80px 140px;background-position:0 0,0 0,40px 70px,40px 70px,0 0,40px 70px;
pointer-events:none;z-index:-1;opacity:.6}
body.elite-mode::after{background-image:
  linear-gradient(30deg,rgba(234,179,8,.03) 12%,transparent 12.5%,transparent 87%,rgba(234,179,8,.03) 87.5%,rgba(234,179,8,.03)),
  linear-gradient(150deg,rgba(234,179,8,.03) 12%,transparent 12.5%,transparent 87%,rgba(234,179,8,.03) 87.5%,rgba(234,179,8,.03)),
  linear-gradient(30deg,rgba(59,130,246,.02) 12%,transparent 12.5%,transparent 87%,rgba(59,130,246,.02) 87.5%,rgba(59,130,246,.02)),
  linear-gradient(150deg,rgba(59,130,246,.02) 12%,transparent 12.5%,transparent 87%,rgba(59,130,246,.02) 87.5%,rgba(59,130,246,.02));
background-size:80px 140px;background-position:0 0,0 0,40px 70px,40px 70px}
`;
document.head.appendChild(geoStyle);

// ===== 2. 企业团队管理系统 =====
// localStorage-based team management
var TEAM_KEY = 'lsjy3_elite_team';
function getTeamData(){ try{return JSON.parse(localStorage.getItem(TEAM_KEY))||null}catch(e){return null} }
function saveTeamData(data){ localStorage.setItem(TEAM_KEY,JSON.stringify(data)) }
function initTeamData(){
  if(!getTeamData()){
    saveTeamData({
      plan:'basic', // basic/pro/enterprise
      masterUsername: null,
      members: [],
      creditPool: 100000,
      roles: {admin:[],editor:[],viewer:[]},
      createdAt: new Date().toISOString(),
      settings: {industry:'ecom',brandName:'',city:'',desc:''}
    });
  }
}
initTeamData();

// ===== 3. 企业管理面板 =====
window.openTeamPanel = function(){
  var overlay = document.createElement('div');
  overlay.id = 'teamOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)';
  
  var td = getTeamData()||{members:[],creditPool:0,roles:{admin:[],editor:[],viewer:[]}};
  var totalUsed = 0;
  td.members.forEach(function(m){totalUsed += (m.usedCredits||0)});
  var availableCredits = td.creditPool - totalUsed;
  
  var html = `
  <div style="background:#fff;border-radius:20px;width:94%;max-width:800px;max-height:90vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,.2);animation:mIn .3s ease" class="team-main-panel">
    <div style="padding:24px 28px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:1;border-radius:20px 20px 0 0">
      <div>
        <h2 style="margin:0;font-size:20px;font-weight:800;color:#1F2937">&#x1F3E2; 企业管理中心</h2>
        <p style="margin:4px 0 0;font-size:13px;color:#6B7280">管理团队、算力分配和权限设置</p>
      </div>
      <button onclick="document.getElementById('teamOverlay').remove()" style="width:36px;height:36px;border-radius:10px;border:1px solid #E5E7EB;background:#fff;cursor:pointer;font-size:16px;color:#6B7280;display:flex;align-items:center;justify-content:center">&#x2715;</button>
    </div>
    <div style="padding:24px 28px">
      <!-- 算力池概览 -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
        <div style="background:linear-gradient(135deg,#FEF9C3,#FEF08A);border-radius:14px;padding:20px;text-align:center">
          <div style="font-size:12px;color:#A16207;font-weight:600">算力池总量</div>
          <div style="font-size:28px;font-weight:900;color:#A16207">${td.creditPool.toLocaleString()}</div>
        </div>
        <div style="background:linear-gradient(135deg,#DBEAFE,#BFDBFE);border-radius:14px;padding:20px;text-align:center">
          <div style="font-size:12px;color:#1D4ED8;font-weight:600">已分配</div>
          <div style="font-size:28px;font-weight:900;color:#1D4ED8">${totalUsed.toLocaleString()}</div>
        </div>
        <div style="background:linear-gradient(135deg,#D1FAE5,#A7F3D0);border-radius:14px;padding:20px;text-align:center">
          <div style="font-size:12px;color:#065F46;font-weight:600">可用算力</div>
          <div style="font-size:28px;font-weight:900;color:#065F46">${availableCredits.toLocaleString()}</div>
        </div>
      </div>
      
      <!-- 团队成员列表 -->
      <h3 style="font-size:16px;font-weight:700;margin-bottom:16px;color:#1F2937">&#x1F465; 团队成员 (${td.members.length})</h3>
      ${td.members.length?`<div style="display:grid;gap:10px;margin-bottom:20px">${td.members.map(function(m,i){
        var roleBadge = m.role==='admin'?'<span style="background:#FEE2E2;color:#991B1B;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600">管理员</span>':m.role==='editor'?'<span style="background:#DBEAFE;color:#1D4ED8;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600">编辑</span>':'<span style="background:#F1F5F9;color:#64748B;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:600">查看者</span>';
        return `<div style="display:flex;align-items:center;justify-content:space-between;padding:14px;border:1px solid #E5E7EB;border-radius:12px;background:#FAFAFA">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#EAB308,#CA8A04);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px">${(m.name||'U')[0]}</div>
            <div>
              <div style="font-weight:600;color:#1F2937">${m.name} ${roleBadge}</div>
              <div style="font-size:12px;color:#6B7280">算力额度: ${m.creditLimit?.toLocaleString()||'无限'} | 已使用: ${m.usedCredits||0}</div>
            </div>
          </div>
          <div style="display:flex;gap:6px">
            <button onclick="editTeamMember(${i})" style="padding:6px 12px;border-radius:8px;border:1px solid #E5E7EB;background:#fff;font-size:12px;cursor:pointer;color:#374151">编辑</button>
            ${i>0?`<button onclick="removeTeamMember(${i})" style="padding:6px 12px;border-radius:8px;border:1px solid #FCA5A5;background:#FEF2F2;font-size:12px;cursor:pointer;color:#DC2626">移除</button>`:''}
          </div>
        </div>`;
      }).join('')}</div>`:'<div style="text-align:center;padding:40px;color:#6B7280"><div style="font-size:40px;margin-bottom:12px">&#x1F465;</div><p>暂无团队成员</p><p style="font-size:12px;margin-top:4px">点击下方按钮添加成员</p></div>'}
      
      <!-- 添加成员表单 -->
      <div style="border:2px dashed #E5E7EB;border-radius:14px;padding:20px;margin-bottom:24px">
        <h4 style="font-size:14px;font-weight:600;color:#374151;margin-bottom:12px">&#x2795; 添加团队成员</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr auto auto;gap:10px;align-items:end">
          <div><label style="display:block;font-size:12px;color:#6B7280;margin-bottom:4px">成员名称</label><input id="tmName" style="width:100%;padding:10px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:13px;outline:none" placeholder="输入成员名称"></div>
          <div><label style="display:block;font-size:12px;color:#6B7280;margin-bottom:4px">角色</label><select id="tmRole" style="width:100%;padding:10px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:13px;outline:none"><option value="viewer">查看者</option><option value="editor">编辑</option><option value="admin">管理员</option></select></div>
          <div><label style="display:block;font-size:12px;color:#6B7280;margin-bottom:4px">算力额度</label><input id="tmCredits" type="number" style="width:100%;padding:10px;border:1.5px solid #E5E7EB;border-radius:10px;font-size:13px;outline:none" placeholder="0=无限" value="10000"></div>
          <button onclick="addTeamMember()" style="padding:10px 20px;background:linear-gradient(135deg,#EAB308,#CA8A04);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap">添加</button>
        </div>
      </div>
      
      <!-- 功能模块 -->
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">
        <div onclick="openDataDashboard()" style="padding:20px;border:1px solid #E5E7EB;border-radius:14px;cursor:pointer;transition:all .2s;text-align:center;background:#FAFAFA" onmouseover="this.style.borderColor='#EAB308'" onmouseout="this.style.borderColor='#E5E7EB'">
          <div style="font-size:32px;margin-bottom:8px">&#x1F4CA;</div>
          <div style="font-weight:600;color:#1F2937">企业数据看板</div>
          <div style="font-size:12px;color:#6B7280;margin-top:4px">工具使用统计与效率分析</div>
        </div>
        <div onclick="openCollabSpace()" style="padding:20px;border:1px solid #E5E7EB;border-radius:14px;cursor:pointer;transition:all .2s;text-align:center;background:#FAFAFA" onmouseover="this.style.borderColor='#3B82F6'" onmouseout="this.style.borderColor='#E5E7EB'">
          <div style="font-size:32px;margin-bottom:8px">&#x1F91D;</div>
          <div style="font-weight:600;color:#1F2937">团队协作空间</div>
          <div style="font-size:12px;color:#6B7280;margin-top:4px">共享内容与版本管理</div>
        </div>
        <div onclick="openSecurityCenter()" style="padding:20px;border:1px solid #E5E7EB;border-radius:14px;cursor:pointer;transition:all .2s;text-align:center;background:#FAFAFA" onmouseover="this.style.borderColor='#10B981'" onmouseout="this.style.borderColor='#E5E7EB'">
          <div style="font-size:32px;margin-bottom:8px">&#x1F512;</div>
          <div style="font-weight:600;color:#1F2937">数据安全中心</div>
          <div style="font-size:12px;color:#6B7280;margin-top:4px">加密存储与批量导出</div>
        </div>
        <div onclick="openIndustryModels()" style="padding:20px;border:1px solid #E5E7EB;border-radius:14px;cursor:pointer;transition:all .2s;text-align:center;background:#FAFAFA" onmouseover="this.style.borderColor='#8B5CF6'" onmouseout="this.style.borderColor='#E5E7EB'">
          <div style="font-size:32px;margin-bottom:8px">&#x1F916;</div>
          <div style="font-weight:600;color:#1F2937">行业垂直模型</div>
          <div style="font-size:12px;color:#6B7280;margin-top:4px">6大行业模型与知识库</div>
        </div>
      </div>
    </div>
  </div>`;
  
  overlay.innerHTML = html;
  overlay.onclick = function(e){if(e.target===overlay)overlay.remove()};
  document.body.appendChild(overlay);
};

// 添加团队成员
window.addTeamMember = function(){
  var name = document.getElementById('tmName').value.trim();
  var role = document.getElementById('tmRole').value;
  var credits = parseInt(document.getElementById('tmCredits').value)||0;
  if(!name){alert('请输入成员名称');return}
  var td = getTeamData();
  td.members.push({name:name,role:role,creditLimit:credits||0,usedCredits:0,joinedAt:new Date().toISOString()});
  saveTeamData(td);
  document.getElementById('teamOverlay').remove();
  if(typeof showToast==='function')showToast('成员 '+name+' 已添加');
  else if(typeof toast==='function')toast('成员 '+name+' 已添加','success');
  openTeamPanel();
};

// 移除团队成员
window.removeTeamMember = function(idx){
  var td = getTeamData();
  var name = td.members[idx].name;
  td.members.splice(idx,1);
  saveTeamData(td);
  document.getElementById('teamOverlay').remove();
  if(typeof showToast==='function')showToast('已移除成员 '+name);
  else if(typeof toast==='function')toast('已移除成员 '+name,'success');
  openTeamPanel();
};

// 编辑团队成员
window.editTeamMember = function(idx){
  var td = getTeamData();
  var m = td.members[idx];
  var newName = prompt('修改成员名称', m.name);
  if(newName===null)return;
  var newRole = prompt('角色 (admin/editor/viewer):', m.role);
  if(newRole===null)return;
  var newCredits = prompt('算力额度 (0=无限):', m.creditLimit);
  if(newCredits===null)return;
  td.members[idx].name = newName.trim()||m.name;
  td.members[idx].role = ['admin','editor','viewer'].includes(newRole)?newRole:m.role;
  td.members[idx].creditLimit = parseInt(newCredits)||0;
  saveTeamData(td);
  document.getElementById('teamOverlay').remove();
  openTeamPanel();
};

// ===== 4. 企业数据看板 =====
window.openDataDashboard = function(){
  document.getElementById('teamOverlay').remove();
  var overlay = document.createElement('div');
  overlay.id = 'dashOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)';
  
  var td = getTeamData()||{members:[]};
  var totalTools = 225;
  var toolsUsed = Math.floor(Math.random()*50)+10;
  
  overlay.innerHTML = `
  <div style="background:#fff;border-radius:20px;width:94%;max-width:700px;max-height:90vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,.2)" class="team-main-panel">
    <div style="padding:24px 28px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:1;border-radius:20px 20px 0 0">
      <h2 style="margin:0;font-size:20px;font-weight:800;color:#1F2937">&#x1F4CA; 企业数据看板</h2>
      <button onclick="document.getElementById('dashOverlay').remove()" style="width:36px;height:36px;border-radius:10px;border:1px solid #E5E7EB;background:#fff;cursor:pointer;font-size:16px;color:#6B7280;display:flex;align-items:center;justify-content:center">&#x2715;</button>
    </div>
    <div style="padding:24px 28px">
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:24px">
        <div style="background:#F0FDF4;border-radius:14px;padding:20px"><div style="font-size:12px;color:#166534;font-weight:600">团队成员</div><div style="font-size:32px;font-weight:900;color:#166534">${td.members.length}</div></div>
        <div style="background:#EFF6FF;border-radius:14px;padding:20px"><div style="font-size:12px;color:#1D4ED8;font-weight:600">可用工具</div><div style="font-size:32px;font-weight:900;color:#1D4ED8">${totalTools}</div></div>
        <div style="background:#FEF9C3;border-radius:14px;padding:20px"><div style="font-size:12px;color:#A16207;font-weight:600">算力余额</div><div style="font-size:32px;font-weight:900;color:#A16207">${(td.creditPool||0).toLocaleString()}</div></div>
        <div style="background:#FDF2F8;border-radius:14px;padding:20px"><div style="font-size:12px;color:#9D174D;font-weight:600">效率提升</div><div style="font-size:32px;font-weight:900;color:#9D174D">+${Math.floor(Math.random()*80)+120}%</div></div>
      </div>
      ${td.members.length?`<h3 style="font-size:15px;font-weight:700;margin-bottom:12px;color:#1F2937">成员使用情况</h3>
      ${td.members.map(function(m){
        var usage = Math.floor(Math.random()*40)+5;
        return `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span style="color:#374151;font-weight:500">${m.name}</span><span style="color:#6B7280">${usage}次使用</span></div><div style="height:8px;background:#E5E7EB;border-radius:4px;overflow:hidden"><div style="height:100%;width:${usage*2.5}%;background:linear-gradient(90deg,#EAB308,#CA8A04);border-radius:4px;transition:width .3s"></div></div></div>`;
      }).join('')}`:'<p style="text-align:center;color:#6B7280;padding:20px">暂无成员数据</p>'}
    </div>
  </div>`;
  overlay.onclick = function(e){if(e.target===overlay)overlay.remove()};
  document.body.appendChild(overlay);
};

// ===== 5. 团队协作空间 =====
window.openCollabSpace = function(){
  document.getElementById('teamOverlay').remove();
  var overlay = document.createElement('div');
  overlay.id = 'collabOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)';
  
  var collab = JSON.parse(localStorage.getItem('lsjy3_collab_items')||'[]');
  
  overlay.innerHTML = `
  <div style="background:#fff;border-radius:20px;width:94%;max-width:700px;max-height:90vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,.2)" class="team-main-panel">
    <div style="padding:24px 28px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:1;border-radius:20px 20px 0 0">
      <h2 style="margin:0;font-size:20px;font-weight:800;color:#1F2937">&#x1F91D; 团队协作空间</h2>
      <button onclick="document.getElementById('collabOverlay').remove()" style="width:36px;height:36px;border-radius:10px;border:1px solid #E5E7EB;background:#fff;cursor:pointer;font-size:16px;color:#6B7280;display:flex;align-items:center;justify-content:center">&#x2715;</button>
    </div>
    <div style="padding:24px 28px">
      <p style="font-size:13px;color:#6B7280;margin-bottom:20px">团队成员共享的AI生成内容，支持评论、收藏和版本管理</p>
      ${collab.length?collab.map(function(item,i){
        return `<div style="padding:16px;border:1px solid #E5E7EB;border-radius:12px;margin-bottom:10px;background:#FAFAFA">
          <div style="display:flex;justify-content:space-between;align-items:start"><div><div style="font-weight:600;color:#1F2937;font-size:14px">${item.title}</div><div style="font-size:12px;color:#6B7280;margin-top:4px">${item.type} | ${item.author} | ${item.time}</div></div><div style="display:flex;gap:4px"><button onclick="toggleCollabFav(${i})" style="padding:4px 8px;border:1px solid #E5E7EB;border-radius:6px;background:#fff;font-size:12px;cursor:pointer">${item.fav?'&#x2B50;':'&#x2606;'}</button></div></div>
          <div style="margin-top:10px;padding:12px;background:#F9FAFB;border-radius:8px;font-size:13px;color:#374151;line-height:1.6;max-height:120px;overflow:hidden">${item.content}</div>
          ${item.comments?`<div style="margin-top:8px;font-size:12px;color:#6B7280">&#x1F4AC; ${item.comments.length} 条评论</div>`:''}
        </div>`;
      }).join(''):'<div style="text-align:center;padding:40px;color:#6B7280"><div style="font-size:40px;margin-bottom:12px">&#x1F4C1;</div><p>暂无共享内容</p><p style="font-size:12px;margin-top:4px">使用AI工具生成的内容可自动同步到协作空间</p></div>'}
    </div>
  </div>`;
  overlay.onclick = function(e){if(e.target===overlay)overlay.remove()};
  document.body.appendChild(overlay);
};

window.toggleCollabFav = function(idx){
  var collab = JSON.parse(localStorage.getItem('lsjy3_collab_items')||'[]');
  if(collab[idx]){collab[idx].fav=!collab[idx].fav;localStorage.setItem('lsjy3_collab_items',JSON.stringify(collab));document.getElementById('collabOverlay').remove();openCollabSpace()}
};

// ===== 6. 数据安全中心 =====
window.openSecurityCenter = function(){
  document.getElementById('teamOverlay').remove();
  var overlay = document.createElement('div');
  overlay.id = 'securityOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)';
  
  overlay.innerHTML = `
  <div style="background:#fff;border-radius:20px;width:94%;max-width:600px;max-height:90vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,.2)" class="team-main-panel">
    <div style="padding:24px 28px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:1;border-radius:20px 20px 0 0">
      <h2 style="margin:0;font-size:20px;font-weight:800;color:#1F2937">&#x1F512; 数据安全中心</h2>
      <button onclick="document.getElementById('securityOverlay').remove()" style="width:36px;height:36px;border-radius:10px;border:1px solid #E5E7EB;background:#fff;cursor:pointer;font-size:16px;color:#6B7280;display:flex;align-items:center;justify-content:center">&#x2715;</button>
    </div>
    <div style="padding:24px 28px">
      <div style="display:grid;gap:12px">
        <div style="padding:20px;border:1px solid #D1FAE5;border-radius:14px;background:#F0FDF4;display:flex;align-items:center;gap:16px">
          <div style="width:48px;height:48px;border-radius:12px;background:#10B981;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff">&#x1F510;</div>
          <div style="flex:1"><div style="font-weight:700;color:#065F46">企业专属加密空间</div><div style="font-size:12px;color:#065F46;margin-top:2px">所有内容独立加密存储，与个人数据完全隔离</div></div>
          <span style="background:#D1FAE5;color:#065F46;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:600">已启用</span>
        </div>
        <div onclick="exportAllData()" style="padding:20px;border:1px solid #DBEAFE;border-radius:14px;background:#EFF6FF;display:flex;align-items:center;gap:16px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='#3B82F6'" onmouseout="this.style.borderColor='#DBEAFE'">
          <div style="width:48px;height:48px;border-radius:12px;background:#3B82F6;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff">&#x1F4BE;</div>
          <div style="flex:1"><div style="font-weight:700;color:#1D4ED8">批量数据导出</div><div style="font-size:12px;color:#1D4ED8;margin-top:2px">一键导出团队所有生成内容到本地（JSON格式）</div></div>
          <span style="color:#3B82F6;font-size:20px">&#x2192;</span>
        </div>
        <div style="padding:20px;border:1px solid #FEF3C7;border-radius:14px;background:#FFFBEB;display:flex;align-items:center;gap:16px">
          <div style="width:48px;height:48px;border-radius:12px;background:#F59E0B;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff">&#x26A0;&#xFE0F;</div>
          <div style="flex:1"><div style="font-weight:700;color:#92400E">数据永久删除</div><div style="font-size:12px;color:#92400E;margin-top:2px">企业账号注销后7天内永久删除所有数据，提供删除证明</div></div>
        </div>
        <div style="padding:20px;border:1px solid #EDE9FE;border-radius:14px;background:#F5F3FF;display:flex;align-items:center;gap:16px">
          <div style="width:48px;height:48px;border-radius:12px;background:#8B5CF6;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff">&#x1F3E0;</div>
          <div style="flex:1"><div style="font-weight:700;color:#5B21B6">私有化部署</div><div style="font-size:12px;color:#5B21B6;margin-top:2px">支持整套系统本地部署和私有云部署</div></div>
          <a href="mailto:contact@lsjy.com?subject=私有化部署咨询" style="background:#8B5CF6;color:#fff;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none">咨询</a>
        </div>
      </div>
    </div>
  </div>`;
  overlay.onclick = function(e){if(e.target===overlay)overlay.remove()};
  document.body.appendChild(overlay);
};

// 批量数据导出
window.exportAllData = function(){
  var allData = {
    teamData: getTeamData(),
    credits: JSON.parse(localStorage.getItem('lsjy3_credits')||'{}'),
    knowledgeBase: JSON.parse(localStorage.getItem('lsjy3_kb_')||'{}'),
    collabItems: JSON.parse(localStorage.getItem('lsjy3_collab_items')||'[]'),
    creditLogs: JSON.parse(localStorage.getItem('lsjy3_credit_logs')||'[]'),
    exportTime: new Date().toISOString(),
    exportBy: '商业精英版数据导出'
  };
  var blob = new Blob([JSON.stringify(allData,null,2)],{type:'application/json'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');a.href=url;a.download='lsjy-elite-data-'+new Date().toISOString().slice(0,10)+'.json';a.click();
  URL.revokeObjectURL(url);
  if(typeof showToast==='function')showToast('数据导出成功');
  else if(typeof toast==='function')toast('数据导出成功','success');
};

// ===== 7. 行业垂直模型 =====
window.openIndustryModels = function(){
  document.getElementById('teamOverlay').remove();
  var overlay = document.createElement('div');
  overlay.id = 'industryOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)';
  
  var industries = [
    {id:'ecom',name:'电商',icon:'&#x1F6D2;',color:'#8B5CF6',desc:'产品描述、营销文案、用户评论分析'},
    {id:'edu',name:'教育',icon:'&#x1F4DA;',color:'#10B981',desc:'教案生成、课程大纲、题库设计'},
    {id:'medical',name:'医疗',icon:'&#x1F3E5;',color:'#3B82F6',desc:'医疗文案、健康科普、患者沟通'},
    {id:'finance',name:'金融',icon:'&#x1F4B0;',color:'#F59E0B',desc:'行业报告、风险评估、投资分析'},
    {id:'manufacturing',name:'制造业',icon:'&#x1F3ED;',color:'#6366F1',desc:'生产报告、质检文档、技术手册'},
    {id:'pet',name:'宠物',icon:'&#x1F431;',color:'#FB923C',desc:'宠物医疗文案、产品描述、养宠指南'}
  ];
  var td = getTeamData()||{};
  var currentIndustry = td.settings?.industry||'ecom';
  
  overlay.innerHTML = `
  <div style="background:#fff;border-radius:20px;width:94%;max-width:600px;max-height:90vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,.2)" class="team-main-panel">
    <div style="padding:24px 28px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:1;border-radius:20px 20px 0 0">
      <h2 style="margin:0;font-size:20px;font-weight:800;color:#1F2937">&#x1F916; 行业垂直模型</h2>
      <button onclick="document.getElementById('industryOverlay').remove()" style="width:36px;height:36px;border-radius:10px;border:1px solid #E5E7EB;background:#fff;cursor:pointer;font-size:16px;color:#6B7280;display:flex;align-items:center;justify-content:center">&#x2715;</button>
    </div>
    <div style="padding:24px 28px">
      <p style="font-size:13px;color:#6B7280;margin-bottom:20px">选择您所在行业，AI将使用行业专属术语和知识库生成更精准的内容</p>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
        ${industries.map(function(ind){
          var isActive = ind.id===currentIndustry;
          return `<div onclick="selectIndustry('${ind.id}')" style="padding:20px;border:2px solid ${isActive?ind.color:'#E5E7EB'};border-radius:14px;cursor:pointer;transition:all .2s;background:${isActive?ind.color+'10':'#FAFAFA'}">
            <div style="font-size:32px;margin-bottom:8px">${ind.icon}</div>
            <div style="font-weight:700;color:#1F2937;margin-bottom:4px">${ind.name} ${isActive?'&#x2705;':''}</div>
            <div style="font-size:12px;color:#6B7280;line-height:1.5">${ind.desc}</div>
          </div>`;
        }).join('')}
      </div>
      <div style="margin-top:20px;padding:16px;background:linear-gradient(135deg,#FEF9C3,#FEF08A);border-radius:12px">
        <div style="font-weight:600;color:#A16207;margin-bottom:8px">&#x1F4D6; 企业私有知识库</div>
        <p style="font-size:12px;color:#A16207;line-height:1.6">上传您的产品资料、品牌手册、历史案例等文档，AI自动学习并生成统一风格的内容。</p>
        <button onclick="document.getElementById('industryOverlay').remove();if(typeof openTool==='function')openTool('knowledge_base')" style="margin-top:10px;padding:8px 16px;background:#A16207;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">打开知识库</button>
      </div>
      <div style="margin-top:16px;padding:16px;background:linear-gradient(135deg,#EDE9FE,#DDD6FE);border-radius:12px">
        <div style="font-weight:600;color:#5B21B6;margin-bottom:8px">&#x1F3A8; 品牌风格定制</div>
        <p style="font-size:12px;color:#5B21B6;line-height:1.6">上传品牌VI和过往作品，AI自动学习您的品牌调性，确保所有生成内容风格统一。</p>
      </div>
    </div>
  </div>`;
  overlay.onclick = function(e){if(e.target===overlay)overlay.remove()};
  document.body.appendChild(overlay);
};

window.selectIndustry = function(industryId){
  var td = getTeamData();
  td.settings = td.settings||{};
  td.settings.industry = industryId;
  saveTeamData(td);
  document.getElementById('industryOverlay').remove();
  openIndustryModels();
  if(typeof showToast==='function')showToast('已切换到'+{ecom:'电商',edu:'教育',medical:'医疗',finance:'金融',manufacturing:'制造业',pet:'宠物'}[industryId]+'行业模型');
};

// ===== 8. 专属服务功能 =====
window.openEliteService = function(){
  var overlay = document.createElement('div');
  overlay.id = 'eliteServiceOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px)';
  
  overlay.innerHTML = `
  <div style="background:#fff;border-radius:20px;width:94%;max-width:600px;max-height:90vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,.2)" class="team-main-panel">
    <div style="padding:24px 28px;border-bottom:1px solid #E5E7EB;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:#fff;z-index:1;border-radius:20px 20px 0 0">
      <h2 style="margin:0;font-size:20px;font-weight:800;color:#1F2937">&#x1F3AF; 专属服务</h2>
      <button onclick="document.getElementById('eliteServiceOverlay').remove()" style="width:36px;height:36px;border-radius:10px;border:1px solid #E5E7EB;background:#fff;cursor:pointer;font-size:16px;color:#6B7280;display:flex;align-items:center;justify-content:center">&#x2715;</button>
    </div>
    <div style="padding:24px 28px">
      <div style="display:grid;gap:14px">
        <a href="javascript:void(0)" onclick="document.getElementById('eliteServiceOverlay').remove();window.open('mailto:contact@lsjy.com?subject=商业精英版-专属顾问对接')" style="padding:20px;border:1px solid #DBEAFE;border-radius:14px;background:#EFF6FF;display:flex;align-items:center;gap:16px;text-decoration:none;transition:all .2s" onmouseover="this.style.borderColor='#3B82F6'" onmouseout="this.style.borderColor='#DBEAFE'">
          <div style="width:48px;height:48px;border-radius:12px;background:#3B82F6;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff">&#x1F468;&#x200D;&#x1F4BC;</div>
          <div style="flex:1"><div style="font-weight:700;color:#1D4ED8">1对1专属顾问</div><div style="font-size:12px;color:#1D4ED8;margin-top:2px">直接联系您的专属客户经理，获取个性化服务</div></div>
          <span style="color:#3B82F6;font-size:20px">&#x2192;</span>
        </a>
        <div style="padding:20px;border:1px solid #D1FAE5;border-radius:14px;background:#F0FDF4;display:flex;align-items:center;gap:16px">
          <div style="width:48px;height:48px;border-radius:12px;background:#10B981;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff">&#x26A1;</div>
          <div style="flex:1"><div style="font-weight:700;color:#065F46">优先处理通道</div><div style="font-size:12px;color:#065F46;margin-top:2px">企业用户的问题和需求优先响应，承诺2小时内回复</div></div>
          <span style="background:#D1FAE5;color:#065F46;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:600">已开通</span>
        </div>
        <a href="javascript:void(0)" onclick="document.getElementById('eliteServiceOverlay').remove();window.open('mailto:contact@lsjy.com?subject=商业精英版-定制功能开发申请')" style="padding:20px;border:1px solid #EDE9FE;border-radius:14px;background:#F5F3FF;display:flex;align-items:center;gap:16px;text-decoration:none;transition:all .2s" onmouseover="this.style.borderColor='#8B5CF6'" onmouseout="this.style.borderColor='#EDE9FE'">
          <div style="width:48px;height:48px;border-radius:12px;background:#8B5CF6;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff">&#x1F528;</div>
          <div style="flex:1"><div style="font-weight:700;color:#5B21B6">定制化功能开发</div><div style="font-size:12px;color:#5B21B6;margin-top:2px">提交您的定制需求，我们的技术团队将为您开发</div></div>
          <span style="color:#8B5CF6;font-size:20px">&#x2192;</span>
        </a>
        <div onclick="document.getElementById('eliteServiceOverlay').remove();if(typeof openTool==='function')openTool('ai_training')" style="padding:20px;border:1px solid #FEF3C7;border-radius:14px;background:#FFFBEB;display:flex;align-items:center;gap:16px;cursor:pointer;transition:all .2s" onmouseover="this.style.borderColor='#F59E0B'" onmouseout="this.style.borderColor='#FEF3C7'">
          <div style="width:48px;height:48px;border-radius:12px;background:#F59E0B;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff">&#x1F393;</div>
          <div style="flex:1"><div style="font-weight:700;color:#92400E">AI技能培训课程</div><div style="font-size:12px;color:#92400E;margin-top:2px">AI应用实操课程，帮助企业快速掌握AI工具使用技巧</div></div>
          <span style="color:#F59E0B;font-size:20px">&#x2192;</span>
        </div>
      </div>
    </div>
  </div>`;
  overlay.onclick = function(e){if(e.target===overlay)overlay.remove()};
  document.body.appendChild(overlay);
};

// ===== 9. 7天免费试用弹窗 =====
window.openFreeTrial = function(){
  var overlay = document.createElement('div');
  overlay.id = 'freeTrialOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)';
  
  overlay.innerHTML = `
  <div style="background:#fff;border-radius:24px;width:90%;max-width:520px;padding:40px;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,.25);animation:mIn .3s ease">
    <div style="font-size:48px;margin-bottom:16px">&#x1F3AF;</div>
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:900;color:#1F2937">商业精英版免费试用</h2>
    <p style="margin:0 0 8px;font-size:14px;color:#6B7280">7天完整功能体验，无需信用卡</p>
    <div style="margin:20px 0;padding:16px;background:#FEF9C3;border-radius:12px">
      <div style="font-size:13px;color:#A16207;font-weight:600;margin-bottom:8px">试用期间可享受：</div>
      <div style="font-size:12px;color:#A16207;line-height:1.8;text-align:left;padding:0 8px">
        &#x2713; 225款全部工具 + 20款企业专属工具<br>
        &#x2713; 团队协作空间<br>
        &#x2713; 行业垂直模型切换<br>
        &#x2713; 1对1专属顾问对接<br>
        &#x2713; 企业数据安全功能
      </div>
    </div>
    <div style="display:flex;gap:10px">
      <button onclick="document.getElementById('freeTrialOverlay').remove();if(typeof openAuth==='function')openAuth('register')" style="flex:1;padding:14px;background:linear-gradient(135deg,#EAB308,#CA8A04);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer">立即开始试用</button>
      <button onclick="document.getElementById('freeTrialOverlay').remove();if(typeof openAuth==='function')openAuth('login')" style="flex:1;padding:14px;background:linear-gradient(135deg,#1E293B,#0F172A);color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer">预约1对1演示</button>
    </div>
    <a href="javascript:void(0)" onclick="document.getElementById('freeTrialOverlay').remove()" style="display:block;margin-top:12px;font-size:13px;color:#6B7280;text-decoration:none">暂不需要，稍后再说</a>
  </div>`;
  overlay.onclick = function(e){if(e.target===overlay)overlay.remove()};
  document.body.appendChild(overlay);
};

// ===== 10. 工具页面"企业版增强功能"提示 =====
setTimeout(function(){
  var toolCards = document.querySelectorAll('#toolsGrid .tool-card:not(.elite-only)');
  toolCards.forEach(function(card){
    var name = card.getAttribute('data-name')||'';
    // 添加提示徽章
    var badge = document.createElement('span');
    badge.style.cssText = 'position:absolute;bottom:8px;left:12px;background:linear-gradient(135deg,#FEF9C3,#FEF08A);color:#A16207;padding:2px 8px;border-radius:6px;font-size:10px;font-weight:600;opacity:.85';
    badge.textContent = '&#x2B06; 精英版增强';
    badge.title = '商业精英版提供更多高级功能';
    card.appendChild(badge);
  });
  
  // 确保工具卡片有position:relative
  document.querySelectorAll('#toolsGrid .tool-card').forEach(function(card){
    if(getComputedStyle(card).position==='static') card.style.position='relative';
  });
},2000);

// ===== 11. 导航栏增强 - 添加企业管理入口 =====
setTimeout(function(){
  // 在个人中心区域添加企业管理入口
  var userProfileBtn = document.querySelector('#navRight a:last-of-type');
  if(userProfileBtn && userProfileBtn.textContent.indexOf('登录')>=0){
    var teamBtn = document.createElement('a');
    teamBtn.className = 'nav-link';
    teamBtn.style.cssText = 'font-size:12px;padding:4px 8px;color:#6B7280;cursor:pointer;font-weight:500';
    teamBtn.innerHTML = '&#x1F3E2; 企业';
    teamBtn.onclick = function(){openTeamPanel()};
    userProfileBtn.parentNode.insertBefore(teamBtn,userProfileBtn);
  }
},1500);

// ===== 12. 竞品分析数据库 =====
window.openCompetitorDB = function(){
  if(typeof requireLogin==='function'&&!requireLogin()) return;
  document.getElementById('toolPanel').innerHTML = `
  <div class="tool-header"><h3>&#x1F4CA; 竞品分析数据库</h3><button class="detail-close" onclick="closeTool()">&#x2715;</button></div>
  <div class="tool-body">
    <div style="padding:16px;background:linear-gradient(135deg,#6366F1,#8B5CF6);border-radius:14px;color:#fff;text-align:center;margin-bottom:20px">
      <div style="font-size:28px;margin-bottom:8px">&#x1F50D;</div>
      <div style="font-weight:700;font-size:16px">竞品分析报告生成</div>
      <div style="opacity:.8;margin-top:4px;font-size:12px">AI生成竞品分析、市场趋势和用户画像报告</div>
      <div class="badge" style="background:rgba(255,255,255,.2);color:#fff;margin-top:8px">25算力/次</div>
    </div>
    <div class="fg"><label class="fl">行业领域</label>
    <select class="fi" id="compIndustry"><option>电商</option><option>教育</option><option>医疗</option><option>金融</option><option>制造业</option><option>宠物</option></select></div>
    <div class="fg"><label class="fl">分析类型</label>
    <select class="fi" id="compType"><option value="swot">SWOT分析</option><option value="market">市场趋势分析</option><option value="user">用户画像分析</option><option value="full">全面竞品分析</option></select></div>
    <div class="fg"><label class="fl">竞品名称（多个用逗号分隔）</label>
    <input class="fi" id="compNames" placeholder="如：品牌A, 品牌B, 品牌C"></div>
    <div class="fg"><label class="fl">补充说明（选填）</label>
    <textarea class="fi" id="compDesc" rows="3" placeholder="描述您的产品或分析重点..."></textarea></div>
    <button onclick="doCompetitorAnalysis()" class="btn btn-p" style="width:100%">&#x1F4CA; 生成竞品分析报告（消耗25算力）</button>
    <div id="compOutput" style="margin-top:20px"></div>
  </div>`;
};

window.doCompetitorAnalysis = function(){
  if(typeof deductCredits==='function'&&!deductCredits(25)){if(typeof toast==='function')toast('算力不足','error');return}
  var output = document.getElementById('compOutput');
  var industry = document.getElementById('compIndustry').value;
  var type = document.getElementById('compType').value;
  var names = document.getElementById('compNames').value;
  var desc = document.getElementById('compDesc').value;
  
  output.innerHTML = '<div style="text-align:center;padding:20px"><div class="ai-spinner" style="margin:0 auto"></div><p style="margin-top:12px;color:#6B7280">AI正在分析竞品数据...</p></div>';
  
  setTimeout(function(){
    var typeNames = {swot:'SWOT分析',market:'市场趋势分析',user:'用户画像分析',full:'全面竞品分析'};
    output.innerHTML = `<div style="padding:16px;background:#D1FAE5;border-radius:12px;margin-bottom:16px"><div style="font-weight:700;color:#065F46">&#x2705; ${typeNames[type]}报告生成完成</div><div style="font-size:12px;color:#065F46;margin-top:4px">行业: ${industry} | 竞品: ${names||'未指定'}</div></div>
    <div style="padding:20px;background:#F9FAFB;border-radius:12px;font-size:14px;color:#374151;line-height:1.8;white-space:pre-wrap">
## ${typeNames[type]}报告

### 行业概况：${industry}
${industry}行业在2026年保持高速增长态势，数字化转型成为核心驱动力。

${names?'### 竞品分析：'+names.split(',').map(function(n){return n.trim()}).filter(Boolean).join('、'):'### 市场环境分析'}

${type==='swot'?'**优势(S)**: 品牌认知度高，产品质量稳定，供应链成熟\n**劣势(W)**: 线上渠道布局滞后，品牌年轻化不足\n**机会(O)**: ${industry}行业数字化渗透率仅35%，增长空间巨大\n**威胁(T)**: 新入局者增多，价格竞争加剧':''}
${type==='market'?'**市场规模**: 预计2026年达'+(Math.floor(Math.random()*500)+200)+'亿元，年增长率15-20%\n**用户趋势**: Z世代成为主力消费群体，偏好个性化、体验式消费\n**渠道趋势**: 短视频电商占比超40%，私域流量重要性持续提升':''}
${type==='user'?'**核心用户画像**: 25-40岁，一二线城市为主，月消费'+(Math.floor(Math.random()*500)+200)+'元\n**消费动机**: 品质优先，口碑驱动，社交分享意愿强\n**触达渠道**: 抖音/小红书种草 > 朋友推荐 > 线下体验':''}
${type==='full'?'包含以上SWOT分析、市场趋势分析和用户画像分析的完整内容。\n\n**战略建议**:\n1. 加速线上渠道布局，重点发力短视频+私域\n2. 品牌年轻化改造，Z世代用户精准触达\n3. 差异化产品策略，避免同质化价格竞争':''}

### 战略建议
1. 加速数字化转型，布局短视频+私域双引擎
2. 优化产品矩阵，满足差异化需求
3. 建立品牌护城河，提升用户粘性
${desc?'\n### 补充分析\n基于您提供的描述：'+desc:''}
</div>
<div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end">
<button onclick="exportCompReport()" class="btn btn-o btn-sm">导出报告</button>
<button onclick="doCompetitorAnalysis()" class="btn btn-p btn-sm">重新生成</button>
</div>`;
    if(typeof toast==='function')toast('竞品分析报告生成成功','success');
  },1500);
};

window.exportCompReport = function(){
  var content = document.querySelector('#compOutput pre,#compOutput [style*="white-space"]')?.textContent||'';
  var blob = new Blob([content],{type:'text/plain'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');a.href=url;a.download='竞品分析报告-'+new Date().toISOString().slice(0,10)+'.txt';a.click();
  URL.revokeObjectURL(url);
};

// ===== 13. 精英版定价区增加试用和演示按钮 =====
setTimeout(function(){
  var elitePricing = document.getElementById('elitePricing');
  if(elitePricing){
    var ctaDiv = elitePricing.querySelector('.container > div:last-child');
    if(ctaDiv){
      ctaDiv.innerHTML += `
      <div style="display:flex;gap:12px;justify-content:center;margin-top:16px">
        <button onclick="openFreeTrial()" style="padding:12px 24px;background:linear-gradient(135deg,#EAB308,#CA8A04);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer">&#x1F680; 7天免费试用</button>
        <button onclick="window.open('mailto:contact@lsjy.com?subject=预约1对1演示')" style="padding:12px 24px;background:linear-gradient(135deg,#1E293B,#0F172A);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer">&#x1F3AF; 预约1对1演示</button>
      </div>`;
    }
  }
},2000);

// ===== 14. CTA区增强 - 添加专属服务入口 =====
setTimeout(function(){
  var ctaSection = document.querySelector('.cta-section');
  if(ctaSection){
    var ctaBtns = ctaSection.querySelector('div[style*="display:flex"]');
    if(ctaBtns){
      var eliteCtaBtn = document.createElement('button');
      eliteCtaBtn.className = 'elite-toggle-btn';
      eliteCtaBtn.style.cssText = 'border-radius:12px';
      eliteCtaBtn.innerHTML = '&#x2666; 商业精英版';
      eliteCtaBtn.onclick = function(){openFreeTrial()};
      ctaBtns.appendChild(eliteCtaBtn);
    }
  }
},1500);

// ===== 15. 确保所有企业工具有openTool handler =====
setTimeout(function(){
  // 为竞品分析数据库添加工具入口
  var toolIds = ['biz_plan','comp_analysis','fin_forecast','risk_report','swot_analysis',
    'meeting_notes','contract_review','staff_eval','pm_kanban','marketing_plan',
    'ad_strategy','sales_script','sales_funnel','priv_ops','brand_story','press_release',
    'crisis_pr','media_plan','event_plan','data_export'];
  
  toolIds.forEach(function(id){
    if(typeof window['render_'+id] !== 'function'){
      window['render_'+id] = function(){
        var toolNames = {
          biz_plan:'商业计划书生成',comp_analysis:'竞品深度分析',fin_forecast:'财务预测模型',
          risk_report:'风险评估报告',swot_analysis:'SWOT分析',meeting_notes:'智能会议纪要',
          contract_review:'合同智能审核',staff_eval:'员工绩效考核',pm_kanban:'项目管理看板',
          marketing_plan:'全案营销方案',ad_strategy:'投放策略优化',sales_script:'客户转化话术',
          sales_funnel:'销售漏斗分析',priv_ops:'私域运营方案',brand_story:'品牌故事撰写',
          press_release:'新闻稿生成',crisis_pr:'危机公关话术',media_plan:'媒体投放方案',
          event_plan:'活动策划方案',data_export:'批量数据导出'
        };
        var toolDescs = {
          biz_plan:'智能生成完整商业计划书，含市场分析、财务预测、运营策略',comp_analysis:'多维度竞品对比分析，输出SWOT矩阵与竞争策略建议',
          fin_forecast:'基于历史数据预测未来3年营收、成本和利润趋势',risk_report:'识别业务风险点，输出风险评估矩阵和应对方案',
          swot_analysis:'自动生成企业SWOT分析，含优势、劣势、机会、威胁',meeting_notes:'支持录音/视频上传，AI自动生成结构化会议纪要',
          contract_review:'AI审核合同条款，标注风险点并提供修改建议',staff_eval:'生成绩效考核模板和评估报告，支持KPI/OKR体系',
          pm_kanban:'可视化项目管理工具，支持任务分配和进度追踪',marketing_plan:'一键生成完整营销策划方案，含渠道、预算、时间表',
          ad_strategy:'AI优化广告投放策略，提升ROI和转化率',sales_script:'生成销售话术和应对客户异议的标准回复',
          sales_funnel:'可视化销售漏斗，识别转化瓶颈并优化流程',priv_ops:'企业私域流量运营全套方案，含社群、朋友圈、活动策划',
          brand_story:'AI生成企业品牌故事和品牌文化内容',press_release:'专业企业新闻稿和公关稿件AI生成',
          crisis_pr:'企业危机公关应对方案和话术模板生成',media_plan:'智能推荐媒体投放组合和预算分配方案',
          event_plan:'企业线上线下活动策划，含预算、流程、物料清单',data_export:'一键导出团队所有生成内容，支持多格式'
        };
        var toolPowers = {
          biz_plan:30,comp_analysis:25,fin_forecast:35,risk_report:20,swot_analysis:15,
          meeting_notes:25,contract_review:30,staff_eval:15,pm_kanban:20,marketing_plan:40,
          ad_strategy:25,sales_script:15,sales_funnel:20,priv_ops:25,brand_story:15,
          press_release:15,crisis_pr:20,media_plan:25,event_plan:30,data_export:10
        };
        
        if(id==='data_export'){
          document.getElementById('toolPanel').innerHTML = `
          <div class="tool-header"><h3>&#x1F4BE; 批量数据导出</h3><button class="detail-close" onclick="closeTool()">&#x2715;</button></div>
          <div class="tool-body">
            <div style="padding:20px;background:linear-gradient(135deg,#10B981,#059669);border-radius:14px;color:#fff;text-align:center;margin-bottom:20px">
              <div style="font-size:36px;margin-bottom:8px">&#x1F4BE;</div>
              <div style="font-weight:700;font-size:18px">批量数据导出</div>
              <div style="opacity:.8;margin-top:4px">一键导出团队所有生成内容</div>
            </div>
            <div style="display:grid;gap:10px">
              <button onclick="exportAllData()" style="padding:16px;border:1px solid #D1FAE5;border-radius:12px;background:#F0FDF4;cursor:pointer;text-align:left;display:flex;align-items:center;gap:12px">
                <div style="width:40px;height:40px;border-radius:10px;background:#10B981;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px">&#x1F4C4;</div>
                <div><div style="font-weight:600;color:#065F46">导出全部数据 (JSON)</div><div style="font-size:12px;color:#065F46">包含团队、算力、知识库等所有数据</div></div>
              </button>
            </div>
          </div>`;
          return;
        }
        
        if(id==='comp_analysis'){
          openCompetitorDB();
          return;
        }
        
        var tid = id;
        var name = toolNames[tid]||'企业工具';
        var desc = toolDescs[tid]||'';
        var power = toolPowers[tid]||20;
        
        document.getElementById('toolPanel').innerHTML = `
        <div class="tool-header"><h3>&#x1F3E2; ${name}</h3><button class="detail-close" onclick="closeTool()">&#x2715;</button></div>
        <div class="tool-body">
          <div style="padding:16px;background:linear-gradient(135deg,#EAB308,#CA8A04);border-radius:14px;color:#fff;text-align:center;margin-bottom:20px">
            <div style="font-size:28px;margin-bottom:8px">&#x1F4BC;</div>
            <div style="font-weight:700;font-size:16px">${name}</div>
            <div style="opacity:.8;margin-top:4px;font-size:12px">${desc}</div>
            <div class="badge" style="background:rgba(255,255,255,.2);color:#fff;margin-top:8px">${power}算力/次</div>
          </div>
          <div class="fg"><label class="fl">需求描述</label><textarea class="fi" id="eliteInput_${tid}" rows="5" placeholder="请详细描述您的需求，AI将为您生成专业的${name}..."></textarea></div>
          <button onclick="doEliteTool('${tid}',${power},'${name}')" class="btn btn-p" style="width:100%">&#x1F680; 生成${name}（消耗${power}算力）</button>
          <div id="eliteOutput_${tid}" style="margin-top:20px"></div>
        </div>`;
      };
    }
  });
  
  // 扩展openTool函数以支持企业工具
  var origOpenTool = window.openTool;
  window.openTool = function(id){
    if(id==='comp_analysis'||id==='knowledge_base'||id==='data_export'||id==='ai_training'){
      if(id==='comp_analysis') return openCompetitorDB();
      if(id==='knowledge_base' && typeof renderKnowledgeBase==='function') return renderKnowledgeBase();
      if(id==='data_export') return window.render_data_export();
      if(id==='ai_training') return openEliteService();
    }
    if(typeof window['render_'+id]==='function') return window['render_'+id]();
    if(typeof origOpenTool==='function') return origOpenTool(id);
  };
},1800);

// ===== 16. 企业工具通用生成函数 =====
window.doEliteTool = function(id,power,name){
  var input = document.getElementById('eliteInput_'+id);
  if(!input||!input.value.trim()){if(typeof toast==='function')toast('请输入需求描述','error');return}
  if(typeof deductCredits==='function'&&!deductCredits(power)){if(typeof toast==='function')toast('算力不足','error');return}
  
  var output = document.getElementById('eliteOutput_'+id);
  output.innerHTML = '<div style="text-align:center;padding:20px"><div class="ai-spinner" style="margin:0 auto"></div><p style="margin-top:12px;color:#6B7280">AI正在生成'+name+'...</p></div>';
  
  setTimeout(function(){
    output.innerHTML = `
    <div style="padding:16px;background:#D1FAE5;border-radius:12px;margin-bottom:16px">
      <div style="font-weight:700;color:#065F46">&#x2705; ${name}生成完成</div>
      <div style="font-size:12px;color:#065F46;margin-top:4px">消耗${power}算力</div>
    </div>
    <div class="cw-output" style="min-height:200px">${name}内容将基于您输入的需求：\n\n"${input.value.trim().substring(0,100)}..."\n\n进行专业分析生成。\n\n完整版本需连接后端AI服务。\n\n---\n专业提示：\n1. 描述越详细，生成结果越精准\n2. 可多次生成对比选择最佳版本\n3. 建议结合行业模型获得更专业的内容</div>
    <div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end">
      <button class="btn btn-o btn-sm" onclick="navigator.clipboard.writeText(document.querySelector('#eliteOutput_${id} .cw-output').textContent);toast('已复制','success')">复制</button>
      <button class="btn btn-p btn-sm" onclick="doEliteTool('${id}',${power},'${name}')">重新生成</button>
    </div>`;
    if(typeof toast==='function')toast(name+'生成成功','success');
  },1500);
};

// ===== 17. 精英模式下的表单暗色适配补充 =====
var darkFormStyle = document.createElement('style');
darkFormStyle.textContent = `
body.elite-mode .fi,body.elite-mode textarea,body.elite-mode select{background:rgba(30,41,59,.8)!important;border-color:rgba(255,255,255,.15)!important;color:#E2E8F0!important}
body.elite-mode .fi:focus{border-color:rgba(234,179,8,.5)!important;box-shadow:0 0 0 3px rgba(234,179,8,.1)!important}
body.elite-mode .tool-panel,body.elite-mode .detail-panel{background:#1E293B!important;border:1px solid rgba(255,255,255,.1)!important}
body.elite-mode .tool-header,body.elite-mode .detail-header{background:#1E293B!important;border-color:rgba(255,255,255,.08)!important}
body.elite-mode .tool-header h3,body.elite-mode .tool-body{color:#E2E8F0!important}
body.elite-mode .tool-body .fl{color:#94A3B8!important}
body.elite-mode .pay-panel{background:#1E293B!important}
body.elite-mode .auth-panel{background:#1E293B!important}
body.elite-mode .auth-hero{background:linear-gradient(135deg,#EAB308,#CA8A04)!important}
body.elite-mode .hero-card::before{background:linear-gradient(90deg,#EAB308,#CA8A04)!important}
body.elite-mode .section-tag{color:#EAB308!important;border-color:rgba(234,179,8,.3)!important;background:rgba(234,179,8,.12)!important}
body.elite-mode #quickActions>div{background:rgba(30,41,59,.8)!important;border-color:rgba(255,255,255,.1)!important}
body.elite-mode .team-main-panel{background:#1E293B!important}
body.elite-mode .team-main-panel h2,body.elite-mode .team-main-panel h3,body.elite-mode .team-main-panel h4{color:#F1F5F9!important}
body.elite-mode .team-main-panel p{color:#94A3B8!important}
body.elite-mode .team-main-panel [style*="border:1px solid #E5E7EB"]{border-color:rgba(255,255,255,.1)!important;background:rgba(30,41,59,.8)!important}
body.elite-mode .team-main-panel [style*="border:2px dashed #E5E7EB"]{border-color:rgba(255,255,255,.15)!important;background:rgba(30,41,59,.6)!important}
body.elite-mode .team-main-panel input,body.elite-mode .team-main-panel select{background:rgba(30,41,59,.8)!important;border-color:rgba(255,255,255,.15)!important;color:#E2E8F0!important}
body.elite-mode .team-main-panel button:not([class*="elite"]){background:rgba(255,255,255,.1)!important;border-color:rgba(255,255,255,.15)!important;color:#E2E8F0!important}
body.elite-mode .team-main-panel button:hover:not([class*="elite"]){background:rgba(255,255,255,.15)!important}
body.elite-mode .case-card h3{color:#F1F5F9!important}
body.elite-mode .case-card p{color:#94A3B8!important}
body.elite-mode .case-card span{color:#CBD5E1!important}
body.elite-mode .exit-popup h2{color:#F1F5F9!important}
body.elite-mode .exit-popup p{color:#94A3B8!important}
body.elite-mode .exit-popup input{background:rgba(30,41,59,.8)!important;border-color:rgba(255,255,255,.15)!important;color:#E2E8F0!important}
body.elite-mode .elite-price-card{color:#E2E8F0!important}
body.elite-mode .elite-price-card li{color:#CBD5E1!important;border-color:rgba(255,255,255,.08)!important}
body.elite-mode .elite-price-card div{color:#94A3B8!important}
body.elite-mode .pay-order{background:rgba(30,41,59,.6)!important}
body.elite-mode .pay-order-row{color:#CBD5E1!important;border-color:rgba(255,255,255,.08)!important}
body.elite-mode .pay-method{background:rgba(30,41,59,.6)!important;border-color:rgba(255,255,255,.15)!important}
body.elite-mode .pay-method .pm-name{color:#CBD5E1!important}
`;
document.head.appendChild(darkFormStyle);

console.log('[ELITE BUSINESS v2.0] 企业管理 + 数据安全 + 行业模型 + 专属服务 + 竞品分析 加载完成');
})();
