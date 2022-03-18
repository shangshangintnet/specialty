// miniprogram/packageActivity/pages/receivePacket/receivePacket.js
const httphelper = require('../../httphelper.js');
const common = require('../../common.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btn_get: "./images/btn_getcard.png",
    show: false,
    status: 0
  },
  getData: function () {
    let that = this;
    httphelper.api("myInformation/findGiftCardMessageById", {
      id: this.data.id
    }, function (server_data) {
      that.setData(server_data.data);
    })
  },
  jumpToCard(e){
    wx.navigateTo({
      url: '/packageMyself/pages/myself/mywallet/card/myCard',
    })
  },
  getCard: function () {
    let that = this;
    var value = wx.getStorageSync('phoneNum')
    if (value) {
      httphelper.api("myInformation/getGiftCard", {
        id: that.data.id
      }, function (server_data) {
        that.setData({
          show: true,
          status: server_data.code == 200 ? 0 : 1
        })
      })
    } else {
      this.onLogin();
    }
  },
  onLogin: function () {
    if (!app.isShowLogin) {
      let that = this;
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      return;
    }
  },
  showModal: function () {
    this.setData({
      show: true
    })
  },
  hideModal: function () {
    this.setData({
      show: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData(options)
    this.getData();
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