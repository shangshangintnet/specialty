// component/v-model/model.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    titleName: {
      type: String,
      value: '请设定titleName'
    },
    goTxt: {
      type: String,
      value: '确认请设定goTxt'
    },
    cancelTxt: {
      type: String,
      value: '取消请设定cancelTxt'
    },
    confirmTxt:{
      type: String,
      value: '默认文本,请在model中设置confirmTxt属性'
    },
    isOpen: {
      type: Boolean,
      value: false
    },
    /**
     * 开启模式 0 Bottom 1 Mid 2 Alert
     */
    openType: {
      type: Number,
      value: 0
    },
    jumpUrl: {
      type: String,
      value: " "
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},
  /**
   * 组件的方法列表
   */
  methods: {
    success:function(){
      this.close();
      this.triggerEvent('successEvent');
    },
    cancel:function(){
      this.close();
      this.triggerEvent('failEvent');
    },
    close:function(){
      this.setData({
        isOpen: false
      })
    },
    show: function() {
      this.setData({
        isOpen: true
      })
    },
  }
})