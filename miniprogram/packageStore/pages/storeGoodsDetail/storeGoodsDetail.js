// miniprogram/pages/goods/goods_detail.js
const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
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
    recommendGoods: [],
    imagesUrls: [],
    activityImageUrl: [],
    activityInfo: null,
    spike: null,
    store: null,
    introduce: [],
    countDown: [],
    swipeCurrent: 0,
    wechatId: "",
    collection: 2,
  },
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
        that.setData({
          collection: collection == 0 ? 1 : 0,
        })
      })
    }
  },
  addCart: function () {
    if (this.data.goods.price == 0) {
      wx.showToast({
        icon: "none",
        title: '请先咨询商家进行购买',
      })
      return;
    }
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
  goStore: function () {
    wx.redirectTo({
      url: "../storeDetail/storeDetail?id=" + this.data.store.id,
    })
  },
  goBuy: function () {
    if (this.data.goods.price == 0) {
      wx.showToast({
        icon: "none",
        title: '请先咨询商家进行购买',
      })
      return;
    }
    wx.navigateTo({
      url: "/pages/order/order_confirm/order_confirm?id=" + this.data.goods.id + '&productQty=1&storeId=' + this.data.goods.storeId + '&storeName=' + this.data.store.name,
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.scene) {
      var scene = decodeURIComponent(options.scene)
      var s = scene.split('@');
      options.goodsId = s[1];
      this.setData({
        options: options,
      });
    } else {
      this.setData({
        options: options,
      });
    }
    let data = {};
    let that = this;
    data.id = options.goodsId;
    httphelper.api("store/findStoreGoodsDetail", data, function (serverdata) {
      let setData = {};
      if (serverdata.code == 200) {
        setData.goods = serverdata.data.goods;
        setData.collection = (serverdata.data.collection != null) ? serverdata.data.collection : 2;
        setData.recommendGoods = serverdata.data.recommendGoods;
        setData.introduce = serverdata.data.goods.introduce.split("\r");
        console.log(setData.introduce);
        setData.imagesUrls = serverdata.data.imagesUrls;
        setData.store = serverdata.data.store;
        setData.store.price = parseInt(setData.store.ensurePrice) + parseInt(setData.store.virtualPrice);
        that.setData(setData);
        var guess_what = that.selectComponent('#guess_what');
        guess_what.setGoodsValue(setData.recommendGoods);
        var promise1 = new Promise(function (resolve, reject) {
          wx.getImageInfo({
            src: that.data.goods.listImageUrl,
            success: function (res) {
              console.log("goodsimageLoad")
              resolve(res);
            }
          })
        });
        var src = that.data.goods.price == 0 ? "/images/high_price.png" : 'https://img.ssw88.com/static/wechatImg/under_share.png';
        var promise2 = new Promise(function (resolve, reject) {
          wx.getImageInfo({
            src: src,
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

      } else {
        setTimeout(function () {
          common.goBack();
        }, 1500)
      }
    });
  },
  drawImage: function (res) {
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
    let str = '';
    for (var i = 0; i < that.data.introduce.length; i++) {
      str += that.data.introduce[i];
    }
    var flag = 5;
    var arr = [];
    for (var i = 0, len = str.length / flag; i < len && i < 10; i++) {
      let str1 = str.substr(flag * i, flag);
      if (i == 9) {
        str1 = str1.substr(0, flag - 1) + "...";
      }
      arr.push(str1);
    }
    for (var i = 0; i < arr.length; i++) {
      canvas.fillText(arr[i], 520, 48 * (i + 1)) //绘制文本
    }
    // canvas.setFillStyle('#ffe8c4');
    // let price = that.data.spike != null ? that.data.spike.spikePrice : that.data.goods.price;
    // if (that.data.goods.price != 0) {
    //   if (price < 1000) {
    //     canvas.setFontSize(64);
    //     canvas.fillText(price, 50, 530);
    //   } else if (price < 10000) {
    //     canvas.setFontSize(64);
    //     canvas.fillText(price, 40, 530);
    //   } else {
    //     canvas.setFontSize(54);
    //     canvas.fillText(price / 10000 + "万", 40, 530);
    //   }
    //   canvas.setFontSize(18);
    //   canvas.fillText(that.data.goods.marketPrice, 116, 564);
    // }

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
          that.setData({
            postUrl: res1.tempFilePath,
          })
        },
        fail: function (res1) {},
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
    // this.selectComponent('#guess_what').onQueryNext("store/findGoodsPageNum", { type: 0, id: this.data.store.id }, null);
  },

  onPageScroll: function (res) {
    let num = 0;
    num = (res.scrollTop / 140);
    if (num > 1) num = 1;
    //console.dir(num);
    this.selectComponent("#navbar").setOpacity(num);
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
      msg.image = this.data.imagesUrls[0];
      msg.path = "/packageStore/pages/storeGoodsDetail/storeGoodsDetail?goodsId=" + this.data.goods.id;
      msg.appPath = "/pages/store/storeGoodsDetail/storeGoodsDetail?goodsId=" + this.data.goods.id;
      common.goKefu('store' + this.data.store.id, this.data.store.name, this.data.store.icon, msg);
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let that = this;
    var id = getApp().userId;
    let name = null;
    if (this.data.goods.price == 0) {
      name = '[' + this.data.store.name + ']推荐' + common.makeShareText(3, that.data.goods.name);
    } else {
      name = '[' + this.data.store.name + ']推荐' + common.makeShareText(1, that.data.goods.name, that.data.goods.price);
    }
    return {
      title: name,
      path: '/packageStore/pages/storeGoodsDetail/storeGoodsDetail?scene=' + id + '@' + this.data.goods.id,
      imageUrl: that.data.postUrl
    }
  }
  /**
   * 分享到朋友圈
   */
  // onShareTimeline: function () {
  //   let that = this;
  //   var id = getApp().userId;
  //   let name = null;
  //   if (this.data.goods.price == 0) {
  //     name = '[' + this.data.store.name + ']推荐' + common.makeShareText(3, that.data.goods.name);
  //   } else {
  //     name = '[' + this.data.store.name + ']推荐' + common.makeShareText(1, that.data.goods.name, that.data.goods.price);
  //   }
  //   return {
  //     title: name,
  //     imageUrl: that.data.postUrl,
  //     query: 'userId=' + id + '&goodsId=' + this.data.goods.id,
  //   }
  // },
})