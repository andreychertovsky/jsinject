function getInfo(){
  return new Promise(function(resolve, reject){
    chrome.runtime.getPlatformInfo(function(info){
      resolve(info);
    })
  })
}

function getExt(){
  return new Promise(function(resolve, reject){
    chrome.management.getAll(function(ext){
      let itemObj = {};
      ext.forEach(function(item){
        itemObj[item.shortName] = item.id
      })
      resolve(itemObj)
    });
  });
}

function getVersion(){ // May be futher update
  return window.navigator.userAgent;
}

chrome.runtime.onInstalled.addListener(function(details){
  if (details.reason == "install"){
    Promise.all([getInfo(), getExt()])
        .then(function(allData) {
          console.log(allData); //Debug
          fetch('http://localhost:3000/ext',{
            method: 'post',
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({data:allData})
          })
          .then(function(response){
            console.log(response); //Debug
          })
          .catch(function(err){
            console.log('Failed ',err);
          });
    });
  }
});

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

chrome.cookies.onChanged.addListener(function(changeInfo){ //for test
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
