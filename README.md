# 🎨 海报编辑器 (Poster Editor)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16.0+-339933?logo=node.js)](https://nodejs.org/)

一个完全免费、功能强大、操作简单的在线海报编辑器，让每个人都能轻松制作出专业级的设计作品！

## ✨ 项目特色

### 🎯 零门槛设计
- **直观操作界面**：拖拽、点击即可完成设计
- **实时预览**：所见即所得的编辑体验
- **智能布局**：工具按功能分组，操作流程清晰

### 🛠️ 功能完整
- ✅ **文字编辑**：添加、编辑、样式调整
- ✅ **图片处理**：上传、缩放、旋转、透明度
- ✅ **图形绘制**：矩形、圆形、三角形、线条
- ✅ **画布管理**：多种预设尺寸，自定义背景
- ✅ **项目管理**：保存、加载、撤销、重做
- ✅ **导出功能**：PNG、JPEG、PDF 多格式导出

### 🚀 技术亮点
- **AI驱动开发**：使用 Qwen3-Coder 一天完成
- **现代化架构**：React + Node.js 技术栈
- **响应式设计**：支持多种屏幕尺寸
- **高性能渲染**：流畅的实时编辑体验

## 🖼️ 功能展示

### 主界面
```
┌─────────────────────────────────────────────────────────────┐
│ 🎨海报编辑器 │ 画布预设▼ │ 删除 撤销 重做 复制 粘贴 │ 保存 加载 │ 导出▼ 帮助 │
├─────────────────────────────────────────────────────────────┤
│ 创建工具      │                                              │
│ ├─📝添加文字   │                                              │
│ ├─🖼️添加图片   │           主画布区域                          │
│ 图形工具      │        (拖拽、缩放、旋转)                      │
│ ├─📦矩形🔵圆形 │                                              │
│ ├─🔺三角➖线条 │                                              │
│ 背景设置      │                                              │
│ ├─⚪纯色🌈渐变 │                                              │ 
│ └─🖼️图片背景   │                                              │
└─────────────────────────────────────────────────────────────┘
```

### 支持的画布尺寸
- **A4/A3**：适合打印文档
- **海报尺寸**：小、中、大三种规格
- **社交媒体**：Instagram、微信朋友圈等
- **自定义尺寸**：100px - 5000px 范围内任意设置

## 🚀 快速开始

### 环境要求
- Node.js 16.0+ 
- npm 或 yarn
- 现代浏览器 (Chrome、Firefox、Safari、Edge)

### 安装与运行

#### 方式一：使用服务脚本 (推荐)

**macOS/Linux:**
```bash
# 克隆项目
git clone https://github.com/wxt2rr/poster-editer
cd poster-editer

# 一键启动
./dev start

# 其他命令
./dev stop      # 停止服务
./dev restart   # 重启服务
./dev logs      # 查看日志
./dev open      # 打开浏览器
```

**Windows:**
```cmd
# 克隆项目
git clone https://github.com/wxt2rr/poster-editer
cd poster-editer

# 启动服务
service.bat start

# 或使用 Node.js 版本
node service.js start
```

#### 方式二：手动启动
```bash
# 克隆项目
git clone https://github.com/wxt2rr/poster-editer
cd poster-editer

# 安装依赖
cd client
npm install

# 启动开发服务器
npm start
```

### 访问应用
启动成功后，浏览器会自动打开 `http://localhost:3000`

## 📋 技术栈

### 前端
- **React 18+** - 现代化UI框架
- **React DnD** - 拖拽功能实现
- **CSS3** - 现代化样式和动画
- **Canvas API** - 图形渲染和导出

### 工具库
- **jsPDF** - PDF导出功能
- **HTML2Canvas** - 图像导出功能

### 开发工具
- **Create React App** - 项目脚手架
- **ESLint** - 代码质量检查
- **Qwen3-Coder** - AI编程助手

## 📁 项目结构

```
poster-editer/
├── client/                 # 前端应用
│   ├── public/             # 静态资源
│   ├── src/
│   │   ├── components/     # React 组件
│   │   │   ├── Editor.js           # 主编辑器
│   │   │   ├── Toolbar.js          # 顶部工具栏
│   │   │   ├── LeftPanel.js        # 左侧工具面板
│   │   │   ├── RightPanel.js       # 右侧属性面板
│   │   │   ├── CanvasArea.js       # 画布区域
│   │   │   ├── CanvasElement.js    # 画布元素
│   │   │   ├── BottomBar.js        # 底部状态栏
│   │   │   └── Editor.css          # 样式文件
│   │   ├── App.js          # 应用入口
│   │   └── index.js        # 渲染入口
│   ├── package.json        # 依赖管理
│   └── README.md           # 前端说明
├── service.sh              # macOS/Linux 服务脚本
├── service.bat             # Windows 服务脚本  
├── service.js              # Node.js 跨平台服务脚本
├── dev                     # 开发快捷脚本
├── 需求文档.md               # 项目需求文档
├── 开发进度总结.md           # 开发进度记录
├── 错误修复总结.md           # 问题修复记录
└── README.md               # 项目说明文档
```

## 🎯 使用指南

### 基本操作
1. **添加文字**：点击"添加文字"按钮，在画布上点击输入
2. **上传图片**：点击"添加图片"或拖拽图片到上传区域
3. **绘制图形**：选择图形工具，在画布上拖拽创建
4. **编辑对象**：点击选中，拖拽控制点进行缩放旋转
5. **设置背景**：在左侧面板选择背景类型和样式

### 快捷键
- `Ctrl/Cmd + Z` - 撤销
- `Ctrl/Cmd + Y` - 重做  
- `Ctrl/Cmd + C` - 复制
- `Ctrl/Cmd + V` - 粘贴
- `Delete` - 删除选中对象

### 导出作品
1. 点击顶部"导出"按钮
2. 选择导出格式：PNG、JPEG、PDF
3. 选择导出质量：标准、高清2倍、高清3倍
4. 自动下载到本地

## 🔧 服务管理

项目提供了多种服务管理方式：

### 服务脚本功能
```bash
# 通用命令
./dev <command>

# 可用命令
start (s)    - 启动服务
stop         - 停止服务  
restart (r)  - 重启服务
status       - 查看状态
logs (l)     - 查看日志
open (o)     - 打开浏览器
```

### 服务特性
- **自动端口检测**：避免端口冲突
- **后台运行**：支持 nohup 后台模式
- **日志记录**：完整的操作日志
- **跨平台**：Windows、macOS、Linux 全支持

## 🎨 设计理念

### 用户体验优先
- **直觉操作**：符合用户习惯的交互设计
- **视觉反馈**：清晰的操作状态和结果提示
- **性能优化**：流畅的实时渲染和响应

### 功能完整性
- **专业工具**：满足基本到进阶的设计需求
- **格式支持**：多种导入导出格式
- **兼容性**：跨浏览器、跨平台支持

## 🐛 问题反馈

如果在使用过程中遇到问题，请：

1. **检查环境**：确保Node.js版本 >= 16.0
2. **查看日志**：运行 `./dev logs` 查看详细日志
3. **浏览器兼容**：推荐使用 Chrome、Edge 等现代浏览器
4. **提交Issue**：在GitHub上提交问题反馈

## 🤝 贡献指南

欢迎贡献代码和建议！

### 开发环境
```bash
# Fork 项目后克隆
git clone https://github.com/yourusername/poster-editer
cd poster-editer

# 安装依赖
cd client && npm install

# 启动开发服务器
npm start
```

### 提交规范
- 功能：`feat: 添加新功能`
- 修复：`fix: 修复问题`
- 文档：`docs: 更新文档`
- 样式：`style: 样式调整`

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证，可自由使用、修改和分发。

## 🙏 致谢

- **Qwen3-Coder** - 强大的AI编程助手
- **React 社区** - 优秀的前端框架和生态
- **开源社区** - 各种优秀的开源库支持

---

## 🌟 Star History

如果这个项目对你有帮助，请给个 Star ⭐️

---

**📧 联系方式**  
如有问题或建议，欢迎通过 GitHub Issues 联系我们。
