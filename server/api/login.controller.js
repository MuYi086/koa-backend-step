const UserModel = require('../models/User.model')
const Response = require('../utils/Response')
const { getToken, aesEncrypt, wewevalidator, dbFindUser } = require('../utils/index')
const {
  request,
  summary,
  description, // 接口名称下方的描述信息
  query, // get时参数
  path, // post, put, delete 时地址栏参数
  body, // body中的参数
  tags
} = require('koa-swagger-decorator')

const tag = tags(['User'])
const userLoginBody = {
  username: { type: 'string', required: true, description: '用户名' },
  password: { type: 'string', required: true, description: '密码' }
}
/**
 * 登录控制器
 * @class
 */
class LoginController {
  /**
   * @constructs
   */
  constructor () {
    UserModel.sync().then((res) => {
      console.log(`UserModel 同步成功`, res)
    })
  }
  /**
   * 用户登录
   * @param {Object} data 用户信息对象 
   * @returns Response 包装好的ctx.body
   */
  //  @request('post', '/api/user/login')
  //  @summary('用户登录')
  //  @description('example of login')
  //  @tag
  //  @body(userLoginBody)
  async userLogin ({ params }) {
    // 前后端使用crypto对称加密
    const { username, password } = params
    // 校验账号密码格式是否正确
    const passwordVerifyed = wewevalidator.verify(password, 'password')
    if (!username || !passwordVerifyed[0]) {
      return Response.failed(passwordVerifyed[1])
    } else { // 校验通过
      const passwordEncrypted = aesEncrypt(password)
      const findUserResult = await dbFindUser(username, passwordEncrypted)
      if (findUserResult[0]) { // 找到符合账号密码的用户
        const dataValues = findUserResult[1].dataValues
        return Response.success('登录成功', getToken({id: dataValues.id, username: dataValues.username}))
      } else { // 账号或密码不匹配
        return Response.failed(findUserResult[1])
      }
    }
  }
}
module.exports = LoginController