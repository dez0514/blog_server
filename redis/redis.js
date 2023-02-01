// redis
// const ioRedis = require('ioredis');
// const redis = new ioRedis();
// //  注意是不同的redis实例
// const sub = new ioRedis();
// const pub = new ioRedis();

// exports.redis = redis;
// exports.sub = sub;
// exports.pub = pub;

// usage
// const session = require("express-session")
// const RedisStore = require("connect-redis")(session)
// const redis = require('./redis/redis.js').redis;

// const salt = 'sessiontest'
// app.use(session({
//   store: new RedisStore({
//     client: redis,
//     prefix: 'zzz'
//   }),
//   cookie: { maxAge: 1 * 60 * 60 * 1000 }, // 默认1小时
//   secret: salt,
//   resave: true,
//   saveUninitialized: true
// }));
// app.use(cookieParser(salt));