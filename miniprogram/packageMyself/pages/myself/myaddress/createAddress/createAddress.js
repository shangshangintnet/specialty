// miniprogram/pages/myself/myaddress/createAddress/createAddress.js
const httphelper = require('../../../../../httphelper.js');
const common = require('../../../../../common.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    address: {
      realName: "",
      phoneNum: "",
      areaId: "",
      addressName: ""
    },
    multiIndex: [0, 0, 0, 0],
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
    changeAddress: false,

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if (options.id != null) //编辑模式
    {
      let postdata = {};
      postdata["addressId"] = options.id;
      httphelper.api("myInformation/findAddressById", postdata, function (serverdata) {
        //删除addressId对应的数据，并刷新界面
        that.setData({
          address: serverdata.data.address
        })
      });
    }
    this.requestFirstArea();
    //隐藏分享
    wx.hideShareMenu();
  },

  onUpdateOrCreate: function () {
    if (this.data.address.id == undefined)
      this.onCreateAddress();
    else
      this.onUpdateAddress();
  },

  //修改地址（确认地址变更）
  onUpdateAddress: function () {
    let that = this;
    // console.dir(this.data.address);

    httphelper.api("myInformation/updateAddressManagement", this.data.address, function (serverdata) {
      if (serverdata.code == 200) {
        //返回地址界面
        common.goBack();
        wx.showToast({
          title: serverdata.msg,
        })
      }
    });
  },

  //新增地址
  onCreateAddress: function () {
    let address = this.data.address;
    if (address.phoneNum == "" || address.realName == "" || address.areaId == "" || address.addressName == "") {
      wx.showToast({
        icon: 'none',
        title: '请填写完整的地址信息～',
      })
      return;
    }



    httphelper.api("myInformation/insertAddressManagement", this.data.address, function (serverdata) {
      if (serverdata.code == 200) {
        //返回地址界面
        common.goBack();
        wx.showToast({
          title: serverdata.msg,
        })
      }
    });
  },

  //查询下一级区域选择
  requestNextArea: function (areaId, column) {
    //console.log(column);
    if (column >= 3) return;
    let that = this;
    let col = ++column;
    let data = {};
    data.areaId = areaId;
    httphelper.api("myInformation/queryNextTier", data, function (res) {
      let str = "multiArray[" + col + "]";
      that.setData({
        [str]: res.data.areas,
      });
      if (col <= 2) {
        //console.log(that.data.multiArray[col]);

        that.requestNextArea(that.data.multiArray[col][that.data.multiIndex[col]].areaId, col);
      }
    })
  },
  //请求第一级查看
  requestFirstArea: function () {
    let that = this;
    httphelper.api("myInformation/queryCurrentArea", null, function (res) {
      let str = "multiArray[0]";
      that.setData({
        [str]: res.data.areas,
      });

      that.requestNextArea(that.data.multiArray[0][that.data.multiIndex[0]].areaId, 0)
    })
  },
  bindMultiPickerChange: function (e) {
    console.log(e);
    let str = "address.areaId";
    let areaId = this.data.multiArray[3][this.data.multiIndex[3]].areaId;
    // console.dir(e);
    this.setData({
      changeAddress: true,
      [str]: areaId
    })
    // console.dir(this.data.address);
  },
  bindMultiPickerColumnChange: function (e) {

    let column = e.detail.column;
    let idx = e.detail.value;
    let data = this.data.multiArray[column][idx];
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);

    if (column <= 2) {
      let tmp = "multiIndex[3]";
      this.setData({
        [tmp]: 0
      })
    }

    if (column <= 1) {
      let tmp = "multiIndex[2]";
      this.setData({
        [tmp]: 0
      })
    }

    if (column <= 0) {
      let tmp = "multiIndex[1]";
      this.setData({
        [tmp]: 0
      })
    }
    // console.dir(this.data.multiArray[column][idx]);
    this.requestNextArea(data.areaId, column);

    let str = "multiIndex[" + column + "]";
    this.setData({
      [str]: idx
    })
    // console.dir(this.data.multiArray[0][this.data.multiIndex[0]].areaName);
  },
  bindrealName: function (e) {
    let str = "address.realName"
    this.setData({
      [str]: e.detail.value,
    });
  },
  bindphoneNum: function (e) {
    let str = "address.phoneNum"
    this.setData({
      [str]: e.detail.value,
    });
  },
  bindaddressName: function (e) {
    let str = "address.addressName"
    this.setData({
      [str]: e.detail.value,
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