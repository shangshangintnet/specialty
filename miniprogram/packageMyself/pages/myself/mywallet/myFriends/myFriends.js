// miniprogram/pages/myself/mywallet/myFriends/myFriends.js

const common = require('../../../../../common.js');
const httphelper = require('../../../../../httphelper.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    param: "",
    couponId: "",
    straightList: [],
  },
  /**
  * 生命周期函数--监听页面加载
  */
  onLoad: function (options) {
    if (options.card == 1) {
      this.setData({
        type: 1,
        cardId: options.id,
        count: options.count
      })
    } else {
      this.setData({
        type: 0,
        couponId: options.couponId
      })
    }
    this.onGetData();
  },
  onGetData: function () {
    let that = this;
    let data = {};
    if (that.data.param != "") {
      data.param = that.data.param;
    } else {
      data = null;
    }
    httphelper.api("myInformation/giftGiving", data, (server_data) => {
      that.setData(server_data.data);
    })
  },
  bindGoodsName: function (e) {
    this.setData({
      param: e.detail.value.replace(/\s*/g, "")
    })
    this.onGetData();
  },
  chooseFriend: function (event) {
    let that = this;
    let userId = event.currentTarget.dataset.userId;
    let userName = event.currentTarget.dataset.userName;
    if (this.type == 0) {
      wx.showModal({
        title: '优惠券转赠',
        content: '确定要将优惠券转赠给好友' + userName + '吗?',
        success(res) {
          if (res.confirm) {
            httphelper.api("myInformation/givingCoupon", {
              id: that.data.couponId,
              userId: userId
            }, function (data) {
              if (data.code == 200) {
                common.goBackAfterMsg("转赠成功");
              }
            })
          }
        }
      })
    } else {
      wx.showModal({
        title: '购物卡转增',
        content: '确定要将购物卡转赠给好友' + userName + '吗?',
        success(res) {
          if (res.confirm) {
            httphelper.api("myInformation/givingGiftCard", {
              id: that.data.cardId,
              userId: userId,
              count: that.data.count
            }, function (data) {
              if (data.code == 200) {
                common.goBackAfterMsg("转赠成功");
              }
            });
          }
        }
      });
    }

  },
})