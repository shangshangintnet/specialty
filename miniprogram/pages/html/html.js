const httphelper = require('../../httphelper.js')
const common = require('../../common.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ssoToken: "",
    html: "",
    refresh: false,
    needRefresh: false,
    show: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    let that = this;
    let html = "";
    let page = "";
    if (options.scene) {
      //从服务端发布API识别图片进入应用
      var scene = decodeURIComponent(options.scene)
      //console.log(scene);
      var s = scene.split('@');
      //console.log(options);
      //本次扫码进入的抽奖id
      let arr = s[1];
      page = s[1];
      if (arr == "myCards") {
        console.log(s);
        wx.setStorage({
          data: s[0],
          key: 'inviter',
        })
        wx.navigateTo({
          url: '/packageMyself/pages/myself/mywallet/card/myCard?tagSelect=1',
        })
        return;
      } else if (arr == 'storeDetail') {
        html = arr + "?id=" + s[2] + "&";
      } else {
        arr = options.html.split('|');
        html = arr[0] + '?';
        page = arr[0];
        if (arr.length >= 2) {
          for (let i = 1; i < arr.length; i++) {
            let tmp = arr[i].split('%');
            html += tmp[0] + '=' + tmp[1] + '&';
          }
        }
      }
    } else {
      let arr = options.html.split('|');
      html = arr[0] + '?';
      if (arr.length >= 2) {
        for (let i = 1; i < arr.length; i++) {
          let tmp = arr[i].split('%');
          html += tmp[0] + '=' + tmp[1] + '&';
        }
      }
    }
    that.setData({
      html: html,
      ssoToken: getApp().ssoToken,
      needRefresh: options.html == 'myCards'
    })
    if (page == "myCards" || page == "storeDetail") {
      if (!app.isShowLogin) {
        let login = this.selectComponent("#login");
        if (login != null) common.checkWechatLogin(login);
        app.saveCall = function () {
          that.setData({
            ssoToken: getApp().ssoToken
          })
          that.setData({
            show: true
          });
        }
      } else if (page == "live") {
        wx.switchTab({
          url: '/pages/index/index',
        })
        return;
      } else {
        that.setData({
          show: true
        })
      }
    } else {
      that.setData({
        show: true
      })
    }
    console.log(options.html);
    //隐藏分享
    wx.hideShareMenu();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //console.log("show");
    if (this.data.refresh) {
      console.log('pages/html/html?html=' + this.data.html)
      this.setData({
        show: true
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("hide");

    if (this.data.needRefresh) {
      this.setData({
        refresh: true,
        show: false,
      })
    }
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