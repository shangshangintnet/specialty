const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
const app = getApp();
let that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: 0,
    order: {},
    user: {},
    content: null,
    useBalance: 0,
    showAddress: false,
    addressIdx: 0,
    addressdata: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.highOrder.goods.imageUrls = app.highOrder.goods.images.split(',');
    that = this;
    that.setData({
      bar_Height: app.bar_Height,
      order: app.highOrder,
      user: app.user,
      maxUseBalance: app.highOrder.useBalance > app.highOrder.goods.price ? app.highOrder.goods.price : app.highOrder.useBalance
    })
  },
  onShow(e) {
    that.onGetAddress();
  },
  bindCoinBalance: function (e) {
    let value = e.detail.value
    if (value < 0) value = 0;
    return (value > this.data.maxUseBalance) ? this.data.maxUseBalance : value;
  },
  toUseBalance: function (e) {
    let value = parseFloat(e.detail.value);
    if (value < 0) {
      value = 0;
    }
    if (value > this.data.maxUseBalance) {
      value = this.data.maxUseBalance;
    }
    that.setData({
      useBalance: value
    })
  },
  bindcontent: function (e) {
    that.setData({
      content: e.detail.value
    })
  },
  toPay(e) {
    let post = {};
    post.id = that.data.order.goods.id;
    post.addressId = that.data.order.address.id;
    post.type = 0;
    post.useBalance = that.data.useBalance;
    if (that.data.content)
      post.content = that.data.content;
    httphelper.api("high/createOrder", post, function (data) {
      if (data.code == 200) {
        if (data.data.price == 0) {
          setTimeout(() => {
            wx.hideLoading();
            wx.redirectTo({
              url: '../orderDetail/orderDetail?orderId=' + data.data.id,
            })
          }, 2000);
          return;
        }
        //支付订单
        var paydata = {};
        paydata.orderId = data.data.id;
        paydata.openId = wx.getStorageSync('openid');
        httphelper.api("high/wxSmallPay", paydata, function (serverdata) {
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
                setTimeout(() => {
                  wx.hideLoading();
                  wx.redirectTo({
                    url: '../orderDetail/orderDetail?orderId=' + paydata.orderId,
                  })
                }, 2000);
              },
            })
          } else {
            wx.showToast({
              title: serverdata.msg,
            })
            setTimeout(() => {
              wx.hideToast({
                complete: (res) => {},
              })
              wx.redirectTo({
                url: '../orderDetail/orderDetail?orderId=' + paydata.orderId,
              })
            }, 2000);
          }
        })
      }
    })
  },

  /**
   * 选择地址
   */
  selectAddress: function () {
    if (this.data.addressdata.length == 0) {
      wx.navigateTo({
        url: '/packageMyself/pages/myself/myaddress/createAddress/createAddress',
      })
    } else {
      this.setData({
        showAddress: true
      })
    }
  },
  closeAddress: function () {
    this.setData({
      showAddress: false
    })
  },
  onConfirm: function (e) {
    if (Number(e.detail.index)) {
      this.setData({
        addressIdx: e.detail.index,
        showAddress: false,
        ["order.address"]: that.data.addressdata[e.detail.index]
      })
    } else {
      this.setData({
        addressIdx: 0,
        showAddress: false,
        ["order.address"]: that.data.addressdata[0]
      })
    }
  },
  onGetAddress: function () {
    let that = this;
    httphelper.api("myInformation/addressManagement", null, function (server_data) {
      that.setData({
        addressdata: server_data.data.addresses
      })
    })
  },
  jumpTo: common.jumpTo,
})