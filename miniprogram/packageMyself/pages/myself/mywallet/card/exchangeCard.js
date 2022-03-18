// packageMyself/pages/myself/mywallet/card/exchangeCard.js
const httphelper = require('../../../../../httphelper.js');
const common = require('../../../../../common.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: 0,
    maxCount: 1,
    id: 0,
    imageUrl: '',
    cardPrice: 200,
    count: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      bar_Height: app.bar_Height,
      cardPrice: options.price,
      id: options.id,
      maxCount: parseInt(options.count),
      imageUrl: options.imageUrl,
    })
  },
  exchange() {
    const data = {};
    data.id = this.data.id;
    data.count = this.data.count;
    httphelper.api("myInformation/useGiftCard", data, (serverData) => {
      if (serverData.code == 200) {
        common.goBackAfterMsg("兑换成功");
      }
    });
  },
  bindChange_sub() {
    if (this.data.count > 1)
      this.setData({
        count: this.data.count - 1
      })
  },
  bindChange_add() {
    if (this.data.count < this.data.maxCount)
      this.setData({
        count: this.data.count + 1
      })
  },
})