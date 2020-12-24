import CustomPage from '../base/CustomPage'

CustomPage({
  data: {
    input: '',
  },

  onInput(e) {
    this.setData({
      input: e.detail.value,
    })
  },

  submit() {
    const input = this.data.input.toUpperCase().trim()
    if (input.length > 0) {
      let type = ''
      if (input.match(/^G19[0-9]{2}$/i)) {
        type = 'class'
      } else if (input.match(/^G19[0-9]{4}$/i)) {
        type = 'student'
      } else return wx.showModal({
        title: '提示',
        content: '你输入的内容不符合班号或学号的格式',
        showCancel: false,
      })
      wx.showLoading({
        title: '加载中...',
        mask: true,
      })
      wx.cloud.callFunction({
        name: 'bdsub__add',
        data: {
          type,
          target: input,
        },
      }).then(({ result }) => {
        wx.hideLoading()
        if (result[0] === true) {
          wx.navigateBack()
        } else {
          wx.showModal({
            title: '提示',
            content: result[1] || '添加订阅失败',
            showCancel: false,
          })
        }
      }).catch((e) => {
        console.error(e)
        wx.hideLoading()
        wx.showModal({
          title: '错误',
          content: '请求过程中发生错误',
          showCancel: false,
        })
      })
    } else wx.showModal({
      title: '提示',
      content: '请先在输入框中输入一个班号或学号',
      showCancel: false,
    })
  },
})
