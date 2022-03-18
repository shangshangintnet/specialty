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
    active: 0,
    pageNum: 1,
    orders: [],
    beMore: true,
    logdata: null,
    logvisible: false,
    curLogistics: {},
    curLogNum: null
    //售后 customerStatus  0：申请中   1：已完成   2:申请通过  3:商家已收货4：拒绝申请
    //订单 afterSalesStatus  0:可申请售后 1:已申请售后 2:已过售后时间 3:申请中 4:完成售后并删除  5：售后被拒
    //status  订单状态  1.已支付 2.已完成   6.手动完成 7.订单商品全部售后处理
    //logisticsNum
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    this.setData({
      bar_Height: app.bar_Height * 2,
      active: options.tag
    })
    this.getData();
  },
  getData: function (e) {
    let data = {};
    data.pageNum = this.data.pageNum;
    data.orderStatus = this.data.active;
    httphelper.api('store/getStoreOrder', data, (serverData) => {
      if (serverData.data == null) {
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
  tagTo: function (e) {
    this.setData({
      active: e.currentTarget.dataset.index,
      pageNum: 1,
      beMore: true,
    })
    this.getData();
  },
  onReachBottom: function (e) {
    if (this.data.beMore) {
      let data = {};
      data.pageNum = ++this.data.pageNum;
      data.orderStatus = this.data.active;
      httphelper.api('store/getStoreOrder', data, (serverData) => {
        if (serverData.data == null) {
          that.setData({
            beMore: false
          })
        } else {
          that.setData({
            orders: that.data.orders.concat(serverData.data)
          })
        }
      });
    }
  },
  refuse: function (e) {
    let order = this.data.orders[parseInt(e.currentTarget.dataset.index)];
    let data = {};
    data.id = order.id;
    data.status = 4;
    httphelper.api('store/updateAfterStatus', data, (serverData) => {
      order.customerStatus = 4;
      let temp = that.data.orders;
      that.setData({
        orders: temp
      })
    });
  },
  agree: function (e) {
    let order = this.data.orders[parseInt(e.currentTarget.dataset.index)];
    let data = {};
    data.id = order.id;
    data.status = 2;
    httphelper.api('store/updateAfterStatus', data, (serverData) => {
      order.customerStatus = 2;
      let temp = that.data.orders;
      that.setData({
        orders: temp
      })
    });
  },
  receive: function (e) {
    let order = this.data.orders[parseInt(e.currentTarget.dataset.index)];
    let data = {};
    data.id = order.id;
    data.status = 3;
    httphelper.api('store/updateAfterStatus', data, (serverData) => {
      order.customerStatus = 3;
      let temp = that.data.orders;
      that.setData({
        orders: temp
      })
    });
  },
  viewLogistics: function (e) {
    let order = this.data.orders[parseInt(e.currentTarget.dataset.index)];
    wx.navigateTo({
      url: '/pages/order/order_detail/express_detail/express_detail?orderId=' + order.id
    })
  },
  bindLogistics: function (e) {
    this.setData({
      curOrder: this.data.orders[parseInt(e.currentTarget.dataset.index)]
    })
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
    data.id = this.data.curOrder.id;
    httphelper.api('store/bindingLogistics', data, (serverData) => {
      if (serverData.code == 200) {
        that.setData({
          logvisible: false
        })
      }
    });
  },
  changeLogistics: function (e) {
    console.log(e);
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
  viewOrder: function (e) {
    let order = this.data.orders[parseInt(e.currentTarget.dataset.index)];
    if (this.data.active != 4 && (order.afterSalesStatus == 0 || order.afterSalesStatus == 2)) {
      wx.navigateTo({
        url: '../storeOrderDetail/storeOrderDetail?id=' + order.id,
      })
    } else {
      wx.navigateTo({
        url: '/packageMyself/pages/myself/saleAfter/saleAfterDetail/saleAfterDetail?customerId=' + order.customerId
      })
    }
  }
})