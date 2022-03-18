// components/goods_detail/details.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    specification:{
      type:Array,
    },
    imagesUrls:{
      type:Array,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    setGoodsDetails: function (specification,imagesUrls){
      this.setData({
        specification:specification,
        imagesUrls:imagesUrls,
      })
    },
  }
})