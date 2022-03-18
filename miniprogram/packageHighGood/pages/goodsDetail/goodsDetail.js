const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
const app = getApp();
let that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: 0,
    good: {},
    user: {},
    adviser: {},
    goodType: [
      '天然宝石',
      '天然玉石',
      '生物宝石'
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    if (options.scene) {
      var scene = decodeURIComponent(options.scene)
      var s = scene.split('@');
      this.setData({
        goodsId: s[1]
      });
    }else{
      if (options.id) {
        that.setData({
          goodsId: options.id
        })
      }
    }
    this.setData({
      bar_Height: app.bar_Height,
      user: app.user,
    })
  },
  onShow(e) {
    console.log(that.data.goodsId)
    if (that.data.goodsId) {
      httphelper.api("high/findHighGoodsById", {
        id: that.data.goodsId
      }, function (data) {
        if (data.code == 200) {
          if (data.data == null) {
            wx.reLaunch({
              url: '/pages/index/index',
            })
            return;
          }
          data.data.imageUrl = data.data.images ? data.data.images.split(',') : [];
          app.curHighGood = data.data;
          that.setData({
            good: data.data
          })
          if (app.exclusive) {
            that.findMyBroker();
          } else {
            common.findHighBrokerById(that.data.good.brokerId, (data) => {
              if (data.code == 200) {
                that.setData({
                  adviser: data.data
                })
              }
            })
          }
        }
      })
    } else {
      this.setData({
        good: app.curHighGood,
      })
      if (app.exclusive) {
        that.findMyBroker();
      } else {
        common.findHighBrokerById(that.data.good.brokerId, (data) => {
          if (data.code == 200) {
            that.setData({
              adviser: data.data
            })
          }
        })
      }
    }
  },
  findMyBroker(e) {
    httphelper.api("high/findExclusiveBroker", null, function (data) {
      if (data.code == 200) {
        app.exclusiveBroker = data.data;
        that.setData({
          adviser: data.data
        })
      }
    })
  },
  editGood(e) {
    wx.navigateTo({
      url: '../uploadGood/uploadGood?edit=1',
    })
  },
  onPageScroll: function (res) {
    let num = 0;
    num = (res.scrollTop / 140);
    if (num > 1) num = 1;
    this.selectComponent("#navbar").setOpacity(num);
  },
  chat(e) {
    let msg = {};
    msg.name = that.data.good.goodsName;
    msg.image = that.data.good.imageUrl[0];
    msg.path = "/packageHighGood/pages/goodsDetail/goodsDetail?id=" + this.data.good.id;
    msg.appPath = "/pages/highGood/goodsDetail/goodsDetail?id=" + this.data.good.id;
    common.goKefu(that.data.adviser.chatId, that.data.adviser.name, that.data.adviser.photoUrl, msg);
  },
  buy(e) {
    httphelper.api("high/createOrderToPageDetail", {
      id: that.data.good.id
    }, function (serverdata) {
      if (serverdata.code == 200) {
        app.highOrder = serverdata.data;
        wx.navigateTo({
          url: '../order/order',
        })
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var id = getApp().userId;
    let name = common.makeShareText(3, that.data.good.goodsName);
    return {
      title: name,
      path: '/packageHighGood/pages/goodsDetail/goodsDetail?userId=' + id + '&id=' + this.data.good.id + '&isShare=1',
      imageUrl: that.data.good.imageUrl[0]
    }
  },
  /**
   * 分享到朋友圈
   */
  onShareTimeline: function () {
    var id = getApp().userId;
    let name = common.makeShareText(3, that.data.good.goodsName);
    return {
      title: name,
      query: 'userId=' + id + '&id=' + this.data.good.id,
      imageUrl: that.data.good.imageUrl[0]
    }
  },
})