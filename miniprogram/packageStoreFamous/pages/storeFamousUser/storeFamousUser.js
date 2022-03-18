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
    users: [],
    active: 0,
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
      active: options.type ? options.type : 0,
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
    that.users = [];
    that.pageNum = 1;
    that.beMore = true;
    that.getdata();
    wx.stopPullDownRefresh();
  },
  getdata() {
    httphelper.api("storeFamous/findStoreFamousUser", {
      pageNum: that.data.pageNum++,
      type: that.data.active,
    }, (serverData) => {
      if (serverData.code == 200) {
        that.setData({
          users: that.data.users.concat(serverData.data),
        })
      } else {
        that.setData({
          beMore: false
        })
      }
    });
  },
  onLogin: function () {
    if (!app.isShowLogin) {
      let that = this;
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.getdata();
      }
      return;
    }
  },
  removeFamousAttention(e) {
    if (this.data.query) return;
    let item = this.data.users[e.currentTarget.dataset.index];
    let that = this;
    this.data.query = true;
    httphelper.api("storeFamous/storeRemoveAttention", {
      id: item.id
    }, (serverData) => {
      wx.showToast({
        icon: 'none',
        title: "取消成功"
      });
      if (serverData.code == 200) {
        item.followStatus = 0;
        let temp = that.data.users;
        that.setData({
          users: temp
        })
      }
      that.data.query = false;
    });
  },
  addFamousAttention(e) {
    if (this.data.query) return;
    let item = this.data.users[e.currentTarget.dataset.index];
    let that = this;
    this.data.query = true;
    httphelper.api("storeFamous/storeAttention", {
      id: item.id
    }, (serverData) => {
      wx.showToast({
        icon: 'none',
        title: "关注成功"
      });
      if (serverData.code == 200) {
        item.followStatus = 1;
        let temp = that.data.users;
        that.setData({
          users: temp
        })
      }
      that.data.query = false;
    });
  },
  openUser(e) {
    wx.navigateTo({
      url: '../storeFamous/storeFamous?id='+e.currentTarget.dataset.id,
    })
  },
})