const httphelper = require('../../httphelper.js')
const common = require('../../common.js')
const app = getApp();
const url = "https://luck.ssw88.com/";

Page({

  /**
   * 页面的初始数据
   */

  data: {
    id: 1,
    show: false,
    showHelp: false,
    status: 0,
    data: {
      luckDrawStatus: 0,
      winningRate: 0
    },
    postUrl: '',
    erBcg: "",
    goods: {

    },
    goodsList: [
      []
    ],
    cur_status: 0,
    avatarUrl: ""
  },
  showPopup(e) {
    this.setData({
      show: true,
      goods: e.currentTarget.dataset.goods
    });
  },
  sendResult(data) {
    //    console.dir(data);
    let that = this;

    wx.request({
      url: url + "luckDraw/receiveRedPacket",
      data: {
        id: that.data.id,
        redPacket: data.detail.redPacket,
        redPacketEme: data.detail.redPacketEme,
        ssoToken: getApp().ssoToken,
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success(res) {
        // if (res.data.code == '200') {} else {
        //   // wx.showToast({
        //   //   title: res.data.msg,
        //   // })
        // }
        let redPacket = that.selectComponent("#redPacket");
        if (redPacket != null) redPacket.showResult();
        let str = "data.rainStatus"
        that.setData({
          [str]: 1
        })
      },
      fail(res) {
        console.log("request fail " + res.data);
      },
      complete(res) { }
    })
  },
  onClose() {
    this.setData({
      show: false
    });
  },
  showHelp: function () {
    this.setData({
      showHelp: true
    })
  },
  onCloseHelp() {
    this.setData({
      showHelp: false
    });
  },
  getRefresh: function () {
    let that = this;
    setTimeout(function () {
      that.onRefresh(null)
    }, 500)
  },
  onRefresh: function (callback = null) {
    let that = this;
    if (!app.isShowLogin) {
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
    }
    wx.request({
      url: url + "luckDraw/getLuckDrawDetails",
      data: {
        id: that.data.id,
        ssoToken: getApp().ssoToken,
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success(res) {
        if (res.data.code == '200') {
          let goodsList = res.data.data.luckDraw.goodsList;
          that.setData({
            data: res.data.data,
            goodsList: goodsList
          })
          that.getErCode();
        };
        if (res.data.code == '400') {
          setTimeout(function () {
            wx.switchTab({
              url: '/pages/index/index',
            })
          }, 2000)
          wx.showToast({
            title: '该期抽奖已结束',
            icon: 'none'
          })
        }
      },
      fail(res) {
        console.log("request fail " + res.data);
      },
      complete(res) {
        if (callback != null) {
          callback();
        }
      }
    })
  },
  getRedPacket: function () {

    let that = this;
    if (!app.isShowLogin) {
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      return;
    }

    this.onRefresh(function () {
      if (that.data.data.status == 0) {
        wx.showToast({
          title: '请先点击下方参与抽奖～',
          icon: 'none'
        })
        return;
      }

      let redPacket = that.selectComponent("#redPacket");
      if (redPacket != null) redPacket.showModal(that.data.data.luckDraw.redPacketEme, that.data.data.luckDraw.redPacket);
    })
  },
  jumpTo: function (e) {
    let that = this;
    if (that.data.data.status == 0) {
      wx.showToast({
        title: '请先点击下方参与抽奖～',
        icon: 'none'
      })
      return;
    }
    common.jumpTo(e);
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
        id: s[1]
      })
    } else {
      that.setData(options);
    }
    //this.onRefresh();
    wx.hideShareMenu();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //this.showPopup();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onRefresh();
  },
  click: function (event) {
    let that = this;
    console.log("inClick");


    this.setData({
      avatarUrl: event.detail.userInfo.avatarUrl
    })

    if (!app.isShowLogin) {
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.draw();
      }
      return;
    }
    console.log("inDraw");
    this.draw();
  },
  draw: function () {
    let that = this;
    wx.showLoading({
      title: '请稍后',
    })

    wx.request({
      url: url + "luckDraw/participationActivities",
      data: {
        ssoToken: getApp().ssoToken,
        imageUrl: that.data.avatarUrl,
        id: that.data.id
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success(res) {
        console.log('response');
        wx.showToast({
          title: res.data.msg,
          icon: "none"
        })
        if (res.data.code == '200') {
          that.onRefresh(() => {
            wx.stopPullDownRefresh();
          });
        }

        //token 过期
        if (res.data.code == '100') {
          getApp().ssoToken = '';
          let login = that.selectComponent("#login");
          if (login != null) login.showLoginModal();
          app.saveCall = function () {
            that.draw();
          }
        }
      },
      fail(res) {
        wx.hideLoading();
        console.log("request fail " + res.data);
      }
    })
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
    this.onRefresh(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  getErCode: function () {
    let that = this;
    let url = getApp().url + "myInformation/customSmallProgramCode?page=pages/prize/getPrize&scene=" + getApp().userId + "@" + that.data.id + "&ssoToken=" + getApp().ssoToken;
    wx.getImageInfo({
      src: url,
      success: function (res) {
        that.setData({
          erPath: res.path
        })
      },
      fail(e) {
        console.log(e)
      },
      complete: function () {
        console.log("erCode finish")
      }
    })
    wx.getImageInfo({
      src: "./images/erBcg.png",
      success: function (res) {
        console.log(res);
        that.setData({
          erBcg: res.path
        })
      },
      complete: function (res) {
        console.log(res);
      }
    })
  },
  closeOverLay: function () {
    this.setData({
      showOverlay: false
    })
  },
  openOverLay: function (e) {
    console.log(e);
    let that = this;
    if (that.data.data.status == 0) {
      wx.showToast({
        title: '请先点击下方参与抽奖～',
        icon: 'none'
      })
      return;
    }
    this.setData({
      postUrl: ''
    });
    var canvas = wx.createCanvasContext('hoCanvas');
    wx.getImageInfo({
      src: that.data.data.luckDrawPoster[0],
      success: function (res) {
        that.setData({
          currentPic: res.path,
          showCanvas: true
        })
        canvas.setFillStyle('white')
        canvas.fillRect(0, 0, 600, 960);
        canvas.drawImage(res.path, 0, 0, 600, 960);
        console.log(that.data.erBcg);
        canvas.drawImage('/' + that.data.erBcg, 445, 805, 150, 150);
        canvas.drawImage(that.data.erPath, 445, 805, 150, 150);
        canvas.draw(true, function () {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 600,
            height: 960,
            destWidth: 600,
            destHeight: 960,
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
            complete: function () { }
          }, that)
        });
      },
      complete: function () { }
    })

    that.setData({
      showOverlay: true
    })
  },
  saveImage() {
    let that = this;
    wx.saveImageToPhotosAlbum({
      filePath: that.data.postUrl,
      success(res) {
        that.closeOverLay();
        wx.showToast({
          title: '保存成功',
        })
      },
      fail(res) {
        console.log(res);
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})