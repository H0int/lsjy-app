// lsjy-app frontend fix
(function(){
    // Override updateNavAuth to exclude admin button
    var _origUpdateNavAuth = window.updateNavAuth;
    window.updateNavAuth = function(){
        var u=window.getCur?window.getCur():null;
        var navRight=document.getElementById('navRight');
        if(!navRight)return;
        navRight.innerHTML='';
        if(u){
            // Credits display
            var creditEl=document.createElement('span');
            creditEl.id='creditDisplay';
            creditEl.style.cssText='display:inline-flex;align-items:center;gap:4px;padding:6px 14px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border-radius:8px;font-size:12px;font-weight:700;margin-right:8px;cursor:default';
            creditEl.textContent=window.getUserCredits();
            creditEl.innerHTML+=' 算力';
            navRight.appendChild(creditEl);
            // User button
            var btn=document.createElement('a');
            btn.id='navUserBtn';
            btn.href='javascript:void(0)';
            btn.style.cssText='display:inline-flex;align-items:center;gap:4px;padding:6px 14px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;box-shadow:0 2px 8px rgba(220,38,38,.3)';
            btn.innerHTML='<i class="fa-solid fa-user"></i> '+u.nickname;
            btn.onclick=function(){showProfile()};
            navRight.appendChild(btn);
        }else{
            var btn=document.createElement('a');
            btn.href='javascript:void(0)';
            btn.style.cssText='display:inline-flex;align-items:center;gap:4px;padding:8px 18px;background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;border-radius:8px;font-size:13px;font-weight:700;text-decoration:none;box-shadow:0 2px 8px rgba(220,38,38,.3)';
            btn.textContent='登录 / 注册';
            btn.onclick=function(){openAuth()};
            navRight.appendChild(btn);
        }
        // Start credits polling
        if(window._creditsTimer)clearInterval(window._creditsTimer);
        window._creditsTimer=setInterval(function(){
            var el=document.getElementById('creditDisplay');
            if(el)el.textContent=window.getUserCredits();
        },2000);
    };
    // Override credits functions
    window.getCredits=function(){try{var d=JSON.parse(localStorage.getItem('lsjy3_credits'));if(typeof d==='object'&&d!==null)return d}catch(e){}return{}};
    window.getUserCredits=function(){var u=window.getCur?window.getCur():null;if(!u)return 0;var all=window.getCredits();return all[u.username]||0};
    window.updateCreditsUI=function(){var el=document.getElementById('creditDisplay');if(el)el.textContent=window.getUserCredits()};
    // Fix corrupted credits
    (function(){
        var r=localStorage.getItem('lsjy3_credits');
        var c;try{c=JSON.parse(r)}catch(e){c=null}
        if(typeof c!=='object'||c===null){c={'KF02V9':10000};try{var u=JSON.parse(localStorage.getItem('lsjy3_users')||'[]');for(var i=0;i<u.length;i++){if(!c[u[i].username])c[u[i].username]=100}}catch(e){}localStorage.setItem('lsjy3_credits',JSON.stringify(c));}
        else{if(!c['KF02V9']){c['KF02V9']=10000;localStorage.setItem('lsjy3_credits',JSON.stringify(c))}}
    })();
    // Run updateNavAuth on DOMContentLoaded if logged in
    document.addEventListener('DOMContentLoaded',function(){
        setTimeout(function(){
            if(window.updateNavAuth)window.updateNavAuth();
        },300);
    });
})();
