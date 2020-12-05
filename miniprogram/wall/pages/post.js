import { promisify } from 'miniprogram-api-promise'
import { DateTime, Settings } from 'luxon'

Settings.defaultZoneName = 'UTC+8'

Component({
  lifetimes: {
    attached() {
      let ability = wx.getStorageSync('wall__post_ability')
      let valid
      if (ability && ability.time) {
        console.log(ability)
        const now = DateTime.local()
        const cacheTime = DateTime.fromMillis(ability.time)
        valid = now.hasSame(cacheTime, 'hour')
      } else {
        valid = false
      }
      if (valid) {
        if (ability.success !== true) {
          this.error(`你今天已发送 ${ability.data} 条消息，已达到上限，请明天再来吧。`)
        }
        this.setData({ loaded: true })
      } else {
        console.log('Cache invalid, re-checking...')
        wx.showLoading({
          title: '加载中...',
          mask: true,
        })
        wx.cloud.callFunction({
          name: 'wall__post',
          data: {
            method: 'checkAbility',
          },
        }).then(({ result }) => {
          console.log(result)
          result.time = DateTime.local().ts
          if (result.success !== true) {
            this.error(`你今天已发送 ${result.data} 条消息，已达到上限，请明天再来吧。`)
          }
          wx.setStorageSync('wall__post_ability', result)
        }).catch((error) => {
          console.error(error)
          this.error('请求服务器失败，暂时无法发送新内容。')
        }).finally(() => {
          wx.hideLoading()
          this.setData({ loaded: true })
        })
      }
      this.loadDraft()
    },

    detached() {
      this.saveDraft()
    },
  },

  options: {
    styleIsolation: 'apply-shared',
  },

  data: {
    loaded: false,

    error: false,
    errorText: '',

    hint: false,
    hintText: '',

    authDialog: false,
    userInfo: null,

    submitHint: false,

    text: '',
    textCount: 0,
    anonymous: false,

    dialogButtons: [
      { text: '知道了' },
    ],
    submitDialogButtons: [
      { text: '取消' },
      { text: '确认' },
    ],
  },

  methods: {
    error(text) {
      this.setData({
        error: true,
        errorText: text,
      })
    },

    hint(text) {
      this.setData({
        hint: true,
        hintText: text,
      })
    },

    closeHint() {
      this.setData({
        hint: false,
        hintText: '',
      })
    },

    closeSubmitHint(e) {
      this.setData({ submitHint: false })
      if (e.detail.index === 1) {
        this._submit()
      }
    },

    back() {
      this.triggerEvent('back')
    },

    loadDraft() {
      let draft = wx.getStorageSync('wall__post_draft')
      if (draft) {
        draft = draft.toString().trim()
        this.setData({
          text: draft,
          textCount: draft.length,
        })
      }
    },

    saveDraft() {
      if (this.data.text.trim().length > 0) {
        wx.setStorageSync('wall__post_draft', this.data.text.trim())
      }
    },

    _submit() {
      wx.showLoading({
        title: '加载中...',
        mask: true,
      })
      wx.cloud.callFunction({
        name: 'wall__post',
        data: {
          method: 'submit',
          text: this.data.text,
          userInfo: this.data.anonymous ? null : wx.cloud.CloudID(
            this.data.userInfo.cloudID),
        },
      }).then(({ result }) => {
        console.log(result)
        if (result.success === true) {
          wx.removeStorageSync('wall__post_ability')
          wx.removeStorageSync('wall__post_draft')
          wx.redirectTo({
            url: 'pages/post_success',
          })
        } else {
          this.hint(result.message)
        }
      }).catch((error) => {
        console.error(error)
        this.error('请求服务器失败，暂时无法发送新内容。你的草稿已保存，请稍后再试。')
      }).finally(() => {
        wx.hideLoading()
      })
    },

    onSubmit() {
      const text = (this.data.text || '').trim()
      if (text.length <= 0) {
        this.hint('消息内容为空，无法提交。')
      } else if (text.length < 10) {
        this.hint('消息内容过短，请多写几个字吧~')
      } else if (text.length > 300) {
        this.hint('消息内容过长，请适当缩减哦~')
      } else {
        if (!this.data.anonymous) {
          promisify(wx.getSetting)().then(({ authSetting }) => {
            if (!authSetting['scope.userInfo']) {
              this.setData({ authDialog: true })
            } else {
              promisify(wx.getUserInfo)().then((result) => {
                this.setData({
                  userInfo: result,
                  submitHint: true,
                })
              })
            }
          })
        } else {
          this.setData({ submitHint: true })
        }
      }
    },

    onInput(e) {
      const text = e.detail.value || ''
      this.setData({
        text,
        textCount: text.trim().length,
      })
    },
  },
})
