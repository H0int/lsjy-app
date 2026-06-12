// ================================================
// 罗圣纪元 - 日夜间模式 + 个人/企业版切换 + 注册审批 + AI模拟 增强脚本
// ================================================

(function(){
  // ===== A. 主题切换逻辑 =====
  var saved = localStorage.getItem('lsjy_theme');
  if(saved === 'light') document.body.classList.add('theme-light');
  
  window.toggleTheme = function() {
    document.body.classList.toggle('theme-light');
    var isLight = document.body.classList.contains('theme-light');
    localStorage.setItem('lsjy_theme', isLight ? 'light' : 'dark');
    // 更新所有主题切换按钮的图标
    document.querySelectorAll('.theme-toggle-icon').forEach(function(el){
      el.textContent = isLight ? '\u2600\uFE0F' : '\uD83C\uDF19';
    });
    document.querySelectorAll('.theme-toggle-text').forEach(function(el){
      el.textContent = isLight ? '\u65E5\u95F4' : '\u591C\u95F4';
    });
  };
  
  // ===== B. 版本切换逻辑 =====
  var savedMode = localStorage.getItem('lsjy_mode');
  if(savedMode === 'enterprise') document.body.classList.add('mode-enterprise');
  
  window.toggleVersion = function(mode) {
    if(mode === 'enterprise') {
      document.body.classList.add('mode-enterprise');
      localStorage.setItem('lsjy_mode', 'enterprise');
    } else {
      document.body.classList.remove('mode-enterprise');
      localStorage.setItem('lsjy_mode', 'personal');
    }
    // 更新版本切换按钮状态
    document.querySelectorAll('.version-toggle-btn').forEach(function(btn){
      btn.classList.remove('active-personal','active-enterprise');
      if(mode === 'personal' && btn.dataset.mode === 'personal') btn.classList.add('active-personal');
      if(mode === 'enterprise' && btn.dataset.mode === 'enterprise') btn.classList.add('active-enterprise');
    });
    // 触发自定义事件，让其他代码响应
    document.dispatchEvent(new CustomEvent('lsjyModeChange', {detail:{mode:mode}}));
  };
  
  // 初始化版本切换按钮状态和主题按钮图标
  document.addEventListener('DOMContentLoaded', function(){
    var curMode = document.body.classList.contains('mode-enterprise') ? 'enterprise' : 'personal';
    document.querySelectorAll('.version-toggle-btn').forEach(function(btn){
      btn.classList.remove('active-personal','active-enterprise');
      if(curMode === 'personal' && btn.dataset.mode === 'personal') btn.classList.add('active-personal');
      if(curMode === 'enterprise' && btn.dataset.mode === 'enterprise') btn.classList.add('active-enterprise');
    });
    // 初始化主题按钮图标
    var isLight = document.body.classList.contains('theme-light');
    document.querySelectorAll('.theme-toggle-icon').forEach(function(el){
      el.textContent = isLight ? '\u2600\uFE0F' : '\uD83C\uDF19';
    });
    document.querySelectorAll('.theme-toggle-text').forEach(function(el){
      el.textContent = isLight ? '\u65E5\u95F4' : '\u591C\u95F4';
    });
  });
  
  // ===== C. 注册审批流程 =====
  // 用户注册后状态为pending，需管理员在后台审批
  if(typeof window._originalRegister === 'undefined') {
    window._originalRegister = true;
    // Hook into registration to add approval flow
    window._setupApprovalFlow = function() {
      // Override the doRegister function if it exists
      var origDoRegister = window.doRegister;
      if(origDoRegister && !origDoRegister._patched) {
        window.doRegister = function(e) {
          // Call original registration
          var result = origDoRegister.call(this, e);
          // After registration, set user status to pending
          try {
            var users = JSON.parse(localStorage.getItem('lsjy3_users') || '[]');
            var lastUser = users[users.length - 1];
            if(lastUser) {
              lastUser.status = 'pending'; // pending, approved, rejected
              lastUser.registerTime = new Date().toISOString();
              users[users.length - 1] = lastUser;
              localStorage.setItem('lsjy3_users', JSON.stringify(users));
              // Show message about approval
              if(typeof toast === 'function') {
                toast('\u6CE8\u518C\u6210\u529F\uFF01\u8BF7\u7B49\u5F85\u7BA1\u7406\u5458\u5BA1\u6838\u901A\u8FC7\u540E\u5373\u53EF\u767B\u5F55\u4F7F\u7528', 'success');
              }
            }
          } catch(ex) { console.warn('Approval flow error:', ex); }
          return result;
        };
        window.doRegister._patched = true;
      }
    };
    // Run after DOM ready
    if(document.readyState === 'complete') window._setupApprovalFlow();
    else window.addEventListener('DOMContentLoaded', window._setupApprovalFlow);
  }

  // ===== D. 登录审批状态检查 =====
  // 在验证密码成功后，检查用户status是否为pending或rejected
  window._setupLoginApproval = function() {
    var origDoLogin = window.doLogin;
    if(origDoLogin && !origDoLogin._approvalPatched) {
      window.doLogin = function(e) {
        e.preventDefault();
        var u = document.getElementById('authUser').value.trim();
        var p = document.getElementById('authPwd').value;
        var users = typeof getUsers === 'function' ? getUsers() : JSON.parse(localStorage.getItem('lsjy3_users') || '[]');
        var found = users.find(function(x){ return x.username === u && (x.password === p || x.password === btoa(p)); });
        if(!found) {
          if(typeof toast === 'function') toast('\u8D26\u53F7\u6216\u5BC6\u7801\u9519\u8BEF', 'error');
          return;
        }
        // 审批状态检查
        if(found.status === 'pending') {
          if(typeof toast === 'function') toast('\u60A8\u7684\u8D26\u53F7\u6B63\u5728\u5BA1\u6838\u4E2D\uFF0C\u8BF7\u7B49\u5F85\u7BA1\u7406\u5458\u5BA1\u6279', 'warn');
          return;
        }
        if(found.status === 'rejected') {
          if(typeof toast === 'function') toast('\u60A8\u7684\u8D26\u53F7\u5BA1\u6838\u672A\u901A\u8FC7\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458', 'error');
          return;
        }
        // 通过审批，执行原登录逻辑
        return origDoLogin.call(this, e);
      };
      window.doLogin._approvalPatched = true;
    }
  };
  if(document.readyState === 'complete') window._setupLoginApproval();
  else window.addEventListener('DOMContentLoaded', window._setupLoginApproval);

  // ===== E. AI工具模拟数据 =====
  // 当无API Key时提供模拟响应
  if(typeof window.aiGenerateTextFallback === 'undefined') {
    window.aiGenerateTextFallback = function(prompt, callback) {
      var templates = [
        '\u57FA\u4E8E\u60A8\u7684\u9700\u6C42\uFF0C\u4EE5\u4E0B\u662F\u4E3A\u60A8\u751F\u6210\u7684\u5185\u5BB9\uFF1A\n\n\u5728\u6570\u5B57\u5316\u8F6C\u578B\u7684\u6D6A\u6F6E\u4E2D\uFF0C\u4F01\u4E1A\u9700\u8981\u7D27\u8DDF\u6280\u672F\u8D8B\u52BF\uFF0C\u901A\u8FC7AI\u8D4B\u80FD\u63D0\u5347\u6548\u7387\u3002\u7F57\u5723\u7EAA\u5143\u81F4\u529B\u4E8E\u4E3A\u4E2D\u5C0F\u4F01\u4E1A\u63D0\u4F9B\u4E00\u7AD9\u5F0F\u89E3\u51B3\u65B9\u6848\uFF0C\u5E2E\u52A9\u60A8\u5728\u7ADE\u4E89\u4E2D\u8131\u9896\u800C\u51FA\u3002\n\n\uD83D\uDCA1 \u5EFA\u8BAE\uFF1A\u6301\u7EED\u5173\u6CE8AI\u6280\u672F\u5E94\u7528\uFF0C\u9009\u62E9\u9002\u5408\u81EA\u8EAB\u4E1A\u52A1\u7684\u5DE5\u5177\u7EC4\u5408\u3002',
        '\u6839\u636E\u5206\u6790\uFF0C\u4EE5\u4E0B\u662F\u4E13\u4E1A\u5EFA\u8BAE\uFF1A\n\n1. \u660E\u786E\u76EE\u6807\u53D7\u4F17\uFF0C\u7CBE\u51C6\u5B9A\u4F4D\u5E02\u573A\n2. \u5229\u7528AI\u5DE5\u5177\u63D0\u5347\u5185\u5BB9\u521B\u4F5C\u6548\u7387\n3. \u5EFA\u7ACB\u6570\u636E\u9A71\u52A8\u7684\u51B3\u7B56\u4F53\u7CFB\n4. \u4F18\u5316\u7528\u6237\u65C5\u7A0B\uFF0C\u63D0\u5347\u8F6C\u5316\u7387\n\n\uD83C\uDFAF \u7F57\u5723\u7EAA\u5143\u63D0\u4F9B\u5168\u5957AI\u5DE5\u5177\u652F\u6301\uFF0C\u52A9\u529B\u60A8\u7684\u4E1A\u52A1\u589E\u957F\u3002',
        '\u4E3A\u60A8\u751F\u6210\u4EE5\u4E0B\u65B9\u6848\uFF1A\n\n\u3010\u5E02\u573A\u5206\u6790\u3011\u5F53\u524D\u884C\u4E1A\u6B63\u5904\u4E8E\u5FEB\u901F\u53D1\u5C55\u671F\uFF0CAI\u6280\u672F\u5E94\u7528\u524D\u666F\u5E7F\u9614\u3002\n\u3010\u7B56\u7565\u5EFA\u8BAE\u3011\u5EFA\u8BAE\u4ECE\u5185\u5BB9\u521B\u4F5C\u3001\u6570\u636E\u5206\u6790\u3001\u5BA2\u6237\u670D\u52A1\u4E09\u4E2A\u7EF4\u5EA6\u5165\u624B\u3002\n\u3010\u6267\u884C\u8DEF\u5F84\u3011\u5148\u8BD5\u70B9\u540E\u63A8\u5E7F\uFF0C\u9010\u6B65\u5B9E\u73B0\u5168\u4E1A\u52A1\u6570\u5B57\u5316\u3002\n\n\uD83D\uDCCA \u7F57\u5723\u7EAA\u5143205\u6B3E\u5DE5\u5177\u8986\u76D6\u5168\u6D41\u7A0B\uFF0C\u6B22\u8FCE\u4F53\u9A8C\u3002',
        '\u4EE5\u4E0B\u662FAI\u4E3A\u60A8\u521B\u4F5C\u7684\u5185\u5BB9\uFF1A\n\n\u5728\u8FD9\u4E2A\u5145\u6EE1\u673A\u9047\u7684\u65F6\u4EE3\uFF0C\u521B\u65B0\u662F\u4F01\u4E1A\u53D1\u5C55\u7684\u6838\u5FC3\u52A8\u529B\u3002\u901A\u8FC7\u667A\u80FD\u5316\u5DE5\u5177\u7684\u5E94\u7528\uFF0C\u4E0D\u4EC5\u80FD\u63D0\u5347\u5DE5\u4F5C\u6548\u7387\uFF0C\u66F4\u80FD\u5F00\u62D3\u5168\u65B0\u7684\u5546\u4E1A\u53EF\u80FD\u6027\u3002\n\n\u2728 \u7F57\u5723\u7EAA\u5143\uFF0C\u7528AI\u79D1\u6280\u8D4B\u80FD\u5B9E\u4F53\u7ECF\u6D4E\u589E\u957F\u3002'
      ];
      var result = templates[Math.floor(Math.random() * templates.length)];
      setTimeout(function(){
        if(typeof callback === 'function') callback(result);
      }, 800 + Math.random() * 1200);
      return result;
    };
  }

  // 修补aiGenerateText，在返回null时使用模拟数据
  window._patchAiGenerate = function() {
    var origAiGen = window.aiGenerateText;
    if(origAiGen && !origAiGen._fallbackPatched) {
      var patchedFn = async function(prompt, systemPrompt, model, retries) {
        try {
          var result = await origAiGen.call(this, prompt, systemPrompt, model, retries);
          if(result) return result;
          // AI返回null，使用模拟数据
          console.log('[Enhancement] AI\u8FD4\u56DEnull\uFF0C\u4F7F\u7528\u6A21\u62DF\u6570\u636E');
          var templates = [
            '\u57FA\u4E8E\u60A8\u7684\u9700\u6C42\uFF0C\u4EE5\u4E0B\u662F\u4E3A\u60A8\u751F\u6210\u7684\u5185\u5BB9\uFF1A\n\n\u5728\u6570\u5B57\u5316\u8F6C\u578B\u7684\u6D6A\u6F6E\u4E2D\uFF0C\u4F01\u4E1A\u9700\u8981\u7D27\u8DDF\u6280\u672F\u8D8B\u52BF\uFF0C\u901A\u8FC7AI\u8D4B\u80FD\u63D0\u5347\u6548\u7387\u3002\u7F57\u5723\u7EAA\u5143\u81F4\u529B\u4E8E\u4E3A\u4E2D\u5C0F\u4F01\u4E1A\u63D0\u4F9B\u4E00\u7AD9\u5F0F\u89E3\u51B3\u65B9\u6848\u3002\n\n\uD83D\uDCA1 \u5EFA\u8BAE\uFF1A\u6301\u7EED\u5173\u6CE8AI\u6280\u672F\u5E94\u7528\uFF0C\u9009\u62E9\u9002\u5408\u81EA\u8EAB\u4E1A\u52A1\u7684\u5DE5\u5177\u7EC4\u5408\u3002',
            '\u6839\u636E\u5206\u6790\uFF0C\u4EE5\u4E0B\u662F\u4E13\u4E1A\u5EFA\u8BAE\uFF1A\n\n1. \u660E\u786E\u76EE\u6807\u53D7\u4F17\uFF0C\u7CBE\u51C6\u5B9A\u4F4D\u5E02\u573A\n2. \u5229\u7528AI\u5DE5\u5177\u63D0\u5347\u5185\u5BB9\u521B\u4F5C\u6548\u7387\n3. \u5EFA\u7ACB\u6570\u636E\u9A71\u52A8\u7684\u51B3\u7B56\u4F53\u7CFB\n4. \u4F18\u5316\u7528\u6237\u65C5\u7A0B\uFF0C\u63D0\u5347\u8F6C\u5316\u7387\n\n\uD83C\uDFAF \u7F57\u5723\u7EAA\u5143\u63D0\u4F9B\u5168\u5957AI\u5DE5\u5177\u652F\u6301\u3002',
            '\u4E3A\u60A8\u751F\u6210\u4EE5\u4E0B\u65B9\u6848\uFF1A\n\n\u3010\u5E02\u573A\u5206\u6790\u3011\u5F53\u524D\u884C\u4E1A\u6B63\u5904\u4E8E\u5FEB\u901F\u53D1\u5C55\u671F\u3002\n\u3010\u7B56\u7565\u5EFA\u8BAE\u3011\u4ECE\u5185\u5BB9\u521B\u4F5C\u3001\u6570\u636E\u5206\u6790\u3001\u5BA2\u6237\u670D\u52A1\u5165\u624B\u3002\n\u3010\u6267\u884C\u8DEF\u5F84\u3011\u5148\u8BD5\u70B9\u540E\u63A8\u5E7F\u3002\n\n\uD83D\uDCCA \u7F57\u5723\u7EAA\u5143205\u6B3E\u5DE5\u5177\u8986\u76D6\u5168\u6D41\u7A0B\u3002',
            '\u4EE5\u4E0B\u662FAI\u4E3A\u60A8\u521B\u4F5C\u7684\u5185\u5BB9\uFF1A\n\n\u5728\u8FD9\u4E2A\u5145\u6EE1\u673A\u9047\u7684\u65F6\u4EE3\uFF0C\u521B\u65B0\u662F\u4F01\u4E1A\u53D1\u5C55\u7684\u6838\u5FC3\u52A8\u529B\u3002\u901A\u8FC7\u667A\u80FD\u5316\u5DE5\u5177\u7684\u5E94\u7528\uFF0C\u4E0D\u4EC5\u80FD\u63D0\u5347\u5DE5\u4F5C\u6548\u7387\uFF0C\u66F4\u80FD\u5F00\u62D3\u5168\u65B0\u7684\u5546\u4E1A\u53EF\u80FD\u6027\u3002\n\n\u2728 \u7F57\u5723\u7EAA\u5143\uFF0C\u7528AI\u79D1\u6280\u8D4B\u80FD\u5B9E\u4F53\u7ECF\u6D4E\u589E\u957F\u3002'
          ];
          return templates[Math.floor(Math.random() * templates.length)];
        } catch(err) {
          console.warn('[Enhancement] AI\u751F\u6210\u5F02\u5E38\uFF0C\u4F7F\u7528\u6A21\u62DF\u6570\u636E:', err);
          return '\u672C\u5730AI\u670D\u52A1\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u4EE5\u4E0B\u4E3A\u6F14\u793A\u5185\u5BB9\uFF1A\n\n\u7F57\u5723\u7EAA\u5143\u662F\u4E00\u7AD9\u5F0FAI\u8D4B\u80FD\u5E73\u53F0\uFF0C\u63D0\u4F9B20\u5927\u4E1A\u52A1\u677F\u5757\u3001205+\u4E13\u4E1A\u5DE5\u5177\uFF0C\u52A9\u529B\u4F01\u4E1A\u6570\u5B57\u5316\u8F6C\u578B\u3002\n\n\uD83D\uDE80 \u7ACB\u5373\u4F53\u9A8C\uFF0C\u5F00\u542FAI\u65B0\u65F6\u4EE3\uFF01';
        }
      };
      patchedFn._fallbackPatched = true;
      // Copy any properties from original
      for(var key in origAiGen) {
        if(origAiGen.hasOwnProperty(key)) patchedFn[key] = origAiGen[key];
      }
      window.aiGenerateText = patchedFn;
    }
  };
  // Run after a delay to ensure original function is defined
  setTimeout(function(){
    window._patchAiGenerate();
  }, 100);
  // Also try on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(window._patchAiGenerate, 200);
  });

})();
