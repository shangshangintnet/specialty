// components/login/login.js
const httphelper = require('../../httphelper.js')
const common = require('../../common.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    show: false,
    order: {},
    logdata: null,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    open() {
      this.getData();
    },
    close: function () {
      this.setData({
        show: false
      })
    },
    mask() {
    },
    getData: function (e) {
      let that = this;
      if (this.data.logdata == null) {
        httphelper.api('store/getExpressCode', null, (serverData) => {
          if (serverData.code == 200) {
            that.setData({
              logdata: serverData.data,
              show: true
            })
          }
        });
      } else {
        that.setData({
          show: true
        })
      }
    },
    changeLogistics: function (e) {
      this.setData({
        curLogistics: this.data.logdata[e.detail.value]
      })
    },
    changeNum(e) {
      this.setData({
        curLogNum: e.detail.value
      })
    },
    bindLogdata: function (e) {
      if (this.data.curLogNum == null || this.data.curLogistics.code == null) {
        wx.showToast({
          icon: 'none',
          title: '请填写完整信息',
        })
        return;
      }
      let data = {};
      data.logisticsNum = this.data.curLogNum;
      data.logisticsCode = this.data.curLogistics.code;
      this.triggerEvent("logdata", data);
      this.setData({
        show: false
      })
    },
  }
})