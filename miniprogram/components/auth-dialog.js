Component({
  options: {
    styleIsolation: 'apply-shared',
  },

  properties: {
    show: Boolean,
  },

  data: {},

  methods: {
    onClose() {
      this.setData({
        show: false,
      })
    },

    stopEvent() {},
  },
})
