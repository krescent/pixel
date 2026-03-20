# AGENTS.md

## 项目概述
- **项目名称**: Pixel - 拼豆图样生成器
- **技术栈**: React 19 + TypeScript + Vite + Tailwind CSS 4
- **包管理器**: pnpm

## 开发环境设置

### 安装依赖
```bash
pnpm install
```

### 运行开发服务器
```bash
pnpm dev
```

### 构建生产版本
```bash
pnpm build
```

### 预览生产版本
```bash
pnpm preview
```

### 代码检查和格式化
```bash
pnpm lint        # ESLint 检查
pnpm typecheck   # TypeScript 类型检查
```

## 代码风格指南

### 组件结构
- 使用函数组件 + TypeScript 接口定义 props
- Props 接口命名: `{ComponentName}Props`
- 组件文件: PascalCase.tsx

### 导入顺序
1. React 相关 (`react`, `react-dom`)
2. 第三方库
3. 内部模块 (相对于导入)
4. 类型定义
5. 样式文件

### 命名约定
- 组件: PascalCase
- 函数/变量: camelCase
- 常量: UPPER_SNAKE_CASE
- 类型/接口: PascalCase (前缀 `I` 可选)

### 状态管理
- 使用 React hooks (useState, useEffect, useCallback, useMemo)
- 避免不必要的 useEffect 依赖
- 优先使用 useCallback 包装事件处理函数

### 错误处理
- 使用 try-catch 处理异步操作
- 显示用户友好的错误消息
- 记录错误到控制台用于调试

### Tailwind CSS 使用
- 使用 Tailwind 4 的 @import "tailwindcss"
- 优先使用 Tailwind 工具类
- 复杂样式使用 @apply 提取为工具类
- 响应式设计使用 sm/md/lg 前缀

## Perler 颜色系统

### 颜色定义
- 位置: `src/utils/perlerColors.ts`
- 使用 RGB 数组定义每个颜色
- 颜色名称使用标准 Perler 命名

### 颜色匹配算法
- 使用欧几里得距离计算 RGB 颜色差异
- 选择距离最小的 Perler 颜色
- 权重: R:G:B = 0.3:0.59:0.11 (人眼敏感度)

## 图像处理流程

1. 用户上传图片
2. 使用 Canvas 读取图像数据
3. 按比例缩放到目标尺寸 (短边由滑轨控制)
4. 对每个像素进行颜色量化
5. 渲染拼豆网格显示

## 文件结构
```
src/
├── App.tsx              # 主应用组件
├── components/
│   ├── ImageUploader.tsx    # 图片上传组件
│   ├── PerlerGrid.tsx       # 拼豆网格显示
│   └── Controls.tsx         # 控制面板 (滑轨、尺寸选择)
├── utils/
│   ├── perlerColors.ts     # Perler 90色色板
│   └── colorMatching.ts    # 颜色匹配算法
├── hooks/
│   └── useImageProcessor.ts # 图片处理 Hook
├── index.css             # 全局样式 + Tailwind
└── main.tsx             # 应用入口
```

## 提交规范
- 使用语义化提交信息
- 功能: `feat: add xxx`
- 修复: `fix: fix xxx`
- 重构: `refactor: improve xxx`
- 样式: `style: update xxx`
- 文档: `docs: update xxx`
