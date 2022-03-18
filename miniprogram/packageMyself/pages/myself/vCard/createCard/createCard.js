// miniprogram/packageMyself/pages/myself/vCard/createCard/createCard.js
const httphelper = require('../../../../../httphelper.js')
var common = require("../../../../../common.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    name: "",
    position: "总经理",
    phone: "",
    email: "",
    company: "",
    introduce: "",
    address: "",
    wechatId: "",
    photo: "",
    wechatCode: "",
    cropShow: false,
    imgType: 0,
    width: 250,
    height: 250,
    src: "",
  },
  cPhotos: function () {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res.tempFilePaths);
        wx.showLoading({
          title: '图片加载中',
        })
        that.setData({
          src: res.tempFilePaths[0],
          cropShow: true,
          imgType: 0,
        });
      }
    })
  },
  cWechatCode: function () {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res.tempFilePaths);
        wx.showLoading({
          title: '图片加载中',
        })
        that.setData({
          src: res.tempFilePaths[0],
          cropShow: true,
          imgType: 1,
        });
      }
    })
  },
  confirm: function () {
    let data = this.data;
    httphelper.api(this.data.status == 0 ? 'myInformation/addBusinessCard' : 'myInformation/updateBusinessCard', this.data, function (server_data) {
      if (server_data.code == 200) {
        wx.navigateBack({
          complete: (res) => { },
        })
      } else {
        wx.showToast({
          title: server_data.msg,
        })
      }
    })
  },
  cName: function (value) {
    this.setData({
      name: value.detail
    })
  },
  cPos: function (value) {
    this.setData({
      position: value.detail
    })
  },
  cWechat: function (value) {
    this.setData({
      wechatId: value.detail
    })
  },
  cPhone: function (value) {
    this.setData({
      phone: value.detail
    })
  },
  cIntroduce: function (value) {
    this.setData({
      introduce: value.detail
    })
  },
  cEmail: function (value) {
    this.setData({
      email: value.detail
    })
  },
  cCompany: function (value) {
    this.setData({
      company: value.detail
    })
  },
  cAddress: function (value) {
    this.setData({
      address: value.detail
    })
  },
  //截取图片
  cropperload(e) {
    console.log("cropper初始化完成");
  },
  loadimage(e) {
    wx.hideLoading(); //重置图片角度、缩放、位置
    this.selectComponent("#image-cropper").imgReset();
  },
  clickcut(e) {
    wx.previewImage({
      current: e.detail.url, // 当前显示图片的http链接
      urls: [e.detail.url] // 需要预览的图片http链接列表
    })
  },
  getImg(e) {
    let that = this;
    this.setData({
      cropShow: false
    })
    if (this.data.imgType == 0) {
      common.uploadFile(e.detail.url, function (server_data) {
        that.setData({
          photo: server_data.data.files
        })
      }, 'user/businessCard');
    } else {
      common.uploadFile(e.detail.url, function (server_data) {
        that.setData({
          wechatCode: server_data.data.files
        })
      }, 'user/businessCard/wechatCode');
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    httphelper.api("myInformation/myBusinessCard", null, function (server_data) {
      that.setData(server_data.data);
      if (server_data.data.status == 1) {
        server_data.data.list[0].myCardType = 1;
        that.setData(server_data.data.list[0]);
      } else {
        that.setDefaultData();
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  setDefaultData: function () {
    var that = this;
    wx.getUserProfile({
      success: function (res) {
        var userInfo = res.userInfo
        //var nickName = userInfo.nickName
        var avatarUrl = userInfo.avatarUrl
        that.setData({
          photo: avatarUrl
        })
      }
    })
    var value = wx.getStorageSync('phoneNum');
    if (value) {
      this.setData({
        phone: value
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () { },

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