const common = require("../../common.js");
const httphelper = require("../../httphelper.js");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    userContentAll: [],
    type: 4,
    currentId: 1,
    title: "海报",
    poster: [],
    posterCateGory: [],
    urls: [],
    postUrl: '',
    erBcg: "",
    showCanvas: false,
    beMore: true,
  },
  tagTo: function (event) {
    let that = this;
    let id = event.currentTarget.dataset.id;
    this.setData({
      currentId: id
    })
    var postdata = [];
    postdata["id"] = that.data.currentId;
    postdata["pageNum"] = 1;
    httphelper.api("classification/queryCategoryInquiryPoster", postdata, function (server_data) {
      if (server_data.code == 200) {
        that.setData(server_data.data);
        let tmp = [];
        for (var i = 0; i < server_data.data.poster.length; ++i) {
          tmp.push(server_data.data.poster[i].imageUrl);
        }
        that.setData({
          urls: tmp
        });
      }
    })
  },
  onGetData() {
    let that = this;
    var postdata = [];
    postdata.type = that.data.type;
    postdata.pageNum = 1;
    httphelper.api("classification/celebrityInformation", postdata, function (server_data) {
      if (server_data.code == 200) {
        that.setData(server_data.data);
        let tmp = [];
        for (var i = 0; i < server_data.data.poster.length; ++i) {
          tmp.push(server_data.data.poster[i].imageUrl);
        }
        that.setData({
          urls: tmp
        });
      }
    })
  },
  getErCode: function () {
    let that = this;
    let url = getApp().url + "myInformation/customSmallProgramCode?page=pages/index/index&scene=" + getApp().userId + "&ssoToken=" + getApp().ssoToken;
    wx.getImageInfo({
      src: url,
      success: function (res) {
        that.setData({
          erPath: res.path
        })
      },
      complete: function (e) {
        console.log(e);
      }
    })
  },
  openOverLay: function (e) {
    let that = this;
    let url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: that.data.urls,
    });
  },
  shareImg: function (e) {
    this.setData({
      showCanvas: true
    });
    wx.showLoading({
      title: '保存图片中~',
      duration: 5000
    });
    let that = this;
    wx.getImageInfo({
      src: e.currentTarget.dataset.url,
      success: function (res) {
        const ctx = wx.createCanvasContext('shareCanvas')
        ctx.drawImage(res.path, 0, 0, 375, 667);
        ctx.drawImage('./images/erBcg.png', 275, 570, 75, 75);
        ctx.drawImage(that.data.erPath, 275, 570, 75, 75);
        setTimeout(() => {
          ctx.draw(false, () => {
            wx.canvasToTempFilePath({
              canvasId: 'shareCanvas',
              success: function (res1) {
                console.dir(res1);
                that.saveImage(res1.tempFilePath);
              },
              fail: function (res1) {
                console.dir(res1);
              },
              complete: function () { }
            }, that);
          });
        }, 1000);
      },
      complete: function () { }
    })
  },
  saveImage(filePath) {
    console.log(filePath);
    let that = this;
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success(res) {
        wx.showToast({
          title: '保存成功',
        })
      },
      fail(res) {
        console.log(res);
      },
      complete() {
        that.setData({
          showCanvas: false
        })
      },
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData(options);
    this.onGetData();
    wx.hideShareMenu();
    this.getErCode();
  },
})