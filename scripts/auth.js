;(function (global, $) {

  global.ajaxUtils = {
    request: function (url, type, parmas, dataType) {
      return new Promise(function (resolve, reject) {
        $.ajax({
          type: type,
          url: url,
          data: parmas,
          success: resolve,
          error: reject,
          dataType: dataType || 'json'
        });
      });
    },
    get: function (url, parmas, dataType) {
      return this.request(url, 'GET', parmas, dataType);
    },
    post: function (url, parmas, dataType) {
      return this.request(url, 'POST', parmas, dataType);
    }
  };

  var authReady = function () {};

  //进入web系统
  function gotoWebApp() {
    setTimeout(function () {
      authReady()
    });
  }

  //判断缓存是否存在（city,default address和user），同时判断缓存是否超时
  function isCacheUseful(key) {
    var cache = storage.local.get(key);
    if (!cache) {
      return false;
    } else {
      return true;
    }
  }

  //getOpenidByCode接口同一个code只能调用一次, 第二次调用会报错
  function getOpenidByCode(code, callback) {
    ajaxUtils.post(URLObj.weixinapiURL, {
      type: 'getOpenidByCode',
      uname: URLObj.Config.uname,
      param: code
    }).then(function (ret) {
      if (ret.code !== 0) {
        alert(ret.message);
      }
      callback(ret);
    }).catch(function (e) {
      callback(e);
    });
  }

  // 请求openID
  function requireOpenId(callback) {
    var openidFromUrl = getQueryString('openid');

    if (openidFromUrl) {
      storage.local.set("_openid", openidFromUrl);
      callback();
      return
    }

    var codeFromUrl = getQueryString('code');
    var codeFromLocal = storage.local.get('_code');

    debug('code:' + codeFromUrl);

    if (!codeFromUrl) {
      storage.local.remove('_openid');
      clearCache();
      alert('缺少code');
      return
    }

    if (codeFromLocal !== codeFromUrl) {
      storage.local.remove('_openid');
      debug('requireOpenId...');
      getOpenidByCode(codeFromUrl, function (retStr) {
        if (typeof retStr.code === 'number' && retStr.code === 0) {
          var message = JSON.parse(retStr["message"]);
          var wxopenid = message["openid"];
          storage.local.set("_openid", wxopenid);
          storage.local.set("_code", codeFromUrl);
          callback();
        } else {
          debug(JSON.stringify(retStr));
        }
      });
    } else {
      callback();
    }
  }

  /**
   * 用户是否已经关注
   * @param wxid
   * @returns {*}
   */
  var isUserFollowed = function (callback) {

    var user = storage.local.get("_user");
    var _sessionid = storage.local.get("_sessionid");
    var _openid = storage.local.get("_openid");

    if (!user && !_sessionid) {
      debug('isUserFollowed...');
      ajaxUtils.post(URLObj.weixinapiURL, {
        type: 'getWeixinUserInfo',
        uname: URLObj.Config.uname,
        param: _openid,
        __zaofans: true
      }).then(function (ret) {
        var isFollowed = (ret.data || {}).subscribe === 1 ? true : false;
        if (isFollowed) {
          storage.local.set("_isFollowed", isFollowed);
        }
        callback(isFollowed);
      }).catch(function () {
        callback(false);
      });
    } else {
      callback(true);
    }

  };

  //请求用户信息
  function requireUserInfo(callback) {
    if (!isCacheUseful('_user')) {
      debug('requireUserInfo...');
      ajaxUtils.get(
        URLObj.Config.urls.userinfo,
        {
          uname: URLObj.Config.uname,
          __openid: storage.local.get("_openid")
        }).then(function (retStr) {
        storage.local.set("_user", retStr);
        storage.local.set("_sessionid", retStr.SESSIONID);
        callback();
      }).catch(function (e) {
        if (e.status === 456) {
          storage.local.clear();
        }
      });
    } else {
      callback();
    }
  }

  function clearCache() {
    storage.local.remove("_isFollowed");
    storage.local.remove("_sessionid");
    storage.local.remove("_user");
  }

  function debug(msg) {
    if (typeof authConfig === 'undefined') {
      console.log(msg);
    } else {
      if (authConfig.isDebug === true) {
        alert(msg);
      } else {
        console.log(msg);
      }
    }
  }

  //判断是否是微信浏览器
  function isWeiXin() {
    var ua = window.navigator.userAgent;
    if (/MicroMessenger/i.test(ua)) {
      return true;
    } else {
      return false;
    }
  }

  function main() {
    if (!URLObj.Config.useCache) {
      clearCache();
    }
    requireOpenId(function () {
      isUserFollowed(function (isFollowed) {
        if (isFollowed) {
          requireUserInfo(function () {
            gotoWebApp();
          });
        } else {
          gotoWebApp();
        }
      });
    });
  }

  if (isWeiXin() && typeof WeixinJSBridge === "undefined") {
    document.addEventListener('WeixinJSBridgeReady', function wxReady() {
      main();
      document.removeEventListener('WeixinJSBridgeReady', wxReady, false);
    }, false);
  } else {
    main();
  }

  window.auth = {
    ready: function (callback) {
      authReady = callback;
    }
  }

})(window, Zepto);
