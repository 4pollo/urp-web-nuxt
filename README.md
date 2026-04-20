# URP Nuxt.js 项目

企业级 RBAC 权限管理系统 - Nuxt.js 版本

## 快速开始

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env` 文件：

```bash
VITE_API_BASE_URL=http://localhost:3001
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm run preview
```

## 项目状态

当前迁移进度：**60%**

- ✅ 基础设施搭建
- ✅ 状态管理重构
- ✅ 组件库替换（部分）
- ✅ 认证页面迁移
- ⏳ 管理后台页面（待完成）
- ⏳ 业务组件（待完成）

详细迁移报告请查看 [MIGRATION_REPORT.md](./MIGRATION_REPORT.md)

## 技术栈

- **框架**: Nuxt 3.13.0
- **UI 框架**: Vue 3.5.0
- **状态管理**: Pinia
- **样式**: Tailwind CSS
- **图标**: Lucide Vue Next
- **主题**: @nuxtjs/color-mode
- **TypeScript**: 5.7.3

## 项目结构

```
urp-web-nuxt/
├── app.vue                 # 根组件
├── nuxt.config.ts          # Nuxt 配置
├── pages/                  # 页面路由
├── components/             # Vue 组件
├── composables/            # Vue Composables
├── stores/                 # Pinia Stores
├── middleware/             # 路由中间件
├── lib/                    # 工具库
└── assets/                 # 静态资源
```

## 可用页面

- `/` - 首页（重定向到登录）
- `/login` - 登录页面
- `/register` - 注册页面
- `/dashboard` - 控制台（需要认证）

## 开发说明

### 认证流程

1. 用户在 `/login` 或 `/register` 页面提交表单
2. `useAuth` composable 处理认证逻辑
3. Token 存储在 LocalStorage
4. `middleware/auth.ts` 保护需要认证的路由
5. `stores/permissions.ts` 管理用户权限

### 添加新页面

1. 在 `pages/` 目录创建 `.vue` 文件
2. 如需认证保护，添加：
   ```vue
   <script setup>
   definePageMeta({
     middleware: 'auth'
   });
   </script>
   ```

### 使用权限系统

```vue
<script setup>
const permissionsStore = usePermissionsStore();
const { hasPermission } = permissionsStore;

// 检查权限
if (hasPermission('user:create')) {
  // 显示创建用户按钮
}
</script>
```

## 待完成功能

- [ ] 管理后台页面（用户/角色/权限）
- [ ] 用户中心页面
- [ ] AppShell 主布局组件
- [ ] Toast 通知系统
- [ ] 全局搜索组件
- [ ] 完整的 UI 组件库

## License

MIT
