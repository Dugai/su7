import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";

import type Experience from "./Experience";

export default class Postprocessing {
  experience: Experience;
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
  
  constructor(experience: Experience) {
    this.experience = experience;
    
    
    
    // 创建EffectComposer
    this.composer = new EffectComposer(this.experience.renderer);
    
    // 添加渲染通道
    const renderPass = new RenderPass(this.experience.scene, this.experience.camera);
    this.composer.addPass(renderPass);
    
    // 添加Bloom效果
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.experience.params.bloomIntensity, // 强度
      0.3, // 半径（减小，减少光晕扩散）
      0.9 // 阈值（提高，只有很亮的物体才发光）
    );
    
    // 设置Bloom参数，减少车身光晕
    this.bloomPass.threshold = 0.8; // 提高阈值，减少普通物体的光晕
    this.bloomPass.strength = this.experience.params.bloomIntensity * 0.6; // 降低强度
    this.bloomPass.radius = 0.3; // 减小半径
    
    this.composer.addPass(this.bloomPass);
    
    // 添加输出通道
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
    
    
  }
  
  render() {
    this.composer.render();
  }
  
  onResize() {
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }
  
  // 设置Bloom强度（对应原始代码中的setIntensity）
  setIntensity(value: number) {
    this.bloomPass.strength = value;
  }
  
  // 设置亮度平滑（对应原始代码中的setLuminanceSmoothing）
  setLuminanceSmoothing(value: number) {
    // UnrealBloomPass没有直接的luminanceSmoothing参数
    // 我们通过调整阈值来模拟类似效果
    this.bloomPass.threshold = Math.max(0, 1 - value);
  }
  
  dispose() {
    this.composer.dispose();
  }
}