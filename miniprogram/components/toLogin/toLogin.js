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
    showModal: false,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    navigateTo:function(e) {
      this.setData({
        showModal:false
      })
      common.navigateTo(e);
    },
    /**
     * 弹窗
     */
    showLoginModal: function () {
      this.setData({
        showModal: true
      })
    },
    /**
     * 隐藏模态对话框
     */
    hideLoginModal: function () {
      this.setData({
        showModal: false
      });
    },
    /************授权对话框结束***********/


  }
})