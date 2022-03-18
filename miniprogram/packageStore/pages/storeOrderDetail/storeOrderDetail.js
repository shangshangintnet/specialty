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
    orderId: null,
    order: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    this.setData({
      bar_Height: app.bar_Height * 2,
      orderId: options.id
    })
    this.getData();
  },

  getData: function (e) {
    let data = {};
    data.id = this.data.orderId;
    httphelper.api('store/findStoreOrderDetail', data, (serverData) => {
      that.setData({
        order: serverData.data
      })
    });
  },
  viewLogistics: function (e) {
    wx.navigateTo({
      url: '/pages/order/order_detail/express_detail/express_detail?orderId=' + this.data.orderId,
    })
  },
  bindLogistics: function (e) {
    if (this.data.logdata == null) {
      httphelper.api('store/getExpressCode', null, (serverData) => {
        if (serverData.code == 200) {
          that.setData({
            logdata: serverData.data,
            logvisible: true
          })
        }
      });
    } else {
      that.setData({
        logvisible: true
      })
    }
  },
  bindLogdata: function (e) {
    if (this.data.curLogNum == null || this.data.curLogistics.code == null) {
      wx.showToast({
        icon: 'none',
        title: '请填写完整信息',
      })
      return;
    }
    let data = {};
    data.logisticsNum = this.data.curLogNum;
    data.logisticsCode = this.data.curLogistics.code;
    data.id = this.data.orderId;
    httphelper.api('store/bindingLogistics', data, (serverData) => {
      if (serverData.code == 200) {
        that.setData({
          logvisible: false
        })
      }
    });
  },
  changeLogistics: function (e) {
    this.setData({
      curLogistics: this.data.logdata[e.detail.value]
    })
  },
  changeNum(e) {
    this.setData({
      curLogNum: e.detail.value
    })
  },
  closeLog: function (e) {
    that.setData({
      logvisible: false
    })
  },
  jumpTo(e) {
    common.jumpTo(e);
  }
})