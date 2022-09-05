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