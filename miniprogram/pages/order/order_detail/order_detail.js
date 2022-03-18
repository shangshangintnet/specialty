const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    order: [],
    sfData: {},
    options: {},
    mess:"商品会先发往上商进行鉴真服务确认无误后发往您的手中",
    orderTitle: ["等待支付", "已支付等待发货", "已完成", "已取消", "卖家已发货", "正在退款", "已完成", "售后完成"],
    orderDesc: ["", "等待卖家发货", "交易成功", "交易已取消", "等待确认收货", "处理中", "交易成功", "售后已处理"],
    expressTitle: ["", "顺丰快递", "顺丰快递", "", "顺丰快递", "顺丰快递", "顺丰快递", "顺丰快递"],
    orderIcon: ["/images/order_wait.png", "/images/order_wait.png", "/images/order_finish.png", "/images/order_cancel.png", "/images/order_wait.png", "/images/order_finish.png", "/images/order_finish.png"]
  },

  copyText: common.copyText,
  makePhoneCall: common.makePhoneCall,
  jumpTo: common.jumpTo,
  onConfirmOrder: function (event) {
    common.onConfirmOrder(event.currentTarget.dataset.id, true);
  },
  gokefu() {
    let post = {};
    post.storeIds = "12";
    common.findUserImInfo(post, (res) => {
      common.goKefu('store12', "平台客服", res["store12"].avatar);
    })
  },
  onFinishOrder: function (event) {
    let that = this;
    wx.showModal({
      title: '确认收货',
      content: '请确认货物已收到',
      success(res) {
        if (res.confirm) {
          common.onFinishOrder(event, () => {
            wx.showToast({
              title: '已确认收货',
              success: function () {
                setTimeout(() => {
                  common.goBack();
                }, 1500);
              }
            })
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  refresh_time: function () {
    var that = this;
    var now = this.data.order.downTime;
    let str = "order.downTime";
    that.setData({
      [str]: now
    })
    if (this.data.order.downTime == 0) {
      that.setData({
        timeOut: 1
      })
      return;
    }
    this.timeStamp(now);
    this.data.timeCount = setInterval(function () {
      --now;
      if (now > 0) {
        that.setData({
          [str]: now
        })
        that.timeStamp(now);
      } else {
        if (that.data.timeOut == 0) {
          that.setData({
            timeOut: 1
          });
        }
        clearInterval(that.data.timeCount);
        common.goBack();
      }
    }, 1000)
  },
  timeStamp: function (second_time) {
    var data = {};
    let that = this;
    data.day = "00";
    data.hour = "00";
    data.min = "00";
    data.second = "00";
    var time = parseInt(second_time) + "秒";
    if (parseInt(second_time) > 60) {
      var second = parseInt(second_time) % 60;
      var min = parseInt(second_time / 60);
      time = min + "分" + second + "秒";
      if (min > 60) {
        min = parseInt(second_time / 60) % 60;
        var hour = parseInt(parseInt(second_time / 60) / 60);
        time = hour + "小时" + min + "分" + second + "秒";
        if (hour > 24) {
          hour = parseInt(parseInt(second_time / 60) / 60) % 24;
          var day = parseInt(parseInt(parseInt(second_time / 60) / 60) / 24);
          time = day + "天" + hour + "小时" + min + "分" + second + "秒";
          data.day = that.formatNumber(day);
        }
        data.hour = that.formatNumber(hour);
      }
      data.second = that.formatNumber(second);
      data.min = that.formatNumber(min);
    } else {
      data.second = that.formatNumber(second_time);
    }
    this.setData(data);
  },

  formatNumber: function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  //删除订单
  onDeleteOrder: function (event) {
    let that = this;
    wx.showModal({
      title: '删除订单',
      content: '确定要删除所选订单吗？',
      success(res) {
        if (res.confirm) {
          common.onDeleteOrder(event, () => {
            wx.navigateTo({
              url: '/pages/order/orderlist',
            })
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  onCancelOrder: function (event) {
    wx.showModal({
      title: '取消订单',
      content: '您确定要取消订单吗?',
      success(res) {
        if (res.confirm) {
          common.onCancelOrder(event, () => {
            wx.navigateTo({
              url: '/pages/order/orderlist',
            })
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  onSaleAfterApply: function () {},
  reLoad: function () {
    let that = this;
    var postdata = [];
    postdata.orderId = this.data.options.id;
    httphelper.api("order/orderDetails", postdata, function (serverdata) {
      that.setData({
        order: serverdata.data
      })

      that.refresh_time();
    });
    httphelper.api("newsReport/querySF", postdata, function (serverdata) {
      that.setData({
        sfData: serverdata.data
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      options: options
    });
    //隐藏分享
    wx.hideShareMenu();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.reLoad();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.data.timeCount);
  },
})