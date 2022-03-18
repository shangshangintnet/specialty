//http.js 网络请求
const app = getApp()
const common = require('common.js')

function apiRequest(url, data, callback, beLoading = true) {
  if (data == null) {
    data = {};
  }

  if (data.ssoToken == undefined) {
    data.ssoToken = app.ssoToken;
  }
  if (beLoading) {
    wx.showLoading({
      mask: true
    });
  }
  setTimeout(function () {
    wx.hideLoading()
  }, 3000);
  console.log('requestUrl' + app.url + url);
  wx.request({
    url: app.url + url,
    data: data,
    method: "POST",
    header: {
      'content-type': 'application/x-www-form-urlencoded' // 默认值
    },
    success(res) {
      wx.hideLoading();
      if (res.data.code == '100' || res.data.code == '101') {
        var value = wx.getStorageSync('phoneNum');
        if (value) {
          //登录不合法重新登录
          getApp().ssoToken = '';
          common.onLogin(value);
        } else {
          //未授权，接口不得调用，提示授权
          wx.showModal({
            title: '登录或注册上商',
            content: '当前操作需要登录以后才能使用',
            confirmText: "前往登录",
            success: function (res) {
              if (res.confirm) {
                wx.reLaunch({
                  url: '/pages/myself/myself',
                })
              } else if (res.cancel) {
                return;
              }
            },
          })
        }
        callback(res.data);
      } else {
        if (callback != undefined) {
          if (res.data.code == 200) {
            callback(res.data);
          } else {
            callback(res.data);
            if (url != 'myInformation/useEntityGiftCard' && url != 'classification/queryCommodityDetails') {
              if (res.data.msg != null) {
                wx.showToast({
                  icon: 'none',
                  title: res.data.msg,
                  duration: 3000
                });
              }
            }
          }
        }
      }
    },
    fail(res) {
      wx.hideLoading();
      console.log("request fail " + res.data);
    },
    complete(res) {
    }
  })
}

module.exports.api = apiRequest;