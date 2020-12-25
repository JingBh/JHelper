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

  add() {
    const tmplId = 'U-koI36cH2TSHstruz7dTV9bfhF7j4I6mZQ7NMTY9aE'
    wx.requestSubscribeMessage({
      tmplIds: [tmplId],
      success: (res) => {
        if (res[tmplId] === 'accept') {
          wx.navigateTo({
            url: '/bdsub/add',
          })
        }
      },
      fail(res) {
        console.error(res)
      },
    })
  },

  onShow() {
    this.update()
  },
})
