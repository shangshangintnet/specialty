// miniprogram/packageMyself/pages/myself/vCard/shareCard/shareCard.js
const httphelper = require('../../../../../httphelper.js');
var common = require("../../../../../common.js");
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    showOverlay: false,
    postUrl: "",
    showCanvas: true,
  },
  makeCall: function (e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.shareCode,
      success: function (res) {}
    })
  },
  drawPics: function () {

    let that = this;
    var canvas = wx.createCanvasContext('hoCanvas');


    wx.getImageInfo({
      src: "./images/share_bg.jpg",
      success: function (res) {
        canvas.setFillStyle('white')
        canvas.fillRect(0, 0, 750, 600);
        canvas.drawImage('/' + res.path, 0, 0, 750, 600);
        canvas.draw(true);
        that.step++;
        that.checkPics();
      }
    })
  },
  drawHead: function () {
    var that = this;
    var canvas = wx.createCanvasContext('hoCanvas');
    wx.getImageInfo({
      src: that.data.photo,
      success: function (res) {
        canvas.drawImage(res.path, 520, 80, 160, 160);
        canvas.draw(true);
      },
      complete: function () {
        wx.getImageInfo({
          src: "./images/bg_round.png",
          success: function (res) {
            canvas.drawImage('/' + res.path, 520, 80, 160, 160);
            canvas.draw(true);
            that.drawText();
          }
        })
      }
    })

  },
  drawText: function () {
    var canvas = wx.createCanvasContext('hoCanvas');
    canvas.setFillStyle('black');

    canvas.setFontSize(48);
    if (this.data.name != null) {
      canvas.fillText(this.data.name, 90, 140);
    }


    canvas.setFontSize(36);
    canvas.setFillStyle('#606060');
    if (this.data.position != null)
      canvas.fillText(this.data.position, 90, 190);

    canvas.setFillStyle('black');
    if (this.data.phone != null)
      canvas.fillText(this.data.phone, 90, 304);

    if (this.data.company != null)
      canvas.fillText(this.data.company, 90, 354);

    if (this.data.address != null)
      canvas.fillText(this.data.address, 90, 404);
    canvas.draw(true);

    this.step++;
    this.checkPics();

  },
  checkPics: function () {
    let that = this;
    if (that.step != 2) return;
    setTimeout(function () {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 750,
        height: 600,
        destWidth: 750,
        destHeight: 600,
        fileType: 'jpg',
        canvasId: 'hoCanvas',
        success: function (res1) {
          that.setData({
            postUrl: res1.tempFilePath,
          })
        },
        fail: function (res1) {
          console.log("makeFail");
        },
        complete: function () {
          that.setData({
            showCanvas: false
          })
        }
      }, that)
    }, 1000)

  },
  closeOverLay: function () {
    this.setData({
      showOverlay: false
    })
  },

  jumpTo: common.jumpTo,
  copyText: function (e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.shareCode,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      }
    })
  },
  saveWechatCode: function (e) {
    let that = this;
    wx.downloadFile({
      url: that.data.wechatCode, //仅为示例，并非真实的资源
      success (res) {
        if (res.statusCode === 200) {
          console.log(res.tempFilePath);
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) { 
              wx.showToast({
                title: '二维码已保存至手机相册',
              })
              setTimeout(() => {
                wx.hideToast({
                  complete: (res) => {},
                })
              }, 1000);
              wx.navigateTo({
                url: '../saveWechatCode/saveWechatCode',
              })
            }
          })
        }
      }
    })

  },
  saveContact: function () {
    let that = this;

    wx.downloadFile({
      url: that.data.photo, //仅为示例，并非真实的资源
      success(res) {
        console.dir(res);
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        if (res.statusCode === 200) {
          //res.tempFilePath
          wx.addPhoneContact({
            firstName: that.data.name,
            photoFilePath: res.tempFilePath,
            mobilePhoneNumber: that.data.phone,
            weChatNumber: that.data.wechatId,
            email: that.data.email,
            title: that.data.position,
            organization: that.data.company
          })
        }
      }
    })
  },
  openOverLay: function () {
    let that = this;
    that.setData({
      showOverlay: true
    })
  },
  getData: function () {
    let that = this;
    httphelper.api("myInformation/findUserBusinessCardById", {
      userId: this.data.userId
    }, function (server_data) {
      that.setData(server_data.data);
      that.step = 0;
      that.drawPics();
      that.drawHead();
      that.addContact();
    });
  },

  addContact: function () {
    if (getApp().userId != '' && getApp().userId != this.data.cardUserId) {
      httphelper.api("myInformation/addUserMiddleBusiness", {
        userId: this.data.userId
      }, function (server_data) {})
    } else {
      console.log("self")
    }
  },

  /**
   * 创建名片
   */
  createcreateCard: function () {
    wx.navigateTo({
      url: '../createCard/createCard',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getApp().isShare = 0;
    let that = this;
    if (options.scene) {
      //从服务端发布API识别图片进入应用
      var scene = decodeURIComponent(options.scene)
      var s = scene.split('@');
      //本次扫码进入的抽奖id
      this.setData({
        userId: s[1]
      })
    } else {
      this.setData(options);
    }
    //this.setData(options);

    if (!app.isShowLogin) {
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.getData();
      }
    } else {
      that.getData();
    }

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
    var id = getApp().userId;
    let name = common.makeShareText(8, that.data.name);
    return {
      title: name,
      path: '/packageMyself/pages/myself/vCard/shareCard/shareCard?&scene=' + id + '@' + this.data.userId,
      imageUrl: that.data.postUrl,
    }
  }
})