//index.js
const httphelper = require('../../httphelper.js')
const common = require('../../common.js')
const app = getApp()
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';

Page({
  data: {
    tabActive: 0,
    rotationChart: [],
    rotationChartList: [],
    goodsSelectedList: [],
    informationList: [],
    informations: [],
    optimizationList: [],
    spike: {},
    countDown: [],
    activity: null,
    guess_item: null,
    luckDrawId: null,
    successGet: false,
    slider: {
      indicatorDots: true,
      autoplay: true,
      interval: 5000,
      duration: 200,
    },
    showModal: false,
    tipShow: true,
    redDownTime: 0,
    giftShow: false,
    scene: '',
    selectType: 1,
    redtimer: -1,
    timer: -1,
    storeForeign: {},
    storeInfo: [],
    storePersonal: {},
    persoalStoreInfo: [],
    //玩家回血
    topLimit: 0,
    bar_Height: 0,
    active: 0,
    type: 2, //2外来商铺 3个人商铺
    goodOrder: 'create_time', //排序条件
    order: 'total',
    sort: 0,
    //商铺信息
    storeList: [],
    goodsInfo: [],
    storeTypes: [],
    curTypeIndex: 0,
    goodTypeIndex: 0,
    pageNum: 1,
    //关注api调用中
    query: false,
    scrollToTop: 0,
    arrow_up: "/images/arrow_up.png",
    arrow_down: "/images/arrow_down.png",
    beMoreStore: true,
    tagLevel: [
      '创始人',
      '公司董事',
      '合伙人'
    ],
  },
  changeIndex(e,type) {
    let index;
    if(!type){
      index = parseInt(e.currentTarget.dataset.index);
    }else{
      index= e;
    }
    if (this.data.tabActive == index)
      return;
    else {
      this.setData({
        beMoreStore: true,
        pageNum: 1,
      })
      if (index == 1) {
        this.setData({
          tabActive: index,
          active: 0,
          type: 3, //2外来商铺 3个人商铺
          goodOrder: 'create_time', //排序条件
          order: 'total',
          sort: 1,
          goodTypeIndex: 0,
          curTypeIndex: 0
        })
        this.initData();
      } else if (index == 2) {
        this.setData({
          tabActive: index,
          active: 0,
          type: 2, //2外来商铺 3个人商铺
          goodOrder: 'create_time', //排序条件
          order: 'total',
          sort: 1,
          goodTypeIndex: 0,
          curTypeIndex: 0
        })
        this.initData();
      } else if (index == 3) {
        this.initHighData();
        this.setData({
          tabActive: index
        })
      } else if (index == 4) {
        this.initStoreFamous();
        this.setData({
          tabActive: index
        })
      } else {
        this.setData({
          tabActive: index
        })
      }
    }
  },
  closeGiftShow: function () {
    this.setData({
      giftShow: false
    })
  },
  changeType: function (e) {
    this.setData({
      selectType: e.currentTarget.dataset.type
    })
  },
  onLoad: function (options) {
    let that = this;
    let statusBarHeight = wx.getSystemInfoSync().statusBarHeight;
    wx.loadFontFace({
      family: 'SYST1',
      source: 'url("https://img.ssw88.com/SourceHanSerifCN-Heavy.otf")',
      success: res => {
        console.log('font load success', res)
      },
      fail: err => {
        console.log('font load fail', err)
      }
    })
    this.setData({
      scene: decodeURIComponent(options.scene),
      bar_Height: statusBarHeight,
      topLimit: 135
    })
    this.onRefresh(null, options.tabActive);
    let s = [];
    if (this.data.scene != undefined) {
      s = this.data.scene.split('@');
    }
    //100元礼品卡卡密
    if (this.data.scene && s.length > 1) {
      this.setData({
        giftShow: true
      })
      if (!app.isShowLogin) {
        let login = this.selectComponent("#login");
        if (login != null) common.checkWechatLogin(login);
        app.saveCall = function () {
          that.getCard();
        }
      } else {
        this.getCard();
      }
    }
    //链接IM
    common.connectIM();
  },
  goVideoList() {
    wx.navigateTo({
      url: '/pages/video-swiper/video-swiper',
    })
  },
  moveToPersonal(e) {
    wx.navigateTo({
      url: '/packageStore/pages/storeDetail/storeDetail?id=' + this.data.storePersonal.id
    })
  },
  moveToForeign(e) {
    wx.navigateTo({
      url: '/packageStore/pages/storeDetail/storeDetail?id=' + this.data.storeForeign.id
    })
  },
  checkLoginCard: function (e) {
    let that = this;
    if (!app.isShowLogin) {
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.getCard();
      }
    } else {
      that.setData({
        giftShow: false
      })
      if (this.data.successGet) {
        common.jumpTo(e);
      }
    }
  },
  getCard: function () {
    let that = this;
    if (this.data.scene) {
      var s = this.data.scene.split('@');
      var cardWord = s[1];
      var postdata = [];
      postdata["cardPassWord"] = cardWord;
      httphelper.api("myInformation/useEntityGiftCard", postdata, function (serverdata) {
        if (serverdata.code == 200) {
          that.setData({
            successGet: true,
            giftShow: true
          })
          //兌換成功，彈出成功界面
        } else {
          Toast(serverdata.msg);
          that.setData({
            giftShow: false
          })
        }
      })
    }
  },
  onGetGuessGoods: function () {
    let that = this;
    for (var i = 0; i < that.data.rotationChartList.length; ++i) {
      let tmp = that.data.rotationChartList[i];
      if (tmp.clickType == "3") {

        that.setData({
          guess_item: tmp
        })
        break;
      }
    }
  },
  jumpToSpike() {
    wx.navigateTo({
      url: '/pages/limitBuy/limitBuy',
    });
  },
  jumpToActivity() {
    wx.navigateTo({
      url: '/pages/activity/activity?guessingId=' + this.guessingId,
    });
  },
  jumpToRedPackage() {
    wx.navigateTo({
      url: '/packageActivity/pages/redPacketRain/redPacketRain',
    });
  },
  onRefresh: function (callback, tabActive) {
    let that = this;
    httphelper.api("classification/homePage", {
      version: getApp().introduce,
      ssoToken: getApp().ssoToken
    }, function (data) {
      that.setData({
        rotationChart: data.data.rotationChart,
        rotationChartList: data.data.rotationChartList,
        goodsSelectedList: data.data.goodsSelectedList,
        informationList: data.data.informationList,
        optimizationList: data.data.optimizationList,
        informations: data.data.informations,
        spike: data.data.spike != undefined ? data.data.spike : {},
        activity: data.data.activity != undefined ? data.data.activity : null,
        luckDrawId: getApp().appDrawId == 0 ? data.data.luckDrawId : getApp().appDrawId,
        redDownTime: data.data.redDownTime,
        commodityExchange: data.data.commodityExchange,
        goodsSelected: data.data.goodsSelected,
        storeForeign: data.data.storeForeign,
        storeInfo: data.data.storeInfo,
        storePersonal: data.data.storePersonal,
        persoalStoreInfo: data.data.persoalStoreInfo,
      })
      if (that.data.guess_item == null) {
        that.onGetGuessGoods();
      }
      that.myShow();
      that.selectComponent('#guess_what').setGoodsValue(data.data.goodJadeList);
      if (callback != null) {
        if (callback.type != 'finish') callback();
      }
      that.refresh_time();
    });
    if (tabActive != null) {
      that.changeIndex(tabActive,1)
    }
  },
  //倒计时
  refresh_time: function () {
    let that = this;
    let now = this.data.spike.times;
    if (this.data.redDownTime > 0) {
      if (this.data.redtimer != -1) {
        clearInterval(this.data.redtimer);
      }
      that.redTimeStamp(that.data.redDownTime);
      let redtimer = setInterval(function () {
        --that.data.redDownTime;
        if (that.data.redDownTime > 0) {
          that.redTimeStamp(that.data.redDownTime);
        } else {
          clearInterval(that.data.redtimer);
        }
      }, 1000);
      that.setData({
        redtimer: redtimer
      })
    }
    if (this.data.spike.state == 0) {
      if (this.data.timer != -1) {
        clearInterval(this.data.timer);
      }
      that.timeStamp(now);
      let timer = setInterval(function () {
        --now;
        if (now > 0) {
          that.timeStamp(now);
        } else {
          clearInterval(that.data.timer);
          let spike = that.data.spike;
          spike.state = 1;
          that.setData({
            spike: spike
          })
        }
      }, 1000);
      that.setData({
        timer: timer
      })
    }
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
  redTimeStamp: function (second_time) {
    var hour = parseInt(second_time / 3600);
    var min = parseInt(second_time / 60) % 60;
    var seconds = second_time % 60;
    this.setData({
      redhour: hour > 9 ? hour : '0' + hour,
      redmin: min > 9 ? min : '0' + min,
      redseconds: seconds > 9 ? seconds : '0' + seconds
    })
  },
  mySuccess: function () {
    let guess_item = this.data.guess_item;
    wx.navigateTo({
      url: '/pages/activity/activity?guessingId=' + guess_item.addParam,
    })
  },
  myFail: function () { },
  myShow: function () {
    if (getApp().receiveStatus == 1 && this.data.guess_item != null) {
      this.selectComponent("#model").show();
      getApp().receiveStatus = 0;
      return true;
    }
    return false;
  },
  onShow: function (e) {
    let that = this;
    if (getApp().ssoToken != "") {
      let login = this.selectComponent("#login");
      login.hideLoginModal();
    }
    that.data.loopRewards = setInterval(function () {
      if (that.myShow()) {
        clearInterval(that.data.loopRewards);
      }
    }, 2000)
    if (wx.getStorageSync('newTipShow') == 1) {
      this.setData({
        tipShow: false
      })
    } else {
      setTimeout(function () {
        that.setData({
          tipShow: false
        })
      }, 10000);
    }
    if (app.index_tag != null) {
      let index = app.index_tag;
      app.index_tag = null;
      if (this.data.tabActive == index)
        return;
      else {
        if (index == 1) {
          this.setData({
            tabActive: index,
            active: 0,
            type: 3, //2外来商铺 3个人商铺
            goodOrder: 'create_time', //排序条件
            order: 'total',
            sort: 1,
            goodTypeIndex: 0,
            curTypeIndex: 0
          })
          this.initData();
        } else if (index == 2) {
          this.setData({
            tabActive: index,
            active: 0,
            type: 2, //2外来商铺 3个人商铺
            goodOrder: 'create_time', //排序条件
            order: 'total',
            sort: 1,
            goodTypeIndex: 0,
            curTypeIndex: 0
          })
          this.initData();
        } else if (index == 3) {
          this.initHighData()
          this.setData({
            tabActive: index
          })
        } else if (index == 4) {
          this.initStoreFamous()
          this.setData({
            tabActive: index
          })
        } else {
          this.setData({
            tabActive: index
          })
        }
      }
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.data.loopRewards);
  },

  //前往分类详情界面
  onMoveToCommodityInformation: common.onMoveToCommodityInformation,
  //前往商品详情界面
  onMoveToGoods: common.onMoveToGoods,
  jumpTo: function (e) {
    if (e.currentTarget.dataset.url == '/pages/html/html') {
      var value = wx.getStorageSync('phoneNum')
      if (value) {
        common.jumpTo(e);
      } else {
        this.onLogin();
      }
    } else if (e.currentTarget.dataset.url == '/packageActivity/pages/redPacketRain/redPacketRain') {
      if (app.showRedPacket == 0) {
        common.jumpTo(e);
        app.showRedPacket = 1;
      }
    } else {
      common.jumpTo(e);
    }
  },
  onLogin: function () {
    if (!app.isShowLogin) {
      let that = this;
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.onRefresh(null, null);
      }
      return;
    }
  },
  tipClose: function () {
    this.setData({
      tipShow: false
    })
    wx.setStorageSync('newTipShow', 1);
  },
  onReachBottom: function () {
    let that = this;
    if (this.data.tabActive == 0) {
      let data = {};
      data.isIndex = 1;
      this.selectComponent('#guess_what').onQueryNext("classification/queryGoodJade", data, "goodJadeList");
    } else if (this.data.tabActive != 3 && this.data.tabActive != 4) {
      let data = {};
      if (this.data.active == 0) {
        data.type = this.data.type;
        data.order = this.data.goodOrder;
        data.sort = this.data.sort;
        data.typeId = this.data.storeTypes[this.data.goodTypeIndex].id;
        this.selectComponent('#store_goods').onQueryNext("classification/findGoodsInfo", data, "goodsInfo");
      } else {
        if (this.data.beMoreStore) {
          this.data.pageNum++;
          data.type = this.data.type;
          data.order = this.data.order;
          data.pageNum = this.data.pageNum;
          data.typeId = this.data.storeTypes[this.data.curTypeIndex].id;
          httphelper.api("classification/findStoreInfo", data, (serverData) => {
            if (serverData.data.storeInfo.length == 0) {
              that.setData({
                beMoreStore: false
              })
            } else {
              that.setData({
                storeList: that.data.storeList.concat(serverData.data.storeInfo),
              })
            }
          });
        }
      }
    }
  },

  //下拉刷新
  onPullDownRefresh: function () {
    if (this.data.tabActive == 0) {
      this.onRefresh(() => {
        wx.stopPullDownRefresh();
      });
    } else if (this.data.tabActive == 3) {
      this.initHighData()
      wx.stopPullDownRefresh();
    } else if (this.data.tabActive == 4) {
      this.initStoreFamous()
      wx.stopPullDownRefresh();
    } else {
      this.initData()
      wx.stopPullDownRefresh();
    }
  },

  onPageScroll: function (res) {
    this.setData({
      scrollToTop: res.scrollTop
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    if (this.data.tabActive == 0) {
      return {
        title: '“珠”联璧合|非你莫属',
        path: '/pages/index/index?userId=' + app.userId + '&tabActive=' + this.data.tabActive
      }
    } else if (this.data.tabActive == 1) {
      return {
        title: common.getShareMsg(14, 0),
        path: '/pages/index/index?userId=' + app.userId + '&tabActive=' + this.data.tabActive,
        imageUrl: 'https://img.ssw88.com/static/home/personal.jpg',
      }
    } else if (this.data.tabActive == 2) {
      return {
        title: common.getShareMsg(14, 1),
        path: '/pages/index/index?userId=' + app.userId + '&tabActive=' + this.data.tabActive,
        imageUrl: 'https://img.ssw88.com/static/home/foreign.jpg',
      }
    } else if (this.data.tabActive == 3) {
      return {
        title: common.getShareMsg(14, 2),
        path: '/pages/index/index?userId=' + app.userId + '&tabActive=' + this.data.tabActive,
        imageUrl: 'https://img.ssw88.com/static/home/high_banner.jpg',
      }
    } else {
      return {
        title: common.getShareMsg(14, 8),
        path: '/pages/index/index?userId=' + app.userId + '&tabActive=' + this.data.tabActive,
        imageUrl: 'https://img.ssw88.com/static/home/famous_banner.jpg',
      }
    }
  },

  /*   商铺  */
  initData() {
    let that = this;
    let data = {};
    data.type = this.data.type;
    data.order = this.data.order;
    httphelper.api("classification/findStoreInfo", data, (serverData) => {
      that.setData({
        storeList: serverData.data.storeInfo,
        storeTypes: serverData.data.storeTypes
      })
    });
    data = {};
    data.type = this.data.type;
    data.order = this.data.goodOrder;
    data.sort = this.data.sort;
    httphelper.api("classification/findGoodsInfo", data, (serverData) => {
      that.setData({
        goodsInfo: serverData.data.goodsInfo,
        storeTypes: serverData.data.storeTypes
      })
      that.selectComponent('#store_goods').setGoodsValue(serverData.data.goodsInfo);
    });
  },
  getData() {
    let that = this;
    let data = {};
    if (this.data.active == 1) {
      data.type = this.data.type;
      data.order = this.data.order;
      data.pageNum = this.data.pageNum;
      data.typeId = this.data.storeTypes[this.data.curTypeIndex].id;
      httphelper.api("classification/findStoreInfo", data, (serverData) => {
        that.setData({
          storeList: serverData.data.storeInfo,
          storeTypes: serverData.data.storeTypes
        })
      });
    } else {
      data.type = this.data.type;
      data.order = this.data.goodOrder;
      data.sort = this.data.sort;
      data.pageNum = this.data.pageNum;
      data.typeId = this.data.storeTypes[this.data.goodTypeIndex].id;
      httphelper.api("classification/findGoodsInfo", data, (serverData) => {
        that.setData({
          goodsInfo: serverData.data.goodsInfo,
          storeTypes: serverData.data.storeTypes
        })
        that.selectComponent('#store_goods').setGoodsValue(serverData.data.goodsInfo);
      });
    }
  },
  changeActive(e) {
    let act = parseInt(e.currentTarget.dataset.index);
    if (this.data.active == act) return;
    this.setData({
      active: act,
      pageNum: 1,
    })
  },
  changeOrder(e) {
    if (this.data.active == 1) {
      if (this.data.order == e.currentTarget.dataset.order) return;
      this.setData({
        order: e.currentTarget.dataset.order,
        beMoreStore: true,
        pageNum: 1,
      })
      this.getData();
    } else {
      if (e.currentTarget.dataset.order == 'goods_price') {
        if (this.data.goodOrder == e.currentTarget.dataset.order) {
          this.setData({
            sort: this.data.sort == 0 ? 1 : 0,
          })
        } else {
          this.setData({
            goodOrder: e.currentTarget.dataset.order,
          })
        }
      } else {
        if (this.data.goodOrder == e.currentTarget.dataset.order) return;
        this.setData({
          goodOrder: e.currentTarget.dataset.order,
          sort: 1,
        })
      }
      this.getData();
    }
  },
  swapTitle(e) {
    this.setData({
      beMoreStore: true,
      pageNum: 1,
    })
    let index = parseInt(e.currentTarget.dataset.index);
    if (this.data.active == 0) {
      if (this.data.goodTypeIndex == index) {
        return;
      }
      this.setData({
        goodTypeIndex: index
      })
    } else {
      if (this.data.curTypeIndex == index) {
        return;
      }
      this.setData({
        curTypeIndex: index
      })
    }
    this.getData();
  },
  jumpToStore(e) {
    wx.navigateTo({
      url: '/packageStore/pages/storeDetail/storeDetail?id=' + e.currentTarget.dataset.id,
    });
  },
  jumpToStoreFamous(e) {
    wx.navigateTo({
      url: '/packageStoreFamous/pages/storeFamous/storeFamous?id=' + e.currentTarget.dataset.id,
    });
  },
  jumpToStoreFamousGoods(e) {
    wx.navigateTo({
      url: '/packageStoreFamous/pages/storeFamousGoods/storeFamousGoods?goodsId=' + e.currentTarget.dataset.id,
    });
  },
  jumpToStoreFamousAppGoods(e) {
    wx.navigateTo({
      url: '/packageStoreFamous/pages/storeFamousAppGoods/storeFamousAppGoods?goodsId=' + e.currentTarget.dataset.id,
    });
  },
  addAttention(e) {
    if (this.data.query) return;
    let item = this.data.storeList[e.currentTarget.dataset.index];
    let that = this;
    this.data.query = true;
    httphelper.api("store/storeAttention", {
      id: item.id
    }, (serverData) => {
      wx.showToast({
        icon: 'none',
        title: "关注成功"
      });
      if (serverData.code == 200) {
        item.followStatus = 1;
        item.followNum += 1;
        let temp = that.data.storeList;
        that.setData({
          storeList: temp
        })
      }
      that.data.query = false;
    });
  },
  removeAttention(e) {
    if (this.data.query) return;
    let item = this.data.storeList[e.currentTarget.dataset.index];
    let that = this;
    this.data.query = true;
    httphelper.api("store/storeRemoveAttention", {
      id: item.id
    }, (serverData) => {
      wx.showToast({
        icon: 'none',
        title: "取消成功"
      });
      if (serverData.code == 200) {
        item.followStatus = 0;
        if (item.followNum > 0) {
          item.followNum -= 1;
        }
        let temp = that.data.storeList;
        that.setData({
          storeList: temp
        })
      }
      that.data.query = false;
    });
  },

  addFamousAttention(e) {
    if (this.data.query) return;
    let item = this.data.famousData[e.currentTarget.dataset.index].famousUser[e.currentTarget.dataset.uindex];
    let that = this;
    this.data.query = true;
    httphelper.api("storeFamous/storeAttention", {
      id: item.id
    }, (serverData) => {
      wx.showToast({
        icon: 'none',
        title: "关注成功"
      });
      if (serverData.code == 200) {
        item.followStatus = 1;
        let temp = that.data.famousData;
        that.setData({
          famousData: temp
        })
      }
      that.data.query = false;
    });
  },
  removeFamousAttention(e) {
    if (this.data.query) return;
    let item = this.data.famousData[e.currentTarget.dataset.index].famousUser[e.currentTarget.dataset.uindex];
    let that = this;
    this.data.query = true;
    httphelper.api("storeFamous/storeRemoveAttention", {
      id: item.id
    }, (serverData) => {
      wx.showToast({
        icon: 'none',
        title: "取消成功"
      });
      if (serverData.code == 200) {
        item.followStatus = 0;
        let temp = that.data.famousData;
        that.setData({
          famousData: temp
        })
      }
      that.data.query = false;
    });
  },
  /*
   * 高货经纪
   */
  initHighData() {
    let that = this;
    if (!app.isShowLogin) {
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.initHighData();
      }
      return;
    }
    httphelper.api("high/findHighGoods", null, (serverData) => {
      if (serverData.code == 200) {
        if (serverData.data.goods_0) {
          serverData.data.goods_0.map((val) => {
            val.imageUrl = val.images.split(',')
          })
        }
        if (serverData.data.goods_1) {
          serverData.data.goods_1.map((val) => {
            val.imageUrl = val.images.split(',')
          })
        }
        if (serverData.data.goods_2) {
          serverData.data.goods_2.map((val) => {
            val.imageUrl = val.images.split(',')
          })
        }
        that.setData({
          highData: serverData.data,
          exclusive: serverData.data.brokers.length == 1
        })
        app.exclusive = serverData.data.brokers.length == 1;
      }
    });
  },
  /*
   * 艺术名家
   */
  initStoreFamous() {
    let that = this;
    httphelper.api("storeFamous/findStoreFamous", null, (serverData) => {
      if (serverData.code == 200) {
        that.setData({
          famousData: serverData.data,
        })
      }
    });
  },
  removeExAdviser(e) {
    let that = this;
    httphelper.api("high/delExclusiveBroker", null, (serverData) => {
      if (serverData.code == 200) {
        let item = that.data.highData.brokers[e.currentTarget.dataset.index];
        item.type = 1;
        let high = that.data.highData;
        that.setData({
          highData: high,
          exclusive: false
        })
        app.exclusive = false;
        wx.showToast({
          title: '移除专属客服',
        })
      }
    });
  },
  addExAdviser(e) {
    let that = this;
    let item = that.data.highData.brokers[e.currentTarget.dataset.index];
    httphelper.api("high/addExclusiveBroker", {
      id: item.id
    }, (serverData) => {
      if (serverData.code == 200) {
        item.type = 2;
        let high = that.data.highData;
        let broker = [];
        broker.push(item);
        high.brokers = broker;
        that.setData({
          highData: high,
          exclusive: true
        })
        app.exclusive = true;
        wx.showToast({
          title: '设置专属客服',
        })
      }
    });
  },
  goBroker(e) {
    app.curAdviser = this.data.highData.brokers[e.currentTarget.dataset.index];
    wx.navigateTo({
      url: '/packageHighGood/pages/adviserDetail/adviserDetail',
    })
  },
  goAdviser(e) {
    wx.navigateTo({
      url: '/packageHighGood/pages/adviserList/adviserList',
    })
  },
  goHighGood(e) {
    wx.navigateTo({
      url: '/packageHighGood/pages/goodsList/goodsList?type=' + e.currentTarget.dataset.type,
    })
  },
  goStoreFamousUser(e) {
    wx.navigateTo({
      url: '/packageStoreFamous/pages/storeFamousUser/storeFamousUser?type=' + e.currentTarget.dataset.type,
    })
  },
  goStoreFamousGoodsList(e) {
    wx.navigateTo({
      url: '/packageStoreFamous/pages/storeFamousGoodsList/storeFamousGoodsList?type=' + e.currentTarget.dataset.type,
    })
  },
  goStoreFamousAppGoodsList(e) {
    wx.navigateTo({
      url: '/packageStoreFamous/pages/storeFamousAppGoodsList/storeFamousAppGoodsList?type=' + e.currentTarget.dataset.type,
    })
  },
  viewHighGood(e) {
    app.curHighGood = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '/packageHighGood/pages/goodsDetail/goodsDetail',
    })
  },
  chat(e) {
    let item = this.data.highData.brokers[e.currentTarget.dataset.index];
    common.goKefu(item.chatId, item.storeName ? item.storeName : item.name, item.photoUrl);
  }
})