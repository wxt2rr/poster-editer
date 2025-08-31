# 海报编辑器 - 在线设计工具

一个功能完整的在线海报编辑器，支持文字、图片、图形等元素的自由组合，具备专业的编辑功能和导出能力。

## ✨ 核心功能

- 🎨 **丰富的创作工具** - 文字、图片、基本图形绘制
- 🖱️ **直观的操作体验** - 拖拽、缩放、旋转、对齐
- 🎯 **智能图层管理** - 可视化图层面板，支持锁定和隐藏
- 🌈 **多样的背景选择** - 纯色、渐变、图片三种背景类型
- 📤 **专业的导出功能** - PNG、JPG、PDF高清导出
- 💾 **项目保存加载** - JSON格式项目文件支持
- ⌨️ **完整的快捷键** - 撤销重做、复制粘贴、位置微调

## 🚀 快速开始

### 方法一：使用一键启动脚本（推荐）

在项目根目录运行：

```bash
# 启动服务
./dev start
# 或
./dev s

# 查看状态
./dev status
# 或
./dev st

# 停止服务
./dev stop
# 或
./dev x
```

### 方法二：使用服务管理脚本

```bash
# Node.js版本（跨平台）
node service.js start

# Shell版本（macOS/Linux）
./service.sh start

# Windows批处理版本
service.bat start
```

### 方法三：传统方式

```bash
cd client
npm install
npm start
```

服务启动后访问：http://localhost:3000

## 📖 详细使用说明

### 开发命令

| 快捷命令 | 完整命令 | 功能说明 |
|---------|---------|---------|
| `./dev s` | `./dev start` | 启动开发服务器 |
| `./dev x` | `./dev stop` | 停止服务 |
| `./dev r` | `./dev restart` | 重启服务 |
| `./dev st` | `./dev status` | 查看运行状态 |
| `./dev l` | `./dev logs` | 查看实时日志 |
| `./dev c` | `./dev clean` | 清理日志文件 |
| `./dev i` | `./dev install` | 安装依赖 |
| `./dev b` | `./dev build` | 构建生产版本 |
| `./dev o` | `./dev open` | 打开浏览器 |

### 编辑器快捷键

- `Ctrl+Z` - 撤销
- `Ctrl+Y` - 重做  
- `Ctrl+C/V` - 复制/粘贴
- `Delete` - 删除选中元素
- `↑↓←→` - 微调元素位置
- `Ctrl+S` - 保存项目

## 📁 项目结构

```
poster-editer/
├── client/                 # React前端项目
│   ├── src/
│   │   ├── components/     # React组件
│   │   │   ├── Editor.js          # 主编辑器
│   │   │   ├── CanvasArea.js      # 画布区域
│   │   │   ├── CanvasElement.js   # 画布元素
│   │   │   ├── Toolbar.js         # 工具栏
│   │   │   ├── LeftPanel.js       # 左侧面板
│   │   │   ├── RightPanel.js      # 右侧面板
│   │   │   └── BottomBar.js       # 底部状态栏
│   │   └── App.js          # 应用主组件
│   └── package.json        # 依赖配置
├── service.js              # Node.js服务管理脚本
├── service.sh              # Shell服务管理脚本
├── service.bat             # Windows批处理脚本
├── dev                     # 开发快捷脚本
└── README.md               # 项目说明
```

## 🛠️ 技术栈

- **前端框架**: React 19+
- **拖拽功能**: React DnD
- **导出功能**: html2canvas + jsPDF
- **构建工具**: Create React App
- **开发工具**: Node.js服务管理脚本

## 📋 功能特性

### 画布管理
- ✅ 多种预设尺寸（A4、A3、海报、社交媒体等）
- ✅ 自定义画布尺寸
- ✅ 缩放控制（放大、缩小、适应、实际大小）
- ✅ 背景设置（纯色、渐变、图片）

### 元素编辑
- ✅ 文字：字体、大小、颜色、样式、对齐
- ✅ 图片：真实文件上传、智能尺寸调整
- ✅ 图形：矩形、圆形、三角形、线条
- ✅ 变换：拖拽、缩放、旋转、复制

### 高级功能
- ✅ 图层管理：排序、锁定、隐藏
- ✅ 智能对齐：辅助线、吸附对齐
- ✅ 多选操作：框选、批量编辑
- ✅ 撤销重做：完整的历史记录

### 导出选项
- ✅ 图片格式：PNG、JPG（支持高清导出）
- ✅ 文档格式：PDF
- ✅ 项目文件：JSON格式保存/加载

## 🔧 开发指南

### 环境要求
- Node.js 14+
- npm 6+

### 开发流程
1. 克隆项目：`git clone [repository]`
2. 启动服务：`./dev start`
3. 开始开发：访问 http://localhost:3000
4. 构建项目：`./dev build`

### 代码结构
- **组件化设计**：功能模块清晰分离
- **状态管理**：使用React Hooks管理状态
- **事件处理**：完整的用户交互支持
- **跨平台兼容**：支持多种操作系统

## 🎯 使用场景

- 📊 **营销海报**：促销活动、产品宣传
- 📱 **社交媒体**：Instagram、Facebook配图
- 📄 **文档设计**：简历封面、报告首页
- 🎉 **活动邀请**：聚会邀请函、会议通知
- 🏢 **企业宣传**：公司介绍、品牌展示

## 📞 技术支持

- 查看详细文档：`服务管理脚本使用说明.md`
- 问题排查：检查 `poster-editor.log` 日志文件
- 开发调试：使用 `./dev logs` 查看实时日志

---

**注意**: 推荐使用 `./dev` 快捷脚本进行日常开发，它提供了最便捷的服务管理体验。

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
