// packageMyself/pages/ads/ads.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  tanbao() {
    wx.navigateTo({
      url: '/pages/video-swiper/video-swiper',
    })
  },
  huixue() {
    app.index_tag = 1;
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  haodian() {
    app.index_tag = 2;
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  faxian() {
    app.index_tag = 0;
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  spike() {
    wx.navigateTo({
      url: '/pages/limitBuy/limitBuy',
    })
  },
  applystore() {
    wx.navigateTo({
      url: '/packageStore/pages/storeIntroduce/storeIntroduce?tag=0',
    })
  },
  applycloud() {
    wx.navigateTo({
      url: '../myself/cloudStore/cloudStore',
    })
  },
  applyprize() {
    wx.navigateTo({
      url: '../apply/applyPrize/applyPrize',
    })
  },
  haoym() {
    wx.navigateTo({
      url: '../apply/haoym/haoym',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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