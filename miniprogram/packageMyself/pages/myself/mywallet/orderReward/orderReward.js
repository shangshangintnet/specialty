const common = require('../../../../../common.js');
const httphelper = require('../../../../../httphelper.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tagSelect: '0',
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    chooseRank: []
  },
  onGetData: function () {
    let that = this;
    httphelper.api("myInformation/getOrderAward", null, function (server_data) {
      if (server_data.code == 200) {
        that.setData(server_data.data);
        that.toggleRank();
      }
    })
  },
  toggle: function (event) {
    var tagSelect = event.currentTarget.dataset.toggleIndex;
    this.setData({
      tagSelect: tagSelect
    });
    this.toggleRank();
  },
  toggleRank() {
    var rankData = [];
    var myRank = [];
    switch (this.data.tagSelect) {
      case "0":
        rankData = this.data.connectionsFriendList;
        break;
      case "1":
        rankData = this.data.directFriendList;
        break;
      case "2":
        rankData = this.data.indirectFriendList;
        break;
    }
    this.setData({
      chooseRank: rankData,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onGetData();
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