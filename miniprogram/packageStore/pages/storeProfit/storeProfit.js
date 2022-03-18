const httphelper = require('../../../httphelper.js');
const app = getApp();
let that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: 0,
    pageNum: 1,
    orders: [],
    beMore: true,
    status: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    this.setData({
      bar_Height: app.bar_Height * 2
    })
    if (options.status) {
      this.setData({
        status: options.status
      })
    }
    this.getData();
  },
  getData: function (e) {
    let data = {};
    data.pageNum = this.data.pageNum;
    if (this.data.status)
      data.status = this.data.status;
    // data.startTime = "";
    // data.endTime = "";
    httphelper.api('store/getOrderRevenueDetails', data, (serverData) => {
      if (serverData.data.length == 0) {
        that.setData({
          beMore: false,
          orders: []
        })
      } else {
        that.setData({
          orders: serverData.data
        })
      }
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.beMore) {
      let data = {};
      data.pageNum = ++this.data.pageNum;
      if (this.data.status)
        data.status = this.data.status;
      // data.startTime = "";
      // data.endTime = "";
      httphelper.api('store/getOrderRevenueDetails', data, (serverData) => {
        if (serverData.data.length == 0) {
          that.setData({
            beMore: false,
          })
        } else {
          that.setData({
            orders: that.data.orders.concat(serverData.data)
          })
        }
      });
    }
  },
})