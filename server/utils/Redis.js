const { createClient } = require('redis')
const { redisConfig } = require('../config/index')
const type = require('./Type')
const { port, host, timeout } = redisConfig

// 参考文档: https://thisdavej.com/guides/redis-node/node/lists.html
const redisUrl = `redis://${host}:${port}`
const redisClient = createClient({
  url: redisUrl
})
redisClient.on('error', err => console.log('Redis Client Error', err))
redisClient.connect().then(() => {
  console.log(`连接redis成功`)
}).catch(err => {
  console.log(`连接redis失败:${err}`)
})
/**
 * redisGet: 普通数据
 * @param {string} key 
 * @returns value
 */
const redisGet = async (key) => {
  const value = await redisClient.get(key)
  // 尝试是否能格式化成对象,否则是基本类型直接返回
  try {
    return JSON.parse(value)
  } catch (err) {
    return value
  }
}
/**
 * redisSet: 普通数据
 * @param {string} key 
 * @param {*} val 
 * @param {number} timeoutVal 
 */
const redisSet = async (key, val, timeoutVal = timeout) => {
  if (type['isObject'](val)) {
    val = JSON.stringify(val)
  }
  await redisClient.set(key, val)
  await redisClient.expire(key, timeoutVal)
}
/**
 * redisHset: 哈希表 (需要注意hmset已废弃,并且这个方法不能存储嵌套的对象,取值会变成[object Object])
 * @param {string} key
 * @param {Object} val 类似es6的Map对象
 * @param {number} timeoutVal 
 */
const redisHset = async (key, val, timeoutVal = timeout) => {
  try {
    if (!type['isObject'](val)) {
      throw new Error('redisHmset方法仅支持存储Map对象')
    } else {
      for (const prop in val) {
        await redisClient.hSet(key, prop, val[prop])
      }
      await redisClient.expire(key, timeoutVal)
    }
  } catch (err) {
    console.log(err)
  }
}
/**
 * redisHget
 * @param {string} key 
 * @returns 
 */
const redisHGetAll = async (key) => {
  const value = await redisClient.hGetAll(key)
  return value
}
/**
 * redisLPush: 
 * @param {*} key 
 * @param {*} val 
 * @param {*} timeoutVal 
 */
const redisLPush = async (key, val, timeoutVal = timeout) => {
  try {
    if (!type['isArray'](val)) {
      throw new Error('redisLPush方法仅支持存储数组')
    } else {
      await redisClient.lPush(key, val)
      await redisClient.expire(key, timeoutVal)
    }
  } catch (err) {
    console.log(err)
  }
}
/**
 * redisSadd
 * @param {string} key
 * @param {Object} val 类似es6的Set对象
 * @param {number} timeoutVal 
 */
 const redisSadd = async (key, val, timeoutVal = timeout) => {
  try {
    if (!val) {
      throw new Error('redisSadd方法仅支持存储Set对象')
    } else {
      await redisClient.sAdd(key, val)
      await redisClient.expire(key, timeoutVal)
    }
  } catch (err) {
    console.log(err)
  }
}
/**
 * redis 删除
 * @param {string} key 
 */
const redisDel = async (key) => {
  redisClient.del(key, (err, response) => {
    if (response === 1) {
      console.log(`删除redis键成功!`)
    } else {
      console.log(`删除redis键失败:${err}`)
    }
  })
}
/**
 * subscribe订阅
 * @param {string} channel 频道
 */
const redisSubscribe = (channel) => {
  redisClient.subscribe(channel, (err, count) => {
    if (err) {
      throw new Error('room订阅失败')
    }
    console.log(`欢迎加入${channel}房间`, '-------------------------attr----------------------')
  })
  // redisClient.connect()
  redisClient.on('message', (channel, message) => {
    console.log(`收到${channel}的消息:${message}`)
  })
}
/**
 * 发布
 * @param {string} channel 频道
 * @param {string} message 消息
 */
const redisPublish = (channel, message) => {
  redisClient.publish(channel, message)
}
module.exports = {
  redisGet,
  redisSet,
  redisHset,
  redisHGetAll,
  redisLPush,
  redisSadd,
  redisDel,
  redisSubscribe,
  redisPublish
}
