/**
 * @Author: yanglu
 * @Email: 1258947325@qq.com
 * @Blog: https://github.com/ougege/blog
 * @Theme: 自定义response对象
 * @Date: 2020/04/06 17:35
 */
module.exports = {
  /**
   * 状态码 获取表示
   * 变更时获取表示（缓存）
   * 200（OK） - 表示成功响应
   * 204（无内容） - 资源有空表示
   * 301（Moved Permanently） - 资源的URI已被更新
   * 303（See Other） - 其他（如，负载均衡）
   * 304（not modified）- 资源未更改（缓存）
   * 400 （bad request）- 指代坏请求（如，参数错误）
   * 404 （not found）- 资源不存在
   * 406 （not acceptable）- 服务端不支持所需表示
   * 500 （internal server error）- 通用错误响应
   * 503 （Service Unavailable）- 服务端当前无法处理请求
   */
  CODE: {
    SUCCESS: 200, // 表示成功响应
    OTHER: 204, // (无内容)
    FAILED: 400, // 操作失败(一般参数错误)
    AUTHORITIES: 401, // 未授权
    NO_AUTHORITY: 403, // 无权限
    SERVER_ERROR: 500 // 通用服务器内部错误响应
  },
  /**
   * 返回提示
   */
  MESSAGE: {
    SUCCESS: `成功!`,
    FAILED: `操作失败!`,
    PARAMS_LACK: `参数不齐!`,
    AUTHORITIES: `登陆失效或身份过期!`, //身份验证失败
    NO_AUTHORITY: `无权访问!`, //无权限
    SERVER_ERROR: `服务器内容错误!`
  },
  /**
   * response返回成功对象
   * @param {string} msg 提示
   * @param {Object} data 数据对象
   * @returns 构造的ctx.body对象
   */
  success (msg, data) {
    return {
      code: this.CODE.SUCCESS,
      data,
      msg: msg || this.MESSAGE.SUCCESS
    }
  },
  /**
   * response返回失败对象
   * @param {string} msg 提示
   * @param {number} code 状态码
   * @param {Object} data 数据对象
   * @returns 构造的ctx.body对象
   */
  failed (msg, code, data) {
    return {
      data,
      msg: msg || this.MESSAGE.FAILED,
      code: code || this.CODE.FAILED
    }
  },
  /**
   * 参数不齐对象
   * @param {string} msg 提示
   * @param {number} code 状态码
   * @param {Object} data 数据对象
   * @returns 构造的ctx.body对象
   */
  paramsLack (msg, code, data) {
    return {
      code: code || this.CODE.FAILED,
      data,
      msg: msg || this.MESSAGE.PARAMS_LACK
    }
  },
  /**
   * 身份过期
   * @param {string} msg 提示
   * @param {number} code 状态码
   * @param {Object} data 数据对象
   * @returns 构造的ctx.body对象
   */
  authorities (msg, code, data) {
    return {
      code: code || this.CODE.AUTHORITIES,
      data,
      msg: msg || this.MESSAGE.AUTHORITIES
    }
  },
  /**
   * 无权访问
   * @param {string} msg 提示
   * @param {number} code 状态码
   * @param {Object} data 数据对象
   * @returns 构造的ctx.body对象
   */
  noAuthority (msg, code, data) {
    return {
      data,
      code: code || this.CODE.NO_AUTHORITY,
      msg: msg || this.MESSAGE.NO_AUTHORITY
    }
  },
  /**
   * 服务器内部错误
   * @param {string} msg 提示
   * @param {number} code 状态码
   * @param {Object} err 错误对象
   * @returns 构造的ctx.body对象
   */
  serverError (msg, code, err) {
    return {
      msg: msg || this.MESSAGE.SERVER_ERROR,
      code: code || this.CODE.SERVER_ERROR,
      error: err || '-'
    }
  },
  /**
   * 带分页的数据对象
   * @param {string} msg 提示
   * @param {number} code 状态码
   * @param {Object} data 数据
   * @param {number} total 总数
   * @param {number} page 页码
   * @param {number} limit 每页限制
   * @returns 构造的ctx.body对象
   */
  pageData (msg, code, data, total, page, limit) {
    return {
      msg: msg || this.MESSAGE.SUCCESS,
      code: code || this.CODE.SUCCESS,
      data,
      total,
      page,
      limit
    }
  },
  /**
   * 代码分页(非数据库分页)
   * @param {string} msg 提示
   * @param {number} code 状态码
   * @param {Object} data 数据
   * @param {number} page 页码
   * @param {number} limit 每页限制
   * @returns 构造的ctx.body对象
   */
  totalPageData (msg, code, data, page, limit) {
    let result = {
      msg: msg || this.MESSAGE.SUCCESS,
      code: code || this.CODE.SUCCESS,
      data: [],
      limit,
      page,
      total: 0
    }
    if (data && limit && page) {
      if (data && data.length > 0) {
        // 索引
        const index = (page - 1) * limit
        for (let i = index; i < page * limit; i++) {
          if (data[i]) {
            result.data.push(data[i])
          }
        }
      }
      // 总大小
      result.total = data.length
    } else {
      result.data = data
    }
    return result
  }
}