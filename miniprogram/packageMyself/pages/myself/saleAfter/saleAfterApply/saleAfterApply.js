const httphelper = require('../../../../../httphelper.js')
var common = require("../../../../../common.js")

// miniprogram/pages/myself/saleAfter/saleAfterApply/saleAfterApply.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    orders: [],
    images: [],
    videos: [],
    serveRange: ["退货退款", "仅退款"],
    customContent: "",
    reasonType: 0,
    returnType: 0,
    inputCount: 0,
    readyImage: 0,
    fileName: "",
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    var postdata = [];
    postdata.orderId = options.orderId;
    postdata.goodsId = options.goodsId;
    this.setData({
      fileName: options.orderId.toString() + options.goodsId.toString()
    })
    httphelper.api("pay/applicationForAfterSale", postdata, function (serverdata) {
      that.setData(serverdata.data)
      if (that.data.userWithdrawal.orderStatus == 1) {
        that.setData({
          returnType: 1
        })
      }
    });
    //隐藏分享
    wx.hideShareMenu();
  },
  commitPics() {
    var that = this;
    wx.chooseImage({
      count: 9 - that.data.images.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        that.setData({
          readyImage: that.data.readyImage + res.tempFilePaths.length
        });
        for (var i = 0; i < res.tempFilePaths.length; ++i) {
          common.uploadFile(res.tempFilePaths[i], (data) => {
            let images = that.data.images;
            images.push(data.data.files);
            that.setData({
              images: images
            })
          }, "feedback/after", this.data.fileName + i.toString());
        }
      }
    })
  },
  commitVideos() {
    let that = this;
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success(res) {
        that.setData({
          readyImage: that.data.readyImage + 1
        });
        wx.showLoading({
          title: '正在上传视频',
        })
        common.uploadFile(res.tempFilePath, (data) => {
          let videos = that.data.videos;
          videos.push(data.data.files);
          that.setData({
            videos: videos
          })
          wx.hideLoading();
        }, "feedback/after/video", this.data.fileName);
      }
    })
  },
  bindServeChange: function (e) {
    this.setData({
      returnType: e.detail.value
    })
  },
  bindTextArea: function (e) {
    this.setData({
      inputCount: e.detail.value.length,
      customContent: e.detail.value
    })
  },
  bindReasonChange: function (e) {
    this.setData({
      reasonType: e.detail.value
    })
  },
  playFullVideo: function (e) {
    // console.dir(e);
    let videoContent = wx.createVideoContext("myVideo", this);
    videoContent.requestFullScreen();
    videoContent.play();
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
    clearInterval(this.timeOut);
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

  },
  //添加售后申请
  onSubmitService: function () {
    let that = this;
    let post_data = this.data.userWithdrawal;


    var postdata = [];
    postdata.orderId = post_data.orderId;
    postdata.goodsId = post_data.goodsId;
    postdata.customerType = (this.data.returnType);
    postdata.reasonId = (this.data.returnType == 0) ? this.data.returnRefundAll[this.data.reasonType].id : this.data.refundAll[this.data.reasonType].id;
    postdata.customerContent = this.data.customContent;
    postdata.customerImageurls = this.data.images.join(",");
    postdata.customerVideourl = this.data.videos.join(",");

    postdata.realName = this.data.realName;
    postdata.phoneNum = this.data.phoneNum;
    postdata.storePhone = this.data.store.storePhone;
    postdata.storeAddress = this.data.store.address;
    httphelper.api("pay/submitApplicationForAfterSale", postdata, function (serverdata) {
      wx.showToast({
        title: '申请成功',
        success: function () {
          that.timeOut = setInterval(function () {
            common.goBack();
          }, 1500)
        }
      })
    });
  }
})