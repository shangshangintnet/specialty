const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
const app = getApp();
let that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: 0,
    stone: {},
    imageUrls: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    app.curStone.staffName = app.staffMap[app.curStone.staffId].name;
    this.setData({
      stone: app.curStone,
      bar_Height: app.bar_Height,
      imageUrls: app.curStone.images ? app.curStone.images.split(',') : [],
      photo: app.staffMap[app.curStone.staffId].photoUrl,
      content: app.staffMap[app.curStone.staffId].content
    })
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