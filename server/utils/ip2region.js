// npm地址: https://www.npmjs.com/package/ip2region-tsnpmjsip2region
// github文档: https://github.com/lionsoul2014/ip2region
const Searcher = require('ip2region-ts')
const { ip2reginonConfig } = require('../config/index')
// 有自定义的ip2region数据,否则使用默认数据源
const dbPath = ip2reginonConfig.dbPath || Searcher.defaultDbFile
/**
 * 查询ip归属地信息
 * @param {string} ip 
 * @returns 包含ip信息的对象
 */
const ipSearch = async (ip) => {
  // 完全基于文件的查询
  const searcher = Searcher.newWithFileOnly(dbPath)
  // 缓存VetorIndex索引
  // const vetorIndex = Searcher.loadVectorIndexFromFile(dbPath)
  // const searcher = Searcher.newWithVectorIndex(dbPath, vetorIndex)
  // 缓存整个xdb数据
  // const buffer = Searcher.loadContentFromFile(dbPath)
  // const searcher = Searcher.newWithBuffer(buffer)
  let data = ''
  try {
    // 查询
    data = await searcher.search(ip)
  } catch (err) {
    data = null
    console.log(`ipSearch error: ${err}`)
  }
  return data
}
module.exports = ipSearch