// Reference: https://github.com/wechat-miniprogram/weui-miniprogram/blob/master/tools/demo/base/CustomPage.js

const themeMixin = Behavior({
  data: {
    theme: 'light',
  },
  methods: {
    themeChanged(theme) {
      this.setData({ theme })
    },
  },
})

export default function (options) {
  return Page(
    Object.assign({}, options, {
      behaviors: [themeMixin].concat(options.behaviors || []),

      onLoad(query) {
        const app = getApp()
        this.themeChanged(app.globalData.theme)
        app.watchThemeChange && app.watchThemeChange(this.themeChanged)
        options.onLoad && options.onLoad.call(this, query)
      },

      onUnload() {
        const app = getApp()
        app.unWatchThemeChange && app.unWatchThemeChange(this.themeChanged)
        options.onUnload && options.onUnload.call(this)
      },
    }),
  )
}
