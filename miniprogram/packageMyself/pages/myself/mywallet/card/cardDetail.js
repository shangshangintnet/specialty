// packageMyself/pages/myself/mywallet/card/cardDetail.js
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
    getList: [],
    gifts: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    this.setData({
      bar_Height: app.bar_Height,
    })
    this.findCardAll();
  },
  findCardAll() {
    httphelper.api("classification/findGiftCardAll", null, (serverData) => {
      that.setData({
        gifts: serverData.data.gifts
      })
      that.getData();
    });
  },
  getData() {
    httphelper.api("myInformation/findGiftCardMessage", null, (serverData) => {
      that.setData({
        getList: serverData.data.giftCardMessages
      })
    });
  },
})