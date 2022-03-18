// miniprogram/packageMyself/pages/myself/mywallet/myBalance/myBalance.js
const common = require('../../../../../common.js');
const httphelper = require('../../../../../httphelper.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    storeRed: "./images/storeRed.png",
    storeSpike: "./images/storeSpike.png",
    storeDiamond: "./images/storeDiamond.png",
    storeGuess: "./images/storeGuess.png",
    spike: {},
    showResult: false,
    showInfo: false,
    result: null,
    appDrawId: null,
    balance: 0,
    emd: 0,
    goods: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onGetWallet();
    this.getResult();
    wx.hideShareMenu({
      success: (res) => {},
    })
  },
  onGetWallet: function () {
    let that = this;

    httphelper.api("classification/commodityExchange", null, function (serverdata) {
      let emdCount = serverdata.data.emdEmeraldCount > serverdata.data.useEmdEmeraldCount ? serverdata.data.useEmdEmeraldCount :
        serverdata.data.emdEmeraldCount;
      that.setData({
        classification: serverdata.data.classification,
        balance: serverdata.data.balance,
        emd: emdCount / 10
      })
      let price = that.data.balance + that.data.emd;
      let goods = serverdata.data.goodList.splice(0, 2);
      goods.map((val) => {
        let price_2 = (val.price - price).toFixed(2)
        val.price_2 = price_2 > 0 ? price_2 : 0;
        val.rate = parseInt(240 * (1 - val.price_2 / val.price));
      })
      that.setData({
        goods: goods
      })
    })
    httphelper.api("classification/homePage", {
      version: getApp().introduce,
      ssoToken: getApp().ssoToken
    }, function (data) {
      that.setData({
        spike: data.data.spike != undefined ? data.data.spike : {},
      })
    })
  },
  getResult: function () {
    let that = this;
    httphelper.api("myInformation/findWinningDetail", null, (server_data) => {
      that.setData({
        result: server_data.data,
        appDrawId: getApp().appDrawId
      })
    })
  },
  toggleResult: function () {
    this.setData({
      showResult: !this.data.showResult
    })
  },
  toggleInfo: function () {
    this.setData({
      showInfo: !this.data.showInfo
    })
  },
  jumpToGoods: function (e) {
    wx.navigateTo({
      url: '/pages/goods/goods_detail?goodsId=' + e.currentTarget.dataset.id
    });
  },
  jumpTo: common.jumpTo,
  onPageScroll: function (res) {
    let num = 0;
    num = (res.scrollTop / 40);
    if (num > 1) num = 1;
    this.selectComponent("#navbar").setOpacity(num);
  },
})