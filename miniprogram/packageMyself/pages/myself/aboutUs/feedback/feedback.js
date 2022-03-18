// miniprogram/pages/myself/aboutUs/feedback/feedback.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    images:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //隐藏分享
    wx.hideShareMenu();
  },
  commitPics(){
    var that = this;
    wx.chooseImage({
      count: 3 - that.data.images.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        // console.dir(res);
        var images = that.data.images;
        
        for(var i = 0;i<res.tempFilePaths.length;++i)
        {
          images[images.length] = res.tempFilePaths[i]; 
        }

        that.setData({
          images:images
        })

        // console.dir(images);
        // console.dir(that.data.images);
        // tempFilePath可以作为img标签的src属性显示图片
        //const tempFilePaths = res.tempFilePaths
      }
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