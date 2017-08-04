const deepLink = 'http://shopeasy.by/redirect/cpa/o/ou5s9n6tefplqafc1x0mef29smqnwywq/';

function madeReq(){ //основная функция
  return new Promise(function(resolve, reject){ // создает объект промис
    chrome.webRequest.onBeforeRequest.addListener(function(e){ //вызов хром апи, запускается перед реквесто
     if (urlMatch(e.url)){ //проверка на true
        const encode = encodeURIComponent(urlMatch(e.url)); //строка полученная из функции urlMatch кодируется urlEncod ом
        const composed = compose(deepLink, encode) // возвращает готовую ссылку пригодную для перехода
        console.log(composed);
        resolve(composed) //возвращает ссылку
      }
    }, {urls: ["<all_urls>"], types: ['main_frame', 'sub_frame']},["blocking"]);
  })
}

madeReq().then(function(comp){ //промис
  console.log(comp);
  chrome.tabs.update(undefined, {url:comp}); //подставляет готовую ссылку партнерки и переходит на нее  текущей вкладке
}, function(err){
  console.log(err); //лог ошибок
});

function urlMatch(url){ // функция получает на вход url
  const reg = /^http(.*?)aliexpress(.*?)item(.*?html)/g // шаблон для проверки url
  return reg.test(url)?url.match(reg)[0]:false // возвращает строку типа *aliexpress*/item/*.html либо возвращает false
}

function compose(first, encode){ //складывает строку
  return first+'?to='+encode; //возвращает диплинк + строку полсе функции urlEncode
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
