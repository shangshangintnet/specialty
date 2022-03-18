// miniprogram/pages/trade/trade.js

const common = require("../../common.js");
const httphelper = require("../../httphelper.js");
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    asc: true,
    goodsDate: "",
    arrow_up: "/images/arrow_up.png",
    arrow_down: "/images/arrow_down.png",
    pageNum: 1,
    goodList: []
  },

  onGetData: function () {
    let that = this;
    let data = {};
    if (this.data.goodsDate != "") {
      data.goodsDate = this.data.goodsDate;
    } else {
      data.goodsPrice = this.data.asc ? "asc" : "desc";;
    }
    data.pageNum = this.data.pageNum;
    httphelper.api("classification/commodityExchange", data, function (serverdata) {
      if (serverdata.code == 200) {
        if (that.data.pageNum == 1) {
          let emdCount = serverdata.data.emdEmeraldCount > serverdata.data.useEmdEmeraldCount ? serverdata.data.useEmdEmeraldCount :
            serverdata.data.emdEmeraldCount;
          that.setData({
            classification: serverdata.data.classification,
            balance: serverdata.data.balance,
            emd: emdCount / 10
          })
        }
        let price = that.data.balance + that.data.emd;
        serverdata.data.goodList.map((val) => {
          let price_2 = (val.price - price).toFixed(2)
          val.price_2 = price_2 > 0 ? price_2 : 0;
          val.rate = parseInt(240 * (1 - val.price_2 / val.price));
        })
        that.setData({
          goodList: that.data.goodList.concat(serverdata.data.goodList)
        })
      }
    })
  },
  tagTo: function (e) {
    if (e.currentTarget.dataset.tagIndex == 0) {
      this.setData({
        goodsDate: "goodsDate",
        pageNum: 1,
        goodList: []
      })
    } else {
      this.setData({
        goodsDate: "",
        asc: !this.data.asc,
        pageNum: 1,
        goodList: []
      })
    }
    this.onGetData();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onGetData();
  },

  onPageScroll: function (res) {
    let num = 0;
    num = (res.scrollTop / 140);
    if (num > 1) num = 1;
    this.selectComponent("#navbar").setOpacity(num);
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.data.pageNum++;
    this.onGetData();
  },

  jumpToGoods: function (e) {
    wx.navigateTo({
      url: '/pages/goods/goods_detail?goodsId=' + e.currentTarget.dataset.id
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: common.getShareMsg(14, 4),
      path: '/pages/trade/trade?userId=' + app.userId,
    }
  },
  /**
   * 分享到朋友圈
   */
  onShareTimeline: function () {
    return {
      title: common.getShareMsg(14, 4),
      query: 'userId=' + app.userId,
    }
  }
})