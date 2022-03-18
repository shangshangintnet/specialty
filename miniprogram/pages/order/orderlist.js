const httphelper = require('../../httphelper.js');
const common = require('../../common.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    orders: [],
    tag_index: 4,
    pageNum: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.tag != null) {
      this.setData({
        tag_index: options.tag
      })
    }
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
    this.onRequestOrders(this.data.tag_index, null);
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

    let that = this;
    var postdata = [];
    postdata.orderStatus = this.data.tag_index;
    postdata.pageNum = ++this.data.pageNum;
    console.log(postdata.pageNum);
    httphelper.api("myInformation/queryAllOrders", postdata, function (serverdata) {
      if (serverdata.code == 200) {
        that.setData({
          orders: that.data.orders.concat(serverdata.data.orders)
        })
      }
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  tagTo: function (event) {
    var tag_index = event.currentTarget.dataset.tagIndex;
    this.setData({
      tag_index: tag_index
    })
    this.onRequestOrders(tag_index, null);
  },

  //查询订单
  onRequestOrders: function (orderStatus, msg) {
    this.setData({
      pageNum: 1
    })
    let that = this;
    var postdata = [];
    postdata.orderStatus = orderStatus;
    postdata.pageNum = 1;
    httphelper.api("myInformation/queryAllOrders", postdata, function (serverdata) {
      that.setData({
        orders: serverdata.data.orders
      })
      if (msg != null) {
        wx.showToast({
          title: msg,
        })
      }
    });
  },
  //再次购买
  onBuyAgain: function (event) {
    // console.dir(event.currentTarget.dataset);
    let data = this.data.orders[event.currentTarget.dataset.idx].store.goodsList;
    let goodsJson = [];
    for (let i = 0; i < data.length; ++i) {
      let goods = data[i];
      if (goods.inventory >= 1) {
        let tmp_data = {};
        tmp_data.goodsId = goods.id.toString();
        tmp_data.productQty = goods.inventory.toString();
        tmp_data.storeName = goods.storeName;
        tmp_data.storeId = goods.storeId.toString();
        goodsJson.push(tmp_data);
      }
    }

    let postData = {};
    postData.goodsJson = JSON.stringify(goodsJson);

    httphelper.api("order/toOrderSetting", postData, function (data) {
      if (data.code == 200) {
        app.orderJsonData = data.data;
        common.jumpTo(event);
      }
    })

  },
  onConfirmOrder: function (event) {
    common.onConfirmOrder(event.currentTarget.dataset.id, true);
  },


  //完成订单
  onFinishOrder: function (event) {
    let that = this;
    wx.showModal({
      title: '确认收货',
      content: '请确认货物已收到',
      success(res) {
        if (res.confirm) {
          common.onFinishOrder(event, () => {
            that.onRequestOrders(that.data.tag_index, "签收成功");
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //删除订单
  onDeleteOrder: function (event) {
    let that = this;

    wx.showModal({
      title: '删除订单',
      content: '确定要删除所选订单吗？',
      success(res) {
        if (res.confirm) {
          common.onDeleteOrder(event, () => {
            that.onRequestOrders(that.data.tag_index, "已成功删除");
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  goBack: common.goBack,
  jumpTo: common.jumpTo,
  navigateTo: common.navigateTo,
})