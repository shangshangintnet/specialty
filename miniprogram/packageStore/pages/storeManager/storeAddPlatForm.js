const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
const app = getApp();
let that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: 0,
    active: 0,
    classifications: [],
    secondIdx: 0,
    secondClass: [{
      name: ''
    }],
    menuVisible: false,
    goodsDate: "goodsDate",
    goodsList: [],
    pageNum: 1,
    appGoodsIds: [],
    beMore: true,
    ready: 0,
  },

  onLoad: function () {
    that = this;
    this.setData({
      bar_Height: app.bar_Height * 2
    })
    this.getAppGoods();
    this.getdata();
  },
  onReachBottom: function () {
    if (this.data.beMore) {
      this.data.pageNum++;
      this.getGoodsData();
    }
  },
  getAppGoods: function () {
    httphelper.api('store/findPlatformGoodsId', null, (serverData) => {
      if (serverData.code == 200) {
        this.setData({
          appGoodsIds: serverData.data
        })
        that.onReadyGetdata();
      }
    });
  },
  getdata: function () {
    httphelper.api('classification/queryNavigation', null, (serverData) => {
      if (serverData.code == 200) {
        this.setData({
          classifications: serverData.data.classifications,
          secondClass: serverData.data.classifications[0].children,
        })
        that.onReadyGetdata();
      }
    });
  },
  onReadyGetdata: function () {
    this.data.ready++;
    if (this.data.ready == 2) {
      this.getGoodsData();
    }
  },
  getGoodsData: function () {
    let postdata = [];
    if (this.data.goodsDate == "goodsDate") {
      postdata.goodsDate = this.data.goodsDate;
    } else {
      postdata.goodsPrice = this.data.asc ? "asc" : "desc";
    }
    postdata.typeKindId = this.data.secondClass[this.data.secondIdx].id;
    postdata.pageNum = this.data.pageNum;
    httphelper.api("classification/commodityInformation", postdata, function (serverdata) {
      //分类商品
      if (serverdata.data == null) {
        that.setData({
          beMore: false
        })
        return;
      }
      if (serverdata.code == 400 || serverdata.data.goodsList == null || serverdata.data.goodsList.length == 0) {
        that.setData({
          beMore: false
        })
        return;
      }
      //校验数据
      if (that.data.appGoodsIds.length > 0) {
        for (let i = 0; i < serverdata.data.goodsList.length; ++i) {
          if (that.data.appGoodsIds.indexOf(serverdata.data.goodsList[i].id) > -1) {
            serverdata.data.goodsList[i].display = 1;
          }
        }
      }
      that.setData({
        goodsList: that.data.goodsList.concat(serverdata.data.goodsList)
      })
    });
  },
  //切换一级目录
  jumpOne: function (e) {
    let idx = parseInt(e.currentTarget.dataset.index);
    this.setData({
      active: idx,
      secondIdx: 0,
      secondClass: this.data.classifications[idx].children,
      beMore: true,
      pageNum: 1,
      goodsList: [],
    })
    this.getGoodsData();
  },
  //打开二级目录
  openMenu: function () {
    this.setData({
      menuVisible: !this.data.menuVisible
    })
  },
  close_secondMenu: function () {
    this.setData({
      menuVisible: false
    })
  },
  //切换二级目录
  swapSecondTitle: function (e) {
    let index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      menuVisible: false
    })
    if (this.data.secondIdx == index)
      return;
    //更换二级目录
    this.setData({
      secondIdx: index,
      beMore: true,
      pageNum: 1,
      goodsList: [],
    })
    this.getGoodsData();
  },
  //切换
  tagTo: function (e) {
    let index = parseInt(e.currentTarget.dataset.index);
    if (index == 0) {
      //最新
      this.setData({
        goodsDate: "goodsDate",
        beMore: true,
        pageNum: 1,
        goodsList: [],
      })
      this.getGoodsData();
    } else {
      //价格
      this.setData({
        goodsDate: "",
        asc: !this.data.asc,
        beMore: true,
        pageNum: 1,
        goodsList: [],
      })
      this.getGoodsData();
    }
  },
  upGoods: function (e) {
    let good = this.data.goodsList[parseInt(e.currentTarget.dataset.index)];
    let data = {};
    data.ids = good.id;
    httphelper.api('store/addPlatformGoods', data, (serverData) => {
      if (serverData.code == 200) {
        good.display = 1;
        let temp = that.data.goodsList;
        that.setData({
          goodsList: temp
        })
        that.data.appGoodsIds.push(good.id);
      }
    });
  },
  downGoods: function (e) {
    let good = this.data.goodsList[parseInt(e.currentTarget.dataset.index)];
    let data = {};
    data.ids = good.id;
    httphelper.api('store/delPlatformGoods', data, (serverData) => {
      if (serverData.code == 200) {
        good.display = 0;
        let temp = that.data.goodsList;
        that.setData({
          goodsList: temp
        })
        var index = that.data.appGoodsIds.indexOf(good.id);
        if (index > -1) {
          that.data.appGoodsIds.splice(index, 1);
        }
      }
    });
  },
  goGoods: function (e) {
    let good = this.data.goodsList[parseInt(e.currentTarget.dataset.index)];
    if (good.controlStatus == 0) {
      return;
    }
    wx.navigateTo({
      url: '/pages/goods/goods_detail?goodsId=' + good.id
    });
  },
})