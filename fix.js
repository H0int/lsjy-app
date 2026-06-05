// lsjy-app fix: remove admin nav button + real-time credits
(function(){
    // 1. Fix corrupted credits
    var r=localStorage.getItem('lsjy3_credits');
    var c;try{c=JSON.parse(r)}catch(e){c=null}
    if(typeof c!=='object'||c===null){c={'KF02V9':10000};try{var u=JSON.parse(localStorage.getItem('lsjy3_users')||'[]');for(var i=0;i<u.length;i++){if(!c[u[i].username])c[u[i].username]=100}}catch(e){}localStorage.setItem('lsjy3_credits',JSON.stringify(c))}
    else{if(!c['KF02V9']){c['KF02V9']=10000;localStorage.setItem('lsjy3_credits',JSON.stringify(c))}}
    // 2. Override credits functions
    window.getCredits=function(){try{var d=JSON.parse(localStorage.getItem('lsjy3_credits'));if(typeof d==='object'&&d!==null)return d}catch(e){}return{}};
    window.getUserCredits=function(){var u=window.getCur?window.getCur():null;if(!u)return 0;return(window.getCredits())[u.username]||0};
    window.updateCreditsUI=function(){var el=document.getElementById('creditDisplay');if(el)el.textContent=window.getUserCredits()};
    // 3. Keep removing admin button permanently
    setInterval(function(){
        var btn=document.getElementById('navAdminBtn');
        if(btn)btn.remove();
        var nav=document.getElementById('navRight');
        if(!nav)return;
        var links=nav.children;
        for(var i=links.length-1;i>=0;i--){
            var a=links[i];
            if(a.tagName==='A'&&a.textContent.trim()==='管理员'&&a.getAttribute('href')==='admin/'&&a.id!=='navUserBtn'){a.remove()}
        }
    },800);
    // 4. Real-time credits polling
    setInterval(function(){window.updateCreditsUI()},2000);
    // 5. Initial update
    setTimeout(function(){window.updateCreditsUI()},500);
})();
