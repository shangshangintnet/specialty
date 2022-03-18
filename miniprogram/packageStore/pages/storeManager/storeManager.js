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
    store: {},
  },
  onLoad: function () {
    that = this;
    this.getData();
    this.setData({
      bar_Height: app.bar_Height * 2
    })
  },
  goBack() {
    common.goBack();
  },
  getData() {
    httphelper.api('store/findStoreDetail', null, (serverData) => {
      that.setData({
        store: serverData.data
      })
    });
  },
  goStore() {
    wx.navigateTo({
      url: './storeInfo'
    });
  },
  goGoods() {
    wx.navigateTo({
      url: './storeGoodsManager?type=' + this.data.store.type
    });
  },
})