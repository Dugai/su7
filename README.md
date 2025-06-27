# SU7 3D 展示

这是一个使用 Three.js 和 React 构建的 SU7 汽车 3D 展示项目。

## 功能特点

- 3D 模型展示
- 车轮旋转动画
- 交互式相机控制
- 场景光照效果

## 技术栈

- React
- Three.js
- TypeScript
- Vite

## 安装和运行

1. 克隆项目

```bash
git clone [your-repository-url]
```

2. 安装依赖

```bash
npm install
```

3. 运行开发服务器

```bash
npm run dev
```

4. 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
  ├── components/     # React 组件
  │   ├── Scene.tsx  # 主场景组件
  │   ├── Camera.ts  # 相机管理
  │   ├── Lights.ts  # 灯光管理
  │   ├── Ground.ts  # 地面管理
  │   └── Car.ts     # 汽车模型管理
  ├── utils/         # 工具函数
  │   └── ModelLoader.ts  # 模型加载器
  └── App.tsx        # 主应用组件
```

## 许可证

MIT
