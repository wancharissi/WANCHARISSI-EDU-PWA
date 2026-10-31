(function(){
'use strict';
const $=id=>document.getElementById(id);
const installBtn=$('pwaInstallBtn'),prompt=$('pwaPrompt'),promptInstall=$('pwaPromptInstall'),later=$('pwaPromptLater');
const help=$('pwaHelp'),helpText=$('pwaHelpText'),helpClose=$('pwaHelpClose');
let deferredPrompt=null;
const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
const dismissed=()=>{try{return localStorage.getItem('wancharissi-edu-pwa-invite')==='dismissed'}catch(_){return false}};
const dismiss=()=>{try{localStorage.setItem('wancharissi-edu-pwa-invite','dismissed')}catch(_){}};
function updateUI(){
 if(standalone()){installBtn.hidden=true;prompt.hidden=true;return}
 installBtn.hidden=false;
 // A small invitation can be displayed regardless of native prompt support.
 if(!dismissed()&&window.isSecureContext)prompt.hidden=false;
}
function showHelp(){
 const ua=navigator.userAgent;
 let html;
 if(/iphone|ipad|ipod/i.test(ua)){
   html='<p>على iPhone وiPad:</p><ol><li>افتح الرابط في Safari.</li><li>اضغط زر المشاركة.</li><li>اختر «إضافة إلى الشاشة الرئيسية» ثم أكّد.</li></ol>';
 } else if(/android/i.test(ua)){
   html='<p>على Android باستخدام Chrome:</p><ol><li>تأكد من فتح رابط HTTPS مباشرة في Chrome، لا داخل معاينة أو متصفح مدمج.</li><li>افتح قائمة النقاط الثلاث ⋮.</li><li>اختر «تثبيت التطبيق» أو «التثبيت وإنشاء اختصار»، حسب ما يعرضه المتصفح.</li><li>إذا ظهر «إنشاء اختصار» فقط، فقد لا يكون التثبيت كتطبيق مستقل متاحًا في هذه البيئة.</li></ol>';
 } else {
   html='<p>افتح هذا الموقع عبر HTTPS في متصفح يدعم تثبيت تطبيقات الويب، ثم استخدم خيار «تثبيت التطبيق» في شريط العنوان أو قائمة المتصفح إن ظهر.</p>';
 }
 if(!window.isSecureContext)html='<p><strong>مهم:</strong> يجب رفع الحزمة إلى استضافة HTTPS؛ فتح ملف index.html من التخزين مباشرة لا يتيح التثبيت الكامل أو خدمة التخزين دون إنترنت.</p>'+html;
 helpText.innerHTML=html;help.hidden=false;
}
async function requestInstall(){
 if(standalone())return;
 prompt.hidden=true;
 if(!deferredPrompt){showHelp();return}
 const event=deferredPrompt;deferredPrompt=null;
 try{await event.prompt();const choice=await event.userChoice;
   if(choice&&choice.outcome==='accepted'){dismiss();prompt.hidden=true}else{dismiss();prompt.hidden=true}
 }catch(_){showHelp()}
}
installBtn.addEventListener('click',requestInstall);
promptInstall.addEventListener('click',requestInstall);
later.addEventListener('click',()=>{dismiss();prompt.hidden=true});
helpClose.addEventListener('click',()=>{help.hidden=true});
help.addEventListener('click',event=>{if(event.target===help)help.hidden=true});
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredPrompt=event;updateUI()});
window.addEventListener('appinstalled',()=>{deferredPrompt=null;dismiss();prompt.hidden=true;installBtn.hidden=true});
window.matchMedia('(display-mode: standalone)').addEventListener?.('change',updateUI);
if('serviceWorker'in navigator && window.isSecureContext){
 navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(error=>{console.warn('PWA offline worker unavailable:',error)});
}
updateUI();
})();
