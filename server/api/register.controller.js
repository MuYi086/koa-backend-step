const UserModel = require('../models/User.model')
const Response = require('../utils/Response')
const { getToken, aesEncrypt, wewevalidator, dbFindUsername } = require('../utils/index')
const {
  request,
  summary,
  description, // 接口名称下方的描述信息
  body, // body中的参数
  tags
} = require('koa-swagger-decorator')
const tag = tags(['User'])
const userRegisterBody = {
  username: { type: 'string', required: true, description: '用户名' },
  password: { type: 'string', required: true, description: '密码' }
}
/**
 * RegisterController
 * @class
 */
class RegisterController {
  /**
   * @constructs
   */
  constructor () {
    UserModel.sync().then((res) => {
      console.log(`UserModel 同步成功`, res)
    })
  }
  // @request('post', '/api/user/register')
  // @summary('用户注册')
  // @description('example of register')
  // @tag
  // @body(userRegisterBody)
  async userRegister ({params}) {
    const { username, password } = params
    // 校验账号密码格式是否正确
    const passwordVerifyed = wewevalidator.verify(password, 'password')
    if (!username || !passwordVerifyed[0]) {
      return Response.failed(passwordVerifyed[1])
    } else {
      const findNameResult = await dbFindUsername(username)
      if (!findNameResult[0]) { // 找到同名用户
        return Response.failed(findNameResult[1])
      } else { // 注册新用户
        const passwordEncrypted = aesEncrypt(password)
        const res = await UserModel.create({username, password: passwordEncrypted})
        if (res.dataValues && res.dataValues.id) {
          const dataValues = res.dataValues
          return Response.success('注册成功', getToken({id: dataValues.id, username: dataValues.username}))
        } else {
          return Response.failed('注册失败')
        }
      }
    }
  }
}
module.exports = RegisterController