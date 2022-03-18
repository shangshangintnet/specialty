const httphelper = require('../../../../httphelper.js');
const common = require('../../../../common.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    sfData: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if (options.type) {
      let postdata = {};
      postdata.id = options.id;
      postdata.type = options.type;
      httphelper.api("carve/querySF", postdata, function (serverdata) {
        that.setData({
          sfData: serverdata.data
        })
      })
    } else {
      let postdata = {};
      postdata.orderId = options.orderId;
      httphelper.api("newsReport/querySF", postdata, function (serverdata) {
        that.setData({
          sfData: serverdata.data
        })
      })
    }
    //隐藏分享
    wx.hideShareMenu();
  },

})