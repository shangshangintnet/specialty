// miniprogram/pages/myself/myshare/myshare.js
const httphelper = require('../../../../httphelper.js')
const common = require('../../../../common.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    no_title: "",
    sections: 0,
    curSect: 0,
    swipeCurrent: 0,
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    now: ((new Date()).getTime() / 1000),
  },
  jumpTo: common.jumpTo,
  goBack: function () {
    console.log("goBack");
    common.goBack();
  },
  stopTouchMove: function () {
    return false;
  },
  getCash: function () {
    if (this.data.withdrawable >= 1) {
      wx.showModal({
        title: '恭喜您可以提现~',
        content: '下载App即可提现',
        confirmText: "立刻前往",
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/loadApp/loadApp'
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      wx.showModal({
        title: '抱歉您的提现金额不足~',
        content: '立即分享赚钱吧',
        confirmText: "立刻分享",
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: 'myposter/myposter',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },
  onGetData: function () {
    let that = this;
    httphelper.api("myInformation/getFriendsToShare", null, function (server_data) {
      if (server_data.code == 200) {
        that.setData(server_data.data);
        that.setData({
          _obtainMessageList: that.reMakeData(server_data.data.obtainMessageList)
        })
      }

      httphelper.api("myInformation/getFriendsList", null, function (server_data) {
        if (server_data.code == 200) {
          that.setData(server_data.data);
          that.setData({
            _friendsList: that.reMakeData(server_data.data.friendsList)
          })

          that.setData({
            sections: parseInt(server_data.data.friendsList.length / 200),
            curSect: 0
          })

          console.log(that.data._friendsList);
        }
      })
    })
  },
  getChange: function (e) {
    let idx = e.detail.current;
    //console.log(idx);
    if (idx == 50) {
      //console.log("changeNext");
      let curSet = this.data.curSect;
      if (curSet + 1 >= this.data.sections) {
        curSet = 0;
      } else {
        curSet++;
      }

      this.setData({
        curSect: curSect,
        swipeCurrent: 0
      })
    }
  },
  reMakeData: function (data) {
    let tmp = [];

    for (let i = 0; i < data.length; ++i) {
      let x = parseInt(i / 4);
      // console.dir(x);
      if (i % 4 == 0) {
        tmp[x] = [];
      }
      // console.dir(tmp[x]);
      tmp[x].push(data[i]);
    }


    return tmp;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onGetData();
    this.setData({
      no_title: options.title
    });
    wx.hideShareMenu();
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

  }
})