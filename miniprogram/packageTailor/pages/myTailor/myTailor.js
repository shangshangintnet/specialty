const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
const app = getApp();
let that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    bar_Height: 0,
    user: null,
    material: [], //A料
    solution: [], //B料
    solutions: [], //公有
    status: [{
        value: null,
        name: '全部'
      }, {
        value: 0,
        name: '未雕刻'
      },
      {
        value: 1,
        name: '雕刻中'
      },
      {
        value: 2,
        name: '雕刻完成'
      },
      {
        value: 3,
        name: '交易完成'
      }
    ],
    staffs: [],
    staffIndex: 0,
    userNames: ["全部"],
    order: {},
    condition: {
      orderType: 0, //0 时间 1 名称
      order: 'desc',
      userName: null,
      status: null,
      staffId: null,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    let staffs = [{
      id: null,
      name: '全部'
    }];
    this.setData({
      bar_Height: app.bar_Height,
      user: app.user,
      storeList: app.carveStoreList,
      beUser: app.user.carveType != 1,
      staffs: app.staffs
    })
    if (this.data.user.carvingLevel == 1) {
      this.setData({
        active: 1
      })
    }
    this.getUsers();
  },
  tagTo: function (e) {
    this.setData({
      active: parseInt(e.currentTarget.dataset.index)
    })
    if (this.data.solution.length == 0) {
      this.getSolution();
    }
  },
  getdata() {
    httphelper.api("carve/findCarve", null, function (serverdata) {
      if (serverdata.code == 200) {
        serverdata.data.material.map((val) => {
          if (val.images != null) {
            val.imageUrl = val.images.split(',');
          }
          val.storeName = app.carveMap[val.storeId].name;
          val.staffName = app.carveMap[val.storeId].staff[0].name;
        })
        serverdata.data.solutions.map((val) => {
          if (val.images != null) {
            val.imageUrl = val.images.split(',');
          }
          val.storeName = app.staffMap[val.staffId].storeName;
          val.staffName = app.staffMap[val.staffId].name;
          val.dispayPrice = parseFloat(val.price) + parseFloat(val.totalPrice); //展示价格为出售价 + 雕刻工费
        })
        that.setData({
          material: serverdata.data.material, //A料
          solutions: serverdata.data.solutions, //公有
        })
      }
    });
  },
  getUsers() {
    httphelper.api("carve/getUserName", null, function (serverdata) {
      that.setData({
        userNames: that.data.userNames.concat(serverdata.data)
      })
    });
  },
  /**
   * 查看原料
   */
  viewMaterial: function (e) {
    app.curStone = this.data.material[e.currentTarget.dataset.index];
    wx.navigateTo({
      url: '../uploadTailor/uploadTailor?edit=1',
    })
  },
  /**
   * 原料关联解料
   */
  viewM2Solution: function (e) {
    app.curStone = this.data.material[e.currentTarget.dataset.index];
    wx.navigateTo({
      url: '../materialSolution/materialSolution'
    })
  },
  /**
   * 原料增加解料
   */
  addSolution: function (e) {
    app.curStone = this.data.material[e.currentTarget.dataset.index];
    wx.navigateTo({
      url: '../uploadSolution/uploadSolution',
    })
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
  /**
   * 查看鉴赏
   */
  viewSolutions: function (e) {
    app.curStone = this.data.solutions[e.currentTarget.dataset.index];
    wx.navigateTo({
      url: '../appreciate/appreciate',
    })
  },

  /**
   * 用户支付
   */
  pay: function (e) {
    httphelper.api("carve/createOrder", null, function (data) {
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
  orderByName() {
    if (this.data.condition.orderType == 1) {
      return;
    } else {
      let key = "condition.orderType";
      let order = "condition.order";
      this.setData({
        [key]: 1,
        [order]: 'asc'
      })
      this.getSolution();
    }
  },
  orderByTime() {
    let key = "condition.orderType";
    let order = "condition.order";
    this.setData({
      [key]: 0,
      [order]: this.data.condition.order == 'desc' ? 'asc' : 'desc'
    })
    this.getSolution();
  },
  changeUser: function (e) {
    let key = "condition.userName"
    this.setData({
      [key]: e.detail.value == 0 ? null : this.data.userNames[e.detail.value],
    })
    this.getSolution();
  },
  changeStaff: function (e) {
    let key = "condition.staffId"
    this.setData({
      [key]: this.data.staffs[e.detail.value].id,
      staffIndex: e.detail.value
    })
    this.getSolution();
  },
  changeStatus: function (e) {
    let key = "condition.status"
    this.setData({
      [key]: this.data.status[e.detail.value].value,
    })
    console.log(this.data.condition.status);
    this.getSolution();
  },
  getSolution() {
    let data = {};
    data.orderType = this.data.condition.orderType;
    if (this.data.condition.order != null)
      data.order = this.data.condition.order;
    if (this.data.condition.userName != null)
      data.userName = this.data.condition.userName;
    if (this.data.condition.status != null)
      data.status = this.data.condition.status;
    if (this.data.condition.staffId != null)
      data.staffId = this.data.condition.staffId;
    httphelper.api("carve/getSolution", data, function (serverdata) {
      if (serverdata.code == 200) {
        serverdata.data.map((val) => {
          if (val.images != null) {
            val.imageUrl = val.images.split(',');
          }
          val.storeName = app.staffMap[val.staffId].storeName;
          val.staffName = app.staffMap[val.staffId].name;
          val.dispayPrice = parseFloat(val.price) + parseFloat(val.totalPrice); //展示价格为出售价 + 雕刻工费
        })
        that.setData({
          solution: serverdata.data, //B料
        })
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
    this.getSolution();
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