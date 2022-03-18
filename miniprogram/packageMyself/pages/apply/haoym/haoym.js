// packageMyself/pages/apply/haoym/haoym.js
const common = require('../../../../common.js')
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: common.getShareMsg(14, 5),
      path: '/packageMyself/pages/apply/haoym/haoym?userId=' + app.userId,
    }
  },
  /**
   * 分享到朋友圈
   */
  onShareTimeline: function () {
    return {
      title: common.getShareMsg(14, 5),
      query: 'userId=' + app.userId,
      path: '/packMyself/pages/apply/haoym/haoym'
    }
  }
})