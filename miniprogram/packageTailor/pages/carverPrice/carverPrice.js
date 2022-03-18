// packageTailor/pages/Tailor/Tailor.js
const httphelper = require('../../../httphelper.js')
const app = getApp()
let that

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: 0,
    price: [],
    user: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    this.getdata();
  },

  getdata() {
    httphelper.api("carve/findStaffPreviousIncome", {
      userId: app.user.id
    }, function (serverdata) {
      if (serverdata.code == 200) {
        that.setData({
          price: serverdata.data,
          user: app.user,
          bar_Height: app.bar_Height,
        })
      }
    });
  },
})