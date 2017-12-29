;(function (window, undefined) {

  var openid = getQueryString('openid');

  function formatDate (source, format) {
    var o = {
      'M+': source.getMonth() + 1, // 月份
      'd+': source.getDate(), // 日
      'H+': source.getHours(), // 小时
      'm+': source.getMinutes(), // 分
      's+': source.getSeconds(), // 秒
      'q+': Math.floor((source.getMonth() + 3) / 3), // 季度
      'f+': source.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, (source.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    for (var k in o) {
      if (new RegExp('(' + k + ')').test(format)) {
        format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
      }
    }
    return format
  }

  function getOpenid () {
    return openid || storage.local.get('_openid');
  }

  function main() {
    var wraper = $("#pages-wrapper").css("display", "block").get(0);
    var $arrow = $("#parrow").css("display", "block").children('span');
    new AlloyTouch.FullPage(wraper, {
      animationEnd: function () {

      },
      leavePage: function (index, len) {

      },
      beginToPage: function (index, len) {
        if (index === len - 1) {
          $arrow.removeClass("arrow-down").addClass("arrow-up");
        } else {
          $arrow.addClass("arrow-down").removeClass("arrow-up");
        }
      }
    });
  }

  var mockData = {
      "buycount": "0",
      "buyfee": 0,
      "buygxnum": 0,
      "buysku": "高纤奶酪 0个,红磨坊 0个,红酒椰香 0个,红茶奶酥 0个,芝士大咖 0个",
      "buystore": "无,无",
      "cardno": "",
      "fbbrade": "无 0,无 0,无 0",
      "fbd": "",
      "fbid": "",
      "fbseller": "",
      "fbt": 0,
      "percentage": 0,
      "redbagfrom": "...",
      "getredbag": 0,
      "onlinefbt": 0,
      "sendredbag": 0,
      "shareredbag": 0,
      "userid": ""
  };

  function getRecord() {
    return new Promise(function (resolve, reject) {
      ajaxUtils.get(URLObj.Config.urls.buyrecord, {
        __sessionid: storage.local.get('_sessionid')
        }).then(function (res) {
        if (res.status === 0) {
          resolve(res.data);
        } else {
          if(openid) {
            resolve(mockData);
            //reject('您的好友在原麦山丘没有购买记录');
          }
          else {
            resolve(mockData);
            //reject('您在原麦山丘没有购买记录');
          }
        }
      }).catch(function () {
        resolve(mockData);
        //reject('您的时光机信息获取失败')
      })
    });
  }

  function page1() {
    var user = storage.local.get('_user');
    if (user) {
      $("#avatar").attr("src", user.PORTRAIT);
      $("#nickname").text(user.USERNAME || user.NAME);
    }
  }

  function page2(data) {
    var recs = '';
    var buyRecs = data.fbbrade.split(",");
    var buyCount = 0;
    var totalPrice = 0;
    buyRecs.forEach(function(e){
      var name = e.split(" ")[0]||'';
      var price = parseFloat(e.split(" ")[1])||0;
      var num = price ? 1 : 0;
      buyCount += num;
      totalPrice += Number(price);
      recs += '<div class="bill-row">\n' +
      '     <div class="bill-cell">'+ name +'</div>\n' +
      '       <div class="bill-cell">'+ price +'</div>\n' +
      '         <div class="bill-cell">'+ num +'</div>\n' +
      '         <div class="bill-cell">'+ price +'</div>\n' +
      '       </div>'
    });

    $("#recs-store").text(data.fbd);
    $("#billNo").text(data.cardno);
    $("#billSeller").text(data.fbseller === undefined ? 546512 : data.fbseller);
    $("#ptime").text(data.fbt ? formatDate(new Date(data.fbt), 'yyyy-MM-dd HH:mm:ss') : '');
    $("#buy-records").html(recs);
    $("#recs-count").text(buyCount);
    $("#recs-total").text(totalPrice);
  }

  function page3(data) {
    $("#bnum").text(data.buycount);
    $("#bfee").text(data.buyfee);
    var bstack = '';
    for(var i = 1; i<9; i++) {
      bstack += '<img class="bread'+ i +' animated" data-show="slideDown" data-delay="'+ (2000-i*200) +'" src="'+ URLObj.Config.urls.sourceUrl +'/resource/assets/b'+ i +'.png"/>'
    }
    $("#bstack").html(bstack);
    $("#percent").text(data.percentage||0);
    $("#redbagfrom").text(data.redbagfrom||"...");
  }

  function page4(data) {
    var history = '';
    data.buysku.split(',').forEach(function (e, i) {
      var name = e.split(" ")[0];
      var num = e.split(" ")[1];
      history += '<div class="buy-item animated" data-show="bounceIn" data-delay="'+ (400 + i*200) +'">\n' +
        '          <span>'+ name +'</span>\n' +
        '          <span><em>'+ parseInt(num) +'</em>个</span>\n' +
        '        </div>';
    });

    $("#bhistory").html(history);
    $("#gxnum").text(data.buycount||0);
    $("#appleNum").text((data.buycount||0)*3);
  }

  function page5(data) {
    $("#receive-redb, #receive-redb2").text(data.shareredbag||0);
    $("#send-redb, #send-redb2").text(data.sendredbag||0);
    $("#reward-redb").text(data.getredbag);
    if (!openid) {
      $("#genbtn").remove();
    } else {
      $("#sharebtn").remove();
      $("#shareHint").remove();
      $("#genbtn").click(function(){
        if (storage.local.get('_isFollowed')) {
          location.href = URLObj.weixinAuthUser;
        } else {
          alert('请先关注原麦山丘公众号');
        }
      });
    }
    $("#sharebtn").click(function(){
       $("#shareMask").show();
    });
    $("#shareMask").click(function(e){
      e.preventDefault();
      $(this).hide();
    });
  }

  function shareReward() {
    ajaxUtils.post(
      URLObj.Config.urls.shareReward,
      {
        __sessionid: storage.local.get('_sessionid')
      }).then(function(res){
        if (res.status !== 0) {
          console.error(res.msg)
        }
      }).catch(function(){
        console.log('送券接口请求失败')
    })
  }

  function wxShare() {
    weixinApiService.authorize();

    weixinApiService.exec('onMenuShareTimeline',{
      title: '原麦山丘四周年，邀你一起领福利！',
      link: URLObj.Config.urls.shareUrl + '/share.html?uname=' + URLObj.Config.uname + '&openid=' + getOpenid(),
      imgUrl:  URLObj.Config.urls.shareIcon,
      success: function (res) {
        shareReward();
        gtag('_trackEvent', 'wxshare', 'timeline', 'success');
      },
      cancel: function () {
        gtag('_trackEvent', 'wxshare', 'timeline', 'cancel');
      },
      fail: function (res) {
        console.info('fail'+JSON.stringify(res));
        gtag('_trackEvent', 'wxshare', 'timeline', 'fail');
      }
    });

    weixinApiService.exec('onMenuShareAppMessage',{
      title: '原麦山丘四周年，邀你一起领福利！',
      desc: '这台时光机，只想与你分享！',
      link: URLObj.Config.urls.shareUrl + '/share.html?uname=' + URLObj.Config.uname + '&openid=' + getOpenid(),
      imgUrl:  URLObj.Config.urls.shareIcon,
      success: function () {
        shareReward();
        gtag('_trackEvent', 'wxshare', 'appMessage', 'success');
      },
      cancel: function () {
        gtag('_trackEvent', 'wxshare', 'appMessage', 'cancel');
      }
    });
  }

  function audioAutoPlay(id){
    var audio = document.getElementById(id),
      ctrlEl = document.createElement('div'),
      play = function(){
        audio.play();
        document.removeEventListener("touchstart", play, false);
      };

    audio.play();

    document.addEventListener("WeixinJSBridgeReady", function () {
      play();
    }, false);

    document.addEventListener("touchstart",play, false);

    $(ctrlEl).addClass("music-ctrl music-on").click(function () {
      if(audio.paused) {
        audio.play();
        $(this).addClass("music-on").removeClass("music-off");
      } else {
        audio.pause();
        $(this).addClass("music-off").removeClass("music-on");
      }
    }).appendTo(document.body);
  }

  function loadResource(data){
    Resource.baseUrl = 'resource/assets/';
    return new Promise(function (resolve) {
      var loader = new Resource.loadGroup("preload", data);
      var spinModal = Resource.el('#loading-modal');
      var spin = Resource.el('#app-spin');

      loader.on("progress", function (loaded, total) {
        spin.innerHTML = "loading: " + Math.floor(loaded / total * 100) + "%";
      });

      loader.on("complete", function () {
        spinModal.style.display = 'none';
        resolve();
      });
    });
  }

  document.addEventListener('touchmove', function (e) {
    e.preventDefault();
  });

  audioAutoPlay('Jaudio');

  auth.ready(function () {
    wxShare();
    getRecord().then(function (data) {
      loadResource(resData).then(function() {
        page1(data);
        page2(data);
        page3(data);
        page4(data);
        page5(data);
        main();
      });
    }, function (msg) {
      alert(msg)
    });
  });

})(window);