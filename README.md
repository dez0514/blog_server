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
#### articles
|  Field  |  Type  |  Null  |  Key  |  Default  | Extra |
|  :----: | :----: | :----: | :----:  | :----: | :----: |
|  id | int unsigned | no | pri | null | auto_increment |
|  title | varchar(100) | no | -- | null | -- |
|  author | varchar(30) | no | -- | null | -- |
|  extra_title | varchar(100) | no | -- | null | -- |
|  banner | varchar(100) | no | -- | null | -- |
<!-- |  tags | varchar(100) | no | -- | null | -- | -->
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
#### article_tag 关系表逻辑梳理
1. 文章表里不需要标签任何信息
2. 标签表里不需要文章的任何信息
3. 关联表里保存文章id 和 标签id, 多对多。
4. 文章增删改时 同时操作关联表
5. 标签增删改时 同时操作关联表
6. 查询时 利用 左右连接 查询 关联表

### mysql & database helper
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

// 入门级sql要会啊...
lef join, right join, 临时表
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

