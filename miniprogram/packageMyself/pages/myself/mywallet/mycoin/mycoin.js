// miniprogram/pages/myself/mywallet/mycoin/mycoin.js
const common = require('../../../../../common.js');
const httphelper = require('../../../../../httphelper.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    toggleIndex: 0,
    user: null
  },
  toggle: function (event) {
    var toggleIndex = event.currentTarget.dataset.toggleIndex;
    this.setData({
      toggleIndex: toggleIndex
    })
  },
  onGetData: function () {
    let that = this;
    httphelper.api("myInformation/getEMDEmerald", null, function (server_data) {
      if (server_data.code == 200) {
        that.setData(server_data.data);
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      toggleIndex: options.toggleIndex || 0,
      user: app.user
    })
    this.onGetData();
    //隐藏分享
    wx.hideShareMenu();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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