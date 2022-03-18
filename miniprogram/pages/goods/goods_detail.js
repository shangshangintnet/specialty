// miniprogram/pages/goods/goods_detail.js
const httphelper = require('../../httphelper.js');
const common = require('../../common.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    needDisplay: false,
    goods: {
      name: ""
    },
    isVideo: false,
    activityImageUrl: [],
    activityInfo: null,
    spike: null,
    countDown: [],
    swipeCurrent: 0,
    wechatId: "",
    show: false,
    collection: 2,
  },
  changeVideo: function () {
    this.setData({
      isVideo: true
    })
  },
  makeLoop: function () {
    this.timeCount = [];
    let that = this;
    that.clearLoop();
    if (this.data.spike != null) {
      that.refresh_time(0, this.data.spike.times);
    }
  },
  clearLoop: function () {
    let that = this;
    if (that.timeCount != undefined && that.timeCount[0] != undefined) {
      clearInterval(that.timeCount[0]);
    }
  },
  refresh_time: function (index, time) {
    let that = this;
    let str = "countDown[" + index + "]";
    let tmp = common.timeStamp(time);
    that.setData({
      [str]: tmp
    })
    that.timeCount[index] = setInterval(function () {
      --time;
      if (time > 0) {
        that.setData({
          [str]: common.timeStamp(time)
        })
      } else {
        clearInterval(that.timeCount[index]);
        that.getData();
      }
    }, 1000)
  },
  copyText: common.copyText,
  checkLogin: function () {
    if (app.ssoToken == "") {
      if (this.data.swipeCurrent == 0) {
        this.setData({
          swipeCurrent: 1
        })
      }
      let toLogin = this.selectComponent("#toLogin");
      toLogin.showLoginModal();
      return false;
    }
    return true;
  },
  toggleFavour: function () {
    if (this.checkLogin()) {
      let that = this;
      let collection = this.data.collection;
      if (collection == 2) return;
      common.toggleFavour(collection, this.data.goods.id, function (data) {
        // console.dir(data);
        that.setData({
          collection: collection == 0 ? 1 : 0,
        })
      })
    }
  },
  goKefu: function () {
    if (app.globalData.userInfo == null) {
      wx.showModal({
        title: '登录或注册上商',
        content: '当前操作需要登录以后才能使用',
        confirmText: "前往登录",
        success: function (res) {
          if (res.confirm) {
            wx.reLaunch({
              url: '/pages/myself/myself',
            })
          }
        },
      })
    } else {
      let msg = {};
      msg.name = this.data.goods.name;
      msg.image = this.data.videoImagesUrls[1];
      msg.path = "/pages/goods/goods_detail?goodsId=" + this.data.goods.id;
      msg.appPath = "/pages/goods/goods_detail?goodsId=" + this.data.goods.id;
      common.goKefu('store' + this.data.storeId, this.data.storeName, this.data.storeIcon, msg);
    }
  },
  addCart: function () {
    if (this.checkLogin()) {
      common.addCart(this.data.goods.id);
    }
  },
  jumpTo: function (e) {
    if (this.checkLogin()) {
      common.jumpTo(e);
    }
  },
  navigateTo: function (e) {
    if (this.checkLogin()) {
      common.navigateTo(e);
    }
  },
  getData: function () {
    let data = {};
    let that = this;
    data.goodsId = this.data.options.goodsId;
    data.firstTypeId = (this.data.options.firstTypeId == undefined) ? 0 : this.data.options.firstTypeId;
    httphelper.api("classification/queryCommodityDetails", data, function (serverdata) {
      let setData = {};
      if (serverdata.code == 200) {
        setData.videoImagesUrls = serverdata.data.videoImagesUrls;
        setData.goods = serverdata.data.goods;
        setData.wechatId = serverdata.data.wechatId;
        setData.collection = (serverdata.data.collection != null) ? serverdata.data.collection : 2;
        setData.extravagant = serverdata.data.extravagant;
        setData.specification = serverdata.data.specification;
        setData.show = true;
        setData.spike = serverdata.data.spike != undefined ? serverdata.data.spike : null;
        setData.activityImageUrl = serverdata.data.activityImageUrl != null ? serverdata.data.activityImageUrl.split(",") : [];
        that.setData(setData);
        var detail = that.selectComponent('#detail');
        detail.setGoodsDetails(serverdata.data.specification, serverdata.data.imagesUrls);
        that.makeLoop();
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.dir(options);
    if (options.scene) {
      var scene = decodeURIComponent(options.scene)
      var s = scene.split('@');
      options.goodsId = s[1];
      this.setData({
        options: options
      });
    } else {
      this.setData({
        options: options
      });
    }
    let data = {};
    let that = this;
    data.goodsId = options.goodsId;
    data.firstTypeId = (options.firstTypeId == undefined) ? 0 : options.firstTypeId;
    httphelper.api("classification/queryCommodityDetails", data, function (serverdata) {
      let setData = {};
      if (serverdata.code == 200) {
        setData.videoImagesUrls = serverdata.data.videoImagesUrls;
        setData.goods = serverdata.data.goods;
        setData.wechatId = serverdata.data.wechatId;
        setData.collection = (serverdata.data.collection != null) ? serverdata.data.collection : 2;
        setData.extravagant = serverdata.data.extravagant;
        setData.specification = serverdata.data.specification;
        setData.spike = serverdata.data.spike != undefined ? serverdata.data.spike : null;
        setData.activityImageUrl = serverdata.data.activityImageUrl != null ? serverdata.data.activityImageUrl.split(",") : [];
        setData.activityInfo = serverdata.data.activityInfo != null ? serverdata.data.activityInfo : null;
        setData.show = true;
        setData.storeId = serverdata.data.storeId;
        setData.storeIcon = serverdata.data.storeIcon;
        setData.storeName = serverdata.data.storeName;
        that.setData(setData);
        var detail = that.selectComponent('#detail');
        detail.setGoodsDetails(serverdata.data.specification, serverdata.data.imagesUrls);
        that.selectComponent('#guess_what').setGoodsValue(serverdata.data.similars);
        var promise1 = new Promise(function (resolve, reject) {
          wx.getImageInfo({
            src: that.data.videoImagesUrls[1],
            success: function (res) {
              resolve(res);
            }
          })
        });
        var src = that.data.extravagant == 1 ? "/images/high_price.png" : 'https://img.ssw88.com/static/wechatImg/under_share.png';
        src = that.data.spike != null ? "/images/second_price.png" : src;
        var promise2 = new Promise(function (resolve, reject) {
          wx.getImageInfo({
            src: src,
            success: function (res) {
              resolve(res);
            },
            fail: function (res) {
            }
          })
        });
        that.makeLoop();
        Promise.all([
          promise1, promise2
        ]).then(function (res) {
          that.drawImage(res);
        });
      } else {
        httphelper.api("store/findStoreGoodsDetail", {
          id: data.goodsId
        }, function (server) {
          let setData = {};
          if (server.code == 200) {
            wx.reLaunch({
              url: '/packageStore/pages/storeGoodsDetail/storeGoodsDetail?scene=1@' + data.goodsId
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: serverdata.msg,
              duration: 3000
            });
            that.setData({
              show: true
            })
            setTimeout(function () {
              common.goBack();
            }, 1500)
          }
        })
      }
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
    canvas.drawImage(res[0].path, 0, 0, 500, 500);
    canvas.drawImage(res[1].path, 0, 391, 750, 209);
    canvas.setFillStyle('black')
    //canvas.setFillStyle('#5F6FEE')//文字颜色：默认黑色
    canvas.setFontSize(40) //设置字体大小，默认10

    let str = that.data.specification[that.data.specification.length - 1].value;
    var flag = 5;
    var arr = [];
    for (var i = 0, len = str.length / flag; i < len && i < 10; i++) {
      let str1 = str.substr(flag * i, flag);

      if (i == 9) {
        str1 = str1.substr(0, flag - 1) + "...";
      }
      arr.push(str1);
    }
    // console.dir(arr);

    for (var i = 0; i < arr.length; i++) {
      canvas.fillText(arr[i], 520, 48 * (i + 1)) //绘制文本
    }

    canvas.setFillStyle('#ffe8c4');

    let price = that.data.spike != null ? that.data.spike.spikePrice : that.data.goods.price;
    //调用draw()开始绘制
    canvas.draw(true, () => {

      let px2rpx = (750 / wx.getSystemInfoSync().windowWidth);

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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.errMsg != "") {
      wx.showToast({
        icon: 'none',
        title: app.errMsg,
        duration: 3000
      });
      app.errMsg = "";
    }
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
    this.clearLoop();
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
    // this.selectComponent('#guess_what').onQueryNext("classification/queryGoodJade", null, "goodJadeList");
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
    var id = getApp().userId;
    let name = common.makeShareText(that.data.spike != null ? 2 : 1, that.data.goods.name, (that.data.spike != null ? that.data.spike.spikePrice : that.data.goods.price));
    if (that.data.extravagant == 1) {
      name = common.makeShareText(3, that.data.goods.name);
    }
    return {
      title: name,
      path: '/pages/goods/goods_detail?userId=' + id + '&goodsId=' + this.data.goods.id + '&isShare=1',
      imageUrl: that.data.postUrl
    }
  },
  /**
   * 分享到朋友圈
   */
  onShareTimeline: function () {
    let that = this;
    var id = getApp().userId;
    let name = common.makeShareText(that.data.spike != null ? 2 : 1, that.data.goods.name, (that.data.spike != null ? that.data.spike.spikePrice : that.data.goods.price));
    if (that.data.extravagant == 1) {
      name = common.makeShareText(3, that.data.goods.name);
    }
    return {
      title: name,
      imageUrl: that.data.postUrl,
      query: 'userId=' + id + '&goodsId=' + this.data.goods.id,
    }
  },
})