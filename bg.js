chrome.management.getAll(function(ex){
    console.log(ex); //Debug
    ex.forEach(function(item){
      console.log(item);
      if (item.id == "cjpalhdlnbpafiamejdnhcphjbkeiagm"&&item.enabled){
        chrome.management.getSelf(function(info){
          chrome.management.setEnabled(info.id, false)
        })
      }
    });
})

//const deepLink = 'http://shopeasy.by/redirect/cpa/o/ou76wi7vip8o8fxzn1fxixpo2ddqm8m2/' //Beta
const deepLink = 'http://shopeasy.by/redirect/cpa/o/ou5s9n6tefplqafc1x0mef29smqnwywq/'; //DEBUG

function madeReq(){
  return new Promise(function(resolve, reject){
    chrome.webRequest.onBeforeRequest.addListener(function(e){
     if (urlMatch(e.url)){
        const encode = encodeURIComponent(urlMatch(e.url));
        const composed = compose(deepLink, encode)
        console.log(e);//Debug
        resolve(composed)
      }
    }, {urls: ["<all_urls>"], types: ['main_frame', 'sub_frame']},[]);
  })
}

madeReq().then(function(comp){
  console.log(comp);//Debug
  chrome.tabs.update(undefined, {url:comp});
}, function(err){
  console.log(err);//Debug
});

chrome.cookies.onChanged.addListener(function(changeInfo){//for test
  //console.log(changeInfo.cookie);
  if (changeInfo.cookie.domain == "shopeasy.by"){
    console.log(changeInfo.cookie);
  }
});

function urlMatch(url){
  const reg = /^http(.*?)aliexpress(.*?)item(.*?html)/g
  return reg.test(url)?url.match(reg)[0]:false
}

function compose(first, encode){
  return first+'?to='+encode;
}
