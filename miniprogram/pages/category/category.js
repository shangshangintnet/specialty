// miniprogram/pages/category/category.js
const httphelper = require('../../httphelper.js')
const common = require('../../common.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page_name: "商品目录",
    index_one: 0,
    index_two: 0,
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    data: [], //server返回数据
    second_data: [],
    third_data: []
  },

  //选择1级分类展示相应2级分类
  jumpTwo: function(event) {
    //console.dir(event.currentTarget);
    var tag_index = event.currentTarget.dataset.tagIndex;
    if (tag_index != null)
      this.setData({
        index_one: tag_index,
        index_two: 0,
        second_data: this.data.data[tag_index]["children"],
        third_data: this.data.data[tag_index]["children"][0]["children"]
      })
  },

  //选择2分分类展示相应3级分类
  jumpThree: function(event) {
    // console.dir(event.currentTarget);
    var tag_index = event.currentTarget.dataset.tagIndex;
    if (tag_index != null)
      this.setData({
        index_two: tag_index,
        third_data: this.data.second_data[tag_index]["children"]
      })
  },

  //前往分类详情界面
  onMoveToCommodityInformationFirstTypeId: common.onMoveToCommodityInformationFirstTypeId,
  jumpTo:common.jumpTo,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    httphelper.api("classification/queryNavigation", null, function(serverdata) {
      that.setData({
        data: serverdata.data.classifications,
        second_data: serverdata.data.classifications[0]["children"],
        third_data: serverdata.data.classifications[0]["children"][0]["children"]
      })
    });
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