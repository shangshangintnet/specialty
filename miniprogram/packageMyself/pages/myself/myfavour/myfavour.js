// miniprogram/pages/myself/myfavour/myfavour.js
const httphelper = require('../../../../httphelper.js')
const common = require('../../../../common.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    search_type: 'done',
    search_goods: true,
    footPrints: [],
    jadeList: [],
    select_idx: 0,
    editMode: false,
    isPicked: false,
    isEmpty: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //隐藏分享
    wx.hideShareMenu();
  },
  toogleAll:function(){
    var isPicked = !this.data.isPicked;
    this.dataSetAttrPicked(isPicked);
  },
  dataSetAttrPicked(isPicked) {
    var attr = "picked";

    var _isPicked = false;
    if (isPicked != undefined) {
      _isPicked = isPicked;
    }
    var _footPrints = (this.data.footPrints == null)?[]:this.data.footPrints;
    for (var i = 0; i < _footPrints.length; ++i) {
      if (_footPrints[i]["goodsDetailsList"] == null) continue;
      for (var j = 0; j < _footPrints[i]["goodsDetailsList"].length; ++j) {
        _footPrints[i]["goodsDetailsList"][j][attr] = _isPicked;
      }
    }

    var isEmpty = (_footPrints.length == 0);

    this.setData({
      footPrints: _footPrints,
      isPicked: _isPicked,
      isEmpty: isEmpty

    })
  },
  toggleMode: function() {
    this.dataSetAttrPicked();
    this.setData({
      editMode: !this.data.editMode
    })
  },
  goIndex: function() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  addCart(event) {
    let goodsId = event.currentTarget.dataset.goodsId;
    common.addCart(goodsId);
  },
  goBack: function() { // 返回事件
    wx.navigateBack({
      delta: 1,
    })
  },

  jumpTwo: function(event) {
    var idx = parseInt(event.currentTarget.dataset.tagIndex);
    this.setData({
      select_idx: idx
    })
  },
  toogleGoods: function(event) {
    var goods_id = parseInt(event.currentTarget.dataset.goodsIdx);
    var footIdx = parseInt(event.currentTarget.dataset.footIdx);
    var isPicked = this.data.footPrints[footIdx].goodsDetailsList[goods_id].picked;

    let str = "footPrints[" + footIdx + "].goodsDetailsList[" + goods_id + "].picked";

    this.setData({
      [str]: !isPicked
    })

    this.checkAllPicked();
  },
  toggleAllPicked: function() {
    var index = this.data.select_idx;
    var isPicked = !this.data.isPicked;
    var checkData = this.data.footPrints[index].goodsDetailsList;

    let str = "footPrints[" + index + "].goodsDetailsList";

    for (var i = 0; i < checkData.length; ++i) {
      checkData[i].picked = isPicked;
    }
    this.setData({
      [str]: checkData,
      isPicked: isPicked
    })

  },
  checkAllPicked: function() {
    var index = this.data.select_idx;
    var isPicked = this.data.isPicked;
    var checkPicked = true;

    var checkData = this.data.footPrints[index].goodsDetailsList;
    for (var i = 0; i < checkData.length; ++i) {
      if (!checkData[i].picked) {
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
  onMoveToGoods: common.onMoveToGoods,
  addCart: function(event) {
    let goodsId = event.currentTarget.dataset.goodsId;
    common.addCart(goodsId, function(data) {
      if (data.code == 200) {
        wx.showToast({
          title: data.msg
        })
      }
    });
  },

  get_total_ids: function() {
    let goodsIds = [];

    var _footPrints = this.data.footPrints;
    for (var i = 0; i < _footPrints.length; ++i) {
      if (_footPrints[i]["goodsDetailsList"] == null) continue;
      for (var j = 0; j < _footPrints[i]["goodsDetailsList"].length; ++j) {
        let goods = _footPrints[i]["goodsDetailsList"][j];
        if (goods.picked) {
          goodsIds.push(goods.id.toString());
        }
      }
    }

    return goodsIds;
  },
  cancelCollection: function() {
    let that = this;
    let data = {};

    if(this.get_total_ids().length == 0){
      wx.showToast({
        icon:"none",
        title: '您没有选择收藏,请选择后再删除~',
        duration:2000
      })
      return;
    }
    data.goodsIds = JSON.stringify(this.get_total_ids());

    wx.showModal({
      title: '删除收藏商品',
      content: '确定要删除所选商品吗？',
      success(res) {
        if (res.confirm) {
          httphelper.api("classification/cancelCollection", data, function(data) {
            // console.dir(data.code);
            if (data.code == 200) {
              that.reloadData((editMode) => {
                that.setData({
                  editMode: editMode
                })
              });
              wx.showToast({
                title: data.msg,
              });
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  reloadData(callback) {
    let that = this;
    httphelper.api("myInformation/getAllCollection", null, function(serverdata) {
      if (callback != null) {
        that.setData({
          footPrints: serverdata.data.footPrints,
          goodJadeList: serverdata.data.goodJadeList,
        });
        callback(that.data.footPrints[that.data.select_idx].goodsDetailsList != null)
      } else {
        that.setData({
          footPrints: serverdata.data.footPrints,
          goodJadeList: serverdata.data.goodJadeList,
          editMode: false,
        });
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.reloadData(null);
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
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})