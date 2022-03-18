// miniprogram/pages/category/category.js
const httphelper = require('../../httphelper.js')
const common = require('../../common.js')
const app = getApp()

Page({
  data: {
    bar_Height: 0,
    windowHeight: 0,
    //二级筛选显示状态
    menuVisible: false,
    //滑动距离
    scrollToTop: 0,
    topLimit: 0,
    //当前二级目录索引
    index_one: 0,
    //当前筛选条件	typeKindId firstTypeId	secondTypeId	thirdTypeId	forthTypeId	fiveTypeId
    selectedType: {},
    //当前筛选
    curTypeId: [],
    //最新
    goodsDate: "goodsDate",
    //默认升序
    asc: true,
    //当前分类
    page_infos: [],
    //分类信息
    classifications: [],
    //分类商品
    goods: [],
    //分类为空
    goodsEmpty: true,
    //标题
    set_title: "",
    //切页
    tag_index: 0,
    //当前高级筛选数据
    curHightData: [],
    show: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let key = "page_infos.name";
    this.setData({
      bar_Height: app.bar_Height,
      topLimit: 180 - app.bar_Height,
      windowHeight: wx.getSystemInfoSync().windowHeight,
      [key]: options.title,
    })
    if (options.typeKindId != null) {
      key = "selectedType.typeKindId";
      this.setData({
        [key]: options.typeKindId
      })
      this.getNewData();
    }
    if (options.firstTypeId != null || options.secondTypeId != null) {
      if (options.firstTypeId) {
        key = "selectedType.firstTypeId";
        this.setData({
          [key]: options.firstTypeId,
        })
      }
      if (options.secondTypeId) {
        key = "selectedType.secondTypeId";
        this.setData({
          [key]: options.secondTypeId,
        })
      }
      this.getNewData();
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.selectComponent("#guess_what").setGoodsValue(this.goods);
  },
  onPageScroll: function (res) {
    let num = 0;
    num = res.scrollTop / 120;
    if (num > 1) num = 1;
    this.setData({
      scrollToTop: res.scrollTop,
      set_title: num == 1 ? this.data.page_infos.name : ""
    })
    this.selectComponent("#navbar").setOpacity(num);
  },
  onReachBottom: function () {
    let data = {};
    data = this.data.selectedType;
    if (this.data.goodsDate == "goodsDate") {
      data.goodsDate = this.data.goodsDate;
    } else {
      data.goodsPrice = this.data.asc ? "asc" : "desc";
    }
    this.selectComponent("#guess_what").onQueryNext("classification/commodityInformation", data, "goodsList");
  },
  getNewData: function () {
    let that = this;
    let postdata = [];
    if (this.data.goodsDate == "goodsDate") {
      postdata.goodsDate = this.data.goodsDate;
    } else {
      postdata.goodsPrice = this.data.asc ? "asc" : "desc";
    }
    if (this.data.selectedType.typeKindId)
      postdata.typeKindId = this.data.selectedType.typeKindId;
    if (this.data.selectedType.firstTypeId)
      postdata.firstTypeId = this.data.selectedType.firstTypeId;
    if (this.data.selectedType.secondTypeId)
      postdata.secondTypeId = this.data.selectedType.secondTypeId;
    if (this.data.selectedType.thirdTypeId)
      postdata.thirdTypeId = this.data.selectedType.thirdTypeId;
    if (this.data.selectedType.forthTypeId)
      postdata.forthTypeId = this.data.selectedType.forthTypeId;
    if (this.data.selectedType.fiveTypeId)
      postdata.fiveTypeId = this.data.selectedType.fiveTypeId;
    httphelper.api("classification/commodityInformation", postdata, function (serverdata) {
      for (let i = 0; i < serverdata.data.classifications.length; ++i) {
        if (serverdata.data.classification.id == serverdata.data.classifications[i].id) {
          that.setData({
            index_one: i,
            curHightData: serverdata.data.classifications[i].children
          })
          break;
        }
      }
      let key = "selectedType.typeKindId";
      that.setData({
        classifications: serverdata.data.classifications,
        page_infos: serverdata.data.classification,
        goods: serverdata.data.goodsList,
        goodsEmpty: serverdata.data.goodsList == null,
        [key]: serverdata.data.classification.id,
      })
      that.resetTypeId();
      that.selectComponent("#guess_what").setGoodsValue(serverdata.data.goodsList);
      that.resetScroll();
    });
  },
  //打开二级目录
  openMenu: function () {
    this.setData({
      menuVisible: !this.data.menuVisible
    })
  },
  //切换二级目录
  swapSecondTitle: function (e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      menuVisible: false
    })
    if (this.data.index_one == index)
      return;
    //更换二级目录
    let key = "selectedType.typeKindId"
    this.setData({
      index_one: index,
      selectedType: {},
      [key]: this.data.classifications[index].id
    })
    this.getNewData();
  },
  //切换
  tagTo: function (e) {
    let index = parseInt(e.currentTarget.dataset.tag);
    if (index == 0) {
      //最新
      this.setData({
        goodsDate: "goodsDate"
      })
      this.getNewData();
    } else if (index == 1) {
      //价格
      this.setData({
        goodsDate: "",
        asc: !this.data.asc
      })
      this.getNewData();
    } else {
      //高级筛选
      this.setData({
        show: true
      })
    }
  },
  //福利券购买
  jumpToWelafre: function (event) {
    if (this.data.selectedType.typeKindId == 8001) {
      wx.navigateTo({
        url: '/packageMyself/pages/myself/mywallet/welfareTicket/welfareTicket'
      });
    }
  },
  //滚动回最初
  resetScroll: function () {
    if (this.data.scrollToTop > this.data.topLimit) {
      wx.pageScrollTo({
        duration: 0,
        scrollTop: this.data.topLimit
      });
    }
  },
  //关闭高级筛选
  close_hight: function () {
    this.resetTypeId();
    this.setData({
      show: false
    })
  },
  //确认高级筛选
  confirm_hight: function () {
    for (let i = 0; i < this.data.curHightData.length; i++) {
      switch (i) {
        case 0:
          this.data.selectedType.firstTypeId = this.data.curTypeId[i];
          break;
        case 1:
          this.data.selectedType.secondTypeId = this.data.curTypeId[i];
          break;
        case 2:
          this.data.selectedType.thirdTypeId = this.data.curTypeId[i];
          break;
        case 3:
          this.data.selectedType.forthTypeId = this.data.curTypeId[i];
          break;
        case 4:
          this.data.selectedType.fiveTypeId = this.data.curTypeId[i];
          break;
      }
    }
    this.setData({
      show: false
    });
    this.getNewData();
  },
  selectForth: function (e) {
    let data = e.currentTarget.dataset.data;
    let index = e.currentTarget.dataset.index;
    var temp = this.data.curTypeId;
    temp[index] = data.id;
    this.setData({
      curTypeId: temp
    })
  },
  resetTypeId: function () {
    this.setData({
      curTypeId: []
    })
    if (this.data.selectedType.firstTypeId)
      this.data.curTypeId.push(this.data.selectedType.firstTypeId);
    else
      this.data.curTypeId.push(this.data.selectedType.typeKindId + '11');
    if (this.data.selectedType.secondTypeId)
      this.data.curTypeId.push(this.data.selectedType.secondTypeId);
    else
      this.data.curTypeId.push(this.data.selectedType.typeKindId + '21');
    if (this.data.selectedType.thirdTypeId)
      this.data.curTypeId.push(this.data.selectedType.thirdTypeId);
    else
      this.data.curTypeId.push(this.data.selectedType.typeKindId + '31');
    if (this.data.selectedType.forthTypeId)
      this.data.curTypeId.push(this.data.selectedType.forthTypeId);
    else
      this.data.curTypeId.push(this.data.selectedType.typeKindId + '41');
    if (this.data.selectedType.fiveTypeId)
      this.data.curTypeId.push(this.data.selectedType.fiveTypeId);
    else
      this.data.curTypeId.push(this.data.selectedType.typeKindId + '51');
  },
})