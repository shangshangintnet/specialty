const httphelper = require('../../../../httphelper.js');
const common = require('../../../../common.js');
const app = getApp();
let that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    bar_Height: app.bar_Height,
    userId: 0,
    type: 0,
    imageType: 0,
    goods: {},
    cropShow: false,
    width: 0,
    height: 0,
    src: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({
      userId: options.userId,
      type: options.type
    })
    if (options.id)
      that.getData(options.id);
  },
  getData(id) {
    httphelper.api("storeFamous/getFamousGoodsById", {
      id: id,
    }, (serverData) => {
      if (serverData.code == 200) {
        that.setData({
          goods: serverData.data
        })
      }
    });
  },
  tagTo: function (e) {
    if (this.checkBasic()) {
      if (that.data.goods.id == null) {
        wx.showToast({
          icon: 'none',
          title: '请先确认添加商品'
        })
      } else {
        this.setData({
          active: parseInt(e.currentTarget.dataset.index)
        })
      }
    } else {
      wx.showToast({
        icon: "none",
        title: '请继续完善信息',
      })
    }
  },
  changename(e) {
    let key = "goods.name"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeUserName(e) {
    let key = "goods.userName"
    this.setData({
      [key]: e.detail.value
    })
  },
  jumpToGoods() {
    wx.navigateTo({
      url: '/packageStoreFamous/pages/storeFamousAdmin/goodsDetail/goodsDetail?id=' + that.data.goods.id,
    });
  },
  changetitle(e) {
    let key = "goods.title"
    this.setData({
      [key]: e.detail.value
    })
  },
  confirm: function () {
    if (this.checkBasic()) {
      if (that.data.goods.id == null) {
        that.setData({
          ["goods.type"]: that.data.type,
          ["goods.userId"]: that.data.userId,
        })
        httphelper.api("storeFamous/addGoods", that.data.goods, function (serverdata) {
          if (serverdata.code == 200) {
            wx.showToast({
              icon: 'none',
              title: '请求成功'
            });
            that.setData({
              active: 1,
              ['goods.id']: serverdata.data
            })
          }
        });
      } else {
        that.setData({
          ['goods.user']: ''
        })
        httphelper.api("storeFamous/updateGoods", { name: that.data.goods.name, userName: that.data.goods.userName, title: that.data.goods.title, id: that.data.goods.id }, function (serverdata) {
          if (serverdata.code == 200) {
            wx.showToast({
              icon: 'none',
              title: '请求成功'
            });
          }
        });
      }
    }
  },
  checkBasic: function () {
    if (that.data.goods.name == null || that.data.goods.name == "" || that.data.goods.title == null || that.data.goods.title == "") {
      wx.showToast({
        icon: 'none',
        title: '请将信息填写完整'
      })
      return false;
    }
    return true;
  },

  //截图上传
  uploadImgListCrop: function () {
    wx.showLoading({
      title: '图片加载中',
    });
    that.setData({
      cropShow: true,
      src: that.data.filePath
    })
  },
  //截取图片
  cropperload(e) {
    console.log("cropper初始化完成");
  },
  loadimage(e) {
    wx.hideLoading(); //重置图片角度、缩放、位置
    this.selectComponent("#image-cropper").imgReset();
  },
  clickcut(e) {
    wx.previewImage({
      current: e.detail.url, // 当前显示图片的http链接
      urls: [e.detail.url] // 需要预览的图片http链接列表
    })
  },
  getImg(e) {
    this.setData({
      cropShow: false
    })
    wx.showLoading({
      title: '图片上传中',
    });
    let formdata = {};
    formdata.ssoToken = app.ssoToken;
    formdata.id = this.data.goods.id;
    formdata.type = that.data.imageType;
    wx.uploadFile({
      url: app.url + "storeFamous/uploadFile",
      filePath: e.detail.url,
      name: 'file',
      formData: formdata,
      success(res) {
        let images;
        if (that.data.imageType == 2) {
          images = "goods.photo";
        } else {
          images = "goods.image";
        }
        let data = JSON.parse(res.data);
        that.setData({
          [images]: data.data
        })
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
        wx.hideLoading({
          complete: () => {
            wx.showToast({
              icon: 'none',
              title: res.errMsg
            });
          }
        });
      }
    });
  },
  /* 图集信息 */
  selectImage: function (e) {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        for (var i = 0; i < res.tempFiles.length; i++) {
          if (res.tempFiles[i].size > 500000) {
            wx.showToast({
              icon: "none",
              title: '图片大小不得超过500kb',
              duration: 3000
            })
            return;
          }
        }
        if(e.currentTarget.dataset.type==2){
          that.setData({
            width: 125,
            height: 84
          })
        }else{
          that.setData({
            width: 344,
            height: 232
          })
        }
        that.setData({
          filePath: res.tempFilePaths[0],
          imageType: 3,
          cropShow: true
        })
        that.uploadImgListCrop();
      },
      fail: function (res) { }
    })
  },
})