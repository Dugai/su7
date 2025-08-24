# 小米SU7网站特效复刻 - Vanilla版本

这是一个完整复刻了`example`文件夹功能的vanilla版本，基于Three.js和kokomi.js实现。

## 🎯 功能特点

### 核心功能
- ✅ 完整的3D汽车展示场景
- ✅ 平滑的相机入场动画
- ✅ 实时反射地面效果
- ✅ 动态环境光照系统
- ✅ 点击汽车触发加速特效
- ✅ 相机震动和后处理效果
- ✅ 背景音乐播放
- ✅ Furina角色驾驶动画（可选）

### 技术特点
- 🎨 自定义GLSL着色器
- 🌟 GSAP动画时间线控制
- 🎵 Howler.js音频播放
- 🖱️ 鼠标交互控制
- 📱 移动端适配
- 🔧 调试工具支持

## 📁 文件结构

```
src/Experience/
├── ExperienceVanilla.ts          # 主体验类（基于kokomi.js）
├── VanillaExperience.ts          # 入口文件
├── Debug.ts                      # 调试工具
├── PostprocessingVanilla.ts      # 后处理效果
├── resources.ts                  # 资源配置
├── Shaders/                      # 着色器文件
│   ├── DynamicEnv/              # 动态环境着色器
│   ├── ReflecFloor/             # 反射地面着色器
│   ├── Speedup/                 # 加速特效着色器
│   └── TestObject/              # 测试对象着色器
├── Utils/                        # 工具类
│   ├── meshReflectorMaterial.ts # 反射材质
│   └── CustomShaderMaterial.ts  # 自定义着色器材质
└── World/                        # 世界组件
    ├── WorldVanilla.ts          # 世界管理器
    ├── CarVanilla.ts            # 汽车组件
    ├── StartRoomVanilla.ts      # 起始房间
    ├── DynamicEnvVanilla.ts     # 动态环境
    ├── SpeedupVanilla.ts        # 加速特效
    ├── CameraShakeVanilla.ts    # 相机震动
    ├── FurinaVanilla.ts         # Furina角色
    └── TestObject.ts            # 测试对象
```

## 🚀 使用方法

### 方式一：在React应用中使用

1. 在主应用中点击"启动 Vanilla 版本"按钮
2. 系统会自动切换到vanilla版本
3. 等待资源加载完成
4. 享受3D体验

### 方式二：直接启动

```typescript
import ExperienceVanilla from './Experience/ExperienceVanilla';

// 创建体验实例
const experience = new ExperienceVanilla('#sketch');
```

### 方式三：使用入口文件

```typescript
import './Experience/VanillaExperience';
// 自动初始化整个体验
```

## 🎮 交互说明

### 基础操作
- **鼠标拖拽**：旋转相机视角
- **鼠标滚轮**：缩放视角
- **点击汽车**：触发加速特效模式
- **再次点击**：退出加速模式

### 特殊模式
- **Furina模式**：在URL后添加 `#furina`
  - 启用Furina角色驾驶动画
  - 汽车变为白色并添加贴花
- **调试模式**：在URL后添加 `#debug`
  - 显示lil-gui调试界面
  - 可实时调整各种参数

## 🎬 动画序列

### 入场动画（4秒）
1. **T0-T4秒**：相机从远处平滑移动到目标位置
2. **T1-T5秒**：光照从黑色渐变到白色
3. **T0.5-T4.5秒**：环境光强度逐渐增强
4. **T2.5-T7秒**：环境贴图权重混合

### 加速动画（6秒）
1. **T0-T2秒**：速度从0加速到4
2. **T2-T6秒**：速度从4加速到10
3. **T0-T1秒**：光照透明度降到0
4. **T0-T4秒**：地面和角色颜色变化
5. **T0-T1秒**：环境强度降到0.01
6. **T0-T2秒**：加速特效显示，FOV增加
7. **T1秒后**：切换到实时环境反射
8. **T1-T5秒**：最终视觉效果（震动、泛光等）

## 🎨 着色器详解

### 反射地面着色器 (ReflecFloor)
- **功能**：实现实时地面反射效果
- **特点**：
  - 基于菲涅尔反射
  - 支持动态法线扰动
  - LOD层级采样
  - 距离相关的扭曲效果

### 加速特效着色器 (Speedup)
- **功能**：创建速度线条特效
- **特点**：
  - 基于噪声的动态纹理
  - 颜色随机化生成
  - 速度相关的透明度
  - 边缘衰减效果

### 动态环境着色器 (DynamicEnv)
- **功能**：混合两个HDR环境贴图
- **特点**：
  - 权重控制的混合
  - 强度调节
  - 实时更新

## 🔧 参数配置

### 主要参数
```typescript
params = {
  speed: 0,                          // 动画速度
  cameraPos: { x: 0, y: 0.8, z: -11 }, // 相机位置
  isCameraMoving: false,             // 相机是否移动中
  lightAlpha: 0,                     // 光照透明度
  lightIntensity: 0,                 // 光照强度
  envIntensity: 0,                   // 环境光强度
  envWeight: 0,                      // 环境贴图权重
  reflectIntensity: 0,               // 反射强度
  carBodyEnvIntensity: 1,            // 车身环境映射强度
  cameraShakeIntensity: 0,           // 相机震动强度
  bloomIntensity: 1,                 // 泛光强度
  speedUpOpacity: 0,                 // 加速特效透明度
  cameraFov: 33.4,                   // 相机视野角度
  isRushing: false,                  // 是否处于加速状态
  disableInteract: false,            // 是否禁用交互
  isFurina: false,                   // 是否启用Furina模式
}
```

## 📚 依赖库

### 核心依赖
- **Three.js**: 3D图形渲染
- **kokomi.js**: Three.js高级封装框架
- **GSAP**: 动画时间线控制
- **Howler.js**: 音频播放
- **lil-gui**: 调试界面（可选）

### 着色器库
- **lygia**: GLSL函数库
- **furina**: 专用着色器函数
- **postprocessing**: 后处理效果

## 🎯 与原版对比

| 功能 | Example版本 | Vanilla版本 | 状态 |
|------|-------------|-------------|------|
| 基础场景 | ✅ | ✅ | 完全复刻 |
| 相机动画 | ✅ | ✅ | 完全复刻 |
| 反射地面 | ✅ | ✅ | 完全复刻 |
| 加速特效 | ✅ | ✅ | 完全复刻 |
| 音频播放 | ✅ | ✅ | 完全复刻 |
| Furina模式 | ✅ | ✅ | 完全复刻 |
| 调试工具 | ✅ | ✅ | 完全复刻 |
| 移动端适配 | ✅ | ✅ | 完全复刻 |

## 🔍 调试指南

### 开启调试模式
1. 在URL后添加 `#debug`
2. 刷新页面
3. 右侧会出现调试面板

### 调试功能
- 实时调整所有动画参数
- 控制相机位置和视角
- 调节光照和环境设置
- 监控性能数据

## 📝 开发注意事项

### 资源路径
确保以下资源文件存在于 `public` 目录：
- `audio/bgm.mp3` - 背景音乐
- `mesh/*.gltf` - 3D模型文件
- `texture/*.jpg|.webp|.hdr` - 纹理贴图

### 性能优化
- 使用LOD层级优化
- 智能的视锥体裁剪
- 纹理压缩和优化
- 实时阴影优化

### 浏览器兼容性
- 现代浏览器（Chrome 90+, Firefox 88+, Safari 14+）
- 支持WebGL 2.0
- 移动端浏览器优化

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

### 开发环境设置
1. 安装依赖：`npm install`
2. 启动开发服务器：`npm run dev`
3. 构建项目：`npm run build`

---

**🎉 享受这个精美的3D汽车展示体验吧！**
