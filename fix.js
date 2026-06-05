// lsjy-app frontend fix: remove admin button + real-time credits polling
(function(){
    function removeAdminBtn(){
        var btn=document.getElementById('navAdminBtn');
        if(btn){btn.remove();return true}
        var nav=document.getElementById('navRight');
        if(!nav)return false;
        var links=nav.querySelectorAll('a');
        for(var i=0;i<links.length;i++){
            var a=links[i];
            if(a.textContent.trim()==='管理员'&&a.getAttribute('href')==='admin/'){
                a.remove();return true;
            }
        }
        return false;
    }
    removeAdminBtn();
    var count=0;
    var iv=setInterval(function(){
        if(!removeAdminBtn()&&count++>20)clearInterval(iv);
    },500);
    // Override credits functions
    window.getCredits=function(){try{var d=JSON.parse(localStorage.getItem('lsjy3_credits'));if(typeof d==='object'&&d!==null)return d}catch(e){}return{}};
    window.getUserCredits=function(){var u=window.getCur?window.getCur():null;if(!u)return 0;var all=window.getCredits();return all[u.username]||0};
    window.updateCreditsUI=function(){var el=document.getElementById('creditDisplay');if(el)el.textContent=window.getUserCredits()};
    if(window._creditsTimer)clearInterval(window._creditsTimer);
    window._creditsTimer=setInterval(function(){window.updateCreditsUI()},2000);
    window.updateCreditsUI();
})();
