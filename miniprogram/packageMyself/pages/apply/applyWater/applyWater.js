const httphelper = require('../../../../httphelper.js')
const common = require('../../../../common.js')
let that;
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    state: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    this.getdata();
  },

  getdata: function () {
    if (app.ssoToken) {
      httphelper.api("myInformation/findInterest", {
        type: 0
      }, function (data) {
        if (data.code == 200) {
          that.setData({
            state: data.data
          })
        }
      });
    } else {
      that.setData({
        state: 0
      })
    }
  },
  /**
   * 立即联系
   */
  consulation: function () {
    if (this.data.state == 1)
      return;
    httphelper.api("myInformation/addInterest", {
      type: 0
    }, function (data) {
      if (data.code == 200) {
        wx.showToast({
          icon: "none",
          title: '信息已提交，请耐心等待客服人员联系~',
          duration: 3000
        });
        that.setData({
          state: 1
        })
      }
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: common.getShareMsg(14, 6),
      path: '/packageMyself/pages/apply/applyWater/applyWater?userId=' + app.userId,
    }
  },
  /**
   * 分享到朋友圈
   */
  onShareTimeline: function () {
    return {
      title: common.getShareMsg(14, 6),
      query: 'userId=' + app.userId,
      path: '/packageMyself/pages/apply/applyWater/applyWater'
    }
  }
})