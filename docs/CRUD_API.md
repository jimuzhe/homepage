# 个人主页管理系统 - 细粒度 CRUD API 文档

## 概述

本文档描述了个人主页管理系统的细粒度CRUD API接口。这些API允许对JSON配置文件的各个部分进行精确的增删改查操作，而不需要每次都保存整个配置文件。

**基础信息：**
- 基础URL: `http://localhost:3001`
- 数据格式: JSON
- 字符编码: UTF-8
- 版本: v2.1.0

## 设计理念

- **细粒度操作**: 每个API只操作配置文件的特定部分
- **独立保存**: 每个页面的保存按钮只更新对应的数据
- **数据库思维**: 将JSON文件作为数据库，提供类似数据库的CRUD操作
- **性能优化**: 避免频繁读写整个配置文件

## API 分类

### 1. 个人信息 API

#### 获取个人信息
```http
GET /api/profile
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "name": "张三",
    "title": "前端开发工程师",
    "description": "个人简介...",
    "avatar": "头像URL",
    "backgroundImage": "背景图片URL",
    "backgroundVideo": "背景视频URL",
    "backgroundType": "image",
    "profileBackground": "个人资料背景URL",
    "profileBackgroundType": "image",
    "id": "冀ICP备2024085708号",
    "siteStart": "2025-07-28"
  },
  "message": "个人信息获取成功"
}
```

#### 更新个人信息
```http
PUT /api/profile
Content-Type: application/json

{
  "name": "李四",
  "title": "全栈开发工程师",
  "description": "更新的个人简介...",
  "avatar": "新头像URL"
}
```

### 2. 联系信息 API

#### 获取联系信息
```http
GET /api/contact
```

#### 更新联系信息
```http
PUT /api/contact
Content-Type: application/json

{
  "email": "new@example.com",
  "phone": "+86 139-0000-0000",
  "address": "上海市浦东新区"
}
```

### 3. 技能管理 API

#### 获取技能列表
```http
GET /api/skills
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "name": "JavaScript",
      "level": "精通"
    },
    {
      "name": "Python",
      "level": "熟悉"
    }
  ],
  "message": "技能列表获取成功"
}
```

#### 添加新技能
```http
POST /api/skills
Content-Type: application/json

{
  "name": "Vue.js",
  "level": "掌握"
}
```

#### 更新指定技能
```http
PUT /api/skills/0
Content-Type: application/json

{
  "name": "JavaScript",
  "level": "精通"
}
```

#### 删除指定技能
```http
DELETE /api/skills/0
```

### 4. 项目管理 API

#### 获取项目列表
```http
GET /api/projects
```

#### 添加新项目
```http
POST /api/projects
Content-Type: application/json

{
  "name": "个人博客系统",
  "desc": "基于Vue.js开发的个人博客",
  "icon": "fas fa-blog",
  "url": "https://blog.example.com"
}
```

#### 更新指定项目
```http
PUT /api/projects/0
Content-Type: application/json

{
  "name": "更新的项目名称",
  "desc": "更新的项目描述",
  "icon": "fas fa-code",
  "url": "https://updated.example.com"
}
```

#### 删除指定项目
```http
DELETE /api/projects/0
```

### 5. 友情链接管理 API

#### 获取友情链接列表
```http
GET /api/friendlinks
```

#### 添加新友情链接
```http
POST /api/friendlinks
Content-Type: application/json

{
  "name": "技术博客",
  "url": "https://tech.example.com",
  "icon": "https://tech.example.com/favicon.ico",
  "description": "优质技术分享"
}
```

#### 更新指定友情链接
```http
PUT /api/friendlinks/0
Content-Type: application/json

{
  "name": "更新的友链名称",
  "url": "https://updated.example.com",
  "icon": "新图标URL",
  "description": "更新的描述"
}
```

#### 删除指定友情链接
```http
DELETE /api/friendlinks/0
```

### 6. 社交链接 API

#### 获取社交链接
```http
GET /api/sociallinks
```

#### 更新社交链接
```http
PUT /api/sociallinks
Content-Type: application/json

[
  {
    "name": "GitHub",
    "url": "https://github.com/username"
  },
  {
    "name": "微博",
    "url": "https://weibo.com/username"
  }
]
```

### 7. 音乐配置 API

#### 获取音乐配置
```http
GET /api/music
```

#### 更新音乐配置
```http
PUT /api/music
Content-Type: application/json

{
  "currentSongId": "1933659329",
  "playlist": ["1933659329", "1974443815", "1901371647"]
}
```

### 8. 背景配置 API

#### 获取背景配置
```http
GET /api/background
```

#### 更新背景配置
```http
PUT /api/background
Content-Type: application/json

{
  "profileImage": "https://example.com/new-background.jpg"
}
```

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2025-07-30T22:51:54.615000"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误类型",
  "message": "具体错误信息"
}
```

## 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 认证失败 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 使用示例

### JavaScript 示例

```javascript
// 更新个人信息
async function updateProfile(profileData) {
  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('更新个人信息失败:', error);
    return { success: false, message: error.message };
  }
}

// 添加新技能
async function addSkill(skillData) {
  try {
    const response = await fetch('/api/skills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skillData)
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('添加技能失败:', error);
    return { success: false, message: error.message };
  }
}

// 删除项目
async function deleteProject(index) {
  try {
    const response = await fetch(`/api/projects/${index}`, {
      method: 'DELETE'
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('删除项目失败:', error);
    return { success: false, message: error.message };
  }
}
```

## 优势

1. **性能优化**: 只更新需要修改的数据部分
2. **操作精确**: 避免意外覆盖其他数据
3. **并发安全**: 减少多用户同时编辑的冲突
4. **易于维护**: 每个功能模块独立管理
5. **用户体验**: 保存操作更快，响应更及时

## 注意事项

1. **数组索引**: 删除数组元素后，后续元素的索引会发生变化
2. **数据验证**: 每个API都会验证必要的字段
3. **错误处理**: 建议在前端实现完善的错误处理机制
4. **数据同步**: 前端需要在操作成功后更新本地数据状态
