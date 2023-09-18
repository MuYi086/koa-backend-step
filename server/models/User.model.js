const { Model, DataTypes } = require('sequelize')
const sequelize = require('../database/db')
// const Role  = require('./Role')

class UserModel extends Model {}
UserModel.init({
  // id
  id: {
    type: DataTypes.INTEGER(50),
    primaryKey: true,
    autoIncrement: true,
    comment: 'id'
  },
  // 用户名唯一
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '用户名唯一'
  },
  // 密码
  password: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '密码'
  },
  // 是否删除
  isdelete: {
    type: DataTypes.BOOLEAN(),
    allowNull: true,
    defaultValue: 0,
    comment: '是否删除'
  },
  // 用户状态:正常,冻结
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '用户状态:正常,冻结'
  },
  // 邮箱
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '邮箱'
  },
  // 手机号
  handphone: {
    type: DataTypes.STRING(60),
    allowNull: true,
    comment: '手机号'
  },
  // 年龄
  age: {
    type: DataTypes.BIGINT(3),
    allowNull: true,
    comment: '年龄'
  },
  // 性别
  sex: {
    type: DataTypes.INTEGER(2),
    allowNull: true,
    comment: '性别'
  },
  // 性别
  headimg: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '性别'
  },
  // 公司
  company: {
    type: DataTypes.STRING(60),
    allowNull: true,
    comment: '公司'
  },
  // 身高:cm
  height: {
    type: DataTypes.INTEGER(3),
    allowNull: true,
    comment: '身高:cm'
  },
  // 体重:kg
  weight: {
    type: DataTypes.INTEGER(3),
    allowNull: true,
    comment: '体重:kg'
  },
  // 职业
  occupation: {
    type: DataTypes.STRING(60),
    allowNull: true,
    comment: '职业'
  },
  // 简介
  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '简介'
  },
}, {
  sequelize,
  tableName: 'user'
  // defaultScope: {
  //   attributes: { exclude: ['password'] }
  // }
})
// 建立关系
// User.hasOne(Role, {
//   foreignKey: 'id',
//   sourceKey: 'roleId'
// })
module.exports = UserModel