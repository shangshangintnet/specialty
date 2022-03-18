// packageMyself/pages/myself/cloudStore/cloudStore.js
const httphelper = require('../../../../httphelper.js')
const common = require('../../../../common.js')
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    state: 0,
    showPop: false,
    showAddress: false,
    addressIdx: 0,
    onlyPrice: 9.9,
    orderCount: 1,
    beFirstIn: true,
    imageUrls: [],
    images: [],
    bImages: [],
    video: null,
    verticalImages: [],
    verticalVideo: null,
    upImgType: 0,
  },
  jumpTo: common.jumpTo,

  /**
   * 购买福袋
   */
  buyGoods() {
    if (!app.isShowLogin) {
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      if (app.ssoToken == "") {
        return;
      }
    }
    this.onGetAddress();
    this.setData({
      showPop: true
    })
  },

  closePopup: function () {
    this.setData({
      showPop: false
    })
  },

  /**
   * 选择地址
   */
  selectAddress: function () {
    if (this.data.getAddress.length == 0) {
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
        showAddress: false
      })
    } else {
      this.setData({
        addressIdx: 0,
        showAddress: false
      })
    }
  },

  /**
   * 订单数量
   */
  orderNum: function (e) {
    this.setData({
      orderCount: e.detail.value
    })
  },

  /**
   * 创建订单
   */
  createOrder: function () {
    if (this.data.getAddress == null) {
      wx.showToast({
        icon: 'none',
        title: '请选择收货地址',
        duration: 3000
      });
      return;
    }
    let that = this;
    var post = {};
    post.addressId = this.data.getAddress[this.data.addressIdx].id;
    post.count = this.data.orderCount;
    httphelper.api("blindBag/createOrder", post, function (data) {
      if (data.code = 200) {
        //支付订单
        var paydata = {};
        paydata.orderId = data.data.id;
        paydata.openId = wx.getStorageSync('openid');
        httphelper.api("blindBag/wxSmallPay", paydata, function (serverdata) {
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
                }, 2000);
              },
            })
          } else {
            wx.showToast({
              title: serverdata.msg,
            })
            setTimeout(() => {
              wx.hideToast({
                complete: (res) => { },
              })
            }, 2000);
          }
        })
      }
    })
  },

  getData: function () {
    let that = this;
    httphelper.api("blindBag/findBlindBagDetail", null, function (serverdata) {
      if (serverdata.code == 200) {
        that.setData({
          images: serverdata.data.images,
          bImages: serverdata.data.bImages,
          onlyPrice: serverdata.data.price
        });
        that.selectComponent('#guess_what').setGoodsValue(serverdata.data.similars);
      }
    });
  },
  onGetAddress: function () {
    let that = this;
    httphelper.api("myInformation/addressManagement", null, function (server_data) {
      that.setData({
        getAddress: server_data.data.addresses
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().isShare = 0;
    let that = this;
    that.getData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.beFirstIn) {
      this.setData({
        beFirstIn: false
      })
    } else {
      this.onGetAddress();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: common.makeShareText(15),
      path: '/packageMyself/pages/myself/blindBag/blindBag?&scene=' + getApp().userId,
    }
  },
  /**
   * 分享到朋友圈
   */
  onShareTimeline: function () {
    return {
      title: common.makeShareText(15),
      query: 'userId=' + app.userId,
      path: '/packageMyself/pages/myself/blindBag/blindBag'
    }
  }
})