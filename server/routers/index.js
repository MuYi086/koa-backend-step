const Router = require('koa-router')
const url = require('node:url')
const Config = require('../config/index')
const router = new Router({ prefix: Config.apiPrefix })
const UserController = require('../api/user.controller')
const userController = new UserController()
const RegisterController = require('../api/register.controller')
const registerController = new RegisterController()
const LoginController = require('../api/login.controller')
const loginController = new LoginController()
const FileController = require('../api/file.controller')
const fileController = new FileController()
const { getJwtData, constructGetUrlFromCtx, dealRedisKeyByRequestMethod, renderRedisKeyByPathnameAndSearch } = require('../utils/index')
const { redisGet, redisSet, redisDel } = require('../utils/Redis')
const Response = require('../utils/Response')
/**
 * jwt 鉴权
 * @param {Object} ctx 上下文对象
 * @param {Object} next 函数对象
 */
const auth = async (ctx, next) => {
  const { authorization } = ctx.request.header
  const token = authorization.replace('Bearer ', '')
  try {
    const user = getJwtData(token)
    ctx.state.user = user
  } catch (err) {
    ctx.throw(401, err.message)
  }
  await next()
}
/**
 * 获取redis的缓存
 * @param {*} ctx 上下文对象
 * @param {*} next next函数
 */
const cache = async (ctx, next) => {
  // 因为jwt是无状态的,服务端验证方式只能是token到期
  // 换个思路, 退出登录接口可以作用到redis,每次查询前判断redis的token是否还存在
  const pathname = `${Config.apiPrefix}user/login`
  const search = url.format({
    query: { username: ctx.state.user.username }
  })
  const userLoginRedisKey = renderRedisKeyByPathnameAndSearch(pathname, search)
  const tokenValue = await redisGet(userLoginRedisKey)
  if (!tokenValue) {
    ctx.body = Response.authorities()
  } else {
    // 将路径和参数打包合并作为key,response作为value
    const key = dealRedisKeyByRequestMethod(ctx)
    const value = await redisGet(key)
    if (value) {
      ctx.body = value
    } else {
      ctx.state.redisKey = key
      await next()
    }
  }
}

router.get('/', ctx => {
  console.log('-------------------------我进来了----------------------')
  ctx.body = 'hello world'
})
// 注册
router.post('user/register', async (ctx) => {
  ctx.body = await registerController.userRegister({ params: ctx.request.body })
})
// 登录
router.post('user/login', async (ctx) => {
  const redisKey = dealRedisKeyByRequestMethod(ctx, 'user/login')
  const reqRes = await loginController.userLogin({ params: ctx.request.body })
  redisSet(redisKey, reqRes)
  ctx.body = reqRes
})
// 获取用户详情
router.get('user/getUserDetail', auth, cache, async (ctx) => {
  const params = constructGetUrlFromCtx(ctx.request)
  ctx.body = await userController.getUserDetail({ params: params })
})
// 用户删除
router.post('user/delete', auth, async (ctx) => {
  ctx.body = await userController.userDelete({ params: ctx.request.body })
})
// 用户更新
router.post('user/update', auth, async (ctx) => {
  ctx.body = await userController.userUpdate({ state: ctx.state, params: ctx.request.body })
})
// 用户修改密码(已登录)
router.post('user/modifyPassword', auth, async (ctx) => {
  ctx.body = await userController.userModifyPassword({ state: ctx.state, params: ctx.request.body })
})
// 用户下移
router.post('user/moveDown', auth, async (ctx) => {
  ctx.body = await userController.moveDown({ state: ctx.state, params: ctx.request.body })
})
// 用户上移
router.post('user/moveUp', auth, cache, async (ctx) => {
  const redisKey = ctx.state.redisKey
  const reqRes = await userController.moveUp({ state: ctx.state, params: ctx.request.body })
  redisSet(redisKey, reqRes)
  ctx.body = reqRes
})
// 用户置顶
router.post('user/moveTop', auth, async (ctx) => {
  ctx.body = await userController.moveTop({ state: ctx.state, params: ctx.request.body })
})
// 文件-上传
router.post('file/upload', auth, async (ctx) => {
  ctx.body = await fileController.uploadFile({ state: ctx.state, params: { files: ctx.request.files, filetype: ctx.request.body.filetype } })
})
// 文件-批量上传
router.post('file/uploads', auth, async (ctx) => {
  ctx.body = await fileController.uploadFiles({ state: ctx.state, params: { files: ctx.request.files, filetype: ctx.request.body.filetype } })
})
// 文件-获取文件详情
router.get('file/getFileDetail', auth, cache, async (ctx) => {
  const redisKey = ctx.state.redisKey
  const params = constructGetUrlFromCtx(ctx.request)
  const reqRes = await fileController.getFileDetail({ state: ctx.state, params: params })
  redisSet(redisKey, reqRes)
  ctx.body = reqRes
})
// 文件-获取文件列表
router.get('file/getFileList', auth, cache, async (ctx) => {
  const redisKey = ctx.state.redisKey
  const params = constructGetUrlFromCtx(ctx.request)
  const reqRes = await fileController.getFileList({ state: ctx.state, params: params })
  redisSet(redisKey, reqRes)
  ctx.body = reqRes
})
// 文件-删除
router.post('file/delete', auth, async (ctx) => {
  ctx.body = await fileController.deleteFiles({ state: ctx.state, params: ctx.request.body })
})
module.exports = router