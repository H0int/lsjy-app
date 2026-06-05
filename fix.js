// lsjy-app fix: remove admin button + footer admin link + real-time credits + block updateNavAuth
(function(){
    // Fix corrupted credits
    var r=localStorage.getItem('lsjy3_credits');var c;try{c=JSON.parse(r)}catch(e){c=null}
    if(typeof c!=='object'||c===null){c={'KF02V9':10000};try{var u=JSON.parse(localStorage.getItem('lsjy3_users')||'[]');for(var i=0;i<u.length;i++){if(!c[u[i].username])c[u[i].username]=100}}catch(e){}localStorage.setItem('lsjy3_credits',JSON.stringify(c))}
    else{if(!c['KF02V9']){c['KF02V9']=10000;localStorage.setItem('lsjy3_credits',JSON.stringify(c))}}
    // Override credits
    window.getCredits=function(){try{var d=JSON.parse(localStorage.getItem('lsjy3_credits'));if(typeof d==='object'&&d!==null)return d}catch(e){}return{}};
    window.getUserCredits=function(){var u=window.getCur?window.getCur():null;if(!u)return 0;return(window.getCredits())[u.username]||0};
    window.updateCreditsUI=function(){var el=document.getElementById('creditDisplay');if(el)el.textContent=window.getUserCredits()};
    // Override updateNavAuth to NEVER show admin button on frontend
    window.updateNavAuth=function(){
        var navRight=document.getElementById('navRight');
        if(!navRight)return;
        var cur=window.getCur?window.getCur():null;
        // Always show credits if logged in
        var creditsDiv=document.getElementById('navCredits');
        if(cur){
            if(!creditsDiv){
                creditsDiv=document.createElement('div');
                creditsDiv.id='navCredits';
                creditsDiv.style.cssText='display:inline-flex;align-items:center;gap:4px;padding:6px 14px;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#78350f;border-radius:8px;font-size:12px;font-weight:700;margin-right:8px;';
                creditsDiv.innerHTML='<i class="fa-solid fa-bolt"></i> <span id="creditDisplay">'+window.getUserCredits()+'</span> 算力';
                navRight.insertBefore(creditsDiv,navRight.firstChild);
            }else{
                var cd=document.getElementById('creditDisplay');
                if(cd)cd.textContent=window.getUserCredits();
            }
            // Show user info button (NOT admin button)
            var loginBtn=document.getElementById('navLoginBtn');
            if(loginBtn){
                loginBtn.textContent=cur.username;
                loginBtn.setAttribute('onclick','openAuth("login")');
            }
        }else{
            // Not logged in - show login/register
            if(creditsDiv)creditsDiv.style.display='none';
            var loginBtn=document.getElementById('navLoginBtn');
            if(loginBtn){loginBtn.textContent='登录 / 注册';}
        }
    };
    // DOM-ready: clean up any admin-related elements and force nav update
    document.addEventListener('DOMContentLoaded',function(){
        // Remove any existing admin buttons
        setInterval(function(){
            // Remove navAdminBtn (old id)
            var btn=document.getElementById('navAdminBtn');
            if(btn)btn.parentNode&&btn.parentNode.removeChild(btn);
            // Check navRight for any element with "管理员" text that links to admin
            var nav=document.getElementById('navRight');
            if(nav){
                for(var i=nav.children.length-1;i>=0;i--){
                    var ch=nav.children[i];
                    if(ch.tagName==='A'&&ch.id==='navAdminBtn'){nav.removeChild(ch);continue;}
                    // If navLoginBtn shows "管理员", keep it but rename to username
                    if(ch.tagName==='A'&&ch.id==='navLoginBtn'){
                        var cur=window.getCur?window.getCur():null;
                        if(cur&&ch.textContent.trim()==='管理员'){
                            ch.textContent=cur.username;
                        }
                    }
                }
            }
            // Remove footer admin links
            var links=document.querySelectorAll('a[href*="admin"]');
            for(var i=0;i<links.length;i++){
                var href=links[i].getAttribute('href');
                if(href==='admin/'||href==='/admin/'||href==='admin'){
                    var text=links[i].textContent.trim();
                    if(text==='管理后台'||text==='后台管理'||text==='管理'){
                        links[i].style.display='none';
                    }
                }
            }
        },600);
        // Force correct nav state
        window.updateNavAuth();
    });
    // Credits polling
    setInterval(function(){window.updateCreditsUI()},2000);
    setTimeout(function(){window.updateCreditsUI()},500);
})();
