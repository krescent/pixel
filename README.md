# 🎨 拼豆图样生成器

一个将图片转换为拼豆 (Perler Beads) 图样的在线工具。

![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

## 功能特点

- 📤 **图片上传**: 支持拖拽或点击上传图片
- 🎯 **可调节取景框**: 拖动蓝色取景框选择图片区域
- 🎚️ **像素控制**: 滑轨控制输出像素数量 (20-100)
- 🎨 **多色板支持**: 支持 MARD 221色等多种色板
- 🖼️ **透明/填充**: 可选择透明区域或填充白色
- 📊 **图样统计**: 显示拼豆总数、使用颜色清单
- 📥 **PNG下载**: 一键下载拼豆图样
- 📱 **响应式设计**: 适配桌面端和移动端

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 技术栈

- **前端框架**: React 19
- **类型系统**: TypeScript
- **构建工具**: Vite
- **样式方案**: Tailwind CSS 4
- **包管理器**: pnpm

## 使用说明

1. 在左侧上传图片
2. 拖动蓝色取景框调整区域
3. 调整滑轨控制像素数
4. 选择拼豆尺寸
5. 选择颜色品牌
6. 选择透明/填充模式
7. 点击下载保存图样

## 项目结构

```
src/
├── App.tsx              # 主应用组件
├── components/
│   ├── ImageUploader.tsx    # 图片上传 + 取景框
│   ├── PerlerGrid.tsx       # 拼豆网格显示
│   ├── Controls.tsx          # 控制面板
│   └── DownloadButton.tsx    # 下载按钮
├── utils/
│   └── perlerColors.ts      # Perler 颜色库
├── hooks/
│   └── useImageProcessor.ts  # 图片处理
└── main.tsx               # 入口文件
```

## 许可证

MIT
