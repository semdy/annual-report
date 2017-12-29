var URLObj = {
  urlHost: "http://{hostname}/zaofans_wheat",
  siloHost: "http://it.zaofans.com/silo/debug",
  shareUrl: "http://{hostname}/OrderUI-wheat/activity/activitys/annual-report",
  weixinapiURL: "http://{hostname}/weixin_wheat/open-api",
  weixinAuthUser : "https://open.weixin.qq.com/connect/oauth2/authorize?appid={appid}&redirect_uri=http%3A%2F%2F{hostname}%2FOrderUI-wheat%2Factivity%2Factivitys%2Fannual-report%2Findex.html?uname={uname}&response_type=code&scope=snsapi_base&state=123456#wechat_redirect"
};

(function () {
  var isLocal = false;
  var hostname = location.hostname;
  var uname = getQueryString('uname') || 'zaofans';
  if (hostname === 'localhost' || /^192\.168\.\d+\.\d+/.test(hostname)) {
    hostname = "www.zaofans.com"; //"192.168.45.104:8080";
    isLocal = true;
  }

  var APPID_MAP = {
    zaofans: "wxa3c1a88324d35d1f",
    wuhan: "wx904143829f0b0d1b",
    nanjing: "wx9746bb172d736a0c",
    dalian: "wx610b5c9cf75bdf07",
    qingdao: "wx74e5adac0bacd7c2",
    chongqing: "wx6d4e8be6afe3fac0",
    haerbin: "wx5645dcf6a81003e2",
    shenyang: "wxeccc20719c5cfc7e",
    tianjin: "wxbb9dc835c34e9918",
    gertz: "wxc97360c6205ff452",
    joyseed: "wxc61ea7696e402f22",
    default: "wxa3c1a88324d35d1f"
  };

  for (var i in URLObj) {
    if (typeof URLObj[i] === 'string') {
      URLObj[i] = URLObj[i].replace(/\{hostname\}/g, hostname).replace("{uname}", uname).replace("{appid}", isLocal ? APPID_MAP.default : APPID_MAP[uname]);
    }
  }

  URLObj.Config = {
    urls: {
      userinfo: URLObj.urlHost + '/usercenter/user/info',
      buyrecord: URLObj.urlHost + '/user/buy/record/get',
      shareReward: URLObj.urlHost + '/user/reward/share/151',
      sourceUrl: 'http://edm.mcake.com/shuxy/2017/annual-report',
      shareIcon: 'http://edm.mcake.com/shuxy/2017/annual-report/resource/assets/shareIcon.png'
    },
    uname: uname,
    useCache: false
  };

  localStorage.setItem("wx_uname", uname);

  //localStorage.setItem(uname + ":_openid", 'oO--NtwPrwXr0t02BvublP9wIu9Y');

})();

function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  if (r !== null) return unescape(r[2]); return null;
}