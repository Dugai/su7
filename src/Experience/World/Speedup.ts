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



    this.init();
  }

  private init() {
    // 添加模型到场景
    this.experience.scene.add(this.model.scene);

    // 扁平化模型层级
    this.flattenModel(this.model.scene);

    // 处理速度线材质
    this.handleModel();


  }

  private flattenModel(object: THREE.Object3D) {
    object.traverse((child) => {
      if (child.isMesh || child.isGroup) {
        this.modelParts.push(child);
      }
    });
  }

  private handleModel() {


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
  uniform vec3 iResolution;
  varying vec2 vUv;
  uniform float uSpeed;
  uniform float uOpacity;

  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  vec3 permute(vec3 x) {
      return mod(((x*34.0)+1.0)*x, 289.0);
  }

  float noise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      float i1 = (x0.x > x0.y) ? 1.0 : 0.0;
      vec2 i2 = vec2(1.0 - i1, i1);
      vec2 x1 = x0 - i2 + C.xx;
      vec2 x2 = x0 - 1.0 + 2.0 * C.xx;

      i = mod(i, 289.0);
      vec3 p = permute(permute(vec3(i.y, i.y, i.y) + vec3(0.0, i1, 1.0)) + vec3(i.x, i.x, i.x) + vec3(0.0, i1, 1.0));
      
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);
      m = m*m;
      m = m*m;

      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * vec2(x1.x, x2.x) + h.yz * vec2(x1.y, x2.y);
      return 130.0 * dot(m, g);
  }

  float saturate(float x) {
      return clamp(x, 0.0, 1.0);
  }

  float map(float value, float min1, float max1, float min2, float max2) {
      return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
  }

  vec3 pos2col(vec2 i){
      i += vec2(9., 0.);
      float r = random(i + vec2(12., 2.));
      float g = random(i + vec2(7., 5.));
      float b = random(i);
      return vec3(r,g,b);
  }

  vec3 colorNoise(vec2 uv){
      vec2 size = vec2(1.);
      vec2 pc = uv * size;
      vec2 base = floor(pc);
      
      vec3 v1 = pos2col((base + vec2(0.,0.))/size);
      vec3 v2 = pos2col((base + vec2(1.,0.))/size);
      vec3 v3 = pos2col((base + vec2(0.,1.))/size);
      vec3 v4 = pos2col((base + vec2(1.,1.))/size);
      
      vec2 f = fract(pc);
      f = smoothstep(0.,1.,f);
      
      vec3 px1 = mix(v1,v2,f.x);
      vec3 px2 = mix(v3,v4,f.x);
      return mix(px1,px2,f.y);
  }

  void main(){
      vec2 uv = vUv;
      vec3 col = vec3(1.);
      float mask = 1.;
      
      vec2 noiseUv = uv;
      noiseUv.x += -uTime * .5;
      float noiseValue = noise(noiseUv * vec2(3.,100.));
      mask = noiseValue;
      mask = map(mask,-1.,1.,0.,1.);
      mask = pow(saturate(mask-.1),11.);
      mask = smoothstep(0.,.04,mask);
      
      col = colorNoise(noiseUv * vec2(10.,100.));
      // ======================================
      // 只改了这一行！修复泛蓝，保留所有冲刺感
      // ======================================
      col *= vec3(1.5, 1.0, 3.2); 
      
      mask *= smoothstep(.02,.5,uv.x)*smoothstep(.02,.5,1.-uv.x);
      mask *= smoothstep(.01,.1,uv.y)*smoothstep(.01,.1,1.-uv.y);
      mask *= smoothstep(1.,10.,uSpeed);
      
      gl_FragColor = vec4(col, mask * uOpacity);
  }
`,

          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        });

        // 应用材质
        this.speedupMesh.material = this.material;


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

  }
}