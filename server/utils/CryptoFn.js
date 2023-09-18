/**
 * @Author: yanglu
 * @Email: 1258947325@qq.com
 * @Blog: https://github.com/ougege/blog
 * @Theme: crypto加密解密
 * @Date: 2021/09/06 14:58
 */
const crypto = require('crypto')
const { cryptoConfig } = require('../config/index')

/**
 * crypto加密
 * @param {string} word 要加密的字符串
 * @returns 密文
 */
const aesEncrypt = function (word) {
  const { algorithm, characterEncoding, nodeKey, nodeIv } = cryptoConfig
  // 创建实例:node版本未找到设置padding的函数,默认使用Pkcs7
  // 参考: https://nodejs.org/api/crypto.html#cryptocreatecipherivalgorithm-key-iv-options
  const cipher = crypto.createCipheriv(algorithm, nodeKey, nodeIv)
  let crypted = cipher.update(word, characterEncoding)
  crypted = Buffer.concat([crypted, cipher.final()])
  return crypted.toString('hex')
}
/**
 * crypto解密
 * @param {string} encrypted 密文
 * @returns 原文
 */
const aesDecrypt = function (encrypted) {
  const { algorithm, nodeKey, nodeIv } = cryptoConfig
  const encryptedText = Buffer.from(encrypted, 'hex')
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(nodeKey), nodeIv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}

module.exports = {
  aesEncrypt,
  aesDecrypt
}