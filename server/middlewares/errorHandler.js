/**
 * 错误处理
 * @param {Object} ctx 上下文对象
 * @param {Object} next 函数对象
 * @returns Promise
 */
module.exports = (ctx, next) => {
  return next().catch((err) => {
    if (err.status === 401) {
      ctx.status = 401
      ctx.body = {
        code: 401,
        msg: err.originalError ? err.originalError.message : err.message,
        data: []
      }
    } else {
      throw err
    }
  })
}