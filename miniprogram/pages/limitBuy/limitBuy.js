// miniprogram/pages/limitBuy/limitBuy.js

const httphelper = require('../../httphelper.js')
const common = require('../../common.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    spikes: [],
    countDown: [],
    heights: [],
    currentPage: 0,
    isJump: false,
  },
  onGetData: function (callback) {
    let that = this;
    httphelper.api("spike/getInfo", null, function (server_data) {
      that.setData(server_data.data);
      that.makeLoop();
      that.makeHeight();

      if (callback != null) {
        callback();
      }
    })
  },
  onMoveToGoods: common.onMoveToGoods,
  makeLoop: function () {
    this.timeCount = [];
    let that = this;
    that.clearLoop();
    for (let i = 0; i < this.data.spikes.length; ++i) {
      that.refresh_time(i, this.data.spikes[i].times);
    }
  },
  clearLoop: function () {
    let that = this;
    for (let i = 0; i < this.data.spikes.length; ++i) {
      clearInterval(that.timeCount[i]);
    }
  },
  refresh_time: function (index, time) {

    let that = this;
    let str = "countDown[" + index + "]";
    let tmp = common.timeStamp(time);

    that.setData({
      [str]: tmp
    })

    that.timeCount[index] = setInterval(function () {
      --time;
      if (time > 0) {
        that.setData({
          [str]: common.timeStamp(time)
        })
        //console.dir(that.data.countDown);
      } else {
        clearInterval(that.timeCount[index]);
        //console.dir(that.data.countDown);
        that.onGetData();
      }
    }, 1000)
  },
  scrollTo: function (event) {
    let that = this;
    var idx = event.currentTarget.dataset.idx;
    // console.dir(idx);
    // console.dir(that.data.heights[idx]);
    that.setData({
      isJump: true
    })


    wx.pageScrollTo({
      scrollTop: that.data.heights[idx] - 120,
      complete() {
        that.setData({
          isJump: false
        })
      }
    })
    that.setData({
      currentPage: idx
    })
  },
  makeHeight: function () {
    let that = this;
    for (let i = 0; i < this.data.spikes.length; ++i) {
      wx.createSelectorQuery().select('#sec_' + i).boundingClientRect(function (rect) {
        let str = "heights[" + i + "]";
        that.setData({
          [str]: rect.top
        })
      }).exec();
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onGetData();
    //隐藏分享
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
    this.clearLoop();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.onGetData(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onPageScroll: function (res) {

    if (!this.data.isJump) {
      let height = res.scrollTop;
      let cur = 0;
      for (let i = 0; i < this.data.heights.length; ++i) {
        if (height - 54 > this.data.heights[i]) {
          cur = (i >= this.data.heights.length - 1) ? this.data.heights.length - 1 : i + 1;
        }
      }
      this.setData({
        currentPage: cur
      })
    }

  },
})