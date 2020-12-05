const cloud = require('wx-server-sdk')
const { DateTime, Settings } = require('luxon')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

const db = cloud.database()

Settings.defaultZoneName = 'Asia/Shanghai'

const getOpenID = () => cloud.getWXContext().OPENID
const getTable = () => db.collection('wall__posts')

function returnData(success, messageOrData, data) {
  let message = ''
  if (typeof messageOrData != 'string') {
    data = messageOrData
  } else message = messageOrData
  if (data === undefined) data = null
  return {
    success,
    message,
    data,
  }
}

async function checkAbility(openID) {
  openID = openID || getOpenID()
  if (openID) {
    const table = getTable()
    const now = DateTime.local()
    const start = now.startOf('day').toJSDate()
    const end = now.endOf('day').toJSDate()
    const count = (await table.where({
      _openid: openID,
      time: db.command.gte(start).and(db.command.lte(end)),
    }).count()).total
    return returnData(count < 5, count)
  } else return returnData(false, '请先登录。')
}

async function submit(e) {
  const openID = getOpenID()
  const ability = (await checkAbility(openID)).success
  if (ability) {
    const text = (e.text || '').trim()
    const userInfo = e.userInfo || null
    if (text.length <= 0) {
      return returnData(false, '消息内容为空，无法提交。')
    } else if (text.length < 10) {
      return returnData(false, '消息内容过短，请多写几个字吧~')
    } else if (text.length > 300) {
      return returnData(false, '消息内容过长，请适当缩减哦~')
    } else {
      const table = getTable()
      const result = await table.add({
        data: {
          _openid: openID,
          content: text,
          time: DateTime.local().toJSDate(),
          userInfo: userInfo ? {
            avatarUrl: userInfo.data.avatarUrl,
            nickName: userInfo.data.nickName,
          } : null,
        },
      })
      return returnData(true, result)
    }
  } else return returnData(false, '暂时无法发送新内容，请明天再试。')
}

module.exports = {
  checkAbility,
  submit,
  returnData,
}
