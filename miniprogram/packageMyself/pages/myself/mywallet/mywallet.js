// miniprogram/pages/myself/mywallet/mywallet.js
const common = require('../../../../common.js');
const httphelper = require('../../../../httphelper.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    generalCouponList: [],
    userWallet: [],
    welfareCouponList: [],
    isVersion: 0,
    backUrl: "/pages/myself/myself",
    beUser: true,

  },
  onGetWallet: function () {
    let that = this;
    httphelper.api("myInformation/myWallet", null, (server_data) => {
      if (server_data.code == 200) {
        that.setData(server_data.data)
      }
    })
  },
  getCash: function () {
    if (this.data.userWallet.withdrawable >= 1) {
      wx.showModal({
        title: '恭喜您可以提现~',
        content: '下载App即可提现',
        confirmText: "立刻前往",
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/loadApp/loadApp'
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      wx.showModal({
        title: '抱歉您的提现金额不足~',
        content: '立即分享赚钱吧',
        confirmText: "立刻分享",
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../myshare/myposter/myposter',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.index == 1) {
      this.setData({
        backUrl: "/pages/index/index"
      })
    }

    if (options.backUrl != undefined) {
      this.setData({
        backUrl: options.backUrl
      })
    }
    //隐藏分享
    this.setData({
      isVersion: getApp().goodsShop,
      beUser: !app.user.storeId && !app.user.carvingId
    })
    wx.setNavigationBarColor({
      frontColor: getApp().goodsShop ? '#000000' : '#ffffff',
      backgroundColor: '#ff0000',
      animation: {
        duration: 400,
        timingFunc: 'easeIn'
      }
    })
    wx.hideShareMenu();
  },

  jumpTo: common.jumpTo,

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onGetWallet();
  },

  onPageScroll: function (res) {
    let num = 0;
    num = (res.scrollTop / 40);
    if (num > 1) num = 1;
    this.selectComponent("#navbar").setOpacity(num);
  },
})