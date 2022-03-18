const common = require('../../../../common.js');
const httphelper = require('../../../../httphelper.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bg: "./images/redGet.png",
    bgOver: "./images/redFinish.png",
    bg_type: "./images/1.jpg",
    bg_type_over: "./images/2.jpg",
    ready: false,
    id: "",
    showInfo: false,
    type: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    console.log(options);
    if (options.scene) {
      var scene = decodeURIComponent(options.scene)
      var s = scene.split('@');
      this.setData({
        id: s[1]
      })
    }
    if (!app.isShowLogin) {
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.onGetData();
      }
    } else {
      that.onGetData();
    }
  },
  jumpTo: common.jumpTo,
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  toggleInfo: function () {
    this.setData({
      showInfo: !this.data.showInfo
    })
  },

  onGetData: function () {
    let that = this;
    httphelper.api("red/receiveRedPacket", {
      id: this.data.id
    }, function (server_data) {
      for (var i = 0; i < server_data.data.messages.length; i++) {
        if (server_data.data.messages[i].userId == server_data.data.userId) {
          server_data.data.messages.unshift(server_data.data.messages.splice(i, 1)[0]);
        }
      }
      that.setData(server_data.data);
      if (server_data.data.type == 1) {
        that.setData({
          bg: that.data.bg_type,
          bgOver: that.data.bg_type_over
        })
      }

      if (server_data.data.status == 3 || server_data.data.message == undefined) {
        that.setData({
          bg: that.data.bgOver
        })
      }



      that.setData({
        ready: true
      })
    })
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