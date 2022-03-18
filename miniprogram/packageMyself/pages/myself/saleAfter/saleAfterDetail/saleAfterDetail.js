// miniprogram/pages/myself/saleAfter/saleAfterDetail/saleAfterDetail.js
const httphelper = require('../../../../../httphelper.js')
var common = require("../../../../../common.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    after: {},
    afterSaleDetails: {},
    serveRange: ["退货退款", "仅退款"],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    var postdata = [];
    postdata.customerId = options.customerId;
    httphelper.api("myInformation/detailsOfAfterSalesService", postdata, function (serverdata) {
      that.setData(serverdata.data)
    });
    //隐藏分享
    wx.hideShareMenu();
  },

  gokefu() {
    common.goKefu('store' + this.data.storeId, this.data.storeName, this.data.storeIcon);
  },
  makePhone() {
    if (this.data.storePhone == null) {
      wx.makePhoneCall({
        phoneNumber: "4006691899",
      })
    } else {
      wx.makePhoneCall({
        phoneNumber: this.data.storePhone,
      })
    }
  },

  //删除服务单
  onDeleteService: function (e) {
    let that = this;
    var postdata = [];
    postdata.customerId = options.customerId;
    httphelper.api("myInformation/deleteAfterSalesServiceInformation", postdata, function (serverdata) {
      that.setData({

      })
    });
  }
})