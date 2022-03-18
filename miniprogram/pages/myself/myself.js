// miniprogram/pages/myself/myself.js
import IMService from '../../static/lib/imservice.js';
const httphelper = require('../../httphelper.js')
const common = require('../../common.js')
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    tag: 0,
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    avatarUrl: '../../images/user-unlogin.png',
    userInfo: {}, //本地用户的基本信息
    store: null,
    encryptedData: '',
    logged: false,
    takeSession: false,
    isVersion: 1,
    ssoToken: '',
    user: null, //服务器发来的用户基本数据
    orderVisible: false,
    nickNameVisible: false,
    unreadTotal: 0, //未读信息
    jumpList: [{
      url: "/packageMyself/pages/myself/mywallet/mywallet",
      icon: "/images/my_wallet.png",
      title: "我的钱包",
    }, {
      url: "/packageMyself/pages/myself/myaddress/myaddress",
      icon: "/images/my_address.png",
      title: "地址管理",
    }, {
      url: "/packageMyself/pages/myself/myfavour/myfavour",
      icon: "/images/my_favour.png",
      title: "我的收藏",
    }, {
      url: "/packageMyself/pages/myself/myfoots/myfoots",
      icon: "/images/my_foot.png",
      title: "我的足迹",
    }, {
      url: "/packageMyself/pages/myself/vCard/vCard",
      icon: "/images/my_iCard.png",
      title: "我的名片",
    }, {
      url: "/pages/poster/poster",
      icon: "/images/my_poster.png",
      title: "海报",
    }, {
      url: "/packageMyself/pages/myself/shopAddress/shopAddress",
      icon: "/images/my_store.png",
      title: "门店查询",
    }, {
      url: "/packageMyself/pages/myself/aboutUs/aboutUs",
      icon: "/images/my_about_us.png",
      title: "关于我们",
    }, {
      url: "/pages/loadApp/loadApp",
      icon: "/images/loadApp.png",
      title: "下载App",
    }, {
      url: "/packageMyself/pages/myself/storage/storage",
      icon: "/images/my_stored.png",
      title: "储值有礼",
    }],
    storeJumpList: [{
      url: "/packageStore/pages/storeManager/storeInfo",
      icon: "/images/my_store_manager.png",
      title: "商铺管理",
    }, {
      url: "/packageStore/pages/storeProfit/storeProfit",
      icon: "/images/my_order_price.png",
      title: "订单收益",
    }],
    accountBook: null,
    balance: 0, //用户余额
    maxUseBalance: 0, //直播可用余额
    userBalance: 0, //用户使用的余额
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      isVersion: getApp().goodsShop,
      ssoToken: getApp().ssoToken,
      shareId: wx.getStorageSync('shareId')
      // shareId: 21000604
    })
  },
  getRecorder(e) {
    let that = this;
    httphelper.api("record/findRecordUser", null, function (serverdata) {
      if (serverdata.code == 200 && serverdata.data != null) {
        that.setData({
          accountBook: serverdata.data,
        })
        app.accountBook = serverdata.data;
      }
    });
  },
  switchTag: function (e) {
    this.setData({
      tag: this.data.tag == 0 ? 1 : 0
    })
  },
  jumpToShare: function (e) {
      wx.navigateTo({
        url: '/packageTailor/pages/share/share?id=' + this.data.shareId,
      })
  },
  jumpToStore: function (e) {
    if (!this.activeStore())
      wx.navigateTo({
        url: '/packageStore/pages/storeDetail/storeDetail?id=' + this.data.store.id,
      })
  },
  jumpToStoreGoodManager: function (e) {
    if (!this.activeStore())
      wx.navigateTo({
        url: '/packageStore/pages/storeManager/storeGoodsManager'
      })
  },
  goEnsurePrice: function (e) {
    if (!this.activeStore())
      wx.navigateTo({
        url: '/packageStore/pages/storeEnsureprice/storeEnsureprice?status=' + this.data.store.returnStatus
      })
  },
  goGetPrice: function (e) {
    if (!this.activeStore())
      wx.navigateTo({
        url: '/packageStore/pages/storeProfit/storeProfit?status=2'
      })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var value = wx.getStorageSync('phoneNum')
    if (value) {
      this.loadData();
    }
  },
  onHide: function () {
    let service = app.globalData.imService;
    service.onConversationsUpdate = function () {}
    wx.setStorageSync('shareId',null);
    this.setData({
      shareId: null
    })
  },
  onLogin: function () {
    if (!app.isShowLogin) {
      let that = this;
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.loadData();
      }
      return;
    }
  },
  loadData: function () {
    //刷新用户数据
    let that = this;
    httphelper.api("myInformation/myInformation", null, function (serverdata) {
      httphelper.api("store/findStoreDetail", null, function (storeData) {
        if (storeData.code == 200) {
          that.setData({
            store: storeData.data,
            ssoToken: app.ssoToken
          })
          if (that.data.store.applyStatus == 1 && app.myself_tag != null) {
            that.setData({
              tag: 1
            });
            app.myself_tag = null;
          }
          if (app.myself_tag == 2 && (that.data.store.applyStatus == 0 || that.data.store.applyStatus == 3)) {
            app.myself_tag = null;
            wx.navigateTo({
              url: '/packageStore/pages/storeApply/storeApply',
            })
          }
        }
      })
      if (serverdata.code == 200) {
        that.setData({
          balance: serverdata.data.userWallet.balance,
          userWallet: serverdata.data.userWallet
        })
        app.user = serverdata.data.user;
        app.user.highType = serverdata.data.highType;
        if (serverdata.data.storeId != null) {
          //雕刻师身份 1 学员 2雕刻师
          app.user.carvingId = serverdata.data.storeId;
          app.user.carvingLevel = serverdata.data.level;
        }
        if (serverdata.data.uuid != null) {
          app.user.storeId = serverdata.data.uuid;
          app.user.storeAbility = serverdata.data.ability;
        }
        app.user.carveType = serverdata.data.carveType; //特殊雕刻店铺
        that.setData({
          user: app.user,
        })
        if (app.globalData.userInfo == null) {
          if (serverdata.data.uuid != null) {
            serverdata.data.user.ImId = "store" + serverdata.data.uuid;
            serverdata.data.user.nickName = serverdata.data.name;
            serverdata.data.user.photoUrl = serverdata.data.avatar;
          } else if (serverdata.data.highId) {
            serverdata.data.user.ImId = "high" + serverdata.data.highId;
          } else {
            serverdata.data.user.ImId = serverdata.data.user.id;
          }
          app.globalData.userInfo = serverdata.data.user;
          app.globalData.otp = serverdata.data.otp;
        }
        common.initIM();
        //加载会话列表
        wx.im.latestConversations()
          .then(res => {
            that.setUnreadAmount(res.content.unreadTotal);
            wx.hideLoading();
          })
          .catch(e => {
            console.log(e);
            wx.hideLoading();
          });
      }
      that.getRecorder();
    });
  },
  onUnload() {
    app.globalData.imService.disconnect();
    wx.setStorageSync('shareId',null);
    this.setData({
      shareId: null
    })
  },
  //复制推荐吗
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
  jumpTo: function (event) {
    if (this.data.tag == 0 || !this.activeStore()) {
      var value = wx.getStorageSync('phoneNum')
      if (value) {
        common.jumpTo(event);
      } else {
        this.onLogin();
      }
    }
  },
  touch_store: function (e) {
    if (this.data.store.type == 3) {
      if (this.data.store.servicePrice == 0) {
        wx.showToast({
          icon: "none",
          title: '店铺未激活，激活后可以立即售卖商品',
        })
      } else if (this.data.store.ensurePrice < this.data.store.ensureMargin) {
        wx.showToast({
          icon: "none",
          title: '您的店铺保证金不足，为保障店铺正常营业，请立即续费',
        })
      }
    } else {
      if (this.data.store.ensurePrice == 0) {
        wx.showToast({
          icon: "none",
          title: '店铺未激活，激活后可以立即售卖商品',
        })
      } else if (this.data.store.ensurePrice < this.data.store.ensureMargin) {
        wx.showToast({
          icon: "none",
          title: '您的店铺保证金不足，为保障店铺正常营业，请立即续费',
        })
      }
    }
  },
  activeStore: function (e) {
    if (this.data.store.type == 3 && (this.data.store.servicePrice == 0 || this.data.store.ensurePrice < this.data.store.ensureMAX)) {
      let that = this;
      httphelper.api("store/storeToPay", null, function (serverdata) {
        if (serverdata.code == 200) {
          that.setData({
            order: serverdata.data,
            orderVisible: true
          })
        }
      });
      return true;
    } else {
      if (this.data.store.ensurePrice < this.data.store.ensureMAX) {
        let that = this;
        httphelper.api("store/storeToPay", null, function (serverdata) {
          if (serverdata.code == 200) {
            that.setData({
              order: serverdata.data,
              orderVisible: true
            })
          }
        });
        return true;
      }
    }
    return false;
  },
  close_order: function (e) {
    this.setData({
      orderVisible: false,
      liveVisible: false
    })
  },
  order_pay: function (e) {
    let that = this;
    httphelper.api("store/wxSmallPay", {
      orderId: this.data.order.id,
      openId: wx.getStorageSync('openid')
    }, function (serverdata) {
      if (serverdata.code == 200) {
        wx.showLoading({
          title: '加载中',
        });
        //向服务器下单成功，提示用户进行支付
        wx.requestPayment({
          timeStamp: serverdata.data.resultwx.timeStamp,
          nonceStr: serverdata.data.resultwx.nonce_str,
          package: 'prepay_id=' + serverdata.data.resultwx.prepay_id,
          signType: 'HMAC-SHA256',
          paySign: serverdata.data.resultwx.sign,
          success(res) {
            console.log(res)
          },
          fail(res) {
            console.log(res)
          },
          complete(res) {
            setTimeout(() => {
              wx.hideLoading();
              that.setData({
                orderVisible: false
              });
              that.loadData();
            }, 2000);
          },
        })
      } else {
        wx.showToast({
          title: serverdata.msg,
        })
      }
    });
  },
  changeNickName(e) {
    this.setData({
      nickName: e.detail.value
    })
  },
  updateNickName: function (e) {
    if (this.data.nickName == "") {
      wx.showToast({
        icon: "none",
        title: '昵称不可为空',
      })
      return;
    }
    let that = this;
    let data = {};
    data.nickName = this.data.nickName;
    httphelper.api("myInformation/updatePersonalInformation", data, server_data => {
      if (server_data.code == 200) {
        let key = "user.nickName"
        app.user.nickName = this.data.nickName;
        that.setData({
          [key]: this.data.nickName,
          nickNameVisible: false
        })
        wx.showToast({
          icon: "none",
          title: '修改昵称成功',
        })
      }
    });
  },
  open_nickName() {
    this.setData({
      nickNameVisible: true
    })
  },
  close_nickName() {
    this.setData({
      nickNameVisible: false
    })
  },
  updateHeadImage: function (e) {
    let that = this;
    wx.showModal({
      title: '修改头像',
      content: '是否更换头像?',
      success: function (res) {
        if (res.confirm) {
          wx.chooseImage({
            count: 1, //默认9
            sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album'], //从相册选择
            success: function (res) {
              wx.uploadFile({
                url: app.url + "myInformation/updatePersonalInformation",
                filePath: res.tempFilePaths[0],
                name: "headImageFile",
                formData: {
                  ssoToken: app.ssoToken,
                  push: "/"
                },
                success(res) {
                  console.log(res);
                  var data = JSON.parse(res.data);
                  console.log(data);
                  if (data.code == 200) {
                    app.user.photoUrl = data.data.photoUrl;
                    let key = "user.photoUrl";
                    that.setData({
                      [key]: data.data.photoUrl
                    })
                  }
                },
                complete(res) {}
              });
            }
          });
        }
      }
    })
  },
  /****
   * 客服信息
   */
  setUnreadAmount(unreadTotal) {
    this.setData({
      unreadTotal: unreadTotal
    })
    if (unreadTotal > 0) {
      wx.setTabBarBadge({
        index: 4,
        text: unreadTotal.toString()
      })
    } else {
      wx.hideTabBarRedDot({
        index: 4
      })
    }
  },
  /** 申请直播 */
  applyLive() {
    if (this.data.store.liveStatus < 2) {
      this.setData({
        liveVisible: true,
        maxUseBalance: this.data.balance > this.data.store.livePrice ? this.data.store.livePrice : this.data.balance
      })
    } else {
      wx.showToast({
        title: '您已开通直播功能',
      })
    }
  },
  bindCoinBalance: function (e) {
    let value = e.detail.value
    if (value < 0) value = 0;
    return (value > this.data.maxUseBalance) ? this.data.maxUseBalance : value;
  },
  toUseBalance: function (e) {
    let value = parseFloat(e.detail.value);
    if (value < 0) {
      value = 0;
    }
    if (value > this.data.maxUseBalance) {
      value = this.data.maxUseBalance;
    }
    this.setData({
      userBalance: value
    })
  },
  createLiveOrder() {
    let that = this;
    httphelper.api("broadcast/createOrder", {
      useBalance: this.data.userBalance,
    }, (data) => {
      if (data.data.price > 0) {
        httphelper.api("broadcast/wxSmallPay", {
          orderId: data.data.id,
          openId: wx.getStorageSync('openid')
        }, function (serverdata) {
          if (serverdata.code == 200) {
            wx.showLoading({
              title: '加载中',
            });
            //向服务器下单成功，提示用户进行支付
            wx.requestPayment({
              timeStamp: serverdata.data.resultwx.timeStamp,
              nonceStr: serverdata.data.resultwx.nonce_str,
              package: 'prepay_id=' + serverdata.data.resultwx.prepay_id,
              signType: 'HMAC-SHA256',
              paySign: serverdata.data.resultwx.sign,
              success(res) {
                wx.hideLoading();
                wx.showToast({
                  title: "直播开通成功~",
                })
              },
              fail(res) {
                wx.hideLoading();
                wx.showToast({
                  title: "支付失败~",
                })
              },
              complete(res) {
                setTimeout(() => {
                  that.setData({
                    liveVisible: false
                  });
                  that.loadData();
                }, 2000);
              },
            })
          } else {
            wx.showToast({
              title: serverdata.msg,
            })
          }
        });
      } else {
        wx.hideLoading();
        wx.showToast({
          title: "直播开通成功~",
        })
        setTimeout(() => {
          that.setData({
            liveVisible: false
          });
          that.loadData();
        }, 2000);
      }
    });
  }
})