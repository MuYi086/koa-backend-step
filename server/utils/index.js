const url = require('node:url')
const jwt = require('jsonwebtoken')
const Config = require('../config/index')
const wewevalidator = require('wewevalidator')
const UUID = require('uuid')
const { aesEncrypt, aesDecrypt } = require('./CryptoFn')
const { dbFindUsername, dbFindUser } = require('../models/modelFn')
const varType = require('./VarType')
const { isDirExists, deleteFile, readerFile } = require('./FileUtil')
const Sequelize = require('sequelize')
const ipSearch = require('./ip2region')

/**
 * jwt签名
 * @param {Object} payload 提交的formdata对象 
 * @returns 签名后的token
 */
const getToken = (payload = {}) => {
  return jwt.sign(payload, Config.jwtConfig.secret, { expiresIn: '4h' })
}

/**
 * 获取jwt数据
 * @param {string} authorization token
 * @returns user对象
 */
const getJwtData = (authorization) => {
  if (!authorization) return null
  return jwt.verify(authorization, Config.jwtConfig.secret)
}

/**
 * 小于10加0处理
 * @param {number | string} e 字符串或数字
 * @returns 字符串
 */
const addZero = (e) => {
  return Number(e) < 10 ? `0${e}` : `${e}`
}
/**
 * new 一个时间戳:无参返回当前时间戳,有参返回传入时间的时间戳
 * @param {*} dateIn 
 * @returns 
 */
const newTimeStamp = (dateIn) => {
  if (!dateIn) {
    return new Date().getTime()
  } else {
    const newDate = varType.isDate(dateIn) ? dateIn : new Date(dateIn)
    return newDate.getTime()
  }
}
/**
 * 时间戳转秒
 * @param {number} stamp 
 * @returns 时间秒
 */
const stampToSecond = (stamp) => {
  return stamp ? (stamp / 1000) : (newTimeStamp() / 1000)
}
/**
 * 时间格式化
 * @param {Object} dateIn 时间对象
 * @param {string} fmt 时间格式
 * @returns 符合格式的时间字符串
 */
const formatDate = (dateIn, fmt) => {
  if (!fmt) return false
  if (varType.isString(dateIn)) {
    dateIn = dateIn.replace(/\./g, '/')
    dateIn = dateIn.replace(/-/g, '/')
  }
  const newDate = varType.isDate(dateIn) ? dateIn : new Date(dateIn)
  const o = {
    'y+': newDate.getFullYear(), // 年份
    'M+': addZero(newDate.getMonth() + 1), // 月份
    'd+': addZero(newDate.getDate()), // 某一天
    'h+': addZero(newDate.getHours()), // 小时
    'm+': addZero(newDate.getMinutes()), // 分钟
    's+': addZero(newDate.getSeconds()) // 秒
  }
  for (const i in o) {
    if (new RegExp('(' + i + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, o[i])
    }
  }
  return fmt
}

/**
 * 随机生成UUID
 * @param {string} type v1是基于时间戳生成，保证唯一性;v4是随机生成
 * @param {boolean} isLowerCase 是否小写
 * @returns UUID
 */
const getRandomUUID = (type = 'v1', isLowerCase = false) => {
  const str = type === 'v1' ? UUID.v1() : UUID.v4()
  return isLowerCase ? str : str.toUpperCase()
}

/**
 * 文件重命名：随机生成新名称
 * @param {string} nameSuffix 后缀名
 * @param {boolean} isLowerCase 是否小写
 * @returns 文件新名称
 */
const getFileNameUUID32 = (nameSuffix, isLowerCase = false) => {
  return `web_pc_${getRandomUUID(isLowerCase, 'v4')}.${nameSuffix}`
}

/**
 * 获取文件后缀名
 * @param {string} name 名称
 * @returns 后缀名
 */
const getSuffix = (name) => {
  if (!name) return false
  const arr = name.split('.')
  const len = arr.length
  return arr[len - 1]
}
/**
 * path路径处理resolve后的双斜杠
 * @param {string} pathStr 路径
 * @returns 单斜杠路径
 */
const pathDoubleSlashDeal = (pathStr) => {
  if (!pathStr) return null
  return pathStr.replace(/\\/g, '/')
}
/**
 * 追加属性到queryData
 * @param {array} array queryData属性数组
 * @param {Object} params request.body传入的对象 
 * @returns queryData
 */
const addAttrToQueryData = (array, params) => {
  const queryData = {}
  if (!varType['isArray'](array)) return queryData
  for (let i = 0; i < array.length; i++) {
    const attr = array[i]
    const value = params[attr]
    if (varType['isUndefined'](value) || value === '') {
      continue
    }
    queryData[attr] = value
  }
  return queryData
}
/**
 * 上移下移功能函数
 * @param {*} Model
 * @param {*} sortAttr 表字段
 * @param {*} attrVal 值
 * @param {*} direction 方向: down 下移; up 上移
 * @param {*} limit 限制: 2
 * @returns 查询结果
 */
const modelMove = async (Model, sortAttr, attrVal, direction, limit = 2) => {
  const { Op } = Sequelize
  const where = {}
  let order = []
  if (direction === 'down') {
    where[sortAttr] = { [Op.gte]: attrVal }
    order = [sortAttr, 'ASC']
  }
  if (direction === 'up') {
    where[sortAttr] = { [Op.lte]: attrVal }
    order = [sortAttr, 'DESC']
  }
  const queryData = {
    where,
    order: [order],
    limit
  }
  return await Model.findAll(queryData)
}
/**
 * 浅拷贝
 * @param {Object} obj 
 * @returns 浅拷贝对象
 */
const shallowCopy = (obj) => {
  if (obj === null) {
    return null
  } else {
    return Object.create(
      Object.getPrototypeOf(obj),
      Object.getOwnPropertyDescriptors(obj)
    )
  }
}
/**
 * 深拷贝
 * @param {*} obj 
 * @param {*} clone 
 * @returns 深拷贝对象
 */
const deepCopy = (obj, clone = Array.isArray(obj) ? [] : {}) => {
  if (obj != null && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      clone[key] = deepCopy(value)
    }
  } else {
    clone = obj
  }
  return clone
}
/**
 * 数据库记录转数组
 * @param {Object} data 
 * @returns Array
 */
const recordsToArray = (data) => {
  return Object.keys(data).map(idx => { return data[idx].dataValues })
}
/**
 * 数据库查询结果数组分类
 * @param {Object} a 
 * @param {Object} b 
 * @param {string} attr 
 * @returns 属性数组和值数组
 */
const changeTowRecords = (a, b, attr) => {
  const aAttrVal = a[attr]
  const bAttrVal = b[attr]
  // 构造属性数组
  const attrArr = [aAttrVal, bAttrVal]
  // 删除属性,交换位置
  delete a[attr]
  delete b[attr]
  const dataArr = [b, a]
  return { attrArr, dataArr }
}
/**
 * 从request中构造url：方便Url模块取出get方法的参数
 * @param {Object} request 
 * @returns params
 */
const constructGetUrlFromCtx = (request) => {
  const link = request.url && request.url.split('?')[1]
  const urLSearchParams = new URLSearchParams(link)
  const params = Object.fromEntries(urLSearchParams.entries())
  return params
}
/**
 * 处理ctx,根据get或post生成对应的redisKey
 * @param {Object} ctx 上下文对象 
 * @param {string} type 自定义查询对象做参数,比如login接口是不适合把密码暴露的 
 * @returns redisKey
 */
const dealRedisKeyByRequestMethod = (ctx, type) => {
  let key = ''
  const method = ctx.request.method.toUpperCase()
  if (method === 'GET') {
    key = renderRedisKeyByPathnameAndSearch(ctx.request.url)
  }
  if (method === 'POST') {
    const link = url.format({
      query: ctx.request.body
    })
    key = renderRedisKeyByPathnameAndSearch(ctx.request.url, link)
  }
  // 自定义查询对象做参数,比如login接口是不适合把密码暴露的
  if (type) {
    key = interfaceModifyRedisLink(ctx, type)
  }
  return key
}
const interfaceModifyRedisLink = (ctx, type) => {
  let key = ''
  switch (type) {
    case 'user/login':
      const { username } = ctx.request.body
      const link = url.format({
        query: { username }
      })
      key = renderRedisKeyByPathnameAndSearch(ctx.request.url, link)
      break
    default:
      break
  }
  return key
}
const renderRedisKeyByPathnameAndSearch = (pathname, search) => {
  return search ? `${pathname}${search}` : pathname
}

module.exports = {
  getToken,
  getJwtData,
  aesEncrypt,
  aesDecrypt,
  wewevalidator,
  dbFindUsername,
  dbFindUser,
  type,
  isDirExists,
  deleteFile,
  readerFile,
  addZero,
  stampToSecond,
  newTimeStamp,
  formatDate,
  getRandomUUID,
  getFileNameUUID32,
  getSuffix,
  pathDoubleSlashDeal,
  addAttrToQueryData,
  modelMove,
  shallowCopy,
  deepCopy,
  recordsToArray,
  changeTowRecords,
  constructGetUrlFromCtx,
  dealRedisKeyByRequestMethod,
  renderRedisKeyByPathnameAndSearch,
  ipSearch
}