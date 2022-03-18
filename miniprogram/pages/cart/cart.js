// miniprogram/pages/cart/cart.js
const httphelper = require('../../httphelper.js')
var common = require("../../common.js");
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    storeList: [], //购物车
    similars: [], //推荐
    isEmpty: true,
    total: 0,
    isPicked: false,
    select_shopId: 0,
    edit_mode: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //隐藏分享
    wx.hideShareMenu();
  },
  toggleMode: function() {
    let that = this;
    this.setData({
      edit_mode: !that.data.edit_mode
    })
  },
  get_total_ids: function() {
    let goodsIds = [];

    for (var i = 0; i < this.data.storeList.length; ++i) {
      for (var j = 0; j < this.data.storeList[i]["goodsList"].length; ++j) {
        var goods = this.data.storeList[i]["goodsList"][j];
        if (goods.inventory >= 1 && goods.picked) {
          goodsIds.push(goods.id.toString());
        }
      }
    }
    return goodsIds;
  },
  get_total_json: function() {
    let goodsJson = [];

    for (var i = 0; i < this.data.storeList.length; ++i) {
      for (var j = 0; j < this.data.storeList[i]["goodsList"].length; ++j) {
        var goods = this.data.storeList[i]["goodsList"][j];
        if (goods.inventory >= 1 && goods.picked) {
          let tmp_data = {};
          tmp_data.goodsId = goods.id.toString();
          tmp_data.productQty = goods.inventory.toString();
          tmp_data.storeName = this.data.storeList[i].name;
          tmp_data.storeId = this.data.storeList[i].id.toString();
          goodsJson.push(tmp_data);
        }
      }
    }
    return goodsJson;
  },
  total_sum: function() {
    var total = 0;
    var items = 0;

    if (this.data.storeList == null) return;
    for (var i = 0; i < this.data.storeList.length; ++i) {
      for (var j = 0; j < this.data.storeList[i]["goodsList"].length; ++j) {
        var goods = this.data.storeList[i]["goodsList"][j];
        if (goods.inventory >= 1 && goods.picked) {
          total += goods.price * goods.inventory;
          items += goods.inventory;
        }
      }
    }
    this.setData({
      total: total,
      select_items: items
    })
  },
  goods_minus: function(event) {
    let that = this;
    var goods_idx = parseInt(event.currentTarget.dataset.goodsIdx);
    var shop_idx = parseInt(event.currentTarget.dataset.shopIdx);
    var cart = this.data.storeList;
    var number = cart[shop_idx]["goodsList"][goods_idx]["inventory"];

    let goods_id = cart[shop_idx]["goodsList"][goods_idx].id;

    this.reduceCart(goods_id, function(data) {
      if (data.code == 200) {
        --cart[shop_idx]["goodsList"][goods_idx]["inventory"];
        that.setData({
          storeList: cart
        })
        that.total_sum();
      }
    })

  },
  goods_add: function(event) {
    let that = this;

    var goods_idx = parseInt(event.currentTarget.dataset.goodsIdx);
    var shop_idx = parseInt(event.currentTarget.dataset.shopIdx);

    var cart = this.data.storeList;
    var number = cart[shop_idx]["goodsList"][goods_idx]["inventory"];

    let goods_id = cart[shop_idx]["goodsList"][goods_idx].id;

    this.increaseCart(goods_id, function(data) {
      if (data.code == 200) {
        cart[shop_idx]["goodsList"][goods_idx]["inventory"]++;
        that.setData({
          storeList: cart
        })
        that.total_sum();
      }
    });

  },
  clearShop: function(event) {
    var shop_id = parseInt(event.currentTarget.dataset.shopId);

    // console.dir(shop_id);
    this.setData({
      select_shopId: shop_id
    });


    this.cancelShop.show();
  },
  toogleGoods: function(event) {
    var goods_id = parseInt(event.currentTarget.dataset.goodsIdx);
    var shop_id = parseInt(event.currentTarget.dataset.shopIdx);
    var isPicked = this.data.storeList[shop_id].goodsList[goods_id].picked;

    let str = "storeList[" + shop_id + "].goodsList[" + goods_id + "].picked";
    this.setData({
      [str]: !isPicked
    })
    this.total_sum();
    this.checkShopPicked(shop_id);
  },
  checkShopPicked: function(shop_id) {
    var shop_data = this.data.storeList[shop_id];
    var isPicked = this.data.storeList[shop_id].picked;

    var checkPicked = true;
    for (var i = 0; i < shop_data["goodsList"].length; ++i) {
      if (!shop_data.goodsList[i].picked) {
        checkPicked = false;
        break;
      }
    }

    if (isPicked != checkPicked) {
      let str = "storeList[" + shop_id + "].picked"
      this.setData({
        [str]: checkPicked
      })
    }
    this.checkAllPicked();
  },
  checkAllPicked: function() {
    var isPicked = this.data.isPicked;
    var checkPicked = true;
    for (var i = 0; i < this.data.storeList.length; ++i) {
      if (!this.data.storeList[i].picked) {
        checkPicked = false;
        break;
      }
    }
    if (isPicked != checkPicked) {
      this.setData({
        isPicked: checkPicked
      })
    }
  },
  toggleShop: function(event) {
    var shop_id = parseInt(event.currentTarget.dataset.shopIdx);
    var shop_data = this.data.storeList[shop_id];
    var isPicked = this.data.storeList[shop_id].picked;
    for (var i = 0; i < shop_data["goodsList"].length; ++i) {
      shop_data.goodsList[i].picked = !isPicked;
    }

    shop_data.picked = !isPicked;

    let str = "storeList[" + shop_id + "]"

    this.setData({
      [str]: shop_data
    })

    this.total_sum();
    this.checkAllPicked();
  },
  toggleAll: function() {
    var store_list = this.data.storeList;
    var isPicked = this.data.isPicked;
    var attr = "picked";
    for (var i = 0; i < store_list.length; ++i) {
      store_list[i][attr] = !isPicked;

      for (var j = 0; j < store_list[i]["goodsList"].length; ++j) {
        store_list[i]["goodsList"][j][attr] = !isPicked;
      }
    }

    this.setData({
      storeList: store_list,
      isPicked: !isPicked
    })

    this.total_sum();

  },

  dataSetAttrPicked() {
    var attr = "picked";

    if (this.data.storeList == null) return;
    for (var i = 0; i < this.data.storeList.length; ++i) {
      this.data.storeList[i][attr] = false;

      for (var j = 0; j < this.data.storeList[i]["goodsList"].length; ++j) {
        this.data.storeList[i]["goodsList"][j][attr] = false;
      }
    }
  },

  _cancelShopEvent: function() {
    // console.dir("canceled");
  },
  _confirmEvent: function() {
    // console.dir("confirmed");
    var shop_id = this.data.select_shopId;
    var newData = this.data.storeList.filter(function(item) {
      return (item.id != shop_id)
    });

    var isEmpty = (newData.length == 0);

    this.setData({
      storeList: newData,
      isEmpty: isEmpty
    });

    this.checkAllPicked();
    this.total_sum();
  },

  increaseCart: function(goodsId, callback) {
    let data = {};
    data.goodsId = goodsId;
    httphelper.api("cart/increaseCart", data, function(data) {
      if (callback != null) callback(data);
    });

  },
  reduceCart: function(goodsId, callback) {
    let data = {};
    data.goodsId = goodsId;
    httphelper.api("cart/reduceCart", data, function(data) {
      if (callback != null) callback(data);
    });
  },
  deleteCart: function() {

    let data = {};
    let goodsIds = this.get_total_ids();
    let that = this;

    if (this.get_total_ids().length == 0) {
      wx.showToast({
        icon: "none",
        title: '您没有选择商品,请选择后再删除~',
        duration: 2000
      })
      return;
    }


    wx.showModal({
      title: '删除购物车商品',
      content: '确定要删除所选商品吗？',
      success(res) {
        if (res.confirm) {
          data.goodsIds = JSON.stringify(goodsIds);
          httphelper.api("cart/deleteCart", data, function(data) {
            if (data.code == 200) {
              that.reloadCart(null);
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },


  moveCollection: function() {
    let data = {};
    let goodsIds = this.get_total_ids();
    let that = this;

    if (this.get_total_ids().length == 0) {
      wx.showToast({
        icon: "none",
        title: '您没有选择商品,请选择后再移入~',
        duration: 2000
      })
      return;
    }


    wx.showModal({
      title: '移入收藏商品',
      content: '确定要移入所选商品吗？',
      success(res) {
        if (res.confirm) {
          data.goodsIds = JSON.stringify(goodsIds);
          httphelper.api("cart/moveCollection", data, function(data) {
            if (data.code == 200) {
              wx.showToast({
                title: data.msg,
                duration: 1500
              });
              that.reloadCart(null);
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  checkLogin: function() {
    if (app.ssoToken == "") {
      let toLogin = this.selectComponent("#toLogin");
      toLogin.showLoginModal();
      return false;
    }
    return true;
  },

  reloadCart: function(callback) {
    let that = this;
    if (!app.isShowLogin) {
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.reloadCart();
      }
      return;
    }
    
    httphelper.api("cart/loadCart", null, function(serverdata) {
      if (serverdata.code == 200) {
        //购物车不空
        that.setData({
          storeList: serverdata.data.storeList == undefined ? null : serverdata.data.storeList,
          similars: serverdata.data.goodJadeList,
        })
        that.selectComponent("#guess_what").setGoodsValue(that.data.similars);
        that.dataSetAttrPicked();
      }
      that.setData({
        edit_mode: false,
        isEmpty: (that.data.storeList == null),
        isPicked: false,
      })

      if (callback != null) callback(that.data.storeList == null);

      that.total_sum();
    });
  },
  appjumpTo: function(event) {
    app.orderJsonData = {};
    let that = this;
    let postData = {};

    if (this.get_total_ids().length == 0) {
      wx.showToast({
        icon: "none",
        title: '您没有选择商品,请选择后再结算~',
        duration: 2000
      })
      return;
    }

    postData.goodsJson = JSON.stringify(this.get_total_json());
    httphelper.api("order/toOrderSetting", postData, function(data) {
      if (data.code == 200) {
        app.orderJsonData = data.data;
        common.jumpTo(event);
      }
    })
    //console.dir(app.cart_json);
    //common.jumpTo(event);
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},
  jumpTo: common.jumpTo,

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.reloadCart(null);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.selectComponent('#guess_what').onQueryNext("classification/queryGoodJade", null, "goodJadeList");
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})