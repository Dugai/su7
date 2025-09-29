import * as THREE from "three";
import gsap from "gsap";
import type Experience from "../Experience";

export interface DynamicEnvConfig {
  envmap1: THREE.Texture;
  envmap2: THREE.Texture;
}

export default class DynamicEnv {
  experience: Experience;
  config: DynamicEnvConfig;
  
  private _fbo: THREE.WebGLRenderTarget;
  private _material: THREE.ShaderMaterial;
  private _quad: THREE.Mesh;
  private _camera: THREE.OrthographicCamera;
  private _scene: THREE.Scene;
  
  constructor(experience: Experience, config: DynamicEnvConfig) {
    this.experience = experience;
    this.config = config;
    
    console.log('🌅 创建动态环境系统...');
    
    this.init();
  }
  
  private init() {
    const envData = this.config.envmap1.source?.data;
    const width = envData?.width || 1024;
    const height = envData?.height || 512;
    
    // 创建FBO
    this._fbo = new THREE.WebGLRenderTarget(width, height, {
      type: THREE.UnsignedByteType,
      format: THREE.RGBAFormat,
      generateMipmaps: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
    });
    
    // 设置环境贴图映射
    this._fbo.texture.mapping = THREE.CubeUVReflectionMapping;
    
    // 创建混合材质
    this._material = new THREE.ShaderMaterial({
      uniforms: {
        uEnvmap1: { value: this.config.envmap1 },
        uEnvmap2: { value: this.config.envmap2 },
        uWeight: { value: 0 },
        uIntensity: { value: 1 },
      },
      
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vec3 p = position;
          gl_Position = vec4(p, 1.0);
          vUv = uv;
        }
      `,
      
      fragmentShader: `
        uniform sampler2D uEnvmap1;
        uniform sampler2D uEnvmap2;
        uniform float uWeight;
        uniform float uIntensity;
        
        varying vec2 vUv;
        
        void main() {
          vec2 uv = vUv;
          vec3 envmap1 = texture2D(uEnvmap1, uv).xyz;
          vec3 envmap2 = texture2D(uEnvmap2, uv).xyz;
          vec3 col = mix(envmap1, envmap2, uWeight) * uIntensity;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    
    // 创建全屏四边形
    const geometry = new THREE.PlaneGeometry(2, 2);
    this._quad = new THREE.Mesh(geometry, this._material);
    
    // 创建正交相机和场景
    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._scene = new THREE.Scene();
    this._scene.add(this._quad);
    
    console.log('✅ 动态环境系统初始化完成');
  }
  
  update(deltaTime: number, elapsedTime: number) {
    // 渲染到FBO
    const currentRenderTarget = this.experience.renderer.getRenderTarget();
    this.experience.renderer.setRenderTarget(this._fbo);
    this.experience.renderer.render(this._scene, this._camera);
    this.experience.renderer.setRenderTarget(currentRenderTarget);
  }
  
  get envmap(): THREE.Texture {
    return this._fbo.texture;
  }
  
  // 设置混合权重
  setWeight(value: number) {
    this._material.uniforms.uWeight.value = value;
  }
  
  // 设置强度
  setIntensity(value: number) {
    this._material.uniforms.uIntensity.value = value;
  }
  
  // 动画过渡权重
  lerpWeight(value: number, duration: number) {
    gsap.to(this._material.uniforms.uWeight, {
      value,
      duration,
      ease: "power2.out",
    });
  }
  
  dispose() {
    this._fbo.dispose();
    this._material.dispose();
    this._quad.geometry.dispose();
    console.log('🗑️ 动态环境系统已清理');
  }
}