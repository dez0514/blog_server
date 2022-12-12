const redis = {
  host: 'localhost',
  port: 6379,
  password: 'password',
  detect_buffers: true // 传入buffer 返回也是buffer 否则会转换成String
  // ttl: 5 * 60 * 1000 // 设置过期
};
module.exports = redis;