// packageMyself/pages/myself/mywallet/card/myCard.js
const httphelper = require('../../../../../httphelper.js');
const common = require('../../../../../common.js');
const app = getApp();
let that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: 0,
    list: [],
    tagSelect: 0,
    ecardCount: 0,
    //卡密
    number: '',
    giveItem: {},
    giveCount: 0,
    show: false,
    zIndex: 800,
    shareWx: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.tagSelect) {
      this.setData({
        tagSelect: options.tagSelect,
        bar_Height: app.bar_Height
      })
    } else {
      this.setData({
        bar_Height: app.bar_Height
      })
    }
    that = this;
  },

  onLogin: function () {
    if (!app.isShowLogin) {
      let that = this;
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.getData();
      }
    }else{
      that.getData();

    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onLogin();
  },
  getData() {
    httphelper.api("myInformation/myGiftCard", null, (serverData) => {
      that.setData({
        list: serverData.data.giftCardList,
        ecardCount: serverData.data.giftCardList.length,
      })
    });
  },
  toggle(e) {
    let index = parseInt(e.currentTarget.dataset.index);
    if (this.data.tagSelect == index)
      return;
    this.setData({
      tagSelect: index
    })
  },
  click_detail() {
    wx.navigateTo({
      url: './cardDetail'
    })
  },
  toFriends(e) {
    let item = e.currentTarget.dataset.item;
    this.setData({
      giveItem: item,
      giveCount: 1,
      show: true
    })
  },
  close_give() {
    this.setData({
      show: false,
      shareWx: false
    })
  },
  bindChange_sub() {
    if (this.data.giveCount > 1)
      this.setData({
        giveCount: this.data.giveCount - 1
      })
  },
  bindChange_add() {
    if (this.data.giveCount < this.data.giveItem.count)
      this.setData({
        giveCount: this.data.giveCount + 1
      })
  },
  goFriend() {
    //转增上商
    wx.navigateTo({
      url: '../myFriends/myFriends?card=1&id=' + this.data.giveItem.id + '&count=' + this.data.giveCount
    });
    this.setData({
      show: false,
    })
  },
  toChange(e) {
    let item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: './exchangeCard?id=' + item.id + '&price=' + item.price + '&imageUrl=' + item.imageUrl + '&count=' + item.count
    })
  },
  toBuyCards() {
    wx.navigateTo({
      url: './buyCards'
    })
  },
  changeNumber(e) {
    this.setData({
      number: e.detail.value
    })
  },
  exchangeCard() {
    //实体卡兑换
    const data = {};
    data.cardPassWord = that.data.number;
    httphelper.api("myInformation/useEntityGiftCard", data, (serverData) => {
      wx.showToast({
        icon: "none",
        title: serverData.msg
      })
    });
  },
  goBack() {
    wx.redirectTo({
      url: '../mywallet'
    });
  },
  goWxShare() {
    //转增微信
    let data = {};
    data.id = this.data.giveItem.id;
    data.count = this.data.giveCount;
    httphelper.api("myInformation/giftCardShare", data, (serverData) => {
      if (serverData.code == 200) {
        let path = 'pages/receivePacket/receivePacket?scene=' + app.userId + '&id=' + serverData.data.id;
        let title = "送您一张" + that.data.giveItem.content + ",快来领取吧!";
        let imgUrl = that.data.giveItem.imageUrl.replace('.png', '_1.jpg');
        that.setData({
          sharePath: path,
          shareTitle: title,
          shareImg: imgUrl,
          shareWx: true
        })
      }
    });
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    this.setData({
      shareWx: false,
      show: false
    })
    return {
      title: this.data.shareTitle,
      path: this.data.sharePath,
      imageUrl: this.data.shareImg
    }
  }
})