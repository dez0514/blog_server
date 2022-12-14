const redis = require("redis");
const redisConfig = require('../config/redis')
const option = {
  host: redisConfig.host,
  port: redisConfig.port,
  password: redisConfig.password,
  detect_buffers: redisConfig.detect_buffers,
  // ttl: redisConfig.ttl
  retry_strategy: function (options) {
    // 重连机制
    // console.log('options===', options)
    if (options.error && options.error.code === "ECONNREFUSED") {
      return new Error("The server refused the connection");
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error("Retry time exhausted");
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
}
let client = null;
(async function() {
  try {
    client = redis.createClient(option)
    client.on('error', (err) => console.log('Redis Client Error===', err));
    await client.connect()
    console.log('Redis connection is successful!')
  } catch (err) {
    console.log('err===', err)
  }
})()

module.exports = client

// const { promisify } = require('util');
// function promiseRedis(client) {
//   return {
//     exists: promisify(client.exists).bind(client),
//     keys: promisify(client.keys).bind(client),
//     set: promisify(client.set).bind(client),
//     get: promisify(client.get).bind(client),
//     del: promisify(client.del).bind(client),
//     incr: promisify(client.incr).bind(client),
//     decr: promisify(client.decr).bind(client),
//     lpush: promisify(client.lpush).bind(client),
//     hexists: promisify(client.hexists).bind(client),
//     hgetall: promisify(client.hgetall).bind(client),
//     hset: promisify(client.hset).bind(client),
//     hmset: promisify(client.hmset).bind(client),
//     hget: promisify(client.hget).bind(client),
//     hincrby: promisify(client.hincrby).bind(client),
//     hdel: promisify(client.hdel).bind(client),
//     hvals: promisify(client.hvals).bind(client),
//     hscan: promisify(client.hscan).bind(client),
//     sadd: promisify(client.sadd).bind(client),
//     smembers: promisify(client.smembers).bind(client),
//     scard: promisify(client.scard).bind(client),
//     srem: promisify(client.srem).bind(client)
//   }
// }
