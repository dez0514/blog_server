### blog_server api
#### article
|  url  |  methods  |  params  |  desc  |
|  :----:  | :----:  | :----:  | :----:  |
|  /article_list | get | { pageSize,pageNum,type,tag,keyword,year,month } | 文章列表 |
|  /article_all_list | get | -- | 文章列表（所有） |
|  /article_detail | get | { id } | 文章详情 |
|  /add_article | post | { title, author, extra_title, banner, tags（id英文逗号拼接）, content, git, id(编辑带id) } | 新增编辑文章 |
|  /delete_article | get | { id } | 删除文章 |

#### tag
|  url  |  methods  |  params  |  desc  |
|  :----:  | :----:  | :----:  | :----:  |
|  /tag_list | get | { pageSize,pageNum } | 标签列表 |
|  /tag_all_list | get | -- | 标签列表（所有） |
|  /add_tag | post | { name, color, icon, id(编辑带id) } | 新增编辑标签 |
|  /add_taglist | post | { taglist: [{name, color, icon},{...}] } | 批量新增标签 |
|  /delete_tag | post | { id } | 删除标签 |
#### img && folder
|  url  |  methods  |  params  |  desc  |
|  :----:  | :----:  | :----:  | :----:  |
|  /upload | post | formdata: file,file,... | 上传图片（多图） |
|  /mkdir | post | { name } | 新建文件夹 |
|  /deletedir | post | { name } | 删除文件夹 |
|  /deletefile | post | { name } | 删除文件 |
|  /deletefiles | post | { names: 'name,name,...' } | 批量删除文件 |
|  /filelist | post | { name: '路径名' } | 文件列表 |

### 数据表
#### users
+---------------+--------------+------+-----+---------+----------------+
| Field         | Type         | Null | Key | Default | Extra          |
+---------------+--------------+------+-----+---------+----------------+
| id            | int          | NO   | PRI | NULL    | auto_increment |
| username      | varchar(30)  | NO   | UNI | NULL    |                |
| password      | varchar(100) | NO   |     | NULL    |                |
+---------------+--------------+------+-----+---------+----------------+
```
CREATE TABLE users(id INT NOT NULL AUTO_INCREMENT,  username varchar(30) NOT NULL unique, password varchar(100) NOT NULL, token varchar(300), expires_time datetime, PRIMARY KEY ( id ))ENGINE=InnoDB DEFAULT CHARSET=utf8;

alter table users drop column token;
alter table users drop column expires_time;
```
#### articles
+-------------+--------------+------+-----+-------------------+-------------------+
| Field       | Type         | Null | Key | Default           | Extra             |
+-------------+--------------+------+-----+-------------------+-------------------+
| id          | int unsigned | NO   | PRI | NULL              | auto_increment    |
| title       | varchar(100) | NO   |     | NULL              |                   |
| author      | varchar(30)  | NO   |     | NULL              |                   |
| extra_title | varchar(100) | NO   |     | NULL              |                   |
| banner      | varchar(100) | NO   |     | NULL              |                   |
| content     | longtext     | NO   |     | NULL              |                   |
| git         | varchar(100) | NO   |     | NULL              |                   |
| views       | int          | YES  |     | 0                 |                   |
| likes       | int          | YES  |     | 0                 |                   |
| create_time | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| update_time | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
+-------------+--------------+------+-----+-------------------+-------------------+
```
CREATE TABLE articles(id INT NOT NULL AUTO_INCREMENT, title VARCHAR(100) NOT NULL, author VARCHAR(30) NOT NULL, extra_title VARCHAR(100) NOT NULL, banner VARCHAR(100) NOT NULL, content longtext NOT NULL,git VARCHAR(100) NOT NULL ,views INT, likes INT, create_time datetime default current_timestamp, update_time datetime default current_timestamp, PRIMARY KEY ( id ))ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
#### tags
+-------+--------------+------+-----+---------+----------------+
| Field | Type         | Null | Key | Default | Extra          |
+-------+--------------+------+-----+---------+----------------+
| id    | int          | NO   | PRI | NULL    | auto_increment |
| name  | varchar(40)  | NO   | UNI | NULL    |                |
| color | varchar(100) | NO   |     | NULL    |                |
| icon  | varchar(100) | NO   |     | NULL    |                |
+-------+--------------+------+-----+---------+----------------+
```
CREATE TABLE tags(id INT NOT NULL AUTO_INCREMENT, name VARCHAR(40) NOT NULL unique, color VARCHAR(100) NOT NULL, icon VARCHAR(100) NOT NULL, PRIMARY KEY ( id ))ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
#### article_tag
+------------+------+------+-----+---------+----------------+
| Field      | Type | Null | Key | Default | Extra          |
+------------+------+------+-----+---------+----------------+
| id         | int  | NO   | PRI | NULL    | auto_increment |
| article_id | int  | NO   |     | NULL    |                |
| tag_id     | int  | NO   |     | NULL    |                |
+------------+------+------+-----+---------+----------------+
```
CREATE TABLE article_tag(id INT NOT NULL AUTO_INCREMENT,  article_id INT NOT NULL, tag_id INT NOT NULL, PRIMARY KEY ( id ))ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
#### article_tag 关系表逻辑梳理
1. 文章表里不需要标签任何信息
2. 标签表里不需要文章的任何信息
3. 关联表里保存文章id 和 标签id, 多对多。
4. 文章增删改时 同时操作关联表
5. 标签增删改时 同时操作关联表
6. 查询时 利用 左右连接 查询 关联表

#### resumes
<!-- 只存一条，每次更新都只更新这一条 -->
+----------------+--------------+------+-----+-------------------+-------------------+
| Field          | Type         | Null | Key | Default           | Extra             |
+----------------+--------------+------+-----+-------------------+-------------------+
| id             | int unsigned | NO   | PRI | NULL              | auto_increment    |
| name           | varchar(100) | NO   |     | NULL              |                   |
| birthday       | varchar(20)  | YES  |     | NULL              |                   |
| avatar         | varchar(100) | YES  |     | NULL              |                   |
| gendar         | varchar(10)  | NO   |     | NULL              |                   |
| school         | varchar(100) | NO   |     | NULL              |                   |
| skills         | varchar(100) | YES  |     | NULL              |                   |
| location       | varchar(100) | YES  |     | NULL              |                   |
| profession     | varchar(100) | YES  |     | NULL              |                   |
| graduationDate | varchar(100) | YES  |     | NULL              |                   |
| blog           | varchar(100) | YES  |     | NULL              |                   |
| github         | varchar(100) | YES  |     | NULL              |                   |
| phone          | varchar(100) | NO   |     | NULL              |                   |
| email          | varchar(100) | YES  |     | NULL              |                   |
| wechat         | varchar(100) | YES  |     | NULL              |                   |
| qq             | varchar(100) | YES  |     | NULL              |                   |
| job            | varchar(100) | NO   |     | NULL              |                   |
| extra          | longtext     | YES  |     | NULL              |                   |
| create_time    | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| update_time    | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
+----------------+--------------+------+-----+-------------------+-------------------+

```
create table if not exists `resumes` (`id` int unsigned auto_increment, `name` varchar(100) not null, `birthday` varchar(20),avatar varchar(100), `gendar` varchar(10) not null,`school` varchar(100) not null,`skills` varchar(100),`location` varchar(100),`profession` varchar(100), `graduationDate` varchar(100),`blog` varchar(100),`github` varchar(100),`phone` varchar(100) not null,`email` varchar(100),`wechat` varchar(100),`qq` varchar(100),`job` varchar(100) not null, `extra` longtext, create_time datetime default current_timestamp, update_time datetime default current_timestamp, primary key(`id`))engine=InnoDB Default charset=utf8;
```

#### resume_project
+------------+--------------+------+-----+---------+----------------+
| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+
| id         | int unsigned | NO   | PRI | NULL    | auto_increment |
| resume_id  | int          | NO   |     | NULL    |                |
| project_id | int          | NO   |     | NULL    |                |
+------------+--------------+------+-----+---------+----------------+

```
create table if not exists `resume_project` (`id` int unsigned auto_increment, `resume_id` int not null, `project_id` int not null, primary key(`id`))engine=InnoDB Default charset=utf8;
```

#### companys
+-------------+--------------+------+-----+-------------------+-------------------+
| Field       | Type         | Null | Key | Default           | Extra             |
+-------------+--------------+------+-----+-------------------+-------------------+
| id          | int unsigned | NO   | PRI | NULL              | auto_increment    |
| name        | varchar(100) | NO   |     | NULL              |                   |
| durings     | varchar(100) | NO   |     | NULL              |                   |
| sort        | int          | YES  |     | 0                 |                   |
| create_time | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| update_time | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
+-------------+--------------+------+-----+-------------------+-------------------+

```
create table if not exists `companys` (`id` int unsigned auto_increment, `name` varchar(100) not null,  `durings` varchar(100) not null,`sort` int default 0, create_time datetime default current_timestamp, update_time datetime default current_timestamp, primary key(`id`))engine=InnoDB Default charset=utf8;
```

#### projects
+-------------+--------------+------+-----+-------------------+-------------------+
| Field       | Type         | Null | Key | Default           | Extra             |
+-------------+--------------+------+-----+-------------------+-------------------+
| id          | int unsigned | NO   | PRI | NULL              | auto_increment    |
| name        | varchar(100) | NO   |     | NULL              |                   |
| intro       | longtext     | NO   |     | NULL              |                   |
| technology  | varchar(100) | NO   |     | NULL              |                   |
| details     | longtext     | NO   |     | NULL              |                   |
| sort        | int          | YES  |     | 0                 |                   |
| imgList     | longtext     | YES  |     | NULL              |                   |
| create_time | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| update_time | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
+-------------+--------------+------+-----+-------------------+-------------------+

```
create table if not exists `projects` (`id` int unsigned auto_increment, `name` varchar(100) not null, `intro` longtext not null,technology varchar(100) not null,`details` longtext not null,`sort` int default 0,`imgList` longtext, create_time datetime default current_timestamp, update_time datetime default current_timestamp, primary key(`id`))engine=InnoDB Default charset=utf8;

```
#### company_project
+------------+--------------+------+-----+---------+----------------+
| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+
| id         | int unsigned | NO   | PRI | NULL    | auto_increment |
| company_id | int          | NO   |     | NULL    |                |
| project_id | int          | NO   |     | NULL    |                |
+------------+--------------+------+-----+---------+----------------+

```
create table if not exists `company_project` (`id` int unsigned auto_increment, `company_id` int not null, `project_id` int not null, primary key(`id`))engine=InnoDB Default charset=utf8;
```
#### emails
+----------+--------------+------+-----+---------+----------------+
| Field    | Type         | Null | Key | Default | Extra          |
+----------+--------------+------+-----+---------+----------------+
| id       | int unsigned | NO   | PRI | NULL    | auto_increment |
| email    | varchar(100) | NO   | UNI | NULL    |                |
| nickname | varchar(100) | NO   | UNI | NULL    |                |
| avatar   | longtext     | NO   |     | NULL    |                |
| weburl   | longtext     | YES  |     | NULL    |                |
+----------+--------------+------+-----+---------+----------------+
```
create table if not exists `emails` (`id` int unsigned auto_increment, `email` varchar(100) not null unique, `nickname` varchar(100) not null unique, `avatar` longtext not null, `weburl` longtext, primary key(`id`))engine=InnoDB Default charset=utf8;
```
#### comments
+-------------+--------------+------+-----+-------------------+-------------------+
| Field       | Type         | Null | Key | Default           | Extra             |
+-------------+--------------+------+-----+-------------------+-------------------+
| id          | int unsigned | NO   | PRI | NULL              | auto_increment    |
| topic_id    | int          | YES  |     | NULL              |                   |
| topic_type  | varchar(30)  | NO   |     | NULL              |                   |
| from_uid    | varchar(100) | NO   |     | NULL              |                   |
| content     | longtext     | NO   |     | NULL              |                   |
| create_time | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| update_time | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
+-------------+--------------+------+-----+-------------------+-------------------+
```
create table if not exists `comments` (`id` int unsigned auto_increment, `topic_id` int, `topic_type` varchar(30) not null, `from_uid` varchar(100) not null, `content` longtext not null, create_time datetime default current_timestamp, update_time datetime default current_timestamp, primary key(`id`))engine=InnoDB Default charset=utf8;
```
#### replys
+-------------+--------------+------+-----+-------------------+-------------------+
| Field       | Type         | Null | Key | Default           | Extra             |
+-------------+--------------+------+-----+-------------------+-------------------+
| id          | int unsigned | NO   | PRI | NULL              | auto_increment    |
| comment_id  | int          | NO   |     | NULL              |                   |
| reply_id    | int          | NO   |     | NULL              |                   |
| reply_type  | varchar(30)  | NO   |     | NULL              |                   |
| from_uid    | varchar(100) | NO   |     | NULL              |                   |
| to_uid      | varchar(100) | NO   |     | NULL              |                   |
| content     | longtext     | NO   |     | NULL              |                   |
| create_time | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
| update_time | datetime     | YES  |     | CURRENT_TIMESTAMP | DEFAULT_GENERATED |
+-------------+--------------+------+-----+-------------------+-------------------+
```
create table if not exists `replys` (`id` int unsigned auto_increment, `comment_id` int not null, `reply_id` int not null,`reply_type` varchar(30) not null, `from_uid` varchar(100) not null, `to_uid` varchar(100) not null, `content` longtext not null, create_time datetime default current_timestamp, update_time datetime default current_timestamp, primary key(`id`))engine=InnoDB Default charset=utf8;
```
#### like_ips 点赞的ip
+------------+--------------+------+-----+---------+----------------+
| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+
| id         | int          | NO   | PRI | NULL    | auto_increment |
| article_id | int          | NO   |     | NULL    |                |
| like_ip    | varchar(130) | NO   |     | NULL    |                |
| like_time  | datetime     | NO   |     | NULL    |                |
+------------+--------------+------+-----+---------+----------------+
```
create table if not exists `like_ips`
(
  `id` int not null auto_increment,
  `article_id` int not null,
  `like_ip` varchar(130) not null,
  `like_time` datetime not null,
  primary key(`id`)
)engine=InnoDB Default charset=utf8;
```
#### view_ips 浏览的ip
```
alter drop view_ips; // 利用redis，此表无用了
```
### 登录，第三方登录 获取用户信息
第三方登录时 获取信息存起来，就不用管第三方登录的时效了，blog自己的登录逻辑，时效。
暂时不做第三方登录...。邮箱，昵称，网站（选填） 登录（第一次注册，登录），后面只要邮箱就行。
### 留言，回复，文章评论 
// 参考： https://www.cnblogs.com/wz-ii/p/13131501.html
树形模式：至少需要两个表。
还需要存用户信息：昵称，邮箱，头像（随机一张本地图片）。
评论表 comments：id, topic_id, topic_type, content, from_uid
// topic_id 对应文章id, 留言板为空
// topic_type 区分：文章评论 和 留言板  'messageboard' | 'articleComment'
回复表 replys： id, comment_id, reply_id, reply_type, content, from_uid, to_uid
// comment_id: 评论id, 哪条评论下的回复 or 哪条评论下的 回复的回复。
// reply_type：表示回复的类型，因为回复可以是针对评论的回复(comment)，也可以是针对回复的回复(reply)，区分两种情景。
// reply_id：表示回复目标的id（回复的是哪一条 评论或回复），如果reply_type是comment，那reply_id＝commit_id，如果reply_type是reply，这表示这条回复的父回复。
// to_uid: 回复的谁（用户）
// from_uid: 页面提交发布的用户
用户信息表 email：(命名避免与管理系统的user冲突)
id, email, nickname, avatar, weburl
// 作者回复时 发邮件。
from_uid, to_uid 均改为直接提交邮箱。查询时再查出emails表中的信息

评论前需要先登录，那前台页面就添加简单的登录功能，不要token
1.页面登录接口 clientLogin。必填情况：1.初次登录：email，nickname。 2.登录过 email。（选填weburl）
2.接口逻辑：
  1.只接收到邮箱时：先查询 email 表，如果没有此邮箱, 响应提示输入 nickname，如果查到邮箱，响应登录成功。
  2.接收到邮箱和nickname时，先查email, 如果没有就添加，如果有就比对nickname,如果nickname不一致就响应不一致，如果一致就登录成功。
  
todo:
3.第三方登录准备工作：
  开发者模式 参考：https://www.ly522.com/3685.html
  逻辑：
  1.拉取到email,nickname,avatar等信息，查询email表，如果存在就更新信息，不存在就新增。然后响应成功。
  2.如果没有拉到邮箱，直接响应失败。
### 文章点赞&文章浏览量（不登录也能点，那就与登录无关）
先盲目实现：
1. 浏览量 调用详情接口时+1
2. 点赞，点赞接口时+1
// 参考：https://segmentfault.com/q/1010000010675069
点赞利用mysql表,一个ip一篇文章只能点一次。
1. 设计一个like_ip表，忽略同一局域网出口ip一样的情况，一个ip一篇文章只能点一次。
2. 查询详情时，获取ip, 查询like_ip中是否存在: 此ip && 此文章id 的数据。返回标识。
3. 点赞时 同样先查like_ip表, 前端根据标识限制

浏览量利用redis。一个ip一篇文章一天访问只计数一次。
redis.set(`view_${ip}_${articleID}`, ip)
redis.expire(`view_${ip}_${articleID}`, exp)
如果redis能查到就表示访问过，如果查不到(此条redis失效，再次访问)就浏览量加1


### mysql & database helper
cmd：
1. mysql -u root -p
2. ******
命令：
show databases;  // 显示所有数据库
create database xxx; // 创建数据库
use xxx; // 进入数据库

vscode 连接 mysql 修改密码
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY ******;

//修改列属性
alter table tags modify name varchar(40) not NULL unique;

// 新增列属性
ALTER TABLE 表名 ADD 新字段名 数据类型 [约束条件] FIRST;
ALTER TABLE 表名 ADD 新字段名 数据类型 [约束条件] AFTER <已经存在的字段名>;

// 入门级sql
lef join, right join, 临时表, group by
查询文章详情，关联表中文章id对应的所有标签id，再用这些标签id查标签表中信息
select t.* from tags t right join ( select r.tag_id as id  from article_tag r right join articles a on a.id = r.article_id where a.id = ''  ) ra on t.id = ra.id;

查询文章列表，每条文章数据里需要 带上它的标签信息。
思路1：长sql, 和上面类似，但是GROUP_CONCAT只能将所有标签信息的给一个字段，前端获取到进行切割
// limit做分页，其他筛选条件可以继续拼

思路2：先查文章列表，再根据文章id集合查所有文章id对应的标签总列表，然后再根据文章id分类合并处理
利用id集合查所有id数据 的sql
select t.*, r.article_id from tags t left join article_tag r on t.id =  r.tag_id  where r.article_id in (${ids});

#### token机制
登录成功；
生成token，时效为2h。(加密)响应给接口，前端存在浏览器缓存，
同时存到redis，用户名作为key，token作为值，并设置redis key的过期时间，也为2h；
前端每次请求接口，如果接口的响应头里有token，就替换掉浏览器缓存上存的token
接口收到请求校验token：
1.接收到token，（解密）解码获取到token里用户名
2.根据用户名查询redis，如果差不到就是redis的key失效了，就响应失效。
3.如果查到了，说明redis没失效，那就根据解码的信息判断token自身是否失效
  如果token自身失效：就重新生成一个token，重新存到redis。存法一致：用户名作为key，token作为值，过期时间2h，
  如果token自身没失效：就更新redis key的过期时间。

### cookie
// domain: 域名 
// Path： 表示 cookie 影响到的路，如 path=/。如果路径不能匹配时，浏览器则不发送这个 Cookie
// Expires： 过期时间（秒），在设置的某个时间点后该 Cookie 就会失效，如 expires=Wednesday, 9-Nov-99 23:12:40 GMT  
// maxAge： 最大失效时间（毫秒），设置在多少后失效
// secure：当 secure 值为 true 时，cookie 在 HTTP 中是无效，在 HTTPS 中才有效    
// httpOnly：是微软对 COOKIE 做的扩展。
// 如果在 COOKIE 中设置了“httpOnly”属性，则通过程序（JS 脚本、applet 等）将无法读取到COOKIE 信息，防止 XSS 攻击产生
// singed：表示是否签名cookie, 设为true 会对这个 cookie 签名，这样就需要用 res.signedCookies 而不是 res.cookies 访问它。被篡改的签名 cookie 会被服务器拒绝，并且 cookie 值会重置为它的原始值   
### 定时任务 node-schedule
```
// 每天的凌晨0点0分0秒触发
schedule.scheduleJob('0 0 0 * * *', () => {
  // do something
});
```
### 浅尝redis。。
参考文章：
https://www.runoob.com/redis/redis-install.html
https://www.cnblogs.com/huilinmumu/p/15979459.html
https://zhuanlan.zhihu.com/p/405936576
https://www.51cto.com/article/477692.html
使用： 
https://blog.csdn.net/dongkeai/article/details/127462318

mac redis:
1.brew services start redis / brew services stop redis
2.1 command+shift+G
2.cd usr/local/bin
3.redis-cli -h 127.0.0.1 -p 6379
备注：修改密码 config set requirepass 'xxx'
检查密码： auth xxx

windows:
安装redis之后
启动终端 cd redis目录： 执行 redis-cli.exe -h 127.0.0.1 -p 6379
新开一个cmd： cd cd redis目录: 执行 redis-server.exe redis.windows.conf
安装redisClient，打开.exe连接 可查询

redis连接不上，可能是以下原因：
1. 上次没关闭，需要关闭再重连 参考：https://blog.csdn.net/sinat_32857543/article/details/124230394
2. node版本切走了，忘记切回安装使用redis-server时的版本

redis命令: http://doc.redisfans.com/
1. keys *
2. keys prefix* // 前缀模糊查询
3. get [keyname] // 例如 get zwd
4. set [keyname] [value] // 例如 set zwd 'testvalue'

#### nodejs 打断点调试
参考：https://blog.csdn.net/weixin_44899507/article/details/112544405
1. node --inspect app.js
2. 浏览器地址栏：chrome://inspect或者about:inspect
3. 点击inspect按钮打开调试界面

