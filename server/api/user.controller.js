const UserModel = require('../models/User.model')
const Response = require('../utils/Response')
// const Role = require('../models/Role')
const {
  wewevalidator,
  addAttrToQueryData,
  aesEncrypt,
  modelMove,
  deepCopy,
  recordsToArray,
  changeTowRecords
} = require('../utils/index')
const {
  request,
  summary,
  description, // 接口名称下方的描述信息
  query, // get时参数
  body, // body中的参数
  tags
} = require('koa-swagger-decorator')

const tag = tags(['User'])
const userDetailQuery = {
  id: { type: 'string', required: true, description: '用户id' }
}
const userDeleteBody = {
  username: { type: 'string', required: true, description: '用户名' }
}
const userUpdateBody = {
  username: { type: 'string', required: false, description: '用户名' },
  isdelete: { type: 'boolean', required: false, description: '是否删除' },
  status: { type: 'number', required: false, description: '用户状态:默认1' },
  email: { type: 'string', required: false, description: '邮箱' },
  handphone: { type: 'number', required: false, description: '手机' },
  age: { type: 'number', required: false, description: '年龄' },
  sex: { type: 'number', required: false, description: '性别:1男2女' },
  headimg: { type: 'string', required: false, description: '头像' },
  company: { type: 'string', required: false, description: '公司' },
  height: { type: 'number', required: false, description: '身高' },
  weight: { type: 'number', required: false, description: '体重' },
  occupation: { type: 'string', required: false, description: '职业' },
  description: { type: 'string', required: false, description: '描述' },
}
const userModifyPasswordBody = {
  oldPassword: { type: 'string', required: true, description: '旧密码' },
  newPassword: { type: 'string', required: true, description: '新密码' },
  newPassword2: { type: 'string', required: true, description: '确认密码' }
}
const userMoveDownBody = {
  userId: { type: 'number', required: true, description: '用户id' }
}
/**
 * 用户控制器
 * @class
 */
class UserController {
  /**
   * @constructs
   */
  constructor () {
    UserModel.sync().then((res) => {
      console.log(`UserModel 同步成功`, res)
    })
  }
  // static async getUser (ctx) {
  //   const res = await UserModel.findAll({
  //     where: {
  //       status: 1
  //     }
  //     // user表已经没有status这个字段了
  //     // include: {
  //     //   model: Role
  //     // }
  //   })
  // }
  /**
   * 获取用户详情
   * @param {Object} data 用户信息对象 
   * @returns Response 包装好的ctx.body
   */
  // @request('get', '/api/user/getUserDetail')
  // @summary('获取用户详情')
  // @description('example of get userDetail')
  // @tag
  // @query(userDetailQuery)
  async getUserDetail ({ params }) {
    const { id } = params
    const res = await UserModel.findOne({
      where: {
        id
      },
      attributes: { exclude: ['password'] }
    })
    if (res) {
      return Response.success('查询成功', res.dataValues)
    } else {
      return Response.failed('查询失败')
    }
  }
  /**
   * 用户删除
   * @param {Object} data 
   * @returns Response 包装好的ctx.body
   */
  //  @request('post', '/api/user/delete')
  //  @summary('删除用户')
  //  @description('example of delete user')
  //  @tag
  //  @body(userDeleteBody)
  async userDelete ({params}) {
    const { username } = params
    const res = await UserModel.destroy({
      where: {
        username: username
      },
      attributes: { exclude: ['password'] }
    })
    if (res) {
      return Response.success('查询成功', res)
    } else {
      return Response.failed('查询失败')
    }
  }
  /**
   * 用户更新
   * @param {Object} params 
   * @returns Response 包装好的ctx.body
   */
  //  @request('post', '/api/user/update')
  //  @summary('更新用户')
  //  @description('example of update user')
  //  @tag
  //  @body(userUpdateBody)
  async userUpdate ({state, params}) {
    const queryDataAttrArray = ['username', 'isdelete', 'status', 'email', 'handphone', 'age', 'sex', 'headimg', 'company', 'height', 'weight', 'occupation', 'description']
    // 追加属性到queryData
    const { user } = state
    const queryData = Object.assign({id: user.id}, addAttrToQueryData(queryDataAttrArray, params))
    console.log(queryData, '-------------------------queryData----------------------')
    // 判断token解出的用户信息和要修改的用户是否一致
    const res = await UserModel.update(queryData, {
      where: {
        id: user.id
      },
      attributes: { exclude: ['password'] }
    })
    if (res) {
      return Response.success('查询成功', res)
    } else {
      return Response.failed('查询失败')
    }
  }
  // @request('post', '/api/user/modifyPassword')
  // @summary('修改用户密码')
  // @description('example of modify user password')
  // @tag
  // @body(userModifyPasswordBody)
  async userModifyPassword ({state, params}) {
    const { id } = state.user
    const { oldPassword, newPassword, newPassword2 } = params
    if (oldPassword && newPassword && newPassword2) {
      if (newPassword !== newPassword2) {
        return Response.failed('确认密码与新密码不一致')
      } else {
        // 校验新密码是否符合规则: 不校验旧密码规则是因为可能系统老数据,符合旧的规则
        const passwordVerifyed = wewevalidator.verify(newPassword, 'password')
        if (!passwordVerifyed[0]) return Response.failed(passwordVerifyed[1])
        // 查询数据库,旧密码和id是否符合
        const passwordEncrypted = aesEncrypt(oldPassword)
        const res = await UserModel.findOne({
          where: { id }
        })
        // 如何旧密码和数据库不一致
        if (passwordEncrypted !== res.password) return Response.failed('旧密码不正确')
        const newPasswordEncrypted = aesEncrypt(newPassword)
        const updateUserRes = await UserModel.update({password: newPasswordEncrypted}, {
          where: { id }
        })
        if (updateUserRes) {
          return Response.success('查询成功', updateUserRes)
        } else {
          return Response.failed('查询失败')
        }
      }
    } else {
      return Response.paramsLack()
    }
  }
  // @request('post', '/api/user/moveDown')
  // @summary('用户下移')
  // @description('example of moveDown user')
  // @tag
  // @body(userMoveDownBody)
  async moveDown ({state, params}) {
    const { userId } = params
    if (!userId) return Response.failed('userId不能为空')
    const res = await modelMove(UserModel, 'id', userId, 'down', 2)
    // 将sql查询结果转义成数组
    const dataList = recordsToArray(res)
    const { attrArr, dataArr } = changeTowRecords(dataList[0], dataList[1], 'id')
    // 遍历数组,将对应信息update
    const taskArr = attrArr.map((attr, index) => {
      return new Promise(async (resolve, reject) => {
        const updateRes = await UserModel.update(dataArr[index], {
          where: {
            id: attr
          }
        })
        if (updateRes) {
          resolve(updateRes)
        } else {
          reject(updateRes)
        }
      })
    })
    const taskRes = Promise.all(taskArr)
    if (taskRes) {
      return Response.success(null, taskRes)
    } else {
      return Response.failed('操作失败!')
    }
  }
  // @request('post', '/api/user/moveUp')
  // @summary('用户上移')
  // @description('example of moveUp user')
  // @tag
  // @body(userMoveDownBody)
  async moveUp ({state, params}) {
    const { userId } = params
    if (!userId) return Response.failed('userId不能为空')
    const res = await modelMove(UserModel, 'id', userId, 'up', 2)
    // 将sql查询结果转义成数组
    const dataList = recordsToArray(res)
    const { attrArr, dataArr } = changeTowRecords(dataList[0], dataList[1], 'id')
    // 遍历数组,将对应信息update
    const taskArr = attrArr.map((attr, index) => {
      return new Promise(async (resolve, reject) => {
        const updateRes = await UserModel.update(dataArr[index], {
          where: {
            id: attr
          }
        })
        if (updateRes) {
          resolve(updateRes)
        } else {
          reject(updateRes)
        }
      })
    })
    const taskRes = Promise.all(taskArr)
    if (taskRes) {
      return Response.success(null, taskRes)
    } else {
      return Response.failed('操作失败!')
    }
  }
  // @request('post', '/api/user/moveTop')
  // @summary('用户置顶')
  // @description('example of moveTop user')
  // @tag
  // @body(userMoveDownBody)
  async moveTop ({state, params}) {
    const { userId } = params
    if (!userId) return Response.failed('userId不能为空')
    const currentRecord = await UserModel.findAll({
      where: {
        id: userId
      }
    })
    const topRecord = await modelMove(UserModel, 'id', 0, 'down', 1)
    const dataList = [...recordsToArray(currentRecord), ...recordsToArray(topRecord)]
    const { attrArr, dataArr } = changeTowRecords(dataList[0], dataList[1], 'id')
    // 遍历数组,将对应信息update
    const taskArr = attrArr.map((attr, index) => {
      return new Promise(async (resolve, reject) => {
        const updateRes = await UserModel.update(dataArr[index], {
          where: {
            id: attr
          }
        })
        if (updateRes) {
          resolve(updateRes)
        } else {
          reject(updateRes)
        }
      })
    })
    const taskRes = Promise.all(taskArr)
    if (taskRes) {
      return Response.success(null, taskRes)
    } else {
      return Response.failed('操作失败!')
    }
  }
}
module.exports = UserController