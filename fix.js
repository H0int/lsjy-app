// lsjy-app fix: remove admin nav button + footer admin link + real-time credits
(function(){
    // Fix corrupted credits
    var r=localStorage.getItem('lsjy3_credits');var c;try{c=JSON.parse(r)}catch(e){c=null}
    if(typeof c!=='object'||c===null){c={'KF02V9':10000};try{var u=JSON.parse(localStorage.getItem('lsjy3_users')||'[]');for(var i=0;i<u.length;i++){if(!c[u[i].username])c[u[i].username]=100}}catch(e){}localStorage.setItem('lsjy3_credits',JSON.stringify(c))}
    else{if(!c['KF02V9']){c['KF02V9']=10000;localStorage.setItem('lsjy3_credits',JSON.stringify(c))}}
    // Override credits
    window.getCredits=function(){try{var d=JSON.parse(localStorage.getItem('lsjy3_credits'));if(typeof d==='object'&&d!==null)return d}catch(e){}return{}};
    window.getUserCredits=function(){var u=window.getCur?window.getCur():null;if(!u)return 0;return(window.getCredits())[u.username]||0};
    window.updateCreditsUI=function(){var el=document.getElementById('creditDisplay');if(el)el.textContent=window.getUserCredits()};
    // Remove ONLY the admin button from navbar, keep everything else
    setInterval(function(){
        var btn=document.getElementById('navAdminBtn');
        if(btn){btn.parentNode&&btn.parentNode.removeChild(btn);return}
        var nav=document.getElementById('navRight');if(!nav)return;
        for(var i=0;i<nav.children.length;i++){
            var ch=nav.children[i];
            if(ch.tagName==='A'&&ch.id==='navAdminBtn')ch.parentNode.removeChild(ch);
        }
    },600);
    // Remove admin link from footer (a[href="admin/"] or a[href*="admin"])
    setInterval(function(){
        var links=document.querySelectorAll('a[href*="admin"]');
        for(var i=0;i<links.length;i++){
            // Only remove if it's in footer area, not the actual admin page
            var href=links[i].getAttribute('href');
            if(href==='admin/'||href==='/admin/'||href==='admin'){
                var text=links[i].textContent.trim();
                if(text==='管理后台'||text==='后台管理'||text==='管理'){
                    links[i].style.display='none';
                }
            }
        }
    },1000);
    // Credits polling
    setInterval(function(){window.updateCreditsUI()},2000);
    setTimeout(function(){window.updateCreditsUI()},500);
})();
