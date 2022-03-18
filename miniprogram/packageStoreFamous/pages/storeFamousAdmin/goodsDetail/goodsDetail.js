const httphelper = require('../../../../httphelper.js');
const common = require('../../../../common.js');
const app = getApp();
let that;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bar_Height: 0,
    showUploadContent: false,
    upType: 0,
    content: "",
    btnType: 0,
    index: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({
      bar_Height: app.bar_Height,
      id: options.id
    })
    if (!app.isShowLogin) {
      that.onLogin();
    } else {
      that.getdata();
    }
  },
  onReachBottom: function () {
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.getdata();
    wx.stopPullDownRefresh();
  },
  getdata() {
    let that = this;
    httphelper.api("storeFamous/findStoreFamousGoodsDetail", {
      id: that.data.id,
    }, (serverData) => {
      if (serverData.code == 200) {
        var contents=serverData.data.content;
        for(var i = 0; i < contents.length; i++){
          if(contents[i].type==0){
            contents[i].detail=contents[i].detail.split('&hc').join('\n\t')
          }
        }
        that.setData({
          goods: serverData.data,
        })
      }
    });
  },
  onLogin: function () {
    if (!app.isShowLogin) {
      let that = this;
      let login = this.selectComponent("#login");
      if (login != null) common.checkWechatLogin(login);
      app.saveCall = function () {
        that.getdata();
      }
      return;
    }
  },
  changeUpImg(e) {
    this.setData({
      upType: e.currentTarget.dataset.index
    })
  },
  changecontent(e) {
    console.log(e.detail.value)
    this.setData({
      content: e.detail.value
    })
  },
  showUploadContent() {
    this.setData({
      showUploadContent: true
    });
  },
  cloaseUploadContent() {
    if (this.data.btnType == 1) {
      this.setData({
        btnType: 0,
        content: '',
        index: '',
        image: '',
        index: ''
      });
    }
    this.setData({
      showUploadContent: false
    });
  },
  updateGoods() {
    wx.navigateTo({
      url: '/packageStoreFamous/pages/storeFamousAdmin/goods/goods?id=' + that.data.id + '&type=' + that.data.goods.type
    });
  },
  updateGoodsDetail() {
    httphelper.api("storeFamous/updateGoodsDetail", {
      id: that.data.id,
      detail: that.data.content.split('\n').join('&hc'),
      index: that.data.index
    }, (serverData) => {
      if (serverData.code == 200) {
        wx.showToast({
          title: '内容上传成功',
          duration: 1000,
        });
        that.setData({
          upType: 0,
          showUploadContent: false,
          content: "",
          image: '',
          index: ''

        })
        that.getdata();
      }
    });
  },
  addGoodsDetail() {
    httphelper.api("storeFamous/addGoodsDetail", {
      id: that.data.id,
      detail: that.data.content.split('\n').join('&hc')
    }, (serverData) => {
      if (serverData.code == 200) {
        wx.showToast({
          title: '内容上传成功',
          duration: 1000,
        });
        that.setData({
          upType: 0,
          showUploadContent: false,
          content: ""
        })
        that.getdata();
      }
    });
  },
  update(e) {
    let content = that.data.goods.content[e.currentTarget.dataset.index];
    if (content.type == 1) {
      that.setData({
        upType: 1,
        image: content.detail
      })
    } else {
      that.setData({
        content: content.detail.split('\t').join(''),
      })
    }
    that.setData({
      index: e.currentTarget.dataset.index,
      btnType: 1
    })
    that.showUploadContent();
  },
  del(e) {
    wx.showModal({
      title: '',
      content: '是否确认删除',
      success(res) {
        if (res.confirm) {
          httphelper.api("storeFamous/delGoodsDetail", {
            id: that.data.goods.id,
            index: e.currentTarget.dataset.index
          }, (serverData) => {
            if (serverData.code == 200) {
              that.setData({
                upType: 0,
                showUploadContent: false,
                content: ""
              })
              that.getdata();
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  selectImage: function () {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        for (var i = 0; i < res.tempFiles.length; i++) {
          if (res.tempFiles[i].size > 1024000) {
            wx.showToast({
              icon: "none",
              title: '图片大小不得超过1MB',
              duration: 3000
            })
            return;
          }
        }
        that.setData({
          filePath: res.tempFilePaths[0]
        })
        wx.showLoading({
          title: '图片上传中',
        });
        that.uploadImgList();
      },
      fail: function (res) { }
    })
  },
  uploadImgList: function () {
    let formdata = {};
    formdata.ssoToken = app.ssoToken;
    formdata.id = this.data.goods.id;
    formdata.index = this.data.index;
    formdata.type = 4;
    wx.uploadFile({
      url: app.url + "storeFamous/uploadFile",
      filePath: that.data.filePath,
      name: 'file',
      formData: formdata,
      success(res) {
        that.setData({
          upType: 0,
          showUploadContent: false,
          content: "",
          image: '',
          index: ''
        })
        that.getdata();
        wx.hideLoading({
          complete: () => {
            wx.showToast({
              title: '图集上传成功',
              duration: 3000,
            });
          },
        })
      },
      fail(res) {
        wx.showToast({
          icon: 'none',
          title: res.errMsg
        });
      }
    });
  },
})