const themeListeners = []

App({
  onLaunch() {
    wx.cloud.init({
      traceUser: true,
    })
    this.updateTheme()
  },

  updateTheme() {
    const info = wx.getSystemInfoSync()
    if (info.theme) {
      this.onThemeChange({ theme: info.theme })
    }
  },

  onThemeChange({ theme }) {
    this.globalData.theme = theme
    themeListeners.forEach(listener => listener(theme))
  },

  watchThemeChange(listener) {
    if (themeListeners.indexOf(listener) < 0) {
      themeListeners.push(listener)
    }
  },

  unWatchThemeChange(listener) {
    const index = themeListeners.indexOf(listener)
    if (index > -1) {
      themeListeners.splice(index, 1)
    }
  },

  globalData: {
    theme: 'light',
  },
})
