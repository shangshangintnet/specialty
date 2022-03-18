// packageMyself/pages/myself/mywallet/card/buyCards.js
const httphelper = require('../../../../../httphelper.js');
const common = require('../../../../../common.js');
const app = getApp();
let that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: 0,
    giftGoods: [],
    gifts: [],
    selectGoods: [{
      imageUrl: '',
      price: ''
    }],
    selectType: 1,
    selectValue: 0,
    balance: '',
    buyCount: 1,
    storeName: '',
    show: false,
    zIndex: 800,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      bar_Height: app.bar_Height,
    })
    that = this;
    this.getData();
  },
  getData() {

    httphelper.api("classification/findGiftCardAll", null, (serverData) => {
      that.setData({
        giftGoods: serverData.data.giftGoods,
        gifts: serverData.data.gifts,
        selectGoods: serverData.data.gifts,
        balance: serverData.data.balance,
        storeName: serverData.data.storeName,
        selectType: 1,
        selectValue: 0,
      })
    });
  },
  click_buy() {
    this.setData({
      show: true,
    })
  },
  close_buy() {
    this.setData({
      show: false,
    })
  },
  confirmOrder() {
    let good = this.data.selectGoods[this.data.selectValue];
    if (this.data.selectType == 1) {
      wx.navigateTo({
        url: '/pages/order/order_card/order_card?type=1&id=' + good.id + '&count=' + this.data.buyCount
      });
    } else {
      wx.navigateTo({
        url: "/pages/order/order_confirm/order_confirm?id=" + good.id + '&productQty=' + this.data.buyCount + '&storeId=0&storeName=' + this.data.storeName,
      })
    }
    this.setData({
      show: false,
    })
  },
  bindChange_sub() {
    if (this.data.buyCount > 1) {
      this.setData({
        buyCount: this.data.buyCount - 1
      })
    }
  },
  bindChange_add() {
    this.setData({
      buyCount: this.data.buyCount + 1
    })
  },
  changeType(e) {
    let type = parseInt(e.currentTarget.dataset.type);
    if (this.data.selectType == type) return;
    if (type == 0) {
      this.setData({
        selectGoods: this.data.giftGoods
      })
    } else {
      this.setData({
        selectGoods: this.data.gifts
      })
    }
    this.setData({
      selectType: type,
      selectValue: 0,
    })
  },
  setSelectValue(e) {
    this.setData({
      selectValue: parseInt(e.currentTarget.dataset.index)
    })
  },
})