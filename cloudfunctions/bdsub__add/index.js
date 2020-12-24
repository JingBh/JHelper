const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
})

const db = cloud.database({
  throwOnNotFound: false,
})
const _ = db.command

const getOpenID = () => cloud.getWXContext().OPENID

exports.main = async (e) => {
  const type = e.type || ''
  const target = e.target || ''
  const openID = getOpenID()
  if (!type || !target || !openID) return [false, '请求格式错误']

  const studentsTable = db.collection('bdsub__students')
  const subsTable = db.collection('bdsub__subs')

  const countAll = (await subsTable.where({
    _openid: openID,
  }).count()).total
  if (countAll >= 20) return [false, '订阅数已达上限，请先移除部分订阅']

  if (type === 'class') {
    const classStudentsCount = (await studentsTable.where({
      'class': target,
    }).count()).total
    if (classStudentsCount > 0) {
      await subsTable.where({
        _openid: openID,
        'class': target,
      }).remove()
      await subsTable.add({
        data: {
          _openid: openID,
          type,
          'class': target,
          target,
          createdAt: new Date(),
        },
      })
      return [true, null]
    }
    return [false, '指定的班级不存在']
  } else if (type === 'student') {
    const student = await studentsTable.doc(target).get()
    if (student.data) {
      const studentID = student.data['_id']
      const classID = student.data['class']
      const hasSub = (await subsTable.where(_.and([
        {
          _openid: openID,
        },
        _.or([
          {
            type: 'student',
            target: studentID,
          },
          {
            type: 'class',
            target: classID,
          },
        ]),
      ])).count()).total > 0
      if (hasSub) return [false, '已订阅此学生或其所在班级，不能重复订阅']
      await subsTable.add({
        data: {
          _openid: openID,
          type,
          'class': student.data['class'],
          target: studentID,
          createdAt: new Date(),
        },
      })
      return [true, null]
    }
    return [false, '指定的学生不存在']
  }
  return [false, '请求类型错误']
}
