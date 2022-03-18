// packageStoreFamous/pages/storeFamous/storeFamous.js
const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
const app = getApp();
let that;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    famousUser: {}, //名家信息
    goods: [], //名家作品
    appGoods: [], //咨询
    followStatus: 0, //关注
    active: 2, //当前展示
    famousId: 1, //商铺id
    appGoodsEmy: true,
    storeGoodsEmy: true,
    beMore:false,
    appBeMore:false,
    store_index: 1, //作品页码
    plat_index: 1, //动态页码
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
        famousId: s[1]
      });
    } else {
      this.setData({
        famousId: options.id
      });
    }
    this.getData();
  },
  onReachBottom: function () {
    if (that.data.active == 0) {
      if (that.data.beMore) return;
      if (that.data.storeGoodsEmy)
        return;
      that.data.store_index++;
      that.data.pageNum = that.data.store_index;
      httphelper.api("storeFamous/getGoods", {
        pageNum: that.data.pageNum++,
        type: that.data.active,
        id:that.data.famousId,
      }, (serverData) => {
        if (serverData.code == 200) {
          that.setData({
            goods: that.data.goods.concat(serverData.data),
          })
        } else {
          that.setData({
            beMore: true
          })
        }
      });
    } else {
      if (that.data.appBeMore) return;
      if (that.data.appGoodsEmy)
        return;
      that.data.plat_index++;
      that.data.pageNum = that.data.plat_index;
      httphelper.api("storeFamous/getGoods", {
        pageNum: that.data.pageNum++,
        type: that.data.active,
        id:that.data.famousId,
      }, (serverData) => {
        if (serverData.code == 200) {
          that.setData({
            appGoods: that.data.appGoods.concat(serverData.data),
          })
        } else {
          that.setData({
            appBeMore: true
          })
        }
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // let url = getApp().url + "myInformation/customSmallProgramCode?page=packageStoreFamous/pages/storeFamous/storeFamous&scene=" + app.userId + "@" + this.data.famousId + "&ssoToken=" + getApp().ssoToken;
    // wx.getImageInfo({
    //   src: url,
    //   success: function (res) {
    //     that.setData({
    //       codeImg: res.path
    //     })
    //   },
    //   complete: function (res) {
    //     console.log(res);
    //   }
    // });
  },

  getData() {
    let that = this;
    if (!app.isShowLogin) {
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.getData();
      }
      return;
    }
    httphelper.api('storeFamous/getFamousUserDetail', {
      id: that.data.famousId
    }, (serverData) => {
      if(serverData.data.goods){
        that.setData({
          storeGoodsEmy:false
        })
      }
      if(serverData.data.appGoods){
        that.setData({
          appGoodsEmy:false
        })
      }
      that.setData({
        goods: serverData.data.goods,
        appGoods: serverData.data.appGoods,
        famousUser: serverData.data.famousUser,
        followStatus: serverData.data.followStatus,
      })
    });
  },
  addAttention() {
    httphelper.api("storeFamous/storeAttention", {
      id: that.data.famousId
    }, (serverData) => {
      wx.showToast({
        icon: 'none',
        title: serverData.msg
      });
      if (serverData.code == 200) {
        let key = "famousUser.followNum";
        that.setData({
          followStatus: 1,
          [key]: that.data.famousUser.followNum + 1
        })
      }
    });
  },
  removeAttention() {
    httphelper.api("storeFamous/storeRemoveAttention", {
      id: that.data.famousId
    }, (serverData) => {
      wx.showToast({
        icon: 'none',
        title: serverData.msg
      });
      if (serverData.code == 200) {
        let key = "famousUser.followNum";
        that.setData({
          followStatus: 0,
          [key]: that.data.famousUser.followNum - 1
        })
      }
    });
  },

  onMoveToAppGoods(event){
    wx.navigateTo({
      url: '/packageStoreFamous/pages/storeFamousAppGoods/storeFamousAppGoods?goodsId=' + event.currentTarget.dataset.goodsId,
    })
  },

  onMoveToGoods(event){
    wx.navigateTo({
      url: '/packageStoreFamous/pages/storeFamousGoods/storeFamousGoods?goodsId=' + event.currentTarget.dataset.goodsId,
    })
  },

  goHome() {
    wx.switchTab({
      url: '/pages/index/index',
    });
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
            src: that.data.famousUser.imageUrl
          }),
          wxGetImageInfo({
            src: 'https://img.ssw88.com/share/share_shop.png'
          }),
          wxGetImageInfo({
            src: that.data.famousUser.icon
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
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.famousUser.name,
      path: '/packageStoreFamous/pages/storeFamous/storeFamous?famousId=' + this.data.famousUser.id + '&userId=' + app.userId
    }
  },
  /**
   * 分享到朋友圈
   */
  onShareTimeline: function () {
    return {
      title: this.data.famousUser.name,
      query: 'userId=' + app.userId + '&famousId=' + this.data.famousUser.id,
      path: '/packageStoreFamous/pages/storeFamous/storeFamous',
      imageUrl: 'https://img.ssw88.com/static/home/famous_share.jpg',
    }
  },
})