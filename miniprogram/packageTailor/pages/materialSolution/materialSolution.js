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
    user: null,
    beUser: false, //普通用户或店主(雕刻师)
    solution: [],
    curStone: {},
    payStatus: false, //是否需要支付
    order: {},
    weight: 0, //解料总重
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    this.setData({
      curStone: app.curStone,
      bar_Height: app.bar_Height,
      user: app.user,
      beUser: !app.user.storeId && !app.user.carvingId,
      payStatus: app.curStone.payStatus == 0
    })
  },

  getdata() {
    httphelper.api("carve/findSolution", {
      id: this.data.curStone.id
    }, function (serverdata) {
      if (serverdata.code == 200) {
        let sum = 0;
        serverdata.data.map((val) => {
          sum += parseFloat(val.weight);
          if (val.images != null) {
            val.imageUrl = val.images.split(',');
          }
          val.storeName = app.staffMap[val.staffId].storeName;
          val.staffName = app.staffMap[val.staffId].name;
          val.dispayPrice = parseFloat(val.price) + parseFloat(val.totalPrice); //展示价格为出售价 + 雕刻工费
        })
        that.setData({
          solution: serverdata.data,
          weight: sum.toFixed(2)
        })
        if (!that.data.payStatus) {
          serverdata.data.map((val) => {
            if (val.status == 2) {
              that.setData({
                payStatus: true
              })
              return;
            }
          })
        }
      }
    });
  },
  /**
   * 查看解料
   */
  viewSolution: function (e) {
    app.curStone = this.data.solution[e.currentTarget.dataset.index];
    wx.navigateTo({
      url: '../uploadSolution/uploadSolution?edit=1',
    })
  },
  /**
   * 分配解料
   */
  dispatchSolution: function (e) {
    app.curStone = this.data.solution[e.currentTarget.dataset.index];
    wx.navigateTo({
      url: '../uploadSolution/uploadSolution?edit=2',
    })
  },
  confirm() {
    if (this.data.beUser) {
      if (this.data.payStatus) {
        //用户支付
        httphelper.api("carve/createOrder", null, function (serverdata) {
          if (serverdata.code == 200) {
            that.setData({
              order: serverdata.data
            })
            that.selectComponent("#carve").open(serverdata.data);
          }
        });
      }
    } else {
      //店主增加解料
      wx.navigateTo({
        url: '../uploadSolution/uploadSolution',
      })
    }
  },
  payOrder(e) {
    common.carvePay(this.data.order.id, (res) => {
      if (res) {
        that.selectComponent("#carve").close_order();
        that.getdata();
      }
    })
  },
  //生成解料
  addSolution() {
    if (this.data.solution.length > 0) {
      wx.showToast({
        icon: "none",
        title: '已有解料，不可自动生成',
      })
      return;
    }
    let data = {};
    data.userId = this.data.curStone.userId;
    data.mobile = this.data.curStone.mobile;
    data.materialId = this.data.curStone.id;
    data.weight = this.data.curStone.weight;
    data.name = this.data.curStone.name;
    data.userName = this.data.curStone.userName;
    data.images = this.data.curStone.images;
    httphelper.api("carve/addSolution", data, function (serverdata) {
      if (serverdata.code == 200) {
        wx.showToast({
          title: '添加成功',
        })
        that.getdata();
      }
    });
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
    this.getdata();
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

  }
})