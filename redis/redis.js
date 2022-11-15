// redis
const ioRedis = require('ioredis');
const redis = new ioRedis();
//  注意是不同的redis实例
const sub = new ioRedis();
const pub = new ioRedis();

exports.redis = redis;
exports.sub = sub;
exports.pub = pub;