// miniprogram/packageMyself/pages/myself/vCard/showCard/showCard.js
const httphelper = require('../../../../../httphelper.js');
var common = require("../../../../../common.js");
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardUserId: '',
    postUrl: '',
    showCanvas: true,
  },

  getData: function () {
    let that = this;
    console.dir(this.data.cardUserId);
    httphelper.api("myInformation/findUserBusinessCardById", {
      userId: this.data.cardUserId
    }, function (server_data) {
      that.setData(server_data.data);
      let url = getApp().url + "myInformation/customSmallProgramCode?page=packageMyself/pages/myself/vCard/shareCard/shareCard&scene=" + getApp().userId + "@" + that.data.cardUserId + "&ssoToken=" + getApp().ssoToken;
      that.setData({
        erCode: url
      })
      that.drawErCode();
      that.drawHead();
      that.addContact();
    });
  },
  drawPics: function () {
    var canvas = wx.createCanvasContext('hoCanvas');
    wx.getImageInfo({
      src: "./images/idCard.jpg",
      success: function (res) {
        console.log(res);
        canvas.drawImage('/' + res.path, 0, 0, 750, 806);
        canvas.draw(true);
      }
    })
    // 绘制背景图
  },
  drawHead: function () {
    var that = this;
    var canvas = wx.createCanvasContext('hoCanvas');
    wx.getImageInfo({
      src: that.data.photo,
      success: function (res) {
        console.log(res);
        canvas.drawImage(res.path, 540, 80, 120, 120);
        canvas.draw(true);
      },
      complete: function () {
        wx.getImageInfo({
          src: "./images/bg_round.png",
          success: function (res) {
            canvas.drawImage('/' + res.path, 540, 80, 120, 120);
            canvas.draw(true);
          }
        })
      }
    })
  },
  drawErCode: function () {
    var that = this;
    var canvas = wx.createCanvasContext('hoCanvas');
    wx.getImageInfo({
      src: that.data.erCode,
      success: function (res) {
        canvas.drawImage(res.path, 100, 490, 220, 220);
        canvas.draw(true);
      },
      complete: function () {
        that.drawText();
      }
    })
  },
  saveImg: function () {
    let that = this;
    console.log(that.data.postUrl);
    wx.saveImageToPhotosAlbum({
      filePath: that.data.postUrl,
      success(res) {
        wx.showToast({
          title: '保存成功',
        })
      },
      fail(res) {
        console.log(res);
      }
    })
  },
  drawText: function () {
    let that = this;
    var canvas = wx.createCanvasContext('hoCanvas');
    canvas.setFillStyle('black');

    canvas.setFontSize(40);
    if (this.data.name != null)
      canvas.fillText(this.data.name, 100, 130);

    canvas.setFillStyle('#606060');
    canvas.setFontSize(32);
    if (this.data.position != null)
      canvas.fillText(this.data.position, 100, 180);
    if (this.data.phone != null)
      canvas.fillText(this.data.phone, 100, 270);
    if (this.data.company != null)
      canvas.fillText(this.data.company, 100, 320);
    if (this.data.address != null)
      canvas.fillText(this.data.address, 100, 370);
    canvas.setFillStyle('#AD8209');
    canvas.fillText("【长按·扫码】", 100, 740);
    console.log("drawText");
    canvas.draw(true);


    setTimeout(function () {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 750,
        height: 806,
        destWidth: 750,
        destHeight: 806,
        fileType: 'jpg',
        canvasId: 'hoCanvas',
        success: function (res1) {
          console.log("makeSuccess");
          console.dir(res1);
          that.setData({
            postUrl: res1.tempFilePath,
            showCanvas: false
          })
          console.dir(that.data.postUrl);
        },
        fail: function (res1) {
          console.log("makeFail");
        },
        complete: function () {}
      }, that)
    }, 1000)
  },
  addContact: function () {
    if (getApp().userId != '' && getApp().userId != this.data.cardUserId) {
      httphelper.api("myInformation/addUserMiddleBusiness", {
        userId: this.data.cardUserId
      }, function (server_data) {
        console.log(server_data);
      })
    } else {
      console.log("self")
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    let that = this;
    if (options.scene) {
      //从服务端发布API识别图片进入应用
      var scene = decodeURIComponent(options.scene)
      var s = scene.split('@');
      //本次扫码进入的抽奖id
      that.setData({
        cardUserId: s[1]
      })
    } else {
      that.setData(options);
    }

    if (!app.isShowLogin) {
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.getData();
        that.drawPics();
      }
    } else {
      that.getData();
      that.drawPics();
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

  }
})