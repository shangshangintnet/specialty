const httphelper = require('../../../httphelper.js');
const app = getApp();
let that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: 0,
    info: [],
    status: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    this.setData({
      bar_Height: app.bar_Height * 2,
      status: options.status
    })
    this.getData();
  },
  getData() {
    httphelper.api('store/findStorePayRecord', null, (serverData) => {
      if (serverData.code == 200) {
        that.setData({
          info: serverData.data
        })
      }
    });
  },
  /**
   * 退押金
   */
  returnPrice: function () {
    if (this.data.status == 1)
      return;
    wx.showModal({
      title: '退回保证金',
      content: '申请退保证金后，店铺将自动关闭，店铺所有订单处理完毕后，保证金会自动退回微信账号，是否继续？',
      success: function (res) {
        if (res.confirm) {
          var post = {};
          post.returnType = 3;
          post.returnParam = wx.getStorageSync('openid');
          httphelper.api("store/addReturnPrice", post, function (data) {
            if (data.code == 200) {
              that.setData({
                status: 1
              })
              wx.showToast({
                icon: 'none',
                title: '申请已提交，请耐心等待',
                duration: 3000
              })
            }
          })
        }
      },
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})