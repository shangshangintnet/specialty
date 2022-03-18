// miniprogram/pages/myself/myrights/myrights.js
const httphelper = require('../../../../httphelper.js')
const common = require('../../../../common.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    equityId: 0,
    shareCode: "S123456789",
    asc: true,
    arrow_up: "/images/arrow_up.png",
    arrow_down: "/images/arrow_down.png",
    toggle: [false, false, false, false, false, false, false],

  },
  copyText:common.copyText,
  toggle:function(event)
  {
    //console.dir(event);
    var index = parseInt(event.currentTarget.dataset.idx); 
    var toggle = [false, false, false, false, false, false, false];
    toggle[index] = true;
    //console.dir(toggle);
    this.setData({
      toggle:toggle
    })
  },
  toggleEquityId: function (equityId) {
    //console.dir(event);
    var index = parseInt(equityId);
    var toggle = [false, false, false, false, false, false, false];
    toggle[index] = true;
    //console.dir(toggle);
    this.setData({
      toggle: toggle
    })
  },
  onGetData:function(){
    let that = this;
    httphelper.api("myInformation/rightsAndInterests",null,function(server_data){
      if(server_data.code == 200){
        that.setData(server_data.data.user);
        that.toggleEquityId(server_data.data.user.equityId);
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.onGetData();
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

  }
})