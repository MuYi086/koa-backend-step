const path = require('path')
/**
 * 全局配置
 * @module Config
 * @author MuYi086 <1258947325@qq.com>
 * @link http://www.github.com/MuYi086
 */
module.exports = {
  env: 'dev',
  apiPrefix: '/api/',
  database: {
    dbName: 'koa_MuYi086_cn',
    host: '192.168.1.104',
    port: 3306,
    user: 'koa_MuYi086_cn',
    password: 'testkoa'
  },
  jwtConfig: {
    secret: 'future-data-import-demo' // 秘钥
  },
  cryptoConfig: {
    algorithm: 'aes-128-cbc',
    characterEncoding: 'utf8',
    nodeKey: '0123456789abcdef',
    nodeIv: 'fedcba9876543210' // 以上是给node模块crypto配置使用,保证和前端一致
  },
  queryConfig: {
    page: 1,
    limit: 10,
    isdelete: 0,
    fileSingleMaxSize: 200,
    fileMultiMaxSize: 200
  },
  redisConfig: {
    port: 6379,
    host: '127.0.0.1',
    timeout: 60 * 60 * 24
  },
  ip2reginonConfig: {
    dbPath: '' // 想要自定义的ip2region路径
  },
  uploadDir: path.join(__dirname, `../public/uploads/tmp`), // 上传文件缓存目录
  staticPath: path.join(__dirname, `../public`) // 静态文件路径
}