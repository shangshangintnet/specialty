Component({
  /* 组件的属性列表 */
  properties: {
    title: { // 设置标题
      type: String,
      value: ''
    },
    show_bol: { // 控制返回箭头是否显示
      type: Boolean,
      value: false
    },
    my_class: { // 控制样式
      type: Boolean,
      value: false
    },
    bar_Height: {
      type: Number,
      value: 100 // 获取手机状态栏高度
    },
    bg_type: {
      type: String,
      value: "bg_green"
    },
    url: {
      type: String,
      value: null
    },
    isTab: {
      type: Boolean,
      value: true
    }
  },
  /* 组件的初始数据 */
  data: {
    type: "组件",
    opacity: 0,
  },
  /* 组件的方法列表 */
  methods: {
    goBack: function () {
      // 返回事件
      let that = this;
      if (this.data.url != null) {
        if (this.data.url == '我的卡包') {
          wx.navigateBack({
            delta: 2
          })
          return;
        }
        if (this.data.url == "/packageMyself/pages/myself/vCard/vCard") {
          let arr = getCurrentPages();
          if (arr.length <= 1) {
            wx.redirectTo({
              url: this.data.url,
            })
            return;
          } else{
            wx.navigateBack({
              complete: (res) => {},
            })
            return;
          }
        }
        wx.reLaunch({
          url: this.data.url
        })
        return;
      }
      if (getApp().isShare) {
        wx.switchTab({
          url: '/pages/index/index',
        })
        getApp().isShare = 0;
        return;
      }
      wx.navigateBack({
        delta: 1,
        fail: function () {
          wx.switchTab({
            url: '/pages/index/index',
          })
        }
      })
    },
    jumpTo: function (event) {
      wx.navigateTo({
        url: event.currentTarget.dataset.url,
      })
    },
    setOpacity: function (value) {
      wx.setNavigationBarColor({
        frontColor: value < 0.8 ? '#ffffff' : '#000000',
        backgroundColor: '#ff0000',
        animation: {
          duration: 400,
          timingFunc: 'easeIn'
        }
      })

      this.setData({
        opacity: value
      })
    },
  },
  lifetimes: {
    attached() {
      this.setData({
        bar_Height: wx.getSystemInfoSync()['statusBarHeight']
      })
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
    },
  },
})