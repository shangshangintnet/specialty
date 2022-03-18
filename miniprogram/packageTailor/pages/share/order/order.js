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
    orders: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({
      bar_Height: app.bar_Height,
    })
    that.getdata();
  },
  onReachBottom: function () {
    
  },
  //下拉刷新
  onPullDownRefresh: function () {
    
  },
  getdata() {
    httphelper.api("share/findOrders", {
    }, (serverData) => {
      if (serverData.code == 200) {
        that.setData({
          orders: serverData.data,
        })
      }
    });
  },
})