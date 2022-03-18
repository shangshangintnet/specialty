// miniprogram/pages/myself/mywallet/welfareTicket/welfareTicket.js
const httphelper = require("../../../../../httphelper.js");
const common = require("../../../../../common.js");


Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    isVersion: 1,
    curBalance: null,
    showPop: false,
  },
  queryTicket: function() {
    let that = this;
    httphelper.api("order/queryShoppingQualification", null, (server_data) => {
      that.setData(server_data.data);
    })
  },
  closePopup: function() {
    this.setData({
      showPop: false,
      curBalance: null
    })
  },
  getDiscountPrice: function(e) {
    let value = parseFloat(e.detail.value).toFixed(2);

    if (value > this.data.useBalance) {
      value = this.data.useBalance;
    }

    if (value < 0) {
      value = 0;
    }

    this.setData({
      curBalance: value
    })
  },
  generateWelfare: function() {
    let that = this;
    httphelper.api("order/generatingWelfareOrders", null, (server_data) => {
      if (server_data.code == 200) {
        //无余额 直接支付
        if (server_data.data.balance == 0) {
          that.realGen();
        } else {
          //选择余额
          that.setData(server_data.data);
          that.setData({
            curBalance:server_data.data.useBalance
          })
          that.setData({
            showPop: true
          })
        }
      }
    })
  },
  realGen: function() {
    let post_data = {};
    console.log(this.data.curBalance)
    console.dir(post_data)
    post_data.useBalance = this.data.curBalance == null ? 0 : this.data.curBalance;
    httphelper.api("order/generatingWelfareOrders", post_data, (server_data) => {
      if (server_data.code == 200) {
        if (server_data.data.payStatus == 0) {
          common.onConfirmOrder(server_data.data.orderId, true);
        } else {
          wx.navigateTo({
            url: "/pages/common/successCall?msg=福利券购买完成~&label2=我的优惠券&label2_url=/packageMyself/pages/myself/mywallet/mywallet",
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //隐藏分享
    this.setData({
      isVersion: getApp().goodsShop
    })

    wx.hideShareMenu();
    this.queryTicket();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})