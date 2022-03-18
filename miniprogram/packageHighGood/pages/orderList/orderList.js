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
    active: 2,
    orders: [],
    logdata: null,
    logvisible: false,
    curLogistics: {},
    curLogNum: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({
      bar_Height: app.bar_Height,
      user: app.user
    })
  },
  onShow(e) {
    that.getdata();
  },
  tagTo(e) {
    if (that.data.active == e.currentTarget.dataset.index) {
      return;
    }
    that.setData({
      active: e.currentTarget.dataset.index
    })
    that.getdata();
  },
  getdata() {
    let data = {};
    if (that.data.active != 2)
      data.type = that.data.active;
    httphelper.api("high/findOrder", data, (serverData) => {
      if (serverData.code == 200) {
        serverData.data.map((val) => {
          if (val.images) {
            val.imageUrl = val.images.split(',');
          }
        })
        that.setData({
          orders: serverData.data
        })
      }
    });
  },
  viewOrder(e) {
    wx.navigateTo({
      url: '../orderDetail/orderDetail?orderId=' + that.data.orders[e.currentTarget.dataset.index].id,
    })
  },
  cancelOrder(e) {
    let order = this.data.orders[e.currentTarget.dataset.index];
    httphelper.api("high/cancellationOrder", {
      id: order.id
    }, (serverData) => {
      if (serverData.code == 200) {
        that.getdata();
      }
    });
  },
  pay(e) {
    //支付订单
    let order = this.data.orders[e.currentTarget.dataset.index];
    var paydata = {};
    paydata.orderId = order.id;
    paydata.openId = wx.getStorageSync('openid');
    httphelper.api("high/wxSmallPay", paydata, function (serverdata) {
      if (serverdata.code == 200) {
        wx.showLoading({
          title: '加载中',
        });
        //向服务器下单成功，提示用户进行支付
        wx.requestPayment({
          timeStamp: serverdata.data.resultwx.timeStamp,
          nonceStr: serverdata.data.resultwx.nonce_str,
          package: 'prepay_id=' + serverdata.data.resultwx.prepay_id,
          signType: 'HMAC-SHA256',
          paySign: serverdata.data.resultwx.sign,
          complete(res) {
            setTimeout(() => {
              wx.hideLoading();
              wx.redirectTo({
                url: '../orderDetail/orderDetail?orderId=' + paydata.orderId,
              })
            }, 2000);
          },
        })
      } else {
        wx.showToast({
          title: serverdata.msg,
        })
        setTimeout(() => {
          wx.hideToast({
            complete: (res) => {},
          })
          wx.redirectTo({
            url: '../orderDetail/orderDetail?orderId=' + paydata.orderId,
          })
        }, 2000);
      }
    })
  },

  /* 物流信息 */
  viewLogistics: function (e) {
    let order = this.data.orders[e.currentTarget.dataset.index];
    wx.navigateTo({
      url: '/pages/order/order_detail/express_detail/express_detail?type=6&id=' + order.id
    })
  },
  bindLogistics: function (e) {
    that.setData({
      curOrder: this.data.orders[e.currentTarget.dataset.index]
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
    httphelper.api('high/bindLogisticsNumber', data, (serverData) => {
      if (serverData.code == 200) {
        let order = that.data.curOrder;
        order.logisticsNum = data.logisticsNum;
        order.logisticsCode = data.logisticsCode;
        let orders = that.data.orders;
        that.setData({
          logvisible: false,
          orders: orders
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
})