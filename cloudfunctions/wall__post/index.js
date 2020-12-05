const lib = require('./lib')

exports.main = async (e) => {
  switch (e.method) {
    case 'checkAbility':
      return await lib.checkAbility()

    case 'submit':
      return await lib.submit(e)

    default:
      return lib.returnData(false, 'Method doesn\'t exists.')
  }
}
