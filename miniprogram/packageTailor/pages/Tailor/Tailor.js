// packageTailor/pages/Tailor/Tailor.js
const httphelper = require('../../../httphelper.js')
const common = require('../../../common.js')
const app = getApp()
let that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    user: null,
    beUser: true,
    specialCarve: false,
  },

  jumpTo: function (event) {
    common.jumpTo(event);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    this.setData({
      user: app.user,
      beUser: !app.user.storeId && !app.user.carvingId
    })
    this.getStore();
  },

  getStore() {
    //雕刻师查询
    httphelper.api("carve/findStore", null, function (serverdata) {
      if (serverdata.code == 200) {
        let carveMap = {}; //以storeId为key 员工map
        let staffMap = {}; //以雕刻师Id为key 员工map
        let staffs = [{
          id: null,
          name: '全部'
        }]; //员工列表
        serverdata.data.map((val) => {
          carveMap[val.id] = {};
          carveMap[val.id].name = val.name;
          carveMap[val.id].staff = val.staff;
          staffMap[val.staff[0].id] = {};
          staffMap[val.staff[0].id].storeName = val.name;
          staffMap[val.staff[0].id].name = val.staff[0].name;
          staffMap[val.staff[0].id].photoUrl = val.staff[0].photoUrl;
          staffMap[val.staff[0].id].content = val.staff[0].content;
          staffMap[val.staff[0].id].staff = val.staff[0].staff;
          let master = {};
          master.id = val.staff[0].id;
          master.name = val.staff[0].name;
          staffMap[val.staff[0].id].staff.push(master);
          staffs = staffs.concat(staffMap[val.staff[0].id].staff);
        })
        app.carveStoreList = serverdata.data;
        app.carveMap = carveMap;
        app.staffMap = staffMap;
        app.staffs = staffs;
      }
    });

    httphelper.api("carve/findCarve", null, function (serverdata) {
      if (serverdata.code == 200) {
        that.setData({
          specialCarve: serverdata.data.material.length > 0 || serverdata.data.solutionALL.length > 0
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