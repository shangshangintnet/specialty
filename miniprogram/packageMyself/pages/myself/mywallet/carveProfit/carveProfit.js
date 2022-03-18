// packageTailor/pages/Tailor/Tailor.js
const httphelper = require('../../../../../httphelper.js');
const app = getApp()
let that

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: 0,
    user: {},
    orders: [],
    ability: 0, //1雕刻 2抛光 3镶嵌
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    this.getdata();
  },

  getdata() {
    httphelper.api("carve/getStoreReturnPrice", null, function (serverdata) {
      if (serverdata.code == 200) {
        that.setData({
          orders: serverdata.data.orders,
          ability: serverdata.data.ability,
          user: app.user,
          bar_Height: app.bar_Height,
        })
      }
    });
  },
})