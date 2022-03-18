let livePlayer = requirePlugin('live-player-plugin')
App({
  onLaunch(options) {
    if (!wx.cloud) {
      console.error('云函数初始化失败');
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }
    //分享出去可以带参数
    wx.showShareMenu({
      withShareTicket: true
    });
    // 基本数据
    // this.url = 'http://192.168.0.102:8080/'; //内网地址/
    // this.url = 'http://39.105.211.46:8081/'; //测试服地址
    this.url = 'https://api.ssw88.com/'; //正式服地址
    this.errMsg = "";
    this.appid = "wx08d3c73ac0c0cdb6";
    this.ssoToken = '';
    this.userId = ''; //自己的userId
    this.receiveStatus = 0; //0本次登陆不提示新手奖励 1本次登陆 提示新手奖励
    this.isShare = 0; //默认不是分享打开
    this.introduce = '4.0.1';
    this.goodsShop = 1; //商品商店id
    this.bar_Height = wx.getSystemInfoSync().statusBarHeight;
    this.isShowLogin = false;
    this.showRedPacket = 0; //0从未打开 1正在打开 2已打开
    this.appShare = [];
    this.appDrawId = 0;
    this.appDraw = false;
    this.saveCall = null;
    this.resolveCall = function () {
      if (this.saveCall != null) {
        this.saveCall();
      }
      this.saveCall = null;
    };
    if (wx.getStorageSync('ssoToken') && wx.getStorageSync('ssoToken') != "") {
      this.ssoToken = wx.getStorageSync('ssoToken');
    }
    if (wx.getStorageSync('userId') && wx.getStorageSync('userId') != "") {
      this.userId = wx.getStorageSync('userId');
    }
    //清楚storage
    // wx.clearStorageSync();
    // 根据进入卡片选择需要打开的界面
    if (options.query.userId) {
      if (options.query.userId == '') return;
      //设置推荐人Id(通过推荐人进入应用)
      try {
        wx.setStorageSync('inviter', options.query.userId);
      } catch (e) {
        wx.setStorage({
          data: options.query.userId,
          key: 'inviter',
        })
      }
      console.log("inviter userId" + options.query.userId);
    }
    if (options.path) {
      if (options.query.goodsId) {
        this.isShare = 1;
      } else if (options.query.typeKindId) {
        this.isShare = 1;
      } else {
        if (options.query.scene) {
          this.isShare = 1;
          var scene = decodeURIComponent(options.query.scene)
          //从服务端发布API识别图片进入应用
          var s = scene.split('@');
          var _userId = s[0];
          console.log('scene=' + scene + ' _userId=' + _userId);
          //设置推荐人Id(通过推荐人进入应用)
          try {
            wx.setStorageSync('inviter', _userId);
          } catch (e) {
            wx.setStorage({
              data: _userId,
              key: 'inviter',
            })
          }
        }
      }
    }
    let that = this;
    var postdata = [];
    wx.request({
      url: this.url + 'classification/commodityIntroductionMin',
      data: postdata,
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success(res) {
        if (res.data.data.shareMessages != undefined) {
          that.appShare = res.data.data.shareMessages;
        }
        if (res.data.data.luckDrawId != 0) {
          that.appDrawId = res.data.data.luckDrawId;
          that.appDraw = that.appDrawId == 0 ? false : true;
        }
        if (res.data.data.introduce && that.introduce == res.data.data.introduce) {
          that.goodsShop = 1;
        } else {
          that.goodsShop = 0;
        }
      },
      complete(res) {}
    })
    //特殊字体
    wx.loadFontFace({
      family: 'SYST',
      source: 'url("https://img.ssw88.com/SIMSUN.otf")',
      success: res => {
        console.log('font load success', res)
      },
      fail: err => {
        console.log('font load fail', err)
      }
    })
  },
  onShow(options) {
    console.log(options);
    // 获取分享卡片链接参数
    // 分享卡片入口场景才调用getShareParams接口获取以下参数
    if (options.scene == 1007 || options.scene == 1008 || options.scene == 1044) {
      livePlayer.getShareParams()
        .then(res => {
          //设置推荐人Id(通过推荐人进入应用)
          try {
            wx.setStorageSync('inviter', res.custom_params.pid);
          } catch (e) {
            wx.setStorage({
              data: res.custom_params.pid,
              key: 'inviter',
            })
          }
        }).catch(err => {
          console.log('get share params', err)
        })
    }

    let that = this;
    //第一次从微信群进入小程序
    if (options.shareTicket) {
      if (!wx.getStorageSync('openGid') || wx.getStorageSync('openGid') == "") {
        this.shareTicket = options.shareTicket;
        wx.getShareInfo({
          shareTicket: options.shareTicket,
          success(res) {
            that.iv = res.iv;
            that.encryptedData = res.encryptedData;
          },
          complete(res) {}
        })
      }
    }
    if (options.query.userId) {
      //设置推荐人Id(通过推荐人进入应用)
      try {
        wx.setStorageSync('inviter', options.query.userId);
      } catch (e) {
        wx.setStorage({
          data: options.query.userId,
          key: 'inviter',
        })
      }
      console.log("inviter userId" + options.query.userId);
    }
    if (options.path) {
      if (options.query.goodsId || options.query.guessingId || options.query.typeKindId) {
        this.isShare = 1;
      }
    }
  },
  globalData: {
    //video-swiper
    step: 0,
    //Im
    userInfo: null,
    imService: null,
  },
  formatDate: function (time) {
    const date = new Date(time);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    return [month, day].map(this.formatNumber).join('-') + ' ' + [hour, minute].map(this.formatNumber).join(':');
  },
  formatNumber: function (n) {
    n = n.toString();
    return n[1] ? n : '0' + n;
  },
})