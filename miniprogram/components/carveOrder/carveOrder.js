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
    order: {}
  },
  /**
   * 组件的方法列表
   */
  methods: {
    open(order) {
      this.setData({
        order: order,
        show: true
      })
      console.log(this.data.order)
    },
    close_order: function () {
      this.setData({
        show: false
      })
    },
    pay: function () {
      this.triggerEvent("pay", true);
    },

  }
})