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
    times: 0,
    user: {},
    order: {},
    orderId: null,
    logdata: null,
    logvisible: false,
    curLogistics: {},
    curLogNum: null,
    orderTitle: ["等待支付", "已支付等待发货", "已取消", "已完成", "已取消"],
    orderIcon: ["/images/order_wait.png", "/images/order_wait.png", "/images/order_cancel.png", "/images/order_finish.png", "/images/order_cancel.png"]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({
      bar_Height: app.bar_Height,
      user: app.user,
      orderId: options.orderId
    })
    that.getData();
    that.getSfdata();
  },
  onPageScroll: function (res) {
    let num = 0;
    num = (res.scrollTop / 40);
    if (num > 1) num = 1;
    this.selectComponent("#navbar").setOpacity(num);
  },
  onUnload: function () {
    if (this.data.timeCount)
      clearInterval(this.data.timeCount);
  },
  getData() {
    httphelper.api("high/findOrder", {
      id: that.data.orderId
    }, (serverData) => {
      if (serverData.code == 200) {
        if (serverData.data.addressDetails)
          serverData.data.address = serverData.data.addressDetails.split(',');
        if (serverData.data.images)
          serverData.data.imageUrl = serverData.data.images.split(',');
        that.setData({
          order: serverData.data,
          times: serverData.data.times,
        })
        if (that.data.order.status == 0) {
          that.timeStamp(serverData.data.times);
          that.data.timeCount = setInterval(function () {
            --that.data.times;
            if (that.data.times > 0) {
              that.timeStamp(that.data.times);
            } else {
              clearInterval(that.data.timeCount);
              that.getData()
            }
          }, 1000)
        }
      }
    });
  },
  getSfdata() {
    let that = this;
    var postdata = [];
    postdata.id = that.data.orderId;
    postdata.type = 6;
    httphelper.api("carve/querySF", postdata, function (serverdata) {
      that.setData({
        sfData: serverdata.data
      })
    })
  },
  timeStamp: function (second_time) {
    let times = parseInt(second_time);
    if (times > 60) {
      var second = times % 60;
      var min = parseInt(times / 60);
      this.setData({
        min: min < 10 ? '0' + min : min,
        second: second < 10 ? '0' + second : second
      });

    } else {
      this.setData({
        min: '00',
        second: times < 10 ? '0' + times : times
      });
    }
  },
  copyText: common.copyText,
  cancelOrder(e) {
    httphelper.api("high/cancellationOrder", {
      id: that.data.order.id
    }, (serverData) => {
      if (serverData.code == 200) {
        that.getData();
      }
    });
  },
  pay(e) {
    //支付订单
    var paydata = {};
    paydata.orderId = that.data.order.id;
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
    wx.navigateTo({
      url: '/pages/order/order_detail/express_detail/express_detail?type=6&id=' + that.data.order.id
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
    data.id = this.data.order.id;
    httphelper.api('high/bindLogisticsNumber', data, (serverData) => {
      if (serverData.code == 200) {
        let order = that.data.order;
        order.logisticsNum = data.logisticsNum;
        order.logisticsCode = data.logisticsCode;
        that.setData({
          logvisible: false,
          order: order
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
  gokefu(e) {
    httphelper.api("high/findHighBrokerById", {
      id: this.data.order.saleId
    }, (serverData) => {
      if (serverData.code == 200) {
        let msg = {};
        msg.name = that.data.order.goodsName;
        msg.image = that.data.order.imageUrl[0];
        msg.path = "/packageHighGood/pages/orderDetail/orderDetail?orderId=" + this.data.order.id;
        msg.appPath = "/pages/highGood/orderDetail/orderDetail?orderId=" + this.data.order.id;
        common.goKefu(serverData.data.chatId, serverData.data.storeName ? serverData.data.storeName : serverData.data.name, serverData.data.photoUrl, msg);
      }
    });
  },
})