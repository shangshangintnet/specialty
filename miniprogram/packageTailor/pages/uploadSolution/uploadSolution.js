const httphelper = require('../../../httphelper.js');
const common = require('../../../common.js');
const app = getApp();
let that;
//解料只有店主可以添加
Page({

  /**
   * 页面的初始数据
   */
  data: {
    curMaterial: {}, //原料
    active: 0,
    bar_Height: 0,
    beUser: false, //普通用户或店主(雕刻师)
    edit: false,
    user: null,
    normalprice: null, //普通抛光费
    fineprice: null, //精抛费
    stone: {
      type: 0,
      status: 0,
      display: 0,
      polishType: 0,
    },
    polishType: [{
        value: 0,
        name: '普通抛光'
      },
      {
        value: 1,
        name: '精细抛光'
      }
    ],
    typeItems: [{
        value: 0,
        name: '解料'
      },
      {
        value: 1,
        name: '废料(用户不要的料子)'
      }
    ],
    status: [{
        value: 0,
        name: '未雕刻'
      },
      {
        value: 1,
        name: '雕刻中'
      },
      {
        value: 2,
        name: '雕刻完成(待支付)'
      },
      {
        value: 3,
        name: '交易完成'
      }
    ],
    display: [{
        value: 0,
        name: '用户自己可见'
      },
      {
        value: 1,
        name: '所有用户可见(雕刻鉴赏)'
      },
      {
        value: 2,
        name: '都不可见(用户不要的废料)'
      }
    ],
    imageUrls: [],
    staff: [],
    solution2material: false, //废料转原料
    dispatchStaff: true, //是否可分配雕刻
    displayDisable: false, //是否可以修改展示状态
    staffPrice: 0, //学员分成
    payTime: '', //支付时间
    staffPrices: [], //所有人分成
    order: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    let edit = options.edit != null;
    if (edit) {
      let active = options.edit == 2 ? 2 : 0;
      app.curStone.staffName = app.staffMap[app.curStone.staffId].name;
      let staff = app.staffMap[app.curStone.staffId].staff;
      staff.map((val) => {
        if (app.curStone.staffIds && app.curStone.staffIds.indexOf(val.id) != -1) {
          val.checked = true;
        } else {
          val.checked = false;
        }
      })
      this.setData({
        active: active,
        edit: edit,
        staff: staff,
        bar_Height: app.bar_Height,
        user: app.user,
        beUser: app.user.carveType != 1,
        stone: app.curStone, //解料
        imageUrls: app.curStone.images ? app.curStone.images.split(',') : [],
        solution2material: app.curStone.type == 1 && app.curStone.display == 2, //废料是否可以再加工
        dispatchStaff: app.curStone.status < 2,
        displayDisable: app.curStone.display == 2
      })
      this.caculateStaffPrice();
    } else {
      let materialId = "stone.materialId";
      let mobile = "stone.mobile";
      let userName = "stone.userName"
      this.setData({
        edit: edit,
        curMaterial: app.curStone, //原料
        bar_Height: app.bar_Height,
        user: app.user,
        beUser: app.user.carveType != 1,
        [materialId]: app.curStone.id,
        [mobile]: app.curStone.mobile,
        [userName]: app.curStone.userName
      })
    }
  },
  caculateStaffPrice() {
    if (this.data.user.carvingLevel == 1) {
      let price = this.data.stone.totalPrice;
      if (this.data.stone.polishType == 1) {
        price -= this.data.stone.polishPrice;
      }
      let length = this.data.stone.staffIds ? this.data.stone.staffIds.split(',').length : 0;
      this.setData({
        staffPrice: (price * 0.35 / length).toFixed(2),
        payTime: this.data.stone.payTime
      })
    } else {
      let price = this.data.stone.totalPrice;
      let staffIds = this.data.stone.staffIds ? this.data.stone.staffIds.split(',') : [];
      let length = staffIds.length;
      if (this.data.stone.polishType == 1) {
        price -= this.data.stone.polishPrice;
      }
      let price1 = (price * 0.35 / length).toFixed(2);
      let staffs = app.staffMap[app.curStone.staffId].staff;
      let staffPrices = [];
      if (length > 1) {
        if (staffIds.indexOf(this.data.stone.staffId.toString()) === -1) {
          //雕刻师未参与雕刻
          staffPrices.push({
            name: this.data.stone.staffName,
            value: price * 0.15
          })
          staffIds.map((val) => {
            staffs.map((v2) => {
              if (v2.id == val) {
                staffPrices.push({
                  name: v2.name,
                  value: price1
                })
              }
            })
          })
        } else {
          //雕刻师参与雕刻
          staffPrices.push({
            name: this.data.stone.staffName,
            value: price * 0.15 + parseFloat(price1)
          })
          staffIds.map((val) => {
            staffs.map((v2) => {
              if (val != this.data.stone.staffId && val == v2.id) {
                staffPrices.push({
                  name: v2.name,
                  value: price1
                })
              }
            })
          })
        }
      } else {
        if (staffIds == this.data.stone.staffId) {
          //雕刻师自己雕
          staffPrices.push({
            name: this.data.stone.staffName,
            value: price1
          })
        } else {
          //学员雕
          staffPrices.push({
            name: this.data.stone.staffName,
            value: price * 0.15
          })
          staffs.map((v2) => {
            if (v2.id == staffIds) {
              staffPrices.push({
                name: v2.name,
                value: price1
              })
            }
          })
        }
      }
      this.setData({
        staffPrices: staffPrices,
        payTime: this.data.stone.payTime
      })
    }
  },
  tagTo: function (e) {
    if (this.data.edit) {
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
    let key = "stone.name"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeweight(e) {
    let key = "stone.weight"
    this.setData({
      [key]: e.detail.value
    })
  },
  changemobile(e) {
    let key = "stone.mobile"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeUserName(e) {
    let key = "stone.userName"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeprice(e) {
    let key = "stone.advancePrice"
    this.setData({
      [key]: e.detail.value
    })
  },
  changeTotalprice(e) {
    let key = "stone.totalPrice"
    this.setData({
      [key]: e.detail.value
    })
  },
  //原料类型
  changeType: function (e) {
    let type = "stone.type"
    this.setData({
      [type]: this.data.typeItems[e.detail.value].value,
    })
  },
  //抛光类型
  changePolishType: function (e) {
    let polishType = "stone.polishType"
    this.setData({
      [polishType]: this.data.polishType[e.detail.value].value,
    })
  },
  changepolishPrice(e) {
    let price = "stone.polishPrice"
    this.setData({
      [price]: e.detail.value
    })
  },
  //成本价
  changenCostprice(e) {
    let price = "stone.costPrice"
    this.setData({
      [price]: e.detail.value
    })
  },
  //出售价
  changeSaleprice(e) {
    let price = "stone.price"
    this.setData({
      [price]: e.detail.value
    })
  },
  //展示状态
  changedisplay: function (e) {
    let display = "stone.display"
    this.setData({
      [display]: this.data.display[e.detail.value].value,
    })
  },
  //解料状态
  changeStatus: function (e) {
    let status = "stone.status"
    this.setData({
      [status]: this.data.status[e.detail.value].value,
    })
  },
  //解料简介
  changeinfo(e) {
    let key = "stone.desc"
    this.setData({
      [key]: e.detail.value
    })
  },
  checkboxChange(e) {
    if (!this.data.dispatchStaff) {
      wx.showToast({
        icon: 'none',
        title: '已经雕刻完成,不可改变雕工分配'
      });
      return;
    }
    let index = parseInt(e.currentTarget.dataset.index);
    let items = this.data.staff
    items[index].checked = !items[index].checked;
    this.setData({
      staff: items
    })
  },
  //废料变原料
  solutionToMaterial() {
    if (!this.data.solution2material) {
      wx.showToast({
        icon: "none",
        title: '只有不对用户展示的废料可以再加工',
        duration: 3000
      })
      return;
    }
    httphelper.api("carve/findMaterialById", {
      id: that.data.stone.materialId
    }, function (serverdata) {
      if (serverdata.code == 200) {
        wx.navigateTo({
          url: '../uploadTailor/uploadTailor?type=1',
        })
      }
    });
  },
  confirm: function () {
    if (this.data.edit) {
      if (this.data.beUser && this.data.stone.status == 2) {
        //支付
        httphelper.api("carve/createOrder", null, function (serverdata) {
          if (serverdata.code == 200) {
            that.setData({
              order: serverdata.data
            })
            that.selectComponent("#carve").open(serverdata.data);
          }
        });
        return;
      }
      if (this.data.active == 0) {
        if (this.checkBasic()) {
          httphelper.api("carve/updateSolution", that.data.stone, function (serverdata) {
            if (serverdata.code == 200) {
              that.setData({
                solution2material: that.data.stone.type == 1 && that.data.stone.display == 2, //废料是否可以再加工
                dispatchStaff: app.curStone.status < 2,
                displayDisable: app.curStone.display == 2
              })
              that.caculateStaffPrice();
              wx.showToast({
                icon: 'none',
                title: '请求成功'
              });
            }
          });
        }
      } else if (this.data.active == 1) {
        wx.showToast({
          icon: 'none',
          title: '图集信息提交成功'
        });
      } else {
        //分配任务
        if (!this.data.dispatchStaff) {
          wx.showToast({
            icon: 'none',
            title: '已经雕刻完成,不可改变雕工分配'
          });
          return;
        }
        let staff = this.data.staff
        let staffIds = [];
        staff.map((val) => {
          if (val.checked) {
            staffIds.push(val.id);
          }
        })
        let data = {};
        data.id = this.data.stone.id;
        data.staffIds = staffIds.join();
        httphelper.api("carve/assignSculptors", data, function (serverdata) {
          if (serverdata.code == 200) {
            let key = "stone.staffIds";
            that.setData({
              [key]: data.staffIds
            })
            that.caculateStaffPrice();
            wx.showToast({
              icon: 'none',
              title: '任务分配成功'
            });
          }
        });
      }
    } else {
      if (this.data.active == 0) {
        if (this.checkBasic()) {
          httphelper.api("carve/addSolution", that.data.stone, function (serverdata) {
            if (serverdata.code == 200) {
              that.setData({
                stone: serverdata.data,
                active: 1
              })
            }
          });
        }
      } else {
        common.goBackAfterMsg('解料添加成功');
      }
    }
  },
  payOrder(e) {
    common.carvePay(this.data.order.id, (res) => {
      if (res) {
        that.selectComponent("#carve").close_order();
        let key = "stone.status";
        that.setData({
          [key]: 3
        })
      }
    })
  },
  checkBasic: function () {
    if (that.data.stone.name == null || that.data.stone.name == "" ||
      that.data.stone.weight == null || (that.data.stone.weight == "" && that.data.stone.weight != 0) ||
      that.data.stone.mobile == ""
    ) {
      wx.showToast({
        icon: 'none',
        title: '请将信息填写完整'
      })
      return false;
    }
    return true;
  },
  /* 图集信息 */
  selectImage: function () {
    if (this.data.edit && this.data.beUser)
      return;
    let that = this;
    wx.chooseImage({
      count: 6 - that.data.imageUrls.length,
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
          data.id = that.data.stone.id;
          data.imageUrl = that.data.imageUrls[e.currentTarget.dataset.index];
          data.type = 1;
          httphelper.api('carve/delImage', data, (serverData) => {
            if (serverData.code == 200) {
              that.data.imageUrls.splice(e.currentTarget.dataset.index, 1);
              let temp = that.data.imageUrls;
              let images = "stone.images";
              that.setData({
                imageUrls: temp,
                [images]: temp.join()
              })
            }
          });
        }
      }
    })
  },
  uploadImgList: function () {
    wx.uploadFile({
      url: app.url + "carve/uploadFile",
      filePath: that.data.filePaths[that.data.uploadIndex],
      name: 'image_1',
      formData: {
        ssoToken: app.ssoToken,
        id: this.data.stone.id,
        type: 1
      },
      success(res) {
        that.setData({
          uploadIndex: that.data.uploadIndex + 1
        });
        if (that.data.uploadIndex == that.data.uploadCount) {
          let data = JSON.parse(res.data);
          var imgs = data.data.split(',');
          let images = "stone.images";
          that.setData({
            imageUrls: imgs,
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
          that.uploadImgList();
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
  uploadVideo() {
    if (this.data.beUser)
      return;
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      success(res) {
        if (res.size > 10000000) {
          wx.showToast({
            icon: "none",
            title: '视频大小不得超过10m',
            duration: 3000
          })
          return;
        }
        wx.showLoading({
          title: '上传中，请稍后~',
        })
        common.uploadFile(res.tempFilePath, (res) => {
          let video = "stone.video";
          that.setData({
            [video]: res.data.files
          })
          httphelper.api("carve/updateSolution", that.data.stone, function (serverdata) {
            wx.hideLoading({
              success: (res) => {
                wx.showToast({
                  title: '视频上传成功',
                  duration: 3000
                })
              },
            })
          });
        }, "carve/Solution/video", that.data.stone.id);
      },
      fail: function (res) {}
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