const deepLink = 'http://shopeasy.by/redirect/cpa/o/ou5s9n6tefplqafc1x0mef29smqnwywq/';

function madeReq(){
  return new Promise(function(resolve, reject){
    chrome.webRequest.onBeforeRequest.addListener(function(e){
     if (urlMatch(e.url)){
        const encode = encodeURIComponent(urlMatch(e.url));
        const composed = compose(deepLink, encode)
        console.log(e);
        resolve(composed)
      }
    }, {urls: ["<all_urls>"], types: ['main_frame', 'sub_frame']},["blocking"]);
  })
}

madeReq().then(function(comp){
  console.log(comp);
  chrome.tabs.update(undefined, {url:comp});
}, function(err){
  console.log(err); 
});

function urlMatch(url){
  const reg = /^http(.*?)aliexpress(.*?)item(.*?html)/g
  return reg.test(url)?url.match(reg)[0]:false
}

function compose(first, encode){
  return first+'?to='+encode;
}
/*
function likResult(){
  var EB;
  chrome.storage.onChanged.addListener(function(changes, namespace){
    chrome.storage.sync.get('composedLink', function(data){
      console.log('composedLink value '+data.composedLink);
      EB  = data.composedLink
    });
  });
  return EB;
}

console.log(likResult());
*/
