// miniprogram/pages/common/successCall.js
const common = require('../../common.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    msg: "您的宝贝正在打包，请耐心等候呦～",
    title: "支付成功",
    label1: "返回首页",
    lable1IsTap: 1,
    label1_url: "/pages/index/index",
    label2: "查看订单",
    label2_url: "/pages/order/orderlist",
    lable2IsTap: 0,

  },
  toWhere: common.toWhere,
  toLaunch: function() {
    if (this.data.label2 == '我的卡包') {
      wx.navigateBack({
        delta: 2
      })
      return;
    }
    wx.reLaunch({
      url: this.data.label2_url,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData(options);
    if (this.data.label2 == '我的卡包') {
      this.setData({
        label2_url: this.data.label2
      })
    }
    //隐藏分享
    wx.hideShareMenu();
    this.selectComponent('#guess_what').onQueryFirst("classification/queryGoodJade", null, "goodJadeList");
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
    this.selectComponent('#guess_what').onQueryNext("classification/queryGoodJade", null, "goodJadeList");
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})