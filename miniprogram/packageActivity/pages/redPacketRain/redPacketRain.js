const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUseButton: "/packageActivity/images/use_button.png",
    imgTitle: "/packageActivity/images/title_bg.png",
    emdEmeraldCount: 0,
    redCount: 0,
    redDownTime: undefined,
    redEnvelopes: 0,
    redPacketEmd: 0,
    redPacketPrice: 0,
    redPacketStartTime: 0,
    isGetData: false,
    isGetResult: false,
    msg: "",
    isLogin: false,
    current: 0,
    hide: false,

  },
  jumpTo: common.jumpTo,
  getPreData: function () {
    this.msgCount = 0;
    let that = this;
    httphelper.api("activity/redPacketMessage", null, function (server_data) {
      that.setData(server_data.data);
      that.setData({
        isLogin: true
      })
      app.showRedPacket = 0;
      that.checkCountDown();
      that.messageLoad();
    })
  },
  checkCountDown: function () {
    if (this.data.redDownTime === 0) {
      this.showPacket();
    }
  },
  messageLoad: function () {
    let that = this;
    let str = "";
    let count = this.msgCount;
    let messages = this.data.messages;
    while (count < messages.length * 2) {
      let idx = parseInt(count / 2);
      let single = count % 2;
      if (single == 1) {
        str += " 恭喜用户" + messages[idx].nickName + "获得翡翠币" + parseInt(messages[idx].emdEmeraldCount) + "个                                           ";
      } else {
        str += " 恭喜用户" + messages[idx].nickName + "获得红包" + parseFloat(messages[idx].redEnvelopes).toFixed(2) + "元                                        ";
      }
      count++;
    }

    that.setData({
      msg: str
    })
  },
  showPacket: function () {
    let that = this;
    httphelper.api("activity/redPacketRain", null, function (server_data) {
      if (server_data.code == 200) {

        let redPacket = that.selectComponent("#redPacket");
        if (redPacket != null) {
          console.log(redPacket.isPlaying());
          if (!redPacket.isPlaying()) {
            let current = new Date().getTime();
            redPacket.showModal(server_data.data.redPacketEme, server_data.data.redPacket, current);
            that.setData({
              current: current
            })
          }
        }
      }
    })
  },
  sendResult(data) {
    if (data.detail.current != this.data.current) {
      return;
    }
    let that = this;
    let post = {};
    post.redPacket = data.detail.redPacket;
    post.redPacketEme = data.detail.redPacketEme;
    httphelper.api("activity/receiveRedPacket", post, function (server_data) {
      let redPacket = that.selectComponent("#redPacket");
      if (redPacket != null) redPacket.showResult();
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},
  onLogin: function () {
    if (!app.isShowLogin) {
      let that = this;
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.getPreData(null);
      }
      return;
    }
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
    var value = wx.getStorageSync('phoneNum')
    if (value) {
      if (!this.data.hide) {
        this.getPreData();
      } else {
        this.setData({
          hide: false
        })
      }
    } else {
      this.onLogin();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("hide");
    this.setData({
      hide: true,
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("unload");
    this.setData({
      current: 0
    })
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
    var id = app.userId;
    let name = common.makeShareText(9);
    return {
      title: name,
      path: '/packageActivity/pages/redPacketRain/redPacketRain?scene=' + id
    }
  }
})