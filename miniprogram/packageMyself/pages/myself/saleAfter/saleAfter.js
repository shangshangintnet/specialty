// miniprogram/pages/myself/saleAfter/saleAfter.js
const httphelper = require('../../../../httphelper.js')
var common = require("../../../../common.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    tag_index: 0,
    orders: []
  },
  tagTo: function(event) {
    var tag_index = event.currentTarget.dataset.tagIndex;
    this.setData({
      tag_index: tag_index
    })
    //刷新界面的时候注意根据页面选择不同的函数
    if (tag_index == 0) {
      this.onFindService();
    } else {
      this.onFindServiceStatus(tag_index - 1);
    }
  },
  jumpTo: common.jumpTo,
  goBack: common.goBack,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //this.onFindeService();
    //隐藏分享
    wx.hideShareMenu();
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
    //刷新界面的时候注意根据页面选择不同的函数
    if (this.data.tag_index == 0) {
      this.onFindService();
    } else {
      this.onFindServiceStatus(this.data.tag_index - 1);
    }
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

  },

  //查询我的服务单
  onFindService: function() {
    let that = this;
    httphelper.api("myInformation/afterService", null, function(serverdata) {
      that.setData({
        orders: serverdata.data.orderList
      })
    });
  },

  //根据状态查询服务单
  onFindServiceStatus: function(status) {
    let that = this;
    var postdata = [];
    postdata.afterStatus = status;
    httphelper.api("myInformation/queryByStatusAfterService", postdata, function(serverdata) {
      that.setData({
        orders: serverdata.data.shopOrderDetailList
      })
    });
  },


})