// lsjy-app frontend fix: remove admin button + real-time credits polling
(function(){
    // Remove admin nav button immediately and keep removing
    function removeAdminBtn(){
        var btn=document.getElementById('navAdminBtn');
        if(btn){btn.remove();return true}
        // Also check by attributes
        var nav=document.getElementById('navRight');
        if(nav){
            var links=nav.querySelectorAll('a');
            for(var i=0;i<links.length;i++){
                var a=links[i];
                if(a.href&&(a.href.indexOf('/admin/')>=0||a.href.indexOf('admin/')>=0)&&a.parentElement===nav&&a.textContent.trim()==='管理员'){
                    a.remove();return true;
                }
            }
        }
        return false;
    }
    removeAdminBtn();
    // Keep checking every 500ms for 10 seconds (in case CDN script runs late)
    var count=0;
    var iv=setInterval(function(){
        if(!removeAdminBtn()||count++>20)clearInterval(iv);
    },500);
    // Override getCredits/getUserCredits/updateCreditsUI
    window.getCredits=function(){try{var d=JSON.parse(localStorage.getItem('lsjy3_credits'));if(typeof d==='object'&&d!==null)return d}catch(e){}return{}};
    window.getUserCredits=function(){var u=window.getCur?window.getCur():null;if(!u)return 0;var all=window.getCredits();return all[u.username]||0};
    window.updateCreditsUI=function(){var el=document.getElementById('creditDisplay');if(el)el.textContent=window.getUserCredits()};
    // Start real-time credits polling
    if(window._creditsTimer)clearInterval(window._creditsTimer);
    window._creditsTimer=setInterval(function(){window.updateCreditsUI()},2000);
    window.updateCreditsUI();
})();
