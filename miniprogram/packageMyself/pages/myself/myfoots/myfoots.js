// miniprogram/pages/myself/myfoots/myfoots.js
const httphelper = require('../../../../httphelper.js')
const common = require('../../../../common.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    footList: [],
    bar_Height: wx.getSystemInfoSync().statusBarHeight,
    editMode: false,
    isPicked: false,
    isEmpty: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.reloadData(null);
    //隐藏分享
    wx.hideShareMenu();
  },
  reloadData:function(callback){
    let that = this;
    httphelper.api("myInformation/myTracks", null, function (serverdata) {

      if(callback != null){
        that.setData({
          footList: serverdata.code == 201 ? null : serverdata.data.footmarkList ,
          isPicked: false,
        })
        callback(serverdata.code != 201);
      } else{
        that.setData({
          footList: serverdata.code == 201 ? null : serverdata.data.footmarkList,
          isPicked: false,
          editMode: false,
        })
      }
      that.dataSetAttrPicked();
    });
  },
  dataSetAttrPicked(isPicked) {
    var attr = "picked";

    var _isPicked = false;
    if (isPicked != undefined) {
      _isPicked = isPicked;
    }
    var _footList = (this.data.footList == null) ? [] : this.data.footList;
    for (var i = 0; i < _footList.length; ++i) {
      _footList[i][attr] = _isPicked;
      for (var j = 0; j < _footList[i]["goodsDetailslist"].length; ++j) {
        _footList[i]["goodsDetailslist"][j][attr] = _isPicked;
      }
    }

    var isEmpty = (_footList.length == 0);

    this.setData({
      footList: _footList,
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
  toogleDays: function(event) {
    var daysIdx = parseInt(event.currentTarget.dataset.daysIdx);

    var daysData = this.data.footList[daysIdx];
    var isPicked = daysData.picked;

    daysData.picked = !isPicked;
    for (var i = 0; i < daysData.goodsDetailslist.length; ++i) {
      daysData.goodsDetailslist[i].picked = !isPicked;
    }

    let str = "footList[" + daysIdx + "]";

    this.setData({
      [str]: daysData
    })

    this.checkAllPicked();

  },

  checkDaysPicked: function(daysIdx) {
    var daysData = this.data.footList[daysIdx];
    var isPicked = this.data.footList[daysIdx].picked;

    var checkPicked = true;
    for (var i = 0; i < daysData["goodsDetailslist"].length; ++i) {
      if (!daysData.goodsDetailslist[i].picked) {
        checkPicked = false;
        break;
      }
    }

    if (isPicked != checkPicked) {
      let str = "footList[" + daysIdx + "].picked"
      this.setData({
        [str]: checkPicked
      })
    }
    this.checkAllPicked();
  },
  checkAllPicked: function() {
    var footList = this.data.footList;
    var isPicked = this.data.isPicked;
    var checkPicked = true;
    for (var i = 0; i < footList.length; ++i) {
      if (!footList[i].picked) {
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
  toogleGoods: function(event) {
    var goods_id = parseInt(event.currentTarget.dataset.goodsIdx);
    var daysIdx = parseInt(event.currentTarget.dataset.daysIdx);
    var isPicked = this.data.footList[daysIdx]["goodsDetailslist"][goods_id].picked;

    let str = "footList[" + daysIdx + "].goodsDetailslist[" + goods_id + "].picked";

    this.setData({
      [str]: !isPicked
    })

    this.checkDaysPicked(daysIdx);
  },
  toogleAll: function() {
    var isPicked = !this.data.isPicked;
    this.dataSetAttrPicked(isPicked);
  },
  removeGoods: function() {
    let goodsIds = [];
    let data = {};
    let that = this;

    var newData = this.data.footList;
    var isEmpty = (newData.length == 0);

    if (!isEmpty) {
      for (var i = 0; i < newData.length; ++i) {
        var goodsList = newData[i].goodsDetailslist;
        for(let j = 0;j< goodsList.length;++j)
        {
          
          if(goodsList[j].picked) goodsIds.push(goodsList[j].id.toString());
        }
      }
    } 
    
    if(goodsIds.length == 0)
    {
      wx.showToast({
        icon: "none",
        title: '您没有选择足迹,请选择后再删除~',
        duration: 2000
      })
      return;
    }

    wx.showModal({
      title: '删除足迹',
      content: '确定要删除所选足迹吗？',
      success(res) {
        if (res.confirm) {
          data.goodsIds = JSON.stringify(goodsIds);
          httphelper.api("myInformation/deleteFootprints", data, function (data) {
            // console.dir(data.code);
            if (data.code == 200) {
              that.reloadData((editMode)=>{
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
  goIndex: function() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  addCart(event) {
    let goodsId = event.currentTarget.dataset.goodsId;
    common.addCart(goodsId);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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