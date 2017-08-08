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

  //this.regList  = [/^https:\/\/ru(.*?)aliexpress(.*?)item(.*?\.html)/g, /(^http(.):\/\/www\.ozon\.ru)(.*?)/g];
  this.deepLink = 'http://shopeasy.by/redirect/cpa/o/ou76wi7vip8o8fxzn1fxixpo2ddqm8m2/';
  this.reg      = /^https:\/\/ru(.*?)aliexpress(.*?)item(.*?\.html)/g;
  this.filter   = {urls: ["<all_urls>"], types:["main_frame"]};
  this.opt_extraInfoSpec = ["blocking"];
  this.autoactivateObj = new autoactivateClass();

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
        //console.log(link);
        var moment = self.autoactivateObj.getMoment(link);
        console.log(moment);
        if (moment + 720000 < Date.now()){
          self.autoactivateObj.setMoment(link, Date.now());
          let partner = self.deepLink +'?to='+ encodeURIComponent(link);
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
    }
    else {
      console.log(details.reason);
    }
  }

  function _urlMatch(url){
    return self.reg.test(url) ? url.match(self.reg)[0] : null;
  }

}

var objInject = new JsInject();
