const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
const app = getApp();
let that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    store: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    console.log(options)
    if (options.scene) {
      var scene = decodeURIComponent(options.scene)
      var s = scene.split('@');
      this.setData({
        tag: s[1]
      })
    } else {
      this.setData({
        tag: options.tag
      })
    }
  },

  goStore() {
    httphelper.api("store/findStoreDetail", null, function (storeData) {
      if (storeData.code == 200) {
        that.setData({
          store: storeData.data
        })
      } else {
        that.setData({
          store: {}
        })
      }
      if (that.data.store.applyStatus == 3 || that.data.store.applyStatus == 0) {
        wx.navigateTo({
          url: '../storeApply/storeApply',
        })
      } else {
        app.myself_tag = 1;
        wx.switchTab({
          url: '/pages/myself/myself',
        })
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    if (this.data.tag == 0) {
      return {
        title: common.getShareMsg(14, 0),
        path: '/packageStore/pages/storeIntroduce/storeIntroduce?tag=0&userId=' + app.userId,
        imageUrl: 'https://img.ssw88.com/static/home/personal.jpg',
      }
    } else {
      return {
        title: common.getShareMsg(14, 1),
        path: '/packageStore/pages/storeIntroduce/storeIntroduce?tag=1&userId=' + app.userId,
        imageUrl: 'https://img.ssw88.com/static/home/foreign.jpg',
      }
    }
  },
  /**
   * 分享到朋友圈
   */
  onShareTimeline: function () {
    let id = 'userId=' + app.userId;
    if (this.data.tag == 0) {
      return {
        title: common.getShareMsg(14, 0),
        imageUrl: 'https://img.ssw88.com/static/home/personal.jpg',
        query: id,
        path: '/packStore/'
      }
    } else {
      return {
        title: common.getShareMsg(14, 1),
        imageUrl: 'https://img.ssw88.com/static/home/foreign.jpg',
        query: id,
        path: '/packStore/'
      }
    }
  }
})