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

  },
})
