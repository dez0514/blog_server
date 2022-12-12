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
| token         | varchar(300) | YES  |     | NULL    |                |
| expires_time  | datetime     | YES  |     | NULL    |                |
+---------------+--------------+------+-----+---------+----------------+
```
CREATE TABLE users(id INT NOT NULL AUTO_INCREMENT,  username varchar(30) NOT NULL unique, password varchar(100) NOT NULL, token varchar(300), expires_time datetime, PRIMARY KEY ( id ))ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE 表名 ADD 新字段名 数据类型 [约束条件] FIRST;
alter table users add expires_time datetime
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
| like_count | int          | NO   |     | NULL    |                |
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
+------------+--------------+------+-----+---------+----------------+
| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+
| id         | int          | NO   | PRI | NULL    | auto_increment |
| article_id | int          | NO   |     | NULL    |                |
| view_ip    | varchar(130) | NO   |     | NULL    |                |
| view_time  | datetime     | NO   |     | NULL    |                |
| view_count | int          | NO   |     | NULL    |                |
+------------+--------------+------+-----+---------+----------------+
```
create table if not exists `view_ips`
(
  `id` int not null auto_increment,
  `article_id` int not null,
  `view_ip` varchar(130) not null,
  `view_time` datetime not null,
  primary key(`id`)
)engine=InnoDB Default charset=utf8;
```
### 登录，第三方登录 获取用户信息
第三方登录时 获取信息存起来，就不用管第三方登录的时效了，blog自己的登录逻辑，时效。
暂时不做第三方登录...。邮箱，昵称，网站（选填） 登录（第一次注册，登录），后面只要邮箱就行。
### 留言，回复，文章评论 
// 参考： https://www.cnblogs.com/wz-ii/p/13131501.html
树形模式：至少需要两个表。
还需要存用户信息：昵称，邮箱，头像（随机一张本地图片）。
评论表 comments：
id, topic_id, topic_type, content, from_uid
// topic_id 对应文章id, 留言板为空
// topic_type 区分：文章评论 和 留言板  'messageboard' | 'articleComment'
回复表 replys：
id, comment_id, reply_id, reply_type, content, from_uid, to_uid
// comment_id: 评论id, 哪条评论下的回复 or 哪条评论下的 回复的回复。
// reply_type：表示回复的类型，因为回复可以是针对评论的回复(comment)，也可以是针对回复的回复(reply)，区分两种情景。
// reply_id：表示回复目标的id（回复的是哪一条 评论或回复），如果reply_type是comment，那reply_id＝commit_id，如果reply_type是reply，这表示这条回复的父回复。
// to_uid: 回复的谁（用户）
// from_uid: 页面提交发布的用户
用户信息表 email：(命名避免与管理系统的user冲突)
id, email, nickname, avatar, weburl
// 作者回复时 发邮件。参考：http://t.zoukankan.com/easth-p-node_sendMail.html
from_uid, to_uid 均改为直接提交邮箱。查询时再查出emails表中的信息

评论前需要先登录，那就添加简单的登录功能，不要token
1.页面登录接口 clientLogin。必填情况：1.初次登录：email，nickname。 2.登录过 email。（选填weburl）
2.接口逻辑：
  1.只接收到邮箱时：先查询 email 表，如果没有此邮箱, 响应提示输入 nickname，如果查到邮箱，响应登录成功。
  2.接收到邮箱和nickname时，先查email, 如果没有就添加，如果有就比对nickname,如果nickname不一致就响应不一致，
    如果一致就登录成功

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
问题: 
1. 如何限制重复点赞？// 刷新页面时获取cookie信息，如果没有信息就能点赞，如果有信息就点过赞了
2. 文章详情接口如何获取点赞状态？// 不用返回，前端判断cookie信息，自行处理
3. 如何限制浏览量重复？// 前端获取cookie信息，给个标识给详情接口，表示是否更新views
4. cookie怎么存呢，与文章id还得绑定？？？cookie有大小限制，如果每篇文章存个key有点不太好。。
5. redis 还没用过...
所以换种粗暴的方案：
1. 设计一个like_ip表，忽略同一局域网出口ip一样的情况，一个ip一篇文章只能点一次。
2. 查询详情时，获取ip, 查询like_ip中是否存在: 此ip && 此文章id 的数据。返回标识。
3. 点赞时 同样先查like_ip表, 前端根据标识限制
4. 基于以上，再加个时间比对，一个ip在规定时间内能对一篇文章一次点赞。
5. 浏览量也同理，设计一个 view_ip表，每次请求详情时，先查此表，如果与此表存的ip, article_id 以及时间关系成立就更新。

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
select ar.title as '文章名', GROUP_CONCAT(t.name separator ',') as '标签' from ( select a.*, r.tag_id as tag_id from articles a left join  article_tag r on a.id = r.article_id where 1=1 ) ar left join tags t on ar.tag_id = t.id group by ar.id order by ar.id desc limit 4, 2 

select ar.* , GROUP_CONCAT(t.name separator ',') from ( select a.*, r.tag_id as tag_id from articles a left join  article_tag r on a.id = r.article_id where 1=1 ) ar left join tags t on ar.tag_id = t.id group by ar.id order by ar.id desc  limit 4, 2 ;

select ar.* , GROUP_CONCAT(CONCAT_WS(', ', t.name, t.icon) SEPARATOR ';') as 'tagArrs' from ( select a.*, r.tag_id as tag_id from articles a left join  article_tag r on a.id = r.article_id where 1=1 ) ar left join tags t on ar.tag_id = t.id group by ar.id order by ar.id desc limit 4, 2;

思路2：先查文章列表，再根据文章id集合查所有文章id对应的标签总列表，然后再根据文章id分类合并处理
利用id集合查所有id数据 的sql
select t.*, r.article_id from tags t left join article_tag r on t.id =  r.tag_id  where r.article_id in (${ids});

#### refreshToken机制 （太麻烦了，不搞）
为什么需要刷新令牌
如果token超时时间很长，比如14天，由于第三方软件获取受保护资源都要带着token，这样token的攻击面就比较大。
如果token超时时间很短，比如1个小时，那其超时之后就需要用户再次授权，这样的频繁授权导致用户体验不好。
引入refreshToken，就解决了token设置时间比较长，容易泄露造成安全问题，设置时间比较短，又需要频繁让用户授权的矛盾。
#### 刷新过程
用户通过用户名和密码发送登录请求；
服务端验证，验证成功返回一个签名的 token和refreshToken 给客户端；
客户端储存token, 并且每次请求都会附带它；
服务端验证token 有效性并返回数据；
当服务端验证token即将失效，再返回数据的同时带一个即将过期的标志位通知客户端需要刷新令牌；
客户端收到刷新标志时，再下一次访问的时候携带token和refreshToken或者单独请求刷新接口；
服务端验证token即将过期且refreshToken有效性后返回新的token和请求数据；
客户端储存新token, 并且每次请求都会附带它。

#### 刷新过程 2
登录成功；
生成 token和refreshToken，只将token响应给接口，同时将 refreshToken 和 token 存给用户表；
token时效30min, refreshToken时效一天
前端每次请求接口，如果接口 响应头 里有token，就替换掉浏览器缓存上存的
接口收到请求校验token：
1.如果有效正常响应，并且更新token,refreshToken时效
2.如果token失效,用token查询对应的refreshToken，
  2.1如果refreshToken有效就用它来刷新token，
  2.2如果refreshToken失效 就返回 无效token，前端收到跳转登录

### 最终还是粗暴的设计: 后台系统token登陆，暂时不考虑用redis
登录时，将token与过期时间存到用户表，
校验token时，如果当前时间与token存的时间超过2小时，就过期，就清掉token和时间，重新登录。
如果有效就更新时间和token，并且从header响应出去，前端替换。

### 看看redis算了。。
登录时，将token与过期时间存到redis，
校验token时，如果当前时间与token存的时间超过2小时，就过期，就清掉token和时间，重新登录。
如果有效就更新时间和token，并且从header响应出去，前端替换。
参考文章：
https://www.runoob.com/redis/redis-install.html
https://www.cnblogs.com/huilinmumu/p/15979459.html
https://zhuanlan.zhihu.com/p/405936576
https://www.51cto.com/article/477692.html
使用： 
https://www.jianshu.com/p/8bb24a9a1649
https://www.jianshu.com/p/befdb525978d
https://www.cnblogs.com/ygunoil/p/15048238.html
https://zhuanlan.zhihu.com/p/405936576
这个靠谱：https://blog.csdn.net/dongkeai/article/details/127462318
