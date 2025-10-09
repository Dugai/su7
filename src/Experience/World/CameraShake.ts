import * as THREE from "three";
import gsap from "gsap";
import type Experience from "../Experience";

export interface CameraShakeConfig {
  intensity: number;
}

export default class CameraShake {
  experience: Experience;
  intensity: number = 0;
  
  private _tweenedPosOffset!: THREE.Vector3;
  private _originalPosition!: THREE.Vector3;
  
  constructor(experience: Experience, config: Partial<CameraShakeConfig> = {}) {
    this.experience = experience;
    
    const { intensity = 1 } = config;
    this.intensity = intensity;
    
    
    
    this.init();
  }
  
  private init() {
    // 记录相机原始位置
    this._originalPosition = this.experience.camera.position.clone();
    
    // 创建缓动偏移向量
    this._tweenedPosOffset = new THREE.Vector3(0, 0, 0);
    
    
  }
  
  update(deltaTime: number, elapsedTime: number) {
    if (this.intensity <= 0) return;
    
    // 使用时间和随机数生成噪声偏移
    const t = elapsedTime;
    const posOffset = new THREE.Vector3(
      this.fbm({
        frequency: t * 0.5 + THREE.MathUtils.randFloat(-10000, 0),
        amplitude: 2,
      }),
      this.fbm({
        frequency: t * 0.5 + THREE.MathUtils.randFloat(-10000, 0),
        amplitude: 2,
      }),
      this.fbm({
        frequency: t * 0.5 + THREE.MathUtils.randFloat(-10000, 0),
        amplitude: 2,
      })
    );
    
    posOffset.multiplyScalar(0.1 * this.intensity);
    
    // 使用GSAP平滑过渡
    gsap.to(this._tweenedPosOffset, {
      x: posOffset.x,
      y: posOffset.y,
      z: posOffset.z,
      duration: 1.2,
      ease: "power2.out"
    });
    
    // 应用震动偏移
    this.experience.camera.position.add(this._tweenedPosOffset);
  }
  
  // 简化的分形布朗运动（FBM）
  private fbm(config: {
    octave?: number;
    frequency?: number;
    amplitude?: number;
    lacunarity?: number;
    persistance?: number;
  } = {}): number {
    const {
      octave = 3,
      frequency = 2,
      amplitude = 0.5,
      lacunarity = 2,
      persistance = 0.5,
    } = config;
    
    let value = 0;
    let freq = frequency;
    let amp = amplitude;
    
    for (let i = 0; i < octave; i++) {
      // 使用简化的噪声函数
      const noiseValue = this.noise2d(freq, freq);
      value += noiseValue * amp;
      freq *= lacunarity;
      amp *= persistance;
    }
    
    return value;
  }
  
  // 简化的2D噪声函数
  private noise2d(x: number, y: number): number {
    // 使用Math.sin和随机数生成伪噪声
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1; // 映射到-1到1范围
  }
  
  // 设置震动强度
  setIntensity(value: number) {
    this.intensity = value;
  }
  
  // 重置相机位置
  reset() {
    this.experience.camera.position.copy(this._originalPosition);
    this._tweenedPosOffset.set(0, 0, 0);
  }
  
  dispose() {
    // 重置相机位置
    this.reset();
    
    
  }
}