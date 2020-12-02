Component({
  lifetimes: {
    attached() {
      wx.showLoading({
        title: '加载中...',
      })
      wx.cloud.callFunction({
        name: 'checkCanPost',
      }).then(({ result }) => {
        if (result !== true) this.error(result)
      }).catch((error) => {
        console.error(error)
        this.error('请求服务器失败，暂时无法发送新内容。')
      }).finally(() => {
        wx.hideLoading()
        this.setData({
          loaded: true,
        })
      })
    },
  },

  options: {
    styleIsolation: 'apply-shared',
  },

  data: {
    loaded: false,
    error: false,
    errorText: '',
    text: '',
    textCount: 0,
    dialogButtons: [
      { text: '知道了' },
    ],
  },

  methods: {
    error(text) {
      this.setData({
        error: true,
        errorText: text,
      })
    },

    back() {
      this.triggerEvent('back')
    },

    onInput(e) {
      console.log(e)
    },
  },
})
