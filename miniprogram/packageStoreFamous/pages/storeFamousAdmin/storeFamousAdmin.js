const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
const app = getApp();
let that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    bar_Height: 0,
    goods: [],
    pageNum: 1,
    beMore: true,
    userId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({
      bar_Height: app.bar_Height,
      userId: options.id
    })
    that.getdata();
  },
  onReachBottom: function () {
    if (this.data.beMore)
      that.getdata();
  },
  getdata() {
    httphelper.api("storeFamous/findStoreFamousGoodsByUser", {
      pageNum: that.data.pageNum++,
      type: that.data.active,
      id: that.data.userId==null?'':that.data.userId
    }, (serverData) => {
      if (serverData.code == 200) {
        that.setData({
          goods: that.data.goods.concat(serverData.data.goods),
          userId: serverData.data.userId
        })
      } else {
        that.setData({
          beMore: false
        })
      }
    });
  },
  del(e) {
    wx.showModal({
      title: '',
      content: '是否确认删除',
      success(res) {
        if (res.confirm) {
          httphelper.api("storeFamous/delGoods", {
            id: e.currentTarget.dataset.id
          }, (serverData) => {
            if (serverData.code == 200) {
              that.setData({
                goods: [],
                pageNum: 1
              })
              that.getdata();
            } else {
              that.setData({
                beMore: false
              })
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  toAdd() {
    wx.navigateTo({
      url: '/packageStoreFamous/pages/storeFamousAdmin/goods/goods?type=' + that.data.active + '&userId=' + that.data.userId
    });
  },
  updateFamous() {
    wx.navigateTo({
      url: '/packageStoreFamous/pages/storeFamousAdmin/user/user?id='+that.data.userId
    });
  },
  tagTo: function (e) {
    that.setData({
      active: parseInt(e.currentTarget.dataset.index),
      goods: [],
      pageNum: 1
    })
    that.getdata();
  },
  jumpToGoods(e) {
    wx.navigateTo({
      url: '/packageStoreFamous/pages/storeFamousAdmin/goodsDetail/goodsDetail?id=' + e.currentTarget.dataset.id,
    });
  },
})