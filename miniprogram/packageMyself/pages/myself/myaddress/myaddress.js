// miniprogram/pages/myself/myaddress/myaddress.js
const httphelper = require('../../../../httphelper.js')
var common = require("../../../../common.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    addressList: []
  },
  onReloadData:function(){
    let that = this;
    httphelper.api("myInformation/addressManagement", null, function (serverdata) {
      that.setData({
        addressList: serverdata.data.addresses,
      })
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //隐藏分享
    wx.hideShareMenu();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.onReloadData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  //设置默认地址
  toggleDefault: function(e) {
    var postdata = [];
    postdata["addressId"] = e.currentTarget.dataset.id;
    let that = this;
    httphelper.api("myInformation/updateDefaultAddress", postdata, function(serverdata) {
      that.onReloadData();
      wx.showToast({
        title: serverdata.msg,
      })
    });
  },
  //删除地址
  onDeleteAddress: function(e) {
    var postdata = [];
    postdata["addressId"] = e.currentTarget.dataset.id;
    let that = this;

    wx.showModal({
      title: '删除地址',
      content: '确定要删除所选地址吗？',
      success(res) {
        if (res.confirm) {
          httphelper.api("myInformation/deleteAddressManagement", postdata, function (serverdata) {
            if(serverdata.code == 200)
            {
              that.onReloadData();
              wx.showToast({
                title: serverdata.msg,
              })
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })


  },
  jumpTo:common.jumpTo

})