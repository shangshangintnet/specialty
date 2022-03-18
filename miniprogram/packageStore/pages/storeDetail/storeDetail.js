// packageStore/pages/storeDetail/storeDetail.js
const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
const app = getApp();
let that;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    store: {}, //商铺信息
    goods: [], //商铺商品
    appGoods: [], //平台商品
    followStatus: 0, //关注
    active: 0, //当前展示
    storeId: 17, //商铺id
    guessingId: 0,
    spike: {},
    appGoodsEmy: false,
    storeGoodsEmy: false,
    store_index: 1, //商铺商品页码
    plat_index: 1, //平台商品页码
    imgStore: [
      'https://img.ssw88.com/share/share_guessing.jpg',
      'https://img.ssw88.com/share/share_poster.jpg',
      'https://img.ssw88.com/share/share_red.jpg',
      'https://img.ssw88.com/share/share_spike.jpg'
    ],
    current: 0,
    canvasShow: false,
    codeImg: '',
    storeIcon: '',
    storeUserIcon: '',
    autoplay: true,
    popup_share: false,
    hour: '',
    min: '',
    seconds: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    if (options.scene) {
      var scene = decodeURIComponent(options.scene)
      let s = [];
      s = scene.split('@');
      this.setData({
        storeId: s[1]
      });
    } else {
      this.setData({
        storeId: options.id
      });
    }
    this.getData();
  },
  onPageScroll: function (res) {
    let num = 0;
    num = res.scrollTop / 120;
    if (num > 1) num = 1;
    this.selectComponent("#navbar").setOpacity(num);
  },
  onReachBottom: function () {
    const data = {};
    data.id = that.data.storeId;
    data.type = that.data.active;
    if (that.data.active == 0) {
      if (that.data.storeGoodsEmy)
        return;
      that.data.store_index++;
      data.page = that.data.store_index;
      that.onReachStore(data);
    } else {
      if (that.data.appGoodsEmy)
        return;
      that.data.plat_index++;
      data.page = that.data.plat_index;
      that.onReachPlatForm(data);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let url = getApp().url + "myInformation/customSmallProgramCode?page=packageStore/pages/storeDetail/storeDetail&scene=" + app.userId + "@" + this.data.storeId + "&ssoToken=" + getApp().ssoToken;
    wx.getImageInfo({
      src: url,
      success: function (res) {
        that.setData({
          codeImg: res.path
        })
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },

  getData() {
    httphelper.api('store/findStoreDetailPage', {
      id: that.data.storeId
    }, (serverData) => {
      serverData.data.store.price = parseInt(serverData.data.store.ensurePrice) + parseInt(serverData.data.store.virtualPrice);
      that.setData({
        goods: serverData.data.goods,
        appGoods: serverData.data.appGoods,
        store: serverData.data.store,
        followStatus: serverData.data.followStatus,
        spike: serverData.data.spike,
        guessingId: serverData.data.guessingId,
      })
      if (that.data.store.userImageUrl != null) {
        wx.getImageInfo({
          src: that.data.store.userImageUrl,
          success: function (res) {
            that.setData({
              userPhoto: res.path
            })
          },
        })
      }
      if (that.data.goods.length == 0 && that.data.appGoods.length != 0) {
        that.setData({
          active: 1
        })
      }
      if (that.data.goods != null && that.data.goods.length > 0)
        that.selectComponent("#store_goods").setGoodsValue(that.data.goods);
      else {
        that.setData({
          storeGoodsEmy: true
        })
      }
      if (that.data.appGoods != null && that.data.appGoods.length > 0)
        that.selectComponent("#app_goods").setGoodsValue(that.appGoods);
      else {
        that.setData({
          appGoodsEmy: true
        })
      }
      that.refresh_time();
    });
  },
  //倒计时
  refresh_time: function () {
    let now = this.data.spike.times;
    this.timeStamp(now);
    let timer = setInterval(function () {
      --now;
      if (now > 0) {
        that.timeStamp(now);
      } else {
        clearInterval(timer);
      }
    }, 1000);
  },
  timeStamp: function (second_time) {
    var hour = parseInt(second_time / 3600);
    var min = parseInt(second_time / 60) % 60;
    var seconds = second_time % 60;
    this.setData({
      hour: hour > 9 ? hour : '0' + hour,
      min: min > 9 ? min : '0' + min,
      seconds: seconds > 9 ? seconds : '0' + seconds
    })
  },
  addAttention() {
    httphelper.api("store/storeAttention", {
      id: that.data.storeId
    }, (serverData) => {
      wx.showToast({
        icon: 'none',
        title: serverData.msg
      });
      if (serverData.code == 200) {
        let key = "store.followNum";
        that.setData({
          followStatus: 1,
          [key]: that.data.store.followNum + 1
        })
      }
    });
  },
  removeAttention() {
    httphelper.api("store/storeRemoveAttention", {
      id: that.data.storeId
    }, (serverData) => {
      wx.showToast({
        icon: 'none',
        title: serverData.msg
      });
      if (serverData.code == 200) {
        let key = "store.followNum";
        that.setData({
          followStatus: 0,
          [key]: that.data.store.followNum - 1
        })
      }
    });
  },
  jumpToSpike() {
    wx.navigateTo({
      url: '/pages/limitBuy/limitBuy',
    });
  },
  jumpToActivity() {
    wx.navigateTo({
      url: '/pages/activity/activity?guessingId=' + this.data.guessingId,
    });
  },
  jumpToRedPackage() {
    wx.navigateTo({
      url: '/packageActivity/pages/redPacketRain/redPacketRain',
    });
  },
  goHome() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  onReachStore(data) {
    this.selectComponent("#store_goods").onQueryNext("store/findGoodsPageNum", data, null);
  },
  onReachPlatForm(data) {
    this.selectComponent("#app_goods").onQueryNext("store/findGoodsPageNum", data, null);
  },
  shareShow() {
    this.setData({
      popup_share: true
    })
  },
  switchActive(e) {
    let act = parseInt(e.currentTarget.dataset.act);
    if (this.data.active == act) return;
    this.setData({
      active: act
    })
  },
  changeImg: function (event) {
    this.setData({
      current: event.detail.current
    })
  },
  cancel() {
    this.setData({
      popup_share: false
    })
  },
  shareImg: function (e) {
    let index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      autoplay: false,
      canvasShow: true
    })
    wx.showLoading({
      title: '图片生成中~',
      duration: 6000,
      mask: true
    });
    const query = wx.createSelectorQuery().in(this);
    query.select('#sss').boundingClientRect(data => {
      const ctx = wx.createCanvasContext('shareCanvas')
      if (that.data.current == 4) {
        const wxGetImageInfo = this.promisify(wx.getImageInfo)
        Promise.all([
          wxGetImageInfo({
            src: that.data.store.imageUrl
          }),
          wxGetImageInfo({
            src: 'https://img.ssw88.com/share/share_shop.png'
          }),
          wxGetImageInfo({
            src: that.data.store.icon
          })
        ]).then(res => {
          ctx.drawImage(res[0].path, 0, 0, 375, 200);
          ctx.drawImage(res[1].path, 0, 150, 375, 517);
          ctx.drawImage(res[2].path, 147, 150, 81, 81);
          ctx.drawImage(that.data.codeImg, 275, 363, 80, 80);
          ctx.setFontSize(14);
          ctx.setFillStyle('#404040');
          ctx.setTextAlign('center')
          ctx.fillText(that.data.store.name, 187.5, 255);
          ctx.setFontSize(12);
          if (that.data.store.content.length > 26) {
            ctx.fillText(that.data.store.content.substring(0, 26), 187.5, 280);
            ctx.fillText(that.data.store.content.substring(26), 187.5, 300);
          } else {
            ctx.fillText(that.data.store.content, 187.5, 280);
          }
          ctx.setFontSize(16);
          ctx.setTextAlign('left')
          ctx.fillText(that.data.store.contacts, 84, 390);
          ctx.setFontSize(14);
          ctx.fillText(that.data.store.position, 84, 420);
          ctx.setFillStyle('#606060');
          ctx.fillText(that.data.store.storePhone, 66, 473);
          ctx.fillText(that.data.store.wechatId, 66, 507);
          ctx.fillText(that.data.store.email, 66, 541);
          let address = that.data.store.areaName + that.data.store.address;
          if (address.length > 20) {
            ctx.fillText(address.substring(0, 20), 66, 570);
            ctx.fillText(address.substring(20), 66, 590);
          } else {
            ctx.fillText(address, 66, 576);
          }
          ctx.save();
          ctx.beginPath();
          ctx.arc(48, 398, 30, 0, 2 * Math.PI);
          ctx.clip();
          if (that.data.userPhoto != null) {
            ctx.drawImage(that.data.userPhoto, 18, 368, 60, 60);
          } else {
            ctx.drawImage('/images/user-unlogin.png', 18, 368, 60, 60);
          }
          ctx.restore();
        });
      } else {
        const wxGetImageInfo = this.promisify(wx.getImageInfo)
        Promise.all([
          wxGetImageInfo({
            src: that.data.imgStore[that.data.current]
          }),
          wxGetImageInfo({
            src: that.data.store.icon
          })
        ]).then(res => {
          ctx.drawImage(res[0].path, 0, 0, 375, 667);
          ctx.setFontSize(14);
          ctx.setFillStyle('#FFFFFF');
          ctx.fillText(that.data.store.name, 96, 50);
          ctx.setFontSize(10);
          if (that.data.store.content.length > 26) {
            ctx.fillText(that.data.store.content.substring(0, 26), 96, 70);
            ctx.fillText(that.data.store.content.substring(26), 96, 85);
          } else {
            ctx.fillText(that.data.store.content, 96, 80);
          }
          ctx.drawImage(that.data.codeImg, 281, 543, 80, 80);
          ctx.save();
          ctx.beginPath();
          ctx.arc(50, 60, 30, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(res[1].path, 20, 30, 60, 60);
          ctx.restore();
        });
      }
      setTimeout(() => {
        ctx.draw(false, () => {
          that.tempFileImage(index);
        });
      }, 1500);
    }).exec();
  },
  tempFileImage(index) {
    wx.canvasToTempFilePath({
      canvasId: 'shareCanvas',
      success: (res) => {
        common.shareImg(index, res.tempFilePath, (res, isSuccess) => {
          wx.hideLoading();
          wx.showToast({
            title: res,
            duration: 2000
          });
          that.setData({
            canvasShow: false,
            autoplay: true
          })
        });
      },
      fail: function () {
        wx.hideLoading();
      }
    })
  },
  //这是一个封装好的方法
  promisify: api => {
    return (options, ...params) => {
      return new Promise((resolve, reject) => {
        const extras = {
          success: resolve,
          fail: reject
        }
        api({
          ...options,
          ...extras
        }, ...params)
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
      common.goKefu('store' + this.data.storeId, this.data.store.name, this.data.store.icon);
    }
  },
  goChatroom: function () {
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
      //订阅房间
      var imService = app.globalData.imService;
      //进入房间 服务器
      httphelper.api("classification/addChatRoom", {
        uuid: imService.currentUser.uuid,
        storeId: that.data.storeId
      }, (serverData) => {
        if (serverData.code == 200) {
          serverData.data.uuid = "chatRoom" + serverData.data.uuid;
          common.goChatRoom(serverData.data);
        }
      });
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.store.name,
      path: '/packageStore/pages/storeDetail/storeDetail?id=' + this.data.store.id + '&userId=' + app.userId
    }
  },
})