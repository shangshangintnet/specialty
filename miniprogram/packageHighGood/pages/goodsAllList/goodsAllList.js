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
    goods: [],
    active: 1,
    status: [
      '上架',
      '已售',
      '下架'
    ],
    display: 3,
    pageNum: 1,
    beMore: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({
      bar_Height: app.bar_Height,
      active: options.type ? options.type : 1,
      user: app.user
    })
    that.getdata();
  },
  onReachBottom: function () {
    if (this.data.beMore)
      that.getdata();
  },
  //下拉刷新
  onPullDownRefresh: function () {
    that.goods = [];
    that.pageNum = 1;
    that.beMore = true;
    that.getdata();
    wx.stopPullDownRefresh();
  },
  tagTo(e) {
    if (that.data.active == e.currentTarget.dataset.index) {
      return;
    }
    that.setData({
      active: e.currentTarget.dataset.index,
      goods: [],
      pageNum: 1,
      beMore: true
    })
    that.getdata();
  },
  changeDisplay(e) {
    that.setData({
      display: e.currentTarget.dataset.index
    })
  },
  getdata() {
    httphelper.api("high/findOwnerGoods", {
      type: that.data.active,
      pageNum: that.data.pageNum++
    }, (serverData) => {
      if (serverData.code == 200) {
        serverData.data.map((val) => {
          if (val.images) {
            val.imageUrl = val.images.split(',');
          }
        })
        that.setData({
          goods: that.data.goods.concat(serverData.data)
        })
      } else {
        that.setData({
          beMore: false
        })
      }
    });
  },
  openGood(e) {
    app.curHighGood = that.data.goods[e.currentTarget.dataset.index];
    wx.navigateTo({
      url: '../goodsDetail/goodsDetail',
    })
  },
  addGood(e) {
    wx.navigateTo({
      url: '../uploadGood/uploadGood',
    })
  },
  editGood(e) {
    app.curHighGood = that.data.goods[e.currentTarget.dataset.index];
    wx.navigateTo({
      url: '../uploadGood/uploadGood?edit=1',
    })
  },
})