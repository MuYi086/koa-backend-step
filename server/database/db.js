const Sequelize = require('sequelize')
const {
  dbName,
  host,
  port,
  user,
  password
} = require('../config/index').database
console.log('init sequelize...')
// 数据库连接实例
const sequelize = new Sequelize(dbName, user, password, {
  host,
  port,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  define: {
    timestamps: false,
    freezeTableName: true, // 默认情况下，表名会转换为复数形式
    paranoid: true, // 将会更新deleteAt字段,并不会真实删除数据
    underscored: true
  }
})

// 测试是否连接通
sequelize.authenticate().then(() => {
  console.log('连接成功')
}).catch(err => {
  console.log('连接失败', err)
})
module.exports = sequelize