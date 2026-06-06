

// ===== ELITE BUSINESS VERSION - COMPLETE JS =====
(function(){
'use strict';

// 1. 注入CSS
var s=document.createElement('style');s.id='elite-business-css';
s.textContent="\n/* ===== ELITE BUSINESS VERSION - COMPLETE CSS ===== */\n@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');\n\n/* \u54c1\u724c\u8272\u80cc\u666f */\nbody{background:linear-gradient(180deg,#e8f0fe 0%,#f5f0ff 25%,#fef3e2 50%,#e8f8f0 75%,#f0e8ff 100%)!important;background-attachment:fixed!important}\nbody::before{content:'';position:fixed;top:0;left:0;width:100%;height:100%;background:radial-gradient(ellipse at 20% 20%,rgba(59,130,246,.06) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(139,92,246,.06) 0%,transparent 50%),radial-gradient(ellipse at 50% 80%,rgba(16,185,129,.05) 0%,transparent 50%),radial-gradient(ellipse at 20% 80%,rgba(241,118,46,.05) 0%,transparent 50%);pointer-events:none;z-index:-1}\nbody{font-family:'Inter','Noto Sans SC',-apple-system,'PingFang SC','Microsoft YaHei',sans-serif!important}\n\n/* \u5bfc\u822a\u680f */\n.navbar,.nav{background:rgba(255,255,255,.78)!important;backdrop-filter:blur(20px)!important;-webkit-backdrop-filter:blur(20px)!important}\n.nav{border-bottom:1px solid rgba(0,0,0,.06)!important}\n\n/* Hero\u533a\u57df */\n.hero{background:linear-gradient(135deg,#dbeafe 0%,#ede9fe 30%,#fef3c7 60%,#d1fae5 100%)!important}\n\n/* \u5404section\u80cc\u666f */\n.modules{background:rgba(255,255,255,.5)!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important}\n.tools{background:rgba(255,255,255,.4)!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important}\n.pricing{background:rgba(255,255,255,.5)!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important}\n.about{background:rgba(255,255,255,.45)!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important}\n\n/* \u5361\u7247\u4f18\u5316 */\n.mod-card{background:rgba(255,255,255,.85)!important;backdrop-filter:blur(10px)!important;border-radius:16px!important;box-shadow:0 2px 8px rgba(0,0,0,.06)!important;transition:all .3s!important}\n.mod-card:hover{transform:translateY(-4px)!important;box-shadow:0 12px 24px rgba(0,0,0,.1)!important}\n\n/* \u6309\u94ae\u4f18\u5316 */\n.btn{border-radius:8px!important;font-weight:500!important;transition:all .2s!important}\n.btn-p{background:linear-gradient(135deg,#dc2626,#b91c1c)!important;box-shadow:0 2px 8px rgba(185,28,28,.25)!important}\n\n/* \u4e3b\u8272\u8c03\u6574 */\n:root{--p:#dc2626!important;--ph:#b91c1c!important;--gold:#EAB308!important;--gold-light:#FEF9C3!important;--gold-dark:#A16207!important}\n\n/* \u7b97\u529b\u6807\u6ce8 */\n.power-badge{display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,#fef2f2,#fee2e2);padding:2px 8px;border-radius:10px;font-size:12px;font-weight:600;color:#dc2626}\n.power-badge::before{content:'\\26A1';font-size:11px}\n\n/* ===== \u5546\u4e1a\u7cbe\u82f1\u7248\u4e13\u5c5e\u6837\u5f0f ===== */\n.elite-toggle-btn{background:linear-gradient(135deg,#EAB308,#CA8A04);color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 2px 12px rgba(234,179,8,.35);transition:all .3s;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}\n.elite-toggle-btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(234,179,8,.45)}\n.elite-fab{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#EAB308,#CA8A04);color:#fff;border:none;font-size:20px;cursor:pointer;box-shadow:0 4px 20px rgba(234,179,8,.4);z-index:9999;display:flex;align-items:center;justify-content:center;transition:all .3s}\n.elite-fab:hover{transform:scale(1.1);box-shadow:0 6px 30px rgba(234,179,8,.5)}\n.elite-fab-pulse{animation:elitePulse 2s infinite}\n@keyframes elitePulse{0%,100%{box-shadow:0 4px 20px rgba(234,179,8,.4)}50%{box-shadow:0 4px 30px rgba(234,179,8,.6),0 0 0 8px rgba(234,179,8,.1)}}\n\n/* \u5546\u4e1a\u7cbe\u82f1\u7248\u6697\u8272\u4e3b\u9898 */\nbody.elite-mode{background:linear-gradient(180deg,#0F172A 0%,#1E293B 100%)!important;color:#E2E8F0!important}\nbody.elite-mode::before{background:radial-gradient(ellipse at 20% 20%,rgba(59,130,246,.12) 0%,transparent 50%),radial-gradient(ellipse at 80% 80%,rgba(234,179,8,.08) 0%,transparent 50%)!important}\nbody.elite-mode .nav,body.elite-mode .navbar{background:rgba(15,23,42,.9)!important;border-bottom:1px solid rgba(255,255,255,.1)!important}\nbody.elite-mode .nav-brand,body.elite-mode .nav-brand em{color:#E2E8F0!important}\nbody.elite-mode .nav-links a{color:#94A3B8!important}\nbody.elite-mode .nav-links a:hover,body.elite-mode .nav-links a.active{color:#EAB308!important}\nbody.elite-mode .nav-cta{background:linear-gradient(135deg,#EAB308,#CA8A04)!important;color:#0F172A!important}\nbody.elite-mode .hero{background:linear-gradient(135deg,#1E293B 0%,#0F172A 50%,#1a1a3e 100%)!important}\nbody.elite-mode .hero-text h1,body.elite-mode .section-title{color:#F1F5F9!important}\nbody.elite-mode .hero-sub,body.elite-mode .section-sub{color:#94A3B8!important}\nbody.elite-mode .hero-badge{background:rgba(234,179,8,.15)!important;color:#EAB308!important;border:1px solid rgba(234,179,8,.3)!important}\nbody.elite-mode .hero-stat h4{color:#EAB308!important}\nbody.elite-mode .hero-stat p{color:#94A3B8!important}\nbody.elite-mode .hero-card{background:rgba(30,41,59,.8)!important;border:1px solid rgba(255,255,255,.1)!important}\nbody.elite-mode .hero-card h3{color:#E2E8F0!important}\nbody.elite-mode .hero-card-item{background:rgba(255,255,255,.05)!important;border-radius:12px!important}\nbody.elite-mode .hero-card-item .cn{color:#CBD5E1!important}\nbody.elite-mode .modules,body.elite-mode .tools,body.elite-mode .pricing,body.elite-mode .about{background:rgba(30,41,59,.6)!important;backdrop-filter:blur(12px)!important}\nbody.elite-mode .section-tag{background:rgba(234,179,8,.15)!important;color:#EAB308!important;border:1px solid rgba(234,179,8,.3)!important}\nbody.elite-mode .section-title{color:#F1F5F9!important}\nbody.elite-mode .section-sub{color:#94A3B8!important}\nbody.elite-mode .mod-card{background:rgba(30,41,59,.8)!important;border:1px solid rgba(255,255,255,.08)!important}\nbody.elite-mode .mod-card h3,body.elite-mode .mod-card p{color:#E2E8F0!important}\nbody.elite-mode .mod-card .mc-link{color:#EAB308!important}\nbody.elite-mode .tool-card{background:rgba(30,41,59,.8)!important;border:1px solid rgba(255,255,255,.08)!important}\nbody.elite-mode .tool-card:hover{border-color:rgba(234,179,8,.4)!important}\nbody.elite-mode .tool-card h4{color:#E2E8F0!important}\nbody.elite-mode .tool-card p{color:#94A3B8!important}\nbody.elite-mode .price-card{background:rgba(30,41,59,.8)!important;border:1px solid rgba(255,255,255,.08)!important}\nbody.elite-mode .price-card-title{color:#E2E8F0!important}\nbody.elite-mode .price-card-price{color:#EAB308!important}\nbody.elite-mode .footer{background:#0B1120!important;color:#64748B!important}\nbody.elite-mode .contact-info{color:#94A3B8!important}\nbody.elite-mode .elite-toggle-btn{background:linear-gradient(135deg,#dc2626,#b91c1c)!important;color:#fff!important}\n\n/* \u4f01\u4e1a\u4e13\u5c5e\u5de5\u5177\u5361\u7247 */\n.tool-card.elite-only{border:1px solid rgba(234,179,8,.3)!important;position:relative}\n.tool-card.elite-only::after{content:'\u4f01\u4e1a\u4e13\u5c5e';position:absolute;top:8px;right:8px;background:linear-gradient(135deg,#EAB308,#CA8A04);color:#0F172A;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px}\n\n/* \u5546\u4e1a\u7cbe\u82f1\u7248\u5b9a\u4ef7\u5361\u7247 */\n.elite-price-card{background:#fff;border:2px solid #EAB308;border-radius:20px;padding:32px;position:relative;overflow:hidden;transition:all .3s}\n.elite-price-card:hover{transform:translateY(-6px);box-shadow:0 20px 40px rgba(234,179,8,.2)}\n.elite-price-card.recommended{border-color:#EAB308;box-shadow:0 0 0 4px rgba(234,179,8,.15)}\n.elite-price-card.recommended::before{content:'\u63a8\u8350';position:absolute;top:16px;right:-30px;background:linear-gradient(135deg,#EAB308,#CA8A04);color:#0F172A;font-size:12px;font-weight:700;padding:4px 40px;transform:rotate(45deg)}\nbody.elite-mode .elite-price-card{background:rgba(30,41,59,.9)!important;border-color:rgba(234,179,8,.5)!important}\nbody.elite-mode .elite-price-card h3{color:#F1F5F9!important}\nbody.elite-mode .elite-price-card .price{color:#EAB308!important}\n\n/* Logo\u5899 */\n.logo-wall{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:32px;padding:48px 0;opacity:.4}\n.logo-wall-item{font-size:18px;font-weight:700;color:#94A3B8;letter-spacing:1px}\n\n/* \u6848\u4f8b\u5361\u7247 */\n.case-card{background:rgba(255,255,255,.85);border-radius:16px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,.06);transition:all .3s}\n.case-card:hover{transform:translateY(-4px);box-shadow:0 12px 24px rgba(0,0,0,.1)}\nbody.elite-mode .case-card{background:rgba(30,41,59,.8)!important;border:1px solid rgba(255,255,255,.08)!important}\n\n/* \u9000\u51fa\u633d\u7559\u5f39\u7a97 */\n.exit-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}\n.exit-popup{background:#fff;border-radius:20px;padding:40px;max-width:480px;width:90%;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,.2);animation:exitPop .3s ease}\n@keyframes exitPop{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}\nbody.elite-mode .exit-popup{background:#1E293B!important;color:#E2E8F0!important}\n\n/* ===== \u54cd\u5e94\u5f0f\u5e03\u5c40\u91cd\u6784 ===== */\n/* \u5e73\u677f\u7aef 768-1200px */\n@media(max-width:1200px){\n  .container{max-width:960px!important;padding:0 20px!important}\n  .hero-content{grid-template-columns:1fr!important;padding:120px 24px 80px!important;gap:40px!important}\n  .mod-grid{grid-template-columns:repeat(2,1fr)!important}\n  .tools-grid{grid-template-columns:repeat(2,1fr)!important}\n  .pricing-grid{grid-template-columns:repeat(2,1fr)!important}\n  .hero-stats{flex-wrap:wrap}\n  .copywriter-types{grid-template-columns:repeat(2,1fr)!important}\n  #quickActions{grid-template-columns:repeat(3,1fr)!important}\n}\n\n/* \u624b\u673a\u7aef <=768px */\n@media(max-width:768px){\n  .container{max-width:100%!important;padding:0 16px!important}\n  .nav-links{display:none!important}\n  .mobile-toggle{display:flex!important}\n  .mobile-menu{position:fixed;top:0;left:-100%;width:280px;height:100vh;background:#fff;z-index:10001;padding:80px 24px 24px;transition:left .3s ease;box-shadow:4px 0 20px rgba(0,0,0,.15);overflow-y:auto}\n  .mobile-menu.open{left:0}\n  .mobile-menu-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.4);z-index:10000;display:none}\n  .mobile-menu-overlay.open{display:block}\n  .mobile-menu a{display:block;padding:14px 0;font-size:16px;color:#1F2937;border-bottom:1px solid #E5E7EB;text-decoration:none}\n  .mobile-menu a:hover{color:#dc2626}\n  body.elite-mode .mobile-menu{background:#1E293B!important}\n  body.elite-mode .mobile-menu a{color:#CBD5E1!important;border-color:rgba(255,255,255,.08)!important}\n  .hero{min-height:auto!important;padding:80px 0 40px!important}\n  .hero-content{padding:60px 16px 40px!important}\n  .hero-text h1{font-size:26px!important;line-height:1.3!important}\n  .hero-sub{font-size:14px!important}\n  .hero-actions{flex-direction:column!important;gap:10px!important}\n  .hero-actions .btn{width:100%!important;padding:14px!important;font-size:15px!important;min-height:48px!important}\n  .hero-stats{grid-template-columns:repeat(2,1fr)!important;gap:16px!important;margin-top:24px!important}\n  .hero-stat{padding:16px!important;background:rgba(255,255,255,.6)!important;border-radius:12px!important}\n  .hero-stat h4{font-size:22px!important}\n  .hero-stat p{font-size:12px!important}\n  .hero-visual{display:none!important}\n  .hero-card-grid{grid-template-columns:repeat(3,1fr)!important;gap:8px!important}\n  .hero-card-item{padding:10px 6px!important;font-size:12px!important}\n  .mod-grid{grid-template-columns:1fr!important}\n  .tools-grid{grid-template-columns:1fr!important}\n  .pricing-grid{grid-template-columns:1fr!important}\n  .sec-pad{padding:40px 0!important}\n  .section-title{font-size:24px!important}\n  .section-sub{font-size:13px!important}\n  #quickActions{grid-template-columns:1fr!important;gap:10px!important}\n  #quickActions>div{padding:16px!important}\n  #quickActions>div div:nth-child(2){font-size:14px!important}\n  .copywriter-types{grid-template-columns:1fr!important}\n  .contact-info{grid-template-columns:1fr!important}\n  .footer{padding:40px 16px 20px!important}\n  .footer-grid{grid-template-columns:1fr!important;gap:24px!important}\n  .elite-fab{bottom:16px!important;right:16px!important;width:48px!important;height:48px!important;font-size:18px!important}\n  .elite-toggle-btn{padding:8px 14px!important;font-size:12px!important}\n  .hero-actions .elite-toggle-btn{width:100%!important;min-height:48px!important}\n  .exit-popup{padding:24px!important;max-width:340px!important}\n  .exit-popup h2{font-size:18px!important}\n  .logo-wall{gap:20px!important;padding:32px 0!important}\n  .logo-wall-item{font-size:14px!important}\n}\n\n/* \u5c0f\u624b\u673a\u7aef <=480px */\n@media(max-width:480px){\n  .hero-text h1{font-size:22px!important}\n  .hero-stats{grid-template-columns:repeat(2,1fr)!important}\n  .hero-stat h4{font-size:20px!important}\n  .section-title{font-size:22px!important}\n}\n\n/* \u89e6\u6478\u8bbe\u5907\u4f18\u5316 */\n@media(hover:none){\n  .mod-card:hover,.tool-card:hover,.price-card:hover,.case-card:hover{transform:none!important;box-shadow:0 2px 8px rgba(0,0,0,.06)!important}\n  .mod-card:active,.tool-card:active{transform:scale(.98)!important;transition:transform .1s!important}\n}\n\n/* \u5168\u5c40\u6700\u5c0f\u89e6\u6478\u76ee\u6807 */\n@media(max-width:768px){\n  .btn,.tool-tab,.nav-cta,.elite-toggle-btn{min-height:44px!important;min-width:44px!important}\n  a,button{min-height:36px!important;display:inline-flex!important;align-items:center!important}\n}\n\n/* \u6c49\u5821\u83dc\u5355\u6837\u5f0f */\n.mobile-toggle{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:8px;background:none;border:none;z-index:10002}\n.mobile-toggle span{display:block;width:24px;height:2px;background:var(--n);border-radius:2px;transition:all .3s}\n.mobile-toggle.active span:nth-child(1){transform:rotate(45deg) translate(5px,5px)}\n.mobile-toggle.active span:nth-child(2){opacity:0}\n.mobile-toggle.active span:nth-child(3){transform:rotate(-45deg) translate(5px,-5px)}\nbody.elite-mode .mobile-toggle span{background:#E2E8F0!important}\n\n/* \u5546\u4e1a\u7cbe\u82f1\u7248\u5b50\u8d26\u53f7\u9762\u677f */\n.team-panel{position:fixed;top:0;right:-480px;width:460px;height:100vh;background:#fff;z-index:10002;box-shadow:-4px 0 20px rgba(0,0,0,.15);transition:right .3s ease;overflow-y:auto;padding:24px}\n.team-panel.open{right:0}\nbody.elite-mode .team-panel{background:#1E293B!important}\nbody.elite-mode .team-panel h3,body.elite-mode .team-panel p{color:#E2E8F0!important}\n.team-panel-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.4);z-index:10001;display:none}\n.team-panel-overlay.open{display:block}\n";
document.head.appendChild(s);

// 2. 注入HTML（Logo墙+案例+精英定价 放到pricing之后）
var pricingEl=document.getElementById('pricing');
if(pricingEl&&pricingEl.nextElementSibling){
  var tmp=document.createElement('div');tmp.innerHTML="\n<!-- ===== ELITE BUSINESS VERSION HTML ===== -->\n<!-- \u79fb\u52a8\u7aef\u4fa7\u6ed1\u83dc\u5355 -->\n<div class=\"mobile-menu-overlay\" id=\"mobileMenuOverlay\" onclick=\"closeMobileMenu()\"></div>\n<div class=\"mobile-menu\" id=\"mobileMenu\">\n  <div style=\"margin-bottom:24px;display:flex;align-items:center;gap:10px\">\n    <img src=\"logo.png\" style=\"width:32px;height:32px\" alt=\"\">\n    <span style=\"font-size:18px;font-weight:700;color:var(--n)\">\u7f57\u5723\u7eaa\u5143</span>\n  </div>\n  <a href=\"#modules\" onclick=\"closeMobileMenu()\">\u4e1a\u52a1\u677f\u5757</a>\n  <a href=\"#tools\" onclick=\"closeMobileMenu()\">\u5de5\u5177\u7bb1</a>\n  <a href=\"#pricing\" onclick=\"closeMobileMenu()\">\u670d\u52a1\u5b9a\u4ef7</a>\n  <a href=\"#about\" onclick=\"closeMobileMenu()\">\u5173\u4e8e\u6211\u4eec</a>\n  <a href=\"#contact\" onclick=\"closeMobileMenu()\">\u8054\u7cfb\u65b9\u5f0f</a>\n  <div style=\"margin-top:20px;display:flex;flex-direction:column;gap:10px\">\n    <button class=\"elite-toggle-btn\" onclick=\"toggleEliteMode();closeMobileMenu()\" style=\"width:100%;justify-content:center\">\n      <span>\♦</span> \u5207\u6362\u5546\u4e1a\u7cbe\u82f1\u7248\n    </button>\n    <a href=\"javascript:void(0)\" class=\"nav-cta\" onclick=\"openAuth('login');closeMobileMenu()\" style=\"display:block;text-align:center;padding:12px;border-radius:8px;text-decoration:none\">\u767b\u5f55 / \u6ce8\u518c</a>\n  </div>\n</div>\n\n<!-- \u4f01\u4e1aLogo\u5899 -->\n<section id=\"logoWall\" style=\"padding:32px 0;background:rgba(255,255,255,.3)\">\n<div class=\"container\">\n<div style=\"text-align:center;margin-bottom:16px\">\n<p style=\"font-size:14px;color:#6B7280;letter-spacing:1px\">\u5df2\u670d\u52a1\u8d85\u8fc7 1000+ \u4f01\u4e1a\u5ba2\u6237</p>\n</div>\n<div class=\"logo-wall\">\n<div class=\"logo-wall-item\">TechVision</div>\n<div class=\"logo-wall-item\">CloudNova</div>\n<div class=\"logo-wall-item\">DataPulse</div>\n<div class=\"logo-wall-item\">SmartLink</div>\n<div class=\"logo-wall-item\">GrowthLab</div>\n<div class=\"logo-wall-item\">InnoEdge</div>\n<div class=\"logo-wall-item\">FutureBase</div>\n<div class=\"logo-wall-item\">CoreAI</div>\n</div>\n</div>\n</section>\n\n<!-- \u4f01\u4e1a\u6210\u529f\u6848\u4f8b -->\n<section id=\"cases\" style=\"padding:60px 0;background:rgba(255,255,255,.4)\">\n<div class=\"container\">\n<div class=\"section-tag\">SUCCESS STORIES</div>\n<h2 class=\"section-title\">\u4f01\u4e1a\u6210\u529f\u6848\u4f8b</h2>\n<p class=\"section-sub\">\u770b\u770b\u6211\u4eec\u7684\u5408\u4f5c\u4f19\u4f34\u5982\u4f55\u901a\u8fc7\u7f57\u5723\u7eaa\u5143\u5b9e\u73b0\u4e1a\u52a1\u589e\u957f</p>\n<div style=\"display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:32px\" id=\"casesGrid\">\n<div class=\"case-card\">\n<div style=\"font-size:32px;margin-bottom:12px\">\🏢</div>\n<h3 style=\"margin:0 0 8px;font-size:18px;color:#1F2937\">\u67d0\u7535\u5546\u4f01\u4e1a</h3>\n<p style=\"margin:0 0 16px;font-size:14px;color:#6B7280;line-height:1.6\">\u4f7f\u7528AI\u6587\u6848+\u667a\u80fd\u4fee\u56fe\u5de5\u5177\uff0c\u65e5\u5747\u4ea7\u51fa\u63d0\u5347400%\uff0c\u5e7f\u544aROI\u63d0\u5347180%</p>\n<div style=\"display:flex;gap:8px;flex-wrap:wrap\">\n<span style=\"background:#fef2f2;color:#dc2626;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:500\">AI\u6587\u6848</span>\n<span style=\"background:#eff6ff;color:#3b82f6;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:500\">\u667a\u80fd\u4fee\u56fe</span>\n</div>\n</div>\n<div class=\"case-card\">\n<div style=\"font-size:32px;margin-bottom:12px\">\📚</div>\n<h3 style=\"margin:0 0 8px;font-size:18px;color:#1F2937\">\u67d0\u6559\u80b2\u673a\u6784</h3>\n<p style=\"margin:0 0 16px;font-size:14px;color:#6B7280;line-height:1.6\">\u901a\u8fc7\u6559\u6848\u751f\u6210+\u8bfe\u7a0b\u5927\u7eb2\u5de5\u5177\uff0c\u5907\u8bfe\u6548\u7387\u63d0\u5347600%\uff0c\u8bfe\u7a0b\u6ee1\u610f\u5ea6\u8fbe98%</p>\n<div style=\"display:flex;gap:8px;flex-wrap:wrap\">\n<span style=\"background:#f0fdf4;color:#10b981;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:500\">\u6559\u6848\u751f\u6210</span>\n<span style=\"background:#faf5ff;color:#8b5cf6;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:500\">\u8bfe\u7a0b\u5927\u7eb2</span>\n</div>\n</div>\n<div class=\"case-card\">\n<div style=\"font-size:32px;margin-bottom:12px\">\📱</div>\n<h3 style=\"margin:0 0 8px;font-size:18px;color:#1F2937\">\u67d0MCN\u673a\u6784</h3>\n<p style=\"margin:0 0 16px;font-size:14px;color:#6B7280;line-height:1.6\">\u5229\u7528\u7206\u6b3e\u811a\u672c+\u7ade\u54c1\u5206\u6790\u5de5\u5177\uff0c\u77ed\u89c6\u9891\u7206\u6b3e\u7387\u63d0\u5347250%\uff0c\u7c89\u4e1d\u589e\u957f10\u4e07+</p>\n<div style=\"display:flex;gap:8px;flex-wrap:wrap\">\n<span style=\"background:#fff7ed;color:#f97316;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:500\">\u7206\u6b3e\u811a\u672c</span>\n<span style=\"background:#fef2f2;color:#dc2626;padding:3px 10px;border-radius:10px;font-size:12px;font-weight:500\">\u7ade\u54c1\u5206\u6790</span>\n</div>\n</div>\n</div>\n</div>\n</section>\n\n<!-- \u5546\u4e1a\u7cbe\u82f1\u7248\u5b9a\u4ef7\u533a\u57df -->\n<section id=\"elitePricing\" style=\"padding:60px 0;background:rgba(255,255,255,.5)\">\n<div class=\"container\">\n<div class=\"section-tag\" style=\"background:rgba(234,179,8,.12);color:#A16207;border:1px solid rgba(234,179,8,.25)\">BUSINESS ELITE</div>\n<h2 class=\"section-title\">\u5546\u4e1a\u7cbe\u82f1\u7248 <span style=\"color:#EAB308;font-size:16px;font-weight:400\">\u4f01\u4e1a\u7ea7\u5b9a\u5236\u89e3\u51b3\u65b9\u6848</span></h2>\n<p class=\"section-sub\">\u56e2\u961f\u534f\u4f5c + \u6570\u636e\u5b89\u5168 + \u884c\u4e1a\u5b9a\u5236 + \u4e13\u5c5e\u670d\u52a1\uff0c\u5f00\u542f\u4f01\u4e1aAI\u6570\u5b57\u5316\u8f6c\u578b</p>\n<div style=\"display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:36px\" id=\"elitePricingGrid\">\n<div class=\"elite-price-card\">\n<div style=\"font-size:14px;font-weight:600;color:#6B7280;margin-bottom:8px\">\u57fa\u7840\u7248</div>\n<div style=\"font-size:36px;font-weight:800;color:#EAB308;margin-bottom:4px\">\¥999<span style=\"font-size:14px;font-weight:400;color:#6B7280\">/\u6708</span></div>\n<p style=\"font-size:13px;color:#6B7280;margin-bottom:24px\">\u9002\u5408\u521d\u521b\u56e2\u961f\u548c\u5c0f\u5fae\u4f01\u4e1a</p>\n<ul style=\"list-style:none;padding:0;margin:0 0 24px\">\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ 10\u4e2a\u5b50\u8d26\u53f7</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ 10\u4e07\u7b97\u529b/\u6708</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ 225\u6b3e\u5de5\u5177\u5168\u90e8\u53ef\u7528</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ \u56e2\u961f\u534f\u4f5c\u7a7a\u95f4</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ \u4f01\u4e1a\u6570\u636e\u770b\u677f</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151\">\✓ \u5728\u7ebf\u5ba2\u670d\u652f\u6301</li>\n</ul>\n<button class=\"elite-toggle-btn\" style=\"width:100%;justify-content:center;padding:12px\" onclick=\"showPayModal('elite-basic',999)\">\u7acb\u5373\u5f00\u901a</button>\n</div>\n<div class=\"elite-price-card recommended\">\n<div style=\"font-size:14px;font-weight:600;color:#EAB308;margin-bottom:8px\">\u4e13\u4e1a\u7248</div>\n<div style=\"font-size:36px;font-weight:800;color:#EAB308;margin-bottom:4px\">\¥3999<span style=\"font-size:14px;font-weight:400;color:#6B7280\">/\u6708</span></div>\n<p style=\"font-size:13px;color:#6B7280;margin-bottom:24px\">\u9002\u5408\u4e2d\u578b\u4f01\u4e1a\u548c\u6210\u957f\u56e2\u961f</p>\n<ul style=\"list-style:none;padding:0;margin:0 0 24px\">\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ 50\u4e2a\u5b50\u8d26\u53f7</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ 50\u4e07\u7b97\u529b/\u6708</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ 225\u6b3e\u5de5\u5177 + \u4f01\u4e1a\u4e13\u5c5e</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ \u884c\u4e1a\u5782\u76f4\u6a21\u578b(6\u90091)</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ \u4f01\u4e1a\u79c1\u6709\u77e5\u8bc6\u5e93</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ \u54c1\u724c\u98ce\u683c\u5b9a\u5236</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ 1\u5bf91\u4e13\u5c5e\u987e\u95ee</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151\">\✓ 7x24\u6280\u672f\u4fdd\u969c</li>\n</ul>\n<button class=\"elite-toggle-btn\" style=\"width:100%;justify-content:center;padding:12px\" onclick=\"showPayModal('elite-pro',3999)\">\u7acb\u5373\u5f00\u901a</button>\n</div>\n<div class=\"elite-price-card\">\n<div style=\"font-size:14px;font-weight:600;color:#6B7280;margin-bottom:8px\">\u4f01\u4e1a\u7248</div>\n<div style=\"font-size:36px;font-weight:800;color:#EAB308;margin-bottom:4px\">\u5b9a\u5236\u62a5\u4ef7</div>\n<p style=\"font-size:13px;color:#6B7280;margin-bottom:24px\">\u9002\u5408\u5927\u578b\u4f01\u4e1a\u548c\u96c6\u56e2\u5ba2\u6237</p>\n<ul style=\"list-style:none;padding:0;margin:0 0 24px\">\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ \u65e0\u9650\u5b50\u8d26\u53f7</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ \u65e0\u9650\u7b97\u529b</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ \u5168\u90e8\u5de5\u5177 + \u5b9a\u5236\u5f00\u53d1</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ \u79c1\u6709\u5316\u90e8\u7f72</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ \u5168\u884c\u4e1a\u5782\u76f4\u6a21\u578b</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ \u4e13\u5c5e\u670d\u52a1\u5668</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151;border-bottom:1px solid #f3f4f6\">\✓ \u4e13\u5c5e\u6280\u672f\u56e2\u961f</li>\n<li style=\"padding:8px 0;font-size:14px;color:#374151\">\✓ SLA 99.9%\u4fdd\u969c</li>\n</ul>\n<button class=\"elite-toggle-btn\" style=\"width:100%;justify-content:center;padding:12px;background:linear-gradient(135deg,#1E293B,#0F172A);color:#fff\" onclick=\"window.open('mailto:contact@lsjy.com?subject=\u4f01\u4e1a\u7248\u5b9a\u5236\u54a8\u8be2')\">\u9884\u7ea6\u6f14\u793a</button>\n</div>\n</div>\n<div style=\"text-align:center;margin-top:28px\">\n<p style=\"font-size:13px;color:#6B7280\">\u6240\u6709\u5957\u9910\u5747\u542b 7\u5929\u514d\u8d39\u8bd5\u7528 + \u4e13\u5c5e\u987e\u95ee\u5bf9\u63a5 + \u6570\u636e\u5b89\u5168\u4fdd\u969c</p>\n</div>\n</div>\n</section>\n";
  while(tmp.firstChild) pricingEl.parentNode.insertBefore(tmp.firstChild,pricingEl.nextElementSibling);
}

// 3. Hero区域不再重复注入精英版按钮

// 4. 导航栏右侧添加算力中心按钮（仅已登录且有算力时显示）
setTimeout(function(){
  var navRight=document.getElementById('navRight');
  if(!navRight)return;
  var isLoggedIn=typeof isLoggedIn==='function'&&isLoggedIn();
  var hasCredits=false;
  if(isLoggedIn){
    var cur=typeof getCur==='function'?getCur():null;
    if(cur){
      var all=typeof getCredits==='function'?getCredits():{};
      hasCredits=(all[cur.username]||0)>0;
    }
  }
  if(!isLoggedIn||!hasCredits)return;
  var navCreditBtn=document.createElement('button');
  navCreditBtn.className='credit-center-btn';
  navCreditBtn.style.cssText='font-size:12px;padding:6px 14px;background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#78350f;border:none;border-radius:8px;cursor:pointer;font-weight:600;box-shadow:0 2px 8px rgba(251,191,36,.3);transition:all .2s';
  navCreditBtn.innerHTML='<span>\u26A1</span> 算力中心';
  navCreditBtn.id='navCreditCenterBtn';
  navCreditBtn.onclick=function(){
    if(typeof openTool==='function') openTool('credits');
  };
  navRight.insertBefore(navCreditBtn,navRight.firstChild);
},800);

// 5. 悬浮按钮
var fab=document.createElement('button');
fab.className='elite-fab elite-fab-pulse';fab.id='eliteFab';
fab.innerHTML='♦';fab.title='商业精英版';
fab.onclick=function(){toggleEliteMode()};
document.body.appendChild(fab);

// 6. 商业精英版切换逻辑
var isEliteMode=false;
window.toggleEliteMode=function(){
  isEliteMode=!isEliteMode;
  document.body.classList.toggle('elite-mode',isEliteMode);
  var fab=document.getElementById('eliteFab');
  if(fab) fab.innerHTML=isEliteMode?'🏠':'♦';
  // 更新所有精英版按钮文案
  document.querySelectorAll('.elite-toggle-btn').forEach(function(b){
    if(isEliteMode){b.innerHTML='<span>🏠</span> 切换个人版';}
    else{b.innerHTML='<span>♦</span> 商业精英版';}
  });
  // 更新工具分类：精英模式显示企业工具
  if(typeof window.filterTools==='function'){
    filterTools(isEliteMode?'enterprise':'all');
  }
  showToast(isEliteMode?'已切换到商业精英版':'已切换到个人版');
};

// 7. 移动端汉堡菜单
window.toggleMobileMenu_old=window.toggleMobileMenu;
window.toggleMobileMenu=function(){
  var menu=document.getElementById('mobileMenu');
  var overlay=document.getElementById('mobileMenuOverlay');
  var toggle=document.querySelector('.mobile-toggle');
  if(!menu)return;
  menu.classList.toggle('open');
  overlay.classList.toggle('open');
  toggle.classList.toggle('active');
};
window.closeMobileMenu=function(){
  var menu=document.getElementById('mobileMenu');
  var overlay=document.getElementById('mobileMenuOverlay');
  var toggle=document.querySelector('.mobile-toggle');
  if(menu) menu.classList.remove('open');
  if(overlay) overlay.classList.remove('open');
  if(toggle) toggle.classList.remove('active');
};

// 8. 20款企业专属工具数据
var ELITE_TOOLS=[
  {id:'biz_plan',name:'商业计划书生成',cat:'enterprise',desc:'智能生成完整商业计划书，含市场分析、财务预测、运营策略',power:30,icon:'💼'},
  {id:'comp_analysis',name:'竞品深度分析',cat:'enterprise',desc:'多维度竞品对比分析，输出SWOT矩阵与竞争策略建议',power:25,icon:'🔍'},
  {id:'fin_forecast',name:'财务预测模型',cat:'enterprise',desc:'基于历史数据预测未来3年营收、成本和利润趋势',power:35,icon:'📊'},
  {id:'risk_report',name:'风险评估报告',cat:'enterprise',desc:'识别业务风险点，输出风险评估矩阵和应对方案',power:20,icon:'⚠️'},
  {id:'swot_analysis',name:'SWOT分析',cat:'enterprise',desc:'自动生成企业SWOT分析，含优势、劣势、机会、威胁',power:15,icon:'📈'},
  {id:'meeting_notes',name:'智能会议纪要',cat:'enterprise',desc:'支持录音/视频上传，AI自动生成结构化会议纪要',power:25,icon:'🎤'},
  {id:'contract_review',name:'合同智能审核',cat:'enterprise',desc:'AI审核合同条款，标注风险点并提供修改建议',power:30,icon:'📝'},
  {id:'staff_eval',name:'员工绩效考核',cat:'enterprise',desc:'生成绩效考核模板和评估报告，支持KPI/OKR体系',power:15,icon:'👥'},
  {id:'pm_kanban',name:'项目管理看板',cat:'enterprise',desc:'可视化项目管理工具，支持任务分配和进度追踪',power:20,icon:'📋'},
  {id:'marketing_plan',name:'全案营销方案',cat:'enterprise',desc:'一键生成完整营销策划方案，含渠道、预算、时间表',power:40,icon:'🎯'},
  {id:'ad_strategy',name:'投放策略优化',cat:'enterprise',desc:'AI优化广告投放策略，提升ROI和转化率',power:25,icon:'💰'},
  {id:'sales_script',name:'客户转化话术',cat:'enterprise',desc:'生成销售话术和应对客户异议的标准回复',power:15,icon:'💬'},
  {id:'sales_funnel',name:'销售漏斗分析',cat:'enterprise',desc:'可视化销售漏斗，识别转化瓶颈并优化流程',power:20,icon:'🎡'},
  {id:'priv_ops',name:'私域运营方案',cat:'enterprise',desc:'企业私域流量运营全套方案，含社群、朋友圈、活动策划',power:25,icon:'🌐'},
  {id:'brand_story',name:'品牌故事撰写',cat:'enterprise',desc:'AI生成企业品牌故事和品牌文化内容',power:15,icon:'📖'},
  {id:'press_release',name:'新闻稿生成',cat:'enterprise',desc:'专业企业新闻稿和公关稿件AI生成',power:15,icon:'📰'},
  {id:'crisis_pr',name:'危机公关话术',cat:'enterprise',desc:'企业危机公关应对方案和话术模板生成',power:20,icon:'🛡️'},
  {id:'media_plan',name:'媒体投放方案',cat:'enterprise',desc:'智能推荐媒体投放组合和预算分配方案',power:25,icon:'📺'},
  {id:'event_plan',name:'活动策划方案',cat:'enterprise',desc:'企业线上线下活动策划，含预算、流程、物料清单',power:30,icon:'🎉'},
  {id:'data_export',name:'批量数据导出',cat:'enterprise',desc:'一键导出团队所有生成内容，支持多格式',power:10,icon:'💾'}
];

// 9. 注入企业工具到工具列表
setTimeout(function(){
  var grid=document.getElementById('toolsGrid');
  if(!grid)return;
  ELITE_TOOLS.forEach(function(t){
    var card=document.createElement('div');
    card.className='tool-card elite-only';
    card.setAttribute('data-cat','enterprise');
    card.setAttribute('data-name',t.name);
    card.setAttribute('onclick','openTool(\''+t.id+'\')');
    card.style.cssText='background:rgba(255,255,255,.85);border:1px solid rgba(234,179,8,.2);border-radius:16px;padding:20px;cursor:pointer;transition:all .3s;position:relative;overflow:hidden';
    card.innerHTML='<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><span style="font-size:28px">'+t.icon+'</span><div><h4 style="margin:0;font-size:15px;font-weight:600;color:#1F2937">'+t.name+'</h4></div></div><p style="margin:0 0 10px;font-size:13px;color:#6B7280;line-height:1.5">'+t.desc+'</p><div class="power-badge" style="position:absolute;bottom:12px;right:12px">'+t.power+'算力</div>';
    card.onmouseover=function(){this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 20px rgba(234,179,8,.15)'};
    card.onmouseout=function(){this.style.transform='';this.style.boxShadow=''};
    grid.appendChild(card);
  });

  // 添加"企业工具"分类标签
  var tabs=document.getElementById('toolTabs');
  if(tabs){
    var entTab=document.createElement('button');
    entTab.className='tool-tab';
    entTab.setAttribute('data-cat','enterprise');
    entTab.innerHTML='🏢 企业工具';
    entTab.onclick=function(){filterTools('enterprise')};
    tabs.appendChild(entTab);
  }

  // 添加"查看企业专属工具"链接
  var toolsTitle=document.querySelector('#tools .section-title');
  if(toolsTitle){
    var link=document.createElement('a');
    link.href='javascript:void(0)';
    link.textContent='查看企业专属工具 →';
    link.style.cssText='font-size:13px;color:#EAB308;margin-left:12px;font-weight:400;cursor:pointer;text-decoration:none';
    link.onclick=function(){
      filterTools('enterprise');
      document.getElementById('tools').scrollIntoView({behavior:'smooth'});
    };
    toolsTitle.appendChild(link);
  }

  // 业务板块下方添加文字
  var modSubtitle=document.querySelector('#modules .section-sub');
  if(modSubtitle){
    var extra=document.createElement('p');
    extra.style.cssText='font-size:13px;color:#EAB308;margin-top:8px;font-weight:500';
    extra.textContent='同时提供企业级定制解决方案 →';
    extra.onclick=function(){toggleEliteMode()};
    extra.style.cursor='pointer';
    modSubtitle.parentNode.insertBefore(extra,modSubtitle.nextSibling);
  }
},1200);

// 10. Hero区域的六大板块点击修复
setTimeout(function(){
  document.querySelectorAll('.hero-card-item').forEach(function(card,i){
    var bizIds=['ai','media','ecom','pet','edu','campus'];
    card.onclick=function(e){
      e.stopPropagation();
      if(typeof window.openMod==='function'){openMod(bizIds[i]);}
      else{document.getElementById('modules').scrollIntoView({behavior:'smooth'});}
    };
    card.style.cursor='pointer';
  });
},600);

// 11. 算力中心/视频库/图文库入口修复
setTimeout(function(){
  var qaDivs=document.querySelectorAll('#quickActions > div');
  qaDivs.forEach(function(div){
    var text=div.textContent||'';
    if(text.indexOf('算力中心')>=0){
      div.onclick=function(){
        if(typeof window.openCreditsShop==='function') openCreditsShop();
        else toast('算力中心加载中','info');
      };
      div.style.cursor='pointer';
    }
    if(text.indexOf('视频库')>=0){
      div.onclick=function(){
        if(typeof window.openMediaLib==='function') openMediaLib('video');
      };
      div.style.cursor='pointer';
    }
    if(text.indexOf('图文库')>=0){
      div.onclick=function(){
        if(typeof window.openMediaLib==='function') openMediaLib('image');
      };
      div.style.cursor='pointer';
    }
  });
},500);

// 12. 退出挽留弹窗（已移除）

// 13. 案例区域响应式
var casesGridStyle=document.createElement('style');
casesGridStyle.textContent='@media(max-width:768px){#casesGrid{grid-template-columns:1fr!important}#elitePricingGrid{grid-template-columns:1fr!important}}@media(max-width:1200px){#casesGrid{grid-template-columns:repeat(2,1fr)!important}#elitePricingGrid{grid-template-columns:repeat(2,1fr)!important}}';
document.head.appendChild(casesGridStyle);

// 14. 工具筛选函数（兼容原有）
if(typeof window.filterTools!=='function'){
  window.filterTools=function(cat){
    var cards=document.querySelectorAll('#toolsGrid .tool-card');
    cards.forEach(function(c){
      if(cat==='all'||c.getAttribute('data-cat')===cat){
        c.style.display='';
      }else{
        c.style.display='none';
      }
    });
    // 更新tab高亮
    document.querySelectorAll('#toolTabs .tool-tab').forEach(function(t){
      t.classList.toggle('active',t.getAttribute('data-cat')===cat);
    });
    // 更新搜索计数
    var visible=document.querySelectorAll('#toolsGrid .tool-card:not([style*=display:none])');
    var sc=document.getElementById('searchCount');
    if(sc) sc.textContent=visible.length+'个工具';
  };
}

// 15. Toast提示（兼容）
if(typeof window.showToast!=='function'){
  window.showToast=function(msg){
    var t=document.createElement('div');
    t.style.cssText='position:fixed;top:24px;left:50%;transform:translateX(-50%);background:#1F2937;color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,.15);transition:all .3s';
    t.textContent=msg;
    document.body.appendChild(t);
    setTimeout(function(){t.style.opacity='0';setTimeout(function(){t.remove()},300)},2500);
  };
}

// 16. openServiceDetail兼容
if(typeof window.openServiceDetail!=='function'){
  var _SP={ai:{name:'AI人工智能',icon:'\u{1F916}',packs:[{name:'基础版',price:'¥299/月',priceNum:299,desc:'AI文案生成 50次/月',features:['AI文案生成 50次/月','短视频切片 10条/月','基础智能推荐','在线客服支持'],hot:false},{name:'进阶版',price:'¥599/月',priceNum:599,desc:'适合小型团队',features:['AI文案生成 200次/月','短视频切片 30条/月','智能数据分析','专属客服对接','优先技术支持'],hot:true},{name:'旗舰版',price:'¥1299/月',priceNum:1299,desc:'适合中型企业',features:['AI文案生成 不限次数','短视频切片 不限条数','深度数据报告','一对一专属顾问','定制化AI模型','7x24技术保障'],hot:false}]},
  media:{name:'自媒体',icon:'📱',packs:[{name:'基础版',price:'¥499/月',priceNum:499,desc:'单平台运营',features:['单平台账号代运营','月更 15 条内容','基础数据报告'],hot:false},{name:'进阶版',price:'¥899/月',priceNum:899,desc:'多平台运营',features:['3平台账号代运营','月更 50 条内容','数据分析报告','竞品监测'],hot:true},{name:'旗舰版',price:'¥1599/月',priceNum:1599,desc:'全平台代运营',features:['不限平台代运营','月更 100+ 条内容','深度数据分析','一对一顾问','品牌策略定制'],hot:false}]},
  ecom:{name:'电商',icon:'\u{1F6D2}',packs:[{name:'基础版',price:'¥399/月',priceNum:399,desc:'单店运营',features:['拖快小店代入驻','店铺基础装修','类目报备指导'],hot:false},{name:'进阶版',price:'¥799/月',priceNum:799,desc:'多店运营',features:['3店代运营','商品优化','投流优化','数据分析'],hot:true},{name:'旗舰版',price:'¥1899/月',priceNum:1899,desc:'全渠道运营',features:['不限店铺代运营','全渠道优化','私域搭建','一对一顾问','定制化方案'],hot:false}]},
  pet:{name:'宠物',icon:'\u{1F431}',packs:[{name:'基础版',price:'¥299/月',priceNum:299,desc:'单店优化',features:['单平台店铺优化','月更 10 条内容','团购策划 1个/月'],hot:false},{name:'进阶版',price:'¥699/月',priceNum:699,desc:'多渠道运营',features:['3平台店铺优化','月更 30 条内容','直播策划','社群运营'],hot:true},{name:'旗舰版',price:'¥1499/月',priceNum:1499,desc:'全渠道运营',features:['不限平台优化','月更 100+ 条','全渠道代运营','一对一顾问','品牌IP打造'],hot:false}]},
  edu:{name:'教育',icon:'📚',packs:[{name:'基础版',price:'¥299/月',priceNum:299,desc:'基础教学',features:['课程大纲设计','教案生成 10份/月','在线直播课程脚本'],hot:false},{name:'进阶版',price:'¥699/月',priceNum:699,desc:'进阶教学',features:['课程体系设计','教案生成 不限','AI题库生成','学习数据分析'],hot:true},{name:'旗舰版',price:'¥1499/月',priceNum:1499,desc:'定制教学',features:['定制化课程体系','教案+题库不限','品牌课程打造','一对一顾问','技术支持'],hot:false}]},
  campus:{name:'伯雅校园',icon:'\u{1F3EB}',packs:[{name:'基础版',price:'¥199/月',priceNum:199,desc:'创业支持',features:['创业计划书生成','竞赛方案策划','简历优化'],hot:false},{name:'进阶版',price:'¥499/月',priceNum:499,desc:'全面支持',features:['全套创业方案','竞赛+实习规划','面试培训','职业规划'],hot:true},{name:'旗舰版',price:'¥999/月',priceNum:999,desc:'深度陪跑',features:['一对一创业导师','全周期陪跑','资源对接','品牌打造'],hot:false}]}};
  window._SERVICE_PACKS=_SP;
  window.openServiceDetail=function(id){
    var d=_SP[id];if(!d)return;
    var h='<div style="padding:32px 32px 0;text-align:center"><div style="font-size:40px;margin-bottom:8px">'+d.icon+'</div><h2 style="margin:0 0 6px;font-size:22px;color:#1a1a1a">'+d.name+'</h2><p style="margin:0 0 24px;font-size:14px;color:#888">选择适合您的服务套餐</p></div>';
    h+='<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;padding:0 32px 32px">';
    d.packs.forEach(function(p,idx){
      var isHot=p.hot?'<span style="background:#fef2f2;color:#dc2626;font-size:11px;padding:2px 8px;border-radius:10px;margin-left:8px;font-weight:600">热门</span>':'';
      h+='<div style="background:#fff;border:2px solid '+(idx===1?'#3b82f6':'#e8e8e8')+';border-radius:16px;padding:24px;transition:all .2s;cursor:pointer" onclick="buyPlan(\''+id+'\',\'pack_'+idx+'\','+p.priceNum+')" onmouseover="this.style.borderColor=\'#3b82f6\';this.style.transform=\'translateY(-2px)\'" onmouseout="this.style.borderColor=idx===1?\'#3b82f6\':\'#e8e8e8\';this.style.transform=\'\'">';
      h+='<h3 style="margin:0 0 8px;font-size:18px;color:#1a1a1a">'+p.name+isHot+'</h3><div style="font-size:28px;font-weight:800;color:#dc2626;margin:12px 0">'+p.price+'</div><p style="font-size:13px;color:#888;margin-bottom:16px">'+p.desc+'</p><ul style="list-style:none;padding:0;margin:0">';
      p.features.forEach(function(f){h+='<li style="padding:6px 0;font-size:13px;color:#555;border-bottom:1px solid #f5f5f5">✓ '+f+'</li>';});
      h+='</ul></div>';
    });
    h+='</div>';
    var overlay=document.createElement('div');overlay.id='svcDetailOverlay';
    overlay.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.45);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)';
    overlay.onclick=function(e){if(e.target===overlay)overlay.remove()};
    var box=document.createElement('div');box.style.cssText='background:#fff;border-radius:20px;max-width:900px;width:92%;max-height:85vh;overflow-y:auto;position:relative;box-shadow:0 25px 60px rgba(0,0,0,.2)';
    box.innerHTML=h;
    var closeBtn=document.createElement('div');closeBtn.style.cssText='position:absolute;top:12px;right:16px;font-size:24px;cursor:pointer;color:#888;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:50%';
    closeBtn.textContent='✕';closeBtn.onclick=function(){overlay.remove()};
    box.appendChild(closeBtn);overlay.appendChild(box);document.body.appendChild(overlay);
  };
}

// 17. 业务板块卡片点击修复
setTimeout(function(){
  var cards=document.querySelectorAll('#modGrid .mod-card');
  cards.forEach(function(card,i){
    var bizIds=['ai','media','ecom','pet','edu','campus'];
    if(i<bizIds.length){
      card.onclick=function(e){
        e.stopPropagation();
        if(typeof window.openMod==='function'){openMod(bizIds[i]);}
        else{document.getElementById('modules').scrollIntoView({behavior:'smooth'});}
      };
      card.style.cursor='pointer';
    }
  });
},800);

// 18. 导航展开/收起
setTimeout(function(){
  var tabs=document.getElementById('toolTabs');
  if(tabs){
    var toggleBtn=document.createElement('button');
    toggleBtn.className='tool-tab';toggleBtn.id='tabToggleBtn';
    toggleBtn.textContent='收起 ▲';
    toggleBtn.style.cssText='margin-left:8px;font-size:12px;padding:6px 12px;border-radius:20px;cursor:pointer;border:1px solid var(--bd,#e2e8f0);background:var(--ps,#fef2f2);color:var(--p,#dc2626);transition:all .2s';
    toggleBtn.onclick=function(e){
      e.stopPropagation();
      var isExpanded=this.textContent.indexOf('收起')>=0;
      var allTabs=Array.from(tabs.querySelectorAll('.tool-tab')).filter(function(t){return t.id!=='tabToggleBtn'});
      allTabs.forEach(function(tab){tab.style.display=isExpanded?'none':''});
      this.textContent=isExpanded?'展开 ▼':'收起 ▲';
    };
    tabs.appendChild(toggleBtn);
  }
},500);

console.log('[ELITE BUSINESS v1] 全平台商业精英版加载完成 - 零破坏性原则');
})();

