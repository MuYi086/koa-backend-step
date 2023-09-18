const path = require('path')
const crypto = require('crypto')
const fs = require('fs')
const Config = require('../config/index')
const FileModel = require('../models/File.model')
const Response = require('../utils/Response')
const { Op } = require('sequelize')
const {
  isDirExists,
  deleteFile,
  type,
  formatDate,
  getFileNameUUID32,
  getSuffix,
  pathDoubleSlashDeal
} = require('../utils/index')
const {
  request,
  summary,
  description, // 接口名称下方的描述信息
  query,
  body, // body中的参数
  tags
} = require('koa-swagger-decorator')
const tag = tags(['File'])
const uploadFileBody = {
  file: { type: 'file', required: true, description: '文件' },
  filetype: { type: 'number', required: false, description: '文件所属' }
}
const getFileDetailBody = {
  fileid: { type: 'string', required: true, description: '文件id' }
}
const getFileListBody = {
  keyword: { type: 'string', required: false, description: '关键词' },
  isdelete: { type: 'number', required: false, description: '是否删除', default: Config.queryConfig.isdelete },
  page: { type: 'number', required: false, description: '页码', default: Config.queryConfig.page },
  limit: { type: 'number', required: false, description: '每页数据', default: Config.queryConfig.limit }
}
const deleteFileListBody = {
  fileid: { type: 'string', required: true, description: '文件id,逗号分割' },
  isdelete: { type: 'number', required: false, description: '是否删除', default: Config.queryConfig.isdelete }
}

/**
 * 文件控制器
 * @class
 */
class FileController {
  /**
   * @constructs
   */
  constructor () {
    FileModel.sync().then((res) => {
      console.log(`FileModel 同步成功`, res)
    })
  }
  /**
   * 文件上传接口(单文件)
   * @param {Object} state 状态对象
   * @param {Object} files 文件对象
   * @returns Response 包装好的ctx.body
   */
  // @request('post', '/api/file/upload')
  // @summary('文件上传-单个')
  // @description('example of file upload single')
  // @tag
  // @body(uploadFileBody)
  async uploadFile ({ state, params }) {
    const { files, filetype } = params
    const file = files.file
    if (!file) {
      return Response.failed('未发现上传文件')
    } else {
      try {
        // 只能上传单文件,需要删除临时文件
        const fileIsArray = type['isArray'](file)
        // 单位是M
        const isFileSizeOver = file.size / 1024 / 1024 > Config.queryConfig.fileSingleMaxSize
        // 检查是否满足上传条件
        if (fileIsArray || isFileSizeOver) {
          if (fileIsArray) {
            file.forEach(file => {
              deleteFile(file.path)
            })
            return Response.failed('只能上传单文件!')
          }
          if (isFileSizeOver) {
            return Response.failed(`上传文件不能超过${Config.queryConfig.fileSingleMaxSize}M!`)
          }
        } else { // 上传流程
          // 格式化时间
          const time = formatDate(new Date(), 'yyyy-MM-dd')
          // 文件上传路径
          let uploadPath = path.join(Config.staticPath, `/uploads/`, time.replace(/-/g, ''))
          // 判断文件夹是否存在,不存在就创建
          const existSync = await isDirExists(uploadPath, true)
          if (existSync) {
            const data = await filePromise(file, uploadPath, { user: state.user, filetype })
            data.path = pathDoubleSlashDeal(data.path)
            // 保存文件到数据库
            await FileModel.create(data)
            return Response.success('上传成功!', data)
          } else {
            return Response.failed('文件上传异常')
          }
        }
      } catch (err) {
        console.log(err)
        return Response.failed('上传文件出错!')
      }
    }
  }
  // @request('post', '/api/file/uploads')
  // @summary('文件上传-批量')
  // @description('example of file upload multi')
  // @tag
  // @body(uploadFileBody)
  async uploadFiles ({ state, params }) {
    const { files, filetype } = params
    const file = files.file
    if (!file) {
      return Response.failed('未发现上传文件')
    } else {
      const fileList = type['isArray'](file) ? file : [file]
      try {
        const maxSize = fileList.map(item => item.size).reduce((a, b) => (a + b), 0)
        if (maxSize / 1024 / 1024 > Config.queryConfig.fileMultiMaxSize) {
          fileList.forEach((file) => {
            deleteFile(file.path)
          })
          return Response.failed(`批量上传文件总大小不能超过${Config.queryConfig.fileMultiMaxSize}M!`)
        }
        // 格式化时间
        const time = formatDate(new Date(), 'yyyy-MM-dd')
        // 文件上传路径
        let uploadPath = path.join(Config.staticPath, `/uploads/`, time.replace(/-/g, ''))
        // 判断文件夹是否存在,不存在就创建
        const existSync = await isDirExists(uploadPath, true)
        if (existSync) {
          // 多文件上传
          const saveFiles = await Promise.all(fileList.map((file) => {
            return filePromise(file, uploadPath, { user: state.user, filetype }).then(data => {
              data.path = pathDoubleSlashDeal(data.path)
              return data
            })
          }))
          // 保存到数据库
          await FileModel.bulkCreate(saveFiles)
          return Response.success(null, saveFiles)
        } else {
          return Response.failed('文件上传异常')
        }
      } catch (err) {
        console.log(err)
        return Response.failed('上传文件出错!')
      }
    }
  }
  // @request('post', '/api/file/delete')
  // @summary('文件删除-数组')
  // @description('example of file delete multi')
  // @tag
  // @body(deleteFileListBody)
  async deleteFiles ({ state, params }) {
    const ids = params.ids ? params.ids.split(',') : []
    if (ids.length === 0) return Response.paramsLack()
    try {
      // const { id, username } = state.user
      const queryParams = {
        where: {
          // userid: id,
          fileid: { [Op.in] : ids},
          isdelete: Config.queryConfig.isdelete
        }
      }
      // 查询相关文件
      const files = await FileModel.findAll(queryParams)
      if (files && files.length) {
        // 这里设置为软删除,只有超管才能真正删除(后续增加)
        const deleteFiles = files.map((file) => {
          return new Promise(async(resolve, reject) => {
            try {
              // 上传临时文件
              const res = await deleteFile(path.join(Config.staticPath, file.path))
              if (res && res.code === 200) {
                await FileModel.destroy({ where: { fileid: file.fileid } })
                resolve(file)
              } else {
                reject(res)
              }
            } catch (error) {
              reject(error)
            }
          })
        })
        // 利用Promise.all批量处理删除
        const delData = await Promise.all(deleteFiles)
        // 提示
        return Response.success(null, delData)
      }
    } catch (err) {
      console.log(err)
    }
  }
  // @request('get', '/api/file/getFileDetail')
  // @summary('获取文件详情')
  // @description('example of get file detail')
  // @tag
  // @query(getFileDetailBody)
  async getFileDetail ({ params }) {
    const { fileId } = params
    if (!fileId) return Response.paramsLack()
    try {
      const file = await FileModel.findOne({
        where: { fileid: fileId, isdelete: false },
        attributes: ['fileid', 'path', 'filename']
      })
      return Response.success(null, file)
    } catch (err) {
      console.log(err)
      return Response.failed(err)
    }
  }
  // @request('get', '/api/file/getFileList')
  // @summary('获取文件列表')
  // @description('example of get file list')
  // @tag
  // @query(getFileListBody)
  async getFileList ({ state, params }) {
    const { keyword, isdelete, page, limit } = params
    let queryData = {
      where: { isdelete: isdelete || Config.queryConfig.isdelete },
      order: [
        ['createtime', 'DESC']
      ],
      limit: limit || Config.queryConfig.limit
    }
    // 追加关键词
    if (keyword) {
      queryData.where['filename'] = {
        [Op.like]: `%${keyword}%`
      }
    }
    // 分页
    if (page && limit) {
      queryData.offset = Number((page - 1) * limit) // 数据索引开始
      queryData.limit = Number(limit) // 每页限制返回的数据条数
    }
    try {
      const { rows, count } = await FileModel.findAndCountAll(queryData)
      return Response.success(null, { list: rows, total: count })
    } catch (err) {
      console.log(err)
      return Response.failed(err)
    }
  }
}
/**
 * 异步上传文件
 * @param {Object} file 文件对象
 * @param {string} uploadPath 上传路径
 * @param {Object} user {id, username} 用户id, 用户名
 * @returns Promise 返回一个promise
 */
const filePromise = async (file, uploadPath, { user, filetype }) => {
  const { id, username } = user
  return new Promise ((resolve, reject) => {
    // 创建文件摘要hash
    const md5sum = crypto.createHash('md5')
    const { originalFilename, size, mimetype } = file
    // 创建数据库存储数据
    const data = {
      userid: id, // 上传者id
      username: username, // 上传者名称
      size, // 文件大小
      mimetype, // 文件类型
      filetype, // 文件所属
      filename: originalFilename, // 源文件名
      suffix: getSuffix(originalFilename), // 获取后缀名
      path: null, // 文件路径
      aliasname: null, // 文件别名
      remark: null // 源文件路径
    }
    try {
      console.log(`正在上传${originalFilename}`)
      // 创建可读文件流
      const reader = fs.createReadStream(file.filepath)
      // 重命名
      const fileName = getFileNameUUID32(data.suffix)
      // 路径合并+时间+文件名
      const fileConcatPath = path.join(uploadPath, fileName)
      // 完整路径
      data.path = fileConcatPath.split('public')[1]
      data.aliasname = fileName
      // 写入文件
      reader.pipe(fs.createWriteStream(fileConcatPath))
      // 读取文件流
      reader.on('data', (chunk) => { md5sum.update(chunk) })
      reader.on('end', () => {
        data.filemd5 = md5sum.digest('hex').toUpperCase()
        console.log(`fileMD5:`, data.filemd5)
        // 关闭文件
        reader.close()
        // 上传成功后删除文件
        deleteFile(file.filepath)
        console.log(`文件:${originalFilename} 上传成功!`)
        resolve(data)
      })
      reader.on('error', (err) => { reject(err) })
    } catch (err) {
      console.log(err)
      reject(err)
    }
  })
}
module.exports = FileController