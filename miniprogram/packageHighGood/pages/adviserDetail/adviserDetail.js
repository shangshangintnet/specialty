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
    adviser: {},
    tagLevel: [
      '创始人',
      '公司董事',
      '合伙人'
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    if (app.curAdviser) {
      if (app.curAdviser.tag)
        app.curAdviser.tags = app.curAdviser.tag.split(' ')
      else
        app.curAdviser.tags = [];
      this.setData({
        bar_Height: app.bar_Height,
        user: app.user,
        exclusive: app.exclusive,
        adviser: app.curAdviser,
      })
    } else {
      this.setData({
        bar_Height: app.bar_Height,
        user: app.user,
        exclusive: app.exclusive,
        options: options
      })
      this.getbroker();
    }
  },
  getbroker(e) {
    httphelper.api("high/findHighBrokerById", {
      id: this.options.id
    }, (serverData) => {
      if (serverData.code == 200) {
        if (serverData.data.tag)
          serverData.data.tags = serverData.data.tag.split(' ')
        else
          serverData.data.tags = [];
        that.setData({
          adviser: serverData.data
        })
      }
    });
  },
  editAdviser(e) {
    wx.navigateTo({
      url: '../uploadAdviser/uploadAdviser?edit=1',
    })
  },
  removeExAdviser(e) {
    httphelper.api("high/delExclusiveBroker", null, (serverData) => {
      if (serverData.code == 200) {
        app.curAdviser.type = 1;
        app.exclusive = false;
        that.setData({
          adviser: app.curAdviser,
          exclusive: app.exclusive
        })
        app.exclusive = false;
      }
    });
  },
  addExAdviser(e) {
    httphelper.api("high/addExclusiveBroker", {
      id: app.curAdviser.id
    }, (serverData) => {
      if (serverData.code == 200) {
        app.curAdviser.type = 2;
        app.exclusive = true;
        that.setData({
          adviser: app.curAdviser,
          exclusive: app.exclusive
        })
      }
    });
  },
  chat(e) {
    common.goKefu(that.data.adviser.chatId, that.data.adviser.storeName ? that.data.adviser.storeName : that.data.adviser.name, that.data.adviser.photoUrl);
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: common.stringFormat(common.getShareMsg(14, 3), that.data.adviser.name),
      path: '/packageHighGood/pages/adviserDetail/adviserDetail?userId=' + app.userId + "&id=" + this.data.adviser.userId,
      imageUrl: that.data.adviser.image,
    }
  },
  /**
   * 分享到朋友圈
   */
  onShareTimeline: function () {
    return {
      title: common.stringFormat(common.getShareMsg(14, 3), that.data.adviser.name),
      imageUrl: that.data.adviser.image,
      query: 'userId=' + app.userId + "&id=" + this.data.adviser.userId,
      path: '/packHighGood/'
    }
  }
})