/**
 * @Author: yanglu
 * @Email: 1258947325@qq.com
 * @Blog: https://github.com/MuYi086/blog
 * @Theme: 对js类型判断
 * @Date: 2017/10/21 14:59
 */
class VarType {
  constructor () {
    this.typeList = ['Null', 'Undefined', 'Object', 'Array', 'ArrayBuffer', 'String', 'Number', 'Boolean', 'Function', 'RegExp', 'Date', 'FormData', 'File', 'Blob', 'URLSearchParams']
    this.init()
  }
  /**
   * 判断变量类型
   * @param {string} value 
   * @returns lowercase string
   */
  type (value) {
    const s = Object.prototype.toString.call(value)
    return s.match(/\[object (.*?)\]/)[1].toLowerCase()
  }
  /**
   * 增加判断类型数据方法
   */
  init () {
    this.typeList.forEach((t) => {
      this['is' + t] = (o) => {
        return this.type(o) === t.toLowerCase()
      }
    })
  }
  /**
   * isBuffer
   * @param {any} val 
   * @returns boolean
   */
  isBuffer (val) {
    return val !== null && !this.isUndefined(val) && val.constructor !== null && !this.isUndefined(val.constructor) && this.isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val)
  }
  /**
   * isStream
   * @param {any} val 
   * @returns boolean
   */
  isStream (val) {
    return this.isObject(val) && this.isFunction(val.pipe)
  }
}

const varType = new VarType()
/**
 * @example 使用 varType["isNull"](null)
 */
module.exports = varType
