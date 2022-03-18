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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    this.setData({
      bar_Height: app.bar_Height,
      user: app.user
    })
  },
  onShow: function (e) {
    this.getdata();
  },
  getdata() {
    httphelper.api("carve/getStoreAdmissible", null, function (serverdata) {
      if (serverdata.code == 200) {
        serverdata.data.map((val) => {
          if (val.images != null) {
            val.imageUrl = val.images.split(',');
          }
        })
        that.setData({
          polishdata: serverdata.data
        })
      }
    });
  },
  viewPolish(e) {
    if (app.user.storeAbility == 1) {
      //雕刻
      app.curStone = this.data.polishdata[e.currentTarget.dataset.index];
      wx.navigateTo({
        url: '../carveDetail/carveDetail?view=1',
      })
    } else if (app.user.storeAbility == 2) {
      //抛光
      app.curStone = this.data.polishdata[e.currentTarget.dataset.index];
      wx.navigateTo({
        url: '../polishDetail/polishDetail?view=1',
      })
    } else if (app.user.storeAbility == 3) {
      //镶嵌
      app.curStone = this.data.polishdata[e.currentTarget.dataset.index];
      wx.navigateTo({
        url: '../inlayDetail/inlayDetail?view=1',
      })
    }
  },
  receive(e) {
    let stone = this.data.polishdata[e.currentTarget.dataset.index];
    stone.storeId = app.user.storeId;
    delete stone.addressId;
    delete stone.staffId;
    delete stone.logisticsNum;
    delete stone.storeLogisticsNum;
    if (app.user.storeAbility == 1) {
      httphelper.api("carve/updateCarve", stone, function (serverdata) {
        if (serverdata.code == 200) {
          that.getdata();
        }
      });
    } else if (app.user.storeAbility == 2) {
      httphelper.api("carve/updatePolish", stone, function (serverdata) {
        if (serverdata.code == 200) {
          that.getdata();
        }
      });
    } else if (app.user.storeAbility == 3) {
      httphelper.api("carve/updateInlay", stone, function (serverdata) {
        if (serverdata.code == 200) {
          that.getdata();
        }
      });
    }
  },
})