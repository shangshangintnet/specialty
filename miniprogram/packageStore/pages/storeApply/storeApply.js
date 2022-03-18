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
    typeList: [],
    store: {},
    infoLen: 0,
    storeType: null,
    multiArray: [
      [{}],
      [{
        areaName: ""
      }],
      [{
        areaName: ""
      }],
      [{
        areaName: ""
      }]
    ],
    typeItems: [{
        value: 1,
        name: '玩家回血',
        info: "* 玩家、藏家、歇业商家、大众店家",
        checked: 'true'
      },
      {
        value: 0,
        name: '联盟好店',
        info: "* 联盟优选好店，每类别优选10家实力商家"
      }
    ],
    disable: false,
  },
  onLoad: function () {
    that = this;
    this.setData({
      bar_Height: app.bar_Height * 2
    })
    this.getData();
  },
  getData: function () {
    httphelper.api('store/findStoreType', null, (serverData) => {
      if (serverData.code == 200) {
        that.setData({
          typeList: serverData.data
        })
        that.getStore();
      }
    });
  },
  getStore: function () {
    httphelper.api('store/findStoreDetail', null, (serverData) => {
      if (serverData.code == 200) {
        if (serverData.data.applyStatus == 0) {
          that.setData({
            store: serverData.data,
            storeLogo: serverData.data.icon,
            storeIcon: serverData.data.imageUrl,
            storeType: that.data.typeList[parseInt(serverData.data.typeId) - 1].name,
            infoLen: serverData.data.content.length,
            disable: true
          })
        } else {
          serverData.data.type = 1;
          that.setData({
            store: serverData.data,
          })
        }
      }
    });
  },
  confirm: function () {
    if (this.data.store.applyStatus == 3) {
      this.apply();
    }
  },
  changeStoreType: function (e) {
    let key = "store.typeId"
    this.setData({
      [key]: this.data.typeList[e.detail.value].id,
      storeType: this.data.typeList[e.detail.value].name
    })
  },
  checkboxChange(e) {
    let index = parseInt(e.currentTarget.dataset.index);
    const items = this.data.typeItems
    let key = "store.type"
    this.setData({
      [key]: items[index].value > 0 ? 1 : 0,
    })
    for (let i = 0; i < items.length; ++i) {
      if (i == index) {
        items[i].checked = true
      } else {
        items[i].checked = false
      }
    }
    this.setData({
      typeItems: items
    })
  },
  changename(e) {
    let key = "store.name"
    this.setData({
      [key]: e.detail.value
    })
  },
  apply: function () {
    if (this.checkStore()) {
      wx.showLoading({
        title: '信息提交中',
        mask: true
      });
      let data = {};
      data.name = this.data.store.name;
      data.typeId = this.data.store.typeId;
      data.type = this.data.store.type;
      httphelper.api("store/addForeignStores", data, (serverdata) => {
        if (serverdata.code == 200) {
          if (that.data.store.type == 1) {
            httphelper.api("store/storeToPay", null, function (serverdata) {
              if (serverdata.code == 200) {
                that.setData({
                  order: serverdata.data,
                  orderVisible: true
                })
              }
            });
          } else {
            common.goBackAfterMsg('申请信息提交成功');
          }
        }
      })
    }
  },
  close_order: function (e) {
    this.setData({
      orderVisible: false
    })
  },
  order_pay: function (e) {
    let that = this;
    httphelper.api("store/wxSmallPay", {
      orderId: this.data.order.id,
      openId: wx.getStorageSync('openid')
    }, function (serverdata) {
      if (serverdata.code == 200) {
        wx.showLoading({
          title: '加载中',
        });
        //向服务器下单成功，提示用户进行支付
        wx.requestPayment({
          timeStamp: serverdata.data.resultwx.timeStamp,
          nonceStr: serverdata.data.resultwx.nonce_str,
          package: 'prepay_id=' + serverdata.data.resultwx.prepay_id,
          signType: 'HMAC-SHA256',
          paySign: serverdata.data.resultwx.sign,
          success(res) {
            wx.hideLoading();
            common.goBackAfterMsg('店铺已成功激活');
          },
          fail(res) {
            wx.hideLoading();
            common.goBackAfterMsg('店铺激活失败，请耐心等待审核');
            console.log(res)
          },
          complete(res) {},
        })
      } else {
        wx.showToast({
          title: serverdata.msg,
        })
      }
    });
  },
  checkStore: function () {
    if (that.data.store.name == null ||
      that.data.store.typeId == null) {
      wx.showToast({
        icon: 'none',
        title: '请将信息填写完整'
      })
      return false;
    }
    return true;
  },
})