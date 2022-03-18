// packageMyself/pages/myself/vCard/saveWechatCode/saveWechatCode.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    url: '',
  },

  /**
   * 扫描二维码
   */
  scanCode: function () {
    let that = this;
    // 允许从相机和相册扫码
    wx.scanCode({
      success(res) {
        console.log(res)
        that.setData({
          link: res.result
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      url: "https://www.ssw88.com/webAppIndex/index.html#/wxScanQrcode?ssoToken=" + getApp().ssoToken+"&wechat=1#wechat_redirect"
    })

    //url:"https://www.ssw88.com/webAppIndex/index.html#/wxScanQrcode?ssoToken="+getApp().ssoToken
    console.log(this.data.url);
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