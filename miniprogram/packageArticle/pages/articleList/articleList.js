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
    articleList: [],
    pageNum: 1,
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
    httphelper.api("wx/findArticleList", {
      pageNum: that.data.pageNum++,
    }, (serverData) => {
      if (serverData.code == 200) {
        that.setData({
          articleList: that.data.articleList.concat(serverData.data),
        })
      } else {
        that.setData({
          beMore: false
        })
      }
    });
  },
  jumpToArticle(e) {
    wx.navigateTo({
      url: '/packageArticle/pages/article/article?url=' + encodeURIComponent(JSON.stringify(e.currentTarget.dataset.url)),
    });
  },
})