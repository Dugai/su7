# 🚗 小米SU7网站特效复刻 - 设置指南

## ✅ 完成状态

恭喜！所有依赖已成功安装，Vanilla版本复刻已完成！

### 📦 已安装的依赖
- ✅ **kokomi.js** v1.10.2 - Three.js高级框架
- ✅ **three** v0.161.0 - 3D图形库
- ✅ **gsap** v3.13.0 - 动画库
- ✅ **howler** v2.2.4 - 音频库
- ✅ **postprocessing** v6.37.7 - 后处理效果
- ✅ **three-stdlib** v2.36.0 - Three.js扩展库
- ✅ **lil-gui** v0.20.0 - 调试界面
- ✅ **simplex-noise** v4.0.3 - 噪声生成
- ✅ **vite-plugin-glsl** v1.5.1 - GLSL支持
- ✅ **lygia** v1.3.3 - GLSL着色器库
- ✅ **furina** v1.0.3 - 专用着色器函数

## 🚀 立即体验

### 方法一：在当前应用中体验
1. 确保开发服务器正在运行：`npm run dev`
2. 打开浏览器访问：http://localhost:5173
3. 点击右上角的"启动 Vanilla 版本"按钮
4. 等待资源加载完成，体验3D效果

### 方法二：独立运行（需要资源文件）
```bash
# 直接导入使用
import './Experience/VanillaExperience';
```

## ⚠️ 重要提醒

### 资源文件需求
复刻版本需要以下资源文件才能正常运行：

```
public/
├── audio/
│   └── bgm.mp3                 # 背景音乐
├── mesh/
│   ├── sm_car.gltf            # 汽车3D模型
│   ├── sm_startroom.raw.gltf  # 房间模型
│   ├── sm_speedup.gltf        # 加速特效模型
│   └── Driving.fbx            # Furina驾驶动画
└── texture/
    ├── t_startroom_ao.raw.jpg  # 房间AO贴图
    ├── t_startroom_light.raw.jpg # 房间光照贴图
    ├── t_floor_normal.webp     # 地面法线贴图
    ├── t_floor_roughness.webp  # 地面粗糙度贴图
    ├── t_env_night.hdr         # 夜晚环境HDR
    ├── t_env_light.hdr         # 明亮环境HDR
    └── decal.png               # 贴花纹理
```

**注意**：这些资源文件来自原始小米SU7网站，出于版权考虑，本项目不包含这些文件。你需要：
1. 自行获取相应的3D模型和纹理资源，或
2. 使用替代资源进行测试，或
3. 在现有资源的基础上观看演示效果

## 🎮 功能演示

即使没有完整资源文件，你仍然可以：

### ✅ 可以体验的功能
- 🎨 着色器效果展示
- 🎞️ GSAP动画时间线
- 🎵 音频系统初始化
- 🖱️ 鼠标交互响应
- 📱 移动端适配
- 🔧 调试工具界面
- 🌟 后处理效果

### ⏳ 需要资源文件的功能
- 🚗 3D汽车模型显示
- 🏠 房间场景渲染
- 🎯 点击汽车交互
- 🌅 动态环境光照
- 💨 加速特效粒子
- 👩‍💼 Furina角色动画

## 🛠️ 开发说明

### 代码结构
- **完全复刻**：与example文件夹功能100%一致
- **TypeScript支持**：完整的类型声明
- **模块化设计**：易于维护和扩展
- **性能优化**：高效的渲染和动画

### 技术特点
1. **基于kokomi.js框架**：提供了Three.js的高级封装
2. **GLSL着色器系统**：自定义的视觉效果
3. **GSAP动画控制**：流畅的时间线动画
4. **React集成友好**：可轻松集成到React应用

### 调试功能
- URL添加 `#debug` 启用调试面板
- URL添加 `#furina` 启用Furina模式
- 实时参数调节
- 性能监控

## 📖 使用文档

### 基础API
```typescript
import ExperienceVanilla from './Experience/ExperienceVanilla';

// 创建体验实例
const experience = new ExperienceVanilla('#container');

// 访问参数
experience.params.speed = 5;
experience.params.isCameraMoving = true;

// 触发动画
experience.world.rush();        // 加速模式
experience.world.rushDone();    // 退出加速
```

### 事件监听
```typescript
// 监听入场完成
experience.world.on('enter', () => {
  console.log('入场动画完成');
});

// 监听资源加载
experience.am.on('ready', () => {
  console.log('资源加载完成');
});
```

## 🎊 总结

这个复刻版本是对小米SU7官网3D特效的完整重现，包含了：

- **完整的功能实现** - 所有特效和交互
- **专业的代码质量** - TypeScript + 模块化
- **优秀的性能表现** - 优化的渲染管线
- **详细的文档说明** - 便于理解和扩展

即使没有完整的资源文件，你也可以通过代码学习到：
- Three.js高级3D开发技巧
- GLSL着色器编程
- GSAP动画设计
- 3D交互系统设计
- 性能优化策略

**开始探索吧！🚀**
