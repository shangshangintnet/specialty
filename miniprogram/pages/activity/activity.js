// miniprogram/pages/activity/activity.js
const httphelper = require('../../httphelper.js')
const common = require('../../common.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    guess_money: 0,
    timeOut: 0,
    swipeCurrent: 0,
    guessingState: 0,
    winningList: [{
      winningName: "",
    }],
    day: 0,
    hour: 0,
    min: 0,
    second: 0,
    guessing: {
      price: '',
      startTime: '',
      endTime: '',
      lotteryTime: ''
    },
    activityState: 0,
    videoImagesUrls: [],
    imagesUrls: [],
    lastWin: {
      winningName: "",
    },
    showHelp:false,
  },
  refresh_time: function () {
    var that = this;
    var now = this.data.countDown;

    that.setData({
      countDown: now
    })

    if (this.data.countDown == 0) {
      that.setData({
        timeOut: 1
      })
    }

    this.timeStamp(now);
    this.timeCount = setInterval(function () {
      --now;
      if (now > 0) {
        that.setData({
          countDown: now
        })
        that.timeStamp(now);
      } else {
        clearInterval(that.timeCount);
        if (that.data.timeOut == 0) {
          that.setData({
            timeOut: 1
          });
          that.reloadPage();
        }
      }
    }, 1000)
  },
  getRules: function () {
    wx.showModal({
      title: '活动规则',
      content: '1. 根据商品的视频、图片以及规格等详细信息,估算商品价格，价格最接近且时间最快的用户即可提走该商品。\r\n\r\n2. 本活动每周一次，周一至周六为竞猜时间，周日进行开奖。\r\n\r\n3. 参与竞猜活动时，需花费一定数额的翡翠币。\r\n\r\n若没有翡翠币，您可以通过以下方式获取大量翡翠币:\r\n\r\n分享APP给您的好友，每成功分享一个用户就可以获得100个翡翠币;\r\n\r\n下载APP完成任务每月可以获得500+翡翠币。',
    })
  },
  onHelp: function () { //help-model

    if (this.data.emdEmeraldCount < this.data.guessing.price) {
      wx.showModal({
        title: '抱歉,您的翡翠币不足~',
        content: '下载App获取更多翡翠币',
        confirmText: "立刻前往",
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/loadApp/loadApp'
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      this.selectComponent("#model").show();
    }
  },
  bindNum: function (e) {
    this.setData({
      guess_money: e.detail.value
    })
  },
  commitMoney: function () {
    let data = {};
    let that = this;
    data.guessingId = this.data.guessing.id;
    data.competitionPrice = this.data.guess_money;

    if (isNaN(this.data.guess_money) || this.data.guess_money == 0) {
      wx.showToast({
        icon: 'none',
        title: '请输入正确的竞猜数字',
      })
      this.selectComponent("#model").show();
      return;
    }
    httphelper.api("activity/addAGuessRecord", data, (server_data) => {
      // console.dir(server_data);
      that.setData({
        isOpen: false,
      })

      if (server_data.code == 200) {
        that.setData({
          competitionPrice: this.data.guess_money
        })

        wx.showToast({
          title: '提交竞猜成功',
        })

        setTimeout(function () {
          that.reloadPage();
        }, 1000)

      }
    })
  },
  onClose: function () {
    this.setData({
      isOpen: false
    })
  },
  reloadPage: function () {
    var that = this;
    let data = {};
    data.guessingId = this.data.options.guessingId;
    if (getApp().ssoToken == "") {
      httphelper.api("activity/findGuessingCompetition", data, (serverdata) => {
        that.setData({
          lastWin: serverdata.data.winningList
        })
        delete serverdata.data.winningList;
        that.setData(serverdata.data);
        var detail = that.selectComponent('#detail');
        detail.setGoodsDetails(serverdata.data.specification, serverdata.data.imagesUrls);
        that.refresh_time();
        that.onGetImage();
      })
    } else {
      httphelper.api("activity/queryGuessingCompetition", data, (serverdata) => {

        that.setData({
          lastWin: serverdata.data.winningList
        })
        delete serverdata.data.winningList;
        that.setData(serverdata.data);

        var detail = that.selectComponent('#detail');
        detail.setGoodsDetails(serverdata.data.specification, serverdata.data.imagesUrls);
        that.refresh_time();
        that.onGetImage();
      })
      this.onQueryPastReview();
    }

  },
  onGetImage: function () {
    let that = this;

    var promise1 = new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: that.data.videoImagesUrls[1],
        success: function (res) {
          resolve(res);
        }
      })
    });

    var promise2 = new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: 'https://img.ssw88.com/wechatImg/share_guess.png',
        success: function (res) {
          resolve(res);
        },
        fail: function (res) {
          // console.dir(res);
        }
      })
    });

    Promise.all([
      promise1, promise2
    ]).then(function (res) {
      // console.dir(res);
      that.drawImage(res);
    });
  },

  drawImage: function (res) {
    // console.dir(res);
    let that = this;
    that.setData({
      needDisplay: true
    })
    /* 图片获取成功才执行后续代码 */
    var canvas = wx.createCanvasContext('hoCanvas');
    canvas.setFillStyle('white')
    canvas.fillRect(0, 0, 750, 600);
    // 绘制背景图

    let px2rpx = (750 / wx.getSystemInfoSync().windowWidth);

    canvas.drawImage(res[0].path, 0, 0, 750, 600);
    canvas.drawImage(res[1].path, 0, 400, 750, 209);
    canvas.setFillStyle('black')
    //canvas.setFillStyle('#5F6FEE')//文字颜色：默认黑色
    canvas.setFontSize(40) //设置字体大小，默认10


    //调用draw()开始绘制
    canvas.draw(true, () => {
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
          // console.dir(res1);
          that.setData({
            postUrl: res1.tempFilePath,
          })
          // console.dir(that.data.postUrl);
        },
        fail: function (res1) {
          // console.dir(res1);
        },
        complete: function () {
          that.setData({
            needDisplay: false
          })
        }
      }, that)
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    this.setData({
      options: options
    })
    // wx.hideShareMenu();
    this.reloadPage();
    if (!app.isShowLogin) {
      this.setData({
        swipeCurrent: 1
      })
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.reloadPage();
      }

    }
  },

  timeStamp: function (second_time) {
    var data = {};
    let that = this;
    data.day = "00";
    data.hour = "00";
    data.min = "00";
    data.second = "00";

    var time = parseInt(second_time) + "秒";
    if (parseInt(second_time) > 60) {

      var second = parseInt(second_time) % 60;
      var min = parseInt(second_time / 60);
      time = min + "分" + second + "秒";

      if (min > 60) {
        min = parseInt(second_time / 60) % 60;
        var hour = parseInt(parseInt(second_time / 60) / 60);
        time = hour + "小时" + min + "分" + second + "秒";

        if (hour > 24) {
          hour = parseInt(parseInt(second_time / 60) / 60) % 24;
          var day = parseInt(parseInt(parseInt(second_time / 60) / 60) / 24);
          time = day + "天" + hour + "小时" + min + "分" + second + "秒";
          data.day = that.formatNumber(day);
        }

        data.hour = that.formatNumber(hour);
      }

      data.second = that.formatNumber(second);
      data.min = that.formatNumber(min);
    }
    this.setData(data);
  },
  formatNumber: function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  },
  onQueryPastReview: function () {
    let that = this;
    httphelper.api("activity/queryPastReview", null, (server_data) => {
      // console.dir(server_data);
      if (server_data.code == 200) {
        that.setData({
          winningList: server_data.data.winningList
        });
      }

    })
  },
  onGetPastReview: function () {
    this.showHelp();
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
    clearInterval(this.timeCount);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

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

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  onPageScroll: function (res) {
    let num = 0;

    num = (res.scrollTop / 140);
    if (num > 1) num = 1;

    this.selectComponent("#navbar").setOpacity(num);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let that = this;
    console.log(getApp().userId);
    var id = getApp().userId;
    let name = common.makeShareText(4);
    return {
      title: name,
      path: '/pages/activity/activity?userId=' + id + '&guessingId=' + this.data.options.guessingId,
      imageUrl: that.data.postUrl,
      success: function (res) {
        //分享成功

      },
      fail: function (res) {
        //分享失败
      }
    }
  }
})