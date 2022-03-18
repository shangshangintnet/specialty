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
    pageNum: 1,
    active: 0,
    beMore: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    console.log(options)
    that.setData({
      bar_Height: app.bar_Height,
      active: options.type ? options.type : 0,
    })
    that.getdata();
  },
  onReachBottom: function () {
    if (this.data.beMore)
      that.getdata();
  },
  //下拉刷新
  onPullDownRefresh: function () {
    
  },
  getdata() {
    httphelper.api("storeFamous/findStoreFamousGoods", {
      pageNum: that.data.pageNum++,
      type: 0,
      active: that.data.active,
    }, (serverData) => {
      if (serverData.code == 200) {
        that.setData({
          goods: that.data.goods.concat(serverData.data),
        })
      } else {
        that.setData({
          beMore: false
        })
      }
    });
  },
  jumpToStoreFamousGoods(e) {
    wx.navigateTo({
      url: '/packageStoreFamous/pages/storeFamousGoods/storeFamousGoods?goodsId=' + e.currentTarget.dataset.id,
    });
  },
  openUser(e) {
    wx.navigateTo({
      url: '../storeFamous/storeFamous?id='+e.currentTarget.dataset.id,
    })
  },
})