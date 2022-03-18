// miniprogram/pages/myself/mywallet/myincome/myincome.js
const common = require('../../../../../common.js');
const httphelper = require('../../../../../httphelper.js')



Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    select_items:"dailyIncome",
    income:[],
    select_title:{
      dailyIncome:"本日新增",
      weeklyIncome:"本周新增",
      monthlyIncome:"本月新增"
    }
  },
  toggle_change:function(event){
    var select_items = event.currentTarget.dataset.selectTog;
    // console.dir(select_items);
    this.setData({
      select_items:select_items      
    })
  },
  onGetData:function(){
    let that = this;
    httphelper.api("myInformation/getMyIncome",null,function(server_data){
      if(server_data.code == 200){
        that.setData({
          income:server_data.data
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onGetData();
    //隐藏分享
    wx.hideShareMenu();
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