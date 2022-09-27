### blog_server api
#### article
|  url  |  methods  |  params  |  desc  |
|  :----:  | :----:  | :----:  | :----:  |
|  /article_list | get | { pageSize,pageNum,type,tag,keyword,year,month } | 文章列表 |
|  /article_all_list | get | -- | 文章列表（所有） |
|  /article_detail | get | { id } | 文章详情 |
|  /add_article | post | { title, author, extra_title, banner, tags, content, git, id(编辑带id) } | 新增编辑文章 |
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
#### articles
|  Field  |  Type  |  Null  |  Key  |  Default  | Extra |
|  :----: | :----: | :----: | :----:  | :----: | :----: |
|  id | int unsigned | no | pri | null | auto_increment |
|  title | varchar(100) | no | -- | null | -- |
|  author | varchar(30) | no | -- | null | -- |
|  extra_title | varchar(100) | no | -- | null | -- |
|  banner | varchar(100) | no | -- | null | -- |
|  tags | varchar(100) | no | -- | null | -- |
|  content | longtext | no | -- | null | -- |
|  git | varchar(100) | no | -- | null | -- |
|  views | int | yes | -- | 0 | -- |
|  likes | int | yes | -- | 0 | -- |
|  create_time | datetime | yes | -- | current_timestamp | default_generated |
|  update_time | datetime | yes | -- | current_timestamp | default_generated |

#### tags
|  Field  |  Type  |  Null  |  Key  | Default | Extra |
|  :----: | :----: | :----: | :----: | :----: | :----: |
|  id | int unsigned | no | pri | null | auto_increment |
|  name | varchar(40) | no | uni | null | -- |
|  color | varchar(100) | no | -- | null | -- |
|  icon | varchar(100) | no | -- | null | -- |


#### article_tag
|  Field  |  Type  |  Null  |  Key  | Default | Extra |
|  :----: | :----: | :----: | :----: | :----: | :----: |
|  id | int unsigned | no | pri | null | auto_increment |
|  article_id | int | no | uni | null | -- |
|  tag_id | int | no | -- | null | -- |
|  tag_name | varchar(40) | no | -- | null | -- |
#### article_tag 关系表逻辑梳理
1.文章查询显示标签的时候，可能要获取标签的其他信息显示，文章表的一个字段无法存。
2.删除标签时，要干掉文章表里的该标签
3.新增文章时，文章添加几个标签，就往关系表存几条数据.
4.删除文章时，根据文章id, 删除关联表里的所有文章id与之相等的数据。

### helper
cmd：
1. mysql -u root -p
2. ******
命令：
show databases;  // 显示所有数据库
create database xxx; // 创建数据库
use xxx; // 进入数据库
// 创建表 tags
create table if not exists `tags` (`id` int unsigned auto_increment, `name` varchar(40) not null,  `color` varchar(100) not null, primary key(`id`))engine=InnoDB Default charset=utf8;

vscode 连接 mysql 修改一下密码
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY ******;

INSERT INTO tags (name, color) VALUES ("vue", "red");

CREATE TABLE tags(id INT NOT NULL AUTO_INCREMENT, name VARCHAR(40) NOT NULL, color VARCHAR(100) NOT NULL, icon VARCHAR(100) NOT NULL, create_time DATE, update_time DATE, PRIMARY KEY ( id ))ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE articles(id INT NOT NULL AUTO_INCREMENT, title VARCHAR(100) NOT NULL, extra_title VARCHAR(100) NOT NULL, banner VARCHAR(100) NOT NULL, tags VARCHAR(100) NOT NULL, content BIGINT NOT NULL,git VARCHAR(100) NOT NULL , views INT, likes INT, create_time DATE, update_time DATE, PRIMARY KEY ( id ))ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE article_tag(id INT NOT NULL AUTO_INCREMENT,  article_id INT NOT NULL, tag_id INT NOT NULL, PRIMARY KEY ( id ))ENGINE=InnoDB DEFAULT CHARSET=utf8;
//修改列属性
ALTER TABLE articles CHANGE COLUMN id
id INT UNSIGNED AUTO_INCREMENT;

alter table tags change column name
name varchar(40) not NULL unique;

#### refreshToken机制
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

