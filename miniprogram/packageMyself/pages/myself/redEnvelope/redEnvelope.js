const common = require('../../../../common.js');
const httphelper = require('../../../../httphelper.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    maxPrice: 200,
    maxCount: 20,
    value: "",
    count: "",
    shareBcg: "",
    isCheck: false,
    showShare: false,
    giftId: "",
    redBalanceStatus: 0,
    redBalanceNum: "",
    type: 0,
    appDraw: false

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onGetWallet();
    this.onGetPic();
  },
  jumpTo: common.jumpTo,
  switch2Change: function (e) {
    this.setData({
      type: e.detail.value == true ? 1 : 0
    })
    this.bindCheck();
  },
  onGetWallet: function () {
    let that = this;
    httphelper.api("myInformation/myWallet", null, (server_data) => {
      if (server_data.code == 200) {
        that.setData({
          maxCount: server_data.data.redBalanceCount,
          maxPrice: server_data.data.userWallet.balance > server_data.data.redBalancePrice ? server_data.data.redBalancePrice : server_data.data.userWallet.balance,
          balance: server_data.data.userWallet.balance,
          redBalanceNum: server_data.data.redBalanceNum,
          redBalanceStatus: server_data.data.redBalanceStatus,
          appDraw: getApp().appDraw
        })
      }
    })
  },
  isNumber: function (val) {
    var regPos = /^\d+(\.\d+)?$/; //非负浮点数
    var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
    if (regPos.test(val) || regNeg.test(val)) {
      return true;
    } else {
      return false;
    }
  },
  bindMoney: function (e) {
    let num = e.detail.value;
    if (!this.isNumber(num)) num = 0;
    if (num <= 0) {
      num = 0;
    }
    if (num > this.data.maxPrice) {
      num = this.data.maxPrice;
      wx.showToast({
        title: '红包金额最多不超过' + this.data.maxPrice + '元',
        icon: 'none'
      })
    }


    this.setData({
      value: num,
      realValue: parseFloat(num).toFixed(2)
    })
    this.bindCheck();
  },
  bindCount: function (e) {
    let num = e.detail.value;
    if (num <= 0) {
      num = 0;
    };
    if (num > this.data.maxCount) num = this.data.maxCount;
    this.setData({
      count: parseInt(num)
    })
    this.bindCheck();
  },
  bindCheck: function () {
    if (this.data.type == 0) {
      this.setData({
        isCheck: this.data.value > 0 && this.data.count > 0 ? true : false
      })
    } else {
      this.setData({
        isCheck: this.data.value > 0 ? true : false
      })
    }
  },
  sendMoney: function () {
    let that = this;

    if (!this.data.isCheck) {
      wx.showToast({
        title: '请填写完整~',
        icon: 'none',
      })
    } else {
      httphelper.api("red/sendBalanceRedPacket", {
        price: this.data.value,
        count: this.data.type == 0 ? this.data.count : this.data.redBalanceNum,
        type: this.data.type
      }, function (server_data) {
        if (server_data.code == 200) {
          that.setData({
            giftId: server_data.data.id,
            showShare: true
          })

        }
        console.dir(server_data);
      })
    }
  },
  onGetPic: function () {
    let that = this;
    wx.getImageInfo({
      src: "https://img.ssw88.com/wechatImg/redBalance.jpg",
      success: function (res) {
        that.setData({
          shareBcg: res.path
        })
      }
    })
  },
  cancelShare: function () {
    this.setData({
      showShare: false
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let that = this;
    var id = getApp().userId;
    setTimeout(function () {
      that.cancelShare();
      common.goBack();
    }, 2000)
    let name = common.makeShareText(this.data.type == 0 ? 7 : 11);
    return {
      title: name,
      path: '/packageMyself/pages/myself/getEnvelope/getEnvelope?&scene=' + id + '@' + that.data.giftId,
      imageUrl: that.data.shareBcg
    }
  }
})