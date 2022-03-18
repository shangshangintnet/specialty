// packageMyself/pages/myself/storage/storage.js
const httphelper = require('../../../../httphelper.js');
const common = require('../../../../common.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: 0,
    photoImage: '',
    nickName: '',
    tab: 0,
    tag: 0,
    show: false,
    zIndex: 800,
    user: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      bar_Height: app.bar_Height
    })
    let that = this;
    httphelper.api("myInformation/myInformation", null, function (serverdata) {
      that.setData({
        user: serverdata.data.user,
      })
    });
  },
  click_tip() {
    this.setData({
      show: true
    })
  },
  close_tip() {
    this.setData({
      show: false
    })
  },
  clickTag(e) {
    let tag = parseInt(e.currentTarget.dataset.tag);
    this.setData({
      tag: tag,
    })
    if (tag < 2)
      this.setData({
        tab: 0
      })
    else
      this.setData({
        tab: 1
      })
  },
  clickTab(e) {
    let tag = parseInt(e.currentTarget.dataset.tag);
    this.setData({
      tab: tag
    })
  },
  confirmOrder() {
    var id = this.data.tag + 1;
    wx.navigateTo({
      url: '/pages/order/order_card/order_card?type=0&id=' + id
    });
  },
  clickDeposit(e) {
    let tag = parseInt(e.currentTarget.dataset.tag);
    this.setData({
      tag: tag,
    })
    this.confirmOrder();
  },
  goKefu: function () {
    let post = {};
    post.storeIds = "12";
    common.findUserImInfo(post, (res) => {
      common.goKefu('store12', "平台客服", res["store12"].avatar);
    })
  },
})