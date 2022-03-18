// miniprogram/packageMyself/pages/myself/shareCards/shareCards.js

const httphelper = require('../../../../httphelper.js')
var common = require("../../../../common.js")


Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    showPop: false,
    value: 1,
    showShare: false,
  },
  getSearch(e) {
    this.getData(e.detail);
  },
  showPopup: function () {
    this.setData({
      showPop: true
    })
  },
  closePopup: function () {
    this.setData({
      showPop: false
    })
  },
  //给平台好友
  giveFriends: function (e) {
    let that = this;
    console.dir(e);
    wx.showModal({
      title: '赠送购物卡',
      content: '确定要将购物卡赠送给该好友吗?',
      success(res) {
        if (res.confirm) {
          httphelper.api("myInformation/givingGiftCard", {
            id: that.data.cardId,
            userId: e.currentTarget.dataset.userid,
            count: that.data.value
          }, function (server_data) {
            if (server_data.code == 200) {
              wx.showToast({
                title: '赠送成功',
              })
              that.setData({
                showPop: false
              })
              //common.goBack();
            }
          })
        }
      }
    })
  },
  getData: function (param = null) {
    let that = this;
    let data = {};
    if (param != null) {
      data.param = param;
    }
    httphelper.api("myInformation/giftGiving", data, function (server_data) {
      that.setData({
        list: server_data.data.straightList
      })
    });
  },
  changeValue: function (e) {
    this.setData({
      value: e.detail
    })
  },
  getShare: function () {
    let that = this;
    httphelper.api("myInformation/giftCardShare", {
      id: that.data.cardId,
      count: that.data.value
    }, function (server_data) {
      if (server_data.code == 200) {
        that.code = server_data.data.id
        that.setData({
          showShare: true
        })
      }
    })
  },
  cancelShare: function () {
    this.setData({
      showShare: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData(options);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

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
    var id = getApp().userId;
    
    setTimeout(function () {
      that.cancelShare();
      common.goBack();
    }, 2000)

    return {
      title: '送您一张购物卡,赶紧来领取吧～',
      path: '/pages/receivePacket/receivePacket?id=' + that.code + '&scene=' + id + '&isShare=1',
      imageUrl: that.data.imageUrl
    }
  }
})