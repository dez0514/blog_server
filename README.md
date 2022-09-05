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


#### relation_article_tag
|  Field  |  Type  |  Null  |  Key  | Default | Extra |
|  :----: | :----: | :----: | :----: | :----: | :----: |
|  id | int unsigned | no | pri | null | auto_increment |
|  article_id | int | no | uni | null | -- |
|  tag_id | int | no | -- | null | -- |

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

CREATE TABLE relation_article_tag(id INT NOT NULL AUTO_INCREMENT,  article_id INT NOT NULL, tag_id INT NOT NULL, PRIMARY KEY ( id ))ENGINE=InnoDB DEFAULT CHARSET=utf8;
//修改列属性
ALTER TABLE articles CHANGE COLUMN id
id INT UNSIGNED AUTO_INCREMENT;

alter table tags change column name
name varchar(40) not NULL unique;