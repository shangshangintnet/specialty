// miniprogram/pages/loadApp/loadApp.js
const common = require("../../common.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //隐藏分享
    wx.hideShareMenu();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    
  },

  copyText:function(e){
    wx.setClipboardData({
      data: e.currentTarget.dataset.shareCode,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              icon:"none",
              title: '已复制到剪切板,打开浏览器黏贴下载链接即可下载App~',
              duration:5000
            })
          }
        })
      }
    })
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