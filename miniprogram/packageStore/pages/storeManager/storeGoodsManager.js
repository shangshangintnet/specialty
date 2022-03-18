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
    goodsList: [],
    appGoodsList: [],
    itemTypes: ["商铺商品", "平台商品"],
    itemStates: ["所有状态", "显示的商品", "隐藏的商品"],
    goodsType: 0,
    status: 0,
    pageNum: 1,
    beMore: true,
    type: 0,
    menu: 0,
    goodsNo: null,
  },

  onLoad: function (options) {
    that = this;
    this.setData({
      bar_Height: app.bar_Height,
      type: options.type
    })
  },
  onShow: function () {
    if (this.data.goodsType == 0) {
      this.setData({
        beMore: true,
        pageNum: 1,
        goodsList: []
      })
      this.getStoreGoods();
    } else {
      this.setData({
        beMore: true,
        pageNum: 1,
        appGoodsList: []
      })
      this.getAppGoods();
    }
  },
  onReachBottom: function () {
    if (this.data.beMore) {
      this.data.pageNum++;
      if (this.data.goodsType == 0) {
        this.getStoreGoods();
      } else {
        this.getAppGoods();
      }
    }
  },
  changeGoodNo(e) {
    this.setData({
      goodsNo: e.detail.value
    })
    if (e.detail.value == "" || e.detail.value == null) {
      if (this.data.goodsType == 0) {
        this.setData({
          beMore: true,
          pageNum: 1,
          goodsList: []
        })
        this.getStoreGoods();
      } else {
        this.setData({
          beMore: true,
          pageNum: 1,
          appGoodsList: []
        })
        this.getAppGoods();
      }
    } else {
      this.findGoodsByNo();
    }
  },
    findGoodsByNo: function () {
      httphelper.api('store/findStoreGoodsAll', {
        goodsNo: this.data.goodsNo
      }, (serverData) => {
        if (serverData.code == 200 && serverData.data.length != 0) {
          that.setData({
            goodsList: serverData.data
          })
        }
      });
    },
  getStoreGoods: function () {
    let data = {};
    if (this.data.status != 0) {
      data.status = this.data.status == 1 ? 1 : 0;
    }
    data.pageNum = this.data.pageNum;
    httphelper.api('store/findStoreGoodsAll', data, (serverData) => {
      if (serverData.code == 200 && serverData.data.length != 0) {
        that.setData({
          goodsList: that.data.goodsList.concat(serverData.data)
        })
      } else {
        that.setData({
          beMore: false
        })
      }
      console.log(that.data.goodsList);
    });
  },
  getAppGoods: function () {
    let data = {};
    if (this.data.status != 0) {
      data.status = this.data.status == 1 ? 1 : 0;
    }
    data.pageNum = this.data.pageNum;
    httphelper.api('store/findPlatformGoods', data, (serverData) => {
      if (serverData.code == 200 && serverData.data.length != 0) {
        that.setData({
          appGoodsList: that.data.appGoodsList.concat(serverData.data)
        })
      } else {
        that.setData({
          beMore: false
        })
      }
      console.log(that.data.appGoodsList);
    });
  },
  changeType() {
    this.setData({
      menu: this.data.menu == 1 ? 0 : 1
    })
  },
  changeState() {
    this.setData({
      menu: this.data.menu == 2 ? 0 : 2
    })
  },
  swapTitle(e) {
    this.setData({
      menu: 0
    })
    if (this.data.goodsType == e.currentTarget.dataset.index)
      return;
    if (e.currentTarget.dataset.index == 0) {
      that.setData({
        beMore: true,
        goodsType: e.currentTarget.dataset.index,
        pageNum: 1,
        goodsList: []
      })
      this.getStoreGoods();
    } else {
      that.setData({
        beMore: true,
        goodsType: e.currentTarget.dataset.index,
        pageNum: 1,
        appGoodsList: []
      })
      this.getAppGoods();
    }
  },
  swapState(e) {
    this.setData({
      menu: 0
    })
    if (this.data.status == e.currentTarget.dataset.index)
      return;
    if (this.data.goodsType == 0) {
      that.setData({
        beMore: true,
        status: e.currentTarget.dataset.index,
        pageNum: 1,
        goodsList: []
      })
      this.getStoreGoods();
    } else {
      that.setData({
        beMore: true,
        status: e.currentTarget.dataset.index,
        pageNum: 1,
        appGoodsList: []
      })
      this.getAppGoods();
    }
  },
  goGoods: function (e) {
    if (this.data.goodsType == 0) {
      let good = this.data.goodsList[e.currentTarget.dataset.index];
      if (good.controlStatus == 0) {
        wx.showToast({
          icon: "none",
          title: '商品未上架，不可预览',
        })
        return;
      }
      wx.navigateTo({
        url: '/packageStore/pages/storeGoodsDetail/storeGoodsDetail?goodsId=' + good.id
      });
    } else {
      let good = this.data.appGoodsList[e.currentTarget.dataset.index];
      if (good.controlStatus == 0) {
        wx.showToast({
          icon: "none",
          title: '商品未上架，不可预览',
        })
        return;
      }
      wx.navigateTo({
        url: '/pages/goods/goods_detail?goodsId=' + good.id
      });
    }
  },
  upGoods: function (e) {
    if (this.data.goodsType == 0) {
      let good = this.data.goodsList[e.currentTarget.dataset.index];
      let data = {};
      data.ids = good.id;
      data.status = 1;
      httphelper.api('store/updateGoodsControlStatus', data, (serverData) => {
        if (serverData.code == 200) {
          good.controlStatus = 1;
          if (this.data.status == 2) {
            that.data.goodsList.splice(e.currentTarget.dataset.index, 1);
          }
          let temp = that.data.goodsList;
          that.setData({
            goodsList: temp
          })
        }
      });
    } else {
      let good = this.data.appGoodsList[e.currentTarget.dataset.index];
      let data = {};
      data.ids = good.id;
      data.status = 1;
      httphelper.api('store/updatePlatformGoods', data, (serverData) => {
        if (serverData.code == 200) {
          good.display = 1;
          if (this.data.status == 2) {
            that.data.appGoodsList.splice(e.currentTarget.dataset.index, 1);
          }
          let temp = that.data.appGoodsList;
          that.setData({
            appGoodsList: temp
          })
        }
      });
    }
  },
  downGoods: function (e) {
    if (this.data.goodsType == 0) {
      let good = this.data.goodsList[e.currentTarget.dataset.index];
      let data = {};
      data.ids = good.id;
      data.status = 0;
      httphelper.api('store/updateGoodsControlStatus', data, (serverData) => {
        if (serverData.code == 200) {
          good.controlStatus = 0;
          if (this.data.status == 1) {
            that.data.goodsList.splice(e.currentTarget.dataset.index, 1);
          }
          let temp = that.data.goodsList;
          that.setData({
            goodsList: temp
          })
        }
      });
    } else {
      let good = this.data.appGoodsList[e.currentTarget.dataset.index];
      let data = {};
      data.ids = good.id;
      data.status = 0;
      httphelper.api('store/updatePlatformGoods', data, (serverData) => {
        if (serverData.code == 200) {
          good.display = 0;
          if (this.data.status == 1) {
            that.data.appGoodsList.splice(e.currentTarget.dataset.index, 1);
          }
          let temp = that.data.appGoodsList;
          that.setData({
            appGoodsList: temp
          })
        }
      });
    }
  },
  deleteGoods: function (e) {
    if (this.data.goodsType == 0) {
      wx.showModal({
        title: '删除商品',
        content: '确定彻底删除商铺商品吗，删除后将无法找回',
        confirmText: "删除",
        success: function (res) {
          if (res.confirm) {
            let good = that.data.goodsList[e.currentTarget.dataset.index];
            let data = {};
            data.id = good.id;
            httphelper.api('store/delGoods', data, (serverData) => {
              if (serverData.code == 200) {
                that.data.goodsList.splice(e.currentTarget.dataset.index, 1);
                let temp = that.data.goodsList;
                that.setData({
                  goodsList: temp
                })
              }
            });
          }
        },
      })
    } else {
      let good = this.data.appGoodsList[e.currentTarget.dataset.index];
      let data = {};
      data.ids = good.id;
      httphelper.api('store/delPlatformGoods', data, (serverData) => {
        if (serverData.code == 200) {
          that.data.appGoodsList.splice(e.currentTarget.dataset.index, 1);
          let temp = that.data.appGoodsList;
          that.setData({
            appGoodsList: temp
          })
        }
      });
    }
  },
  editGoods: function (e) {
    let good = this.data.goodsList[e.currentTarget.dataset.index];
    if (this.data.type < 2) {
      wx.showToast({
        icon: 'none',
        title: '仅外来商铺可编辑商品'
      });
      return;
    }
    app.editStoreGood = good;
    wx.navigateTo({
      url: './storeGoodsEdit'
    });
  },
  addStoreGood: function () {
    if (this.data.type < 2) {
      wx.showToast({
        icon: 'none',
        title: '仅外来商铺可添加商品'
      });
      return;
    }
    wx.navigateTo({
      url: './storeGoodsEdit'
    });
  },
  addPlatformGood: function () {
    wx.navigateTo({
      url: './storeAddPlatForm'
    });
  },


})