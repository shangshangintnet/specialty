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
    user: {},
    imageType: 0,
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
      ['user.id']: options.id
    })
    that.getData();
  },
  getData() {
    httphelper.api("storeFamous/getFamousUserById", {
      id: that.data.user.id
    }, (serverData) => {
      if (serverData.code == 200) {
        serverData.data.followStatus = 0;
        that.setData({
          user: serverData.data
        })
      }
    });
  },
  tagTo: function (e) {
    if (this.checkBasic()) {
      this.setData({
        active: parseInt(e.currentTarget.dataset.index)
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '请继续完善信息',
      })
    }
  },
  changename(e) {
    let key = "user.name"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeauthor(e) {
    let key = "user.author"
    this.setData({
      [key]: e.detail.value
    })
  },
  changedescribe(e) {
    let key = "user.describe"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeintroduce(e) {
    let key = "user.introduce"
    this.setData({
      [key]: e.detail.value
    })
  },
  changetitle(e) {
    let key = "user.title"
    this.setData({
      [key]: e.detail.value
    })
  },
  confirm: function () {
    if (this.checkBasic()) {
      httphelper.api("storeFamous/updateUser", that.data.user, function (serverdata) {
        if (serverdata.code == 200) {
          wx.showToast({
            icon: 'none',
            title: '请求成功'
          });
        }
      });
    }
  },
  checkBasic: function () {
    if (that.data.user.name == null || that.data.user.name == "" || that.data.user.author == null || that.data.user.author == "") {
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
    formdata.id = this.data.user.id;
    formdata.type = that.data.imageType;
    wx.uploadFile({
      url: app.url + "storeFamous/uploadFile",
      filePath: e.detail.url,
      name: 'file',
      formData: formdata,
      success(res) {
        let images;
        if (that.data.imageType == 0) {
          images = "user.photoUrl";
        } else {
          images = "user.image";
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
        if(e.currentTarget.dataset.type==0){
          that.setData({
            width: 68,
            height: 68
          })
        }else{
          that.setData({
            width: 375,
            height: 200
          })
        }
        that.setData({
          filePath: res.tempFilePaths[0],
          imageType: e.currentTarget.dataset.type,
          cropShow: true
        })
        that.uploadImgListCrop();
      },
      fail: function (res) { }
    })
  },
})