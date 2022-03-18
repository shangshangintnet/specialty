// miniprogram/pages/myself/shopAddress/shopAddress.js
const httphelper = require('../../../../httphelper.js')
var common = require("../../../../common.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    shopdata: [],
    areaName: "北京市",
    areaLength: 0,
    searchCity: false,
    cityName: "",
    finalName: "北京市",
  },
  searchCity: function () {
    let that = this;
    this.setData({
      searchCity: !this.data.searchCity
    })
  },

  queryCity: function () {
    let that = this;
    httphelper.api("classification/citySearchPageInformation", null, (serverdata) => {
      if (serverdata.code == 200) {
        that.setData(serverdata.data)
      }
    })
  },

  clearCities: function () {
    this.setData({
      areaNameList: null
    })
  },
  getCities: function () {
    let data = {};
    let that = this;
    data.areaName = this.data.cityName;
    httphelper.api("classification/queryStoreCityAddress", data, (serverdata) => {
      if (serverdata.code == 200) {
        that.setData(serverdata.data);
      }
    })
  },

  bindAreaName: function (e) {
    if (this.data.searchCity) {
      this.setData({
        cityName: e.detail.value.replace(/\s*/g, "")
      })

      if (this.data.cityName == "") {
        this.clearCities();
      } else {
        this.getCities();
      }
    } else {
      this.setData({
        areaName: e.detail.value.replace(/\s*/g, "")
      })

      if (this.data.areaName == "") {
        this.clearAreaAddress();
      } else {
        this.getAreaAddress();
      }
    }

  },
  changeAreaName: function (event) {
    if (this.data.searchCity) {
      this.setData({
        finalName: event.currentTarget.dataset.areaName
      })
    }
    this.setData({
      areaName: event.currentTarget.dataset.areaName,
      searchCity: false
    })
    this.getAreaAddress();
  },
  clearAreaAddress: function () {
    this.setData({
      areaLength: 0
    })
  },
  getAreaAddress: function () {
    var postdata = [];
    postdata.areaName = this.data.areaName; //options.areaName;
    let that = this;
    httphelper.api("classification/enquiryStores", postdata, function (serverdata) {
      if (serverdata.data != null) {
        if (serverdata.data.enquiryGoodss != null) {
          serverdata.data.enquiryGoodss.map((val) => {
            if (val.desc != null && val.desc != "") {
              let s = val.desc.split('@');
              val.content_1 = s[0];
              val.content_2 = s[1];
            }
          })
          that.setData({
            shopdata: serverdata.data.enquiryGoodss,
            areaLength: serverdata.data.enquiryGoodss.length
          })
        }
      } else {
        that.setData({
          shopdata: [],
          areaLength: 0
        })
      }

    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //隐藏分享
    wx.hideShareMenu();
    this.queryCity();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getAreaAddress();
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

  },

  //模糊搜索城市门店
  onFindCityShopVague: function (e) {
    var postdata = [];
    postdata.storeName = e.currentTarget.dataset.storeName;
    let that = this;
    httphelper.api("classification/enquiryStoresByName", postdata, function (serverdata) {
      that.setData({})
    });
  },

  //选择城市
  onFindCityVague: function (e) {
    let that = this;
    httphelper.api("classification/citySearchPageInformation", postdata, function (serverdata) {
      that.setData({})
    });
  },


  //搜索城市
  onFindCityVague: function (e) {
    var postdata = [];
    postdata.storeName = e.currentTarget.dataset.storeName;
    let that = this;
    httphelper.api("classification/queryStoreCityAddress", postdata, function (serverdata) {
      that.setData({})
    });
  },

  //打开地图
  openLocation: function (event) {
    var index = event.currentTarget.dataset.locateIndex;
    var locate = this.data.shopdata[index];
    wx.getLocation({
      success(res) {
        wx.openLocation({ //​使用微信内置地图查看位置。
          latitude: parseFloat(locate.latitude), //要去的纬度-地址
          longitude: parseFloat(locate.longitude), //要去的经度-地址
          name: locate.name,
          address: locate.address
        })
      }
    })
  }
})