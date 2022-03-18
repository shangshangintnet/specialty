// miniprogram/pages/search/search.js
const common = require("../../common.js");
const httphelper = require("../../httphelper.js");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    search_type: "done",
    search_goods: true,
    goodsName: "",
    finishName: "",
    isSearching: false,
    goodsDate: "goodsDate",
    goodsPrice: "asc",
    arrow_up: "/images/arrow_up.png",
    arrow_down: "/images/arrow_down.png",
    goodsLength: 0,

  },
  bindGoodsName: function (e) {
    this.setData({
      goodsName: e.detail.value.replace(/\s*/g, "")
    })

    // console.dir(this.data.goodsName);

    if (this.data.goodsName == "") {
      // console.dir("clearList")
      this.clearGoodsList();
    } else {
      this.queryGoodsName();
    }

  },
  clearGoodsList: function () {
    this.setData({
      goodsList: [],
      finishName: "",
      goodsLength: 0
    })
  },
  changeGoods: function (event) {
    //console.dir(event.currentTarget.dataset.goodsName);
    this.setData({
      goodsName: event.currentTarget.dataset.goodsName,
      goodsList: [],
    })
    this.searchGoods();
  },
  userSearchGoods: function () {
    this.clearGoodsList();
    this.searchGoods();
  },
  searchGoods: function () {
    let data = {};
    let that = this;
    data.goodsName = this.data.goodsName;

    if (this.data.goodsName == "") retrun;

    if (this.data.goodsDate != "") {
      data.goodsDate = this.data.goodsDate;
    } else {
      data.goodsPrice = this.data.goodsPrice;
    }
    var guess_what = this.selectComponent('#guess_what');
    //console.dir(guess_what);

    httphelper.api("classification/searchGoodsAll", data, (server_data) => {
      if (server_data.code == 200) {
        that.setData({
          goodsLength: server_data.data.goodsList == null ? 0 : server_data.data.goodsList.length
        })
        if (server_data.data.goodsList.length != 0) {
          guess_what.setGoodsValue(server_data.data.goodsList);
          that.setData({
            finishName: that.data.goodsName
          })
          that.setHistory(that.data.goodsName);
        } else {
          that.clearGoodsList();
        }
      }
    })
  },
  queryGoodsName: function () {
    let that = this;

    //console.dir(this.data);
    if (this.data.isSearching) return;
    let data = {};
    data.goodsName = this.data.goodsName;
    this.setData({
      isSearching: true
    })
    httphelper.api("classification/searchGoodsNameAll", data, (server_data) => {

      //console.dir(server_data);
      that.setData({
        isSearching: false,
      })

      if (server_data.code == 200) {
        that.setData({
          goodsList: server_data.data.goodsList
        })
      }

      if (this.data.goodsName != data.goodsName) {
        that.queryGoodsName();
      }
    })
  },
  toggleTag: function (event) {
    let tag = event.currentTarget.dataset.tagIndex;
    if (tag == 0) {
      this.setData({
        goodsDate: "goodsDate",
      })
    } else {
      let str = (this.data.goodsPrice == "asc") ? "desc" : "asc";
      this.setData({
        goodsDate: "",
        goodsPrice: str,
      })
    }

    this.searchGoods();

    wx.pageScrollTo({
      scrollTop: 0
    })
  },
  clearHistory: function (str) {
    let that = this;
    wx.showModal({
      title: '删除历史搜索',
      content: '您确定要删除历史搜索吗？',
      success: function () {
        let data = [];
        wx.setStorageSync('historySearch', data);
        that.setData({
          history: []
        })
      }
    })
  },
  setHistory: function (str) {
    let data = this.getHistory();
    if (data == "") {
      data = [];
    } else {
      if (data.length >= 10) {
        data.pop();
      }
    }
    data.push(str);
    data = this.unique(data);
    wx.setStorageSync('historySearch', data);
  },
  unique: function (arr) {
    var ret = [];
    for (var i = 0; i < arr.length; i++) {
      var item = arr[i];
      if (ret.indexOf(item) === -1) {
        ret.push(item)
      }
    }
    return ret
  },
  getHistory: function () {

    let data = wx.getStorageSync('historySearch');
    if (data != "") {
      this.setData({
        history: data.reverse()
      })
    } else {
      data = [];
    }



    return data;
  },
  getPopluar: function () {
    let that = this;
    httphelper.api("classification/popularSearch", null, (server_data) => {
      if (server_data.code == 200) {
        that.setData({
          popular: server_data.data.popularSearch
        })
      }
    })
  },


  goBack: common.goBack,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //隐藏分享
    wx.hideShareMenu();
    this.getHistory();
    this.getPopluar();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

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
    let data = {};
    data.goodsName = this.data.finishName;
    if (this.data.goodsDate != "") {
      data.goodsDate = this.data.goodsDate;
    } else {
      data.goodsPrice = this.data.goodsPrice;
    }
    this.selectComponent('#guess_what').onQueryNext("classification/searchGoodsAll", data, "goodsList");
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})