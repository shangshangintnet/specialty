// miniprogram/pages/myself/myshare/myposter/myposter.js
const common = require('../../../../../common.js')
const httphelper = require('../../../../../httphelper.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    imgSm: [
      'https://img.ssw88.com/wechatImg/share_1.jpg',
      'https://img.ssw88.com/wechatImg/share_2.jpg',
    ],
    imgUrls: [
      'https://img.ssw88.com/wechatImg/share_1_1.jpg',
      'https://img.ssw88.com/wechatImg/share_2_2.jpg'
    ],

    imageStore: [
      'https://img.ssw88.com/share/image/shareSpike.jpg',
      'https://img.ssw88.com/share/image/shareRedPacketRain.jpg',
      'https://img.ssw88.com/share/image/shareInvite.jpg',
      'https://img.ssw88.com/share/image/shareGuess.jpg'
    ],
    imageStoreBig: [
      'https://img.ssw88.com/share/image/shareSpike-big.jpg',
      'https://img.ssw88.com/share/image/shareRedPacket-big.jpg',
      'https://img.ssw88.com/share/image/shareInvite-big.jpg',
      'https://img.ssw88.com/share/image/shareGuess-big.jpg'
    ],
    current: 0,
    type: 0,
    storeName: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.type != undefined) {
      this.setData({
        type: 1,
        storeId: options.storeId,
        storeName: options.storeName != undefined ? options.storeName : '',
        imgUrls: this.data.imageStoreBig,
        imgSm: this.data.imageStore
      })
    } else {
      let that = this;
      httphelper.api("classification/findPoster", null, function (serverData) {
        if (serverData.code == 200) {
          that.setData({
            imgUrls: serverData.data.maxPoster,
            imgSm: serverData.data.minPoster
          })
        }
      })
    }
  },
  changeImg: function (event) {
    // console.dir(event.detail.current);
    this.setData({
      current: event.detail.current
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
    let that = this;
    var storeId = this.data.storeId;
    var id = getApp().userId;
    let name = common.makeShareText(6);
    let storeName = common.makeShareText(10, this.data.storeName);
    return {
      title: this.data.type == 1 ? storeName : name,
      path: this.data.type == 1 ? '/packageStore/pages/storeDetail/storeDetail?id=' + storeId + "&userId=" + id : '/pages/index/index?userId=' + id,
      imageUrl: that.data.imgSm[that.data.current]
    }
  }
})