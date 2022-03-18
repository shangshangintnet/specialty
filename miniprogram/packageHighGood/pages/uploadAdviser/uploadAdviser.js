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
    edit: false,
    user: {
      mobile: null
    },
    adviser: {

    },
    active: 0,
    tags: [{
        value: 0,
        name: '客户好评',
        checked: false
      },
      {
        value: 1,
        name: '货主信赖',
        checked: false
      },
    ],
    level: [{
        value: 1,
        name: '销售顾问'
      },
      {
        value: 2,
        name: '货主顾问'
      }
    ],
    tagLevel: [{
        value: 1,
        name: '创始人'
      },
      {
        value: 2,
        name: '公司董事'
      },
      {
        value: 3,
        name: '合伙人'
      }
    ],
    imageUrls: [],
    imageUrls2: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    if (options.edit) {
      let imageUrls = [];
      if (app.curAdviser.photoUrl)
        imageUrls.push(app.curAdviser.photoUrl)
      let imageUrls2 = [];
      if (app.curAdviser.image)
        imageUrls2.push(app.curAdviser.image)
      let tags2 = this.data.tags;
      if (app.curAdviser.tag) {
        let tags = app.curAdviser.tag.split(" ");
        tags2.map((val) => {
          if (tags.indexOf(val.name) !== -1) {
            val.checked = true;
          }
        })
      }
      this.setData({
        edit: true,
        bar_Height: app.bar_Height,
        adviser: app.curAdviser,
        imageUrls: imageUrls,
        imageUrls2: imageUrls2,
        tags: tags2
      })
    } else {
      this.setData({
        edit: false,
        bar_Height: app.bar_Height,
      })
    }
  },
  tagTo(e) {
    if (that.data.edit) {
      that.setData({
        active: e.currentTarget.dataset.index
      })
    }
  },
  changeLevel(e) {
    that.setData({
      ["adviser.level"]: that.data.level[e.detail.value].value
    })
  },
  changeTagLevel(e) {
    that.setData({
      ["adviser.tagLevel"]: that.data.tagLevel[e.detail.value].value
    })
  },
  changeMobile(e) {
    that.setData({
      ["user.mobile"]: e.detail.value
    })
    if (e.detail.value.length == 11)
      this.findUser(e.detail.value, 0);
  },
  changeName(e) {
    that.setData({
      ["adviser.name"]: e.detail.value
    })
  },
  changeYear(e) {
    that.setData({
      ["adviser.years"]: e.detail.value
    })
  },
  changeEducational(e) {
    that.setData({
      ["adviser.educational"]: e.detail.value
    })
  },
  changeDeclaration(e) {
    that.setData({
      ["adviser.declaration"]: e.detail.value
    })
  },
  changeServiceArea(e) {
    that.setData({
      ["adviser.serviceArea"]: e.detail.value
    })
  },
  changeSelfEvaluation(e) {
    that.setData({
      ["adviser.selfEvaluation"]: e.detail.value
    })
  },
  findUser(mobile, type) {
    httphelper.api("high/findUserByMoblie", {
      mobile: mobile,
      type: type
    }, (serverdata) => {
      if (serverdata.data == null) {
        wx.showModal({
          title: '暂无用户',
          content: '是否添加手机号码为' + mobile + '的用户',
          success: function (res) {
            if (res.confirm) {
              that.findUser(mobile, 1);
            }
          }
        });
      } else {
        serverdata.data.mobile = mobile;
        that.setData({
          user: serverdata.data,
          ["adviser.userId"]: serverdata.data.id
        })
      }
    })
  },
  checkboxChange(e) {
    let tagValue = "";
    for (let i = 0; i < e.detail.value.length; i++) {
      if (i == e.detail.value.length - 1)
        tagValue += e.detail.value[i];

      else
        tagValue += e.detail.value[i] + " ";
    }
    that.setData({
      ["adviser.tag"]: tagValue
    })
  },
  confirm(e) {
    if (that.data.edit) {
      if (that.data.active == 0) {
        httphelper.api("high/updateHighBroker", that.data.adviser, (serverdata) => {
          if (serverdata.code == 200) {
            that.setData({
              adviser: serverdata.data,
            })
            wx.showToast({
              title: '修改成功',
            })
          }
        });
      } else {
        common.goBackAfterMsg('修改成功')
      }
    } else {
      if (that.data.active == 0) {
        if (that.checkBasic()) {
          httphelper.api("high/addHighBroker", that.data.adviser, (serverdata) => {
            if (serverdata.code == 200) {
              that.setData({
                adviser: serverdata.data,
                active: 1,
              })
              wx.showToast({
                title: '基本信息添加成功',
              })
            }
          });
        }
      } else {
        common.goBackAfterMsg('添加成功')
      }
    }
  },
  checkBasic: function () {
    if (that.data.adviser.name == null || that.data.adviser.name == "" ||
      that.data.user.mobile == null || that.data.user.mobile == "" ||
      that.data.adviser.years == null || that.data.adviser.years == "" ||
      that.data.adviser.educational == null || that.data.adviser.educational == "" ||
      that.data.adviser.declaration == null || that.data.adviser.declaration == "" ||
      that.data.adviser.serviceArea == null || that.data.adviser.serviceArea == "" ||
      that.data.adviser.selfEvaluation == null || that.data.adviser.selfEvaluation == "" ||
      that.data.adviser.tag == null || that.data.adviser.tag == ""
    ) {
      wx.showToast({
        icon: 'none',
        title: '请填写完整信息'
      })
      return false;
    }
    return true;
  },
  /* 图集信息 */
  selectImage: function () {
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
        that.setData({
          uploadCount: res.tempFilePaths.length,
          filePaths: res.tempFilePaths,
          uploadIndex: 0
        })
        wx.showLoading({
          title: '图片上传中',
        });
        that.uploadImgList();
      },
      fail: function (res) {}
    })
  },
  previewImage(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.item, // 当前显示图片的http链接
      urls: this.data.imageUrls // 需要预览的图片http链接列表
    })
  },
  deleteImage: function (e) {
    if (this.data.edit && this.data.beUser)
      return;
    wx.showModal({
      title: '删除图片',
      content: '确定要删除所选图片吗？',
      success(res) {
        if (res.confirm) {
          let data = {};
          data.id = that.data.adviser.id;
          data.imageUrl = that.data.imageUrls[e.currentTarget.dataset.index];
          data.type = 2;
          httphelper.api('high/delImage', data, (serverData) => {
            if (serverData.code == 200) {
              let images = "adviser.photoUrl";
              that.setData({
                imageUrls: [],
                [images]: ""
              })
            }
          });
        }
      }
    })
  },
  uploadImgList: function () {
    let formdata = {};
    formdata.ssoToken = app.ssoToken;
    formdata.id = that.data.adviser.id;
    formdata.type = 2;
    wx.uploadFile({
      url: app.url + "high/uploadFile",
      filePath: that.data.filePaths[that.data.uploadIndex],
      name: 'image_1',
      formData: formdata,
      success(res) {
        let data = JSON.parse(res.data);
        if (data.code == 200) {
          let images = "adviser.photoUrl";
          that.setData({
            imageUrls: data.data.split(','),
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
        } else {
          wx.hideLoading({
            complete: () => {
              wx.showToast({
                icon: "none",
                title: '顾问已关联商家，无法修改头像',
                duration: 3000,
              });
            },
          })
        }
      },
      fail(res) {
        wx.showToast({
          icon: 'none',
          title: res.errMsg
        });
      }
    });
  },
  /* 参考图信息 */
  selectImage2: function () {
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
        that.setData({
          referencefile: res.tempFilePaths[0],
        })
        wx.showLoading({
          title: '图片上传中',
        });
        that.uploadImgList2();
      },
      fail: function (res) {}
    })
  },
  previewImage2(e) {
    wx.previewImage({
      current: this.data.imageUrls2[0], // 当前显示图片的http链接
      urls: this.data.imageUrls2 // 需要预览的图片http链接列表
    })
  },
  deleteImage2: function (e) {
    wx.showModal({
      title: '删除图片',
      content: '确定要删除所选图片吗？',
      success(res) {
        if (res.confirm) {
          let data = {};
          data.id = that.data.adviser.id;
          data.imageUrl = that.data.imageUrls2[e.currentTarget.dataset.index];
          data.type = 3;
          httphelper.api('high/delImage', data, (serverData) => {
            if (serverData.code == 200) {
              let images = "adviser.image";
              that.setData({
                imageUrls2: [],
                [images]: ""
              })
            }
          });
        }
      }
    })
  },
  uploadImgList2: function () {
    let formdata = {};
    formdata.ssoToken = app.ssoToken;
    formdata.id = that.data.adviser.id;
    formdata.type = 3;
    wx.uploadFile({
      url: app.url + "high/uploadFile",
      filePath: this.data.referencefile,
      name: 'image_1',
      formData: formdata,
      success(res) {
        let data = JSON.parse(res.data);
        let images = "adviser.image";
        that.setData({
          imageUrls2: data.data.split(','),
          [images]: data.data
        })
        wx.hideLoading({
          complete: () => {
            wx.showToast({
              title: '参考图上传成功',
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