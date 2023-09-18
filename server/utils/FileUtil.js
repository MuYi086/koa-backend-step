/**
 * @Author: yanglu
 * @Email: 1258947325@qq.com
 * @Blog: https://github.com/ougege/blog
 * @Theme: 文件上传工具类
 * @Date: 2022/03/06 10:00
 */
const fs = require('fs')
const path = require('path')
// const request = request('request')

const FileUtils = {
  /**
   * 读取文件内容
   * @param {string} fileFullPath 路径
   * @param {string} encode 编码格式
   * @returns Promise
   */
  async readerFile (fileFullPath, encode) {
    return new Promise((resolve, reject) => {
      fs.readFile(fileFullPath, (err, data) => {
        if (err) {
          console.log(`读取文件:${fileFullPath}内容失败,${err}`)
          reject(err)
        } else if (encode) {
          console.log(`读取文件:${fileFullPath}成功!`)
          resolve({code: 200, data: data.toString(encode || 'utf-8')})
        } else {
          resolve({code: 200, data})
        }
      })
    })
  },
  /**
   * 创建文件夹
   * @param {string} filepath 文件路径
   * @returns Promise
   */
  async createDir (filepath) {
    return new Promise((resolve, reject) => {
      fs.mkdir(filepath, (err) => {
        if (err) {
          console.log(`创建文件夹:${filepath}失败!`)
          reject(err)
        } else {
          console.log(`创建文件夹:${filepath}成功!`)
          resolve(`创建文件夹:${filepath}成功!`)
        }
      })
    })
  },

  /**
   * 判断一个文件夹是否存在
   * @param {string} dirpath 路径
   * @param {boolean} isCreateDir 是否不存在就创建
   * @returns Promise
   */
  async isDirExists (dirpath, isCreateDir) {
    return new Promise(async (resolve, reject) => {
      if (!fs.existsSync(dirpath)) { // 文件夹不存在
        if (isCreateDir) {
          const res = await FileUtils.createDir(dirpath)
          if (res) {
            resolve(res)
          } else {
            reject(res)
          }
        } else {
          resolve(false)
        }
      } else { // 文件夹存在
        resolve(true)
      }
    })
  },
  /**
   * 删除文件
   * @param {string} fileFullPath 文件绝对地址
   * @returns Promise
   */
  async deleteFile (fileFullPath) {
    return new Promise((resolve, reject) => {
      fs.unlink(fileFullPath, (err) => { // 上传成功后删除临时文件
        if (err) {
          console.log(`删除文件:${fileFullPath}异常!`)
          reject(err)
        } else {
          console.log(`删除文件:${fileFullPath}成功!`)
          resolve({code: 200, path: fileFullPath})
        }
      })
    })
  }
}
module.exports = FileUtils