import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

import World from "./World/World";
import Postprocessing from "./Postprocessing";
import AssetManager from "./AssetManager";
import { resources } from "./resources";

// 运行时参数配置（集中管理动画、光照、环境与交互的可调项）
export interface ExperienceParams {
  // 当前速度（驱动车轮旋转、速度线强度等）
  speed: number;
  // 相机位置（用于动画过渡与交互限制）
  cameraPos: { x: number; y: number; z: number };
  // 是否处于相机动画中（动画中会暂时禁用OrbitControls）
  isCameraMoving: boolean;

  // 场景内局部发光颜色插值系数（0-1，用于地面灯带/局部发光渐入）
  lightAlpha: number;
  // 局部发光强度（与lightAlpha配合控制“点亮”的节奏与亮度）
  lightIntensity: number;

  // 环境贴图强度（整体环境光的明暗）
  envIntensity: number;
  // 环境贴图混合权重（夜/日等两张HDR的混合比例，0更偏envmap1，1更偏envmap2）
  envWeight: number;

  // 地面反射强度（用于反射材质/简化地面反射的整体亮度）
  reflectIntensity: number;
  // 地面灯片透明度（入场/冲刺时对“发光贴片”的显隐控制）
  lightOpacity: number;

  // 地面颜色插值用的辅助参数（用于逐帧改变量化后的地面颜色）
  floorLerpColor: number;
  // 车身环境贴图强度（冲刺时提升以增强金属质感）
  carBodyEnvIntensity: number;
  // 相机震动强度（0-1，提升速度时增加临场感）
  cameraShakeIntensity: number;

  // Bloom的亮度平滑，数值越大，发光门限平滑越明显
  bloomLuminanceSmoothing: number;
  // Bloom强度
  bloomIntensity: number;

  // 速度线透明度（0-1）
  speedUpOpacity: number;

  // 透视相机FOV（度数，冲刺时适当拉大以获得速度感）
  cameraFov: number;

  // Furina配色插值（0-1，用于角色模型颜色的渐变控制）
  furinaLerpColor: number;
  // 是否处于“冲刺模式”（用于切换一组动画/参数）
  isRushing: boolean;
  // 临时禁用交互（入场或切换模式时防止误触）
  disableInteract: boolean;
  // 是否启用Furina相关演示（通过URL hash判定）
  isFurina: boolean;
}

export default class Experience {
  // 挂载DOM容器（通过选择器传入）
  container: HTMLElement;
  // THREE核心对象（在 initThreeJS 中完成赋值）
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  // 全局时钟（驱动逐帧更新）
  clock!: THREE.Clock;
  // 轨道控制器（相机交互）
  controls!: OrbitControls;
  
  // 运行参数（集中在ExperienceParams）
  params: ExperienceParams;
  // 世界（业务级3D内容与过场动画集合）
  world: World | null = null;
  // 后处理管线（Bloom等）
  post: Postprocessing | null = null;
  // 资源管理器（统一加载gltf/hdr/纹理等）
  am: AssetManager | null = null;
  
  constructor(selector = "#sketch") {
    console.log('🚀 初始化原生THREE.js Experience...');
    
    // 获取容器
    this.container = document.querySelector(selector) as HTMLElement;
    if (!this.container) {
      throw new Error(`容器 ${selector} 未找到`);
    }

    // 初始化参数
    this.params = {
      speed: 0,
      cameraPos: { x: 0, y: 0.8, z: -11 },
      isCameraMoving: false,
      lightAlpha: 0,
      lightIntensity: 0,
      envIntensity: 0,
      envWeight: 0,
      reflectIntensity: 0,
      lightOpacity: 1,
      floorLerpColor: 0,
      carBodyEnvIntensity: 1,
      cameraShakeIntensity: 0,
      bloomLuminanceSmoothing: 1.6,
      bloomIntensity: 1,
      speedUpOpacity: 0,
      cameraFov: 33.4,
      furinaLerpColor: 0,
      isRushing: false,
      disableInteract: false,
      isFurina: window.location.hash === "#furina",
    };

    // 设置全局引用
    (window as any).experience = this;

    // 初始化THREE.js核心组件
    this.initThreeJS();
    
    // 异步初始化其他组件
    this.initializeAsync();
  }

  private initThreeJS() {
    console.log('🎮 初始化THREE.js核心组件...');
    
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("black");

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(
      this.params.cameraFov,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(
      this.params.cameraPos.x,
      this.params.cameraPos.y,
      this.params.cameraPos.z
    );
    this.camera.lookAt(0, 0.8, 0);

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.CineonToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    
    this.container.appendChild(this.renderer.domElement);

    // 创建时钟
    this.clock = new THREE.Clock();

    // 创建控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0.8, 0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI * 0.8;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 50;

    // 窗口大小调整
    window.addEventListener('resize', this.onResize.bind(this));

    console.log('✅ THREE.js核心组件初始化完成');
  }

  private async initializeAsync() {
    try {
      console.log('📦 开始异步初始化...');
      
      // 设置GLTF解码器
      await this.setupGLTFDecoder();
      
      // 创建资源管理器
      this.am = new AssetManager();
      
      // 过滤资源（如果不是Furina模式）
      let resourcesToLoad = resources;
      if (!this.params.isFurina) {
        resourcesToLoad = resourcesToLoad.filter(
          (item) => !["driving", "decal"].includes(item.name)
        );
      }
      
      // 加载资源
      await this.am.loadResources(resourcesToLoad);
      console.log('✅ 所有资源加载完成');
      
      // 创建World系统
      this.world = new World(this);
      
      // 创建后处理系统
      this.post = new Postprocessing(this);
      
      // 移除加载屏幕
      document.querySelector(".loader-screen")?.remove();
      
      // 开始动画循环
      this.animate();
      
      console.log('🎉 Experience初始化完成！');
      
    } catch (error) {
      console.error('❌ Experience初始化失败:', error);
      this.showError(error);
    }
  }

  private async setupGLTFDecoder() {
    try {
      console.log('🔧 设置GLTF Meshopt解码器...');
      
      // 创建GLTF加载器实例并设置解码器
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      
      console.log('✅ GLTF Meshopt解码器设置完成');
    } catch (error) {
      console.warn('⚠️ GLTF解码器设置失败:', error);
      throw error;
    }
  }

  private onResize() {
    // 更新相机
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    
    // 更新渲染器
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // 更新后处理
    this.post?.onResize();
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();
    
    // 更新控制器
    if (!this.params.isCameraMoving) {
      this.controls.update();
    } else {
      // 相机动画中，手动设置位置
      this.camera.position.set(
        this.params.cameraPos.x,
        this.params.cameraPos.y,
        this.params.cameraPos.z
      );
    }
    
    // 更新World
    this.world?.update(deltaTime, elapsedTime);
    
    // 渲染
    if (this.post) {
      this.post.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  private showError(error: any) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-family: monospace;
      z-index: 10000;
      max-width: 80%;
      text-align: center;
    `;
    errorDiv.innerHTML = `
      <h3>❌ 加载失败</h3>
      <p>原生THREE.js版本遇到问题</p>
      <pre style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 5px; overflow: auto; max-height: 200px;">
        ${error?.message || error}
      </pre>
    `;
    document.body.appendChild(errorDiv);
  }

  // 公共方法
  public dispose() {
    // 清理资源
    this.world?.dispose();
    this.post?.dispose();
    this.renderer.dispose();
    this.controls.dispose();
    window.removeEventListener('resize', this.onResize.bind(this));
  }
}