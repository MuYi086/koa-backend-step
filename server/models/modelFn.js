const UserModel = require('./User.model')

/**
 * 找到同名的用户
 * @param {string} username 用户名
 * @returns Promise
 */
function dbFindUsername (username) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await UserModel.findOne({
        where: {
          username
        }
      })
      res ? resolve([false, '该用户名已被注册']) : resolve([true, ''])
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * 找到账号密码匹配的用户
 * @param {string} username 用户名
 * @param {string} password 密码
 * @returns Promise
 */
function dbFindUser (username, password) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await UserModel.findOne({
        where: {
          username,
          password
        }
      })
      res ? resolve([true, res]): resolve([false, '账号或密码不正确'])
    } catch (err) {
      reject(err)
    }
  })
}
module.exports = {
  dbFindUsername,
  dbFindUser
}