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
    polishdata: [],
    status: [{
        value: null,
        name: '全部'
      }, {
        value: 0,
        name: '待受理'
      },
      {
        value: 1,
        name: '商家受理中'
      },
      {
        value: 2,
        name: '待支付预付款'
      },
      {
        value: 3,
        name: '抛光中'
      },
      {
        value: 4,
        name: '抛光完成，待支付尾款'
      },
      {
        value: 5,
        name: '支付完成'
      },
      {
        value: 6,
        name: '交易完成'
      }
    ],
    condition: {
      order: 'desc',
      status: null,
    },
    nickName: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    this.setData({
      bar_Height: app.bar_Height,
      user: app.user,
      beUser: !app.user.storeId && !app.user.carvingId
    })
  },
  getdata() {
    let nickName = ['全部'];
    let data = {};
    if (this.data.condition.order != null)
      data.order = this.data.condition.order;
    if (this.data.condition.status != null)
      data.status = this.data.condition.status;
    if (this.data.condition.nickName != null)
      data.nickName = this.data.condition.nickName;
    httphelper.api("carve/findPolish", data, function (serverdata) {
      if (serverdata.code == 200) {
        serverdata.data.map((val) => {
          if (val.images != null) {
            val.imageUrl = val.images.split(',');
          } else {
            val.imageUrl = [];
          }
          if (app.user.storeId != null && that.data.nickName == null) {
            if (nickName.indexOf(val.nickName) === -1)
              nickName.push(val.nickName)
          }
        })
        if (that.data.nickName == null) {
          that.setData({
            polishdata: serverdata.data,
            nickName: nickName
          })
        } else {
          that.setData({
            polishdata: serverdata.data
          })
        }
      }
    });
  },
  orderByTime() {
    let order = "condition.order";
    this.setData({
      [order]: this.data.condition.order == 'desc' ? 'asc' : 'desc'
    })
    this.getdata();
  },
  changeStatus: function (e) {
    let key = "condition.status"
    this.setData({
      [key]: this.data.status[e.detail.value].value,
    })
    this.getdata();
  },
  changeNickName(e) {
    if (e.detail.value == 0) {
      let key = "condition.nickName"
      this.setData({
        [key]: null,
      })
    } else {
      let key = "condition.nickName"
      this.setData({
        [key]: this.data.nickName[e.detail.value],
      })
    }
    this.getdata();
  },
  viewPolish(e) {
    app.curStone = this.data.polishdata[e.currentTarget.dataset.index];
    wx.navigateTo({
      url: '../polishDetail/polishDetail',
    })
  },
  revoke(e) {
    let stone = that.data.polishdata[e.currentTarget.dataset.index];
    wx.showModal({
      title: '撤销受理',
      content: '确定撤销受理' + stone.name,
      success(res) {
        if (res.confirm) {
          delete stone.storeId;
          if (stone.addressId == null)
            delete stone.addressId
          delete stone.logisticsNum;
          delete stone.storeLogisticsNum;
          httphelper.api("carve/updatePolish", stone, function (serverdata) {
            if (serverdata.code == 200) {
              wx.showToast({
                icon: "none",
                title: '受理已撤销',
              })
              that.getdata();
            }
          });
        }
      }
    })
  },
  deleteItem(e) {
    let stone = that.data.polishdata[e.currentTarget.dataset.index];
    wx.showModal({
      title: '删除需求',
      content: '确定删除' + stone.name,
      success(res) {
        if (res.confirm) {
          httphelper.api("carve/delCarve", {
            type: 1,
            id: stone.id
          }, function (serverdata) {
            if (serverdata.code == 200) {
              wx.showToast({
                icon: "none",
                title: '需求已删除',
              })
              that.getdata();
            }
          });
        }
      }
    });
  },
  /**
   * 用户支付
   */
  pay: function (e) {
    httphelper.api("carve/createOrder", {
      type: 2
    }, function (data) {
      if (data.code == 200) {
        that.setData({
          order: data.data
        })
        that.selectComponent("#carve").open(data.data);
      }
    });
  },
  payOrder(e) {
    common.carvePay(this.data.order.id, (res) => {
      if (res) {
        that.selectComponent("#carve").close_order();
        that.getdata();
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getdata();
  },
})