import CustomPage from '../base/CustomPage'

CustomPage({
  data: {
    slideButtons: [
      { text: '移除', type: 'warn' },
    ],
    subs: [],
  },

  update() {
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    const db = wx.cloud.database()
    const table = db.collection('bdsub__subs')
    table.orderBy('target', 'asc').get().then(({ data }) => {
      this.setData({
        subs: data.map((value) => {
          switch (value.type) {
            case 'class':
              value.type = '班级'
              break
            case 'student':
              value.type = '学生'
              break
          }
          return value
        }),
      })
      wx.hideLoading()
    })
  },

  onShow() {
    this.update()
  },
})
