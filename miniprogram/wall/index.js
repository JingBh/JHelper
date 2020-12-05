import CustomPage from '../base/CustomPage'

const navItems = [
  {
    id: 'wall',
    text: '墙',
    icon: 'home',
  },
  {
    id: 'post',
    text: '发布',
    icon: 'pencil',
  },
  /*{
    id: 'settings',
    text: '设置',
    icon: 'setting'
  },*/
  {
    id: 'mine',
    text: '我的',
    icon: 'me',
  },
]

CustomPage({
  onLoad(params) {
    if ('page' in params) this.setData({
      navActive: params.page,
    })
  },

  data: {
    navItems,
    navActive: 'wall',
    lastNav: 'wall',
  },

  onNav(e) {
    const target = e.currentTarget.dataset.id
    if (target && target !== this.data.navActive) {
      this.setData({
        navActive: target,
        lastNav: this.data.navActive,
      })
    }
  },

  navBack() {
    if (this.data.lastNav) {
      this.setData({
        navActive: this.data.lastNav,
      })
    }
  },
})
