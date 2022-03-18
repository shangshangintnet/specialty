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
    advisers: [],
    tagLevel: [
      '创始人',
      '公司董事',
      '合伙人'
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    this.setData({
      bar_Height: app.bar_Height,
      exclusive: app.exclusive,
      user: app.user
    })
  },
  onShow(e) {
    that.getdata();
  },
  getdata() {
    httphelper.api("high/findHighBroker", null, (serverData) => {
      if (serverData.code == 200) {
        that.setData({
          advisers: serverData.data
        })
      }
    });
  },
  openAdviser(e) {
    app.curAdviser = that.data.advisers[e.currentTarget.dataset.index];
    wx.navigateTo({
      url: '../adviserDetail/adviserDetail',
    })
  },
  editAdviser(e) {
    app.curAdviser = that.data.advisers[e.currentTarget.dataset.index];
    wx.navigateTo({
      url: '../uploadAdviser/uploadAdviser?edit=1',
    })
  },
  addAdviser(e) {
    wx.navigateTo({
      url: '../uploadAdviser/uploadAdviser',
    })
  },
  removeExAdviser(e) {
    httphelper.api("high/delExclusiveBroker", null, (serverData) => {
      if (serverData.code == 200) {
        let item = that.data.advisers[e.currentTarget.dataset.index];
        item.type = 1;
        let high = that.data.advisers;
        that.setData({
          advisers: high,
          exclusive: false
        })
        app.exclusive = false;
        wx.showToast({
          title: '移除专属客服',
        })
      }
    });
  },
  addExAdviser(e) {
    let item = that.data.advisers[e.currentTarget.dataset.index];
    httphelper.api("high/addExclusiveBroker", {
      id: item.id
    }, (serverData) => {
      if (serverData.code == 200) {
        item.type = 2;
        let high = that.data.advisers;
        that.setData({
          advisers: high,
          exclusive: true
        })
        app.exclusive = true;
        wx.showToast({
          title: '设置专属客服',
        })
      }
    });
  },
  chat(e) {
    let item = this.data.advisers[e.currentTarget.dataset.index];
    common.goKefu(item.chatId, item.storeName ? item.storeName : item.name, item.photoUrl);
  },
  delAdviser(e) {
    wx.showModal({
      title: '删除顾问',
      content: '删除后无法恢复',
      success: function (res) {
        if (res.confirm) {
          let item = that.data.advisers[e.currentTarget.dataset.index];
          httphelper.api("high/delHighBroker", {
            id: item.id
          }, (serverData) => {
            if (serverData.code == 200) {
              let advisers = that.data.advisers;
              advisers.splice(e.currentTarget.dataset.index, 1)
              that.setData({
                advisers: advisers
              })
            }
          });
        }
      },
    })
  },
  onPageScroll: function (res) {
    let num = 0;
    num = (res.scrollTop / 140);
    if (num > 1) num = 1;
    this.selectComponent("#navbar").setOpacity(num);
  },
})