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
    active: 0,
    typeList: [],
    store: {},
    infoLen: 0,
    storeType: null,
    storeIcon: null,
    storeLogo: null,
    iconChange: false,
    logoChange: false,
    cropShow: false,
    imgType: 0,
    width: 60,
    height: 60,
    src: "",
  },

  onLoad: function () {
    that = this;
    this.setData({
      bar_Height: app.bar_Height * 2
    })
    this.getData();
  },
  getData: function () {
    httphelper.api('store/findStoreType', null, (serverData) => {
      if (serverData.code == 200) {
        that.setData({
          typeList: serverData.data
        })
        that.getStore();
      }
    });
  },
  getStore: function () {
    httphelper.api('store/findStoreDetail', null, (serverData) => {
      if (serverData.code == 200) {
        that.setData({
          store: serverData.data,
          storeIcon: serverData.data.icon,
          storeLogo: serverData.data.imageUrl,
          storeType: that.data.typeList[parseInt(serverData.data.typeId) - 1].name,
          infoLen: serverData.data.content.length
        })
      }
    });
  },
  problemInfo: function (e) {
    let key = "store.content"
    this.setData({
      [key]: e.detail.value,
      infoLen: e.detail.value.length
    })
  },
  tagTo: function (e) {
    this.setData({
      active: parseInt(e.currentTarget.dataset.index)
    })
  },
  changeStoreType: function (e) {
    let key = "store.typeId"
    this.setData({
      [key]: this.data.typeList[e.detail.value].id,
      storeType: this.data.typeList[e.detail.value].name
    })
  },
  changeaddress(e) {
    let key = "store.address"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeareaName(e) {
    let key = "store.areaName"
    this.setData({
      [key]: e.detail.value
    })
  },
  changecontacts(e) {
    let key = "store.contacts"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeposition(e) {
    let key = "store.position"
    this.setData({
      [key]: e.detail.value
    })
  },
  changewechat(e) {
    let key = "store.wechatId"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeemail(e) {
    let key = "store.email"
    this.setData({
      [key]: e.detail.value
    })
  },
  changename(e) {
    let key = "store.name"
    this.setData({
      [key]: e.detail.value
    })
  },
  confirm: function () {
    if (this.checkStore()) {
      wx.showLoading({
        title: '信息提交中',
        mask: true
      });
      if (this.data.logoChange) {
        common.uploadFile(this.data.storeLogo, (res) => {
          let key = "store.imageUrl"
          that.setData({
            [key]: res.data.files
          })
          that.uploadInfo();
        }, 'foreign_store/image');
      } else {
        that.uploadInfo();
      }
    }
  },
  uploadInfo: function () {
    if (this.data.iconChange) {
      wx.uploadFile({
        url: app.url + "store/updateStore",
        filePath: that.data.storeIcon,
        name: 'uploadIcon',
        formData: {
          ssoToken: app.ssoToken,
          id: this.data.store.id,
          name: this.data.store.name,
          areaName: this.data.store.areaName,
          address: this.data.store.address,
          contacts: this.data.store.contacts,
          position: this.data.store.position,
          wechatId: this.data.store.wechatId,
          email: this.data.store.email,
          typeId: this.data.store.typeId,
          content: this.data.store.content,
          icon: this.data.store.icon,
          imageUrl: this.data.store.imageUrl,
          businessHours: '',
          longitude: '',
          latitude: '',
        },
        success(res) {
          wx.showToast({
            icon: "none",
            title: '信息修改成功'
          });
        },
        fail(res) {
          wx.showToast({
            icon: 'none',
            title: res.errMsg
          });
        }
      });
    } else {
      httphelper.api('store/updateStore', {
        id: this.data.store.id,
        name: this.data.store.name,
        areaName: this.data.store.areaName,
        address: this.data.store.address,
        contacts: this.data.store.contacts,
        position: this.data.store.position,
        wechatId: this.data.store.wechatId,
        email: this.data.store.email,
        typeId: this.data.store.typeId,
        content: this.data.store.content,
        icon: this.data.store.icon,
        imageUrl: this.data.store.imageUrl,
        businessHours: '',
        longitude: '',
        latitude: '',
      }, (serverData) => {
        if (serverData.code == 200) {
          wx.showToast({
            icon: "none",
            title: '信息修改成功'
          });
        }
      });
    }
  },
  checkStore: function () {
    if (that.data.store.name == null ||
      that.data.store.areaName == null ||
      that.data.store.address == null ||
      that.data.store.contacts == null ||
      that.data.store.position == null ||
      that.data.store.wechatId == null ||
      that.data.store.typeId == null ||
      that.data.store.content == null) {
      wx.showToast({
        icon: 'none',
        title: '请将信息填写完整'
      })
      return false;
    }
    if (this.data.storeIcon == null) {
      wx.showToast({
        icon: 'none',
        title: '请上传商铺Icon图片'
      })
      return false;
    }
    if (this.data.storeLogo == null) {
      wx.showToast({
        icon: 'none',
        title: '请上传商铺Logo图片'
      })
      return false;
    }
    return true;
  },
  uploadLogo: function () {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success(res) {
        if (res.tempFiles[0].size > 1200000) {
          wx.showToast({
            icon: "none",
            title: '每张图片大小不得超过1M',
            duration: 3000
          })
          return;
        }
        wx.showLoading({
          title: '图片加载中',
        })
        that.setData({
          width: 375,
          height: 200,
          cropShow: true,
          imgType: 0,
          logoChange: true,
          src: res.tempFilePaths[0]
        })
      }
    })
  },
  uploadIcon: function () {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success(res) {
        if (res.tempFiles[0].size > 500000) {
          wx.showToast({
            icon: "none",
            title: '每张图片大小不得超过500kb',
            duration: 3000
          })
          return;
        }
        wx.showLoading({
          title: '图片加载中',
        })
        that.setData({
          width: 100,
          height: 100,
          cropShow: true,
          imgType: 1,
          iconChange: true,
          src: res.tempFilePaths[0]
        })
      },
      fail: function (res) {
      }
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
    if (this.data.imgType == 0) {
      that.setData({
        cropShow: false,
        storeLogo: e.detail.url
      })
    } else {
      this.setData({
        cropShow: false,
        storeIcon: e.detail.url
      })
    }
  },
})