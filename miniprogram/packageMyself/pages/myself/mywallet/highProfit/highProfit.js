// miniprogram/pages/myself/mywallet/worldrank/worldrank.js
const common = require('../../../../../common.js');
const httphelper = require('../../../../../httphelper.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: 0,
    highData: []
  },
  onGetData: function () {
    let that = this;
    httphelper.api("high/findUserProfit", null, function (server_data) {
      if (server_data.code == 200) {
        if (server_data.code == 200) {
          server_data.data.map((val) => {
            val.image = val.images.split(',')[0]
          })
          that.setData({
            highData: server_data.data
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      bar_Height: app.bar_Height
    })
    this.onGetData();
    //隐藏分享
    wx.hideShareMenu();
  },

})