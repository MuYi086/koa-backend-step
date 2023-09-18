const { Model, DataTypes } = require('sequelize')
const { stampToSecond, newTimeStamp, formatDate } = require('../utils/index')
const sequelize = require('../database/db')
class FileModel extends Model {}
FileModel.init({
  // 文件id
  fileid: {
    type: DataTypes.INTEGER(50),
    autoIncrement: true,
    primaryKey: true,
    comment: '文件id'
  },
  // 上传人id
  userid: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '上传人id'
  },
  // 上传人名称
  username: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '上传人名称'
  },
  // 文件大小
  size: {
    type: DataTypes.BIGINT(20),
    allowNull: true,
    comment: '文件大小'
  },
  // 文件类型
  mimetype: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: '文件类型'
  },
  // 文件所属
  filetype: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 2,
    comment: '文件所属:1头像,2文件,默认2'
  },
  // 文件名
  filename: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '文件名'
  },
  // 文件后缀
  suffix: {
    type: DataTypes.STRING(30),
    allowNull: true,
    comment: '文件后缀'
  },
  // 文件存放的路径
  path: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '文件存放的路径'
  },
  // 文件别名
  aliasname: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '文件别名'
  },
  // 备注
  remark: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '备注'
  },
  // 文件hash摘要
  filemd5: {
    type: DataTypes.STRING(40),
    allowNull: true,
    comment: '文件hash摘要'
  },
  // 文件状态
  status: {
    type: DataTypes.INTEGER(2),
    allowNull: true,
    comment: '文件状态'
  },
  // 是否删除: true是 false否
  isdelete: {
    type: DataTypes.BOOLEAN(),
    allowNull: true,
    defaultValue: () => false,
    comment: '是否删除: true是 false否'
  },
  // 创建时间:日期
  createtime: {
    type: DataTypes.STRING(30),
    allowNull: true,
    defaultValue: () => (formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')),
    comment: '创建时间:日期'
  },
  // 创建时间:时间戳
  createtimeStamp: {
    type: DataTypes.DATE(),
    allowNull: true,
    defaultValue: () => (newTimeStamp()),
    comment: '创建时间:时间戳'
  },
  // 修改时间:日期
  updatetime: {
    type: DataTypes.STRING(30),
    allowNull: true,
    defaultValue: () => (formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')),
    comment: '修改时间:日期'
  },
  // 修改时间:时间戳
  updatetimeStamp: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: () => (newTimeStamp()),
    comment: '修改时间:时间戳'
  }
}, {
  sequelize,
  tableName: 'file',
})
module.exports = FileModel