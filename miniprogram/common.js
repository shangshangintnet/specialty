const httphelper = require('httphelper.js');
const app = getApp();
import IMService from './static/lib/imservice.js';
import GoEasyIM from './static/lib/goeasy-im-1.5.0.js';

//非目录跳转
function jumpTo(event) {
  wx.navigateTo({
    url: getUrl(event),
  })
}

function getUrl(event) {
  let url = event.currentTarget.dataset.url + "?";
  for (let prop in event.currentTarget.dataset) {
    if (prop != 'url') url += "&" + prop + "=" + event.currentTarget.dataset[prop];
  }
  return url;
}

//去首页
function goIndex() {
  wx.switchTab({
    url: '/pages/index/index'
  })
}

//TOGGLE 跳转
function toWhere(event) {
  let url = event.currentTarget.dataset.url;
  let isTab = event.currentTarget.dataset.isTab;
  if (isTab) {
    navigateTo(event);
  } else {
    jumpTo(event);
  }
}

//tab 跳转
function navigateTo(event) {
  wx.switchTab({
    url: event.currentTarget.dataset.url,
  })
}

//返回时间
function goBack() { // 返回事件
  wx.navigateBack({
    delta: 1,
  })
}

//跳转商品
function onMoveToGoods(event) {
  console.log(event);
  var goodsId = event.currentTarget.dataset.goodsId;
  var firstTypeId = event.currentTarget.dataset.firstTypeId;
  if (firstTypeId == undefined)
    firstTypeId = 0;
  var type = event.currentTarget.dataset.goodsType;
  if (type == undefined) {
    type = 0;
  }
  if (type == 8 || type == 9) {
    wx.navigateTo({
      url: '/packageStore/pages/storeGoodsDetail/storeGoodsDetail?goodsId=' + goodsId,
    })
  } else {
    wx.navigateTo({
      url: '/pages/goods/goods_detail?goodsId=' + goodsId + '&firstTypeId=' + firstTypeId,
    })
  }
}

//跳转分类目录
function onMoveToCommodityInformation(event) {
  var title = event.currentTarget.dataset.title;
  var typeKindId = event.currentTarget.dataset.id;
  wx.navigateTo({
    url: '/pages/category_search/category_search?title=' + title + '&typeKindId=' + typeKindId,
  })
}

//基于高级筛选的跳转分类目录
function onMoveToCommodityInformationFirstTypeId(event) {
  var title = event.currentTarget.dataset.title;
  var firstTypeId = event.currentTarget.dataset.id;
  wx.navigateTo({
    url: '/pages/category_search/category_search?title=' + title + '&firstTypeId=' + firstTypeId,
  })

}

//良玉随缘的查询
function onQueryGoodJade(currentPage, callback) {
  let nextPage = currentPage++;
  let data = {};
  data.pageNum = nextPage;
  httphelper.api("classification/queryGoodJade", data, function (serverData) {
    if (callback != null) callback(serverData);
  })
}

//复制到剪切板
function copyText(e) {
  wx.setClipboardData({
    data: e.currentTarget.dataset.shareCode,
    success: function (res) {
      wx.getClipboardData({
        success: function (res) {
          wx.showToast({
            title: '复制成功'
          })
        }
      })
    }
  })
}

//打电话
function makePhoneCall(e) {
  wx.makePhoneCall({
    phoneNumber: e.currentTarget.dataset.phone,
  })
}

//收藏开关
function toggleFavour(collection, goodsId, callback) {
  let data = {};
  let api_url = (collection == 0) ? "classification/commodityCollection" : "classification/cancelCollection";
  if (collection == 0) {
    data.goodsId = goodsId;
  } else if (collection == 1 && typeof (goodsId) == "number") {
    // console.dir("inNumber");
    let arr = [];
    arr.push(goodsId.toString());
    data.goodsIds = JSON.stringify(arr);
  } else {
    data.goodsIds = JSON.stringify(goodsId);
  }
  httphelper.api(api_url, data, function (data) {
    wx.showToast({
      title: data.msg,
      icon: collection == 0 ? "success" : "none"
    });
    if (callback != null) callback(data);
  })
}

//加入购物车
function addCart(goodsId, callback) {
  let data = {};
  data.id = goodsId;
  let api_url = "cart/addCart";

  httphelper.api(api_url, data, function (data) {
    wx.showToast({
      image: "/images/toastCart.png",
      title: data.msg
    });
    if (callback != null) callback(data);
  })
}

//立刻购买
function onQuickBuy(post_data, callback) {
  let data = {
    goodsId: post_data.id.toString(),
    productQty: post_data.productQty.toString(),
    storeName: post_data.storeName,
    storeId: post_data.storeId.toString(),
  }
  let arr = [];
  arr.push(data);
  let postData = {};
  postData.goodsJson = JSON.stringify(arr);
  httphelper.api("order/toOrderSetting", postData, function (data) {
    if (callback != null) {
      callback(data);
    }
  })
}

//向服务器提交订单
//type false 正常 true 福利券 0 余额 1 礼品卡
function onConfirmOrder(orderId, type) {
  let that = this;
  var postdata = [];
  postdata.orderId = orderId;
  postdata.openId = wx.getStorageSync('openid');
  httphelper.api("pay/wxSmallPay", postdata, function (serverdata) {
    console.dir(postdata);
    wx.showLoading({
      title: '加载中',
    });
    //向服务器下单成功，提示用户进行支付
    wx.requestPayment({
      timeStamp: serverdata.data.resultwx.timeStamp,
      nonceStr: serverdata.data.resultwx.nonce_str,
      package: 'prepay_id=' + serverdata.data.resultwx.prepay_id,
      signType: 'HMAC-SHA256',
      paySign: serverdata.data.resultwx.sign,
      success(res) {
        wx.hideLoading();
        switch (type) {
          //礼品卡
          case true:
            wx.navigateTo({
              url: "/pages/common/successCall?msg=福利券购买完成~&label2=我的优惠券&label2_url=/packageMyself/pages/myself/mywallet/mywallet",
            })
            break;
          //正常订单
          case false:
            wx.navigateTo({
              url: "/pages/common/successCall",
            })
            break;
          //余额
          case 0:
            wx.navigateTo({
              url: "/pages/common/successCall?msg=成功充值余额~&label2=我的钱包&label2_url=/packageMyself/pages/myself/mywallet/mywallet",
            })
            break;
          //礼品卡
          case 1:
            wx.navigateTo({
              url: "/pages/common/successCall?msg=购物卡购买完成~&label2=我的卡包&label2_url=/packageMyself/pages/myself/mywallet/mywallet",
            })
            break;
          default:
        }
      },
      fail(res) {
        wx.hideLoading();
        if (type === false) {
          wx.reLaunch({
            url: "/pages/order/orderlist",
          })
          return;
        }
        if (type === 1) {
          that.goBack();
          return;
        }

      }
    })
  });
}

//取消订单
function onCancelOrder(event, callback) {
  let that = this;
  let orderId = event.currentTarget.dataset.id;
  var postdata = [];
  postdata.orderId = orderId;
  postdata.cancleDescribe = '手动取消';
  httphelper.api("order/updateOrder", postdata, function (serverdata) {
    if (callback != null) callback();
  });
}

//完成订单
function onFinishOrder(event, callback) {
  let that = this;
  let orderId = event.currentTarget.dataset.id;
  var postdata = [];
  postdata.orderId = orderId;
  httphelper.api("order/orderFulfillment", postdata, function (serverdata) {
    if (callback != null) callback();
  });
}

//删除订单
function onDeleteOrder(event, callback) {
  let that = this;
  let orderId = event.currentTarget.dataset.id;
  var postdata = [];
  postdata.orderId = orderId;
  httphelper.api("order/deleteOrder", postdata, function (serverdata) {
    //刷新订单状态
    if (callback != null) callback();
  });
}

function uploadFile(tempFilePath, callback, push = "feedback", name = "") {
  let data = {};
  data.ssoToken = getApp().ssoToken;
  data.push = push + "/";
  if (name != "")
    data.name = name;
  wx.uploadFile({
    url: getApp().url + "myInformation/submitFile",
    filePath: tempFilePath,
    name: 'feedbackImageFile',
    formData: data,
    success(res) {
      if (callback != null) callback(JSON.parse(res.data));
    },
    complete(res) {
      let data = JSON.parse(res.data);
    }
  })
}

//检测微信登录
function checkWechatLogin(loginView) {
  wx.checkSession({
    success() {
      //session_key 未过期，并且在本生命周期一直有效
      //验证是否有登录的手机号
      var value = wx.getStorageSync('phoneNum');
      console.log(value)
      if (value) {
        //登陆自己的服务器
        onLogin(value);
      } else {
        wx.login({
          success(res) {
            if (res.code) {
              wx.cloud.callFunction({
                name: 'login',
                data: {
                  code: res.code,
                },
                success: res => {
                  console.log('[云函数] [login] user openid: ', res.result)
                  var obj = JSON.parse(res.result)
                  wx.setStorageSync('openid', obj.openid);
                  wx.setStorageSync('session_key', obj.session_key);
                  if (loginView != null) {
                    loginView.showLoginModal();
                  }
                },
                fail: err => {
                  console.error('[云函数] [login] 调用失败', err)
                }
              })
            } else {
              console.error('登录失败！' + res.errMsg)
            }
          }
        })
      }
    },
    fail() {
      wx.login({
        success(res) {
          if (res.code) {
            wx.cloud.callFunction({
              name: 'login',
              data: {
                code: res.code,
              },
              success: res => {
                console.log('[云函数] [login] user openid: ', res.result)
                var obj = JSON.parse(res.result)
                wx.setStorageSync('openid', obj.openid);
                wx.setStorageSync('session_key', obj.session_key);
                //验证是否有登录的手机号
                var value = wx.getStorageSync('phoneNum');
                if (value) {
                  //登陆自己的服务器
                  onLogin(value);
                } else {
                  //showLoginView
                  if (loginView != null) {
                    loginView.showLoginModal();
                  }
                }
              },
              fail: err => {
                console.error('[云函数] [login] 调用失败', err)
              }
            })
          } else {
            console.error('登录失败！' + res.errMsg)
          }
        }
      })
    }
  });
}

//登录自己的服务器(微信手机登陆)
function onLogin(phoneNumber) {
  console.log('登录手机号' + phoneNumber);
  if (phoneNumber) {
    //解密从群进入小程序的opengid
    if (getApp().shareTicket) {
      var postdata = [];
      postdata.session_key = wx.getStorageSync('session_key');
      postdata.iv = getApp().iv;
      postdata.encryptedData = getApp().encryptedData;
      httphelper.api("sign/decodeUserInfo", postdata, function (serverdata) {
        var postdata = [];
        postdata.phoneNumber = phoneNumber;
        postdata.userId = wx.getStorageSync('inviter');
        if (serverdata.code == 200) {
          postdata.openGid = serverdata.data.openGId;
        }
        httphelper.api("sign/wechatLogin", postdata, function (serverdata) {
          getApp().ssoToken = serverdata.data.ssoToken;
          getApp().userId = serverdata.data.userId;
          getApp().receiveStatus = serverdata.data.receiveStatus; //注意发放奖励
          getApp().isShowLogin = true;
          getApp().resolveCall();
          wx.setStorageSync('ssoToken', serverdata.data.ssoToken);
          wx.setStorageSync('userId', serverdata.data.userId);
          connectIM();
        });
      });
    } else {
      var postdata = [];
      postdata.phoneNumber = phoneNumber; //'13712345678'//'17612345678'   15501148778   15930194847
      postdata.userId = wx.getStorageSync('inviter');
      postdata.openGid = wx.getStorageSync('openGid');
      wx.login({
        success(res) {
          if (res.code) {
            postdata.code = res.code;
            httphelper.api("sign/wechatLogin", postdata, function (serverdata) {
              getApp().ssoToken = serverdata.data.ssoToken;
              getApp().userId = serverdata.data.userId;
              getApp().receiveStatus = serverdata.data.receiveStatus; //注意发放奖励
              getApp().isShowLogin = true;
              getApp().resolveCall();
              wx.setStorageSync('ssoToken', serverdata.data.ssoToken);
              wx.setStorageSync('userId', serverdata.data.userId);
              connectIM();
            });
          } else {
            httphelper.api("sign/wechatLogin", postdata, function (serverdata) {
              getApp().ssoToken = serverdata.data.ssoToken;
              getApp().userId = serverdata.data.userId;
              getApp().receiveStatus = serverdata.data.receiveStatus; //注意发放奖励
              getApp().isShowLogin = true;
              getApp().resolveCall();
              wx.setStorageSync('ssoToken', serverdata.data.ssoToken);
              wx.setStorageSync('userId', serverdata.data.userId);
              connectIM();
            });
          }
        },
        fail(res) {
          httphelper.api("sign/wechatLogin", postdata, function (serverdata) {
            getApp().ssoToken = serverdata.data.ssoToken;
            getApp().userId = serverdata.data.userId;
            getApp().receiveStatus = serverdata.data.receiveStatus; //注意发放奖励
            getApp().isShowLogin = true;
            getApp().resolveCall();
            wx.setStorageSync('ssoToken', serverdata.data.ssoToken);
            wx.setStorageSync('userId', serverdata.data.userId);
            connectIM();
          });
        }
      })
    }
  } else {
    //用户不想授权
    getApp().ssoToken = '';
  }
}

//短信验证码登陆
function toSmsCodeLogin(phoneNumber, code) {
  let data = {};
  data.phoneNumber = phoneNumber;
  data.code = code;
  data.userId = wx.getStorageSync("inviter");
  data.openGid = wx.getStorageSync('openGid');
  httphelper.api("sign/codeWXLogin", data, (serverdata) => {
    getApp().ssoToken = serverdata.data.ssoToken;
    getApp().userId = serverdata.data.userId;
    getApp().receiveStatus = serverdata.data.receiveStatus; //注意发放奖励
    getApp().isShowLogin = true;
    getApp().resolveCall();
    wx.setStorageSync('phoneNum', data.phoneNumber);
    wx.setStorageSync('ssoToken', serverdata.data.ssoToken);
    wx.setStorageSync('userId', serverdata.data.userId);
    wx.showToast({
      title: '登陆成功',
    })
    let success_show = setInterval(function () {
      clearInterval(success_show);
      goBack();
    }, 1500)
  })
}

function timeStamp(second_time) {
  var data = {};
  data.hour = "00";
  data.min = "00";
  data.second = "00";
  var time = parseInt(second_time) + "秒";
  data.second = parseInt(second_time) % 60;
  if (parseInt(second_time) > 60) {
    var second = parseInt(second_time) % 60;
    var min = parseInt(second_time / 60);
    time = min + "分" + second + "秒";
    if (min > 60) {
      min = parseInt(second_time / 60) % 60;
      var hour = parseInt(parseInt(second_time / 60) / 60);
      time = hour + "小时" + min + "分" + second + "秒";
      data.hour = formatNumber(hour);
    }
    data.second = formatNumber(second);
    data.min = formatNumber(min);
  } else {
    data.second = formatNumber(data.second);
  }
  return data;
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getShareTxt(type) {
  let arr = getApp().appShare;
  if (arr == undefined) {
    console.log("no share msg");
    return '';
  }
  if (arr[type] == undefined) {
    return "";
  } else {
    if (arr[type].length > 0) {
      if (arr[type] == 1) {
        return arr[type][0];
      } else {
        let length = arr[type].length;
        let random = Math.floor(Math.random() * (length));
        return arr[type][random];
      }
    } else {
      return "";
    }
  }
}

function getShareMsg(type, idx) {
  return getApp().appShare[type][idx];
}

function makeShareText() {
  var s = arguments;
  if (s.length == 0) {
    return '';
  }
  if (s.length == 1) {
    return getShareTxt(s[0]);
  }
  if (s.length == 2) {
    return stringFormat(getShareTxt(s[0]), s[1]);
  }
  if (s.length == 3) {
    return stringFormat(getShareTxt(s[0]), s[1], s[2]);
  }
}

function stringFormat() {
  var s = arguments[0];
  for (var i = 0; i < arguments.length - 1; i++) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    s = s.replace(reg, arguments[i + 1]);
  }
  return s;
}


/**
 * 分享图片
 */
function shareImg(type, filepath, callback) {
  switch (type) {
    case 1:
      //微信好友
      uni.share({
        provider: "weixin",
        scene: "WXSceneSession",
        type: 2,
        imageUrl: filepath,
        success: function (res) {
          callback('分享成功～', true);
        },
        fail: function (err) {
          callback('分享失败～', false);
          console.log("fail:" + JSON.stringify(err));
        }
      });
      break;
    case 2:
      //朋友圈
      uni.share({
        provider: "weixin",
        scene: "WXSenceTimeline",
        type: 2,
        imageUrl: filepath,
        success: function (res) {
          callback('分享成功～', true);
        },
        fail: function (err) {
          callback('分享失败～', false);
          console.log("fail:" + JSON.stringify(err));
        }
      });
      break;
    case 3:
      //qq
      uni.share({
        provider: "qq",
        type: 2,
        imageUrl: filepath,
        success: function (res) {
          callback('分享成功～', true);
        },
        fail: function (err) {
          callback('分享失败～', false);
          console.log("fail:" + JSON.stringify(err));
        }
      });
      break;
    case 4:
      //微博
      uni.share({
        provider: "sinaweibo",
        type: 2,
        imageUrl: filepath,
        success: function (res) {
          callback('分享成功～', true);
        },
        fail: function (err) {
          callback('分享失败～', false);
          console.log("fail:" + JSON.stringify(err));
        }
      });
      break;
    case 5:
      //保存视频
      wx.saveVideoToPhotosAlbum({
        filePath: filepath,
        success: function () {
          callback('视频保存成功～', true);
        },
        fail: function (e) {
          //TODO
          callback('视频保存失败～', false);
          sysApiFail('视频保存失败，检测是否开启相册读写权限');
          console.log(e);
        },
        complete: function () { }
      });
      break;
    case 6:
      //保存图片
      wx.saveImageToPhotosAlbum({
        filePath: filepath,
        success: function () {
          callback('图片保存成功～', true);
        },
        fail: function (e) {
          //TODO
          callback('图片保存失败～', false);
          sysApiFail('图片保存失败，检测是否开启相册读写权限');
        },
        complete: function () { }
      });
      break;
  }
}

/* 显示信息后返回 */
function goBackAfterMsg(msg, delta = 1) {
  wx.showToast({
    icon: "none",
    title: msg,
    duration: 1000,
    mask: true
  });
  setTimeout(function () {
    wx.navigateBack({
      delta: delta
    });
  }, 1000);
}

/* 校验数字与字母与汉字 */
function isNumorrInfo(str) {
  var reg = /^[A-Za-z0-9\u4e00-\u9fa5\,\.\!\?\[\]\-\~\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u201c|\u201d|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]+$/;
  return reg.test(str);
}

/* 客服聊天 */
function goKefu(id, name, avatar, msg = null) {
  if (getApp().globalData.userInfo.id == id) {
    wx.showToast({
      icon: "none",
      title: '您无需联系自己',
    })
    return;
  }
  let friend = {};
  friend.uuid = id;
  friend.name = name;
  friend.avatar = avatar;
  getApp().globalData.friend = friend;
  //路由到会话页面
  if (msg == null) {
    wx.navigateTo({
      url: '/packageIm/pages/privateChat/privateChat'
    });
  } else {
    app.globalData.ImMsg = msg;
    wx.navigateTo({
      url: '/packageIm/pages/privateChat/privateChat?msg=1'
    });
  }
}

/* 群聊 */
function goChatRoom(group) {
  getApp().globalData.group = group;
  //路由到会话页面
  wx.navigateTo({
    url: '/packageIm/pages/groupChat/groupChat'
  });
}

/* 链接IM */
function connectIM() {
  if (wx.getStorageSync('phoneNum')) {
    httphelper.api("myInformation/myInformation", null, function (serverdata) {
      if (serverdata.code == 200) {
        app.user = serverdata.data.user;
        app.user.highType = serverdata.data.highType;
        if (serverdata.data.storeId != null) {
          //雕刻师身份 1 学员 2雕刻师
          app.user.carvingId = serverdata.data.storeId;
          app.user.carvingLevel = serverdata.data.level;
        }
        if (serverdata.data.uuid != null) {
          app.user.storeId = serverdata.data.uuid;
          app.user.storeAbility = serverdata.data.ability;
        }
        app.user.carveType = serverdata.data.carveType;
        if (app.globalData.userInfo == null) {
          if (serverdata.data.uuid != null) {
            serverdata.data.user.ImId = "store" + serverdata.data.uuid;
            serverdata.data.user.nickName = serverdata.data.name;
            serverdata.data.user.photoUrl = serverdata.data.avatar;
          } else if (serverdata.data.highId) {
            serverdata.data.user.ImId = "high" + serverdata.data.highId;
          } else {
            serverdata.data.user.ImId = serverdata.data.user.id;
          }
          app.globalData.userInfo = serverdata.data.user;
          app.globalData.otp = serverdata.data.otp;
          initIM();
        }
      }
    });
  }
}
//初始化 及时通讯
function initIM() {
  if (!wx.im) {
    wx.im = GoEasyIM.getInstance({
      host: 'hangzhou.goeasy.io',
      appkey: 'PC-0ebf713ab8cd486ea1f68cd7f4219a8f',
      otp: app.globalData.otp
    });
    wx.GoEasyIM = GoEasyIM;
  }
  if (wx.im.getStatus() === 'disconnected') {
    app.globalData.imService = new IMService(wx.im);
    app.globalData.imService.connectIM(app.globalData.userInfo);
  }
}

function carvePay(orderId, callback) {
  //支付订单
  var paydata = {};
  paydata.orderId = orderId;
  paydata.openId = wx.getStorageSync('openid');
  httphelper.api("carve/wxSmallPay", paydata, function (serverdata) {
    if (serverdata.code == 200) {
      wx.showLoading({
        title: '加载中',
      });
      //向服务器下单成功，提示用户进行支付
      wx.requestPayment({
        timeStamp: serverdata.data.resultwx.timeStamp,
        nonceStr: serverdata.data.resultwx.nonce_str,
        package: 'prepay_id=' + serverdata.data.resultwx.prepay_id,
        signType: 'HMAC-SHA256',
        paySign: serverdata.data.resultwx.sign,
        complete(res) {
          callback(true);
          wx.hideLoading({
            success: (res) => { },
          })
        },
      })
    } else {
      wx.showToast({
        title: serverdata.msg,
      })
      callback(false);
    }
  })
}

function sharePay(id, callback) {
  //支付订单
  var paydata = {};
  paydata.id = id;
  paydata.openId = wx.getStorageSync('openid');
  httphelper.api("share/wxSmallPay", paydata, function (serverdata) {
    if (serverdata.code == 200) {
      wx.showLoading({
        title: '加载中',
      });
      //向服务器下单成功，提示用户进行支付
      wx.requestPayment({
        timeStamp: serverdata.data.resultwx.timeStamp,
        nonceStr: serverdata.data.resultwx.nonce_str,
        package: 'prepay_id=' + serverdata.data.resultwx.prepay_id,
        signType: 'HMAC-SHA256',
        paySign: serverdata.data.resultwx.sign,
        complete(res) {
          callback(true);
          wx.hideLoading({
            success: (res) => { },
          })
        },
      })
    } else {
      wx.showToast({
        title: serverdata.msg,
      })
      callback(false);
    }
  })
}

//查询高货经纪人
function findHighBrokerById(brokerId, callback) {
  httphelper.api("high/findHighBrokerById", {
    id: brokerId
  }, function (serverdata) {
    callback(serverdata);
  });
}

function findUserImInfo(post, callback) {
  httphelper.api("newsReport/customerServiceAll", post, function (serverdata) {
    if (serverdata.data.store == null)
      serverdata.data.store = [];
    if (serverdata.data.user == null)
      serverdata.data.user = [];
    if (serverdata.data.high == null)
      serverdata.data.high = [];
    let friends = wx.getStorageSync('IM_Friends');
    if (friends == null || friends == "") {
      friends = {};
    }
    for (var i = 0; i < serverdata.data.store.length; i++) {
      serverdata.data.store[i].uuid = "store" + serverdata.data.store[i].uuid;
      friends[serverdata.data.store[i].uuid] = {};
      friends[serverdata.data.store[i].uuid].uuid = serverdata.data.store[i].uuid;
      friends[serverdata.data.store[i].uuid].name = serverdata.data.store[i].name;
      friends[serverdata.data.store[i].uuid].avatar = serverdata.data.store[i].avatar;
    }
    for (var i = 0; i < serverdata.data.user.length; i++) {
      friends[serverdata.data.user[i].uuid] = {};
      friends[serverdata.data.user[i].uuid].uuid = serverdata.data.user[i].uuid;
      friends[serverdata.data.user[i].uuid].name = serverdata.data.user[i].name;
      friends[serverdata.data.user[i].uuid].avatar = serverdata.data.user[i].avatar;
    }
    for (var i = 0; i < serverdata.data.high.length; i++) {
      serverdata.data.high[i].uuid = "high" + serverdata.data.high[i].uuid;
      friends[serverdata.data.high[i].uuid] = {};
      friends[serverdata.data.high[i].uuid].uuid = serverdata.data.high[i].uuid;
      friends[serverdata.data.high[i].uuid].name = serverdata.data.high[i].name;
      friends[serverdata.data.high[i].uuid].avatar = serverdata.data.high[i].avatar;
    }
    wx.setStorage({
      data: friends,
      key: 'IM_Friends',
    })
    callback(friends);
  })
}

module.exports.goBackAfterMsg = goBackAfterMsg; //显示信息后返回上个页面
module.exports.stringFormat = stringFormat;
module.exports.makeShareText = makeShareText; //分享标题
module.exports.getShareMsg = getShareMsg; //分享标题
module.exports.timeStamp = timeStamp; //返回时间戳
module.exports.jumpTo = jumpTo; //跳转
module.exports.goIndex = goIndex; //首页跳转
module.exports.goBack = goBack; //返回跳转
module.exports.toWhere = toWhere; //综合判断跳转
module.exports.navigateTo = navigateTo; //TAB跳转
module.exports.onMoveToGoods = onMoveToGoods; //商品页跳转
module.exports.onMoveToCommodityInformation = onMoveToCommodityInformation; //分类目录跳转
module.exports.onMoveToCommodityInformationFirstTypeId = onMoveToCommodityInformationFirstTypeId; //基于高级筛选的分类跳转
module.exports.onQueryGoodJade = onQueryGoodJade; //良玉随缘查询
module.exports.copyText = copyText; //复制到剪切板
module.exports.toggleFavour = toggleFavour; //收藏开关
module.exports.addCart = addCart; //添加购物车
module.exports.onQuickBuy = onQuickBuy; //立刻购买
module.exports.onConfirmOrder = onConfirmOrder; //提交支付订单
module.exports.onCancelOrder = onCancelOrder; //取消订单
module.exports.onFinishOrder = onFinishOrder; //完成订单
module.exports.onDeleteOrder = onDeleteOrder; //删除订单
module.exports.makePhoneCall = makePhoneCall; //打电话
module.exports.uploadFile = uploadFile; //文件上传
module.exports.checkWechatLogin = checkWechatLogin; //检查微信手机登陆
module.exports.onLogin = onLogin; //登录自己的服务器(使用微信手机号登陆)
module.exports.toSmsCodeLogin = toSmsCodeLogin; //手机号验证码登陆
module.exports.shareImg = shareImg; //分享
module.exports.isNumorrInfo = isNumorrInfo; //正则校验 数字 字母 汉字
module.exports.goKefu = goKefu; //客服通讯
module.exports.goChatRoom = goChatRoom; //聊天室
module.exports.initIM = initIM; //链接IM
module.exports.connectIM = connectIM; //链接IM
module.exports.carvePay = carvePay; //雕刻付款
module.exports.sharePay = sharePay; //共享充电付款
module.exports.findHighBrokerById = findHighBrokerById; //查询高货经纪人
module.exports.findUserImInfo = findUserImInfo; //查询用户Im信息