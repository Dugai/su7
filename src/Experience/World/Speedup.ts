import * as THREE from "three";
import type Experience from "../Experience";

export default class Speedup {
  experience: Experience;
  model: any; // GLTF模型
  modelParts: THREE.Object3D[] = [];
  material: THREE.ShaderMaterial | null = null;
  speedupMesh: THREE.Mesh | null = null;
  
  constructor(experience: Experience, model: any) {
    this.experience = experience;
    this.model = model;
    
    console.log('💨 初始化速度线特效组件...');
    
    this.init();
  }
  
  private init() {
    // 添加模型到场景
    this.experience.scene.add(this.model.scene);
    
    // 扁平化模型层级
    this.flattenModel(this.model.scene);
    
    // 处理速度线材质
    this.handleModel();
    
    console.log(`✅ 速度线特效初始化完成，共 ${this.modelParts.length} 个部件`);
  }
  
  private flattenModel(object: THREE.Object3D) {
    object.traverse((child) => {
      if (child.isMesh || child.isGroup) {
        this.modelParts.push(child);
      }
    });
  }
  
  private handleModel() {
    console.log('🎨 创建速度线着色器材质...');
    
    // 寻找速度线网格
    if (this.modelParts.length > 1) {
      this.speedupMesh = this.modelParts[1] as THREE.Mesh;
      
      if (this.speedupMesh) {
        // 创建自定义着色器材质
        this.material = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uSpeed: { value: this.experience.params.speed },
            uOpacity: { value: this.experience.params.speedUpOpacity },
          },
          
          vertexShader: `
            varying vec2 vUv;
            
            void main() {
              vec3 p = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
              vUv = uv;
            }
          `,
          
          fragmentShader: `
            uniform float uTime;
            uniform float uSpeed;
            uniform float uOpacity;
            
            varying vec2 vUv;
            
            // 简化的噪声函数
            float random(vec2 st) {
              return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }
            
            float noise(vec2 st) {
              vec2 i = floor(st);
              vec2 f = fract(st);
              
              float a = random(i);
              float b = random(i + vec2(1.0, 0.0));
              float c = random(i + vec2(0.0, 1.0));
              float d = random(i + vec2(1.0, 1.0));
              
              vec2 u = f * f * (3.0 - 2.0 * f);
              
              return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            
            // 位置到颜色的映射
            vec3 pos2col(vec2 i) {
              i += vec2(9.0, 0.0);
              
              float r = random(i + vec2(12.0, 2.0));
              float g = random(i + vec2(7.0, 5.0));
              float b = random(i);
              
              return vec3(r, g, b);
            }
            
            // 彩色噪声
            vec3 colorNoise(vec2 uv) {
              vec2 size = vec2(1.0);
              vec2 pc = uv * size;
              vec2 base = floor(pc);
              
              vec3 v1 = pos2col((base + vec2(0.0, 0.0)) / size);
              vec3 v2 = pos2col((base + vec2(1.0, 0.0)) / size);
              vec3 v3 = pos2col((base + vec2(0.0, 1.0)) / size);
              vec3 v4 = pos2col((base + vec2(1.0, 1.0)) / size);
              
              vec2 f = fract(pc);
              f = smoothstep(0.0, 1.0, f);
              
              vec3 px1 = mix(v1, v2, f.x);
              vec3 px2 = mix(v3, v4, f.x);
              return mix(px1, px2, f.y);
            }
            
            void main() {
              vec2 uv = vUv;
              
              vec3 col = vec3(1.0);
              float mask = 1.0;
              
              // 噪声UV动画
              vec2 noiseUv = uv;
              noiseUv.x += -uTime * 0.5;
              
              // 生成噪声遮罩
              float noiseValue = noise(noiseUv * vec2(3.0, 100.0));
              mask = (noiseValue + 1.0) * 0.5; // 映射到0-1范围
              mask = pow(clamp(mask - 0.1, 0.0, 1.0), 11.0);
              mask = smoothstep(0.0, 0.04, mask);
              
              // 彩色噪声
              col = colorNoise(noiseUv * vec2(10.0, 100.0));
              col *= vec3(1.5, 1.0, 400.0);
              
              // 边缘渐变
              mask *= smoothstep(0.02, 0.5, uv.x) * smoothstep(0.02, 0.5, 1.0 - uv.x);
              mask *= smoothstep(0.01, 0.1, uv.y) * smoothstep(0.01, 0.1, 1.0 - uv.y);
              
              // 速度影响
              mask *= smoothstep(1.0, 10.0, uSpeed);
              
              gl_FragColor = vec4(col, mask * uOpacity);
            }
          `,
          
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        
        // 应用材质
        this.speedupMesh.material = this.material;
        
        console.log('✅ 速度线着色器材质创建完成');
      }
    }
  }
  
  update(deltaTime: number, elapsedTime: number) {
    if (this.material) {
      // 更新时间和速度
      this.material.uniforms.uTime.value = elapsedTime;
      this.material.uniforms.uSpeed.value = this.experience.params.speed;
      this.material.uniforms.uOpacity.value = this.experience.params.speedUpOpacity;
    }
  }
  
  // 设置透明度
  setOpacity(opacity: number) {
    if (this.material) {
      this.material.uniforms.uOpacity.value = opacity;
    }
  }
  
  // 设置速度
  setSpeed(speed: number) {
    if (this.material) {
      this.material.uniforms.uSpeed.value = speed;
    }
  }
  
  dispose() {
    // 从场景中移除
    if (this.model?.scene) {
      this.experience.scene.remove(this.model.scene);
    }
    
    // 清理材质
    if (this.material) {
      this.material.dispose();
    }
    
    // 清理几何体和其他材质
    this.modelParts.forEach((part) => {
      if (part.type === 'Mesh') {
        const mesh = part as THREE.Mesh;
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }
      }
    });
    
    console.log('🗑️ 速度线特效组件已清理');
  }
}