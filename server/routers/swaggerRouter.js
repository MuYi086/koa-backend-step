// 官方文档: https://github.com/Cody2333/koa-swagger-decorator
const path = require('path')
const { SwaggerRouter } = require('koa-swagger-decorator')
const swaggerRouter = new SwaggerRouter()


swaggerRouter.swagger({
  title: 'future-data-import',
  description: 'API DOC',
  version: '1.0.0'
})
swaggerRouter.mapDir(path.resolve(__dirname, '../api/'))
module.exports = swaggerRouter