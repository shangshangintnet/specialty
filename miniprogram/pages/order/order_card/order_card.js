// miniprogram/pages/order/order_card/order_card.js
var common = require("../../../common.js");
var httphelper = require("../../../httphelper.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    id: '',
    count: 1,
    res: {},
    maxUseBalance: 0,
    inputNumber: '',
    useBalance: 0,
    updatePrice: 0,
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    //0 储值 1 购物卡
    this.setData(options);
    if (this.data.type == 0) {
      this.getDepositInfo();
    } else {
      this.getCardInfo();
    }
  },
  getDepositInfo: function () {
    let that = this;
    httphelper.api("order/generatingStorageCardOrder", {
      id: this.data.id
    }, function (server_data) {
      that.setData({
        res: server_data.data
      });
      that.setMaxBalance();
    })
  },
  getCardInfo: function () {
    let that = this;
    httphelper.api("order/generateGiftCardOrder", {
      id: this.data.id,
      count: this.data.count
    }, function (server_data) {
      that.setData({
        res: server_data.data
      });
      that.setMaxBalance();
    })
  },
  setMaxBalance: function () {
    let that = this;
    let data = this.data.res;
    let maxUseBalance = data.totalDiscountPrice < data.balance ? data.totalDiscountPrice : data.balance;
    if (this.data.type == 0) maxUseBalance = 0;
    this.setData({
      maxUseBalance: maxUseBalance,
      updatePrice: this.data.res.totalDiscountPrice,
      inputNumber: maxUseBalance,
      useBalance: maxUseBalance,
      updatePrice: parseFloat(that.data.res.totalDiscountPrice - maxUseBalance).toFixed(2)
    })
  },
  bindCoinCheck: function (e) {
    let value = e.detail.value
    if (value < 0) value = 0;
    return (value > this.data.maxUseBalance) ? this.data.maxUseBalance : value;
  },
  getDiscountPrice: function (e) {
    let value = parseInt(e.detail.value);
    let that = this;

    let data = {};
    data.id = this.data.res.orderId;
    data.useBalance = isNaN(value) ? 0 : value;

    this.setData({
      inputNumber: data.useBalance,
      useBalance: data.useBalance,
      updatePrice: that.data.res.totalDiscountPrice - data.useBalance
    })
  },
  useBalance: function () {
    let that = this;
    let data = {
      id: this.data.res.orderId,
      useBalance: this.data.useBalance
    };
    httphelper.api("order/updateOrderUseBalance", data, function (server_data) {
      if (server_data.data.payStatus == 1) {
        wx.navigateTo({
          url: "/pages/common/successCall?msg=购物卡购买完成~&label2=我的卡包&label2_url=/packageMyself/pages/myself/mywallet/mywallet",
        })
      } else {
        common.onConfirmOrder(that.data.res.orderId, parseInt(that.data.type));
      }
    })
  },
  onConfirmOrder: function () {
    if (this.data.type == 1) {
      this.useBalance();
    } else {
      common.onConfirmOrder(this.data.res.orderId, parseInt(this.data.type));
    }
  },

})