// miniprogram/pages/order/order_confirm/order_confirm.js
var common = require("../../../common.js");
var httphelper = require("../../../httphelper.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    goods: [],
    showAddress: false,
    getAddress: [],
    orderStore: '',
    orderContent: '',
    couponId: '',
    addressIdx: 0,
    storeIdx: 0,
    choosenStoreName: "",
    inputNumber: "",
    couponList: [],
    couponOpen: false,
    jadeiteCoinDiscount: 0,
    userBalance: 0,
    maxUseBalance: 0,
    identify: 0,
    chooseIdentify: true,
    couponContent: "选择优惠券",
  },
  jumpTo: common.jumpTo,
  toWhere: common.toWhere,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    //快速购买
    if (options.id == undefined) {
      that.setData(app.orderJsonData);
      that.onGetCoupons();
      that.setData({
        maxUseBalance: that.data.personalPrice < that.data.balance ? that.data.personalPrice : that.data.balance
      })
    } else {
      common.onQuickBuy(options, function (data) {
        if (data.code == 400) {
          app.errMsg = data.msg;
          common.goBack();
          return;
        }
        that.setData(data.data);
        that.onGetCoupons();
        that.setData({
          maxUseBalance: that.data.personalPrice < that.data.balance ? that.data.personalPrice : that.data.balance
        })
      })
    }
    //隐藏分享
    wx.hideShareMenu();
  },
  onGetAddress: function () {
    let that = this;
    httphelper.api("myInformation/addressManagement", null, function (server_data) {
      that.setData({
        getAddress: server_data.data.addresses
      })
    })
  },
  bindStoreChange: function (e) {
    let that = this;
    this.setData({
      storeIdx: e.detail.value,
      choosenStoreName: that.data.storesName[e.detail.value].name,
      orderStore: that.data.storesName[e.detail.value].id
    })
  },
  bindAddressChange: function (e) {
    this.setData({
      addressIdx: e.detail.value
    })
  },

  toPay: function () {
    let post_data = {};
    if (this.data.getAddress[this.data.addressIdx] == undefined) {
      wx.showToast({
        icon: 'none',
        title: '地址为空～请选择您的地址',
      })
      return;
    }

    post_data.couponId = this.data.couponId;
    post_data.goodsJson = this.data.goodsJson;
    post_data.addressId = this.data.getAddress[this.data.addressIdx].id;
    post_data.orderStore = this.data.orderStore;
    post_data.orderContent = this.data.orderContent;
    post_data.jadeiteCoinDiscount = this.data.jadeiteCoinDiscount;
    post_data.useBalance = this.data.userBalance;
    post_data.identify = this.data.identify == 1 ? (this.data.chooseIdentify ? 1 : 0) : 0;

    // console.dir(post_data);
    if (post_data.couponId == 0) {
      post_data.couponId = "";
    }

    // console.dir(post_data);

    httphelper.api("order/toPay", post_data, function (data) {
      if (data.code == 200) {

        if (data.data.payStatus == 1) {
          wx.navigateTo({
            url: "/pages/common/successCall",
          })
        } else {
          common.onConfirmOrder(data.data.orderId, false);
        }
      }
    })
  },

  onGetCoupons: function () {
    if (this.data.type == 2 || this.data.type == 4)
      return;
    let that = this;
    let data = {};
    data.total = this.data.totalParticipationPrice;
    data.goodsClass = this.data.type;
    httphelper.api("order/findUserCoupon", data, function (data) {
      that.setData({
        couponList: data.data.couponList
      })
    })
  },
  toggleCoupons: function () {
    let that = this;
    this.setData({
      couponOpen: !this.data.couponOpen
    })
  },
  chooseCoupons: function (event) {
    let data = {};
    let that = this;
    data.goodsJson = this.data.goodsJson;
    data.couponId = event.currentTarget.dataset.id;
    data.emdEmeraldCount = 0;
    httphelper.api("order/calculateTheOrderAmount", data, function (server_data) {
      console.log(server_data.code);
      if (server_data.code == 200) {
        that.setData(server_data.data);
        that.setData({
          couponOpen: false,
          jadeiteCoinDiscount: 0,
          couponId: data.couponId,
          inputNumber: ""
        })
        if (data.couponId == 0) {
          that.setData({
            couponContent: "请选择优惠券"
          })
        }
        that.setData({
          maxUseBalance: that.data.personalPrice < that.data.balance ? that.data.personalPrice : that.data.balance
        })
      } else {
        that.setData({
          couponOpen: false,
        })
      }
    })
  },
  bindCoinCheck: function (e) {
    let value = e.detail.value
    if (value < 0) value = 0;
    return (value > this.data.emdEmeraldCount) ? this.data.emdEmeraldCount : value;
  },
  getDiscountPrice: function (e) {
    let value = parseInt(e.detail.value);
    let data = {};
    let that = this;
    data.goodsJson = this.data.goodsJson;
    data.couponId = 0;
    data.emdEmeraldCount = isNaN(value) ? 0 : value;
    this.setData({
      inputNumber: data.emdEmeraldCount
    })
    httphelper.api("order/calculateTheOrderAmount", data, function (server_data) {
      that.setData(server_data.data);
      that.setData({
        jadeiteCoinDiscount: value,
        couponContent: "已使用翡翠币优惠",
        couponId: 0,
        maxUseBalance: that.data.personalPrice < that.data.balance ? that.data.personalPrice : that.data.balance,
      })
      if (that.data.userBalance > that.data.maxUseBalance) {
        that.setData({
          userBalance: that.data.maxUseBalance
        })
      }
    })
  },
  bindCoinBalance: function (e) {
    let value = e.detail.value
    if (value < 0) value = 0;
    return (value > this.data.maxUseBalance) ? this.data.maxUseBalance : value;
  },
  toUseBalance: function (e) {
    let value = e.detail.value.replace(/[^\d\.]|^\./g, '').replace(/\.{2}/g, '.').replace(/^([1-9]\d*|0)(\.\d{1,2})(\.|\d{1})?$/, '$1$2').replace(/^0\d{1}/g, '0');
    if (!value || value < 0) {
      value = 0;
    }
    if (value > this.data.maxUseBalance) {
      value = this.data.maxUseBalance;
    }
    this.setData({
      userBalance: value
    })
  },
  bindComment: function (e) {
    let value = e.detail.value
    this.setData({
      orderContent: value
    })
  },
  openAddress: function () {
    this.setData({
      showAddress: true
    })
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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onGetAddress();

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})