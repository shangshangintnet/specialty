const httphelper = require('../../../../httphelper.js');
const common = require('../../../../common.js');
const app = getApp();
let that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: 0,
    users: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.getdata();
  },
  onReachBottom: function () {
  },
  //下拉刷新
  onPullDownRefresh: function () {
    that.getdata();
    wx.stopPullDownRefresh();
  },
  getdata() {
    httphelper.api("storeFamous/findStoreFamousUserList", {
    }, (serverData) => {
      if (serverData.code == 200) {
        that.setData({
          users:serverData.data,
        })
      }
    });
  },
  openUser(e) {
    wx.navigateTo({
      url: '/packageStoreFamous/pages/storeFamousAdmin/storeFamousAdmin?id='+e.currentTarget.dataset.id,
    })
  },
})