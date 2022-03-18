// components/stepper/stepper.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    max: {
      type: Number,
      value: 100 // 最大值
    },
    value: {
      type: Number,
      value: 1 //默认值
    },
    min: {
      type: Number,
      value: 1 //默认值
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    count: 1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setMax: function (val) {
      this.setData({
        max: val
      })

      if (this.data.value > this.data.max) {
        this.setData({
          value: this.data.max
        })
        this.triggerEvent('data', this.data.value);
      }

    },
    goods_trigger_minus: function () {
      console.log('minus');
      if (this.data.value > this.data.min) {

        this.setData({
          value: --this.data.value > 0 ? parseFloat(this.data.value).toFixed(2) : 0
        })
        this.triggerEvent('data', this.data.value);
      }
    },
    goods_trigger_add: function () {
      console.log('add');
      console.log(this.data.max);

      this.setData({
        value: (this.data.value + 1 > this.data.max) ? this.data.max : ++this.data.value
      })

      this.triggerEvent('data', this.data.value);
    },
    changeCondition: function (e) {

      if (e.detail.value == '') {

      } else if (e.detail.value <= 0) {
        e.detail.value = 1
      }

      if (e.detail.value > this.data.max) {
        e.detail.value = this.data.max;
      }

      let val = parseFloat(e.detail.value).toFixed(2);

      this.setData({
        value: val,
      });

      this.triggerEvent('data', this.data.value);
    },
  }
})